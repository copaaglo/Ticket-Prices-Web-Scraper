## Current issue
Frontend loads (new UI), but searching returns no results locally. Works on Replit.

## Expected setup
Backend: http://localhost:5000
Frontend: http://localhost:3000

## What I tried
- Set REACT_APP_API_URL=http://localhost:5000
- Adjusted axios URL to use API_BASE
- Backend health endpoint works: /api/health

## Likely causes
- Frontend calling wrong endpoint path for search
- Backend search route differs from what frontend expects: /api/search/tickets
- Backend scraper requires env vars/keys present on Replit but missing locally
- CORS/proxy mismatch
