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
        titles = await reddit.fetch_hot_posts(subreddit)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
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
    
    return {
        "subreddit": subreddit,
        "aggregate_vibe_score": aggregate_vibe_score,
        "posts": posts
    }
