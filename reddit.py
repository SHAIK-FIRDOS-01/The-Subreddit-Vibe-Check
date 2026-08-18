import httpx
import feedparser

async def fetch_hot_posts(subreddit: str) -> list[str]:
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
