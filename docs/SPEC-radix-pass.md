# SPEC — Radix color pass (Model A: faithful NSP downstream)

**Repo:** `New-Adventures-in-CMS/strapi-astro-starter` · base `a5cd2eb` (main)
**Scope file:** `frontend/src/styles/starwind.css` only. Zero component churn.
**Author role:** strategist/spec. **Executor:** Claude Code.

---

## 1. Why this pass, and what it is NOT

The starter's token layer is already two-tier and **semantic-only** (verified: 0 color
literals outside the token layer in app code). Its raw layer currently references
Tailwind's built-in palette (`--color-neutral-*`, `--color-sky-*`, `--color-amber-*`…).

This pass repoints the raw layer to **Radix Colors**, sourced to match the team's
code-first token system **`nsp-ds-tokens`** (base library, brand-poli extracted). The
result: the starter's resolved colors are **identical, hex-for-hex, to the Figma
variables** that `nsp-ds-tokens` emits — parity by construction — **without taking a
runtime dependency** (Model A). Values are inlined; the starter stays clone-and-run and
generic/open-source-able.

This is **not** a visual redesign and **not** an adapter to NSP's semantic vocabulary.
The starter keeps its shadcn/Starwind semantic names (`--background`, `--primary`,
`--muted-foreground`, `--border`…). We only change what the raw layer *is* and which
Radix step each semantic role reads.

**Verified fact:** NSP `gray` == official `@radix-ui/colors` `gray`, hex-for-hex, light
and dark. So "source from NSP" and "source from Radix" are the same values.

---

## 2. Locked decisions

| # | Decision | Choice |
|---|---|---|
| Neutral | Which Radix neutral | **`gray`** (pure achromatic) — matches NSP base default |
| Status | red / green / orange (NSP base). **No amber, no sky.** | warning→orange, error→red, success→green |
| Status style | token = **solid Radix step 9**; soft/outline derived by the badge component via alpha (`bg-*/10`, `border-*/40`, `text-*`) | solid-token model |
| `info` | Not in NSP base. **Kept** (hard-wired across `badge/variants.ts`) as a **starter-local extension on Radix `blue`** (step 9). Marked "outside NSP base." |
| primary | Starter is brand-less → its monochrome near-black primary maps to the **neutral** ramp, not `surface.primary`. `gray.12` is `#202020`→`#eeeeee`, i.e. exactly the light↔dark flip wanted, via one moded token. |
| Border in dark | **Full NSP adherence:** `--border` → `stroke.divider` = black-alpha (flat). Faint in dark; separation carried by card elevation. |
| Card elevation | **Full NSP adherence:** `surface.page` (gray.1) ≠ `surface.card` (gray.2) → subtle elevation appears. |
| Architecture | **Moded primitives** (`--gray-*` flip in `.dark`); semantic layer single-mode + cascade. `.dark` collapses to primitive overrides + one dual-step token. |

**Heads-up (not a decision):** foreground becomes `#202020`/`#eeeeee` (Radix-correct),
not pure near-black/white. Slightly softer, intentional.

---

## 3. Mapping table (authoritative — verify hex-per-hex against Figma)

Neutral spine — each row is **single-step, same index both modes** (flips via primitive):

| Starter token | NSP role | gray step | light → dark |
|---|---|---|---|
| `--background` | `surface.page` | 1 | `#fcfcfc → #111111` |
| `--foreground` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--card` | `surface.card` | 2 | `#f9f9f9 → #191919` |
| `--card-foreground` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--popover` | `surface.floating` | **1 → 3** (dual) | `#fcfcfc → #222222` |
| `--popover-foreground` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--primary` | neutral solid | 12 | `#202020 → #eeeeee` |
| `--primary-foreground` | on-neutral | 1 | `#fcfcfc → #111111` |
| `--primary-accent` | neutral emphasis | 11 | `#646464 → #b4b4b4` |
| `--secondary` | `surface.neutral` | 3 | `#f0f0f0 → #222222` |
| `--secondary-foreground` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--secondary-accent` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--muted` | subtle bg | 2 | `#f9f9f9 → #191919` |
| `--muted-foreground` | `text.subtle` | 11 | `#646464 → #b4b4b4` |
| `--accent` | hover surface | 3 | `#f0f0f0 → #222222` |
| `--accent-foreground` | `text.default` | 12 | `#202020 → #eeeeee` |
| `--border` | `stroke.divider` | a2 (black-alpha) | `#0000001a` (flat) |
| `--input` | `stroke.default` | 9 | `#8d8d8d → #6e6e6e` |
| `--outline` | `stroke.focus-ring` | 12 | `#202020 → #eeeeee` |

Status — token = solid step 9 (identical both modes), foreground = black:

| Starter token | source | value |
|---|---|---|
| `--error` / `--error-foreground` | red.9 / black | `#e5484d` / `#000000` |
| `--success` / `--success-foreground` | green.9 / black | `#30a46c` / `#000000` |
| `--warning` / `--warning-foreground` | orange.9 / black | `#f76b15` / `#000000` |
| `--info` / `--info-foreground` | **blue.9** (ext) / black | `#0090ff` / `#000000` |

Sidebar tokens mirror the neutral roles (starter-internal; NSP has no sidebar vocab):
`sidebar-background`→gray.2, `-foreground`→12, `-primary`→12, `-primary-foreground`→1,
`-accent`→3, `-accent-foreground`→12, `-border`→a2, `-outline`→12. All single-step →
cascade in dark, no `.dark` sidebar block.

Section-dark band — **FIXED, must not read moded `--gray-*`** (see trap #2):
`--section-dark-bg`→`#000` (`surface.dark`), `--section-dark-fg`→`#fff` (`text.on-dark`),
CTA bg→`#fff`, CTA fg→**literal `#202020`** (NOT `var(--gray-12)`).

---

## 4. Two correctness traps (a naive swap breaks both)

1. **Monochrome primary is `gray.12`, not `gray.9`.** Radix step 9 is a *mid* gray
   (`#8d8d8d`). The near-black solid is step 12. `--primary → var(--gray-12)`,
   `--primary-foreground → var(--gray-1)` — both flip correctly with the primitive.

2. **`--section-dark-*` must NOT flip.** The dark band is dark in *both* page themes.
   If it read the moded `--gray-*`, dark mode would invert it. Anchor it on the flat
   `--white`/`--black` primitives and, for CTA foreground, a **literal `#202020`** —
   never `var(--gray-12)`. NSP solves this natively: `surface.dark = neutral.black`
   (flat `#000`) + `text.on-dark = neutral.0` (flat `#fff`).

---

## 5. Target state — full color section of `starwind.css`

Replace the current raw-palette references + `:root`/`.dark`/`--section-dark-*` with the
block below. **`@theme inline` `--color-*` mappings, radius, fonts, type scale, and all
`@layer` rules stay byte-for-byte unchanged.** Move the `--section-dark-*` group out of
`@theme inline` into `:root` (it now uses fixed values).

```css
:root {
  /* ── RAW LAYER — Radix ramps (light), inlined. Do NOT expose as utilities. ── */
  --gray-1:#fcfcfc; --gray-2:#f9f9f9; --gray-3:#f0f0f0; --gray-4:#e8e8e8;
  --gray-5:#e0e0e0; --gray-6:#d9d9d9; --gray-7:#cecece; --gray-8:#bbbbbb;
  --gray-9:#8d8d8d; --gray-10:#838383; --gray-11:#646464; --gray-12:#202020;
  --gray-a2:#0000001a;                 /* black-alpha a2 — flat both modes */
  --white:#ffffff; --black:#000000;    /* flat, non-moded */
  --red-9:#e5484d; --green-9:#30a46c; --orange-9:#f76b15; /* status anchors (mode-invariant) */
  --blue-9:#0090ff;                    /* info — starter-local extension, outside NSP base */

  /* ── SEMANTIC LAYER — single-mode; flips via primitive ── */
  --background: var(--gray-1);
  --foreground: var(--gray-12);
  --card: var(--gray-2);
  --card-foreground: var(--gray-12);
  --popover: var(--gray-1);            /* dual-step: dark override below */
  --popover-foreground: var(--gray-12);
  --primary: var(--gray-12);
  --primary-foreground: var(--gray-1);
  --primary-accent: var(--gray-11);
  --secondary: var(--gray-3);
  --secondary-foreground: var(--gray-12);
  --secondary-accent: var(--gray-12);
  --muted: var(--gray-2);
  --muted-foreground: var(--gray-11);
  --accent: var(--gray-3);
  --accent-foreground: var(--gray-12);
  --info: var(--blue-9);       --info-foreground: var(--black);
  --success: var(--green-9);   --success-foreground: var(--black);
  --warning: var(--orange-9);  --warning-foreground: var(--black);
  --error: var(--red-9);       --error-foreground: var(--black);
  --border: var(--gray-a2);
  --input: var(--gray-9);
  --outline: var(--gray-12);
  --radius: 0.625rem;
  --header-h: 4.5rem;

  /* sidebar — mirrors neutral roles, single-mode */
  --sidebar-background: var(--gray-2);
  --sidebar-foreground: var(--gray-12);
  --sidebar-primary: var(--gray-12);
  --sidebar-primary-foreground: var(--gray-1);
  --sidebar-accent: var(--gray-3);
  --sidebar-accent-foreground: var(--gray-12);
  --sidebar-border: var(--gray-a2);
  --sidebar-outline: var(--gray-12);

  /* ── SECTION-DARK — permanent dark band. FIXED. Never reads moded --gray-*. ── */
  --section-dark-bg: var(--black);
  --section-dark-fg: var(--white);
  --section-dark-fg-muted: color-mix(in srgb, var(--white) 80%, transparent);
  --section-dark-fg-subtle: color-mix(in srgb, var(--white) 70%, transparent);
  --section-dark-cta-bg: var(--white);
  --section-dark-cta-fg: #202020;      /* literal near-black — NOT var(--gray-12) */
  --section-dark-cta-bg-hover: color-mix(in srgb, var(--white) 90%, transparent);
  --section-dark-overlay-from: color-mix(in srgb, var(--black) 70%, transparent);
  --section-dark-overlay-via: color-mix(in srgb, var(--black) 50%, transparent);
  --section-dark-overlay-to: color-mix(in srgb, var(--black) 30%, transparent);
  --section-dark-accent: color-mix(in srgb, var(--white) 8%, transparent);
}

.dark {
  /* Only the primitive ramp flips. Everything semantic cascades. */
  --gray-1:#111111; --gray-2:#191919; --gray-3:#222222; --gray-4:#2a2a2a;
  --gray-5:#313131; --gray-6:#3a3a3a; --gray-7:#484848; --gray-8:#606060;
  --gray-9:#6e6e6e; --gray-10:#7b7b7b; --gray-11:#b4b4b4; --gray-12:#eeeeee;
  /* --gray-a2 stays #0000001a (NSP divider is flat); status-9 identical both modes */

  /* the single dual-step semantic token */
  --popover: var(--gray-3);
}
```

Notes for the executor:
- Do not add `--gray-*` to `@theme` — keeping them as plain `:root` props means no
  `bg-gray-3` utilities are generated, preserving the semantic-only constraint.
- Status hues carry **only step 9** (the solid anchor). Full ramps are intentionally not
  inlined; soft/outline badge appearances are alpha-derived by the component. If a
  project later needs full status ramps, source them from `@radix-ui/colors`.
- The old dark `--alpha(var(--color-neutral-50) / 10%)` border and `/15%` input are gone,
  replaced by the flat `--border`/`--input` above.

---

## 6. Acceptance (merge gate)

Machine-checkable:
1. `astro check` → 0 errors. Frontend build passes.
2. `npm run test:e2e` → green (Playwright already `reuseExistingServer:false`).
3. **Grep gate A** (unchanged invariant): 0 color literals outside the token layer in
   app code (excluding vendored starwind + `starwind.css`).
4. **Grep gate B** (rails are pure): 0 raw Tailwind-palette references in `starwind.css`
   — i.e. no `var(--color-neutral-`, `var(--color-sky-`, `var(--color-amber-`,
   `var(--color-green-`, `var(--color-red-`, `var(--color-white)`, `var(--color-black)`.
   (The `@theme inline` `--color-<role>: var(--role)` mappings are semantic exposure and
   stay — they are not palette refs.)
5. Resolved-value spot check: computed `--background` = `#fcfcfc`/`#111111`, `--primary`
   = `#202020`/`#eeeeee`, `--error` = `#e5484d`. Optionally diff against
   `nsp-ds-tokens/dist/figma-variables.json` for the mapped roles.

Visual regression (before/after, near-identical except the documented deltas):
6. Light + dark × { home immersive hero (header transparent→solid), a normal page,
   a card on the dark band, the full badge set: info/success/warning/error in solid +
   soft appearances }.
7. **Dark-mode separation checkpoint** (the divider-alpha consequence): header bottom
   edge and card edges rely on elevation, not a visible rule. If the header reads as
   floating, escalate *that spot only* to `stroke.default` (`var(--gray-9)`); do not
   change `--border` globally.

Expected intentional deltas: solid success/warning/info badges become saturated (were
pale); dark borders become faint; foreground is `#202020`/`#eeeeee`.
