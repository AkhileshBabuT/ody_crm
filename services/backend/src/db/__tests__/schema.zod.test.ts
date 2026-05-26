import { describe, expect, it } from "vitest";

import {
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertRestaurantSettingSchema,
} from "../schema.zod";

// ─── insertMenuCategorySchema ──────────────────────────────────────────────

describe("insertMenuCategorySchema", () => {
  it("accepts a valid category", () => {
    const result = insertMenuCategorySchema.safeParse({
      name: "Appetizers",
      description: "Starters and small plates",
      position: 1,
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = insertMenuCategorySchema.safeParse({
      description: "No name provided",
      position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = insertMenuCategorySchema.safeParse({
      name: "",
      position: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ─── insertMenuItemSchema ──────────────────────────────────────────────────

describe("insertMenuItemSchema", () => {
  it("accepts a valid item", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Caesar Salad",
      description: "Romaine lettuce with Caesar dressing",
      priceCents: 1295,
      available: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative priceCents", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Bad Item",
      priceCents: -500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero priceCents", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Free Item",
      priceCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects fractional priceCents", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Fractional Item",
      priceCents: 12.95,
    });
    expect(result.success).toBe(false);
  });
});

// ─── insertCustomerSchema ──────────────────────────────────────────────────

describe("insertCustomerSchema", () => {
  it("accepts a valid customer", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1-555-0123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("allows phone to be omitted", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });
});

// ─── insertOrderSchema ─────────────────────────────────────────────────────

describe("insertOrderSchema", () => {
  it("accepts a valid order with only customerId", () => {
    const result = insertOrderSchema.safeParse({
      customerId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing customerId", () => {
    const result = insertOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── insertOrderItemSchema ─────────────────────────────────────────────────

describe("insertOrderItemSchema", () => {
  it("accepts a valid order item", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 10,
      quantity: 2,
      unitPriceCents: 1295,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero quantity", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 10,
      quantity: 0,
      unitPriceCents: 1295,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative unitPriceCents", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 10,
      quantity: 1,
      unitPriceCents: -100,
    });
    expect(result.success).toBe(false);
  });
});

// ─── insertRestaurantSettingSchema ─────────────────────────────────────────

describe("insertRestaurantSettingSchema", () => {
  it("accepts a valid setting", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "restaurant_name",
      value: "Odyssey Bistro",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty key", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "",
      value: "some value",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty value", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "some_key",
      value: "",
    });
    expect(result.success).toBe(false);
  });
});
