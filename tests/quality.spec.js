import { expect, test } from '@playwright/test';
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

for (const language of locales) {
  test(`relativity ${language} mobile topic rail stays reachable without page overflow`, async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'quality-mobile') test.skip();

    const errors = watchPage(page);
    await preparePage(page, '/physics/relativity.html', language);

    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth - document.body.clientWidth,
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(overflow.body).toBeLessThanOrEqual(1);
    expect(overflow.document).toBeLessThanOrEqual(1);

    const rail = page.locator('.topic-index');
    await expect(rail).toBeVisible();
    const anchors = rail.locator('a[href^="#"]');
    await expect(anchors).toHaveCount(9);

    const railMetrics = await rail.evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth
    }));
    expect(railMetrics.scrollWidth).toBeGreaterThan(railMetrics.clientWidth);

    const focusReachability = await page.evaluate(() => {
      const rail = document.querySelector('.topic-index');
      const links = [...rail.querySelectorAll('a[href^="#"]')];
      return links.map(link => {
        link.focus();
        const linkRect = link.getBoundingClientRect();
        const railRect = rail.getBoundingClientRect();
        return {
          href: link.getAttribute('href'),
          left: linkRect.left - railRect.left,
          right: railRect.right - linkRect.right
        };
      });
    });
    for (const item of focusReachability) {
      expect(item.left, `focused ${item.href} should stay within the rail`).toBeGreaterThanOrEqual(-1);
      expect(item.right, `focused ${item.href} should stay within the rail`).toBeGreaterThanOrEqual(-1);
    }

    for (let index = 0; index < await anchors.count(); index++) {
      const anchor = anchors.nth(index);
      const targetId = (await anchor.getAttribute('href')).slice(1);
      await anchor.evaluate(element => element.scrollIntoView({ block: 'nearest', inline: 'center' }));
      await expect(anchor).toBeInViewport();
      await anchor.click();
      await page.waitForFunction(id => location.hash === `#${id}`, targetId);
    }

    await assertNoErrors(errors);
  });
}
