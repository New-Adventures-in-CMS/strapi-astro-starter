import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero sticky: computed position is actually "sticky" when data-sticky-hero
// is active, image remains visible, and footer sticky is unaffected.
// ---------------------------------------------------------------------------

const DESKTOP = { width: 1280, height: 800 };

test.describe("hero sticky — computed position + image anchoring", () => {
  test.use({ viewport: DESKTOP });

  test("immersive hero is position:sticky when data-sticky-hero is active", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    const hasStickyHero = await main.evaluate((el) => el.hasAttribute("data-sticky-hero"));

    if (hasStickyHero) {
      const hero = main.locator(":scope > :first-child");
      const position = await hero.evaluate((el) => getComputedStyle(el).position);
      expect(position).toBe("sticky");
    }
  });

  test("hero image has nonzero bounding box while sticky", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    const hasStickyHero = await main.evaluate((el) => el.hasAttribute("data-sticky-hero"));

    if (hasStickyHero) {
      const hero = main.locator('[data-block="hero"]');
      const img = hero.locator("[data-si-loading] img:not(.si-blur)").first();
      await expect(img).toBeVisible();
      const box = await img.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(100);
    }
  });

  test("footer remains sticky alongside hero sticky", async ({ page }) => {
    await page.goto("/");
    const position = await page.locator("footer").evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("sticky");
  });
});
