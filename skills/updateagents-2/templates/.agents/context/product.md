# 📦 Product Scope & Ground Truth — {{PROJECT_NAME}}

> Canonical source of truth for product scope, ICP, positioning, and traction. Every agent reads this before executing GTM, design, or engineering work.
> Every substantive claim must carry an inline tag: `[validated]` (proven with a real paying/active user who is not a friend) or `[assumption]` (working hypothesis to test).

## 1. Overview & Vision
{{PROJECT_DESC}}

## 2. Target Audience & Problem Statement
- **Industry Vertical**: {{INDUSTRY_VERTICAL}} (e.g. `developer_tools` | `b2b_saas` | `ecommerce_retail` | `professional_services` | `local_healthcare` | `creator_media`) `[assumption]`
- **Target Audience**: {{TARGET_AUDIENCE}} `[assumption]`
- **Core Problem**: {{PROBLEM_SOLVED}} `[assumption]`
- **Value Proposition**: {{VALUE_PROPOSITION}} `[assumption]`

## 3. Status Quo & Competitive Wedge
- **Status Quo (What they use today)**: {{STATUS_QUO}} `[assumption]`
- **The Villain / Breaking Point**: The specific shift, pain, or failure mode that forces them to look for a solution.
- **Why Us over Status Quo**: Unfair technical, workflow, or architectural advantage that makes switching worthwhile.

## 4. Defensibility & "Beyond the Wrapper" Wedge
- **Core Wedge**: Deep workflow integration, proprietary data pipeline, domain specialization, or latency advantage.
- **Commoditization Defense**: Why generalist models or platform giants cannot easily replace this capability.

## 5. Core Capabilities & Features
{{CORE_FEATURES}}

## 6. Traction, Retention & Strongest Proof Point
- **Current Traction**: {{TRACTION_METRICS}} `[assumption]`
- **Retention / Activation Metric**: Time-to-first-value threshold and return rate.
- **Single Strongest Asset**: {{PRIMARY_ASSET}} `[validated]`

## 7. Key Deliverables & Artifacts
{{KEY_DELIVERABLES}}

## 8. Domain Vocabulary & Key Concepts
- **{{PROJECT_NAME}}**: Primary application and governed workspace.
- **DOX Container (`.agents/`)**: Progressive disclosure documentation container maintaining durable context.
- **Vibeguard**: Zero-secret credential leakage defense protocol.

## 9. Sub-App Topology & Domain Map (Optional — Multi-App Workspaces)
> Only applicable when the project contains multiple sub-applications under `apps/`. Omit or keep empty for single-app repositories.

| Sub-App / Folder | Domain / Subdomain | Primary Role | Tech Stack | Root Dir | Dev Port |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `apps/<sub-app-1>/` | `{{DOMAIN_ROOT}}` | Primary Web Application | {{FRAMEWORK_PRIMARY}} | `apps/<sub-app-1>/` | `3000` |
| `apps/<sub-app-2>/` | `app.{{DOMAIN_ROOT}}` | Secondary Service / Subdomain | {{FRAMEWORK_SECONDARY}} | `apps/<sub-app-2>/` | `3001` |


