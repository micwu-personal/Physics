# ⚛ periodic-table

An interactive, deeply-linked, bilingual (English + 简体中文) periodic table where every characteristic of every element appears **in one place** — no separate tabs, no page reloads. Click any element and its atomic structure, orbitals, hybridization, oxidation states, signature colors, bonding, real chemical reactions, nucleus, isotopes, radioactivity, uses, and discovery all unfold in a single detail panel below the table.

Runs entirely in the browser. No build step required for development. Two distributions:

- **Multi-file** (`index.html`) — best for desktop / development.
- **Single-file mobile build** (`mobile/index.html`, `mobile/periodic-table.html`) — one self-contained `.html` (~165 KB). Fully offline, no CDN dependencies, no fonts fetched. Copy to a phone, email, USB stick, whatever.

---

## Design principles

The whole app follows a few opinionated design rules that shape everything below:

1. **In-context, not paged.** Every property of an element should appear right next to every other property of that same element. Tabs fragment understanding; a scroll doesn't. So one click on Cu shows you the metal, then its color, then its bonds, then its reactions, then its nucleus — all in a single scrolling card.
2. **Real physics, not mocked visuals.** If the app shows a d_z² orbital, it draws the actual d_z² shape (torus and all) from the spherical harmonic Y₂⁰, not a stock icon. If it shows a reaction, the atoms actually swap partners at the correct stoichiometry. If it shows a 3D molecule, the bond angles are real.
3. **Offline first.** No network dependency after the initial page load. The mobile build strips even Google Fonts and relies on system-installed families so it renders identically on a plane, in a subway, or on a laptop in a hardened lab network.
4. **Bilingual with correct terminology.** Chinese physics/chemistry vocabulary follows the CAS-approved glossary (《物理学名词》 and《化学名词》 published by 全国科学技术名词审定委员会). Not machine-translated jargon.
5. **Extensible.** Everything is data-driven. Adding a new element characteristic (color, isotope, reaction, 3-D molecule) means editing one JS table, not touching any renderer.

---

## What's inside

### 1. The 118-element periodic grid
- Standard 18-column layout, with lanthanides (57–71) and actinides (89–103) shown as an f-block strip below the main table.
- Color-coded by category: alkali · alkaline-earth · transition · post-transition · metalloid · reactive non-metal · halogen · noble gas · lanthanide · actinide.
- Elements with radioactive isotopes are flagged with a ☢ badge and a warm glow.
- Cells show Z, symbol, name, and atomic mass. Chinese element names get a larger font (12 px vs 9 px in English) because CJK characters need more pixel area to remain legible.

### 2. Per-row pronunciation buttons
- 🔊 button on the left of every period (and both f-block rows).
- Clicking a period reads every element in that row aloud in the current language, in atomic-number order.
- Period 6 correctly expands to *all 32* elements (Cs → Ba → **La…Lu** → Hf → … → Rn); period 7 similarly.
- Uses `SpeechSynthesis`. Includes a watchdog to survive Chrome/Edge's known `onend`-never-fires bug on long queues.
- Individual TTS buttons on the currently-selected element speak EN and 中文 pronunciations independently.

### 3. Element detail panel

Opens inline below the table with:

#### 3.1 Atomic properties
Z, mass, group, period, family, electron configuration, shell occupancy (K L M N O P Q), phase at STP, melting/boiling points, density, Pauling electronegativity, radioactivity class.

#### 3.2 Animated Bohr model
Nucleus colored by the element's category. Electrons orbit on real shell counts, with speed and direction alternating per shell. Not physically realistic (Bohr wasn't) but is the mental model most students carry, so we honor it as an intuitive introduction.

#### 3.3 Orbital shapes & hybridization
The most physics-heavy part of the app. For every element we compute which orbitals and hybridization modes are actually accessible:

- **Atomic orbitals** — s (sphere), p_x/p_y/p_z (dumbbells with opposite-phase lobes), d_z² (dumbbell + torus), d_x²−y², d_xy, d_xz, d_yz, f_z³, f_xyz.
- **Hybrid orbitals** — sp (180° linear), sp² (120° trigonal planar), sp³ (109.5° tetrahedral), sp³d (trigonal bipyramidal), sp³d² (octahedral), d²sp³ (inner-orbital octahedral), dsp² (square planar).

All shapes are rendered as real 3-D projections with perspective, phase-colored (cyan `+`, pink `−` for the wavefunction sign), painter's-algorithm z-sorted, drag-to-rotate, auto-spin when idle. Each shape has a bilingual explanation of *why* it looks the way it does — spherical harmonics Y_ℓ^m, nodal planes, bond angles, canonical examples (CH₄ sp³, SF₆ sp³d², cisplatin dsp², [Fe(CN)₆]³⁻ d²sp³, benzene aromatic).

The point is not just "here is the shape" but "here is the shape *because* ℓ=2 gives you these five m states, and here's what each looks like."

#### 3.4 Signature colors
For ~40 elements — every one with a chemically interesting color story — this section shows real color swatches, e.g.:

- **Cu**: red-orange metal · green patina · red Cu₂O · **blue** Cu²⁺ solution · green CuCl₂ · green flame test
- **V**: the famous vanadium rainbow (V²⁺ violet → V³⁺ green → VO²⁺ blue → VO₂⁺ yellow)
- **Mn**: pale-pink Mn²⁺ · brown MnO₂ · green MnO₄²⁻ · deep-purple MnO₄⁻
- **Fe**: green Fe²⁺, yellow-brown Fe³⁺, red-brown rust
- **Au**: yellow metal, plus **red** nanogold colloid (the Lycurgus cup / stained glass)
- Flame tests for alkali/alkaline-earth metals
- Halogen family in their characteristic pale-yellow / yellow-green / red-brown / violet appearances

Each swatch shows: a 44×44 color chip with subtle 3-D sheen, state tag (pure / flame / discharge / oxide / nano), bilingual description, hex code.

#### 3.5 Oxidation states
Color-coded chips (positive = pink, negative = cyan, zero = grey).

#### 3.6 Chemical bonding matrix
For each element, shows which of 9 bond types it typically forms:

1. **Ionic** — electron transfer + Coulomb attraction
2. **Covalent** — shared electron pair(s); note explicitly explains σ+π composition
3. **σ (sigma) bond** — head-on orbital overlap; every single bond
4. **π (pi) bond** — sideways p (or d) overlap; the "extra" bond in doubles & triples, and in aromatic rings
5. **Aromatic / delocalized π** — π electrons spread over a ring (benzene, ferrocene sandwich)
6. **Coordinate (dative)** — one atom donates both electrons; the basis of all classical complexes
7. **Metallic** — the "electron sea"
8. **Hydrogen bond** — H bonded to F/O/N attracts another F/O/N
9. **Van der Waals** — universal London-dispersion force

Bonds the element does not typically form are dimmed to 55% opacity so the full menu stays visible but the "yes"-bonds pop.

#### 3.7 Signature reactions
Hand-authored for ~12 elements, auto-generated by category for the rest. Every equation has been atom-balance-verified. Click ▶ Play to see a 4-phase animation:

1. **Approach** — reactant molecules drawn as intact structures with real bonds (single / double / triple) drift toward the center
2. **Bonds break** — bonds fade on the left; atoms fly inward to a scatter cloud with a bright collision flash
3. **Bonds re-form** — atoms flow to their positions in the product molecules; product bonds fade in
4. **Separate** — products settle into their final layout on the right

A greedy nearest-neighbor algorithm pairs each LHS atom with a same-symbol RHS atom, so you literally see a specific oxygen from O₂ end up inside H₂O. Unpaired atoms fade in/out (handles imperfectly-balanced or catalytic terms gracefully). Auto-replays every 1.5 s.

Atoms are rendered with CPK-inspired per-element colors and labels use a `contrastText()` helper that picks black-on-light or white-on-dark for legibility, with a heavy outline stroke.

The equation parser is a full recursive-descent chemical formula tokenizer — it correctly expands `Cu(NO₃)₂` to `Cu + 2N + 6O`, handles nested parentheses, Unicode subscripts, and coefficients. There's a molecule-shape library with real geometries for diatomics, H₂O (bent), NH₃ (pyramidal), CH₄, CO₂ (linear), Fe₂O₃, hydroxides M(OH)₂, nitrates M(NO₃)₂, sulfuric acid, HAuCl₄, and more.

#### 3.8 3D molecular structures
For any reaction whose molecules have defined 3D coordinates, an interactive ball-and-stick viewer appears:

- **Molecules covered**: H₂O, H₂O₂, NH₃, CH₄, C₂H₂ (acetylene), C₂H₄ (ethylene), C₂H₆ (ethane), CO₂, CO, SF₆, PCl₅, C₆H₆ (benzene), H₂SO₄, NaCl (rock-salt lattice fragment), diamond, Fe₂O₃
- Pure canvas 3-D — no three.js dependency; stays fully offline
- Perspective projection, 3-D sphere shading with specular highlight, color-split bonds (each half tinted by its atom's color), correct single/double/triple bond rendering, painter's-algorithm z-sorting
- Drag to rotate (mouse + touch), auto-rotates when idle
- Bilingual shape label per molecule (bent, tetrahedral, octahedral, trigonal bipyramidal, linear, etc.)

#### 3.9 Nucleus, isotopes, radioactivity
Animated nucleus with protons (gold) and neutrons (grey) packed in a Fibonacci-spiral pattern with gentle wobble. Isotope table with abundance, stability, and notes. Big obvious flag telling you if the element is stable, naturally radioactive, or fully radioactive (artificial only).

#### 3.10 Uses & discovery
Bilingual "what this element is used for" text and the discovery year + discoverer. Element-specific for ~12 elements; category-templated for the rest. Ancient elements ("known since antiquity") are handled explicitly.

---

## File map

```
periodic-table/
├── index.html          Multi-file entry point (use this in dev)
├── styles.css          All styles
├── i18n.js             LOCALES dictionary + applyI18n() switcher
├── data.js             ELEMENTS, EXTENDED, DISCOVERY, SIGNATURE_COLORS,
│                       MOLECULE_3D, CATEGORY_USES / _REACTIONS,
│                       category-color palette, phase labels,
│                       generateFallbackExt()
├── app.js              Grid rendering, detail panel, orbital renderer,
│                       reaction animator, 3-D molecule viewer, TTS,
│                       Bohr / nucleus canvas, event wiring
├── build.js            Bundles the 5 source files into mobile/*.html
│                       and strips Google Fonts <link> tags
├── package.json        Just: "build": "node build.js"
├── mobile/
│   ├── index.html          Single-file offline build
│   └── periodic-table.html Same file, alternate name
├── README.md           This file
└── node_modules/       Only jsdom (dev-only, for offline testing;
                        gitignored)
```

## Building the single-file version

```bash
cd periodic-table
node build.js
# or
npm run build
```

Produces two identical `.html` files in `mobile/`. The pre-commit git hook at the repo root will rebuild automatically when any source file changes, so you never need to remember.

## Extending the data

Adding a new element characteristic is intended to be a one-line edit:

- **Rich data for an element** — add an entry keyed by Z to `EXTENDED` in `data.js`. Falls back to `generateFallbackExt()` if absent.
- **Signature colors** — append to `SIGNATURE_COLORS[Z]`.
- **3D molecule** — add to `MOLECULE_3D['<formula>']` with atoms (x, y, z in Å) and bonds `[i,j,order]`.
- **Reaction template for a category** — append to `CATEGORY_REACTIONS['<cat>']`.
- **New bond type** — add to the `bonds` object in `drawBonds()` plus a `canFormX(el)` helper plus i18n keys `bond.X.name` / `bond.X.desc`.
- **Discovery year** — append to `DISCOVERY[Z]`.

Everything then flows through `applyI18n()` and the render pipeline automatically.

## Localization

`i18n.js` holds a single `LOCALES` object with `en` and `zh-CN` sub-dictionaries. Add a new locale by adding another top-level key with the same set of keys translated. Chinese physics/chemistry terminology follows the 全国科学技术名词审定委员会 glossary; keep new translations consistent with that.

Auto-detects browser language on first load, stores selection in `localStorage['pt-lang']`.

## Browser support

Any evergreen browser (Chrome, Edge, Firefox, Safari — desktop or mobile). No transpilation, no polyfills. Uses modern features: canvas 2D, requestAnimationFrame, Pointer Events, Web Speech API (for TTS), `aspect-ratio` CSS. Falls back gracefully if `SpeechSynthesis` is missing.
