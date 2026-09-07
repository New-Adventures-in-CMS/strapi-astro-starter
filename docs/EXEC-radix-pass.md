# EXEC — Radix color pass

Executor: Claude Code (Opus). Read `SPEC-radix-pass.md` first — it is authoritative.
Work on a branch, verify on a clean clone, PR to `main`. Never trust "done" without the
gates below passing. Produce/maintain `STATUS-radix-pass.md` as you go.

Single file changes: `frontend/src/styles/starwind.css`. No component edits. No new deps.

---

## Phase 0 — Baseline capture (before any edit)

```bash
cd frontend
git switch -c feat/radix-pass
# Baseline screenshots for regression diff — light + dark, key views.
# (Use the existing Playwright setup; capture home, one content page, a dark-band
#  section, and the badge showcase, in both themes.)
npm run test:e2e            # must be green at baseline
astro check                 # record baseline error count (expect 0)
```
Record the baseline literal-audit numbers (should already be clean):
```bash
# Gate A — literals outside token layer in app code (expect 0)
grep -rnE '(neutral|slate|zinc|gray|stone|sky|green|amber|red|blue|emerald|rose)-[0-9]{2,3}|#[0-9a-fA-F]{3,8}\b|rgb a?\(|hsl\(|\b(bg|text|border|ring|fill|stroke|from|via|to|outline|decoration)-(white|black)\b' \
  src --include=*.astro --include=*.ts --include=*.tsx --include=*.css \
  | grep -v 'src/components/starwind/' | grep -v 'src/styles/starwind.css' | wc -l
```

**GATE 0:** baseline e2e green, `astro check` 0, Gate A = 0. Stop if not.

---

## Phase 1 — Apply the token layer

Edit `frontend/src/styles/starwind.css`:

1. **Keep unchanged:** the two `@theme` blocks' animation/font/type-scale/radius entries,
   and the entire `@theme inline` `--color-<role>: var(--role)` mapping list, and every
   `@layer base` / `@layer components` rule.
2. **Move** the `--section-dark-*` group **out of `@theme inline` into `:root`**.
3. **Replace** `:root` and `.dark` (and the moved section-dark group) with the target
   block in SPEC §5, verbatim. This introduces the inlined `--gray-*` raw layer, the
   single-mode semantic layer, the flat `--border`/`--input`, the status step-9 anchors,
   the `--blue-9` info extension, and the fixed section-dark block.
4. Delete any now-orphaned references to Tailwind palette vars in the file.

Do not touch `sheet/variants.ts` (`bg-black/80` scrim is a documented vendored
exception — see STATUS). Do not touch seed SVGs.

---

## Phase 2 — Verification gates

```bash
cd frontend
astro check                 # GATE 1: 0 errors
npm run build               # builds clean
npm run test:e2e            # GATE 2: green
```

**GATE 3 — Gate A still 0** (rerun the Phase-0 command). The invariant must hold.

**GATE 4 — rails are pure** (0 raw Tailwind-palette refs in the token file):
```bash
grep -nE 'var\(--color-(neutral|sky|amber|green|red|slate|zinc|stone)-|var\(--color-white\)|var\(--color-black\)' \
  src/styles/starwind.css | wc -l          # must be 0
```
(Sanity: `grep -c 'var(--gray-' src/styles/starwind.css` should be large;
`@theme inline` `--color-*: var(--<role>)` lines remain and are expected.)

**GATE 5 — resolved values** (spot check via a quick DOM probe or computed styles):
- `--background`: `#fcfcfc` (light) / `#111111` (dark)
- `--foreground`: `#202020` / `#eeeeee`
- `--primary`: `#202020` / `#eeeeee`  · `--primary-foreground`: `#fcfcfc` / `#111111`
- `--error`: `#e5484d`  · `--success`: `#30a46c`  · `--warning`: `#f76b15`  · `--info`: `#0090ff`
- `--section-dark-bg`: `#000000` in **both** themes (non-flip proof)
- `--section-dark-cta-fg`: `#202020` in **both** themes (non-flip proof)

Optional parity cross-check: for each neutral role, the value must equal the same gray
step in `/tmp/nsp` `dist/figma-variables.json`.

---

## Phase 3 — Visual regression (mandatory, both themes)

Systematic visual + rendering audit, not just behavioral. Compare against Phase-0
baseline. Expected-and-allowed deltas only: saturated solid status badges, faint dark
borders, `#202020`/`#eeeeee` foreground, subtle card elevation.

Checklist:
- [ ] Home hero immersive: header transparent state on dark, then solid state after
      scroll past hero — text/logo/nav legible in both.
- [ ] A normal content page (non-immersive header, solid from top).
- [ ] A `Section tone="dark"` band: bg pure black, fg white, CTA white-on-dark with
      near-black label, overlay gradients correct.
- [ ] Badge showcase: info/success/warning/error × { solid, soft, outline, text } —
      solid saturated, soft = alpha wash, contrast legible.
- [ ] Card surfaces: subtle elevation vs page reads correctly in dark.
- [ ] **Dark separation checkpoint:** header bottom + card edges. If header floats,
      escalate that selector only to `var(--gray-9)` (`stroke.default`); do NOT change
      `--border` globally. Record the escalation in STATUS if used.

---

## Phase 4 — Clean-clone gate + PR

```bash
cd /tmp && rm -rf sas-verify
git clone <repo-url> sas-verify && cd sas-verify
git switch feat/radix-pass
npm run install:all && npm run setup
npm run dev        # boots; CMS :1337, Astro :4321
# Re-run GATE 1–5 in the fresh clone. Then:
npm run test:e2e
```
Open PR only after every gate passes on the **clean clone**. PR description: link SPEC,
paste the Gate-4/Gate-5 outputs and before/after screenshots. Do not self-merge; wait
for gate review.

---

## Guardrails
- One file. No component edits. No dependencies added.
- If a mapped value cannot reproduce the intended behavior (e.g. a contrast failure on a
  real badge), stop and report — do not improvise a different step. The mapping is
  contract with Figma.
- Report `git log`/`git push` state explicitly; "done" means pushed + gates green on
  clean clone, with evidence.
