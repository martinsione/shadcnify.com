import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

// Get the base URL from environment or default to production
// Use localhost only if explicitly set via environment variable
const BASE_URL =
  process.env.SHADCNIFY_API_URL || "https://shadcnify.com";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [deviceAuthorizationClient()],
});

