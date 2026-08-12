import { expect } from '@playwright/test';

export function watchPage(page) {
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1' && response.status() >= 400) {
      errors.push(`response ${response.status()}: ${url.pathname}`);
    }
  });
  return errors;
}

export async function assertTranslations(page, language) {
  await expect(page.locator('html')).toHaveAttribute('lang', language);
  const missing = await page.locator('[data-i18n], [data-i18n-placeholder]').evaluateAll(elements =>
    elements.flatMap(element => {
      const key = element.dataset.i18n || element.dataset.i18nPlaceholder;
      const value = element.dataset.i18nPlaceholder
        ? element.getAttribute('placeholder')
        : element.textContent.trim();
      return !value || value === key || /^(undefined|null|\[object Object\])$/.test(value)
        ? [{ key, value, tag: element.tagName }]
        : [];
    })
  );
  expect(missing, 'all declared translations should resolve').toEqual([]);
}

export async function assertInternalLinks(page) {
  const links = await page.locator('a[href]').evaluateAll(anchors =>
    anchors.map(anchor => new URL(anchor.href, location.href).href)
      .filter(href => href.startsWith(location.origin) && !href.includes('#'))
  );
  for (const href of [...new Set(links)]) {
    const response = await fetchInternalLink(page, href);
    expect(response.status(), `internal link ${href}`).toBeLessThan(400);
  }
}

async function fetchInternalLink(page, href) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await page.request.fetch(href, { method: 'HEAD' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/ECONNRESET/i.test(message) || attempt === 1) throw error;
    }
  }
  throw new Error(`Unable to reach ${href}`);
}

export async function assertLayout(page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(overflow.body, 'body horizontal overflow').toBeLessThanOrEqual(1);
  expect(overflow.document, 'document horizontal overflow').toBeLessThanOrEqual(1);

  const clipped = await page.locator('header, nav, .lang-switch, main').evaluateAll(elements =>
    elements.filter(element => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(element => ({
      className: element.className,
      id: element.id,
      rect: element.getBoundingClientRect().toJSON()
    }))
  );
  expect(clipped, 'critical UI should not be clipped horizontally').toEqual([]);

  const instrumentCollisions = await page.locator('.instrument-label').evaluateAll(labels =>
    labels.flatMap(label => {
      const problems = [];
      const labelRect = label.getBoundingClientRect();
      const children = [...label.children].filter(child => {
        const style = getComputedStyle(child);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      for (let left = 0; left < children.length; left++) {
        for (let right = left + 1; right < children.length; right++) {
          const a = children[left].getBoundingClientRect();
          const b = children[right].getBoundingClientRect();
          const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapWidth > 1 && overlapHeight > 1) {
            problems.push(`caption children overlap by ${overlapWidth.toFixed(1)}×${overlapHeight.toFixed(1)}px`);
          }
        }
      }
      const canvas = label.parentElement.querySelector(':scope > canvas');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const overlapWidth = Math.min(canvasRect.right, labelRect.right) - Math.max(canvasRect.left, labelRect.left);
        const overlapHeight = Math.min(canvasRect.bottom, labelRect.bottom) - Math.max(canvasRect.top, labelRect.top);
        if (overlapWidth > 1 && overlapHeight > 1) {
          problems.push(`canvas overlaps caption dock by ${overlapWidth.toFixed(1)}×${overlapHeight.toFixed(1)}px`);
        }
      }
      return problems.map(problem => ({
        problem,
        parentClass: label.parentElement.className
      }));
    })
  );
  expect(instrumentCollisions, 'instrument captions should not overlap canvases or sibling text').toEqual([]);

  const heroCollisions = await page.locator('.topic-hero').evaluateAll(heroes =>
    heroes.flatMap(hero => {
      const title = hero.querySelector('.topic-title h1');
      const instrument = hero.querySelector('.hero-instrument');
      if (!title || !instrument) return [];
      const titleRect = title.getBoundingClientRect();
      const instrumentRect = instrument.getBoundingClientRect();
      const overlapWidth = Math.min(titleRect.right, instrumentRect.right) - Math.max(titleRect.left, instrumentRect.left);
      const overlapHeight = Math.min(titleRect.bottom, instrumentRect.bottom) - Math.max(titleRect.top, instrumentRect.top);
      return overlapWidth > 1 && overlapHeight > 1
        ? [{
            problem: `hero title overlaps instrument by ${overlapWidth.toFixed(1)}×${overlapHeight.toFixed(1)}px`,
            title: title.textContent.trim()
          }]
        : [];
    })
  );
  expect(heroCollisions, 'hero titles should not overlap their instruments').toEqual([]);
}

export async function assertNoErrors(errors) {
  expect(errors, 'no console, page, or local HTTP errors').toEqual([]);
}
