import {
  BODY_PRESETS, SOLAR_MASS, gamma, schwarzschildRadius, lapse, clockRatio,
  tidalAcceleration, minimumRadius, dopplerFactor,
  aberrateDirection as aberrateVector, measuredPosition as measureVector
} from './relativity-observatory-model.js';

const root = document.getElementById('observatory');
const canvas = document.getElementById('ob-canvas');
const ctx = canvas.getContext('2d');
const byId = id => document.getElementById(`ob-${id}`);
function setText(id, value) {
  const element = byId(id);
  if (element.textContent !== value) element.textContent = value;
}
const text = (en, zh) => window.PhysicsUI?.language === 'zh-CN' ? zh : en;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function transformVector(fn, v, beta) {
  const p = fn({ x: v[0], y: v[1], z: v[2] }, beta);
  return [p.x, p.y, p.z];
}
const aberrateDirection = (v, beta) => transformVector(aberrateVector, v, beta);
const measuredPosition = (v, beta) => transformVector(measureVector, v, beta);
const minimumSceneRadius = () => Math.max(1.05, minimumRadius(BODY_PRESETS[state.body]) / BODY_PRESETS[state.body].radius);
const state = {
  mode: 'flight', view: 'measured', beta: .6, body: 'blackHole', observer: 8,
  radii: [1.15, 2.5, 7.5], elapsed: 0, times: [0, 0, 0], travel: 0,
  yaw: 0, pitch: 0, running: false, visible: false, raf: 0, last: 0,
  lastReadout: 0, renderCount: 0
};
const flightProbes = [[0, 0, 45], [14, 0, 0], [0, 0, -45]];
const colors = ['#ffd166', '#7ee8c5', '#ff6b9d'];
let width = 800;
let height = 480;
let pointer = null;

// This sky is synthetic: identical monochromatic sources, not real stellar spectra.
const stars = Array.from({ length: 620 }, (_, i) => {
  const z = 1 - 2 * (i + .5) / 620;
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  const r = Math.sqrt(1 - z * z);
  return { direction: [r * Math.cos(angle), r * Math.sin(angle), z], size: i % 7 === 0 ? 1.5 : .8 };
});

function body() { return BODY_PRESETS[state.body]; }
function unit(v) {
  const n = Math.hypot(...v);
  return n > 0 ? v.map(x => x / n) : [0, 0, 1];
}
function flightDirection(i) {
  const p = flightProbes[i];
  return unit([p[0], p[1], p[2] - state.travel]);
}
function rates() {
  return state.mode === 'gravity'
    ? state.radii.map(r => clockRatio(body().mass, r * body().radius, state.observer * body().radius))
    : state.times.map((_, i) => state.view === 'measured' ? 1 / gamma(state.beta) : dopplerFactor(state.beta, flightDirection(i)[2]));
}
function viewVector(v) {
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  const x = v[0] * cy - v[2] * sy;
  const z = v[0] * sy + v[2] * cy;
  return [x, v[1] * cp - z * sp, v[1] * sp + z * cp];
}
function projectVector(v) {
  const [x, y, z] = viewVector(v);
  if (z <= .025) return null;
  const f = height * .79;
  const sx = width / 2 + f * x / z;
  const sy = height / 2 - f * y / z;
  if (Math.abs(sx) > width * 8 || Math.abs(sy) > height * 8) return null;
  return { x: sx, y: sy, z, scale: f / z };
}
function project(p) {
  if (state.mode === 'gravity') return projectVector([p[0], p[1], p[2] - state.observer]);
  const v = [p[0], p[1], p[2] - state.travel];
  return projectVector(state.view === 'measured' ? measuredPosition(v, state.beta) : aberrateDirection(unit(v), state.beta));
}
function spectralColor(factor) {
  const wavelength = 550 / factor;
  if (wavelength < 380) return '#bda3ff';
  if (wavelength > 780) return '#ff6b9d';
  if (wavelength < 450) return '#9e9aff';
  if (wavelength < 495) return '#00d4ff';
  if (wavelength < 570) return '#7ee8c5';
  if (wavelength < 620) return '#ffd166';
  return '#ff9070';
}
function sampledLine(a, b, color, lineWidth = 1, samples = 10) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  let previous = null;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = project(a.map((x, j) => x + (b[j] - x) * t));
    if (p && previous && Math.abs(p.x - previous.x) < width && Math.abs(p.y - previous.y) < height) {
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(p.x, p.y);
    }
    previous = p;
  }
  ctx.stroke();
}
function cube(center, halfSize, color) {
  const vertices = [];
  for (let i = 0; i < 8; i++) vertices.push(center.map((v, j) => v + ((i >> j) & 1 ? 1 : -1) * halfSize));
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 3; j++) if (!(i & (1 << j))) sampledLine(vertices[i], vertices[i | (1 << j)], color, 1.3, 8);
  }
}
function drawSky() {
  for (const star of stars) {
    const optical = state.mode === 'flight' && state.view === 'optical';
    const direction = optical ? aberrateDirection(star.direction, state.beta) : star.direction;
    const p = projectVector(direction);
    if (!p || p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;
    const d = optical ? dopplerFactor(state.beta, star.direction[2]) : 1;
    ctx.globalAlpha = optical ? clamp(Math.sqrt(d) * .55, .18, .95) : .55;
    ctx.fillStyle = optical ? spectralColor(d) : '#e8ecff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function marker(p, label, color, seconds) {
  const q = project(p);
  if (!q || q.x < 22 || q.x > width - 22 || q.y < 25 || q.y > height - 25) return;
  const size = 14;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#0b0e1c';
  ctx.beginPath(); ctx.arc(q.x, q.y, size, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  const angle = seconds * Math.PI * 2 / 10 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + Math.cos(angle) * 10, q.y + Math.sin(angle) * 10); ctx.stroke();
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center'; ctx.fillStyle = color;
  ctx.fillText(label, q.x, q.y - 21);
}
function drawFlight() {
  const origin = Math.floor(state.travel / 20) * 20;
  for (let x = -24; x <= 24; x += 6) sampledLine([x, -5, origin - 60], [x, -5, origin + 200], '#00d4ff35', 1, 40);
  for (let z = origin - 60; z <= origin + 200; z += 10) sampledLine([-24, -5, z], [24, -5, z], '#00d4ff35', 1, 12);
  for (let z = origin - 40; z <= origin + 100; z += 20) {
    cube([-9, -1, z + 5], 2, '#ffd16690');
    cube([9, -1, z + 5], 2, '#7ee8c570');
  }
  // A segmented reference ruler is fixed in the station frame, parallel to motion.
  sampledLine([-5, -2, origin + 10], [-5, -2, origin + 20], '#ffd166', 3, 16);
  for (let z = origin + 10; z <= origin + 20; z++) sampledLine([-5.3, -2, z], [-4.7, -2, z], '#ffd166', 1, 2);
  flightProbes.forEach((p, i) => marker(p, String.fromCharCode(65 + i), state.view === 'optical' ? spectralColor(dopplerFactor(state.beta, flightDirection(i)[2])) : colors[i], state.times[i]));
}
function gravityPosition(i) {
  const a = [-.8, .95, 2.15][i];
  const r = state.radii[i];
  return unit([Math.sin(a), [.25, -.18, .12][i], Math.cos(a)]).map(v => v * r);
}
function drawBody() {
  const q = project([0, 0, 0]);
  if (!q) return;
  const radius = q.scale * state.observer / Math.sqrt(state.observer ** 2 - 1);
  if (q.x + radius < 0 || q.x - radius > width || q.y + radius < 0 || q.y - radius > height) return;
  const black = state.body === 'blackHole';
  const shade = ctx.createRadialGradient(q.x - radius * .28, q.y - radius * .3, 0, q.x, q.y, radius);
  shade.addColorStop(0, black ? '#0b0e1c' : '#e8ecff');
  shade.addColorStop(.6, black ? '#05060d' : body().color);
  shade.addColorStop(1, '#05060d');
  ctx.fillStyle = shade;
  ctx.beginPath(); ctx.arc(q.x, q.y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = black ? '#ffd166' : body().color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash(black ? [4, 4] : []);
  ctx.stroke(); ctx.setLineDash([]);
  // Latitude lines describe the coordinate sphere, not an accretion disk or shadow.
  ctx.strokeStyle = '#e8ecff25';
  for (const tilt of [-.5, 0, .5]) {
    ctx.beginPath(); ctx.ellipse(q.x, q.y + radius * tilt, radius * Math.sqrt(1 - tilt * tilt), radius * .15, -.25, 0, Math.PI * 2); ctx.stroke();
  }
}
function tidalArrows(position, i) {
  const radial = unit(position);
  const tangent = unit([radial[2], 0, -radial[0]]);
  const tide = tidalAcceleration(body().mass, state.radii[i] * body().radius, 2);
  const extent = .15 + .07 * Math.log10(1 + tide);
  const center = project(position);
  if (!center) return;
  function arrow(a, b) {
    const p = project(a), q = project(b);
    if (!p || !q) return;
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    ctx.strokeStyle = '#ff6b9d'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    ctx.lineTo(q.x - 6 * Math.cos(angle - .5), q.y - 6 * Math.sin(angle - .5));
    ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - 6 * Math.cos(angle + .5), q.y - 6 * Math.sin(angle + .5)); ctx.stroke();
  }
  for (const sign of [-1, 1]) {
    arrow(position.map((v, j) => v + sign * radial[j] * extent * .4), position.map((v, j) => v + sign * radial[j] * extent * 1.7));
    arrow(position.map((v, j) => v + sign * tangent[j] * extent * 1.3), position.map((v, j) => v + sign * tangent[j] * extent * .5));
  }
}
function drawGravity() {
  for (const r of [1.05, 2, 4, 8, 16]) {
    ctx.strokeStyle = '#00d4ff35'; ctx.lineWidth = 1;
    ctx.beginPath(); let previous = null;
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2;
      const p = project([r * Math.cos(a), -.45, r * Math.sin(a)]);
      if (previous && p) { ctx.moveTo(previous.x, previous.y); ctx.lineTo(p.x, p.y); }
      previous = p;
    }
    ctx.stroke();
  }
  const positions = state.radii.map((_, i) => gravityPosition(i));
  const behind = positions.map((p, i) => ({ p, i })).filter(({ p }) => p[2] < 0);
  const inFront = positions.map((p, i) => ({ p, i })).filter(({ p }) => p[2] >= 0);
  function probe({ p, i }) {
    sampledLine([0, 0, 0], p, '#e8ecff20', 1, 10);
    tidalArrows(p, i);
    marker(p, String.fromCharCode(65 + i), spectralColor(rates()[i]), state.times[i]);
  }
  behind.forEach(probe);
  drawBody();
  inFront.forEach(probe);
}
function drawClock(i) {
  const c = byId(`clock-${i}`), context = c.getContext('2d');
  context.clearRect(0, 0, 64, 64);
  context.strokeStyle = colors[i]; context.lineWidth = 1.5;
  context.beginPath(); context.arc(32, 32, 26, 0, 2 * Math.PI); context.stroke();
  for (let j = 0; j < 12; j++) {
    const a = j / 12 * 2 * Math.PI;
    context.beginPath(); context.moveTo(32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22); context.lineTo(32 + Math.cos(a) * 25, 32 + Math.sin(a) * 25); context.stroke();
  }
  const angle = state.times[i] / 10 * Math.PI * 2 - Math.PI / 2;
  context.lineWidth = 2.5; context.beginPath(); context.moveTo(32, 32); context.lineTo(32 + Math.cos(angle) * 19, 32 + Math.sin(angle) * 19); context.stroke();
}
function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#05060d'; ctx.fillRect(0, 0, width, height);
  drawSky();
  if (state.mode === 'flight') drawFlight(); else drawGravity();
  ctx.strokeStyle = '#e8ecff55'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(width / 2 - 5, height / 2); ctx.lineTo(width / 2 + 5, height / 2);
  ctx.moveTo(width / 2, height / 2 - 5); ctx.lineTo(width / 2, height / 2 + 5); ctx.stroke();
  for (let i = 0; i < 3; i++) drawClock(i);
  state.renderCount++;
}
function signalDescription(factor) {
  const wavelength = 550 / factor;
  const region = wavelength < 380 ? text('UV (false color)', '紫外（伪彩）') : wavelength > 780 ? text('IR (false color)', '红外（伪彩）') : text('visible', '可见光');
  return text(`550 nm → ${wavelength.toFixed(1)} nm · ${region}`, `550 nm → ${wavelength.toFixed(1)} nm · ${region}`);
}
function updateReadouts() {
  const current = rates();
  const g = gamma(state.beta);
  const gravity = state.mode === 'gravity';
  const optical = state.view === 'optical';
  byId('your-time').textContent = `${state.elapsed.toFixed(2)} s`;
  byId('speed-output').textContent = `${(state.beta * 100).toFixed(0)}% c`;
  byId('scene-title').textContent = gravity ? text('Supported clocks in a spherical exterior', '球对称外部空间的静止时钟') : optical ? text('Arriving light: aberration & Doppler', '到达的光：光行差与多普勒') : text('Simultaneous measurements in your frame', '你的参考系中的同时测量');
  setText('status', state.running && !window.PhysicsUI.motionPaused() ? text('Running', '运行中') : state.running ? text('Motion paused', '动画已暂停') : text('Ready / paused', '就绪 / 已暂停'));
  byId('play').textContent = state.running ? text('Pause experiment', '暂停实验') : text('Start experiment', '开始实验');
  byId('play').setAttribute('aria-pressed', String(state.running));
  byId('metric-label').textContent = gravity ? text('Your rate / infinity', '你的钟速 / 无穷远') : text('Lorentz factor γ', '洛伦兹因子 γ');
  byId('metric-value').textContent = gravity ? lapse(body().mass, state.observer * body().radius).toFixed(6) : g.toFixed(3);
  byId('metric-note').textContent = gravity ? text('Infinity is the time reference, not your local clock.', '无穷远是比较基准，不是你的本地时钟。') : text('Only lengths parallel to travel contract.', '只有平行于运动的长度收缩。');
  byId('secondary-label').textContent = gravity ? text('Surface / horizon radius R', '表面 / 视界半径 R') : text('10 light-second ruler', '10 光秒的标尺');
  byId('secondary-value').textContent = gravity ? `${(body().radius / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km` : `${(10 / g).toFixed(2)} ${text('light-s', '光秒')}`;
  byId('secondary-note').textContent = gravity ? text('Scene sizes are rescaled; numerical rates are not.', '场景大小经过缩放，数值钟速没有夸大。') : text('Measured length, not a photograph.', '这是测得的长度，不是照片外观。');
  byId('forward').textContent = `${dopplerFactor(state.beta, 1).toFixed(3)} ×`;
  byId('rear').textContent = `${dopplerFactor(state.beta, -1).toFixed(3)} ×`;
  byId('station-rate').textContent = `${(1 / g).toFixed(3)} ×`;
  byId('flight-explanation').textContent = optical ? text('Turn around: incoming directions bunch toward your travel direction. Approaching signals arrive faster; receding ones slower. These are received rates, not the measured 1/γ clock rate.', '转身看看：光线方向向运动前方集中。迎面信号到达更快，背后信号更慢。这是接收速率，不是测得的 1/γ 钟速。') : text('Cyan rails and gold rulers belong to the stationary field. Your simultaneous measurements contract their length along travel. All three moving station clocks run at 1/γ; your own clock stays normal.', '青色轨道和金色标尺属于静止场。在你的同时测量中，沿运动方向的长度收缩。三个运动站点的钟速均为 1/γ，你自己的时钟始终正常。');
  const boundary = state.body === 'blackHole' ? text('Dashed sphere = horizon boundary, not the black-hole shadow.', '虚线球面表示视界边界，不是黑洞阴影。') : text('Solid sphere = stellar surface, not a horizon.', '实线球面表示恒星表面，不是视界。');
  byId('scene-note').textContent = gravity ? text(`Coordinate perspective, NOT gravitational ray tracing. ${boundary} Pink arrows = radial stretching / transverse squeezing (log-scaled).`, `坐标透视，不是引力光线追踪。${boundary}粉色箭头表示径向拉伸 / 横向压缩（对数长度）。`) : optical ? text('Synthetic 550 nm beacons. Violet / red mark UV / IR with false color; brightness is schematic. Look direction is independent of velocity. One light-second = one scene distance unit.', '合成 550 nm 信标。紫色 / 红色以伪彩表示紫外 / 红外，亮度为示意。视线方向独立于速度。一个场景距离单位为一光秒。') : text('3D coordinate view at simultaneous ship time, not what a camera sees. Gold marks a 10 light-second rest-length ruler; the gold boxes have equal rest size.', '同一飞船时间的三维坐标视图，不是相机照片。金色标记表示静止长度 10 光秒的标尺，金色箱子的静止尺寸相同。');
  const rmin = minimumSceneRadius();
  byId('body-facts').textContent = `${text(body().nameEn, body().nameZh)} · ${(body().mass / SOLAR_MASS).toFixed(1)} M☉ · rₛ = ${(schwarzschildRadius(body().mass) / 1000).toFixed(2)} km`;
  byId('observer-output').textContent = `${state.observer.toFixed(2)} R · ${(state.observer * body().radius / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  for (let i = 0; i < 3; i++) {
    const letter = String.fromCharCode(65 + i);
    byId(`probe-name-${i}`).textContent = gravity ? text(`${letter} · movable clock`, `${letter} · 可移动时钟`) : [`${letter} · +45 ${text('light-s', '光秒')}`, text(`${letter} · side at launch`, `${letter} · 起点侧方`), `${letter} · −45 ${text('light-s', '光秒')}`][i];
    byId(`radius-${i}`).min = String(rmin);
    byId(`radius-output-${i}`).textContent = `${state.radii[i].toFixed(2)} R`;
    byId(`rate-${i}`).textContent = `${current[i].toFixed(6)} ×`;
    byId(`time-${i}`).textContent = `${state.times[i].toFixed(2)} s`;
    setText(`rate-label-${i}`, gravity ? text('local rate / your clock', '本地钟速 / 你的钟速') : optical ? text('received tick rate / your clock', '接收滴答速率 / 你的钟速') : text('measured rate / your clock', '测得钟速 / 你的钟速'));
    setText(`time-label-${i}`, gravity ? text('Probe clock counter', '探针时钟计数器') : optical ? text('Received-signal counter', '接收信号计数器') : text('Measured clock counter', '测量时钟计数器'));
    byId(`signal-${i}`).textContent = gravity || optical ? signalDescription(current[i]) : text('Equal measured rate. Switch to arriving light to separate propagation from time dilation.', '测得的钟速相同。切换到到达的光，区分传播效应与钟慢。');
    byId(`tide-${i}`).textContent = text(`Radial Δa across 2 m: ${tidalAcceleration(body().mass, state.radii[i] * body().radius, 2).toExponential(2)} m/s²`, `跨 2 m 的径向差分加速度：${tidalAcceleration(body().mass, state.radii[i] * body().radius, 2).toExponential(2)} m/s²`);
  }
  setText('conclusion', gravity ? text('Move A toward the boundary: its clock and light slow relative to yours. Move your own station closer than a probe: that probe runs faster and its light blueshifts. Sun and white-dwarf effects are genuinely small; six-decimal readouts reveal them without faking dramatic slow motion.', '把 A 移向边界：相对你的观测站，它的钟速与光频率变低。若你移到比探针更近的位置，探针的钟会更快，光会蓝移。太阳与白矮星的效应确实很小；六位小数揭示差别，不虚构明显的慢动作。') : text('Try 90% c, then switch views. A shortened measured ruler and a distorted optical scene are different experiments. In the optical view each source keeps its place in the station frame while your motion changes its direction and received rate continuously.', '试试 90% 光速，再切换视图。测得的短标尺和光学视图的畸变是两个不同实验。光学视图中，每个源在站点系里保持固定位置，你的运动让其方向和接收速率连续改变。'));
}
function rewind() {
  state.elapsed = 0; state.times.fill(0); state.travel = 0; state.last = 0; state.lastReadout = 0;
}
function canRun() { return state.running && state.visible && !document.hidden && !window.PhysicsUI.motionPaused(); }
function cancel() {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = 0; state.last = 0;
}
function schedule() {
  if (canRun() && !state.raf) state.raf = requestAnimationFrame(frame);
}
function frame(now) {
  state.raf = 0;
  if (!canRun()) { state.last = 0; return; }
  const dt = state.last ? Math.min((now - state.last) / 1000, .08) : 0;
  state.last = now;
  const current = rates();
  state.elapsed += dt;
  current.forEach((r, i) => { state.times[i] += r * dt; });
  if (state.mode === 'flight') state.travel += state.beta * gamma(state.beta) * dt;
  draw();
  if (now - state.lastReadout > 100) { updateReadouts(); state.lastReadout = now; }
  schedule();
}
function refresh() { updateReadouts(); draw(); schedule(); }
function setMode(mode) {
  state.mode = mode;
  state.yaw = mode === 'gravity' ? Math.PI : 0; state.pitch = 0;
  rewind();
  root.querySelectorAll('[data-ob-mode]').forEach(b => {
    const active = b.dataset.obMode === mode;
    b.setAttribute('aria-selected', String(active));
    b.tabIndex = active ? 0 : -1;
  });
  byId('flight-controls').hidden = mode !== 'flight';
  byId('gravity-controls').hidden = mode !== 'gravity';
  root.querySelectorAll('.ob-probe-position, .ob-tide').forEach(el => { el.hidden = mode !== 'gravity'; });
  refresh();
}
root.querySelectorAll('[data-ob-mode]').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.obMode));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const mode = event.key === 'Home' ? 'flight' : event.key === 'End' ? 'gravity' : state.mode === 'flight' ? 'gravity' : 'flight';
    setMode(mode); byId(`${mode}-tab`).focus();
  });
});
root.querySelectorAll('[data-ob-view]').forEach(button => button.addEventListener('click', () => {
  state.view = button.dataset.obView;
  root.querySelectorAll('[data-ob-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  rewind(); refresh();
}));
byId('speed').addEventListener('input', () => { state.beta = Number(byId('speed').value) / 100; rewind(); refresh(); });
byId('observer').addEventListener('input', () => { state.observer = Number(byId('observer').value); rewind(); refresh(); });
for (let i = 0; i < 3; i++) byId(`radius-${i}`).addEventListener('input', () => { state.radii[i] = Number(byId(`radius-${i}`).value); rewind(); refresh(); });
byId('body').addEventListener('change', () => {
  state.body = byId('body').value;
  const min = minimumSceneRadius();
  byId('observer').min = String(min);
  state.observer = Math.max(min, state.observer); byId('observer').value = String(state.observer);
  state.radii = state.radii.map((r, i) => {
    const next = Math.max(min, r); byId(`radius-${i}`).min = String(min); byId(`radius-${i}`).value = String(next); return next;
  });
  rewind(); refresh();
});
byId('play').addEventListener('click', () => {
  state.running = !state.running;
  if (state.running) window.PhysicsUI.requestMotion(); else cancel();
  refresh();
});
byId('reset').addEventListener('click', () => {
  state.running = false; cancel(); rewind();
  state.yaw = state.mode === 'gravity' ? Math.PI : 0; state.pitch = 0;
  refresh();
});
root.querySelectorAll('[data-ob-preset]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.obPreset === 'flight') { state.beta = .9; byId('speed').value = '90'; setMode('flight'); }
  else {
    state.observer = 8; byId('observer').value = '8'; byId('observer').min = String(minimumSceneRadius());
    state.radii = [1.15, 2.5, 7.5]; state.radii.forEach((r, i) => { byId(`radius-${i}`).value = String(r); });
    setMode('gravity');
  }
}));
root.querySelectorAll('[data-ob-look]').forEach(button => button.addEventListener('click', () => {
  const base = state.mode === 'gravity' ? Math.PI : 0;
  state.yaw = base + (button.dataset.obLook === 'side' ? Math.PI / 2 : button.dataset.obLook === 'back' ? Math.PI : 0);
  state.pitch = 0; draw();
}));
canvas.addEventListener('pointerdown', e => {
  pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll: true });
});
canvas.addEventListener('pointermove', e => {
  if (!pointer || pointer.id !== e.pointerId) return;
  state.yaw -= (e.clientX - pointer.x) * .006;
  state.pitch = clamp(state.pitch + (e.clientY - pointer.y) * .006, -1.3, 1.3);
  pointer.x = e.clientX; pointer.y = e.clientY; draw();
});
function releasePointer() { pointer = null; }
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);
canvas.addEventListener('lostpointercapture', releasePointer);
canvas.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  state.yaw += e.key === 'ArrowLeft' ? -.15 : e.key === 'ArrowRight' ? .15 : 0;
  state.pitch = clamp(state.pitch + (e.key === 'ArrowUp' ? .1 : e.key === 'ArrowDown' ? -.1 : 0), -1.3, 1.3); draw();
});
byId('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (root.requestFullscreen) await root.requestFullscreen();
  } catch {
    byId('status').textContent = text('Fullscreen unavailable; the embedded scene still works.', '无法全屏；嵌入场景仍可使用。');
  }
});
if (!root.requestFullscreen) byId('fullscreen').hidden = true;
function resize() {
  const rect = canvas.getBoundingClientRect();
  width = Math.max(1, rect.width); height = Math.max(1, rect.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
}
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(entries => {
  state.visible = entries[0].isIntersecting;
  if (!state.visible) cancel(); else schedule();
}, { threshold: .01 }).observe(root);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); else schedule(); });
document.addEventListener('physics-motion', e => {
  if (e.detail?.paused) cancel();
  if (e.detail?.freezeFrame) rewind();
  refresh();
});
document.addEventListener('physics-language', refresh);
window.__relativityObservatory = Object.freeze({
  snapshot: () => ({
    mode: state.mode, view: state.view, beta: state.beta, gamma: gamma(state.beta),
    ruler: 10 / gamma(state.beta), rates: rates(), times: [...state.times], elapsed: state.elapsed,
    travel: state.travel, radii: [...state.radii], observer: state.observer,
    body: state.body, running: state.running, visible: state.visible,
    yaw: state.yaw, pitch: state.pitch, renderCount: state.renderCount,
    probePositions: state.mode === 'gravity' ? state.radii.map((_, i) => gravityPosition(i)) : flightProbes,
    projections: (state.mode === 'gravity' ? state.radii.map((_, i) => gravityPosition(i)) : flightProbes).map(project)
  })
});
setMode('flight');
resize();
