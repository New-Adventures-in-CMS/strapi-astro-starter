import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero tilt collaudo — pattern C (pointer-driven).
// Verifica: presenza media+content; dopo pointermove verso un angolo, media e
// content hanno transform non vuoti e diversi (media ha scale, content solo
// translate); reduced-motion → no transform. Chromium desktop = pointer: fine.
// ---------------------------------------------------------------------------

test.describe("Hero tilt — multi-slide", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("media and content layers present for each carousel slide", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="tilt"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();
    await expect(root.locator("[data-hero-media]")).toHaveCount(3);
    await expect(root.locator("[data-hero-content]")).toHaveCount(3);
  });

  test("media has scale, content only translate after pointermove", async ({
    page,
  }) => {
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="tilt"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    // move toward top-left corner of hero → non-zero normalized coords
    await page.mouse.move(
      box!.x + box!.width * 0.2,
      box!.y + box!.height * 0.2,
    );
    await page.waitForTimeout(80);

    const check = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="tilt"]');
      const media = section?.querySelector<HTMLElement>("[data-hero-media]");
      const content = section?.querySelector<HTMLElement>(
        "[data-hero-content]",
      );
      return {
        mediaTransform: media?.style.transform ?? "",
        contentTransform: content?.style.transform ?? "",
      };
    });

    expect(check.mediaTransform).not.toBe("");
    expect(check.contentTransform).not.toBe("");
    expect(check.mediaTransform).toContain("scale");
    expect(check.contentTransform).not.toContain("scale");
    expect(check.mediaTransform).not.toBe(check.contentTransform);
  });
});

test.describe("Hero tilt — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no transform applied with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const root = page
      .locator('[data-hero-section="tilt"]')
      .locator("[data-hero-carousel]")
      .first();
    await root.scrollIntoViewIfNeeded();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    await page.mouse.move(
      box!.x + box!.width * 0.2,
      box!.y + box!.height * 0.2,
    );
    await page.waitForTimeout(80);

    const transforms = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-section="tilt"]');
      const nodes =
        section?.querySelectorAll<HTMLElement>(
          "[data-hero-media],[data-hero-content]",
        ) ?? [];
      return Array.from(nodes).map((n) => n.style.transform);
    });

    const identity = new Set(["", "none"]);
    for (const t of transforms) {
      expect(identity.has(t)).toBe(true);
    }
  });
});
