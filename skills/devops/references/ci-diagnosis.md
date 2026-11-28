# CI Failure Diagnosis

Triage a red pipeline down to one named environment delta and a minimal reproduction,
instead of guessing at the workflow file until the job turns green.

## When to Use

- The build or tests pass on a developer machine and fail in CI, or pass in CI and fail
  locally.
- A pipeline that was green goes red with no code change: dependency, cache, runner image
  or secret drift.
- Only some matrix legs fail — one OS, one runtime version, one architecture, one shard.
- A job is being re-run repeatedly in the hope of a green run.
- The suite has acquired the blanket label "flaky" and nobody can separate flaky from
  broken.
- The build step passes but the deploy or packaging step fails, or the build fails only
  after a cache restore.

## Procedure

1. Read before reproducing. Pull the raw job log, not the summarized status: identify the
   first failing step, its exit code, and the first error line above the stack trace — the
   stack is usually downstream noise. Record job id, commit sha, runner image tag, and the
   exact command line the step ran.
2. Classify the failure surface to bound the search: dependency resolution,
   compile/typecheck, test, lint, artifact build, packaging/publish, deploy step, or
   infrastructure (auth, egress, quota, disk). The class tells you which deltas in step 4
   are even plausible.
3. Reproduce before theorizing. If the CI image is known, run the same command in that
   exact image with the same platform. If it is not, containerize the toolchain and run
   there. If it reproduces locally, stop treating it as a CI problem and debug it as a
   normal failure with the same tooling you would use on a laptop.
4. If it does not reproduce, walk the environment delta checklist one axis at a time,
   recording the observed CI value against the observed local value for each — never assume
   "same":
   - Toolchain: language and package-manager versions, lockfile honoured or ignored,
     globally installed CLIs shadowing project binaries.
   - Env vars and secrets: present vs absent, empty vs unset, a trailing newline or wrapped
     quote inside a secret, defaults injected by the CI platform.
   - Network: private registry, proxy, egress allowlist, DNS, TLS interception, missing
     local mirror.
   - Cache: which key restored, whether it was a partial hit, what the layer actually
     contains.
   - Permissions: file modes, container user and uid, token scope, workspace write access,
     whether the job can reach a service.
   - Platform: OS and version, CPU architecture, libc, line endings, filesystem case
     sensitivity, `/tmp` size, core count, memory limit, default timezone and locale.
5. Test the cache hypothesis cold; never assert it. Re-run with caching disabled — green
   cold and red warm means a poisoned or stale cache. Then name the exact key, what it
   stores, and what leaked into it (build output, `node_modules` from another lockfile,
   test fixtures, compiled artifacts). Fix by keying on the lockfile and toolchain hash and
   excluding build output from the restored paths.
6. Chase the filesystem and path class explicitly: files present locally but never committed
   (fixtures, `.env`, generated types), a case-insensitive local filesystem hiding a
   wrong-case import, CRLF from a Windows checkout breaking shell scripts or snapshots, a
   lost executable bit, flattened symlinks, spaces in paths, and any assumption that the
   repo sits at the workspace root.
7. Separate flaky from broken with evidence. Re-run the failing job or test at least ten
   times, run once serial and once with parallel or random ordering, fix and unfix the seed,
   run with and without network. A deterministic failure is broken — fix it now. An
   intermittent failure that has a measured rate and an identified trigger is flaky —
   quarantine it with an owner, a ticket and a deadline, never a silent retry.
8. Build the minimal reproduction to attach to the fix: the smallest failing command, the
   smallest fixture, the exact image tag, the env vars it needs (names and shapes, never
   values), the seed, and expected vs actual output. A reproduction that runs in the CI
   image is the only acceptable proof.
9. Fix, then prove: the reproduction must fail on the pre-fix commit and pass after, in the
   same image, and the pipeline must be green twice consecutively including one cold-cache
   run. Fold each real delta you discovered into `cicd.md` so the pipeline matches local
   permanently rather than being corrected per incident. Failures that reach production
   despite a green pipeline move to `incident.md`.

## Verification

- The first failing step is named with a quoted log line and an exit code — not "the build
  failed".
- The delta table has a value for every axis, including explicit "checked, identical"
  entries.
- Any cache verdict was produced by a cold run, and identifies the key plus its contents.
- The flaky/broken verdict cites a run count, a pass rate, and the trigger.
- A minimal reproduction exists as a file or command block, runnable in the CI image.
- The fix passes with the reproduction, fails without it, and survives a cold-cache run.
- No retry, skip, `continue-on-error` or widened timeout was added without an owner and a
  ticket.

## Anti-Patterns

- Re-running the job as the first response — it hides the failure rate, burns minutes, and
  teaches nothing about the cause.
- Diagnosing from the summary line or the last twenty log lines, which usually show a
  symptom three steps downstream of the cause.
- Suppressing real breakage with retries, `|| true`, skipped tests or raised timeouts,
  turning a deterministic bug into an intermittent one nobody owns.
