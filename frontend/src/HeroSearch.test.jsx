import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSearch from './components/HeroSearch';

describe('HeroSearch', () => {
  it('renders correctly and has input field', () => {
    render(<HeroSearch onSearch={vi.fn()} loading={false} />);
    expect(screen.getByPlaceholderText(/Enter subreddit name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Vibe/i })).toBeInTheDocument();
  });

  it('calls onSearch when a quick beat is clicked', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const nflButton = screen.getByRole('button', { name: 'r/nfl' });
    fireEvent.click(nflButton);
    expect(mockOnSearch).toHaveBeenCalledWith('nfl');
  });

  it('submits correctly when input is "nfl"', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Enter subreddit name/i);
    fireEvent.change(input, { target: { value: 'nfl' } });
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Vibe/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnSearch).toHaveBeenCalledWith('nfl');
  });

  it('strips leading r/ and submits correctly when input is "r/nfl"', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Enter subreddit name/i);
    fireEvent.change(input, { target: { value: 'r/nfl' } });
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Vibe/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnSearch).toHaveBeenCalledWith('nfl');
  });

  it('trims whitespace and submits correctly when input is " nfl "', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Enter subreddit name/i);
    fireEvent.change(input, { target: { value: ' nfl ' } });
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Vibe/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnSearch).toHaveBeenCalledWith('nfl');
  });

  it('rejects empty input with an inline error', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Vibe/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/Please enter a subreddit name/i)).toBeInTheDocument();
  });

  it('rejects invalid input like "not a valid subreddit!"', () => {
    const mockOnSearch = vi.fn();
    render(<HeroSearch onSearch={mockOnSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Enter subreddit name/i);
    fireEvent.change(input, { target: { value: 'not a valid subreddit!' } });
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Vibe/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/Invalid subreddit name/i)).toBeInTheDocument();
  });
});
