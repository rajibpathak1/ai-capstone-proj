import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  status: text("status").notNull(),
  sourceText: text("source_text").notNull(),
  sourcePreview: text("source_preview").notNull(),
  structuredData: jsonb("structured_data").notNull(),
  customerEmail: text("customer_email").notNull(),
  caseSummary: text("case_summary").notNull(),
  processingMs: integer("processing_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;