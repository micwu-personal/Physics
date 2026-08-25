import { expect, test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { expectCanvasRendered } from './helpers/rendering.js';
import { preparePage, setRange } from './helpers/runtime.js';

const path = '/physics/solar-system-galaxy.html';

async function canvasSignature(canvas) {
  return canvas.evaluate(element => {
    const { data } = element.getContext('2d').getImageData(0, 0, element.width, element.height);
    let hash = 2166136261;
    const stride = Math.max(4, Math.floor(data.length / 4096 / 4) * 4);
    for (let index = 0; index < data.length; index += stride) {
      hash = Math.imul(hash ^ data[index], 16777619);
    }
    return hash >>> 0;
  });
}

function numericText(value) {
  return Number.parseFloat(String(value).replace(/[^\d.-]/g, ''));
}

for (const language of ['en', 'zh-CN']) {
  test(`Cosmic address tooltips and Solar reach remain legible in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause', reducedMotion: 'reduce' });

    await expectCanvasRendered(page.locator('#addressCanvas'));
    await page.locator('[data-address-scale="local"]').click();
    const hotspots = page.locator('.address-hotspot');
    await expect(hotspots).toHaveCount(10);
    const trappistHotspot = page.locator('[data-system-id="trappist"]');
    await expect(trappistHotspot).toHaveAttribute('aria-label', /TRAPPIST-1.*40\.70/);
    await trappistHotspot.hover();
    await expect(page.locator('#addressTooltip')).toContainText('TRAPPIST-1');
    await expect(page.locator('#addressTooltip')).toContainText('40.70');
    await page.keyboard.press('Escape');

    const targetSizes = await hotspots.evaluateAll(buttons => buttons.map(button => {
      const rect = button.getBoundingClientRect();
      return { height: rect.height, width: rect.width };
    }));
    for (const size of targetSizes) {
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }

    const labelLayout = await page.evaluate(() => window.__cosmicAtlas.addressLabelLayout);
    for (const side of ['left', 'right']) {
      const positions = labelLayout.filter(item => item.side === side).map(item => item.y).sort((a, b) => a - b);
      for (let index = 1; index < positions.length; index++) {
        expect(positions[index] - positions[index - 1], `${side} address labels should not overlap`).toBeGreaterThanOrEqual(43);
      }
    }

    const firstHotspot = hotspots.first();
    await firstHotspot.hover();
    await expect(page.locator('#addressTooltip')).toBeVisible();
    await expect(page.locator('#addressTooltip')).toContainText(language === 'en' ? 'light-years' : '光年');
    await page.keyboard.press('Escape');
    await expect(page.locator('#addressTooltip')).toBeHidden();

    await firstHotspot.focus();
    await expect(page.locator('#addressTooltip')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(firstHotspot).toHaveAttribute('aria-expanded', 'true');
    if (language === 'en') await page.waitForTimeout(4300);
    await expect(page.locator('#addressTooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#addressTooltip')).toBeHidden();

    await page.setViewportSize({ width: 320, height: 700 });
    await page.waitForTimeout(120);
    const addressGeometry = await page.evaluate(() => {
      const stage = document.querySelector('.address-stage').getBoundingClientRect();
      const canvas = document.querySelector('#addressCanvas');
      const ratio = Math.min(Math.max(devicePixelRatio, 1), 2);
      const targets = [...document.querySelectorAll('.address-hotspot')].map(button => {
        const rect = button.getBoundingClientRect();
        return {
          centreX: rect.left + rect.width / 2,
          centreY: rect.top + rect.height / 2
        };
      });
      return {
        backingHeight: canvas.height / ratio,
        stage: { bottom: stage.bottom, height: stage.height, left: stage.left, right: stage.right, top: stage.top },
        targets
      };
    });
    expect(Math.abs(addressGeometry.backingHeight - addressGeometry.stage.height)).toBeLessThanOrEqual(1);
    for (const target of addressGeometry.targets) {
      expect(target.centreX).toBeGreaterThanOrEqual(addressGeometry.stage.left);
      expect(target.centreX).toBeLessThanOrEqual(addressGeometry.stage.right);
      expect(target.centreY).toBeGreaterThanOrEqual(addressGeometry.stage.top);
      expect(target.centreY).toBeLessThanOrEqual(addressGeometry.stage.bottom);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-address-scale="galaxy"]').click();
    await expect(hotspots).toHaveCount(0);

    const rangeStyles = await page.locator('.range-control input[type="range"]').evaluateAll(inputs => inputs.map(input => {
      const style = getComputedStyle(input);
      return {
        appearance: style.appearance,
        height: Number.parseFloat(style.height),
        touchAction: style.touchAction
      };
    }));
    for (const rangeStyle of rangeStyles) {
      expect(rangeStyle.height).toBeGreaterThanOrEqual(44);
      expect(rangeStyle.touchAction).toBe('none');
      expect(rangeStyle.appearance).toBe('none');
    }
    const reachControl = page.locator('#reachControl');
    await reachControl.scrollIntoViewIfNeeded();
    const reachControlBox = await reachControl.boundingBox();
    expect(reachControlBox.height).toBeGreaterThanOrEqual(44);
    await reachControl.dispatchEvent('pointerdown', { isPrimary: true, pointerId: 81, pointerType: 'touch' });

    await page.locator('[data-solar-scale="reservoirs"]').click();
    await page.locator('[data-solar-object="eris"]').click();
    await expect(page.locator('#solarSelection')).toContainText(language === 'en' ? 'Eris' : '阋神星');
    await setRange(reachControl, Math.log10(100000));
    await reachControl.dispatchEvent('pointerup', { isPrimary: true, pointerId: 81, pointerType: 'touch' });
    await expect(page.locator('#reachSummary')).toContainText(language === 'en' ? 'tidal reach' : '潮汐范围');
    await expect(page.locator('#reachSummary')).toContainText(language === 'en' ? 'anisotropic' : '方向性');
    await expect(page.locator('[data-reach-au="100000"]')).toBeVisible();

    const initialMotion = await page.evaluate(() => ({
      document: document.documentElement.dataset.motion,
      localAnimations: window.__cosmicAtlas.state.playing.size
    }));
    expect(initialMotion).toEqual({ document: 'paused', localAnimations: 0 });
    await assertNoErrors(errors);
  });

  test(`Gravity-assist geometry and continuous Voyager timeline respond in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });

    await setRange(page.locator('#missionYear'), 1989.7);
    await page.locator('[data-mission-filter="voyager2"]').click();
    await expect(page.locator('#missionEra')).toContainText(language === 'en' ? 'Neptune' : '海王星');
    await expect(page.locator('#missionLedger')).toContainText(language === 'en' ? 'Neptune and Triton flyby' : '飞越海王星与海卫一');

    const switchMetrics = await page.locator('.assist-switch').evaluate(element => {
      const selected = element.querySelector('[aria-selected="true"]');
      const unselected = element.querySelector('[aria-selected="false"]');
      return {
        radius: getComputedStyle(element).borderRadius,
        selectedBackground: getComputedStyle(selected).backgroundColor,
        selectedHeight: selected.getBoundingClientRect().height,
        unselectedBackground: getComputedStyle(unselected).backgroundColor
      };
    });
    expect(switchMetrics.radius).not.toBe('0px');
    expect(switchMetrics.selectedBackground).not.toBe(switchMetrics.unselectedBackground);
    expect(switchMetrics.selectedHeight).toBeGreaterThanOrEqual(44);

    await setRange(page.locator('#closestApproach'), 20);
    const shallowTurn = numericText(await page.locator('#turnAngleOutput').textContent());
    await setRange(page.locator('#closestApproach'), 1.5);
    const deepTurn = numericText(await page.locator('#turnAngleOutput').textContent());
    expect(deepTurn).toBeGreaterThan(shallowTurn);

    await setRange(page.locator('#encounterSide'), -1);
    await expect(page.locator('#assistDelta')).toContainText('-');
    await setRange(page.locator('#encounterSide'), 1);
    await expect(page.locator('#assistDelta')).toContainText('+');
    await expect(page.locator('#assistRelative')).toContainText(language === 'en' ? 'both ways' : '两端');
    const pathGeometry = await page.evaluate(() => {
      const api = window.__cosmicAtlas;
      const values = api.assistValues();
      const incoming = api.assistPathVector(values.incomingRelative);
      const outgoing = api.assistPathVector(values.outgoingRelative);
      const angle = Math.acos(Math.max(-1, Math.min(1, incoming.x * outgoing.x + incoming.y * outgoing.y))) * 180 / Math.PI;
      return { angle, incoming, outgoing, turnAngle: values.turnAngle };
    });
    expect(Math.hypot(pathGeometry.incoming.x, pathGeometry.incoming.y)).toBeCloseTo(1, 5);
    expect(Math.hypot(pathGeometry.outgoing.x, pathGeometry.outgoing.y)).toBeCloseTo(1, 5);
    expect(pathGeometry.angle).toBeCloseTo(pathGeometry.turnAngle, 4);

    const assistCanvas = page.locator('#assistCanvas');
    const beforePlayback = await canvasSignature(assistCanvas);
    await page.locator('#assistPlay').click();
    await page.waitForTimeout(180);
    expect(await canvasSignature(assistCanvas)).not.toBe(beforePlayback);
    await page.locator('#assistPlay').click();

    await page.locator('#vectorTab').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#voyagerTab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-assist-panel="voyager"]')).toBeVisible();

    const datedEncounters = [
      [1979.52, language === 'en' ? 'Jupiter' : '木星', language === 'en' ? '9 Jul 1979' : '1979 年 7 月 9 日'],
      [1981.65, language === 'en' ? 'Saturn' : '土星', language === 'en' ? '26 Aug 1981' : '1981 年 8 月 26 日'],
      [1986.07, language === 'en' ? 'Uranus' : '天王星', language === 'en' ? '24 Jan 1986' : '1986 年 1 月 24 日'],
      [1989.65, language === 'en' ? 'Neptune' : '海王星', language === 'en' ? '25 Aug 1989' : '1989 年 8 月 25 日']
    ];
    const signatures = [];
    for (const [year, planet, date] of datedEncounters) {
      await setRange(page.locator('#voyagerEncounter'), year);
      await expect(page.locator('#voyagerAssistSummary')).toContainText(planet);
      await expect(page.locator('#voyagerAssistSummary')).toContainText(date);
      signatures.push(await canvasSignature(assistCanvas));
    }
    expect(new Set(signatures).size).toBe(datedEncounters.length);
    await setRange(page.locator('#voyagerEncounter'), 1981.68);
    await expect(page.locator('#voyagerEncounterOutput')).toContainText(language === 'en' ? 'teaching interpolation' : '教学插值');

    const pathContinuity = await page.evaluate(() => {
      const first = window.__cosmicAtlas.voyagerPosition(1984.00);
      const second = window.__cosmicAtlas.voyagerPosition(1984.02);
      return Math.hypot(second.x - first.x, second.y - first.y);
    });
    expect(pathContinuity).toBeGreaterThan(0);
    expect(pathContinuity).toBeLessThan(12);

    await setRange(page.locator('#voyagerEncounter'), 1982);
    const beforeYear = Number(await page.locator('#voyagerEncounter').inputValue());
    await page.locator('#assistPlay').click();
    await page.waitForTimeout(180);
    const afterYear = Number(await page.locator('#voyagerEncounter').inputValue());
    expect(afterYear).toBeGreaterThan(beforeYear);
    await page.locator('#assistPlay').click();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#gravity-assist').evaluate(element => element.scrollIntoView());
    const tabOverlap = await page.evaluate(() => {
      const index = document.querySelector('.topic-index').getBoundingClientRect();
      const tabs = document.querySelector('.assist-switch').getBoundingClientRect();
      return Math.max(0, Math.min(index.bottom, tabs.bottom) - Math.max(index.top, tabs.top));
    });
    expect(tabOverlap).toBeLessThanOrEqual(1);
    await assertNoErrors(errors);
  });

  test(`Milky Way rotation, assembly, and observer localizer stay coherent in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });

    await expect(page.locator('.orientation-note')).toContainText(language === 'en' ? 'clockwise on this screen' : '屏幕上为顺时针');
    const galaxyCanvas = page.locator('#galaxyCanvas');
    const beforeRotation = await canvasSignature(galaxyCanvas);
    const angleBefore = await page.evaluate(() => window.__cosmicAtlas.state.galaxyAngle);
    await page.locator('#galaxyRotate').click();
    await page.waitForTimeout(180);
    const angleAfter = await page.evaluate(() => window.__cosmicAtlas.state.galaxyAngle);
    expect(angleAfter).toBeGreaterThan(angleBefore);
    expect(await canvasSignature(galaxyCanvas)).not.toBe(beforeRotation);
    await page.locator('#galaxyRotate').click();

    await page.locator('[data-galaxy-layer="matter"]').click();
    await expect(page.locator('#galaxySummary')).toContainText(language === 'en' ? 'Inferred gravitating mass' : '推断的引力质量');
    await page.locator('[data-galaxy-view="edge"]').click();
    const edgeStructure = await canvasSignature(galaxyCanvas);
    await page.locator('[data-galaxy-layer="neighbors"]').click();
    await expect(page.locator('[data-galaxy-view="face"]')).toBeDisabled();
    await expect(page.locator('[data-galaxy-view="edge"]')).toBeDisabled();
    await expect(page.locator('#galaxySummary')).toContainText(language === 'en' ? 'relative-layout schematic' : '相对布局示意');
    expect(await canvasSignature(galaxyCanvas)).not.toBe(edgeStructure);

    const blends = await page.evaluate(() => ({
      before: window.__cosmicAtlas.historyBlendValues(2.19),
      after: window.__cosmicAtlas.historyBlendValues(2.21)
    }));
    expect(blends.before.diskAmount).toBeGreaterThan(0);
    expect(blends.before.fragmentFade).toBeGreaterThan(0);
    expect(Math.abs(blends.after.diskAmount - blends.before.diskAmount)).toBeLessThan(0.01);
    expect(Math.abs(blends.after.fragmentFade - blends.before.fragmentFade)).toBeLessThan(0.01);
    await setRange(page.locator('#galaxyTime'), 1);
    const earlyFrame = await canvasSignature(page.locator('#galaxyHistoryCanvas'));
    await setRange(page.locator('#galaxyTime'), 4.5);
    expect(await canvasSignature(page.locator('#galaxyHistoryCanvas'))).not.toBe(earlyFrame);
    await expect(page.locator('.transition-note')).toContainText(language === 'en' ? 'fragments' : '碎片');

    const localizer = page.locator('#skyLocalizerCanvas');
    await expectCanvasRendered(localizer);
    const localizerBefore = await canvasSignature(localizer);
    await page.locator('#observerPosition').selectOption('inner');
    await setRange(page.locator('#skyDirection'), 90);
    await setRange(page.locator('#skyElevation'), 35);
    await expect(page.locator('#skyLocalizerSummary')).toContainText('l=90°');
    await expect(page.locator('#skyLocalizerSummary')).toContainText('b=+35°');
    expect(await canvasSignature(localizer)).not.toBe(localizerBefore);
    await expect(page.locator('#skySummary')).toContainText(language === 'en' ? 'Inner disk' : '内盘');

    await page.locator('#observerPosition').selectOption('halo');
    await setRange(page.locator('#skyDirection'), 0);
    await setRange(page.locator('#skyElevation'), 0);
    await expect(page.locator('#skySgrStatus')).toContainText('b=-21.8°');
    const haloGeometry = await page.evaluate(() => {
      const observer = window.__cosmicAtlas.state.observerPosition;
      const position = window.__cosmicAtlas.observerPositions[observer];
      const centreElevation = window.__cosmicAtlas.galacticCentreElevation(position);
      return {
        centreElevation,
        separation: window.__cosmicAtlas.sphericalAngularDistance(0, centreElevation, 0, centreElevation)
      };
    });
    expect(haloGeometry.centreElevation).toBeCloseTo(-21.8, 1);
    expect(haloGeometry.separation).toBeCloseTo(0, 5);
    await setRange(page.locator('#skyElevation'), Math.round(haloGeometry.centreElevation));
    await expect(page.locator('#skySgrStatus')).toContainText(language === 'en' ? 'Direction marked' : '方向已标');

    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page, { sweep: true });
    await assertNoErrors(errors);
  });
}
