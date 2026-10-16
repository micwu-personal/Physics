import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { preparePage, setRange } from './helpers/runtime.js';
import path from 'node:path';

const snapshot = page => page.evaluate(() => window.__relativityObservatory.snapshot());
async function open(page, language = 'en', options = {}) {
  const issues = watchPage(page);
  await preparePage(page, '/physics/relativity.html', language, options);
  await page.waitForFunction(() => Boolean(window.__relativityObservatory));
  await page.locator('#ob-canvas').scrollIntoViewIfNeeded();
  return issues;
}

test('flight separates simultaneous measurements from optical signals and renders actual 3D changes', async ({ page }) => {
  const issues = await open(page);
  const initial = await page.locator('#ob-canvas').evaluate(c => c.toDataURL());
  await setRange(page.locator('#ob-speed'), 80);
  await expect(page.locator('#ob-metric-value')).toHaveText('1.667');
  await expect(page.locator('#ob-secondary-value')).toContainText('6.00');
  await expect(page.locator('#ob-forward')).toHaveText('3.000 ×');
  await expect(page.locator('#ob-rear')).toHaveText('0.333 ×');
  const measured = await snapshot(page);
  measured.rates.forEach(rate => expect(rate).toBeCloseTo(.6, 8));
  const changed = await page.locator('#ob-canvas').evaluate(c => c.toDataURL());
  expect(changed).not.toBe(initial);
  await page.locator('[data-ob-view="optical"]').click();
  const optical = await snapshot(page);
  expect(optical.rates[0]).toBeCloseTo(3, 8);
  expect(optical.rates[1]).toBeCloseTo(5 / 3, 8);
  expect(optical.rates[2]).toBeCloseTo(1 / 3, 8);
  await expect(page.locator('#ob-rate-label-0')).toContainText('received tick rate');
  await expect(page.locator('#ob-time-label-0')).toHaveText('Received-signal counter');
  await expect(page.locator('#ob-signal-0')).toContainText('183.3 nm');
  await expect(page.locator('#ob-signal-2')).toContainText('1650.0 nm');
  expect(await page.locator('#ob-canvas').evaluate(c => c.toDataURL())).not.toBe(changed);
  await setRange(page.locator('#ob-speed'), 0);
  (await snapshot(page)).rates.forEach(rate => expect(rate).toBe(1));
  assertNoErrors(issues);
});

test('a sustained flight advances geometry and clock hands, respects pause, rewind and offscreen suspension', async ({ page }) => {
  const issues = await open(page, 'en', { reducedMotion: 'reduce' });
  await page.locator('#ob-play').click();
  await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.2);
  await expect.poll(async () => (await snapshot(page)).travel).toBeGreaterThan(.1);
  const moving = await snapshot(page);
  expect(moving.times[0]).toBeCloseTo(moving.elapsed / moving.gamma, 5);
  await page.locator('.motion-toggle').click();
  const paused = await snapshot(page);
  await page.waitForTimeout(200);
  expect((await snapshot(page)).elapsed).toBe(paused.elapsed);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused: true, freezeFrame: true } })));
  expect((await snapshot(page)).elapsed).toBe(0);
  expect((await snapshot(page)).times).toEqual([0, 0, 0]);
  await page.locator('#ob-play').click();
  await page.locator('#ob-play').click();
  await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.1);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await snapshot(page)).visible).toBe(false);
  const offscreen = await snapshot(page);
  await page.waitForTimeout(150);
  expect((await snapshot(page)).elapsed).toBe(offscreen.elapsed);
  assertNoErrors(issues);
});

test('gravity clocks stay exterior, reverse relative redshift correctly and have physically consistent radii', async ({ page }) => {
  const issues = await open(page);
  await page.locator('[data-ob-mode="gravity"]').click();
  const initial = await snapshot(page);
  expect(initial.rates[0]).toBeLessThan(initial.rates[1]);
  expect(initial.rates[1]).toBeLessThan(initial.rates[2]);
  expect(initial.rates[2]).toBeLessThan(1);
  initial.probePositions.forEach((p, i) => expect(Math.hypot(...p)).toBeCloseTo(initial.radii[i], 8));
  await setRange(page.locator('#ob-radius-0'), 2);
  await expect(page.locator('#ob-rate-0')).toHaveText('0.755929 ×');
  await page.locator('#ob-play').click();
  await expect.poll(async () => (await snapshot(page)).times[0]).toBeGreaterThan(.1);
  await setRange(page.locator('#ob-observer'), 1.1);
  const lower = await snapshot(page);
  lower.rates.forEach(rate => expect(rate).toBeGreaterThan(1));
  expect(lower.elapsed).toBeLessThan(.1);
  await expect(page.locator('#ob-your-time')).toContainText('s');
  await setRange(page.locator('#ob-radius-0'), 1.05);
  expect((await snapshot(page)).rates[0]).toBeLessThan(1);
  await expect(page.locator('#ob-tide-0')).toContainText('m/s²');
  assertNoErrors(issues);
});

test('realistic stellar presets have distinct compactness without exaggerating weak effects', async ({ page }) => {
  const issues = await open(page);
  await page.locator('[data-ob-mode="gravity"]').click();
  const rates = {};
  for (const id of ['blackHole', 'neutronStar', 'whiteDwarf', 'sun']) {
    await page.locator('#ob-body').selectOption(id);
    rates[id] = (await snapshot(page)).rates[0];
    await expect(page.locator('#ob-body-facts')).not.toContainText('undefined');
    await expect(page.locator('#ob-scene-note')).toContainText(id === 'blackHole' ? 'horizon boundary' : 'stellar surface');
  }
  await page.locator('[data-ob-preset="gravity"]').click();
  expect((await snapshot(page)).body).toBe('sun');
  expect(rates.blackHole).toBeLessThan(rates.neutronStar);
  expect(rates.neutronStar).toBeLessThan(rates.whiteDwarf);
  expect(rates.whiteDwarf).toBeLessThan(rates.sun);
  expect(1 - rates.sun).toBeLessThan(.00001);
  assertNoErrors(issues);
});

test('look controls, keyboard tabs and reset work without changing the velocity direction', async ({ page }) => {
  const issues = await open(page);
  const before = await snapshot(page);
  await page.locator('[data-ob-look="side"]').click();
  const side = await snapshot(page);
  expect(side.yaw).not.toBe(before.yaw);
  expect(side.beta).toBe(before.beta);
  expect(side.rates).toEqual(before.rates);
  await page.locator('#ob-canvas').focus();
  await page.keyboard.press('ArrowUp');
  expect((await snapshot(page)).pitch).toBeGreaterThan(0);
  await page.locator('#ob-flight-tab').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#ob-gravity-tab')).toBeFocused();
  await expect(page.locator('#ob-gravity-controls')).toBeVisible();
  await page.locator('#ob-reset').click();
  const reset = await snapshot(page);
  expect(reset.elapsed).toBe(0);
  expect(reset.pitch).toBe(0);
  expect(reset.running).toBe(false);
  assertNoErrors(issues);
});

for (const [name, viewport, language] of [
  ['desktop-en', { width: 1440, height: 1000 }, 'en'],
  ['mobile-zh', { width: 390, height: 844 }, 'zh-CN']
]) {
  test(`${name}: both benches keep controls, captions and clocks separate`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const issues = await open(page, language, { reducedMotion: 'reduce' });
    for (const mode of ['flight', 'gravity']) {
      await page.locator(`[data-ob-mode="${mode}"]`).click();
      await page.locator('#ob-reset').click();
      await expect(page.locator('#ob-scene-title')).not.toContainText('undefined');
      const layout = await page.evaluate(() => {
        const box = sel => {
          const b = document.querySelector(sel).getBoundingClientRect();
          return { x: b.x, right: b.right, y: b.y, bottom: b.bottom, width: b.width };
        };
        return { canvas: box('#ob-canvas'), caption: box('#ob-scene-note'), probes: box('.ob-probes'), workspace: box('.ob-workspace'), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      expect(layout.overflow).toBe(false);
      expect(layout.caption.y).toBeGreaterThanOrEqual(layout.canvas.bottom - 1);
      expect(layout.probes.y).toBeGreaterThanOrEqual(layout.workspace.bottom);
      await expect(page.locator('#ob-play')).toBeVisible();
      await page.locator('#observatory').screenshot({ path: path.join(testInfo.outputDir, `${name}-${mode}.png`), animations: 'disabled' });
    }
    await page.locator('.ob-model summary').click();
    await expect(page.locator('.ob-sources a')).toHaveCount(5);
    await expect(page.locator('#references .reference-entry')).toHaveCount(12);
    assertNoErrors(issues);
  });
}

test('narrow touch viewport and translated live controls remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const issues = await open(page, 'zh-CN');
  await page.locator('[data-ob-preset="flight"]').click();
  await expect(page.locator('#ob-speed-output')).toHaveText('90% c');
  await page.locator('[data-ob-mode="gravity"]').click();
  await page.locator('#ob-body').selectOption('neutronStar');
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('#ob-scene-title')).toContainText('Supported clocks');
  await expect(page.locator('#ob-body-facts')).toContainText('Neutron');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  assertNoErrors(issues);
});
