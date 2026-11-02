import type { APIRoute } from "astro";

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  cookies.delete("__strapi_preview", { path: "/" });

  const targetUrl = url.searchParams.get("url");
  const safeUrl = targetUrl && targetUrl.startsWith("/") ? targetUrl : "/";

  return redirect(safeUrl, 307);
};
