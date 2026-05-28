# Phase 4: Frontend Dashboard Design Spec

**Date:** 2026-05-28
**Status:** Approved

## Overview

Build a desktop-first, real-time restaurant operations dashboard using Expo/React Native (web target). The app serves all roles — owner/manager, kitchen staff, and front-of-house — as a unified CRM. The aesthetic is "Command Center": dark, dense, data-forward, inspired by Linear/Grafana.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo ~56.0.4 + React Native 0.85.3 (web target) |
| Routing | Expo Router (file-based) |
| Server State | TanStack React Query ^5.62.0 |
| API Hooks | Orval (auto-generated from backend OpenAPI spec) |
| Icons | Lucide React Native ^0.474.0 |
| Font | Inter (via Google Fonts / Expo) |
| Styling | React Native StyleSheet with centralized design tokens |

## Design System Tokens

All values derive from the design system rules in `.agents/rules/design-system-strictness.md`.

### Colors

```
Background:
  base:       #0f172a  (slate-900)
  surface:    #1e293b  (slate-800)
  elevated:   #334155  (slate-700)
  border:     #334155

Text:
  primary:    #f8fafc  (slate-50)
  secondary:  #e2e8f0  (slate-200)
  muted:      #94a3b8  (slate-400)
  subtle:     #64748b  (slate-500)
  dim:        #475569  (slate-600)

Status:
  pending:    #f59e0b  (amber-500)
  accepted:   #10b981  (emerald-500)
  preparing:  #818cf8  (indigo-400)
  ready:      #38bdf8  (sky-400)
  completed:  #059669  (emerald-600)
  cancelled:  #ef4444  (red-500)

Accent:
  primary:    #f59e0b  (amber-500 — primary actions, CTA buttons)
  positive:   #10b981  (emerald-500 — success, available)
  negative:   #ef4444  (red-500 — errors, unavailable, notification dots)
```

### Spacing (4px base unit)

```
xs:   4px
sm:   8px
md:   12px
lg:   16px
xl:   24px
2xl:  32px
3xl:  48px
```

### Border Radius

```
none: 0
sm:   4px
md:   6px
lg:   8px
xl:   12px
full: 9999px
```

### Typography (Inter)

```
heading-lg:   24px / 700
heading-md:   18px / 700
heading-sm:   15px / 600
body:         13px / 400
body-sm:      12px / 400
caption:      11px / 400
label:        10px / 600 / uppercase / 0.5px letter-spacing
```

### Transitions

All hover, focus, and modal transitions use smooth easing between 150ms and 300ms.

## Architecture

### Folder Structure

```
apps/dashboard/
  app/                          # Expo Router file-based routes
    _layout.tsx                 # Root layout — sidebar + top bar shell
    index.tsx                   # Dashboard (home)
    orders.tsx                  # Orders Kanban
    menu.tsx                    # Menu Management
    customers.tsx               # Customers
    settings.tsx                # Settings
  src/
    components/
      layout/
        Sidebar.tsx             # Collapsible icon sidebar (56px / 200px)
        TopBar.tsx              # Page title, search, notification bell
        AppShell.tsx            # Sidebar + TopBar + content area composition
      shared/
        StatCard.tsx            # KPI card (label, value, trend, subtitle)
        StatusBadge.tsx         # Colored pill for order status
        DataTable.tsx           # Generic table with sorting, pagination
        EmptyState.tsx          # Empty state placeholder
        ConfirmDialog.tsx       # Modal confirmation for destructive actions
        Toast.tsx               # Toast notification for real-time events
    features/
      dashboard/
        DashboardScreen.tsx     # KPI grid + chart + popular items + live feed
        OrderVolumeChart.tsx    # Bar chart with Today/Week/Month toggles
        PopularItemsList.tsx    # Top 5 items with progress bars
        LiveOrderFeed.tsx       # Horizontal scrolling order cards
      orders/
        OrdersScreen.tsx        # Kanban board layout
        KanbanColumn.tsx        # Single status column
        OrderCard.tsx           # Order card with action button
        OrderDetailModal.tsx    # Expanded order view (items, customer, timeline)
      menu/
        MenuScreen.tsx          # Categories sidebar + items grid
        CategoryList.tsx        # Category sidebar with counts
        MenuItemCard.tsx        # Item card with availability toggle
        MenuItemForm.tsx        # Create/edit item modal form
        CategoryForm.tsx        # Create/edit category modal form
      customers/
        CustomersScreen.tsx     # Search + table + pagination
        CustomerRow.tsx         # Table row with expandable detail
        CustomerForm.tsx        # Create/edit customer modal form
      settings/
        SettingsScreen.tsx      # Key-value form
        SettingField.tsx        # Individual setting input row
    hooks/
      useRealtimeQuery.ts       # Wrapper around useQuery with refetchInterval
      useOrderNotifications.ts  # Toast notifications for new/updated orders
    api/
      generated/                # Orval-generated hooks (DO NOT EDIT)
      client.ts                 # Axios/fetch instance with base URL config
      orval.config.ts           # Orval configuration pointing to backend OpenAPI spec
    theme/
      tokens.ts                 # All design tokens exported as typed constants
      styles.ts                 # Shared StyleSheet patterns (card, row, etc.)
```

### Data Flow

```
Backend API (Hono)
  → OpenAPI spec (services/backend/openapi.json)
  → Orval codegen (generates typed React Query hooks)
  → Feature screens consume hooks
  → React Query manages caching, deduplication, background refetch
  → refetchInterval provides real-time feel (3-5s orders, 15-30s stats)
```

### Navigation

- **Sidebar** (left): Collapsible — 56px icon-only by default, expands to 200px with labels on hover or toggle. Items: Dashboard, Orders, Menu, Customers, Settings. Active item highlighted with `surface` background. User avatar at bottom.
- **Top Bar** (top): Page title on left with optional "Live" badge. Search input and notification bell on right. Bell shows red dot when unread count > 0.

## Screens

### 1. Dashboard (Home) — `/`

The landing screen. Provides at-a-glance KPIs and live activity.

**Layout (top to bottom):**
1. **KPI row** — 4 `StatCard` components in a grid:
   - Revenue Today (value, % change vs yesterday)
   - Total Orders (value, pending count badge)
   - Avg. Ticket (value, subtitle)
   - Top Seller (item name, sold count)
2. **Middle row** — 2-column grid:
   - Left (2fr): `OrderVolumeChart` — bar chart with Today/Week/Month toggle buttons
   - Right (1fr): `PopularItemsList` — top 5 items with horizontal progress bars
3. **Bottom row** — `LiveOrderFeed` — horizontal grid of the last 10 order cards, each showing order number, status badge, item count, total, and relative time

**Data sources:** `GET /api/dashboard/stats`, `GET /api/orders?page=1&pageSize=10`

**Polling:** Dashboard stats refresh every 15s. Live feed refreshes every 5s.

### 2. Orders — `/orders`

Kanban board for order lifecycle management.

**Layout:**
- 4 columns: Pending (amber), Accepted (emerald), Preparing (indigo), Ready (sky)
- Column header: colored dot + status name + count badge
- Each `OrderCard` shows: order number, relative time, customer name, item count, total in status color, and an action button that advances to the next state
- Click card body to open `OrderDetailModal` with full item list, customer info, and status timeline
- Action buttons per status: "Accept" (Pending), "Start Prep" (Accepted), "Mark Ready" (Preparing), "Complete" (Ready)
- Cancel button available in the detail modal for Pending/Accepted/Preparing/Ready states

**Data sources:** `GET /api/orders?status=PENDING`, etc. (one query per column), `PATCH /api/orders/:id/status`

**Polling:** Each column refreshes every 3s. Optimistic updates on action button click.

**Toast:** When a new PENDING order arrives (detected by polling), show a toast notification.

### 3. Menu — `/menu`

Category and item CRUD with inline availability control.

**Layout:**
- Left (200px): `CategoryList` — vertical list of categories with item count badges. "+" button at top to add category. Click to select, which filters the items grid.
- Right (flex): Items grid (3 columns). Each `MenuItemCard` shows name, price (amber), availability toggle (emerald/gray), and "sold today" count. Unavailable items render at 60% opacity with red "Unavailable" label.
- "Add Item" button at top of items grid.
- Click card to open `MenuItemForm` modal for editing. Click "+" on categories to open `CategoryForm`.

**Data sources:** `GET /api/menu/categories`, `GET /api/menu/items?categoryId=X`, `POST/PUT/DELETE` for CRUD

**Polling:** No aggressive polling needed. Refetch on mutation success.

### 4. Customers — `/customers`

Searchable customer directory with order history.

**Layout:**
- Top: Search input (full width) + "Add Customer" button
- Middle: `DataTable` with columns: Name, Email, Orders (count), Total Spent, Last Order (relative time). Alternating row backgrounds (`base` / `surface`). Rows are clickable.
- Bottom: Pagination (Prev / page numbers / Next) with "Showing X–Y of Z" text
- Click row to expand inline or open modal showing customer details and recent order history

**Data sources:** `GET /api/customers?search=X&page=Y`, `GET /api/customers/:id`

**Polling:** None. Fetch on navigate and search.

### 5. Settings — `/settings`

Restaurant configuration management.

**Layout:**
- Single-column form (max-width 520px) inside a `surface` card
- Section header: "Restaurant Details"
- Fields: Restaurant Name, Operating Hours, Contact Email, Phone — each with uppercase label and dark input
- "Save Changes" button (amber) at bottom right
- Success toast on save

**Data sources:** `GET /api/settings`, `PUT /api/settings/:key`

**Polling:** None.

## Real-Time Strategy

### v1: Aggressive Polling

Use TanStack React Query's `refetchInterval` option:

| Screen | Interval |
|--------|----------|
| Dashboard stats | 15s |
| Dashboard live feed | 5s |
| Orders Kanban (per column) | 3s |
| All other screens | Manual / on-navigate |

### v2 (Future): WebSocket/SSE

Swap polling for push-based updates with zero component changes:
- Backend publishes order events via SSE
- Client subscribes and calls `queryClient.setQueryData()` to update cache
- Components re-render automatically via React Query's reactivity

### Toast Notifications

- New PENDING order detected → amber toast: "New order #52 — 3 items, $42.00"
- Order status change → status-colored toast: "Order #50 marked READY"
- Toasts auto-dismiss after 5s, stack vertically in top-right corner

## API Integration via Orval

1. Backend runs `generate-openapi.ts` to produce `services/backend/openapi.json`
2. Orval reads that spec and generates typed React Query hooks into `apps/dashboard/src/api/generated/`
3. Each hook provides: `useQuery` for reads, `useMutation` for writes, with full TypeScript types
4. Feature screens import from `api/generated/` — never call fetch directly

## Accessibility

- WCAG AA contrast ratios (4.5:1 minimum) on all text
- All interactive elements keyboard-accessible
- Focus rings visible on tab navigation (2px amber outline)
- Status conveyed by both color AND text (not color alone)
- Screen reader labels on icon-only sidebar items
