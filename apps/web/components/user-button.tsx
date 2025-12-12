"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Skeleton shown during loading
function UserButtonSkeleton() {
  return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
}

/**
 * UserButton - Client component that manages its own session state.
 * Uses better-auth's useSession hook which:
 * 1. Caches session client-side (like react-query)
 * 2. Persists across navigations
 * 3. Automatically refetches when needed (login/logout)
 */
export function UserButton() {
  const { data: session, isPending } = authClient.useSession();
  const [isActionPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

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

  // Show skeleton while loading session
  if (isPending) {
    return <UserButtonSkeleton />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <Button onClick={handleSignIn} disabled={isActionPending}>
        Continue with Github
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <div className="flex justify-between items-center gap-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              {[
                { icon: Monitor, value: "system" },
                { icon: Sun, value: "light" },
                { icon: Moon, value: "dark" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTheme(item.value)}
                  className={cn(
                    "flex items-center justify-center size-6 rounded-sm",
                    theme === item.value
                      ? "bg-background border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isActionPending}>
          <LogOutIcon className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
