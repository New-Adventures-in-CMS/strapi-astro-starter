import type { CarouselAPI } from "@skeleton/carousel.js";

const DURATION = 7000; // ms — zoom lento (tunable; per completarlo entro la sosta ~= autoplay delay)
const EASE = "ease-out";

export function setupHeroKenBurns(api: CarouselAPI, root: HTMLElement): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const slideNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-slide]"));
  if (slideNodes.length === 0) return () => {};

  const mediaBySlide = new Map<number, HTMLElement>();
  slideNodes.forEach((slide, i) => {
    const m = slide.querySelector<HTMLElement>("[data-hero-media]");
    if (m) mediaBySlide.set(i, m);
  });

  function run(idx: number) {
    const m = mediaBySlide.get(idx);
    if (!m) return;
    m.style.animation = "none";
    void m.offsetWidth; // reflow → riavvia l'animazione
    m.style.animation = `hero-ken-burns ${DURATION}ms ${EASE} forwards`;
  }

  const offSelect = api.on("select", () => run(api.selectedIndex()));
  run(api.selectedIndex());

  return () => {
    offSelect();
    mediaBySlide.forEach((m) => {
      m.style.animation = "";
    });
  };
}
