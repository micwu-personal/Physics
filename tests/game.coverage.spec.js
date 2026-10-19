import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { preparePage, setRange } from './helpers/runtime.js';
import { watchPage, assertNoErrors } from './helpers/assertions.js';

const coverageDir = `test-results/coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;
const snapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
async function collect(page,id,run,init) {
  const errors = watchPage(page);
  await page.coverage.startJSCoverage({resetOnNavigation:false});
  if (init) await page.addInitScript(init);
  await preparePage(page,'/physics/game.html','en',{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame));
  await run(); await assertNoErrors(errors);
  await mkdir(coverageDir,{recursive:true});
  await writeFile(`${coverageDir}/game-${id}.json`,JSON.stringify(await page.coverage.stopJSCoverage()));
}
async function progress(page) {
  await page.locator('#release').click(); await page.locator('#measure').click();
  await page.locator('#next').click();
  await page.locator('#compare').click();
  for (const value of ['4.6','31','0']) await page.locator('#phase-preview').selectOption(value);
  await page.locator('#compare').click(); await page.locator('#next').click();
}

test('game experiment progression, heat boundaries and language coverage',async ({page}) => {
  await collect(page,'experiments',async () => {
    for (const density of ['650','1000','7800']) {
      await page.locator('#density').selectOption(density);
      await page.locator('#prediction').selectOption(density === '650' ? 'float' : density === '1000' ? 'neutral' : 'sink');
      await page.locator('#release').click(); await page.locator('#measure').click();
    }
    await page.locator('#prediction').selectOption('float'); await page.locator('#measure').click();
    await progress(page);
    await page.locator('#record-heat').click();
    for (const heat of [0,1.5,4.6,12,31,32]) {
      await setRange(page.locator('#heat'),heat); await page.locator('#record-heat').click();
      await page.locator('[data-lang="zh-CN"]').click(); await page.locator('[data-lang="en"]').click();
    }
    await setRange(page.locator('#heat'),12); await page.locator('#heat-up').click(); await page.waitForTimeout(160);
    await setRange(page.locator('#heat'),31.99); await page.locator('#heat-up').click();
    await expect.poll(async () => (await snapshot(page)).heat).toBe(32);
    await setRange(page.locator('#heat'),.01); await page.locator('#cool').click();
    await expect.poll(async () => (await snapshot(page)).heat).toBe(0);
    await page.locator('#heater-stop').click();
    await page.locator('#next').click();
    for (const scene of ['molecules','heat','coast']) await page.locator(`[data-scene="${scene}"]`).click();
    await page.locator('#reset').click();
    await page.locator('#play').click(); await page.locator('#play').click(); await page.locator('#play').click();
    await page.locator('.motion-toggle').click(); await page.locator('.motion-toggle').click();
    await page.locator('#play').click();
    await page.setViewportSize({width:320,height:740}); await page.setViewportSize({width:1440,height:1000});
  });
});

test('game movement, pointer, platform and lifecycle coverage',async ({page}) => {
  await collect(page,'lifecycle',async () => {
    const canvas = page.locator('#game-canvas');
    await canvas.focus();
    for (const key of ['a','w','d','s','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','e','x']) await page.keyboard.press(key);
    for (let i=0;i<14;i++) await page.keyboard.press('w');
    for (const direction of ['left','forward','back','right']) await page.locator(`[data-move="${direction}"]`).click();
    for (const direction of ['left','right']) await page.locator(`[data-look="${direction}"]`).click();
    await canvas.focus(); await page.keyboard.press('Space');
    await page.keyboard.down('w'); await page.waitForTimeout(180); await page.keyboard.up('w');
    await page.keyboard.press('Space');
    await canvas.dispatchEvent('pointermove',{clientX:100,clientY:100,pointerId:9});
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4); await page.mouse.down();
    await page.mouse.move(box.x+box.width*.6,box.y+box.height*.6); await page.mouse.up();
    for (const event of ['pointercancel','lostpointercapture']) await canvas.dispatchEvent(event);
    await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      canvas.requestPointerLock = async () => {};
    });
    await page.locator('#mouse-lock').click();
    await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      Object.defineProperty(document,'pointerLockElement',{configurable:true,value:canvas});
      document.dispatchEvent(new Event('pointerlockchange'));
      canvas.dispatchEvent(new PointerEvent('pointermove',{movementX:10,movementY:20}));
      document.exitPointerLock = () => Object.defineProperty(document,'pointerLockElement',{configurable:true,value:null});
    });
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.dispatchEvent(new Event('pointerlockchange')));
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.getElementById('game-canvas').requestPointerLock = undefined; });
    await page.locator('#mouse-lock').click(); await expect(page.locator('#feedback')).toContainText('unavailable');
    await page.evaluate(() => { document.getElementById('game-canvas').requestPointerLock = async () => { throw new Error('Denied'); }; });
    await page.locator('#mouse-lock').click();
    await page.evaluate(() => document.dispatchEvent(new Event('pointerlockerror')));
    await page.locator('#play').click();
    await page.evaluate(() => { Object.defineProperty(document,'hidden',{configurable:true,value:true}); });
    await page.waitForTimeout(120);
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document,'hidden',{configurable:true,value:false}); document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.setViewportSize({width:1440,height:400});
    await page.evaluate(() => window.scrollTo(0,document.documentElement.scrollHeight));
    await expect.poll(async () => (await snapshot(page)).visible).toBe(false);
    await page.setViewportSize({width:1440,height:1000});
    await canvas.scrollIntoViewIfNeeded(); await expect.poll(async () => (await snapshot(page)).visible).toBe(true);
    await page.evaluate(() => { window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('pageshow')); });
    await canvas.dispatchEvent('webglcontextlost'); expect((await snapshot(page)).gpu).toBe(false);
    await canvas.dispatchEvent('webglcontextrestored'); expect((await snapshot(page)).gpu).toBe(true);
    await page.evaluate(() => {
      document.getElementById('game-canvas').getContext = () => { throw new Error('GPU unavailable'); };
    });
    await canvas.dispatchEvent('webglcontextrestored'); expect((await snapshot(page)).gpu).toBe(false);
  },() => { Object.defineProperty(window,'devicePixelRatio',{configurable:true,value:0}); });
});

test('game no-GPU notebook and unavailable storage still complete the journey',async ({page}) => {
  await collect(page,'fallback',async () => {
    expect((await snapshot(page)).gpu).toBe(false); await expect(page.locator('#gpu-message')).toBeVisible();
    await progress(page); await setRange(page.locator('#heat'),12); await page.locator('#record-heat').click();
    await expect(page.locator('#storage-status')).toContainText('unavailable');
    await page.locator('#reset').click();
  },() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type,...args) { if (type === 'webgl') return null; return native.call(this,type,...args); };
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function(key) { if (key === 'physics.game.v1') throw new Error('Storage denied'); return get.call(this,key); };
    Storage.prototype.setItem = function(key,value) { if (key === 'physics.game.v1') throw new Error('Storage denied'); return set.call(this,key,value); };
  });
});

test('game restores only versioned valid notes and contains GPU setup errors',async ({page}) => {
  await collect(page,'restore',async () => {
    expect((await snapshot(page)).completed).toEqual([true,true,true]);
    for (const saved of ['{broken', JSON.stringify({version:2}), JSON.stringify({version:1,completed:{}}), JSON.stringify({version:1,completed:[]}), JSON.stringify({version:1,completed:[false,false,'bad']})]) {
      await page.evaluate(value => localStorage.setItem('physics.game.v1',value),saved);
      await page.reload(); await page.waitForFunction(() => Boolean(window.__physicsGame));
      expect((await snapshot(page)).completed).toEqual([false,false,false]);
    }
    await page.locator('#reset').click();
  },() => {
    if (!localStorage.getItem('physics.game.v1')) localStorage.setItem('physics.game.v1',JSON.stringify({version:1,completed:[true,true,true]}));
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type,...args) { if (type === 'webgl') throw new Error('GPU initialization failed'); return native.call(this,type,...args); };
  });
});
