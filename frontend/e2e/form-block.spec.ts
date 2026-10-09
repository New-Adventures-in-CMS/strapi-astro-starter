import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Form block — verifies the contacts page renders the seeded form.
// Requires Strapi running with seed data (unlike other e2e that stub it).
// Run manually: STRAPI_URL=http://localhost:1337 npx playwright test e2e/form-block.spec.ts
// ---------------------------------------------------------------------------

test.describe("Form block — contacts page", () => {
  test.skip(
    !process.env.STRAPI_URL || process.env.STRAPI_URL.includes("9999"),
    "Skipped: needs real Strapi (STRAPI_URL must point to a running instance with seed data)",
  );

  test("renders form with nome, email, messaggio fields", async ({ page }) => {
    await page.goto("/pagine/contacts");
    const form = page.locator("form#dform-contatti");
    await expect(form).toBeVisible();
    await expect(page.locator("#dform-contatti-nome")).toBeVisible();
    await expect(page.locator("#dform-contatti-email")).toBeVisible();
    await expect(page.locator("#dform-contatti-messaggio")).toBeVisible();
    await expect(form.locator("button[type=submit]")).toBeVisible();
  });
});
