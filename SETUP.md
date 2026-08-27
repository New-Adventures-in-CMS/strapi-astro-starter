# Strapi 5 + Astro 7 — Riferimento tecnico

Stack testato e validato su un progetto reale. Questo documento è la reference tecnica: comandi, pattern, gotcha, variabili d'ambiente, MCP.

Per il **setup rapido** vedi il [README](README.md#quick-start). Per una **guida passo-passo spiegata** (con concetti e glossario) vedi [GUIDA.md](GUIDA.md).

---

## Stack

| Layer              | Versione                                                     | Porta |
| ------------------ | ------------------------------------------------------------ | ----- |
| Strapi 5 (CMS)     | 5.52.1                                                       | 1337  |
| Astro 7 (Frontend) | 7.2.6                                                        | 4321  |
| Tailwind CSS       | v4                                                           | —     |
| Starwind UI        | Prose, NavigationMenu, Sheet, Button, Card, Badge, Separator | —     |
| Markdown           | `marked` (via `@/lib/markdown` → `renderMarkdown`)           | —     |
| TypeScript         | ✓                                                            | —     |
| Database           | SQLite (dev) / PostgreSQL (prod)                             | —     |
| Node.js            | 22 LTS (22.x) — Node 23/24 non supportato da Strapi 5        | —     |

## Struttura repo

```
strapi-astro-starter/
├── cms/          # Strapi 5
└── frontend/     # Astro 7
```

## Layout di default

Il layout è composto da questi file:

| File                                   | Ruolo                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `frontend/src/config/site.ts`          | Nome sito, nav, footer — unico punto da modificare                         |
| `frontend/src/components/Header.astro` | NavigationMenu desktop (Trigger+Content submenu) · Sheet drawer mobile     |
| `frontend/src/components/Footer.astro` | Footer a colonne config-driven · Separator Starwind prima della riga legal |
| `frontend/src/components/SEO.astro`    | `<title>`, description, OG, Twitter                                        |
| `frontend/src/layouts/Layout.astro`    | Compone SEO + Header + slot + Footer                                       |
| `frontend/src/styles/global.css`       | Tailwind v4 + design token (`--color-brand-*`)                             |
| `frontend/src/styles/starwind.css`     | Tema CSS Starwind UI (variabili colore, dark mode) — generato da `init`    |
| `frontend/src/components/starwind/`    | Componenti Starwind — barrel export per cartella (es. `navigation-menu/`)  |

Per personalizzare: modifica solo `site.ts`. I componenti leggono da lì.

---

## UI layer — Starwind UI

L'interfaccia usa [Starwind UI](https://starwind.dev/docs) — componenti `.astro` nativi, Tailwind v4, interattività Runtime-driven (nessuna dipendenza React).

### Componenti installati

| Componente     | Cartella                    | Uso nel progetto                                             |
| -------------- | --------------------------- | ------------------------------------------------------------ |
| NavigationMenu | `starwind/navigation-menu/` | Nav desktop — Trigger+Content per sottomenu a 2 livelli      |
| Sheet          | `starwind/sheet/`           | Drawer mobile — hamburger apre pannello laterale             |
| Button         | `starwind/button/`          | Pulsanti e CTA                                               |
| Card           | `starwind/card/`            | Container card (Header, Title, Description, Content, Footer) |
| Badge          | `starwind/badge/`           | Etichette inline (tone × appearance)                         |
| Separator      | `starwind/separator/`       | Divisore orizzontale — usato in Footer                       |
| Prose          | `starwind/prose/`           | Wrapper tipografia per contenuto CMS (markdown, rich text)   |

Tutti i componenti vivono in `frontend/src/components/starwind/<nome>/` con barrel `index.ts`. Dropdown non è installato — NavigationMenu gestisce i sottomenu nativamente.

### Import pattern

```ts
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/starwind/navigation-menu";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/starwind/sheet";
```

### Aggiungere un componente

```bash
cd frontend
npx starwind@latest add <nome-componente>
```

Lista componenti disponibili: [starwind.dev/docs/components](https://starwind.dev/docs/components).

### Aggiornare i componenti installati

```bash
cd frontend
npx starwind@latest update
```

Sostituisce i file in `src/components/starwind/` con la versione più recente. Commit prima di aggiornare.

### Test keyboard accessibility (e2e)

```bash
cd frontend
npx playwright install chromium   # una tantum, ~150 MB
npm run test:e2e
```

Suite Playwright per regressione accessibilità da tastiera: verifica apertura/chiusura del sottomenu NavigationMenu (Enter, Space, ArrowDown, Escape + focus-return) e del drawer Sheet mobile (apertura, focus trap, Escape + focus-return). Gira senza Strapi — usa il fallback `site.nav`.

### Running tests

Dalla root:

```bash
npm test          # vitest (unit) — no prereq
npm run test:e2e  # playwright (e2e) — richiede `npx playwright install chromium` una tantum
```

### Come Header e Footer consumano menu-item

`frontend/src/lib/navigation.ts` è l'unico punto di fetch — Header e Footer importano direttamente:

- `getHeaderNav()` → `NavItem[]` albero a 2 livelli (NavigationMenu desktop + Sheet mobile)
- `getFooterNav()` → `{ columns: { title, items }[] }` per le colonne footer

---

## Content-type Page

Il boilerplate include route SSR `/pagine` e `/pagine/[slug]` che leggono da un content-type `page` in Strapi.

**Campi richiesti:**

| Campo      | Tipo                | Note                                  |
| ---------- | ------------------- | ------------------------------------- |
| `title`    | Short text          | required                              |
| `slug`     | UID (target: title) | required                              |
| `body`     | Rich text           | corpo pagina (Markdown)               |
| `seo_desc` | Long text           | usato per `<meta name="description">` |
| `blocks`   | Dynamic zone        | page builder (vedi sotto)             |

**Permessi:** Settings → Users & Permissions → Public → `page` → abilita `find` e `findOne`.

**Nota:** per la home, crea una entry con slug `home`. Sul primo avvio il seed
crea automaticamente `home` e `about` con contenuti demo che usano i blocchi.

---

## Page blocks (Dynamic Zone)

Il content-type `page` espone una Dynamic Zone `blocks` con quattro componenti
riutilizzabili (namespace `blocks.*`, più `shared.card` come sotto-componente
di `card-grid`).

| Componente   | UID                 | Attributi                                                         |
| ------------ | ------------------- | ----------------------------------------------------------------- |
| Hero         | `blocks.hero`       | heading (req), subheading, cta_text, cta_url, image               |
| Rich Text    | `blocks.rich-text`  | body (Markdown, req)                                              |
| Image + Text | `blocks.image-text` | heading, body (Markdown, req), image, image_position (left/right) |
| Card Grid    | `blocks.card-grid`  | heading, cards (repeatable `shared.card`)                         |
| Card (sub)   | `shared.card`       | title (req), description, image, link_url, link_text              |

**Rendering (Astro):**

- Renderer dispatcher: `frontend/src/components/blocks/BlockRenderer.astro`
- Un componente per block: `BlockHero.astro`, `BlockRichText.astro`,
  `BlockImageText.astro`, `BlockCardGrid.astro`
- Tipi: `frontend/src/types/index.ts` (`PageBlock` union)
- Populate deep sempre in fetch (block image + card image):
  ```ts
  populate: {
    blocks: {
      populate: { image: true, cards: { populate: { image: true } } },
    },
  }
  ```

**Priorità di rendering:** i blocchi si renderizzano per primi; il campo
`body` Markdown, se presente, viene renderizzato sotto come `<article>` di
fallback.

**Aggiungere un nuovo block:**

1. Crea `cms/src/components/blocks/<name>.json`
2. Aggiungilo all'array `components` in `cms/src/api/page/content-types/page/schema.json`
3. Riavvia Strapi
4. Aggiungi il tipo in `frontend/src/types/index.ts` (interfaccia + union `PageBlock`)
5. Crea `frontend/src/components/blocks/Block<Name>.astro`
6. Aggiungi un `case` in `BlockRenderer.astro`

---

## Seed demo (bootstrap)

Il file `cms/src/index.ts` esegue un seed idempotente al primo avvio se il DB
non contiene ancora pagine pubblicate:

- Pages: `home` (hero + card grid + rich text), `about` (image+text + rich text),
  `services` e `contacts` (skeleton per i menu-item)
- Menu items: header (`Home`, `Chi siamo`, `Servizi` con figli, `Contatti`,
  `Documentazione`) e footer (`Privacy`, `Termini`)

Per ricreare il contenuto demo: ferma Strapi, `rm cms/.tmp/data.db`, riavvia.

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
| `npm run setup`       | (Opzionale) Genera `cms/.env` (secrets automatici) + `frontend/.env`     |
| `npm run dev`         | Avvia CMS e frontend in parallelo (libera porte 1337/4321 in automatico) |
| `npm run build`       | Build produzione di CMS e frontend                                       |

> `npm run setup` è opzionale: dalla prima esecuzione di `npm run dev` gli `.env` vengono generati automaticamente se mancanti (`scripts/ensure-env.js`). Se `.env` esistono già non vengono mai sovrascritti.

> `npm run dev` esegue automaticamente `scripts/ensure-env.js` e `scripts/free-ports.js` prima di partire: genera env mancanti, poi termina eventuali processi in ascolto su 1337 e 4321. Nessuna dipendenza esterna — funziona subito dopo il clone.

---

## Prima configurazione admin

Al primo avvio Strapi costruisce l'interfaccia (1-2 min). Poi:

- **Settings → API Tokens** — crea token `Full access` / `Unlimited`, copialo in `frontend/.env` come `STRAPI_API_TOKEN`, riavvia il frontend
- **Settings → Users & Permissions → Roles → Public** — i permessi base vengono configurati automaticamente dal bootstrap (`cms/src/index.ts`); aggiungi manualmente eventuali collection extra
- **Content Manager → Voce di Menu** — al primo avvio il bootstrap crea 9 voci di esempio; puoi modificarle o aggiungerne di nuove

---

## Plugin CMS inclusi

| Plugin                                  | Stato                 | Funzione                                                                                   |
| --------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
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

## Content-type Menu Item

La navigazione è gestita tramite il content-type nativo `menu-item` (UID: `api::menu-item.menu-item`). Nessun plugin esterno — dati in SQLite/Postgres come ogni altra collection.

### Schema campi

| Campo          | Tipo        | Note                                                                 |
| -------------- | ----------- | -------------------------------------------------------------------- |
| `label`        | string      | required — testo visibile nel menu                                   |
| `page`         | relation    | manyToOne → `api::page.page`; se valorizzato determina l'href        |
| `externalUrl`  | string      | URL libero (relativo o assoluto); priorità su `page`                 |
| `area`         | enumeration | `header` \| `footer` \| `both`; required, default `header`           |
| `footerColumn` | enumeration | `Prodotto` \| `Azienda` \| `Supporto` \| `Legale`; null = no footer  |
| `parent`       | relation    | manyToOne → `api::menu-item.menu-item` (self-referencing, 2 livelli) |
| `order`        | integer     | ordinamento crescente; default 0                                     |

`draftAndPublish: true` — le voci devono essere **published** per apparire nel frontend.

### Risoluzione href

Priorità (primo valorizzato vince):

1. `externalUrl` — usato as-is; se inizia con `https?://` → `external: true`
2. `page.slug` — trasformato in `/${slug}` (eccetto `home` → `/`)
3. fallback `#`

### Header vs Footer

`getHeaderNav()` — voci con `area === "header"` o `"both"`, albero a 2 livelli (padre/figli via `parent.documentId`), ordinate per `order`.

`getFooterNav()` — voci con `area === "footer"` o `"both"` **e** `footerColumn` valorizzato, raggruppate per colonna nell'ordine canonico:

```ts
export const FOOTER_COLUMNS = [
  "Prodotto",
  "Azienda",
  "Supporto",
  "Legale",
] as const;
```

Colonne senza voci vengono omesse. Un item con `area === "both"` e `footerColumn` valorizzato appare sia in header che in footer.

### Implementazione frontend

`frontend/src/lib/navigation.ts` centralizza fetch e fallback:

```ts
import { strapiFind } from "@/lib/strapi";

// Header nav — albero NavItem[]
const navItems = await getHeaderNav();

// Footer nav — { columns: { title, items }[] }
const footer = await getFooterNav();
```

Parametri fetch: `populate: ["page", "parent"]`, `pagination: { pageSize: 200 }`.

### Fallback

Entrambe le funzioni tornano al contenuto statico di `site.ts` se:

- `strapiFind` lancia eccezione (CMS spento, rete)
- `data` è vuoto
- nessuna voce soddisfa i filtri di area/footerColumn

`getHeaderNav()` → `site.nav`; `getFooterNav()` → `site.footer.columns`.

### Bootstrap seed

Al primo avvio `cms/src/index.ts → bootstrap` crea 9 voci published se la collection è vuota:

| Voce           | Area   | footerColumn | Parent  |
| -------------- | ------ | ------------ | ------- |
| Home           | both   | —            | —       |
| Chi siamo      | header | —            | —       |
| Servizi        | header | —            | —       |
| Contatti       | both   | —            | —       |
| Documentazione | header | —            | —       |
| Servizio A     | header | —            | Servizi |
| Servizio B     | header | —            | Servizi |
| Privacy        | footer | Legale       | —       |
| Termini        | footer | Legale       | —       |

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

### Environment variables — modello `astro:env` (Astro 7)

Le variabili di connessione a Strapi usano `astro:env` (introdotto in Astro 5, obbligatorio da v6+):

- Schema definito in `frontend/astro.config.mjs` → sezione `env.schema`
- `STRAPI_URL` e `STRAPI_API_TOKEN`: `context:"server", access:"secret"` — letti a **runtime**, mai inlinati nel bundle SSR. Cambiarli e riavviare il server senza rebuild ha effetto immediato.
- `PUBLIC_STRAPI_URL`: `context:"client", access:"public"` — inlinato al build (corretto per codice browser). Serve al form dinamico per chiamare Strapi direttamente dal browser.

Import nel codice:

```ts
// Lato server (astro files frontmatter, src/lib/*.ts)
import { STRAPI_URL, STRAPI_API_TOKEN } from "astro:env/server";

// Lato client (script block in .astro, .ts client-side)
import { PUBLIC_STRAPI_URL } from "astro:env/client";
```

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
