"""
skill_gap.py — AI-powered semantic skill gap computation.

Uses Gemini AI to semantically match resume skills to JD requirements,
eliminating wording mismatch false positives (e.g. "AWS" matching "cloud platforms").
"""
import logging
import os
from typing import Literal

from models import ResumeSkill, JDRequirement, SkillGap, SkillGapResult
from parser import normalize_skill_name

logger = logging.getLogger(__name__)

SEMANTIC_THRESHOLD_DEFAULT = float(os.getenv("SEMANTIC_THRESHOLD", "0.75"))
MatchMethod = Literal["exact", "alias", "semantic", "none"]


def find_best_jd_match(
    resume_skill_name: str,
    jd_requirements: list[JDRequirement],
    threshold: float = SEMANTIC_THRESHOLD_DEFAULT,
) -> tuple[JDRequirement | None, float, MatchMethod]:
    """
    Three-stage matching — fast stages first, semantic as final gate.
    Stage 1: Exact / alias (normalize_skill_name)
    Stage 2: Substring containment
    Stage 3: Word-overlap (≥50%)
    """
    normalized = normalize_skill_name(resume_skill_name)

    # Stage 1: exact/alias
    for req in jd_requirements:
        if normalize_skill_name(req.name) == normalized:
            return req, 1.0, "exact"

    # Stage 2: substring
    for req in jd_requirements:
        req_norm = normalize_skill_name(req.name)
        if normalized in req_norm or req_norm in normalized:
            return req, 0.85, "alias"

    # Stage 3: word overlap ≥50%
    norm_words = set(normalized.split())
    for req in jd_requirements:
        req_words = set(normalize_skill_name(req.name).split())
        if norm_words & req_words:
            overlap = len(norm_words & req_words) / max(len(norm_words), len(req_words))
            if overlap >= 0.5:
                return req, overlap, "alias"

    return None, 0.0, "none"


def _ai_semantic_match(
    resume_skills: list[ResumeSkill],
    jd_requirements: list[JDRequirement],
) -> dict[str, str]:
    """
    Use AI to semantically match JD requirements to resume skills.
    Returns a dict: {jd_req_name -> resume_skill_name or "NONE"}

    This catches wording mismatches like:
      JD: "cloud platforms"  →  Resume: "AWS (EC2, S3, Lambda)"
      JD: "end-to-end ML"    →  Resume: "ML pipelines, TensorFlow"
      JD: "NLP analysis"     →  Resume: "natural language processing, LLM"
    """
    from ai_client import call_gemini_json

    resume_list = [f"{rs.name} (level {rs.proficiency_level}/10)" for rs in resume_skills]
    jd_list = [req.name for req in jd_requirements]

    system = (
        "You are an expert technical recruiter. Semantically match job requirements to resume skills. "
        "Look for MEANING, not exact wording. 'Cloud platforms' matches 'AWS', 'Azure', 'GCP'. "
        "'End-to-end ML pipelines' matches 'machine learning', 'TensorFlow', 'ML projects'. "
        "'NLP' matches 'natural language processing', 'LLM', 'text analysis'. "
        "Return ONLY a valid JSON object mapping each JD requirement to the best matching resume skill name, "
        "or 'NONE' if truly no match exists. No markdown."
    )
    user = (
        f"Resume skills: {resume_list}\n\n"
        f"JD requirements to match: {jd_list}\n\n"
        "Return JSON object: {\"jd_requirement_name\": \"matched_resume_skill_name_or_NONE\"}"
    )

    try:
        result = call_gemini_json(system, user, max_tokens=1500)
        if isinstance(result, dict):
            return result
    except Exception as e:
        logger.warning(f"AI semantic match failed, falling back to keyword: {e}")

    return {}


def compute_skill_gap(
    resume_skills: list[ResumeSkill],
    jd_requirements: list[JDRequirement],
    target_role: str,
    candidate_name: str | None = None,
    semantic_threshold: float = SEMANTIC_THRESHOLD_DEFAULT,
) -> SkillGapResult:

    known_skills: list[ResumeSkill] = []
    gap_skills:   list[SkillGap]    = []

    # Run AI semantic matching once for all requirements
    ai_matches = {}
    if resume_skills and jd_requirements:
        ai_matches = _ai_semantic_match(resume_skills, jd_requirements)
        logger.info(f"AI semantic matches: {len(ai_matches)} mappings returned")

    # Build lookup maps
    resume_map = {normalize_skill_name(rs.name): rs for rs in resume_skills}

    for req in jd_requirements:
        req_norm = normalize_skill_name(req.name)
        candidate_level = 0
        matched_resume_skill: ResumeSkill | None = None

        # ── Step 1: Try keyword stages first ──
        for rs in resume_skills:
            rs_norm = normalize_skill_name(rs.name)
            # exact / alias / substring / word-overlap
            if (rs_norm == req_norm
                    or req_norm in rs_norm
                    or rs_norm in req_norm
                    or (set(rs_norm.split()) & set(req_norm.split())
                        and len(set(rs_norm.split()) & set(req_norm.split())) /
                            max(len(set(rs_norm.split())), len(set(req_norm.split()))) >= 0.5)):
                candidate_level = rs.proficiency_level
                matched_resume_skill = rs
                break

        # ── Step 2: Try AI semantic match if keyword failed ──
        if candidate_level == 0 and req.name in ai_matches:
            ai_matched_name = ai_matches[req.name]
            if ai_matched_name and ai_matched_name != "NONE":
                ai_norm = normalize_skill_name(ai_matched_name)
                # Find the resume skill by AI-matched name
                matched = resume_map.get(ai_norm)
                if not matched:
                    # Try partial match on AI suggestion
                    for rs in resume_skills:
                        if ai_norm in normalize_skill_name(rs.name) or normalize_skill_name(rs.name) in ai_norm:
                            matched = rs
                            break
                if matched:
                    candidate_level = matched.proficiency_level
                    matched_resume_skill = matched
                    logger.info(f"AI matched '{req.name}' → '{matched.name}' (level {candidate_level})")

        # ── Step 3: Classify as known or gap ──
        if candidate_level >= req.required_level:
            if matched_resume_skill and not any(
                normalize_skill_name(k.name) == normalize_skill_name(matched_resume_skill.name)
                for k in known_skills
            ):
                known_skills.append(matched_resume_skill)
        else:
            gap_score = req.required_level - candidate_level

            # Priority classification
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

    # Add resume skills not mentioned in JD as bonus known skills
    jd_all_norms = {normalize_skill_name(r.name) for r in jd_requirements}
    for rs in resume_skills:
        rs_norm = normalize_skill_name(rs.name)
        already = any(normalize_skill_name(k.name) == rs_norm for k in known_skills)
        if not already and rs_norm not in jd_all_norms:
            known_skills.append(rs)

    # ── Weighted match percentage (mandatory skills count 2×) ──
    if not jd_requirements:
        overall_match = 0.0
    else:
        total_weight   = sum(2 if r.is_mandatory else 1 for r in jd_requirements)
        matched_weight = 0.0
        for req in jd_requirements:
            req_norm = normalize_skill_name(req.name)
            c_level  = 0
            for rs in resume_skills:
                rs_norm = normalize_skill_name(rs.name)
                if (rs_norm == req_norm or req_norm in rs_norm or rs_norm in req_norm):
                    c_level = rs.proficiency_level
                    break
            # Also check AI match
            if c_level == 0 and req.name in ai_matches:
                ai_n = ai_matches[req.name]
                if ai_n and ai_n != "NONE":
                    matched = resume_map.get(normalize_skill_name(ai_n))
                    if matched:
                        c_level = matched.proficiency_level
            match_pct = min(100, (c_level / req.required_level) * 100) if req.required_level else 100
            weight = 2 if req.is_mandatory else 1
            matched_weight += (match_pct / 100) * weight

        overall_match = round((matched_weight / total_weight) * 100, 1) if total_weight else 0.0

    score_gate = "mock_interview" if overall_match >= 90 else "feedback"

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
