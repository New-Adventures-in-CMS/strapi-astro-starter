import sharp from "sharp";

interface ResizeOptions {
  maxLongSide: number;
  quality: number;
}

interface ResizeResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: string;
  resized: boolean;
}

/**
 * Pure resize+recompress. Returns the original buffer unchanged when
 * the long side is already within bounds or the output would be larger.
 */
export async function resizeBuffer(
  input: Buffer,
  { maxLongSide, quality }: ResizeOptions,
): Promise<ResizeResult> {
  const meta = await sharp(input).metadata();
  const format = meta.format as string;
  const origWidth = meta.width ?? 0;
  const origHeight = meta.height ?? 0;
  const longSide = Math.max(origWidth, origHeight);

  const needsDownscale = longSide > maxLongSide;

  let pipeline = sharp(input, { animated: false }).rotate(); // auto-orient via EXIF

  if (needsDownscale) {
    pipeline = pipeline.resize({
      width: maxLongSide,
      height: maxLongSide,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const formatOpts = { quality };
  switch (format) {
    case "jpeg":
      pipeline = pipeline.jpeg(formatOpts);
      break;
    case "png":
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
      break;
    case "webp":
      pipeline = pipeline.webp(formatOpts);
      break;
    case "tiff":
      pipeline = pipeline.tiff(formatOpts);
      break;
    case "avif":
      pipeline = pipeline.avif(formatOpts);
      break;
    default:
      pipeline = pipeline.jpeg(formatOpts);
  }

  const { data: buffer, info } = await pipeline.toBuffer({
    resolveWithObject: true,
  });

  if (buffer.length >= input.length) {
    return {
      buffer: input,
      width: origWidth,
      height: origHeight,
      size: input.length,
      format,
      resized: false,
    };
  }

  return {
    buffer,
    width: info.width,
    height: info.height,
    size: buffer.length,
    format,
    resized: true,
  };
}
