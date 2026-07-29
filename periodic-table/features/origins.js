/* ==================== D1: NUCLEOSYNTHESIS ORIGINS + COSMIC TIMELINE ====================
   - Adds an "Origin: [type]" badge inside every element's detail panel.
   - Adds a "▶ Play cosmic timeline" button in the view toolbar (or standalone).
   - When played, cells fade in over ~20s in the order elements were forged
     in the universe: Big Bang → cosmic-ray spallation & first stars →
     AGB s-process → supernovae → model-dependent r-process sites → today.
======================================================================================= */
(function(){

  /* -------- Origin-badge injection into detail panel -------- */
  function getCurrentZ(){
    // currentZ is a top-level `let` in app.js — not on window.
    // Fall back to reading the active cell.
    if (typeof window.currentZ === 'number' && window.currentZ) return window.currentZ;
    const active = document.querySelector('.cell.active');
    if (active && active.dataset.z) return parseInt(active.dataset.z, 10);
    return null;
  }

  function injectOriginBadge(){
    const dCat = document.getElementById('dCategory');
    const z = getCurrentZ();
    if (!z) return;
    const origin = F_ORIGIN[z];
    const key = 'origin.' + origin;
    let badge = document.getElementById('originBadge');
    if (!badge){
      badge = document.createElement('span');
      badge.id = 'originBadge';
      badge.style.marginLeft = '10px';
      dCat.appendChild(badge);
    }
    badge.className = 'origin-badge ' + origin;
    badge.innerHTML = `<span class="oi">${F_ORIGIN_ICON[origin]}</span><span>${t(key)}</span>`;
    let caveat = document.getElementById('originCaveat');
    if (!caveat) {
      caveat = document.createElement('div');
      caveat.id = 'originCaveat';
      caveat.className = 'd-hint origin-caveat';
      dCat.parentNode.appendChild(caveat);
    }
    // Assigning textContent already drops the previously rendered citations.
    caveat.textContent = t('origin.caveat');
    const links = PeriodicSources.render('origins', z, window.CURRENT_LANG, document);
    caveat.appendChild(links);
  }

  /* Watch #dName for changes (indicates a new element was opened),
     or the detail panel becoming visible. */
  function attachDetailObserver(){
    const dName = document.getElementById('dName');
    const detail = document.getElementById('detail');
    const obs = new MutationObserver(()=>{
      setTimeout(injectOriginBadge, 0);
    });
    obs.observe(dName, {childList:true, characterData:true, subtree:true});
    // Also observe detail's class attribute (hidden ↔ visible)
    const obs2 = new MutationObserver(()=>{
      if (!detail.classList.contains('hidden')) setTimeout(injectOriginBadge, 0);
    });
    obs2.observe(detail, {attributes:true, attributeFilter:['class']});
  }

  /* -------- Cosmic timeline playback -------- */
  const ERA_TIMES = ['t=3 min','~200 Myr','~1 Gyr','~1-10 Gyr','~1-13 Gyr','4.6 Gyr ago','1937-2016 CE','Now'];
  let banner = null;
  let playing = false;
  let timerId = null;

  function syncPlayButton(){
    const btn = document.getElementById('cosmicPlayBtn');
    if (btn) btn.textContent = playing ? t('timeline.stop') : t('timeline.play');
  }

  function ensureBanner(){
    if (banner) return banner;
    banner = document.createElement('div');
    banner.className = 'cosmic-banner';
    banner.id = 'cosmicBanner';
    banner.innerHTML = `<div class="cb-era" id="cbEra"></div><div class="cb-time" id="cbTime"></div>`;
    document.body.appendChild(banner);
    return banner;
  }

  function stop(){
    playing = false;
    clearTimeout(timerId); timerId = null;
    banner?.classList.remove('on');
    // Restore all cells
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('not-yet-forged', 'freshly-forged');
    });
    syncPlayButton();
  }

  function play(){
    if (playing){ stop(); return; }
    if (window.PT_MOTION && window.PT_MOTION.isPaused()) return;
    playing = true;
    ensureBanner().classList.add('on');
    syncPlayButton();

    // Start: hide all
    document.querySelectorAll('.cell:not(.empty):not(.placeholder)').forEach(c => {
      c.classList.add('not-yet-forged');
      c.classList.remove('freshly-forged');
    });

    const eras = F_COSMIC_ERAS;
    const ERA_MS = 2600;      // each era displayed this long
    let eraIdx = 0;

    function playEra(){
      if (eraIdx >= eras.length){ stop(); return; }
      const era = eras[eraIdx];

      const bannerEra = document.getElementById('cbEra');
      const bannerTime = document.getElementById('cbTime');
      bannerEra.textContent = t(era.labelKey);
      bannerTime.textContent = ERA_TIMES[eraIdx];

      // Forge all elements in this era's origins
      const zsToLight = [];
      for (let z=1; z<=118; z++){
        if (era.origins.includes(F_ORIGIN[z])) zsToLight.push(z);
      }
      // Sort by Z for natural progression
      zsToLight.sort((a,b)=>a-b);
      const perEl = Math.max(30, ERA_MS / (zsToLight.length + 1));

      zsToLight.forEach((z, i) => {
        setTimeout(()=>{
          if (!playing) return;
          const cell = document.querySelector(`.cell[data-z="${z}"]`);
          cell.classList.remove('not-yet-forged');
          cell.classList.add('freshly-forged');
          setTimeout(()=>cell.classList.remove('freshly-forged'), 1200);
        }, i * perEl);
      });

      eraIdx++;
      timerId = setTimeout(playEra, ERA_MS);
    }
    playEra();
  }

  /* -------- Add "Play Cosmic Timeline" button to the view toolbar -------- */
  function addTimelineButton(){
    const bar = document.getElementById('viewToolbar');
    if (document.getElementById('cosmicPlayBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'cosmicPlayBtn';
    btn.className = 'view-btn special';
    btn.style.marginLeft = 'auto';
    btn.textContent = t('timeline.play');
    btn.addEventListener('click', play);
    bar.appendChild(btn);
  }

  function refreshLang(){
    syncPlayButton();
    injectOriginBadge();
  }
  // Observe html[lang] attribute to detect language switch
  new MutationObserver(refreshLang).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.addEventListener('visibilitychange', ()=>{ if (document.hidden) stop(); });
  window.addEventListener('pt-motionchange', event=>{ if(event.detail.paused) stop(); });

  window.__D1 = { play, stop, injectOriginBadge, getCurrentZ, ensureBanner };

  function init(){
    addTimelineButton();
    attachDetailObserver();
    injectOriginBadge();
  }
  function bootstrap(){ setTimeout(init, 200); }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
