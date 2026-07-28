#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Science = require('./science.js');
const Sources = require('./source-registry.js');

const ROOT = __dirname;

function loadData(){
  const context = vm.createContext({console, window:{CURRENT_LANG:'en'}, PeriodicScience:Science});
  const data = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  vm.runInContext(`${data}\nglobalThis.__core={ELEMENT_TABLE,ELEMENTS,EXTENDED,ELEMENT_REACTIONS,DISCOVERY,SIGNATURE_COLORS,MOLECULE_3D,generateFallbackExt,shellCounts};`, context);
  const features = fs.readFileSync(path.join(ROOT, 'features', 'features-data.js'), 'utf8');
  vm.runInContext(`${features}\nglobalThis.__features={F_RADIUS,F_IE,F_DENSITY,F_MELT,F_ABUNDANCE,F_ORIGIN,F_NUCLIDES};`, context);
  const i18n = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
  const featureI18n = fs.readFileSync(path.join(ROOT, 'features', 'features-i18n.js'), 'utf8');
  vm.runInContext(`${i18n}\n${featureI18n}\nglobalThis.__locales=LOCALES;`, context);
  return {core:context.__core, features:context.__features, locales:context.__locales};
}

function validate(){
  const {core, features, locales} = loadData();
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
  });
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

  Sources.REQUIRED_GROUPS.forEach(group => {
    assert.ok(Sources.sourcesFor(group, 1).length > 0, `source coverage for ${group}`);
  });
  Object.values(Sources.SOURCES).forEach(source => {
    assert.match(source.url, /^https:\/\//);
    assert.ok(!/wikipedia/i.test(source.url), `primary/review source: ${source.url}`);
  });

  const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  assert.equal((appSource.match(/requestAnimationFrame\(frame\)/g) || []).length, 0, 'continuous loops use activity gate');
  assert.ok(appSource.includes('visibilitychange'));
  assert.ok(appSource.includes('IntersectionObserver'));
  assert.ok(appSource.includes('prefers-reduced-motion'));
  assert.match(appSource, /pausedAnimationFrames\.set\(element, callback\)/);
  const ligandSource = fs.readFileSync(path.join(ROOT, 'features', 'ligand.js'), 'utf8');
  assert.equal(ligandSource.includes("dataset.sourceGroup = 'ligand'"), false, 'ligand source links have one rendering owner');

  const mobileA = path.join(ROOT, 'mobile', 'index.html');
  const mobileB = path.join(ROOT, 'mobile', 'periodic-table.html');
  if (fs.existsSync(mobileA) && fs.existsSync(mobileB)) {
    const a = fs.readFileSync(mobileA);
    const b = fs.readFileSync(mobileB);
    assert.equal(Buffer.compare(a,b), 0, 'mobile bundles are byte-identical');
    const html = a.toString('utf8');
    assert.equal(/<script\s+src=/.test(html), false, 'mobile scripts are inlined');
    assert.equal(/<link\s+rel="stylesheet"/.test(html), false, 'mobile styles are inlined');
    assert.equal(html.includes('fonts.googleapis.com'), false, 'mobile build has no font CDN');
    assert.ok(html.includes('CNCTST 术语在线') && html.includes('NNDC NuDat 3'), 'mobile build contains structured references');
    [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((match, index) => {
      assert.doesNotThrow(()=>new Function(match[1]), `mobile inline script ${index + 1} parses`);
    });
  }

  console.log(`Validated ${elements.length} elements, ${features.F_NUCLIDES.length} nuclides, ${reactions.length} reactions, ${Sources.REQUIRED_GROUPS.length} source groups.`);
}

validate();
