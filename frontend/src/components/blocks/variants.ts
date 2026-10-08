import { tv } from "tailwind-variants";

export const imageText = tv({
  slots: {
    grid: "grid grid-cols-1 md:grid-cols-2 items-center",
    imageCol: "",
    image: "w-full object-cover aspect-[4/3]",
    textCol: "",
  },
  variants: {
    width: {
      contained: {
        grid: "gap-10 md:gap-16",
        image: "rounded-lg",
      },
      full: {
        grid: "gap-10 md:gap-16",
        image: "rounded-lg",
      },
      bleed: {
        grid: "gap-0",
      },
    },
    imagePosition: {
      left: {
        imageCol: "md:order-1",
        textCol: "md:order-2",
      },
      right: {
        imageCol: "md:order-2",
        textCol: "md:order-1",
      },
    },
  },
  compoundVariants: [
    // BRIDGE — padding values from nsp-ds-tokens section.padding / page-margin scales
    // bleed + image left: image flush left, text padded right
    {
      width: "bleed",
      imagePosition: "left",
      class: {
        image: "rounded-none",
        textCol: "px-[var(--page-margin-lg)] md:pl-16 md:pr-20 lg:pl-[120px] lg:pr-[160px]",
      },
    },
    // bleed + image right: image flush right, text padded left
    {
      width: "bleed",
      imagePosition: "right",
      class: {
        image: "rounded-none",
        textCol: "px-[var(--page-margin-lg)] md:pr-16 md:pl-20 lg:pr-[120px] lg:pl-[160px]",
      },
    },
  ],
  defaultVariants: {
    width: "contained",
    imagePosition: "left",
  },
});

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
 * - `controls`: content-aligned row for prev/next and the progress bar (inside
 *   the `contained` container, NOT absolutely positioned on the bleeding viewport).
 * - `navBtn`: round icon button for prev/next.
 * - `scrollbar`: thin track that fills the row; progress indicator.
 * - `scrollbarThumb`: moving thumb — width is runtime (`1/snapCount`), position
 *   via `translateX`; width stays off here so JS owns it.
 * - `dots`: container slot for the skeleton-generated dot buttons (dormant variant).
 */
export const carousel = {
  viewport: tv({ base: "overflow-hidden [margin-inline-end:calc(50%-50vw)]" }),
  track: tv({ base: "flex -ml-6 touch-pan-y" }),
  slide: tv({
    base: "pl-6 basis-[82%] sm:basis-[46%] lg:basis-[31%] shrink-0 grow-0 min-w-0",
  }),
  controls: tv({ base: "mt-8 flex items-center gap-4" }),
  navBtn: tv({
    base: "rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed",
  }),
  scrollbar: tv({
    base: "relative order-first flex-1 h-1 overflow-hidden rounded-full bg-border/50",
  }),
  scrollbarThumb: tv({
    base: "block h-full rounded-full bg-foreground transition-transform duration-300 ease-out",
  }),
  dots: tv({ base: "ml-auto flex items-center gap-2" }),
} as const;
