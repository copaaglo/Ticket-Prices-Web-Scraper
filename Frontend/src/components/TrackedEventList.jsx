import React, { useState, useEffect } from "react";

const STORAGE_KEY = "trackedEvents";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const TrackedEventList = ({ refreshTrigger, onEventAdded }) => {
  const [trackedEvents, setTrackedEvents] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setTrackedEvents(loadFromStorage());
  }, [refreshTrigger]);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    try {
      const eventData = JSON.parse(event.dataTransfer.getData("application/json"));

      const existing = loadFromStorage();
      const alreadyTracked = existing.some(
        (e) =>
          e.name === eventData.name &&
          e.event_date === eventData.event_date &&
          e.venue === eventData.venue
      );

      if (alreadyTracked) return;

      const newEvent = {
        id: Date.now(),
        name: eventData.name,
        event_date: eventData.event_date,
        venue: eventData.venue,
        price: eventData.price,
        min_price: eventData.min_price,
        max_price: eventData.max_price,
        url: eventData.url,
        platform: eventData.platform,
        image: eventData.image,
        created_at: new Date().toISOString(),
      };

      const updated = [newEvent, ...existing];
      saveToStorage(updated);
      setTrackedEvents(updated);
      if (onEventAdded) onEventAdded();
    } catch (error) {
      console.error("Error adding tracked event:", error);
    }
  };

  const handleDeleteTrackedEvent = (eventId) => {
    const updated = trackedEvents.filter((event) => event.id !== eventId);
    saveToStorage(updated);
    setTrackedEvents(updated);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price TBD";
    return `$${price.toFixed(2)}`;
  };

  return (
    <div 
      className={`tracked-section ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2>Tracked Events</h2>
      <p className="drop-hint">
        {isDragOver ? "Drop event here to save!" : "Drag events from search results here to save them"}
      </p>
      
      {trackedEvents.length > 0 ? (
        <div className="tracked-events-list">
          {trackedEvents.map((event) => (
            <div key={event.id} className="tracked-event-card">
              <div className="tracked-event-info">
                <div className="tracked-event-title">{event.name}</div>
                <div className="tracked-event-details">
                  <span>{event.venue}</span>
                  {event.event_date && <span> • {event.event_date}</span>}
                </div>
                <div className="tracked-event-meta">
                  <span className={`platform-badge ${event.platform === "Ticketmaster" ? "platform-ticketmaster" : "platform-seatgeek"}`}>
                    {event.platform}
                  </span>
                  <span className="tracked-event-price">
                    {formatPrice(event.price)}
                  </span>
                </div>
              </div>
              <div className="tracked-event-actions">
                {event.url && (
                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-button"
                  >
                    Buy →
                  </a>
                )}
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteTrackedEvent(event.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-tracked">
          <div className="empty-icon">📋</div>
          <p>No events saved yet</p>
          <p className="empty-hint">Search for events above and drag them here to save</p>
        </div>
      )}
    </div>
  );
};

export default TrackedEventList;
