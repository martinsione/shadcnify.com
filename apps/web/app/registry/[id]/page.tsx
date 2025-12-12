import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegistryView } from "@/components/registry-view";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import {
  getRegistryById,
  getRegistryLikeCount,
  hasUserLikedRegistry,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth/better-auth-config";
import { headers } from "next/headers";

// Server component that fetches all data
export default async function RegistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const registry = await getRegistryById(id);

  if (!registry) {
    notFound();
  }

  // Fetch like data on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [likeCount, isLiked] = await Promise.all([
    getRegistryLikeCount(id),
    session?.user?.id
      ? hasUserLikedRegistry(session.user.id, id)
      : Promise.resolve(false),
  ]);

  const files = registry.files as Array<{ path: string; content: string }>;
  const allDependencies = new Set<string>();
  const allRegistryDependencies = new Set<string>();

  files.forEach((file) => {
    const deps = extractDependencies(file.content);
    const regDeps = extractRegistryDependencies(file.content);

    deps.forEach((dep) => allDependencies.add(dep));
    regDeps.forEach((dep) => allRegistryDependencies.add(dep));
  });

  return (
    <RegistryView
      registry={registry}
      dependencies={Array.from(allDependencies)}
      registryDependencies={Array.from(allRegistryDependencies)}
      initialLikeCount={likeCount}
      initialIsLiked={isLiked}
    />
  );
}
