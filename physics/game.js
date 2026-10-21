import { buoyancy, clamp, MAX_HEAT, waterState } from './game-model.js';
import { createRenderer } from './game-renderer.js';
import { createAdventureController } from './game-adventure.js';
import { createDeviceLook } from './game-device-look.js';

const $ = id => document.getElementById(id);
const canvas = $('game-canvas');
const storageKey = 'physics.game.v1';
const copy = {
  coast: ['Coastal workshop · human scale', '海岸工坊 · 日常尺度'],
  molecules: ['Inside a drop · fictional scale lens', '进入水滴 · 虚构尺度透镜'],
  heat: ['The energy chamber · same 10 g sample', '能量室 · 同一份 10 g 样品'],
  coastTitle: ['Will it float?', '它会浮起来吗？'],
  coastTask: ['Approach the water tank. Predict what a 1 L body will do, release it, then compare its weight with the displaced water. You can test every material.', '走近水槽。预测一个 1 L 物体会怎样，释放后比较重力与排开水的重量。每种材质都可以重复试验。'],
  moleculesTitle: ['A drop is a crowd.', '水滴里面，是一个群体。'],
  moleculesTask: ['Your return anchor is the shore. Compare all three phases in this qualitative model. Walk around the sample: what stays fixed, and what changes neighbors?', '海岸是你的返回锚点。比较这个定性模型的三种相态。绕着样品走走：什么基本固定，什么会交换邻居？'],
  heatTitle: ['Where does the heat go?', '热量去了哪里？'],
  heatTask: ['Predict where heating stops raising temperature. Add heat, then record a melting or boiling plateau.', '预测供热时温度会在哪里停止升高。继续加热，记录融化或沸腾平台。'],
  motionAllowed: ['Motion allowed', '动画许可：开'], motionBlocked: ['Motion disabled', '动画许可：关'],
  motionPermission: ['Global animation permission. Begin or Resume exploring controls game playback.', '全局动画许可；“开始／继续探索”控制游戏的实际播放。'],
  schematic: ['Teaching scene · sizes enlarged; quantities calculated', '教学场景 · 尺寸放大，数值按模型计算'],
  microCaption: ['Molecular schematic · not measured trajectories or molecular dynamics', '分子示意 · 不是测量轨迹或分子动力学'],
  playing: ['Exploring', '探索中'], paused: ['Paused · controls still work', '已暂停 · 操作仍可用'],
  rescuePlaying: ['Rescue in progress', '救援进行中'], rescuePaused: ['Paused · resume the rescue', '已暂停 · 继续救援后可行动'],
  resume: ['Resume exploring', '继续探索'], pause: ['Pause', '暂停'], begin: ['Begin exploring', '开始探索'],
  released: ['Released. The motion is illustrative; Measure reports the predicted equilibrium, not a time-resolved fluid calculation.', '已释放。运动过程为示意；“测量”显示模型预测的平衡值，不是随时间求解的流体结果。'],
  correct: ['Your prediction agrees with the model. Try another material, or follow the water into the scale lens.', '你的预测符合模型。试试另一种材质，或跟随水进入尺度透镜。'],
  revise: ['The observation differs from your prediction. Compare weight with maximum buoyancy and revise it—no penalty for learning.', '观察与你的预测不同。比较重力和最大浮力，再修正想法——学习没有答错惩罚。'],
  compareMore: ['Compare ice, liquid and vapor before saving. These are three states of the same substance, not three different molecules.', '记录之前先比较冰、液态水和水蒸气。它们是同一物质的三种状态，不是三种不同分子。'],
  compared: ['Comparison saved: solid neighbors vibrate, liquid neighbors exchange, gas molecules spread. Now connect the change to supplied energy.', '已记录：固体邻居振动，液体邻居交换，气体分子分散。现在把这些改变与输入的能量联系起来。'],
  needPlateau: ['Find a phase mixture: choose heat between 0.42–3.76 kJ or 7.94–30.50 kJ. Add a little more: temperature stays at 0 or 100 °C.', '先找到两相混合：热量取 0.42–3.76 kJ 或 7.94–30.50 kJ。再增加一点，温度仍保持 0 或 100 °C。'],
  recorded: ['Plateau saved. Added energy changes the phase fraction, not the temperature. Cool it down to reverse the journey; your next chapter is in the roadmap.', '已记录平台：输入能量改变相比例而非温度。冷却可以沿原路返回；后续章节在路线图中。'],
  sensible: ['Away from a phase boundary, added heat raises temperature. The illustrated molecular speed follows absolute temperature, not the heat slider directly.', '离开相变平台后，输入热量使温度升高。示意分子速度随绝对温度变化，而不是直接随热量滑块变化。'],
  latent: ['Temperature holds steady. Energy changes the phase fraction; it does not continuously increase molecular speed on this plateau.', '温度保持不变。能量改变相比例；在这个平台上，它不会不断提高分子运动速度。'],
  ice: ['Ice', '冰'], melting: ['Melting · 0 °C plateau', '融化 · 0 °C 平台'], liquid: ['Liquid water', '液态水'], boiling: ['Boiling · 100 °C plateau', '沸腾 · 100 °C 平台'], steam: ['Water vapor', '水蒸气'],
  sink: ['Sinks · no floating equilibrium', '下沉 · 无浮动平衡'], neutral: ['100% · neutral buoyancy', '100% · 中性浮力'],
  saved: ['Saved only in this browser.', '只保存在本浏览器。'], noStorage: ['Storage unavailable. Your notes work until this page is closed.', '存储不可用；观察笔记可用到关闭本页为止。'],
  empty: ['No observations yet. Release a body and measure it.', '还没有记录。先释放物体并测量。'],
  noteCoast: ['Buoyancy: equilibrium depends on body density relative to water; wood floats and steel sinks.', '浮力：平衡取决于物体与水的相对密度；木材浮起，钢材下沉。'],
  noteMicro: ['Phase comparison: the same molecules organize and move differently.', '相态对比：同样的分子，组织与运动方式不同。'],
  noteHeat: ['Latent heat: a phase change absorbs energy at constant temperature in this fixed-pressure model.', '潜热：在这个固定压力模型中，相变在恒温下吸收能量。'],
  nextLens: ['Use the scale lens →', '使用尺度透镜 →'], nextHeat: ['Follow the energy →', '追踪能量 →'], return: ['Return to the shore ↩', '返回海岸 ↩'],
  reset: ['Journey reset. Your previous local notes have been cleared.', '旅程已重置，之前的本地笔记已清除。'],
  lockFailed: ['Mouse lock is unavailable. Drag to look, or use the arrow keys.', '鼠标锁定不可用。请拖拽观察，或使用方向键。'],
  lockActive: ['Mouse look · double-click the scene or press Escape to release and pause', '鼠标视角 · 双击场景或按 Escape 退出并暂停'],
  expandView: ['Expand view', '展开视图'], exitView: ['Exit view', '退出视图'],
  stopLook: ['Stop looking', '停止视角'], mouseLook: ['Mouse look', '鼠标视角'],
  deviceLook: ['Device look', '设备视角'], deviceStop: ['Stop device look', '停止设备视角'],
  deviceOff: ['Rotate to look; hold arrows to walk. Physical walking is not tracked.', '转动设备观察，长按箭头行走；不追踪真实行走。'],
  deviceRequesting: ['Allow device orientation in the browser prompt. No camera is used.', '请在浏览器提示中允许设备方向访问；不启用相机。'],
  deviceWaiting: ['Hold the device comfortably. Resume play, then turn to look.', '舒适地握住设备，继续游戏后转动观察。'],
  deviceActive: ['Rotation only · physical walking is not tracked. Hold arrows to move.', '仅追踪转动，不追踪真实行走位移。长按箭头在游戏中移动。'],
  devicePaused: ['Device look paused. Resume to recalibrate without a view jump.', '设备视角已暂停；继续后重新校准，视线不会跳转。'],
  deviceDenied: ['Orientation permission was not granted. Use drag and arrows, or allow access in browser settings and retry.', '未获设备方向许可。可拖拽与按箭头操作，或在浏览器设置中允许后重试。'],
  deviceUnavailable: ['Device orientation is unavailable here. Use drag and arrows.', '此处无法使用设备方向传感器；请拖拽与按箭头操作。'],
  deviceNoReadings: ['No usable orientation readings arrived. Use drag and arrows, or retry on a supported device.', '未收到有效设备方向数据。请拖拽与按箭头操作，或在支持的设备上重试。']
};
const text = key => copy[key][document.documentElement.lang === 'zh-CN' ? 1 : 0];
const state = {
  scene: 'coast', camera: { x:0, y:1.65, z:6, yaw:0, pitch:0 }, anchor: null,
  density:650, heat:0, time:0, releaseAge:0, released:false, playing:false, started:false,
  heater:0, completed:[false,false,false], visited:new Set([0]), visible:true,
  storage:true, message:'', dpr:Math.min(window.devicePixelRatio || 1, 2)
};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved?.version === 1 && Array.isArray(saved.completed) && saved.completed.length === 3 && saved.completed.every(value => typeof value === 'boolean')) {
    state.completed = saved.completed;
  }
} catch { state.storage = false; }
let renderer;
try { renderer = createRenderer(canvas); } catch { renderer = null; }
$('gpu-message').hidden = Boolean(renderer);
let frames = 0, raf = 0, last = 0, nextReadout = 0, dragging = null;
const keys = new Set();
state.mode = renderer ? 'adventure' : 'lab';
const adventure = createAdventureController(state,{change,play,getGpu:() => Boolean(renderer)});
let expanded = false, mouseWanted = false, mouseRequest = 0;
const deviceLook = createDeviceLook({environment:window,getCamera:() => state.camera,
  isActive:() => Boolean(renderer) && state.playing && state.visible && !document.hidden,onStatus:refreshLook});

function refreshLook() {
  const look = deviceLook.snapshot(), locked = document.pointerLockElement === canvas;
  const phaseKeys = {off:'deviceOff',requesting:'deviceRequesting',waiting:'deviceWaiting',active:'deviceActive',paused:'devicePaused',denied:'deviceDenied',unavailable:'deviceUnavailable',noReadings:'deviceNoReadings'};
  $('device-look').textContent = text(look.enabled || look.pending ? 'deviceStop' : 'deviceLook');
  $('device-look').setAttribute('aria-pressed',String(look.enabled)); $('device-look').disabled = !renderer;
  $('device-recenter').disabled = !look.enabled;
  $('device-status').textContent = text(phaseKeys[look.phase]);
  $('look-stop').hidden = !look.enabled && !look.pending && !locked && !mouseWanted;
  $('look-stop').textContent = text('stopLook');
  $('capture-hint').hidden = !locked; $('capture-hint').textContent = text('lockActive');
  $('mouse-lock').textContent = text(locked || mouseWanted ? 'stopLook' : 'mouseLook');
  $('view-toggle').textContent = text(expanded ? 'exitView' : 'expandView');
  $('view-toggle').setAttribute('aria-expanded',String(expanded)); $('view-toggle').disabled = !renderer;
  $('view-play').textContent = text(state.playing ? 'pause' : 'resume');
  $('view-play').setAttribute('aria-pressed',String(state.playing));
  const mission = adventure.diagnostic();
  $('view-play').disabled = !renderer || state.mode === 'adventure' && (!mission.started || mission.won || mission.lost);
  document.querySelector('.world').dataset.looking = String(look.enabled || look.pending || locked || mouseWanted);
}
function releaseMouse() { mouseWanted = false; mouseRequest++; if (document.pointerLockElement === canvas) document.exitPointerLock(); }
function stopLook() { deviceLook.disable(); play(false); }
function setExpanded(value) {
  expanded = value; document.body.classList.toggle('game-expanded',value);
  for (const element of document.querySelectorAll('.game-nav,.notebook,.guide,.skip-link,.reference-pane')) element.inert = value;
  if (!value) stopLook();
  change(); (value ? canvas : $('view-toggle')).focus();
}

function save() {
  try { localStorage.setItem(storageKey,JSON.stringify({ version:1,completed:state.completed })); }
  catch { state.storage = false; }
}
function render() { if (renderer) renderer.render(state); frames++; }
function refresh() {
  document.querySelector('.world').dataset.scene = state.scene;
  $('welcome').hidden = state.completed[0];
  const motion = document.querySelector('.motion-toggle');
  motion.textContent = text(window.PhysicsUI.motionPaused() ? 'motionBlocked' : 'motionAllowed');
  motion.setAttribute('aria-pressed',String(!window.PhysicsUI.motionPaused()));
  motion.setAttribute('aria-label',text('motionPermission')); motion.title = text('motionPermission');
  $('place').textContent = text(state.scene);
  $('scene-caption').textContent = text(state.scene === 'coast' ? 'schematic' : 'microCaption');
  $('play-status').textContent = text(state.mode === 'adventure' ? state.playing ? 'rescuePlaying' : 'rescuePaused' : state.playing ? 'playing' : 'paused');
  $('play').textContent = text(state.playing ? 'pause' : state.started ? 'resume' : 'begin');
  $('play').setAttribute('aria-pressed', String(state.playing));
  $('task-title').textContent = text(`${state.scene}Title`); $('task-copy').textContent = text(`${state.scene}Task`);
  for (const scene of ['coast','molecules','heat']) {
    $(`${scene === 'molecules' ? 'molecule' : scene}-tools`).hidden = state.scene !== scene;
  }
  for (const button of document.querySelectorAll('[data-scene]')) {
    const name = button.dataset.scene;
    button.disabled = name === 'molecules' ? !state.completed[0] : name === 'heat' ? !state.completed[1] : false;
    if (name === state.scene) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
  }
  const body = buoyancy(state.density);
  $('weight').textContent = `${body.weight.toFixed(2)} N`;
  $('immersion').textContent = !body.floating ? text('sink') : state.density === 1000 ? text('neutral') : `${(body.submergedFraction*100).toFixed(0)}%`;
  $('measure').disabled = !state.released;
  const water = waterState(state.heat);
  $('heat').value = state.heat;
  $('heat-value').textContent = `${water.heat.toFixed(2)} kJ`;
  $('temperature').textContent = `${water.temperature.toFixed(1)} °C`;
  $('phase-name').textContent = text(water.phase);
  for (const phase of ['solid','liquid','gas']) $(`${phase}-bar`).style.width = `${water[phase]*100}%`;
  $('fractions').textContent = document.documentElement.lang === 'zh-CN'
    ? `固 ${Math.round(water.solid*100)}% · 液 ${Math.round(water.liquid*100)}% · 气 ${Math.round(water.gas*100)}%`
    : `Solid ${Math.round(water.solid*100)}% · liquid ${Math.round(water.liquid*100)}% · gas ${Math.round(water.gas*100)}%`;
  $('scene-instrument').hidden = state.scene !== 'heat';
  $('scene-quantities').textContent = `${$('heat-value').textContent} · ${$('temperature').textContent}`;
  $('scene-fractions').textContent = $('fractions').textContent;
  $('thermal-note').textContent = text(water.phase === 'melting' || water.phase === 'boiling' ? 'latent' : 'sensible');
  $('heat-up').setAttribute('aria-pressed',String(state.heater === 1)); $('cool').setAttribute('aria-pressed',String(state.heater === -1));
  $('feedback').textContent = state.message ? text(state.message) : '';
  $('next').textContent = text(state.scene === 'coast' ? 'nextLens' : state.scene === 'molecules' ? 'nextHeat' : 'return');
  $('next').disabled = state.scene === 'coast' ? !state.completed[0] : state.scene === 'molecules' ? !state.completed[1] : false;
  $('notes').replaceChildren();
  for (const [i,key] of ['noteCoast','noteMicro','noteHeat'].entries()) {
    if (state.completed[i]) { const li = document.createElement('li'); li.textContent = text(key); $('notes').append(li); }
  }
  if (!state.completed.some(Boolean)) { const li = document.createElement('li'); li.textContent = text('empty'); $('notes').append(li); }
  $('storage-status').textContent = text(state.storage ? 'saved' : 'noStorage');
  $('approach').textContent = document.documentElement.lang === 'zh-CN' ? '靠近实验 · E' : 'Approach experiment · E';
  canvas.setAttribute('aria-label',canvas.dataset.ariaEn);
  if (document.documentElement.lang === 'zh-CN') canvas.setAttribute('aria-label',canvas.dataset.ariaZh);
  adventure.refresh(); refreshLook();
}
function change() { refresh(); render(); }
function approach() {
  state.camera = { x:0,y:1.65,z:state.scene === 'coast' ? -1 : 2.2,yaw:0,pitch:state.scene === 'coast' ? -.10 : .10 };
  change();
}
function scene(next) {
  if (state.scene === 'coast' && next !== 'coast') state.anchor = {...state.camera};
  state.scene = next; state.heater = 0; state.message = ''; state.time = 0;
  state.heat = next === 'molecules' ? Number($('phase-preview').value) : 0;
  if (next === 'coast' && state.anchor) state.camera = {...state.anchor}; else approach();
  change();
}
function move(direction, distance) {
  if (state.mode === 'adventure') return adventure.move(direction,distance);
  const angle = state.camera.yaw;
  const forward = Number(direction === 'forward') - Number(direction === 'back');
  const right = Number(direction === 'right') - Number(direction === 'left');
  const x = clamp(state.camera.x + (forward*Math.sin(angle)+right*Math.cos(angle))*distance,-7.5,7.5);
  const z = clamp(state.camera.z + (-forward*Math.cos(angle)+right*Math.sin(angle))*distance,-10,10);
  if (state.scene === 'coast' && Math.abs(x) < 1.9 && z < -2.6 && z > -6.5) return;
  state.camera.x = x; state.camera.z = z;
}
function schedule() { if (!raf && state.playing && state.visible && !document.hidden) raf = requestAnimationFrame(tick); }
function play(value) {
  state.playing = value; keys.clear(); adventure.clearHeld();
  if (value) { state.started = true; window.PhysicsUI.requestMotion(); }
  else { cancelAnimationFrame(raf); raf = 0; last = 0; dragging = null; releaseMouse(); }
  deviceLook.sync(); change(); schedule();
}
function tick(now) {
  raf = 0;
  if (!state.playing || !state.visible || document.hidden) { last = 0; return; }
  const dt = last ? clamp((now-last)/1000,0,.05) : 0; last = now;
  state.time += dt; if (state.released) state.releaseAge += dt;
  if (state.mode === 'adventure') adventure.update(dt,keys);
  else for (const direction of keys) move(direction,dt*2.7);
  if (state.mode === 'lab' && state.heater && state.scene === 'heat') {
    state.heat = clamp(state.heat+state.heater*.75*dt,0,MAX_HEAT);
    if (state.heat === 0 || state.heat === MAX_HEAT) state.heater = 0;
  }
  if (now >= nextReadout) { refresh(); nextReadout = now + 160; }
  render(); schedule();
}
$('play').addEventListener('click',() => play(!state.playing));
$('approach').addEventListener('click',() => state.mode === 'adventure' ? adventure.face() : approach());
$('density').addEventListener('change',() => {
  state.density = Number($('density').value); state.released = false; state.releaseAge = 0; state.message = ''; change();
});
$('release').addEventListener('click',() => { approach(); state.released = true; state.releaseAge = 0; state.message = 'released'; play(true); });
$('measure').addEventListener('click',() => {
  const actual = state.density < 1000 ? 'float' : state.density === 1000 ? 'neutral' : 'sink';
  state.message = $('prediction').value === actual ? 'correct' : 'revise'; state.completed[0] = true; save(); change();
});
$('phase-preview').addEventListener('change',() => {
  state.heat = Number($('phase-preview').value); state.visited.add(state.heat); state.time = 0; change();
});
$('compare').addEventListener('click',() => {
  if (state.visited.size < 3) state.message = 'compareMore';
  else { state.completed[1] = true; state.message = 'compared'; save(); }
  change();
});
$('heat').addEventListener('input',() => { state.heat = Number($('heat').value); state.heater = 0; state.message = ''; change(); });
for (const [id,power] of [['heat-up',1],['cool',-1],['heater-stop',0]]) $(id).addEventListener('click',() => {
  state.heater = power; if (power) play(true); else change();
});
$('record-heat').addEventListener('click',() => {
  const water = waterState(state.heat);
  if (water.phase === 'melting' || water.phase === 'boiling') { state.completed[2] = true; state.message = 'recorded'; save(); }
  else state.message = 'needPlateau';
  change();
});
$('next').addEventListener('click',() => scene(state.scene === 'coast' ? 'molecules' : state.scene === 'molecules' ? 'heat' : 'coast'));
for (const button of document.querySelectorAll('[data-scene]')) button.addEventListener('click',() => scene(button.dataset.scene));
$('reset').addEventListener('click',() => {
  play(false); state.completed = [false,false,false]; state.anchor = null; state.released = false; state.releaseAge = 0;
  state.visited = new Set([0]); state.density = 650; state.started = false; $('density').value = '650'; $('prediction').value = 'float'; $('phase-preview').value = '0';
  scene('coast'); state.camera = {x:0,y:1.65,z:6,yaw:0,pitch:0}; state.message = 'reset'; save(); change();
});
for (const button of document.querySelectorAll('[data-move]')) {
  button.addEventListener('click',() => { move(button.dataset.move,.55); change(); });
  button.addEventListener('pointerdown',event => {
    if (state.mode !== 'lab' || !state.playing) return;
    event.preventDefault(); keys.add(button.dataset.move); button.setPointerCapture(event.pointerId);
  });
  for (const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,() => keys.delete(button.dataset.move));
}
for (const button of document.querySelectorAll('[data-look]')) button.addEventListener('click',() => { state.camera.yaw += button.dataset.look === 'left' ? -.25 : .25; change(); });
const movementKeys = { w:'forward',s:'back',a:'left',d:'right' };
canvas.addEventListener('keydown',event => {
  const key = event.key.toLowerCase();
  if (key in movementKeys) { event.preventDefault(); if (state.playing) keys.add(movementKeys[key]); else { move(movementKeys[key],.55); change(); } }
  else if (key.startsWith('arrow')) {
    event.preventDefault();
    if (key === 'arrowleft') state.camera.yaw -= .12;
    if (key === 'arrowright') state.camera.yaw += .12;
    if (key === 'arrowup') state.camera.pitch = clamp(state.camera.pitch+.12,-1,1);
    if (key === 'arrowdown') state.camera.pitch = clamp(state.camera.pitch-.12,-1,1);
    change();
  } else if (key === 'e') state.mode === 'adventure' ? adventure.interaction() : approach();
  else if (key === 'f' && state.mode === 'adventure') adventure.action('throw');
  else if (key === 'shift' && state.mode === 'adventure' && state.playing) keys.add('sprint');
  else if (key === ' ') { event.preventDefault(); if (state.mode === 'adventure') adventure.action('jump'); else play(!state.playing); }
});
canvas.addEventListener('keyup',event => { keys.delete(movementKeys[event.key.toLowerCase()]); if (event.key === 'Shift') keys.delete('sprint'); });
canvas.addEventListener('blur',() => { keys.clear(); adventure.clearHeld(); dragging = null; });
canvas.addEventListener('pointerdown',event => {
  canvas.focus(); if (document.pointerLockElement === canvas) return;
  dragging = {x:event.clientX,y:event.clientY,id:event.pointerId}; canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event => {
  const locked = document.pointerLockElement === canvas;
  if (!dragging && !locked || dragging && !locked && event.pointerId !== dragging.id) return;
  const dx = locked ? event.movementX : event.clientX-dragging.x, dy = locked ? event.movementY : event.clientY-dragging.y;
  state.camera.yaw += dx*.004; state.camera.pitch = clamp(state.camera.pitch-dy*.004,-1,1);
  if (dragging) dragging = {x:event.clientX,y:event.clientY,id:event.pointerId};
  change();
});
for (const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event,() => { dragging = null; });
$('view-toggle').addEventListener('click',() => setExpanded(!expanded));
$('view-play').addEventListener('click',() => play(!state.playing));
$('look-stop').addEventListener('click',stopLook);
$('device-look').addEventListener('click',() => { releaseMouse(); deviceLook.enable(); });
$('device-recenter').addEventListener('click',() => deviceLook.recenter());
canvas.addEventListener('dblclick',() => { if (document.pointerLockElement === canvas) stopLook(); });
$('mouse-lock').addEventListener('click',async () => {
  if (mouseWanted || document.pointerLockElement === canvas) { stopLook(); return; }
  const request = ++mouseRequest; mouseWanted = true; deviceLook.disable(); refreshLook();
  try {
    if (!canvas.requestPointerLock) throw new Error('Unavailable');
    await canvas.requestPointerLock();
    if (request !== mouseRequest) return;
    canvas.focus();
  } catch { if (request === mouseRequest) { mouseWanted = false; state.message = 'lockFailed'; refresh(); } }
});
document.addEventListener('pointerlockchange',() => {
  const locked = document.pointerLockElement === canvas;
  if (locked && !mouseWanted) { releaseMouse(); return; }
  if (!locked) mouseWanted = false;
  state.message = locked ? 'lockActive' : ''; refresh();
});
document.addEventListener('pointerlockerror',() => { releaseMouse(); state.message = 'lockFailed'; refresh(); });
document.addEventListener('keydown',event => {
  if (event.key === 'Escape') { if (expanded) setExpanded(false); else stopLook(); }
  if (event.key === 'Tab' && expanded) {
    const items = [...document.querySelector('.world').querySelectorAll('button:not(:disabled),summary,[tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('blur',() => { play(false); dragging = null; });
document.addEventListener('visibilitychange',() => { keys.clear(); adventure.clearHeld(); dragging = null; releaseMouse(); deviceLook.sync(); last = 0; schedule(); });
document.addEventListener('physics-language',refresh);
document.addEventListener('physics-motion',event => { if (event.detail.paused) play(false); else refresh(); });
const observer = new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; keys.clear(); adventure.clearHeld(); deviceLook.sync(); last = 0; schedule(); });
observer.observe(canvas);
window.addEventListener('resize',() => { state.dpr = Math.min(window.devicePixelRatio || 1,2); render(); });
const orientationChanged = () => { deviceLook.recenter(); render(); };
window.addEventListener('orientationchange',orientationChanged);
window.screen.orientation?.addEventListener('change',orientationChanged);
canvas.addEventListener('webglcontextlost',event => { event.preventDefault(); if (expanded) setExpanded(false); deviceLook.disable(); play(false); renderer = null; $('gpu-message').hidden = false; adventure.mode('lab'); });
canvas.addEventListener('webglcontextrestored',() => {
  try { renderer = createRenderer(canvas); } catch { renderer = null; }
  $('gpu-message').hidden = Boolean(renderer); change();
});
window.addEventListener('pagehide',event => { if (expanded) setExpanded(false); stopLook(); observer.disconnect(); if (!event.persisted) adventure.dispose(); });
window.addEventListener('pageshow',() => { observer.observe(canvas); render(); });
window.__physicsGame = Object.freeze({ snapshot:() => ({ mode:state.mode,adventure:adventure.diagnostic(),scene:state.scene,camera:{...state.camera},heat:state.heat,water:waterState(state.heat),density:state.density,released:state.released,releaseAge:state.releaseAge,playing:state.playing,time:state.time,heater:state.heater,completed:[...state.completed],visible:state.visible,expanded,deviceLook:deviceLook.snapshot(),frames,gpu:Boolean(renderer) }) });
change();
