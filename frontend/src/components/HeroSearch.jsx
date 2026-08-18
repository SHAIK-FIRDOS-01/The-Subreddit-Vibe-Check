import { useState } from 'react';

const TRENDING_TOPICS = ['nfl', 'nba', 'baseball', 'formula1', 'soccer'];

export default function HeroSearch({ onSearch, loading }) {
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    let cleaned = inputValue.trim();
    if (!cleaned) {
      setErrorMsg('Please enter a subreddit name.');
      return;
    }
    
    if (cleaned.toLowerCase().startsWith('r/')) {
      cleaned = cleaned.substring(2);
    }

    const validSubredditRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validSubredditRegex.test(cleaned)) {
      setErrorMsg('Invalid subreddit name. Use only letters, numbers, underscores, and hyphens.');
      return;
    }

    setErrorMsg('');
    onSearch(cleaned);
  };

  return (
    <section className="flex flex-col gap-8 w-full border-b border-hairline pb-12">
      <div className="flex flex-col gap-2">
        <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">FAN CULTURE INTELLIGENCE</span>
        <h1 className="font-display-lg text-headline-lg text-on-surface uppercase tracking-wide">What is the fanbase feeling right now?</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start w-full max-w-4xl">
        <form onSubmit={handleSubmit} className={`relative w-full flex-grow flex group ${errorMsg ? 'search-error' : 'search-focused'}`}>
          <div className="flex items-center justify-center bg-surface-container-low border border-r-0 border-hairline px-4 text-on-surface-variant font-data-tabular">
            <span className="material-symbols-outlined text-sm">search</span>
          </div>
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant font-data-tabular pointer-events-none">r/</span>
            <input
              type="text"
              className="w-full bg-surface-container-low border-y border-hairline text-on-surface pl-8 pr-4 py-3 focus:outline-none transition-colors font-data-tabular placeholder:text-outline-variant"
              placeholder="Enter subreddit..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrorMsg('');
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase border border-primary hover:bg-primary-fixed-dim transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ANALYZING...' : 'CHECK THE VIBE'}
          </button>
        </form>

        <div className="flex flex-col justify-center gap-2">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Quick Select</span>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setInputValue(topic);
                  setErrorMsg('');
                  onSearch(topic);
                }}
                disabled={loading}
                className="px-3 py-1 bg-surface border border-hairline text-on-surface-variant font-data-tabular text-xs hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                [r/{topic}]
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {errorMsg && (
        <p className="text-coral text-sm mt-[-1rem]">{errorMsg}</p>
      )}
    </section>
  );
}
