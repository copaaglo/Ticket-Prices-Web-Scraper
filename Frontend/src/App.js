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
              {isLoading ? "Searching..." : "Search Tickets"}
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {searchResults && (
          <div className="results-section">
            <h2>
              Results for "{searchResults.artist}"
              {searchResults.city && ` in ${searchResults.city}`}
            </h2>
          </div>
        )}

        <TrackedEventList
          refreshTrigger={refreshTracked}
          onEventAdded={triggerRefresh}
        />
      </div>
    </>
  );
}

export default App;
