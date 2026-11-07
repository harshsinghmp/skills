# Structural AST Shield & Rhythm Dispersion Protocol

Loaded by: `humanize` when editing, auditing, or rewriting technical documentation, markdown files, or articles containing code blocks, tables, and structured data.

---

## 1. Structural AST Code-Shield Pipeline

Naive regex replacements and LLM copyediting passes frequently mutate inline variable names, break YAML mapping colons (`key: value`), ruin markdown table column alignment, or alter URL query parameters. The AST Shield guarantees 100% technical element byte-preservation.

### The 3-Pass Stash Pipeline:

```
Raw Input Text
      │
      ▼
┌───────────────────────────────┐
│ Pass 1: Stash & Tokenize      │  Extract Fenced Blocks, Inline Code,
│ (Extract to {{SHIELD_XX}})    │  Frontmatter, Tables, URLs to Map
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ Pass 2: Editorial Processing  │  Apply Anti-Slop Pattern Catalog,
│ (Prose-Only Transformation)   │  Rhythm Dispersion & Lexical Filters
└───────────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ Pass 3: Unstash & Re-assemble │  Restore all Stashed Tokens Verbatim;
│ (Byte-Parity Verification)    │  Assert Zero Code/Table Mutation
└───────────────────────────────┘
      │
      ▼
Protected Clean Output
```

### Shielded Element Classes:
1. **Fenced Code Blocks**: ```` ```[lang] ... ``` ```` and indented blocks.
2. **Inline Code Spans**: `` `variable_name` ``, command flags, path literals.
3. **YAML / JSON Frontmatter**: Leading `---` blocks and document metadata headers.
4. **Markdown Tables**: Header, separator (`|---|`), and cell contents (`| ... |`).
5. **Raw URLs & Image Syntax**: `[link text](https://...)` and `![alt](path)`.
6. **HTML Tags & Components**: `<CustomComponent ... />` and raw HTML embeds.

---

## 2. Sentence-Length Dispersion & Burstiness Metric

AI-generated prose is characterized by **metronomic cadence**: almost every sentence has a monotonous length of 14–18 words, producing an artificial, robotic drone. Authentic human writing has high variance (burstiness): punchy 3-word statements interspersed with 28-word explanatory clauses.

### The Cadence Formula:
Compute the standard deviation of sentence lengths within each section/paragraph:
$$\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (L_i - \mu)^2}$$
where $L_i$ is the word count of sentence $i$, and $\mu$ is the mean sentence length.

### Cadence Evaluation Thresholds:
- **$\sigma < 4.0$ words (Metronomic AI Drone)**: Flagged for cadence re-balancing. The paragraph must be edited to mix short sentences ($\le 8$ words) with longer compound sentences ($\ge 20$ words).
- **$\sigma \ge 5.0$ words (Dynamic Human Cadence)**: Healthy natural rhythm.

---

## 3. Structural Density Fences

### Bullet-to-Prose Ratio:
- **The Problem**: AI models habitually default to nested, bold-labeled bullet lists (*"Structured-List Syndrome"*) instead of synthesizing thoughts into flowing prose.
- **The Fence**: Bullet points must not exceed **40% of the total word count** in narrative, architectural, or blog content. If bullet density $> 40\%$, convert list items into narrative paragraphs with varied transitions.

### Em-Dash & Punctuation Budget:
- **Budget**: Maximum **1 em-dash (`—`) per 500 words**. Replace excessive dashes with commas, periods, or parentheses.
- **Smart Quotes**: Normalize irregular curly quotes (`“`, `”`, `‘`, `’`) to standard straight quotes in technical copy to prevent syntax errors in shell snippets.

---

## 4. Technical Jargon False-Positive Whitelist

Do not penalize words from Pattern P07 (*robust*, *seamless*, *orchestrate*, *streamline*, *leverage*) when they appear adjacent to concrete technical infrastructure:
- ✅ Allowed: *"seamless database failover"* (high availability mechanism).
- ✅ Allowed: *"robust TCP handshake"* (network protocol resilience).
- ✅ Allowed: *"orchestrate Kubernetes pods"* (container runtime management).
- ❌ Flagged: *"seamlessly integrate your workflow"* (unearned marketing fluff).
- ❌ Flagged: *"robust strategy"* (empty corporate filler).
