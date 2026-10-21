# Physics

A connected, evidence-led journey through cosmology, physics, chemistry, molecular biology, particles, atoms, and complex systems. Start at the root page to choose between the causal story of matter and a chronological genealogy that now exposes the bridge concepts between sciences. Each sub-folder remains a self-contained app with EN/中文 support.

Every major visual is identified as an observation, reconstructed data, calculated model, or teaching schematic. Captions call out false color, compressed time, nonphysical scale, and other important gaps between the visualization and reality.

## Apps

### 🧭 [physics](./physics/) — The Field Atlas
An interactive timeline showing how physics areas branch, inherit ideas, and recombine.

- 24 linked milestones spanning mechanics, fluids, acoustics, thermodynamics, electromagnetism, electrodynamics, relativity, astrophysics, quantum mechanics, nuclear and particle physics, condensed matter, phase transitions, plasma, information theory, biophysics, nonlinear dynamics, quantum information, and more
- Search and lineage filters with ancestor/descendant highlighting
- Public-domain portraits and historical documents stored locally with per-file licensing
- **Every field opens a sourced guide.** Seven are bespoke deep dives; the rest render from shared data through [`field.html?id=…`](./physics/field.html), each showing what the field inherited, three core ideas, where its framework stops, and authoritative references
- Deep dives: [Newtonian mechanics](./physics/newtonian.html) (numerical orbit integrator), [relativity](./physics/relativity.html) (moving light clock), [quantum mechanics](./physics/quantum.html) (double-slit sampler), [astrophysics](./physics/astrophysics.html), [light &amp; signals](./physics/electrodynamics.html), [phase transitions](./physics/phase-transitions.html) (free-energy and domain laboratory), and [entropy &amp; information](./physics/entropy-information.html) (microstate/message comparator)

**Astrophysics** covers why disks form, stellar evolution by initial mass, the Chandrasekhar, Oppenheimer–Volkoff, and Eddington limits, and why standard candles work. Its black-hole chapter adds a scrubbed core-collapse timeline, mass and metric classes, formation channels, compact-object limits, thin/thick accretion geometry, horizon/interior physics, black-hole entropy, and clearly fenced wormhole/white-hole speculation.

**Light & signals** covers Cherenkov radiation with an interactive cone angle, the strict distinction between phase, group, and front velocity, a table of apparent superluminal effects and why each preserves causality, and the three redshift mechanisms including which of them stretch the apparent pace of distant events.

**Phase transitions** connects first-order nucleation, continuous criticality, topological and quantum transitions, glassy arrest, chemistry, membranes, protein folding, biomolecular condensates, vacuum metastability, and the evidence-ranked cooling history of the early universe.

**Entropy & information** follows thermodynamic and statistical entropy into Shannon coding, Landauer erasure, Maxwell's demon, von Neumann and entanglement entropy, quantum channels and error correction, black-hole thermodynamics and the information paradox, gravitational entropy, chemistry, and living open systems.

### 🎮 [Universe, In Person / 宇宙现场](./physics/game.html) — First-person physics

**Storm islands rescue** is an original first-person adventure: carry timber or steel, build and steer a loaded raft, melt a 10 g relay sensor to open a bridge, and aim a gravity-governed capsule into the lighthouse receiver. Jump, sprint, recover at checkpoints, and replay in practice mode or an optional 120-second challenge. WASD moves, drag/arrows look, E interacts, Space jumps, and F throws. Expand view keeps the game and its touch controls together; Pause/Exit are always onscreen. Mouse capture releases on double-click or Escape. Mobile users can opt into device-rotation looking, recenter, and hold arrows to walk/steer. Portrait/landscape, permission denial, missing sensors, pause/resume and touch fallback are supported. Device look senses **rotation only**. A separate opt-in **Camera walking** mode now tracks horizontal physical displacement relative to one original stationary, upright marker, without WebXR or accelerometer integration. Open/print `physics/game-walking-marker.svg`, measure its outer black square (16 cm at actual size), enter the measured width, and keep the whole card in the rear-camera preview about 0.4–1.5 m away. Hold still to anchor, then gently move closer/farther or sideways; use touch arrows for long journeys and raft steering. Scaling is approximate and depends on the measured card and estimated camera FOV; this is **not marker-free tracking, precision measurement or ARKit**. Lost markers or sudden jumps freeze motion; reacquisition/manual movement/resume re-anchor without teleporting. Pause/Stop looking/Exit stop camera tracks, including late permission responses. Camera and orientation are separately opt-in, with no microphone, recording, uploads, third-party SDK, account, or stored/transmitted frames. Start seated; only move in a small clear indoor area, away from stairs, traffic and other people. Do not rely on the preview for obstacle avoidance. Automated Chromium tests cover native video/canvas processing of independently projected frames and the actual SVG; WebKit tests cover permissions, lifecycle and its no-camera fallback (this Windows WebKit build lacks media APIs). These are not physical iPad/iPhone hardware validation. Opt-in synthesized sound is included.

The optional **Aim throw at receiver** button calculates a gravity-correct low arc from the current position; unreachable shots prompt you to move nearer. The visible receiver has a more forgiving 1.5 m radius. Assistance only turns the view: you can still adjust aim, and the capsule follows the unchanged 11 m/s launch and 9.81 m/s² gravity without homing.

The complete earlier **Experiment lab** remains available through the mode switch: buoyancy predictions, a fictional molecular-scale lens, constant-temperature phase-change plateaus, and local observations. EN/中文, opt-in motion, and the no-WebGL notebook are retained. Geometry, steering, waves and relay machinery are illustrative; buoyancy, calorimetry and ballistic gravity are calculated. Runs are not saved; only the local best time and lab observations persist.

OpenIntelligentUI inspired procedural visualization and pause/replay/lifecycle patterns, not an imported game engine. All added geometry and sound are generated by original local code; no upstream media, branding, generated examples, AI backend or new dependencies were copied. See the [roadmap’s source and licensing notes](./PHYSICS-GAME-PLAN.md#openintelligentui-参考与版权边界--inspiration-and-rights).

The long-term worlds and implementation milestones are recorded in [PHYSICS-GAME-PLAN.md](./PHYSICS-GAME-PLAN.md). Future worlds are not yet playable. Serve this ES-module page over HTTP (`node scripts\static-server.mjs`); it is not bundled into the single-file apps below.

Targeted validation:
```powershell
node --test tests\game-model.test.mjs tests\game-adventure-model.test.mjs tests\game-adventure-controller.test.mjs tests\game-audio.test.mjs tests\game-renderer.test.mjs
npx playwright test --project=features --project=coverage "game.*(features|coverage)" --workers=1
```

### 🌌 [particle-zoo](./particle-zoo/) — The Standard Model
An interactive visual journey through the Standard Model of particle physics — and beyond.

- Standard Model chart (17 fundamental + antimatter + 8 gluons + discovery years)
- Particle detail: mass/charge/spin/discovery/forces/color-charge for 29+ particles
- Composition Builder: all 24 fermions/antifermions, selectable quark-packing plans, and live proton/neutron/atom formation. For example, 6u + 6d defaults to 2p + 2n (a helium-4 nucleus), while unstable Delta-baryon alternatives remain available and labeled.
- Forces & Interactions, Beyond Standard Model (Majorana, gravitons, sterile ν, axions, WIMPs, SUSY, anyons, glueballs…)
- Quantum Phenomena (BEC, Cooper pairs, superfluidity, quark-gluon plasma, entanglement, Pauli exclusion, topological matter, Hawking radiation)
- Live physics playground: e⁻/e⁺ annihilation → 2γ

### ⚛ [periodic-table](./periodic-table/) — The 118 Elements
An interactive periodic table where every characteristic appears **in-context** for each element.

- Full 118-element grid, color-coded by category (metal → metalloid → nonmetal → noble gas), radioactive elements flagged with ☢
- Click any element → in-line detail panel with:
  - Atomic properties (Z, mass, group, period, config, electronegativity, phase, melting/boiling, density)
  - **Animated Bohr model** — explicitly labeled historical shell model, paired with a quantum probability-density comparison
  - **Orbital shapes & hybridization** — volumetric 3D projections that do not collapse edge-on, with phase, isosurface, hybrid-model, and legacy-hybridization caveats
  - **Common oxidation states** as color-coded chips
  - **Chemical bonding matrix** (ionic, covalent, metallic, hydrogen, van der Waals) marked ● per element
  - **Signature reactions** with a 0.5-second reactant hold and data-driven gas, precipitate, heat, and correctly colored light effects
  - **Element-relevant 3D structures** — 45+ molecules, gas-phase geometries, ionic formula units, and labeled lattice fragments
  - **Nucleus / isotopes / radioactivity** — animated nucleus, isotope table, natural vs. artificial radioactivity flag
  - **Uses & discovery** (year + discoverer)
- 🔊 **English & Chinese pronunciation** via Web Speech API (buttons next to each name)
- Chinese terminology per CAS (全国科学技术名词审定委员会) glossary.

## Two ways to run any app

1. **Full multi-file version** — open `<app>/index.html`. Best for desktop.
2. **Single-file mobile version** — open `<app>/mobile/index.html` (or the `.html` file with the app's name). Copy to phone / USB / email; runs offline.

The copied app itself remains offline. Its optional cross-chapter "Story" links open the hosted GitHub Pages journey when a network connection is available, because sibling app files are not present beside a standalone copy.

## Keeping the single-file version in sync

Each app has a `build.js` that inlines all source files into `mobile/index.html`. **Never edit `mobile/*.html` by hand.**

### Manual rebuild
```bash
cd <app>
node build.js
# or: npm run build
```

### Automatic rebuild on commit (recommended)
A shared git pre-commit hook rebuilds any app whose source files change and stages the result. To enable after cloning:
```bash
git config core.hooksPath .githooks
```

Requires Node.js on your PATH.

## Media and copyright

The repository includes a small set of verified educational assets:

- NASA/WMAP and NASA/Chandra images that are public-domain U.S. government works
- A creator-released public-domain hydrogen probability-density visualization
- An ATLAS/CERN reconstructed event display under CC BY-SA 3.0
- Public-domain historical portraits of Galileo, Newton, Faraday, Maxwell, Curie, and Einstein
- Public-domain scans and photographs of the *Principia*, the 1919 eclipse expedition, and the 1927 Solvay Conference

The CERN image is **not** covered by this repository's MIT license. Full per-file attribution, license links, and scientific caveats are in [`LICENSES/THIRD-PARTY-MEDIA.md`](./LICENSES/THIRD-PARTY-MEDIA.md). Media with unclear redistribution rights, and a recent CC BY-SA Planck derivative, were deliberately not committed.

## License

MIT — do whatever you like, attribution appreciated.
