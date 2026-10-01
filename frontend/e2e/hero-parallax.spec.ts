import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero parallax collaudo — pattern B (state-driven entrance su `select`).
// Verifica: presenza media+content per slide; dopo cambio slide il content
// attivo ha transform inline non vuoto (entrata partita); reduced-motion → no
// transform. Non asserisce timing/valore esatto per evitare flakiness.
// ---------------------------------------------------------------------------

test.describe("Hero parallax — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("media and content layers present for each carousel slide", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="parallax"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expect(root.locator("[data-hero-media]")).toHaveCount(3);
    await expect(root.locator("[data-hero-content]")).toHaveCount(3);
  });

  test("active content gets non-empty inline transform after slide change", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="parallax"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const nextBtn = root.locator("[data-carousel-next]");
    await nextBtn.click();
    await page.waitForTimeout(50);

    const hasContentTransform = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="parallax"]');
      const contents = section?.querySelectorAll<HTMLElement>("[data-hero-content]") ?? [];
      for (const c of contents) {
        if (c.style.transform && c.style.transform !== "none") return true;
      }
      return false;
    });

    expect(hasContentTransform).toBe(true);
  });
});

test.describe("Hero parallax — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no transform applied with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="parallax"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const nextBtn = root.locator("[data-carousel-next]");
    await nextBtn.click();
    await page.waitForTimeout(100);

    const transforms = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="parallax"]');
      const nodes =
        section?.querySelectorAll<HTMLElement>("[data-hero-media],[data-hero-content]") ?? [];
      return Array.from(nodes).map((n) => n.style.transform);
    });

    const identity = new Set(["", "none"]);
    for (const t of transforms) {
      expect(identity.has(t)).toBe(true);
    }
  });
});
