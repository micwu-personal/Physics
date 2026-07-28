import { test } from '@playwright/test';
import { assertInternalLinks, assertLayout, assertNoErrors, assertTranslations, watchPage } from './helpers/assertions.js';
import { exerciseTopLevel } from './helpers/journeys.js';
import { entries, locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

for (const entry of entries) {
  for (const language of locales) {
    test(`${entry.id} ${language} route quality`, async ({ page }) => {
      const errors = watchPage(page);
      await preparePage(page, entry.path, language);
      await assertTranslations(page, language);
      await exerciseTopLevel(page, entry.app);
      await assertInternalLinks(page);
      await assertLayout(page);
      await assertNoErrors(errors);
    });
  }
}
