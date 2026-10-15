import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { ValidationError } = errors;

const MENU_ITEM_UID = "api::menu-item.menu-item";

type RelationIntent = "present" | "absent" | "untouched";

function payloadRelationIntent(v: unknown): RelationIntent {
  if (v === undefined || v === null) return "untouched";
  if (typeof v === "string") return "present";
  if (typeof v === "number") return "present";
  if (Array.isArray(v)) return v.length ? "present" : "untouched";
  if (typeof v === "object") {
    const o = v as Record<string, any>;
    const hasConnect = Array.isArray(o.connect) && o.connect.length > 0;
    const hasSet = Array.isArray(o.set);
    const hasDisconnect = Array.isArray(o.disconnect) && o.disconnect.length > 0;
    if (hasConnect) return "present";
    if (hasSet) return o.set.length ? "present" : "absent";
    if (hasDisconnect) return "absent";
    if ("documentId" in o || "id" in o) return "present";
    return "untouched";
  }
  return "untouched";
}

function isStoredRelationPresent(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    const obj = value as Record<string, any>;
    return ("id" in obj && obj.id != null) || ("documentId" in obj && obj.documentId != null);
  }
  return false;
}

function isAbsoluteUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  return /^(https?:\/\/.+|mailto:.+|tel:.+)/i.test(value.trim());
}

function resolvePagePresent(intent: RelationIntent, storedPage: unknown): boolean {
  if (intent === "present") return true;
  if (intent === "absent") return false;
  return isStoredRelationPresent(storedPage);
}

function resolveExternalUrl(dataUrl: unknown, storedUrl: unknown): unknown {
  if (dataUrl === undefined) return storedUrl;
  return dataUrl;
}

function validateState(linkMode: string | undefined, hasPage: boolean, externalUrl: unknown) {
  if (linkMode === "internal" && !hasPage) {
    throw new ValidationError('linkMode "internal" richiede una pagina collegata (campo page).');
  }
  if (linkMode === "external" && !isAbsoluteUrl(externalUrl)) {
    throw new ValidationError(
      'linkMode "external" richiede un URL assoluto valido (http://, https://, mailto: o tel:).',
    );
  }
}

export function registerMenuItemRequiredIf(strapi: Core.Strapi) {
  strapi.documents.use(async (context: any, next: () => Promise<any>) => {
    if (context.uid !== MENU_ITEM_UID) return next();

    const { action, params } = context;

    if (action === "create") {
      const data = params?.data;
      if (data) {
        const intent = payloadRelationIntent(data.page);
        const hasPage = intent === "present";
        validateState(data.linkMode, hasPage, data.externalUrl);
      }
    } else if (action === "update") {
      const { documentId, data } = params ?? {};
      if (documentId && data) {
        const draft = await strapi.db.query(MENU_ITEM_UID).findOne({
          where: { documentId, publishedAt: null },
          populate: { page: true },
        });
        if (draft) {
          const effectiveLinkMode = data.linkMode ?? draft.linkMode;
          const intent = payloadRelationIntent(data.page);
          const hasPage = resolvePagePresent(intent, draft.page);
          const effectiveUrl = resolveExternalUrl(data.externalUrl, draft.externalUrl);
          validateState(effectiveLinkMode, hasPage, effectiveUrl);
        }
      }
    } else if (action === "publish") {
      const { documentId } = params ?? {};
      if (documentId) {
        const draft = await strapi.db.query(MENU_ITEM_UID).findOne({
          where: { documentId, publishedAt: null },
          populate: { page: true },
        });
        if (draft) {
          validateState(draft.linkMode, isStoredRelationPresent(draft.page), draft.externalUrl);
        }
      }
    }

    return next();
  });
}
