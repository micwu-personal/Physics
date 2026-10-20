import { clamp } from './game-model.js';

const radians = degrees => degrees * Math.PI / 180;
const difference = (a,b) => Math.atan2(Math.sin(a-b),Math.cos(a-b));

export function deviceDirection({alpha,beta,gamma}) {
  if (![alpha,beta,gamma].every(Number.isFinite)) return null;
  const a = radians(alpha), b = radians(beta), g = radians(gamma);
  // W3C intrinsic Z–X′–Y″ rotation of the rear-facing screen normal.
  // Sensor Z is vertical; game Y is vertical. Screen roll keeps a level horizon.
  const x = -Math.cos(a)*Math.sin(g)-Math.sin(a)*Math.sin(b)*Math.cos(g);
  const north = -Math.sin(a)*Math.sin(g)+Math.cos(a)*Math.sin(b)*Math.cos(g);
  const up = -Math.cos(b)*Math.cos(g);
  return {yaw:Math.hypot(x,north) < .05 ? null : Math.atan2(x,north),pitch:Math.asin(clamp(up,-1,1))};
}

export function createDeviceLook({environment,getCamera,isActive,onStatus}) {
  let enabled = false, pending = false, generation = 0, timer = null, phase = 'off', baseline = null;
  const supported = environment.isSecureContext && Boolean(environment.DeviceOrientationEvent);
  function status(value) {
    if (phase === value) return;
    phase = value; onStatus();
  }
  function clearTimer() {
    if (timer !== null) environment.clearTimeout(timer);
    timer = null;
  }
  function reset() { baseline = null; }
  function disable(value='off') {
    generation++; pending = false; enabled = false; reset(); clearTimer();
    environment.removeEventListener('deviceorientation',orientation);
    status(value);
  }
  function orientation(event) {
    const pose = deviceDirection(event);
    if (!pose) return;
    clearTimer();
    if (!isActive()) { reset(); status('paused'); return; }
    const camera = getCamera();
    const yaw = pose.yaw ?? baseline?.sensorYaw ?? 0;
    if (!baseline || camera !== baseline.camera || camera.yaw !== baseline.appliedYaw || camera.pitch !== baseline.appliedPitch) {
      baseline = {camera,sensorYaw:yaw,sensorPitch:pose.pitch,appliedYaw:camera.yaw,appliedPitch:camera.pitch};
    } else {
      camera.yaw += difference(yaw,baseline.sensorYaw);
      camera.pitch = clamp(camera.pitch+pose.pitch-baseline.sensorPitch,-1,1);
      baseline = {camera,sensorYaw:yaw,sensorPitch:pose.pitch,appliedYaw:camera.yaw,appliedPitch:camera.pitch};
    }
    status('active');
  }
  async function enable() {
    if (enabled || pending) { disable(); return; }
    if (!supported) { status('unavailable'); return; }
    const request = ++generation;
    pending = true; status('requesting');
    try {
      const permission = environment.DeviceOrientationEvent.requestPermission;
      if (permission && await permission.call(environment.DeviceOrientationEvent) !== 'granted') {
        if (generation === request) disable('denied');
        return;
      }
      if (generation !== request) return;
      pending = false; enabled = true; reset(); status('waiting');
      environment.addEventListener('deviceorientation',orientation);
      timer = environment.setTimeout(() => disable('noReadings'),3000);
    } catch {
      if (generation === request) disable('denied');
    }
  }
  function sync() {
    if (!enabled) return;
    if (!isActive()) { reset(); status('paused'); }
    else if (phase === 'paused') { reset(); status('waiting'); }
  }
  function recenter() {
    reset();
    if (enabled) status(isActive() ? 'waiting' : 'paused');
  }
  return {enable,disable,sync,recenter,snapshot:() => ({enabled,pending,phase,supported:Boolean(supported)})};
}
