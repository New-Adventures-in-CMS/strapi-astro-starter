import { observeInView } from "./in-view.js";

export type ScrollStateOpts = {
  rootMargin?: string;
  threshold?: number;
  solidState?: string;
  transparentState?: string;
};

export function initScrollState(
  el: HTMLElement,
  sentinel: Element,
  opts: ScrollStateOpts = {},
): () => void {
  const solid = opts.solidState ?? "solid";
  const transparent = opts.transparentState ?? "transparent";

  return observeInView(sentinel, {
    rootMargin: opts.rootMargin,
    threshold: opts.threshold ?? 0,
    onEnter: () => el.setAttribute("data-state", transparent),
    onLeave: () => el.setAttribute("data-state", solid),
  });
}
