import os
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed


TICKETMASTER_API_KEY = os.environ.get("TICKETMASTER_API_KEY", "")
SEATGEEK_CLIENT_ID = os.environ.get("SEATGEEK_CLIENT_ID", "")


def check_api_keys_configured() -> Dict[str, bool]:
    """Check which API keys are configured."""
    return {
        "ticketmaster": bool(TICKETMASTER_API_KEY),
        "seatgeek": bool(SEATGEEK_CLIENT_ID),
    }


def get_missing_api_keys() -> List[str]:
    """Return list of missing API keys."""
    missing = []
    if not TICKETMASTER_API_KEY:
        missing.append("TICKETMASTER_API_KEY")
    if not SEATGEEK_CLIENT_ID:
        missing.append("SEATGEEK_CLIENT_ID")
    return missing


def search_ticketmaster(artist: str, city: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Search Ticketmaster Discovery API for events.
    Free API with generous rate limits.
    """
    if not TICKETMASTER_API_KEY:
        return []

    base_url = "https://app.ticketmaster.com/discovery/v2/events.json"
    
    params = {
        "apikey": TICKETMASTER_API_KEY,
        "keyword": artist,
        "size": 20,
        "sort": "date,asc",
    }
    
    if city:
        params["city"] = city

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        events = data.get("_embedded", {}).get("events", [])
        results = []
        
        for event in events:
            price_ranges = event.get("priceRanges", [])
            min_price = None
            max_price = None
            
            if price_ranges:
                min_price = price_ranges[0].get("min")
                max_price = price_ranges[0].get("max")
            
            venue_info = ""
            venues = event.get("_embedded", {}).get("venues", [])
            if venues:
                venue = venues[0]
                venue_name = venue.get("name", "")
                city_name = venue.get("city", {}).get("name", "")
                state = venue.get("state", {}).get("stateCode", "")
                venue_info = f"{venue_name}, {city_name}, {state}" if city_name else venue_name
            
            event_date = ""
            dates = event.get("dates", {}).get("start", {})
            if dates.get("localDate"):
                event_date = dates.get("localDate")
                if dates.get("localTime"):
                    event_date += f" {dates.get('localTime')}"
            
            results.append({
                "name": event.get("name", ""),
                "event_date": event_date,
                "venue": venue_info,
                "price": min_price,
                "min_price": min_price,
                "max_price": max_price,
                "url": event.get("url", ""),
                "platform": "Ticketmaster",
                "image": event.get("images", [{}])[0].get("url", "") if event.get("images") else "",
            })
        
        return results
        
    except Exception as e:
        print(f"Ticketmaster API error: {e}")
        return []


def search_seatgeek(artist: str, city: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Search SeatGeek API for events.
    Free API.
    """
    if not SEATGEEK_CLIENT_ID:
        return []

    base_url = "https://api.seatgeek.com/2/events"
    
    params = {
        "client_id": SEATGEEK_CLIENT_ID,
        "q": artist,
        "per_page": 20,
        "sort": "datetime_local.asc",
    }
    
    if city:
        params["venue.city"] = city

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        events = data.get("events", [])
        results = []
        
        for event in events:
            stats = event.get("stats", {})
            lowest_price = stats.get("lowest_price")
            highest_price = stats.get("highest_price")
            
            venue = event.get("venue", {})
            venue_info = f"{venue.get('name', '')}, {venue.get('city', '')}, {venue.get('state', '')}"
            
            event_date = event.get("datetime_local", "")
            if event_date:
                try:
                    dt = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
                    event_date = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            
            performers = event.get("performers", [])
            image = performers[0].get("image", "") if performers else ""
            
            results.append({
                "name": event.get("title", ""),
                "event_date": event_date,
                "venue": venue_info,
                "price": lowest_price,
                "min_price": lowest_price,
                "max_price": highest_price,
                "url": event.get("url", ""),
                "platform": "SeatGeek",
                "image": image,
            })
        
        return results
        
    except Exception as e:
        print(f"SeatGeek API error: {e}")
        return []


def search_all_platforms(artist: str, city: Optional[str] = None) -> Dict[str, Any]:
    """
    Search all ticket platforms in parallel and return combined results.
    Note: Gametime does not offer a public API, so it cannot be integrated.
    """
    missing_keys = get_missing_api_keys()
    api_status = check_api_keys_configured()
    
    all_results = []
    platform_results = {}
    warnings = []
    
    if not api_status["ticketmaster"]:
        warnings.append("Ticketmaster API key not configured - Ticketmaster results unavailable")
    if not api_status["seatgeek"]:
        warnings.append("SeatGeek API key not configured - SeatGeek results unavailable")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        
        if api_status["ticketmaster"]:
            futures[executor.submit(search_ticketmaster, artist, city)] = "Ticketmaster"
        if api_status["seatgeek"]:
            futures[executor.submit(search_seatgeek, artist, city)] = "SeatGeek"
        
        for future in as_completed(futures):
            platform = futures[future]
            try:
                results = future.result()
                platform_results[platform] = results
                all_results.extend(results)
            except Exception as e:
                print(f"{platform} search error: {e}")
                platform_results[platform] = []
                warnings.append(f"{platform} search failed: {str(e)}")
    
    valid_results = [r for r in all_results if r.get("price") is not None]
    valid_results.sort(key=lambda x: x.get("price", float('inf')))
    
    cheapest = valid_results[0] if valid_results else None
    
    return {
        "artist": artist,
        "city": city,
        "total_results": len(all_results),
        "cheapest": cheapest,
        "listings": all_results,
        "by_platform": platform_results,
        "api_configured": api_status,
        "warnings": warnings,
    }
