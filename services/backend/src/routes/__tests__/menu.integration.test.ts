import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../index";
import { createDb } from "../../db";
import { menuCategories, menuItems } from "../../db/schema";
import { eq } from "drizzle-orm";

const TEST_DB_URL =
  "postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db";

function request(path: string, init?: RequestInit) {
  return app.request(path, init, { DATABASE_URL: TEST_DB_URL });
}

describe("Menu API integration tests", () => {
  const { db } = createDb(TEST_DB_URL);
  let testCategory: { id: number; name: string };
  let testItem: { id: number; name: string; priceCents: number };

  beforeAll(async () => {
    const [category] = await db
      .insert(menuCategories)
      .values({
        name: "Test Category",
        description: "For integration tests",
        position: 99,
      })
      .returning();
    testCategory = category;

    const [item] = await db
      .insert(menuItems)
      .values({
        categoryId: testCategory.id,
        name: "Test Item",
        priceCents: 1500,
        available: true,
      })
      .returning();
    testItem = item;
  });

  afterAll(async () => {
    await db
      .delete(menuItems)
      .where(eq(menuItems.categoryId, testCategory.id));
    await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, testCategory.id));
  });

  // ─── Categories ───

  it("GET /api/menu/categories — returns 200 with data array", async () => {
    const res = await request("/api/menu/categories");
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data).toBeInstanceOf(Array);

    const found = body.data.find(
      (c: { id: number }) => c.id === testCategory.id,
    );
    expect(found).toBeDefined();
    expect(found.name).toBe("Test Category");
  });

  it("GET /api/menu/categories/:id — returns 200 with category and items", async () => {
    const res = await request(`/api/menu/categories/${testCategory.id}`);
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data.id).toBe(testCategory.id);
    expect(body.data.items).toBeInstanceOf(Array);
  });

  it("GET /api/menu/categories/:id — returns 404 for nonexistent ID", async () => {
    const res = await request("/api/menu/categories/999999");
    expect(res.status).toBe(404);
  });

  it("POST /api/menu/categories — creates category and returns 201", async () => {
    const res = await request("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Temp Created Category", position: 50 }),
    });
    expect(res.status).toBe(201);

    const body = await res.json() as any;
    expect(body.data.name).toBe("Temp Created Category");

    // Clean up
    await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, body.data.id));
  });

  it("PUT /api/menu/categories/:id — updates name and returns 200", async () => {
    const res = await request(`/api/menu/categories/${testCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Test Category" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data.name).toBe("Updated Test Category");

    // Restore original name
    await db
      .update(menuCategories)
      .set({ name: "Test Category" })
      .where(eq(menuCategories.id, testCategory.id));
  });

  it("DELETE /api/menu/categories/:id — deletes category and returns 200", async () => {
    const [temp] = await db
      .insert(menuCategories)
      .values({ name: "To Be Deleted", position: 100 })
      .returning();

    const res = await request(`/api/menu/categories/${temp.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });

  // ─── Items ───

  it("GET /api/menu/items — returns 200 with data array", async () => {
    const res = await request("/api/menu/items");
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data).toBeInstanceOf(Array);

    const found = body.data.find((i: { id: number }) => i.id === testItem.id);
    expect(found).toBeDefined();
    expect(found.name).toBe("Test Item");
  });

  it("GET /api/menu/items?categoryId=X — filters by category", async () => {
    const res = await request(
      `/api/menu/items?categoryId=${testCategory.id}`,
    );
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    for (const item of body.data) {
      expect(item.categoryId).toBe(testCategory.id);
    }
  });

  it("GET /api/menu/items?available=true — filters by availability", async () => {
    const res = await request("/api/menu/items?available=true");
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data).toBeInstanceOf(Array);

    for (const item of body.data) {
      expect(item.available).toBe(true);
    }
  });

  it("GET /api/menu/items/:id — returns item with category info", async () => {
    const res = await request(`/api/menu/items/${testItem.id}`);
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data.id).toBe(testItem.id);
    expect(body.data.priceCents).toBe(1500);
    expect(body.data.category).toBeDefined();
  });

  it("POST /api/menu/items — creates item and returns 201", async () => {
    const res = await request("/api/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: testCategory.id,
        name: "Temp Created Item",
        priceCents: 999,
        available: true,
      }),
    });
    expect(res.status).toBe(201);

    const body = await res.json() as any;
    expect(body.data.name).toBe("Temp Created Item");
    expect(body.data.priceCents).toBe(999);

    // Clean up
    await db.delete(menuItems).where(eq(menuItems.id, body.data.id));
  });

  it("PUT /api/menu/items/:id — updates price and returns 200", async () => {
    const res = await request(`/api/menu/items/${testItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceCents: 1800 }),
    });
    expect(res.status).toBe(200);

    const body = await res.json() as any;
    expect(body.data.priceCents).toBe(1800);

    // Restore original price
    await db
      .update(menuItems)
      .set({ priceCents: 1500 })
      .where(eq(menuItems.id, testItem.id));
  });

  it("DELETE /api/menu/items/:id — deletes an item and returns 200", async () => {
    const [temp] = await db
      .insert(menuItems)
      .values({
        categoryId: testCategory.id,
        name: "Item To Delete",
        priceCents: 100,
        available: true,
      })
      .returning();

    const res = await request(`/api/menu/items/${temp.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });
});
