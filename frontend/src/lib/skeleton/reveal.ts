import { observeInView } from "@skeleton/in-view.js";

const STAGGER_MS = 100;
const REVEAL_MARGIN = "0px 0px -12% 0px";

/**
 * Wira lo scroll-reveal sui nodi [data-reveal] nello scope dato.
 * Idempotente: marca i nodi con data-reveal-init e salta i già inizializzati.
 * Non anima nulla direttamente — tocca solo classe .is-revealed e transition-delay.
 */
export function initReveal(scope: ParentNode = document): () => void {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const nodes = Array.from(
    scope.querySelectorAll<HTMLElement>("[data-reveal]"),
  ).filter((n) => !n.hasAttribute("data-reveal-init"));
  const cleanups: Array<() => void> = [];

  nodes.forEach((node) => {
    node.setAttribute("data-reveal-init", "");

    if (prefersReduced) {
      node.classList.add("is-revealed");
      return;
    }

    if (node.getAttribute("data-reveal") === "stagger") {
      Array.from(node.children).forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * STAGGER_MS}ms`;
      });
    }

    const stop = observeInView(node, {
      once: true,
      rootMargin: REVEAL_MARGIN,
      onEnter: () => node.classList.add("is-revealed"),
    });
    cleanups.push(stop);
  });

  return () => cleanups.forEach((fn) => fn());
}
