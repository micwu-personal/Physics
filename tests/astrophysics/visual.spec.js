import { test } from '@playwright/test';
import { locales } from '../helpers/matrix.js';
import { captureRendering } from '../helpers/rendering.js';
import { lockViewportSensitiveHeights, preparePage, setRange } from '../helpers/runtime.js';

const astroPath = '/physics/astrophysics.html';

async function stabilizeAstroVisuals(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(100);
}

async function setAstroSnapshotState(page) {
  await page.waitForFunction(() => document.documentElement.dataset.motion === 'paused');
  await setRange(page.locator('#collapseProgress'), 0.5);
  await setRange(page.locator('#limitMass'), 1);
  await page.locator('[data-compact-mode="white-dwarf"]').click();
  await setRange(page.locator('#compactMass'), 1);
  await setRange(page.locator('#typeIaStage'), 0);
  await setRange(page.locator('#jetSpeed'), 0.9);
  await setRange(page.locator('#jetAngle'), 18);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await lockViewportSensitiveHeights(page);
}

for (const language of locales) {
  test(`Astrophysics hero snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language, { motionPreference: 'pause', reducedMotion: 'reduce' });
    await stabilizeAstroVisuals(page);
    await setAstroSnapshotState(page);
    const hero = page.locator('.focus-instrument');
    await hero.scrollIntoViewIfNeeded();
    await captureRendering(hero, `astrophysics-hero-${language}.png`);
  });

  test(`Astrophysics limits snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language, { motionPreference: 'pause', reducedMotion: 'reduce' });
    await stabilizeAstroVisuals(page);
    await setAstroSnapshotState(page);
    const limits = page.locator('#limits');
    await limits.scrollIntoViewIfNeeded();
    await captureRendering(limits, `astrophysics-limits-${language}.png`);
  });

  test(`Astrophysics Type Ia snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language, { motionPreference: 'pause', reducedMotion: 'reduce' });
    await stabilizeAstroVisuals(page);
    await setAstroSnapshotState(page);
    const typeIa = page.locator('#type-ia');
    await typeIa.scrollIntoViewIfNeeded();
    await captureRendering(typeIa, `astrophysics-type-ia-${language}.png`);
  });

  test(`Astrophysics jets snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language, { motionPreference: 'pause', reducedMotion: 'reduce' });
    await stabilizeAstroVisuals(page);
    await setAstroSnapshotState(page);
    const jets = page.locator('#jets');
    await jets.scrollIntoViewIfNeeded();
    await captureRendering(jets, `astrophysics-jets-${language}.png`);
  });
}
