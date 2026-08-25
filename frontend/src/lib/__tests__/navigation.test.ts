import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchNavigation, getHeaderNav, getFooterNav } from "../navigation";
import { site } from "@/config/site";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function okRes(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) };
}
function errRes() {
  return { ok: false, json: () => Promise.resolve(null) };
}

function navNode(overrides: Record<string, unknown> = {}) {
  return {
    title: "Item",
    path: "/item",
    type: "INTERNAL",
    menuAttached: true,
    order: 1,
    ...overrides,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchNavigation", () => {
  it("returns null when response not ok (e.g. 403)", async () => {
    mockFetch.mockResolvedValue(errRes());
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("returns null when response is empty array", async () => {
    mockFetch.mockResolvedValue(okRes([]));
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("returns null when response is not an array", async () => {
    mockFetch.mockResolvedValue(okRes({ error: "not found" }));
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("excludes nodes where menuAttached is false", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Hidden",
          path: "/hidden",
          menuAttached: false,
          order: 1,
        }),
        navNode({ title: "Visible", path: "/visible", order: 2 }),
      ]),
    );
    const result = await fetchNavigation("main");
    expect(result).toHaveLength(1);
    expect(result![0].label).toBe("Visible");
  });

  it("returns null for WRAPPER with no menuAttached children", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({ title: "Wrapper", path: "", type: "WRAPPER", items: [] }),
      ]),
    );
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("returns WRAPPER node with its children", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Products",
          path: "",
          type: "WRAPPER",
          items: [navNode({ title: "Widget", path: "/products/widget" })],
        }),
      ]),
    );
    const result = await fetchNavigation("main");
    expect(result).toHaveLength(1);
    expect(result![0].label).toBe("Products");
    expect(result![0].href).toBeUndefined();
    expect(result![0].children).toHaveLength(1);
    expect(result![0].children![0].href).toBe("/products/widget");
  });

  it("marks EXTERNAL nodes with external: true", async () => {
    mockFetch.mockResolvedValue(
      okRes([navNode({ path: "https://docs.example.com", type: "EXTERNAL" })]),
    );
    const result = await fetchNavigation("main");
    expect(result![0].external).toBe(true);
  });

  it("excludes nested WRAPPER children with no children from result", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Products",
          path: "",
          type: "WRAPPER",
          items: [
            navNode({
              title: "Category",
              path: "",
              type: "WRAPPER",
              items: [],
            }),
            navNode({ title: "Widget", path: "/products/widget", order: 2 }),
          ],
        }),
      ]),
    );
    const result = await fetchNavigation("main");
    expect(result![0].children).toHaveLength(1);
    expect(result![0].children![0].href).toBe("/products/widget");
  });

  it("sorts nodes ascending by order", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({ title: "B", path: "/b", order: 2 }),
        navNode({ title: "A", path: "/a", order: 1 }),
      ]),
    );
    const result = await fetchNavigation("main");
    expect(result![0].label).toBe("A");
    expect(result![1].label).toBe("B");
  });

  it("preserves additionalFields on normalized node", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          additionalFields: { showInHeader: true, footerColumn: "Legale" },
        }),
      ]),
    );
    const result = await fetchNavigation("main");
    expect(result![0].showInHeader).toBe(true);
    expect(result![0].footerColumn).toBe("Legale");
  });

  it("defaults showInHeader to false when additionalFields absent", async () => {
    mockFetch.mockResolvedValue(okRes([navNode()]));
    const result = await fetchNavigation("main");
    expect(result![0].showInHeader).toBe(false);
    expect(result![0].footerColumn).toBeNull();
  });
});

describe("getHeaderNav", () => {
  it("returns fallback when nav unreachable", async () => {
    mockFetch.mockResolvedValue(errRes());
    expect(await getHeaderNav()).toEqual(site.nav);
  });

  it("filters to only showInHeader items", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Home",
          path: "/",
          order: 1,
          additionalFields: { showInHeader: true },
        }),
        navNode({
          title: "Privacy",
          path: "/privacy",
          order: 2,
          additionalFields: { showInHeader: false, footerColumn: "Legale" },
        }),
      ]),
    );
    const result = await getHeaderNav();
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Home");
  });

  it("returns empty array when nav reachable but no showInHeader items", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Privacy",
          path: "/privacy",
          additionalFields: { showInHeader: false, footerColumn: "Legale" },
        }),
      ]),
    );
    const result = await getHeaderNav();
    expect(result).toEqual([]);
  });

  it("sorts header items by order", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "B",
          path: "/b",
          order: 2,
          additionalFields: { showInHeader: true },
        }),
        navNode({
          title: "A",
          path: "/a",
          order: 1,
          additionalFields: { showInHeader: true },
        }),
      ]),
    );
    const result = await getHeaderNav();
    expect(result[0].label).toBe("A");
    expect(result[1].label).toBe("B");
  });
});

describe("getFooterNav", () => {
  it("returns static fallback when nav unreachable", async () => {
    mockFetch.mockResolvedValue(errRes());
    const result = await getFooterNav();
    expect(result).toEqual({ columns: site.footer.columns });
  });

  it("returns static fallback when no item has footerColumn", async () => {
    mockFetch.mockResolvedValue(
      okRes([navNode({ additionalFields: { showInHeader: true } })]),
    );
    const result = await getFooterNav();
    expect(result).toEqual({ columns: site.footer.columns });
  });

  it("groups items by footerColumn in canonical order", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Chi siamo",
          path: "/about",
          order: 1,
          additionalFields: { footerColumn: "Azienda" },
        }),
        navNode({
          title: "Privacy",
          path: "/privacy",
          order: 2,
          additionalFields: { footerColumn: "Legale" },
        }),
        navNode({
          title: "Widget",
          path: "/widget",
          order: 1,
          additionalFields: { footerColumn: "Prodotto" },
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0].title).toBe("Prodotto");
    expect(result.columns[1].title).toBe("Azienda");
    expect(result.columns[2].title).toBe("Legale");
  });

  it("omits empty columns", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Privacy",
          path: "/privacy",
          additionalFields: { footerColumn: "Legale" },
        }),
      ]),
    );
    const result = await getFooterNav();
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].title).toBe("Legale");
  });

  it("item with both showInHeader and footerColumn appears in both views", async () => {
    const node = navNode({
      title: "Home",
      path: "/",
      order: 1,
      additionalFields: { showInHeader: true, footerColumn: "Prodotto" },
    });
    mockFetch.mockResolvedValue(okRes([node]));
    const header = await getHeaderNav();
    mockFetch.mockResolvedValue(okRes([node]));
    const footer = await getFooterNav();
    expect(header[0].label).toBe("Home");
    expect(footer.columns[0].items[0].label).toBe("Home");
  });

  it("sorts items within a column by order", async () => {
    mockFetch.mockResolvedValue(
      okRes([
        navNode({
          title: "Z-item",
          path: "/z",
          order: 2,
          additionalFields: { footerColumn: "Azienda" },
        }),
        navNode({
          title: "A-item",
          path: "/a",
          order: 1,
          additionalFields: { footerColumn: "Azienda" },
        }),
      ]),
    );
    const result = await getFooterNav();
    const col = result.columns[0];
    expect(col.items[0].label).toBe("A-item");
    expect(col.items[1].label).toBe("Z-item");
  });
});
