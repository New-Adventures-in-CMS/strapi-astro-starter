import { tv } from "tailwind-variants";

export const tooltip = tv({
  base: "inline-block",
});

export const tooltipPositioner = tv({
  base: "z-50",
});

export const tooltipContent = tv({
  base: [
    "group hidden w-fit px-3 py-1.5 text-sm",
    "bg-foreground text-background rounded-md",
    "animate-in fade-in zoom-in-95 duration-150",
    "data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards fade-out zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
    "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
    "origin-(--transform-origin)",
  ],
});
