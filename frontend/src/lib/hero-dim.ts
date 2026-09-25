import type { CarouselAPI } from "@skeleton/carousel.js";

const DIM_MIN = 0.4;

export function setupHeroDim(api: CarouselAPI, root: HTMLElement): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const slideNodes = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-slide]"),
  );
  const n = slideNodes.length;
  if (n <= 1) return () => {};

  const mediaBySlide = new Map<number, HTMLElement>();
  slideNodes.forEach((slide, i) => {
    const media = slide.querySelector<HTMLElement>("[data-hero-media]");
    if (media) mediaBySlide.set(i, media);
  });

  if (mediaBySlide.size === 0) return () => {};

  function update() {
    const p = api.scrollProgress();
    mediaBySlide.forEach((media, i) => {
      let delta = p - i / n;
      if (delta > 0.5) delta -= 1;
      if (delta < -0.5) delta += 1;
      const t = 1 - Math.min(Math.abs(delta) * 2, 1);
      media.style.filter = `brightness(${DIM_MIN + t * (1 - DIM_MIN)})`;
    });
  }

  const offScroll = api.on("scroll", update);
  const offReInit = api.on("reInit", update);
  update();

  return () => {
    offScroll();
    offReInit();
    mediaBySlide.forEach((media) => {
      media.style.filter = "";
    });
  };
}
