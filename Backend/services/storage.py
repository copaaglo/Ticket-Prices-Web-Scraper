from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from utils.price import safe_price
from models.ticket_listing import TicketListing
from models import db


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def save_listings(artist: str, source: str, listings: List[Dict[str, Any]]) -> int:
    """
    Save ticket listing dicts to the DB.

    Expected listing dict keys (flexible):
      - name OR event_name
      - price (string or number)
      - url
      - created_at (optional)

    Returns number of rows inserted.
    """
    if not listings:
        return 0

    inserted = 0

    for item in listings:
        name = item.get("name") or item.get("event_name") or artist
        url = item.get("url") or ""
        price_raw = item.get("price")
        price_num = safe_price(price_raw)

        # Skip rows without essentials
        if not url or price_num is None:
            continue

        created_at = item.get("created_at")
        if isinstance(created_at, str):
            # keep string; DB column is DateTime so we’ll default to now
            created_at_dt = _utc_now()
        elif created_at is None:
            created_at_dt = _utc_now()
        else:
            created_at_dt = created_at

        row = TicketListing(
            artist=artist,
            name=name,
            source=source,
            url=url,
            price=price_num,
            created_at=created_at_dt,
        )

        db.session.add(row)
        inserted += 1

    db.session.commit()
    return inserted


def get_listings_for_artist(artist: str, limit: int = 200) -> List[TicketListing]:
    """
    Fetch newest listings for an artist.
    """
    q = (
        TicketListing.query
        .filter(TicketListing.artist.ilike(f"%{artist}%"))
        .order_by(TicketListing.created_at.desc())
        .limit(limit)
    )
    return list(q.all())
