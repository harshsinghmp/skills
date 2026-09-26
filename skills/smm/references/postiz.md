# postiz — Multi-channel automated social scheduling and queue management via Postiz API/CLI.

## Intake

- Scheduled social posts/drafts with media assets and copy
- Target platforms (28+ supported: LinkedIn, X/Twitter, Instagram, TikTok, YouTube, Threads, Facebook, Pinterest, Reddit, Bluesky, Mastodon, etc.)
- Postiz API credentials (`POSTIZ_API_KEY`, API endpoint URL)
- Scheduling windows and publication times
- Default stack: Self-hosted Postiz instance via Docker / Railway.

## Deliverable

A scheduled multi-channel social campaign: pre-flight authentication verified, media assets uploaded to remote storage pipeline, dynamic integration settings discovered, TikTok direct-post flags set, and jobs queued in Postiz with verified job IDs.

## Procedure

1. **Pre-Flight Authentication**:
   - Verify active credentials before generating commands: run `postiz auth:status` or check `POSTIZ_API_KEY`.
   - Fail fast if unauthenticated — never emit speculative scheduling commands without verified keys.

2. **Mandatory Remote Media Upload Pipeline**:
   - **Hard Invariant**: Never pass raw filesystem paths (`/tmp/img.png`) or external URLs directly to `-m` / `media` arguments.
   - Execute `postiz upload <file-path>` to upload the asset to the Postiz media store.
   - Capture the returned remote `.path` identifier from the JSON response.
   - Use only the verified `.path` identifier in all downstream scheduling payloads.

3. **Dynamic Integration Settings Discovery**:
   - Platform requirements change dynamically (e.g. LinkedIn author type, YouTube privacy status, Pinterest boards).
   - Before scheduling, query `postiz integrations:settings <integration-id>` to discover mandatory fields.
   - Populate platform-specific payload properties to avoid silent post drops.

4. **TikTok Direct-Post Mandate**:
   - For all TikTok video posts, explicitly set `publishMode: "DIRECT_POST"` (or CLI flag `--direct-post`).
   - Avoid silent draft expiry in user TikTok inboxes caused by default draft mode.

5. **Reconciliation & Queue Audit**:
   - Check queue health and verify scheduled jobs via `postiz posts:list --status scheduled`.
   - Run `postiz posts:missing` to catch missing scheduled slots or orphan assets.
   - Log returned post IDs into the agency evidence ledger.

## Quality gate

- [ ] `postiz auth:status` verified green before scheduling.
- [ ] Media assets uploaded via `postiz upload` and remote `.path` used in payloads.
- [ ] Integration settings queried dynamically for target platforms.
- [ ] TikTok video posts explicitly configured with `DIRECT_POST`.
- [ ] Post IDs returned by API and verified in scheduled queue.

## Routing

- Content creation, copywriting, and hooks → `content` mode.
- Editorial calendar planning and cadence → `calendar` mode.
- Post-publish performance analytics → `analytics` mode.

## Sources

- gitroomhq/postiz-agent & taisly/agent
- Official Postiz API & CLI documentation
