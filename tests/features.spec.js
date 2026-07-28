import { test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { exerciseBigBang, exerciseParticleZoo, exercisePeriodicTable } from './helpers/journeys.js';
import { locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

const journeys = [
  { name: 'Big Bang', path: '/big-bang/', run: exerciseBigBang },
  { name: 'Periodic Table', path: '/periodic-table/', run: exercisePeriodicTable },
  { name: 'Particle Zoo', path: '/particle-zoo/', run: exerciseParticleZoo }
];

for (const journey of journeys) {
  for (const language of locales) {
    test(`${journey.name} exercises every control family in ${language}`, async ({ page }) => {
      const errors = watchPage(page);
      await preparePage(page, journey.path, language);
      await journey.run(page);
      await assertNoErrors(errors);
    });
  }
}
