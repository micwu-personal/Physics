import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {adventureSnapshot as snap,openAdventure as open,travel,build,dock,relay,signal} from './helpers/game-adventure.js';
import {watchPage,assertNoErrors,assertLayout} from './helpers/assertions.js';

test('rescue plays through actual movement, failed materials, latent heat, ballistic aim and replay',async ({page}) => {
  test.setTimeout(120000); const errors = watchPage(page); await open(page);
  expect((await snap(page)).playing).toBe(false);
  await expect(page.locator('#notebook')).toBeHidden();
  const before = await page.locator('#game-canvas').screenshot();
  await page.locator('#mission-start').click();
  await build(page,true);
  const after = await page.locator('#game-canvas').screenshot(); expect(before.equals(after)).toBe(false);
  await dock(page); await relay(page); await signal(page);
  await expect(page.locator('#mission-overlay-title')).toHaveText('The lighthouse is back.');
  expect((await snap(page)).playing).toBe(false);
  expect((await snap(page)).adventure.best).toBeGreaterThan(0);
  await page.locator('#mission-retry').click();
  expect((await snap(page)).adventure.wood).toBe(0);
  expect((await snap(page)).adventure.won).toBe(false);
  await page.keyboard.press('Escape');
  await page.locator('#mode-lab').click(); await expect(page.locator('#release')).toBeVisible();
  await page.locator('#mode-adventure').click();
  expect((await snap(page)).adventure.started).toBe(true);
  await assertNoErrors(errors);
});

test('jump, recovery, pause, optional sound and bilingual mobile controls are usable',async ({page}) => {
  const errors = watchPage(page); await open(page); await page.locator('#mission-start').click();
  await page.locator('#adventure-jump').click();
  await expect.poll(async () => (await snap(page)).camera.y).toBeGreaterThan(1.85);
  await expect.poll(async () => (await snap(page)).camera.y).toBe(1.65);
  await page.locator('#adventure-sound').click(); await expect(page.locator('#adventure-sound')).toHaveAttribute('aria-pressed','true');
  await page.locator('#adventure-sound').click(); await expect(page.locator('#adventure-sound')).toHaveAttribute('aria-pressed','false');
  await page.keyboard.press('Escape');
  const elapsed = (await snap(page)).adventure.elapsed; await page.waitForTimeout(220); expect((await snap(page)).adventure.elapsed).toBe(elapsed);
  await page.locator('#adventure-play').click();
  await travel(page,'x',8.6);
  await expect.poll(async () => (await snap(page)).adventure.rescues,{timeout:6000}).toBe(1);
  expect((await snap(page)).camera.z).toBe(6);
  await page.locator('#adventure-recover').click(); expect((await snap(page)).adventure.rescues).toBe(2);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.locator('[data-lang="zh-CN"]').click();
    await expect(page.locator('#mission-title')).toContainText('造好渡水工具');
    await expect(page.locator('#adventure-interact')).toBeVisible(); await assertLayout(page);
  }
  await page.locator('[data-lang="en"]').click(); await expect(page.locator('#mission-title')).toContainText('Build your crossing');
  await assertNoErrors(errors);
});

test('batched desktop and mobile rescue scene inspection',async ({page}) => {
  await mkdir('test-results/rescue-inspection',{recursive:true});
  await open(page);
  await page.screenshot({path:'test-results/rescue-inspection/desktop-brief.png'});
  await page.locator('#mission-start').click(); await page.keyboard.press('Escape');
  await page.screenshot({path:'test-results/rescue-inspection/desktop-play.png'});
  await page.setViewportSize({width:390,height:844}); await page.locator('[data-lang="zh-CN"]').click();
  await page.screenshot({path:'test-results/rescue-inspection/mobile-play.png',fullPage:true});
  await page.reload(); await page.waitForFunction(() => Boolean(window.__physicsGame));
  await page.screenshot({path:'test-results/rescue-inspection/mobile-brief.png',fullPage:true});
});
