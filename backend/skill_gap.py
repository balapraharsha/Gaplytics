"""
skill_gap.py — Weighted gap computation with exact + alias matching only.
Semantic matching (sentence-transformers) disabled for fast startup.
"""
import logging
import os
from typing import Literal

from models import ResumeSkill, JDRequirement, SkillGap, SkillGapResult
from parser import normalize_skill_name

logger = logging.getLogger(__name__)

SEMANTIC_THRESHOLD_DEFAULT = float(os.getenv("SEMANTIC_THRESHOLD", "0.75"))

MatchMethod = Literal["exact", "alias", "semantic", "none"]


def get_embedding_model():
    """Semantic matching disabled — returns None immediately."""
    return None


def semantic_skill_match(skill_a: str, skill_b: str) -> float:
    return 0.0


def find_best_jd_match(
    resume_skill_name: str,
    jd_requirements: list[JDRequirement],
    threshold: float = SEMANTIC_THRESHOLD_DEFAULT,
) -> tuple[JDRequirement | None, float, MatchMethod]:
    """
    Two-stage matching:
    Stage 1 — Exact/alias match via normalize_skill_name()
    Stage 2 — Fuzzy substring match (no model download needed)
    """
    normalized = normalize_skill_name(resume_skill_name)

    # Stage 1: exact/alias match
    for req in jd_requirements:
        if normalize_skill_name(req.name) == normalized:
            return req, 1.0, "exact"

    # Stage 2: substring match (catches "python 3" vs "python", "react.js" vs "react")
    for req in jd_requirements:
        req_norm = normalize_skill_name(req.name)
        if normalized in req_norm or req_norm in normalized:
            return req, 0.85, "alias"

    # Stage 3: word overlap match (catches "machine learning" vs "ml engineering")
    norm_words = set(normalized.split())
    for req in jd_requirements:
        req_words = set(normalize_skill_name(req.name).split())
        if norm_words & req_words:  # any word overlap
            overlap = len(norm_words & req_words) / max(len(norm_words), len(req_words))
            if overlap >= 0.5:
                return req, overlap, "alias"

    return None, 0.0, "none"


def compute_skill_gap(
    resume_skills: list[ResumeSkill],
    jd_requirements: list[JDRequirement],
    target_role: str,
    candidate_name: str | None = None,
    semantic_threshold: float = SEMANTIC_THRESHOLD_DEFAULT,
) -> SkillGapResult:

    known_skills = []
    gap_skills   = []

    for req in jd_requirements:
        best_match, score, method = find_best_jd_match(
            req.name, resume_skills if hasattr(resume_skills[0], 'name') else [],
            threshold=semantic_threshold,
        ) if resume_skills else (None, 0.0, "none")

        # Find candidate's level for this requirement
        candidate_level = 0
        matched_resume_skill = None
        req_norm = normalize_skill_name(req.name)

        for rs in resume_skills:
            rs_norm = normalize_skill_name(rs.name)
            if rs_norm == req_norm or req_norm in rs_norm or rs_norm in req_norm:
                candidate_level = rs.proficiency_level
                matched_resume_skill = rs
                break
            # word overlap
            if set(rs_norm.split()) & set(req_norm.split()):
                candidate_level = rs.proficiency_level
                matched_resume_skill = rs

        if candidate_level >= req.required_level:
            # Candidate meets requirement
            if matched_resume_skill:
                known_skills.append(matched_resume_skill)
        else:
            gap_score = req.required_level - candidate_level
            if req.is_mandatory and gap_score >= 5:
                priority = "critical"
            elif gap_score >= 3:
                priority = "high"
            elif gap_score >= 1:
                priority = "medium"
            else:
                priority = "low"

            gap_skills.append(SkillGap(
                skill_name=req.name,
                candidate_level=candidate_level,
                required_level=req.required_level,
                gap_score=gap_score,
                priority=priority,
                is_mandatory=req.is_mandatory,
                job_market_relevance_pct=req.job_market_relevance_pct,
            ))

    # Also add resume skills not in JD as known skills
    jd_names = {normalize_skill_name(r.name) for r in jd_requirements}
    for rs in resume_skills:
        rs_norm = normalize_skill_name(rs.name)
        already_added = any(normalize_skill_name(k.name) == rs_norm for k in known_skills)
        if not already_added and rs_norm not in jd_names:
            known_skills.append(rs)

    # Compute weighted match percentage
    if not jd_requirements:
        overall_match = 0.0
    else:
        total_weight  = sum(2 if r.is_mandatory else 1 for r in jd_requirements)
        matched_weight = 0.0
        for req in jd_requirements:
            candidate_level = 0
            req_norm = normalize_skill_name(req.name)
            for rs in resume_skills:
                if normalize_skill_name(rs.name) == req_norm or req_norm in normalize_skill_name(rs.name):
                    candidate_level = rs.proficiency_level
                    break
            match_pct = min(100, (candidate_level / req.required_level) * 100) if req.required_level else 100
            weight = 2 if req.is_mandatory else 1
            matched_weight += (match_pct / 100) * weight

        overall_match = round((matched_weight / total_weight) * 100, 1) if total_weight else 0.0

    score_gate = "mock_interview" if overall_match >= 90 else "feedback"

    # Top 3 rejection reasons
    critical_gaps = [g for g in gap_skills if g.priority in ("critical", "high")]
    rejection_reasons = [
        f"Missing {g.skill_name} — required in {g.job_market_relevance_pct}% of {target_role} roles"
        for g in critical_gaps[:3]
    ]

    return SkillGapResult(
        candidate_name=candidate_name,
        target_role=target_role,
        known_skills=known_skills,
        gap_skills=sorted(gap_skills, key=lambda g: ("critical","high","medium","low").index(g.priority)),
        overall_match_percentage=overall_match,
        score_gate=score_gate,
        rejection_reasons=rejection_reasons,
    )
