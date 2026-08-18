import { useState } from 'react';
import { Search } from 'lucide-react';

const TRENDING_TOPICS = ['nfl', 'nba', 'soccer', 'django', 'python'];

export default function HeroSearch({ onSearch, loading }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-8 mb-8 shadow-xl">
      <h1 className="text-4xl font-bold mb-4 text-sky-400">SportsOrca Fan Pulse</h1>
      <p className="text-slate-300 mb-6 text-lg">Analyze the current sentiment of any sports subreddit.</p>
      
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Enter subreddit name (e.g., nfl)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Vibe'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setInputValue('popular');
            onSearch('popular');
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          🔥 Trending Topics
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setInputValue(topic);
                onSearch(topic);
              }}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
