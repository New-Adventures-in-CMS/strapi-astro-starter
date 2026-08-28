import type { Core } from "@strapi/strapi";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_COLLECTION_UIDS: string[] = [
  "api::form.form",
  "api::page.page",
  "api::menu-item.menu-item",
];

const PUBLIC_SINGLE_UIDS: string[] = [];

const SEED_ASSETS_DIR = path.join(process.cwd(), "seed-assets");

/**
 * Upload a seed image from the seed-assets directory.
 * Idempotent — skips if a media file with the same name already exists.
 * Returns { id, documentId } for attachment to content, or null if failed.
 */
async function uploadSeedImage(
  strapi: Core.Strapi,
  filename: string,
  alt: string,
): Promise<{ id: number; documentId: string } | null> {
  try {
    // Idempotence: check if a media with this name already exists.
    const existing = await strapi.db.query("plugin::upload.file").findOne({
      where: { name: filename },
    });
    if (existing) {
      strapi.log.debug(`[seed] Reusing existing media: ${filename}`);
      return { id: existing.id, documentId: existing.documentId };
    }

    const fullPath = path.join(SEED_ASSETS_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      strapi.log.warn(`[seed] Asset not found: ${fullPath}`);
      return null;
    }

    const size = fs.statSync(fullPath).size;
    const ext = path.extname(filename).toLowerCase();
    const mime =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
              ? "image/webp"
              : "application/octet-stream";

    const uploadService = strapi.plugin("upload").service("upload");
    const [uploaded] = await uploadService.upload({
      data: {
        fileInfo: {
          alternativeText: alt,
          caption: alt,
          name: filename,
        },
      },
      files: {
        filepath: fullPath,
        originalFilename: filename,
        mimetype: mime,
        size,
      },
    });

    strapi.log.info(`[seed] Uploaded: ${filename} → ${uploaded.id}`);
    return { id: uploaded.id, documentId: uploaded.documentId };
  } catch (err) {
    strapi.log.error(
      `[seed] Upload failed for ${filename}: ${String(err)}`,
    );
    return null;
  }
}

async function seedDemoPages(strapi: Core.Strapi) {
  try {
    // Upload seed images (idempotent)
    const heroImg = await uploadSeedImage(
      strapi,
      "hero-home.svg",
      "Abstract dark editorial hero background",
    );
    const aboutImg = await uploadSeedImage(
      strapi,
      "image-text-about.svg",
      "Abstract dark editorial illustration",
    );

    // Home — immersive hero with image + two card grids (light + dark statement) + rich text
    await strapi.documents("api::page.page").create({
      data: {
        title: "Home",
        slug: "home",
        seo_desc:
          "Production-ready starter kit combining Strapi 5 headless CMS with Astro 7 server-rendered pages, a block-based page builder, dynamic forms, and a design system tuned for editorial layouts.",
        blocks: [
          {
            __component: "blocks.hero",
            eyebrow: "STARTER KIT",
            heading: "Ship editorial content, fast.",
            subheading:
              "A production-ready foundation for content-driven sites: Strapi handles the CMS, Astro renders on the server, the design system carries the taste.",
            cta_text: "Explore the design system",
            cta_url: "/esempio",
            immersive: true,
            image: heroImg ? heroImg.id : undefined,
          },
          {
            __component: "blocks.card-grid",
            eyebrow: "WHAT'S INSIDE",
            heading: "Everything a modern content site needs",
            lead: "Batteries included, no lock-in: swap fonts, tokens, or blocks without unwiring the stack.",
            tone: "light",
            cards: [
              {
                title: "Headless CMS",
                description:
                  "Manage pages, navigation, and forms from Strapi's admin. Content-types and components are versioned as JSON — no vendor UI.",
              },
              {
                title: "Block page builder",
                description:
                  "Compose pages with reusable blocks — hero, rich text, image + text, card grids — and add new ones by dropping a schema + an Astro renderer.",
              },
              {
                title: "Design system built in",
                description:
                  "Section and Container primitives, a fluid type scale, semantic tokens ready for a Radix repoint. Change the accent in one place, everywhere follows.",
              },
              {
                title: "Dynamic forms",
                description:
                  "Form definitions live in the CMS. Submissions land in the admin, honeypots and Turnstile-ready validation on the frontend.",
              },
              {
                title: "SEO and sitemap",
                description:
                  "Server-rendered pages, per-page canonical + description fields, sitemap generated at build time.",
              },
              {
                title: "Ready to deploy",
                description:
                  "Astro SSR on Node, TypeScript everywhere, environment scaffolding on first run. Ship it to any Node host.",
              },
            ],
          },
          {
            __component: "blocks.card-grid",
            eyebrow: "FOR AGENCIES AND SOLO BUILDERS",
            heading: "Skip the first forty hours of every project.",
            lead: "This is the boilerplate we wish we had on the last five sites.",
            tone: "dark",
            cards: [
              {
                title: "Clone and run",
                description:
                  "install:all, dev, done. No manual env plumbing, no missing steps.",
              },
              {
                title: "Editorial by default",
                description:
                  "Dark statement bands, uppercase display headlines, generous rhythm — tuned, not vanilla.",
              },
              {
                title: "Repointable tokens",
                description:
                  "Semantic color layer isolated from Tailwind palette — swap to Radix Colors without touching components.",
              },
            ],
          },
          {
            __component: "blocks.rich-text",
            body:
              "## Where to go next\n\nEdit this page from the Strapi admin at [localhost:1337/admin](http://localhost:1337/admin), or start fresh by removing the seeded pages and creating your own. The [setup guide](https://github.com/New-Adventures-in-CMS/strapi-astro-starter) walks through the block system, seed, and deployment.",
          },
        ],
      } as any,
      status: "published",
    });

    // About — image+text + rich text
    await strapi.documents("api::page.page").create({
      data: {
        title: "Chi siamo",
        slug: "about",
        seo_desc:
          "Extracted from real production work — this starter exists so the next site can begin with the interesting problems, not the plumbing.",
        blocks: [
          {
            __component: "blocks.image-text",
            eyebrow: "BEHIND THE STARTER",
            heading: "Built from real production work.",
            body:
              "This starter isn't a demo. It's what we wish we'd had on the last five content-driven projects — extracted, cleaned up, and shared.\n\nStrapi handles the content model. Astro renders it. The design system carries the taste so day-one pages already read like a magazine, not a template.",
            image_position: "left",
            image: aboutImg ? aboutImg.id : undefined,
          },
          {
            __component: "blocks.rich-text",
            body:
              "## What's included\n\n- **Dynamic navigation** — header and footer menus modelled in Strapi, resolved at request time.\n- **Block page builder** — hero, rich text, image + text, card grids. Add new blocks by dropping a component schema and an Astro renderer.\n- **Form system** — form definitions in the CMS, submissions in the admin, honeypot on the frontend.\n- **Design system** — Section + Container primitives, fluid type scale, semantic token layer, opt-in immersive hero with a scroll-aware header overlay.\n- **DX** — TypeScript on both sides, hot reload, environment scaffolding on first `dev`, seed idempotent.",
          },
        ],
      } as any,
      status: "published",
    });

    // Services — replace placeholder with sensible skeleton
    await strapi.documents("api::page.page").create({
      data: {
        title: "Servizi",
        slug: "services",
        seo_desc:
          "The starter ships with a page skeleton at /pagine/services — use it as a template for landing pages, product pages, or service breakdowns.",
        blocks: [
          {
            __component: "blocks.rich-text",
            body:
              "## Services\n\nThis page is a skeleton, ready to be replaced. Drop in blocks from the Strapi admin — hero banners, card grids, image + text sections — to describe what you offer.\n\nDelete this content and start fresh, or duplicate the structure for other landing pages.",
          },
        ],
      } as any,
      status: "published",
    });

    // Contacts — replace placeholder with sensible skeleton
    await strapi.documents("api::page.page").create({
      data: {
        title: "Contatti",
        slug: "contacts",
        seo_desc:
          "Contact page skeleton. Pair it with a dynamic form from the Strapi admin to collect enquiries.",
        blocks: [
          {
            __component: "blocks.rich-text",
            body:
              "## Get in touch\n\nReplace this content with a contact form (see `DynamicForm.astro` and the `form` content-type) or a plain description of how to reach you.\n\nForm submissions land in the Strapi admin under **Content Manager → Form submission**.",
          },
        ],
      } as any,
      status: "published",
    });

    strapi.log.info(
      "[seed] Seeded demo pages: home, about, services, contacts",
    );
  } catch (err) {
    strapi.log.error("[seed] Seeding demo pages failed: " + String(err));
  }
}

async function seedMenuItems(strapi: Core.Strapi) {
  try {
    const count = await strapi
      .documents("api::menu-item.menu-item" as any)
      .count({});
    if (count > 0) return;

    const pages = await strapi
      .documents("api::page.page")
      .findMany({ status: "published" });
    const bySlug: Record<string, { documentId: string }> = Object.fromEntries(
      pages.map((p) => [
        p.slug as string,
        { documentId: p.documentId as string },
      ]),
    );

    const connectPage = (slug: string) =>
      bySlug[slug]
        ? { connect: [{ documentId: bySlug[slug].documentId }] }
        : undefined;

    // Root items
    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Home",
        area: "both",
        order: 1,
        page: connectPage("home"),
      },
      status: "published",
    });

    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Chi siamo",
        area: "header",
        order: 2,
        page: connectPage("about"),
      },
      status: "published",
    });

    const servizi = await strapi
      .documents("api::menu-item.menu-item" as any)
      .create({
        data: {
          label: "Servizi",
          area: "header",
          order: 3,
          page: connectPage("services"),
        },
        status: "published",
      });

    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Contatti",
        area: "both",
        order: 4,
        page: connectPage("contacts"),
      },
      status: "published",
    });

    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Documentazione",
        area: "header",
        order: 5,
        externalUrl: "https://docs.astro.build",
      },
      status: "published",
    });

    // Children of Servizi
    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Servizio A",
        area: "header",
        order: 1,
        externalUrl: "/servizi/a",
        parent: { connect: [{ documentId: servizi.documentId as string }] },
      },
      status: "published",
    });

    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Servizio B",
        area: "header",
        order: 2,
        externalUrl: "/servizi/b",
        parent: { connect: [{ documentId: servizi.documentId as string }] },
      },
      status: "published",
    });

    // Footer-only items
    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Privacy",
        area: "footer",
        order: 1,
        externalUrl: "/privacy",
        footerColumn: "Legale",
      },
      status: "published",
    });

    await strapi.documents("api::menu-item.menu-item" as any).create({
      data: {
        label: "Termini",
        area: "footer",
        order: 2,
        externalUrl: "/termini",
        footerColumn: "Legale",
      },
      status: "published",
    });

    strapi.log.info("[bootstrap] Seeded 9 menu items");
  } catch (err) {
    strapi.log.warn("[bootstrap] Seed menu items fallito: " + String(err));
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) {
      strapi.log.warn("[bootstrap] Ruolo Public non trovato");
      return;
    }

    const permissionRepo = strapi.db.query(
      "plugin::users-permissions.permission",
    );

    const desired: string[] = [];

    for (const uid of PUBLIC_COLLECTION_UIDS) {
      desired.push(`${uid}.find`);
      desired.push(`${uid}.findOne`);
    }
    for (const uid of PUBLIC_SINGLE_UIDS) {
      desired.push(`${uid}.find`);
    }

    desired.push("api::form-submission.form-submission.submit");

    let created = 0;
    for (const action of desired) {
      const existing = await permissionRepo.findOne({
        where: { action, role: publicRole.id },
      });
      if (!existing) {
        await permissionRepo.create({ data: { action, role: publicRole.id } });
        created++;
      }
    }

    if (created > 0) {
      strapi.log.info(
        `[bootstrap] Aggiunti ${created} permessi al ruolo Public`,
      );
    }

    // Seed default pages if none exist
    const pageCount = await strapi
      .documents("api::page.page")
      .count({ status: "published" });
    if (pageCount === 0) {
      await seedDemoPages(strapi);
    }

    await seedMenuItems(strapi);
  },
};
