# Strapi 5 + Astro 5 — Starter Kit

Stack testato e validato su un progetto reale. Pronto per sviluppare nuovi siti.

---

## Stack

| Layer              | Versione                         | Porta |
| ------------------ | -------------------------------- | ----- |
| Strapi 5 (CMS)     | 5.50.1                           | 1337  |
| Astro 5 (Frontend) | 5.18.2                           | 4321  |
| Tailwind CSS       | v4                               | —     |
| Database           | SQLite (dev) / PostgreSQL (prod) | —     |
| Node.js            | ≥ 20                             | —     |

---

## Struttura repo

```
strapi-astro-starter/
├── cms/          # Strapi 5
└── frontend/     # Astro 5
```

---

## Setup CMS

### 1. Installa dipendenze

```bash
cd cms
npm install
```

### 2. Crea `.env`

```bash
cp .env.example .env
```

Ora genera i secrets uno alla volta. Ogni comando stampa un valore casuale — copialo e incollalo nella variabile corrispondente nel file `.env`.

**APP_KEYS** — servono 4 valori separati da virgola. Esegui 4 volte:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Nel `.env` il risultato è una lista: `APP_KEYS=valore1,valore2,valore3,valore4`

**API_TOKEN_SALT** — esegui una volta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**ADMIN_JWT_SECRET** — esegui una volta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**TRANSFER_TOKEN_SALT** — esegui una volta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**ENCRYPTION_KEY** — formato diverso (hex, 16 byte):

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Il `.env` compilato deve avere tutte le variabili valorizzate:

```env
APP_KEYS=abc123==,def456==,ghi789==,jkl012==
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
ENCRYPTION_KEY=...
```

### 3. Avvia

```bash
npm run develop
```

Admin disponibile su `http://localhost:1337/admin`.

### 4. Prima configurazione admin

Al primo avvio crea utente admin. Poi:

- **Settings → API Tokens** — crea token con tipo `Full access`, copialo nel `.env` del frontend come `STRAPI_API_TOKEN`
- **Settings → Users & Permissions → Roles → Public** — abilita permessi necessari:
  - `form-submission`: `submit` (custom route)
  - `form`: `find`, `findOne`
  - Qualsiasi altra collection che il frontend deve leggere pubblicamente
- **Navigation plugin** — crea le voci di menu (slug: `main`)

---

## Setup Frontend

### 1. Installa dipendenze

```bash
cd frontend
npm install
```

### 2. Crea `.env`

```bash
cp .env.example .env
```

Incolla l'API token generato nel CMS.

### 3. Avvia

```bash
npm run dev
```

Frontend disponibile su `http://localhost:4321`.

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

## Sistema Form Dinamici

Il boilerplate include un sistema form headless completo.

### Come funziona

1. In Strapi Admin → **Form** → crea nuova entry
2. Imposta `slug` (es. `contatti`)
3. Aggiungi campi dalla dynamic zone `campi`
4. In Astro: `<DynamicForm slug="contatti" />`

Il submit va a `POST /api/form-submissions/submit` (endpoint pubblico, no auth).

### Tipi di campo disponibili

| Tipo             | Descrizione              |
| ---------------- | ------------------------ |
| `campo-testo`    | Input testo singola riga |
| `campo-email`    | Input email              |
| `campo-textarea` | Area testo multiriga     |
| `campo-select`   | Menu a tendina           |
| `campo-checkbox` | Casella di spunta        |

Ogni campo ha `larghezza`: `full` (100%), `half` (50%), `third` (33%).

### Email notifica

Se il form ha `emailDestinatario` configurato, Strapi invia email notifica al submit. Richiede SMTP configurato nel `.env` del CMS.

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

---

## Gotcha noti

| Problema                                                          | Causa                                                         | Fix                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `env('X', default)` restituisce `''`                              | Variabile presente ma vuota nel `.env`                        | Usa `env('X') \|\| 'default'` oppure rimuovi la variabile dal `.env` |
| Template literal dentro JSX Astro                                 | `Record<T, K>` viene letto come JSX tag                       | Sposta type annotation nel frontmatter                               |
| `TypeError: Cannot read properties of undefined (reading 'kind')` | Spread di `createCoreRouter().routes` dentro oggetto `routes` | Due file separati nella cartella `routes/`                           |
| Warning `No adapter installed`                                    | `output: "server"` senza adapter                              | `@astrojs/node` già incluso nel boilerplate                          |
