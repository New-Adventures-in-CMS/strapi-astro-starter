import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Search overlay — open/close behaviour, focus management, a11y.
// Runs against any seeded page (home); no dedicated fixture needed.
// ---------------------------------------------------------------------------

test.describe("Search overlay", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  const getTrigger = (page: import("@playwright/test").Page) => page.locator("#search-trigger");

  const getOverlay = (page: import("@playwright/test").Page) => page.locator("#search-overlay");

  const getInput = (page: import("@playwright/test").Page) => page.locator("#search-input");

  test("trigger has aria-expanded=false initially", async ({ page }) => {
    await page.goto("/");
    const trigger = getTrigger(page);
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("click opens panel with visible bounding box", async ({ page }) => {
    await page.goto("/");
    const trigger = getTrigger(page);
    await trigger.click();
    await page.waitForTimeout(400);

    const overlay = getOverlay(page);
    await expect(overlay).not.toHaveAttribute("hidden", "");
    const box = await overlay.locator("[data-search-popup]").boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThan(0);
  });

  test("input receives focus on open", async ({ page }) => {
    await page.goto("/");
    await getTrigger(page).click();
    await page.waitForTimeout(400);
    await expect(getInput(page)).toBeFocused();
  });

  test("Escape closes panel and returns focus to trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = getTrigger(page);
    await trigger.click();
    await page.waitForTimeout(400);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await expect(getOverlay(page)).toHaveAttribute("hidden", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("form submits to /search with query param", async ({ page }) => {
    await page.goto("/");
    await getTrigger(page).click();
    await page.waitForTimeout(400);

    const input = getInput(page);
    await input.fill("test query");
    await input.press("Enter");

    await page.waitForURL(/\/search\?q=test\+query/);
    await expect(page.locator("text=test query")).toBeVisible();
  });
});
