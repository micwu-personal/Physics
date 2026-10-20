import { ADVENTURE, createAdventure, raftState, groundHeight, nearestStation, interact, stepAdventure, throwCapsule, rescue } from './game-adventure-model.js';
import { waterState, clamp } from './game-model.js';
import { createGameAudio } from './game-audio.js';

const $ = id => document.getElementById(id);
const messages = {
  brief:['The lighthouse is waiting. Timber or steel? Try a pontoon, then check its loaded draft.','灯塔在等待。选木材还是钢材？安装浮体，看看载人的吃水率。'],
  pickedWood:['Timber carried. Bring it to the raft.','已拿起木材。带到浮筏边。'],
  pickedSteel:['Steel carried. Equal volume does not mean equal mass.','已拿起钢块。相同体积不意味着相同质量。'],
  installedWood:['Timber installed. One floats, but two provide the safety reserve.','木材已装好。一块能浮，两块才能留够安全余量。'],
  installedSteel:['Steel installed. Watch the raft sink; remove it to recover.','钢块已装好。浮筏下沉了；卸下即可恢复。'],
  removedSteel:['Steel removed. Recheck mass against displaced water.','已卸下钢块。重新比较总质量与排开水的质量。'],
  raftUnsafe:['Not ready to cross. Use two timber pontoons, no steel. A 90% draft is the game’s safety limit, not the flotation threshold.','还不能安全渡水。装两块木浮体、卸下钢块。90% 吃水是游戏安全线，不是物体能否浮起的物理界线。'],
  boarded:['You are aboard. Hold forward to steer across the channel.','已经上筏。按住前进，驶过水道。'],
  docked:['Docked! Walk to the amber relay. Checkpoint saved for this run.','靠岸！走向琥珀色继电器。本局检查点已保留。'],
  heating:['Heating the 10 g sensor. At 0 °C, energy melts ice instead of raising temperature.','正在加热 10 g 传感样品。在 0 °C，能量用于融冰，而不是继续升温。'],
  cooling:['Cooling reverses the sample’s calorimetry.','冷却会沿量热曲线反向变化。'],
  hold:['Beam stopped. The ideal sample keeps its current heat.','传热已停止。理想样品保持当前热量。'],
  bridgeOpen:['Relay restored: at least 95% liquid, no vapor. Cross the opened bridge.','继电器已恢复：至少 95% 液态、没有蒸气。走过打开的桥。'],
  pickedCapsule:['Signal capsule ready. Drag upward to aim; the dotted path predicts gravity.','信号舱就绪。向上瞄准；虚线轨迹按重力预测。'],
  thrown:['Capsule away. Watch its trajectory.','信号舱已投出。观察它的轨迹。'],
  retryCapsule:['Missed the receiver. Another capsule is available at the launch pedestal.','未命中接收环。发射台上还有信号舱。'],
  recovered:['Recovered at your checkpoint. Built equipment and relay progress are kept.','已回到检查点。保留已建装备和继电器进度。'],
  dropped:['Item put down. Its supply remains available.','已放下物品。原处仍可再次取用。'],
  won:['Signal received. The lighthouse is alive again.','信号已收到。灯塔重新亮起来了。'],
  approach:['Walk closer to interact. No teleporting through this rescue.','走近才能互动。救援过程不能瞬移跳过。'],
  handsFull:['Put down your current item first.','请先放下手里的物品。'],
  soundUnavailable:['Audio is unavailable; every action still has visual feedback.','音频不可用；每个动作仍有视觉反馈。']
};
const copy = {
  title:[['01 / Build your crossing','01 / 造好渡水工具'],['02 / Reopen the relay','02 / 恢复继电器'],['03 / Send the signal','03 / 送出信号'],['04 / Lighthouse restored','04 / 灯塔已恢复']],
  task:[['Carry timber from the left supply to the raft. Install two pontoons; board and steer to the island.','把左侧木材带到筏边。装好两块浮体，再上筏驶向岛屿。'],['Walk to the relay. Melt the enlarged 10 g ice sensor to open the bridge.','走向继电器。融化放大显示的 10 g 冰传感样品，开启桥梁。'],['Cross the bridge, collect a capsule, aim at the golden ring and throw. You can walk nearer the edge.','过桥取信号舱，瞄准金色接收环投掷。可以走近岸边缩短距离。'],['Your choices restored the island link. Explore, or replay with a clock.','你的行动恢复了岛间通信。继续探索，或开启计时重玩。']],
  labels:{wood:['Timber supply','木材补给'],steel:['Steel supply','钢块补给'],raft:['Raft','浮筏'],relay:['Thermal relay','热继电器'],capsule:['Signal capsules','信号舱'],receiver:['Receiver','接收环']},
  actions:{wood:['Carry timber · E','拿起木材 · E'],steel:['Carry steel · E','拿起钢块 · E'],install:['Install carried pontoon · E','装上手中浮体 · E'],board:['Board raft · E','登上浮筏 · E'],relay:['Toggle relay heat · E','切换继电器加热 · E'],capsule:['Pick up capsule · E','拿起信号舱 · E'],approach:['Walk closer to interact','走近后互动']},
  pause:['Paused. Resume when ready.','已暂停。准备好后继续。'],
  coast:['Storm islands · first-person rescue','风暴群岛 · 第一人称救援'],
  caption:['Calculated buoyancy, heat and gravity · terrain and steering are illustrative','浮力、热量、重力按模型计算 · 地形与操筏过程为示意'],
  aim:['Face next objective','朝向下个目标'],
  audioOff:['Sound off','声音：关'],audioOn:['Sound on','声音：开'],
  resume:['Resume','继续'],pauseButton:['Pause','暂停'],
  victory:['The lighthouse is back.','灯塔再次亮起。'],failure:['The signal window closed.','信号窗口已关闭。'],
  failureCopy:['Your 120 active seconds ran out. Replay, or uncheck the timer for unhurried practice.','120 秒有效游戏时间已用完。可重玩，或取消计时，轻松练习。'],
  canvas:['First-person coastal rescue. WASD or held touch arrows move; drag, arrow keys or opt-in device rotation look. E interacts, Space jumps, F throws. Onscreen Pause/Exit, Escape, or double-click while mouse-locked release capture.','第一人称海岸救援。WASD 或长按屏幕箭头移动，拖拽、方向键或主动开启的设备转动观察；E 互动，空格跳跃，F 投掷。可用屏幕暂停／退出或 Escape；鼠标锁定时也可双击退出。']
};
const lang = () => document.documentElement.lang === 'zh-CN' ? 1 : 0;
const words = value => value[lang()];
const formatTime = seconds => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export function createAdventureController(state,{change,play,getGpu}) {
  state.adventure = createAdventure();
  let started = false, timed = false, lost = false, verticalSpeed = 0, lastEvent = 0, best = null, storage = true;
  const audio = createGameAudio(), held = new Set();
  try { const saved = JSON.parse(localStorage.getItem('physics.rescue.v1')); if (saved?.version === 1 && Number.isFinite(saved.best) && saved.best > 0) best = saved.best; }
  catch { storage = false; }
  const active = () => state.mode === 'adventure';
  const writable = () => active() && started && state.playing && !lost && !state.adventure.won;
  const cameraStart = () => ({x:0,y:ADVENTURE.eyeHeight,z:6,yaw:0,pitch:-.04});
  let adventureCamera = cameraStart(), labCamera = {...state.camera};
  function mode(value) {
    play(false); held.clear();
    if (active()) adventureCamera = {...state.camera}; else labCamera = {...state.camera};
    state.mode = value === 'adventure' && getGpu() ? 'adventure' : 'lab';
    state.camera = {...(active() ? adventureCamera : labCamera)};
    verticalSpeed = 0; change();
  }
  function start(retry=false) {
    if (!getGpu()) return mode('lab');
    if (retry) { state.adventure = createAdventure(); state.camera = cameraStart(); verticalSpeed = 0; lastEvent = 0; }
    timed = $('timed-run').checked; started = true; lost = false; play(true); $('game-canvas').focus();
  }
  function interaction() {
    if (!writable()) return;
    const target = nearestStation(state.camera,state.adventure);
    if (target) interact(state.adventure,target.id,state.camera);
    else { state.adventure.message = 'approach'; state.adventure.event++; }
    change();
  }
  function action(id) {
    if (!writable()) return;
    if (id === 'throw') throwCapsule(state.adventure,state.camera);
    else if (id === 'recover') { rescue(state.adventure,state.camera); verticalSpeed = 0; }
    else if (id === 'jump') {
      const ground = groundHeight(state.camera.x,state.camera.z,state.adventure);
      if (!state.adventure.riding && ground !== null && Math.abs(state.camera.y-ground-ADVENTURE.eyeHeight) < .08) verticalSpeed = 4.8;
    } else if (id === 'heat' || id === 'cool' || id === 'hold') {
      if (nearestStation(state.camera,state.adventure)?.id === 'relay') {
        state.adventure.beam = id === 'heat' ? 1 : id === 'cool' ? -1 : 0;
        state.adventure.message = id === 'heat' ? 'heating' : id === 'cool' ? 'cooling' : 'hold'; state.adventure.event++;
      }
    } else interact(state.adventure,id === 'unload' ? 'removeSteel' : id,state.camera);
    change();
  }
  function move(direction,distance) {
    if (!writable() || state.adventure.riding) return;
    const c = state.camera, f = Number(direction === 'forward')-Number(direction === 'back'), r = Number(direction === 'right')-Number(direction === 'left');
    c.x = clamp(c.x+(Math.sin(c.yaw)*f+Math.cos(c.yaw)*r)*distance,ADVENTURE.bounds.minX,ADVENTURE.bounds.maxX);
    c.z = clamp(c.z+(-Math.cos(c.yaw)*f+Math.sin(c.yaw)*r)*distance,ADVENTURE.bounds.minZ,ADVENTURE.bounds.maxZ);
  }
  function objective() {
    const s = state.adventure;
    if (s.stage === 0) return s.riding ? {x:0,z:-16,id:'relay'} : s.carrying || s.wood === 2 ? {x:s.boat.x,z:s.boat.z,id:'raft'} : {...ADVENTURE.stations.wood,id:'wood'};
    if (s.stage === 1) return {...ADVENTURE.stations.relay,id:'relay'};
    return s.carrying === 'capsule' ? {...ADVENTURE.receiver,id:'receiver'} : {...ADVENTURE.stations.capsule,id:'capsule'};
  }
  function face() {
    const target = objective(), c = state.camera;
    c.yaw = Math.atan2(target.x-c.x,c.z-target.z);
    if (target.id === 'receiver') c.pitch = .3; else c.pitch = -.1;
    change();
  }
  function update(dt,keys) {
    if (!writable()) return;
    const s = state.adventure, c = state.camera;
    const all = new Set([...keys,...held]);
    const forward = Number(all.has('forward'))-Number(all.has('back')), right = Number(all.has('right'))-Number(all.has('left'));
    if (!s.riding) {
      const scale = all.has('sprint') ? 4.3 : 2.7, norm = Math.hypot(forward,right) || 1;
      if (forward) move(forward > 0 ? 'forward' : 'back',Math.abs(forward)/norm*scale*dt);
      if (right) move(right > 0 ? 'right' : 'left',Math.abs(right)/norm*scale*dt);
      verticalSpeed -= ADVENTURE.gravity*dt; c.y += verticalSpeed*dt;
      const ground = groundHeight(c.x,c.z,s);
      if (ground !== null && c.y <= ground+ADVENTURE.eyeHeight && verticalSpeed <= 0) { c.y = ground+ADVENTURE.eyeHeight; verticalSpeed = 0; }
    }
    const rescues = s.rescues;
    stepAdventure(s,c,dt,{forward,right});
    if (s.rescues !== rescues || s.riding) verticalSpeed = 0;
    if (s.won) {
      if (best === null || s.elapsed < best) {
        best = s.elapsed;
        try { localStorage.setItem('physics.rescue.v1',JSON.stringify({version:1,best})); } catch { storage = false; }
      }
      play(false);
    } else if (timed && s.elapsed >= 120) { lost = true; play(false); }
  }
  function project(point) {
    const c = state.camera, p = {x:point.x-c.x,y:point.y-c.y,z:point.z-c.z};
    const depth = p.x*Math.sin(c.yaw)-p.z*Math.cos(c.yaw), z = depth*Math.cos(c.pitch)+p.y*Math.sin(c.pitch);
    if (z < .3) return null;
    const aspect = $('game-canvas').clientWidth/$('game-canvas').clientHeight;
    const x = (p.x*Math.cos(c.yaw)+p.z*Math.sin(c.yaw))*1.55/aspect/z;
    const y = (p.y*Math.cos(c.pitch)-depth*Math.sin(c.pitch))*1.55/z;
    return Math.abs(x) < .93 && y > -.75 && y < .25 ? {x:(x+1)*50,y:(1-y)*50} : null;
  }
  function refresh() {
    const on = active(), s = state.adventure;
    document.querySelector('.game-layout').dataset.mode = state.mode;
    document.querySelector('.world').dataset.mode = state.mode;
    document.querySelector('.notebook').hidden = on;
    for (const id of ['adventure-hud','adventure-controls','world-markers','mission-prompt']) $(id).hidden = !on;
    $('mode-adventure').setAttribute('aria-pressed',String(on)); $('mode-lab').setAttribute('aria-pressed',String(!on));
    $('mode-adventure').disabled = !getGpu();
    if (!on) { $('mission-overlay').hidden = true; $('mission-message').hidden = true; return; }
    $('welcome').hidden = true; $('scene-instrument').hidden = true;
    $('place').textContent = words(copy.coast); $('scene-caption').textContent = words(copy.caption);
    $('approach').textContent = words(copy.aim); $('game-canvas').setAttribute('aria-label',words(copy.canvas));
    $('mission-title').textContent = words(copy.title[s.stage]); $('mission-task').textContent = words(copy.task[s.stage]);
    const boat = raftState(s), sample = waterState(s.heat), zh = lang() === 1;
    $('mission-readout').textContent = s.stage === 0
      ? zh ? `木 ${s.wood}/2 · 钢 ${s.steel} · 载重 ${boat.mass.toFixed(1)} kg / 浮力容量 ${boat.capacity.toFixed(0)} kg · 吃水 ${Number.isFinite(boat.draft) ? (boat.draft*100).toFixed(0)+'%' : '—'} · 安全线 ≤90%`
        : `Timber ${s.wood}/2 · steel ${s.steel} · ${boat.mass.toFixed(1)} kg / ${boat.capacity.toFixed(0)} kg capacity · draft ${Number.isFinite(boat.draft) ? (boat.draft*100).toFixed(0)+'%' : '—'} · safe ≤90%`
      : s.stage === 1 ? `${s.heat.toFixed(2)} kJ · ${sample.temperature.toFixed(1)} °C · ${zh ? '液态' : 'liquid'} ${(sample.liquid*100).toFixed(0)}% · ${zh ? '气态' : 'vapor'} ${(sample.gas*100).toFixed(0)}% · ${zh ? '功率' : 'power'} ${s.beam === 0 ? 0 : s.beam*.75} kW`
        : `${zh ? '投掷' : 'Throws'} ${s.shots} · ${zh ? '重力' : 'gravity'} 9.81 m/s² · ${zh ? '初速度' : 'launch'} 11 m/s`;
    $('mission-clock').textContent = timed ? `${formatTime(Math.max(0,120-s.elapsed))} ↓` : formatTime(s.elapsed);
    $('map-player').setAttribute('transform',`translate(${60+state.camera.x*4} ${143+(state.camera.z-6)*2.34}) rotate(${state.camera.yaw*180/Math.PI})`);
    const target = nearestStation(state.camera,s), next = objective();
    const actionKey = target?.id === 'raft' ? s.carrying ? 'install' : 'board' : target?.id || 'approach';
    $('adventure-interact').textContent = words(copy.actions[actionKey]);
    $('adventure-interact').disabled = !writable() || !target || s.riding;
    $('mission-target').textContent = target ? words(copy.actions[actionKey]) : words(copy.labels[next.id]);
    $('mission-bearing').textContent = !started ? '' : !state.playing && !s.won && !lost ? words(copy.pause) : `${Math.hypot(next.x-state.camera.x,next.z-state.camera.z).toFixed(1)} m · ${zh ? '用“朝向下个目标”找方向' : 'use “Face next objective” to orient'}`;
    $('adventure-throw').hidden = s.carrying !== 'capsule';
    for (const id of ['heat','cool','hold']) $(`adventure-${id}`).hidden = target?.id !== 'relay';
    $('adventure-drop').hidden = !s.carrying;
    $('adventure-unload').hidden = target?.id !== 'raft' || !s.steel;
    $('adventure-play').textContent = words(state.playing ? copy.pauseButton : copy.resume);
    $('adventure-play').disabled = !started || s.won || lost;
    $('adventure-jump').disabled = !writable() || !state.playing || s.riding;
    $('adventure-recover').disabled = !writable();
    for (const id of ['throw','heat','cool','hold','drop','unload']) $(`adventure-${id}`).disabled = !writable();
    $('mission-overlay').hidden = started && !s.won && !lost;
    $('mission-start').hidden = started; $('mission-retry').hidden = !started;
    $('mission-timing').hidden = started && !s.won && !lost;
    if (s.won || lost) {
      $('mission-overlay-title').textContent = words(s.won ? copy.victory : copy.failure);
      $('mission-overlay-copy').textContent = s.won
        ? zh ? `用时 ${formatTime(s.elapsed)}，投掷 ${s.shots} 次，恢复 ${s.rescues} 次。两块木浮体排水支撑 405 kg；相变开启继电器；抛物线把信号送达。`
          : `${formatTime(s.elapsed)}, ${s.shots} throws, ${s.rescues} recoveries. Two timber pontoons supported 405 kg; latent heat restored the relay; your projectile delivered the signal.`
        : words(copy.failureCopy);
    }
    $('mission-record').textContent = best === null ? '' : `${zh ? '本浏览器最快' : 'Local best'} ${formatTime(best)}${storage ? '' : zh ? ' · 不可持久保存' : ' · persistence unavailable'}`;
    $('mission-message').hidden = !started || s.won || lost || !s.message;
    if (s.event !== lastEvent) { lastEvent = s.event; audio.cue(s.message); }
    const modelMessages = {woodPicked:'pickedWood',steelPicked:'pickedSteel',woodInstalled:'installedWood',steelInstalled:'installedSteel',steelRemoved:'removedSteel',heaterOn:'heating',heaterOff:'hold',bridgeReady:'bridgeOpen',capsulePicked:'pickedCapsule',capsuleThrown:'thrown'};
    const message = words(messages[modelMessages[s.message] || s.message] || messages.brief);
    if ($('mission-message').textContent !== message) $('mission-message').textContent = message;
    $('adventure-sound').textContent = words($('adventure-sound').getAttribute('aria-pressed') === 'true' ? copy.audioOn : copy.audioOff);
    $('adventure-hud').hidden = !started || s.won || lost;
    $('mission-prompt').hidden = !started || s.won || lost;
    markers(); syncAudio();
  }
  function markers() {
    if (!active()) return;
    const s = state.adventure, stations = s.stage === 0 ? ['wood','steel','raft'] : s.stage === 1 ? ['relay'] : ['capsule','receiver'];
    const frag = document.createDocumentFragment();
    for (const id of stations) {
      const point = id === 'raft' ? s.boat : id === 'receiver' ? ADVENTURE.receiver : ADVENTURE.stations[id];
      const projected = project({...point,y:id === 'receiver' ? 3.5 : 1.7});
      if (!projected || !started || s.won || lost) continue;
      const label = document.createElement('span'); label.textContent = words(copy.labels[id]); label.style.left = `${projected.x}%`; label.style.top = `${projected.y}%`; frag.append(label);
    }
    $('world-markers').replaceChildren(frag);
  }
  function syncAudio() { audio.active(active() && state.playing && state.visible && !document.hidden,Boolean(state.adventure.beam)); }
  function clearHeld() { held.clear(); syncAudio(); }
  $('mode-adventure').addEventListener('click',() => mode('adventure'));
  $('mode-lab').addEventListener('click',() => mode('lab'));
  $('mission-start').addEventListener('click',() => start());
  $('mission-retry').addEventListener('click',() => start(true));
  $('adventure-interact').addEventListener('click',interaction);
  $('adventure-play').addEventListener('click',() => play(!state.playing));
  for (const id of ['jump','throw','heat','cool','hold','drop','unload','recover']) $(`adventure-${id}`).addEventListener('click',() => action(id));
  $('adventure-sound').addEventListener('click',async () => {
    try {
      const enabled = await audio.toggle(); $('adventure-sound').setAttribute('aria-pressed',String(enabled));
      $('adventure-sound').textContent = words(enabled ? copy.audioOn : copy.audioOff); syncAudio();
    } catch { state.adventure.message = 'soundUnavailable'; state.adventure.event++; change(); }
  });
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown',event => { if (!active() || !state.playing) return; event.preventDefault(); held.add(button.dataset.move); button.setPointerCapture(event.pointerId); });
    for (const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,() => held.delete(button.dataset.move));
  }
  function diagnostic() { return {...state.adventure,boat:{...state.adventure.boat},trail:state.adventure.trail.map(p => ({...p})),projectile:state.adventure.projectile ? {...state.adventure.projectile} : null,raft:raftState(state.adventure),sample:waterState(state.adventure.heat),started,timed,lost,best}; }
  return {mode,start,interaction,action,move,face,update,refresh,markers,syncAudio,clearHeld,diagnostic,dispose:audio.dispose};
}
