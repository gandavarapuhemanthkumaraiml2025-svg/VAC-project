"""
Sources, dataset, and evaluation API routers.
"""
import json
import logging
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import pandas as pd

from app.database.db import get_db
from app.models.source import Source, Rule
from app.schemas.schemas import SourceResponse, DatasetSummaryResponse

logger = logging.getLogger(__name__)

sources_router = APIRouter(prefix="/api/sources", tags=["sources"])
dataset_router = APIRouter(prefix="/api/dataset", tags=["dataset"])
evaluation_router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

DATA_CSV = Path(__file__).parent.parent.parent.parent / "data" / "plant_watering_dataset.csv"


@sources_router.get("", response_model=List[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    """Return all horticultural and weather sources."""
    return db.query(Source).order_by(Source.source_type, Source.id).all()


@sources_router.get("/rules")
def list_rules(db: Session = Depends(get_db)):
    """Return all advisory rules with metadata."""
    rules = db.query(Rule).filter(Rule.is_active == True).order_by(Rule.priority, Rule.id).all()
    return [
        {
            "id": r.id,
            "version": r.version,
            "plant_scope": r.plant_scope,
            "condition_description": r.condition_description,
            "decision_effect": r.decision_effect,
            "priority": r.priority,
            "explanation_template": r.explanation_template,
            "source_ids": r.source_ids,
            "limitations": r.limitations,
        }
        for r in rules
    ]


@dataset_router.get("/summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    """Return genuine data-quality and exploration statistics from the CSV dataset."""
    if not DATA_CSV.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found. Run data preparation first.")

    try:
        df = pd.read_csv(DATA_CSV)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")

    # Missing values
    missing_counts = df.isnull().sum().to_dict()
    missing_counts = {k: int(v) for k, v in missing_counts.items()}

    # Duplicate count
    dup_count = int(df.duplicated().sum())

    # Distributions
    plant_dist = df["plant_type"].value_counts().to_dict() if "plant_type" in df.columns else {}
    label_dist = df["advisory_label"].value_counts().to_dict() if "advisory_label" in df.columns else {}
    origin_dist = df["data_origin"].value_counts().to_dict() if "data_origin" in df.columns else {}
    quality_dist = df["quality_flag"].value_counts().to_dict() if "quality_flag" in df.columns else {}

    # Numerical stats
    num_cols = df.select_dtypes(include=["float64", "int64"]).columns.tolist()
    numerical_stats = {}
    for col in num_cols:
        s = df[col].dropna()
        if len(s) > 0:
            numerical_stats[col] = {
                "count": float(s.count()),
                "mean": float(s.mean()),
                "std": float(s.std()) if len(s) > 1 else 0.0,
                "min": float(s.min()),
                "max": float(s.max()),
                "median": float(s.median()),
            }

    return DatasetSummaryResponse(
        total_records=len(df),
        column_count=len(df.columns),
        columns=df.columns.tolist(),
        plant_distribution={str(k): int(v) for k, v in plant_dist.items()},
        advisory_label_distribution={str(k): int(v) for k, v in label_dist.items()},
        missing_value_counts=missing_counts,
        duplicate_count=dup_count,
        data_origin_distribution={str(k): int(v) for k, v in origin_dist.items()},
        numerical_stats=numerical_stats,
        quality_flag_distribution={str(k): int(v) for k, v in quality_dist.items()},
        data_note="Dataset contains synthetic examples generated to validate the rule engine. "
                  "Labels were assigned by the deterministic advisory engine. "
                  "This dataset validates software behaviour, not real-world horticultural accuracy.",
    )


@evaluation_router.get("")
def get_evaluation():
    """Return rule-based evaluation results."""
    eval_path = Path(__file__).parent.parent.parent.parent / "docs" / "edge_case_test_report.md"
    return {
        "ml_status": "not_enabled",
        "ml_reason": (
            "The current dataset consists of synthetic examples labelled by the rule engine. "
            "Training a classifier on these labels would produce a model that imitates the rules, "
            "not one that captures real-world horticultural knowledge. "
            "ML will be enabled when sufficient independently labelled observational data is available."
        ),
        "rule_engine_status": "active",
        "rule_count": 14,
        "plant_profiles": 3,
        "test_report_available": eval_path.exists(),
        "methodology": "Deterministic rule-based advisory engine. Decisions are reproducible for identical inputs.",
    }
