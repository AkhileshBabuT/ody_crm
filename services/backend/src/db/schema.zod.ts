// Zod validation schemas derived from Drizzle table definitions.
// Uses drizzle-zod to generate insert/select schemas with refinements.

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

export const insertMenuCategorySchema = createInsertSchema(menuCategories, {
  name: (schema) => schema.min(1).max(255),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectMenuCategorySchema = createSelectSchema(menuCategories);

export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type SelectMenuCategory = z.infer<typeof selectMenuCategorySchema>;

// ─── Menu Items ─────────────────────────────────────────────────────────────

export const insertMenuItemSchema = createInsertSchema(menuItems, {
  name: (schema) => schema.min(1).max(255),
  priceCents: (schema) => schema.int().positive(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectMenuItemSchema = createSelectSchema(menuItems);

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type SelectMenuItem = z.infer<typeof selectMenuItemSchema>;

// ─── Customers ──────────────────────────────────────────────────────────────

export const insertCustomerSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1).max(255),
  email: (schema) => schema.email().max(255),
  phone: (schema) => schema.max(50),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectCustomerSchema = createSelectSchema(customers);

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type SelectCustomer = z.infer<typeof selectCustomerSchema>;

// ─── Orders ─────────────────────────────────────────────────────────────────

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  totalCents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const selectOrderSchema = createSelectSchema(orders);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;

// ─── Order Items ────────────────────────────────────────────────────────────

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  quantity: (schema) => schema.int().positive(),
  unitPriceCents: (schema) => schema.int().nonnegative(),
}).omit({ id: true, createdAt: true });

export const selectOrderItemSchema = createSelectSchema(orderItems);

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SelectOrderItem = z.infer<typeof selectOrderItemSchema>;

// ─── Restaurant Settings ────────────────────────────────────────────────────

export const insertRestaurantSettingSchema = createInsertSchema(
  restaurantSettings,
  {
    key: (schema) => schema.min(1).max(255),
    value: (schema) => schema.min(1),
  },
).omit({ id: true, updatedAt: true });

export const selectRestaurantSettingSchema =
  createSelectSchema(restaurantSettings);

export type InsertRestaurantSetting = z.infer<
  typeof insertRestaurantSettingSchema
>;
export type SelectRestaurantSetting = z.infer<
  typeof selectRestaurantSettingSchema
>;

// ─── Composite Types ────────────────────────────────────────────────────────

export const orderWithItemsSchema = selectOrderSchema.extend({
  items: z.array(selectOrderItemSchema),
});

export const menuItemWithCategorySchema = selectMenuItemSchema.extend({
  category: selectMenuCategorySchema,
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;
export type MenuItemWithCategory = z.infer<typeof menuItemWithCategorySchema>;
