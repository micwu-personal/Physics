import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WALKING_MARKER,markerPose,detectWalkingMarker} from '../physics/game-marker-model.js';
import {projectedMarker,blankImage,paint} from './helpers/walking-marker.mjs';
const close=(a,b,tolerance=.01)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);

test('independently projected poses recover meters and viewing direction, without rotation becoming translation',()=>{
  for(const [width,height,position,yaw,pitch,roll] of [
    [320,240,{x:0,y:0,z:-.7},0,0,0],
    [480,360,{x:.08,y:-.03,z:-.55},.2,-.1,.1],
    [240,320,{x:-.05,y:.02,z:-.85},-.15,.12,Math.PI/2],
    [480,360,{x:0,y:0,z:-1.1},.3,.2,Math.PI],
    [320,240,{x:0,y:0,z:-.7},0,0,-Math.PI/2]
  ]) {
    const image=projectedMarker({width,height,position,yaw,pitch,roll});
    const exact=markerPose(image.corners,{width,height});assert.ok(exact);
    for(const axis of ['x','y','z']) {close(exact.position[axis],position[axis],1e-9);close(exact.forward[axis],image.forward[axis],1e-9);}
    const found=detectWalkingMarker(image);assert.ok(found,JSON.stringify({width,yaw,pitch,roll}));
    for(const axis of ['x','z']) close(found.position[axis],position[axis],.07);
    // Vertical movement is deliberately not applied by the walking controller.
    close(found.position.y,position.y,.1);
    assert.ok(found.error<=3);
  }
});

test('pixel pipeline follows nearer/farther/sideways motion and measured card size/FOV',()=>{
  for(const position of [{x:0,y:0,z:-.55},{x:0,y:0,z:-.85},{x:.1,y:0,z:-.7},{x:-.1,y:0,z:-.7}]) {
    const pose=detectWalkingMarker(projectedMarker({position,noise:12}));assert.ok(pose);
    close(pose.position.x,position.x,.02);close(pose.position.z,position.z,.03);
  }
  for(const [size,fieldOfView] of [[.05,30],[.4,100],[.24,74]]) {
    const image=projectedMarker({width:480,height:360,size,fieldOfView,position:{x:0,y:0,z:-.6}});
    const pose=detectWalkingMarker(image,{size,fieldOfView});assert.ok(pose);close(pose.position.z,-.6,.03);
  }
});

test('rejects invalid images, clipped/tiny/bad/blank cards, background objects and multiple references',()=>{
  for(const image of [null,{}, {width:31,height:240,data:[]},{width:320.5,height:240,data:[]},{width:641,height:641,data:[]},{width:320,height:240},{width:320,height:240,data:[]},blankImage(),blankImage(32,32,0),projectedMarker({black:210,white:240})]) assert.equal(detectWalkingMarker(image),null);
  for(const image of [
    projectedMarker({position:{x:.4,y:0,z:-.7}}),projectedMarker({position:{x:0,y:.4,z:-.7}}),
    projectedMarker({position:{x:-.4,y:0,z:-.7}}),projectedMarker({position:{x:0,y:-.25,z:-.7}}),projectedMarker({position:{x:0,y:0,z:-3}}),
    projectedMarker({bits:['111111','111111','111111','111111','111111','111111']}),
    paint(blankImage(),(x,y)=>x<120 && y<120),
    paint(blankImage(),(x,y)=>x>10 && x<15 && y>10 && y<100),
    paint(blankImage(),(x,y)=>x>30 && x<150 && y>30 && y<x),
    paint(blankImage(),(x,y)=>y>40 && y<170 && Math.abs(x-120)<(y-38)/15+1),
    paint(blankImage(),(x,y)=>x>60 && x<240 && y>50 && y<190 && Math.hypot(x-150,y-120)<70)
  ]) assert.equal(detectWalkingMarker(image),null);
  const a=projectedMarker({position:{x:.15,y:0,z:-.8}}),b=projectedMarker({position:{x:-.15,y:0,z:-.8}});
  for(let i=0;i<a.data.length;i+=4) if(b.data[i]<100) a.data[i]=a.data[i+1]=a.data[i+2]=20;
  assert.equal(detectWalkingMarker(a),null);
  assert.equal(detectWalkingMarker(projectedMarker(),{size:1}),null);
});

test('pose rejects invalid, degenerate, skewed, mirrored, too-close/far and vertical configurations',()=>{
  const image=projectedMarker(),options={width:320,height:240};
  for(const corners of [null,[],[{},...image.corners.slice(1)],image.corners.map(()=>({x:1,y:1})),[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1}],
    [{x:50,y:50},{x:50+1e-7,y:50},{x:50+1e-7,y:150},{x:50,y:150}],
    [{x:50,y:50},{x:150,y:50},{x:150,y:50+1e-7},{x:50,y:50+1e-7}],
    [{x:50,y:50},{x:150,y:50},{x:240,y:150},{x:140,y:150}]
  ]) assert.equal(markerPose(corners,options),null);
  for(const patch of [{width:31},{height:31},{size:.04},{size:.41},{fieldOfView:29},{fieldOfView:101},{width:NaN}]) assert.equal(markerPose(image.corners,{...options,...patch}),null);
  assert.equal(markerPose(image.corners),null);
  for(const patch of [{position:{x:0,y:0,z:-.05}},{position:{x:0,y:0,z:-4}},{pitch:1.5,position:{x:0,y:.4,z:-.7}}]) {
    const p=projectedMarker(patch);assert.equal(markerPose(p.corners,options),null);
  }
  assert.equal(markerPose([image.corners[1],image.corners[0],image.corners[3],image.corners[2]],options),null);
  const bad=image.corners.map(p=>({...p}));bad[2].x+=8;assert.equal(markerPose(bad,options),null);
});

test('print asset is original, upright, physically specified and matches the independent pattern',async()=>{
  assert.deepEqual([...WALKING_MARKER],['111111','110001','110111','101101','111011','111111']);assert.ok(Object.isFrozen(WALKING_MARKER));
  const svg=await readFile(new URL('../physics/game-walking-marker.svg',import.meta.url),'utf8');
  assert.match(svg,/width="160" height="160" fill="black"/);assert.match(svg,/TOP/);assert.equal((svg.match(/width="26\.666667"/g)||[]).length,7);
});
