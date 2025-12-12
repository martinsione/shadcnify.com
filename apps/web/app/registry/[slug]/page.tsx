import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RegistryView } from "@/components/registry-view";
import { LikesLoader, LikesSkeleton } from "@/components/likes-loader";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import { getRegistryBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const registry = await getRegistryBySlug(slug);

  if (!registry) {
    return {
      title: "Registry Not Found | shadcnify.com",
    };
  }

  const files = registry.files as Array<{ path: string; content: string }>;
  const fileCount = files.length;
  const description =
    registry.description ||
    `${registry.name} - A shadcn/ui registry with ${fileCount} ${fileCount === 1 ? "file" : "files"}. Install with npx shadcn@latest add.`;

  return {
    title: `${registry.name} | shadcnify.com`,
    description,
    openGraph: {
      title: registry.name,
      description,
      type: "website",
      siteName: "shadcnify.com",
    },
    twitter: {
      card: "summary_large_image",
      title: registry.name,
      description,
    },
  };
}

// Cached registry data loader
async function getRegistryData(slug: string) {
  "use cache";

  const registry = await getRegistryBySlug(slug);
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await getRegistryData(slug);

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
          <LikesLoader registryId={data.registry.id} />
        </Suspense>
      }
    />
  );
}
