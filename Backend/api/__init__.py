from .routes import register_routes


def register_api(app):
    """
    Wrapper that calls register_routes to set up all API blueprints.
    """
    register_routes(app)
