import { STRAPI_URL, STRAPI_API_TOKEN } from "astro:env/server";
import { site } from "@/config/site";
import type { HeaderWidth, SiteSettings, SubmenuLayout } from "@/types";

export function strapiMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${STRAPI_URL}${path}`;
}

// Populate config for `page.blocks` (Dynamic Zone) via REST.
// REST rejects the flat `populate: { blocks: { populate: {...} } }` form
// on dynamic zones with `Invalid key populate at blocks` (400) — the `on:`
// form (per-component populate) is required.
export const pageBlocksPopulate = {
  blocks: {
    on: {
      "blocks.hero": {
        populate: { image: true, slides: { populate: { image: true } } },
      },
      "blocks.rich-text": true,
      "blocks.image-text": { populate: { image: true } },
      "blocks.card-grid": {
        populate: { cards: { populate: { image: true } } },
      },
    },
  },
} as const;

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
  const qs = buildQs(params);
  const res = await fetch(`${STRAPI_URL}/api/${singularApiId}${qs}`);
  if (!res.ok)
    throw new Error(`Strapi GET /api/${singularApiId} → ${res.status}`);
  return res.json() as Promise<StrapiSingleResponse<T>>;
}

const SUBMENU_LAYOUTS: readonly SubmenuLayout[] = ["full-bleed", "dropdown"];
const HEADER_WIDTHS: readonly HeaderWidth[] = ["full", "contained"];

function coerceSubmenuLayout(v: unknown): SubmenuLayout {
  return SUBMENU_LAYOUTS.includes(v as SubmenuLayout)
    ? (v as SubmenuLayout)
    : site.header.submenuLayout;
}

function coerceHeaderWidth(v: unknown): HeaderWidth {
  return HEADER_WIDTHS.includes(v as HeaderWidth)
    ? (v as HeaderWidth)
    : site.header.width;
}

/**
 * Read the global `site-setting` singleType, resolving each field to a valid
 * enum with fallback to `site.header` (Strapi down, 404, missing key, unknown value).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/site-setting`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as StrapiSingleResponse<
      Partial<SiteSettings> | null
    >;
    const data = json?.data ?? null;
    return {
      submenuLayout: coerceSubmenuLayout(data?.submenuLayout),
      headerWidth: coerceHeaderWidth(data?.headerWidth),
    };
  } catch {
    return {
      submenuLayout: site.header.submenuLayout,
      headerWidth: site.header.width,
    };
  }
}

export async function strapiPost<T>(
  pluralApiId: string,
  data: Record<string, unknown>,
): Promise<StrapiSingleResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (STRAPI_API_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  const res = await fetch(`${STRAPI_URL}/api/${pluralApiId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strapi POST /api/${pluralApiId} → ${res.status}: ${body}`);
  }
  return res.json() as Promise<StrapiSingleResponse<T>>;
}
