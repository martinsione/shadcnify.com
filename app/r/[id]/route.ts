import type { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import {
  extractDependencies,
  extractRegistryDependencies,
  detectFileType,
} from "@/lib/utils/dependency-parser";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT id, name, description, files
      FROM registries
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return Response.json({ error: "Registry not found" }, { status: 404 });
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

    const shadcnRegistry = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: registry.name,
      type: "registry:block",
      description: registry.description || undefined,
      dependencies: Array.from(allDependencies),
      registryDependencies: Array.from(allRegistryDependencies),
      files: files.map((file) => ({
        path: file.path,
        content: file.content,
        type: detectFileType(file.path, file.content),
        target: `~/${file.path}`,
      })),
    };

    return Response.json(shadcnRegistry);
  } catch (error) {
    console.error("[v0] Error fetching registry:", error);
    return Response.json(
      { error: "Failed to fetch registry" },
      { status: 500 },
    );
  }
}
