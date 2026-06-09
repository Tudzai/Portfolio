# Portfolio Agent Council

Tai lieu nay ghi lai cac agent da duoc dung de nang cap portfolio FP&A, muc tieu tung agent, tieu chi danh gia, va cach dung lai workflow nay khi muon them project moi.

## Muc Tieu Chung

Toi uu portfolio de tang xac suat pass cac role FP&A, Regional Finance Analyst, Finance BI Analyst, hoac Commercial Finance tai thi truong Singapore.

Thong diep chien luoc:

> Khong chi la nguoi build dashboard. Day la mot FP&A analyst biet bien du lieu thanh forecast call, P&L action, cash decision, governance confidence, va business partnering.

## Agent Roles

| Agent | Vai tro | Cau hoi chinh agent phai tra loi | Output mong muon |
|---|---|---|---|
| Portfolio Expert | Dinh vi tong the portfolio | Portfolio nen ke cau chuyen gi de recruiter nho? | Section uu tien, case nao nen show truoc, cach tranh portfolio bi loang |
| UI/UX Expert | Thiet ke trai nghiem doc | Recruiter scan trong 30 giay thay gi? | Layout, CTA, hierarchy, mobile behavior, cach show artifact |
| Senior Developer | Kien truc repo/static site | Folder the nao de de sua va khong publish nham data? | Folder structure, naming convention, privacy checklist |
| Manager | Quan ly scope va roadmap | Lam gi truoc de impact cao nhat? | Phasing, impact vs effort, story order |
| CFO Reviewer | Danh gia duoi goc Finance Director/CFO | CFO muon thay bang chung gi ngoai dashboard dep? | Executive memo, variance bridge, cash story, QA/governance |
| Senior FP&A | Chuyen mon FP&A | Case nao sat JD FP&A Singapore nhat? | CFO brief, EBITDA bridge, forecast model, working capital case |
| Senior Data Analyst | Data/model governance | Data synthetic nen co schema, metrics, QA checks nao? | Generated data logic, model checks, public-safe data policy |
| Product Manager | Quan ly nhieu project portfolio | Lam sao de them/sua nhieu case sau nay ma khong roi? | Case folder template, roadmap, content governance |
| AI Director | Dieu phoi cuoc thi y tuong | Y tuong nao thang neu cham da chieu? | Scoring matrix, final scope, what not to do |

## Contest Rubric

Ham cham diem cua agent council:

| Tieu chi | Trong so | Y nghia |
|---|---:|---|
| Recruiter impact | 30% | Co giup recruiter Singapore thay nang luc FP&A nhanh hon khong? |
| CFO credibility | 25% | Co the hien finance judgment, decision support, cash/P&L ownership khong? |
| Portfolio clarity | 15% | Co de scan, de hieu, de nho khong? |
| Implementation speed | 10% | Co trien khai duoc nhanh tren static GitHub Pages khong? |
| Maintainability | 10% | Sau nay co de sua/them project khong? |
| Data safety | 10% | Co tranh publish nham raw data, PBIX, local path, confidential info khong? |

## Winning Scope

Y tuong thang cuoc:

```text
CFO Performance Pack / Executive FP&A Decision Cases
```

Ly do thang:

- Power BI dep chua du de noi bat.
- FP&A Singapore can thay budgeting, forecasting, variance analysis, business partnering, stakeholder action, Power BI/SQL/Python, working capital/cash, va forecast accuracy.
- Bo case nay chung minh duoc ca finance judgment lan data execution.

Da trien khai:

| Hang muc | Muc tieu tuyen dung | Folder |
|---|---|---|
| Logistics Margin Reset | CFO memo, P&L action, cash priority, QA evidence | `showcase/fpa-decision-cases/logistics-margin-reset/` |
| EBITDA Variance Bridge | Core FP&A skill: variance -> driver -> owner -> action | `showcase/fpa-decision-cases/ebitda-variance-bridge/` |
| Working Capital Cash Runway | Khac biet hoa profile logistics FP&A bang cash discipline | `showcase/fpa-decision-cases/working-capital-cash-runway/` |
| Generated Excel Model | Cho thay audit trail va model logic dang sau case | `showcase/fpa-decision-cases/logistics-margin-reset/model/generated-fpa-model.xlsx` |

## Agent Recommendations Summary

### Portfolio Expert

Khuyen nghi:

- Bien portfolio thanh "decision products", khong chi project gallery.
- Dua BI products va FP&A decision cases len truoc experience/skills.
- Tranh show qua nhieu tool neu khong gan voi business decision.

High-signal sections:

- BI Decision Products Gallery
- Driver-Based Forecasting Case Study
- Monthly FP&A Close Pack Demo
- Finance Automation Workflow Page
- FP&A Writing & Business Partnering Samples

### UI/UX Expert

Khuyen nghi:

- Portfolio nen giong mini CFO operating pack.
- Moi artifact can co headline metric, executive question, proof points, CTA.
- Tren mobile, moi card chi nen con screenshot/headline, 1-2 metrics, 1 CTA.

Suggested flow:

```text
Hero -> Impact -> Executive FP&A Decision Cases -> BI Products -> Work -> Process -> Skills -> Contact
```

### Senior Developer

Khuyen nghi:

- Khong publish nguyen folder `BI/`.
- Public artifacts nen nam trong `showcase/`.
- Dung lowercase kebab-case cho folders.
- Khong dung URL co dau, space, comma.
- Khong `git add .` khi source BI/raw data con trong repo.

Privacy rules:

- Khong publish `.pbix`, `.pbit`, raw CSV, prepared CSV, real customer names, local paths, SecurityBindings, user settings.
- Neu file nam trong GitHub Pages branch, xem nhu public.

### Manager

Khuyen nghi:

- Phase 1 nen lam it nhung sac: hero/story, BI products, decision cases.
- Khong bien portfolio thanh kho archive.
- Moi case chi can tra loi 4 cau: problem, what I built, impact, proof.

Roadmap:

1. Privacy gate.
2. Homepage story.
3. BI product case pages.
4. Executive FP&A decision cases.
5. Optional video/demo/certification polish.

### CFO Reviewer

Khuyen nghi:

- CFO khong chi can dashboard. CFO can "so what / now what".
- Portfolio phai show forecast ownership, margin action, cash discipline, governance confidence.

Top ideas by CFO value:

| Idea | CFO value |
|---|---:|
| 1-page Executive Memo | 9.5/10 |
| Driver-Based Forecast Model | 9.5/10 |
| EBITDA Variance Bridge | 9.0/10 |
| Working Capital / Cash Story | 8.8/10 |
| Customer / Service Profitability Action List | 8.7/10 |
| Governance / QA Pack | 8.2/10 |

### Senior FP&A

Khuyen nghi:

- Them lop executive FP&A storytelling len tren Power BI.
- Strongest homepage section: `Executive FP&A Decision Cases`.
- Case phai noi duoc variance voi business owner va next action.

Best cases:

- CFO Decision Brief
- EBITDA Variance Bridge + Action Plan
- Working Capital & Cash Control
- Driver-Based Forecast: From Assumptions to Decisions
- Business Partnering Review Pack

### Senior Data Analyst

Khuyen nghi:

- Dung mot synthetic FP&A case pack chung, khong lam nhieu demo roi rac.
- Excel model la audit trail; HTML page la executive narrative.

Suggested data/model checks:

- P&L tie-out: revenue - direct cost - opex = EBITDA
- Bridge tie-out: bridge drivers sum to final variance
- Cash roll-forward: opening cash + inflows - outflows = closing cash
- Working capital tie-out
- Scenario completeness
- Public-safe check

### Product Manager

Khuyen nghi:

- Gom case theo decision topic.
- Moi case nen co `index.html`, optional `model.html`, va `model/`.
- Ten case nen noi ve quyet dinh, khong noi ve tool.

Recommended naming:

```text
showcase/fpa-decision-cases/{decision-topic}/
```

Vi du:

- `logistics-margin-reset`
- `working-capital-cash-runway`
- `branch-target-allocation`
- `headcount-capacity-tradeoff`

### AI Director

Final verdict:

```text
Winner: CFO Performance Pack
```

Scope thang:

- CFO Brief
- Driver-Based Forecast
- EBITDA Variance Bridge
- Working Capital / Cash
- Governance / QA
- Business Partnering

Khong nen lam:

- Khong lam portfolio automation generic.
- Khong lam 6 case roi rac thieu narrative.
- Khong lead bang code truoc business judgment.
- Khong neu variance ma thieu owner/action.
- Khong publish data that/confidential.

## Reusable Workflow For Future Projects

Khi them project moi vao portfolio, dung flow nay:

1. Define decision:
   - CFO hoac business leader can quyet dinh gi?

2. Define data:
   - Data that da anonymized hay synthetic?
   - Co customer/entity/vendor that khong?

3. Define model:
   - Driver nao anh huong revenue, margin, EBITDA, cash?
   - Co scenario khong?
   - Co QA checks khong?

4. Define narrative:
   - What changed?
   - Why did it change?
   - Financial impact?
   - Owner?
   - Next action?

5. Define artifact:
   - HTML case page
   - Excel model
   - Dashboard screenshot
   - QA notes

6. Run privacy gate:
   - Khong local path
   - Khong secret/token
   - Khong raw data
   - Khong PBIX/PBIT chua imported data
   - Khong company-confidential details

## Suggested Next Agents To Run

Neu muon nang portfolio tiep, goi cac agent theo thu tu:

1. CFO Reviewer:
   - Cham case co du "so what / now what" chua.

2. UI/UX Expert:
   - Cham card layout, CTA, mobile scan.

3. Senior FP&A:
   - Cham sat JD Singapore chua.

4. Senior Developer:
   - Kiem folder, privacy, links, deploy.

5. AI Director:
   - Chon scope cuoi cung, tranh overbuild.

## Current Portfolio Positioning

Current winning positioning:

```text
Commercial FP&A analyst building CFO-ready reporting, driver-based forecasts,
Power BI decision products, and finance automation for multi-entity logistics operations.
```

Best evidence currently on site:

- Executive FP&A Decision Cases
- Monthly FP&A Performance Pack
- Driver-Based Forecasting & Scenario Planning
- Monthly reporting automation pipeline
- Budgeting/forecasting and management reporting experience

## Maintenance Notes

Important folders:

```text
showcase/fpa-decision-cases/
showcase/powerbi/
assets/
BI/  # ignored source workspace, do not publish
```

Before pushing:

```powershell
git status --short --ignored
git diff --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached --name-only | rg "BI/|\.csv$|\.pbix$|\.pbit$|build/tools|scratch|user_settings|SecurityBindings"
rg -n -i "(password|secret|token|api[_-]?key|credential|connectionString|C:\\\\|OneDrive|file://)" index.html styles.css script.js showcase assets
```

If the scan flags expected words like `email` in UI text or `invoice` in a privacy note, review manually. If it flags local paths, secrets, raw files, or real company data, fix before push.
