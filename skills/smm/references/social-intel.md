# social-intel — Multi-Platform Social Intelligence & Trend Harvesting

## Scope

- Zero-cost social listening, viral trend harvesting, and audience research across major discussion and media platforms.
- Bypassing expensive monthly API paywalls (e.g. Twitter/X $215/mo tier) using localized browser session cookies and open CLI bridges.
- Harvesting high-signal discussions, user pain points, competitor critiques, and video subtitle transcripts.
- Multi-platform intelligence gathering across Twitter/X, Reddit, YouTube, tech discussion hubs (V2EX, Hacker News), and global lifestyle forums.

## Deliverable

A structured Social Intelligence Dossier containing audience sentiment, viral hook candidates, high-engagement discussion threads, and verbatim customer quotes for copy development.

## Platform Harvesting Methods

### 1. Twitter / X (Search & Thread Scraping)
- **Mechanism**: Local session cookie authentication via open CLI tools (`twitter-cli`).
- **Data Points Extracted**:
  - Trending hashtags and keyword clusters.
  - Top performing tweets in client niche sorted by engagement (replies, retweets, bookmarks).
  - Verbatim customer complaints against competitor SaaS products.
- **Cost**: $0 (eliminates the $215/month basic API fee).

### 2. Reddit (Community Sentiment & Problem Discovery)
- **Mechanism**: Target subreddit exploration via local browser session cookies or public feeds.
- **Data Points Extracted**:
  - "How do I solve X?" query clusters in niche subreddits.
  - High-upvote critiques of incumbent software.
  - Natural vocabulary and terminology used by real practitioners (anti-corporate phrasing).

### 3. YouTube & Video Discourse (Transcript & Subtitle Mining)
- **Mechanism**: Subtitle and audio extraction via `yt-dlp` coupled with local or API Whisper transcription.
- **Data Points Extracted**:
  - Complete spoken transcripts of long-form competitor reviews and tutorials.
  - Chapter breakdown and retention topic analysis.
  - Audience comment questions flagging missing features or confusing workflows.

### 4. International Tech & Lifestyle Communities
- **Mechanism**: Public JSON endpoints and browser session exports for regional communities (e.g., lifestyle forums, technical developer boards).
- **Data Points Extracted**:
  - Emerging global design trends, mobile UI conventions, and early product feedback.

## Social Intelligence Dossier Format

```markdown
# 🔍 Social Intelligence Dossier: [Topic / Product]

## 1. High-Frequency Audience Pain Points
- **Pain Point 1**: [Verbatim user quote from Reddit/Twitter thread]
  - Context: Why current solutions fail.
  - Opportunity: How our client solution addresses it directly.

## 2. Viral Hook Bank
- **Hook 1 (Contrarian)**: "Why 90% of [industry] advice is actively hurting your [metric]..."
- **Hook 2 (Proof/Data)**: "We audited 50 [assets] and found the exact same flaw..."
- **Hook 3 (Story/Transformation)**: "From [bad state] to [ideal state] in 14 days without [common headache]..."

## 3. Competitor Weakness Ledger
| Competitor | Primary User Complaint | Source Platform | Copy Angle to Exploit |
|:---|:---|:---|:---|
| Competitor A | Hidden fees on checkout | Reddit /r/saas | 100% transparent pricing guarantee |
| Competitor B | Sluggish dashboard latency | Twitter/X thread | Built on edge architecture, sub-50ms |
```

## Quality Gate

- [ ] All session cookies kept strictly local on machine (zero credential leakage).
- [ ] Claims backed by real thread URLs or verbatim quotes, never AI-hallucinated feedback.
- [ ] At least 3 distinct platform angles cross-referenced before validating a trend.
- [ ] Raw transcripts cleaned of audio artifacts and filler before analysis.

## Routing

- Social content scheduling and multi-channel publishing → `smm` (postiz or calendar mode).
- Sales copywriting and landing page transformation → `content` / `growth`.
- Product feature positioning and Go-To-Market strategy → `gtm`.
