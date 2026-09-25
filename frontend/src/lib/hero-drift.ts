import type { CarouselAPI } from "@skeleton/carousel.js";

const DRIFT_FACTOR = 0.15;

export function setupHeroDrift(
  api: CarouselAPI,
  root: HTMLElement,
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const slideNodes = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-slide]"),
  );
  const n = slideNodes.length;
  if (n <= 1) return () => {};

  const layersBySlide = new Map<number, HTMLElement>();
  slideNodes.forEach((slide, i) => {
    const layer = slide.querySelector<HTMLElement>("[data-parallax-layer]");
    if (layer) layersBySlide.set(i, layer);
  });

  if (layersBySlide.size === 0) return () => {};

  function update() {
    const p = api.scrollProgress();
    layersBySlide.forEach((layer, i) => {
      let delta = p - i / n;
      if (delta > 0.5) delta -= 1;
      if (delta < -0.5) delta += 1;
      layer.style.transform = `translate3d(${delta * DRIFT_FACTOR * 100}%, 0, 0)`;
    });
  }

  const offScroll = api.on("scroll", update);
  const offReInit = api.on("reInit", update);
  update();

  return () => {
    offScroll();
    offReInit();
    layersBySlide.forEach((layer) => {
      layer.style.transform = "";
    });
  };
}
