// Seed script for development data.
// Populates the database with realistic restaurant data.

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

const client = postgres(DATABASE_URL);
const db = drizzle(client);

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function weightedRandomStatus(): "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED" {
  const r = Math.random();
  if (r < 0.55) return "COMPLETED";
  if (r < 0.65) return "PENDING";
  if (r < 0.75) return "ACCEPTED";
  if (r < 0.85) return "PREPARING";
  if (r < 0.93) return "READY";
  return "CANCELLED";
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const categoryData = [
  { name: "Appetizers", description: "Start your meal with something delicious", position: 1 },
  { name: "Salads", description: "Fresh and healthy salad options", position: 2 },
  { name: "Mains", description: "Hearty main courses", position: 3 },
  { name: "Pasta", description: "Handmade pasta dishes", position: 4 },
  { name: "Seafood", description: "Fresh catches from the sea", position: 5 },
  { name: "Desserts", description: "Sweet endings to your meal", position: 6 },
  { name: "Beverages", description: "Refreshing drinks and cocktails", position: 7 },
];

const menuItemData: Record<string, { name: string; description: string; priceCents: number }[]> = {
  Appetizers: [
    { name: "Bruschetta", description: "Toasted bread topped with fresh tomatoes, basil, and garlic", priceCents: 995 },
    { name: "Calamari Fritti", description: "Crispy fried squid with marinara dipping sauce", priceCents: 1295 },
    { name: "Stuffed Mushrooms", description: "Mushroom caps filled with herbed cream cheese and breadcrumbs", priceCents: 1095 },
    { name: "Soup of the Day", description: "Ask your server for today's freshly made soup", priceCents: 795 },
  ],
  Salads: [
    { name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, and house-made Caesar dressing", priceCents: 1195 },
    { name: "Greek Salad", description: "Tomatoes, cucumbers, olives, red onion, and feta cheese", priceCents: 1095 },
    { name: "Arugula & Pear Salad", description: "Baby arugula, sliced pear, walnuts, and gorgonzola", priceCents: 1295 },
  ],
  Mains: [
    { name: "Grilled Ribeye Steak", description: "12oz prime ribeye with roasted potatoes and seasonal vegetables", priceCents: 3495 },
    { name: "Roasted Chicken", description: "Half chicken roasted with herbs, served with mashed potatoes", priceCents: 2295 },
    { name: "Lamb Chops", description: "New Zealand lamb chops with mint chimichurri and couscous", priceCents: 3195 },
    { name: "Grilled Pork Chop", description: "Thick-cut pork chop with apple chutney and green beans", priceCents: 2495 },
  ],
  Pasta: [
    { name: "Spaghetti Carbonara", description: "Classic carbonara with pancetta, egg, and pecorino romano", priceCents: 1895 },
    { name: "Penne Arrabbiata", description: "Penne in a spicy tomato sauce with fresh chili and garlic", priceCents: 1695 },
    { name: "Fettuccine Alfredo", description: "Fettuccine tossed in a rich parmesan cream sauce", priceCents: 1795 },
    { name: "Mushroom Risotto", description: "Arborio rice with wild mushrooms, white wine, and parmesan", priceCents: 1995 },
  ],
  Seafood: [
    { name: "Pan-Seared Salmon", description: "Atlantic salmon with lemon butter sauce and asparagus", priceCents: 2895 },
    { name: "Grilled Shrimp Skewers", description: "Jumbo shrimp with garlic herb butter and rice pilaf", priceCents: 2495 },
    { name: "Fish and Chips", description: "Beer-battered cod with thick-cut fries and tartar sauce", priceCents: 1895 },
    { name: "Lobster Tail", description: "Broiled lobster tail with drawn butter and roasted potatoes", priceCents: 3995 },
  ],
  Desserts: [
    { name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone", priceCents: 1095 },
    { name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten center, served with vanilla ice cream", priceCents: 1295 },
    { name: "Creme Brulee", description: "Vanilla custard with a caramelized sugar crust", priceCents: 995 },
  ],
  Beverages: [
    { name: "Fresh Lemonade", description: "House-made lemonade with fresh lemons and mint", priceCents: 495 },
    { name: "Espresso", description: "Double shot of Italian espresso", priceCents: 395 },
    { name: "Iced Tea", description: "Freshly brewed black tea served over ice", priceCents: 395 },
    { name: "Sparkling Water", description: "San Pellegrino sparkling mineral water", priceCents: 495 },
  ],
};

const customerData = [
  { name: "James Wilson", email: "james.wilson@example.com", phone: "+1-555-0101" },
  { name: "Sarah Chen", email: "sarah.chen@example.com", phone: "+1-555-0102" },
  { name: "Michael Brown", email: "michael.brown@example.com", phone: "+1-555-0103" },
  { name: "Emily Davis", email: "emily.davis@example.com", phone: "+1-555-0104" },
  { name: "Robert Martinez", email: "robert.martinez@example.com", phone: "+1-555-0105" },
  { name: "Jennifer Lee", email: "jennifer.lee@example.com", phone: "+1-555-0106" },
  { name: "David Kim", email: "david.kim@example.com", phone: "+1-555-0107" },
  { name: "Amanda Johnson", email: "amanda.johnson@example.com", phone: "+1-555-0108" },
  { name: "Christopher Garcia", email: "chris.garcia@example.com", phone: "+1-555-0109" },
  { name: "Jessica Taylor", email: "jessica.taylor@example.com", phone: "+1-555-0110" },
  { name: "Daniel Anderson", email: "daniel.anderson@example.com", phone: "+1-555-0111" },
  { name: "Lisa Nguyen", email: "lisa.nguyen@example.com", phone: "+1-555-0112" },
  { name: "Matthew Thomas", email: "matthew.thomas@example.com", phone: "+1-555-0113" },
  { name: "Rachel White", email: "rachel.white@example.com", phone: "+1-555-0114" },
  { name: "Andrew Jackson", email: "andrew.jackson@example.com", phone: "+1-555-0115" },
  { name: "Sophia Harris", email: "sophia.harris@example.com", phone: "+1-555-0116" },
  { name: "Kevin Clark", email: "kevin.clark@example.com", phone: "+1-555-0117" },
  { name: "Olivia Robinson", email: "olivia.robinson@example.com", phone: "+1-555-0118" },
  { name: "Brian Hall", email: "brian.hall@example.com", phone: "+1-555-0119" },
  { name: "Maria Sanchez", email: "maria.sanchez@example.com", phone: "+1-555-0120" },
];

const settingsData = [
  { key: "prep_time_minutes", value: "25" },
  { key: "auto_accept_orders", value: "false" },
  { key: "service_available", value: "true" },
  {
    key: "opening_hours",
    value: JSON.stringify({
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "10:00", close: "21:00" },
    }),
  },
  { key: "tax_rate_bps", value: "875" },
  { key: "restaurant_name", value: "Odyssey Restaurant" },
];

// ─── Main Seed Function ────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding database...");

  // 1. Delete existing data in FK order
  console.log("Clearing existing data...");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(menuItems);
  await db.delete(menuCategories);
  await db.delete(customers);
  await db.delete(restaurantSettings);

  // 2. Insert menu categories
  console.log("Inserting menu categories...");
  const insertedCategories = await db
    .insert(menuCategories)
    .values(categoryData)
    .returning();

  // 3. Insert menu items
  console.log("Inserting menu items...");
  const allMenuItems: { id: number; priceCents: number }[] = [];
  for (const cat of insertedCategories) {
    const items = menuItemData[cat.name];
    if (items) {
      const inserted = await db
        .insert(menuItems)
        .values(items.map((item) => ({ ...item, categoryId: cat.id })))
        .returning();
      allMenuItems.push(...inserted.map((i) => ({ id: i.id, priceCents: i.priceCents })));
    }
  }
  console.log(`  Inserted ${allMenuItems.length} menu items`);

  // 4. Insert customers
  console.log("Inserting customers...");
  const insertedCustomers = await db
    .insert(customers)
    .values(customerData)
    .returning();

  // 5. Insert orders with order items
  console.log("Inserting orders...");
  for (let i = 0; i < 40; i++) {
    const customer = randomElement(insertedCustomers);
    const status = weightedRandomStatus();
    const createdAt = randomDate(30);

    // Pick 1-5 random items for this order
    const itemCount = randomInt(1, 5);
    const selectedItems: { menuItemId: number; quantity: number; unitPriceCents: number }[] = [];
    const usedItemIds = new Set<number>();

    for (let j = 0; j < itemCount; j++) {
      let item = randomElement(allMenuItems);
      // Avoid duplicate items in the same order
      let attempts = 0;
      while (usedItemIds.has(item.id) && attempts < 10) {
        item = randomElement(allMenuItems);
        attempts++;
      }
      if (usedItemIds.has(item.id)) continue;
      usedItemIds.add(item.id);

      const quantity = randomInt(1, 3);
      selectedItems.push({
        menuItemId: item.id,
        quantity,
        unitPriceCents: item.priceCents,
      });
    }

    const totalCents = selectedItems.reduce(
      (sum, si) => sum + si.unitPriceCents * si.quantity,
      0,
    );

    const [insertedOrder] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        status,
        totalCents,
        createdAt,
      })
      .returning();

    await db.insert(orderItems).values(
      selectedItems.map((si) => ({
        orderId: insertedOrder.id,
        menuItemId: si.menuItemId,
        quantity: si.quantity,
        unitPriceCents: si.unitPriceCents,
      })),
    );
  }
  console.log("  Inserted 40 orders with items");

  // 6. Insert restaurant settings
  console.log("Inserting restaurant settings...");
  await db.insert(restaurantSettings).values(settingsData);

  console.log("Seeding complete!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .then(async () => {
    await client.end();
    process.exit(0);
  });
