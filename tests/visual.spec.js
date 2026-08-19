import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { entries, locales } from './helpers/matrix.js';
import { freezeVisuals, preparePage } from './helpers/runtime.js';

function readPngSize(png) {
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20)
  };
}

const relativitySnapshotSize = readPngSize(
  readFileSync(new URL('./visual.spec.js-snapshots/relativity-en-visual-desktop-win32.png', import.meta.url))
);

test('relativity en visual capture geometry is stable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'visual-desktop');

  await preparePage(page, '/physics/relativity.html', 'en');
  await freezeVisuals(page);

  const screenshotOptions = { animations: 'disabled', caret: 'hide', fullPage: true };
  const first = readPngSize(await page.screenshot(screenshotOptions));
  const second = readPngSize(await page.screenshot(screenshotOptions));

  expect(first).toEqual(relativitySnapshotSize);
  expect(second).toEqual(relativitySnapshotSize);
});

for (const entry of entries) {
  for (const language of locales) {
    test(`${entry.id} ${language} visual`, async ({ page }) => {
      await preparePage(page, entry.path, language);
      await freezeVisuals(page);
      await expect(page).toHaveScreenshot(`${entry.id}-${language}.png`, {
        fullPage: true,
        timeout: 30_000
      });
    });
  }
}
