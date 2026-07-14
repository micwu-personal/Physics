# Physics

A collection of interactive apps exploring physics concepts. Each sub-folder is a self-contained app.

## Apps

### 🌌 [particle-zoo](./particle-zoo/)
An interactive visual journey through the Standard Model of particle physics — and beyond. **Available in English and 简体中文** (auto-detected from your browser, switch anytime with the pill in the top-right corner).

**Features:**
- **Standard Model chart** — all 17 fundamental particles + antimatter mirror + color/anticolor + 8 gluons + discovery years
- **Particle Detail** — searchable, with mass/charge/spin/discovery/forces/color-charge/facts for 29+ particles
- **Composition Builder** — drag quarks & electrons; live canvas shows the strong force (gluon lines), nuclear residual force, EM attraction/repulsion; auto-detects H, ²H, ³H, ³He, ⁴He, Li, α, Δ, free quarks, etc.
- **Forces & Interactions** — the four fundamental forces + famous reactions (β decay, pair production, annihilation, fusion, Higgs decay, gluon exchange)
- **Beyond Standard Model** — Majorana fermions, gravitons, sterile neutrinos, axions, WIMPs, SUSY, magnetic monopoles, anyons, tetra/pentaquarks, glueballs, preons — each flagged CONFIRMED / HYPOTHETICAL / EXOTIC
- **Quantum Phenomena** — BEC, Cooper pairs & superconductivity, superfluidity, quark-gluon plasma, entanglement, Pauli exclusion, topological matter, Hawking radiation, fermionic condensate
- **Physics Playground** — live canvas simulation: Coulomb forces, electron-positron annihilation → 2γ

**Two ways to run it:**

1. **Full multi-file version:** open [`particle-zoo/index.html`](./particle-zoo/index.html) — best for desktop.
2. **Single-file version (mobile-friendly):** open [`particle-zoo/mobile/index.html`](./particle-zoo/mobile/index.html) or [`particle-zoo/mobile/particle-zoo.html`](./particle-zoo/mobile/particle-zoo.html) — one file (~160 KB), copy it to your phone, email it, drop it on a USB stick.

**Chinese physics terminology** in the localized version follows the CAS-approved glossary (《物理学名词》, 全国科学技术名词审定委员会).

## Keeping the single-file version in sync

The single-file build is generated from the source files. **Never edit `mobile/*.html` by hand.**

### Manual rebuild
```bash
cd particle-zoo
node build.js
# or: npm run build
```

### Automatic rebuild on commit (recommended)
This repo ships a git pre-commit hook that rebuilds the single-file version whenever any of `index.html`, `styles.css`, `i18n.js`, `app.js`, or `build.js` change. To enable it after cloning:

```bash
git config core.hooksPath .githooks
```

(This has already been done in the working repo; the config is stored in `.git/config` so each clone must re-run it once.)

After that, `git commit` will automatically rebuild `mobile/index.html` and stage it alongside your changes. Requires Node.js on your PATH.

## Roadmap

More physics apps will be added here over time.

## License

MIT — do whatever you like, attribution appreciated.
