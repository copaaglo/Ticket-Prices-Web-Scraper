from .database import db


class TrackedEvent(db.Model):
    __tablename__ = "tracked_events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    event_date = db.Column(db.String(100), nullable=True)
    venue = db.Column(db.String(300), nullable=True)
    price = db.Column(db.Float, nullable=True)
    min_price = db.Column(db.Float, nullable=True)
    max_price = db.Column(db.Float, nullable=True)
    url = db.Column(db.String(500), nullable=True)
    platform = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_date": self.event_date,
            "venue": self.venue,
            "price": self.price,
            "min_price": self.min_price,
            "max_price": self.max_price,
            "url": self.url,
            "platform": self.platform,
            "image": self.image,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
