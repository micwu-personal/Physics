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
  LAYOUT.forEach(row=>{
    row.forEach(cell=>{
      if(cell===0){
        const empty=document.createElement('div'); empty.className='cell empty';
        gridEl.appendChild(empty);
      } else if(cell==='La-Lu' || cell==='Ac-Lr'){
        const ph=document.createElement('div');
        ph.className='cell placeholder ' + (cell==='La-Lu'?'lanthanide':'actinide');
        ph.textContent=cell;
        ph.title = cell==='La-Lu' ? '57–71 Lanthanides' : '89–103 Actinides';
        gridEl.appendChild(ph);
      } else {
        gridEl.appendChild(makeCell(cell,lang));
      }
    });
  });
  fblockEl.innerHTML='';
  F_BLOCK.forEach(row=>{
    row.forEach(z=>fblockEl.appendChild(makeCell(z,lang)));
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
  currentZ = z;
  currentHybrid = null;
  document.querySelectorAll('.cell').forEach(c=>c.classList.toggle('active', +c.dataset.z===z));
  detailEl.classList.remove('hidden');
  refreshDetail();
  // Scroll into view
  setTimeout(()=>detailEl.scrollIntoView({behavior:'smooth', block:'start'}), 50);
}
document.getElementById('detailClose').addEventListener('click',()=>{
  detailEl.classList.add('hidden'); currentZ=null;
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('active'));
});

function refreshDetail(){
  if(!currentZ) return;
  const el = ELEMENTS[currentZ];
  const ext = EXTENDED[currentZ] || {};
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
      b.addEventListener('click',()=>{ currentHybrid=b.dataset.h; refreshOrbital(); });
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
  const resize = ()=>{
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  };
  resize();
  const shells = shellCounts(z).filter(x=>x>0);
  const W = canvas.getBoundingClientRect().width;
  const H = canvas.getBoundingClientRect().height;
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
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W = r.width, H = r.height;
  const cx=W/2, cy=H/2;
  const start = performance.now();

  // Define lobes: array of {angle, tilt(polar), color, kind:'sphere'|'lobe'}
  const shapes = shapesForHybrid(h);
  const R = Math.min(W,H)*0.32;

  function frame(){
    const t = (performance.now()-start)/1000;
    ctx.clearRect(0,0,W,H);
    // subtle grid
    ctx.strokeStyle='rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    // Rotate whole cloud around center
    const rot = t*0.3;
    shapes.forEach(s=>{
      const a = s.a + rot;
      const px = cx + Math.cos(a)*R*0.5;
      const py = cy + Math.sin(a)*R*0.5;
      // Draw two-lobed shape: outer + inner
      if(s.kind==='sphere'){
        const g = ctx.createRadialGradient(cx,cy,0, cx,cy,R*0.9);
        g.addColorStop(0, s.color);
        g.addColorStop(1, s.color+'00');
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(cx,cy,R*0.9,0,Math.PI*2); ctx.fill();
      } else {
        // Teardrop / dumbbell lobe
        drawLobe(ctx, cx, cy, R, a, s.color);
      }
    });
    // Center nucleus
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fill();
    orbRAF = requestAnimationFrame(frame);
  }
  frame();
}
function drawLobe(ctx, cx, cy, R, angle, color){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(angle);
  // Two lobes (positive + negative phase for p-like)
  for(let side of [1,-1]){
    const g = ctx.createRadialGradient(side*R*0.55, 0, 0, side*R*0.55, 0, R*0.5);
    g.addColorStop(0, color);
    g.addColorStop(1, color+'00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(side*R*0.55, 0, R*0.5, R*0.28, 0, 0, Math.PI*2);
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

/* ----- Reaction animation ----- */
let rxRAF=null;
function animateReaction(eq){
  const box = document.getElementById('rxAnimBox');
  box.classList.add('on');
  const canvas = document.getElementById('rxAnimCanvas');
  const ctx = canvas.getContext('2d');
  const rct = canvas.getBoundingClientRect();
  canvas.width = rct.width*devicePixelRatio;
  canvas.height = rct.height*devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W=rct.width, H=rct.height;
  cancelAnimationFrame(rxRAF);

  // Parse LHS and RHS very roughly for a visualization
  const [lhs, rhs] = eq.split(/[→⇌]/).map(s=>s.trim());
  // Extract atoms as tokens (very basic)
  const leftAtoms = tokensToAtoms(lhs);
  const rightAtoms = tokensToAtoms(rhs || lhs);

  const start = performance.now();
  const dur = 4000;
  function frame(){
    const p = Math.min(1, (performance.now()-start)/dur);
    ctx.clearRect(0,0,W,H);
    // Draw left atoms migrating to right
    const cyMid = H/2;
    leftAtoms.forEach((a,i)=>{
      const startX = 40 + (W-80)*0.15*(i/Math.max(1,leftAtoms.length-1));
      const endX   = W - 40 - (W-80)*0.15*(i/Math.max(1,leftAtoms.length-1));
      const x = startX + (endX-startX)*ease(p);
      const y = cyMid + Math.sin(p*Math.PI*2 + i)*15*(1-p);
      drawAtom(ctx, x, y, a);
    });
    // Draw arrow
    ctx.strokeStyle='rgba(0,212,255,0.5)';
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W*0.45, cyMid); ctx.lineTo(W*0.55, cyMid); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W*0.55, cyMid); ctx.lineTo(W*0.53, cyMid-4); ctx.lineTo(W*0.53, cyMid+4); ctx.closePath();
    ctx.fillStyle='rgba(0,212,255,0.5)'; ctx.fill();
    // Equation text
    ctx.fillStyle='#fff';
    ctx.font='bold 14px JetBrains Mono, monospace';
    ctx.textAlign='center';
    ctx.fillText(eq, W/2, H-20);
    if(p<1) rxRAF = requestAnimationFrame(frame);
  }
  frame();
}
function ease(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }
function tokensToAtoms(s){
  // Extract element symbols (uppercase+lowercase?)
  const re = /([A-Z][a-z]?)(\d*)/g;
  const out = [];
  let m;
  while((m=re.exec(s))!==null){
    const sym = m[1];
    const count = m[2] ? +m[2] : 1;
    for(let i=0;i<Math.min(count,3);i++) out.push(sym);
    if(out.length>8) break;
  }
  return out;
}
function drawAtom(ctx, x, y, sym){
  const cat = symToCategory(sym);
  const color = CATEGORY_COLORS[cat] || '#7fe3ff';
  const g = ctx.createRadialGradient(x,y,0,x,y,22);
  g.addColorStop(0, color);
  g.addColorStop(1, color+'00');
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.font='bold 11px JetBrains Mono, monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(sym, x, y);
  ctx.textBaseline='alphabetic';
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
  speechSynthesis.speak(u);
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
