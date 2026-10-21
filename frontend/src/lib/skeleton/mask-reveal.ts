import { observeInView } from "@skeleton/in-view.js";

const REVEAL_MARGIN = "0px 0px -12% 0px";

/**
 * Wira il mask-reveal sui nodi [data-mask-reveal] nello scope dato.
 * Nodi dentro un [data-reveal] sono pilotati dal CSS (ancestor .is-revealed); qui
 * si osservano solo quelli standalone. Idempotente: marca con data-mask-reveal-init.
 */
export function initMaskReveal(scope: ParentNode = document): () => void {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrappers = Array.from(scope.querySelectorAll<HTMLElement>("[data-mask-reveal]")).filter(
    (n) => !n.hasAttribute("data-mask-reveal-init"),
  );

  const cleanups: Array<() => void> = [];

  for (const w of wrappers) {
    w.setAttribute("data-mask-reveal-init", "");

    if (prefersReduced) {
      w.classList.add("is-revealed");
      continue;
    }

    if (w.closest("[data-reveal]")) continue;

    const stop = observeInView(w, {
      once: true,
      rootMargin: REVEAL_MARGIN,
      onEnter: () => w.classList.add("is-revealed"),
    });
    cleanups.push(stop);
  }

  return () => cleanups.forEach((fn) => fn());
}
