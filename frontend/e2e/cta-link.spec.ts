import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// shared.link CTA surfaces — T17
// Fixture: /dev/cta-fixture (inline mock data, no Strapi dependency)
// ---------------------------------------------------------------------------

test.describe("CTA link resolution", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("internal link resolves to /slug", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const link = page.locator('[data-section="hero-left"] a').filter({ hasText: "Internal link" });
    await expect(link).toHaveAttribute("href", "/about");
  });

  test("external link has target=_blank and rel=noopener noreferrer", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const link = page.locator('[data-section="hero-left"] a').filter({ hasText: "External link" });
    await expect(link).toHaveAttribute("href", "https://example.com");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("CTA label is rendered", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const primary = page
      .locator('[data-section="hero-left"] a')
      .filter({ hasText: "Internal link" });
    await expect(primary).toBeVisible();
    const secondary = page
      .locator('[data-section="hero-left"] a')
      .filter({ hasText: "External link" });
    await expect(secondary).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Dual CTA — primary default + secondary outline
// ---------------------------------------------------------------------------

test.describe("CTA variant: secondary is outline", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("secondary CTA uses outline variant (bg-transparent)", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const secondary = page
      .locator('[data-section="hero-left"] a')
      .filter({ hasText: "External link" });
    await expect(secondary).toBeVisible();

    const bg = await secondary.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const isTransparent =
      bg === "rgba(0, 0, 0, 0)" || bg === "rgb(0, 0, 0)" || bg === "transparent";
    expect(isTransparent).toBe(true);
  });

  test("secondary CTA has visible border", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const secondary = page
      .locator('[data-section="hero-left"] a')
      .filter({ hasText: "External link" });
    await expect(secondary).toBeVisible();

    const borderWidth = await secondary.evaluate((el) => window.getComputedStyle(el).borderWidth);
    expect(parseFloat(borderWidth)).toBeGreaterThan(0);
  });

  test("primary CTA has non-transparent background", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const primary = page
      .locator('[data-section="hero-left"] a')
      .filter({ hasText: "Internal link" });
    await expect(primary).toBeVisible();

    const bg = await primary.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const isTransparent =
      bg === "rgba(0, 0, 0, 0)" || bg === "rgb(0, 0, 0, 0)" || bg === "transparent";
    expect(isTransparent).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Hero CTA alignment
// ---------------------------------------------------------------------------

test.describe("Hero CTA alignment", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("left-aligned hero: CTA wrapper has no justify-center", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const ctaWrapper = page
      .locator('[data-section="hero-left"] [data-block="hero"]')
      .locator("div.flex.flex-wrap.gap-3")
      .first();
    await expect(ctaWrapper).toBeVisible();
    await expect(ctaWrapper).not.toHaveClass(/justify-center/);
    await expect(ctaWrapper).not.toHaveClass(/justify-end/);
  });

  test("center-aligned hero: CTA wrapper has justify-center", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const ctaWrapper = page
      .locator('[data-section="hero-center"] [data-block="hero"]')
      .locator("div.flex.flex-wrap.gap-3")
      .first();
    await expect(ctaWrapper).toBeVisible();
    await expect(ctaWrapper).toHaveClass(/justify-center/);
  });
});

// ---------------------------------------------------------------------------
// Card — full_card overlay
// ---------------------------------------------------------------------------

test.describe("Card full_card overlay", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("full_card has stretched link with after:absolute", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const overlay = page.locator('[data-section="card-full"] a.after\\:absolute');
    await expect(overlay).toHaveCount(1);
    await expect(overlay).toHaveAttribute("href", "https://example.com");
  });

  test("full_card overlay has sr-only label", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const srLabel = page.locator('[data-section="card-full"] a .sr-only');
    await expect(srLabel).toHaveText("External link");
  });

  test("button-mode card renders visible CtaLink, not overlay", async ({ page }) => {
    await page.goto("/dev/cta-fixture");
    const visibleLink = page
      .locator('[data-section="card-button"] a')
      .filter({ hasText: "Internal link" });
    await expect(visibleLink).toBeVisible();

    const overlay = page.locator('[data-section="card-button"] a.after\\:absolute');
    await expect(overlay).toHaveCount(0);
  });
});
