from typing import Any, Dict, Tuple


def validate_tracked_artist_request(payload: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], str]:
    """
    Validates POST /api/tracked
    Expected:
      { "name": "Calvin Harris" }

    Returns:
      (ok, cleaned_payload, error_message)
    """
    if not isinstance(payload, dict):
        return False, {}, "Invalid JSON payload"

    name = (payload.get("name") or "").strip()
    if not name:
        return False, {}, "name is required"

    return True, {"name": name}, ""
