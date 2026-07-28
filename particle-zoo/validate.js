#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname;
require('./physics-core.js');
require('./references.js');
const core = globalThis.PhysicsCore;
const refs = globalThis.ParticleZooReferences;

const i18nSource = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const context = {globalThis:{}};
vm.runInNewContext(
  `${i18nSource}\nglobalThis.data={LOCALES,PARTICLES_I18N,PARTICLE_VALUES_I18N};`,
  context,
  {filename:'i18n.js'}
);
const {LOCALES, PARTICLES_I18N, PARTICLE_VALUES_I18N} = context.globalThis.data;
assert.deepEqual(Object.keys(LOCALES.en).sort(), Object.keys(LOCALES['zh-CN']).sort(), 'locale keys must match');
assert.deepEqual(Object.keys(PARTICLES_I18N['zh-CN']).sort(), refs.particleIds.slice().sort(), 'all particles need Chinese content');
assert.deepEqual(Object.keys(PARTICLE_VALUES_I18N['zh-CN']).sort(), refs.particleIds.slice().sort(), 'all particle values need Chinese localization');

for (const [parent, entry] of Object.entries(core.DECAY_TABLE)) {
  assert.ok(Math.abs(core.branchingSum(entry)-1)<1e-12, `${parent} branching sum`);
  assert.ok(refs.CONTENT_REFERENCES.decay[parent], `${parent} decay citation`);
}
const tauMinus=core.DECAY_TABLE['τ⁻'].channels;
const tauPlus=core.DECAY_TABLE['τ⁺'].channels;
assert.equal(tauMinus.length,tauPlus.length);
tauMinus.forEach((channel,index)=>{
  assert.equal(channel.br,tauPlus[index].br);
  assert.deepEqual(core.conjugateDaughters(channel.daughters),tauPlus[index].daughters);
});
for (const example of core.CONS_EXAMPLES) {
  assert.equal(core.classifyProcess(example.reactants,example.products).force,example.force,example.name);
}
assert.equal(core.classifyProcess(['π⁰'],['γ','γ']).force,'em');

const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const indexSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const required of [
  "mass:'80.369 GeV/c²'", "mass:'91.188 GeV/c²'", "mass:'125.20 GeV/c²'",
  'th12: 33.4 * Math.PI/180', 'dm21: 7.42e-5', 'dm31: 2.51e-3',
  'PhysicsCore.photonPair', 'syncAnimationLoops', 'IntersectionObserver',
]) assert.ok(appSource.includes(required), `app source must include ${required}`);

const sorted = values => [...new Set(values)].sort();
const matches = (source, regex) => [...source.matchAll(regex)].map(match=>match[1]);
const particleBlock = appSource.slice(appSource.indexOf('const PARTICLES = {'), appSource.indexOf('/* Composite / example particles */'));
assert.deepEqual(
  sorted(matches(particleBlock,/^\s{2}([a-z][a-z0-9_]*):\s*\{/gm)),
  refs.particleIds.slice().sort(),
  'particle citation metadata must match particle records'
);
assert.deepEqual(
  sorted(matches(appSource,/\{\s*id:'([^']+)',\s*group:'(?:common|exchange|rare)'/g)),
  Object.keys(refs.CONTENT_REFERENCES.interaction).sort(),
  'interaction citation metadata must match every diagram/equation'
);
assert.deepEqual(
  sorted(matches(indexSource,/data-i18n="bsm\.([^.]+)\.h"/g)),
  Object.keys(refs.CONTENT_REFERENCES.bsm).sort(),
  'BSM citation metadata must match every card'
);
assert.deepEqual(
  sorted(matches(indexSource,/data-i18n="phen\.([^.]+)\.h"/g)),
  Object.keys(refs.CONTENT_REFERENCES.phenomenon).sort(),
  'phenomenon citation metadata must match every card'
);
assert.deepEqual(
  sorted(matches(indexSource,/data-i18n="lab\.([^.]+)\.h"/g).filter(id=>id!=='xlink')),
  Object.keys(refs.CONTENT_REFERENCES.lab).sort(),
  'lab citation metadata must match every scientific demo'
);

const allReferenceGroups=[
  refs.CONTENT_REFERENCES.particle,refs.CONTENT_REFERENCES.force,refs.CONTENT_REFERENCES.interaction,
  refs.CONTENT_REFERENCES.decay,refs.CONTENT_REFERENCES.lab,refs.CONTENT_REFERENCES.bsm,
  refs.CONTENT_REFERENCES.phenomenon,refs.CONTENT_REFERENCES.section,
];
for (const group of allReferenceGroups) {
  for (const ids of Object.values(group)) {
    assert.ok(ids.length>0);
    ids.forEach(id=>{
      assert.ok(refs.SOURCES[id], `missing source ${id}`);
      assert.match(refs.SOURCES[id].url,/^https:\/\//);
      assert.doesNotMatch(refs.SOURCES[id].url,/wikipedia/i);
    });
  }
}

const mobileIndex=fs.readFileSync(path.join(root,'mobile','index.html'),'utf8');
const mobilePortable=fs.readFileSync(path.join(root,'mobile','particle-zoo.html'),'utf8');
assert.equal(mobileIndex,mobilePortable,'mobile bundles must be byte-identical');
for (const marker of ['globalThis.PhysicsCore','globalThis.ParticleZooReferences','rel="noopener noreferrer"']) {
  assert.ok(mobileIndex.includes(marker),`mobile bundle missing ${marker}`);
}
for (const source of Object.values(refs.SOURCES)) assert.ok(mobileIndex.includes(source.url),`bundle missing ${source.url}`);

console.log(`Validated ${refs.particleIds.length} particles, ${Object.keys(core.DECAY_TABLE).length} decay tables, ${Object.keys(refs.SOURCES).length} primary/official sources, locale parity, physics invariants, and byte-identical mobile bundles.`);
