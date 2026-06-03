import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";
import { orders, orderItems, menuItems, customers } from "../db/schema";
import type { Database } from "../db";
import type { OrderStatus } from "@odyssey/shared";

// ─── Types ───

export interface ListOrdersParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export interface CreateOrderParams {
  customerId: number;
  totalCents: number;
  items: { menuItemId: number; quantity: number; unitPriceCents: number }[];
}

// ─── List Orders ───

export async function listOrders(
  db: Database,
  params: ListOrdersParams
) {
  const { status, from, to, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (status) {
    conditions.push(eq(orders.status, status));
  }
  if (from) {
    conditions.push(gte(orders.createdAt, new Date(from)));
  }
  if (to) {
    conditions.push(lte(orders.createdAt, new Date(to)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause),
  ]);

  return {
    orders: data,
    totalCount: Number(countResult[0].count),
  };
}

// ─── Get Order By ID ───

export async function getOrderById(db: Database, id: number) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      orderItems: true,
      customer: true,
    },
  });
}

// ─── Create Order ───

export async function createOrder(db: Database, params: CreateOrderParams) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        customerId: params.customerId,
        totalCents: params.totalCents,
        status: "PENDING",
      })
      .returning();

    const insertedItems = await tx
      .insert(orderItems)
      .values(
        params.items.map((item) => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        }))
      )
      .returning();

    return { ...order, items: insertedItems };
  });
}

// ─── Update Order Status (atomic with row lock) ───

export async function updateOrderStatus(
  db: Database,
  id: number,
  newStatus: OrderStatus,
  expectedCurrentStatus: OrderStatus,
) {
  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(eq(orders.id, id), eq(orders.status, expectedCurrentStatus)))
    .returning();

  return updated ?? null;
}

// ─── Get Customer By ID ───

export async function getCustomerById(db: Database, id: number) {
  return db.query.customers.findFirst({
    where: eq(customers.id, id),
  });
}

// ─── Get Menu Items By IDs ───

export async function getMenuItemsByIds(db: Database, ids: number[]) {
  return db.select().from(menuItems).where(inArray(menuItems.id, ids));
}
