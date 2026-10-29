import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero dim (overlay opacity) — compositor-only dimming via black overlay.
// Verifies: [data-hero-dim-overlay] presence per carousel slide; opacity > 0
// on off-center slides during drag; no inline filter on [data-hero-media];
// absent overlay in static mode; no-op under reduced-motion.
// ---------------------------------------------------------------------------

const SECTION = '[data-hero-section="dim"]';

test.describe("Hero dim — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("each carousel slide contains [data-hero-dim-overlay]", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    const overlays = root.locator("[data-hero-slide] [data-hero-dim-overlay]");
    await expect(overlays).toHaveCount(3);
  });

  test("each carousel slide still exposes [data-hero-media]", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    const media = root.locator("[data-hero-slide] [data-hero-media]");
    await expect(media).toHaveCount(3);
  });

  test("off-center overlay acquires opacity > 0 during drag", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 8 });
    await page.waitForTimeout(80);

    const hasDim = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      const overlays = section?.querySelectorAll<HTMLElement>("[data-hero-dim-overlay]") ?? [];
      for (const el of overlays) {
        const val = parseFloat(el.style.opacity);
        if (Number.isFinite(val) && val > 0) return true;
      }
      return false;
    }, SECTION);

    await page.mouse.up();
    expect(hasDim).toBe(true);
  });

  test("no inline filter on [data-hero-media] after drag", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 8 });
    await page.waitForTimeout(80);

    const filters = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      return Array.from(section?.querySelectorAll<HTMLElement>("[data-hero-media]") ?? []).map(
        (el) => el.style.filter,
      );
    }, SECTION);

    await page.mouse.up();

    for (const f of filters) {
      expect(f).toBe("");
    }
  });
});

test.describe("Hero dim — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no overlay opacity applied with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 8 });
    await page.waitForTimeout(80);

    const opacities = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      return Array.from(
        section?.querySelectorAll<HTMLElement>("[data-hero-dim-overlay]") ?? [],
      ).map((el) => el.style.opacity);
    }, SECTION);

    await page.mouse.up();

    for (const o of opacities) {
      expect(o === "" || o === "0").toBe(true);
    }
  });
});

test.describe("Hero dim — static mode", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("static hero has no [data-hero-dim-overlay]", async ({ page }) => {
    await page.goto("/dev/hero");
    const wrapper = page.locator("[data-hero-single]");
    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).toBeVisible();
    const overlays = wrapper.locator("[data-hero-dim-overlay]");
    await expect(overlays).toHaveCount(0);
  });
});
