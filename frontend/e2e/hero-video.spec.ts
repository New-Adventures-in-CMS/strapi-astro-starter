import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Hero video — BlockHeroStatic with media_type="video".
// Checks: <video> element presence, poster attribute, data-hero-video marker,
// autoplay NOT in HTML (script-driven), effect guards (tilt/ken-burns disabled),
// immersive sentinel, and reduced-motion pauses video.
// ---------------------------------------------------------------------------

const DESKTOP = { width: 1280, height: 800 };

function heroLocator(page: Page, section: string) {
  return page.locator(`[data-hero-section="${section}"] [data-block="hero"]`);
}

test.describe("Hero video — structure", () => {
  test.use({ viewport: DESKTOP });

  test("video hero renders <video> with correct attributes", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-non-immersive");
    await expect(hero).toBeVisible();

    const video = hero.locator("video[data-hero-video]");
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute("muted", "");
    await expect(video).toHaveAttribute("loop", "");
    await expect(video).toHaveAttribute("playsinline", "");
    await expect(video).toHaveAttribute("preload", "metadata");

    const autoplay = await video.getAttribute("autoplay");
    expect(autoplay).toBeNull();
  });

  test("video hero has poster from poster field", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-non-immersive");
    const video = hero.locator("video[data-hero-video]");
    const poster = await video.getAttribute("poster");
    expect(poster).toBeTruthy();
    expect(poster).toContain("POSTER");
  });

  test("video hero has <source> with mp4 type", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-non-immersive");
    const source = hero.locator("video[data-hero-video] source");
    await expect(source).toHaveCount(1);
    await expect(source).toHaveAttribute("type", "video/mp4");
    const src = await source.getAttribute("src");
    expect(src).toContain(".mp4");
  });

  test("video has absolute inset-0 positioning and object-cover", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-non-immersive");
    const video = hero.locator("video[data-hero-video]");
    await expect(video).toHaveClass(/absolute/);
    await expect(video).toHaveClass(/inset-0/);
    await expect(video).toHaveClass(/object-cover/);
  });
});

test.describe("Hero video — immersive", () => {
  test.use({ viewport: DESKTOP });

  test("immersive video hero has sentinel for header overlay", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-immersive");
    await expect(hero).toBeVisible();
    const sentinel = hero.locator("#header-overlay-sentinel");
    await expect(sentinel).toHaveCount(1);
  });

  test("immersive video hero has 100svh height", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-immersive");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/min-h-\[100svh\]/);
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(DESKTOP.height * 0.99);
  });
});

test.describe("Hero video — effect guards", () => {
  test.use({ viewport: DESKTOP });

  test("tilt effect is NOT applied when media is video", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const section = page.locator('[data-hero-section="video-effect-tilt"]');
    await section.scrollIntoViewIfNeeded();
    const root = section.locator("[data-hero-static]").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-hero-effect", "tilt");

    const box = await root.boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2);
    await page.waitForTimeout(100);

    const transforms = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="video-effect-tilt"]');
      const media = s?.querySelector<HTMLElement>("[data-hero-media]");
      const content = s?.querySelector<HTMLElement>("[data-hero-content]");
      return {
        mediaTransform: media?.style.transform ?? "",
        contentTransform: content?.style.transform ?? "",
      };
    });

    const identity = new Set(["", "none"]);
    expect(identity.has(transforms.mediaTransform)).toBe(true);
    expect(identity.has(transforms.contentTransform)).toBe(true);
  });

  test("ken-burns effect is NOT applied when media is video", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const section = page.locator('[data-hero-section="video-effect-kenburns"]');
    await section.scrollIntoViewIfNeeded();
    const root = section.locator("[data-hero-static]").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-hero-effect", "ken-burns");

    const animation = await page.evaluate(() => {
      const s = document.querySelector('[data-hero-section="video-effect-kenburns"]');
      const media = s?.querySelector<HTMLElement>("[data-hero-media]");
      return media?.style.animation ?? "";
    });

    const none = new Set(["", "none"]);
    expect(none.has(animation)).toBe(true);
  });
});

test.describe("Hero video — reduced motion", () => {
  test.use({ viewport: DESKTOP });

  test("video is paused when prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "video-non-immersive");
    await expect(hero).toBeVisible();

    const videoState = await page.evaluate(() => {
      const v = document.querySelector<HTMLVideoElement>("video[data-hero-video]");
      return { paused: v?.paused ?? true, currentTime: v?.currentTime ?? -1 };
    });

    expect(videoState.paused).toBe(true);
    expect(videoState.currentTime).toBe(0);
  });
});

test.describe("Hero video — image regression", () => {
  test.use({ viewport: DESKTOP });

  test("image hero still renders StrapiImage, no <video>", async ({ page }) => {
    await page.goto("/dev/hero-video");
    const hero = heroLocator(page, "image-regression");
    await expect(hero).toBeVisible();
    const video = hero.locator("video[data-hero-video]");
    await expect(video).toHaveCount(0);
    const img = hero.locator("[data-hero-media]");
    await expect(img).toHaveCount(1);
  });
});
