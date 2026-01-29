from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from models import db
from models.tracked_artist import TrackedArtist

tracked_bp = Blueprint("tracked", __name__)


@tracked_bp.route("/tracked", methods=["GET"])
def get_tracked():
    rows = TrackedArtist.query.order_by(TrackedArtist.created_at.desc()).all()
    return jsonify({
        "ok": True,
        "tracked": [r.to_dict() for r in rows]
    }), 200


@tracked_bp.route("/tracked", methods=["POST"])
def add_tracked():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"ok": False, "error": "name is required"}), 400

    # Prevent duplicates
    existing = TrackedArtist.query.filter(
        TrackedArtist.name.ilike(name)).first()
    if existing:
        return jsonify({"ok": True, "tracked": existing.to_dict(), "message": "already tracked"}), 200

    row = TrackedArtist(
        name=name,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(row)
    db.session.commit()

    return jsonify({"ok": True, "tracked": row.to_dict()}), 201


@tracked_bp.route("/tracked/<int:tracked_id>", methods=["DELETE"])
def delete_tracked(tracked_id: int):
    row = TrackedArtist.query.get(tracked_id)
    if not row:
        return jsonify({"ok": False, "error": "tracked item not found"}), 404

    db.session.delete(row)
    db.session.commit()

    return jsonify({"ok": True, "deleted_id": tracked_id}), 200
