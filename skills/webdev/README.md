# 🛠️ webdev

The web engineering department head: one skill, fifteen modes — frontend, backend, fullstack, ecommerce, cms, performance, accessibility, migrations, prototype, spec, implement, deploy, funnel, onboard, audit. Stack-agnostic: uses what the project uses.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill webdev
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Build a pricing page with a plan-comparison table in our Next.js app.
```

```text
Our LCP is 4.2s on mobile — diagnose and fix.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **frontend** | build pages, components, frontend features | Frontend: implement components/pages per spec, project patterns first. |
| **backend** | APIs, data models, auth, integrations | Backend: APIs, schemas, auth, and integrations with the project's stack. |
| **fullstack** | end-to-end features | Fullstack: full features data-to-UI with the verification gate. |
| **ecommerce** | e-commerce functionality | E-commerce: catalog, cart, checkout, payments — failure states included. |
| **cms** | CMS integration and content modeling | CMS: content modeling, integration, editor experience, previews. |
| **performance** | web performance optimization | Performance: profile first, fix the measured bottleneck, verify in field data. |
| **accessibility** | accessibility audit and remediation | Accessibility: WCAG 2.2 AA audit, keyboard/contrast/semantics fixes. |
| **migrations** | site/platform/version migrations | Migrations: inventory, URL map, staged execution, rollback plan. |
| **prototype** | technical feasibility probes, riskiest-unknown-first spikes | Prototype: throwaway tracer → proven/disproven/needs-probe verdict; never ships. |
| **spec** | feature specs, build-ready scope | Spec: problem/solution/stories/seams-first/assumptions; human gate per phase. |
| **implement** | spec-to-shipped builds | Implement: vertical tracer slices, TDD at seams, review chain before done. |
| **deploy** | app-side ship, static upload | Deploy: one-command full-stack deploy, static-upload fallback, object-storage contract. |
| **funnel** | sales & conversion funnels | Funnel: high-converting lead capture, upsell/downsell sequences, and order bumps. |
| **onboard** | developer repo onboarding | Onboard: rapid codebase orientation, architecture map, and first PR readiness. |
| **audit** | responsive & technical web audit | Audit: mobile responsiveness matrix, touch target audit, and security headers. |

Chain: `prototype` → `spec` → `implement` → `qa-launch` gate. Visual prototyping lives in `design`.

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
