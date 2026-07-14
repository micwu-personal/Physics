# Physics

A collection of interactive apps exploring physics & chemistry concepts. Each sub-folder is a self-contained app with EN/中文 support.

## Apps

### 🌌 [particle-zoo](./particle-zoo/) — The Standard Model
An interactive visual journey through the Standard Model of particle physics — and beyond.

- Standard Model chart (17 fundamental + antimatter + 8 gluons + discovery years)
- Particle detail: mass/charge/spin/discovery/forces/color-charge for 29+ particles
- Composition Builder: drag quarks & electrons → live proton/neutron/atom formation with gluon lines, EM attraction/repulsion, nuclear residual force
- Forces & Interactions, Beyond Standard Model (Majorana, gravitons, sterile ν, axions, WIMPs, SUSY, anyons, glueballs…)
- Quantum Phenomena (BEC, Cooper pairs, superfluidity, quark-gluon plasma, entanglement, Pauli exclusion, topological matter, Hawking radiation)
- Live physics playground: e⁻/e⁺ annihilation → 2γ

### ⚛ [periodic-table](./periodic-table/) — The 118 Elements
An interactive periodic table where every characteristic appears **in-context** for each element.

- Full 118-element grid, color-coded by category (metal → metalloid → nonmetal → noble gas), radioactive elements flagged with ☢
- Click any element → in-line detail panel with:
  - Atomic properties (Z, mass, group, period, config, electronegativity, phase, melting/boiling, density)
  - **Animated Bohr model** — nucleus + orbiting electrons per shell (K, L, M, N…)
  - **Orbital shapes & hybridization** — pick sp, sp², sp³, sp³d, sp³d², d²sp³, dsp², or f (auto-filtered per element)
  - **Common oxidation states** as color-coded chips
  - **Chemical bonding matrix** (ionic, covalent, metallic, hydrogen, van der Waals) marked ● per element
  - **Signature reactions** with animated visualization (▶ Play)
  - **Nucleus / isotopes / radioactivity** — animated nucleus, isotope table, natural vs. artificial radioactivity flag
  - **Uses & discovery** (year + discoverer)
- 🔊 **English & Chinese pronunciation** via Web Speech API (buttons next to each name)
- Chinese terminology per CAS (全国科学技术名词审定委员会) glossary.

## Two ways to run any app

1. **Full multi-file version** — open `<app>/index.html`. Best for desktop.
2. **Single-file mobile version** — open `<app>/mobile/index.html` (or the `.html` file with the app's name). Copy to phone / USB / email; runs offline.

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

## License

MIT — do whatever you like, attribution appreciated.
