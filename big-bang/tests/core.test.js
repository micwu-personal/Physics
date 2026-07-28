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
