"use client";

import { authClient } from "@/lib/auth/client";
import { RegistryForm } from "@/components/registry-form";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";

function UserButton() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isPending, startTransition] = useTransition();

  function handleSignIn() {
    startTransition(async () => {
      try {
        await authClient.signIn.social({ provider: "github" });
      } catch (error) {
        toast.error("Failed to sign in");
      }
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      try {
        await authClient.signOut();
      } catch (error) {
        toast.error("Failed to sign out");
      }
    });
  }

  if (isSessionPending) {
    return null;
  }

  if (!session?.user?.id) {
    return (
      <Button onClick={handleSignIn} disabled={isPending}>
        Continue with Github
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session?.user?.image ?? undefined} />
          <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
          <LogOutIcon className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold font-mono">
              shadcn registry generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share your components with the shadcn ecosystem
            </p>
          </div>
          <div className="flex justify-end">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <RegistryForm />
      </main>
    </div>
  );
}
