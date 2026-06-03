import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../index";
import { createDb } from "../../db";
import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
} from "../../db/schema";
import { eq } from "drizzle-orm";

const TEST_DB_URL =
  "postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db";

function request(path: string, init?: RequestInit) {
  return app.request(path, init, { DATABASE_URL: TEST_DB_URL });
}

describe("Orders API integration tests", () => {
  const { db } = createDb(TEST_DB_URL);

  let testCustomer: { id: number; name: string };
  let testCategory: { id: number };
  let testItem1: { id: number; priceCents: number };
  let testItem2: { id: number; priceCents: number };
  let unavailableItem: { id: number };
  let createdOrderId: number;

  beforeAll(async () => {
    const [customer] = await db
      .insert(customers)
      .values({
        name: "Test Customer",
        email: `test-orders-${Date.now()}@example.com`,
        phone: "+1-555-0000",
      })
      .returning();
    testCustomer = customer;

    const [category] = await db
      .insert(menuCategories)
      .values({
        name: "Order Test Category",
        position: 98,
      })
      .returning();
    testCategory = category;

    const [item1] = await db
      .insert(menuItems)
      .values({
        categoryId: testCategory.id,
        name: "Order Test Item 1",
        priceCents: 1000,
        available: true,
      })
      .returning();
    testItem1 = item1;

    const [item2] = await db
      .insert(menuItems)
      .values({
        categoryId: testCategory.id,
        name: "Order Test Item 2",
        priceCents: 2000,
        available: true,
      })
      .returning();
    testItem2 = item2;

    const [unavail] = await db
      .insert(menuItems)
      .values({
        categoryId: testCategory.id,
        name: "Unavailable Item",
        priceCents: 500,
        available: false,
      })
      .returning();
    unavailableItem = unavail;
  });

  afterAll(async () => {
    // Delete in FK-safe order
    await db.delete(orderItems).where(eq(orderItems.orderId, createdOrderId));
    await db.delete(orders).where(eq(orders.customerId, testCustomer.id));
    await db
      .delete(menuItems)
      .where(eq(menuItems.categoryId, testCategory.id));
    await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, testCategory.id));
    await db.delete(customers).where(eq(customers.id, testCustomer.id));
  });

  // Tests must run sequentially because status transitions build on each other.
  describe.sequential("order lifecycle", () => {
    it("POST /api/orders — creates order with correct total", async () => {
      const res = await request("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: testCustomer.id,
          items: [
            { menuItemId: testItem1.id, quantity: 2 },
            { menuItemId: testItem2.id, quantity: 1 },
          ],
        }),
      });
      expect(res.status).toBe(201);

      const body = await res.json() as any;
      // Create order returns the raw order object (not wrapped in data)
      createdOrderId = body.id;

      // Server-calculated total: 2*1000 + 1*2000 = 4000
      expect(body.totalCents).toBe(4000);
      expect(body.items).toBeInstanceOf(Array);
      expect(body.items).toHaveLength(2);

      const item1Entry = body.items.find(
        (oi: { menuItemId: number }) => oi.menuItemId === testItem1.id,
      );
      expect(item1Entry).toBeDefined();
      expect(item1Entry.unitPriceCents).toBe(1000);
      expect(item1Entry.quantity).toBe(2);

      const item2Entry = body.items.find(
        (oi: { menuItemId: number }) => oi.menuItemId === testItem2.id,
      );
      expect(item2Entry).toBeDefined();
      expect(item2Entry.unitPriceCents).toBe(2000);
      expect(item2Entry.quantity).toBe(1);
    });

    it("GET /api/orders — returns paginated list including created order", async () => {
      const res = await request("/api/orders");
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.data).toBeInstanceOf(Array);

      const found = body.data.find(
        (o: { id: number }) => o.id === createdOrderId,
      );
      expect(found).toBeDefined();
    });

    it("GET /api/orders/:id — returns order with items and customer info", async () => {
      const res = await request(`/api/orders/${createdOrderId}`);
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      // GET by ID returns raw order object with orderItems and customer
      expect(body.id).toBe(createdOrderId);
      expect(body.items).toBeInstanceOf(Array);
      expect(body.customer).toBeDefined();
    });

    it("GET /api/orders/:id — returns 404 for nonexistent ID", async () => {
      const res = await request("/api/orders/999999");
      expect(res.status).toBe(404);
    });

    it("PATCH /api/orders/:id/status — PENDING to ACCEPTED", async () => {
      const res = await request(`/api/orders/${createdOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.status).toBe("ACCEPTED");
    });

    it("PATCH /api/orders/:id/status — ACCEPTED to PREPARING", async () => {
      const res = await request(`/api/orders/${createdOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PREPARING" }),
      });
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.status).toBe("PREPARING");
    });

    it("PATCH /api/orders/:id/status — rejects invalid transition PREPARING to PENDING", async () => {
      const res = await request(`/api/orders/${createdOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });
      expect(res.status).toBe(422);
    });
  });

  describe("order validation", () => {
    it("POST /api/orders — returns 404 for nonexistent customer", async () => {
      const res = await request("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: 999999,
          items: [{ menuItemId: testItem1.id, quantity: 1 }],
        }),
      });
      expect(res.status).toBe(404);
    });

    it("POST /api/orders — returns 422 for unavailable items", async () => {
      const res = await request("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: testCustomer.id,
          items: [{ menuItemId: unavailableItem.id, quantity: 1 }],
        }),
      });
      expect(res.status).toBe(422);

      const body = await res.json() as any;
      expect(body.error.code).toBe("UNAVAILABLE_ITEMS");
      expect(body.error.details).toBeDefined();
    });

    it("GET /api/orders?status=PENDING — filters by status", async () => {
      const res = await request("/api/orders?status=PENDING");
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.data).toBeInstanceOf(Array);

      for (const order of body.data) {
        expect(order.status).toBe("PENDING");
      }
    });
  });
});
