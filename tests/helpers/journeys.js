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
  for (const value of [-43, -4, 18]) {
    await setRange(slider, value);
    await expect(page.locator('#mpTime')).not.toHaveText('—');
    await expect(page.locator('#mpEpoch')).not.toHaveText('—');
  }
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

  await page.locator('#tlToggleBtn').click();
  await setRange(page.locator('#tlSlider'), 1869);
  await expect(page.locator('#tlInfo')).not.toBeEmpty();
  await page.locator('#tlPlay').click();
  await page.locator('#tlPlay').click();
  await page.locator('#tlToggleBtn').click();

  await page.locator('#cosmicPlayBtn').click();
  await page.locator('#cosmicPlayBtn').click();

  await page.locator('#nuclideOpenBtn').click();
  await expect(page.locator('#nuclideView')).toHaveClass(/on/);
  await page.locator('#nuclideBody').hover();
  await page.mouse.wheel(0, -120);
  await page.locator('#nuclideBack').click();

  await page.locator('.cell[data-z="26"]').click();
  await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
  await expect(page.locator('#originBadge')).toBeVisible();

  const orbitalTabs = page.locator('#orbitalTabs button');
  for (let index = 0; index < await orbitalTabs.count(); index++) {
    await orbitalTabs.nth(index).click();
  }
  const reactions = page.locator('#dRx button');
  for (let index = 0; index < await reactions.count(); index++) {
    await reactions.nth(index).click();
  }
  const ligands = page.locator('#lfBlock [data-lig]');
  for (let index = 0; index < await ligands.count(); index++) {
    await ligands.nth(index).click();
  }
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

export async function exerciseParticleZoo(page) {
  await exerciseTopLevel(page, 'particle-zoo');

  await page.locator('.tab[data-tab="chart"]').click();
  await page.locator('.ptile').first().click();
  await expect(page.locator('#pDetail')).not.toContainText('Select a particle');
  const language = await page.locator('html').getAttribute('lang');
  await page.locator('#pfilter').fill(language === 'zh-CN' ? '电子' : 'electron');
  await page.locator('#pList > *').first().click();
  await page.locator('#pfilter').fill('');

  await page.locator('.tab[data-tab="builder"]').click();
  for (const part of ['u', 'u', 'd', 'e']) {
    await page.locator(`.tray-part[data-part="${part}"]`).click();
  }
  await expect(page.locator('#buildResult')).not.toHaveText('Nothing yet.');
  await page.locator('#clearBuild').click();

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
  await page.locator('#decayRestart').click();
  await page.locator('#oscSrcToggle').click();
  await page.locator('#consLoadExample').click();
  await page.locator('#consClear').click();

  await page.locator('.tab[data-tab="playground"]').click();
  const spawns = page.locator('[data-spawn]');
  for (let index = 0; index < await spawns.count(); index++) {
    await spawns.nth(index).click();
  }
  await page.locator('#pgCanvas').click({ position: { x: 30, y: 30 } });
  await page.locator('#pgClear').click();
}
