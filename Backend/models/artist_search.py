from models import db
from datetime import datetime, timezone


class ArtistSearch(db.Model):
    __tablename__ = "artist_searches"

    id = db.Column(db.Integer, primary_key=True)

    # What the user searched, e.g. "Calvin Harris"
    artist = db.Column(db.String(200), nullable=False, index=True)

    # When the search happened
    created_at = db.Column(db.DateTime, nullable=False,
                           default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "artist": self.artist,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
