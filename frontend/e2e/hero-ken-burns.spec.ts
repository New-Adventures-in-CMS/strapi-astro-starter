import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero ken-burns — pattern B (state/time-driven).
// Verifica: presenza [data-hero-media]; slide attiva ha style.animation con
// `hero-ken-burns` (partita); dopo avanzamento la nuova attiva ha animation
// impostata (riavvio su select); reduced-motion → nessuna animation.
// ---------------------------------------------------------------------------

test.describe("Hero ken-burns — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("media present and animation running on active slide", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="ken-burns"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expect(root.locator("[data-hero-media]")).toHaveCount(3);

    await page.waitForTimeout(120);
    const animation = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="ken-burns"]');
      const medias =
        section?.querySelectorAll<HTMLElement>("[data-hero-media]");
      return Array.from(medias ?? []).map((m) => m.style.animation);
    });
    const active = animation.filter((a) => a.includes("hero-ken-burns"));
    expect(active.length).toBeGreaterThanOrEqual(1);
  });

  test("animation restarts on select (next slide)", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="ken-burns"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await page.waitForTimeout(120);

    const nextBtn = root.locator("[data-carousel-next]");
    await nextBtn.click();
    await page.waitForTimeout(150);

    const animation = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="ken-burns"]');
      const medias =
        section?.querySelectorAll<HTMLElement>("[data-hero-media]");
      return Array.from(medias ?? []).map((m) => m.style.animation);
    });
    const active = animation.filter((a) => a.includes("hero-ken-burns"));
    expect(active.length).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Hero ken-burns — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no animation applied with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="ken-burns"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await page.waitForTimeout(120);

    const animation = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="ken-burns"]');
      const medias =
        section?.querySelectorAll<HTMLElement>("[data-hero-media]");
      return Array.from(medias ?? []).map((m) => m.style.animation);
    });
    for (const a of animation) {
      expect(a).toBe("");
    }
  });
});
