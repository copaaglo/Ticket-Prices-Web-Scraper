import React, { useState } from "react";
import axios from "axios";
import TrackedEventList from "./components/TrackedEventList";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTracked, setRefreshTracked] = useState(0);

  const handleArtistNameChange = (event) => {
    setArtistName(event.target.value);
  };

  const handleCityChange = (event) => {
    setCityFilter(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (!artistName.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      let url = `${API_BASE}/api/search/tickets?artist=${encodeURIComponent(
        artistName
      )}`;
      if (cityFilter.trim()) {
        url += `&city=${encodeURIComponent(cityFilter)}`;
      }

      const response = await axios.get(url);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to search. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price TBD";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleDragStart = (event, listing) => {
    event.dataTransfer.setData("application/json", JSON.stringify(listing));
    event.dataTransfer.effectAllowed = "copy";
    event.target.classList.add("dragging");
  };

  const handleDragEnd = (event) => {
    event.target.classList.remove("dragging");
  };

  const triggerRefresh = () => {
    setRefreshTracked((prev) => prev + 1);
  };

  return (
    <>
      <div className="app-container">
        <header className="header">
          <h1>Ticket Price Tracker</h1>
          <p>Find the best deals on concert and event tickets</p>
        </header>

        <div className="search-card">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="artist">Artist or Event</label>
                <input
                  id="artist"
                  type="text"
                  className="search-input"
                  value={artistName}
                  onChange={handleArtistNameChange}
                  placeholder="e.g., Taylor Swift, Drake..."
                />
              </div>

              <div className="input-group">
                <label htmlFor="city">Preferred City</label>
                <input
                  id="city"
                  type="text"
                  className="search-input"
                  value={cityFilter}
                  onChange={handleCityChange}
                  placeholder="e.g., Toronto, NYC..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="search-button"
              disabled={isLoading || !artistName.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                "Search Tickets"
              )}
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {searchResults && (
          <div className="results-section">
            <div className="results-header">
              <h2>
                Results for "{searchResults.artist}"
                {searchResults.city && ` in ${searchResults.city}`}
              </h2>
              {searchResults.city_suggestion && (
                <div className="alert alert-info">
                  {searchResults.city_suggestion}
                </div>
              )}
              <p>{searchResults.total_results || 0} events found</p>
            </div>

            {searchResults.cheapest && (
              <div
                className="best-deal-card draggable-event"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, searchResults.cheapest)}
                onDragEnd={handleDragEnd}
              >
                <span className="drag-hint">Drag to save</span>
                <div className="best-deal-badge">
                  <span>★</span> Best Deal
                </div>
                <div className="best-deal-price">
                  {formatPrice(searchResults.cheapest.price)}
                </div>
                <div className="best-deal-title">
                  {searchResults.cheapest.name}
                </div>
                <div className="best-deal-info">
                  {searchResults.cheapest.venue}
                </div>
                <div className="best-deal-info">
                  {formatDate(searchResults.cheapest.event_date)}
                </div>
                <span
                  className={`platform-badge platform-${searchResults.cheapest.platform?.toLowerCase()}`}
                >
                  {searchResults.cheapest.platform}
                </span>
                <a
                  href={searchResults.cheapest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-button"
                >
                  Buy Tickets →
                </a>
              </div>
            )}

            {searchResults.listings && searchResults.listings.length > 0 && (
              <div className="events-section">
                <h3>
                  All Events{" "}
                  <span className="events-count">
                    {searchResults.listings.length}
                  </span>
                </h3>
                <div className="events-grid">
                  {searchResults.listings.map((listing, index) => (
                    <div
                      key={index}
                      className="event-card draggable-event"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, listing)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="event-info">
                        <div className="event-title">{listing.name}</div>
                        <div className="event-venue">{listing.venue}</div>
                        <div className="event-date">
                          {formatDate(listing.event_date)}
                        </div>
                        <span
                          className={`platform-badge platform-${listing.platform?.toLowerCase()}`}
                        >
                          {listing.platform}
                        </span>
                      </div>
                      <div className="event-pricing">
                        <div
                          className={`event-price ${
                            listing.price === null ? "no-price" : ""
                          }`}
                        >
                          {formatPrice(listing.price)}
                        </div>
                        {listing.min_price && listing.max_price && (
                          <div className="event-price-range">
                            ${listing.min_price} - ${listing.max_price}
                          </div>
                        )}
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-button"
                        >
                          View →
                        </a>
                      </div>
                      <span className="drag-indicator">⋮⋮</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!searchResults.listings ||
              searchResults.listings.length === 0) && (
              <div className="no-results">
                <h3>No events found</h3>
                <p>Try a different artist name or city</p>
              </div>
            )}
          </div>
        )}

        <div className="divider"></div>

        <TrackedEventList
          refreshTrigger={refreshTracked}
          onEventAdded={triggerRefresh}
        />
      </div>
    </>
  );
}

export default App;
