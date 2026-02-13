import { describe, it, expect } from 'vitest';
import { EnigmaMachine } from '../../src/engine/enigma';
import type { MachineConfig } from '../../src/types';

/** Helper to create a machine config concisely */
function makeConfig(
  rotors: [string, string, string],
  rings: [number, number, number],
  positions: [string, string, string],
  reflector: 'UKW-B' | 'UKW-C',
): MachineConfig {
  return {
    rotors: [
      { name: rotors[0] as MachineConfig['rotors'][0]['name'], ringSetting: rings[0], position: positions[0] },
      { name: rotors[1] as MachineConfig['rotors'][1]['name'], ringSetting: rings[1], position: positions[1] },
      { name: rotors[2] as MachineConfig['rotors'][2]['name'], ringSetting: rings[2], position: positions[2] },
    ],
    reflector,
    plugboardPairs: [],
  };
}

describe('Rotor stepping', () => {
  describe('right rotor always steps', () => {
    it('increments right rotor on every keypress', () => {
      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'A', 'A'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions[2]).toBe('B');

      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions[2]).toBe('C');

      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions[2]).toBe('D');
    });
  });

  describe('normal turnover', () => {
    it('middle rotor steps when right rotor passes its notch', () => {
      // Rotor III has notch at V. Set right rotor to V so it's at its notch.
      // On the next keypress: right at notch → middle steps, right steps V→W
      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'A', 'V'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      machine.encryptLetter('A');
      const state = machine.getState();
      expect(state.rotorPositions[1]).toBe('B'); // middle stepped A→B
      expect(state.rotorPositions[2]).toBe('W'); // right stepped V→W
    });

    it('left rotor does not step on normal middle turnover', () => {
      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'A', 'V'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions[0]).toBe('A'); // left unchanged
    });
  });

  describe('double-step anomaly', () => {
    it('middle rotor steps twice in consecutive keypresses', () => {
      // Rotor III (right) notch at V, Rotor II (middle) notch at E.
      //
      // Set up: right at U (one before notch V), middle at D (one before notch E)
      //
      // Keypress 1: right at U (not at notch), middle at D (not at notch)
      //   → right steps U→V. Middle stays D. Left stays A.
      //   Positions after: A, D, V
      //
      // Keypress 2: right at V (at notch!), middle at D (not at notch)
      //   → right at notch → middle steps D→E. Right steps V→W.
      //   Positions after: A, E, W
      //
      // Keypress 3: middle at E (at notch!) → DOUBLE STEP
      //   → middle at notch → middle AND left step. Middle E→F, Left A→B.
      //   → right steps W→X.
      //   Positions after: B, F, X
      //
      // The middle rotor stepped on keypress 2 (D→E) and again on keypress 3 (E→F).
      // This is the double-step anomaly.

      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'D', 'U'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      // Keypress 1
      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions).toEqual(['A', 'D', 'V']);

      // Keypress 2: right at notch → middle steps
      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions).toEqual(['A', 'E', 'W']);

      // Keypress 3: middle at notch → double-step (middle + left both step)
      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions).toEqual(['B', 'F', 'X']);
    });

    it('double-step does not occur when middle rotor is not at notch', () => {
      // Normal case: middle at A (not near notch), right at V (at notch)
      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'A', 'V'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      // Keypress 1: right at V (notch) → middle steps A→B, right V→W
      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions).toEqual(['A', 'B', 'W']);

      // Keypress 2: middle at B (not at notch), right at W (not at notch)
      // → only right steps
      machine.encryptLetter('A');
      expect(machine.getState().rotorPositions).toEqual(['A', 'B', 'X']);
    });
  });

  describe('full revolution', () => {
    it('right rotor completes a full revolution in 26 keypresses', () => {
      const config = makeConfig(['I', 'II', 'III'], [1, 1, 1], ['A', 'A', 'A'], 'UKW-B');
      const machine = new EnigmaMachine(config);

      // After 26 keypresses, right rotor should be back near A
      // (but middle rotor turnover means it won't be exactly at A due to
      // the middle rotor stepping — the right rotor still advances 26 times = full turn)
      for (let i = 0; i < 26; i++) {
        machine.encryptLetter('A');
      }
      // Right: A + 26 steps = A (mod 26). Right rotor is at A.
      expect(machine.getState().rotorPositions[2]).toBe('A');
    });
  });
});
