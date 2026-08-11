# Homepage browser feedback design

## Goal

Apply the seven browser comments as a cohesive responsive refinement without changing the portfolio's content architecture or destination links.

## Chosen approach

Use a focused shared-shell update for branding and system-stable icons, plus homepage-only layout and video changes. This keeps the favicon mark consistent across portfolio pages while containing the more opinionated video redesign to the homepage.

## Brand header

- Render the existing `assets/favicon.svg` artwork inside every shared shell brand mark instead of the `TA` text monogram.
- Use `IBM Plex Mono` for the `FP&A × AI` descriptor so it reads as a deliberate finance-and-technology label distinct from the name.
- Keep the name, link target, dimensions, and accessible homepage label unchanged.

## Capability rows

- Keep each capability label and its destination action on one horizontal line at mobile widths.
- Use a flexible label column and a compact fixed action column so longer labels shrink safely without pushing the action to a second row.
- Apply the same row behavior to FP&A, Automation, and Agentic AI.
- Replace the northeast-arrow text glyph with a CSS-drawn icon so its shape is stable across operating systems and fonts.

## Icon policy

- Replace decorative play and external-link glyphs touched by this homepage flow with SVG/CSS icons.
- Use shared CSS icon classes where the shell repeats across the portfolio.
- Do not alter meaningful text, mathematical symbols, language characters, or content punctuation.

## Team automation demo

- Keep the headline above the media and reduce the gap between them.
- Preserve the video's native 16:9 presentation without cropping.
- Move the “Open video” and EN/VN subtitle controls into a compact overlay toolbar inside the video frame.
- Keep native video controls and caption behavior.
- Maintain readable controls and stacking on narrow screens.

## Automation case preview

- Autoplay the preview when it is in view, muted, looping, and inline; continue respecting reduced-motion and data-saving safeguards already implemented in JavaScript.
- Remove the separate “Watch” control.
- Move the Raw data → Python → Report → Insight route strip to the lower edge of the preview.
- Keep the case headline, metric line, and destination link unchanged.

## Verification

- Add source-level regression checks for the required markup and CSS contracts before implementation.
- Verify the checks fail before the change and pass after it.
- Run existing repository checks and `git diff --check`.
- Inspect the live homepage at desktop and 319px mobile widths, confirming alignment, video ratio, autoplay state, overlays, and absence of horizontal overflow.
- Confirm reduced-motion still prevents background autoplay.

