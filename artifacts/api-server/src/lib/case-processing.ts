import OpenAI from "openai";
import { logger } from "./logger";

export type StructuredData = {
  customerName: string | null;
  email: string | null;
  phoneNumber: string | null;
  complaintCategory: string;
  issueDescription: string;
  resolutionProvided: string;
  complaint: boolean;
  escalationRequired: boolean;
  supportingDocumentAvailable: boolean;
  overallCaseStatus: string;
};

export type ProcessedOutputs = {
  structuredData: StructuredData;
  customerEmail: string;
  caseSummary: string;
};

export async function decodeDocumentContent(
  filename: string,
  content: string,
  encoding: "text" | "base64",
): Promise<string> {
  if (encoding === "text") return content;

  const buffer = Buffer.from(content, "base64");
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  return buffer.toString("utf8");
}
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function parseJson<T>(value: string): T {
  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

async function askModel(system: string, prompt: string): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 1400,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

function fallbackStructuredData(sourceText: string): StructuredData {
  const email = sourceText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i)?.[0] ?? null;
  const phone =
    sourceText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? null;
  const customerName =
    sourceText.match(/(?:customer|name)\s*:\s*([^\n]+)/i)?.[1]?.trim() ?? null;
  const lower = sourceText.toLowerCase();
  const escalationRequired = /escalat|urgent|legal|manager/i.test(sourceText);
  const complaint = /complaint|refund|broken|issue|problem|delay|charged/i.test(
    sourceText,
  );

  return {
    customerName,
    email,
    phoneNumber: phone,
    complaintCategory: /billing|charge|invoice|payment/i.test(lower)
      ? "Billing"
      : /delivery|shipping|late/i.test(lower)
        ? "Delivery"
        : /account|login|password/i.test(lower)
          ? "Account access"
          : "Product experience",
    issueDescription:
      sourceText.match(/(?:issue|problem|description)\s*:\s*([^\n]+)/i)?.[1]?.trim() ??
      "Issue details were identified in the source document.",
    resolutionProvided:
      sourceText.match(/(?:resolution|resolved|action)\s*:\s*([^\n]+)/i)?.[1]?.trim() ??
      "No resolution was recorded in the source document.",
    complaint,
    escalationRequired,
    supportingDocumentAvailable: /attachment|attached|supporting document/i.test(
      sourceText,
    ),
    overallCaseStatus: escalationRequired
      ? "Escalation required"
      : /resolved|refund issued|completed/i.test(lower)
        ? "Resolved"
        : "In review",
  };
}

function fallbackEmail(data: StructuredData): string {
  const greeting = data.customerName ? `Hi ${data.customerName},` : "Hello,";
  return `${greeting}\n\nThank you for contacting us. We’ve reviewed your message about ${data.issueDescription.toLowerCase()}.\n\n${data.resolutionProvided} Our team has marked this case as ${data.overallCaseStatus.toLowerCase()} and will follow up with any next steps noted in your request.\n\nBest regards,\nCustomer Care Team`;
}

function fallbackSummary(data: StructuredData): string {
  return `Case overview: ${data.customerName ?? "Customer"} reported a ${data.complaintCategory.toLowerCase()} concern.\n\nKey issue: ${data.issueDescription}\n\nAction taken: ${data.resolutionProvided}\n\nCurrent status: ${data.overallCaseStatus}\n\nRecommended next action: ${data.escalationRequired ? "Route to the escalation queue and confirm ownership." : "Monitor for customer confirmation and close when acknowledged."}`;
}

export async function processDocument(sourceText: string): Promise<ProcessedOutputs> {
  try {
    const structuredRaw = await askModel(
      "You extract customer complaint documents into accurate JSON. Never invent details. Use null when a field is not present. Return only valid JSON with exactly these keys: customerName, email, phoneNumber, complaintCategory, issueDescription, resolutionProvided, complaint, escalationRequired, supportingDocumentAvailable, overallCaseStatus.",
      `Extract this document:\n\n${sourceText}`,
    );
    const structuredData = parseJson<StructuredData>(structuredRaw);
    const [customerEmail, caseSummary] = await Promise.all([
      askModel(
        "You write professional customer support emails. Use only the provided facts. Do not add promises, dates, policies, or details not in the case. Return only the email body.",
        `Draft a response for this extracted case:\n${JSON.stringify(structuredData)}`,
      ),
      askModel(
        "You write concise internal case summaries for support managers. Use only the provided facts. Return exactly five labeled lines: Case overview, Key issue, Action taken, Current status, Recommended next action.",
        `Summarize this extracted case:\n${JSON.stringify(structuredData)}`,
      ),
    ]);
    return { structuredData, customerEmail, caseSummary };
  } catch (error) {
    logger.warn({ err: error }, "AI processing unavailable; using deterministic extraction");
    const structuredData = fallbackStructuredData(sourceText);
    return {
      structuredData,
      customerEmail: fallbackEmail(structuredData),
      caseSummary: fallbackSummary(structuredData),
    };
  }
};