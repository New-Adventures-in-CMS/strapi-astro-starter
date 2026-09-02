import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && PORT=4321 node ./dist/server/entry.mjs",
    url: "http://localhost:4321",
    // Force Strapi unreachable so rendered nav is always site.nav fallback
    env: { STRAPI_URL: "http://localhost:9999" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
