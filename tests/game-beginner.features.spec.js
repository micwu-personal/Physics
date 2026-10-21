import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {adventureSnapshot as snap,openAdventure,travel,build,dock,relay} from './helpers/game-adventure.js';
import {watchPage,assertNoErrors,assertLayout} from './helpers/assertions.js';

const emit = (page,alpha) => page.evaluate(value => window.dispatchEvent(Object.assign(new Event('deviceorientation'),{alpha:value,beta:90,gamma:0})),alpha);

test('tablet touch aim survives sensor recalibration, small hand movement and bilingual responsive controls',async ({browser,baseURL}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({baseURL,hasTouch:true,isMobile:true,viewport:{width:1024,height:768}});
  try {
    const page = await context.newPage(), errors = watchPage(page);
    await page.addInitScript(() => {
      class Orientation extends Event { static async requestPermission() { return 'granted'; } }
      Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:Orientation});
    });
    await openAdventure(page); await page.locator('#mission-start').tap();
    await build(page); await dock(page); await relay(page); await travel(page,'z',-31);
    await page.locator('#adventure-interact').tap();
    await page.locator('#view-toggle').tap(); await page.locator('#device-look').tap(); await emit(page,0);
    await expect(page.locator('#device-status')).toContainText('physical walking is not tracked');
    const position = (await snap(page)).camera;
    await emit(page,20);
    await page.locator('#approach').tap();
    await expect(page.locator('#mission-message')).toContainText('Gravity-correct aim set');
    const aimed = (await snap(page)).camera;
    expect([aimed.x,aimed.y,aimed.z]).toEqual([position.x,position.y,position.z]);
    expect(aimed.pitch).toBeGreaterThan(.3);
    await emit(page,30); expect((await snap(page)).camera).toEqual(aimed);
    await emit(page,32); expect((await snap(page)).camera.yaw).toBeCloseTo(aimed.yaw-2*Math.PI/180,5);
    await mkdir('test-results/beginner-inspection',{recursive:true});
    let currentLang = 'en';
    for (const [name,width,height,lang] of [['desktop',1440,900,'en'],['phone',390,844,'zh-CN'],['tablet',1024,768,'zh-CN']]) {
      await page.setViewportSize({width,height});
      if (lang !== currentLang) {
        await page.locator('#view-toggle').tap(); await page.locator(`[data-lang="${lang}"]`).tap();
        await page.locator('#view-toggle').tap(); await page.locator('#view-play').tap();
        await page.locator('#device-look').tap(); currentLang = lang;
      }
      await emit(page,32);
      await expect(page.locator('#approach')).toHaveText(lang === 'en' ? 'Aim throw at receiver' : '对准接收环投掷');
      await page.locator('#adventure-throw').scrollIntoViewIfNeeded();
      await expect(page.locator('#adventure-throw')).toBeInViewport();
      expect(await page.locator('#adventure-throw').evaluate(element => {
        const box = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));
      })).toBe(true);
      await assertLayout(page);
      await page.screenshot({path:`test-results/beginner-inspection/${name}-aim.png`});
    }
    await page.locator('#adventure-throw').tap();
    await expect.poll(async () => (await snap(page)).adventure.won,{timeout:7000}).toBe(true);
    expect((await snap(page)).adventure.shots).toBe(1);
    await expect(page.locator('#mission-overlay-title')).toHaveText('灯塔再次亮起。');
    await assertNoErrors(errors);
  } finally { await context.close(); }
});
