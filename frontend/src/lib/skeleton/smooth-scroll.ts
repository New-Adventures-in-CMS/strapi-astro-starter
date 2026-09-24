import Lenis from "lenis";
import type { MotionSmoothPreset } from "@/config/site";

const DURATION: Record<Exclude<MotionSmoothPreset, "off">, number> = {
  light: 0.8,
  medium: 1.1,
  marked: 1.6,
};

/**
 * Smooth scroll globale (Lenis). Nudo e riusabile (candidato @team/ui).
 * Disattivo se preset "off", se prefers-reduced-motion, o su puntatore coarse (touch):
 * su mobile lo scroll nativo è già ottimo e Lenis interferisce con l'inerzia di sistema.
 */
export function initSmoothScroll(preset: MotionSmoothPreset): () => void {
  if (preset === "off") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {};
  if (window.matchMedia("(pointer: coarse)").matches) return () => {};

  const lenis = new Lenis({
    duration: DURATION[preset],
    smoothWheel: true,
  });

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  };
}
