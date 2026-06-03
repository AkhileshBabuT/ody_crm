# Odyssey — Restaurant Operations Dashboard

Odyssey is a restaurant operations dashboard for managing the live flow of a
restaurant: an orders Kanban board, menu management, customers, settings, and an
at-a-glance dashboard. It is a TypeScript monorepo built with **pnpm workspaces +
Turborepo**. The frontend is an **Expo (React Native / Web)** app that runs in the
browser; the backend is a **Hono** API targeting **Cloudflare Workers**, backed by
**Postgres** with **Drizzle ORM**. The defining architectural choice is a
**fully generated API contract**: the Drizzle schema is the single source of truth,
`drizzle-zod` derives Zod schemas, Hono's `zod-openapi` emits an OpenAPI document, and
**Orval** turns that document into typed **React Query** hooks the dashboard consumes.
Shared constants (order statuses, valid transitions, currency formatting) live in a
shared package used by both ends.

## Repository Structure

```
ody/
├── apps/
│   └── dashboard/        @odyssey/dashboard — Expo RN/Web operations dashboard
│                         (screens, feature modules, shared UI, design tokens)
├── services/
│   └── backend/          @odyssey/backend — Hono API on Cloudflare Workers,
│                         Drizzle schema/migrations, seed script, route→service→repo layers
├── packages/
│   ├── shared/           @odyssey/shared — order status enum, allowed transitions,
│   │                     formatCents, pagination types (single source of truth)
│   └── api-client/       @odyssey/api-client — Orval-generated React Query hooks
│                         + axios custom instance (src/generated is generated, not hand-written)
├── docker-compose.yml    Local Postgres 16 service
├── turbo.json            Turborepo task graph
├── pnpm-workspace.yaml   Workspace globs (apps/*, services/*, packages/*)
└── .env.example          Example environment variables
```

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10 (repo is pinned to `pnpm@10.14.0`)
- **Docker** (for the local Postgres database)

## Local Setup & Run

Run these from the repository root, in order.

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment**

Copy the example env file. The backend reads `DATABASE_URL` (Postgres connection) and
`PORT` from it.

```bash
cp .env.example .env
```

The defaults already match the Docker Postgres service below:

```
DATABASE_URL=postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db
PORT=8787
```

The dashboard does not require an `.env` file. The generated API client reads
`EXPO_PUBLIC_API_URL` if set and otherwise defaults to `http://localhost:8787`.

**3. Start Postgres**

Brings up `postgres:16-alpine` (database `odyssey_db`, user `odyssey`, password
`odyssey_dev`) on `localhost:5432` with a healthcheck and a persistent volume.

```bash
pnpm db:up
```

**4. Apply migrations**

```bash
pnpm db:migrate
```

**5. Seed development data**

```bash
pnpm db:seed
```

**6. Generate the API contract**

Regenerates the typed React Query hooks in `packages/api-client/src/generated` from the
backend's OpenAPI document (`services/backend/openapi.json`).

```bash
pnpm gen:contract
```

**7. Run the backend**

Starts the Hono API via Wrangler at `http://localhost:8787`. Interactive API docs are
available at `http://localhost:8787/swagger` and the raw spec at
`http://localhost:8787/openapi.json`.

```bash
pnpm dev:backend
```

**8. Run the dashboard**

Starts Expo for web (`expo start --web`); open the URL Expo prints in your browser.

```bash
pnpm dev:dashboard
```

To run both at once: `pnpm dev` (Turborepo runs all `dev` tasks in parallel).

## Seeding Data

```bash
pnpm db:seed
```

The seed (`services/backend/src/db/seed.ts`) clears all tables in foreign-key-safe order
and repopulates the database with realistic restaurant data:

- **7 menu categories** (Appetizers, Salads, Mains, Pasta, Seafood, Desserts, Beverages)
- **~25 menu items** across those categories, each with a description and price (stored as
  integer cents)
- **20 customers** with names, emails, and phone numbers
- **40 orders**, each with 1–5 distinct line items (quantities 1–3), spread across the
  last 30 days, with a weighted random status (majority `COMPLETED`, plus `PENDING`,
  `ACCEPTED`, `PREPARING`, `READY`, and some `CANCELLED`); each order's `totalCents` is
  computed from its line items
- **Restaurant settings**: prep time, auto-accept flag, service availability, opening
  hours (JSON), tax rate (bps), and restaurant name

## Architecture Decisions

**Generated API contract (the central decision).** Types and client code are generated,
not hand-written, so the database, API, and frontend can never silently drift:

```
Drizzle schema (schema.ts)            ← single source of truth for the data model
  → drizzle-zod (schema.zod.ts)       ← Zod insert/select schemas derived from tables
  → Hono zod-openapi (routes/*)       ← routes validate with those schemas and describe responses
  → openapi.json                      ← OpenAPI 3.1 document (generate-openapi.ts / GET /openapi.json)
  → Orval (orval.config.ts)           ← reads openapi.json
  → packages/api-client/src/generated ← typed React Query hooks + response/param schemas
```

A schema change flows outward: edit the Drizzle table, regenerate, and the dashboard's
hooks and types update accordingly. The dashboard imports only these generated hooks
(`useGetApiOrders`, `usePatchApiOrdersIdStatus`, etc.) and never hand-rolls fetch calls.

**Backend layering (routes → services → repositories).** Routes
(`services/backend/src/routes/*.routes.ts`) own HTTP concerns and request/response schema
definitions. Services (`services/backend/src/services/*.service.ts`) hold business logic.
Repositories (`services/backend/src/repositories/*.repository.ts`) own all Drizzle/DB
access. This keeps SQL out of route handlers and business rules out of the transport layer.

**Deliberate order state machine.** Order lifecycle rules are explicit and enforced
server-side:

- **Server-side totals.** On order creation the service looks up each menu item from the
  DB and computes `totalCents` from trusted DB prices — the client never sets the total.
- **Availability checks.** Creation rejects items that don't exist or are unavailable
  (`UNAVAILABLE_ITEMS`).
- **Valid transitions only.** `ALLOWED_TRANSITIONS` (in `@odyssey/shared`) defines the
  allowed status graph (`PENDING → ACCEPTED → PREPARING → READY → COMPLETED`, with
  `CANCELLED` reachable from any active state; `COMPLETED`/`CANCELLED` are terminal).
  Invalid transitions raise `INVALID_STATE_TRANSITION`.
- **Optimistic locking.** The status update is a single atomic UPDATE guarded by
  `WHERE status = currentStatus`; if a concurrent change already moved the order, the
  update affects no rows and the request is rejected so the client can retry.

**Centralized design tokens.** The dashboard's visual language (colors, spacing, radii,
typography, status→color mapping) lives in `apps/dashboard/src/theme/tokens.ts`, so
screens and presentational components in `components/shared/` reference tokens instead of
magic values. Order statuses and currency formatting come from `@odyssey/shared`, keeping
labels and transition logic identical across backend and frontend.

## Testing & Scripts

All scripts are run from the repository root via Turborepo.

| Command | What it does |
| --- | --- |
| `pnpm test` | Runs the backend Vitest suite |
| `pnpm typecheck` | Type-checks every workspace (`tsc --noEmit`) |
| `pnpm lint` | Runs each package's `lint` task |
| `pnpm gen:contract` | Regenerates the API client from `openapi.json` (Orval) |
| `pnpm build` | Builds all packages |

The backend test suite (`services/backend/src`) includes:

- **Unit tests** that need no database: the order state machine
  (`lib/__tests__/order-state-machine.test.ts`), the order service
  (`services/__tests__/order.service.test.ts`), and the Zod schemas
  (`db/__tests__/schema.zod.test.ts`).
- **Integration tests** for the orders and menu routes
  (`routes/__tests__/*.integration.test.ts`). These hit a real Postgres instance at
  `postgresql://odyssey:odyssey_dev@localhost:5432/odyssey_db`, so **`pnpm db:up` must be
  running** (and migrations applied) before `pnpm test`.

## Tradeoffs & Incomplete Areas

- **Integration tests require a running database.** The route integration tests connect to
  a live Postgres at `localhost:5432`; without `pnpm db:up` (and `pnpm db:migrate`) they
  will fail. The state-machine, service, and schema unit tests run without a DB.
- **Web-first; native is a bonus.** The dashboard is built and run for Expo Web
  (`expo start --web`). iOS/Android entry points exist (`expo start --ios|--android`) but
  the layout and styling target the web dashboard and are not the primary deliverable.
- **No authentication.** Auth/authorization is out of scope; all API routes are open. CORS
  is configured for the local Expo web dev origins only.
- **Orders Kanban card placeholders.** The orders list endpoint (`GET /api/orders`) returns
  bare order rows. The Kanban cards in `OrdersScreen` therefore fill `customerName` and
  `itemCount` with placeholder values (`null` / `0`); the full customer and line-item
  detail is loaded only when a card is opened (the order detail call). Folding those fields
  into the list response would remove the placeholders.
- **Lint is a placeholder in several packages.** `@odyssey/backend`, `@odyssey/shared`, and
  `@odyssey/api-client` define `lint` as `echo 'no lint configured yet'`; only the dashboard
  has a real linter (`expo lint`). `pnpm lint` therefore does not yet enforce style across
  the whole repo.
- **OpenAPI spec generation is a separate step.** `pnpm gen:contract` consumes the committed
  `services/backend/openapi.json`. The spec itself is produced by the backend
  (`src/scripts/generate-openapi.ts`, or served live at `/openapi.json`); after backend
  schema/route changes, regenerate the spec before running `gen:contract`.
