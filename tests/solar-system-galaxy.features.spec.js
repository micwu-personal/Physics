import { expect, test } from '@playwright/test';
import { assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';
import { expectCanvasRendered } from './helpers/rendering.js';
import { preparePage, setRange } from './helpers/runtime.js';

const path = '/physics/solar-system-galaxy.html';

for (const language of ['en', 'zh-CN']) {
  test(`Solar System and reach instruments preserve caveats in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause', reducedMotion: 'reduce' });

    await expectCanvasRendered(page.locator('#addressCanvas'));
    await page.locator('[data-solar-scale="reservoirs"]').click();
    await page.locator('[data-solar-object="eris"]').click();
    await expect(page.locator('#solarSelection')).toContainText(language === 'en' ? 'Eris' : '阋神星');

    await setRange(page.locator('#reachControl'), Math.log10(310000));
    await expect(page.locator('#reachSummary')).toContainText(language === 'en' ? 'Galactic tides' : '银河潮汐');
    await expect(page.locator('#reachSummary')).toContainText(language === 'en' ? 'anisotropic' : '方向性');
    await expect(page.locator('[data-reach-au="310000"]')).toBeVisible();

    const initialMotion = await page.evaluate(() => ({
      document: document.documentElement.dataset.motion,
      localAnimations: window.__cosmicAtlas.state.playing.size
    }));
    expect(initialMotion).toEqual({ document: 'paused', localAnimations: 0 });
    await assertNoErrors(errors);
  });

  test(`Mission history and Voyager assists respond in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });

    await setRange(page.locator('#missionYear'), 1989.7);
    await page.locator('[data-mission-filter="voyager2"]').click();
    await expect(page.locator('#missionEra')).toContainText(language === 'en' ? 'Neptune' : '海王星');
    await expect(page.locator('#missionLedger')).toContainText(language === 'en' ? 'Neptune and Triton flyby' : '飞越海王星与海卫一');

    await page.locator('#missionPlay').click();
    await expect(page.locator('#missionPlay')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#missionPlay').click();
    await expect(page.locator('#missionPlay')).toHaveAttribute('aria-pressed', 'false');

    await page.locator('[data-assist-mode="voyager"]').click();
    await setRange(page.locator('#voyagerEncounter'), 3);
    await expect(page.locator('#voyagerAssistSummary')).toContainText(language === 'en' ? 'Neptune' : '海王星');
    await expect(page.locator('#assistRelative')).toContainText(language === 'en' ? 'conserved' : '守恒');
    await assertNoErrors(errors);
  });

  test(`Milky Way history and schematic observer remain usable in ${language}`, async ({ page }) => {
    const errors = watchPage(page);
    await preparePage(page, path, language, { motionPreference: 'pause' });

    await page.locator('[data-galaxy-layer="matter"]').click();
    await expect(page.locator('#galaxySummary')).toContainText(language === 'en' ? 'Inferred gravitating mass' : '推断的引力质量');
    await setRange(page.locator('#galaxyTime'), 4.5);
    await expect(page.locator('#galaxyHistorySummary')).toContainText(language === 'en' ? 'Major ancient accretion' : '重大远古吸积');
    await page.locator('#observerPosition').selectOption('inner');
    await setRange(page.locator('#skyDirection'), 0);
    await setRange(page.locator('#skyElevation'), 0);
    await expect(page.locator('#skySummary')).toContainText(language === 'en' ? 'Inner disk' : '内盘');
    await expect(page.locator('#skySgrStatus')).toContainText(language === 'en' ? 'obscured' : '遮挡');

    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page, { sweep: true });
    await assertNoErrors(errors);
  });
}
