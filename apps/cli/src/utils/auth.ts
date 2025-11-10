import { join } from "path";
import { homedir } from "os";
import { mkdir, readFile, writeFile, rm } from "fs/promises";

const CONFIG_DIR = join(homedir(), ".shadcnify");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface AuthConfig {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

/**
 * Get stored authentication data
 */
export async function getStoredAuth(): Promise<AuthConfig | null> {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data) as AuthConfig;
  } catch (error) {
    return null;
  }
}

/**
 * Save authentication data
 */
export async function saveAuth(
  accessToken: string,
  user: AuthConfig["user"],
): Promise<void> {
  try {
    // Ensure config directory exists
    await mkdir(CONFIG_DIR, { recursive: true });

    const config: AuthConfig = {
      accessToken,
      user,
    };

    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to save authentication: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Clear stored authentication data
 */
export async function clearAuth(): Promise<void> {
  try {
    await rm(CONFIG_FILE);
  } catch (error) {
    // If file doesn't exist, that's fine
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error(
        `Failed to clear authentication: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const auth = await getStoredAuth();
  return auth !== null && auth.accessToken !== undefined;
}

/**
 * Get stored user information
 */
export async function getUser(): Promise<AuthConfig["user"] | null> {
  const auth = await getStoredAuth();
  return auth?.user ?? null;
}

