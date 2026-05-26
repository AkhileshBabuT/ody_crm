// Zod validation schemas derived from Drizzle table definitions.
// Uses drizzle-zod to generate base schemas, then applies refinements via Zod.

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  restaurantSettings,
} from "./schema";

// ─── Menu Categories ────────────────────────────────────────────────────────

const baseInsertMenuCategory = createInsertSchema(menuCategories);

export const insertMenuCategorySchema = baseInsertMenuCategory
  .extend({
    name: z.string().min(1).max(255),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });

export const selectMenuCategorySchema = createSelectSchema(menuCategories);

export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuCategory = z.infer<typeof selectMenuCategorySchema>;

// ─── Menu Items ─────────────────────────────────────────────────────────────

const baseInsertMenuItem = createInsertSchema(menuItems);

export const insertMenuItemSchema = baseInsertMenuItem
  .extend({
    name: z.string().min(1).max(255),
    priceCents: z.number().int().positive(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });

export const selectMenuItemSchema = createSelectSchema(menuItems);

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = z.infer<typeof selectMenuItemSchema>;

// ─── Customers ──────────────────────────────────────────────────────────────

const baseInsertCustomer = createInsertSchema(customers);

export const insertCustomerSchema = baseInsertCustomer
  .extend({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional().nullable(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });

export const selectCustomerSchema = createSelectSchema(customers);

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = z.infer<typeof selectCustomerSchema>;

// ─── Orders ─────────────────────────────────────────────────────────────────

const baseInsertOrder = createInsertSchema(orders);

export const insertOrderSchema = baseInsertOrder.omit({
  id: true,
  totalCents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const selectOrderSchema = createSelectSchema(orders);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof selectOrderSchema>;

// ─── Order Items ────────────────────────────────────────────────────────────

const baseInsertOrderItem = createInsertSchema(orderItems);

export const insertOrderItemSchema = baseInsertOrderItem
  .extend({
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().nonnegative(),
  })
  .omit({ id: true, createdAt: true });

export const selectOrderItemSchema = createSelectSchema(orderItems);

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = z.infer<typeof selectOrderItemSchema>;

// ─── Restaurant Settings ────────────────────────────────────────────────────

const baseInsertRestaurantSetting = createInsertSchema(restaurantSettings);

export const insertRestaurantSettingSchema = baseInsertRestaurantSetting
  .extend({
    key: z.string().min(1).max(255),
    value: z.string().min(1),
  })
  .omit({ id: true, updatedAt: true });

export const selectRestaurantSettingSchema =
  createSelectSchema(restaurantSettings);

export type InsertRestaurantSetting = z.infer<
  typeof insertRestaurantSettingSchema
>;
export type RestaurantSetting = z.infer<typeof selectRestaurantSettingSchema>;

// ─── Composite Types ────────────────────────────────────────────────────────

export const orderWithItemsSchema = selectOrderSchema.extend({
  items: z.array(selectOrderItemSchema),
});

export const menuItemWithCategorySchema = selectMenuItemSchema.extend({
  category: selectMenuCategorySchema,
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;
export type MenuItemWithCategory = z.infer<typeof menuItemWithCategorySchema>;
