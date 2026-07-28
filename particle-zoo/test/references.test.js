const test = require('node:test');
const assert = require('node:assert/strict');

require('../references.js');
const refs = globalThis.ParticleZooReferences;

test('all citation metadata resolves to primary or official HTTPS sources', () => {
  for (const [id, source] of Object.entries(refs.SOURCES)) {
    assert.ok(source.title.length > 8, id);
    assert.match(source.url, /^https:\/\//, id);
    assert.doesNotMatch(source.url, /wikipedia/i, id);
  }
  const walk = value => {
    if (Array.isArray(value)) {
      assert.ok(value.length > 0);
      value.forEach(id => assert.ok(refs.SOURCES[id], id));
      return;
    }
    Object.values(value).forEach(walk);
  };
  walk(refs.CONTENT_REFERENCES);
});

test('reference renderer localizes its label and hardens external links', () => {
  const html = refs.render(['pdg', 'cernSm'], '资料来源');
  assert.match(html, /<span>资料来源:<\/span>/);
  assert.equal((html.match(/target="_blank"/g) || []).length, 2);
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 2);
  assert.deepEqual(refs.resolve(['pdg']), [refs.SOURCES.pdg]);
});

test('metadata covers every declared content collection', () => {
  assert.deepEqual(Object.keys(refs.CONTENT_REFERENCES.particle), refs.particleIds);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.force).length, 4);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.interaction).length, 21);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.decay).length, 10);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.lab).length, 10);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.bsm).length, 12);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.phenomenon).length, 9);
  assert.equal(Object.keys(refs.CONTENT_REFERENCES.section).length, 5);
});
