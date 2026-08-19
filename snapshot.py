"""snapshot.py – Fetch hot posts from sports subreddits via RSS and save as JSON."""

import json
import os
import time
import datetime
import httpx
import feedparser

SUBREDDITS = ["nfl", "nba", "baseball", "formula1", "soccer"]
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

MAX_RETRIES = 3
DELAY_BETWEEN = 5  # seconds between subreddits


def fetch_hot_posts_rss(subreddit: str) -> list[str]:
    """Synchronously fetch hot-post titles from a subreddit's RSS feed, with retries."""
    url = f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60"
    for attempt in range(1, MAX_RETRIES + 1):
        with httpx.Client(timeout=15.0) as client:
            response = client.get(url, headers=HEADERS)
            if response.status_code == 429:
                wait = 5 * attempt
                print(f"  Rate-limited on r/{subreddit}, waiting {wait}s (attempt {attempt}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue
            response.raise_for_status()

        feed = feedparser.parse(response.text)
        if feed.bozo and not feed.entries:
            raise ValueError(f"Invalid RSS data for r/{subreddit}")

        return [entry.title for entry in feed.entries[:50]]

    raise ValueError(f"Failed to fetch r/{subreddit} after {MAX_RETRIES} retries (rate-limited)")


def main():
    os.makedirs("data", exist_ok=True)
    fetched_at = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    for i, sub in enumerate(SUBREDDITS):
        if i > 0:
            print(f"  Waiting {DELAY_BETWEEN}s before next request...")
            time.sleep(DELAY_BETWEEN)
        try:
            titles = fetch_hot_posts_rss(sub)
            payload = {
                "subreddit": sub,
                "fetched_at": fetched_at,
                "titles": titles,
            }
            path = os.path.join("data", f"{sub}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
            print(f"Saved {len(titles)} posts for r/{sub}")
        except Exception as e:
            print(f"ERROR fetching r/{sub}: {e}")


if __name__ == "__main__":
    main()
