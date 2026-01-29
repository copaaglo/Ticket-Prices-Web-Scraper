import os
import sys
import subprocess
from typing import Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Backend/
SCRAPER_DIR = os.path.join(BASE_DIR, "Scraper")
SCRAPER_MAIN = os.path.join(SCRAPER_DIR, "main.py")


def run_scraper(artist: str, timeout_sec: int = 180) -> Dict[str, Any]:
    """
    Runs Backend/Scraper/main.py using sys.executable (your active venv python).
    Your Scraper/main.py should POST results back to Flask (recommended),
    or you can later add CLI args and return stdout parsing.

    Returns stdout/stderr so you can debug from the API response.
    """
    if not os.path.exists(SCRAPER_MAIN):
        return {"ok": False, "error": f"Scraper not found at: {SCRAPER_MAIN}"}

    cmd = [sys.executable, SCRAPER_MAIN]

    try:
        proc = subprocess.run(
            cmd,
            cwd=SCRAPER_DIR,          # important so auth.json relative paths work
            capture_output=True,
            text=True,
            timeout=timeout_sec,
        )

        return {
            "ok": proc.returncode == 0,
            "returncode": proc.returncode,
            "artist": artist,
            "stdout": (proc.stdout or "")[-4000:],
            "stderr": (proc.stderr or "")[-4000:],
        }

    except subprocess.TimeoutExpired:
        return {"ok": False, "artist": artist, "error": f"Scraper timed out after {timeout_sec}s"}
    except Exception as e:
        return {"ok": False, "artist": artist, "error": repr(e)}
