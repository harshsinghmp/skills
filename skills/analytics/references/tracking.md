# tracking — Tracking: a decision-driven event plan, implemented and verified live.

## Intake

- Questions the data must answer and their decisions
- Platform (GA4, GTM, product analytics) and access
- Key user actions across the funnel
- Consent/privacy requirements (GDPR/CCPA)
- Default stack: GA4 plus PostHog/Openpanel for product events, warehouse BigQuery/ClickHouse; else any event collector plus a SQL warehouse.

## Deliverable

A tracking plan: a table of events with parameters, trigger conditions, owning funnel step, and the decision each supports — plus implementation (GTM/GA4/product events) and live verification (DebugView/preview evidence).

## Procedure

1. List the questions and the decision each drives; derive the events from those, not from what's easy.
2. Write the event table: name, trigger, parameters, funnel step, decision supported.
3. Define the key conversions and mark them; avoid duplicate/mirror events.
4. Implement via GTM or the app's analytics SDK, following the existing naming convention.
5. Set consent gating and filter internal traffic before launch.
6. Verify in GA4 DebugView / GTM preview on the live site — real events, real parameters.
7. Document the plan and hand it to whoever reads the data.
8. Architect Developer DREAM Funnel Telemetry (source: developer adoption standard):
When instrumenting developer tools, APIs, open-source libraries, or CLI agents, map events to the 5-stage **DREAM Funnel**:
- **Discover (D)**: How developers encounter the tool.
  - Events: `repo_view`, `docs_entry`, `registry_download`.
  - Parameters: `referrer_source`, `search_query_param`, `campaign_tag`.
- **Research (R)**: Evaluating documentation and feasibility before code execution.
  - Events: `quickstart_viewed`, `api_reference_explored`, `architecture_doc_read`.
  - Parameters: `docs_section`, `scroll_depth_pct`, `dwell_time_seconds`.
- **Evaluate (E)**: First hands-on execution (The TTFV Phase).
  - Events: `cli_install_started`, `cli_install_success`, `hello_world_executed`, `first_api_call_success`.
  - Parameters: `ttfv_seconds` (time from docs entry to successful run, target < 900s / 15m), `os_platform`, `node_version`, `exit_code`, `error_type`.
- **Adopt (A)**: Embedded usage in real projects or daily developer loops.
  - Events: `project_init_completed`, `recurring_command_executed`, `ci_pipeline_integrated`, `team_member_invited`.
  - Parameters: `invocation_frequency_7d`, `integration_type`, `repo_size_bucket`.
- **Monetize (M)**: Transition from free/OSS developer to commercial buyer.
  - Events: `tier_limit_reached`, `enterprise_feature_clicked`, `champion_packet_downloaded`, `upgrade_initiated`.
  - Parameters: `feature_name`, `team_seat_count`, `usage_threshold_pct`.
9. Enforce Zero-Leak Telemetry Protocol (Vibeguard Protocol):
- Never capture, transmit, or store source code, environment variables, API tokens (`sk-*`, `ghp_*`), database URLs, local file paths with usernames, or PII.
- Only transmit anonymized metadata: hashed machine ID, OS platform, package version, command duration, and sanitized error categories.
10. Enforce UTM Parameter Hygiene & Anti-Fragmentation Standards:
- **Canonical Lowercase & Slugification**: Always lowercase and hyphenate `utm_source`, `utm_medium`, and `utm_campaign` to prevent GA4 channel fragmentation into `(Other)`.
- **Standard GA4 Mediums**: Enforce recognized mediums (`cpc`, `organic`, `organic-social`, `paidsocial`, `email`, `referral`).
- **Zero Internal UTMs**: Strictly ban UTM parameters on internal site navigation (resets sessions and overwrites user attribution).
- **PII Scrubbing**: Automatically scrub user emails, phone numbers, and auth tokens from URL search parameters (`utm-sanitizer.ts`).

## Quality gate

- [ ] Every event maps to a decision.
- [ ] Event table documents name/trigger/params/funnel step.
- [ ] No duplicate or double-firing conversions.
- [ ] Consent and internal-traffic filtering in place.
- [ ] Verified live in DebugView/preview, with evidence.
- [ ] For developer tools: DREAM adoption stages mapped (Discover, Research, Evaluate, Adopt, Monetize).
- [ ] TTFV (Time to First Value) latency instrumented with < 15 minute target.
- [ ] Telemetry sanitization verified: zero source code, secrets, or PII transmitted.
- [ ] Campaign URLs sanitized via `utm-sanitizer` CLI: strictly lowercased, standard mediums, zero internal UTM traps, zero PII query leaks.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
