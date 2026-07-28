import { execFileSync } from 'node:child_process';

const generated = [
  'big-bang/mobile/index.html',
  'periodic-table/mobile/index.html',
  'periodic-table/mobile/periodic-table.html',
  'particle-zoo/mobile/index.html',
  'particle-zoo/mobile/particle-zoo.html'
];

const changed = execFileSync('git', ['diff', '--name-only', '--', ...generated], {
  encoding: 'utf8'
}).trim();

if (changed) {
  console.error(`Generated mobile entries are stale:\n${changed}`);
  process.exitCode = 1;
} else {
  console.log('Generated mobile entries match their source builds.');
}
