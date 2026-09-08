#!/usr/bin/env node
/**
 * Syncs primitive color tokens from nsp-ds-tokens into starwind.css.
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
const INDENT = "  ";

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
  const clone = spawnSync(
    "git",
    ["clone", "--depth", "1", "--branch", ref, source, tmpDir],
    { encoding: "utf8" },
  );

  if (clone.status !== 0) {
    const stderr = (clone.stderr || "") + (clone.stdout || "");
    if (
      /not found|could not find remote branch|reference is not a tree/i.test(
        stderr,
      )
    ) {
      const ls = spawnSync("git", ["ls-remote", "--tags", source], {
        encoding: "utf8",
      });
      console.error(`Error: ref "${ref}" not found in ${source}.`);
      console.error("Available tags:");
      console.error(ls.stdout || ls.stderr || "(could not list tags)");
      process.exit(1);
    }
    if (
      /authentication failed|repository not found|access denied|could not read/i.test(
        stderr,
      )
    ) {
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

  // 4. Read color.json
  const colorJson = JSON.parse(
    readFileSync(join(tmpDir, "tokens", "core", "color.json"), "utf8"),
  );

  function getModes(node) {
    return node?.["$extensions"]?.["com.figma.modes"];
  }

  function mustGet(dotPath, node) {
    if (node == null || node["$value"] == null) {
      console.error(`Error: ${dotPath} missing $value in color.json`);
      process.exit(1);
    }
    return node["$value"];
  }

  // Gray ramps (1–12): moded
  const grayLight = {};
  const grayDark = {};
  for (let n = 1; n <= 12; n++) {
    const node =
      colorJson.color?.gray?.[n] ?? colorJson.color?.gray?.[String(n)];
    if (!node) {
      console.error(`Error: color.gray.${n} not found in color.json`);
      process.exit(1);
    }
    const modes = getModes(node);
    if (!modes?.light || !modes?.dark) {
      console.error(
        `Error: color.gray.${n} missing light/dark in $extensions["com.figma.modes"]`,
      );
      process.exit(1);
    }
    grayLight[n] = modes.light;
    grayDark[n] = modes.dark;
  }

  // Flat (single-mode) values
  const blackAlphaA2 = mustGet(
    "color.black-alpha.a2",
    colorJson.color?.["black-alpha"]?.a2,
  );
  const white = mustGet("color.white", colorJson.color?.white);
  const black = mustGet("color.black", colorJson.color?.black);
  const red9Node = colorJson.color?.red?.["9"];
  const green9Node = colorJson.color?.green?.["9"];
  const orange9Node = colorJson.color?.orange?.["9"];
  const red9 = mustGet("color.red.9", red9Node);
  const green9 = mustGet("color.green.9", green9Node);
  const orange9 = mustGet("color.orange.9", orange9Node);

  // Assert status-9 mode-invariance
  for (const [name, node] of [
    ["red.9", red9Node],
    ["green.9", green9Node],
    ["orange.9", orange9Node],
  ]) {
    const modes = getModes(node);
    if (modes && modes.light !== modes.dark) {
      console.error(
        `STOP: color.${name} light (${modes.light}) !== dark (${modes.dark}) — status anchors must be mode-invariant.`,
      );
      process.exit(1);
    }
  }

  // 5. Build CSS blocks
  function buildLight() {
    const lines = [];
    for (let n = 1; n <= 12; n++)
      lines.push(`${INDENT}--gray-${n}: ${grayLight[n]};`);
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
    for (let n = 1; n <= 12; n++)
      lines.push(`${INDENT}--gray-${n}: ${grayDark[n]};`);
    return lines.join("\n");
  }

  const lightBlock = buildLight();
  const darkBlock = buildDark();

  // 6. Splice helper: replaces content between start and end sentinel lines
  function spliceRegion(css, startSentinel, endSentinel, content) {
    const startIdx = css.indexOf(startSentinel);
    const endIdx = css.indexOf(endSentinel);
    if (startIdx === -1 || endIdx === -1) {
      console.error(`Error: sentinel not found in ${targetRelative}.`);
      if (startIdx === -1) console.error(`  Missing START: ${startSentinel}`);
      if (endIdx === -1) console.error(`  Missing END:   ${endSentinel}`);
      process.exit(1);
    }
    const afterStart = css.indexOf("\n", startIdx) + 1; // first char after start-sentinel line
    const beforeEnd = css.lastIndexOf("\n", endIdx) + 1; // first char of end-sentinel line
    return (
      css.substring(0, afterStart) + content + "\n" + css.substring(beforeEnd)
    );
  }

  function applySync(css) {
    let result = spliceRegion(css, S_ROOT_START, S_ROOT_END, lightBlock);
    return spliceRegion(result, S_DARK_START, S_DARK_END, darkBlock);
  }

  const originalCss = readFileSync(targetPath, "utf8");
  const newCss = applySync(originalCss);

  // G2: idempotency — applying sync again must produce identical output
  const newCss2 = applySync(newCss);
  if (newCss !== newCss2) {
    console.error(
      "STOP: G2 — splice is not idempotent; second pass produces a diff.",
    );
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

  // G1: re-read written file, re-extract values, compare with source
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

  const writtenCss = readFileSync(targetPath, "utf8");
  const writtenLight = extractRegion(writtenCss, S_ROOT_START, S_ROOT_END);
  const writtenDark = extractRegion(writtenCss, S_DARK_START, S_DARK_END);

  const sourceEntries = [
    ...Array.from({ length: 12 }, (_, i) => [
      `gray-${i + 1}`,
      "light",
      grayLight[i + 1],
    ]),
    ...Array.from({ length: 12 }, (_, i) => [
      `gray-${i + 1}`,
      "dark",
      grayDark[i + 1],
    ]),
    ["gray-a2", "light", blackAlphaA2],
    ["white", "light", white],
    ["black", "light", black],
    ["red-9", "light", red9],
    ["green-9", "light", green9],
    ["orange-9", "light", orange9],
  ];

  let diffs = 0;
  for (const [varName, block, sourceVal] of sourceEntries) {
    const pool = block === "dark" ? writtenDark : writtenLight;
    const written = pool[varName];
    if (written == null || written !== sourceVal.toLowerCase()) {
      console.error(
        `DIFF: --${varName} (${block}): source="${sourceVal}" written="${written ?? "NOT FOUND"}"`,
      );
      diffs++;
    }
  }

  const total = sourceEntries.length;
  if (diffs > 0) {
    console.error(`G1: STOP — ${total} comparisons, ${diffs} differences`);
    process.exit(1);
  }
  console.log(`G1: ${total} comparisons, 0 differences`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
