"use server"

import { nanoid } from "nanoid"
import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

export async function createRegistry(formData: {
  name: string
  description?: string
  files: Array<{ path: string; content: string }>
}) {
  try {
    console.log("[v0] Server action called with data:", formData)

    const { name, description, files } = formData

    if (!name || !files || !Array.isArray(files) || files.length === 0) {
      console.log("[v0] Validation failed")
      return { error: "Name and at least one file are required" }
    }

    for (const file of files) {
      if (!file.path || !file.content) {
        console.log("[v0] File validation failed")
        return { error: "Each file must have a path and content" }
      }
    }

    const id = nanoid(8)
    console.log("[v0] Generated ID:", id)

    const sql = neon(process.env.NEON_DATABASE_URL!)

    console.log("[v0] Attempting database insert")

    const result = await sql`
      INSERT INTO registries (id, name, description, files, created_at, updated_at)
      VALUES (${id}, ${name}, ${description || null}, ${JSON.stringify(files)}, NOW(), NOW())
      RETURNING *
    `

    const registry = result[0]
    console.log("[v0] Registry created:", registry.id)

    revalidatePath("/")

    return { success: true, registry }
  } catch (error) {
    console.error("[v0] Server action error:", error)
    return {
      error: "Failed to create registry. Make sure the database table exists.",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getRegistry(id: string) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const result = await sql`
      SELECT * FROM registries WHERE id = ${id}
    `

    if (result.length === 0) {
      return { error: "Registry not found" }
    }

    return { success: true, registry: result[0] }
  } catch (error) {
    console.error("[v0] Error fetching registry:", error)
    return {
      error: "Failed to fetch registry",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
