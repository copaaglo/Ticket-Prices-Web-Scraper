import re
from typing import Any, Dict, List, Optional, Tuple


_CURRENCY_RE = re.compile(r"[^0-9.\-]+")


def safe_price(value: Any) -> Optional[float]:
    """
    Convert common price formats into a float.

    Examples:
      120 -> 120.0
      "120" -> 120.0
      "$120.50" -> 120.5
      "CA$ 145.00" -> 145.0
      "from $99" -> 99.0
      None / "" / "N/A" -> None
    """
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if not isinstance(value, str):
        return None

    s = value.strip()
    if not s or s.lower() in {"n/a", "na", "none", "null"}:
        return None

    # Extract a number-like token. Prefer the first valid number.
    # Remove currency symbols/letters and keep digits/dot/minus
    cleaned = _CURRENCY_RE.sub("", s)
    # Sometimes you get strings like "99-120", take first chunk
    cleaned = cleaned.split("-")[0].strip()

    try:
        return float(cleaned)
    except ValueError:
        # As a fallback, find any number in the string
        m = re.search(r"(-?\d+(?:\.\d+)?)", s)
        if not m:
            return None
        try:
            return float(m.group(1))
        except ValueError:
            return None


def is_artist_match(listing_name: str, artist: str) -> bool:
    """
    Basic artist match: case-insensitive substring.
    """
    if not listing_name or not artist:
        return False
    return artist.lower() in listing_name.lower()


def cheapest_listing(listings: List[Dict[str, Any]], artist: str) -> Optional[Dict[str, Any]]:
    """
    Filter listings for the artist and return the cheapest listing.
    Expects listing dicts with at least: name/event_name + price.
    Adds "_price_num" to the returned dict.
    """
    candidates: List[Tuple[float, Dict[str, Any]]] = []

    for item in listings or []:
        name = item.get("name") or item.get("event_name") or ""
        if not is_artist_match(name, artist):
            continue

        p = safe_price(item.get("price"))
        if p is None:
            continue

        item["_price_num"] = p
        candidates.append((p, item))

    if not candidates:
        return None

    candidates.sort(key=lambda x: x[0])
    return candidates[0][1]


def cheapest_by_source(
    results_by_source: Dict[str, List[Dict[str, Any]]],
    artist: str,
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Given {source: [listings...]}, compute cheapest listing per source for an artist.
    """
    out: Dict[str, Optional[Dict[str, Any]]] = {}
    for source, listings in (results_by_source or {}).items():
        best = cheapest_listing(listings, artist)
        if not best:
            out[source] = None
            continue
        best.setdefault("source", source)
        out[source] = best
    return out
