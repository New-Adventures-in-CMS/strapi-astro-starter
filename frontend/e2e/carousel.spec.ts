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

// ---------------------------------------------------------------------------
// Fade transition variant — tests against the [data-demo-carousel-fade] instance
// ---------------------------------------------------------------------------

test.describe("Carousel fade — navigation (crossfade)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("fade carousel renders with first slide selected", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    await expect(root).toBeVisible();

    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");
  });

  test("Next button advances to slide 2 (crossfade)", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(400);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.first()).not.toHaveAttribute("data-active");
  });

  test("Prev button goes back to slide 1 (crossfade)", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    const nextBtn = root.locator("[data-carousel-next]");
    const prevBtn = root.locator("[data-carousel-prev]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(400);
    await prevBtn.click();
    await page.waitForTimeout(400);

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });

  test("ArrowRight key advances fade slide", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    const dots = root.locator("[data-carousel-dots] button");

    await root.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(400);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
  });

  test("ArrowLeft key goes back in fade mode", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    await page.waitForTimeout(400);
    await root.focus();
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(400);

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });
});

test.describe("Carousel fade — slides stacked (same boundingBox)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("active slide always appears at the same position after navigation", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    await expect(root).toBeVisible();

    const slideContainer = root.locator("[data-carousel-viewport] > div");

    // Slide 0 is active on load — capture its rendered position
    const box0 = await slideContainer.locator("> div").nth(0).boundingBox();

    // Navigate to slide 1
    const nextBtn = root.locator("[data-carousel-next]");
    await nextBtn.click();
    await page.waitForTimeout(400);

    // Slide 1 is now active — the Fade plugin applies translateX(scrollSnaps[1]) to it,
    // countering its flex offset so it lands at the same x as slide 0 was
    const box1 = await slideContainer.locator("> div").nth(1).boundingBox();

    expect(box0).not.toBeNull();
    expect(box1).not.toBeNull();
    expect(box1!.x).toBeCloseTo(box0!.x, 0);
  });
});

test.describe("Carousel fade — drag no-op", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("drag does not change slide in fade mode", async ({ page }) => {
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    // Drag left — would advance in slide mode, should be no-op in fade
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 8 });
    await page.waitForTimeout(80);
    await page.mouse.up();
    await page.waitForTimeout(200);

    const dots = root.locator("[data-carousel-dots] button");
    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });
});

test.describe("Carousel fade — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("fade + reduced-motion: slide changes instantly (dot updates within 50ms)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await nextBtn.click();
    // duration:0 + Fade plugin → fadeToSelectedSnapInstantly fires in select handler
    await page.waitForTimeout(50);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
  });

  test("fade + reduced-motion: slides remain STACKED (same boundingBox as non-reduced fade)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/carousel");
    const root = page.locator("[data-demo-carousel-fade]");
    await expect(root).toBeVisible();

    const slideContainer = root.locator("[data-carousel-viewport] > div");

    // Capture slide 0 position before navigation (Fade plugin stacks it at x=0 within viewport)
    const box0 = await slideContainer.locator("> div").nth(0).boundingBox();

    const nextBtn = root.locator("[data-carousel-next]");
    await nextBtn.click();
    await page.waitForTimeout(50);

    // Slide 1 is now active — Fade plugin (still mounted) positions it at the same x as slide 0 was.
    // If Fade() were skipped, Embla would use slide transport and slide 1 would be offset by ~slideWidth.
    const box1 = await slideContainer.locator("> div").nth(1).boundingBox();

    expect(box0).not.toBeNull();
    expect(box1).not.toBeNull();
    expect(box1!.x).toBeCloseTo(box0!.x, 0);
  });
});
