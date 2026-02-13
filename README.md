# Enigma Machine Simulator

An interactive, historically accurate Enigma machine simulator built with TypeScript and React. Encrypt and decrypt messages using authentic rotor wirings, explore how the signal path works step by step, and learn the fascinating history behind one of WWII's most important cryptographic devices.

**[Live Demo →](https://cal-ly.github.io/enigma-sim/)**

## Features

### Simulator
- Fully functional Enigma I simulation with rotors I–V, reflectors UKW-B and UKW-C
- Historical QWERTZ keyboard layout with both click and physical keyboard input
- Plugboard configuration (up to 13 pairs)
- Configurable ring settings and rotor starting positions
- Real-time rotor position display with accurate double-stepping
- Message display formatted in 5-letter groups

### How It Works (Tutorial)
- Step-by-step signal path visualization through all Enigma components
- Educational descriptions for each encryption stage
- Interactive letter selection to trace different encryptions
- Explanations of key Enigma properties: no self-encryption, symmetry, and the double-step anomaly

### History
- Three chapters covering the machine itself, military usage, and codebreaking efforts
- Accurately credits Polish mathematicians (Rejewski, Różycki, Zygalski) for the first breaks
- Distinguishes between the Polish Bomba and British Bombe
- Covers the impact of Ultra intelligence on the war

## Running Locally

```bash
# Clone the repository
git clone https://github.com/Cal-ly/enigma-sim.git
cd enigma-sim

# Install dependencies
npm install

# Start the development server
npm run dev

# Run the test suite
npx vitest run

# Build for production
npm run build
```

## Architecture

```
src/
├── engine/           # Pure TypeScript encryption engine (zero UI deps)
│   ├── constants.ts  # Historical rotor wirings, notch positions, alphabet utilities
│   ├── rotor.ts      # Rotor class with forward/reverse signal paths and stepping
│   ├── reflector.ts  # Reflector class
│   ├── plugboard.ts  # Plugboard with validation (max 13 pairs)
│   └── enigma.ts     # EnigmaMachine orchestrating the full signal path
├── types/            # Shared TypeScript types
├── hooks/            # React hooks (useEnigma, useTutorial)
├── components/
│   ├── layout/       # AppShell, TabNav
│   ├── simulator/    # MachineConfig, PlugboardConfig, Keyboard, Lampboard, RotorDisplay
│   ├── tutorial/     # SignalPath, StepControls, TutorialView
│   └── history/      # HistoryView
└── content/          # Structured history data
```

The engine is fully decoupled from the UI — it can be imported and used independently in any TypeScript/JavaScript project. Each `encryptLetter` call returns a `SignalStep[]` trace that powers the tutorial visualization.

## Testing

66 tests covering the encryption engine:

- **Rotor**: Forward/reverse signal paths, stepping, ring setting offsets
- **Reflector**: Correct wiring, reciprocal mapping
- **Plugboard**: Swapping, validation, edge cases
- **EnigmaMachine**: Full encryption, known vectors, symmetry, no-self-encryption property
- **Stepping**: Single step, turnover, double-step anomaly, all-rotor cascade

```bash
npx vitest run         # Run once
npx vitest             # Watch mode
```

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite** for development and production builds
- **Vitest** with jsdom for testing
- Plain CSS with custom properties (no framework)

## References

- [Crypto Museum — Enigma](https://www.cryptomuseum.com/crypto/enigma/)
- [Tony Sale's Encyclopaedia – Enigma](http://www.codesandciphers.org.uk/enigma/)
- [Wikipedia — Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine)
- [Rejewski's mathematical framework](https://en.wikipedia.org/wiki/Marian_Rejewski)

## Future Extensions

- **M4 Naval Enigma**: Four-rotor variant with thin reflectors (UKW-B thin / UKW-C thin) and the additional Beta/Gamma rotors
- **Message history**: Save/load encrypted messages with their settings
- **Mobile layout**: Responsive design for smaller screens

## License

MIT
