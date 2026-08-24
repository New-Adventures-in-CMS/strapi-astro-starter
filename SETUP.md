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

## Pattern Navigazione

Menu gestito da `strapi-plugin-navigation`.

```astro
async function fetchNav(slug: string) {
  const STRAPI_URL = import.meta.env.STRAPI_URL ?? "http://localhost:1337";
  try {
    const res = await fetch(`${STRAPI_URL}/api/navigation/render/${slug}?type=TREE`);
    return res.ok ? await res.json() : [];
  } catch { return []; }
}
const nav = await fetchNav("main");
```

**Non usare** `strapiFind` per la navigazione — l'endpoint è del plugin, non CRUD.

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
