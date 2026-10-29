import { test, expect } from "@playwright/test";

test.describe("Marquee — accessibility & reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("duplicate track is aria-hidden", async ({ page }) => {
    await page.goto("/dev/marquee");
    const marquee = page.locator('[data-fixture="default"] .marquee').first();
    const tracks = marquee.locator(".marquee__track");

    await expect(tracks).toHaveCount(2);
    await expect(tracks.nth(0)).not.toHaveAttribute("aria-hidden", "true");
    await expect(tracks.nth(1)).toHaveAttribute("aria-hidden", "true");
  });

  test("animation stops with prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/marquee");

    const track = page.locator('[data-fixture="default"] .marquee__track').first();
    const animationName = await track.evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");
  });
});
