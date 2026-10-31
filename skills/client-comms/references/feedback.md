# feedback — Client feedback intake: structured capture, triage, and translation matrix.

## Intake

- Raw feedback (review call transcript, Loom video notes, email snippets, Slack threads, NPS comments)
- Target milestone or page/component URL
- Response owner, budget boundary, and turnaround deadline

## Deliverable

1. **Feedback Translation Contract**: Unstructured or subjective client remarks translated into objective engineering diagnostics, target components, and anti-drift boundaries.
2. **Feedback Triage Ledger**: Each item triaged as `ACCEPTED` (routed with owner and spec), `DECLINED` (honest reason with tradeoffs), or `CLARIFY` (narrow unblocking question).
3. **Client-Facing Response Packet**: Written in polished, non-defensive client language confirming understanding, timelines, and next steps.

---

## 🧭 The Non-Technical Feedback Translation Matrix

Clients speak in emotional and colloquial terms; engineers build against ASTs, styles, and data structures. Never pass raw client colloquialisms directly to an AI coding agent without translating them through this matrix:

| Client Phrasing | Diagnostic Translation | Typical Engineering Fix | Strict Anti-Drift Boundary |
|:---|:---|:---|:---|
| *"Make it pop"* | Low visual contrast, missing micro-interactions, flat hierarchy | Increase typography weight contrast, add hover/focus transitions (`transition-all duration-200`), elevate active card z-depth | Do NOT change brand colors or rewrite page structure |
| *"Feels clunky / laggy"* | Cumulative Layout Shift (CLS), unthrottled scroll listeners, missing skeleton states | Add explicit image aspect-ratios, debounce event handlers, inject loading skeletons | Do NOT introduce a new state-management library |
| *"Looks weird on my phone"* | Horizontal viewport overflow (`scrollWidth > innerWidth`), unpadded touch targets (< 48px), fixed pixel widths | Set `overflow-x-clip`, convert fixed widths to `max-w-full`, ensure minimum touch targets | Do NOT remove desktop layout styling or hide content |
| *"Too busy / cluttered"* | Inconsistent whitespace scale, competing visual focal points, lack of grouping | Increase section padding using spacing scale (`gap-8`, `py-16`), group secondary actions into a dropdown | Do NOT delete client copy or required actions |
| *"Hard to read"* | Text contrast ratio fails WCAG 2.2 AA (< 4.5:1), font size too small on mobile (< 16px), line-length too wide (> 75ch) | Set text color to token foreground, set `max-w-prose`, enforce 16px mobile body font | Do NOT change typeface or font family |
| *"Doesn't look professional"* | Misaligned grid elements, missing subtle border definitions, harsh primary drop shadows | Align elements to 8pt/12-column grid, use ambient diffuse shadows (`shadow-sm`, subtle border `border-border/50`) | Do NOT re-theme the entire application |

---

## 📋 The Typed Feedback Translation Contract

When processing client review notes, generate a structured contract before dispatching any subagent or opening any file:

```json
{
  "feedbackId": "fb-20260930-01",
  "clientVerbatim": "The hero section feels completely empty and boring on mobile.",
  "translation": {
    "intent": "Enhance visual hierarchy and mobile density in Hero component",
    "technicalRootCause": "Padding is too large on viewports < 640px, causing hero text and CTA to push below the fold without visual anchors.",
    "targetFiles": [
      "src/components/landing/Hero.astro",
      "src/styles/tokens.css"
    ],
    "antiDriftBoundary": "Modify ONLY padding and mobile typography in Hero.astro. Do NOT touch navbar, footer, or global typography.",
    "acceptanceCriteria": [
      "Hero CTA button is visible above 600px viewport fold without scrolling",
      "Mobile padding reduced from py-24 to py-12 on screens < 640px",
      "Zero horizontal layout overflow on 390px viewport"
    ]
  },
  "verdict": "ACCEPTED",
  "assignedLead": "Jasper",
  "turnaroundHours": 4
}
```

---

## Procedure

1. **Capture Verbatim First**: Record the client's exact words without editing or summarizing away nuance.
2. **Translate to Objective Diagnostics**: Run every comment through the Feedback Translation Matrix to identify the underlying technical symptom and target files.
3. **Establish Anti-Drift Boundary**: Explicitly lock which files and subsystems the agent is *forbidden* to touch, preventing AI scope creep.
4. **Triage Verdict**:
   - `ACCEPTED`: Scope fits within contract/milestone; emit translation contract and dispatch.
   - `DECLINED`: Out of scope or breaks system integrity; articulate the trade-off clearly and honestly (e.g., *"Adding that video background directly increases mobile load time by ~2.4s and violates our 95+ Core Web Vitals target; here is an optimized ambient CSS alternative"*).
   - `CLARIFY`: Provide 2-3 visual choices or a 1-minute Loom to align expectations before code mutation.
5. **Client Response Draft**: Draft client communication in grade-5 shape (What was updated / Why / How to review on staging).

---

## 🛡️ The Diplomatic Scope Shield & Script Matrix

Client feedback frequently conceals scope creep, direct-ping boundary breaches, or internal stakeholder conflicts. Use these verified scripts:

### 1. "Just One Quick Tweak" DM Scope Shield
When a client requests out-of-scope work in DMs or Slack threads:
> *"We’d love to incorporate this! Because this touches our core data flow / layout structure beyond the active Milestone 1 agreement, we’ve logged it in our backlog. We can either swap it with an existing lower-priority feature to keep our Friday launch on track, or quote it as a quick Change Order ($X / +Y days). Let us know which direction you prefer!"*

### 2. The Blocking Asset Ghosting Sequence
When engineering velocity stalls waiting for client-provided assets (copy, credentials, photography):
- **Day 3 (Gentle Reminder)**: List missing assets explicitly with instructions on where to upload.
- **Day 7 (Milestone Impact Notice)**: Notify client that project completion shifts day-for-day: *"Because development is blocked on [assets], our target launch moves from Oct 12 to Oct 16 to maintain quality."*
- **Day 14 (Project Pause & Capacity Reallocation)**: Formal freeze notice: *"Development is officially paused to release active engineering capacity. Once assets are provided, we will schedule a new restart kickoff (typically 3–5 business days lead time)."*

### 3. Stakeholder Contradiction Freeze Protocol
When multiple client stakeholders provide contradictory feedback (e.g. CEO vs Marketing Lead in Figma or Slack):
1. **Immediate Freeze**: Instantly freeze active development on the disputed component.
2. **Notification to Primary Signer**: *"Stakeholder A requested X while Stakeholder B requested Y. To preserve your budget and prevent rework, development on this section is paused until you confirm the unified direction in writing."*

### 4. Direct-Ping Boundary Reinforcement
When clients bypass the PM to ping junior developers directly:
> *"Hey [Client], thanks for flagging this! To make sure your request is tracked, prioritized, and tested against our staging build, I’ve routed this to our central sprint board. Please post all requests in #project-feed so the whole team stays aligned."*

### 5. Post-Launch Bug Warranty vs Paid Retainer SLA
When clients report issues months after launch:
- **Within 30 Days**: Free remediation of reproducible bugs violating the signed SOW acceptance criteria.
- **Post-30 Days**: *"The 30-day warranty window concluded on [Date]. We’d be delighted to investigate and resolve this under our monthly Maintenance & Support SLA or a one-off sprint block."*

---

## Quality Gate

- [ ] Every client remark has an explicit `ACCEPTED`, `DECLINED`, or `CLARIFY` verdict.
- [ ] Every `ACCEPTED` item has an Anti-Drift Boundary locking unaffected files.
- [ ] Declines cite architectural, performance, or scope trade-offs, never excuses.
- [ ] Conflicting stakeholder requests routed to the Stakeholder Contradiction Freeze protocol.
- [ ] Client response contains zero internal developer jargon or LLM tool names.

