import { expect } from '@playwright/test';

export function watchPage(page) {
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:43817' && response.status() >= 400) {
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
    const response = await page.request.get(href);
    expect(response.status(), `internal link ${href}`).toBeLessThan(400);
  }
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
}

export async function assertNoErrors(errors) {
  expect(errors, 'no console, page, or local HTTP errors').toEqual([]);
}
