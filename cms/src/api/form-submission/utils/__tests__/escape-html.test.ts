import { describe, it, expect } from "vitest";
import { escapeHtml } from "../escape-html";

describe("escapeHtml", () => {
  it("escapes &", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes <", () => {
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("escapes >", () => {
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it('escapes "', () => {
    expect(escapeHtml('a"b')).toBe("a&quot;b");
  });

  it("escapes '", () => {
    expect(escapeHtml("a'b")).toBe("a&#39;b");
  });

  it("escapes all special chars at once", () => {
    expect(escapeHtml(`<b>"phish" & 'steal'</b>`)).toBe(
      "&lt;b&gt;&quot;phish&quot; &amp; &#39;steal&#39;&lt;/b&gt;",
    );
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });

  it("coerces non-string values", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});
