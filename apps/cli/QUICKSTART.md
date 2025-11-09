# Quick Start: Publishing to All Platforms

## 🚀 Ready to Publish?

Follow these steps to publish `shadcnify` with support for **all platforms** (macOS, Linux, Windows):

### Step 1: Test Locally

```bash
cd apps/cli

# Build the binary
bun run build

# Test it works
./dist/shadcnify
```

### Step 2: Create a Release

```bash
# Bump version
npm version patch

# Commit and push with tag
git add .
git commit -m "chore: release v0.0.2"
git push origin main

# Push the tag (this triggers GitHub Actions)
git push origin v0.0.2
```

### Step 3: Wait for GitHub Actions

GitHub Actions will automatically:
1. Build binaries for all platforms
2. Create a GitHub Release
3. Attach all binaries to the release

Monitor progress at:
```
https://github.com/martinsione/shadcnify.com/actions
```

### Step 4: Publish to npm

Once GitHub Actions completes:

```bash
cd apps/cli
npm publish --access public
```

### Step 5: Test Installation

```bash
# In a different directory
npx shadcnify@latest
```

## ✅ Done!

Users can now install on **any platform**:

```bash
npm install -g shadcnify
shadcnify
```

The postinstall script automatically downloads the right binary for their platform from GitHub Releases.

## 📦 What Gets Published

- **npm package**: 3KB (scripts only)
- **GitHub Release**: ~264MB (4 binaries × 66MB each)
- **User downloads**: 66MB (only their platform's binary)

**Supported platforms:** macOS (ARM64/x64), Linux (x64), Windows (x64)

## 🔄 Updating

For future releases:

```bash
npm version patch
git push origin main --tags
# Wait for Actions
npm publish
```

## 🐛 Troubleshooting

If GitHub Actions fails:
- Check the workflow logs in Actions tab
- Verify you have push access to the repo
- Ensure all dependencies are in package.json

If npm publish fails:
- Make sure you're logged in: `npm login`
- Check package name availability: `npm view shadcnify`
- Use `--access public` for scoped packages

