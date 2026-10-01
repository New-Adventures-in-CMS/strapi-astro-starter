import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero align collaudo — layout allineamento contenuto (align prop / config).
// Verifica:
//  - bottom-left (parallax): content = text-left, wrapper = items-end + justify-start.
//  - center (focus, default): content = text-center (non-regressione).
// ---------------------------------------------------------------------------

test.describe("Hero align — bottom-left (parallax section)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("content is text-left, slide wrapper uses items-end + justify-start", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="parallax"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const content = root.locator("[data-hero-content]").first();
    const slide = root.locator("[data-hero-slide]").first();

    await expect(content).toHaveClass(/text-left/);
    await expect(slide).toHaveClass(/items-end/);
    await expect(slide).toHaveClass(/justify-start/);
  });
});

test.describe("Hero align — center (focus section, non-regression)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("content is text-center on default-align section", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="focus"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const content = root.locator("[data-hero-content]").first();
    await expect(content).toHaveClass(/text-center/);
  });
});
