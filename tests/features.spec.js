import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import {
  assertBigBangSourceLinksRerender,
  exerciseBigBang,
  exerciseParticleZoo,
  exercisePeriodicTable
} from './helpers/journeys.js';
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

for (const entry of [
  { name: 'canonical', path: '/big-bang/' },
  { name: 'mobile', path: '/big-bang/mobile/index.html' }
]) {
  test(`Big Bang ${entry.name} source links rerender once when switching to zh-CN`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, entry.path, 'en');
    await assertBigBangSourceLinksRerender(page);
    await assertNoErrors(errors);
  });
}

test('Particle Zoo keeps large paints cached or compositor-only', async ({ page }) => {
  await preparePage(page, '/particle-zoo/', 'en');
  await expect(page.locator('.ix-card')).toHaveCount(0);
  await expect(page.locator('.bsm-card .content-refs')).toHaveCount(0);
  const initialPerf = await page.evaluate(() => window.PZ_PERF.snapshot());
  expect(initialPerf.draws.builder || 0).toBe(0);
  expect(initialPerf.draws.playground || 0).toBe(0);
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('.ix-card')).toHaveCount(0);
  await page.locator('.lang-pill[data-lang="en"]').click();
  await page.locator('.tab[data-tab="forces"]').click();
  await expect(page.locator('.ix-card')).toHaveCount(21);
  await expect(page.locator('.force-card .content-refs')).toHaveCount(4);

  const rendering = await page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    const pageGlow = getComputedStyle(document.body, '::before');
    const stars = style('#bg-stars');
    return {
      bodyBackground: style('body').backgroundImage,
      canvasBackgrounds: [
        '.assembly',
        '.ix-card svg',
        '.lab-viz canvas',
        '#pgCanvas'
      ].map(selector => style(selector).backgroundImage),
      filteredSurfaces: [
        '.badge',
        '.tabs',
        '.sm-block',
        '.detail-card',
        '.force-card',
        '.lab-card',
        '.phen-card',
        '.lang-switch'
      ].map(selector => style(selector).backdropFilter),
      pageGlowBackground: pageGlow.backgroundImage,
      pageGlowPosition: pageGlow.position,
      activePanelVisibility: style('#tab-forces').contentVisibility,
      inactivePanelVisibility: style('#tab-detail').contentVisibility,
      starAnimation: stars.animationName,
      starWillChange: stars.willChange,
      tabAnimation: style('.tab-panel').animationName
    };
  });

  expect(rendering.bodyBackground).toBe('none');
  expect(rendering.pageGlowPosition).toBe('fixed');
  expect(rendering.pageGlowBackground).not.toBe('none');
  expect(rendering.activePanelVisibility).toBe('visible');
  expect(rendering.inactivePanelVisibility).toBe('hidden');
  expect(rendering.starAnimation).toBe('drift-transform');
  expect(rendering.starWillChange).toContain('transform');
  expect(rendering.tabAnimation).toBe('none');
  expect(rendering.canvasBackgrounds).toEqual(['none', 'none', 'none', 'none']);
  expect(rendering.filteredSurfaces).toEqual(Array(8).fill('none'));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ix-gr1').last()).not.toHaveAttribute('d', '');
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('.ix-ph').first()).not.toHaveAttribute('d', '');
  await page.locator('.tab[data-tab="playground"]').click();
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().draws.playground)).toBeGreaterThan(0);
  await page.locator('.tab[data-tab="bsm"]').click();
  await expect(page.locator('.bsm-card .content-refs')).toHaveCount(12);
});
