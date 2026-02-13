import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnigma } from '../../src/hooks/useEnigma';

describe('useEnigma', () => {
  // Clear URL hash before each test to prevent state leaking between tests
  beforeEach(() => {
    window.location.hash = '';
  });

  describe('initial state', () => {
    it('starts with default config (I-II-III, UKW-B, no plugboard)', () => {
      const { result } = renderHook(() => useEnigma());
      const { config } = result.current;
      expect(config.rotors.map((r) => r.name)).toEqual(['I', 'II', 'III']);
      expect(config.reflector).toBe('UKW-B');
      expect(config.plugboardPairs).toEqual([]);
    });

    it('starts with rotors at AAA', () => {
      const { result } = renderHook(() => useEnigma());
      expect(result.current.state.rotorPositions).toEqual(['A', 'A', 'A']);
    });

    it('starts with empty message history', () => {
      const { result } = renderHook(() => useEnigma());
      expect(result.current.state.inputHistory).toBe('');
      expect(result.current.state.outputHistory).toBe('');
    });

    it('has no rotor conflict initially', () => {
      const { result } = renderHook(() => useEnigma());
      expect(result.current.hasRotorConflict).toBe(false);
    });
  });

  describe('pressKey', () => {
    it('encrypts a letter and updates state', () => {
      const { result } = renderHook(() => useEnigma());
      let encResult: ReturnType<typeof result.current.pressKey>;
      act(() => {
        encResult = result.current.pressKey('A');
      });
      expect(encResult!).toBeDefined();
      expect(encResult!.inputLetter).toBe('A');
      expect(encResult!.outputLetter).not.toBe('A'); // no self-encryption
      expect(result.current.state.inputHistory).toBe('A');
      expect(result.current.state.outputHistory).toBe(encResult!.outputLetter);
    });

    it('accumulates message history across multiple keypresses', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('H'); });
      act(() => { result.current.pressKey('E'); });
      act(() => { result.current.pressKey('L'); });
      expect(result.current.state.inputHistory).toBe('HEL');
      expect(result.current.state.outputHistory).toHaveLength(3);
    });

    it('rejects non-letter input', () => {
      const { result } = renderHook(() => useEnigma());
      let res: ReturnType<typeof result.current.pressKey>;
      act(() => { res = result.current.pressKey('1'); });
      expect(res!).toBeUndefined();
      expect(result.current.state.inputHistory).toBe('');
    });

    it('steps the right rotor on each keypress', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('A'); });
      expect(result.current.state.rotorPositions[2]).toBe('B');
      act(() => { result.current.pressKey('A'); });
      expect(result.current.state.rotorPositions[2]).toBe('C');
    });

    it('produces same output as direct EnigmaMachine for known vector', () => {
      const { result } = renderHook(() => useEnigma());
      // Default config: I-II-III, rings 1-1-1, AAA, UKW-B
      // Known: AAAAAAAAAA → BDZGOWCXLT
      let output = '';
      for (const ch of 'AAAAAAAAAA') {
        act(() => {
          const r = result.current.pressKey(ch);
          if (r) output += r.outputLetter;
        });
      }
      expect(output).toBe('BDZGOWCXLT');
    });
  });

  describe('updateRotor', () => {
    it('changes rotor name', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.updateRotor(0, 'name', 'IV'); });
      expect(result.current.config.rotors[0].name).toBe('IV');
    });

    it('changes ring setting', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.updateRotor(1, 'ringSetting', 15); });
      expect(result.current.config.rotors[1].ringSetting).toBe(15);
    });

    it('changes position', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.updateRotor(2, 'position', 'Z'); });
      expect(result.current.config.rotors[2].position).toBe('Z');
    });

    it('resets message history when config changes', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('A'); });
      expect(result.current.state.inputHistory).toBe('A');
      act(() => { result.current.updateRotor(0, 'name', 'IV'); });
      expect(result.current.state.inputHistory).toBe('');
    });

    it('detects rotor conflict on duplicate selection', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.updateRotor(0, 'name', 'III'); });
      // Rotors: III, II, III — duplicate
      expect(result.current.hasRotorConflict).toBe(true);
    });
  });

  describe('updateReflector', () => {
    it('changes reflector', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.updateReflector('UKW-C'); });
      expect(result.current.config.reflector).toBe('UKW-C');
    });
  });

  describe('plugboard', () => {
    it('adds a plugboard pair', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.addPlugboardPair('A', 'B'); });
      expect(result.current.config.plugboardPairs).toEqual([['A', 'B']]);
    });

    it('removes a plugboard pair by index', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.addPlugboardPair('A', 'B'); });
      act(() => { result.current.addPlugboardPair('C', 'D'); });
      act(() => { result.current.removePlugboardPair(0); });
      expect(result.current.config.plugboardPairs).toEqual([['C', 'D']]);
    });
  });

  describe('resetPositions', () => {
    it('resets rotor positions to config values', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('A'); });
      act(() => { result.current.pressKey('A'); });
      expect(result.current.state.rotorPositions[2]).not.toBe('A');
      act(() => { result.current.resetPositions(); });
      expect(result.current.state.rotorPositions).toEqual(['A', 'A', 'A']);
    });

    it('clears message history on reset', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('A'); });
      act(() => { result.current.resetPositions(); });
      expect(result.current.state.inputHistory).toBe('');
      expect(result.current.state.outputHistory).toBe('');
    });
  });

  describe('configure', () => {
    it('applies a full new configuration', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => {
        result.current.configure({
          rotors: [
            { name: 'V', ringSetting: 5, position: 'K' },
            { name: 'III', ringSetting: 12, position: 'P' },
            { name: 'I', ringSetting: 20, position: 'G' },
          ],
          reflector: 'UKW-C',
          plugboardPairs: [['A', 'Z']],
        });
      });
      expect(result.current.config.rotors[0].name).toBe('V');
      expect(result.current.config.reflector).toBe('UKW-C');
      expect(result.current.state.rotorPositions).toEqual(['K', 'P', 'G']);
    });
  });

  describe('randomize', () => {
    it('produces a valid config with 3 distinct rotors', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.randomize(); });
      const names = result.current.config.rotors.map((r) => r.name);
      expect(new Set(names).size).toBe(3);
      expect(result.current.hasRotorConflict).toBe(false);
    });

    it('generates plugboard pairs', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.randomize(); });
      expect(result.current.config.plugboardPairs.length).toBeGreaterThanOrEqual(3);
    });

    it('resets message history', () => {
      const { result } = renderHook(() => useEnigma());
      act(() => { result.current.pressKey('A'); });
      act(() => { result.current.randomize(); });
      expect(result.current.state.inputHistory).toBe('');
    });
  });
});
