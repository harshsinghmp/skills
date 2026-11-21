# dispatch — Universal Agency Department Directory & Autonomous Dispatcher

> **Chief of Staff Execution Engine**: On session launch or when receiving incoming agency work, `secretary:dispatch` triages user intent, maps the objective to the canonical agency department and operating mode, assigns the responsible Council Lead (**Sol**, **Jasper**, **Crew**, or **Nexus**), and selectively loads the designated mode reference document — achieving zero-friction autonomous execution with minimal token overhead.

---

## 🏛️ The Agency Council Execution Model

Every routed task is governed by one of four specialized Council Leads:

| Council Lead | Focus & Domain Expertise | Owned Departments |
| :--- | :--- | :--- |
| **Sol**<br>*(Product Architect & Full-Stack Automator)* | Next.js, React, Astro, APIs, database architectures, serverless runtimes, Workers, schema design, AI pipelines, and performance tuning. | `webdev`, `database`, `devops`, `mobile`, `automation`, `telegram` |
| **Jasper**<br>*(Creative Technologist & Growth Mastermind)* | Awwwards-level UI/UX, GSAP/SVG motion, viral social media hooks, 6-slide carousels, SEO/AEO search visibility, brand tokens, and high-conversion copywriting. | `design`, `smm`, `content`, `seo`, `brand`, `growth`, `animate`, `designscope` |
| **Crew**<br>*(Operations Lead & Client Delivery Specialist)* | Client onboarding, proposals, SOWs, milestone pacing, Obsidian knowledge vaults, gateway reconciliation, tax compliance, retention loops, and multi-client isolation. | `ops`, `accounts`, `client-comms`, `retain`, `gtm`, `sales-enablement`, `paidads` |
| **Nexus**<br>*(Technical Director & Quality Review Head)* | Non-negotiable hardening gate: security vulnerability scanning, Linus-style rigorous code reviews, automated pre-flight testing, incident triage, and zero-leak credential hygiene. | `code-review`, `audit`, `qa-launch`, `muse-security`, `refactor`, `pua`, `git`, `updateagents` |

---

<!-- agency-directory:start -->
## 📋 Canonical 46-Department Agency Directory

When triaging incoming prompts, match the user's objective to the canonical department and select the exact operating mode. Load **only** that mode's reference file into context.

---

### 1. Agency Delivery Division (Client Deliverables & Revenue Engines)

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`design`** | `3d`, `audit`, `brand-immersion`, `branding`, `canvas`, `graphics`, `logo`, `prototype`, `slides`, `socials`, `story`, `ui`, `uikit`, `ux`, `wireframe` | **Jasper** | Full website design department: creates original visual design from a brief, idea, or reference — UI design, UX flows, wireframes, logos, brand identity, social templates, graphic assets, prototypes, component UI kits, visual storytelling, dynamic visual canvas previews, and interactive 3D web scenes — routed through fifteen modes. | `design/references/<mode>.md` |
| **`paidads`** | `audit`, `extra-platforms`, `google`, `linkedin`, `meta`, `programmatic`, `reddit`, `retargeting`, `roas`, `snapchat`, `tiktok`, `youtube` | **Crew & Jasper** | Full paid advertising department: builds and manages campaigns across Google, Meta (Facebook/Instagram), LinkedIn, Reddit, TikTok, Snapchat, YouTube, and programmatic — plus cross-channel retargeting, ROAS attribution and blended CAC pacing, and account audits — routed through twelve modes. | `paidads/references/<mode>.md` |
| **`seo`** | `aeo`, `audit`, `content`, `links`, `local`, `onpage`, `programmatic`, `technical` | **Jasper** | Full SEO and AEO department: technical SEO, on-page optimization, content strategy, local SEO, link building, answer-engine optimization (AEO/GEO for AI search), programmatic SEO landing page scaling, and full audits — routed through eight modes. | `seo/references/<mode>.md` |
| **`webdev`** | `accessibility`, `audit`, `backend`, `cms`, `deploy`, `ecommerce`, `edge`, `frontend`, `fullstack`, `funnel`, `hydration-polish`, `implement`, `migrations`, `offline`, `onboard`, `performance`, `prototype`, `rate-limit`, `realtime-bus`, `security-headers`, `spec`, `technical-resilience` | **Sol** | Full web engineering department: frontend, backend, fullstack builds with layered security, e-commerce, CMS integration, web performance, accessibility, migrations, developer onboarding, funnel pipelines, edge runtime architecture, edge rate limiting, offline-first PWA caching and background sync, real-time pub/sub bus, deploy, and responsive audits — routed through twenty-two modes. | `webdev/references/<mode>.md` |
| **`mobile`** | `android`, `aso`, `audit`, `cross`, `expo`, `ios`, `pwa` | **Sol** | Full mobile app department: iOS (SwiftUI), Android (Compose), cross-platform (React Native/Expo, Flutter), Universal Expo, progressive web apps, and app store optimization — routed through seven modes. | `mobile/references/<mode>.md` |
| **`smm`** | `analytics`, `audit`, `calendar`, `carousel`, `community`, `content`, `creator-vetting`, `influencer`, `postiz`, `social-intel`, `strategy`, `ugc`, `x` | **Jasper** | Full organic social department: platform strategy, editorial calendars, post and caption writing, community management, influencer collaboration, UGC pipelines, automated multi-channel dispatch via Postiz, autonomous 6-slide viral carousel generation via Gemini and Upload-Post, X (Twitter) account growth, and social analytics — routed through thirteen modes. | `smm/references/<mode>.md` |
| **`content`** | `audit`, `blog`, `case-study`, `copy`, `email`, `frontmatter-guard`, `humanize`, `launch`, `podcast`, `thumbnails`, `ugc`, `video`, `voice-archetypes`, `vsl` | **Jasper** | Full content studio: SEO-aware blog posts, conversion and brand copy, email campaigns, video scripts, podcast episodes, customer case studies, prose humanization, high-converting video sales letters, and direct-response UGC video scripts — routed through fourteen modes. | `content/references/<mode>.md` |
| **`analytics`** | `attribution`, `attribution-graph`, `audit`, `cro`, `dashboards`, `events`, `reporting`, `tracking` | **Nexus** | Full data and analytics department: measurement tracking, dashboards, marketing attribution, performance reporting, conversion-rate optimization, server-side event ingestion, and multi-touch Shapley attribution graphs — routed through eight modes. | `analytics/references/<mode>.md` |
| **`automation`** | `agents`, `alerts`, `audit`, `browser-relay`, `chatbot`, `integrations`, `prompt`, `rag`, `realtime`, `voice`, `workflow` | **Sol** | Full automation and AI services department: workflow automation, chatbots, AI agents, retrieval-augmented generation, third-party integrations, prompt engineering, conversational voice AI agents, real-time event streaming, and multi-channel alert routing — routed through eleven modes. | `automation/references/<mode>.md` |
| **`devops`** | `audit`, `cicd`, `cloudflare`, `domains`, `edge-mesh`, `hosting`, `incident`, `monitoring`, `preview`, `security` | **Sol** | Full infrastructure and reliability department: hosting and deployment, CI/CD pipelines, domains and DNS, Cloudflare edge and Workers, distributed Anycast routing mesh, security hardening, monitoring and alerting, incident response, and living deliverable preview sandboxes — routed through ten modes. | `devops/references/<mode>.md` |
| **`ops`** | `audit`, `contracts`, `legal`, `meeting-notes`, `milestone`, `multi-client`, `obsidian`, `onboarding`, `product-marketing-template`, `proposal`, `retro`, `shape`, `sku`, `sow`, `vault`, `vendor` | **Crew** | Internal agency operations department: client onboarding, proposals, statements of work, productized agency SKU packaging and value triangulation, shaping an ambiguous ask and setting its appetite, milestone tracking, project retrospectives, multi-client portfolio management, multi-client context vault and asset fencing, vendor management, Obsidian PKM vault workflows, and agency legal templates (MSAs, subcontractor IP, NDAs, and AI disclosures) — routed through sixteen modes. | `ops/references/<mode>.md` |
| **`growth`** | `affiliates-referrals`, `audit`, `community`, `competitor`, `cro`, `funnels`, `launch`, `positioning`, `pr`, `pricing`, `programmatic-cro`, `referral`, `retention`, `viral` | **Jasper & Crew** | Full strategy and scaling department: positioning, marketing funnels, pricing, product launch, competitor analysis, referral/partnership growth, churn prevention, public relations, community building, conversion rate optimization (CRO), viral loop coefficient engineering (K-factor), and growth audits — routed through fourteen modes. | `growth/references/<mode>.md` |
| **`qa-launch`** | `audit`, `chaos`, `e2e`, `evals`, `functional`, `gate`, `matrix`, `performance`, `regression`, `vitals` | **Nexus** | Pre-launch quality gate: cross-browser and device matrix planning, critical-path functional verification, front-end performance checklist (budgets), Core Web Vitals audit and production gate (INP/CLS/LCP/fonts), AI agent evaluation and synthetic edge testing (dual-model consensus, repro packs, regression scorecards, local Ollama/vLLM adapters), chaos fault injection and resilience testing (latency jitter, 502/504 drops, DB throttling, zero data loss), release-gate checklist with Block-or-Ship verdict, post-fix regression, and Playwright smoke suites — routed through ten modes. | `qa-launch/references/<mode>.md` |
| **`client-comms`** | `audit`, `change`, `executive-pulse`, `factual-reporting`, `feedback`, `handover`, `inbox-triage`, `intake`, `proposal`, `status` | **Crew** | Client-facing communication: status reporting, change-request triage with scoping and approval, project handover with docs and training, client feedback intake, B2B proposals with stop-the-clock terms, automated onboarding intake with scope boundaries, and autonomous C-suite executive pulse briefings — routed through ten modes. | `client-comms/references/<mode>.md` |
| **`gtm`** | `audit`, `dev-to-buyer`, `discovery`, `founder-sales`, `handover`, `list`, `outreach`, `research`, `score` | **Crew** | Outbound and developer GTM department: account research, lead scoring, cold email sequencing, list hygiene, sales handover, developer customer discovery (TAB), champion enablement, and founder-led sales, routed through nine modes. | `gtm/references/<mode>.md` |
| **`incident-response`** | `audit`, `communicate`, `mitigate`, `retro`, `triage` | **Nexus** | Live incident command: severity triage with first-15-minutes checklist, stop-the-bleeding mitigation playbooks for outage breach data-loss and perf-collapse, severity-linked status-page and client communication, and blameless postmortem with tracked actions, routed through five modes. | `incident-response/references/<mode>.md` |
| **`database`** | `analytical`, `audit`, `diagnose`, `graph`, `guard`, `index`, `migrations`, `operate`, `optimize`, `query`, `tuning`, `vector-search` | **Sol** | Unified database department: read-only query execution with defense-in-depth safety, schema exploration, slow-query triage with EXPLAIN ANALYZE and pg_stat_statements, missing and covering index design, RLS policy authoring with verification tests, performance optimization with memory and query tuning, zero-downtime migration locking guards, and production operations with pooling partitioning and monitoring — handles Postgres, MySQL, MSSQL, and SQLite through twelve modes. | `database/references/<mode>.md` |
| **`telegram`** | `approve`, `audit`, `hook`, `notify`, `route`, `setup`, `webhook` | **Sol** | Telegram messaging department: pure-bash bot alerts and approval boards via curl + jq, zero pip installs, config-file multi-bot/multi-target routing with mode-600 protection, Kafka-event routing for alert → ack → dispatch, Claude Code hook integration for session start/end/tool-use/error notices, and production webhook ingress receiver with timing-safe token verification and deduplication. | `telegram/references/<mode>.md` |
| **`research`** | `audit`, `competitor-analysis`, `entity-dossier`, `market-pulse`, `user-research` | **Sol & Jasper** | Client-serving research department: user research on a client's product, market and competitive intelligence, and due-diligence dossiers — routed through five modes. | `research/references/<mode>.md` |
| **`sales-enablement`** | `audit`, `demo`, `objection`, `one-pager`, `playbook` | **Crew** | Pre-sale sales enablement department: demo scripts and narration, objection-handling handbooks, one-pagers, and sales playbooks — routed through five modes. | `sales-enablement/references/<mode>.md` |
| **`retain`** | `audit`, `check-in`, `churn-watch`, `health`, `qbr`, `referral-rebuy`, `renewal`, `review-ask`, `sla`, `value-note` | **Crew** | Post-delivery retention loop: scheduled check-ins, monthly value notes, quarterly business reviews, delight-peak review asks, referral and repurchase offers, churn-watch signals, retainer SLAs, proactive 60-day contract renewals, and client health telemetry — routed through ten modes. | `retain/references/<mode>.md` |
| **`accounts`** | `audit`, `billing-engine`, `bookkeeping`, `cashflow`, `client-pnl`, `dunning`, `invoicing`, `pricing`, `tax-compliance` | **Crew** | Agency and client financial operations engine: milestone invoicing, value-based pricing models, recurring retainer billing, Chart of Accounts bookkeeping, client profitability and P&L modeling, cash flow runway forecasting, automated dunning escalation ladders, sovereign usage-based metering, and cross-border digital tax compliance — routed through nine modes. | `accounts/references/<mode>.md` |
| **`brand`** | `accounts-access`, `assets`, `audit`, `brief`, `ecommerce`, `intake`, `offboard`, `persona`, `pipeline`, `research`, `story-engine` | **Crew & Jasper** | Client and brand lifecycle engine: comprehensive brand intake, autonomous web research, sales pipeline qualification, ad and payment account access, cross-department brief synthesis, cross-border e-commerce operations, offboarding, brand asset fencing/font auditing, and multimodal story engine genesis — routed through eleven modes. | `brand/references/<mode>.md` |
| **`crm`** | `abandon`, `audit`, `contacts`, `deliverability`, `nurture`, `onboard`, `sms`, `winback` | **Sol & Jasper** | Customer relationship management and event-driven marketing flow engine: audience segmentation, RFM scoring, welcome and activation onboarding drips, cart and checkout recovery flows, lead nurture journeys, churn winback sequences, bulk deliverability infrastructure (SPF, DKIM, DMARC, BIMI, warming curves), and transactional SMS triggers — routed through eight modes. | `crm/references/<mode>.md` |

---

### 2. Context Orchestration & Memory Division

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`relay`** | `ambient-handoff`, `audit`, `resumption-protocol` | **Sol** | Bidirectional agent handoff and session resumption engine with ambient continuity. | `relay/references/<mode>.md` |
| **`context-anchor`** | `ast-pinning-guide`, `attention-hygiene`, `deadlock-breaker`, `layering-protocol`, `observation-masking`, `prompt-cache-partitioning`, `task-interruption-and-recovery` | **Sol** | Drop a working reference anchor at any point in a session to prevent cascading context drift, and park parallel client workstreams under named anchors for instant switching. | `context-anchor/references/<mode>.md` |
| **`coupling-router`** | `coupling-matrix`, `federation`, `mesh`, `skill-compatibility-matrix`, `swarm`, `worktree-lease-protocol` | **Sol & Nexus** | Coupling-aware architectural delegation and skill-stack compatibility router for multi-agent workflows. | `coupling-router/references/<mode>.md` |
| **`secretary`** | `dispatch`, `onboard`, `orchestration`, `socratic-adversarial-gate`, `staff-work-doctrine` | **Nexus & Sol** | Evidence-grounded staff-work controller, approval gate, and universal agency dispatcher. | `secretary/references/<mode>.md` |
| **`evidence-ledger`** | `academic-citation-protocol`, `audit`, `claim-verification-taxonomy`, `evidence-entry-schema`, `skill-orchestration`, `staleness-rules` | **Crew & Nexus** | Persistent per-project evidence tracking system and source-cited claim verification gate for multi-client agency workflows. | `evidence-ledger/references/<mode>.md` |

---

### 3. Core Engine & Scaffolding Division

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`updatedocs`** | `audit` | **Sol** | Project-wide documentation synchronization, drift detection, and governance engine. | `updatedocs/references/<mode>.md` |
| **`updateagents`** | `advanced-audit-passes`, `audit`, `discovery-commands`, `docs-backlog`, `doctor`, `fast-skip-protocol`, `fourteen-asset-matrix`, `global-atoms`, `harness-hygiene`, `legacy-promotion`, `memory-file-priorities`, `onboard`, `pr-review-mining`, `skill-authoring` | **Nexus** | Universal agent context synchronization and repository AI-readiness engine. | `updateagents/references/<mode>.md` |
| **`git`** | `anti-slop-triage`, `audit`, `branching-and-release-matrix`, `conflict-resolution-and-recovery`, `convention-mining`, `exposure-audit`, `github-seo-and-presentation`, `gitignore-audit`, `history`, `issue-to-pr-discipline`, `monorepo-and-sanitization`, `pr-checks`, `report-template`, `worktree-parallel-lanes` | **Nexus** | Autonomous end-to-end Git & GitHub release engine: 9-tier anti-slop issue triage, strict 4-phase branching (dev/master/release/feat, optionally production), surgical test gating, automated doc sync, PR review gates, GitHub SEO & Open Graph asset tuning, production release cuts with semver tagging, and branch cleanup. | `git/references/<mode>.md` |
| **`new-project`** | `audit`, `client-onboarding`, `integration-blueprints`, `project-os-architecture`, `skill-extraction` | **Sol** | Project creator, client onboarding engine, companion configurator, DOX Engine, and Agent Engine provisioner. | `new-project/references/<mode>.md` |

---

### 4. Quality Review & Hardening Division (The Nexus Gate)

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`code-review`** | `agreement-review`, `boundary-governance`, `coupling-audit`, `cross-file-invariants`, `delegate`, `edr-and-execution-safety`, `fixing-findings`, `go-traps`, `intended-vs-implemented`, `multi-reviewer`, `pr-context`, `receiving-feedback`, `review-render`, `security-controls`, `security-process`, `simplify`, `skill-bundle-scan`, `themes`, `triage-matrix` | **Nexus** | A language-agnostic code review method derived from Linus Torvalds' review corpus. | `code-review/references/<mode>.md` |
| **`gauntlet-loop`** | `bar-selection-and-blind-critique`, `gauntlet-protocol`, `web-security-visual-gate` | **Nexus** | Bounded multi-agent quality improvement loop that prevents infinite iterations, self-grading delusions, and regression churn. | `gauntlet-loop/references/<mode>.md` |
| **`dead-letter`** | `circuit-breaker`, `record-schema`, `sweep-protocol` | **Nexus** | Capture a failed or blocked task before it disappears. | `dead-letter/references/<mode>.md` |
| **`pua`** | `audit`, `flavor-packs`, `receipt-verification` | **Sol** | Put your AI on a Performance Improvement Plan. | `pua/references/<mode>.md` |
| **`audit`** | `hygiene-rules`, `remediation-matrix` | **Nexus** | Knowledge hygiene and referential integrity auditor for AI agent memory banks, documentation trees, and knowledge bases. | `audit/references/<mode>.md` |
| **`humanize`** | `ast-shield-and-cadence`, `audit`, `patterns`, `style-guide`, `verification` | **Jasper** | Editorial review and prose humanization system that detects and eliminates AI-generated writing artifacts, formulaic patterns, significance inflation, and robotic cadence without altering facts, claims, or the author's authentic voice. | `humanize/references/<mode>.md` |
| **`muse-security`** | `audit`, `boundary`, `cloud-waf`, `cve`, `mcp-guard`, `remediate`, `runtime`, `sast`, `zero-trust` | **Nexus** | Unified security authority and governance engine for the agency: CVE vulnerability triage, automated remediation playbooks, Cloud WAF architectures (GCP/Cloudflare 6 pillars), static application security testing (SAST), subagent tenant boundary & worktree isolation auditing, runtime defense guardrails, dynamic MCP server governance & tool poisoning defense, and ephemeral mutual TLS zero-trust subagent attestation — routed through nine modes. | `muse-security/references/<mode>.md` |

---

### 5. Interface & Visual Engineering Division

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`refactor`** | `01-visual-hierarchy`, `02-typography-scale`, `03-color-palette`, `04-spacing-layout`, `05-button-hierarchy`, `06-visual-clutter`, `07-empty-states`, `08-shadows-elevation`, `09-contrast-accessibility`, `10-grouping-alignment`, `11-five-state-anti-slop`, `architecture`, `audit`, `code`, `database`, `modern-techniques`, `perf`, `polish`, `sweep`, `ui` | **Nexus & Sol** | Universal refactoring engine: systematically evaluate, modernize, and refactor user interfaces, application code, software architecture, runtime performance, database schemas, and multi-page consistency — routed through twenty execution modes. | `refactor/references/<mode>.md` |
| **`designscope`** | `analysis-framework`, `audit`, `capture-flows`, `element-copy`, `layout-tree-extraction`, `output-template`, `token-extraction` | **Jasper** | Analyze any visual source — image, website URL, or Figma file — to extract its structured design system — a design. | `designscope/references/<mode>.md` |
| **`animate`** | `accessibility`, `audit`, `css-animations`, `delight`, `gsap`, `mobile`, `motion-dev`, `other-libraries`, `performance`, `principles`, `review-checklist`, `technical-diagrams`, `threejs` | **Jasper** | Design, build, review, and improve web UI animation and motion: library selection, easing/timing, and correct code for entrances, exits, micro-interactions, scroll, page transitions, hover/press states, and layout shifts. | `animate/references/<mode>.md` |

---

### 6. Reflection & Systems Maintenance Division

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`coach`** | `audit`, `client`, `effort-rubric`, `founder`, `team` | **Crew** | Tri-vector autonomous agency coach and reflective check-in engine for developers, delivery squads, and agency principals. | `coach/references/<mode>.md` |
| **`periodic-retreat`** | `audit`, `retreat-framework`, `retreat-protocol` | **Sol & Crew** | Quarterly personal and project strategic retreat facilitator. | `periodic-retreat/references/<mode>.md` |
| **`clean-system-cache`** | `audit`, `candidate-catalog` | **Sol** | Self-learning cross-platform cache cleaner for Windows, Linux, and macOS. | `clean-system-cache/references/<mode>.md` |
<!-- agency-directory:end -->

---

## ⚡ The 6-Step Autonomous Dispatch Protocol

When `secretary:dispatch` is activated on session launch or upon receiving a prompt:

### Step 1: Session Intake & Intent Classification
- Analyze the user prompt, issue description, or task objective.
- Identify the primary intent (e.g. *"build animated hero section"* → `animate:gsap` + `design:ui`).
- If the request is ambiguous, formulate **one** single high-leverage clarifying question before proceeding.

### Step 2: Sub-App Intent Resolution & Scope Anchoring
- In multi-app and client workspaces, inspect `.agents/context/product.md` for the **Sub-App Topology Table**.
- Map the user intent to the matching sub-application directory (e.g. `apps/<sub-app>/` or project root).
- If the target workspace or sub-app is ambiguous, ask the user to clarify before modifying files.
- Lock active execution scope: anchor CWD to that sub-application, respect its local `.env`, and adhere to its specific framework and port.

### Step 3: Department & Mode Selection
- Look up the matching department from the Agency Directory above.
- Resolve the exact operating mode (e.g. `webdev:funnel`, `smm:carousel`, `ops:obsidian`, `devops:cloudflare`).
- Identify the governing Council Lead (**Sol**, **Jasper**, **Crew**, or **Nexus**).

### Step 4: Progressive Disclosure Loading
- Execute `view_file` on **only** the target skill's `SKILL.md` and the designated `references/<mode>.md`.
- **DO NOT** load other modes or extraneous department files. Keep active context lean and focused.

### Step 4b: Selective Brand & Accounts Context Injection
When executing client work, do NOT load the entire documentation container. Dynamically inject only the precise `.agents/brand/` and `.agents/context/` files required for the Council Lead's domain:

| Council Lead | Target Departments | Selective Context Files Ingested |
| :--- | :--- | :--- |
| **Sol** *(Product Architect)* | `webdev`, `database`, `devops`, `mobile`, `automation` | • `.agents/brand/visual-identity.md` (OKLCH color tokens, typography scales, layout rules)<br>• `.agents/context/accounts.md` (domain registrar, Cloudflare routing, staging URLs, payment gateways)<br>• `.agents/context/architecture.md` (stack invariants, DB schemas, auth providers) |
| **Jasper** *(Creative Technologist)* | `design`, `content`, `smm`, `seo`, `brand`, `growth` | • `.agents/brand/voice.md` (voice dimension sliders, vocabulary do's & don'ts, 18-token rule)<br>• `.agents/brand/messaging.md` (10s/30s elevator pitches, approved claims, quotable soundbites)<br>• `.agents/brand/social-hooks.md` (problem-agitation, contrarian, proof hooks)<br>• `.agents/brand/personas.md` (ICP avatar, daily frustrations, status triggers) |
| **Crew** *(Operations Lead)* | `ops`, `accounts`, `client-comms`, `gtm`, `sales-enablement`, `paidads`, `retain` | • `.agents/context/accounts.md` (zero-leak account delegation table, partner access IDs)<br>• `.agents/brand/personas.md` (buyer roles, BANT/MEDDIC qualification criteria, objections)<br>• `.agents/brand/positioning.md` (competitors, value prop, negative scope exclusion list) |
| **Nexus** *(Technical Director)* | `code-review`, `qa-launch`, `audit`, `muse-security` | • Audit against `.agents/brand/voice.md` (anti-puffery blacklist: no "revolutionary", "game-changing", etc.; 18-token standalone rule)<br>• Audit against `.agents/context/accounts.md` (zero raw passwords, zero credentials exposed)<br>• Audit against `.agents/brand/positioning.md` (verify PR does not violate negative scope exclusion list) |

### Step 5: Persona Execution
- Adopt the Council Lead's persona, standards, and vocabulary.
- Follow the exact technical procedures, frameworks, and safe-guards codified in that mode's reference file.
- Enforce modern-tool primacy (`rg` > `grep`, `fd` > `find`, `eza` > `ls`, `bat` > `cat`).

### Step 6: Nexus Quality Handback
- Before declaring the task complete, verify deliverable against the Nexus Quality Gate:
  1. `bun test` passes with zero failures.
  2. `bun run lint` and `bun run type-check` pass.
  3. No secrets or personal environment values committed.
  4. Changes are minimal, intentional, and documented.
- Report completion to the Principal with concrete evidence (commands executed, diff summary, test output).
