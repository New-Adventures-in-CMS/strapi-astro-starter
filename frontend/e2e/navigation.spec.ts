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
// Desktop: NavigationMenu submenu layout bounds
// Playwright's toBeVisible() passes for off-screen-translated elements, so we
// must use boundingBox() containment to guard against the full-width blowout
// where the 1920px-wide positioner pushes content off the left edge.
// ---------------------------------------------------------------------------

test.describe("Desktop nav submenu — layout bounds", () => {
  for (const width of [1920, 1280]) {
    test(`submenu panel is within viewport at ${width}px width`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");

      const trigger = page
        .getByRole("navigation", { name: "Navigazione principale" })
        .locator("[data-sw-nav-menu-trigger]")
        .first();
      await trigger.focus();
      await page.keyboard.press("Enter");

      await expect(trigger).toHaveAttribute("data-state", "open");

      const popup = page.locator("[data-sw-nav-menu-popup]");
      await expect(popup).not.toHaveAttribute("hidden");

      const box = await popup.boundingBox();
      expect(box).not.toBeNull();
      // Left edge must be within viewport
      expect(box!.x).toBeGreaterThanOrEqual(0);
      // Right edge must not exceed viewport
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      // Width must be content-sized, not full-window-width
      expect(box!.width).toBeLessThan(400);

      // Both child links must be within viewport bounds
      for (const name of ["Panoramica", "Funzionalità"]) {
        const link = page.getByRole("link", { name });
        const linkBox = await link.boundingBox();
        expect(linkBox).not.toBeNull();
        expect(linkBox!.x).toBeGreaterThanOrEqual(0);
        expect(linkBox!.x + linkBox!.width).toBeLessThanOrEqual(width);
      }
    });
  }
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

// ---------------------------------------------------------------------------
// Whole-layout horizontal overflow — checked at desktop and mobile widths.
// scrollWidth > clientWidth means content bleeds past the viewport edge.
// ---------------------------------------------------------------------------

test.describe("Layout overflow — no horizontal scroll", () => {
  const checkNoHorizontalOverflow = async (
    page: import("@playwright/test").Page,
  ) =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );

  for (const [width, height] of [
    [1920, 1080],
    [1280, 800],
    [768, 1024],
    [375, 812],
  ] as const) {
    test(`no horizontal overflow on homepage at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      expect(await checkNoHorizontalOverflow(page)).toBe(true);
    });

    test(`no horizontal overflow on /esempio at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/esempio");
      expect(await checkNoHorizontalOverflow(page)).toBe(true);
    });
  }
});
