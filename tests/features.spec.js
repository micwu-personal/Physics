import { expect, test } from '@playwright/test';
import { assertNoErrors, watchPage } from './helpers/assertions.js';
import {
  assertBigBangSourceLinksRerender,
  exerciseBigBang,
  exercisePhysicsArea,
  exercisePhysicsAtlas,
  exercisePhysicsEntropy,
  exercisePhysicsPhase,
  exerciseParticleZoo,
  exercisePeriodicTable
} from './helpers/journeys.js';
import { locales } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

const journeys = [
  { name: 'Physics Atlas', path: '/physics/', run: exercisePhysicsAtlas },
  { name: 'Newtonian Mechanics', path: '/physics/newtonian.html', run: exercisePhysicsArea },
  { name: 'Relativity', path: '/physics/relativity.html', run: exercisePhysicsArea },
  { name: 'Quantum Mechanics', path: '/physics/quantum.html', run: exercisePhysicsArea },
  { name: 'Phase Transitions', path: '/physics/phase-transitions.html', run: exercisePhysicsPhase },
  { name: 'Entropy and Information', path: '/physics/entropy-information.html', run: exercisePhysicsEntropy },
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

/* Every physics route keeps wayfinding, motion, and language in one sticky row.
   A secondary section rail, when present, must settle below that shared row. */
for (const [name, path] of [
  ['Physics Atlas', '/physics/'],
  ['Field Guide', '/physics/field.html?id=thermodynamics'],
  ['Newtonian Mechanics', '/physics/newtonian.html'],
  ['Relativity', '/physics/relativity.html'],
  ['Quantum Mechanics', '/physics/quantum.html'],
  ['Astrophysics', '/physics/astrophysics.html'],
  ['Electrodynamics', '/physics/electrodynamics.html'],
  ['Phase Transitions', '/physics/phase-transitions.html'],
  ['Entropy and Information', '/physics/entropy-information.html']
]) {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 412, height: 915 }]) {
    test(`${name} shares one sticky route and control row at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await preparePage(page, path, 'en');
      const route = page.locator('.route-bar');
      await expect(route.locator(':scope > .site-controls')).toHaveCount(1);
      expect(await route.evaluate(element => getComputedStyle(element).position)).toBe('sticky');
      await page.evaluate(() => scrollTo(0, Math.min(document.body.scrollHeight - innerHeight, 1200)));
      const row = await route.evaluate(element => {
        const routeRect = element.getBoundingClientRect();
        const controlsRect = element.querySelector('.site-controls').getBoundingClientRect();
        return {
          routeTop: routeRect.top,
          routeBottom: routeRect.bottom,
          controlsTop: controlsRect.top,
          controlsBottom: controlsRect.bottom
        };
      });
      expect(row.routeTop).toBeGreaterThanOrEqual(0);
      expect(row.controlsTop).toBeGreaterThanOrEqual(row.routeTop);
      expect(row.controlsBottom).toBeLessThanOrEqual(row.routeBottom);
      const sectionRail = page.locator('.topic-index, .atlas-tools').first();
      if (await sectionRail.count()) {
        await sectionRail.scrollIntoViewIfNeeded();
        const overlap = await page.evaluate(() => {
          const routeRect = document.querySelector('.route-bar').getBoundingClientRect();
          const railRect = document.querySelector('.topic-index, .atlas-tools').getBoundingClientRect();
          return Math.max(0, routeRect.bottom - railRect.top);
        });
        expect(overlap).toBeLessThanOrEqual(1);
      }
      const topicRail = page.locator('.topic-index');
      if (await topicRail.count()) {
        const anchor = topicRail.locator('a[href^="#"]').last();
        const targetId = (await anchor.getAttribute('href')).slice(1);
        await anchor.click();
        await page.waitForFunction(id => location.hash === `#${id}`, targetId);
        const targetOverlap = await page.evaluate(id => {
          const railRect = document.querySelector('.topic-index').getBoundingClientRect();
          const targetRect = document.getElementById(id).getBoundingClientRect();
          return Math.max(0, railRect.bottom - targetRect.top);
        }, targetId);
        expect(targetOverlap).toBeLessThanOrEqual(1);
      }
    });
  }
}

/* Data invariants the atlas relies on instead of re-checking them defensively:
   every lineage edge must resolve, and every node must render a signature. */
test('Physics Atlas renders a resolved lineage for every field', async ({ page }) => {
  await preparePage(page, '/physics/', 'en');
  const nodes = page.locator('.field-node');
  const total = await nodes.count();
  expect(total).toBeGreaterThan(0);

  const broken = await page.locator('.field-node').evaluateAll(elements => {
    const ids = new Set(elements.map(element => element.dataset.field));
    return elements.flatMap(element => {
      const problems = [];
      if (!element.querySelector('.field-signature svg, svg.field-signature')?.innerHTML.trim()) {
        problems.push(`${element.dataset.field}: empty signature`);
      }
      if (!element.querySelector('h3').textContent.trim()) {
        problems.push(`${element.dataset.field}: missing name`);
      }
      if (!ids.has(element.dataset.field)) problems.push(`${element.dataset.field}: unresolved id`);
      return problems;
    });
  });
  expect(broken, 'every field node renders a signature and name').toEqual([]);

  // Selecting each field walks its full ancestor/descendant graph; an unresolved
  // parent id would throw inside graphFamily(). The inspector floats over the
  // stage, so dispatch the activation directly instead of hit-testing.
  const errors = watchPage(page);
  for (let index = 0; index < total; index++) {
    await nodes.nth(index).locator('button').dispatchEvent('click');
    await expect(page.locator('#fieldInspector h3')).not.toHaveText('');
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#fieldInspector')).not.toHaveClass(/open/);
  await assertNoErrors(errors);
});

test('Every physics field has concrete authoritative references', async ({ page }) => {
  await preparePage(page, '/physics/field.html?id=thermodynamics', 'en');
  const missing = await page.evaluate(() => {
    const standaloneKeys = {
      mechanics: 'newtonian',
      relativity: 'relativity',
      'quantum-mechanics': 'quantum',
      astrophysics: 'astrophysics',
      electrodynamics: 'light',
      'phase-transitions': 'phase-transitions',
      'information-theory': 'entropy-information'
    };
    return PhysicsFieldList.flatMap(field => {
      const key = standaloneKeys[field.id] || field.id;
      const references = PhysicsReferences[key];
      if (!references || references.length < 2) return [`${field.id}: fewer than two references`];
      return references.flatMap(reference => {
        const problems = [];
        if (!reference.url.startsWith('https://')) problems.push(`${field.id}: non-HTTPS reference`);
        if (!reference.institution || !reference.title || !reference.en || !reference.zh) {
          problems.push(`${field.id}: incomplete bilingual reference`);
        }
        return problems;
      });
    });
  });
  expect(missing).toEqual([]);
});

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

test('Landing page carries shared language, motion, and the six-chapter story into every app', async ({ page }) => {
  const errors=watchPage(page);
  await page.goto('/',{waitUntil:'load'});
  await expect(page.locator('.chapter')).toHaveCount(6);
  await expect(page.locator('.card')).toHaveCount(3);
  await expect(page.locator('.rep')).toHaveCount(10);
  expect(await page.locator('.controls').evaluate(element=>getComputedStyle(element).position)).toBe('fixed');
  const media=page.locator('.media-frame img');
  for(let index=0;index<await media.count();index++){
    await media.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(()=>media.nth(index).evaluate(image=>image.complete && image.naturalWidth>0)).toBe(true);
  }

  await page.locator('[data-lang="zh-CN"]').click();
  await expect(page.locator('.story-map')).toHaveAttribute('aria-label','旅程章节');
  await expect(page.locator('img[data-i18n-alt="alt.wmap"]')).toHaveAttribute('alt',/WMAP 测得/);
  await page.goto('/big-bang/index.html?tab=timeline',{waitUntil:'load'});
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.locator('img[data-i18n-alt="alt.wmap"]')).toHaveAttribute('alt',/宇宙微波背景/);
  await page.goto('/particle-zoo/index.html?tab=lab&demo=detector',{waitUntil:'load'});
  await expect(page.locator('img[data-i18n-alt="alt.atlas"]')).toHaveAttribute('alt',/ATLAS 重建/);
  await page.goto('/',{waitUntil:'load'});
  await page.locator('#motionToggle').click();
  await page.goto('/big-bang/',{waitUntil:'load'});
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','paused');
  await assertNoErrors(errors);
});

test('Landing explicit Play overrides a system reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/',{waitUntil:'load'});
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','paused');
  await page.locator('#motionToggle').click();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state','playing');
  const ringMotion=await page.locator('.diagram .ring').first().evaluate(element=>{
    const style=getComputedStyle(element);
    return {duration:style.animationDuration,iterations:style.animationIterationCount};
  });
  expect(ringMotion).toEqual({duration:'5s',iterations:'infinite'});
});

test('Particle Zoo packs helium-4 by default and exposes every Standard Model fermion', async ({ page }) => {
  const errors=watchPage(page);
  await preparePage(page,'/particle-zoo/?tab=builder&preset=helium4','en');
  await expect(page.locator('#tab-builder')).toHaveClass(/active/);
  await expect(page.locator('#buildResult')).toContainText('Helium-4 nucleus');
  await expect(page.locator('.packing-choice.active')).toContainText('2p + 2n');
  await expect(page.locator('.tray-part[data-part]')).toHaveCount(24);
  for(const part of ['t','tbar','e','eplus','mu','muplus','tau','tauplus','nue','nuebar','numu','numubar','nutau','nutaubar']){
    await expect(page.locator(`.tray-part[data-part="${part}"]`)).toHaveCount(1);
  }
  const unstable=page.locator('.packing-choice.unstable').first();
  await expect(unstable).toBeVisible();
  await unstable.click();
  await expect(page.locator('#buildResult')).toContainText('Δ baryon');
  await page.locator('#clearBuild').click();
  const positron=page.locator('.tray-part[data-part="eplus"]');
  await expect(positron).toHaveAttribute('role','button');
  await expect(positron).toHaveAttribute('tabindex','0');
  await positron.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(()=>parts)).toEqual(['eplus']);
  await assertNoErrors(errors);
});

test('Particle Zoo detector deep link lands on the requested learning module', async ({ page }) => {
  await preparePage(page,'/particle-zoo/index.html?tab=lab&demo=detector','en');
  await expect(page.locator('#tab-lab')).toHaveClass(/active/);
  await expect(page.locator('#lab-detector')).toBeFocused();
  const position=await page.locator('#lab-detector').evaluate(element=>element.getBoundingClientRect().top);
  expect(position).toBeGreaterThanOrEqual(120);
  expect(position).toBeLessThan(250);
});

test('Periodic Table keeps structures element-relevant and labels model limits', async ({ page }) => {
  const errors=watchPage(page);
  await preparePage(page,'/periodic-table/?element=3','en');
  await expect(page.locator('.model-caveat')).toHaveCount(2);
  await expect(page.locator('.model-caveat').first()).toContainText('rings are not electron paths');
  await expect(page.locator('.mol3d-caption',{hasText:'LiOH'})).toHaveCount(1);
  await expect(page.locator('.mol3d-caption',{hasText:'H₂'})).toHaveCount(1);
  await expect(page.locator('.mol3d-caption',{hasText:'H₂O'})).toHaveCount(0);
  expect(await page.evaluate(()=>Object.keys(MOLECULE_3D).length)).toBeGreaterThanOrEqual(45);
  const closeHitTarget=await page.locator('#detailClose').evaluate(button=>{
    const rect=button.getBoundingClientRect();
    return document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)?.id;
  });
  expect(closeHitTarget).toBe('detailClose');
  await page.locator('#dReactionsBlock').scrollIntoViewIfNeeded();
  await page.locator('.rx-play').first().click();
  await page.locator('#rxAnimBox').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>window.PT_REACTION_DEBUG)).toMatchObject({
    sourceHoldMs:500,
    effects:{heat:true,light:true,lightColor:'#d7193f'}
  });
  await page.locator('#motionToggle').click();
  await page.waitForTimeout(750);
  expect(await page.evaluate(()=>window.PT_REACTION_DEBUG.holdingSource)).toBe(true);
  await page.locator('#motionToggle').click();
  await expect.poll(
    ()=>page.evaluate(()=>window.PT_REACTION_DEBUG.holdingSource),
    {timeout:5000}
  ).toBe(false);
  await page.locator('[data-lang="zh-CN"]').click();
  await expect(page.locator('img[data-i18n-alt="alt.hydrogen"]')).toHaveAttribute('alt',/氢原子计算概率密度/);
  expect(await page.locator('.control-row').evaluate(element=>getComputedStyle(element).position)).toBe('fixed');
  await assertNoErrors(errors);
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
    const controls = document.querySelector('.control-row').getBoundingClientRect();
    return [...nav.querySelectorAll('.tab')].filter(tab => {
      const rect = tab.getBoundingClientRect();
      return rect.left < controls.right && rect.right > controls.left &&
        rect.top < controls.bottom && rect.bottom > controls.top;
    }).map(tab => tab.dataset.tab);
  });
  expect(overlappingTabs, 'motion/language controls must not cover sticky navigation').toEqual([]);
  await assertNoErrors(errors);
});

test('Particle Zoo playground clear finishes its fade and restarts on spawn', async ({ page }) => {
  const errors = watchPage(page);
  await preparePage(page, '/particle-zoo/?motion=play', 'en');
  await page.locator('.tab[data-tab="playground"]').click();
  await page.locator('#pgCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => pgParts.length)).toBeGreaterThan(0);

  const framesBefore = await page.evaluate(() => window.PZ_PERF.snapshot().frames.playground);
  await page.locator('#pgClear').click();
  expect(await page.evaluate(() => ({ parts: pgParts.length, flashes: flashes.length })))
    .toEqual({ parts: 0, flashes: 0 });
  await page.waitForFunction(() => pgClearFrames === 0 && pgRAF === null);
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.playground)).toBeGreaterThan(framesBefore);
  const clearedPixels = await page.locator('#pgCanvas').evaluate(canvas => {
    const context = canvas.getContext('2d');
    return [
      context.getImageData(0, 0, 1, 1).data,
      context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data,
      context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data
    ].map(pixel => [...pixel]);
  });
  expect(clearedPixels).toEqual(Array(3).fill([3, 5, 16, 255]));
  const clearedImage = await page.locator('#pgCanvas').evaluate(canvas => canvas.toDataURL());
  await page.waitForTimeout(250);
  expect(await page.locator('#pgCanvas').evaluate(canvas => canvas.toDataURL())).toBe(clearedImage);

  await page.locator('[data-spawn="electron"]').click();
  expect(await page.evaluate(() => pgParts.length)).toBe(1);
  const restartFrames = await page.evaluate(() => window.PZ_PERF.snapshot().frames.playground);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.playground)).toBeGreaterThan(restartFrames);
  await assertNoErrors(errors);
});

test('Particle Zoo photons fade before the final scene clears', async ({ page }) => {
  const errors = watchPage(page);
  await preparePage(page, '/particle-zoo/?motion=play', 'en');
  await page.locator('.tab[data-tab="playground"]').click();
  await page.locator('#pgCanvas').scrollIntoViewIfNeeded();
  await page.locator('#pgClear').click();
  await page.waitForFunction(() => pgClearFrames === 0 && pgRAF === null);
  await page.evaluate(() => {
    trails=false;
    spawn('photon',W/2,H/2);
    const photon=pgParts[0];
    photon.vx=0;
    photon.vy=0;
    photon.life=PHOTON_FADE_FRAMES;
    pgStart();
  });
  const fadeFrames=await page.evaluate(() => PHOTON_FADE_FRAMES);
  const samplePhoton = () => page.evaluate(() => {
    const photon=pgParts[0];
    if(!photon) return null;
    const pixel=ctx.getImageData(
      Math.floor(photon.x*devicePixelRatio),
      Math.floor(photon.y*devicePixelRatio),
      1,
      1
    ).data;
    return {brightness:pixel[0]+pixel[1]+pixel[2],life:photon.life};
  });
  await expect.poll(async () => (await samplePhoton())?.life, { timeout: 2_000, intervals:[20] })
    .toBeLessThan(fadeFrames-3);
  const early=await samplePhoton();
  await expect.poll(async () => {
    const sample=await samplePhoton();
    if(sample && sample.life<8) await page.evaluate(()=>pgStop());
    return sample?.life;
  }, { timeout: 2_000, intervals:[20] })
    .toBeLessThan(8);
  const late=await samplePhoton();
  expect(late.brightness).toBeLessThan(early.brightness);

  await page.evaluate(()=>pgStart());
  const removalState=await page.waitForFunction(() => {
    if(pgParts.length!==0 || pgClearFrames===0) return null;
    pgStop();
    return {
      clearFrames:pgClearFrames,
      frames:window.PZ_PERF.snapshot().frames.playground
    };
  }).then(handle=>handle.jsonValue());
  const framesAtRemoval=removalState.frames;
  expect(removalState.clearFrames).toBeGreaterThan(0);
  await page.evaluate(()=>pgStart());
  await page.waitForFunction(() => pgClearFrames===0 && pgRAF===null);
  expect(await page.evaluate(() => window.PZ_PERF.snapshot().frames.playground)).toBeGreaterThan(framesAtRemoval);
  expect(await page.locator('#pgCanvas').evaluate(canvas => {
    const context=canvas.getContext('2d');
    return [...context.getImageData(canvas.width>>1,canvas.height>>1,1,1).data];
  })).toEqual([3,5,16,255]);
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('#tab-playground .section-head p')).toContainText('逐渐淡出');
  await assertNoErrors(errors);
});

test('Big Bang background motion can override and persist reduced motion', async ({ page }) => {
  const errors = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await preparePage(page, '/big-bang/?motion=system', 'en');
  const fingerprint = () => page.locator('#bgCanvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let index = 0; index < pixels.length; index += 193) {
      hash = Math.imul(hash ^ pixels[index], 16777619) >>> 0;
    }
    return hash;
  });
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#motionToggle')).toContainText('Play animations');
  const pausedFrame = await fingerprint();
  await page.waitForTimeout(250);
  expect(await fingerprint()).toBe(pausedFrame);

  await page.locator('#motionToggle').click();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  const playingFrame = await fingerprint();
  await page.waitForTimeout(250);
  expect(await fingerprint()).not.toBe(playingFrame);
  expect(await page.evaluate(() => localStorage.getItem('bb-motion'))).toBe('play');
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('#motionToggle')).toContainText('暂停动画');
  await page.goto('/big-bang/', { waitUntil: 'load' });
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  await page.setViewportSize({ width: 412, height: 915 });
  const overlap = await page.locator('.tabs').evaluate(nav => {
    const controls = document.querySelector('.control-row').getBoundingClientRect();
    return [...nav.querySelectorAll('.tab')].some(tab => {
      const rect = tab.getBoundingClientRect();
      return rect.left < controls.right && rect.right > controls.left &&
        rect.top < controls.bottom && rect.bottom > controls.top;
    });
  });
  expect(overlap).toBe(false);
  await assertNoErrors(errors);
});

test('Periodic Table motion control resumes canvases and stops timed views', async ({ page }) => {
  const errors = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await preparePage(page, '/periodic-table/?motion=system', 'en');
  await expect(page.locator('#viewToolbar')).toBeVisible();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');
  await page.locator('.cell[data-z="26"]').click();
  await page.locator('#orbitalTabs button[data-h="p_x"]').click();
  await page.locator('#orbitalCanvas').scrollIntoViewIfNeeded();
  const fingerprint = () => page.locator('#orbitalCanvas').evaluate(canvas => canvas.toDataURL());
  const pausedFrame = await fingerprint();
  await page.waitForTimeout(250);
  expect(await fingerprint()).toBe(pausedFrame);
  await page.locator('#cosmicPlayBtn').click();
  // Starting the cosmic timeline now resumes motion rather than silently
  // refusing, so the visitor does not have to un-pause separately.
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  await expect(page.locator('#cosmicBanner')).toHaveClass(/on/);
  await page.locator('#cosmicPlayBtn').click();
  await expect(page.locator('#cosmicBanner')).not.toHaveClass(/on/);
  await page.locator('#motionToggle').click();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'paused');

  await page.locator('#motionToggle').click();
  await expect(page.locator('#motionToggle')).toHaveAttribute('data-state', 'playing');
  await page.locator('#orbitalCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const playingFrame = await fingerprint();
  await page.waitForTimeout(250);
  expect(await fingerprint()).not.toBe(playingFrame);
  expect(await page.evaluate(() => localStorage.getItem('pt-motion'))).toBe('play');
  await page.locator('#cosmicPlayBtn').click();
  await expect(page.locator('#cosmicBanner')).toHaveClass(/on/);
  await page.locator('#motionToggle').click();
  await expect(page.locator('#cosmicBanner')).not.toHaveClass(/on/);
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('#motionToggle')).toContainText('播放动画');
  await assertNoErrors(errors);
});
