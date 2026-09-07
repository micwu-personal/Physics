import { expect, test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { preparePage, setRange } from './helpers/runtime.js';

const routes = [
  {
    id: 'orbital-lab',
    path: '/physics/orbital-lab.html?day=171',
    exercise: async page => {
      await page.locator('[data-lab-mode="eclipses"]').click();
      await setRange(page.locator('#eclipseProgressControl'), 0.55);
      await page.locator('[data-lab-mode="seasons"]').click();
      await setRange(page.locator('#timeControl'), 18);
    }
  },
  {
    id: 'solar-system-galaxy',
    path: '/physics/solar-system-galaxy.html',
    exercise: async page => {
      await page.locator('[data-address-scale="local"]').click();
      await page.locator('[data-solar-scale="heliosphere"]').click();
      await setRange(page.locator('#missionYear'), 1989.7);
      await page.locator('[data-galaxy-view="edge"]').click();
    }
  }
];

const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 }
];

function readStableGeometry() {
  return {
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    documentHeight: document.documentElement.scrollHeight,
    canvases: [...document.querySelectorAll('canvas')].map(canvas => {
      const rect = canvas.getBoundingClientRect();
      return {
        id: canvas.id,
        cssWidth: Math.round(rect.width),
        cssHeight: Math.round(rect.height),
        pixelWidth: canvas.width,
        pixelHeight: canvas.height
      };
    })
  };
}

for (const route of routes) {
  for (const language of ['en', 'zh-CN']) {
    test(`${route.id} remains stable in WebKit ${language}`, async ({ page }) => {
      const errors = watchPage(page);
      await preparePage(page, route.path, language, { motionPreference: 'pause' });
      await route.exercise(page);

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(180);
        await assertLayout(page);

        const first = await page.evaluate(readStableGeometry);
        await page.waitForTimeout(180);
        const second = await page.evaluate(readStableGeometry);

        expect(first.documentWidth).toBeLessThanOrEqual(first.viewportWidth + 1);
        expect(first.documentHeight).toBeLessThan(30_000);
        expect(first.canvases.length).toBeGreaterThan(1);
        for (const canvas of first.canvases) {
          expect(canvas.cssWidth, `${route.id} ${canvas.id} WebKit width`).toBeGreaterThan(40);
          expect(canvas.cssHeight, `${route.id} ${canvas.id} WebKit height`).toBeGreaterThan(40);
          expect(canvas.pixelWidth, `${route.id} ${canvas.id} backing width`).toBeGreaterThanOrEqual(canvas.cssWidth - 1);
          expect(canvas.pixelHeight, `${route.id} ${canvas.id} backing height`).toBeGreaterThanOrEqual(canvas.cssHeight - 1);
        }
        expect(second).toEqual(first);
      }

      await assertNoErrors(errors);
    });
  }
}
