import pytest
from pytest_httpx import HTTPXMock
import httpx
from reddit import fetch_hot_posts_live


@pytest.mark.asyncio
async def test_fetch_hot_posts_success(httpx_mock: HTTPXMock):
    subreddit = "nba"
    mock_xml_response = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry><title>Post 1</title></entry>
  <entry><title>Post 2</title></entry>
</feed>"""

    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        text=mock_xml_response,
        match_headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    )

    result = await fetch_hot_posts_live(subreddit)
    assert result == ["Post 1", "Post 2"]

@pytest.mark.asyncio
async def test_fetch_hot_posts_404(httpx_mock: HTTPXMock):
    subreddit = "nonexistent"
    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        status_code=404
    )
    with pytest.raises(ValueError, match="Subreddit 'r/nonexistent' not found."):
        await fetch_hot_posts_live(subreddit)

@pytest.mark.asyncio
async def test_fetch_hot_posts_error(httpx_mock: HTTPXMock):
    subreddit = "nba"
    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        status_code=500
    )
    with pytest.raises(ValueError, match="Reddit returned an error \\(status 500\\)."):
        await fetch_hot_posts_live(subreddit)

@pytest.mark.asyncio
async def test_fetch_hot_posts_network_error(httpx_mock: HTTPXMock):
    subreddit = "nba"
    httpx_mock.add_exception(httpx.RequestError("Network error"))
    with pytest.raises(ValueError, match="Failed to connect to Reddit."):
        await fetch_hot_posts_live(subreddit)
