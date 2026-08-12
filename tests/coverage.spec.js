import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { expectVisualScenario, fieldVisualScenarios, readFieldVisualState } from './helpers/field-visuals.js';
import { exerciseBigBang, exerciseLanding, exerciseParticleZoo, exercisePeriodicTable, exercisePhysicsArea, exercisePhysicsAstro, exercisePhysicsAtlas, exercisePhysicsEntropy, exercisePhysicsField, exercisePhysicsLight, exercisePhysicsPhase } from './helpers/journeys.js';
import {
  blockExternalAssets,
  installDeterminism,
  preparePage,
  setLanguage,
  setRange
} from './helpers/runtime.js';

const journeys = [
  { id: 'landing', path: '/', run: exerciseLanding },
  { id: 'physics-atlas', path: '/physics/', run: exercisePhysicsAtlas },
  { id: 'physics-newtonian', path: '/physics/newtonian.html', run: exercisePhysicsArea },
  { id: 'physics-relativity', path: '/physics/relativity.html', run: exercisePhysicsArea },
  { id: 'physics-quantum', path: '/physics/quantum.html', run: exercisePhysicsArea },
  { id: 'physics-astro', path: '/physics/astrophysics.html', run: exercisePhysicsAstro },
  { id: 'physics-light', path: '/physics/electrodynamics.html', run: exercisePhysicsLight },
  { id: 'physics-phase', path: '/physics/phase-transitions.html', run: exercisePhysicsPhase },
  { id: 'physics-entropy', path: '/physics/entropy-information.html', run: exercisePhysicsEntropy },
  { id: 'physics-field', path: '/physics/field.html?id=thermodynamics', run: exercisePhysicsField },
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

// Holds macro-tasks scheduled with a zero delay so the staged renderer's chunk
// queue can be advanced one task at a time. Only the platform timer is paced;
// no application function is replaced.
function installTimerPump() {
  const nativeSetTimeout = window.setTimeout.bind(window);
  const queue = [];
  window.__timerQueue = queue;
  window.setTimeout = (callback, delay, ...args) => {
    if (!delay) {
      queue.push(() => callback(...args));
      return 0;
    }
    return nativeSetTimeout(callback, delay, ...args);
  };
  window.__pumpTimer = () => {
    const task = queue.shift();
    if (task) task();
    return queue.length;
  };
}

const stagedRenderState = () => ({
  pending: document.querySelectorAll('.render-pending').length,
  queues: Object.fromEntries([...panelRenderQueues].map(([tab, list]) => [tab, list.length])),
  staged: [...stagedPanels],
  tasks: window.__timerQueue.length
});

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
    // A synthetic PointerEvent never carries an active pointer id, so the real
    // setPointerCapture() rejects it. Keep the platform call in place but let it
    // behave the way it does for a pointer that is no longer down.
    if (!window.__pointerCaptureRelaxed) {
      window.__pointerCaptureRelaxed = true;
      const nativeSetPointerCapture = Element.prototype.setPointerCapture;
      Element.prototype.setPointerCapture = function(pointerId) {
        try {
          return nativeSetPointerCapture.call(this, pointerId);
        } catch {
          return undefined;
        }
      };
    }
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
    await page.locator('#motionToggle').click();
  });
});

/* ---------------------------------------------------------------- physics --
   The atlas and the three field laboratories share common.js, so the platform
   fallbacks below are exercised once on the page that reaches them first. */

test('physics unavailable storage coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-storage-unavailable', async () => {
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
    await page.goto('/physics/');
    await page.waitForLoadState('load');
    await page.locator('[data-lang="zh-CN"]').click();
    await page.locator('.motion-toggle').click();
    await page.locator('[data-lang="en"]').click();
  });
});

for (const [id, navigatorLanguage] of [['zh', 'zh-CN'], ['en', 'en-US'], ['empty', '']]) {
  test(`physics navigator-language ${id} fallback coverage`, async ({ page }) => {
    await collectCoverage(page, `physics-navigator-${id}`, async () => {
      await installDeterminism(page);
      await blockExternalAssets(page);
      await page.addInitScript(language => {
        localStorage.removeItem('physics.lang');
        localStorage.removeItem('physics.motion');
        Object.defineProperty(navigator, 'language', {
          configurable: true,
          get: () => language
        });
      }, navigatorLanguage);
      await page.goto('/physics/');
      await page.waitForLoadState('load');
      await page.locator('.field-node[data-field="mechanics"] button').click();
      await page.locator('[data-lang="zh-CN"]').click();
    });
  });
}

test('physics unsupported stored language coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-unsupported-language', async () => {
    await installDeterminism(page);
    await blockExternalAssets(page);
    // An unknown persisted value must fall back to English rather than throw.
    await setLanguage(page, 'de-DE');
    await page.goto('/physics/');
    await page.waitForLoadState('load');
    await page.locator('.field-node[data-field="fluids"] button').click();
  });
});

test('physics atlas selection, filter, and resize coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-atlas-graph', async () => {
    await preparePage(page, '/physics/', 'en');
    // A field with no ancestors exercises the empty-lineage caption, one with a
    // guide renders the action link, and one without renders the pending state.
    for (const field of ['astronomy-optics', 'fluids', 'standard-model', 'mechanics']) {
      await page.locator(`.field-node[data-field="${field}"] button`).dispatchEvent('click');
    }
    // Re-rendering copy while a node is selected refreshes the open inspector.
    await page.locator('[data-lang="zh-CN"]').click();
    await page.locator('.field-node[data-field="astronomy-optics"] button').dispatchEvent('click');
    await page.locator('[data-lang="en"]').click();

    for (const lineage of ['motion', 'fields', 'matter', 'quantum', 'cosmos', 'life', 'systems', 'all']) {
      await page.locator(`.lineage-filter[data-lineage="${lineage}"]`).click();
    }
    await page.locator('#fieldSearch').fill('entropy');
    await page.locator('#fieldSearch').fill('');
    await page.setViewportSize({ width: 900, height: 900 });
    await page.waitForTimeout(150);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForTimeout(150);
    // Escape dismisses the inspector; a second press is a no-op once nothing is
    // selected, and an unrelated key must be ignored entirely.
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.keyboard.press('a');
    await page.locator('.field-node[data-field="mechanics"] button').dispatchEvent('click');
    await page.keyboard.press('a');
    await page.locator('.inspector-close').click();
  });
});

for (const [id, path] of [
  ['newtonian', '/physics/newtonian.html'],
  ['relativity', '/physics/relativity.html'],
  ['quantum', '/physics/quantum.html']
]) {
  test(`physics ${id} lab lifecycle coverage`, async ({ page }) => {
    await collectCoverage(page, `physics-${id}-lifecycle`, async () => {
      await preparePage(page, path, 'en');
      await page.locator('#audioToggle').click();
      // Long enough for the relativity light clock to cross both half-cycles and
      // for the orbit trail and detection buffer to reach their retention caps.
      await page.waitForTimeout(4_000);
      await page.locator('[data-lang="zh-CN"]').click();
      await page.locator('#labToggle').click();
      await page.locator('#labReset').click();
      await page.locator('#audioToggle').click();
      await page.locator('#labToggle').click();
      await page.locator('[data-lang="en"]').click();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.locator('.motion-toggle').click();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.locator('.motion-toggle').click();
    });
  });
}

test('physics orbit escape and close-approach coverage', async ({ page }) => {
  test.slow();
  await collectCoverage(page, 'physics-orbit-limits', async () => {
    await preparePage(page, '/physics/newtonian.html', 'en');
    const speed = page.locator('#primaryControl');
    const mass = page.locator('#secondaryControl');
    // The slowest launch around the heaviest star falls inside the capture radius.
    await setRange(speed, await speed.getAttribute('min'));
    await setRange(mass, await mass.getAttribute('max'));
    await page.waitForTimeout(4_000);
    // The fastest launch around the lightest star leaves on an open trajectory.
    await setRange(speed, await speed.getAttribute('max'));
    await setRange(mass, await mass.getAttribute('min'));
    await page.waitForTimeout(6_000);
  });
});

test('physics quantum sampling extremes coverage', async ({ page }) => {
  test.slow();
  await collectCoverage(page, 'physics-quantum-extremes', async () => {
    await preparePage(page, '/physics/quantum.html', 'en');
    const separation = page.locator('#primaryControl');
    const wavelength = page.locator('#secondaryControl');
    const rate = page.locator('#rateControl');
    await setRange(separation, await separation.getAttribute('max'));
    await setRange(wavelength, await wavelength.getAttribute('min'));
    await page.waitForTimeout(1_000);
    await setRange(separation, await separation.getAttribute('min'));
    await setRange(wavelength, await wavelength.getAttribute('max'));
    // The fastest detection rate fills the retained-hit buffer past its cap.
    await setRange(rate, await rate.getAttribute('max'));
    await page.waitForTimeout(8_000);
  });
});

test('physics unavailable platform APIs coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-platform-fallbacks', async () => {
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    await page.addInitScript(() => {
      // A device that reports no pixel ratio and exposes no Web Audio support.
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 0 });
      delete window.AudioContext;
      delete window.webkitAudioContext;
    });
    await page.goto('/physics/newtonian.html');
    await page.waitForLoadState('load');
    await page.locator('#audioToggle').click();
    await page.waitForTimeout(300);
  });
});

test('physics prefixed audio context coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-prefixed-audio', async () => {
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    await page.addInitScript(() => {
      // Older WebKit only exposes the prefixed constructor, and starts suspended
      // until a gesture resumes it.
      const NativeAudioContext = window.AudioContext;
      class PrefixedAudioContext extends NativeAudioContext {
        get state() {
          return this.__resumed ? 'running' : 'suspended';
        }
        resume() {
          this.__resumed = true;
          return Promise.resolve();
        }
      }
      delete window.AudioContext;
      window.webkitAudioContext = PrefixedAudioContext;
    });
    await page.goto('/physics/quantum.html');
    await page.waitForLoadState('load');
    await page.locator('#audioToggle').click();
    await page.waitForTimeout(800);
  });
});

for (const storedMotion of ['pause', 'play']) {
  test(`physics stored ${storedMotion} motion coverage`, async ({ page }) => {
    await collectCoverage(page, `physics-stored-motion-${storedMotion}`, async () => {
      await installDeterminism(page);
      await blockExternalAssets(page);
      // A persisted override must win over the system reduced-motion setting.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript(motion => {
        localStorage.setItem('physics.motion', motion);
      }, storedMotion);
      await page.goto('/physics/newtonian.html');
      await page.waitForLoadState('load');
      await page.waitForTimeout(400);
    });
  });
}

/* The formula parser supports more grammar than any single page uses, so it is
   exercised directly rather than only through the equations that appear in copy. */
test('physics formula parser grammar coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-formula-grammar', async () => {
    await preparePage(page, '/physics/field.html?id=statistical', 'en');
    const results = await page.evaluate(() => {
      const samples = [
        'F = \\frac{dp}{dt}',
        'v = \\sqrt{\\frac{2E}{m}}',
        '\\hat{r} \\vec{v} \\overline{x}',
        '\\mathrm{Re} = 1 \\text{ok}',
        '\\mathcal{E} = \\mathcal{L} + \\mathcal{zz}',
        '\\left( a + b \\right) [c] \\langle d \\rangle |e|',
        'a\\,b\\;c\\quad d\\qquad e\\!f',
        'x_i^2 + y^{n+1} - z_{ab}',
        '\\alpha\\beta\\gamma\\Delta\\Omega\\varepsilon',
        '\\partial \\nabla \\infty \\hbar \\ell \\deg',
        'a \\cdot b \\times c \\pm d \\mp e \\approx f \\neq g',
        'h \\leq i \\geq j \\ll k \\gg l \\sim m \\simeq n',
        'p \\to q \\rightarrow r \\propto s',
        '\\unknowncommand{x} 42.5',
        '\\lvert \\psi \\rvert^2',
        '\\',
        '\\sqrt',
        '\\left',
        '\\mathrm{\\frac{1}{2}}',
        '<&>'
      ];
      const rendered = samples.map(tex => PhysicsFormula.toMathML(tex));
      const block = PhysicsFormula.toMathML('E = mc^2', {
        display: true,
        label: 'E & m are < c > zero'
      });

      // upgrade() replaces [data-tex] elements and must be idempotent.
      const host = document.createElement('div');
      host.innerHTML = '<span data-tex="a^2 + b^2 = c^2">a2 plus b2</span>' +
        '<span data-tex="\\frac{1}{2}" data-tex-display="block">half</span>';
      document.body.append(host);
      PhysicsFormula.upgrade(host);
      const first = host.firstElementChild.innerHTML;
      PhysicsFormula.upgrade(host);
      const stable = host.firstElementChild.innerHTML === first;
      PhysicsFormula.upgrade();
      host.remove();

      return {
        allMath: rendered.every(html => html.startsWith('<math')),
        block: block.includes('display="block"') &&
          block.includes('aria-label') &&
          block.includes('&amp;') &&
          block.includes('&lt;') &&
          block.includes('&gt;'),
        stable
      };
    });
    // The normal page load exercises the DOMContentLoaded path. Loading the same
    // browser-only script after document completion covers its immediate upgrade.
    await page.addScriptTag({ url: '/physics/formula.js' });
    if (!results.allMath || !results.block || !results.stable) {
      throw new Error(`formula parser regression: ${JSON.stringify(results)}`);
    }
  });
});

test('physics field authored diagram and equation fallback coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-field-fallbacks', async () => {
    await preparePage(page, '/physics/field.html?id=fluids', 'zh-CN');
    await expect(page.locator('#fieldMedia')).toHaveAttribute('data-kind', 'diagram');
    await expect(page.locator('#fieldVisualHost svg')).toHaveCount(1);
    await expect(page.locator('#claimReferenceLedger .claim-card')).toHaveCount(2);
    await setRange(page.locator('#fieldVisualHost input[type="range"]').first(), '4000');
    const equation = await page.evaluate(() => {
      const guide = PhysicsFieldGuides.fluids;
      const tex = guide.tex;
      delete guide.tex;
      document.dispatchEvent(new Event('physics-language'));
      const text = document.getElementById('fieldEquation').textContent;
      guide.tex = tex;
      document.dispatchEvent(new Event('physics-language'));
      return { expected: guide.equation, text };
    });
    expect(equation.text).toBe(equation.expected);
    const enrichmentFallback = await page.evaluate(() => {
      const renderer = globalThis.renderPhysicsFieldEnrichment;
      document.getElementById('fieldVisualHost').innerHTML = '';
      delete globalThis.renderPhysicsFieldEnrichment;
      document.dispatchEvent(new Event('physics-language'));
      const hasVisual = !!document.querySelector('#fieldVisualHost .field-visual-card');
      globalThis.renderPhysicsFieldEnrichment = renderer;
      document.dispatchEvent(new Event('physics-language'));
      return hasVisual;
    });
    expect(enrichmentFallback).toBe(false);
  });
});

for (const [id, path] of [
  ['astro', '/physics/astrophysics.html'],
  ['light', '/physics/electrodynamics.html'],
  ['phase', '/physics/phase-transitions.html'],
  ['entropy', '/physics/entropy-information.html']
]) {
  test(`physics ${id} instrument lifecycle coverage`, async ({ page }) => {
    await collectCoverage(page, `physics-${id}-lifecycle`, async () => {
      await preparePage(page, path, 'en');
      await page.waitForTimeout(500);
      // Pausing twice exercises both the guarded early return and the restart.
      await page.locator('.motion-toggle').click();
      await page.locator('.motion-toggle').click();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.locator('[data-lang="zh-CN"]').click();
      await page.setViewportSize({ width: 900, height: 800 });
      await page.waitForTimeout(200);
      await page.locator('[data-lang="en"]').click();
    });
  });

  test(`physics ${id} reduced-motion start coverage`, async ({ page }) => {
    await collectCoverage(page, `physics-${id}-reduced-motion`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await preparePage(page, path, 'en');
      await page.waitForTimeout(300);
      // Hidden-document handling must also work while motion is already paused.
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.locator('.motion-toggle').click();
      await page.waitForTimeout(200);
    });
  });
}

test('physics astro helper fallback coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-astro-helper-fallbacks', async () => {
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    await page.addInitScript(() => {
      window.__enableAstroTestHooks = true;
    });
    await page.goto('/physics/astrophysics.html');
    await page.waitForLoadState('load');
    await page.waitForTimeout(300);
    const result = await page.evaluate(() => {
      const hooks = window.__astroTestHooks;
      const fallbackPalette = hooks.readPalette({ getPropertyValue: () => '   ' });
      const missingScene = hooks.setup('missing-canvas-id', () => {});

      const readout = document.getElementById('collapseReadout');
      const parent = readout.parentNode;
      const sibling = readout.nextSibling;
      readout.remove();
      hooks.renderCollapseReadout();
      if (sibling) parent.insertBefore(readout, sibling);
      else parent.appendChild(readout);

      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 0 });
      const resized = hooks.resizeById('collapseCanvas');
      const missingResize = hooks.resizeById('missing-canvas-id');
      hooks.handleResizeEntries([{ target: document.body }]);
      const whiteDwarfRadius = hooks.whiteDwarfRadiusKm(1.44);
      const fallbackSpec = hooks.compactSpec('mystery-mode');
      const fallbackMode = hooks.normalizeCompactMode('mystery-mode');
      const englishSnapshot = hooks.limitSnapshot(1.3);
      const englishWhiteDwarf = hooks.compactDetailSnapshot('white-dwarf', 1.45);
      const englishNeutronStar = hooks.compactDetailSnapshot('neutron-star', 2.4);
      const englishWhiteDwarfThreshold = hooks.compactThresholdMarker('white-dwarf', 1.45);
      const englishNeutronThreshold = hooks.compactThresholdMarker('neutron-star', 2.4);
      const fallbackThresholdX = hooks.compactThresholdX(17, null, mass => mass * 2);
      const projectedThresholdX = hooks.compactThresholdX(17, englishWhiteDwarfThreshold, mass => mass * 2);
      const compactButtons = [...document.querySelectorAll('[data-compact-mode]')];
      for (const button of compactButtons) button.setAttribute('aria-pressed', 'false');
      const noPressedMode = hooks.selectedCompactMode();
      compactButtons[0].setAttribute('aria-pressed', 'true');
      document.querySelector('[data-lang="zh-CN"]').click();
      const chineseSnapshot = hooks.limitSnapshot(1.3);
      const chineseWhiteDwarf = hooks.compactDetailSnapshot('white-dwarf', 1.45);
      const chineseNeutronStar = hooks.compactDetailSnapshot('neutron-star', 2.4);
      const chineseWhiteDwarfThreshold = hooks.compactThresholdMarker('white-dwarf', 1.45);
      const chineseNeutronThreshold = hooks.compactThresholdMarker('neutron-star', 2.4);
      hooks.drawCompactForTest('white-dwarf', 1.45);
      hooks.drawCompactForTest('neutron-star', 2.4);
      hooks.drawCompactThresholdForTest('white-dwarf', 1.45);
      hooks.drawCompactThresholdForTest('neutron-star', 2.4);

      return {
        chineseBridge: chineseSnapshot.bridge,
        chineseNeutronKnown: chineseNeutronStar.known,
        chineseNeutronThreshold: chineseNeutronThreshold.label,
        chineseWhiteDwarfThreshold: chineseWhiteDwarfThreshold.label,
        chineseWhiteDwarfRadius: chineseWhiteDwarf.radius,
        englishBridge: englishSnapshot.bridge,
        englishNeutronKnown: englishNeutronStar.known,
        englishNeutronThreshold: englishNeutronThreshold.label,
        englishWhiteDwarfThreshold: englishWhiteDwarfThreshold.label,
        englishWhiteDwarfRadius: englishWhiteDwarf.radius,
        fallbackThresholdX,
        fallbackMode,
        fallbackPalette,
        fallbackSpec,
        missingScene,
        missingResize,
        noPressedMode,
        projectedThresholdX,
        resized,
        whiteDwarfRadius
      };
    });

    expect(result.fallbackPalette).toEqual({
      paper: '#eef2ff',
      muted: '#aeb8d8',
      gold: '#ffd166',
      green: '#7ee8c5',
      cyan: '#00d4ff',
      pink: '#ff6b9d',
      violet: '#7c5cff',
      deep: '#090d1d'
    });
    expect(result.missingScene).toBeNull();
    expect(result.resized).toBe(true);
    expect(result.missingResize).toBe(false);
    expect(result.whiteDwarfRadius).toBe(0);
    expect(result.fallbackSpec.min).toBe(0.45);
    expect(result.fallbackMode).toBe('white-dwarf');
    expect(result.fallbackThresholdX).toBe(17);
    expect(result.noPressedMode).toBe('white-dwarf');
    expect(result.projectedThresholdX).toBeCloseTo(2.84, 6);
    expect(result.englishBridge).toContain('Chandrasekhar mass');
    expect(result.chineseBridge).toContain('钱德拉塞卡极限');
    expect(result.englishWhiteDwarfThreshold).toBe('electron support ends here');
    expect(result.chineseWhiteDwarfThreshold).toBe('电子支撑到此为止');
    expect(result.englishWhiteDwarfRadius).toContain('no stable cold white-dwarf radius');
    expect(result.chineseWhiteDwarfRadius).toContain('没有稳定的冷白矮星半径');
    expect(result.englishNeutronThreshold).toBe('likely collapse-threshold zone');
    expect(result.chineseNeutronThreshold).toBe('可能的塌缩阈值区');
    expect(result.englishNeutronKnown).toContain('thermal support or rotation can only delay it temporarily');
    expect(result.chineseNeutronKnown).toContain('热支撑或自转只能暂时推迟塌缩');
  });
});

test('physics reference renderer fallback and failure coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-reference-branches', async () => {
    await preparePage(page, '/physics/entropy-information.html', 'en');
    const result = await page.evaluate(() => {
      renderPhysicsReferences('thermodynamics', null);
      const host = document.createElement('div');
      host.dataset.referenceKey = 'thermodynamics';
      renderPhysicsReferences(undefined, host);
      let error = '';
      try {
        renderPhysicsReferences('not-a-reference-set', host);
      } catch (caught) {
        error = caught.message;
      }
      host.dataset.referenceKey = 'not-a-dataset-reference-set';
      let datasetError = '';
      try {
        renderPhysicsReferences(undefined, host);
      } catch (caught) {
        datasetError = caught.message;
      }
      return { count: host.children.length, datasetError, error };
    });
    expect(result.count).toBeGreaterThanOrEqual(2);
    expect(result.error).toContain('Missing official references');
    expect(result.datasetError).toContain('Missing official references');
  });
});

/* Every field guide renders from the same shell, so walking all of them covers
   the branches for fields with and without listed ancestors or descendants. */
test('physics every field guide renders coverage', async ({ page }) => {
  test.slow();
  await collectCoverage(page, 'physics-all-field-guides', async () => {
    await preparePage(page, '/physics/', 'en');
    const ids = await page.evaluate(() => PhysicsFieldList
      .filter(field => field.page.includes('field.html'))
      .map(field => field.page.split('=')[1]));
    for (const id of ids) {
      await page.goto(`/physics/field.html?id=${id}`, { waitUntil: 'load' });
      await expect(page.locator('#fieldName')).not.toHaveText('');
      await expect(page.locator('#questionGrid .field-question-card')).toHaveCount(2);
      await expect(page.locator('#scaleGrid .field-scale-card')).toHaveCount(3);
      await expect(page.locator('#fieldVisualHost svg')).toHaveCount(1);
      await expect(page.locator('#fieldMythFrontier .field-limit-card')).toHaveCount(2);
      await expect(page.locator('#claimReferenceLedger .claim-card')).toHaveCount(2);
    }
    // An unknown id must fall back rather than render an empty guide.
    await page.goto('/physics/field.html?id=not-a-field', { waitUntil: 'load' });
    await expect(page.locator('#fieldName')).not.toHaveText('');
    await page.locator('[data-lang="zh-CN"]').click();
    await page.locator('[data-lang="en"]').click();
  });
});

test('physics field-enrichment alternate branches and language persistence coverage', async ({ page }) => {
  test.slow();
  await collectCoverage(page, 'physics-field-enrichment-branches', async () => {
    await preparePage(page, '/physics/', 'en');
    for (const [fieldId, scenarios] of Object.entries(fieldVisualScenarios)) {
      await page.goto(`/physics/field.html?id=${fieldId}`, { waitUntil: 'load' });
      await expect(page.locator('#fieldVisualHost .field-visual-card')).toBeVisible();
      for (const scenario of scenarios) {
        const state = await expectVisualScenario(page, fieldId, scenario);
        await page.locator('[data-lang="zh-CN"]').click();
        await expect(page.locator('#fieldVisualHost .field-visual-card')).toBeVisible();
        expect(await readFieldVisualState(page)).toEqual(state);
        await page.locator('[data-lang="en"]').click();
        await expect(page.locator('#fieldVisualHost .field-visual-card')).toBeVisible();
      }
    }
    await page.evaluate(() => renderPhysicsFieldEnrichment({
      fieldId: 'not-a-field',
      field: PhysicsFieldList.find(candidate => candidate.id === 'thermodynamics')
    }));
    const edgeCases = await page.evaluate(() => {
      const messages = {};
      const renderFor = fieldId => renderPhysicsFieldEnrichment({
        fieldId,
        field: PhysicsFieldList.find(candidate => candidate.id === fieldId),
        guide: PhysicsFieldGuides[fieldId]
      });
      const standardModel = PhysicsFieldEnrichments['standard-model'];
      const nonlinear = PhysicsFieldEnrichments.nonlinear;
      const thermodynamics = PhysicsFieldEnrichments.thermodynamics;
      const originalStandardControls = standardModel.visual.controls;
      const originalStandardSources = standardModel.visual.sources;
      const originalStandardType = standardModel.visual.type;
      const originalFormatter = nonlinear.visual.controls[0].formatter;
      const originalClaimSources = [...thermodynamics.claims[0].sources];
      const originalSecondClaimSources = thermodynamics.claims[1].sources;
      const originalExperimentSources = thermodynamics.experiment.sources;
      standardModel.visual.controls = undefined;
      renderFor('standard-model');
      messages.noControls = document.querySelectorAll('#fieldVisualHost .field-control-group').length;
      standardModel.visual.sources = undefined;
      renderFor('standard-model');
      messages.noVisualSources = document.querySelectorAll('#fieldVisualHost .field-visual-sources .field-source-item').length;
      delete nonlinear.visual.controls[0].formatter;
      renderFor('nonlinear');
      messages.defaultFormatter = document.querySelector('#fieldVisualHost output')?.textContent || '';
      standardModel.visual.type = 'missing-visual';
      try {
        renderFor('standard-model');
      } catch (error) {
        messages.missingRenderer = error.message;
      }
      thermodynamics.claims[0].sources = ['missing-source'];
      try {
        renderFor('thermodynamics');
      } catch (error) {
        messages.missingSource = error.message;
      }
      thermodynamics.claims[0].sources = originalClaimSources;
      thermodynamics.claims[1].sources = undefined;
      renderFor('thermodynamics');
      messages.noClaimSources = document.querySelectorAll('#claimReferenceLedger .claim-card')[1]
        ?.querySelectorAll('.claim-source-list .field-source-item').length ?? -1;
      thermodynamics.experiment.sources = undefined;
      renderFor('thermodynamics');
      messages.noExperimentSources = document.querySelectorAll('#fieldExperiment .claim-source-list .field-source-item').length;
      standardModel.visual.controls = originalStandardControls;
      standardModel.visual.sources = originalStandardSources;
      standardModel.visual.type = originalStandardType;
      nonlinear.visual.controls[0].formatter = originalFormatter;
      thermodynamics.claims[1].sources = originalSecondClaimSources;
      thermodynamics.experiment.sources = originalExperimentSources;
      return messages;
    });
    expect(edgeCases).toEqual({
      noControls: 0,
      noVisualSources: 0,
      defaultFormatter: '3.2',
      missingRenderer: 'Missing field visual renderer missing-visual',
      missingSource: 'Missing field-enrichment source missing-source',
      noClaimSources: 0,
      noExperimentSources: 0
    });
  });
});

test('physics reduced-motion preference coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-reduced-motion', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await preparePage(page, '/physics/relativity.html', 'en');
    await page.locator('#labToggle').click();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(300);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(300);
    await page.locator('.motion-toggle').click();
    await page.waitForTimeout(300);
  });
});

test('physics relativity deepening coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-relativity-deepening', async () => {
    await preparePage(page, '/physics/relativity.html', 'en');

    await page.evaluate(() => {
      const debug = window.__relativityDebug;
      [1e9, 5e5, 5, 0.5, 5e-4, 1e-6].forEach(value => debug.formatEnergyMeV(value));
      [1e9, 5e5, 500].forEach(value => debug.formatMomentumMeV(value));
    });

    await page.locator('[data-preset-particle="electron"][data-preset-mev="-5"]').click();
    await page.locator('[data-preset-particle="electron"][data-preset-mev="-0.523"]').click();
    await page.locator('[data-preset-particle="electron"][data-preset-mev="0.30103"]').click();
    await page.locator('[data-particle="proton"]').click();
    await page.locator('[data-preset-particle="proton"][data-preset-mev="0"]').click();
    await page.locator('[data-preset-particle="proton"][data-preset-mev="3"]').click();
    await page.locator('[data-preset-particle="proton"][data-preset-mev="6.845098"]').click();
    await page.evaluate(() => {
      document.querySelectorAll('.topic-index a[href^="#"]').forEach(anchor => anchor.focus());
    });
    await page.evaluate(() => window.__relativityDebug.setParticle('muon'));
    await setRange(page.locator('#energySlider'), -1);
    await page.evaluate(() => {
      const debug = window.__relativityDebug;
      const slider = document.getElementById('energySlider');
      const render = (particle, logEnergy) => {
        debug.setParticle(particle);
        slider.value = String(logEnergy);
        debug.renderEnergy();
      };
      render('electron', -5);
      render('electron', -2);
      render('electron', -0.523);
      render('electron', 0.30103);
      render('proton', 0);
    });

    await setRange(page.locator('#jetBetaControl'), 0.7);
    await setRange(page.locator('#jetAngleControl'), 60);
    await setRange(page.locator('#jetBetaControl'), 0.995);
    await setRange(page.locator('#jetAngleControl'), 1);
    await setRange(page.locator('#jetAngleControl'), 15);

    await page.locator('[data-lang="zh-CN"]').click();
    await setRange(page.locator('#jetBetaControl'), 0.7);
    await setRange(page.locator('#jetAngleControl'), 60);
    await page.evaluate(() => {
      const debug = window.__relativityDebug;
      const slider = document.getElementById('energySlider');
      debug.setParticle('proton');
      slider.value = '0';
      debug.renderEnergy();
      debug.setParticle('electron');
      slider.value = '-2';
      debug.renderEnergy();
      slider.value = '-0.523';
      debug.renderEnergy();
      slider.value = '0.30103';
      debug.renderEnergy();
      debug.renderJetGeometry();
    });
    await page.locator('[data-lang="en"]').click();

    await page.evaluate(() => {
      window.__relativityDebug.renderEnergy();
      window.__relativityDebug.renderJetGeometry();
      window.__relativityDebug.stopLoop();
      window.__relativityDebug.stopLoop();
    });
    await page.locator('.motion-toggle').click();
    await page.evaluate(() => window.__relativityDebug.startLoop());
    await page.locator('.motion-toggle').click();
    await page.evaluate(() => {
      window.__relativityDebug.startLoop();
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });
});

test('physics relativity helper fallback coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-relativity-helper-fallback', async () => {
    await preparePage(page, '/physics/newtonian.html', 'en');
    await page.evaluate(() => {
      window.__physicsLabsDebug.updateRelativityGeometry(0.5, 1.1547);
    });
  });
});

test('physics relativity deepening bootstrap branches coverage', async ({ page }) => {
  await collectCoverage(page, 'physics-relativity-deepening-bootstrap', async () => {
    await page.goto('/__health');
    await page.setContent('<!doctype html><body data-topic="quantum"></body>');
    await page.addScriptTag({ url: '/physics/relativity-deepening.js' });

    await page.addInitScript(() => {
      window.__relativityDebug = { seeded: true };
    });
    await preparePage(page, '/physics/relativity.html', 'en');
  });
});

test('big-bang browser lifecycle coverage', async ({ page }) => {
  await collectCoverage(page, 'big-bang-lifecycle', async () => {
    await preparePage(page, '/big-bang/', 'en');
    await page.evaluate(() => {
      // Cover the resize branch while the time-machine tab is inactive.
      window.dispatchEvent(new Event('resize'));
    });
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
          // Real IntersectionObserver delivers entries in a later task, never
          // synchronously inside observe().
          queueMicrotask(() => this.callback([{ target, isIntersecting: false }]));
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
      const image=document.createElement('img');
      image.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      image.dataset.i18nAlt='missing.alt';
      document.body.appendChild(image);
      const labelled=document.createElement('div');
      labelled.dataset.i18nAriaLabel='missing.aria';
      document.body.appendChild(labelled);
      applyLang('en');
    });
    await page.locator('#motionToggle').click();
    await page.locator('#motionToggle').click();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.emulateMedia({reducedMotion:'no-preference'});

    await preparePage(page, '/big-bang/', 'en');
    await page.evaluate(() => {
      fmtTime(1);
    });
    await page.goto('/big-bang/?tab=machine');
    await page.waitForLoadState('load');
    await page.goto('/big-bang/?tab=missing');
    await page.waitForLoadState('load');
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
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-i18n-alt="missing.alt">
        <div data-i18n-aria-label="missing.aria"></div>
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
      await page.evaluate(() => {
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        __D1.play();
        __F2.toggle();
        __F2.startPlay();
        __F2.toggle();
      });
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

test('periodic-table mobile sheet boundary coverage', async ({ page }) => {
  await collectCoverage(page, 'periodic-mobile-sheet-boundaries', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page, '/periodic-table/', 'en');
    await page.locator('.cell[data-z="1"]').click();
    await page.evaluate(() => stepElement(-1));
    await page.evaluate(() => stepElement(1));
    await page.evaluate(() => {
      document.querySelector('.cell[data-z="3"]').remove();
      stepElement(1);
    });
    await page.evaluate(() => openDetail(4));
    await page.waitForTimeout(50);
    await page.evaluate(() => {
      document.getElementById('detailPrev').remove();
      document.getElementById('detailNext').remove();
      syncStepControls();
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
      await page.addInitScript(installSpeechVoices, 30);
      await preparePage(page, '/periodic-table/', 'en');
      await page.evaluate(() => {
        const rowSpeakers = [...document.querySelectorAll('.row-speak')];
        rowSpeakers[1].click();
        // Interrupt before the first queued element begins, so the earlier
        // sequence exits through the superseded-at-loop-start branch.
        setTimeout(() => rowSpeakers[2].click(), 20);
        // Then interrupt while the replacement sequence is speaking its first
        // element, covering the post-speak supersession branch.
        setTimeout(() => rowSpeakers[3].click(), 90);
      });
      await page.waitForTimeout(260);
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

  test('periodic-table branch completion coverage', async ({ page }) => {
    await collectCoverage(page, 'periodic-branch-completion', async () => {
      await page.addInitScript(installSpeechVoices, 80);
      await page.addInitScript(() => {
        const nativeSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay, ...args) =>
          nativeSetTimeout(callback, Math.min(delay, 20), ...args);
      });
      await preparePage(page, '/periodic-table/', 'zh-CN');
      await page.evaluate(() => {
        window.__B1.open();
        window.__B1.close();
        // Cover the nuclide resize guard after the panel exists but is not active.
        window.dispatchEvent(new Event('resize'));
      });
      await page.locator('.pt-frow .row-speak').first().click();
      await page.waitForTimeout(80);
      await page.locator('#tlToggleBtn').click();
      await page.locator('#tlPlay').click();
      await page.locator('.lang-pill[data-lang="en"]').click();
      await page.waitForTimeout(80);
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

test('periodic-table reaction effects and deep-link coverage', async ({ page }) => {
  await collectCoverage(page,'periodic-effects-routes',async ()=>{
    await preparePage(page,'/periodic-table/?element=3&overlay=origin','en');
    await page.evaluate(()=>{
      const nativeSetTimeout=window.setTimeout;
      let replay=null;
      window.setTimeout=(callback,delay,...args)=>{
        if(delay===1500){
          replay=()=>callback(...args);
          return 1;
        }
        return nativeSetTimeout(callback,delay,...args);
      };
      const reaction={
        eq:'2CO + O₂ → 2CO₂',
        effects:{gas:true,precipitate:true,heat:true,light:true,deposition:true}
      };
      animateReaction(reaction);
      const replayCanvas=document.getElementById('rxAnimCanvas');
      const advance=progress=>{
        if(rxRAF!=null) cancelAnimationFrame(rxRAF);
        rxRAF=null;
        PT_REACTION_DEBUG.advanceTo(progress);
        if(rxRAF!=null) cancelAnimationFrame(rxRAF);
        rxRAF=null;
      };
      for(const progress of [0.1,0.4,0.55,0.65,0.75,0.9]) advance(progress);
      animationResumeVersion++;
      advance(0.5);
      advance(1);

      animateReaction({
        eq:'2H₂ + O₂ → 2H₂O',
        effects:{
          gas:true,precipitate:true,heat:true,light:true,deposition:true,
          lightColor:'#ffffff',precipitateColor:'#eeeeee',depositionColor:'#dddddd'
        }
      });
      advance(0.7);
      applyI18n('zh-CN');
      advance(0.7);
      advance(0.9);
      animationVisibility.set(replayCanvas,false);
      replay?.();
      const replayFrame=pausedAnimationFrames.get(replayCanvas);
      replayFrame?.();
      pausedAnimationFrames.delete(replayCanvas);
      window.setTimeout=nativeSetTimeout;

      render3DViewers([{eq:'X( → X('}],'X');
    });
    await page.waitForTimeout(50);
    await page.evaluate(()=>{
      if(rxRAF!=null) cancelAnimationFrame(rxRAF);
      rxRAF=null;
      clearTimeout(rxReplayTimer);
    });
    await page.goto('/periodic-table/?element=999&overlay=missing');
    await page.waitForLoadState('load');
    await page.waitForTimeout(250);
  });
});

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
            const result = fn(...args);
            // Async boundary failures reject instead of throwing; settle them the same way.
            if (result && typeof result.then === 'function') result.then(() => {}, () => {});
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
          // A denied origin refuses every key the app boots from.
          if (key === 'pz-lang' || key === 'pz-motion') {
            throw new DOMException('Storage unavailable', 'SecurityError');
          }
          return nativeGetItem.call(this, key);
        };
      });
      await page.goto('/particle-zoo/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
      // Booting without readable storage still lands on the system motion mode.
      expect(await page.locator('#motionToggle').getAttribute('data-state')).toBe('playing');
      await page.evaluate(() => {
        Storage.prototype.setItem = () => {
          throw new DOMException('Storage unavailable', 'QuotaExceededError');
        };
        Storage.prototype.removeItem = () => {
          throw new DOMException('Storage unavailable', 'SecurityError');
        };
      });
      await page.locator('.lang-pill[data-lang="zh-CN"]').click();
      // Toggling still works when the preference cannot be written back.
      await page.locator('#motionToggle').click();
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
      await page.locator('#motionToggle').click();
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
    });
  });

  for (const [id, requested, stored, expectedState] of [
    ['play', 'play', 'pause', 'playing'],
    ['pause', 'pause', null, 'paused'],
    ['system', 'system', 'pause', 'playing'],
    ['invalid', 'sideways', 'pause', 'paused']
  ]) {
    test(`particle-zoo motion query ${id} coverage`, async ({ page }) => {
      await collectCoverage(page, `particle-motion-query-${id}`, async () => {
        await installDeterminism(page);
        await setLanguage(page, 'en');
        await blockExternalAssets(page);
        await page.addInitScript(saved => {
          try {
            if (saved) localStorage.setItem('pz-motion', saved);
            else localStorage.removeItem('pz-motion');
          } catch {
            // Opaque origins deny storage; the navigated document seeds it again.
          }
        }, stored);
        await page.goto(`/particle-zoo/?motion=${requested}`);
        await page.waitForLoadState('load');
        await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', expectedState);
        // An accepted override is persisted for the next visit; 'system' clears it.
        expect(await page.evaluate(() => localStorage.getItem('pz-motion')))
          .toBe(requested === 'system' ? null : (['play', 'pause'].includes(requested) ? requested : stored));
        expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe(expectedState);
        await page.locator('.tab[data-tab="lab"]').click();
        await page.locator('#detCanvas').scrollIntoViewIfNeeded();
        await page.waitForTimeout(220);
        const frames = await page.evaluate(() => window.PZ_PERF.snapshot().frames.lab);
        await page.waitForTimeout(260);
        const advanced = await page.evaluate(() => window.PZ_PERF.snapshot().frames.lab);
        if (expectedState === 'playing') expect(advanced).toBeGreaterThan(frames);
        else expect(advanced).toBe(frames);
      });
    });
  }

  test('particle-zoo persisted motion pause coverage', async ({ page }) => {
    await collectCoverage(page, 'particle-motion-persisted', async () => {
      await installDeterminism(page);
      await setLanguage(page, 'zh-CN');
      await blockExternalAssets(page);
      await page.addInitScript(() => {
        try {
          localStorage.setItem('pz-motion', 'pause');
        } catch {
          // Opaque origins deny storage; the navigated document seeds it again.
        }
      });
      await page.goto('/particle-zoo/');
      await page.waitForLoadState('load');
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
      await expect(page.locator('#motionToggle')).toContainText('播放动画');
      expect(await page.locator('#motionToggle').getAttribute('title')).toBe('');
      // The forces tab renders its interaction tiles statically while paused.
      await page.locator('.tab[data-tab="forces"]').click();
      await expect(page.locator('.ix-card svg').first()).toBeVisible();
      const paintedFrames = await page.evaluate(() => window.PZ_PERF.snapshot().frames.interactions);
      await page.waitForTimeout(260);
      expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.interactions)).toBe(paintedFrames);
      // Releasing the stored preference falls back to the system setting.
      await page.locator('#motionToggle').click();
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
      expect(await page.evaluate(() => localStorage.getItem('pz-motion'))).toBe('play');
    });
  });

  test('particle-zoo system motion follows the platform coverage', async ({ page }) => {
    await collectCoverage(page, 'particle-motion-system', async () => {
      await installDeterminism(page);
      await setLanguage(page, 'zh-CN');
      await blockExternalAssets(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/particle-zoo/?motion=system');
      await page.waitForLoadState('load');
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
      expect(await page.locator('#motionToggle').getAttribute('title'))
        .toBe('系统的“减少动态效果”设置已暂停动画。可用此按钮覆盖该设置。');
      await page.locator('.lang-pill[data-lang="en"]').click();
      expect(await page.locator('#motionToggle').getAttribute('title'))
        .toBe('Your system reduced-motion preference is pausing animations. Use this button to override it.');
      // The platform preference alone drives the control while the mode is 'system'.
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
      expect(await page.locator('#motionToggle').getAttribute('title')).toBe('');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
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
            // Real IntersectionObserver delivers entries in a later task, never
            // synchronously inside observe().
            queueMicrotask(() => this.callback([{ target, isIntersecting: false }]));
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

test('particle-zoo staged rendering coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-staged-rendering', async () => {
    await page.addInitScript(installTimerPump);
    await preparePage(page, '/particle-zoo/', 'en');

    const readState = () => page.evaluate(stagedRenderState);
    const pump = () => page.evaluate(() => {
      const before = document.querySelectorAll('.render-pending').length;
      window.__pumpTimer();
      return { before, after: document.querySelectorAll('.render-pending').length };
    });

    // 1. The boot panel is staged: the first chunk paints, the rest wait.
    const boot = await readState();
    expect(boot.pending, 'the chart panel is staged at boot').toBeGreaterThan(0);
    expect(boot.queues.chart, 'the chart queue holds the remaining chunks').toBe(boot.pending);
    expect(boot.staged).not.toContain('chart');
    await expect(page.locator('#tab-chart .render-pending').first()).toHaveClass(/render-pending/);

    // 2. Exactly one chunk is revealed per timer task.
    let steps = 0;
    while ((await readState()).queues.chart) {
      const { before, after } = await pump();
      expect(after, 'each timer task reveals exactly one chunk').toBe(before - 1);
      steps++;
    }
    expect(steps, 'the boot panel needed several chunk tasks').toBeGreaterThan(0);
    const afterChart = await readState();
    expect(afterChart.pending).toBe(0);
    expect(afterChart.staged).toContain('chart');

    // 3. First activation stages the newly shown panel.
    await page.locator('.tab[data-tab="forces"]').click();
    const activated = await readState();
    expect(activated.queues.forces, 'activating a cold panel stages it').toBeGreaterThan(0);
    await pump();

    // 4. Re-clicking the active tab is a no-op for the queue.
    const beforeReclick = await readState();
    await page.locator('.tab[data-tab="forces"]').click();
    const afterReclick = await readState();
    expect(afterReclick.queues.forces, 'an active-tab reclick neither restarts nor duplicates the queue')
      .toBe(beforeReclick.queues.forces);
    expect(afterReclick.tasks, 'no extra chunk task is scheduled').toBe(beforeReclick.tasks);

    // 5. Switching away mid-queue preserves the remaining chunks.
    const beforeSwitch = await readState();
    await page.locator('.tab[data-tab="bsm"]').click();
    for (let index = 0; index < 3; index++) await pump();
    const parked = await readState();
    expect(parked.queues.forces, 'the hidden panel keeps its remaining queue').toBe(beforeSwitch.queues.forces);
    expect(await page.locator('#tab-forces .render-pending').count()).toBe(beforeSwitch.queues.forces);

    // 6. Returning resumes the queue and completes it.
    await page.locator('.tab[data-tab="forces"]').click();
    let guard = 0;
    while ((await readState()).queues.forces && guard++ < 200) await pump();
    const finished = await readState();
    expect(finished.queues.forces, 'the resumed queue drains').toBeUndefined();
    expect(finished.staged, 'the panel is marked staged once complete').toContain('forces');
    await expect(page.locator('#tab-forces .render-pending')).toHaveCount(0);

    // 7. A reduced-motion change flushes whatever is still pending.
    await page.locator('.tab[data-tab="phenomena"]').click();
    const staging = await readState();
    expect(staging.queues.phenomena, 'the phenomena panel stages on first view').toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(120);
    const flushed = await readState();
    expect(flushed.pending, 'reduced motion reveals every pending chunk').toBe(0);
    expect(Object.keys(flushed.queues), 'reduced motion clears the queues').toEqual([]);
    expect(flushed.staged).toContain('phenomena');
    // Reduced motion also short-circuits staging for panels opened afterwards.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.tab[data-tab="lab"]').click();
    await expect(page.locator('.render-pending')).toHaveCount(0);
  });
});

test('particle-zoo fermion, packing, and deep-link coverage', async ({ page }) => {
  await collectCoverage(page,'particle-builder-routes',async ()=>{
    await preparePage(page,'/particle-zoo/?tab=builder&preset=helium4','en');
    await page.waitForTimeout(350);
    await page.locator('.packing-choice.unstable').first().dispatchEvent('click');
    const positron=page.locator('.tray-part[data-part="eplus"]');
    await positron.dispatchEvent('keydown',{key:'Escape'});
    await positron.dispatchEvent('keydown',{key:'Enter'});
    await positron.dispatchEvent('keydown',{key:' '});
    await page.evaluate(()=>{
      parts=['t','tbar','eplus'];
      resizeBuild();
      buildComposites();
      drawBuild();
      parts=['u','u','d','eplus'];
      buildComposites();
      drawBuild();

      const saved=MESON_TABLE['u|dbar'];
      delete MESON_TABLE['u|dbar'];
      parts=['u','dbar'];
      buildComposites();
      MESON_TABLE['u|dbar']=saved;

      const plans=[
        {key:'free',protons:0,neutrons:0,deltaPlus:0,deltaMinus:0,freeUp:1,freeDown:1,freeCount:2,deltaCount:0},
        {key:'delta',protons:0,neutrons:0,deltaPlus:1,deltaMinus:1,freeUp:0,freeDown:0,freeCount:2,deltaCount:2},
        {key:'third',protons:1,neutrons:0,deltaPlus:0,deltaMinus:0,freeUp:0,freeDown:0,freeCount:2,deltaCount:0},
        {key:'fourth',protons:0,neutrons:1,deltaPlus:0,deltaMinus:0,freeUp:0,freeDown:0,freeCount:2,deltaCount:0},
        {key:'fifth',protons:0,neutrons:0,deltaPlus:0,deltaMinus:0,freeUp:0,freeDown:0,freeCount:2,deltaCount:0}
      ];
      renderPackingChoices(plans,plans[4]);
      document.querySelector('.packing-choice')?.click();
      renderPackingChoices([
        {...plans[4],key:'empty-a',freeCount:0},
        {...plans[4],key:'empty-b',freeCount:0}
      ],{...plans[4],key:'empty-a',freeCount:0});
    });

    await page.goto('/particle-zoo/?tab=lab&demo=detector');
    await page.waitForLoadState('load');
    await page.waitForTimeout(350);
    await page.goto('/particle-zoo/?tab=missing&demo=missing&preset=missing');
    await page.waitForLoadState('load');
    await page.waitForTimeout(100);
  });
});

test('particle-zoo boot fallback coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-boot-fallback', async () => {
    await installDeterminism(page);
    await setLanguage(page, 'en');
    await blockExternalAssets(page);
    // A genuinely stalled application script: the inline boot fallback is the
    // only thing that can reveal the first panel.
    let releaseApp;
    const appGate = new Promise(resolve => { releaseApp = resolve; });
    await page.route('**/particle-zoo/app.js', async route => {
      await appGate;
      await route.continue();
    });
    await page.goto('/particle-zoo/', { waitUntil: 'commit' });
    await page.waitForSelector('#tab-chart .sm-grid', { state: 'attached' });

    const stalled = await page.evaluate(() => ({
      booting: document.body.classList.contains('render-booting'),
      visibility: getComputedStyle(document.querySelector('#tab-chart .sm-grid')).contentVisibility,
      appLoaded: typeof window.PZ_PERF !== 'undefined'
    }));
    expect(stalled.appLoaded, 'the application script is still stalled').toBe(false);
    expect(stalled.booting, 'the boot class hides the cold panel').toBe(true);
    expect(stalled.visibility).toBe('hidden');

    await expect
      .poll(() => page.evaluate(() => document.body.classList.contains('render-booting')), { timeout: 4_000 })
      .toBe(false);
    const revealed = await page.evaluate(() => ({
      visibility: getComputedStyle(document.querySelector('#tab-chart .sm-grid')).contentVisibility,
      appLoaded: typeof window.PZ_PERF !== 'undefined'
    }));
    expect(revealed.visibility, 'the 2 s fallback reveals the panel without the app').toBe('visible');
    expect(revealed.appLoaded, 'the fallback fired before the script finished').toBe(false);
    releaseApp();
    await page.waitForLoadState('load');
  });
});

test('particle-zoo collapsed-panel and lifecycle coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-collapsed-lifecycle', async () => {
    await preparePage(page, '/particle-zoo/', 'en');
    // Canvas sizing runs while the owning panel is collapsed and has no box.
    await page.evaluate(() => {
      resizeBuild();
      resizeCanvas();
    });

    // Two annihilation pairs sharing one encounter: the second positron finds
    // its partner already consumed, so exactly one particle is left behind.
    await page.locator('.tab[data-tab="playground"]').click();
    await page.locator('#pgClear').click();
    // A like-charged overlap first: the pair test has to look at both orderings
    // before deciding that nothing annihilates.
    await page.evaluate(() => {
      spawn('electron');
      spawn('electron');
      pgParts.forEach((particle, index) => {
        particle.x = 140 + index * 2;
        particle.y = 120;
        particle.vx = 0;
        particle.vy = 0;
      });
    });
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => pgParts.filter(p => p.type === 'electron').length),
      'like charges overlap without annihilating').toBe(2);
    // An electron-first encounter annihilates on the first ordering.
    await page.locator('#pgClear').click();
    await page.evaluate(() => {
      spawn('electron');
      spawn('positron');
      pgParts.forEach((particle, index) => {
        particle.x = 140 + index * 2;
        particle.y = 120;
        particle.vx = 0;
        particle.vy = 0;
      });
    });
    await expect.poll(() => page.evaluate(() => pgParts.filter(p => p.type !== 'photon').length), { timeout: 10_000 })
      .toBe(0);
    await page.locator('#pgClear').click();
    await page.evaluate(() => {
      for (let index = 0; index < 2; index++) {
        spawn('positron');
        spawn('electron');
      }
      pgParts.forEach((particle, index) => {
        particle.x = 140 + index * 2;
        particle.y = 120;
        particle.vx = 0;
        particle.vy = 0;
      });
    });
    await expect.poll(() => page.evaluate(() => pgParts.filter(p => p.type !== 'photon').length), { timeout: 10_000 })
      .toBe(1);
    expect(await page.evaluate(() => pgParts.filter(p => p.type === 'photon').length))
      .toBeGreaterThan(1);

    // An input delivered while the tab is hidden restarts the parked lab loop.
    await page.locator('.tab[data-tab="lab"]').click();
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await page.evaluate(() => labRAF)).toBe(null);
    await page.evaluate(() => {
      document.getElementById('tab-lab').dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(120);
  });
});

test('particle-zoo higgs and confinement travel coverage', async ({ page }) => {
  await collectCoverage(page, 'particle-lab-travel', async () => {
    await preparePage(page, '/particle-zoo/', 'en');
    // A narrow viewport shortens the lattice so an excitation crosses it quickly.
    await page.setViewportSize({ width: 560, height: 720 });
    await page.locator('.tab[data-tab="lab"]').click();
    await page.locator('.lab-subtab[data-lab-sub="basics"]').click();
    await page.locator('#higgsCanvas').scrollIntoViewIfNeeded();
    await page.locator('#higgsPicker button').first().click();
    await expect
      .poll(() => page.evaluate(() => LAB.higgs.fires.length), { timeout: 20_000 })
      .toBe(0);

    // Auto-pull drags the antiquark until it reaches the right-hand clamp.
    await page.locator('#confCanvas').scrollIntoViewIfNeeded();
    const antiquark = await page.evaluate(() => {
      const rect = document.getElementById('confCanvas').getBoundingClientRect();
      return { x: rect.left + LAB.conf.aq.x, y: rect.top + LAB.conf.aq.y, edge: rect.left + LAB.conf.w - 45 };
    });
    await page.mouse.move(antiquark.x, antiquark.y);
    await page.mouse.down();
    await page.mouse.move(antiquark.edge, antiquark.y, { steps: 4 });
    await page.mouse.up();
    await page.locator('#confAuto').check({ force: true });
    await expect
      .poll(() => page.evaluate(() => LAB.conf.aq.x >= LAB.conf.w - 40), { timeout: 10_000 })
      .toBe(true);
    await page.setViewportSize({ width: 1440, height: 1000 });
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
              const result = fn(...args);
              // Async boundary failures reject instead of throwing; settle them the same way.
              if (result && typeof result.then === 'function') result.then(() => {}, () => {});
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
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await sweepComponentEvents(page);
    await page.waitForTimeout(300);
    await sweepComponentEvents(page);
  });
});

for (const app of [
  { id:'big-bang', path:'/big-bang/', key:'bb-motion' },
  { id:'periodic-table', path:'/periodic-table/', key:'pt-motion' }
]) {
  for (const [caseId, requested, stored, expectedState] of [
    ['play','play','pause','playing'],
    ['pause','pause',null,'paused'],
    ['system','system','pause','playing'],
    ['invalid','sideways','pause','paused']
  ]) {
    test(`${app.id} motion query ${caseId} coverage`, async ({ page }) => {
      await collectCoverage(page, `${app.id}-motion-query-${caseId}`, async () => {
        await installDeterminism(page);
        await setLanguage(page,'en');
        await blockExternalAssets(page);
        await page.addInitScript(({key,stored})=>{
          if(stored) localStorage.setItem(key,stored);
          else localStorage.removeItem(key);
        },{key:app.key,stored});
        await page.goto(`${app.path}?motion=${requested}`);
        await page.waitForLoadState('load');
        await expect(page.locator('#motionToggle')).toHaveAttribute('data-state',expectedState);
        expect(await page.evaluate(key=>localStorage.getItem(key),app.key))
          .toBe(requested==='system' ? null : (['play','pause'].includes(requested) ? requested : stored));
        expect(await page.evaluate(()=>document.documentElement.dataset.motion)).toBe(expectedState);
        await page.locator('#motionToggle').click();
        await page.locator('#motionToggle').click();
      });
    });
  }

  test(`${app.id} unavailable motion storage coverage`, async ({ page }) => {
    await collectCoverage(page,`${app.id}-motion-storage-unavailable`,async()=>{
      await installDeterminism(page);
      await blockExternalAssets(page);
      await page.addInitScript(({key,langKey})=>{
        const nativeGet=Storage.prototype.getItem;
        Storage.prototype.getItem=function(item){
          if(item===key || item===langKey) throw new DOMException('denied','SecurityError');
          return nativeGet.call(this,item);
        };
      },{key:app.key,langKey:app.id==='big-bang'?'bb-lang':'pt-lang'});
      await page.goto(app.path);
      await page.waitForLoadState('load');
      await page.evaluate(()=>{
        Storage.prototype.setItem=()=>{throw new DOMException('full','QuotaExceededError');};
        Storage.prototype.removeItem=()=>{throw new DOMException('denied','SecurityError');};
      });
      await page.locator('.lang-pill[data-lang="zh-CN"]').click();
      await page.locator('#motionToggle').click();
      await page.locator('#motionToggle').click();
      await page.evaluate(()=>setMotionMode('system'));
    });
  });

  test(`${app.id} system motion media coverage`, async ({ page }) => {
    await collectCoverage(page,`${app.id}-motion-system-media`,async()=>{
      await installDeterminism(page);
      await setLanguage(page,'zh-CN');
      await blockExternalAssets(page);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.goto(`${app.path}?motion=system`);
      await page.waitForLoadState('load');
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','paused');
      expect(await page.locator('#motionToggle').getAttribute('title')).toContain('系统');
      await page.locator('.lang-pill[data-lang="en"]').click();
      expect(await page.locator('#motionToggle').getAttribute('title')).toContain('system');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','playing');
      await page.emulateMedia({reducedMotion:'reduce'});
      await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','paused');
      if(app.id==='big-bang'){
        expect(await page.evaluate(()=>{
          const previous=window.CURRENT_LANG;
          window.CURRENT_LANG='';
          const defaultLocale=motionText('motion.play');
          window.CURRENT_LANG='missing-locale';
          const englishFallback=motionText('motion.play');
          const keyFallback=motionText('missing-motion-key');
          window.CURRENT_LANG=previous;
          return {defaultLocale,englishFallback,keyFallback};
        })).toEqual({
          defaultLocale:'Play animations',
          englishFallback:'Play animations',
          keyFallback:'missing-motion-key'
        });
      }else{
        await page.evaluate(()=>{
          const element=document.getElementById('orbitalCanvas');
          animationVisibility.delete(element);
          refreshAnimationVisibility(element);
          window.dispatchEvent(new CustomEvent('pt-motionchange',{detail:{paused:true}}));
        });
      }
    });
  });
}

test('periodic-table missing matchMedia motion coverage', async ({ page }) => {
  await collectCoverage(page,'periodic-motion-no-match-media',async()=>{
    await installDeterminism(page);
    await blockExternalAssets(page);
    await page.addInitScript(()=>{ delete window.matchMedia; });
    await page.goto('/periodic-table/');
    await page.waitForLoadState('load');
    await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','playing');
  });
});

test('particle-zoo playground clear branch coverage', async ({ page }) => {
  await collectCoverage(page,'particle-playground-clear-branches',async()=>{
    await preparePage(page,'/particle-zoo/?motion=play','en');
    await page.locator('.tab[data-tab="playground"]').click();
    await page.locator('#pgClear').click();
    await page.waitForFunction(()=>pgClearFrames===0 && pgRAF===null);
    await page.evaluate(()=>pgLoop(performance.now()));
    await page.locator('#pgClear').click();
    await page.evaluate(()=>spawn('electron'));
    expect(await page.evaluate(()=>pgClearFrames)).toBe(0);
    await page.locator('#pgClear').click();
    await page.waitForFunction(()=>pgClearFrames===0 && pgRAF===null);
    await page.evaluate(()=>{
      trails=false;
      spawn('photon',W/2,H/2);
      pgParts[0].vx=0;
      pgParts[0].vy=0;
      pgParts[0].life=PHOTON_FADE_FRAMES;
    });
    await page.waitForFunction(()=>pgParts.length===0 && pgClearFrames===0 && pgRAF===null);
    await page.evaluate(()=>setMotionMode('pause'));
    await page.locator('#pgClear').click();
    expect(await page.evaluate(()=>({frames:pgClearFrames,raf:pgRAF}))).toEqual({frames:0,raf:null});
    expect(await page.evaluate(()=>{
      const shortFallback=shortName('electron','missing-locale');
      const particleName=shortName('proton','missing-locale');
      const idFallback=shortName('missing-particle','missing-locale');
      return {shortFallback,particleName,idFallback};
    })).toEqual({
      shortFallback:'electron',
      particleName:'proton',
      idFallback:'missing-particle'
    });
  });
});

test('particle-zoo direct short-name fallback coverage', async ({ page }) => {
  await collectCoverage(page,'particle-short-name-direct',async()=>{
    await preparePage(page,'/particle-zoo/','en');
    expect(await page.evaluate(() => ({
      short: shortName('electron', 'en'),
      particle: shortName('proton', 'missing-locale'),
      fallback: shortName('__coverage_unknown__', 'en')
    }))).toEqual({
      short: 'electron',
      particle: 'proton',
      fallback: '__coverage_unknown__'
    });
  });
});
