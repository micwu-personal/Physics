import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { exerciseBigBang, exerciseLanding, exerciseParticleZoo, exercisePeriodicTable } from './helpers/journeys.js';
import {
  blockExternalAssets,
  installDeterminism,
  preparePage,
  setLanguage
} from './helpers/runtime.js';

const journeys = [
  { id: 'landing', path: '/', run: exerciseLanding },
  { id: 'big-bang', path: '/big-bang/', run: exerciseBigBang },
  { id: 'periodic-table', path: '/periodic-table/', run: exercisePeriodicTable },
  { id: 'particle-zoo', path: '/particle-zoo/', run: exerciseParticleZoo }
];

async function collectCoverage(page, id, run) {
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await run();
  const coverage = await page.coverage.stopJSCoverage();
  await mkdir('test-results/coverage-raw', { recursive: true });
  await writeFile(`test-results/coverage-raw/${id}.json`, `${JSON.stringify(coverage)}\n`);
}

// Simulates a platform that exposes the Web Speech API with installed voices;
// headless Chromium ships the API but never reports a voice.
function installSpeechVoices(utteranceMs = 5) {
  const nativeSetTimeout = window.setTimeout.bind(window);
  const voices = [
    { lang: 'en-US', name: 'Mock English' },
    { lang: 'zh-CN', name: 'Mock Chinese' }
  ];
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.voice = null;
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    }
  };
  const synthesis = {
    cancel() {},
    getVoices: () => voices,
    onvoiceschanged: null,
    speak(utterance) {
      nativeSetTimeout(() => {
        utterance.onerror?.();
        utterance.onend?.();
      }, utteranceMs);
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => synthesis });
}

async function sweepComponentEvents(page) {
  await page.evaluate(() => {
    const dispatch = (element, type, init = {}) => {
      try {
        const EventClass =
          type.startsWith('pointer') ? PointerEvent :
          type.startsWith('mouse') || ['click', 'contextmenu'].includes(type) ? MouseEvent :
          type === 'wheel' ? WheelEvent :
          type.startsWith('drag') || type === 'drop' ? DragEvent :
          Event;
        element.dispatchEvent(new EventClass(type, {
          bubbles: true,
          cancelable: true,
          clientX: 40,
          clientY: 40,
          pointerId: 1,
          deltaY: type === 'wheel' ? -120 : 0,
          dataTransfer: ['dragstart', 'dragover', 'dragleave', 'drop'].includes(type)
            ? new DataTransfer()
            : undefined,
          ...init
        }));
      } catch {
        element.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
      }
    };
    const events = [
      'click', 'input', 'change', 'pointerdown', 'pointermove', 'pointerup',
      'pointercancel', 'mousedown', 'mousemove', 'mouseup', 'mouseleave',
      'wheel', 'dragstart', 'dragover', 'dragleave', 'drop', 'contextmenu'
    ];
    for (const element of document.querySelectorAll('*')) {
      if (element instanceof HTMLAnchorElement) continue;
      if (element instanceof HTMLInputElement) {
        if (element.type === 'range') {
          for (const value of [element.min, element.max]) {
            element.value = value;
            dispatch(element, 'input');
            dispatch(element, 'change');
          }
        } else if (element.type === 'checkbox') {
          element.checked = false;
          dispatch(element, 'change');
          element.checked = true;
          dispatch(element, 'change');
        }
      }
      if (element instanceof HTMLSelectElement) {
        for (const option of element.options) {
          element.value = option.value;
          dispatch(element, 'change');
        }
      }
      for (const type of events) dispatch(element, type);
    }
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

for (const journey of journeys) {
  for (const language of ['en', 'zh-CN']) {
    test(`${journey.id} ${language} browser coverage`, async ({ page }) => {
      await collectCoverage(page, `${journey.id}-${language}`, async () => {
        await preparePage(page, journey.path, language);
        await journey.run(page);
      });
    });
  }
}

for (const [id, navigatorLanguage] of [['zh', 'zh-CN'], ['en', 'en-US'], ['empty', '']]) {
  for (const [app, path, storageKey, exercise] of [
    ['landing', '/', 'physics.lang', exerciseLanding],
    ['big-bang', '/big-bang/', 'bb-lang', exerciseBigBang]
  ]) {
    test(`${app} navigator-language ${id} fallback coverage`, async ({ page }) => {
      await collectCoverage(page, `${app}-navigator-${id}`, async () => {
        await installDeterminism(page);
        await blockExternalAssets(page);
        await page.addInitScript(({ language, key }) => {
          localStorage.removeItem(key);
          Object.defineProperty(navigator, 'language', {
            configurable: true,
            get: () => language
          });
        }, { language: navigatorLanguage, key: storageKey });
        await page.goto(path);
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        await exercise(page);
      });
    });
  }
}

test('landing unavailable storage coverage', async ({ page }) => {
  await collectCoverage(page, 'landing-storage-unavailable', async () => {
    await installDeterminism(page);
    await blockExternalAssets(page);
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new DOMException('Storage unavailable', 'SecurityError');
      };
      Storage.prototype.setItem = () => {
        throw new DOMException('Storage unavailable', 'QuotaExceededError');
      };
    });
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('[data-lang="zh-CN"]').click();
  });
});

test('big-bang browser lifecycle coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-lifecycle', async () => {
    await preparePage(page, '/big-bang/', 'en');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });
});

test('big-bang offscreen observer coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-offscreen', async () => {
    await page.addInitScript(() => {
      window.IntersectionObserver = class {
        constructor(callback) {
          this.callback = callback;
        }
        observe(target) {
          this.callback([{ target, isIntersecting: false }]);
        }
      };
    });
    await preparePage(page, '/big-bang/', 'en');
  });
});

test('big-bang motion-query callback coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-motion-callback', async () => {
    await page.addInitScript(() => {
      window.__motionListeners = [];
      window.matchMedia = () => ({
        matches: false,
        addEventListener(type, listener) {
          if (type === 'change') window.__motionListeners.push(listener);
        }
      });
    });
    await preparePage(page, '/big-bang/', 'en');
    await page.evaluate(() => {
      window.__motionListeners.forEach(listener => listener({ matches: true }));
      window.__motionListeners.forEach(listener => listener({ matches: false }));
    });
  });
});

test('big-bang unavailable platform APIs coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-platform-fallbacks', async () => {
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    await page.addInitScript(() => {
      delete window.IntersectionObserver;
      const nativeGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
        if (key === 'bb-lang') throw new DOMException('Storage unavailable', 'SecurityError');
        return nativeGetItem.call(this, key);
      };
    });
    await page.goto('/big-bang/');
    await page.waitForLoadState('load');
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Storage unavailable', 'QuotaExceededError');
      };
    });
    await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  });
});

test('landing and big-bang component fallbacks coverage', async ({ page }) => {
  await collectCoverage(page, 'landing-big-bang-component-fallbacks', async () => {
    await preparePage(page, '/', 'en');
    await page.evaluate(() => {
      applyLang('unsupported');
      const element = document.querySelector('[data-i18n]');
      element.dataset.i18n = 'missing.translation';
      applyLang('en');
    });

    await preparePage(page, '/big-bang/', 'en');
    await page.evaluate(() => {
      fmtTime(1);
    });
  });
});

test('big-bang isolated i18n fallbacks coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-isolated-i18n', async () => {
    await page.goto('/__health');
    await page.setContent(`
      <!doctype html>
      <html><head><title>Fallback title</title></head>
      <body>
        <div data-i18n="missing.translation"></div>
        <button class="lang-pill" data-lang="en"></button>
      </body></html>
    `);
    await page.addScriptTag({ url: '/big-bang/i18n.js' });
    await page.evaluate(() => {
      applyI18n('unsupported');
      document.title = 'Fallback title';
      document.querySelector('title').dataset.i18n = 'missing.translation';
      applyI18n('en');
      window.CURRENT_LANG = '';
      getEpoch(EPOCHS[0].id);
      getEpoch('missing');
    });
  });
});

test('periodic-table reduced-motion and visibility coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-reduced-hidden', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await preparePage(page, '/periodic-table/', 'en');
      await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
      await page.locator('#tlToggleBtn').click();
      await page.locator('#tlPlay').click();
      await page.locator('#cosmicPlayBtn').click();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    });
});

test('periodic-table unavailable observer and media APIs coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-platform-fallbacks', async () => {
      await installDeterminism(page);
      await setLanguage(page, 'en');
      await blockExternalAssets(page);
      await page.addInitScript(() => {
        delete window.IntersectionObserver;
        Object.defineProperty(window, 'matchMedia', {
          configurable: true,
          value: undefined
        });
      });
      await page.goto('/periodic-table/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
      await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
      await page.locator('#detailClose').click();
    });
  });

  test('periodic-table available speech synthesis coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-speech-available', async () => {
      await page.addInitScript(installSpeechVoices);
      await preparePage(page, '/periodic-table/', 'en');
      await page.evaluate(() => {
        const nativeSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay, ...args) =>
          nativeSetTimeout(callback, Math.min(delay, 20), ...args);
      });
      await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
      await page.locator('#ttsEn').click();
      await page.locator('#ttsZh').click();
      const rowSpeakers = page.locator('.row-speak');
      await rowSpeakers.nth(0).click();
      await page.waitForTimeout(200);
      await rowSpeakers.nth(1).click();
      await page.waitForTimeout(200);
      await rowSpeakers.nth(7).click();
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        speak('', 'en-US');
      });
      // The same sequence narrated in Simplified Chinese.
      await page.locator('.lang-pill[data-lang="zh-CN"]').click();
      await page.locator('.row-speak').nth(1).click();
      await page.waitForTimeout(250);
    });
  });

  test('periodic-table unavailable speech synthesis coverage', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss());
    await collectCoverage(page, 'periodic-speech-unavailable', async () => {
      await page.addInitScript(() => {
        delete window.speechSynthesis;
        delete window.SpeechSynthesisUtterance;
      });
      await preparePage(page, '/periodic-table/', 'en');
      await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
      await page.locator('#ttsEn').click();
      await page.locator('.pt-row .row-speak').first().click();
      await page.evaluate(() => ensureVoices());
    });
  });

  test('periodic-table interrupted row narration coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-speech-interrupted', async () => {
      await page.addInitScript(installSpeechVoices, 300);
      await preparePage(page, '/periodic-table/', 'en');
      const rowSpeakers = page.locator('.row-speak');
      await rowSpeakers.nth(1).click();
      // Interrupt while the first element name is still being spoken.
      await page.waitForTimeout(180);
      await rowSpeakers.nth(2).click();
      await page.waitForTimeout(500);
    });
  });

  test('periodic-table deferred speech voices coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-speech-deferred', async () => {
      await page.addInitScript(() => {
        // Chromium loads voices asynchronously: the first getVoices() call is
        // empty and the list arrives with an onvoiceschanged notification.
        let voices = [];
        const synthesis = {
          cancel() {},
          getVoices: () => voices,
          onvoiceschanged: null,
          speak(utterance) {
            setTimeout(() => utterance.onend?.(), 5);
          }
        };
        window.SpeechSynthesisUtterance = class {
          constructor(text) {
            this.text = text;
            this.lang = '';
            this.voice = null;
            this.rate = 1;
            this.onend = null;
            this.onerror = null;
          }
        };
        Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => synthesis });
        window.__deliverVoices = () => {
          voices = [{ lang: 'en-US', name: 'Deferred English' }];
          synthesis.onvoiceschanged();
        };
      });
      await preparePage(page, '/periodic-table/', 'en');
      await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
      await page.locator('#ttsEn').click();
      await page.waitForTimeout(50);
      await page.evaluate(() => window.__deliverVoices());
      await page.waitForTimeout(100);
    });
  });

test('periodic-table accelerated animation callbacks coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-accelerated-callbacks', async () => {
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout;
      window.setTimeout = (callback, delay, ...args) =>
        nativeSetTimeout(callback, Math.min(delay, 10), ...args);
      let now = 0;
      Object.defineProperty(performance, 'now', {
        configurable: true,
        value: () => (now += 6000)
      });
    });
    await preparePage(page, '/periodic-table/', 'en');
    await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
    await page.waitForTimeout(30);
    await page.locator('#dRx button').first().dispatchEvent('click');
    const orbitalCanvas = page.locator('#orbitalCanvas');
    await orbitalCanvas.scrollIntoViewIfNeeded();
    const orbitalBox = await orbitalCanvas.boundingBox();
    const orbitalPoint = { x: orbitalBox.x + orbitalBox.width / 2, y: orbitalBox.y + orbitalBox.height / 2 };
    await page.mouse.move(orbitalPoint.x, orbitalPoint.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(80);
    // Grabbing the model again before the idle timer fires keeps auto-spin off.
    await page.mouse.down();
    await page.mouse.up();
    await page.mouse.down();
    const card = page.locator('.mol3d-card').first();
    await card.scrollIntoViewIfNeeded();
    const cardBox = await card.boundingBox();
    const cardPoint = { x: cardBox.x + cardBox.width / 2, y: cardBox.y + cardBox.height / 2 };
    await page.mouse.up();
    await page.mouse.move(cardPoint.x, cardPoint.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(80);
    await page.mouse.down();
    await page.mouse.up();
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(120);
  });
});

for (const [id, navigatorLanguage] of [['zh', 'zh-CN'], ['en', 'en-US'], ['empty', '']]) {
    test(`periodic-table navigator-language ${id} fallback coverage`, async ({ page }) => {
      await collectCoverage(page, `periodic-navigator-${id}`, async () => {
        await installDeterminism(page);
        await blockExternalAssets(page);
        await page.addInitScript(language => {
          localStorage.removeItem('pt-lang');
          Object.defineProperty(navigator, 'language', {
            configurable: true,
            get: () => language
          });
        }, navigatorLanguage);
        await page.goto('/periodic-table/');
        await page.waitForLoadState('load');
        await page.waitForTimeout(500);
      });
    });
  }

  test('periodic-table unavailable storage coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-storage-unavailable', async () => {
      await installDeterminism(page);
      await blockExternalAssets(page);
      await page.addInitScript(() => {
        const nativeGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = function(key) {
          if (key === 'pt-lang') throw new DOMException('Storage unavailable', 'SecurityError');
          return nativeGetItem.call(this, key);
        };
      });
      await page.goto('/periodic-table/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
    });
  });

for (const language of ['en', 'zh-CN']) {
  test(`periodic-table reaction choreography ${language} coverage`, async ({ page }) => {
    await collectCoverage(page, `periodic-reaction-${language}`, async () => {
      await page.addInitScript(() => {
        // Run the wall clock three times faster so the 5.5 s reaction
        // choreography is sampled at every phase within the test budget.
        const startedAt = Date.now();
        Object.defineProperty(performance, 'now', {
          configurable: true,
          value: () => (Date.now() - startedAt) * 3
        });
      });
      await preparePage(page, '/periodic-table/', language);
      await page.locator('.cell[data-z="6"]').first().dispatchEvent('click');
      const reactions = page.locator('#dRx button');
      for (let index = 0; index < await reactions.count(); index++) {
        await reactions.nth(index).dispatchEvent('click');
        // The animation only advances while its canvas is on screen.
        await page.locator('#rxAnimBox').scrollIntoViewIfNeeded();
        await page.waitForTimeout(2200);
      }
      // Unbalanced equations are drawn with atoms fading out and appearing.
      await page.evaluate(() => animateReaction('2H₂ + O₂ → H₂O'));
      await page.locator('#rxAnimBox').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2200);
      await page.evaluate(() => animateReaction('H₂O → 2H₂ + O₂'));
      await page.locator('#rxAnimBox').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2200);
    });
  });
}

test('periodic-table cosmic timeline completion coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-cosmic-timeline', async () => {
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout;
      window.setTimeout = (callback, delay, ...args) =>
        nativeSetTimeout(callback, Math.min(delay, 8), ...args);
    });
    await preparePage(page, '/periodic-table/', 'en');
    const play = page.locator('#cosmicPlayBtn');
    // Stop mid-era: pending per-element reveals must become no-ops.
    await play.click();
    await page.waitForTimeout(12);
    await play.click();
    await expect(page.locator('.cell.not-yet-forged')).toHaveCount(0);
    // Then let the whole 8-era sequence finish on its own.
    await play.click();
    await page.waitForTimeout(600);
    await expect(page.locator('#cosmicBanner')).not.toHaveClass(/on/);
    await expect(page.locator('.cell.not-yet-forged')).toHaveCount(0);
    await page.evaluate(() => {
      window.currentZ = 26;
      window.__D1.injectOriginBadge();
      window.__D1.injectOriginBadge();
      delete window.currentZ;
    });
  });
});

test('periodic-table hidden-during-bootstrap coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-hidden-bootstrap', async () => {
    await page.addInitScript(() => {
      // Simulate a heavily loaded main thread: the feature bootstrap timers land
      // late, so lifecycle events arrive before the toolbars exist.
      const nativeSetTimeout = window.setTimeout;
      window.setTimeout = (callback, delay, ...args) =>
        nativeSetTimeout(callback, delay >= 100 ? delay * 20 : delay, ...args);
    });
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    await page.goto('/periodic-table/');
    await page.waitForLoadState('load');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('#cosmicPlayBtn')).toHaveCount(0);
  });
});

test('periodic-table overlay data-shape coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-overlay-shapes', async () => {
    await preparePage(page, '/periodic-table/', 'en');
    // A discrete overlay applied first has to build its own chips and values.
    await page.locator('#viewToolbar [data-ov="origin"]').click();
    await expect(page.locator('.cell[data-z="26"] .ov-chip')).toHaveCount(1);
    await page.locator('#viewToolbar [data-ov="default"]').click();
    await page.evaluate(() => {
      const saved = { ...F_RADIUS };
      const restore = () => {
        for (const key of Object.keys(F_RADIUS)) delete F_RADIUS[key];
        Object.assign(F_RADIUS, saved);
      };
      // Empty dynamic data: the gradient legend must stay hidden.
      for (const key of Object.keys(F_RADIUS)) delete F_RADIUS[key];
      window.__F1.applyOverlay('radius');
      // Single-valued data: the gradient denominator collapses to zero.
      F_RADIUS[26] = 140;
      F_RADIUS[27] = 140;
      window.__F1.applyOverlay('radius');
      restore();
      window.__F1.applyOverlay('radius');
    });
    await expect(page.locator('#viewLegend')).toHaveClass(/on/);
  });
});

test('periodic-table collapsed-panel rendering coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-collapsed-panel', async () => {
    await preparePage(page, '/periodic-table/', 'en');
    await page.evaluate(() => {
      // Closing the chart before it was ever opened must be a no-op.
      window.__B1.close();
    });
    await page.locator('.cell[data-z="6"]').first().dispatchEvent('click');
    await page.locator('#detailClose').click();
    await page.evaluate(() => {
      // Canvas renderers invoked while the panel is collapsed have no layout box.
      drawNucleus(26, 30);
      render3DViewers(EXTENDED[6].reactions);
    });
    await page.waitForTimeout(120);
  });
});

  test('periodic-table late-bootstrap coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-isolated-fallbacks', async () => {
      await preparePage(page, '/periodic-table/', 'en');
      for (const script of [
        'features/overlays.js',
        'features/origins.js',
        'features/nuclide.js',
        'features/timeline.js',
        'features/ligand.js'
      ]) {
        await page.addScriptTag({ url: `/periodic-table/${script}` });
      }
      await page.waitForTimeout(500);
    });
  });

  test('periodic-table deterministic component boundary coverage', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss());
    await collectCoverage(page, 'periodic-component-boundaries', async () => {
      await page.addInitScript(() => {
        window.__initialGlobalNames = Object.getOwnPropertyNames(window);
      });
      await page.addInitScript(installSpeechVoices);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await preparePage(page, '/periodic-table/', 'en');
      await page.evaluate(() => {
        const initial = new Set(window.__initialGlobalNames);
        const values = [
          undefined,
          null,
          false,
          true,
          0,
          1,
          -1,
          26,
          104,
          '',
          'en',
          'zh-CN',
          'missing',
          'H₂O',
          'Ca(OH)₂',
          [],
          {},
          ELEMENTS[1],
          ELEMENTS[26]
        ];
        const invoke = (fn, args) => {
          try {
            fn(...args);
          } catch {
            // Boundary calls intentionally verify direct failure as well as fallbacks.
          }
        };
        for (const name of Object.getOwnPropertyNames(window)) {
          if (initial.has(name) || typeof window[name] !== 'function') continue;
          const fn = window[name];
          invoke(fn, []);
          for (const value of values) invoke(fn, [value, value, value, value]);
        }
        for (const controllerName of ['__F1', '__F2', '__D1', '__B1', '__C5']) {
          const controller = window[controllerName];
          if (!controller) continue;
          for (const fn of Object.values(controller)) {
            if (typeof fn !== 'function') continue;
            invoke(fn, []);
            for (const value of values) invoke(fn, [value, value]);
          }
        }
        for (const wavelength of [300, 380, 400, 440, 480, 500, 550, 600, 700, 780, 900]) {
          invoke(window.__C5.wavelengthToRGB, [wavelength]);
        }
        for (const color of ['rgb(0,0,0)', 'rgb(255,255,255)', 'invalid']) {
          invoke(window.__C5.complementary, [color]);
          invoke(window.__C5.nearestColorName, [color]);
        }
        for (const atomicNumber of [0, 21, 22, 26, 30, 74, 119]) {
          invoke(window.__C5.isChromophore, [atomicNumber]);
          invoke(window.__C5.defaultMetal, [atomicNumber]);
        }
        invoke(window.__F1.lerpHex, ['#000000', '#ffffff', -1]);
        invoke(window.__F1.lerpHex, ['#000000', '#ffffff', 2]);
        for (const overlay of [
          { data: { 1: null, 2: 0, 3: 5 }, log: true },
          { dataFn: z => z === 1 ? null : z }
        ]) {
          invoke(window.__F1.collectValues, [overlay]);
        }
        invoke(window.__F2.getDiscoveryYear, [0]);
        invoke(window.__F2.getDiscoveryYear, [26]);
        invoke(window.__D1.getCurrentZ, []);
      });
    });
});

test('periodic-table exhaustive component event coverage', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss());
    await collectCoverage(page, 'periodic-component-events', async () => {
      await preparePage(page, '/periodic-table/', 'en');
      await sweepComponentEvents(page);
      await page.waitForTimeout(300);
      await sweepComponentEvents(page);
    });
});

  for (const [id, navigatorLanguage] of [['zh', 'zh-CN'], ['en', 'en-US'], ['empty', '']]) {
    test(`particle-zoo navigator-language ${id} fallback coverage`, async ({ page }) => {
      await collectCoverage(page, `particle-navigator-${id}`, async () => {
        await installDeterminism(page);
        await blockExternalAssets(page);
        await page.addInitScript(language => {
          localStorage.removeItem('pz-lang');
          Object.defineProperty(navigator, 'language', {
            configurable: true,
            get: () => language
          });
        }, navigatorLanguage);
        await page.goto('/particle-zoo/');
        await page.waitForLoadState('load');
        await page.waitForTimeout(500);
      });
    });
  }

  test('particle-zoo unavailable storage coverage', async ({ page }) => {
    await collectCoverage(page, 'particle-storage-unavailable', async () => {
      await installDeterminism(page);
      await blockExternalAssets(page);
      await page.addInitScript(() => {
        const nativeGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = function(key) {
          if (key === 'pz-lang') throw new DOMException('Storage unavailable', 'SecurityError');
          return nativeGetItem.call(this, key);
        };
      });
      await page.goto('/particle-zoo/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        Storage.prototype.setItem = () => {
          throw new DOMException('Storage unavailable', 'QuotaExceededError');
        };
      });
      await page.locator('.lang-pill[data-lang="zh-CN"]').click();
    });
  });

  test('particle-zoo unavailable observer coverage', async ({ page }) => {
    await collectCoverage(page, 'particle-observer-unavailable', async () => {
      await installDeterminism(page);
      await setLanguage(page, 'en');
      await blockExternalAssets(page);
      await page.addInitScript(() => {
        delete window.IntersectionObserver;
      });
      await page.goto('/particle-zoo/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
      await page.locator('.tab[data-tab="lab"]').click();
      await page.locator('.tab[data-tab="playground"]').click();
    });
  });

  test('particle-zoo hidden and offscreen animation coverage', async ({ page }) => {
    await collectCoverage(page, 'particle-hidden-offscreen', async () => {
      await page.addInitScript(() => {
        window.__coverageObservers = [];
        window.IntersectionObserver = class {
          constructor(callback) {
            this.callback = callback;
            window.__coverageObservers.push(this);
          }
          disconnect() {}
          observe(target) {
            this.callback([{ target, isIntersecting: false }]);
          }
          unobserve() {}
        };
      });
      await preparePage(page, '/particle-zoo/', 'en');
      await page.locator('.tab[data-tab="lab"]').click();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    });
  });

test('particle-zoo accelerated lifecycle callbacks coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-accelerated-callbacks', async () => {
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout;
      window.setTimeout = (callback, delay, ...args) =>
        nativeSetTimeout(callback, Math.min(delay, 10), ...args);
    });
    await preparePage(page, '/particle-zoo/', 'en');
    await page.locator('.tab[data-tab="lab"]').click();
    await page.locator('.lab-subtab[data-lab-sub="basics"]').click();
    await page.evaluate(() => {
      const state = LAB.conf;
      state.q = { x: 0, y: state.h / 2 };
      state.aq = { x: state.w, y: state.h / 2 };
      state.dragging = false;
      state.snapPos = { x: state.w / 2, y: state.h / 2 };
      state.snapPair = {
        q2: { x: state.w / 2 - 20, y: state.h / 2 },
        aq2: { x: state.w / 2 + 20, y: state.h / 2 }
      };
      state.snapPop = 1;
      markLabDirty();
    });
    await page.waitForTimeout(150);
  });
});

// Opening the app directly on a tab other than the particle chart starts that
// tab's animation loop during bootstrap.
for (const [tab, marker] of [['forces', 'ixRAF'], ['lab', 'labRAF']]) {
  test(`particle-zoo initial ${tab} tab coverage`, async ({ page }) => {
    await collectCoverage(page, `particle-initial-${tab}`, async () => {
      await installDeterminism(page);
      await setLanguage(page, 'en');
      await blockExternalAssets(page);
      await page.addInitScript(activeTab => {
        // Flip the pre-selected tab as soon as the markup is parsed, before the
        // application script at the end of <body> runs.
        const observer = new MutationObserver(() => {
          const target = document.querySelector(`.tab[data-tab="${activeTab}"]`);
          const panel = document.getElementById(`tab-${activeTab}`);
          if (!target || !panel) return;
          observer.disconnect();
          document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === target));
          for (const item of panel.parentElement.children) item.classList.toggle('active', item === panel);
        });
        observer.observe(document, { childList: true, subtree: true });
      }, tab);
      await page.goto('/particle-zoo/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
      await expect(page.locator(`.tab[data-tab="${tab}"]`)).toHaveClass(/active/);
    });
  });
}

test('particle-zoo reduced-motion lab coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-reduced-lab', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await preparePage(page, '/particle-zoo/', 'en');
    await page.locator('.tab[data-tab="lab"]').click();
    await page.locator('.lab-subtab[data-lab-sub="advanced"]').click();
    // Static repaints only: no animation loop may be scheduled.
    await page.evaluate(() => markLabDirty());
    expect(await page.evaluate(() => labRAF)).toBe(null);
    await page.locator('.lab-subtab[data-lab-sub="basics"]').click();
    await page.evaluate(() => markLabDirty());
  });
});

test('particle-zoo deterministic component boundary coverage', async ({ page }) => {
      await collectCoverage(page, 'particle-component-boundaries', async () => {
        await page.addInitScript(() => {
          window.__initialGlobalNames = Object.getOwnPropertyNames(window);
        });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await preparePage(page, '/particle-zoo/', 'en');
        await page.evaluate(() => {
          const initial = new Set(window.__initialGlobalNames);
          const values = [
            undefined,
            null,
            false,
            true,
            0,
            1,
            -1,
            '',
            'en',
            'zh-CN',
            'missing',
            'electron',
            'gamma',
            'H₂O',
            [],
            {},
            ['u', 'd', 'd'],
            { x: 0, y: 0 }
          ];
          const invoke = (fn, args) => {
            try {
              fn(...args);
            } catch {
              // Boundary calls intentionally verify direct failure as well as fallbacks.
            }
          };
          for (const name of Object.getOwnPropertyNames(window)) {
            if (initial.has(name) || typeof window[name] !== 'function') continue;
            const fn = window[name];
            invoke(fn, []);
            for (const value of values) invoke(fn, [value, value, value, value]);
          }
          for (const fn of [PZ_PERF.snapshot.bind(PZ_PERF), PZ_PERF.reset.bind(PZ_PERF)]) {
            invoke(fn, []);
          }
          history.replaceState({}, '', '/particle-zoo/mobile/');
          fixBigBangLink();
          history.replaceState({}, '', '/particle-zoo/');
          fixBigBangLink();
          // Required markup is a hard dependency.
          invoke(requireElement, ['definitely-not-in-the-page']);
          // Neutron-rich isotopes such as tritium offer a β⁻ channel; the
          // greedy nucleon assembler cannot lay them out from the tray yet.
          getDecayModes(1, 2, 1);
          getDecayModes(2, 0, 1);
        });
      });
});

test('particle-zoo exhaustive component event coverage', async ({ page }) => {
  page.on('dialog', dialog => dialog.dismiss());
  await collectCoverage(page, 'particle-component-events', async () => {
    await preparePage(page, '/particle-zoo/', 'en');
    await sweepComponentEvents(page);
    await page.waitForTimeout(300);
    await sweepComponentEvents(page);
  });
});
