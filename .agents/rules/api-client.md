---
paths: packages/api-client/**/*.ts
---
# API Client Generation Constraints

- Manual code updates or typing extensions in generated client directories (`src/generated/`) are strictly forbidden.
- Any REST/query change must be executed by updating the OpenAPI spec in Hono and running Orval regeneration (`pnpm gen:contract`).
- The custom Axios instance (`src/custom-instance.ts`) is the ONLY manually maintained file in this package.
- Generated hooks must be used as-is by the frontend. Do not wrap or modify generated function signatures.
- If new endpoints are needed, add them to the Hono backend first, regenerate the OpenAPI spec, then run Orval.
