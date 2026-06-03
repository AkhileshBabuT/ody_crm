import { eq, and, sql } from "drizzle-orm";
import { menuCategories, menuItems } from "../db/schema";
import type { Database } from "../db";

// ─── Category Repositories ───

export async function findAllCategories(db: Database) {
  return db.select().from(menuCategories).orderBy(menuCategories.position);
}

export async function findCategoryById(db: Database, id: number) {
  const rows = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.id, id));
  return rows[0] ?? null;
}

export async function findCategoryWithItems(db: Database, id: number) {
  const category = await findCategoryById(db, id);
  if (!category) return null;

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.categoryId, id));

  return { ...category, items };
}

export async function insertCategory(
  db: Database,
  data: { name: string; description?: string | null; position?: number },
) {
  const rows = await db.insert(menuCategories).values(data).returning();
  return rows[0];
}

export async function updateCategory(
  db: Database,
  id: number,
  data: Partial<{ name: string; description: string | null; position: number }>,
) {
  const rows = await db
    .update(menuCategories)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(menuCategories.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCategory(db: Database, id: number) {
  // FK cascade on menu_items.category_id handles item deletion automatically
  const rows = await db
    .delete(menuCategories)
    .where(eq(menuCategories.id, id))
    .returning();
  return rows[0] ?? null;
}

// ─── Item Repositories ───

export async function findAllItems(
  db: Database,
  filters?: { categoryId?: number; available?: boolean },
) {
  const conditions = [];
  if (filters?.categoryId !== undefined) {
    conditions.push(eq(menuItems.categoryId, filters.categoryId));
  }
  if (filters?.available !== undefined) {
    conditions.push(eq(menuItems.available, filters.available));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  return db.select().from(menuItems).where(whereClause);
}

export async function findItemById(db: Database, id: number) {
  const rows = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, id));
  return rows[0] ?? null;
}

export async function findItemWithCategory(db: Database, id: number) {
  const rows = await db
    .select({
      item: menuItems,
      category: menuCategories,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(eq(menuItems.id, id));

  if (rows.length === 0) return null;
  const { item, category } = rows[0];
  return { ...item, category };
}

export async function insertItem(
  db: Database,
  data: {
    categoryId: number;
    name: string;
    description?: string | null;
    priceCents: number;
    available?: boolean;
  },
) {
  const rows = await db.insert(menuItems).values(data).returning();
  return rows[0];
}

export async function updateItem(
  db: Database,
  id: number,
  data: Partial<{
    categoryId: number;
    name: string;
    description: string | null;
    priceCents: number;
    available: boolean;
  }>,
) {
  const rows = await db
    .update(menuItems)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(menuItems.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteItem(db: Database, id: number) {
  const rows = await db
    .delete(menuItems)
    .where(eq(menuItems.id, id))
    .returning();
  return rows[0] ?? null;
}
