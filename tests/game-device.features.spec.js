import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { preparePage } from './helpers/runtime.js';
import { assertNoErrors, watchPage } from './helpers/assertions.js';

const snapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
async function mockOrientation(page,permission='granted') {
  await page.addInitScript(value => {
    window.__orientationRequests = 0;
    class Orientation extends Event {
      static async requestPermission() { window.__orientationRequests++; return value; }
    }
    Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:Orientation});
  },permission);
}
async function emit(page,alpha=0,beta=90,gamma=0) {
  await page.evaluate(values => window.dispatchEvent(Object.assign(new Event('deviceorientation'),values)),{alpha,beta,gamma});
}
async function start(page) {
  await preparePage(page,'/physics/game.html','en',{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame));
  await expect(page.locator('#mode-adventure')).toBeEnabled(); await page.locator('#mode-adventure').click();
  await page.locator('#mission-start').click();
}
async function holdTouch(page,direction) {
  const button = page.locator(`[data-move="${direction}"]`);
  await button.scrollIntoViewIfNeeded(); const box = await button.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
  await page.waitForTimeout(420);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await cdp.detach();
}

test('simulated iPhone sensor rotation and real held touch work together, with touch-only pause and exit',async ({browser,baseURL}) => {
  const context = await browser.newContext({baseURL,hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  try {
  const page = await context.newPage(), errors = watchPage(page); await mockOrientation(page); await start(page);
  await expect(page.locator('#mouse-lock')).toBeHidden();
  await page.locator('#view-toggle').tap(); expect((await snapshot(page)).expanded).toBe(true);
  await page.locator('#device-look').tap(); expect(await page.evaluate(() => window.__orientationRequests)).toBe(1);
  await emit(page); const before = await snapshot(page), image = await page.locator('#game-canvas').screenshot();
  await emit(page,30,80); const turned = await snapshot(page);
  expect(turned.camera.yaw).toBeCloseTo(before.camera.yaw-Math.PI/6,5);
  expect(turned.camera.pitch).toBeCloseTo(before.camera.pitch-Math.PI/18,5);
  expect([turned.camera.x,turned.camera.y,turned.camera.z]).toEqual([before.camera.x,before.camera.y,before.camera.z]);
  await page.waitForTimeout(100); expect(image.equals(await page.locator('#game-canvas').screenshot())).toBe(false);
  await page.locator('#adventure-interact').scrollIntoViewIfNeeded();
  await expect(page.locator('#adventure-interact')).toBeInViewport();
  expect(await page.locator('#adventure-interact').evaluate(element => {
    const box = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));
  })).toBe(true);
  await holdTouch(page,'forward'); const moved = await snapshot(page);
  expect(moved.camera.x).toBeLessThan(turned.camera.x-.2); expect(moved.camera.z).toBeLessThan(turned.camera.z-.2);
  await page.locator('#view-play').tap(); const paused = await snapshot(page); await emit(page,150,40);
  expect((await snapshot(page)).camera).toEqual(paused.camera); expect((await snapshot(page)).deviceLook.phase).toBe('paused');
  await page.locator('#view-play').tap(); await emit(page,180); expect((await snapshot(page)).camera.yaw).toBe(paused.camera.yaw);
  await emit(page,190); expect((await snapshot(page)).camera.yaw).toBeCloseTo(paused.camera.yaw-Math.PI/18,5);
  await page.locator('#device-recenter').tap(); const aligned = (await snapshot(page)).camera.yaw;
  await emit(page,300); expect((await snapshot(page)).camera.yaw).toBe(aligned);
  await page.locator('#look-stop').tap(); expect((await snapshot(page)).deviceLook.enabled).toBe(false); expect((await snapshot(page)).playing).toBe(false);
  await page.locator('#view-play').tap(); await page.locator('#device-look').tap(); await emit(page);
  await page.locator('#view-toggle').tap(); const exited = await snapshot(page);
  expect(exited.expanded).toBe(false); expect(exited.deviceLook.enabled).toBe(false); expect(exited.playing).toBe(false);
  await expect(page.locator('#view-toggle')).toBeFocused();
  expect(await page.locator('.game-nav').evaluate(element => element.inert)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await assertNoErrors(errors);
  } finally { await context.close(); }
});

test('portrait/landscape rotation, lifecycle and keyboard focus preserve calibration',async ({page}) => {
  const errors = watchPage(page); await mockOrientation(page); await start(page); await page.locator('#view-toggle').click();
  await page.locator('#device-look').click(); await emit(page); await emit(page,10); const yaw = (await snapshot(page)).camera.yaw;
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(() => screen.orientation.dispatchEvent(new Event('change'))); await emit(page,0,0,-90);
  expect((await snapshot(page)).camera.yaw).toBe(yaw); await emit(page,30,0,-90);
  expect((await snapshot(page)).camera.yaw).toBeCloseTo(yaw-Math.PI/6,5);
  await page.evaluate(() => window.dispatchEvent(new Event('orientationchange'))); const recalibrated = (await snapshot(page)).camera.yaw;
  await emit(page,200,90,0); expect((await snapshot(page)).camera.yaw).toBe(recalibrated);
  await page.locator('#game-canvas').focus(); await page.keyboard.press('Shift+Tab'); await expect(page.locator('.camera-help summary')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('#game-canvas')).toBeFocused();
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); const paused = await snapshot(page); await emit(page,250);
  expect((await snapshot(page)).camera.yaw).toBe(paused.camera.yaw); expect(paused.playing).toBe(false);
  await page.locator('#view-play').click(); await emit(page); await page.keyboard.press('Escape');
  expect((await snapshot(page)).expanded).toBe(false); expect((await snapshot(page)).deviceLook.enabled).toBe(false);
  await page.locator('[data-lang="zh-CN"]').click(); await expect(page.locator('#device-look')).toHaveText('设备视角');
  await expect(page.locator('#device-status')).toContainText('位置可用箭头，或另外设置相机行走'); await assertNoErrors(errors);
});

test('desktop mouse capture really releases on double-click without needing Escape',async ({page}) => {
  const errors = watchPage(page); await start(page); await page.locator('#mouse-lock').click();
  await expect.poll(() => page.evaluate(() => document.pointerLockElement?.id)).toBe('game-canvas');
  await expect(page.locator('#capture-hint')).toContainText('double-click');
  await page.mouse.dblclick(300,300);
  await expect.poll(() => page.evaluate(() => document.pointerLockElement)).toBe(null);
  expect((await snapshot(page)).playing).toBe(false); await expect(page.locator('#capture-hint')).toBeHidden();
  await page.locator('#view-play').click(); await page.locator('#mouse-lock').click(); await page.keyboard.press('Escape');
  expect((await snapshot(page)).playing).toBe(false); await assertNoErrors(errors);
});

test('orientation denial, missing readings and unsupported sensors keep honest touch/drag fallbacks',async ({page}) => {
  const errors = watchPage(page); await mockOrientation(page,'denied'); await start(page);
  await page.locator('#device-look').click(); await expect(page.locator('#device-status')).toContainText('not granted');
  expect((await snapshot(page)).deviceLook.enabled).toBe(false);
  await page.locator('[data-move="forward"]').click(); expect((await snapshot(page)).camera.z).toBeLessThan(6);
  await page.evaluate(() => { DeviceOrientationEvent.requestPermission = async () => 'granted'; });
  await page.locator('#device-look').click(); await emit(page,null,null,null);
  await expect(page.locator('#device-status')).toContainText('No usable orientation',{timeout:5000});
  await page.locator('#device-look').click(); await emit(page); expect((await snapshot(page)).deviceLook.enabled).toBe(true);
  await page.locator('#device-look').click(); expect((await snapshot(page)).deviceLook.enabled).toBe(false);
  await page.addInitScript(() => { Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:undefined}); });
  await page.reload(); await page.waitForFunction(() => Boolean(window.__physicsGame)); await page.locator('#device-look').click();
  await expect(page.locator('#device-status')).toContainText('unavailable'); await assertNoErrors(errors);
});

test('graphics loss and BFCache exit expanded mode, cancel motion, and preserve the lab fallback',async ({page}) => {
  const errors = watchPage(page); await mockOrientation(page); await start(page); await page.locator('#view-toggle').click();
  await page.locator('#device-look').click(); await emit(page);
  await page.locator('#game-canvas').dispatchEvent('webglcontextlost'); const lost = await snapshot(page);
  expect(lost.expanded).toBe(false); expect(lost.deviceLook.enabled).toBe(false); expect(lost.mode).toBe('lab');
  await expect(page.locator('#view-toggle')).toBeDisabled(); await expect(page.locator('#gpu-message')).toBeVisible();
  expect(await page.locator('#notebook').evaluate(element => element.inert)).toBe(false);
  await page.locator('#game-canvas').dispatchEvent('webglcontextrestored'); await page.locator('#mode-adventure').click();
  await page.locator('#adventure-play').click(); await page.locator('#view-toggle').click(); await page.locator('#device-look').click(); await emit(page);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  expect((await snapshot(page)).expanded).toBe(false); expect((await snapshot(page)).deviceLook.enabled).toBe(false);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.locator('#view-toggle')).toBeEnabled(); await assertNoErrors(errors);
});

test('batched desktop, phone and tablet expanded-view inspection',async ({page}) => {
  await mkdir('test-results/game-device-inspection',{recursive:true}); await mockOrientation(page); await start(page);
  for (const [name,width,height] of [['desktop',1440,1000],['phone',390,844],['phone-landscape',844,390],['tablet',1024,768],['tablet-landscape',1180,820]]) {
    await page.setViewportSize({width,height}); await page.locator('#view-toggle').click();
    await page.locator('#device-look').click(); await emit(page);
    const bounds = await page.locator('.world').boundingBox(); expect(bounds.x).toBe(0); expect(bounds.y).toBe(0);
    expect(bounds.height).toBe(height); expect(bounds.width).toBe(width);
    for (const selector of ['#view-toggle','#view-play','#game-canvas','[data-move="forward"]']) {
      const box = await page.locator(selector).boundingBox(); expect(box.x,`${name}: ${selector} x`).toBeGreaterThanOrEqual(0); expect(box.y,`${name}: ${selector} y`).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width+1); expect(box.y+box.height).toBeLessThanOrEqual(height+1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    await page.screenshot({path:`test-results/game-device-inspection/${name}.png`});
    await page.locator('#view-toggle').click(); await page.locator('#adventure-play').click();
  }
});
