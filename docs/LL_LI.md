# Lessons Learned & Lessons Identified

> **Convention:** `[LL]` = Lesson Learned (confirmed insight). `[LI]` = Lesson Identified (hypothesis, needs validation).
>
> Update this document whenever encountering unexpected issues, validating design decisions, or completing a phase. Entries are timestamped and chronological.

---

## Phase 1: Foundation (Engine + Tests)

### 2026-02-13 — Vite scaffold in existing repo requires temp-dir approach

**[LL]**

**Context:** Scaffolding with `npm create vite@latest` into an existing git repo with docs.
**What happened:** Vite's create command needs a new directory. Scaffolded into a temp dir, then selectively copied files into the existing repo, preserving docs/, LICENSE, and .git/.
**Takeaway:** When adding Vite to an existing repo, scaffold into temp dir and merge. The interactive "Use Vite 8 beta?" prompt also needs stdin piping (`echo "n" |`) for non-interactive use.

### 2026-02-13 — Notch state must be read before any stepping mutation

**[LL]**

**Context:** Implementing the double-step anomaly in `stepRotors()`.
**What happened:** The stepping logic must check both `middleRotor.atNotch()` and `rightRotor.atNotch()` before calling any `.step()` methods. If you step the right rotor first, checking its notch afterward would give the wrong result for the current cycle.
**Takeaway:** Save notch states to local variables before mutating any positions. This is the key to correct double-step behaviour.

### 2026-02-13 — Engine trace design pays off immediately

**[LL]**

**Context:** Writing tests for the full signal path.
**What happened:** Having `encryptLetter()` return `SignalStep[]` with intermediate results made it trivial to verify that the output of each step feeds into the next step's input, and that the full chain is consistent.
**Takeaway:** The trace-based API design (from spec Section 8) will serve the tutorial well. No separate simulation logic needed.

### 2026-02-13 — Vector 2 expected value couldn't be externally verified

**[LI]**

**Context:** Test Vector 2 has no provided expected output — spec says to cross-reference online.
**What happened:** cryptii.com doesn't expose a scriptable API. Our engine produces `JCRNLYASZP` for the given config + HELLOWORLD. Correctness is supported by Vector 1 passing, round-trip symmetry, and no-self-encryption.
**Takeaway:** Consider adding more known vectors from published cryptanalysis papers for additional confidence. For now, the engine is validated by multiple independent properties.

---

## Phase 2: Simulator UI

### 2026-02-13 — Vite scaffold missing vite-env.d.ts

**[LL]**

**Context:** TypeScript compilation failed with "Cannot find module './index.css'" error.
**What happened:** The Vite scaffold template creates `vite-env.d.ts` with `/// <reference types="vite/client" />` which provides CSS module type declarations. Our temp-dir copy approach missed this file.
**Takeaway:** When copying Vite scaffold files, always verify `vite-env.d.ts` exists in `src/`. The `vite/client` types are essential for CSS imports, SVG imports, etc.

### 2026-02-13 — useRef requires explicit initial value in newer React types

**[LL]**

**Context:** `useRef<ReturnType<typeof setTimeout>>()` failed TS compilation.
**What happened:** React 19 types require an explicit initial value for `useRef` — passing `undefined` satisfies this: `useRef<...>(undefined)`.
**Takeaway:** Always provide an initial value to `useRef` in strict TypeScript mode.

### 2026-02-13 — vitest/config reference type needed for vite.config.ts

**[LL]**

**Context:** `test` property in `vite.config.ts` caused TS error "does not exist in type 'UserConfigExport'".
**What happened:** The `tsconfig.node.json` (which covers `vite.config.ts`) doesn't include vitest types. Using `/// <reference types="vitest/config" />` instead of `/// <reference types="vitest" />` resolved it.
**Takeaway:** Use `vitest/config` reference type specifically for vite config files.

---

## Phase 3: Tutorial / How It Works

### 2026-02-13 — Engine trace makes tutorial trivial to implement

**[LL]**

**Context:** Building the step-by-step signal path visualization for the tutorial.
**What happened:** The `SignalStep[]` trace returned by `encryptLetter()` mapped directly to tutorial steps with zero additional computation. One `useMemo` call to build `TutorialStep[]` from the engine result was sufficient.
**Takeaway:** Designing the engine to return intermediate results from day one (Phase 1 decision) eliminated the need for any tutorial-specific simulation logic. This is a clear win for the trace-based API approach.

---

## Phase 4: History Content

### 2026-02-13 — TypeScript structured data simpler than Markdown for v1

**[LL]**

**Context:** Spec offered a choice between `history.ts` data structure or `.md` files loaded at build time.
**What happened:** Using a typed `HistoryChapter[]` array with `HistorySection[]` was straightforward — no build-time markdown processing, no frontmatter parsing, full type safety for rendering.
**Takeaway:** For content-heavy sections with simple structure (title + paragraphs), TypeScript data files are the right v1 choice. Markdown would only be worth it if we needed rich formatting (code blocks, images, tables).

---

## Phase 5: Polish & Deploy

### 2026-02-13 — GitHub Pages via actions/deploy-pages is clean

**[LL]**

**Context:** Setting up GitHub Actions for deployment.
**What happened:** The `actions/upload-pages-artifact` + `actions/deploy-pages` pattern is straightforward. Key config: `permissions: pages: write, id-token: write`, and the `dist/` output directory from Vite's build.
**Takeaway:** For Vite static sites, the GitHub Actions Pages deployment is essentially a 3-step job: checkout → build → deploy. No special configuration needed beyond the base path in `vite.config.ts`.

---

## Cross-Cutting / General

### 2026-02-13 — Five-phase incremental approach worked well

**[LL]**

**Context:** Completing all 5 phases of the project.
**What happened:** The phased approach (engine → UI → tutorial → history → polish) kept each phase focused and testable. Engine tests remained green throughout all UI work. The clean separation between engine (pure TS) and UI (React) meant zero regressions.
**Takeaway:** For simulator projects, build the engine first with comprehensive tests, then layer the UI on top. The engine becomes a reliable foundation that doesn't change.

---

## Post-Completion Refactoring

### 2026-02-14 — setState inside state updater functions is a subtle anti-pattern

**[LL]**

**Context:** Reviewing `useEnigma` hook against React concurrent mode best practices.
**What happened:** The original code called `setState()` inside `setConfig(prev => { ... setState(...); return newConfig })` updater functions. While this works in React 18 legacy mode, it violates the principle that updater functions should be pure. Under concurrent mode, React may call updaters multiple times, leading to duplicated side-effects.
**Takeaway:** Never call side-effectful functions (including other state setters) inside state updater callbacks. Extract a helper function (`applyConfig`) that calls multiple `setState` calls as siblings, not nested. Wrap hook return objects in `useMemo` for stable references.

### 2026-02-14 — WAI-ARIA tabs pattern requires bidirectional keyboard + roving tabindex

**[LL]**

**Context:** Upgrading `TabNav` from basic `role="tab"` buttons to a complete WAI-ARIA tabs implementation.
**What happened:** Simply having `role="tab"` and `role="tablist"` is insufficient. The full pattern requires: arrow key navigation (Left/Right + Home/End), roving `tabIndex` (0 for active, -1 for inactive), `aria-controls` linking tabs to `tabpanel` elements, and `id`/`aria-labelledby` on panels.
**Takeaway:** Partial ARIA is worse than no ARIA — screen readers expect the full keyboard contract once roles are declared. Always implement the complete pattern per WAI-ARIA Authoring Practices.

### 2026-02-14 — useEffect cleanup prevents timer leaks on unmount

**[LL]**

**Context:** `SimulatorView` used `setTimeout` for lamp flash duration via a ref.
**What happened:** A `useEffect` cleanup function was missing, so if the component unmounted while a lamp was active, the timer would fire on an unmounted component. Fixed by adding a cleanup that clears the timer ref on unmount.
**Takeaway:** Any `setTimeout`/`setInterval` stored in a ref needs a corresponding `useEffect` return cleanup. This is easy to miss when the timer is set in an event handler rather than an effect.

### 2026-02-14 — Constructor validation catches integration errors early

**[LI]**

**Context:** Adding range and format validation to the `Rotor` constructor.
**What happened:** The `Rotor` class previously trusted callers to provide valid `ringSetting` (1–26) and `initialPosition` (A–Z). Adding throws with descriptive messages means misconfiguration explodes at construction time rather than producing silently wrong encryption.
**Takeaway:** Defensive validation at trust boundaries (constructors, public API entry points) is worth the minimal runtime cost. Descriptive error messages make debugging configuration issues trivial.
