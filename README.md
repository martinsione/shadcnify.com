# Shadcnify

<div align="center">

**Create and share custom shadcn/ui component registries**

[![Website](https://img.shields.io/badge/Website-shadcnify.com-blue?style=flat-square)](https://shadcnify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


<img width="600px" alt="Image" src="https://github.com/user-attachments/assets/d4afb3ba-e00c-403e-922a-d81aabe6c45b" />
</div>

## What is Shadcnify?

Shadcnify makes it easy to share your React components as [shadcn/ui](https://ui.shadcn.com) registries. Select files from your project, publish them with our CLI, and get an installable registry URL instantly.


```bash
npx shadcnify
```

## Features

- 🚀 **Quick Publishing** - Select and publish components in seconds
- 🔍 **Fuzzy Search** - Fast file filtering with smart search
- ⌨️ **Keyboard Driven** - Efficient TUI interface
- 🌐 **Web Dashboard** - View and manage your published registries
- 📦 **Compatible** - Works seamlessly with shadcn/ui CLI
- 🔒 **Authentication** - Secure registry management with GitHub/Google OAuth

## Repository Structure

This is a monorepo powered by [Turbo](https://turbo.build/repo) and [Bun](https://bun.sh):

```
shadcnify.com/
├── apps/
│   ├── cli/         # Command-line interface for publishing
│   └── web/         # Next.js web app for registry hosting
└── package.json     # Workspace root
```

## Quick Start

### Using the CLI

```bash
# Run with npx (no installation needed)
npx shadcnify

# Or install globally
npm install -g shadcnify
shadcnify
```

The CLI will:

1. Scan your project for files
2. Let you select which files to publish
3. Upload them to shadcnify.com
4. Give you an installation command

### Installing from a Registry

Once published, others can install your components:

```bash
npx shadcn@latest add https://shadcnify.com/r/your-registry-id
```

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.3.2 or later
- Node.js 18+ (for some dependencies)

### Setup

```bash
# Clone the repository
git clone https://github.com/martinsione/shadcnify.com
cd shadcnify.com

# Install dependencies
bun install

# Run in development mode
bun dev
```

This will start:

- **CLI**: `apps/cli` - Development mode with hot reload
- **Web**: `apps/web` - Next.js dev server at http://localhost:3000

### Individual Apps

```bash
# Work on CLI only
cd apps/cli
bun dev

# Work on web app only
cd apps/web
bun dev
```

## Building

```bash
# Build all apps
bun run build

# Build specific app
cd apps/cli && bun run build
cd apps/web && bun run build
```

## CLI Documentation

The CLI provides an interactive terminal interface for publishing components:

**Keyboard Shortcuts:**

- `↑/↓` - Navigate files
- `Space` - Toggle selection
- `Enter` - Publish selected files
- `Type` - Search/filter files
- `Ctrl+C` - Exit

**Configuration:**

- `API_ENDPOINT` - Override API endpoint (default: https://shadcnify.com/api/registry)

See [apps/cli/README.md](apps/cli/README.md) for more details.

## Web App

The web application provides:

- Registry hosting and viewing
- Code preview with syntax highlighting
- User authentication (GitHub/Google)
- Registry management dashboard

Built with:

- Next.js 16
- React 19
- Drizzle ORM + Neon Postgres
- Better Auth
- shadcn/ui components
- Tailwind CSS

## Tech Stack

### CLI

- [Bun](https://bun.sh) - Runtime and bundler
- [OpenTUI](https://opentui.org) - Terminal UI framework
- [React](https://react.dev) - For UI components in the terminal
- [Fuse.js](https://fusejs.io) - Fuzzy search

### Web

- [Next.js](https://nextjs.org) - React framework
- [Drizzle ORM](https://orm.drizzle.team) - Database toolkit
- [Better Auth](https://better-auth.com) - Authentication
- [Neon](https://neon.tech) - Serverless Postgres
- [Vercel](https://vercel.com) - Hosting

## Scripts

```bash
bun dev         # Start all apps in development
bun build       # Build all apps for production
bun typecheck   # Type check all apps
bun format      # Format code with Prettier
bun lint        # Lint all apps
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Martin Sione](https://github.com/martinsione)

## Links

- [Website](https://shadcnify.com)
- [GitHub](https://github.com/martinsione/shadcnify.com)
- [Issues](https://github.com/martinsione/shadcnify.com/issues)
- [shadcn/ui](https://ui.shadcn.com)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/martinsione">Martin Sione</a>
</div>
