from flask import Blueprint, request, jsonify
from services.scraper import run_scraper
from models.artist_search import ArtistSearch
from models import db
from datetime import datetime, timezone

scrape_bp = Blueprint("scrape", __name__)


@scrape_bp.route("/scrape/start", methods=["POST"])
def start_scrape():
    data = request.get_json(silent=True) or {}
    artist = (data.get("artist") or "").strip()

    if not artist:
        return jsonify({"ok": False, "error": "Artist is required"}), 400

    # Log the search
    db.session.add(ArtistSearch(
        artist=artist, created_at=datetime.now(timezone.utc)))
    db.session.commit()

    # Run scraper (synchronous for now)
    result = run_scraper(artist)

    if not result.get("ok"):
        return jsonify({"ok": False, "error": result}), 500

    return jsonify({"ok": True, "artist": artist, "scraper": result})
