import { cache } from "react";
import { auth } from "@/lib/auth/better-auth-config";
import { headers } from "next/headers";

/**
 * Cached session getter - deduplicates session fetching within a single request.
 * Call this as many times as needed in RSC - it only hits the auth API once per request.
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

/**
 * Get the current user from session, returns null if not authenticated.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});
