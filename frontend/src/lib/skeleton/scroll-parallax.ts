import { observeInView } from "@skeleton/in-view.js";
import { getLenis } from "@skeleton/smooth-scroll.js";

const SCALE = 1.16;
const SAFETY_FRACTION = 0.8;

type Entry = { box: HTMLElement; img: HTMLElement; active: boolean };

export function initScrollParallax(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (window.matchMedia("(pointer: coarse)").matches) return () => {};

  const boxes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  if (boxes.length === 0) return () => {};

  const entries: Entry[] = [];
  for (const box of boxes) {
    const img = box.querySelector<HTMLElement>("img:not(.si-blur)");
    if (img) entries.push({ box, img, active: false });
  }
  if (entries.length === 0) return () => {};

  function activate(entry: Entry) {
    entry.active = true;
  }

  for (const entry of entries) {
    const staggerParent = entry.box.closest('[data-reveal="stagger"]');
    if (staggerParent?.classList.contains("is-revealed")) {
      activate(entry);
    } else {
      const handler = (e: TransitionEvent) => {
        if (e.propertyName === "clip-path") {
          entry.box.removeEventListener("transitionend", handler);
          activate(entry);
        }
      };
      entry.box.addEventListener("transitionend", handler);
    }
  }

  const visibleSet = new Set<Entry>();
  const ioCleanups: Array<() => void> = [];

  for (const entry of entries) {
    const stop = observeInView(entry.box, {
      onEnter: () => {
        visibleSet.add(entry);
        if (entry.active) entry.img.style.willChange = "transform";
      },
      onLeave: () => {
        visibleSet.delete(entry);
        entry.img.style.willChange = "";
      },
    });
    ioCleanups.push(stop);
  }

  function update() {
    const vh = window.innerHeight;
    for (const entry of visibleSet) {
      if (!entry.active) continue;
      const rect = entry.box.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height) / (vh + rect.height);
      const maxRange = rect.height * (SCALE - 1) * SAFETY_FRACTION;
      const offset = (progress - 0.5) * maxRange;
      entry.img.style.transform = `scale(${SCALE}) translate3d(0, ${offset}px, 0)`;
    }
  }

  const lenis = getLenis();
  let cleanupScroll: () => void;

  if (lenis) {
    const scrollHandler = () => update();
    lenis.on("scroll", scrollHandler);
    cleanupScroll = () => lenis.off("scroll", scrollHandler);
  } else {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanupScroll = () => window.removeEventListener("scroll", onScroll);
  }

  return () => {
    cleanupScroll();
    ioCleanups.forEach((fn) => fn());
    for (const entry of entries) {
      entry.img.style.transform = "";
      entry.img.style.willChange = "";
    }
  };
}
