export function validateEnv(): void {
  const url = import.meta.env.STRAPI_URL;
  if (!url) {
    throw new Error(
      "Manca STRAPI_URL in frontend/.env — esegui `npm run setup` e controlla .env.example",
    );
  }
  try {
    new URL(url);
  } catch {
    throw new Error(
      `STRAPI_URL non è un URL valido: "${url}" — controlla frontend/.env`,
    );
  }
}
