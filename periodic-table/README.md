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

### 4. Advanced views & interactive features

Beyond the per-element detail panel, the app has five higher-level modes activated from a toolbar above the periodic grid.

#### 4.1 Property overlays
Toggle bar with 9 buttons: **default categories · atomic radius · ionization energy · electronegativity · density · melting point · discovery year · cosmic origin · crust abundance**. Click any of them and every cell recolors on a two-stop gradient (blue→red, purple→yellow, etc., customized per property). A legend strip below the toolbar shows the actual numeric range and unit. Log scale is auto-applied for density and abundance to keep the ~9-order-of-magnitude range readable. The "cosmic origin" overlay is discrete — cells are painted by *how* that element was made (see §4.2).

Data comes from `features-data.js`: `F_RADIUS`, `F_IE`, `F_DENSITY`, `F_MELT`, `F_ABUNDANCE` — hand-curated from NIST / IUPAC. Compact numeric readout in each cell.

#### 4.2 Nucleosynthesis origins + cosmic timeline
Every element carries a "cosmic-origin" classification (`F_ORIGIN`): **Big Bang · cosmic-ray spallation · small-star s-process · large-star fusion · type-Ia SN dwarfs · core-collapse supernovae · neutron-star mergers · human synthesis**. A color-coded badge appears in the element detail header. Post-2017 (GW170817 kilonova) neutron-star merger contribution is reflected for the r-process elements.

A "▶ Play cosmic timeline" button on the toolbar plays a ~20-second animation across 8 eras:

1. `t ≈ 3 min after Big Bang` — H, He light up
2. `First stars ignite (~200 Myr)` — Li/Be/B from spallation and C/N/O from stellar burning
3. `AGB stars shed heavy elements` — s-process peaks
4. `Supernovae seed the galaxy` — iron-peak (Sc–Zn) plus intermediate metals
5. `Neutron-star mergers forge gold` — Au, Pt, U, all lanthanides and actinides
6. `Solar system forms (4.6 Gyr ago)` — banner-only pause
7. `Humans synthesize the transuranics` — Tc, Pm, and everything 93–118
8. `Today · 13.8 Gyr` — final state

Each element flashes gold as it's forged. Emotionally staggering when you see the r-process elements — including the gold in a wedding ring — all appear in a single flash during the neutron-star-merger era.

#### 4.3 Nuclide chart (Segrè chart)
A "⚛ Open nuclide chart" button flips into a full-screen canvas view with N (neutrons) on the x-axis and Z (protons) on the y-axis. About 380 significant isotopes are plotted as color-coded squares:

- Green = stable · Cyan = β⁻ · Orange = β⁺/EC · Yellow = α · Red = spontaneous fission · Purple = proton emission · Lavender = neutron emission

**Magic-number gridlines** (2, 8, 20, 28, 50, 82, 126) drawn in dashed gold — the nuclear shell closures. **Doubly-magic nuclides** (⁴He, ¹⁶O, ⁴⁰Ca, ⁴⁸Ca, ¹⁰⁰Sn, ²⁰⁸Pb) get a white outline. The N=Z diagonal is drawn in cyan. Wheel to zoom, drag to pan. Hovering any isotope pops a tooltip showing its formatted half-life (auto-scaled from picoseconds to gigayears), decay mode, and magic-number tags.

#### 4.4 Discovery timeline (Mendeleev time-machine)
A "🕰 Discovery Timeline" button reveals a year slider (1650–2016) below the toolbar. Drag to scrub through history — cells fade in at their `DISCOVERY[Z][0]` year. As you cross 1869, the four classic Mendeleev gaps appear as dashed-orange placeholders with "?" glyphs — exactly as they sat in his 1869 sketch. An info card explains each prediction:

- **eka-aluminium** → gallium (Ga, 1875) — Mendeleev predicted mass ~68, density 5.9; actual: 69.72 & 5.91
- **eka-silicon** → germanium (Ge, 1886) — predicted mass ~72; actual 72.63
- **eka-boron** → scandium (Sc, 1879)
- **eka-manganese** → technetium (Tc, 1937) — the last of his gaps, filled 68 years after his death

▶ Play scrubs 250 years automatically in ~10 seconds. Newly-discovered elements pop with a rotate-in "fresh discovery" flash.

#### 4.5 Ligand-field crystal-field color derivation
For every d¹..d⁹ transition metal (excluding colorless d⁰ Sc/Ti⁴⁺/Y/Zr⁴⁺ and d¹⁰ Zn/Cd/Hg/Cu⁺/Ag⁺), a new detail-panel block appears with two picker rows:

- **Metal ion** — Ti³⁺, V²⁺/V³⁺, Cr²⁺/Cr³⁺, Mn²⁺/Mn³⁺, Fe²⁺/Fe³⁺, Co²⁺/Co³⁺, Ni²⁺, Cu²⁺, Ru²⁺/Ru³⁺, Rh³⁺, Pd²⁺, Ir³⁺, Pt²⁺ (Jørgensen g values in cm⁻¹)
- **Ligand** — I⁻ → Br⁻ → Cl⁻ → F⁻ → OH⁻ → H₂O → NH₃ → en → CN⁻ → CO, from the spectrochemical series (Jørgensen f values)

A canvas draws the octahedral splitting diagram (three t₂g levels below, two eₙ above) at the correct Δ_oct magnitude (Δ = f · g), with a squiggly photon arrow indicating the electronic transition. On the right, two color swatches show the **absorbed wavelength** (computed via λ = hc/Δ, converted from cm⁻¹ to nm) and the **observed color** (its sRGB complement) — because the color you *see* is the light that is *not absorbed*.

This is where the "why is copper sulfate blue" question finally gets a physically correct answer: Cu²⁺ (g ≈ 12,500) with H₂O (f = 1.00) → Δ = 12,500 cm⁻¹ → absorption at ~800 nm (red-orange) → observed color = its complement = cyan-blue. Try switching the ligand to NH₃ (f = 1.25) and watch the color shift to the deep royal blue of tetraammine copper.

---

## File map

```
periodic-table/
├── index.html          Multi-file entry point (use this in dev)
├── styles.css          All base styles
├── i18n.js             LOCALES dictionary + applyI18n() switcher
├── data.js             ELEMENTS, EXTENDED, DISCOVERY, SIGNATURE_COLORS,
│                       MOLECULE_3D, CATEGORY_USES / _REACTIONS,
│                       category-color palette, phase labels,
│                       generateFallbackExt()
├── app.js              Grid rendering, detail panel, orbital renderer,
│                       reaction animator, 3-D molecule viewer, TTS,
│                       Bohr / nucleus canvas, event wiring
├── features/           Advanced-view add-on modules (see §4)
│   ├── features.css    All new styles
│   ├── features-i18n.js  Extra i18n keys merged into LOCALES
│   ├── features-data.js  F_RADIUS / F_IE / F_DENSITY / F_MELT /
│   │                     F_ABUNDANCE / F_ORIGIN / F_COSMIC_ERAS /
│   │                     F_NUCLIDES
│   ├── overlays.js     F1: property heatmaps
│   ├── origins.js      D1: origin badges + cosmic timeline
│   ├── nuclide.js      B1: Segrè chart view
│   ├── timeline.js     F2+A6: discovery slider & Mendeleev gaps
│   └── ligand.js       C5: crystal-field color derivation
├── build.js            Bundles all 13 source files into mobile/*.html
│                       and strips Google Fonts <link> tags
├── package.json        Just: "build": "node build.js"
├── mobile/
│   ├── index.html          Single-file offline build (~250 KB)
│   └── periodic-table.html Same file, alternate name
├── README.md           This file
└── node_modules/       Only jsdom (dev-only, gitignored)
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
- **New numeric overlay** — append to `OVERLAYS` in `features/overlays.js` plus a data table in `features/features-data.js`.
- **Cosmic origin re-classification** — edit `F_ORIGIN[Z]` in `features/features-data.js`.
- **Additional nuclide** — append to `F_NUCLIDES` as `[Z, N, decay, halfLifeSeconds]`.
- **New coordination ligand** — append to the `LIGANDS` array in `features/ligand.js` with a Jørgensen `f` value.

Everything then flows through `applyI18n()` and the render pipeline automatically.

## Localization

`i18n.js` holds a single `LOCALES` object with `en` and `zh-CN` sub-dictionaries. Add a new locale by adding another top-level key with the same set of keys translated. Chinese physics/chemistry terminology follows the 全国科学技术名词审定委员会 glossary; keep new translations consistent with that.

Auto-detects browser language on first load, stores selection in `localStorage['pt-lang']`.

## Browser support

Any evergreen browser (Chrome, Edge, Firefox, Safari — desktop or mobile). No transpilation, no polyfills. Uses modern features: canvas 2D, requestAnimationFrame, Pointer Events, Web Speech API (for TTS), `aspect-ratio` CSS. Falls back gracefully if `SpeechSynthesis` is missing.
