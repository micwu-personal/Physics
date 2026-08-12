import { test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { exerciseTopLevel } from './helpers/journeys.js';
import { entries, layoutViewports, locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

for (const entry of entries) {
  for (const language of locales) {
    for (const viewport of layoutViewports) {
      test(`${entry.id} ${language} ${viewport.width}x${viewport.height} layout matrix`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const errors = watchPage(page);
        await preparePage(page, entry.path, language);
        await exerciseTopLevel(page, entry.app, { keepViewport: true });
        await assertLayout(page, { sweep: true });
        await assertNoErrors(errors);
      });
    }
  }
}
