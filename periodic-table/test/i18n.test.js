'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('actual phase display resolver localizes known and unknown phases', ()=>{
  const context = vm.createContext({window:{CURRENT_LANG:'en'}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'i18n.js'), 'utf8');
  vm.runInContext(`${source}\nglobalThis.__phase={resolvePhaseLabel};`, context);

  assert.equal(context.__phase.resolvePhaseLabel('solid'), 'Solid');
  assert.equal(context.__phase.resolvePhaseLabel('unknown'), 'Unknown');
  context.window.CURRENT_LANG = 'zh-CN';
  assert.equal(context.__phase.resolvePhaseLabel('solid'), '固态');
  assert.equal(context.__phase.resolvePhaseLabel('unknown'), '未知');
  assert.equal(context.__phase.resolvePhaseLabel('unreviewed'), 'unreviewed');
});
