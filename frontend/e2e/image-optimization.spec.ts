import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Image-optimization pipeline — StrapiImage renders <picture> for raster,
// plain <img> for SVG, preserves data-hero-media and mask-reveal wrappers.
// Uses /dev/images fixture (local assets, no Strapi dependency).
// ---------------------------------------------------------------------------

test.describe("Image optimization", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("raster hero renders <picture> with avif + webp sources", async ({ page }) => {
    await page.goto("/dev/images");

    const heroBlock = page.locator('[data-fixture-block="hero"]');
    const picture = heroBlock.locator("picture");
    await expect(picture).toHaveCount(1);

    const avifSource = picture.locator('source[type="image/avif"]');
    const webpSource = picture.locator('source[type="image/webp"]');
    await expect(avifSource).toHaveCount(1);
    await expect(webpSource).toHaveCount(1);

    // avif and webp sources must have srcset
    await expect(avifSource).toHaveAttribute("srcset", /\/_image/);
    await expect(webpSource).toHaveAttribute("srcset", /\/_image/);
  });

  test("raster hero <img> has eager loading and fetchpriority=high", async ({ page }) => {
    await page.goto("/dev/images");

    const heroImg = page.locator('[data-fixture-block="hero"] picture img');
    await expect(heroImg).toHaveAttribute("loading", "eager");
    await expect(heroImg).toHaveAttribute("fetchpriority", "high");
    await expect(heroImg).toHaveAttribute("decoding", "async");
  });

  test("raster hero <img> has srcset with multiple widths", async ({ page }) => {
    await page.goto("/dev/images");

    const heroImg = page.locator('[data-fixture-block="hero"] picture img');
    const srcset = await heroImg.getAttribute("srcset");
    expect(srcset).toBeTruthy();
    // Should have multiple entries (comma-separated)
    const entries = srcset!.split(",").map((s) => s.trim());
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  test("data-hero-media is forwarded to raster <img> inside <picture>", async ({ page }) => {
    await page.goto("/dev/images");

    const heroImg = page.locator('[data-fixture-block="hero"] picture img[data-hero-media]');
    await expect(heroImg).toHaveCount(1);
  });

  test("SVG renders plain <img>, not <picture>", async ({ page }) => {
    await page.goto("/dev/images");

    const svgBlock = page.locator('[data-fixture-block="svg-image"]');
    const picture = svgBlock.locator("picture");
    await expect(picture).toHaveCount(0);

    const img = svgBlock.locator("img[data-testid='svg-img']");
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("decoding", "async");

    // SVG img src should point to the .svg file directly (no /_image proxy)
    const src = await img.getAttribute("src");
    expect(src).toMatch(/\.svg/);
    expect(src).not.toMatch(/\/_image/);
  });

  test("mask-reveal wrapper is preserved around raster <picture>", async ({ page }) => {
    await page.goto("/dev/images");

    const cardBlock = page.locator('[data-fixture-block="card-raster"]');
    const maskReveal = cardBlock.locator("[data-mask-reveal]");
    await expect(maskReveal).toHaveCount(1);

    // picture is inside the mask-reveal wrapper
    const picture = maskReveal.locator("picture");
    await expect(picture).toHaveCount(1);

    // img inside picture has lazy loading
    const img = picture.locator("img");
    await expect(img).toHaveAttribute("loading", "lazy");
  });

  test("<picture> has class='contents' (no layout interference)", async ({ page }) => {
    await page.goto("/dev/images");

    const pictures = page.locator('[data-fixture-block="hero"] picture');
    await expect(pictures.first()).toHaveClass(/contents/);
  });
});
