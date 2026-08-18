import { useState } from 'react';
import HeroSearch from './components/HeroSearch';
import VibeDashboard from './components/VibeDashboard';
import PostFeed from './components/PostFeed';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulseData, setPulseData] = useState(null);

  const fetchPulse = async (subreddit) => {
    setLoading(true);
    setError(null);
    setPulseData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/pulse/${subreddit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data for r/' + subreddit);
      }
      const data = await response.json();
      setPulseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <HeroSearch onSearch={fetchPulse} loading={loading} />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl mb-8 font-medium shadow-sm">
            {error}
          </div>
        )}

        {pulseData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <VibeDashboard score={pulseData.aggregate_vibe_score} />
            <PostFeed posts={pulseData.posts} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
