import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Effect switches — geometry / attribute checks for stickyShell and
// imageMaskReveal. Strapi is unreachable, so getSiteSettings() falls back to
// defaults (both true). ON state is verified from the built page; OFF state
// is simulated by removing the gate attribute at runtime.
// ---------------------------------------------------------------------------

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 667 };

// ── stickyShell ─────────────────────────────────────────────────────────────

test.describe("stickyShell ON (default fallback)", () => {
  test.use({ viewport: DESKTOP });

  test("body has data-sticky-footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveAttribute("data-sticky-footer", "");
  });

  test("immersive hero page has data-sticky-hero on main", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    const hasStickyHero = await main.evaluate((el) => el.hasAttribute("data-sticky-hero"));
    if (hasStickyHero) {
      await expect(main).toHaveAttribute("data-sticky-hero", "");
    }
  });

  test("footer is sticky at ≥768px", async ({ page }) => {
    await page.goto("/");
    const position = await page.locator("footer").evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("sticky");
  });
});

test.describe("stickyShell OFF (attribute removed)", () => {
  test.use({ viewport: DESKTOP });

  test("removing data-sticky-footer reverts footer to static", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.removeAttribute("data-sticky-footer");
    });
    const position = await page.locator("footer").evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("static");
  });

  test("removing data-sticky-footer reverts main z-index", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.removeAttribute("data-sticky-footer");
    });
    const zIndex = await page.locator("main").evaluate((el) => getComputedStyle(el).zIndex);
    expect(zIndex).toBe("auto");
  });
});

// ── imageMaskReveal ─────────────────────────────────────────────────────────

test.describe("imageMaskReveal ON — mask present (fixture)", () => {
  test.use({ viewport: DESKTOP });

  test("body has data-mask-images", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    await expect(page.locator("body")).toHaveAttribute("data-mask-images", "");
  });

  test("mask-reveal element has clip-path inset (initial hidden state)", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    const clipPath = await page
      .locator("[data-mask-reveal]")
      .first()
      .evaluate((el) => getComputedStyle(el).clipPath);
    expect(clipPath).toContain("inset");
  });

  test("mask-reveal img has scale transform (initial state)", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    const transform = await page
      .locator("[data-mask-reveal] > img")
      .first()
      .evaluate((el) => getComputedStyle(el).transform);
    // scale(1.1) serialises as a matrix; non-identity means scale is applied
    expect(transform).not.toBe("none");
    expect(transform).toContain("matrix");
  });
});

test.describe("imageMaskReveal OFF — clear image, stagger alive (fixture)", () => {
  test.use({ viewport: DESKTOP });

  test("removing data-mask-images clears clip-path", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    await page.evaluate(() => {
      document.body.removeAttribute("data-mask-images");
    });
    const clipPath = await page
      .locator("[data-mask-reveal]")
      .first()
      .evaluate((el) => getComputedStyle(el).clipPath);
    expect(clipPath).toBe("none");
  });

  test("removing data-mask-images clears img scale", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    await page.evaluate(() => {
      document.body.removeAttribute("data-mask-images");
    });
    const transform = await page
      .locator("[data-mask-reveal] > img")
      .first()
      .evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe("none");
  });

  test("stagger children still have translateY (separability)", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    await page.evaluate(() => {
      document.body.removeAttribute("data-mask-images");
    });
    const stagger = page
      .locator('[data-fixture-block="card-grid"] [data-reveal="stagger"]')
      .first();
    await expect(stagger).not.toHaveClass(/is-revealed/);
    const child = stagger.locator("> *").first();
    const opacity = await child.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(0);
    const transform = await child.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toContain("matrix");
  });

  test("data-mask-grid amplified translateY survives OFF", async ({ page }) => {
    await page.goto("/dev/mask-reveal");
    await page.evaluate(() => {
      document.body.removeAttribute("data-mask-images");
    });
    const child = page.locator('[data-reveal="stagger"][data-mask-grid] > *').first();
    const transform = await child.evaluate((el) => getComputedStyle(el).transform);
    // translateY(40px) → matrix(1, 0, 0, 1, 0, 40)
    expect(transform).toContain("40");
  });
});

// ── stickyShell mobile ──────────────────────────────────────────────────────

test.describe("stickyShell ON — mobile stays classic", () => {
  test.use({ viewport: MOBILE });

  test("footer is static on mobile even with data-sticky-footer", async ({ page }) => {
    await page.goto("/");
    const position = await page.locator("footer").evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("static");
  });
});
