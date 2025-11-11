import { readFile } from "fs/promises";
import { join, dirname } from "path";

export async function versionCommand() {
  try {
    // Read package.json to get the version
    // The CLI entry point is in src/index.tsx, so package.json is one level up
    const packageJsonPath = join(
      dirname(new URL(import.meta.url).pathname),
      "../../package.json",
    );
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

    console.log(`shadcnify v${packageJson.version}\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error reading version:", error);
    process.exit(1);
  }
}
