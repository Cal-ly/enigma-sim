import { describe, it, expect } from 'vitest';
import { Rotor } from '../../src/engine/rotor';
import { letterToIndex, indexToLetter } from '../../src/engine/constants';

describe('Rotor', () => {
  describe('construction', () => {
    it('initialises with correct position and ring setting', () => {
      const rotor = new Rotor('I', 1, 'A');
      expect(rotor.position).toBe(0);
      expect(rotor.positionLetter).toBe('A');
      expect(rotor.ringSetting).toBe(0); // 1 externally → 0 internally
    });

    it('handles non-default initial position', () => {
      const rotor = new Rotor('II', 1, 'M');
      expect(rotor.positionLetter).toBe('M');
    });

    it('stores the ring setting correctly', () => {
      const rotor = new Rotor('III', 5, 'A');
      expect(rotor.ringSetting).toBe(4); // 5 externally → 4 internally
    });
  });

  describe('forward substitution', () => {
    it('Rotor I at position A, ring 1: A → E', () => {
      // Rotor I wiring: EKMFLGDQVZNTOWYHXUSPAIBRCJ
      // Position A (0), ring 1 (offset 0): input A(0) → E(4)
      const rotor = new Rotor('I', 1, 'A');
      const output = rotor.forward(letterToIndex('A'));
      expect(indexToLetter(output)).toBe('E');
    });

    it('Rotor I at position A, ring 1: B → K', () => {
      const rotor = new Rotor('I', 1, 'A');
      const output = rotor.forward(letterToIndex('B'));
      expect(indexToLetter(output)).toBe('K');
    });

    it('Rotor II at position A, ring 1: A → A', () => {
      // Rotor II wiring: AJDKSIRUXBLHWTMCQGZNPYFVOE
      const rotor = new Rotor('II', 1, 'A');
      const output = rotor.forward(letterToIndex('A'));
      expect(indexToLetter(output)).toBe('A');
    });

    it('Rotor III at position A, ring 1: A → B', () => {
      // Rotor III wiring: BDFHJLCPRTXVZNYEIWGAKMUSQO
      const rotor = new Rotor('III', 1, 'A');
      const output = rotor.forward(letterToIndex('A'));
      expect(indexToLetter(output)).toBe('B');
    });
  });

  describe('reverse substitution', () => {
    it('Rotor I at position A, ring 1: reverse of forward is identity', () => {
      const rotor = new Rotor('I', 1, 'A');
      // Forward: A → E, so Reverse: E → A
      const fwd = rotor.forward(letterToIndex('A'));
      const rev = rotor.reverse(fwd);
      expect(indexToLetter(rev)).toBe('A');
    });

    it('round-trips every letter through Rotor I', () => {
      const rotor = new Rotor('I', 1, 'A');
      for (let i = 0; i < 26; i++) {
        const fwd = rotor.forward(i);
        const rev = rotor.reverse(fwd);
        expect(rev).toBe(i);
      }
    });

    it('round-trips every letter through each rotor type', () => {
      const rotorNames = ['I', 'II', 'III', 'IV', 'V'] as const;
      for (const name of rotorNames) {
        const rotor = new Rotor(name, 1, 'A');
        for (let i = 0; i < 26; i++) {
          const fwd = rotor.forward(i);
          const rev = rotor.reverse(fwd);
          expect(rev).toBe(i);
        }
      }
    });
  });

  describe('position offset', () => {
    it('shifting position changes the substitution', () => {
      const rotorA = new Rotor('I', 1, 'A');
      const rotorB = new Rotor('I', 1, 'B');
      const outA = rotorA.forward(letterToIndex('A'));
      const outB = rotorB.forward(letterToIndex('A'));
      // Different positions must yield different outputs
      expect(outA).not.toBe(outB);
    });

    it('round-trips still work at offset positions', () => {
      const rotor = new Rotor('I', 1, 'K');
      for (let i = 0; i < 26; i++) {
        const fwd = rotor.forward(i);
        const rev = rotor.reverse(fwd);
        expect(rev).toBe(i);
      }
    });
  });

  describe('ring setting effect', () => {
    it('changing ring setting changes the substitution', () => {
      const rotor1 = new Rotor('I', 1, 'A');
      const rotor2 = new Rotor('I', 5, 'A');
      const out1 = rotor1.forward(letterToIndex('A'));
      const out2 = rotor2.forward(letterToIndex('A'));
      expect(out1).not.toBe(out2);
    });

    it('round-trips work with non-default ring setting', () => {
      const rotor = new Rotor('III', 14, 'G');
      for (let i = 0; i < 26; i++) {
        const fwd = rotor.forward(i);
        const rev = rotor.reverse(fwd);
        expect(rev).toBe(i);
      }
    });
  });

  describe('stepping', () => {
    it('step advances position by 1', () => {
      const rotor = new Rotor('I', 1, 'A');
      rotor.step();
      expect(rotor.positionLetter).toBe('B');
    });

    it('step wraps from Z to A', () => {
      const rotor = new Rotor('I', 1, 'Z');
      rotor.step();
      expect(rotor.positionLetter).toBe('A');
    });

    it('multiple steps increment correctly', () => {
      const rotor = new Rotor('I', 1, 'A');
      for (let i = 0; i < 5; i++) rotor.step();
      expect(rotor.positionLetter).toBe('F');
    });
  });

  describe('atNotch', () => {
    it('Rotor I is at notch when position is Q', () => {
      const rotor = new Rotor('I', 1, 'Q');
      expect(rotor.atNotch()).toBe(true);
    });

    it('Rotor I is not at notch when position is A', () => {
      const rotor = new Rotor('I', 1, 'A');
      expect(rotor.atNotch()).toBe(false);
    });

    it('Rotor II is at notch when position is E', () => {
      const rotor = new Rotor('II', 1, 'E');
      expect(rotor.atNotch()).toBe(true);
    });

    it('Rotor III is at notch when position is V', () => {
      const rotor = new Rotor('III', 1, 'V');
      expect(rotor.atNotch()).toBe(true);
    });

    it('Rotor IV is at notch when position is J', () => {
      const rotor = new Rotor('IV', 1, 'J');
      expect(rotor.atNotch()).toBe(true);
    });

    it('Rotor V is at notch when position is Z', () => {
      const rotor = new Rotor('V', 1, 'Z');
      expect(rotor.atNotch()).toBe(true);
    });
  });

  describe('resetPosition', () => {
    it('resets to the given letter', () => {
      const rotor = new Rotor('I', 1, 'A');
      rotor.step();
      rotor.step();
      rotor.resetPosition('A');
      expect(rotor.positionLetter).toBe('A');
    });
  });
});
