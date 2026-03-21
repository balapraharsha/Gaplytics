from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime
import uuid


class ResumeSkill(BaseModel):
    name: str = Field(description="Skill name")
    category: str = Field(description="Category: programming_language, framework, tool, soft_skill, domain_knowledge, operational, administrative")
    proficiency_level: int = Field(ge=1, le=10, description="Proficiency level 1-10")
    years_experience: float = Field(default=0.0, description="Years of experience")
    evidence: str = Field(default="", description="Evidence from resume")


class JDRequirement(BaseModel):
    name: str = Field(description="Skill name")
    category: str = Field(description="Category")
    required_level: int = Field(ge=1, le=10, description="Required proficiency 1-10")
    is_mandatory: bool = Field(default=True, description="Is this skill mandatory")
    context: str = Field(default="", description="Context from JD")
    job_market_relevance_pct: int = Field(default=50, description="% of similar jobs needing this skill")


class SkillGap(BaseModel):
    skill_name: str
    candidate_level: int = Field(ge=0, le=10)
    required_level: int = Field(ge=1, le=10)
    gap_score: int
    priority: Literal["critical", "high", "medium", "low"]
    is_mandatory: bool
    job_market_relevance_pct: int = Field(default=50)


class SkillGapResult(BaseModel):
    candidate_name: Optional[str] = None
    target_role: str
    known_skills: list[ResumeSkill]
    gap_skills: list[SkillGap]
    overall_match_percentage: float
    score_gate: Literal["mock_interview", "feedback"]
    rejection_reasons: list[str]


class ResourceLink(BaseModel):
    title: str
    url: str
    type: Literal["video", "article", "course", "docs"]


class CourseModule(BaseModel):
    id: str
    title: str
    skill_name: str
    category: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    duration_hours: float
    prerequisites: list[str] = Field(default_factory=list)
    learning_objectives: list[str] = Field(default_factory=list)
    resources: list[ResourceLink] = Field(default_factory=list)
    description: str
    job_market_relevance: str
    unlocks: list[str] = Field(default_factory=list)


class DayPlan(BaseModel):
    day_number: int
    date: date
    day_type: Literal["study", "review", "rest", "final_review", "mock_test"]
    module_ids: list[str] = Field(default_factory=list)
    estimated_hours: float = 0.0
    is_today: bool = False
    focus_label: str = ""


class DailySchedule(BaseModel):
    days: list[DayPlan]
    total_days: int
    daily_hours: float
    warning: Optional[str] = None
    deadline_date: date
    today: date
    total_content_hours: float


class LearningNode(BaseModel):
    module_id: str
    order_index: int
    is_on_critical_path: bool = False
    unlock_condition: str = ""
    status: Literal["locked", "available", "completed"] = "locked"


class WeekPlan(BaseModel):
    week_number: int
    module_ids: list[str]
    focus_skill: str
    estimated_hours: float


class ReasoningStep(BaseModel):
    step_type: Literal["detection", "gap", "decision", "chain"]
    skill_name: str
    detected_level: Optional[int] = None
    required_level: Optional[int] = None
    gap_score: Optional[int] = None
    priority: Optional[str] = None
    action_taken: str
    module_assigned: Optional[str] = None
    match_method: Optional[str] = None  # "exact" | "alias" | "semantic" | None
    match_method: Optional[Literal["exact", "alias", "semantic", "none"]] = None
    semantic_score: Optional[float] = None


class LearningPathway(BaseModel):
    nodes: list[LearningNode]
    daily_schedule: DailySchedule
    weekly_summary: list[WeekPlan]
    compounding_map: dict[str, list[str]]
    reasoning_trace: list[ReasoningStep]
    total_hours: float
    critical_path_module_ids: list[str]


class AnalysisResult(BaseModel):
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    gap_result: SkillGapResult
    pathway: LearningPathway
    modules_detail: list[CourseModule]
    created_at: datetime = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    message: str
    analysis_context: AnalysisResult


class ChatResponse(BaseModel):
    response: str


class InterviewQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_type: Literal[
        "scenario_decision", "debug_the_code", "fix_the_code",
        "code_review", "log_detective", "complexity_analysis"
    ]
    question_text: str
    code_snippet: Optional[str] = None
    expected_skill: str
    time_limit_seconds: int = 300


class InterviewAnswer(BaseModel):
    question_id: str
    answer_text: str
    time_taken_seconds: int
    was_skipped: bool = False
    was_timeout: bool = False


class InterviewSession(BaseModel):
    questions: list[InterviewQuestion]
    answers: list[InterviewAnswer]
    candidate_context: SkillGapResult


class DimensionScore(BaseModel):
    dimension: Literal[
        "decision_making", "debugging_ability", "code_correctness",
        "code_quality", "incident_diagnosis", "algorithmic_thinking",
        "communication_clarity", "adaptability_under_pressure", "technical_depth"
    ]
    score: float = Field(ge=0, le=10)
    feedback: str
    is_strength: bool


class InterviewEvaluation(BaseModel):
    dimension_scores: list[DimensionScore]
    overall_score: float
    verdict: Literal["HIRE_READY", "STRONG_CANDIDATE", "NEEDS_MORE_PREP"]
    hire_ready: bool
    per_question_feedback: list[dict]
    evaluated_at: datetime = Field(default_factory=datetime.now)


class CandidateSummary(BaseModel):
    candidate_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    match_pct: float
    top_gaps: list[str]
    status: Literal["not_started", "in_progress", "on_track", "behind", "complete"] = "not_started"
    progress_pct: float = 0.0
    predicted_days_to_competency: int
    analysis_id: str


class HRRole(BaseModel):
    role_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role_title: str
    required_skills: list[JDRequirement]
    company_deadline: date
    daily_hours: float = 2.0
    candidates: list[CandidateSummary] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)


class ComparisonResult(BaseModel):
    candidate_a: CandidateSummary
    candidate_b: CandidateSummary
    ai_verdict: str
    skill_comparison_table: list[dict]
