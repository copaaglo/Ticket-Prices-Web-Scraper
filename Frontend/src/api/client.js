// Frontend/src/api/endpoints.js

// If you have "proxy": "http://localhost:5000" in Frontend/package.json,
// you can leave API_BASE as "" so requests go to /api/... and CRA proxies them.
export const API_BASE = "";

// API endpoints
export const endpoints = {
  health: () => `${API_BASE}/api/health`,

  // Start scraping for an artist
  startScrape: () => `${API_BASE}/api/scrape/start`,

  // Get ticket results (cheapest + listings)
  ticketResults: (artist) =>
    `${API_BASE}/api/results/tickets?artist=${encodeURIComponent(artist)}`,

  // Optional tracked endpoints (if you add them later)
  tracked: () => `${API_BASE}/api/tracked`,
};
