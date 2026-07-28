'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Science = require('../science.js');

test('electron configurations produce principal-shell populations', ()=>{
  assert.deepEqual(Science.shellCountsFromConfig('1s¹'), [1,0,0,0,0,0,0]);
  assert.deepEqual(Science.shellCountsFromConfig('1s2'), [2,0,0,0,0,0,0]);
  assert.deepEqual(Science.shellCountsFromConfig('[Ar] 3d¹⁰4s¹'), [2,8,18,1,0,0,0]);
  assert.deepEqual(Science.shellCountsFromConfig('[Rn] 5f³6d¹7s²'), [2,8,18,32,21,9,2]);
  assert.throws(()=>Science.shellCountsFromConfig(''), TypeError);
  assert.throws(()=>Science.shellCountsFromConfig('[Xx] 1s²'), RangeError);
});

test('formula parser handles subscripts, coefficients and groups', ()=>{
  assert.deepEqual(Science.parseFormula('H₂O'), {H:2,O:1});
  assert.deepEqual(Science.parseFormula('Cu(NO₃)₂'), {Cu:1,N:2,O:6});
  assert.deepEqual(Science.parseReactionSide('2H₂O + O₂'), {H:4,O:4});
  assert.throws(()=>Science.parseFormula('Mg(OH₂'), SyntaxError);
  assert.throws(()=>Science.parseFormula('2H'), SyntaxError);
  assert.throws(()=>Science.parseFormula('H)'), SyntaxError);
});

test('reaction balance reports balanced and unbalanced equations', ()=>{
  assert.deepEqual(Science.reactionBalance('2H₂ + O₂ → 2H₂O'), {
    balanced:true,
    left:{H:4,O:2},
    right:{H:4,O:2},
    delta:{}
  });
  assert.deepEqual(Science.reactionBalance('H₂ + O₂ = H₂O').delta, {O:-1});
  assert.deepEqual(Science.reactionBalance('H₂O → O₂').delta, {H:-2,O:1});
  assert.deepEqual(Science.reactionBalance('H₂ → H₂O').delta, {O:1});
  assert.equal(Science.reactionBalance('N₂ + 3H₂ ⇌ 2NH₃').balanced, true);
  assert.throws(()=>Science.reactionBalance('H₂ O₂'), SyntaxError);
});

test('animation state and radioactivity classification cover every branch', ()=>{
  assert.equal(Science.isAnimationAllowed(), false);
  assert.equal(Science.isAnimationAllowed({}), true);
  assert.equal(Science.isAnimationAllowed({active:false}), false);
  assert.equal(Science.isAnimationAllowed({documentVisible:false}), false);
  assert.equal(Science.isAnimationAllowed({elementVisible:false}), false);
  assert.equal(Science.isAnimationAllowed({reducedMotion:true}), false);
  assert.equal(Science.radioactivityClass(6,0), 'stable');
  assert.equal(Science.radioactivityClass(43,2), 'trace');
  assert.equal(Science.radioactivityClass(94,2), 'trace');
  assert.equal(Science.radioactivityClass(95,2), 'synthetic');
  assert.equal(Science.radioactivityClass(84,2), 'natural');
});
