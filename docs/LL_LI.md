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

_No entries yet._

---

## Phase 4: History Content

_No entries yet._

---

## Phase 5: Polish & Deploy

_No entries yet._

---

## Cross-Cutting / General

_No entries yet._
