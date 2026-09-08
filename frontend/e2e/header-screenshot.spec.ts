import { test } from "@playwright/test";
import path from "path";

// Takes header screenshots for visual audit — not part of CI suite.
// Run manually: npx playwright test e2e/header-screenshot.spec.ts

const OUT = path.join(process.cwd(), "e2e/screenshots");

test("header at top (transparent/overlay state)", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT, "header-top.png"),
    clip: { x: 0, y: 0, width: 1280, height: 100 },
  });
});

test("header visible in solid state (scroll down then back up)", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(300);
  // Scroll down far enough to trigger solid state and hide
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(200);
  // Scroll up to reveal header (now in solid state, data-hidden=false)
  await page.evaluate(() => window.scrollBy(0, -80));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT, "header-solid.png"),
    clip: { x: 0, y: 0, width: 1280, height: 100 },
  });
});
