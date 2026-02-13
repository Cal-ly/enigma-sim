import { useState, useCallback, useMemo } from 'react';
import { EnigmaMachine } from '../engine';
import type { MachineConfig, EncryptionResult, TutorialStep } from '../types';

const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  'input':
    'The operator presses a key. Before the electrical signal even enters the machine, the rotors step forward — this ensures every keypress uses a different substitution alphabet.',
  'plugboard-forward':
    'The signal first passes through the plugboard (Steckerbrett). Each cable swaps two letters bidirectionally. With 10 cables, 20 of the 26 letters are swapped before reaching the rotors. This was one of the biggest contributors to Enigma\'s complexity.',
  'rotor-r-forward':
    'The signal enters the rightmost rotor. The rotor\'s internal wiring scrambles the letter. Because the rotor has already stepped, this is effectively a different substitution than the previous keypress.',
  'rotor-m-forward':
    'The signal passes through the middle rotor. Each rotor has different wiring, adding another layer of substitution. The middle rotor only steps when the right rotor hits its notch position.',
  'rotor-l-forward':
    'The signal reaches the leftmost (slowest) rotor. This rotor only turns when the middle rotor hits its notch — or during a double-step. With three rotors, the cipher doesn\'t repeat for 26×25×26 = 16,900 key presses.',
  'reflector':
    'The reflector (Umkehrwalze) bounces the signal back through the rotors. It maps each letter to a different letter, guaranteeing no letter can encrypt to itself. This was a crucial weakness exploited by codebreakers.',
  'reflector-forward':
    'The reflector (Umkehrwalze) bounces the signal back through the rotors. It maps each letter to a different letter, guaranteeing no letter can encrypt to itself. This was a crucial weakness exploited by codebreakers.',
  'rotor-l-reverse':
    'The signal returns through the left rotor in reverse. Because rotor wiring is a fixed permutation, the reverse path produces a different substitution than the forward path.',
  'rotor-m-reverse':
    'The signal passes back through the middle rotor in the reverse direction.',
  'rotor-r-reverse':
    'The signal exits the rotors through the right rotor in reverse, heading back toward the plugboard.',
  'plugboard-reverse':
    'The signal passes through the plugboard one final time. Since plugboard swaps are symmetric (if A↔B, then B↔A), this is the same operation as the forward pass.',
  'output':
    'The lamp lights up, showing the encrypted letter. The operator records this letter. Thanks to the reflector\'s symmetry, typing the ciphertext with the same starting settings will recover the original message.',
};

function buildTutorialSteps(result: EncryptionResult): TutorialStep[] {
  const steps: TutorialStep[] = [];
  const allSteps = result.steps;
  const totalSteps = allSteps.length + 2; // +2 for input and output bookends

  // Step 0: Key pressed + stepping
  steps.push({
    stepIndex: 0,
    totalSteps,
    label: `Key pressed: ${result.inputLetter}`,
    description: COMPONENT_DESCRIPTIONS['input'],
    highlightComponent: 'input',
    direction: 'none',
    inputLetter: result.inputLetter,
    outputLetter: result.inputLetter,
  });

  // Steps 1–9: Signal path through the machine
  const componentLabels: Record<string, Record<string, string>> = {
    'plugboard': { forward: 'Plugboard →', reverse: '→ Plugboard' },
    'rotor-r': { forward: 'Right Rotor →', reverse: '→ Right Rotor' },
    'rotor-m': { forward: 'Middle Rotor →', reverse: '→ Middle Rotor' },
    'rotor-l': { forward: 'Left Rotor →', reverse: '→ Left Rotor' },
    'reflector': { forward: 'Reflector ⟲', reverse: 'Reflector ⟲' },
  };

  for (let i = 0; i < allSteps.length; i++) {
    const s = allSteps[i];
    const descKey = `${s.component}-${s.direction}`;

    steps.push({
      stepIndex: i + 1,
      totalSteps,
      label: `${componentLabels[s.component]?.[s.direction] ?? s.component}: ${s.inputLetter} → ${s.outputLetter}`,
      description: COMPONENT_DESCRIPTIONS[descKey] ?? '',
      highlightComponent: s.component,
      direction: s.direction,
      inputLetter: s.inputLetter,
      outputLetter: s.outputLetter,
    });
  }

  // Step 10: Output
  steps.push({
    stepIndex: allSteps.length + 1,
    totalSteps,
    label: `Output: ${result.outputLetter}`,
    description: COMPONENT_DESCRIPTIONS['output'],
    highlightComponent: 'output',
    direction: 'none',
    inputLetter: result.outputLetter,
    outputLetter: result.outputLetter,
  });

  return steps;
}

const DEFAULT_TUTORIAL_CONFIG: MachineConfig = {
  rotors: [
    { name: 'I', ringSetting: 1, position: 'A' },
    { name: 'II', ringSetting: 1, position: 'A' },
    { name: 'III', ringSetting: 1, position: 'A' },
  ],
  reflector: 'UKW-B',
  plugboardPairs: [['A', 'B'], ['C', 'D']],
};

export function useTutorial() {
  const [config, setConfig] = useState<MachineConfig>(DEFAULT_TUTORIAL_CONFIG);
  const [inputLetter, setInputLetter] = useState('A');
  const [currentStep, setCurrentStep] = useState(0);

  const encryptionResult = useMemo(() => {
    try {
      const machine = new EnigmaMachine(config);
      return machine.encryptLetter(inputLetter);
    } catch {
      return null;
    }
  }, [config, inputLetter]);

  const tutorialSteps = useMemo(() => {
    if (!encryptionResult) return [];
    return buildTutorialSteps(encryptionResult);
  }, [encryptionResult]);

  const currentTutorialStep = tutorialSteps[currentStep] ?? null;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, tutorialSteps.length - 1));
  }, [tutorialSteps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, tutorialSteps.length - 1)));
  }, [tutorialSteps.length]);

  const updateConfig = useCallback((newConfig: MachineConfig) => {
    setConfig(newConfig);
    setCurrentStep(0);
  }, []);

  const updateInputLetter = useCallback((letter: string) => {
    const upper = letter.toUpperCase();
    if (/^[A-Z]$/.test(upper)) {
      setInputLetter(upper);
      setCurrentStep(0);
    }
  }, []);

  return {
    config,
    inputLetter,
    currentStep,
    tutorialSteps,
    currentTutorialStep,
    encryptionResult,
    nextStep,
    prevStep,
    goToStep,
    updateConfig,
    updateInputLetter,
  };
}
