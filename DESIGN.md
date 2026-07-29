---
name: Physics Journey
description: An evidence-led interactive atlas from cosmic origins to matter and elements.
colors:
  cosmic-black: "#05060d"
  deep-space: "#0b0e1c"
  starlight: "#e8ecff"
  muted-starlight: "#9ba5c4"
  ultraviolet: "#7c5cff"
  detector-cyan: "#00d4ff"
  quark-pink: "#ff6b9d"
  fusion-gold: "#ffd166"
  life-green: "#7ee8c5"
  panel: "#12162dc7"
  panel-border: "#ffffff17"
typography:
  display:
    fontFamily: "Space Grotesk, Noto Sans SC, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Space Grotesk, Noto Sans SC, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.12
  body:
    fontFamily: "Space Grotesk, Noto Sans SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  control: "999px"
  small: "8px"
  medium: "12px"
  large: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ultraviolet}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.small}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "{colors.deep-space}"
    textColor: "{colors.muted-starlight}"
    rounded: "{rounded.small}"
    padding: "10px 18px"
  floating-controls:
    backgroundColor: "{colors.deep-space}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.control}"
    padding: "4px"
  science-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.large}"
    padding: "24px"
---

# Design System: Physics Journey

## 1. Overview

**Creative North Star: "The Evidence Observatory"**

The interface is a dark, focused science-museum environment in which luminous color encodes physical domains and evidence types. Dense scientific material is staged as a causal journey with a readable primary narrative and optional inline depth. The system keeps the existing cosmic palette and canvas-led identity while replacing disconnected card browsing with chapter rhythm, visual evidence, and explicit representation labels.

It must never feel like spectacle-first science fiction. Every dramatic visual earns its place through an explanatory caption, interaction, or observed dataset.

**Key Characteristics:**
- Deep-space surfaces with high-contrast starlight text.
- Cyan for controls/data, pink for particle/QCD concepts, gold for stellar/reaction energy, and green for stable matter.
- Real media paired with precise source, license, wavelength, or reconstruction captions.
- Compact persistent controls and generous breathing room around difficult ideas.

## 2. Colors

The full palette maps learning domains without relying on color alone.

### Primary
- **Ultraviolet** (`#7c5cff`): Primary selection, focus, and chapter continuity.
- **Detector Cyan** (`#00d4ff`): Interactive controls, data-derived visuals, and links.

### Secondary
- **Quark Pink** (`#ff6b9d`): Particle and strong-interaction concepts.
- **Fusion Gold** (`#ffd166`): Stellar energy, reaction heat, and time emphasis.
- **Life Green** (`#7ee8c5`): Stable outcomes and successful conservation/assembly states.

### Neutral
- **Cosmic Black** (`#05060d`): Page background.
- **Deep Space** (`#0b0e1c`): Raised controls and dense data surfaces.
- **Starlight** (`#e8ecff`): Primary text.
- **Muted Starlight** (`#9ba5c4`): Secondary text; do not use below AA contrast.
- **Panel Border** (`#ffffff17`): Quiet full-perimeter separation.

### Named Rules

**The Evidence Color Rule.** False color, phase color, particle category color, and reaction-light color must be captioned; decorative color must never imply a measured wavelength or visible appearance.

## 3. Typography

**Display Font:** Space Grotesk (with Noto Sans SC and system fallbacks)  
**Body Font:** Space Grotesk (with Noto Sans SC and system fallbacks)  
**Label/Mono Font:** JetBrains Mono

**Character:** Geometric headings provide scale and wonder; readable sans-serif prose carries the explanation; mono is reserved for quantities, equations, symbols, and timestamps.

### Hierarchy
- **Display** (700, `clamp(3rem, 8vw, 6rem)`, 1): One journey-level idea per page.
- **Headline** (600, `clamp(2rem, 4vw, 3rem)`, 1.12): Chapter and major section titles.
- **Title** (600, 1.25rem-1.5rem, 1.25): Concept and interactive module titles.
- **Body** (400, 1rem, 1.65): Explanations capped near 70ch.
- **Label** (500, 0.75rem, normal tracking): Scientific status, units, and compact controls.

### Named Rules

**The Two-Layer Rule.** A plain-language sentence comes before specialist terminology; equations and jargon may deepen the explanation but never replace it.

## 4. Elevation

Depth comes mainly from tonal layering, full borders, and physically motivated glow. Shadows are reserved for floating controls, active media, and hover feedback; canvases and educational callouts remain flat enough to read as instruments rather than glass ornaments.

### Shadow Vocabulary
- **Floating control:** `0 12px 36px rgba(0,0,0,.45)` to separate persistent controls from content.
- **Active evidence:** `0 0 28px rgba(0,212,255,.18)` for selected data-derived media or interaction states.

### Named Rules

**The Flat-by-Default Rule.** Panels are flat at rest. Glow appears only for state, emitted light, or a labeled scientific encoding.

## 5. Components

### Buttons
- **Shape:** Compact rounded rectangle (`8px`) or pill only for segmented controls.
- **Primary:** Ultraviolet/cyan action treatment with starlight text and 10px 18px padding.
- **Hover / Focus:** Small translation on hover; visible 2px cyan focus outline with offset.
- **Secondary / Ghost:** Deep-space surface, full border, muted text promoted to starlight on interaction.

### Chips
- **Style:** Used for representation status and categories; always pair color with text or icon.
- **State:** Selected chips use a filled tint and full border; unselected chips remain readable.

### Cards / Containers
- **Corner Style:** 12px-16px.
- **Background:** Deep-space or `#12162dc7`.
- **Shadow Strategy:** Flat by default.
- **Border:** One-pixel full perimeter; never a decorative side stripe.
- **Internal Padding:** 16px for compact concepts, 24px for primary modules.

### Inputs / Fields
- **Style:** Dark surface, 1px border, 8px radius, minimum 44px touch target where practical.
- **Focus:** Cyan outline and border shift.
- **Error / Disabled:** State is written in text; color is supplementary.

### Navigation
- The chapter rail exposes previous/current/next causality. App tabs remain sticky below persistent controls, wrap on narrow screens, and never sit underneath the control cluster.

### Representation Badge
- A compact text chip names one of: observation, reconstructed data, calculated model, or teaching schematic. A nearby caption explains scale, color, time, and geometry limitations.

## 6. Do's and Don'ts

### Do:
- **Do** connect every chapter to what made it possible and what follows.
- **Do** label observations, reconstructed data, calculated probability models, and teaching schematics explicitly.
- **Do** show source, license, and false-color/reconstruction caveats with every real media asset.
- **Do** keep paused and reduced-motion states scientifically complete.
- **Do** use inline disclosure for terms at the point where they first matter.

### Don't:
- **Don't** present disconnected galleries of topic cards with no causal story.
- **Don't** invent literal-looking particles, atom orbits, reaction mechanisms, colors, scales, or speeds.
- **Don't** assume the learner already understands detector layers, orbitals, nucleosynthesis, or model limitations.
- **Don't** present unmarked simulations, artist concepts, false-color images, or data reconstructions as photographs.
- **Don't** use motion that cannot be paused, obscures the initial state, or ignores reduced-motion preferences.
- **Don't** use gradient text, decorative side-stripe borders, or glassmorphism as a default surface treatment.
