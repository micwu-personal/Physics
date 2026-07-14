/* ================ Big Bang app.js ================ */

/* Tabs */
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    if(t.dataset.tab==='machine') { resizeMachine(); updateMachine(); }
  });
});

/* ================ Timeline ================ */
function renderTimeline(){
  const wrap = document.getElementById('timelineWrap');
  if(!wrap) return;
  const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
  wrap.innerHTML = '';
  EPOCHS.forEach(base=>{
    const e = getEpoch(base.id);
    const card = document.createElement('div');
    card.className = 'ep-card';
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
    `;
    card.onclick = ()=>{
      // Jump to Time Machine at this epoch
      const slider = document.getElementById('timeSlider');
      slider.value = Math.log10(base.tsec);
      document.querySelector('.tab[data-tab="machine"]').click();
    };
    wrap.appendChild(card);
  });
}

/* ================ Time Machine ================ */
const machineCanvas = document.getElementById('machineCanvas');
const mctx = machineCanvas.getContext('2d');
let MW=0, MH=0;
function resizeMachine(){
  const r = machineCanvas.getBoundingClientRect();
  machineCanvas.width = r.width*devicePixelRatio;
  machineCanvas.height = r.height*devicePixelRatio;
  mctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  MW = r.width; MH = r.height;
}
window.addEventListener('resize',()=>{resizeMachine(); updateMachine();});

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
  const lang = window.CURRENT_LANG || 'en';
  const zh = lang==='zh-CN';
  if(tsec < 1e-30) return `10^${Math.round(Math.log10(tsec))} ${zh?'秒':'s'}`;
  if(tsec < 1e-15) return tsec.toExponential(1)+' '+(zh?'秒':'s');
  if(tsec < 1)     return tsec.toExponential(2)+' '+(zh?'秒':'s');
  if(tsec < 60)    return tsec.toFixed(1)+' '+(zh?'秒':'s');
  if(tsec < 3600)  return (tsec/60).toFixed(1)+' '+(zh?'分钟':'min');
  if(tsec < 86400) return (tsec/3600).toFixed(1)+' '+(zh?'小时':'hr');
  const yr = tsec/3.156e7;
  if(yr < 1)       return (yr*365).toFixed(1)+' '+(zh?'天':'days');
  if(yr < 1000)    return yr.toFixed(0)+' '+(zh?'年':'yr');
  if(yr < 1e6)     return (yr/1e3).toFixed(1)+' '+(zh?'千年':'kyr');
  if(yr < 1e9)     return (yr/1e6).toFixed(1)+' '+(zh?'百万年':'Myr');
  if(yr < 1e12)    return (yr/1e9).toFixed(2)+' '+(zh?'亿年':'Gyr');
  return `10^${Math.round(Math.log10(yr))} ${zh?'年':'yr'}`;
}

function updateMachine(){
  const slider = document.getElementById('timeSlider');
  if(!slider) return;
  const logT = parseFloat(slider.value);
  const tsec = Math.pow(10, logT);
  const ep = pickEpoch(tsec);
  document.getElementById('mpTime').textContent = fmtTime(tsec);
  document.getElementById('mpEpoch').textContent = ep.name || ep.id;
  document.getElementById('mpEpoch').style.color = ep.color;
  document.getElementById('mpTemp').textContent = ep.temp;
  document.getElementById('mpSize').textContent = ep.size;
  document.getElementById('mpDens').textContent = ep.density;
  document.getElementById('mpDom').textContent = ep.dominant;
  document.getElementById('mpEvent').innerHTML = ep.events.slice(0,2).join('<br>');
  drawMachine(tsec, ep);
}

function drawMachine(tsec, ep){
  if(MW===0) return;
  mctx.clearRect(0,0,MW,MH);
  // background nebula
  const g = mctx.createRadialGradient(MW/2, MH/2, 0, MW/2, MH/2, Math.max(MW,MH)*0.7);
  g.addColorStop(0, ep.color+'55');
  g.addColorStop(1, 'rgba(2,3,10,0)');
  mctx.fillStyle = g;
  mctx.fillRect(0,0,MW,MH);

  // Central "universe" visualization — a growing bubble whose look changes with epoch
  const cx = MW/2, cy = MH/2;
  const logT = Math.log10(Math.max(tsec,1e-43));
  // Map log(t) from -43 → 18 into radius 20 → 190
  const radius = 20 + ((logT + 43) / (18 + 43)) * 170;

  // Glow
  const gr = mctx.createRadialGradient(cx,cy,0,cx,cy,radius*2.2);
  gr.addColorStop(0, ep.color+'ff');
  gr.addColorStop(0.4, ep.color+'55');
  gr.addColorStop(1, ep.color+'00');
  mctx.fillStyle = gr;
  mctx.beginPath(); mctx.arc(cx,cy,radius*2.2,0,Math.PI*2); mctx.fill();

  // Core disk
  mctx.fillStyle = ep.color;
  mctx.beginPath(); mctx.arc(cx,cy,radius,0,Math.PI*2); mctx.fill();

  // Draw scatter dots representing "content" (density of particles / stars)
  mctx.fillStyle = 'rgba(255,255,255,0.7)';
  const nDots = Math.min(300, Math.max(20, Math.floor(radius * 1.2)));
  for(let i=0;i<nDots;i++){
    const a = (i / nDots) * Math.PI * 2 + (i*0.31);
    const r = radius * (0.2 + Math.random()*0.75);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const s = Math.random()*1.6 + 0.4;
    mctx.beginPath(); mctx.arc(x,y,s,0,Math.PI*2); mctx.fill();
  }

  // Ring for horizon
  mctx.strokeStyle = ep.color;
  mctx.lineWidth = 1.5;
  mctx.setLineDash([4,6]);
  mctx.beginPath(); mctx.arc(cx,cy,radius,0,Math.PI*2); mctx.stroke();
  mctx.setLineDash([]);
}

/* ================ Composition ================ */
const COMP_COLORS = {
  baryon:'#ffd166', dm:'#7c5cff', de:'#5aa8ff',
  photon:'#ff6b9d', neutrino:'#7ee8c5',
  radiation:'#ff6b9d', plasma:'#ffb547'
};

function renderComposition(){
  const grid = document.getElementById('compGrid');
  if(!grid) return;
  const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
  const snapshots = [
    {key:'now',    labelKey:'comp.today',  data: COMPOSITIONS.now},
    {key:'recomb', labelKey:'comp.recomb', data: COMPOSITIONS.recomb},
    {key:'nucleo', labelKey:'comp.nucleo', data: COMPOSITIONS.nucleo}
  ];
  grid.innerHTML = '';
  snapshots.forEach(sn=>{
    const c = document.createElement('div');
    c.className='comp-card';
    const label = dict[sn.labelKey] || sn.labelKey;
    c.innerHTML = `
      <h3>${label}</h3>
      <div class="pie-holder">${buildPieSvg(sn.data)}</div>
      <div class="comp-legend">
        ${sn.data.map(row=>{
          const name = dict['comp.legend.'+row.k] || row.k;
          const col = COMP_COLORS[row.k] || '#fff';
          return `<div class="cl-row"><div class="cl-dot" style="background:${col}"></div><div class="cl-name">${name}</div><div class="cl-val">${row.v}%</div></div>`;
        }).join('')}
      </div>
    `;
    grid.appendChild(c);
  });
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
    const col = COMP_COLORS[row.k] || '#fff';
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${col}" opacity="0.85" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`;
    startAngle = endAngle;
  });
  return `<svg viewBox="0 0 200 200">${paths}</svg>`;
}

/* ================ Scale ================ */
const SCALE_ROWS = [
  {t:'10⁻³⁵ s',    tzh:'10⁻³⁵ 秒', size:'10⁻²⁷ m (subatomic)', sizezh:'10⁻²⁷ 米(比原子小)',           frac:0.005, compare:'A billion times smaller than a proton', comparezh:'比质子还小十亿倍'},
  {t:'10⁻³² s',    tzh:'10⁻³² 秒', size:'a marble (~1 cm)',    sizezh:'一颗弹珠(约 1 cm)',              frac:0.02,  compare:'After cosmic inflation', comparezh:'刚经历宇宙暴胀之后'},
  {t:'1 s',        tzh:'1 秒',    size:'~2 light-years',      sizezh:'~2 光年',                        frac:0.1,   compare:'Reaches Alpha Centauri', comparezh:'可达半人马座 α 星'},
  {t:'3 min',      tzh:'3 分钟',   size:'~a few light-years',  sizezh:'~几光年',                        frac:0.15,  compare:'BBN complete', comparezh:'原初核合成结束'},
  {t:'380,000 yr', tzh:'38 万年', size:'~42 million ly',      sizezh:'~4200 万光年',                   frac:0.28,  compare:'CMB released', comparezh:'CMB 光被释放'},
  {t:'500 Myr',    tzh:'5 亿年', size:'~5 Gly',                sizezh:'~50 亿光年',                     frac:0.5,   compare:'First stars', comparezh:'第一批恒星'},
  {t:'9.2 Gyr',    tzh:'92 亿年',size:'~50 Gly',               sizezh:'~500 亿光年',                    frac:0.85,  compare:'Solar system forms', comparezh:'太阳系形成'},
  {t:'13.8 Gyr',   tzh:'138 亿年',size:'93 billion ly (diam.)',sizezh:'930 亿光年(直径)',              frac:1.0,   compare:'Today', comparezh:'今天'}
];
function renderScale(){
  const wrap = document.getElementById('scaleWrap');
  if(!wrap) return;
  const zh = (window.CURRENT_LANG||'en')==='zh-CN';
  wrap.innerHTML = '';
  SCALE_ROWS.forEach(row=>{
    const el = document.createElement('div');
    el.className = 'scale-row';
    el.innerHTML = `
      <div class="scale-time">${zh ? row.tzh : row.t}</div>
      <div class="scale-bar">
        <div class="scale-fill" style="width:${row.frac*100}%"></div>
        <div class="scale-label">${zh ? row.sizezh : row.size}</div>
      </div>
      <div class="scale-compare"><b>${zh ? row.comparezh : row.compare}</b></div>
    `;
    wrap.appendChild(el);
  });
}

/* ================ Fates ================ */
function renderFates(){
  const grid = document.getElementById('fatesGrid');
  if(!grid) return;
  const lang = window.CURRENT_LANG || 'en';
  const list = FATES[lang] || FATES.en;
  grid.innerHTML = '';
  list.forEach(f=>{
    const c = document.createElement('div');
    c.className='fate-card';
    c.innerHTML = `
      <div class="fate-icon">${f.icon}</div>
      <div class="fate-name">${f.name}</div>
      <div class="fate-likely">${f.likely}</div>
      <div class="fate-desc">${f.desc}</div>
    `;
    grid.appendChild(c);
  });
}

/* ================ Mysteries ================ */
function renderMysteries(){
  const grid = document.getElementById('mysteriesGrid');
  if(!grid) return;
  const lang = window.CURRENT_LANG || 'en';
  const list = MYSTERIES[lang] || MYSTERIES.en;
  grid.innerHTML = '';
  list.forEach(m=>{
    const c = document.createElement('div');
    c.className='myst-card';
    c.innerHTML = `<div class="myst-q">${m.name}</div><div class="myst-d">${m.desc}</div>`;
    grid.appendChild(c);
  });
}

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
  const cx = BGW/2, cy = BGH/2;
  for(const s of bgStars){
    s.z -= 1.2;
    if(s.z < 1){ s.z = BGW; s.x = (Math.random()-0.5)*BGW; s.y = (Math.random()-0.5)*BGH; }
    const k = 128 / s.z;
    const px = cx + s.x * k;
    const py = cy + s.y * k;
    if(px<0||px>BGW||py<0||py>BGH) continue;
    const size = (1 - s.z/BGW) * 2.2;
    bgCtx.fillStyle = `hsla(${s.hue},80%,80%,${1 - s.z/BGW})`;
    bgCtx.beginPath(); bgCtx.arc(px,py,size,0,Math.PI*2); bgCtx.fill();
  }
  requestAnimationFrame(drawBg);
}
drawBg();

/* ================ Slider ================ */
document.getElementById('timeSlider').addEventListener('input', updateMachine);

/* ================ Language switch ================ */
document.querySelectorAll('.lang-pill').forEach(b=>{
  b.addEventListener('click',()=>{
    const lang = b.dataset.lang;
    try{ localStorage.setItem('bb-lang',lang); }catch(_){}
    applyI18n(lang);
    renderScale();
  });
});
const savedLang = (()=>{ try{ return localStorage.getItem('bb-lang'); }catch(_){ return null; } })();
const browserLang = (navigator.language||'').toLowerCase();
const initLang = savedLang || (browserLang.startsWith('zh') ? 'zh-CN' : 'en');
applyI18n(initLang);
renderScale();

/* Initial machine paint */
setTimeout(()=>{ resizeMachine(); updateMachine(); }, 80);
