"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { authClient } from "@/lib/auth/client";
import * as schema from "@/lib/db/schema";
import { db } from "@/lib/db";

export async function createRegistry(formData: {
  name: string;
  description?: string;
  files: Array<{ path: string; content: string }>;
}) {
  try {
    const { data: session } = await authClient.getSession();

    console.log("[v0] Server action called with data:", formData);

    const { name, description, files } = formData;

    if (!name || !files || !Array.isArray(files) || files.length === 0) {
      console.log("[v0] Validation failed");
      return { error: "Name and at least one file are required" };
    }

    for (const file of files) {
      if (!file.path || !file.content) {
        console.log("[v0] File validation failed");
        return { error: "Each file must have a path and content" };
      }
    }

    const id = nanoid(8);
    console.log("[v0] Generated ID:", id);

    console.log("[v0] Attempting database insert");

    const registry = await db
      .insert(schema.registries)
      .values({
        id,
        name,
        description,
        files,
        userId: session?.user?.id as string,
      })
      .returning()
      .then((result) => result[0]);

    revalidatePath("/");

    return { success: true, registry };
  } catch (error) {
    console.error("[v0] Server action error:", error);
    return {
      error: "Failed to create registry. Make sure the database table exists.",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
