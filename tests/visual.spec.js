import { expect, test } from '@playwright/test';
import { entries, locales } from './helpers/matrix.js';
import { freezeVisuals, preparePage } from './helpers/runtime.js';

for (const entry of entries) {
  for (const language of locales) {
    test(`${entry.id} ${language} visual`, async ({ page }) => {
      await preparePage(page, entry.path, language, { motionPreference: 'pause', reducedMotion: 'reduce', visualFreeze: true });
      await freezeVisuals(page);
      await expect(page).toHaveScreenshot(`${entry.id}-${language}.png`, {
        fullPage: true,
        timeout: 30_000
      });
    });
  }
}
