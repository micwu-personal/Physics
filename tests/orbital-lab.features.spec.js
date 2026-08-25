import { expect, test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { preparePage, setRange } from './helpers/runtime.js';

const path = '/physics/orbital-lab.html';

for (const language of ['en', 'zh-CN']) {
  test(`Orbital lab couples controls, geometry, and observer view in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await preparePage(page, path, language, { motionPreference: 'pause' });

    const workspace = page.locator('#orbitalWorkspace');
    await workspace.evaluate(element => element.scrollIntoView({ block: 'start' }));
    const bounds = await workspace.evaluate(element => {
      const control = element.querySelector('.control-rail').getBoundingClientRect();
      const system = element.querySelector('.system-panel').getBoundingClientRect();
      const observer = element.querySelector('.observer-panel').getBoundingClientRect();
      return {
        controlBottom: control.bottom,
        controlTop: control.top,
        observerBottom: observer.bottom,
        observerTop: observer.top,
        systemBottom: system.bottom,
        systemTop: system.top,
        viewport: innerHeight
      };
    });
    expect(bounds.controlTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.systemTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.observerTop).toBeGreaterThanOrEqual(-1);
    expect(bounds.systemBottom).toBeLessThanOrEqual(bounds.viewport + 1);
    expect(bounds.observerBottom).toBeLessThanOrEqual(bounds.viewport + 1);

    await setRange(page.locator('#dayControl'), 355);
    await setRange(page.locator('#latitudeControl'), 66.56);
    await setRange(page.locator('#timeControl'), 12);
    await expect(page.locator('#liveSummary')).toContainText(language === 'en' ? 'below the horizon' : '地平线下');
    await assertNoErrors(errors);
  });

  test(`Orbital lab distinguishes total, annular, partial, and lunar eclipses in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });
    await page.locator('[data-lab-mode="eclipses"]').click();
    await expect(page.locator('#orbitHint')).toBeHidden();
    await expect(page.locator('#systemCanvas')).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#systemCanvas')).toHaveAttribute('aria-label', language === 'en'
      ? 'Sun Earth Moon eclipse and shadow geometry; north is up'
      : '太阳地球月球食相与影区几何；北上南下');
    await expect(page.locator('#observerCanvas')).toHaveAttribute('aria-label', language === 'en'
      ? 'First-person eclipse observer view; north is up'
      : '第一人称食相观察视角；北上南下');
    await expect(page.locator('.axis-convention')).toContainText(language === 'en' ? 'north is up' : '北上南下');

    await setRange(page.locator('#distanceControl'), 356500);
    await setRange(page.locator('#alignmentControl'), 0);
    await setRange(page.locator('#observerControl'), 0);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Total solar eclipse' : '日全食');

    await setRange(page.locator('#distanceControl'), 406700);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Annular solar eclipse' : '日环食');

    await setRange(page.locator('#observerControl'), 0.04);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Partial solar eclipse' : '日偏食');
    await setRange(page.locator('#alignmentControl'), 0.4);
    await expect(page.locator('#alignmentOutput')).toContainText(language === 'en' ? 'north' : '北');
    await setRange(page.locator('#alignmentControl'), -0.4);
    await expect(page.locator('#alignmentOutput')).toContainText(language === 'en' ? 'south' : '南');
    await setRange(page.locator('#alignmentControl'), 0);
    await setRange(page.locator('#observerControl'), 0.5);
    await expect(page.locator('#observerSubtitle')).toContainText(language === 'en' ? 'south of the Sun' : '太阳以南');
    const northObserverGeometry = await page.evaluate(() => window.__orbitalLab.observerGeometry);
    expect(northObserverGeometry.kind).toBe('solar');
    expect(northObserverGeometry.northUp).toBe(true);
    expect(northObserverGeometry.moon.x).toBe(northObserverGeometry.sun.x);
    expect(northObserverGeometry.moon.y).toBeGreaterThan(northObserverGeometry.sun.y);
    await setRange(page.locator('#observerControl'), -0.5);
    await expect(page.locator('#observerSubtitle')).toContainText(language === 'en' ? 'north of the Sun' : '太阳以北');
    const southObserverGeometry = await page.evaluate(() => window.__orbitalLab.observerGeometry);
    expect(southObserverGeometry.moon.x).toBe(southObserverGeometry.sun.x);
    expect(southObserverGeometry.moon.y).toBeLessThan(southObserverGeometry.sun.y);
    await setRange(page.locator('#observerControl'), 0.01);
    await expect(page.locator('#observerOutput')).toContainText(language === 'en' ? 'north' : '北');
    await setRange(page.locator('#eclipseProgressControl'), -0.7);
    await expect(page.locator('#eclipseProgressOutput')).toContainText(language === 'en' ? 'Before maximum' : '食甚前');
    const beforeConjunction = await page.evaluate(() => ({
      view: window.__orbitalLab.observerGeometry,
      classification: window.__orbitalLab.eclipseGeometry().classification
    }));
    expect(beforeConjunction.view.moon.x).toBeLessThan(beforeConjunction.view.sun.x);
    const beforeSeparation = Math.hypot(
      beforeConjunction.view.moon.x - beforeConjunction.view.sun.x,
      beforeConjunction.view.moon.y - beforeConjunction.view.sun.y
    );
    expect(beforeConjunction.classification !== 'none').toBe(
      beforeSeparation < beforeConjunction.view.moon.radius + beforeConjunction.view.sun.radius
    );
    await setRange(page.locator('#eclipseProgressControl'), 0.7);
    await expect(page.locator('#eclipseProgressOutput')).toContainText(language === 'en' ? 'After maximum' : '食甚后');
    const afterConjunction = await page.evaluate(() => ({
      view: window.__orbitalLab.observerGeometry,
      classification: window.__orbitalLab.eclipseGeometry().classification
    }));
    expect(afterConjunction.view.moon.x).toBeGreaterThan(afterConjunction.view.sun.x);
    const afterSeparation = Math.hypot(
      afterConjunction.view.moon.x - afterConjunction.view.sun.x,
      afterConjunction.view.moon.y - afterConjunction.view.sun.y
    );
    expect(afterConjunction.classification !== 'none').toBe(
      afterSeparation < afterConjunction.view.moon.radius + afterConjunction.view.sun.radius
    );
    await setRange(page.locator('#eclipseProgressControl'), 0);
    await setRange(page.locator('#alignmentControl'), -1.35);
    await setRange(page.locator('#observerControl'), 1);
    const extremeCrossTrack = await page.evaluate(() => ({
      view: window.__orbitalLab.observerGeometry,
      classification: window.__orbitalLab.eclipseGeometry().classification
    }));
    const extremeSeparation = Math.hypot(
      extremeCrossTrack.view.moon.x - extremeCrossTrack.view.sun.x,
      extremeCrossTrack.view.moon.y - extremeCrossTrack.view.sun.y
    );
    expect(extremeCrossTrack.classification).toBe('none');
    expect(extremeSeparation).toBeGreaterThanOrEqual(
      extremeCrossTrack.view.moon.radius + extremeCrossTrack.view.sun.radius
    );
    await setRange(page.locator('#alignmentControl'), 0);
    await setRange(page.locator('#observerControl'), -0.5);
    await setRange(page.locator('#eclipseProgressControl'), 0);
    const alignmentBeforePlayback = await page.locator('#alignmentControl').inputValue();
    await page.locator('#playEclipse').click();
    await page.waitForTimeout(120);
    await page.locator('#playEclipse').click();
    expect(Number(await page.locator('#eclipseProgressControl').inputValue())).toBeGreaterThan(-1);
    await expect(page.locator('#alignmentControl')).toHaveValue(alignmentBeforePlayback);
    await setRange(page.locator('#eclipseProgressControl'), 0);

    await page.locator('[data-eclipse-type="lunar"]').click();
    await setRange(page.locator('#alignmentControl'), 0);
    await expect(page.locator('#metricValueA')).toContainText(language === 'en' ? 'Total lunar eclipse' : '月全食');
    await expect(page.locator('#systemLegend')).toContainText(language === 'en' ? 'Earth umbra' : '地球本影');
    await expect(page.locator('#systemLegend')).toContainText(language === 'en' ? 'Earth penumbra' : '地球半影');
    await expect(page.locator('#systemLegend')).not.toContainText(language === 'en' ? 'antumbra' : '伪本影');
    for (const distance of [356500, 406700]) {
      await setRange(page.locator('#distanceControl'), distance);
      const scaledShadow = await page.evaluate(() => ({
        system: window.__orbitalLab.systemGeometry,
        physical: window.__orbitalLab.eclipseGeometry()
      }));
      expect(scaledShadow.system.umbraRadius / scaledShadow.system.scale).toBeCloseTo(
        scaledShadow.physical.lunarUmbraRadius,
        6
      );
      expect(scaledShadow.system.penumbraRadius / scaledShadow.system.scale).toBeCloseTo(
        scaledShadow.physical.lunarPenumbraRadius,
        6
      );
    }
    const axisMap = await page.evaluate(() => ({
      north: window.__orbitalLab.northToCanvasY(100, 1, 10),
      south: window.__orbitalLab.northToCanvasY(100, -1, 10)
    }));
    expect(axisMap.north).toBeLessThan(100);
    expect(axisMap.south).toBeGreaterThan(100);
    await setRange(page.locator('#alignmentControl'), 0.5);
    const lunarGeometry = await page.evaluate(() => window.__orbitalLab.observerGeometry);
    expect(lunarGeometry.kind).toBe('lunar');
    expect(lunarGeometry.shadow.x).toBe(lunarGeometry.moon.x);
    expect(lunarGeometry.shadow.y).toBeGreaterThan(lunarGeometry.moon.y);
    await setRange(page.locator('#eclipseProgressControl'), -0.5);
    await expect(page.locator('#eclipseProgressOutput')).toContainText(language === 'en' ? 'Before maximum' : '食甚前');
    const lunarBefore = await page.evaluate(() => ({
      view: window.__orbitalLab.observerGeometry,
      classification: window.__orbitalLab.eclipseGeometry().classification
    }));
    await setRange(page.locator('#eclipseProgressControl'), 0.5);
    await expect(page.locator('#eclipseProgressOutput')).toContainText(language === 'en' ? 'After maximum' : '食甚后');
    const lunarAfter = await page.evaluate(() => ({
      view: window.__orbitalLab.observerGeometry,
      classification: window.__orbitalLab.eclipseGeometry().classification
    }));
    expect(lunarBefore.view.moon.x).toBeLessThan(lunarBefore.view.shadow.x);
    expect(lunarAfter.view.moon.x).toBeGreaterThan(lunarAfter.view.shadow.x);
    expect(lunarBefore.view.shadow.x).toBe(lunarAfter.view.shadow.x);
    for (const state of [lunarBefore, lunarAfter]) {
      const separation = Math.hypot(
        state.view.moon.x - state.view.shadow.x,
        state.view.moon.y - state.view.shadow.y
      );
      const touchesUmbra = separation - state.view.moon.radius < state.view.shadow.umbraRadius;
      const touchesPenumbra = separation - state.view.moon.radius < state.view.shadow.penumbraRadius;
      expect(state.classification === 'partial-lunar' || state.classification === 'total-lunar').toBe(touchesUmbra);
      expect(state.classification !== 'none').toBe(touchesPenumbra);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page);
    await assertNoErrors(errors);
  });

  test(`Orbital lab restores presets and complementary season views in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition(success) {
            success({ coords: { latitude: 51.5, longitude: -0.1 } });
          }
        }
      });
    });
    await preparePage(page, path, language, { motionPreference: 'pause' });

    await expect(page.locator('#seasonCanvas')).toBeVisible();
    await expect(page.locator('#horizonCanvas')).toBeVisible();
    await expect(page.locator('#annualCanvas')).toBeVisible();
    const expectedToday = await page.evaluate(() => {
      const now = new Date();
      const ordinal = Math.floor(
        (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 1)) / 86400000
      );
      const year = now.getFullYear();
      const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      return ordinal - (leap && (now.getMonth() > 1 || (now.getMonth() === 1 && now.getDate() === 29)) ? 1 : 0);
    });
    await expect(page.locator('#dayControl')).toHaveValue(String(expectedToday));
    const leapCalendar = await page.evaluate(() => ({
      dates: [
        new Date(2024, 1, 29),
        new Date(2024, 2, 1),
        new Date(2024, 5, 21),
        new Date(2024, 11, 31)
      ].map(window.__orbitalLab.dayOfYear),
      leapDefault: window.__orbitalLab.initialDate('', new Date(2024, 1, 29)),
      leapLabel: window.__orbitalLab.displayDateLabel(58, true),
      queryDefault: window.__orbitalLab.initialDate('?day=171', new Date(2024, 1, 29)),
      years: [1900, 2000, 2023, 2024].map(window.__orbitalLab.isLeapYear)
    }));
    expect(leapCalendar.dates).toEqual([58, 59, 171, 364]);
    expect(leapCalendar.leapDefault).toEqual({ day: 58, leapDay: true });
    expect(leapCalendar.leapLabel).toBe(language === 'en' ? '29 Feb' : '2月29日');
    expect(leapCalendar.queryDefault).toEqual({ day: 171, leapDay: false });
    expect(leapCalendar.years).toEqual([false, true, false, true]);
    await expect(page.locator('#systemLegend')).toContainText(language === 'en' ? 'eastward rotation' : '向东自转');
    await expect(page.locator('#observerSubtitle')).toContainText(language === 'en' ? 'east is left' : '东方在左');
    await expect(page.locator('#horizonDescription')).toContainText(language === 'en' ? 'N → E → S → W' : '北 → 东 → 南 → 西');
    const orientation = await page.evaluate(() => ({
      east: window.__orbitalLab.skyDomePoint(0, 90, 100, 100, 80),
      west: window.__orbitalLab.skyDomePoint(0, 270, 100, 100, 80),
      orbitStart: window.__orbitalLab.counterClockwiseEllipsePoint(0, 100, 100, 80, 40),
      orbitLater: window.__orbitalLab.counterClockwiseEllipsePoint(0.1, 100, 100, 80, 40),
      earthStart: window.__orbitalLab.orbitScreenPoint(171, 100, 100, 80, 40),
      earthLater: window.__orbitalLab.orbitScreenPoint(172, 100, 100, 80, 40),
      spinStart: window.__orbitalLab.projectEarthPoint(0, 0, 0, 1),
      spinLater: window.__orbitalLab.projectEarthPoint(0, 0, 0.1, 1),
      equinoxNorthPole: window.__orbitalLab.northPoleIllumination(79),
      summerNorthPole: window.__orbitalLab.northPoleIllumination(171),
      winterNorthPole: window.__orbitalLab.northPoleIllumination(355),
      rotation6: window.__orbitalLab.earthRotationAngle(6),
      rotation7: window.__orbitalLab.earthRotationAngle(7)
    }));
    expect(orientation.east.x).toBeLessThan(100);
    expect(orientation.west.x).toBeGreaterThan(100);
    expect(orientation.orbitLater.y).toBeLessThan(orientation.orbitStart.y);
    expect(orientation.earthLater.y).toBeLessThan(orientation.earthStart.y);
    expect(
      orientation.spinStart.x * orientation.spinLater.y - orientation.spinStart.y * orientation.spinLater.x
    ).toBeLessThan(0);
    expect(Math.abs(orientation.equinoxNorthPole)).toBeLessThan(0.02);
    expect(orientation.summerNorthPole).toBeGreaterThan(0.35);
    expect(orientation.winterNorthPole).toBeLessThan(-0.35);
    expect(orientation.rotation7).toBeGreaterThan(orientation.rotation6);
    await expect(page.locator('#systemLegend')).toContainText(language === 'en' ? 'counter-clockwise' : '逆时针');
    await setRange(page.locator('#dayControl'), 171);
    await setRange(page.locator('#latitudeControl'), 39.9);
    for (const hour of [0, 12]) {
      await setRange(page.locator('#timeControl'), hour);
      const lighting = await page.evaluate(() => ({
        altitude: window.__orbitalLab.solarPosition(
          window.__orbitalLab.state.day,
          window.__orbitalLab.state.latitude,
          window.__orbitalLab.state.hour
        ).altitude,
        marker: window.__orbitalLab.systemGeometry.observer.illumination
      }));
      expect(Math.sign(lighting.marker)).toBe(Math.sign(lighting.altitude));
    }
    await setRange(page.locator('#timeControl'), 6);
    const morningObserver = await page.evaluate(() => window.__orbitalLab.systemGeometry);
    await setRange(page.locator('#timeControl'), 12);
    const noonObserver = await page.evaluate(() => window.__orbitalLab.systemGeometry);
    expect(Math.hypot(
      morningObserver.observer.x - noonObserver.observer.x,
      morningObserver.observer.y - noonObserver.observer.y
    )).toBeGreaterThan(2);
    expect(morningObserver.rotation).not.toBe(noonObserver.rotation);
    const sliderTouchMetrics = await page.locator('#latitudeControl').evaluate(element => ({
      height: element.getBoundingClientRect().height,
      touchAction: getComputedStyle(element).touchAction
    }));
    expect(sliderTouchMetrics.height).toBeGreaterThanOrEqual(44);
    expect(sliderTouchMetrics.touchAction).toBe('none');

    await page.locator('#useLocation').click();
    await expect(page.locator('#latitudeOutput')).toContainText('51.5');
    await expect(page.locator('#locationStatus')).toContainText(language === 'en' ? 'Using latitude' : '已使用纬度');

    await page.locator('[data-latitude="-66.56"]').click();
    await expect(page.locator('#latitudeOutput')).toContainText('66.6');
    await page.locator('[data-latitude="39.9"]').click();
    await expect(page.locator('[data-latitude="39.9"]')).toHaveAttribute('aria-pressed', 'true');

    await setRange(page.locator('#dayControl'), 279);
    await expect(page.locator('#seasonBadge')).toContainText(language === 'en' ? 'autumn' : '秋季');
    await expect(page.locator('#metricValueE')).toHaveText(/[+-]\d+\.\d°/);
    await expect(page.locator('#metricValueF')).toContainText(language === 'en' ? 'Subsolar point' : '太阳直射点');

    const sunrise = page.locator('[data-solar-event="sunrise"]');
    await sunrise.click();
    await expect(sunrise).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#timeOutput')).not.toHaveText('12:00');
    await page.locator('[data-hour="12"]').click();
    await expect(page.locator('#timeOutput')).toHaveText('12:00');
    await setRange(page.locator('#dayControl'), 171);
    await setRange(page.locator('#latitudeControl'), 10);

    const orbit = page.locator('#systemCanvas');
    await orbit.scrollIntoViewIfNeeded();
    let box = await orbit.boundingBox();
    const orbitGeometry = await page.evaluate(() => window.__orbitalLab.systemGeometry.orbit);
    await orbit.click({ position: { x: orbitGeometry.cx, y: orbitGeometry.cy + orbitGeometry.ry } });
    await expect.poll(async () => Number(await page.locator('#dayControl').inputValue())).toBeGreaterThan(70);
    await expect.poll(async () => Number(await page.locator('#dayControl').inputValue())).toBeLessThan(90);
    const clickedDay = Number(await page.locator('#dayControl').inputValue());
    await orbit.scrollIntoViewIfNeeded();
    box = await orbit.boundingBox();
    await page.mouse.move(box.x + orbitGeometry.cx, box.y + orbitGeometry.cy + orbitGeometry.ry);
    await page.mouse.down();
    await page.mouse.move(box.x + orbitGeometry.cx + orbitGeometry.rx, box.y + orbitGeometry.cy, { steps: 8 });
    await page.mouse.up();
    expect(Number(await page.locator('#dayControl').inputValue())).not.toBeCloseTo(clickedDay, 0);
    await expect(orbit).not.toHaveClass(/dragging/);

    const annualBefore = await page.locator('#annualCanvas').evaluate(canvas => canvas.toDataURL());
    await page.locator('[data-latitude="0"]').click();
    const annualAfter = await page.locator('#annualCanvas').evaluate(canvas => canvas.toDataURL());
    expect(annualAfter).not.toBe(annualBefore);

    await page.setViewportSize({ width: 768, height: 1024 });
    for (const mode of ['seasons', 'eclipses']) {
      await page.locator(`[data-lab-mode="${mode}"]`).click();
      const rail = await page.locator('.control-rail').evaluate(element => ({
        clientHeight: element.clientHeight,
        overflowY: getComputedStyle(element).overflowY,
        scrollHeight: element.scrollHeight
      }));
      expect(rail.overflowY).not.toBe('auto');
      expect(rail.overflowY).not.toBe('scroll');
      expect(rail.scrollHeight).toBeLessThanOrEqual(rail.clientHeight + 1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page);
    await assertNoErrors(errors);
  });
}
