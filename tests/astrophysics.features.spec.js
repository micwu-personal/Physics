import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { locales } from './helpers/matrix.js';
import { preparePage, setRange } from './helpers/runtime.js';

const astroPath = '/physics/astrophysics.html';
const compactSpecs = {
  'white-dwarf': {
    defaultValue: '1.00',
    invalidHigh: 2,
    max: '1.38',
    maxOut: '1.38 M☉',
    min: '0.45',
    minOut: '0.45 M☉',
    rangeText: '0.45–1.38 M☉',
    step: '0.01'
  },
  'neutron-star': {
    defaultValue: '1.40',
    invalidHigh: 12,
    max: '2.30',
    maxOut: '2.30 M☉',
    min: '1.10',
    minOut: '1.10 M☉',
    rangeText: '1.10–2.30 M☉',
    step: '0.01'
  },
  'black-hole': {
    defaultValue: '5.0',
    invalidLow: 1,
    max: '12',
    maxOut: '12.0 M☉',
    min: '3',
    minOut: '3.0 M☉',
    rangeText: '3.0–12.0 M☉',
    step: '0.1'
  }
};

async function setInvalidRangeValue(locator, next) {
  await locator.evaluate((element, value) => {
    element.value = String(value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, next);
}

for (const language of locales) {
  test(`Astrophysics keeps the flattening control and stage together on mobile in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await page.setViewportSize({ width: 412, height: 915 });
    await preparePage(page, astroPath, language);

    const instrument = page.locator('.focus-instrument');
    await instrument.evaluate(element => element.scrollIntoView({ block: 'start' }));

    const metrics = await instrument.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const canvasRect = element.querySelector('#collapseCanvas').getBoundingClientRect();
      const sliderRect = element.querySelector('#collapseProgress').getBoundingClientRect();
      return {
        bottom: rect.bottom,
        height: rect.height,
        sliderBottom: sliderRect.bottom,
        sliderTop: sliderRect.top,
        stageBottom: canvasRect.bottom,
        top: rect.top,
        viewportHeight: window.innerHeight
      };
    });

    expect(metrics.top).toBeGreaterThanOrEqual(0);
    expect(metrics.stageBottom).toBeLessThan(metrics.sliderTop);
    expect(metrics.sliderTop).toBeGreaterThan(metrics.stageBottom - 1);
    expect(metrics.sliderBottom).toBeLessThanOrEqual(metrics.viewportHeight);
    await expect(instrument.locator('#collapseCanvas')).toBeVisible();
    await expect(instrument.locator('#collapseProgress')).toBeVisible();
    await assertNoErrors(errors);
  });

  test(`Astrophysics enforces compact-object teaching ranges in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, astroPath, language);

    await setRange(page.locator('#limitMass'), 1.45);
    await expect(page.locator('#limitsPressure')).toContainText(language === 'en' ? 'gravity' : '引力');
    await expect(page.locator('#limitBridge')).toContainText(language === 'en' ? 'TOV equation' : 'TOV');

    const compactMass = page.locator('#compactMass');
    for (const [mode, spec] of Object.entries(compactSpecs)) {
      await page.locator(`[data-compact-mode="${mode}"]`).click();
      await expect(page.locator(`[data-compact-mode="${mode}"]`)).toHaveAttribute('aria-pressed', 'true');
      const state = await compactMass.evaluate(element => ({
        max: element.max,
        min: element.min,
        step: element.step,
        value: element.value
      }));
      expect(Number(state.min)).toBeCloseTo(Number(spec.min), 5);
      expect(Number(state.max)).toBeCloseTo(Number(spec.max), 5);
      expect(state.step).toBe(spec.step);
      expect(Number(state.value)).toBeCloseTo(Number(spec.defaultValue), 5);
      await expect(page.locator('#compactRangeNote')).toContainText(spec.rangeText);
      await expect(page.locator('#compactMassOut')).toHaveText(`${spec.defaultValue} M☉`);

      await setRange(compactMass, spec.max);
      await expect(page.locator('#compactMassOut')).toHaveText(spec.maxOut);
      await setRange(compactMass, spec.min);
      await expect(page.locator('#compactMassOut')).toHaveText(spec.minOut);

      if ('invalidHigh' in spec) {
        await setInvalidRangeValue(compactMass, spec.invalidHigh);
        await expect(page.locator('#compactMassOut')).toHaveText(spec.maxOut);
      }
      if ('invalidLow' in spec) {
        await setInvalidRangeValue(compactMass, spec.invalidLow);
        await expect(page.locator('#compactMassOut')).toHaveText(spec.minOut);
      }
    }

    await page.locator('[data-compact-mode="neutron-star"]').click();
    await setRange(compactMass, 2.2);
    await expect(page.locator('#compactSupport')).toContainText(language === 'en' ? 'TOV balance' : 'TOV');
    await expect(page.locator('#compactKnown')).toContainText(language === 'en' ? 'model-dependent maximum-mass regime' : '模型依赖');

    await page.locator('[data-compact-mode="black-hole"]').click();
    await setRange(compactMass, 5);
    await expect(page.locator('#compactSupport')).toContainText(language === 'en' ? 'causal boundary' : '因果边界');

    expect(await page.locator('.claim-links .claim-chip[href]').count()).toBeGreaterThan(18);
    expect(await page.locator('#references .reference-entry').count()).toBeGreaterThanOrEqual(11);
    await assertNoErrors(errors);
  });

  test(`Astrophysics updates Type Ia and jet branches in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, astroPath, language);

    await setRange(page.locator('#typeIaStage'), 2);
    await expect(page.locator('#typeIaReadout')).toContainText(language === 'en' ? 'near-Chandrasekhar core' : '近钱德拉塞卡核心');
    await setRange(page.locator('#typeIaStage'), 5);
    await expect(page.locator('#typeIaReadout')).toContainText(language === 'en' ? 'delayed detonation' : '延迟爆轰');
    await setRange(page.locator('#typeIaStage'), 6);
    await expect(page.locator('#typeIaProducts')).toContainText(language === 'en' ? 'nickel-56' : '镍-56');

    await setRange(page.locator('#jetSpeed'), 0.2);
    await setRange(page.locator('#jetAngle'), 75);
    let betaApp = await page.locator('#jetApparent').evaluate(element => {
      const match = element.textContent.match(/β_app = ([0-9.]+)/);
      return match ? Number(match[1]) : 0;
    });
    expect(betaApp).toBeLessThan(1);
    await expect(page.locator('#jetReadout')).toContainText(language === 'en' ? 'below c' : '还没有超过 c');

    await setRange(page.locator('#jetSpeed'), 0.98);
    await setRange(page.locator('#jetAngle'), 10);
    betaApp = await page.locator('#jetApparent').evaluate(element => {
      const match = element.textContent.match(/β_app = ([0-9.]+)/);
      return match ? Number(match[1]) : 0;
    });
    expect(betaApp).toBeGreaterThan(1);
    await expect(page.locator('#jetInvariant')).toContainText(language === 'en' ? 'outrun light' : '不会超过光速');
    await assertNoErrors(errors);
  });
}

test('Astrophysics stays complete when reduced motion is preferred', async ({ page }) => {
  const errors = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await preparePage(page, astroPath, 'en');

  await expect(page.locator('.motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await setRange(page.locator('#collapseProgress'), 0.82);
  await expect(page.locator('#collapseReadout')).toContainText('disk');

  await setRange(page.locator('#typeIaStage'), 4);
  await expect(page.locator('#typeIaReadout')).toContainText('thermonuclear runaway');

  await setRange(page.locator('#jetSpeed'), 0.97);
  await setRange(page.locator('#jetAngle'), 7);
  await expect(page.locator('#jetApparent')).toContainText('β_app');
  await assertNoErrors(errors);
});
