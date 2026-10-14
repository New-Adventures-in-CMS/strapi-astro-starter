import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { ValidationError } = errors;

const MENU_ITEM_UID = "api::menu-item.menu-item";

/**
 * Payload form: interpret relation as it arrives in create/update params.data
 * (documentId string, { connect }, { set }, null / empty set / disconnect-only → absent)
 */
function isRelationPresentInPayload(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.length > 0) return true;
  if (typeof value === "number") return true;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    if ("documentId" in obj) return true;
    if ("id" in obj && obj.id != null) return true;
    if ("set" in obj) {
      if (obj.set == null || (Array.isArray(obj.set) && obj.set.length === 0)) return false;
      return true;
    }
    if ("disconnect" in obj && !("connect" in obj)) return false;
    if ("connect" in obj && Array.isArray(obj.connect) && obj.connect.length > 0) return true;
  }
  return false;
}

/**
 * Stored/populated form: interpret relation as it comes back from a DB query
 * with populate (entity object with id/documentId, or array for *ToMany).
 */
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
        validateState(data.linkMode, isRelationPresentInPayload(data.page), data.externalUrl);
      }
    } else if (action === "update") {
      const { documentId, data } = params ?? {};
      if (documentId && data) {
        const draft = await strapi.db.query(MENU_ITEM_UID).findOne({
          where: { documentId, publishedAt: null },
          populate: { page: true },
        });
        if (draft) {
          const pageInData = "page" in data;
          const branchUsed = pageInData ? "payload" : "stored";
          const draftPagePresent = isStoredRelationPresent(draft.page);
          strapi.log.info(
            `[required-if] update pageInData=${pageInData} data.page=${JSON.stringify(data.page)} draftPagePresent=${draftPagePresent} branchUsed=${branchUsed}`,
          );
          strapi.log.info(`[required-if] update draft.page=${JSON.stringify(draft.page)}`);
          const effectiveLinkMode = data.linkMode ?? draft.linkMode;
          const hasPage = !pageInData
            ? isStoredRelationPresent(draft.page)
            : isRelationPresentInPayload(data.page);
          const effectiveUrl =
            data.externalUrl !== undefined ? data.externalUrl : draft.externalUrl;
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
          const hasPage = isStoredRelationPresent(draft.page);
          strapi.log.info(
            `[required-if] publish draft.page=${JSON.stringify(draft.page)} hasPage=${hasPage}`,
          );
          validateState(draft.linkMode, hasPage, draft.externalUrl);
        }
      }
    }

    return next();
  });
}
