import { expect, test } from '@playwright/test';
import { assertInternalLinks, assertLayout, assertNoErrors, assertTranslations, watchPage } from './helpers/assertions.js';
import { exerciseTopLevel } from './helpers/journeys.js';
import { entries, generatedEntries, locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

function topBarSelectors(entry) {
  if (entry.app === 'landing') return ['.page-topbar .brand-home', '.page-topbar .controls'];
  if (entry.app.startsWith('physics')) return ['.route-left', '.site-controls'];
  return ['.control-row > .brand-home', '.control-row .lang-switch'];
}

async function readBrandOrders(page) {
  return page.evaluate(() => {
    const zh = document.querySelector('.brand-home__title-zh');
    const en = document.querySelector('.brand-home__title-en');
    return {
      zh: zh ? getComputedStyle(zh).order : null,
      en: en ? getComputedStyle(en).order : null
    };
  });
}

async function readParitySnapshot(page) {
  return page.evaluate(() => ({
    title: document.title,
    brandText: document.querySelector('.brand-home')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    footerCopy: document.querySelector('.site-footer__copy')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    mailHref: document.querySelector('.site-footer__links a[href^="mailto:"]')?.getAttribute('href') ?? '',
    faviconHref: document.querySelector('link[rel~="icon"]')?.href ?? '',
    bundleLinks: [...document.querySelectorAll('a[href]')]
      .map(anchor => anchor.href)
      .filter(href => href.includes('micwu-personal.github.io/Physics/'))
  }));
}

async function assertTopBarNoOverlap(page, entry) {
  const [leftSelector, rightSelector] = topBarSelectors(entry);
  const left = await page.locator(leftSelector).boundingBox();
  const right = await page.locator(rightSelector).boundingBox();
  expect(left, `${entry.id} left control cluster should be visible`).not.toBeNull();
  expect(right, `${entry.id} right control cluster should be visible`).not.toBeNull();
  expect(left.x + left.width, `${entry.id} top-bar clusters should not overlap`).toBeLessThanOrEqual(right.x + 1);
  expect(left.x, `${entry.id} left control cluster should stay onscreen`).toBeGreaterThanOrEqual(-1);
  expect(right.x + right.width, `${entry.id} right control cluster should stay onscreen`).toBeLessThanOrEqual(391);
}

for (const entry of entries) {
  for (const language of locales) {
    test(`${entry.id} ${language} route quality`, async ({ page }) => {
      const errors = watchPage(page);
      await preparePage(page, entry.path, language);
      await assertTranslations(page, language);
      await exerciseTopLevel(page, entry.app);
      await assertInternalLinks(page);
      await assertLayout(page);

      const brandHome = page.locator('.brand-home');
      await expect(brandHome).toBeVisible();
      await expect(brandHome).toHaveAttribute('aria-label', /米克乐的宇宙/);
      await expect(brandHome).toHaveAttribute('aria-label', /McWoods’ Universe/);

      const brandHref = new URL(await brandHome.getAttribute('href'), page.url()).pathname;
      expect(brandHref).toBe(entry.brandPath);
      expect(await page.title()).toBe(entry.title);

      const faviconHref = await page.locator('link[rel~="icon"]').getAttribute('href');
      expect(faviconHref).toMatch(/favicon\.svg|^data:image\/svg\+xml/);

      const mailLink = page.locator('.site-footer__links a[href="mailto:micwu@outlook.com"]');
      await expect(mailLink).toBeVisible();
      await expect(mailLink).toHaveAttribute('aria-label', 'Email micwu@outlook.com');

      if (language === 'en') {
        expect(await readBrandOrders(page)).toEqual({ zh: '2', en: '1' });
        await page.locator('[data-lang="zh-CN"]').first().click();
        await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe('zh-CN');
        await expect.poll(() => readBrandOrders(page)).toEqual({ zh: '1', en: '2' });
        await expect(page).toHaveTitle(entry.title);
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(120);
      await expect(brandHome).toBeVisible();
      await assertTopBarNoOverlap(page, entry);

      await assertNoErrors(errors);
    });
  }
}

for (const entry of generatedEntries) {
  for (const language of locales) {
    test(`${entry.id} ${language} generated parity`, async ({ browser }) => {
      const sourcePage = await browser.newPage();
      const generatedPage = await browser.newPage();

      try {
        await preparePage(sourcePage, entry.sourcePath, language);
        await preparePage(generatedPage, entry.path, language);

        const source = await readParitySnapshot(sourcePage);
        const generated = await readParitySnapshot(generatedPage);

        expect(generated.title).toBe(source.title);
        expect(generated.brandText).toBe(source.brandText);
        expect(generated.footerCopy).toBe(source.footerCopy);
        expect(generated.mailHref).toBe('mailto:micwu@outlook.com');
        expect(generated.faviconHref).toMatch(/^data:image\/svg\+xml/);
        expect(generated.bundleLinks).toEqual([]);
      } finally {
        await sourcePage.close();
        await generatedPage.close();
      }
    });
  }
}
