import { readdir, rm } from 'node:fs/promises';

const browserRawDir = `test-results/coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;

await rm('coverage', { recursive: true, force: true });
await rm(browserRawDir, { recursive: true, force: true });
try {
  for (const entry of await readdir('test-results', { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith('coverage-raw')) {
      await rm(`test-results/${entry.name}`, { recursive: true, force: true });
    }
  }
} catch {
  // The test-results directory is absent on a clean checkout.
}
await rm('.coverage-raw', { recursive: true, force: true });
