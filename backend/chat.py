import logging
from models import AnalysisResult
logger = logging.getLogger(__name__)

def generate_chat_response(message, analysis_context):
    gap = analysis_context.gap_result
    critical = [g.skill_name for g in gap.gap_skills if g.priority == "critical"]
    high     = [g.skill_name for g in gap.gap_skills if g.priority == "high"]
    fallback = f"Focus on: {', '.join(critical[:3]) if critical else 'your top gaps'}. Consistent study compounds quickly!"
    system = (
        f"You are Gaplytics AI Coach. Candidate: {gap.candidate_name or 'candidate'}. "
        f"Role: {gap.target_role}. Match: {gap.overall_match_percentage}%. "
        f"Critical gaps: {critical or 'None'}. High gaps: {high or 'None'}. "
        f"Max 3 sentences. No bullet points. Be encouraging and specific."
    )
    try:
        from ai_client import call_gemini
        return call_gemini(system, message, max_tokens=300)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return fallback
