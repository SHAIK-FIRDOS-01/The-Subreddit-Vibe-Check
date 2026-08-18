import { useState } from 'react';
import HeroSearch from './components/HeroSearch';
import VibeDashboard from './components/VibeDashboard';
import PostFeed from './components/PostFeed';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulseData, setPulseData] = useState(null);

  const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Strip any trailing slash from the base URL safely
  const cleanBaseUrl = rawBaseUrl.replace(/\/$/, "");

  const fetchPulse = async (subreddit) => {
    setLoading(true);
    setError(null);

    try {
      // Construct the final URL perfectly
      const targetUrl = `${cleanBaseUrl}/api/pulse/${subreddit}`;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        let errorMessage = 'Failed to fetch data for r/' + subreddit;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          // Keep default message
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setPulseData(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Cannot connect to the backend server. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Compact Broadcast Header */}
      <header className="bg-surface border-b border-hairline sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-desktop py-2 max-w-container-max mx-auto h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">vital_signs</span>
              <span className="font-display-lg text-2xl text-primary tracking-wider leading-none translate-y-[2px]">THE SUBREDDIT VIBE CHECK</span>
            </div>
            <div className="divider-v w-px h-6 bg-outline-variant hidden lg:block"></div>
            <div className="hidden lg:flex items-center gap-2 font-label-caps text-label-caps text-on-surface">
              <div className="w-2 h-2 rounded-full bg-error breathing-dot"></div>
              LIVE FEED
            </div>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant font-label-caps text-[10px] uppercase tracking-wider">
            <span className="hidden md:inline-block border border-outline-variant px-2 py-1">Updated this session</span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-12 flex flex-col gap-12">
        <HeroSearch onSearch={fetchPulse} loading={loading} />

        {error && (
          <div className="p-4 border border-coral bg-surface-container-lowest flex flex-col gap-2">
            <p className="font-data-tabular text-sm text-coral leading-relaxed">
              SYS.ERROR: {error}
            </p>
          </div>
        )}

        {pulseData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <VibeDashboard score={pulseData.aggregate_vibe_score} posts={pulseData.posts} />
            <PostFeed posts={pulseData.posts} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface mt-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 flex justify-between items-center font-data-tabular text-xs text-outline-variant">
          <div>VIBE_CHECK_v2.4.1 // ENGINE: VADER // SOURCE: REDDIT RSS // TERMINAL_MODE: ON</div>
          <div>END OF STREAM</div>
        </div>
      </footer>
    </>
  );
}

export default App;
