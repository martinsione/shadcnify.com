import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegistryView } from "@/components/registry-view";
import { LikesLoader, LikesSkeleton } from "@/components/likes-loader";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import { getRegistryById } from "@/lib/db/queries";

// Cached registry data loader
async function getRegistryData(id: string) {
  "use cache";

  const registry = await getRegistryById(id);
  if (!registry) return null;

  const files = registry.files as Array<{ path: string; content: string }>;
  const allDependencies = new Set<string>();
  const allRegistryDependencies = new Set<string>();

  files.forEach((file) => {
    const deps = extractDependencies(file.content);
    const regDeps = extractRegistryDependencies(file.content);

    deps.forEach((dep) => allDependencies.add(dep));
    regDeps.forEach((dep) => allRegistryDependencies.add(dep));
  });

  return {
    registry,
    dependencies: Array.from(allDependencies),
    registryDependencies: Array.from(allRegistryDependencies),
  };
}

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getRegistryData(id);

  if (!data) {
    notFound();
  }

  return (
    <RegistryView
      registry={data.registry}
      dependencies={data.dependencies}
      registryDependencies={data.registryDependencies}
      likesSlot={
        <Suspense fallback={<LikesSkeleton />}>
          <LikesLoader registryId={id} />
        </Suspense>
      }
    />
  );
}
