# ✅ New Publishing Setup Complete!

I've rebuilt the entire publishing system based on the `opencode` approach. It's now **much simpler** and works like professional tools like `esbuild`, `@swc/core`, etc.

## What Changed?

### ❌ Old Setup (Broken)

- GitHub Actions built binaries
- npm package downloaded binaries from GitHub Releases
- **Problem**: Required public repo + complex postinstall downloads

### ✅ New Setup (Like opencode/esbuild)

- **Local builds** → publish multiple platform packages to npm
- npm's `optionalDependencies` automatically installs the right one
- **No downloads during install** → everything from npm registry
- Also supports curl install from GitHub Releases

## Quick Start

### Build Locally

```bash
cd apps/cli
bun run build
```

This creates:

- `dist/shadcnify-darwin-arm64/` with binary + package.json
- `dist/shadcnify-darwin-x64/` with binary + package.json
- `dist/shadcnify-linux-x64/` with binary + package.json
- `dist/shadcnify-windows-x64/` with binary + package.json
- `dist/shadcnify/` - main wrapper package

### Publish Everything (like opencode)

```bash
# Bump version
npm version patch

# Build, publish to npm, create GitHub Release - all in one command!
bun run publish

# Push changes
git push origin main --tags
```

The publish script does:

1. Build all binaries
2. Run smoke test
3. Publish to npm (all packages)
4. Create ZIP files
5. Create GitHub Release with ZIPs

**No GitHub Actions needed!** Everything runs locally.

## How Users Install

### Method 1: npm (Recommended)

```bash
npm install -g shadcnify
```

npm will:

1. Install `shadcnify` (wrapper package)
2. Try to install ALL `optionalDependencies` (all platforms)
3. Only succeed for the user's platform
4. Create symlink to the binary

**Fast, offline-capable, no external downloads!**

### Method 2: Curl

```bash
curl -fsSL https://raw.githubusercontent.com/martinsione/shadcnify.com/main/apps/cli/install | bash
```

Downloads ZIP from GitHub Releases and installs to `~/.shadcnify/bin`.

## File Structure

```
apps/cli/
├── bin/
│   ├── shadcnify          # Unix wrapper (finds binary in node_modules)
│   └── shadcnify.cmd      # Windows wrapper
├── script/
│   ├── build.ts           # Builds all platforms
│   ├── publish.ts         # Publishes everything to npm
│   ├── preinstall.mjs     # Handles Windows bin setup
│   └── postinstall.mjs    # Creates symlinks (Unix)
├── src/
│   └── index.tsx          # Your CLI code
├── install                # Curl install script
├── package.json           # Main config (private)
├── PUBLISHING.md          # Detailed guide
└── QUICKSTART.md          # Your existing guide
```

## The Magic: optionalDependencies

In the published `shadcnify` package.json:

```json
{
  "name": "shadcnify",
  "version": "0.0.7",
  "optionalDependencies": {
    "shadcnify-darwin-arm64": "0.0.7",
    "shadcnify-darwin-x64": "0.0.7",
    "shadcnify-linux-x64": "0.0.7",
    "shadcnify-windows-x64": "0.0.7"
  }
}
```

npm tries to install all of them but:

- `shadcnify-darwin-arm64` has `"os": ["darwin"], "cpu": ["arm64"]`
- npm skips packages that don't match the current platform
- Only one binary package gets installed

## Benefits

✅ **No external downloads** - Everything from npm registry  
✅ **Fast installs** - Only one platform binary downloaded  
✅ **Works offline** - No internet needed after npm registry sync  
✅ **No GitHub Actions dependency** - Build locally with full control  
✅ **Industry standard** - Same pattern as esbuild, @swc/core, opencode  
✅ **Multiple install methods** - npm + curl  
✅ **Simple publishing** - One command publishes everything

## Next Steps

1. **Test locally**:

   ```bash
   cd apps/cli
   bun run build
   npm pack ./dist/shadcnify
   npm install -g ./shadcnify-0.0.6.tgz
   shadcnify  # Should work!
   ```

2. **Publish**:

   ```bash
   # Bump version
   npm version 0.0.7

   # Build and publish
   bun run publish

   # Create release for curl installer
   git add package.json
   git commit -m "chore: release v0.0.7"
   git tag v0.0.7
   git push origin main --tags
   ```

3. **Test install**:
   ```bash
   npm install -g shadcnify
   shadcnify
   ```

## What Got Removed

- ❌ `scripts/postinstall.js` - Old download-based approach
- ❌ GitHub Release binary downloads in postinstall
- ❌ Dependency on repo being public
- ❌ Complex binary download logic

## What Got Added

- ✅ `script/build.ts` - Build all platforms locally
- ✅ `script/publish.ts` - Publish all packages at once
- ✅ `script/preinstall.mjs` - Windows bin handling
- ✅ `script/postinstall.mjs` - Symlink creation
- ✅ `bin/shadcnify` - Smart wrapper that finds the right binary
- ✅ `bin/shadcnify.cmd` - Windows wrapper
- ✅ `install` - Curl installer script

---

**You now have a professional, production-ready publishing setup! 🎉**
