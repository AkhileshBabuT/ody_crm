# Odyssey — Tech Context

## Runtime Versions
- Node.js: v22.14.0
- pnpm: 10.14.0
- Docker: 28.5.1 (for local PostgreSQL)

## Core Stack
| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Expo + React Native + Web, Expo Router |
| Backend | Hono on Cloudflare Workers |
| Database | PostgreSQL 16 (Docker local) |
| ORM | Drizzle ORM |
| Schema Validation | drizzle-zod + Zod |
| API Spec | @hono/zod-openapi → OpenAPI 3.1 |
| Client Gen | Orval → React Query hooks |
| Data Fetching | TanStack React Query |
| Testing | Vitest (backend), Jest + RTL (frontend) |

## Development Tools
- **Wrangler**: Local Cloudflare Workers dev server (`wrangler dev`)
- **drizzle-kit**: Migration generation and execution
- **Orval**: OpenAPI → typed React Query hook generation
- **Docker Compose**: Local PostgreSQL 16 instance

## Local Development
```bash
pnpm db:up          # Start PostgreSQL via Docker
pnpm db:migrate     # Run Drizzle migrations
pnpm db:seed        # Seed development data
pnpm dev:backend    # Start Hono on Wrangler
pnpm dev:dashboard  # Start Expo web dev server
pnpm gen:contract   # Regenerate Orval client from OpenAPI spec
```

## Key Constraints
- `nodejs_compat` flag required in wrangler.toml for TCP connections to Postgres
- Direct postgres:// connection for local dev (no Hyperdrive)
- All generated code in `packages/api-client/src/generated/` — never hand-edit
