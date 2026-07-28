import { expect } from '@playwright/test';

const fixedEpoch = Date.UTC(2024, 0, 2, 3, 4, 5);

export async function prepareRenderingPage(page, path, language, seed = 0x2f6e2b1) {
  await page.addInitScript(({ epoch, language, seed }) => {
    let randomState = seed >>> 0;
    Math.random = () => {
      randomState = (randomState * 1664525 + 1013904223) >>> 0;
      return randomState / 0x100000000;
    };

    let visualNow = 0;
    let nextFrameId = 1;
    const frameQueue = new Map();
    const NativeDate = Date;

    class VisualDate extends NativeDate {
      constructor(...args) {
        super(...(args.length ? args : [epoch + visualNow]));
      }

      static now() {
        return epoch + visualNow;
      }
    }

    window.Date = VisualDate;
    Object.defineProperty(performance, 'now', {
      configurable: true,
      value: () => visualNow
    });
    window.requestAnimationFrame = callback => {
      const id = nextFrameId++;
      frameQueue.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = id => frameQueue.delete(id);
    window.__visualClock = {
      now: () => visualNow,
      pending: () => frameQueue.size,
      step(milliseconds = 16) {
        visualNow += milliseconds;
        const callbacks = [...frameQueue.values()];
        frameQueue.clear();
        callbacks.forEach(callback => callback(visualNow));
        return callbacks.length;
      }
    };

    for (const key of ['physics.lang', 'bb-lang', 'pt-lang', 'pz-lang']) {
      localStorage.setItem(key, language);
    }
  }, { epoch: fixedEpoch, language, seed });

  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => {
    route.fulfill({ status: 204, body: '' });
  });
  await page.goto(path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.addStyleTag({
    content: `
      html { scroll-behavior: auto !important; }
      *, *::before, *::after {
        animation: none !important;
        backdrop-filter: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `
  });
}

export async function stepVisualClock(page, milliseconds = 16, frames = 1) {
  for (let frame = 0; frame < frames; frame++) {
    await page.evaluate(ms => window.__visualClock.step(ms), milliseconds);
  }
}

export async function setRangeValue(locator, value) {
  await locator.evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function scrollIntoStableView(locator) {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
  await locator.page().waitForTimeout(25);
}

export async function expectNotClipped(locator) {
  await expect(locator).toBeVisible();
  await scrollIntoStableView(locator);
  const geometry = await locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      width: rect.width
    };
  });
  expect(geometry.width).toBeGreaterThan(20);
  expect(geometry.height).toBeGreaterThan(20);
  expect(geometry.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  if (geometry.height <= geometry.viewportHeight) {
    expect(geometry.top).toBeGreaterThanOrEqual(-1);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  }
  return geometry;
}

export async function expectCanvasRendered(locator, minimumPaintedPixels = 32) {
  await expectNotClipped(locator);
  const metrics = await locator.evaluate(canvas => {
    const context = canvas.getContext('2d');
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    const stride = Math.max(1, Math.floor((width * height) / 200000));
    let painted = 0;
    const colors = new Set();
    for (let pixel = 0; pixel < width * height; pixel += stride) {
      const offset = pixel * 4;
      if (data[offset + 3] === 0) continue;
      painted++;
      colors.add(`${data[offset] >> 3},${data[offset + 1] >> 3},${data[offset + 2] >> 3},${data[offset + 3] >> 5}`);
    }
    return {
      colors: colors.size,
      cssHeight: canvas.getBoundingClientRect().height,
      cssWidth: canvas.getBoundingClientRect().width,
      intrinsicHeight: canvas.height,
      intrinsicWidth: canvas.width,
      painted
    };
  });
  expect(metrics.intrinsicWidth).toBeGreaterThan(20);
  expect(metrics.intrinsicHeight).toBeGreaterThan(20);
  expect(metrics.painted).toBeGreaterThan(minimumPaintedPixels);
  expect(metrics.colors).toBeGreaterThan(1);
  return metrics;
}

export async function expectSvgRendered(locator) {
  await expectNotClipped(locator);
  const metrics = await locator.evaluate(svg => {
    const shapes = [...svg.querySelectorAll('path, circle, ellipse, line, polyline, polygon, rect, text')];
    const visibleShapes = shapes.filter(shape => {
      const rect = shape.getBoundingClientRect();
      const style = getComputedStyle(shape);
      return rect.width + rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    return { shapes: shapes.length, visibleShapes: visibleShapes.length };
  });
  expect(metrics.shapes).toBeGreaterThan(2);
  expect(metrics.visibleShapes).toBeGreaterThan(2);
  return metrics;
}

export async function captureRendering(locator, name) {
  await expectNotClipped(locator);
  const screenshot = await locator.screenshot({
    animations: 'disabled',
    caret: 'hide'
  });
  expect(screenshot).toMatchSnapshot(name, {
    maxDiffPixelRatio: 0
  });
}
