import type { SharedLink, LinkMode } from "@/types";

export interface ResolvedLink {
  href: string;
  external: boolean;
  target: "_self" | "_blank";
  label: string;
}

interface LinkLike {
  linkMode: LinkMode;
  page?: { slug: string } | null;
  externalUrl?: string | null;
  anchor?: string | null;
}

export function slugifyAnchor(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveHrefCore(link: LinkLike): { href: string; external: boolean } {
  switch (link.linkMode) {
    case "anchor": {
      const fragment = link.anchor ? slugifyAnchor(link.anchor) : "";
      return { href: fragment ? `#${fragment}` : "#", external: false };
    }
    case "external": {
      if (!link.externalUrl) return { href: "#", external: false };
      return {
        href: link.externalUrl,
        external: /^https?:\/\//.test(link.externalUrl),
      };
    }
    case "internal":
    default: {
      if (!link.page?.slug) return { href: "#", external: false };
      let href = link.page.slug === "home" ? "/" : `/${link.page.slug}`;
      if (link.anchor) {
        const fragment = slugifyAnchor(link.anchor);
        if (fragment) href = `${href}#${fragment}`;
      }
      return { href, external: false };
    }
  }
}

export function resolveTarget(target: SharedLink["target"], external: boolean): "_self" | "_blank" {
  if (target === "blank") return "_blank";
  if (target === "self") return "_self";
  return external ? "_blank" : "_self";
}

export function resolveCta(link: SharedLink): ResolvedLink {
  const { href, external } = resolveHrefCore(link);
  return {
    href,
    external,
    target: resolveTarget(link.target, external),
    label: link.label,
  };
}
