import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero ken-burns on static hero (BlockHeroStatic effect="ken-burns").
// Verifica: [data-hero-media] ha style.animation con `hero-ken-burns`;
// reduced-motion → nessuna animation. Uses standalone CSS animation,
// not the carousel-dependent setupHeroKenBurns.
// ---------------------------------------------------------------------------

test.describe("Hero ken-burns — static (no carousel)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("static markers present (no carousel)", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="ken-burns-single"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.locator("[data-hero-static]")).toHaveCount(1);
    await expect(section.locator("[data-hero-media]")).toHaveCount(1);
    await expect(section.locator("[data-hero-carousel]")).toHaveCount(0);
  });

  test("ken-burns animation running on static media", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="ken-burns-single"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await page.waitForTimeout(200);

    const animation = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="ken-burns-single"]');
      const media = s?.querySelector<HTMLElement>("[data-hero-media]");
      return media?.style.animation ?? "";
    });

    expect(animation).toContain("hero-ken-burns");
  });
});

test.describe("Hero ken-burns static — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no animation with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="ken-burns-single"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await page.waitForTimeout(200);

    const animation = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="ken-burns-single"]');
      const media = s?.querySelector<HTMLElement>("[data-hero-media]");
      return media?.style.animation ?? "";
    });

    expect(animation).toBe("");
  });
});
