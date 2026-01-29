import asyncio
import json
import os
from typing import Dict, List, Any, Optional, Tuple

from playwright.async_api import async_playwright
from requests import post

# Provider modules (these should return a list of dicts with at least:
# { "name": str, "price": number/str, "url": str, "source": str(optional) }
from ticketmaster import search_tickets as ticketmaster_search
from seatgeek import search_tickets as seatgeek_search
from gametime import search_tickets as gametime_search


# -------------------------
# Config
# -------------------------

DEFAULT_ARTIST = "Calvin Harris"
SEARCH_TEXT_DEFAULT = f"{DEFAULT_ARTIST} tickets"

SOURCES = {
    "ticketmaster": {
        "base_url": "https://www.ticketmaster.com/",
        "search_func": ticketmaster_search,
    },
    "seatgeek": {
        "base_url": "https://seatgeek.com/",
        "search_func": seatgeek_search,
    },
    "gametime": {
        "base_url": "https://gametime.co/",
        "search_func": gametime_search,
    },
}

BACKEND_BASE_URL = "http://localhost:5000"  # Flask runs here
# change if your Flask route differs
DEFAULT_POST_ENDPOINT = "/api/results/tickets"


def load_auth() -> Dict[str, str]:
    """
    Loads Bright Data (or your remote browser) credentials.
    Expects Backend/Scraper/auth.json with keys: username, password, host
    """
    file_path = os.path.join(os.path.dirname(__file__), "auth.json")
    with open(file_path, "r") as f:
        return json.load(f)


def safe_price(value: Any) -> Optional[float]:
    """
    Attempts to normalize different price formats into a float.
    Examples: 120, "120", "$120.50", "CA$ 120", None -> float or None
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        s = value.strip()
        # keep digits + decimal point
        cleaned = "".join(ch for ch in s if ch.isdigit() or ch == ".")
        if cleaned == "":
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None

    return None


def is_artist_match(listing_name: str, artist: str) -> bool:
    """
    Simple match: case-insensitive contains.
    You can tighten this later if needed.
    """
    if not listing_name:
        return False
    return artist.lower() in listing_name.lower()


def cheapest_listing(results: List[Dict[str, Any]], artist: str) -> Optional[Dict[str, Any]]:
    """
    Filters results to the artist and returns the cheapest listing dict (adds _price_num).
    """
    candidates: List[Tuple[float, Dict[str, Any]]] = []

    for item in results or []:
        name = item.get("name") or item.get("event_name") or ""
        if not is_artist_match(name, artist):
            continue

        p = safe_price(item.get("price"))
        if p is None:
            continue

        item["_price_num"] = p
        candidates.append((p, item))

    if not candidates:
        return None

    candidates.sort(key=lambda x: x[0])
    return candidates[0][1]


def post_results(payload: Dict[str, Any], endpoint: str):
    headers = {"Content-Type": "application/json"}
    print(f"Sending request to {BACKEND_BASE_URL}{endpoint}")
    response = post(BACKEND_BASE_URL + endpoint, headers=headers, json=payload)
    print("Status code:", response.status_code)


async def run_provider(pw, browser_url: str, provider_key: str, search_text: str) -> List[Dict[str, Any]]:
    """
    Runs a single provider search in its own page context.
    Provider modules must return a list of listing dicts.
    """
    provider = SOURCES[provider_key]
    base_url = provider["base_url"]
    search_func = provider["search_func"]

    print(f"[{provider_key}] Connecting browser page...")
    browser = await pw.chromium.connect_over_cdp(browser_url)
    context = await browser.new_context()
    page = await context.new_page()

    try:
        print(f"[{provider_key}] Opening {base_url}")
        await page.goto(base_url, timeout=120000)
        await page.wait_for_load_state("networkidle")

        print(f"[{provider_key}] Searching for: {search_text}")
        results = await search_func(page, search_text)

        print(f"[{provider_key}] Found {len(results)} raw results")
        return results

    finally:
        await context.close()
        await browser.close()


async def main(
    artist: str = DEFAULT_ARTIST,
    search_text: str = SEARCH_TEXT_DEFAULT,
    response_route: str = DEFAULT_POST_ENDPOINT,
):
    """
    Runs all providers, computes cheapest per provider + overall, and posts summary.
    """
    cred = load_auth()
    auth = f'{cred["username"]}:{cred["password"]}'
    browser_url = f'wss://{auth}@{cred["host"]}'

    async with async_playwright() as pw:
        tasks = []
        provider_keys = list(SOURCES.keys())

        for provider_key in provider_keys:
            tasks.append(run_provider(
                pw, browser_url, provider_key, search_text))

        all_results = await asyncio.gather(*tasks, return_exceptions=True)

        cheapest_by_source: Dict[str, Any] = {}
        overall_candidates: List[Tuple[float, Dict[str, Any]]] = []

        for provider_key, result in zip(provider_keys, all_results):
            if isinstance(result, Exception):
                print(f"[{provider_key}] ERROR:", repr(result))
                cheapest_by_source[provider_key] = {"error": str(result)}
                continue

            cheapest = cheapest_listing(result, artist)
            if not cheapest:
                cheapest_by_source[provider_key] = None
                continue

            # add source tag if missing
            cheapest.setdefault("source", provider_key)

            cheapest_by_source[provider_key] = {
                "name": cheapest.get("name") or cheapest.get("event_name"),
                "price": cheapest.get("price"),
                "price_num": cheapest.get("_price_num"),
                "url": cheapest.get("url"),
                "source": cheapest.get("source", provider_key),
            }
            overall_candidates.append((cheapest["_price_num"], cheapest))

        overall_cheapest = None
        if overall_candidates:
            overall_candidates.sort(key=lambda x: x[0])
            best = overall_candidates[0][1]
            overall_cheapest = {
                "name": best.get("name") or best.get("event_name"),
                "price": best.get("price"),
                "price_num": best.get("_price_num"),
                "url": best.get("url"),
                "source": best.get("source"),
            }

        payload = {
            "artist": artist,
            "search_text": search_text,
            "cheapest_by_source": cheapest_by_source,
            "overall_cheapest": overall_cheapest,
        }

        post_results(payload, response_route)


if __name__ == "__main__":
    asyncio.run(main())
