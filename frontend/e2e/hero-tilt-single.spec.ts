import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero tilt — slide singola (percorso static, nessun carosello).
// Verifica: presenza data-hero-static + data-hero-media + data-hero-content;
// dopo pointermove verso un angolo, media e content hanno transform non vuoti
// e diversi (tilt attivo su singola slide); reduced-motion → no transform.
// ---------------------------------------------------------------------------

test.describe("Hero tilt — single slide (static path)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("static markers present (no carousel)", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.locator("[data-hero-static]")).toHaveCount(1);
    await expect(section.locator("[data-hero-media]")).toHaveCount(1);
    await expect(section.locator("[data-hero-content]")).toHaveCount(1);
    await expect(section.locator("[data-hero-carousel]")).toHaveCount(0);
  });

  test("media and content transform after pointermove", async ({ page }) => {
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    const root = section.locator("[data-hero-static]").first();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2);
    await page.waitForTimeout(80);

    const check = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="tilt-single"]');
      const media = s?.querySelector<HTMLElement>("[data-hero-media]");
      const content = s?.querySelector<HTMLElement>("[data-hero-content]");
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

test.describe("Hero tilt single — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no transform with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero");
    const section = page.locator('[data-hero-section="tilt-single"]');
    await section.scrollIntoViewIfNeeded();
    const root = section.locator("[data-hero-static]").first();
    await expect(root).toBeVisible();

    const box = await root.boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2);
    await page.waitForTimeout(80);

    const transforms = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="tilt-single"]');
      const nodes = s?.querySelectorAll<HTMLElement>("[data-hero-media],[data-hero-content]") ?? [];
      return Array.from(nodes).map((n) => n.style.transform);
    });

    const identity = new Set(["", "none"]);
    for (const t of transforms) {
      expect(identity.has(t)).toBe(true);
    }
  });
});
