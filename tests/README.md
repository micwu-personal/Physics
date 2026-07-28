# Browser quality harness

The harness separates two different completeness goals:

- **Route/locale/feature coverage:** `quality.spec.js` and `features.spec.js` enforce the complete landing, app, generated mobile/offline, English, Simplified Chinese, viewport, tab, subtab, and control-family matrix.
- **Merged JavaScript code coverage:** `coverage.spec.js` collects Chromium V8 coverage for the canonical landing and multi-file app sources, `coverage-node.mjs` collects Node V8 coverage for the pure science modules, and `coverage-report.mjs` merges both providers into Istanbul metrics and enforces 100% statements, branches, functions, and lines without source exclusions.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:apps` | Per-app Node unit tests plus the data/DOM/science invariants in each `validate.js` |
| `npm run test:e2e` | Route, locale, layout, link, translation, error, and feature journeys |
| `npm run test:visual` | Desktop and mobile Chromium screenshot regression |
| `npm run test:rendering` | Deterministic element-level canvas/SVG screenshot and semantic pixel regression |
| `npm run test:performance` | Load, long-task, interaction, heap, RAF, listener-growth, and responsiveness budgets |
| `npm run test:coverage` | Merged Node + browser coverage with enforced 100% thresholds |
| `npm run test:coverage:measure` | Generate the same report without failing, for gap analysis |

Visual baselines are intentionally named for `win32`; CI uses `windows-latest`. The 36 route-level full-page baselines remain animation-insensitive and keep canvases hidden. `rendering-visual.spec.js` separately seeds randomness, freezes wall-clock time, controls `requestAnimationFrame`, asserts non-blank pixels and unclipped geometry, and captures deterministic element-level canvas/SVG baselines.

Each worktree automatically derives an isolated static-server port. Set `PHYSICS_TEST_PORT` only to override it explicitly.

The generated narrow Particle Zoo builder canvas is covered by non-blank pixel and unclipped-geometry assertions, while its stable result panel is snapshotted. Its curved gluon strokes exhibit Win32 subpixel raster noise at that width; the equivalent source/desktop builder canvas has exact pixel baselines in both locales.

Element captures repeat their centering scroll until geometry settles so `content-visibility:auto` surfaces are measured and snapshotted after their real dimensions replace intrinsic placeholders.

## Route / locale / feature matrix semantics

`helpers/matrix.js` is the single source of truth for the matrix:

- **Entries** — every shipped HTML entry point: the landing page, the three canonical apps, and the five generated mobile/offline bundles. `sourceEntries` is the subset that owns hand-written source; generated bundles are checked functionally and for byte-identical parity, never counted twice as source.
- **Locales** — `en` and `zh-CN`. Every journey runs once per locale, so localized strings, formatting, and language-switch re-rendering are exercised on both sides of the matrix.
- **Features** — `helpers/journeys.js` owns one journey per app. A journey is required to touch every control family the app ships: tabs, sub-tabs, sliders, checkboxes, selects, pickers, canvas pointer and touch input, drag-and-drop, keyboard-free activation paths, and the language switcher. `features.spec.js` runs those journeys under an error watcher, so any console error, uncaught exception, or local 4xx/5xx fails the run.
- **Structural invariants** — `features.spec.js` also asserts the anchors, playback lifecycle, and geometry facts that the app modules depend on instead of re-checking them defensively at runtime (required element ids, one bond direction per reaction shape, playback that stops cleanly).

## Merged coverage semantics

Coverage is merged from two providers before a single threshold gate is applied:

1. **Node (`npm run coverage:node`)** — runs each app's pure module tests with `NODE_V8_COVERAGE` and writes raw V8 data to `.coverage-raw/node`. These modules (`big-bang/core.js`, `periodic-table/science.js`, `periodic-table/source-registry.js`, `particle-zoo/physics-core.js`, `particle-zoo/references.js`) contain no DOM code, so they are covered by real unit tests.
2. **Browser (`playwright test --project=coverage`)** — starts `page.coverage.startJSCoverage()` and drives the real UI. Every DOM, canvas, animation, storage, speech, and observer path is covered by genuine user-visible interaction. `addInitScript` is only used to simulate platform states a real browser can be in — missing `IntersectionObserver`, unavailable or deferred speech synthesis, throwing `localStorage`, an empty `navigator.language`, a slow or fast timer/clock, reduced motion, a hidden document, or a different initially active tab. No application function is ever stubbed.

`scripts/coverage-report.mjs` then:

- derives the served origin from the recorded coverage data and fails if more than one loopback origin appears, so a foreign static server can never contaminate a measurement;
- filters entries to the 20 sources listed in `scripts/coverage-sources.json`, and fails if a discovered browser source is missing from the manifest or a manifest source no longer exists;
- records which providers contributed to each source in `coverage/source-manifest.json`, and fails when a manifest source has no evidence at all;
- writes `coverage/thresholds.json` and fails unless statements, branches, functions, and lines are all exactly 100%.

### Server isolation

`playwright.config.mjs` derives a worktree-specific port (`50000 + sha256(cwd) % 10000`, overridable with `PHYSICS_TEST_PORT`) and runs with `reuseExistingServer: false`, so a run always serves its own checkout and never silently attaches to another worktree's server. Every URL check in the harness and in the coverage report matches on the loopback hostname and path only, so nothing depends on the port that a given checkout happens to use.

### Staged panel rendering

Particle Zoo reveals a cold panel in chunks: `stagePanelRender(tab)` marks every `PANEL_CHUNK_SELECTORS[tab]` match `.render-pending` and a zero-delay timer reveals exactly one chunk per task, while an inline boot script clears the `render-booting` class after a 2 s fallback. Because the reveal batch is the only zero-delay `setTimeout` in the app, `coverage.spec.js` installs a timer pump in `addInitScript` that queues zero-delay tasks and releases them one at a time. That paces the real reveal loop without replacing any application function, so the staged path, a switch-away mid-queue, the resumed queue, an active-tab re-click, the reduced-motion flush, and the boot fallback (driven by a genuinely stalled script response) are all covered by real execution. `features.spec.js` additionally pins that every staged panel is worth more than one chunk and that the playground and builder canvases are sized only while their panel is active, which is what makes their former zero-box guards unreachable.

There are no source exclusions, no `v8Ignore` hints (`v8Ignore: false`), and no per-file threshold overrides. When a branch cannot be reached by any real user-visible path, the fix is to delete the unreachable code and pin the invariant that makes it unreachable in `validate.js` (data completeness, locale key parity, required DOM ids, script order) or in a `features.spec.js` component assertion — never to hide the branch from the report.

## Performance budgets

The committed budgets are 5 seconds load, 250 ms p95 tab interaction, 12 MiB post-GC heap growth, no listener growth after a warm tab cycle, at most 180 RAF callbacks per idle second, at most five long tasks, and at most 500 ms total long-task time.
