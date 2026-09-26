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
| **Nexus**<br>*(Technical Director & Quality Review Head)* | Non-negotiable hardening gate: security vulnerability scanning, Linus-style rigorous code reviews, automated pre-flight testing, incident triage, and zero-leak credential hygiene. | `code-review`, `audit`, `qa-launch`, `muse-security`, `refactor`, `pua`, `git`, `ai-ready` |

---

<!-- agency-directory:start -->
## 📋 Canonical 46-Department Agency Directory

When triaging incoming prompts, match the user's objective to the canonical department and select the exact operating mode. Load **only** that mode's reference file into context.

### 1. Agency Delivery Division (Client Deliverables & Revenue Engines)

| Department | Canonical Modes | Council Lead | Primary Intent & Trigger Keywords | Reference Path |
| :--- | :--- | :--- | :--- | :--- |
| **`design`** | `branding`, `graphics`, `logo`, `prototype`, `slides`, `socials`, `story`, `ui`, `uikit`, `ux`, `wireframe` | **Jasper** | Full website design department: creates original visual design from a brief, idea, or reference — UI design, UX flows, wireframes, logos, brand identity, social templates, graphic assets, prototypes, component UI kits, and visual storytelling — routed through ten modes. | `design/references/<mode>.md` |
| **`paidads`** | `audit`, `extra-platforms`, `google`, `linkedin`, `meta`, `programmatic`, `reddit`, `retargeting`, `snapchat`, `tiktok`, `youtube` | **Crew & Jasper** | Full paid advertising department: builds and manages campaigns across Google, Meta (Facebook/Instagram), LinkedIn, Reddit, TikTok, Snapchat, YouTube, and programmatic — plus cross-channel retargeting, budget pacing, and account audits — routed through ten modes. | `paidads/references/<mode>.md` |
| **`seo`** | `aeo`, `audit`, `content`, `links`, `local`, `onpage`, `technical` | **Jasper** | Full SEO and AEO department: technical SEO, on-page optimization, content strategy, local SEO, link building, answer-engine optimization (AEO/GEO for AI search), and full audits — routed through seven modes. | `seo/references/<mode>.md` |
| **`webdev`** | `accessibility`, `audit`, `backend`, `cms`, `deploy`, `ecommerce`, `frontend`, `fullstack`, `funnel`, `implement`, `migrations`, `onboard`, `performance`, `prototype`, `security-headers`, `spec` | **Sol** | Full web engineering department: frontend, backend, fullstack builds with layered security, e-commerce, CMS integration, web performance, accessibility, migrations, developer onboarding, high-converting funnel pipelines, deploy, and responsive audits — routed through fifteen modes. | `webdev/references/<mode>.md` |
| **`mobile`** | `android`, `aso`, `audit`, `cross`, `ios`, `pwa` | **Sol** | Full mobile app department: iOS (SwiftUI), Android (Compose), cross-platform (React Native/Expo, Flutter), progressive web apps, and app store optimization — routed through five modes. | `mobile/references/<mode>.md` |
| **`smm`** | `analytics`, `audit`, `calendar`, `carousel`, `community`, `content`, `creator-vetting`, `influencer`, `postiz`, `social-intel`, `strategy`, `ugc` | **Jasper** | Full organic social department: platform strategy, editorial calendars, post and caption writing, community management, influencer collaboration, UGC pipelines, automated multi-channel dispatch via Postiz, autonomous 6-slide viral carousel generation via Gemini and Upload-Post, and social analytics — routed through ten modes. | `smm/references/<mode>.md` |
| **`content`** | `audit`, `blog`, `case-study`, `copy`, `email`, `humanize`, `launch`, `podcast`, `thumbnails`, `video`, `voice-archetypes` | **Jasper** | Full content studio: SEO-aware blog posts, conversion and brand copy, email campaigns, video scripts, podcast episodes, customer case studies, and prose humanization — routed through eight modes. | `content/references/<mode>.md` |
| **`analytics`** | `attribution`, `audit`, `cro`, `dashboards`, `reporting`, `tracking` | **Nexus** | Full data and analytics department: measurement tracking, dashboards, marketing attribution, performance reporting, and conversion-rate optimization — routed through five modes. | `analytics/references/<mode>.md` |
| **`automation`** | `agents`, `browser-relay`, `chatbot`, `integrations`, `prompt`, `rag`, `workflow` | **Sol** | Full automation and AI services department: workflow automation, chatbots, AI agents, retrieval-augmented generation, third-party integrations, and prompt engineering — routed through six modes. | `automation/references/<mode>.md` |
| **`devops`** | `cicd`, `cloudflare`, `domains`, `hosting`, `incident`, `monitoring`, `security` | **Sol** | Full infrastructure and reliability department: hosting and deployment, CI/CD pipelines, domains and DNS, Cloudflare edge and Workers, security hardening, monitoring and alerting, and incident response — routed through seven modes. | `devops/references/<mode>.md` |
| **`ops`** | `audit`, `contracts`, `meeting-notes`, `milestone`, `multi-client`, `obsidian`, `onboarding`, `product-marketing-template`, `proposal`, `retro`, `sow`, `vendor` | **Crew** | Internal agency operations department: client onboarding, proposals, statements of work, milestone tracking, project retrospectives, multi-client portfolio management, vendor management, and Obsidian PKM vault workflows (wikilinks, callouts, frontmatter properties, embeds, CLI automation, and plugin debugging) — routed through nine modes. | `ops/references/<mode>.md` |
| **`growth`** | `affiliates-referrals`, `audit`, `competitor`, `funnels`, `launch`, `positioning`, `pr`, `pricing`, `referral`, `retention` | **Jasper & Crew** | Full strategy and scaling department: positioning, marketing funnels, pricing, product launch, competitor analysis, referral/partnership growth, churn prevention, public relations, and growth audits — routed through nine modes. | `growth/references/<mode>.md` |
| **`qa-launch`** | `audit`, `functional`, `gate`, `matrix`, `regression` | **Nexus** | Pre-launch quality gate: cross-browser and device matrix planning, critical-path functional verification, release-gate checklist with Block-or-Ship verdict, and post-fix regression — routed through four modes. | `qa-launch/references/<mode>.md` |
| **`client-comms`** | `change`, `factual-reporting`, `feedback`, `handover`, `inbox-triage`, `status` | **Crew** | Client-facing communication: status reporting, change-request triage with scoping and approval, project handover with docs and training, and client feedback intake — routed through four modes. | `client-comms/references/<mode>.md` |
| **`gtm`** | `audit`, `handover`, `list`, `outreach`, `research`, `score` | **Crew** | Outbound GTM department: account and lead research, lead scoring with TAM and SAM sizing, cold email sequencing with deliverability, list building with hygiene and enrichment, and sales handover with context packets, routed through five modes. | `gtm/references/<mode>.md` |
| **`incident-response`** | `communicate`, `mitigate`, `retro`, `triage` | **Nexus** | Live incident command: severity triage with first-15-minutes checklist, stop-the-bleeding mitigation playbooks for outage breach data-loss and perf-collapse, severity-linked status-page and client communication, and blameless postmortem with tracked actions, routed through four modes. | `incident-response/references/<mode>.md` |
| **`database`** | `analytical`, `audit`, `diagnose`, `guard`, `index`, `operate`, `optimize`, `query`, `tuning`, `vector-search` | **Sol** | Unified database department: read-only query execution with defense-in-depth safety, schema exploration, slow-query triage with EXPLAIN ANALYZE and pg_stat_statements, missing and covering index design, RLS policy authoring with verification tests, performance optimization with memory and query tuning, and production operations with pooling partitioning and monitoring — handles Postgres, MySQL, MSSQL, and SQLite through six modes. | `database/references/<mode>.md` |
| **`telegram`** | `approve`, `hook`, `notify`, `route`, `setup` | **Sol** | Telegram messaging department: pure-bash bot alerts and approval boards via curl + jq, zero pip installs, config-file multi-bot/multi-target routing with mode-600 protection, Kafka-event routing for alert → ack → dispatch, and Claude Code hook integration for session start/end/tool-use/error notices. | `telegram/references/<mode>.md` |
| **`research`** | `audit`, `competitor-analysis`, `entity-dossier`, `market-pulse`, `user-research` | **Sol & Jasper** | Client-serving research department: user research on a client's product, market and competitive intelligence, and due-diligence dossiers — routed through three modes. | `research/references/<mode>.md` |
| **`sales-enablement`** | `audit`, `demo`, `objection`, `one-pager`, `playbook` | **Crew** | Pre-sale sales enablement department: demo scripts and narration, objection-handling handbooks, one-pagers, and sales playbooks — routed through four modes. | `sales-enablement/references/<mode>.md` |
| **`retain`** | `check-in`, `churn-watch`, `qbr`, `referral-rebuy`, `review-ask`, `value-note` | **Crew** | Post-delivery retention loop: scheduled check-ins, monthly value notes, quarterly business reviews with transcripts, delight-peak review asks, referral and repurchase offers, and churn-watch signals — routed through six modes. | `retain/references/<mode>.md` |
| **`accounts`** | `audit`, `bookkeeping`, `cashflow`, `client-pnl`, `invoicing`, `tax-compliance` | **Crew** | Agency and client financial operations engine: milestone invoicing, recurring retainer billing, Chart of Accounts bookkeeping, client profitability and P&L modeling, cash flow runway forecasting, and cross-border digital tax compliance — routed through six modes. | `accounts/references/<mode>.md` |
| **`brand`** | `accounts-access`, `audit`, `brief`, `ecommerce`, `intake`, `offboard`, `persona`, `pipeline`, `research` | **Crew & Jasper** | Client and brand lifecycle engine: comprehensive brand intake, autonomous web research, sales pipeline qualification, ad and payment account access, cross-department brief synthesis, cross-border e-commerce operations, and offboarding — routed through eight modes. | `brand/references/<mode>.md` |

---

### 2. Context Orchestration & Memory Division

| Department | Purpose & Invariant | Council Lead |
| :--- | :--- | :--- |
| **`relay`** | Bidirectional agent handoff and session resumption engine with ambient continuity. | **Sol** |
| **`context-anchor`** | Drop a working reference anchor at any point in a session to prevent cascading context drift, and park parallel client workstreams under named anchors for instant switching. | **Sol** |
| **`coupling-router`** | Coupling-aware architectural delegation and skill-stack compatibility router for multi-agent workflows. | **Sol & Nexus** |
| **`secretary`** | Evidence-grounded staff-work controller, approval gate, and universal agency dispatcher. | **Nexus & Sol** |
| **`evidence-ledger`** | Persistent per-project evidence tracking system and source-cited claim verification gate for multi-client agency workflows. | **Crew & Nexus** |

---

### 3. Core Engine & Scaffolding Division

| Department | Purpose & Invariant | Council Lead |
| :--- | :--- | :--- |
| **`updatedocs`** | Project-wide documentation synchronization, drift detection, and governance engine. | **Sol** |
| **`updateagents`** | Synchronize AI-agent instructions and project context with the actual current state of the workspace. | **Nexus** |
| **`git`** | Autonomous end-to-end Git & GitHub release engine: 9-tier anti-slop issue triage, strict 4-phase branching (dev/master/release/feat, optionally production), surgical test gating, automated doc sync, PR review gates, GitHub SEO & Open Graph asset tuning, production release cuts with semver tagging, and branch cleanup. | **Nexus** |
| **`new-project`** | Purpose-First interactive project creator, companion configurator, DOX Engine, and Agent Engine provisioner. | **Sol** |
| **`ai-ready`** | Comprehensive repository AI-readiness auditor and scaffolding engine. | **Nexus** |

---

### 4. Quality Review & Hardening Division (The Nexus Gate)

| Department | Purpose & Invariant | Council Lead |
| :--- | :--- | :--- |
| **`code-review`** | A language-agnostic code review method derived from Linus Torvalds' review corpus. | **Nexus** |
| **`gauntlet-loop`** | Bounded multi-agent quality improvement loop that prevents infinite iterations, self-grading delusions, and regression churn. | **Nexus** |
| **`dead-letter`** | Capture a failed or blocked task before it disappears. | **Nexus** |
| **`pua`** | Put your AI on a Performance Improvement Plan. | **Sol** |
| **`audit`** | Knowledge hygiene and referential integrity auditor for AI agent memory banks, documentation trees, and knowledge bases. | **Nexus** |
| **`humanize`** | Editorial review and prose humanization system that detects and eliminates AI-generated writing artifacts, formulaic patterns, significance inflation, and robotic cadence without altering facts, claims, or the author's authentic voice. | **Jasper** |
| **`muse-security`** | Unified security authority and governance engine for the agency: CVE vulnerability triage, automated remediation playbooks, Cloud WAF architectures (GCP/Cloudflare 6 pillars), static application security testing (SAST), and runtime defense guardrails — routed through six modes. | **Nexus** |

---

### 5. Interface & Visual Engineering Division

| Department | Purpose & Invariant | Council Lead |
| :--- | :--- | :--- |
| **`refactor`** | Universal refactoring engine: systematically evaluate, modernize, and refactor user interfaces, application code, software architecture, runtime performance, database schemas, and multi-page consistency — routed through seven execution modes. | **Nexus & Sol** |
| **`designscope`** | Analyze any visual source — image, website URL, or Figma file — to extract its structured design system — a design. | **Jasper** |
| **`animate`** | Design, build, review, and improve web UI animation and motion: library selection, easing/timing, and correct code for entrances, exits, micro-interactions, scroll, page transitions, hover/press states, and layout shifts. | **Jasper** |

---

### 6. Reflection & Systems Maintenance Division

| Department | Purpose & Invariant | Council Lead |
| :--- | :--- | :--- |
| **`coach`** | Daily reflective check-in and effort scorecard for developers and AI agents. | **Crew** |
| **`periodic-retreat`** | Quarterly personal and project strategic retreat facilitator. | **Sol & Crew** |
| **`clean-system-cache`** | Cross-platform developer, designer, and browser cache cleaner for Windows, Linux, and macOS. | **Sol** |
<!-- agency-directory:end -->

---

## ⚡ The 5-Step Autonomous Dispatch Protocol

When `secretary:dispatch` is activated on session launch or upon receiving a prompt:

### Step 1: Session Intake & Intent Classification
- Analyze the user prompt, issue description, or task objective.
- Identify the primary intent (e.g. *"build animated hero section"* → `animate:gsap` + `design:ui`).
- If the request is ambiguous, formulate **one** single high-leverage clarifying question before proceeding.

### Step 2: Department & Mode Selection
- Look up the matching department from the Agency Directory above.
- Resolve the exact operating mode (e.g. `webdev:funnel`, `smm:carousel`, `ops:obsidian`, `devops:cloudflare`).
- Identify the governing Council Lead (**Sol**, **Jasper**, **Crew**, or **Nexus**).

### Step 3: Progressive Disclosure Loading
- Execute `view_file` on **only** the target skill's `SKILL.md` and the designated `references/<mode>.md`.
- **DO NOT** load other modes or extraneous department files. Keep active context lean and focused.

### Step 4: Persona Execution
- Adopt the Council Lead's persona, standards, and vocabulary.
- Follow the exact technical procedures, frameworks, and safe-guards codified in that mode's reference file.
- Enforce modern-tool primacy (`rg` > `grep`, `fd` > `find`, `eza` > `ls`, `bat` > `cat`).

### Step 5: Nexus Quality Handback
- Before declaring the task complete, verify deliverable against the Nexus Quality Gate:
  1. `bun test` passes with zero failures.
  2. `bun run lint` and `bun run type-check` pass.
  3. No secrets or personal environment values committed.
  4. Changes are minimal, intentional, and documented.
- Report completion to the Principal with concrete evidence (commands executed, diff summary, test output).
