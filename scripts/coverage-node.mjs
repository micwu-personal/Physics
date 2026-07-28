import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const outputDir = resolve('.coverage-raw/node');
await mkdir(outputDir, { recursive: true });

const suites = [
  {
    cwd: 'big-bang',
    args: [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-include=core.js',
      '--test-coverage-lines=100',
      '--test-coverage-functions=100',
      '--test-coverage-branches=100',
      'tests/core.test.js'
    ]
  },
  {
    cwd: 'periodic-table',
    args: [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-include=science.js',
      '--test-coverage-include=source-registry.js',
      '--test-coverage-lines=100',
      '--test-coverage-functions=100',
      '--test-coverage-branches=100',
      'test/science.test.js',
      'test/source-registry.test.js'
    ]
  },
  {
    cwd: 'particle-zoo',
    args: [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-include=physics-core.js',
      '--test-coverage-include=references.js',
      '--test-coverage-lines=100',
      '--test-coverage-functions=100',
      '--test-coverage-branches=100',
      'test/physics-core.test.js',
      'test/references.test.js'
    ]
  }
];

for (const suite of suites) {
  await new Promise((resolveSuite, rejectSuite) => {
    const child = spawn(process.execPath, suite.args, {
      cwd: resolve(suite.cwd),
      env: { ...process.env, NODE_V8_COVERAGE: outputDir },
      stdio: 'inherit'
    });
    child.on('error', rejectSuite);
    child.on('exit', code => {
      if (code === 0) resolveSuite();
      else rejectSuite(new Error(`${suite.cwd} coverage tests exited with code ${code}`));
    });
  });
}
