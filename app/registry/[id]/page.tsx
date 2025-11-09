import { notFound } from "next/navigation";
import { RegistryView } from "@/components/registry-view";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import { getRegistryById, getRegistryLikeCount } from "@/lib/db/queries";

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const registry = await getRegistryById(id);
  const likeCountPromise = getRegistryLikeCount(id);

  if (!registry) {
    notFound();
  }

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
    />
  );
}
