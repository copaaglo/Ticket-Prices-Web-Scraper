from typing import Any, Dict, Tuple


def validate_scrape_request(payload: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], str]:
    """
    Validates POST /api/scrape/start
    Expected:
      { "artist": "Calvin Harris" }

    Returns:
      (ok, cleaned_payload, error_message)
    """
    if not isinstance(payload, dict):
        return False, {}, "Invalid JSON payload"

    artist = (payload.get("artist") or "").strip()
    if not artist:
        return False, {}, "artist is required"

    return True, {"artist": artist}, ""
