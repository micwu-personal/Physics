import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {adventureSnapshot as snap,openAdventure,travel,build,dock,relay,signal} from './helpers/game-adventure.js';
import {watchPage,assertNoErrors} from './helpers/assertions.js';

const coverageDir = `test-results/coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;
async function collect(page,id,run) {
  const errors = watchPage(page);
  await page.coverage.startJSCoverage({resetOnNavigation:false});
  await openAdventure(page);
  await run(); await assertNoErrors(errors);
  await mkdir(coverageDir,{recursive:true});
  await writeFile(`${coverageDir}/game-adventure-${id}.json`,JSON.stringify(await page.coverage.stopJSCoverage()));
}

test('rescue runtime follows a timed playable route, keyboard actions and replay',async ({page}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => localStorage.setItem('physics.rescue.v1',JSON.stringify({version:1,best:1})));
  await collect(page,'route',async () => {
    const canvas = page.locator('#game-canvas');
    await canvas.focus(); await page.keyboard.press('e'); await page.keyboard.press('f'); await page.keyboard.press('Space');
    await page.locator('#timed-run').check(); await page.locator('#mission-start').click();
    await expect(page.locator('#mission-clock')).toHaveText(/^1:\d{2} ↓$/);
    await canvas.focus(); await page.keyboard.down('Shift'); await page.keyboard.down('w'); await page.keyboard.down('a');
    await page.waitForTimeout(160);
    await page.keyboard.up('a'); await page.keyboard.up('w'); await page.keyboard.up('Shift');
    await page.keyboard.press('Space'); await page.keyboard.press('f'); await page.keyboard.press('Escape');
    const paused = (await snap(page)).camera;
    await canvas.focus(); await page.keyboard.press('w'); await page.keyboard.press('e'); await page.keyboard.press('Space');
    await expect.poll(async () => (await snap(page)).camera).toEqual(paused);
    await expect(page.locator('#play-status')).toHaveText('Paused · resume the rescue');
    for (const id of ['throw','heat','cool','hold','drop','unload']) await expect(page.locator(`#adventure-${id}`)).toBeDisabled();
    await page.locator('#adventure-play').click();
    await expect(page.locator('#play-status')).toHaveText('Rescue in progress');
    for (const id of ['throw','heat','cool','hold','drop','unload']) await expect(page.locator(`#adventure-${id}`)).toBeEnabled();
    await page.locator('#adventure-recover').click();
    await build(page); await dock(page); await relay(page);
    await page.locator('#adventure-cool').click(); await page.waitForTimeout(150); await page.locator('#adventure-hold').click();
    await signal(page,true);
    await expect(page.locator('#mission-overlay-title')).toHaveText('The lighthouse is back.');
    expect((await snap(page)).adventure.best).toBe(1);
    await page.locator('#mode-lab').click(); await page.locator('#approach').click();
    await canvas.focus(); await page.keyboard.press('f'); await page.keyboard.press('Shift');
    await page.locator('#mode-adventure').click(); await page.locator('#mission-retry').click();
    expect((await snap(page)).adventure.elapsed).toBeLessThan(1);
    await page.locator('#adventure-play').click(); await page.locator('#adventure-play').click();
  });
});

test('rescue held controls, sound and BFCache pause survive shared runtime events',async ({page}) => {
  await collect(page,'lifecycle',async () => {
    await page.locator('#mission-start').click(); await page.locator('#adventure-sound').click();
    const forward = page.locator('[data-move="forward"]'), box = await forward.boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down(); await page.waitForTimeout(180);
    await page.mouse.up();
    for (const event of ['pointercancel','lostpointercapture']) await forward.dispatchEvent(event);
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
      window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
    });
    expect((await snap(page)).playing).toBe(false);
    await page.locator('#adventure-play').click();
    await page.locator('#game-canvas').focus(); await page.keyboard.press('Shift');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp');
    await page.locator('#approach').click();
    await page.locator('.motion-toggle').click(); expect((await snap(page)).playing).toBe(false);
    await page.locator('.motion-toggle').click(); await page.locator('#adventure-play').click();
    await page.locator('[data-lang="zh-CN"]').click(); await page.locator('[data-lang="en"]').click();
    await page.locator('#game-canvas').dispatchEvent('webglcontextlost'); expect((await snap(page)).mode).toBe('lab');
    await page.locator('#game-canvas').dispatchEvent('webglcontextrestored'); expect((await snap(page)).gpu).toBe(true);
    await page.locator('#mode-adventure').click(); expect((await snap(page)).playing).toBe(false);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false})));
  });
});
