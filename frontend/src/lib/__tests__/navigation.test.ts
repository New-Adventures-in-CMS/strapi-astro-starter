import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHeaderNav, getFooterNav, FOOTER_COLUMNS } from "../navigation";
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
  it("exports canonical column order", () => {
    expect(FOOTER_COLUMNS).toEqual([
      "Prodotto",
      "Azienda",
      "Supporto",
      "Legale",
    ]);
  });
});

// ---------------------------------------------------------------------------
// resolveHref (tested through getHeaderNav)
// ---------------------------------------------------------------------------
describe("resolveHref — via getHeaderNav", () => {
  it("uses externalUrl when present (relative)", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ externalUrl: "/servizi/a" })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/servizi/a");
    expect(nav[0].external).toBe(false);
  });

  it("marks absolute externalUrl as external: true", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ externalUrl: "https://docs.astro.build" })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("https://docs.astro.build");
    expect(nav[0].external).toBe(true);
  });

  it("externalUrl takes precedence over page", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({ externalUrl: "/override", page: { slug: "home" } }),
      ]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/override");
  });

  it("uses /slug when page present and no externalUrl", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ page: { slug: "about" } })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/about");
    expect(nav[0].external).toBe(false);
  });

  it("maps home slug to /", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ page: { slug: "home" } })]),
    );
    const nav = await getHeaderNav();
    expect(nav[0].href).toBe("/");
  });

  it("falls back to # when no externalUrl and no page", async () => {
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
    expect(await getHeaderNav()).toEqual(site.nav);
  });

  it("returns site.nav fallback when data is empty", async () => {
    mockFind.mockResolvedValue(apiResponse([]));
    expect(await getHeaderNav()).toEqual(site.nav);
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
          area: "header" as const,
          order: 1,
          externalUrl: "/servizi/a",
          parent: { documentId: "parent1" },
        }),
        makeItem({
          documentId: "child2",
          label: "Servizio B",
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
    expect(await getFooterNav()).toEqual({ columns: site.footer.columns });
  });

  it("returns static fallback when data is empty", async () => {
    mockFind.mockResolvedValue(apiResponse([]));
    expect(await getFooterNav()).toEqual({ columns: site.footer.columns });
  });

  it("returns static fallback when no item has footerColumn", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ area: "header" as const })]),
    );
    expect(await getFooterNav()).toEqual({ columns: site.footer.columns });
  });

  it("includes footer and both items with footerColumn", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Privacy",
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/privacy",
          order: 1,
        }),
        makeItem({
          documentId: "d2",
          label: "Termini",
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/termini",
          order: 2,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].title).toBe("Legale");
    expect(result.columns[0].items).toHaveLength(2);
  });

  it("area=both item with footerColumn appears in footer", async () => {
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
  });

  it("area=both item without footerColumn does NOT appear in footer", async () => {
    mockFind.mockResolvedValue(
      apiResponse([makeItem({ area: "both" as const, footerColumn: null })]),
    );
    expect(await getFooterNav()).toEqual({ columns: site.footer.columns });
  });

  it("groups items by footerColumn in canonical column order", async () => {
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
          area: "footer" as const,
          footerColumn: "Legale",
          order: 1,
        }),
        makeItem({
          documentId: "d3",
          label: "Widget",
          area: "footer" as const,
          footerColumn: "Prodotto",
          order: 1,
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0].title).toBe("Prodotto");
    expect(result.columns[1].title).toBe("Azienda");
    expect(result.columns[2].title).toBe("Legale");
  });

  it("omits columns with no items", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          label: "Privacy",
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/privacy",
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].title).toBe("Legale");
  });

  it("sorts items within a column by order ascending", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          documentId: "d2",
          label: "Z",
          area: "footer" as const,
          footerColumn: "Azienda",
          externalUrl: "/z",
          order: 2,
        }),
        makeItem({
          documentId: "d1",
          label: "A",
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

  it("href in footer item resolves correctly", async () => {
    mockFind.mockResolvedValue(
      apiResponse([
        makeItem({
          area: "footer" as const,
          footerColumn: "Legale",
          externalUrl: "/privacy",
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns[0].items[0].href).toBe("/privacy");
  });
});
