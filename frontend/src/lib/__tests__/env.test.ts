import { describe, it, expect, vi, afterEach } from "vitest";
import { validateEnv } from "../env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateEnv", () => {
  it("throws with clear message when STRAPI_URL is missing", () => {
    vi.stubEnv("STRAPI_URL", "");
    expect(() => validateEnv()).toThrow("Manca STRAPI_URL");
  });

  it("throws with clear message when STRAPI_URL is not a valid URL", () => {
    vi.stubEnv("STRAPI_URL", "not-a-url");
    expect(() => validateEnv()).toThrow("non è un URL valido");
  });

  it("does not throw when STRAPI_URL is a valid http URL", () => {
    vi.stubEnv("STRAPI_URL", "http://localhost:1337");
    expect(() => validateEnv()).not.toThrow();
  });

  it("does not throw when STRAPI_URL is a valid https URL", () => {
    vi.stubEnv("STRAPI_URL", "https://cms.example.com");
    expect(() => validateEnv()).not.toThrow();
  });
});
