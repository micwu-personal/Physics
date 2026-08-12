import { createHash } from 'node:crypto';
import { defineConfig, devices } from '@playwright/test';

// Derive a worktree-specific port so parallel checkouts never share a static
// server (a reused server would silently serve a different revision).
const derivedPort = 50_000 + (
  Number.parseInt(createHash('sha256').update(process.cwd()).digest('hex').slice(0, 8), 16) % 10_000
);
const port = Number(process.env.PHYSICS_TEST_PORT || derivedPort);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: false,
  timeout: 180_000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['line'], ['html', { open: 'never' }]],
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01
    }
  },
  use: {
    baseURL,
    browserName: 'chromium',
    colorScheme: 'dark',
    locale: 'en-US',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/static-server.mjs',
    env: { ...process.env, PORT: String(port) },
    url: `${baseURL}/__health`,
    reuseExistingServer: false,
    timeout: 10_000
  },
  projects: [
    {
      name: 'quality-desktop',
      testMatch: /quality\.spec\.js/,
      use: { viewport: { width: 1440, height: 1000 } }
    },
    {
      name: 'quality-mobile',
      testMatch: /quality\.spec\.js/,
      use: { ...devices['Pixel 7'], browserName: 'chromium' }
    },
    {
      name: 'features',
      testMatch: /features\.spec\.js/,
      use: { viewport: { width: 1440, height: 1000 } }
    },
    {
      name: 'visual-desktop',
      testMatch: /(?:^|[\\/])visual\.spec\.js$/,
      use: { viewport: { width: 1440, height: 1000 } }
    },
    {
      name: 'visual-mobile',
      testMatch: /(?:^|[\\/])visual\.spec\.js$/,
      use: { ...devices['Pixel 7'], browserName: 'chromium' }
    },
    {
      name: 'rendering-visual',
      testMatch: /(?:^|[\\/])rendering-visual\.spec\.js$/,
      workers: 1,
      use: {
        browserName: 'chromium',
        deviceScaleFactor: 1,
        viewport: { width: 1280, height: 900 }
      }
    },
    {
      name: 'performance',
      testMatch: /performance\.spec\.js/,
      workers: 1,
      use: { viewport: { width: 1440, height: 1000 }, trace: 'off', video: 'off' }
    },
    {
      name: 'coverage',
      testMatch: /coverage\.spec\.js/,
      workers: 1,
      use: { viewport: { width: 1440, height: 1000 }, trace: 'off', video: 'off' }
    }
  ]
});
