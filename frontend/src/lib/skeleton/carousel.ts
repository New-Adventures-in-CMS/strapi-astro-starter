// frontend/src/lib/skeleton/carousel.ts

import EmblaCarousel, {
  type EmblaCarouselType,
  type EmblaOptionsType,
} from "embla-carousel";

export type CarouselOpts = {
  loop?: boolean;
  autoplay?: { delayMs: number };
  prevBtn?: HTMLElement;
  nextBtn?: HTMLElement;
  dots?: HTMLElement;
  labels?: {
    prev?: string;
    next?: string;
    slide?: (i: number) => string;
  };
};

export type CarouselAPI = {
  scrollNext(): void;
  scrollPrev(): void;
  scrollTo(i: number): void;
  selectedIndex(): number;
  on(evt: "select", cb: () => void): () => void;
  destroy(): void;
};

export function createCarousel(
  root: HTMLElement,
  opts: CarouselOpts = {},
): CarouselAPI {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const viewport = root.querySelector<HTMLElement>("[data-carousel-viewport]");
  if (!viewport)
    throw new Error("createCarousel: missing [data-carousel-viewport]");

  const emblaOpts: EmblaOptionsType = { loop: opts.loop ?? false };
  const embla: EmblaCarouselType = EmblaCarousel(viewport, emblaOpts);

  // A11y: set roles on root and slides
  root.setAttribute("role", "region");
  root.setAttribute("aria-roledescription", "carousel");
  const slides = embla.slideNodes();
  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute(
      "aria-label",
      opts.labels?.slide ? opts.labels.slide(i) : `${i + 1} / ${slides.length}`,
    );
  });

  // Live region for screen readers
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap";
  root.appendChild(liveRegion);

  // Dot buttons (bare, no style — skin styles them)
  let dotBtns: HTMLButtonElement[] = [];
  if (opts.dots) {
    const dotsContainer = opts.dots;
    dotsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute(
        "aria-label",
        opts.labels?.slide ? opts.labels.slide(i) : `Slide ${i + 1}`,
      );
      btn.addEventListener("click", () => embla.scrollTo(i));
      dotsContainer.appendChild(btn);
      dotBtns.push(btn);
    });
  }

  function updateDots() {
    const idx = embla.selectedScrollSnap();
    dotBtns.forEach((btn, i) => {
      btn.setAttribute("aria-current", i === idx ? "true" : "false");
      btn.toggleAttribute("data-active", i === idx);
    });
  }

  function updateNav() {
    if (opts.prevBtn) {
      opts.prevBtn.setAttribute(
        "aria-label",
        opts.labels?.prev ?? "Precedente",
      );
      const canPrev = opts.loop ? true : embla.canScrollPrev();
      opts.prevBtn.toggleAttribute("disabled", !canPrev);
    }
    if (opts.nextBtn) {
      opts.nextBtn.setAttribute(
        "aria-label",
        opts.labels?.next ?? "Successivo",
      );
      const canNext = opts.loop ? true : embla.canScrollNext();
      opts.nextBtn.toggleAttribute("disabled", !canNext);
    }
  }

  function updateLive() {
    const idx = embla.selectedScrollSnap();
    liveRegion.textContent = opts.labels?.slide
      ? opts.labels.slide(idx)
      : `${idx + 1} / ${slides.length}`;
  }

  embla.on("select", () => {
    updateDots();
    updateNav();
    updateLive();
  });
  embla.on("init", () => {
    updateDots();
    updateNav();
  });

  // Prev / Next button click handlers
  function onPrev() {
    embla.scrollPrev();
  }
  function onNext() {
    embla.scrollNext();
  }
  opts.prevBtn?.addEventListener("click", onPrev);
  opts.nextBtn?.addEventListener("click", onNext);

  // Autoplay
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;

  function startAutoplay() {
    if (!opts.autoplay || reducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(
      () => embla.scrollNext(),
      opts.autoplay.delayMs,
    );
    liveRegion.setAttribute("aria-live", "off");
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    liveRegion.setAttribute("aria-live", "polite");
  }

  // Pause on hover
  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  // Pause on focus
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget as Node)) startAutoplay();
  });
  // Pause on hidden tab
  function onVisibilityChange() {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  startAutoplay();

  // Keyboard: ArrowLeft / ArrowRight when focus is inside root
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      embla.scrollPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      embla.scrollNext();
    }
  }
  root.addEventListener("keydown", onKeyDown);

  return {
    scrollNext: () => embla.scrollNext(),
    scrollPrev: () => embla.scrollPrev(),
    scrollTo: (i) => embla.scrollTo(i),
    selectedIndex: () => embla.selectedScrollSnap(),
    on(evt, cb) {
      embla.on(evt, cb);
      return () => embla.off(evt, cb);
    },
    destroy() {
      stopAutoplay();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      opts.prevBtn?.removeEventListener("click", onPrev);
      opts.nextBtn?.removeEventListener("click", onNext);
      root.removeEventListener("mouseenter", stopAutoplay);
      root.removeEventListener("mouseleave", startAutoplay);
      root.removeEventListener("focusin", stopAutoplay);
      root.removeEventListener("keydown", onKeyDown);
      if (root.contains(liveRegion)) root.removeChild(liveRegion);
      embla.destroy();
    },
  };
}
