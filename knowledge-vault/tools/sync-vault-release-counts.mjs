import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  return index >= 0 ? argumentsList[index + 1] || "" : "";
}

const collections = [
  { id: "fintech-domain", label: "FinTech", modules: 12, lessons: 67 },
  { id: "fin-domain", label: "Finance", modules: 15, lessons: 74 },
  { id: "rtcfo-domain", label: "Road to CFO", modules: 18, lessons: 89 },
  { id: "brk-domain-breaking", label: "Breaking / Breakdance", modules: 14, lessons: 68 },
  { id: "mrel-domain", label: "Muscle recovery", modules: 15, lessons: 60 },
  { id: "personal-style", label: "Personal style", modules: 6, lessons: 18 },
  { id: "photography", label: "Photography", modules: 6, lessons: 18 },
  { id: "cooking", label: "Home cooking", modules: 6, lessons: 18 },
  { id: "bar-drinks", label: "Bar drinks", modules: 6, lessons: 18 },
  { id: "coffee", label: "Coffee", modules: 6, lessons: 18 },
  { id: "japanese-culture", label: "Japanese culture", modules: 6, lessons: 18 },
  { id: "art-visual-culture", label: "Art, taste & visual culture", modules: 6, lessons: 18 },
  { id: "architecture-design-living", label: "Architecture, design & beautiful living", modules: 6, lessons: 18 },
  { id: "self-psychology", label: "Self-understanding & human psychology", modules: 6, lessons: 18 },
  { id: "communication-conflict", label: "Communication & conflict", modules: 6, lessons: 18 },
  { id: "relationships-boundaries", label: "Relationships & boundaries", modules: 6, lessons: 18 },
];

const domainId = argumentValue("--domain");
const sourceCount = Number(argumentValue("--sources"));
const selected = collections.find((entry) => entry.id === domainId);
if (!selected || !Number.isInteger(sourceCount) || sourceCount < 0) {
  console.error("Release-count sync failed: provide a known --domain and a non-negative integer --sources value.");
  process.exit(1);
}

const manifestPaths = [
  join(vaultDirectory, "vault.js"),
  join(scriptDirectory, "encrypt-vault.mjs"),
  join(scriptDirectory, "validate-vault.mjs"),
  join(scriptDirectory, "verify-vault-password.mjs"),
  join(scriptDirectory, "test-public-vault.mjs"),
];
const readmePath = join(vaultDirectory, "README.md");
const paths = [...manifestPaths, readmePath];
const originals = new Map(await Promise.all(paths.map(async (path) => [path, await readFile(path, "utf8")])));

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function replaceExactlyOnce(value, pattern, replacement, label) {
  const matches = value.match(new RegExp(pattern.source, `${pattern.flags.includes("u") ? "u" : ""}g`)) || [];
  if (matches.length !== 1) throw new Error(label);
  return value.replace(pattern, replacement);
}

const candidates = new Map();
try {
  for (const path of manifestPaths) {
    const pattern = new RegExp(
      `(\\{ id: "${escapePattern(selected.id)}", modules: ${selected.modules}, lessons: ${selected.lessons}, sources: )\\d+( \\},)`,
      "u",
    );
    candidates.set(path, replaceExactlyOnce(
      originals.get(path),
      pattern,
      `$1${sourceCount}$2`,
      "manifest row",
    ));
  }

  const readmeRowPattern = new RegExp(
    `(\\| ${escapePattern(selected.label)} \\| ${selected.modules} \\| ${selected.lessons} \\| )\\d+( \\| Published \\|)`,
    "u",
  );
  let readme = replaceExactlyOnce(
    originals.get(readmePath),
    readmeRowPattern,
    `$1${sourceCount}$2`,
    "README collection row",
  );

  const manifestCandidate = candidates.get(manifestPaths[0]);
  const totalSources = collections.reduce((total, collection) => {
    const pattern = new RegExp(
      `\\{ id: "${escapePattern(collection.id)}", modules: ${collection.modules}, lessons: ${collection.lessons}, sources: (\\d+) \\},`,
      "u",
    );
    const match = manifestCandidate.match(pattern);
    if (!match) throw new Error("manifest total");
    return total + Number(match[1]);
  }, 0);
  readme = replaceExactlyOnce(
    readme,
    /(library now contains 140 modules, 556 published lessons, and )\d+( saved\s+sources)/u,
    `$1${totalSources}$2`,
    "README total",
  );
  candidates.set(readmePath, readme);

  await Promise.all(paths.map((path) => writeFile(path, candidates.get(path), "utf8")));
  console.log(`Release counts synced for ${domainId}: sources (${sourceCount}), total (${totalSources}).`);
} catch {
  console.error("Release-count sync failed: expected public count markers were not changed.");
  process.exit(1);
}
