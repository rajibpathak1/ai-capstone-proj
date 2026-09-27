"""Batch runner: data/ -> structured outputs, emails, summaries, and CSV report."""

import csv
import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from .extractors import extract_text
from .llm import process_document

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"
SUPPORTED = {".txt", ".pdf", ".docx"}

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("caseflow")


def process_file(path: Path) -> dict:
    text = extract_text(path)
    outputs = process_document(text)
    structured = outputs.structured_data.model_dump()
    (OUTPUT_DIR / "structured_data").mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "customer_emails").mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "case_summaries").mkdir(parents=True, exist_ok=True)
    stem = path.stem
    (OUTPUT_DIR / "structured_data" / f"{stem}.json").write_text(
        json.dumps(structured, indent=2), encoding="utf-8"
    )
    (OUTPUT_DIR / "customer_emails" / f"{stem}.txt").write_text(
        outputs.customer_email, encoding="utf-8"
    )
    (OUTPUT_DIR / "case_summaries" / f"{stem}.txt").write_text(
        outputs.case_summary, encoding="utf-8"
    )
    return {
        "filename": path.name,
        "customer_name": structured["customer_name"] or "",
        "category": structured["complaint_category"],
        "status": structured["overall_case_status"],
        "escalation_required": structured["escalation_required"],
    }


def main() -> None:
    files = [path for path in DATA_DIR.iterdir() if path.suffix.lower() in SUPPORTED]
    report = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(process_file, path): path for path in files}
        for job in as_completed(jobs):
            path = jobs[job]
            try:
                report.append(job.result())
                logger.info("Processed %s", path.name)
            except Exception:
                logger.exception("Failed to process %s", path.name)

    with (OUTPUT_DIR / "final_report.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["filename", "customer_name", "category", "status", "escalation_required"],
        )
        writer.writeheader()
        writer.writerows(sorted(report, key=lambda row: row["filename"]))


if __name__ == "__main__":
    main()