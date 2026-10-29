import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Sticky footer — geometry / computed-style checks.
// Footer is sticky at ≥768px, classic (static) below. Content (main) is
// elevated above footer; header stays above content.
// ---------------------------------------------------------------------------

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 667 };

test.describe("Sticky footer (desktop ≥768px)", () => {
  test.use({ viewport: DESKTOP });

  test("footer has position sticky and bottom 0", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const position = await footer.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("sticky");
    const bottom = await footer.evaluate((el) => getComputedStyle(el).bottom);
    expect(bottom).toBe("0px");
  });

  test("main is elevated above footer (z-index)", async ({ page }) => {
    await page.goto("/");
    const mainZ = await page.locator("main").evaluate((el) => {
      return parseInt(getComputedStyle(el).zIndex, 10);
    });
    const footerZ = await page.locator("footer").evaluate((el) => {
      return parseInt(getComputedStyle(el).zIndex, 10);
    });
    expect(mainZ).toBeGreaterThan(footerZ);
  });

  test("header is elevated above main (z-index)", async ({ page }) => {
    await page.goto("/");
    const headerZ = await page.locator("header").evaluate((el) => {
      return parseInt(getComputedStyle(el).zIndex, 10);
    });
    const mainZ = await page.locator("main").evaluate((el) => {
      return parseInt(getComputedStyle(el).zIndex, 10);
    });
    expect(headerZ).toBeGreaterThan(mainZ);
  });

  test("main has opaque background", async ({ page }) => {
    await page.goto("/");
    const bg = await page.locator("main").evaluate((el) => getComputedStyle(el).backgroundColor);
    // Must not be transparent/rgba with 0 alpha
    expect(bg).not.toBe("transparent");
    expect(bg).not.toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*0\)/);
  });

  test("footer is revealed at bottom of scroll", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    // Scroll to very bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const box = await footer.boundingBox();
    expect(box).not.toBeNull();
    // Footer bottom edge should be at or near viewport bottom
    expect(box!.y + box!.height).toBeGreaterThanOrEqual(DESKTOP.height - 2);
    expect(box!.y + box!.height).toBeLessThanOrEqual(DESKTOP.height + 2);
  });
});

test.describe("Sticky footer (mobile <768px)", () => {
  test.use({ viewport: MOBILE });

  test("footer is static (not sticky) on mobile", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const position = await footer.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("static");
  });
});
