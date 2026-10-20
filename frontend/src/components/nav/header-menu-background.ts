/**
 * Sync header background with megamenu open/close lifecycle.
 * Sets data-menu-open on <header> immediately on open; removes it
 * after the panel collapse completes (200ms — matches band-variants.ts
 * data-ending-style:duration-[200ms]).
 */
export function initHeaderMenuBackground(): void {
  const root = document.querySelector<HTMLElement>(
    'header [data-slot="navigation-menu"][data-layout="band"]',
  );
  const header = root?.closest("header");
  if (!root || !header || root.dataset.menubgBound) return;
  root.dataset.menubgBound = "1";

  // Matches band-variants.ts data-ending-style:duration-[200ms]
  const COLLAPSE_MS = 200;

  let timer: ReturnType<typeof setTimeout> | undefined;

  const observer = new MutationObserver(() => {
    const open = root.getAttribute("data-state") === "open";
    if (open) {
      clearTimeout(timer);
      header.setAttribute("data-menu-open", "true");
    } else {
      clearTimeout(timer);
      const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : COLLAPSE_MS;
      timer = setTimeout(() => {
        if (root.getAttribute("data-state") !== "open") {
          header.removeAttribute("data-menu-open");
        }
      }, delay);
    }
  });

  observer.observe(root, {
    attributes: true,
    attributeFilter: ["data-state"],
  });
}
