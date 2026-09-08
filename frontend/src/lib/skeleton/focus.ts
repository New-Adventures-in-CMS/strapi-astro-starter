const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement): () => void {
  const focusables = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}

export function restoreFocus(): () => void {
  const saved = document.activeElement as HTMLElement | null;
  return () => saved?.focus?.();
}
