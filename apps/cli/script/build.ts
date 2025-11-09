#!/usr/bin/env bun

import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

import pkg from "../package.json"

const version = pkg.version

const allTargets = [
  ["darwin", "arm64"],
  ["darwin", "x64"],
  ["linux", "x64"],
  ["windows", "x64"],
]

await $`rm -rf dist`

const binaries: Record<string, string> = {}

for (const [os, arch] of allTargets) {
  console.log(`Building ${os}-${arch}...`)
  const name = `shadcnify-${os}-${arch}`
  await $`mkdir -p dist/${name}/bin`

  const ext = os === "windows" ? ".exe" : ""
  await $`bun build --compile --minify --sourcemap src/index.tsx --outfile dist/${name}/bin/shadcnify${ext}`

  // Create package.json for platform-specific package
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version,
        os: [os === "windows" ? "win32" : os],
        cpu: [arch],
      },
      null,
      2
    )
  )

  binaries[name] = version
}

console.log("Built binaries:", binaries)

export { binaries }

