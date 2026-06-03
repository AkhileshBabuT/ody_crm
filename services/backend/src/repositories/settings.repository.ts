import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { restaurantSettings } from "../db/schema";

// ─── Get All Settings ───

export async function getAllSettings(db: Database) {
  return db.select().from(restaurantSettings);
}

// ─── Get Setting By Key ───

export async function getSettingByKey(db: Database, key: string) {
  const rows = await db
    .select()
    .from(restaurantSettings)
    .where(eq(restaurantSettings.key, key));
  return rows[0] ?? null;
}

// ─── Upsert Setting ───

export async function upsertSetting(db: Database, key: string, value: string) {
  const rows = await db
    .insert(restaurantSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: restaurantSettings.key, set: { value } })
    .returning();
  return rows[0];
}
