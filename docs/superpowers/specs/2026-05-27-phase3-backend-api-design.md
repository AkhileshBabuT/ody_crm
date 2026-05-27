# Phase 3: Backend API — Design Spec

## Goal

Build a complete Hono REST API on Cloudflare Workers that exposes OpenAPI-documented endpoints for menu management, order processing, customer records, restaurant settings, and dashboard KPIs. The API enforces server-side business rules (order state machine, price calculation, availability checks) and produces an OpenAPI spec file that Orval consumes to generate typed frontend hooks.

## Architecture

3-tier architecture (Route → Service → Repository) using `@hono/zod-openapi` for type-safe, documented endpoints. All request/response shapes are Zod schemas derived from or aligned with the Drizzle schema. The DB connection is created per-request via Hono middleware from `c.env.DATABASE_URL`, keeping the app stateless and Workers-compatible. Local development uses `postgres` TCP driver with Docker PostgreSQL via `wrangler dev --local`.

## Tech Stack

- Hono 4.x + `@hono/zod-openapi` 0.18.x
- Drizzle ORM 0.44.x + `postgres` driver
- Zod 3.x (validation + OpenAPI schema generation)
- Vitest (unit + integration tests)
- Wrangler (local dev server)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB driver | `postgres` (TCP) for local dev | Assignment evaluated locally; defer Hyperdrive/serverless to deployment |
| Order pricing | Server-side lookup only | Assignment: "never trust client pricing"; client sends `menuItemId` + `quantity` only |
| Pagination | Simple offset/limit | Seed data is ~40 orders, ~20 customers; cursor-based is overkill |
| Dashboard KPIs | Single `/api/dashboard/stats` endpoint | One fetch for the frontend, fewer round trips |
| OpenAPI export | Script using `app.getOpenAPI31Document()` | No server startup needed; deterministic static file for Orval |
| Architecture | 3-tier with plain function modules | Mandated by `.agents/rules/backend.md`; no DI framework needed |

---

## API Endpoints

### Menu Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/menu/categories` | List all categories ordered by position |
| GET | `/api/menu/categories/:id` | Get category with its items |
| POST | `/api/menu/categories` | Create category |
| PUT | `/api/menu/categories/:id` | Update category |
| DELETE | `/api/menu/categories/:id` | Delete category (cascades items) |

### Menu Items

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/menu/items` | List items (filter: `?categoryId=`, `?available=`) |
| GET | `/api/menu/items/:id` | Get single item with category |
| POST | `/api/menu/items` | Create item |
| PUT | `/api/menu/items/:id` | Update item |
| DELETE | `/api/menu/items/:id` | Delete item (FK restrict on `order_items` — catch DB error, return 409) |

### Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | List orders (filter: `?status=`, `?from=`, `?to=`, `?limit=`, `?offset=`) |
| GET | `/api/orders/:id` | Get order with items + customer |
| POST | `/api/orders` | Create order (`{customerId, items: [{menuItemId, quantity}]}`) |
| PATCH | `/api/orders/:id/status` | Update order status (`{status}`) |

### Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/customers` | List customers (filter: `?search=`, `?limit=`, `?offset=`) |
| GET | `/api/customers/:id` | Get customer with order history summary |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |

### Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings/:key` | Get single setting by key |
| PUT | `/api/settings/:key` | Update setting value |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | KPIs: total orders, revenue, pending count, orders today, top 5 popular items |

---

## File Structure

```
services/backend/src/
├── index.ts                          # App entry — mount route groups, middleware
├── lib/
│   ├── db.ts                         # Hono middleware: creates Drizzle instance on c.var.db
│   ├── errors.ts                     # AppError class + error response helpers
│   └── order-state-machine.ts        # Valid transitions map + validate function
├── routes/
│   ├── menu.routes.ts                # OpenAPI route defs + handlers for categories & items
│   ├── orders.routes.ts              # Order CRUD + status transition routes
│   ├── customers.routes.ts           # Customer CRUD routes
│   ├── settings.routes.ts            # Settings get/update routes
│   └── dashboard.routes.ts           # Stats aggregation route
├── services/
│   ├── menu.service.ts               # Menu business logic
│   ├── order.service.ts              # Order creation (price lookup, total calc), status transitions
│   ├── customer.service.ts           # Customer logic + order summary aggregation
│   ├── settings.service.ts           # Settings upsert logic
│   └── dashboard.service.ts          # KPI aggregation
├── repositories/
│   ├── menu.repository.ts            # Drizzle queries for categories & items
│   ├── order.repository.ts           # Drizzle queries for orders & order items
│   ├── customer.repository.ts        # Drizzle queries for customers
│   ├── settings.repository.ts        # Drizzle queries for settings
│   └── dashboard.repository.ts       # Aggregation SQL queries
├── db/                               # Existing: schema, zod schemas, seed, migrations
└── scripts/
    └── generate-openapi.ts           # Imports app, writes openapi.json to disk
```

---

## Layer Responsibilities

### Route Layer (`routes/`)
- Define `createRoute()` with Zod request/response schemas
- Register routes via `app.openapi(route, handler)`
- Extract validated params/body/query from `c.req.valid()`
- Access DB from `c.var.db`
- Call service functions, return typed JSON responses
- No business logic

### Service Layer (`services/`)
- Receive DB instance + validated input as function arguments
- Implement business rules: state machine validation, price calculation, availability checks
- Call repository functions for DB access
- Throw `AppError` for business rule violations
- No HTTP concerns (no `c` context, no status codes)

### Repository Layer (`repositories/`)
- Receive DB instance as function argument
- Execute Drizzle queries (select, insert, update, delete)
- Return raw query results
- No business logic, no error interpretation

---

## Order State Machine

Valid transitions:

```
PENDING   → [ACCEPTED, CANCELLED]
ACCEPTED  → [PREPARING, CANCELLED]
PREPARING → [READY, CANCELLED]
READY     → [COMPLETED, CANCELLED]
COMPLETED → []  (terminal)
CANCELLED → []  (terminal)
```

Invalid transitions return HTTP 422 with error code `INVALID_STATE_TRANSITION`.

## Order Creation Flow

1. Validate customer exists (404 if not)
2. Validate all menu items exist and `available = true` (422 with item IDs if any unavailable)
3. Look up current `priceCents` for each item from DB
4. Calculate `totalCents = sum(quantity * priceCents)` server-side
5. Insert order + order items in a single DB transaction
6. Return created order with items

## Error Response Shape

All error responses use a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | INVALID_STATE_TRANSITION | UNAVAILABLE_ITEMS",
    "message": "Human-readable description",
    "details": null
  }
}
```

`details` is optional and may contain structured data (e.g., list of unavailable item IDs).

---

## DB Middleware

A Hono middleware creates a Drizzle instance per request:

```typescript
// lib/db.ts
app.use("/api/*", async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  await next();
});
```

Routes access it as `c.var.db` and pass it down to services/repositories.

---

## OpenAPI Spec Generation

`scripts/generate-openapi.ts` imports the Hono app, extracts the OpenAPI 3.1 document, and writes it to `services/backend/openapi.json`. This file is consumed by Orval (`packages/api-client/orval.config.ts`).

Root script: `pnpm gen:contract` runs:
1. `tsx scripts/generate-openapi.ts` — produces `openapi.json`
2. `pnpm --filter @odyssey/api-client exec orval` — generates typed React Query hooks

---

## Testing Strategy

### Unit Tests
- **`order-state-machine.test.ts`** — all valid/invalid transitions, terminal state rejection
- **`order.service.test.ts`** — order creation logic (total calculation, unavailable items, missing customer) with mocked repository

### Integration Tests (real PostgreSQL via Docker)
- **`orders.integration.test.ts`** — create order, status transitions (happy + invalid), list with filters, unavailable items, missing customer
- **`menu.integration.test.ts`** — CRUD lifecycle for categories/items, delete protection

Integration tests use `app.request()` (Hono's built-in test client — no server startup). Each test suite seeds minimal data before tests and cleans up after.

### Scripts
- `pnpm test` — Vitest via Turborepo
- `pnpm typecheck` — `tsc --noEmit` across workspaces
- `pnpm gen:contract` — OpenAPI export + Orval generation

---

## Dashboard Stats Response Shape

```json
{
  "totalOrders": 142,
  "totalRevenueCents": 1250000,
  "pendingOrders": 8,
  "ordersToday": 12,
  "popularItems": [
    { "menuItemId": 5, "name": "Margherita Pizza", "totalQuantity": 47 },
    { "menuItemId": 12, "name": "Caesar Salad", "totalQuantity": 35 },
    ...
  ]
}
```

---

## Out of Scope

- Authentication/authorization (no auth layer for this assignment)
- Real-time SSE/WebSocket (can be added in a future phase if needed)
- Deployment to Cloudflare (local dev only)
- Rate limiting
