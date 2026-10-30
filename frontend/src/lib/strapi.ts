import { STRAPI_URL, STRAPI_API_TOKEN } from "astro:env/server";
import { site } from "@/config/site";
import type {
  FooterTone,
  FooterWidth,
  HeaderWidth,
  SiteSettings,
  SocialLink,
  SubmenuLayout,
} from "@/types";

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
      "blocks.carousel": {
        populate: { cards: { populate: { image: true } } },
      },
      "blocks.form": {
        populate: { form: { fields: ["slug"] } },
      },
      "blocks.gallery": {
        populate: { images: true },
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
      parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(obj))}`);
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
  if (!res.ok) throw new Error(`Strapi GET /api/${pluralApiId} → ${res.status}`);
  return res.json() as Promise<StrapiListResponse<T>>;
}

export async function strapiFindOne<T>(
  singularApiId: string,
  params: Record<string, unknown> = {},
): Promise<StrapiSingleResponse<T>> {
  const qs = buildQs(params);
  const res = await fetch(`${STRAPI_URL}/api/${singularApiId}${qs}`);
  if (!res.ok) throw new Error(`Strapi GET /api/${singularApiId} → ${res.status}`);
  return res.json() as Promise<StrapiSingleResponse<T>>;
}

const SUBMENU_LAYOUTS: readonly SubmenuLayout[] = ["full-bleed", "dropdown"];
const HEADER_WIDTHS: readonly HeaderWidth[] = ["full", "contained"];
const FOOTER_WIDTHS: readonly FooterWidth[] = ["full", "contained"];
const FOOTER_TONES: readonly FooterTone[] = ["muted", "dark"];

function coerceSubmenuLayout(v: unknown): SubmenuLayout {
  return SUBMENU_LAYOUTS.includes(v as SubmenuLayout)
    ? (v as SubmenuLayout)
    : site.header.submenuLayout;
}

function coerceHeaderWidth(v: unknown): HeaderWidth {
  return HEADER_WIDTHS.includes(v as HeaderWidth) ? (v as HeaderWidth) : site.header.width;
}

function coerceFooterWidth(v: unknown): FooterWidth {
  return FOOTER_WIDTHS.includes(v as FooterWidth) ? (v as FooterWidth) : site.footer.width;
}

function coerceFooterTone(v: unknown): FooterTone {
  return FOOTER_TONES.includes(v as FooterTone) ? (v as FooterTone) : site.footer.tone;
}

function coerceBoolean(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function coerceString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

const SOCIAL_PLATFORMS = ["facebook", "instagram", "x", "youtube", "linkedin", "tiktok"] as const;

function coerceSocialLinks(v: unknown, fallback: SocialLink[]): SocialLink[] {
  if (!Array.isArray(v) || v.length === 0) return fallback;
  const valid = v.filter(
    (item): item is SocialLink =>
      typeof item === "object" &&
      item !== null &&
      SOCIAL_PLATFORMS.includes((item as any).platform) &&
      typeof (item as any).url === "string" &&
      (item as any).url.length > 0,
  );
  return valid.length > 0 ? valid : fallback;
}

/**
 * Read the global `site-setting` singleType, resolving each field to a valid
 * enum with fallback to `site.header`/`site.footer` (Strapi down, 404, missing
 * key, unknown value).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const qs = buildQs({ populate: { socialLinks: true } });
    const res = await fetch(`${STRAPI_URL}/api/site-setting${qs}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as StrapiSingleResponse<Partial<SiteSettings> | null>;
    const data = json?.data ?? null;
    return {
      submenuLayout: coerceSubmenuLayout(data?.submenuLayout),
      headerWidth: coerceHeaderWidth(data?.headerWidth),
      footerWidth: coerceFooterWidth(data?.footerWidth),
      footerTone: coerceFooterTone(data?.footerTone),
      stickyShell: coerceBoolean(data?.stickyShell, true),
      imageMaskReveal: coerceBoolean(data?.imageMaskReveal, true),
      companyName: coerceString(data?.companyName, site.company.companyName),
      vatNumber: coerceString(data?.vatNumber, site.company.vatNumber),
      address: coerceString(data?.address, site.company.address),
      socialLinks: coerceSocialLinks(data?.socialLinks, site.company.socialLinks),
    };
  } catch {
    return {
      submenuLayout: site.header.submenuLayout,
      headerWidth: site.header.width,
      footerWidth: site.footer.width,
      footerTone: site.footer.tone,
      stickyShell: true,
      imageMaskReveal: true,
      companyName: site.company.companyName,
      vatNumber: site.company.vatNumber,
      address: site.company.address,
      socialLinks: site.company.socialLinks,
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
