/* ================ Big Bang app.js ================ */

/* Tabs */
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    if(t.dataset.tab==='machine') updateMachine();
  });
});

/* ================ Timeline ================ */
function renderTimeline(){
  const wrap = document.getElementById('timelineWrap');
  const dict = LOCALES[window.CURRENT_LANG];
  wrap.innerHTML = '';
  EPOCHS.forEach(base=>{
    const e = getEpoch(base.id);
    const card = document.createElement('div');
    card.className = 'ep-card';
    card.dataset.epochId = base.id;
    card.style.setProperty('--dot', e.color);
    card.innerHTML = `
      <div class="ep-head">
        <div class="ep-name">${e.name || e.id}</div>
        <div class="ep-time">${e.time}</div>
      </div>
      <div class="ep-props">
        <div class="ep-prop"><div class="k">${dict['card.temp']}</div><div class="v">${e.temp}</div></div>
        <div class="ep-prop"><div class="k">${dict['card.size']}</div><div class="v">${e.size}</div></div>
        <div class="ep-prop"><div class="k">${dict['card.density']}</div><div class="v">${e.density}</div></div>
        <div class="ep-prop"><div class="k">${dict['card.dominant']}</div><div class="v" style="font-size:12px">${e.dominant}</div></div>
      </div>
      <div class="ep-events">
        <h4>${dict['card.events']}</h4>
        <ul>${e.events.map(x=>`<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="ep-evidence"><b>${dict['card.evidence']}:</b>${e.evidence}</div>
      ${buildReferenceLinks(e.refs, SOURCES, dict['refs.label'])}
    `;
    card.onclick = ()=>{
      // Jump to Time Machine at this epoch
      const slider = document.getElementById('timeSlider');
      slider.value = Math.round(cosmicTimeToAxisPosition(base.tsec) * 1000);
      document.querySelector('.tab[data-tab="machine"]').click();
    };
    wrap.appendChild(card);
  });
}

/* ================ Time Machine ================ */
const LIGHT_YEAR_M = 9.4607e15;
const NOW_SECONDS = 4.35e17;
const SCALE_LOG_MIN = -27;
const SCALE_LOG_MAX = 27;
const SIZE_ANCHORS = [
  {tsec:1e-35, value:-27},
  {tsec:1e-32, value:2},
  {tsec:1e-6, value:Math.log10(0.01 * LIGHT_YEAR_M)},
  {tsec:1, value:Math.log10(13 * LIGHT_YEAR_M)},
  {tsec:180, value:Math.log10(127 * LIGHT_YEAR_M)},
  {tsec:1.2e13, value:Math.log10(42e6 * LIGHT_YEAR_M)},
  {tsec:1.578e16, value:Math.log10(4.5e9 * LIGHT_YEAR_M)},
  {tsec:2.9e17, value:Math.log10(33e9 * LIGHT_YEAR_M)},
  {tsec:NOW_SECONDS, value:Math.log10(46.5e9 * LIGHT_YEAR_M)}
];

/* Interpolate epoch by log-time (seconds since Big Bang) */
function pickEpoch(tsec){
  // Return closest epoch by log10(t)
  const lt = Math.log10(Math.max(tsec, 1e-43));
  let best = EPOCHS[0], bestD = Infinity;
  for(const e of EPOCHS){
    const d = Math.abs(Math.log10(e.tsec) - lt);
    if(d < bestD){ bestD = d; best = e; }
  }
  return getEpoch(best.id);
}

/* Format time nicely */
function fmtTime(tsec){
  return formatCosmicTime(tsec, window.CURRENT_LANG);
}

function updateMachine(){
  const slider = document.getElementById('timeSlider');
  const tsec = axisPositionToCosmicTime(parseFloat(slider.value) / 1000);
  const ep = pickEpoch(tsec);
  const formattedTime = fmtTime(tsec);
  const scaleEstimate = getScaleEstimate(tsec);
  document.getElementById('mpTime').textContent = formattedTime;
  document.getElementById('mpEpoch').textContent = ep.name || ep.id;
  document.getElementById('mpEpoch').style.color = ep.color;
  document.getElementById('mpTemp').textContent = ep.temp;
  document.getElementById('mpSize').textContent = ep.size;
  document.getElementById('mpDens').textContent = ep.density;
  document.getElementById('mpDom').textContent = ep.dominant;
  document.getElementById('mpEvent').innerHTML = ep.events.slice(0,2).join('<br>');
  document.getElementById('mpRefs').innerHTML = buildReferenceLinks(ep.refs, SOURCES, LOCALES[window.CURRENT_LANG]['refs.label']);
  document.getElementById('sliderTimeOutput').textContent = formattedTime;
  document.getElementById('diagramTime').textContent = formattedTime;
  document.getElementById('diagramScale').textContent = formatScaleEstimate(scaleEstimate, tsec);
  document.querySelector('.spacetime-shell').style.setProperty('--epoch-color', ep.color);
  drawSpacetimeDiagram(tsec, ep, scaleEstimate);
}

function getScaleEstimate(tsec){
  const logMeters = interpolateLogValue(tsec, SIZE_ANCHORS);
  if(logMeters === null) return null;
  return {logMeters, modelDependent:tsec < 180};
}

function formatScaleEstimate(estimate, tsec){
  const dict = LOCALES[window.CURRENT_LANG];
  if(tsec > NOW_SECONDS) return dict['machine.diagram.futureScale'];
  if(!estimate) return dict['machine.diagram.unknown'];
  const exponent = estimate.logMeters.toFixed(1);
  const prefix = estimate.modelDependent ? `${dict['machine.diagram.model']} · ` : '';
  return `${prefix}${dict['machine.diagram.radiusValue']} ≈ 10^${exponent} m`;
}

function scaleHalfHeight(logMeters, maxHeight){
  if(logMeters === null) return 12;
  const normalized = Math.max(0, Math.min(1, (logMeters - SCALE_LOG_MIN) / (SCALE_LOG_MAX - SCALE_LOG_MIN)));
  return 12 + normalized * (maxHeight - 12);
}

function envelopePath(points, centerY){
  const top = points.map(point=>`${point.x.toFixed(1)},${(centerY-point.h).toFixed(1)}`).join(' L ');
  const bottom = points.slice().reverse().map(point=>`${point.x.toFixed(1)},${(centerY+point.h).toFixed(1)}`).join(' L ');
  return `M ${top} L ${bottom} Z`;
}

function drawSpacetimeDiagram(tsec, ep, estimate){
  const svg = document.getElementById('spacetimeSvg');
  const dict = LOCALES[window.CURRENT_LANG];
  const mobile = window.matchMedia('(max-width: 600px)').matches;
  const layout = mobile
    ? {width:760, height:640, x0:64, x1:730, centerY:300, maxHeight:216}
    : {width:1000, height:600, x0:92, x1:958, centerY:278, maxHeight:205};
  svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  const timeX = time=>layout.x0 + cosmicTimeToAxisPosition(time) * (layout.x1-layout.x0);
  const historyTimes = [1e-43,1e-35,1e-34,1e-32,1e-6,1,180,1.2e13,1e16,NOW_SECONDS];
  const historyPoints = historyTimes.map(time=>{
    const value = interpolateLogValue(time, SIZE_ANCHORS);
    return {x:timeX(time), h:scaleHalfHeight(value, layout.maxHeight)};
  });
  const nowPoint = historyPoints[historyPoints.length-1];
  const futurePoints = [
    nowPoint,
    {x:timeX(3.156e21), h:layout.maxHeight},
    {x:layout.x1, h:layout.maxHeight}
  ];
  const selectedX = timeX(tsec);
  const selectedH = scaleHalfHeight(estimate?.logMeters ?? null, layout.maxHeight);
  const selectedRx = Math.max(12, Math.min(44, selectedH * 0.2));
  const radiusTicks = mobile ? [-27,-9,9,27] : [-27,-18,-9,0,9,18,27];
  const grid = radiusTicks.map(value=>{
    const offset = scaleHalfHeight(value, layout.maxHeight);
    const label = value === 0 ? '1 m' : `10^${value} m`;
    return `
      <line class="radius-grid" x1="${layout.x0}" y1="${layout.centerY-offset}" x2="${layout.x1}" y2="${layout.centerY-offset}"/>
      <line class="radius-grid" x1="${layout.x0}" y1="${layout.centerY+offset}" x2="${layout.x1}" y2="${layout.centerY+offset}"/>
      <text class="radius-tick" x="${layout.x0-8}" y="${layout.centerY-offset+4}" text-anchor="end">${label}</text>`;
  }).join('');
  const events = [
    {tsec:1e-34, key:'machine.event.inflation', level:0, secondary:false},
    {tsec:1, key:'machine.event.oneSecond', level:1, secondary:false},
    {tsec:180, key:'machine.event.bbn', level:0, secondary:true},
    {tsec:1.2e13, key:'machine.event.cmb', level:1, secondary:false},
    {tsec:1e16, key:'machine.event.stars', level:0, secondary:true},
    {tsec:NOW_SECONDS, key:'machine.event.now', level:2, secondary:false},
    {tsec:3.156e99, key:'machine.event.future', level:1, secondary:false}
  ].filter(event=>!mobile || !event.secondary);
  const eventMarkup = events.map(event=>{
    const x = timeX(event.tsec);
    const above = event.level % 2 === 0;
    const y = above ? 36 + event.level*18 : layout.height-76-event.level*18;
    const edgeY = above ? layout.centerY-layout.maxHeight : layout.centerY+layout.maxHeight;
    return `
      <line class="event-guide" x1="${x}" y1="${edgeY}" x2="${x}" y2="${y+(above?10:-16)}"/>
      <circle class="event-dot" cx="${x}" cy="${edgeY}" r="4"/>
      <text class="event-label" x="${x}" y="${y}" text-anchor="middle">${dict[event.key]}</text>`;
  }).join('');
  const inflationStart = timeX(1e-36);
  const inflationEnd = timeX(1e-32);
  const presentX = timeX(NOW_SECONDS);
  const title = BigBangCore.escapeHtml(dict['machine.diagram.title']);
  const description = BigBangCore.escapeHtml(dict['machine.rep.caption']);
  svg.innerHTML = `
    <title>${title}</title>
    <desc>${description}</desc>
    <defs>
      <linearGradient id="historyFill" x1="0" x2="1">
        <stop offset="0" stop-color="#e94ecd" stop-opacity=".3"/>
        <stop offset=".4" stop-color="#5aa8ff" stop-opacity=".25"/>
        <stop offset=".76" stop-color="#ffd166" stop-opacity=".22"/>
        <stop offset="1" stop-color="#8b93b3" stop-opacity=".08"/>
      </linearGradient>
      <pattern id="uncertainHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#e8ecff" stroke-opacity=".2" stroke-width="3"/>
      </pattern>
      <radialGradient id="sliceFill">
        <stop offset="0" stop-color="${ep.color}" stop-opacity=".75"/>
        <stop offset="1" stop-color="${ep.color}" stop-opacity=".1"/>
      </radialGradient>
      <filter id="sliceGlow" x="-100%" y="-30%" width="300%" height="160%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
      <clipPath id="historyClip"><path d="${envelopePath(historyPoints, layout.centerY)}"/></clipPath>
    </defs>
    <rect class="diagram-field" width="${layout.width}" height="${layout.height}"/>
    ${grid}
    <text class="axis-title" x="${layout.x0+(mobile?250:270)}" y="${layout.centerY-layout.maxHeight-24}">${dict['machine.diagram.radiusAxis']}</text>
    <path class="history-envelope" d="${envelopePath(historyPoints, layout.centerY)}"/>
    <path class="future-envelope" d="${envelopePath(futurePoints, layout.centerY)}"/>
    <rect x="${inflationStart}" y="${layout.centerY-layout.maxHeight}" width="${inflationEnd-inflationStart}" height="${layout.maxHeight*2}" fill="url(#uncertainHatch)" clip-path="url(#historyClip)"/>
    <line class="time-axis" x1="${layout.x0}" y1="${layout.centerY}" x2="${layout.x1}" y2="${layout.centerY}"/>
    <line class="present-line" x1="${presentX}" y1="${layout.centerY-layout.maxHeight-10}" x2="${presentX}" y2="${layout.centerY+layout.maxHeight+10}"/>
    <text class="region-label" x="${(layout.x0+presentX)/2}" y="${layout.centerY+18}" text-anchor="middle">${dict['machine.diagram.history']}</text>
    <text class="region-label future-label" x="${(presentX+layout.x1)/2}" y="${layout.centerY+18}" text-anchor="middle">${dict['machine.diagram.future']}</text>
    ${eventMarkup}
    <ellipse class="selected-glow" cx="${selectedX}" cy="${layout.centerY}" rx="${selectedRx*1.8}" ry="${Math.max(24,selectedH)}"/>
    <ellipse class="selected-slice" cx="${selectedX}" cy="${layout.centerY}" rx="${selectedRx}" ry="${selectedH}"/>
    <line class="selected-radius" x1="${selectedX}" y1="${layout.centerY}" x2="${selectedX}" y2="${layout.centerY-selectedH}"/>
    <circle class="selected-center" cx="${selectedX}" cy="${layout.centerY}" r="5"/>
  `;
}

/* ================ Composition ================ */
const COMP_COLORS = {
  baryon:'#ffd166', dm:'#7c5cff', de:'#5aa8ff',
  photon:'#ff6b9d', neutrino:'#7ee8c5',
  radiation:'#ff6b9d', plasma:'#ffb547'
};

function renderComposition(){
  const grid = document.getElementById('compGrid');
  const dict = LOCALES[window.CURRENT_LANG];
  const snapshots = [
    {key:'now',    labelKey:'comp.today',  ...COMPOSITIONS.now},
    {key:'recomb', labelKey:'comp.recomb', ...COMPOSITIONS.recomb},
    {key:'nucleo', labelKey:'comp.nucleo', noteKey:'comp.note.nucleo', ...COMPOSITIONS.nucleo}
  ];
  grid.innerHTML = '';
  snapshots.forEach(sn=>{
    const c = document.createElement('div');
    c.className='comp-card';
    const label = dict[sn.labelKey];
    c.innerHTML = `
      <h3>${label}</h3>
      <div class="pie-holder">${buildPieSvg(sn.data)}</div>
      <div class="comp-legend">
        ${sn.data.map(row=>{
          const name = dict['comp.legend.'+row.k];
          const col = COMP_COLORS[row.k];
          return `<div class="cl-row"><div class="cl-dot" style="background:${col}"></div><div class="cl-name">${name}</div><div class="cl-val">${formatCompositionPercent(row.v)}</div></div>`;
        }).join('')}
      </div>
      ${sn.noteKey ? `<p class="comp-note">${dict[sn.noteKey]}</p>` : ''}
      ${buildReferenceLinks(sn.refs, SOURCES, dict['refs.label'])}
    `;
    grid.appendChild(c);
  });
}

function formatCompositionPercent(value){
  if(value < 0.001) return '<0.001%';
  if(value > 99.999) return '>99.999%';
  return `${value}%`;
}

function buildPieSvg(data){
  const cx=100, cy=100, r=90;
  let startAngle = -Math.PI/2;
  let paths = '';
  data.forEach(row=>{
    const angle = (row.v/100) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const col = COMP_COLORS[row.k];
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${col}" opacity="0.85" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`;
    startAngle = endAngle;
  });
  return `<svg viewBox="0 0 200 200">${paths}</svg>`;
}

/* ================ Scale ================ */
const SCALE_ROWS = [
  {refs:['scales2004','pdgCosmology'], tsec:1e-35, t:'10⁻³⁵ s', tzh:'10⁻³⁵ 秒', size:'illustrative ~10⁻²⁷ m', sizezh:'示意值 ~10⁻²⁷ 米', logRadiusM:-27, compare:'Model-dependent; ~10¹² times smaller than a proton', comparezh:'依模型而定;比质子小约 10¹² 倍'},
  {refs:['planckInflation'], tsec:1e-32, t:'10⁻³² s', tzh:'10⁻³² 秒', size:'absolute size unknown', sizezh:'绝对大小未知', logRadiusM:null, compare:'Inflation requires ≥~10²⁶-fold linear growth', comparezh:'暴胀通常要求线性尺度增长至少约 10²⁶ 倍'},
  {refs:['scales2004','pdgCosmology'], tsec:1, t:'1 s', tzh:'1 秒', size:'~13 ly radius', sizezh:'半径约 13 光年', logRadiusM:17.089866623475046, compare:'~25 light-years across', comparezh:'直径约 25 光年'},
  {refs:['scales2004','pdgCosmology'], tsec:180, t:'3 min', tzh:'3 分钟', size:'~127 ly radius', sizezh:'半径约 127 光年', logRadiusM:18.079726992124165, compare:'~250 light-years across; BBN under way', comparezh:'直径约 250 光年;原初核合成进行中'},
  {refs:['scales2004','planck2018'], tsec:1.2e13, t:'380,000 yr', tzh:'38 万年', size:'~42 million ly radius', sizezh:'半径约 4200 万光年', logRadiusM:23.59917256156611, compare:'CMB released', comparezh:'CMB 光子退耦'},
  {refs:['scales2004','firstStars2023'], tsec:1.578e16, t:'500 Myr', tzh:'5 亿年', size:'~4–5 Gly radius', sizezh:'半径约 40–50 亿光年', logRadiusM:25.629135784943553, compare:'First stars and galaxies', comparezh:'第一代恒星与早期星系'},
  {refs:['scales2004','planck2018'], tsec:2.9e17, t:'9.2 Gyr', tzh:'92 亿年', size:'~33 Gly radius', sizezh:'半径约 330 亿光年', logRadiusM:26.494437211046098, compare:'Solar System forms', comparezh:'太阳系形成'},
  {refs:['scales2004','planck2018'], tsec:4.35e17, t:'13.8 Gyr', tzh:'138 亿年', size:'~46.5 Gly radius', sizezh:'半径约 465 亿光年', logRadiusM:26.643376224058162, compare:'~93 billion light-years across today', comparezh:'今天直径约 930 亿光年'}
];
function renderScale(){
  const wrap = document.getElementById('scaleWrap');
  const zh = window.CURRENT_LANG==='zh-CN';
  const dict = LOCALES[window.CURRENT_LANG];
  const ticks = [-27,-18,-9,0,9,18,27];
  wrap.innerHTML = `
    <div class="scale-axis" aria-label="${dict['scale.axis']}">
      ${ticks.map(value=>`<span style="left:${((value-SCALE_LOG_MIN)/(SCALE_LOG_MAX-SCALE_LOG_MIN))*100}%">${value===0?'1 m':`10^${value} m`}</span>`).join('')}
    </div>`;
  SCALE_ROWS.forEach(row=>{
    const el = document.createElement('div');
    el.className = 'scale-row';
    const position = row.logRadiusM === null
      ? null
      : ((row.logRadiusM-SCALE_LOG_MIN)/(SCALE_LOG_MAX-SCALE_LOG_MIN))*100;
    el.innerHTML = `
      <div class="scale-time">${zh ? row.tzh : row.t}</div>
      <div class="scale-bar" aria-label="${zh ? row.sizezh : row.size}">
        ${position === null
          ? '<div class="scale-unknown"></div>'
          : `<div class="scale-fill" style="width:${position}%"></div><div class="scale-point" style="left:${position}%"></div>`}
        <div class="scale-label">${zh ? row.sizezh : row.size}</div>
      </div>
      <div class="scale-compare"><b>${zh ? row.comparezh : row.compare}</b><button class="scale-jump" type="button" data-tsec="${row.tsec}">${dict['scale.view']}</button></div>
      ${buildReferenceLinks(row.refs, SOURCES, dict['refs.label'])}
    `;
    wrap.appendChild(el);
  });
  wrap.querySelectorAll('.scale-jump').forEach(button=>button.addEventListener('click',()=>{
    document.getElementById('timeSlider').value = Math.round(cosmicTimeToAxisPosition(Number(button.dataset.tsec)) * 1000);
    document.querySelector('.tab[data-tab="machine"]').click();
  }));
}

/* ================ Fates ================ */
function renderFates(){
  const grid = document.getElementById('fatesGrid');
  const lang = window.CURRENT_LANG;
  const list = FATES[lang];
  grid.innerHTML = '';
  list.forEach(f=>{
    const c = document.createElement('div');
    c.className='fate-card';
    c.innerHTML = `
      <div class="fate-icon">${f.icon}</div>
      <div class="fate-name">${f.name}</div>
      <div class="fate-likely">${f.likely}</div>
      <div class="fate-desc">${f.desc}</div>
      ${buildReferenceLinks(f.refs, SOURCES, LOCALES[lang]['refs.label'])}
    `;
    grid.appendChild(c);
  });
}

/* ================ Mysteries ================ */
function renderMysteries(){
  const grid = document.getElementById('mysteriesGrid');
  const lang = window.CURRENT_LANG;
  const list = MYSTERIES[lang];
  grid.innerHTML = '';
  list.forEach(m=>{
    const c = document.createElement('div');
    c.className='myst-card';
    c.innerHTML = `<div class="myst-q">${m.name}</div><div class="myst-d">${m.desc}</div>${buildReferenceLinks(m.refs, SOURCES, LOCALES[lang]['refs.label'])}`;
    grid.appendChild(c);
  });
}

function renderSourceLinks(lang){
  renderReferencePanel(document.getElementById('sourceLinks'), SOURCES, LOCALES[lang]['refs.label']);
}

/* ================ Global motion preference ================ */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const MOTION_STORAGE_KEY = 'bb-motion';
const GLOBAL_MOTION_STORAGE_KEY = 'physics.motion';
const motionParameter = new URLSearchParams(location.search).get('motion');
let motionMode = (function(){
  if(['play','pause','system'].includes(motionParameter)) return motionParameter;
  try {
    const saved=localStorage.getItem(GLOBAL_MOTION_STORAGE_KEY) || localStorage.getItem(MOTION_STORAGE_KEY);
    return ['play','pause'].includes(saved) ? saved : 'system';
  } catch(_){
    return 'system';
  }
})();
function persistMotionMode(){
  try {
    if(motionMode==='system') localStorage.removeItem(MOTION_STORAGE_KEY);
    else localStorage.setItem(MOTION_STORAGE_KEY,motionMode);
  } catch(_){}
  try {
    if(motionMode==='system') localStorage.removeItem(GLOBAL_MOTION_STORAGE_KEY);
    else localStorage.setItem(GLOBAL_MOTION_STORAGE_KEY,motionMode);
  } catch(_){}
}
if(['play','pause','system'].includes(motionParameter)) persistMotionMode();
function motionIsPaused(){
  return motionMode==='pause' || (motionMode==='system' && motionQuery.matches);
}
function motionText(key){
  const lang=window.CURRENT_LANG || 'en';
  return LOCALES[lang]?.[key] || LOCALES.en[key] || key;
}
function updateMotionControl(){
  const button=document.getElementById('motionToggle');
  const paused=motionIsPaused();
  button.textContent=paused ? `▶ ${motionText('motion.play')}` : `⏸ ${motionText('motion.pause')}`;
  button.dataset.state=paused ? 'paused' : 'playing';
  document.documentElement.dataset.motion=paused ? 'paused' : 'playing';
  button.title=motionMode==='system' && motionQuery.matches ? motionText('motion.system') : '';
}
function setMotionMode(mode){
  motionMode=mode;
  persistMotionMode();
  updateMotionControl();
  bgAnimation.setReducedMotion(motionIsPaused());
}
document.getElementById('motionToggle').addEventListener('click',()=>{
  setMotionMode(motionIsPaused() ? 'play' : 'pause');
});

/* ================ Background canvas — expanding starfield ================ */
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let BGW=0, BGH=0;
function resizeBg(){
  bgCanvas.width = window.innerWidth*devicePixelRatio;
  bgCanvas.height = window.innerHeight*devicePixelRatio;
  bgCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  BGW = window.innerWidth; BGH = window.innerHeight;
}
window.addEventListener('resize',resizeBg);
resizeBg();

const bgStars = [];
for(let i=0;i<180;i++){
  bgStars.push({
    x:(Math.random()-0.5)*BGW,
    y:(Math.random()-0.5)*BGH,
    z:Math.random()*BGW,
    hue:Math.random()<0.3 ? 350 : (Math.random()<0.5 ? 45 : 200)
  });
}
function drawBg(){
  bgCtx.fillStyle = 'rgba(2,3,10,0.25)';
  bgCtx.fillRect(0,0,BGW,BGH);
  advanceStarfield(bgStars, BGW, BGH, Math.random, (star, x, y, size, alpha)=>{
    bgCtx.fillStyle = `hsla(${star.hue},80%,80%,${alpha})`;
    bgCtx.beginPath(); bgCtx.arc(x,y,size,0,Math.PI*2); bgCtx.fill();
  });
}

const bgAnimation = createAnimationController({
  requestFrame: callback=>requestAnimationFrame(callback),
  cancelFrame: id=>cancelAnimationFrame(id),
  draw: drawBg
});
bgAnimation.setDocumentVisible(!document.hidden);
bgAnimation.setReducedMotion(motionIsPaused());
document.addEventListener('visibilitychange',()=>bgAnimation.setDocumentVisible(!document.hidden));
motionQuery.addEventListener('change',()=>{
  updateMotionControl();
  bgAnimation.setReducedMotion(motionIsPaused());
});
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>bgAnimation.setIntersecting(entries[0].isIntersecting)).observe(bgCanvas);
}
bgAnimation.start();

/* ================ Slider ================ */
document.getElementById('timeSlider').addEventListener('input', updateMachine);
window.addEventListener('resize',()=>{
  if(document.getElementById('tab-machine').classList.contains('active')) updateMachine();
});

/* ================ Language switch ================ */
document.querySelectorAll('.lang-pill').forEach(b=>{
  b.addEventListener('click',()=>{
    const lang = b.dataset.lang;
    try{ localStorage.setItem('bb-lang',lang); }catch(_){}
    try{ localStorage.setItem('physics.lang',lang); }catch(_){}
    applyI18n(lang);
    renderScale();
    updateMotionControl();
  });
});
const savedLang = (()=>{
  try{ return localStorage.getItem('physics.lang') || localStorage.getItem('bb-lang'); }
  catch(_){ return null; }
})();
const browserLang = (navigator.language||'').toLowerCase();
const initLang = savedLang || (browserLang.startsWith('zh') ? 'zh-CN' : 'en');
applyI18n(initLang);
renderScale();
updateMotionControl();
const requestedTab=new URLSearchParams(location.search).get('tab');
const requestedTabButton=requestedTab && document.querySelector(`.tab[data-tab="${requestedTab}"]`);
if(requestedTabButton) requestedTabButton.click();
