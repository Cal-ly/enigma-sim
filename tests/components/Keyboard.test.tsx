import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keyboard } from '../../src/components/simulator/Keyboard';

describe('Keyboard', () => {
  it('renders all 26 letter keys', () => {
    render(<Keyboard onKeyPress={() => {}} />);
    for (const ch of 'QWERTZUIOASDFGHJKPYXCVBNML') {
      expect(screen.getByRole('button', { name: `Key ${ch}` })).toBeDefined();
    }
  });

  it('calls onKeyPress when a key button is clicked', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Key A' }));
    expect(spy).toHaveBeenCalledWith('A');
  });

  it('responds to physical keyboard A-Z keypresses', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} />);
    fireEvent.keyDown(window, { key: 'g' });
    expect(spy).toHaveBeenCalledWith('G');
  });

  it('ignores keypresses when disabled', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} disabled />);
    fireEvent.keyDown(window, { key: 'a' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores keypresses with modifier keys', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} />);
    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'a', metaKey: true });
    fireEvent.keyDown(window, { key: 'a', altKey: true });
    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores non-letter keypresses', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} />);
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: ' ' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not capture keys when an input element is focused', () => {
    const spy = vi.fn();
    const { container } = render(
      <div>
        <input type="text" data-testid="my-input" />
        <Keyboard onKeyPress={spy} />
      </div>,
    );
    const input = container.querySelector('input')!;
    input.focus();
    fireEvent.keyDown(window, { key: 'a' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not capture keys when a select element is focused', () => {
    const spy = vi.fn();
    const { container } = render(
      <div>
        <select data-testid="my-select"><option>A</option></select>
        <Keyboard onKeyPress={spy} />
      </div>,
    );
    const select = container.querySelector('select')!;
    select.focus();
    fireEvent.keyDown(window, { key: 'a' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('disables button clicks when disabled', () => {
    const spy = vi.fn();
    render(<Keyboard onKeyPress={spy} disabled />);
    const btn = screen.getByRole('button', { name: 'Key A' });
    fireEvent.click(btn);
    expect(spy).not.toHaveBeenCalled();
  });
});
