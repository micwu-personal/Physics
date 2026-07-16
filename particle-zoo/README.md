# Particle Zoo

An interactive, bilingual (English / 简体中文) single-page web app that visualizes
the **Standard Model of particle physics**, its **fundamental interactions**, and
**beyond-Standard-Model** ideas. Everything runs in plain HTML/CSS/JS — no build
step required to develop, and a one-command bundler produces a fully offline
single-file version for mobile.

Live open goal: make particle physics *legible* through structure,
color-coded taxonomy, and short animated Feynman-style diagrams — not through
walls of text.

---

## Design philosophy

- **Show, don't just tell.** Every abstract idea (color confinement, W-boson
  exchange, pair production, gravitational radiation…) has a small visual so
  the reader gets an intuition first and the equation second.
- **Correctness over cuteness.** Diagrams follow the standard Feynman
  convention (time left→right, straight = fermion, wavy = photon, curly =
  gluon, dashed = W/Z/H). Beta decay is drawn at the *quark* level, not
  the neutron-level cartoon. Higgs → γγ shows the actual t/W loop.
- **Progressive depth.** A curious teenager should get value from the first
  tab; a physics undergrad should still learn something in the BSM and
  quantum-phenomena tabs.
- **Bilingual from day one.** Every string is keyed through `i18n.js` so
  English and Chinese stay in lock-step.
- **Zero-friction distribution.** `node build.js` inlines everything into
  `mobile/particle-zoo.html` — copy to a phone, open, done.

---

## File layout

```
particle-zoo/
├── index.html         Main structure: hero, tabs, containers
├── styles.css         Layout, dark theme, force colour palette, animations
├── app.js             All logic: PARTICLES data, tab wiring, builder canvas,
│                      playground physics, Feynman-diagram engine
├── i18n.js            LOCALES for 'en' and 'zh-CN' + particle field translations
├── build.js           Inlines CSS + JS into a single-file mobile bundle
├── package.json       npm run build → node build.js
├── README.md          (this file)
├── PROMPTS.md         Chronological log of the prompts that built this app
└── mobile/
    ├── index.html         Generated single-file bundle (~200 KB)
    └── particle-zoo.html  Identical copy under a portable filename
```

---

## Tabs

| # | Tab                | What it does                                                                 |
|---|--------------------|------------------------------------------------------------------------------|
| 1 | Standard Model     | Grid of 17 particle types organised by family & generation, color-coded     |
| 2 | Particle Detail    | Searchable card view: mass, charge, spin, discovery, forces, description    |
| 3 | Builder            | Drag quarks/electrons on a canvas; auto-recognises nucleons, nuclei, atoms  |
| 4 | Forces & Interactions | Four fundamental forces + 21 animated Feynman diagrams in 3 groups        |
| 5 | Beyond the SM      | 14 cards: dark matter, SUSY, axions, monopoles, preons, Majorana modes…     |
| 6 | Quantum Phenomena  | 9 cards: BEC, superconductivity, entanglement, QGP, Hawking radiation…      |
| 7 | Playground         | Real-time 2-D sandbox: spawn particles, watch Coulomb forces & annihilation |

---

## What is currently in the app

### Standard Model tab
- **Quarks:** u, d, c, s, t, b (each in 3 colors → 18 quark states)
- **Leptons:** e⁻, μ⁻, τ⁻ and νₑ, νμ, ντ (+ antiparticles)
- **Gauge bosons:** γ, g (8 varieties shown as one type), W±, Z⁰
- **Scalar boson:** H
- Antimatter block for antiquarks and anti-leptons

### Builder tab — recognised composites
- **Baryons:** proton (uud), neutron (udd), Δ⁺⁺ (uuu), Δ⁻ (ddd)
- **Nuclei:** ¹H, ²H, ³H, ³He, ⁴He, ⁶Li, ⁷Li (heavier → generic "Z=N nucleus")
- **Atoms:** any nucleus + orbiting electrons, up through K (Z=20)
- Warnings for free quarks ("confinement violation") and unpaired electrons
- Live animations: gluon curls inside nucleons, pion exchange between
  nucleons, photon lines proton↔electron, orbiting electron shells

### Forces & Interactions tab — 21 animated diagrams
- **Common (6):** β⁻ decay, pair production, annihilation, pp fusion,
  Higgs → γγ (via t/W loop), gluon exchange
- **Force carrier exchange (5):** strong (g), EM (γ), weak (W/Z), gravity
  (double-wavy graviton hint at spin 2), Higgs coupling
- **Less-common / high-energy (10):** Compton, Møller, Bhabha,
  Bremsstrahlung, free neutron decay, muon decay, pion decay, deep
  inelastic scattering, Z⁰ production, gravitational radiation

Animation conventions in `IX_DEFS` (see `app.js`):

| Line style          | Represents                          |
|---------------------|-------------------------------------|
| straight + arrow    | fermion (arrow reversed = anti-)    |
| sine wiggle         | photon                              |
| helical curl        | gluon                               |
| marching dashes     | W, Z, Higgs                         |
| double sine (out of phase) | graviton (spin-2 hint)      |

### Beyond the Standard Model tab
Neutrino oscillation, Majorana fermion, anyons, tetra-/pentaquarks,
glueball, graviton, sterile neutrino, axion, WIMPs, SUSY partners,
magnetic monopole, preons.

### Quantum Phenomena tab
BEC, superconductivity + Cooper pairs, superfluidity, quark-gluon plasma,
entanglement, Pauli exclusion / degeneracy pressure, topological matter,
Hawking radiation, fermionic condensate.

### Playground tab
Sandbox with e⁻, e⁺, p⁺, n⁰, γ; live Coulomb forces, wall bounce with
damping, optional trails, e⁻e⁺ annihilation → 2 γ.

---

## Development

```bash
# Just open index.html in a browser — no build needed for dev.
# When ready to ship a mobile bundle:
node build.js         # or:  npm run build
# → mobile/index.html and mobile/particle-zoo.html get regenerated.
```

Language preference persists in `localStorage` under the key `pz-lang`.

### Adding a new interaction diagram

1. Append an entry to `IX_DEFS` in `app.js` with `id`, `group`
   (`common` | `exchange` | `rare`), `tag` (`strong|em|weak|grav|higgs`),
   i18n keys for `title`/`note`, an `eq` string, and a `build()` that
   returns `{ svg, anim(el, t) }`.
2. Use the helpers already in place: `ixArrow`, `ixVertex`, `ixWavy`,
   `ixCurly`, `ixDashPhase`, `ixNucleus`.
3. Add matching `data-i18n` keys to both locales in `i18n.js`.
4. Rebuild the mobile bundle.

### Adding a new particle

1. Add to the `PARTICLES` object in `app.js` (id, symbol, class, mass,
   charge, spin, antiparticle, discovery, forces, description, facts, fun).
2. Add its i18n record in `PARTICLES_I18N` inside `i18n.js`.
3. If you want it to appear on the Standard Model grid, wire it into the
   relevant block in `index.html`.

---

## Credits & references

Built collaboratively as an educational demo. Content is drawn from
standard undergraduate references — Griffiths' *Introduction to Elementary
Particles*, Thomson's *Modern Particle Physics*, the Particle Data Group's
*Review of Particle Physics* — and recent experimental results (LHC, LIGO,
Super-Kamiokande, XENONnT, LZ, BESIII, LHCb).

See `PROMPTS.md` for the human-in-the-loop history that generated this
codebase.
