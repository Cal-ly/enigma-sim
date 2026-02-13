import { useState, useCallback, useRef, useMemo } from 'react';
import { EnigmaMachine, ALPHABET } from '../engine';
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

function freshState(cfg: MachineConfig): EnigmaState {
  return {
    rotorPositions: [cfg.rotors[0].position, cfg.rotors[1].position, cfg.rotors[2].position],
    inputHistory: '',
    outputHistory: '',
    lastResult: null,
  };
}

export function useEnigma() {
  const [config, setConfig] = useState<MachineConfig>(DEFAULT_CONFIG);
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(DEFAULT_CONFIG));

  const [state, setState] = useState<EnigmaState>(freshState(DEFAULT_CONFIG));

  /**
   * Apply a new config: recreate the machine and reset UI state.
   * Returns true if the config was valid, false if the machine couldn't be created
   * (e.g. duplicate rotors during mid-selection).
   */
  const applyConfig = useCallback((newConfig: MachineConfig): boolean => {
    try {
      machineRef.current = new EnigmaMachine(newConfig);
      setConfig(newConfig);
      setState(freshState(newConfig));
      return true;
    } catch {
      // Invalid config — update config state to show the UI selection,
      // but don't recreate the machine (keep the last valid one)
      setConfig(newConfig);
      return false;
    }
  }, []);

  const pressKey = useCallback((letter: string): EncryptionResult | undefined => {
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
    applyConfig(newConfig);
  }, [applyConfig]);

  const updateRotor = useCallback((
    slot: 0 | 1 | 2,
    field: 'name' | 'ringSetting' | 'position',
    value: RotorName | number | string,
  ) => {
    setConfig((prev) => {
      const newRotors = [...prev.rotors] as MachineConfig['rotors'];
      newRotors[slot] = { ...newRotors[slot], [field]: value };
      return { ...prev, rotors: newRotors };
    });
    // Derive the new config after React processes the setConfig updater,
    // then reconcile machine + state outside the updater (no side effects).
    // We need the config synchronously, so compute it inline:
    const newRotors = [...config.rotors] as MachineConfig['rotors'];
    newRotors[slot] = { ...newRotors[slot], [field]: value };
    const newConfig: MachineConfig = { ...config, rotors: newRotors };
    applyConfig(newConfig);
  }, [config, applyConfig]);

  const updateReflector = useCallback((reflector: ReflectorName) => {
    const newConfig: MachineConfig = { ...config, reflector };
    applyConfig(newConfig);
  }, [config, applyConfig]);

  const addPlugboardPair = useCallback((a: Letter, b: Letter) => {
    const newPairs = [...config.plugboardPairs, [a, b] as [Letter, Letter]];
    const newConfig: MachineConfig = { ...config, plugboardPairs: newPairs };
    if (!applyConfig(newConfig)) {
      // Invalid pair — revert (applyConfig already kept the old machine)
      setConfig(config);
    }
  }, [config, applyConfig]);

  const removePlugboardPair = useCallback((index: number) => {
    const newPairs = config.plugboardPairs.filter((_, i) => i !== index);
    const newConfig: MachineConfig = { ...config, plugboardPairs: newPairs };
    applyConfig(newConfig);
  }, [config, applyConfig]);

  /** Generate a random valid configuration: 3 distinct rotors, random positions/rings, random plugboard pairs */
  const randomize = useCallback(() => {
    const allRotors: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
    const reflectors: ReflectorName[] = ['UKW-B', 'UKW-C'];

    // Shuffle and pick 3 distinct rotors
    const shuffled = allRotors.sort(() => Math.random() - 0.5);
    const randomLetter = () => ALPHABET[Math.floor(Math.random() * 26)];
    const randomRing = () => Math.floor(Math.random() * 26) + 1;

    // Generate 3-10 random plugboard pairs from available letters
    const available = ALPHABET.split('');
    const pairCount = Math.floor(Math.random() * 8) + 3; // 3–10 pairs
    const pairs: [Letter, Letter][] = [];
    for (let i = 0; i < pairCount && available.length >= 2; i++) {
      const ai = Math.floor(Math.random() * available.length);
      const a = available.splice(ai, 1)[0];
      const bi = Math.floor(Math.random() * available.length);
      const b = available.splice(bi, 1)[0];
      pairs.push([a, b]);
    }

    const newConfig: MachineConfig = {
      rotors: [
        { name: shuffled[0], ringSetting: randomRing(), position: randomLetter() },
        { name: shuffled[1], ringSetting: randomRing(), position: randomLetter() },
        { name: shuffled[2], ringSetting: randomRing(), position: randomLetter() },
      ],
      reflector: reflectors[Math.floor(Math.random() * reflectors.length)],
      plugboardPairs: pairs,
    };
    applyConfig(newConfig);
  }, [applyConfig]);

  // Check if current rotor selection has duplicates
  const hasRotorConflict = new Set(config.rotors.map((r) => r.name)).size !== 3;

  // Memoize return object so consumers can use it in dependency arrays
  // without triggering re-renders on every parent render
  return useMemo(() => ({
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
    randomize,
  }), [config, state, hasRotorConflict, pressKey, resetPositions, configure,
       updateRotor, updateReflector, addPlugboardPair, removePlugboardPair, randomize]);
}
