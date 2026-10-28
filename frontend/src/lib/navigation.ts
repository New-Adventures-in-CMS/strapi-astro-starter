import { strapiFind } from "@/lib/strapi";
import { site, type NavItem } from "@/config/site";
import type { LinkMode } from "@/types";

export const FOOTER_NAV_COLUMNS = ["Prodotto", "Azienda", "Supporto"] as const;
export const FOOTER_LEGAL_COLUMN = "Legale" as const;
export const FOOTER_COLUMNS = [...FOOTER_NAV_COLUMNS, FOOTER_LEGAL_COLUMN] as const;

export interface MenuItem {
  id: number;
  documentId: string;
  label: string;
  page?: { slug: string } | null;
  externalUrl?: string | null;
  linkMode: LinkMode;
  area: "header" | "footer" | "both";
  footerColumn?: "Prodotto" | "Azienda" | "Supporto" | "Legale" | null;
  parent?: { documentId: string } | null;
  order: number;
  description?: string | null;
}

export interface FooterData {
  columns: { title: string; items: NavItem[] }[];
  legal: NavItem[];
}

function resolveHref(item: MenuItem): { href: string; external: boolean } {
  switch (item.linkMode) {
    case "external": {
      if (!item.externalUrl) return { href: "#", external: false };
      const isExternal = /^https?:\/\//.test(item.externalUrl);
      return { href: item.externalUrl, external: isExternal };
    }
    case "internal":
    default: {
      if (!item.page?.slug) return { href: "#", external: false };
      return {
        href: item.page.slug === "home" ? "/" : `/${item.page.slug}`,
        external: false,
      };
    }
  }
}

async function fetchMenuItems(): Promise<MenuItem[] | null> {
  try {
    const res = await strapiFind<MenuItem>("menu-items", {
      populate: ["page", "parent"],
      pagination: { pageSize: 200 },
    });
    return res.data?.length ? res.data : null;
  } catch {
    return null;
  }
}

function buildTree(items: MenuItem[], filterArea: (a: MenuItem["area"]) => boolean): NavItem[] {
  const relevant = items.filter((i) => filterArea(i.area));
  const roots = relevant.filter((i) => !i.parent);
  const childrenOf = (docId: string): NavItem[] =>
    relevant
      .filter((i) => i.parent?.documentId === docId)
      .sort((a, b) => a.order - b.order)
      .map((c) => {
        const { href, external } = resolveHref(c);
        return {
          label: c.label,
          href,
          external,
          order: c.order,
          description: c.description ?? undefined,
        };
      });
  return roots
    .sort((a, b) => a.order - b.order)
    .map((r) => {
      const { href, external } = resolveHref(r);
      const children = childrenOf(r.documentId);
      return {
        label: r.label,
        href,
        external,
        order: r.order,
        description: r.description ?? undefined,
        children: children.length ? children : undefined,
      };
    });
}

export async function getHeaderNav(): Promise<NavItem[]> {
  const items = await fetchMenuItems();
  if (!items) return site.nav.items;
  const nav = buildTree(items, (a) => a === "header" || a === "both");
  return nav.length ? nav : site.nav.items;
}

export async function getFooterNav(): Promise<FooterData> {
  const items = await fetchMenuItems();
  if (!items) return { columns: site.footer.columns, legal: [] };

  const footerItems = items.filter(
    (i) => (i.area === "footer" || i.area === "both") && i.footerColumn,
  );

  const resolveItems = (list: MenuItem[]): NavItem[] =>
    list
      .sort((a, b) => a.order - b.order)
      .map((i) => {
        const { href, external } = resolveHref(i);
        return { label: i.label, href, external, order: i.order };
      });

  const columns = FOOTER_NAV_COLUMNS.map((col) => ({
    title: col,
    items: resolveItems(footerItems.filter((i) => i.footerColumn === col)),
  })).filter((c) => c.items.length > 0);

  const legal = resolveItems(footerItems.filter((i) => i.footerColumn === FOOTER_LEGAL_COLUMN));

  return {
    columns: columns.length ? columns : site.footer.columns,
    legal,
  };
}
