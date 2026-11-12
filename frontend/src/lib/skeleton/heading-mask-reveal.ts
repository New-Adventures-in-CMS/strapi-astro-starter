import { observeInView } from "@skeleton/in-view.js";

const REVEAL_MARGIN = "0px 0px -12% 0px";

/**
 * Wira il mask-reveal sui heading [data-mask-heading] fuori dall'hero.
 * Gli heading dentro [data-block="hero"] sono pilotati dai rispettivi script di blocco.
 * Idempotente: marca con data-mask-heading-init.
 */
export function initHeadingMaskReveal(scope: ParentNode = document): () => void {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headings = Array.from(scope.querySelectorAll<HTMLElement>("[data-mask-heading]")).filter(
    (n) => !n.hasAttribute("data-mask-heading-init"),
  );

  const cleanups: Array<() => void> = [];

  for (const h of headings) {
    h.setAttribute("data-mask-heading-init", "");

    if (prefersReduced) {
      h.classList.add("is-revealed");
      continue;
    }

    if (h.closest('[data-block="hero"]')) continue;

    const stop = observeInView(h, {
      once: true,
      rootMargin: REVEAL_MARGIN,
      onEnter: () => h.classList.add("is-revealed"),
    });
    cleanups.push(stop);
  }

  return () => cleanups.forEach((fn) => fn());
}
