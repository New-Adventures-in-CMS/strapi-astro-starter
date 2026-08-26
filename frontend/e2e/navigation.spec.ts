import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Desktop: NavigationMenu keyboard a11y (viewport ≥ 768 px)
// Assertions target primitives' actual runtime attributes:
//   trigger  → data-sw-nav-menu-trigger, aria-expanded, data-state
//   content  → data-sw-nav-menu-content, data-state, hidden
// The webServer env forces STRAPI_URL unreachable so site.nav fallback is
// used — guaranteeing a nested item exists at deterministic position.
// ---------------------------------------------------------------------------

test.describe("Desktop nav submenu", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // Scope to desktop nav landmark; first trigger is the submenu item
  const getDesktopTrigger = (page: import("@playwright/test").Page) =>
    page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-sw-nav-menu-trigger]")
      .first();

  test("closed state initially", async ({ page }) => {
    await page.goto("/");
    const trigger = getDesktopTrigger(page);
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("data-state", "closed");
  });

  test("Enter opens submenu", async ({ page }) => {
    await page.goto("/");
    const trigger = getDesktopTrigger(page);
    await trigger.focus();

    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute("data-state", "open");

    const content = page.locator("[data-sw-nav-menu-content]");
    await expect(content).toHaveAttribute("data-state", "open");
    await expect(content).not.toHaveAttribute("hidden");
  });

  test("ArrowDown moves focus into content", async ({ page }) => {
    await page.goto("/");
    const trigger = getDesktopTrigger(page);
    await trigger.focus();

    // ArrowDown opens AND moves focus to first focusable item in content
    await page.keyboard.press("ArrowDown");

    await expect(trigger).toHaveAttribute("data-state", "open");
    const content = page.locator("[data-sw-nav-menu-content]");
    const firstLink = content.locator("a").first();
    await expect(firstLink).toBeFocused();
  });

  test("Escape closes and returns focus to trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = getDesktopTrigger(page);
    await trigger.focus();

    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("data-state", "open");
    await page.keyboard.press("ArrowDown");

    await page.keyboard.press("Escape");

    await expect(trigger).toHaveAttribute("data-state", "closed");
    await expect(trigger).toBeFocused();
  });

  test("Space also opens submenu", async ({ page }) => {
    await page.goto("/");
    const trigger = getDesktopTrigger(page);
    await trigger.focus();

    await page.keyboard.press("Space");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute("data-state", "open");
  });
});

// ---------------------------------------------------------------------------
// Mobile: Sheet (Drawer) keyboard a11y (viewport < 768 px)
// Assertions target:
//   trigger  → button[aria-label="Apri menu di navigazione"], data-state
//   sheet    → dialog[data-sw-drawer-popup], data-state
// ---------------------------------------------------------------------------

test.describe("Mobile Sheet nav", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger is visible at mobile viewport", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", {
      name: "Apri menu di navigazione",
    });
    await expect(hamburger).toBeVisible();
  });

  test("Enter opens sheet", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", {
      name: "Apri menu di navigazione",
    });
    await hamburger.focus();

    await page.keyboard.press("Enter");

    const sheet = page.locator("dialog[data-sw-drawer-popup]");
    await expect(sheet).toHaveAttribute("data-state", "open");
    await expect(sheet).toBeVisible();
  });

  test("Tab stays within sheet (focus trap)", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", {
      name: "Apri menu di navigazione",
    });
    await hamburger.focus();
    await page.keyboard.press("Enter");

    const sheet = page.locator("dialog[data-sw-drawer-popup]");
    await expect(sheet).toHaveAttribute("data-state", "open");

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const isContained = await page.evaluate(() => {
        const dialog = document.querySelector("dialog[data-sw-drawer-popup]");
        return dialog?.contains(document.activeElement) ?? false;
      });
      expect(isContained).toBe(true);
    }
  });

  test("Escape closes sheet and returns focus to hamburger", async ({
    page,
  }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", {
      name: "Apri menu di navigazione",
    });
    await hamburger.focus();
    await page.keyboard.press("Enter");

    const sheet = page.locator("dialog[data-sw-drawer-popup]");
    await expect(sheet).toHaveAttribute("data-state", "open");

    await page.keyboard.press("Escape");

    await expect(sheet).toHaveAttribute("data-state", "closed");
    await expect(hamburger).toBeFocused();
  });
});
