"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const activeTab = pathname === "/my-registries" ? "my-registries" : "create";

  return (
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
  );
}

