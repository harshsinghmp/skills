# Receipt Verification & Anti-Thrashing Protocol

Loaded by: `pua` audit, evaluation, and recovery procedures when auditing agent execution, verifying completion receipts, or detecting evasive thrashing.

---

## 1. Receipt-or-Rejection Gate (Zero Hallucination)

Any agent claim of completion, fix verification, or test passing is considered unverified hearsay until backed by deterministic proof.

### Strict Verification Rules:
1. **Verbatim Execution Receipt**: Every claim of success ("all tests pass", "lint passed cleanly", "build succeeded") MUST be accompanied by an actual, unedited terminal output block including the exact exit code and command line executed.
2. **Ghost File Probe**:
   - Every file path, script, or configuration referenced in the agent's summary or report MUST physically exist on the local filesystem.
   - Any reference to a non-existent file (`fs.existsSync(target) === false`) instantly fails the audit and results in an automatic **Unsatisfactory (Red)** PIP rating for Hallucination.
3. **Evidence Over Assertions**: Phrases such as *"I verified the code works properly"*, *"I ensured there are no regressions"*, or *"Everything is fixed now"* without accompanying CLI output fail the receipt gate.

---

## 2. Cosmetic Thrashing & Churn-to-Signal Ratio

When faced with complex blockers, struggling agents frequently make superficial formatting changes across multiple unrelated files to simulate high velocity while leaving the root bug untouched.

### The Churn Metric:
$$\text{Churn Ratio} = \frac{\Delta \text{Lines in Unrelated / Untested Files}}{\Delta \text{Lines in Failing Module / Test Suite}}$$

### Thresholds & Actions:
- **Churn Ratio $\le 1.5$ (Focused)**: Edits are tightly concentrated on the failing component and its test.
- **Churn Ratio $> 3.0$ with unresolved tests (Evasive Thrashing)**:
  - Immediately halt agent execution.
  - Reject the PR / branch changes.
  - Force rollback to the clean branch baseline: `git restore --staged . && git checkout .`.
  - Require the agent to formulate a single falsifiable hypothesis before touching code again.

---

## 3. Anti-Sycophancy & Direct Root-Cause Standard

Apologetic groveling wastes context tokens, slows down collaborative triage, and obscures technical failure modes.

### Banned Sycophancy Phrases:
- ❌ *"I apologize for the oversight..."*
- ❌ *"You are completely right, my mistake..."*
- ❌ *"I am deeply sorry for missing that..."*
- ❌ *"Thank you for your infinite patience..."*

### Required Direct Diagnosis Format:
When corrected or when a test fails, the agent must respond using this 3-line structural standard:
1. **Observed Failure**: The exact command executed, exit code, and failing assertion.
2. **Identified Root Cause**: The technical mechanism why it failed (file, function, line, or environmental condition).
3. **Next Hypothesis & Proposed Diff**: The exact code change to test next, or two concrete alternatives with specific trade-offs if blocked.
