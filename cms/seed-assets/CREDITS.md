# Seed assets — credits & license

All files in this directory are original artwork created for this starter and
released under **CC0 1.0 Universal / Public Domain Dedication**
(https://creativecommons.org/publicdomain/zero/1.0/).

No third-party stock photography, external downloads, or generative-AI models
were used. Assets are hand-authored SVG (deterministic markup, no encoded
bitmap payload) so they can be inspected, edited, and re-committed without
license concerns.

## Files

- `hero-home.svg` — dark, sculptural, editorial background for the home page
  hero (block `blocks.hero`, home slug). 1600×1000, gradients + angular
  polygons + subtle noise filter. Sized for full-bleed use behind
  `min-h-[100svh]` immersive hero.
- `image-text-about.svg` — dark, editorial background for the about page
  `blocks.image-text` illustration column. 800×600, gradients + angular
  polygons.

## Regenerating / replacing

If you want to swap in your own photography:

1. Drop new files in this directory (any format Strapi accepts).
2. Update `cms/src/index.ts` → `seedDemoPages` to reference the new filenames
   in the `uploadSeedImage(...)` calls.
3. Wipe the DB: `rm cms/.tmp/data.db` and re-run `npm run dev` so the seed
   uploads and attaches your assets.

## Why SVG?

- **License-safe**: no unknown-provenance images ever land in the repo.
- **Small**: a few KB each, no LFS needed.
- **Editable in-place**: adjust gradient stops or polygon coordinates without
  regenerating a bitmap.
- **Renders sharp** at any hero height, including `100svh` on high-density
  displays.
