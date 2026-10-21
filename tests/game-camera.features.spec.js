import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {openAdventure,adventureSnapshot as snap} from './helpers/game-adventure.js';
import {projectedMarker,blankImage} from './helpers/walking-marker.mjs';
import {installWalkingCamera,feedWalkingFrame} from './helpers/walking-camera.js';
import {watchPage,assertNoErrors,assertLayout} from './helpers/assertions.js';
const walk=async page=>(await snap(page)).cameraWalk;
test.beforeEach(async({page})=>{if(process.env.PHYSICS_GAME_COVERAGE==='1') await page.coverage.startJSCoverage({resetOnNavigation:false});});
test.afterEach(async({page},info)=>{
  if(process.env.PHYSICS_GAME_COVERAGE!=='1') return;
  const directory=`test-results\\coverage-raw${process.env.PHYSICS_TEST_PORT ? `-${process.env.PHYSICS_TEST_PORT}` : ''}`;
  await mkdir(directory,{recursive:true});await writeFile(`${directory}\\game-camera-${info.testId.slice(-12)}.json`,JSON.stringify(await page.coverage.stopJSCoverage()));
});
async function start(page) {
  await installWalkingCamera(page);await openAdventure(page);
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.requests)).toBe(0);
  await page.locator('#mission-start').click();await page.locator('#view-toggle').click();
  await feedWalkingFrame(page,projectedMarker());await page.locator('#camera-walk').click();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');
}

test('native video frames move the game forward/back/sideways; loss, touch and turns re-anchor without teleporting',async({page})=>{
  const errors=watchPage(page);await start(page);const initial=(await snap(page)).camera;
  await feedWalkingFrame(page,projectedMarker({position:{x:0,y:0,z:-.62}}));
  await expect.poll(async()=>initial.z-(await snap(page)).camera.z).toBeGreaterThan(.06);
  await feedWalkingFrame(page,projectedMarker({position:{x:0,y:0,z:-.77}}));
  await expect.poll(async()=>(await snap(page)).camera.z-initial.z).toBeGreaterThan(.04);
  await feedWalkingFrame(page,projectedMarker({position:{x:.08,y:0,z:-.77}}));
  await expect.poll(async()=>(await snap(page)).camera.x-initial.x).toBeGreaterThan(.06);
  await feedWalkingFrame(page,blankImage());await expect.poll(async()=>(await walk(page)).phase).toBe('lost');
  const frozen=(await snap(page)).camera;await feedWalkingFrame(page,projectedMarker({position:{x:-.1,y:0,z:-.7}}));
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(frozen);
  await page.locator('[data-move="forward"]').click();const moved=(await snap(page)).camera;
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(moved);
  await page.locator('#camera-recenter').click();await expect.poll(async()=>(await walk(page)).phase).toBe('active');
  await page.evaluate(()=>window.dispatchEvent(new Event('orientationchange')));await expect.poll(async()=>(await walk(page)).phase).toBe('active');
  expect((await snap(page)).camera).toEqual(moved);
  await feedWalkingFrame(page,projectedMarker({position:{x:-.1,y:0,z:-.7},yaw:.12,pitch:.05}));
  await expect.poll(async()=>(await walk(page)).phase,{intervals:[50]}).toBe('calibrating');
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(moved);
  await page.locator('.camera-help summary').click();await page.locator('#camera-marker-size').fill('18');
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(moved);
  await page.locator('#camera-fov').fill('65');await expect(page.locator('#camera-fov-value')).toHaveText('65°');
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(moved);
  await page.locator('#camera-marker-size').fill('4');await page.locator('#camera-walk').click();
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await page.locator('#camera-walk').click();expect((await walk(page)).wanted).toBe(false);
  await page.locator('#camera-marker-size').fill('16');await page.locator('#camera-fov').fill('60');await page.locator('#camera-walk').click();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');
  await page.locator('#view-play').click();await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await expect(page.locator('#camera-walk-status')).toContainText('Camera off while paused');
  const paused=(await snap(page)).camera;await feedWalkingFrame(page,projectedMarker());await page.locator('#view-play').click();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');expect((await snap(page)).camera).toEqual(paused);
  await page.locator('#look-stop').click();await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);expect((await walk(page)).wanted).toBe(false);
  await assertNoErrors(errors);
});

test('denial, late permission cancellation, hidden pages and GPU loss cannot leak camera tracks',async({page})=>{
  const errors=watchPage(page);await installWalkingCamera(page);await openAdventure(page);await page.locator('#mission-start').click();await page.locator('#view-toggle').click();
  await page.evaluate(()=>window.__walkingMedia.mode='denied');await page.locator('#camera-walk').click();
  await expect(page.locator('#camera-walk-status')).toContainText('permission denied');expect((await walk(page)).wanted).toBe(false);
  await page.evaluate(()=>window.__walkingMedia.mode='pending');await page.locator('#camera-walk').click();await expect.poll(async()=>(await walk(page)).pending).toBe(true);
  await page.locator('#camera-walk').click();await page.evaluate(()=>window.__walkingMedia.pending.shift()(window.__walkingMedia.stream()));
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await page.evaluate(()=>window.__walkingMedia.mode='ok');await feedWalkingFrame(page,projectedMarker());await page.locator('#camera-walk').click();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');
  await page.evaluate(()=>document.getElementById('game-canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);expect((await walk(page)).wanted).toBe(false);expect((await snap(page)).mode).toBe('lab');
  await assertNoErrors(errors);
});

test('actual printable SVG passes native video detection in lab mode; offscreen, exit and mouse look stop camera access',async({page})=>{
  const errors=watchPage(page);await installWalkingCamera(page);await openAdventure(page);await page.locator('#mode-lab').click();
  await page.locator('#play').click();await feedWalkingFrame(page,projectedMarker());await page.locator('#camera-walk').click();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');const initial=(await snap(page)).camera;
  await page.evaluate(async()=>{
    const image=new Image();image.src='game-walking-marker.svg';await image.decode();
    const source=window.__walkingMedia.source,ctx=source.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,320,240);ctx.drawImage(image,115,75,90,90);
  });
  await expect.poll(async()=>initial.z-(await snap(page)).camera.z).toBeGreaterThan(.1);
  expect((await snap(page)).camera.y).toBe(initial.y);expect((await snap(page)).camera.pitch).toBe(initial.pitch);
  await page.setViewportSize({width:1440,height:400});await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  await expect.poll(async()=>(await snap(page)).visible).toBe(false);await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await page.setViewportSize({width:1440,height:1000});await page.locator('#game-canvas').scrollIntoViewIfNeeded();
  await expect.poll(async()=>(await walk(page)).phase).toBe('active');await page.locator('#view-toggle').click();
  await page.locator('.camera-help summary').click();await page.locator('.camera-help a').focus();await page.keyboard.press('Tab');await expect(page.locator('#camera-marker-size')).toBeFocused();
  await page.locator('#mouse-lock').click();await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);expect((await walk(page)).wanted).toBe(false);
  await page.keyboard.press('Escape');expect((await snap(page)).expanded).toBe(false);await expect(page.locator('#look-stop')).toBeHidden();await assertNoErrors(errors);
});

test('camera preview, stop and marker setup remain accessible across bilingual phone/tablet layouts',async({page})=>{
  const errors=watchPage(page);await start(page);await mkdir('test-results/camera-inspection',{recursive:true});
  for(const [name,width,height] of [['desktop',1440,900],['phone',390,844],['tablet',1024,768],['landscape',844,390]]) {
    await page.setViewportSize({width,height});await page.locator('.camera-help summary').click();
    await page.locator('#camera-marker-size').scrollIntoViewIfNeeded();await expect(page.locator('#look-stop')).toBeInViewport();await expect(page.locator('#camera-preview')).toBeInViewport();
    expect(await page.locator('#look-stop').evaluate(element=>{const r=element.getBoundingClientRect();return element.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
    await assertLayout(page);
    if(process.env.PHYSICS_CAMERA_INSPECT==='1') await page.screenshot({path:`test-results/camera-inspection/${name}.png`});
    await page.locator('.camera-help summary').click();
  }
  await page.locator('#view-toggle').click();await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);
  await page.locator('[data-lang="zh-CN"]').click();await page.locator('#view-toggle').click();await page.locator('#view-play').click();
  await page.locator('#camera-walk').click();await expect(page.locator('#camera-walk-status')).toContainText('追踪中');
  await expect(page.locator('#device-status')).toContainText('相机行走');await expect(page.locator('.camera-help summary')).toContainText('定位卡');
  await page.locator('#look-stop').click();await assertNoErrors(errors);
});
