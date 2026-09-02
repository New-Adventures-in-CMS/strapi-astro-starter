# STATUS / TODO — `feat/design-polish`

Tracker unico per chiudere il branch. Rif: `CC-spec-design-polish.md` (intento/valori), `CC-exec-design-polish.md` (esecuzione).
HEAD: `221683a` · 35 commit su main · **nessun merge** (decide Andrea).

**Gate 1**: ✅ passato · **Gate 2**: 🟡 in attesa re-review visiva (Andrea) + pass responsive manuale.

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

- [x] **Hardening e2e**: `reuseExistingServer:false` → submit-within-viewport fail spariti; assertion `matrix(0` fix (scaleX numerico); **31/31 pass** su server fresco
- [x] Test overlay/auto-hide/underline **reali e committati** in `frontend/e2e/navigation.spec.ts` (nessun scratch)
- [x] `astro check` 0 errori · `vitest` 27/27 · `build` ok · `test:e2e` 31/31
- [ ] **Pass responsive manuale** (≈380 / tablet / desktop-wide) su home immersive + pagina a blocchi — **da fare: Andrea**
- [ ] **Clean-clone** end-to-end con `npm run db:reset` — **da fare: Andrea**
- [x] Report finale: `git log --oneline main..feat/design-polish` — 35 commit, push `221683a` confermato

### Gate finale

- [ ] **Gate 2 re-review** (Andrea): underline animato + logo lockup + align right + fix nav su tutte le voci
- [ ] **Decisione merge** (Andrea) — `--no-ff`, poi cancellare il branch

---

## 🔧 Debito / decisioni da prendere prima del merge

- [ ] **`!important` scoped** (bg trigger + link nav): Starwind non ha variante ghost → override CSS. Decidere: accettare come eccezione documentata, oppure ripulire se emerge un override più pulito
- [x] **Logo placeholder**: era `<text>` — ora outlined SVG paths (`51fff82`). Documentato in SETUP.md → "Logo".
- [x] **MCP guardrails**: aggiunti solo _campi_, non nuovi content-type → nessun aggiornamento `.claude/settings.json` necessario.

---

## 🌅 Oltre questo branch (non perdere — non è lavoro di design-polish)

- Radix token pass, allineato al design system Figma (il vincolo semantic-only è già rispettato → sarà uno swap di _valori_, zero churn componenti)
- Chat dedicata: architettura foundation evolutiva / monorepo — clone-vs-dependency, `@team/ui` portabile, parità token Figma↔codice + Code Connect
- Decisione plugin di terze parti (voce E dello SPEC originale): eccezione documentata o cleanup a native
