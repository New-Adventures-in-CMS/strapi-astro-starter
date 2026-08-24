/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL base del CMS Strapi — usato lato server nelle chiamate API */
  readonly STRAPI_URL: string;
  /** URL base del CMS Strapi — esposto al client (es. per strapiMediaUrl) */
  readonly PUBLIC_STRAPI_URL: string;
  /** Token API Strapi per le mutation (POST, PUT, DELETE) */
  readonly STRAPI_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
