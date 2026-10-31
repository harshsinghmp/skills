#!/usr/bin/env bun
/**
 * 🧠 wisdom-updater.ts — Wisdom Compounding CLI for periodic-retreat
 */

import { main } from "../../coach/scripts/wisdom-updater";

main().catch((err) => {
  console.error("WisdomUpdater error:", err);
  process.exit(1);
});
