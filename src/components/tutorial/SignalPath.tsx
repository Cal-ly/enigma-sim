import type { TutorialStep } from '../../types';

type SignalPathProps = {
  steps: TutorialStep[];
  currentStep: number;
};

/**
 * Visual representation of the Enigma signal path.
 * Uses styled divs arranged to show signal flow through each component.
 * The active component is highlighted based on the current tutorial step.
 */

type ComponentBlock = {
  id: string;
  label: string;
  shortLabel: string;
  highlightOn: TutorialStep['highlightComponent'][];
};

const COMPONENTS: ComponentBlock[] = [
  { id: 'input', label: 'Input', shortLabel: 'IN', highlightOn: ['input'] },
  { id: 'plugboard-fwd', label: 'Plugboard', shortLabel: 'PB', highlightOn: ['plugboard'] },
  { id: 'rotor-r-fwd', label: 'Right Rotor', shortLabel: 'R', highlightOn: ['rotor-r'] },
  { id: 'rotor-m-fwd', label: 'Middle Rotor', shortLabel: 'M', highlightOn: ['rotor-m'] },
  { id: 'rotor-l-fwd', label: 'Left Rotor', shortLabel: 'L', highlightOn: ['rotor-l'] },
  { id: 'reflector', label: 'Reflector', shortLabel: 'UKW', highlightOn: ['reflector'] },
  { id: 'rotor-l-rev', label: 'Left Rotor', shortLabel: 'L', highlightOn: ['rotor-l'] },
  { id: 'rotor-m-rev', label: 'Middle Rotor', shortLabel: 'M', highlightOn: ['rotor-m'] },
  { id: 'rotor-r-rev', label: 'Right Rotor', shortLabel: 'R', highlightOn: ['rotor-r'] },
  { id: 'plugboard-rev', label: 'Plugboard', shortLabel: 'PB', highlightOn: ['plugboard'] },
  { id: 'output', label: 'Output', shortLabel: 'OUT', highlightOn: ['output'] },
];

/**
 * Determine which component block indices are active for a given step.
 * Forward pass maps to the first appearance; reverse pass maps to the second.
 */
function getActiveBlockIndex(step: TutorialStep): number {
  if (step.highlightComponent === 'input') return 0;
  if (step.highlightComponent === 'output') return 10;
  if (step.highlightComponent === 'reflector') return 5;

  // For rotors and plugboard, distinguish forward vs reverse
  const componentMap: Record<string, Record<string, number>> = {
    'plugboard': { forward: 1, reverse: 9 },
    'rotor-r': { forward: 2, reverse: 8 },
    'rotor-m': { forward: 3, reverse: 7 },
    'rotor-l': { forward: 4, reverse: 6 },
  };

  return componentMap[step.highlightComponent]?.[step.direction] ?? -1;
}

/** Get the letter at a position in the signal chain for display on connections */
function getSignalLetterAtPosition(
  stepIndex: number,
  steps: TutorialStep[],
  currentStep: number,
): string | null {
  // Only show letters for steps that have been visited
  if (stepIndex > currentStep) return null;
  const step = steps[stepIndex];
  return step?.outputLetter ?? null;
}

export function SignalPath({ steps, currentStep }: SignalPathProps) {
  const activeStep = steps[currentStep] ?? null;
  const activeBlockIndex = activeStep ? getActiveBlockIndex(activeStep) : -1;

  return (
    <div className="signal-path">
      <div className="signal-path-blocks">
        {COMPONENTS.map((comp, i) => {
          const isActive = i === activeBlockIndex;
          const isVisited = activeBlockIndex >= 0 && i <= activeBlockIndex;
          // Show the signal letter that arrives at this block
          const signalLetter = getSignalLetterAtPosition(i, steps, currentStep);

          return (
            <div key={comp.id} className="signal-block-wrapper">
              <div
                className={`signal-block ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}
                data-component={comp.id}
              >
                <span className="signal-block-short">{comp.shortLabel}</span>
                <span className="signal-block-label">{comp.label}</span>
                {signalLetter && (
                  <span className="signal-block-letter">{signalLetter}</span>
                )}
              </div>
              {i < COMPONENTS.length - 1 && (
                <div className={`signal-connector ${isVisited ? 'visited' : ''}`}>
                  {i === 4 ? '↓' : i === 5 ? '↓' : '→'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeStep && (
        <div className="signal-step-info">
          <div className="signal-step-label">{activeStep.label}</div>
          <div className="signal-step-description">{activeStep.description}</div>
        </div>
      )}
    </div>
  );
}
