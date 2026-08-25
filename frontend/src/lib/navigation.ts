import { site, type NavItem } from "@/config/site";

interface PluginNavNode {
  title: string;
  path: string;
  type: "INTERNAL" | "EXTERNAL" | "WRAPPER";
  menuAttached: boolean;
  order: number;
  items?: PluginNavNode[];
  additionalFields?: {
    footerColumn?: string | null;
    showInHeader?: boolean | null;
  };
}

/** Canonical footer column order — must match options in cms/config/plugins.ts. */
export const FOOTER_COLUMNS = [
  "Prodotto",
  "Azienda",
  "Supporto",
  "Legale",
] as const;

export interface FooterData {
  columns: { title: string; items: NavItem[] }[];
}

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function normalizeNode(node: PluginNavNode): NavItem | null {
  if (!node.menuAttached) return null;

  const children = (node.items ?? [])
    .map(normalizeNode)
    .filter((n): n is NavItem => n !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const base = {
    label: node.title,
    order: node.order,
    footerColumn: node.additionalFields?.footerColumn ?? null,
    showInHeader: node.additionalFields?.showInHeader ?? false,
    children: children.length ? children : undefined,
  };

  if (node.type === "WRAPPER") {
    if (children.length === 0) return null;
    return { ...base, href: undefined };
  }

  return {
    ...base,
    href: node.path,
    external: node.type === "EXTERNAL",
  };
}

export async function fetchNavigation(slug: string): Promise<NavItem[] | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/navigation/render/${slug}?type=TREE`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as PluginNavNode[] | { error?: unknown };
    if (!Array.isArray(data) || data.length === 0) return null;
    const items = data
      .map(normalizeNode)
      .filter((n): n is NavItem => n !== null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return items.length ? items : null;
  } catch {
    return null;
  }
}

async function getMainNav(): Promise<NavItem[] | null> {
  return fetchNavigation(site.navigation.mainSlug);
}

export async function getHeaderNav(): Promise<NavItem[]> {
  const nav = await getMainNav();
  if (!nav || nav.length === 0) return site.nav;

  const flagged = nav.filter((item) => item.showInHeader);
  // If no item has showInHeader set yet (custom fields not enabled), show all.
  const items = flagged.length > 0 ? flagged : nav;

  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getFooterNav(): Promise<FooterData> {
  const nav = await getMainNav();

  if (!nav || nav.length === 0) {
    return { columns: site.footer.columns };
  }

  const footerItems = nav.filter(
    (item) => item.footerColumn && item.footerColumn.trim() !== "",
  );

  const columns = FOOTER_COLUMNS.map((colName) => ({
    title: colName,
    items: footerItems
      .filter((item) => item.footerColumn === colName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  })).filter((col) => col.items.length > 0);

  if (columns.length === 0) return { columns: site.footer.columns };

  return { columns };
}
