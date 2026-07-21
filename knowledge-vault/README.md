# FinTech Domain — Private Knowledge Hub

This folder is a private-reading layer inside the public Portfolio site. The browser derives an AES-256-GCM key from
the owner password, decrypts `vault-data.js` locally, and renders the FinTech curriculum without sending the password,
plaintext content, completion state, or search activity to a server.

The page is intentionally unlinked and marked `noindex`. The URL is not a security boundary: encrypted data remains
publicly downloadable when the Portfolio site is deployed, so a strong unique password is essential.

## Security boundary

- `private/knowledge.json` is the local plaintext source and is ignored by Git.
- `vault-data.js` is the only knowledge payload that may be committed. It contains ciphertext, salt, IV, and KDF
  settings—not plaintext or a password.
- PBKDF2-HMAC-SHA256 uses 600,000 iterations; content encryption uses AES-256-GCM with authenticated additional data.
- Decrypted content is kept only in browser memory. Manual lock and the 15-minute inactivity lock remove rendered
  plaintext and in-memory curriculum references as far as practical in client-side JavaScript.
- Theme and completed-lesson IDs may be stored on the current device. The password and decrypted lesson text are never
  stored in local or session storage.
- The vault page has no analytics, third-party fonts, scripts, embeds, or network calls.

Do not use this vault for passwords, keys, recovery codes, identity documents, bank information, real customer data,
employer-confidential information, or other high-impact secrets.

## Current content contract

The decrypted source contains:

1. `mentalModel` — the seven-layer framework used across the curriculum;
2. `sourcePolicy` — the research, cross-checking, classification, and time-sensitive review rules;
3. `primarySources` — the authoritative source library;
4. `modules` — the complete curriculum and nested lessons;
5. lesson content — published lessons use 11 authored sections; the renderer adds section 12, references, from the
   lesson's source IDs.

The first release contains a 12-module, 67-lesson curriculum. Only Module 1 is published. Other lessons remain
`planned` until their content has been independently researched and cross-checked.

## Add or edit FinTech knowledge

1. Edit `private/knowledge.json`. Keep every module, lesson, and source `id` unique.
2. For a planned lesson, use `"status": "planned"`; sections and references may be omitted.
3. For a published lesson:
   - use `"status": "published"`;
   - provide 11 content sections in the required lesson order;
   - provide at least three valid source IDs when sufficient reliable sources exist;
   - include `lastReviewed` for time-sensitive content;
   - use `[[source-id]]` inside text for inline citations.
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
