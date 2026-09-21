import { tv } from "tailwind-variants";

// Full-bleed banda via Positioner: Runtime places the Positioner under the trigger
// (side=bottom, sideOffset=0); we force it edge-to-edge (left:0, w:100vw, no max)
// so the popup extends across the whole viewport. Popup fills the Positioner (w-full),
// Viewport is the height-animated container that morphs between panels.

export const navigationMenuBandPositioner = tv({
  base: [
    // absolute! → keeps Positioner out of the header's flex flow so the nav
    // list doesn't wrap. Sibling of List inside Root; combined with `static!`
    // on Root, its containing-block resolves up to <header> (fixed = a CB).
    // top-full! (top: 100%) with CB=header lands the popup at header.bottom;
    // overrides the Runtime's inline `top` (trigger-bottom via floating-ui).
    "absolute! left-0! top-full! w-screen! max-w-none! z-40",
    "pointer-events-none",
  ],
});

export const navigationMenuBandPopup = tv({
  base: [
    "pointer-events-auto w-full!",
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
