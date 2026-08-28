import type { Core } from "@strapi/strapi";

const PUBLIC_COLLECTION_UIDS: string[] = [
  "api::form.form",
  "api::page.page",
  "api::menu-item.menu-item",
];

const PUBLIC_SINGLE_UIDS: string[] = [];

async function seedDemoPages(strapi: Core.Strapi) {
  try {
    // Home — hero + card grid + rich text
    await strapi.documents("api::page.page").create({
      data: {
        title: "Home",
        slug: "home",
        seo_desc:
          "A production-ready starter kit combining Strapi 5 (headless CMS) with Astro 7 (server-rendered frontend).",
        blocks: [
          {
            __component: "blocks.hero",
            heading: "Build faster with Strapi + Astro",
            subheading:
              "A production-ready starter kit with headless CMS, server-rendered pages, and a block-based page builder.",
            cta_text: "Explore components",
            cta_url: "/esempio",
          },
          {
            __component: "blocks.card-grid",
            heading: "Everything you need",
            cards: [
              {
                title: "Headless CMS",
                description:
                  "Manage content from Strapi's intuitive admin panel. Create pages, menus, and forms without touching code.",
              },
              {
                title: "Block Page Builder",
                description:
                  "Compose pages with reusable blocks — hero banners, rich text, image sections, and card grids.",
              },
              {
                title: "Ready to Deploy",
                description:
                  "Astro SSR, Tailwind CSS, TypeScript — built for production from day one.",
              },
            ],
          },
          {
            __component: "blocks.rich-text",
            body: "## Get started\n\nThis demo content was seeded automatically. Edit it in the Strapi admin panel at [localhost:1337/admin](http://localhost:1337/admin), or delete it and start fresh.\n\nNeed help? Check the [setup guide](https://github.com/New-Adventures-in-CMS/strapi-astro-starter).",
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
          "Extracted from production work and designed to save the first 40 hours of every CMS project.",
        blocks: [
          {
            __component: "blocks.image-text",
            heading: "Built for real projects",
            body: "This starter isn't a toy. It's extracted from production work and designed to save you the first 40 hours of every CMS project.\n\nStrapi handles content. Astro handles rendering. You handle the creative part.",
            image_position: "left",
          },
          {
            __component: "blocks.rich-text",
            body: "## What's included\n\n- **Dynamic navigation** — header and footer menus managed from Strapi\n- **Page builder** — compose pages with blocks from the admin\n- **Form system** — dynamic forms with email notifications\n- **Markdown support** — rich text rendered beautifully with typography styles\n- **Developer experience** — TypeScript, hot reload, auto-generated env files",
          },
        ],
      } as any,
      status: "published",
    });

    // Skeletons for menu targets
    await strapi.documents("api::page.page").create({
      data: {
        title: "Servizi",
        slug: "services",
        body: "Placeholder page. Replace with your own content.",
      },
      status: "published",
    });
    await strapi.documents("api::page.page").create({
      data: {
        title: "Contatti",
        slug: "contacts",
        body: "Placeholder page. Replace with your own content.",
      },
      status: "published",
    });

    strapi.log.info(
      "[bootstrap] Seeded demo pages (home, about, services, contacts)",
    );
  } catch (err) {
    strapi.log.warn("[bootstrap] Seed demo pages fallito: " + String(err));
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
