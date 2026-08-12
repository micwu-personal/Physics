import { expect, test } from '@playwright/test';
import { assertInternalLinks, assertLayout, assertNoErrors, assertTranslations, watchPage } from './helpers/assertions.js';
import { exerciseTopLevel } from './helpers/journeys.js';
import { entries, expectedEntryTitle, generatedEntries, locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

function topBarSelectors(entry) {
  if (entry.app === 'landing') return ['.page-topbar .brand-home', '.page-topbar .controls'];
  if (entry.app.startsWith('physics')) return ['.route-left', '.site-controls'];
  return ['.control-row > .brand-home', '.control-row .lang-switch'];
}

function expectedBrandLabel(language) {
  return language === 'zh-CN' ? '米克乐的宇宙' : "McWoods’ Universe";
}

function expectedBrandOrders(language) {
  return language === 'zh-CN' ? { zh: '1', en: '2' } : { zh: '2', en: '1' };
}

function firstTimelineCardMetrics() {
  const card = document.querySelector('.ep-card');
  const head = card?.querySelector('.ep-head');
  const chip = card?.querySelector('.ep-time');
  if (!card || !head || !chip) return null;
  const cardRect = card.getBoundingClientRect();
  const headRect = head.getBoundingClientRect();
  const chipRect = chip.getBoundingClientRect();
  return {
    cardLeft: cardRect.left,
    cardRight: cardRect.right,
    headOverflow: head.scrollWidth - head.clientWidth,
    chipLeft: chipRect.left,
    chipRight: chipRect.right
  };
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
    brandLabel: document.querySelector('.brand-home')?.getAttribute('aria-label') ?? '',
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

      const brandHome = page.locator('.brand-home');
      await expect(brandHome).toBeVisible();
      await expect(brandHome).toHaveAttribute('aria-label', expectedBrandLabel(language));

      const brandHref = new URL(await brandHome.getAttribute('href'), page.url()).pathname;
      expect(brandHref).toBe(entry.brandPath);
      expect(await page.title()).toBe(expectedEntryTitle(entry, language));

      const faviconHref = await page.locator('link[rel~="icon"]').getAttribute('href');
      expect(faviconHref).toMatch(/favicon\.svg|^data:image\/svg\+xml/);

      const mailLink = page.locator('.site-footer__links a[href="mailto:micwu@outlook.com"]');
      await expect(mailLink).toBeVisible();
      await expect(mailLink).toHaveAttribute('aria-label', 'Email micwu@outlook.com');

      if ((page.viewportSize()?.width ?? 0) > 560) {
        await expect.poll(() => readBrandOrders(page)).toEqual(expectedBrandOrders(language));
      }

      const alternateLanguage = language === 'en' ? 'zh-CN' : 'en';
      await page.locator(`[data-lang="${alternateLanguage}"]`).first().click();
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(alternateLanguage);
      await expect(brandHome).toHaveAttribute('aria-label', expectedBrandLabel(alternateLanguage));
      if ((page.viewportSize()?.width ?? 0) > 560) {
        await expect.poll(() => readBrandOrders(page)).toEqual(expectedBrandOrders(alternateLanguage));
      }
      await expect(page).toHaveTitle(expectedEntryTitle(entry, alternateLanguage));
      await page.locator(`[data-lang="${language}"]`).first().click();
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(language);
      await expect(brandHome).toHaveAttribute('aria-label', expectedBrandLabel(language));
      await expect(page).toHaveTitle(expectedEntryTitle(entry, language));

      await exerciseTopLevel(page, entry.app);
      await assertInternalLinks(page);
      await assertLayout(page);

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
      const sourceContext = sourcePage.context();
      const generatedContext = generatedPage.context();

      try {
        await preparePage(sourcePage, entry.sourcePath, language);
        await preparePage(generatedPage, entry.path, language);

        const source = await readParitySnapshot(sourcePage);
        const generated = await readParitySnapshot(generatedPage);

        expect(generated.title).toBe(source.title);
        expect(generated.brandLabel).toBe(expectedBrandLabel(language));
        expect(generated.brandText).toBe(source.brandText);
        expect(generated.footerCopy).toBe(source.footerCopy);
        expect(generated.mailHref).toBe('mailto:micwu@outlook.com');
        expect(generated.faviconHref).toMatch(/^data:image\/svg\+xml/);
        expect(generated.bundleLinks).toEqual([]);
      } finally {
        await Promise.allSettled([
          sourceContext.close(),
          generatedContext.close()
        ]);
      }
    });
  }
}

for (const language of locales) {
  test(`quantum mechanics ${language} 320px hero keeps the branded layout in bounds`, async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'quality-mobile') test.skip();

    await page.setViewportSize({ width: 320, height: 844 });
    const errors = watchPage(page);
    await preparePage(page, '/physics/quantum.html', language);
    await assertLayout(page);

    const bounds = await page.evaluate(() => {
      const title = document.querySelector('.topic-title');
      const instrument = document.querySelector('.hero-instrument');
      if (!title || !instrument) return null;
      const titleRect = title.getBoundingClientRect();
      const instrumentRect = instrument.getBoundingClientRect();
      return {
        titleLeft: titleRect.left,
        titleRight: titleRect.right,
        instrumentLeft: instrumentRect.left,
        instrumentRight: instrumentRect.right
      };
    });
    expect(bounds).not.toBeNull();
    expect(bounds.titleLeft).toBeGreaterThanOrEqual(-1);
    expect(bounds.titleRight).toBeLessThanOrEqual(321);
    expect(bounds.instrumentLeft).toBeGreaterThanOrEqual(-1);
    expect(bounds.instrumentRight).toBeLessThanOrEqual(321);

    await assertNoErrors(errors);
  });
}

for (const path of ['/big-bang/', '/big-bang/mobile/index.html']) {
  for (const language of locales) {
    test(`big-bang ${path.includes('/mobile/') ? 'generated' : 'source'} ${language} timeline chips stay inside cards at 320-360px`, async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'quality-mobile') test.skip();

      const errors = watchPage(page);
      for (const width of [320, 360]) {
        await page.setViewportSize({ width, height: 844 });
        await preparePage(page, path, language);
        await assertLayout(page);

        const metrics = await page.evaluate(firstTimelineCardMetrics);
        expect(metrics, `${path} should render a timeline card`).not.toBeNull();
        expect(metrics.headOverflow, `${path} ${language} ${width}px timeline header should not overflow`).toBeLessThanOrEqual(1);
        expect(metrics.chipLeft, `${path} ${language} ${width}px chip should stay inside the card`).toBeGreaterThanOrEqual(metrics.cardLeft - 1);
        expect(metrics.chipRight, `${path} ${language} ${width}px chip should stay inside the card`).toBeLessThanOrEqual(metrics.cardRight + 1);
      }

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
