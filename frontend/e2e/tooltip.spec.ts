import { test, expect } from "@playwright/test";

test.describe("Tooltip", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/tooltip");
  });

  test("hover opens tooltip", async ({ page }) => {
    const trigger = page.getByTestId("tooltip-trigger-1");
    await trigger.hover();

    const content = page.getByTestId("tooltip-content-1");
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test("keyboard focus opens tooltip", async ({ page }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const content = page.locator("[data-slot='tooltip-content'][data-state='open']");
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test("role=tooltip and aria-describedby", async ({ page }) => {
    const trigger = page.getByTestId("tooltip-trigger-1");
    await trigger.hover();

    const content = page.getByTestId("tooltip-content-1");
    await expect(content).toBeVisible({ timeout: 5000 });
    await expect(content).toHaveRole("tooltip");

    const tooltipId = await content.getAttribute("id");
    expect(tooltipId).toBeTruthy();

    const triggerDescribedby = await trigger.getAttribute("aria-describedby");
    expect(triggerDescribedby).toContain(tooltipId!);
  });

  test("Escape closes tooltip", async ({ page }) => {
    const trigger = page.getByTestId("tooltip-trigger-1");
    await trigger.hover();

    const content = page.getByTestId("tooltip-content-1");
    await expect(content).toBeVisible({ timeout: 5000 });

    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
  });

  test("tooltip popup has no tabindex", async ({ page }) => {
    const trigger = page.getByTestId("tooltip-trigger-1");
    await trigger.hover();

    const content = page.getByTestId("tooltip-content-1");
    await expect(content).toBeVisible({ timeout: 5000 });

    const tabindex = await content.getAttribute("tabindex");
    expect(tabindex).toBeNull();
  });
});
