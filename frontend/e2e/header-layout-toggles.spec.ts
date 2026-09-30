import { test, expect } from "@playwright/test";

// Guard the backend-driven header/submenu/footer layout seam. STRAPI_URL is
// forced unreachable by playwright.config.ts, so getSiteSettings() falls back
// to `site.header`/`site.footer` — verifying the reader's fallback path and
// the wiring of the data attributes onto the <header>/<footer> elements.

test.describe("Header layout toggles — data attributes and fallback", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("<header> exposes data-header-width and data-submenu-layout", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveAttribute(
      "data-header-width",
      /^(full|contained)$/,
    );
    await expect(header).toHaveAttribute(
      "data-submenu-layout",
      /^(full-bleed|dropdown)$/,
    );
  });

  test("fallback path uses site.header defaults (full + full-bleed)", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveAttribute("data-header-width", "full");
    await expect(header).toHaveAttribute("data-submenu-layout", "full-bleed");
  });
});

test.describe("Footer width toggle — data attribute, fallback, inset parity", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("<footer> exposes data-footer-width", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute(
      "data-footer-width",
      /^(full|contained)$/,
    );
  });

  test("fallback path uses site.footer default (full)", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-width", "full");
  });

  test("full footer inset matches full header inset (same --page-margin-lg)", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    const footer = page.locator("footer").first();
    await expect(header).toHaveAttribute("data-header-width", "full");
    await expect(footer).toHaveAttribute("data-footer-width", "full");

    const headerInsetLeft = await header
      .locator("> div")
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);
    const footerInsetLeft = await footer
      .locator("> div")
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);

    expect(footerInsetLeft).toBe(headerInsetLeft);
    // At 1280px viewport, --page-margin-lg resolves to 80px (≥1024 breakpoint).
    expect(footerInsetLeft).toBe("80px");
  });
});

test.describe("Footer tone toggle — data attribute, fallback, coordinated fg", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("<footer> exposes data-footer-tone", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-tone", /^(muted|dark)$/);
  });

  test("fallback path uses site.footer.tone default (dark)", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-tone", "dark");
  });

  test("dark tone coordinates foreground: link resolves to on-dark token (high luminance)", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toHaveAttribute("data-footer-tone", "dark");

    // Parse any CSS color (rgb/rgba/color-mix/color()) into [r,g,b,a] via canvas.
    const parseColor = (selector: string, prop: "color" | "backgroundColor") =>
      page.evaluate(
        ({ sel, p }) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) return null;
          const raw = getComputedStyle(el)[p as any];
          const cvs = document.createElement("canvas");
          cvs.width = cvs.height = 1;
          const ctx = cvs.getContext("2d")!;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = raw;
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          return { raw, r: d[0], g: d[1], b: d[2], a: d[3] };
        },
        { sel: selector, p: prop },
      );

    const bg = await parseColor("footer > div", "backgroundColor");
    expect(bg).not.toBeNull();
    // Dark bg: each channel low (≤ 40 is generous for near-black).
    expect(bg!.r).toBeLessThanOrEqual(40);
    expect(bg!.g).toBeLessThanOrEqual(40);
    expect(bg!.b).toBeLessThanOrEqual(40);

    const link = await parseColor("footer a", "color");
    expect(link).not.toBeNull();
    // On-dark fg tokens are white or near-white (with alpha mixed onto black bg).
    // After compositing on black via canvas, R/G/B should still be high (≥ 180).
    expect(link!.r).toBeGreaterThanOrEqual(180);
    expect(link!.g).toBeGreaterThanOrEqual(180);
    expect(link!.b).toBeGreaterThanOrEqual(180);
  });
});
