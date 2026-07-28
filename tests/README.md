# Browser quality harness

The harness separates two different completeness goals:

- **Route/locale/feature coverage:** `quality.spec.js` and `features.spec.js` enforce the complete landing, app, generated mobile/offline, English, Simplified Chinese, viewport, tab, subtab, and control-family matrix.
- **Browser JavaScript code coverage:** `coverage.spec.js` collects Chromium V8 coverage for the canonical landing and multi-file app sources. Generated single-file pages are tested functionally but are not counted again as duplicate source. `coverage-report.mjs` converts the V8 data to Istanbul metrics and enforces 100% statements, branches, functions, and lines without source exclusions.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:e2e` | Route, locale, layout, link, translation, error, and feature journeys |
| `npm run test:visual` | Desktop and mobile Chromium screenshot regression |
| `npm run test:rendering` | Deterministic element-level canvas/SVG screenshot and semantic pixel regression |
| `npm run test:performance` | Load, long-task, interaction, heap, RAF, listener-growth, and responsiveness budgets |
| `npm run test:coverage` | Browser coverage with enforced 100% thresholds |
| `npm run test:coverage:measure` | Generate the same report without failing, for gap analysis |

Visual baselines are intentionally named for `win32`; CI uses `windows-latest`. The 36 route-level full-page baselines remain animation-insensitive and keep canvases hidden. `rendering-visual.spec.js` separately seeds randomness, freezes wall-clock time, controls `requestAnimationFrame`, asserts non-blank pixels and unclipped geometry, and captures deterministic element-level canvas/SVG baselines.

Each worktree automatically derives an isolated static-server port. Set `PHYSICS_TEST_PORT` only to override it explicitly.

The generated narrow Particle Zoo builder canvas is covered by non-blank pixel and unclipped-geometry assertions, while its stable result panel is snapshotted. Its curved gluon strokes exhibit Win32 subpixel raster noise at that width; the equivalent source/desktop builder canvas has exact pixel baselines in both locales.

Element captures repeat their centering scroll until geometry settles so `content-visibility:auto` surfaces are measured and snapshotted after their real dimensions replace intrinsic placeholders.

## Performance budgets

The committed budgets are 5 seconds load, 250 ms p95 tab interaction, 12 MiB post-GC heap growth, no listener growth after a warm tab cycle, at most 180 RAF callbacks per idle second, at most five long tasks, and at most 500 ms total long-task time.
