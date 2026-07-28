import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import {
  assertBigBangSourceLinksRerender,
  exerciseBigBang,
  exerciseParticleZoo,
  exercisePeriodicTable
} from './helpers/journeys.js';
import { locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

const journeys = [
  { name: 'Big Bang', path: '/big-bang/', run: exerciseBigBang },
  { name: 'Periodic Table', path: '/periodic-table/', run: exercisePeriodicTable },
  { name: 'Particle Zoo', path: '/particle-zoo/', run: exerciseParticleZoo }
];

for (const journey of journeys) {
  for (const language of locales) {
    test(`${journey.name} exercises every control family in ${language}`, async ({ page }) => {
      const errors = watchPage(page);
      await preparePage(page, journey.path, language);
      await journey.run(page);
      await assertNoErrors(errors);
    });
  }
}

/* Structural invariants the periodic-table feature modules rely on instead of
   re-checking them defensively on every render. */
test('Periodic Table exposes the anchors its feature modules require', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  for (const selector of [
    '#viewToolbar', '#viewLegend', '#dName', '#dCategory', '#nucleusCanvas',
    '.pt-wrap', '.d-block h3[data-i18n="detail.section.colors"]'
  ]) {
    await expect(page.locator(selector), `${selector} anchors a feature module`).toHaveCount(1);
  }
  const cellsWithoutZ = await page.locator('.cell:not(.empty):not(.placeholder):not([data-z])').count();
  expect(cellsWithoutZ, 'every rendered element cell carries its atomic number').toBe(0);

  await page.locator('#tlToggleBtn').click();
  for (const selector of ['#timelinePanel h3', '#tlPlay', '#tlSlider']) {
    await expect(page.locator(selector), `${selector} is built with the timeline panel`).toHaveCount(1);
  }
  await page.locator('#nuclideOpenBtn').click();
  for (const selector of ['#nuclideView h2', '#nuclideBack', '#nuclideLegend']) {
    await expect(page.locator(selector), `${selector} is built with the nuclide chart`).toHaveCount(1);
  }
  await page.locator('#nuclideBack').click();
});

test('Periodic Table reaction shapes keep bonded atoms apart', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  const degenerate = await page.evaluate(() => {
    const equations = [
      ...Object.values(EXTENDED).flatMap(record => record.reactions || []),
      ...Object.values(ELEMENT_REACTIONS).flat()
    ].map(reaction => reaction.eq);
    const broken = [];
    for (const equation of equations) {
      const parsed = parseEquation(equation);
      for (const group of [...parsed.lhs, ...parsed.rhs]) {
        const shape = moleculeShape(group.formula);
        for (const [i, j] of shape.bonds) {
          const a = shape.atoms[i], b = shape.atoms[j];
          if (!a || !b || (a.x === b.x && a.y === b.y)) broken.push(`${group.formula} ${i}-${j}`);
        }
      }
    }
    return broken;
  });
  expect(degenerate, 'reaction bonds always have a direction').toEqual([]);
});

test('Periodic Table playback stops cleanly', async ({ page }) => {
  await preparePage(page, '/periodic-table/', 'en');
  await page.locator('#tlToggleBtn').click();
  await page.locator('#tlPlay').click();
  await page.waitForTimeout(300);
  await page.locator('#tlPlay').click();
  const stoppedYear = await page.locator('#tlYear').textContent();
  await page.waitForTimeout(400);
  expect(await page.locator('#tlYear').textContent(), 'the year stops advancing').toBe(stoppedYear);
  await page.locator('#tlToggleBtn').click();

  await page.locator('#cosmicPlayBtn').click();
  await page.waitForTimeout(200);
  await page.locator('#cosmicPlayBtn').click();
  await page.waitForTimeout(400);
  await expect(page.locator('.cell.not-yet-forged'), 'every cell is restored').toHaveCount(0);
  await expect(page.locator('.cell.freshly-forged')).toHaveCount(0);
});

for (const entry of [
  { name: 'canonical', path: '/big-bang/' },
  { name: 'mobile', path: '/big-bang/mobile/index.html' }
]) {
  test(`Big Bang ${entry.name} source links rerender once when switching to zh-CN`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, entry.path, 'en');
    await assertBigBangSourceLinksRerender(page);
    await assertNoErrors(errors);
  });
}

test('Particle Zoo stages every cold panel and sizes canvases only when active', async ({ page }) => {
  await preparePage(page, '/particle-zoo/', 'en');
  const panels = await page.evaluate(() =>
    Object.entries(PANEL_CHUNK_SELECTORS).map(([tab, selector]) => ({
      tab,
      chunks: document.getElementById(`tab-${tab}`).querySelectorAll(selector).length
    }))
  );
  expect(panels.length, 'the staged panel table is populated').toBeGreaterThan(0);
  for (const panel of panels) {
    expect(panel.chunks, `${panel.tab} is worth staging`).toBeGreaterThan(1);
  }

  // resizeCanvas()/resizeBuild() run only once their panel is active, so they
  // never observe a zero-sized surface and need no defensive early return.
  const cold = await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
    return { playground: W, builder: BW, builderCold: document.querySelector('#tab-builder:not(.active)') !== null };
  });
  expect(cold.builderCold, 'the builder panel is cold while the chart is shown').toBe(true);
  expect(cold.playground, 'a resize while cold never sizes the playground canvas').toBe(0);
  expect(cold.builder, 'a resize while cold never sizes the builder canvas').toBe(0);

  for (const [tab, id] of [['playground', 'pgCanvas'], ['builder', 'buildCanvas']]) {
    await page.locator(`.tab[data-tab="${tab}"]`).click();
    const warm = await page.evaluate(canvasId => {
      const element = document.getElementById(canvasId);
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        tracked: canvasId === 'pgCanvas' ? W : BW,
        backing: element.width
      };
    }, id);
    expect(warm.width, `${id} has a layout box once its panel is active`).toBeGreaterThan(1);
    expect(warm.height, `${id} has a layout box once its panel is active`).toBeGreaterThan(1);
    expect(warm.tracked, `${id} sizing recorded a real width`).toBeGreaterThan(1);
    expect(warm.backing, `${id} received a real backing store`).toBeGreaterThan(1);
  }
});

test('Particle Zoo keeps large paints cached or compositor-only', async ({ page }) => {
  await preparePage(page, '/particle-zoo/', 'en');
  await expect(page.locator('#tab-chart .render-pending')).toHaveCount(0);
  await expect(page.locator('.ix-card')).toHaveCount(0);
  await expect(page.locator('.bsm-card .content-refs')).toHaveCount(0);
  const initialPerf = await page.evaluate(() => window.PZ_PERF.snapshot());
  expect(initialPerf.draws.builder || 0).toBe(0);
  expect(initialPerf.draws.playground || 0).toBe(0);
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('.ix-card')).toHaveCount(0);
  await page.locator('.lang-pill[data-lang="en"]').click();
  await page.locator('.tab[data-tab="forces"]').click();
  await expect(page.locator('.ix-card')).toHaveCount(21);
  await expect(page.locator('.force-card .content-refs')).toHaveCount(4);

  const rendering = await page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    const pageGlow = getComputedStyle(document.body, '::before');
    const stars = style('#bg-stars');
    return {
      bodyBackground: style('body').backgroundImage,
      canvasBackgrounds: [
        '.assembly',
        '.ix-card svg',
        '.lab-viz canvas',
        '#pgCanvas'
      ].map(selector => style(selector).backgroundImage),
      filteredSurfaces: [
        '.badge',
        '.tabs',
        '.sm-block',
        '.detail-card',
        '.force-card',
        '.lab-card',
        '.phen-card',
        '.lang-switch'
      ].map(selector => style(selector).backdropFilter),
      pageGlowBackground: pageGlow.backgroundImage,
      pageGlowPosition: pageGlow.position,
      activePanelVisibility: style('#tab-forces').contentVisibility,
      inactivePanelVisibility: style('#tab-detail').contentVisibility,
      starAnimation: stars.animationName,
      starWillChange: stars.willChange,
      tabAnimation: style('.tab-panel').animationName
    };
  });

  expect(rendering.bodyBackground).toBe('none');
  expect(rendering.pageGlowPosition).toBe('fixed');
  expect(rendering.pageGlowBackground).not.toBe('none');
  expect(rendering.activePanelVisibility).toBe('visible');
  expect(rendering.inactivePanelVisibility).toBe('hidden');
  expect(rendering.starAnimation).toBe('drift-transform');
  expect(rendering.starWillChange).toContain('transform');
  expect(rendering.tabAnimation).toBe('none');
  expect(rendering.canvasBackgrounds).toEqual(['none', 'none', 'none', 'none']);
  expect(rendering.filteredSurfaces).toEqual(Array(8).fill('none'));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ix-gr1').last()).not.toHaveAttribute('d', '');
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('.ix-ph').first()).not.toHaveAttribute('d', '');
  await page.locator('.tab[data-tab="playground"]').click();
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().draws.playground)).toBeGreaterThan(0);
  await page.locator('.tab[data-tab="bsm"]').click();
  await expect(page.locator('.bsm-card .content-refs')).toHaveCount(12);
});

test('Particle Zoo visible simulations animate and honor reduced motion', async ({ page }) => {
  const errors = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await preparePage(page, '/particle-zoo/', 'en');
  expect(await page.locator('#bg-stars').evaluate(element => getComputedStyle(element).animationName))
    .toBe('drift-transform');

  const fingerprint = id => page.locator(`#${id}`).evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let index = 0; index < pixels.length; index += 97) {
      hash = Math.imul(hash ^ pixels[index], 16777619) >>> 0;
    }
    return hash;
  });
  const expectCanvasToAdvance = async id => {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    const before = await fingerprint(id);
    await page.waitForTimeout(350);
    expect(await fingerprint(id), `${id} should visibly advance`).not.toBe(before);
  };

  await page.locator('.tab[data-tab="builder"]').click();
  for (const part of ['u', 'u', 'd', 'e']) {
    await page.locator(`.tray-part[data-part="${part}"]`).click();
  }
  await expectCanvasToAdvance('buildCanvas');

  await page.locator('.tab[data-tab="forces"]').click();
  await page.locator('.ix-card').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const pathsBefore = await page.locator('.ix-card path').evaluateAll(paths =>
    paths.map(path => path.getAttribute('d'))
  );
  const interactionFrames = await page.evaluate(() => window.PZ_PERF.snapshot().frames.interactions);
  await page.waitForTimeout(350);
  const pathsAfter = await page.locator('.ix-card path').evaluateAll(paths =>
    paths.map(path => path.getAttribute('d'))
  );
  expect(pathsAfter.some((path, index) => path !== pathsBefore[index])).toBe(true);
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.interactions))
    .toBeGreaterThan(interactionFrames);

  await page.locator('.tab[data-tab="lab"]').click();
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
  const basicsAreOffscreen = await page.locator('#confCanvas, #detCanvas, #higgsCanvas')
    .evaluateAll(canvases => canvases.every(canvas =>
      canvas.getBoundingClientRect().top > innerHeight + 80
    ));
  expect(basicsAreOffscreen, 'all animated basics demos should be outside the observer margin').toBe(true);
  const offscreenBefore = await page.evaluate(() => window.PZ_PERF.snapshot().draws);
  await page.waitForTimeout(350);
  const offscreenAfter = await page.evaluate(() => window.PZ_PERF.snapshot().draws);
  for (const id of ['conf', 'det', 'higgs']) {
    expect(
      (offscreenAfter[`lab:${id}`] || 0) - (offscreenBefore[`lab:${id}`] || 0),
      `${id} should advance while its active Lab subtab is open`
    ).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const id of ['confCanvas', 'detCanvas', 'higgsCanvas']) {
    await expectCanvasToAdvance(id);
  }
  await page.locator('.lab-subtab[data-lab-sub="advanced"]').click();
  await page.locator('#decayRestart').click();
  await expectCanvasToAdvance('decayCanvas');

  await page.locator('.tab[data-tab="playground"]').click();
  await expectCanvasToAdvance('pgCanvas');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'load' });
  await page.locator('.tab[data-tab="lab"]').click();
  await page.locator('#detCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const reducedBefore = await fingerprint('detCanvas');
  await page.waitForTimeout(350);
  expect(await fingerprint('detCanvas'), 'reduced motion should pause the detector').toBe(reducedBefore);
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#motionToggle')).toContainText('Play animations');
  expect(await page.locator('#bg-stars').evaluate(element => getComputedStyle(element).animationName))
    .toBe('none');
  await page.locator('#motionToggle').click();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  const forcedStarMotion = await page.locator('#bg-stars').evaluate(element => {
    const style = getComputedStyle(element);
    return {
      duration: style.animationDuration,
      iterations: style.animationIterationCount,
      name: style.animationName
    };
  });
  expect(forcedStarMotion).toEqual({
    duration: '180s',
    iterations: 'infinite',
    name: 'drift-transform'
  });
  const overrideBefore = await fingerprint('detCanvas');
  await page.waitForTimeout(350);
  expect(await fingerprint('detCanvas'), 'the explicit play override should resume motion').not.toBe(overrideBefore);
  expect(await page.evaluate(() => localStorage.getItem('pz-motion'))).toBe('play');
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('#motionToggle')).toContainText('暂停动画');
  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  await expect(page.locator('#motionToggle')).toContainText('Pause animations');
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('#motionToggle')).toContainText('暂停动画');
  await page.locator('.tab[data-tab="lab"]').click();
  const persistedFrames = await page.evaluate(() => window.PZ_PERF.snapshot().frames.lab);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.lab)).toBeGreaterThan(persistedFrames);
  await page.setViewportSize({ width: 412, height: 915 });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(100);
  const overlappingTabs = await page.locator('.tabs').evaluate(nav => {
    const controls = nav.querySelector('.control-row').getBoundingClientRect();
    return [...nav.querySelectorAll('.tab')].filter(tab => {
      const rect = tab.getBoundingClientRect();
      return rect.left < controls.right && rect.right > controls.left &&
        rect.top < controls.bottom && rect.bottom > controls.top;
    }).map(tab => tab.dataset.tab);
  });
  expect(overlappingTabs, 'motion/language controls must not cover sticky navigation').toEqual([]);
  await assertNoErrors(errors);
});
