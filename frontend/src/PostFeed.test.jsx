import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PostFeed from './components/PostFeed';

describe('PostFeed', () => {
  it('renders nothing if no posts are provided', () => {
    const { container } = render(<PostFeed posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a list of posts with their scores', () => {
    const mockPosts = [
      { title: 'Great game tonight!', sentiment_score: 0.8 },
      { title: 'Terrible refereeing', sentiment_score: -0.6 }
    ];
    render(<PostFeed posts={mockPosts} />);
    
    expect(screen.getByText('Great game tonight!')).toBeInTheDocument();
    expect(screen.getByText('Terrible refereeing')).toBeInTheDocument();
    
    // Check if formatted scores are displayed
    expect(screen.getByText('+0.800')).toBeInTheDocument();
    expect(screen.getByText('-0.600')).toBeInTheDocument();
  });
});
