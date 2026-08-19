import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VibeDashboard from './components/VibeDashboard';

describe('VibeDashboard', () => {
  it('renders "FANBASE HYPED" when score > 0.05', () => {
    render(<VibeDashboard score={0.2} />);
    expect(screen.getByText('FANBASE HYPED')).toBeInTheDocument();
    expect(screen.getByText('+0.200')).toBeInTheDocument();
  });

  it('renders "FANBASE FRUSTRATED" when score < -0.05', () => {
    render(<VibeDashboard score={-0.1} />);
    expect(screen.getByText('FANBASE FRUSTRATED')).toBeInTheDocument();
    expect(screen.getByText('-0.100')).toBeInTheDocument();
  });

  it('renders "NEUTRAL" when score is between -0.05 and 0.05', () => {
    render(<VibeDashboard score={0.01} />);
    // "NEUTRAL" appears in multiple places (badge, gauge label, signal mix row),
    // so verify at least one instance exists.
    const neutralElements = screen.getAllByText('NEUTRAL');
    expect(neutralElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+0.010')).toBeInTheDocument();
  });
});
