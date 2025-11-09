import * as schema from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

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
