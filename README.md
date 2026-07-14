# Physics

A collection of interactive apps exploring physics concepts. Each sub-folder is a self-contained app. All apps are localized in **English** and **简体中文** (auto-detected from the browser; switch anytime with the pill in the top-right).

## Apps

### 🌌 [particle-zoo](./particle-zoo/) — the Standard Model
An interactive visual journey through the Standard Model of particle physics — and beyond.

- Standard Model chart (17 particles + antimatter mirror + 8 gluon colors + discovery years)
- Particle Detail — searchable, with mass/charge/spin/discovery/forces/color/facts for 29+ particles
- Composition Builder — drag quarks & electrons; live canvas shows strong-force gluon lines, nuclear residual force, EM attraction/repulsion; auto-detects H, ²H, ³H, ³He, ⁴He, Li, α, Δ, free quarks
- Forces & Interactions — the four forces + famous reactions
- Beyond Standard Model — Majorana, gravitons, sterile neutrinos, axions, WIMPs, SUSY, monopoles, anyons, tetra/pentaquarks, glueballs, preons
- Quantum Phenomena — BEC, Cooper pairs, superfluidity, quark-gluon plasma, entanglement, Pauli exclusion, topological matter, Hawking radiation, fermionic condensate
- Physics Playground — canvas simulation of Coulomb forces & e⁻/e⁺ annihilation

### 🌠 [big-bang](./big-bang/) — 13.8 Billion Years
An interactive journey through the entire history of the universe.

- **Cosmic Timeline** — every epoch from Planck time to the far future, with time / temperature / size / density / dominant content / key events / evidence
- **Time Machine** — log-scale slider spanning 10⁻⁴³ s → 10¹⁸ s; watch the universe grow, cool, and change composition in real time
- **Composition** — pie charts of ordinary matter / dark matter / dark energy at three key moments (now, recombination, post-nucleosynthesis)
- **Size of the Universe** — from subatomic to 93 billion light-years across, with familiar comparisons
- **Ultimate Fates** — Big Freeze, Big Rip, Big Crunch, Big Bounce, Vacuum Decay
- **Open Mysteries** — dark matter, dark energy, baryon asymmetry, inflation, Hubble tension, multiverse, fine-tuning

**Chinese physics terminology** in all apps follows the CAS-approved glossary (《物理学名词》, 全国科学技术名词审定委员会).

## Running an app

**Full multi-file version** (best for desktop):
- open `particle-zoo/index.html`
- open `big-bang/index.html`

**Single-file version** (mobile-friendly, one HTML file, ~60–160 KB):
- open `particle-zoo/mobile/index.html`
- open `big-bang/mobile/index.html`

Copy the single-file version to your phone, email it, drop it on a USB stick — it Just Works, offline (only Google Fonts are external, and the app degrades gracefully without them).

## Keeping the single-file version in sync

**Never edit `mobile/*.html` by hand** — they're generated.

### Manual rebuild
```bash
cd particle-zoo   # or: cd big-bang
node build.js
```

### Automatic rebuild on commit (recommended)
This repo ships a git pre-commit hook that rebuilds any app whose source files (`index.html`, `styles.css`, `i18n.js`, `app.js`, `build.js`) are changing. Enable once after cloning:

```bash
git config core.hooksPath .githooks
```

After that, `git commit` will rebuild any affected `mobile/*.html` files and stage them alongside your changes. Requires Node.js on your `PATH`.

## License

MIT — do whatever you like, attribution appreciated.
