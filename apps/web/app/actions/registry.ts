"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/better-auth-config";
import * as schema from "@/lib/db/schema";
import { db } from "@/lib/db";
import {
  getRegistryLikeCount,
  hasUserLikedRegistry,
  toggleRegistryLike as toggleLikeInDb,
  getRegistriesByUserId,
  deleteRegistry as deleteRegistryInDb,
} from "@/lib/db/queries";
import { headers } from "next/headers";

export async function createRegistry(formData: {
  name: string;
  description?: string;
  files: Array<{ path: string; content: string }>;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
    revalidatePath("/my-registries");

    return { success: true, registry };
  } catch (error) {
    console.error("[v0] Server action error:", error);
    return {
      error: "Failed to create registry. Make sure the database table exists.",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getRegistryLikeStatus(registryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const likeCount = await getRegistryLikeCount(registryId);
    const isLiked = await hasUserLikedRegistry(session.user.id, registryId);

    return { success: true, likeCount, isLiked };
  } catch (error) {
    console.error("[v0] Get like status error:", error);
    return {
      error: "Failed to get like status",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function toggleRegistryLike(registryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const isLiked = await toggleLikeInDb(session.user.id, registryId);
    const likeCount = await getRegistryLikeCount(registryId);

    revalidatePath(`/registry/${registryId}`);

    return { success: true, isLiked, likeCount };
  } catch (error) {
    console.error("[v0] Toggle like error:", error);
    return {
      error: "Failed to toggle like",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUserRegistries() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const registries = await getRegistriesByUserId(session.user.id);

    return { success: true, registries };
  } catch (error) {
    console.error("[v0] Get user registries error:", error);
    return {
      error: "Failed to get user registries",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteRegistry(registryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const deleted = await deleteRegistryInDb(registryId, session.user.id);

    if (!deleted) {
      return { error: "Registry not found or you don't have permission" };
    }

    revalidatePath("/my-registries");
    revalidatePath(`/registry/${registryId}`);

    return { success: true };
  } catch (error) {
    console.error("[v0] Delete registry error:", error);
    return {
      error: "Failed to delete registry",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
