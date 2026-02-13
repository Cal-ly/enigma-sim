# Current State

> **Last updated:** 2026-02-13
>
> This document is maintained by Claude Code and reflects the project's current status. Updated after each significant task, phase completion, or session end.

---

## Active Phase

**Phase:** Phase 2 — Simulator UI
**Status:** **COMPLETE**

---

## Last Completed

Phase 2 fully implemented:
- App shell with header and 3-tab navigation (Simulator, How It Works, History)
- `useEnigma` hook wrapping engine state for React (pressKey, configure, reset, plugboard management)
- MachineConfig: rotor selection (I–V, no duplicates enforced), ring settings (01–26), positions (A–Z), reflector (UKW-B/C)
- PlugboardConfig: add/remove pairs, max 13, disable used letters, clear display
- Keyboard: clickable QWERTZ layout + physical keyboard capture (A–Z only, ignores modifiers)
- Lampboard: 26 lamps in QWERTZ layout, 200ms highlight on output
- RotorDisplay: 3 windows showing current rotor positions
- Message display: accumulating input/output in 5-letter groups
- Reset controls: "Reset Positions" (back to initial) and "Clear All" (full reset)
- TypeScript compiles clean, production build succeeds
- All 66 engine tests still passing

---

## Next Up

1. **Phase 3: Tutorial / How It Works** — Interactive signal path visualization
2. Implement `useTutorial` hook driven by engine trace data
3. Build SignalPath, StepControls, TutorialView components
4. Wire into the "How It Works" tab

---

## Open Questions / Blockers

- Vector 2 expected output was derived from our engine (JCRNLYASZP) rather than cross-referenced. Engine correctness validated by Vector 1 + symmetry + no-self-encryption.

---

## Files Created / Modified (This Session)

**Layout:**
- `src/components/layout/AppShell.tsx` — App shell with tab routing
- `src/components/layout/TabNav.tsx` — Tab navigation component

**Simulator:**
- `src/components/simulator/SimulatorView.tsx` — Composition root
- `src/components/simulator/MachineConfig.tsx` — Rotor/reflector selectors
- `src/components/simulator/PlugboardConfig.tsx` — Plugboard pair management
- `src/components/simulator/Keyboard.tsx` — On-screen + physical keyboard
- `src/components/simulator/Lampboard.tsx` — Output lamp display
- `src/components/simulator/RotorDisplay.tsx` — Rotor position windows

**Hooks:**
- `src/hooks/useEnigma.ts` — Engine state management for React

**Config/Cleanup:**
- `src/index.css` — Full CSS design system
- `src/App.tsx` — Rewired to AppShell
- `index.html` — Updated title
- `src/vite-env.d.ts` — Vite client types
- Removed boilerplate: App.css, react.svg, vite.svg

---

## Test Status

- **Engine tests:** 66 passing, 0 failing
- **Component tests:** N/A (Phase 2)
- **Total:** 66 passing, 0 failing

---

## Architecture Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Ring setting: 1-26 external, 0-25 internal | Matches historical convention externally, simpler math internally | 2026-02-13 |
| EncryptionResult includes full SignalStep[] trace | Enables tutorial to derive visualization from engine — no separate simulation logic | 2026-02-13 |
| Notch check happens before any stepping in stepRotors() | Required for correct double-step: must read both notch states before mutating positions | 2026-02-13 |
