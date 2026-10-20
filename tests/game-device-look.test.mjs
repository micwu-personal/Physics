import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeviceLook, deviceDirection } from '../physics/game-device-look.js';

const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-9,`${a} != ${b}`);
function fixture(options={}) {
  const listeners = new Map(), timers = new Map(), statuses = [];
  let active = true, camera = {x:3,y:1.65,z:6,yaw:.4,pitch:.1}, nextTimer = 0;
  const environment = {isSecureContext:true,DeviceOrientationEvent:{},
    addEventListener(type,listener) { listeners.set(type,listener); },
    removeEventListener(type) { listeners.delete(type); },
    setTimeout(callback) { timers.set(++nextTimer,callback); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },...options};
  const look = createDeviceLook({environment,getCamera:() => camera,isActive:() => active,onStatus:() => statuses.push(look.snapshot().phase)});
  const emit = (alpha=0,beta=90,gamma=0) => listeners.get('deviceorientation')?.({alpha,beta,gamma});
  return {look,environment,listeners,timers,statuses,emit,get camera() { return camera; },
    replace(value) { camera = {...camera,...value}; },activate(value) { active = value; },
    expire() { for (const callback of [...timers.values()]) callback(); }};
}

test('W3C rotation produces a correct screen normal in portrait, landscape and upside-down poses',() => {
  for (const event of [{alpha:null,beta:90,gamma:0},{alpha:0,beta:NaN,gamma:0},{alpha:0,beta:90,gamma:Infinity},{beta:90,gamma:0}]) assert.equal(deviceDirection(event),null);
  close(deviceDirection({alpha:0,beta:90,gamma:0}).yaw,0);
  close(deviceDirection({alpha:90,beta:90,gamma:0}).yaw,-Math.PI/2);
  close(deviceDirection({alpha:0,beta:60,gamma:0}).pitch,-Math.PI/6);
  close(deviceDirection({alpha:0,beta:0,gamma:-90}).yaw,Math.PI/2);
  close(deviceDirection({alpha:0,beta:0,gamma:90}).yaw,-Math.PI/2);
  close(Math.abs(deviceDirection({alpha:0,beta:-90,gamma:0}).yaw),Math.PI);
  assert.equal(deviceDirection({alpha:0,beta:0,gamma:0}).yaw,null);
});

test('orientation is opt-in, first reading calibrates, rotation never changes physical position',async () => {
  const f = fixture(); assert.equal(f.listeners.size,0); f.look.sync(); f.look.recenter();
  await f.look.enable(); assert.equal(f.look.snapshot().phase,'waiting'); assert.equal(f.timers.size,1);
  f.emit(null); assert.equal(f.look.snapshot().phase,'waiting');
  f.emit(); close(f.camera.yaw,.4); close(f.camera.pitch,.1); assert.equal(f.timers.size,0);
  f.emit(30,80); close(f.camera.yaw,.4-Math.PI/6); close(f.camera.pitch,.1-Math.PI/18);
  const view = {...f.camera}; f.look.sync(); assert.equal(f.look.snapshot().phase,'active'); assert.deepEqual(f.camera,view);
  assert.deepEqual([f.camera.x,f.camera.y,f.camera.z],[3,1.65,6]);
  f.look.disable(); assert.equal(f.listeners.size,0); assert.equal(f.look.snapshot().phase,'off'); f.emit(100);
  close(f.camera.yaw,.4-Math.PI/6);
});

test('heading crosses 359/1 degrees by the shortest path, with no accumulated full-turn jump',async () => {
  const f = fixture(); await f.look.enable(); f.emit(359); f.emit(1);
  close(f.camera.yaw,.4-2*Math.PI/180); f.emit(359); close(f.camera.yaw,.4);
});

test('vertical devices keep the previous heading, constrain pitch and recover from the singularity',async () => {
  const f = fixture(); await f.look.enable(); f.emit(0,0); f.emit(60,0);
  close(f.camera.yaw,.4); f.emit(0,90); assert.equal(f.camera.pitch,1);
  f.emit(0,180); assert.equal(f.camera.pitch,1); f.emit(0,0); assert.equal(f.camera.pitch,-1);
  f.emit(0,90); f.emit(90,90); const yaw = f.camera.yaw; f.emit(90,0); close(f.camera.yaw,yaw);
});

test('pause and resume discard inactive motion and rebase without changing the view',async () => {
  const f = fixture(); await f.look.enable(); f.emit(); f.emit(10);
  const yaw = f.camera.yaw; f.activate(false); f.look.sync(); f.look.sync(); assert.equal(f.look.snapshot().phase,'paused');
  f.emit(140,20); close(f.camera.yaw,yaw); f.activate(true); f.look.sync();
  assert.equal(f.look.snapshot().phase,'waiting'); f.emit(180,90); close(f.camera.yaw,yaw);
  f.emit(190); close(f.camera.yaw,yaw-Math.PI/18);
});

test('sensor events also suspend safely when the caller has not yet synchronized lifecycle state',async () => {
  const f = fixture(); await f.look.enable(); f.activate(false); f.emit();
  assert.equal(f.look.snapshot().phase,'paused'); f.activate(true); f.emit(30); close(f.camera.yaw,.4);
});

test('recenter, manual drag, camera replacement and screen-orientation recalibration preserve intentional views',async () => {
  const f = fixture(); await f.look.enable(); f.emit(); f.emit(30);
  f.look.recenter(); const yaw = f.camera.yaw; f.emit(60); close(f.camera.yaw,yaw);
  f.camera.yaw = 2; f.emit(70); close(f.camera.yaw,2);
  f.camera.pitch = -.4; f.emit(80,70); close(f.camera.pitch,-.4);
  f.replace({yaw:-1}); f.emit(90); close(f.camera.yaw,-1);
  f.activate(false); f.look.recenter(); assert.equal(f.look.snapshot().phase,'paused');
  await f.look.enable(); assert.equal(f.look.snapshot().enabled,false);
});

test('permission is requested synchronously with the enable gesture, and grants attach sensors',async () => {
  let called = false, receiver;
  const f = fixture({DeviceOrientationEvent:{requestPermission() { called = true; receiver = this; return Promise.resolve('granted'); }}});
  const request = f.look.enable(); assert.equal(called,true); assert.equal(receiver,f.environment.DeviceOrientationEvent);
  assert.equal(f.look.snapshot().pending,true); await request; assert.equal(f.look.snapshot().enabled,true);
});

test('denial and exceptions leave touch fallback available and do not attach sensors',async () => {
  for (const requestPermission of [async () => 'denied',async () => { throw new Error('Permission blocked'); }]) {
    const f = fixture({DeviceOrientationEvent:{requestPermission}}); await f.look.enable();
    assert.equal(f.look.snapshot().phase,'denied'); assert.equal(f.look.snapshot().enabled,false); assert.equal(f.listeners.size,0);
  }
});

test('missing API and insecure contexts never request permission',async () => {
  for (const options of [{DeviceOrientationEvent:undefined},{isSecureContext:false}]) {
    const f = fixture(options); await f.look.enable(); assert.equal(f.look.snapshot().phase,'unavailable'); assert.equal(f.look.snapshot().supported,false);
  }
});

test('missing or null readings time out and allow a fresh retry',async () => {
  const f = fixture(); await f.look.enable(); f.emit(null,null,null); f.expire();
  assert.equal(f.look.snapshot().phase,'noReadings'); assert.equal(f.timers.size,0); assert.equal(f.listeners.size,0);
  await f.look.enable(); f.emit(); assert.equal(f.look.snapshot().phase,'active');
});

test('cancelled pending permission cannot activate later or overwrite the off status',async () => {
  for (const outcome of ['granted','denied','reject']) {
    let settle;
    const f = fixture({DeviceOrientationEvent:{requestPermission:() => new Promise((resolve,reject) => { settle = outcome === 'reject' ? reject : resolve; })}});
    const request = f.look.enable(); await f.look.enable(); assert.equal(f.look.snapshot().phase,'off');
    settle(outcome); await request; assert.equal(f.look.snapshot().phase,'off'); assert.equal(f.listeners.size,0);
  }
});
