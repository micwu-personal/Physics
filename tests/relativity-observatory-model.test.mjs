import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  C, G, SOLAR_MASS, BODY_PRESETS, gamma, schwarzschildRadius, lapse,
  clockRatio, tidalAcceleration, minimumRadius, dopplerFactor,
  aberrateDirection, measuredPosition
} from '../physics/relativity-observatory-model.js';

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Number.isFinite(actual), `expected finite result, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} differs from ${expected}`);
}

function closeVector(actual, expected, tolerance = 1e-12) {
  for (const coordinate of ['x', 'y', 'z']) close(actual[coordinate], expected[coordinate], tolerance);
}

const invalidNumbers = [NaN, Infinity, -Infinity, undefined, null, '0', {}, true];

describe('constants and nonrotating teaching presets', () => {
  test('exports SI constants and the requested bilingual bodies', () => {
    assert.equal(C, 299_792_458);
    assert.equal(G, 6.67430e-11);
    assert.equal(SOLAR_MASS, 1.98847e30);
    assert.deepEqual(Object.keys(BODY_PRESETS), ['blackHole', 'neutronStar', 'whiteDwarf', 'sun']);
    for (const body of Object.values(BODY_PRESETS)) {
      assert.deepEqual(Object.keys(body), ['nameEn', 'nameZh', 'mass', 'radius', 'color']);
      assert.ok(body.nameEn.length > 0 && body.nameZh.length > 0);
      assert.match(body.color, /^#[\da-f]{6}$/i);
      assert.ok(body.mass > 0 && body.radius > 0);
      assert.ok(Object.isFrozen(body));
    }
    assert.ok(Object.isFrozen(BODY_PRESETS));
  });

  test('uses stellar surface radii and the black-hole horizon', () => {
    const { blackHole, neutronStar, whiteDwarf, sun } = BODY_PRESETS;
    assert.equal(blackHole.mass, 10 * SOLAR_MASS);
    assert.equal(blackHole.radius, schwarzschildRadius(blackHole.mass));
    assert.equal(neutronStar.mass, 1.4 * SOLAR_MASS);
    assert.equal(neutronStar.radius, 12_000);
    assert.equal(whiteDwarf.mass, 0.6 * SOLAR_MASS);
    assert.equal(whiteDwarf.radius, 7_000_000);
    assert.equal(sun.mass, SOLAR_MASS);
    assert.equal(sun.radius, 695_700_000);
    for (const body of [neutronStar, whiteDwarf, sun]) {
      assert.ok(body.radius > schwarzschildRadius(body.mass));
    }
    close(schwarzschildRadius(SOLAR_MASS), 2953.3393820668784);
  });

  test('keeps supported clocks outside both surface and horizon', () => {
    const { blackHole } = BODY_PRESETS;
    assert.equal(minimumRadius(blackHole), blackHole.radius * 1.05);
    for (const body of Object.values(BODY_PRESETS)) {
      const radius = minimumRadius(body);
      assert.ok(radius > body.radius);
      assert.ok(radius > schwarzschildRadius(body.mass));
      assert.ok(lapse(body.mass, radius) > 0);
      if (body !== blackHole) assert.equal(radius, body.radius * 1.001);
    }
    close(minimumRadius({ mass: 0, radius: 10 }), 10.01);
  });
});

describe('special relativity and simultaneous length measurements', () => {
  test('gamma at rest, 0.8c and 0.99c, with signed-velocity symmetry', () => {
    assert.equal(gamma(0), 1);
    close(gamma(0.8), 5 / 3);
    close(gamma(0.99), 7.088812050083354);
    for (const beta of [0, 0.1, 0.8, 0.99, 1 - Number.EPSILON]) {
      assert.equal(gamma(beta), gamma(-beta));
      assert.ok(gamma(beta) >= 1);
    }
  });

  test('contracts only longitudinal simultaneous positions without mutation', () => {
    const position = Object.freeze({ x: 4, y: -2, z: 10 });
    closeVector(measuredPosition(position, 0.8), { x: 4, y: -2, z: 6 });
    closeVector(measuredPosition(position, -0.8), { x: 4, y: -2, z: 6 });
    assert.deepEqual(measuredPosition(position, 0), position);
    assert.notEqual(measuredPosition(position, 0), position);
    close(measuredPosition(position, 0.99).z, 10 / 7.088812050083354);
  });

  test('Doppler ahead/back at 0.8c is 3 and 1/3 in the source-rest sky', () => {
    close(dopplerFactor(0.8, 1), 3);
    close(dopplerFactor(0.8, -1), 1 / 3);
    close(dopplerFactor(0.8, 0), 5 / 3);
    close(dopplerFactor(-0.8, 1), 1 / 3);
    close(dopplerFactor(-0.8, -1), 3);
    for (const cosine of [-1, -0.5, 0, 0.5, 1]) assert.equal(dopplerFactor(0, cosine), 1);
  });

  test('aberration bends transverse source directions forward and preserves the axis', () => {
    closeVector(aberrateDirection({ x: 1, y: 0, z: 0 }, 0.8), { x: 0.6, y: 0, z: 0.8 });
    closeVector(aberrateDirection({ x: 0, y: 1, z: 0 }, -0.8), { x: 0, y: 0.6, z: -0.8 });
    for (const beta of [-0.99, 0, 0.8, 0.99]) {
      closeVector(aberrateDirection({ x: 0, y: 0, z: 1 }, beta), { x: 0, y: 0, z: 1 });
      closeVector(aberrateDirection({ x: 0, y: 0, z: -1 }, beta), { x: 0, y: 0, z: -1 });
    }
  });

  test('normalizes nonzero directions without mutating or overflowing large vectors', () => {
    const direction = Object.freeze({ x: 3, y: 4, z: 0 });
    closeVector(aberrateDirection(direction, 0), { x: 0.6, y: 0.8, z: 0 });
    closeVector(aberrateDirection({ x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: 0 }, 0),
      { x: Math.SQRT1_2, y: Math.SQRT1_2, z: 0 });
    closeVector(aberrateDirection({ x: Number.MIN_VALUE, y: 0, z: 0 }, 0), { x: 1, y: 0, z: 0 });
  });

  test('deterministic angular grid has unit directions and inverse-boost round trips', () => {
    for (const beta of [-0.99, -0.8, -0.1, 0, 0.1, 0.8, 0.99]) {
      for (const theta of [0, Math.PI / 8, Math.PI / 2, 7 * Math.PI / 8, Math.PI]) {
        for (const phi of [0, Math.PI / 3, Math.PI, 3 * Math.PI / 2]) {
          const direction = {
            x: Math.sin(theta) * Math.cos(phi),
            y: Math.sin(theta) * Math.sin(phi),
            z: Math.cos(theta)
          };
          const observed = aberrateDirection(direction, beta);
          close(Math.hypot(observed.x, observed.y, observed.z), 1);
          closeVector(aberrateDirection(observed, -beta), direction);
          close(dopplerFactor(beta, direction.z) * dopplerFactor(-beta, observed.z), 1);
        }
      }
    }
  });
});

describe('supported gravitational clocks and redshift', () => {
  test('black-hole clock ratio from 2rs to 8rs is sqrt(0.5/0.875)', () => {
    const mass = BODY_PRESETS.blackHole.mass;
    const rs = schwarzschildRadius(mass);
    close(lapse(mass, 2 * rs), Math.sqrt(0.5));
    close(lapse(mass, 8 * rs), Math.sqrt(0.875));
    close(clockRatio(mass, 2 * rs, 8 * rs), Math.sqrt(0.5 / 0.875));
    assert.equal(clockRatio(mass, 2 * rs, 2 * rs), 1);
    close(clockRatio(mass, 2 * rs, 8 * rs) * clockRatio(mass, 8 * rs, 2 * rs), 1);
    assert.ok(clockRatio(mass, 8 * rs, 2 * rs) > 1);
  });

  test('solar weak-field clocks differ slightly, with the inner clock slower', () => {
    const { mass, radius } = BODY_PRESETS.sun;
    const rate = lapse(mass, radius);
    const ratio = clockRatio(mass, radius, 2 * radius);
    assert.ok(rate < ratio && ratio < 1);
    assert.ok(1 - ratio > 1e-7 && 1 - ratio < 1e-5);
    close(ratio, Math.sqrt((1 - schwarzschildRadius(mass) / radius)
      / (1 - schwarzschildRadius(mass) / (2 * radius))));
    assert.ok(lapse(mass, 1e12 * radius) > rate);
    assert.equal(lapse(0, radius), 1);
    assert.equal(clockRatio(0, radius, 2 * radius), 1);
  });

  test('compact-star surface clocks show stronger dilation than the Sun', () => {
    const surfaceRates = ['neutronStar', 'whiteDwarf', 'sun'].map(key => {
      const body = BODY_PRESETS[key];
      return lapse(body.mass, body.radius);
    });
    assert.ok(surfaceRates[0] > 0.8 && surfaceRates[0] < 0.82);
    assert.ok(surfaceRates[0] < surfaceRates[1] && surfaceRates[1] < surfaceRates[2]);
    assert.ok(surfaceRates[2] < 1);
  });

  test('rejects clocks on and inside the horizon at either endpoint', () => {
    const mass = BODY_PRESETS.blackHole.mass;
    const rs = schwarzschildRadius(mass);
    for (const radius of [rs, rs * 0.5, 0, -rs]) {
      assert.throws(() => lapse(mass, radius), RangeError);
      assert.throws(() => clockRatio(mass, radius, 8 * rs), RangeError);
      assert.throws(() => clockRatio(mass, 8 * rs, radius), RangeError);
    }
  });
});

describe('leading-order radial tides', () => {
  test('is inverse-cubic in radius and linear in mass and local separation', () => {
    const { mass, radius } = BODY_PRESETS.sun;
    const base = tidalAcceleration(mass, radius, 1);
    close(tidalAcceleration(mass, 2 * radius, 1) / base, 1 / 8);
    close(tidalAcceleration(mass, radius, 2) / base, 2);
    close(tidalAcceleration(2 * mass, radius, 1) / base, 2);
    assert.equal(tidalAcceleration(0, radius, 1), 0);
    assert.equal(tidalAcceleration(mass, radius, 0), 0);
  });

  test('one metre at the solar surface has about 0.789 micrometres/s^2 of radial tide', () => {
    const { mass, radius } = BODY_PRESETS.sun;
    const acceleration = tidalAcceleration(mass, radius, 1);
    assert.ok(Math.abs(acceleration - 0.789e-6) < 0.001e-6);
  });

  test('avoids overflowing radius-cubed intermediate calculations', () => {
    close(tidalAcceleration(1e300, 1e150, 1e150), 2 * G);
    assert.throws(() => tidalAcceleration(SOLAR_MASS, Number.MIN_VALUE, 1), RangeError);
  });
});

describe('finite guards and input domains', () => {
  test('rejects nonfinite or superluminal beta in every velocity helper', () => {
    for (const beta of [...invalidNumbers, -1, 1, -1.01, 1.01]) {
      assert.throws(() => gamma(beta), RangeError);
      assert.throws(() => dopplerFactor(beta, 0), RangeError);
      assert.throws(() => aberrateDirection({ x: 1, y: 0, z: 0 }, beta), RangeError);
      assert.throws(() => measuredPosition({ x: 1, y: 2, z: 3 }, beta), RangeError);
    }
  });

  test('rejects invalid mass, radius, separation, body and cosine without coercion', () => {
    for (const value of [...invalidNumbers, -1]) {
      assert.throws(() => schwarzschildRadius(value), RangeError);
      assert.throws(() => lapse(value, 1e9), RangeError);
      assert.throws(() => clockRatio(value, 1e9, 2e9), RangeError);
      assert.throws(() => tidalAcceleration(value, 1e9, 1), RangeError);
      assert.throws(() => tidalAcceleration(SOLAR_MASS, 1e9, value), RangeError);
      assert.throws(() => minimumRadius({ mass: value, radius: 1e9 }), RangeError);
    }
    for (const value of [...invalidNumbers, -1, 0]) {
      assert.throws(() => lapse(0, value), RangeError);
      assert.throws(() => clockRatio(0, value, 1), RangeError);
      assert.throws(() => clockRatio(0, 1, value), RangeError);
      assert.throws(() => tidalAcceleration(0, value, 1), RangeError);
      assert.throws(() => minimumRadius({ mass: 0, radius: value }), RangeError);
    }
    for (const value of [...invalidNumbers, -1.01, 1.01]) {
      assert.throws(() => dopplerFactor(0.8, value), RangeError);
    }
    for (const body of [null, undefined, 'sun']) assert.throws(() => minimumRadius(body), TypeError);
    assert.throws(() => minimumRadius({ mass: 0, radius: Number.MAX_VALUE }), RangeError);
    assert.equal(schwarzschildRadius(0), 0);
    assert.ok(Number.isFinite(schwarzschildRadius(Number.MAX_VALUE)));
  });

  test('rejects zero sky vectors and malformed/nonfinite coordinates', () => {
    assert.throws(() => aberrateDirection({ x: 0, y: 0, z: 0 }, 0.8), RangeError);
    for (const value of [null, undefined, 'direction']) {
      assert.throws(() => aberrateDirection(value, 0.8), TypeError);
      assert.throws(() => measuredPosition(value, 0.8), TypeError);
    }
    for (const coordinate of ['x', 'y', 'z']) {
      for (const value of invalidNumbers) {
        const input = { x: 1, y: 2, z: 3, [coordinate]: value };
        assert.throws(() => aberrateDirection(input, 0.8), RangeError);
        assert.throws(() => measuredPosition(input, 0.8), RangeError);
      }
    }
    assert.throws(() => aberrateDirection({}, 0.8), RangeError);
    assert.throws(() => measuredPosition({}, 0.8), RangeError);
  });
});
