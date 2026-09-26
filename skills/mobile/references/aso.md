# aso — App Store Optimization (ASO) & Conversion Rate Playbook

One unified head reference for App Store Optimization across iOS App Store and Google Play Store: keyword indexing algorithms, metadata architecture, visual asset conversion psychology, ratings velocity loops, and Store Listing A/B experiments.

---

## Intake & Store Audit

Before drafting or changing ASO metadata:
1. **Current Listing & Conversion Stats**: Impressions, Product Page Views, Conversion Rate (Impressions → Installs), and Organic vs. Paid split.
2. **Platform Target**: iOS App Store (strict 100-char keyword field, 30-char title/subtitle) vs. Google Play Store (algorithm crawls Title, Short Description, Long Description with density rules).
3. **Maturity Tier Declaration**:
   - **Dominant**: Defend branded keywords, category leadership, and seasonal creative updates.
   - **Established**: Close keyword gaps vs. leaders, test high-converting screenshots, and localize top 5 markets.
   - **Challenger**: Long-tail keyword intent, radical visual differentiation, and aggressive ratings velocity.
4. **Competitor Gaps**: Identify top 3 category competitors and extract keywords they rank for that you lack.

---

## Deliverables

- **Metadata Architecture Packet**: Approved Title, Subtitle, Short Description, Keyword Field, and Long Description per store.
- **Visual Asset Creative Brief**: Icon specifications, 5–8 screenshot storytelling narrative, and preview video script.
- **Ratings & Review Strategy**: Policy-compliant in-app trigger points and public review response templates.
- **Store Listing Experiment (A/B Test) Plan**: Single-variable hypothesis, sample size requirement, and primary conversion metric.

---

## Procedure

### 1. Store Indexing & Metadata Architecture

| Field | iOS App Store Rules | Google Play Store Rules |
|:---|:---|:---|
| **App Title** | 30 chars max. Brand Name + Primary Keyword. Highest ranking weight. | 30 chars max. Brand Name + Core Benefit/Keyword. Highest ranking weight. |
| **Subtitle / Short Desc** | 30 chars max. Value proposition + secondary keyword. High ranking weight. | 80 chars max. Summary hook. Indexed heavily for search ranking. |
| **Keyword Field** | 100 chars, comma-separated (no spaces after commas, no plurals/duplicate words). | *None* (Index built from keyword repetition in descriptions). |
| **Long Description** | 4,000 chars. **NOT** indexed for keyword search; purely for user conversion and Apple editorial. | 4,000 chars. **INDEXED**. Target 2–3% density for primary keywords. Avoid keyword stuffing (>5% triggers penalty). |

#### Metadata Formula
- **iOS Title**: `[Brand]: [Primary Keyword Category]` *(e.g., "Muse: Task & Habit Tracker")*
- **iOS Subtitle**: `[Core Action Verb] + [Benefit]` *(e.g., "Plan Your Day & Build Streaks")*
- **iOS Keyword Field Syntax**: `task,habit,daily,planner,routine,calendar,focus,productivity` *(no spaces, no quotes, singular form only)*.
- **Google Play Short Description**: `The simple habit tracker to organize daily routines, boost focus, and hit goals.`

---

### 2. Visual Asset Conversion Psychology

Visual assets account for over 85% of install decisions. Every asset must sell a specific benefit, not just display UI:

#### App Icon Design Principles
- **Clarity at Micro-Scales**: Must be instantly recognizable at 16×16px (search results) and 60×60px (home screen).
- **Single Focal Element**: One bold glyph or mascot; avoid complex scenes or embedded text.
- **Contrast Border & Platform Consistency**: Vibrant OKLCH palette standing out against dark/light system wallpapers.

#### 5-to-8 Screenshot Storytelling Sequence
Users rarely scroll past the first 3 screenshots. Frame them like a graphic novel:
1. **Screenshot 1 (The Anchor Hook)**: The single most compelling promise or solution to the user's core problem.
2. **Screenshot 2 (The Core Workflow)**: The primary feature in action with clean UI and high-contrast caption.
3. **Screenshot 3 (The Differentiator)**: The unique feature competitors lack (e.g., AI automation, offline privacy).
4. **Screenshot 4 (Customization & Control)**: Dashboards, widgets, themes, or personalization options.
5. **Screenshot 5 (Social Proof & Trust)**: Ratings, awards, community scale, or security compliance.

*Rule: Place the value-caption above the device mockup using large, legible typography.*

---

### 3. Ratings Velocity & In-App Prompt Psychology

High ratings (>4.5 stars) and fresh review velocity directly boost organic search rank and conversion.

#### When to Prompt for Ratings (The Moment of Delight)
- ✅ **DO**: Trigger native `SKStoreReviewController` (iOS) or `ReviewManager` (Android) immediately following a success state:
  - User completes a 7-day streak.
  - User successfully exports or ships a project.
  - User clears all tasks or hits a personal best.
- ❌ **DO NOT**:
  - Never prompt on app launch or startup.
  - Never prompt during an active workflow or form entry.
  - Never prompt after a crash or error state.
  - Never gate with non-compliant "pre-rating dialogs" (Apple rejects review-filtering apps).

#### Public Review Response Framework
Reviews are a public sales surface. Prospective downloaders read developer responses to negative reviews:
- **1–2 Star Bug Report**: Acknowledge issue immediately, provide exact fix version or direct support email without defensive excuses.
- **5-Star Praise**: Thank the user by name, mention a complementary upcoming feature, and reinforce brand warmth.

---

### 4. Systematic Store Listing A/B Experiments

Never guess listing changes. Run structured tests:
- **iOS**: Apple Product Page Optimization (PPO) in App Store Connect.
- **Android**: Google Play Store Listing Experiments.
- **Rule of Single-Variable Testing**: Test *only* the Icon, or *only* the first 2 Screenshots, or *only* the Short Description. Testing multiple variables simultaneously invalidates statistical attribution.
- **Sample Size Gate**: Run until >=95% statistical confidence with at least 500 installs per variant.

---

### 5. International Localization Matrix

Do not translate the entire app before verifying demand. Execute **Tiered Metadata Localization**:
1. **Tier 1 (Instant ROI)**: Localize App Title, Subtitle/Short Description, Keywords, and localized screenshot captions for top markets (e.g., Japan, Germany, Brazil, France).
2. **Tier 2 (Full Store Presence)**: Localize Long Description and produce locale-specific preview videos.
3. **Tier 3 (In-App Localized Strings)**: Translate application UI once organic install velocity validates market appetite.

---

## Quality Gate

- [ ] iOS keyword field is strictly under 100 characters, comma-separated with zero spaces or duplicate words.
- [ ] App titles comply with the 30-character hard limit on both stores.
- [ ] First 2 screenshots communicate the core value proposition without requiring zoom.
- [ ] Ratings prompts are verified to fire only on positive user milestones.
- [ ] Single-variable test hypothesis documented before deploying metadata updates.
- [ ] Localization uses authentic native terminology, not raw machine-translated keyword lists.
