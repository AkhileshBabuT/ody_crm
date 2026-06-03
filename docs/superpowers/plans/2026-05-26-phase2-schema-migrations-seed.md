# Phase 2: Database Schema, Migrations & Seed Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define all 6 Drizzle ORM tables, derive Zod validation schemas, generate and run migrations against PostgreSQL 16, and populate the database with realistic seed data.

**Architecture:** Schema is the single source of truth in `services/backend/src/db/schema.ts` (per backend rules). Zod schemas are derived via `createInsertSchema`/`createSelectSchema` from `drizzle-orm/zod` and live alongside the schema. `packages/types` re-exports the inferred TypeScript types for shared consumption. The order status enum lives in `packages/shared` (already exists) and is referenced by the schema via a Postgres enum.

**Tech Stack:** Drizzle ORM 0.44+, drizzle-kit 0.31+, drizzle-orm/zod (built-in zod integration), PostgreSQL 16, Vitest, tsx

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `services/backend/src/db/schema.ts` | All 6 pgTable definitions, pgEnum, relations, indexes |
| Create | `services/backend/src/db/schema.zod.ts` | Zod insert/select schemas + inferred TS types |
| Modify | `services/backend/src/db/seed.ts` | Seed script with realistic restaurant data |
| Modify | `packages/types/src/index.ts` | Re-export all derived types from backend schema |
| Modify | `packages/types/package.json` | Add `@odyssey/backend` workspace dep |
| Create | `services/backend/src/db/__tests__/schema.test.ts` | Schema validation + zod schema tests |

**Dependency flow (no cycles):**
- `packages/types` depends on `@odyssey/backend` (imports schema + zod types)
- `services/backend` depends on `@odyssey/shared` (imports ORDER_STATUS constants)
- `apps/dashboard` depends on `@odyssey/types` (imports TS types)
- Backend does NOT depend on `@odyssey/types` (removed to avoid circular dep)

---

## Task 1: Define the Drizzle Schema (6 Tables)

**Files:**
- Modify: `services/backend/src/db/schema.ts`

**Context:** The backend rules require ALL table definitions in this single file. Prices are stored as integer cents. The order status uses a Postgres enum matching the values already defined in `@odyssey/shared`.

- [ ] **Step 1: Write the complete schema file**

Replace the placeholder contents of `services/backend/src/db/schema.ts` with:

```typescript
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

// ─── Menu Categories ────────────────────────────────────────────────────────

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Menu Items ─────────────────────────────────────────────────────────────

export const menuItems = pgTable(
  "menu_items",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    available: boolean("available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("menu_items_category_id_idx").on(table.categoryId),
    index("menu_items_available_idx").on(table.available),
  ]
);

// ─── Customers ──────────────────────────────────────────────────────────────

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("customers_email_idx").on(table.email)]
);

// ─── Orders ─────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    totalCents: integer("total_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("orders_customer_id_idx").on(table.customerId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
  ]
);

// ─── Order Items ────────────────────────────────────────────────────────────

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_menu_item_id_idx").on(table.menuItemId),
  ]
);

// ─── Restaurant Settings ────────────────────────────────────────────────────

export const restaurantSettings = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
```

- [ ] **Step 2: Verify the schema file has no TypeScript errors**

Run: `pnpm --filter @odyssey/backend typecheck`
Expected: No errors. All table definitions compile correctly.

- [ ] **Step 3: Commit**

```bash
git add services/backend/src/db/schema.ts
git commit -m "feat(schema): define 6 drizzle tables with relations and indexes

Tables: menu_categories, menu_items, customers, orders, order_items, restaurant_settings.
All prices in integer cents. Order status uses pgEnum matching shared constants."
```

---

## Task 2: Derive Zod Schemas & TypeScript Types

**Files:**
- Create: `services/backend/src/db/schema.zod.ts`

**Context:** Uses `createInsertSchema` and `createSelectSchema` from `drizzle-orm/zod` (built into drizzle-orm 0.44+). These schemas will be used by Hono/OpenAPI routes for request/response validation in Phase 3.

- [ ] **Step 1: Create the Zod schema derivation file**

Create `services/backend/src/db/schema.zod.ts`:

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
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

export type MenuCategory = z.infer<typeof selectMenuCategorySchema>;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;

// ─── Menu Items ─────────────────────────────────────────────────────────────

export const insertMenuItemSchema = createInsertSchema(menuItems, {
  name: (schema) => schema.min(1).max(255),
  priceCents: (schema) => schema.int().positive(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectMenuItemSchema = createSelectSchema(menuItems);

export type MenuItem = z.infer<typeof selectMenuItemSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// ─── Customers ──────────────────────────────────────────────────────────────

export const insertCustomerSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1).max(255),
  email: (schema) => schema.email().max(255),
  phone: (schema) => schema.max(50),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectCustomerSchema = createSelectSchema(customers);

export type Customer = z.infer<typeof selectCustomerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// ─── Orders ─────────────────────────────────────────────────────────────────

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  totalCents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const selectOrderSchema = createSelectSchema(orders);

export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// ─── Order Items ────────────────────────────────────────────────────────────

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  quantity: (schema) => schema.int().positive(),
  unitPriceCents: (schema) => schema.int().nonnegative(),
}).omit({ id: true, createdAt: true });

export const selectOrderItemSchema = createSelectSchema(orderItems);

export type OrderItem = z.infer<typeof selectOrderItemSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// ─── Restaurant Settings ────────────────────────────────────────────────────

export const insertRestaurantSettingSchema = createInsertSchema(restaurantSettings, {
  key: (schema) => schema.min(1).max(255),
  value: (schema) => schema.min(1),
}).omit({ id: true, updatedAt: true });

export const selectRestaurantSettingSchema = createSelectSchema(restaurantSettings);

export type RestaurantSetting = z.infer<typeof selectRestaurantSettingSchema>;
export type InsertRestaurantSetting = z.infer<typeof insertRestaurantSettingSchema>;

// ─── Composite Types (for API responses) ────────────────────────────────────

export const orderWithItemsSchema = selectOrderSchema.extend({
  items: z.array(selectOrderItemSchema),
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;

export const menuItemWithCategorySchema = selectMenuItemSchema.extend({
  category: selectMenuCategorySchema,
});

export type MenuItemWithCategory = z.infer<typeof menuItemWithCategorySchema>;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter @odyssey/backend typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add services/backend/src/db/schema.zod.ts
git commit -m "feat(schema): derive zod validation schemas from drizzle tables

Insert schemas omit auto-generated fields (id, timestamps).
Select schemas match full DB row shape. Composite types for
order-with-items and menu-item-with-category API responses."
```

---

## Task 3: Wire Up packages/types Exports

**Files:**
- Modify: `packages/types/package.json`
- Modify: `packages/types/src/index.ts`

**Context:** The types package re-exports TypeScript types derived from the schema so that frontend and other packages can import them without depending on the backend directly. We add `@odyssey/backend` as a workspace dependency to types, and remove `@odyssey/types` from backend deps to avoid circular imports.

- [ ] **Step 1: Update packages/types/package.json**

Add `@odyssey/backend` as a workspace dependency:

```json
{
  "name": "@odyssey/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "@odyssey/backend": "workspace:*",
    "drizzle-orm": "^0.44.0",
    "drizzle-zod": "^0.7.0",
    "zod": "^3.24.0"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "echo 'no lint configured yet'",
    "clean": "rm -rf dist"
  }
}
```

- [ ] **Step 2: Remove @odyssey/types from backend dependencies**

In `services/backend/package.json`, remove the `"@odyssey/types": "workspace:*"` line from `dependencies`. The backend has its own schema and zod files locally — it does not need to import from types.

- [ ] **Step 3: Add exports entry to backend package.json**

Add an `exports` field to `services/backend/package.json` so that `@odyssey/backend` can be imported by types:

Add these fields after `"private": true,`:

```json
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./db/schema": {
      "types": "./src/db/schema.ts",
      "default": "./src/db/schema.ts"
    },
    "./db/schema.zod": {
      "types": "./src/db/schema.zod.ts",
      "default": "./src/db/schema.zod.ts"
    }
  },
```

- [ ] **Step 4: Update packages/types/src/index.ts**

Replace the placeholder with re-exports:

```typescript
// Re-export all Zod schemas and TypeScript types derived from the Drizzle schema.
// Frontend and other packages import from @odyssey/types instead of @odyssey/backend.

export {
  // Menu Categories
  type MenuCategory,
  type InsertMenuCategory,
  insertMenuCategorySchema,
  selectMenuCategorySchema,
  // Menu Items
  type MenuItem,
  type InsertMenuItem,
  insertMenuItemSchema,
  selectMenuItemSchema,
  // Customers
  type Customer,
  type InsertCustomer,
  insertCustomerSchema,
  selectCustomerSchema,
  // Orders
  type Order,
  type InsertOrder,
  insertOrderSchema,
  selectOrderSchema,
  // Order Items
  type OrderItem,
  type InsertOrderItem,
  insertOrderItemSchema,
  selectOrderItemSchema,
  // Restaurant Settings
  type RestaurantSetting,
  type InsertRestaurantSetting,
  insertRestaurantSettingSchema,
  selectRestaurantSettingSchema,
  // Composite types
  type OrderWithItems,
  orderWithItemsSchema,
  type MenuItemWithCategory,
  menuItemWithCategorySchema,
} from "@odyssey/backend/db/schema.zod";

// Re-export table objects for packages that need them (e.g., for Drizzle queries)
export {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  restaurantSettings,
  orderStatusEnum,
} from "@odyssey/backend/db/schema";
```

- [ ] **Step 5: Run pnpm install to update lockfile**

Run: `pnpm install`
Expected: Lockfile updated, no errors.

- [ ] **Step 6: Typecheck all packages**

Run: `pnpm typecheck`
Expected: No errors across the workspace.

- [ ] **Step 7: Commit**

```bash
git add packages/types/package.json packages/types/src/index.ts services/backend/package.json pnpm-lock.yaml
git commit -m "feat(types): wire up type re-exports from backend schema

types package now depends on backend and re-exports all Zod schemas,
TypeScript types, and table objects. Removed circular @odyssey/types
dep from backend."
```

---

## Task 4: Generate & Run Database Migration

**Files:**
- Generated: `services/backend/drizzle/XXXX_*.sql` (migration file created by drizzle-kit)

**Context:** Docker Compose runs PostgreSQL 16 on localhost:5432 with credentials from `.env.example`. Drizzle-kit generates SQL migrations from the schema diff.

- [ ] **Step 1: Start PostgreSQL via Docker**

Run: `docker compose -f /mnt/c/Projects/ody/docker-compose.yml up -d`
Expected: `odyssey-postgres` container running, healthy.

- [ ] **Step 2: Verify database is accessible**

Run: `docker exec odyssey-postgres pg_isready -U odyssey -d odyssey_db`
Expected: `odyssey_db - accepting connections`

- [ ] **Step 3: Generate migration SQL**

Run: `cd /mnt/c/Projects/ody && DATABASE_URL="postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db" pnpm --filter @odyssey/backend db:generate`
Expected: A new migration file created in `services/backend/drizzle/` containing CREATE TYPE for order_status enum and CREATE TABLE statements for all 6 tables.

- [ ] **Step 4: Review the generated migration**

Read the generated `.sql` file in `services/backend/drizzle/` and verify it contains:
- `CREATE TYPE "order_status"` with 6 values
- `CREATE TABLE "menu_categories"` with 5 columns
- `CREATE TABLE "menu_items"` with 8 columns + FK to menu_categories
- `CREATE TABLE "customers"` with 6 columns + unique email
- `CREATE TABLE "orders"` with 6 columns + FK to customers + order_status enum
- `CREATE TABLE "order_items"` with 6 columns + FKs to orders and menu_items
- `CREATE TABLE "restaurant_settings"` with 4 columns + unique key
- All relevant indexes

- [ ] **Step 5: Apply the migration**

Run: `cd /mnt/c/Projects/ody && DATABASE_URL="postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db" pnpm --filter @odyssey/backend db:migrate`
Expected: Migration applied successfully.

- [ ] **Step 6: Verify tables exist in the database**

Run: `docker exec odyssey-postgres psql -U odyssey -d odyssey_db -c "\dt"`
Expected: All 6 tables listed plus the drizzle migrations journal table.

- [ ] **Step 7: Commit the migration**

```bash
git add services/backend/drizzle/
git commit -m "feat(db): add initial migration for all 6 tables

Generated by drizzle-kit from schema.ts. Creates order_status enum,
menu_categories, menu_items, customers, orders, order_items, and
restaurant_settings tables with indexes and foreign keys."
```

---

## Task 5: Implement Seed Script

**Files:**
- Modify: `services/backend/src/db/seed.ts`

**Context:** Seed data must be realistic for a restaurant dashboard demo: 5-8 menu categories, 3-6 items per category, 15-25 customers, 30-50 historical orders spanning the past 30 days. All prices in cents. Orders should have varied statuses across the state machine.

- [ ] **Step 1: Write the seed script**

Replace `services/backend/src/db/seed.ts` with:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  restaurantSettings,
} from "./schema";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db";

async function seed() {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log("Seeding database...");

  // ─── Clear existing data (order matters for FK constraints) ─────────────
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(menuItems);
  await db.delete(menuCategories);
  await db.delete(customers);
  await db.delete(restaurantSettings);

  // ─── Menu Categories ───────────────────────────────────────────────────
  const categoryData = [
    { name: "Appetizers", description: "Start your meal right", position: 1 },
    { name: "Salads", description: "Fresh and healthy options", position: 2 },
    { name: "Mains", description: "Hearty entrees", position: 3 },
    { name: "Pasta", description: "House-made pasta dishes", position: 4 },
    { name: "Seafood", description: "Fresh catch of the day", position: 5 },
    { name: "Desserts", description: "Sweet endings", position: 6 },
    { name: "Beverages", description: "Drinks and refreshments", position: 7 },
  ];

  const insertedCategories = await db
    .insert(menuCategories)
    .values(categoryData)
    .returning();

  console.log(`  Inserted ${insertedCategories.length} categories`);

  // ─── Menu Items ────────────────────────────────────────────────────────
  const itemsByCategory: Record<string, Array<{ name: string; description: string; priceCents: number }>> = {
    Appetizers: [
      { name: "Bruschetta", description: "Toasted bread with tomato, basil, and garlic", priceCents: 1295 },
      { name: "Calamari Fritti", description: "Crispy fried squid with marinara", priceCents: 1495 },
      { name: "Soup of the Day", description: "Ask your server for today's selection", priceCents: 895 },
      { name: "Garlic Bread", description: "House-baked with herb butter", priceCents: 695 },
    ],
    Salads: [
      { name: "Caesar Salad", description: "Romaine, croutons, parmesan, caesar dressing", priceCents: 1295 },
      { name: "Greek Salad", description: "Mixed greens, feta, olives, tomato, cucumber", priceCents: 1195 },
      { name: "Arugula & Pear", description: "Arugula, sliced pear, walnuts, gorgonzola", priceCents: 1395 },
    ],
    Mains: [
      { name: "Grilled Ribeye", description: "12oz ribeye with roasted vegetables", priceCents: 3895 },
      { name: "Roasted Chicken", description: "Half chicken with herb jus and mashed potatoes", priceCents: 2495 },
      { name: "Lamb Chops", description: "New Zealand lamb with mint gremolata", priceCents: 3495 },
      { name: "Mushroom Risotto", description: "Arborio rice with wild mushrooms and truffle oil", priceCents: 2295 },
    ],
    Pasta: [
      { name: "Spaghetti Bolognese", description: "Classic meat sauce over spaghetti", priceCents: 1895 },
      { name: "Fettuccine Alfredo", description: "Creamy parmesan sauce", priceCents: 1795 },
      { name: "Penne Arrabbiata", description: "Spicy tomato sauce with chili flakes", priceCents: 1695 },
      { name: "Lasagna", description: "Layers of pasta, beef ragu, bechamel, mozzarella", priceCents: 1995 },
    ],
    Seafood: [
      { name: "Pan-Seared Salmon", description: "Atlantic salmon with lemon dill sauce", priceCents: 2895 },
      { name: "Grilled Shrimp Skewers", description: "Jumbo shrimp with garlic butter", priceCents: 2695 },
      { name: "Fish & Chips", description: "Beer-battered cod with tartar sauce and fries", priceCents: 1995 },
    ],
    Desserts: [
      { name: "Tiramisu", description: "Classic Italian coffee dessert", priceCents: 1095 },
      { name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla gelato", priceCents: 1295 },
      { name: "Panna Cotta", description: "Vanilla cream with berry compote", priceCents: 995 },
      { name: "Gelato Trio", description: "Three scoops of house-made gelato", priceCents: 895 },
    ],
    Beverages: [
      { name: "Espresso", description: "Double shot", priceCents: 395 },
      { name: "Fresh Lemonade", description: "House-squeezed with mint", priceCents: 495 },
      { name: "Sparkling Water", description: "San Pellegrino 500ml", priceCents: 395 },
      { name: "Iced Tea", description: "Freshly brewed, unsweetened", priceCents: 350 },
    ],
  };

  const allInsertedItems: Array<{ id: number; name: string; priceCents: number }> = [];

  for (const cat of insertedCategories) {
    const items = itemsByCategory[cat.name];
    if (!items) continue;

    const inserted = await db
      .insert(menuItems)
      .values(items.map((item) => ({ ...item, categoryId: cat.id })))
      .returning({ id: menuItems.id, name: menuItems.name, priceCents: menuItems.priceCents });

    allInsertedItems.push(...inserted);
  }

  console.log(`  Inserted ${allInsertedItems.length} menu items`);

  // ─── Customers ─────────────────────────────────────────────────────────
  const customerData = [
    { name: "Alice Johnson", email: "alice@example.com", phone: "+1-555-0101" },
    { name: "Bob Smith", email: "bob@example.com", phone: "+1-555-0102" },
    { name: "Carol Williams", email: "carol@example.com", phone: "+1-555-0103" },
    { name: "David Brown", email: "david@example.com", phone: "+1-555-0104" },
    { name: "Eva Martinez", email: "eva@example.com", phone: "+1-555-0105" },
    { name: "Frank Lee", email: "frank@example.com", phone: "+1-555-0106" },
    { name: "Grace Chen", email: "grace@example.com", phone: "+1-555-0107" },
    { name: "Henry Wilson", email: "henry@example.com", phone: "+1-555-0108" },
    { name: "Irene Davis", email: "irene@example.com", phone: "+1-555-0109" },
    { name: "Jack Thompson", email: "jack@example.com", phone: "+1-555-0110" },
    { name: "Karen White", email: "karen@example.com", phone: "+1-555-0111" },
    { name: "Leo Garcia", email: "leo@example.com", phone: "+1-555-0112" },
    { name: "Maya Patel", email: "maya@example.com", phone: "+1-555-0113" },
    { name: "Nick Robinson", email: "nick@example.com", phone: "+1-555-0114" },
    { name: "Olivia Turner", email: "olivia@example.com", phone: "+1-555-0115" },
    { name: "Paul Anderson", email: "paul@example.com", phone: "+1-555-0116" },
    { name: "Quinn Harris", email: "quinn@example.com", phone: "+1-555-0117" },
    { name: "Rachel Kim", email: "rachel@example.com", phone: "+1-555-0118" },
    { name: "Sam Nguyen", email: "sam@example.com", phone: "+1-555-0119" },
    { name: "Tina Flores", email: "tina@example.com", phone: "+1-555-0120" },
  ];

  const insertedCustomers = await db
    .insert(customers)
    .values(customerData)
    .returning();

  console.log(`  Inserted ${insertedCustomers.length} customers`);

  // ─── Orders + Order Items ──────────────────────────────────────────────

  const statuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"] as const;
  const statusWeights = [3, 2, 2, 2, 25, 6]; // Most orders are COMPLETED
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  function weightedRandomStatus() {
    const total = statusWeights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < statuses.length; i++) {
      r -= statusWeights[i];
      if (r <= 0) return statuses[i];
    }
    return "COMPLETED" as const;
  }

  const orderCount = 40;
  let totalOrderItems = 0;

  for (let i = 0; i < orderCount; i++) {
    const customer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
    const status = weightedRandomStatus();
    const createdAt = new Date(now - Math.random() * THIRTY_DAYS_MS);

    // Pick 1-5 random menu items for this order
    const itemCount = 1 + Math.floor(Math.random() * 5);
    const shuffled = [...allInsertedItems].sort(() => Math.random() - 0.5);
    const pickedItems = shuffled.slice(0, itemCount);

    const orderItemValues = pickedItems.map((item) => ({
      menuItemId: item.id,
      quantity: 1 + Math.floor(Math.random() * 3),
      unitPriceCents: item.priceCents,
    }));

    const totalCents = orderItemValues.reduce(
      (sum, oi) => sum + oi.unitPriceCents * oi.quantity,
      0
    );

    const [insertedOrder] = await db
      .insert(orders)
      .values({ customerId: customer.id, status, totalCents, createdAt })
      .returning();

    await db
      .insert(orderItems)
      .values(orderItemValues.map((oi) => ({ ...oi, orderId: insertedOrder.id })));

    totalOrderItems += orderItemValues.length;
  }

  console.log(`  Inserted ${orderCount} orders with ${totalOrderItems} order items`);

  // ─── Restaurant Settings ───────────────────────────────────────────────
  const settingsData = [
    { key: "prep_time_minutes", value: "25" },
    { key: "auto_accept_orders", value: "false" },
    { key: "service_available", value: "true" },
    { key: "opening_hours", value: JSON.stringify({ mon: "11:00-22:00", tue: "11:00-22:00", wed: "11:00-22:00", thu: "11:00-22:00", fri: "11:00-23:00", sat: "10:00-23:00", sun: "10:00-21:00" }) },
    { key: "tax_rate_bps", value: "875" },
    { key: "restaurant_name", value: "Odyssey Bistro" },
  ];

  await db.insert(restaurantSettings).values(settingsData);
  console.log(`  Inserted ${settingsData.length} settings`);

  console.log("Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the seed script against the database**

Run: `cd /mnt/c/Projects/ody && DATABASE_URL="postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db" pnpm --filter @odyssey/backend db:seed`

Expected output:
```
Seeding database...
  Inserted 7 categories
  Inserted 26 menu items
  Inserted 20 customers
  Inserted 40 orders with ~120 order items
  Inserted 6 settings
Seed complete!
```

- [ ] **Step 3: Verify data in the database**

Run: `docker exec odyssey-postgres psql -U odyssey -d odyssey_db -c "SELECT 'categories' as tbl, count(*) FROM menu_categories UNION ALL SELECT 'items', count(*) FROM menu_items UNION ALL SELECT 'customers', count(*) FROM customers UNION ALL SELECT 'orders', count(*) FROM orders UNION ALL SELECT 'order_items', count(*) FROM order_items UNION ALL SELECT 'settings', count(*) FROM restaurant_settings;"`

Expected: Counts matching seed data (7, 26, 20, 40, ~120-200, 6).

- [ ] **Step 4: Commit**

```bash
git add services/backend/src/db/seed.ts
git commit -m "feat(db): implement seed script with realistic restaurant data

7 categories, 26 menu items, 20 customers, 40 orders spanning 30 days,
and 6 restaurant settings. Weighted order statuses favor COMPLETED."
```

---

## Task 6: Write Schema & Zod Validation Tests

**Files:**
- Create: `services/backend/src/db/__tests__/schema.zod.test.ts`

**Context:** Unit tests for Zod schemas — no database needed. Validates that insert schemas enforce required fields, reject bad data, and that select schemas match expected shapes.

- [ ] **Step 1: Create the test file**

Create `services/backend/src/db/__tests__/schema.zod.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertRestaurantSettingSchema,
} from "../schema.zod";

describe("insertMenuCategorySchema", () => {
  it("accepts valid category", () => {
    const result = insertMenuCategorySchema.safeParse({
      name: "Appetizers",
      description: "Small bites",
      position: 1,
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = insertMenuCategorySchema.safeParse({
      description: "No name",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = insertMenuCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("insertMenuItemSchema", () => {
  it("accepts valid item", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Bruschetta",
      description: "Toasted bread",
      priceCents: 1295,
      available: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Bad Item",
      priceCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Free Item",
      priceCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects fractional price", () => {
    const result = insertMenuItemSchema.safeParse({
      categoryId: 1,
      name: "Decimal Item",
      priceCents: 12.95,
    });
    expect(result.success).toBe(false);
  });
});

describe("insertCustomerSchema", () => {
  it("accepts valid customer", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      phone: "+1-555-0101",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Bob",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("allows phone to be omitted", () => {
    const result = insertCustomerSchema.safeParse({
      name: "Carol",
      email: "carol@example.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("insertOrderSchema", () => {
  it("accepts valid order (only customerId required)", () => {
    const result = insertOrderSchema.safeParse({
      customerId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing customerId", () => {
    const result = insertOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("insertOrderItemSchema", () => {
  it("accepts valid order item", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 5,
      quantity: 2,
      unitPriceCents: 1295,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero quantity", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 5,
      quantity: 0,
      unitPriceCents: 1295,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative unitPriceCents", () => {
    const result = insertOrderItemSchema.safeParse({
      orderId: 1,
      menuItemId: 5,
      quantity: 1,
      unitPriceCents: -500,
    });
    expect(result.success).toBe(false);
  });
});

describe("insertRestaurantSettingSchema", () => {
  it("accepts valid setting", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "prep_time_minutes",
      value: "25",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty key", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "",
      value: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty value", () => {
    const result = insertRestaurantSettingSchema.safeParse({
      key: "test_key",
      value: "",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `cd /mnt/c/Projects/ody && pnpm --filter @odyssey/backend test`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add services/backend/src/db/__tests__/schema.zod.test.ts
git commit -m "test(schema): add unit tests for zod insert schemas

Validates required fields, type constraints, email format, price/quantity
positivity, and integer enforcement. No database needed."
```

---

## Task 7: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Full workspace typecheck**

Run: `cd /mnt/c/Projects/ody && pnpm typecheck`
Expected: All packages pass.

- [ ] **Step 2: Run all tests**

Run: `cd /mnt/c/Projects/ody && pnpm test`
Expected: All tests pass.

- [ ] **Step 3: Verify seed is idempotent (re-run)**

Run: `cd /mnt/c/Projects/ody && DATABASE_URL="postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db" pnpm --filter @odyssey/backend db:seed`
Expected: Completes without errors (deletes old data, inserts fresh).

- [ ] **Step 4: Verify database row counts**

Run: `docker exec odyssey-postgres psql -U odyssey -d odyssey_db -c "SELECT 'categories' as tbl, count(*) FROM menu_categories UNION ALL SELECT 'items', count(*) FROM menu_items UNION ALL SELECT 'customers', count(*) FROM customers UNION ALL SELECT 'orders', count(*) FROM orders UNION ALL SELECT 'order_items', count(*) FROM order_items UNION ALL SELECT 'settings', count(*) FROM restaurant_settings;"`

Expected: Same counts as initial seed (idempotent).

- [ ] **Step 5: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: phase 2 complete — schema, migrations, seed, tests verified"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 6 tables defined (menu_categories, menu_items, customers, orders, order_items, restaurant_settings). Drizzle-zod derivation. Migration generation. Seed data with correct counts.
- [x] **No placeholders:** Every step has complete code or exact commands with expected output.
- [x] **Type consistency:** Schema exports (menuCategories, menuItems, etc.) are used consistently across schema.ts, schema.zod.ts, seed.ts, types/index.ts, and tests.
- [x] **Architecture compliance:** Schema in single file per backend rules. Prices in integer cents. Order status as pgEnum matching shared constants. No circular workspace dependencies.
