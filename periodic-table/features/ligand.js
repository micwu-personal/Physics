/* ==================== C5: LIGAND-FIELD SPLITTING → COLOR ====================
   For each transition-metal element (with d-electrons), inject a card into
   the detail panel below Signature Colors. User picks a ligand from the
   spectrochemical series; app draws:
     - t₂g/eₙ splitting diagram at correct Δ_oct magnitude
     - the absorbed photon (wavelength = hc/Δ)
     - the observed complementary color
============================================================================= */
(function(){

  // Ligands in spectrochemical order (weak → strong). Δ values in cm⁻¹ for [M(L)₆]
  // Values are typical for M³⁺ (e.g. Cr³⁺, Fe³⁺, Co³⁺). Approximate.
  const LIGANDS = [
    {id:'I',   labelKey:'lf.spec.i',   f:0.4},
    {id:'Br',  labelKey:'lf.spec.br',  f:0.72},
    {id:'Cl',  labelKey:'lf.spec.cl',  f:0.78},
    {id:'F',   labelKey:'lf.spec.f',   f:0.9},
    {id:'OH',  labelKey:'lf.spec.oh',  f:0.94},
    {id:'H2O', labelKey:'lf.spec.h2o', f:1.00},
    {id:'NH3', labelKey:'lf.spec.nh3', f:1.25},
    {id:'en',  labelKey:'lf.spec.en',  f:1.28},
    {id:'CN',  labelKey:'lf.spec.cn',  f:1.7},
    {id:'CO',  labelKey:'lf.spec.co',  f:1.9},
  ];

  // Metal-ion contribution g (Δ ≈ f × g in units of cm⁻¹) — Jørgensen model
  // Only listing common M²⁺/M³⁺ ions from period 4. Key: 'symbol+charge'.
  const METALS = {
    'Ti3': 20300, 'V2': 12300, 'V3': 17700,
    'Cr2': 14000, 'Cr3': 17400, 'Mn2': 8500, 'Mn3': 21000,
    'Fe2': 10000, 'Fe3': 14000, 'Co2': 9300, 'Co3': 18200,
    'Ni2': 8700, 'Cu2': 12500,
    // Period 5 heavier metals (larger Δ)
    'Ru2': 20000, 'Ru3': 28000, 'Rh3': 27000, 'Pd2': 25500,
    // Period 6
    'Ir3': 32000, 'Pt2': 30000,
  };

  /* Convert wavenumber (cm⁻¹) → wavelength (nm) */
  function cmToNm(cm){ return 1e7 / cm; }

  /* Convert wavelength in nm → sRGB color (visible 380..780) — approx */
  function wavelengthToRGB(wl){
    let r=0,g=0,b=0;
    if (wl >= 380 && wl < 440){ r = -(wl - 440)/60; b = 1; }
    else if (wl >= 440 && wl < 490){ g = (wl - 440)/50; b = 1; }
    else if (wl >= 490 && wl < 510){ g = 1; b = -(wl - 510)/20; }
    else if (wl >= 510 && wl < 580){ r = (wl - 510)/70; g = 1; }
    else if (wl >= 580 && wl < 645){ r = 1; g = -(wl - 645)/65; }
    else if (wl >= 645 && wl <= 780){ r = 1; }
    // Intensity falloff near edges
    let factor = 1;
    if (wl < 420) factor = 0.3 + 0.7*(wl-380)/40;
    else if (wl > 700) factor = 0.3 + 0.7*(780-wl)/80;
    const gamma = 0.8;
    const clamp = v => Math.max(0, Math.min(255, Math.round(255 * Math.pow(v * factor, gamma))));
    return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
  }

  /* Complementary sRGB (for observed color = white minus absorbed) */
  function complementary(rgbStr){
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgbStr);
    if (!m) return '#888';
    const r = 255 - parseInt(m[1],10);
    const g = 255 - parseInt(m[2],10);
    const b = 255 - parseInt(m[3],10);
    return `rgb(${r},${g},${b})`;
  }

  /* Does this element form colored octahedral complexes? Only d¹..d⁹ transition metals. */
  function isChromophore(z){
    const el = ELEMENTS[z];
    if (!el) return false;
    if (el.category !== 'transition') return false;
    // d⁰ (Sc³⁺, Ti⁴⁺, Y³⁺, Zr⁴⁺) and d¹⁰ (Zn²⁺, Cd²⁺, Hg²⁺, Cu⁺, Ag⁺) generally colorless
    const d0 = [21, 39, 71]; // group-3 d⁰
    const d10 = [30, 48, 80]; // Zn, Cd, Hg (as M²⁺ d¹⁰)
    if (d0.includes(z) || d10.includes(z)) return false;
    return true;
  }

  /* Pick default metal key for this Z */
  function defaultMetal(z){
    const el = ELEMENTS[z];
    if (!el) return null;
    const sym = el.symbol;
    // Prefer the most common charge (heuristic)
    const preferred = {
      22:'Ti3', 23:'V3', 24:'Cr3', 25:'Mn2', 26:'Fe3', 27:'Co2',
      28:'Ni2', 29:'Cu2',
      44:'Ru3', 45:'Rh3', 46:'Pd2',
      77:'Ir3', 78:'Pt2',
    };
    if (preferred[z]) return preferred[z];
    // Fallback: any key starting with symbol
    for (const k of Object.keys(METALS)){
      if (k.startsWith(sym)) return k;
    }
    return null;
  }

  function findColorsBlock(){
    // Locate the existing "Signature Colors" block (h3 has data-i18n="detail.section.colors")
    const h3s = document.querySelectorAll('.d-block h3');
    for (const h of h3s){
      if (h.getAttribute('data-i18n') === 'detail.section.colors') return h.closest('.d-block');
    }
    return null;
  }

  function ensureLFBlock(){
    let block = document.getElementById('lfBlock');
    if (block) return block;
    const colors = findColorsBlock();
    if (!colors) return null;
    block = document.createElement('div');
    block.className = 'd-block';
    block.id = 'lfBlock';
    block.innerHTML = `
      <h3 data-i18n="lf.title">Ligand-Field Splitting → Color</h3>
      <div id="lfContent"></div>`;
    colors.parentNode.insertBefore(block, colors.nextSibling);
    return block;
  }

  function render(){
    const block = ensureLFBlock();
    if (!block) return;
    // Determine current Z from active cell
    const active = document.querySelector('.cell.active');
    if (!active) { block.style.display = 'none'; return; }
    const z = parseInt(active.dataset.z, 10);
    if (!z) { block.style.display = 'none'; return; }

    if (!isChromophore(z)){
      block.style.display = '';
      block.querySelector('#lfContent').innerHTML = `<div class="lf-na">${t('lf.na')}</div>`;
      return;
    }
    block.style.display = '';

    const metalKey = block.dataset.metal || defaultMetal(z);
    if (!metalKey){
      block.querySelector('#lfContent').innerHTML = `<div class="lf-na">${t('lf.na')}</div>`;
      return;
    }
    block.dataset.metal = metalKey;
    const ligandId = block.dataset.ligand || 'H2O';
    block.dataset.ligand = ligandId;

    const g = METALS[metalKey];
    const lig = LIGANDS.find(l=>l.id===ligandId) || LIGANDS[5];
    const delta_cm = g * lig.f;                        // Δ_oct in cm⁻¹
    const wl_nm = cmToNm(delta_cm);
    const inVisible = wl_nm >= 380 && wl_nm <= 780;
    const absorbedColor = inVisible ? wavelengthToRGB(wl_nm) : '#333';
    const observedColor = inVisible ? complementary(absorbedColor) : '#e8ecff';
    const observedName = inVisible ? nearestColorName(observedColor)
      : (wl_nm > 780
          ? (window.CURRENT_LANG==='zh-CN'?'吸收红外 · 无色':'IR absorption · colorless')
          : (window.CURRENT_LANG==='zh-CN'?'吸收紫外 · 无色':'UV absorption · colorless'));

    const chargeLabel = metalKey.replace(/(\D+)(\d)/, '$1<sup>$2+</sup>');

    block.querySelector('#lfContent').innerHTML = `
      <div class="lf-controls">
        <div class="lf-picker">
          <div class="lf-picker-label">${t('lf.metal')} <b style="color:#fff">${chargeLabel}</b></div>
          <div class="lf-ligand-list">
            ${Object.keys(METALS).filter(k=>k.startsWith(ELEMENTS[z].symbol)).map(k => {
              const active = k === metalKey ? ' active' : '';
              return `<button class="lf-lig-btn${active}" data-metal="${k}">${k.replace(/(\D+)(\d)/,'$1<sup>$2+</sup>')}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="lf-picker">
          <div class="lf-picker-label">${t('lf.pick')}</div>
          <div class="lf-ligand-list">
            ${LIGANDS.map(L => {
              const activeCls = L.id === ligandId ? ' active' : '';
              return `<button class="lf-lig-btn${activeCls}" data-lig="${L.id}">${t(L.labelKey)}</button>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="lf-diagram-row">
        <div class="lf-diagram">
          <canvas id="lfDiagram"></canvas>
          <div class="lf-caption">Δ<sub>oct</sub> = ${delta_cm.toFixed(0)} cm⁻¹ · λ = ${wl_nm.toFixed(0)} nm</div>
        </div>
        <div class="lf-color-out">
          <div class="lf-row">
            <div class="lf-swatch" style="background:${absorbedColor}"></div>
            <div class="lf-swatch-info">
              <div class="lf-swatch-label">${t('lf.absorbed')}</div>
              <div class="lf-swatch-name">${absorbedColor}</div>
              <div class="lf-swatch-nm">λ = ${wl_nm.toFixed(0)} nm</div>
            </div>
          </div>
          <div class="lf-row">
            <div class="lf-swatch" style="background:${observedColor}"></div>
            <div class="lf-swatch-info">
              <div class="lf-swatch-label">${t('lf.observed')}</div>
              <div class="lf-swatch-name">${observedName}</div>
              <div class="lf-swatch-nm" style="color:var(--dim)">${observedColor}</div>
            </div>
          </div>
          <div class="d-hint">${t('lf.hint')}</div>
        </div>
      </div>`;

    // Wire ligand buttons
    block.querySelectorAll('[data-lig]').forEach(b => b.addEventListener('click', ()=>{
      block.dataset.ligand = b.dataset.lig; render();
    }));
    block.querySelectorAll('[data-metal]').forEach(b => b.addEventListener('click', ()=>{
      block.dataset.metal = b.dataset.metal; render();
    }));

    // Draw diagram
    drawSplitDiagram(block.querySelector('#lfDiagram'), delta_cm, ligandId);
  }

  /* Nearest named color (approximate) */
  function nearestColorName(rgbStr){
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgbStr);
    if (!m) return '';
    const r = parseInt(m[1],10), g = parseInt(m[2],10), b = parseInt(m[3],10);
    const named = window.CURRENT_LANG === 'zh-CN'
      ? [['红',255,0,0],['橙',255,140,0],['黄',255,220,0],['绿',0,200,80],['青',0,200,220],['蓝',30,80,220],['紫',150,60,200],['粉',255,120,180],['白',240,240,240],['黑',30,30,30]]
      : [['red',255,0,0],['orange',255,140,0],['yellow',255,220,0],['green',0,200,80],['cyan',0,200,220],['blue',30,80,220],['violet',150,60,200],['pink',255,120,180],['white',240,240,240],['black',30,30,30]];
    let best = named[0], bd = 1e9;
    for (const n of named){
      const d = (r-n[1])**2 + (g-n[2])**2 + (b-n[3])**2;
      if (d < bd){ bd = d; best = n; }
    }
    return best[0];
  }

  function drawSplitDiagram(canvas, delta_cm, ligandId){
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.height = '200px';
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = 200;
    c.clearRect(0,0,W,H);

    // Split scaled: max Δ ≈ 40000 cm⁻¹; canvas gap max = H*0.5
    const gap = Math.min(H*0.5, (delta_cm / 40000) * H * 0.55) + 20;
    const midY = H/2 - 4;
    const t2gY = midY + gap/2;
    const egY  = midY - gap/2;

    // Central "unsplit" reference (dashed)
    c.strokeStyle = 'rgba(255,255,255,0.25)';
    c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(30, midY); c.lineTo(W-30, midY); c.stroke();
    c.setLineDash([]);

    // t₂g (3 lines)
    c.strokeStyle = '#48dbfb'; c.lineWidth = 3;
    for (let i=0; i<3; i++){
      const x0 = W*0.55 + (i - 1)*24;
      c.beginPath();
      c.moveTo(x0 - 20, t2gY);
      c.lineTo(x0 + 20, t2gY);
      c.stroke();
    }
    // eₙ (2 lines)
    c.strokeStyle = '#ff9f43';
    for (let i=0; i<2; i++){
      const x0 = W*0.55 + (i - 0.5)*40;
      c.beginPath();
      c.moveTo(x0 - 20, egY);
      c.lineTo(x0 + 20, egY);
      c.stroke();
    }

    // Δ arrow
    c.strokeStyle = '#fff'; c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(W*0.55 + 90, egY);
    c.lineTo(W*0.55 + 90, t2gY);
    c.stroke();
    // Arrowheads
    for (const y of [egY, t2gY]){
      const dir = (y === egY) ? 1 : -1;
      c.beginPath();
      c.moveTo(W*0.55 + 90, y);
      c.lineTo(W*0.55 + 86, y + 6*dir);
      c.lineTo(W*0.55 + 94, y + 6*dir);
      c.closePath(); c.fillStyle='#fff'; c.fill();
    }

    // Labels
    c.fillStyle = '#48dbfb';
    c.font = 'bold 13px "Space Grotesk", sans-serif';
    c.fillText('t₂g', W*0.55 - 60, t2gY + 5);
    c.fillStyle = '#ff9f43';
    c.fillText('eₙ', W*0.55 - 60, egY + 5);
    c.fillStyle = '#fff';
    c.font = '12px "JetBrains Mono", monospace';
    c.fillText('Δ', W*0.55 + 100, midY + 5);

    // Photon arrow (curly wave from left to arrow center)
    c.strokeStyle = 'rgba(255,220,120,0.8)';
    c.lineWidth = 2;
    c.beginPath();
    const startX = 60, endX = W*0.55 - 20, waveY = midY;
    const nWaves = 8;
    for (let i = 0; i <= nWaves; i++){
      const x = startX + (endX - startX) * i / nWaves;
      const y = waveY + Math.sin(i * Math.PI) * 8;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.fillStyle = 'rgba(255,220,120,0.9)';
    c.font = '10px "JetBrains Mono", monospace';
    c.fillText('hν', 30, waveY - 4);
  }

  /* Observe the detail panel to re-render whenever it changes */
  function attachObserver(){
    const detail = document.getElementById('detail');
    if (!detail) return;
    const dName = document.getElementById('dName');
    if (dName){
      new MutationObserver(()=>{ setTimeout(render, 30); })
        .observe(dName, {childList:true, characterData:true, subtree:true});
    }
    new MutationObserver(()=>{
      if (!detail.classList.contains('hidden')) setTimeout(render, 30);
    }).observe(detail, {attributes:true, attributeFilter:['class']});
  }

  function refreshLang(){
    // Re-render on language change to update labels
    if (document.getElementById('lfBlock')) render();
  }
  new MutationObserver(refreshLang).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});

  window.__C5 = { render };

  function init(){
    attachObserver();
    setTimeout(render, 400);
  }
  function bootstrap(){ setTimeout(init, 350); }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
