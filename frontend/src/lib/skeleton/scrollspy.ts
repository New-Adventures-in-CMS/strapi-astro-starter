export type ScrollSpyOpts = {
  sections: Element[];
  onChange: (active: Element | null) => void;
  rootMargin?: string;
};

/**
 * Observes N sections, emits which is active via onChange.
 *
 * Active = the section whose top has most recently crossed a trigger line
 * near the viewport top (default: 30% from top, matching rootMargin
 * "0px 0px -70% 0px"). At page bottom, the last section is forced active
 * (top-anchored trigger can't reach the final section when the document
 * runs out of scroll).
 *
 * Detection uses getBoundingClientRect in resolve() for reliability —
 * the IO and passive scroll listener are both triggers, not state.
 * No per-frame work when idle: scroll listener is rAF-throttled, IO
 * fires only on intersection transitions.
 */
export function createScrollSpy(opts: ScrollSpyOpts): () => void {
  const { sections, onChange, rootMargin = "0px 0px -70% 0px" } = opts;
  if (!sections.length) return () => {};

  let current: Element | null = null;
  let rafId = 0;

  const triggerRatio = parseTriggerRatio(rootMargin);

  function isAtBottom(): boolean {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  }

  function resolve() {
    if (isAtBottom()) {
      const last = sections[sections.length - 1];
      if (last !== current) {
        current = last;
        onChange(current);
      }
      return;
    }

    const triggerLine = window.innerHeight * triggerRatio;
    let best: Element | null = null;
    let bestTop = -Infinity;
    for (const el of sections) {
      const top = el.getBoundingClientRect().top;
      if (top <= triggerLine && top > bestTop) {
        bestTop = top;
        best = el;
      }
    }

    if (best === null && current !== null) return;
    if (best !== current) {
      current = best;
      onChange(current);
    }
  }

  const io = new IntersectionObserver(() => resolve(), { rootMargin });
  for (const s of sections) io.observe(s);

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      resolve();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  resolve();

  return () => {
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/** Derive trigger line ratio from IO rootMargin bottom value. */
function parseTriggerRatio(rootMargin: string): number {
  const parts = rootMargin.trim().split(/\s+/);
  const bottom = parts[2] ?? parts[0] ?? "0px";
  const match = bottom.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (match) return Math.max(0, Math.min(1, 1 + parseFloat(match[1]) / 100));
  return 0.3;
}
