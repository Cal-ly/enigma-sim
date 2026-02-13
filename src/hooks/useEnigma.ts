import { useState, useCallback, useRef } from 'react';
import { EnigmaMachine } from '../engine';
import type { MachineConfig, EncryptionResult, Letter, RotorName, ReflectorName } from '../types';

type EnigmaState = {
  rotorPositions: [Letter, Letter, Letter];
  inputHistory: string;
  outputHistory: string;
  lastResult: EncryptionResult | null;
};

const DEFAULT_CONFIG: MachineConfig = {
  rotors: [
    { name: 'I', ringSetting: 1, position: 'A' },
    { name: 'II', ringSetting: 1, position: 'A' },
    { name: 'III', ringSetting: 1, position: 'A' },
  ],
  reflector: 'UKW-B',
  plugboardPairs: [],
};

export function useEnigma() {
  const [config, setConfig] = useState<MachineConfig>(DEFAULT_CONFIG);
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(DEFAULT_CONFIG));

  const [state, setState] = useState<EnigmaState>({
    rotorPositions: ['A', 'A', 'A'],
    inputHistory: '',
    outputHistory: '',
    lastResult: null,
  });

  const pressKey = useCallback((letter: string) => {
    const upper = letter.toUpperCase();
    if (!/^[A-Z]$/.test(upper)) return;

    const result = machineRef.current.encryptLetter(upper);

    setState((prev) => ({
      rotorPositions: result.rotorPositionsAfter,
      inputHistory: prev.inputHistory + upper,
      outputHistory: prev.outputHistory + result.outputLetter,
      lastResult: result,
    }));

    return result;
  }, []);

  const resetPositions = useCallback(() => {
    machineRef.current.reset();
    const machineState = machineRef.current.getState();
    setState({
      rotorPositions: machineState.rotorPositions,
      inputHistory: '',
      outputHistory: '',
      lastResult: null,
    });
  }, []);

  const configure = useCallback((newConfig: MachineConfig) => {
    machineRef.current = new EnigmaMachine(newConfig);
    setConfig(newConfig);
    setState({
      rotorPositions: [
        newConfig.rotors[0].position,
        newConfig.rotors[1].position,
        newConfig.rotors[2].position,
      ],
      inputHistory: '',
      outputHistory: '',
      lastResult: null,
    });
  }, []);

  const updateRotor = useCallback((
    slot: 0 | 1 | 2,
    field: 'name' | 'ringSetting' | 'position',
    value: RotorName | number | string,
  ) => {
    setConfig((prev) => {
      const newRotors = [...prev.rotors] as MachineConfig['rotors'];
      newRotors[slot] = { ...newRotors[slot], [field]: value };

      const newConfig: MachineConfig = { ...prev, rotors: newRotors };
      try {
        machineRef.current = new EnigmaMachine(newConfig);
        setState({
          rotorPositions: [
            newConfig.rotors[0].position,
            newConfig.rotors[1].position,
            newConfig.rotors[2].position,
          ],
          inputHistory: '',
          outputHistory: '',
          lastResult: null,
        });
      } catch {
        // Invalid config (e.g. duplicate rotors during selection) — update config state
        // but don't create machine yet
      }
      return newConfig;
    });
  }, []);

  const updateReflector = useCallback((reflector: ReflectorName) => {
    setConfig((prev) => {
      const newConfig: MachineConfig = { ...prev, reflector };
      machineRef.current = new EnigmaMachine(newConfig);
      setState({
        rotorPositions: [
          newConfig.rotors[0].position,
          newConfig.rotors[1].position,
          newConfig.rotors[2].position,
        ],
        inputHistory: '',
        outputHistory: '',
        lastResult: null,
      });
      return newConfig;
    });
  }, []);

  const addPlugboardPair = useCallback((a: Letter, b: Letter) => {
    setConfig((prev) => {
      const newPairs = [...prev.plugboardPairs, [a, b] as [Letter, Letter]];
      const newConfig: MachineConfig = { ...prev, plugboardPairs: newPairs };
      try {
        machineRef.current = new EnigmaMachine(newConfig);
        setState({
          rotorPositions: [
            newConfig.rotors[0].position,
            newConfig.rotors[1].position,
            newConfig.rotors[2].position,
          ],
          inputHistory: '',
          outputHistory: '',
          lastResult: null,
        });
      } catch {
        return prev; // Invalid pair — don't update
      }
      return newConfig;
    });
  }, []);

  const removePlugboardPair = useCallback((index: number) => {
    setConfig((prev) => {
      const newPairs = prev.plugboardPairs.filter((_, i) => i !== index);
      const newConfig: MachineConfig = { ...prev, plugboardPairs: newPairs };
      machineRef.current = new EnigmaMachine(newConfig);
      setState({
        rotorPositions: [
          newConfig.rotors[0].position,
          newConfig.rotors[1].position,
          newConfig.rotors[2].position,
        ],
        inputHistory: '',
        outputHistory: '',
        lastResult: null,
      });
      return newConfig;
    });
  }, []);

  // Check if current rotor selection has duplicates
  const hasRotorConflict = new Set(config.rotors.map((r) => r.name)).size !== 3;

  return {
    config,
    state,
    hasRotorConflict,
    pressKey,
    resetPositions,
    configure,
    updateRotor,
    updateReflector,
    addPlugboardPair,
    removePlugboardPair,
  };
}
