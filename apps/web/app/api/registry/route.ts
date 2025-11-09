import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import * as schema from "@/lib/db/schema";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, files } = body;

    // Validate files array
    if (!files || !Array.isArray(files) || files.length === 0) {
      return Response.json(
        { error: "Files array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate each file has path and content
    for (const file of files) {
      if (!file.path || typeof file.path !== "string" || !file.path.trim()) {
        return Response.json(
          { error: "Each file must have a valid path" },
          { status: 400 }
        );
      }
      if (!file.content || typeof file.content !== "string") {
        return Response.json(
          { error: "Each file must have content" },
          { status: 400 }
        );
      }
    }

    // Generate registry name if not provided
    const registryName = name?.trim() || `registry-${nanoid(4)}`;

    // Generate registry ID
    const id = nanoid(8);

    // Create registry in database (userId is null for anonymous/CLI registries)
    const registry = await db
      .insert(schema.registries)
      .values({
        id,
        name: registryName,
        description: description?.trim() || null,
        files,
        userId: null, // Anonymous registry from CLI
      })
      .returning()
      .then((result) => result[0]);

    // Construct URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shadcnify.com";
    const registryUrl = `${baseUrl}/registry/${registry.id}`;
    const installUrl = `${baseUrl}/r/${registry.id}`;
    const installCommand = `npx shadcn@latest add ${installUrl}`;

    return Response.json({
      success: true,
      registry: {
        id: registry.id,
        name: registry.name,
        description: registry.description,
        url: registryUrl,
        installCommand,
      },
    });
  } catch (error) {
    console.error("[API] Registry creation error:", error);
    
    // Check for database errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return Response.json(
        { error: "A registry with this ID already exists. Please try again." },
        { status: 409 }
      );
    }

    return Response.json(
      {
        error: "Failed to create registry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

