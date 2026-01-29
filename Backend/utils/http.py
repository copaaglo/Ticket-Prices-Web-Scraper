from typing import Any, Dict, Optional
from flask import jsonify


def json_ok(data: Optional[Dict[str, Any]] = None, status: int = 200):
    """
    Standard success response.
    """
    payload = {"ok": True}
    if data:
        payload.update(data)
    return jsonify(payload), status


def json_error(message: str, status: int = 400, extra: Optional[Dict[str, Any]] = None):
    """
    Standard error response.
    """
    payload = {"ok": False, "error": message}
    if extra:
        payload.update(extra)
    return jsonify(payload), status
