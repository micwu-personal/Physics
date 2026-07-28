# Browser quality harness

The harness separates two different completeness goals:

- **Route/locale/feature coverage:** `quality.spec.js` and `features.spec.js` enforce the complete landing, app, generated mobile/offline, English, Simplified Chinese, viewport, tab, subtab, and control-family matrix.
- **Browser JavaScript code coverage:** `coverage.spec.js` collects Chromium V8 coverage for the canonical landing and multi-file app sources. Generated single-file pages are tested functionally but are not counted again as duplicate source. `coverage-report.mjs` converts the V8 data to Istanbul metrics and enforces 100% statements, branches, functions, and lines without source exclusions.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:e2e` | Route, locale, layout, link, translation, error, and feature journeys |
| `npm run test:visual` | Desktop and mobile Chromium screenshot regression |
| `npm run test:performance` | Load, long-task, interaction, heap, RAF, listener-growth, and responsiveness budgets |
| `npm run test:coverage` | Browser coverage with enforced 100% thresholds |
| `npm run test:coverage:measure` | Generate the same report without failing, for gap analysis |

Visual baselines are intentionally named for `win32`; CI uses `windows-latest`. Canvas surfaces are exercised by feature tests but hidden in full-page screenshots because continuously animated pixels are not stable visual baselines.

## Performance budgets

The committed budgets are 5 seconds load, 250 ms p95 tab interaction, 12 MiB post-GC heap growth, no listener growth after a warm tab cycle, at most 180 RAF callbacks per idle second, at most five long tasks, and at most 500 ms total long-task time.
