export type InViewOpts = {
  onEnter?: () => void;
  onLeave?: () => void;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

export function observeInView(target: Element, opts: InViewOpts): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          opts.onEnter?.();
          if (opts.once) io.disconnect();
        } else {
          opts.onLeave?.();
        }
      });
    },
    {
      root: null,
      rootMargin: opts.rootMargin,
      threshold: opts.threshold ?? 0,
    },
  );
  io.observe(target);
  return () => io.disconnect();
}
