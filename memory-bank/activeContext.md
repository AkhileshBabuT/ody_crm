# Odyssey — Active Context

## Current Phase
**Phase 1: Base Workspace Setup**

## Current Task
Scaffolding the monorepo structure with all workspace packages, configs, and development infrastructure.

## Status
🟡 In Progress

## Recent Decisions
- Using `create-expo-app` with default template, adding Expo Router manually
- Direct PostgreSQL connection via `postgres` package in wrangler dev (nodejs_compat)
- Vitest for backend testing, Jest for frontend
- Slate + amber color palette for dark mode default theme
- Prices in cents (integer) throughout — server-side calculation only

## Next Steps
1. Complete package scaffolding
2. Run `pnpm install` and verify workspace linkage
3. Verify Docker PostgreSQL + Hono dev server
4. Proceed to Phase 2: Schema Definition & DB Migrations
