import { errors } from "@strapi/utils";

const { ValidationError } = errors;

const UID = "api::menu-item.menu-item" as const;

function extractRelationId(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    if ("id" in obj && typeof obj.id === "number") return obj.id;
    if (Array.isArray(obj.set)) {
      const last = obj.set[obj.set.length - 1];
      if (!last) return null;
      return typeof last === "number" ? last : (last.id ?? null);
    }
    if (obj.set === null) return null;
    if (Array.isArray(obj.connect) && obj.connect.length > 0) {
      const first = obj.connect[0];
      return typeof first === "number" ? first : (first.id ?? null);
    }
  }
  return null;
}

// ── Null normalization (clear non-pertinent field) ────────────────

function normalizeLinkMode(data: Record<string, any>) {
  if (data.linkMode === "internal") data.externalUrl = null;
  else if (data.linkMode === "external") data.page = null;
}

// ── parent hierarchy (max depth 2, no cycles) ─────────────────────

async function validateParent(data: Record<string, any>, entryId?: number) {
  const parentId = extractRelationId(data.parent);
  if (parentId == null) return;

  if (entryId != null && parentId === entryId) {
    throw new ValidationError("Una voce di menu non può essere genitore di sé stessa.");
  }

  const parentRow = await strapi.db.query(UID).findOne({
    where: { id: parentId },
    populate: { parent: { select: ["id"] } },
  });

  if (!parentRow) {
    throw new ValidationError("Il genitore indicato non esiste.");
  }

  if ((parentRow as any).parent?.id) {
    throw new ValidationError(
      "Il genitore deve essere una voce di primo livello (senza genitore). Profondità massima: 2 livelli.",
    );
  }

  if (entryId != null) {
    const children = await strapi.db.query(UID).findMany({
      where: { parent: { id: entryId } },
      select: ["id"],
      limit: 1,
    });
    if (children.length > 0) {
      throw new ValidationError(
        "Impossibile assegnare un genitore: questa voce ha già dei figli (diventerebbe livello 3).",
      );
    }
  }
}

// ── lifecycle hooks ────────────────────────────────────────────────

export default {
  async beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    normalizeLinkMode(data);
    await validateParent(data);
  },

  async beforeUpdate(event: { params: { data: Record<string, any>; where: Record<string, any> } }) {
    const { data, where } = event.params;
    normalizeLinkMode(data);

    if ("parent" in data) {
      await validateParent(data, where.id);
    }
  },
};
