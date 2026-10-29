import { test, expect } from "@playwright/test";

test.describe("Popover", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/popover");
  });

  test("click opens popover and aria-expanded toggles", async ({ page }) => {
    const trigger = page.getByTestId("popover-trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();
  });

  test("content has data-side", async ({ page }) => {
    await page.getByTestId("popover-trigger").click();
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute("data-side", /top|right|bottom|left/);
  });

  test("Escape closes popover", async ({ page }) => {
    await page.getByTestId("popover-trigger").click();
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
  });

  test("click outside closes popover", async ({ page }) => {
    await page.getByTestId("popover-trigger").click();
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();

    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await expect(content).toBeHidden();
  });

  test("z-index above header", async ({ page }) => {
    await page.getByTestId("popover-trigger").click();
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();

    const zIndex = await content.evaluate((el) => getComputedStyle(el).zIndex);
    expect(Number(zIndex)).toBeGreaterThanOrEqual(50);
  });

  test("title font-size is compact (no display scale leak)", async ({ page }) => {
    await page.getByTestId("popover-trigger").click();
    const content = page.getByTestId("popover-content");
    await expect(content).toBeVisible();

    const title = content.locator("[data-slot='popover-title']");
    const fontSize = await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeLessThan(28);
  });

  test("focus returns to trigger on close", async ({ page }) => {
    const trigger = page.getByTestId("popover-trigger");
    await trigger.click();
    await expect(page.getByTestId("popover-content")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});
