export type HideOnScrollOpts = {
  threshold?: number;
  topThreshold?: number;
};

export function initHideOnScroll(
  el: HTMLElement,
  opts: HideOnScrollOpts = {},
): () => void {
  const THRESHOLD = opts.threshold ?? 8;
  const TOP_THRESHOLD = opts.topThreshold ?? 40;

  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const delta = y - lastY;

    if (y <= TOP_THRESHOLD) {
      el.setAttribute("data-hidden", "false");
    } else if (Math.abs(delta) >= THRESHOLD) {
      el.setAttribute("data-hidden", delta > 0 ? "true" : "false");
      lastY = y;
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onFocusIn() {
    el.setAttribute("data-hidden", "false");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  el.addEventListener("focusin", onFocusIn);

  return () => {
    window.removeEventListener("scroll", onScroll);
    el.removeEventListener("focusin", onFocusIn);
  };
}
