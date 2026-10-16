// SI units; nonrotating spherical teaching bodies. Stellar clocks must remain
// outside the surface (use minimumRadius); this is not an interior-star model.
export const C = 299_792_458;
export const G = 6.67430e-11;
export const SOLAR_MASS = 1.98847e30;

function finite(value, name) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`);
  return value;
}

function nonnegative(value, name) {
  finite(value, name);
  if (value < 0) throw new RangeError(`${name} must be nonnegative`);
  return value;
}

function positive(value, name) {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be positive`);
  return value;
}

function vector(value, name) {
  if (value === null || typeof value !== 'object') {
    throw new TypeError(`${name} must be an { x, y, z } vector`);
  }
  const { x, y, z } = value;
  finite(x, `${name}.x`);
  finite(y, `${name}.y`);
  finite(z, `${name}.z`);
  return { x, y, z };
}

// Signed beta = observer velocity / c. Stationary coordinate time / ship proper time.
export function gamma(beta) {
  finite(beta, 'beta');
  if (Math.abs(beta) >= 1) throw new RangeError('beta must satisfy |beta| < 1');
  return 1 / Math.sqrt((1 - beta) * (1 + beta));
}

export function schwarzschildRadius(mass) {
  nonnegative(mass, 'mass');
  return (2 * G / (C * C)) * mass;
}

// Colors are schematic category tints, not measured spectra or surface colors.
export const BODY_PRESETS = Object.freeze({
  blackHole: Object.freeze({
    nameEn: 'Black hole', nameZh: '黑洞',
    mass: 10 * SOLAR_MASS, radius: schwarzschildRadius(10 * SOLAR_MASS), color: '#7c5cff'
  }),
  neutronStar: Object.freeze({
    nameEn: 'Neutron star', nameZh: '中子星',
    mass: 1.4 * SOLAR_MASS, radius: 12_000, color: '#00d4ff'
  }),
  whiteDwarf: Object.freeze({
    nameEn: 'White dwarf', nameZh: '白矮星',
    mass: 0.6 * SOLAR_MASS, radius: 7_000_000, color: '#e8ecff'
  }),
  sun: Object.freeze({
    nameEn: 'Sun (normal star)', nameZh: '太阳（普通恒星）',
    mass: SOLAR_MASS, radius: 695_700_000, color: '#ffd166'
  })
});

// Static supported clock d(proper time)/d(Schwarzschild time at infinity).
// Radius is areal radius, strictly outside the horizon.
export function lapse(mass, radius) {
  positive(radius, 'radius');
  const horizon = schwarzschildRadius(mass);
  if (radius <= horizon) throw new RangeError('radius must be outside the Schwarzschild horizon');
  return Math.sqrt((radius - horizon) / radius);
}

// Emitter clock rate / observer clock rate, also received / emitted frequency.
// Both clocks are supported and stationary; no relative-motion Doppler is included.
export function clockRatio(mass, emitterRadius, observerRadius) {
  return lapse(mass, emitterRadius) / lapse(mass, observerRadius);
}

// Local radial differential acceleration magnitude, 2GM * separation / radius^3.
// Leading order requires separation << radius; this is acceleration, not force.
export function tidalAcceleration(mass, radius, separation) {
  nonnegative(mass, 'mass');
  positive(radius, 'radius');
  nonnegative(separation, 'separation');
  if (mass === 0 || separation === 0) return 0;
  return finite((2 * G * mass / radius) * (separation / radius) / radius, 'tidal acceleration');
}

export function minimumRadius(body) {
  if (body === null || typeof body !== 'object') throw new TypeError('body must have mass and radius');
  positive(body.radius, 'body.radius');
  return finite(Math.max(body.radius * 1.001, schwarzschildRadius(body.mass) * 1.05), 'minimum radius');
}

// Source-sky angle in the stationary source-rest frame, not photon propagation
// or the aberrated moving-frame angle. Ahead (+z) means cosTheta = +1: blueshift.
export function dopplerFactor(beta, cosTheta) {
  const boost = gamma(beta);
  finite(cosTheta, 'cosTheta');
  if (Math.abs(cosTheta) > 1) throw new RangeError('cosTheta must be between -1 and 1');
  return boost * (1 + beta * cosTheta);
}

// Source-sky direction (opposite photon propagation), boosted along world +z.
// Accepts a finite nonzero {x,y,z}, normalizes it, and returns the moving sky unit vector.
export function aberrateDirection(direction, beta) {
  const boost = gamma(beta);
  const { x, y, z } = vector(direction, 'direction');
  const scale = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
  if (scale === 0) throw new RangeError('direction must be nonzero');
  const length = Math.hypot(x / scale, y / scale, z / scale);
  const nx = x / scale / length;
  const ny = y / scale / length;
  const nz = z / scale / length;
  const denominator = 1 + beta * nz;
  return {
    x: nx / (boost * denominator),
    y: ny / (boost * denominator),
    z: (nz + beta) / denominator
  };
}

// Simultaneous ship-frame coordinates of stationary rest positions: z/gamma.
// Transverse coordinates are unchanged; not a photograph or retarded-light image.
export function measuredPosition(position, beta) {
  const boost = gamma(beta);
  const { x, y, z } = vector(position, 'position');
  return { x, y, z: z / boost };
}
