import { test, expect } from "@playwright/test";

test.describe("Image loading indicators", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/gallery");
  });

  test("raster thumbnails have blur-up placeholder behind main image", async ({ page }) => {
    const blurImgs = page.locator("[data-lightbox-thumb] .si-blur");
    const count = await blurImgs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const blur = blurImgs.nth(i);
      await expect(blur).toHaveAttribute("aria-hidden", "true");
      await expect(blur).toHaveAttribute("data-variant", "blur");
      const zIndex = await blur.evaluate((el) => getComputedStyle(el).zIndex);
      expect(Number(zIndex)).toBeLessThan(0);
    }
  });

  test("raster thumbnail wrapper gains is-loaded after image loads", async ({ page }) => {
    const wrappers = page.locator("[data-lightbox-thumb] [data-si-loading]");
    const count = await wrappers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(wrappers.nth(i)).toHaveClass(/is-loaded/);
    }
  });

  test("SVG thumbnails have no blur wrapper", async ({ page }) => {
    const svgThumbs = page.locator("[data-lightbox-thumb]").filter({
      has: page.locator("img[src*='.svg']"),
    });
    const count = await svgThumbs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const wrapper = svgThumbs.nth(i).locator("[data-si-loading]");
      await expect(wrapper).toHaveCount(0);
    }
  });

  test("blur placeholder is pointer-events:none (lightbox click works)", async ({ page }) => {
    const blurImg = page.locator("[data-lightbox-thumb] .si-blur").first();
    const pe = await blurImg.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pe).toBe("none");

    await page.locator("[data-lightbox-thumb]").first().click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
  });

  test("lightbox slides use spinner variant", async ({ page }) => {
    await page.locator("[data-lightbox-thumb]").first().click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    const spinners = dialog.locator(".si-indicator--spinner");
    const count = await spinners.count();
    expect(count).toBeGreaterThan(0);
  });

  test("reduced-motion neutralizes blur transition and spinner animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/gallery");

    const blur = page.locator("[data-lightbox-thumb] .si-blur").first();
    if ((await blur.count()) > 0) {
      const transition = await blur.evaluate((el) => getComputedStyle(el).transitionDuration);
      expect(transition === "0s" || transition === "0ms").toBe(true);
    }

    await page.locator("[data-lightbox-thumb]").first().click();
    const spinner = page.locator("[data-slot='dialog-content'] .si-indicator--spinner").first();
    if ((await spinner.count()) > 0) {
      const pseudoAnim = await spinner.evaluate((el) => {
        return getComputedStyle(el, "::after").animationName;
      });
      expect(pseudoAnim).toBe("none");
    }
  });
});
