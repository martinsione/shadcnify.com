# Publishing Guide for Multi-Platform Distribution

This guide explains how to publish `shadcnify` with support for all platforms using GitHub Actions + postinstall script.

## How It Works

1. **GitHub Actions** builds binaries for all platforms (macOS, Linux, Windows)
2. Binaries are attached to **GitHub Releases**
3. When users install via npm, a **postinstall script** downloads the correct binary
4. Users can run `shadcnify` without needing Bun installed

## Prerequisites

1. **npm account**: https://www.npmjs.com/signup
2. **GitHub repository** with Actions enabled
3. Login to npm: `npm login`

## Publishing Steps

### 1. Update Version

```bash
cd apps/cli

# Update version in package.json
npm version patch  # 0.0.1 -> 0.0.2
# or
npm version minor  # 0.0.1 -> 0.1.0
# or
npm version major  # 0.0.1 -> 1.0.0
```

### 2. Commit and Push with Tag

```bash
git add .
git commit -m "chore: release v0.0.2"
git tag v0.0.2
git push origin main --tags
```

### 3. GitHub Actions Builds Binaries

The workflow (`.github/workflows/release.yml`) automatically:
- Triggers on tag push (`v*`)
- Builds on macOS, Linux, Windows runners
- Creates platform-specific executables
- Attaches them to GitHub Release

Wait for the workflow to complete (~5-10 minutes).

### 4. Verify Release

Check that binaries are attached:
```
https://github.com/martinsione/shadcnify.com/releases/tag/v0.0.2
```

Should have:
- `shadcnify-macos-arm64`
- `shadcnify-macos-x64`
- `shadcnify-linux-x64`
- `shadcnify-linux-arm64`
- `shadcnify-windows-x64.exe`

### 5. Publish to npm

```bash
cd apps/cli
npm publish --access public
```

The npm package is small (~10KB) - it only contains:
- `scripts/postinstall.js` - downloads the right binary
- `bin/shadcnify` - placeholder
- `README.md`

## How Users Install

### Global Install
```bash
npm install -g shadcnify
# postinstall downloads the binary for their platform
shadcnify
```

### npx (one-time use)
```bash
npx shadcnify
# Downloads and runs
```

## Updating

To publish a new version:

```bash
# 1. Make changes
git commit -am "feat: new feature"

# 2. Bump version
npm version patch

# 3. Push with tag
git push origin main --tags

# 4. Wait for GitHub Actions to build

# 5. Publish to npm
npm publish
```

## Troubleshooting

### Postinstall fails
Users can manually download from GitHub:
```
https://github.com/martinsione/shadcnify.com/releases
```

### Build fails in Actions
- Check runner platform compatibility
- Verify Bun version in workflow
- Check OpenTUI dependencies are installed

### Wrong binary downloaded
The postinstall script detects:
- `process.platform`: darwin, linux, win32
- `process.arch`: x64, arm64

## Manual Testing Before Publishing

Test the postinstall locally:

```bash
# Pack the package
npm pack

# Install in another directory
cd /tmp
npm install -g /path/to/shadcnify-0.0.2.tgz

# Test it
shadcnify
```

## Platform Support

| Platform | Architecture | Binary Name |
|----------|--------------|-------------|
| macOS | ARM64 (M1/M2/M3) | `shadcnify-macos-arm64` |
| macOS | x64 (Intel) | `shadcnify-macos-x64` |
| Linux | x64 | `shadcnify-linux-x64` |
| Windows | x64 | `shadcnify-windows-x64.exe` |

**Note:** Linux ARM64 is not supported due to cross-compilation limitations with OpenTUI's native dependencies.

## File Sizes

- npm package: ~10KB (just scripts)
- Each binary: ~66MB (includes Bun runtime)
- User downloads only one binary for their platform

## Notes

- Binaries are downloaded ONCE during installation
- No Bun dependency required for end users
- Fast startup (native executable)
- Automatic platform detection
