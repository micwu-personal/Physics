const test = require('node:test');
const assert = require('node:assert/strict');

require('../physics-core.js');
const core = globalThis.PhysicsCore;

test('branching fractions form complete distributions', () => {
  for (const [parent, entry] of Object.entries(core.DECAY_TABLE)) {
    assert.ok(Math.abs(core.branchingSum(entry) - 1) < 1e-12, `${parent} must sum to 1`);
  }
});

test('tau channels are exact charge conjugates', () => {
  const minus = core.DECAY_TABLE['τ⁻'].channels;
  const plus = core.DECAY_TABLE['τ⁺'].channels;
  assert.equal(minus.length, plus.length);
  minus.forEach((channel, index) => {
    assert.equal(channel.br, plus[index].br);
    assert.deepEqual(core.conjugateDaughters(channel.daughters), plus[index].daughters);
  });
});

test('decay sampling covers cumulative and rounding fallback paths', () => {
  const entry = core.DECAY_TABLE.Z;
  assert.equal(core.pickDecayChannel(entry, 0), entry.channels[0]);
  assert.equal(core.pickDecayChannel(entry, 0.15), entry.channels[3]);
  assert.equal(core.pickDecayChannel(entry, 2), entry.channels.at(-1));
});

test('conservation sums ignore unknown display placeholders', () => {
  assert.deepEqual(core.sumCharges(['p', 'e⁻', 'unknown']), {
    Q: 0, B: 1, Le: 1, Lmu: 0, Ltau: 0, S: 0,
  });
});

test('classification distinguishes weak, electromagnetic, strong, and forbidden examples', () => {
  for (const example of core.CONS_EXAMPLES) {
    assert.equal(
      core.classifyProcess(example.reactants, example.products).force,
      example.force,
      example.name
    );
  }
  assert.equal(core.classifyProcess(['π⁰'], ['γ', 'γ']).force, 'em');
  assert.equal(core.classifyProcess(['π⁺', 'π⁻'], ['π⁰', 'π⁰']).force, 'strong');
  assert.equal(core.classifyProcess(['e⁻', 'e⁺'], ['e⁻', 'e⁺']).force, 'em');
  assert.deepEqual(core.classifyProcess(['K⁺', 'K⁺'], ['π⁺', 'π⁺']).viol, ['S']);
});

test('annihilation photons are exactly back-to-back', () => {
  const [a, b] = core.photonPair(Math.PI / 3);
  assert.ok(Math.abs(a.vx + b.vx) < 1e-12);
  assert.ok(Math.abs(a.vy + b.vy) < 1e-12);
  assert.ok(Math.abs(Math.hypot(a.vx, a.vy) - 4) < 1e-12);
  assert.equal(Math.hypot(...Object.values(core.photonPair(0, 2)[0])), 2);
});

test('animation policy requires every lifecycle condition', () => {
  const base = {active:true, documentVisible:true, elementVisible:true, reducedMotion:false};
  assert.equal(core.shouldAnimate(base), true);
  for (const blocked of [
    {...base, active:false},
    {...base, documentVisible:false},
    {...base, elementVisible:false},
    {...base, reducedMotion:true},
  ]) assert.equal(core.shouldAnimate(blocked), false);
});

test('nucleon planner favors stable complete groupings over Delta baryons', () => {
  const helium = core.nucleonPlans(6, 6);
  assert.deepEqual(
    {
      protons: helium[0].protons,
      neutrons: helium[0].neutrons,
      deltaCount: helium[0].deltaCount,
      freeCount: helium[0].freeCount,
    },
    {protons: 2, neutrons: 2, deltaCount: 0, freeCount: 0}
  );
  assert.ok(helium.some(plan => plan.protons === 3 && plan.deltaMinus === 1));
});

test('nucleon planner covers proton, neutron, Delta, and invalid inputs', () => {
  assert.equal(core.nucleonPlans(2, 1)[0].protons, 1);
  assert.equal(core.nucleonPlans(1, 2)[0].neutrons, 1);
  assert.equal(core.nucleonPlans(3, 0)[0].deltaPlus, 1);
  assert.equal(core.nucleonPlans(12, 6)[0].protons, 6);
  assert.throws(() => core.nucleonPlans(-1, 2), RangeError);
  assert.throws(() => core.nucleonPlans(1.5, 2), RangeError);
});

test('key constants match the displayed scientific baseline', () => {
  assert.deepEqual(core.KEY_CONSTANTS, {
    electronMassMeV: 0.51099895,
    muonMassMeV: 105.6583755,
    tauMassMeV: 1776.93,
    wMassGeV: 80.3692,
    zMassGeV: 91.1880,
    higgsMassGeV: 125.20,
    neutronLifetimeSeconds: 878.4,
    deltaM21SquaredEv2: 7.42e-5,
    deltaM31SquaredEv2: 2.51e-3,
  });
});
