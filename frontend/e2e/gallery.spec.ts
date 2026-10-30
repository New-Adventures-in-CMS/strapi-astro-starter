import { test, expect } from "@playwright/test";

test.describe("BlockGallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/gallery");
  });

  test("renders all 6 thumbnails", async ({ page }) => {
    const thumbs = page.locator("[data-lightbox-thumb]");
    await expect(thumbs).toHaveCount(6);
  });

  test("thumbnail click opens lightbox at clicked index", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='2']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-state", "open");
  });

  test("figcaption appears for images with caption", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='0']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(150);

    const captions = dialog.locator("figcaption");
    const visibleCaptions = await captions.evaluateAll((els) =>
      els
        .filter((el) => el.textContent && el.textContent.trim().length > 0)
        .map((el) => el.textContent!.trim()),
    );
    expect(visibleCaptions.length).toBe(3);
  });

  test("figcaption absent for images without caption", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='0']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(150);

    const slides = dialog.locator("[data-carousel-viewport] > * > *");
    await expect(slides).toHaveCount(6);

    const slide2 = slides.nth(1);
    await expect(slide2.locator("figcaption")).toHaveCount(0);

    const slide4 = slides.nth(3);
    await expect(slide4.locator("figcaption")).toHaveCount(0);
  });

  test("arrow buttons navigate slides", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='0']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(150);

    await page.locator("[data-carousel-next]").click();
    await page.waitForTimeout(200);

    const liveText = await page.evaluate(() => {
      const live = document.querySelector("[data-lightbox-carousel] [aria-live='polite']");
      return live?.textContent ?? "";
    });
    expect(liveText).toContain("2 /");
  });

  test("Escape closes lightbox", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='0']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("close button closes lightbox", async ({ page }) => {
    await page.locator("[data-lightbox-thumb][data-index='0']").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    await page.locator("[data-sw-dialog-close]").click();
    await expect(dialog).toBeHidden();
  });

  test("grid has reveal hooks like card-grid", async ({ page }) => {
    const headerWrapper = page.locator("[data-reveal]:not([data-reveal='stagger'])");
    await expect(headerWrapper).toHaveCount(1);

    const grid = page.locator("[data-reveal='stagger'][data-mask-grid]");
    await expect(grid).toHaveCount(1);
  });

  test("caption overlay present only for images with caption", async ({ page }) => {
    const captions = page.locator("[data-gallery-caption]");
    await expect(captions).toHaveCount(3);

    const thumb2 = page.locator("[data-lightbox-thumb][data-index='1']");
    await expect(thumb2.locator("[data-gallery-caption]")).toHaveCount(0);

    const thumb4 = page.locator("[data-lightbox-thumb][data-index='3']");
    await expect(thumb4.locator("[data-gallery-caption]")).toHaveCount(0);
  });

  test("caption overlay visible on hover", async ({ page }) => {
    const thumb = page.locator("[data-lightbox-thumb][data-index='0']");
    const caption = thumb.locator("[data-gallery-caption]");
    await expect(caption).toHaveCSS("opacity", "0");

    await thumb.hover();
    await expect(caption).toHaveCSS("opacity", "1");
  });

  test("caption overlay visible on focus", async ({ page }) => {
    const thumb = page.locator("[data-lightbox-thumb][data-index='0']");
    const caption = thumb.locator("[data-gallery-caption]");
    await expect(caption).toHaveCSS("opacity", "0");

    await thumb.focus();
    await expect(caption).toHaveCSS("opacity", "1");
  });
});
