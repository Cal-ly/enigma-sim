# Current State

> **Last updated:** 2026-02-14
>
> This document is maintained by Claude Code and reflects the project's current status. Updated after each significant task, phase completion, or session end.

---

## Active Phase

**Phase:** All phases complete (Phases 1–5) + Post-completion refactoring
**Status:** **COMPLETE — Production-ready**

---

## Last Completed

Post-completion Refactoring:
- Spec-crossreferenced code audit producing 11 categorised recommendations
- Rewrote `useEnigma` hook to eliminate `setState` inside `setConfig` updater anti-pattern; added `applyConfig` helper and `useMemo` on return object
- Added `useEffect` cleanup for lamp timer on `SimulatorView` unmount
- Removed unused props: `encryptionResult` from `SignalPath`, `onGoToStep` from `StepControls`, dead `activeId` from `HistoryView`
- Implemented full WAI-ARIA tabs pattern in `TabNav` + `AppShell` (arrow/Home/End key navigation, `aria-controls`, `tabIndex`, `role="tabpanel"`)
- Added `:focus-visible` indicators and `prefers-reduced-motion` media query
- Added `Rotor` constructor validation (ring setting 1–26, position A–Z) with descriptive error messages
- Moved inline styles to CSS classes (`.config-row--reflector`, `.plugboard-empty`, `.plugboard-separator`)
- Consolidated `TutorialStep`, `HistorySection`, `HistoryChapter` types into `src/types/index.ts`
- Added 2 new validation test cases (7 assertions) — 68 tests passing
- Final verification: `tsc -b` clean, 68 tests passing, production build succeeds (73.27 kB gzipped JS)

Phase 5 — Polish & Deploy:
- GitHub Actions workflow for automated build, test, and deploy to GitHub Pages on push to `main`
- Comprehensive README with live demo link, features, architecture overview, running instructions, references, and future extensions
- Accessibility improvements: `aria-live` on message display, meta description
- Code comments audit — all engine files have thorough "why" documentation
- Final verification: `tsc -b` clean, 66 tests passing, production build succeeds (73.15 kB gzipped JS)

Phase 4 — History Content:
- Three chapters: The Machine, Military Usage & Procedures, Breaking the Enigma
- 12 sections with accurate historical content
- Properly credits Polish mathematicians (Rejewski, Różycki, Zygalski) for first breaks
- Distinguishes Polish Bomba from British Bombe
- Structured as TypeScript data rendered through `HistoryView.tsx`
- Clean typographic styling with chapter navigation

Phase 3 — Tutorial / How It Works:
- `useTutorial` hook encapsulating step state and educational descriptions
- Signal path visualization with 11 component blocks
- Step-by-step navigation through encryption process
- Interactive letter selection
- Three property cards: no self-encryption, symmetry, double-step anomaly

---

## Next Up

Project is complete. Potential future work:
- M4 Naval Enigma (four-rotor variant)
- Message history save/load
- Responsive mobile layout
- Additional test coverage for UI components

---

## Open Questions / Blockers

None.

---

## Files Created / Modified (All Phases)

**Engine (Phase 1):**
- `src/types/index.ts` — Shared TypeScript types (consolidated: `TutorialStep`, `HistorySection`, `HistoryChapter`)
- `src/engine/constants.ts` — Rotor wirings, notches, alphabet utilities
- `src/engine/rotor.ts` — Rotor class with forward/reverse and stepping
- `src/engine/reflector.ts` — Reflector class
- `src/engine/plugboard.ts` — Plugboard with validation
- `src/engine/enigma.ts` — Full machine orchestration with signal trace
- `src/engine/index.ts` — Barrel export

**Tests (Phase 1):**
- `tests/engine/rotor.test.ts` — 26 tests (added constructor validation)
- `tests/engine/reflector.test.ts` — 7 tests
- `tests/engine/plugboard.test.ts` — 13 tests
- `tests/engine/enigma.test.ts` — 16 tests
- `tests/engine/stepping.test.ts` — 6 tests

**Layout (Phase 2):**
- `src/components/layout/AppShell.tsx` — App shell with tab routing
- `src/components/layout/TabNav.tsx` — Tab navigation

**Simulator (Phase 2):**
- `src/components/simulator/SimulatorView.tsx` — Composition root
- `src/components/simulator/MachineConfig.tsx` — Rotor/reflector config
- `src/components/simulator/PlugboardConfig.tsx` — Plugboard management
- `src/components/simulator/Keyboard.tsx` — QWERTZ keyboard
- `src/components/simulator/Lampboard.tsx` — Output lamp display
- `src/components/simulator/RotorDisplay.tsx` — Rotor position windows
- `src/hooks/useEnigma.ts` — Engine state hook

**Tutorial (Phase 3):**
- `src/hooks/useTutorial.ts` — Tutorial step management
- `src/components/tutorial/SignalPath.tsx` — Signal path visualization
- `src/components/tutorial/StepControls.tsx` — Step navigation
- `src/components/tutorial/TutorialView.tsx` — Tutorial composition root

**History (Phase 4):**
- `src/content/history.ts` — Structured history data (3 chapters, 12 sections)
- `src/components/history/HistoryView.tsx` — History rendering

**Polish (Phase 5):**
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `README.md` — Comprehensive project documentation
- `index.html` — Meta description
- `src/index.css` — Full design system (simulator + tutorial + history CSS)

---

## Test Status

- **Engine tests:** 68 passing, 0 failing
- **Build:** Production build succeeds (50 modules, 73.27 kB gzipped)
- **TypeScript:** Clean compilation across all configs

---

## Architecture Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Ring setting: 1-26 external, 0-25 internal | Matches historical convention externally, simpler math internally | 2026-02-13 |
| EncryptionResult includes full SignalStep[] trace | Enables tutorial to derive visualization from engine — no separate simulation logic | 2026-02-13 |
| useEnigma: sibling setState calls instead of nested updaters | Avoids side-effects inside React state updater functions; safer under concurrent mode | 2026-02-14 |
| Consolidated shared types in src/types/index.ts | Single source of truth for types shared across hooks, content, and components | 2026-02-14 |
| Notch check happens before any stepping in stepRotors() | Required for correct double-step: must read both notch states before mutating positions | 2026-02-13 |
