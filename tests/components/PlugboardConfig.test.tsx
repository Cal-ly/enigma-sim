import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlugboardConfig } from '../../src/components/simulator/PlugboardConfig';

describe('PlugboardConfig', () => {
  const defaultProps = {
    pairs: [] as [string, string][],
    onAddPair: vi.fn(),
    onRemovePair: vi.fn(),
  };

  it('shows pair count', () => {
    render(<PlugboardConfig {...defaultProps} />);
    expect(screen.getByText('Plugboard (0/13 pairs)')).toBeDefined();
  });

  it('shows passthrough message when no pairs', () => {
    render(<PlugboardConfig {...defaultProps} />);
    expect(screen.getByText('No pairs configured (passthrough)')).toBeDefined();
  });

  it('renders existing pairs', () => {
    render(<PlugboardConfig {...defaultProps} pairs={[['A', 'B'], ['C', 'D']]} />);
    expect(screen.getByText('A↔B')).toBeDefined();
    expect(screen.getByText('C↔D')).toBeDefined();
    expect(screen.getByText('Plugboard (2/13 pairs)')).toBeDefined();
  });

  it('calls onRemovePair when remove button is clicked', () => {
    const spy = vi.fn();
    render(<PlugboardConfig {...defaultProps} pairs={[['A', 'B']]} onRemovePair={spy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove pair A-B' }));
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('has add controls when under 13 pairs', () => {
    render(<PlugboardConfig {...defaultProps} />);
    expect(screen.getByLabelText('First letter')).toBeDefined();
    expect(screen.getByLabelText('Second letter')).toBeDefined();
  });

  it('add button is disabled when no letters selected', () => {
    render(<PlugboardConfig {...defaultProps} />);
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeDisabled();
  });

  it('calls onAddPair when valid pair is submitted', () => {
    const spy = vi.fn();
    render(<PlugboardConfig {...defaultProps} onAddPair={spy} />);

    fireEvent.change(screen.getByLabelText('First letter'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Second letter'), { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(spy).toHaveBeenCalledWith('A', 'B');
  });

  it('excludes already-used letters from select options', () => {
    const { container } = render(
      <PlugboardConfig {...defaultProps} pairs={[['A', 'B']]} />,
    );
    const selects = container.querySelectorAll('select');
    const firstOptions = Array.from(selects[0].options).map((o) => o.value).filter(Boolean);
    expect(firstOptions).not.toContain('A');
    expect(firstOptions).not.toContain('B');
    expect(firstOptions).toContain('C');
  });
});
