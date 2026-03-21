import json
import logging
import os
from datetime import date
from models import HRRole, CandidateSummary

logger = logging.getLogger(__name__)

STORAGE_FILE = "hr_data.json"

# In-memory stores
ROLES_STORE: dict[str, HRRole] = {}
CANDIDATES_STORE: dict[str, list[CandidateSummary]] = {}


def _serialize(obj):
    """JSON serializer for objects not serializable by default json."""
    if isinstance(obj, date):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def _save_to_disk():
    try:
        data = {
            "roles": {
                role_id: json.loads(role.model_dump_json())
                for role_id, role in ROLES_STORE.items()
            },
            "candidates": {
                role_id: [json.loads(c.model_dump_json()) for c in candidates]
                for role_id, candidates in CANDIDATES_STORE.items()
            },
        }
        with open(STORAGE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save HR data to disk: {e}")


def load_from_disk():
    global ROLES_STORE, CANDIDATES_STORE
    if not os.path.exists(STORAGE_FILE):
        return
    try:
        with open(STORAGE_FILE, "r") as f:
            data = json.load(f)
        
        ROLES_STORE = {}
        for role_id, role_data in data.get("roles", {}).items():
            try:
                ROLES_STORE[role_id] = HRRole(**role_data)
            except Exception as e:
                logger.warning(f"Could not load role {role_id}: {e}")
        
        CANDIDATES_STORE = {}
        for role_id, candidates_data in data.get("candidates", {}).items():
            try:
                CANDIDATES_STORE[role_id] = [CandidateSummary(**c) for c in candidates_data]
            except Exception as e:
                logger.warning(f"Could not load candidates for role {role_id}: {e}")
        
        logger.info(f"Loaded {len(ROLES_STORE)} roles from disk.")
    except Exception as e:
        logger.error(f"Failed to load HR data from disk: {e}")


def save_role(role: HRRole) -> None:
    ROLES_STORE[role.role_id] = role
    if role.role_id not in CANDIDATES_STORE:
        CANDIDATES_STORE[role.role_id] = []
    _save_to_disk()


def get_role(role_id: str) -> HRRole | None:
    return ROLES_STORE.get(role_id)


def add_candidate(role_id: str, summary: CandidateSummary) -> None:
    if role_id not in CANDIDATES_STORE:
        CANDIDATES_STORE[role_id] = []
    
    # Update if candidate_id already exists
    existing = CANDIDATES_STORE[role_id]
    for i, c in enumerate(existing):
        if c.candidate_id == summary.candidate_id:
            existing[i] = summary
            _save_to_disk()
            return
    
    existing.append(summary)
    _save_to_disk()


def get_candidates(role_id: str) -> list[CandidateSummary]:
    return CANDIDATES_STORE.get(role_id, [])


def get_all_roles() -> list[HRRole]:
    return list(ROLES_STORE.values())
