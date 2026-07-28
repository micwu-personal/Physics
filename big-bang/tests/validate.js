const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const i18nSource = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const context = {};
vm.createContext(context);
vm.runInContext(
  `${i18nSource}
  globalThis.DATA = {LOCALES, EPOCHS, EPOCH_I18N, COMPOSITIONS, FATES, MYSTERIES};
  globalThis.formatCosmicTime = formatCosmicTime;`,
  context
);

const {LOCALES, EPOCHS, EPOCH_I18N, COMPOSITIONS, FATES, MYSTERIES} = context.DATA;

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
  const logTime = Math.log10(epoch.tsec);
  assert(logTime >= sliderMin && logTime <= sliderMax, `Epoch ${epoch.id} must be reachable with the time slider`);
}

const requiredEpochFields = ['name', 'time', 'temp', 'size', 'density', 'dominant', 'events', 'evidence'];
assert.deepStrictEqual(Object.keys(EPOCH_I18N['zh-CN']).sort(), ids.slice().sort(), 'Every epoch must have a Chinese override');
for(const id of ids){
  for(const field of requiredEpochFields){
    assert(EPOCH_I18N['zh-CN'][id][field], `Chinese epoch ${id} is missing ${field}`);
  }
}

for(const [name, rows] of Object.entries(COMPOSITIONS)){
  const total = rows.reduce((sum, row) => sum + row.v, 0);
  assert(Math.abs(total - 100) < 1e-9, `${name} composition must sum to 100%`);
}

assert.strictEqual(FATES.en.length, FATES['zh-CN'].length, 'Fate cards must have locale parity');
assert.strictEqual(MYSTERIES.en.length, MYSTERIES['zh-CN'].length, 'Mystery cards must have locale parity');

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
  for(const field of ['t', 'tzh', 'size', 'sizezh', 'compare', 'comparezh']){
    assert(row[field], `Scale row ${index} is missing ${field}`);
  }
}

assert(!i18nSource.includes('collision in ~4.5 Gyr'), 'Outdated certain Milky Way–Andromeda collision claim must not return');
assert(!appSource.includes('A billion times smaller than a proton'), 'Proton comparison must not be off by 1000×');
assert(!i18nSource.includes("{k:'radiation',v:85}"), 'BBN composition must not show an arbitrary 85/15 split');
assert(htmlSource.includes('arxiv.org/abs/2408.00064'), 'Sawala et al. source must be linked');

console.log(`Validated ${EPOCHS.length} epochs, ${Object.keys(LOCALES.en).length} locale keys, and ${scaleRows.length} scale rows.`);
