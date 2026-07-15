# Personal Knowledge Vault

This folder provides a private-reading layer inside the public Portfolio site. The browser derives an AES-256-GCM key from the password, decrypts `vault-data.js` locally, and renders the knowledge without sending the password, plaintext, or search activity to a server.

The page is intentionally not linked from the main portfolio and is marked `noindex`. The URL is not a security boundary: the encrypted data is still publicly downloadable because GitHub Pages is public.

## Security Boundary

- `private/knowledge.json` is local plaintext and is ignored by the nested `.gitignore`.
- `vault-data.js` is the only knowledge payload that may be committed. It contains salt, IV, crypto settings, and ciphertext.
- The password is never stored in HTML, CSS, JavaScript, or Git history.
- The current implementation uses PBKDF2-HMAC-SHA256 with 600,000 iterations and AES-256-GCM authenticated encryption.
- A short dictionary password remains vulnerable to offline guessing even when the encryption is implemented correctly. Use this vault for low-to-moderate sensitivity personal knowledge, not high-impact secrets.

Never store passwords, API keys, recovery codes, identity documents, bank information, real customer data, employer-confidential material, or private keys here. Use a password manager or a properly authenticated private service for those items.

## Add Or Edit Knowledge

1. Copy `knowledge.example.json` to `private/knowledge.json` if the private file does not exist.
2. Edit `private/knowledge.json`. Keep `content` as an array of paragraphs and keep every note `id` unique.
3. From PowerShell, run:

   ```powershell
   .\knowledge-vault\tools\encrypt-vault.ps1
   ```

4. Enter the desired vault password at the hidden prompt.
5. Preview the site through a local web server. Do not open the HTML through `file://`.

   ```powershell
   python -m http.server 8765
   ```

6. Visit `http://127.0.0.1:8765/knowledge-vault/` and test both the correct and an incorrect password.
7. Commit `knowledge-vault/vault-data.js` and the application files. Never stage anything inside `knowledge-vault/private/` except its `.gitignore`.

## Change The Password

Run the encryption tool again and enter the new password. A new random salt and IV are generated every time. Only the regenerated `vault-data.js` needs to be published.

## Note Schema

```json
{
  "id": "unique-kebab-case-id",
  "title": "Note title",
  "category": "FP&A",
  "summary": "One-sentence summary",
  "content": ["Paragraph one.", "Paragraph two."],
  "tags": ["forecast", "decision"],
  "pinned": false,
  "updatedAt": "2026-07-15",
  "sourceLabel": "Optional source label",
  "sourceUrl": "https://optional-source.example"
}
```

## Public Files

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
