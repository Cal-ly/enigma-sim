import { useTutorial } from '../../hooks/useTutorial';
import { SignalPath } from './SignalPath';
import { StepControls } from './StepControls';
import { ALPHABET } from '../../engine';

export function TutorialView() {
  const tutorial = useTutorial();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="m-0 mb-3 text-accent">How the Enigma Machine Works</h2>
        <p className="leading-relaxed text-foreground m-0 mb-2">
          The Enigma machine encrypts one letter at a time through a series of electrical
          substitutions. Each keypress takes a different path through the machine because the
          rotors step before every encryption — creating a <strong>polyalphabetic cipher</strong> that
          was extraordinarily difficult to break.
        </p>
        <p className="leading-relaxed text-foreground m-0 mb-2">
          Use the controls below to step through the encryption of a single letter and see
          exactly what happens at each stage.
        </p>
      </section>

      <section className="bg-surface rounded-default p-4 border border-border">
        <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-widest text-muted">
          Choose a letter to trace
        </h3>
        <div className="flex items-center gap-3">
          <label htmlFor="tutorial-letter" className="text-[0.9rem] text-muted">
            Input letter:
          </label>
          <select
            id="tutorial-letter"
            value={tutorial.inputLetter}
            onChange={(e) => tutorial.updateInputLetter(e.target.value)}
            className="bg-bg text-foreground border border-border rounded-default px-2 py-1.5 text-base font-mono"
          >
            {ALPHABET.split('').map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          {tutorial.encryptionResult && (
            <span className="font-mono text-lg font-bold text-lamp-on px-3 py-1 bg-bg rounded-default">
              {tutorial.encryptionResult.inputLetter} → {tutorial.encryptionResult.outputLetter}
            </span>
          )}
        </div>
      </section>

      {tutorial.encryptionResult && (
        <>
          <SignalPath
            steps={tutorial.tutorialSteps}
            currentStep={tutorial.currentStep}
          />

          <StepControls
            currentStep={tutorial.currentStep}
            totalSteps={tutorial.tutorialSteps.length}
            onNext={tutorial.nextStep}
            onPrev={tutorial.prevStep}
          />
        </>
      )}

      <section>
        <h3 className="m-0 mb-3 text-muted text-[0.85rem] uppercase tracking-widest">
          Key Properties
        </h3>
        <div className="flex flex-col gap-3">
          {[
            {
              title: 'No Self-Encryption',
              body: 'A letter can never encrypt to itself. This is a direct consequence of the reflector — the signal always comes back on a different wire than it went in. Codebreakers exploited this: if they guessed a word appeared in a message, they could eliminate any position where a plaintext letter aligned with the same ciphertext letter.',
            },
            {
              title: 'Symmetric Encryption',
              body: "If A encrypts to Z with given settings, then Z encrypts to A with the same settings. This means the same machine and settings are used for both encryption and decryption — the operator types the ciphertext and reads off the plaintext. This was operationally convenient but also a cryptographic constraint.",
            },
            {
              title: 'Double-Step Anomaly',
              body: "A mechanical quirk causes the middle rotor to sometimes step on two consecutive keypresses. When the right rotor triggers the middle rotor to step, and the middle rotor is now at its own notch, it steps again on the very next keypress (along with the left rotor). This was an unintended behaviour that slightly reduced the cipher's period.",
            },
          ].map((card) => (
            <div key={card.title} className="bg-surface rounded-default p-4 border border-border">
              <h4 className="m-0 mb-2 text-accent text-[0.95rem]">{card.title}</h4>
              <p className="m-0 text-[0.9rem] leading-relaxed text-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
