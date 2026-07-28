import { readdir, readFile, writeFile } from 'node:fs/promises';
import MCR from 'monocart-coverage-reports';

const reportOnly = process.argv.includes('--report-only');
const thresholds = { branches: 100, functions: 100, lines: 100, statements: 100 };
const report = MCR({
  name: 'Physics browser JavaScript coverage',
  outputDir: './coverage',
  baseDir: process.cwd(),
  reports: ['v8', 'html', 'json-summary', 'lcovonly', 'console-details'],
  outputFile: 'v8/index.html',
  entryFilter: entry => {
    try {
      const url = new URL(entry.url);
      return url.hostname === '127.0.0.1' && (
        url.pathname === '/' ||
        /^\/(big-bang|periodic-table|particle-zoo)\/.*\.js$/.test(url.pathname)
      );
    } catch {
      return false;
    }
  },
  v8Ignore: false,
  clean: true,
  cleanCache: true
});

for (const file of await readdir('./test-results/coverage-raw')) {
  const coverage = JSON.parse(await readFile(`./test-results/coverage-raw/${file}`, 'utf8'));
  await report.add(coverage);
}
await report.generate();

const summary = JSON.parse(await readFile('./coverage/coverage-summary.json', 'utf8'));
const totals = summary.total;
await writeFile('./coverage/thresholds.json', `${JSON.stringify({ thresholds, totals }, null, 2)}\n`);

const failures = Object.entries(thresholds)
  .filter(([metric, minimum]) => totals[metric].pct < minimum)
  .map(([metric, minimum]) => `${metric}: ${totals[metric].pct}% < ${minimum}%`);

if (failures.length && !reportOnly) {
  throw new Error(`Browser JavaScript coverage thresholds not met:\n${failures.join('\n')}`);
}

if (failures.length) {
  console.warn(`Coverage measured without enforcement:\n${failures.join('\n')}`);
}
