import { useTutorial } from '../../hooks/useTutorial';
import { SignalPath } from './SignalPath';
import { StepControls } from './StepControls';
import { ALPHABET } from '../../engine';

export function TutorialView() {
  const tutorial = useTutorial();

  return (
    <div className="tutorial">
      <section className="tutorial-intro">
        <h2>How the Enigma Machine Works</h2>
        <p>
          The Enigma machine encrypts one letter at a time through a series of electrical
          substitutions. Each keypress takes a different path through the machine because the
          rotors step before every encryption — creating a <strong>polyalphabetic cipher</strong> that
          was extraordinarily difficult to break.
        </p>
        <p>
          Use the controls below to step through the encryption of a single letter and see
          exactly what happens at each stage.
        </p>
      </section>

      <section className="tutorial-config">
        <h3>Choose a letter to trace</h3>
        <div className="tutorial-letter-select">
          <label htmlFor="tutorial-letter">Input letter:</label>
          <select
            id="tutorial-letter"
            value={tutorial.inputLetter}
            onChange={(e) => tutorial.updateInputLetter(e.target.value)}
          >
            {ALPHABET.split('').map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          {tutorial.encryptionResult && (
            <span className="tutorial-result-preview">
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

      <section className="tutorial-properties">
        <h3>Key Properties</h3>
        <div className="tutorial-property-cards">
          <div className="tutorial-property-card">
            <h4>No Self-Encryption</h4>
            <p>
              A letter can never encrypt to itself. This is a direct consequence of the
              reflector — the signal always comes back on a different wire than it went in.
              Codebreakers exploited this: if they guessed a word appeared in a message, they
              could eliminate any position where a plaintext letter aligned with the same
              ciphertext letter.
            </p>
          </div>
          <div className="tutorial-property-card">
            <h4>Symmetric Encryption</h4>
            <p>
              If A encrypts to Z with given settings, then Z encrypts to A with the same
              settings. This means the same machine and settings are used for both encryption
              and decryption — the operator types the ciphertext and reads off the plaintext.
              This was operationally convenient but also a cryptographic constraint.
            </p>
          </div>
          <div className="tutorial-property-card">
            <h4>Double-Step Anomaly</h4>
            <p>
              A mechanical quirk causes the middle rotor to sometimes step on two consecutive
              keypresses. When the right rotor triggers the middle rotor to step, and the
              middle rotor is now at its own notch, it steps again on the very next keypress
              (along with the left rotor). This was an unintended behaviour that slightly
              reduced the cipher's period.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
