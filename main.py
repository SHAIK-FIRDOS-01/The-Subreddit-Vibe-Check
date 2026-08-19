from fastapi import FastAPI, HTTPException
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import reddit

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SentimentIntensityAnalyzer()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/pulse/{subreddit}")
async def get_pulse(subreddit: str):
    try:
        result = await reddit.fetch_hot_posts(subreddit)
        titles = result["titles"]
        fetched_at = result.get("fetched_at")
    except ValueError as e:
        error_msg = str(e)
        # Cached-mode: missing file → 404; Live-mode: Reddit errors → 503
        if "No cached data" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg)
        raise HTTPException(status_code=503, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    if not titles:
        raise HTTPException(status_code=404, detail=f"No recent posts found in r/{subreddit}.")

    posts = []
    total_score = 0.0

    for title in titles:
        sentiment_score = analyzer.polarity_scores(title)["compound"]
        total_score += sentiment_score
        posts.append({
            "title": title,
            "sentiment_score": sentiment_score
        })

    aggregate_vibe_score = total_score / len(posts) if posts else 0.0

    response = {
        "subreddit": subreddit,
        "aggregate_vibe_score": aggregate_vibe_score,
        "posts": posts
    }

    # Include the snapshot timestamp so the frontend can show
    # "data as of ..." when serving cached data.
    if fetched_at is not None:
        response["fetched_at"] = fetched_at

    return response
