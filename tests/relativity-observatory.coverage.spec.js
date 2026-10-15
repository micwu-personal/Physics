import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import { preparePage, setRange } from './helpers/runtime.js';
import { prepareRenderingPage } from './helpers/rendering.js';

const coverageDir = `test-results/coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;
const snapshot = page => page.evaluate(() => window.__relativityObservatory.snapshot());

async function collect(page, id, run, prepare = () => preparePage(page, '/physics/relativity.html', 'en', { reducedMotion: 'reduce' })) {
  const issues = watchPage(page);
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await prepare();
  await page.waitForFunction(() => Boolean(window.__relativityObservatory));
  await page.locator('#ob-canvas').scrollIntoViewIfNeeded();
  await run();
  await assertNoErrors(issues);
  const coverage = await page.coverage.stopJSCoverage();
  await mkdir(coverageDir, { recursive: true });
  await writeFile(`${coverageDir}/relativity-observatory-${id}.json`, JSON.stringify(coverage));
}

test('relativity observatory rendering and exterior presets coverage', async ({ page }) => {
  await collect(page, 'rendering', async () => {
    for (const view of ['measured', 'optical']) {
      await page.locator(`[data-ob-view="${view}"]`).click();
      for (const speed of [0, 10, 20, 30, 60, 90, 99]) {
        await setRange(page.locator('#ob-speed'), speed);
        for (const direction of ['front', 'side', 'back']) {
          await page.locator(`[data-ob-look="${direction}"]`).click();
        }
      }
    }
    await page.locator('[data-ob-preset="flight"]').click();
    await page.locator('[data-ob-mode="gravity"]').click();
    for (const body of ['blackHole', 'neutronStar', 'whiteDwarf', 'sun']) {
      await page.locator('#ob-body').selectOption(body);
      for (const radius of [1.05, 2, 20]) {
        await setRange(page.locator('#ob-observer'), radius);
        for (let i = 0; i < 3; i++) await setRange(page.locator(`#ob-radius-${i}`), radius);
        for (const direction of ['front', 'side', 'back']) {
          await page.locator(`[data-ob-look="${direction}"]`).click();
        }
      }
    }
    await page.locator('[data-ob-preset="gravity"]').click();
    const state = await snapshot(page);
    expect(state.radii).toEqual([1.15, 2.5, 7.5]);
    expect(state.body).toBe('sun');
    await page.locator('[data-ob-look="front"]').click();
    await page.locator('#ob-canvas').focus();
    for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
    for (const language of ['zh-CN', 'en']) await page.locator(`[data-lang="${language}"]`).click();
    await page.setViewportSize({ width: 320, height: 740 });
    await page.locator('#ob-canvas').scrollIntoViewIfNeeded();
    await page.setViewportSize({ width: 1440, height: 1000 });
  });
});

test('relativity observatory playback, visibility and pointer coverage', async ({ page }) => {
  await collect(page, 'lifecycle', async () => {
    const canvas = page.locator('#ob-canvas');
    await canvas.dispatchEvent('pointermove', { pointerId: 42 });
    await canvas.focus();
    for (const key of ['a', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) await page.keyboard.press(key);
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await canvas.dispatchEvent('pointermove', { pointerId: 42 });
    await page.mouse.move(box.x + box.width * .7, box.y + box.height * .7, { steps: 3 });
    await page.mouse.up();
    await canvas.dispatchEvent('pointercancel');
    await canvas.dispatchEvent('lostpointercapture');
    await page.locator('#ob-flight-tab').focus();
    for (const key of ['a', 'End', 'Home', 'ArrowRight', 'ArrowLeft']) await page.keyboard.press(key);
    await page.locator('#ob-play').click();
    await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.15);
    await page.locator('.motion-toggle').click();
    await expect(page.locator('#ob-status')).toHaveText('Motion paused');
    await page.locator('.motion-toggle').click();
    await page.locator('[data-ob-mode="gravity"]').click();
    await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.15);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    });
    const stopped = (await snapshot(page)).elapsed;
    await page.waitForTimeout(100);
    expect((await snapshot(page)).elapsed).toBe(stopped);
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await snapshot(page)).visible).toBe(false);
    await page.locator('#ob-canvas').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused: true } }));
      document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused: false } }));
      document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused: true, freezeFrame: true } }));
    });
    await page.locator('#ob-play').click();
    await page.locator('#ob-reset').click();
    expect((await snapshot(page)).running).toBe(false);
  });
});

test('relativity observatory fullscreen success and rejection coverage', async ({ page }) => {
  await collect(page, 'fullscreen', async () => {
    await page.locator('#ob-fullscreen').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('observatory');
    await page.locator('#ob-play').click();
    await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.1);
    await page.locator('#ob-play').click();
    await expect(page.locator('#observatory .ob-probes')).toBeVisible();
    await page.locator('#ob-fullscreen').click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
    await page.locator('#observatory').evaluate(element => {
      element.requestFullscreen = async () => { throw new Error('Simulated platform rejection'); };
    });
    await page.locator('#ob-fullscreen').click();
    await expect(page.locator('#ob-status')).toContainText('Fullscreen unavailable');
  });
});

test('relativity observatory unsupported fullscreen coverage', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = undefined;
    Object.defineProperty(window, 'devicePixelRatio', { value: 0 });
  });
  await collect(page, 'unsupported-fullscreen', async () => {
    await expect(page.locator('#ob-fullscreen')).toBeHidden();
    await page.locator('#ob-fullscreen').dispatchEvent('click');
    await page.locator('#ob-play').click();
    await expect.poll(async () => (await snapshot(page)).elapsed).toBeGreaterThan(.1);
    await page.locator('#ob-play').click();
    await page.locator('#ob-reset').click();
    expect(await page.locator('#ob-canvas').evaluate(c => c.width)).toBeGreaterThan(0);
  });
});

test('relativity observatory passes a beacon without nonfinite optical rates', async ({ page }) => {
  await collect(page, 'beacon-passage', async () => {
    await setRange(page.locator('#ob-speed'), 60);
    await page.locator('[data-ob-view="optical"]').click();
    await page.locator('#ob-play').click();
    await page.evaluate(() => {
      for (let i = 0; i < 961; i++) window.__visualClock.step(62.5);
    });
    const atSource = await snapshot(page);
    expect(atSource.travel).toBe(45);
    atSource.rates.forEach(rate => expect(Number.isFinite(rate)).toBe(true));
    await page.evaluate(() => window.__visualClock.step(62.5));
    expect((await snapshot(page)).travel).toBeGreaterThan(45);
    await expect(page.locator('#ob-rate-0')).toHaveText('0.500000 ×');
    await page.locator('#ob-play').click();
  }, () => prepareRenderingPage(page, '/physics/relativity.html', 'en'));
});
