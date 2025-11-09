import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { RegistryView } from "@/components/registry-view";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await sql`
    SELECT id, name, description, files, created_at, updated_at
    FROM registries
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!result || result.length === 0) {
    notFound();
  }

  const registry = result[0];

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
