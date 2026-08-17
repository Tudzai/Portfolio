import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { createCoreSpecs } from "./model-lite-specs/core.mjs";
import { createRiskSpecs } from "./model-lite-specs/risk.mjs";
import { createValuationSpecs } from "./model-lite-specs/valuation.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(repoRoot, "outputs", "model-detail-v140-option-c-20260817");
const publicRoot = path.join(repoRoot, "showcase", "financial-models");
const registryPath = path.join(publicRoot, "model-data.js");
const manifest = JSON.parse(await fs.readFile(path.join(outputRoot, "manifest.json"), "utf8"));
const verification = JSON.parse(
  await fs.readFile(path.join(outputRoot, "post-export-verification.json"), "utf8"),
);
const registryCode = await fs.readFile(registryPath, "utf8");
const sandbox = { window: {} };
vm.runInNewContext(registryCode, sandbox, { filename: registryPath });
const models = sandbox.window.TDAT_MODEL_LIBRARY;
const expectedSheets = ["Start", "Inputs", "Model", "Results", "Checks"];
const notesOnly = process.argv.includes("--notes-only");
const releaseQa = "10 / 10 calculation controls PASS; 5 / 5 sheets rendered";
const metadataApi = { COLORS: {}, FORMATS: {} };
const modelScopeBoundaries = new Map([
  ...createCoreSpecs(metadataApi),
  ...createValuationSpecs(metadataApi),
  ...createRiskSpecs(metadataApi),
].map((spec) => [spec.slug, spec.excluded]));
modelScopeBoundaries.set(
  "dcf-valuation",
  "Detailed tax schedules, leases, pensions, dilution, reverse DCF, and valuation advice.",
);

if (manifest.length !== 24 || verification.length !== 24 || models.length !== 24) {
  throw new Error(
    `Expected 24 manifest entries, 24 verification results, and 24 registered models; received ${manifest.length}, ${verification.length}, and ${models.length}.`,
  );
}

const sizeLabel = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const hashFile = async (filePath) => {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
};

const writeReleaseNotes = async (item, model) => {
  const workbookPath = path.join(publicRoot, ...model.file.path.split("/"));
  const notesPath = path.join(path.dirname(workbookPath), "model-notes.md");
  const description = String(item.description || model.description || "").trim().replace(/[.\s]+$/, "");
  const scopeBoundary = item.excluded
    || modelScopeBoundaries.get(item.slug)
    || "Extend and independently validate the stated scope before using the model for a real decision.";
  const roles = (model.roles || []).join(", ") || "Finance and analytical users";
  const useCases = (item.tags || model.tags || []).join(", ") || "Model-specific planning and analysis";
  const fileName = path.basename(workbookPath);
  const notes = `# ${model.title}

## Option C release

- Model ID: \`${model.id}\`
- Canonical file: \`${fileName}\`
- Version: \`${item.version}\`
- Last tested: \`${item.testedDate}\`
- Compatibility: ${model.compatibility || "Excel 365"}
- Theme: Charcoal and gold
- Visible sheets: \`Start\` → \`Inputs\` → \`Model\` → \`Results\` → \`Checks\`
- QA: \`${releaseQa}\`
- File size: ${sizeLabel(item.sizeBytes)}
- SHA-256: \`${item.sha256}\`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** ${item.decision || model.decision}

${description}.

- Horizon: ${item.horizon || model.horizon}
- Designed for: ${roles}
- Typical use: ${useCases}
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- ${scopeBoundary}

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
`;

  await fs.mkdir(path.dirname(notesPath), { recursive: true });
  await fs.writeFile(notesPath, notes, "utf8");
};

const releaseInputs = [];
for (const item of manifest) {
  const model = models.find((entry) => entry.slug === item.slug);
  const result = verification.find((entry) => entry.slug === item.slug);
  if (!model) throw new Error(`No registry entry for ${item.slug}.`);
  if (
    !result
    || result.ok !== true
    || result.checksStatus !== "PASS"
    || result.outputSha256 !== item.sha256
    || !Array.isArray(result.mismatches)
    || result.mismatches.length !== 0
  ) {
    throw new Error(`${item.slug} does not have a clean post-export verification result.`);
  }

  const outputHash = await hashFile(item.outputPath);
  if (outputHash !== item.sha256) {
    throw new Error(`${item.slug} output hash no longer matches the verified manifest.`);
  }

  const renderManifestPath = path.join(outputRoot, item.slug, "qa-postexport", "render-manifest.json");
  const renders = JSON.parse(await fs.readFile(renderManifestPath, "utf8"));
  const renderedSheets = renders.map((entry) => entry.sheet);
  if (item.sheetCount !== expectedSheets.length || JSON.stringify(renderedSheets) !== JSON.stringify(expectedSheets)) {
    throw new Error(`${item.slug} reopened-sheet contract is ${renderedSheets.join(", ")}; expected ${expectedSheets.join(", ")}.`);
  }
  for (const render of renders) await fs.access(render.path);
  for (const sheetName of expectedSheets) {
    if (!renders.some((entry) => entry.sheet === sheetName)) {
      throw new Error(`${item.slug} is missing the ${sheetName} post-export render.`);
    }
  }

  releaseInputs.push({ item, model, renders });
}

if (notesOnly) {
  for (const { item, model } of releaseInputs) await writeReleaseNotes(item, model);
  console.log(`Regenerated ${releaseInputs.length} Option C model release notes without modifying workbooks.`);
  process.exit(0);
}

let nextRegistryCode = registryCode;
const published = [];

for (const { item, model, renders } of releaseInputs) {
  const workbookPath = path.join(publicRoot, ...model.file.path.split("/"));
  const assetDir = path.join(publicRoot, item.slug, "assets");

  await fs.copyFile(item.outputPath, workbookPath);
  await writeReleaseNotes(item, model);
  await fs.mkdir(assetDir, { recursive: true });
  const previewTargets = new Map([
    ["Start", "cover.png"],
    ["Inputs", "inputs.png"],
    ["Model", "model.png"],
    ["Results", "summary.png"],
    ["Checks", "checks.png"],
  ]);
  for (const [sheetName, targetName] of previewTargets) {
    const render = renders.find((entry) => entry.sheet === sheetName);
    if (!render) throw new Error(`${item.slug} is missing the ${sheetName} post-export render.`);
    await fs.copyFile(render.path, path.join(assetDir, targetName));
  }

  const publishedHash = await hashFile(workbookPath);
  if (publishedHash !== item.sha256) {
    throw new Error(`${item.slug} hash mismatch after publication.`);
  }

  const slugToken = `    slug: "${item.slug}",`;
  const blockStart = nextRegistryCode.indexOf(slugToken);
  if (blockStart < 0) throw new Error(`Cannot locate registry block for ${item.slug}.`);
  const objectStart = nextRegistryCode.lastIndexOf("  {", blockStart);
  const blockEnd = nextRegistryCode.indexOf("\n  },", blockStart) + 5;
  if (objectStart < 0 || blockEnd < 5) throw new Error(`Cannot determine registry block bounds for ${item.slug}.`);
  const block = nextRegistryCode.slice(objectStart, blockEnd);
  const replaceField = (source, pattern, replacement, field) => {
    if (!pattern.test(source)) throw new Error(`${item.slug} is missing registry field ${field}.`);
    return source.replace(pattern, replacement);
  };
  let updated = block;
  updated = replaceField(updated, /decision: "[^"]*"/, `decision: ${JSON.stringify(item.decision)}`, "decision");
  updated = replaceField(updated, /description: "[^"]*"/, `description: ${JSON.stringify(item.description)}`, "description");
  updated = replaceField(updated, /useCases: \[[^\]]*\]/, `useCases: ${JSON.stringify((item.tags || []).slice(0, 3))}`, "useCases");
  updated = replaceField(updated, /level: "[^"]+"/, 'level: "Starter"', "level");
  updated = replaceField(updated, /horizon: "[^"]+"/, `horizon: ${JSON.stringify(item.horizon)}`, "horizon");
  updated = replaceField(updated, /setup: "[^"]+"/, 'setup: "20-40 minutes"', "setup");
  updated = replaceField(updated, /tags: \[[^\]]*\]/, `tags: ${JSON.stringify(item.tags || [])}`, "tags");
  updated = replaceField(updated, /version: "[^"]+"/, `version: "${item.version}"`, "version");
  updated = replaceField(updated, /lastTested: "[^"]+"/, `lastTested: "${item.testedDate}"`, "lastTested");
  updated = replaceField(updated, /qa: "[^"]+"/, `qa: "${releaseQa}"`, "qa");
  updated = replaceField(updated, /size: "[^"]+"/, `size: "${sizeLabel(item.sizeBytes)}"`, "size");
  updated = replaceField(updated, /sha256: "[A-Fa-f0-9]+"/, `sha256: "${item.sha256}"`, "sha256");
  nextRegistryCode = `${nextRegistryCode.slice(0, objectStart)}${updated}${nextRegistryCode.slice(blockEnd)}`;
  published.push({ slug: item.slug, workbookPath, sha256: item.sha256, size: sizeLabel(item.sizeBytes) });
}

await fs.writeFile(registryPath, nextRegistryCode, "utf8");
await fs.writeFile(path.join(outputRoot, "publication-manifest.json"), JSON.stringify(published, null, 2));
console.log(`Published ${published.length} Option C detailed workbooks and five-sheet preview sets.`);
