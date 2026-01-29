import React, { useState } from "react";
import axios from "axios";
import TrackedEventList from "./components/TrackedEventList";
import "./App.css";

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
      let url = `/api/search/tickets?artist=${encodeURIComponent(artistName)}`;
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

  const handleDragStart = (event, listing) => {
    event.dataTransfer.setData("application/json", JSON.stringify(listing));
    event.dataTransfer.effectAllowed = "copy";
    event.target.classList.add("dragging");
  };

  const handleDragEnd = (event) => {
    event.target.classList.remove("dragging");
  };

  const triggerRefresh = () => {
    setRefreshTracked(prev => prev + 1);
  };

  return (
    <>
      <div className="blob-container">
        <svg className="blob blob-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M34.6,-64.7C44.3,-54.2,51.3,-43.9,52.2,-33.2C53.2,-22.4,48.2,-11.2,46.9,-0.8C45.6,9.7,48,19.4,46.6,29.5C45.2,39.6,40.1,50,31.7,54.9C23.3,59.7,11.6,58.9,2,55.4C-7.6,51.9,-15.2,45.7,-28.3,43.6C-41.3,41.4,-59.9,43.3,-68.5,36.8C-77.1,30.2,-75.7,15.1,-70.9,2.8C-66.2,-9.5,-57.9,-19.1,-53.7,-33.4C-49.6,-47.7,-49.5,-66.7,-41.3,-78C-33,-89.3,-16.5,-92.9,-2,-89.4C12.4,-85.8,24.8,-75.2,34.6,-64.7Z" transform="translate(100 100)" />
        </svg>
        <svg className="blob blob-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M37.6,-68.3C48.2,-59.1,55.8,-47.9,64.7,-36.1C73.6,-24.4,83.8,-12.2,82.8,-0.5C81.9,11.1,69.8,22.2,61,34.2C52.3,46.1,46.8,58.8,37.2,67.2C27.5,75.6,13.8,79.6,0.3,79C-13.1,78.5,-26.2,73.3,-37,65.5C-47.7,57.8,-56.2,47.5,-57.3,36.2C-58.3,24.9,-52.1,12.4,-48.1,2.3C-44,-7.8,-42.2,-15.6,-37.6,-20.8C-32.9,-26,-25.5,-28.6,-18.8,-40C-12,-51.5,-6,-71.7,3.8,-78.2C13.5,-84.7,27.1,-77.5,37.6,-68.3Z" transform="translate(100 100)" />
        </svg>
        <svg className="blob blob-3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M26.5,-44.1C32.3,-42.5,33.7,-31.4,40,-22.5C46.3,-13.5,57.5,-6.8,64,3.7C70.5,14.2,72.2,28.5,67.1,39.5C62,50.5,50,58.2,37.7,65.6C25.4,73.1,12.7,80.2,-0.5,81.1C-13.7,82,-27.4,76.6,-39.5,69C-51.5,61.4,-61.9,51.6,-63.9,39.7C-65.9,27.8,-59.6,13.9,-59.4,0.1C-59.2,-13.7,-65.1,-27.3,-62.8,-38.8C-60.5,-50.2,-50.1,-59.4,-38.3,-57.6C-26.4,-55.7,-13.2,-42.8,-1.5,-40.2C10.3,-37.7,20.6,-45.7,26.5,-44.1Z" transform="translate(100 100)" />
        </svg>
        <svg className="blob blob-4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M39.3,-67.3C51.1,-61.3,60.8,-51,67.6,-39.1C74.4,-27.2,78.2,-13.6,75,-1.8C71.9,9.9,61.8,19.9,56,33.6C50.3,47.3,48.9,64.8,40.3,73.2C31.6,81.6,15.8,81,1.8,77.9C-12.2,74.8,-24.5,69.2,-37.4,63.3C-50.2,57.3,-63.7,50.9,-73.3,40.3C-83,29.7,-88.9,14.8,-87.5,0.8C-86.1,-13.2,-77.4,-26.4,-66.2,-34.5C-55.1,-42.5,-41.5,-45.4,-30,-51.5C-18.6,-57.7,-9.3,-67.1,2.2,-71C13.8,-74.9,27.5,-73.2,39.3,-67.3Z" transform="translate(100 100)" />
        </svg>
        <svg className="blob blob-center" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-58.1,79.6,-44.2C87.4,-30.3,90,-13.6,88.2,2.3C86.3,18.2,80,33.3,70.7,45.5C61.4,57.7,49.1,67,35.4,73.2C21.7,79.4,6.6,82.5,-8.9,81.9C-24.5,81.3,-40.5,77,-52.8,68.1C-65.1,59.2,-73.7,45.7,-78.6,31C-83.5,16.3,-84.6,0.3,-81.4,-14.5C-78.2,-29.3,-70.6,-42.9,-59.6,-51.3C-48.6,-59.7,-34.3,-62.8,-21.1,-70.1C-7.9,-77.4,-0.4,-88.9,8.2,-91.1C16.7,-93.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        <div className="backdrop-blur-overlay"></div>
      </div>

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
              {isLoading && <span className="spinner"></span>}
              {isLoading ? "Searching..." : "Search Tickets"}
            </button>
          </form>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {searchResults?.warnings && searchResults.warnings.length > 0 && (
          <div className="alert alert-warning">
            <strong>Note: </strong>
            {searchResults.warnings.join(". ")}
          </div>
        )}

        {searchResults?.city_suggestion && (
          <div className="alert alert-info">
            {searchResults.city_suggestion}
          </div>
        )}

        {searchResults && (
          <div className="results-section">
            <div className="results-header">
              <h2>
                Results for "{searchResults.artist}"
                {searchResults.nearest_city && ` near ${searchResults.nearest_city}`}
                {!searchResults.nearest_city && searchResults.city && ` in ${searchResults.city}`}
              </h2>
              <p>Found {searchResults.total_results} events - drag events to save them</p>
            </div>
            
            {searchResults.cheapest && searchResults.cheapest.price && (
              <div 
                className="best-deal-card draggable-event"
                draggable
                onDragStart={(e) => handleDragStart(e, searchResults.cheapest)}
                onDragEnd={handleDragEnd}
              >
                <span className="best-deal-badge">
                  <span>★</span> Best Deal
                </span>
                <div className="drag-hint">Drag to save</div>
                <div className="best-deal-price">
                  {formatPrice(searchResults.cheapest.price)}
                </div>
                <div className="best-deal-title">{searchResults.cheapest.name}</div>
                <div className="best-deal-info">{searchResults.cheapest.venue}</div>
                <div className="best-deal-info">{searchResults.cheapest.event_date || "Date TBD"}</div>
                <span className={`platform-badge ${searchResults.cheapest.platform === "Ticketmaster" ? "platform-ticketmaster" : "platform-seatgeek"}`}>
                  {searchResults.cheapest.platform}
                </span>
                <a 
                  href={searchResults.cheapest.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="buy-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  Get Tickets →
                </a>
              </div>
            )}
            
            {searchResults.listings && searchResults.listings.length > 0 && (
              <div className="events-section">
                <h3>
                  All Events 
                  <span className="events-count">{searchResults.listings.length}</span>
                </h3>
                <div className="events-grid">
                  {searchResults.listings.map((listing, index) => (
                    <div 
                      key={index} 
                      className="event-card draggable-event"
                      draggable
                      onDragStart={(e) => handleDragStart(e, listing)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="event-info">
                        <div className="event-title">{listing.name}</div>
                        <div className="event-venue">{listing.venue}</div>
                        <div className="event-date">{listing.event_date || "Date TBD"}</div>
                        <span className={`platform-badge ${listing.platform === "Ticketmaster" ? "platform-ticketmaster" : "platform-seatgeek"}`}>
                          {listing.platform}
                        </span>
                      </div>
                      <div className="event-pricing">
                        <span className={`event-price ${!listing.price ? 'no-price' : ''}`}>
                          {formatPrice(listing.price)}
                        </span>
                        {listing.max_price && listing.max_price !== listing.price && (
                          <span className="event-price-range">
                            up to {formatPrice(listing.max_price)}
                          </span>
                        )}
                        <a 
                          href={listing.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-button"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View →
                        </a>
                      </div>
                      <div className="drag-indicator">⋮⋮</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(!searchResults.listings || searchResults.listings.length === 0) && (
              <div className="no-results">
                <h3>No events found</h3>
                <p>Try a different artist or check back later for new listings.</p>
              </div>
            )}
          </div>
        )}

        <div className="divider"></div>

        <TrackedEventList refreshTrigger={refreshTracked} onEventAdded={triggerRefresh} />
      </div>
    </>
  );
}

export default App;
