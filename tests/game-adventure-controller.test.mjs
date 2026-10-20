import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdventureController } from '../physics/game-adventure.js';
import { ADVENTURE, createAdventure } from '../physics/game-adventure-model.js';

const IDS = [
  'timed-run', 'game-canvas', 'adventure-hud', 'adventure-controls', 'world-markers',
  'mission-prompt', 'mode-adventure', 'mode-lab', 'mission-overlay', 'mission-message',
  'welcome', 'scene-instrument', 'place', 'scene-caption', 'approach', 'mission-title',
  'mission-task', 'mission-readout', 'mission-clock', 'map-player', 'adventure-interact',
  'mission-target', 'mission-bearing', 'adventure-throw', 'adventure-heat',
  'adventure-cool', 'adventure-hold', 'adventure-drop', 'adventure-unload',
  'adventure-play', 'adventure-jump', 'adventure-recover', 'mission-start',
  'mission-retry', 'mission-timing', 'mission-overlay-title', 'mission-overlay-copy',
  'mission-record', 'adventure-sound'
];

class Element {
  constructor() {
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.clientWidth = 1200;
    this.clientHeight = 600;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.captures = [];
    this.focusCount = 0;
    this.textWrites = 0;
    this.text = '';
  }
  get textContent() { return this.text; }
  set textContent(value) { this.text = String(value); this.textWrites++; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  focus() { this.focusCount++; }
  setPointerCapture(id) { this.captures.push(id); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, details = {}) {
    const event = { pointerId: 7, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...details };
    const results = (this.listeners.get(type) ?? []).map(listener => listener(event));
    return { event, results };
  }
  append(child) { this.children.push(child); }
  replaceChildren(...children) {
    this.children = children.flatMap(child => child.fragment ? child.children.splice(0) : [child]);
  }
}

function audioFixture() {
  const instances = [], calls = [], nodes = [];
  const parameter = () => ({ value: 0,
    setTargetAtTime(...args) { calls.push(['level', ...args]); },
    setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const node = extra => {
    const result = { ...extra, connect(target) { return target; },
      disconnect() { calls.push(['disconnect']); }, start() {}, stop() {} };
    nodes.push(result);
    return result;
  };
  class Context {
    constructor() {
      this.sampleRate = 16;
      this.currentTime = 0;
      this.state = 'suspended';
      this.destination = {};
      instances.push(this);
    }
    createBuffer(_, length) { return { getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { return node({}); }
    createBiquadFilter() { return node({ frequency: parameter() }); }
    createGain() { return node({ gain: parameter() }); }
    createOscillator() { return node({ frequency: parameter() }); }
    async resume() { calls.push(['resume']); this.state = 'running'; }
    async suspend() { calls.push(['suspend']); this.state = 'suspended'; }
    async close() { calls.push(['close']); this.state = 'closed'; }
  }
  return { Context, instances, calls, nodes };
}

function fixture(t, options = {}) {
  const globals = ['document', 'localStorage', 'AudioContext', 'webkitAudioContext'];
  const originals = globals.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const elements = new Map(IDS.map(id => [id, new Element()]));
  const selectors = new Map(['.game-layout', '.world', '.notebook'].map(id => [id, new Element()]));
  const moves = new Map(['forward', 'back', 'left', 'right'].map(direction => {
    const button = new Element();
    button.dataset.move = direction;
    return [direction, button];
  }));
  const el = id => {
    assert.ok(elements.has(id), `Unexpected DOM lookup: ${id}`);
    return elements.get(id);
  };
  const document = {
    documentElement: { lang: options.lang ?? 'en' }, hidden: false,
    getElementById: el,
    querySelector(selector) {
      assert.ok(selectors.has(selector), `Unexpected selector: ${selector}`);
      return selectors.get(selector);
    },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-move]');
      return [...moves.values()];
    },
    createDocumentFragment() { const fragment = new Element(); fragment.fragment = true; return fragment; },
    createElement(tag) { assert.equal(tag, 'span'); return new Element(); }
  };
  const writes = [], reads = [];
  const values = new Map();
  if ('saved' in options) values.set('physics.rescue.v1', options.saved);
  const localStorage = {
    getItem(key) {
      reads.push(key);
      if (options.denyRead) throw new Error('Storage read denied');
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (options.denyWrite) throw new Error('Storage write denied');
      writes.push([key, value]); values.set(key, value);
    }
  };
  const audio = audioFixture();
  const replacements = [document, localStorage, options.audio ? audio.Context : undefined, undefined];
  globals.forEach((name, index) => Object.defineProperty(globalThis, name, {
    configurable: true, writable: true, value: replacements[index]
  }));
  const state = { mode: 'adventure', camera: { x: 0, y: 1.65, z: 6, yaw: 0, pitch: 0 },
    playing: false, visible: true, time: 0 };
  if (options.mode) state.mode = options.mode;
  if (options.camera) state.camera = { ...options.camera };
  el('timed-run').checked = Boolean(options.timed);
  el('adventure-sound').setAttribute('aria-pressed', 'false');
  let controller;
  const calls = { change: 0, play: [] };
  const gpu = { available: options.gpu !== false };
  controller = createAdventureController(state, {
    change() { calls.change++; controller.refresh(); },
    play(value) { calls.play.push(value); state.playing = value; controller.refresh(); },
    getGpu() { return gpu.available; }
  });
  t.after(() => {
    controller.dispose();
    globals.forEach((name, index) => {
      if (originals[index]) Object.defineProperty(globalThis, name, originals[index]);
      else delete globalThis[name];
    });
  });
  controller.refresh();
  return { state, controller, el, selectors, moves, document, writes, reads, values,
    calls, gpu, audio, click: id => el(id).emit('click') };
}

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}
function at(f, station, extra = {}) {
  Object.assign(f.state.camera, ADVENTURE.stations[station], { y: ADVENTURE.eyeHeight }, extra);
  f.controller.refresh();
}
function relay(f) {
  Object.assign(f.state.adventure, { stage: 1, checkpoint: 1 });
  at(f, 'relay');
}
function launch(f) {
  Object.assign(f.state.adventure, { stage: 2, checkpoint: 2, bridgeOpen: true });
  at(f, 'capsule');
}
function advance(f, count, keys = []) {
  for (let i = 0; i < count; i++) f.controller.update(.05, new Set(keys));
  f.controller.refresh();
}
function finish(f, elapsed = 4.95) {
  launch(f);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.carrying, 'capsule');
  f.click('adventure-throw');
  assert.equal(f.state.adventure.shots, 1);
  assert.ok(f.state.adventure.projectile);
  Object.assign(f.state.adventure.projectile, { x: 0, y: 2, z: -41.7, vx: 0, vy: 0, vz: -11, age: 0 });
  f.state.adventure.elapsed = elapsed;
  f.controller.update(.05, new Set());
  assert.equal(f.state.adventure.won, true);
  assert.equal(f.state.adventure.stage, 3);
  assert.equal(f.state.adventure.projectile, null);
  assert.ok(f.state.adventure.trail.at(-1).z < -41.7);
  assert.equal(f.state.playing, false);
}

function scenario(name, options, run) {
  if (typeof options === 'function') { run = options; options = {}; }
  test(name, async t => { await run(fixture(t, options)); });
}

scenario('fresh caller-owned state renders the brief without starting or changing the camera', f => {
  assert.deepEqual(f.state.adventure, createAdventure());
  assert.deepEqual(f.state.camera, { x: 0, y: 1.65, z: 6, yaw: 0, pitch: 0 });
  assert.equal(f.state.time, 0);
  assert.equal(f.controller.diagnostic().started, false);
  assert.equal(f.controller.diagnostic().best, null);
  assert.deepEqual(f.reads, ['physics.rescue.v1']);
  assert.equal(f.selectors.get('.game-layout').dataset.mode, 'adventure');
  assert.equal(f.selectors.get('.world').dataset.mode, 'adventure');
  assert.equal(f.selectors.get('.notebook').hidden, true);
  assert.equal(f.el('mode-adventure').getAttribute('aria-pressed'), 'true');
  assert.equal(f.el('mode-lab').getAttribute('aria-pressed'), 'false');
  assert.equal(f.el('mission-overlay').hidden, false);
  assert.equal(f.el('mission-start').hidden, false);
  assert.equal(f.el('mission-retry').hidden, true);
  assert.equal(f.el('mission-timing').hidden, false);
  assert.equal(f.el('mission-message').hidden, true);
  assert.equal(f.el('adventure-hud').hidden, true);
  assert.equal(f.el('mission-prompt').hidden, true);
  assert.equal(f.el('adventure-play').disabled, true);
  assert.equal(f.el('mission-bearing').textContent, '');
  assert.match(f.el('mission-title').textContent, /Build your crossing/);
  assert.match(f.el('mission-task').textContent, /two pontoons/);
  assert.match(f.el('mission-readout').textContent, /draft —/);
  assert.match(f.el('mission-message').textContent, /lighthouse is waiting/);
  assert.equal(f.el('mission-clock').textContent, '0:00');
  assert.equal(f.el('mission-record').textContent, '');
  assert.equal(f.el('world-markers').children.length, 0);
  assert.match(f.el('game-canvas').getAttribute('aria-label'), /WASD/);
  const before = structuredClone(f.state);
  f.controller.interaction(); f.controller.action('recover'); f.controller.move('forward', 2);
  f.controller.update(.05, new Set(['forward']));
  assert.deepEqual(f.state, before);
  f.controller.clearHeld(); f.controller.syncAudio(); f.controller.dispose();
  assert.equal(f.audio.instances.length, 0);
});

scenario('mode controls preserve separate lab/adventure cameras and reject unknown modes', {
  mode: 'lab', camera: { x: 4, y: 8, z: 3, yaw: .7, pitch: .2 }
}, f => {
  const initialLab = { ...f.state.camera };
  assert.equal(f.selectors.get('.notebook').hidden, false);
  for (const id of ['adventure-hud', 'adventure-controls', 'world-markers', 'mission-prompt',
    'mission-overlay', 'mission-message']) assert.equal(f.el(id).hidden, true);
  f.click('mode-adventure');
  assert.deepEqual(f.state.camera, { x: 0, y: 1.65, z: 6, yaw: 0, pitch: -.04 });
  Object.assign(f.state.camera, { x: 2, z: 4, yaw: 1.2, pitch: .3 });
  const adventureCamera = { ...f.state.camera };
  f.click('mode-lab');
  assert.deepEqual(f.state.camera, initialLab);
  Object.assign(f.state.camera, { x: -4, y: 7, yaw: -.3 });
  const changedLab = { ...f.state.camera };
  f.click('mode-adventure');
  assert.deepEqual(f.state.camera, adventureCamera);
  f.controller.mode('not-a-mode');
  assert.equal(f.state.mode, 'lab');
  assert.deepEqual(f.state.camera, changedLab);
  assert.equal(f.state.playing, false);
  const changes = f.calls.change;
  f.controller.interaction(); f.controller.action('jump'); f.controller.move('left', 1);
  f.controller.update(.05, new Set(['forward'])); f.controller.markers();
  assert.equal(f.calls.change, changes);
});

scenario('no-GPU starts and retries route to the lab without starting a rescue', { gpu: false }, f => {
  assert.equal(f.el('mode-adventure').disabled, true);
  f.click('mission-start');
  assert.equal(f.state.mode, 'lab');
  assert.equal(f.state.playing, false);
  assert.equal(f.controller.diagnostic().started, false);
  assert.equal(f.el('game-canvas').focusCount, 0);
  f.click('mode-adventure');
  assert.equal(f.state.mode, 'lab');
  f.click('mission-retry');
  assert.equal(f.state.mode, 'lab');
  assert.equal(f.controller.diagnostic().started, false);
  f.gpu.available = true;
  f.click('mode-adventure'); f.click('mission-start');
  assert.equal(f.state.playing, true);
  assert.equal(f.el('mode-adventure').disabled, false);
});

scenario('start, pause, resume and retry use actual controls and reset only the run', f => {
  f.click('mission-start');
  assert.equal(f.state.playing, true);
  assert.equal(f.controller.diagnostic().started, true);
  assert.equal(f.controller.diagnostic().timed, false);
  assert.equal(f.el('game-canvas').focusCount, 1);
  assert.equal(f.el('mission-overlay').hidden, true);
  assert.equal(f.el('mission-timing').hidden, true);
  assert.equal(f.el('adventure-play').textContent, 'Pause');
  assert.equal(f.el('mission-message').hidden, false);
  assert.equal(f.el('adventure-hud').hidden, false);
  f.click('adventure-play');
  assert.equal(f.state.playing, false);
  assert.equal(f.el('adventure-play').textContent, 'Resume');
  assert.equal(f.el('mission-bearing').textContent, 'Paused. Resume when ready.');
  const paused = structuredClone(f.state);
  f.controller.interaction(); f.controller.action('recover'); f.controller.move('right', 2);
  f.controller.update(.05, new Set(['forward']));
  assert.deepEqual(f.state, paused);
  f.click('adventure-play');
  at(f, 'wood'); f.click('adventure-interact'); advance(f, 2);
  f.el('timed-run').checked = true;
  f.click('mission-retry');
  assert.deepEqual(f.state.adventure, createAdventure());
  assert.deepEqual(f.state.camera, { x: 0, y: 1.65, z: 6, yaw: 0, pitch: -.04 });
  assert.equal(f.controller.diagnostic().timed, true);
  assert.equal(f.controller.diagnostic().lost, false);
  assert.equal(f.el('mission-clock').textContent, '2:00 ↓');
  assert.equal(f.el('game-canvas').focusCount, 2);
});

scenario('proximity gates interactions while drops do not require a station', f => {
  f.click('mission-start');
  f.click('adventure-interact');
  assert.equal(f.state.adventure.message, 'approach');
  assert.equal(f.state.adventure.event, 1);
  assert.match(f.el('mission-message').textContent, /Walk closer/);
  assert.equal(f.el('adventure-interact').disabled, true);
  at(f, 'wood', { z: 5.60001 }); f.controller.interaction();
  assert.equal(f.state.adventure.carrying, null);
  at(f, 'wood', { z: 5.6 }); f.click('adventure-interact');
  assert.equal(f.state.adventure.carrying, 'wood');
  assert.match(f.el('mission-message').textContent, /Timber carried/);
  assert.equal(f.el('adventure-drop').hidden, false);
  at(f, 'steel'); f.controller.action('steel');
  assert.equal(f.state.adventure.carrying, 'wood');
  Object.assign(f.state.camera, { x: 0, z: 8 });
  f.click('adventure-drop');
  assert.equal(f.state.adventure.carrying, null);
  assert.equal(f.state.adventure.message, 'dropped');
  assert.equal(f.el('adventure-drop').hidden, true);
  const event = f.state.adventure.event;
  f.controller.action('unknown'); f.controller.action('throw'); f.controller.action('unload');
  assert.equal(f.state.adventure.event, event);
});

scenario('timber, steel, unloading, unsafe boarding and steering retain real model behavior', f => {
  f.click('mission-start');
  at(f, 'raft'); f.click('adventure-interact');
  assert.equal(f.state.adventure.message, 'raftUnsafe');
  assert.equal(f.state.adventure.riding, false);
  for (const material of ['wood', 'steel']) {
    at(f, material); f.click('adventure-interact');
    at(f, 'raft');
    assert.equal(f.el('adventure-interact').textContent, 'Install carried pontoon · E');
    f.click('adventure-interact');
    assert.equal(f.state.adventure[material], 1);
  }
  assert.match(f.el('mission-message').textContent, /Watch the raft sink/);
  assert.equal(f.el('adventure-unload').hidden, false);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.riding, false);
  f.click('adventure-unload');
  assert.equal(f.state.adventure.steel, 0);
  assert.equal(f.el('adventure-unload').hidden, true);
  assert.match(f.el('mission-message').textContent, /Steel removed/);
  at(f, 'wood'); f.click('adventure-interact');
  f.controller.face();
  close(f.state.camera.yaw, Math.atan2(3, 9));
  at(f, 'raft'); f.click('adventure-interact');
  assert.equal(f.state.adventure.wood, 2);
  assert.equal(f.controller.diagnostic().raft.safe, true);
  assert.match(f.el('mission-readout').textContent, /405.0 kg \/ 500 kg capacity · draft 81%/);
  f.controller.face();
  assert.equal(f.state.camera.pitch, -.1);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.riding, true);
  assert.equal(f.el('adventure-interact').disabled, true);
  assert.equal(f.el('adventure-jump').disabled, true);
  f.controller.face();
  close(f.state.camera.yaw, 0);
  const camera = { ...f.state.camera };
  f.controller.move('forward', 2); f.click('adventure-jump');
  assert.deepEqual(f.state.camera, camera);
  advance(f, 1, ['forward', 'right']);
  assert.ok(f.state.adventure.boat.x > 0);
  assert.ok(f.state.adventure.boat.z < -6);
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  Object.assign(f.state.camera, { yaw: 0 });
  for (let i = 0; i < 110 && f.state.adventure.riding; i++) {
    f.controller.update(.05, new Set(['forward']));
  }
  f.controller.refresh();
  assert.equal(f.state.adventure.riding, false);
  assert.equal(f.state.adventure.stage, 1);
  assert.equal(f.state.adventure.checkpoint, 1);
  assert.equal(f.state.adventure.message, 'docked');
  assert.equal(f.state.camera.z, -16);
  assert.match(f.el('mission-message').textContent, /Docked!/);
});

scenario('walking, sprinting and diagonal movement are continuous, normalized and bounded', f => {
  f.click('mission-start');
  f.controller.update(.05, new Set(['forward']));
  close(f.state.camera.z, 6 - 2.7 * .05);
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  f.controller.update(.05, new Set(['back'])); close(f.state.camera.z, 6);
  f.controller.update(.05, new Set(['left'])); close(f.state.camera.x, -2.7 * .05);
  f.controller.update(.05, new Set(['right'])); close(f.state.camera.x, 0);
  f.controller.update(.05, new Set(['forward', 'sprint']));
  close(f.state.camera.z, 6 - 4.3 * .05);
  Object.assign(f.state.camera, { x: 0, z: 6 });
  f.controller.update(.05, new Set(['forward', 'right']));
  close(Math.hypot(f.state.camera.x, f.state.camera.z - 6), 2.7 * .05);
  Object.assign(f.state.camera, { x: 0, z: 6 });
  f.controller.update(.05, new Set(['back', 'left']));
  assert.ok(f.state.camera.x < 0 && f.state.camera.z > 6);
  Object.assign(f.state.camera, { x: 0, z: 6, yaw: Math.PI / 2 });
  f.controller.move('forward', 1); close(f.state.camera.x, 1); close(f.state.camera.z, 6);
  f.controller.move('unknown', 1); close(f.state.camera.x, 1);
  f.state.camera.yaw = 0;
  f.controller.move('right', 100); assert.equal(f.state.camera.x, ADVENTURE.bounds.maxX);
  f.controller.move('left', 100); assert.equal(f.state.camera.x, ADVENTURE.bounds.minX);
  f.controller.move('forward', 100); assert.equal(f.state.camera.z, ADVENTURE.bounds.minZ);
  f.controller.move('back', 100); assert.equal(f.state.camera.z, ADVENTURE.bounds.maxZ);
});

scenario('jump requires nearby ground, rises, lands, and recovery clears vertical momentum', f => {
  f.click('mission-start'); f.click('adventure-jump');
  f.controller.update(.05, new Set());
  assert.ok(f.state.camera.y > ADVENTURE.eyeHeight);
  const firstHeight = f.state.camera.y;
  f.click('adventure-jump');
  f.controller.update(.05, new Set());
  close(f.state.camera.y, firstHeight + (4.8 - 2 * ADVENTURE.gravity * .05) * .05);
  advance(f, 25);
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  Object.assign(f.state.camera, { y: 1.60 });
  f.controller.action('jump'); f.controller.update(.001, new Set());
  assert.ok(f.state.camera.y > 1.60 && f.state.camera.y < ADVENTURE.eyeHeight);
  f.click('adventure-recover'); f.controller.update(.05, new Set());
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  assert.equal(f.state.adventure.rescues, 1);
  Object.assign(f.state.camera, { z: -10, y: ADVENTURE.eyeHeight });
  f.click('adventure-jump'); f.controller.update(.05, new Set());
  assert.ok(f.state.camera.y < ADVENTURE.eyeHeight);
});

scenario('falls and unsafe rafts recover at checkpoints without losing installed progress', f => {
  f.click('mission-start');
  Object.assign(f.state.adventure, { wood: 2, steel: 1, stage: 1, checkpoint: 1, heat: 2 });
  Object.assign(f.state.camera, { x: 0, z: -10 });
  advance(f, 21);
  assert.equal(f.state.adventure.rescues, 1);
  assert.equal(f.state.camera.z, -17);
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  assert.equal(f.state.adventure.wood, 2);
  assert.equal(f.state.adventure.steel, 1);
  assert.equal(f.state.adventure.heat, 2);
  assert.match(f.el('mission-message').textContent, /Recovered at your checkpoint/);
  Object.assign(f.state.adventure, { riding: true, beam: 1 });
  advance(f, 1);
  assert.equal(f.state.adventure.rescues, 2);
  assert.equal(f.state.adventure.riding, false);
  assert.equal(f.state.adventure.beam, 0);
  f.controller.action('jump');
  Object.assign(f.state.adventure, { stage: 2, checkpoint: 2, bridgeOpen: true, carrying: 'capsule' });
  f.controller.action('recover');
  assert.equal(f.state.camera.z, -31);
  assert.equal(f.state.adventure.carrying, null);
  advance(f, 1);
  assert.equal(f.state.camera.y, ADVENTURE.eyeHeight);
  assert.equal(f.state.adventure.bridgeOpen, true);
});

scenario('heat, cool and hold require relay proximity and preserve calorimetry and bridge progress', f => {
  f.click('mission-start');
  for (const id of ['heat', 'cool', 'hold']) f.controller.action(id);
  assert.equal(f.state.adventure.beam, 0);
  assert.equal(f.state.adventure.event, 0);
  at(f, 'wood'); f.click('adventure-heat');
  assert.equal(f.state.adventure.event, 0);
  relay(f);
  for (const id of ['heat', 'cool', 'hold']) assert.equal(f.el(`adventure-${id}`).hidden, false);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.beam, 1);
  assert.match(f.el('mission-message').textContent, /Heating the 10 g sensor/);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.beam, 0);
  assert.match(f.el('mission-message').textContent, /Beam stopped/);
  f.click('adventure-heat'); advance(f, 1);
  close(f.state.adventure.heat, .0375);
  assert.match(f.el('mission-readout').textContent, /power 0.75 kW/);
  f.click('adventure-hold'); advance(f, 2);
  close(f.state.adventure.heat, .0375);
  assert.match(f.el('mission-readout').textContent, /power 0 kW/);
  f.click('adventure-cool');
  assert.match(f.el('mission-message').textContent, /Cooling reverses/);
  advance(f, 1);
  assert.equal(f.state.adventure.heat, 0);
  f.state.adventure.heat = 3.58;
  f.click('adventure-heat'); advance(f, 1);
  assert.equal(f.state.adventure.bridgeOpen, true);
  assert.equal(f.state.adventure.stage, 2);
  assert.match(f.el('mission-message').textContent, /Relay restored/);
  f.click('adventure-cool'); advance(f, 2);
  assert.equal(f.state.adventure.bridgeOpen, true);
  Object.assign(f.state.camera, { z: -26 });
  const heat = f.state.adventure.heat;
  f.controller.update(.05, new Set());
  assert.equal(f.state.adventure.heat, heat);
  f.controller.action('hold');
  assert.equal(f.state.adventure.beam, -1);
});

scenario('capsule pickup, aiming, throwing, misses and retry supply use the real controller', f => {
  f.click('mission-start'); launch(f);
  assert.equal(f.el('adventure-interact').textContent, 'Pick up capsule · E');
  f.controller.face();
  assert.equal(f.state.camera.pitch, -.1);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.carrying, 'capsule');
  assert.equal(f.el('adventure-throw').hidden, false);
  assert.match(f.el('mission-message').textContent, /Signal capsule ready/);
  f.controller.face();
  close(f.state.camera.yaw, 0);
  assert.equal(f.state.camera.pitch, .3);
  assert.equal(f.el('mission-target').textContent, 'Receiver');
  f.click('adventure-throw');
  assert.equal(f.state.adventure.carrying, null);
  assert.equal(f.state.adventure.shots, 1);
  assert.equal(f.el('adventure-throw').hidden, true);
  assert.match(f.el('mission-message').textContent, /Capsule away/);
  f.controller.update(.05, new Set());
  close(f.state.adventure.projectile.z, -31 - (.45 + 11 * .05) * Math.cos(.3));
  const snapshot = f.controller.diagnostic();
  assert.ok(snapshot.projectile && snapshot.trail.length > 0);
  snapshot.projectile.x = 500; snapshot.trail[0].x = 500; snapshot.boat.x = 500;
  assert.notEqual(f.state.adventure.projectile.x, 500);
  assert.notEqual(f.state.adventure.trail[0].x, 500);
  assert.notEqual(f.state.adventure.boat.x, 500);
  f.click('adventure-throw');
  assert.equal(f.state.adventure.shots, 1);
  advance(f, 80);
  assert.equal(f.state.adventure.projectile, null);
  assert.equal(f.state.adventure.won, false);
  assert.equal(f.state.adventure.message, 'retryCapsule');
  assert.match(f.el('mission-message').textContent, /Another capsule is available/);
  f.click('adventure-interact');
  assert.equal(f.state.adventure.carrying, 'capsule');
  f.click('adventure-drop');
  assert.equal(f.state.adventure.carrying, null);
});

scenario('optional timer counts only active updates, expires at 120 seconds, and retry unlatches loss', {
  timed: true
}, f => {
  f.click('mission-start'); advance(f, 20);
  close(f.state.adventure.elapsed, 1);
  assert.equal(f.el('mission-clock').textContent, '1:59 ↓');
  f.click('adventure-play'); advance(f, 20);
  close(f.state.adventure.elapsed, 1);
  f.click('mode-lab'); advance(f, 20);
  close(f.state.adventure.elapsed, 1);
  f.click('mode-adventure'); f.click('adventure-play');
  f.state.adventure.elapsed = 119.9;
  f.controller.update(.05, new Set());
  assert.equal(f.controller.diagnostic().lost, false);
  f.controller.update(.05, new Set());
  close(f.state.adventure.elapsed, 120);
  assert.equal(f.controller.diagnostic().lost, true);
  assert.equal(f.state.playing, false);
  assert.equal(f.state.adventure.won, false);
  assert.equal(f.el('mission-clock').textContent, '0:00 ↓');
  assert.equal(f.el('mission-overlay-title').textContent, 'The signal window closed.');
  assert.match(f.el('mission-overlay-copy').textContent, /120 active seconds ran out/);
  assert.equal(f.el('adventure-play').disabled, true);
  assert.equal(f.el('mission-overlay').hidden, false);
  assert.equal(f.el('mission-retry').hidden, false);
  assert.equal(f.el('mission-timing').hidden, false);
  assert.equal(f.el('mission-message').hidden, true);
  f.state.playing = true;
  const before = structuredClone(f.state);
  f.controller.interaction(); f.controller.action('recover'); f.controller.move('forward', 2);
  f.controller.update(.05, new Set(['forward']));
  assert.deepEqual(f.state, before);
  f.el('timed-run').checked = false; f.click('mission-retry');
  assert.equal(f.controller.diagnostic().lost, false);
  assert.equal(f.controller.diagnostic().timed, false);
  f.state.adventure.elapsed = 120;
  advance(f, 1);
  assert.equal(f.state.playing, true);
  assert.equal(f.controller.diagnostic().lost, false);
  assert.equal(f.el('mission-clock').textContent, '2:00');
});

for (const [label, saved, expectedWrites] of [
  ['first result', null, 1], ['improved result', '{"version":1,"best":10}', 1],
  ['slower result', '{"version":1,"best":3}', 0], ['equal result', '{"version":1,"best":5}', 0]
]) {
  scenario(`projectile receiver crossing records ${label} and finish disables gameplay`, { saved }, f => {
    f.click('mission-start'); finish(f);
    const best = expectedWrites ? 5 : JSON.parse(saved).best;
    assert.equal(f.controller.diagnostic().best, best);
    assert.equal(f.writes.length, expectedWrites);
    if (expectedWrites) {
      assert.equal(f.writes[0][0], 'physics.rescue.v1');
      assert.deepEqual(JSON.parse(f.writes[0][1]), { version: 1, best: 5 });
    }
    assert.equal(f.el('mission-overlay-title').textContent, 'The lighthouse is back.');
    assert.match(f.el('mission-overlay-copy').textContent, /0:05, 1 throws, 0 recoveries/);
    assert.equal(f.el('mission-overlay').hidden, false);
    assert.equal(f.el('adventure-hud').hidden, true);
    assert.equal(f.el('mission-prompt').hidden, true);
    assert.equal(f.el('mission-message').hidden, true);
    assert.equal(f.el('world-markers').children.length, 0);
    assert.equal(f.el('mission-record').textContent, `Local best 0:0${best}`);
    f.state.playing = true;
    const before = structuredClone(f.state);
    f.controller.interaction(); f.controller.action('recover'); f.controller.move('forward', 2);
    f.controller.update(.05, new Set(['forward']));
    assert.deepEqual(f.state, before);
    f.click('mission-retry');
    assert.equal(f.state.adventure.won, false);
    assert.equal(f.state.adventure.elapsed, 0);
    assert.equal(f.controller.diagnostic().best, best);
  });
}

for (const saved of ['null', '{}', '{"version":2,"best":4}', '{"version":1}',
  '{"version":1,"best":"4"}', '{"version":1,"best":0}',
  '{"version":1,"best":-2}', '{"version":1,"best":1e999}']) {
  scenario(`invalid saved record ${saved} does not become a best`, { saved }, f => {
    assert.equal(f.controller.diagnostic().best, null);
    assert.equal(f.el('mission-record').textContent, '');
    assert.equal(f.writes.length, 0);
  });
}

for (const options of [{ saved: '{broken' }, { denyRead: true },
  { saved: '{"version":1,"best":10}', denyWrite: true }]) {
  scenario(`denied or malformed storage remains playable: ${JSON.stringify(options)}`, options, f => {
    f.click('mission-start'); finish(f);
    assert.equal(f.controller.diagnostic().best, 5);
    assert.match(f.el('mission-record').textContent, /Local best 0:05 · persistence unavailable/);
    assert.equal(f.writes.length, options.denyWrite ? 0 : 1);
    f.document.documentElement.lang = 'zh-CN'; f.controller.refresh();
    assert.equal(f.el('mission-record').textContent, '本浏览器最快 0:05 · 不可持久保存');
  });
}

scenario('bilingual refresh covers stage-specific readings, targets, messages and victory text', {
  lang: 'zh-CN', saved: '{"version":1,"best":20}'
}, f => {
  assert.match(f.el('place').textContent, /风暴群岛/);
  assert.match(f.el('scene-caption').textContent, /浮力、热量、重力/);
  assert.equal(f.el('approach').textContent, '朝向下个目标');
  assert.match(f.el('game-canvas').getAttribute('aria-label'), /第一人称海岸救援/);
  assert.match(f.el('mission-title').textContent, /造好渡水工具/);
  assert.match(f.el('mission-readout').textContent, /吃水 —/);
  assert.equal(f.el('mission-record').textContent, '本浏览器最快 0:20');
  f.click('mission-start');
  at(f, 'wood'); f.click('adventure-interact');
  assert.equal(f.el('adventure-play').textContent, '暂停');
  assert.match(f.el('mission-message').textContent, /已拿起木材/);
  f.state.adventure.wood = 1; f.controller.refresh();
  assert.match(f.el('mission-readout').textContent, /吃水 97%/);
  f.document.documentElement.lang = 'en-US'; f.controller.refresh();
  assert.match(f.el('mission-readout').textContent, /draft 97%/);
  relay(f); f.click('adventure-heat');
  assert.match(f.el('mission-readout').textContent, /liquid 0% · vapor 0% · power 0.75/);
  f.document.documentElement.lang = 'zh-CN'; f.controller.refresh();
  assert.match(f.el('mission-readout').textContent, /液态 0% · 气态 0% · 功率 0.75/);
  f.click('adventure-hold');
  assert.match(f.el('mission-readout').textContent, /功率 0 kW/);
  assert.match(f.el('mission-message').textContent, /传热已停止/);
  f.click('adventure-play');
  assert.equal(f.el('adventure-play').textContent, '继续');
  assert.equal(f.el('mission-bearing').textContent, '已暂停。准备好后继续。');
  f.click('adventure-play');
  launch(f);
  Object.assign(f.state.camera, { z: -34 }); f.controller.refresh();
  assert.equal(f.el('mission-target').textContent, '信号舱');
  assert.match(f.el('mission-readout').textContent, /投掷 0 · 重力 9.81/);
  assert.match(f.el('mission-bearing').textContent, /用“朝向下个目标”找方向/);
  f.state.adventure.carrying = null;
  finish(f);
  assert.equal(f.el('mission-overlay-title').textContent, '灯塔再次亮起。');
  assert.match(f.el('mission-overlay-copy').textContent, /用时 0:05，投掷 1 次，恢复 0 次/);
  assert.equal(f.el('mission-record').textContent, '本浏览器最快 0:05');
});

scenario('Chinese timed failure, fallback messages and unchanged-message refresh remain stable', {
  lang: 'zh-CN', timed: true
}, f => {
  f.click('mission-start');
  f.state.adventure.message = 'handsFull'; f.state.adventure.event++; f.controller.refresh();
  assert.equal(f.el('mission-message').textContent, '请先放下手里的物品。');
  f.state.adventure.message = 'unrecognized-message'; f.controller.refresh();
  assert.match(f.el('mission-message').textContent, /灯塔在等待/);
  const writes = f.el('mission-message').textWrites;
  f.controller.refresh();
  assert.equal(f.el('mission-message').textWrites, writes);
  f.state.adventure.message = ''; f.controller.refresh();
  assert.equal(f.el('mission-message').hidden, true);
  f.state.adventure.elapsed = 119.95;
  f.controller.update(.05, new Set());
  assert.equal(f.controller.diagnostic().lost, true);
  assert.equal(f.el('mission-overlay-title').textContent, '信号窗口已关闭。');
  assert.match(f.el('mission-overlay-copy').textContent, /120 秒有效游戏时间已用完/);
});

scenario('markers project real station locations and use current language and objective', f => {
  f.click('mission-start');
  f.state.camera.pitch = 0; f.controller.markers();
  assert.deepEqual(f.el('world-markers').children.map(child => child.textContent), ['Timber supply', 'Steel supply', 'Raft']);
  for (const marker of f.el('world-markers').children) {
    assert.ok(parseFloat(marker.style.left) > 3.5 && parseFloat(marker.style.left) < 96.5);
    assert.ok(parseFloat(marker.style.top) > 37.5 && parseFloat(marker.style.top) < 87.5);
  }
  assert.equal(parseFloat(f.el('world-markers').children[2].style.left), 50);
  f.document.documentElement.lang = 'zh-CN'; f.controller.markers();
  assert.deepEqual(f.el('world-markers').children.map(child => child.textContent), ['木材补给', '钢块补给', '浮筏']);
  relay(f); Object.assign(f.state.camera, { z: -18 }); f.controller.refresh();
  assert.deepEqual(f.el('world-markers').children.map(child => child.textContent), ['热继电器']);
  assert.equal(f.el('mission-target').textContent, '热继电器');
  f.controller.face(); assert.equal(f.state.camera.pitch, -.1);
  launch(f); Object.assign(f.state.camera, { z: -27, pitch: 0 }); f.controller.markers();
  assert.deepEqual(f.el('world-markers').children.map(child => child.textContent), ['信号舱', '接收环']);
  f.controller.face(); close(f.state.camera.yaw, 0);
});

scenario('projection rejects depth, horizontal and vertical boundaries without stale markers', f => {
  f.click('mission-start'); relay(f);
  const hasRelay = () => {
    f.controller.markers();
    return f.el('world-markers').children.length === 1;
  };
  Object.assign(f.state.camera, { x: 0, z: -21.71, y: 1.7, yaw: 0, pitch: 0 });
  assert.equal(hasRelay(), false);
  f.state.camera.z = -21.69; assert.equal(hasRelay(), true);
  f.state.camera.z = -22; assert.equal(hasRelay(), false);
  f.state.camera.z = -23; assert.equal(hasRelay(), false);
  Object.assign(f.state.camera, { z: -20, x: -2.39 }); assert.equal(hasRelay(), true);
  f.state.camera.x = -2.41; assert.equal(hasRelay(), false);
  f.state.camera.x = 2.41; assert.equal(hasRelay(), false);
  Object.assign(f.state.camera, { x: 0, y: 1.7 - .249 * 2 / 1.55 }); assert.equal(hasRelay(), true);
  f.state.camera.y = 1.7 - .251 * 2 / 1.55; assert.equal(hasRelay(), false);
  f.state.camera.y = 1.7 + .751 * 2 / 1.55; assert.equal(hasRelay(), false);
  f.state.camera.y = 1.7 + .749 * 2 / 1.55; assert.equal(hasRelay(), true);
  f.el('game-canvas').clientWidth = 600;
  Object.assign(f.state.camera, { x: -1.21, y: 1.7 }); assert.equal(hasRelay(), false);
  f.state.camera.x = -1.19; assert.equal(hasRelay(), true);
  Object.assign(f.state.camera, { x: 0, y: 1.7, yaw: Math.PI }); assert.equal(hasRelay(), false);
});

scenario('held pointer movement needs no keyboard and releases on every pointer cancellation path', f => {
  const forward = f.moves.get('forward');
  assert.equal(forward.emit('pointerdown').event.defaultPrevented, false);
  f.click('mission-start');
  const down = forward.emit('pointerdown', { pointerId: 42 }).event;
  assert.equal(down.defaultPrevented, true);
  assert.deepEqual(forward.captures, [42]);
  f.controller.update(.05, new Set()); close(f.state.camera.z, 6 - .135);
  for (const release of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    forward.emit('pointerdown'); forward.emit(release);
    const z = f.state.camera.z;
    f.controller.update(.05, new Set()); close(f.state.camera.z, z);
  }
  forward.emit('pointerdown'); f.moves.get('right').emit('pointerdown');
  const before = { ...f.state.camera };
  f.controller.update(.05, new Set());
  close(Math.hypot(f.state.camera.x - before.x, f.state.camera.z - before.z), .135);
  f.controller.clearHeld();
  const cleared = { ...f.state.camera }; f.controller.update(.05, new Set());
  close(f.state.camera.x, cleared.x); close(f.state.camera.z, cleared.z);
  forward.emit('pointerdown');
  f.click('mode-lab');
  f.state.playing = true;
  assert.equal(forward.emit('pointerdown').event.defaultPrevented, false);
  f.click('mode-adventure'); f.click('adventure-play');
  const restored = { ...f.state.camera }; f.controller.update(.05, new Set());
  close(f.state.camera.z, restored.z);
  f.click('adventure-play');
  assert.equal(forward.emit('pointerdown').event.defaultPrevented, false);
});

scenario('audio-unavailable click resolves with bilingual visual feedback instead of throwing', async f => {
  f.click('mission-start');
  await Promise.all(f.click('adventure-sound').results);
  assert.equal(f.state.adventure.message, 'soundUnavailable');
  assert.equal(f.state.adventure.event, 1);
  assert.equal(f.el('adventure-sound').getAttribute('aria-pressed'), 'false');
  assert.equal(f.el('adventure-sound').textContent, 'Sound off');
  assert.match(f.el('mission-message').textContent, /Audio is unavailable/);
  f.document.documentElement.lang = 'zh-CN'; f.controller.refresh();
  assert.equal(f.el('adventure-sound').textContent, '声音：关');
  assert.match(f.el('mission-message').textContent, /音频不可用/);
  f.controller.update(.05, new Set(['forward']));
  assert.ok(f.state.camera.z < 6);
});

scenario('opt-in audio sync honors mode, play, visibility, document hiding and relay beam', {
  audio: true
}, async f => {
  assert.equal(f.audio.instances.length, 0);
  f.click('mission-start');
  await Promise.all(f.click('adventure-sound').results);
  assert.equal(f.audio.instances.length, 1);
  assert.equal(f.el('adventure-sound').getAttribute('aria-pressed'), 'true');
  assert.equal(f.el('adventure-sound').textContent, 'Sound on');
  const context = f.audio.instances[0];
  assert.equal(context.state, 'running');
  f.controller.syncAudio();
  assert.ok(f.audio.calls.some(call => call[0] === 'level' && call[1] === .16));
  relay(f); f.click('adventure-heat');
  assert.ok(f.audio.calls.some(call => call[0] === 'level' && call[1] === .3));
  assert.ok(f.audio.nodes.some(node => node.frequency?.value === 330));
  f.state.visible = false; f.controller.syncAudio(); assert.equal(context.state, 'suspended');
  f.state.visible = true; f.controller.syncAudio(); assert.equal(context.state, 'running');
  f.document.hidden = true; f.controller.clearHeld(); assert.equal(context.state, 'suspended');
  f.document.hidden = false; f.controller.syncAudio(); assert.equal(context.state, 'running');
  f.click('adventure-play'); assert.equal(context.state, 'suspended');
  f.click('adventure-play'); assert.equal(context.state, 'running');
  f.document.documentElement.lang = 'zh-CN'; f.controller.refresh();
  assert.equal(f.el('adventure-sound').textContent, '声音：开');
  await Promise.all(f.click('adventure-sound').results);
  assert.equal(f.el('adventure-sound').getAttribute('aria-pressed'), 'false');
  assert.equal(f.el('adventure-sound').textContent, '声音：关');
  assert.equal(context.state, 'suspended');
  await Promise.all(f.click('adventure-sound').results);
  assert.equal(f.audio.instances.length, 1);
  f.click('mode-lab'); assert.equal(context.state, 'suspended');
  f.controller.dispose();
  assert.equal(context.state, 'closed');
  f.controller.dispose();
  assert.equal(f.audio.calls.filter(call => call[0] === 'close').length, 1);
});

scenario('rejected audio resume is contained by the real sound handler', { audio: true }, async f => {
  f.click('mission-start'); await Promise.all(f.click('adventure-sound').results);
  await Promise.all(f.click('adventure-sound').results);
  f.audio.instances[0].resume = async () => { throw new Error('Audio permission denied'); };
  await Promise.all(f.click('adventure-sound').results);
  assert.equal(f.state.adventure.message, 'soundUnavailable');
  assert.equal(f.el('adventure-sound').getAttribute('aria-pressed'), 'false');
  assert.match(f.el('mission-message').textContent, /Audio is unavailable/);
});
