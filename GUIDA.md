# Guida al progetto — Strapi 5 + Astro 7

Questa guida spiega come funziona questo starter kit, a cosa serve ogni parte, e come sviluppare un sito web partendo da zero anche senza esperienza pregressa con questi strumenti.

Per il **riferimento tecnico** (comandi sintetici, pattern, gotcha, MCP) vedi [SETUP.md](SETUP.md). Per il **quick start** vedi il [README](README.md#quick-start).

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

| Cosa                  | Dove           | Descrizione                                                                           |
| --------------------- | -------------- | ------------------------------------------------------------------------------------- |
| Sistema form dinamici | CMS + Frontend | Crei un form in Strapi, lo metti in qualsiasi pagina con una riga di codice           |
| Voci di Menu (nativo) | CMS            | Gestisci header e footer dall'admin Strapi — nessun plugin esterno                    |
| Plugin gruppi         | CMS            | Organizza le collection nella sidebar dell'admin                                      |
| Plugin ordinamento    | CMS            | Riordina le voci con drag-and-drop                                                    |
| Email SMTP            | CMS            | Strapi invia email quando arriva una submission                                       |
| Server MCP            | CMS            | Collega Claude Code (e altri AI agent) a Strapi per gestire contenuti                 |
| Utility API           | Frontend       | Funzioni pronte per chiamare Strapi da Astro                                          |
| Tailwind CSS v4       | Frontend       | Sistema di stili già configurato                                                      |
| Starwind UI           | Frontend       | Componenti Astro nativi (NavigationMenu, Sheet, Card, Badge, Prose…) — nessun React   |
| Adapter produzione    | Frontend       | Pronto per il build con Node.js                                                       |
| Layout di default     | Frontend       | Header, footer e SEO già cablati. Personalizza **un solo file**: `src/config/site.ts` |

> L'elenco puntuale delle versioni e dei plugin installati è in [SETUP.md](SETUP.md#stack).

---

## Prerequisiti

Prima di iniziare devi avere installato sul computer:

### Node.js 22 LTS (linea 22.x)

Node.js è l'ambiente che permette di eseguire JavaScript fuori dal browser. Sia Strapi che Astro girano su Node.js.

Usa **Node 22 LTS** (qualsiasi versione della linea 22.x, es. 22.12, 22.16…). Strapi 5 non supporta Node 23 o 24: usa una versione diversa e il CMS potrebbe non avviarsi.

- Scarica da [nodejs.org](https://nodejs.org) — scegli la versione **LTS**
- Verifica l'installazione aprendo il terminale e scrivendo:
  ```bash
  node --version
  # deve mostrare una versione v22.x
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
├── README.md            ← Vetrina e quick start
├── SETUP.md             ← Riferimento tecnico (pattern, gotcha, ecc.)
└── GUIDA.md             ← Questo file
```

---

## Installazione passo per passo

### Passo 1 — Clona il progetto

```bash
git clone https://github.com/New-Adventures-in-CMS/strapi-astro-starter.git nome-progetto
cd nome-progetto
```

Sostituisci `nome-progetto` con il nome del tuo sito.

### Passo 2 — Seleziona Node 22

Il progetto include un file `.nvmrc` che indica la versione Node corretta. Se usi **nvm**, esegui:

```bash
nvm use
```

Questo legge `.nvmrc` e attiva Node 22. Se nvm non è installato, assicurati manualmente che `node --version` mostri una versione `v22.x` prima di procedere.

### Passo 3 — Installa le dipendenze

```bash
npm run install:all
```

Scarica tutte le librerie necessarie per CMS e frontend. Può richiedere qualche minuto.

### Passo 4 — (Opzionale) Genera i file di configurazione

```bash
npm run setup
```

Questo comando crea `cms/.env` e `frontend/.env` con tutti i valori necessari già compilati — incluse le chiavi crittografiche generate in modo sicuro.

**Puoi saltare questo passo**: al primo `npm run dev` gli `.env` mancanti vengono generati automaticamente. Se esistono già non vengono mai sovrascritti.

Le variabili d'ambiente sono configurazioni sensibili (password, chiavi) che non si mettono nel codice. I file `.env` non vengono mai caricati su GitHub.

### Passo 5 — Avvia tutto

```bash
npm run dev
```

Avvia CMS e frontend insieme. Al primo avvio Strapi costruisce l'interfaccia admin (1-2 minuti). Quando il terminale mostra:

```
[CMS] Admin panel: http://localhost:1337/admin
```

il CMS è pronto.

### Passo 6 — Crea l'account admin in Strapi

Apri `http://localhost:1337/admin` nel browser e registra il tuo account amministratore (email + password).

### Passo 7 — Crea un API Token e collegalo al frontend

Il frontend usa un token segreto per comunicare con Strapi in modo sicuro.

1. In Strapi Admin → **Settings** → **API Tokens**
2. Clicca **Create new API Token**
3. Nome: `Frontend`, tipo: **Full access**, durata: **Unlimited**
4. Copia il token che appare (lo vedi solo una volta)
5. Apri `frontend/.env` con l'editor di testo
6. Sostituisci il placeholder sulla riga `STRAPI_API_TOKEN=`:
   ```env
   STRAPI_API_TOKEN=incolla-il-token-qui
   ```
7. Salva il file

### Passo 8 — Riavvia e verifica

Ferma il dev server (Ctrl+C nel terminale) e riavvia:

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

| File                          | URL                    |
| ----------------------------- | ---------------------- |
| `src/pages/index.astro`       | `/`                    |
| `src/pages/servizi.astro`     | `/servizi`             |
| `src/pages/blog/index.astro`  | `/blog`                |
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

| Funzione                                    | Quando usarla                                      |
| ------------------------------------------- | -------------------------------------------------- |
| `strapiFind("nome-collection", params)`     | Per caricare una lista di elementi                 |
| `strapiFindOne("nome-single-type", params)` | Per caricare un Single Type (es. homepage)         |
| `strapiMediaUrl(path)`                      | Per costruire l'URL completo di un'immagine Strapi |
| `strapiPost("nome-collection", data)`       | Per salvare dati in Strapi (richiede token)        |

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

## Il page builder (blocchi)

Il content-type **Page** ha un campo **Blocks** (Dynamic Zone) per costruire
la pagina componendo blocchi riutilizzabili. Ogni blocco ha il suo layout in
Astro; l'ordine dei blocchi nell'admin corrisponde all'ordine di rendering.

Blocchi disponibili:

- **Hero** — banner con titolo, sottotitolo, CTA opzionale, immagine di sfondo.
- **Rich Text** — blocco di testo Markdown.
- **Image + Text** — immagine e testo affiancati, con posizione immagine
  (sinistra/destra).
- **Card Grid** — griglia di card con titolo, descrizione, immagine e link
  opzionali.

Come usarli:

1. Content Manager → Page → apri (o crea) una pagina.
2. Sul campo **Blocks** clicca **+ Add a component to Blocks** e scegli il
   tipo.
3. Compila i campi e **Publish**.
4. Se un blocco richiede un'immagine, caricala prima in **Media Library** e
   collegala dal campo `image` del blocco.

**Nota:** i blocchi si renderizzano per primi; se la pagina ha anche il
campo **Body** compilato, quel Markdown viene mostrato sotto come articolo di
fallback.

**Il contenuto demo viene creato automaticamente al primo avvio.** Se il DB
è vuoto, Strapi popola `home` e `about` con blocchi già configurati. Per
resettare: ferma Strapi, esegui `npm run db:reset`, riavvia.

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

> Reference tecnica (tipi di campo, endpoint di submit): [SETUP.md](SETUP.md#sistema-form-dinamici).

---

## Gestire il menu di navigazione

Il menu del sito (header e footer) si gestisce da **Content Manager → Voci di Menu**.

### Come creare una voce

1. Apri **Content Manager → Voci di Menu** e clicca **+ Create new entry**.
2. Compila il campo **Etichetta** — è il testo che appare nel menu.
3. Scegli **Pagina collegata** OPPURE inserisci un **URL esterno**:
   - _Pagina collegata_: seleziona una pagina del sito dalla lista.
   - _URL esterno_: inserisci l'URL completo (es. `https://docs.astro.build`) o un percorso relativo (es. `/privacy`). Se inizia con `http`, il link si apre in nuova scheda.
   - Se compili entrambi, l'URL esterno ha la precedenza.
4. Imposta **Dove appare** (campo _Area_):
   - `header` — solo nel menu in cima alla pagina.
   - `footer` — solo nel footer in fondo alla pagina.
   - `both` — in entrambi i posti.
5. Se la voce va nel footer, compila anche **Colonna footer** — scegli in quale colonna apparirà (`Prodotto`, `Azienda`, `Supporto`, `Legale`). Le voci senza questa colonna non compaiono nel footer anche se Area è `both`.
6. Imposta **Ordine** — numero intero (più basso = prima nella lista). Default: 0.
7. Clicca **Save** e poi **Publish** (le voci non pubblicate non compaiono sul sito).

### Come creare un sottomenu (2 livelli)

1. Crea prima la voce padre (es. "Servizi") come descritto sopra.
2. Crea una voce figlia (es. "Servizio A"):
   - Imposta **Voce genitore** selezionando la voce padre appena creata.
   - La voce figlia eredita la visibilità del padre. Puoi avere al massimo 2 livelli (padre → figlio).
3. Usa il campo **Ordine** per controllare la sequenza dei figli.

> **Convenzione — voci padre come sezioni, non link.** Nel menu desktop, una voce con figli viene resa come trigger del sottomenu, non come link cliccabile. Se imposti una _Pagina collegata_ su una voce padre, quella pagina **non sarà raggiungibile dal trigger** — il trigger apre solo il sottomenu. Usa le voci padre solo come etichette di sezione (es. "Servizi", "Prodotto"); metti i link reali nelle voci figlie.

### Voci di esempio

All'avvio del progetto vengono create automaticamente 9 voci di esempio che mostrano tutti i casi d'uso:

| Voce           | Area   | Note                             |
| -------------- | ------ | -------------------------------- |
| Home           | both   | Pagina interna, primo livello    |
| Chi siamo      | header | Pagina interna                   |
| Servizi        | header | Padre del sottomenu              |
| ↳ Servizio A   | header | Figlia di Servizi, URL relativo  |
| ↳ Servizio B   | header | Figlia di Servizi, URL relativo  |
| Contatti       | both   | Pagina interna                   |
| Documentazione | header | Link esterno (apre nuova scheda) |
| Privacy        | footer | Solo footer, colonna Legale      |
| Termini        | footer | Solo footer, colonna Legale      |

Studia queste voci come modello prima di modificarle o sostituirle.

### Fallback

Se Strapi è spento o irraggiungibile, il sito mostra automaticamente le voci statiche definite in `frontend/src/config/site.ts` (header `site.nav`, footer `site.footer.columns`). Nessun crash.

> Riferimento tecnico (schema, logica href, albero, FOOTER_COLUMNS): [SETUP.md](SETUP.md#content-type-menu-item).

---

## Collegare Claude Code a Strapi (MCP)

Se usi Claude Code, puoi collegarlo direttamente a Strapi per gestire i contenuti in linguaggio naturale — creare voci, aggiornare testi, pubblicare entry — senza aprire il pannello admin.

Lo starter ha già il server MCP abilitato in sviluppo. Per collegarlo ti serve solo creare un Admin token in Strapi e registrare il server in Claude Code. Trovi tutti i passi nella sezione **Server MCP (AI agents)** di [SETUP.md](SETUP.md#server-mcp-ai-agents).

---

## Il layout di default

Il tuo sito parte già con un header, un footer e le meta tag SEO configurate. Per personalizzare nome del sito, voci di menu e colonne del footer, modifica **un solo file**: `frontend/src/config/site.ts`.

```ts
// frontend/src/config/site.ts
export const site: SiteConfig = {
  name: "Il mio sito", // ← nome che appare nell'header e nel <title>
  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" }, // ← aggiungi/rimuovi voci qui
  ],
  footer: {
    columns: [{ title: "Navigazione", items: [{ label: "Home", href: "/" }] }],
    legal: "© 2026 Il mio sito",
  },
};
```

Il CMS non è necessario per il layout: header e footer funzionano anche con Strapi spento. Il contenuto dinamico (pagine, articoli) arriva da Strapi, ma con un fallback pulito se il CMS non risponde.

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
- In Astro 7, le variabili si leggono tramite il modulo `astro:env`: le variabili server-side (es. `STRAPI_URL`, `STRAPI_API_TOKEN`) vengono importate da `astro:env/server` e lette **a runtime** — non vengono mai incorporate nel codice compilato. Le variabili pubbliche (prefisso `PUBLIC_`, es. `PUBLIC_STRAPI_URL`) vengono importate da `astro:env/client` e sono accessibili anche nel browser.
- Lo schema delle variabili è definito in `frontend/astro.config.mjs` e viene validato all'avvio del server.

**Nel CMS (`cms/.env`):**

| Variabile             | Cosa è                                              |
| --------------------- | --------------------------------------------------- |
| `APP_KEYS`            | Chiavi per la crittografia sessioni                 |
| `ADMIN_JWT_SECRET`    | Chiave per i token admin                            |
| `API_TOKEN_SALT`      | Sale per gli API token                              |
| `TRANSFER_TOKEN_SALT` | Sale per i token di trasferimento                   |
| `ENCRYPTION_KEY`      | Chiave per dati cifrati                             |
| `DATABASE_CLIENT`     | Tipo database (`sqlite` in dev, `postgres` in prod) |
| `SMTP_*`              | Credenziali email per le notifiche form             |

**Nel frontend (`frontend/.env`):**

| Variabile           | Cosa è                                                     |
| ------------------- | ---------------------------------------------------------- |
| `STRAPI_URL`        | URL del CMS — usata server-side (solo Astro)               |
| `STRAPI_API_TOKEN`  | Token per operazioni autenticate                           |
| `PUBLIC_STRAPI_URL` | URL del CMS — usata client-side (browser, es. DynamicForm) |

> I valori di esempio completi dei file `.env` sono in [SETUP.md](SETUP.md#variabili-dambiente).

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

Dopo la prima configurazione, per riprendere a lavorare basta un comando dalla root:

```bash
npm run dev
```

Avvia CMS e frontend insieme. Se preferisci tenerli separati in due terminali:

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

| Servizio     | URL                         |
| ------------ | --------------------------- |
| Admin Strapi | http://localhost:1337/admin |
| API Strapi   | http://localhost:1337/api   |
| Sito Astro   | http://localhost:4321       |

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

> Dettagli e checklist env di produzione: [SETUP.md](SETUP.md#build-produzione).

---

## Glossario

| Termine                  | Significato                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| **Headless CMS**         | CMS che gestisce solo i dati, senza generare pagine HTML                       |
| **API**                  | Canale di comunicazione tra CMS e frontend — dati in formato JSON              |
| **Collection Type**      | Tipo di contenuto con più istanze (es. articoli)                               |
| **Single Type**          | Tipo di contenuto con una sola istanza (es. homepage)                          |
| **Dynamic Zone**         | Campo Strapi che permette di aggiungere blocchi di tipi diversi                |
| **SSR**                  | Server-Side Rendering — le pagine vengono generate dal server a ogni richiesta |
| **Frontmatter**          | Sezione `---` di un file Astro dove si scrive TypeScript                       |
| **Slot**                 | Punto di inserimento del contenuto in un layout Astro                          |
| **Variabile d'ambiente** | Valore di configurazione esterno al codice, in `.env`                          |
| **Token API**            | Chiave di accesso per autenticare le chiamate API                              |
| **Plugin Strapi**        | Estensione che aggiunge funzionalità al CMS                                    |
| **Populate**             | Parametro API Strapi per caricare le relazioni di un contenuto                 |
