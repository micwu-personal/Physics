# Physics

A connected, evidence-led journey through cosmology, the major fields of physics, particles, atoms, and chemistry. Start at the root page to choose between the causal story of matter and a chronological genealogy of physical ideas. Each sub-folder remains a self-contained app with EN/中文 support.

Every major visual is identified as an observation, reconstructed data, calculated model, or teaching schematic. Captions call out false color, compressed time, nonphysical scale, and other important gaps between the visualization and reality.

## Apps

### 🧭 [physics](./physics/) — The Field Atlas
An interactive timeline showing how physics areas branch, inherit ideas, and recombine.

- 22 linked milestones spanning mechanics, fluids, acoustics, thermodynamics, electromagnetism, electrodynamics, relativity, astrophysics, quantum mechanics, nuclear and particle physics, condensed matter, plasma, biophysics, nonlinear dynamics, quantum information, and more
- Search and lineage filters with ancestor/descendant highlighting
- Public-domain portraits and historical documents stored locally with per-file licensing
- **Every field opens a guide.** Five are bespoke deep dives; the rest render from shared data through [`field.html?id=…`](./physics/field.html), each showing what the field inherited, three core ideas, and where its framework stops
- Deep dives: [Newtonian mechanics](./physics/newtonian.html) (numerical orbit integrator), [relativity](./physics/relativity.html) (moving light clock), [quantum mechanics](./physics/quantum.html) (double-slit sampler), [astrophysics](./physics/astrophysics.html), and [light &amp; signals](./physics/electrodynamics.html)

**Astrophysics** covers why disks form (Solar System, Saturn's rings, the galactic disk, accretion disks), stellar evolution by initial mass with the forces supporting each stage, step-by-step derivations of the Chandrasekhar, Oppenheimer–Volkoff, and Eddington limits, and why standard candles work.

**Light & signals** covers Cherenkov radiation with an interactive cone angle, the strict distinction between phase, group, and front velocity, a table of apparent superluminal effects and why each preserves causality, and the three redshift mechanisms including which of them stretch the apparent pace of distant events.

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
