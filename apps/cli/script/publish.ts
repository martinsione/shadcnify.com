#!/usr/bin/env bun

import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

import pkg from "../package.json"

const { binaries } = await import("./build.ts")

// Smoke test the current platform binary
{
  const name = `shadcnify-${process.platform}-${process.arch}`
  const ext = process.platform === "win32" ? ".exe" : ""
  console.log(`Smoke test: running dist/${name}/bin/shadcnify${ext}`)
  await $`./dist/${name}/bin/shadcnify${ext}`
}

// Create main wrapper package
await $`mkdir -p ./dist/shadcnify`
await $`cp -r ./bin ./dist/shadcnify/bin`
await $`cp ./script/postinstall.mjs ./dist/shadcnify/postinstall.mjs`
await $`cp ./script/preinstall.mjs ./dist/shadcnify/preinstall.mjs`
await $`cp ./README.md ./dist/shadcnify/README.md`

await Bun.file(`./dist/shadcnify/package.json`).write(
  JSON.stringify(
    {
      name: "shadcnify",
      version: pkg.version,
      description: pkg.description,
      bin: {
        shadcnify: "./bin/shadcnify",
      },
      scripts: {
        preinstall: "node ./preinstall.mjs",
        postinstall: "node ./postinstall.mjs",
      },
      keywords: pkg.keywords,
      author: pkg.author,
      license: pkg.license,
      homepage: pkg.homepage,
      repository: pkg.repository,
      bugs: pkg.bugs,
      optionalDependencies: binaries,
    },
    null,
    2
  )
)

// Publish all platform-specific packages
for (const [name] of Object.entries(binaries)) {
  console.log(`Publishing ${name}...`)
  await $`cd dist/${name} && npm publish --access public`
}

// Publish main wrapper package
console.log("Publishing shadcnify...")
await $`cd ./dist/shadcnify && npm publish --access public`

console.log("✅ All packages published to npm!")

// Create ZIP files for curl installer
console.log("\n📦 Creating ZIP files for GitHub Release...")
await $`mkdir -p dist/zips`

for (const key of Object.keys(binaries)) {
  const ext = key.includes("windows") ? ".exe" : ""
  await $`cd dist/${key}/bin && zip -r ../../zips/${key}.zip shadcnify${ext}`
  console.log(`  ✓ ${key}.zip`)
}

// Create GitHub Release and upload assets
console.log("\n🚀 Creating GitHub Release...")
const tag = `v${pkg.version}`

// Check if release already exists
const releaseExists = await $`gh release view ${tag}`.quiet().nothrow()

if (releaseExists.exitCode === 0) {
  console.log(`Release ${tag} already exists, deleting it...`)
  await $`gh release delete ${tag} --yes`
}

// Create new release
await $`gh release create ${tag} \
  --title "v${pkg.version}" \
  --generate-notes \
  ./dist/zips/*.zip`

console.log(`\n✅ Release ${tag} created with assets!`)
console.log(`\nView at: https://github.com/martinsione/shadcnify.com/releases/tag/${tag}`)

