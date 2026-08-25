# Strapi 5 + Astro 5 — Riferimento tecnico

Stack testato e validato su un progetto reale. Questo documento è la reference tecnica: comandi, pattern, gotcha, variabili d'ambiente, MCP.

Per il **setup rapido** vedi il [README](README.md#quick-start). Per una **guida passo-passo spiegata** (con concetti e glossario) vedi [GUIDA.md](GUIDA.md).

---

## Stack

| Layer              | Versione                         | Porta |
| ------------------ | -------------------------------- | ----- |
| Strapi 5 (CMS)     | 5.52.1                           | 1337  |
| Astro 5 (Frontend) | 5.18.2                           | 4321  |
| Tailwind CSS       | v4                               | —     |
| TypeScript         | ✓                                | —     |
| Database           | SQLite (dev) / PostgreSQL (prod) | —     |
| Node.js            | ≥ 20                             | —     |

## Struttura repo

```
strapi-astro-starter/
├── cms/          # Strapi 5
└── frontend/     # Astro 5
```

## Layout di default

Il layout è composto da questi file:

| File                                   | Ruolo                                              |
| -------------------------------------- | -------------------------------------------------- |
| `frontend/src/config/site.ts`          | Nome sito, nav, footer — unico punto da modificare |
| `frontend/src/components/Header.astro` | Nav con active state + hamburger mobile            |
| `frontend/src/components/Footer.astro` | Footer a colonne config-driven                     |
| `frontend/src/components/SEO.astro`    | `<title>`, description, OG, Twitter                |
| `frontend/src/layouts/Layout.astro`    | Compone SEO + Header + slot + Footer               |
| `frontend/src/styles/global.css`       | Tailwind v4 + design token (`--color-brand-*`)     |

Per personalizzare: modifica solo `site.ts`. I componenti leggono da lì.

---

## Content-type Page

Il boilerplate include route SSR `/pagine` e `/pagine/[slug]` che leggono da un content-type `page` in Strapi.

**Campi richiesti:**

| Campo      | Tipo                | Note                                  |
| ---------- | ------------------- | ------------------------------------- |
| `title`    | Short text          | required                              |
| `slug`     | UID (target: title) | required                              |
| `body`     | Rich text           | corpo pagina                          |
| `seo_desc` | Long text           | usato per `<meta name="description">` |

**Permessi:** Settings → Users & Permissions → Public → `page` → abilita `find` e `findOne`.

**Nota:** per la home, crea una entry con slug `home`.

---

## i18n (predisposto)

Il multilingua è **predisposto ma non attivo**. Il file `frontend/src/config/i18n.ts` definisce `defaultLocale: "it"` e `locales: ["it"]`.

Per attivare il multilingua:

1. Aggiungi lingue in `i18n.ts`: `locales: ["it", "en"] as const`
2. Attiva la config `i18n` in `astro.config.mjs`:
   ```js
   i18n: {
     defaultLocale: "it",
     locales: ["it", "en"],
   }
   ```
3. Crea routing localizzato: sposta le pagine in `src/pages/[lang]/`
4. Abilita i18n in Strapi: Settings → Internationalization → aggiungi locale

Questo è marcato come **estensione** — non incluso nel boilerplate base.

---

## Estensioni possibili

Non incluse nel boilerplate, documentate qui come punto di partenza:

- **Nav dinamica** — usa `strapi-plugin-navigation` per gestire il menu da Strapi admin
- **Dynamic zone** — aggiungi un campo `blocchi` al content-type `page` per un page builder
- **Preview / draft mode** — Strapi 5 supporta il draft mode via API con token dedicato
- **Immagini ottimizzate** — usa il componente `<Image />` di Astro con `strapiMediaUrl()`
- **Sitemap dinamica** — aggiungi `customPages` in `astro.config.mjs` per includere le pagine Strapi
- **i18n attivo** — vedi sezione "i18n (predisposto)" sopra

---

## Script disponibili (dalla root)

| Comando               | Cosa fa                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| `npm run install:all` | Installa dipendenze root + CMS + frontend                                |
| `npm run setup`       | Genera `cms/.env` (secrets automatici) + `frontend/.env`                 |
| `npm run dev`         | Avvia CMS e frontend in parallelo (libera porte 1337/4321 in automatico) |
| `npm run build`       | Build produzione di CMS e frontend                                       |

> Se `.env` esiste già, `npm run setup` si ferma con errore — cancellalo prima di rigenerare.

> `npm run dev` esegue automaticamente `scripts/free-ports.js` prima di partire: termina eventuali processi in ascolto su 1337 e 4321. Nessuna dipendenza esterna — funziona subito dopo il clone.

---

## Prima configurazione admin

Al primo avvio Strapi costruisce l'interfaccia (1-2 min). Poi:

- **Settings → API Tokens** — crea token `Full access` / `Unlimited`, copialo in `frontend/.env` come `STRAPI_API_TOKEN`, riavvia il frontend
- **Settings → Users & Permissions → Roles → Public** — i permessi base vengono configurati automaticamente dal bootstrap (`cms/src/index.ts`); aggiungi manualmente eventuali collection extra
- **Navigation plugin** — crea le voci di menu con slug `main`

---

## Plugin CMS inclusi

| Plugin                                  | Stato                 | Funzione                                                                                   |
| --------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `strapi-plugin-navigation`              | installato            | Gestione menu — endpoint `GET /api/navigation/render/{slug}?type=TREE`                     |
| `@devxcommerce/strapi-plugin-cm-groups` | installato            | Raggruppa collection nell'admin sidebar                                                    |
| `strapi-plugin-sortable-entries`        | installato            | Drag-and-drop ordinamento nelle liste                                                      |
| `@strapi/provider-email-nodemailer`     | installato            | Email via SMTP                                                                             |
| `@strapi/plugin-seo`                    | installato            | Campi SEO (meta title, description, og image) su qualsiasi collection                      |
| `@strapi/plugin-i18n`                   | bundled, disabilitato | Internazionalizzazione multi-lingua — abilitare subito se serve, difficile aggiungere dopo |

### Abilitare i18n

Decommentare in `cms/config/plugins.ts`:

```ts
i18n: { enabled: true },
```

Poi in ogni collection che deve supportare più lingue: Content-Type Builder → seleziona collection → Advanced Settings → spunta **Enable localization**.

### Usare SEO in una collection

Content-Type Builder → seleziona collection → Add another field → **Component** → cerca `shared.seo`. Il plugin aggiunge automaticamente i campi meta alla collection.

---

## Server MCP (AI agents)

Strapi 5.47+ include un server MCP nativo. Permette a Claude Code, Cursor, Windsurf e altri client MCP di leggere, creare, aggiornare e pubblicare contenuti via linguaggio naturale, senza aprire il pannello admin.

### Abilitazione

Già gestita via `STRAPI_MCP_ENABLED` in `cms/.env` (attivo per default in dev, generato da `npm run setup`). In produzione impostarlo a `false` salvo necessità esplicita.

Endpoint: `POST http://localhost:1337/mcp` (stateless, autenticato a ogni richiesta).

### Creare l'Admin token (passo manuale, una tantum, per-utente)

1. Avvia lo starter, crea l'account admin.
2. **Settings → Administration Panel → Admin Tokens → Create new Admin Token**.
3. Nome (es. `claude-code`), durata a scelta, permessi minimi necessari (principio least privilege: concedi solo i content type e le azioni che servono).
4. Copia la chiave — **viene mostrata una sola volta**.

### Collegare Claude Code

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Riavvia Claude Code → `/mcp` → `strapi-mcp` deve risultare connesso.

> **Sicurezza:** l'Admin token è una credenziale — non committarlo, non metterlo in file versionati, non esporlo lato client. Non condividere l'URL `/mcp` pubblicamente.

### Limiti noti

| Limite            | Dettaglio                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Dynamic Zone      | Passate come array non tipizzati — struttura interna dei blocchi non descritta agli agent |
| Upload media      | Non supportato via MCP — si possono solo referenziare asset già esistenti                 |
| Populate annidato | Non disponibile in `list`/`get` — per editing blocchi pagina preferire il pannello admin  |

---

## Sistema Form Dinamici

Il boilerplate include un sistema form headless completo. Per il flusso lato editor (creare un form da Strapi) vedi [GUIDA.md](GUIDA.md#il-sistema-form-dinamici). Qui la reference tecnica.

- Submit → `POST /api/form-submissions/submit` (endpoint pubblico, no auth)
- Uso in Astro → `<DynamicForm slug="contatti" />` (lo slug deve corrispondere a quello in Strapi)

### Tipi di campo disponibili

| Tipo             | Descrizione              |
| ---------------- | ------------------------ |
| `campo-testo`    | Input testo singola riga |
| `campo-email`    | Input email              |
| `campo-textarea` | Area testo multiriga     |
| `campo-select`   | Menu a tendina           |
| `campo-checkbox` | Casella di spunta        |

Ogni campo ha `larghezza`: `full` (100%), `half` (50%), `third` (33%).

Se il form ha `emailDestinatario` configurato, Strapi invia email notifica al submit (richiede SMTP nel `.env` del CMS).

---

## Navigazione dinamica

**Modello unificato:** una sola navigazione `main` in Strapi; header e footer sono due viste filtrate di essa tramite campi custom per voce.

### Campi custom per voce

| Campo          | Tipo    | Effetto                                                        |
| -------------- | ------- | -------------------------------------------------------------- |
| `showInHeader` | boolean | `true` → la voce appare nell'header                            |
| `footerColumn` | select  | Se valorizzato, la voce appare nel footer nella colonna scelta |

Valori `footerColumn`: `Prodotto`, `Azienda`, `Supporto`, `Legale`.

Una voce può avere entrambi attivi: appare in header E footer.

> ⚠️ I valori di `footerColumn` sono definiti in due posti che devono coincidere:
> `cms/config/plugins.ts` (opzioni del select) e `frontend/src/lib/navigation.ts` (`FOOTER_COLUMNS`).
> Se aggiungi una colonna, aggiornala in entrambi.

### Primo avvio

Sequenza automatica al primo `npm run develop`:

1. **Permessi Public** — configurati dal bootstrap (7 permessi, incluse render navigation)
2. **Pagine seed** — Home, Chi siamo, Servizi, Contatti create come published
3. **Custom fields scritti nel DB** — `footerColumn` e `showInHeader` materializzati nel plugin store (`ensureNavigationCustomFields`)
4. **Nav `main` seedata** — creata con 4 voci INTERNAL collegate alle pagine seed (`seedNavigation`)

**Passo manuale richiesto (una-tantum):** in **Settings → Navigation**, sezione **"Custom fields settings"**, abilita i toggle per `footerColumn` e `showInHeader`. Il bootstrap li scrive nel DB ma il plugin richiede l'abilitazione manuale per campo prima che compaiano nell'editor delle voci.

> ⚠️ Finché i custom fields non sono abilitati e le voci non hanno `showInHeader: true`, l'header mostra una lista vuota (non il fallback statico di `site.ts`, poiché la nav `main` esiste). Il footer usa il fallback statico finché nessuna voce ha `footerColumn` valorizzato.

**Se i campi non compaiono sulle voci** (es. `ensureNavigationCustomFields` ha fallito): vai in **Settings → Navigation → Restore configuration**. Una-tantum.

Relazione file ↔ DB: `plugins.ts` è la fonte di verità; "Restore configuration" materializza quella config nel DB del plugin.

### Implementazione

Endpoint del plugin: `GET /api/navigation/render/{slug}?type=TREE`

`frontend/src/lib/navigation.ts` centralizza fetch, normalizzazione e fallback:

```ts
// Header: voci con showInHeader === true, ordinate per order
const navItems = await getHeaderNav(); // NavItem[]

// Footer: FooterData = { columns: { title, items }[] }, raggruppate per footerColumn
const footer = await getFooterNav();
```

Slug configurato in `frontend/src/config/site.ts → site.navigation.mainSlug` (default: `"main"`).

**Non usare** `strapiFind` per la navigazione — l'endpoint è del plugin, non CRUD.

### Forma dati del plugin

```json
[
  {
    "title": "Home",
    "menuAttached": true,
    "order": 1,
    "path": "/",
    "type": "INTERNAL",
    "items": [],
    "additionalFields": {
      "showInHeader": true,
      "footerColumn": null
    }
  }
]
```

Tipi di voce:

- `INTERNAL` — collegata a una Page; `path` reale (es. `/about`)
- `EXTERNAL` — URL libero; `external: true` nel NavItem normalizzato
- `WRAPPER` — voce padre senza href; scartata se non ha figli con `menuAttached: true`

Solo le voci con `menuAttached: true` vengono normalizzate.

### Normalizzazione e fallback

`fetchNavigation(slug)` ritorna `NavItem[] | null`. Ritorna `null` su:

- risposta non ok (403, 500, qualsiasi status non-2xx)
- risposta non-array o array vuoto
- errore di rete / CMS spento

`getHeaderNav()` → filtra per `showInHeader === true`; fallback a `site.nav` solo se nav irraggiungibile.

`getFooterNav()` → raggruppa per `footerColumn` nell'ordine `FOOTER_COLUMNS`; fallback a `site.footer.columns` se nav irraggiungibile o nessuna voce ha `footerColumn`.

Ordine colonne footer: `Prodotto → Azienda → Supporto → Legale` (colonne vuote omesse).

### Content-type `page`

Schema: `cms/src/api/page/content-types/page/schema.json`

| Campo    | Tipo     | Note               |
| -------- | -------- | ------------------ |
| title    | string   | required           |
| slug     | uid      | targetField: title |
| body     | richtext | opzionale          |
| seo_desc | text     | opzionale          |

`draftAndPublish: true`. Permessi Public (`find`, `findOne`) abilitati dal bootstrap.

### Bootstrap seed

Al primo avvio, `cms/src/index.ts → bootstrap` crea 4 pagine pubblicate se non ne esistono: Home (`home`), Chi siamo (`about`), Servizi (`services`), Contatti (`contacts`).

### Config plugin (cms/config/plugins.ts)

```ts
navigation: {
  enabled: true,
  config: {
    contentTypes: ["api::page.page"],
    defaultContentTypes: "api::page.page",
    contentTypesNameFields: { "api::page.page": ["title"] },
    pathDefaultFields: { "api::page.page": ["slug"] },
    allowedLevels: 2,
    additionalFields: [
      {
        type: "select",
        name: "footerColumn",
        label: "Colonna footer",
        multi: false,
        options: ["Prodotto", "Azienda", "Supporto", "Legale"],
        required: false,
      },
      {
        type: "boolean",
        name: "showInHeader",
        label: "Mostra nell'header",
        required: false,
      },
    ],
  },
},
```

### Migrazione dati

Se avevi già una navigazione `footer` separata:

1. Eliminare la navigazione `footer` (non più usata).
2. Spostare le voci footer nella nav `main`, impostando `footerColumn` e `showInHeader: false`.
3. Voci solo header: `showInHeader: true`, `footerColumn` vuoto.
4. Voci in entrambi: `showInHeader: true` + `footerColumn` valorizzato.

### Gotcha

Senza `page` configurato come `contentType` navigabile, l'editor mostra solo **WRAPPER** ed **EXTERNAL** — la voce **INTERNAL** non appare.

---

## Pattern Route Strapi 5

Due file separati in `routes/` — non fare spread di `createCoreRouter().routes` in un oggetto `{ routes: [] }` (TypeError a runtime).

```
src/api/[collection]/routes/
  [collection].ts   ← export default factories.createCoreRouter("api::...")
  custom.ts         ← export default { routes: [...] }
```

---

## Variabili d'ambiente

Per la spiegazione di _cosa sono_ e _perché servono_ le env vars vedi [GUIDA.md](GUIDA.md#variabili-dambiente--spiegazione). Qui i valori di riferimento.

### CMS (`cms/.env`)

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
ENCRYPTION_KEY=

# Database (default SQLite in dev)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# SMTP (opzionale, per email notifiche form)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@example.com

# Preview (opzionale)
CLIENT_URL=http://localhost:4321
PREVIEW_SECRET=change-me
```

### Frontend (`frontend/.env`)

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=
PUBLIC_STRAPI_URL=http://localhost:1337
```

`PUBLIC_STRAPI_URL` serve per DynamicForm — fetch lato client (browser), richiede prefisso `PUBLIC_`.

---

## Aggiungere una nuova collection

### CMS

1. Strapi Admin → Content-Type Builder → Create new collection type
2. Aggiungi campi
3. Salva — Strapi riavvia automaticamente e genera il codice

### Frontend

Aggiungi il tipo in `src/types/index.ts`:

```ts
export interface MioContenuto {
  id: number;
  documentId: string;
  titolo: string;
  // ... altri campi
}
```

Usa nelle pagine:

```astro
import { strapiFind } from "@/lib/strapi";
import type { MioContenuto } from "@/types";

const res = await strapiFind<MioContenuto>("mio-contenutos");
const items = res.data;
```

---

## Build Produzione

### Frontend

```bash
cd frontend
npm run build
node dist/server/entry.mjs
```

L'adapter `@astrojs/node` in modalità `standalone` genera un server Node.js autonomo.

### CMS

```bash
cd cms
npm run build
npm run start
```

### Env variabili prod

- Usa PostgreSQL (`DATABASE_CLIENT=postgres`)
- Configura SMTP reale
- Imposta `CLIENT_URL` con dominio reale
- Usa secrets forti (non i valori di dev)
- Metti un reverse proxy (es. Nginx) davanti ai due server

---

## Gotcha noti

| Problema                                                          | Causa                                                                                                                                                             | Fix                                                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env('X', default)` restituisce `''`                              | Variabile presente ma vuota nel `.env`                                                                                                                            | Usa `env('X') \|\| 'default'` oppure rimuovi la variabile dal `.env`                                                                                                                    |
| Template literal dentro JSX Astro                                 | `Record<T, K>` viene letto come JSX tag                                                                                                                           | Sposta type annotation nel frontmatter                                                                                                                                                  |
| `TypeError: Cannot read properties of undefined (reading 'kind')` | Spread di `createCoreRouter().routes` dentro oggetto `routes`                                                                                                     | Due file separati nella cartella `routes/`                                                                                                                                              |
| Warning `No adapter installed`                                    | `output: "server"` senza adapter                                                                                                                                  | `@astrojs/node` già incluso nel boilerplate                                                                                                                                             |
| `npx @strapi/upgrade minor` → E404 su `@strapi/plugin-seo`        | Il tool tratta tutti i pacchetti `@strapi/*` come core e tenta di portarli alla versione Strapi (es. 5.52.1), ma `@strapi/plugin-seo` esiste solo su versione 2.x | **Prima** di eseguire `@strapi/upgrade`: rimuovi il `^` da `@strapi/plugin-seo` in `cms/package.json` (es. `"2.0.9"` anziché `"^2.0.9"`). Il tool salta i pacchetti già pinnati esatti. |
