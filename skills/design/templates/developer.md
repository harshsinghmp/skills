# Developer Homepage & Landing Page Layout Template

> **Type**: `developer`  
> **Purpose**: Developer-first homepage and landing page layout template synthesized from Jakub Czakon's developer marketing framework and engineering ergonomics. Designed to drive developer trust, frictionless evaluation, and rapid Time to First Value (TTFV < 15 minutes).

---

## 📐 The Canonical 7-Block Developer Anatomy

Developer landing pages reject vague marketing buzzwords, stock photography, and sales gating. Every developer homepage built under this template adheres to the canonical 7-block architecture:

```
┌────────────────────────────────────────────────────────┐
│ 1. Hero Block (Clear Technical Utility & 1-Line Install)│
├────────────────────────────────────────────────────────┤
│ 2. Frictionless Demo / Playground (Show, Don't Tell)  │
├────────────────────────────────────────────────────────┤
│ 3. Architecture & Mechanics ("How It Works" Diagram)  │
├────────────────────────────────────────────────────────┤
│ 4. Code-First Feature Grid (Tabbed Code & Ergonomics) │
├────────────────────────────────────────────────────────┤
│ 5. Developer Social Proof & Open Source Trust Metrics  │
├────────────────────────────────────────────────────────┤
│ 6. Quickstart & Integration Surface (The TTFV Block)   │
├────────────────────────────────────────────────────────┤
│ 7. Transparent Pricing & Open Source License           │
└────────────────────────────────────────────────────────┘
```

---

## 🧱 The 7 Canonical Blocks in Detail

### Block 1: Hero Block (Utility First, 1-Command Install)
- **H1**: Plain-language description of the concrete technical utility (e.g., *"Automated PostgreSQL query optimization for Bun & Node.js"* — never *"The AI-powered database revolution"*).
- **Subhead**: Concrete explanation of the underlying mechanism and root problem solved (1–2 sentences max).
- **1-Command Copyable Terminal Box**:
  - Embedded above the fold with a 1-click copy button (`npx ...`, `pip install ...`, `cargo add ...`, `docker run ...`).
  - Highlights keyboard ergonomics (`Ctrl/Cmd + C` confirmation toast).
- **Dual Technical CTAs**:
  - *Primary*: `Read the Documentation` (linking directly to quickstart/guides).
  - *Secondary*: `Star on GitHub` (with live SVG star counter badge).

### Block 2: Frictionless Demo / Playground (Show, Don't Tell)
- **Zero-Signup Verification**: The developer MUST experience or see the tool working without providing an email, connecting OAuth, or entering a credit card.
- **Form Factor Options**:
  - *Interactive Playground*: In-browser WebAssembly or sandbox terminal where developers can edit an input and see instantaneous output.
  - *High-Fidelity Terminal Recording*: Lightweight SVG/Asciinema player or 15–30s clean loop demo showing real terminal interaction and exit output.
- **Immediate Latency Feedback**: Show execution speed, benchmark numbers, or real-time diagnostic output.

### Block 3: Architecture & Mechanics ("How It Works" Diagram)
- **System Architecture Visual**: Clean SVG, Mermaid diagram, or ASCII block schematic showing the system topology, protocol, and runtime boundaries.
- **Answers Core Developer Skepticism**:
  - *Data Sovereignty*: Where do my packets/data go? Does any telemetry or proprietary code leave my machine?
  - *Runtime Environment*: Is it local-first, edge-distributed, or cloud-hosted?
  - *Dependencies*: What runtime dependencies, native libraries, or daemon services are required?

### Block 4: Code-First Feature Grid (Syntax-Highlighted Ergonomics)
- **Code Side-by-Side**: Every feature card pairs a concrete technical capability with an authentic syntax-highlighted code snippet.
- **Multi-Language Tabs**: Tab switcher supporting real code in the target ecosystems (TypeScript, Python, Go, Rust, cURL, Bash).
- **Surface Real APIs**: Show typed interfaces, idiomatic error handling, CLI arguments, and configuration files (`.json`, `.yaml`, `.toml`) instead of marketing screenshots.

### Block 5: Developer Social Proof & Open Source Trust Metrics
- **Verifiable Quantitative Signals**:
  - Live GitHub stars, forks, and open PR resolution speed.
  - Package registry downloads (npm weekly, PyPI monthly, Docker pulls).
  - Community metrics: Active Discord members, GitHub contributors count.
- **Engineering Testimonials**: Quotes from named developers with their GitHub avatars, real job titles, and links to public issues, PRs, or tweets.
- **Production Badges**: Logos of engineering teams running the software in staging or production.

### Block 6: Quickstart & Integration Surface (The TTFV Block)
- **The 3-Step Setup (< 5 Minutes)**:
  1. *Step 1: Install & Config*: 1-line package install or configuration file placement.
  2. *Step 2: Initialize*: Minimal boiler-plate client instantiation (≤ 3 lines of code).
  3. *Step 3: Execute*: Invoking the primary method or CLI command and observing expected output.
- **Ecosystem Integration Marquee**: Clear compatibility matrix and logos showing seamless integration with standard tools (Docker, Kubernetes, Next.js, FastAPI, GitHub Actions, AWS, Cloudflare).

### Block 7: Transparent Pricing & Open Source License
- **Zero "Contact Sales" Paywall for Developers**:
  - Self-serve tiers must publish exact prices, bandwidth/seat limits, and consumption metrics.
- **Open Source / Community Tier**:
  - Explicit license declaration (MIT, Apache 2.0, BSD-3, AGPL).
  - Uncapped local development and self-hosted capabilities.
- **Hosted / Cloud Tier**:
  - Transparent pricing based on natural developer value metrics (API requests, compute hours, seats, storage).
- **Enterprise Expansion**: Dedicated SLA, SSO/SAML, VPC isolation, and compliance certifications (SOC2, HIPAA) for enterprise procurement.

---

## 🚫 When NOT to Use This Template (Anti-Triggers & Negative Guards)

**STRICT PROHIBITION**: This template is engineered exclusively for developers, DevOps, and technical architects.

1. **Non-Technical & Retail E-Commerce**: NEVER apply to retail, fashion, direct-to-consumer (D2C), consumer goods, or physical products. Terminal code boxes, package managers, and architecture diagrams are complete non-sequiturs for retail shoppers. (Route to `webdev:ecommerce` / Retail flow).
2. **Professional Services & Consulting**: NEVER apply to law firms, accounting practices, design/marketing agencies, or management consultancies. (Route to `brand:pipeline` / Service Lead-gen).
3. **Local Business & Healthcare/Clinics**: NEVER apply to dental clinics, trade contractors, real estate, gyms, or restaurants. (Route to Local Lead-Gen).
4. **General B2B Business SaaS**: NEVER apply to business SaaS where the buyer does not write code, manage infrastructure, or execute CLI commands (e.g. HR tools, CRM, marketing automation). (Route to `templates/saas.md`).
5. **Fall-Through Invariant**: If the target audience is not an engineer, or if the product cannot be installed or executed via code/CLI, applying `templates/developer.md` is a critical P0 design hallucination.

---

## 🚫 The Anti-Puffery Copywriting Standard

When drafting copy for developer homepages under this template:

1. **Banned Buzzwords**: Strictly ban *"revolutionary"*, *"next-gen"*, *"seamless"*, *"magical"*, *"disruptive"*, *"cutting-edge"*, and *"supercharged"*.
2. **The "Show the Code" Rule**: If a feature claim cannot be explained with a terminal command, an API endpoint, or a config snippet, rewrite or remove it.
3. **The Cynic Test**: Anticipate the *"Why not just use a bash script / SQLite / curl?"* reaction. Explicitly articulate the performance, concurrency, or scale boundary where lightweight custom solutions break down.
4. **Hard Numbers Only**: State exact latency (e.g. `24ms p99`), binary size (e.g. `4.2MB zero-dependency binary`), and memory footprint (e.g. `12MB idle RAM`).

---

## 📋 Quality Gate

- [ ] Vertical match verified: target audience is verified as software engineers/DevOps; strictly confirmed product is NOT retail, professional services, local business, or non-technical business SaaS.
- [ ] All 7 canonical blocks present in sequence (Hero → Demo → Architecture → Code Grid → Proof → Quickstart → Pricing).
- [ ] 1-command copyable installation snippet located above the fold in the Hero.
- [ ] Frictionless demo or terminal recording accessible with zero login or signup gate.
- [ ] Architecture diagram details data boundaries, runtime dependencies, and privacy.
- [ ] Feature cards display real syntax-highlighted code snippets with multi-language tabs.
- [ ] Quickstart achieves verified Time to First Value (TTFV) in < 15 minutes.
- [ ] Pricing transparently discloses open-source license, self-host terms, and self-serve tiers without a forced "Contact Sales" gate.
- [ ] Copy passed the anti-puffery linter with zero hype adjectives.
