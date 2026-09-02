# STATUS / TODO — `feat/design-polish`

Tracker unico per chiudere il branch. Rif: `CC-spec-design-polish.md` (intento/valori), `CC-exec-design-polish.md` (esecuzione).
HEAD: `eb58436` · 24 commit su main · **nessun merge** (decide Andrea).

**Gate 1**: ✅ passato · **Gate 2**: 🟡 sostanzialmente passato, in attesa re-review visiva di Task 11.

---

## ✅ Fatto (shippato sul branch)

- [x] **T0** Branch + baseline verde
- [x] **T1** Fonts API (Sora+Inter self-hosted) + consolidamento CSS + scala fluida + `--primary` near-black + tono dark
- [x] **T2** Primitives `Section`/`Container` (+`variants.ts`) + shell (main/header/footer) senza max-w orfani
- [x] **T3** Hero full-bleed + home di riferimento (Gate 1)
- [x] **T4** Rollout blocchi (card-grid, image-text, rich-text) + `SectionHeader`
- [x] **T4.5** Eyebrow senza graffe + e2e verificati (artefatto reuseExistingServer, non regressione)
- [x] **T4.6** Hero immersive + header overlay (asse sfondo)
- [x] **T4.6b** Hardening overlay: selettore reale, hover/open on-dark, Header/Footer tokenizzati; fix brand "sbiadito" (regole solid simmetriche)
- [x] **T5** Pagine/stati residui + grep-gate color-literals esteso a tutto `frontend/src`
- [x] **T6** Seed copy (no-lorem, editoriale) + 2 SVG CC0 hero/about via upload-service idempotente
- [x] **T9** Header v2 — auto-hide direzionale globale (asse presenza) + content offset + logo inline
- [x] **T10** Immagini su tutte le 9 card (seed) + fix contrasto indice numerico + rich-text `align`
- [x] **T11** Fix nav underline su TUTTE le voci + underline animato scaleX + logo lockup unico + align `right`

---

## ⬜ Da fare (per chiudere il branch)

### T7 — Docs (single source of truth)

- [x] SETUP.md — sezione "Design system": token, scala tipografica, uso `Section`/`Container`/`SectionHeader` con esempi, toni di sezione, **come aggiungere un tono**
- [x] **Swap font** via Fonts API (l'unico punto da toccare)
- [x] **Header v2** documentato: due assi (auto-hide globale + immersive transparent/solid), underline nav, swap logo
- [x] **Sostituzione logo**: un unico SVG lockup, `currentColor`; usare **path outlined** non `<text>`; fallback due-varianti per multicolore
- [x] **Hero immersive**: flag e quando usarlo
- [x] **Rich-text align** (left/center/right)
- [x] **Contenuto/immagini demo**: SVG CC0 + CREDITS, come l'agente ricrea/sostituisce
- [x] **Reset DB robusto**: `npm run db:reset` / `find . -path '*/.tmp/data.db' -delete`; caveat path documentato; `rm cms/.tmp/data.db` hardcoded rimosso da SETUP, CLAUDE, GUIDA
- [x] GUIDA.md (IT), README (descrizione aggiornata), CLAUDE.md (nuovi primitives + dove vivono le misure)
- [x] **Convenzione worktree** documentata (SETUP.md + CLAUDE.md)

### T8 — Verifica finale

- [ ] **Hardening e2e**: `reuseExistingServer:false` (o kill server prima) → i 2 fail submenu-within-viewport devono sparire; suite piena verde su run pulito
- [ ] Confermare che i test overlay/auto-hide siano **reali e committati** (fixture route-mock), non scratch
- [ ] astro check 0 · vitest · build · e2e — tutti verdi
- [ ] Pass responsive manuale (≈380 / tablet / desktop-wide) su home + una pagina a blocchi
- [ ] **Clean-clone** end-to-end col reset DB corretto
- [ ] Report finale: `git log --oneline main..feat/design-polish`, output check, push confermato

### Gate finale

- [ ] **Gate 2 re-review** (Andrea): underline animato + logo lockup + align right + fix nav su tutte le voci
- [ ] **Decisione merge** (Andrea) — `--no-ff`, poi cancellare il branch

---

## 🔧 Debito / decisioni da prendere prima del merge

- [ ] **`!important` scoped** (bg trigger + link nav): Starwind non ha variante ghost → override CSS. Decidere: accettare come eccezione documentata, oppure ripulire se emerge un override più pulito
- [ ] **Logo placeholder** = `<text>` vivo: ok come segnaposto, ma documentare che il lockup reale va outlined
- [ ] **MCP guardrails**: abbiamo aggiunto solo _campi_ (immersive/eyebrow/lead/tone/align), non nuovi content-type → probabilmente nessun aggiornamento; verificare comunque

---

## 🌅 Oltre questo branch (non perdere — non è lavoro di design-polish)

- Radix token pass, allineato al design system Figma (il vincolo semantic-only è già rispettato → sarà uno swap di _valori_, zero churn componenti)
- Chat dedicata: architettura foundation evolutiva / monorepo — clone-vs-dependency, `@team/ui` portabile, parità token Figma↔codice + Code Connect
- Decisione plugin di terze parti (voce E dello SPEC originale): eccezione documentata o cleanup a native
