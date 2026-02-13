# Claude Code Specification: Enigma Machine Simulator

## Meta

- **Project:** `enigma-sim`
- **Repository:** `https://github.com/Cal-ly/enigma-sim`
- **License:** AGPL-3.0
- **Stack:** TypeScript + React + Vite → GitHub Pages
- **Dev Environment:** Arch Linux, VS Code with Claude Code

---

## 1. Environment Setup & Verification

### 1.1 Required System Packages

Before starting, verify the following are available on the Arch-based dev machine. Run these checks and install anything missing:

```
# Node.js (LTS preferred, minimum v18)
node --version || echo "MISSING: Install with 'sudo pacman -S nodejs-lts-iron' or via nvm"

# npm (ships with Node)
npm --version || echo "MISSING: Should come with nodejs"

# Git
git --version || echo "MISSING: Install with 'sudo pacman -S git'"

# Optional but recommended: GitHub CLI for deployment workflows
gh --version || echo "OPTIONAL: Install with 'sudo pacman -S github-cli'"
```

If the user prefers `nvm` for Node version management, check for `nvm` availability and use it instead of system packages.

### 1.2 Project Scaffolding

Initialize with Vite's React-TypeScript template:

```
npm create vite@latest enigma-sim -- --template react-ts
cd enigma-sim
npm install
```

### 1.3 Dev Dependencies to Add

Install these after scaffolding:

- **Testing:** `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`
- **Linting:** `eslint` (Vite template includes base config) — extend with `@typescript-eslint`
- **Deployment:** `gh-pages` package or configure GitHub Actions directly (prefer Actions)

```
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 1.4 Vite Configuration

Set `base` in `vite.config.ts` to the GitHub Pages path:

```ts
base: '/enigma-sim/'
```

---

## 2. Architecture & Module Boundaries

### 2.1 Directory Structure

```
enigma-sim/
├── docs/
│   ├── CURRENT_STATE.md          # Updated by Claude Code frequently
│   └── LL_LI.md                  # Lessons learned / lessons identified
├── public/
├── src/
│   ├── engine/                   # Pure Enigma logic — ZERO UI dependencies
│   │   ├── rotor.ts              # Rotor class: wiring, position, ring setting, stepping
│   │   ├── reflector.ts          # Reflector: UKW-B, UKW-C wiring
│   │   ├── plugboard.ts          # Plugboard: pair-based symmetric substitution
│   │   ├── enigma.ts             # EnigmaMachine: orchestrates full encrypt path
│   │   ├── constants.ts          # Historical wiring tables, alphabet utilities
│   │   └── index.ts              # Public API barrel export
│   ├── components/
│   │   ├── simulator/            # Simulator tab components
│   │   │   ├── Keyboard.tsx      # On-screen keyboard input
│   │   │   ├── Lampboard.tsx     # Output display (lit letter)
│   │   │   ├── RotorDisplay.tsx  # Visual rotor windows showing current position
│   │   │   ├── PlugboardConfig.tsx
│   │   │   ├── MachineConfig.tsx # Rotor selection, ring settings, reflector
│   │   │   └── SimulatorView.tsx # Composition root for simulator tab
│   │   ├── tutorial/             # Tutorial/How It Works tab components
│   │   │   ├── SignalPath.tsx    # Animated signal path visualization
│   │   │   ├── StepControls.tsx  # Next/prev step navigation
│   │   │   └── TutorialView.tsx  # Composition root for tutorial tab
│   │   ├── history/              # History tab components
│   │   │   └── HistoryView.tsx   # Renders structured history content
│   │   ├── layout/               # Shell, navigation, shared layout
│   │   │   ├── AppShell.tsx
│   │   │   └── TabNav.tsx
│   │   └── shared/               # Reusable UI primitives
│   ├── content/
│   │   └── history.ts            # Structured history content (or .md files)
│   ├── hooks/                    # Custom React hooks
│   │   ├── useEnigma.ts          # Hook wrapping engine state for React
│   │   └── useTutorial.ts       # Hook managing tutorial step state
│   ├── types/                    # Shared TypeScript types/interfaces
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── engine/                   # Unit tests for the pure engine
│   │   ├── rotor.test.ts
│   │   ├── plugboard.test.ts
│   │   ├── enigma.test.ts        # Full round-trip + known test vectors
│   │   └── stepping.test.ts      # Double-step anomaly tests
│   └── components/               # Component tests (if needed)
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions: build + deploy to Pages
├── docs/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 2.2 Critical Boundary: Engine Isolation

The `src/engine/` directory is the most important architectural boundary in this project.

**Rules for `src/engine/`:**

- **No imports from React, any UI library, or anything outside `src/engine/` and `src/types/`.**
- All functions must be **pure** where possible (input → output, no side effects).
- The engine must be fully testable without any DOM or React test utilities.
- The engine exposes a clean public API through `src/engine/index.ts` — components interact only through this barrel export.

Think of the engine as a library that *could* be published to npm independently. If adding a line of code to `src/engine/` requires importing from `src/components/`, the design is wrong.

### 2.3 State Management

Use React's built-in state management (useState, useReducer, useContext). No external state library needed for this scope.

The `useEnigma` hook should:

- Instantiate and hold a reference to the `EnigmaMachine` instance.
- Expose methods: `pressKey(letter)`, `reset()`, `configure(settings)`.
- Track: current rotor positions, input history, output history, last lamp lit.
- Recreate the machine instance when configuration changes.

---

## 3. Implementation Phases

Execute these phases sequentially. Each phase should end with passing tests, updated `CURRENT_STATE.md`, and any lessons captured in `LL_LI.md`.

### Phase 1: Foundation (Engine + Tests)

**Goal:** A fully correct, tested Enigma engine with zero UI.

**Tasks:**

1. Scaffold the Vite project and configure the dev environment.
2. Implement `constants.ts` with historically accurate wiring tables for Rotors I–V, UKW-B, and UKW-C. Source from Crypto Museum.
3. Implement `rotor.ts`: forward/reverse signal path through a rotor accounting for position offset and ring setting. Include `step()` and `atNotch()` methods.
4. Implement `reflector.ts`: simple wiring-based substitution (no stepping).
5. Implement `plugboard.ts`: symmetric pair substitution, validate max 13 pairs, no duplicate letters.
6. Implement `enigma.ts`: wire together 3 rotors + reflector + plugboard. Implement the full signal path: plugboard → R rotor → M rotor → L rotor → reflector → L rotor → M rotor → R rotor → plugboard. Implement stepping logic **before** each keypress, including the double-step anomaly.
7. Write comprehensive tests:
   - Individual rotor substitution (forward and reverse).
   - Plugboard with 0, 1, and 13 pairs.
   - Rotor stepping sequences, specifically verifying double-step.
   - Full machine encrypt/decrypt round-trips (encrypt then decrypt with same settings must return original).
   - **Known test vectors**: validate against at least 2–3 known plaintext/ciphertext pairs from established references.

**Success Criteria:** All tests pass. The engine can encrypt "HELLOWORLD" and decrypt the result back to "HELLOWORLD" with any valid configuration.

**Update docs:** Write initial `CURRENT_STATE.md` and `LL_LI.md` entries.

### Phase 2: Simulator UI

**Goal:** A functional simulator tab where users can configure and operate the Enigma machine.

**Tasks:**

1. Build the app shell with tab navigation (Simulator | How It Works | History). Only Simulator needs content initially — the other two tabs can show placeholder text.
2. Implement `MachineConfig.tsx`: dropdowns/selectors for rotor choice (I–V in each slot), ring settings (01–26), initial positions (A–Z), and reflector (UKW-B/C). Validate that no rotor is used in two slots simultaneously.
3. Implement `PlugboardConfig.tsx`: interface for adding/removing letter pairs. Enforce max 13 pairs, no letter used twice. Show current pairs clearly.
4. Implement `Keyboard.tsx`: clickable on-screen keyboard (A–Z). Also capture physical keyboard input (letters only, case-insensitive). Each press triggers `pressKey()` on the engine.
5. Implement `Lampboard.tsx`: 26 lamp indicators, one lights up briefly on each keypress showing the encrypted output.
6. Implement `RotorDisplay.tsx`: shows current letter in each rotor window. Updates after each keypress so users can see stepping.
7. Implement input/output display: show accumulating plaintext and ciphertext side by side.
8. Implement reset controls: "Reset positions" (back to initial positions, keep config) and "Clear all" (full reset).

**Success Criteria:** A user can configure the machine, type a message, see ciphertext accumulate, then reset positions and type the ciphertext to recover the original plaintext. Rotor windows visibly step.

**Update docs:** Update `CURRENT_STATE.md` and capture any UI/integration lessons in `LL_LI.md`.

### Phase 3: Tutorial / How It Works

**Goal:** An interactive step-through visualization of the Enigma encryption process.

**Tasks:**

1. Implement `SignalPath.tsx`: a visual representation of the signal flowing through the machine. This should show all components (plugboard, 3 rotors, reflector) and highlight the active path segment at each step. Can be implemented with SVG or styled divs — choose whichever is more maintainable.
2. Implement step-by-step navigation: a "Next step" / "Previous step" control that advances through the signal path one substitution at a time. At each step, show: which component is active, the input letter to that component, the output letter, and a brief annotation explaining what happened.
3. The signal path steps for a single keypress should be approximately:
   - Step 0: Key pressed (letter X) — rotor stepping occurs.
   - Step 1: Plugboard forward (X → Y if swapped, else unchanged).
   - Step 2: Right rotor forward.
   - Step 3: Middle rotor forward.
   - Step 4: Left rotor forward.
   - Step 5: Reflector.
   - Step 6: Left rotor reverse.
   - Step 7: Middle rotor reverse.
   - Step 8: Right rotor reverse.
   - Step 9: Plugboard reverse.
   - Step 10: Output — lamp Z lights.
4. Include explanatory text for each component explaining **why** it exists — not just what it does. Use concise, educational language appropriate for CS students.
5. Allow the user to choose a starting configuration and a letter to trace.
6. Demonstrate key properties (no self-encryption, symmetry) with interactive mini-examples if feasible.

**Success Criteria:** A student unfamiliar with Enigma can step through the tutorial and understand the full signal path, the role of each component, and why the machine's design produces a polyalphabetic cipher.

**Update docs.**

### Phase 4: History Content

**Goal:** A well-written, structured history section.

**Tasks:**

1. Write or source history content covering the three areas: the machine itself, military usage and procedures, and codebreaking efforts. Organize into clear sections.
2. Store as structured data in `src/content/history.ts` (or as .md files loaded at build time — decide based on complexity preference). Using a TypeScript data structure is simpler for v1.
3. Render through `HistoryView.tsx` with clean typographic styling. No interactive elements needed — this is a reading section.
4. Ensure factual accuracy. Key facts to get right: Rejewski's work predates Turing's, Polish Bomba ≠ British Bombe, the reflector is the reason no letter encrypts to itself, Enigma was not "unbreakable" — it was broken due to a combination of mathematical insight and procedural errors.

**Success Criteria:** Content is accurate, well-organized, and reads well. A CS student finds it engaging and informative.

**Update docs.**

### Phase 5: Polish & Deploy

**Goal:** Production-ready deployment to GitHub Pages.

**Tasks:**

1. Set up GitHub Actions workflow for automated build and deploy to Pages on push to `main`.
2. Review and fix any accessibility basics: keyboard navigation through simulator, sufficient color contrast, semantic HTML.
3. Add a clear, informative README covering: project purpose, live demo link, how to run locally, architecture overview, references, and note about M4 as future extension.
4. Final pass on code comments: focus on "why" not "what."
5. Run full test suite, verify clean build, test the deployed version.

**Success Criteria:** Site is live on GitHub Pages. README is complete. All tests pass in CI.

**Final docs update.**

---

## 4. Tracking Documents

### 4.1 `docs/CURRENT_STATE.md`

This document must be kept current. **Update it at these points:**

- After completing each phase.
- After completing a significant sub-task within a phase.
- Before ending any Claude Code session.
- When changing approach or making an architectural decision.

**Content to include:**

- Current phase and progress within it.
- What was last completed.
- What is next.
- Any blockers or open questions.
- List of files created or significantly modified since last update.
- Current test status (passing/failing/count).

### 4.2 `docs/LL_LI.md`

Lessons Learned (confirmed insights) and Lessons Identified (hypotheses to verify). **Update at these points:**

- When encountering an unexpected issue and resolving it.
- When a design decision proves particularly good or bad.
- When discovering something about the toolchain, testing approach, or architecture.
- At the end of each phase (mandatory retrospective entry).

**Format:**

- Timestamped entries.
- Categorized as `[LL]` (confirmed lesson) or `[LI]` (identified, needs validation).
- Brief context, what happened, and the takeaway.

---

## 5. Coding Standards & Conventions

### 5.1 TypeScript

- Strict mode enabled (`"strict": true` in tsconfig).
- Prefer `type` over `interface` unless extending is needed.
- No `any` — use `unknown` with type narrowing if truly needed.
- Enums only for fixed, historically-defined sets (rotor names, reflector names). Prefer union types elsewhere.
- All engine functions should have explicit return types.

### 5.2 React

- Functional components only.
- Co-locate component-specific styles (CSS modules or inline — choose one approach and be consistent).
- Props types defined adjacent to the component, not in a separate file (unless shared).
- Custom hooks for any logic shared between components or any logic complex enough to benefit from isolation.

### 5.3 Testing

- Test files mirror source structure under `tests/`.
- Engine tests are the priority. Component tests are secondary and optional for v1.
- Use descriptive test names: `"encrypting then decrypting with same settings recovers plaintext"` not `"test1"`.
- Group related tests with `describe` blocks.

### 5.4 Comments

- **Engine code:** Comment the "why" behind non-obvious math, especially rotor offset calculations and the double-step mechanism.
- **Components:** Minimal comments — component names and props should be self-documenting.
- **No commented-out code** in commits.

### 5.5 Git

- Commit after each meaningful unit of work (a completed sub-task, a passing test suite addition, etc.).
- Commit messages: imperative mood, concise. E.g., `"Add rotor stepping with double-step anomaly"`, `"Wire up plugboard config component"`.
- Do not squash during development — the history is useful.

---

## 6. Historical Accuracy References

The following wiring definitions are authoritative. Use these for implementation and verify against them in tests.

### Rotor Wirings (right-to-left mapping, A=0)

These represent: for input position 0 (A), the output is the character at index 0, etc.

| Rotor | Wiring (ABCDEFGHIJKLMNOPQRSTUVWXYZ →) | Notch |
|-------|----------------------------------------|-------|
| I     | EKMFLGDQVZNTOWYHXUSPAIBRCJ             | Q (step next at Q→R) |
| II    | AJDKSIRUXBLHWTMCQGZNPYFVOE             | E (step next at E→F) |
| III   | BDFHJLCPRTXVZNYEIWGAKMUSQO             | V (step next at V→W) |
| IV    | ESOVPZJAYQUIRHXLNFTGKDCMWB             | J (step next at J→K) |
| V     | VZBRGITYUPSDNHLXAWMJQOFECK             | Z (step next at Z→A) |

### Reflector Wirings

| Reflector | Wiring                           |
|-----------|----------------------------------|
| UKW-B     | YRUHQSLDPXNGOKMIEBFZCWVJAT      |
| UKW-C     | FVPJIAOYEDRZXWGCTKUQSBNMHL      |

### Double-Step Anomaly

The stepping mechanism works as follows, executed **before** each encryption:

1. If the middle rotor is at its notch position, **both** the middle and left rotors step.
2. Else if the right rotor is at its notch position, the middle rotor steps.
3. The right rotor **always** steps.

The anomaly: in case (1), the middle rotor steps even if it just stepped in the previous keypress (due to case 2). This causes it to step twice in consecutive keypresses — hence "double-step."

### Known Test Vectors

Use these to validate the complete machine. Settings format: `Rotors [L M R], Rings [L M R], Positions [L M R], Reflector, Plugboard`.

**Vector 1 (basic, no plugboard):**
- Rotors: I II III, Rings: 01 01 01, Positions: A A A, Reflector: UKW-B, Plugboard: none
- Input: `AAAAAAAAAA`
- Expected output: `BDZGOWCXLT`

**Vector 2 (with plugboard):**
- Rotors: IV V II, Rings: 14 09 24, Positions: A A A, Reflector: UKW-B, Plugboard: AV BS CG DL FU HZ IN KM OW RX
- Input: `HELLOWORLD`
- Expected output: verify by cross-referencing with a trusted simulator (e.g., cryptii.com/pipes/enigma-machine)

**Vector 3 (double-step verification):**
- Set up a configuration where the right rotor is one step before its notch, and the middle rotor is one step before its notch. Encrypt 3–4 characters and verify the middle rotor steps twice in the expected sequence.

---

## 7. Guardrails & Edge Cases

### Engine

- Input must be uppercase A–Z only. Reject or ignore anything else.
- Plugboard: reject duplicate letters, reject more than 13 pairs, reject self-pairing.
- Rotor selection: all three slots must have distinct rotors.
- Ring settings: valid range 1–26 (or 0–25 internally — be consistent and document the convention).
- The engine must never mutate its configuration after construction. Stepping mutates position only. To change configuration, create a new instance.

### UI

- Physical keyboard input: capture only A–Z keys, ignore modifiers, prevent default browser behaviors on those keys while the simulator is focused.
- Lamp highlight duration: brief but visible (~200ms). Do not accumulate highlights.
- Tab switching must not reset the simulator state (unless the user explicitly resets).
- Plugboard UI: make it impossible to create an invalid state (disable letters already in use).

### Tutorial

- Signal path visualization must match the engine's actual behavior. Derive the tutorial step data from the engine's intermediate results, do not hardcode a separate path.
- If the engine implementation changes, the tutorial must stay in sync. This is a strong argument for the engine exposing intermediate step data.

---

## 8. Engine API Design Guidance

The engine should expose enough information for both the simulator and the tutorial. Consider an API shape like:

```typescript
// Core encryption with full trace for tutorial use
type SignalStep = {
  component: 'plugboard' | 'rotor-r' | 'rotor-m' | 'rotor-l' | 'reflector';
  direction: 'forward' | 'reverse';
  inputLetter: string;
  outputLetter: string;
};

type EncryptionResult = {
  inputLetter: string;
  outputLetter: string;
  steps: SignalStep[];           // Full signal trace
  rotorPositionsBefore: [string, string, string];
  rotorPositionsAfter: [string, string, string];
};

// The machine exposes:
encryptLetter(letter: string): EncryptionResult;
getState(): MachineState;
reset(): void;                  // Reset positions to initial
```

This design ensures the tutorial can derive its visualization directly from the engine — no separate simulation logic needed.

---

## 9. Deployment Configuration

### GitHub Actions Workflow (`deploy.yml`)

Trigger on push to `main`. Steps:

1. Checkout repo.
2. Setup Node.js (match the version used in development).
3. `npm ci` (clean install).
4. `npm run test` (fail the build if tests fail).
5. `npm run build`.
6. Deploy `dist/` to GitHub Pages using `actions/deploy-pages` or similar.

### GitHub Pages Settings

- Source: GitHub Actions.
- Ensure `vite.config.ts` has `base: '/enigma-sim/'` set correctly.

---

## 10. Non-Goals Reminder

Do NOT implement any of the following in v1:

- Naval M4 (4-rotor) variant. Mention it in README as a future extension.
- Mobile-responsive layout. Desktop-adequate is the target.
- Bombe or cryptanalysis simulation.
- Multiplayer or networked message exchange.
- Dark mode or theme switching (unless trivial to add).
- Internationalization.

If tempted to extend scope, add a note to `LL_LI.md` under `[LI]` instead.

---

## 11. Session Protocol for Claude Code

**At the start of each session:**

1. Read `docs/CURRENT_STATE.md` to understand where things stand.
2. Read `docs/LL_LI.md` to avoid repeating past mistakes.
3. Confirm the current phase and next task.

**During work:**

4. Work in small, testable increments. Run tests frequently.
5. Commit after each meaningful completion.
6. If encountering something unexpected, document it in `LL_LI.md` immediately.

**Before ending a session:**

7. Run the full test suite and note the results.
8. Update `docs/CURRENT_STATE.md` with current progress, what's done, what's next.
9. Add any new entries to `docs/LL_LI.md`.
10. Ensure all work is committed.

---

## 12. Quick Reference — Command Cheat Sheet

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview production build locally

# Testing
npx vitest               # Run tests in watch mode
npx vitest run           # Run tests once
npx vitest run --reporter=verbose  # Verbose test output

# Linting
npx eslint src/          # Lint source files

# Deployment (if using gh-pages package)
npm run deploy           # Build + push to gh-pages branch
```
