# community — Community Architecture, Member Lifecycle & Engagement Loops

One unified playbook for architecting, onboarding, engaging, and retaining thriving communities across Discord, Skool, Slack, and Circle. "A product gives people tools; a community gives people an identity, belonging, and peer accountability."

---

## Intake

Before deploying a community strategy, establish:
1. **Platform Selection & Rationale**:
   - **Discord**: Technical developers, gamers, Web3, creator hubs needing voice channels and granular bots/roles.
   - **Skool**: Paid masterminds, course cohorts, and creators prioritizing gamification, leaderboards, and zero-distraction simplicity.
   - **Slack**: B2B professionals, executives, client advisory boards, and enterprise networking groups.
   - **Circle**: Creator memberships, premium courses, and events requiring clean forum layouts and integrated paywalls.
2. **Member Archetype**: Who is the ideal member? What is their burning problem, core aspiration, and definition of peer status?
3. **Core Transformation & Purpose**: What transformation does this community promise that members cannot achieve alone?
4. **Resourcing & Host Capacity**: Dedicated community manager vs. founder-led office hours. Cadence of live touchpoints.

---

## Deliverable

- **Channel Architecture Blueprint**: High-signal, low-clutter taxonomy designed for intuitive navigation.
- **Onboarding Journey (Day 1 → Day 30)**: Automated welcome DM, role-gating, introduction prompts, and first-win trigger.
- **Recurring Engagement Calendar**: Weekly engagement loops, AMAs, member spotlights, and co-working sprints.
- **Retention & Inactivity Playbook**: 14-day and 30-day disengagement detection and warm reactivation outreach.
- **Moderation Protocol & Guardrails**: AutoMod filters, spam mitigation, escalation ladder, and code of conduct.

---

## Procedure

### 1. High-Signal Channel Architecture

Avoid the "ghost town" trap of having 30 empty channels. Launch lean and expand only when channel volume exceeds 50 messages/day.

#### Canonical 5-Category Structure:
1. **🏛️ START HERE (Read-Only / Guided)**
   - `#welcome-rules`: Community manifesto, zero-tolerance rules, verification button.
   - `#announcements`: High-priority updates, product drops, event schedules.
   - `#introductions`: Structured template prompt for all newcomers.
2. **💬 GENERAL / CONNECTION**
   - `#lounge` or `#general`: Casual serendipitous chatter and industry news.
   - `#wins-and-milestones`: Social proof, client wins, case study celebrations.
   - `#ask-the-community`: Peer problem-solving and technical Q&A.
3. **📚 LEARNING / CONTENT**
   - `#resources`: Vetted templates, playbooks, tools, and recordings.
   - `#hot-seats-amas`: Q&A threads before live calls.
4. **🤝 COLLABORATION / ACCOUNTABILITY**
   - `#feedback-exchange`: Peer review for copy, designs, code, and landing pages.
   - `#accountability-goals`: Weekly commitment staking.
5. **🛡️ ADMIN (Staff Only)**
   - `#mod-log`: AutoMod alerts, deleted message logs.
   - `#team-huddle`: Host discussion on member health and issues.

---

### 2. Onboarding Rituals (First 7 Days)

Community retention is won or lost in the first 48 hours. If a member does not post or receive a human reply within 24 hours, churn probability spikes by 70%.

```
Sign Up / Invite Accepted
       │
       ▼
[Step 1: Role Verification & Gate]
       │
       ▼
[Step 2: Automated Welcome Direct Message]
   • Plaintext, founder tone
   • Link to #introductions with 3-question prompt
   • Single immediate action item
       │
       ▼
[Step 3: Introduction Post in #introductions]
   • Bot or Community Host replies within 4 hours
   • Host tags 1–2 relevant existing members with mutual interests
       │
       ▼
[Step 4: Day 3 Quick Win]
   • DM or ping pointing to the single most popular template/resource
       │
       ▼
[Step 5: Day 7 Live Touchpoint]
   • Invitation to weekly office hours or live peer sprint
```

#### The 3-Question Introduction Template
```markdown
Welcome to the collective! Copy & paste this prompt into #introductions:

1. **What are you building right now?** (1–2 sentences)
2. **What is the #1 roadblock or problem keeping you up at night?**
3. **What is an unconventional skill or lesson you can share with the room?**
```

---

### 3. Engagement Loops & Ritual Calendar

Communities thrive on predictable rhythms. Establish designated recurring moments throughout the week:

| Day | Ritual / Theme | Channel | Objective |
|:---|:---|:---|:---|
| **Monday** | *Goal Staking Monday* | `#accountability-goals` | Members post top 3 priority goals for the week. Peer accountability. |
| **Wednesday** | *Deep Dive / Office Hours* | Voice / `#hot-seats-amas` | 45-min live workshop, founder hot seat, or expert teardown. |
| **Thursday** | *Feedback Jam* | `#feedback-exchange` | Give feedback on 1 peer's work to get feedback on your own. |
| **Friday** | *Wins & Brag Board* | `#wins-and-milestones` | Celebrate revenue, launches, breakthroughs, and hard lessons. High dopamine closing. |
| **Monthly** | *Member of the Month / Hackathon* | All-hands | Spotlight top contributors with status perks, badges, or exclusive 1-on-1s. |

---

### 4. Retention & Inactivity Interceptions

Track active engagement (message sent, reaction added, event attended) in 7-, 14-, and 30-day windows.

#### 14-Day Inactivity Soft Nudge (Automated or Concierge DM)
```markdown
Hey [First Name]! Noticed you’ve been deep in the trenches lately. 

We just dropped a teardown on [High-value topic, e.g., AI agent scaffolding] in the community, and [Existing Member] was actually asking about your work on [Project]. 

Hope you’re crushing it — if you’re stuck on anything, jump into #ask-the-community anytime.
```

#### 30-Day Reactivation Concierge Call / VIP Invite
- Send a personalized email from the community founder or head moderator.
- Offer a frictionless "one-click invite" to an upcoming closed-door mastermind session or exclusive research drop.
- Provide a 1-question pulse check: *"Did your focus change, or did we drop the ball on content? Honest feedback helps us improve."*

---

### 5. Moderation Protocols & Spam Defense

Zero tolerance for unsolicited DMs, predatory pitching, and crypto/forex bots.

#### AutoMod Configuration Rules
1. **Link Restrictions for New Members**: Disallow URLs in public channels for members with `< 24 hours` tenure unless approved.
2. **Keyword Blacklist**: Auto-delete and flag keywords: `crypto`, `telegram`, `airdrop`, `dm me for`, `whatsapp`, `investment`, `passive income guaranteed`.
3. **Rate Limiting**: Enable slowmode (5–15 seconds) in high-velocity channels during launches or AMAs.

#### 3-Tier Escalation Ladder
- **Tier 1 (Unintentional Rule Infraction / Mild Self-Promo)**: Message deleted; private DM warning explaining the rule with a link to `#welcome-rules`.
- **Tier 2 (Repeat Promo or Disrespectful Conduct)**: 24-hour timeout (mute); second formal warning logged in `#mod-log`.
- **Tier 3 (Unsolicited DM Pitching, Harassment, Bot Infiltration)**: Immediate permanent ban; IP/account ban logged.

---

## Quality Gate

- [ ] Channel architecture is categorized cleanly with 10 or fewer initial channels.
- [ ] Welcome DM and 3-question introduction prompt configured and ready.
- [ ] Host response SLA defined (community host or founder responds to all intros within 4 hours).
- [ ] Weekly ritual calendar published with specific days, channels, and prompts.
- [ ] Inactivity triggers at 14 days and 30 days mapped with non-spammy value copy.
- [ ] AutoMod regex and link filters configured to eliminate spam and unsolicited direct messaging.

---

## Routing

- Event notifications, webhook bot integrations, and automated onboarding pings → `automation`.
- Community newsletters, recap posts, and social screenshots → `content` / `smm`.
- Membership paywalls, subscription billing, and member CRM syncing → `crm` / `growth:pricing`.
- In-app embedded community widgets or SSO authentication → `webdev`.
