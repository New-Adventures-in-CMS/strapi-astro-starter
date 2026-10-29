import { tv } from "tailwind-variants";

export const tabs = tv({
  base: "",
});

export const tabsContent = tv({
  base: "mt-4 focus-visible:outline-2 focus-visible:outline-offset-2",
});

export const tabsList = tv({
  base: "relative inline-flex w-full items-center border-b border-border",
});

export const tabsTrigger = tv({
  base: [
    "inline-flex items-center justify-center gap-2 px-4 py-3 font-medium whitespace-nowrap",
    "text-muted-foreground transition-colors data-[state=active]:text-foreground",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "focus-visible:border-outline focus-visible:ring-outline/50 focus-visible:outline-outline focus-visible:ring-3 focus-visible:outline-1",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
});

export const tabsIndicator = tv({
  base: [
    "absolute bottom-0 h-0.5 bg-primary",
    "left-[var(--active-tab-left)] w-[var(--active-tab-width)]",
    "[transition:left_300ms_var(--ease-out-expo),width_300ms_var(--ease-out-expo)]",
  ],
});
