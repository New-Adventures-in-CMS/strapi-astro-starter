import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero parallax (depth, pointer-driven) collaudo — pattern C.
// Verifies: [data-hero-media] and [data-hero-content] present; on pointer
// move media and content transforms differ (parallax differential) and are
// non-empty; reduced-motion → no transform; leave/reset → media at scale(1.08)
// with zero translate, content without translate.
// ---------------------------------------------------------------------------

const SECTION = '[data-hero-section="parallax"]';

test.describe("Hero parallax — pointer-driven", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
  });

  test("section exposes [data-hero-media] and [data-hero-content]", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const section = page.locator(SECTION);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.locator("[data-hero-media]").first()).toBeAttached();
    await expect(section.locator("[data-hero-content]").first()).toBeAttached();
  });

  test("pointer move produces differential transform between media and content", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const section = page.locator(SECTION);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const root = section.locator("[data-hero-carousel]").first();
    const box = await root.boundingBox();
    // corner of hero → nx, ny near +1
    const cx = box!.x + box!.width * 0.9;
    const cy = box!.y + box!.height * 0.9;

    await page.mouse.move(cx, cy);
    await page.waitForTimeout(60);

    const result = await page.evaluate((sel) => {
      const s = document.querySelector(sel);
      const m = s?.querySelector<HTMLElement>("[data-hero-media]");
      const c = s?.querySelector<HTMLElement>("[data-hero-content]");
      return {
        media: m?.style.transform ?? "",
        content: c?.style.transform ?? "",
      };
    }, SECTION);

    expect(result.media).not.toBe("");
    expect(result.content).not.toBe("");
    expect(result.media).not.toBe(result.content);
  });

  test("pointer leave restores neutral transforms", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator(SECTION);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const root = section.locator("[data-hero-carousel]").first();
    const box = await root.boundingBox();
    const cx = box!.x + box!.width * 0.9;
    const cy = box!.y + box!.height * 0.9;

    await page.mouse.move(cx, cy);
    await page.waitForTimeout(60);
    // move well outside the hero to trigger pointerleave
    await page.mouse.move(1, 1);
    await page.waitForTimeout(60);

    const result = await page.evaluate((sel) => {
      const s = document.querySelector(sel);
      const m = s?.querySelector<HTMLElement>("[data-hero-media]");
      const c = s?.querySelector<HTMLElement>("[data-hero-content]");
      return {
        media: m?.style.transform ?? "",
        content: c?.style.transform ?? "",
      };
    }, SECTION);

    const zero =
      /translate3d\(\s*-?0(?:\.0+)?px\s*,\s*-?0(?:\.0+)?px\s*,\s*0(?:px)?\s*\)/;
    expect(result.media).toMatch(/scale\(\s*1\.08\s*\)/);
    expect(result.media).toMatch(zero);
    expect(result.content).toMatch(zero);
  });
});

test.describe("Hero parallax — reduced motion", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
  });

  test("no transform applied with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const section = page.locator(SECTION);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const root = section.locator("[data-hero-carousel]").first();
    const box = await root.boundingBox();
    const cx = box!.x + box!.width * 0.9;
    const cy = box!.y + box!.height * 0.9;

    await page.mouse.move(cx, cy);
    await page.waitForTimeout(60);

    const result = await page.evaluate((sel) => {
      const s = document.querySelector(sel);
      const nodes = s?.querySelectorAll<HTMLElement>(
        "[data-hero-media], [data-hero-content]",
      );
      return Array.from(nodes ?? []).map((el) => el.style.transform);
    }, SECTION);

    for (const t of result) {
      expect(t === "" || t === "none").toBe(true);
    }
  });
});
