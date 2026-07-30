const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const i18nSource = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const coreSource = fs.readFileSync(path.join(root, 'core.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const context = {};
vm.createContext(context);
vm.runInContext(
  `${i18nSource}
  globalThis.DATA = {LOCALES, SOURCES, EPOCHS, EPOCH_I18N, COMPOSITIONS, FATES, MYSTERIES};
  globalThis.formatCosmicTime = formatCosmicTime;`,
  context
);

const {LOCALES, SOURCES, EPOCHS, EPOCH_I18N, COMPOSITIONS, FATES, MYSTERIES} = context.DATA;
const coreApi = vm.runInNewContext(`${coreSource}\n;BigBangCore`, {filename:'core.js'});

function validateReferences(item, name){
  assert(Array.isArray(item.refs) && item.refs.length > 0, `${name} must have references`);
  for(const ref of item.refs){
    assert(SOURCES[ref], `${name} has unknown reference ${ref}`);
  }
}

assert.deepStrictEqual(
  Object.keys(LOCALES.en).sort(),
  Object.keys(LOCALES['zh-CN']).sort(),
  'English and Simplified Chinese UI dictionaries must have matching keys'
);

const ids = Array.from(EPOCHS, epoch => epoch.id);
assert.strictEqual(new Set(ids).size, ids.length, 'Epoch IDs must be unique');
assert.strictEqual(new Set(EPOCHS.map(epoch => epoch.tsec)).size, EPOCHS.length, 'Epoch representative times must be unique');
for(let i=1; i<EPOCHS.length; i++){
  assert(EPOCHS[i].tsec > EPOCHS[i-1].tsec, `Epoch ${EPOCHS[i].id} must occur after ${EPOCHS[i-1].id}`);
}

const sliderMatch = htmlSource.match(/id="timeSlider" min="([^"]+)" max="([^"]+)"/);
assert(sliderMatch, 'Time slider bounds must be present');
const sliderMin = Number(sliderMatch[1]);
const sliderMax = Number(sliderMatch[2]);
for(const epoch of EPOCHS){
  validateReferences(epoch, `Epoch ${epoch.id}`);
  const sliderValue = coreApi.cosmicTimeToAxisPosition(epoch.tsec) * sliderMax;
  assert(sliderValue >= sliderMin && sliderValue <= sliderMax, `Epoch ${epoch.id} must be reachable with the time slider`);
}

const requiredEpochFields = ['name', 'time', 'temp', 'size', 'density', 'dominant', 'events', 'evidence'];
assert.deepStrictEqual(Object.keys(EPOCH_I18N['zh-CN']).sort(), ids.slice().sort(), 'Every epoch must have a Chinese override');
for(const id of ids){
  for(const field of requiredEpochFields){
    assert(EPOCH_I18N['zh-CN'][id][field], `Chinese epoch ${id} is missing ${field}`);
  }
}

for(const [name, snapshot] of Object.entries(COMPOSITIONS)){
  validateReferences(snapshot, `Composition ${name}`);
  const total = snapshot.data.reduce((sum, row) => sum + row.v, 0);
  assert(Math.abs(total - 100) < 1e-9, `${name} composition must sum to 100%`);
}

for(const id of ['timelineWrap', 'timeSlider', 'spacetimeSvg', 'compGrid', 'scaleWrap', 'fatesGrid', 'mysteriesGrid']){
  assert(htmlSource.includes(`id="${id}"`), `Required rendering target #${id} must exist`);
}
const compositionKeys = new Set(Object.values(COMPOSITIONS).flatMap(snapshot => snapshot.data.map(row => row.k)));
for(const key of compositionKeys){
  assert(LOCALES.en[`comp.legend.${key}`], `English composition label ${key} must exist`);
  assert(LOCALES['zh-CN'][`comp.legend.${key}`], `Chinese composition label ${key} must exist`);
  assert(appSource.includes(`${key}:`), `Composition color ${key} must exist`);
}

assert.strictEqual(FATES.en.length, FATES['zh-CN'].length, 'Fate cards must have locale parity');
assert.strictEqual(MYSTERIES.en.length, MYSTERIES['zh-CN'].length, 'Mystery cards must have locale parity');
for(const locale of ['en', 'zh-CN']){
  FATES[locale].forEach(item=>validateReferences(item, `${locale} fate ${item.id}`));
  MYSTERIES[locale].forEach(item=>validateReferences(item, `${locale} mystery ${item.id}`));
}

const year = 3.156e7;
assert.strictEqual(context.formatCosmicTime(13.8e9 * year, 'en'), '13.80 Gyr');
assert.strictEqual(context.formatCosmicTime(13.8e9 * year, 'zh-CN'), '138.00 亿年');
assert.strictEqual(context.formatCosmicTime(1e9 * year, 'zh-CN'), '10.00 亿年');
assert.strictEqual(context.formatCosmicTime(380000 * year, 'zh-CN'), '38.0 万年');
assert.strictEqual(context.formatCosmicTime(1e100 * year, 'zh-CN'), '10^100 年');

const scaleMatch = appSource.match(/const SCALE_ROWS = (\[[\s\S]*?\n\]);/);
assert(scaleMatch, 'Scale rows must be present');
const scaleRows = vm.runInNewContext(scaleMatch[1]);
for(const [index, row] of scaleRows.entries()){
  validateReferences(row, `Scale row ${index}`);
  for(const field of ['t', 'tzh', 'size', 'sizezh', 'compare', 'comparezh']){
    assert(row[field], `Scale row ${index} is missing ${field}`);
  }
}

assert(!i18nSource.includes('collision in ~4.5 Gyr'), 'Outdated certain Milky Way–Andromeda collision claim must not return');
assert(!appSource.includes('A billion times smaller than a proton'), 'Proton comparison must not be off by 1000×');
assert(!i18nSource.includes("{k:'radiation',v:85}"), 'BBN composition must not show an arbitrary 85/15 split');
assert.strictEqual(SOURCES.sawala2025.url, 'https://doi.org/10.1038/s41550-025-02563-1', 'Sawala et al. primary source must be registered');
assert(htmlSource.indexOf('core.js') < htmlSource.indexOf('i18n.js'), 'Testable core must load before app data and rendering');
assert(coreSource.includes('rel="noopener noreferrer"'), 'Reference links must protect opener context');
assert(i18nSource.includes("if(typeof renderSourceLinks==='function') renderSourceLinks(lang)"), 'Language updates must rerender the global source panel');
for(const [id, source] of Object.entries(SOURCES)){
  assert(/^https:\/\//.test(source.url), `Source ${id} must use HTTPS`);
  assert(!/wikipedia/i.test(source.url), `Source ${id} must not cite Wikipedia`);
}

let renderedSourceLanguage = null;
context.window = {};
context.document = {
  documentElement:{lang:''},
  querySelectorAll(){ return []; },
  querySelector(){ return null; }
};
context.renderSourceLinks = lang=>{ renderedSourceLanguage = lang; };
context.applyI18n('zh-CN');
assert.strictEqual(renderedSourceLanguage, 'zh-CN', 'Changing language must rerender the source panel in Chinese');
assert.strictEqual(context.document.documentElement.lang, 'zh-CN');

console.log(`Validated ${EPOCHS.length} epochs, ${Object.keys(LOCALES.en).length} locale keys, ${scaleRows.length} scale rows, and ${Object.keys(SOURCES).length} primary sources.`);
