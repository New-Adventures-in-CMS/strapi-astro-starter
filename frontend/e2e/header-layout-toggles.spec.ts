import { test, expect } from "@playwright/test";

// Guard the backend-driven header/submenu/footer layout seam. STRAPI_URL is
// forced unreachable by playwright.config.ts, so getSiteSettings() falls back
// to `site.header`/`site.footer` — verifying the reader's fallback path and
// the wiring of the data attributes onto the <header>/<footer> elements.

test.describe("Header layout toggles — data attributes and fallback", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("<header> exposes data-header-width and data-submenu-layout", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveAttribute("data-header-width", /^(full|contained)$/);
    await expect(header).toHaveAttribute(
      "data-submenu-layout",
      /^(full-bleed|dropdown)$/,
    );
  });

  test("fallback path uses site.header defaults (full + full-bleed)", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveAttribute("data-header-width", "full");
    await expect(header).toHaveAttribute("data-submenu-layout", "full-bleed");
  });
});

test.describe("Footer width toggle — data attribute, fallback, inset parity", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("<footer> exposes data-footer-width", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-width", /^(full|contained)$/);
  });

  test("fallback path uses site.footer default (full)", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-width", "full");
  });

  test("full footer inset matches full header inset (same --page-margin-lg)", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    const footer = page.locator("footer").first();
    await expect(header).toHaveAttribute("data-header-width", "full");
    await expect(footer).toHaveAttribute("data-footer-width", "full");

    const headerInsetLeft = await header
      .locator("> div")
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);
    const footerInsetLeft = await footer
      .locator("> div")
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);

    expect(footerInsetLeft).toBe(headerInsetLeft);
    // At 1280px viewport, --page-margin-lg resolves to 80px (≥1024 breakpoint).
    expect(footerInsetLeft).toBe("80px");
  });
});
