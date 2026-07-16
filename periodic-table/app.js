/* ================ PERIODIC TABLE APP ================ */

/* Standard 18-column periodic table layout as a 7x18 grid.
   0 means empty cell, otherwise element Z. Lanthanides (57-71) and
   actinides (89-103) are represented by "placeholder" markers in the
   main grid and shown in a separate f-block row below.
*/
const LAYOUT = [
  // 18 columns per row
  [ 1,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  2],
  [ 3,  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
  [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,13,14,15,16,17, 18],
  [19, 20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35, 36],
  [37, 38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53, 54],
  [55, 56,'La-Lu',72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
  [87, 88,'Ac-Lr',104,105,106,107,108,109,110,111,112,113,114,115,116,117,118]
];
const F_BLOCK = [
  [57,58,59,60,61,62,63,64,65,66,67,68,69,70,71],
  [89,90,91,92,93,94,95,96,97,98,99,100,101,102,103]
];

const gridEl = document.getElementById('ptGrid');
const fblockEl = document.getElementById('ptFBlock');
const detailEl = document.getElementById('detail');
let currentZ = null;
let currentHybrid = null;

/* ----- Rendering the grid ----- */
function rerenderGrid(){
  const lang = window.CURRENT_LANG || 'en';
  gridEl.innerHTML='';
  LAYOUT.forEach((row, rowIdx)=>{
    const rowDiv = document.createElement('div');
    rowDiv.className = 'pt-row';
    // Row-read speaker button
    const speak = document.createElement('button');
    speak.className = 'row-speak';
    speak.innerHTML = '🔊';
    speak.title = (lang==='zh-CN' ? '朗读第 ' : 'Read period ') + (rowIdx+1);
    const rowZs = row.filter(c=>typeof c === 'number');
    speak.addEventListener('click', (e)=>{
      e.stopPropagation();
      speakSequence(rowZs, lang);
      speak.classList.add('playing');
      setTimeout(()=>speak.classList.remove('playing'), rowZs.length*900 + 500);
    });
    rowDiv.appendChild(speak);
    row.forEach(cell=>{
      if(cell===0){
        const empty=document.createElement('div'); empty.className='cell empty';
        rowDiv.appendChild(empty);
      } else if(cell==='La-Lu' || cell==='Ac-Lr'){
        const ph=document.createElement('div');
        ph.className='cell placeholder ' + (cell==='La-Lu'?'lanthanide':'actinide');
        ph.textContent=cell;
        ph.title = cell==='La-Lu' ? '57–71 Lanthanides' : '89–103 Actinides';
        rowDiv.appendChild(ph);
      } else {
        rowDiv.appendChild(makeCell(cell,lang));
      }
    });
    gridEl.appendChild(rowDiv);
  });
  fblockEl.innerHTML='';
  F_BLOCK.forEach((row, fRowIdx)=>{
    const rowDiv = document.createElement('div');
    rowDiv.className = 'pt-frow';
    const speak = document.createElement('button');
    speak.className = 'row-speak';
    speak.innerHTML = '🔊';
    const label = fRowIdx===0 ? (lang==='zh-CN'?'朗读镧系':'Read lanthanides') : (lang==='zh-CN'?'朗读锕系':'Read actinides');
    speak.title = label;
    speak.addEventListener('click', (e)=>{
      e.stopPropagation();
      speakSequence(row, lang);
      speak.classList.add('playing');
      setTimeout(()=>speak.classList.remove('playing'), row.length*900 + 500);
    });
    rowDiv.appendChild(speak);
    row.forEach(z=>rowDiv.appendChild(makeCell(z,lang)));
    fblockEl.appendChild(rowDiv);
  });
}

function makeCell(z, lang){
  const el = ELEMENTS[z];
  const d = document.createElement('div');
  d.className = 'cell ' + el.category + (el.radioactive===2 ? ' radioactive' : '');
  d.dataset.z = z;
  const nm = lang==='zh-CN' ? el.name_zh : el.name_en;
  d.innerHTML = `
    <div class="z">${z}</div>
    <div class="sym">${el.symbol}</div>
    <div class="nm">${nm}</div>
    <div class="ms">${el.mass.toFixed ? el.mass.toFixed(el.mass<10?3:2) : el.mass}</div>
  `;
  if(currentZ===z) d.classList.add('active');
  d.addEventListener('click',()=>openDetail(z));
  return d;
}

/* ----- Detail panel ----- */
function openDetail(z){
  cancelAnimationFrame(rxRAF); clearTimeout(rxReplayTimer);
  currentZ = z;
  currentHybrid = null;
  document.querySelectorAll('.cell').forEach(c=>c.classList.toggle('active', +c.dataset.z===z));
  detailEl.classList.remove('hidden');
  refreshDetail();
  // Scroll into view + re-render canvases once layout has settled
  requestAnimationFrame(()=>{
    detailEl.scrollIntoView({behavior:'smooth', block:'start'});
    // Re-draw canvases now that they have real dimensions
    drawBohr(currentZ);
    if(currentHybrid) drawOrbital(currentHybrid);
    const el = ELEMENTS[currentZ];
    if(el) drawNucleus(el.Z, Math.round(el.mass - el.Z));
  });
}
document.getElementById('detailClose').addEventListener('click',()=>{
  detailEl.classList.add('hidden'); currentZ=null;
  cancelAnimationFrame(rxRAF); clearTimeout(rxReplayTimer);
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('active'));
});

function refreshDetail(){
  if(!currentZ) return;
  const el = ELEMENTS[currentZ];
  const ext = Object.assign({}, generateFallbackExt(el), EXTENDED[currentZ] || {});
  const lang = window.CURRENT_LANG || 'en';
  const catColor = CATEGORY_COLORS[el.category];
  const nm = lang==='zh-CN' ? el.name_zh : el.name_en;
  const otherName = lang==='zh-CN' ? el.name_en : el.name_zh;

  // Header tile
  const tile = document.getElementById('dTile');
  tile.style.background = `linear-gradient(135deg, ${catColor}55, ${catColor}22)`;
  tile.style.border = `2px solid ${catColor}88`;
  tile.innerHTML = `<div class="z">${el.Z}</div><div class="sym" style="color:${catColor}">${el.symbol}</div><div class="mass">${el.mass}</div>`;

  document.getElementById('dName').innerHTML = `${nm} <span style="color:var(--dim);font-size:20px;font-weight:400;margin-left:8px">${otherName}</span>`;
  const catI = CATEGORY_I18N[lang][el.category];
  const groupType = el.group==='f' ? t('f') : (el.group>=3 && el.group<=12 ? t('sub') : t('main'));
  document.getElementById('dCategory').textContent = `${catI} · ${groupType}`;
  document.getElementById('dTagline').textContent = ''; // reserved for future

  // Properties
  const propsEl = document.getElementById('dProps');
  const shells = shellCounts(el.Z);
  const phaseKey = ext.phase || (el.category==='noble'?'gas':(el.category==='halogen' && el.Z<=17 ? (el.Z===9||el.Z===17?'gas':'liquid'):'solid'));
  const phaseTxt = PHASE_I18N[lang][phaseKey] || phaseKey;
  const radioTxt = ({0:t('radio.stable'),1:t('radio.natural'),2:t('radio.artificial')})[el.radioactive];
  const props = [
    [t('prop.Z'), el.Z],
    [t('prop.mass'), el.mass],
    [t('prop.group'), el.group==='f' ? (el.category==='lanthanide'?'La (f)':'Ac (f)') : el.group],
    [t('prop.period'), el.period],
    [t('prop.family'), catI],
    [t('prop.config'), el.config],
    [t('prop.shells'), shells.filter(x=>x>0).join(' · ')],
    [t('prop.phase'), phaseTxt],
    ext.melt!=null && [t('prop.melt'), ext.melt+' K'],
    ext.boil!=null && [t('prop.boil'), ext.boil+' K'],
    ext.density!=null && [t('prop.density'), ext.density+' g/cm³'],
    el.electronegativity!=null && [t('prop.en'), el.electronegativity]
  ].filter(Boolean);
  propsEl.innerHTML = props.map(([k,v])=>`<div class="d-prop"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');

  // Bohr model
  drawBohr(el.Z);
  document.getElementById('dShellText').textContent =
    `${t('shells.text')} ${shells.filter(x=>x>0).join(' · ')}   (${['K','L','M','N','O','P','Q'].slice(0,shells.filter(x=>x>0).length).join(', ')})`;

  // Orbital / hybridization
  const orbTabs = document.getElementById('orbitalTabs');
  const availHybrids = (ext.hybrid && ext.hybrid.length) ? ext.hybrid : inferHybrids(el);
  orbTabs.innerHTML = availHybrids.length ? availHybrids.map(h=>`<button data-h="${h}">${labelForHybrid(h)}</button>`).join('') : `<span style="color:var(--dim);font-size:12px">${t('hybrid.none')}</span>`;
  if(availHybrids.length){
    if(!availHybrids.includes(currentHybrid)) currentHybrid = availHybrids[0];
    orbTabs.querySelectorAll('button').forEach(b=>{
      b.classList.toggle('active', b.dataset.h===currentHybrid);
      b.addEventListener('click',()=>{
        currentHybrid = b.dataset.h;
        orbTabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active', x.dataset.h===currentHybrid));
        refreshOrbital();
      });
    });
    refreshOrbital();
  } else {
    const ctx = document.getElementById('orbitalCanvas').getContext('2d');
    ctx.clearRect(0,0,9999,9999);
    document.getElementById('dHybridText').textContent = '';
  }

  // Oxidation states
  const oxEl = document.getElementById('dOx');
  oxEl.innerHTML='';
  if(el.oxidation && el.oxidation!=='?'){
    el.oxidation.split(',').forEach(o=>{
      o = o.trim();
      const chip = document.createElement('div');
      chip.className = 'ox-chip ' + (o==='0'?'zero':(o.startsWith('−')?'neg':'pos'));
      chip.textContent = o;
      oxEl.appendChild(chip);
    });
  } else {
    oxEl.innerHTML = `<span style="color:var(--dim);font-size:13px">—</span>`;
  }

  // Signature colors
  renderSignatureColors(el);

  // Bonds
  drawBonds(el);

  // Reactions
  const rxBlock = document.getElementById('dReactionsBlock');
  const rxEl = document.getElementById('dRx');
  const reactions = ext.reactions || [];
  if(reactions.length){
    rxBlock.style.display='block';
    rxEl.innerHTML = reactions.map((r,i)=>`
      <div class="rx-item">
        <div class="rx-eq">${r.eq}</div>
        <div class="rx-note">${lang==='zh-CN' ? (r.note_zh||r.note_en||'') : (r.note_en||r.note_zh||'')}</div>
        <button class="rx-play" data-i="${i}">▶ ${lang==='zh-CN'?'播放':'Play'}</button>
      </div>
    `).join('') + `<div id="rxAnimBox"><canvas id="rxAnimCanvas"></canvas></div>`;
    rxEl.querySelectorAll('.rx-play').forEach(b=>{
      b.addEventListener('click',()=>animateReaction(reactions[+b.dataset.i].eq));
    });

    // 3D molecule viewers for formulas that have MOLECULE_3D data
    render3DViewers(reactions);
  } else {
    rxBlock.style.display='none';
  }

  // Nucleus visualization
  drawNucleus(el.Z, Math.round(el.mass - el.Z));
  document.getElementById('dNucStat').textContent =
    `${el.Z} ${t('nuc.protons')} · ${Math.round(el.mass - el.Z)} ${t('nuc.neutrons')} — ${el.radioactive===0 ? t('nuc.stable') : t('nuc.decay')}`;

  // Isotopes
  const isoEl = document.getElementById('dIsotopes');
  const isos = ext.isotopes || [{s:`${Math.round(el.mass)}${el.symbol}`, ab:'—', stable:el.radioactive===0, note:''}];
  isoEl.innerHTML = isos.map(i=>`
    <div class="iso-row">
      <div class="iso-sym">${i.s}</div>
      <div>${i.ab}</div>
      <div class="${i.stable?'iso-stable':'iso-unstable'}">${i.stable ? t('iso.stable') : t('iso.unstable')}</div>
      <div class="iso-note">${i.note||''}</div>
    </div>
  `).join('');

  // Radioactivity note
  const rn = document.getElementById('dRadio');
  const rClass = el.radioactive===0 ? 'stable' : (el.radioactive===1 ? 'natural' : 'artificial');
  rn.className = 'radio-note ' + rClass;
  rn.textContent = radioTxt;

  // Uses & discovery
  document.getElementById('dUses').textContent = lang==='zh-CN' ? (ext.uses_zh||ext.uses_en||'—') : (ext.uses_en||ext.uses_zh||'—');
  const disc = ext.discovery;
  document.getElementById('dDiscovery').textContent = disc
    ? (disc.year < 0 || /antiquity|prehistory/i.test(disc.who||'')
        ? `${t('discovery.ancient')}${disc.who? ' — '+disc.who:''}`
        : `${t('discovery.year')} ${disc.year} ${t('discovery.by')} ${disc.who}`)
    : '';
}

function inferHybrids(el){
  // Rough heuristic
  if(el.category==='noble') return [];
  if(el.category==='lanthanide' || el.category==='actinide') return ['f'];
  if(el.category==='transition') return ['dsp2','d2sp3','sp3d2'];
  if(el.category==='alkali' || el.category==='alkaline') return ['s'];
  return ['sp','sp2','sp3'];
}
function labelForHybrid(h){
  return {s:'s',sp:'sp',sp2:'sp²',sp3:'sp³',sp3d:'sp³d',sp3d2:'sp³d²',d2sp3:'d²sp³',dsp2:'dsp²',f:'f'}[h] || h;
}
function refreshOrbital(){
  drawOrbital(currentHybrid);
  document.getElementById('dHybridText').textContent = t('hybrid.'+(currentHybrid==='sp2'?'sp2':currentHybrid==='sp3'?'sp3':currentHybrid==='sp3d'?'sp3d':currentHybrid==='sp3d2'?'sp3d2':currentHybrid)) || '';
}

/* ================ CANVAS DRAWINGS ================ */

/* ----- Bohr model with animated electrons ----- */
let bohrRAF=null;
function drawBohr(z){
  cancelAnimationFrame(bohrRAF);
  const canvas = document.getElementById('bohrCanvas');
  const ctx = canvas.getContext('2d');
  const bc = canvas.getBoundingClientRect();
  if(bc.width < 20 || bc.height < 20) return;
  canvas.width = bc.width * devicePixelRatio;
  canvas.height = bc.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const shells = shellCounts(z).filter(x=>x>0);
  const W = bc.width;
  const H = bc.height;
  const cx = W/2, cy = H/2;
  const maxR = Math.min(W,H)/2 - 20;
  const el = ELEMENTS[z];
  const catColor = CATEGORY_COLORS[el.category];
  const startTime = performance.now();

  function frame(){
    const t = (performance.now()-startTime)/1000;
    ctx.clearRect(0,0,W,H);
    // Nucleus
    const nucR = Math.max(8, Math.min(24, 6 + z*0.15));
    const g = ctx.createRadialGradient(cx,cy,0, cx,cy,nucR*2);
    g.addColorStop(0, catColor);
    g.addColorStop(1, catColor+'00');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(cx,cy,nucR*2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=catColor;
    ctx.beginPath(); ctx.arc(cx,cy,nucR,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.font='bold 10px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(el.symbol, cx, cy);

    // Shells
    shells.forEach((count,i)=>{
      const r = (i+1) * (maxR/shells.length) * 0.9 + 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      // Electrons
      const speed = 1/(i+1) * 0.8;
      for(let k=0;k<count;k++){
        const a = (k/count)*Math.PI*2 + t*speed*(i%2===0?1:-1);
        const ex = cx + Math.cos(a)*r;
        const ey = cy + Math.sin(a)*r;
        const eg = ctx.createRadialGradient(ex,ey,0,ex,ey,6);
        eg.addColorStop(0,'#7fe3ff'); eg.addColorStop(1,'rgba(0,212,255,0)');
        ctx.fillStyle=eg;
        ctx.beginPath(); ctx.arc(ex,ey,6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#00d4ff';
        ctx.beginPath(); ctx.arc(ex,ey,2.5,0,Math.PI*2); ctx.fill();
      }
    });
    bohrRAF = requestAnimationFrame(frame);
  }
  frame();
}

/* ----- Orbital shapes ----- */
let orbRAF=null;
function drawOrbital(h){
  cancelAnimationFrame(orbRAF);
  const canvas = document.getElementById('orbitalCanvas');
  const ctx = canvas.getContext('2d');
  const r = canvas.getBoundingClientRect();
  if(r.width < 20 || r.height < 20) return; // not laid out yet
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W = r.width, H = r.height;
  const cx=W/2, cy=H/2;
  const start = performance.now();

  const shapes = shapesForHybrid(h);
  const R = Math.min(W,H)*0.4;

  function frame(){
    const t = (performance.now()-start)/1000;
    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    const rot = t*0.35;
    shapes.forEach(s=>{
      const a = s.a + rot;
      if(s.kind==='sphere'){
        const g = ctx.createRadialGradient(cx,cy,0, cx,cy,R);
        g.addColorStop(0, s.color);
        g.addColorStop(0.5, s.color.slice(0,7)+'55');
        g.addColorStop(1, s.color.slice(0,7)+'00');
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
      } else {
        drawLobe(ctx, cx, cy, R, a, s.color);
      }
    });
    // Center nucleus
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
    // Hybrid label
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.font='bold 11px JetBrains Mono, monospace';
    ctx.textAlign='left';
    ctx.fillText(labelForHybrid(h), 10, 18);
    orbRAF = requestAnimationFrame(frame);
  }
  frame();
}
function drawLobe(ctx, cx, cy, R, angle, color){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(angle);
  for(let side of [1,-1]){
    const g = ctx.createRadialGradient(side*R*0.55, 0, 0, side*R*0.55, 0, R*0.55);
    g.addColorStop(0, color);
    g.addColorStop(0.4, color.slice(0,7)+'88');
    g.addColorStop(1, color.slice(0,7)+'00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(side*R*0.55, 0, R*0.5, R*0.3, 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}
function shapesForHybrid(h){
  const c1='#7fe3ffcc', c2='#ff9ec2cc', c3='#c0baffcc';
  if(h==='s') return [{kind:'sphere', a:0, color:c1}];
  if(h==='sp') return [{kind:'lobe', a:0, color:c1}];
  if(h==='sp2') return [
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:Math.PI*2/3, color:c2},
    {kind:'lobe', a:Math.PI*4/3, color:c3}
  ];
  if(h==='sp3') return [
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:Math.PI/2, color:c2},
    {kind:'lobe', a:Math.PI, color:c3},
    {kind:'lobe', a:3*Math.PI/2, color:c1}
  ];
  if(h==='sp3d') return [
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:2*Math.PI/3, color:c2},
    {kind:'lobe', a:4*Math.PI/3, color:c3},
    {kind:'lobe', a:Math.PI/6, color:c1},
    {kind:'lobe', a:-Math.PI/6, color:c2}
  ];
  if(h==='sp3d2' || h==='d2sp3') return [
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:Math.PI/2, color:c2},
    {kind:'lobe', a:Math.PI, color:c3},
    {kind:'lobe', a:3*Math.PI/2, color:c1},
    {kind:'lobe', a:Math.PI/4, color:c2},
    {kind:'lobe', a:5*Math.PI/4, color:c3}
  ];
  if(h==='dsp2') return [
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:Math.PI/2, color:c2},
    {kind:'lobe', a:Math.PI, color:c3},
    {kind:'lobe', a:3*Math.PI/2, color:c1}
  ];
  if(h==='f') return [
    {kind:'sphere', a:0, color:c2},
    {kind:'lobe', a:0, color:c1},
    {kind:'lobe', a:Math.PI/2, color:c3}
  ];
  return [{kind:'sphere', a:0, color:c1}];
}

/* ----- Signature colors ----- */
function renderSignatureColors(el){
  const grid = document.getElementById('dColors');
  const lang = window.CURRENT_LANG || 'en';
  const colors = SIGNATURE_COLORS[el.Z];
  if(!colors || !colors.length){
    grid.innerHTML = `<div class="color-empty">${t('detail.colors.none')}</div>`;
    return;
  }
  const stateLabel = {
    '0':      lang==='zh-CN' ? '单质' : 'pure',
    'flame':  lang==='zh-CN' ? '焰色' : 'flame',
    'discharge': lang==='zh-CN' ? '放电' : 'discharge',
    'oxide':  lang==='zh-CN' ? '氧化物/其他' : 'oxide / other',
    'nano':   lang==='zh-CN' ? '纳米' : 'nano'
  };
  grid.innerHTML = colors.map(c=>{
    const label = lang==='zh-CN' ? (c.label_zh||c.label_en) : (c.label_en||c.label_zh);
    const st = stateLabel[c.state] || c.state;
    return `
      <div class="color-swatch">
        <div class="color-chip" style="background:${c.hex}"></div>
        <div class="color-info">
          <div class="color-state">${st}</div>
          <div class="color-label">${label}</div>
          <div class="color-hex">${c.hex.toUpperCase()}</div>
        </div>
      </div>`;
  }).join('');
}

/* ----- Bond types matrix ----- */
function drawBonds(el){
  const grid = document.getElementById('dBonds');
  // Determine which bonds this element typically forms
  const bonds = {
    ionic:    isIonic(el),
    covalent: isCovalent(el),
    metallic: isMetal(el),
    hydrogen: canHBond(el),
    vdw:      true  // everyone has vdW
  };
  grid.innerHTML = ['ionic','covalent','metallic','hydrogen','vdw'].map(b=>{
    const yes = bonds[b];
    return `
      <div class="bond-card">
        <div class="bond-name">${t('bond.'+b+'.name')} <span class="${yes?'bond-yes':'bond-no'}" style="font-size:11px;margin-left:6px;">● ${yes?t('bond.forms'):t('bond.rarely')}</span></div>
        <div class="bond-desc">${t('bond.'+b+'.desc')}</div>
      </div>
    `;
  }).join('');
}
function isMetal(el){
  return ['alkali','alkaline','transition','posttransition','lanthanide','actinide'].includes(el.category);
}
function isIonic(el){
  // Highly EN diff — alkalis, alkaline earths, halogens, and O commonly form ionic
  return ['alkali','alkaline','halogen'].includes(el.category) || el.Z===8;
}
function isCovalent(el){
  return ['nonmetal','metalloid','halogen'].includes(el.category);
}
function canHBond(el){
  return el.Z===1 || el.Z===7 || el.Z===8 || el.Z===9;
}

/* ----- Nucleus animation ----- */
let nucRAF=null;
function drawNucleus(protons, neutrons){
  cancelAnimationFrame(nucRAF);
  const canvas = document.getElementById('nucleusCanvas');
  const ctx = canvas.getContext('2d');
  const rct = canvas.getBoundingClientRect();
  if(rct.width < 20 || rct.height < 20) return;
  canvas.width = rct.width * devicePixelRatio;
  canvas.height = rct.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W=rct.width, H=rct.height;
  const cx=W/2, cy=H/2;
  const N = protons + neutrons;
  const R = Math.min(W,H)*0.35;
  const nucR = Math.max(3, Math.min(6, Math.sqrt(200/N)*3));
  // Generate positions in cluster
  const parts = [];
  for(let i=0;i<protons;i++)  parts.push({type:'p', angle:Math.random()*Math.PI*2, dist:Math.random()});
  for(let i=0;i<neutrons;i++) parts.push({type:'n', angle:Math.random()*Math.PI*2, dist:Math.random()});
  // Assign positions using Fibonacci-sphere-like packing
  parts.forEach((p,i)=>{
    const t = i/Math.max(1,N-1);
    const r = Math.sqrt(t) * R;
    const a = i * 2.399963;
    p.x = cx + Math.cos(a)*r;
    p.y = cy + Math.sin(a)*r;
    p.baseX = p.x; p.baseY = p.y;
  });
  const start = performance.now();
  function frame(){
    const tt = (performance.now()-start)/1000;
    ctx.clearRect(0,0,W,H);
    // Shell glow
    const g = ctx.createRadialGradient(cx,cy,0,cx,cy,R+20);
    g.addColorStop(0, 'rgba(255,107,157,0.15)');
    g.addColorStop(1, 'rgba(255,107,157,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(cx,cy,R+20,0,Math.PI*2); ctx.fill();

    parts.forEach((p,i)=>{
      // Wobble
      const dx = Math.sin(tt*2+i)*1.5, dy=Math.cos(tt*2+i*1.3)*1.5;
      const x = p.baseX+dx, y = p.baseY+dy;
      const color = p.type==='p' ? '#ffd166' : '#a0a0a0';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x,y,nucR,0,Math.PI*2); ctx.fill();
    });
    nucRAF = requestAnimationFrame(frame);
  }
  frame();
}

/* ================ REACTION ANIMATION ================
   Real 4-phase animation:
     Phase 1 (0-25%):   approach  — reactant molecules drift toward center
     Phase 2 (25-50%):  collide   — bonds break, atoms scatter
     Phase 3 (50-80%):  reform    — atoms regroup into product molecules
     Phase 4 (80-100%): separate  — products drift apart

   Steps:
     1. Parse "aA + bB -> cC + dD" into groups of {coef, formula}
     2. Expand each formula into a molecule template with 2D atom positions
     3. Enumerate atoms on each side; match same-symbol atoms between
        LHS and RHS (Hungarian-ish, but greedy is fine here)
     4. Animate each atom along a spline between its LHS position and
        its RHS position
==================================================== */
let rxRAF=null;
let rxReplayTimer=null;

/* ---- 1. equation parser ---- */

/* ---- 1. equation parser ---- */
const SUBSCRIPTS = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
const SUPERSCRIPTS = {'⁰':'','¹':'','²':'','³':'','⁴':'','⁵':'','⁶':'','⁷':'','⁸':'','⁹':'','⁺':'','⁻':''};
function normalizeFormula(s){
  return String(s)
    .replace(/[₀-₉]/g, ch => SUBSCRIPTS[ch] || ch)
    .replace(/[⁰-⁹⁺⁻]/g, ch => SUPERSCRIPTS[ch] || '')
    .replace(/[↑↓]/g,'')
    .trim();
}
function parseEquation(eq){
  const [lhsRaw, rhsRaw] = eq.split(/[→⇌=]/).map(s=>(s||'').trim());
  const parseSide = s => s.split(/\s*\+\s*/).map(term=>{
    const norm = normalizeFormula(term);
    const m = norm.match(/^(\d+)?\s*(.+?)$/);
    const coef = m[1] ? +m[1] : 1;
    return { coef, formula: m[2] };
  });
  return { lhs: parseSide(lhsRaw), rhs: parseSide(rhsRaw || lhsRaw) };
}

/* ---- 2. formula -> atom list with 2D positions inside molecule ----
   Very lightweight: recognize a handful of common shapes.
   Fallback: chain atoms in a horizontal line.
*/
const D = 22; // bond length in px (scaled later)

function moleculeShape(formula){
  // return { atoms:[{sym,x,y}], bonds:[[i,j,order]] }
  const F = formula;
  // Diatomics
  if(/^([A-Z][a-z]?)2$/.test(F)){
    const sym = F.match(/^([A-Z][a-z]?)2$/)[1];
    return { atoms:[ {sym,x:-D/2,y:0}, {sym,x:D/2,y:0} ], bonds:[[0,1,1]] };
  }
  // H2O
  if(F==='H2O') return {
    atoms:[{sym:'O',x:0,y:0},{sym:'H',x:-D*0.9,y:D*0.5},{sym:'H',x:D*0.9,y:D*0.5}],
    bonds:[[0,1,1],[0,2,1]]
  };
  // H2O2
  if(F==='H2O2') return {
    atoms:[{sym:'O',x:-D/2,y:0},{sym:'O',x:D/2,y:0},{sym:'H',x:-D*1.2,y:-D*0.6},{sym:'H',x:D*1.2,y:-D*0.6}],
    bonds:[[0,1,1],[0,2,1],[1,3,1]]
  };
  // CO2 O=C=O
  if(F==='CO2') return {
    atoms:[{sym:'O',x:-D*1.2,y:0},{sym:'C',x:0,y:0},{sym:'O',x:D*1.2,y:0}],
    bonds:[[0,1,2],[1,2,2]]
  };
  // CO
  if(F==='CO') return { atoms:[{sym:'C',x:-D/2,y:0},{sym:'O',x:D/2,y:0}], bonds:[[0,1,3]] };
  // NH3 (pyramidal, drawn 2D)
  if(F==='NH3') return {
    atoms:[{sym:'N',x:0,y:0},{sym:'H',x:-D,y:D*0.6},{sym:'H',x:D,y:D*0.6},{sym:'H',x:0,y:-D}],
    bonds:[[0,1,1],[0,2,1],[0,3,1]]
  };
  // CH4
  if(F==='CH4') return {
    atoms:[{sym:'C',x:0,y:0},{sym:'H',x:D,y:D},{sym:'H',x:-D,y:D},{sym:'H',x:D,y:-D},{sym:'H',x:-D,y:-D}],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]
  };
  // HCl, HF, HBr, HI, HAt, HTs
  const hx = F.match(/^H(F|Cl|Br|I|At|Ts)$/);
  if(hx) return { atoms:[{sym:'H',x:-D/2,y:0},{sym:hx[1],x:D/2,y:0}], bonds:[[0,1,1]] };
  // Simple binary salt M X : e.g. NaCl, KBr, LiI
  const salt = F.match(/^([A-Z][a-z]?)([A-Z][a-z]?)$/);
  if(salt && salt[1]!==salt[2]){
    return { atoms:[{sym:salt[1],x:-D/2,y:0},{sym:salt[2],x:D/2,y:0}], bonds:[[0,1,1]] };
  }
  // MX2 (e.g. MgCl2, CaCl2, FeCl2)
  const mx2 = F.match(/^([A-Z][a-z]?)([A-Z][a-z]?)2$/);
  if(mx2) return {
    atoms:[{sym:mx2[1],x:0,y:0},{sym:mx2[2],x:-D*1.1,y:0},{sym:mx2[2],x:D*1.1,y:0}],
    bonds:[[0,1,1],[0,2,1]]
  };
  // MX3 (trigonal)
  const mx3 = F.match(/^([A-Z][a-z]?)([A-Z][a-z]?)3$/);
  if(mx3) return {
    atoms:[{sym:mx3[1],x:0,y:0},{sym:mx3[2],x:D,y:0},{sym:mx3[2],x:-D*0.5,y:D*0.87},{sym:mx3[2],x:-D*0.5,y:-D*0.87}],
    bonds:[[0,1,1],[0,2,1],[0,3,1]]
  };
  // M2O (alkali oxide)
  const m2o = F.match(/^([A-Z][a-z]?)2O$/);
  if(m2o) return {
    atoms:[{sym:'O',x:0,y:0},{sym:m2o[1],x:-D*1.1,y:0},{sym:m2o[1],x:D*1.1,y:0}],
    bonds:[[0,1,1],[0,2,1]]
  };
  // MO (transition oxide)
  const mo = F.match(/^([A-Z][a-z]?)O$/);
  if(mo) return { atoms:[{sym:mo[1],x:-D/2,y:0},{sym:'O',x:D/2,y:0}], bonds:[[0,1,2]] };
  // M2O3
  const m2o3 = F.match(/^([A-Z][a-z]?)2O3$/);
  if(m2o3) return {
    atoms:[
      {sym:m2o3[1],x:-D*1.3,y:0},{sym:m2o3[1],x:D*1.3,y:0},
      {sym:'O',x:0,y:-D*0.9},{sym:'O',x:0,y:D*0.9},{sym:'O',x:0,y:0}
    ],
    bonds:[[0,4,1],[1,4,1],[0,2,1],[1,3,1]]
  };
  // MOH (metal hydroxide)
  const moh = F.match(/^([A-Z][a-z]?)OH$/);
  if(moh) return {
    atoms:[{sym:moh[1],x:-D,y:0},{sym:'O',x:0,y:0},{sym:'H',x:D,y:0}],
    bonds:[[0,1,1],[1,2,1]]
  };
  // M(OH)2
  const moh2 = F.match(/^([A-Z][a-z]?)\(OH\)2$/);
  if(moh2) return {
    atoms:[
      {sym:moh2[1],x:0,y:0},
      {sym:'O',x:-D*1.1,y:0},{sym:'H',x:-D*2.1,y:0},
      {sym:'O',x:D*1.1,y:0},{sym:'H',x:D*2.1,y:0}
    ],
    bonds:[[0,1,1],[1,2,1],[0,3,1],[3,4,1]]
  };
  // Fe2O3
  if(F==='Fe2O3') return {
    atoms:[
      {sym:'Fe',x:-D*1.3,y:0},{sym:'Fe',x:D*1.3,y:0},
      {sym:'O',x:0,y:-D*0.9},{sym:'O',x:0,y:D*0.9},{sym:'O',x:0,y:0}
    ],
    bonds:[[0,4,1],[1,4,1],[0,2,1],[1,3,1]]
  };
  // Fallback: chain the atoms horizontally
  return chainMolecule(F);
}
function chainMolecule(formula){
  // Very rough tokenization: match Symbol then optional digit
  const re = /([A-Z][a-z]?)(\d*)/g;
  const atoms = [];
  let m;
  while((m = re.exec(formula))!==null){
    const sym = m[1]; const n = m[2] ? +m[2] : 1;
    for(let k=0;k<Math.min(n,4);k++) atoms.push({sym});
  }
  if(!atoms.length) return { atoms:[], bonds:[] };
  const bonds = [];
  atoms.forEach((a,i)=>{
    a.x = (i-(atoms.length-1)/2)*D;
    a.y = 0;
    if(i>0) bonds.push([i-1,i,1]);
  });
  return { atoms, bonds };
}

/* ---- 3. build all atoms on each side, with initial positions ---- */
function buildSide(groups, sideX, W, H){
  // Cluster molecules vertically within their column
  const nMolecules = groups.reduce((s,g)=>s+g.coef, 0);
  const molecules = [];
  groups.forEach(g=>{
    for(let k=0;k<g.coef;k++){
      molecules.push(moleculeShape(g.formula));
    }
  });
  // Layout molecules in a vertical stack around center
  const spacing = Math.min(90, (H-40)/Math.max(1,nMolecules));
  molecules.forEach((mol,mi)=>{
    const cy = H/2 + (mi - (nMolecules-1)/2)*spacing;
    mol.atoms.forEach(a=>{
      a.gx = sideX + a.x;
      a.gy = cy + a.y;
    });
  });
  // Flatten to atoms list with molecule index
  const atoms = [];
  molecules.forEach((m,mi)=>{
    m.atoms.forEach((a,ai)=>atoms.push({
      sym:a.sym, mi, ai, gx:a.gx, gy:a.gy
    }));
  });
  return { molecules, atoms };
}

/* ---- 4. pair LHS atoms to RHS atoms of the same symbol ---- */
function pairAtoms(left, right){
  // Greedy nearest-neighbor by symbol
  const rightAvail = right.map((r,i)=>({i, ...r, taken:false}));
  const pairs = [];
  left.forEach(l=>{
    let best=-1, bestD=Infinity;
    rightAvail.forEach((r,i)=>{
      if(r.taken || r.sym!==l.sym) return;
      const d = (r.gx-l.gx)**2 + (r.gy-l.gy)**2;
      if(d<bestD){ bestD=d; best=i; }
    });
    if(best>=0){
      rightAvail[best].taken=true;
      pairs.push({ from:l, to:rightAvail[best] });
    } else {
      // No RHS partner (unbalanced eq); fade this atom out
      pairs.push({ from:l, to:null });
    }
  });
  // Any RHS atom with no LHS partner appears from thin air
  const orphanRight = rightAvail.filter(r=>!r.taken).map(r=>({ from:null, to:r }));
  return pairs.concat(orphanRight);
}

/* ---- 5. main animate ---- */
function animateReaction(eq){
  const box = document.getElementById('rxAnimBox');
  box.classList.add('on');
  const canvas = document.getElementById('rxAnimCanvas');
  const ctx = canvas.getContext('2d');
  const rct = canvas.getBoundingClientRect();
  if(rct.width<20 || rct.height<20) {
    // re-try after layout
    requestAnimationFrame(()=>animateReaction(eq));
    return;
  }
  canvas.width = rct.width*devicePixelRatio;
  canvas.height = rct.height*devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W=rct.width, H=rct.height;
  cancelAnimationFrame(rxRAF);
  clearTimeout(rxReplayTimer);

  const parsed = parseEquation(eq);
  // Reserve top strip for equation text
  const topPad = 24, bottomPad = 24;
  const inner = { top: topPad, bottom: H-bottomPad, h: H-topPad-bottomPad };
  const drawH = inner.h;

  const leftX  = W*0.20;
  const rightX = W*0.80;

  const leftSide  = buildSide(parsed.lhs, leftX,  W, drawH);
  const rightSide = buildSide(parsed.rhs, rightX, W, drawH);
  // shift y by topPad
  leftSide.atoms.forEach(a=>a.gy += inner.top);
  rightSide.atoms.forEach(a=>a.gy += inner.top);
  leftSide.molecules.forEach(m=>m.atoms.forEach(a=>a.gy += inner.top));
  rightSide.molecules.forEach(m=>m.atoms.forEach(a=>a.gy += inner.top));

  const pairs = pairAtoms(leftSide.atoms, rightSide.atoms);

  const start = performance.now();
  const dur = 5500;

  function frame(){
    const p = Math.min(1, (performance.now()-start)/dur);
    ctx.clearRect(0,0,W,H);

    // Determine phase
    // 0.00 - 0.20 : approach   (reactants intact, drifting slightly)
    // 0.20 - 0.45 : collide    (atoms move to a shared central cloud)
    // 0.45 - 0.75 : reform     (atoms flow to their product positions)
    // 0.75 - 1.00 : separate   (products drift apart to final layout)
    // We build compound spline: LHS position → jitter-center → RHS position
    const cx = W/2;
    const cyC = H/2;
    const scatterR = Math.min(W,H)*0.14;

    // Draw bonds first (per side, with fade)
    // LHS bonds fade out during 0.15-0.35
    const lhsBondAlpha = 1 - smoothstep(0.15, 0.35, p);
    if(lhsBondAlpha>0.02) drawSideBonds(ctx, leftSide, lhsBondAlpha, 0);
    // RHS bonds fade in during 0.65-0.85
    const rhsBondAlpha = smoothstep(0.65, 0.85, p);
    if(rhsBondAlpha>0.02) drawSideBonds(ctx, rightSide, rhsBondAlpha, 1);

    // Draw atoms with interpolated positions + collision flash
    pairs.forEach((pair,idx)=>{
      const from = pair.from, to = pair.to;
      let x, y, sym, alpha = 1;
      if(from && to){
        sym = from.sym;
        // 3-segment spline: from.gxy -> center-scatter -> to.gxy
        const scatterAngle = (idx*2.399963); // golden angle for even spread
        const scx = cx + Math.cos(scatterAngle)*scatterR;
        const scy = cyC + Math.sin(scatterAngle)*scatterR;
        if(p<0.45){
          const local = smoothstep(0, 0.45, p);
          x = lerp(from.gx, scx, local);
          y = lerp(from.gy, scy, local);
        } else {
          const local = smoothstep(0.45, 1, p);
          x = lerp(scx, to.gx, local);
          y = lerp(scy, to.gy, local);
        }
        // Wobble during collision phase
        if(p>0.35 && p<0.6){
          const jitter = (1 - Math.abs(p-0.475)/0.125);
          x += Math.sin(performance.now()/60 + idx)*3*jitter;
          y += Math.cos(performance.now()/70 + idx*1.7)*3*jitter;
        }
      } else if(from){
        // Fading out
        sym = from.sym;
        x = from.gx; y = from.gy;
        alpha = 1 - smoothstep(0.3, 0.6, p);
      } else {
        // Fading in
        sym = to.sym;
        x = to.gx; y = to.gy;
        alpha = smoothstep(0.5, 0.8, p);
      }
      drawAtom(ctx, x, y, sym, alpha);
    });

    // Central collision flash
    if(p>0.4 && p<0.55){
      const flashA = (0.5 - Math.abs(p-0.475))*4;
      const g = ctx.createRadialGradient(cx,cyC,0,cx,cyC,scatterR*2);
      g.addColorStop(0, `rgba(255,255,200,${flashA*0.7})`);
      g.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(cx,cyC,scatterR*2,0,Math.PI*2); ctx.fill();
    }

    // Arrow (always visible, brightens during middle)
    const arrowA = 0.4 + Math.sin(p*Math.PI)*0.4;
    ctx.strokeStyle = `rgba(0,212,255,${arrowA})`;
    ctx.fillStyle   = `rgba(0,212,255,${arrowA})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W*0.46, cyC); ctx.lineTo(W*0.54, cyC); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W*0.54, cyC); ctx.lineTo(W*0.52, cyC-5); ctx.lineTo(W*0.52, cyC+5); ctx.closePath(); ctx.fill();

    // Equation label at top
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.font='bold 13px JetBrains Mono, monospace';
    ctx.textAlign='center';
    ctx.fillText(eq, W/2, 16);

    // Phase label at bottom
    const phaseName = p<0.2 ? (window.CURRENT_LANG==='zh-CN'?'反应物接近':'reactants approach')
                    : p<0.5 ? (window.CURRENT_LANG==='zh-CN'?'键断裂':'bonds break')
                    : p<0.8 ? (window.CURRENT_LANG==='zh-CN'?'键重组':'bonds re-form')
                    :         (window.CURRENT_LANG==='zh-CN'?'生成物分离':'products separate');
    ctx.fillStyle='rgba(0,212,255,0.7)';
    ctx.font='10px JetBrains Mono, monospace';
    ctx.textAlign='center';
    ctx.fillText(phaseName, W/2, H-8);

    if(p<1) rxRAF = requestAnimationFrame(frame);
    else {
      // Freeze on final product state, replay after 1.5 s
      rxReplayTimer = setTimeout(()=>animateReaction(eq), 1500);
    }
  }
  frame();
}

function lerp(a,b,t){ return a + (b-a)*t; }
function smoothstep(a,b,t){
  const x = Math.max(0, Math.min(1, (t-a)/(b-a)));
  return x*x*(3-2*x);
}
function drawSideBonds(ctx, side, alpha, sideMarker){
  side.molecules.forEach(mol=>{
    mol.bonds.forEach(([i,j,order])=>{
      const a = mol.atoms[i], b = mol.atoms[j];
      ctx.strokeStyle = `rgba(255,255,255,${0.5*alpha})`;
      ctx.lineWidth = 1.5;
      if(order===1){
        line(ctx, a.gx, a.gy, b.gx, b.gy);
      } else if(order===2){
        // parallel double lines
        const dx = b.gy-a.gy, dy = -(b.gx-a.gx);
        const L = Math.hypot(dx,dy) || 1;
        const ox = dx/L*3, oy = dy/L*3;
        line(ctx, a.gx+ox, a.gy+oy, b.gx+ox, b.gy+oy);
        line(ctx, a.gx-ox, a.gy-oy, b.gx-ox, b.gy-oy);
      } else {
        // triple
        const dx = b.gy-a.gy, dy = -(b.gx-a.gx);
        const L = Math.hypot(dx,dy) || 1;
        const ox = dx/L*3, oy = dy/L*3;
        line(ctx, a.gx, a.gy, b.gx, b.gy);
        line(ctx, a.gx+ox, a.gy+oy, b.gx+ox, b.gy+oy);
        line(ctx, a.gx-ox, a.gy-oy, b.gx-ox, b.gy-oy);
      }
    });
  });
}
function line(ctx, x1,y1,x2,y2){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }

/* CPK-inspired per-element colors for reaction atoms. */
const ATOM_COLORS = {
  H:'#e8f0ff', He:'#d9c1ff',
  Li:'#c060ff', Be:'#6ee16e', B:'#ffb3b3', C:'#404040', N:'#3a70e6', O:'#e63a3a', F:'#a5f070', Ne:'#b3e0ff',
  Na:'#b833ff', Mg:'#5adc5a', Al:'#c8a0a0', Si:'#f0c078', P:'#ff9838', S:'#f0d040', Cl:'#3fdc3f', Ar:'#80c0ff',
  K:'#8f28ff', Ca:'#48ff48',
  Sc:'#e6e6e6', Ti:'#bfc4c9', V:'#a0a5b0', Cr:'#8a99ac', Mn:'#9c7ac2', Fe:'#e07a35', Co:'#f0a0c0', Ni:'#4fd48b', Cu:'#ff8040', Zn:'#7d80b0',
  Ga:'#c68b8b', Ge:'#5a8080', As:'#bd80e3', Se:'#ffa100', Br:'#a52a2a', Kr:'#5cb8d1',
  Rb:'#702eb0', Sr:'#00ff00',
  Y:'#94ffff', Zr:'#94e0e0', Nb:'#73c2c9', Mo:'#54b5b5', Tc:'#3b9e9e', Ru:'#248f8f', Rh:'#0a7d8c', Pd:'#006985', Ag:'#c0c0c0', Cd:'#ffd98f',
  In:'#a67573', Sn:'#668080', Sb:'#9e63b5', Te:'#d47a00', I:'#8a1fbf', Xe:'#429eb0',
  Cs:'#57178f', Ba:'#00c900',
  La:'#70d4ff', Ce:'#ffffc7', Pr:'#d9ffc7', Nd:'#c7ffc7', Pm:'#a3ffc7', Sm:'#8fffc7', Eu:'#61ffc7', Gd:'#45ffc7', Tb:'#30ffc7', Dy:'#1fffc7', Ho:'#00ff9c', Er:'#00e675', Tm:'#00d452', Yb:'#00bf38', Lu:'#00ab24',
  Hf:'#4dc2ff', Ta:'#4da6ff', W:'#2194d6', Re:'#267dab', Os:'#266696', Ir:'#175487', Pt:'#d0d0e0', Au:'#ffd23f', Hg:'#b8b8d0',
  Tl:'#a6544d', Pb:'#575961', Bi:'#9e4fb5', Po:'#ab5c00', At:'#754f45', Rn:'#428296',
  Fr:'#420066', Ra:'#007d00',
  Ac:'#70abfa', Th:'#00baff', Pa:'#00a1ff', U:'#008fff', Np:'#0080ff', Pu:'#006bff',
  Am:'#545cf2', Cm:'#785ce3', Bk:'#8a4fe3', Cf:'#a136d4', Es:'#b31fd4', Fm:'#b31fba',
  Md:'#b30da6', No:'#bd0d87', Lr:'#c70066',
  Rf:'#cc0059', Db:'#d1004f', Sg:'#d90045', Bh:'#e00038', Hs:'#e6002e', Mt:'#eb0026',
  Ds:'#ee001d', Rg:'#f00014', Cn:'#f10012', Nh:'#f10010', Fl:'#f1000e', Mc:'#f1000c',
  Lv:'#f1000a', Ts:'#f00008', Og:'#f00006'
};
function colorForAtom(sym){ return ATOM_COLORS[sym] || '#7fe3ff'; }
/* Given a fill hex, return a contrasting text color (black or white). */
function contrastText(hex){
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  // Relative luminance
  const L = (0.2126*r + 0.7152*g + 0.0722*b)/255;
  return L > 0.55 ? '#000' : '#fff';
}

function drawAtom(ctx, x, y, sym, alpha=1){
  const color = colorForAtom(sym);
  ctx.save();
  ctx.globalAlpha = alpha;
  // Outer soft halo
  const g = ctx.createRadialGradient(x,y,0,x,y,22);
  g.addColorStop(0, color);
  g.addColorStop(1, color+'00');
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill();
  // Sphere with subtle 3D shading
  const sph = ctx.createRadialGradient(x-4,y-4,1, x,y,13);
  sph.addColorStop(0, lighten(color, 0.35));
  sph.addColorStop(0.6, color);
  sph.addColorStop(1, darken(color, 0.3));
  ctx.fillStyle = sph;
  ctx.beginPath(); ctx.arc(x,y,13,0,Math.PI*2); ctx.fill();
  // Rim
  ctx.strokeStyle = darken(color, 0.4);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x,y,13,0,Math.PI*2); ctx.stroke();
  // Label with contrast outline
  const txtColor = contrastText(color);
  const outline  = txtColor==='#fff' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
  ctx.font='bold 12px JetBrains Mono, ui-monospace, monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = outline;
  ctx.strokeText(sym, x, y);
  ctx.fillStyle = txtColor;
  ctx.fillText(sym, x, y);
  ctx.textBaseline='alphabetic';
  ctx.restore();
}
function lighten(hex, amt){
  const h=hex.replace('#','');
  const r=Math.min(255, Math.round(parseInt(h.slice(0,2),16) + 255*amt));
  const g=Math.min(255, Math.round(parseInt(h.slice(2,4),16) + 255*amt));
  const b=Math.min(255, Math.round(parseInt(h.slice(4,6),16) + 255*amt));
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function darken(hex, amt){
  const h=hex.replace('#','');
  const r=Math.max(0, Math.round(parseInt(h.slice(0,2),16) * (1-amt)));
  const g=Math.max(0, Math.round(parseInt(h.slice(2,4),16) * (1-amt)));
  const b=Math.max(0, Math.round(parseInt(h.slice(4,6),16) * (1-amt)));
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function symToCategory(sym){
  for(const z in ELEMENTS) if(ELEMENTS[z].symbol===sym) return ELEMENTS[z].category;
  return 'unknown';
}

/* ================ Text-to-speech ================ */
let voicesLoaded = false;
function ensureVoices(){
  return new Promise(res=>{
    const v = window.speechSynthesis?.getVoices?.() || [];
    if(v.length){ voicesLoaded=true; res(v); return; }
    if(!window.speechSynthesis){ res([]); return; }
    speechSynthesis.onvoiceschanged = ()=>res(speechSynthesis.getVoices());
  });
}
async function speak(text, langHint){
  if(!('speechSynthesis' in window)){
    alert(t('tts.unavailable')); return;
  }
  speechSynthesis.cancel();
  const voices = await ensureVoices();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langHint;
  const match = voices.find(v=>v.lang.toLowerCase().startsWith(langHint.toLowerCase().slice(0,2)));
  if(match) u.voice = match;
  u.rate = 0.9;
  return new Promise(resolve=>{
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

/* Read a sequence of elements (by Z) in the current language. */
async function speakSequence(zList, lang){
  if(!('speechSynthesis' in window)){ alert(t('tts.unavailable')); return; }
  speechSynthesis.cancel();
  const langHint = lang==='zh-CN' ? 'zh-CN' : 'en-US';
  for(const z of zList){
    const el = ELEMENTS[z]; if(!el) continue;
    const name = lang==='zh-CN' ? el.name_zh : el.name_en;
    await speak(name, langHint);
    // small pause between names
    await new Promise(r=>setTimeout(r, 150));
  }
}
document.getElementById('ttsEn').addEventListener('click',(e)=>{
  if(!currentZ) return;
  e.currentTarget.classList.add('playing');
  speak(ELEMENTS[currentZ].name_en, 'en-US');
  setTimeout(()=>e.currentTarget.classList.remove('playing'), 2000);
});
document.getElementById('ttsZh').addEventListener('click',(e)=>{
  if(!currentZ) return;
  e.currentTarget.classList.add('playing');
  speak(ELEMENTS[currentZ].name_zh, 'zh-CN');
  setTimeout(()=>e.currentTarget.classList.remove('playing'), 2000);
});

/* ================ 3D MOLECULAR VIEWER ================
   Pure-canvas ball-and-stick with perspective projection.
   Rotate: drag with mouse / finger. Auto-rotates when idle.
================================================== */
const SHAPE_LABELS = {
  'H2O':['bent','弯曲(V 形)'],
  'H2O2':['open-book','开书结构'],
  'NH3':['trigonal pyramidal','三角锥形'],
  'CH4':['tetrahedral','正四面体'],
  'C2H4':['planar','平面'],
  'C2H2':['linear','直线形'],
  'C2H6':['staggered','交错构象'],
  'CO2':['linear','直线形'],
  'CO':['linear','直线形'],
  'SF6':['octahedral','正八面体'],
  'PCl5':['trigonal bipyramidal','三角双锥形'],
  'C6H6':['aromatic ring','芳香环'],
  'H2SO4':['tetrahedral','四面体'],
  'NaCl':['rock-salt lattice','岩盐晶格'],
  'C_diamond':['tetrahedral network','四面体网络'],
  'Fe2O3':['ionic oxide','离子型氧化物']
};

/* Collect all unique formulas appearing in reactions, look up their 3D data,
   and render one viewer per known structure. */
function render3DViewers(reactions){
  const block = document.getElementById('d3dBlock');
  const grid = document.getElementById('d3d');
  const lang = window.CURRENT_LANG || 'en';
  const seen = new Set();
  const known = [];
  reactions.forEach(r=>{
    const parsed = parseEquation(r.eq);
    [...parsed.lhs, ...parsed.rhs].forEach(g=>{
      const f = g.formula;
      if(!seen.has(f) && MOLECULE_3D[f]){
        seen.add(f); known.push(f);
      }
    });
  });
  if(known.length===0){ block.style.display='none'; grid.innerHTML=''; return; }
  block.style.display='block';
  grid.innerHTML = known.map(f=>{
    const shape = SHAPE_LABELS[f];
    const shapeTxt = shape ? (lang==='zh-CN'?shape[1]:shape[0]) : '';
    return `<div class="mol3d-card" data-formula="${f}">
      <canvas></canvas>
      <div class="mol3d-caption">${prettyFormula(f)}</div>
      <div class="mol3d-shape">${shapeTxt}</div>
    </div>`;
  }).join('');
  // Start viewers
  grid.querySelectorAll('.mol3d-card').forEach(card=>{
    initMol3D(card, card.dataset.formula);
  });
}
function prettyFormula(f){
  // Convert digits to subscripts for display
  return f.replace(/([A-Za-z\)])(\d+)/g, (_,pre,n)=>pre + n.replace(/\d/g, d=>'₀₁₂₃₄₅₆₇₈₉'[+d]))
          .replace(/_diamond/,' (diamond)');
}

const molViewers = new Map(); // card -> {raf, state}
function initMol3D(card, formula){
  const mol = MOLECULE_3D[formula];
  if(!mol) return;
  const canvas = card.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  // Center + scale atoms
  const cx = mol.atoms.reduce((s,a)=>s+a.x,0)/mol.atoms.length;
  const cy = mol.atoms.reduce((s,a)=>s+a.y,0)/mol.atoms.length;
  const cz = mol.atoms.reduce((s,a)=>s+a.z,0)/mol.atoms.length;
  const centered = mol.atoms.map(a=>({sym:a.sym, x:a.x-cx, y:a.y-cy, z:a.z-cz}));
  const maxR = Math.max(...centered.map(a=>Math.hypot(a.x,a.y,a.z))) || 1;

  const state = {
    rotY: 0.6, rotX: 0.2, autoSpin: true,
    dragging: false, lastX:0, lastY:0, velY:0.006, velX:0
  };

  // Drag / touch
  card.addEventListener('pointerdown', e=>{
    state.dragging = true; state.autoSpin = false;
    state.lastX = e.clientX; state.lastY = e.clientY;
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', e=>{
    if(!state.dragging) return;
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.rotY += dx * 0.01;
    state.rotX += dy * 0.01;
    state.velY = dx * 0.001;
    state.velX = dy * 0.001;
    state.lastX = e.clientX; state.lastY = e.clientY;
  });
  card.addEventListener('pointerup', e=>{
    state.dragging = false;
    // Resume auto-spin after brief idle
    setTimeout(()=>{ if(!state.dragging) state.autoSpin = true; }, 1200);
  });

  function frame(){
    const r = canvas.getBoundingClientRect();
    if(r.width<20 || r.height<20){ state.raf = requestAnimationFrame(frame); return; }
    if(canvas.width !== r.width*devicePixelRatio){
      canvas.width = r.width*devicePixelRatio;
      canvas.height = r.height*devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    }
    const W = r.width, H = r.height;
    ctx.clearRect(0,0,W,H);
    // subtle background grid
    ctx.strokeStyle='rgba(255,255,255,0.03)';
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();

    if(state.autoSpin){
      state.rotY += 0.006;
      state.rotX += Math.sin(performance.now()/6000)*0.002;
    }
    // Clamp rotX to avoid gimbal weirdness
    state.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, state.rotX));

    // Rotate atoms
    const cosY = Math.cos(state.rotY), sinY = Math.sin(state.rotY);
    const cosX = Math.cos(state.rotX), sinX = Math.sin(state.rotX);
    const projected = centered.map((a,i)=>{
      // Y rotation
      let x = a.x*cosY + a.z*sinY;
      let z = -a.x*sinY + a.z*cosY;
      let y = a.y;
      // X rotation
      const y2 = y*cosX - z*sinX;
      const z2 = y*sinX + z*cosX;
      y = y2; z = z2;
      return {i, sym:a.sym, x, y, z};
    });
    // Perspective project
    const scale = Math.min(W,H) * 0.35 / maxR;
    const cxp = W/2, cyp = H/2;
    const camZ = maxR * 3;
    const proj = projected.map(a=>{
      const fov = camZ / (camZ - a.z);
      return {i:a.i, sym:a.sym, sx: cxp + a.x*scale*fov, sy: cyp + a.y*scale*fov, sz: a.z, size: 14*fov};
    });
    // Sort by z for painter's algorithm
    const order = proj.slice().sort((a,b)=>a.sz - b.sz);

    // Draw bonds first (in z order of midpoint)
    const bondItems = mol.bonds.map(([i,j,order])=>{
      const a = proj[i], b = proj[j];
      return {a, b, order, midZ:(a.sz+b.sz)/2};
    }).sort((x,y)=>x.midZ - y.midZ);

    // Interleave drawing: for each atom in z-order, draw bonds that end before it, then it
    // Simpler: draw all bonds first (back-to-front), then all atoms (back-to-front)
    bondItems.forEach(bnd=>{
      drawBond3D(ctx, bnd.a, bnd.b, bnd.order);
    });
    order.forEach(a=>{
      drawAtom3D(ctx, a.sx, a.sy, a.size, a.sym);
    });

    state.raf = requestAnimationFrame(frame);
  }
  frame();
  molViewers.set(card, state);
}
function drawAtom3D(ctx, x, y, radius, sym){
  const color = colorForAtom(sym);
  // Outer glow
  const halo = ctx.createRadialGradient(x,y,radius*0.4, x,y,radius*1.9);
  halo.addColorStop(0, color+'55');
  halo.addColorStop(1, color+'00');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(x,y,radius*1.9,0,Math.PI*2); ctx.fill();
  // Sphere with 3D shading
  const sph = ctx.createRadialGradient(x-radius*0.35, y-radius*0.35, radius*0.1, x, y, radius);
  sph.addColorStop(0, lighten(color, 0.4));
  sph.addColorStop(0.6, color);
  sph.addColorStop(1, darken(color, 0.4));
  ctx.fillStyle = sph;
  ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
  // Rim
  ctx.strokeStyle = darken(color, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.stroke();
  // Highlight
  const hi = ctx.createRadialGradient(x-radius*0.35, y-radius*0.35, 0, x-radius*0.35, y-radius*0.35, radius*0.5);
  hi.addColorStop(0, 'rgba(255,255,255,0.7)');
  hi.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hi;
  ctx.beginPath(); ctx.arc(x-radius*0.35, y-radius*0.35, radius*0.5, 0, Math.PI*2); ctx.fill();
  // Label if atom is big enough
  if(radius > 8){
    const txt = contrastText(color);
    const outline = txt==='#fff' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
    ctx.font = `bold ${Math.round(radius*0.85)}px JetBrains Mono, ui-monospace, monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = outline;
    ctx.strokeText(sym, x, y);
    ctx.fillStyle = txt;
    ctx.fillText(sym, x, y);
    ctx.textBaseline='alphabetic';
  }
}
function drawBond3D(ctx, a, b, order){
  const dx = b.sx-a.sx, dy = b.sy-a.sy;
  const len = Math.hypot(dx,dy);
  if(len < 2) return;
  // Bond as two color-split cylinders (halfway color)
  const midX = (a.sx+b.sx)/2, midY = (a.sy+b.sy)/2;
  const ca = colorForAtom(a.sym), cb = colorForAtom(b.sym);
  const width = Math.max(3, Math.min(a.size, b.size) * 0.4);
  // Offset for double/triple bonds
  const nx = -dy/len, ny = dx/len;
  const offset = order===1 ? [0] : order===2 ? [-width*0.5, width*0.5] : [-width, 0, width];
  offset.forEach(off=>{
    // Half A
    ctx.strokeStyle = darken(ca, 0.15);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.sx + nx*off, a.sy + ny*off);
    ctx.lineTo(midX + nx*off, midY + ny*off);
    ctx.stroke();
    // Half B
    ctx.strokeStyle = darken(cb, 0.15);
    ctx.beginPath();
    ctx.moveTo(midX + nx*off, midY + ny*off);
    ctx.lineTo(b.sx + nx*off, b.sy + ny*off);
    ctx.stroke();
  });
}

/* ================ LANGUAGE SWITCHER ================ */
document.querySelectorAll('.lang-pill').forEach(b=>{
  b.addEventListener('click',()=>{
    const lang = b.dataset.lang;
    try { localStorage.setItem('pt-lang', lang); } catch(_){}
    applyI18n(lang);
  });
});
const savedLang = (function(){ try { return localStorage.getItem('pt-lang'); } catch(_){ return null; } })();
const browserLang = (navigator.language||'').toLowerCase();
const initLang = savedLang || (browserLang.startsWith('zh') ? 'zh-CN' : 'en');
applyI18n(initLang);

/* Show hydrogen by default */
openDetail(1);
