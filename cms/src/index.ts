import type { Core } from "@strapi/strapi";

// Aggiungere qui i UID delle collection che il ruolo Public deve poter leggere.
// Formato: "api::[singolarName].[singolarName]"
// find + findOne vengono abilitati automaticamente al bootstrap.
const PUBLIC_COLLECTION_UIDS: string[] = [
  "api::form.form",
  // Esempi:
  // "api::articolo.articolo",
  // "api::servizio.servizio",
];

// Single type: solo "find" (non ha findOne)
const PUBLIC_SINGLE_UIDS: string[] = [
  // Esempi:
  // "api::homepage.homepage",
  // "api::configurazione.configurazione",
];

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

    // Form submission: route custom pubblica
    desired.push("api::form-submission.form-submission.submit");

    // Navigation plugin
    desired.push("plugin::navigation.client.render");
    desired.push("plugin::navigation.client.renderChild");

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
  },
};
