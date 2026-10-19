import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { preparePage, setRange } from './helpers/runtime.js';
import { assertInternalLinks, assertLayout, assertNoErrors, watchPage } from './helpers/assertions.js';

const snapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
async function start(page,lang='en') {
  await preparePage(page,'/physics/game.html',lang,{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame));
}
async function completeShore(page) {
  await page.locator('#release').click(); await page.locator('#measure').click();
}
async function completeLens(page) {
  await page.locator('#phase-preview').selectOption('4.6');
  await page.locator('#phase-preview').selectOption('31');
  await page.locator('#compare').click();
}

test('first-person journey links buoyancy, molecules and conserved latent heat',async ({page}) => {
  const errors = watchPage(page); await start(page);
  expect((await snapshot(page)).gpu).toBe(true);
  await assertInternalLinks(page);
  await page.locator('.reference-pane').waitFor({state:'attached'});
  await expect(page.locator('.reference-pane')).toBeHidden();
  expect((await snapshot(page)).playing).toBe(false);
  const before = await page.locator('#game-canvas').screenshot();
  await page.locator('[data-move="forward"]').click();
  expect((await snapshot(page)).camera.z).toBeLessThan(6);
  const after = await page.locator('#game-canvas').screenshot();
  expect(before.equals(after)).toBe(false);
  await page.locator('#approach').click();
  await completeShore(page);
  await expect(page.locator('#weight')).toHaveText('6.38 N');
  await expect(page.locator('#immersion')).toHaveText('65%');
  await expect(page.locator('#feedback')).toContainText('agrees');
  await page.locator('#density').selectOption('7800');
  await expect(page.locator('#measure')).toBeDisabled();
  await completeShore(page);
  await expect(page.locator('#weight')).toHaveText('76.52 N');
  await expect(page.locator('#immersion')).toContainText('Sinks');
  await expect(page.locator('#feedback')).toContainText('differs');
  await page.locator('#next').click();
  expect((await snapshot(page)).scene).toBe('molecules');
  await page.locator('#compare').click(); await expect(page.locator('#feedback')).toContainText('Compare ice');
  await completeLens(page);
  await page.locator('#next').click();
  expect((await snapshot(page)).scene).toBe('heat');
  await page.locator('#record-heat').click(); await expect(page.locator('#feedback')).toContainText('Find a phase mixture');
  await setRange(page.locator('#heat'),2);
  await expect(page.locator('#temperature')).toHaveText('0.0 °C');
  await expect(page.locator('#fractions')).toContainText('liquid 47%');
  await setRange(page.locator('#heat'),3);
  await expect(page.locator('#temperature')).toHaveText('0.0 °C');
  await expect(page.locator('#fractions')).toContainText('liquid 77%');
  await page.locator('#record-heat').click();
  expect((await snapshot(page)).completed).toEqual([true,true,true]);
  await setRange(page.locator('#heat'),12); await expect(page.locator('#temperature')).toHaveText('100.0 °C');
  await page.locator('#heat-up').click();
  await expect.poll(async () => (await snapshot(page)).heat).toBeGreaterThan(12.05);
  await page.locator('#heater-stop').click();
  const held = (await snapshot(page)).heat;
  await page.waitForTimeout(200); expect((await snapshot(page)).heat).toBe(held);
  await page.locator('#cool').click();
  await expect.poll(async () => (await snapshot(page)).heat).toBeLessThan(held-.05);
  await page.keyboard.press('Escape');
  const paused = (await snapshot(page)).time;
  await page.waitForTimeout(180); expect((await snapshot(page)).time).toBe(paused);
  await page.locator('#next').click();
  expect((await snapshot(page)).scene).toBe('coast');
  expect((await snapshot(page)).camera.z).toBe(-1);
  await page.reload(); await page.waitForFunction(() => Boolean(window.__physicsGame));
  expect((await snapshot(page)).completed).toEqual([true,true,true]);
  await page.locator('#reset').click(); expect((await snapshot(page)).completed).toEqual([false,false,false]);
  await assertNoErrors(errors);
});

test('keyboard, touch and bilingual controls remain reachable without mouse lock',async ({page}) => {
  const errors = watchPage(page); await start(page,'zh-CN');
  await page.locator('#game-canvas').focus();
  for (const key of ['w','a','s','d','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','e']) await page.keyboard.press(key);
  expect((await snapshot(page)).camera.z).toBe(-1);
  const old = (await snapshot(page)).camera.yaw;
  const box = await page.locator('#game-canvas').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down();
  await page.mouse.move(box.x+box.width*.65,box.y+box.height*.6); await page.mouse.up();
  expect((await snapshot(page)).camera.yaw).not.toBe(old);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    await expect(page.locator('#release')).toBeVisible();
    await assertLayout(page);
  }
  await page.locator('[data-lang="en"]').click(); await expect(page.locator('#task-title')).toHaveText('Will it float?');
  await page.locator('[data-lang="zh-CN"]').click(); await expect(page.locator('#task-title')).toHaveText('它会浮起来吗？');
  await completeShore(page); await page.locator('#next').click(); await completeLens(page); await page.locator('#next').click();
  await setRange(page.locator('#heat'),14); await expect(page.locator('#phase-name')).toContainText('沸腾');
  await page.locator('#record-heat').click();
  await assertNoErrors(errors);
});

test('game entrypoints are discoverable on both existing home pages',async ({page}) => {
  for (const [route,selector] of [['/','[data-i18n="hero.game"]'],['/physics/index.html','a[href="game.html"]']]) {
    await preparePage(page,route,'en',{reducedMotion:'reduce'});
    await expect(page.locator(selector)).toContainText('Universe, In Person');
    await page.locator(selector).click(); await page.waitForFunction(() => Boolean(window.__physicsGame));
    await expect(page.locator('h1')).toHaveText('Universe, In Person');
  }
});

test('bounded desktop and mobile scene inspection',async ({page}) => {
  await mkdir('test-results/game-inspection',{recursive:true});
  await start(page); await page.locator('#approach').click();
  await completeShore(page); await page.waitForTimeout(2400); await page.keyboard.press('Escape');
  await page.screenshot({path:'test-results/game-inspection/desktop-coast.png',fullPage:true});
  await page.locator('#density').selectOption('7800'); await completeShore(page);
  await page.waitForTimeout(2400); await page.keyboard.press('Escape');
  await page.screenshot({path:'test-results/game-inspection/desktop-steel.png',fullPage:true});
  await page.locator('#next').click();
  await completeLens(page); await page.locator('#next').click(); await page.keyboard.press('Escape');
  await setRange(page.locator('#heat'),12);
  await expect(page.locator('#scene-model')).toHaveText('Molecular schematic · not to scale');
  await page.screenshot({path:'test-results/game-inspection/desktop-heat.png',fullPage:true});
  await page.setViewportSize({width:390,height:844}); await page.locator('[data-lang="zh-CN"]').click();
  await expect(page.locator('#scene-model')).toHaveText('分子示意 · 非真实比例');
  await page.screenshot({path:'test-results/game-inspection/mobile-heat.png',fullPage:true});
  await page.locator('#heat-up').click();
  await expect.poll(async () => (await snapshot(page)).heat).toBeGreaterThan(12.05);
  await page.locator('#heater-stop').click();
  await expect(page.locator('#scene-quantities')).toBeVisible();
  await expect(page.locator('#scene-model')).toBeVisible();
  await expect(page.locator('#scene-fractions')).toContainText('气');
  await page.screenshot({path:'test-results/game-inspection/mobile-operating.png'});
});
