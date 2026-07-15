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
- Loads the Portfolio analytics client in PDF.js only when the viewer is explicitly opened with `portfolio_replay=canvas`.
- Records the standalone `cv-pdf.html` experience from its PDF.js frame at 1 FPS and 0.7 quality while the top-level page continues to emit analytics events without starting a duplicate replay; canvas pixels, including visible contact details, cannot be selectively masked.
- Keeps rendered PDF pages blocked with `ph-no-capture` in the embedded `cv.html` viewer and in any viewer route that does not explicitly request canvas replay.
- Keeps PDF annotation layers enabled so hyperlinks remain interactive, while the parent viewer emits privacy-safe link-type events without email addresses or phone numbers.
- Omits source maps, debugger assets, the sample PDF, and the unused sandbox bundle.
