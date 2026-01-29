from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from models import db
from models.tracked_event import TrackedEvent

tracked_bp = Blueprint("tracked", __name__)


@tracked_bp.route("/tracked", methods=["GET"])
def get_tracked():
    rows = TrackedEvent.query.order_by(TrackedEvent.created_at.desc()).all()
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

    existing = TrackedEvent.query.filter(
        TrackedEvent.name == name,
        TrackedEvent.event_date == data.get("event_date"),
        TrackedEvent.venue == data.get("venue")
    ).first()
    
    if existing:
        return jsonify({"ok": True, "tracked": existing.to_dict(), "message": "already tracked"}), 200

    row = TrackedEvent(
        name=name,
        event_date=data.get("event_date"),
        venue=data.get("venue"),
        price=data.get("price"),
        min_price=data.get("min_price"),
        max_price=data.get("max_price"),
        url=data.get("url"),
        platform=data.get("platform"),
        image=data.get("image"),
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(row)
    db.session.commit()

    return jsonify({"ok": True, "tracked": row.to_dict()}), 201


@tracked_bp.route("/tracked/<int:tracked_id>", methods=["DELETE"])
def delete_tracked(tracked_id: int):
    row = TrackedEvent.query.get(tracked_id)
    if not row:
        return jsonify({"ok": False, "error": "tracked item not found"}), 404

    db.session.delete(row)
    db.session.commit()

    return jsonify({"ok": True, "deleted_id": tracked_id}), 200
