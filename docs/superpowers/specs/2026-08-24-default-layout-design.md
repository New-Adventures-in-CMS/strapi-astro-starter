# Design: Default Layout + Boilerplate Fondamentali

**Data:** 2026-08-24
**Repo:** `strapi-astro-starter`
**Status:** Approvato — pronto per implementazione

---

## Obiettivo

Dotare il boilerplate di un tema/layout di default: header/nav + footer configurabili + main content dinamico da Strapi. Filosofia ibrida: nav e footer statici ma centralizzati in un file di config, il main content dimostra il pattern dinamico reale Astro ↔ Strapi 5.

---

## File da creare

| File                                     | Scopo                                            |
| ---------------------------------------- | ------------------------------------------------ |
| `frontend/src/config/site.ts`            | Unico punto di verità per nome sito, nav, footer |
| `frontend/src/config/i18n.ts`            | i18n predisposto ma non attivo                   |
| `frontend/src/components/Header.astro`   | Nav con active state + hamburger mobile          |
| `frontend/src/components/Footer.astro`   | Footer a colonne da config                       |
| `frontend/src/components/SEO.astro`      | `<head>` centralizzato con OG/Twitter            |
| `frontend/src/pages/pagine/index.astro`  | Lista pagine Strapi                              |
| `frontend/src/pages/pagine/[slug].astro` | Dettaglio pagina dinamico                        |
| `frontend/src/pages/404.astro`           | 404 con layout + noindex                         |
| `frontend/src/lib/env.ts`                | Validazione env all'avvio con errori leggibili   |
| `frontend/src/env.d.ts`                  | Tipi TypeScript per `ImportMetaEnv`              |
| `frontend/public/robots.txt`             | Allow all + URL sitemap                          |

## File da modificare (integrare, non sovrascrivere)

| File                                | Modifica                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `frontend/src/layouts/Layout.astro` | Aggiunge SEO + Header + Footer + struttura flex `min-h-screen` |
| `frontend/src/pages/index.astro`    | Home dinamica con fetch Strapi + fallback CMS spento           |
| `frontend/src/styles/global.css`    | Aggiunge `@theme` design token + reset minimo                  |
| `frontend/src/types/index.ts`       | Aggiunge interfaccia `Page`                                    |
| `frontend/astro.config.mjs`         | Aggiunge `image.remotePatterns` + integrazione sitemap         |
| `frontend/.env.example`             | Verifica/aggiorna con commenti esplicativi                     |
| `GUIDA.md`                          | Paragrafo su layout di default e `site.ts`                     |
| `SETUP.md`                          | Sezioni: layout, content-type Page, i18n, estensioni           |

---

## Architettura

```
site.ts (config statica)
  └─ Header.astro     ← nav + active state + hamburger
  └─ Footer.astro     ← colonne link + legal
  └─ SEO.astro        ← title, description, OG, Twitter

Layout.astro
  ├─ <head> → SEO.astro
  ├─ <Header />
  ├─ <main> → <slot />
  └─ <Footer />

Pages
  ├─ index.astro          → strapiFind("pages", {slug: "home"}) + fallback
  ├─ pagine/index.astro   → strapiFind("pages") → lista
  ├─ pagine/[slug].astro  → strapiFind + filtro slug → dettaglio | redirect /404
  └─ 404.astro            → Layout con noindex

Strapi content-type: page
  fields: title (Text), slug (UID), body (Rich text), seo_desc (Text long)
  permissions: Public → find + findOne abilitati
```

---

## Decisioni chiave

### 1. NavItem: due contesti distinti, nessun conflitto

`NavItem` in `site.ts` descrive voci di menu statiche (`label`, `href`, `external?`). Rimane locale al modulo `site.ts` — non va esportato in `src/types/index.ts`. Il `NavItem` già presente in `types/index.ts` viene dal plugin Strapi Navigation (forma diversa, uso diverso). Se in futuro entrambi venissero importati nello stesso file, rinominare quello di `site.ts` (es. `SiteNavItem`) per evitare ambiguità.

### 2. SSR + sitemap

Il progetto gira in `output: "server"` (SSR con Node adapter). `@astrojs/sitemap` funziona anche in SSR — genera la sitemap a runtime. `robots.txt` deve puntare all'URL corretto: `https://example.com/sitemap-index.xml`. In produzione va sostituito con il dominio reale (documentare in SETUP).

### 3. Fallback CMS spento — try/catch solido

Con SSR, ogni richiesta alla home fa fetch a Strapi. Il `try/catch` attorno a `strapiFind` deve catturare sia errori di rete (CMS spento) sia risposte non-ok. Non lasciare propagare eccezioni non gestite. La home deve sempre rispondere 200 con fallback UI, mai crashare.

### 4. i18n: predisposto ma non attivo

`src/config/i18n.ts` definisce `defaultLocale: "it"`, `locales: ["it"]`. Non creare routing `[lang]/`, non attivare `i18n` in `astro.config.mjs`. Documentare i passi di attivazione in SETUP come sezione "estensione".

### 5. Validazione env: lazy, non eager

`src/lib/env.ts` non deve validare all'importazione del modulo: in SSR farebbe crashare l'avvio del server anche per rotte che non toccano Strapi. La validazione (con errore leggibile) va invocata dentro `strapi.ts`, al momento della prima chiamata al client — non a load time.

### 6. Content-type `page`: verificare assenza conflitti

Prima di creare il content-type in Strapi, confermare che non esista già un `page` (o nome simile) nel CMS. Se il progetto è pulito (nessun content-type preesistente), procedere normalmente.

### 8. Tipo `Page` in `src/types/index.ts`

La spec indicava `src/types.ts` ma il repo usa `src/types/index.ts`. L'interfaccia `Page` va aggiunta lì, consistente con la struttura esistente.

---

## Strapi content-type `page`

| Campo      | Tipo         | Note                     |
| ---------- | ------------ | ------------------------ |
| `title`    | Text (short) | required                 |
| `slug`     | UID          | target `title`, required |
| `body`     | Rich text    | corpo pagina             |
| `seo_desc` | Text (long)  | opzionale, per meta desc |

Abilitare `find` e `findOne` per il ruolo **Public**. Non aggiungere dynamic zone: documentarla come estensione.

---

## Design token (global.css)

```css
@theme {
  --color-brand-50: #eef6ff;
  --color-brand-500: #2563eb;
  --color-brand-700: #1d4ed8;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

Reset: box-sizing, body margin, img/svg/video max-width.

---

## Criteri di completamento

1. `npm run dev` parte pulito; con Strapi spento la home mostra fallback, non crash.
2. Con Strapi acceso e page slug `home` pubblicata, home mostra contenuti; title/description in `<head>`.
3. Header evidenzia voce attiva; footer renderizza colonne da `site.ts`.
4. Modificare solo `site.ts` cambia nome sito, nav e footer ovunque.
5. `/404` renderizza dentro layout con `noindex`.
6. La sitemap è raggiungibile a `/sitemap-index.xml` con l'app in esecuzione (SSR: generata a runtime, non a build time); `robots.txt` è servito e vi punta.
7. Rimuovere `PUBLIC_STRAPI_URL` da `.env` produce errore leggibile, non stack trace.
8. Nessuna dipendenza da plugin Strapi per layout base (nav/footer statici).

---

## Dipendenze da aggiungere

- `@astrojs/sitemap` (installare + aggiungere a `astro.config.mjs`)

---

## Fuori scope (documentare come estensioni)

- Nav dinamica via `strapi-plugin-navigation`
- Dynamic zone `blocchi` per page builder
- Preview/draft mode
- Componenti UI riutilizzabili
- Immagini avanzate con `<Image />` ottimizzate
- i18n attivo con routing multilingua
