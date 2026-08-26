// frontend/astro.config.mjs
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// Keep in sync with frontend/src/config/site.ts → site.url
const SITE_URL = "https://example.com";

export default defineConfig({
  site: SITE_URL,
  output: "server",
  adapter: node({ mode: "standalone" }),
  env: {
    schema: {
      STRAPI_URL: envField.string({ context: "server", access: "secret" }),
      STRAPI_API_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      PUBLIC_STRAPI_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  integrations: [
    sitemap(),
    // i18n: not active — see SETUP.md → "i18n (predisposto)"
  ],
  image: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      // { protocol: "https", hostname: "cms.example.com" }, // produzione
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
