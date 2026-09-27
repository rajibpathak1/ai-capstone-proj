import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcd /d/caseflow-ai
cat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcd /d/caseflow-ai
cat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcd /d/caseflow-ai
cat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcd /d/caseflow-ai
cat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
EOFcat > test-pdf.mjs <<'EOF'
import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buffer = fs.readFileSync("./data/wifi_issue_pdf.pdf");

console.log("PDFParse type:", typeof PDFParse);

const parser = new PDFParse({ data: buffer });

try {
  const result = await parser.getText();

  console.log("PDF TEXT:");
  console.log(result.text);
} finally {
  await parser.destroy();
}
