import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero focus (scale) collaudo — skin consumer of Phase-1 scroll hooks.
// Verifies: [data-hero-media] presence per slide; active media is pixel-
// perfect scale(1) at rest; in-view off-center media shrinks (<1) during
// drag; absent under reduced-motion; single-slide no-op.
// ---------------------------------------------------------------------------

const SECTION = '[data-hero-section="focus"]';

function isUnitScale(transform: string): boolean {
  if (transform === "" || transform === "none") return true;
  if (/^scale\(\s*1(\.0+)?\s*\)$/.test(transform)) return true;
  // matrix(1, 0, 0, 1, 0, 0) — identity
  if (
    /^matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*,\s*0\s*,\s*0\s*\)$/.test(
      transform,
    )
  )
    return true;
  return false;
}

test.describe("Hero focus — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("each carousel slide exposes [data-hero-media]", async ({ page }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await expect(root).toBeVisible();
    const media = root.locator("[data-hero-slide] [data-hero-media]");
    await expect(media).toHaveCount(3);
  });

  test("active slide media is pixel-perfect scale(1) at rest", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    // wait a tick for setupHeroFocus initial update()
    await page.waitForTimeout(80);

    const activeTransform = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      const firstSlide =
        section?.querySelector<HTMLElement>("[data-hero-slide]") ?? null;
      const media =
        firstSlide?.querySelector<HTMLElement>("[data-hero-media]") ?? null;
      return media?.style.transform ?? "";
    }, SECTION);

    expect(isUnitScale(activeTransform)).toBe(true);
  });

  test("in-view off-center media shrinks (scale<1) during drag", async ({
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

    const hasShrink = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      const nodes =
        section?.querySelectorAll<HTMLElement>("[data-hero-media]") ?? [];
      for (const el of nodes) {
        const inline = el.style.transform;
        if (!inline) continue;
        const m = inline.match(/scale\(\s*([\d.]+)\s*\)/);
        if (m) {
          const v = parseFloat(m[1]);
          if (Number.isFinite(v) && v < 1) return true;
        }
      }
      return false;
    }, SECTION);

    await page.mouse.up();
    expect(hasShrink).toBe(true);
  });
});

test.describe("Hero focus — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no scale applied with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const root = page.locator(SECTION).locator("[data-hero-carousel]").first();
    await expect(root).toBeVisible();
    await root.scrollIntoViewIfNeeded();

    const box = await root.boundingBox();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 8 });
    await page.waitForTimeout(80);

    const transforms = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      return Array.from(
        section?.querySelectorAll<HTMLElement>("[data-hero-media]") ?? [],
      ).map((el) => el.style.transform);
    }, SECTION);

    await page.mouse.up();

    for (const t of transforms) {
      expect(isUnitScale(t)).toBe(true);
    }
  });
});

test.describe("Hero focus — single-slide degradation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("single-slide hero applies no scale to media", async ({ page }) => {
    await page.goto("/dev/hero");
    const wrapper = page.locator("[data-hero-single]");
    await expect(wrapper).toBeVisible();

    const transforms = await wrapper.evaluate((el) => {
      return Array.from(
        el.querySelectorAll<HTMLElement>("[data-hero-media]"),
      ).map((n) => n.style.transform);
    });

    for (const t of transforms) {
      expect(isUnitScale(t)).toBe(true);
    }
  });
});
