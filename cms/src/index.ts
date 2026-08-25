import type { Core } from "@strapi/strapi";

const PUBLIC_COLLECTION_UIDS: string[] = ["api::form.form", "api::page.page"];

const PUBLIC_SINGLE_UIDS: string[] = [];

const MANUAL_HINT =
  "ℹ️  Navigation: i custom fields sono stati scritti nel DB. Per usarli, abilitali " +
  "in Settings → Navigation (sezione 'Custom fields settings'). Passaggio una-tantum.";

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
        "✅ Navigation: custom fields scritti nel DB. Abilitali in Settings → Navigation → 'Custom fields settings' (una-tantum).",
      );
      return;
    }

    strapi.log.warn(MANUAL_HINT);
  } catch {
    strapi.log.warn(MANUAL_HINT);
  }
}

type NavAdminService = {
  post?: (a: {
    payload: { name: string; visible: boolean };
    auditLog: undefined;
  }) => Promise<{ documentId: string; locale: string }>;
  put?: (a: {
    payload: {
      documentId: string;
      name: string;
      visible: boolean;
      locale: string;
      items: unknown[];
    };
    auditLog: undefined;
  }) => Promise<unknown>;
};

async function seedNavigation(strapi: Core.Strapi) {
  try {
    const navUid = (
      strapi.plugin("navigation")?.contentType?.("navigation") as
        { uid?: string } | undefined
    )?.uid;
    if (!navUid) {
      strapi.log.warn(
        "[bootstrap] Seed nav: content type non trovato. Crea la nav 'main' manualmente.",
      );
      return;
    }

    // Idempotency: skip if 'main' already exists
    const existing = await (
      strapi.documents as (uid: string) => {
        findMany: (opts: unknown) => Promise<unknown[]>;
      }
    )(navUid).findMany({ filters: { slug: "main" }, limit: 1 });
    if (existing.length > 0) return;

    const adminSvc = strapi.plugin("navigation")?.service?.("admin") as
      NavAdminService | undefined;
    if (!adminSvc?.post || !adminSvc?.put) {
      strapi.log.warn(
        "[bootstrap] Seed nav: servizio admin plugin non disponibile. Crea la nav 'main' manualmente.",
      );
      return;
    }

    const nav = await adminSvc.post({
      payload: { name: "Main", visible: true },
      auditLog: undefined,
    });

    const pages = await strapi
      .documents("api::page.page")
      .findMany({ status: "published" });
    const bySlug = Object.fromEntries(pages.map((p) => [p.slug as string, p]));

    const seedDefs = [
      { slug: "home", title: "Home", order: 1 },
      { slug: "about", title: "Chi siamo", order: 2 },
      { slug: "services", title: "Servizi", order: 3 },
      { slug: "contacts", title: "Contatti", order: 4 },
    ];

    const items = seedDefs
      .filter((d) => bySlug[d.slug])
      .map(({ slug, title, order }) => ({
        title,
        type: "INTERNAL",
        uiRouterKey: slug,
        menuAttached: true,
        order,
        collapsed: false,
        related: {
          documentId: (bySlug[slug] as { documentId: string }).documentId,
          __type: "api::page.page",
        },
      }));

    if (items.length > 0) {
      await adminSvc.put({
        payload: {
          documentId: nav.documentId,
          name: "Main",
          visible: true,
          locale: nav.locale,
          items,
        },
        auditLog: undefined,
      });
    }

    strapi.log.info(
      `[bootstrap] Seeded 'main' navigation with ${items.length} items`,
    );
  } catch (err) {
    strapi.log.warn(
      "[bootstrap] Seed navigazione non riuscito: crea la nav 'main' " +
        "manualmente in Navigation → Add new navigation. Dettaglio: " +
        String(err),
    );
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
    await seedNavigation(strapi);
  },
};
