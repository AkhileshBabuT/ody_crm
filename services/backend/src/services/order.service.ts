import type { Database } from "../db";
import type { OrderStatus } from "@odyssey/shared";
import { AppError } from "../lib/errors";
import { assertValidTransition } from "../lib/order-state-machine";
import * as orderRepo from "../repositories/order.repository";

// ─── Types ───

export interface CreateOrderInput {
  customerId: number;
  items: { menuItemId: number; quantity: number }[];
}

export interface ListOrdersInput {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

// ─── List Orders ───

export async function listOrders(db: Database, input: ListOrdersInput) {
  return orderRepo.listOrders(db, input);
}

// ─── Get Order By ID ───

export async function getOrderById(db: Database, id: number) {
  const order = await orderRepo.getOrderById(db, id);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  // Transform Drizzle's relation key to match the API schema
  const { orderItems, ...rest } = order;
  return { ...rest, items: orderItems };
}

// ─── Create Order ───

export async function createOrder(db: Database, input: CreateOrderInput) {
  // 1. Validate customer exists
  const customer = await orderRepo.getCustomerById(db, input.customerId);
  if (!customer) {
    throw new AppError("NOT_FOUND", "Customer not found");
  }

  // 2. Look up all requested menu items
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const dbMenuItems = await orderRepo.getMenuItemsByIds(db, menuItemIds);

  // 3. Check all items exist and are available
  const dbMenuItemMap = new Map(dbMenuItems.map((mi) => [mi.id, mi]));
  const unavailableItemIds: number[] = [];

  for (const item of input.items) {
    const dbItem = dbMenuItemMap.get(item.menuItemId);
    if (!dbItem || !dbItem.available) {
      unavailableItemIds.push(item.menuItemId);
    }
  }

  if (unavailableItemIds.length > 0) {
    throw new AppError("UNAVAILABLE_ITEMS", "Some items are unavailable", {
      unavailableItemIds,
    });
  }

  // 4. Calculate totalCents from DB prices
  const totalCents = input.items.reduce((sum, item) => {
    const dbItem = dbMenuItemMap.get(item.menuItemId)!;
    return sum + item.quantity * dbItem.priceCents;
  }, 0);

  // 5. Insert order + order items in a single transaction
  const orderWithItems = await orderRepo.createOrder(db, {
    customerId: input.customerId,
    totalCents,
    items: input.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPriceCents: dbMenuItemMap.get(item.menuItemId)!.priceCents,
    })),
  });

  // 6. Return the created order with its items
  return orderWithItems;
}

// ─── Update Order Status ───

export async function updateOrderStatus(
  db: Database,
  id: number,
  newStatus: OrderStatus,
) {
  // 1. Find order by ID
  const order = await orderRepo.getOrderById(db, id);
  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  // 2. Validate state transition
  const currentStatus = order.status as OrderStatus;
  assertValidTransition(currentStatus, newStatus);

  // 3. Atomic update with optimistic lock (WHERE status = currentStatus)
  const updated = await orderRepo.updateOrderStatus(db, id, newStatus, currentStatus);
  if (!updated) {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      "Order status was modified concurrently, please retry",
    );
  }

  return updated;
}
