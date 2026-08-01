/* ==================== F2 + A6: DISCOVERY TIMELINE ====================
   Year slider (ancient → 2016). At any year, elements not-yet-discovered
   are dimmed. When crossing 1869 (Mendeleev's table), the classic gaps
   for eka-aluminium/eka-silicon/eka-boron/eka-manganese are highlighted
   with dashed borders and a "?" glyph, and an info card shows what
   Mendeleev predicted vs. what was later measured.
======================================================================= */
(function(){

  // Mendeleev's 1869 table had these key gaps (positions were correctly assigned
  // years before the actual discoveries)
  const EKA = {
    31: {eka:'eka-aluminium', predY:1871, actualY:1875, predBy:'Mendeleev', props:{
      predicted_en:'atomic mass ~68, density 5.9 g/cm³, low melting point, detectable by spectroscopy',
      predicted_zh:'原子量约 68、密度 5.9 g/cm³、熔点低，可用光谱法发现',
      actual_en:'atomic mass 69.72, density 5.91 g/cm³, melts at 29.76°C; found spectroscopically by Lecoq de Boisbaudran',
      actual_zh:'原子量 69.72、密度 5.91 g/cm³、熔点 29.76°C；布瓦博德朗用光谱法发现'
    }},
    32: {eka:'eka-silicon', predY:1871, actualY:1886, predBy:'Mendeleev', props:{
      predicted_en:'atomic mass ~72, density 5.5 g/cm³, dark gray, dioxide density 4.7 g/cm³',
      predicted_zh:'原子量约 72、密度 5.5 g/cm³、暗灰色，二氧化物密度约 4.7 g/cm³',
      actual_en:'atomic mass 72.63, density 5.32 g/cm³, dark gray, GeO₂ density 4.23 g/cm³',
      actual_zh:'原子量 72.63、密度 5.32 g/cm³、暗灰色，GeO₂ 密度 4.23 g/cm³'
    }},
    21: {eka:'eka-boron', predY:1871, actualY:1879, predBy:'Mendeleev', props:{
      predicted_en:'atomic mass ~44; oxide more basic than alumina; difficult to isolate',
      predicted_zh:'原子量约 44；氧化物碱性强于氧化铝；难以分离',
      actual_en:'atomic mass 44.96; Sc₂O₃ is amphoteric with basic character; discovered by Nilson',
      actual_zh:'原子量 44.96；Sc₂O₃ 为偏碱性的两性氧化物；由尼尔松发现'
    }},
    43: {eka:'eka-manganese', predY:1871, actualY:1937, predBy:'Mendeleev', props:{
      predicted_en:'similar to manganese; expected to form a heptoxide',
      predicted_zh:'性质类似锰；预计可形成七氧化物',
      actual_en:'Perrier and Segrè identified element 43 in cyclotron-irradiated molybdenum; every known isotope is radioactive',
      actual_zh:'佩里埃和塞格雷在回旋加速器辐照过的钼中确认了 43 号元素；其所有已知同位素均有放射性'
    }},
  };

  let panel=null, sliderEl=null, yearDisplay=null, infoEl=null, playBtn=null;
  let playing = false, playRAF = 0;

  const MIN_YEAR = 1650;  // pre-modern threshold
  const MAX_YEAR = 2016;  // Oganesson & friends named

  function getDiscoveryYear(z){
    // DISCOVERY[Z] = [year, who] where negative = ancient/BCE
    if (typeof DISCOVERY !== 'object' || !DISCOVERY[z]) return -3000; // treat as ancient
    return DISCOVERY[z][0];
  }

  function ensurePanel(){
    if (panel) return panel;
    const wrap = document.querySelector('.pt-wrap');
    panel = document.createElement('div');
    panel.className = 'timeline-panel';
    panel.id = 'timelinePanel';
    panel.dataset.sourceGroup = 'discovery';
    panel.innerHTML = `
      <div class="tl-header">
        <h3 data-i18n="tl.title">Discovery Timeline</h3>
        <div class="tl-year-display" id="tlYear">${MAX_YEAR}</div>
        <div class="tl-slider">
          <input type="range" id="tlSlider" min="${MIN_YEAR}" max="${MAX_YEAR}" value="${MAX_YEAR}" step="1">
        </div>
        <button class="tl-play" id="tlPlay" data-motion-start data-i18n="tl.play">▶ Play</button>
      </div>
      <div class="tl-info" id="tlInfo"></div>`;
    wrap.parentNode.insertBefore(panel, wrap);
    const links = PeriodicSources.render('discovery', null, window.CURRENT_LANG, document);
    panel.appendChild(links);

    sliderEl = panel.querySelector('#tlSlider');
    yearDisplay = panel.querySelector('#tlYear');
    infoEl = panel.querySelector('#tlInfo');
    playBtn = panel.querySelector('#tlPlay');

    sliderEl.addEventListener('input', ev => {
      applyYear(parseInt(sliderEl.value, 10));
      stopPlay();
    });
    playBtn.addEventListener('click', ()=>{
      if (playing) stopPlay(); else startPlay();
    });

    return panel;
  }

  function applyYear(year){
    yearDisplay.textContent = year;

    const cells = document.querySelectorAll('.cell:not(.empty):not(.placeholder)');
    let newlyDiscovered = null, prevYearBar = parseInt(sliderEl.dataset.prev || year, 10);

    cells.forEach(c => {
      const z = parseInt(c.dataset.z, 10);
      const y = getDiscoveryYear(z);
      const known = y <= year;
      const wasKnown = y <= prevYearBar;

      // Mendeleev-era: elements between 1869 and their actual discovery show as "predicted gap"
      const eka = EKA[z];
      const isPredictedNow = eka && year >= eka.predY && year < eka.actualY;

      c.classList.toggle('tl-hidden', !known && !isPredictedNow);
      c.classList.toggle('tl-predicted', !!isPredictedNow);

      if (known && !wasKnown){
        c.classList.add('tl-fresh');
        newlyDiscovered = z;
        setTimeout(()=>c.classList.remove('tl-fresh'), 900);
      }
    });

    sliderEl.dataset.prev = year;

    // Info card content
    let info = '';
    if (year >= 1869 && year < 1875){
      info = `<b>${t('tl.mendeleev')}.</b> ` +
        (window.CURRENT_LANG === 'zh-CN'
          ? '门捷列夫大胆地为四个未发现的元素在他的表格中留下空位,并预言了它们的性质:'
          : 'Mendeleev boldly leaves gaps in his table for four undiscovered elements and predicts their properties:') +
        `<br>&nbsp;&nbsp;<span class="eka">${t('tl.eka.al')}</span>` +
        `<br>&nbsp;&nbsp;<span class="eka">${t('tl.eka.si')}</span>` +
        `<br>&nbsp;&nbsp;<span class="eka">${t('tl.eka.b')}</span>` +
        `<br>&nbsp;&nbsp;<span class="eka">${t('tl.eka.mn')}</span>`;
    } else if (newlyDiscovered){
      const el = ELEMENTS[newlyDiscovered];
      const rec = DISCOVERY[newlyDiscovered];
      info = `<b>${year}:</b> ${el.name_en} / ${el.name_zh} (${el.symbol}, Z=${newlyDiscovered}) — ${rec[1]}`;
      if (EKA[newlyDiscovered]){
        const e = EKA[newlyDiscovered];
        info += `<br><b style="color:#7fe3ff">${e.eka}!</b> ` +
          (window.CURRENT_LANG === 'zh-CN'
            ? '门捷列夫预言 vs 实测:'
            : 'Mendeleev\'s prediction vs. actual:') +
          `<br>&nbsp;&nbsp;<b>${window.CURRENT_LANG==='zh-CN'?'预言':'predicted'}:</b> ${e.props[window.CURRENT_LANG==='zh-CN'?'predicted_zh':'predicted_en']}` +
          `<br>&nbsp;&nbsp;<b>${window.CURRENT_LANG==='zh-CN'?'实测':'actual'}:</b> ${e.props[window.CURRENT_LANG==='zh-CN'?'actual_zh':'actual_en']}`;
      }
    } else {
      const knownCount = Object.keys(ELEMENTS).filter(z => getDiscoveryYear(+z) <= year).length;
      info = window.CURRENT_LANG === 'zh-CN'
        ? `${knownCount} 种元素已在 ${year} 年前发现。`
        : `${knownCount} elements known by ${year}.`;
    }
    infoEl.innerHTML = info;
  }

  function startPlay(){
    if (window.PT_MOTION && window.PT_MOTION.isPaused()) return;
    playing = true;
    playBtn.textContent = t('tl.stop');
    let year = parseInt(sliderEl.value, 10);
    if (year >= MAX_YEAR) year = MIN_YEAR;
    // Show all as hidden first
    sliderEl.value = year;
    sliderEl.dataset.prev = year - 1;
    applyYear(year);

    const stepMs = 40;  // ~9 seconds total for 250 years
    function tick(){
      year++;
      if (year > MAX_YEAR){ stopPlay(); return; }
      sliderEl.value = year;
      applyYear(year);
      playRAF = setTimeout(tick, stepMs);
    }
    playRAF = setTimeout(tick, stepMs);
  }

  function stopPlay(){
    if (!playing) return;
    playing = false;
    clearTimeout(playRAF);
    playBtn.textContent = t('tl.play');
  }

  function toggle(){
    const p = ensurePanel();
    p.classList.toggle('on');
    if (p.classList.contains('on')){
      applyYear(parseInt(sliderEl.value, 10));
    } else {
      stopPlay();
      // Clear all tl-* classes
      document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('tl-hidden','tl-predicted','tl-fresh');
      });
    }
  }

  function addToggleButton(){
    const bar = document.getElementById('viewToolbar');
    if (!bar || document.getElementById('tlToggleBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'tlToggleBtn';
    btn.className = 'view-btn special';
    btn.textContent = '🕰 ' + t('tl.title');
    btn.addEventListener('click', ()=>{
      toggle();
      btn.classList.toggle('active', panel && panel.classList.contains('on'));
    });
    bar.appendChild(btn);
  }

  function refreshLang(){
    const btn = document.getElementById('tlToggleBtn');
    if (btn) btn.textContent = '🕰 ' + t('tl.title');
    if (panel){
      panel.querySelector('h3').textContent = t('tl.title');
      playBtn.textContent = playing ? t('tl.stop') : t('tl.play');
      if (panel.classList.contains('on') && sliderEl) applyYear(parseInt(sliderEl.value, 10));
    }
  }
  new MutationObserver(refreshLang).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.addEventListener('visibilitychange', ()=>{ if (document.hidden) stopPlay(); });
  window.addEventListener('pt-motionchange', event=>{ if(event.detail.paused) stopPlay(); });

  window.__F2 = { toggle, applyYear, getDiscoveryYear, startPlay, stopPlay };

  function init(){ addToggleButton(); }
  function bootstrap(){ setTimeout(init, 300); }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
