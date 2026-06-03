import { eq, or, ilike, sql, desc } from "drizzle-orm";
import { customers, orders } from "../db/schema";
import type { Database } from "../db";

// ─── Customer Repositories ───

export async function findAllCustomers(
  db: Database,
  opts: { page: number; pageSize: number; search?: string },
) {
  const { page, pageSize, search } = opts;
  const offset = (page - 1) * pageSize;

  const escaped = search?.replace(/[%_\\]/g, "\\$&");
  const whereClause = escaped
    ? or(ilike(customers.name, `%${escaped}%`), ilike(customers.email, `%${escaped}%`))
    : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(whereClause)
      .orderBy(desc(customers.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(customers)
      .where(whereClause),
  ]);

  const totalCount = countResult[0].count;

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function findCustomerById(db: Database, id: number) {
  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));
  return rows[0] ?? null;
}

export async function findCustomerOrderSummary(db: Database, id: number) {
  const rows = await db
    .select({
      totalOrders: sql<number>`cast(count(${orders.id}) as integer)`,
      totalSpentCents: sql<number>`coalesce(cast(sum(${orders.totalCents}) as integer), 0)`,
    })
    .from(orders)
    .where(eq(orders.customerId, id));
  return rows[0];
}

export async function insertCustomer(
  db: Database,
  data: { name: string; email: string; phone?: string | null },
) {
  const rows = await db.insert(customers).values(data).returning();
  return rows[0];
}

export async function updateCustomer(
  db: Database,
  id: number,
  data: Partial<{ name: string; email: string; phone: string | null }>,
) {
  const rows = await db
    .update(customers)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(customers.id, id))
    .returning();
  return rows[0] ?? null;
}
