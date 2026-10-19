import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  WATER_MASS, MAX_HEAT, WATER_PROPERTIES, WATER_LIMITS,
  BUOYANCY_PROPERTIES, BUOYANCY_PRESETS, MAX_PARTICLE_COUNT,
  clamp, waterState, buoyancy, makeParticles, particlePosition
} from '../physics/game-model.js';

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Number.isFinite(actual), `expected finite result, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} differs from ${expected}`);
}

function closePosition(actual, expected, tolerance = 1e-12) {
  assert.deepEqual(Object.keys(actual), ['x', 'y', 'z']);
  for (const axis of ['x', 'y', 'z']) close(actual[axis], expected[axis], tolerance);
}

function retainedHeat(state) {
  const { cIce, cWater, cSteam, Lfusion, Lvaporization } = WATER_PROPERTIES;
  const iceAtZero = cIce * 20;
  const iceHeat = cIce * (state.temperature + 20);
  const liquidHeat = iceAtZero + Lfusion + cWater * state.temperature;
  const gasHeat = iceAtZero + Lfusion + cWater * 100 + Lvaporization + cSteam * (state.temperature - 100);
  return WATER_MASS * (state.solid * iceHeat + state.liquid * liquidHeat + state.gas * gasHeat);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

const invalidNumbers = [NaN, Infinity, -Infinity, undefined, null, '0', {}, true, 1n];
const boundaries = [0.42, 3.76, 7.94, 30.5];

describe('teaching constants and clamp', () => {
  test('exports fixed mass, units, approximate material data, and cumulative heat limits', () => {
    assert.equal(WATER_MASS, 0.01);
    assert.equal(MAX_HEAT, 32);
    assert.deepEqual(WATER_PROPERTIES, {
      pressureAtm: 1, initialTemperature: -20, meltingTemperature: 0, boilingTemperature: 100,
      cIce: 2.1, cWater: 4.18, cSteam: 2, Lfusion: 334, Lvaporization: 2256
    });
    assert.deepEqual(WATER_LIMITS, {
      meltingStart: 0.42, meltingEnd: 3.76, boilingStart: 7.94, boilingEnd: 30.5
    });
    const { meltingStart, meltingEnd, boilingStart, boilingEnd } = WATER_LIMITS;
    close(meltingStart, WATER_MASS * WATER_PROPERTIES.cIce * 20);
    close(meltingEnd - meltingStart, WATER_MASS * WATER_PROPERTIES.Lfusion);
    close(boilingStart - meltingEnd, WATER_MASS * WATER_PROPERTIES.cWater * 100);
    close(boilingEnd - boilingStart, WATER_MASS * WATER_PROPERTIES.Lvaporization);
    assert.equal(MAX_PARTICLE_COUNT, 4096);
    for (const value of [WATER_PROPERTIES, WATER_LIMITS, BUOYANCY_PROPERTIES, BUOYANCY_PRESETS]) {
      assert.ok(Object.isFrozen(value));
      assert.throws(() => { value.extra = 1; }, TypeError);
    }
  });

  test('clamps values, keeps endpoints, and leaves nonnumeric validation to callers', () => {
    for (const [value, expected] of [[-10, 0], [0, 0], [0.5, 0.5], [1, 1], [10, 1]]) {
      assert.equal(clamp(value, 0, 1), expected);
    }
    assert.equal(clamp(-Infinity, -2, 2), -2);
    assert.equal(clamp(Infinity, -2, 2), 2);
    assert.equal(clamp(3, 4, 4), 4);
    assert.equal(clamp(-0, 0, 1), 0);
    assert.ok(Number.isNaN(clamp(NaN, 0, 1)));
  });
});

describe('water sensible heat and latent plateaus', () => {
  test('selects the stage starting at each exact boundary with continuous mass fractions', () => {
    const cases = [
      [0, -20, 'ice', 1, 0, 0],
      [0.42, 0, 'melting', 1, 0, 0],
      [3.76, 0, 'liquid', 0, 1, 0],
      [7.94, 100, 'boiling', 0, 1, 0],
      [30.5, 100, 'steam', 0, 0, 1],
      [32, 175, 'steam', 0, 0, 1]
    ];
    for (const [heat, temperature, phase, solid, liquid, gas] of cases) {
      const state = waterState(heat);
      assert.deepEqual(Object.keys(state), ['heat', 'temperature', 'phase', 'solid', 'liquid', 'gas', 'kineticScale']);
      assert.deepEqual(state, {
        heat, temperature, phase, solid, liquid, gas,
        kineticScale: Math.sqrt((temperature + 273.15) / 273.15)
      });
      close(retainedHeat(state), heat);
    }
  });

  test('uses each phase-specific heat capacity for sensible heating, including superheated steam', () => {
    for (const [heat, temperature, phase] of [
      [0.21, -10, 'ice'], [3.76 + 0.01 * 4.18 * 50, 50, 'liquid'],
      [30.5 + 0.01 * 2 * 25, 125, 'steam']
    ]) {
      const state = waterState(heat);
      close(state.temperature, temperature);
      assert.equal(state.phase, phase);
    }
    for (const [first, second, specificHeat] of [[0, 0.21, 2.1], [4, 7, 4.18], [30.5, 32, 2]]) {
      const a = waterState(first);
      const b = waterState(second);
      close((b.heat - a.heat) / (b.temperature - a.temperature), WATER_MASS * specificHeat);
    }
    assert.ok(waterState(32).temperature > 100);
    assert.equal(waterState(32).gas, 1);
  });

  test('spends fusion energy on liquid mass at zero Celsius, not on temperature', () => {
    for (const fraction of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const heat = 0.42 + fraction * 0.01 * 334;
      const state = waterState(heat);
      close(state.solid, 1 - fraction);
      close(state.liquid, fraction);
      assert.equal(state.gas, 0);
      assert.equal(state.temperature, 0);
      assert.equal(state.kineticScale, 1);
      close(retainedHeat(state), heat);
    }
    const a = waterState(1);
    const b = waterState(3);
    close((b.liquid - a.liquid) * WATER_MASS * WATER_PROPERTIES.Lfusion, b.heat - a.heat);
    close(waterState(2.09).liquid, 0.5);
    assert.equal(waterState(2.09).phase, 'melting');
  });

  test('spends vaporization energy on gas mass at 100 Celsius, not on hotter liquid', () => {
    for (const fraction of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const heat = 7.94 + fraction * 0.01 * 2256;
      const state = waterState(heat);
      assert.equal(state.solid, 0);
      close(state.liquid, 1 - fraction);
      close(state.gas, fraction);
      assert.equal(state.temperature, 100);
      assert.equal(state.kineticScale, Math.sqrt(373.15 / 273.15));
      close(retainedHeat(state), heat);
    }
    const a = waterState(10);
    const b = waterState(20);
    close((b.gas - a.gas) * WATER_MASS * WATER_PROPERTIES.Lvaporization, b.heat - a.heat);
    close(waterState(19.22).gas, 0.5);
    assert.equal(waterState(19.22).phase, 'boiling');
  });

  test('accounts for every kJ and conserves mass throughout a dense heat sweep', () => {
    let previousTemperature = -20;
    let previousSolid = 1;
    let previousGas = 0;
    for (let step = 0; step <= 3200; step += 1) {
      const heat = step / 100;
      const state = waterState(heat);
      assert.equal(state.heat, heat);
      close(retainedHeat(state), heat);
      assert.equal(state.solid + state.liquid + state.gas, 1);
      for (const fraction of [state.solid, state.liquid, state.gas]) {
        assert.ok(fraction >= 0 && fraction <= 1);
      }
      assert.ok(state.temperature >= previousTemperature);
      assert.ok(state.solid <= previousSolid);
      assert.ok(state.gas >= previousGas);
      close(state.kineticScale ** 2, (state.temperature + 273.15) / 273.15);
      previousTemperature = state.temperature;
      previousSolid = state.solid;
      previousGas = state.gas;
    }
  });

  test('has no discontinuity or energy jump immediately around each transition', () => {
    const phases = [['ice', 'melting'], ['melting', 'liquid'], ['liquid', 'boiling'], ['boiling', 'steam']];
    for (const [index, heat] of boundaries.entries()) {
      const a = waterState(heat - 1e-9);
      const b = waterState(heat + 1e-9);
      assert.equal(a.phase, phases[index][0]);
      assert.equal(b.phase, phases[index][1]);
      close(b.temperature, a.temperature, 1e-7);
      close(b.solid, a.solid, 1e-8);
      close(b.liquid, a.liquid, 1e-8);
      close(b.gas, a.gas, 1e-8);
      close(retainedHeat(a), a.heat);
      close(retainedHeat(b), b.heat);
      close(retainedHeat(b) - retainedHeat(a), b.heat - a.heat);
    }
  });

  test('is reversible as a state function and keeps latent heating distinct from thermal speed', () => {
    const heats = [0, 0.21, 0.42, 2.09, 3.76, 4, 7.94, 19.22, 30.5, 31, 32];
    const forward = heats.map(waterState);
    const backward = [...heats].reverse().map(waterState).reverse();
    assert.deepEqual(backward, forward);
    for (const state of forward) {
      const inverse = waterState(retainedHeat(state));
      assert.equal(inverse.phase, state.phase);
      for (const key of ['heat', 'temperature', 'solid', 'liquid', 'gas', 'kineticScale']) {
        close(inverse[key], state[key]);
      }
    }
    assert.equal(waterState(0.42).kineticScale, waterState(3.76).kineticScale);
    assert.equal(waterState(7.94).kineticScale, waterState(30.5).kineticScale);
    assert.ok(waterState(0).kineticScale < 1);
    assert.ok(waterState(32).kineticScale > waterState(30.5).kineticScale);
  });

  test('clips finite heat outside the teaching range without allowing nonfinite inputs', () => {
    for (const heat of [-Number.MAX_VALUE, -1, -0, 0]) assert.deepEqual(waterState(heat), waterState(0));
    for (const heat of [MAX_HEAT, MAX_HEAT + 1, Number.MAX_VALUE]) {
      assert.deepEqual(waterState(heat), waterState(MAX_HEAT));
    }
    for (const heat of invalidNumbers) assert.throws(() => waterState(heat), RangeError);
  });
});

describe('one-litre buoyancy sample', () => {
  test('exports densities and SI fluid-statics assumptions independently of the water heat sample', () => {
    assert.deepEqual(BUOYANCY_PROPERTIES, { volume: 0.001, waterDensity: 1000, gravity: 9.81 });
    assert.deepEqual(BUOYANCY_PRESETS, { wood: 650, neutral: 1000, steel: 7800 });
    assert.equal(buoyancy(1000).mass, 1);
    assert.notEqual(buoyancy(1000).mass, WATER_MASS);
  });

  test('wood floats with 65 percent submerged while positive full-immersion force makes it rise', () => {
    const state = buoyancy(BUOYANCY_PRESETS.wood);
    assert.deepEqual(Object.keys(state), ['mass', 'weight', 'maxBuoyancy', 'submergedFraction', 'floating', 'netForce']);
    close(state.mass, 0.65);
    close(state.weight, 6.3765);
    close(state.maxBuoyancy, 9.81);
    close(state.submergedFraction, 0.65);
    assert.equal(state.floating, true);
    close(state.netForce, 3.4335);
    close(state.maxBuoyancy * state.submergedFraction - state.weight, 0);
  });

  test('equal density is neutral at full immersion and steel cannot reach a floating equilibrium', () => {
    assert.deepEqual(buoyancy(BUOYANCY_PRESETS.neutral), {
      mass: 1, weight: 9.81, maxBuoyancy: 9.81, submergedFraction: 1, floating: true, netForce: 0
    });
    const steel = buoyancy(BUOYANCY_PRESETS.steel);
    close(steel.mass, 7.8);
    close(steel.weight, 76.518);
    assert.equal(steel.maxBuoyancy, 9.81);
    assert.equal(steel.submergedFraction, 1);
    assert.equal(steel.floating, false);
    close(steel.netForce, -66.708);
    assert.ok(buoyancy(999.999).floating);
    assert.equal(buoyancy(1000.001).floating, false);
  });

  test('weight is linear in density, maximum displacement is fixed, and force uses an upward sign', () => {
    const a = buoyancy(100);
    const b = buoyancy(200);
    assert.equal(b.mass, 2 * a.mass);
    assert.equal(b.weight, 2 * a.weight);
    assert.equal(b.submergedFraction, 2 * a.submergedFraction);
    assert.equal(a.maxBuoyancy, b.maxBuoyancy);
    for (const density of [1, 650, 1000, 7800, 20_000]) {
      const state = buoyancy(density);
      close(state.netForce, state.maxBuoyancy - state.weight);
      assert.equal(state.submergedFraction, Math.min(1, density / 1000));
      assert.equal(state.floating, density <= 1000);
    }
  });

  test('accepts all finite positive densities without overflow and rejects invalid densities', () => {
    for (const density of [Number.MIN_VALUE, 1e-200, 0.001, 650, 1000, 7800, 1e200, Number.MAX_VALUE]) {
      const state = buoyancy(density);
      for (const key of ['mass', 'weight', 'maxBuoyancy', 'submergedFraction', 'netForce']) {
        assert.ok(Number.isFinite(state[key]));
      }
      assert.equal(state.mass, density * 0.001);
      assert.ok(state.submergedFraction >= 0 && state.submergedFraction <= 1);
    }
    for (const density of [...invalidNumbers, 0, -0, -1, -Number.MAX_VALUE]) {
      assert.throws(() => buoyancy(density), RangeError);
    }
  });
});

describe('deterministic magnified phase illustrations', () => {
  test('makes the default 54 markers and general counts as a bounded lattice with unique seeds', () => {
    assert.deepEqual(makeParticles(), makeParticles(54));
    assert.deepEqual(makeParticles(0), []);
    assert.deepEqual(makeParticles(1), [{ x: 0, y: 0, z: 0, seed: 0.6180339887498949 }]);
    for (const count of [1, 2, 8, 27, 54, 65, 125, MAX_PARTICLE_COUNT]) {
      const particles = makeParticles(count);
      assert.equal(particles.length, count);
      assert.deepEqual(particles, makeParticles(count));
      assert.equal(new Set(particles.map(p => `${p.x},${p.y},${p.z}`)).size, count);
      assert.equal(new Set(particles.map(p => p.seed)).size, count);
      const side = Math.ceil(Math.cbrt(count));
      for (const particle of particles) {
        assert.deepEqual(Object.keys(particle), ['x', 'y', 'z', 'seed']);
        for (const axis of ['x', 'y', 'z']) {
          assert.ok(Number.isFinite(particle[axis]));
          assert.ok(Math.abs(particle[axis]) <= 2.2);
          if (side > 1) {
            const latticeIndex = (particle[axis] / 4.4 + 0.5) * (side - 1);
            close(latticeIndex, Math.round(latticeIndex));
          }
        }
        assert.ok(particle.seed >= 0 && particle.seed < 1);
      }
    }
    const first = makeParticles();
    first[0].x = 100;
    assert.notEqual(first[0].x, makeParticles()[0].x);
  });

  test('rejects noninteger, negative, nonfinite, and unsupported marker counts', () => {
    for (const count of [...invalidNumbers.filter(value => value !== undefined), -1, 0.5,
      MAX_PARTICLE_COUNT + 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => makeParticles(count), RangeError);
    }
    assert.equal(makeParticles(undefined).length, 54);
  });

  test('positions are pure and distinct across the requested phases and times', () => {
    const particle = Object.freeze(makeParticles()[5]);
    const positions = [];
    for (const heat of [0, 4, 31]) {
      const state = Object.freeze(waterState(heat));
      for (const time of [0, 1]) {
        const position = particlePosition(particle, time, state);
        closePosition(position, particlePosition(particle, time, state));
        assert.notEqual(position, particlePosition(particle, time, state));
        positions.push(position);
      }
      assert.deepEqual(state, waterState(heat));
    }
    assert.equal(new Set(positions.map(position => JSON.stringify(position))).size, 6);
    assert.deepEqual(particle, makeParticles()[5]);
  });

  test('solid markers stay near lattice sites while liquid neighbors can exchange local order', () => {
    const particles = makeParticles();
    const ice = waterState(0);
    const liquid = waterState(4);
    let exchanged = false;
    const [left, right] = particles;
    assert.ok(left.x < right.x);
    assert.equal(left.y, right.y);
    assert.equal(left.z, right.z);
    for (let step = 0; step <= 120; step += 1) {
      const time = step / 10;
      for (const particle of particles) {
        const solidPosition = particlePosition(particle, time, ice);
        const liquidPosition = particlePosition(particle, time, liquid);
        for (const axis of ['x', 'y', 'z']) {
          assert.ok(Math.abs(solidPosition[axis] - particle[axis]) <= 0.045 + 1e-12);
        }
        assert.ok(Math.abs(liquidPosition.x - particle.x) <= 1.1 + 1e-12);
        assert.ok(Math.abs(liquidPosition.y - particle.y) <= 0.7 + 1e-12);
        assert.ok(Math.abs(liquidPosition.z - particle.z) <= 1.1 + 1e-12);
      }
      assert.ok(particlePosition(left, time, ice).x < particlePosition(right, time, ice).x);
      if (particlePosition(left, time, liquid).x > particlePosition(right, time, liquid).x) exchanged = true;
    }
    assert.equal(exchanged, true);
  });

  test('gas has a substantially larger footprint and faster paths than liquid or solid', () => {
    const particles = makeParticles();
    const states = [0, 4, 31].map(waterState);
    const footprints = states.map(state => Math.sqrt(particles.reduce((sum, particle) => {
      const p = particlePosition(particle, 0, state);
      return sum + p.x ** 2 + p.y ** 2 + p.z ** 2;
    }, 0) / particles.length));
    const movements = states.map(state => particles.reduce((sum, particle) => sum
      + distance(particlePosition(particle, 0, state), particlePosition(particle, 0.01, state)), 0) / particles.length);
    assert.ok(footprints[2] > footprints[1] * 1.75);
    assert.ok(footprints[2] > footprints[0] * 2);
    assert.ok(movements[1] > movements[0] * 3);
    assert.ok(movements[2] > movements[1] * 2);
  });

  test('gas follows straight paths between reflections, reverses at walls, and supports signed time', () => {
    const particle = { x: 0, y: 0.2, z: 0, seed: 0 };
    const state = waterState(30.5);
    const speed = 4 * state.kineticScale;
    for (const time of [-0.5, 0, 0.25, 0.5]) {
      const position = particlePosition(particle, time, state);
      close(position.x, speed * time);
      close(position.y, 0.5);
    }
    const wallTime = 8 / speed;
    close(particlePosition(particle, wallTime, state).x, 8);
    close(particlePosition(particle, 3 * wallTime, state).x, -8);
    close(particlePosition(particle, 4 * wallTime, state).x, 0);
    close(particlePosition(particle, wallTime - 0.01, state).x,
      particlePosition(particle, wallTime + 0.01, state).x);
    const period = 32 / speed;
    close(particlePosition(particle, 0.3 + period, state).x, particlePosition(particle, 0.3, state).x);
  });

  test('interpolates phase fractions on both latent plateaus without a visual jump', () => {
    for (const [start, middle, end] of [[0.42, 2.09, 3.76], [7.94, 19.22, 30.5]]) {
      for (const particle of makeParticles(8)) {
        for (const time of [0, 1, 100]) {
          const a = particlePosition(particle, time, waterState(start));
          const b = particlePosition(particle, time, waterState(end));
          closePosition(particlePosition(particle, time, waterState(middle)), {
            x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2
          });
        }
      }
    }
    for (const heat of boundaries) {
      for (const particle of makeParticles(8)) {
        for (const time of [0, 1, 123.45]) {
          closePosition(particlePosition(particle, time, waterState(heat - 1e-9)),
            particlePosition(particle, time, waterState(heat + 1e-9)), 1e-6);
        }
      }
    }
  });

  test('remains finite and bounded at every heat, time zero, and extreme finite timestamps', () => {
    const particles = [...makeParticles(8), { x: 2.2, y: -2.2, z: 0, seed: 0 },
      { x: 0, y: 0, z: 0, seed: 1 - Number.EPSILON }];
    const times = [-Number.MAX_VALUE, -1e100, -1000, -1, -0, 0, Number.MIN_VALUE, 1, 1000, 1e100, Number.MAX_VALUE];
    const heats = [-100, 0, 0.21, ...boundaries, 2.09, 4, 19.22, 31, 32, 100];
    for (let heat = 0; heat <= MAX_HEAT; heat += 0.25) heats.push(heat);
    for (const heat of heats) {
      const state = waterState(heat);
      for (const particle of particles) {
        for (const time of times) {
          const position = particlePosition(particle, time, state);
          for (const axis of ['x', 'y', 'z']) {
            assert.ok(Number.isFinite(position[axis]));
            assert.ok(Math.abs(position[axis]) <= 8 + 1e-12);
          }
          assert.deepEqual(position, particlePosition(particle, time, state));
        }
      }
    }
    for (const particle of makeParticles(MAX_PARTICLE_COUNT)) {
      for (const heat of [0, 4, 31]) closePosition(particlePosition(particle, 0, waterState(heat)),
        particlePosition(particle, 0, waterState(heat)));
    }
  });

  test('rejects malformed particles, out-of-domain coordinates and seeds, and nonfinite time', () => {
    const particle = makeParticles()[0];
    const state = waterState(4);
    for (const input of [null, undefined, 1, 'particle', true, () => {}, {}, []]) {
      assert.throws(() => particlePosition(input, 0, state), RangeError);
    }
    for (const key of ['x', 'y', 'z', 'seed']) {
      for (const value of invalidNumbers) {
        assert.throws(() => particlePosition({ ...particle, [key]: value }, 0, state), RangeError);
      }
    }
    for (const axis of ['x', 'y', 'z']) {
      for (const value of [-2.2001, 2.2001, Number.MAX_VALUE]) {
        assert.throws(() => particlePosition({ ...particle, [axis]: value }, 0, state), RangeError);
      }
    }
    for (const seed of [-1, 1, 2]) {
      assert.throws(() => particlePosition({ ...particle, seed }, 0, state), RangeError);
    }
    for (const time of invalidNumbers) assert.throws(() => particlePosition(particle, time, state), RangeError);
  });

  test('requires a complete, consistent waterState result rather than impossible phase inputs', () => {
    const particle = makeParticles()[0];
    const state = waterState(4);
    for (const input of [null, undefined, 1, 'state', true, () => {}, {}, []]) {
      assert.throws(() => particlePosition(particle, 0, input), RangeError);
    }
    for (const heat of invalidNumbers) {
      assert.throws(() => particlePosition(particle, 0, { ...state, heat }), RangeError);
    }
    for (const heat of [-1, 33]) {
      assert.throws(() => particlePosition(particle, 0, { ...state, heat }), RangeError);
    }
    for (const key of ['temperature', 'phase', 'solid', 'liquid', 'gas', 'kineticScale']) {
      for (const value of invalidNumbers) {
        assert.throws(() => particlePosition(particle, 0, { ...state, [key]: value }), RangeError);
      }
      const altered = { ...state, [key]: key === 'phase' ? 'ice' : state[key] + 0.01 };
      assert.throws(() => particlePosition(particle, 0, altered), RangeError);
      const missing = { ...state };
      delete missing[key];
      assert.throws(() => particlePosition(particle, 0, missing), RangeError);
    }
    const copy = JSON.parse(JSON.stringify(state));
    closePosition(particlePosition(particle, 1, copy), particlePosition(particle, 1, state));
  });
});
