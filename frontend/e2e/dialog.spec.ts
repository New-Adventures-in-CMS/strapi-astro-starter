import { test, expect } from "@playwright/test";

test.describe("Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/dialog");
  });

  test("trigger opens dialog", async ({ page }) => {
    const trigger = page.getByTestId("dialog-trigger");
    await trigger.click();

    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-state", "open");
  });

  test("focus trapped inside dialog", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    const focusableInDialog = dialog.locator(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    const count = await focusableInDialog.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press("Tab");
    }

    const activeEl = page.locator(":focus");
    await expect(activeEl).toHaveAttribute("data-slot", /(dialog-close|dialog-content)/);
  });

  test("Escape closes dialog", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("backdrop click closes dialog", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    const backdrop = page.locator("[data-slot='dialog-backdrop']");
    await backdrop.click({ position: { x: 10, y: 10 }, force: true });
    await expect(dialog).toBeHidden();
  });

  test("Close button closes dialog", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    await dialog.locator("[data-slot='dialog-close']").click();
    await expect(dialog).toBeHidden();
  });

  test("focus returns to trigger on close", async ({ page }) => {
    const trigger = page.getByTestId("dialog-trigger");
    await trigger.click();
    await expect(page.locator("[data-slot='dialog-content']")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test("role=dialog and aria-modal", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    const dialog = page.locator("[data-slot='dialog-content']");
    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("scroll lock while open", async ({ page }) => {
    await page.getByTestId("dialog-trigger").click();
    await expect(page.locator("[data-slot='dialog-content']")).toBeVisible();

    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).toBe("hidden");
  });
});
