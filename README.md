# The Subreddit Vibe Check

A dashboard for checking the real-time sentiment and vibe of any subreddit community.

## Live Demo

[View Live Demo](#)  
*Note: The hosted version runs in **cached mode** and only supports 5 specific subreddits. See [Data Modes](#data-modes) below for details.*

## Running Locally (Live Mode)

Follow these steps to run the project locally with live Reddit data, allowing you to search for **any** subreddit.

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Setup the Backend
Clone the repository and install the Python dependencies:

```bash
# Install backend dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Open the `.env` file and set the data source to live:
```env
DATA_SOURCE=live
```
*Setting `DATA_SOURCE=live` is what enables real-time fetching from Reddit via RSS instead of relying on the local cached snapshots.*

### 3. Setup the Frontend
Navigate to the frontend directory and install the Node dependencies:

```bash
cd frontend
npm install
```

### 4. Start the Servers
Start the FastAPI backend (from the project root):
```bash
python -m uvicorn main:app --reload
```

Start the Vite frontend development server (from the `frontend` directory):
```bash
npm run dev
```

Open your browser to **http://localhost:5173/**. You should now be able to search for any valid subreddit in the search bar and get live sentiment data!

## Data Modes

This project supports two data-fetching modes to handle API restrictions:

- **`live` mode (Local)**: Fetches real-time data from Reddit's RSS/`.json` endpoints. This works well on local/residential networks and is intended for local development.
- **`cached` mode (Deployed)**: Serves pre-saved JSON snapshots from the `data/` folder. This is used in the hosted/deployed version (Render + Vercel).

**Why the split?**  
Reddit closed self-service OAuth and API registration for new developers in November 2025 under their [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy). Additionally, Reddit heavily rate-limits and blocks anonymous requests originating from datacenter IPs like Render. To ensure the deployed version remains functional without valid OAuth credentials, the hosted backend falls back to using cached snapshot data.

**Cached Subreddits**  
When running in `cached` mode, only the following 5 subreddits are available:
- `nfl`
- `nba`
- `baseball`
- `formula1`
- `soccer`

## Environment Variables

| Variable | Location | Description | Required/Example |
|----------|----------|-------------|------------------|
| `DATA_SOURCE` | Root `.env` | Controls the backend fetching mode (`live` or `cached`). Defaults to `cached`. | `live` (for local development) |
| `VITE_API_URL` | Frontend `.env` | Overrides the backend API URL for the frontend. | Optional. Defaults to `http://localhost:8000` |

## Project Structure

- `main.py` - The FastAPI backend entry point and API routes.
- `reddit.py` - Core logic for live RSS fetching and loading cached snapshots.
- `data/` - Pre-saved JSON snapshots for the 5 supported subreddits (used in deployed mode).
- `frontend/` - The React + Vite frontend application.
- `requirements.txt` - Python backend dependencies.

## Tech Stack

**Backend**
- Python (FastAPI, Uvicorn)
- VADER Sentiment (`vaderSentiment`)
- Feedparser (`feedparser`)

**Frontend**
- React 19
- Vite 8
- Tailwind CSS 3
- Lucide React
