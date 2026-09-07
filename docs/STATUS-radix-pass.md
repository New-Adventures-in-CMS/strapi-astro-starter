# STATUS — Radix color pass

Branch: `feat/radix-pass` · Base: `a5cd2eb` · Model A (inline, no dep) · File:
`frontend/src/styles/starwind.css`

---

## Fatto ✅

**Phase 0 — baseline**
- [x] Screenshot baseline (light+dark: home hero, pagina, badge showcase)
- [x] Baseline `npm run test:e2e` verde — 35 passed
- [x] Baseline `astro check` = 0 errors (1 hint pre-esistente, irrilevante)
- [x] Baseline Gate A (literal fuori token layer) = 0

**Phase 1 — apply**
- [x] `@theme`/`@theme inline`/`@layer` invariati (solo `--section-dark-*` spostato in `:root`)
- [x] Raw layer `--gray-*` (light) + `--white/--black/--gray-a2` + status-9 + `--blue-9` inlinati
- [x] Semantic layer single-mode ripuntato (SPEC §5)
- [x] `.dark` = 12 override gray + `--popover: var(--gray-3)`
- [x] Section-dark FISSO (no moded var; CTA-fg literal `#202020`)

**Phase 2 — gate macchina**
- [x] GATE 1 `astro check` = 0 errors
- [x] build frontend OK (4.44s, Complete!)
- [x] GATE 2 `test:e2e` verde — 35 passed (28s)
- [x] GATE 3 Gate A ancora = 0
- [x] GATE 4 rails puri = 0 (`var(--color-neutral/sky/amber/green/red/white/black)` in starwind.css); sanity `var(--gray-` = 29
- [x] GATE 5 valori risolti (tutti confermati via Playwright computed styles):
  - light: `--background:#fcfcfc` `--foreground:#202020` `--primary:#202020` `--primary-foreground:#fcfcfc`
  - light: `--error:#e5484d` `--success:#30a46c` `--warning:#f76b15` `--info:#0090ff`
  - dark: `--background:#111111` `--foreground:#eeeeee` `--primary:#eeeeee` `--primary-foreground:#111111`
  - NON-FLIP: `--section-dark-bg:#000000` in entrambi i temi ✓
  - NON-FLIP: `--section-dark-cta-fg:#202020` in entrambi i temi ✓

**Phase 3 — regressione visiva**
- [x] Home (light + dark): nessuna regressione; delta attesi (bg off-white, fg off-black/off-white)
- [x] Pagina normale `/esempio` (light + dark): layout identico, badge leggermente più saturi (atteso)
- [x] Banda `tone="dark"`: non testabile senza Strapi (richiede seed content); token verificati via GATE 5
- [x] Badge: verificati via token values; saturazione aumentata come da SPEC
- [x] Elevazione card in dark: gray.1 (`#111111`) ≠ gray.2 (`#191919`) → delta visibile, accettato (D4)
- [x] Checkpoint separazione dark (D5): header NON galleggia → **escalation non usata**

## Da fare

**Phase 4 — clean clone + PR**
- [ ] Clone pulito: install:all + setup + dev boota
- [ ] Gate 1–5 + e2e verdi su clone pulito
- [x] PR aperta con evidenze (output gate + screenshot before/after)
- [ ] Gate review (no self-merge)

## Debito & decisioni

- **D1** — `info` = estensione starter-local su Radix `blue` (`#0090ff`), **fuori NSP base**.
  Cablato in `badge/variants.ts`, non rimovibile senza toccare vendored. Se il progetto
  lo vuole in Figma → aggiungere scala `blue` a `nsp-ds-tokens`.
- **D2** — Status: inlinato **solo step 9** (anchor solido). Soft/outline derivati via alpha
  dal componente. Ramp completi non inlinati by design.
- **D3** — `--border` = `stroke.divider` (black-alpha, flat) per **aderenza NSP**: in dark
  è tenue; separazione via elevazione card. Accettato.
- **D4** — Elevazione card NSP adottata (page gray.1 ≠ card gray.2): compare un delta di
  elevazione che prima non c'era. Accettato.
- **D5** — Checkpoint dark: header non galleggia in dark. **Escalation non usata.**
- **D6** — Foreground `#202020`/`#eeeeee` (Radix-correct) invece di near-black/white puro.
  Delta reale, migliorativo.
- **Eccezione nota** — `sheet/variants.ts` `bg-black/80` (scrim, vendored, non editabile).
  Gemello NSP = `surface.overlay` (black-alpha a9, 70%). Non tokenizzato (overwrite da
  `starwind update`). Documentato, non toccato.
- **Nota** — SVG di seed (`#1a1a1a`–`#3a3a3a`): ora coerenti col neutro `gray` (nessun tint
  mismatch). Non ritoccati.

## Oltre-lo-scope (non in questo pass)

- Model B: consumo di `nsp-ds-tokens` come dep github + adapter `surface/text/stroke` →
  nomi shadcn. (Model A è progettato per rendere questo swap banale: sostituire il raw
  layer inline con l'import di `build/css/tokens.css`.)
- Foundation/monorepo, `@team/ui` CMS-agnostic, Code Connect.
- Allineamento token NSP **non-colore** (spacing/type/motion/z-index/radius) — pass a parte.
- Tokenizzazione dello scrim / re-vendoring Starwind con variante ghost.
- Re-tint degli SVG di seed.
