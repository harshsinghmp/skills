#!/usr/bin/env bun
/**
 * 🧠 wisdom-updater.ts — Wisdom Compounding CLI for periodic-retreat
 */

async function run(): Promise<void> {
  try {
    // `coach` owns the wisdom-updater implementation; resolve it at runtime so a
    // per-skill install without `coach` fails with an actionable message.
    const { main } = await import("../../coach/scripts/wisdom-updater");
    await main();
  } catch (error) {
    console.error(
      "periodic-retreat requires the coach skill (it owns the wisdom-updater implementation). Install it with: npx skills add harshsinghmp/muse-skills --skill coach",
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

run();
