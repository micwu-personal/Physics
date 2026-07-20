/* ==================== F1: PROPERTY OVERLAYS ====================
   Toolbar above the periodic table with buttons that recolor every
   cell on a gradient scale based on one numeric property.
   Runs post-init, monkey-patches makeCell via a post-render hook.
================================================================== */
(function(){
  const OVERLAYS = [
    {id:'default', key:'ov.default', special:false},
    {id:'radius',  key:'ov.radius',  data:F_RADIUS,    unitKey:'ov.unit.pm',  lo:'#1a2a5a', hi:'#ff6b9d', fmt:v=>v+' pm'},
    {id:'ie',      key:'ov.ie',      data:F_IE,        unitKey:'ov.unit.kj',  lo:'#0a3a4a', hi:'#feca57', fmt:v=>v+''},
    {id:'en',      key:'ov.en',      dataFn:z=>ELEMENTS[z]?.electronegativity, unitKey:null, lo:'#1a1a5a', hi:'#00d4ff', fmt:v=>v.toFixed(2)},
    {id:'density', key:'ov.density', data:F_DENSITY,   unitKey:'ov.unit.gcc', lo:'#0e2a15', hi:'#ff8ac9', fmt:v=>v.toFixed(2), log:true},
    {id:'melt',    key:'ov.melt',    data:F_MELT,      unitKey:'ov.unit.k',   lo:'#0a2a4a', hi:'#ff6b6b', fmt:v=>v+''},
    {id:'year',    key:'ov.year',    dataFn:z=>(typeof DISCOVERY==='object'&&DISCOVERY[z])?DISCOVERY[z][0]:null, unitKey:'ov.unit.year', lo:'#3a1a5a', hi:'#feca57', fmt:v=>v<0?('~'+(-v)+' BCE'):(''+v)},
    {id:'origin',  key:'ov.origin',  special:'origin'},
    {id:'abundance', key:'ov.abundance', data:F_ABUNDANCE, unitKey:'ov.unit.ppm', lo:'#0a2a2a', hi:'#5aff8a', fmt:v=>v>=1?v.toFixed(0):v.toExponential(1), log:true},
  ];

  let currentOverlay = 'default';

  /* Ensure toolbar DOM exists (created once, before .pt-wrap) */
  function ensureToolbar(){
    if (document.getElementById('viewToolbar')) return;
    const wrap = document.querySelector('.pt-wrap');
    if (!wrap) return;
    const bar = document.createElement('div');
    bar.className = 'view-toolbar';
    bar.id = 'viewToolbar';
    bar.innerHTML = `<span class="vt-label" data-i18n="ov.title">View</span>` +
      OVERLAYS.map(o=>{
        const cls = 'view-btn' + (o.id==='default'?' active':'') + (o.special?' special':'');
        return `<button class="${cls}" data-ov="${o.id}" data-i18n="${o.key}">${o.key}</button>`;
      }).join('');
    wrap.parentNode.insertBefore(bar, wrap);

    const legend = document.createElement('div');
    legend.className = 'view-legend';
    legend.id = 'viewLegend';
    legend.innerHTML = `
      <span class="vl-title" id="vlTitle">—</span>
      <span class="vl-tick" id="vlLo">0</span>
      <span class="vl-bar" id="vlBar"></span>
      <span class="vl-tick" id="vlHi">1</span>
      <span class="vl-unit" id="vlUnit"></span>
      <span class="vl-na" data-i18n="ov.legend.na">no data</span>`;
    wrap.parentNode.insertBefore(legend, wrap);

    bar.addEventListener('click', ev => {
      const b = ev.target.closest('.view-btn'); if (!b) return;
      const id = b.dataset.ov;
      bar.querySelectorAll('.view-btn').forEach(x=>x.classList.toggle('active', x===b));
      currentOverlay = id;
      applyOverlay(id);
    });
    if (typeof applyI18n === 'function' && window.CURRENT_LANG) applyI18n(window.CURRENT_LANG);
  }

  /* Map v ∈ [lo,hi] → color string (lerp between two hex colors) */
  function lerpHex(a, b, t){
    t = Math.max(0, Math.min(1, t));
    const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
    const ar = (ah>>16)&0xff, ag = (ah>>8)&0xff, ab = ah&0xff;
    const br = (bh>>16)&0xff, bg = (bh>>8)&0xff, bb = bh&0xff;
    const r = Math.round(ar + (br-ar)*t);
    const g = Math.round(ag + (bg-ag)*t);
    const c = Math.round(ab + (bb-ab)*t);
    return `rgb(${r},${g},${c})`;
  }

  function collectValues(o){
    const vals = [];
    for(let z=1; z<=118; z++){
      let v = o.data ? o.data[z] : (o.dataFn ? o.dataFn(z) : null);
      if (v == null || v === 0 && o.log) continue;
      vals.push({z, v});
    }
    return vals;
  }

  /* Apply overlay to grid */
  function applyOverlay(id){
    const cells = document.querySelectorAll('.cell:not(.empty):not(.placeholder)');
    const legend = document.getElementById('viewLegend');

    if (id === 'default'){
      cells.forEach(c => {
        c.classList.remove('overlay-on','overlay-off');
        const chip = c.querySelector('.ov-chip'); if(chip) chip.remove();
        const val = c.querySelector('.ov-value'); if(val) val.remove();
      });
      if (legend) legend.classList.remove('on');
      return;
    }

    if (id === 'origin'){
      // Discrete overlay
      cells.forEach(c => {
        const z = parseInt(c.dataset.z, 10);
        if (!z) return;
        const o = F_ORIGIN[z];
        c.classList.add('overlay-on'); c.classList.remove('overlay-off');
        let chip = c.querySelector('.ov-chip');
        if (!chip){ chip = document.createElement('div'); chip.className='ov-chip'; c.appendChild(chip); }
        chip.style.setProperty('--ov-color', F_ORIGIN_COLORS[o] || '#666');
        let val = c.querySelector('.ov-value');
        if (!val){ val = document.createElement('div'); val.className='ov-value'; c.appendChild(val); }
        val.textContent = F_ORIGIN_ICON[o] || '';
        val.style.fontSize = '11px';
      });
      // Custom legend for origins
      if (legend){
        legend.classList.add('on');
        legend.innerHTML = `<span class="vl-title">${t('ov.origin')}</span>` +
          Object.keys(F_ORIGIN_COLORS).map(k => {
            const key = 'origin.' + (k==='dwarf'?'dwarf':k);
            const label = (LOCALES[window.CURRENT_LANG]||LOCALES.en)[key] || k;
            return `<span class="nl-item"><span class="nl-dot" style="background:${F_ORIGIN_COLORS[k]}"></span>${F_ORIGIN_ICON[k]||''} ${label}</span>`;
          }).join('');
      }
      return;
    }

    const o = OVERLAYS.find(x => x.id === id);
    if (!o) return;

    const values = collectValues(o);
    if (!values.length) return;

    const raw = values.map(x=>x.v);
    let lo = Math.min(...raw), hi = Math.max(...raw);
    if (o.log){
      const nz = raw.filter(v=>v>0);
      lo = Math.log10(Math.min(...nz));
      hi = Math.log10(Math.max(...nz));
    }

    cells.forEach(c => {
      const z = parseInt(c.dataset.z, 10);
      if (!z) return;
      c.classList.add('overlay-on');
      let v = o.data ? o.data[z] : (o.dataFn ? o.dataFn(z) : null);
      let chip = c.querySelector('.ov-chip');
      let val = c.querySelector('.ov-value');
      if (v == null || (o.log && v <= 0)){
        c.classList.add('overlay-off');
        if (chip) chip.style.setProperty('--ov-color','transparent');
        if (val) val.textContent = '';
        return;
      }
      c.classList.remove('overlay-off');
      const tRaw = o.log ? Math.log10(v) : v;
      const t01 = (tRaw - lo) / (hi - lo || 1);
      if (!chip){ chip = document.createElement('div'); chip.className='ov-chip'; c.appendChild(chip); }
      chip.style.setProperty('--ov-color', lerpHex(o.lo, o.hi, t01));
      if (!val){ val = document.createElement('div'); val.className='ov-value'; c.appendChild(val); }
      val.textContent = o.fmt(v);
      val.style.fontSize = '8px';
    });

    if (legend){
      legend.classList.add('on');
      legend.innerHTML =
        `<span class="vl-title">${t(o.key)}</span>` +
        `<span class="vl-tick">${o.fmt(o.log ? Math.pow(10,lo) : lo)}</span>` +
        `<span class="vl-bar" style="background:linear-gradient(90deg,${o.lo},${o.hi})"></span>` +
        `<span class="vl-tick">${o.fmt(o.log ? Math.pow(10,hi) : hi)}</span>` +
        `<span class="vl-unit">${o.unitKey ? t(o.unitKey) : ''}</span>` +
        (o.log ? `<span class="vl-na">${(window.CURRENT_LANG==='zh-CN')?'对数刻度':'log scale'}</span>` : '');
    }
  }

  /* Init: run once at page load; and again whenever the grid rerenders */
  function init(){
    ensureToolbar();
    // Attach data-z to every cell (in case makeCell didn't)
    document.querySelectorAll('.cell').forEach(c => {
      if (c.dataset.z) return;
      const zEl = c.querySelector('.z');
      if (zEl && zEl.textContent) c.dataset.z = zEl.textContent.trim();
    });
    if (currentOverlay !== 'default') applyOverlay(currentOverlay);
  }

  /* Observe #ptGrid — every time it's rebuilt (language change etc.), re-apply overlay */
  function attachObserver(){
    const grid = document.getElementById('ptGrid');
    if (!grid) return;
    let scheduled = false;
    const obs = new MutationObserver(()=>{
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(()=>{
        scheduled = false;
        init();
      });
    });
    obs.observe(grid, {childList:true, subtree:true});
  }

  window.__F1 = { applyOverlay, init, currentOverlay: ()=>currentOverlay };

  // Initial setup after DOM is ready
  function bootstrap(){
    setTimeout(()=>{ init(); attachObserver(); }, 120);
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
