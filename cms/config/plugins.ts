import type { Core } from "@strapi/strapi";

const allowedMediaTypes = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "application/msword",
  "application/vnd.ms-office",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.*",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
];

const deniedExecutableTypes = [
  "application/vnd.microsoft.portable-executable",
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sh",
  "text/x-shellscript",
  "application/x-mach-binary",
];

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "localhost"),
        port: env.int("SMTP_PORT", 587),
        secure: env.int("SMTP_PORT", 587) === 465,
        auth: {
          user: env("SMTP_USER", ""),
          pass: env("SMTP_PASS", ""),
        },
        connectionTimeout: 5000,
        socketTimeout: 5000,
      },
      settings: {
        defaultFrom: env("SMTP_FROM", "noreply@example.com"),
        defaultReplyTo: env("SMTP_FROM", "noreply@example.com"),
      },
    },
  },
  "users-permissions": {
    config: {
      jwtManagement: "refresh",
      sessions: { httpOnly: true },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
  "sortable-entries": { enabled: true },
  navigation: { enabled: true },
  seo: { enabled: true },
  // i18n è bundled con Strapi 5 — abilitare se il sito ha più lingue.
  // IMPORTANTE: attivare subito se serve, non si aggiunge facilmente dopo.
  // i18n: { enabled: true },
});

export default config;
