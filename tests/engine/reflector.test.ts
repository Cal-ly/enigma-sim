import { describe, it, expect } from 'vitest';
import { Reflector } from '../../src/engine/reflector';
import { letterToIndex, indexToLetter } from '../../src/engine/constants';

describe('Reflector', () => {
  describe('UKW-B', () => {
    const reflector = new Reflector('UKW-B');

    it('A reflects to Y', () => {
      // UKW-B wiring: YRUHQSLDPXNGOKMIEBFZCWVJAT
      expect(indexToLetter(reflector.reflect(letterToIndex('A')))).toBe('Y');
    });

    it('Y reflects back to A (symmetry)', () => {
      expect(indexToLetter(reflector.reflect(letterToIndex('Y')))).toBe('A');
    });

    it('is fully symmetric: reflect(reflect(x)) == x for all letters', () => {
      for (let i = 0; i < 26; i++) {
        const reflected = reflector.reflect(i);
        const doubleReflected = reflector.reflect(reflected);
        expect(doubleReflected).toBe(i);
      }
    });

    it('no letter maps to itself', () => {
      for (let i = 0; i < 26; i++) {
        expect(reflector.reflect(i)).not.toBe(i);
      }
    });
  });

  describe('UKW-C', () => {
    const reflector = new Reflector('UKW-C');

    it('A reflects to F', () => {
      // UKW-C wiring: FVPJIAOYEDRZXWGCTKUQSBNMHL
      expect(indexToLetter(reflector.reflect(letterToIndex('A')))).toBe('F');
    });

    it('is fully symmetric: reflect(reflect(x)) == x for all letters', () => {
      for (let i = 0; i < 26; i++) {
        const reflected = reflector.reflect(i);
        const doubleReflected = reflector.reflect(reflected);
        expect(doubleReflected).toBe(i);
      }
    });

    it('no letter maps to itself', () => {
      for (let i = 0; i < 26; i++) {
        expect(reflector.reflect(i)).not.toBe(i);
      }
    });
  });
});
