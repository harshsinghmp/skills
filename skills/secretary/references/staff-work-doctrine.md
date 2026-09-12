# Completed Staff Work Doctrine, Adversarial Gate & Hash Protocol

## Principles of Completed Staff Work

1. **Staff officers do not ask what to do**: They work out all details, consult with stakeholders, and present a complete single action ready for signature or rejection.
2. **Socratic Adversarial Challenge (Devil's Advocate)**: Every proposal must withstand 3 mandatory counter-arguments (Architectural Fragility, Operational/Rollback Burden, Hidden Assumptions) before computing a hash.
3. **Dissent is an asset**: If two data sources disagree on performance or cost, list both explicitly in the Preserved Dissent Ledger. Never average or obscure discrepancies.
4. **Cryptographic Confirmation**: When recommending external writes or destructive migrations, the proposed script or diff is hashed via SHA-256. The principal approves the exact hash, preventing race conditions or drift.

## Hash Computation Protocol

```bash
# Compute SHA-256 for a multi-file diff or migration script
sha256sum < payload.patch | awk '{print $1}'
```
