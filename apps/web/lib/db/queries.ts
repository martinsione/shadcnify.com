import * as schema from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";

export async function getRegistryById(id: string) {
  const registry = await db
    .select()
    .from(schema.registries)
    .where(eq(schema.registries.id, id))
    .limit(1)
    .then((result) => result[0]);

  if (!registry) {
    return null;
  }

  return registry;
}

export async function getRegistriesByUserId(userId: string) {
  const registries = await db
    .select()
    .from(schema.registries)
    .where(eq(schema.registries.userId, userId));

  return registries;
}

export async function getRegistryLikeCount(registryId: string) {
  const result = await db
    .select({ count: count() })
    .from(schema.registryLikes)
    .where(eq(schema.registryLikes.registryId, registryId))
    .then((result) => result[0]);

  return result?.count || 0;
}

export async function hasUserLikedRegistry(userId: string, registryId: string) {
  const result = await db
    .select()
    .from(schema.registryLikes)
    .where(
      and(
        eq(schema.registryLikes.userId, userId),
        eq(schema.registryLikes.registryId, registryId)
      )
    )
    .limit(1)
    .then((result) => result[0]);

  return !!result;
}

export async function toggleRegistryLike(userId: string, registryId: string) {
  const existingLike = await db
    .select()
    .from(schema.registryLikes)
    .where(
      and(
        eq(schema.registryLikes.userId, userId),
        eq(schema.registryLikes.registryId, registryId)
      )
    )
    .limit(1)
    .then((result) => result[0]);

  if (existingLike) {
    // Unlike: delete the like
    await db
      .delete(schema.registryLikes)
      .where(
        and(
          eq(schema.registryLikes.userId, userId),
          eq(schema.registryLikes.registryId, registryId)
        )
      );
    return false; // unliked
  } else {
    // Like: insert the like
    await db.insert(schema.registryLikes).values({
      userId,
      registryId,
    });
    return true; // liked
  }
}

export async function deleteRegistry(registryId: string, userId: string) {
  // Verify ownership before deleting
  const registry = await db
    .select()
    .from(schema.registries)
    .where(
      and(
        eq(schema.registries.id, registryId),
        eq(schema.registries.userId, userId)
      )
    )
    .limit(1)
    .then((result) => result[0]);

  if (!registry) {
    return false;
  }

  // Delete the registry (cascade will handle likes)
  await db
    .delete(schema.registries)
    .where(eq(schema.registries.id, registryId));

  return true;
}
