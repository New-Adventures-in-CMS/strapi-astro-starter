import { test, expect } from "@playwright/test";

// Guard the backend-driven header/submenu layout seam. STRAPI_URL is forced
// unreachable by playwright.config.ts, so getSiteSettings() falls back to
// `site.header` — verifying the reader's fallback path and the wiring of
// the two data attributes onto the <header> element.

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
