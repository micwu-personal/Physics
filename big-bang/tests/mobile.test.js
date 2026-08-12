const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file=>fs.readFileSync(path.join(root, file), 'utf8');
const sourceHtml = read('index.html');
const mobileHtml = read(path.join('mobile', 'index.html'));
const css = read('styles.css');
const core = read('core.js');
const i18n = read('i18n.js');
const app = read('app.js');

function sliderAttributes(html){
  const tag = html.match(/<input[^>]+id="timeSlider"[^>]*>/)?.[0];
  assert(tag, 'Time slider must exist');
  return Object.fromEntries(['min', 'max', 'step', 'value'].map(name=>{
    const value = tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];
    assert.notEqual(value, undefined, `Time slider must define ${name}`);
    return [name, value];
  }));
}

function exposeMobileData(){
  const context = {};
  vm.createContext(context);
  vm.runInContext(core, context, {filename:'mobile/core.js'});
  vm.runInContext(
    `${i18n}
    globalThis.DATA = {LOCALES, SOURCES, EPOCHS, EPOCH_I18N, COMPOSITIONS, FATES, MYSTERIES};
    globalThis.formatCosmicTime = formatCosmicTime;`,
    context,
    {filename:'mobile/i18n.js'}
  );
  return context;
}

test('standalone mobile bundle embeds every current source exactly', () => {
  assert.match(mobileHtml, /Big Bang — SINGLE-FILE BUILD/);
  assert(mobileHtml.includes(`<style>\n${css}\n</style>`), 'Mobile CSS must match styles.css byte-for-byte');
  for(const [name, source] of [['core.js', core], ['i18n.js', i18n], ['app.js', app]]){
    assert(mobileHtml.includes(`<script>\n${source}\n</script>`), `Mobile ${name} must match its source byte-for-byte`);
  }
  assert(!/<script\s+src="(?:core|i18n|app)\.js"/.test(mobileHtml), 'Mobile bundle must not retain local script dependencies');
  assert(!/<link\s+rel="stylesheet"\s+href="styles\.css"/.test(mobileHtml), 'Mobile bundle must not retain its local stylesheet dependency');
  assert(/data:image\/(png|jpeg);base64,/.test(mobileHtml), 'Mobile bundle embeds the WMAP evidence image');
  assert(mobileHtml.includes('href="../../particle-zoo/index.html?tab=chart"'), 'Standalone journey links stay local/offline-safe');
  assert(mobileHtml.includes('href="../../periodic-table/index.html?overlay=origin&amp;element=2"'), 'Standalone bridge links preserve local element navigation');
  assert(!mobileHtml.includes('https://micwu-personal.github.io/Physics/'), 'Mobile bundle does not hardcode hosted Physics routes');
});

test('mobile slider and localized science data retain source behavior', () => {
  assert.deepEqual(sliderAttributes(mobileHtml), sliderAttributes(sourceHtml));
  const context = exposeMobileData();
  const {LOCALES, EPOCHS, EPOCH_I18N} = context.DATA;
  assert.deepEqual(Object.keys(LOCALES.en).sort(), Object.keys(LOCALES['zh-CN']).sort());
  assert.deepEqual(Array.from(EPOCHS, epoch=>epoch.id).sort(), Object.keys(EPOCH_I18N['zh-CN']).sort());
  const slider = sliderAttributes(mobileHtml);
  const maxValue = Number(slider.max);
  assert(EPOCHS.every(epoch=>context.BigBangCore.cosmicTimeToAxisPosition(epoch.tsec) * maxValue <= maxValue), 'Every mobile epoch must be slider-reachable');
  assert.equal(context.formatCosmicTime(13.8e9*3.156e7, 'zh-CN'), '138.00 亿年');
  assert.equal(context.formatCosmicTime(1e100*3.156e7, 'en'), '10^100 yr');
});

test('mobile content blocks retain complete, safe reference behavior', () => {
  const context = exposeMobileData();
  const {LOCALES, SOURCES, EPOCHS, COMPOSITIONS, FATES, MYSTERIES} = context.DATA;
  const scaleMatch = app.match(/const SCALE_ROWS = (\[[\s\S]*?\n\]);/);
  assert(scaleMatch, 'Mobile app must define scale rows');
  const scaleRows = vm.runInNewContext(scaleMatch[1]);
  const items = [
    ...Array.from(EPOCHS),
    ...Object.values(COMPOSITIONS),
    ...Array.from(FATES.en),
    ...Array.from(FATES['zh-CN']),
    ...Array.from(MYSTERIES.en),
    ...Array.from(MYSTERIES['zh-CN']),
    ...Array.from(scaleRows)
  ];
  for(const item of items){
    assert(item.refs?.length > 0, 'Every mobile scientific content block must retain references');
    for(const id of item.refs) assert(SOURCES[id], `Mobile content references unknown source ${id}`);
  }
  const links = context.BigBangCore.buildReferenceLinks(EPOCHS[0].refs, SOURCES, LOCALES.en['refs.label']);
  assert.match(links, /target="_blank" rel="noopener noreferrer"/);
  assert.match(links, />References:</);
  for(const call of [
    'buildReferenceLinks(e.refs',
    'buildReferenceLinks(ep.refs',
    'buildReferenceLinks(sn.refs',
    'buildReferenceLinks(row.refs',
    'buildReferenceLinks(f.refs',
    'buildReferenceLinks(m.refs'
  ]){
    assert(app.includes(call), `Mobile renderer must expose ${call}`);
  }
});

test('mobile animation lifecycle retains all CPU guards', () => {
  for(const guard of [
    "document.addEventListener('visibilitychange'",
    "window.matchMedia('(prefers-reduced-motion: reduce)')",
    "'IntersectionObserver' in window",
    'createAnimationController({'
  ]){
    assert(app.includes(guard), `Mobile app must retain animation guard: ${guard}`);
  }
  assert.equal((app.match(/requestAnimationFrame/g)||[]).length, 1, 'Mobile source must have one RAF scheduling site');
  assert(!/requestAnimationFrame\s*\(\s*drawBg/.test(app), 'Starfield must not self-schedule outside the lifecycle controller');
});
