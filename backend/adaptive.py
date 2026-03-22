import math
import logging
from datetime import date, timedelta
from collections import defaultdict, deque
from models import (
    SkillGapResult, SkillGap, CourseModule, DayPlan, DailySchedule,
    LearningNode, LearningPathway, WeekPlan, ReasoningStep
)
from course_catalog import get_catalog
from parser import normalize_skill_name

logger = logging.getLogger(__name__)


def find_relevant_modules(gap_skills: list[SkillGap], catalog: list[CourseModule]) -> list[CourseModule]:
    """
    Find modules relevant to gap skills.
    Uses multi-stage matching: exact → word-overlap → AI semantic fallback.
    Ensures different candidates with different gaps get different roadmaps.
    """
    module_map: dict[str, CourseModule] = {m.id: m for m in catalog}
    relevant_ids: set[str] = set()

    # Build needed skills set — use actual gap skill names
    needed_normalized = {normalize_skill_name(g.skill_name) for g in gap_skills}
    needed_original   = [g.skill_name for g in gap_skills]

    # Stage 1: exact / alias match on skill_name
    for module in catalog:
        mod_norm = normalize_skill_name(module.skill_name)
        if mod_norm in needed_normalized:
            relevant_ids.add(module.id)

    # Stage 2: word-overlap match (catches "machine learning" ↔ "ml engineering")
    for module in catalog:
        if module.id in relevant_ids:
            continue
        mod_words = set(normalize_skill_name(module.skill_name).split())
        for ns in needed_normalized:
            ns_words = set(ns.split())
            if mod_words & ns_words:
                overlap = len(mod_words & ns_words) / max(len(mod_words), len(ns_words))
                if overlap >= 0.4:
                    relevant_ids.add(module.id)
                    break

    # Stage 3: title/description keyword match
    for module in catalog:
        if module.id in relevant_ids:
            continue
        mod_title = normalize_skill_name(module.title)
        for ns in needed_normalized:
            ns_words = [w for w in ns.split() if len(w) > 3]
            if any(w in mod_title for w in ns_words):
                relevant_ids.add(module.id)
                break

    # Stage 4: AI semantic fallback for remaining unmatched gaps
    unmatched_gaps = []
    for gap in gap_skills:
        gn = normalize_skill_name(gap.skill_name)
        matched = any(
            normalize_skill_name(catalog[i].skill_name) == gn or
            gn in normalize_skill_name(catalog[i].title)
            for i, mid in enumerate(relevant_ids)
            if i < len(catalog)
        )
        if not matched:
            unmatched_gaps.append(gap.skill_name)

    if unmatched_gaps:
        try:
            from ai_client import call_gemini_json
            catalog_summary = [{"id": m.id, "skill": m.skill_name, "title": m.title} for m in catalog]
            system = (
                "Match each skill gap to the most relevant course module IDs from the catalog. "
                "Return ONLY a valid JSON object mapping skill names to lists of module IDs. "
                "Match semantically — cloud platforms should match aws, gcp, azure modules. "
                "Return at most 3 module IDs per skill. No markdown. No code fences."
            )
            user = (
                "Skills to match: " + str(unmatched_gaps) + "\n\n"
                "Catalog: " + str(catalog_summary)
            )
            result = call_gemini_json(system, user, max_tokens=2000)
            if isinstance(result, dict):
                valid_ids = {m.id for m in catalog}
                for skill, mids in result.items():
                    if isinstance(mids, list):
                        for mid in mids:
                            if mid in valid_ids:
                                relevant_ids.add(mid)
        except Exception as e:
            logger.warning(f"AI module matching failed: {e}")

    # Expand with prerequisites recursively
    def add_prerequisites(module_id: str, visited: set[str]):
        if module_id in visited:
            return
        visited.add(module_id)
        module = module_map.get(module_id)
        if not module:
            return
        for prereq_id in module.prerequisites:
            relevant_ids.add(prereq_id)
            add_prerequisites(prereq_id, visited)

    for mid in set(relevant_ids):
        add_prerequisites(mid, set())

    return [module_map[mid] for mid in relevant_ids if mid in module_map]


def build_prerequisite_graph(modules: list[CourseModule]) -> dict[str, list[str]]:
    """Build adjacency list { module_id: [list of prerequisite module_ids that are in our set] }."""
    module_ids = {m.id for m in modules}
    graph: dict[str, list[str]] = {m.id: [] for m in modules}
    for module in modules:
        for prereq_id in module.prerequisites:
            if prereq_id in module_ids:
                graph[module.id].append(prereq_id)
    return graph


def topological_sort(modules: list[CourseModule], graph: dict[str, list[str]]) -> list[str]:
    """Kahn's algorithm BFS-based topological sort. Returns ordered list of module_ids."""
    in_degree: dict[str, int] = {m.id: 0 for m in modules}
    
    # Build reverse adjacency (who depends on me)
    dependents: dict[str, list[str]] = defaultdict(list)
    for node, prereqs in graph.items():
        for prereq in prereqs:
            in_degree[node] += 1
            dependents[prereq].append(node)
    
    queue = deque([mid for mid, deg in in_degree.items() if deg == 0])
    sorted_order = []
    
    while queue:
        node = queue.popleft()
        sorted_order.append(node)
        for dependent in dependents[node]:
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)
    
    if len(sorted_order) < len(modules):
        logger.warning("Cycle detected in prerequisite graph — returning partial sort")
    
    return sorted_order


def schedule_daily_roadmap(
    modules: list[CourseModule],
    sorted_module_ids: list[str],
    deadline_date: date,
    daily_hours: float = 2.0,
) -> DailySchedule:
    today = date.today()
    total_days = (deadline_date - today).days
    
    if total_days <= 0:
        raise ValueError("Deadline must be a future date")
    
    # Build module map
    module_map = {m.id: m for m in modules}
    sorted_modules = [module_map[mid] for mid in sorted_module_ids if mid in module_map]
    
    if not sorted_modules:
        sorted_modules = modules
    
    total_content_hours = sum(m.duration_hours for m in sorted_modules)
    
    # First day gets the lightest module (ease-in)
    if len(sorted_modules) > 1:
        lightest = min(sorted_modules, key=lambda m: m.duration_hours)
        rest = [m for m in sorted_modules if m.id != lightest.id]
        ordered_modules = [lightest] + rest
    else:
        ordered_modules = sorted_modules
    
    required_daily = total_content_hours / total_days if total_days > 0 else total_content_hours
    warning = None
    
    if required_daily > daily_hours:
        daily_hours = math.ceil(required_daily * 1.1 * 2) / 2  # round to 0.5
        warning = f"Tight deadline! Adjusted daily study to {daily_hours} hrs/day to finish on time."
    
    # Pack modules into days
    day_plans: list[DayPlan] = []
    current_day_num = 1
    current_date = today
    current_day_hours = 0.0
    current_day_modules: list[str] = []
    
    for module in ordered_modules:
        if current_day_hours + module.duration_hours <= daily_hours:
            current_day_modules.append(module.id)
            current_day_hours += module.duration_hours
        else:
            # Save current day if it has modules
            if current_day_modules:
                day_plans.append(DayPlan(
                    day_number=current_day_num,
                    date=current_date,
                    day_type="study",
                    module_ids=current_day_modules,
                    estimated_hours=round(current_day_hours, 2),
                    is_today=(current_date == today),
                    focus_label=_day_focus_label(current_day_modules, module_map),
                ))
                current_day_num += 1
                current_date += timedelta(days=1)
            # Start new day with this module
            current_day_modules = [module.id]
            current_day_hours = module.duration_hours
    
    # Save last study day
    if current_day_modules:
        day_plans.append(DayPlan(
            day_number=current_day_num,
            date=current_date,
            day_type="study",
            module_ids=current_day_modules,
            estimated_hours=round(current_day_hours, 2),
            is_today=(current_date == today),
            focus_label=_day_focus_label(current_day_modules, module_map),
        ))
        current_day_num += 1
        current_date += timedelta(days=1)
    
    # Reserve last 2 days for final_review and mock_test
    # Calculate how many filler days we have
    days_used_for_content = len(day_plans)
    
    # The last day of our total window is deadline_date
    filler_start_date = current_date
    last_day_date = deadline_date
    
    # Compute filler days (between content end and the last 2 reserved days)
    reserved_start = last_day_date - timedelta(days=1)  # 2nd to last
    
    day_cursor = filler_start_date
    toggle = False  # False = review, True = rest
    while day_cursor < reserved_start:
        day_type = "review" if not toggle else "rest"
        label = "Revisit weak areas" if day_type == "review" else "Recharge and rest"
        day_plans.append(DayPlan(
            day_number=current_day_num,
            date=day_cursor,
            day_type=day_type,
            module_ids=[],
            estimated_hours=0.0,
            is_today=(day_cursor == today),
            focus_label=label,
        ))
        current_day_num += 1
        day_cursor += timedelta(days=1)
        toggle = not toggle
    
    # Final Review day
    day_plans.append(DayPlan(
        day_number=current_day_num,
        date=reserved_start,
        day_type="final_review",
        module_ids=[],
        estimated_hours=2.0,
        is_today=(reserved_start == today),
        focus_label="Final Review — revisit everything",
    ))
    current_day_num += 1
    
    # Mock Test day (deadline day)
    day_plans.append(DayPlan(
        day_number=current_day_num,
        date=last_day_date,
        day_type="mock_test",
        module_ids=[],
        estimated_hours=1.0,
        is_today=(last_day_date == today),
        focus_label="Mock Test Day — prove your readiness",
    ))
    
    return DailySchedule(
        days=day_plans,
        total_days=total_days,
        daily_hours=daily_hours,
        warning=warning,
        deadline_date=deadline_date,
        today=today,
        total_content_hours=round(total_content_hours, 2),
    )


def _day_focus_label(module_ids: list[str], module_map: dict[str, CourseModule]) -> str:
    if not module_ids:
        return "Study"
    names = [module_map[mid].skill_name.title() for mid in module_ids if mid in module_map]
    return " + ".join(names[:2])


def build_compounding_map(modules: list[CourseModule]) -> dict[str, list[str]]:
    """{ skill_name: [list of skill_names it unlocks] }"""
    comp_map: dict[str, list[str]] = {}
    for module in modules:
        if module.unlocks:
            existing = comp_map.get(module.skill_name, [])
            for unlocked in module.unlocks:
                if unlocked not in existing:
                    existing.append(unlocked)
            comp_map[module.skill_name] = existing
    return comp_map


def generate_reasoning_trace(
    gap_skills: list[SkillGap],
    matched_modules: list[CourseModule],
    compounding_map: dict[str, list[str]],
) -> list[ReasoningStep]:
    trace: list[ReasoningStep] = []

    # Build a skill → module mapping
    skill_to_module: dict[str, CourseModule] = {}
    for module in matched_modules:
        if module.skill_name not in skill_to_module:
            skill_to_module[module.skill_name] = module

    for gap in gap_skills:
        skill_name = gap.skill_name
        module = skill_to_module.get(skill_name)

        # Step 1: Detection
        trace.append(ReasoningStep(
            step_type="detection",
            skill_name=skill_name,
            detected_level=gap.candidate_level,
            action_taken=f"Detected {skill_name} (Proficiency: {gap.candidate_level}/10)",
        ))

        # Step 2: Gap analysis
        trace.append(ReasoningStep(
            step_type="gap",
            skill_name=skill_name,
            detected_level=gap.candidate_level,
            required_level=gap.required_level,
            gap_score=gap.gap_score,
            priority=gap.priority,
            action_taken=(
                f"Role requires {gap.required_level}/10 → "
                f"Gap: {gap.gap_score} pts → Priority: {gap.priority.upper()}"
            ),
        ))

        # Step 3: Module assignment
        if module:
            trace.append(ReasoningStep(
                step_type="decision",
                skill_name=skill_name,
                action_taken=f"Assigned: {module.title} ({module.duration_hours} hrs)",
                module_assigned=module.title,
            ))

        # Step 4: Compounding chain
        unlocks = compounding_map.get(skill_name, [])
        if unlocks:
            trace.append(ReasoningStep(
                step_type="chain",
                skill_name=skill_name,
                action_taken=f"{skill_name} unlocks: {', '.join(unlocks[:4])}",
            ))

    return trace


def build_weekly_summary(
    day_plans: list[DayPlan],
    module_map: dict[str, CourseModule],
) -> list[WeekPlan]:
    weeks: list[WeekPlan] = []
    week_num = 1
    
    for i in range(0, len(day_plans), 7):
        week_days = day_plans[i : i + 7]
        module_ids = []
        for day in week_days:
            module_ids.extend(day.module_ids)
        
        estimated_hours = sum(day.estimated_hours for day in week_days)
        
        # Determine focus skill for this week
        skill_counts: dict[str, int] = defaultdict(int)
        for mid in module_ids:
            module = module_map.get(mid)
            if module:
                skill_counts[module.skill_name] += 1
        focus_skill = max(skill_counts, key=skill_counts.get) if skill_counts else "Review"
        
        weeks.append(WeekPlan(
            week_number=week_num,
            module_ids=module_ids,
            focus_skill=focus_skill,
            estimated_hours=round(estimated_hours, 2),
        ))
        week_num += 1
    
    return weeks


def generate_learning_pathway(
    gap_result: SkillGapResult,
    deadline_date: date,
    daily_hours: float,
) -> tuple[LearningPathway, list[CourseModule]]:
    catalog = get_catalog()
    
    # Find relevant modules
    relevant_modules = find_relevant_modules(gap_result.gap_skills, catalog)
    
    # Ensure we have at least 5 nodes
    if len(relevant_modules) < 5:
        extra = [m for m in catalog if m not in relevant_modules][:5 - len(relevant_modules)]
        relevant_modules.extend(extra)
    
    # Build graph and topological sort
    graph = build_prerequisite_graph(relevant_modules)
    sorted_ids = topological_sort(relevant_modules, graph)
    
    # Schedule daily roadmap
    daily_schedule = schedule_daily_roadmap(
        relevant_modules, sorted_ids, deadline_date, daily_hours
    )
    
    # Build module map
    module_map = {m.id: m for m in relevant_modules}
    
    # Mark critical path modules (modules covering mandatory skills, first 60% of days)
    mandatory_skills = {g.skill_name for g in gap_result.gap_skills if g.is_mandatory}
    total_content_days = sum(1 for d in daily_schedule.days if d.day_type == "study")
    critical_threshold = math.ceil(total_content_days * 0.6)
    
    critical_path_ids: set[str] = set()
    study_day_count = 0
    for day in daily_schedule.days:
        if day.day_type == "study":
            study_day_count += 1
            if study_day_count <= critical_threshold:
                for mid in day.module_ids:
                    module = module_map.get(mid)
                    if module and normalize_skill_name(module.skill_name) in mandatory_skills:
                        critical_path_ids.add(mid)
    
    # Build learning nodes
    nodes: list[LearningNode] = []
    for i, mid in enumerate(sorted_ids):
        if mid not in module_map:
            continue
        module = module_map[mid]
        prereqs = graph.get(mid, [])
        all_prereqs_met = all(p in sorted_ids[:i] for p in prereqs)
        status = "available" if (not prereqs or all_prereqs_met) else "locked"
        
        unlock_cond = ""
        if prereqs:
            prereq_titles = [module_map[p].title for p in prereqs if p in module_map]
            unlock_cond = f"Complete: {', '.join(prereq_titles)}"
        
        nodes.append(LearningNode(
            module_id=mid,
            order_index=i,
            is_on_critical_path=mid in critical_path_ids,
            unlock_condition=unlock_cond,
            status=status,
        ))
    
    # Compounding map and reasoning trace
    compounding_map = build_compounding_map(relevant_modules)
    reasoning_trace = generate_reasoning_trace(gap_result.gap_skills, relevant_modules, compounding_map)
    
    # Weekly summary
    weekly_summary = build_weekly_summary(daily_schedule.days, module_map)
    
    total_hours = round(sum(m.duration_hours for m in relevant_modules), 2)
    
    pathway = LearningPathway(
        nodes=nodes,
        daily_schedule=daily_schedule,
        weekly_summary=weekly_summary,
        compounding_map=compounding_map,
        reasoning_trace=reasoning_trace,
        total_hours=total_hours,
        critical_path_module_ids=list(critical_path_ids),
    )
    
    return pathway, relevant_modules