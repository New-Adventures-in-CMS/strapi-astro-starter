import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET")!,
  },
  apiToken: {
    salt: env("API_TOKEN_SALT")!,
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT")!,
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY")!,
  },
  flags: {
    nps: env.bool("FLAG_NPS", false),
    promoteEE: env.bool("FLAG_PROMOTE_EE", false),
    docLinks: env.bool("FLAG_DOC_LINKS", true),
  },
  // Preview opzionale — decommentare e adattare per collection con slug
  // preview: {
  //   enabled: true,
  //   config: {
  //     allowedOrigins: [env("CLIENT_URL", "http://localhost:4321")],
  //     async handler(uid, { documentId }) {
  //       const document = await strapi.documents(uid as any).findOne({ documentId });
  //       if (!document) return null;
  //       const slug = (document as any).slug as string | undefined;
  //       if (!slug) return null;
  //       const params = new URLSearchParams({
  //         url: `/pagine/${slug}`,
  //         secret: env("PREVIEW_SECRET", "change-me"),
  //       });
  //       return `${env("CLIENT_URL", "http://localhost:4321")}/api/preview?${params}`;
  //     },
  //   },
  // },
});

export default config;
