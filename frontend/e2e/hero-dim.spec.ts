import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero dim (brightness) collaudo — skin consumer of Phase-1 scroll hooks.
// Verifies: [data-hero-media] presence per slide; brightness(<1) on in-view
// off-center media during drag; absent under reduced-motion; single no-op.
// ---------------------------------------------------------------------------

const SECTION = '[data-hero-section="dim"]';

function hasSubUnitBrightness(filter: string): boolean {
  const m = filter.match(/brightness\(\s*([\d.]+)\s*\)/);
  if (!m) return false;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) && v < 1;
}

test.describe("Hero dim — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("each carousel slide exposes [data-hero-media]", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    const media = root.locator("[data-hero-slide] [data-hero-media]");
    await expect(media).toHaveCount(3);
  });

  test("in-view off-center media acquires brightness(<1) during drag", async ({
    page,
  }) => {
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
      const nodes =
        section?.querySelectorAll<HTMLElement>("[data-hero-media]") ?? [];
      for (const el of nodes) {
        const inline = el.style.filter;
        if (inline) {
          const m = inline.match(/brightness\(\s*([\d.]+)\s*\)/);
          if (m && parseFloat(m[1]) < 1) return true;
        }
        const computed = getComputedStyle(el).filter;
        if (computed && computed !== "none") {
          const m2 = computed.match(/brightness\(\s*([\d.]+)\s*\)/);
          if (m2 && parseFloat(m2[1]) < 1) return true;
        }
      }
      return false;
    }, SECTION);

    await page.mouse.up();
    expect(hasDim).toBe(true);
  });
});

test.describe("Hero dim — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no filter applied with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
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

    const filters = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      return Array.from(
        section?.querySelectorAll<HTMLElement>("[data-hero-media]") ?? [],
      ).map((el) => el.style.filter);
    }, SECTION);

    await page.mouse.up();

    for (const f of filters) {
      expect(hasSubUnitBrightness(f)).toBe(false);
    }
  });
});

test.describe("Hero dim — single-slide degradation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("single-slide hero applies no filter to media", async ({ page }) => {
    await page.goto("/dev/hero");
    const wrapper = page.locator("[data-hero-single]");
    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).toBeVisible();

    const filters = await wrapper.evaluate((el) => {
      return Array.from(
        el.querySelectorAll<HTMLElement>("[data-hero-media]"),
      ).map((n) => n.style.filter);
    });

    for (const f of filters) {
      expect(hasSubUnitBrightness(f)).toBe(false);
    }
  });
});
