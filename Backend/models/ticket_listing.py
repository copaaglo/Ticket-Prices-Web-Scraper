from models import db


class TicketListing(db.Model):
    __tablename__ = "ticket_listings"

    id = db.Column(db.Integer, primary_key=True)

    # What the user searched (e.g., "Calvin Harris")
    artist = db.Column(db.String(200), nullable=False, index=True)

    # Event name as returned by the provider
    name = db.Column(db.String(300), nullable=False)

    # ticketmaster / seatgeek / gametime
    source = db.Column(db.String(50), nullable=False, index=True)

    # Numeric price (already normalized)
    price = db.Column(db.Float, nullable=False, index=True)

    # Link to the listing
    url = db.Column(db.Text, nullable=False)

    # When this price was recorded
    created_at = db.Column(db.DateTime, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "artist": self.artist,
            "name": self.name,
            "source": self.source,
            "price": float(self.price),
            "url": self.url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
