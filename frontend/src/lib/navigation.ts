import { strapiFind } from "@/lib/strapi";
import { site, type NavItem } from "@/config/site";

export const FOOTER_COLUMNS = [
  "Prodotto",
  "Azienda",
  "Supporto",
  "Legale",
] as const;

export interface MenuItem {
  id: number;
  documentId: string;
  label: string;
  page?: { slug: string } | null;
  externalUrl?: string | null;
  area: "header" | "footer" | "both";
  footerColumn?: "Prodotto" | "Azienda" | "Supporto" | "Legale" | null;
  parent?: { documentId: string } | null;
  order: number;
}

export interface FooterData {
  columns: { title: string; items: NavItem[] }[];
}

function resolveHref(item: MenuItem): { href: string; external: boolean } {
  if (item.externalUrl) {
    const isExternal = /^https?:\/\//.test(item.externalUrl);
    return { href: item.externalUrl, external: isExternal };
  }
  if (item.page?.slug) {
    return {
      href: item.page.slug === "home" ? "/" : `/${item.page.slug}`,
      external: false,
    };
  }
  return { href: "#", external: false };
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

function buildTree(
  items: MenuItem[],
  filterArea: (a: MenuItem["area"]) => boolean,
): NavItem[] {
  const relevant = items.filter((i) => filterArea(i.area));
  const roots = relevant.filter((i) => !i.parent);
  const childrenOf = (docId: string) =>
    relevant
      .filter((i) => i.parent?.documentId === docId)
      .sort((a, b) => a.order - b.order)
      .map((c) => {
        const { href, external } = resolveHref(c);
        return { label: c.label, href, external, order: c.order };
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
        children: children.length ? children : undefined,
      };
    });
}

export async function getHeaderNav(): Promise<NavItem[]> {
  const items = await fetchMenuItems();
  if (!items) return site.nav;
  const nav = buildTree(items, (a) => a === "header" || a === "both");
  return nav.length ? nav : site.nav;
}

export async function getFooterNav(): Promise<FooterData> {
  const items = await fetchMenuItems();
  if (!items) return { columns: site.footer.columns };

  const footerItems = items.filter(
    (i) => (i.area === "footer" || i.area === "both") && i.footerColumn,
  );
  const columns = FOOTER_COLUMNS.map((col) => ({
    title: col,
    items: footerItems
      .filter((i) => i.footerColumn === col)
      .sort((a, b) => a.order - b.order)
      .map((i) => {
        const { href, external } = resolveHref(i);
        return { label: i.label, href, external, order: i.order };
      }),
  })).filter((c) => c.items.length > 0);

  return columns.length ? { columns } : { columns: site.footer.columns };
}
