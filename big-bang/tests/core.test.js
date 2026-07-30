const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const corePath = path.resolve(__dirname, '..', 'core.js');
const source = fs.readFileSync(corePath, 'utf8');
const api = vm.runInThisContext(`${source}\n;BigBangCore`, {filename:corePath});

test('escapeHtml encodes all HTML-significant characters', () => {
  assert.equal(api.escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
  assert.equal(api.escapeHtml(42), '42');
});

test('cosmic time axis preserves detail before now and keeps the far future reachable', () => {
  const now = 4.35e17;
  assert.equal(api.cosmicTimeToAxisPosition(1e-43), 0);
  assert(Math.abs(api.cosmicTimeToAxisPosition(now) - 0.76) < 1e-12);
  assert.equal(api.cosmicTimeToAxisPosition(Math.pow(10, 107.5)), 1);
  for(const tsec of [1e-43, 1e-32, 1, 1.2e13, now, 1e40, Math.pow(10, 107.5)]){
    const position = api.cosmicTimeToAxisPosition(tsec);
    const roundTrip = api.axisPositionToCosmicTime(position);
    assert(Math.abs(Math.log10(roundTrip) - Math.log10(tsec)) < 1e-10);
  }
  assert.equal(api.cosmicTimeToAxisPosition(1e-50), 0);
  assert.equal(api.cosmicTimeToAxisPosition(1e200), 1);
  assert.equal(api.axisPositionToCosmicTime(-1), 1e-43);
  assert.equal(api.axisPositionToCosmicTime(2), Math.pow(10, 107.5));
  assert.throws(()=>api.cosmicTimeToAxisPosition(Infinity), /positive finite/);
  assert.throws(()=>api.cosmicTimeToAxisPosition(0), /positive finite/);
  assert.throws(()=>api.axisPositionToCosmicTime(NaN), /finite/);
  const customAxis = {minLog:0, nowLog:1, maxLog:2, nowPosition:0.5};
  assert.equal(api.cosmicTimeToAxisPosition(10, customAxis), 0.5);
  assert.equal(api.axisPositionToCosmicTime(0.5, customAxis), 10);
});

test('log-scale interpolation is geometric in time and rejects invalid anchors', () => {
  const anchors = [{tsec:1, value:2}, {tsec:100, value:6}];
  assert.equal(api.interpolateLogValue(1, anchors), 2);
  assert.equal(api.interpolateLogValue(100, anchors), 6);
  assert.equal(api.interpolateLogValue(10, anchors), 4);
  assert.equal(api.interpolateLogValue(50, [{tsec:1,value:0},{tsec:10,value:1},{tsec:100,value:2}]), 1 + Math.log10(5));
  assert.equal(api.interpolateLogValue(0.1, anchors), null);
  assert.equal(api.interpolateLogValue(1000, anchors), null);
  assert.throws(()=>api.interpolateLogValue(Infinity, anchors), /positive finite/);
  assert.throws(()=>api.interpolateLogValue(0, anchors), /positive finite/);
  assert.throws(()=>api.interpolateLogValue(10, null), /two scale anchors/);
  assert.throws(()=>api.interpolateLogValue(10, [anchors[0]]), /two scale anchors/);
  assert.throws(()=>api.interpolateLogValue(10, [{tsec:2,value:0},{tsec:1,value:1}]), /ordered/);
});

test('buildReferenceLinks creates safe links and rejects incomplete metadata', () => {
  const html = api.buildReferenceLinks(
    ['paper'],
    {paper:{label:`Study <A>`, url:`https://example.test/?a=1&b="2"`}},
    `References & notes`
  );
  assert.match(html, /References &amp; notes/);
  assert.match(html, /Study &lt;A&gt;/);
  assert.match(html, /a=1&amp;b=&quot;2&quot;/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.throws(()=>api.buildReferenceLinks([], {}, 'References'), /At least one/);
  assert.throws(()=>api.buildReferenceLinks(null, {}, 'References'), /At least one/);
  assert.throws(()=>api.buildReferenceLinks(['missing'], {}, 'References'), /Unknown scientific reference/);
});

test('source panel rerenders its label when language changes', () => {
  const panel = {innerHTML:''};
  const sources = {
    first:{label:'First paper', url:'https://example.test/first'},
    second:{label:'Second paper', url:'https://example.test/second'},
    duplicate:{label:'Duplicate paper', url:'https://example.test/first'}
  };

  api.renderReferencePanel(panel, sources, 'References');
  assert.equal((panel.innerHTML.match(/class="item-refs"/g)||[]).length, 1);
  assert.equal((panel.innerHTML.match(/>References:</g)||[]).length, 1);
  assert.equal((panel.innerHTML.match(/target="_blank"/g)||[]).length, 2);
  assert.equal((panel.innerHTML.match(/https:\/\/example\.test\/first/g)||[]).length, 1);

  api.renderReferencePanel(panel, sources, '参考资料');
  assert.equal((panel.innerHTML.match(/>参考资料:</g)||[]).length, 1);
  assert.doesNotMatch(panel.innerHTML, />References:</);
});

test('animation controller schedules one frame and pauses for every guard', () => {
  let nextId = 1;
  let draws = 0;
  const callbacks = new Map();
  const cancelled = [];
  const controller = api.createAnimationController({
    requestFrame(callback){
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id){
      cancelled.push(id);
      callbacks.delete(id);
    },
    draw(){ draws++; }
  });

  assert.equal(controller.isRunning(), false);
  controller.start();
  assert.equal(controller.isRunning(), true);
  controller.start();
  assert.equal(callbacks.size, 1);

  const first = callbacks.get(1);
  callbacks.delete(1);
  first();
  assert.equal(draws, 1);
  assert.equal(callbacks.size, 1);

  const pendingWhileVisible = callbacks.get(2);
  controller.setDocumentVisible(false);
  assert.deepEqual(cancelled, [2]);
  assert.equal(controller.isRunning(), false);
  pendingWhileVisible();
  assert.equal(draws, 1);

  controller.setDocumentVisible(true);
  controller.setIntersecting(false);
  assert.equal(controller.isRunning(), false);
  controller.setIntersecting(false);
  controller.setIntersecting(true);
  assert.equal(controller.isRunning(), true);

  controller.setReducedMotion(true);
  assert.equal(controller.isRunning(), false);
  controller.setReducedMotion(false);
  assert.equal(controller.isRunning(), true);

  controller.stop();
  assert.equal(controller.isRunning(), false);
  controller.stop();
});

test('starfield component resets, projects, and culls stars', () => {
  const stars = [
    {x:0, y:0, z:51, hue:10},
    {x:0, y:0, z:0, hue:20},
    {x:-100, y:0, z:51, hue:30},
    {x:100, y:0, z:51, hue:40},
    {x:0, y:-100, z:51, hue:50},
    {x:0, y:100, z:51, hue:60}
  ];
  const randomValues = [0.5, 0.5];
  const visited = [];
  api.advanceStarfield(
    stars,
    100,
    100,
    ()=>randomValues.shift(),
    (star, x, y, size, alpha)=>visited.push({star, x, y, size, alpha})
  );

  assert.equal(visited.length, 2);
  assert.equal(visited[0].x, 50);
  assert.equal(visited[0].y, 50);
  assert(visited[0].size > 0);
  assert(visited[0].alpha > 0);
  assert.equal(stars[1].z, 100);
  assert.equal(stars[1].x, 0);
  assert.equal(stars[1].y, 0);
});

test('starfield recycles stars left behind by a shrinking viewport', () => {
  // A star sitting deeper than the new far plane would otherwise project with a
  // negative radius once the window is made smaller.
  const stars = [{x:0, y:0, z:400, hue:10}];
  const visited = [];
  api.advanceStarfield(stars, 100, 100, ()=>0.5, (star, x, y, size, alpha)=>visited.push({size, alpha}));

  assert.equal(stars[0].z, 100);
  assert.equal(stars[0].x, 0);
  assert.equal(stars[0].y, 0);
  visited.forEach(entry => {
    assert(entry.size >= 0, 'projected radius stays drawable');
    assert(entry.alpha >= 0 && entry.alpha <= 1, 'fade stays inside [0, 1]');
  });
});
