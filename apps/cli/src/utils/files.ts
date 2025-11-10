import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import ignore from "ignore";

/**
 * Common directories to ignore when no .gitignore is present
 */
const DEFAULT_IGNORE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  ".turbo/**",
  "coverage/**",
  ".cache/**",
  ".vercel/**",
  ".netlify/**",
  "out/**",
  "**/node_modules/**",
  "**/.git/**",
];

/**
 * Recursively list all files in a directory
 */
async function listFilesRecursive(
  dir: string,
  baseDir: string = dir,
): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await listFilesRecursive(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Store relative path from baseDir
        const relativePath = relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Ignore permission errors and continue
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Parse .gitignore file if it exists
 */
async function parseGitignore(
  baseDir: string,
): Promise<ReturnType<typeof ignore> | null> {
  try {
    const gitignorePath = join(baseDir, ".gitignore");
    const file = Bun.file(gitignorePath);

    if (await file.exists()) {
      const content = await file.text();
      const ig = ignore().add(content);
      return ig;
    }
  } catch (error) {
    // .gitignore doesn't exist or can't be read
  }

  return null;
}

/**
 * Create an ignore instance with default patterns
 */
function createDefaultIgnore(): ReturnType<typeof ignore> {
  return ignore().add(DEFAULT_IGNORE_PATTERNS);
}

/**
 * List all files in the current directory, respecting .gitignore or default ignores
 */
export async function listFiles(
  baseDir: string = process.cwd(),
): Promise<string[]> {
  // Get all files recursively
  const allFiles = await listFilesRecursive(baseDir, baseDir);

  // Parse .gitignore or use defaults
  let ig = await parseGitignore(baseDir);

  if (!ig) {
    ig = createDefaultIgnore();
  } else {
    // Add default patterns to the gitignore patterns
    ig.add(DEFAULT_IGNORE_PATTERNS);
  }

  // Filter files based on ignore rules
  const filteredFiles = allFiles.filter((file) => {
    // Also manually filter out .git files and hidden directories
    if (file.startsWith(".git/") || file.includes("/.git/")) {
      return false;
    }
    return !ig!.ignores(file);
  });

  return filteredFiles.sort();
}

/**
 * Read file contents using Bun
 */
export async function readFileContents(
  filePath: string,
  baseDir: string = process.cwd(),
): Promise<string> {
  const fullPath = join(baseDir, filePath);
  const file = Bun.file(fullPath);
  return await file.text();
}

/**
 * Read multiple files and return their paths and contents
 */
export async function readMultipleFiles(
  filePaths: string[],
  baseDir: string = process.cwd(),
): Promise<Array<{ path: string; content: string }>> {
  const results = await Promise.all(
    filePaths.map(async (path) => {
      try {
        const content = await readFileContents(path, baseDir);
        return { path, content };
      } catch (error) {
        console.error(`Error reading file ${path}:`, error);
        return { path, content: "" };
      }
    }),
  );

  return results;
}
