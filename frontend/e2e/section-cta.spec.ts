import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Section-level CTA — T20
// Fixture: /dev/section-cta-fixture (inline mock data, no Strapi dependency)
// ---------------------------------------------------------------------------

test.describe("Section CTA", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // ── Presence ────────────────────────────────────────────────

  test("card-grid: section CTA present when valued", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="card-grid-cta"] [data-section-cta]');
    await expect(cta).toBeVisible();
    await expect(cta.locator("a")).toHaveCount(2);
  });

  test("card-grid: section CTA absent when empty", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="card-grid-no-cta"] [data-section-cta]');
    await expect(cta).toHaveCount(0);
  });

  test("carousel: section CTA present when valued", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="carousel-cta"] [data-section-cta]');
    await expect(cta).toBeVisible();
    await expect(cta.locator("a")).toHaveCount(2);
  });

  test("gallery grid: section CTA present when valued", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="gallery-grid-cta"] [data-section-cta]');
    await expect(cta).toBeVisible();
  });

  test("gallery carousel: section CTA present when valued", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="gallery-carousel-cta"] [data-section-cta]');
    await expect(cta).toBeVisible();
  });

  // ── Alignment ──────────────────────────────────────────────

  test("card-grid CTA inherits center alignment", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="card-grid-cta"] [data-section-cta]');
    await expect(cta).toHaveClass(/justify-center/);
  });

  test("carousel CTA inherits left alignment (no justify-center)", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="carousel-cta"] [data-section-cta]');
    await expect(cta).not.toHaveClass(/justify-center/);
  });

  test("gallery grid CTA inherits center alignment", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="gallery-grid-cta"] [data-section-cta]');
    await expect(cta).toHaveClass(/justify-center/);
  });

  test("gallery carousel CTA inherits left alignment", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const cta = page.locator('[data-section="gallery-carousel-cta"] [data-section-cta]');
    await expect(cta).not.toHaveClass(/justify-center/);
  });

  // ── Link resolution ────────────────────────────────────────

  test("primary CTA: internal link resolves to /slug", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const primary = page
      .locator('[data-section="card-grid-cta"] [data-section-cta] a')
      .filter({ hasText: "View all" });
    await expect(primary).toHaveAttribute("href", "/about");
  });

  test("secondary CTA: external link has target=_blank and rel", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const secondary = page
      .locator('[data-section="card-grid-cta"] [data-section-cta] a')
      .filter({ hasText: "Docs" });
    await expect(secondary).toHaveAttribute("href", "https://example.com");
    await expect(secondary).toHaveAttribute("target", "_blank");
    await expect(secondary).toHaveAttribute("rel", "noopener noreferrer");
  });

  // ── Variant styling ────────────────────────────────────────

  test("secondary CTA renders with outline variant", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const secondary = page
      .locator('[data-section="card-grid-cta"] [data-section-cta] a')
      .filter({ hasText: "Docs" });
    await expect(secondary).toBeVisible();

    const bg = await secondary.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const isTransparent =
      bg === "rgba(0, 0, 0, 0)" || bg === "rgb(0, 0, 0, 0)" || bg === "transparent";
    expect(isTransparent).toBe(true);
  });

  // ── On-dark behavior ──────────────────────────────────────

  test("dark section: CTA buttons sit inside data-tone=dark", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const section = page.locator('[data-section="card-grid-dark"] section[data-tone="dark"]');
    await expect(section).toBeVisible();
    const cta = section.locator("[data-section-cta]");
    await expect(cta).toBeVisible();
    await expect(cta.locator("a")).toHaveCount(2);
  });

  test("dark section: primary CTA has light background (inverted)", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const primary = page
      .locator('[data-section="card-grid-dark"] [data-section-cta] a')
      .filter({ hasText: "View all" });
    await expect(primary).toBeVisible();

    const bg = await primary.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    expect(r).toBeGreaterThan(200);
    expect(g).toBeGreaterThan(200);
    expect(b).toBeGreaterThan(200);
  });

  test("dark section: secondary CTA has transparent bg (distinct from primary)", async ({
    page,
  }) => {
    await page.goto("/dev/section-cta-fixture");
    const secondary = page
      .locator('[data-section="card-grid-dark"] [data-section-cta] a')
      .filter({ hasText: "Docs" });
    await expect(secondary).toBeVisible();

    const bg = await secondary.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const isTransparent =
      bg === "rgba(0, 0, 0, 0)" || bg === "rgb(0, 0, 0, 0)" || bg === "transparent";
    expect(isTransparent).toBe(true);
  });

  test("light section: primary CTA has dark background (unchanged)", async ({ page }) => {
    await page.goto("/dev/section-cta-fixture");
    const primary = page
      .locator('[data-section="card-grid-cta"] [data-section-cta] a')
      .filter({ hasText: "View all" });
    await expect(primary).toBeVisible();

    const bg = await primary.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    expect(r).toBeLessThan(50);
    expect(g).toBeLessThan(50);
    expect(b).toBeLessThan(50);
  });
});
