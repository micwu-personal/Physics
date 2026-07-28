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
const context = {globalThis:{}, window:{}};
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
const forceNames = vm.runInNewContext(
  `(${/const FORCE_I18N = (\{[\s\S]*?\n\};)/.exec(i18nSource)[1].replace(/;$/, '')})`
);

/* Read a `const NAME = {...}` / `[...]` literal out of the browser bundle so the
   invariants its DOM code relies on are asserted here instead of re-checked with
   defensive fallbacks at runtime. */
function readLiteral(source, name){
  const marker = new RegExp(`(?:const|let|var) ${name} = `).exec(source);
  assert.ok(marker, `${name} literal is present`);
  const start = marker.index;
  let index = start + marker[0].length;
  const open = source[index];
  const close = open === '{' ? '}' : ']';
  let depth = 0, quote = null;
  for(; index < source.length; index++){
    const ch = source[index];
    if (quote){
      if (ch === '\\') index++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0){ index++; break; }
  }
  return vm.runInNewContext(`(${source.slice(start + marker[0].length, index)})`, new Proxy({}, {
    // Literals may reference renderer functions; only their shape matters here.
    has: () => true,
    get: (target, key) => (key in globalThis ? globalThis[key] : () => {})
  }));
}

for (const id of [
  // Controls the modules address without a fallback path.
  'bigBangLink', 'buildDecayBar', 'buildResult', 'buildStats', 'clearBuild',
  'confAuto', 'confReset', 'consControls', 'consLegend', 'decayLegend',
  'decayRestart', 'decaySpeed', 'detLegend', 'detPicker', 'evdControls',
  'evdLegend', 'feynClear', 'feynExample', 'feynLegend', 'feynPicker',
  'motionToggle', 'oscControls', 'pdfControls', 'pgClear', 'pgTrails',
  'runControls', 'tab-lab'
]) {
  assert.ok(indexSource.includes(`id="${id}"`), `required DOM target #${id}`);
}
assert.equal(appSource.includes("CURRENT_LANG||'en'"), false, 'renderers trust the bootstrapped language');
assert.equal(appSource.includes("CURRENT_LANG || 'en'"), false, 'renderers trust the bootstrapped language');
assert.match(i18nSource, /window\.CURRENT_LANG = 'en';/, 'i18n installs a boot locale before any renderer runs');

/* The viewport observer callback assigns labStaticDirty directly, so the binding
   has to be declared before the observer is constructed: an IntersectionObserver
   delivers entries in a later task, never inside observe(), but a declaration
   below the callback would still be a temporal dead zone hazard. */
const labStaticDirtyDeclaration = appSource.indexOf('let labStaticDirty');
const viewportObserverDeclaration = appSource.indexOf('const viewportObserver');
assert.ok(labStaticDirtyDeclaration > -1, 'labStaticDirty is declared exactly once');
assert.equal(appSource.indexOf('let labStaticDirty', labStaticDirtyDeclaration + 1), -1,
  'labStaticDirty is declared exactly once');
assert.ok(labStaticDirtyDeclaration < viewportObserverDeclaration,
  'labStaticDirty is declared before the viewport observer that marks it');
assert.equal(appSource.includes("typeof labStaticDirty"), false,
  'the observer callback assigns labStaticDirty without a defined-check');

const tileGroups = readLiteral(appSource, 'TILE_GROUPS');
const tileSymbols = readLiteral(appSource, 'TILE_SYMBOLS');
const selfConjugateMeta = readLiteral(appSource, 'SELF_CONJUGATE_META');
Object.entries(tileGroups).forEach(([group, ids])=>{
  assert.ok(indexSource.includes(`data-tiles="${group}"`), `standard-model row for ${group}`);
  ids.forEach(id=>{
    assert.ok(refs.particleIds.includes(id), `tile ${id} is a known particle`);
    assert.ok(tileSymbols[id], `tile symbol for ${id}`);
    if (group === 'selfanti') assert.ok(selfConjugateMeta[id], `self-conjugate label for ${id}`);
  });
});
assert.deepEqual(
  Object.keys(selfConjugateMeta).sort(),
  Array.from(tileGroups.selfanti).sort(),
  'self-conjugate labels match the self-conjugate row'
);

const particles = readLiteral(appSource, 'PARTICLES');
Object.entries(particles).forEach(([id, particle])=>{
  assert.match(String(particle.discovered), /\d{4}/, `discovery year for ${id}`);
  assert.ok(particle.antiparticle, `antiparticle note for ${id}`);
  (particle.forces || []).forEach(force=>{
    assert.ok(forceNames['zh-CN'][force], `localized force label for ${force}`);
  });
});
const mesonTable = readLiteral(appSource, 'MESON_TABLE');
const quarkCharge = readLiteral(appSource, 'QUARK_CHARGE');
const trayParts = matches(indexSource, /data-part="([^"]+)"/g);
const trayQuarks = trayParts.filter(part=>part in quarkCharge && !part.endsWith('bar'));
const trayAntiquarks = trayParts.filter(part=>part.endsWith('bar'));
assert.ok(trayQuarks.length && trayAntiquarks.length, 'the builder tray offers quarks and antiquarks');
trayQuarks.forEach(quark=>{
  trayAntiquarks.forEach(antiquark=>{
    assert.ok(mesonTable[`${quark}|${antiquark}`], `meson record for ${quark}${antiquark}`);
  });
});
const detParticles = readLiteral(appSource, 'DET_PARTICLES');
Object.entries(detParticles).forEach(([id, particle])=>{
  if (particle.muon === 'hit') assert.equal(particle.charged, true, `${id} only reaches the muon chambers when charged`);
});
const evdPid = readLiteral(appSource, 'EVD_PID');
Object.entries(evdPid).forEach(([id, pid])=>{
  if (pid.muon) assert.equal(pid.charged, true, `${id} only leaves muon hits when charged`);
  if (!pid.charged || pid.shower === 'none') {
    assert.equal(pid.dashed, true, `${id} is drawn as a dashed straight track`);
  }
});
const decayColors = readLiteral(appSource, 'DECAY_COLORS');
Object.entries(core.DECAY_TABLE).forEach(([parent, entry])=>{
  assert.ok(decayColors[parent], `decay colour for ${parent}`);
  entry.channels.forEach(channel=>{
    channel.daughters.forEach(daughter=>assert.ok(decayColors[daughter], `decay colour for ${daughter}`));
  });
});
core.CONS_EXAMPLES.forEach(example=>{
  [...example.reactants, ...example.products].forEach(name=>{
    assert.ok(core.CONS_PARTICLES[name], `conservation palette entry for ${name}`);
  });
});
Object.entries(readLiteral(appSource, 'ELEMENT_I18N')).forEach(([lang, list])=>{
  assert.ok(list.length >= 9, `${lang} nuclide names cover every buildable nucleus`);
});
const labDemos = readLiteral(appSource, 'LAB_DEMOS');
new Set(labDemos.map(demo=>demo.sub)).forEach(sub=>{
  assert.ok(
    labDemos.some(demo=>demo.sub===sub && demo.animated),
    `lab sub-tab ${sub} owns at least one animated demo, so its frame loop always has work`
  );
});
labDemos.forEach(demo=>{
  assert.ok(indexSource.includes(`id="${demo.canvas}"`), `lab canvas #${demo.canvas}`);
});
assert.match(appSource, /var PDF = \{ logQ2: [\d.]+, showGluon: true \}/, 'the parton-density control markup matches its default state');
assert.match(appSource, /id="pdfShowG" checked/, 'the parton-density control markup matches its default state');

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
