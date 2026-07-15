#!/usr/bin/env node
const { randomBytes } = require("crypto");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const src = join(root, ".env.example");
const dest = join(root, ".env");

if (existsSync(dest)) {
  console.error(
    "❌  cms/.env esiste già — cancellalo manualmente prima di rigenerarlo.",
  );
  process.exit(1);
}

const b64 = () => randomBytes(32).toString("base64");
const hex = () => randomBytes(16).toString("hex");

const appKeys = [b64(), b64(), b64(), b64()].join(",");

let content = readFileSync(src, "utf8");

content = content
  .replace(/^APP_KEYS=.*/m, `APP_KEYS=${appKeys}`)
  .replace(/^API_TOKEN_SALT=.*/m, `API_TOKEN_SALT=${b64()}`)
  .replace(/^ADMIN_JWT_SECRET=.*/m, `ADMIN_JWT_SECRET=${b64()}`)
  .replace(/^TRANSFER_TOKEN_SALT=.*/m, `TRANSFER_TOKEN_SALT=${b64()}`)
  .replace(/^ENCRYPTION_KEY=.*/m, `ENCRYPTION_KEY=${hex()}`);

writeFileSync(dest, content, "utf8");
console.log("✅  cms/.env generato con secrets casuali.");
console.log("   Dopo il primo avvio di Strapi, crea un API token e");
console.log("   incollalo in frontend/.env come STRAPI_API_TOKEN.");
