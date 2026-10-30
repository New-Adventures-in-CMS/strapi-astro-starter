import fs from "node:fs";
import path from "node:path";
import { file as fileUtils } from "@strapi/utils";
import { IMAGE_RESIZE } from "../../config/image-resize";
import { resizeBuffer } from "../../lib/resize-image";

const { bytesToKbytes } = fileUtils;

export default (plugin: any) => {
  const originalService = plugin.services["image-manipulation"];

  plugin.services["image-manipulation"] = ({ strapi }: { strapi: any }) => {
    const base =
      typeof originalService === "function" ? originalService({ strapi }) : originalService;

    const origOptimize = base.optimize.bind(base);

    return {
      ...base,
      async optimize(file: any) {
        if (!IMAGE_RESIZE.enabled) {
          return origOptimize(file);
        }

        const inputPath: string | undefined = file.filepath;
        if (!inputPath) {
          return origOptimize(file);
        }

        const inputBuffer = fs.readFileSync(inputPath);
        const result = await resizeBuffer(inputBuffer, {
          maxLongSide: IMAGE_RESIZE.maxLongSide,
          quality: IMAGE_RESIZE.quality,
        });

        if (!result.resized) {
          return origOptimize(file);
        }

        const outPath = file.tmpWorkingDirectory
          ? path.join(file.tmpWorkingDirectory, `resized-${file.hash}`)
          : `resized-${file.hash}`;

        fs.writeFileSync(outPath, result.buffer);

        const newFile = { ...file };
        newFile.filepath = outPath;
        newFile.getStream = () => fs.createReadStream(outPath);
        newFile.width = result.width;
        newFile.height = result.height;
        newFile.size = bytesToKbytes(result.size);
        newFile.sizeInBytes = result.size;

        return newFile;
      },
    };
  };

  return plugin;
};
