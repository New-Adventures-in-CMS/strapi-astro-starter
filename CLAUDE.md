# CLAUDE.md — Building a site on top of this starter

You are an AI agent (Claude Code) working on a site cloned from
`strapi-astro-starter`. **This file is your map, not your manual.** It tells you
which of two surfaces to use for a given change, how to reach each one, and the
traps specific to this stack. It deliberately does not repeat the reference
docs:

- **SETUP.md** — authoritative technical reference (install, config, MCP
  enablement, full field specs, **design system**). On any technical detail,
  SETUP.md wins over this file.
- **GUIDA.md** — Italian tutorial for humans onboarding.

---

## The stack in 30 seconds

Two processes:

- `cms/` — Strapi 5 backend at `http://localhost:1337`. Owns the content and the
  REST API. Serves no user-facing HTML.
- `frontend/` — Astro 7. Reads the API and renders the site. _(If the Astro
  directory in this clone has a different name, read the real one instead.)_

Rule of thumb: change **what data can exist** → backend; change **how it looks**
→ frontend.

---

## Two hands: structure vs content

This is the decision you make on almost every task.

- **File hand → structure.** _What kinds of things can exist, and how they
  render._ Strapi schemas, components, dynamic zones; Astro pages, components,
  layouts; TypeScript types; config. These are files in the repo — versioned and
  reviewable. You edit them directly.
- **MCP hand → content.** _The actual things._ Entries, their published state,
  the links between them. You act through the Strapi MCP server, with the same
  permissions a human editor has.

Decision rule: **am I changing the shape, or the data? Shape → file. Data → MCP.**

| Operation                                             | Hand               | How                                                                        |
| ----------------------------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| Create/change a content-type, component, dynamic zone | **File**           | `cms/src/api/**/schema.json`, `cms/src/components/**`, then restart Strapi |
| Add or change a field                                 | **File**           | edit schema.json → restart → sync Astro types                              |
| Pages, components, layouts, styles                    | **File**           | `frontend/` (Astro)                                                        |
| TypeScript types, config                              | **File**           | repo files                                                                 |
| **Upload** a media file                               | **File / manual**  | no MCP tool exists — admin panel or filesystem                             |
| Create / read / update / delete an entry              | **MCP**            | `create_* / list_* / get_* / update_* / delete_*`                          |
| Publish / unpublish (only if Draft & Publish is on)   | **MCP**            | `publish_* / unpublish_* / discard_*_draft`                                |
| **Link** existing media or relations                  | **MCP**            | `connect / disconnect / set` by `documentId`                               |
| Read form submissions (runtime data)                  | **MCP, read-only** | `list_/get_form-submission` — never fabricate them                         |

Boundary cases worth memorizing:

- **Media is referencing-only.** There is no upload tool over MCP. Uploading a
  file is a file/manual step; MCP can only _link_ an already-uploaded asset to an
  entry.
- **Enumerations** (e.g. `menu-item.area` = `header|footer|both`) are structure →
  file, even though they feel like data.
- **`form-submission`** is runtime data created by end users. Read it if asked;
  never seed or invent it.
- This starter ships **no single type**, and i18n is **off**. Adding either is a
  file change first.

---

## Connecting to the two hands

The **file hand** always works. The **MCP hand** needs three preconditions.
Miss any one and it fails the same confusing way — `strapi-mcp failed to
connect`:

1. **Strapi is running** in dev, in a _separate terminal_, on **Node 22**, and
   was started **before** this session.
2. **This session was launched from the project root.** The MCP registration is
   project-local; a session started elsewhere never loads it.
3. **The MCP is registered with an Admin API Token** (Settings → _Admin Tokens_),
   **not** a Content API token. A Content API token is rejected with `401`.

**Self-diagnosis rule — do not skip.** `failed to connect` does **not** mean
"Strapi is down." Before concluding anything, check in this order:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:1337/mcp
```

- `405` → the MCP is alive and mounted (it only accepts POST). The problem is the
  **token or the session**, not Strapi.
- `404` → the MCP isn't enabled (`server.mcp.enabled` / `STRAPI_MCP_ENABLED`).
  See SETUP.md.
- connection refused / `000` → Strapi genuinely isn't up.

Never restart Strapi as a first reflex, and never report "Strapi is down"
without the curl check. If `405` but still failing: wrong token type (must be
Admin), a revoked token, or a session not launched from the project root.

---

## File hand — structure

_(Full how-to is in SETUP.md; this is orientation.)_

Where things live:

- Content-type schema: `cms/src/api/<name>/content-types/<name>/schema.json` —
  the file you edit most.
- Controllers / routes / services: identical boilerplate per content-type. If you
  split routes, use **two files** in `routes/` (a factory router file plus a
  `custom.ts`). Never spread `createCoreRouter(...).routes` inline — it is
  evaluated before content-types register and throws
  `Cannot read properties of undefined (reading 'kind')`.
- Components: `cms/src/components/<namespace>/<name>.json`.
- Astro types: `frontend/src/types/index.ts` — keep in sync whenever a schema changes.
- **Layout primitives:** `frontend/src/components/layout/` (`Section.astro`,
  `Container.astro`, barrel `index.ts`). **Canonical measures** (widths, tones,
  spacing) live in `frontend/src/components/layout/variants.ts` — always read
  there, never hardcode values.
- **SectionHeader:** `frontend/src/components/SectionHeader.astro` — eyebrow /
  heading / lead with `align` and `onDark` props.
- **Logo:** `frontend/src/components/Logo.astro` — single SVG lockup,
  `fill="currentColor"`, all paths outlined. Replace the SVG body to swap brand;
  keep `fill="currentColor"` on the root. See SETUP.md → "Logo".
- **Design tokens / type scale / font swap / Header v2 / Hero immersive /
  Rich-text align / seed assets / Reset DB:** all in SETUP.md → "Design system".

**Golden sequence for a structural change:** edit schema → **restart Strapi**
(schema discovery happens only at boot) → update Astro types → then fill content.

Traps:

- Strapi CLI is `cd cms && npx strapi <cmd>` — there is no root `strapi` script.
- Node 22 (pinned in `.nvmrc`); Node 24+ → `EBADENGINE`.
- **Dynamic-zone populate over REST needs the `on` form.** The flat form
  `populate: { blocks: { populate: { image: true } } }` returns HTTP 400
  `Invalid key populate at blocks`. Populate each component explicitly:
  ```ts
  populate: {
    blocks: {
      on: {
        "blocks.hero":       { populate: { image: true } },
        "blocks.rich-text":  true,
        "blocks.image-text": { populate: { image: true } },
        "blocks.card-grid":  { populate: { cards: { populate: { image: true } } } },
      },
    },
  }
  ```
  A ready-made `pageBlocksPopulate` const in `@/lib/strapi` covers the four
  shipped block types. (Server-side Document Service accepts the flat form —
  this is REST-only.)
- **Markdown fields (`body` on `page`) are raw Markdown, not HTML.** Render via
  `renderMarkdown(md)` from `@/lib/markdown` → `set:html` inside the Starwind
  `<Prose>` wrapper. Never dump `page.body` straight into the template.
- **Env files auto-generate on first `npm run dev`** (`scripts/ensure-env.js`).
  Never overwrite an existing `.env` — if secrets need rotating, delete the file
  by hand first.

---

## MCP hand — content (verified tool surface)

Tools are generated per content-type. Naming pattern:
`list_<ct>`, `get_<ct>`, `create_<ct>`, `update_<ct>`, `delete_<ct>`. When
**Draft & Publish is on**, three more appear: `publish_<ct>`, `unpublish_<ct>`,
`discard_<ct>_draft`. A dev-only `log` utility also exists.

Rules that will bite you if ignored:

- **Identity is `documentId`, never the numeric `id`.** `documentId` is stable
  across draft/published versions; the numeric `id` changes per version row.
  Always address entries by `documentId`.
- **Draft & Publish entries are created as drafts.** After `create_page` /
  `create_menu-item`, the entry is invisible to the published API until you call
  `publish_<ct>`. If new content doesn't appear on the site, you probably forgot
  to publish.
- **Relations** use `connect` / `disconnect` / `set` with `documentId`
  (e.g. `menu-item.page`, and `menu-item.parent` for two-level nesting).
- **Media**: link-only via relation fields; no upload.
- **`form-submission`**: read-only in practice.

### Shipped content-types (map)

| Content-type      | Kind       | D&P | Key fields                                                                           | MCP tools               |
| ----------------- | ---------- | --- | ------------------------------------------------------------------------------------ | ----------------------- |
| `page`            | collection | on  | title, slug, body, seo_desc, blocks (dynamic zone)                                   | 8 (CRUD + publish trio) |
| `menu-item`       | collection | on  | label, page→, externalUrl, area, footerColumn, parent→(self), order                  | 8                       |
| `form`            | collection | off | nome, slug, emailDestinatario, messaggioSuccesso, campi (dynamic zone), submissions→ | 5 (CRUD)                |
| `form-submission` | collection | off | form→, dati, letto                                                                   | 5 (CRUD)                |

Components ship under two dynamic zones:

- `form.campi` — form field types: Checkbox, Email, Select, Testo, Textarea.
- `page.blocks` — page-builder blocks: `blocks.hero` (heading, subheading,
  cta_text, cta_url, image, eyebrow, **immersive**), `blocks.rich-text` (body,
  eyebrow, **align**: left|center|right), `blocks.image-text` (heading, body,
  image, image_position, eyebrow, **tone**), `blocks.card-grid` (heading,
  cards, eyebrow, **tone**). `blocks.card-grid.cards` is a repeatable
  `shared.card` component.

Astro renderers live at `frontend/src/components/blocks/` (`BlockHero.astro`,
`BlockRichText.astro`, `BlockImageText.astro`, `BlockCardGrid.astro`) and are
dispatched by `BlockRenderer.astro` on `__component`. Page templates render
blocks first, then `body` Markdown below as a fallback article.

**Bootstrap seed:** on empty DB, `cms/src/index.ts` seeds demo pages (home,
about, services, contacts) plus a set of menu items and CC0 SVG images from
`cms/seed-assets/`. Home uses an immersive hero; all cards have images. Seed
is idempotent — subsequent boots skip if any published page exists. To
recreate demo content, stop Strapi, run `npm run db:reset` (or
`find . -path '*/.tmp/data.db' -delete`), restart. **Do not** use
`rm cms/.tmp/data.db` — the DB path varies by compiled config.

SETUP.md is authoritative for full field specs.

---

## End-to-end: adding a section to the site

1. Model it in Strapi — new content-type or fields (**file**).
2. **Restart Strapi.**
3. Sync `frontend/src/types/index.ts` (**file**).
4. Create the entries via **MCP**; for Draft & Publish types, `publish` them.
5. Build the Astro page/component that reads the API (**file**).
6. Verify against the running frontend.

Structure before content — you can't fill fields that don't exist yet.

---

## Guardrails

- **Secrets:** never read, write, or commit real env files (`**/.env`,
  `.env.local`, `.env.production`). `.env.example` is the template and is fine to
  read and commit.
- **Dev DB:** never commit or write `cms/.tmp/data.db` or anything under `.tmp/`.
- **Destructive MCP tools** (`delete_*`, `unpublish_*`, `discard_*_draft`) require
  confirmation — they are in the `ask` list of `.claude/settings.json`. Claude
  Code matches MCP tools by **exact name** (no mid-name wildcards), so **when you
  add a content-type, add its destructive tools to that `ask` list too.**
- **Branch discipline:** work on a dedicated branch; a clean-clone check is the
  gate before merging.
- **Worktree:** always create worktrees **outside** the project directory (skill
  `superpowers:using-git-worktrees`). CMS and frontend watcher cover the whole
  tree — an internal worktree triggers spurious rebuilds. Run **one `npm run
dev` at a time** — ports 1337 and 4321 are fixed; two parallel dev processes
  collide.
- **Stay generic:** `page` / `menu-item` / `form` are examples to build on or
  replace, not a fixed model. Prefer generic additions unless the site you're
  building needs otherwise.
