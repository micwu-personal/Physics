/* ==================== B1: NUCLIDE CHART (Segrè chart) ====================
   Full-screen canvas view: N (neutrons) on x-axis, Z (protons) on y-axis.
   Every known/notable isotope from F_NUCLIDES is rendered as a colored square.
   Decay-mode color legend, hover tooltip, wheel-zoom, drag-to-pan.
=========================================================================== */
(function(){

  const DECAY_COLORS = {
    'S':  '#5aff8a',  // stable — green
    'B-': '#48dbfb',  // beta minus — cyan
    'B+': '#ff9f43',  // beta plus / EC — orange
    'A':  '#ffd166',  // alpha — yellow
    'SF': '#ff6b6b',  // spontaneous fission — red
    'P':  '#c77dff',  // proton emission — purple
    'N':  '#a29bfe',  // neutron emission — lavender
    '?':  '#666',     // unknown
  };
  const DECAY_KEYS = {
    'S':'nuc.decay.stable', 'B-':'nuc.decay.bminus', 'B+':'nuc.decay.bplus',
    'A':'nuc.decay.alpha',  'SF':'nuc.decay.sf',    'P':'nuc.decay.p',
    'N':'nuc.decay.n',      '?':'nuc.decay.unknown',
  };

  // Magic numbers (nuclear shell closures)
  const MAGIC = [2,8,20,28,50,82,126];

  let root=null, canvas=null, ctx=null, tipEl=null;
  let scale = 5;              // pixels per unit
  let panX = 40, panY = 40;   // top-left offset (px)
  let dragging = false, dragStartX = 0, dragStartY = 0;
  let hoverNuc = null;
  let rafId = 0;

  function ensureRoot(){
    if (root) return root;
    root = document.createElement('div');
    root.className = 'nuclide-view';
    root.id = 'nuclideView';
    root.innerHTML = `
      <div class="nuclide-header">
        <h2 data-i18n="nuc.chart.title">Nuclide Chart</h2>
        <span style="color:var(--dim);font-size:12px" data-i18n="nuc.chart.hint">Zoom with wheel · drag to pan</span>
        <div class="spacer"></div>
        <button class="nuclide-back" id="nuclideBack" data-i18n="nuc.chart.close">Back</button>
      </div>
      <div class="nuclide-legend" id="nuclideLegend"></div>
      <div class="nuclide-body" id="nuclideBody">
        <canvas id="nuclideCanvas"></canvas>
        <div class="nuclide-tip" id="nuclideTip"></div>
      </div>`;
    document.body.appendChild(root);

    canvas = root.querySelector('#nuclideCanvas');
    ctx = canvas.getContext('2d');
    tipEl = root.querySelector('#nuclideTip');

    root.querySelector('#nuclideBack').addEventListener('click', close);
    buildLegend();

    const body = root.querySelector('#nuclideBody');
    let dragStartPanX = 0, dragStartPanY = 0, dragStartMouseX = 0, dragStartMouseY = 0;

    body.addEventListener('wheel', ev => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
      const h = canvas.height / (window.devicePixelRatio || 1);
      const worldN = (mx - panX) / scale;
      const worldZ = (h - my - panY) / scale;
      const delta = ev.deltaY > 0 ? 0.85 : 1.18;
      scale = Math.max(1, Math.min(30, scale * delta));
      panX = mx - worldN * scale;
      panY = (h - my) - worldZ * scale;
      draw();
    }, {passive:false});

    body.addEventListener('pointerdown', ev => {
      dragging = true;
      dragStartPanX = panX; dragStartPanY = panY;
      dragStartMouseX = ev.clientX; dragStartMouseY = ev.clientY;
      body.classList.add('dragging');
      body.setPointerCapture(ev.pointerId);
    });
    body.addEventListener('pointermove', ev => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
      if (dragging){
        panX = dragStartPanX + (ev.clientX - dragStartMouseX);
        // Y is bottom-anchored — mouse moving down (positive dY) decreases panY
        panY = dragStartPanY - (ev.clientY - dragStartMouseY);
        draw();
      }
      const nc = pickNuclide(mx, my);
      if (nc !== hoverNuc){
        hoverNuc = nc;
        if (nc) showTip(nc, mx, my);
        else tipEl.classList.remove('on');
      } else if (nc){
        showTip(nc, mx, my);
      }
    });
    body.addEventListener('pointerup', ()=>{ dragging=false; body.classList.remove('dragging'); });
    body.addEventListener('pointercancel', ()=>{ dragging=false; body.classList.remove('dragging'); });

    window.addEventListener('resize', ()=>{ if (root.classList.contains('on')) resize(); });

    return root;
  }

  function buildLegend(){
    const leg = root.querySelector('#nuclideLegend');
    leg.innerHTML = Object.keys(DECAY_COLORS).map(k =>
      `<span class="nl-item"><span class="nl-dot" style="background:${DECAY_COLORS[k]}"></span>${t(DECAY_KEYS[k])}</span>`
    ).join('');
  }

  function resize(){
    const rect = root.querySelector('#nuclideBody').getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    // Initial framing: fit N=0..180, Z=0..120
    const targetN = 180, targetZ = 120;
    const sX = (rect.width - 60) / targetN;
    const sY = (rect.height - 60) / targetZ;
    scale = Math.min(sX, sY);
    panX = 50;
    panY = 50;
    draw();
  }

  function pickNuclide(mx, my){
    // Convert screen → world
    const N = (mx - panX) / scale;
    const Zw = (canvas.height/(window.devicePixelRatio||1) - my - panY) / scale;
    // Find closest
    let best = null, bestD = 999;
    for (const nc of F_NUCLIDES){
      const dN = nc[1] - N, dZ = nc[0] - Zw;
      const d = Math.hypot(dN, dZ);
      if (d < bestD && d < 1.5/Math.max(0.5, scale/4)){
        bestD = d; best = nc;
      }
    }
    return best;
  }

  function showTip(nc, x, y){
    const [Z, N, decay, hl] = nc;
    const el = ELEMENTS[Z];
    if (!el) { tipEl.classList.remove('on'); return; }
    const A = Z + N;
    const halfTxt = (typeof hl === 'string') ? hl : formatHalfLife(hl);
    const magicZ = MAGIC.includes(Z), magicN = MAGIC.includes(N);
    const magicTxt = magicZ && magicN ? `<div style="color:#ffe08a">✦ ${t('nuc.doubly')}</div>` :
                     (magicZ||magicN) ? `<div style="color:#ffe08a">✦ ${t('nuc.magic')}</div>` : '';
    tipEl.innerHTML = `
      <div class="nt-sym"><sup>${A}</sup>${el.symbol}</div>
      <div>Z=${Z}, N=${N}</div>
      <div class="nt-mode">${t(DECAY_KEYS[decay]||'nuc.decay.unknown')}</div>
      <div>${t('nuc.tip.half')}: ${halfTxt}</div>
      ${magicTxt}`;
    // Position tooltip near cursor
    tipEl.style.left = (x + 14) + 'px';
    tipEl.style.top = (y + 14) + 'px';
    tipEl.classList.add('on');
  }

  function formatHalfLife(s){
    if (s === 'stable' || s == null) return 'stable';
    if (s > 3.15e16) return (s/3.15e16).toPrecision(3) + ' Gyr';
    if (s > 3.15e13) return (s/3.15e13).toPrecision(3) + ' Myr';
    if (s > 3.15e10) return (s/3.15e10).toPrecision(3) + ' kyr';
    if (s > 3.15e7)  return (s/3.15e7).toPrecision(3) + ' yr';
    if (s > 86400)   return (s/86400).toPrecision(3) + ' d';
    if (s > 3600)    return (s/3600).toPrecision(3) + ' h';
    if (s > 60)      return (s/60).toPrecision(3) + ' min';
    if (s > 1)       return s.toPrecision(3) + ' s';
    if (s > 1e-3)    return (s*1e3).toPrecision(3) + ' ms';
    if (s > 1e-6)    return (s*1e6).toPrecision(3) + ' μs';
    return s.toExponential(2) + ' s';
  }

  function draw(){
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // Axes / grid — every 10 units
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let n=0; n<=200; n+=10){
      const x = panX + n*scale;
      if (x < 20 || x > w) continue;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      if (n%20===0) ctx.fillText('N='+n, x+2, h - 6);
    }
    for (let z=0; z<=120; z+=10){
      const y = h - z*scale - panY;
      if (y < 0 || y > h - 20) continue;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      if (z%20===0) ctx.fillText('Z='+z, 4, y - 4);
    }

    // Magic-number gridlines (brighter)
    ctx.strokeStyle = 'rgba(255,220,120,0.35)';
    ctx.setLineDash([4,4]);
    for (const m of MAGIC){
      const x = panX + m*scale;
      const y = h - m*scale - panY;
      if (x > 0 && x < w){ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      if (y > 0 && y < h){ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
    ctx.setLineDash([]);

    // N=Z diagonal
    ctx.strokeStyle = 'rgba(0,212,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(panX, h - panY);
    ctx.lineTo(panX + 200*scale, h - 200*scale - panY);
    ctx.stroke();

    // Nuclides
    const size = Math.max(2, scale * 0.85);
    for (const nc of F_NUCLIDES){
      const [Z, N, decay] = nc;
      const x = panX + N*scale;
      const y = h - Z*scale - panY;
      if (x < -size || x > w+size || y < -size || y > h+size) continue;
      ctx.fillStyle = DECAY_COLORS[decay] || '#666';
      ctx.fillRect(x - size/2, y - size/2, size, size);
      if (MAGIC.includes(Z) && MAGIC.includes(N)){
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
      }
    }

    // Axis labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText(t('nuc.axis.n'), w - 80, h - 20);
    ctx.save();
    ctx.translate(18, 60);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(t('nuc.axis.z'), 0, 0);
    ctx.restore();
  }

  function open(){
    ensureRoot().classList.add('on');
    document.body.style.overflow = 'hidden';
    resize();
  }
  function close(){
    if (!root) return;
    root.classList.remove('on');
    document.body.style.overflow = '';
  }

  function addOpenButton(){
    const bar = document.getElementById('viewToolbar');
    if (!bar || document.getElementById('nuclideOpenBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'nuclideOpenBtn';
    btn.className = 'view-btn special';
    btn.textContent = '⚛ ' + t('nuc.chart.open');
    btn.addEventListener('click', open);
    bar.appendChild(btn);
  }

  function refreshLang(){
    const btn = document.getElementById('nuclideOpenBtn');
    if (btn) btn.textContent = '⚛ ' + t('nuc.chart.open');
    if (root){
      buildLegend();
      const back = root.querySelector('#nuclideBack');
      if (back) back.textContent = t('nuc.chart.close');
      const h2 = root.querySelector('h2');
      if (h2) h2.textContent = t('nuc.chart.title');
      if (root.classList.contains('on')) draw();
    }
  }
  new MutationObserver(refreshLang).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});

  window.__B1 = { open, close };

  function init(){
    addOpenButton();
  }
  function bootstrap(){ setTimeout(init, 250); }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
