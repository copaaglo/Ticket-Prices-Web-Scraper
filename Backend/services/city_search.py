import math
from typing import Dict, List, Optional, Tuple

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
    """Calculate the distance between two points on Earth in miles."""
    R = 3959
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def get_city_coordinates(city_name: str) -> Optional[Tuple[float, float]]:
    """Get coordinates for a city name (case-insensitive)."""
    city_lower = city_name.lower().strip()
    for city, coords in MAJOR_CITIES.items():
        if city.lower() == city_lower:
            return coords
    for city, coords in MAJOR_CITIES.items():
        if city_lower in city.lower() or city.lower() in city_lower:
            return coords
    return None


def get_nearby_cities(city_name: str, max_distance: float = 500, limit: int = 5) -> List[Dict]:
    """Get nearby cities sorted by distance."""
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


def find_nearest_city_with_events(original_city: str, search_func, artist: str) -> Dict:
    """
    If no events in original city, search nearby cities.
    Returns results from the nearest city with events.
    """
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
