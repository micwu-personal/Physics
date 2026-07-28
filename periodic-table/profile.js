#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {performance} = require('node:perf_hooks');
const Science = require('./science.js');

const root = __dirname;
const context = vm.createContext({window:{CURRENT_LANG:'en'}, PeriodicScience:Science});
const data = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
vm.runInContext(`${data}\nglobalThis.__configs=Object.values(ELEMENTS).map(el=>el.config);`, context);

const before = process.memoryUsage().heapUsed;
const start = performance.now();
for (let pass=0; pass<1000; pass++) {
  context.__configs.forEach(config=>Science.shellCountsFromConfig(config));
}
const elapsedMs = performance.now() - start;
const heapDeltaBytes = process.memoryUsage().heapUsed - before;
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const report = {
  operation:'118,000 electron-shell calculations',
  cpuMs:Number(elapsedMs.toFixed(2)),
  meanMicroseconds:Number((elapsedMs * 1000 / 118000).toFixed(3)),
  heapDeltaKiB:Number((heapDeltaBytes / 1024).toFixed(1)),
  continuousRafSites:(app.match(/scheduleActiveFrame\(canvas, frame\)/g) || []).length,
  unguardedContinuousRafSites:(app.match(/requestAnimationFrame\(frame\)/g) || []).length,
  visibilityGuard:app.includes("visibilitychange"),
  offscreenGuard:app.includes('IntersectionObserver'),
  reducedMotionGuard:app.includes('prefers-reduced-motion')
};
console.log(JSON.stringify(report, null, 2));
