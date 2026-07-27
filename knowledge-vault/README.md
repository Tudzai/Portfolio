# Private Knowledge Library

This folder is a private-reading layer inside the public Portfolio site. The browser derives an AES-256-GCM key from
the owner password, decrypts `vault-data.js` locally, and renders a multi-domain personal library without sending the
password, plaintext content, completion state, or search activity to a server. FinTech, Finance, Breaking, and muscle
recovery are separate structured collections; existing personal notes remain available as their own collection.

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
- The encryption tool verifies a correct-key round trip and confirms that a deliberately wrong key is rejected before
  it replaces the published ciphertext.
- Decrypted content is kept only in browser memory. The library stays open until the owner uses the manual lock,
  reloads or leaves the page, or closes the tab. Manual lock removes rendered plaintext and in-memory curriculum
  references as far as practical in client-side JavaScript.
- Theme, sidebar width and visibility, and completed-lesson IDs may be stored on the current device. The password and
  decrypted lesson text are never stored in local or session storage.
- The vault page has no analytics, third-party fonts, scripts, embeds, or network calls.

Do not use this vault for passwords, keys, recovery codes, identity documents, bank information, real customer data,
employer-confidential information, or other high-impact secrets.

## Current content contract

The decrypted source contains:

1. `archivedVault` — the previous personal-note library, preserved and rendered as its own collection;
2. `domains` — one object per structured knowledge area;
3. domain metadata — a stable ID, short mark, title, description, review date, mental model, and source policy;
4. `primarySources` — a source library owned by that domain;
5. `modules` — the ordered beginner-to-advanced roadmap and its nested lessons;
6. lesson content — a planned lesson may expose its roadmap outcome and source mapping; a published lesson uses 11
   authored sections and the renderer adds section 12 from the lesson's source IDs.

The library currently contains the preserved personal-note collection, the fully published 12-module and 67-lesson
FinTech curriculum, and beginner-first roadmaps for Finance, Breaking, and muscle recovery. The three new roadmaps
remain explicitly `planned`: their scope and learning order are source-mapped, but they are not presented as completed
lessons. Time-sensitive regulation, competition rules, medical guidance, and emerging practices must be rechecked
periodically against their linked authoritative sources.

| Structured collection | Modules | Reading items | Saved sources | Status |
|---|---:|---:|---:|---|
| FinTech | 12 | 67 | Domain source library | Published |
| Finance | 15 | 74 | 81 | Planned roadmap |
| Breaking / Breakdance | 14 | 68 | 41 | Planned roadmap |
| Muscle recovery | 15 | 60 | 56 | Planned roadmap |

The three new roadmaps therefore add 44 modules, 202 planned lessons, and 178 saved sources. Every planned lesson maps
to at least three distinct sources; source mapping validates the roadmap scope, not the still-unwritten lesson prose.

## Add or edit library knowledge

1. Edit `private/knowledge.json`. Keep every note, module, lesson, and source `id` unique. Preserve `archivedVault`
   when adding or updating a structured domain so older notes remain available.
2. For a planned lesson, use `"status": "planned"`; sections may be omitted. Every roadmap lesson must already map to
   at least three distinct, valid source IDs so the planned scope can be audited without being mistaken
   for a published lesson.
3. For a published lesson:
   - use `"status": "published"`;
   - provide 11 content sections in the required lesson order;
   - provide at least three valid source IDs when sufficient reliable sources exist;
   - include `lastReviewed` for time-sensitive content;
   - use `[[source-id]]` inside text for inline citations.
   - keep `publishedAt` for the original publication date; use `adoptedAt`, `updatedAt`, `reviewedAt`, or `accessedAt`
     for those distinct dates instead of relabeling a later page update as publication.
4. Run the encryption wrapper from the repository root:

   ```powershell
   .\knowledge-vault\tools\encrypt-vault.ps1
   ```

5. Enter the vault password at the hidden prompt. The wrapper removes the temporary environment variable and clears the
   unmanaged password buffer after encryption.
6. Preview through a local HTTP server—never with a `file://` URL:

   ```powershell
   python -m http.server 8765
   ```

7. Visit `http://127.0.0.1:8765/knowledge-vault/` and test wrong-password rejection, correct-password decryption,
   curriculum navigation, search, completion, manual lock, theme, keyboard access, and mobile layout.

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
normalized before rendering. Only `http` and `https` links are accepted.

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
|   `-- encrypt-vault.ps1
`-- private/
    |-- .gitignore
    `-- knowledge.json     # ignored plaintext; never publish
```

Before staging any vault change, explicitly confirm that nothing under `private/` is included.
