import { expect, test } from '@playwright/test';
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

/* Structural invariants the periodic-table feature modules rely on instead of
   re-checking them defensively on every render. */
test('Periodic Table exposes the anchors its feature modules require', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  for (const selector of [
    '#viewToolbar', '#viewLegend', '#dName', '#dCategory', '#nucleusCanvas',
    '.pt-wrap', '.d-block h3[data-i18n="detail.section.colors"]'
  ]) {
    await expect(page.locator(selector), `${selector} anchors a feature module`).toHaveCount(1);
  }
  const cellsWithoutZ = await page.locator('.cell:not(.empty):not(.placeholder):not([data-z])').count();
  expect(cellsWithoutZ, 'every rendered element cell carries its atomic number').toBe(0);

  await page.locator('#tlToggleBtn').click();
  for (const selector of ['#timelinePanel h3', '#tlPlay', '#tlSlider']) {
    await expect(page.locator(selector), `${selector} is built with the timeline panel`).toHaveCount(1);
  }
  await page.locator('#nuclideOpenBtn').click();
  for (const selector of ['#nuclideView h2', '#nuclideBack', '#nuclideLegend']) {
    await expect(page.locator(selector), `${selector} is built with the nuclide chart`).toHaveCount(1);
  }
  await page.locator('#nuclideBack').click();
});

test('Periodic Table reaction shapes keep bonded atoms apart', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  const degenerate = await page.evaluate(() => {
    const equations = [
      ...Object.values(EXTENDED).flatMap(record => record.reactions || []),
      ...Object.values(ELEMENT_REACTIONS).flat()
    ].map(reaction => reaction.eq);
    const broken = [];
    for (const equation of equations) {
      const parsed = parseEquation(equation);
      for (const group of [...parsed.lhs, ...parsed.rhs]) {
        const shape = moleculeShape(group.formula);
        for (const [i, j] of shape.bonds) {
          const a = shape.atoms[i], b = shape.atoms[j];
          if (!a || !b || (a.x === b.x && a.y === b.y)) broken.push(`${group.formula} ${i}-${j}`);
        }
      }
    }
    return broken;
  });
  expect(degenerate, 'reaction bonds always have a direction').toEqual([]);
});

test('Periodic Table playback stops cleanly', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  await page.locator('#tlToggleBtn').click();
  await page.locator('#tlPlay').click();
  await page.waitForTimeout(300);
  await page.locator('#tlPlay').click();
  const stoppedYear = await page.locator('#tlYear').textContent();
  await page.waitForTimeout(400);
  expect(await page.locator('#tlYear').textContent(), 'the year stops advancing').toBe(stoppedYear);
  await page.locator('#tlToggleBtn').click();

  await page.locator('#cosmicPlayBtn').click();
  await page.waitForTimeout(200);
  await page.locator('#cosmicPlayBtn').click();
  await page.waitForTimeout(400);
  await expect(page.locator('.cell.not-yet-forged'), 'every cell is restored').toHaveCount(0);
  await expect(page.locator('.cell.freshly-forged')).toHaveCount(0);
});
