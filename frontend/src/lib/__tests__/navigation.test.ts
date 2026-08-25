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
    mockFetch.mockResolvedValue(okRes([
      { title: "Hidden", path: "/hidden", type: "INTERNAL", menuAttached: false, order: 1 },
      { title: "Visible", path: "/visible", type: "INTERNAL", menuAttached: true, order: 2 },
    ]));
    const result = await fetchNavigation("main");
    expect(result).toHaveLength(1);
    expect(result![0].label).toBe("Visible");
  });

  it("returns null for WRAPPER with no menuAttached children", async () => {
    mockFetch.mockResolvedValue(okRes([
      { title: "Wrapper", path: "", type: "WRAPPER", menuAttached: true, order: 1, items: [] },
    ]));
    expect(await fetchNavigation("main")).toBeNull();
  });

  it("returns WRAPPER node with its children", async () => {
    mockFetch.mockResolvedValue(okRes([
      {
        title: "Products",
        path: "",
        type: "WRAPPER",
        menuAttached: true,
        order: 1,
        items: [
          { title: "Widget", path: "/products/widget", type: "INTERNAL", menuAttached: true, order: 1 },
        ],
      },
    ]));
    const result = await fetchNavigation("main");
    expect(result).toHaveLength(1);
    expect(result![0].label).toBe("Products");
    expect(result![0].href).toBeUndefined();
    expect(result![0].children).toHaveLength(1);
    expect(result![0].children![0].label).toBe("Widget");
    expect(result![0].children![0].href).toBe("/products/widget");
  });

  it("marks EXTERNAL nodes with external: true", async () => {
    mockFetch.mockResolvedValue(okRes([
      { title: "Docs", path: "https://docs.example.com", type: "EXTERNAL", menuAttached: true, order: 1 },
    ]));
    const result = await fetchNavigation("main");
    expect(result![0].external).toBe(true);
  });

  it("sorts nodes ascending by order", async () => {
    mockFetch.mockResolvedValue(okRes([
      { title: "B", path: "/b", type: "INTERNAL", menuAttached: true, order: 2 },
      { title: "A", path: "/a", type: "INTERNAL", menuAttached: true, order: 1 },
    ]));
    const result = await fetchNavigation("main");
    expect(result![0].label).toBe("A");
    expect(result![1].label).toBe("B");
  });
});

describe("getHeaderNav", () => {
  it("returns dynamic nav when fetchNavigation succeeds", async () => {
    mockFetch.mockResolvedValue(okRes([
      { title: "Home", path: "/", type: "INTERNAL", menuAttached: true, order: 1 },
    ]));
    const result = await getHeaderNav();
    expect(result[0].label).toBe("Home");
    expect(result[0].href).toBe("/");
  });

  it("returns site.nav fallback when fetchNavigation returns null", async () => {
    mockFetch.mockResolvedValue(errRes());
    const result = await getHeaderNav();
    expect(result).toEqual(site.nav);
  });
});

describe("getFooterNav", () => {
  it("maps first-level WRAPPER items with children into columns", async () => {
    mockFetch.mockResolvedValue(okRes([
      {
        title: "Company",
        path: "",
        type: "WRAPPER",
        menuAttached: true,
        order: 1,
        items: [
          { title: "About", path: "/about", type: "INTERNAL", menuAttached: true, order: 1 },
        ],
      },
    ]));
    const result = await getFooterNav();
    expect(result[0].title).toBe("Company");
    expect(result[0].links[0].label).toBe("About");
    expect(result[0].links[0].href).toBe("/about");
  });

  it("returns site.footer.columns when nav not available", async () => {
    mockFetch.mockResolvedValue(errRes());
    const result = await getFooterNav();
    expect(result).toEqual(site.footer.columns);
  });

  it("returns site.footer.columns when dynamic nav has no items with children", async () => {
    mockFetch.mockResolvedValue(okRes([
      { title: "Home", path: "/", type: "INTERNAL", menuAttached: true, order: 1 },
    ]));
    const result = await getFooterNav();
    expect(result).toEqual(site.footer.columns);
  });
});
