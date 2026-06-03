# Odyssey — System Patterns

## Architectural Flow (Single Source of Truth)
```
Drizzle Schema → drizzle-zod → Hono/OpenAPI → Orval → Generated React Query Hooks
```

This flow guarantees compile-time type safety. Manual modification of generated contracts is forbidden.

## Backend Architecture (3-Tier)
```
Route Layer (Hono OpenAPI routes)
  ↓
Service Layer (business logic, validation, state machine)
  ↓  
Repository Layer (Drizzle ORM queries)
```

### Rules
- Business logic MUST live in services/hooks, NOT in page components
- Server-side calculations: totals, validation, stock checks — never trust client
- Order state machine enforced server-side with 422 on invalid transitions
- All DB schema definitions in a single schema file

## Frontend Architecture
- Presentational components: focused on UI rendering only
- Container hooks: data fetching via generated React Query hooks
- Business logic: isolated in custom hooks or utility functions
- Design tokens: centralized, never scattered inline
- Reusable UI primitives: Button, Input, Select, Modal, Card, Table, Badge, Nav, Skeleton, Toast

## Data Patterns
- Prices stored in cents (integer) — formatted for display only on frontend
- All IDs are UUIDs
- Timestamps use ISO 8601
- API responses follow consistent envelope pattern
