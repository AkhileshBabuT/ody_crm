# Odyssey — Project Brief

## Overview
Build a full-stack restaurant operations dashboard using a modern TypeScript monorepo architecture.

## Core Pages
1. **Home** — KPIs: total orders, revenue, pending orders, popular items
2. **Orders** — List with filters, detail view, status action transitions
3. **CRM** — Customer list with order count, spend, recent orders
4. **Menu** — Categories, items with price and availability management
5. **Settings** — Prep time, auto-accept, service availability, opening hours

## MoSCoW Priorities

### Must Have
- All 5 dashboard pages with real data from backend
- Full ordering flow: create, list, filter, view details, transition status
- Menu CRUD with categories and items
- Customer records with order history aggregates
- Design system with tokens, typography, spacing, components
- UI Library showcase route
- Server-side validation and order total calculation
- Order state machine enforcement
- Seed data for easy local review
- Type-safe contract flow: Drizzle → drizzle-zod → Hono/OpenAPI → Orval → React Query

### Should Have
- Polished empty, loading, error states across all pages
- Edit/create flows using modals or drawers (not page navigation)
- Hover, focus, active, disabled states on all interactive elements
- Targeted backend tests for key order flows
- Frontend tests for important logic or UI states

### Could Have
- Chart visualizations on Home page
- Native mobile readiness
- Dark/light mode toggle

### Won't Have (this iteration)
- Authentication / authorization
- Real payment processing
- Multi-restaurant / multi-tenant support
- Deployment to production
