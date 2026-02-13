import type { TutorialStep } from '../../types';

type SignalPathProps = {
  steps: TutorialStep[];
  currentStep: number;
};

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

function getActiveBlockIndex(step: TutorialStep): number {
  if (step.highlightComponent === 'input') return 0;
  if (step.highlightComponent === 'output') return 10;
  if (step.highlightComponent === 'reflector') return 5;

  const componentMap: Record<string, Record<string, number>> = {
    'plugboard': { forward: 1, reverse: 9 },
    'rotor-r': { forward: 2, reverse: 8 },
    'rotor-m': { forward: 3, reverse: 7 },
    'rotor-l': { forward: 4, reverse: 6 },
  };

  return componentMap[step.highlightComponent]?.[step.direction] ?? -1;
}

function getSignalLetterAtPosition(
  stepIndex: number,
  steps: TutorialStep[],
  currentStep: number,
): string | null {
  if (stepIndex > currentStep) return null;
  const step = steps[stepIndex];
  return step?.outputLetter ?? null;
}

export function SignalPath({ steps, currentStep }: SignalPathProps) {
  const activeStep = steps[currentStep] ?? null;
  const activeBlockIndex = activeStep ? getActiveBlockIndex(activeStep) : -1;

  return (
    <div className="bg-surface rounded-default p-3 sm:p-5 border border-border">
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-center gap-[0.15rem] min-w-max sm:min-w-0 sm:flex-wrap">
        {COMPONENTS.map((comp, i) => {
          const isActive = i === activeBlockIndex;
          const isVisited = activeBlockIndex >= 0 && i <= activeBlockIndex;
          const signalLetter = getSignalLetterAtPosition(i, steps, currentStep);

          return (
            <div key={comp.id} className="flex items-center gap-[0.15rem]">
              <div
                className={`flex flex-col items-center justify-center w-11 sm:w-[58px] h-12 sm:h-16 rounded-default border-2 transition-all duration-200 relative
                  ${isActive
                    ? 'border-accent bg-accent/10 signal-glow'
                    : isVisited
                      ? 'border-surface-alt bg-bg'
                      : 'border-border bg-bg'
                  }`}
                data-component={comp.id}
              >
                <span className={`font-mono text-[0.7rem] sm:text-[0.9rem] font-bold ${isActive ? 'text-accent' : 'text-foreground'}`}>
                  {comp.shortLabel}
                </span>
                <span className="text-[0.5rem] sm:text-[0.55rem] text-muted text-center leading-tight hidden sm:block">
                  {comp.label}
                </span>
                {signalLetter && (
                  <span className="absolute -bottom-2 font-mono text-[0.7rem] font-bold text-lamp-on bg-surface px-0.5 rounded-sm">
                    {signalLetter}
                  </span>
                )}
              </div>
              {i < COMPONENTS.length - 1 && (
                <div className={`text-[0.7rem] min-w-3 text-center ${isVisited ? 'text-accent' : 'text-border'}`}>
                  {i === 4 ? '↓' : i === 5 ? '↓' : '→'}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {activeStep && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="font-mono text-base font-bold text-lamp-on mb-2">
            {activeStep.label}
          </div>
          <div className="text-[0.9rem] leading-relaxed text-foreground">
            {activeStep.description}
          </div>
        </div>
      )}
    </div>
  );
}
