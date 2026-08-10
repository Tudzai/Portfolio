# TDAT Financial Model Library

This folder is the public, reusable Excel-model library for the portfolio. It is broader than the case-owned models
inside `showcase/fpa-decision-cases/`: each library model is intended to be downloaded, adapted, reviewed, and reused.

The public route is:

```text
/showcase/financial-models/
```

## Positioning

> Reusable Excel models for finance decisions — built to flex, tie, and withstand review.

The homepage remains FP&A-first. This hub contains the wider finance taxonomy across statements, planning,
valuation, M&A, treasury, risk, project finance, SME/startup, investment, and personal-finance learning.

## Folder contract

```text
financial-models/
├── README.md
├── index.html
├── models.css
├── model-data.js
├── model-library.js
└── {model-slug}/
    ├── index.html
    ├── assets/                 # Renders from the actual workbook
    └── model/
        ├── tdat-{model-slug}.xlsx
        └── model-notes.md
```

Keep the route and download filename stable. Store the version inside the workbook, registry, model page, and
changelog; do not create canonical files named `final`, `v2`, or with date suffixes.

## Registry contract

`model-data.js` is the catalogue source of truth. Every entry needs:

- stable model ID and slug;
- title, decision, description, domain, roles, use cases, level, priority, horizon, and setup time;
- one honest status: `Available`, `In QA`, or `Roadmap`;
- version, last-tested date, compatibility, QA status, and file metadata when available;
- no file path or download CTA for roadmap-only entries.

`TDAT_ROLE_FAMILIES` in the same registry is the career-taxonomy source of truth. Keep role titles grouped into
seven recruiter-friendly families while keeping `domain` separate: the family identifies who uses a model; the
domain identifies the finance decision the model supports. Every published role title must map to exactly one
family. The library filter must support both a whole family and an individual role title.

## Release gate

A model may be labeled `Available` only when:

- the canonical `.xlsx` file exists and opens without a repair warning;
- required finance tie-outs and visible checks pass;
- the workbook contains no visible formula errors, unexplained circular references, hidden plugs, macros, or
  undisclosed external links;
- synthetic or public-safe evidence is labeled honestly;
- all user-facing sheets pass visual review;
- the model page states scope, intended users, version, compatibility, limitations, usage terms, and QA status;
- workbook renders on the site come from the actual released file;
- privacy inspection finds no real entity data, identifiers, local paths, hidden connections, or sensitive metadata.

`TDAT QA reviewed` means the published controls were reviewed. It must not be described as an independent
certification.

## Standards

The durable workbook rules live in:

- [`../../docs/standards/financial-model-workbook-standard.md`](../../docs/standards/financial-model-workbook-standard.md)
- [`../../docs/templates/financial-model-product.md`](../../docs/templates/financial-model-product.md)

## Current release

Release date: `2026-07-13`.

- 24 / 24 catalogue models are `Available`.
- 1 existing flagship plus 23 newly released specialist templates.
- 7 career families covering 41 finance role titles.
- 9 finance decision domains.
- 267 published workbook checks pass across the library (27 flagship + 240 new).
- 207 sheets from the 23-model expansion were rendered during release QA.
- Every public file is macro-free, has no external workbook links, uses synthetic worked data, and records its SHA-256 hash.

Release families:

- Core Statements: Three-Statement Model Starter.
- Planning & Performance: Budget & Rolling Forecast, Working Capital Planner, Variance Bridge & Forecast Accuracy, Headcount & Compensation Plan, Pricing & Margin Waterfall.
- Treasury & Capital: 13-Week Cash Flow, Debt & Covenant Model, FX Exposure & Hedge.
- Valuation & Transactions: DCF Valuation, Trading Comparables, M&A Accretion / Dilution.
- Investment & Portfolio: Capex / Business Case, LBO Returns Model.
- Credit & Risk: Credit Underwriting / DSCR, ECL / Credit Stress Lite, Market Risk / Portfolio Stress.
- Project & Real Assets: Project Finance Lite, Debt Sculpting & Waterfall.
- SME & Startup: SME Integrated Forecast, SaaS Unit Economics.
- Personal Finance: Personal Budget & Net Worth, Retirement Scenario Planner.
