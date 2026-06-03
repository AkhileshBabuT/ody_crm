---
paths: services/backend/**/*.ts
---
# Backend Operations Constraints

- Database schema and model definitions must only be added to `services/backend/src/db/schema.ts`.
- Server-side calculations: Order totals, cents validations, and stock checks must occur on the server. Never trust client pricing.
- State Machine enforcement: Allowed state transitions (Pending → Accepted → Preparing → Ready → Completed, plus Cancelled from non-terminal states) must pass validation. Throw a 422 HTTP error on invalid jumps.
- Backend follows 3-tier architecture: Route Layer → Service Layer → Repository Layer.
- Business logic belongs in the Service layer, not in route handlers.
- All prices are stored and calculated in cents (integers). Never use floating-point for money.
- API responses must use consistent typed shapes defined via @hono/zod-openapi.
- All endpoints must validate request bodies and query parameters using Zod schemas derived from drizzle-zod.
