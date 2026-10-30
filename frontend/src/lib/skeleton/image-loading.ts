export function initImageLoading(scope: ParentNode = document): void {
  const wrappers = scope.querySelectorAll<HTMLElement>("[data-si-loading]");

  wrappers.forEach((wrapper) => {
    if (wrapper.classList.contains("is-loaded")) return;

    const img = wrapper.querySelector<HTMLImageElement>("img");
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      wrapper.classList.add("is-loaded");
      return;
    }

    const mark = () => wrapper.classList.add("is-loaded");
    img.addEventListener("load", mark, { once: true });
    img.addEventListener("error", mark, { once: true });
  });
}
