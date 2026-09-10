import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero transition strategy collaudo — verifies fade and slide strategies on
// /dev/hero fixture. Parallax strategy coverage lives in hero-parallax.spec.ts.
// ---------------------------------------------------------------------------

test.describe("Hero strategy — fade", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("fade hero has no [data-parallax-layer] elements", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="fade"]')
      .locator("[data-hero-carousel]")
      .first();
    await expect(root).toBeVisible();
    await expect(root.locator("[data-parallax-layer]")).toHaveCount(0);
  });

  test("fade navigation works via next button", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="fade"]');
    const root = section.locator("[data-hero-carousel]").first();
    await expect(root).toBeVisible();
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
    await nextBtn.click();
    await page.waitForTimeout(600);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
  });

  test("fade drag does not advance slides (watchDrag disabled)", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="fade"]');
    const root = section.locator("[data-hero-carousel]").first();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    const dots = root.locator("[data-carousel-dots] button");

    await expect(dots.first()).toHaveAttribute("aria-current", "true");

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 400, cy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // watchDrag: false in fade mode — drag must not change slide
    await expect(dots.first()).toHaveAttribute("aria-current", "true");
  });

  test("reduced-motion: fade autoplay is suppressed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="fade"]');
    const root = section.locator("[data-hero-carousel]").first();
    const firstDot = root.locator("[data-carousel-dots] button").first();
    await expect(firstDot).toHaveAttribute("aria-current", "true");

    await page.waitForTimeout(3500);

    await expect(firstDot).toHaveAttribute("aria-current", "true");
  });
});

test.describe("Hero strategy — slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("slide hero has no [data-parallax-layer] elements", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="slide"]')
      .locator("[data-hero-carousel]")
      .first();
    await expect(root).toBeVisible();
    await expect(root.locator("[data-parallax-layer]")).toHaveCount(0);
  });

  test("slide hero drag advances slides", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="slide"]');
    const root = section.locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    const dots = root.locator("[data-carousel-dots] button");

    await expect(dots.first()).toHaveAttribute("aria-current", "true");

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 400, cy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    await expect(dots.first()).not.toHaveAttribute("aria-current", "true");
  });

  test("slide navigation works via next button", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="slide"]');
    const root = section.locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    const nextBtn = root.locator("[data-carousel-next]");
    const dots = root.locator("[data-carousel-dots] button");

    await expect(dots.first()).toHaveAttribute("aria-current", "true");
    await nextBtn.click();
    await page.waitForTimeout(150);

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
  });
});
