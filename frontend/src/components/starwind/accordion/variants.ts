import { tv } from "tailwind-variants";

export const accordion = tv({
  base: "",
});

export const accordionContent = tv({
  base: [
    "transform-gpu overflow-hidden font-sans text-foreground",
    "data-[state=closed]:animate-accordion-up data-[state=closed]:h-0",
    "data-[state=open]:animate-accordion-down",
  ],
});

export const accordionItem = tv({
  base: "border-b border-border first:border-t",
});

export const accordionTrigger = tv({
  base: [
    "flex w-full items-center justify-between gap-4 py-5 text-left",
    "font-heading text-lg font-medium",
    "transition-colors hover:text-muted-foreground",
    "[&[data-state=open]>svg]:rotate-180",
    "focus-visible:border-outline focus-visible:ring-outline/50 outline-none focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
});
