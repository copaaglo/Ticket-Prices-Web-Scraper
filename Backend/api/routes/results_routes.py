from flask import Blueprint, request, jsonify

from services.storage import get_listings_for_artist
from services.results import build_ticket_summary

results_bp = Blueprint("results", __name__)


@results_bp.route("/results/tickets", methods=["GET"])
def ticket_results():
    artist = (request.args.get("artist") or "").strip()
    if not artist:
        return jsonify({"ok": False, "error": "artist query param is required"}), 400

    # Pull listings from DB (TicketListing rows)
    listings = get_listings_for_artist(artist)

    # Convert SQLAlchemy objects to dicts if needed
    # (If your TicketListing has to_dict, this works)
    listings_dicts = [x.to_dict() for x in listings]

    summary = build_ticket_summary(artist, listings_dicts)
    return jsonify(summary), 200
