import { ADVENTURE, raftState, projectilePoint } from './game-adventure-model.js';
import { waterState } from './game-model.js';

// Original primitive geometry. Terrain tops agree with the playable model;
// cliffs, waves and the enlarged relay sample are visual staging, not CFD.
export function createAdventureWorld({ box, sphere, ring, quad }) {
  const terrain = [], stone = [.27,.34,.39], timber = [.58,.36,.18], grass = [.28,.43,.35];
  function island(x,z,w,d) {
    box(terrain,x,-.24,z,w,.48,d,grass);
    box(terrain,x,-1.4,z,w-.3,2.3,d-.3,stone);
    for (let i=0;i<9;i++) {
      const side = i%2 ? -1 : 1, dz = (i/8-.5)*d;
      box(terrain,x+side*(w/2-.25),-1.25,z+dz,1.1,1.5+i%3*.3,1.4,stone);
    }
  }
  island(0,1.5,16,17); island(0,-21,14,12); island(0,-32.5,10,5); island(1,-44,9,6);
  for (const x of [-7.3,7.3]) {
    box(terrain,x,.22,2,.18,.44,12,timber);
    for (const z of [-2,2,6]) box(terrain,x,.7,z,.18,1.4,.18,timber);
  }
  // Supplies live beside the route, never across an invisible collision box.
  for (const [x,color] of [[-3,timber],[3,[.44,.53,.61]]]) {
    box(terrain,x,.2,3,1.7,.4,1.5,timber);
    for (const dx of [-.42,.42]) box(terrain,x+dx,.7,3,.65,.6,.65,color);
    box(terrain,x,1.3,3,.08,.4,.08,[1,.75,.3]);
  }
  for (const x of [-1.3,1.3]) box(terrain,x,.25,-5,.12,.5,2,timber);
  box(terrain,0,.1,-5,2.7,.2,1.1,timber);
  // The 10 g sample is an enlarged instrument, not a frozen full-size bridge.
  box(terrain,0,.55,-22,1.3,1.1,1,[.16,.24,.29]);
  for (const x of [-.58,.58]) box(terrain,x,1.8,-22,.06,1.4,.06,[.7,.85,.88]);
  ring(terrain,0,2,-22.4,.72,[1,.65,.22]);
  box(terrain,0,.65,-31,.8,1.3,.8,timber);
  ring(terrain,0,2,-43,ADVENTURE.receiver.radius,[1,.7,.24]);
  box(terrain,0,.85,-43,.2,1.7,.2,stone);
  for (let level=0;level<7;level++) {
    const width = 2.2-level*.14;
    box(terrain,3,level+.5,-45,width,1,width,level%2 ? [.68,.34,.24] : [.85,.82,.67]);
  }
  box(terrain,3,7.3,-45,1.6,.8,1.6,[.13,.22,.26]);
  box(terrain,3,7.95,-45,2.1,.3,2.1,[.19,.29,.31]);
  for (const x of [-4,4]) for (const z of [-18,-25]) {
    box(terrain,x,1.2,z,.24,2.4,.24,timber);
    box(terrain,x,2.5,z,2.2,.2,.22,[.29,.43,.35]);
  }
  for (let i=0;i<10;i++) sphere(terrain,-70+i*16,-6,-100-i%3*12,9+i%4,[.18,.28,.33]);
  sphere(terrain,-26,32,-90,5,[1,.83,.53]);

  return state => {
    const mission = state.adventure, list = [...terrain], waterMesh = [], lightMesh = [], load = raftState(mission);
    const surface = mission.wood+mission.steel === 0 ? -.65 : load.floating ? -.6+load.freeboard : -1.8;
    for (let i=0;i<mission.wood;i++) box(list,mission.boat.x+(i-.5)*1.2,surface-.25,mission.boat.z,.8,.5,.625,timber);
    for (let i=0;i<mission.steel;i++) box(list,mission.boat.x,surface-.25,mission.boat.z+.4,.8,.5,.625,[.48,.58,.67]);
    box(list,mission.boat.x,surface+.04,mission.boat.z,2.2,.08,1.5,timber);
    for (const x of [-.9,.9]) box(list,mission.boat.x+x,surface+.38,mission.boat.z,.08,.7,.08,[1,.72,.26]);
    if (mission.riding) {
      for (let i=0;i<5;i++) sphere(list,mission.boat.x+(i-2)*.23,-.49,mission.boat.z+1.3+i*.3,.05,[.83,.94,.94]);
    }
    const sample = waterState(mission.heat);
    box(list,0,1.18+sample.solid*.18,-22,.45,Math.max(.025,sample.solid*.35),.45,[.66,.9,.96]);
    if (sample.liquid > 0) box(list,0,1.13+sample.liquid*.08,-22.03,.52,sample.liquid*.16,.52,[.04,.58,.75]);
    for (let i=0;i<Math.round(sample.gas*8);i++) sphere(list,Math.sin(i*2.4)*.23,1.4+i*.06,-22+Math.cos(i)*.2,.045,[.9,.94,.92]);
    if (mission.beam) {
      const color = mission.beam > 0 ? [1,.42,.13] : [.3,.8,1];
      ring(list,0,1.4,-21.6,.4+Math.sin(state.time*6)*.025,color);
    }
    if (mission.bridgeOpen) box(list,0,-.1,-28.5,3,.2,3,timber);
    else {
      box(list,0,1.5,-27.1,3,3,.16,timber);
      for (const x of [-1,0,1]) box(list,x,1.5,-27, .13,2.8,.13,[1,.7,.3]);
    }
    if (mission.stage >= 2 && mission.carrying !== 'capsule' && !mission.projectile) sphere(list,0,1.45,-31,.18,[.54,.93,.67]);
    if (mission.carrying) {
      const sx = Math.sin(state.camera.yaw), cx = Math.cos(state.camera.yaw);
      const x = state.camera.x+sx*.8+cx*.33, z = state.camera.z-cx*.8+sx*.33, y = state.camera.y-.48;
      if (mission.carrying === 'capsule') {
        sphere(list,x,y,z,.14,[.54,.93,.67]);
        for (let t=.12;t<=2.5;t+=.12) {
          const p = projectilePoint(state.camera,t);
          if (p.y < -.6) break;
          sphere(list,p.x,p.y,p.z,.03,[1,.85,.52]);
        }
      } else box(list,x,y,z,.35,.27,.3,mission.carrying === 'wood' ? timber : [.52,.63,.7]);
    }
    for (let i=0;i<mission.trail.length;i+=3) {
      const p = mission.trail[i]; sphere(list,p.x,p.y,p.z,.035,[1,.77,.27]);
    }
    if (mission.projectile) { const p = mission.projectile; sphere(list,p.x,p.y,p.z,.16,[.61,1,.7]); }
    if (mission.won) {
      sphere(list,3,7.4,-45,.65,[1,.93,.65]);
      const a = state.time*.7;
      quad(lightMesh,[3,7.4,-45],[3+Math.sin(a)*50,4,-45-Math.cos(a)*50],
        [3+Math.sin(a+.08)*50,9,-45-Math.cos(a+.08)*50],[3,7.6,-45],[1,.94,.65,.2]);
    }
    for (let x=-90;x<90;x+=6) for (let z=-120;z<40;z+=6) {
      const wave = (a,b) => -.6+.065*Math.sin(a*.35+b*.24+state.time*.9);
      quad(waterMesh,[x,wave(x,z),z],[x+6,wave(x+6,z),z],[x+6,wave(x+6,z+6),z+6],[x,wave(x,z+6),z+6],[.09,.37,.44]);
    }
    return { opaque:list, water:waterMesh, light:lightMesh };
  };
}
