import { expect, test } from '@playwright/test';
import { locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

const astroPath = '/physics/astrophysics.html';

async function stabilizeAstroVisuals(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
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

for (const language of locales) {
  test(`Astrophysics hero snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language);
    await stabilizeAstroVisuals(page);
    const hero = page.locator('.focus-instrument');
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toHaveScreenshot(`astrophysics-hero-${language}.png`);
  });

  test(`Astrophysics limits snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language);
    await stabilizeAstroVisuals(page);
    const limits = page.locator('#limits');
    await limits.scrollIntoViewIfNeeded();
    await expect(limits).toHaveScreenshot(`astrophysics-limits-${language}.png`);
  });

  test(`Astrophysics Type Ia snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language);
    await stabilizeAstroVisuals(page);
    const typeIa = page.locator('#type-ia');
    await typeIa.scrollIntoViewIfNeeded();
    await expect(typeIa).toHaveScreenshot(`astrophysics-type-ia-${language}.png`);
  });

  test(`Astrophysics jets snapshot ${language}`, async ({ page }) => {
    await preparePage(page, astroPath, language);
    await stabilizeAstroVisuals(page);
    const jets = page.locator('#jets');
    await jets.scrollIntoViewIfNeeded();
    await expect(jets).toHaveScreenshot(`astrophysics-jets-${language}.png`);
  });
}
