import type { CarouselAPI } from "@skeleton/carousel.js";

// Parallax d'ingresso (state-driven): a ogni cambio slide, sfondo e testo entrano lateralmente
// sfasati DAL LATO verso cui si naviga (loop-aware). Il fondo si assesta con un micro-zoom
// (percepibile anche senza bordi); il testo slitta di più e un attimo dopo.
const BG_ENTER = 40; // px
const BG_SCALE_REST = 1.08; // copre l'offset del fondo senza scoprire i bordi
const BG_SCALE_ENTER = 1.12; // il fondo entra un filo più zoomato → settle visibile
const TEXT_ENTER = 80; // px (maggiore → "classico")
const TEXT_DELAY = 90; // ms, micro-ritardo del testo
const DUR = 600; // ms
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function setupHeroParallax(
  api: CarouselAPI,
  root: HTMLElement,
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {};

  const slideNodes = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-slide]"),
  );
  const n = slideNodes.length;
  if (n === 0) return () => {};

  const mediaBySlide = new Map<number, HTMLElement>();
  const contentBySlide = new Map<number, HTMLElement>();
  slideNodes.forEach((slide, i) => {
    const m = slide.querySelector<HTMLElement>("[data-hero-media]");
    const c = slide.querySelector<HTMLElement>("[data-hero-content]");
    if (m) mediaBySlide.set(i, m);
    if (c) contentBySlide.set(i, c);
  });

  let prev = api.selectedIndex();

  function direction(cur: number): number {
    let d = cur - prev;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n; // loop-aware: percorso più breve
    return d >= 0 ? 1 : -1; // +1 avanti (da destra), -1 indietro (da sinistra)
  }

  function enter(idx: number, sign: number) {
    const m = mediaBySlide.get(idx);
    const c = contentBySlide.get(idx);
    if (m) {
      m.style.transition = "none";
      m.style.transform = `scale(${BG_SCALE_ENTER}) translate3d(${sign * BG_ENTER}px, 0, 0)`;
      void m.offsetWidth;
      m.style.transition = `transform ${DUR}ms ${EASE}`;
      m.style.transform = `scale(${BG_SCALE_REST}) translate3d(0, 0, 0)`;
    }
    if (c) {
      c.style.transition = "none";
      c.style.transform = `translate3d(${sign * TEXT_ENTER}px, 0, 0)`;
      void c.offsetWidth;
      c.style.transition = `transform ${DUR}ms ${EASE} ${TEXT_DELAY}ms`;
      c.style.transform = "translate3d(0, 0, 0)";
    }
  }

  const offSelect = api.on("select", () => {
    const cur = api.selectedIndex();
    enter(cur, direction(cur));
    prev = cur;
  });
  enter(prev, 1); // ingresso iniziale: da destra

  return () => {
    offSelect();
    mediaBySlide.forEach((m) => {
      m.style.transition = "";
      m.style.transform = "";
    });
    contentBySlide.forEach((c) => {
      c.style.transition = "";
      c.style.transform = "";
    });
  };
}
