import pytest
from fastapi.testclient import TestClient
from pytest_httpx import HTTPXMock
from main import app

client = TestClient(app)

def test_get_pulse_success(httpx_mock: HTTPXMock):
    subreddit = "nba"
    mock_xml_response = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry><title>I love the NBA so much, it's amazing!</title></entry>
  <entry><title>This game is terrible and I hate the referees.</title></entry>
  <entry><title>Just a normal post.</title></entry>
</feed>"""
    
    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        text=mock_xml_response,
        match_headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    )
    
    response = client.get(f"/api/pulse/{subreddit}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["subreddit"] == "nba"
    assert "aggregate_vibe_score" in data
    assert isinstance(data["aggregate_vibe_score"], float)
    assert len(data["posts"]) == 3

def test_get_pulse_404(httpx_mock: HTTPXMock):
    subreddit = "nonexistent"
    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        status_code=404
    )
    
    response = client.get(f"/api/pulse/{subreddit}")
    assert response.status_code == 502
    assert response.json() == {"detail": "Subreddit 'r/nonexistent' not found."}

def test_get_pulse_empty_feed(httpx_mock: HTTPXMock):
    subreddit = "empty"
    mock_xml_response = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
</feed>"""
    
    httpx_mock.add_response(
        url=f"https://www.reddit.com/r/{subreddit}/hot.rss?limit=60",
        text=mock_xml_response
    )
    
    response = client.get(f"/api/pulse/{subreddit}")
    assert response.status_code == 404
    assert response.json() == {"detail": "No recent posts found in r/empty."}
