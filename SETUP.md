# Strapi 5 + Astro 5 — Starter Kit

Stack testato e validato su un progetto reale. Pronto per sviluppare nuovi siti.

---

## Quick Start

```bash
git clone https://github.com/New-Adventures-in-CMS/strapi-astro-starter.git nome-progetto
cd nome-progetto
npm run install:all   # installa dipendenze CMS + frontend
npm run setup         # genera cms/.env e frontend/.env con secrets automatici
npm run dev           # avvia CMS su :1337 e frontend su :4321
```

**Un solo passaggio manuale** — dopo il primo avvio:

1. Vai su `http://localhost:1337/admin` → crea account admin
2. **Settings → API Tokens → Create new token** → tipo `Full access`, durata `Unlimited`
3. Copia il token → apri `frontend/.env` → incolla su `STRAPI_API_TOKEN=`
4. Riavvia il frontend (Ctrl+C → `npm run dev` di nuovo)

Il sito funziona su `http://localhost:4321`.

---

## Stack

| Layer              | Versione                         | Porta |
| ------------------ | -------------------------------- | ----- |
| Strapi 5 (CMS)     | 5.52.1                           | 1337  |
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

## Script disponibili (dalla root)

| Comando               | Cosa fa                                                  |
| --------------------- | -------------------------------------------------------- |
| `npm run install:all` | Installa dipendenze CMS + frontend                       |
| `npm run setup`       | Genera `cms/.env` (secrets automatici) + `frontend/.env` |
| `npm run dev`         | Avvia CMS e frontend in parallelo                        |
| `npm run build`       | Build produzione di CMS e frontend                       |

> Se `.env` esiste già, `npm run setup` si ferma con errore — cancellalo prima di rigenerare.

---

## Prima configurazione admin (dettaglio)

Al primo avvio Strapi costruisce l'interfaccia (1-2 min). Poi:

- **Settings → API Tokens** — crea token `Full access`, copialo in `frontend/.env` come `STRAPI_API_TOKEN`
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

| Problema                                                          | Causa                                                                                                                                                             | Fix                                                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env('X', default)` restituisce `''`                              | Variabile presente ma vuota nel `.env`                                                                                                                            | Usa `env('X') \|\| 'default'` oppure rimuovi la variabile dal `.env`                                                                                                                    |
| Template literal dentro JSX Astro                                 | `Record<T, K>` viene letto come JSX tag                                                                                                                           | Sposta type annotation nel frontmatter                                                                                                                                                  |
| `TypeError: Cannot read properties of undefined (reading 'kind')` | Spread di `createCoreRouter().routes` dentro oggetto `routes`                                                                                                     | Due file separati nella cartella `routes/`                                                                                                                                              |
| Warning `No adapter installed`                                    | `output: "server"` senza adapter                                                                                                                                  | `@astrojs/node` già incluso nel boilerplate                                                                                                                                             |
| `npx @strapi/upgrade minor` → E404 su `@strapi/plugin-seo`        | Il tool tratta tutti i pacchetti `@strapi/*` come core e tenta di portarli alla versione Strapi (es. 5.52.1), ma `@strapi/plugin-seo` esiste solo su versione 2.x | **Prima** di eseguire `@strapi/upgrade`: rimuovi il `^` da `@strapi/plugin-seo` in `cms/package.json` (es. `"2.0.9"` anziché `"^2.0.9"`). Il tool salta i pacchetti già pinnati esatti. |
