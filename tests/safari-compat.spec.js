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
    devicePixelRatio: window.devicePixelRatio,
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
    }),
    stages: [...document.querySelectorAll('.canvas-stage')].map(stage => {
      const rect = stage.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width)
      };
    })
  };
}

for (const route of routes) {
  for (const language of ['en', 'zh-CN']) {
    test(`${route.id} remains stable in WebKit ${language}`, async ({ page }) => {
      const errors = watchPage(page);
      if (route.id === 'orbital-lab') {
        await page.addInitScript(() => {
          const NativeResizeObserver = window.ResizeObserver;
          window.__resizeObserverConstructions = 0;
          window.ResizeObserver = class extends NativeResizeObserver {
            constructor(callback) {
              window.__resizeObserverConstructions += 1;
              super(callback);
            }
          };
        });
      }
      await preparePage(page, route.path, language, { motionPreference: 'pause' });
      await route.exercise(page);

      if (route.id === 'orbital-lab') {
        expect(await page.evaluate(() => window.__resizeObserverConstructions)).toBe(0);
        await expect(page.locator('link[href*="orbital-lab.css?v=safari-grid-20260908"]')).toHaveCount(1);
        await expect(page.locator('script[src*="orbital-lab.js?v=safari-grid-20260908"]')).toHaveCount(1);
        const canvasIsolation = await page.evaluate(() => [...document.querySelectorAll('.canvas-stage')].map(stage => {
          const canvas = stage.querySelector('canvas');
          return {
            canvasPosition: getComputedStyle(canvas).position,
            containment: getComputedStyle(stage).contain,
            parentMatches: canvas.parentElement === stage
          };
        }));
        expect(canvasIsolation).toHaveLength(5);
        for (const isolation of canvasIsolation) {
          expect(isolation.canvasPosition).toBe('absolute');
          expect(isolation.containment).toContain('size');
          expect(isolation.parentMatches).toBe(true);
        }
      }

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);
        await assertLayout(page);

        const first = await page.evaluate(readStableGeometry);
        const laterSamples = [];
        for (let index = 0; index < 6; index++) {
          await page.waitForTimeout(100);
          laterSamples.push(await page.evaluate(readStableGeometry));
        }

        expect(first.documentWidth).toBeLessThanOrEqual(first.viewportWidth + 1);
        expect(first.documentHeight).toBeLessThan(30_000);
        expect(first.canvases.length).toBeGreaterThan(1);
        for (const canvas of first.canvases) {
          expect(canvas.cssWidth, `${route.id} ${canvas.id} WebKit width`).toBeGreaterThan(40);
          expect(canvas.cssHeight, `${route.id} ${canvas.id} WebKit height`).toBeGreaterThan(40);
          expect(canvas.pixelWidth, `${route.id} ${canvas.id} backing width`)
            .toBe(Math.round(canvas.cssWidth * first.devicePixelRatio));
          expect(canvas.pixelHeight, `${route.id} ${canvas.id} backing height`)
            .toBe(Math.round(canvas.cssHeight * first.devicePixelRatio));
        }
        for (const sample of laterSamples) expect(sample).toEqual(first);
      }

      await assertNoErrors(errors);
    });
  }
}
