# STATUS — Guscio sticky, Tappa B2: footer sticky

Branch: `feat/sticky-footer`
Data: 2026-10-22

---

## Obiettivo B2

Completare il guscio sticky. Il footer resta fermo in basso, dietro il contenuto
opaco; arrivato in fondo alla pagina, il bordo inferiore del contenuto sale e
scopre il footer. Speculare all'hero sticky di B1.

---

## Fatto ✅

### Percorso scelto: CSS-only (percorso 1)

Footer `position: sticky; bottom: 0` dentro `@media (min-width: 768px)`,
gated a `[data-sticky-footer]`. Nessun JS, nessun `--footer-h` misurato.

Perché regge senza JS: `sticky; bottom: 0` mantiene il footer nel flusso
normale del documento — la sua altezza è riservata automaticamente. Il modello
flex (`body` flex-col + `main` flex-1 + footer `mt-auto`) gestisce le pagine
corte: `<main>` si espande, il footer resta in fondo, niente da scoprire.

### Piano di stacking

```
body (flex column, stacking context root)
├── header   z-50  (fixed, inset-x-0 top-0 — Tailwind class, invariato)
├── main     z-1   (relative — via CSS gated [data-sticky-footer] ≥768px)
│   ├── hero       z-0 sticky  (B1, scoped [data-sticky-hero], solo immersive)
│   └── siblings   z-1 relative (B1, scoped [data-sticky-hero])
└── footer   z-0   (sticky bottom:0 — via CSS gated [data-sticky-footer] ≥768px)
```

Elevazione contenuto sopra footer resa **globale** (non gated a immersive, a
differenza di B1). Non collide con B1: `<main>` a `z-index: 1` crea un nuovo
stacking context a livello `body`; le z-index di B1 (hero z:0, siblings z:1)
operano *dentro* quel contesto e non fuoriescono. Header a z-50 resta sopra
tutto — verificato e coperto da e2e.

### Asimmetria voluta vs hero

L'hero sticky è gated a immersive + ≥768px (effetto opzionale, attivo solo su
pagine fullscreen). Il footer sticky va su **tutte** le pagine + ≥768px: è
chrome globale, dev'essere coerente ovunque. Non è una svista — non "allineare"
il footer a immersive.

### Strato opaco continuo

Dal recon: `<main>` era trasparente, solo i blocchi (`Section`) portavano
background. Con footer sticky dietro, eventuali interstizi avrebbero lasciato
trapelare il footer. Fix: `background: var(--background)` su `<main>`, gated
allo stesso blocco CSS `[data-sticky-footer] @media ≥768px`. Token di superficie
esistente, nessun literal, nessun token nuovo (vincolo semantic-only rispettato).

### Punto di attivazione unico

`data-sticky-footer` su `<body>` in `Layout.astro`, presente di default su tutte
le pagine. Tutte le regole B2 (footer sticky + main relativo/opaco) pendono da
questo solo attributo. Predisposto per futuro interruttore CMS: rimuovendo
l'attributo si reverte tutto (main torna trasparente e senza stacking context,
footer torna statico).

### Riconciliazione pagine corte

Modello `flex min-h-screen flex-col` su `body` + `flex-1` su `main` +
`mt-auto` su footer (mantenuto, ridondante ma innocuo). Su pagine corte:
`<main>` si espande a riempire il viewport, footer finisce in fondo — niente
da scoprire, nessun vuoto, nessuna sovrapposizione. Identico al comportamento
pre-B2.

### Mobile

Sticky footer escluso sotto 768px via `@media (min-width: 768px)`, coerente con
B1. Motivo: barre browser mobile instabili su elementi ancorati in basso.
`data-sticky-footer` resta su `<body>` (segnale invariato); è solo la resa CSS
che si spegne sotto soglia.

### E2E

6 test Playwright geometrici/computed-style:
- Footer `position: sticky` + `bottom: 0` a ≥768px
- Footer `position: static` a <768px
- `main` z-index > footer z-index
- `header` z-index > `main` z-index
- `main` background opaco
- Footer rivelato a fondo scroll

---

## File toccati (scope chiuso — 3 file)

| File | Modifica |
| ---- | -------- |
| `frontend/src/styles/starwind.css` | Blocco sticky footer in `@layer components`: `[data-sticky-footer] main` relative/z-1/bg, `[data-sticky-footer] footer` sticky/bottom-0/z-0 |
| `frontend/src/layouts/Layout.astro` | `data-sticky-footer` su `<body>` |
| `frontend/e2e/sticky-footer.spec.ts` | 6 test geometrici desktop + mobile |

---

## Gate

| Gate | Stato |
| ---- | ----- |
| G1 `astro check` = 0 (nuovi errori) | ✅ |
| G2 build verde | ✅ |
| G3 prettier conforme | ✅ |
| G4 scope file = 3 file concordati | ✅ |
| G5 e2e Playwright 6/6 | ✅ |
| G6 audit visivo Andrea | ✅ |

---

## Debiti & decisioni

- **Background opaco su `<main>`**: aggiunto `background: var(--background)` via
  CSS gated (non classe Tailwind). Se il futuro interruttore CMS rimuove
  `data-sticky-footer`, il background torna trasparente automaticamente.
- **Nessun `--footer-h`**: percorso CSS-only. Se in futuro serve altezza footer
  misurata (es. spaziatore animato), introdurre modulo JS con ResizeObserver.
- **Nessuna ombra/arrotondamento** sul bordo del contenuto (v1 pulita).

---

## Da fare

- **Interruttore CMS** per attivare/disattivare il footer sticky (giro
  successivo — basta rendere `data-sticky-footer` condizionale a un'impostazione
  Strapi).
- Eventuale ombra/arrotondamento sul bordo del contenuto (scelta estetica futura).

---

## Oltre lo scope

- Tutto B1 (hero sticky, trigger header, `data-sticky-hero`) — invariato.
- Auto-hide header (Axis A) e transparent→solid (Axis B) — invariati.
- Tono/background dei blocchi — invariato.
