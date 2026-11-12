import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero banner — aspect_ratio on BlockHeroStatic + BlockHeroSlider.
// Checks RENDERED height (not just class presence) to catch Tailwind purge
// issues where classes exist in HTML but not in generated CSS.
// ---------------------------------------------------------------------------

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 812 };

function heroLocator(page: Page, section: string) {
  return page.locator(`[data-hero-section="${section}"] [data-block="hero"]`);
}

test.describe("Hero banner — desktop aspect ratios (static)", () => {
  test.use({ viewport: DESKTOP });

  test("16:9 banner renders at correct aspect height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-16-9");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/aspect-video/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThan(400);
    expect(box!.height).toBeCloseTo((box!.width * 9) / 16, -1);
  });

  test("21:9 banner renders at correct aspect height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-21-9");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/aspect-\[21\/9\]/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThan(300);
    expect(box!.height).toBeCloseTo((box!.width * 9) / 21, -1);
  });

  test("3:1 banner renders at correct aspect height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-3-1");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/aspect-\[3\/1\]/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThan(200);
    expect(box!.height).toBeCloseTo(box!.width / 3, -1);
  });

  test("no-ratio banner uses default 80vh height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-none");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/min-h-\[70vh\]/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(DESKTOP.height * 0.79);
  });

  test("immersive overrides aspect_ratio to 100svh", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-immersive");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/min-h-\[100svh\]/);
    const cls = await hero.getAttribute("class");
    expect(cls).not.toContain("aspect-");
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(DESKTOP.height * 0.99);
  });
});

test.describe("Hero banner — desktop aspect ratios (slider)", () => {
  test.use({ viewport: DESKTOP });

  test("non-immersive slider 21:9 renders at correct aspect height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "slider-21-9");
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThan(300);
    expect(box!.height).toBeCloseTo((box!.width * 9) / 21, -1);
  });

  test("non-immersive slider default uses 80vh height", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "slider-default");
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(DESKTOP.height * 0.79);
  });

  test("non-immersive slider has visible slides", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "slider-21-9");
    await expect(hero).toBeVisible();
    const slide = hero.locator("[data-hero-slide]").first();
    const slideBox = await slide.boundingBox();
    expect(slideBox!.height).toBeGreaterThan(300);
    expect(slideBox!.width).toBeGreaterThan(0);
  });
});

test.describe("Hero banner — mobile floor", () => {
  test.use({ viewport: MOBILE });

  test("static banner has 60vh mobile floor", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "banner-21-9");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/min-h-\[60vh\]/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(MOBILE.height * 0.59);
  });

  test("slider banner has 60vh mobile floor", async ({ page }) => {
    await page.goto("/dev/hero-banner");
    const hero = heroLocator(page, "slider-21-9");
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(MOBILE.height * 0.59);
  });
});
