import { test, expect } from "@playwright/test";

test.describe("Accordion — single mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/accordion");
  });

  test("Tab key reaches triggers", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );
    await page.keyboard.press("Tab");
    await expect(triggers.nth(0)).toBeFocused();
  });

  test("Enter opens an item and sets aria-expanded", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );
    const items = page.locator('[data-testid="accordion-single"] [data-slot="accordion-item"]');

    await triggers.nth(0).focus();
    await page.keyboard.press("Enter");

    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(items.nth(0)).toHaveAttribute("data-state", "open");
  });

  test("Space toggles an item", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );

    await triggers.nth(0).focus();
    await page.keyboard.press("Space");
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Space");
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
  });

  test("opening one item closes the other in single mode", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );

    await triggers.nth(0).click();
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");

    await triggers.nth(2).click();
    await expect(triggers.nth(2)).toHaveAttribute("aria-expanded", "true");
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
  });

  test("collapsible allows closing the only open item", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );

    await triggers.nth(0).click();
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");

    await triggers.nth(0).click();
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
  });

  test("disabled item does not open", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-single"] [data-slot="accordion-trigger"]',
    );

    await triggers.nth(1).click({ force: true });
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Accordion — multiple mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/accordion");
  });

  test("multiple items can be open simultaneously", async ({ page }) => {
    const triggers = page.locator(
      '[data-testid="accordion-multiple"] [data-slot="accordion-trigger"]',
    );

    await triggers.nth(0).click();
    await triggers.nth(1).click();

    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  });
});
