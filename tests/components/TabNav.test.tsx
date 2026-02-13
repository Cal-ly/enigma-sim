import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabNav } from '../../src/components/layout/TabNav';

describe('TabNav', () => {
  const defaultProps = {
    activeTab: 'simulator' as const,
    onTabChange: vi.fn(),
  };

  it('renders three tab buttons', () => {
    render(<TabNav {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'Simulator' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'How It Works' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'History' })).toBeDefined();
  });

  it('marks the active tab as selected', () => {
    render(<TabNav {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'Simulator' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'How It Works' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const spy = vi.fn();
    render(<TabNav {...defaultProps} onTabChange={spy} />);
    fireEvent.click(screen.getByRole('tab', { name: 'How It Works' }));
    expect(spy).toHaveBeenCalledWith('tutorial');
  });

  it('has proper ARIA attributes', () => {
    render(<TabNav {...defaultProps} />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeDefined();

    const simTab = screen.getByRole('tab', { name: 'Simulator' });
    expect(simTab).toHaveAttribute('id', 'tab-simulator');
    expect(simTab).toHaveAttribute('aria-controls', 'tabpanel-simulator');
  });

  it('active tab has tabIndex 0, others have -1', () => {
    render(<TabNav {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'Simulator' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'How It Works' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('tabindex', '-1');
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves to next tab', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="simulator" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      expect(spy).toHaveBeenCalledWith('tutorial');
    });

    it('ArrowLeft moves to previous tab', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="tutorial" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      expect(spy).toHaveBeenCalledWith('simulator');
    });

    it('ArrowRight wraps from last to first', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="history" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      expect(spy).toHaveBeenCalledWith('simulator');
    });

    it('ArrowLeft wraps from first to last', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="simulator" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      expect(spy).toHaveBeenCalledWith('history');
    });

    it('Home moves to first tab', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="history" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'Home' });
      expect(spy).toHaveBeenCalledWith('simulator');
    });

    it('End moves to last tab', () => {
      const spy = vi.fn();
      render(<TabNav activeTab="simulator" onTabChange={spy} />);
      const tablist = screen.getByRole('tablist');
      fireEvent.keyDown(tablist, { key: 'End' });
      expect(spy).toHaveBeenCalledWith('history');
    });
  });
});
