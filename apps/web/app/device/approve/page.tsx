"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";

function UserMail({ userCode }: { userCode: string }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  // Handle redirect in useEffect to avoid updating during render
  useEffect(() => {
    // Only redirect if we're sure there's no session (not just loading)
    if (!isPending && !session) {
      router.push(`/login?redirect=/device/approve?user_code=${userCode}`);
    }
  }, [session, isPending, router, userCode]);

  if (isPending) {
    return (
      <div className="h-6 w-full bg-neutral-200 animate-pulse rounded-md dark:bg-neutral-800" />
    );
  }

  return <p className="h-6">{session?.user?.email}</p>;
}

function DeviceApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isDenyPending, startDenyTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    if (!userCode) return;

    setError(null);

    startApproveTransition(async () => {
      try {
        await authClient.device.approve({
          userCode,
        });
        router.push("/device/success");
      } catch (err: any) {
        setError(err.error?.message || "Failed to approve device");
      }
    });
  };

  const handleDeny = () => {
    if (!userCode) return;

    setError(null);

    startDenyTransition(async () => {
      try {
        await authClient.device.deny({
          userCode,
        });
        router.push("/device/denied");
      } catch (err: any) {
        setError(err.error?.message || "Failed to deny device");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Approve Device</h1>
            <p className="text-muted-foreground mt-2">
              A device is requesting access to your account
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Device Code</p>
              <p className="font-mono text-lg">{userCode}</p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Signed in as</p>
              <UserMail />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeny}
                variant="outline"
                className="flex-1"
                disabled={isDenyPending}
              >
                {isDenyPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Deny
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1"
                disabled={isApprovePending}
              >
                {isApprovePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function DeviceApprovalPage() {
  return (
    <Suspense fallback={<div />}>
      <DeviceApprovalContent />
    </Suspense>
  );
}
