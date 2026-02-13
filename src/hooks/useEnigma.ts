import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { EnigmaMachine, ALPHABET } from '../engine';
import { readConfigFromURL, writeConfigToURL } from '../utils/urlState';
import type { MachineConfig, EncryptionResult, Letter, RotorName, ReflectorName, GreekRotorName } from '../types';

type EnigmaState = {
  rotorPositions: Letter[];
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
  const positions: Letter[] = [];
  if (cfg.greekRotor) positions.push(cfg.greekRotor.position);
  positions.push(cfg.rotors[0].position, cfg.rotors[1].position, cfg.rotors[2].position);
  return {
    rotorPositions: positions,
    inputHistory: '',
    outputHistory: '',
    lastResult: null,
  };
}

export function useEnigma() {
  const initialConfig = useMemo(() => {
    const fromURL = readConfigFromURL();
    if (!fromURL) return DEFAULT_CONFIG;
    // Validate the URL config can actually create a machine
    try {
      new EnigmaMachine(fromURL);
      return fromURL;
    } catch {
      return DEFAULT_CONFIG;
    }
  }, []);

  const [config, setConfig] = useState<MachineConfig>(initialConfig);
  const machineRef = useRef<EnigmaMachine>(new EnigmaMachine(initialConfig));
  const configRef = useRef<MachineConfig>(initialConfig);

  // Keep configRef in sync so callbacks always see the latest config
  useEffect(() => {
    configRef.current = config;
  });

  // Sync valid configs to URL hash
  useEffect(() => {
    const distinct = new Set(config.rotors.map((r) => r.name)).size === 3;
    if (distinct) writeConfigToURL(config);
  }, [config]);

  const [state, setState] = useState<EnigmaState>(freshState(initialConfig));

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
    const cur = configRef.current;
    const newRotors = [...cur.rotors] as MachineConfig['rotors'];
    newRotors[slot] = { ...newRotors[slot], [field]: value };
    const newConfig: MachineConfig = { ...cur, rotors: newRotors };
    applyConfig(newConfig);
  }, [applyConfig]);

  const updateReflector = useCallback((reflector: ReflectorName) => {
    const newConfig: MachineConfig = { ...configRef.current, reflector };
    applyConfig(newConfig);
  }, [applyConfig]);

  const addPlugboardPair = useCallback((a: Letter, b: Letter) => {
    const cur = configRef.current;
    const newPairs = [...cur.plugboardPairs, [a, b] as [Letter, Letter]];
    const newConfig: MachineConfig = { ...cur, plugboardPairs: newPairs };
    if (!applyConfig(newConfig)) {
      // Invalid pair — revert (applyConfig already kept the old machine)
      setConfig(cur);
    }
  }, [applyConfig]);

  const removePlugboardPair = useCallback((index: number) => {
    const cur = configRef.current;
    const newPairs = cur.plugboardPairs.filter((_, i) => i !== index);
    const newConfig: MachineConfig = { ...cur, plugboardPairs: newPairs };
    applyConfig(newConfig);
  }, [applyConfig]);

  /** Toggle between 3-rotor and M4 mode */
  const toggleM4 = useCallback(() => {
    const cur = configRef.current;
    if (cur.greekRotor) {
      // Switch to 3-rotor mode: remove greek rotor, switch to standard reflector
      const reflector: ReflectorName = cur.reflector === 'UKW-B-thin' ? 'UKW-B' : 'UKW-C';
      applyConfig({ ...cur, greekRotor: undefined, reflector });
    } else {
      // Switch to M4 mode: add greek rotor, switch to thin reflector
      const reflector: ReflectorName = cur.reflector === 'UKW-B' ? 'UKW-B-thin' : 'UKW-C-thin';
      applyConfig({
        ...cur,
        greekRotor: { name: 'Beta', ringSetting: 1, position: 'A' },
        reflector,
      });
    }
  }, [applyConfig]);

  /** Update the greek rotor's name, ring setting, or position */
  const updateGreekRotor = useCallback((
    field: 'name' | 'ringSetting' | 'position',
    value: GreekRotorName | number | string,
  ) => {
    const cur = configRef.current;
    if (!cur.greekRotor) return;
    const newGreek = { ...cur.greekRotor, [field]: value };
    applyConfig({ ...cur, greekRotor: newGreek });
  }, [applyConfig]);

  /** Generate a random valid configuration: respects current M4 mode */
  const randomize = useCallback(() => {
    const cur = configRef.current;
    const isM4 = !!cur.greekRotor;
    const allRotors: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
    const greekRotors: GreekRotorName[] = ['Beta', 'Gamma'];

    const shuffled = allRotors.sort(() => Math.random() - 0.5);
    const randomLetter = () => ALPHABET[Math.floor(Math.random() * 26)];
    const randomRing = () => Math.floor(Math.random() * 26) + 1;

    const available = ALPHABET.split('');
    const pairCount = Math.floor(Math.random() * 8) + 3;
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
      reflector: isM4
        ? (['UKW-B-thin', 'UKW-C-thin'] as ReflectorName[])[Math.floor(Math.random() * 2)]
        : (['UKW-B', 'UKW-C'] as ReflectorName[])[Math.floor(Math.random() * 2)],
      plugboardPairs: pairs,
      ...(isM4 && {
        greekRotor: {
          name: greekRotors[Math.floor(Math.random() * 2)],
          ringSetting: randomRing(),
          position: randomLetter(),
        },
      }),
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
    toggleM4,
    updateGreekRotor,
    randomize,
  }), [config, state, hasRotorConflict, pressKey, resetPositions, configure,
       updateRotor, updateReflector, addPlugboardPair, removePlugboardPair,
       toggleM4, updateGreekRotor, randomize]);
}
