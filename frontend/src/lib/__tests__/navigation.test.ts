import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getHeaderNav,
  getFooterNav,
  FOOTER_COLUMNS,
  FOOTER_NAV_COLUMNS,
  FOOTER_LEGAL_COLUMN,
} from "../navigation";
import { site } from "@/config/site";

vi.mock("@/lib/strapi", () => ({
  strapiFind: vi.fn(),
}));

import { strapiFind } from "@/lib/strapi";
const mockFind = vi.mocked(strapiFind);

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    documentId: "doc1",
    label: "Item",
    linkMode: "internal" as const,
    area: "header" as const,
    order: 1,
    externalUrl: null,
    footerColumn: null,
    page: null,
    parent: null,
    ...overrides,
  };
}

function apiResponse(items: ReturnType<typeof makeItem>[]) {
  return {
    data: items,
    meta: {
      pagination: { total: items.length, page: 1, pageSize: 200, pageCount: 1 },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// FOOTER_COLUMNS
// ---------------------------------------------------------------------------
describe("FOOTER_COLUMNS", () => {
  it("exports canonical column order (full, backward-compat)", () => {
    expect(FOOTER_COLUMNS).toEqual(["Prodotto", "Azienda", "Supporto", "Legale"]);
  });

  it("FOOTER_NAV_COLUMNS excludes Legale", () => {
    expect(FOOTER_NAV_COLUMNS).toEqual(["Prodotto", "Azienda", "Supporto"]);
  });

  it("FOOTER_LEGAL_COLUMN is Legale", () => {
    expect(FOOTER_LEGAL_COLUMN).toBe("Legale");
  });
});

// ---------------------------------------------------------------------------
// resolveHref (tested through getHeaderNav)
// ---------------------------------------------------------------------------
describe("resolveHref — via getHeaderNav", () => {
  it("external mode: uses externalUrl (relative)", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ linkMode: "external", externalUrl: "/servizi/a" })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/servizi/a");
    expect(nav[0].external).toBe(false);
  });

  it("external mode: marks absolute externalUrl as external: true", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ linkMode: "external", externalUrl: "https://docs.astro.build" })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("https://docs.astro.build");
    expect(nav[0].external).toBe(true);
  });

  it("external mode: falls back to # when externalUrl absent", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ linkMode: "external", externalUrl: null })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("#");
    expect(nav[0].external).toBe(false);
  });

  it("internal mode: uses /slug when page present", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem({ page: { slug: "about" } })]));
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/about");
    expect(nav[0].external).toBe(false);
  });

  it("internal mode: maps home slug to /", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem({ page: { slug: "home" } })]));
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/");
  });

  it("internal mode: ignores externalUrl, uses page", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({ linkMode: "internal", externalUrl: "/override", page: { slug: "home" } }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/");
  });

  it("internal mode: falls back to # when no page", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem()]));
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("#");
    expect(nav[0].external).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getHeaderNav
// ---------------------------------------------------------------------------
describe("getHeaderNav", () => {
  it("returns site.nav fallback when strapiFind throws", async () => {
    mockFind.mockRejectedValue(new Error("Network error"));
    expect(await getHeaderNav()).toEqual(site.nav.items);
  });

  it("returns site.nav fallback when data is empty", async () => {
    mockFind.mockResolvedValue(apiResponse([]));
    expect(await getHeaderNav()).toEqual(site.nav.items);
  });

  it("returns items with area header", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Home",
          area: "header" as const,
          page: { slug: "home" },
        }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav).toHaveLength(1);
    expect(nav[0].label).toBe("Home");
  });

  it("returns items with area both", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Contatti",
          area: "both" as const,
          page: { slug: "contacts" },
        }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav).toHaveLength(1);
    expect(nav[0].label).toBe("Contatti");
  });

  it("excludes footer-only items", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({ label: "Visible", area: "header" as const }),
        makeItem({
          documentId: "doc2",
          label: "FooterOnly",
          area: "footer" as const,
        }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav).toHaveLength(1);
    expect(nav[0].label).toBe("Visible");
  });

  it("sorts items by order ascending", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({ documentId: "d2", label: "B", order: 2 }),
        makeItem({ documentId: "d1", label: "A", order: 1 }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].label).toBe("A");
    expect(nav[1].label).toBe("B");
  });

  it("builds 2-level tree with children", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          documentId: "parent1",
          label: "Servizi",
          area: "header" as const,
          order: 1,
        }),
        makeItem({
          documentId: "child1",
          label: "Servizio A",
          linkMode: "external" as const,
          area: "header" as const,
          order: 1,
          externalUrl: "/servizi/a",
          parent: { documentId: "parent1" },
        }),
        makeItem({
          documentId: "child2",
          label: "Servizio B",
          linkMode: "external" as const,
          area: "header" as const,
          order: 2,
          externalUrl: "/servizi/b",
          parent: { documentId: "parent1" },
        }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav).toHaveLength(1);
    expect(nav[0].label).toBe("Servizi");
    expect(nav[0].children).toHaveLength(2);
    expect(nav[0].children![0].label).toBe("Servizio A");
    expect(nav[0].children![1].label).toBe("Servizio B");
  });

  it("children are sorted by order", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({ documentId: "parent1", label: "Parent", order: 1 }),
        makeItem({
          documentId: "c2",
          label: "Second",
          order: 2,
          parent: { documentId: "parent1" },
        }),
        makeItem({
          documentId: "c1",
          label: "First",
          order: 1,
          parent: { documentId: "parent1" },
        }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].children![0].label).toBe("First");
    expect(nav[0].children![1].label).toBe("Second");
  });

  it("item without children has no children property", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem({ label: "Home" })]));
    const nav = await getHeaderNav();
    expect(nav[0].children).toBeUndefined();
  });

  it("passes correct params to strapiFind", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem()]));
    await getHeaderNav();
    expect(mockFind).toHaveBeenCalledWith("menu-items", {
      populate: ["page", "parent"],
      pagination: { pageSize: 200 },
    });
  });
});

// ---------------------------------------------------------------------------
// getFooterNav
// ---------------------------------------------------------------------------
describe("getFooterNav", () => {
  it("returns static fallback when strapiFind throws", async () => {
    mockFind.mockRejectedValue(new Error("Network error"));
    const result = await getFooterNav();
    expect(result.columns).toEqual(site.footer.columns);
    expect(result.legal).toEqual([]);
  });

  it("returns static fallback when data is empty", async () => {
    mockFind.mockResolvedValue(apiResponse([]));
    const result = await getFooterNav();
    expect(result.columns).toEqual(site.footer.columns);
    expect(result.legal).toEqual([]);
  });

  it("returns static fallback when no item has footerColumn", async () => {
    mockFind.mockResolvedValue(apiResponse([makeItem({ area: "header" as const })]));
    const result = await getFooterNav();
    expect(result.columns).toEqual(site.footer.columns);
    expect(result.legal).toEqual([]);
  });

  it("legal items go to legal array, not columns", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Privacy",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/privacy",
          order: 1,
        }),
        makeItem({
          documentId: "d2",
          label: "Termini",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/termini",
          order: 2,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toEqual(site.footer.columns);
    expect(result.legal).toHaveLength(2);
    expect(result.legal[0].label).toBe("Privacy");
    expect(result.legal[1].label).toBe("Termini");
  });

  it("area=both item with nav footerColumn appears in columns", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          area: "both" as const,
          footerColumn: "Prodotto",
          label: "Home",
          page: { slug: "home" },
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns[0].title).toBe("Prodotto");
    expect(result.columns[0].items[0].label).toBe("Home");
    expect(result.legal).toEqual([]);
  });

  it("area=both item without footerColumn does NOT appear in footer", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ area: "both" as const, footerColumn: null })]),
    );
    const result = await getFooterNav();
    expect(result.columns).toEqual(site.footer.columns);
    expect(result.legal).toEqual([]);
  });

  it("groups nav items by footerColumn, legal items separate", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          documentId: "d1",
          label: "Chi siamo",
          area: "footer" as const,
          footerColumn: "Azienda",
          order: 1,
        }),
        makeItem({
          documentId: "d2",
          label: "Privacy",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/privacy",
          order: 1,
        }),
        makeItem({
          documentId: "d3",
          label: "Widget",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Prodotto",
          externalUrl: "/widget",
          order: 1,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(2);
    expect(result.columns[0].title).toBe("Prodotto");
    expect(result.columns[1].title).toBe("Azienda");
    expect(result.legal).toHaveLength(1);
    expect(result.legal[0].label).toBe("Privacy");
  });

  it("omits nav columns with no items", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Widget",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Prodotto",
          externalUrl: "/widget",
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].title).toBe("Prodotto");
  });

  it("sorts items within a column by order ascending", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          documentId: "d2",
          label: "Z",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Azienda",
          externalUrl: "/z",
          order: 2,
        }),
        makeItem({
          documentId: "d1",
          label: "A",
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Azienda",
          externalUrl: "/a",
          order: 1,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns[0].items[0].label).toBe("A");
    expect(result.columns[0].items[1].label).toBe("Z");
  });

  it("legal items resolve href correctly (internal)", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          area: "footer" as const,
          footerColumn: "Legale",
          label: "Privacy",
          page: { slug: "privacy" },
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.legal[0].href).toBe("/privacy");
    expect(result.legal[0].external).toBe(false);
  });

  it("legal items resolve href correctly (external)", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          linkMode: "external" as const,
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "https://example.com/cookie-policy",
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.legal[0].href).toBe("https://example.com/cookie-policy");
    expect(result.legal[0].external).toBe(true);
  });

  it("sorts legal items by order ascending", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          documentId: "d2",
          label: "Cookie",
          area: "footer" as const,
          footerColumn: "Legale",
          order: 2,
        }),
        makeItem({
          documentId: "d1",
          label: "Privacy",
          area: "footer" as const,
          footerColumn: "Legale",
          order: 1,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.legal[0].label).toBe("Privacy");
    expect(result.legal[1].label).toBe("Cookie");
  });
});
