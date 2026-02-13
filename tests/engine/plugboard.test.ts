import { describe, it, expect } from 'vitest';
import { Plugboard } from '../../src/engine/plugboard';
import { letterToIndex, indexToLetter } from '../../src/engine/constants';

describe('Plugboard', () => {
  describe('with no pairs (passthrough)', () => {
    const plugboard = new Plugboard([]);

    it('every letter maps to itself', () => {
      for (let i = 0; i < 26; i++) {
        expect(plugboard.swap(i)).toBe(i);
      }
    });
  });

  describe('with one pair', () => {
    const plugboard = new Plugboard([['A', 'B']]);

    it('A swaps to B', () => {
      expect(indexToLetter(plugboard.swap(letterToIndex('A')))).toBe('B');
    });

    it('B swaps to A', () => {
      expect(indexToLetter(plugboard.swap(letterToIndex('B')))).toBe('A');
    });

    it('unpaired letter C passes through unchanged', () => {
      expect(indexToLetter(plugboard.swap(letterToIndex('C')))).toBe('C');
    });
  });

  describe('with multiple pairs', () => {
    const plugboard = new Plugboard([['A', 'Z'], ['B', 'Y'], ['C', 'X']]);

    it('swaps are symmetric', () => {
      expect(indexToLetter(plugboard.swap(letterToIndex('A')))).toBe('Z');
      expect(indexToLetter(plugboard.swap(letterToIndex('Z')))).toBe('A');
      expect(indexToLetter(plugboard.swap(letterToIndex('B')))).toBe('Y');
      expect(indexToLetter(plugboard.swap(letterToIndex('Y')))).toBe('B');
    });

    it('unpaired letters pass through', () => {
      expect(indexToLetter(plugboard.swap(letterToIndex('D')))).toBe('D');
      expect(indexToLetter(plugboard.swap(letterToIndex('M')))).toBe('M');
    });
  });

  describe('with maximum 13 pairs', () => {
    const pairs: [string, string][] = [
      ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'],
      ['I', 'J'], ['K', 'L'], ['M', 'N'], ['O', 'P'],
      ['Q', 'R'], ['S', 'T'], ['U', 'V'], ['W', 'X'],
      ['Y', 'Z'],
    ];
    const plugboard = new Plugboard(pairs);

    it('all 26 letters are swapped', () => {
      for (let i = 0; i < 26; i++) {
        expect(plugboard.swap(i)).not.toBe(i);
      }
    });

    it('all swaps are symmetric', () => {
      for (let i = 0; i < 26; i++) {
        const swapped = plugboard.swap(i);
        expect(plugboard.swap(swapped)).toBe(i);
      }
    });
  });

  describe('validation', () => {
    it('rejects more than 13 pairs', () => {
      const pairs: [string, string][] = Array.from({ length: 14 }, (_, i) => {
        const a = String.fromCharCode(65 + i * 2);
        const b = String.fromCharCode(66 + i * 2);
        return [a, b] as [string, string];
      });
      // This would use letters A–BB, but we only have 26 letters and 14 pairs = 28
      // So we just need >13 pairs — the first 14 are enough to trigger the error
      expect(() => new Plugboard(pairs)).toThrow('cannot have more than 13 pairs');
    });

    it('rejects self-pairing', () => {
      expect(() => new Plugboard([['A', 'A']])).toThrow('cannot map a letter to itself');
    });

    it('rejects duplicate letter in first position', () => {
      expect(() => new Plugboard([['A', 'B'], ['A', 'C']])).toThrow('used in multiple');
    });

    it('rejects duplicate letter in second position', () => {
      expect(() => new Plugboard([['A', 'B'], ['C', 'B']])).toThrow('used in multiple');
    });

    it('rejects letter used in both positions across pairs', () => {
      expect(() => new Plugboard([['A', 'B'], ['C', 'A']])).toThrow('used in multiple');
    });
  });
});
