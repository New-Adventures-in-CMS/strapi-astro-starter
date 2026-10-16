/**
 * Polestar effect: keep megamenu open while cursor stays on header.
 * Two handlers — A cancels close when leaving Root for another header child,
 * B re-triggers close when cursor exits header entirely.
 */
export function initPolestar(): void {
  const root = document.querySelector<HTMLElement>(
    'header [data-slot="navigation-menu"][data-layout="band"]',
  );
  const header = root?.closest("header");
  if (!root || !header || root.dataset.pmKeepopenBound) return;
  root.dataset.pmKeepopenBound = "1";

  const isOpen = () => root.getAttribute("data-state") === "open";

  // A. Cursor leaves Root but stays inside header → cancel close timer
  root.addEventListener(
    "pointerleave",
    (e) => {
      if (!isOpen()) return;
      if (!(e.relatedTarget instanceof Node)) return;
      if (!header.contains(e.relatedTarget)) return;
      queueMicrotask(() => {
        root.dispatchEvent(
          new PointerEvent("pointerenter", {
            bubbles: false,
            pointerType: "mouse",
          }),
        );
      });
    },
    { passive: true },
  );

  // B. Cursor leaves header entirely → re-trigger close path on Root
  header.addEventListener(
    "pointerleave",
    (e) => {
      if (!isOpen()) return;
      const rt = e.relatedTarget;
      if (rt instanceof Node && header.contains(rt)) return;
      queueMicrotask(() => {
        root.dispatchEvent(
          new PointerEvent("pointerleave", {
            bubbles: false,
            pointerType: "mouse",
            relatedTarget: rt instanceof Node ? rt : null,
          }),
        );
      });
    },
    { passive: true },
  );
}
