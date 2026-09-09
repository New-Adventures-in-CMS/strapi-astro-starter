import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero slider collaudo — tests BlockHero as second consumer of createCarousel.
// Answers question 2: does a second consumer use createCarousel without
// touching the skeleton module?
// All spatial assertions use boundingBox().
// ---------------------------------------------------------------------------

test.describe("Hero slider — multi-slide carousel", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("carousel root is within viewport bounds (boundingBox)", async ({
    page,
  }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    await expect(root).toBeVisible();
    const box = await root.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test("carousel has role=region and aria-roledescription=carousel", async ({
    page,
  }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    await expect(root).toHaveAttribute("role", "region");
    await expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  test("first dot is active on load", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");
    await expect(firstDot).toHaveAttribute("data-active", "");
  });

  test("has 3 dot indicators matching slide count", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    await expect(root.locator("[data-carousel-dots] button")).toHaveCount(3);
  });

  test("next button advances to slide 2", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(150);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.first()).not.toHaveAttribute("data-active");
  });

  test("prev button wraps around (loop=true)", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const prevBtn = root.locator("[data-carousel-prev]");
    const dots = root.locator("[data-carousel-dots] button");

    // On first slide, prev wraps to last (loop)
    await prevBtn.click();
    await page.waitForTimeout(150);

    await expect(dots.last()).toHaveAttribute("aria-current", "true");
  });

  test("dot click navigates to that slide", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const dots = root.locator("[data-carousel-dots] button");

    await dots.nth(2).click();
    await page.waitForTimeout(150);

    await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
  });

  test("autoplay advances slide without user interaction", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");

    // Fixture uses autoplayDelay=3000ms; wait with buffer
    await page.waitForTimeout(3500);

    await expect(firstDot).not.toHaveAttribute("aria-current", "true");
  });

  test("hover pauses autoplay", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");

    // Hover to pause autoplay
    await root.hover();
    await page.waitForTimeout(3500);

    // Still on first slide — autoplay was paused
    await expect(firstDot).toHaveAttribute("aria-current", "true");
  });
});

test.describe("Hero slider — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no autoplay with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero-slider");
    const root = page.locator("[data-hero-carousel]").first();
    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");

    await page.waitForTimeout(3500);

    // Autoplay suppressed — still on first slide
    await expect(firstDot).toHaveAttribute("aria-current", "true");
  });
});

test.describe("Hero slider — single slide degradation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("single slide renders without carousel controls", async ({ page }) => {
    await page.goto("/dev/hero-slider");

    // The single-slide hero is inside [data-hero-single]
    const wrapper = page.locator("[data-hero-single]");
    await expect(wrapper).toBeVisible();

    // No data-hero-carousel attribute means no Embla init
    await expect(wrapper.locator("[data-hero-carousel]")).toHaveCount(0);

    // No dot indicators
    await expect(wrapper.locator("[data-carousel-dots]")).toHaveCount(0);

    // No nav buttons
    await expect(wrapper.locator("[data-carousel-prev]")).toHaveCount(0);
    await expect(wrapper.locator("[data-carousel-next]")).toHaveCount(0);
  });

  test("single slide heading is visible", async ({ page }) => {
    await page.goto("/dev/hero-slider");
    const wrapper = page.locator("[data-hero-single]");
    await expect(wrapper.locator("h1")).toContainText("Static single slide.");
  });
});
