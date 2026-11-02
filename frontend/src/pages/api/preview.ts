import type { APIRoute } from "astro";
import { PREVIEW_SECRET } from "astro:env/server";

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const secret = url.searchParams.get("secret");
  const targetUrl = url.searchParams.get("url");

  if (!PREVIEW_SECRET || !secret || secret !== PREVIEW_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!targetUrl || !targetUrl.startsWith("/")) {
    return new Response("Bad request: missing or invalid url", { status: 400 });
  }

  cookies.set("__strapi_preview", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 3600,
  });

  return redirect(targetUrl, 307);
};
