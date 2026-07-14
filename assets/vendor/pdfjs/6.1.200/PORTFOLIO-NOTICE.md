# Mozilla PDF.js 6.1.200

This directory contains the self-hosted legacy browser distribution of Mozilla PDF.js 6.1.200.

- Source: https://github.com/mozilla/pdf.js/releases/tag/v6.1.200
- Package: https://www.npmjs.com/package/pdfjs-dist/v/6.1.200
- License: Apache-2.0; see `LICENSE`
- npm integrity: `sha512-o8MolyzirkkLrcdsae/HEOiIcXWI7DS5zGpvqW8xTC2YUsW30rltFw2bDGvw/fskUdEMrQm2br68jzDS5BH2vw==`

Portfolio-specific changes:

- Uses the official minified legacy API and worker builds from `pdfjs-dist@6.1.200`.
- Disables embedded PDF scripting and annotation editing for this read-only CV viewer.
- Hides local-file, editing, and bookmark controls.
- Forces the viewer interface to English (`en-US`) for a consistent public experience.
- Uses a dark Portfolio navy document stage while keeping the PDF pages and toolbar unchanged.
- Marks rendered PDF pages with `ph-no-capture` so CV page pixels and text are blocked from PostHog Session Replay.
- Omits source maps, debugger assets, the sample PDF, and the unused sandbox bundle.
