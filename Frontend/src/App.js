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
      <div className="blob-container">
        <svg className="blob blob-1" viewBox="0 0 200 200">
          <path
            fill="currentColor"
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.2C64.8,55.2,53.8,66.6,40.7,74.7C27.5,82.8,13.8,87.6,-0.9,89.2C-15.5,90.8,-31.1,89.1,-44.6,82.6C-58.1,76,-69.6,64.6,-77.8,51.1C-86.1,37.6,-91.1,18.8,-90.9,0.1C-90.7,-18.5,-85.3,-37,-75.3,-52.1C-65.3,-67.2,-50.7,-78.9,-35.3,-85.3C-19.9,-91.7,-3.7,-92.9,11.2,-88.6C26.2,-84.3,52.3,-74.5,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg className="blob blob-2" viewBox="0 0 200 200">
          <path
            fill="currentColor"
            d="M39.9,-68.1C51.1,-61.5,59.3,-49.7,66.2,-37.2C73.1,-24.7,78.8,-11.4,79.4,2.4C80,16.1,75.4,32.2,66.6,45.1C57.8,58,44.8,67.6,30.5,73.6C16.2,79.6,0.6,82,-14.9,80.1C-30.4,78.2,-45.8,72,-57.9,62C-69.9,52,-78.6,38.2,-82.7,23.1C-86.8,8,-86.3,-8.4,-81.4,-23.1C-76.5,-37.8,-67.2,-50.8,-54.8,-56.8C-42.4,-62.8,-26.9,-61.8,-13.1,-65.4C0.8,-69,28.7,-74.7,39.9,-68.1Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg className="blob blob-3" viewBox="0 0 200 200">
          <path
            fill="currentColor"
            d="M47.7,-79.1C60.9,-71.6,70.2,-56.8,76.8,-41.4C83.4,-26,87.3,-9.9,85.3,5.1C83.3,20.1,75.5,34.1,65.4,45.8C55.4,57.5,43.2,67,29.5,73.5C15.8,80,0.6,83.5,-15.6,82.4C-31.7,81.3,-48.9,75.5,-61.5,64.7C-74.1,53.8,-82.1,37.8,-85.2,21.1C-88.3,4.4,-86.5,-13.1,-80.4,-28.6C-74.3,-44.1,-64,-57.6,-50.5,-65C-37,-72.4,-20.3,-73.6,-2.3,-69.9C15.7,-66.2,34.5,-86.6,47.7,-79.1Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg className="blob blob-4" viewBox="0 0 200 200">
          <path
            fill="currentColor"
            d="M54.3,-89.3C69.6,-80.3,80.8,-64.2,87.5,-46.8C94.2,-29.4,96.4,-10.6,93.8,7.1C91.2,24.9,83.8,41.6,72.7,55.2C61.6,68.8,46.8,79.3,30.5,84.8C14.2,90.3,-3.6,90.9,-20.8,87.1C-38,83.4,-54.6,75.3,-67.3,63C-80,50.6,-88.8,34,-91.5,16.3C-94.1,-1.5,-90.6,-20.5,-83.1,-37.3C-75.6,-54.1,-64.1,-68.7,-49.5,-78C-35,-87.4,-17.5,-91.5,1.1,-93.4C19.7,-95.3,39.1,-95.1,54.3,-89.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="backdrop-blur-overlay"></div>

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
