// frontend/astro.config.mjs
import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// Keep in sync with frontend/src/config/site.ts → site.url
const SITE_URL = "https://example.com";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const cmsUrl = env.PUBLIC_STRAPI_URL || env.STRAPI_URL || "";

function remotePatterns() {
  /** @type {{ protocol: string; hostname: string }[]} */
  const patterns = [{ protocol: "http", hostname: "localhost" }];
  if (cmsUrl) {
    try {
      const u = new URL(cmsUrl);
      if (u.hostname !== "localhost") {
        patterns.push({
          protocol: u.protocol.replace(":", ""),
          hostname: u.hostname,
        });
      }
    } catch {
      /* env malformed — keep localhost only */
    }
  }
  return patterns;
}

export default defineConfig({
  site: SITE_URL,
  output: "server",
  adapter: node({ mode: "standalone" }),
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Sora",
      cssVariable: "--font-sora",
      weights: ["500", "700", "800"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400", "600"],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  env: {
    schema: {
      STRAPI_URL: envField.string({
        context: "server",
        access: "secret",
        default: "http://localhost:1337",
      }),
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
    remotePatterns: remotePatterns(),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@skeleton": new URL("./src/lib/skeleton", import.meta.url).pathname,
      },
    },
  },
});
