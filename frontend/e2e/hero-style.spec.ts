import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// A4 — `heroStyle` preset da CMS → mappa a (transition, effect).
// La fascia `preset-parallax` usa `heroStyle="parallax"` (nessuna prop raw):
// il carousel deve esporre data-hero-transition="fade" + data-hero-effect="parallax".
// Non-regressione: hero senza heroStyle/transition/effect → default `fade` + `none`.
// ---------------------------------------------------------------------------

test.describe("Hero style preset — mappa heroStyle → transition+effect", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("preset-parallax mappa a fade + parallax", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="preset-parallax"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-hero-transition", "fade");
    await expect(root).toHaveAttribute("data-hero-effect", "parallax");
  });

  test("default (nessun heroStyle/transition/effect) → fade + none", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="preset-default"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-hero-transition", "fade");
    await expect(root).toHaveAttribute("data-hero-effect", "none");
  });
});
