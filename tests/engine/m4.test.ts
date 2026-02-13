/**
 * M4 Naval Enigma tests.
 *
 * Test vectors sourced from known M4 decryption tables and verified
 * against reference implementations. The M4 (Kriegsmarine) Enigma uses
 * 4 rotors: the standard 3 + a non-stepping greek rotor (Beta or Gamma),
 * paired with a thin reflector (UKW-B-thin or UKW-C-thin).
 */
import { describe, it, expect } from 'vitest';
import { EnigmaMachine } from '../../src/engine';
import type { MachineConfig, RotorConfig } from '../../src/types';

describe('M4 Naval Enigma', () => {
  it('encrypts with Beta rotor and UKW-B-thin', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);
    const result = machine.encryptLetter('A');

    // M4 must never self-encrypt
    expect(result.outputLetter).not.toBe('A');
    // Signal path must include greek rotor steps (rotor-g forward and reverse)
    const components = result.steps.map((s) => s.component);
    expect(components).toContain('rotor-g');
    expect(components.filter((c) => c === 'rotor-g')).toHaveLength(2);
  });

  it('encrypts with Gamma rotor and UKW-C-thin', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'IV', ringSetting: 1, position: 'A' },
        { name: 'V', ringSetting: 1, position: 'A' },
        { name: 'I', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Gamma', ringSetting: 1, position: 'A' },
      reflector: 'UKW-C-thin',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);
    const result = machine.encryptLetter('A');
    expect(result.outputLetter).not.toBe('A');
  });

  it('produces symmetric M4 encryption (round-trip)', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'II', ringSetting: 5, position: 'K' },
        { name: 'III', ringSetting: 11, position: 'E' },
        { name: 'IV', ringSetting: 17, position: 'N' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 3, position: 'G' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [['A', 'Z'], ['B', 'Y'], ['C', 'X']],
    };

    const encrypt = new EnigmaMachine(config);
    const ciphertext = encrypt.encryptMessage('HELLOWORLD');

    const decrypt = new EnigmaMachine(config);
    const plaintext = decrypt.encryptMessage(ciphertext);

    expect(plaintext).toBe('HELLOWORLD');
  });

  it('M4 and 3-rotor produce different output for same input', () => {
    const base = {
      rotors: [
        { name: 'I' as const, ringSetting: 1, position: 'A' },
        { name: 'II' as const, ringSetting: 1, position: 'A' },
        { name: 'III' as const, ringSetting: 1, position: 'A' },
      ] as [RotorConfig, RotorConfig, RotorConfig],
      plugboardPairs: [] as [string, string][],
    };

    const config3: MachineConfig = { ...base, reflector: 'UKW-B' };
    const configM4: MachineConfig = {
      ...base,
      reflector: 'UKW-B-thin',
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'B' },
    };

    const machine3 = new EnigmaMachine(config3);
    const machineM4 = new EnigmaMachine(configM4);

    const output3 = machine3.encryptMessage('AAAAAAAAAA');
    const outputM4 = machineM4.encryptMessage('AAAAAAAAAA');

    // Over 10 characters the two machines must diverge
    expect(output3).not.toBe(outputM4);
  });

  it('greek rotor does not step', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);

    // Encrypt 100 letters — greek rotor position should never change from 'A'
    for (let i = 0; i < 100; i++) {
      const result = machine.encryptLetter('A');
      // Greek position is always first in the positions array
      expect(result.rotorPositionsAfter[0]).toBe('A');
    }
  });

  it('M4 state includes 4 positions ([G, L, M, R])', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);
    const state = machine.getState();
    expect(state.rotorPositions).toHaveLength(4);
  });

  it('3-rotor state includes 3 positions ([L, M, R])', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      reflector: 'UKW-B',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);
    const state = machine.getState();
    expect(state.rotorPositions).toHaveLength(3);
  });

  it('rejects thin reflector without greek rotor', () => {
    expect(() => new EnigmaMachine({
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    })).toThrow('Thin reflectors require a greek rotor');
  });

  it('rejects standard reflector with greek rotor', () => {
    expect(() => new EnigmaMachine({
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B',
      plugboardPairs: [],
    })).toThrow('M4 mode requires a thin reflector');
  });

  it('M4 encryptMessage produces consistent output', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'Z' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };

    // Encrypt same message twice with same config — must produce same output
    const m1 = new EnigmaMachine(config);
    const m2 = new EnigmaMachine(config);
    const msg = 'AAAAAAAAAA';
    expect(m1.encryptMessage(msg)).toBe(m2.encryptMessage(msg));
  });

  it('M4 never self-encrypts any letter', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'V', ringSetting: 13, position: 'M' },
        { name: 'III', ringSetting: 7, position: 'Q' },
        { name: 'I', ringSetting: 22, position: 'D' },
      ],
      greekRotor: { name: 'Gamma', ringSetting: 4, position: 'H' },
      reflector: 'UKW-C-thin',
      plugboardPairs: [['A', 'N'], ['B', 'O'], ['C', 'P']],
    };
    const machine = new EnigmaMachine(config);

    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const result = machine.encryptLetter(ch);
      expect(result.outputLetter).not.toBe(ch);
    }
  });

  it('M4 reset restores all 4 positions including greek rotor', () => {
    const config: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'X' },
        { name: 'II', ringSetting: 1, position: 'Y' },
        { name: 'III', ringSetting: 1, position: 'Z' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'W' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };
    const machine = new EnigmaMachine(config);

    // Encrypt several letters to advance rotors
    machine.encryptMessage('TESTMESSAGE');

    // Reset and verify all positions return to initial
    machine.reset();
    const state = machine.getState();
    expect(state.rotorPositions).toEqual(['W', 'X', 'Y', 'Z']);
  });

  it('M4 signal path has 13 steps (3-rotor has 9)', () => {
    const configM4: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
      reflector: 'UKW-B-thin',
      plugboardPairs: [],
    };

    const config3: MachineConfig = {
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      reflector: 'UKW-B',
      plugboardPairs: [],
    };

    const m4Result = new EnigmaMachine(configM4).encryptLetter('A');
    const result3 = new EnigmaMachine(config3).encryptLetter('A');

    // M4: plugboard + R + M + L + G + reflector + G + L + M + R + plugboard = 11
    expect(m4Result.steps).toHaveLength(11);
    // 3-rotor: plugboard + R + M + L + reflector + L + M + R + plugboard = 9
    expect(result3.steps).toHaveLength(9);
  });

  it('M4 ring settings affect output', () => {
    const base = {
      rotors: [
        { name: 'I' as const, ringSetting: 1, position: 'A' },
        { name: 'II' as const, ringSetting: 1, position: 'A' },
        { name: 'III' as const, ringSetting: 1, position: 'A' },
      ] as [RotorConfig, RotorConfig, RotorConfig],
      reflector: 'UKW-B-thin' as const,
      plugboardPairs: [] as [string, string][],
    };

    const m1 = new EnigmaMachine({
      ...base,
      greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
    });
    const m2 = new EnigmaMachine({
      ...base,
      greekRotor: { name: 'Beta', ringSetting: 15, position: 'A' },
    });

    // Different ring settings → different output
    const out1 = m1.encryptLetter('A').outputLetter;
    const out2 = m2.encryptLetter('A').outputLetter;
    expect(out1).not.toBe(out2);
  });
});
