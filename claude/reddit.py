import httpx
import feedparser

async def fetch_hot_posts(subreddit: str) -> list[str]:
    url = f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        
        feed = feedparser.parse(response.text)
        titles = []
        for entry in feed.entries[:50]:
            titles.append(entry.title)
            
        return titles
