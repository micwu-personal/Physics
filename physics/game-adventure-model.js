import { clamp, waterState } from './game-model.js';

// Distances are schematic metres, mass is kg, time is seconds, and heat is kJ.
// Gravity and equilibrium displacement are physical; waves and hull dynamics
// are not simulated. These dimensions describe open terrain, not buildings.
export const ADVENTURE = Object.freeze({
  playerMass: 80,
  waterDensity: 1000,
  gravity: 9.81,
  moduleVolume: 0.25,
  woodDensity: 650,
  steelDensity: 7800,
  // A 10% displacement reserve is an engineering/gameplay margin, not a law.
  safeDraft: 0.9,
  heaterPower: 0.75,
  throwSpeed: 11,
  receiver: Object.freeze({ x: 0, y: 2, z: -43, radius: 1.25 }),
  stations: Object.freeze({
    wood: Object.freeze({ x: -3, z: 3 }),
    steel: Object.freeze({ x: 3, z: 3 }),
    raft: Object.freeze({ x: 0, z: -5 }),
    relay: Object.freeze({ x: 0, z: -22 }),
    capsule: Object.freeze({ x: 0, z: -31 })
  }),
  bounds: Object.freeze({ minX: -9, maxX: 9, minZ: -47, maxZ: 9 }),
  deckHeight: 0,
  waterLevel: -0.6,
  eyeHeight: 1.65
});

const MAX_WOOD = 2;
const MAX_STEEL = 1;
const MAX_HEAT = 32;
const INTERACTION_RADIUS = 2.6;
const HEATER_RADIUS = 3.5;
const MAX_STEP = 0.05;
const PROJECTILE_SUBSTEP = 0.01;
const PROJECTILE_LIFETIME = 4;
const TRAIL_LIMIT = 90;

// Stable message keys (no display text): brief, woodPicked, steelPicked,
// woodInstalled, steelInstalled, steelRemoved, raftUnsafe, boarded, docked,
// heaterOn, heaterOff, bridgeReady, capsulePicked, capsuleThrown, dropped,
// retryCapsule, recovered, won. `event` changes only for an action/feedback,
// unlock, docking, recovery, or projectile result, never for continuous motion.
export function createAdventure() {
  return {
    elapsed: 0,
    won: false,
    stage: 0,
    checkpoint: 0,
    wood: 0,
    steel: 0,
    carrying: null,
    heat: 0,
    beam: 0,
    bridgeOpen: false,
    riding: false,
    boat: { x: 0, z: -6 },
    projectile: null,
    trail: [],
    shots: 0,
    rescues: 0,
    message: 'brief',
    event: 0
  };
}

function finiteOr(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function moduleCount(value, maximum) {
  return clamp(Math.floor(finiteOr(value)), 0, maximum);
}

function notify(state, message) {
  state.message = message;
  state.event = finiteOr(state.event) + 1;
}

function horizontalPosition(position) {
  return position != null && Number.isFinite(position.x) && Number.isFinite(position.z);
}

function eyePosition(camera) {
  return horizontalPosition(camera) && Number.isFinite(camera.y);
}

export function raftState(state) {
  const wood = moduleCount(state.wood, MAX_WOOD);
  const steel = moduleCount(state.steel, MAX_STEEL);
  const modules = wood + steel;
  const mass = ADVENTURE.playerMass + ADVENTURE.moduleVolume
    * (wood * ADVENTURE.woodDensity + steel * ADVENTURE.steelDensity);
  const capacity = modules * ADVENTURE.moduleVolume * ADVENTURE.waterDensity;
  // Draft is the required submerged-volume fraction, not depth in metres.
  // Fractions above 1 mean the fully submerged assembly cannot support its load.
  const draft = modules > 0 ? mass / capacity : Infinity;
  const floating = modules > 0 && mass <= capacity;
  const safe = modules > 0 && mass <= capacity * ADVENTURE.safeDraft;
  const freeboard = modules > 0 ? Math.max(0, 0.5 * (1 - draft)) : 0;
  return { mass, capacity, draft, floating, safe, freeboard };
}

export function groundHeight(x, z, state) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  const shore = Math.abs(x) <= 8 && z >= -7 && z <= 10;
  const middle = Math.abs(x) <= 7 && z >= -27 && z <= -15;
  const launch = Math.abs(x) <= 5 && z >= -35 && z <= -30;
  const bridge = state?.bridgeOpen && Math.abs(x) <= 1.5 && z >= -30 && z <= -27;
  return shore || middle || launch || bridge ? ADVENTURE.deckHeight : null;
}

function raftTarget(state) {
  if (horizontalPosition(state.boat)
      && (state.riding || state.boat.x !== 0 || state.boat.z !== -6)) {
    return state.boat;
  }
  return ADVENTURE.stations.raft;
}

export function nearestStation(camera, state) {
  if (!horizontalPosition(camera) || state.won) return null;
  const targets = [];
  if (state.stage === 0 && state.checkpoint === 0) {
    if (state.carrying === null && !state.riding) {
      if (moduleCount(state.wood, MAX_WOOD) < MAX_WOOD) targets.push(['wood', ADVENTURE.stations.wood]);
      if (moduleCount(state.steel, MAX_STEEL) < MAX_STEEL) targets.push(['steel', ADVENTURE.stations.steel]);
    }
    targets.push(['raft', raftTarget(state)]);
  }
  if (state.stage >= 1) targets.push(['relay', ADVENTURE.stations.relay]);
  if (state.stage >= 2 && state.carrying === null && !state.projectile) {
    targets.push(['capsule', ADVENTURE.stations.capsule]);
  }
  let nearest = null;
  for (const [id, target] of targets) {
    const distance = Math.hypot(camera.x - target.x, camera.z - target.z);
    if (distance <= INTERACTION_RADIUS && (!nearest || distance < nearest.distance)) {
      nearest = { id, x: target.x, z: target.z, distance };
    }
  }
  return nearest;
}

export function interact(state, id, camera) {
  if (state.won) return false;
  // Dropping is an inventory action: it needs no station and returns the item
  // to its unlimited supply. Installed-module limits still apply on pickup.
  if (id === 'drop') {
    if (!['wood', 'steel', 'capsule'].includes(state.carrying)) return false;
    state.carrying = null;
    notify(state, 'dropped');
    return true;
  }
  const nearest = nearestStation(camera, state);
  if (!nearest || nearest.id !== (id === 'removeSteel' ? 'raft' : id)) return false;
  if (id === 'removeSteel') {
    if (state.steel < 1) return false;
    state.steel -= 1;
    notify(state, 'steelRemoved');
    return true;
  }
  if (id === 'wood' || id === 'steel' || id === 'capsule') {
    // Station availability already validates empty hands and capsule supply.
    state.carrying = id;
    notify(state, `${id}Picked`);
    return true;
  }
  if (id === 'raft') {
    if (state.riding) return false;
    if (state.carrying === 'wood' || state.carrying === 'steel') {
      const material = state.carrying;
      const maximum = material === 'wood' ? MAX_WOOD : MAX_STEEL;
      if (state[material] >= maximum) return false;
      state[material] = moduleCount(state[material], maximum) + 1;
      state.carrying = null;
      notify(state, `${material}Installed`);
      return true;
    }
    if (state.carrying !== null) return false;
    if (!raftState(state).safe) {
      // Rejected boarding is still meaningful feedback for UI/audio.
      notify(state, 'raftUnsafe');
      return false;
    }
    state.riding = true;
    camera.x = state.boat.x;
    camera.z = state.boat.z;
    camera.y = ADVENTURE.eyeHeight;
    notify(state, 'boarded');
    return true;
  }
  // Every other validated station action returned above; only relay remains.
  state.beam = state.beam === 0 ? 1 : 0;
  notify(state, state.beam === 0 ? 'heaterOff' : 'heaterOn');
  return true;
}

function launchProjectile(camera) {
  const yaw = finiteOr(camera.yaw);
  const pitch = finiteOr(camera.pitch);
  const directionX = Math.sin(yaw) * Math.cos(pitch);
  const directionZ = -Math.cos(yaw) * Math.cos(pitch);
  // Yaw zero faces -Z; positive pitch looks up, positive yaw turns toward +X.
  // The 0.45 m offset is horizontal only, matching the renderer's aim preview.
  return {
    x: camera.x + 0.45 * directionX,
    y: camera.y,
    z: camera.z + 0.45 * directionZ,
    vx: ADVENTURE.throwSpeed * directionX,
    vy: ADVENTURE.throwSpeed * Math.sin(pitch),
    vz: ADVENTURE.throwSpeed * directionZ,
    age: 0
  };
}

function trajectoryPoint(projectile, seconds) {
  const point = {
    x: projectile.x + projectile.vx * seconds,
    y: projectile.y + projectile.vy * seconds - 0.5 * ADVENTURE.gravity * seconds ** 2,
    z: projectile.z + projectile.vz * seconds
  };
  if (!eyePosition(point)) throw new RangeError('projectile position must be finite');
  return point;
}

// Pure, unassisted launch preview from camera {x,y,z,yaw,pitch}. The same
// origin/velocity are used by throwCapsule; gravity is constant, with no drag.
export function projectilePoint(camera, seconds) {
  if (!eyePosition(camera) || !Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError('camera position and nonnegative time must be finite');
  }
  return trajectoryPoint(launchProjectile(camera), seconds);
}

export function throwCapsule(state, camera) {
  if (state.won || state.stage < 2 || state.carrying !== 'capsule'
      || state.projectile || !eyePosition(camera)) return false;
  state.projectile = launchProjectile(camera);
  state.trail = [{ x: state.projectile.x, y: state.projectile.y, z: state.projectile.z }];
  state.carrying = null;
  state.shots = finiteOr(state.shots) + 1;
  notify(state, 'capsuleThrown');
  return true;
}

function appendTrail(state, point) {
  state.trail.push({ x: point.x, y: point.y, z: point.z });
  if (state.trail.length > TRAIL_LIMIT) state.trail.splice(0, state.trail.length - TRAIL_LIMIT);
}

// Earliest contact along the segment, including a segment starting inside the
// receiver. Testing swept segments instead of endpoints prevents tunnelling.
function receiverContact(start, end) {
  const receiver = ADVENTURE.receiver;
  const x = start.x - receiver.x;
  const y = start.y - receiver.y;
  const z = start.z - receiver.z;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const c = x * x + y * y + z * z - receiver.radius ** 2;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy + dz * dz;
  if (a === 0) return null;
  const b = 2 * (x * dx + y * dy + z * dz);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const contact = (-b - Math.sqrt(discriminant)) / (2 * a);
  return contact >= 0 && contact <= 1 ? contact : null;
}

function missCapsule(state) {
  state.projectile = null;
  notify(state, 'retryCapsule');
}

function stepProjectile(state, dt) {
  const projectile = state.projectile;
  if (!projectile) return;
  if (!['x', 'y', 'z', 'vx', 'vy', 'vz', 'age'].every(key => Number.isFinite(projectile[key]))
      || projectile.age < 0 || projectile.age >= PROJECTILE_LIFETIME
      || projectile.y < ADVENTURE.waterLevel) {
    missCapsule(state);
    return;
  }
  const steps = Math.ceil(dt / PROJECTILE_SUBSTEP);
  for (let index = 0; index < steps; index += 1) {
    const interval = Math.min(dt / steps, PROJECTILE_LIFETIME - projectile.age);
    const end = trajectoryPoint(projectile, interval);
    const contact = receiverContact(projectile, end);
    if (contact !== null) {
      appendTrail(state, {
        x: projectile.x + (end.x - projectile.x) * contact,
        y: projectile.y + (end.y - projectile.y) * contact,
        z: projectile.z + (end.z - projectile.z) * contact
      });
      state.projectile = null;
      state.won = true;
      state.stage = 3;
      notify(state, 'won');
      return;
    }
    Object.assign(projectile, end);
    projectile.vy -= ADVENTURE.gravity * interval;
    projectile.age += interval;
    // Repeated small steps must not extend a four-second flight by one frame.
    if (PROJECTILE_LIFETIME - projectile.age <= 1e-12) projectile.age = PROJECTILE_LIFETIME;
    if (projectile.y < ADVENTURE.waterLevel || projectile.age >= PROJECTILE_LIFETIME) {
      appendTrail(state, projectile);
      missCapsule(state);
      return;
    }
  }
  appendTrail(state, projectile);
}

function stepRaft(state, camera, dt, input) {
  if (!state.riding) return;
  const { draft, safe } = raftState(state);
  if (!Number.isFinite(draft) || !safe) {
    rescue(state, camera);
    return;
  }
  const forward = clamp(finiteOr(input.forward), -1, 1);
  const right = clamp(finiteOr(input.right), -1, 1);
  const length = Math.max(1, Math.hypot(forward, right));
  const yaw = finiteOr(camera.yaw);
  // Loaded-draft drag and this speed are schematic steering, not a solved
  // hydrodynamic force model. Normalisation avoids faster diagonal travel.
  const distance = 2.4 / (1 + 0.35 * draft) * dt / length;
  state.boat.x = clamp(finiteOr(state.boat.x)
    + (right * Math.cos(yaw) + forward * Math.sin(yaw)) * distance, -6, 6);
  state.boat.z = clamp(finiteOr(state.boat.z, -6)
    + (right * Math.sin(yaw) - forward * Math.cos(yaw)) * distance, -16, -6);
  camera.x = state.boat.x;
  camera.z = state.boat.z;
  camera.y = ADVENTURE.eyeHeight;
  if (state.boat.z <= -15.2) {
    state.riding = false;
    state.stage = 1;
    state.checkpoint = 1;
    camera.z = -16;
    notify(state, 'docked');
  }
}

export function stepAdventure(state, camera, dt, input = {}) {
  const interval = clamp(finiteOr(dt), 0, MAX_STEP);
  if (interval === 0 || state.won) return state;
  state.elapsed = finiteOr(state.elapsed) + interval;
  const bounds = ADVENTURE.bounds;
  if (!eyePosition(camera) || camera.y < -3 || camera.x < bounds.minX
      || camera.x > bounds.maxX || camera.z < bounds.minZ || camera.z > bounds.maxZ) {
    rescue(state, camera);
    return state;
  }
  stepRaft(state, camera, interval, input ?? {});
  state.heat = clamp(finiteOr(state.heat), 0, MAX_HEAT);
  if (state.stage >= 1 && Math.hypot(camera.x - ADVENTURE.stations.relay.x,
    camera.z - ADVENTURE.stations.relay.z) <= HEATER_RADIUS) {
    const power = clamp(finiteOr(state.beam), -1, 1);
    state.heat = clamp(state.heat + power * ADVENTURE.heaterPower * interval, 0, MAX_HEAT);
    if (state.heat === 0 && power < 0 || state.heat === MAX_HEAT && power > 0) state.beam = 0;
  }
  const water = waterState(state.heat);
  if (state.stage >= 1 && !state.bridgeOpen && water.liquid >= 0.95 && water.gas === 0) {
    // A latched mechanical bridge remains open on later cooling/boiling.
    state.bridgeOpen = true;
    state.stage = 2;
    state.checkpoint = 2;
    notify(state, 'bridgeReady');
  }
  stepProjectile(state, interval);
  return state;
}

export function rescue(state, camera) {
  state.riding = false;
  state.beam = 0;
  state.projectile = null;
  state.carrying = null;
  camera.x = 0;
  camera.y = ADVENTURE.eyeHeight;
  camera.z = state.checkpoint >= 2 ? -31 : state.checkpoint === 1 ? -17 : 6;
  if (state.checkpoint === 0) {
    state.boat.x = 0;
    state.boat.z = -6;
  }
  state.rescues = finiteOr(state.rescues) + 1;
  notify(state, 'recovered');
  return state;
}
