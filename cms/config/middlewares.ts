import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      // In produzione aggiungere il dominio reale: ["https://www.miosito.it"]
      origin: [env("CLIENT_URL", "http://localhost:4321")],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      keepHeaderOnError: true,
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

export default config;
