"""
ai_client.py — AWS Bedrock AI client for Gaplytics.

Uses AWS Bedrock Bearer token authentication to call Claude 3 Haiku.
No boto3 required — uses Python's built-in urllib for HTTP requests.

Setup:
  1. Go to AWS Console → Amazon Bedrock → API keys
  2. Click "Generate long-term API key"
  3. Copy the key and add to backend/.env as AWS_BEARER_TOKEN_BEDROCK=...

Supported models (fallback chain):
  - anthropic.claude-3-haiku-20240307-v1:0   (primary — fastest, cheapest)
  - anthropic.claude-3-5-haiku-20241022-v1:0 (fallback — newer)
  - amazon.titan-text-lite-v1                 (last resort — AWS native)
"""

import os
import re
import json
import logging
import urllib.request
import urllib.error

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
DEFAULT_MODEL = os.getenv("BEDROCK_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
AWS_REGION    = os.getenv("AWS_REGION", "us-east-1")

# Fallback chain — tried in order if primary model fails
FALLBACK_CHAIN = [
    "anthropic.claude-3-haiku-20240307-v1:0",
    "anthropic.claude-3-5-haiku-20241022-v1:0",
    "amazon.titan-text-lite-v1",
]


# ── Auth ───────────────────────────────────────────────────────────────────────
def _get_token() -> str:
    """Retrieve Bearer token from environment. Raises RuntimeError if missing."""
    token = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "").strip()
    if not token:
        raise RuntimeError(
            "AWS_BEARER_TOKEN_BEDROCK not set.\n"
            "Add to backend/.env: AWS_BEARER_TOKEN_BEDROCK=ABSKQm...\n"
            "Get key: AWS Console → Bedrock → API keys → Generate long-term API key"
        )
    return token


# ── Core HTTP call ─────────────────────────────────────────────────────────────
def _call_model(model_id: str, system: str, user: str, max_tokens: int) -> str:
    """
    Invoke a Bedrock model via HTTP with Bearer token auth.
    Handles both Anthropic Claude and Amazon Titan payload formats.
    """
    token = _get_token()

    # Build payload based on model family
    if model_id.startswith("anthropic."):
        payload = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }).encode("utf-8")

    elif model_id.startswith("amazon.titan"):
        payload = json.dumps({
            "inputText": f"{system}\n\n{user}",
            "textGenerationConfig": {
                "maxTokenCount": max_tokens,
                "temperature": 0.3,
            },
        }).encode("utf-8")

    else:
        # Generic OpenAI-style format
        payload = json.dumps({
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "max_tokens": max_tokens,
        }).encode("utf-8")

    # Make the HTTP request
    url = f"https://bedrock-runtime.{AWS_REGION}.amazonaws.com/model/{model_id}/invoke"
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type":  "application/json",
            "Accept":        "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    # Extract text from response based on model family
    if model_id.startswith("anthropic."):
        return result["content"][0]["text"].strip()
    elif model_id.startswith("amazon.titan"):
        return result["results"][0]["outputText"].strip()
    else:
        return result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()


# ── Public API ─────────────────────────────────────────────────────────────────
def call_gemini(system: str, user: str, max_tokens: int = 1024, model: str = None) -> str:
    """
    Call AWS Bedrock with system + user messages. Returns plain text response.
    Tries DEFAULT_MODEL first, then falls back through FALLBACK_CHAIN on 403/404.
    Raises RuntimeError if all models fail.
    """
    chain = [model] if model else [DEFAULT_MODEL] + [m for m in FALLBACK_CHAIN if m != DEFAULT_MODEL]
    last_error = None

    for model_id in chain:
        try:
            text = _call_model(model_id, system, user, max_tokens)
            logger.info(f"Bedrock success: {model_id}")
            return text

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {e.code}: {body[:200]}"

            if e.code in (403, 404):
                # Model not accessible or not found — try next
                logger.warning(f"Model {model_id} returned {e.code} — trying next...")
                continue
            else:
                logger.error(f"Bedrock HTTP error [{model_id}] {e.code}: {body[:300]}")
                raise RuntimeError(f"Bedrock error {e.code}: {body[:200]}")

        except Exception as e:
            last_error = str(e)
            logger.error(f"Bedrock error [{model_id}]: {e}")
            raise

    raise RuntimeError(
        f"All Bedrock models failed.\nLast error: {last_error}\n"
        f"Check: https://console.aws.amazon.com/bedrock/home#/modelaccess"
    )


def call_gemini_json(system: str, user: str, max_tokens: int = 6000, model: str = None) -> any:
    """
    Call Bedrock and parse response as JSON.
    Uses max_tokens=4096 by default to prevent JSON truncation.
    Automatically repairs truncated JSON before parsing.
    """
    # Strengthen the JSON instruction
    json_system = (
        system.rstrip()
        + "\n\nCRITICAL: Return ONLY a complete, valid JSON array or object. "
        "No markdown. No code fences. No explanation. "
        "Start directly with [ or {. Ensure JSON is fully closed."
    )

    raw = call_gemini(json_system, user, max_tokens, model).strip()

    # Strip markdown fences if model added them
    if raw.startswith("```"):
        lines = raw.split("\n")
        end   = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
        raw   = "\n".join(lines[1:end]).strip()

    # Find the start of the JSON structure
    for ch in ["[", "{"]:
        idx = raw.find(ch)
        if idx != -1:
            raw = raw[idx:]
            break

    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try JSON repair (handles truncated responses)
    repaired = _repair_json(raw)
    try:
        result = json.loads(repaired)
        logger.warning("JSON was truncated and auto-repaired successfully.")
        return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed after repair.\nError: {e}\nRaw (500 chars): {raw[:500]}")
        raise ValueError(f"Invalid JSON from Bedrock: {e}")


def _repair_json(raw: str) -> str:
    """
    Robust JSON repair — handles truncation mid-string, mid-value, or mid-object.
    Strategy: strip the broken tail and close all open structures cleanly.
    """
    raw = raw.strip()

    # Remove trailing comma before closing
    raw = re.sub(r",\s*$", "", raw)

    # If truncated mid-string: find the last complete key-value pair
    # by walking back from the end to find a safe truncation point
    # Try to find the last complete JSON object boundary
    stack = []
    in_string = False
    escape_next = False
    last_safe = 0

    for i, ch in enumerate(raw):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ("{", "["):
            stack.append(ch)
        elif ch in ("}", "]"):
            if stack:
                stack.pop()
                last_safe = i + 1

    # If we're mid-string or have unclosed structures, truncate to last safe point
    if in_string or stack:
        # Walk back to last complete comma-separated entry or opening bracket
        truncated = raw[:last_safe].rstrip().rstrip(",").rstrip()
        if not truncated:
            truncated = raw

        # Now close all open structures
        close_map = {"{": "}", "[": "]"}
        # Recount on truncated
        stack2 = []
        in_str2 = False
        esc2 = False
        for ch in truncated:
            if esc2: esc2 = False; continue
            if ch == "\\" and in_str2: esc2 = True; continue
            if ch == '"': in_str2 = not in_str2; continue
            if in_str2: continue
            if ch in ("{", "["): stack2.append(ch)
            elif ch in ("}", "]") and stack2: stack2.pop()

        closing = "".join(close_map[c] for c in reversed(stack2))
        return truncated + closing

    return raw


def is_configured() -> bool:
    """Return True if AWS_BEARER_TOKEN_BEDROCK is set in environment."""
    return bool(os.getenv("AWS_BEARER_TOKEN_BEDROCK", "").strip())


def list_available_models() -> list[str]:
    """Return the configured fallback chain."""
    return FALLBACK_CHAIN
