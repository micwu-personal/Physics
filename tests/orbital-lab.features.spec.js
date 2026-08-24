import { expect, test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { preparePage, setRange } from './helpers/runtime.js';

const path = '/physics/orbital-lab.html';

for (const language of ['en', 'zh-CN']) {
  test(`Orbital lab couples controls, geometry, and observer view in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await preparePage(page, path, language, { motionPreference: 'pause' });

    const workspace = page.locator('#orbitalWorkspace');
    await workspace.evaluate(element => element.scrollIntoView({ block: 'start' }));
    const bounds = await workspace.evaluate(element => {
      const control = element.querySelector('.control-rail').getBoundingClientRect();
      const system = element.querySelector('.system-panel').getBoundingClientRect();
      const observer = element.querySelector('.observer-panel').getBoundingClientRect();
      return {
        controlBottom: control.bottom,
        controlTop: control.top,
        observerBottom: observer.bottom,
        observerTop: observer.top,
        systemBottom: system.bottom,
        systemTop: system.top,
        viewport: innerHeight
      };
    });
    expect(bounds.controlTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.systemTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.observerTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.controlBottom).toBeLessThanOrEqual(bounds.viewport + 1);
    expect(bounds.systemBottom).toBeLessThanOrEqual(bounds.viewport + 1);
    expect(bounds.observerBottom).toBeLessThanOrEqual(bounds.viewport + 1);

    await setRange(page.locator('#dayControl'), 355);
    await setRange(page.locator('#latitudeControl'), 66.56);
    await setRange(page.locator('#timeControl'), 12);
    await expect(page.locator('#liveSummary')).toContainText(language === 'en' ? 'below the horizon' : '地平线下');
    await assertNoErrors(errors);
  });

  test(`Orbital lab distinguishes total, annular, partial, and lunar eclipses in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });
    await page.locator('[data-lab-mode="eclipses"]').click();

    await setRange(page.locator('#distanceControl'), 356500);
    await setRange(page.locator('#alignmentControl'), 0);
    await setRange(page.locator('#observerControl'), 0);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Total solar eclipse' : '日全食');

    await setRange(page.locator('#distanceControl'), 406700);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Annular solar eclipse' : '日环食');

    await setRange(page.locator('#observerControl'), 0.04);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Partial solar eclipse' : '日偏食');

    await page.locator('[data-eclipse-type="lunar"]').click();
    await setRange(page.locator('#alignmentControl'), 0);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Total lunar eclipse' : '月全食');

    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page);
    await assertNoErrors(errors);
  });
}
