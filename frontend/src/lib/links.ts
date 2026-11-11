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
}

export function resolveHrefCore(link: LinkLike): { href: string; external: boolean } {
  switch (link.linkMode) {
    case "external": {
      if (!link.externalUrl) return { href: "#", external: false };
      const isExternal = /^https?:\/\//.test(link.externalUrl);
      return { href: link.externalUrl, external: isExternal };
    }
    case "internal":
    default: {
      if (!link.page?.slug) return { href: "#", external: false };
      return {
        href: link.page.slug === "home" ? "/" : `/${link.page.slug}`,
        external: false,
      };
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
