import { tv } from "tailwind-variants";

/**
 * Carousel block variants — peek rail with right-bleed.
 *
 * All measures (basis widths, margin-inline-end bleed, gap) live here so the
 * `.astro` stays free of layout literals (`calc`, `basis-[`, `margin-inline-end`).
 *
 * - `viewport`: Embla's viewport slot. `overflow-hidden` clips the rail; the
 *   `margin-inline-end: calc(50% - 50vw)` extends the right edge to the viewport
 *   boundary so the last visible slide bleeds off-screen while the left edge
 *   stays aligned with the `contained` container.
 * - `track`: flex row the skeleton drives.
 * - `slide`: peek sizing — one card at mobile with a visible sliver of the next;
 *   two with sliver at tablet; three with sliver at desktop. Calibrate as needed.
 * - `controls`: content-aligned row for prev/next/dots (inside the `contained`
 *   container, NOT absolutely positioned on the bleeding viewport).
 * - `navBtn`: round icon button for prev/next.
 * - `dots`: container for the skeleton-generated dot buttons.
 */
export const carousel = {
  viewport: tv({ base: "overflow-hidden [margin-inline-end:calc(50%-50vw)]" }),
  track: tv({ base: "flex gap-6 touch-pan-y" }),
  slide: tv({
    base: "basis-[82%] sm:basis-[46%] lg:basis-[31%] shrink-0 grow-0 min-w-0",
  }),
  controls: tv({ base: "mt-8 flex items-center justify-end gap-3" }),
  navBtn: tv({
    base: "rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed",
  }),
  dots: tv({ base: "ml-auto flex items-center gap-2" }),
} as const;
