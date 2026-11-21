# 🩺 Doctor — Portable Install Verification

> Answers "is this device's install consistent?" from the installed tree alone — no repository clone, no network.

---

## Why it exists

`scripts/muse.ts doctor` in the source repository is the full check, but a user who installed with `npx skills add` (or the installer) has no clone. This mode runs the copy that ships **inside** the skill, so the question works anywhere:

```bash
bun ~/.agents/skills/updateagents/scripts/doctor.ts          # human output
bun ~/.agents/skills/updateagents/scripts/doctor.ts --json   # machine output
bun ~/.agents/skills/updateagents/scripts/doctor.ts --fix    # relink the Claude/Amp skill mirror
```

## What it verifies

| Check | Failure means |
| :--- | :--- |
| `skills-installed` | The skills root is missing or empty — reinstall |
| `version-marker` | No `.muse-version`; the install predates version stamping (warning only) |
| `modes-resolve` | A mode reference is missing from a skill that advertises one |
| `dispatch-resolves` | The installed `secretary/references/dispatch.md` advertises modes the installed skills do not have — a mixed-version install |
| `harness-surfaces` | A detected harness is missing `<skill>` or `<skill>-<mode>` command files, per `.muse/harness.json` |
| `skill-mirror` | `~/.claude/skills` (read by Claude Code, and Amp's fallback) does not mirror the canonical tree |

## Rules

1. **Exit code is the verdict.** `0` means consistent; `1` means re-run the installer or `--fix`.
2. **`--fix` is limited to the mirror.** It re-links missing skill directories; it never rewrites command files — that needs the exporter, so use the installer or `muse update`.
3. **Diagnose, don't guess.** Every failure names the file that is missing or the destination that disagrees; report that verbatim instead of summarizing.
4. **A missing harness directory is not a failure.** Doctor checks only harnesses present on the machine; an absent destination means that harness is not installed.

## Handoff

- Skills inconsistent → reinstall: `curl -fsSL https://github.com/harshsinghmp/muse-skills/releases/latest/download/install.sh | bash` (or `npx skills add harshsinghmp/muse-skills` for skills only).
- Repository present → prefer the full `bun scripts/muse.ts doctor` / `update`.
