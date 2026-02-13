import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorial } from '../../src/hooks/useTutorial';

describe('useTutorial', () => {
  describe('initial state', () => {
    it('starts with default config (I-II-III, UKW-B, 2 plugboard pairs)', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.config.rotors.map((r) => r.name)).toEqual(['I', 'II', 'III']);
      expect(result.current.config.reflector).toBe('UKW-B');
      expect(result.current.config.plugboardPairs).toEqual([['A', 'B'], ['C', 'D']]);
    });

    it('starts with input letter A', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.inputLetter).toBe('A');
    });

    it('starts at step 0', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.currentStep).toBe(0);
    });

    it('produces encryption result on mount', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.encryptionResult).toBeDefined();
      expect(result.current.encryptionResult!.inputLetter).toBe('A');
    });

    it('builds 11 tutorial steps (input + 9 signal + output)', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.tutorialSteps).toHaveLength(11);
    });
  });

  describe('step navigation', () => {
    it('nextStep increments currentStep', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(1);
    });

    it('prevStep decrements currentStep', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      act(() => { result.current.prevStep(); });
      expect(result.current.currentStep).toBe(1);
    });

    it('prevStep does not go below 0', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.prevStep(); });
      expect(result.current.currentStep).toBe(0);
    });

    it('nextStep does not exceed max step', () => {
      const { result } = renderHook(() => useTutorial());
      const maxStep = result.current.tutorialSteps.length - 1;
      for (let i = 0; i < 20; i++) {
        act(() => { result.current.nextStep(); });
      }
      expect(result.current.currentStep).toBe(maxStep);
    });

    it('goToStep jumps to a specific step', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.goToStep(5); });
      expect(result.current.currentStep).toBe(5);
    });

    it('goToStep clamps to valid range', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.goToStep(100); });
      expect(result.current.currentStep).toBe(result.current.tutorialSteps.length - 1);
      act(() => { result.current.goToStep(-5); });
      expect(result.current.currentStep).toBe(0);
    });

    it('currentTutorialStep reflects current step', () => {
      const { result } = renderHook(() => useTutorial());
      expect(result.current.currentTutorialStep!.stepIndex).toBe(0);
      act(() => { result.current.nextStep(); });
      expect(result.current.currentTutorialStep!.stepIndex).toBe(1);
    });
  });

  describe('tutorial step structure', () => {
    it('first step is the input key press', () => {
      const { result } = renderHook(() => useTutorial());
      const first = result.current.tutorialSteps[0];
      expect(first.highlightComponent).toBe('input');
      expect(first.label).toContain('Key pressed');
    });

    it('last step is the output lamp', () => {
      const { result } = renderHook(() => useTutorial());
      const last = result.current.tutorialSteps[result.current.tutorialSteps.length - 1];
      expect(last.highlightComponent).toBe('output');
      expect(last.label).toContain('Output');
    });

    it('middle steps include plugboard, rotors, and reflector', () => {
      const { result } = renderHook(() => useTutorial());
      const components = result.current.tutorialSteps.map((s) => s.highlightComponent);
      expect(components).toContain('plugboard');
      expect(components).toContain('rotor-r');
      expect(components).toContain('rotor-m');
      expect(components).toContain('rotor-l');
      expect(components).toContain('reflector');
    });

    it('each step has a description', () => {
      const { result } = renderHook(() => useTutorial());
      for (const step of result.current.tutorialSteps) {
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('input letter change', () => {
    it('updateInputLetter changes the encryption', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.updateInputLetter('Z'); });
      expect(result.current.inputLetter).toBe('Z');
      expect(result.current.encryptionResult!.inputLetter).toBe('Z');
      // Different input should (usually) produce different output
      // At minimum, it updates the encryption result
      expect(result.current.encryptionResult).toBeDefined();
    });

    it('resets step to 0 when input letter changes', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      act(() => { result.current.updateInputLetter('M'); });
      expect(result.current.currentStep).toBe(0);
    });

    it('rejects invalid input', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.updateInputLetter('1'); });
      expect(result.current.inputLetter).toBe('A'); // unchanged
    });

    it('handles lowercase by converting to uppercase', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.updateInputLetter('z'); });
      expect(result.current.inputLetter).toBe('Z');
    });
  });

  describe('config change', () => {
    it('updateConfig resets step to 0', () => {
      const { result } = renderHook(() => useTutorial());
      act(() => { result.current.nextStep(); });
      act(() => {
        result.current.updateConfig({
          rotors: [
            { name: 'V', ringSetting: 1, position: 'A' },
            { name: 'III', ringSetting: 1, position: 'A' },
            { name: 'I', ringSetting: 1, position: 'A' },
          ],
          reflector: 'UKW-C',
          plugboardPairs: [],
        });
      });
      expect(result.current.currentStep).toBe(0);
    });

    it('updateConfig changes the encryption result', () => {
      const { result } = renderHook(() => useTutorial());
      const originalOutput = result.current.encryptionResult!.outputLetter;
      act(() => {
        result.current.updateConfig({
          rotors: [
            { name: 'V', ringSetting: 5, position: 'K' },
            { name: 'III', ringSetting: 12, position: 'P' },
            { name: 'I', ringSetting: 20, position: 'G' },
          ],
          reflector: 'UKW-C',
          plugboardPairs: [],
        });
      });
      // Different config should produce different result
      expect(result.current.encryptionResult).toBeDefined();
      expect(result.current.encryptionResult!.outputLetter).not.toBe(originalOutput);
    });
  });
});
