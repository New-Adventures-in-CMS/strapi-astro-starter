import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Carousel skeleton collaudo — tests against /dev/carousel fixture route
// All assertions use boundingBox() where spatial position matters.
// ---------------------------------------------------------------------------

test.describe("Carousel — basic navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("carousel renders with first slide selected (selectedIndex = 0)", async ({
    page,
  }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    await expect(root).toBeVisible();

    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");
    await expect(firstDot).toHaveAttribute("data-active", "");
  });

  test("Next button advances to slide 2", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(100);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.first()).not.toHaveAttribute("data-active");
  });

  test("Prev button goes back to slide 1", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const nextBtn = root.locator("[data-carousel-next]");
    const prevBtn = root.locator("[data-carousel-prev]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(100);
    await prevBtn.click();
    await page.waitForTimeout(100);

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });

  test("Prev button is disabled at first slide (no loop)", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const prevBtn = root.locator("[data-carousel-prev]");
    await expect(prevBtn).toBeDisabled();
  });

  test("Next button is disabled at last slide (no loop)", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const nextBtn = root.locator("[data-carousel-next]");

    for (let i = 0; i < 4; i++) {
      await nextBtn.click();
      await page.waitForTimeout(80);
    }

    await expect(nextBtn).toBeDisabled();
  });

  test("Dot click navigates to that slide", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const dots = root.locator("[data-carousel-dots] button");

    await dots.nth(2).click();
    await page.waitForTimeout(100);

    await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
  });

  test("ArrowRight key advances slide", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const dots = root.locator("[data-carousel-dots] button");

    await root.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
  });

  test("ArrowLeft key goes back", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(100);
    await root.focus();
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(100);

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });

  test("carousel root has role=region and aria-roledescription=carousel", async ({
    page,
  }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    await expect(root).toHaveAttribute("role", "region");
    await expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  test("carousel root is within viewport bounds", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const box = await root.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
  });
});

test.describe("Carousel — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("autoplay off with prefers-reduced-motion: reduce (no slide advance)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel]");
    const dots = root.locator("[data-carousel-dots] button");

    await page.waitForTimeout(500);
    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });
});
