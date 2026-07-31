import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import MCR from 'monocart-coverage-reports';

const reportOnly = process.argv.includes('--report-only');
const browserRawDir = './test-results/coverage-raw';
const nodeRawDir = './.coverage-raw/node';
const browserRawFiles = await readdir(browserRawDir);
const nodeRawFiles = await readdir(nodeRawDir);
const localHost = '127.0.0.1';
const origin = await resolveOrigin();
const expectedSources = JSON.parse(await readFile('./scripts/coverage-sources.json', 'utf8'));
const expectedSourceSet = new Set(expectedSources);
const evidenceBySource = new Map(expectedSources.map(source => [source, new Set()]));
const browserPath = /^(big-bang|periodic-table|particle-zoo|physics)\/.*\.js$/;
const pureModules = [
  'big-bang/core.js',
  'periodic-table/science.js',
  'periodic-table/source-registry.js',
  'particle-zoo/physics-core.js',
  'particle-zoo/references.js'
];

/* The static server binds a worktree-specific port, so every URL check works on
   the loopback hostname and path only. */
function browserUrl(rawUrl) {
  try {
    const url = new URL(decodeURIComponent(rawUrl));
    return url.hostname === localHost ? url : null;
  } catch {
    return null;
  }
}

// One run must observe exactly one loopback origin; anything else means a
// foreign static server contaminated the recording.
async function resolveOrigin() {
  const origins = new Set();
  for (const file of browserRawFiles) {
    for (const entry of JSON.parse(await readFile(join(browserRawDir, file), 'utf8'))) {
      const url = browserUrl(entry.url);
      if (url) origins.add(url.origin);
    }
  }
  if (origins.size !== 1) {
    throw new Error(`Expected exactly one browser coverage origin, found: ${[...origins].join(', ') || 'none'}`);
  }
  return [...origins][0];
}

async function discoverBrowserSourceCandidates(directory, prefix = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (['mobile', 'test', 'tests'].includes(entry.name)) continue;
      files.push(...await discoverBrowserSourceCandidates(join(directory, entry.name), `${prefix}/${entry.name}`));
    } else if (
      entry.name.endsWith('.js') &&
      !['build.js', 'profile.js', 'validate.js'].includes(entry.name)
    ) {
      files.push(`${prefix}/${entry.name}`.replaceAll('\\', '/'));
    }
  }
  return files;
}

const discoveredSources = ['index.html#inline-script'];
for (const directory of ['big-bang', 'periodic-table', 'particle-zoo', 'physics']) {
  discoveredSources.push(...await discoverBrowserSourceCandidates(directory));
}
const unexpectedSources = discoveredSources.filter(source => !expectedSourceSet.has(source));
const absentManifestSources = expectedSources.filter(source => !discoveredSources.includes(source));

function sourceFromCoverageUrl(rawUrl) {
  const url = browserUrl(rawUrl);
  if (url) return url.pathname === '/' ? 'index.html#inline-script' : url.pathname.slice(1);
  const normalized = decodeURIComponent(rawUrl).replaceAll('\\', '/');
  return pureModules.find(source => normalized.endsWith(`/${source}`)) || null;
}

function recordEvidence(entries, provider) {
  for (const entry of entries) {
    const source = sourceFromCoverageUrl(entry.url);
    if (source && evidenceBySource.has(source)) evidenceBySource.get(source).add(provider);
  }
}

function reportPathForSource(source) {
  return source === 'index.html#inline-script'
    ? origin.replace(/^https?:\/\//, '').replace(':', '-')
    : source;
}

const thresholds = { branches: 100, functions: 100, lines: 100, statements: 100 };
const report = MCR({
  name: 'Physics merged JavaScript coverage',
  outputDir: './coverage',
  baseDir: process.cwd(),
  reports: ['v8', 'html', 'json', 'json-summary', 'lcovonly', 'console-details'],
  outputFile: 'v8/index.html',
  entryFilter: entry => {
    const url = browserUrl(entry.url);
    if (url) {
      const path = url.pathname.slice(1);
      // Pure modules are measured by their Node unit tests, not twice.
      return url.pathname === '/' || (browserPath.test(path) && !pureModules.includes(path));
    }
    const normalized = decodeURIComponent(entry.url).replaceAll('\\', '/');
    return pureModules.some(file => normalized.endsWith(`/${file}`));
  },
  sourcePath: filePath => {
    const normalized = filePath.replaceAll('\\', '/');
    for (const directory of ['big-bang', 'periodic-table', 'particle-zoo', 'physics']) {
      const marker = `/${directory}/`;
      const index = normalized.lastIndexOf(marker);
      if (index >= 0) return normalized.slice(index + 1);
    }
    return normalized;
  },
  v8Ignore: false,
  clean: true,
  cleanCache: true
});

for (const file of browserRawFiles) {
  const coverage = JSON.parse(await readFile(join(browserRawDir, file), 'utf8'));
  recordEvidence(coverage, `browser:${file}`);
  await report.add(coverage);
}
for (const file of nodeRawFiles) {
  const coverage = JSON.parse(await readFile(join(nodeRawDir, file), 'utf8'));
  recordEvidence(coverage.result, `node:${file}`);
  const entries = [];
  for (const entry of coverage.result) {
    const url = decodeURIComponent(entry.url).replaceAll('\\', '/');
    const modulePath = pureModules.find(candidate => url.endsWith(`/${candidate}`));
    if (!modulePath) continue;
    entries.push({ ...entry, source: await readFile(modulePath, 'utf8') });
  }
  if (entries.length) await report.add(entries);
}
await report.generate();

const summary = JSON.parse(await readFile('./coverage/coverage-summary.json', 'utf8'));
const totals = summary.total;
const zeroMetrics = Object.fromEntries(
  Object.keys(thresholds).map(metric => [metric, { total: 0, covered: 0, skipped: 0, pct: 0 }])
);
const sourceManifest = expectedSources.map(source => {
  const reportPath = reportPathForSource(source);
  const providers = [...evidenceBySource.get(source)];
  return {
    source,
    reportPath,
    providers,
    missing: providers.length === 0 || !summary[reportPath],
    metrics: summary[reportPath] || zeroMetrics
  };
});
await writeFile('./coverage/source-manifest.json', `${JSON.stringify(sourceManifest, null, 2)}\n`);
await writeFile(
  './coverage/thresholds.json',
  `${JSON.stringify({ thresholds, totals, expectedSources: expectedSources.length }, null, 2)}\n`
);

const failures = Object.entries(thresholds)
  .filter(([metric, minimum]) => totals[metric].pct < minimum)
  .map(([metric, minimum]) => `${metric}: ${totals[metric].pct}% < ${minimum}%`);
failures.push(
  ...unexpectedSources.map(source => `unclassified browser source: ${source}`),
  ...absentManifestSources.map(source => `manifest source not found: ${source}`),
  ...sourceManifest
    .filter(source => source.missing)
    .map(source => `${source.source}: 0% (missing unit/browser coverage evidence)`)
);

if (failures.length && !reportOnly) {
  throw new Error(`Merged JavaScript coverage thresholds not met:\n${failures.join('\n')}`);
}

if (failures.length) {
  console.warn(`Coverage measured without enforcement:\n${failures.join('\n')}`);
}
