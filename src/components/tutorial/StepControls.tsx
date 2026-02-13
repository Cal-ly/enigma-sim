type StepControlsProps = {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (step: number) => void;
};

export function StepControls({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
}: StepControlsProps) {
  return (
    <div className="step-controls">
      <button
        onClick={onPrev}
        disabled={currentStep === 0}
        aria-label="Previous step"
      >
        ← Prev
      </button>
      <span className="step-counter">
        Step {currentStep + 1} of {totalSteps}
      </span>
      <button
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
        aria-label="Next step"
      >
        Next →
      </button>
    </div>
  );
}
