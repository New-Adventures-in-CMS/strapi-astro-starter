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
