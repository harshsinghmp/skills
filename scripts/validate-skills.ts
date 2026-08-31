import { validateSkillsDirectory } from "../src/validator.ts";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

function main() {
  console.log("[VALIDATE] Checking skills directory for frontmatter and structural compliance...");
  const result = validateSkillsDirectory();

  console.log(`[VALIDATE] Scanned ${result.totalSkills} skill(s).`);

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.log(`  - [${w.skill}]: ${w.message}`);
    }
  }

  if (result.errors.length > 0) {
    console.error(`\n❌ Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.error(`  - [${e.skill}]: ${e.message}`);
    }
    console.error("\n[VALIDATE] Validation failed. Fix errors above before publishing.");
    process.exit(1);
  }

  console.log("\n✅ All skills passed validation and are ready for npx skills ingestion!");
}

main();
