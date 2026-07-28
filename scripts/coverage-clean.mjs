import { rm } from 'node:fs/promises';

await rm('coverage', { recursive: true, force: true });
await rm('test-results/coverage-raw', { recursive: true, force: true });
await rm('.coverage-raw', { recursive: true, force: true });
