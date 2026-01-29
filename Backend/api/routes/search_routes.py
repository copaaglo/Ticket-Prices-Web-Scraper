from flask import Blueprint, request, jsonify
from services.ticket_search import search_all_platforms
from models.artist_search import ArtistSearch
from models import db
from datetime import datetime, timezone

search_bp = Blueprint("search", __name__)


@search_bp.route("/search/tickets", methods=["GET"])
def search_tickets():
    """
    Search for tickets across all platforms.
    Query params:
      - artist (required): Artist or event name to search
      - city (optional): City to filter by
    """
    artist = (request.args.get("artist") or "").strip()
    city = (request.args.get("city") or "").strip() or None
    
    if not artist:
        return jsonify({"ok": False, "error": "artist query param is required"}), 400
    
    db.session.add(ArtistSearch(
        artist=artist, 
        created_at=datetime.now(timezone.utc)
    ))
    db.session.commit()
    
    results = search_all_platforms(artist, city)
    
    return jsonify({
        "ok": True,
        **results
    }), 200
