const STAGGER_MS = 80;
const REVEAL_MARGIN_BOTTOM = 0.12;

export function isHeroInViewport(root: HTMLElement): boolean {
  const rect = root.getBoundingClientRect();
  return rect.top < window.innerHeight * (1 - REVEAL_MARGIN_BOTTOM);
}

export function triggerHeroIntro(content: HTMLElement, delayMs: number): void {
  let i = 0;
  for (const child of Array.from(content.children)) {
    (child as HTMLElement).style.transitionDelay = `${i * STAGGER_MS}ms`;
    i++;
  }

  const heading = content.querySelector<HTMLElement>("[data-mask-heading]");
  const reveal = () => {
    content.classList.add("is-revealed");
    heading?.classList.add("is-revealed");
  };

  if (delayMs > 0) {
    setTimeout(reveal, delayMs);
  } else {
    requestAnimationFrame(reveal);
  }
}

export function resetHeroIntro(slide: HTMLElement): void {
  const content = slide.querySelector<HTMLElement>("[data-hero-content]");
  if (!content) return;

  for (const child of Array.from(content.children)) {
    (child as HTMLElement).style.transition = "none";
  }
  content.classList.remove("is-revealed");

  const heading = content.querySelector<HTMLElement>("[data-mask-heading]");
  if (heading) {
    heading.style.transition = "none";
    heading.classList.remove("is-revealed");
  }
}

export function restoreHeroTransitions(slide: HTMLElement): void {
  const content = slide.querySelector<HTMLElement>("[data-hero-content]");
  if (!content) return;

  for (const child of Array.from(content.children)) {
    (child as HTMLElement).style.removeProperty("transition");
  }
  const heading = content.querySelector<HTMLElement>("[data-mask-heading]");
  heading?.style.removeProperty("transition");
}
