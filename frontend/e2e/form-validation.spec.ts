import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Client-side form validation e2e.
// Requires Strapi running with seed data (contacts form).
// Run: STRAPI_URL=http://localhost:1337 npx playwright test e2e/form-validation.spec.ts
// ---------------------------------------------------------------------------

test.describe("Form client-side validation", () => {
  test.skip(
    !process.env.STRAPI_URL || process.env.STRAPI_URL.includes("9999"),
    "Skipped: needs real Strapi (STRAPI_URL must point to a running instance with seed data)",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/pagine/contacts");
    await expect(page.locator("form#dform-contatti")).toBeVisible();
  });

  test("submit empty form → shows errors + focus on first invalid", async ({ page }) => {
    const form = page.locator("form#dform-contatti");
    await form.locator("button[type=submit]").click();

    const nomeError = page.locator("#dform-contatti-nome-error");
    await expect(nomeError).toBeVisible();
    await expect(nomeError).toHaveText("Campo obbligatorio");

    const emailError = page.locator("#dform-contatti-email-error");
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText("Campo obbligatorio");

    const nomeInput = page.locator("#dform-contatti-nome");
    await expect(nomeInput).toHaveAttribute("aria-invalid", "true");
    await expect(nomeInput).toBeFocused();
  });

  test("malformed email → shows email error", async ({ page }) => {
    const form = page.locator("form#dform-contatti");

    await page.locator("#dform-contatti-nome").fill("Test User");
    await page.locator("#dform-contatti-email").fill("not-an-email");
    await page.locator("#dform-contatti-messaggio").fill("Hello");
    await form.locator("button[type=submit]").click();

    const emailError = page.locator("#dform-contatti-email-error");
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText("Indirizzo email non valido");
    await expect(page.locator("#dform-contatti-email")).toHaveAttribute("aria-invalid", "true");

    await expect(page.locator("#dform-contatti-nome-error")).not.toBeVisible();
  });

  test("correcting a flagged field clears its error on input", async ({ page }) => {
    const form = page.locator("form#dform-contatti");
    await form.locator("button[type=submit]").click();

    const nomeError = page.locator("#dform-contatti-nome-error");
    await expect(nomeError).toBeVisible();

    await page.locator("#dform-contatti-nome").fill("Fixed");
    await expect(nomeError).not.toBeVisible();
    await expect(page.locator("#dform-contatti-nome")).not.toHaveAttribute("aria-invalid");
  });

  test("valid submit → form submits successfully", async ({ page }) => {
    await page.locator("#dform-contatti-nome").fill("Test User");
    await page.locator("#dform-contatti-email").fill("test@example.com");
    await page.locator("#dform-contatti-messaggio").fill("Test message for e2e");

    const form = page.locator("form#dform-contatti");
    await form.locator("button[type=submit]").click();

    const successEl = page.locator("#dform-contatti-success");
    await expect(successEl).toBeVisible({ timeout: 10000 });
  });
});
