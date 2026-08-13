export async function installDeterminism(page) {
  await page.addInitScript(() => {
    let seed = 0x2f6e2b1;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    const fontDescriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
    if (fontDescriptor?.get && fontDescriptor?.set) {
      Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
        configurable: fontDescriptor.configurable,
        enumerable: fontDescriptor.enumerable,
        get() {
          return fontDescriptor.get.call(this);
        },
        set(value) {
          const normalized = String(value)
            .replaceAll('Space Grotesk', 'Arial')
            .replaceAll('Noto Sans SC', 'Microsoft YaHei')
            .replaceAll('JetBrains Mono', 'Courier New');
          fontDescriptor.set.call(this, normalized);
        }
      });
    }
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
    try {
      for (const key of ['physics.lang', 'bb-lang', 'pt-lang', 'pz-lang']) {
        localStorage.setItem(key, lang);
      }
    } catch {
      // Init scripts also run on opaque origins (about:blank) that deny storage.
    }
  }, language);
}

export async function setMotionPreference(page, motionPreference) {
  await page.addInitScript(preference => {
    try {
      localStorage.setItem('physics.motion', preference);
    } catch {
      // Init scripts also run on opaque origins (about:blank) that deny storage.
    }
  }, motionPreference);
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
  if (options.reducedMotion) await page.emulateMedia({ reducedMotion: options.reducedMotion });
  await setLanguage(page, language);
  if (options.motionPreference) await setMotionPreference(page, options.motionPreference);
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
        font-family: Arial, "Microsoft YaHei", sans-serif !important;
        transition: none !important;
      }
      canvas {
        visibility: hidden !important;
      }
    `
  });
  // A full-page screenshot scrolls the viewport, so lazily loaded images can
  // resolve mid-capture and change the document height. Force them all in
  // before measuring so the captured layout is deterministic.
  await page.evaluate(async () => {
    const root = document.scrollingElement || document.documentElement;
    const step = Math.max(Math.floor(window.innerHeight * 0.8), 240);
    const maxScrollTop = Math.max(0, root.scrollHeight - window.innerHeight);
    for (let scrollTop = 0; scrollTop <= maxScrollTop; scrollTop += step) {
      window.scrollTo(0, scrollTop);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    window.scrollTo(0, maxScrollTop);
    await new Promise(resolve => setTimeout(resolve, 50));

    const images = [...document.images];
    for (const image of images) {
      image.loading = 'eager';
      image.decoding = 'sync';
    }
    await Promise.all(images.map(image => image.complete
      ? Promise.resolve()
      : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      })));
    await document.fonts.ready;
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.evaluate(async () => {
    const root = document.scrollingElement || document.documentElement;
    let stableFrames = 0;
    let previousHeight = -1;
    let previousWidth = -1;
    while (stableFrames < 3) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const nextHeight = root.scrollHeight;
      const nextWidth = root.scrollWidth;
      if (nextHeight === previousHeight && nextWidth === previousWidth) stableFrames++;
      else stableFrames = 0;
      previousHeight = nextHeight;
      previousWidth = nextWidth;
    }
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
