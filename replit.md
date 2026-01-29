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
- `POST /api/scrape/start` - Start scraping for an artist
- `GET /api/results/tickets?artist=X` - Get ticket results for an artist
- `GET /api/tracked` - Get tracked artists
- `POST /api/tracked` - Add a tracked artist
- `DELETE /api/tracked/:id` - Remove a tracked artist

## Recent Changes
- Fixed circular import issues in models
- Updated frontend to use correct API endpoints
- Configured React for Replit proxy compatibility
