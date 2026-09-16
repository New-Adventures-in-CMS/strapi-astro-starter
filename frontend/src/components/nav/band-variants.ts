import { tv } from "tailwind-variants";

// Full-bleed banda: popup sits fixed under the header spanning 100vw; viewport fills popup width.
// Runtime writes inline `style.width`/`height` on both popup and viewport for morph;
// we override the width side with `!important` (Tailwind v4 trailing `!`) so the banda stays
// full-bleed regardless of content width, while letting the runtime drive height animation.
// `--sw-header-h` is the header height expressed by <Header> as a CSS variable.

export const navigationMenuBandPopup = tv({
  base: [
    "fixed! left-0! top-[var(--sw-header-h,4.5rem)]! w-screen! z-40",
    "bg-popover text-popover-foreground border-t border-border shadow-lg",
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
