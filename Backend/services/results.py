# Backend/services/results_service.py

from typing import List, Dict, Any


def build_ticket_summary(artist: str, listings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Takes all scraped listings for an artist and returns a clean summary
    for the frontend:
      - artist name
      - total listings
      - cheapest ticket
      - grouped results by source
    """

    if not listings:
        return {
            "artist": artist,
            "total": 0,
            "cheapest": None,
            "sources": {},
        }

    # Normalize prices and filter bad data
    cleaned = []
    for item in listings:
        price = item.get("price")
        try:
            price = float(price)
        except (TypeError, ValueError):
            continue

        cleaned.append({
            "name": item.get("name"),
            "url": item.get("url"),
            "img": item.get("img"),
            "source": item.get("source"),
            "price": price,
        })

    if not cleaned:
        return {
            "artist": artist,
            "total": 0,
            "cheapest": None,
            "sources": {},
        }

    # Find cheapest ticket
    cheapest = min(cleaned, key=lambda x: x["price"])

    # Group by source
    sources: Dict[str, List[Dict[str, Any]]] = {}
    for item in cleaned:
        src = item.get("source", "unknown")
        sources.setdefault(src, []).append(item)

    return {
        "artist": artist,
        "total": len(cleaned),
        "cheapest": cheapest,
        "sources": sources,
    }
