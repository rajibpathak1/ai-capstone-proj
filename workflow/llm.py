"""Three-step LLM orchestration for a single complaint document."""

import os
from openai import OpenAI
from .models import GeneratedOutputs, StructuredCase


def _client() -> OpenAI:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY is required for live processing")
    return OpenAI(api_key=key)


def extract_case(text: str) -> StructuredCase:
    response = _client().chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract a customer complaint into the provided schema. "
                    "Never invent facts; use null for missing contact fields."
                ),
            },
            {"role": "user", "content": text},
        ],
        response_format=StructuredCase,
    )
    parsed = response.choices[0].message.parsed
    if not parsed:
        raise ValueError("The model returned no structured case")
    return parsed


def generate_email(case: StructuredCase) -> str:
    response = _client().chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Write a professional customer email using only the facts supplied. Return only the email body.",
            },
            {"role": "user", "content": case.model_dump_json()},
        ],
    )
    return response.choices[0].message.content or ""


def generate_summary(case: StructuredCase) -> str:
    response = _client().chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Write a concise internal case summary with five labeled lines: Case overview, Key issue, Action taken, Current status, Recommended next action.",
            },
            {"role": "user", "content": case.model_dump_json()},
        ],
    )
    return response.choices[0].message.content or ""


def process_document(text: str) -> GeneratedOutputs:
    structured = extract_case(text)
    return GeneratedOutputs(
        structured_data=structured,
        customer_email=generate_email(structured),
        case_summary=generate_summary(structured),
    )