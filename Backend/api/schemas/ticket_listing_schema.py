from typing import Any, Dict, List, Optional
from utils.price import safe_price


def normalize_ticket_listing(item: Dict[str, Any], default_artist: Optional[str] = None, default_source: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Normalizes a provider listing or DB listing into a consistent shape.

    Input can contain:
      - name or event_name
      - price (string/number)
      - url
      - source
      - artist
      - created_at

    Returns a normalized dict or None if invalid.
    """
    if not isinstance(item, dict):
        return None

    name = (item.get("name") or item.get("event_name") or "").strip()
    url = (item.get("url") or "").strip()

    artist = (item.get("artist") or default_artist or "").strip()
    source = (item.get("source") or default_source or "").strip()

    price_num = safe_price(item.get("price"))
    if not url or price_num is None:
        return None

    # keep whatever format you store (iso string or datetime->string)
    created_at = item.get("created_at")

    return {
        "artist": artist,
        "name": name if name else artist,
        "source": source if source else "unknown",
        "price": float(price_num),
        "url": url,
        "created_at": created_at,
    }


def normalize_ticket_listings(items: List[Dict[str, Any]], default_artist: Optional[str] = None, default_source: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Normalize a list of listings, dropping invalid rows.
    """
    out: List[Dict[str, Any]] = []
    for it in items or []:
        norm = normalize_ticket_listing(
            it, default_artist=default_artist, default_source=default_source)
        if norm:
            out.append(norm)
    return out
