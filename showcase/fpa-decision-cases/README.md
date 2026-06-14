# FP&A Decision Cases

This folder contains public-safe executive FP&A decision-support summaries.

The homepage and `index.html` should lead with real operating decision support at a sanitized level:

- HCM operating diagnosis and action plan
- Quarterly sales performance review
- Customer margin and resource-load review
- Customer credit-limit / AR control review

Do not publish company workbooks, screenshots, raw interview notes, customer names, salesperson names, internal
comments, or source-level financial values. High-level public-safe target deltas can be used when they are explicitly
approved for the portfolio. If a technical proof artifact is needed, link to synthetic/public-safe samples instead of
source files.

## Structure

```text
showcase/fpa-decision-cases/
  index.html
  logistics-margin-reset/              # legacy synthetic case, not linked from homepage
  ebitda-variance-bridge/              # legacy synthetic case, not linked from homepage
  working-capital-cash-runway/         # legacy synthetic case, not linked from homepage
```

## How To Add A New Case

1. Create a lowercase kebab-case folder under `showcase/fpa-decision-cases/`.
2. Copy one existing `index.html`.
3. Update the decision question, KPIs, narrative, and privacy note.
4. Add model files inside a `model/` subfolder only if they are synthetic or public-safe.
5. Add the new card to `showcase/fpa-decision-cases/index.html` and the homepage section in `index.html`.

## Content Rules

Each case should answer:

- What decision does the finance or business leader need to make?
- What changed in the numbers?
- Why did it change?
- What is the financial impact?
- Who owns the next action?
- What model or QA evidence supports the recommendation?

Keep the story finance-first. Tools are proof, not the headline.
