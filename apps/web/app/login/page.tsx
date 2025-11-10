"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to the intended destination
  useEffect(() => {
    if (!isSessionPending && session) {
      const destination = redirect || "/";
      router.push(destination);
    }
  }, [session, isSessionPending, redirect, router]);

  const handleGithubSignIn = () => {
    setError(null);
    startTransition(async () => {
      try {
        // Store redirect in localStorage before OAuth redirect
        if (redirect) {
          localStorage.setItem("auth_redirect", redirect);
        }
        
        await authClient.signIn.social({
          provider: "github",
          callbackURL: redirect || "/",
        });
      } catch (err) {
        setError("Failed to sign in with GitHub");
        console.error("Sign in error:", err);
      }
    });
  };

  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-muted-foreground">
              {redirect?.includes("/device/approve")
                ? "Sign in to authorize the device request"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGithubSignIn}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="space-y-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p>Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

