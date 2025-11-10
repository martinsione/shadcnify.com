import { clearAuth, isAuthenticated } from "../utils/auth";

export async function logoutCommand() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    console.log("❌ Not logged in\n");
    process.exit(0);
  }

  try {
    await clearAuth();
    console.log("✓ Logged out successfully\n");
    console.log("To log in again, run:");
    console.log("  npx shadcnify login\n");
    process.exit(0);
  } catch (err) {
    console.error(
      "❌ Error logging out:",
      err instanceof Error ? err.message : "Unknown error",
    );
    process.exit(1);
  }
}

