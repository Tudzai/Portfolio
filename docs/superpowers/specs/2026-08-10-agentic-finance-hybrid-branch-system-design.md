# Agentic Finance Hybrid Branch System Design

## Status

Approved in conversation on 2026-08-10. The user selected the hybrid content model and then requested implementation.
This document records that approved direction for the Stage mirror only. It does not authorize promotion to production,
deployment, or changes to canonical evidence.

## Goal

Make all 85 Agentic Finance branch routes feel like one portfolio by applying the homepage's visual language, navigation,
spacing, typography, interaction quality, and decision-first content hierarchy through shared templates.

## Content model

The system uses a hybrid depth rule:

- Catalogue hubs are concise discovery surfaces.
- Detail pages retain full evidence but begin with a recruiter-scannable decision context.
- Long technical references, FAQs, and methodology remain available but are visually secondary.
- Tools appear after the business decision, not as the main claim.

## Architecture

Canonical production HTML, registries, media, claims, and downloads remain the content source. The existing Stage builder
continues to mirror the 85 scoped routes into `Stage/agentic-finance/` and injects shared Stage assets.

The redesign adds one Stage-only route-context module. It maps each route family and template to:

- a short route label;
- a three-step decision flow;
- an evidence posture;
- a route-family hub destination and CTA label.

The builder renders this information as one compact context rail at the start of each generated page's main landmark.
It does not replace page titles, evidence values, disclaimers, downloads, dashboards, or article text.

Generated branch HTML is always rebuilt. It is not edited page by page.

## Visual system

The homepage remains the source of truth.

| Role | Value |
|---|---|
| Canvas | `#fff9f5` |
| Surface | `#ffffff` |
| Ink | `#21162c` |
| Muted ink | `#74687d` |
| Violet | `#7c3aed` |
| Pink | `#f72585` |
| Coral | `#ff6b5e`, semantic risk only |
| Display type | Manrope |
| Reading type | DM Sans |
| Evidence type | IBM Plex Mono |
| Main shell | `min(1240px, calc(100% - 48px))` |
| Reading rail | `min(760px, 100%)` |
| Primary radius | `24px` |
| Section rhythm | fluid 64-112px |

Cards use thin ink hairlines, restrained tinted surfaces, and shadows only where they clarify depth. Dark ink panels are
reserved for primary evidence, demonstrations, or decisive summary moments. Violet identifies automation and models; pink
identifies editorial and agentic work; FP&A uses ink with violet support; Power BI uses controlled violet-to-pink accents.

## Shared page anatomy

Every generated route follows this order:

1. Shared sticky header and capability navigation.
2. Compact route-context rail.
3. Existing route hero, restyled as the page's main editorial statement.
4. Primary evidence or main visual.
5. Decision-led content modules.
6. Controls, methodology, limitations, or governance.
7. Related evidence or next-route CTA.
8. Shared contact/footer path.

The route-context rail contains no unsupported claim. It communicates navigation and information architecture only.

## Route-family context

| Family/template | Label | Flow | Evidence posture | Return CTA |
|---|---|---|---|---|
| FP&A hub | FP&A / Library | Explore / Compare / Open | Public-safe decision evidence | Portfolio home |
| FP&A case | FP&A / Case | Decision / Drivers / Action | Public-safe decision evidence | FP&A cases |
| Automation hub | Automation / Library | Explore / Compare / Run | Public-safe runnable samples | Portfolio home |
| Automation case | Automation / Workflow | Inputs / Workflow / Output | Public-safe runnable sample | Automation library |
| Power BI hub | BI / Library | Explore / Compare / Open | Interactive public-safe previews | Portfolio home |
| Power BI case | BI / Decision Product | Signal / Insight / Decision | Interactive public-safe preview | BI dashboards |
| Dashboard preview | BI / Interactive Preview | Signal / Insight / Action | Synthetic interactive evidence | Project page |
| Model hub | Models / Library | Explore / Compare / Download | Governed synthetic workbooks | Portfolio home |
| Model detail | Model / Workbook | Inputs / Logic / Controls | Governed synthetic workbook | Model library |
| Blog hub | Blog / Library | Explore / Read / Continue | Editorial analysis | Portfolio home |
| Article | Blog / Article | Idea / Evidence / Takeaway | Editorial analysis | All articles |
| Deck | Blog / Interactive Story | Context / Story / Decision | Interactive editorial evidence | Article page |
| CV | Profile / CV | Experience / Evidence / Contact | Public professional profile | Portfolio home |
| Utility | Portfolio / Route | Recover / Continue / Explore | Stage review route | Portfolio home |

## Template layouts

### Hubs

Use a compact hero, one featured route, family filters or groupings, and a dense but breathable catalogue. Titles and
summaries are short. Cards expose category, decision use, evidence posture, and one clear CTA.

### Cases

Use an editorial hero followed by the strongest visual. Content reads as decision, drivers, impact, action, and controls.
Two-column sections collapse to one column below the content-driven breakpoint. Metrics are never presented without a
label that distinguishes measured, modeled, synthetic, or target values.

### Dashboard previews

Preserve the dashboard canvas and its internal interactions. Surround it with minimal dark evidence framing, a compact
context rail, and visible return path. Do not recolor charts or rewrite quantitative evidence.

### Model details

Lead with the decision use case. Present metadata as a compact strip, then show workflow, key mechanics, rendered sheets,
QA, limits, and download. Long control lists remain complete but visually secondary to the decision story.

### Articles and decks

Use an editorial reading rail, a concise summary, table of contents where available, evidence callouts, and related work.
The deck stays immersive while retaining the shared Stage shell and return path.

### CV and utility pages

Keep one primary task visible: inspect/download the CV, recover from an invalid route, or continue to the portfolio.

## Responsive behavior

- Mobile-first content order; important evidence precedes secondary metadata.
- 320-639px: one column, 16px page gutters, full-width actions, 44px minimum controls.
- 640-1023px: two-column cards where content remains readable.
- 1024px and above: editorial two-column compositions and 12-column catalogue layouts.
- Dashboard internals may scroll inside their own frame; the page itself must not overflow horizontally.
- Type and spacing use `clamp()` and content-driven breakpoints.
- Keyboard focus remains visible and logical.
- Reduced motion removes nonessential transitions.

## Motion and performance

- Motion uses transform and opacity only, normally 160-260ms with the homepage easing curve.
- No continuous scroll-linked animation is added to branch pages.
- Media below the fold remains lazy-loaded.
- Videos remain click-to-play unless the existing evidence contract explicitly requires otherwise.
- `prefers-reduced-motion` and save-data behavior remain respected.

## Safety boundary

- Stage only; production files remain untouched by the branch builder.
- Preserve `noindex, nofollow, noarchive` and disabled production analytics.
- Preserve all public-safe evidence labels, finance figures, disclaimers, hashes, and download routes.
- Do not introduce local paths, real company data, PBIX/PBIT files, secrets, or private knowledge.
- Keep existing user changes outside the Stage branch system untouched.

## Acceptance criteria

- All 84 generated routes plus the custom homepage form one coherent visual system.
- Every generated route contains exactly one shared header, one route-context rail, one content landmark, and one footer.
- Hubs are concise; detail routes preserve their evidence depth.
- The eight route templates remain visually distinct but use the same component and token contract.
- There is no page-level horizontal overflow at 320, 375, 768, 1024, or 1440px.
- Keyboard, focus, reduced motion, navigation, filters, media fallback, and existing interactions still work.
- The Stage builder tests, validator, JavaScript syntax checks, and focused browser QA pass.
