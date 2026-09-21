import { tv } from "tailwind-variants";

// Full-bleed banda: popup is absolute inside the header, anchored to its bottom edge (top-full),
// spanning 100vw. Because the header carries a `transform` (auto-hide translateY), it establishes
// the containing block for the popup — so the banda follows the header's transform and stays
// glued to its bottom edge regardless of scroll or auto-hide state. Zero diagonal-gap by
// construction. Runtime writes inline `style.width`/`height` on both popup and viewport for morph;
// we override the width side with `!important` (Tailwind v4 trailing `!`) so the banda stays
// full-bleed regardless of content width, while letting the runtime drive height animation.

export const navigationMenuBandPopup = tv({
  base: [
    "absolute! left-0! top-full! w-screen! z-40",
    "bg-background text-foreground shadow-lg",
    "data-[state=closed]:pointer-events-none",
    "data-starting-style:opacity-0 data-ending-style:opacity-0",
    "transition-opacity duration-[0.25s] ease-out data-instant:transition-none",
  ],
});

export const navigationMenuBandViewport = tv({
  base: [
    "relative! w-full! overflow-hidden",
    "transition-[height] duration-[0.25s] ease-out data-instant:transition-none",
  ],
});
