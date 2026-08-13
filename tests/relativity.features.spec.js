import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { setRange, preparePage } from './helpers/runtime.js';

test('relativity page exposes corrected clock geometry, particle explorer, and jet causality copy', async ({ page }) => {
  const errors = watchPage(page);
  await preparePage(page, '/physics/relativity.html', 'en');

  await expect(page.locator('.hero-legend')).toContainText('schematic exaggerated ray');
  await expect(page.locator('.hero-legend')).not.toContainText('model null geodesic');
  const clearances = await page.evaluate(() => [
    [360, 240],
    [640, 420],
    [960, 540],
    [1440, 720]
  ].map(([width, height]) => {
    const hero = window.__physicsLabsDebug.computeRelativityHeroGeometry(width, height);
    return {
      height,
      minimumSurfaceClearance: hero.minimumSurfaceClearance,
      radius: hero.lens.radius,
      width
    };
  }));
  for (const sample of clearances) {
    expect(sample.minimumSurfaceClearance).toBeGreaterThan(16);
  }

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
  await expect(page.locator('#particle-regimes')).toContainText('300 keV electron already has β ≈ 0.78');
  await expect(page.locator('#particle-regimes')).toContainText('1 MeV proton is still nonrelativistic');
  await expect(page.locator('#particle-regimes a[href="https://pdg.lbl.gov/2025/reviews/rpp2025-rev-kinematics.pdf"]')).toBeVisible();

  await setRange(page.locator('#jetBetaControl'), 0.99);
  await setRange(page.locator('#jetAngleControl'), 5);
  await expect(page.locator('#jetApparent')).toContainText('c');
  const apparent = await page.locator('#jetApparent').textContent();
  expect(Number.parseFloat(apparent)).toBeGreaterThan(1);
  await expect(page.locator('#jetCausalityNote')).toContainText('closer to the observer');
  await expect(page.locator('#jets')).toContainText('observer-time units');

  for (const [beta, angle] of [[0.7, 60], [0.7, 1], [0.995, 60], [0.995, 1]]) {
    await setRange(page.locator('#jetBetaControl'), beta);
    await setRange(page.locator('#jetAngleControl'), angle);
    const geometry = await page.evaluate(() => {
      const frame = document.getElementById('jetDiagram').viewBox.baseVal;
      const ids = ['jetEventA', 'jetEventB', 'jetEventALabel', 'jetEventBLabel'];
      return ids.map(id => {
        const element = document.getElementById(id);
        const box = element.getBBox();
        return {
          bottom: box.y + box.height,
          id,
          left: box.x,
          right: box.x + box.width,
          top: box.y
        };
      }).concat({
        apparent: Number.parseFloat(document.getElementById('jetDiagram').dataset.betaApp),
        id: 'betaApp'
      }).concat({
        arrivalFactor: Number.parseFloat(document.getElementById('jetDiagram').dataset.arrivalFactor),
        id: 'arrivalFactor'
      }).map(entry => ({ ...entry, frameHeight: frame.height, frameWidth: frame.width }));
    });
    for (const item of geometry.filter(entry => entry.id !== 'betaApp' && entry.id !== 'arrivalFactor')) {
      expect(item.left).toBeGreaterThanOrEqual(0);
      expect(item.right).toBeLessThanOrEqual(item.frameWidth);
      expect(item.top).toBeGreaterThanOrEqual(0);
      expect(item.bottom).toBeLessThanOrEqual(item.frameHeight);
    }
  }

  await expect(page.locator('.relativity-hero-panel a[href="https://www.einstein-online.info/en/Light_deflection/"]')).toBeVisible();
  await expect(page.locator('#jets a[href="https://arxiv.org/abs/astro-ph/9506063"]')).toBeVisible();
  await expect(page.locator('#evidence a[href="https://doi.org/10.12942/lrr-2014-4"]')).toBeVisible();

  await assertNoErrors(errors);
});

test('relativity page keeps bilingual dynamic copy for new scoped instruments', async ({ page }) => {
  await preparePage(page, '/physics/relativity.html', 'zh-CN');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('#energyInterpretation')).toContainText('电子');
  await expect(page.locator('#jetBrightnessNote')).toContainText('亮度条');
  await expect(page.locator('#clockGroundHalfTick')).toContainText('L0/c');
  await expect(page.locator('#references .reference-entry')).toHaveCount(12);
  await expect(page.locator('#particle-regimes')).toContainText('300 keV 电子已经有 β ≈ 0.78');
  await expect(page.locator('#compact-objects')).toContainText('泡利不相容原理');
  await expect(page.locator('#references a[href="https://www.einstein-online.info/en/Light_deflection/"]')).toBeVisible();
  await expect(page.locator('#references .reference-entry a').first()).toHaveText('打开来源');
});

test('relativity freezeFrame rewinds the jet explorer even after the loop is already stopped', async ({ page }) => {
  const errors = watchPage(page);
  await preparePage(page, '/physics/relativity.html', 'en');

  await setRange(page.locator('#jetBetaControl'), 0.97);
  await setRange(page.locator('#jetAngleControl'), 18);

  const captureFreezeState = phase => page.evaluate(phaseValue => {
    const debug = window.__relativityDebug;
    const readSvg = () => ({
      approachBlobCx: document.getElementById('jetApproachBlob').getAttribute('cx'),
      approachBlobCy: document.getElementById('jetApproachBlob').getAttribute('cy'),
      recedeBlobCx: document.getElementById('jetRecedeBlob').getAttribute('cx'),
      recedeBlobCy: document.getElementById('jetRecedeBlob').getAttribute('cy'),
      skyCurrentCx: document.getElementById('skyCurrent').getAttribute('cx'),
      skyCurrentCy: document.getElementById('skyCurrent').getAttribute('cy')
    });
    const readouts = () => ({
      apparent: document.getElementById('jetApparent').textContent,
      arrivalGap: document.getElementById('jetArrivalGap').textContent,
      brightnessNote: document.getElementById('jetBrightnessNote').textContent,
      causalityNote: document.getElementById('jetCausalityNote').textContent
    });

    debug.stopLoop();
    debug.setJetPhase(phaseValue);
    const before = {
      frameHandle: debug.getFrameHandle(),
      jetPhase: debug.getJetPhase(),
      readouts: readouts(),
      svg: readSvg()
    };

    document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused: true, freezeFrame: true } }));
    const frozen = {
      frameHandle: debug.getFrameHandle(),
      jetPhase: debug.getJetPhase(),
      readouts: readouts(),
      svg: readSvg()
    };

    return { before, frozen };
  }, phase);

  const first = await captureFreezeState(0.17);
  const second = await captureFreezeState(0.83);

  expect(first.before.jetPhase).toBeCloseTo(0.17, 6);
  expect(second.before.jetPhase).toBeCloseTo(0.83, 6);
  expect(first.before.svg).not.toEqual(second.before.svg);

  expect(first.frozen.frameHandle).toBe(0);
  expect(second.frozen.frameHandle).toBe(0);
  expect(first.frozen.jetPhase).toBe(0);
  expect(second.frozen.jetPhase).toBe(0);
  expect(first.frozen).toEqual(second.frozen);

  await assertNoErrors(errors);
});
