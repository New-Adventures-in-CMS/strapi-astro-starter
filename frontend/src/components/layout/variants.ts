import { tv } from "tailwind-variants";

/** Vocabolario tone condiviso: usato da `section` e sottoinsiemi (es. `footerWrapper`). */
export type SectionTone = "default" | "muted" | "dark";

/**
 * Container variants — controls max-width and horizontal padding.
 *
 * Five-tier width vocabulary shared with chrome (header/footer):
 * - `prose` (~70ch ≈ 720px): optimized for readable text columns
 * - `default` (1200px): standard page container
 * - `contained` (1400px): full-featured layouts with more horizontal breathing room
 * - `full`: page-margin inset (`--page-margin-lg`) at every breakpoint — no max-width clamp
 * - `bleed`: edge-to-edge — no max-width, no horizontal padding
 */
export const container = tv({
  base: "mx-auto w-full px-6 md:px-8 lg:px-12",
  variants: {
    width: {
      prose: "max-w-[70ch]",
      default: "max-w-[1200px]",
      contained: "max-w-[1400px]",
      full: "max-w-none px-[var(--page-margin-lg)] md:px-[var(--page-margin-lg)] lg:px-[var(--page-margin-lg)]",
      bleed: "max-w-none px-0 md:px-0 lg:px-0",
    },
  },
  defaultVariants: { width: "default" },
});

/**
 * Header wrapper variants — controls the header's horizontal skin.
 *
 * - `full`: piena larghezza col solo inset `page-margin` (var `--page-margin-lg`,
 *   responsive per breakpoint), nessun clamp `max-width`. Non edge-to-edge —
 *   mantiene i margini di pagina editoriali.
 * - `contained`: riusa la geometria del token `container` variante `wide`
 *   (`max-w-[1400px]` + stesso padding), allineando l'header al layout dei contenuti.
 */
export const headerWrapper = tv({
  base: "flex w-full items-center justify-between py-5",
  variants: {
    width: {
      full: "px-[var(--page-margin-lg)]",
      contained: "mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12",
    },
  },
  defaultVariants: { width: "full" },
});

/**
 * Footer wrapper variants — slot-form.
 *
 * `width`: mirror del header per coerenza dell'impianto grafico.
 * - `full`: stesso inset `page-margin` dell'header `full` (var `--page-margin-lg`).
 * - `contained`: stessa geometria del token container condiviso con header `contained`.
 *
 * `tone`: sottoinsieme di `SectionTone` (senza `default`), coordinato con gli slot fg.
 * - `muted`: bg + fg dai token muted/foreground.
 * - `dark`: bg + fg dai token on-dark (`--section-dark-*`) — riusa il set già esistente
 *   in `starwind.css` (statement dark / header overlay). Nessun token colore nuovo.
 */
export const footerWrapper = tv({
  slots: {
    root: "py-16 md:py-20",
    title: "mb-4 text-sm font-semibold",
    link: "text-sm transition-colors",
    separator: "my-8",
    legal: "text-xs",
  },
  variants: {
    width: {
      full: { root: "px-[var(--page-margin-lg)]" },
      contained: { root: "mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12" },
    },
    tone: {
      muted: {
        root: "bg-muted text-foreground",
        title: "text-foreground",
        link: "text-muted-foreground hover:text-foreground",
        legal: "text-muted-foreground",
      },
      dark: {
        root: "bg-[var(--section-dark-bg)] text-[var(--section-dark-fg)]",
        title: "text-[var(--section-dark-fg)]",
        link: "text-[var(--section-dark-fg-muted)] hover:text-[var(--section-dark-fg)]",
        separator: "bg-[var(--section-dark-accent)]",
        legal: "text-[var(--section-dark-fg-subtle)]",
      },
    },
  },
  defaultVariants: { width: "full", tone: "dark" },
});

/**
 * Section variants — full-bleed wrapper with tone (background) and vertical rhythm.
 *
 * - `tone: default`: light background (bg-background)
 * - `tone: muted`: muted tone (bg-muted) for visual breathing
 * - `tone: dark`: high-contrast dark background with light text
 *
 * - `spacing: none`: py-0 (no vertical padding; for full-bleed media sections)
 * - `spacing: sm`: compact vertical rhythm
 * - `spacing: md`: moderate vertical rhythm
 * - `spacing: lg`: standard vertical rhythm
 * - `spacing: xl`: generous vertical rhythm (default)
 */
export const heroContent = tv({
  slots: { wrap: "flex", text: "" },
  variants: {
    align: {
      center: { wrap: "items-center justify-center", text: "text-center" },
      "top-left": {
        wrap: "items-start justify-start",
        text: "text-left ml-0 mr-auto max-w-[820px]",
      },
      "top-center": { wrap: "items-start justify-center", text: "text-center" },
      "top-right": {
        wrap: "items-start justify-end",
        text: "text-right mr-0 ml-auto max-w-[820px]",
      },
      "middle-left": {
        wrap: "items-center justify-start",
        text: "text-left ml-0 mr-auto max-w-[820px]",
      },
      "middle-right": {
        wrap: "items-center justify-end",
        text: "text-right mr-0 ml-auto max-w-[820px]",
      },
      "bottom-left": {
        wrap: "items-end justify-start",
        text: "text-left ml-0 mr-auto max-w-[820px]",
      },
      "bottom-center": {
        wrap: "items-end justify-center",
        text: "text-center",
      },
      "bottom-right": {
        wrap: "items-end justify-end",
        text: "text-right mr-0 ml-auto max-w-[820px]",
      },
    },
  },
  defaultVariants: { align: "center" },
});

export const section = tv({
  base: "w-full",
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-muted text-foreground",
      dark: "bg-[var(--section-dark-bg)] text-[var(--section-dark-fg)]",
    },
    spacing: {
      // BRIDGE — section.padding.* from nsp-ds-tokens; swap to var() at token-emission
      none: "py-0",
      sm: "py-4 md:py-6 lg:py-8",
      md: "py-6 md:py-8 lg:py-12",
      lg: "py-8 md:py-12 lg:py-20",
      xl: "py-10 md:py-16 lg:py-[120px]",
    },
  },
  defaultVariants: { tone: "default", spacing: "xl" },
});
