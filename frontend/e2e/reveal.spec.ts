import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Motion Fase A — verifica scroll-reveal nativo su /dev/reveal fixture.
// ---------------------------------------------------------------------------

test.describe("Reveal — scroll trigger", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("stagger block is not revealed at load (out of viewport)", async ({
    page,
  }) => {
    await page.goto("/dev/reveal");
    const cardGridStagger = page
      .locator('[data-fixture-block="card-grid"] [data-reveal="stagger"]')
      .first();
    await expect(cardGridStagger).toHaveCount(1);
    await expect(cardGridStagger).not.toHaveClass(/is-revealed/);
  });

  test("card-grid stagger acquires is-revealed after scrollIntoView", async ({
    page,
  }) => {
    await page.goto("/dev/reveal");
    const block = page.locator('[data-fixture-block="card-grid"]');
    const stagger = block.locator('[data-reveal="stagger"]').first();

    await expect(stagger).not.toHaveClass(/is-revealed/);
    await block.scrollIntoViewIfNeeded();
    await expect(stagger).toHaveClass(/is-revealed/);
  });

  test("image-text stagger acquires is-revealed after scrollIntoView", async ({
    page,
  }) => {
    await page.goto("/dev/reveal");
    const block = page.locator('[data-fixture-block="image-text"]');
    const stagger = block.locator('[data-reveal="stagger"]').first();

    await expect(stagger).not.toHaveClass(/is-revealed/);
    await block.scrollIntoViewIfNeeded();
    await expect(stagger).toHaveClass(/is-revealed/);
  });

  test("rich-text single reveal acquires is-revealed after scrollIntoView", async ({
    page,
  }) => {
    await page.goto("/dev/reveal");
    const block = page.locator('[data-fixture-block="rich-text"]');
    const reveal = block.locator("[data-reveal]").first();

    await expect(reveal).not.toHaveClass(/is-revealed/);
    await block.scrollIntoViewIfNeeded();
    await expect(reveal).toHaveClass(/is-revealed/);
  });
});

test.describe("Reveal — reduced motion", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("with prefers-reduced-motion, nodes are revealed at load without scroll", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/reveal");

    const cardGridStagger = page
      .locator('[data-fixture-block="card-grid"] [data-reveal="stagger"]')
      .first();
    const imageTextStagger = page
      .locator('[data-fixture-block="image-text"] [data-reveal="stagger"]')
      .first();
    const richTextReveal = page
      .locator('[data-fixture-block="rich-text"] [data-reveal]')
      .first();

    await expect(cardGridStagger).toHaveClass(/is-revealed/);
    await expect(imageTextStagger).toHaveClass(/is-revealed/);
    await expect(richTextReveal).toHaveClass(/is-revealed/);
  });
});
