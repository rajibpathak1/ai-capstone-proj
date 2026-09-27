import { and, desc, ilike, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, casesTable } from "@workspace/db";

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  GetCaseParams,
  ListCasesQueryParams,
  ProcessBatchBody,
  ProcessCaseBody,
} from "@workspace/api-zod";
import { decodeDocumentContent, processDocument } from "../lib/case-processing";

const router: IRouter = Router();

function serializeCase(item: typeof casesTable.$inferSelect) {
  return {
    id: item.id,
    filename: item.filename,
    fileType: item.fileType,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    structuredData: item.structuredData,
    customerEmail: item.customerEmail,
    caseSummary: item.caseSummary,
    sourcePreview: item.sourcePreview,
    processingMs: item.processingMs,
  };
}

async function createCase(filename: string, content: string) {
  const startedAt = Date.now();
  const outputs = await processDocument(content);
  const inserted = await db
    .insert(casesTable)
    .values({
      filename,
      fileType: filename.split(".").pop()?.toUpperCase() ?? "DOC",
      status: outputs.structuredData.overallCaseStatus,
      sourceText: content,
      sourcePreview: content.slice(0, 480),
      structuredData: outputs.structuredData,
      customerEmail: outputs.customerEmail,
      caseSummary: outputs.caseSummary,
      processingMs: Date.now() - startedAt,
    })
    .returning();
  return inserted[0];
}

//async function ensureSeedCases() {
 
//}

//void ensureSeedCases();

// 27-09-2026 Rajib
const supportedExtensions = new Set([".txt", ".pdf", ".docx"]);

type FolderProcessResult = {
  dataDir: string;
  imported: string[];
  skipped: string[];
  errors: Array<{ filename: string; error: string }>;
};

function getDataDirectory() {
  return path.resolve(
    process.env.DATA_DIR ?? path.join(process.cwd(), "data"),
  );
}

async function processDataFolder(): Promise<FolderProcessResult> {
  const dataDir = getDataDirectory();

  const result: FolderProcessResult = {
    dataDir,
    imported: [],
    skipped: [],
    errors: [],
  };

  if (!existsSync(dataDir)) {
    return result;
  }

  const existingRows = await db
    .select({ filename: casesTable.filename })
    .from(casesTable);

  const existingFiles = new Set(existingRows.map((row) => row.filename));

  const entries = await readdir(dataDir, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((filename) =>
      supportedExtensions.has(path.extname(filename).toLowerCase()),
    )
    .sort();

  for (const filename of files) {
    if (existingFiles.has(filename)) {
      result.skipped.push(filename);
      continue;
    }

    try {
      const fullPath = path.join(dataDir, filename);
      const buffer = await readFile(fullPath);
      const extension = path.extname(filename).toLowerCase();

      const content =
        extension === ".txt"
          ? buffer.toString("utf8")
          : await decodeDocumentContent(
              filename,
              buffer.toString("base64"),
              "base64",
            );

      await createCase(filename, content);
      existingFiles.add(filename);
      result.imported.push(filename);
    } catch (error) {
      result.errors.push({
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

async function importDataFolderOnStartup() {
  const existing = await db
    .select({ id: casesTable.id })
    .from(casesTable)
    .limit(1);

  if (existing.length === 0) {
    const result = await processDataFolder();
    console.log(
      `Imported ${result.imported.length} document(s) from ${result.dataDir}`,
    );
  }
}

void importDataFolderOnStartup().catch((error) => {
  console.error("Initial data-folder import failed:", error);
});

router.get("/cases", async (req, res) => {
  const parsed = ListCasesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid filters" });
    return;
  }

  const { status, search } = parsed.data;
  const filters = [];
  if (status) filters.push(sql`${casesTable.status} = ${status}`);
  if (search) {
    filters.push(
      or(
        ilike(casesTable.filename, `%${search}%`),
        ilike(casesTable.customerEmail, `%${search}%`),
      ),
    );
  }
  const rows = await db
    .select()
    .from(casesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(casesTable.createdAt));
  res.json(rows.map(serializeCase));
});

// added 27-09-2026  Rajib

router.post("/cases/process-folder", async (req, res) => {
  try {
    const result = await processDataFolder();
    res.json(result);
  } catch (error) {
    req.log.error({ err: error }, "Failed to process data folder");
    res.status(500).json({ error: "Data-folder processing failed" });
  }
});
// added 27-09-2026	Rajib

router.delete("/cases", async (_req, res) => {
  try {
    await db.delete(casesTable);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete cases:", error);
    res.status(500).json({ error: "Could not delete cases" });
  }
});


router.get("/cases/:id", async (req, res) => {
  const parsed = GetCaseParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }
  const row = await db
    .select()
    .from(casesTable)
    .where(sql`${casesTable.id} = ${parsed.data.id}`)
    .limit(1);
  if (!row[0]) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  res.json({ ...serializeCase(row[0]), sourceText: row[0].sourceText });
});

router.post("/cases/process", async (req, res) => {
  const parsed = ProcessCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Document filename, content, and encoding are required" });
    return;
  }
  try {
    const document = parsed.data;
    const content = await decodeDocumentContent(
      document.filename,
      document.content,
      document.encoding,
    );
    const row = await createCase(document.filename, content);
    res.status(201).json(serializeCase(row));
  } catch (error) {
    req.log.error({ err: error }, "Failed to process document");
    res.status(500).json({ error: "Document processing failed" });
  }
});

router.post("/cases/batch", async (req, res) => {
  const parsed = ProcessBatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "At least one document is required" });
    return;
  }
  try {
    const rows = await Promise.all(
      parsed.data.documents.map(async (document) => {
        const content = await decodeDocumentContent(
          document.filename,
          document.content,
          document.encoding,
        );
        return createCase(document.filename, content);
      }),
    );
    res.status(201).json(rows.map(serializeCase));
  } catch (error) {
    req.log.error({ err: error }, "Failed to process document batch");
    res.status(500).json({ error: "Batch processing failed" });
  }
});

export default router;