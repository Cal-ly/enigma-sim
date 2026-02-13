# Current State

> **Last updated:** 2026-02-13
>
> This document is maintained by Claude Code and reflects the project's current status. Updated after each significant task, phase completion, or session end.

---

## Active Phase

**Phase:** Extension roadmap (Tiers 0–4) complete
**Status:** **COMPLETE — Production-ready with extensions**

---

## Last Completed

Tier 4 — Polish Features:
- URL state sharing: machine config persisted to URL hash, load from shared link, "Share Link" button with clipboard copy
- Frequency analysis: bar chart showing letter distribution of ciphertext output
- Meta tags: OG title/description, theme-color for mobile, inline SVG favicon
- 19 new URL state tests (encode/decode round-trips, validation edge cases)
- 178 tests passing, 65.77 kB brotli

Tier 3 — Responsive Mobile Layout:
- All components responsive at sm (640px) and md (768px) breakpoints
- MachineConfig uses CSS grid (1-col → 2-col → auto-fit)
- Keyboard/Lampboard scale down on mobile (w-8/h-8 → sm:w-9/h-9)
- SignalPath horizontally scrollable on mobile with smaller blocks
- Batch encrypt input stacks vertically on mobile, control buttons wrap

Tier 2 — M4 Naval Enigma:
- Beta/Gamma greek rotor wirings + UKW-B-thin/UKW-C-thin reflectors
- 4-rotor signal path: plugboard → R → M → L → G → reflector → G → L → M → R → plugboard
- Greek rotor never steps; validated pairing (thin reflector ↔ greek rotor)
- M4 toggle checkbox, greek rotor config slot, 4-position rotor display
- 14 M4-specific tests

Tier 1 — Foundation:
- Test suite expanded from 68 to 145 tests across 11 files
- Coverage config (v8, 40% thresholds), pre-commit hooks (husky + lint-staged)
- Bundle monitoring (size-limit, 85 kB cap), stale closure fix in useEnigma

Tier 1c — Tailwind CSS v4 Migration:
- Full migration from 975-line custom CSS to Tailwind utility classes
- Custom @theme tokens, @utility definitions for skip-link, tab-active-bar, lamp-glow, signal-glow

Tier 0 — Quick Wins (10 items):
- Batch encrypt, clipboard copy, random config, physical keyboard guard for focus, ErrorBoundary, etc.

---

## Next Up

All planned tiers complete. Potential future work:
- Operator manual overlay on the simulator (collapsible)
- "Daily order" scenario mode (encrypt/decrypt challenge)
- Additional historical machine variants (Enigma K, Swiss-K, Railway)
- Animation of rotor stepping
- Dark/light theme toggle

---

## Open Questions / Blockers

None.

---

## Files Created / Modified (All Phases)

**Engine (Phase 1 + Tier 2 M4):**
- `src/types/index.ts` — Shared types (RotorName, GreekRotorName, AnyRotorName, MachineConfig, etc.)
- `src/engine/constants.ts` — Wiring tables (I–V, Beta, Gamma, UKW-B/C, UKW-B-thin/C-thin)
- `src/engine/rotor.ts` — Rotor class (supports AnyRotorName, optional notch)
- `src/engine/reflector.ts` — Reflector class
- `src/engine/plugboard.ts` — Plugboard with validation
- `src/engine/enigma.ts` — Machine orchestration (3-rotor + M4 4-rotor signal paths)
- `src/engine/index.ts` — Barrel export

**Utilities (Tier 4):**
- `src/utils/urlState.ts` — URL hash encode/decode for shareable configs

**Tests (Phase 1 + Tiers 1–4):**
- `tests/engine/rotor.test.ts` — 26 tests
- `tests/engine/reflector.test.ts` — 7 tests
- `tests/engine/plugboard.test.ts` — 13 tests
- `tests/engine/enigma.test.ts` — 20 tests
- `tests/engine/stepping.test.ts` — 6 tests
- `tests/engine/m4.test.ts` — 14 tests (M4 Naval Enigma)
- `tests/hooks/useEnigma.test.ts` — 23 tests
- `tests/hooks/useTutorial.test.ts` — 22 tests
- `tests/components/Keyboard.test.tsx` — 9 tests
- `tests/components/TabNav.test.tsx` — 11 tests
- `tests/components/PlugboardConfig.test.tsx` — 8 tests
- `tests/utils/urlState.test.ts` — 19 tests (URL encode/decode)

**Layout (Phase 2):**
- `src/components/layout/AppShell.tsx` — App shell with tab routing
- `src/components/layout/TabNav.tsx` — Tab navigation

**Simulator (Phase 2 + Tiers 0–4):**
- `src/components/simulator/SimulatorView.tsx` — Composition root (batch encrypt, clipboard, share link, frequency analysis)
- `src/components/simulator/MachineConfig.tsx` — Rotor/reflector config (M4 toggle, greek rotor slot, responsive grid)
- `src/components/simulator/PlugboardConfig.tsx` — Plugboard management
- `src/components/simulator/Keyboard.tsx` — QWERTZ keyboard (responsive sizing)
- `src/components/simulator/Lampboard.tsx` — Output lamp display (responsive sizing)
- `src/components/simulator/RotorDisplay.tsx` — Rotor position windows (3 or 4 rotors)
- `src/components/simulator/FrequencyAnalysis.tsx` — Letter frequency bar chart
- `src/hooks/useEnigma.ts` — Engine state hook (URL persistence, M4 support)

**Tutorial (Phase 3):**
- `src/hooks/useTutorial.ts` — Tutorial step management
- `src/components/tutorial/SignalPath.tsx` — Signal path visualization
- `src/components/tutorial/StepControls.tsx` — Step navigation
- `src/components/tutorial/TutorialView.tsx` — Tutorial composition root

**History (Phase 4):**
- `src/content/history.ts` — Structured history data (3 chapters, 12 sections)
- `src/components/history/HistoryView.tsx` — History rendering

**Polish (Phase 5 + Tiers 0–4):**
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `README.md` — Comprehensive project documentation
- `index.html` — Meta description, OG tags, theme-color, inline SVG favicon
- `src/index.css` — Tailwind v4 entry (design tokens, custom utilities)
- `.husky/pre-commit` — Pre-commit hooks
- `vite.config.ts` — Tailwind + React plugins, coverage config
- `package.json` — Scripts, size-limit, lint-staged config

---

## Test Status

- **Total tests:** 178 passing across 12 files, 0 failing
- **Build:** Production build succeeds (51 modules, ~65.8 kB brotli, under 85 kB limit)
- **TypeScript:** Clean compilation across all configs
- **Coverage:** v8 provider with 40% thresholds (lines, functions, branches, statements)

---

## Architecture Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Ring setting: 1-26 external, 0-25 internal | Matches historical convention externally, simpler math internally | 2026-02-13 |
| EncryptionResult includes full SignalStep[] trace | Enables tutorial to derive visualization from engine — no separate simulation logic | 2026-02-13 |
| useEnigma: sibling setState calls instead of nested updaters | Avoids side-effects inside React state updater functions; safer under concurrent mode | 2026-02-14 |
| Consolidated shared types in src/types/index.ts | Single source of truth for types shared across hooks, content, and components | 2026-02-14 |
| Notch check happens before any stepping in stepRotors() | Required for correct double-step: must read both notch states before mutating positions | 2026-02-13 |
| Tailwind CSS v4 with @theme tokens | Single source for design tokens, utility-first = smaller CSS, better DX | 2026-02-13 |
| M4 greek rotor notch = -1 (never steps) | Historical accuracy: greek wheel was static, only 3 standard rotors step | 2026-02-13 |
| URL hash for config sharing | No server needed, bookmarkable, replaceState avoids history pollution | 2026-02-13 |
| CSS grid (auto-fit) for MachineConfig | Handles 3 or 4 rotor slots without conditional grid-cols value | 2026-02-13 |
