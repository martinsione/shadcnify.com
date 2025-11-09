# Shadcnify CLI

A command-line interface for publishing components to Shadcnify registries. Select files from your project and publish them as a registry that can be installed with shadcn/ui.

## Installation

### For End Users

```bash
# Install globally
npm install -g shadcnify

# Or use npx (no installation needed)
npx shadcnify
```

The CLI automatically downloads the correct binary for your platform (macOS, Linux, or Windows).

### For Development

```bash
# Clone the repo
git clone https://github.com/martinsione/shadcnify.com
cd shadcnify.com/apps/cli

# Install dependencies
bun install

# Run in dev mode
bun run dev
```

### How It Works

1. The CLI scans your current directory for files (respecting `.gitignore`)
2. Use arrow keys to navigate, spacebar to select files
3. Type to search/filter files with fuzzy matching
4. Press Enter to publish selected files
5. Get your registry URL and installation command

## Building

To build the standalone executable for your current platform:

```bash
bun run build
```

This creates a single binary at `dist/shadcnify` (~66MB) that includes the entire Bun runtime and all dependencies.

**Note:** Due to OpenTUI's native dependencies, you can only build for your current platform. Cross-compilation is not supported.

## Configuration

### Environment Variables

- `API_ENDPOINT` - The API endpoint for registry creation
  - Default: `https://shadcnify.com/api/registry` (production)
  - Development: `http://localhost:3000/api/registry`

To use a custom endpoint:

```bash
API_ENDPOINT=https://your-domain.com/api/registry ./dist/shadcnify
```

## Features

- 📁 Automatic file discovery with gitignore support
- 🔍 Fuzzy search file filtering
- ⌨️ Keyboard-driven interface
- 🚀 Direct publishing to Shadcnify
- 📋 Get installation command instantly

## Keyboard Shortcuts

- `↑/↓` - Navigate files
- `Space` - Toggle file selection
- `Enter` - Submit selected files
- `Backspace` - Clear search
- `Type` - Search/filter files
- `Ctrl+C` - Exit

---

This project was created using `bun create tui`. [create-tui](https://git.new/create-tui) is the easiest way to get started with OpenTUI.
