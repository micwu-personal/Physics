import { expect, test } from '@playwright/test';
import {
  captureRendering,
  expectCanvasRendered,
  expectNotClipped,
  expectSvgRendered,
  prepareRenderingPage,
  setRangeValue,
  stepVisualClock
} from './helpers/rendering.js';

const locales = ['en', 'zh-CN'];

test.describe('deterministic scientific renderers', () => {
  test.describe('Big Bang', () => {
    for (const language of locales) {
      test(`time machine, composition, and scale in ${language}`, async ({ page }) => {
        await prepareRenderingPage(page, '/big-bang/', language);
        await stepVisualClock(page);

        const background = page.locator('#bgCanvas');
        await expectCanvasRendered(background);
        if (language === 'en') {
          await captureRendering(background, 'big-bang-background-source.png');
        }

        await page.locator('.tab[data-tab="machine"]').click();
        const spacetimeDiagram = page.locator('#spacetimeSvg');
        const slider = page.locator('#timeSlider');
        for (const [epoch, label] of [[0, 'planck'], [480, 'early'], [735, 'stars']]) {
          await setRangeValue(slider, epoch);
          await expectSvgRendered(spacetimeDiagram);
          await expect(page.locator('#mpEpoch')).not.toHaveText('—');
          await captureRendering(page.locator('.machine'), `big-bang-machine-${label}-${language}.png`);
        }

        await page.locator('.tab[data-tab="composition"]').click();
        await expect(page.locator('#compGrid svg')).toHaveCount(3);
        for (const svg of await page.locator('#compGrid svg').all()) {
          await expectSvgRendered(svg);
        }
        await captureRendering(page.locator('#tab-composition'), `big-bang-composition-${language}.png`);

        await page.locator('.tab[data-tab="scale"]').click();
        await expect(page.locator('#scaleWrap .scale-row')).toHaveCount(8);
        await captureRendering(page.locator('#tab-scale'), `big-bang-scale-${language}.png`);
      });
    }

    test('generated mobile bundle renders on a narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await prepareRenderingPage(page, '/big-bang/mobile/index.html', 'zh-CN');
      await page.locator('.tab[data-tab="machine"]').click();
      await setRangeValue(page.locator('#timeSlider'), 700);
      await expectSvgRendered(page.locator('#spacetimeSvg'));
      await expect(page.locator('#mpTime')).not.toHaveText('—');
      await captureRendering(page.locator('.machine'), 'big-bang-mobile-machine-zh-CN.png');
    });
  });

  test.describe('Periodic Table', () => {
    async function openIron(page, path, language) {
      await prepareRenderingPage(page, path, language);
      await expect(page.locator('#viewToolbar')).toBeVisible();
      await page.locator('.cell[data-z="26"]').click();
      await stepVisualClock(page, 0);
      await page.waitForTimeout(100);
      await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    }

    for (const language of locales) {
      test(`noble-gas atomic orbitals render without hybridization in ${language}`, async ({ page }) => {
        await prepareRenderingPage(page, '/periodic-table/', language);
        await expect(page.locator('#viewToolbar')).toBeVisible();
        await page.locator('.cell[data-z="2"]').click();
        await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
        await expect(page.locator('#orbitalTabs button')).toHaveCount(1);
        await expect(page.locator('#orbitalTabs button')).toHaveText('s');
        const expected = language === 'zh-CN'
          ? '该元素通常不涉及杂化轨道'
          : 'No hybridization typically shown for this element';
        await expect(page.locator('#orbitalTabs')).toContainText(expected);
        await expect(page.locator('#dHybridText')).not.toContainText('undefined');
        await expect(page.locator('#dHybridText')).not.toBeEmpty();
        expect(await page.evaluate(() => currentHybrid)).toBe('s');
        await expectCanvasRendered(page.locator('#orbitalCanvas'));
        await captureRendering(
          page.locator('#orbitalCanvas').locator('xpath=ancestor::div[contains(@class,"d-viz-card")][1]'),
          `periodic-noble-atomic-only-${language}.png`
        );
        await page.locator('.cell[data-z="26"]').click();
        expect(await page.locator('#orbitalTabs button').count()).toBeGreaterThan(1);
        expect(await page.evaluate(() => currentHybrid)).not.toBeNull();
        await expect(page.locator('#dHybridText')).not.toContainText('undefined');
      });
    }

    test('generated mobile bundle renders noble-gas atomic orbitals without hybridization', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await prepareRenderingPage(page, '/periodic-table/mobile/index.html', 'zh-CN');
      await page.locator('.cell[data-z="2"]').click();
      await expect(page.locator('#orbitalTabs button')).toHaveCount(1);
      await expect(page.locator('#orbitalTabs')).toContainText('该元素通常不涉及杂化轨道');
      expect(await page.evaluate(() => currentHybrid)).toBe('s');
      await expectCanvasRendered(page.locator('#orbitalCanvas'));
      await captureRendering(
        page.locator('#orbitalCanvas').locator('xpath=ancestor::div[contains(@class,"d-viz-card")][1]'),
        'periodic-mobile-noble-atomic-zh-CN.png'
      );
    });

    for (const language of locales) {
      test(`atomic, molecular, ligand, and nuclide renderers in ${language}`, async ({ page }) => {
        await openIron(page, '/periodic-table/', language);

        await expectCanvasRendered(page.locator('#bohrCanvas'));
        await captureRendering(
          page.locator('#bohrCanvas').locator('xpath=ancestor::div[contains(@class,"d-viz-card")][1]'),
          `periodic-bohr-${language}.png`
        );

        const orbitalButtons = page.locator('#orbitalTabs button');
        expect(await orbitalButtons.count()).toBeGreaterThan(1);
        for (let index = 0; index < await orbitalButtons.count(); index++) {
          const button = orbitalButtons.nth(index);
          await button.click();
          await expectCanvasRendered(page.locator('#orbitalCanvas'));
          if (index === 0 || index === (await orbitalButtons.count()) - 1) {
            await captureRendering(
              page.locator('#orbitalCanvas').locator('xpath=ancestor::div[contains(@class,"d-viz-card")][1]'),
              `periodic-orbital-${index}-${language}.png`
            );
          }
        }

        const molecule = page.locator('.mol3d-card').first();
        await expect(molecule).toBeVisible();
        await expectCanvasRendered(molecule.locator('canvas'));
        await captureRendering(molecule, `periodic-molecule-${language}.png`);

        await expect(page.locator('#lfBlock')).toBeVisible();
        await page.locator('#lfBlock [data-lig="CN"]').click();
        await expectCanvasRendered(page.locator('#lfDiagram'));
        await captureRendering(page.locator('#lfBlock'), `periodic-ligand-field-${language}.png`);

        await page.locator('#nuclideOpenBtn').click();
        await expectCanvasRendered(page.locator('#nuclideCanvas'), 100);
        await captureRendering(page.locator('#nuclideView'), `periodic-nuclide-chart-${language}.png`);
      });
    }

    test('reaction renderer exposes deterministic approach, collision, and products', async ({ page }) => {
      await openIron(page, '/periodic-table/', 'en');
      await page.locator('#dRx .rx-play').first().click();
      const reaction = page.locator('#rxAnimCanvas');

      await expectCanvasRendered(reaction);
      await captureRendering(page.locator('#rxAnimBox'), 'periodic-reaction-approach.png');
      await stepVisualClock(page, 2600);
      await expectCanvasRendered(reaction);
      await captureRendering(page.locator('#rxAnimBox'), 'periodic-reaction-collision.png');
      await stepVisualClock(page, 3000);
      await expectCanvasRendered(reaction);
      await captureRendering(page.locator('#rxAnimBox'), 'periodic-reaction-products.png');
    });

    test('property overlays and historical/origin timelines render stable states', async ({ page }) => {
      await prepareRenderingPage(page, '/periodic-table/', 'en');
      await expect(page.locator('#viewToolbar')).toBeVisible();

      for (const overlay of ['radius', 'ie', 'en', 'density', 'melt', 'year', 'origin', 'abundance']) {
        await page.locator(`#viewToolbar [data-ov="${overlay}"]`).click();
        expect(await page.locator('.cell.overlay-on').count()).toBeGreaterThan(50);
      }
      await page.locator('#viewToolbar [data-ov="density"]').click();
      await captureRendering(page.locator('.pt-wrap'), 'periodic-overlay-density.png');
      await page.locator('#viewToolbar [data-ov="origin"]').click();
      await captureRendering(page.locator('.pt-wrap'), 'periodic-overlay-origin.png');

      await page.locator('#tlToggleBtn').click();
      await setRangeValue(page.locator('#tlSlider'), 1871);
      await expect(page.locator('.cell.tl-predicted')).toHaveCount(4);
      await captureRendering(page.locator('#timelinePanel'), 'periodic-discovery-timeline-1871.png');
      await captureRendering(page.locator('.pt-wrap'), 'periodic-discovery-grid-1871.png');

      await page.locator('#tlToggleBtn').click();
      await page.evaluate(() => {
        window.setTimeout = (callback, delay = 0, ...args) => {
          if (delay === 0) callback(...args);
          return 0;
        };
      });
      await page.locator('#cosmicPlayBtn').click();
      await expect(page.locator('#cosmicBanner')).toHaveClass(/on/);
      expect(await page.locator('.cell.not-yet-forged').count()).toBeGreaterThan(50);
      await captureRendering(page.locator('#cosmicBanner'), 'periodic-origin-timeline-big-bang.png');
      await captureRendering(page.locator('.pt-wrap'), 'periodic-origin-grid-big-bang.png');
      await page.evaluate(() => window.__D1.stop());
    });

    test('generated mobile bundle renders atomic visuals on a narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openIron(page, '/periodic-table/mobile/index.html', 'zh-CN');
      await expectCanvasRendered(page.locator('#bohrCanvas'));
      await expectCanvasRendered(page.locator('#orbitalCanvas'));
      await captureRendering(page.locator('.d-viz-row'), 'periodic-mobile-atomic-zh-CN.png');
    });
  });

  test.describe('Particle Zoo', () => {
    async function openParticleZoo(page, path, language) {
      await prepareRenderingPage(page, path, language);
      await page.evaluate(() => document.querySelector('#pgClear').click());
    }

    async function freezeBuilderFrame(page) {
      await page.evaluate(() => {
        buildStop();
        buildLastTimestamp = 0;
        bt = 0;
        drawBuild();
      });
    }

    for (const language of locales) {
      test(`builder composites and interaction SVGs in ${language}`, async ({ page }) => {
        await openParticleZoo(page, '/particle-zoo/', language);
        await page.locator('.tab[data-tab="builder"]').click();
        for (const part of ['u', 'u', 'd', 'e']) {
          await page.locator(`.tray-part[data-part="${part}"]`).click();
        }
        await stepVisualClock(page);
        await freezeBuilderFrame(page);
        await expectCanvasRendered(page.locator('#buildCanvas'));
        await expect(page.locator('#buildResult')).toHaveClass(/success/);
        await expect(page.locator('#buildResult')).toContainText(language === 'zh-CN' ? '氢' : 'Hydrogen');
        const hydrogenPixels = await page.locator('#buildCanvas').evaluate(canvas => canvas.toDataURL());
        await captureRendering(page.locator('#buildCanvas'), `particle-builder-hydrogen-${language}.png`);
        await captureRendering(page.locator('.build-out'), `particle-builder-result-${language}.png`);

        await page.locator('#clearBuild').click();
        await expect(page.locator('#buildResult')).toContainText(language === 'zh-CN' ? '尚未' : 'Nothing');
        for (const part of ['u', 'ubar']) {
          await page.locator(`.tray-part[data-part="${part}"]`).click();
        }
        await stepVisualClock(page);
        await freezeBuilderFrame(page);
        await expectCanvasRendered(page.locator('#buildCanvas'));
        await expect(page.locator('#buildResult')).toHaveClass(/success/);
        await expect(page.locator('#buildResult')).toContainText('π⁰');
        const mesonPixels = await page.locator('#buildCanvas').evaluate(canvas => canvas.toDataURL());
        expect(mesonPixels).not.toBe(hydrogenPixels);
        if (language === 'en') {
          await captureRendering(page.locator('#buildCanvas'), 'particle-builder-meson-en.png');
        }

        await page.locator('.tab[data-tab="forces"]').click();
        await page.evaluate(() => {
          setMotionMode('pause');
          ixStop();
          ixT = 0;
          IX_INSTANCES.forEach(instance => instance.anim(instance.el, 0));
        });
        const interactionSvgs = page.locator('#interactionsRoot .ix-card svg');
        expect(await interactionSvgs.count()).toBeGreaterThan(10);
        for (const svg of await interactionSvgs.all()) {
          await expectSvgRendered(svg);
        }
        for (const group of ['common', 'exchange', 'rare']) {
          await captureRendering(
            page.locator(`.ix-anim[data-group="${group}"]`),
            `particle-interactions-${group}-${language}.png`
          );
        }
      });
    }

    test('playground annihilation produces back-to-back photons', async ({ page }) => {
      await openParticleZoo(page, '/particle-zoo/', 'en');
      await page.locator('.tab[data-tab="playground"]').click();
      const state = await page.evaluate(() => {
        pgStop();
        pgParts = [];
        flashes = [];
        trails = false;
        const cx = W / 2;
        const cy = H / 2;
        pgParts.push(
          { type: 'electron', ...PG_TYPES.electron, x: cx - 2, y: cy, vx: 0.1, vy: 0, life: Infinity, trail: [] },
          { type: 'positron', ...PG_TYPES.positron, x: cx + 2, y: cy, vx: -0.1, vy: 0, life: Infinity, trail: [] }
        );
        step(1);
        step(12);
        return pgParts.map(part => ({ type: part.type, vx: part.vx, vy: part.vy }));
      });
      expect(state).toHaveLength(2);
      expect(state.every(part => part.type === 'photon')).toBe(true);
      expect(Math.abs(state[0].vx + state[1].vx)).toBeLessThan(1e-10);
      expect(Math.abs(state[0].vy + state[1].vy)).toBeLessThan(1e-10);
      await expectCanvasRendered(page.locator('#pgCanvas'));
      await captureRendering(page.locator('#pgCanvas'), 'particle-playground-annihilation.png');
    });

    test('all ten Physics Lab families including confinement render non-blank states', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openParticleZoo(page, '/particle-zoo/', 'en');
      await page.locator('.tab[data-tab="lab"]').click();
      await page.locator('#confAuto').uncheck();
      await page.locator('#confReset').click();
      await stepVisualClock(page);

      for (const id of ['conf', 'det', 'higgs']) {
        const canvas = page.locator(`#${id}Canvas`);
        await canvas.evaluate(element => element.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(50);
        await page.evaluate(() => dispatchEvent(new Event('resize')));
        await stepVisualClock(page);
        await expectCanvasRendered(canvas);
        await captureRendering(canvas, `particle-lab-${id}.png`);
      }

      await page.locator('.lab-subtab[data-lab-sub="advanced"]').click();
      await page.locator('#feynExample').click();
      await page.locator('#consLoadExample').click();
      await stepVisualClock(page, 120);
      for (const id of ['feyn', 'decay', 'osc', 'pdf', 'evd', 'cons', 'run']) {
        const canvas = page.locator(`#${id}Canvas`);
        await canvas.evaluate(element => element.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(50);
        await page.evaluate(() => dispatchEvent(new Event('resize')));
        await stepVisualClock(page);
        await expectCanvasRendered(canvas);
        await captureRendering(canvas, `particle-lab-${id}.png`);
      }
    });

    test('Physics Lab labels render in zh-CN', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openParticleZoo(page, '/particle-zoo/', 'zh-CN');
      await page.locator('.tab[data-tab="lab"]').click();
      await page.locator('.lab-subtab[data-lab-sub="advanced"]').click();
      await stepVisualClock(page);
      const runCard = page.locator('#runCanvas').locator('xpath=ancestor::div[contains(@class,"lab-card")][1]');
      await expectCanvasRendered(page.locator('#runCanvas'));
      await expect(runCard.locator('h3')).toContainText('耦合');
      await captureRendering(runCard, 'particle-lab-running-couplings-zh-CN.png');
    });

    test('generated mobile bundle renders builder and RGE canvas on a narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openParticleZoo(page, '/particle-zoo/mobile/index.html', 'en');
      await page.locator('.tab[data-tab="builder"]').click();
      for (const part of ['u', 'u', 'd', 'e']) {
        await page.locator(`.tray-part[data-part="${part}"]`).click();
      }
      await stepVisualClock(page);
      await freezeBuilderFrame(page);
      await expectCanvasRendered(page.locator('#buildCanvas'));
      await captureRendering(page.locator('.build-out'), 'particle-mobile-builder-result-en.png');

      await page.locator('.tab[data-tab="lab"]').click();
      await page.locator('.lab-subtab[data-lab-sub="advanced"]').click();
      await stepVisualClock(page);
      await expectCanvasRendered(page.locator('#runCanvas'));
      await captureRendering(page.locator('#runCanvas'), 'particle-mobile-rge-en.png');
    });
  });
});
