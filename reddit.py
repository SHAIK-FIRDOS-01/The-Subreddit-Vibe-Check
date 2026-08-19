import os
import json
from pathlib import Path

import httpx
import feedparser


# ---------------------------------------------------------------------------
# Configuration: DATA_SOURCE controls which path is used at runtime.
#
#   DATA_SOURCE=live    → fetch_hot_posts_live  (RSS from Reddit)
#                         Use this for localhost demos where Reddit is reachable.
#
#   DATA_SOURCE=cached  → fetch_hot_posts_cached  (local JSON snapshots)
#                         Use this on Render / production where Reddit blocks
#                         datacenter IPs.  This is the DEFAULT if the env var
#                         is not set, so production is safe out of the box.
# ---------------------------------------------------------------------------
DATA_SOURCE: str = os.environ.get("DATA_SOURCE", "cached").lower()

# The 5 Quick Select subreddits that have pre-fetched JSON snapshots.
# Used by fetch_hot_posts_cached and exposed via /api/config.
CACHED_SUBREDDITS: list[str] = ["nfl", "nba", "baseball", "formula1", "soccer"]

# Resolve the data/ directory relative to this file so it works regardless
# of the working directory uvicorn is started from.
_DATA_DIR: Path = Path(__file__).resolve().parent / "data"



# ===================================================================
# LIVE (RSS) — used when DATA_SOURCE=live, works on localhost
# ===================================================================
# This is the original fetch function.  It hits Reddit's public RSS feed
# and parses the Atom XML via feedparser.  All logic, headers, parsing,
# and error handling are preserved exactly as they were.
# ===================================================================

async def fetch_hot_posts_live(subreddit: str) -> list[str]:
    """Fetch hot-post titles from Reddit's RSS feed (live network call)."""
    url = f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"Subreddit 'r/{subreddit}' not found.")
        raise ValueError(f"Reddit returned an error (status {e.response.status_code}).")
    except httpx.RequestError:
        raise ValueError("Failed to connect to Reddit.")

    feed = feedparser.parse(response.text)
    if feed.bozo and not feed.entries:
        raise ValueError("Received invalid data from Reddit.")

    titles = []
    for entry in feed.entries[:50]:
        titles.append(entry.title)

    return titles


# ===================================================================
# CACHED — used when DATA_SOURCE=cached, default for production/Render
# ===================================================================
# Reads from pre-fetched JSON snapshot files in the data/ directory.
# Each file is shaped as:
#   { "subreddit": "nfl", "fetched_at": "...", "titles": [...] }
#
# Only the 5 Quick Select subreddits have cached data:
#   nfl, nba, baseball, formula1, soccer
# Requests for any other subreddit will raise a clear ValueError.
# ===================================================================

async def fetch_hot_posts_cached(subreddit: str) -> dict:
    """Load post titles from a local JSON snapshot file.

    Returns a dict with 'titles' (list[str]) and 'fetched_at' (str)
    so callers can surface the snapshot timestamp if needed.
    """
    filepath = _DATA_DIR / f"{subreddit}.json"

    if not filepath.is_file():
        raise ValueError(
            f"No cached data for r/{subreddit}. "
            f"Cached data is only available for the Quick Select subreddits "
            f"(nfl, nba, baseball, formula1, soccer)."
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        raise ValueError(f"Failed to read cached data for r/{subreddit}: {e}")

    titles = data.get("titles", [])
    if not titles:
        raise ValueError(f"Cached data for r/{subreddit} contains no titles.")

    return {
        "titles": titles,
        "fetched_at": data.get("fetched_at"),
    }


# ===================================================================
# UNIFIED DISPATCHER — called by main.py route handlers
# ===================================================================
# This is the single entry point that route handlers should call.
# It checks DATA_SOURCE and dispatches to the live or cached function.
# ===================================================================

async def fetch_hot_posts(subreddit: str) -> dict:
    """Fetch hot-post titles using the active data source.

    Returns a dict with:
      - 'titles': list[str]   — the post titles
      - 'fetched_at': str | None — snapshot timestamp (cached mode only)

    Raises ValueError with a human-readable message on any failure.
    """
    if DATA_SOURCE == "live":
        # Live RSS mode — returns a plain list, so we wrap it to match
        # the unified return shape.
        titles = await fetch_hot_posts_live(subreddit)
        return {"titles": titles, "fetched_at": None}
    else:
        # Cached mode (default) — returns dict with titles + fetched_at.
        return await fetch_hot_posts_cached(subreddit)
