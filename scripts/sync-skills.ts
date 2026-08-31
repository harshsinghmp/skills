import { syncSkills } from "../src/sync.ts";
import type { SyncOptions } from "../src/types.ts";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--filter" && args[i + 1]) {
      options.filter = args[++i];
    } else if (arg === "--token" && args[i + 1]) {
      options.token = args[++i];
    }
  }

  const report = await syncSkills(options);
  if (report.failed > 0 && !options.dryRun) {
    console.warn(`[WARN] Sync completed with ${report.failed} failure(s).`);
  }
}

main().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});
