# CaseFlow AI

CaseFlow AI is a GenAI-powered customer complaint processing workspace. It ingests complaint documents, extracts structured case information, drafts a customer response, and creates an internal management summary.

## Project structure

```text
caseflow-ai/
├── artifacts/
│   ├── api-server/          Express API and processing workflow
│   └── caseflow-ai/         React/Vite web application
├── data/                    Input documents for the folder-based batch runner
├── lib/
│   ├── api-client-react/    Generated React Query client
│   ├── api-spec/            OpenAPI source of truth
│   ├── api-zod/             Generated Zod schemas
│   └── db/                  Drizzle schema and database package
├── output/
│   ├── structured_data/     JSON extraction results
│   ├── customer_emails/     Generated customer replies
│   ├── case_summaries/      Internal summaries
│   └── final_report.csv     Consolidated batch report
├── workflow/                Standalone Python batch workflow
├── scripts/                 Workspace utility scripts
├── package.json
└── pnpm-workspace.yaml
```

## Requirements

- Node.js 20+ (Node 24 is used in the Replit workspace)
- pnpm 10+
- Python 3.11+ for the standalone workflow
- PostgreSQL for the API
- An OpenAI API key for live model processing

## Run the web app locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template and fill in your local PostgreSQL connection string:

   ```bash
   cp .env.example .env
   ```

   `OPENAI_API_KEY` is optional for the demo fallback, but required for live LLM output.

3. Push the development schema:

   ```bash
   DATABASE_URL="postgresql://..." pnpm --filter @workspace/db run push
   ```

4. Start the API server in one terminal:

   ```bash
   PORT=8080 DATABASE_URL="postgresql://..." pnpm --filter @workspace/api-server run dev
   ```

5. Start the web app in another terminal:

   ```bash
   PORT=5173 BASE_PATH=/ pnpm --filter @workspace/caseflow-ai run dev
   ```

6. Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to the local API server on port 8080.

## Run the Python batch workflow

The Python workflow reads eligible files from `data/` and writes the expected output folders.

```bash
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r workflow/requirements.txt
export OPENAI_API_KEY="your-key"
python -m workflow.pipeline
```

Supported input formats are `.txt`, `.pdf`, and `.docx`.

## API and frontend development

The OpenAPI contract lives in `lib/api-spec/openapi.yaml`. If the contract changes, regenerate the typed client and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Useful checks:

```bash
pnpm run typecheck
pnpm --filter @workspace/caseflow-ai run build
```

## GitHub

After extracting the source archive:

```bash
git init
git add .
git commit -m "Initial CaseFlow AI source"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

The repository ignores `node_modules`, build output, caches, TypeScript build metadata, and local environment files. Never commit `.env` or API keys.