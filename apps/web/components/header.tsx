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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOutIcon, Moon, Sun, Monitor, Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function UserButton() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isPending, startTransition] = useTransition();
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
        <div className="px-2 py-2">
          <div className="flex justify-between items-center gap-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              {[
                {
                  icon: Monitor,
                  value: "system",
                },
                {
                  icon: Sun,
                  value: "light",
                },
                {
                  icon: Moon,
                  value: "dark",
                },
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
        <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
          <LogOutIcon className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const activeTab = pathname === "/my-registries" ? "my-registries" : "create";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
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
        <div className="h-9">
          <Tabs value={activeTab} className="w-full">
            <TabsList>
              <TabsTrigger value="create" asChild>
                <Link href="/">Create</Link>
              </TabsTrigger>
              <TabsTrigger value="my-registries" asChild>
                <Link href="/my-registries">My Registries</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
}
