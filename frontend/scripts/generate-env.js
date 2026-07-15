#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, ".env.example");
const dest = join(root, ".env");

if (existsSync(dest)) {
  console.error("❌  frontend/.env esiste già — cancellalo manualmente prima di rigenerarlo.");
  process.exit(1);
}

writeFileSync(dest, readFileSync(src, "utf8"), "utf8");
console.log("✅  frontend/.env creato da .env.example.");
console.log("   Incolla il token Strapi nella variabile STRAPI_API_TOKEN.");
