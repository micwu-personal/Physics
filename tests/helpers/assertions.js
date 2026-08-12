import { expect } from '@playwright/test';

const layoutNodeSelector = [
  '.instrument-label',
  '.lab-overlay',
  '.lab-readout',
  '.viz-status',
  '.spacetime-readout',
  '.spacetime-control',
  '.build-legend',
  '.route-bar',
  '.site-controls',
  '.control-row',
  '.lang-switch',
  '.topic-index',
  '.tabs',
  '.legend',
  '.detail-step',
  '.detail-head',
  '.hero .tag',
  '.topic-title h1',
  '.hero-copy h1',
  '.preview-note',
  '.field-map-preview p',
  '.mol3d-caption',
  '.mol3d-shape',
  '.mol3d-note'
].join(',');

const componentRootSelector = [
  '.hero-instrument',
  '.lab-stage',
  '.spacetime-shell',
  '.assembly',
  '.mol3d-card',
  '.d-viz-card',
  '.nucleus-viz'
].join(',');

const canvasOverlaySelector = [
  '.instrument-label',
  '.lab-overlay',
  '.viz-status',
  '.spacetime-readout',
  '.spacetime-control',
  '.build-legend',
  '.mol3d-caption',
  '.mol3d-shape',
  '.mol3d-note'
].join(',');

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
    const response = await page.request.get(href);
    expect(response.status(), `internal link ${href}`).toBeLessThan(400);
  }
}

async function getLayoutScrollStops(page) {
  const maxScroll = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollHeight - innerHeight)
  );
  return [...new Set([
    0,
    Math.round(maxScroll * 0.2),
    Math.round(maxScroll * 0.45),
    Math.round(maxScroll * 0.7),
    maxScroll
  ])];
}

async function collectLayoutIssues(page) {
  return page.evaluate(({ nodeSelector, overlaySelector, rootSelector }) => {
    const issues = [];
    const seen = new Set();
    const visible = element => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1 &&
        rect.bottom > 0 && rect.right > 0 &&
        rect.top < innerHeight && rect.left < innerWidth;
    };
    const rectData = rect => ({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    });
    const overlaps = (a, b, minWidth = 1, minHeight = 1) => {
      const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      return width > minWidth && height > minHeight ? { width, height } : null;
    };
    const labelFor = element => {
      const id = element.id ? `#${element.id}` : '';
      const className = typeof element.className === 'string'
        ? `.${element.className.trim().replace(/\s+/g, '.')}` : '';
      return `${element.tagName.toLowerCase()}${id || className}`.slice(0, 120);
    };
    const pushIssue = (kind, detail) => {
      const key = `${kind}:${detail}`;
      if (seen.has(key)) return;
      seen.add(key);
      issues.push({ kind, detail, scrollY: Math.round(scrollY) });
    };

    const nodes = [...document.querySelectorAll(nodeSelector)].filter(visible).map(element => ({
      element,
      rect: rectData(element.getBoundingClientRect()),
      label: labelFor(element),
      position: getComputedStyle(element).position
    }));

    for (const node of nodes) {
      const topDockedSticky = node.position === 'sticky' && node.rect.top >= -1 && node.rect.top <= 24;
      const fixedLike = node.position === 'fixed' || topDockedSticky;
      if (node.rect.left < -1 || node.rect.right > innerWidth + 1) {
        pushIssue('out-of-bounds', `${node.label} extends past viewport width`);
      }
      if (fixedLike && (node.rect.top < -1 || node.rect.bottom > innerHeight + 1)) {
        pushIssue('out-of-bounds', `${node.label} extends past viewport height`);
      }
    }

    for (let left = 0; left < nodes.length; left++) {
      for (let right = left + 1; right < nodes.length; right++) {
        const a = nodes[left];
        const b = nodes[right];
        if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
        if (a.element.parentElement !== b.element.parentElement) continue;
        const hit = overlaps(a.rect, b.rect, 4, 4);
        if (hit) {
          pushIssue('dom-overlap', `${a.label} overlaps ${b.label} by ${hit.width.toFixed(1)}x${hit.height.toFixed(1)}px`);
        }
      }
    }

    const overlays = [...document.querySelectorAll(overlaySelector)].filter(visible).map(element => ({
      element,
      root: element.closest(rootSelector),
      rect: rectData(element.getBoundingClientRect()),
      label: labelFor(element)
    }));
    const surfaces = [...document.querySelectorAll('canvas, svg')].filter(visible).map(element => ({
      element,
      root: element.closest(rootSelector),
      rect: rectData(element.getBoundingClientRect()),
      label: labelFor(element)
    }));
    for (const overlay of overlays) {
      for (const surface of surfaces) {
        if (!overlay.root || !surface.root || overlay.root !== surface.root) continue;
        if (overlay.element.contains(surface.element) || surface.element.contains(overlay.element)) continue;
        const hit = overlaps(overlay.rect, surface.rect, 8, 8);
        if (hit) {
          pushIssue('canvas-overlay-overlap', `${overlay.label} overlaps ${surface.label} by ${hit.width.toFixed(1)}x${hit.height.toFixed(1)}px`);
        }
      }
    }

    for (const hero of document.querySelectorAll('.topic-hero, .hero-map, .field-portal')) {
      const title = hero.querySelector('.topic-title h1, .hero-copy h1');
      const instrument = hero.querySelector('.hero-instrument, .atlas-preview, .field-map-preview');
      if (!title || !instrument || !visible(title) || !visible(instrument)) continue;
      const hit = overlaps(rectData(title.getBoundingClientRect()), rectData(instrument.getBoundingClientRect()), 6, 6);
      if (hit) {
        pushIssue('hero-collision', `${labelFor(title)} overlaps ${labelFor(instrument)} by ${hit.width.toFixed(1)}x${hit.height.toFixed(1)}px`);
      }
    }

    return issues;
  }, {
    nodeSelector: layoutNodeSelector,
    overlaySelector: canvasOverlaySelector,
    rootSelector: componentRootSelector
  });
}

export async function assertLayout(page, options = {}) {
  const scrollStops = options.sweep ? await getLayoutScrollStops(page) : [await page.evaluate(() => Math.round(scrollY))];
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

  const issues = [];
  for (const scrollStop of scrollStops) {
    await page.evaluate(position => window.scrollTo(0, position), scrollStop);
    await page.waitForTimeout(50);
    issues.push(...await collectLayoutIssues(page));
  }
  expect(issues, 'layout surfaces should stay docked, visible, and non-overlapping').toEqual([]);
}

export async function assertNoErrors(errors) {
  expect(errors, 'no console, page, or local HTTP errors').toEqual([]);
}
