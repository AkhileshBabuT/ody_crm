import { AppError } from "../lib/errors";
import type { Database } from "../db";
import {
  findAllCategories,
  findCategoryById,
  findCategoryWithItems,
  insertCategory,
  updateCategory,
  deleteCategory,
  findAllItems,
  findItemWithCategory,
  insertItem,
  updateItem,
  deleteItem,
} from "../repositories/menu.repository";

// ─── Category Services ───

export async function listCategories(db: Database) {
  return findAllCategories(db);
}

export async function getCategory(db: Database, id: number) {
  const category = await findCategoryWithItems(db, id);
  if (!category) {
    throw new AppError("NOT_FOUND", "Category not found");
  }
  return category;
}

export async function createCategory(
  db: Database,
  data: { name: string; description?: string | null; position?: number },
) {
  return insertCategory(db, data);
}

export async function editCategory(
  db: Database,
  id: number,
  data: Partial<{ name: string; description: string | null; position: number }>,
) {
  const updated = await updateCategory(db, id, data);
  if (!updated) {
    throw new AppError("NOT_FOUND", "Category not found");
  }
  return updated;
}

export async function removeCategory(db: Database, id: number) {
  const deleted = await deleteCategory(db, id);
  if (!deleted) {
    throw new AppError("NOT_FOUND", "Category not found");
  }
  return deleted;
}

// ─── Item Services ───

export async function listItems(
  db: Database,
  filters?: { categoryId?: number; available?: boolean },
) {
  return findAllItems(db, filters);
}

export async function getItem(db: Database, id: number) {
  const item = await findItemWithCategory(db, id);
  if (!item) {
    throw new AppError("NOT_FOUND", "Menu item not found");
  }
  return item;
}

export async function createItem(
  db: Database,
  data: {
    categoryId: number;
    name: string;
    description?: string | null;
    priceCents: number;
    available?: boolean;
  },
) {
  const category = await findCategoryById(db, data.categoryId);
  if (!category) {
    throw new AppError("NOT_FOUND", "Category not found");
  }
  return insertItem(db, data);
}

export async function editItem(
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
  if (data.categoryId !== undefined) {
    const category = await findCategoryById(db, data.categoryId);
    if (!category) {
      throw new AppError("NOT_FOUND", "Category not found");
    }
  }
  const updated = await updateItem(db, id, data);
  if (!updated) {
    throw new AppError("NOT_FOUND", "Menu item not found");
  }
  return updated;
}

export async function removeItem(db: Database, id: number) {
  try {
    const deleted = await deleteItem(db, id);
    if (!deleted) {
      throw new AppError("NOT_FOUND", "Menu item not found");
    }
    return deleted;
  } catch (error) {
    if (error instanceof AppError) throw error;
    // FK constraint violation from order_items
    const message =
      error instanceof Error ? error.message : String(error);
    if (message.includes("foreign key") || message.includes("violates")) {
      throw new AppError(
        "CONFLICT",
        "Cannot delete menu item with existing orders",
      );
    }
    throw error;
  }
}
