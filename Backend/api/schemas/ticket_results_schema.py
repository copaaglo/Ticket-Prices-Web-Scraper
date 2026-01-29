from typing import Any, Dict, List, Optional


def normalize_ticket_results_response(
    artist: str,
    total: int,
    cheapest: Optional[Dict[str, Any]],
    sources: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """
    Ensures a consistent response for GET /api/results/tickets

    Output shape:
    {
      "artist": "...",
      "total": 123,
      "cheapest": {...} | null,
      "sources": {
         "ticketmaster": [ ... ],
         "seatgeek": [ ... ],
         "gametime": [ ... ]
      }
    }
    """
    return {
        "artist": artist,
        "total": int(total) if total is not None else 0,
        "cheapest": cheapest,
        "sources": sources or {},
    }
