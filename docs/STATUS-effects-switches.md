# STATUS — Global effect switches (stickyShell, imageMaskReveal)

Branch: `feat/effects-switches`

---

## Fatto ✅

### CMS contract

- Due campi **boolean** aggiunti al single-type `site-setting` (primi boolean
  sul single-type, accanto alle quattro enum esistenti):
  - `stickyShell` (default `true`)
  - `imageMaskReveal` (default `true`)
- Seed bootstrap emette entrambi i default → `GET /api/site-setting` risponde
  200 con `stickyShell: true, imageMaskReveal: true` da clone pulito.
- Reader `getSiteSettings()` con coercizione a boolean (`typeof v === "boolean"`)
  e fallback `true`. Tipo `SiteSettings` aggiornato.

### Wiring sticky (`stickyShell`)

- Una sola lettura di `getSiteSettings()` in `Layout.astro`.
- `data-sticky-footer` su `<body>`: emesso se `stickyShell`.
- `data-sticky-hero` su `<main>`: emesso se `headerOverlay && stickyShell`.
- OFF → nessun attributo → CSS gated non si applica → hero e footer tornano
  classici. Nessuna CSS nuova lato sticky.

### Wiring maschera (`imageMaskReveal`)

- **Forma del gate: attributo radice CSS puro** — `[data-mask-images]` su
  `<body>`, gemello degli sticky. Emesso se `imageMaskReveal`.
- In `motion.css`, **tutte** le regole mask-reveal (clip-path `inset`,
  micro-scale `scale(1.1) → scale(1)` su `<img>`, skip-stagger
  `[data-mask-skip]`, reduced-motion per la maschera) sono nested sotto
  `[data-mask-images]`.
- `[data-mask-grid]` (amplified translateY 40px) resta **fuori** dal gate →
  le card mantengono la salita amplificata a maschera spenta (separabilità).
- **Garanzia OFF = immagine in chiaro**: senza `[data-mask-images]` i selettori
  nested non matchano → nessun `clip-path`, nessun `scale`, nessun
  `[data-mask-skip]`. L'immagine è visibile da subito a `scale(1)` naturale.
  Il wrapper `data-mask-reveal` resta nel DOM ma è inerte (nessuna regola CSS
  attiva). La card continua a salire (stagger translateY/fade vivo).

### Scope (decisione voluta)

`imageMaskReveal` governa **solo** la maschera clip-path + scale, non tutto il
reveal d'ingresso. Scelta deliberata: leva più piccola e più sicura, non tocca
l'init centrale del reveal (`initReveal`). Un eventuale interruttore più largo
su tutto il reveal è una feature futura — nome `revealAnimations` lasciato
libero apposta.

### Predisposizione

Entrambi gli effetti erano già su punti di attivazione isolati:
- Sticky: `data-sticky-hero` (B1) e `data-sticky-footer` (B2), regole CSS
  gated sull'attributo.
- Maschera: `data-mask-reveal` + `motion.css`, separabile dallo stagger.

Gli interruttori aggiungono un livello sopra questi punti senza riscrivere la
resa.

### e2e

13 test Playwright in `effects-switches.spec.ts` (geometria/attributo):
- stickyShell ON → attributi presenti, footer sticky, mobile classico
- stickyShell OFF → attributi assenti, footer static, main z-index auto
- imageMaskReveal ON → clip-path inset, scale transform su img
- imageMaskReveal OFF → clip-path none, scale none, stagger translateY vivo,
  `data-mask-grid` amplificato 40px sopravvive

Fixture dedicata: `/dev/mask-reveal`.

---

## Da fare

- Merge (gate di Andrea).
- G5 verifica manuale: fresh boot → `GET /api/site-setting` con i default.

---

## Debito & decisioni

- **Primo boolean sul single-type**: il reader usava solo coercizioni enum;
  aggiunto `coerceBoolean(v, fallback)`. Generico, riutilizzabile.
- **Attributo radice `data-mask-images`**: nuovo attributo su `<body>`, gemello
  di `data-sticky-footer`. Gate CSS puro, un solo punto, nessun JS lato gate.
- **`getSiteSettings()` chiamata 3 volte per page render** (Layout, Header,
  Footer): in dev colpisce Strapi 3 volte. Per produzione, la cache HTTP o un
  data-loader Astro possono deduplicare. Non bloccante ora.
- **3 errori pre-esistenti in `astro check`** (`dev/images.astro`): non da
  questo giro, non bloccanti.

---

## Oltre lo scope

- Interruttore `revealAnimations` per tutto il reveal d'ingresso (fade-up,
  translateY, fade testo).
- Interruttori per effetti hero (`heroStyle`).
- Deduplicazione `getSiteSettings()` con data-loader.
