import {test,expect} from '@playwright/test';
import {openAdventure,adventureSnapshot as snap} from './helpers/game-adventure.js';
import {projectedMarker,blankImage} from './helpers/walking-marker.mjs';
import {installWalkingCamera,feedWalkingFrame} from './helpers/walking-camera.js';
import {watchPage,assertNoErrors,assertLayout} from './helpers/assertions.js';

test.use({hasTouch:true,isMobile:true});

test('WebKit honors native media capabilities: frame tracking when available, honest touch fallback otherwise',async({page})=>{
  const errors=watchPage(page);await installWalkingCamera(page);await openAdventure(page);await page.locator('#mission-start').tap();await page.locator('#view-toggle').tap();
  if(!await page.evaluate(()=>Boolean(window.__walkingMedia))) {
    const supported=(await snap(page)).cameraWalk.supported;
    if(!supported) {
      await page.locator('#camera-walk').tap();await expect(page.locator('#camera-walk-status')).toContainText('camera access');
    } else expect((await snap(page)).cameraWalk.wanted).toBe(false);
    await expect(page.locator('#camera-preview')).toBeHidden();
    await page.locator('#view-toggle').tap();await page.locator('#mode-lab').tap();
    const before=(await snap(page)).camera;await page.locator('[data-move="forward"]').tap();expect((await snap(page)).camera.z).toBeLessThan(before.z);
    await assertNoErrors(errors);
    test.info().annotations.push({type:'platform',description:supported ? 'Camera API available, but no native captureStream fixture; touch controls verified without opening a physical camera.' : 'This WebKit build has no native camera API; unsupported fallback and touch controls verified.'});return;
  }
  await feedWalkingFrame(page,projectedMarker());await page.locator('#camera-walk').tap();await expect.poll(async()=>(await snap(page)).cameraWalk.phase).toBe('active');
  const initial=(await snap(page)).camera;
  await page.evaluate(async()=>{
    const image=new Image();image.src='game-walking-marker.svg';await image.decode();
    const source=window.__walkingMedia.source,ctx=source.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,320,240);ctx.drawImage(image,115,75,90,90);
  });
  await expect.poll(async()=>initial.z-(await snap(page)).camera.z).toBeGreaterThan(.1);
  expect((await snap(page)).camera.y).toBe(initial.y);expect((await snap(page)).camera.pitch).toBe(initial.pitch);
  await feedWalkingFrame(page,blankImage());await expect.poll(async()=>(await snap(page)).cameraWalk.phase).toBe('lost');
  const frozen=(await snap(page)).camera;await feedWalkingFrame(page,projectedMarker({position:{x:.1,y:0,z:-.7}}));
  await expect.poll(async()=>(await snap(page)).cameraWalk.phase).toBe('active');expect((await snap(page)).camera).toEqual(frozen);
  await expect(page.locator('#look-stop')).toBeInViewport();await assertLayout(page);await page.locator('#view-toggle').tap();
  await expect.poll(()=>page.evaluate(()=>window.__walkingMedia.allStopped())).toBe(true);expect((await snap(page)).cameraWalk.wanted).toBe(false);await assertNoErrors(errors);
});

test('WebKit denies and cancels late camera permission safely through touch and pagehide',async({page})=>{
  const errors=watchPage(page);
  await page.addInitScript(()=>{
    const control={mode:'denied',pending:[],stopped:0};window.__cameraPermission=control;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{
      if(control.mode==='denied') throw new DOMException('denied','NotAllowedError');
      return new Promise(resolve=>control.pending.push(resolve));
    }}});
  });
  await openAdventure(page);await page.locator('#mission-start').tap();await page.locator('#view-toggle').tap();await page.locator('#camera-walk').tap();
  await expect(page.locator('#camera-walk-status')).toContainText('permission denied');
  await page.evaluate(()=>window.__cameraPermission.mode='pending');
  for(const exit of ['touch','pagehide']) {
    await page.locator('#camera-walk').tap();await expect.poll(async()=>(await snap(page)).cameraWalk.pending).toBe(true);
    if(exit==='touch') await page.locator('#look-stop').tap();else await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));
    await page.evaluate(()=>window.__cameraPermission.pending.shift()({getTracks:()=>[{stop(){window.__cameraPermission.stopped++;}}]}));
    await expect.poll(()=>page.evaluate(()=>window.__cameraPermission.stopped)).toBe(exit==='touch' ? 1 : 2);
    expect((await snap(page)).cameraWalk.wanted).toBe(false);
    if(exit==='touch') await page.locator('#view-play').tap();
  }
  await assertNoErrors(errors);
});
