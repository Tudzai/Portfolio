# Private Knowledge Library

This folder is a private-reading layer inside the public Portfolio site. The browser derives an AES-256-GCM key from
the owner password, decrypts `vault-data.js` locally, and renders a multi-domain personal library without sending the
password, plaintext content, completion state, or search activity to a server. FinTech, Finance, Road to CFO,
Breaking, muscle recovery, personal style, photography, home cooking, bar drinks, and coffee are separate structured
collections; existing personal notes remain available as their own collection.

The page is intentionally unlinked and marked `noindex`. The URL is not a security boundary: encrypted data remains
publicly downloadable when the Portfolio site is deployed, so a strong unique password is essential.

## Language contract

- Interface chrome, navigation, controls, status messages, search, and collection framing use English.
- Knowledge content remains in Vietnamese, including note and lesson prose, module and lesson titles, section headings,
  terminology explanations, source metadata, and citations.
- Important English industry terms may remain in the Vietnamese content when they are the standard terms used in
  practice.

## Security boundary

- `private/knowledge.json` is the local plaintext source and is ignored by Git.
- `vault-data.js` is the only knowledge payload that may be committed. It contains ciphertext, salt, IV, and KDF
  settings—not plaintext or a password.
- PBKDF2-HMAC-SHA256 uses 600,000 iterations; content encryption uses AES-256-GCM with authenticated additional data.
- Before replacing an existing payload, the encryption tool verifies that the supplied current password can decrypt
  the existing release shape. It then verifies a correct-key round trip and confirms that a deliberately wrong key is
  rejected before publishing the replacement atomically.
- Decrypted content is kept only in browser memory. The library stays open until the owner uses the manual lock,
  reloads or leaves the page, or closes the tab. Manual lock removes rendered plaintext and in-memory curriculum
  references as far as practical in client-side JavaScript.
- Theme, sidebar width and visibility, reading size, reading mode, completed-lesson IDs, saved-lesson IDs, and a short
  list of recently opened lesson IDs may be stored on the current device. The password and decrypted lesson text are
  never stored in local or session storage.
- The vault page has no analytics, third-party fonts, scripts, embeds, or background third-party requests. Its own
  same-origin assets load normally; an external source site opens only after the reader chooses its HTTPS link.

## Reading experience

- The library home leads with the next useful lesson, recent reading, saved lessons, and per-domain progress.
- Collections are organized into five stable constellations: Personal space, Money & leadership, Movement & recovery,
  Everyday craft, and Taste & ritual. These same groups appear on the home page and in navigation.
- Every domain uses the same beginner path: a simple map, a recommended starting point, ordered modules, practical
  outcomes, and a clearly separated source library.
- Every lesson opens with a one-sentence guide and a simple starting idea. Essential view is the default for a new
  reader. Evidence-heavy lessons keep all eleven sections but show a curated core path first; full view reveals every
  supporting detail. Shorter lessons keep the safest beginner sections visible. References remain available in both.
- The Learning Compass provides continue reading, surprise discovery, a deterministic daily spark, saved lessons,
  reading size, essential/full view, focus mode, a session-only 15-minute timer, and keyboard shortcuts without
  crowding the main reading surface.
- Theme Studio offers eight palettes: Midnight, Pearl, Nebula, Aurora, Ember, Tide, Sakura, and Solstice, plus an
  offline mood shuffle. The selected preset is saved only in local browser storage and can be changed from the header
  or Learning Compass.
- Lessons group their outline into Start, Understand, Apply, Remember, and Verify phases while preserving the full
  eleven-section authoring contract and source section.
- Glossary-derived first-use hints explain eligible technical terms in place without changing or inventing definitions.
- Search is accent-insensitive and keyboard navigable. Lesson pages include a section outline, estimated reading time,
  completion, bookmarks, previous/next navigation, and a reading-progress indicator.
- Each domain receives a restrained accent tone while sharing the same quiet, high-contrast visual system.

Do not use this vault for passwords, keys, recovery codes, identity documents, bank information, real customer data,
employer-confidential information, or other high-impact secrets.

## Current content contract

The decrypted source contains:

1. `archivedVault` — the previous personal-note library, preserved and rendered as its own collection;
2. `domains` — one object per structured knowledge area;
3. domain metadata — a stable ID, short mark, title, description, review date, mental model, and source policy;
4. `primarySources` — a source library owned by that domain;
5. `modules` — the ordered beginner-to-advanced roadmap and its nested lessons;
6. `evidenceOutcome` — a required observable work product or decision artifact that demonstrates each module's
   capability;
7. lesson content — every released lesson uses the same 11 canonical authored sections, and the renderer adds section
   12 from the lesson's source IDs;
8. optional beginner-reading metadata — `learningLayer` marks complete core/detail blocks, `coreEstimatedMinutes`
   describes the core path, and `firstUseHints` reuses definitions already present in that lesson's glossary.

The library currently contains the preserved personal-note collection plus fully published, beginner-first curricula
for FinTech, Finance, Road to CFO, Breaking, muscle recovery, personal style, photography, home cooking, bar drinks,
and coffee. The five practical lifestyle collections cover outfit building across multiple styles, camera and phone
photography, safe everyday cooking, understanding and ordering common alcoholic and alcohol-free bar drinks, and
coffee from bean and roast fundamentals through brewing, tasting, and café choices. Time-sensitive regulation,
competition rules, medical, alcohol-safety, food-safety, and emerging-practice guidance must be rechecked
periodically against the linked authoritative sources.

| Structured collection | Modules | Reading items | Saved sources | Status |
|---|---:|---:|---:|---|
| FinTech | 12 | 67 | 179 | Published |
| Finance | 15 | 74 | 97 | Published |
| Road to CFO | 18 | 89 | 68 | Published |
| Breaking / Breakdance | 14 | 68 | 41 | Published |
| Muscle recovery | 15 | 60 | 56 | Published |
| Personal style | 6 | 18 | 12 | Published |
| Photography | 6 | 18 | 12 | Published |
| Home cooking | 6 | 18 | 12 | Published |
| Bar drinks | 6 | 18 | 12 | Published |
| Coffee | 6 | 18 | 12 | Published |

Across the ten structured collections, the library now contains 104 modules, 448 published lessons, and 501 saved
sources. Every lesson contains 11 authored sections, renders its references as section 12, and maps to at least three
distinct sources from at least two organizations.

### Uniform ten-domain release gate

The same release criteria apply to all ten structured collections; none is treated as a legacy exception:

- domain identity, order, module count, lesson count, and source count must match the release manifest;
- every module has sequential numbering, framing metadata, and an `evidenceOutcome`;
- every lesson is published, has all 11 canonical section IDs and Vietnamese titles in order, has a valid ISO review
  date, and declares an estimated reading time from 5 to 20 minutes;
- when a lesson has a core/detail layer, every block is classified, every section retains core coverage, all risk
  blocks and caution callouts stay in core, and the core duration is validated; optional first-use hints must be
  unique, citation-free, bounded, and already used before the glossary;
- every lesson maps to at least three unique HTTPS sources from at least two organizations, cites every mapped source
  inline, and does not cite a source outside its reference list;
- every saved source has title, organization, scope, source type, and at least one valid ISO publication, adoption,
  update, review, or access date; every saved source must be used by at least one lesson;
- validation failures report category names only; they never print private titles, IDs, prose, URLs, or source data.

These checks establish consistent structure and evidence metadata, not semantic truth. Editorial review must still
confirm that a source directly supports the nearby claim, links remain reachable, time-sensitive guidance is current,
Vietnamese prose is genuinely clear for a beginner, terminology is explained at first use, and advice is safe and
appropriately qualified. The release-schema gate performs no network requests and cannot make those judgments.

Full reading time is calculated from all authored lesson text at 180 Vietnamese words per minute, rounded up, then
bounded to the release range of 5–20 minutes. A layered lesson also carries a separately verified core estimate. When
a review changes an existing estimate, the encrypted private source keeps the prior value in `durationReviewNotes`;
this audit note is never exposed as a public plaintext file.

## Add or edit library knowledge

1. Edit `private/knowledge.json`. Keep every note, module, lesson, and source `id` unique. Preserve `archivedVault`
   when adding or updating a structured domain so older notes remain available. Every released module must include an
   `evidenceOutcome` describing the observable work product or decision artifact expected from that module.
2. For a planned lesson, use `"status": "planned"`; sections may be omitted. Every roadmap lesson must already map to
   at least three distinct, valid source IDs so the planned scope can be audited without being mistaken
   for a published lesson. Planned lessons are an authoring state; the current release gate rejects them until they are
   fully published.
3. For a published lesson:
   - use `"status": "published"`;
   - provide all 11 canonical content sections in the required ID and title order;
   - provide at least three unique valid source IDs from at least two organizations;
   - include an ISO `lastReviewed` date and an integer `estimatedMinutes` value from 5 to 20;
   - when using a learning layer, mark every block `core` or `detail`, keep at least one core block per section, keep
     every risk block and caution callout in core, and provide `coreEstimatedMinutes`;
   - add `firstUseHints` only by copying a citation-free definition from the same lesson's glossary; never invent one;
   - use `[[source-id]]` inside text for every mapped source and keep citations within the lesson's reference list;
   - keep `publishedAt` for the original publication date; use `adoptedAt`, `updatedAt`, `reviewedAt`, or `accessedAt`
     for those distinct dates instead of relabeling a later page update as publication.
4. Run the read-only release-schema gate. It reports only pass/fail categories and never prints private content or IDs.
   It applies the uniform ten-domain contract above, including exact identity and counts, canonical sections, review
   and reading-time metadata, safe block shapes, source mapping and use, HTTPS URLs, dates, inline citations, and
   source-organization diversity. Plain-language and claim-level evidence quality still require editorial review:

   ```powershell
   node .\knowledge-vault\tools\validate-vault.mjs
   ```

5. Run the encryption wrapper from the repository root. For a routine content update, use the existing vault password:

   ```powershell
   .\knowledge-vault\tools\encrypt-vault.ps1
   ```

   To intentionally change the password, use the explicit switch; the wrapper verifies the current password and asks
   twice for the new one:

   ```powershell
   .\knowledge-vault\tools\encrypt-vault.ps1 -ChangePassword
   ```

6. Enter passwords only at the hidden prompts. The wrapper removes its temporary environment variables and clears the
   unmanaged password buffers after encryption. A wrong current password or mismatched confirmation aborts without
   replacing `vault-data.js`.
7. Preview through a local HTTP server—never with a `file://` URL:

   ```powershell
   python -m http.server 8765
   ```

8. Visit `http://127.0.0.1:8765/knowledge-vault/` and test wrong-password rejection, correct-password decryption,
   curriculum navigation, search, completion, manual lock, theme, keyboard access, and mobile layout.
9. Run the public static checker. It reads only public files and the ciphertext envelope; it never decrypts content:

   ```powershell
   node .\knowledge-vault\tools\test-public-vault.mjs
   ```

## Lesson block schema

Sections render from a small safe block vocabulary. The UI creates DOM nodes directly and does not inject decrypted
HTML.

```json
{
  "id": "concepts",
  "title": "Khái niệm chính",
  "blocks": [
    { "type": "paragraph", "text": "Claim with citation. [[source-id]]" },
    { "type": "list", "items": ["First item", "Second item"] },
    { "type": "callout", "label": "Established fact", "text": "Text", "tone": "note" },
    {
      "type": "table",
      "headers": ["Column A", "Column B"],
      "rows": [["A1", "B1"]]
    },
    {
      "type": "flow",
      "steps": [{ "label": "Step 1", "title": "Action", "detail": "What happens" }]
    }
  ]
}
```

Supported callout tones are `note` and `caution`. Lesson prose, lists, tables, flows, source titles, and URLs are all
normalized before rendering. Only `https` source links are accepted.

## Public files

```text
knowledge-vault/
|-- index.html
|-- vault.css
|-- vault.js
|-- vault-data.js          # encrypted payload only
|-- knowledge.example.json # public-safe schema example
|-- tools/
|   |-- encrypt-vault.mjs
|   |-- encrypt-vault.ps1
|   |-- test-public-vault.mjs
|   |-- validate-vault.mjs
|   `-- verify-vault-password.mjs
`-- private/
    |-- .gitignore
    `-- knowledge.json     # ignored plaintext; never publish
```

Before staging any vault change, explicitly confirm that nothing under `private/` is included.
