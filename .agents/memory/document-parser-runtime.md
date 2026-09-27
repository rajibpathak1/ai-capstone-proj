---
name: Document parser runtime
description: PDF parsing dependencies can initialize browser-only canvas globals during Node startup.
---

Lazy-load PDF parsing libraries inside the upload path rather than importing them at server module scope. Some current PDF parser builds initialize DOMMatrix and related canvas globals eagerly, which can crash an otherwise healthy Express process before it starts listening.

**Why:** The API server must remain available for text-only cases and dashboard reads even when no PDF is being processed.

**How to apply:** Keep PDF/DOCX parsing imports inside the format-specific branch of the document decoding function, and verify the server starts before testing binary uploads.