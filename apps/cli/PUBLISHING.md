# Publishing Guide

This package uses the **optionalDependencies** pattern for cross-platform distribution, similar to `@esbuild` and `opencode`.

## Architecture

1. **Platform-specific packages**: `shadcnify-darwin-arm64`, `shadcnify-darwin-x64`, `shadcnify-linux-x64`, `shadcnify-windows-x64`
   - Each contains only the compiled binary for that platform
   
2. **Main wrapper package**: `shadcnify`
   - Contains shell scripts that find and execute the right binary
   - Lists all platform packages as `optionalDependencies`
   - npm/bun/pnpm automatically installs only the matching platform package

3. **Curl installer**: `curl -fsSL https://shadcnify.com/install.sh | bash`
   - Downloads ZIP files from GitHub Releases
   - Installs to `~/.shadcnify/bin`

## Publishing Workflow

Everything is done locally in one command (like opencode):

```bash
cd apps/cli

# Update version
npm version patch  # or minor/major

# Build, publish to npm, create GitHub Release with ZIPs
bun run publish

# Push changes
git push origin main --tags
```

The `bun run publish` script will:
1. Build all platform binaries
2. Run smoke test on your platform
3. Publish all packages to npm
4. Create ZIP files
5. Create GitHub Release with ZIPs attached

**No GitHub Actions needed!** Everything is local.

## Installation Methods

### npm/bun/pnpm

```bash
npm install -g shadcnify
# or
bun install -g shadcnify
# or
pnpm install -g shadcnify
```

The package manager will:
1. Install the `shadcnify` wrapper package
2. Automatically install the matching `shadcnify-<platform>-<arch>` package
3. Run postinstall to create symlinks

### Curl (manual installation)

```bash
curl -fsSL https://raw.githubusercontent.com/martinsione/shadcnify.com/main/apps/cli/install | bash
```

This downloads the ZIP from GitHub Releases and installs to `~/.shadcnify/bin`.

## How It Works

When a user runs `npm install -g shadcnify`:

1. npm sees `optionalDependencies` in the main package
2. npm tries to install ALL optional deps but only succeeds for the matching platform
3. The postinstall script creates a symlink from `bin/shadcnify` → `node_modules/shadcnify-<platform>-<arch>/bin/shadcnify`
4. When user runs `shadcnify`, the shell script wrapper finds the binary and executes it

## Benefits

✅ **Small npm package** - Main package is tiny (~20KB)  
✅ **Fast installs** - Only downloads one platform binary  
✅ **No postinstall downloads** - npm handles everything  
✅ **Works offline** - No external downloads during install  
✅ **Multiple install methods** - npm + curl  
✅ **No GitHub Actions for npm** - Build locally with full control  

## File Structure

```
apps/cli/
├── bin/
│   ├── shadcnify          # Shell wrapper for Unix
│   └── shadcnify.cmd      # Wrapper for Windows
├── script/
│   ├── build.ts           # Builds all platform binaries
│   ├── publish.ts         # Publishes all packages to npm
│   ├── preinstall.mjs     # Windows bin handling
│   └── postinstall.mjs    # Creates symlinks
├── install                # Curl install script
├── src/
│   └── index.tsx          # CLI source code
└── package.json           # Main package (private, not published)
```

## Notes

- The main `package.json` is `private: true` - it's not published
- Platform packages are auto-generated during build
- Wrapper package is auto-generated during build
- GitHub Actions creates ZIP files for curl installer
- npm publishing and GitHub releases are separate processes
