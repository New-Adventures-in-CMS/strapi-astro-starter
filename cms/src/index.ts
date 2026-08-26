import type { Core } from "@strapi/strapi";

const PUBLIC_COLLECTION_UIDS: string[] = [
  "api::form.form",
  "api::page.page",
  "api::menu-item.menu-item",
];

const PUBLIC_SINGLE_UIDS: string[] = [];

async function seedMenuItems(_strapi: Core.Strapi) {
  // implemented in Task 5
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
