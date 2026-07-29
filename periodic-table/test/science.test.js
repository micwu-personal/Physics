'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
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

test('reaction timeline holds source molecules for exactly 500 ms', ()=>{
  assert.deepEqual(Science.reactionTimeline(0), {progress:0, holdingSource:true, complete:false});
  assert.deepEqual(Science.reactionTimeline(499), {progress:0, holdingSource:true, complete:false});
  assert.deepEqual(Science.reactionTimeline(500), {progress:0, holdingSource:false, complete:false});
  assert.equal(Science.reactionTimeline(3250).progress, 0.5);
  assert.deepEqual(Science.reactionTimeline(6000), {progress:1, holdingSource:false, complete:true});
  assert.deepEqual(Science.reactionTimeline(-20), {progress:0, holdingSource:true, complete:false});
  assert.throws(()=>Science.reactionTimeline(Number.NaN), RangeError);
  assert.throws(()=>Science.reactionTimeline(1, 0), RangeError);
  assert.throws(()=>Science.reactionTimeline(1, 100, -1), RangeError);
});

test('reaction effects combine explicit physics with equation markers', ()=>{
  assert.deepEqual(Science.reactionEffects({eq:'2Na + 2H₂O → 2NaOH + H₂↑', effects:{heat:true}}), {
    gas:true, precipitate:false, heat:true, light:false, lightColor:null, precipitateColor:null,
    deposition:false, depositionColor:null
  });
  assert.deepEqual(Science.reactionEffects({eq:'Ag⁺ + Cl⁻ → AgCl↓', effects:{light:true, lightColor:'#ffffff', precipitateColor:'#f4f4f4'}}), {
    gas:false, precipitate:true, heat:false, light:true, lightColor:'#ffffff', precipitateColor:'#f4f4f4',
    deposition:false, depositionColor:null
  });
  assert.equal(Science.reactionEffects({eq:'H₂↑', effects:{gas:false}}).gas, false);
  assert.equal(Science.reactionEffects({eq:'AgCl↓', effects:{precipitate:false}}).precipitate, false);
  assert.deepEqual(Science.reactionEffects(), {
    gas:false, precipitate:false, heat:false, light:false, lightColor:null, precipitateColor:null,
    deposition:false, depositionColor:null
  });
  assert.deepEqual(
    Science.reactionEffects({eq:'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',effects:{deposition:true,depositionColor:'#d8d8d8'}}),
    {
      gas:false, precipitate:false, heat:false, light:false, lightColor:null, precipitateColor:null,
      deposition:true, depositionColor:'#d8d8d8'
    }
  );
});

test('orbital projection preserves 3D volume when viewed down its axis', ()=>{
  const edgeOn=Science.projectOrbitalLobe([0,0,1],100);
  assert.equal(edgeOn.screenLength,0);
  assert.ok(edgeOn.semiMajor>0);
  assert.equal(edgeOn.semiMajor,edgeOn.semiMinor);
  const sideOn=Science.projectOrbitalLobe([1,0,0],100);
  assert.ok(sideOn.semiMajor>sideOn.semiMinor);
  assert.equal(Science.projectOrbitalLobe([0,0,0],100).screenLength,0);
  assert.throws(()=>Science.projectOrbitalLobe([1,0],100), RangeError);
  assert.throws(()=>Science.projectOrbitalLobe([1,0,Number.NaN],100), RangeError);
  assert.throws(()=>Science.projectOrbitalLobe([1,0,0],Number.NaN), RangeError);
  assert.throws(()=>Science.projectOrbitalLobe([1,0,0],0), RangeError);
});

test('active animation clock excludes pauses and scheduler suspension', ()=>{
  assert.deepEqual(Science.advanceActiveTime(0,null,100), {elapsedMs:0,lastTimestamp:100});
  assert.deepEqual(Science.advanceActiveTime(20,100,116), {elapsedMs:36,lastTimestamp:116});
  assert.deepEqual(Science.advanceActiveTime(36,116,866), {elapsedMs:136,lastTimestamp:866});
  assert.deepEqual(Science.advanceActiveTime(136,866,900,true), {elapsedMs:136,lastTimestamp:900});
  assert.deepEqual(Science.advanceActiveTime(36,900,890), {elapsedMs:36,lastTimestamp:890});
  let slow={elapsedMs:0,lastTimestamp:0};
  for(let timestamp=120;timestamp<=1080;timestamp+=120){
    slow=Science.advanceActiveTime(slow.elapsedMs,slow.lastTimestamp,timestamp);
  }
  assert.deepEqual(slow,{elapsedMs:900,lastTimestamp:1080});
  assert.throws(()=>Science.advanceActiveTime(-1,null,0), RangeError);
  assert.throws(()=>Science.advanceActiveTime(0,Number.NaN,0), RangeError);
  assert.throws(()=>Science.advanceActiveTime(0,null,Number.NaN), RangeError);
  assert.throws(()=>Science.advanceActiveTime(0,null,0,false,-1), RangeError);
});

test('browser global receives the same science API', ()=>{
  const filename = path.resolve(__dirname, '../science.js');
  const context = {};
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, {filename});
  assert.equal(context.PeriodicScience.reactionBalance('2H₂ + O₂ → 2H₂O').balanced, true);
});
