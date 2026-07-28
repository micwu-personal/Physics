export async function installDeterminism(page) {
  await page.addInitScript(() => {
    let seed = 0x2f6e2b1;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
  });
}

export async function installRuntimeProbe(page) {
  await page.addInitScript(() => {
    const probe = {
      duplicateListeners: 0,
      listenerAdds: 0,
      longTasks: [],
      rafCallbacks: 0
    };
    const seen = new WeakMap();
    const nativeAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (listener) {
        let targets = seen.get(this);
        if (!targets) {
          targets = new Map();
          seen.set(this, targets);
        }
        let listeners = targets.get(type);
        if (!listeners) {
          listeners = new WeakSet();
          targets.set(type, listeners);
        }
        if (listeners.has(listener)) probe.duplicateListeners++;
        else listeners.add(listener);
        probe.listenerAdds++;
      }
      return nativeAdd.call(this, type, listener, options);
    };
    const nativeRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => nativeRaf(time => {
      probe.rafCallbacks++;
      callback(time);
    });
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver(list => {
          probe.longTasks.push(...list.getEntries().map(entry => entry.duration));
        }).observe({ type: 'longtask', buffered: true });
      } catch {
        // Long Tasks are unavailable in some Chromium modes.
      }
    }
    window.__qualityProbe = probe;
  });
}

export async function setLanguage(page, language) {
  await page.addInitScript(lang => {
    for (const key of ['physics.lang', 'bb-lang', 'pt-lang', 'pz-lang']) {
      localStorage.setItem(key, lang);
    }
  }, language);
}

export async function blockExternalAssets(page) {
  await page.route(/^https?:\/\//, route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    return route.fulfill({ status: 204, body: '' });
  });
}

export async function preparePage(page, path, language, options = {}) {
  await installDeterminism(page);
  if (options.probe) await installRuntimeProbe(page);
  await setLanguage(page, language);
  await blockExternalAssets(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await page.waitForTimeout(400);
}

export async function freezeVisuals(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition: none !important;
      }
      canvas {
        visibility: hidden !important;
      }
    `
  });
  await page.waitForTimeout(100);
}

export async function setRange(locator, value) {
  await locator.evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
