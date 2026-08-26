import type { Core } from "@strapi/strapi";

const PUBLIC_COLLECTION_UIDS: string[] = [
  "api::form.form",
  "api::page.page",
  "api::menu-item.menu-item",
];

const PUBLIC_SINGLE_UIDS: string[] = [];

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
    const home = await strapi
      .documents("api::menu-item.menu-item" as any)
      .create({
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
      const seedPages = [
        { title: "Home", slug: "home" },
        { title: "Chi siamo", slug: "about" },
        { title: "Servizi", slug: "services" },
        { title: "Contatti", slug: "contacts" },
      ];
      for (const data of seedPages) {
        await strapi.documents("api::page.page").create({
          data,
          status: "published",
        });
      }
      strapi.log.info("[bootstrap] Seeded 4 default pages");
    }

    await seedMenuItems(strapi);
  },
};
