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
