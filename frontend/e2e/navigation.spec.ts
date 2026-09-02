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

// ---------------------------------------------------------------------------
// Header v2 — Auto-hide (Presence Axis A)
// Directional scroll detection with throttled rAF, focus reveal, motion-safe
// ---------------------------------------------------------------------------

test.describe("Header v2 — auto-hide directional", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("header visible at page top (data-hidden=false)", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-hidden]");
    await expect(header).toHaveAttribute("data-hidden", "false");
  });

  test("header hidden after scrolling down significantly (data-hidden=true)", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-hidden]");

    // Scroll down past threshold (300px > 40px top-threshold, >8px delta per frame)
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(100); // Allow rAF to process

    await expect(header).toHaveAttribute("data-hidden", "true");
  });

  test("header reappears when scrolling up", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-hidden]");

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(100);
    await expect(header).toHaveAttribute("data-hidden", "true");

    // Scroll up
    await page.evaluate(() => window.scrollBy(0, -100));
    await page.waitForTimeout(100);

    await expect(header).toHaveAttribute("data-hidden", "false");
  });

  test("header always visible when near top", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-hidden]");

    // Scroll just to the threshold
    await page.evaluate(() => window.scrollBy(0, 30));
    await page.waitForTimeout(100);

    // Should still be visible (top threshold = 40px)
    await expect(header).toHaveAttribute("data-hidden", "false");
  });

  test("focus on nav reveals header even if hidden", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-hidden]");

    // Scroll down to hide
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(100);
    await expect(header).toHaveAttribute("data-hidden", "true");

    // Focus on first nav link
    const firstLink = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();
    await firstLink.focus();

    // Header should be revealed
    await expect(header).toHaveAttribute("data-hidden", "false");
  });
});

// ---------------------------------------------------------------------------
// Header v2 — Underline styling (Asse B - nav hover/focus/open/active)
// Applied to both transparent and solid states, no background fill
// ---------------------------------------------------------------------------

test.describe("Header v2 — underline nav styling", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("nav trigger has animated underline on hover (pseudo-element scaleX)", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();

    await trigger.hover();

    // Check pseudo-element ::after has scaleX(1) transform (scale X axis should be ~1)
    const pseudoTransform = await trigger.evaluate((el) => {
      const pseudo = window.getComputedStyle(el, "::after");
      return pseudo.transform;
    });

    expect(pseudoTransform).toContain("matrix");
    // Extract the first matrix value (scale X); if it's visible, it should be > 0.1 (not scaleX(0))
    const match = pseudoTransform.match(/matrix\(([^,]+)/);
    const scaleX = match ? parseFloat(match[1]) : 0;
    expect(scaleX).toBeGreaterThan(0.1);
  });

  test("nav trigger text-decoration is none (not text-decoration underline)", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();

    await trigger.focus();
    const styles = await trigger.evaluate((el) => window.getComputedStyle(el));

    // text-decoration should be "none" because underline is via ::after pseudo-element
    expect(styles.textDecoration).toContain("none");
  });

  test("nav trigger has underline on focus via pseudo-element", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();

    await trigger.focus();

    // Check pseudo-element ::after is visible (scaleX > 0)
    const pseudoTransform = await trigger.evaluate((el) => {
      const pseudo = window.getComputedStyle(el, "::after");
      return pseudo.transform;
    });

    expect(pseudoTransform).toContain("matrix");
    // Extract the first matrix value (scale X); if it's visible, it should be > 0.1 (not scaleX(0))
    const match = pseudoTransform.match(/matrix\(([^,]+)/);
    const scaleX = match ? parseFloat(match[1]) : 0;
    expect(scaleX).toBeGreaterThan(0.1);
  });

  test("nav trigger has underline when open via pseudo-element", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();

    await trigger.focus();
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("data-state", "open");

    const pseudoTransform = await trigger.evaluate((el) => {
      const pseudo = window.getComputedStyle(el, "::after");
      return pseudo.transform;
    });

    expect(pseudoTransform).toContain("matrix");
    // Use numeric extraction: "matrix(0.68...)" matches "matrix(0" even when mid-animation
    const matchOpen = pseudoTransform.match(/matrix\(([^,]+)/);
    const scaleXOpen = matchOpen ? parseFloat(matchOpen[1]) : 0;
    expect(scaleXOpen).toBeGreaterThan(0.1);
  });

  test("active nav link has persistent underline via pseudo-element", async ({ page }) => {
    await page.goto("/");

    // Find active link (home page, so first top-level link with data-active)
    const activeLink = page.locator(
      "header [data-slot='navigation-menu-link'][data-active]"
    );

    // There should be at least one active link on homepage
    const count = await activeLink.count();
    if (count > 0) {
      const pseudoTransform = await activeLink.first().evaluate((el) => {
        const pseudo = window.getComputedStyle(el, "::after");
        return pseudo.transform;
      });
      expect(pseudoTransform).toContain("matrix");
      // Numeric extraction avoids false match on "matrix(0.N...)" strings
      const matchActive = pseudoTransform.match(/matrix\(([^,]+)/);
      const scaleXActive = matchActive ? parseFloat(matchActive[1]) : 0;
      expect(scaleXActive).toBeGreaterThan(0.1);
    }
  });

  test("nav trigger background is transparent (no hover bg)", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-trigger']")
      .first();

    await trigger.hover();
    const bgColor = await trigger.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });

    // Should be transparent or rgba with alpha 0 or rgb(0,0,0,0)
    const isTransparent =
      bgColor === "rgba(0, 0, 0, 0)" ||
      bgColor === "rgb(0, 0, 0, 0)" ||
      bgColor === "transparent";
    expect(isTransparent).toBe(true);
  });

  test("nav links (not inside dropdown) have underline on hover", async ({ page }) => {
    await page.goto("/");
    const link = page
      .getByRole("navigation", { name: "Navigazione principale" })
      .locator("[data-slot='navigation-menu-list'] > * > [data-slot='navigation-menu-link']")
      .first();

    await link.hover();

    const pseudoTransform = await link.evaluate((el) => {
      const pseudo = window.getComputedStyle(el, "::after");
      return pseudo.transform;
    });

    expect(pseudoTransform).toContain("matrix");
    expect(pseudoTransform).not.toContain("matrix(0");
  });
});

// ---------------------------------------------------------------------------
// Tablet: breakpoint lg (820px) — hamburger visible, desktop nav hidden
// At 820px the site is below lg breakpoint (1024px), so:
//   - hamburger (Sheet trigger) must be visible
//   - desktop NavigationMenu nav must NOT be visible
//   - Sheet opens on Enter, Escape returns focus to hamburger
// ---------------------------------------------------------------------------

test.describe("Tablet nav — breakpoint lg (820×1180)", () => {
  test.use({ viewport: { width: 820, height: 1180 } });

  test("hamburger is visible at 820px (below lg breakpoint)", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", {
      name: "Apri menu di navigazione",
    });
    await expect(hamburger).toBeVisible();
  });

  test("desktop nav is hidden at 820px", async ({ page }) => {
    await page.goto("/");
    const desktopNav = page.getByRole("navigation", {
      name: "Navigazione principale",
    });
    await expect(desktopNav).not.toBeVisible();
  });

  test("Enter opens Sheet at tablet viewport", async ({ page }) => {
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

  test("Escape closes Sheet and returns focus to hamburger at tablet viewport", async ({ page }) => {
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
