# Backend/app.py

import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from models import db
from api import register_api

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "database.db")
FRONTEND_BUILD = os.path.join(os.path.dirname(BASE_DIR), "Frontend", "build")


def create_app():
    app = Flask(__name__, static_folder=FRONTEND_BUILD, static_url_path="")
    CORS(app)

    os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    register_api(app)

    with app.app_context():
        db.create_all()

    return app


app = create_app()


@app.route("/", methods=["GET"])
def serve_frontend():
    if os.path.exists(os.path.join(FRONTEND_BUILD, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({"ok": True, "message": "Ticket Price Tracker Backend is running"})


@app.errorhandler(404)
def not_found(e):
    if os.path.exists(os.path.join(FRONTEND_BUILD, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
