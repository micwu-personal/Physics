'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Sources = require('../source-registry.js');

class FakeNode {
  constructor(tag, ownerDocument){
    this.tag = tag;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.dataset = {};
    this.className = '';
  }
  appendChild(child){ this.children.push(child); return child; }
  remove(){ this.removed = true; }
  querySelectorAll(selector){
    if (selector === ':scope > .source-links') return this.children.filter(child=>child.className==='source-links');
    return this.matches || [];
  }
}
class FakeDocument {
  createElement(tag){ return new FakeNode(tag, this); }
  createTextNode(text){ return {text}; }
}

test('source registry covers every required group and element links', ()=>{
  Sources.REQUIRED_GROUPS.forEach(group=>assert.ok(Sources.sourcesFor(group, 1).length));
  assert.equal(Sources.sourcesFor('shells').length, 1);
  // Section-level citations ask for an element-scoped group without an element.
  assert.deepEqual(
    Sources.sourcesFor('core', null),
    Sources.SOURCE_GROUPS.core.map(id=>Sources.SOURCES[id])
  );
  assert.equal(Sources.sourcesFor('discovery', 119).length, Sources.SOURCE_GROUPS.discovery.length);
  assert.equal(Sources.elementSource(0), null);
  assert.equal(Sources.elementSource(119), null);
  assert.equal(Sources.elementSource(1.5), null);
  assert.deepEqual(Sources.elementSource(8), {
    label:'RSC element 8',
    url:'https://periodic-table.rsc.org/element/8'
  });
  assert.throws(()=>Sources.sourcesFor('missing'), RangeError);
});

test('safe links and localized render output use hardened external navigation', ()=>{
  const document = new FakeDocument();
  const link = Sources.safeExternalLink(Sources.SOURCES.iupac, document);
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'noopener noreferrer');
  assert.equal(link.referrerPolicy, 'no-referrer');
  assert.equal(link.href, Sources.SOURCES.iupac.url);
  const en = Sources.render('core', 1, 'en', document);
  const zh = Sources.render('core', 1, 'zh-CN', document);
  assert.equal(en.children[0].textContent, 'Sources: ');
  assert.equal(zh.children[0].textContent, '资料来源：');
  global.document = document;
  assert.equal(Sources.render('shells').className, 'source-links');
  delete global.document;
  assert.equal(Sources.render('core', 1, 'en', null), null);
});

test('install replaces section source links and handles missing roots', ()=>{
  const document = new FakeDocument();
  const section = new FakeNode('section', document);
  section.dataset.sourceGroup = 'core';
  const old = new FakeNode('div', document);
  old.className = 'source-links';
  section.children.push(old);
  const root = new FakeNode('main', document);
  root.matches = [section];
  assert.equal(Sources.install(root, 6, 'en'), 1);
  assert.equal(old.removed, true);
  assert.equal(section.children.at(-1).className, 'source-links');
  assert.equal(Sources.install(null, 6, 'en'), 0);
  assert.equal(Sources.install({}, 6, 'en'), 0);
});

test('browser global receives the source registry API', ()=>{
  const filename = path.resolve(__dirname, '../source-registry.js');
  const context = {};
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, {filename});
  assert.equal(context.PeriodicSources.REQUIRED_GROUPS.length, Sources.REQUIRED_GROUPS.length);
});
