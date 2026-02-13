## Project: Enigma Machine Simulator

### Overview

An interactive, educational web application that replicates the 3-rotor Wehrmacht Enigma machine (rotors I–V, reflectors UKW-B/C, plugboard). The target audience is Computer Science students taking cryptography as an elective. Deployed as a static site to GitHub Pages.

**Stack:** TypeScript + React, built with Vite, deployed to GitHub Pages.

**Repository:** 
- Name: `enigma-sim` 
- Link: https://github.com/Cal-ly/enigma-sim
- License: AGPL-3.0 license
### Application Structure

The app should have three distinct sections, navigable via tabs or similar top-level navigation:

**1. Simulator** A functional Enigma machine GUI where users can:

- Select rotor order (3 from rotors I–V), ring settings (01–26), and initial rotor positions (A–Z).
- Configure a plugboard with up to 13 letter pairs.
- Select reflector (UKW-B or UKW-C).
- Type input character-by-character via an on-screen keyboard or physical keyboard, seeing ciphertext accumulate in real-time.
- Observe rotor stepping visually (including the double-stepping anomaly).
- Reset the machine to current settings or clear all configuration.
- Verify correctness: encrypting ciphertext with the same settings must recover plaintext (Enigma's symmetric property).

The GUI should resemble the physical machine conceptually (keyboard, lampboard, rotor windows) without requiring pixel-perfect historical accuracy. Clean, readable, and functional over ornate.

**2. How It Works (Tutorial Mode)** A separate, guided walkthrough that explains Enigma encryption step-by-step:

- **Signal path visualization**: Show the electrical path of a single keypress through plugboard → right rotor → middle rotor → left rotor → reflector → left rotor → middle rotor → right rotor → plugboard, highlighting each substitution.
- Explain **why** each component exists: plugboard adds key-dependent permutation, rotors provide polyalphabetic substitution, reflector enables symmetric encrypt/decrypt, stepping creates a long period before repetition.
- Demonstrate key properties interactively: no letter encrypts to itself (involution property), symmetric encryption/decryption, how stepping changes the substitution with each keypress.
- Allow the user to step through the process at their own pace (e.g., "Next step" button), with clear annotations at each stage.

This section should build intuition, not just describe mechanics. Use visual highlighting and concise explanations.

**3. History** A focused, well-written narrative covering:

- The machine: origins, mechanical design, how it entered military use.
- Military usage: operational procedures, key distribution, the role of operator errors.
- Breaking Enigma: Polish contributions (Rejewski, Zygalski, Bomba), British efforts at Bletchley Park (Turing, Welchman, the Bombe), and the strategic impact of Ultra intelligence.

This should be rendered from structured content (markdown or similar), kept maintainable and factually accurate. Focused narrative over encyclopedic coverage.

### Technical Constraints & Guidelines

- **Enigma engine**: Implement as a pure, well-isolated TypeScript module with no UI dependencies. All rotor wirings, reflector wirings, and stepping logic should be historically accurate. Use established references (e.g., Crypto Museum wiring tables) and include verification against known plaintext/ciphertext pairs.
- **Architecture**: Component-based, modular. The Enigma engine, UI components, tutorial logic, and history content should be clearly separated concerns.
- **Testing**: Unit tests for the Enigma engine covering rotor stepping (including double-step), plugboard substitution, full encrypt/decrypt round-trips, and known test vectors.
- **Documentation**: Code comments focus on _why_, not _what_. A clear README covering project purpose, how to run locally, architecture overview, and references.
- **Scope discipline**: Wehrmacht 3-rotor Enigma only. The naval M4 (4-rotor) variant is a known extension point but out of scope for v1. Note it in the README as a potential future addition.
- **Deployment**: Vite build, deployed to GitHub Pages via GitHub Actions.

### Non-Goals (v1)

- Mobile-first or responsive design (desktop-adequate is fine).
- Naval M4 4-rotor variant.
- Cryptanalysis tools or Bombe simulation (potential v2 feature).
- Multiplayer/networked message exchange.

### References

- Crypto Museum Enigma wiring tables for historical accuracy.
- Existing open-source Enigma simulators for test vector validation (not for code reuse).