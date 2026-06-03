import { AppError } from "../lib/errors";
import type { Database } from "../db";
import {
  findAllCustomers,
  findCustomerById,
  findCustomerOrderSummary,
  insertCustomer,
  updateCustomer,
} from "../repositories/customer.repository";

// ─── Customer Services ───

export async function listCustomers(
  db: Database,
  opts: { page: number; pageSize: number; search?: string },
) {
  return findAllCustomers(db, opts);
}

export async function getCustomerById(db: Database, id: number) {
  const customer = await findCustomerById(db, id);
  if (!customer) {
    throw new AppError("NOT_FOUND", "Customer not found");
  }

  const orderSummary = await findCustomerOrderSummary(db, id);

  return {
    ...customer,
    orderSummary: {
      totalOrders: orderSummary.totalOrders,
      totalSpentCents: orderSummary.totalSpentCents,
    },
  };
}

export async function createCustomer(
  db: Database,
  data: { name: string; email: string; phone?: string | null },
) {
  try {
    return await insertCustomer(db, data);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const dbError = error as { code?: string };
    if (dbError.code === "23505") {
      throw new AppError("CONFLICT", "Email already exists");
    }
    throw error;
  }
}

export async function editCustomer(
  db: Database,
  id: number,
  data: Partial<{ name: string; email: string; phone: string | null }>,
) {
  const existing = await findCustomerById(db, id);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Customer not found");
  }

  try {
    const updated = await updateCustomer(db, id, data);
    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const dbError = error as { code?: string };
    if (dbError.code === "23505") {
      throw new AppError("CONFLICT", "Email already exists");
    }
    throw error;
  }
}
