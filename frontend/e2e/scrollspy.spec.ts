import { test, expect } from "@playwright/test";

/** Scroll a section's top to the viewport top so it crosses the IO trigger band. */
async function scrollToTop(page: import("@playwright/test").Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "start" });
  }, selector);
}

test.describe("Scrollspy — active section tracking", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("first section is active on load", async ({ page }) => {
    await page.goto("/dev/scrollspy");
    const introLink = page.locator('[data-nav-link="intro"]');
    await expect(introLink).toHaveAttribute("data-active", "");
  });

  test("scrolling to features activates features link", async ({ page }) => {
    await page.goto("/dev/scrollspy");
    const featuresLink = page.locator('[data-nav-link="features"]');
    const introLink = page.locator('[data-nav-link="intro"]');

    await scrollToTop(page, "#features");
    await expect(featuresLink).toHaveAttribute("data-active", "");
    await expect(introLink).not.toHaveAttribute("data-active", "");
  });

  test("scrolling to contact activates contact link", async ({ page }) => {
    await page.goto("/dev/scrollspy");
    const contactLink = page.locator('[data-nav-link="contact"]');
    const featuresLink = page.locator('[data-nav-link="features"]');

    await scrollToTop(page, "#contact");
    await expect(contactLink).toHaveAttribute("data-active", "");
    await expect(featuresLink).not.toHaveAttribute("data-active", "");
  });

  test("last section active at page bottom", async ({ page }) => {
    await page.goto("/dev/scrollspy");
    const contactLink = page.locator('[data-nav-link="contact"]');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(contactLink).toHaveAttribute("data-active", "");
  });
});
