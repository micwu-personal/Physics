import { expect } from '@playwright/test';
import { setRange } from './runtime.js';

export async function exerciseLanding(page) {
  await expect(page.locator('.card')).toHaveCount(3);
  await page.locator('[data-lang="zh-CN"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
}

export async function exerciseTopLevel(page, app) {
  if (app === 'landing') {
    await exerciseLanding(page);
    return;
  }
  const tabs = page.locator('.tab');
  const count = await tabs.count();
  for (let index = 0; index < count; index++) {
    const tab = tabs.nth(index);
    const id = await tab.getAttribute('data-tab');
    await tab.dispatchEvent('click');
    await expect(page.locator(`#tab-${id}`)).toHaveClass(/active/);
  }
}

export async function exerciseBigBang(page) {
  await exerciseTopLevel(page, 'big-bang');
  await page.locator('.tab[data-tab="timeline"]').click();
  const epochCards = page.locator('.ep-card');
  expect(await epochCards.count()).toBeGreaterThan(5);
  await epochCards.first().click();
  await expect(page.locator('#tab-machine')).toHaveClass(/active/);

  const slider = page.locator('#timeSlider');
  for (const value of [-43, -20, -4, 1.5, 3.86, 6, 10, 13, 15, 18, 20]) {
    await setRange(slider, value);
    await expect(page.locator('#mpTime')).not.toHaveText('—');
    await expect(page.locator('#mpEpoch')).not.toHaveText('—');
  }

  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await page.locator('.lang-pill[data-lang="en"]').dispatchEvent('click');

  await page.setViewportSize({ width: 1000, height: 700 });
  await page.locator('.tab[data-tab="timeline"]').click();
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.setViewportSize({ width: 1440, height: 1000 });
}

export async function assertBigBangSourceLinksRerender(page) {
  const panel = page.locator('#sourceLinks');
  const links = panel.locator('a[href]');
  const readLinks = () => links.evaluateAll(anchors => anchors.map(anchor => ({
    href: anchor.href,
    label: anchor.textContent.trim(),
    rel: anchor.rel,
    target: anchor.target
  })));
  const areValidLinks = sourceLinks => sourceLinks.every(link =>
    link.href.startsWith('https://') &&
    link.label.length > 0 &&
    link.target === '_blank' &&
    link.rel.split(/\s+/).includes('noopener') &&
    link.rel.split(/\s+/).includes('noreferrer')
  );

  await expect(panel).toBeVisible();
  await expect(panel.getByText('References:', { exact: true })).toHaveCount(1);
  await expect(panel.getByText('参考资料:', { exact: true })).toHaveCount(0);

  const englishLinks = await readLinks();
  expect(englishLinks.length).toBeGreaterThan(0);
  expect(areValidLinks(englishLinks)).toBe(true);
  expect(new Set(englishLinks.map(link => link.href)).size).toBe(englishLinks.length);

  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(panel.getByText('参考资料:', { exact: true })).toHaveCount(1);
  await expect(panel.getByText('References:', { exact: true })).toHaveCount(0);

  const chineseLinks = await readLinks();
  expect(areValidLinks(chineseLinks)).toBe(true);
  expect(chineseLinks.map(link => link.href)).toEqual(englishLinks.map(link => link.href));
}

export async function exercisePeriodicTable(page) {
  await expect(page.locator('.cell:not(.empty):not(.placeholder)')).toHaveCount(118);
  await page.waitForSelector('#viewToolbar');

  const overlays = page.locator('#viewToolbar [data-ov]');
  for (let index = 0; index < await overlays.count(); index++) {
    await overlays.nth(index).click();
  }
  await page.locator('#viewToolbar').click({ position: { x: 4, y: 4 } });
  await page.locator('#viewToolbar [data-ov="origin"]').click();
  await page.locator('#viewToolbar [data-ov="default"]').click();

  await page.locator('#tlToggleBtn').click();
  await page.evaluate(() => {
    window.__F2.applyYear(1869);
    window.__F2.applyYear(1874);
    window.__F2.applyYear(1875);
    window.__F2.applyYear(1900);
  });
  await expect(page.locator('#tlInfo')).not.toBeEmpty();
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await page.locator('.lang-pill[data-lang="en"]').click();
  await setRange(page.locator('#tlSlider'), 2014);
  await page.locator('#tlPlay').click();
  await page.waitForTimeout(150);
  await setRange(page.locator('#tlSlider'), 2016);
  await page.locator('#tlPlay').click();
  await page.waitForTimeout(50);
  await page.locator('#tlPlay').click();
  await page.locator('#tlToggleBtn').click();

  await page.locator('#cosmicPlayBtn').click();
  await page.locator('#cosmicPlayBtn').click();
  await page.locator('#cosmicPlayBtn').click();
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await page.locator('#cosmicPlayBtn').click();

  await page.locator('#nuclideOpenBtn').click();
  await expect(page.locator('#nuclideView')).toHaveClass(/on/);
  const nuclideBody = page.locator('#nuclideBody');
  // Sweep every nuclide with the initial framing that open() installs, so the
  // tooltip renders each decay mode, half-life band and magic-number badge.
  await page.evaluate(() => {
    const body = document.getElementById('nuclideBody');
    const canvas = document.getElementById('nuclideCanvas');
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min((rect.width - 60) / 180, (rect.height - 60) / 120);
    const move = (clientX, clientY) => body.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX,
      clientY,
      pointerId: 2
    }));
    for (const [z, n] of F_NUCLIDES) {
      const clientX = rect.left + 50 + n * scale;
      const clientY = rect.top + rect.height - z * scale - 50;
      move(clientX, clientY);
      // Repeat on the same nuclide: the tooltip follows the cursor.
      move(clientX + 1, clientY + 1);
    }
    move(rect.left, rect.top);
  });
  const heliumPoint = await page.evaluate(() => {
    const canvas = document.getElementById('nuclideCanvas');
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min((rect.width - 60) / 180, (rect.height - 60) / 120);
    return {
      x: rect.left + 50 + 2 * scale,
      y: rect.top + rect.height - 2 * scale - 50
    };
  });
  await page.mouse.move(heliumPoint.x, heliumPoint.y);
  await expect(page.locator('#nuclideTip')).toHaveClass(/on/);

  // Real pointer drag: the chart captures the pointer while panning.
  await page.mouse.move(200, 200);
  await page.mouse.down();
  await page.mouse.move(250, 230);
  await page.mouse.up();
  await nuclideBody.dispatchEvent('pointercancel', { pointerId: 1 });
  await nuclideBody.hover();
  await page.mouse.wheel(0, -120);
  await page.mouse.wheel(0, 120);
  await page.evaluate(() => {
    window.__B1.close();
    window.__B1.open();
    for (const halfLife of [
      'stable', null, 1e18, 1e15, 1e12, 1e9, 1e6, 1e4, 100, 10, 0.1, 1e-4, 1e-8
    ]) {
      window.__B1.formatHalfLife(halfLife);
    }
  });
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.locator('.lang-pill[data-lang="en"]').dispatchEvent('click');
  await page.locator('#nuclideBack').click();
  await page.locator('#nuclideOpenBtn').click();
  await page.locator('#nuclideBack').click();

  for (const z of [2, 4, 6, 7, 11, 17, 22, 25, 26, 30, 43, 57, 74, 104]) {
    await page.locator(`.cell[data-z="${z}"]`).first().dispatchEvent('click');
    await page.waitForTimeout(40);
    const orbitalTabs = page.locator('#orbitalTabs button');
    for (let index = 0; index < await orbitalTabs.count(); index++) {
      await orbitalTabs.nth(index).dispatchEvent('click');
    }
    const reactions = page.locator('#dRx button');
    for (let index = 0; index < await reactions.count(); index++) {
      await reactions.nth(index).dispatchEvent('click');
    }
    for (const selector of ['#lfBlock [data-lig]', '#lfBlock [data-metal]']) {
      const options = page.locator(selector);
      for (let index = 0; index < await options.count(); index++) {
        await options.nth(index).dispatchEvent('click');
      }
    }
  }

  await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
  await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
  await expect(page.locator('#originBadge')).toBeVisible();
  const orbitalCanvas = page.locator('#orbitalCanvas');
  await orbitalCanvas.scrollIntoViewIfNeeded();
  const orbitalBox = await orbitalCanvas.boundingBox();
  const orbitalCentre = { x: orbitalBox.x + orbitalBox.width / 2, y: orbitalBox.y + orbitalBox.height / 2 };
  // Hovering without a press must not rotate the model.
  await page.mouse.move(orbitalCentre.x - 20, orbitalCentre.y - 20);
  await page.mouse.down();
  await page.mouse.move(orbitalCentre.x + 10, orbitalCentre.y + 10);
  await page.mouse.up();

  // Spin the d_z² orbital so its ring is drawn both edge-on and face-on to the
  // camera. The tilt is pushed against both clamps first and then brought back
  // to zero, so the sweep below starts from a known orientation.
  await page.locator('#orbitalTabs button[data-h="d_z2"]').dispatchEvent('click');
  await page.mouse.move(orbitalCentre.x, orbitalCentre.y);
  await page.mouse.down();
  for (const y of [20, 400, 20, 177]) {
    await page.mouse.move(120, y);
  }
  for (let step = 1; step <= 44; step++) {
    await page.mouse.move(120 + step * 15, 177);
    await page.waitForTimeout(22);
  }
  await page.mouse.up();

  const moleculeCard = page.locator('.mol3d-card').first();
  await moleculeCard.scrollIntoViewIfNeeded();
  const cardBox = await moleculeCard.boundingBox();
  const cardPoint = { x: cardBox.x + cardBox.width / 2, y: cardBox.y + cardBox.height / 2 };
  // Hovering before any press must not rotate the model.
  await page.mouse.move(cardPoint.x - 10, cardPoint.y - 10);
  await page.mouse.down();
  await page.mouse.move(cardPoint.x + 30, cardPoint.y + 15);
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.move(cardPoint.x + 40, cardPoint.y + 25);
  await page.mouse.up();

  // Sodium chloride is a lattice: tipping it fully onto its pole collapses the
  // vertical bonds to a point, which the bond renderer has to skip.
  await page.locator('.cell[data-z="11"]').first().dispatchEvent('click');
  await page.waitForTimeout(60);
  const latticeCard = page.locator('.mol3d-card[data-formula="NaCl"]');
  await latticeCard.scrollIntoViewIfNeeded();
  const latticeBox = await latticeCard.boundingBox();
  await page.mouse.move(latticeBox.x + latticeBox.width / 2, latticeBox.y + 8);
  await page.mouse.down();
  await page.mouse.move(latticeBox.x + latticeBox.width / 2, latticeBox.y + 8 + 400, { steps: 4 });
  await page.waitForTimeout(250);
  await page.mouse.up();

  // Ligand-field extremes: the weakest field absorbs in the infrared and the
  // strongest in the ultraviolet, both narrated in Simplified Chinese.
  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  for (const [z, ligand] of [[25, 'I'], [26, 'CO']]) {
    await page.locator(`.cell[data-z="${z}"]`).first().dispatchEvent('click');
    await page.locator(`#lfBlock [data-lig="${ligand}"]`).dispatchEvent('click');
  }
  await page.locator('.lang-pill[data-lang="en"]').click();

  await page.locator('.cell[data-z="26"]').first().dispatchEvent('click');
  await page.evaluate(() => {
    try {
      shellCounts(999);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
    generateFallbackExt({
      Z: 999,
      category: 'unknown-category',
      name_en: 'Testium',
      name_zh: '测试'
    });
    t('missing.translation.key');
    resolvePhaseLabel('unknown-state');
    PeriodicSources.render('core', null, 'en', document);
    window.currentZ = 26;
    window.__D1.injectOriginBadge();
    delete window.currentZ;
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('active'));
    window.__D1.injectOriginBadge();
    window.__F1.currentOverlay();

    normalizeFormula('H₂O²⁺');
    parseEquation('H₂');
    for (const formula of [
      'H2', 'H2O', 'H2O2', 'CO2', 'CO', 'NH3', 'CH4', 'HCl',
      'NaCl', 'MgCl2', 'FeCl3', 'CCl4', 'PCl5', 'SF6', 'Na2O',
      'FeO', 'Al2O3', 'NaOH', 'Ca(OH)2', 'AgNO3', 'Mg(NO3)2',
      'Fe(NO3)3', 'H2SO4', 'HNO3', 'H2SO3', 'HAuCl4', 'Xe'
    ]) {
      moleculeShape(formula);
    }
    chainMolecule('');
    chainMolecule('Ca(OH2');
    pairAtoms(
      [{ sym: 'H', gx: 0, gy: 0 }, { sym: 'O', gx: 1, gy: 1 }],
      [{ sym: 'H', gx: 2, gy: 2 }, { sym: 'N', gx: 3, gy: 3 }]
    );
    initMol3D(null, 'UNKNOWN');
  });
  await page.locator('#detailClose').click();
  await expect(page.locator('#detail')).toHaveClass(/hidden/);
}

async function exerciseInputs(page, root) {
  const ranges = root.locator('input[type="range"]');
  for (let index = 0; index < await ranges.count(); index++) {
    const range = ranges.nth(index);
    const min = Number(await range.getAttribute('min'));
    const max = Number(await range.getAttribute('max'));
    await setRange(range, min + (max - min) * 0.75);
  }

  const checks = root.locator('input[type="checkbox"]');
  for (let index = 0; index < await checks.count(); index++) {
    await checks.nth(index).click({ force: true });
  }

  const selects = root.locator('select');
  for (let index = 0; index < await selects.count(); index++) {
    const select = selects.nth(index);
    const options = await select.locator('option').count();
    if (options > 1) await select.selectOption({ index: options - 1 });
  }
}

async function buildParticleParts(page, parts) {
  await page.locator('#clearBuild').dispatchEvent('click');
  for (const part of parts) {
    await page.locator(`.tray-part[data-part="${part}"]`).dispatchEvent('click');
  }
  await page.waitForTimeout(40);
}

export async function exerciseParticleZoo(page) {
  await exerciseTopLevel(page, 'particle-zoo');

  await page.locator('.tab[data-tab="chart"]').click();
  await page.locator('.ptile').first().click();
  await expect(page.locator('#pDetail')).not.toContainText('Select a particle');
  const language = await page.locator('html').getAttribute('lang');
  await page.locator('#pfilter').fill(language === 'zh-CN' ? '电子' : 'electron');
  await page.locator('#pList > *').first().click();
  await page.locator('#pfilter').fill('');
  // Every catalogue entry renders its own symbol, antiparticle and metadata.
  const catalogue = page.locator('#pList > *');
  for (let index = 0; index < await catalogue.count(); index++) {
    await catalogue.nth(index).click();
  }

  await page.locator('.tab[data-tab="builder"]').click();
  for (const part of ['u', 'u', 'd', 'e']) {
    await page.locator(`.tray-part[data-part="${part}"]`).click();
  }
  await expect(page.locator('#buildResult')).not.toHaveText('Nothing yet.');
  await page.evaluate(() => {
    const source = document.querySelector('.tray-part[data-part="u"]');
    const zone = document.getElementById('assemblyZone');
    const transfer = new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer
    }));
    zone.dispatchEvent(new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer
    }));
    zone.dispatchEvent(new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer
    }));
    zone.dispatchEvent(new DragEvent('dragleave', {
      bubbles: true,
      dataTransfer: transfer
    }));
  });
  await page.locator('#buildCanvas').click({ position: { x: 180, y: 120 } });

  for (const parts of [
    ['u', 'ubar'],
    ['c', 'cbar'],
    ['u', 'sbar'],
    ['ubar'],
    ['u', 'u', 'd', 'u', 'ubar'],
    ['u', 'd', 'd'],
    ['e'],
    ['e', 'e'],
    ['u', 'u', 'u'],
    ['s'],
    ['u', 'u', 'd', 'u', 'd', 'd'],
    ['u', 'u', 'd', 'u', 'u', 'd', 'u', 'u', 'd'],
    ['u', 'u', 'd', 'u', 'u', 'd', 'e']
  ]) {
    await buildParticleParts(page, parts);
    const decayButtons = page.locator('#buildDecayBar button');
    for (let index = 0; index < await decayButtons.count(); index++) {
      await decayButtons.nth(index).dispatchEvent('click');
    }
  }

  // Clicking a drawn constituent removes exactly that tray part.
  await buildParticleParts(page, ['u', 'u', 'd', 'e']);
  const constituent = await page.evaluate(() => {
    const rect = document.getElementById('buildCanvas').getBoundingClientRect();
    const target = buildViz.particles[0];
    return { x: rect.left + target.x, y: rect.top + target.y, count: buildViz.particles.length };
  });
  await page.mouse.click(constituent.x, constituent.y);
  await expect
    .poll(() => page.evaluate(() => buildViz.particles.length))
    .toBe(constituent.count - 1);
  // Decay channels fired on nuclei that lack the constituent they consume.
  await buildParticleParts(page, ['u', 'u', 'u']);
  await page.evaluate(() => triggerDecay('bm'));
  await buildParticleParts(page, ['d', 'd', 'd']);
  await page.evaluate(() => triggerDecay('bp'));
  await page.evaluate(() => triggerDecay('ec'));
  await buildParticleParts(page, ['u', 'u', 'd']);
  await page.evaluate(() => triggerDecay('ec'));
  // Two mesons and nothing else: the result line lists them all.
  await buildParticleParts(page, ['u', 'ubar', 'c', 'cbar']);
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await buildParticleParts(page, [
    'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u',
    'd', 'd', 'd', 'd', 'd'
  ]);
  await page.locator('#buildDecayBar button[data-mode="alpha"]').dispatchEvent('click');
  await page.evaluate(() => {
    for (const mode of ['gamma', 'bp', 'bm', 'ec', 'alpha']) triggerDecay(mode);
    PZ_PERF.snapshot();
    PZ_PERF.reset();
  });
  await page.waitForTimeout(250);
  // The ejecta fly out and expire while the animation loop is still running.
  await expect.poll(() => page.evaluate(() => decayFX.length), { timeout: 15_000 }).toBe(0);
  await page.locator('#clearBuild').click();
  await page.locator('#buildCanvas').click({ position: { x: 5, y: 5 } });
  // Removing the last constituent by hand lets the loop park itself.
  await buildParticleParts(page, ['e']);
  const lastConstituent = await page.evaluate(() => {
    const rect = document.getElementById('buildCanvas').getBoundingClientRect();
    const target = buildViz.particles[0];
    return { x: rect.left + target.x, y: rect.top + target.y };
  });
  await page.mouse.click(lastConstituent.x, lastConstituent.y);
  await expect.poll(() => page.evaluate(() => buildRAF), { timeout: 8_000 }).toBe(null);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.tab[data-tab="forces"]').click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.tab[data-tab="chart"]').click();
  await page.locator('.tab[data-tab="forces"]').click();
  await page.waitForTimeout(150);

  await page.locator('.tab[data-tab="lab"]').click();
  for (const subtab of ['basics', 'advanced']) {
    await page.locator(`.lab-subtab[data-lab-sub="${subtab}"]`).click();
    const panel = page.locator(`.lab-sub-panel[data-lab-sub-panel="${subtab}"]`);
    await expect(panel).toHaveClass(/active/);
    await exerciseInputs(page, panel);
    const pickers = panel.locator('.det-picker, .higgs-picker');
    for (let pickerIndex = 0; pickerIndex < await pickers.count(); pickerIndex++) {
      const buttons = pickers.nth(pickerIndex).locator('button');
      for (let buttonIndex = 0; buttonIndex < await buttons.count(); buttonIndex++) {
        await buttons.nth(buttonIndex).click();
      }
    }
  }
  await page.locator('#feynExample').click();
  await page.locator('#feynClear').click();
  const feynCanvas = page.locator('#feynCanvas');
  await page.evaluate(() => {
    LAB.feyn.current = 'qcd';
  });
  await feynCanvas.click({ position: { x: 120, y: 120 } });
  await feynCanvas.click({ position: { x: 300, y: 120 } });
  // Vertices that exchange different bosons are not auto-connected.
  await page.evaluate(() => {
    LAB.feyn.current = 'qed';
  });
  await feynCanvas.click({ position: { x: 220, y: 200 } });
  await page.locator('#feynClear').click();
  await page.evaluate(() => {
    LAB.feyn.current = 'wcc';
  });
  await feynCanvas.click({ position: { x: 120, y: 120 } });
  await feynCanvas.click({ position: { x: 300, y: 120 } });

  await page.locator('#decayRestart').click();
  const decayPickers = page.locator('#decayPicker button');
  for (let index = 0; index < await decayPickers.count(); index++) {
    await decayPickers.nth(index).dispatchEvent('click');
  }
  await page.waitForTimeout(100);
  // Watch a cascade reveal generation by generation, then replay it at speed.
  await page.locator('#decayRestart').click();
  await page.waitForTimeout(1_200);
  await setRange(page.locator('#decaySpeed'), 8);
  await page.locator('#decayRestart').click();
  await expect
    .poll(() => page.evaluate(() => {
      const depth = node => 1 + Math.max(0, ...node.children.map(depth));
      const revealed = node => (performance.now() >= node.revealAt ? 1 + Math.max(0, ...node.children.map(revealed)) : 0);
      return revealed(LAB.decay.tree) >= depth(LAB.decay.tree);
    }), { timeout: 15_000 })
    .toBe(true);
  await page.waitForTimeout(200);
  await page.locator('#oscSrcToggle').click();
  await page.locator('#oscSrcToggle').click();
  await page.locator('#oscSrcToggle').click();
  await page.locator('#oscSrcToggle').click();
  await page.locator('#consLoadExample').click();
  const conservationChip = page.locator('#consControls .cons-chip').first();
  await conservationChip.click();
  await conservationChip.click({ button: 'right' });
  // Fill the reactant side so the next chip lands on the product side instead.
  await page.evaluate(() => { LAB.cons.R = ['p', 'p', 'p']; LAB.cons.P = []; });
  await conservationChip.click();
  await conservationChip.click({ button: 'right' });
  // Both panes hold chips again, and clicking one removes it from its own side.
  await page.locator('#consLoadExample').click();
  await page.locator('#consCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  // Clicking a rendered chip inside a pane removes it from that side.
  for (const side of ['R', 'P']) {
    const chips = await page.evaluate(() => {
      const rect = document.getElementById('consCanvas').getBoundingClientRect();
      return LAB.cons._rects.map(chip => ({
        side: chip.side,
        x: rect.left + chip.x + chip.w / 2,
        y: rect.top + chip.y + chip.h / 2
      }));
    });
    const chip = chips.find(entry => entry.side === side);
    if (chip) await page.mouse.click(chip.x, chip.y);
  }
  await page.locator('#consCanvas').click({ position: { x: 40, y: 60 } });
  await page.locator('#consExample').selectOption({ index: 1 });
  await page.locator('#consClear').click();

  // Event display: every recorded event exposes different detector signatures
  // (muon chambers, electromagnetic and hadronic showers), and hovering a track
  // pops the read-out panel on whichever side of the cursor still fits.
  await page.locator('#evdCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const evdLayers = page.locator('#evdControls input[type="checkbox"]');
  for (let index = 0; index < await evdLayers.count(); index++) {
    await evdLayers.nth(index).check();
  }
  const evdEvents = page.locator('#evdPicker button');
  for (let index = 0; index < await evdEvents.count(); index++) {
    await evdEvents.nth(index).click();
    await page.waitForTimeout(80);
    const trackPoints = await page.evaluate(() => {
      const S = LAB.evd;
      const rect = document.getElementById('evdCanvas').getBoundingClientRect();
      const cx = S.w / 2, cy = S.h / 2;
      const scale = Math.max(30, Math.min(S.w, S.h) / 2 - 14) / 195;
      return EVD_EVENTS[S.current].tracks.map(track => {
        const pid = EVD_PID[track.id];
        const phi = track.phi + S.rot;
        const rEnd = pid.shower === 'had' ? 140 * scale : pid.shower === 'em' ? 100 * scale : (pid.muon ? 195 * scale : 140 * scale);
        const angle = pid.charged && pid.shower !== 'none' ? phi + 30 / Math.max(5, track.pT) : phi;
        const x2 = cx + Math.cos(angle) * rEnd, y2 = cy + Math.sin(angle) * rEnd;
        return { x: rect.left + (cx + x2) / 2, y: rect.top + (cy + y2) / 2 };
      });
    });
    for (const point of trackPoints) {
      await page.mouse.move(point.x, point.y);
      await page.waitForTimeout(50);
    }
  }
  // A hadronic jet still deposits in the hadronic calorimeter when the
  // electromagnetic layer is hidden.
  await page.locator('#evdL_ecal').uncheck();
  await page.waitForTimeout(120);
  // On a narrow viewport the read-out panel has to flip to the other side of
  // the cursor to stay inside the canvas.
  await page.setViewportSize({ width: 520, height: 640 });
  await page.waitForTimeout(300);
  await page.locator('#evdCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  for (let index = 0; index < await evdEvents.count(); index++) {
    await evdEvents.nth(index).click();
    await page.waitForTimeout(80);
    const cornerTracks = await page.evaluate(() => {
      const S = LAB.evd;
      const rect = document.getElementById('evdCanvas').getBoundingClientRect();
      const cx = S.w / 2, cy = S.h / 2;
      const scale = Math.max(30, Math.min(S.w, S.h) / 2 - 14) / 195;
      return EVD_EVENTS[S.current].tracks.map(track => {
        const pid = EVD_PID[track.id];
        const phi = track.phi + S.rot;
        const rEnd = pid.shower === 'had' ? 140 * scale : pid.shower === 'em' ? 100 * scale : (pid.muon ? 195 * scale : 140 * scale);
        const angle = pid.charged && pid.shower !== 'none' ? phi + 30 / Math.max(5, track.pT) : phi;
        return { x: rect.left + cx + Math.cos(angle) * rEnd, y: rect.top + cy + Math.sin(angle) * rEnd };
      });
    });
    for (const point of cornerTracks) {
      await page.mouse.move(point.x, point.y);
      await page.waitForTimeout(50);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(200);
  await page.locator('#evdL_ecal').check();
  await page.locator('#evdL_trk').uncheck();
  await page.mouse.move(0, 0);
  await page.locator('#runMSSM').check();
  await setRange(page.locator('#runM'), 4);
  await page.locator('#pdfShowG').uncheck();
  await page.evaluate(() => markLabDirty());

  await page.locator('.lab-subtab[data-lab-sub="basics"]').click();
  const confinement = page.locator('#confCanvas');
  const confinementPoints = await page.evaluate(() => {
    const rect = document.getElementById('confCanvas').getBoundingClientRect();
    return {
      quarkX: rect.left + LAB.conf.q.x,
      quarkY: rect.top + LAB.conf.q.y,
      edgeX: rect.left + 24,
      touchX: rect.left + LAB.conf.aq.x,
      touchY: rect.top + LAB.conf.aq.y,
      farX: rect.right - 24
    };
  });
  // Pull the quark away until the flux tube snaps into two fresh mesons.
  await page.mouse.move(confinementPoints.quarkX, confinementPoints.quarkY);
  await page.mouse.down();
  await page.mouse.move(confinementPoints.edgeX, confinementPoints.quarkY, { steps: 12 });
  await page.waitForTimeout(1_200);
  await page.mouse.up();
  await page.locator('#confReset').click();
  // The same pull works from the antiquark side, and with touch input.
  const antiquark = await page.evaluate(() => {
    const rect = document.getElementById('confCanvas').getBoundingClientRect();
    return { x: rect.left + LAB.conf.aq.x, y: rect.top + LAB.conf.aq.y, farX: rect.right - 24 };
  });
  await page.mouse.move(antiquark.x, antiquark.y);
  await page.mouse.down();
  await page.mouse.move(antiquark.farX, antiquark.y, { steps: 8 });
  await page.mouse.up();
  await page.locator('#confReset').click();
  await page.evaluate(({ touchX, touchY, farX }) => {
    const canvas = document.getElementById('confCanvas');
    const touchEvent = (type, clientX) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', {
        value: [{ clientX, clientY: touchY, identifier: 1, target: canvas }]
      });
      canvas.dispatchEvent(event);
    };
    touchEvent('touchstart', touchX);
    touchEvent('touchmove', farX);
    const end = new Event('touchend', { bubbles: true, cancelable: true });
    Object.defineProperty(end, 'touches', { value: [] });
    canvas.dispatchEvent(end);
  }, confinementPoints);
  await page.locator('#confReset').click();
  const touchStart = await page.evaluate(() => {
    const rect = document.getElementById('confCanvas').getBoundingClientRect();
    return { quarkX: rect.left + LAB.conf.q.x, quarkY: rect.top + LAB.conf.q.y, edgeX: rect.left + 24 };
  });
  await page.evaluate(({ quarkX, quarkY, edgeX }) => {
    const canvas = document.getElementById('confCanvas');
    const touchEvent = (type, clientX) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', {
        value: [{ clientX, clientY: quarkY, identifier: 1, target: canvas }]
      });
      canvas.dispatchEvent(event);
    };
    touchEvent('touchstart', quarkX);
    touchEvent('touchmove', edgeX);
    const end = new Event('touchend', { bubbles: true, cancelable: true });
    Object.defineProperty(end, 'touches', { value: [] });
    canvas.dispatchEvent(end);
  }, touchStart);
  await page.waitForTimeout(200);
  await page.locator('#confAuto').check({ force: true });
  await page.locator('#confReset').click();
  // Let the Higgs-lattice excitations travel the full width of the canvas.
  await page.locator('#higgsCanvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1_500);
  await page.setViewportSize({ width: 1000, height: 760 });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.locator('.tab[data-tab="playground"]').click();
  const spawns = page.locator('[data-spawn]');
  for (let index = 0; index < await spawns.count(); index++) {
    await spawns.nth(index).click();
  }
  await page.evaluate(() => {
    spawn('invalid-type');
    // Annihilate in both encounter orders.
    spawn('positron');
    spawn('electron');
    for (let index = 0; index < 160; index++) spawn('electron');
  });
  await page.locator('#pgTrails').uncheck();
  await page.setViewportSize({ width: 900, height: 700 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#pgCanvas').click({ position: { x: 30, y: 30 } });
  await page.locator('#pgClear').click();
  // A head-on electron-positron encounter annihilates into a photon pair, and
  // the loop parks itself once the last particle has decayed away.
  await page.evaluate(() => {
    spawn('positron');
    spawn('electron');
    const [positron, electron] = pgParts.slice(-2);
    positron.x = 120; positron.y = 120; positron.vx = 1.5; positron.vy = 0;
    electron.x = 150; electron.y = 120; electron.vx = -1.5; electron.vy = 0;
  });
  await expect.poll(() => page.evaluate(() => pgParts.length), { timeout: 20_000 }).toBe(0);
  await expect.poll(() => page.evaluate(() => pgRAF), { timeout: 8_000 }).toBe(null);

  await page.locator('.lang-pill[data-lang="zh-CN"]').click();
  await page.locator('.tab[data-tab="forces"]').click();
  await page.locator('.lang-pill[data-lang="en"]').click();
  await page.evaluate(() => {
    document.querySelectorAll('.pl-item').forEach(item => item.classList.remove('active'));
    applyI18n('zh-CN');
    getP('missing-particle');
    t('missing.translation');
    tForces(['Strong', 'EM'], 'unsupported');
  });
}
