import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  return index >= 0 ? argumentsList[index + 1] || "" : "";
}

const inputPath = argumentValue("--input")
  ? resolve(process.cwd(), argumentValue("--input"))
  : join(vaultDirectory, "private", "knowledge.json");
const selectedDomainId = argumentValue("--domain");
const citationPattern = /\[\[[a-z0-9-]+\]\]/giu;

function visibleStrings(block) {
  if (!block || typeof block !== "object") return [];
  if (block.type === "paragraph") return [block.text];
  if (block.type === "list") return Array.isArray(block.items) ? block.items : [];
  if (block.type === "callout") return [block.label, block.text];
  if (block.type === "table") return [
    ...(Array.isArray(block.headers) ? block.headers : []),
    ...(Array.isArray(block.rows) ? block.rows.flatMap((row) => Array.isArray(row) ? row : []) : []),
  ];
  if (block.type === "flow") return Array.isArray(block.steps)
    ? block.steps.flatMap((step) => [step?.label, step?.title, step?.detail])
    : [];
  return [];
}

function visibleText(value) {
  return String(value || "").replace(citationPattern, " ").replace(/\s{2,}/gu, " ").trim();
}

function folded(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[đĐ]/gu, "d")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9&/]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizePair(termValue, explanationValue, derived = true) {
  const term = visibleText(termValue).replace(/^[•·\-–—]\s*/u, "").trim();
  const explanation = visibleText(explanationValue);
  if (!term || !explanation || term.length > 80 || explanation.length > 600) return null;
  if (!/[\p{L}\p{N}]/u.test(term) || folded(term) === folded(explanation)) return null;
  if (!derived) return { term, explanation };
  const genericLabels = new Set([
    "canh bao", "ghi nho", "important", "luu y", "note", "quan trong", "tip", "vi du",
  ]);
  const wordCount = term.split(/\s+/u).filter(Boolean).length;
  if (
    term.length < 2
    || explanation.length < 8
    || wordCount > 12
    || /[.!?。！？]$/u.test(term)
    || /[:：;；]/u.test(term)
    || genericLabels.has(folded(term))
  ) return null;
  return { term, explanation };
}

function parseGlossaryLine(value) {
  const match = visibleText(value).match(/^(.{2,80}?)(?:\s*[:：]\s*|\s+[–—-]\s+)(.{8,600})$/u);
  return match ? normalizePair(match[1], match[2]) : null;
}

function glossaryPairsFromBlock(block) {
  if (block?.type === "paragraph") return [parseGlossaryLine(block.text)].filter(Boolean);
  if (block?.type === "list") return (block.items || []).map(parseGlossaryLine).filter(Boolean);
  if (block?.type === "callout") {
    return [normalizePair(block.label, block.text), parseGlossaryLine(block.text)].filter(Boolean);
  }
  if (block?.type === "table") {
    return (block.rows || []).map((row) => (
      Array.isArray(row) && row.length >= 2 ? normalizePair(row[0], row.slice(1).join(" — ")) : null
    )).filter(Boolean);
  }
  if (block?.type === "flow") {
    return (block.steps || []).map((step) => normalizePair(step?.title, step?.detail)).filter(Boolean);
  }
  return [];
}

function termMatch(value, term) {
  const text = String(value || "").toLocaleLowerCase("vi");
  const needle = String(term || "").toLocaleLowerCase("vi");
  const isWord = (character) => Boolean(character && /[\p{L}\p{N}]/u.test(character));
  let index = text.indexOf(needle);
  while (needle && index >= 0) {
    const before = index > 0 ? text[index - 1] : "";
    const after = index + needle.length < text.length ? text[index + needle.length] : "";
    if ((!isWord(needle[0]) || !isWord(before)) && (!isWord(needle.at(-1)) || !isWord(after))) return true;
    index = text.indexOf(needle, index + Math.max(1, needle.length));
  }
  return false;
}

function renderable(value, term) {
  return String(value || "").split(citationPattern).some((segment) => (
    termMatch(segment, term) || termMatch(folded(segment), folded(term))
  ));
}

function hintKeyContainsPhrase(containerKey, phraseKey) {
  return Boolean(containerKey && phraseKey && ` ${containerKey} `.includes(` ${phraseKey} `));
}

function definitionForKeyword(keyword, hints) {
  const key = folded(keyword);
  const exact = hints.find((hint) => hint.key === key);
  if (exact) return exact;
  return hints
    .filter((hint) => (
      hintKeyContainsPhrase(hint.key, key)
      || hintKeyContainsPhrase(key, hint.key)
    ))
    .sort((left, right) => Math.abs(left.key.length - key.length) - Math.abs(right.key.length - key.length))[0]
    || null;
}

let source;
try {
  source = JSON.parse(await readFile(inputPath, "utf8"));
} catch {
  console.error("Term-hint audit failed: source availability (1).");
  process.exit(1);
}

let domains = Array.isArray(source?.domains) ? source.domains : [];
if (selectedDomainId) domains = domains.filter((domain) => domain?.id === selectedDomainId);
if (!domains.length) {
  console.error("Term-hint audit failed: domain selection (1).");
  process.exit(1);
}

const failures = new Map();
const record = (category) => failures.set(category, (failures.get(category) || 0) + 1);
let lessonCount = 0;
let definitionCount = 0;
let renderableCount = 0;
let lessonsBelowFourBodyTerms = 0;
let readerKeywordDefinitionCount = 0;
let omittedMetadataKeywordCount = 0;

for (const domain of domains) {
  for (const module of domain.modules || []) {
    for (const lesson of module.lessons || []) {
      lessonCount += 1;
      const glossaryIndex = (lesson.sections || []).findIndex((section) => section?.id === "thuat-ngu");
      const glossary = glossaryIndex >= 0 ? lesson.sections[glossaryIndex] : null;
      const pairs = new Map(
        (glossary?.blocks || [])
          .flatMap(glossaryPairsFromBlock)
          .map((hint) => [folded(hint.term), hint]),
      );
      for (const hint of lesson.firstUseHints || []) {
        const normalized = normalizePair(hint?.term, hint?.explanation, false);
        if (normalized) pairs.set(folded(normalized.term), normalized);
      }
      const hints = [...pairs.values()].map((hint) => ({ ...hint, key: folded(hint.term) }));
      const values = glossaryIndex >= 0
        ? lesson.sections.slice(0, glossaryIndex).flatMap((section) => section.blocks.flatMap(visibleStrings))
        : [];
      const usable = hints.filter((hint) => values.some((value) => renderable(value, hint.term)));
      const readerKeywords = new Map();
      for (const keyword of lesson.keywords || []) {
        const key = folded(keyword);
        const definition = key ? definitionForKeyword(keyword, hints) : null;
        if (key && definition && !readerKeywords.has(key)) readerKeywords.set(key, definition);
        else if (key && !definition) omittedMetadataKeywordCount += 1;
      }
      for (const hint of hints) {
        if (readerKeywords.size >= 4) break;
        if (hint.key && !readerKeywords.has(hint.key)) readerKeywords.set(hint.key, hint);
      }
      definitionCount += pairs.size;
      renderableCount += usable.length;
      readerKeywordDefinitionCount += readerKeywords.size;
      if (pairs.size < 4) record("glossary definition coverage");
      if (readerKeywords.size < 4) record("reader keyword definition coverage");
      if (usable.length < 4) lessonsBelowFourBodyTerms += 1;
    }
  }
}

if (failures.size) {
  const summary = [...failures.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([category, count]) => `${category} (${count})`)
    .join(", ");
  console.error(`Term-hint audit failed: ${summary}.`);
  process.exit(1);
}

console.log(
  `Term-hint audit passed: domains (${domains.length}), lessons (${lessonCount}), definitions (${definitionCount}), definition-backed reader keywords (${readerKeywordDefinitionCount}), body-renderable terms (${renderableCount}), lessons using glossary-chip fallback (${lessonsBelowFourBodyTerms}), metadata keywords omitted without an authored definition (${omittedMetadataKeywordCount}).`,
);
