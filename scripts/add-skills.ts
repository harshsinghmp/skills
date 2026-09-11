import { ingestFromUrls } from "../src/ingest.ts";
import type { IngestOptions, SkillCategory } from "../src/types.ts";

function usage(): never {
  console.log(`Usage:
  bun run add <github-or-git-url> [more-urls...] [options]

Examples:
  bun run add https://github.com/owner/repo
  bun run add https://github.com/owner/repo/tree/main/skills/my-skill
  bun run add owner/repo
  bun run add https://gitlab.com/owner/repo --category engineering --no-sync

Options:
  --category <name>   Force a category (engineering|creative|delivery|governance|cognitive|marketing|general)
  --no-sync           Register in the manifest without syncing immediately
  --dry-run           Show what would be registered without writing`);
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const urls: string[] = [];
  const options: IngestOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--category" && args[i + 1]) {
      const cat = args[++i];
      const valid: SkillCategory[] = [
        "engineering",
        "creative",
        "delivery",
        "governance",
        "cognitive",
        "marketing",
        "general",
      ];
      if (!valid.includes(cat as SkillCategory)) {
        console.error(`Invalid category: ${cat}. Valid: ${valid.join("|")}`);
        usage();
      }
      options.category = cat as SkillCategory;
    } else if (arg === "--no-sync") {
      options.sync = false;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "-h" || arg === "--help") {
      usage();
    } else if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      usage();
    } else {
      urls.push(arg);
    }
  }

  if (urls.length === 0) {
    console.error("No upstream URLs provided.");
    usage();
  }

  const report = await ingestFromUrls(urls, options);

  console.log(
    `\n[INGEST SUMMARY] Registered: ${report.registered} | Skipped: ${report.skipped} | Errors: ${report.errors.length}`
  );
  if (report.errors.length > 0) {
    for (const err of report.errors) console.error(`  - ${err}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal ingest error:", err);
  process.exit(1);
});
