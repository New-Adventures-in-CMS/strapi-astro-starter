import { getLenis } from "./smooth-scroll.js";

const ANCHOR_SCROLL_DURATION = 1.1;
const ANCHOR_SCROLL_EASING = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function getHeaderOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  if (!raw) return 0;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return parseFloat(raw) * rootFontSize;
}

function scrollToTarget(target: HTMLElement): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, {
      offset: -getHeaderOffset(),
      duration: ANCHOR_SCROLL_DURATION,
      easing: ANCHOR_SCROLL_EASING,
    });
  } else {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  if (target.tabIndex < 0 || !target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
}

function handleAnchorClick(e: MouseEvent): void {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
  if (!link) return;

  const rawHref = link.getAttribute("href");
  if (!rawHref) return;

  let url: URL;
  try {
    url = new URL(rawHref, location.href);
  } catch {
    return;
  }

  if (url.origin !== location.origin) return;
  if (!url.hash) return;
  if (url.pathname !== location.pathname) return;

  const target = document.querySelector<HTMLElement>(url.hash);
  if (!target) return;

  e.preventDefault();
  history.pushState(null, "", url.hash);
  scrollToTarget(target);
}

export function initAnchorScroll(): () => void {
  document.addEventListener("click", handleAnchorClick);

  if (location.hash) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(location.hash);
        if (target) scrollToTarget(target);
      });
    });
  }

  return () => {
    document.removeEventListener("click", handleAnchorClick);
  };
}
