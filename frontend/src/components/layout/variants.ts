import { tv } from "tailwind-variants";

/**
 * Container variants — controls max-width and horizontal padding.
 *
 * - `prose` (~70ch ≈ 720px): optimized for readable text columns
 * - `default` (1200px): standard page container
 * - `wide` (1400px): full-featured layouts with more horizontal breathing room
 * - `full`: no max-width clamp, stretches to full viewport width (padding removed)
 */
export const container = tv({
  base: "mx-auto w-full px-6 md:px-8 lg:px-12",
  variants: {
    width: {
      prose: "max-w-[70ch]",
      default: "max-w-[1200px]",
      wide: "max-w-[1400px]",
      full: "max-w-none px-0 md:px-0 lg:px-0",
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
 * Footer wrapper variants — mirror del header per coerenza dell'impianto grafico.
 *
 * - `full`: stesso inset `page-margin` dell'header `full` (var `--page-margin-lg`).
 * - `contained`: stessa geometria del token container condiviso con header `contained`.
 */
export const footerWrapper = tv({
  base: "py-16 md:py-20",
  variants: {
    width: {
      full: "px-[var(--page-margin-lg)]",
      contained: "mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12",
    },
  },
  defaultVariants: { width: "full" },
});

/**
 * Section variants — full-bleed wrapper with tone (background) and vertical rhythm.
 *
 * - `tone: default`: light background (bg-background)
 * - `tone: muted`: muted tone (bg-muted) for visual breathing
 * - `tone: dark`: high-contrast dark background with light text
 *
 * - `spacing: default`: py-24 md:py-32 lg:py-40 (generous vertical padding)
 * - `spacing: sm`: py-16 md:py-20 (smaller sections for lists, grids)
 * - `spacing: none`: py-0 (no vertical padding; for full-bleed media sections)
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
      default: "py-24 md:py-32 lg:py-40",
      sm: "py-16 md:py-20",
      none: "py-0",
    },
  },
  defaultVariants: { tone: "default", spacing: "default" },
});
