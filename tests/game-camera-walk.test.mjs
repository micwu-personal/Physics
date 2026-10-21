import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCameraWalk} from '../physics/game-camera-walk.js';
import {projectedMarker} from './helpers/walking-marker.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const pose=(x=0,z=-.7)=>({position:{x,y:0,z},forward:{x:0,y:0,z:1}});
function fixture(options={}) {
  let active=true,camera={x:0,y:1.65,z:6,yaw:0,pitch:.3},current=pose(),image=projectedMarker(),id=0,calls=0;
  const callbacks=new Map(),statuses=[],motions=[],tracks=[];
  const newStream=()=>{const listeners=new Map(),track={stopped:0,stop(){this.stopped++;},addEventListener(name,fn){listeners.set(name,fn);},end(){listeners.get('ended')?.();}};tracks.push(track);return {getTracks:()=>[track]};};
  const video={readyState:2,videoWidth:320,videoHeight:240,srcObject:null,play:async()=>{},pause(){}};
  const context={drawImage(){},getImageData:()=>image};
  const surface={width:0,height:0,getContext:()=>options.noContext ? null : context};
  const environment={isSecureContext:!options.insecure,navigator:{mediaDevices:{getUserMedia:async request=>{calls++;assert.equal(request.audio,false);assert.equal(request.video.facingMode.ideal,'environment');return newStream();}}},
    requestAnimationFrame(fn){callbacks.set(++id,fn);return id;},cancelAnimationFrame(id){callbacks.delete(id);}};
  if(options.noMedia) environment.navigator={};
  const controller=createCameraWalk({environment,video,surface,getCamera:()=>camera,isActive:()=>active,
    onMotion:(x,z)=>{motions.push([x,z]);camera.x+=x;camera.z+=z;},onStatus:()=>statuses.push(controller.snapshot().phase),getOptions:()=>({size:.16,fieldOfView:60}),
    ...(!options.realDetector ? {detect:()=>{if(current instanceof Error) throw current;return current;}} : {})});
  const frame=now=>{const entry=callbacks.entries().next().value;assert.ok(entry,'a frame was scheduled');callbacks.delete(entry[0]);entry[1](now);};
  return {controller,video,context,surface,environment,callbacks,statuses,motions,tracks,newStream,frame,
    get camera(){return camera;},set camera(value){camera=value;},set active(value){active=value;},set pose(value){current=value;},set image(value){image=value;},get calls(){return calls;},
    async begin(){await controller.enable();frame(0);frame(100);frame(200);assert.equal(controller.snapshot().phase,'active');}};
}

test('opt-in camera is initially off, needs a secure context, and never prompts on construction',async()=>{
  for(const options of [{insecure:true},{noMedia:true},{noContext:true}]) {const f=fixture(options);assert.equal(f.calls,0);await f.controller.enable();assert.equal(f.calls,0);assert.equal(f.controller.snapshot().phase,'unavailable');}
  const f=fixture();assert.equal(f.calls,0);f.controller.sync();f.controller.recenter();assert.equal(f.controller.snapshot().phase,'off');
  f.active=false;await f.controller.enable();assert.equal(f.calls,0);assert.equal(f.controller.snapshot().phase,'paused');
  f.active=true;await f.controller.sync();assert.equal(f.calls,1);assert.equal(f.controller.snapshot().phase,'searching');f.controller.disable();
});

test('stable calibration preserves position; genuine nearer/farther/sideways movement maps to the fixed game heading',async()=>{
  const f=fixture();await f.begin();const original={...f.camera};assert.equal(f.motions.length,0);
  f.pose=pose(0,-.6);f.frame(300);assert.ok(f.camera.z<original.z);assert.equal(f.camera.y,original.y);assert.equal(f.camera.pitch,original.pitch);
  for(let i=4;i<14;i++) f.frame(i*100);assert.ok(Math.abs(f.camera.z-(original.z-.1))<.005);
  f.pose=pose(0,-.75);for(let i=14;i<25;i++) f.frame(i*100);assert.ok(f.camera.z>original.z);
  f.pose=pose(.1,-.75);for(let i=25;i<36;i++) f.frame(i*100);assert.ok(f.camera.x>.095);
  const g=fixture();g.camera.yaw=Math.PI/2;await g.begin();g.camera.yaw=0;g.pose=pose(0,-.6);g.frame(300);
  assert.ok(g.camera.x>0);assert.ok(Math.abs(g.camera.z-6)<1e-9);assert.ok(g.controller.snapshot().meters>0);f.controller.disable();g.controller.disable();
});

test('actual RGBA frames pass through drawing, detection and movement, including portrait resizing',async()=>{
  const f=fixture({realDetector:true});await f.begin();const before={...f.camera};
  f.image=projectedMarker({position:{x:0,y:0,z:-.62}});for(let i=3;i<9;i++) f.frame(i*100);
  assert.ok(f.camera.z<before.z-.06);assert.ok(Math.abs(f.camera.x-before.x)<.01);
  f.video.videoWidth=240;f.video.videoHeight=320;f.image=projectedMarker({width:240,height:320,roll:Math.PI/2});
  const prior={...f.camera};f.frame(900);assert.deepEqual(f.camera,prior);assert.equal(f.controller.snapshot().phase,'calibrating');
  f.frame(1000);f.frame(1100);assert.equal(f.controller.snapshot().phase,'active');
  f.image=projectedMarker({width:240,height:320,roll:Math.PI/2,position:{x:.08,y:0,z:-.7}});
  for(let i=12;i<20;i++) f.frame(i*100);assert.ok(f.camera.x>prior.x+.06);f.controller.disable();
});

test('loss, instability, manual movement, recenter and replacement cameras re-anchor without a teleport',async()=>{
  const f=fixture();await f.begin();const original={...f.camera};f.pose=null;f.frame(300);assert.equal(f.controller.snapshot().phase,'lost');assert.deepEqual(f.camera,original);
  f.pose=pose(.2,-.7);f.frame(400);f.frame(500);f.frame(600);assert.deepEqual(f.camera,original);
  f.pose=pose(.6,-.7);f.frame(700);assert.equal(f.controller.snapshot().phase,'unstable');assert.deepEqual(f.camera,original);
  f.frame(800);f.pose=pose(.7,-.7);f.frame(900);assert.equal(f.controller.snapshot().phase,'calibrating');assert.deepEqual(f.camera,original);
  f.frame(1000);f.frame(1100);f.frame(1200);f.controller.recenter();assert.equal(f.controller.snapshot().phase,'calibrating');
  f.frame(1300);f.frame(1400);f.frame(1500);f.camera.x=2;f.frame(1600);assert.equal(f.camera.x,2);assert.equal(f.controller.snapshot().phase,'calibrating');
  f.camera={...f.camera,z:3};f.frame(1700);assert.equal(f.camera.z,3);f.frame(1800);f.frame(1900);
  const count=f.motions.length;f.pose=pose(.701,-.7);f.frame(2000);assert.equal(f.motions.length,count);f.controller.disable();
});

test('a turn re-anchors instead of converting planar corner noise into walking',async()=>{
  const f=fixture();await f.begin();const original={...f.camera};
  f.pose={...pose(.06,-.68),forward:{x:.15,y:0,z:Math.sqrt(1-.15**2)}};f.frame(300);
  assert.deepEqual(f.camera,original);assert.equal(f.controller.snapshot().phase,'calibrating');
  f.frame(400);f.frame(500);f.frame(600);assert.equal(f.controller.snapshot().phase,'active');assert.deepEqual(f.camera,original);f.controller.disable();
});

test('pausing stops tracks; resume recalibrates, duplicate requests are prevented, explicit toggle stops',async()=>{
  const f=fixture();await f.begin();f.active=false;f.frame(300);assert.equal(f.tracks[0].stopped,1);assert.equal(f.video.srcObject,null);assert.equal(f.callbacks.size,0);
  assert.equal(f.controller.snapshot().phase,'paused');f.controller.recenter();f.controller.sync();assert.equal(f.calls,1);
  f.active=true;const request=f.controller.sync();f.controller.sync();await request;assert.equal(f.calls,2);
  f.frame(400);f.frame(500);f.frame(600);assert.equal(f.controller.snapshot().phase,'active');
  await f.controller.enable();assert.equal(f.tracks[1].stopped,1);assert.equal(f.controller.snapshot().wanted,false);
  f.controller.disable();assert.equal(f.tracks[1].stopped,1);
});

test('permission denial, absent errors, failed playback and ended tracks stop safely',async()=>{
  for(const error of [Object.assign(new Error('denied'),{name:'NotAllowedError'}),new Error('camera'),undefined]) {
    const f=fixture();f.environment.navigator.mediaDevices.getUserMedia=async()=>{throw error;};await f.controller.enable();
    assert.equal(f.controller.snapshot().phase,error?.name==='NotAllowedError' ? 'denied' : 'failed');assert.equal(f.controller.snapshot().pending,false);
  }
  const f=fixture();f.video.play=async()=>{throw new Error('playback');};await f.controller.enable();assert.equal(f.tracks[0].stopped,1);assert.equal(f.controller.snapshot().phase,'failed');
  const g=fixture();await g.begin();g.tracks[0].end();assert.equal(g.controller.snapshot().phase,'failed');assert.equal(g.tracks[0].stopped,1);g.tracks[0].end();assert.equal(g.tracks[0].stopped,1);
});

test('cancelled/paused permission and late playback cannot activate or leak a camera',async()=>{
  for(const action of ['disable','pause','toggle']) {
    const f=fixture(),pending=deferred();f.environment.navigator.mediaDevices.getUserMedia=()=>pending.promise;
    const enabled=f.controller.enable();assert.equal(f.controller.snapshot().pending,true);
    if(action==='disable') f.controller.disable();else if(action==='toggle') await f.controller.enable();else {f.active=false;f.controller.sync();}
    const incoming=f.newStream();pending.resolve(incoming);await enabled;assert.equal(f.tracks[0].stopped,1);assert.equal(f.controller.snapshot().enabled,false);assert.equal(f.callbacks.size,0);
  }
  for(const outcome of ['resolve','reject']) {
    const f=fixture(),pending=deferred();f.video.play=()=>pending.promise;const enabled=f.controller.enable();await Promise.resolve();
    f.controller.disable();if(outcome==='resolve') pending.resolve();else pending.reject(new Error('late play'));await enabled;
    assert.ok(f.tracks[0].stopped>=1);assert.equal(f.callbacks.size,0);assert.equal(f.controller.snapshot().phase,'off');
  }
  const f=fixture(),pending=deferred();f.environment.navigator.mediaDevices.getUserMedia=()=>pending.promise;
  const enabled=f.controller.enable();f.controller.disable();pending.reject(new Error('late permission'));await enabled;assert.equal(f.controller.snapshot().phase,'off');
});

test('activity changes during permission or playback clean up even before sync is called',async()=>{
  for(const stage of ['permission','playback']) {
    const f=fixture(),pending=deferred();
    if(stage==='permission') f.environment.navigator.mediaDevices.getUserMedia=()=>pending.promise;else f.video.play=()=>pending.promise;
    const enabled=f.controller.enable();await Promise.resolve();f.active=false;
    pending.resolve(stage==='permission' ? f.newStream() : undefined);await enabled;
    assert.equal(f.tracks[0].stopped,1);assert.equal(f.controller.snapshot().phase,'paused');assert.equal(f.controller.snapshot().pending,false);
    assert.equal(f.controller.snapshot().wanted,true);assert.equal(f.video.srcObject,null);assert.equal(f.callbacks.size,0);
    f.controller.disable();
  }
});

test('frame cadence, unreadable video, processing errors and 15-second missing-marker timeout clean up',async()=>{
  const f=fixture();await f.controller.enable();f.video.readyState=1;f.frame(0);f.frame(30);assert.equal(f.controller.snapshot().phase,'searching');
  f.video.readyState=2;f.video.videoWidth=0;f.frame(100);f.video.videoWidth=320;f.video.videoHeight=0;f.frame(200);f.frame(15100);assert.equal(f.controller.snapshot().phase,'failed');assert.equal(f.tracks[0].stopped,1);
  const g=fixture();await g.controller.enable();g.pose=null;g.frame(0);g.frame(15100);assert.equal(g.controller.snapshot().phase,'notFound');
  const h=fixture();await h.begin();h.pose=null;h.frame(300);h.frame(15500);assert.equal(h.controller.snapshot().phase,'notFound');
  const i=fixture();await i.begin();i.pose=new Error('bad frame');i.frame(300);assert.equal(i.controller.snapshot().phase,'failed');
  const j=fixture();j.video.videoWidth=1920;j.video.videoHeight=1080;await j.controller.enable();j.frame(0);assert.equal(j.surface.width,480);assert.equal(j.surface.height,270);j.controller.disable();
});
