# Default Layout + Boilerplate Fondamentali — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a default layout (header, footer, SEO) driven by a single config file, plus dynamic Strapi content pages and all boilerplate fundamentals (env validation, sitemap, 404, i18n scaffold).

**Architecture:** Static nav/footer come from `src/config/site.ts` (zero CMS dependency — site works with CMS off). Dynamic content uses `strapiFind()` inside SSR pages with try/catch fallback. Layout composes SEO + Header + slot + Footer; every page passes title/description through to `<head>`.

**Tech Stack:** Astro 5 (SSR, Node adapter), Tailwind CSS v4 (Vite plugin), TypeScript strict, Vitest 4, `@astrojs/sitemap`

**Spec:** `docs/superpowers/specs/2026-08-24-default-layout-design.md`

---

## File Map

| Action | Path                                     | Responsibility                                    |
| ------ | ---------------------------------------- | ------------------------------------------------- |
| CREATE | `frontend/src/config/site.ts`            | Site name, nav items, footer columns              |
| CREATE | `frontend/src/config/i18n.ts`            | i18n scaffold (not active)                        |
| CREATE | `frontend/src/components/SEO.astro`      | `<head>` meta, OG, Twitter tags                   |
| CREATE | `frontend/src/components/Header.astro`   | Nav with active state + mobile hamburger          |
| CREATE | `frontend/src/components/Footer.astro`   | Footer columns + legal row                        |
| CREATE | `frontend/src/pages/pagine/index.astro`  | List all Strapi pages                             |
| CREATE | `frontend/src/pages/pagine/[slug].astro` | Single page detail, redirect on 404               |
| CREATE | `frontend/src/pages/404.astro`           | 404 with noindex                                  |
| CREATE | `frontend/src/lib/env.ts`                | Lazy env validation with clear errors             |
| CREATE | `frontend/src/lib/__tests__/env.test.ts` | Unit tests for env validation                     |
| CREATE | `frontend/src/env.d.ts`                  | TypeScript `ImportMetaEnv` declarations           |
| CREATE | `frontend/public/robots.txt`             | Allow all + sitemap URL                           |
| CREATE | `frontend/vitest.config.ts`              | Vitest config (no existing one)                   |
| MODIFY | `frontend/src/layouts/Layout.astro`      | Integrate SEO + Header + Footer                   |
| MODIFY | `frontend/src/pages/index.astro`         | Dynamic home with Strapi fetch + fallback         |
| MODIFY | `frontend/src/styles/global.css`         | Add `@theme` design tokens + reset                |
| MODIFY | `frontend/src/types/index.ts`            | Add `Page` interface                              |
| MODIFY | `frontend/src/lib/strapi.ts`             | Import + call `validateEnv()` lazily in fetch fns |
| MODIFY | `frontend/astro.config.mjs`              | Add `image.remotePatterns` + sitemap integration  |
| MODIFY | `frontend/.env.example`                  | Add comments, verify vars                         |
| MODIFY | `GUIDA.md`                               | Paragraph on layout + site.ts                     |
| MODIFY | `SETUP.md`                               | Sections: layout, Page type, i18n, extensions     |

---

## Task 1: Vitest config + install `@astrojs/sitemap`

**Files:**

- Create: `frontend/vitest.config.ts`
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Create vitest config**

```ts
// frontend/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Install `@astrojs/sitemap`**

Run inside `frontend/`:

```bash
cd frontend && npm install @astrojs/sitemap
```

Expected: `@astrojs/sitemap` appears in `frontend/package.json` `dependencies`.

- [ ] **Step 3: Verify**

```bash
cd frontend && npm ls @astrojs/sitemap
```

Expected: a version line (no errors).

- [ ] **Step 4: Commit**

```bash
git add frontend/vitest.config.ts frontend/package.json frontend/package-lock.json
git commit -m "chore: add vitest config + install @astrojs/sitemap"
```

---

## Task 2: `src/env.d.ts` — TypeScript env declarations

**Files:**

- Create: `frontend/src/env.d.ts`

- [ ] **Step 1: Create file**

```ts
// frontend/src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL base del CMS Strapi — usato lato server nelle chiamate API */
  readonly STRAPI_URL: string;
  /** URL base del CMS Strapi — esposto al client (es. per strapiMediaUrl) */
  readonly PUBLIC_STRAPI_URL: string;
  /** Token API Strapi per le mutation (POST, PUT, DELETE) */
  readonly STRAPI_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: Verify TypeScript sees it**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors (or only pre-existing ones unrelated to env.d.ts).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/env.d.ts
git commit -m "chore: add TypeScript env declarations"
```

---

## Task 3: `src/lib/env.ts` — lazy env validation (TDD)

**Files:**

- Create: `frontend/src/lib/__tests__/env.test.ts`
- Create: `frontend/src/lib/env.ts`
- Modify: `frontend/src/lib/strapi.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// frontend/src/lib/__tests__/env.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { validateEnv } from "../env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateEnv", () => {
  it("throws with clear message when STRAPI_URL is missing", () => {
    vi.stubEnv("STRAPI_URL", "");
    expect(() => validateEnv()).toThrow("Manca STRAPI_URL");
  });

  it("throws with clear message when STRAPI_URL is not a valid URL", () => {
    vi.stubEnv("STRAPI_URL", "not-a-url");
    expect(() => validateEnv()).toThrow("non è un URL valido");
  });

  it("does not throw when STRAPI_URL is a valid http URL", () => {
    vi.stubEnv("STRAPI_URL", "http://localhost:1337");
    expect(() => validateEnv()).not.toThrow();
  });

  it("does not throw when STRAPI_URL is a valid https URL", () => {
    vi.stubEnv("STRAPI_URL", "https://cms.example.com");
    expect(() => validateEnv()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd frontend && npm test
```

Expected: `Cannot find module '../env'` or similar import error. Tests must fail before implementation.

- [ ] **Step 3: Implement `env.ts`**

```ts
// frontend/src/lib/env.ts
export function validateEnv(): void {
  const url = import.meta.env.STRAPI_URL;
  if (!url) {
    throw new Error(
      "Manca STRAPI_URL in frontend/.env — esegui `npm run setup` e controlla .env.example",
    );
  }
  try {
    new URL(url);
  } catch {
    throw new Error(
      `STRAPI_URL non è un URL valido: "${url}" — controlla frontend/.env`,
    );
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd frontend && npm test
```

Expected:

```
✓ throws with clear message when STRAPI_URL is missing
✓ throws with clear message when STRAPI_URL is not a valid URL
✓ does not throw when STRAPI_URL is a valid http URL
✓ does not throw when STRAPI_URL is a valid https URL
```

- [ ] **Step 5: Integrate `validateEnv()` into `strapi.ts`**

Current `strapi.ts` has a module-level `const STRAPI_URL = import.meta.env.STRAPI_URL ?? "http://localhost:1337"`. Keep it for `strapiMediaUrl` (URL builder, no network). Add `validateEnv()` call at the top of each fetch function so errors surface lazily, only when a Strapi call is actually made.

Replace the existing content of `frontend/src/lib/strapi.ts`:

```ts
// frontend/src/lib/strapi.ts
import { validateEnv } from "./env";

const STRAPI_URL = import.meta.env.STRAPI_URL ?? "http://localhost:1337";

export function strapiMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STRAPI_URL}${path}`;
}

type StrapiListResponse<T> = {
  data: T[];
  meta: {
    pagination: {
      start?: number;
      limit?: number;
      total: number;
      page?: number;
      pageSize?: number;
      pageCount?: number;
    };
  };
};

type StrapiSingleResponse<T> = { data: T };

function buildQs(params: Record<string, unknown>): string {
  const parts: string[] = [];
  const walk = (obj: unknown, prefix: string) => {
    if (obj === null || obj === undefined) return;
    if (typeof obj === "object" && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        const key = prefix ? `${prefix}[${k}]` : k;
        walk(v, key);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
    } else {
      parts.push(
        `${encodeURIComponent(prefix)}=${encodeURIComponent(String(obj))}`,
      );
    }
  };
  walk(params, "");
  return parts.length ? `?${parts.join("&")}` : "";
}

export async function strapiFind<T>(
  pluralApiId: string,
  params: Record<string, unknown> = {},
): Promise<StrapiListResponse<T>> {
  validateEnv();
  const qs = buildQs(params);
  const res = await fetch(`${STRAPI_URL}/api/${pluralApiId}${qs}`);
  if (!res.ok)
    throw new Error(`Strapi GET /api/${pluralApiId} → ${res.status}`);
  return res.json() as Promise<StrapiListResponse<T>>;
}

export async function strapiFindOne<T>(
  singularApiId: string,
  params: Record<string, unknown> = {},
): Promise<StrapiSingleResponse<T>> {
  validateEnv();
  const qs = buildQs(params);
  const res = await fetch(`${STRAPI_URL}/api/${singularApiId}${qs}`);
  if (!res.ok)
    throw new Error(`Strapi GET /api/${singularApiId} → ${res.status}`);
  return res.json() as Promise<StrapiSingleResponse<T>>;
}

export async function strapiPost<T>(
  pluralApiId: string,
  data: Record<string, unknown>,
): Promise<StrapiSingleResponse<T>> {
  validateEnv();
  const token = import.meta.env.STRAPI_API_TOKEN;
  const res = await fetch(`${STRAPI_URL}/api/${pluralApiId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strapi POST /api/${pluralApiId} → ${res.status}: ${body}`);
  }
  return res.json() as Promise<StrapiSingleResponse<T>>;
}
```

- [ ] **Step 6: Run tests again — still PASS**

```bash
cd frontend && npm test
```

Expected: same 4 tests passing. No regressions.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/env.ts frontend/src/lib/__tests__/env.test.ts frontend/src/lib/strapi.ts
git commit -m "feat: add lazy env validation in strapi.ts (TDD)"
```

---

## Task 4: `src/config/site.ts` + `src/config/i18n.ts`

**Files:**

- Create: `frontend/src/config/site.ts`
- Create: `frontend/src/config/i18n.ts`

> **Note on `NavItem` naming:** `NavItem` in `site.ts` is a different type from the existing `NavItem` in `src/types/index.ts` (which is the Strapi Navigation plugin type). They never share a file, so no collision now. If a future file imports both, rename the one in `site.ts` to `SiteNavItem`.

- [ ] **Step 1: Create `site.ts`**

```ts
// frontend/src/config/site.ts

export interface NavItem {
  label: string;
  href: string;
  /** opens in new tab if true */
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  description: string;
  /** Production URL — used for canonical, OG, sitemap */
  url: string;
  locale: string;
  nav: NavItem[];
  footer: {
    columns: { title: string; items: NavItem[] }[];
    legal: string;
  };
}

export const site: SiteConfig = {
  name: "Strapi + Astro Starter",
  description:
    "Boilerplate Strapi 5 + Astro 5 con layout, SEO e fetch CMS già cablati.",
  url: "https://example.com",
  locale: "it-IT",
  nav: [
    { label: "Home", href: "/" },
    { label: "Pagine", href: "/pagine" },
    { label: "Contatti", href: "/contatti" },
  ],
  footer: {
    columns: [
      {
        title: "Navigazione",
        items: [
          { label: "Home", href: "/" },
          { label: "Pagine", href: "/pagine" },
        ],
      },
      {
        title: "Risorse",
        items: [
          {
            label: "Documentazione",
            href: "https://docs.astro.build",
            external: true,
          },
          { label: "Strapi", href: "https://strapi.io", external: true },
        ],
      },
    ],
    legal: `© ${new Date().getFullYear()} Strapi + Astro Starter. Tutti i diritti riservati.`,
  },
};
```

- [ ] **Step 2: Create `i18n.ts`**

```ts
// frontend/src/config/i18n.ts
// PREDISPOSTO ma non attivo. Per attivare il multilingua vedi SETUP.md → "i18n".

export const i18n = {
  defaultLocale: "it",
  /** Aggiungi qui altre lingue (es. "en") per attivare il multilingua */
  locales: ["it"] as const,
  /** Se true, la lingua di default NON ha prefisso nell'URL */
  prefixDefaultLocale: false,
} as const;

export type Locale = (typeof i18n.locales)[number];
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/config/site.ts frontend/src/config/i18n.ts
git commit -m "feat: add site config and i18n scaffold"
```

---

## Task 5: `src/styles/global.css` — design tokens + reset

**Files:**

- Modify: `frontend/src/styles/global.css`

Current content: `@import "tailwindcss";` only.

- [ ] **Step 1: Update global.css**

Replace entire file content:

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #eef6ff;
  --color-brand-500: #2563eb;
  --color-brand-700: #1d4ed8;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
}

img,
svg,
video {
  max-width: 100%;
  height: auto;
  display: block;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/styles/global.css
git commit -m "feat: add Tailwind v4 design tokens and base reset"
```

---

## Task 6: Add `Page` interface to `src/types/index.ts`

**Files:**

- Modify: `frontend/src/types/index.ts`

> **Note:** Do NOT create `src/types.ts`. The project uses `src/types/index.ts`. Add `Page` there.

- [ ] **Step 1: Append `Page` interface**

Add at the end of `frontend/src/types/index.ts`:

```ts
// Content-type "page" di Strapi — vedi SETUP.md → "Content-type Page"
export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body?: string | null;
  seo_desc?: string | null;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add Page type for Strapi content-type"
```

---

## Task 7: `src/components/SEO.astro`

**Files:**

- Create: `frontend/src/components/SEO.astro`

- [ ] **Step 1: Create component**

```astro
---
// frontend/src/components/SEO.astro
import { site } from "@/config/site";

interface Props {
  title?: string;
  description?: string;
  /** Path or absolute URL for OG image */
  image?: string;
  /** Override canonical; otherwise derived from Astro.url */
  canonical?: string;
  noindex?: boolean;
}

const {
  title,
  description = site.description,
  image,
  canonical,
  noindex = false,
} = Astro.props;

const fullTitle = title ? `${title} — ${site.name}` : site.name;
const canonicalURL = canonical ?? new URL(Astro.url.pathname, site.url).href;
const ogImage = image ? new URL(image, site.url).href : undefined;
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
{noindex && <meta name="robots" content="noindex, nofollow" />}

<meta property="og:type" content="website" />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:site_name" content={site.name} />
{ogImage && <meta property="og:image" content={ogImage} />}

<meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
{ogImage && <meta name="twitter:image" content={ogImage} />}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SEO.astro
git commit -m "feat: add SEO component with OG and Twitter meta"
```

---

## Task 8: `src/components/Header.astro`

**Files:**

- Create: `frontend/src/components/Header.astro`

- [ ] **Step 1: Create component**

```astro
---
// frontend/src/components/Header.astro
import { site } from "@/config/site";

const path = Astro.url.pathname;
const isActive = (href: string) =>
  href === "/" ? path === "/" : path.startsWith(href);
---
<header class="border-b border-gray-200">
  <nav class="mx-auto max-w-5xl px-4 py-4">
    <div class="flex items-center justify-between">
      <a href="/" class="text-lg font-semibold">{site.name}</a>

      <!-- desktop nav (md and up) -->
      <ul class="hidden gap-6 md:flex">
        {site.nav.map((item) => (
          <li>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              class:list={[
                "text-sm transition-colors hover:text-black",
                isActive(item.href)
                  ? "font-semibold text-black"
                  : "text-gray-600",
              ]}
            >{item.label}</a>
          </li>
        ))}
      </ul>

      <!-- hamburger button (mobile only) -->
      <button
        id="nav-toggle"
        class="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Apri menu"
        aria-expanded="false"
        aria-controls="mobile-nav"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            id="icon-open"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            id="icon-close"
            class="hidden"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- mobile nav (hidden by default, toggled by JS) -->
    <ul
      id="mobile-nav"
      class="hidden flex-col gap-2 border-t border-gray-100 pt-4 md:hidden"
    >
      {site.nav.map((item) => (
        <li>
          <a
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            class:list={[
              "block py-2 text-sm",
              isActive(item.href)
                ? "font-semibold text-black"
                : "text-gray-600",
            ]}
          >{item.label}</a>
        </li>
      ))}
    </ul>
  </nav>
</header>

<script>
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-nav");
  const iconOpen = document.getElementById("icon-open");
  const iconClose = document.getElementById("icon-close");

  toggle?.addEventListener("click", () => {
    const isCurrentlyOpen = !menu?.classList.contains("hidden");

    if (isCurrentlyOpen) {
      menu?.classList.add("hidden");
      menu?.classList.remove("flex");
      toggle.setAttribute("aria-expanded", "false");
      iconOpen?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
    } else {
      menu?.classList.remove("hidden");
      menu?.classList.add("flex");
      toggle.setAttribute("aria-expanded", "true");
      iconOpen?.classList.add("hidden");
      iconClose?.classList.remove("hidden");
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Header.astro
git commit -m "feat: add Header component with mobile hamburger"
```

---

## Task 9: `src/components/Footer.astro`

**Files:**

- Create: `frontend/src/components/Footer.astro`

- [ ] **Step 1: Create component**

```astro
---
// frontend/src/components/Footer.astro
import { site } from "@/config/site";
---
<footer class="border-t border-gray-200 mt-auto">
  <div class="mx-auto max-w-5xl px-4 py-10">
    <div class="grid grid-cols-2 gap-8">
      {site.footer.columns.map((col) => (
        <div>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">{col.title}</h3>
          <ul class="space-y-2">
            {col.items.map((item) => (
              <li>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  class="text-sm text-gray-600 hover:text-black"
                >{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div class="mt-8 border-t border-gray-100 pt-6">
      <p class="text-xs text-gray-500">{site.footer.legal}</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Footer.astro
git commit -m "feat: add Footer component with config-driven columns"
```

---

## Task 10: `src/layouts/Layout.astro` — integrate components

**Files:**

- Modify: `frontend/src/layouts/Layout.astro`

Current content is a minimal shell (`<title>`, `<meta name="description">`, `<slot />`). Replace entirely while preserving props contract.

- [ ] **Step 1: Replace Layout.astro**

```astro
---
// frontend/src/layouts/Layout.astro
import SEO from "@/components/SEO.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import { site } from "@/config/site";
import "@/styles/global.css";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

const { title, description, image, canonical, noindex } = Astro.props;
---
<!doctype html>
<html lang={site.locale.split("-")[0]}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <SEO {title} {description} {image} {canonical} {noindex} />
  </head>
  <body class="flex min-h-screen flex-col">
    <Header />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

> If `favicon.svg` doesn't exist in `frontend/public/`, create a minimal placeholder:
>
> ```bash
> echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#2563eb"/></svg>' > frontend/public/favicon.svg
> ```

- [ ] **Step 2: Start dev server and visually verify**

```bash
cd frontend && npm run dev
```

Open `http://localhost:4321`. Verify:

- Header renders with site name and nav links
- Footer renders with columns
- No console errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/layouts/Layout.astro frontend/public/favicon.svg
git commit -m "feat: integrate SEO + Header + Footer into Layout"
```

---

## Task 11: `src/pages/index.astro` — dynamic home with Strapi fallback

**Files:**

- Modify: `frontend/src/pages/index.astro`

> **Prerequisite (manual, outside code):** Before this page can show Strapi content, create the `page` content-type in Strapi admin:
>
> 1. Open `http://localhost:1337/admin` → Content-Type Builder → Create new Collection Type → API ID: `page`
> 2. Add fields: `title` (Short text, required), `slug` (UID, target: title, required), `body` (Rich text), `seo_desc` (Long text)
> 3. Settings → Users & Permissions → Public role → `page` → enable `find` and `findOne`
> 4. Create an entry with slug `home` and publish it
>
> **Check first:** Verify no existing `page` content-type in Strapi before creating. If one exists with a different schema, adapt the `Page` interface in `src/types/index.ts` accordingly.

- [ ] **Step 1: Replace index.astro**

```astro
---
// frontend/src/pages/index.astro
import Layout from "@/layouts/Layout.astro";
import { strapiFind } from "@/lib/strapi";
import type { Page } from "@/types";

let home: Page | null = null;
let cmsError = false;

try {
  const res = await strapiFind<Page>("pages", {
    filters: { slug: { $eq: "home" } },
  });
  home = res.data[0] ?? null;
} catch {
  cmsError = true;
}
---
<Layout
  title={home?.title}
  description={home?.seo_desc ?? undefined}
>
  {home ? (
    <article>
      <h1 class="text-3xl font-bold">{home.title}</h1>
      {home.body && <div class="prose mt-4" set:html={home.body} />}
    </article>
  ) : (
    <section class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <h1 class="text-2xl font-semibold">Benvenuto nel tuo nuovo sito</h1>
      <p class="mt-2 text-gray-600">
        {cmsError
          ? "Il CMS non è raggiungibile. Avvia Strapi e riprova."
          : 'Crea una pagina con slug "home" in Strapi per popolare questa schermata.'}
      </p>
    </section>
  )}
</Layout>
```

- [ ] **Step 2: Test with Strapi OFF**

Stop Strapi if running. Open `http://localhost:4321`. Verify:

- Page loads (no crash, no 500)
- Shows fallback message "Il CMS non è raggiungibile. Avvia Strapi e riprova."
- Header and footer visible

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/index.astro
git commit -m "feat: dynamic home page with Strapi fetch and CMS-off fallback"
```

---

## Task 12: `src/pages/pagine/index.astro` — pages list

**Files:**

- Create: `frontend/src/pages/pagine/index.astro`

- [ ] **Step 1: Create file**

```astro
---
// frontend/src/pages/pagine/index.astro
import Layout from "@/layouts/Layout.astro";
import { strapiFind } from "@/lib/strapi";
import type { Page } from "@/types";

let pages: Page[] = [];
let cmsError = false;

try {
  const res = await strapiFind<Page>("pages");
  pages = res.data;
} catch {
  cmsError = true;
}
---
<Layout title="Pagine">
  <h1 class="text-3xl font-bold">Pagine</h1>

  {cmsError && (
    <p class="mt-4 text-gray-600">Il CMS non è raggiungibile. Avvia Strapi e riprova.</p>
  )}

  {!cmsError && pages.length === 0 && (
    <p class="mt-4 text-gray-600">Nessuna pagina trovata. Crea delle pagine in Strapi.</p>
  )}

  {pages.length > 0 && (
    <ul class="mt-6 space-y-3">
      {pages.map((page) => (
        <li>
          <a
            href={`/pagine/${page.slug}`}
            class="text-brand-700 underline hover:text-brand-500"
          >
            {page.title}
          </a>
        </li>
      ))}
    </ul>
  )}
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/pagine/index.astro
git commit -m "feat: add pagine list page"
```

---

## Task 13: `src/pages/pagine/[slug].astro` — page detail

**Files:**

- Create: `frontend/src/pages/pagine/[slug].astro`

> SSR mode: no `getStaticPaths()`. `Astro.params.slug` is available at request time.

- [ ] **Step 1: Create file**

```astro
---
// frontend/src/pages/pagine/[slug].astro
import Layout from "@/layouts/Layout.astro";
import { strapiFind } from "@/lib/strapi";
import type { Page } from "@/types";

const { slug } = Astro.params;
if (!slug) return Astro.redirect("/404");

let page: Page | null = null;

try {
  const res = await strapiFind<Page>("pages", {
    filters: { slug: { $eq: slug } },
  });
  page = res.data[0] ?? null;
} catch {
  // CMS unreachable — treat as not found
}

if (!page) return Astro.redirect("/404");
---
<Layout title={page.title} description={page.seo_desc ?? undefined}>
  <article>
    <h1 class="text-3xl font-bold">{page.title}</h1>
    {page.body && <div class="prose mt-6" set:html={page.body} />}
  </article>
</Layout>
```

- [ ] **Step 2: Verify redirect on unknown slug**

With Strapi running: navigate to `http://localhost:4321/pagine/non-esiste`. Verify redirect to `/404` (or a 404 response).

- [ ] **Step 3: Commit**

```bash
git add "frontend/src/pages/pagine/[slug].astro"
git commit -m "feat: add dynamic page detail with slug routing"
```

---

## Task 14: `src/pages/404.astro`

**Files:**

- Create: `frontend/src/pages/404.astro`

- [ ] **Step 1: Create file**

```astro
---
// frontend/src/pages/404.astro
import Layout from "@/layouts/Layout.astro";
---
<Layout title="Pagina non trovata" noindex={true}>
  <section class="py-16 text-center">
    <p class="text-5xl font-bold">404</p>
    <h1 class="mt-4 text-xl font-semibold">Pagina non trovata</h1>
    <p class="mt-2 text-gray-600">
      La pagina che cerchi non esiste o è stata spostata.
    </p>
    <a href="/" class="mt-6 inline-block text-brand-700 underline hover:text-brand-500">
      Torna alla home
    </a>
  </section>
</Layout>
```

- [ ] **Step 2: Verify**

Navigate to `http://localhost:4321/pagina-inesistente`. Verify:

- 404 page renders with header/footer
- `noindex` meta is in `<head>` (inspect page source)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/404.astro
git commit -m "feat: add 404 page with layout and noindex"
```

---

## Task 15: `astro.config.mjs` — image remotePatterns + sitemap

**Files:**

- Modify: `frontend/astro.config.mjs`

- [ ] **Step 1: Replace astro.config.mjs**

```js
// frontend/astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// Keep in sync with frontend/src/config/site.ts → site.url
const SITE_URL = "https://example.com";

export default defineConfig({
  site: SITE_URL,
  output: "server",
  adapter: node({ mode: "standalone" }),
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
```

- [ ] **Step 2: Verify build includes sitemap**

```bash
cd frontend && npm run build
```

Expected: build succeeds. Check `frontend/dist/` for `sitemap-index.xml` and `sitemap-0.xml`.

- [ ] **Step 3: Commit**

```bash
git add frontend/astro.config.mjs
git commit -m "feat: add sitemap integration and image remotePatterns"
```

---

## Task 16: `public/robots.txt`

**Files:**

- Create: `frontend/public/robots.txt`

- [ ] **Step 1: Create file**

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

> In produzione: sostituire `https://example.com` con il valore di `site.url` in `src/config/site.ts`.

- [ ] **Step 2: Commit**

```bash
git add frontend/public/robots.txt
git commit -m "feat: add robots.txt"
```

---

## Task 17: Update `frontend/.env.example`

**Files:**

- Modify: `frontend/.env.example`

Current content has three vars with minimal comments. Add clearer comments.

- [ ] **Step 1: Replace .env.example**

```env
# URL del CMS Strapi — usato lato server per le chiamate API
# Cambia host/porta se Strapi gira su un indirizzo diverso da localhost:1337
STRAPI_URL=http://localhost:1337

# URL del CMS Strapi — esposto al client (es. per strapiMediaUrl nelle immagini)
PUBLIC_STRAPI_URL=http://localhost:1337

# Token API Strapi — necessario per le mutation (form, POST, ecc.)
# Genera da: Strapi admin → Settings → API Tokens → Create new token
# In sviluppo lascia vuoto se non usi endpoint autenticati
STRAPI_API_TOKEN=
```

- [ ] **Step 2: Commit**

```bash
git add frontend/.env.example
git commit -m "docs: improve .env.example with explanatory comments"
```

---

## Task 18: Update `GUIDA.md` + `SETUP.md`

**Files:**

- Modify: `GUIDA.md`
- Modify: `SETUP.md`

### GUIDA.md

- [ ] **Step 1: Read GUIDA.md and find "Cosa c'è già incluso" table**

Add a row to the table:

```markdown
| Layout di default | Frontend | Header, footer e SEO già cablati. Personalizza **un solo file**: `src/config/site.ts` |
```

- [ ] **Step 2: Add paragraph after the table (or after the "Struttura del progetto" section)**

Add a new section `## Il layout di default`:

````markdown
## Il layout di default

Il tuo sito parte già con un header, un footer e le meta tag SEO configurate. Per personalizzare nome del sito, voci di menu e colonne del footer, modifica **un solo file**: `frontend/src/config/site.ts`.

```ts
// frontend/src/config/site.ts
export const site: SiteConfig = {
  name: "Il mio sito",          // ← nome che appare nell'header e nel <title>
  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" }, // ← aggiungi/rimuovi voci qui
  ],
  footer: { ... }
};
```
````

Il CMS non è necessario per il layout: header e footer funzionano anche con Strapi spento. Il contenuto dinamico (pagine, articoli) arriva da Strapi, ma con un fallback pulito se il CMS non risponde.

````

- [ ] **Step 3: Commit GUIDA.md**

```bash
git add GUIDA.md
git commit -m "docs(GUIDA): add section on default layout and site.ts"
````

### SETUP.md

- [ ] **Step 4: Read SETUP.md and find a good insertion point (after "Stack" or "Struttura repo")**

Add a new section `## Layout di default`:

```markdown
## Layout di default

Il layout è composto da questi file:

| File                                   | Ruolo                                              |
| -------------------------------------- | -------------------------------------------------- |
| `frontend/src/config/site.ts`          | Nome sito, nav, footer — unico punto da modificare |
| `frontend/src/components/Header.astro` | Nav con active state + hamburger mobile            |
| `frontend/src/components/Footer.astro` | Footer a colonne config-driven                     |
| `frontend/src/components/SEO.astro`    | `<title>`, description, OG, Twitter                |
| `frontend/src/layouts/Layout.astro`    | Compone SEO + Header + slot + Footer               |
| `frontend/src/styles/global.css`       | Tailwind v4 + design token (`--color-brand-*`)     |

Per personalizzare: modifica solo `site.ts`. I componenti leggono da lì.
```

- [ ] **Step 5: Add section `## Content-type Page`**

```markdown
## Content-type Page

Il boilerplate include route SSR `/pagine` e `/pagine/[slug]` che leggono da un content-type `page` in Strapi.

**Campi richiesti:**

| Campo      | Tipo                | Note                                  |
| ---------- | ------------------- | ------------------------------------- |
| `title`    | Short text          | required                              |
| `slug`     | UID (target: title) | required                              |
| `body`     | Rich text           | corpo pagina                          |
| `seo_desc` | Long text           | usato per `<meta name="description">` |

**Permessi:** Settings → Users & Permissions → Public → `page` → abilita `find` e `findOne`.

**Nota:** per la home, crea una entry con slug `home`.
```

- [ ] **Step 6: Add section `## i18n (predisposto)`**

````markdown
## i18n (predisposto)

Il multilingua è **predisposto ma non attivo**. Il file `frontend/src/config/i18n.ts` definisce `defaultLocale: "it"` e `locales: ["it"]`.

Per attivare il multilingua:

1. Aggiungi lingue in `i18n.ts`: `locales: ["it", "en"] as const`
2. Attiva la config `i18n` in `astro.config.mjs`:
   ```js
   i18n: {
     defaultLocale: "it",
     locales: ["it", "en"],
   }
   ```
````

3. Crea routing localizzato: sposta le pagine in `src/pages/[lang]/`
4. Abilita i18n in Strapi: Settings → Internationalization → aggiungi locale

Questo è marcato come **estensione** — non incluso nel boilerplate base.

````

- [ ] **Step 7: Add section `## Estensioni possibili`**

```markdown
## Estensioni possibili

Non incluse nel boilerplate, documentate qui come punto di partenza:

- **Nav dinamica** — usa `strapi-plugin-navigation` per gestire il menu da Strapi admin
- **Dynamic zone** — aggiungi un campo `blocchi` al content-type `page` per un page builder
- **Preview / draft mode** — Strapi 5 supporta il draft mode via API con token dedicato
- **Immagini ottimizzate** — usa il componente `<Image />` di Astro con `strapiMediaUrl()`
- **Sitemap dinamica** — aggiungi `customPages` in `astro.config.mjs` per includere le pagine Strapi
- **i18n attivo** — vedi sezione "i18n (predisposto)" sopra
````

- [ ] **Step 8: Commit SETUP.md**

```bash
git add SETUP.md
git commit -m "docs(SETUP): add layout, Page content-type, i18n, and extensions sections"
```

---

## Task 19: Final verification — all 8 criteria

Run the dev server and verify each criterion from the spec.

- [ ] **Criterion 1: Strapi OFF → home shows fallback, no crash**

```bash
# Assicurati che Strapi sia spento
cd frontend && npm run dev
```

Open `http://localhost:4321`. Expected: fallback section "Il CMS non è raggiungibile. Avvia Strapi e riprova."

- [ ] **Criterion 2: Strapi ON + page slug "home" → content in `<head>`**

Start Strapi, create page with slug `home`, publish. Reload `http://localhost:4321`. Expected:

- `<h1>` shows page title
- View page source: `<title>` and `<meta name="description">` reflect page content

- [ ] **Criterion 3: Header active state + footer from site.ts**

Navigate between pages. Expected: active nav item has `font-semibold text-black`. Footer shows columns from `site.ts`.

- [ ] **Criterion 4: Modify only `site.ts` → changes everywhere**

Change `name: "Test Site"` in `site.ts`. Expected: header title and `<title>` update without touching any other file.

Revert the change.

- [ ] **Criterion 5: /404 with noindex**

Navigate to `http://localhost:4321/qualcosa-inesistente`. Expected: 404 page with header/footer. View source: `<meta name="robots" content="noindex, nofollow">` present.

- [ ] **Criterion 6: Sitemap reachable at runtime**

```bash
cd frontend && npm run build && npm run preview
```

Open `http://localhost:4321/sitemap-index.xml`. Expected: XML sitemap. Open `http://localhost:4321/robots.txt`. Expected: `Sitemap:` line present.

- [ ] **Criterion 7: Missing `STRAPI_URL` → readable error**

In `frontend/.env`, comment out or delete `STRAPI_URL`. Open `http://localhost:4321` and click around until a Strapi call is made. Expected: error message "Manca STRAPI_URL in frontend/.env" in server logs, not an obscure stack trace.

Restore `STRAPI_URL` in `.env`.

- [ ] **Criterion 8: No Strapi plugin dependency for nav/footer**

Verify: with Strapi completely off, header and footer still render correctly (they read from `site.ts`, no API calls).

- [ ] **Final commit if any fixes needed**

```bash
git add -p  # stage only what changed during verification
git commit -m "fix: final verification adjustments"
```

---

## Spec Divergences to Report After Implementation

At the end, report:

1. Files **created** vs **modified**
2. Any divergence between spec and what was actually implemented
3. Dependencies added
4. Whether the `page` content-type existed already in Strapi or had to be created
