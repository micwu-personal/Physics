import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../physics/game-audio.js';

function fixture() {
  const instances = [], nodes = [], calls = [];
  const parameter = () => new Proxy({value:0},{get:(target,key) => key in target ? target[key] : (...args) => calls.push([key,...args])});
  const node = extra => {
    const result = {...extra,connect(target) { calls.push(['connect']); return target; },disconnect() {calls.push(['disconnect']);},start(...args) {calls.push(['start',...args]);},stop(...args) {calls.push(['stop',...args]);}};
    nodes.push(result); return result;
  };
  class Context {
    constructor() {this.sampleRate = 32; this.currentTime = 4; this.state = 'suspended'; this.destination = {}; instances.push(this);}
    createBuffer(_,length) { const data = new Float32Array(length); return {getChannelData:() => data}; }
    createBufferSource() {return node({});}
    createBiquadFilter() {return node({frequency:parameter()});}
    createGain() {return node({gain:parameter()});}
    createOscillator() {return node({frequency:parameter()});}
    async resume() {calls.push(['resume']); this.state = 'running';}
    async suspend() {calls.push(['suspend']); this.state = 'suspended';}
    async close() {calls.push(['close']); this.state = 'closed';}
  }
  return {Context,instances,nodes,calls};
}
async function useFixture(run,webkit=false) {
  const original = [globalThis.AudioContext,globalThis.webkitAudioContext], f = fixture();
  globalThis.AudioContext = webkit ? undefined : f.Context; globalThis.webkitAudioContext = webkit ? f.Context : undefined;
  try {await run(f);} finally {[globalThis.AudioContext,globalThis.webkitAudioContext] = original;}
}

test('audio is opt-in, procedural, bounded, pausable and disposable',async () => useFixture(async f => {
  const audio = createGameAudio(); audio.active(true); audio.cue('won'); audio.suspend(); audio.dispose();
  assert.equal(f.instances.length,0);
  assert.equal(await audio.toggle(),true); assert.equal(f.instances.length,1);
  const wind = f.nodes[0]; assert.equal(wind.loop,true);
  assert.ok(wind.buffer.getChannelData(0).every(Number.isFinite));
  audio.active(true); audio.active(true,true);
  for (const key of ['won','recovered','retryCapsule','raftUnsafe','woodPicked']) audio.cue(key);
  for (const n of f.nodes) if (n.onended) n.onended();
  assert.ok(f.calls.some(c => c[0] === 'disconnect'));
  audio.active(false); audio.cue('won'); assert.equal(f.instances[0].state,'suspended');
  audio.active(true); assert.equal(f.instances[0].state,'running');
  assert.equal(await audio.toggle(),false); audio.active(true); audio.cue('won');
  assert.equal(await audio.toggle(),true); assert.equal(f.instances.length,1);
  audio.dispose(); audio.dispose(); assert.equal(f.instances[0].state,'closed');
}));

test('webkit fallback, rejected platform operations and unavailable audio are contained',async () => {
  await useFixture(async f => {
    const audio = createGameAudio(); assert.equal(await audio.toggle(),true);
    f.instances[0].resume = async () => {throw new Error('Denied');};
    f.instances[0].suspend = async () => {throw new Error('Denied');};
    f.instances[0].close = async () => {throw new Error('Denied');};
    f.instances[0].state = 'suspended'; audio.active(true); audio.suspend(); audio.dispose(); await Promise.resolve();
  },true);
  const original = [globalThis.AudioContext,globalThis.webkitAudioContext];
  globalThis.AudioContext = undefined; globalThis.webkitAudioContext = undefined;
  try {const audio = createGameAudio(); await assert.rejects(audio.toggle(),/unavailable/); audio.active(false); audio.dispose();}
  finally {[globalThis.AudioContext,globalThis.webkitAudioContext] = original;}
});
