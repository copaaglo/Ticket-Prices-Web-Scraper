import React, { useState } from "react";
import axios from "axios";
import TrackedProductList from "./components/TrackedProductList";

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (price === null || price === undefined) return "Price N/A";
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="main" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>Ticket Price Tracker</h1>
      
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: "30px", background: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Search for an artist or event:
          </label>
          <input
            type="text"
            value={artistName}
            onChange={handleArtistNameChange}
            placeholder="e.g., Drake, Calvin Harris, Taylor Swift..."
            style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "16px", 
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            City (optional):
          </label>
          <input
            type="text"
            value={cityFilter}
            onChange={handleCityChange}
            placeholder="e.g., New York, Los Angeles, Chicago..."
            style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "16px", 
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !artistName.trim()}
          style={{ 
            padding: "12px 30px", 
            fontSize: "16px", 
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Searching..." : "Search Tickets"}
        </button>
      </form>

      {error && (
        <div style={{ 
          backgroundColor: "#ffebee", 
          color: "#c62828", 
          padding: "15px", 
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {searchResults?.warnings && searchResults.warnings.length > 0 && (
        <div style={{ 
          backgroundColor: "#fff3e0", 
          color: "#e65100", 
          padding: "15px", 
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          <strong>Note:</strong>
          <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
            {searchResults.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {searchResults && (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>
            Results for: {searchResults.artist}
            {searchResults.city && ` in ${searchResults.city}`}
          </h2>
          
          <p style={{ color: "#666" }}>
            Found {searchResults.total_results} events across all platforms
          </p>
          
          {searchResults.cheapest && (
            <div style={{ 
              backgroundColor: "#e8f5e9", 
              padding: "20px", 
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #4caf50"
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>Best Deal Found!</h3>
              <p style={{ margin: "5px 0", fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                {formatPrice(searchResults.cheapest.price)}
              </p>
              <p style={{ margin: "5px 0" }}><strong>{searchResults.cheapest.name}</strong></p>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {searchResults.cheapest.venue}
              </p>
              <p style={{ margin: "5px 0", color: "#666" }}>
                Date: {searchResults.cheapest.event_date || "TBD"}
              </p>
              <p style={{ margin: "5px 0" }}>
                <span style={{ 
                  backgroundColor: searchResults.cheapest.platform === "Ticketmaster" ? "#026cdf" : "#ff5a5f",
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  {searchResults.cheapest.platform}
                </span>
              </p>
              <a 
                href={searchResults.cheapest.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px"
                }}
              >
                Buy Now
              </a>
            </div>
          )}
          
          {searchResults.listings && searchResults.listings.length > 0 && (
            <div>
              <h3>All Events ({searchResults.listings.length})</h3>
              <div style={{ display: "grid", gap: "15px" }}>
                {searchResults.listings.map((listing, index) => (
                  <div 
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 5px 0" }}>{listing.name}</h4>
                      <p style={{ margin: "3px 0", color: "#666", fontSize: "14px" }}>
                        {listing.venue}
                      </p>
                      <p style={{ margin: "3px 0", color: "#666", fontSize: "14px" }}>
                        {listing.event_date || "Date TBD"}
                      </p>
                      <span style={{ 
                        backgroundColor: listing.platform === "Ticketmaster" ? "#026cdf" : "#ff5a5f",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px"
                      }}>
                        {listing.platform}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                      <p style={{ 
                        margin: "0", 
                        fontSize: "20px", 
                        fontWeight: "bold",
                        color: listing.price ? "#2e7d32" : "#999"
                      }}>
                        {formatPrice(listing.price)}
                      </p>
                      {listing.max_price && listing.max_price !== listing.price && (
                        <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
                          up to {formatPrice(listing.max_price)}
                        </p>
                      )}
                      <a 
                        href={listing.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          padding: "6px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(!searchResults.listings || searchResults.listings.length === 0) && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No events found. Try a different search term or check back later.
            </p>
          )}
        </div>
      )}

      <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #ddd" }} />

      <TrackedProductList />
    </div>
  );
}

export default App;
