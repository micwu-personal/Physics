#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Science = require('./science.js');
const Sources = require('./source-registry.js');

const ROOT = __dirname;

/* Read a `const NAME = {...}` / `[...]` literal out of a browser bundle that
   cannot be required directly, so invariants the DOM code relies on can be
   asserted here instead of being re-checked defensively at runtime. */
function readLiteral(source, name){
  const start = source.indexOf(`const ${name} = `);
  assert.notEqual(start, -1, `${name} literal is present`);
  let index = start + `const ${name} = `.length;
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
  const literal = source.slice(start + `const ${name} = `.length, index);
  return vm.runInNewContext(`(${literal})`);
}

function loadData(){
  const context = vm.createContext({console, window:{CURRENT_LANG:'en'}, PeriodicScience:Science});
  const data = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  vm.runInContext(`${data}\nglobalThis.__core={ELEMENT_TABLE,ELEMENTS,EXTENDED,ELEMENT_REACTIONS,DISCOVERY,SIGNATURE_COLORS,MOLECULE_3D,generateFallbackExt,shellCounts};`, context);
  const features = fs.readFileSync(path.join(ROOT, 'features', 'features-data.js'), 'utf8');
  vm.runInContext(`${features}\nglobalThis.__features={F_RADIUS,F_IE,F_DENSITY,F_MELT,F_ABUNDANCE,F_ORIGIN,F_ORIGIN_ICON,F_ORIGIN_COLORS,F_COSMIC_ERAS,F_NUCLIDES};`, context);
  const i18n = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
  const featureI18n = fs.readFileSync(path.join(ROOT, 'features', 'features-i18n.js'), 'utf8');
  vm.runInContext(`${i18n}\n${featureI18n}\nglobalThis.__localeApi={LOCALES,resolvePhaseLabel};`, context);
  return {core:context.__core, features:context.__features, locales:context.__localeApi.LOCALES, localeApi:context.__localeApi, context};
}

function validate(){
  const {core, features, locales, localeApi, context} = loadData();
  const elements = Object.values(core.ELEMENTS);
  assert.equal(elements.length, 118, 'exactly 118 elements');
  assert.deepEqual(elements.map(el=>el.Z), Array.from({length:118}, (_, index)=>index+1));
  assert.equal(new Set(elements.map(el=>el.symbol)).size, 118, 'symbols are unique');
  elements.forEach(el => {
    assert.ok(el.name_en && el.name_zh && el.config, `complete core record for Z=${el.Z}`);
    const shells = Array.from(core.shellCounts(el.Z));
    assert.equal(shells.reduce((sum, count)=>sum+count, 0), el.Z, `shell sum for ${el.symbol}`);
    assert.ok(['stable','natural','trace','synthetic'].includes(el.radioactivity));
    ['core','shells','orbitals','oxidation','colors','bonding','reactions','molecules','isotopes','discovery','origins'].forEach(group => {
      const citations = Sources.sourcesFor(group, el.Z);
      assert.ok(citations.length > 0, `${group} sources for ${el.symbol}`);
      if (['core','colors','reactions','discovery'].includes(group)) {
        assert.ok(citations.some(source=>source.url.endsWith(`/element/${el.Z}`)), `${group} element-specific source for ${el.symbol}`);
      }
    });
  });

  const expectedShells = {
    19:[2,8,8,1,0,0,0],
    20:[2,8,8,2,0,0,0],
    26:[2,8,14,2,0,0,0],
    29:[2,8,18,1,0,0,0],
    46:[2,8,18,18,0,0,0],
    47:[2,8,18,18,1,0,0],
    92:[2,8,18,32,21,9,2]
  };
  Object.entries(expectedShells).forEach(([z, expected]) => {
    assert.deepEqual(Array.from(core.shellCounts(Number(z))), expected, `known shell population Z=${z}`);
  });

  assert.equal(core.ELEMENTS[40].mass, 91.222);
  assert.equal(core.ELEMENTS[43].massDisplay, '[97]');
  assert.equal(core.ELEMENTS[108].massDisplay, '[277]');
  assert.equal(core.ELEMENTS[104].name_zh, '𬬻');
  assert.equal(core.ELEMENTS[105].name_zh, '𬭊');
  assert.equal(core.ELEMENTS[106].name_zh, '𬭳');
  assert.equal(core.ELEMENTS[107].name_zh, '𬭛');
  assert.equal(core.ELEMENTS[108].name_zh, '𬭶');
  assert.equal(core.ELEMENTS[110].name_zh, '𫟼');
  assert.equal(core.ELEMENTS[43].radioactivity, 'trace');
  assert.equal(core.ELEMENTS[84].radioactivity, 'natural');
  assert.equal(core.ELEMENTS[94].radioactivity, 'trace');
  assert.equal(core.ELEMENTS[95].radioactivity, 'synthetic');

  elements.filter(el=>!core.EXTENDED[el.Z]).forEach(el => {
    const fallback = core.generateFallbackExt(el);
    assert.deepEqual(Array.from(fallback.isotopes), [], `no invented isotope for ${el.symbol}`);
    if (el.Z >= 104) {
      assert.equal(fallback.phase, 'unknown');
      assert.ok(fallback.phaseNote_en && fallback.phaseNote_zh);
    }
  });

  const reactions = [
    ...Object.values(core.EXTENDED).flatMap(record=>record.reactions || []),
    ...Object.values(core.ELEMENT_REACTIONS).flat()
  ];
  reactions.forEach(reaction => {
    assert.equal(Science.reactionBalance(reaction.eq).balanced, true, `balanced: ${reaction.eq}`);
    assert.ok(reaction.note_en && reaction.note_zh, `localized reaction note: ${reaction.eq}`);
    (reaction.molecules_3d || []).forEach(formula=>{
      assert.ok(core.MOLECULE_3D[formula], `3D reaction structure ${formula}: ${reaction.eq}`);
    });
    const effects=Science.reactionEffects(reaction);
    assert.equal(typeof effects.gas,'boolean');
    assert.equal(typeof effects.precipitate,'boolean');
  });
  assert.ok(core.MOLECULE_3D.LiOH && core.MOLECULE_3D.Li2O && core.MOLECULE_3D.LiH,
    'lithium reactions have element-relevant structures');
  assert.deepEqual(
    Array.from(core.EXTENDED[3].reactions[1].molecules_3d),
    ['LiOH','H2'],
    'lithium water reaction focuses on products rather than unrelated water'
  );
  Object.entries(core.EXTENDED).forEach(([z, record]) => {
    (record.isotopes || []).forEach(isotope => {
      assert.ok(isotope.s && isotope.ab && typeof isotope.stable === 'boolean', `complete isotope item Z=${z}`);
      assert.ok(Sources.sourcesFor('isotopes', Number(z)).length >= 3, `isotope item sources Z=${z}`);
    });
    (record.reactions || []).forEach(reaction => {
      assert.ok(Sources.sourcesFor('reactions', Number(z)).some(source=>source.url.endsWith(`/element/${z}`)), `reaction item source Z=${z}`);
    });
  });
  Object.entries(core.SIGNATURE_COLORS).forEach(([z, records]) => {
    records.forEach(record => {
      assert.ok(record.state && record.hex && record.label_en && record.label_zh, `complete color item Z=${z}`);
      assert.ok(Sources.sourcesFor('colors', Number(z)).some(source=>source.url.endsWith(`/element/${z}`)), `color item source Z=${z}`);
    });
  });
  ['BO₂','PO₂','AgO','ScO'].forEach(falseProduct => {
    assert.equal(reactions.some(reaction=>reaction.eq.includes(falseProduct)), false, `removed false product ${falseProduct}`);
  });

  const seenNuclides = new Set();
  features.F_NUCLIDES.forEach(([z,n,decay,halfLife]) => {
    const key = `${z}:${n}`;
    assert.equal(seenNuclides.has(key), false, `unique nuclide ${key}`);
    seenNuclides.add(key);
    assert.equal(decay === 'S', halfLife === 'stable', `consistent stability ${key}`);
    assert.ok(z >= 1 && z <= 118 && n >= 0);
    assert.ok(['S','B-','B+','A','SF','P','N','?'].includes(decay));
    assert.ok(halfLife === 'stable' || (Number.isFinite(halfLife) && halfLife > 0));
  });
  const nuclide = (z,n) => features.F_NUCLIDES.find(record=>record[0]===z && record[1]===n);
  assert.deepEqual(Array.from(nuclide(19,19)), [19,19,'B+',459.06]);
  assert.deepEqual(Array.from(nuclide(37,50)), [37,50,'B-',1.5683792209372224e18]);
  assert.deepEqual(Array.from(nuclide(53,76)), [53,76,'B-',4.954437378010944e14]);
  assert.deepEqual(Array.from(nuclide(53,78)), [53,78,'B-',693377.28]);
  assert.equal(nuclide(92,142)[3], 7747225326762.34);
  assert.equal(nuclide(94,145)[3], 760837485247.41);
  assert.equal(nuclide(96,151)[3], 492288045203635.2);
  assert.equal(nuclide(98,153)[3], 28338119525.18);

  assert.equal(features.F_ORIGIN[38], 'smallstar');
  assert.equal(features.F_ORIGIN[57], 'smallstar');
  assert.equal(features.F_ORIGIN[83], 'smallstar');
  assert.ok([58,59,60,62,63,64,65,66,67,68,69,70,71].every(z=>features.F_ORIGIN[z]==='mixed'));
  assert.equal(features.F_MELT[2], null, 'helium has no standard-pressure melting point');

  assert.deepEqual(Object.keys(locales.en).sort(), Object.keys(locales['zh-CN']).sort(), 'locale key parity');
  ['radio.trace','radio.synthetic','phase.unknown','detail.iso.none','origin.caveat','ov.caveat'].forEach(key => {
    assert.ok(locales.en[key] && locales['zh-CN'][key], `localized key ${key}`);
  });
  context.window.CURRENT_LANG = 'en';
  assert.equal(localeApi.resolvePhaseLabel('unknown'), 'Unknown', 'runtime unknown phase in English');
  context.window.CURRENT_LANG = 'zh-CN';
  assert.equal(localeApi.resolvePhaseLabel('unknown'), '未知', 'runtime unknown phase in Simplified Chinese');

  Sources.REQUIRED_GROUPS.forEach(group => {
    assert.ok(Sources.sourcesFor(group, 1).length > 0, `source coverage for ${group}`);
  });
  Object.values(Sources.SOURCES).forEach(source => {
    assert.match(source.url, /^https:\/\//);
    assert.ok(!/wikipedia/i.test(source.url), `primary/review source: ${source.url}`);
  });

  const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const htmlSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  /* ---- Invariants the DOM code relies on instead of runtime fallbacks ---- */
  const layout = readLiteral(appSource, 'LAYOUT');
  const fBlock = readLiteral(appSource, 'F_BLOCK');
  layout.flat().forEach(cell => {
    if (cell === 0 || cell === 'La-Lu' || cell === 'Ac-Lr') return;
    assert.ok(core.ELEMENTS[cell], `grid layout entry ${cell} is an element`);
  });
  fBlock.flat().forEach(z => assert.ok(core.ELEMENTS[z], `f-block layout entry ${z} is an element`));
  assert.equal(
    new Set([...layout.flat(), ...fBlock.flat()].filter(cell => typeof cell === 'number' && cell !== 0)).size,
    118,
    'the grid plus f-block layout renders every element exactly once'
  );

  elements.forEach(el => {
    const ext = Object.assign({}, core.generateFallbackExt(el), core.EXTENDED[el.Z] || {});
    assert.ok(ext.phase, `detail phase for Z=${el.Z}`);
    assert.ok(Array.isArray(ext.reactions), `detail reaction list for Z=${el.Z}`);
    assert.ok(Array.isArray(ext.isotopes), `detail isotope list for Z=${el.Z}`);
    assert.ok(ext.uses_en && ext.uses_zh, `localized uses for Z=${el.Z}`);
    assert.ok(ext.discovery && ext.discovery.who, `discovery attribution for Z=${el.Z}`);
    assert.equal(typeof ext.discovery.year, 'number', `discovery year for Z=${el.Z}`);
    assert.ok(Array.isArray(core.DISCOVERY[el.Z]), `discovery record for Z=${el.Z}`);
    if (el.category === 'posttransition') {
      assert.ok(el.period >= 3, `post-transition metals expose d-orbital hybrids (Z=${el.Z})`);
    }
  });

  const subscripts = readLiteral(appSource, 'SUBSCRIPTS');
  assert.deepEqual(Object.keys(subscripts), [...'₀₁₂₃₄₅₆₇₈₉'], 'every subscript digit is normalizable');
  const shapeLabels = readLiteral(appSource, 'SHAPE_LABELS');
  assert.ok(Object.keys(core.MOLECULE_3D).length >= 45, '3D catalogue covers at least 45 reviewed structures or fragments');
  const bondAngle = (formula, centre, left, right) => {
    const atoms=core.MOLECULE_3D[formula].atoms;
    const a=atoms[left], c=atoms[centre], b=atoms[right];
    const av=[a.x-c.x,a.y-c.y,a.z-c.z], bv=[b.x-c.x,b.y-c.y,b.z-c.z];
    const cosine=av.reduce((sum,value,index)=>sum+value*bv[index],0)/(Math.hypot(...av)*Math.hypot(...bv));
    return Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI;
  };
  assert.ok(Math.abs(bondAngle('NO2',0,1,2)-134)<0.5, 'NO2 uses its approximately 134 degree gas-phase angle');
  assert.ok(Math.abs(bondAngle('H2S',0,1,2)-92.1)<0.5, 'H2S uses its approximately 92.1 degree gas-phase angle');
  Object.entries(core.MOLECULE_3D).forEach(([formula, molecule]) => {
    assert.ok(shapeLabels[formula], `3D shape label for ${formula}`);
    assert.equal(shapeLabels[formula].length, 2, `bilingual shape label for ${formula}`);
    const radii = molecule.atoms.map(a=>Math.hypot(a.x, a.y, a.z));
    assert.ok(Math.max(...radii) > 0, `3D molecule ${formula} has extent`);
    molecule.bonds.forEach(([i, j]) => {
      assert.ok(molecule.atoms[i] && molecule.atoms[j], `bond endpoints exist in ${formula}`);
    });
  });
  assert.match(appSource, /applyI18n\(initLang\);/, 'the language is resolved before any render');
  assert.equal(appSource.includes("CURRENT_LANG || 'en'"), false, 'renderers trust the bootstrapped language');

  const originsSource = fs.readFileSync(path.join(ROOT, 'features', 'origins.js'), 'utf8');
  const eraTimes = readLiteral(originsSource, 'ERA_TIMES');
  assert.equal(eraTimes.length, features.F_COSMIC_ERAS.length, 'every cosmic era has a time caption');
  const originKinds = new Set(Object.values(features.F_ORIGIN));
  for (let z = 1; z <= 118; z++) assert.ok(features.F_ORIGIN[z], `nucleosynthesis origin for Z=${z}`);
  originKinds.forEach(kind => {
    assert.ok(features.F_ORIGIN_ICON[kind], `origin icon for ${kind}`);
    assert.ok(features.F_ORIGIN_COLORS[kind], `origin color for ${kind}`);
    assert.ok(locales.en[`origin.${kind}`] && locales['zh-CN'][`origin.${kind}`], `origin label for ${kind}`);
    assert.ok(
      features.F_COSMIC_ERAS.some(era => era.origins.includes(kind)),
      `cosmic timeline forges ${kind}`
    );
  });

  const decayCodes = ['S','B-','B+','A','SF','P','N','?'];
  const nuclideSource = fs.readFileSync(path.join(ROOT, 'features', 'nuclide.js'), 'utf8');
  assert.deepEqual(Object.keys(readLiteral(nuclideSource, 'DECAY_COLORS')).sort(), [...decayCodes].sort());
  assert.deepEqual(Object.keys(readLiteral(nuclideSource, 'DECAY_KEYS')).sort(), [...decayCodes].sort());
  Object.values(readLiteral(nuclideSource, 'DECAY_KEYS')).forEach(key => {
    assert.ok(locales.en[key] && locales['zh-CN'][key], `localized decay mode ${key}`);
  });

  const ligandSource = fs.readFileSync(path.join(ROOT, 'features', 'ligand.js'), 'utf8');
  const ligands = readLiteral(ligandSource, 'LIGANDS');
  const metals = readLiteral(ligandSource, 'METALS');
  const preferredMetals = readLiteral(ligandSource, 'PREFERRED_METAL');
  const defaultLigand = /const DEFAULT_LIGAND = '([^']+)'/.exec(ligandSource)[1];
  assert.ok(ligands.some(ligand => ligand.id === defaultLigand), 'the default ligand exists in the series');
  Object.entries(preferredMetals).forEach(([z, key]) => {
    assert.ok(metals[key], `ligand-field parameter for ${key}`);
    assert.ok(key.startsWith(core.ELEMENTS[z].symbol), `preferred ion ${key} belongs to Z=${z}`);
  });
  new Set(Object.keys(metals).map(key => key.replace(/\d+$/, ''))).forEach(symbol => {
    const owner = elements.find(el => el.symbol === symbol);
    assert.ok(preferredMetals[owner.Z], `default oxidation state for ligand-field metal ${symbol}`);
  });

  const overlaySource = fs.readFileSync(path.join(ROOT, 'features', 'overlays.js'), 'utf8');
  const overlayIds = [...overlaySource.matchAll(/\{id:'([^']+)',\s*key:'([^']+)'/g)];
  assert.ok(overlayIds.length >= 8, 'the property overlays are declared as a table');
  overlayIds.forEach(([, , key]) => {
    assert.ok(locales.en[key] && locales['zh-CN'][key], `localized overlay ${key}`);
  });

  for (const match of htmlSource.matchAll(/data-i18n="([^"]+)"/g)) {
    assert.ok(locales.en[match[1]], `English locale must define ${match[1]}`);
    assert.ok(locales['zh-CN'][match[1]], `Chinese locale must define ${match[1]}`);
  }
  for (const id of [
    'ptGrid', 'ptFBlock', 'detail', 'dName', 'dCategory', 'orbitalCanvas', 'nucleusCanvas', 'dHybridText'
  ]) {
    assert.ok(htmlSource.includes(`id="${id}"`), `required DOM target #${id}`);
  }
  for (const selector of ['class="pt-wrap"', 'id="dCategory"', 'data-i18n="detail.section.colors"']) {
    assert.ok(htmlSource.includes(selector), `required component anchor ${selector}`);
  }
  assert.ok(appSource.includes("list.push('s')"), 'every element must expose at least the s orbital');
  assert.equal((appSource.match(/requestAnimationFrame\(frame\)/g) || []).length, 0, 'continuous loops use activity gate');
  assert.ok(appSource.includes('visibilitychange'));
  assert.ok(appSource.includes('IntersectionObserver'));
  assert.ok(appSource.includes('prefers-reduced-motion'));
  assert.match(appSource, /pausedAnimationFrames\.set\(element, callback\)/);
  assert.equal(ligandSource.includes("dataset.sourceGroup = 'ligand'"), false, 'ligand source links have one rendering owner');

  const mobileA = path.join(ROOT, 'mobile', 'index.html');
  const mobileB = path.join(ROOT, 'mobile', 'periodic-table.html');
  if (fs.existsSync(mobileA) && fs.existsSync(mobileB)) {
    const a = fs.readFileSync(mobileA, 'utf8');
    const b = fs.readFileSync(mobileB, 'utf8');
    assert.ok(a.includes('<a class="brand-home" href="./index.html"'), 'index bundle brand home should point to mobile/index.html');
    assert.ok(b.includes('<a class="brand-home" href="./periodic-table.html"'), 'portable alias brand home should point to the standalone alias');
    assert.equal(
      a,
      b.replace('<a class="brand-home" href="./periodic-table.html"', '<a class="brand-home" href="./index.html"'),
      'portable alias should differ only by its self-home href'
    );
    const html = a;
    assert.equal(/<script\s+src=/.test(html), false, 'mobile scripts are inlined');
    assert.equal(/<link\s+rel="stylesheet"/.test(html), false, 'mobile styles are inlined');
    assert.equal(html.includes('fonts.googleapis.com'), false, 'mobile build has no font CDN');
    assert.ok(/data:image\/(png|jpeg);base64,/.test(html), 'mobile build embeds the electron-density evidence image');
    assert.ok(html.includes('href="../../index.html#atoms"'), 'standalone journey link stays local/offline-safe');
    assert.equal(html.includes('https://micwu-personal.github.io/Physics/'), false, 'mobile build does not hardcode hosted Physics routes');
    assert.ok(html.includes('CNCTST 术语在线') && html.includes('NNDC NuDat 3'), 'mobile build contains structured references');
    [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((match, index) => {
      assert.doesNotThrow(()=>new Function(match[1]), `mobile inline script ${index + 1} parses`);
    });
  }

  console.log(`Validated ${elements.length} elements, ${features.F_NUCLIDES.length} nuclides, ${reactions.length} reactions, ${Sources.REQUIRED_GROUPS.length} source groups.`);
}

validate();
