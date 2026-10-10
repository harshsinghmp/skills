# Evidence Entry Schema

> Canonical schema for all evidence-ledger entries. Every entry — regardless of category — follows this structure.

---

## Required Fields (all categories)

| Field | Format | Description |
| :--- | :--- | :--- |
| `EVD-ID` | `EVD-NNN` (zero-padded, sequential) | Unique identifier. Never reused, even after supersession. |
| `Date` | ISO 8601 date (`YYYY-MM-DD`) | Date the entry was recorded. |
| `Category` | Enum: `DECISION` · `COMMITMENT` · `CLAIM` · `STATUS` | The type of factual assertion. |
| `Statement` | Single sentence, ≤200 chars | The factual assertion being tracked. |
| `Confidence` | Enum: `[RAW]` · `[FETCH]` · `[SEARCH]` · `[INFER]` | Provenance tier per the 4-tier taxonomy. |
| `Epistemology` | Enum: `[EMPIRICAL]` · `[SPECULATIVE]` | Whether grounded in measurement or deduction. |
| `Evidence` | URL, file path, command receipt, or description | The actual proof supporting the statement. |
| `Status` | Enum (see below) | Current lifecycle state of the entry. |

---

## Status Values

| Status | Meaning | Applies To |
| :--- | :--- | :--- |
| `ACTIVE` | Current and relevant | DECISION, STATUS |
| `VERIFIED` | Proven with receipt | CLAIM |
| `FULFILLED` | Delivered with proof | COMMITMENT |
| `PROMISED` | Deadline in the future, not yet delivered | COMMITMENT |
| `OVERDUE` | Past deadline, no delivery evidence | COMMITMENT |
| `STALE` | No update within staleness window | CLAIM, STATUS |
| `SUPERSEDED` | Replaced by a newer entry | DECISION, CLAIM |
| `QUARANTINED` | Failed verification, awaiting remediation | CLAIM |
| `REDACTED` | Removed — ungrounded and unredeemable | CLAIM |

---

## Category-Specific Fields

### DECISION

| Field | Required | Description |
| :--- | :--- | :--- |
| `Options Considered` | Yes | Numbered list of alternatives evaluated (minimum 2). |
| `Trade-offs` | No | Acknowledged downsides of the chosen option. |
| `Supersedes` | No | `EVD-ID` of the prior decision this replaces. |

### COMMITMENT

| Field | Required | Description |
| :--- | :--- | :--- |
| `Promised To` | Yes | Client name or stakeholder identifier. |
| `Deadline` | Yes | ISO 8601 date of expected delivery. |
| `Delivery Evidence` | No (required for `FULFILLED`) | PR link, deployment URL, client sign-off, or similar proof. |

### CLAIM

| Field | Required | Description |
| :--- | :--- | :--- |
| `Verification Receipt` | No (required for `VERIFIED`) | Command output, benchmark log, DOI, or canonical URL proving the claim. |

### STATUS

| Field | Required | Description |
| :--- | :--- | :--- |
| `Blocking` | No | What this status fact blocks (feature name, milestone, or EVD-ID). |

---

## Provenance Tags

Entries imported from existing context files carry an additional `[IMPORTED]` provenance tag alongside their confidence tier. This indicates the entry was extracted from a pre-existing document rather than recorded in real-time.

Format: `[IMPORTED] [FETCH]` — imported entry, originally sourced from an authoritative URL.

---

## Entry Markdown Format

```markdown
### EVD-{NNN} | {YYYY-MM-DD} | {CATEGORY}
**Statement**: {one-sentence factual assertion}
**Category**: `{CATEGORY}`
**Confidence**: `{TIER}` — {brief provenance note}
**Epistemology**: `{CLASS}`
{...category-specific fields...}
**Evidence**: {URL / file path / command receipt}
**Status**: `{STATUS}`
```

Entries are separated by horizontal rules (`---`). Superseded entries retain their original content but append `[SUPERSEDED by EVD-{NNN}]` to the Status line.
