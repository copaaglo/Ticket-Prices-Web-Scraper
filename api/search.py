import os
import math
import requests
from flask import Flask, request, jsonify
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)

TICKETMASTER_API_KEY = os.environ.get("TICKETMASTER_API_KEY", "")
SEATGEEK_CLIENT_ID = os.environ.get("SEATGEEK_CLIENT_ID", "")

MAJOR_CITIES = {
    "New York": (40.7128, -74.0060),
    "Los Angeles": (34.0522, -118.2437),
    "Chicago": (41.8781, -87.6298),
    "Houston": (29.7604, -95.3698),
    "Phoenix": (33.4484, -112.0740),
    "Philadelphia": (39.9526, -75.1652),
    "San Antonio": (29.4241, -98.4936),
    "San Diego": (32.7157, -117.1611),
    "Dallas": (32.7767, -96.7970),
    "San Jose": (37.3382, -121.8863),
    "Austin": (30.2672, -97.7431),
    "Jacksonville": (30.3322, -81.6557),
    "Fort Worth": (32.7555, -97.3308),
    "Columbus": (39.9612, -82.9988),
    "Charlotte": (35.2271, -80.8431),
    "San Francisco": (37.7749, -122.4194),
    "Indianapolis": (39.7684, -86.1581),
    "Seattle": (47.6062, -122.3321),
    "Denver": (39.7392, -104.9903),
    "Washington": (38.9072, -77.0369),
    "Boston": (42.3601, -71.0589),
    "Nashville": (36.1627, -86.7816),
    "Detroit": (42.3314, -83.0458),
    "Portland": (45.5152, -122.6784),
    "Las Vegas": (36.1699, -115.1398),
    "Memphis": (35.1495, -90.0490),
    "Louisville": (38.2527, -85.7585),
    "Baltimore": (39.2904, -76.6122),
    "Milwaukee": (43.0389, -87.9065),
    "Albuquerque": (35.0844, -106.6504),
    "Tucson": (32.2226, -110.9747),
    "Fresno": (36.7378, -119.7871),
    "Sacramento": (38.5816, -121.4944),
    "Kansas City": (39.0997, -94.5786),
    "Atlanta": (33.7490, -84.3880),
    "Miami": (25.7617, -80.1918),
    "Raleigh": (35.7796, -78.6382),
    "Omaha": (41.2565, -95.9345),
    "Minneapolis": (44.9778, -93.2650),
    "Cleveland": (41.4993, -81.6944),
    "Tampa": (27.9506, -82.4572),
    "St. Louis": (38.6270, -90.1994),
    "Pittsburgh": (40.4406, -79.9959),
    "Cincinnati": (39.1031, -84.5120),
    "Orlando": (28.5383, -81.3792),
    "New Orleans": (29.9511, -90.0715),
    "Toronto": (43.6532, -79.3832),
    "Montreal": (45.5017, -73.5673),
    "Vancouver": (49.2827, -123.1207),
    "Calgary": (51.0447, -114.0719),
    "Ottawa": (45.4215, -75.6972),
    "Edmonton": (53.5461, -113.4938),
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 3959
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def get_city_coordinates(city_name: str) -> Optional[Tuple[float, float]]:
    city_lower = city_name.lower().strip()
    for city, coords in MAJOR_CITIES.items():
        if city.lower() == city_lower:
            return coords
    for city, coords in MAJOR_CITIES.items():
        if city_lower in city.lower() or city.lower() in city_lower:
            return coords
    return None


def get_nearby_cities(city_name: str, max_distance: float = 500, limit: int = 5) -> List[Dict]:
    coords = get_city_coordinates(city_name)
    if not coords:
        return list(MAJOR_CITIES.keys())[:limit]

    lat, lon = coords
    cities_with_distance = []

    for city, (city_lat, city_lon) in MAJOR_CITIES.items():
        if city.lower() != city_name.lower():
            distance = haversine_distance(lat, lon, city_lat, city_lon)
            if distance <= max_distance:
                cities_with_distance.append({
                    "city": city,
                    "distance": round(distance, 1)
                })

    cities_with_distance.sort(key=lambda x: x["distance"])
    return cities_with_distance[:limit]


def check_api_keys_configured() -> Dict[str, bool]:
    return {
        "ticketmaster": bool(TICKETMASTER_API_KEY),
        "seatgeek": bool(SEATGEEK_CLIENT_ID),
    }


def get_missing_api_keys() -> List[str]:
    missing = []
    if not TICKETMASTER_API_KEY:
        missing.append("TICKETMASTER_API_KEY")
    if not SEATGEEK_CLIENT_ID:
        missing.append("SEATGEEK_CLIENT_ID")
    return missing


def search_ticketmaster(artist: str, city: Optional[str] = None) -> List[Dict[str, Any]]:
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


def find_nearest_city_with_events(original_city: str, search_func, artist: str) -> Dict:
    results = search_func(artist, original_city)

    if results.get("total_results", 0) > 0:
        results["original_city"] = original_city
        return results

    nearby_cities = get_nearby_cities(original_city, max_distance=500, limit=8)

    for city_info in nearby_cities:
        city = city_info["city"]
        city_results = search_func(artist, city)

        if city_results.get("total_results", 0) > 0:
            city_results["original_city"] = original_city
            city_results["nearest_city"] = city
            city_results["city"] = city
            city_results["distance_miles"] = city_info["distance"]
            city_results["city_suggestion"] = f"No events found in {original_city}. Showing results from {city} ({city_info['distance']} miles away)."
            return city_results

    results_no_city = search_func(artist, None)
    results_no_city["original_city"] = original_city
    results_no_city["city"] = None
    if results_no_city.get("total_results", 0) > 0:
        results_no_city["city_suggestion"] = f"No events found near {original_city}. Showing all available events."
    else:
        results_no_city["city_suggestion"] = f"No events found for this artist."

    return results_no_city


@app.route("/api/search/tickets", methods=["GET"])
def search_tickets():
    artist = (request.args.get("artist") or "").strip()
    city = (request.args.get("city") or "").strip() or None

    if not artist:
        return jsonify({"ok": False, "error": "artist query param is required"}), 400

    if city:
        results = find_nearest_city_with_events(city, search_all_platforms, artist)
    else:
        results = search_all_platforms(artist, city)

    return jsonify({
        "ok": True,
        **results
    }), 200
