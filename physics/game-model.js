// Retained-heat (enthalpy) budget for 10 g at nominal 1 atm, with constant
// specific heats, equilibrium mass fractions, and no environmental heat loss.
// Magnified particle markers illustrate phases, not molecular dynamics,
// visible atoms, or the actual size/count of water molecules.
export const WATER_MASS = 0.01; // kg
export const MAX_HEAT = 32; // kJ
// Temperatures are °C; c values are kJ/(kg K); L values are kJ/kg.
export const WATER_PROPERTIES = Object.freeze({
  pressureAtm: 1,
  initialTemperature: -20,
  meltingTemperature: 0,
  boilingTemperature: 100,
  cIce: 2.1,
  cWater: 4.18,
  cSteam: 2.0,
  Lfusion: 334,
  Lvaporization: 2256
});

// Cumulative kJ: m cIce (20), then m Lfusion, m cWater (100), m Lvaporization.
export const WATER_LIMITS = Object.freeze({
  meltingStart: 0.42,
  meltingEnd: 3.76,
  boilingStart: 7.94,
  boilingEnd: 30.5
});
export const BUOYANCY_PROPERTIES = Object.freeze({
  volume: 0.001, // m³; the buoyancy object is a separate 1 L teaching sample.
  waterDensity: 1000, // kg/m³
  gravity: 9.81 // m/s²
});
export const BUOYANCY_PRESETS = Object.freeze({ wood: 650, neutral: 1000, steel: 7800 });
export const MAX_PARTICLE_COUNT = 4096; // Visual marker budget, not a molecular population.

function finite(value, name) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`);
  return value;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function waterState(heatKJ) {
  const heat = clamp(finite(heatKJ, 'heatKJ'), 0, MAX_HEAT);
  const { initialTemperature, meltingTemperature, boilingTemperature,
    cIce, cWater, cSteam, Lfusion, Lvaporization } = WATER_PROPERTIES;
  const { meltingStart, meltingEnd, boilingStart, boilingEnd } = WATER_LIMITS;
  let temperature;
  let phase;
  let solid = 0;
  let liquid = 0;
  let gas = 0;

  // At an exact boundary, select the stage beginning there (fractions stay continuous).
  if (heat < meltingStart) {
    temperature = initialTemperature + heat / (WATER_MASS * cIce);
    phase = 'ice';
    solid = 1;
  } else if (heat < meltingEnd) {
    temperature = meltingTemperature;
    phase = 'melting';
    liquid = (heat - meltingStart) / (WATER_MASS * Lfusion);
    solid = 1 - liquid;
  } else if (heat < boilingStart) {
    temperature = meltingTemperature + (heat - meltingEnd) / (WATER_MASS * cWater);
    phase = 'liquid';
    liquid = 1;
  } else if (heat < boilingEnd) {
    temperature = boilingTemperature;
    phase = 'boiling';
    gas = (heat - boilingStart) / (WATER_MASS * Lvaporization);
    liquid = 1 - gas;
  } else {
    temperature = boilingTemperature + (heat - boilingEnd) / (WATER_MASS * cSteam);
    phase = 'steam';
    gas = 1;
  }

  // Relative thermal-speed scale, not kinetic energy; latent heat leaves it unchanged.
  const kineticScale = Math.sqrt((temperature + 273.15) / 273.15);
  return { heat, temperature, phase, solid, liquid, gas, kineticScale };
}

// Forces are N, mass is kg, and netForce is upward-positive at full immersion.
// floating includes neutral buoyancy; a floating object's equilibrium net force is zero.
export function buoyancy(density) {
  finite(density, 'density');
  if (density <= 0) throw new RangeError('density must be positive');
  const { volume, waterDensity, gravity } = BUOYANCY_PROPERTIES;
  const mass = density * volume;
  const weight = mass * gravity;
  const maxBuoyancy = waterDensity * volume * gravity;
  const submergedFraction = clamp(density / waterDensity, 0, 1);
  const floating = density <= waterDensity;
  return { mass, weight, maxBuoyancy, submergedFraction, floating, netForce: maxBuoyancy - weight };
}

export function makeParticles(count = 54) {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_PARTICLE_COUNT) {
    throw new RangeError(`count must be an integer between 0 and ${MAX_PARTICLE_COUNT}`);
  }
  const side = Math.ceil(Math.cbrt(count));
  const divisions = Math.max(1, side - 1);
  const offset = side > 1 ? 0.5 : 0;
  return Array.from({ length: count }, (_, index) => ({
    x: ((index % side) / divisions - offset) * 4.4,
    y: ((Math.floor(index / side) % side) / divisions - offset) * 4.4,
    z: (Math.floor(index / (side * side)) / divisions - offset) * 4.4,
    seed: ((index + 1) * 0.6180339887498949) % 1
  }));
}

function checkedParticle(particle) {
  if (particle === null || typeof particle !== 'object') {
    throw new RangeError('particle must have x, y, z, and seed');
  }
  const { x, y, z, seed } = particle;
  finite(x, 'particle.x');
  finite(y, 'particle.y');
  finite(z, 'particle.z');
  finite(seed, 'particle.seed');
  if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) > 2.2) {
    throw new RangeError('particle coordinates must be between -2.2 and 2.2');
  }
  if (seed < 0 || seed >= 1) throw new RangeError('particle.seed must be between 0 (inclusive) and 1 (exclusive)');
  return particle;
}

function checkedState(state) {
  if (state === null || typeof state !== 'object') {
    throw new RangeError('state must be a waterState result');
  }
  const expected = waterState(state.heat);
  for (const key of ['heat', 'temperature', 'phase', 'solid', 'liquid', 'gas', 'kineticScale']) {
    if (state[key] !== expected[key]) throw new RangeError(`state.${key} is inconsistent with waterState(state.heat)`);
  }
  return expected;
}

function oscillation(time, rate, phase) {
  // Reduce time before multiplying, so even very large finite timestamps stay finite.
  return Math.sin((time % (2 * Math.PI / rate)) * rate + phase);
}

function reflected(origin, velocity, time) {
  if (velocity === 0) return origin;
  const extent = 8;
  const span = 4 * extent;
  const travel = (time % (span / Math.abs(velocity))) * velocity;
  const folded = ((origin + travel + extent) % span + span) % span;
  return extent - Math.abs(folded - 2 * extent);
}

// Time is finite seconds (signed previews are supported); coordinates are schematic units.
// Local liquid paths let neighbors exchange locations; gas paths reflect in a larger box.
// Mixing positions illustrates mass fractions, not interfaces or physical intermolecular forces.
export function particlePosition(particle, time, state) {
  const { x, y, z, seed } = checkedParticle(particle);
  finite(time, 'time');
  const { solid, liquid, gas, kineticScale } = checkedState(state);
  const angle = seed * 2 * Math.PI;
  const icePosition = {
    x: x + 0.045 * oscillation(time, 3 * kineticScale, angle),
    y: y + 0.045 * oscillation(time, 3.7 * kineticScale, angle + 1),
    z: z + 0.045 * oscillation(time, 4.1 * kineticScale, angle + 2)
  };
  const liquidPosition = {
    x: x + 1.1 * oscillation(time, 1.4 * kineticScale, angle),
    y: y + 0.7 * oscillation(time, 1.7 * kineticScale, angle + 1),
    z: z + 1.1 * oscillation(time, 1.2 * kineticScale, angle + 2)
  };
  const speed = 4 * kineticScale;
  const gasPosition = {
    x: reflected(x * 2.5, speed * Math.cos(angle), time),
    y: reflected(y * 2.5, speed * Math.sin(angle), time),
    z: reflected(z * 2.5, speed * Math.cos(angle + 1), time)
  };
  return {
    x: solid * icePosition.x + liquid * liquidPosition.x + gas * gasPosition.x,
    y: solid * icePosition.y + liquid * liquidPosition.y + gas * gasPosition.y,
    z: solid * icePosition.z + liquid * liquidPosition.z + gas * gasPosition.z
  };
}
