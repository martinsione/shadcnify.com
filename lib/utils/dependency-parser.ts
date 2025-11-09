/**
 * Extracts npm dependencies from TypeScript/JavaScript file content
 */
export function extractDependencies(content: string): string[] {
  const dependencies = new Set<string>();

  // Match import statements: import ... from 'package' or import ... from "package"
  const importRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g;
  // Match dynamic imports: import('package')
  const dynamicImportRegex = /import\s*$$\s*['"]([^'"]+)['"]\s*$$/g;
  // Match require: require('package')
  const requireRegex = /require\s*$$\s*['"]([^'"]+)['"]\s*$$/g;

  const allMatches = [
    ...content.matchAll(importRegex),
    ...content.matchAll(dynamicImportRegex),
    ...content.matchAll(requireRegex),
  ];

  for (const match of allMatches) {
    const pkg = match[1];

    // Skip relative imports (start with . or /)
    if (pkg.startsWith(".") || pkg.startsWith("/")) continue;

    // Skip Next.js internal imports
    if (pkg.startsWith("next/") || pkg === "next") continue;

    // Skip React (assumed to be installed)
    if (pkg === "react" || pkg === "react-dom") continue;

    // Skip @/ alias imports (internal project files)
    if (pkg.startsWith("@/")) continue;

    // Extract package name (handle scoped packages like @radix-ui/react-dialog)
    const packageName = pkg.startsWith("@")
      ? pkg.split("/").slice(0, 2).join("/")
      : pkg.split("/")[0];

    dependencies.add(packageName);
  }

  return Array.from(dependencies).sort();
}

/**
 * Extracts shadcn/ui component dependencies from TypeScript/JavaScript file content
 */
export function extractRegistryDependencies(content: string): string[] {
  const registryDeps = new Set<string>();

  // Match imports from @/components/ui/*
  const uiImportRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;

  for (const match of content.matchAll(uiImportRegex)) {
    const componentFile = match[1];
    // Remove .tsx, .ts, .jsx, .js extensions if present
    const componentName = componentFile.replace(/\.(tsx?|jsx?)$/, "");
    registryDeps.add(componentName);
  }

  return Array.from(registryDeps).sort();
}

/**
 * Detects the type of file based on content and path
 */
export function detectFileType(path: string, content: string): string {
  // Check if it's a component file
  if (path.includes("/components/") || path.includes("/ui/")) {
    return "registry:component";
  }

  // Check if it's a hook
  if (path.includes("/hooks/") || path.match(/use-[a-z-]+\.(ts|tsx|js|jsx)$/)) {
    return "registry:hook";
  }

  // Check if it's a lib/utility file
  if (path.includes("/lib/") || path.includes("/utils/")) {
    return "registry:lib";
  }

  // Default to file
  return "registry:file";
}
