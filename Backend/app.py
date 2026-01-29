# Backend/app.py

import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

from models import db
from api import register_api

# Optional: if you want a default SQLite location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "database.db")


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Ensure instance folder exists for sqlite
    os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

    # --- Database config (SQLite) ---
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init DB
    db.init_app(app)

    # Register API blueprints under /api
    register_api(app)

    # Create tables on startup (simple dev setup)
    with app.app_context():
        db.create_all()

    return app


app = create_app()


# Root route (optional)
@app.route("/", methods=["GET"])
def root():
    return jsonify({"ok": True, "message": "Ticket Price Tracker Backend is running"})


if __name__ == "__main__":
    # Use 0.0.0.0 if you want to access from other devices on your network
    app.run(host="127.0.0.1", port=5000, debug=True)
