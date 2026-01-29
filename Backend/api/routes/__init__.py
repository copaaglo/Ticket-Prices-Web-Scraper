from .health_routes import health_bp
from .scrape_routes import scrape_bp
from .results_routes import results_bp
from .tracked_routes import tracked_bp
from .search_routes import search_bp


def register_routes(app):
    """
    Attach all API route blueprints to the Flask app.
    """
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(scrape_bp, url_prefix="/api")
    app.register_blueprint(results_bp, url_prefix="/api")
    app.register_blueprint(tracked_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
