import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Error Handling', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('handles a successful request and preserves it across subsequent requests until success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        subreddit: 'nba',
        aggregate_vibe_score: 0.5,
        posts: [{ title: 'Great game', sentiment_score: 0.5 }]
      })
    });

    render(<App />);
    
    // Search 'nba'
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze Vibe/i }));

    await waitFor(() => {
      expect(screen.getByText('Great game')).toBeInTheDocument();
    });

    // Mock a failure for the next request
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Subreddit 'r/invalid' not found." })
    });

    // Search 'invalid'
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze Vibe/i }));

    // The previous successful result should STILL be preserved, and the new error should appear
    await waitFor(() => {
      expect(screen.getByText("Subreddit 'r/invalid' not found.")).toBeInTheDocument();
      expect(screen.getByText('Great game')).toBeInTheDocument();
    });
  });

  it('shows friendly message when backend is unavailable (network error)', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    render(<App />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze Vibe/i }));

    await waitFor(() => {
      expect(screen.getByText('Cannot connect to the backend server. Please try again later.')).toBeInTheDocument();
    });
  });

  it('shows friendly message when RSS upstream fails (502 from backend)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Failed to connect to Reddit." })
    });

    render(<App />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze Vibe/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Reddit.')).toBeInTheDocument();
    });
  });

  it('shows friendly message for empty feed (404 from backend)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "No recent posts found in r/empty." })
    });

    render(<App />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'empty' } });
    fireEvent.click(screen.getByRole('button', { name: /Analyze Vibe/i }));

    await waitFor(() => {
      expect(screen.getByText('No recent posts found in r/empty.')).toBeInTheDocument();
    });
  });

  it('shows loading state and prevents duplicate submissions', async () => {
    // Return a promise that doesn't resolve immediately to keep it in loading state
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    global.fetch.mockReturnValueOnce(fetchPromise);

    render(<App />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter subreddit/i), { target: { value: 'nba' } });
    const button = screen.getByRole('button', { name: /Analyze Vibe/i });
    
    fireEvent.click(button);
    
    // It should go into loading state
    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Analyzing...');
    });
    
    // Clicking again should not trigger another fetch because button is disabled
    fireEvent.click(button);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Resolve the promise to clean up
    resolveFetch({
      ok: true,
      json: async () => ({ subreddit: 'nba', aggregate_vibe_score: 0, posts: [] })
    });
  });
});
