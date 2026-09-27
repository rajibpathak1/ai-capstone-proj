# CaseFlow AI

CaseFlow AI processes customer complaint documents into structured case data, customer-ready responses, and internal management summaries.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `OPENAI_API_KEY` — enables live LLM extraction and generation; deterministic extraction keeps the demo usable when the account has no API credits

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/caseflow-ai/` — React/Vite operations workspace
- `artifacts/api-server/src/routes/cases.ts` — complaint case and batch processing endpoints
- `artifacts/api-server/src/lib/case-processing.ts` — structured extraction, response email, and case-summary orchestration
- `lib/api-spec/openapi.yaml` — source of truth for generated client and Zod contracts
- `lib/db/src/schema/cases.ts` — persisted case schema
- `workflow/` — standalone Python batch runner using Pydantic, OpenAI, and `.txt`/`.pdf`/`.docx` extraction
- `data/` — input document folder for the Python workflow
- `output/` — structured data, customer emails, case summaries, and consolidated CSV report

## Architecture decisions

- Documents are processed as an explicit three-step workflow: structured extraction first, then customer email and internal summary in parallel.
- The browser sends text or base64 document payloads to the API; the standalone Python runner handles native PDF and DOCX extraction for folder-based batch processing.
- Cases are persisted in PostgreSQL while the UI consumes generated React Query hooks from the OpenAPI contract.

## Product

The workspace provides a live overview, multi-file upload and batch processing, searchable case register, per-case review screens, copyable customer email output, and processing preferences.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- If the OpenAI account has no credits, the API logs the issue and uses deterministic extraction so seeded and uploaded demo cases remain reviewable.
- Run `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI contract.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
