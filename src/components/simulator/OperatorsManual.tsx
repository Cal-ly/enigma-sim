import { CollapsibleSection } from '../shared/CollapsibleSection';

export function OperatorsManual() {
  return (
    <CollapsibleSection title="Operator's Manual">
      <div className="space-y-4 text-[0.85rem] leading-relaxed text-foreground/90">
        <p className="text-muted italic">
          Field reference for Enigma cipher-machine operators. Follow these steps to
          encode or decode a message.
        </p>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            1&ensp;Daily Key Setup
          </h4>
          <p>
            Consult the daily key sheet (Tagesschlüssel). Set the <strong>rotor order</strong>,{' '}
            <strong>ring settings</strong>, <strong>reflector</strong>, and{' '}
            <strong>plugboard pairs</strong> exactly as specified. On M4 Naval machines,
            also set the thin Greek rotor (Beta / Gamma) and use the UKW-B thin or
            UKW-C thin reflector.
          </p>
        </section>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            2&ensp;Message Key (Indicator)
          </h4>
          <p>
            Choose a random three-letter <em>message key</em> (Spruchschlüssel).
            Set the rotors to the <strong>ground setting</strong> from the key sheet,
            then encipher your message key. The resulting three letters become the{' '}
            <em>indicator group</em> sent at the start of the message so the
            recipient can recover the message key.
          </p>
        </section>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            3&ensp;Encoding the Message
          </h4>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Set the rotors to your chosen message key.</li>
            <li>Type each letter of plaintext on the keyboard.</li>
            <li>Read the illuminated lamp — this is the cipher letter.</li>
            <li>Record cipher letters in traditional <strong>five-letter groups</strong>.</li>
          </ol>
        </section>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            4&ensp;Decoding
          </h4>
          <p>
            Enigma is <em>reciprocal</em>: the same settings turn ciphertext back to
            plaintext. Set the daily key, decipher the indicator to recover the
            message key, reset the rotors, and type the ciphertext. The lamps reveal
            the original plaintext.
          </p>
        </section>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            5&ensp;Message Format
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Numbers are spelled out (1 → EINS) or use a substitution table.</li>
            <li>Spaces are omitted; <strong>X</strong> is used as a word separator.</li>
            <li>Punctuation: <strong>X</strong> = full stop, <strong>YY</strong> = comma, <strong>UD</strong> = opening bracket.</li>
            <li>Group the final ciphertext into blocks of five letters for transmission.</li>
          </ul>
        </section>

        <section>
          <h4 className="text-accent uppercase tracking-wider text-[0.75rem] mb-1">
            6&ensp;Security Reminders
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Never reuse a message key within the same daily key period.</li>
            <li>Avoid predictable keys (AAA, ABC, operator initials).</li>
            <li>Destroy key sheets after use.</li>
            <li>Keep messages under 250 letters when possible — long messages aid cryptanalysis.</li>
          </ul>
        </section>
      </div>
    </CollapsibleSection>
  );
}
