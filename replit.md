# Ticket Price Tracker

## Overview
A full-stack web application for tracking ticket prices across multiple platforms (SeatGeek, Ticketmaster, and Gametime). Users can search for artists/events and track ticket prices over time.

## Project Structure
```
├── Backend/          # Flask API server
│   ├── api/          # API routes and schemas
│   ├── models/       # SQLAlchemy database models
│   ├── services/     # Business logic and scraper services
│   ├── Scraper/      # Platform-specific scrapers
│   └── utils/        # Helper utilities
├── Frontend/         # React frontend application
│   ├── src/          # React components and logic
│   └── public/       # Static assets
├── Scheduler/        # Scheduled scraping tasks
└── start.sh          # Startup script for both services
```

## Technology Stack
- **Frontend**: React 18 with create-react-app
- **Backend**: Flask with Flask-SQLAlchemy
- **Database**: SQLite (development)
- **Scrapers**: Platform-specific scrapers for ticket websites

## Running the Application
The application starts both the frontend (port 5000) and backend (port 5001) using the start.sh script.

The React frontend proxies API requests to the Flask backend.

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/search/tickets?artist=X&city=Y` - Search for events (uses smart city search)
- `GET /api/tracked` - Get tracked events
- `POST /api/tracked` - Add a tracked event (full event object)
- `DELETE /api/tracked/:id` - Remove a tracked event

## Environment Variables Required
- `TICKETMASTER_API_KEY`: API key from Ticketmaster Developer Portal (https://developer.ticketmaster.com/)
- `SEATGEEK_CLIENT_ID`: Client ID from SeatGeek Developer (https://seatgeek.com/account/develop)

Note: Gametime does not offer a public API, so ticket data cannot be fetched from that platform.

## Recent Changes
- **Smart City Search (Jan 2026)**: When no events found in the entered city, automatically finds and displays events from the nearest city (up to 500 miles) with distance indicator
- **Tracked Events with Drag & Drop (Jan 2026)**: 
  - Changed from "Tracked Artists" to "Tracked Events"
  - Drag event cards from search results to save them
  - Full event details stored (name, venue, date, price, platform, URL, image)
  - TrackedEvent database model with auto-migration
- **UI Redesign (Jan 2026)**: Implemented modern v0-style design with:
  - Animated SVG blob backgrounds with blur effect
  - Light theme with purple accent colors
  - Clean card-based layouts with rounded corners
  - Modern form styling with hover/focus states
  - Responsive design for mobile devices
- Added API-based ticket search using Ticketmaster and SeatGeek APIs
- Added city filter option for location-based searches
- Configured React for Replit proxy compatibility
