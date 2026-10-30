import { test, expect } from "@playwright/test";

test.describe("BlockFaq", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/faq");
  });

  test("renders FAQ accordion with items", async ({ page }) => {
    const accordion = page.locator('[data-slot="accordion"]');
    await expect(accordion).toBeVisible();

    const items = accordion.locator('[data-slot="accordion-item"]');
    await expect(items).toHaveCount(4);
  });

  test("rich-text answer renders as HTML (bold and link)", async ({ page }) => {
    const triggers = page.locator('[data-slot="accordion"] [data-slot="accordion-trigger"]');
    await triggers.nth(0).click();

    const content = page.locator('[data-slot="accordion"] [data-slot="accordion-content"]').nth(0);
    await expect(content).toBeVisible();

    await expect(content.locator("strong").first()).toBeVisible();
    await expect(content.locator("a").first()).toBeVisible();
  });

  test("click toggles accordion panel open and closed", async ({ page }) => {
    const trigger = page.locator('[data-slot="accordion"] [data-slot="accordion-trigger"]').nth(0);

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard Enter and Space toggle accordion panel", async ({ page }) => {
    const trigger = page.locator('[data-slot="accordion"] [data-slot="accordion-trigger"]').nth(0);

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("h3 wrapper is present around each trigger", async ({ page }) => {
    const accordion = page.locator('[data-slot="accordion"]');
    const h3Triggers = accordion.locator("h3 [data-slot='accordion-trigger']");
    await expect(h3Triggers).toHaveCount(4);
  });
});
