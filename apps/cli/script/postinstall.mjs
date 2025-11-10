#!/usr/bin/env node

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function detectPlatformAndArch() {
  let platform;
  switch (os.platform()) {
    case "darwin":
      platform = "darwin";
      break;
    case "linux":
      platform = "linux";
      break;
    case "win32":
      platform = "windows";
      break;
    default:
      platform = os.platform();
      break;
  }

  let arch;
  switch (os.arch()) {
    case "x64":
      arch = "x64";
      break;
    case "arm64":
      arch = "arm64";
      break;
    default:
      arch = os.arch();
      break;
  }

  return { platform, arch };
}

function findBinary() {
  const { platform, arch } = detectPlatformAndArch();
  const packageName = `shadcnify-${platform}-${arch}`;
  const binary = platform === "windows" ? "shadcnify.exe" : "shadcnify";

  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    const packageDir = path.dirname(packageJsonPath);
    const binaryPath = path.join(packageDir, "bin", binary);

    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Binary not found at ${binaryPath}`);
    }

    return binaryPath;
  } catch (error) {
    throw new Error(`Could not find package ${packageName}: ${error.message}`);
  }
}

async function regenerateWindowsCmdWrappers() {
  console.log("Windows + npm detected: Forcing npm to rebuild bin links");

  try {
    const { execSync } = require("child_process");
    const pkgPath = path.join(__dirname, "..");
    const isGlobal =
      process.env.npm_config_global === "true" ||
      pkgPath.includes(path.join("npm", "node_modules"));

    const cmd = `npm rebuild shadcnify --ignore-scripts${isGlobal ? " -g" : ""}`;
    const opts = {
      stdio: "inherit",
      shell: true,
      ...(isGlobal ? {} : { cwd: path.join(pkgPath, "..", "..") }),
    };

    console.log(`Running: ${cmd}`);
    execSync(cmd, opts);
    console.log("Successfully rebuilt npm bin links");
  } catch (error) {
    console.error("Error rebuilding npm links:", error.message);
    console.error(
      "npm rebuild failed. You may need to manually run: npm rebuild shadcnify --ignore-scripts",
    );
  }
}

async function main() {
  try {
    if (os.platform() === "win32") {
      if (process.env.npm_config_user_agent?.startsWith("npm")) {
        await regenerateWindowsCmdWrappers();
      } else {
        console.log("Windows detected but not npm, skipping postinstall");
      }
      return;
    }

    const binaryPath = findBinary();
    const binScript = path.join(__dirname, "bin", "shadcnify");

    // Remove existing bin script if it exists
    if (fs.existsSync(binScript)) {
      fs.unlinkSync(binScript);
    }

    // Create symlink to the actual binary
    fs.symlinkSync(binaryPath, binScript);
    console.log(`shadcnify binary symlinked: ${binScript} -> ${binaryPath}`);
  } catch (error) {
    console.error("Failed to create shadcnify binary symlink:", error.message);
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error("Postinstall script error:", error.message);
  process.exit(0);
}
