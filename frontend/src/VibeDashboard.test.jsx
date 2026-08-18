import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VibeDashboard from './components/VibeDashboard';

describe('VibeDashboard', () => {
  it('renders "Fanbase Hyped" when score > 0.05', () => {
    render(<VibeDashboard score={0.2} />);
    expect(screen.getByText('Fanbase Hyped')).toBeInTheDocument();
    expect(screen.getByText('0.200')).toBeInTheDocument();
  });

  it('renders "Fanbase Frustrated" when score < -0.05', () => {
    render(<VibeDashboard score={-0.1} />);
    expect(screen.getByText('Fanbase Frustrated')).toBeInTheDocument();
    expect(screen.getByText('-0.100')).toBeInTheDocument();
  });

  it('renders "Neutral" when score is between -0.05 and 0.05', () => {
    render(<VibeDashboard score={0.01} />);
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('0.010')).toBeInTheDocument();
  });
});
