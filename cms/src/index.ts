import type { Core } from "@strapi/strapi";

const PUBLIC_COLLECTION_UIDS: string[] = ["api::form.form", "api::page.page"];

const PUBLIC_SINGLE_UIDS: string[] = [];

const MANUAL_HINT =
  "ℹ️  Navigation: per attivare i campi 'footerColumn' e 'showInHeader' " +
  "vai in Settings → Navigation → 'Restore configuration', poi abilita i campi. " +
  "(Passaggio una-tantum al primo avvio.)";

async function ensureNavigationCustomFields(strapi: Core.Strapi) {
  try {
    const store = strapi.store({ type: "plugin", name: "navigation" });
    const current = (await store.get({ key: "config" })) as Record<
      string,
      unknown
    > | null;

    const already =
      Array.isArray(current?.additionalFields) &&
      (current.additionalFields as unknown[]).some(
        (f) =>
          typeof f === "object" &&
          f !== null &&
          (f as Record<string, unknown>).name === "footerColumn",
      );
    if (already) return;

    // Strada A: use common service's setDefaultConfig (reads file config, writes to store)
    const commonSvc = strapi.plugin("navigation")?.service?.("common") as
      { setDefaultConfig?: () => Promise<unknown> } | undefined;
    if (commonSvc && typeof commonSvc.setDefaultConfig === "function") {
      await commonSvc.setDefaultConfig();
      strapi.log.info(
        "✅ Navigation: custom fields ripristinati automaticamente.",
      );
      return;
    }

    strapi.log.warn(MANUAL_HINT);
  } catch {
    strapi.log.warn(MANUAL_HINT);
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

    await ensureNavigationCustomFields(strapi);
  },
};
