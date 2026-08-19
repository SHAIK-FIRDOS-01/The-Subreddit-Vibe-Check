import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Helper: create a mock fetch that handles /api/config and any other calls.
function createMockFetch({ dataSource = 'live', availableSubreddits = null, responses = [] } = {}) {
  const configPayload = { data_source: dataSource };
  if (dataSource === 'cached' && availableSubreddits) {
    configPayload.available_subreddits = availableSubreddits;
  }

  let callIndex = 0;
  return vi.fn((url) => {
    if (typeof url === 'string' && url.includes('/api/config')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(configPayload) });
    }
    const resp = responses[callIndex++];
    if (resp instanceof Error) return Promise.reject(resp);
    if (resp && typeof resp.then === 'function') return resp;
    return Promise.resolve(resp);
  });
}

describe('App Error Handling', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('handles a successful request and preserves it across subsequent requests until success', async () => {
    global.fetch = createMockFetch({
      dataSource: 'live',
      responses: [
        {
          ok: true,
          json: () => Promise.resolve({
            subreddit: 'nba',
            aggregate_vibe_score: 0.5,
            posts: [{ title: 'Great game', sentiment_score: 0.5 }]
          })
        },
        {
          ok: false,
          json: () => Promise.resolve({ detail: "Subreddit 'r/invalid' not found." })
        }
      ]
    });

    await act(async () => { render(<App />); });

    // Search 'nba'
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/Great game/)[0]).toBeInTheDocument();

    // Search 'invalid' — previous results should persist
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'invalid' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/Subreddit 'r\/invalid' not found\./)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Great game/)[0]).toBeInTheDocument();
  });

  it('shows friendly message when backend is unavailable (network error)', async () => {
    global.fetch = createMockFetch({
      dataSource: 'live',
      responses: [new TypeError('Failed to fetch')]
    });

    await act(async () => { render(<App />); });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/Cannot connect to the backend server\. Please try again later\./)[0]).toBeInTheDocument();
  });

  it('shows friendly message when RSS upstream fails (503 from backend)', async () => {
    global.fetch = createMockFetch({
      dataSource: 'live',
      responses: [{
        ok: false,
        json: () => Promise.resolve({ detail: "Failed to connect to Reddit." })
      }]
    });

    await act(async () => { render(<App />); });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/Failed to connect to Reddit\./)[0]).toBeInTheDocument();
  });

  it('shows friendly message for empty feed (404 from backend)', async () => {
    global.fetch = createMockFetch({
      dataSource: 'live',
      responses: [{
        ok: false,
        json: () => Promise.resolve({ detail: "No recent posts found in r/empty." })
      }]
    });

    await act(async () => { render(<App />); });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'empty' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/No recent posts found in r\/empty\./)[0]).toBeInTheDocument();
  });

  it('shows loading state and prevents duplicate submissions', async () => {
    let resolveFetch;
    const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });

    global.fetch = createMockFetch({
      dataSource: 'live',
      responses: [fetchPromise]
    });

    await act(async () => { render(<App />); });

    const button = screen.getByRole('button', { name: /CHECK THE VIBE/i });
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(/ANALYZING/i);
    });

    fireEvent.click(button);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveFetch({ ok: true, json: () => Promise.resolve({ subreddit: 'nba', aggregate_vibe_score: 0, posts: [] }) });
    });
  });

  it('shows cached-mode limitation message for uncached subreddit', async () => {
    global.fetch = createMockFetch({
      dataSource: 'cached',
      availableSubreddits: ['nfl', 'nba', 'baseball', 'formula1', 'soccer'],
      responses: []
    });

    await act(async () => { render(<App />); });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'technology' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getByText(/Live data currently available for/)).toBeInTheDocument();

    const pulseCalls = global.fetch.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/pulse/')
    );
    expect(pulseCalls).toHaveLength(0);
  });

  it('allows cached subreddit search in cached mode', async () => {
    global.fetch = createMockFetch({
      dataSource: 'cached',
      availableSubreddits: ['nfl', 'nba', 'baseball', 'formula1', 'soccer'],
      responses: [{
        ok: true,
        json: () => Promise.resolve({
          subreddit: 'nfl',
          aggregate_vibe_score: 0.1,
          posts: [{ title: 'NFL Post', sentiment_score: 0.1 }],
          fetched_at: '2026-08-19T13:39:18Z'
        })
      }]
    });

    await act(async () => { render(<App />); });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nfl' } });
      fireEvent.click(screen.getByRole('button', { name: /CHECK THE VIBE/i }));
    });
    expect(screen.getAllByText(/NFL Post/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/Live data currently available for/)).not.toBeInTheDocument();
  });
});
