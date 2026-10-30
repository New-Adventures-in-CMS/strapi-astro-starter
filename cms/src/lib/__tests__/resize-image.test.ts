import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { resizeBuffer } from "../resize-image";

const OPTS = { maxLongSide: 2560, quality: 82 };

async function makeTestImage(
  width: number,
  height: number,
  format: "jpeg" | "png" | "webp" = "jpeg",
): Promise<Buffer> {
  const raw = Buffer.alloc(width * height * 3, 128);
  const img = sharp(raw, {
    raw: { width, height, channels: 3 },
  });
  switch (format) {
    case "png":
      return img.png().toBuffer();
    case "webp":
      return img.webp().toBuffer();
    default:
      return img.jpeg({ quality: 100 }).toBuffer();
  }
}

describe("resizeBuffer", () => {
  it("downscales a raster whose long side exceeds threshold", async () => {
    const input = await makeTestImage(4000, 3000);
    const result = await resizeBuffer(input, OPTS);

    expect(result.resized).toBe(true);
    expect(Math.max(result.width, result.height)).toBeLessThanOrEqual(OPTS.maxLongSide);
    expect(result.format).toBe("jpeg");
    expect(result.size).toBeLessThan(input.length);
  });

  it("does not enlarge a raster already within bounds", async () => {
    const input = await makeTestImage(800, 600);
    const result = await resizeBuffer(input, OPTS);

    expect(result.width).toBeLessThanOrEqual(800);
    expect(result.height).toBeLessThanOrEqual(600);
  });

  it("preserves PNG format", async () => {
    const input = await makeTestImage(4000, 2000, "png");
    const result = await resizeBuffer(input, OPTS);

    expect(result.resized).toBe(true);
    expect(result.format).toBe("png");
    expect(Math.max(result.width, result.height)).toBeLessThanOrEqual(OPTS.maxLongSide);
  });

  it("preserves WebP format", async () => {
    const input = await makeTestImage(4000, 2000, "webp");
    const result = await resizeBuffer(input, OPTS);

    expect(result.resized).toBe(true);
    expect(result.format).toBe("webp");
  });

  it("returns original when output would be larger (safety)", async () => {
    const input = await makeTestImage(100, 100, "jpeg");
    const result = await resizeBuffer(input, OPTS);

    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
    expect(result.size).toBe(input.length);
  });
});
