import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

// Get the base URL from environment or default to localhost for development
const BASE_URL =
  process.env.SHADCNIFY_API_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [deviceAuthorizationClient()],
});

