import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADVENTURE, createAdventure, raftState, groundHeight, nearestStation,
  interact, stepAdventure, throwCapsule, projectilePoint, rescue
} from '../physics/game-adventure-model.js';
import { waterState } from '../physics/game-model.js';

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

function cameraAt(x = 0, z = 6, yaw = 0, pitch = 0) {
  return { x, y: ADVENTURE.eyeHeight, z, yaw, pitch };
}

function goTo(camera, station) {
  Object.assign(camera, ADVENTURE.stations[station]);
}

function install(state, camera, material) {
  goTo(camera, material);
  assert.equal(interact(state, material, camera), true);
  goTo(camera, 'raft');
  assert.equal(interact(state, 'raft', camera), true);
}

function board() {
  const state = createAdventure();
  const camera = cameraAt();
  install(state, camera, 'wood');
  install(state, camera, 'wood');
  assert.equal(interact(state, 'raft', camera), true);
  return { state, camera };
}

function atRelay() {
  const state = createAdventure();
  state.stage = 1;
  state.checkpoint = 1;
  return { state, camera: cameraAt(0, -22) };
}

function atLaunch(pitch = 0.5, yaw = 0) {
  const state = createAdventure();
  state.stage = 2;
  state.checkpoint = 2;
  state.bridgeOpen = true;
  const camera = cameraAt(0, -31, yaw, pitch);
  assert.equal(interact(state, 'capsule', camera), true);
  camera.z = -33;
  return { state, camera };
}

function advanceUntil(state, camera, done, maximum = 200, dt = 0.05, input = {}) {
  for (let index = 0; index < maximum && !done(); index += 1) stepAdventure(state, camera, dt, input);
  assert.ok(done(), 'expected transition did not occur within the bounded simulation');
}

test('configuration is scientifically explicit and deeply frozen', () => {
  const scalars = {
    playerMass: 80, waterDensity: 1000, gravity: 9.81, moduleVolume: 0.25,
    woodDensity: 650, steelDensity: 7800, safeDraft: 0.9, heaterPower: 0.75,
    throwSpeed: 11, deckHeight: 0, waterLevel: -0.6, eyeHeight: 1.65
  };
  for (const [key, value] of Object.entries(scalars)) assert.equal(ADVENTURE[key], value);
  assert.deepEqual(ADVENTURE.receiver, { x: 0, y: 2, z: -43, radius: 1.25 });
  assert.deepEqual(ADVENTURE.bounds, { minX: -9, maxX: 9, minZ: -47, maxZ: 9 });
  assert.deepEqual(ADVENTURE.stations, {
    wood: { x: -3, z: 3 }, steel: { x: 3, z: 3 }, raft: { x: 0, z: -5 },
    relay: { x: 0, z: -22 }, capsule: { x: 0, z: -31 }
  });
  for (const value of [ADVENTURE, ADVENTURE.receiver, ADVENTURE.bounds,
    ADVENTURE.stations, ...Object.values(ADVENTURE.stations)]) assert.ok(Object.isFrozen(value));
  assert.throws(() => { ADVENTURE.stations.raft.z = 99; }, TypeError);
});

test('fresh mutable adventures and nested snapshots are independent', () => {
  const first = createAdventure();
  const second = createAdventure();
  assert.deepEqual(first, {
    elapsed: 0, won: false, stage: 0, checkpoint: 0, wood: 0, steel: 0, carrying: null,
    heat: 0, beam: 0, bridgeOpen: false, riding: false, boat: { x: 0, z: -6 },
    projectile: null, trail: [], shots: 0, rescues: 0, message: 'brief', event: 0
  });
  first.boat.x = 5;
  first.trail.push({ x: 1, y: 2, z: 3 });
  first.heat = 4;
  const snapshot = structuredClone(first);
  first.trail[0].x = 12;
  first.boat.z = -12;
  assert.equal(snapshot.trail[0].x, 1);
  assert.equal(snapshot.boat.z, -6);
  assert.deepEqual(second, createAdventure());
});

test('all permitted raft assemblies obey actual material mass and displacement', () => {
  const expected = [
    [0, 0, 80, 0, false, false],
    [1, 0, 242.5, 250, true, false],
    [2, 0, 405, 500, true, true],
    [0, 1, 2030, 250, false, false],
    [1, 1, 2192.5, 500, false, false],
    [2, 1, 2355, 750, false, false]
  ];
  for (const [wood, steel, mass, capacity, floating, safe] of expected) {
    const state = Object.assign(createAdventure(), { wood, steel });
    const before = structuredClone(state);
    const result = raftState(state);
    assert.equal(result.mass, mass);
    assert.equal(result.capacity, capacity);
    assert.equal(result.floating, floating);
    assert.equal(result.safe, safe);
    if (capacity === 0) {
      assert.equal(Number.isFinite(result.draft), false);
      assert.equal(result.freeboard, 0);
    } else {
      close(result.draft, mass / capacity);
      close(result.freeboard, Math.max(0, 0.5 * (1 - mass / capacity)));
    }
    assert.deepEqual(state, before);
  }
  close(raftState({ wood: 1, steel: 0 }).freeboard, 0.015);
  close(raftState({ wood: 2, steel: 0 }).freeboard, 0.095);
});

test('invalid external module counts cannot create NaN or fictitious unlimited capacity', () => {
  for (const count of [-1, NaN, Infinity, -Infinity, undefined, 'two']) {
    const result = raftState({ wood: count, steel: count });
    assert.equal(result.mass, 80);
    assert.equal(result.capacity, 0);
    assert.equal(result.safe, false);
  }
  assert.deepEqual(raftState({ wood: 100, steel: 100 }), raftState({ wood: 2, steel: 1 }));
});

test('ground terrain, inclusive edges, gaps and latched bridge are separate from bounds', () => {
  const state = createAdventure();
  for (const [x, z] of [[-8, -7], [8, 10], [0, 6], [-7, -27], [7, -15], [-5, -35], [5, -30]]) {
    assert.equal(groundHeight(x, z, state), 0);
  }
  for (const [x, z] of [[8.001, 0], [0, -10], [0, -14.999], [7.001, -20],
    [5.001, -33], [0, -28.5], [0, -36], [0, -43], [NaN, 0], [0, Infinity]]) {
    assert.equal(groundHeight(x, z, state), null);
  }
  state.bridgeOpen = true;
  for (const [x, z] of [[0, -28.5], [-1.5, -29], [1.5, -29], [0, -30], [0, -27]]) {
    assert.equal(groundHeight(x, z, state), 0);
  }
  assert.equal(groundHeight(1.50001, -28.5, state), null);
  assert.equal(groundHeight(0, -43, state), null);
  assert.equal(groundHeight(0, -28.5), null);
});

test('nearest station uses horizontal proximity, exact radius and stage availability', () => {
  const state = createAdventure();
  assert.deepEqual(nearestStation(cameraAt(-3, 3), state), { id: 'wood', x: -3, z: 3, distance: 0 });
  const elevated = { ...cameraAt(-3, 5.6), y: 100 };
  assert.equal(nearestStation(elevated, state).id, 'wood');
  close(nearestStation(elevated, state).distance, 2.6);
  assert.equal(nearestStation(cameraAt(-3, 5.60001), state), null);
  assert.equal(nearestStation(cameraAt(0, -22), state), null);
  assert.equal(nearestStation(cameraAt(0, -31), state), null);
  assert.equal(nearestStation({ x: NaN, z: 3 }, state), null);
  assert.equal(nearestStation(null, state), null);
  state.stage = 1;
  state.checkpoint = 1;
  assert.equal(nearestStation(cameraAt(-3, 3), state), null);
  assert.equal(nearestStation(cameraAt(0, -5), state), null);
  assert.equal(nearestStation(cameraAt(0, -22), state).id, 'relay');
  assert.equal(nearestStation(cameraAt(0, -31), state), null);
  state.stage = 2;
  assert.equal(nearestStation(cameraAt(0, -31), state).id, 'capsule');
  assert.equal(nearestStation(cameraAt(0, -22), state).id, 'relay');
  state.carrying = 'capsule';
  assert.equal(nearestStation(cameraAt(0, -31), state), null);
  state.carrying = null;
  state.projectile = {};
  assert.equal(nearestStation(cameraAt(0, -31), state), null);
  state.projectile = null;
  state.won = true;
  assert.equal(nearestStation(cameraAt(0, -22), state), null);
});

test('raft interaction target tracks a moved boat, but starts at its shore station', () => {
  const state = createAdventure();
  assert.deepEqual(nearestStation(cameraAt(0, -5), state), { id: 'raft', x: 0, z: -5, distance: 0 });
  state.boat = { x: 4, z: -11 };
  for (const riding of [true, false]) {
    state.riding = riding;
    assert.deepEqual(nearestStation(cameraAt(4, -11), state), { id: 'raft', x: 4, z: -11, distance: 0 });
    assert.equal(nearestStation(cameraAt(0, -5), state), null);
  }
});

test('early, unavailable, mismatched and remote actions leave progression unchanged', () => {
  const state = createAdventure();
  const before = structuredClone(state);
  for (const [id, camera] of [
    ['wood', cameraAt()], ['steel', cameraAt(-3, 3)], ['relay', cameraAt(0, -22)],
    ['capsule', cameraAt(0, -31)], ['raft', cameraAt(0, -20)],
    ['removeSteel', cameraAt()], ['unknown', cameraAt(-3, 3)], ['wood', { x: NaN, z: 3 }]
  ]) assert.equal(interact(state, id, camera), false);
  assert.equal(throwCapsule(state, cameraAt()), false);
  assert.equal(interact(state, 'drop', cameraAt()), false);
  assert.deepEqual(state, before);
  assert.equal(interact(state, 'wood', cameraAt(-3, 3)), true);
  const carrying = structuredClone(state);
  assert.equal(interact(state, 'steel', cameraAt(3, 3)), false);
  assert.deepEqual(state, carrying);
});

test('building, engineering reserve and rejected boarding produce nonpunitive action feedback', () => {
  const state = createAdventure();
  const camera = cameraAt();
  goTo(camera, 'raft');
  assert.equal(interact(state, 'raft', camera), false);
  assert.equal(state.message, 'raftUnsafe');
  assert.equal(state.event, 1);
  assert.equal(state.rescues, 0);
  assert.equal(state.riding, false);
  install(state, camera, 'wood');
  assert.equal(state.message, 'woodInstalled');
  assert.equal(state.wood, 1);
  assert.equal(state.carrying, null);
  assert.equal(raftState(state).floating, true);
  assert.equal(interact(state, 'raft', camera), false);
  assert.equal(state.message, 'raftUnsafe');
  assert.equal(state.wood, 1);
  assert.equal(state.checkpoint, 0);
  assert.equal(state.rescues, 0);
  install(state, camera, 'wood');
  assert.equal(raftState(state).safe, true);
  const event = state.event;
  goTo(camera, 'wood');
  assert.equal(interact(state, 'wood', camera), false);
  assert.equal(state.event, event);
  goTo(camera, 'raft');
  camera.yaw = 0.25;
  camera.pitch = -0.1;
  assert.equal(interact(state, 'raft', camera), true);
  assert.equal(state.message, 'boarded');
  assert.equal(state.riding, true);
  assert.equal(state.stage, 0);
  assert.deepEqual(camera, cameraAt(0, -6, 0.25, -0.1));
  const boarded = structuredClone(state);
  assert.equal(interact(state, 'raft', camera), false);
  assert.deepEqual(state, boarded);
});

test('steel visibly changes mass, sinks the assembly, and can be removed and retrieved', () => {
  const state = createAdventure();
  const camera = cameraAt();
  install(state, camera, 'wood');
  install(state, camera, 'wood');
  const light = raftState(state);
  install(state, camera, 'steel');
  assert.equal(state.message, 'steelInstalled');
  assert.equal(state.steel, 1);
  assert.equal(raftState(state).mass - light.mass, 1950);
  assert.equal(raftState(state).floating, false);
  assert.equal(raftState(state).freeboard, 0);
  assert.equal(interact(state, 'raft', camera), false);
  assert.equal(state.message, 'raftUnsafe');
  goTo(camera, 'steel');
  assert.equal(interact(state, 'steel', camera), false);
  const event = state.event;
  assert.equal(interact(state, 'removeSteel', camera), false);
  assert.equal(state.event, event);
  goTo(camera, 'raft');
  assert.equal(interact(state, 'removeSteel', camera), true);
  assert.equal(state.message, 'steelRemoved');
  assert.equal(state.event, event + 1);
  assert.deepEqual(raftState(state), light);
  assert.equal(interact(state, 'removeSteel', camera), false);
  goTo(camera, 'steel');
  assert.equal(interact(state, 'steel', camera), true);
  assert.equal(state.message, 'steelPicked');
});

test('dropping held material or capsule returns supply without irreversible loss', () => {
  const state = createAdventure();
  for (const material of ['wood', 'steel']) {
    const camera = cameraAt(ADVENTURE.stations[material].x, 3);
    assert.equal(interact(state, material, camera), true);
    const event = state.event;
    assert.equal(interact(state, 'drop', cameraAt(8, -10)), true);
    assert.equal(state.carrying, null);
    assert.equal(state.message, 'dropped');
    assert.equal(state.event, event + 1);
    assert.equal(state[material], 0);
    assert.equal(interact(state, material, camera), true);
    assert.equal(interact(state, 'drop', camera), true);
  }
  state.stage = 2;
  const camera = cameraAt(0, -31);
  for (let index = 0; index < 3; index += 1) {
    assert.equal(interact(state, 'capsule', camera), true);
    assert.equal(interact(state, 'drop', camera), true);
  }
  assert.equal(state.shots, 0);
});

test('relay controls toggle heating and stop either heating or cooling', () => {
  const { state, camera } = atRelay();
  assert.equal(interact(state, 'relay', camera), true);
  assert.equal(state.beam, 1);
  assert.equal(state.message, 'heaterOn');
  stepAdventure(state, camera, 0.05);
  close(state.heat, 0.0375);
  assert.equal(interact(state, 'relay', camera), true);
  assert.equal(state.beam, 0);
  assert.equal(state.message, 'heaterOff');
  const stopped = state.heat;
  stepAdventure(state, camera, 0.05);
  assert.equal(state.heat, stopped);
  state.beam = -1;
  assert.equal(interact(state, 'relay', camera), true);
  assert.equal(state.beam, 0);
});

test('heater delivers kJ per second only after docking and within its horizontal radius', () => {
  const { state, camera } = atRelay();
  state.beam = 1;
  camera.x = 3.50001;
  stepAdventure(state, camera, 0.05);
  assert.equal(state.heat, 0);
  camera.x = 3.5;
  camera.y = 100;
  for (let index = 0; index < 20; index += 1) stepAdventure(state, camera, 0.05);
  close(state.heat, 0.75);
  close(state.elapsed, 1.05);
  const early = createAdventure();
  early.beam = 1;
  stepAdventure(early, cameraAt(0, -22), 0.05);
  assert.equal(early.heat, 0);
  assert.equal(early.stage, 0);
});

test('heating and cooling traverse the original 10 g latent-heat plateau reversibly', () => {
  const { state, camera } = atRelay();
  state.heat = 1;
  const initial = waterState(state.heat);
  assert.equal(initial.temperature, 0);
  state.beam = 1;
  stepAdventure(state, camera, 0.05);
  const heated = waterState(state.heat);
  assert.equal(heated.phase, 'melting');
  assert.equal(heated.temperature, 0);
  close(heated.liquid - initial.liquid, 0.0375 / 3.34);
  state.beam = -1;
  stepAdventure(state, camera, 0.05);
  close(state.heat, 1);
  close(waterState(state.heat).liquid, initial.liquid);
  assert.equal(state.bridgeOpen, false);
  state.heat = 10;
  state.beam = 1;
  stepAdventure(state, camera, 0.05);
  assert.equal(waterState(state.heat).temperature, 100);
  assert.ok(waterState(state.heat).gas > waterState(10).gas);
  state.beam = -1;
  stepAdventure(state, camera, 0.05);
  close(state.heat, 10);
});

test('bridge unlock requires at least 95% liquid and zero gas, then latches permanently', () => {
  const { state, camera } = atRelay();
  const threshold = 0.42 + 3.34 * 0.95;
  state.heat = threshold - 1e-8;
  stepAdventure(state, camera, 0.01);
  assert.equal(state.bridgeOpen, false);
  state.heat = threshold + 1e-8;
  stepAdventure(state, camera, 0.01);
  assert.equal(state.bridgeOpen, true);
  assert.equal(state.stage, 2);
  assert.equal(state.checkpoint, 2);
  assert.equal(state.message, 'bridgeReady');
  assert.equal(state.event, 1);
  for (const heat of [0, 32, threshold]) {
    state.heat = heat;
    stepAdventure(state, camera, 0.01);
    assert.equal(state.bridgeOpen, true);
    assert.equal(state.stage, 2);
    assert.equal(state.checkpoint, 2);
    assert.equal(state.event, 1);
    assert.equal(groundHeight(0, -28.5, state), 0);
  }
});

test('boiling cannot unlock a fresh bridge; cooling back to liquid can', () => {
  const { state, camera } = atRelay();
  state.heat = 8;
  assert.ok(waterState(state.heat).gas > 0);
  assert.ok(waterState(state.heat).liquid >= 0.95);
  stepAdventure(state, camera, 0.05);
  assert.equal(state.bridgeOpen, false);
  state.beam = -1;
  advanceUntil(state, camera, () => state.bridgeOpen, 5);
  assert.equal(waterState(state.heat).gas, 0);
  assert.equal(state.stage, 2);
});

test('energy clamps at 0 and 32 kJ, cuts outward power and permits reversal', () => {
  const { state, camera } = atRelay();
  state.heat = 31.99;
  state.beam = 1;
  stepAdventure(state, camera, 0.05);
  assert.equal(state.heat, 32);
  assert.equal(state.beam, 0);
  state.beam = -1;
  stepAdventure(state, camera, 0.05);
  close(state.heat, 31.9625);
  state.heat = 0.01;
  stepAdventure(state, camera, 0.05);
  assert.equal(state.heat, 0);
  assert.equal(state.beam, 0);
  state.beam = 1;
  stepAdventure(state, camera, 0.05);
  close(state.heat, 0.0375);
  state.heat = NaN;
  state.beam = Infinity;
  stepAdventure(state, camera, 0.05);
  assert.equal(state.heat, 0);
});

test('invalid or negative dt is a safe no-op; large finite dt is capped at 50 ms', () => {
  const { state, camera } = atRelay();
  state.beam = 1;
  const before = structuredClone(state);
  const cameraBefore = structuredClone(camera);
  for (const dt of [NaN, Infinity, -Infinity, -1, 0, undefined, null, '0.05']) {
    assert.equal(stepAdventure(state, camera, dt), state);
    assert.deepEqual(state, before);
    assert.deepEqual(camera, cameraBefore);
  }
  stepAdventure(state, camera, Number.MAX_VALUE);
  close(state.elapsed, 0.05);
  close(state.heat, 0.0375);
  stepAdventure(state, camera, 0.001);
  close(state.elapsed, 0.051);
  close(state.heat, 0.03825);
});

test('raft steering follows yaw, respects loaded drag and synchronizes passenger height', () => {
  const { state, camera } = board();
  const event = state.event;
  const distance = 2.4 / (1 + 0.35 * 0.81) * 0.05;
  camera.y = 0.2;
  stepAdventure(state, camera, 0.05, { forward: 1, right: 0 });
  close(state.boat.z, -6 - distance);
  assert.equal(state.boat.x, 0);
  assert.equal(camera.y, ADVENTURE.eyeHeight);
  assert.equal(camera.z, state.boat.z);
  assert.equal(state.event, event);
  camera.yaw = Math.PI / 2;
  const z = state.boat.z;
  stepAdventure(state, camera, 0.05, { forward: 1 });
  close(state.boat.x, distance);
  close(state.boat.z, z);
  camera.yaw = 0;
  stepAdventure(state, camera, 0.05, { right: 1 });
  close(state.boat.x, 2 * distance);
  assert.ok(distance < 2.4 * 0.05);
});

test('diagonal steering has no speed advantage and movement inputs remain bounded', () => {
  const straight = board();
  const diagonal = board();
  stepAdventure(straight.state, straight.camera, 0.05, { forward: 1 });
  stepAdventure(diagonal.state, diagonal.camera, 0.05, { forward: 1, right: 1 });
  close(Math.hypot(diagonal.state.boat.x, diagonal.state.boat.z + 6), -straight.state.boat.z - 6);
  const before = structuredClone(diagonal.state.boat);
  stepAdventure(diagonal.state, diagonal.camera, 0.05, { forward: NaN, right: Infinity });
  assert.deepEqual(diagonal.state.boat, before);
  const capped = board();
  stepAdventure(capped.state, capped.camera, 0.05, { forward: 1000, right: -1000 });
  close(capped.state.boat.x, -diagonal.state.boat.x);
  close(capped.state.boat.z, diagonal.state.boat.z);
  assert.doesNotThrow(() => stepAdventure(capped.state, capped.camera, 0.01, null));
});

test('boat remains inside the first channel and automatically docks without boarding teleport', () => {
  const { state, camera } = board();
  assert.equal(camera.z, -6);
  state.boat.x = 5.999;
  camera.x = 5.999;
  camera.yaw = Math.PI / 2;
  stepAdventure(state, camera, 0.05, { forward: 1 });
  assert.equal(state.boat.x, 6);
  assert.equal(state.boat.z, -6);
  camera.yaw = 0;
  stepAdventure(state, camera, 0.05, { forward: -1 });
  assert.equal(state.boat.z, -6);
  const event = state.event;
  advanceUntil(state, camera, () => !state.riding, 150, 0.05, { forward: 1 });
  assert.ok(state.boat.z >= -16 && state.boat.z <= -15.2);
  assert.equal(state.stage, 1);
  assert.equal(state.checkpoint, 1);
  assert.equal(state.message, 'docked');
  assert.equal(state.event, event + 1);
  assert.equal(camera.x, 6);
  assert.equal(camera.z, -16);
  assert.equal(groundHeight(camera.x, camera.z, state), 0);
  const boat = structuredClone(state.boat);
  stepAdventure(state, camera, 0.05, { forward: 1 });
  assert.deepEqual(state.boat, boat);
  assert.equal(state.event, event + 1);
});

test('projectile preview exactly matches the shared camera origin and unassisted launch velocity', () => {
  const camera = cameraAt(1, -33, Math.PI / 6, 0.4);
  const before = structuredClone(camera);
  const dx = Math.sin(camera.yaw) * Math.cos(camera.pitch);
  const dz = -Math.cos(camera.yaw) * Math.cos(camera.pitch);
  const origin = projectilePoint(camera, 0);
  close(origin.x, camera.x + 0.45 * dx);
  assert.equal(origin.y, camera.y);
  close(origin.z, camera.z + 0.45 * dz);
  const time = 0.73;
  const point = projectilePoint(camera, time);
  close(point.x, origin.x + 11 * dx * time);
  close(point.y, camera.y + 11 * Math.sin(camera.pitch) * time - 0.5 * 9.81 * time ** 2);
  close(point.z, origin.z + 11 * dz * time);
  const { state } = atLaunch();
  assert.equal(throwCapsule(state, camera), true);
  assert.deepEqual({ x: state.projectile.x, y: state.projectile.y, z: state.projectile.z }, origin);
  close(state.projectile.vx, 11 * dx);
  close(state.projectile.vy, 11 * Math.sin(camera.pitch));
  close(state.projectile.vz, 11 * dz);
  close(Math.hypot(state.projectile.vx, state.projectile.vy, state.projectile.vz), 11);
  assert.deepEqual(state.trail, [origin]);
  assert.deepEqual(camera, before);
  assert.equal(state.shots, 1);
  assert.equal(state.carrying, null);
  assert.equal(state.message, 'capsuleThrown');
});

test('yaw and pitch govern the entire velocity vector without auto-aim', () => {
  for (const [yaw, pitch] of [[0, 0], [Math.PI / 2, 0], [-Math.PI / 2, 0], [0, Math.PI / 2], [0, -Math.PI / 6]]) {
    const { state, camera } = atLaunch(pitch, yaw);
    assert.equal(throwCapsule(state, camera), true);
    const { vx, vy, vz } = state.projectile;
    close(Math.hypot(vx, vy, vz), 11);
    close(vx, 11 * Math.sin(yaw) * Math.cos(pitch));
    close(vy, 11 * Math.sin(pitch));
    close(vz, -11 * Math.cos(yaw) * Math.cos(pitch));
  }
});

test('illegal throws and invalid previews are rejected without NaN physics', () => {
  const { state, camera } = atLaunch();
  state.stage = 1;
  const before = structuredClone(state);
  assert.equal(throwCapsule(state, camera), false);
  assert.deepEqual(state, before);
  state.stage = 2;
  const ready = structuredClone(state);
  for (const bad of [null, { ...camera, x: NaN }, { ...camera, y: Infinity }, { ...camera, z: undefined }]) {
    assert.equal(throwCapsule(state, bad), false);
    assert.deepEqual(state, ready);
    assert.throws(() => projectilePoint(bad, 0.5), RangeError);
  }
  for (const time of [NaN, Infinity, -Infinity, -0.1, undefined, '1']) {
    assert.throws(() => projectilePoint(camera, time), RangeError);
  }
  assert.throws(() => projectilePoint(camera, Number.MAX_VALUE), RangeError);
  assert.deepEqual(projectilePoint({ ...camera, yaw: NaN, pitch: Infinity }, 0.1),
    projectilePoint({ ...camera, yaw: 0, pitch: 0 }, 0.1));
  assert.equal(throwCapsule(state, camera), true);
  const launched = structuredClone(state);
  assert.equal(throwCapsule(state, camera), false);
  assert.equal(interact(state, 'capsule', cameraAt(0, -31)), false);
  assert.deepEqual(state, launched);
});

test('substepped flight remains analytically accurate under gravity and independent of frame partition', () => {
  const first = atLaunch(0.2, 0.1);
  const second = atLaunch(0.2, 0.1);
  throwCapsule(first.state, first.camera);
  throwCapsule(second.state, second.camera);
  const initial = structuredClone(first.state.projectile);
  const event = first.state.event;
  for (let index = 0; index < 6; index += 1) stepAdventure(first.state, first.camera, 0.05);
  for (let index = 0; index < 30; index += 1) stepAdventure(second.state, second.camera, 0.01);
  const expected = projectilePoint(first.camera, 0.3);
  for (const key of ['x', 'y', 'z']) {
    close(first.state.projectile[key], expected[key]);
    close(first.state.projectile[key], second.state.projectile[key]);
  }
  close(first.state.projectile.age, 0.3);
  close(first.state.projectile.vy, initial.vy - 9.81 * 0.3);
  assert.equal(first.state.projectile.vx, initial.vx);
  assert.equal(first.state.projectile.vz, initial.vz);
  assert.equal(first.state.event, event);
  assert.equal(first.state.trail.length, 7);
  assert.equal(initial.age, 0);
});

test('a feasible aimed throw reaches the lighthouse, wins once and freezes progression', () => {
  const { state, camera } = atLaunch(0.5);
  assert.equal(throwCapsule(state, camera), true);
  const event = state.event;
  advanceUntil(state, camera, () => state.won, 80);
  assert.equal(state.stage, 3);
  assert.equal(state.checkpoint, 2);
  assert.equal(state.message, 'won');
  assert.equal(state.event, event + 1);
  assert.equal(state.projectile, null);
  assert.equal(state.shots, 1);
  const contact = state.trail.at(-1);
  close(Math.hypot(contact.x, contact.y - 2, contact.z + 43), 1.25, 1e-8);
  const won = structuredClone(state);
  stepAdventure(state, camera, 0.05);
  assert.equal(interact(state, 'capsule', cameraAt(0, -31)), false);
  assert.equal(throwCapsule(state, camera), false);
  assert.deepEqual(state, won);
});

test('swept segment-sphere contact prevents tunnelling even across an entire receiver in one substep', () => {
  const { state, camera } = atLaunch();
  state.carrying = null;
  state.projectile = { x: 0, y: 2, z: -40, vx: 0, vy: 0, vz: -1000, age: 0 };
  stepAdventure(state, camera, 0.05);
  assert.equal(state.won, true);
  assert.equal(state.message, 'won');
  const nearMiss = atLaunch();
  nearMiss.state.projectile = { x: 1.251, y: 2, z: -40, vx: 0, vy: 0, vz: -1000, age: 0 };
  stepAdventure(nearMiss.state, nearMiss.camera, 0.05);
  assert.equal(nearMiss.state.won, false);
});

test('a projectile initially inside the receiver registers contact', () => {
  const { state, camera } = atLaunch();
  state.projectile = { x: 0, y: 2, z: -43, vx: 0, vy: 0, vz: 0, age: 0 };
  stepAdventure(state, camera, 0.01);
  assert.equal(state.won, true);
  assert.deepEqual(state.trail.at(-1), { x: 0, y: 2, z: -43 });
});

test('misses provide infinite retrievable supply and never emit repeated result events', () => {
  const { state, camera } = atLaunch(0.2, Math.PI / 2);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    assert.equal(throwCapsule(state, camera), true);
    const event = state.event;
    advanceUntil(state, camera, () => state.projectile === null, 100);
    assert.equal(state.won, false);
    assert.equal(state.message, 'retryCapsule');
    assert.equal(state.event, event + 1);
    assert.equal(state.shots, attempt);
    assert.equal(state.stage, 2);
    assert.equal(state.bridgeOpen, true);
    stepAdventure(state, camera, 0.05);
    assert.equal(state.event, event + 1);
    goTo(camera, 'capsule');
    assert.equal(interact(state, 'capsule', camera), true);
    camera.z = -33;
  }
});

test('flight history is bounded to 90 independent points at small time steps', () => {
  const { state, camera } = atLaunch(Math.PI / 2);
  camera.x = 4;
  throwCapsule(state, camera);
  const origin = structuredClone(state.trail[0]);
  for (let index = 0; index < 200; index += 1) {
    stepAdventure(state, camera, 0.005);
    assert.ok(state.trail.length <= 90);
  }
  assert.equal(state.trail.length, 90);
  assert.ok(state.projectile);
  close(state.projectile.age, 1);
  assert.notDeepEqual(state.trail[0], origin);
  const lastPoint = state.trail.at(-1);
  assert.notEqual(lastPoint, state.projectile);
  const height = lastPoint.y;
  stepAdventure(state, camera, 0.005);
  assert.equal(lastPoint.y, height);
});

test('projectiles expire at four seconds or below water, including invalid external snapshots', () => {
  const { state, camera } = atLaunch();
  state.projectile = { x: 4, y: 200, z: -33, vx: 0, vy: 11, vz: 0, age: 0 };
  state.carrying = null;
  advanceUntil(state, camera, () => state.projectile === null, 80);
  assert.equal(state.message, 'retryCapsule');
  assert.equal(state.won, false);
  close(state.elapsed, 4);
  assert.ok(state.trail.length <= 90);
  for (const projectile of [
    { x: 0, y: -0.61, z: -33, vx: 0, vy: 0, vz: -11, age: 0 },
    { x: 0, y: 2, z: -33, vx: NaN, vy: 0, vz: -11, age: 0 },
    { x: 0, y: 2, z: -33, vx: 0, vy: 0, vz: -11, age: -1 }
  ]) {
    state.projectile = projectile;
    const event = state.event;
    stepAdventure(state, camera, 0.01);
    assert.equal(state.projectile, null);
    assert.equal(state.event, event + 1);
    assert.equal(state.message, 'retryCapsule');
  }
});

test('checkpoint rescues preserve built challenges, heat, stage, victory and orientation', () => {
  for (const checkpoint of [0, 1, 2]) {
    const state = Object.assign(createAdventure(), {
      checkpoint, stage: checkpoint, wood: 2, steel: 1, heat: 5, elapsed: 12,
      bridgeOpen: checkpoint === 2, riding: true, beam: -1, carrying: 'capsule',
      shots: 3, event: 7, rescues: 2,
      projectile: { x: 0, y: 2, z: -34, vx: 0, vy: 2, vz: -9, age: 1 },
      trail: [{ x: 0, y: 2, z: -34 }], boat: { x: 3, z: -12 }
    });
    if (checkpoint === 2) {
      state.won = true;
      state.stage = 3;
    }
    const before = structuredClone(state);
    const camera = { ...cameraAt(8, -10, 0.7, 0.2), y: -4 };
    assert.equal(rescue(state, camera), state);
    assert.deepEqual(camera, cameraAt(0, checkpoint === 0 ? 6 : checkpoint === 1 ? -17 : -31, 0.7, 0.2));
    for (const key of ['wood', 'steel', 'heat', 'stage', 'checkpoint', 'won', 'bridgeOpen', 'elapsed', 'shots', 'trail']) {
      assert.deepEqual(state[key], before[key]);
    }
    assert.equal(state.riding, false);
    assert.equal(state.beam, 0);
    assert.equal(state.carrying, null);
    assert.equal(state.projectile, null);
    assert.equal(state.rescues, 3);
    assert.equal(state.message, 'recovered');
    assert.equal(state.event, 8);
    assert.deepEqual(state.boat, checkpoint === 0 ? { x: 0, z: -6 } : before.boat);
  }
});

test('falling, nonfinite positions and out-of-bounds travel recover without losing progress', () => {
  for (const bad of [
    { y: -3.001 }, { x: 9.001 }, { x: -9.001 }, { z: 9.001 }, { z: -47.001 },
    { x: NaN }, { y: Infinity }, { z: NaN }
  ]) {
    const state = createAdventure();
    state.wood = 2;
    state.heat = 2;
    const camera = { ...cameraAt(), ...bad };
    stepAdventure(state, camera, 0.05);
    assert.equal(state.rescues, 1);
    assert.equal(state.message, 'recovered');
    assert.equal(state.wood, 2);
    assert.equal(state.heat, 2);
    assert.deepEqual(camera, cameraAt());
    close(state.elapsed, 0.05);
  }
  for (const boundary of [{ y: -3 }, { x: 9 }, { x: -9 }, { z: 9 }, { z: -47 }]) {
    const state = createAdventure();
    stepAdventure(state, { ...cameraAt(), ...boundary }, 0.05);
    assert.equal(state.rescues, 0);
  }
});

test('a recovered signal-stage player can retrieve a lost capsule even after cooling to ice', () => {
  const { state, camera } = atLaunch();
  state.heat = 0;
  throwCapsule(state, camera);
  camera.y = -4;
  stepAdventure(state, camera, 0.01);
  assert.equal(state.projectile, null);
  assert.equal(state.carrying, null);
  assert.equal(state.stage, 2);
  assert.equal(state.bridgeOpen, true);
  assert.equal(camera.z, -31);
  assert.equal(groundHeight(0, -28.5, state), 0);
  assert.equal(interact(state, 'capsule', camera), true);
  assert.equal(throwCapsule(state, camera), true);
  assert.equal(state.shots, 2);
});

test('original rescue mission completes from fresh state with physics-driven transitions', () => {
  const { state, camera } = board();
  advanceUntil(state, camera, () => state.stage === 1, 150, 0.05, { forward: 1 });
  assert.equal(state.checkpoint, 1);
  goTo(camera, 'relay');
  assert.equal(interact(state, 'relay', camera), true);
  advanceUntil(state, camera, () => state.bridgeOpen, 120);
  assert.ok(waterState(state.heat).liquid >= 0.95);
  assert.equal(waterState(state.heat).gas, 0);
  assert.equal(interact(state, 'relay', camera), true);
  assert.equal(state.beam, 0);
  assert.equal(groundHeight(0, -28.5, state), 0);
  goTo(camera, 'capsule');
  assert.equal(interact(state, 'capsule', camera), true);
  camera.z = -33;
  camera.pitch = 0.5;
  assert.equal(throwCapsule(state, camera), true);
  advanceUntil(state, camera, () => state.won, 80);
  assert.equal(state.stage, 3);
  assert.equal(state.checkpoint, 2);
  assert.equal(state.shots, 1);
  assert.equal(state.rescues, 0);
  assert.equal(state.wood, 2);
  assert.equal(state.steel, 0);
  assert.equal(state.message, 'won');
  assert.ok(Number.isFinite(state.elapsed));
  assert.ok(state.trail.length <= 90);
});

test('overlapping station radii choose the closest available target, not the first candidate', () => {
  const state = createAdventure();
  state.boat = { x: -2.5, z: 3 };
  const camera = cameraAt(-2.5, 3);
  assert.deepEqual(nearestStation(camera, state), { id: 'raft', x: -2.5, z: 3, distance: 0 });
  const before = structuredClone(state);
  assert.equal(interact(state, 'wood', camera), false);
  assert.deepEqual(state, before);
  camera.x = -3;
  assert.deepEqual(nearestStation(camera, state), { id: 'wood', x: -3, z: 3, distance: 0 });
  assert.equal(interact(state, 'wood', camera), true);
  assert.equal(state.carrying, 'wood');
  assert.equal(nearestStation(camera, state).id, 'raft');
});

test('restored inventory cannot install a module beyond either material cap', () => {
  for (const material of ['wood', 'steel']) {
    const state = Object.assign(createAdventure(), { wood: 2, steel: 1, carrying: material });
    const camera = cameraAt(0, -5);
    const before = structuredClone(state);
    assert.equal(nearestStation(camera, state).id, 'raft');
    assert.equal(interact(state, 'raft', camera), false);
    assert.deepEqual(state, before);
    assert.deepEqual(camera, cameraAt(0, -5));
    assert.equal(interact(state, 'drop', camera), true);
    assert.equal(state.carrying, null);
    assert.equal(state.wood, 2);
    assert.equal(state.steel, 1);
  }
});

test('non-building cargo cannot be installed or silently discarded at the raft', () => {
  const state = Object.assign(createAdventure(), { wood: 2, carrying: 'capsule' });
  const camera = cameraAt(0, -5);
  const before = structuredClone(state);
  assert.equal(interact(state, 'raft', camera), false);
  assert.deepEqual(state, before);
  assert.deepEqual(camera, cameraAt(0, -5));
  assert.equal(interact(state, 'drop', camera), true);
  assert.equal(interact(state, 'raft', camera), true);
  assert.equal(state.riding, true);
});

test('pickup availability prevents occupied hands and an in-flight capsule from being replaced', () => {
  const state = createAdventure();
  const camera = cameraAt(-3, 3);
  assert.equal(interact(state, 'wood', camera), true);
  const occupied = structuredClone(state);
  assert.equal(interact(state, 'wood', camera), false);
  assert.equal(interact(state, 'steel', cameraAt(3, 3)), false);
  assert.deepEqual(state, occupied);
  const launch = atLaunch();
  assert.equal(throwCapsule(launch.state, launch.camera), true);
  const airborne = structuredClone(launch.state);
  assert.equal(nearestStation(cameraAt(0, -31), launch.state), null);
  assert.equal(interact(launch.state, 'capsule', cameraAt(0, -31)), false);
  assert.deepEqual(launch.state, airborne);
});

test('unknown action IDs remain rejected even at an available station', () => {
  for (const id of ['wood', 'steel', 'raft', 'relay', 'capsule']) {
    const state = createAdventure();
    state.stage = id === 'relay' ? 1 : id === 'capsule' ? 2 : 0;
    state.checkpoint = state.stage;
    const { x, z } = ADVENTURE.stations[id];
    const camera = cameraAt(x, z);
    assert.equal(nearestStation(camera, state).id, id);
    const before = structuredClone(state);
    assert.equal(interact(state, 'unknown', camera), false);
    assert.deepEqual(state, before);
  }
});

test('an invalid restored riding state safely recovers while retaining completed construction', () => {
  for (const [wood, steel] of [[0, 0], [1, 0], [2, 1]]) {
    const state = Object.assign(createAdventure(), {
      wood, steel, heat: 2, riding: true, boat: { x: 2, z: -10 }
    });
    const camera = cameraAt(2, -10, 0.4, -0.2);
    assert.equal(raftState(state).safe, false);
    assert.doesNotThrow(() => stepAdventure(state, camera, 0.05, { forward: 1 }));
    assert.equal(state.riding, false);
    assert.equal(state.rescues, 1);
    assert.equal(state.event, 1);
    assert.equal(state.message, 'recovered');
    assert.equal(state.wood, wood);
    assert.equal(state.steel, steel);
    assert.equal(state.heat, 2);
    assert.equal(state.stage, 0);
    assert.equal(state.checkpoint, 0);
    assert.deepEqual(state.boat, { x: 0, z: -6 });
    assert.deepEqual(camera, cameraAt(0, 6, 0.4, -0.2));
  }
});

test('subnormal positive dt produces a stationary swept segment without NaN or a false hit', () => {
  const { state, camera } = atLaunch();
  assert.equal(throwCapsule(state, camera), true);
  const projectile = structuredClone(state.projectile);
  const event = state.event;
  stepAdventure(state, camera, Number.MIN_VALUE);
  for (const key of ['x', 'y', 'z', 'vx', 'vy', 'vz']) assert.equal(state.projectile[key], projectile[key]);
  assert.equal(state.projectile.age, Number.MIN_VALUE);
  assert.equal(state.elapsed, Number.MIN_VALUE);
  assert.equal(state.won, false);
  assert.equal(state.event, event);
  assert.equal(state.message, 'capsuleThrown');
  assert.deepEqual(state.trail[0], state.trail[1]);
});
