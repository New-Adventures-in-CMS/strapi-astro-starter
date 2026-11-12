import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero split dispatch — both BlockHeroStatic and BlockHeroSlider render
// correctly from the dev fixtures. Verifies the split component model:
// slider → carousel, static → no carousel.
// ---------------------------------------------------------------------------

test.describe("Hero split dispatch — slider vs static", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("slider section renders carousel with controls", async ({ page }) => {
    await page.goto("/dev/hero");
    const drift = page.locator('[data-hero-section="drift"]');
    await expect(drift).toBeVisible();

    const carousel = drift.locator("[data-hero-carousel]");
    await expect(carousel).toHaveCount(1);
    await expect(carousel.locator("[data-carousel-dots]")).toHaveCount(1);
    await expect(carousel.locator("[data-carousel-prev]")).toHaveCount(1);
    await expect(carousel.locator("[data-carousel-next]")).toHaveCount(1);
  });

  test("static section renders without carousel", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    await expect(section.locator("[data-hero-static]")).toHaveCount(1);
    await expect(section.locator("[data-hero-carousel]")).toHaveCount(0);
    await expect(section.locator("[data-carousel-dots]")).toHaveCount(0);
  });

  test("both slider and static emit data-block='hero'", async ({ page }) => {
    await page.goto("/dev/hero");

    const slider = page.locator('[data-hero-section="fade"]').locator("[data-block='hero']");
    await expect(slider).toHaveCount(1);

    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    const staticHero = section.locator("[data-block='hero']");
    await expect(staticHero).toHaveCount(1);
  });

  test("static hero exposes data-hero-effect attribute", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    const hero = section.locator("[data-hero-static]");
    await expect(hero).toHaveAttribute("data-hero-effect", "tilt");
  });

  test("slider hero exposes data-hero-transition and data-hero-effect", async ({ page }) => {
    await page.goto("/dev/hero");
    const carousel = page
      .locator('[data-hero-section="drift"]')
      .locator("[data-hero-carousel]")
      .first();
    await expect(carousel).toBeVisible();
    await expect(carousel).toHaveAttribute("data-hero-transition", "slide");
    await expect(carousel).toHaveAttribute("data-hero-effect", "drift");
  });
});
