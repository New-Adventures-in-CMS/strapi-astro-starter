import { test, expect } from "@playwright/test";

test.describe("Hero image box — raster images have nonzero dimensions", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/hero-image");
  });

  test("static hero image has nonzero bounding box", async ({ page }) => {
    const section = page.locator('[data-hero-section="static"] [data-block="hero"]');
    await expect(section).toBeVisible();

    const img = section.locator("[data-si-loading] img:not(.si-blur)").first();
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("carousel hero image has nonzero bounding box", async ({ page }) => {
    const section = page.locator('[data-hero-section="carousel"] [data-block="hero"]');
    await expect(section).toBeVisible();

    const img = section.locator("[data-si-loading] img:not(.si-blur)").first();
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("drift hero image has nonzero bounding box", async ({ page }) => {
    const section = page.locator('[data-hero-section="drift"] [data-block="hero"]');
    await expect(section).toBeVisible();

    const img = section.locator("[data-si-loading] img:not(.si-blur)").first();
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("blur placeholder is present behind raster hero image", async ({ page }) => {
    const section = page.locator('[data-hero-section="static"] [data-block="hero"]');
    const blur = section.locator("[data-si-loading] .si-blur").first();
    await expect(blur).toBeAttached();
    await expect(blur).toHaveAttribute("aria-hidden", "true");

    const zIndex = await blur.evaluate((el) => getComputedStyle(el).zIndex);
    expect(Number(zIndex)).toBeLessThan(0);
  });
});
