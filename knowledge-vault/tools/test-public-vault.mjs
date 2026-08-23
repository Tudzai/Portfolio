import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const [html, css, js, encryptedData, schemaValidator, encryptTool, passwordVerifier] = await Promise.all([
  readFile(join(vaultDirectory, "index.html"), "utf8"),
  readFile(join(vaultDirectory, "vault.css"), "utf8"),
  readFile(join(vaultDirectory, "vault.js"), "utf8"),
  readFile(join(vaultDirectory, "vault-data.js"), "utf8"),
  readFile(join(scriptDirectory, "validate-vault.mjs"), "utf8"),
  readFile(join(scriptDirectory, "encrypt-vault.mjs"), "utf8"),
  readFile(join(scriptDirectory, "verify-vault-password.mjs"), "utf8"),
]);

const failures = [];
const requireMatch = (value, pattern, label) => {
  if (!pattern.test(value)) failures.push(label);
};
const forbidMatch = (value, pattern, label) => {
  if (pattern.test(value)) failures.push(label);
};

function hasBalancedCssBlocks(source) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let inComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (inComment) {
      if (character === "*" && next === "/") {
        inComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "*") {
      inComment = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0 && !quote && !inComment;
}

function collectStartTags(source, tagName) {
  const cleaned = source.replace(/<!--[\s\S]*?-->/g, "");
  const lower = cleaned.toLocaleLowerCase("en-US");
  const needle = `<${tagName.toLocaleLowerCase("en-US")}`;
  const tags = [];
  let cursor = 0;
  while ((cursor = lower.indexOf(needle, cursor)) >= 0) {
    const boundary = lower[cursor + needle.length];
    if (boundary && !/[\s/>]/.test(boundary)) {
      cursor += needle.length;
      continue;
    }
    let end = cursor + needle.length;
    let quote = null;
    for (; end < cleaned.length; end += 1) {
      const character = cleaned[end];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === ">") {
        break;
      }
    }
    if (end >= cleaned.length) {
      failures.push(`unterminated ${tagName} tag`);
      break;
    }
    const rawAttributes = cleaned.slice(cursor + needle.length, end);
    const attributes = {};
    const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match;
    while ((match = attributePattern.exec(rawAttributes)) !== null) {
      attributes[match[1].toLocaleLowerCase("en-US")] = match[2] ?? match[3] ?? match[4] ?? "";
    }
    tags.push(attributes);
    cursor = end + 1;
  }
  return tags;
}

const expectedCsp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const cspMetas = collectStartTags(html, "meta").filter(
  (attributes) => attributes["http-equiv"]?.toLocaleLowerCase("en-US") === "content-security-policy",
);
if (cspMetas.length !== 1 || cspMetas[0].content !== expectedCsp) failures.push("exact restrictive CSP");

const scriptTags = collectStartTags(html, "script");
const scriptSources = scriptTags.map((attributes) => attributes.src).filter(Boolean);
if (scriptSources.join("|") !== "vault-data.js?v=20260823-depth-visual1|vault.js?v=20260823-depth-visual1") {
  failures.push("script resource allowlist");
}
if (scriptTags.some((attributes) => !attributes.src)) failures.push("inline script");
const linkTags = collectStartTags(html, "link");
const stylesheetSources = linkTags
  .filter((attributes) => attributes.rel?.toLocaleLowerCase("en-US").split(/\s+/u).includes("stylesheet"))
  .map((attributes) => attributes.href);
if (stylesheetSources.join("|") !== "vault.css?v=20260823-depth-visual1") failures.push("stylesheet resource allowlist");
const iconAllowed = linkTags.some((attributes) => attributes.rel === "icon" && attributes.href === "../assets/favicon.svg");
if (linkTags.length !== 2 || !iconAllowed) failures.push("link resource allowlist");
if (["iframe", "embed", "object"].some((tagName) => collectStartTags(html, tagName).length)) {
  failures.push("embedded resource");
}

forbidMatch(html, /posthog|analytics\.js|https?:\/\//i, "external script or endpoint in vault HTML");
forbidMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/, "network API in vault runtime");
forbidMatch(js, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|Function)\b/, "unsafe rendering sink");
forbidMatch(js, /\bnew\s+Image\b|\.src\s*=|\blocation\s*=/, "background navigation or image exfiltration sink");
forbidMatch(css, /@import|url\(\s*["']?(?:https?:)?\/\//i, "remote CSS dependency");
if (!hasBalancedCssBlocks(css)) failures.push("balanced CSS blocks");
requireMatch(
  css,
  /@media \(min-width: 2200px\)\s*\{\s*:root\s*\{[^{}]*\}\s*\}\s*\/\* Preset character/,
  "wide-screen media boundary",
);

try {
  new Function(js);
} catch {
  failures.push("vault JavaScript syntax");
}
const schemaValidatorSyntax = spawnSync(process.execPath, ["--check", join(scriptDirectory, "validate-vault.mjs")], {
  encoding: "utf8",
});
if (schemaValidatorSyntax.status !== 0) failures.push("release-schema validator syntax");
[
  ["encrypt-vault.mjs", "encryption tool syntax"],
  ["verify-vault-password.mjs", "password verifier syntax"],
].forEach(([file, label]) => {
  const syntax = spawnSync(process.execPath, ["--check", join(scriptDirectory, file)], { encoding: "utf8" });
  if (syntax.status !== 0) failures.push(label);
});

const uniformReleaseManifest = [
  { id: "fintech-domain", modules: 12, lessons: 67, sources: 179 },
  { id: "fin-domain", modules: 15, lessons: 74, sources: 97 },
  { id: "rtcfo-domain", modules: 18, lessons: 89, sources: 68 },
  { id: "brk-domain-breaking", modules: 14, lessons: 68, sources: 41 },
  { id: "mrel-domain", modules: 15, lessons: 60, sources: 56 },
  { id: "personal-style", modules: 6, lessons: 18, sources: 12 },
  { id: "photography", modules: 6, lessons: 18, sources: 12 },
  { id: "cooking", modules: 6, lessons: 18, sources: 12 },
  { id: "bar-drinks", modules: 6, lessons: 18, sources: 12 },
  { id: "coffee", modules: 6, lessons: 18, sources: 12 },
  { id: "japanese-culture", modules: 6, lessons: 18, sources: 12 },
  { id: "art-visual-culture", modules: 6, lessons: 18, sources: 12 },
  { id: "architecture-design-living", modules: 6, lessons: 18, sources: 12 },
  { id: "self-psychology", modules: 6, lessons: 18, sources: 12 },
  { id: "communication-conflict", modules: 6, lessons: 18, sources: 12 },
  { id: "relationships-boundaries", modules: 6, lessons: 18, sources: 12 },
];
function extractLiteralManifest(artifact, constantName) {
  const literal = artifact.match(new RegExp(`const\\s+${constantName}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!literal) return null;
  const entryPattern = /\{\s*id:\s*"([a-z0-9-]+)",\s*modules:\s*(\d+),\s*lessons:\s*(\d+),\s*sources:\s*(\d+)\s*\}/gu;
  const entries = [...literal[1].matchAll(entryPattern)].map((match) => ({
    id: match[1],
    modules: Number(match[2]),
    lessons: Number(match[3]),
    sources: Number(match[4]),
  }));
  const residue = literal[1].replace(entryPattern, "").replace(/[\s,]/gu, "");
  return residue ? null : entries;
}
[
  [schemaValidator, "releaseManifest", "release-schema validator"],
  [js, "RELEASE_MANIFEST", "runtime"],
  [encryptTool, "releaseManifest", "encryption"],
  [passwordVerifier, "releaseManifest", "password verification"],
].forEach(([artifact, constantName, label]) => {
  const manifest = extractLiteralManifest(artifact, constantName);
  if (JSON.stringify(manifest) !== JSON.stringify(uniformReleaseManifest)) {
    failures.push(`exact uniform sixteen-domain manifest: ${label}`);
  }
});

function extractArtworkManifest(artifact) {
  const literal = artifact.match(/const\s+COLLECTION_ARTWORK\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/u);
  if (!literal) return null;
  const entryPattern = /"([a-z0-9-]+)"\s*:\s*"assets\/topics\/([a-z0-9-]+)-v1\.webp"/gu;
  const entries = [...literal[1].matchAll(entryPattern)].map((match) => ({
    id: match[1],
    assetId: match[2],
  }));
  const residue = literal[1].replace(entryPattern, "").replace(/[\s,]/gu, "");
  return residue ? null : entries;
}

const expectedArtworkIds = uniformReleaseManifest.map(({ id }) => id);
const artworkManifest = extractArtworkManifest(js);
if (
  !artworkManifest
  || artworkManifest.some(({ id, assetId }) => id !== assetId)
  || artworkManifest.map(({ id }) => id).join("|") !== expectedArtworkIds.join("|")
) {
  failures.push("exact sixteen-domain artwork manifest");
} else {
  const artworkChecks = await Promise.all(expectedArtworkIds.map(async (id) => {
    try {
      const asset = await readFile(join(vaultDirectory, "assets", "topics", `${id}-v1.webp`));
      const approvedJapaneseArtwork = id !== "japanese-culture"
        || createHash("sha256").update(asset).digest("hex") === "b542410895b2efbbf335ec9a401564d9931f2f5881cc4179735ce05d5c02855b";
      return approvedJapaneseArtwork
        && asset.length >= 100_000
        && asset.subarray(0, 4).toString("ascii") === "RIFF"
        && asset.subarray(8, 12).toString("ascii") === "WEBP";
    } catch {
      return false;
    }
  }));
  if (artworkChecks.some((valid) => !valid)) failures.push("local topic artwork assets");
}
requireMatch(js, /function\s+createCollectionArtwork\s*\(/u, "topic artwork renderer");
requireMatch(js, /image\.setAttribute\("src", source\)/u, "local topic artwork source assignment");
requireMatch(css, /\.reader-hero--illustrated\s*\{/u, "illustrated lesson hero layout");
requireMatch(css, /\.collection-card--illustrated\s*\{/u, "illustrated collection card layout");

const expectedOpenAccessVisuals = [
  ["fintech-domain:3:1", "fintech-payment-system.webp", "e43bb1f1979b114f1859499de98ab946f50399b2b54d12cd7ae40ad75a559eaa"],
  ["fintech-domain:7:1", "fintech-identity.webp", "e9fbd3d5ccd79fe1aa8761e503efa986874e75d9effc45a88879bb1460b84ec5"],
  ["fin-domain:1:1", "finance-household-balance.webp", "bad900df3984c41a9da83154d56a3ce9566d7395428e6511db8ca97332730e56"],
  ["mrel-domain:1:1", "muscle-training.webp", "17fe981859482293fb7ecdfbc955e3dc98d422c9d401e57277a19803619d89fd"],
  ["mrel-domain:2:1", "muscle-equipment.webp", "c243a41c527c6f8b576d01c06e54108e48b8a1b9455514296b5377ec0ddf2ce0"],
  ["personal-style:2:1", "style-suit.webp", "3b960912505b11eb8f3077890a4296c5489ab0159610a93f53a258c548cda692"],
  ["photography:1:1", "photo-light-shadow.webp", "5dbf170fbd9537ca6b59a09a6851dcb391dd8f4294c00ec04ef77dcff5f8db6b"],
  ["photography:1:2", "photo-great-wave.webp", "91dde294d1b9fa5c46d9f959c6ecc4012a1822d01320df9820de2eaa8c085ea6"],
  ["cooking:1:1", "cooking-board.webp", "0761830e2aa16e1e2f198a8dde3b83577a06c5adb376bfacb3f96641f84fdfc2"],
  ["cooking:1:3", "cooking-probe.webp", "01bb6639345d5aee5933de03764427534f059fd250274f4d5ecc3adebf48841c"],
  ["bar-drinks:4:2", "bar-shaker.webp", "9ba8e00bf7eef87acb5b35b8740300d3e50bd5ca947b50f16a98be8618887d74"],
  ["coffee:1:1", "coffee-cherry.webp", "c9863ce67c191d23e2a7a5489ff91e889198de59166b05f5ae9c9a09fac4404e"],
  ["coffee:4:1", "coffee-drip.webp", "752e0604e7619b25eaeb8319cddd462a896eae7ee15f38e5bb31ecd28f1d49a1"],
  ["japanese-culture:3:3", "japan-teabowl.webp", "62a9b62f6aefd4a0188865b86c8149621b9dbeb6e4d53cfa67e686c13c802903"],
  ["japanese-culture:4:1", "japan-great-wave.webp", "4884d2483763fbb2b850e1169a4d5eda09dd47aae89b0094bf2ae4f39434d6e1"],
  ["art-visual-culture:3:2", "art-champa.webp", "a15e8eda3dfcfe23bffe991878e20477dd83bb839b91676b8fd6db2b63cae8e3"],
  ["architecture-design-living:3:1", "architecture-farnsworth.webp", "36c067b7fba554de34295450fbbf6076f3608231a65a2126d3a3c49b69182f39"],
  ["architecture-design-living:4:1", "architecture-thonet.webp", "4d09968fd03105f8aa361e6a596769fe454414bf65aaecad6352d5caf1c3a122"],
];
const openVisualLiteral = js.match(/const\s+OPEN_ACCESS_VISUALS\s*=\s*Object\.freeze\(\{([\s\S]*?)\n\s*\}\);\n\s*const\s+COLLECTION_GROUPS/u);
if (!openVisualLiteral) {
  failures.push("open-access lesson visual manifest");
} else {
  const openVisualKeys = [...openVisualLiteral[1].matchAll(/^\s*"([a-z0-9-]+:\d+:\d+)"\s*:\s*Object\.freeze\(\{/gmu)].map((match) => match[1]);
  const openVisualFiles = [...openVisualLiteral[1].matchAll(/src:\s*"assets\/explainers\/([a-z0-9-]+\.webp)"/gu)].map((match) => match[1]);
  const expectedKeys = expectedOpenAccessVisuals.map(([key]) => key);
  const expectedFiles = expectedOpenAccessVisuals.map(([, file]) => file);
  if (
    openVisualKeys.join("|") !== expectedKeys.join("|")
    || openVisualFiles.join("|") !== expectedFiles.join("|")
    || [...openVisualLiteral[1].matchAll(/rights:\s*"[^"]+"/gu)].length !== expectedOpenAccessVisuals.length
    || [...openVisualLiteral[1].matchAll(/source:\s*"https:\/\/[^"]+"/gu)].length !== expectedOpenAccessVisuals.length
  ) failures.push("exact licensed lesson visual manifest");

  const openVisualChecks = await Promise.all(expectedOpenAccessVisuals.map(async ([, file, hash]) => {
    try {
      const asset = await readFile(join(vaultDirectory, "assets", "explainers", file));
      return asset.length >= 20_000
        && asset.subarray(0, 4).toString("ascii") === "RIFF"
        && asset.subarray(8, 12).toString("ascii") === "WEBP"
        && createHash("sha256").update(asset).digest("hex") === hash;
    } catch {
      return false;
    }
  }));
  if (openVisualChecks.some((valid) => !valid)) failures.push("hash-pinned local open-access lesson assets");
}
requireMatch(js, /function\s+openAccessVisualForEntry\s*\(/u, "lesson-specific open visual lookup");
requireMatch(js, /function\s+createOpenAccessVisual\s*\(/u, "open-access lesson visual renderer");
requireMatch(js, /image\.setAttribute\("src",\s*visual\.src\)[\s\S]*?source\.href\s*=\s*visual\.source/u, "local image with user-initiated source link");
requireMatch(js, /lessonVisual\.sectionId\s*===\s*sectionData\.id[\s\S]*?createOpenAccessVisual\(lessonVisual\)/u, "small-idea visual placement inside its lesson section");
requireMatch(css, /\.lesson-evidence-visual\s*\{/u, "open-access visual card layout");
requireMatch(css, /\.lesson-evidence-visual img[\s\S]*?object-fit:\s*contain/u, "uncropped instructional image layout");
requireMatch(js, /function\s+createLessonConceptMap\s*\(/u, "per-lesson concept-map renderer");
requireMatch(js, /\{ index: 0, marker: "01", label: "Mục tiêu"[\s\S]*?\{ index: 3, marker: "02", label: "Cơ chế"[\s\S]*?\{ index: 7, marker: "03", label: "Ranh giới"/u, "goal mechanism boundary visual model");
requireMatch(js, /function\s+visualTextFromSection[\s\S]*?state\.readingMode\s*!==\s*"essentials"\s*\|\|\s*block\.learningLayer\s*!==\s*"detail"/u, "concept maps respect the active reading depth");
requireMatch(js, /track\s*=\s*document\.createElement\("ol"\)[\s\S]*?card\s*=\s*document\.createElement\("li"\)/u, "concept map exposes an ordered semantic relationship");
requireMatch(js, /appendRichText\(copy,\s*concept\.visual\.text,\s*entry\.lesson,\s*mapHintState,\s*concept\.visual\.block\)/u, "concept-map terms retain glossary hints");
requireMatch(js, /wrap\.dataset\.visualKind\s*=\s*"table"/u, "tables identify as visual explainers");
requireMatch(js, /caption\.className\s*=\s*"visually-hidden"[\s\S]*?table\.append\(caption,\s*head,\s*body\)/u, "lesson tables include an accessible caption");
requireMatch(js, /document\.createElement\(index\s*===\s*0\s*\?\s*"th"\s*:\s*"td"\)[\s\S]*?cell\.scope\s*=\s*"row"/u, "lesson tables expose row headers");
requireMatch(js, /flow\.dataset\.visualKind\s*=\s*"process"/u, "process blocks identify as visual explainers");
requireMatch(css, /\.lesson-concept-map\s*\{/u, "lesson concept-map layout");
[
  "function isIsoDate",
  "canonical lesson section order",
  "lesson review metadata",
  "module release framing",
  "lesson source diversity",
  "inline citation coverage",
  "domain source use",
].forEach((token) => requireMatch(
  schemaValidator,
  new RegExp(token),
  `uniform release-schema contract: ${token}`,
));
forbidMatch(
  schemaValidator,
  /\bcanonicalSections\b/,
  "domain-conditional release-schema quality gate",
);
forbidMatch(js, /\b(?:LEGACY_RELEASE_MANIFEST|canonicalSections)\b/, "legacy or domain-conditional runtime gate");
forbidMatch(encryptTool, /\bcanonicalSections\b/, "domain-conditional encryption gate");
forbidMatch(passwordVerifier, /\bcanonicalSections\b/, "domain-conditional password-verification gate");
requireMatch(
  passwordVerifier,
  /function\s+matchesPreviousTenDomainRelease\s*\(/,
  "migration-only previous ten-domain password compatibility",
);
requireMatch(
  passwordVerifier,
  /function\s+matchesPreviousEightDomainRelease\s*\(/,
  "migration-only previous eight-domain password compatibility",
);
requireMatch(
  passwordVerifier,
  /function\s+matchesLegacyRelease\s*\(/,
  "migration-only legacy five-domain password compatibility",
);
requireMatch(
  passwordVerifier,
  /const\s+previousTenDomainReleaseManifest\s*=\s*releaseManifest\.slice\(0, 10\)/,
  "exact previous ten-domain password manifest",
);
requireMatch(
  passwordVerifier,
  /const\s+previousEightDomainReleaseManifest\s*=\s*releaseManifest\.slice\(0, 8\)/,
  "exact previous eight-domain password manifest",
);
requireMatch(
  passwordVerifier,
  /const\s+legacyReleaseManifest\s*=\s*releaseManifest\.slice\(0, 5\)/,
  "exact legacy five-domain password manifest",
);
requireMatch(
  passwordVerifier,
  /const\s+requireCurrentRelease\s*=\s*commandArguments\.includes\("--require-current"\)/,
  "strict current-release password-verification mode",
);
requireMatch(
  passwordVerifier,
  /if\s*\(requireCurrentRelease\)\s*return\s+matchesCurrentRelease\(value\)/,
  "strict mode bypasses historical migration shapes",
);
requireMatch(
  encryptTool,
  /temporaryOutputPath,\s*"--require-current"/,
  "serialized ciphertext current-release verification",
);
forbidMatch(schemaValidator, /matchesPrevious(?:Eight|Ten)DomainRelease|previous(?:Eight|Ten)DomainReleaseManifest|legacyReleaseManifest/, "historical compatibility leaking into plaintext validation");
forbidMatch(js, /matchesPrevious(?:Eight|Ten)DomainRelease/, "historical compatibility leaking into runtime");
forbidMatch(encryptTool, /matchesPrevious(?:Eight|Ten)DomainRelease/, "historical compatibility leaking into source validation");

const collectionToneManifest = [
  ["personal-notes", "violet"],
  ["fintech-domain", "cyan"],
  ["fin-domain", "gold"],
  ["rtcfo-domain", "rose"],
  ["brk-domain-breaking", "mint"],
  ["mrel-domain", "indigo"],
  ["personal-style", "coral"],
  ["photography", "azure"],
  ["cooking", "amber"],
  ["bar-drinks", "crimson"],
  ["coffee", "mocha"],
  ["japanese-culture", "crimson"],
  ["art-visual-culture", "gold"],
  ["architecture-design-living", "mint"],
  ["self-psychology", "indigo"],
  ["communication-conflict", "cyan"],
  ["relationships-boundaries", "rose"],
];
collectionToneManifest.forEach(([id, tone]) => {
  requireMatch(js, new RegExp(`"${id}"\\s*:\\s*"${tone}"`), `collection tone mapping: ${id}`);
  requireMatch(css, new RegExp(`\\.collection-card\\[data-domain-tone="${tone}"\\]`), `collection card tone: ${tone}`);
  requireMatch(
    css,
    new RegExp(`html\\[data-theme="light"\\] \\.collection-card\\[data-domain-tone="${tone}"\\]`),
    `light collection card tone: ${tone}`,
  );
});
requireMatch(
  js,
  /card\.dataset\.domainTone\s*=\s*collectionTone\(collection\.id\)/,
  "deterministic home-card tone assignment",
);
forbidMatch(css, /\.collection-card:nth-child\(9n/, "order-dependent home-card tone mapping");
const collectionGroups = [
  ["personal-space", ["personal-notes"]],
  ["money-leadership", ["fintech-domain", "fin-domain", "rtcfo-domain"]],
  ["movement-recovery", ["brk-domain-breaking", "mrel-domain"]],
  ["everyday-craft", ["personal-style", "photography", "cooking"]],
  ["taste-ritual", ["bar-drinks", "coffee"]],
  ["culture-aesthetics", ["japanese-culture", "art-visual-culture", "architecture-design-living"]],
  ["self-relationships", ["self-psychology", "communication-conflict", "relationships-boundaries"]],
];
collectionGroups.forEach(([groupId, collectionIds]) => {
  requireMatch(js, new RegExp(`id:\\s*"${groupId}"`), `collection group: ${groupId}`);
  collectionIds.forEach((collectionId) => {
    requireMatch(js, new RegExp(`"${collectionId}"`), `grouped collection: ${collectionId}`);
  });
});
requireMatch(js, /validateCollectionGroupManifest\(data\.collections\)/, "runtime collection-group coverage gate");
requireMatch(js, /GROUPED_COLLECTION_ORDER\.join\("\|"\)\s*!==\s*EXPECTED_COLLECTION_ORDER\.join\("\|"\)/, "exact collection-group order gate");
forbidMatch(html, /data-sidebar-filter|data-sidebar-groups-toggle/, "duplicated sidebar search or expand-all control");
requireMatch(js, /function\s+loadNavigationGroups\s*\(/, "persistent sidebar group preference");
requireMatch(js, /state\.openNavGroups\s*=\s*new Set\(\[group\.id\]\)/, "single-open sidebar group behavior");
requireMatch(js, /state\.homeGroupId\s*===\s*group\.id/, "single-open home group behavior");
requireMatch(js, /dataset\.homeGroupToggle\s*=\s*group\.id/, "home topic disclosure control");
[
  [schemaValidator, "release-schema validator"],
  [js, "runtime"],
  [encryptTool, "encryption"],
  [passwordVerifier, "password verification"],
].forEach(([artifact, label]) => {
  if (!artifact.includes("&& !/\\[\\[|\\]\\]/u.test(block.label)")) {
    failures.push(label + " literal callout-label citation guard");
  }
});
[
  [js, "runtime"],
  [encryptTool, "encryption"],
  [passwordVerifier, "password verification"],
].forEach(([artifact, label]) => {
  requireMatch(artifact, /Date\.UTC\([^)]+\)/, `${label} actual ISO-date validation`);
  requireMatch(artifact, /usedSources\.size\s*!==\s*sourceMap\.size/, `${label} all-source-use gate`);
  requireMatch(
    artifact,
    /\.trim\(\)\.replace\(\/\\s\+\/gu, " "\)\.toLocaleLowerCase\("en-US"\)/,
    `${label} normalized source organizations`,
  );
  requireMatch(artifact, /new Set\(references\)\.size\s*!==\s*references\.length|uniqueReferences\.size\s*!==\s*lesson\.references\.length/, `${label} unique source references`);
});
[
  [schemaValidator, "release-schema validator"],
  [js, "runtime"],
  [encryptTool, "encryption"],
  [passwordVerifier, "password verification"],
].forEach(([artifact, label]) => {
  requireMatch(artifact, /function\s+visibleBlockStrings\s*\(/, `${label} rendered-field citation extraction`);
  requireMatch(artifact, /section\.blocks\.flatMap\(visibleBlockStrings\)/, `${label} rendered-block citation coverage`);
  forbidMatch(artifact, /JSON\.stringify\([^\n]*sections[^\n]*\)\.matchAll/, `${label} hidden-field citation coverage`);
});

const envelopeMatch = encryptedData.trim().match(/^window\.__KNOWLEDGE_VAULT_DATA__\s*=\s*(\{[\s\S]*\});$/);
let envelope = null;
try {
  envelope = envelopeMatch ? JSON.parse(envelopeMatch[1]) : null;
} catch {
  envelope = null;
}
const exactKeys = (value, keys) => value
  && typeof value === "object"
  && !Array.isArray(value)
  && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
const canonicalBase64 = (value, expectedBytes = null) => {
  if (typeof value !== "string" || !value.length || value.length % 4 !== 0) return false;
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const contentLength = value.length - padding;
  for (let index = 0; index < contentLength; index += 1) {
    const code = value.charCodeAt(index);
    const allowed = (code >= 48 && code <= 57)
      || (code >= 65 && code <= 90)
      || (code >= 97 && code <= 122)
      || code === 43
      || code === 47;
    if (!allowed) return false;
  }
  if (value.slice(0, contentLength).includes("=") || /[^=]/.test(value.slice(contentLength))) return false;
  const decoded = Buffer.from(value, "base64");
  return decoded.toString("base64") === value && (expectedBytes === null || decoded.length === expectedBytes);
};
const envelopeValid = exactKeys(envelope, ["version", "kdf", "cipher", "ciphertext"])
  && envelope.version === 1
  && exactKeys(envelope.kdf, ["name", "hash", "iterations", "salt"])
  && envelope.kdf.name === "PBKDF2"
  && envelope.kdf.hash === "SHA-256"
  && envelope.kdf.iterations === 600_000
  && canonicalBase64(envelope.kdf.salt, 16)
  && exactKeys(envelope.cipher, ["name", "keyLength", "tagLength", "iv"])
  && envelope.cipher.name === "AES-GCM"
  && envelope.cipher.keyLength === 256
  && envelope.cipher.tagLength === 128
  && canonicalBase64(envelope.cipher.iv, 12)
  && canonicalBase64(envelope.ciphertext)
  && Buffer.from(envelope.ciphertext, "base64").length > 16;
if (!envelopeValid) {
  failures.push("ciphertext-only encrypted envelope shape");
} else {
  const ciphertextBytes = Buffer.from(envelope.ciphertext, "base64");
  const frequencies = new Uint32Array(256);
  ciphertextBytes.forEach((byte) => { frequencies[byte] += 1; });
  const entropy = frequencies.reduce((total, count) => {
    if (!count) return total;
    const probability = count / ciphertextBytes.length;
    return total - probability * Math.log2(probability);
  }, 0);
  const prefix = ciphertextBytes.subarray(0, 64).toString("utf8").trimStart();
  if (entropy < 7.95 || prefix.startsWith("{") || prefix.startsWith("[")) {
    failures.push("ciphertext plausibility");
  }
}

const repositoryRoot = resolve(vaultDirectory, "..");
const allowedVaultFiles = new Set([
  "knowledge-vault/AGENTS.md",
  "knowledge-vault/README.md",
  "knowledge-vault/index.html",
  "knowledge-vault/knowledge.example.json",
  "knowledge-vault/private/.gitignore",
  "knowledge-vault/tools/encrypt-vault.mjs",
  "knowledge-vault/tools/encrypt-vault.ps1",
  "knowledge-vault/tools/test-public-vault.mjs",
  "knowledge-vault/tools/validate-vault.mjs",
  "knowledge-vault/tools/verify-vault-password.mjs",
  "knowledge-vault/vault-data.js",
  "knowledge-vault/vault.css",
  "knowledge-vault/vault.js",
]);
expectedArtworkIds.forEach((id) => {
  allowedVaultFiles.add(`knowledge-vault/assets/topics/${id}-v1.webp`);
});
expectedOpenAccessVisuals.forEach(([, file]) => {
  allowedVaultFiles.add(`knowledge-vault/assets/explainers/${file}`);
});
const visibleVaultFiles = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", "knowledge-vault"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
const visibleVaultPaths = visibleVaultFiles.status === 0
  ? visibleVaultFiles.stdout.split(/\r?\n/u).filter(Boolean)
  : [];
if (
  visibleVaultFiles.status !== 0
  || visibleVaultPaths.some((file) => !allowedVaultFiles.has(file.replaceAll("\\", "/")))
) failures.push("Git vault-file allowlist");
const trackedPrivate = spawnSync(
  "git",
  ["ls-files", "--cached", "--", "knowledge-vault/private"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
const trackedPrivateFiles = trackedPrivate.status === 0
  ? trackedPrivate.stdout.split(/\r?\n/u).filter(Boolean)
  : [];
if (
  trackedPrivate.status !== 0
  || trackedPrivateFiles.some((file) => file !== "knowledge-vault/private/.gitignore")
) failures.push("Git private-file publish boundary");
const trackedAuthoringWorkspace = spawnSync(
  "git",
  ["ls-files", "--cached", "--", "tmp"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
if (trackedAuthoringWorkspace.status !== 0 || trackedAuthoringWorkspace.stdout.trim()) {
  failures.push("Git plaintext authoring-workspace boundary");
}
const ignoredPlaintext = spawnSync(
  "git",
  ["check-ignore", "--quiet", "--no-index", "knowledge-vault/private/knowledge.json"],
  { cwd: repositoryRoot },
);
if (ignoredPlaintext.status !== 0) failures.push("plaintext ignore rule");

[
  "data-theme-dialog",
  "data-theme-options",
  "data-theme-match-time",
  "data-theme-shuffle",
  "role=\"radiogroup\"",
  "data-focus-timer-chip",
  "data-focus-timer-countdown",
  "data-focus-timer-stop",
  "data-focus-timer-live",
  "data-shortcuts-dialog",
  "role=\"combobox\"",
  "role=\"listbox\"",
].forEach((token) => requireMatch(html, new RegExp(token), `missing interface contract: ${token}`));

forbidMatch(
  html,
  /data-tools-toggle|data-resume-button|data-random-button|data-daily-button|data-bookmarks-button|data-reading-mode-button|data-text-size-button|data-theme-tool-button|data-focus-button|data-focus-meta|data-focus-timer-button/,
  "duplicated utility controls outside Jump",
);
forbidMatch(html, /unlock-intro__lede|unlock-card__copy|data-curriculum-meta/, "redundant interface subtitles");
requireMatch(html, /placeholder="Jump anywhere…"/, "unified Jump entry point");
requireMatch(html, /aria-label="Jump results"/, "Jump palette accessibility");
forbidMatch(js, /createQuickGuide|section-phase/, "duplicated lesson guide or phase subtitle");
forbidMatch(js, /const\s+recent\s*=\s*createRecentSection\(\)/, "duplicated recent-reading home section");
requireMatch(js, /event\.isComposing/, "IME-safe Jump keyboard handling");
if ((js.match(/if \(event\.isComposing\) return;/g) || []).length < 2) failures.push("IME-safe global keyboard handling");
forbidMatch(js, /!toolsPanel\?\.hidden/, "null Compass-panel runtime guard");
requireMatch(js, /toolsPanel\s*&&\s*!toolsPanel\.hidden/, "removed Compass-panel event safety");
requireMatch(js, /openThemeDialog\(searchInput\)/, "mobile Theme Studio focus return");
requireMatch(js, /openShortcuts\(searchInput\)/, "Jump shortcut-dialog focus return");
requireMatch(js, /function\s+closeSearch[\s\S]*?state\.searchMatches\s*=\s*\[\]/, "Jump stale-result cleanup");
requireMatch(js, /state\.openModules\s*=\s*state\.openModules\.has\(id\)\s*\?\s*new Set\(\)\s*:\s*new Set\(\[id\]\)/, "single-open sidebar module behavior");
requireMatch(js, /!state\.completed\.has\(target\.lesson\.id\)/, "completed lesson excluded from resume card");
requireMatch(js, /currentNavigation\.replaceWith\(renderLessonNavigation\(entry\)\)/, "completion refreshes continuation action");
requireMatch(js, /if \(state\.focusMode\) setFocusMode\(false\);[\s\S]*?searchInput\?\.focus\(\)/, "Jump exits focus mode before opening");

[
  "validateLibraryCompleteness",
  "renderBookmarksHome",
  "selectRandomLesson",
  "openDailySpark",
  "toggleFocusTimer",
  "announceFocusTimer",
  "displaySectionTitle",
  "shuffleTheme",
  "themeForLocalHour",
  "matchThemeToLocalTime",
  "renderThemeOptions",
  "createCollectionNavigation",
  "createCollectionCard",
  "createLessonOutline",
  "createHomeDisclosure",
  "jumpActionItems",
  "jumpResultScore",
  "buildJumpResults",
  "dispatchJumpResult",
  "nextUnreadLesson",
  "completeAndContinue",
  "readableChunks",
  "handleSearchKeydown",
  "setFocusMode",
  "setReadingMode",
  "syncReadingTimes",
  "lessonHasLearningLayer",
  "createFirstUseHintState",
  "findTermMatch",
  "ensureTermHintTooltip",
  "showTermHintTooltip",
  "hideTermHintTooltip",
  "cycleTextSize",
  "openThemeDialog",
  "closeThemeDialog",
  "handleThemeOptionKeydown",
].forEach((token) => requireMatch(js, new RegExp(`function ${token}\\b`), `missing behavior contract: ${token}`));

[
  "midnight",
  "pearl",
  "nebula",
  "aurora",
  "ember",
  "tide",
  "sakura",
  "solstice",
  "washi",
  "grove",
  "noir",
  "atelier",
].forEach((theme) => {
  requireMatch(js, new RegExp(`^\\s*${theme}:\\s*\\{`, "m"), `theme preset config: ${theme}`);
  requireMatch(css, new RegExp(`data-theme-preset="${theme}"`), `theme preset variables: ${theme}`);
  requireMatch(css, new RegExp(`data-theme-option="${theme}"`), `theme preset swatch: ${theme}`);
});
requireMatch(css, /\.reader-wrap\s*\{[\s\S]*?--accent:\s*var\(--domain-accent\)/, "reader-scoped domain accent");
forbidMatch(css, /html\[data-domain-tone="[^"]+"\]\s*\{[^}]*--accent:/, "domain tone overriding global theme accent");
forbidMatch(html, /theme-dialog__intro|theme-description|theme-done/, "redundant visible theme subtitles or done action");
requireMatch(js, /renderThemeOptions\(\);\s*\n\s*themeToggle/, "config-driven theme option initialization");
requireMatch(js, /const\s+ESSENTIAL_SECTION_INDEXES\s*=\s*new Set\(\[0, 1, 2, 3, 5, 7, 9, 10\]\)/, "beginner essential-view safety sections");
requireMatch(js, /behavior:\s*preferredScrollBehavior\(\)/, "reduced-motion-aware section navigation");
forbidMatch(js, /behavior:\s*"smooth"/, "unconditional smooth scrolling");
requireMatch(js, /stopFocusTimer\(\);/, "lock clears focus timer");
requireMatch(js, /stopFocusTimer\(\);\s*\n\s*hideTermHintTooltip\(\);/, "lock clears private term tooltip");
requireMatch(js, /function\s+progressionStage[\s\S]*?return\s+"Beginner"[\s\S]*?return\s+"Intermediate"[\s\S]*?return\s+"Advanced"/, "consistent beginner intermediate advanced module stages");
requireMatch(js, /progressionStage\(moduleIndex,\s*collection\.modules\.length\)\.toUpperCase\(\)[\s\S]*?MODULE/, "module cards expose the learning stage without extra subtitles");
requireMatch(js, /function\s+setReadingMode[\s\S]*?syncReadingTimes\(\);[\s\S]*?updateReadingProgress\(\);[\s\S]*?\n\s*}/, "reading mode updates duration, focus, and progress");
requireMatch(js, /function\s+essentialEstimatedMinutes[\s\S]*?ESSENTIAL_SECTION_INDEXES\.has\(index\)/, "essential view computes a visible-section duration fallback");
requireMatch(js, /function\s+glossaryPairsFromLesson[\s\S]*?section\.id\s*===\s*"thuat-ngu"[\s\S]*?flatMap\(glossaryPairsFromBlock\)/, "term hints derive from the authored glossary section");
requireMatch(js, /glossaryPairsFromLesson\(lesson\)\.forEach[\s\S]*?explicitHints\.forEach[\s\S]*?merged\.set\(key,\s*\{\s*\.\.\.normalized,\s*key,\s*source:\s*"authored"\s*\}\)/, "authored term hints override glossary-derived definitions");
requireMatch(js, /function\s+glossaryVisibleText[\s\S]*?replace\(\/\\\[\\\[\[a-z0-9-\]\+\\\]\\\]\/gi,\s*" "\)/, "glossary tooltip copy omits citation tokens");
requireMatch(js, /index\s*<\s*glossaryIndex\s*&&\s*sectionVisibleInMode\s*\?\s*firstUseHintState\s*:\s*null/, "term hints stay before the discovered glossary section");
requireMatch(js, /state\.readingMode\s*===\s*"essentials"\s*&&\s*block\?\.learningLayer\s*===\s*"detail"/, "essential view excludes hidden detail occurrences");
requireMatch(js, /function\s+setReadingMode[\s\S]*?lessonReader\.replaceChildren\(renderPublishedLesson\(entry\)\)/, "reading-mode changes recompute the first visible term occurrence");
requireMatch(js, /document\.body\.append\(termHintTooltip\)/, "term tooltip uses a body portal outside scrolling tables");
requireMatch(js, /document\.addEventListener\("scroll", scheduleTermHintTooltipPosition, \{ capture: true, passive: true \}\)/, "term tooltip repositions on nested and table scrolling");
requireMatch(js, /termHintPointerWillClose[\s\S]*?event\.pointerType\s*===\s*"touch"[\s\S]*?if\s*\(shouldClose\)\s*hideTermHintTooltip\(\)/, "touch activation toggles the term tooltip");
requireMatch(js, /const\s+unchanged\s*=\s*activeTermHint\s*===\s*target[\s\S]*?if\s*\(unchanged\)/, "repeated focus and click do not re-announce the same definition");
requireMatch(js, /accessibleDescription\.hidden\s*=\s*true[\s\S]*?definition\.setAttribute\("aria-describedby",\s*accessibleDescription\.id\)/, "each focusable term has one stable hidden accessible description");
requireMatch(js, /termHintTooltip\.setAttribute\("aria-hidden",\s*"true"\)/, "visual tooltip portal stays out of the accessibility tree");
forbidMatch(js, /target\.setAttribute\("aria-describedby",\s*tooltip\.id\)/, "dynamic duplicate tooltip description");
requireMatch(js, /renderBlock\(block, entry\.lesson, sectionHintState\)/, "lesson renderer uses beginner term hints");
requireMatch(js, /block\.learningLayer\s*===\s*"detail"/, "lesson renderer honors detail layer");
requireMatch(js, /readingModeLabel\.textContent\s*=\s*"Reading depth"/, "stable reading-depth toggle label");
requireMatch(js, /readingMode\.setAttribute\("aria-label",\s*"Deep reading view"\)/, "explicit deep-reading control name");
requireMatch(js, /const\s+STORAGE_READING_MODE\s*=\s*"knowledge-library:reading-mode:v2"/, "deep-reading preference migration");
requireMatch(js, /setReadingMode\(readStorage\(STORAGE_READING_MODE,\s*"full"\),\s*false\)/, "deep-reading default");
requireMatch(js, /focusLabel\.textContent\s*=\s*"Focus mode"/, "stable focus-mode toggle label");
requireMatch(js, /focusTimerLabel\.textContent\s*=\s*"Focus timer"/, "stable focus-timer toggle label");
requireMatch(js, /"ben-lien-quan":\s*"Ai hoặc yếu tố nào liên quan"/, "lifestyle stakeholder section alias");
requireMatch(js, /"tac-dong":\s*"Chi phí, tác động và lựa chọn thực tế"/, "lifestyle impact section alias");
requireMatch(js, /"khac-biet":\s*"Khác biệt theo bối cảnh"/, "lifestyle context section alias");

[
  ".path-panel",
  ".lesson-outline",
  ".collection-nav-group",
  ".topic-group",
  ".topic-group__toggle",
  ".home-disclosure",
  ".unlock-constellation",
  ".focus-timer-chip",
  ".first-use-hint",
  ".first-use-tooltip",
  ".learning-layer-detail",
  "body.essentials-mode",
  "body.focus-mode",
  "prefers-reduced-motion",
  "data-domain-tone",
  ".theme-dialog",
  ".theme-grid",
  "data-theme-preset=\"nebula\"",
  "data-theme-preset=\"aurora\"",
  "data-theme-preset=\"ember\"",
  "data-theme-preset=\"tide\"",
  "data-theme-preset=\"sakura\"",
  "data-theme-preset=\"solstice\"",
  "data-theme-preset=\"washi\"",
  "data-theme-preset=\"grove\"",
  "data-theme-preset=\"noir\"",
  "data-theme-preset=\"atelier\"",
].forEach((token) => requireMatch(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing style contract: ${token}`));

requireMatch(css, /@media\s*\(max-width:\s*720px\)\s*and\s*\(max-height:\s*760px\)/, "short-height mobile unlock layout");
requireMatch(html, /<main\s+id="main-content"\s+tabindex="-1">/, "focusable locked skip-link destination");
requireMatch(html, /<article\s+id="vault-content"[^>]*tabindex="-1"/, "focusable unlocked skip-link destination");
requireMatch(js, /skipLink\?\.setAttribute\("href", "#vault-content"\)/, "unlocked skip-link destination");
requireMatch(js, /skipLink\?\.addEventListener\("click"[\s\S]*?target\.focus\(\{ preventScroll: true \}\)/, "skip-link focus transfer");
requireMatch(js, /layout\.append\(createLessonOutline\(entry\), body\)/, "responsive outline DOM order");
requireMatch(js, /matchMedia\?\.\("\(max-width: 1080px\)"\)/, "compact sidebar runtime breakpoint");
requireMatch(css, /@media\s*\(max-width:\s*1080px\)/, "compact sidebar CSS breakpoint");
requireMatch(js, /responsiveMaximum\s*=\s*viewportWidth\s*<=\s*1320\s*\?\s*364\s*:\s*SIDEBAR_MAX_WIDTH/, "medium-width sidebar cap");
forbidMatch(html, /<kbd>[GRDFE]<\/kbd>/, "unmodified single-key shortcut");
requireMatch(css, /body\.essentials-mode\s+\.learning-layer-detail\s*\{[\s\S]*?display:\s*none\s*!important/, "essential view hides detail-only blocks");

[js, schemaValidator, encryptTool, passwordVerifier].forEach((artifact, index) => {
  const label = ["runtime", "schema validator", "encryptor", "password verifier"][index];
  requireMatch(artifact, /coreEstimatedMinutes/, `${label} core reading duration contract`);
  requireMatch(artifact, /firstUseHints/, `${label} beginner term-hint contract`);
  requireMatch(artifact, /learningLayer/, `${label} core-detail block contract`);
});
requireMatch(js, /preGlossaryFields\.some\(\(field\)\s*=>\s*hasRenderableExactTerm\(field, hint\.term\)\)/, "runtime validates term hints per rendered field");
requireMatch(js, /function\s+hasRenderableExactTerm[\s\S]*?split\(\/\\\[\\\[\[a-z0-9-\]\+\\\]\\\]\//, "runtime validates term hints within citation-free rendered segments");
[schemaValidator, encryptTool, passwordVerifier].forEach((artifact, index) => {
  const label = ["schema validator", "encryptor", "password verifier"][index];
  requireMatch(artifact, /preGlossaryFields\.some\(\(field\)\s*=>\s*hasExactTerm\(field, hint\.term\)\)/, `${label} validates term hints per rendered field`);
  requireMatch(artifact, /function\s+hasExactTerm[\s\S]*?split\(\/\\\[\\\[\[a-z0-9-\]\+\\\]\\\]\//, `${label} validates hints within citation-free rendered segments`);
});
requireMatch(js, /layeredBlocks\.length\s*===\s*blocks\.length\s*&&\s*Array\.isArray\(hints\)/, "runtime restricts hints to layered lessons");
[schemaValidator, encryptTool, passwordVerifier].forEach((artifact, index) => {
  const label = ["schema validator", "encryptor", "password verifier"][index];
  requireMatch(artifact, /layeredBlocks\.length\s*!==\s*blocks\.length/, `${label} restricts hints to layered lessons`);
});
forbidMatch(css, /\.first-use-hint::after/, "clipped pseudo-element term tooltip");
requireMatch(css, /\.first-use-tooltip\s*\{[\s\S]*?position:\s*fixed[\s\S]*?max-height:\s*calc\(100vh\s*-\s*24px\)[\s\S]*?pointer-events:\s*auto/, "viewport-safe portal tooltip styling");
requireMatch(js, /activeTermHint\s*&&\s*event\.key\s*===\s*"Escape"[\s\S]*?hideTermHintTooltip\(\)/, "Escape dismisses an open term tooltip");
forbidMatch(js, /termHintTooltip\.setAttribute\("aria-live"/, "duplicate live-region term announcement");
forbidMatch(js, /definition\.(?:title\s*=|setAttribute\("aria-label")/, "duplicate accessible term label");

forbidMatch(html, /unlock-pillars/, "verbose unlock-page pillars");

requireMatch(js, /document\.createTextNode|\.textContent\s*=/, "safe text rendering");
requireMatch(js, /window\.crypto\.subtle\.decrypt/, "local cryptographic decryption");
requireMatch(js, /state\.data\s*=\s*null/, "lock clears decrypted data reference");
requireMatch(js, /lessonReader\.replaceChildren\(\)/, "lock clears rendered lesson content");

if (failures.length) {
  console.error(`Public vault checks failed: ${failures.join(", ")}.`);
  process.exit(1);
}

console.log("Public vault static checks passed: resource allowlist, CSP, JavaScript and validator syntax, uniform sixteen-domain schema-gate markers, encrypted-envelope plausibility, Git privacy boundary, and interface markers are valid; browser behavior was not exercised.");
