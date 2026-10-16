#!/usr/bin/env node
/**
 * Syncs design tokens from nsp-ds-tokens into starwind.css.
 * Regions: primitive colors (core/color.json), responsive spacing (semantic/layout.json),
 *          responsive type-size (responsive/type-size.json).
 * Only built-in Node.js modules. No npm dependencies.
 * Maintainer-only: requires access to NSP-Design-System-Tokens.
 * Usage: node scripts/tokens-sync.mjs [--check]
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const CHECK = process.argv.includes("--check");

// Sentinels — must match starwind.css exactly
const S_ROOT_START =
  "/* >>> tokens:sync START — generated from nsp-ds-tokens core/color.json — DO NOT EDIT */";
const S_ROOT_END = "/* <<< tokens:sync END */";
const S_DARK_START =
  "/* >>> tokens:sync START (dark) — generated from nsp-ds-tokens core/color.json — DO NOT EDIT */";
const S_DARK_END = "/* <<< tokens:sync END (dark) */";
const S_SPACING_START =
  "/* >>> tokens:sync START (spacing) — from nsp-ds-tokens semantic/layout.json — DO NOT EDIT */";
const S_SPACING_END = "/* <<< tokens:sync END (spacing) */";
const S_TYPE_SIZE_START =
  "/* >>> tokens:sync START (type-size) — from nsp-ds-tokens responsive/type-size.json — DO NOT EDIT */";
const S_TYPE_SIZE_END = "/* <<< tokens:sync END (type-size) */";
const INDENT = "  ";
const SIZE_ORDER = ["sm", "md", "lg", "xl", "2xl"];

// 1. Verify git
const gitCheck = spawnSync("git", ["--version"], { encoding: "utf8" });
if (gitCheck.status !== 0) {
  console.error("Error: git not found. Install git and retry.");
  process.exit(1);
}

// 2. Read config
const config = JSON.parse(readFileSync(join(ROOT, "tokens.sync.json"), "utf8"));
const { source, ref, target: targetRelative } = config;
const targetPath = join(ROOT, targetRelative);

// 3. Clone into temp dir
const tmpDir = mkdtempSync(join(tmpdir(), "tokens-sync-"));
try {
  const clone = spawnSync("git", ["clone", "--depth", "1", "--branch", ref, source, tmpDir], {
    encoding: "utf8",
  });

  if (clone.status !== 0) {
    const stderr = (clone.stderr || "") + (clone.stdout || "");
    if (/not found|could not find remote branch|reference is not a tree/i.test(stderr)) {
      const ls = spawnSync("git", ["ls-remote", "--tags", source], {
        encoding: "utf8",
      });
      console.error(`Error: ref "${ref}" not found in ${source}.`);
      console.error("Available tags:");
      console.error(ls.stdout || ls.stderr || "(could not list tags)");
      process.exit(1);
    }
    if (/authentication failed|repository not found|access denied|could not read/i.test(stderr)) {
      console.error(`Error: cannot access ${source}.`);
      console.error(
        "Serve accesso a NSP-Design-System-Tokens; questo comando è per il manutentore, non per il clone-and-run.",
      );
      process.exit(1);
    }
    console.error("Error: git clone failed.");
    console.error(stderr);
    process.exit(1);
  }

  function getModes(node) {
    return node?.["$extensions"]?.["com.figma.modes"];
  }

  function mustGet(dotPath, node) {
    if (node == null || node["$value"] == null) {
      console.error(`Error: ${dotPath} missing $value`);
      process.exit(1);
    }
    return node["$value"];
  }

  // ── COLOR TOKENS ────────────────────────────────────────────────────────

  const colorJson = JSON.parse(readFileSync(join(tmpDir, "tokens", "core", "color.json"), "utf8"));

  const grayLight = {};
  const grayDark = {};
  for (let n = 1; n <= 12; n++) {
    const node = colorJson.color?.gray?.[n] ?? colorJson.color?.gray?.[String(n)];
    if (!node) {
      console.error(`Error: color.gray.${n} not found in color.json`);
      process.exit(1);
    }
    const modes = getModes(node);
    if (!modes?.light || !modes?.dark) {
      console.error(`Error: color.gray.${n} missing light/dark in $extensions["com.figma.modes"]`);
      process.exit(1);
    }
    grayLight[n] = modes.light;
    grayDark[n] = modes.dark;
  }

  const blackAlphaA2 = mustGet("color.black-alpha.a2", colorJson.color?.["black-alpha"]?.a2);
  const white = mustGet("color.white", colorJson.color?.white);
  const black = mustGet("color.black", colorJson.color?.black);
  const red9Node = colorJson.color?.red?.["9"];
  const green9Node = colorJson.color?.green?.["9"];
  const orange9Node = colorJson.color?.orange?.["9"];
  const red9 = mustGet("color.red.9", red9Node);
  const green9 = mustGet("color.green.9", green9Node);
  const orange9 = mustGet("color.orange.9", orange9Node);

  for (const [name, node] of [
    ["red.9", red9Node],
    ["green.9", green9Node],
    ["orange.9", orange9Node],
  ]) {
    const modes = getModes(node);
    if (modes && modes.light !== modes.dark) {
      console.error(
        `STOP: color.${name} light (${modes.light}) !== dark (${modes.dark})` +
          ` — status anchors must be mode-invariant.`,
      );
      process.exit(1);
    }
  }

  function buildLight() {
    const lines = [];
    for (let n = 1; n <= 12; n++) lines.push(`${INDENT}--gray-${n}: ${grayLight[n]};`);
    lines.push(`${INDENT}--gray-a2: ${blackAlphaA2};`);
    lines.push(`${INDENT}--white: ${white};`);
    lines.push(`${INDENT}--black: ${black};`);
    lines.push(`${INDENT}--red-9: ${red9};`);
    lines.push(`${INDENT}--green-9: ${green9};`);
    lines.push(`${INDENT}--orange-9: ${orange9};`);
    return lines.join("\n");
  }

  function buildDark() {
    const lines = [];
    for (let n = 1; n <= 12; n++) lines.push(`${INDENT}--gray-${n}: ${grayDark[n]};`);
    return lines.join("\n");
  }

  const lightBlock = buildLight();
  const darkBlock = buildDark();

  // ── SPACING TOKENS ──────────────────────────────────────────────────────

  const layoutJson = JSON.parse(
    readFileSync(join(tmpDir, "tokens", "semantic", "layout.json"), "utf8"),
  );
  const spacingJson = JSON.parse(
    readFileSync(join(tmpDir, "tokens", "core", "spacing.json"), "utf8"),
  );

  let BREAKPOINTS = { tablet: 768, desktop: 1024 };
  try {
    const bpJson = JSON.parse(
      readFileSync(join(tmpDir, "tokens", "core", "breakpoints.json"), "utf8"),
    );
    const thresholds = bpJson.breakpoint?.threshold;
    const tabletNode = thresholds?.tablet;
    const desktopNode = thresholds?.desktop;
    if (tabletNode?.$value && desktopNode?.$value) {
      BREAKPOINTS.tablet = parseInt(tabletNode.$value);
      BREAKPOINTS.desktop = parseInt(desktopNode.$value);
      console.log(
        `Breakpoints: from core/breakpoints.json` +
          ` (tablet: ${BREAKPOINTS.tablet}, desktop: ${BREAKPOINTS.desktop})`,
      );
    } else {
      console.log("Breakpoints: core/breakpoints.json found but unusable; using defaults");
    }
  } catch {
    console.log(
      `Breakpoints: core/breakpoints.json not found; defaults` +
        ` (${BREAKPOINTS.tablet}/${BREAKPOINTS.desktop})`,
    );
  }

  function resolveRef(value, context) {
    const m = value.match(/^\{spacing\.(.+)\}$/);
    if (!m) return value;
    const key = m[1];
    const node = spacingJson.spacing?.[key];
    if (!node?.$value) {
      console.error(`Error: spacing.${key} not found in spacing.json (ref by ${context})`);
      process.exit(1);
    }
    return node.$value;
  }

  const FAMILIES = [
    { accessor: (j) => j["page-margin"], prefix: "page-margin" },
    { accessor: (j) => j["section-gap"], prefix: "section-gap" },
    { accessor: (j) => j["section"]?.["padding"], prefix: "section-padding" },
  ];

  const spacingVars = [];
  for (const { accessor, prefix } of FAMILIES) {
    const group = accessor(layoutJson);
    if (!group) {
      console.error(`Error: ${prefix} not found in layout.json`);
      process.exit(1);
    }
    const sizes = Object.keys(group)
      .filter((k) => !k.startsWith("$"))
      .sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a);
        const ib = SIZE_ORDER.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
    for (const size of sizes) {
      const node = group[size];
      const modes = getModes(node);
      if (!modes?.mobile || !modes?.tablet || !modes?.desktop) {
        console.error(`Error: ${prefix}.${size} missing mobile/tablet/desktop modes`);
        process.exit(1);
      }
      const ctx = `${prefix}.${size}`;
      spacingVars.push({
        name: `${prefix}-${size}`,
        mobile: resolveRef(modes.mobile, ctx),
        tablet: resolveRef(modes.tablet, ctx),
        desktop: resolveRef(modes.desktop, ctx),
      });
    }
  }

  function buildSpacing() {
    const lines = [];
    lines.push(":root {");
    for (const v of spacingVars) lines.push(`${INDENT}--${v.name}: ${v.mobile};`);
    lines.push("}");
    lines.push(`@media (min-width: ${BREAKPOINTS.tablet}px) {`);
    lines.push("  :root {");
    for (const v of spacingVars) lines.push(`    --${v.name}: ${v.tablet};`);
    lines.push("  }");
    lines.push("}");
    lines.push(`@media (min-width: ${BREAKPOINTS.desktop}px) {`);
    lines.push("  :root {");
    for (const v of spacingVars) lines.push(`    --${v.name}: ${v.desktop};`);
    lines.push("  }");
    lines.push("}");
    return lines.join("\n");
  }

  const spacingBlock = buildSpacing();

  // ── TYPE-SIZE TOKENS ────────────────────────────────────────────────────

  const typeSizeJson = JSON.parse(
    readFileSync(join(tmpDir, "tokens", "responsive", "type-size.json"), "utf8"),
  );
  const fontJson = JSON.parse(readFileSync(join(tmpDir, "tokens", "core", "font.json"), "utf8"));

  function resolveFontRef(value, context) {
    const m = value.match(/^\{font\.size\.(.+)\}$/);
    if (!m) return value;
    const key = m[1];
    const node = fontJson.font?.size?.[key];
    if (!node?.$value) {
      console.error(`Error: font.size.${key} not found in font.json (ref by ${context})`);
      process.exit(1);
    }
    return node.$value;
  }

  function pxToRem(pxStr) {
    const num = parseFloat(pxStr);
    return `${num / 16}rem`;
  }

  const TYPE_SIZE_ROLES = [
    "display",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "body-large",
    "body",
    "body-small",
  ];

  const typeSizeVars = [];
  const tsRoot = typeSizeJson["type-size"];
  for (const role of TYPE_SIZE_ROLES) {
    const node = tsRoot[role];
    if (!node) {
      console.error(`Error: type-size.${role} not found in type-size.json`);
      process.exit(1);
    }
    const modes = getModes(node);
    if (!modes?.mobile || !modes?.tablet || !modes?.desktop) {
      console.error(`Error: type-size.${role} missing mobile/tablet/desktop modes`);
      process.exit(1);
    }
    const ctx = `type-size.${role}`;
    typeSizeVars.push({
      name: `fs-${role}`,
      mobile: pxToRem(modes.mobile),
      tablet: pxToRem(modes.tablet),
      desktop: pxToRem(resolveFontRef(modes.desktop, ctx)),
    });
  }

  function buildTypeSize() {
    const lines = [];
    lines.push(":root {");
    for (const v of typeSizeVars) lines.push(`${INDENT}--${v.name}: ${v.mobile};`);
    lines.push("}");
    lines.push(`@media (min-width: ${BREAKPOINTS.tablet}px) {`);
    lines.push("  :root {");
    for (const v of typeSizeVars) lines.push(`    --${v.name}: ${v.tablet};`);
    lines.push("  }");
    lines.push("}");
    lines.push(`@media (min-width: ${BREAKPOINTS.desktop}px) {`);
    lines.push("  :root {");
    for (const v of typeSizeVars) lines.push(`    --${v.name}: ${v.desktop};`);
    lines.push("  }");
    lines.push("}");
    return lines.join("\n");
  }

  const typeSizeBlock = buildTypeSize();

  // ── SPLICE + GUARDS ─────────────────────────────────────────────────────

  function spliceRegion(css, startSentinel, endSentinel, content) {
    const startIdx = css.indexOf(startSentinel);
    const endIdx = css.indexOf(endSentinel);
    if (startIdx === -1 || endIdx === -1) {
      console.error(`Error: sentinel not found in ${targetRelative}.`);
      if (startIdx === -1) console.error(`  Missing START: ${startSentinel}`);
      if (endIdx === -1) console.error(`  Missing END:   ${endSentinel}`);
      process.exit(1);
    }
    const afterStart = css.indexOf("\n", startIdx) + 1;
    const beforeEnd = css.lastIndexOf("\n", endIdx) + 1;
    return css.substring(0, afterStart) + content + "\n" + css.substring(beforeEnd);
  }

  function applySync(css) {
    let result = spliceRegion(css, S_ROOT_START, S_ROOT_END, lightBlock);
    result = spliceRegion(result, S_DARK_START, S_DARK_END, darkBlock);
    result = spliceRegion(result, S_SPACING_START, S_SPACING_END, spacingBlock);
    return spliceRegion(result, S_TYPE_SIZE_START, S_TYPE_SIZE_END, typeSizeBlock);
  }

  const originalCss = readFileSync(targetPath, "utf8");
  const newCss = applySync(originalCss);

  // G2: idempotency — applying sync again must produce identical output
  const newCss2 = applySync(newCss);
  if (newCss !== newCss2) {
    console.error("STOP: G2 — splice is not idempotent; second pass produces a diff.");
    process.exit(1);
  }
  console.log("G2: diff empty (idempotent)");

  // --check: dry-run mode
  if (CHECK) {
    if (newCss === originalCss) {
      console.log("--check: target is up to date");
      process.exit(0);
    } else {
      console.log("--check: target would change");
      process.exit(1);
    }
  }

  // Write
  writeFileSync(targetPath, newCss, "utf8");

  // G1: re-read written file, extract and compare every emitted value

  function extractRegion(css, startSentinel, endSentinel) {
    const startIdx = css.indexOf(startSentinel);
    const endIdx = css.indexOf(endSentinel);
    const afterStart = css.indexOf("\n", startIdx) + 1;
    const beforeEnd = css.lastIndexOf("\n", endIdx) + 1;
    const region = css.substring(afterStart, beforeEnd);
    const vars = {};
    const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(region)) !== null) {
      vars[m[1]] = m[2].trim().toLowerCase();
    }
    return vars;
  }

  function extractSpacingBlocks(css) {
    const startIdx = css.indexOf(S_SPACING_START);
    const endIdx = css.indexOf(S_SPACING_END);
    const afterStart = css.indexOf("\n", startIdx) + 1;
    const beforeEnd = css.lastIndexOf("\n", endIdx) + 1;
    const region = css.substring(afterStart, beforeEnd);
    const blocks = { mobile: {}, tablet: {}, desktop: {} };
    let currentMode = "mobile";
    for (const line of region.split("\n")) {
      const mqMatch = line.match(/@media\s*\(min-width:\s*(\d+)px\)/);
      if (mqMatch) {
        currentMode = parseInt(mqMatch[1]) === BREAKPOINTS.tablet ? "tablet" : "desktop";
        continue;
      }
      const varMatch = line.match(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
      if (varMatch) {
        blocks[currentMode][varMatch[1]] = varMatch[2].trim().toLowerCase();
      }
    }
    return blocks;
  }

  const writtenCss = readFileSync(targetPath, "utf8");

  // G1a: color
  const writtenLight = extractRegion(writtenCss, S_ROOT_START, S_ROOT_END);
  const writtenDark = extractRegion(writtenCss, S_DARK_START, S_DARK_END);

  const colorEntries = [
    ...Array.from({ length: 12 }, (_, i) => [`gray-${i + 1}`, "light", grayLight[i + 1]]),
    ...Array.from({ length: 12 }, (_, i) => [`gray-${i + 1}`, "dark", grayDark[i + 1]]),
    ["gray-a2", "light", blackAlphaA2],
    ["white", "light", white],
    ["black", "light", black],
    ["red-9", "light", red9],
    ["green-9", "light", green9],
    ["orange-9", "light", orange9],
  ];

  let diffs = 0;
  for (const [varName, block, sourceVal] of colorEntries) {
    const pool = block === "dark" ? writtenDark : writtenLight;
    const written = pool[varName];
    if (written == null || written !== sourceVal.toLowerCase()) {
      console.error(
        `DIFF: --${varName} (${block}): source="${sourceVal}"` +
          ` written="${written ?? "NOT FOUND"}"`,
      );
      diffs++;
    }
  }

  // G1b: spacing
  const writtenSpacing = extractSpacingBlocks(writtenCss);
  const spacingEntries = [];
  for (const v of spacingVars) {
    spacingEntries.push([v.name, "mobile", v.mobile]);
    spacingEntries.push([v.name, "tablet", v.tablet]);
    spacingEntries.push([v.name, "desktop", v.desktop]);
  }
  for (const [varName, mode, sourceVal] of spacingEntries) {
    const written = writtenSpacing[mode]?.[varName];
    if (written == null || written !== sourceVal.toLowerCase()) {
      console.error(
        `DIFF: --${varName} (${mode}): source="${sourceVal}"` +
          ` written="${written ?? "NOT FOUND"}"`,
      );
      diffs++;
    }
  }

  // G1c: type-size
  function extractTypeSizeBlocks(css) {
    const startIdx = css.indexOf(S_TYPE_SIZE_START);
    const endIdx = css.indexOf(S_TYPE_SIZE_END);
    const afterStart = css.indexOf("\n", startIdx) + 1;
    const beforeEnd = css.lastIndexOf("\n", endIdx) + 1;
    const region = css.substring(afterStart, beforeEnd);
    const blocks = { mobile: {}, tablet: {}, desktop: {} };
    let currentMode = "mobile";
    for (const line of region.split("\n")) {
      const mqMatch = line.match(/@media\s*\(min-width:\s*(\d+)px\)/);
      if (mqMatch) {
        currentMode = parseInt(mqMatch[1]) === BREAKPOINTS.tablet ? "tablet" : "desktop";
        continue;
      }
      const varMatch = line.match(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
      if (varMatch) {
        blocks[currentMode][varMatch[1]] = varMatch[2].trim().toLowerCase();
      }
    }
    return blocks;
  }

  const writtenTypeSize = extractTypeSizeBlocks(writtenCss);
  const typeSizeEntries = [];
  for (const v of typeSizeVars) {
    typeSizeEntries.push([v.name, "mobile", v.mobile]);
    typeSizeEntries.push([v.name, "tablet", v.tablet]);
    typeSizeEntries.push([v.name, "desktop", v.desktop]);
  }
  for (const [varName, mode, sourceVal] of typeSizeEntries) {
    const written = writtenTypeSize[mode]?.[varName];
    if (written == null || written !== sourceVal.toLowerCase()) {
      console.error(
        `DIFF: --${varName} (${mode}): source="${sourceVal}"` +
          ` written="${written ?? "NOT FOUND"}"`,
      );
      diffs++;
    }
  }

  const total = colorEntries.length + spacingEntries.length + typeSizeEntries.length;
  if (diffs > 0) {
    console.error(`G1: STOP — ${total} comparisons, ${diffs} differences`);
    process.exit(1);
  }
  console.log(`G1: ${total} comparisons, 0 differences`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
