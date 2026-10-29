import { test, expect } from "@playwright/test";

test.describe("Lightbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/lightbox");
  });

  test("thumbnail click opens lightbox at clicked index", async ({ page }) => {
    await page.getByTestId("thumb-2").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-state", "open");

    const slide = page.getByTestId("slide-img-2");
    await expect(slide).toBeVisible();
  });

  test("slide has computed width > 0 (Embla measured after paint)", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();

    await page.waitForTimeout(150);

    const width = await page.evaluate(() => {
      const slide = document.querySelector("[data-carousel-viewport] > * > *");
      return slide ? slide.getBoundingClientRect().width : 0;
    });
    expect(width).toBeGreaterThan(0);
  });

  test("arrow buttons navigate slides", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(150);

    await page.getByTestId("lightbox-next").click();
    await page.waitForTimeout(200);

    const liveText = await page.evaluate(() => {
      const live = document.querySelector("[data-lightbox-carousel] [aria-live='polite']");
      return live?.textContent ?? "";
    });
    expect(liveText).toContain("2 /");
  });

  test("ArrowRight/ArrowLeft keyboard navigates", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    await expect(page.getByTestId("lightbox-dialog")).toBeVisible();
    await page.waitForTimeout(150);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    const liveText = await page.evaluate(() => {
      const live = document.querySelector("[data-lightbox-carousel] [aria-live='polite']");
      return live?.textContent ?? "";
    });
    expect(liveText).toContain("2 /");
  });

  test("Escape closes lightbox", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("close button closes lightbox", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();

    await page.getByTestId("lightbox-close").click();
    await expect(dialog).toBeHidden();
  });

  test("focus returns to thumbnail after close", async ({ page }) => {
    const thumb = page.getByTestId("thumb-3");
    await thumb.click();
    await expect(page.getByTestId("lightbox-dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("lightbox-dialog")).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test("backdrop click does NOT close (closeOnOutsideInteract false)", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();

    const backdrop = page.locator("[data-slot='dialog-backdrop']");
    await backdrop.click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(300);

    await expect(dialog).toBeVisible();
  });

  test("opens directly at clicked index without animation flash", async ({ page }) => {
    await page.getByTestId("thumb-3").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(150);

    const idx1 = await page.evaluate(() => {
      const viewport = document.querySelector("[data-carousel-viewport]");
      if (!viewport) return -1;
      const slides = viewport.querySelectorAll(":scope > * > *");
      for (let i = 0; i < slides.length; i++) {
        const r = slides[i].getBoundingClientRect();
        const vr = viewport.getBoundingClientRect();
        if (r.left >= vr.left && r.right <= vr.right) return i;
      }
      return -1;
    });
    expect(idx1).toBe(3);

    await page.waitForTimeout(200);

    const idx2 = await page.evaluate(() => {
      const viewport = document.querySelector("[data-carousel-viewport]");
      if (!viewport) return -1;
      const slides = viewport.querySelectorAll(":scope > * > *");
      for (let i = 0; i < slides.length; i++) {
        const r = slides[i].getBoundingClientRect();
        const vr = viewport.getBoundingClientRect();
        if (r.left >= vr.left && r.right <= vr.right) return i;
      }
      return -1;
    });
    expect(idx2).toBe(3);
  });

  test("dialog has role=dialog and aria-label", async ({ page }) => {
    await page.getByTestId("thumb-0").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveRole("dialog");
    await expect(dialog).toHaveAttribute("aria-label", "Galleria immagini");
  });
});
