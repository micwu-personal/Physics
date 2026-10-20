import { test, expect } from '@playwright/test';
import { preparePage } from './helpers/runtime.js';
import { assertNoErrors, watchPage } from './helpers/assertions.js';

const snapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});

test('WebKit mobile touch navigation, rotation fixture, landscape and non-keyboard exits',async ({page}) => {
  const errors = watchPage(page);
  await page.addInitScript(() => {
    class Orientation extends Event { static async requestPermission() { return 'granted'; } }
    Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:Orientation});
  });
  await preparePage(page,'/physics/game.html','en',{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame));
  await page.locator('#mode-lab').tap(); const before = await snapshot(page);
  await page.locator('[data-move="forward"]').tap(); expect((await snapshot(page)).camera.z).toBeLessThan(before.camera.z);
  if (before.gpu) {
    await page.locator('#play').tap(); await page.locator('#view-toggle').tap(); await page.locator('#device-look').tap();
    await page.evaluate(() => window.dispatchEvent(Object.assign(new Event('deviceorientation'),{alpha:0,beta:90,gamma:0})));
    const calibrated = await snapshot(page);
    await page.evaluate(() => window.dispatchEvent(Object.assign(new Event('deviceorientation'),{alpha:30,beta:90,gamma:0})));
    expect((await snapshot(page)).camera.yaw).toBeCloseTo(calibrated.camera.yaw-Math.PI/6,5);
    await page.setViewportSize({width:844,height:390});
    await page.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
    await page.locator('#view-play').tap(); expect((await snapshot(page)).playing).toBe(false);
    await page.locator('#look-stop').tap(); expect((await snapshot(page)).deviceLook.enabled).toBe(false);
    await page.locator('#view-toggle').tap(); expect((await snapshot(page)).expanded).toBe(false);
    await expect(page.locator('#view-toggle')).toBeFocused();
  } else {
    await expect(page.locator('#gpu-message')).toBeVisible();
    await expect(page.locator('#device-look')).toBeDisabled(); await expect(page.locator('#view-toggle')).toBeDisabled();
    await page.locator('#release').tap(); await page.locator('#measure').tap();
    expect((await snapshot(page)).completed[0]).toBe(true);
  }
  await expect(page.locator('#mouse-lock')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
  await assertNoErrors(errors);
});
