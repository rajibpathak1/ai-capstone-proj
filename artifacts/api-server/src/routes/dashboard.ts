import { desc, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, casesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const rows = await db
    .select({
      status: casesTable.status,
      category: sql<string>`${casesTable.structuredData}->>'complaintCategory'`,
      processingMs: casesTable.processingMs,
      createdAt: casesTable.createdAt,
      escalation: sql<boolean>`(${casesTable.structuredData}->>'escalationRequired')::boolean`,
    })
    .from(casesTable)
    .orderBy(desc(casesTable.createdAt));

  const today = new Date();
  const statusCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let escalations = 0;
  let processedToday = 0;
  let processingTotal = 0;

  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1;
    processingTotal += row.processingMs;
    if (row.escalation) escalations += 1;
    if (row.createdAt.toDateString() === today.toDateString()) processedToday += 1;
  }

  res.json({
    totalCases: rows.length,
    processedToday,
    escalations,
    avgProcessingMs: rows.length ? Math.round(processingTotal / rows.length) : 0,
    statusCounts,
    categoryCounts,
  });
});

export default router;