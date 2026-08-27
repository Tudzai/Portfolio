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

const vietnameseMeaningMarkers = new Set([
  "cach", "can", "chi", "cho", "co", "cua", "de", "duoc", "dung", "giup", "he", "khi", "khong",
  "la", "muc", "mot", "nguoi", "nhu", "phai", "theo", "trong", "tren", "tu", "va", "viec", "voi",
]);

function hasVietnameseMeaning(value) {
  const text = visibleText(value);
  if (/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/iu.test(text)) {
    return true;
  }
  const markerCount = folded(text)
    .split(/\s+/u)
    .filter((word) => vietnameseMeaningMarkers.has(word))
    .length;
  return markerCount >= 2;
}

function looksEnglishFacingTerm(value) {
  const text = visibleText(value);
  return Boolean(
    text
    && /^[\x20-\x7e]+$/u.test(text)
    && /[A-Za-z]/u.test(text)
    && (/[A-Z]{2,}/u.test(text) || /\b[a-z]{3,}\b/u.test(text)),
  );
}

const englishFunctionWords = new Set(
  "a|also|an|and|are|as|at|be|been|being|but|by|can|could|did|do|does|each|for|from|had|has|have|if|in|into|is|it|its|less|may|might|more|most|must|no|not|of|on|only|or|per|should|than|that|the|these|this|those|to|too|very|via|versus|was|were|will|with|without|would|yes".split("|"),
);
const vietnameseAsciiWords = new Set(
  "ai|anh|ba|ban|bang|bao|bay|ben|bia|bi|binh|bo|bom|bon|ca|cac|cach|cai|cam|can|canh|cao|cha|chai|chay|che|chi|chia|chim|chinh|cho|chung|co|coi|con|cong|cua|cung|da|dang|danh|dao|day|de|den|di|dinh|do|doanh|don|du|dung|duy|em|ga|gan|gia|giai|giam|gian|giang|giao|giay|ghi|giua|hai|hay|he|hieu|hoa|hoan|hoang|hon|hop|huy|huynh|khang|khai|khao|khen|khi|khinh|kho|khoa|khoai|khoan|khoang|khong|khung|kim|kinh|lai|lam|lan|lang|lanh|lau|linh|lo|loai|long|luc|lui|luon|ly|mai|mang|manh|mau|may|minh|moi|mong|mot|mua|muon|nai|nam|ngang|nganh|ngay|nghe|nghi|ngon|ngoai|nguoi|nhai|nhanh|nhau|nhi|nhin|nhom|nhu|nhung|ninh|noi|pha|phai|phan|phat|phi|phim|phong|phu|phun|qua|quan|quang|quanh|quay|quen|quy|ranh|rau|roi|rung|sai|sang|sau|se|sinh|so|soi|song|sung|suy|ta|tai|tam|tan|tang|tao|tay|ten|tha|tham|thanh|thang|thao|thay|the|them|theo|thi|thoi|thong|thu|thua|thuc|tien|tim|tin|tinh|to|toi|tot|tra|trai|tranh|trao|tre|treo|trinh|trong|truoc|trung|truy|tu|tung|tuy|ung|va|vai|van|vang|vao|ve|ven|vi|viec|vinh|voi|vui|vua|xa|xanh|xay|xem|xin|xinh|xoay|xong|xung|yeu".split("|"),
);
const termUnitWords = new Set(
  "am|bps|cl|cm|db|dl|dpi|fps|ft|gb|gbps|ghz|hr|hrs|hz|in|kb|kbps|kg|khz|km|kw|kwh|lb|lbs|m2|m3|mb|mbps|mg|mhz|min|mins|ml|mm|mps|mw|oz|pm|ppi|ppm|px|rpm|sec|tb".split("|"),
);
const termTokenPattern = /(?<![\p{L}\p{N}])(?=[A-Za-z0-9&/+._-]*[A-Za-z])[A-Za-z0-9]+(?:[&/+._-][A-Za-z0-9]+)*(?![\p{L}\p{N}])/gu;

function maskedCandidateText(value) {
  return String(value || "")
    .replace(citationPattern, (match) => " ".repeat(match.length))
    .replace(/\b(?:https?:\/\/|www\.)\S+/giu, (match) => " ".repeat(match.length))
    .replace(/\b\S+@\S+\.\S+\b/giu, (match) => " ".repeat(match.length));
}

function autoCandidateKind(value, authoredTokens) {
  const token = String(value || "");
  const key = folded(token);
  const letters = token.replace(/[^A-Za-z]/gu, "");
  if (!key || !letters || termUnitWords.has(key)) return "";
  const uppercaseCount = [...letters].filter((character) => character === character.toUpperCase()).length;
  const lowercaseCount = letters.length - uppercaseCount;
  const structural = /[0-9&/+._-]/u.test(token)
    || (uppercaseCount >= 2 && lowercaseCount === 0)
    || (uppercaseCount > 0 && lowercaseCount > 0 && !/^[A-Z][a-z]+$/u.test(token));
  if (structural) return "structural";
  if (vietnameseAsciiWords.has(key) || englishFunctionWords.has(key)) return "";
  if (authoredTokens.has(key)) return "authored";
  return /^[A-Za-z]{3,}$/u.test(token) ? "plain" : "";
}

function autoCandidatesFromValue(value, authoredTokens) {
  const source = maskedCandidateText(value);
  return [...source.matchAll(termTokenPattern)]
    .map((match) => ({ term: match[0], key: folded(match[0]), kind: autoCandidateKind(match[0], authoredTokens) }))
    .filter((candidate) => candidate.kind);
}

function lessonSurfaceValues(domain, module, lesson) {
  return [
    domain?.title,
    module?.title,
    lesson?.title,
    lesson?.summary,
    ...(lesson?.sections || []).flatMap((section) => (
      section?.id === "thuat-ngu"
        ? []
        : [section?.title, ...(section?.blocks || []).flatMap(visibleStrings)]
    )),
  ].filter((value) => typeof value === "string" && visibleText(value));
}

function prepareOccurrenceCorpus(value) {
  const text = visibleText(value);
  return {
    exact: text.toLocaleLowerCase("vi"),
    folded: folded(text),
  };
}

function occurrenceCount(corpus, term) {
  const countIn = (text, needle) => {
    const isWord = (character) => Boolean(character && /[\p{L}\p{N}]/u.test(character));
    let count = 0;
    let index = text.indexOf(needle);
    while (needle && index >= 0) {
      const before = index > 0 ? text[index - 1] : "";
      const after = index + needle.length < text.length ? text[index + needle.length] : "";
      if ((!isWord(needle[0]) || !isWord(before)) && (!isWord(needle.at(-1)) || !isWord(after))) count += 1;
      index = text.indexOf(needle, index + Math.max(1, needle.length));
    }
    return count;
  };
  const exact = countIn(corpus.exact, String(term || "").toLocaleLowerCase("vi"));
  if (exact) return exact;
  return countIn(corpus.folded, folded(term));
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

function authoredHintsForLesson(lesson) {
  const glossary = (lesson.sections || []).find((section) => section?.id === "thuat-ngu");
  const pairs = new Map(
    (glossary?.blocks || [])
      .flatMap(glossaryPairsFromBlock)
      .map((hint) => [folded(hint.term), hint]),
  );
  for (const hint of lesson.firstUseHints || []) {
    const normalized = normalizePair(hint?.term, hint?.explanation, false);
    if (normalized) pairs.set(folded(normalized.term), normalized);
  }
  return [...pairs.values()].map((hint) => ({ ...hint, key: folded(hint.term) }));
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

const domainDefinitionLibraries = new Map(domains.map((domain) => [
  domain.id,
  (domain.modules || []).flatMap((module) => (
    (module.lessons || []).flatMap(authoredHintsForLesson)
  )),
]));
const authoredGlobalTokens = new Set(
  [...domainDefinitionLibraries.values()]
    .flat()
    .filter((hint) => looksEnglishFacingTerm(hint.term))
    .flatMap((hint) => [...maskedCandidateText(hint.term).matchAll(termTokenPattern)].map((match) => folded(match[0])))
    .filter(Boolean),
);

const failures = new Map();
const record = (category) => failures.set(category, (failures.get(category) || 0) + 1);
let lessonCount = 0;
let definitionCount = 0;
let renderableCount = 0;
let lessonsBelowFourBodyTerms = 0;
let readerKeywordDefinitionCount = 0;
let omittedMetadataKeywordCount = 0;
let omittedEnglishKeywordCount = 0;
let renderableOmittedEnglishKeywordCount = 0;
let domainBackfillableEnglishKeywordCount = 0;
let renderableDomainBackfillableEnglishKeywordCount = 0;
let contextualEnglishKeywordFallbackCount = 0;
let uncoveredRenderableEnglishKeywordCount = 0;
let vietnameseDefinitionCount = 0;
let contextReadyLessonCount = 0;
let contextReadyDomainCount = 0;
let englishContextReadyDomainCount = 0;
let lessonSurfaceContextReadyCount = 0;
let sameDomainEnglishOccurrenceCount = 0;
let sameDomainEnglishBackfillCount = 0;
let uncoveredSameDomainEnglishOccurrenceCount = 0;
let autoContextCandidateOccurrenceCount = 0;
let autoContextCandidateTermCount = 0;
let maximumAutoContextTermsPerLesson = 0;
let uncoveredAutoContextCandidateOccurrenceCount = 0;
let titleSummaryAutoCandidateCount = 0;
let structuralAutoCandidateCount = 0;
let authoredAutoCandidateCount = 0;
let plainAutoCandidateCount = 0;

for (const domain of domains) {
  let domainContextReady = true;
  let domainEnglishContextReady = true;
  for (const module of domain.modules || []) {
    const moduleDefinitions = (module.lessons || []).flatMap(authoredHintsForLesson);
    for (const lesson of module.lessons || []) {
      lessonCount += 1;
      const glossaryIndex = (lesson.sections || []).findIndex((section) => section?.id === "thuat-ngu");
      const hints = authoredHintsForLesson(lesson);
      const pairs = new Map(hints.map((hint) => [hint.key, hint]));
      const values = glossaryIndex >= 0
        ? lesson.sections.slice(0, glossaryIndex).flatMap((section) => section.blocks.flatMap(visibleStrings))
        : [];
      const usable = hints.filter((hint) => values.some((value) => renderable(value, hint.term)));
      const surfaceValues = lessonSurfaceValues(domain, module, lesson);
      const surfaceCorpus = prepareOccurrenceCorpus(
        surfaceValues.join(" termhintboundarytoken "),
      );
      if (surfaceValues.length >= 4) lessonSurfaceContextReadyCount += 1;
      else record("complete lesson surface context");
      const runtimeHintKeys = new Set(hints.map((hint) => hint.key));
      const localHintKeys = new Set(runtimeHintKeys);
      const scopeDefinitionMap = new Map();
      [...moduleDefinitions, ...(domainDefinitionLibraries.get(domain.id) || [])].forEach((definition) => {
        if (definition?.key && !scopeDefinitionMap.has(definition.key)) {
          scopeDefinitionMap.set(definition.key, definition);
        }
      });
      const addRenderableDefinitions = (definitions) => {
        definitions.forEach((definition) => {
          if (!looksEnglishFacingTerm(definition.term)) return;
          const occurrences = occurrenceCount(surfaceCorpus, definition.term);
          if (!occurrences) return;
          sameDomainEnglishOccurrenceCount += occurrences;
          if (!localHintKeys.has(definition.key)) sameDomainEnglishBackfillCount += 1;
          runtimeHintKeys.add(definition.key);
          if (!runtimeHintKeys.has(definition.key)) uncoveredSameDomainEnglishOccurrenceCount += occurrences;
        });
      };
      addRenderableDefinitions([...scopeDefinitionMap.values()]);

      const autoCandidates = surfaceValues.flatMap((value) => autoCandidatesFromValue(value, authoredGlobalTokens));
      autoContextCandidateOccurrenceCount += autoCandidates.length;
      structuralAutoCandidateCount += autoCandidates.filter((candidate) => candidate.kind === "structural").length;
      authoredAutoCandidateCount += autoCandidates.filter((candidate) => candidate.kind === "authored").length;
      plainAutoCandidateCount += autoCandidates.filter((candidate) => candidate.kind === "plain").length;
      const autoCandidateKeys = new Set(autoCandidates.map((candidate) => candidate.key));
      autoContextCandidateTermCount += autoCandidateKeys.size;
      maximumAutoContextTermsPerLesson = Math.max(maximumAutoContextTermsPerLesson, autoCandidateKeys.size);
      const heroValues = [lesson.title, lesson.summary].filter((value) => typeof value === "string");
      titleSummaryAutoCandidateCount += heroValues
        .flatMap((value) => autoCandidatesFromValue(value, authoredGlobalTokens))
        .length;
      autoCandidates.forEach((candidate) => runtimeHintKeys.add(candidate.key));
      autoCandidates.forEach((candidate) => {
        if (!runtimeHintKeys.has(candidate.key)) uncoveredAutoContextCandidateOccurrenceCount += 1;
      });
      const readerKeywords = new Map();
      for (const keyword of lesson.keywords || []) {
        const key = folded(keyword);
        const definition = key ? definitionForKeyword(keyword, hints) : null;
        if (key && definition && !readerKeywords.has(key)) readerKeywords.set(key, definition);
        else if (key && !definition) {
          omittedMetadataKeywordCount += 1;
          if (looksEnglishFacingTerm(keyword)) {
            omittedEnglishKeywordCount += 1;
            const bodyRenderable = values.some((value) => renderable(value, keyword));
            const bodyContextReady = values.some((value) => (
              renderable(value, keyword)
              && folded(visibleText(value)) !== folded(keyword)
            ));
            if (bodyRenderable) {
              renderableOmittedEnglishKeywordCount += 1;
            }
            const domainDefinition = definitionForKeyword(
              keyword,
              domainDefinitionLibraries.get(domain.id) || [],
            );
            if (domainDefinition) {
              domainBackfillableEnglishKeywordCount += 1;
              if (bodyRenderable) renderableDomainBackfillableEnglishKeywordCount += 1;
            } else if (bodyContextReady) {
              contextualEnglishKeywordFallbackCount += 1;
            } else if (bodyRenderable) {
              uncoveredRenderableEnglishKeywordCount += 1;
              domainEnglishContextReady = false;
            }
          }
        }
      }
      for (const hint of hints) {
        if (readerKeywords.size >= 4) break;
        if (hint.key && !readerKeywords.has(hint.key)) readerKeywords.set(hint.key, hint);
      }
      definitionCount += pairs.size;
      renderableCount += usable.length;
      readerKeywordDefinitionCount += readerKeywords.size;
      const vietnameseDefinitions = hints.filter((hint) => hasVietnameseMeaning(hint.explanation)).length;
      vietnameseDefinitionCount += vietnameseDefinitions;
      if (pairs.size < 4) record("glossary definition coverage");
      if (readerKeywords.size < 4) record("reader keyword definition coverage");
      if (usable.length < 4) lessonsBelowFourBodyTerms += 1;
      const contextReady = Boolean(visibleText(lesson.title))
        && readerKeywords.size >= 4;
      if (contextReady) contextReadyLessonCount += 1;
      else {
        domainContextReady = false;
        record("contextual Vietnamese tooltip coverage");
      }
    }
  }
  if (domainContextReady) contextReadyDomainCount += 1;
  if (domainEnglishContextReady) englishContextReadyDomainCount += 1;
}

if (uncoveredRenderableEnglishKeywordCount) {
  record("body English contextual hint coverage");
}
if (uncoveredSameDomainEnglishOccurrenceCount) {
  record("same-domain English occurrence coverage");
}
if (uncoveredAutoContextCandidateOccurrenceCount) {
  record("automatic English contextual occurrence coverage");
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
  `Term-hint audit passed: domains (${domains.length}), lessons (${lessonCount}), definitions (${definitionCount}), Vietnamese definitions (${vietnameseDefinitionCount}/${definitionCount}), context-ready lessons (${contextReadyLessonCount}/${lessonCount}), complete lesson-surface contexts (${lessonSurfaceContextReadyCount}/${lessonCount}), context-ready domains (${contextReadyDomainCount}/${domains.length}), English-context-ready domains (${englishContextReadyDomainCount}/${domains.length}), definition-backed reader keywords (${readerKeywordDefinitionCount}), body-renderable terms (${renderableCount}), lessons using glossary-chip fallback (${lessonsBelowFourBodyTerms}), metadata keywords omitted without an authored definition (${omittedMetadataKeywordCount}), English-facing omitted keywords (${omittedEnglishKeywordCount}), body-renderable English-facing omissions (${renderableOmittedEnglishKeywordCount}), domain-backfillable English keywords (${domainBackfillableEnglishKeywordCount}), body-renderable domain backfills (${renderableDomainBackfillableEnglishKeywordCount}), contextual English fallbacks (${contextualEnglishKeywordFallbackCount}), uncovered body English keywords (${uncoveredRenderableEnglishKeywordCount}), same-domain English occurrences (${sameDomainEnglishOccurrenceCount}), same-domain definition backfills (${sameDomainEnglishBackfillCount}), uncovered same-domain English occurrences (${uncoveredSameDomainEnglishOccurrenceCount}), automatic contextual English candidate occurrences (${autoContextCandidateOccurrenceCount}), structural automatic candidates (${structuralAutoCandidateCount}), authored automatic candidates (${authoredAutoCandidateCount}), plain automatic candidates (${plainAutoCandidateCount}), automatic contextual English terms (${autoContextCandidateTermCount}), maximum automatic terms per lesson (${maximumAutoContextTermsPerLesson}), title-summary contextual candidates (${titleSummaryAutoCandidateCount}), uncovered automatic contextual candidates (${uncoveredAutoContextCandidateOccurrenceCount}).`,
);
