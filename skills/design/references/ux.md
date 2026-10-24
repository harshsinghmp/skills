# ux — User Experience Architecture, Research, Persona Walkthroughs & Onboarding

> **Operating Principle**: UX is the psychological and operational bridge between user intent and interface execution. A beautiful interface that confuses, exhausts, or delays the user is a failure. Every flow, layout system, and micro-interaction must minimize cognitive friction, eliminate ambiguity, and provide a clear, effortless path to value.

Consolidates all UX disciplines: **UX Architecture & Systems Foundations**, **UX Research & Heuristics**, **Cognitive Persona Walkthroughs (LIFT/Fogg/Cialdini)**, **Onboarding UX**, and **Interaction Design Patterns**.

---

## Intake & Context Discovery

Before designing flows or auditing UX:

1. **User Segments & Jobs-to-Be-Done (JTBD)**: Who are the primary personas? What specific outcome did they arrive to achieve? What is their current emotional and technical context (stressed, hurried, expert, first-timer)?
2. **Current Information Architecture (IA)**: Existing sitemap, URL paths, content hierarchy, and entry funnels (search, ads, direct, referral).
3. **Behavioral Data & Known Friction**: Drop-off rates, rage clicks, bounce rates, customer support tickets, or search query failures.
4. **Platform & Device Constraints**: Mobile-first vs desktop analytical; touch vs pointer; network constraints; operating environment.
5. **Business Boundaries**: Non-negotiable technical, compliance, or business logic constraints.

---

## Deliverables

1. **Information Architecture & Sitemap**: User-centric content hierarchy and navigation tree with $\le 3$ clicks to any core function.
2. **End-to-End User Flows**: Visual flowchart mapping entry, decision branches, happy path, edge cases, error states, and exit loops.
3. **Cognitive Walkthrough & Heuristic Audit**: Scroll-by-scroll evaluation using the 5-Second Test, LIFT Model, Fogg Behavior Model, and Nielsen Norman 10 Heuristics.
4. **Onboarding & Activation Spec**: Progressive disclosure onboarding arc, interactive empty states, and milestone checklist widgets.
5. **Interaction Pattern Specifications**: Guidelines for forms, drawers, modals, steppers, feedback toasts, and keyboard navigation.

---

## 🏛️ Pillar 1: UX Architecture & Systems Foundations (ArchitectUX)

*Creates solid, scalable, developer-ready structural foundations before visual design begins.*

### 1. Information Architecture & Navigation Rules
- **The 3-Click / 3-Level Rule**: Users must reach any primary action or content destination within $\le 3$ deliberate clicks, with navigation depth capped at $\le 3$ levels.
- **Mental Model Grouping**: Categorize content according to user vocabulary and mental models, never internal team taxonomy or organizational charts.
- **Information Scent**: Labels must accurately predict the destination's content (run open card sorts for discovery, closed card sorts for validation, and tree-testing before final navigation lock).
- **Global Navigation Hierarchy**:
  - **Primary**: Core tasks and destinations (top bar or primary sidebar).
  - **Secondary / Contextual**: Sub-features and views related to active task.
  - **Utility**: Account, settings, notifications, theme toggles.
  - **Footer**: Exhaustive sitemap, compliance, legal, support links.

### 2. Layout Systems & Responsive Breakpoint Strategy
- **4px / 8px Base Grid**: Strict spatial alignment. Intra-component spacing (inside cards/inputs) $\le$ half of inter-component spacing (between sections).
- **Responsive Fluidity & Breakpoints**:
  - Mobile (`<640px`): Single-column, bottom-thumb-zone navigation, stacked inputs, full-bleed sheets.
  - Tablet (`640px–1024px`): 2-column adaptive grids, collapsible sidebars, touch-friendly densities.
  - Desktop (`1024px–1440px`): 12-column layout, persistent navigation, multi-pane workspaces.
  - Ultra-Wide (`>1440px`): Capped readable line length (`60–75ch`), centered content boundaries, sticky contextual sidebars.
- **Mandatory Theme Ergonomics**:
  - Every layout architecture must specify **Light**, **Dark**, and **System (Auto)** modes using semantic CSS custom properties.
  - Dark mode must build elevation from lighter surface tones, never heavy blur shadows.

### 3. Developer-Ready Architecture Handoff
- Define component boundaries and clean subsystem interfaces to eliminate developer decision fatigue.
- State clear data flow contracts: loading states, error boundaries, empty states, and offline capabilities.
- Coordinate seamlessly with `webdev:frontend` and `webdev:fullstack`.

---

## 🔬 Pillar 2: UX Research & Usability Engineering (UX Researcher)

*Replaces subjective assumptions with empirical behavioral evidence and rigorous heuristic evaluation.*

### 1. The 10 Nielsen-Norman Usability Heuristics Audit
Score every screen and interaction against the 10 canonical heuristics (1–5 scale with specific remediation steps):
1. **Visibility of System Status**: Continuous, timely feedback (progress bars, spinners, sync indicators, optimistic updates).
2. **Match Between System & Real World**: Natural language, familiar conventions, logical sequencing reflecting real-world concepts.
3. **User Control & Freedom**: Prominent "emergency exits" (undo, cancel, redo, back buttons, easy modal dismissal).
4. **Consistency & Standards**: Uniform platform conventions, button behaviors, and terminology across all pages.
5. **Error Prevention**: Slip-proof design, sensible defaults, confirmation dialogs for destructive actions, real-time input masking.
6. **Recognition Rather Than Recall**: Minimize cognitive load; keep options, instructions, and past entries visible or easily retrievable.
7. **Flexibility & Efficiency of Use**: Accelerators for power users (keyboard shortcuts, `Cmd+K` command palettes, quick filters).
8. **Aesthetic & Minimalist Design**: Remove all superfluous data, ornamentation, and visual clutter that competes with primary tasks.
9. **Recognize, Diagnose & Recover from Errors**: Error messages written in plain language, indicating exact root cause and constructive solution.
10. **Help & Documentation**: Searchable, contextual, task-oriented micro-copy and FAQ assistance.

### 2. Usability Testing & Research Protocols
- **Qualitative Protocols**: Moderated think-aloud sessions, user task completion testing, retrospective interviews.
- **Quantitative Metrics**: Task Completion Rate (TCR), Time on Task (ToT), Single Ease Question (SEQ, 1–7 scale), and System Usability Scale (SUS $\ge 80$ target).
- **Inclusive Design & Accessibility Testing**:
  - WCAG 2.2 AA non-negotiable compliance.
  - 100% keyboard navigability with visible `:focus-visible` rings and zero keyboard traps.
  - Minimum touch target size $\ge 44 \times 44\text{px}$ on all mobile surfaces.
  - Semantic HTML landmarks (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`) with correct ARIA attributes.

---

## 🧠 Pillar 3: Cognitive Persona Walkthroughs & Conversion Auditing

*Simulates authentic human psychology, emotional reactions, and decision friction fold by fold.*

### 1. The 5-Second Test (Initial Snap Judgment)
Before any detailed evaluation, test the screen's first fold against the 3 instant visitor questions:
1. *What is this product/service?*
2. *Is this relevant to me and my specific problem?*
3. *What is the clear, obvious next action I should take?*
If a tired, impatient user cannot answer all three within 5 seconds, the page has an immediate clarity failure.

### 2. The LIFT Model Conversion Audit
Evaluate each scroll fold across the 6 LIFT dimensions:
- **Value Proposition** (The Hub): The perceived benefit minus perceived cost. Must be unmistakable.
- **Relevance** (Driver): Does the page content align 100% with the visitor's incoming search query or ad promise?
- **Clarity** (Driver): Visual hierarchy, scannable typography, and obvious callout of the next step.
- **Urgency** (Driver): Legitimate internal or external impetus to act now rather than postpone.
- **Anxiety** (Inhibitor): Hidden fears (price traps, security risks, spam, technical difficulty, embarrassment). Diffuse with explicit trust badges, guarantees, and clear pricing terms.
- **Distraction** (Inhibitor): Unnecessary links, competing banners, extraneous animations, or secondary CTAs that pull attention away from the primary conversion goal.

### 3. The Fogg Behavior Model ($B = \text{MAP}$)
Behavior occurs only when **Motivation**, **Ability**, and a **Prompt** converge simultaneously:
- **Motivation**: Connect directly with core human desires (pleasure/pain, hope/fear, social acceptance/rejection).
- **Ability (Simplicity)**: If motivation is low, ability must be extraordinarily high. Eliminate friction across the 6 elements of simplicity: Time, Money, Physical Effort, Brain Cycles, Social Deviance, Non-Routine Patterns.
- **Prompt**: Place actionable, low-friction triggers only when motivation and ability are aligned.

### 4. Dual-Voice Evaluation Format
When presenting a cognitive walkthrough report, maintain two distinct perspectives:
- **Persona Think-Aloud Voice**: Raw, unvarnished, authentic internal monologue of the user (e.g., *"Wait, why are they asking for my phone number before showing me the price? Forget this."*).
- **Analyst Framework Voice**: Structured diagnostic tying the reaction to specific LIFT, Fogg, or Cialdini principles with concrete engineering fixes.

---

## 🚀 Pillar 4: Onboarding UX & Adoption Flow (`onboarding-ux`)

*Drives rapid user activation and prevents post-signup abandonment.*

### 1. The 4-Stage Progressive Disclosure Onboarding Arc
1. **Welcome & Expectation Framing**: Reassure the user, confirm account creation, and state the immediate goal in 1 sentence.
2. **The AHA Moment (First Value)**: Guide the user to experience the core value of the software within $\le 90$ seconds of sign-in (e.g., sending their first invoice, generating their first diagram, running their first scan).
3. **The First Value Loop**: Complete one end-to-end task cycle with visible, rewarding output.
4. **Sticky Feature Adoption**: Contextually reveal advanced capabilities (integrations, automations, team invites) only after core value is secured.

### 2. Walkthrough Fatigue Prevention
- **Ban Mandatory Modal Tours**: Never force users through 8-step blocking popup carousels. They are dismissed instantly and create hostility.
- **Interactive Empty States**: Replace blank screens with pre-populated, editable sample data, clearly labeled with a "Load Demo Data" or "Create First Project" CTA.
- **Contextual Non-Blocking Tooltips**: Emit subtle spotlight beacons only when a user hovers or accesses a feature for the first time.
- **Persistent Progress Checklists**: Provide an unobtrusive checklist widget with clear progress status (`3 of 5 completed`) and instant gamified reward upon completion.
- **Frictionless Skip & Resume**: Always provide a prominent "Skip Setup" button that persists progress in local storage or user profile for easy resumption.

---

## 🧩 Pillar 5: Canonical UX Interaction Patterns (`ux-patterns`)

*Leverages standard, intuitive interface mechanics that users already know how to use.*

| Interaction Scenario | Recommended Pattern | Anti-Pattern to Avoid |
|:---|:---|:---|
| **Multi-Step Complex Process** | **Sequential Stepper / Wizard** with persistent progress indicator, saved drafts, and back navigation. | One giant endless form with validation errors trapped below the fold. |
| **Data Lists / Tables** | **Search + Faceted Filters + Pagination / Load More** based on user scan behavior. | Infinite scroll on data tables where footer links become impossible to click. |
| **Contextual Deep Dives** | **Slide-Over Drawer / Bottom Sheet** preserving parent page context and position. | Full-page navigation redirect that breaks the user's operational flow. |
| **Destructive Actions** | **Soft Delete + 10s Undo Toast** (reversible pit of success) or typed confirmation for catastrophic actions. | Aggressive blocking confirmation modals for routine, harmless actions. |
| **Global Navigation & Search** | **Command Palette (`Cmd+K` / `Ctrl+K`)** with fuzzy search, recent items, and direct actions. | Burying core commands 4 levels deep in submenus. |
| **Form Inputs & Validation** | **Inline Real-Time Validation on Blur** with green checkmarks and specific inline fix suggestions. | Silent forms that only display a cryptic wall of red errors after clicking Submit. |
| **Inline Editing** | **Click-to-Edit with Clear Save/Cancel Icons** and optimistic local UI updates. | Forcing the user to open a separate "Edit Profile" page to change a single text field. |
| **Long-Running Async Jobs** | **Optimistic Feedback + Background Status Indicator + Toast on Completion**. | Freezing the UI with a blocking full-screen modal until the backend finishes. |

---

## Procedure: Executing a Comprehensive UX Engagement

1. **Intake & Discovery**: Identify primary personas, business KPIs, core JTBD, and existing traffic/drop-off funnels.
2. **Audit & Walkthrough**:
   - Run the 5-Second Test on top entry pages.
   - Perform scroll-by-scroll cognitive persona walkthroughs using LIFT and Fogg frameworks.
   - Score the interface against Nielsen Norman 10 Heuristics.
3. **Information Architecture & Flow Modeling**:
   - Map end-to-end user journeys (entry $\to$ happy path $\to$ edge cases $\to$ exits).
   - Validate navigation tree against the 3-click and 3-level findability rule.
4. **Onboarding & Pattern Architecture**:
   - Structure progressive disclosure activation and design interactive empty states.
   - Specify interaction patterns (drawers, command palettes, inline validation, undo mechanisms).
5. **Handoff to Wireframe & UI**:
   - Hand verified UX architecture and flow diagrams to `design:wireframe` for grayscale structural layout, then to `design:ui` for high-fidelity tokenized visual design.

---

## Quality Gate

- [ ] Every flow maps entry points, step branches, edge cases, error states, and exit loops (no happy-path-only diagrams).
- [ ] Navigation strictly adheres to the 3-click and 3-level findability depth rules.
- [ ] 5-Second Test passed: core value proposition, audience fit, and next step obvious in $\le 5$ seconds.
- [ ] Nielsen Norman 10 Usability Heuristics scored with prioritized, concrete remediations.
- [ ] LIFT Model audit completed: high clarity & relevance, anxiety and distraction systematically eliminated.
- [ ] Onboarding flow avoids mandatory blocking modals; interactive empty states and progress checklists implemented.
- [ ] Destructive actions designed as pit-of-success: reversible with undo toasts where possible.
- [ ] Inclusive design verified: WCAG 2.2 AA compliant, full keyboard operability, touch targets $\ge 44 \times 44\text{px}$, semantic landmarks.
- [ ] Responsive behavior specified across all breakpoints (mobile, tablet, desktop, ultra-wide) with Light/Dark/System theme support.

---

## Routing

- Grayscale structural layout and wireframes $\to$ `design:wireframe`.
- High-fidelity interface design, design tokens, and components $\to$ `design:ui`.
- Component libraries and headless primitives $\to$ `design:uikit`.
- Code-level audits, visual polish, and CSS refactoring $\to$ `refactor-ui`.
- UI Motion, transitions, and micro-interactions $\to$ `animate`.
