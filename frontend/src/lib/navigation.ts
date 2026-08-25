import { site, type NavItem } from "@/config/site";

interface PluginNavNode {
  title: string;
  path: string;
  type: "INTERNAL" | "EXTERNAL" | "WRAPPER";
  menuAttached: boolean;
  order: number;
  items?: PluginNavNode[];
}

const STRAPI_URL =
  import.meta.env.PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function normalizeNode(node: PluginNavNode): NavItem | null {
  if (!node.menuAttached) return null;

  const children = (node.items ?? [])
    .map(normalizeNode)
    .filter((n): n is NavItem => n !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (node.type === "WRAPPER") {
    if (children.length === 0) return null;
    return { label: node.title, href: undefined, children, order: node.order };
  }

  return {
    label: node.title,
    href: node.path,
    external: node.type === "EXTERNAL",
    children: children.length ? children : undefined,
    order: node.order,
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

export async function getHeaderNav(): Promise<NavItem[]> {
  return (await fetchNavigation(site.navigation.headerSlug)) ?? site.nav;
}

type FooterColumn = { title: string; links: NavItem[] };

export async function getFooterNav(): Promise<FooterColumn[]> {
  const items = await fetchNavigation(site.navigation.footerSlug);
  if (!items) return site.footer.columns;

  const columns: FooterColumn[] = items
    .filter((item) => item.children && item.children.length > 0)
    .map((item) => ({
      title: item.label,
      links: item.children!.filter((c) => c.href !== undefined),
    }));

  return columns.length ? columns : site.footer.columns;
}
