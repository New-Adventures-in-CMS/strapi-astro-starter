# STATUS: image-optimization

**Branch:** `feat/image-optimization`
**Base:** `feat/sticky-hero` (tip `578f591`)
**Esito:** READY FOR REVIEW — gate codice verdi, audit visivo da umano.

Pipeline immagini `<Picture>`-based via `astro:assets`. Raster → avif/webp con srcset responsivo.
SVG → `<img>` passthrough. Singolo componente `StrapiImage.astro` sostituisce tutti i 6 `<img>` raw.

---

## ✅ Fatto

- [x] `StrapiImage.astro` — entry point unico (raster → `<Picture>` avif+webp, SVG → `<img>`)
- [x] Width ladder `[320,640,768,1024,1280,1536,1920,2560]` cappata a dimensione intrinseca
- [x] `ext?: string` aggiunto a `StrapiMedia` type
- [x] 6 `<img>` sostituiti: BlockHero (3), BlockImageText (1), Card (2)
- [x] Hero: `loading="eager"` + `fetchpriority="high"`, `data-hero-media` preservato
- [x] Cards/image-text: `loading="lazy"`, `data-mask-reveal` wrapper intatto
- [x] `picture class="contents"` — nessuna interferenza layout
- [x] `remotePatterns` dinamico da `PUBLIC_STRAPI_URL || STRAPI_URL` in `astro.config.mjs`
- [x] Raster fixture `photo-hero.jpg` (3840×2160, ~3.2 MB synthetic JPEG) nel seed
- [x] Seed wiring: hero + first card preferiscono raster, SVG fallback
- [x] G1 `astro check` = 0 errori
- [x] G2 `astro build` verde
- [x] G3 `prettier --check` verde
- [x] G4 skeleton diff-zero
- [x] G5 DOM verification: 4 `<picture>` + 8 SVG `<img>` su home, avif/webp sources, hero attrs ok
- [x] G6 E2E Playwright: 7 test passati (raster picture, SVG passthrough, hero-media, mask-reveal)
- [x] G7 Screenshot 4 breakpoint × 2 pagine (home + about)

## Da fare (umano)

- [ ] Audit visivo screenshot (scratchpad/screenshots/)
- [ ] Verifica hero effects non broken (tilt/parallax/ken-burns) su browser reale
- [ ] Merge squash su main
- [ ] Deploy: configurare cache layer per `/_image` (CDN o reverse proxy)

## ⚠ Debito & decisioni

- **SSR `/_image` non cachato**: ogni richiesta riprocessa. Produzione richiede reverse proxy /
  CDN con `Cache-Control` appropriato. Documentato in SETUP.md.
- **Nominal fallback 1920×1080**: quando Strapi non fornisce dimensioni intrinseche, StrapiImage
  assume 1920×1080. Accettabile per raster tipici; potrebbe generare srcset sovradimensionato per
  immagini piccole senza metadati.
- **`pictureAttributes={{ class: "contents" }}`**: necessario perché `<picture>` è wrapper extra.
  Se un layout futuro ha bisogno di stile diretto sul `<picture>`, serve prop aggiuntiva.
- **Seed raster ~3.2 MB**: grande per un repo. Accettabile come fixture; produzione usa immagini
  uploadate via admin panel.

## Oltre lo scope

- Blur placeholder / LQIP (richiede pre-processing lato build o Strapi plugin)
- Art direction (`<source media="...">` per crop diversi per breakpoint)
- Strapi responsive formats consumption (formati generati dal CMS, non usati dal frontend)
- CDN/edge image optimization (Cloudflare Polish, Vercel Image Optimization)

## Commit (6)

```
54b7914 docs: image pipeline notes in CLAUDE.md and SETUP.md
3d857f3 test(image): E2E tests for image optimization pipeline
efbff00 feat(seed): add raster fixture for image pipeline testing
9bbf037 feat(image): dynamic remotePatterns from STRAPI_URL env
40f70ef feat(image): replace raw <img> with StrapiImage in all blocks
4afca46 feat(image): add StrapiImage component with Picture pipeline
```

## File toccati (16)

```
NEW  frontend/src/components/StrapiImage.astro
MOD  frontend/src/components/blocks/BlockHero.astro
MOD  frontend/src/components/blocks/BlockImageText.astro
MOD  frontend/src/components/blocks/Card.astro
MOD  frontend/src/types/index.ts
MOD  frontend/astro.config.mjs
NEW  cms/seed-assets/photo-hero.jpg
MOD  cms/seed-assets/CREDITS.md
MOD  cms/src/index.ts
NEW  frontend/e2e/image-optimization.spec.ts
NEW  frontend/src/pages/dev/images.astro
NEW  frontend/public/_test/pixel.png
NEW  frontend/public/_test/icon.svg
MOD  CLAUDE.md
MOD  SETUP.md
```
