import { test, expect } from "@playwright/test";

test.describe("Tabs — horizontal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/tabs");
  });

  test("first tab is selected by default", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(0)).toHaveAttribute("tabindex", "0");
  });

  test("arrow right moves focus to next tab (roving tabindex)", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");

    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(tabs.nth(0)).toHaveAttribute("tabindex", "-1");
  });

  test("arrow left moves focus to previous tab", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");

    await expect(tabs.nth(0)).toBeFocused();
    await expect(tabs.nth(0)).toHaveAttribute("tabindex", "0");
  });

  test("Home key moves focus to first tab", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Home");

    await expect(tabs.nth(0)).toBeFocused();
    await expect(tabs.nth(0)).toHaveAttribute("tabindex", "0");
  });

  test("End key moves focus to last tab", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await tabs.nth(0).focus();
    await page.keyboard.press("End");

    await expect(tabs.nth(2)).toBeFocused();
    await expect(tabs.nth(2)).toHaveAttribute("tabindex", "0");
  });

  test("Enter activates a focused tab", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');
    const panels = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-content"]');

    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");

    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(panels.nth(1)).toBeVisible();
  });

  test("active panel is visible, others are hidden", async ({ page }) => {
    const panels = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-content"]');

    await expect(panels.nth(0)).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();
    await expect(panels.nth(2)).toBeHidden();
  });

  test("clicking a tab switches the visible panel", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');
    const panels = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-content"]');

    await tabs.nth(2).click();

    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(panels.nth(2)).toBeVisible();
    await expect(panels.nth(0)).toBeHidden();
  });

  test("aria-selected inverts on tab change", async ({ page }) => {
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "false");

    await tabs.nth(1).click();

    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("indicator is visible with non-zero width and slides on tab change", async ({ page }) => {
    const indicator = page.locator('[data-testid="tabs-horizontal"] [data-sw-tabs-indicator]');
    const tabs = page.locator('[data-testid="tabs-horizontal"] [data-slot="tabs-trigger"]');

    await expect(indicator).toBeVisible();
    const box1 = await indicator.boundingBox();
    expect(box1).not.toBeNull();
    expect(box1!.width).toBeGreaterThan(0);
    expect(box1!.height).toBeGreaterThan(0);

    const tab1Box = await tabs.nth(0).boundingBox();
    expect(tab1Box).not.toBeNull();
    expect(box1!.x).toBeCloseTo(tab1Box!.x, -1);
    expect(box1!.width).toBeCloseTo(tab1Box!.width, -1);

    await tabs.nth(2).click();
    await page.waitForTimeout(500);

    const box2 = await indicator.boundingBox();
    expect(box2).not.toBeNull();
    const tab3Box = await tabs.nth(2).boundingBox();
    expect(tab3Box).not.toBeNull();
    expect(Math.abs(box2!.x - tab3Box!.x)).toBeLessThan(15);
    expect(Math.abs(box2!.width - tab3Box!.width)).toBeLessThan(15);

    expect(Math.abs(box2!.x - box1!.x)).toBeGreaterThan(20);
  });
});
