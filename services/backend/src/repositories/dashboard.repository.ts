import { eq, sql, desc, gte } from "drizzle-orm";
import type { Database } from "../db";
import { orders, orderItems, menuItems } from "../db/schema";

// ─── Get Total Orders & Revenue ───

export async function getOrderStats(db: Database) {
  const stats = await db
    .select({
      totalOrders: sql<number>`cast(count(${orders.id}) as integer)`,
      totalRevenueCents: sql<number>`coalesce(cast(sum(${orders.totalCents}) as integer), 0)`,
    })
    .from(orders);
  return stats[0];
}

// ─── Get Pending Orders Count ───

export async function getPendingOrdersCount(db: Database) {
  const pending = await db
    .select({ count: sql<number>`cast(count(${orders.id}) as integer)` })
    .from(orders)
    .where(eq(orders.status, "PENDING"));
  return pending[0].count;
}

// ─── Get Orders Today Count ───

export async function getOrdersTodayCount(db: Database) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayOrders = await db
    .select({ count: sql<number>`cast(count(${orders.id}) as integer)` })
    .from(orders)
    .where(gte(orders.createdAt, today));
  return todayOrders[0].count;
}

// ─── Get Top 5 Popular Items ───

export async function getPopularItems(db: Database) {
  const popular = await db
    .select({
      menuItemId: orderItems.menuItemId,
      name: menuItems.name,
      totalQuantity: sql<number>`cast(sum(${orderItems.quantity}) as integer)`,
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .groupBy(orderItems.menuItemId, menuItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);
  return popular;
}
