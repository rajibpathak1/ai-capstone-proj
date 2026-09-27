"""Structured outputs for the CaseFlow AI complaint workflow."""

from typing import Optional
from pydantic import BaseModel, Field


class StructuredCase(BaseModel):
    customer_name: Optional[str] = Field(default=None, description="Customer name from the source")
    email: Optional[str] = Field(default=None, description="Customer email from the source")
    phone_number: Optional[str] = Field(default=None, description="Customer phone from the source")
    complaint_category: str
    issue_description: str
    resolution_provided: str
    complaint: bool
    escalation_required: bool
    supporting_document_available: bool
    overall_case_status: str


class GeneratedOutputs(BaseModel):
    structured_data: StructuredCase
    customer_email: str
    case_summary: str