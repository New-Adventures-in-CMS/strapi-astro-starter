#!/usr/bin/env node
// Garantisce che cms/.env e frontend/.env esistano prima di `npm run dev`.
// Idempotente: se già presenti, non tocca nulla.
const { existsSync, copyFileSync } = require("fs");
const { execSync } = require("child_process");
const { join } = require("path");

const root = join(__dirname, "..");
const cmsEnv = join(root, "cms", ".env");
const frontendEnv = join(root, "frontend", ".env");
const frontendEnvExample = join(root, "frontend", ".env.example");

if (!existsSync(cmsEnv)) {
  console.log("  cms/.env mancante: genero secrets…");
  execSync("node cms/scripts/generate-env.js", {
    cwd: root,
    stdio: "inherit",
  });
} else {
  console.log("  cms/.env: ok");
}

if (!existsSync(frontendEnv)) {
  if (existsSync(frontendEnvExample)) {
    copyFileSync(frontendEnvExample, frontendEnv);
    console.log("  frontend/.env creato da .env.example");
  } else {
    console.log("  frontend/.env.example mancante: skip");
  }
} else {
  console.log("  frontend/.env: ok");
}
