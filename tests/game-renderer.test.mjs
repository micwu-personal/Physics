import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer } from '../physics/game-renderer.js';
import { createAdventure } from '../physics/game-adventure-model.js';

function fixture({ compile = true, link = true } = {}) {
  const calls = [], uploads = []; let compiled = 0;
  const gl = new Proxy({ COMPILE_STATUS:'compile',LINK_STATUS:'link',VERTEX_SHADER:'vertex',FRAGMENT_SHADER:'fragment',
    COLOR_BUFFER_BIT:1,DEPTH_BUFFER_BIT:2, getShaderParameter:() => typeof compile === 'function' ? compile(++compiled) : compile,getProgramParameter:() => link,
    getAttribLocation:(_,name) => name === 'aPosition' ? 0 : 1,
    bufferData:(_,data) => uploads.push([...data]),
  }, { get(target,key) {
    if (key in target) return target[key];
    return (...args) => { calls.push([key,...args]); return {}; };
  }});
  const canvas = { width:0,height:0,clientWidth:400,clientHeight:300,getContext:() => gl };
  return {canvas,calls,uploads};
}
const scene = overrides => ({ scene:'coast',camera:{x:0,y:1.65,z:6,yaw:0,pitch:0},dpr:1,heat:0,time:0,density:650,releaseAge:0,released:false,...overrides });

test('renderer has explicit no-GPU and shader/link failure paths',() => {
  assert.equal(createRenderer({getContext:() => null}),null);
  assert.throws(() => createRenderer(fixture({compile:false}).canvas),/compilation/);
  assert.throws(() => createRenderer(fixture({link:false}).canvas),/linking/);
  const fragmentFailure = fixture({compile:count => count === 1});
  assert.throws(() => createRenderer(fragmentFailure.canvas),/compilation/);
  assert.equal(fragmentFailure.calls.filter(call => call[0] === 'deleteShader').length,2);
});
test('native depth projection, dynamic geometry and GPU resources are exercised',() => {
  const {canvas,calls,uploads} = fixture();
  const renderer = createRenderer(canvas);
  renderer.render(scene());
  assert.equal(canvas.width,400); assert.equal(canvas.height,300);
  const first = uploads[0];
  assert.ok(first.length > 10000);
  assert.ok(first.every(Number.isFinite));
  assert.ok(calls.some(call => call[0] === 'shaderSource' && call[2].includes('gl_Position')));
  renderer.render(scene({released:true,releaseAge:2}));
  assert.notDeepEqual(uploads[2],first);
  for (const density of [1000,7800]) renderer.render(scene({density,released:true,releaseAge:12}));
  for (const heat of [0,1.5,4.6,12,31]) {
    renderer.render(scene({scene:'molecules',heat,time:2}));
    renderer.render(scene({scene:'heat',heat,time:2}));
  }
  for (const config of [
    {}, {wood:1}, {wood:2,riding:true}, {steel:1},
    {carrying:'wood'}, {carrying:'steel'}, {carrying:'capsule'},
    {carrying:'capsule',camera:{x:0,y:1.65,z:-31,yaw:0,pitch:.8}},
    {heat:2,beam:1}, {heat:4.6,beam:-1}, {heat:12},
    {heat:31,stage:2,bridgeOpen:true},
    {stage:2,projectile:{x:0,y:3,z:-36},trail:[{x:0,y:3,z:-35}]},
    {won:true,stage:3,bridgeOpen:true}
  ]) {
    const {camera,...mission} = config;
    renderer.render(scene({mode:'adventure',time:2,adventure:{...createAdventure(),...mission},...(camera ? {camera} : {})}));
  }
  assert.ok(uploads.some(upload => upload.some((value,index) => index%7 === 6 && Math.abs(value-.2) < 1e-6)));
  canvas.clientWidth = 0; canvas.clientHeight = 0;
  renderer.render(scene({dpr:2}));
  assert.equal(canvas.width,1); assert.equal(canvas.height,1);
  assert.ok(uploads.every(upload => upload.every(Number.isFinite)));
  assert.ok(uploads.some(upload => upload.some((value,index) => index%7 === 6 && Math.abs(value-.38) < 1e-6)));
  renderer.dispose();
  assert.ok(calls.some(call => call[0] === 'deleteBuffer'));
});
