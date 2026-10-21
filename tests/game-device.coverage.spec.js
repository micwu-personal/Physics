import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { preparePage } from './helpers/runtime.js';
import { assertNoErrors, watchPage } from './helpers/assertions.js';

const directory = `test-results/coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;
const snapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
async function emit(page,alpha=0,beta=90,gamma=0) {
  await page.evaluate(values => window.dispatchEvent(Object.assign(new Event('deviceorientation'),values)),{alpha,beta,gamma});
}
async function collect(page,name,run) {
  const errors = watchPage(page); await page.coverage.startJSCoverage({resetOnNavigation:false});
  await page.addInitScript(() => {
    class Orientation extends Event { static async requestPermission() { return 'granted'; } }
    Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:Orientation});
  });
  await preparePage(page,'/physics/game.html','en',{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame)); await run(); await assertNoErrors(errors);
  await mkdir(directory,{recursive:true}); await writeFile(`${directory}/game-device-${name}.json`,JSON.stringify(await page.coverage.stopJSCoverage()));
}

test('game mobile runtime control, focus, lifecycle and permission coverage',async ({page}) => {
  await collect(page,'runtime',async () => {
    await page.locator('#view-toggle').click(); await page.locator('#device-recenter').dispatchEvent('click');
    await page.locator('#device-look').click(); await emit(page); expect((await snapshot(page)).deviceLook.phase).toBe('paused');
    await page.locator('#mission-start').click(); await emit(page); await emit(page,20,80);
    await page.locator('#game-canvas').focus(); await page.keyboard.press('Tab');
    await page.locator('.device-help summary').focus(); await page.keyboard.press('Shift+Tab');
    await page.locator('.camera-help summary').focus(); await page.keyboard.press('Tab');
    await expect(page.locator('#game-canvas')).toBeFocused(); await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.camera-help summary')).toBeFocused();
    await page.locator('#device-recenter').click(); await emit(page,150);
    await page.evaluate(() => { window.dispatchEvent(new Event('orientationchange')); screen.orientation.dispatchEvent(new Event('change')); });
    await emit(page,160); await page.locator('#view-play').click(); await emit(page,170);
    await page.locator('#view-play').click(); await emit(page,180);
    await page.locator('#device-look').click(); await page.locator('#device-look').click(); await emit(page);
    await page.locator('#look-stop').click(); expect((await snapshot(page)).playing).toBe(false);
    await page.locator('#view-play').click(); await page.locator('#device-look').click(); await emit(page);
    await page.keyboard.press('Escape'); expect((await snapshot(page)).expanded).toBe(false);
    await page.locator('#game-canvas').dispatchEvent('dblclick');
    await page.locator('#view-toggle').click(); await page.locator('#device-look').click(); await emit(page);
    await page.locator('#game-canvas').dispatchEvent('webglcontextlost'); expect((await snapshot(page)).expanded).toBe(false);
    await page.locator('#game-canvas').dispatchEvent('webglcontextrestored');
    await page.locator('#play').click(); await page.locator('#view-toggle').click();
    await page.locator('#device-look').click(); await emit(page);
    const button = page.locator('[data-move="forward"]'), box = await button.boundingBox();
    await page.mouse.move(box.x+20,box.y+20); await page.mouse.down(); await page.waitForTimeout(160); await page.mouse.up();
    for (const event of ['pointercancel','lostpointercapture']) await button.dispatchEvent(event,{pointerId:7});
    const canvas = page.locator('#game-canvas');
    const canvasBox = await canvas.boundingBox();
    await page.mouse.move(canvasBox.x+100,canvasBox.y+200); await page.mouse.down();
    await canvas.dispatchEvent('pointermove',{clientX:120,clientY:100,pointerId:999}); await page.mouse.up();
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
    expect((await snapshot(page)).deviceLook.enabled).toBe(false);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await page.locator('#view-toggle').click(); await page.locator('#device-look').click(); await emit(page);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
    expect((await snapshot(page)).expanded).toBe(false);
  });
});

test('cancelled and late mouse requests cannot recapture the scene or steal exit focus',async ({page}) => {
  await collect(page,'mouse-races',async () => {
    await page.locator('#mission-start').click(); await page.locator('#view-toggle').click();
    await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      canvas.requestPointerLock = () => new Promise((resolve,reject) => { window.__resolveMouse = resolve; window.__rejectMouse = reject; });
      Object.defineProperty(document,'pointerLockElement',{configurable:true,value:null});
      document.exitPointerLock = () => { Object.defineProperty(document,'pointerLockElement',{configurable:true,value:null}); document.dispatchEvent(new Event('pointerlockchange')); };
    });
    await page.locator('#mouse-lock').click(); await expect(page.locator('#look-stop')).toBeVisible();
    await page.locator('#mouse-lock').click(); await page.evaluate(() => window.__resolveMouse());
    expect((await snapshot(page)).playing).toBe(false); await expect(page.locator('#mouse-lock')).toBeFocused();
    await page.locator('#view-play').click(); await page.locator('#mouse-lock').click(); await page.locator('#view-toggle').click();
    await page.evaluate(() => {
      window.__resolveMouse();
      Object.defineProperty(document,'pointerLockElement',{configurable:true,value:document.getElementById('game-canvas')});
      document.dispatchEvent(new Event('pointerlockchange'));
    });
    await expect(page.locator('#view-toggle')).toBeFocused(); expect((await snapshot(page)).expanded).toBe(false);
    expect(await page.evaluate(() => document.pointerLockElement)).toBe(null);
    await page.locator('#mouse-lock').click(); await page.evaluate(() => window.__rejectMouse(new Error('Fixture rejection')));
    await expect(page.locator('#feedback')).toContainText('unavailable'); await expect(page.locator('#look-stop')).toBeHidden();
    await page.locator('#mouse-lock').click(); await page.locator('#look-stop').click();
    await page.evaluate(() => window.__rejectMouse(new Error('Cancelled fixture rejection')));
    expect((await snapshot(page)).playing).toBe(false); await expect(page.locator('#look-stop')).toBeHidden();
    await page.evaluate(() => { Object.defineProperty(document,'pointerLockElement',{configurable:true,value:document.getElementById('game-canvas')}); });
    await page.locator('#mouse-lock').click(); expect(await page.evaluate(() => document.pointerLockElement)).toBe(null);
  });
});

test('game pending orientation, honest error phases and mouse lock exits coverage',async ({page}) => {
  await collect(page,'fallbacks',async () => {
    await page.evaluate(() => { DeviceOrientationEvent.requestPermission = () => new Promise(resolve => { window.__resolvePermission = resolve; }); });
    await page.locator('#device-look').click(); expect((await snapshot(page)).deviceLook.pending).toBe(true);
    await page.locator('#look-stop').click(); await page.evaluate(() => window.__resolvePermission('granted'));
    expect((await snapshot(page)).deviceLook.enabled).toBe(false);
    await page.evaluate(() => { DeviceOrientationEvent.requestPermission = async () => 'denied'; });
    await page.locator('#device-look').click(); await expect(page.locator('#device-status')).toContainText('not granted');
    await page.evaluate(() => { DeviceOrientationEvent.requestPermission = async () => 'granted'; });
    await page.locator('#device-look').click(); await expect(page.locator('#device-status')).toContainText('No usable',{timeout:5000});
    await page.locator('#mission-start').click(); await page.locator('#device-look').click(); await emit(page);
    await page.locator('#mouse-lock').click(); await expect.poll(() => page.evaluate(() => document.pointerLockElement?.id)).toBe('game-canvas');
    await page.mouse.dblclick(300,300); expect((await snapshot(page)).deviceLook.enabled).toBe(false);
    await expect.poll(() => page.evaluate(() => document.pointerLockElement)).toBe(null);
    await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      Object.defineProperty(document,'pointerLockElement',{configurable:true,value:null});
      canvas.requestPointerLock = async () => { Object.defineProperty(document,'pointerLockElement',{configurable:true,value:canvas}); document.dispatchEvent(new Event('pointerlockchange')); };
      document.exitPointerLock = () => { Object.defineProperty(document,'pointerLockElement',{configurable:true,value:null}); document.dispatchEvent(new Event('pointerlockchange')); };
    });
    await page.locator('#mouse-lock').click(); await expect.poll(() => page.evaluate(() => document.pointerLockElement?.id)).toBe('game-canvas');
    await page.locator('#mouse-lock').click(); expect((await snapshot(page)).playing).toBe(false);
    await page.addInitScript(() => { Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:undefined}); });
    await page.reload(); await page.waitForFunction(() => Boolean(window.__physicsGame)); await page.locator('#device-look').click();
    await expect(page.locator('#device-status')).toContainText('unavailable');
  });
});
