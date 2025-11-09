#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const PACKAGE_VERSION = require("../package.json").version;
const REPO = "martinsione/shadcnify.com";

// Platform detection
const platform = process.platform; // darwin, linux, win32
const arch = process.arch; // x64, arm64

// Map platform/arch to binary names
function getBinaryName() {
  if (platform === "darwin" && arch === "arm64") {
    return "shadcnify-macos-arm64";
  } else if (platform === "darwin" && arch === "x64") {
    return "shadcnify-macos-x64";
  } else if (platform === "linux" && arch === "x64") {
    return "shadcnify-linux-x64";
  } else if (platform === "win32" && arch === "x64") {
    return "shadcnify-windows-x64.exe";
  }

  throw new Error(
    `Unsupported platform: ${platform}-${arch}\n` +
      `Supported platforms: macOS (arm64/x64), Linux (x64), Windows (x64)\n` +
      `Note: Linux ARM64 is not currently supported due to build limitations.`
  );
}

// Download binary from GitHub releases
function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);

    https
      .get(
        url,
        {
          headers: { "User-Agent": "shadcnify-installer" },
        },
        (response) => {
          // Handle redirects
          if (response.statusCode === 302 || response.statusCode === 301) {
            return downloadBinary(response.headers.location, destPath)
              .then(resolve)
              .catch(reject);
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          const file = fs.createWriteStream(destPath);
          response.pipe(file);

          file.on("finish", () => {
            file.close();
            // Make executable (Unix-like systems)
            if (platform !== "win32") {
              fs.chmodSync(destPath, 0o755);
            }
            resolve();
          });

          file.on("error", (err) => {
            fs.unlinkSync(destPath);
            reject(err);
          });
        }
      )
      .on("error", reject);
  });
}

async function install() {
  try {
    // Skip in development (when running from workspace root)
    const isDevEnvironment = fs.existsSync(path.join(__dirname, "..", "src"));
    if (isDevEnvironment) {
      console.log(
        "Development environment detected, skipping binary download."
      );
      console.log("Use 'bun run dev' to run from source.");
      return;
    }

    const binaryName = getBinaryName();
    const binDir = path.join(__dirname, "..", "bin");
    // Always save as .exe to avoid conflicts with the wrapper script
    const destPath = path.join(binDir, "shadcnify.exe");

    // Create bin directory if it doesn't exist
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    // Check if binary already exists (skip if running from source)
    if (fs.existsSync(destPath)) {
      console.log("Binary already exists, skipping download.");
      return;
    }

    // Construct download URL
    const version = PACKAGE_VERSION.startsWith("v")
      ? PACKAGE_VERSION
      : `v${PACKAGE_VERSION}`;
    const url = `https://github.com/${REPO}/releases/download/${version}/${binaryName}`;

    console.log(`Installing shadcnify ${version} for ${platform}-${arch}...`);

    await downloadBinary(url, destPath);

    console.log(`✓ Successfully installed shadcnify to ${destPath}`);
    console.log(`  Run: npx shadcnify or shadcnify`);
  } catch (error) {
    console.error("Failed to install shadcnify:");
    console.error(error.message);
    console.error("\nYou can download the binary manually from:");
    console.error(`https://github.com/${REPO}/releases`);
    process.exit(1);
  }
}

install();
