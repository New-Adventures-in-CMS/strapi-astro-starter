import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Anchor links — T23 (three-mode linkMode: anchor / internal / external)
// Fixture: /dev/anchor-fixture (inline mock data, no Strapi dependency)
// ---------------------------------------------------------------------------

test.describe("Anchor link resolution", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("anchor mode renders href #slugified-id (same page)", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page
      .locator('[data-section="hero-anchor"] a')
      .filter({ hasText: "Jump to features" });
    await expect(link).toHaveAttribute("href", "#features");
  });

  test("internal mode + anchor renders href /slug#anchor (cross-page)", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page
      .locator('[data-section="hero-anchor"] a')
      .filter({ hasText: "Jump to About FAQ" });
    await expect(link).toHaveAttribute("href", "/about#about-faq");
  });

  test("external mode ignores anchor field (href = pure URL)", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page
      .locator('[data-section="external-anchor"] a')
      .filter({ hasText: "External docs" });
    await expect(link).toHaveAttribute("href", "https://docs.astro.build");
  });

  test("internal mode without page is suppressed (href #)", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page.locator('[data-section="dead-cta"] a').filter({ hasText: "Dead link" });
    await expect(link).toHaveCount(0);
  });

  test("slugified id on target matches anchor href fragment", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const target = page.locator("#features");
    await expect(target).toHaveCount(1);
    const link = page
      .locator('[data-section="hero-anchor"] a')
      .filter({ hasText: "Jump to features" });
    const href = await link.getAttribute("href");
    const fragment = href!.replace("#", "");
    await expect(target).toHaveAttribute("id", fragment);
  });

  test("hero block anchor_id renders as id on section element", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const heroSection = page.locator('[data-block="hero"]#hero-top');
    await expect(heroSection).toHaveCount(1);
  });

  test("anchor CTA targeting hero resolves to #hero-top", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page
      .locator('[data-section="hero-anchor-cta"] a')
      .filter({ hasText: "Jump to hero" });
    await expect(link).toHaveAttribute("href", "#hero-top");
  });

  test("focus moves to target after same-page anchor click", async ({ page }) => {
    await page.goto("/dev/anchor-fixture");
    const link = page
      .locator('[data-section="hero-anchor"] a')
      .filter({ hasText: "Jump to features" });
    await link.click();
    await page.waitForTimeout(600);
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe("features");
  });
});
