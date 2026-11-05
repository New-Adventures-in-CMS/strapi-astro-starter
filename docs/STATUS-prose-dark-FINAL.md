# STATUS — Dark Section readability (FINAL)

Branch `fix/prose-dark` — commits `b3e9de3`, `101993e`, `4f9928b`  
Base: `origin/main` = `c6346fd`

## Recon

### Prose wrapper shared
Both `BlockRichText.astro` and `BlockFaq.astro` (accordion answers) render through
the same Starwind `<Prose>` component → `<div data-sw-prose class="sw-prose ...">`.
One CSS block covers both.

### Prose color variables (complete map)

| Variable | Default (light) |
|----------|----------------|
| `--sw-prose-color` | `--alpha(var(--foreground) / 80%)` |
| `--sw-prose-heading-color` | `var(--foreground)` |
| `--sw-prose-list-marker-color` | `var(--muted-foreground)` |
| `--sw-prose-link-color` | `var(--foreground)` |
| `--sw-prose-link-decoration-color` | `var(--primary-accent)` |
| `--sw-prose-link-hover-color` | `var(--primary-accent)` |
| `--sw-prose-strong-color` | `var(--foreground)` |
| `--sw-prose-blockquote-color` | `var(--foreground)` |
| `--sw-prose-blockquote-border-color` | `var(--border)` |
| `--sw-prose-code-bg` | `var(--muted)` |
| `--sw-prose-code-color` | `var(--foreground)` |
| `--sw-prose-pre-border-color` | `var(--border)` |
| `--sw-prose-table-heading-color` | `var(--foreground)` |
| `--sw-prose-table-border-color` | `var(--border)` |
| `--sw-prose-media-border-color` | `var(--border)` |
| `--sw-prose-highlight-color` | `var(--foreground)` |
| `--sw-prose-highlight-bg-color` | `--alpha(var(--warning) / 30%)` |

Inline `var(--foreground)` in: `dt`, `summary`.  
Inline `var(--muted-foreground)` in: `figcaption`, `kbd`.  
Inline `var(--muted)` in: `kbd` background.  
Inline `var(--border)` in: `hr`, `details`.  
Inline `var(--primary-accent)` in: `details` hover border.

All resolve through five root tokens: `--foreground`, `--muted-foreground`,
`--border`, `--muted`, `--primary-accent`.

### Section dark tokens (from `starwind.css`)

| Token | Value |
|-------|-------|
| `--section-dark-fg` | `var(--white)` |
| `--section-dark-fg-muted` | `color-mix(in srgb, var(--white) 80%, transparent)` |
| `--section-dark-fg-subtle` | `color-mix(in srgb, var(--white) 70%, transparent)` |
| `--section-dark-accent` | `color-mix(in srgb, var(--white) 8%, transparent)` |

## CSS scoping selector

`[data-tone="dark"] .sw-prose`

Section.astro gained a `data-tone={tone}` attribute (1-line addition).
`layout/variants.ts` untouched. The attribute is a pure data hook — no behavioral
change.

## Fix: root token remapping

```css
[data-tone="dark"] .sw-prose {
  --foreground: var(--section-dark-fg);
  --muted-foreground: var(--section-dark-fg-muted);
  --border: var(--section-dark-accent);
  --muted: var(--section-dark-accent);
  --primary-accent: var(--section-dark-fg-muted);
  --sw-prose-link-hover-color: var(--section-dark-fg);
}
```

Five root tokens + one explicit `--sw-prose-link-hover-color` override (full
brightness on hover, per design decision: links go clear inside dark sections).

## Fix 2: FAQ accordion header hover (commit `101993e`)

### Recon
Accordion trigger (`AccordionTrigger.astro`) uses `hover:text-muted-foreground`
(from `accordion/variants.ts` line 23). On dark section, `--muted-foreground`
is dark gray → near-invisible on black background. Icon (`ChevronDown` SVG)
inherits via `currentColor` — same token, both affected.

Focus-visible adds ring only, no text color change → text stays at inherited
`--section-dark-fg` (white) → already fine.

### Fix
```css
[data-tone="dark"] [data-slot="accordion-trigger"] {
  --muted-foreground: var(--section-dark-fg-muted);
}
```

Override `--muted-foreground` on the trigger element inside `[data-tone="dark"]`.
`hover:text-muted-foreground` then resolves to 80% white. One token, covers
both title and icon. Added to `starwind.css` after section-dark token block.

## Gate results

### Prose dark (commit `b3e9de3`)

| Gate | Result |
|------|--------|
| G1 `astro check` | 0 errors |
| G2 `npm run build` | green |
| G3 skeleton + variants.ts diff | empty |
| G4 color-literals | zero |
| G5 visual audit | **pending Andrea** |
| G6 scope | `Section.astro` + `prose/styles.css` only |

### FAQ header hover (commit `101993e`)

| Gate | Result |
|------|--------|
| G1 `astro check` | 0 errors |
| G2 `npm run build` | green |
| G3 skeleton + variants.ts diff | empty |
| G4 color-literals | zero |
| G5 visual audit | **pending Andrea** |
| G6 scope | `starwind.css` only |

## Fix 3: FAQ accordion item separators (commit `4f9928b`)

### Recon
Accordion items (`AccordionItem.astro`) use `border-b border-border first:border-t`
(from `accordion/variants.ts` line 16). `border-border` resolves to `--border` =
`var(--gray-a2)` = `#0000001a` (black ~10%). On dark background, black at 10%
opacity is invisible.

### Token choice
`--section-dark-accent` = `color-mix(in srgb, var(--white) 8%, transparent)`.
Same token Prose on-dark already uses for `--border` (line 601 of
`prose/styles.css`), and same token `variants.ts` uses for dark section
separators (`separator: "bg-[var(--section-dark-accent)]"`). White at 8%:
subtle/tenue, not full-intensity foreground.

### Fix
```css
[data-tone="dark"] [data-slot="accordion-item"] {
  --border: var(--section-dark-accent);
}
```

Remap `--border` on accordion items inside `[data-tone="dark"]`. Added to
`starwind.css` right above existing trigger fix, under unified comment
"Accordion inside dark Section".

### Gate results

| Gate | Result |
|------|--------|
| G1 `astro check` | 0 errors |
| G2 `npm run build` | green |
| G3 skeleton + variants.ts diff | empty |
| G4 color-literals | zero |
| G5 visual audit | **pending Andrea** |
| G6 scope | `starwind.css` only |

## Merge commands (for Andrea)

Branch `fix/prose-dark` now covers Prose on-dark + FAQ header hover + FAQ item
separators on-dark. Dark debt closed; only Giro 2 (gallery carousel inline) remains.

```bash
git checkout main
git pull origin main
# verify main is at c6346fd
git merge --squash fix/prose-dark
git commit -m "fix(dark): Prose color inversion + FAQ header hover + item separators in dark sections"
npm run build          # gate on main
git push origin main
git rev-parse origin/main  # verify
```
