import React, { useState } from "react";
import axios from "axios";
import TrackedProductList from "./components/TrackedProductList";

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleArtistNameChange = (event) => {
    setArtistName(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (!artistName.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      await axios.post("/api/scrape/start", {
        artist: artistName,
      });

      const response = await axios.get(
        `/api/results/tickets?artist=${encodeURIComponent(artistName)}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
      setError("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Ticket Price Tracker</h1>
      <form onSubmit={handleSearchSubmit}>
        <label>Search for an artist or event:</label>
        <input
          type="text"
          value={artistName}
          onChange={handleArtistNameChange}
          placeholder="Enter artist name..."
          style={{ marginLeft: "10px", marginRight: "10px", padding: "5px" }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search Tickets"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {searchResults && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results for: {searchResults.artist}</h2>
          {searchResults.cheapest && (
            <div style={{ backgroundColor: "#e8f5e9", padding: "10px", marginBottom: "10px" }}>
              <h3>Cheapest Ticket</h3>
              <p>Price: ${searchResults.cheapest.price}</p>
              <p>Platform: {searchResults.cheapest.platform}</p>
              {searchResults.cheapest.event_date && (
                <p>Date: {searchResults.cheapest.event_date}</p>
              )}
            </div>
          )}
          {searchResults.listings && searchResults.listings.length > 0 && (
            <div>
              <h3>All Listings ({searchResults.listings.length})</h3>
              <ul>
                {searchResults.listings.map((listing, index) => (
                  <li key={index}>
                    ${listing.price} - {listing.platform} 
                    {listing.event_date && ` (${listing.event_date})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <TrackedProductList />
    </div>
  );
}

export default App;
