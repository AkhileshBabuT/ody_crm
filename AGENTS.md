# Odyssey Full-Stack Restaurant Operations: Unified Multi-Agent Implementation Plan

This document serves as the authoritative System Specification, architectural contract, and operational blueprint for executing the Odyssey Full-Stack Developer Assignment. It orchestrates autonomous agents in Google Antigravity 2.0 using Spec-Driven Development (SDD) to guarantee absolute code quality and eliminate visual and structural AI slop.

---

## 1. Technical Stack & Architectural Bounds

We enforce a strict, modern TypeScript architecture . Substitutions using Next.js, NestJS, Prisma, tRPC, Supabase, Firebase, or custom handwritten fetch layers are strictly prohibited.

### The Core Architectural Flow

All data flow must proceed unidirectionally according to this contract:


$$\text{Drizzle Schema}\rightarrow\text{drizzle-zod}\rightarrow\text{Hono/OpenAPI}\rightarrow\text{Orval}\rightarrow\text{Generated React Query Hooks}$$

This sequence guarantees compile-time type-safety across the monorepo . Any manual modification of generated API contracts is forbidden.

### Monorepo Structure

The codebase is configured as a `pnpm` workspace managed with Turborepo :

| Package / Service Path | Purpose | Key Tech Stack Dependencies |
| --- | --- | --- |
| `apps/dashboard` | Expo React Native Web App | React Native, Expo Router, TanStack Query |
| `services/backend` | Serverless API Gateway | Hono, @hono/zod-openapi, drizzle-orm |
| `packages/shared` | Cross-boundary utilities | TypeScript, Shared constants |
| `packages/types` | Single-source-of-truth schemas | drizzle-zod, Drizzle Schemas |
| `packages/api-client` | Generated frontend clients | Orval, Axios |

---

## 2. Antigravity 2.0 Workspace & Memory Bank

To prevent context amnesia during long sessions, the workspace initializes a persistent **Memory Bank** in the root directory. Active agents must boot by parsing these files sequentially :

```text
memory-bank/
├── projectbrief.md     # Foundational goals, pages, and MoSCoW priorities.
├── productContext.md   # UX requirements (Restaurant B2B, dark mode).
├── systemPatterns.md   # Architectural boundaries and flow diagrams.
├── techContext.md      # Core runtime versions (Workers, PostgreSQL).
├── activeContext.md    # Active workspace task, status, and micro-decisions.
└── progress.md         # Completed features, milestones, and active bugs.
```

### File Specifics:
*   **`projectbrief.md`**: Outlines the five dashboard pages (Home, Orders, CRM, Menu, Settings) and mandates dynamic, interactive elements (drawers/modals) rather than flat mockup displays.
*   **`techContext.md`**: Declares Wrangler CLI for local Worker runs, PostgreSQL 16 local Docker instances, and `drizzle-kit` for migrations.
*   **`systemPatterns.md`**: Declares that business logic must be isolated within custom React Hooks or Hono backend handlers rather than frontend page files.

---

## 3. Design Intelligence & Antigravity "Anti-Slop" Guardrails

We install the **UI UX Pro Max Skill** to bridge the Semantic Design Gap and force the agent to reason visually like an experienced UI engineer.

### Skill Installation
```bash
npm install -g uipro-cli
uipro init --ai antigravity
```

*This instantiates the skill file in `.agents/skills/ui-ux-pro-max/SKILL.md` .*

### Design System Strictness Configuration

Create `.agents/rules/design-system-strictness.md` to prevent styling hallucinations :

```markdown
# Design System Strictness Laws

- ALL styled components MUST use tokens derived from standard Tailwind/Expo variables.
- Direct use of "magic numbers" (e.g., hardcoded padding: 13px, margin-left: 17px) is STRICTLY PROHIBITED.
- DO NOT use generic, AI-associated visual clichés (such as neon purple-on-black or pink gradients).
- Use a calm, high-end "Restaurant Ops" theme: warm warm backgrounds, soft emerald/sage accents for open states.
- Emojis as UI icons are STRICTLY FORBIDDEN. Use SVG icon components (Heroicons or Lucide) .
- Hover, focus, and modal transition states must use smooth CSS easings between 150ms and 300ms .
- Every generated page must strictly maintain WCAG AA compliance (contrast ratio of at least 4.5:1) .
```

---

## 4. Path-Scoped Agent Constraints

To keep the agent's context clean and prevent domain conflicts, we restrict behaviors using YAML path-scoping rules :

### Backend Controller Scoping

Create `.agents/rules/backend.md`:

```yaml
---
paths: services/backend/**/*.ts
---
# Backend Operations Constraints
- Database schema and model definitions must only be added to `services/backend/src/db/schema.ts`.
- Server-side calculations: Order totals, cents validations, and stock checks must occur on the server. Never trust client pricing.
- State Machine enforcement: Allowed state transitions (Pending -> Accepted -> Preparing -> Ready -> Completed) must pass validation. Throw a 422 HTTP error on invalid jumps.
```

### API Client Scoping

Create `.agents/rules/api-client.md`:

```yaml
---
paths: packages/api-client/**/*.ts
---
# API Client Gen Constraints
- Manual code updates or typing extensions in generated client directories are strictly forbidden.
- Any REST/query change must be executed by updating the OpenAPI spec in Hono and calling Orval.
```

---

## 5. Phased Implementation Playbook

We utilize Spec-Driven Development (SDD). The agent must execute these four phases in **Planning Mode** to utilize Chain-of-Thought validation before writing files.

### Phase 1: Workspace & Workspace Configs

Initialize repository files.

1. Configure `pnpm-workspace.yaml` and standard Turborepo configurations (`turbo.json`).
2. Create `docker-compose.yml` to spin up PostgreSQL locally.
3. Run the Antigravity boot sequence:
```text
/grill-me Define workspace dependencies and generate shared ESLint rule files.
```

### Phase 2: Schema Definition & DB Migrations

Generate Drizzle Schemas and build the baseline SQLite/Postgres schemas.

1. Generate tables (`menu_categories`, `menu_items`, `customers`, `orders`, `order_items`, `restaurant_settings`).
2. Derivate TypeScript schemas with `drizzle-zod` .
3. Generate local migration scripts and run a seed script populating 5-8 categories, 3-6 items, 15-25 customers, and 30-50 historical orders.

### Phase 3: Hono OpenAPI Server Setup

Construct Hono endpoints running on Cloudflare Workers.

1. Set up Hono's `zod-openapi` router .
2. Define schema-validated REST request/response shapes.
3. Expose the `/swagger` documentation and host `/openapi.json`.
4. Run testing endpoints natively without starting the server using `hono request` .

### Phase 4: Frontend Component Compilation

Integrate design requirements to construct UI components.

1. Compile visual designs into `/ui-library` in `apps/dashboard`.
2. Generate typed hooks using Orval pointing to backend `/openapi.json` .
3. Implement core screens binding UI controls strictly to generated TanStack hooks.

---

## 6. Multi-Agent Orchestration & Headless Verification

We transition human operations from writing code to high-level multi-agent orchestration.

### Parallel Agent Pipelines

Use the **Agent Manager** command deck to spawn asynchronous, isolated subagents :

1. **Subagent A** is spawned to draft unit and integration test coverage targeting 95%+ coverage on critical order paths.
2. **Subagent B** is spawned in parallel to assemble the UI Library token mapping and build out interactive settings forms.

### Headless Web QA Loop

After completing visual screens, execute the headless Chrome visual validation loop :

1. The agent launches local development servers using a custom workflow command `/startcycle`.
2. The agent navigates through pages using Antigravity's integrated Chrome browser to click menu actions and submit new orders.
3. It takes and saves screenshots of responsive screens (375px, 768px, 1024px, 1440px breakpoints) .
4. The agent's vision layer compares these screenshots to the designated design rules, correcting and refactoring styling discrepancies automatically.

---

### Key Integration Steps for Success:
1. **Save this file**: Save the text block above in your workspace root as `AGENTS.md`.
2. **Launch in Planning Mode**: Open the Antigravity 2.0 Agent Manager. Toggle your model default mode to **Plan** (this forces the agent's Chain-of-Thought loops to read your schema boundaries instead of rushing code).
3. **Trigger Core Commands**: Start your session by instructing the agent to boot from the memory bank:
   ```
   /grill-me Read AGENTS.md and memory-bank/ and outline our initial database schemas.
   ```
   *The `/grill-me` command forces the agent to ask you clarifying technical questions before writing code, ensuring zero code mismatch.*
