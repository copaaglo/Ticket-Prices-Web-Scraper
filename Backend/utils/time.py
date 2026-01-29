from datetime import datetime, timezone
from typing import Optional


def now_utc() -> datetime:
    """
    Current time in UTC (timezone-aware).
    """
    return datetime.now(timezone.utc)


def iso_utc(dt: Optional[datetime] = None) -> str:
    """
    Convert a datetime to an ISO-8601 string in UTC.
    If dt is None, uses now_utc().
    """
    if dt is None:
        dt = now_utc()

    # Ensure UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)

    return dt.isoformat().replace("+00:00", "Z")


def parse_iso_datetime(value: str) -> Optional[datetime]:
    """
    Parse common ISO strings into datetime. Returns None if invalid.
    Supports trailing 'Z'.
    """
    if not value or not isinstance(value, str):
        return None

    v = value.strip()
    if v.endswith("Z"):
        v = v[:-1] + "+00:00"

    try:
        return datetime.fromisoformat(v)
    except ValueError:
        return None
