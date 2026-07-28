import { mkdir, writeFile } from 'node:fs/promises';
import { test } from '@playwright/test';
import { exerciseBigBang, exerciseLanding, exerciseParticleZoo, exercisePeriodicTable } from './helpers/journeys.js';
import { preparePage } from './helpers/runtime.js';

const journeys = [
  { id: 'landing', path: '/', run: exerciseLanding },
  { id: 'big-bang', path: '/big-bang/', run: exerciseBigBang },
  { id: 'periodic-table', path: '/periodic-table/', run: exercisePeriodicTable },
  { id: 'particle-zoo', path: '/particle-zoo/', run: exerciseParticleZoo }
];

for (const journey of journeys) {
  for (const language of ['en', 'zh-CN']) {
    test(`${journey.id} ${language} browser coverage`, async ({ page }) => {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      await preparePage(page, journey.path, language);
      await journey.run(page);
      const coverage = await page.coverage.stopJSCoverage();
      await mkdir('test-results/coverage-raw', { recursive: true });
      await writeFile(
        `test-results/coverage-raw/${journey.id}-${language}.json`,
        `${JSON.stringify(coverage)}\n`
      );
    });
  }
}
