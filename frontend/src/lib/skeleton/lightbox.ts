import { createDialog, type DialogInstance } from "@starwind-ui/runtime/dialog";
import { createCarousel, type CarouselAPI } from "./carousel.js";

export type LightboxOpts = {
  startIndex?: number;
  onSlideChange?: (i: number) => void;
};

export type LightboxAPI = {
  open(index?: number): void;
  close(): void;
  destroy(): void;
};

export function createLightbox(root: HTMLElement, opts: LightboxOpts = {}): LightboxAPI {
  const dialogRoot = root.querySelector<HTMLElement>("[data-sw-dialog]");
  if (!dialogRoot) throw new Error("createLightbox: missing [data-sw-dialog]");

  const carouselRoot = root.querySelector<HTMLElement>("[data-lightbox-carousel]");
  if (!carouselRoot) throw new Error("createLightbox: missing [data-lightbox-carousel]");

  const dialog: DialogInstance = createDialog(dialogRoot);

  let carousel: CarouselAPI | null = null;
  let pendingIndex: number | null = opts.startIndex ?? null;

  const prevBtn = carouselRoot.querySelector<HTMLElement>("[data-carousel-prev]") ?? undefined;
  const nextBtn = carouselRoot.querySelector<HTMLElement>("[data-carousel-next]") ?? undefined;

  function initCarousel() {
    carousel = createCarousel(carouselRoot!, {
      loop: true,
      startIndex: pendingIndex ?? 0,
      prevBtn,
      nextBtn,
      labels: {
        prev: "Precedente",
        next: "Successivo",
        slide: (i) =>
          `${i + 1} / ${carouselRoot!.querySelectorAll("[data-carousel-viewport] > * > *").length}`,
      },
    });

    pendingIndex = null;

    if (opts.onSlideChange) {
      carousel.on("select", () => opts.onSlideChange!(carousel!.selectedIndex()));
    }

    carouselRoot!.focus();
  }

  function destroyCarousel() {
    carousel?.destroy();
    carousel = null;
  }

  const unsubOpen = dialog.subscribe("openChange", (details) => {
    if (details.open) {
      requestAnimationFrame(() => initCarousel());
    }
  });

  const unsubClose = dialog.subscribe("closeComplete", () => {
    destroyCarousel();
  });

  function onThumbClick(e: Event) {
    const thumb = (e.target as HTMLElement).closest<HTMLElement>("[data-lightbox-thumb]");
    if (!thumb) return;
    const idx = Number(thumb.dataset.index ?? 0);
    pendingIndex = idx;
    dialog.open();
  }

  root.addEventListener("click", onThumbClick);

  return {
    open(index?: number) {
      pendingIndex = index ?? opts.startIndex ?? 0;
      dialog.open();
    },
    close() {
      dialog.close();
    },
    destroy() {
      root.removeEventListener("click", onThumbClick);
      unsubOpen();
      unsubClose();
      destroyCarousel();
    },
  };
}
