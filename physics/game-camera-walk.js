import { detectWalkingMarker } from './game-marker-model.js';

export function createCameraWalk({environment,video,surface,getCamera,isActive,onMotion,onStatus,getOptions,detect=detectWalkingMarker}) {
  const context=surface.getContext('2d',{willReadFrequently:true});
  const supported=Boolean(environment.isSecureContext && environment.navigator?.mediaDevices?.getUserMedia && context);
  let wanted=false,pending=false,stream=null,generation=0,raf=null,phase='off',nextFrame=0,began=null,lastSeen=null,baseline=null,meters=0;
  const snapshot=() => ({wanted,pending,enabled:Boolean(stream),phase,supported,meters});
  function status(value) { if (phase!==value) {phase=value;onStatus();} }
  function reset() {baseline=null;}
  function release() {
    generation++;pending=false;reset();began=null;lastSeen=null;nextFrame=0;
    if (raf!==null) environment.cancelAnimationFrame(raf);
    raf=null;
    if (stream) for (const track of stream.getTracks()) track.stop();
    stream=null;video.pause();video.srcObject=null;
  }
  function disable(value='off') {wanted=false;release();status(value);}
  function recenter() {reset(); if (wanted) status(stream ? 'calibrating' : 'paused');}
  function schedule() {raf=environment.requestAnimationFrame(frame);}
  function synchronizePose(pose) {
    const camera=getCamera(),p=pose.position;
    if (baseline && (baseline.camera!==camera || camera.x!==baseline.worldX || camera.z!==baseline.worldZ)) reset();
    if (!baseline) {
      const n=Math.hypot(pose.forward.x,pose.forward.z);
      baseline={camera,worldX:camera.x,worldZ:camera.z,position:{...p},filtered:{...p},applied:{...p},stable:1,
        forward:{x:pose.forward.x/n,z:pose.forward.z/n},orientation:{...pose.forward},yaw:camera.yaw};
      status('calibrating');return;
    }
    if (Math.hypot(pose.forward.x-baseline.orientation.x,pose.forward.y-baseline.orientation.y,pose.forward.z-baseline.orientation.z)>.035) {reset();status('calibrating');return;}
    baseline.orientation={...pose.forward};
    const distance=Math.hypot(p.x-baseline.position.x,p.z-baseline.position.z);
    if (distance>.25) {reset();status('unstable');return;}
    baseline.position={...p};
    if (baseline.stable<3) {
      if (distance>.035) {reset();status('calibrating');return;}
      baseline.stable++;baseline.filtered={...p};baseline.applied={...p};
      if (baseline.stable===3) status('active');
      return;
    }
    baseline.filtered.x+=(p.x-baseline.filtered.x)*.4;
    baseline.filtered.z+=(p.z-baseline.filtered.z)*.4;
    const x=baseline.filtered.x-baseline.applied.x,z=baseline.filtered.z-baseline.applied.z;
    const amount=Math.hypot(x,z);
    if (amount>=.003) {
      const f=x*baseline.forward.x+z*baseline.forward.z, r=x*baseline.forward.z-z*baseline.forward.x;
      onMotion(r*Math.cos(baseline.yaw)+f*Math.sin(baseline.yaw),r*Math.sin(baseline.yaw)-f*Math.cos(baseline.yaw));
      meters+=amount;baseline.applied={...baseline.filtered};
      baseline.worldX=camera.x;baseline.worldZ=camera.z;
    }
    status('active');
  }
  function frame(now) {
    raf=null;
    if (!isActive()) {sync();return;}
    if (now<nextFrame) {schedule();return;}
    nextFrame=now+100;
    if (began===null) began=now;
    try {
      if (video.readyState<2 || !video.videoWidth || !video.videoHeight) {
        if (now-began>15000) {disable('failed');return;}
        schedule();return;
      }
      const scale=Math.min(1,480/Math.max(video.videoWidth,video.videoHeight));
      const width=Math.max(32,Math.round(video.videoWidth*scale)),height=Math.max(32,Math.round(video.videoHeight*scale));
      if (surface.width!==width || surface.height!==height) {surface.width=width;surface.height=height;reset();}
      context.drawImage(video,0,0,width,height);
      const pose=detect(context.getImageData(0,0,width,height),getOptions());
      if (!pose) {
        reset();status(lastSeen===null ? 'searching' : 'lost');
        if (now-(lastSeen ?? began)>15000) {disable('notFound');return;}
      } else {lastSeen=now;synchronizePose(pose);}
    } catch {disable('failed');return;}
    schedule();
  }
  async function start() {
    const request=++generation;pending=true;status('requesting');
    let incoming=null;
    try {
      incoming=await environment.navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:30}}});
      if (generation!==request || !wanted) {for (const track of incoming.getTracks()) track.stop();return;}
      stream=incoming;
      if (!isActive()) {release();status('paused');return;}
      video.srcObject=stream;await video.play();
      if (generation!==request) return;
      if (!isActive()) {release();status('paused');return;}
      pending=false;reset();status('searching');
      for (const track of stream.getTracks()) track.addEventListener('ended',() => {if (generation===request) disable('failed');},{once:true});
      schedule();
    } catch (error) {
      if (incoming && incoming!==stream) for (const track of incoming.getTracks()) track.stop();
      if (generation===request) disable(error?.name==='NotAllowedError' ? 'denied' : 'failed');
    }
  }
  function sync() {
    if (!wanted) return;
    if (!isActive()) {if (stream || pending) release();status('paused');}
    else if (!stream && !pending) return start();
  }
  async function enable() {
    if (wanted || pending) {disable();return;}
    if (!supported) {status('unavailable');return;}
    wanted=true;meters=0;return sync();
  }
  return {enable,disable,sync,recenter,snapshot};
}
