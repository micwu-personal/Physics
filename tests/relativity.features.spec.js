import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { setRange, preparePage } from './helpers/runtime.js';

test('relativity page exposes corrected clock geometry, particle explorer, and jet causality copy', async ({ page }) => {
  const errors = watchPage(page);
  await preparePage(page, '/physics/relativity.html', 'en');

  await expect(page.locator('#clockShipEventE1')).toContainText(`x' = 0`);
  await expect(page.locator('#clockGroundEventE1')).toContainText('x = 0.750 L0');

  await setRange(page.locator('#primaryControl'), 0.8);
  await expect(page.locator('#clockGammaValue')).toHaveText('1.667');
  await expect(page.locator('#clockGroundEventE1')).toContainText('x = 1.333 L0');
  await expect(page.locator('#clockGroundHalfTick')).toHaveText('1.667 L0/c');

  await page.locator('#labToggle').click();
  await expect(page.locator('#labReadout')).toContainText('β = 0.80');

  await page.locator('[data-particle="proton"]').click();
  await expect(page.locator('#restEnergyValue')).toContainText('938');
  await page.locator('[data-preset-particle="proton"][data-preset-mev="3"]').click();
  await expect(page.locator('#energyValue')).toHaveText('1 GeV');
  await expect(page.locator('#energyInterpretation')).toContainText('proton');

  await setRange(page.locator('#jetBetaControl'), 0.99);
  await setRange(page.locator('#jetAngleControl'), 5);
  await expect(page.locator('#jetApparent')).toContainText('c');
  const apparent = await page.locator('#jetApparent').textContent();
  expect(Number.parseFloat(apparent)).toBeGreaterThan(1);
  await expect(page.locator('#jetCausalityNote')).toContainText('closer to the observer');

  await assertNoErrors(errors);
});

test('relativity page keeps bilingual dynamic copy for new scoped instruments', async ({ page }) => {
  await preparePage(page, '/physics/relativity.html', 'zh-CN');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('#energyInterpretation')).toContainText('电子');
  await expect(page.locator('#jetBrightnessNote')).toContainText('亮度条');
  await expect(page.locator('#clockGroundHalfTick')).toContainText('L0/c');
  await expect(page.locator('#references .reference-entry')).toHaveCount(8);
  await expect(page.locator('#references .reference-entry a').first()).toHaveText('打开来源');
});
