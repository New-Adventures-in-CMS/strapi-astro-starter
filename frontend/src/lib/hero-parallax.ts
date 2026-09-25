import type { CarouselAPI } from "@skeleton/carousel.js";

const BG_SCALE = 1.08;
const BG_SHIFT = 20;
const TEXT_SHIFT = 6;

export function setupHeroParallax(
  _api: CarouselAPI,
  root: HTMLElement,
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {};
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};

  const media = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-media]"),
  );
  const content = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-content]"),
  );
  if (media.length === 0) return () => {};

  const all = [...media, ...content];
  all.forEach((el) => {
    el.style.transition = "transform 0.15s ease-out";
    el.style.willChange = "transform";
  });

  function apply(nx: number, ny: number) {
    media.forEach((el) => {
      el.style.transform = `scale(${BG_SCALE}) translate3d(${(-nx * BG_SHIFT).toFixed(2)}px, ${(-ny * BG_SHIFT).toFixed(2)}px, 0)`;
    });
    content.forEach((el) => {
      el.style.transform = `translate3d(${(-nx * TEXT_SHIFT).toFixed(2)}px, ${(-ny * TEXT_SHIFT).toFixed(2)}px, 0)`;
    });
  }
  function onMove(e: PointerEvent) {
    const r = root.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    apply(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
  }
  function onLeave() {
    apply(0, 0);
  }

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  apply(0, 0);

  return () => {
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    all.forEach((el) => {
      el.style.transform = "";
      el.style.transition = "";
      el.style.willChange = "";
    });
  };
}
