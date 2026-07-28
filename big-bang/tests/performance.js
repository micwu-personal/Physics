const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {performance} = require('node:perf_hooks');
const vm = require('node:vm');

const corePath = path.resolve(__dirname, '..', 'core.js');
const stylesPath = path.resolve(__dirname, '..', 'styles.css');
const source = fs.readFileSync(corePath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const api = vm.runInThisContext(`${source}\n;BigBangCore`, {filename:corePath});

const driftKeyframes = styles.match(/@keyframes drift\{([^}]|\}(?!\s*@))*\}/)?.[0];
assert(driftKeyframes, 'The ambient star drift animation must exist');
assert.match(driftKeyframes, /transform:translate3d\(/, 'Star drift must stay on the compositor');
assert.doesNotMatch(driftKeyframes, /background-position/, 'Star drift must not repaint the viewport');
assert.match(styles, /#bg-stars\{[\s\S]*?will-change:transform;/, 'The star layer must remain compositor-promoted');

let scheduled = 0;
const controller = api.createAnimationController({
  requestFrame(){ scheduled++; return scheduled; },
  cancelFrame(){ scheduled--; },
  draw(){}
});
controller.setDocumentVisible(false);
controller.start();
assert.equal(scheduled, 0, 'Hidden pages must schedule zero animation frames');
controller.setDocumentVisible(true);
assert.equal(scheduled, 1, 'Active pages must schedule exactly one animation frame');
controller.start();
assert.equal(scheduled, 1, 'Repeated starts must not duplicate the RAF loop');
controller.setReducedMotion(true);
assert.equal(scheduled, 0, 'Reduced-motion mode must schedule zero animation frames');

const stars = Array.from({length:180}, (_, index)=>({
  x:(index%20-10)*80,
  y:(Math.floor(index/20)-4)*80,
  z:100+index*3,
  hue:index%2 ? 45 : 200
}));
let samples = 0;
const frames = 10000;
const start = performance.now();
for(let frame=0; frame<frames; frame++){
  api.advanceStarfield(stars, 1440, 900, ()=>0.5, ()=>{ samples++; });
}
const elapsed = performance.now()-start;
const millisecondsPerFrame = elapsed/frames;
console.log(`Performance: ${frames} starfield updates × 180 stars in ${elapsed.toFixed(2)} ms (${millisecondsPerFrame.toFixed(4)} ms/update, ${samples} visible projections).`);
