# Guida al progetto — Strapi 5 + Astro 5

Questa guida spiega come funziona questo starter kit, a cosa serve ogni parte, e come sviluppare un sito web partendo da zero anche senza esperienza pregressa con questi strumenti.

---

## A cosa serve questo starter

Questo starter mette insieme due strumenti che lavorano in coppia:

- **Strapi** gestisce i contenuti: testi, immagini, articoli, form, menù. È un pannello di amministrazione dove tu (o il cliente) inserisce i contenuti senza toccare codice.
- **Astro** genera le pagine del sito web che gli utenti vedono. Legge i contenuti da Strapi e li mostra in HTML.

Il flusso è semplice:

```
Tu inserisci contenuto in Strapi → Astro legge il contenuto via API → Il sito mostra le pagine
```

Questo approccio si chiama **headless CMS**: il CMS gestisce solo i dati, mentre il frontend (Astro) decide come mostrarli. Il vantaggio è che puoi cambiare completamente l'aspetto del sito senza toccare i contenuti, e viceversa.

---

## Cosa c'è già incluso

| Cosa | Dove | Descrizione |
|------|------|-------------|
| Sistema form dinamici | CMS + Frontend | Crei un form in Strapi, lo metti in qualsiasi pagina con una riga di codice |
| Plugin navigazione | CMS | Gestisci il menu del sito dall'admin Strapi |
| Plugin gruppi | CMS | Organizza le collection nella sidebar dell'admin |
| Plugin ordinamento | CMS | Riordina le voci con drag-and-drop |
| Email SMTP | CMS | Strapi invia email quando arriva una submission |
| Utility API | Frontend | Funzioni pronte per chiamare Strapi da Astro |
| Tailwind CSS v4 | Frontend | Sistema di stili già configurato |
| Adapter produzione | Frontend | Pronto per il build con Node.js |

---

## Prerequisiti

Prima di iniziare devi avere installato sul computer:

### Node.js (versione 20 o superiore)

Node.js è l'ambiente che permette di eseguire JavaScript fuori dal browser. Sia Strapi che Astro girano su Node.js.

- Scarica da [nodejs.org](https://nodejs.org) — scegli la versione **LTS**
- Verifica l'installazione aprendo il terminale e scrivendo:
  ```bash
  node --version
  # deve mostrare v20.x.x o superiore
  ```

### Un editor di codice

Consigliato: **Visual Studio Code** — gratuito, scaricabile da [code.visualstudio.com](https://code.visualstudio.com)

### Un terminale

Su Mac usa il Terminale integrato (o iTerm2). Su Windows usa Windows Terminal o il terminale di VS Code.

---

## Struttura del progetto

```
strapi-astro-starter/
│
├── cms/                  ← Strapi (il pannello admin)
│   ├── config/           ← Configurazioni (database, email, plugin)
│   ├── src/
│   │   ├── api/          ← Le collection di contenuti
│   │   └── components/   ← Componenti riutilizzabili (es. i campi dei form)
│   ├── .env.example      ← Variabili d'ambiente di esempio
│   └── package.json      ← Dipendenze Node.js del CMS
│
├── frontend/             ← Astro (il sito pubblico)
│   ├── src/
│   │   ├── components/   ← Componenti HTML riutilizzabili
│   │   ├── layouts/      ← Template di pagina (header, footer, ecc.)
│   │   ├── lib/          ← Funzioni di utilità (chiamate API, validazione)
│   │   ├── pages/        ← Le pagine del sito (ogni file = una URL)
│   │   └── styles/       ← CSS globale
│   ├── astro.config.mjs  ← Configurazione Astro
│   ├── .env.example      ← Variabili d'ambiente di esempio
│   └── package.json      ← Dipendenze Node.js del frontend
│
├── SETUP.md              ← Riferimento tecnico (pattern, gotcha, ecc.)
└── GUIDA.md              ← Questo file
```

---

## Installazione passo per passo

### Passo 1 — Prepara le variabili d'ambiente del CMS

Le variabili d'ambiente sono configurazioni sensibili (password, chiavi) che non si mettono nel codice. Vanno in un file `.env` che non viene mai condiviso.

```bash
cd cms
cp .env.example .env
```

Ora apri `cms/.env` con l'editor e genera i valori per i campi obbligatori.

Per generare un valore casuale sicuro, esegui questo comando nel terminale (ripetilo per ogni campo):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Compila questi campi in `cms/.env`:

```env
APP_KEYS=valore1,valore2,valore3,valore4   # quattro valori separati da virgola
API_TOKEN_SALT=unValore
ADMIN_JWT_SECRET=unValore
TRANSFER_TOKEN_SALT=unValore
```

Per `ENCRYPTION_KEY` usa questo comando (genera una stringa più corta):
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Gli altri campi (SMTP, database) puoi lasciarli com'è per ora — funziona in locale con SQLite senza configurare nulla.

### Passo 2 — Installa le dipendenze del CMS

```bash
# sei già nella cartella cms/
npm install
```

Questo scarica tutte le librerie necessarie. Può richiedere qualche minuto.

### Passo 3 — Avvia il CMS

```bash
npm run develop
```

Al primo avvio Strapi costruisce l'interfaccia admin (richiede 1-2 minuti). Quando vedi questo nel terminale è pronto:

```
[INFO] Admin panel: http://localhost:1337/admin
```

Apri `http://localhost:1337/admin` nel browser e crea il tuo account amministratore.

### Passo 4 — Prepara le variabili d'ambiente del frontend

Apri un **secondo terminale** (tieni il CMS in esecuzione nel primo).

```bash
cd frontend
cp .env.example .env
```

### Passo 5 — Crea un API Token in Strapi

Il frontend ha bisogno di un token per autenticarsi con Strapi quando fa operazioni con autenticazione (es. salvare iscrizioni newsletter).

1. Vai su `http://localhost:1337/admin`
2. Menu a sinistra → **Settings** → **API Tokens**
3. Clicca **Create new API Token**
4. Dai un nome (es. "Frontend"), tipo **Full access**, durata **Unlimited**
5. Copia il token generato
6. Incollalo in `frontend/.env`:
   ```env
   STRAPI_API_TOKEN=il-token-copiato
   ```

### Passo 6 — Installa le dipendenze del frontend

```bash
# sei nella cartella frontend/
npm install
```

### Passo 7 — Avvia il frontend

```bash
npm run dev
```

Il sito è disponibile su `http://localhost:4321`.

---

## Come funziona Strapi (il CMS)

### Collection Type vs Single Type

Strapi organizza i contenuti in due modi:

- **Collection Type** — contenuti multipli dello stesso tipo. Esempio: `Articoli` (ne puoi creare quanti vuoi). Accessibili via API come lista: `GET /api/articoli`.
- **Single Type** — un solo contenuto. Esempio: `Homepage` (ce n'è solo una). Accessibile via API: `GET /api/homepage`.

### Aggiungere una nuova collection

1. Vai su **Content-Type Builder** nella sidebar sinistra
2. Clicca **Create new collection type**
3. Dai un nome (es. "Servizio")
4. Aggiungi i campi che ti servono (testo, numero, immagine, relazione, ecc.)
5. Clicca **Save** — Strapi si riavvia e la collection è pronta

### Inserire contenuti

1. Vai su **Content Manager** nella sidebar sinistra
2. Seleziona la collection che ti interessa
3. Clicca **Create new entry**
4. Compila i campi
5. Clicca **Publish** (se la collection ha bozze) o **Save**

### Rendere i contenuti accessibili al frontend

Per default Strapi blocca l'accesso pubblico. Per ogni collection che il frontend deve leggere:

1. **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Trova la collection nell'elenco
3. Spunta **find** (per lista) e/o **findOne** (per singolo elemento)
4. Clicca **Save**

---

## Come funziona Astro (il frontend)

### File-based routing

Ogni file in `src/pages/` diventa automaticamente una URL:

| File | URL |
|------|-----|
| `src/pages/index.astro` | `/` |
| `src/pages/servizi.astro` | `/servizi` |
| `src/pages/blog/index.astro` | `/blog` |
| `src/pages/blog/[slug].astro` | `/blog/qualsiasi-cosa` |

### Struttura di un file `.astro`

Un file Astro ha due parti:

```astro
---
// FRONTMATTER — codice JavaScript/TypeScript
// Qui fai le chiamate API, calcoli, import

import { strapiFind } from "@/lib/strapi";

const res = await strapiFind("servizi");
const servizi = res.data;
---

<!-- TEMPLATE — HTML con variabili JavaScript tra { } -->
<h1>I nostri servizi</h1>
{servizi.map((servizio) => (
  <div>
    <h2>{servizio.titolo}</h2>
    <p>{servizio.descrizione}</p>
  </div>
))}
```

### Aggiungere una nuova pagina

1. Crea un file in `src/pages/` con estensione `.astro`
2. Importa il layout e i componenti che ti servono
3. Usa `strapiFind` o `strapiFindOne` per caricare i dati da Strapi
4. Mostra i dati nel template

**Esempio — pagina lista servizi:**

```astro
---
import Layout from "@/layouts/Layout.astro";
import { strapiFind } from "@/lib/strapi";

// definisci il tipo TypeScript per la tua collection
interface Servizio {
  id: number;
  documentId: string;
  titolo: string;
  descrizione: string;
}

const res = await strapiFind<Servizio>("servizios");
const servizi = res.data;
---

<Layout title="Servizi">
  <main>
    <h1>Servizi</h1>
    {servizi.map((s) => (
      <article>
        <h2>{s.titolo}</h2>
        <p>{s.descrizione}</p>
      </article>
    ))}
  </main>
</Layout>
```

> **Nota sul plurale:** Strapi usa il plurale inglese automatico per gli endpoint API. Se la collection si chiama `Servizio`, l'API sarà `/api/servizios` (con la "s" aggiunta). Puoi verificare il nome esatto in Content-Type Builder → seleziona la collection → scheda **Advanced Settings** → campo **API ID (Plural)**.

### Le funzioni di utilità (`src/lib/strapi.ts`)

| Funzione | Quando usarla |
|----------|--------------|
| `strapiFind("nome-collection", params)` | Per caricare una lista di elementi |
| `strapiFindOne("nome-single-type", params)` | Per caricare un Single Type (es. homepage) |
| `strapiMediaUrl(path)` | Per costruire l'URL completo di un'immagine Strapi |
| `strapiPost("nome-collection", data)` | Per salvare dati in Strapi (richiede token) |

**Esempi:**

```ts
// Lista con filtro e ordinamento
const articoli = await strapiFind("articolis", {
  filters: { pubblicato: { $eq: true } },
  sort: "data:desc",
  pagination: { limit: 10 },
  populate: { copertina: true },
});

// Single type con relazioni
const homepage = await strapiFindOne("homepage", {
  populate: { sezioni: true },
});

// URL immagine
const urlFoto = strapiMediaUrl(articolo.copertina?.url);
```

---

## Il sistema form dinamici

Questo starter include un sistema per creare form direttamente da Strapi, senza scrivere codice.

### Come creare un form

1. Strapi Admin → **Content Manager** → **Form** → **Create new entry**
2. Compila:
   - **Nome** — nome leggibile (es. "Form di contatto")
   - **Slug** — identificatore URL (es. `contatti`) — generato automaticamente dal nome
   - **Email destinatario** — se compilato, Strapi invia un'email ad ogni submission
   - **Messaggio di successo** — testo mostrato all'utente dopo l'invio
3. Sezione **Campi** → aggiungi i campi con il pulsante **Add a component**
4. Scegli il tipo di campo (testo, email, textarea, select, checkbox)
5. Per ogni campo imposta:
   - **Label** — etichetta visibile
   - **Nome** — identificatore tecnico (senza spazi, es. `nome-cognome`)
   - **Larghezza** — `full` (intera riga), `half` (metà), `third` (un terzo)
   - **Required** — se il campo è obbligatorio
6. Clicca **Save**

### Come usare il form in una pagina

```astro
---
import DynamicForm from "@/components/DynamicForm.astro";
---

<DynamicForm slug="contatti" />
```

Lo `slug` deve corrispondere a quello impostato in Strapi.

### Dove finiscono le submission

Strapi Admin → **Content Manager** → **Form Submission** — trovi tutte le risposte ricevute.

---

## Il sistema di navigazione

Il menu del sito si gestisce da Strapi tramite il plugin Navigation.

### Configurare il menu

1. Strapi Admin → **Navigation** (nella sidebar)
2. Seleziona o crea una navigazione con slug `main`
3. Aggiungi le voci del menu con titolo e URL
4. Puoi creare sottomenu annidati

### Usare il menu in Astro

```astro
---
const STRAPI_URL = import.meta.env.STRAPI_URL ?? "http://localhost:1337";

async function fetchNav(slug: string) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/navigation/render/${slug}?type=TREE`);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

const navItems = await fetchNav("main");
---

<nav>
  {navItems.map((item: any) => (
    <a href={item.path}>{item.title}</a>
  ))}
</nav>
```

---

## Aggiungere stili con Tailwind CSS

Tailwind è già configurato. Puoi usare le classi direttamente nell'HTML:

```astro
<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-4">Titolo</h1>
  <p class="text-gray-600 leading-relaxed">Testo del paragrafo.</p>
</div>
```

Tailwind funziona con classi predefinite — non scrivi CSS manuale, usi nomi descrittivi come `text-blue-600` (testo blu) o `p-4` (padding 16px). La documentazione completa è su [tailwindcss.com](https://tailwindcss.com).

---

## Variabili d'ambiente — spiegazione

Le variabili d'ambiente sono valori di configurazione separati dal codice. Servono perché:

- Cambiano tra ambienti diversi (sviluppo locale vs produzione)
- Contengono segreti (password, chiavi API) che non devono stare nel codice

**Come funzionano:**

- Il file `.env` contiene i valori reali — **non va mai committato su Git**
- Il file `.env.example` è un template senza valori sensibili — va committato su Git per documentare quali variabili servono
- In Astro, le variabili si leggono con `import.meta.env.NOME_VARIABILE`
- Le variabili con prefisso `PUBLIC_` sono accessibili nel browser (JavaScript lato client). Le altre sono solo server-side.

**Nel CMS (`cms/.env`):**

| Variabile | Cosa è |
|----------|--------|
| `APP_KEYS` | Chiavi per la crittografia sessioni |
| `ADMIN_JWT_SECRET` | Chiave per i token admin |
| `API_TOKEN_SALT` | Sale per gli API token |
| `TRANSFER_TOKEN_SALT` | Sale per i token di trasferimento |
| `ENCRYPTION_KEY` | Chiave per dati cifrati |
| `DATABASE_CLIENT` | Tipo database (`sqlite` in dev, `postgres` in prod) |
| `SMTP_*` | Credenziali email per le notifiche form |

**Nel frontend (`frontend/.env`):**

| Variabile | Cosa è |
|----------|--------|
| `STRAPI_URL` | URL del CMS — usata server-side (solo Astro) |
| `STRAPI_API_TOKEN` | Token per operazioni autenticate |
| `PUBLIC_STRAPI_URL` | URL del CMS — usata client-side (browser, es. DynamicForm) |

---

## Workflow di sviluppo tipico

### Per aggiungere una nuova sezione al sito

1. **Strapi Admin** → Content-Type Builder → crea la collection con i campi
2. **Settings → Public role** → abilita `find` sulla nuova collection
3. **Content Manager** → inserisci alcuni contenuti di prova
4. **Frontend** → crea `src/pages/nuova-sezione.astro`
5. Usa `strapiFind` per caricare i dati e mostrali nel template

### Per modificare una pagina esistente

1. Apri il file in `frontend/src/pages/`
2. Modifica il template HTML
3. Astro aggiorna automaticamente il browser (hot reload)

### Per aggiungere un nuovo form

1. Strapi Admin → Content Manager → Form → crea il form
2. Aggiungi `<DynamicForm slug="il-tuo-slug" />` nella pagina

---

## Avviare i server in sviluppo

Ogni volta che riprendi a lavorare devi avviare **entrambi** i server:

**Terminale 1 — CMS:**
```bash
cd cms
npm run develop
```

**Terminale 2 — Frontend:**
```bash
cd frontend
npm run dev
```

| Servizio | URL |
|---------|-----|
| Admin Strapi | http://localhost:1337/admin |
| API Strapi | http://localhost:1337/api |
| Sito Astro | http://localhost:4321 |

---

## Build per la produzione

Quando il sito è pronto per andare online:

**CMS:**
```bash
cd cms
npm run build
npm run start
```

**Frontend:**
```bash
cd frontend
npm run build
node dist/server/entry.mjs
```

Per la produzione dovrai:

1. Usare un database PostgreSQL invece di SQLite
2. Configurare un server SMTP reale per le email
3. Impostare le variabili d'ambiente con valori di produzione
4. Mettere un reverse proxy (es. Nginx) davanti ai due server

---

## Glossario

| Termine | Significato |
|---------|------------|
| **Headless CMS** | CMS che gestisce solo i dati, senza generare pagine HTML |
| **API** | Canale di comunicazione tra CMS e frontend — dati in formato JSON |
| **Collection Type** | Tipo di contenuto con più istanze (es. articoli) |
| **Single Type** | Tipo di contenuto con una sola istanza (es. homepage) |
| **Dynamic Zone** | Campo Strapi che permette di aggiungere blocchi di tipi diversi |
| **SSR** | Server-Side Rendering — le pagine vengono generate dal server a ogni richiesta |
| **Frontmatter** | Sezione `---` di un file Astro dove si scrive TypeScript |
| **Slot** | Punto di inserimento del contenuto in un layout Astro |
| **Variabile d'ambiente** | Valore di configurazione esterno al codice, in `.env` |
| **Token API** | Chiave di accesso per autenticare le chiamate API |
| **Plugin Strapi** | Estensione che aggiunge funzionalità al CMS |
| **Populate** | Parametro API Strapi per caricare le relazioni di un contenuto |
