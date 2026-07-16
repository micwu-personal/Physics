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
  const availHybrids = inferHybrids(el);
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

/* ================ ORBITAL & HYBRIDIZATION ENGINE ================
   Each entry describes a real quantum-mechanical shape as a list of
   "lobes". Each lobe: {dir:[x,y,z], phase:+1|-1, kind:'lobe'|'torus'|'sphere', size?}
   Rendering is done in 3D with perspective projection so p, d, f
   orbitals look correct, and hybrid sets (sp, sp², sp³, sp³d,
   sp³d², d²sp³, dsp²) point in true geometric directions.
================================================================= */
const ORBITAL_SHAPES = {
  // Atomic orbitals ---------------------------------------------
  's':      [ {kind:'sphere', phase:+1} ],
  'p_x':    [ {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:-1} ],
  'p_y':    [ {kind:'lobe', dir:[0,+1,0], phase:+1}, {kind:'lobe', dir:[0,-1,0], phase:-1} ],
  'p_z':    [ {kind:'lobe', dir:[0,0,+1], phase:+1}, {kind:'lobe', dir:[0,0,-1], phase:-1} ],
  'd_z2':   [ {kind:'lobe', dir:[0,0,+1], phase:+1}, {kind:'lobe', dir:[0,0,-1], phase:+1},
              {kind:'torus', dir:[0,0,1], phase:-1} ],
  'd_x2y2': [ {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:+1},
              {kind:'lobe', dir:[0,+1,0], phase:-1}, {kind:'lobe', dir:[0,-1,0], phase:-1} ],
  'd_xy':   [ {kind:'lobe', dir:[+1,+1,0], phase:+1}, {kind:'lobe', dir:[-1,-1,0], phase:+1},
              {kind:'lobe', dir:[+1,-1,0], phase:-1}, {kind:'lobe', dir:[-1,+1,0], phase:-1} ],
  'd_xz':   [ {kind:'lobe', dir:[+1,0,+1], phase:+1}, {kind:'lobe', dir:[-1,0,-1], phase:+1},
              {kind:'lobe', dir:[+1,0,-1], phase:-1}, {kind:'lobe', dir:[-1,0,+1], phase:-1} ],
  'd_yz':   [ {kind:'lobe', dir:[0,+1,+1], phase:+1}, {kind:'lobe', dir:[0,-1,-1], phase:+1},
              {kind:'lobe', dir:[0,+1,-1], phase:-1}, {kind:'lobe', dir:[0,-1,+1], phase:-1} ],
  'f_z3':   [ {kind:'lobe', dir:[0,0,+1], phase:+1, size:1.2}, {kind:'lobe', dir:[0,0,-1], phase:-1, size:1.2},
              {kind:'torus', dir:[0,0,1], phase:+1, size:0.7} ],
  'f_xyz':  [ {kind:'lobe', dir:[+1,+1,+1], phase:+1}, {kind:'lobe', dir:[-1,-1,+1], phase:+1},
              {kind:'lobe', dir:[+1,-1,-1], phase:+1}, {kind:'lobe', dir:[-1,+1,-1], phase:+1},
              {kind:'lobe', dir:[-1,+1,+1], phase:-1}, {kind:'lobe', dir:[+1,-1,+1], phase:-1},
              {kind:'lobe', dir:[+1,+1,-1], phase:-1}, {kind:'lobe', dir:[-1,-1,-1], phase:-1} ],
  // Hybrid orbitals (correct geometries) ------------------------
  'sp':     [ {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:+1} ],
  'sp2':    [ {kind:'lobe', dir:[Math.cos(0),Math.sin(0),0], phase:+1},
              {kind:'lobe', dir:[Math.cos(2*Math.PI/3),Math.sin(2*Math.PI/3),0], phase:+1},
              {kind:'lobe', dir:[Math.cos(4*Math.PI/3),Math.sin(4*Math.PI/3),0], phase:+1} ],
  'sp3':    [ // tetrahedral: (1,1,1),(-1,-1,1),(-1,1,-1),(1,-1,-1)
              {kind:'lobe', dir:[+1,+1,+1], phase:+1},
              {kind:'lobe', dir:[-1,-1,+1], phase:+1},
              {kind:'lobe', dir:[-1,+1,-1], phase:+1},
              {kind:'lobe', dir:[+1,-1,-1], phase:+1} ],
  'sp3d':   [ // trigonal bipyramidal: 3 equatorial + 2 axial
              {kind:'lobe', dir:[Math.cos(0),Math.sin(0),0], phase:+1},
              {kind:'lobe', dir:[Math.cos(2*Math.PI/3),Math.sin(2*Math.PI/3),0], phase:+1},
              {kind:'lobe', dir:[Math.cos(4*Math.PI/3),Math.sin(4*Math.PI/3),0], phase:+1},
              {kind:'lobe', dir:[0,0,+1], phase:+1},
              {kind:'lobe', dir:[0,0,-1], phase:+1} ],
  'sp3d2':  [ // octahedral
              {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:+1},
              {kind:'lobe', dir:[0,+1,0], phase:+1}, {kind:'lobe', dir:[0,-1,0], phase:+1},
              {kind:'lobe', dir:[0,0,+1], phase:+1}, {kind:'lobe', dir:[0,0,-1], phase:+1} ],
  'd2sp3':  [ // inner-orbital octahedral (visually same)
              {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:+1},
              {kind:'lobe', dir:[0,+1,0], phase:+1}, {kind:'lobe', dir:[0,-1,0], phase:+1},
              {kind:'lobe', dir:[0,0,+1], phase:+1}, {kind:'lobe', dir:[0,0,-1], phase:+1} ],
  'dsp2':   [ // square planar
              {kind:'lobe', dir:[+1,0,0], phase:+1}, {kind:'lobe', dir:[-1,0,0], phase:+1},
              {kind:'lobe', dir:[0,+1,0], phase:+1}, {kind:'lobe', dir:[0,-1,0], phase:+1} ]
};

const HYBRID_LABELS = {
  s:'s',
  p_x:'p_x', p_y:'p_y', p_z:'p_z',
  d_z2:'d_z²', d_x2y2:'d_x²−y²', d_xy:'d_xy', d_xz:'d_xz', d_yz:'d_yz',
  f_z3:'f_z³', f_xyz:'f_xyz',
  sp:'sp', sp2:'sp²', sp3:'sp³', sp3d:'sp³d', sp3d2:'sp³d²',
  d2sp3:'d²sp³', dsp2:'dsp²'
};

/* Return the list of orbitals this element can reasonably display.
   All elements can view atomic orbitals up to their highest occupied
   shell. Hybrids reflect what the element commonly forms in compounds. */
function inferHybrids(el){
  const Z = el.Z;
  const period = el.period;
  const list = [];

  // Everyone: view s
  list.push('s');
  // Anything from Li (Z=3) onward can access p orbitals
  if(Z >= 5) list.push('p_x', 'p_y', 'p_z');
  // Anything from Sc (Z=21) uses d orbitals
  if(Z >= 21) list.push('d_z2','d_x2y2','d_xy');
  // Lanthanides (57-71) / Actinides (89-103) fill f
  if((Z>=57 && Z<=71) || (Z>=89 && Z<=103)) list.push('f_z3','f_xyz');

  // Hybrid orbitals per category
  if(el.category==='noble'){
    // noble gases: only Xe / Kr / Rn form hybrids
    if(Z>=36) list.push('sp3','sp3d','sp3d2');
  } else if(el.category==='alkali'){
    // Li–Fr: primarily 's-character', but form ionic bonds. No serious hybridization.
    // We still allow sp for diatomic gas phase (e.g. Li2)
    list.push('sp');
  } else if(el.category==='alkaline'){
    // Be sp; Mg-Ba are ionic but can show sp
    list.push('sp');
    if(Z===4) list.push('sp2'); // Be sometimes sp2 (BeCl2 vapor is linear -> sp)
  } else if(el.category==='metalloid' || el.category==='nonmetal' || el.category==='halogen'){
    // main-group non-metals: sp, sp², sp³, and sp³d / sp³d² starting from period 3
    list.push('sp','sp2','sp3');
    if(period >= 3) list.push('sp3d','sp3d2');
  } else if(el.category==='posttransition'){
    list.push('sp','sp2','sp3');
    if(period >= 3) list.push('sp3d','sp3d2');
  } else if(el.category==='transition'){
    list.push('dsp2','d2sp3','sp3d2','sp3');
  } else if(el.category==='lanthanide' || el.category==='actinide'){
    // f-block: complex; usually treated with 4f/5f + spd hybrids
    list.push('sp3','sp3d2');
  }

  // Uniqueify & preserve order
  return [...new Set(list)];
}
function labelForHybrid(h){ return HYBRID_LABELS[h] || h; }
function refreshOrbital(){
  drawOrbital(currentHybrid);
  document.getElementById('dHybridText').innerHTML = descriptionForOrbital(currentHybrid);
}

/* Rich physics description per orbital / hybrid */
function descriptionForOrbital(h){
  const lang = window.CURRENT_LANG || 'en';
  const zh = lang==='zh-CN';
  const D = {
    s: {
      title: zh ? 's 轨道 — 球形对称' : 's orbital — spherically symmetric',
      body: zh
        ? '角量子数 <b>ℓ = 0</b>,球谐函数 Y₀⁰ 只是一个常数,因此波函数只依赖于半径 r,呈球对称。它是每一层的最内层轨道,最多容纳 2 个电子(自旋 ↑↓)。'
        : 'Angular momentum <b>ℓ = 0</b>. The spherical harmonic Y₀⁰ is a constant, so the wavefunction depends only on radius r — hence perfect spherical symmetry. It is the innermost orbital in every shell and holds up to 2 electrons (spin ↑↓).'
    },
    p_x: {
      title: zh ? 'p 轨道 — 哑铃形(沿轴向)' : 'p orbital — dumbbell along an axis',
      body: zh
        ? '<b>ℓ = 1</b>,共 3 个方向 (p_x, p_y, p_z),每个都是两瓣哑铃形,两瓣之间有一个"节面"(波函数为零)——两瓣电子云的相位相反(图中用不同颜色表示)。可容纳 6 个电子(每方向 2 个)。'
        : '<b>ℓ = 1</b>. Three orientations (p_x, p_y, p_z), each a two-lobed dumbbell separated by a nodal plane where the wavefunction is exactly zero. The two lobes carry <em>opposite phases</em> (shown in different colors). Together they hold up to 6 electrons.'
    },
    p_y: null,
    p_z: null,
    d_z2: {
      title: zh ? 'd_z² 轨道 — 沿 z 轴哑铃 + 环形节面' : 'd_z² orbital — z-axis dumbbell + torus',
      body: zh
        ? '<b>ℓ = 2</b> 的其中一个特殊形状。沿 ±z 各有一大瓣,在 xy 平面上还有一个"甜甜圈"形电子云,两者相位相反。这是 d 轨道中形状最独特的一个。'
        : 'One of the five <b>ℓ = 2</b> d orbitals. It has two large lobes along ±z and a "donut" torus in the xy-plane, with opposite phase. The most visually distinctive d shape.'
    },
    d_x2y2: {
      title: zh ? 'd_x²−y² 轨道 — 在 xy 平面上四瓣沿轴向' : 'd_x²−y² orbital — 4 lobes along ±x, ±y',
      body: zh
        ? '四瓣位于 xy 平面,沿 ±x 和 ±y 方向。相邻瓣的相位交替相反。这个轨道在配合物中常与配体在轴向方向的孤对电子相互作用,是"e_g"能级的成员。'
        : 'Four lobes in the xy-plane, pointing along ±x and ±y. Adjacent lobes have opposite phase. In octahedral complexes this orbital points straight at the ligands and forms the <em>e_g</em> level.'
    },
    d_xy: {
      title: zh ? 'd_xy 轨道 — xy 平面四瓣沿对角' : 'd_xy orbital — 4 lobes between the x, y axes',
      body: zh
        ? '与 d_x²−y² 类似,但四瓣旋转了 45°,指向 xy 平面的对角线方向。相邻瓣相位相反。在八面体配合物中它属于 t_2g 能级。'
        : 'Similar to d_x²−y² but rotated by 45°, so the lobes point between the axes (diagonal). Adjacent lobes have opposite phase. In octahedral complexes it belongs to the <em>t₂g</em> level.'
    },
    d_xz: {
      title: zh ? 'd_xz 轨道 — 在 xz 平面上四瓣沿对角' : 'd_xz orbital — 4 lobes in the xz-plane',
      body: zh
        ? '与 d_xy 相似,只是位于 xz 平面。四瓣位于 x 与 z 轴之间。'
        : 'Same shape as d_xy, but in the xz-plane. The four lobes lie between the x and z axes.'
    },
    d_yz: {
      title: zh ? 'd_yz 轨道 — 在 yz 平面上四瓣沿对角' : 'd_yz orbital — 4 lobes in the yz-plane',
      body: zh
        ? '与 d_xy 相似,位于 yz 平面。'
        : 'Same shape as d_xy, but in the yz-plane.'
    },
    f_z3: {
      title: zh ? 'f_z³ 轨道 — 沿 z 轴的复杂形状' : 'f_z³ orbital — z-axis dumbbell with rings',
      body: zh
        ? '<b>ℓ = 3</b>,共 7 个 f 轨道。f_z³ 沿 ±z 有两大瓣,并有节面。这些复杂形状源于球谐函数 Y_ℓ^m,f 电子对镧系与锕系元素的化学性质有决定性影响。'
        : 'One of seven <b>ℓ = 3</b> f orbitals. Elongated lobes along ±z with additional nodal cones. These complex shapes come straight from spherical harmonics Y_ℓ^m and are what makes lanthanide / actinide chemistry so unusual.'
    },
    f_xyz: {
      title: zh ? 'f_xyz 轨道 — 八瓣立方对角' : 'f_xyz orbital — 8 lobes along cube diagonals',
      body: zh
        ? '八瓣分别指向立方体的 8 个顶点方向。相邻瓣相位交替。这种 f 轨道使镧系元素能够形成配位数高达 9~12 的配合物。'
        : 'Eight lobes pointing toward the eight vertices of a cube. Adjacent lobes alternate in phase. Orbitals like this allow lanthanides to form complexes with coordination numbers as high as 9–12.'
    },
    sp: {
      title: zh ? 'sp 杂化 — 直线形 (180°)' : 'sp hybridization — linear (180°)',
      body: zh
        ? '一个 s 与一个 p 轨道等权重线性组合,产生 <b>2 个</b>大小相同、指向相反(180°)的杂化轨道。剩下的 2 个 p 轨道保持不变,常用来形成 π 键。'
        : 'Linear combination of one s and one p orbital, giving <b>2</b> equivalent hybrid orbitals pointing 180° apart. The remaining two p orbitals stay pure and typically form π bonds.'
    },
    sp2: {
      title: zh ? 'sp² 杂化 — 平面三角形 (120°)' : 'sp² hybridization — trigonal planar (120°)',
      body: zh
        ? '一个 s + 两个 p 轨道 → <b>3 个</b>等价 sp² 杂化轨道,位于同一平面内,互成 120°。第三个 p 轨道垂直于平面,常参与 π 键(如乙烯、苯)。'
        : 'One s + two p orbitals → <b>3</b> equivalent sp² hybrids in the same plane, 120° apart. The remaining p orbital is perpendicular to the plane and typically forms a π bond (ethylene, benzene).'
    },
    sp3: {
      title: zh ? 'sp³ 杂化 — 正四面体 (109.5°)' : 'sp³ hybridization — tetrahedral (109.5°)',
      body: zh
        ? '一个 s + 三个 p 轨道 → <b>4 个</b>等价 sp³ 杂化轨道,指向正四面体的四个顶点(键角 109.5°)。甲烷 CH₄、金刚石、SiO₄ 四面体均属于此。轨道方向指向立方体的四个不相邻顶点。'
        : 'One s + three p → <b>4</b> equivalent sp³ hybrids pointing to the four vertices of a regular tetrahedron (bond angle 109.5°). Methane (CH₄), diamond, and SiO₄ tetrahedra all belong here. The lobes point to four non-adjacent corners of a cube.'
    },
    sp3d: {
      title: zh ? 'sp³d 杂化 — 三角双锥 (120°/90°)' : 'sp³d hybridization — trigonal bipyramidal',
      body: zh
        ? '一个 s + 三个 p + 一个 d 轨道 → <b>5 个</b>杂化轨道。三个位于赤道平面内(120°),两个沿轴向(±z,与赤道方向 90°)。例:PCl₅。'
        : 'One s + three p + one d → <b>5</b> hybrid orbitals: three equatorial (120° apart) plus two axial (±z, 90° to the equator). Example: PCl₅.'
    },
    sp3d2: {
      title: zh ? 'sp³d² 杂化 — 正八面体 (90°)' : 'sp³d² hybridization — octahedral (90°)',
      body: zh
        ? '一个 s + 三个 p + 两个 d 轨道 → <b>6 个</b>等价杂化轨道,指向八面体的 6 个顶点(键角 90°)。SF₆、[Fe(H₂O)₆]²⁺ 等经典八面体分子/离子。'
        : 'One s + three p + two d → <b>6</b> equivalent hybrids pointing at the six vertices of an octahedron (all bond angles 90°). SF₆, [Fe(H₂O)₆]²⁺ and most classical octahedral complexes belong here.'
    },
    d2sp3: {
      title: zh ? 'd²sp³ 杂化 — 内轨型八面体' : 'd²sp³ hybridization — inner-orbital octahedral',
      body: zh
        ? '与 sp³d² 几何相同(正八面体),但由 (n−1)d 而非 nd 轨道参与,称为"内轨型"。低自旋配合物(如 [Fe(CN)₆]³⁻)常用此杂化。'
        : 'Geometrically identical to sp³d² (octahedral), but uses <b>(n−1)d</b> orbitals instead of nd — hence "inner-orbital". Common in low-spin transition-metal complexes such as [Fe(CN)₆]³⁻.'
    },
    dsp2: {
      title: zh ? 'dsp² 杂化 — 平面正方形' : 'dsp² hybridization — square planar',
      body: zh
        ? '一个 d + 一个 s + 两个 p → <b>4 个</b>杂化轨道在同一平面上,相邻夹角 90°。Ni²⁺、Pd²⁺、Pt²⁺、Cu²⁺ 的许多配合物(如顺铂 [PtCl₂(NH₃)₂])采用此几何。'
        : 'One d + one s + two p → <b>4</b> equivalent hybrids in one plane, 90° apart. Adopted by many Ni²⁺, Pd²⁺, Pt²⁺, Cu²⁺ complexes such as cisplatin [PtCl₂(NH₃)₂].'
    }
  };
  const spec = D[h] || (D[h?.replace(/_.*/, '')] || null);
  const entry = D[h] || (h && h.startsWith('p_') ? D.p_x : null);
  if(!entry) return '';
  return `<div class="orb-desc"><div class="orb-title">${entry.title}</div><div class="orb-body">${entry.body}</div></div>`;
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
/* Real 3D orbital renderer with perspective projection.
   Each lobe is drawn as a projected teardrop (using an eased ellipse),
   torus rings are drawn as thick arcs. Painter's algorithm z-sort. */
let orbState = { rotY:0.6, rotX:0.15, dragging:false, lastX:0, lastY:0, auto:true };

function drawOrbital(h){
  cancelAnimationFrame(orbRAF);
  const canvas = document.getElementById('orbitalCanvas');
  const ctx = canvas.getContext('2d');
  const r0 = canvas.getBoundingClientRect();
  if(r0.width < 20 || r0.height < 20) return;
  canvas.width = r0.width * devicePixelRatio;
  canvas.height = r0.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const W = r0.width, H = r0.height;
  const cx=W/2, cy=H/2;

  const shape = ORBITAL_SHAPES[h] || ORBITAL_SHAPES['s'];
  const R = Math.min(W,H) * 0.36;

  // Attach drag handlers only once
  if(!canvas._orbAttached){
    canvas._orbAttached = true;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', e=>{
      orbState.dragging = true; orbState.auto = false;
      orbState.lastX = e.clientX; orbState.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', e=>{
      if(!orbState.dragging) return;
      orbState.rotY += (e.clientX - orbState.lastX) * 0.01;
      orbState.rotX += (e.clientY - orbState.lastY) * 0.01;
      orbState.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, orbState.rotX));
      orbState.lastX = e.clientX; orbState.lastY = e.clientY;
    });
    canvas.addEventListener('pointerup', ()=>{
      orbState.dragging = false;
      canvas.style.cursor = 'grab';
      setTimeout(()=>{ if(!orbState.dragging) orbState.auto = true; }, 1500);
    });
  }

  function frame(){
    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();

    if(orbState.auto){ orbState.rotY += 0.005; }

    // Build all draw items with depth
    const items = [];
    shape.forEach(lobe=>{
      const dir = lobe.dir ? normalize(lobe.dir) : [0,0,1];
      const rotated = rotate3D(dir, orbState.rotY, orbState.rotX);
      const size = (lobe.size || 1);
      if(lobe.kind === 'sphere'){
        items.push({z:0, kind:'sphere', phase:lobe.phase, size});
      } else if(lobe.kind === 'torus'){
        // For d_z² torus etc., rotate the ring axis
        items.push({z:0, kind:'torus', axis:rotated, phase:lobe.phase, size});
      } else {
        // lobe
        const tip = rotated;
        items.push({z:tip[2], kind:'lobe', dir:tip, phase:lobe.phase, size});
      }
    });
    // Back-to-front sort
    items.sort((a,b)=>a.z - b.z);

    // Draw
    items.forEach(it=>{
      const pos = phaseColor(it.phase);
      if(it.kind === 'sphere'){
        const g = ctx.createRadialGradient(cx,cy,0, cx,cy,R*0.7);
        g.addColorStop(0, pos.core);
        g.addColorStop(0.6, pos.mid);
        g.addColorStop(1, pos.edge);
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(cx,cy,R*0.7,0,Math.PI*2); ctx.fill();
      } else if(it.kind === 'torus'){
        drawTorus(ctx, cx, cy, R, it.axis, pos);
      } else {
        // Project the lobe: origin at nucleus, tip at cx+dir.x*R, cy-dir.y*R (screen y is inverted)
        drawLobe3D(ctx, cx, cy, R * it.size, it.dir, pos);
      }
    });

    // Nucleus dot on top
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fill();

    // Label
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.font='bold 12px JetBrains Mono, ui-monospace, monospace';
    ctx.textAlign='left';
    ctx.fillText(labelForHybrid(h), 10, 20);
    // Legend
    const lang = window.CURRENT_LANG || 'en';
    ctx.font='10px JetBrains Mono, ui-monospace, monospace';
    ctx.fillStyle='rgba(127,227,255,0.9)';
    ctx.fillText('+', W-40, 20);
    ctx.fillStyle='rgba(255,158,194,0.9)';
    ctx.fillText('−', W-24, 20);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText(lang==='zh-CN' ? '波函数相位' : 'wavefunction phase', W-120, 34);

    orbRAF = requestAnimationFrame(frame);
  }
  frame();
}

/* Colors: cyan = +phase, pink = −phase */
function phaseColor(phase){
  if(phase >= 0){
    return { core:'rgba(127,227,255,0.85)', mid:'rgba(127,227,255,0.45)', edge:'rgba(127,227,255,0)', stroke:'rgba(90,180,220,0.7)' };
  } else {
    return { core:'rgba(255,158,194,0.85)', mid:'rgba(255,158,194,0.45)', edge:'rgba(255,158,194,0)', stroke:'rgba(210,120,150,0.7)' };
  }
}
function normalize(v){
  const L = Math.hypot(v[0],v[1],v[2]) || 1;
  return [v[0]/L, v[1]/L, v[2]/L];
}
function rotate3D(v, ry, rx){
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  // Y then X
  let x = v[0]*cy + v[2]*sy;
  let z = -v[0]*sy + v[2]*cy;
  let y = v[1];
  const y2 = y*cx - z*sx;
  const z2 = y*sx + z*cx;
  return [x, y2, z2];
}
/* Draw a single teardrop lobe from origin (nucleus) in direction dir (rotated) */
function drawLobe3D(ctx, cx, cy, R, dir, pos){
  // Screen coordinates: x maps to +x, y maps to -y (invert), z is depth
  const sx = cx + dir[0] * R * 0.05;  // start at nucleus (offset a tiny bit)
  const sy = cy - dir[1] * R * 0.05;
  const tx = cx + dir[0] * R;
  const ty = cy - dir[1] * R;
  // Perspective scale based on z (closer = bigger)
  const persp = 1 + dir[2] * 0.35;
  const width = R * 0.32 * persp;
  const length = Math.hypot(tx-sx, ty-sy);
  const angle = Math.atan2(ty-sy, tx-sx);

  // Draw teardrop as an ellipse offset from nucleus
  ctx.save();
  ctx.translate((sx+tx)/2, (sy+ty)/2);
  ctx.rotate(angle);
  // Radial gradient: pick sharper falloff away from tip
  const g = ctx.createRadialGradient(length*0.15, 0, 0, length*0.15, 0, length*0.7);
  g.addColorStop(0, pos.core);
  g.addColorStop(0.5, pos.mid);
  g.addColorStop(1, pos.edge);
  ctx.fillStyle = g;
  ctx.beginPath();
  // Teardrop-like ellipse - use quadratic curves
  ctx.moveTo(-length*0.5, 0);
  ctx.quadraticCurveTo(-length*0.5, -width, length*0.15, -width);
  ctx.quadraticCurveTo(length*0.55, -width*0.4, length*0.55, 0);
  ctx.quadraticCurveTo(length*0.55, width*0.4, length*0.15, width);
  ctx.quadraticCurveTo(-length*0.5, width, -length*0.5, 0);
  ctx.closePath();
  ctx.fill();
  // Rim outline
  ctx.strokeStyle = pos.stroke;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}
/* Draw a torus (ring) around an axis: e.g. d_z² has a torus in xy */
function drawTorus(ctx, cx, cy, R, axis, pos){
  // The torus lies in the plane perpendicular to axis. Draw it as
  // an ellipse whose shape depends on axis direction.
  // If axis is (ax,ay,az), the ring's projection onto the screen
  // is an ellipse with semi-major axis R * ringR and semi-minor
  // axis proportional to |z-component of axis|.
  const ringR = R * 0.55;
  // Find two vectors perpendicular to axis
  const [ax, ay, az] = axis;
  // Build orthogonal basis
  const up = Math.abs(az) < 0.9 ? [0,0,1] : [1,0,0];
  const e1 = normalize([ay*up[2]-az*up[1], az*up[0]-ax*up[2], ax*up[1]-ay*up[0]]);
  const e2 = normalize([ay*e1[2]-az*e1[1], az*e1[0]-ax*e1[2], ax*e1[1]-ay*e1[0]]);
  const N = 48;
  const pts = [];
  for(let i=0;i<=N;i++){
    const th = (i/N)*Math.PI*2;
    const c = Math.cos(th), s = Math.sin(th);
    const x = e1[0]*c + e2[0]*s;
    const y = e1[1]*c + e2[1]*s;
    const z = e1[2]*c + e2[2]*s;
    pts.push({x: cx + x*ringR, y: cy - y*ringR, z});
  }
  // Draw filled ring using two loops (outer and inner). Use gradient along z.
  ctx.save();
  ctx.strokeStyle = pos.core;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  // Segment by segment for depth-tinted appearance
  for(let i=0;i<N;i++){
    const a = pts[i], b = pts[i+1];
    const zAvg = (a.z + b.z)/2;
    ctx.globalAlpha = 0.35 + Math.max(0, zAvg) * 0.5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
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
