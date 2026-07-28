import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:43817';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: false,
  timeout: 180_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
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
    url: `${baseURL}/__health`,
    reuseExistingServer: !process.env.CI,
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
      testMatch: /visual\.spec\.js/,
      use: { viewport: { width: 1440, height: 1000 } }
    },
    {
      name: 'visual-mobile',
      testMatch: /visual\.spec\.js/,
      use: { ...devices['Pixel 7'], browserName: 'chromium' }
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
