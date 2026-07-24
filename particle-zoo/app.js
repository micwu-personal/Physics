/* ================ PARTICLE DATA ================ */
const PARTICLES = {
  up:      {sym:'u', name:'Up quark',       cls:'Quark (Gen I)',   mass:'2.2 MeV/c²',    charge:'+2/3 e', spin:'1/2', color:'quark',    antiparticle:'ū (anti-up)',      forces:['Strong','EM','Weak','Gravity'], discovered:'1968 (SLAC)',
    desc:'A first-generation quark and one of the two building blocks of every proton and neutron in your body. Up quarks feel every fundamental force.',
    facts:['Two ups + one down = a proton','One up + two downs = a neutron','Carries color charge (red, green, or blue) — always confined inside hadrons','Never seen alone: pulling quarks apart creates new quark-antiquark pairs'],
    fun:'You are ~50% up quarks by particle count.'
  },
  down:    {sym:'d', name:'Down quark',     cls:'Quark (Gen I)',   mass:'4.7 MeV/c²',    charge:'−1/3 e', spin:'1/2', color:'quark',    antiparticle:'d̄ (anti-down)',    forces:['Strong','EM','Weak','Gravity'], discovered:'1968 (SLAC)',
    desc:'The second first-generation quark. Slightly heavier than the up. When a down quark inside a neutron turns into an up quark, the neutron becomes a proton — that\'s beta decay.',
    facts:['A neutron = udd; a proton = uud','Beta decay: d → u + W⁻ → u + e⁻ + ν̄ₑ','Free neutrons decay in ~15 minutes because of this'],
    fun:'The mass difference between up and down quarks is why neutrons are heavier than protons — and why matter exists at all.'
  },
  charm:   {sym:'c', name:'Charm quark',    cls:'Quark (Gen II)',  mass:'1.27 GeV/c²',   charge:'+2/3 e', spin:'1/2', color:'quark',    antiparticle:'c̄',                forces:['Strong','EM','Weak','Gravity'], discovered:'1974 (BNL/SLAC)',
    desc:'The heavier cousin of the up quark. Its discovery in the "November Revolution" of 1974 confirmed the quark model.',
    facts:['~600× heavier than an up quark','Forms exotic particles like J/ψ (cc̄)','Decays via the weak force in ~10⁻¹² s'],
    fun:'The J/ψ meson was discovered simultaneously by two teams; they had to share the Nobel Prize.'
  },
  strange: {sym:'s', name:'Strange quark',  cls:'Quark (Gen II)',  mass:'95 MeV/c²',     charge:'−1/3 e', spin:'1/2', color:'quark',    antiparticle:'s̄',                forces:['Strong','EM','Weak','Gravity'], discovered:'1947 (in cosmic rays)',
    desc:'Discovered inside "strange" long-lived particles from cosmic rays that broke the rules of ordinary matter.',
    facts:['Found in kaons and lambda baryons','Neutron stars may contain "strange matter"','Its slow weak decay is why strange particles last so long'],
    fun:'Called "strange" because its particles seemed weirdly slow to decay.'
  },
  top:     {sym:'t', name:'Top quark',      cls:'Quark (Gen III)', mass:'173 GeV/c²',    charge:'+2/3 e', spin:'1/2', color:'quark',    antiparticle:'t̄',                forces:['Strong','EM','Weak','Gravity'], discovered:'1995 (Fermilab)',
    desc:'The heaviest known elementary particle — as massive as a gold atom, packed into a point. It decays in 5×10⁻²⁵ seconds, too fast to form any bound state.',
    facts:['The only quark that never forms a hadron','Decays almost 100% to bottom + W boson','Its huge mass suggests a special relationship with the Higgs'],
    fun:'A single top quark weighs about the same as an entire tungsten atom.'
  },
  bottom:  {sym:'b', name:'Bottom quark',   cls:'Quark (Gen III)', mass:'4.18 GeV/c²',   charge:'−1/3 e', spin:'1/2', color:'quark',    antiparticle:'b̄',                forces:['Strong','EM','Weak','Gravity'], discovered:'1977 (Fermilab)',
    desc:'Also called the "beauty" quark. Studied intensively at the LHCb experiment to look for tiny asymmetries between matter and antimatter.',
    facts:['Forms B mesons (bq̄)','Lives long enough to travel a millimeter in detectors','Key to studying CP violation'],
    fun:'B-meson decays might explain why the universe has matter and not antimatter.'
  },

  electron:{sym:'e⁻',name:'Electron',       cls:'Lepton (Gen I)',  mass:'0.511 MeV/c²',  charge:'−1 e',   spin:'1/2', color:'lepton',   antiparticle:'e⁺ (positron)',    forces:['EM','Weak','Gravity'],          discovered:'1897 (J.J. Thomson)',
    desc:'The lightest charged particle — and the one that does all the chemistry. Every electric current, every chemical bond, every photon of visible light involves electrons.',
    facts:['Orbits nuclei in atomic shells','Its charge defines "1 elementary charge"','Stable: never observed to decay','Responsible for essentially all of chemistry'],
    fun:'The screen you\'re reading this on is glowing because electrons are jumping between energy levels.'
  },
  muon:    {sym:'μ⁻',name:'Muon',           cls:'Lepton (Gen II)', mass:'105.7 MeV/c²',  charge:'−1 e',   spin:'1/2', color:'lepton',   antiparticle:'μ⁺',                forces:['EM','Weak','Gravity'],          discovered:'1936 (cosmic rays)',
    desc:'A heavy cousin of the electron — 207× more massive. It rains down on you constantly from cosmic rays.',
    facts:['~10,000 muons hit each square meter of Earth per minute','Lives 2.2 μs before decaying to e⁻ + ν̄ₑ + ν_μ','Used to X-ray pyramids and volcanoes (muon tomography)'],
    fun:'When it was discovered, physicist I.I. Rabi asked: "Who ordered that?"'
  },
  tau:     {sym:'τ⁻',name:'Tau',            cls:'Lepton (Gen III)',mass:'1.777 GeV/c²',  charge:'−1 e',   spin:'1/2', color:'lepton',   antiparticle:'τ⁺',                forces:['EM','Weak','Gravity'],          discovered:'1975 (SLAC)',
    desc:'The heaviest lepton. Massive enough to decay into hadrons (quarks) — a lepton acting like a quark factory.',
    facts:['Lives only 2.9×10⁻¹³ s','Can decay into pions, kaons, and other quark-based particles','Almost twice the mass of a proton'],
    fun:'Its short lifetime means it travels less than a millimeter before decaying, even at near light speed.'
  },
  nu_e:    {sym:'νₑ',name:'Electron neutrino',cls:'Lepton (Gen I)',mass:'<2 eV/c²',      charge:'0',      spin:'1/2', color:'neutrino', antiparticle:'ν̄ₑ',              forces:['Weak','Gravity'],               discovered:'1956 (Cowan-Reines)',
    desc:'A ghostly, nearly massless particle that barely interacts with anything. 65 billion neutrinos from the Sun pass through every square centimeter of you every second.',
    facts:['Only interacts via the weak force','Can travel through a light-year of lead with a 50% chance of not interacting','Comes in three flavors — and oscillates between them!'],
    fun:'The 1987 supernova was detected via 24 neutrinos hours before the light arrived.'
  },
  nu_mu:   {sym:'ν_μ',name:'Muon neutrino',  cls:'Lepton (Gen II)',mass:'<0.19 MeV/c²',  charge:'0',      spin:'1/2', color:'neutrino', antiparticle:'ν̄_μ',             forces:['Weak','Gravity'],               discovered:'1962 (Brookhaven)',
    desc:'Paired with the muon in weak interactions. Its discovery proved neutrinos come in flavors.',
    facts:['Produced in π⁺ → μ⁺ + ν_μ decays','Oscillates into other flavors mid-flight','Studied by giant detectors like Super-Kamiokande'],
    fun:'Neutrino oscillation proved neutrinos have (tiny) mass — a first crack in the Standard Model.'
  },
  nu_tau:  {sym:'ν_τ',name:'Tau neutrino',   cls:'Lepton (Gen III)',mass:'<18.2 MeV/c²', charge:'0',      spin:'1/2', color:'neutrino', antiparticle:'ν̄_τ',             forces:['Weak','Gravity'],               discovered:'2000 (Fermilab DONUT)',
    desc:'The last fermion to be directly detected. Extremely hard to spot because tau leptons themselves are hard to make.',
    facts:['Only ~15 confirmed direct detections when discovered','Completes the three-generation pattern','Interacts even more rarely than other neutrinos'],
    fun:'DONUT (Direct Observation of the NU Tau) needed years to see a handful of them.'
  },

  photon:  {sym:'γ', name:'Photon',          cls:'Gauge Boson',    mass:'0 (massless)',  charge:'0',      spin:'1',   color:'boson',    antiparticle:'γ (its own)',      forces:['Mediates EM'],                  discovered:'1905 (Einstein)',
    desc:'A quantum of light — and the messenger of the electromagnetic force. Every time two charged particles push or pull each other, they\'re trading photons.',
    facts:['Always travels at exactly c (speed of light)','Carries energy E = hf','Its own antiparticle','From radio waves to gamma rays — all the same particle at different energies'],
    fun:'The photons hitting your eye right now left the sun about 8 minutes ago.'
  },
  gluon:   {sym:'g', name:'Gluon',           cls:'Gauge Boson',    mass:'0 (massless)',  charge:'0',      spin:'1',   color:'boson',    antiparticle:'(self, in a sense)',forces:['Mediates Strong'],              discovered:'1979 (DESY PETRA)',
    desc:'The glue of the nucleus. Gluons carry color charge — so unlike photons, they interact with each other, making the strong force behave in bizarre ways.',
    facts:['8 different gluons (color-anticolor combinations)','Confined: never seen in isolation','Cause "asymptotic freedom" — quarks act free at short distances','Bind quarks into protons and protons+neutrons into nuclei'],
    fun:'99% of a proton\'s mass comes from the energy of gluons whizzing around inside it.'
  },
  wboson:  {sym:'W±',name:'W boson',         cls:'Gauge Boson',    mass:'80.4 GeV/c²',   charge:'±1 e',   spin:'1',   color:'boson',    antiparticle:'W∓',               forces:['Mediates Weak'],                discovered:'1983 (CERN UA1)',
    desc:'A very heavy charged boson that can change one type of quark or lepton into another. It\'s what makes radioactivity happen.',
    facts:['~85× more massive than a proton','Changes flavor: d → u, or μ → ν_μ','Its huge mass is why the weak force is so short-ranged','Powers the Sun by turning protons into neutrons'],
    fun:'Without the W boson, the Sun couldn\'t fuse hydrogen and life would be impossible.'
  },
  zboson:  {sym:'Z⁰',name:'Z boson',         cls:'Gauge Boson',    mass:'91.2 GeV/c²',   charge:'0',      spin:'1',   color:'boson',    antiparticle:'Z⁰ (its own)',     forces:['Mediates Weak'],                discovered:'1983 (CERN UA1)',
    desc:'The neutral partner of the W boson. It mediates weak interactions that don\'t change particle identity — like a neutrino bouncing off an electron.',
    facts:['Slightly heavier than the W','Neutral: doesn\'t change flavor','Discovered together with the W at CERN','Its precise mass tests the Standard Model to extraordinary precision'],
    fun:'Millions of Z bosons were manufactured at LEP to measure exactly three neutrino generations.'
  },
  higgs:   {sym:'H', name:'Higgs boson',     cls:'Scalar Boson',   mass:'125 GeV/c²',    charge:'0',      spin:'0',   color:'higgs',    antiparticle:'H (its own)',      forces:['Couples to mass'],              discovered:'2012 (CERN ATLAS/CMS)',
    desc:'The particle behind mass itself. The Higgs field permeates all of space; particles that interact with it strongly (like the top quark) become heavy, while photons don\'t feel it at all and stay massless.',
    facts:['Predicted in 1964, found in 2012','The only known fundamental scalar (spin-0) particle','Decays in ~10⁻²² s to pairs like γγ, bb̄, ZZ, WW','Confirms the origin of mass for W, Z, and fermions'],
    fun:'Discovering it took the world\'s largest machine (LHC) and 40+ years — Peter Higgs won the Nobel the next year.'
  },

  /* ===== Antiparticles ===== */
  anti_up:      {sym:'ū',  name:'Anti-up quark',      cls:'Antiquark (Gen I)',   mass:'2.2 MeV/c²',   charge:'−2/3 e', spin:'1/2', color:'quark',    antiparticle:'u (up)',           forces:['Strong','EM','Weak','Gravity'], discovered:'implied w/ up (1968)',
    desc:'The antimatter partner of the up quark. Same mass, opposite charge, opposite color (anti-red, anti-green, anti-blue).', facts:['Combines with quarks to form mesons (e.g., π⁻ = ūd)','Annihilates on contact with up quark → energy','Present in cosmic rays and colliders'], fun:'Antiprotons (ūūd̄) are routinely made and trapped at CERN.'},
  anti_down:    {sym:'d̄',  name:'Anti-down quark',    cls:'Antiquark (Gen I)',   mass:'4.7 MeV/c²',   charge:'+1/3 e', spin:'1/2', color:'quark',    antiparticle:'d (down)',         forces:['Strong','EM','Weak','Gravity'], discovered:'implied w/ down (1968)',
    desc:'Antimatter partner of the down quark. Two anti-downs and an anti-up make an antineutron; two anti-ups and an anti-down make an antiproton.', facts:['π⁺ = u d̄','Antiproton = ū ū d̄','Annihilates with a down quark'], fun:'Antimatter hydrogen (antiproton + positron) has been made and confirmed to fall down under gravity — 2023.'},
  anti_charm:   {sym:'c̄',  name:'Anti-charm quark',   cls:'Antiquark (Gen II)',  mass:'1.27 GeV/c²',  charge:'−2/3 e', spin:'1/2', color:'quark',    antiparticle:'c (charm)',        forces:['Strong','EM','Weak','Gravity'], discovered:'1974',
    desc:'The antiparticle of the charm quark.', facts:['J/ψ meson = c c̄','Studied at BaBar & Belle experiments'], fun:'Charmonium (cc̄) behaves like a "hydrogen atom" for quarks — its energy levels are precisely calculable.'},
  anti_strange: {sym:'s̄',  name:'Anti-strange quark', cls:'Antiquark (Gen II)',  mass:'95 MeV/c²',    charge:'+1/3 e', spin:'1/2', color:'quark',    antiparticle:'s (strange)',      forces:['Strong','EM','Weak','Gravity'], discovered:'1947',
    desc:'The antiparticle of the strange quark. Appears in kaons and other strange mesons.', facts:['K⁺ = u s̄','Involved in classic CP-violation experiments'], fun:'Anti-strange quarks helped prove that matter and antimatter don\'t behave identically.'},
  anti_top:     {sym:'t̄',  name:'Anti-top quark',     cls:'Antiquark (Gen III)', mass:'173 GeV/c²',   charge:'−2/3 e', spin:'1/2', color:'quark',    antiparticle:'t (top)',          forces:['Strong','EM','Weak','Gravity'], discovered:'1995 (Fermilab)',
    desc:'Antimatter partner of the top quark. Made in top/anti-top pairs at colliders.', facts:['Always produced with a top: t t̄ pair','Decays before forming bound states'], fun:'A t t̄ pair costs about 350 GeV to create — a lot even by LHC standards.'},
  anti_bottom:  {sym:'b̄',  name:'Anti-bottom quark',  cls:'Antiquark (Gen III)', mass:'4.18 GeV/c²',  charge:'+1/3 e', spin:'1/2', color:'quark',    antiparticle:'b (bottom)',       forces:['Strong','EM','Weak','Gravity'], discovered:'1977',
    desc:'Antimatter partner of the bottom quark. Extensively studied for matter-antimatter asymmetry.', facts:['B⁰ = d b̄; B̄⁰ = d̄ b','B mesons oscillate into their own antiparticle'], fun:'LHCb was built specifically to study b̄ physics.'},

  positron:  {sym:'e⁺', name:'Positron',           cls:'Anti-lepton (Gen I)',  mass:'0.511 MeV/c²',  charge:'+1 e',   spin:'1/2', color:'lepton',   antiparticle:'e⁻ (electron)',    forces:['EM','Weak','Gravity'],          discovered:'1932 (Anderson)',
    desc:'The antimatter partner of the electron — the first antiparticle ever discovered. Positrons are used every day in PET scanners at hospitals.', facts:['Annihilates with an electron → two 511 keV photons','PET (Positron Emission Tomography) uses this in medicine','Produced in β⁺ decay: p → n + e⁺ + νₑ'], fun:'When Dirac predicted positrons in 1928, he called it "a hole in the sea of negative energy" — nobody believed him. Anderson found one four years later.'},
  anti_muon: {sym:'μ⁺', name:'Anti-muon',          cls:'Anti-lepton (Gen II)', mass:'105.7 MeV/c²',  charge:'+1 e',   spin:'1/2', color:'lepton',   antiparticle:'μ⁻ (muon)',        forces:['EM','Weak','Gravity'],          discovered:'1936',
    desc:'The heavier antimatter partner of the electron.', facts:['Rains down from cosmic rays','Decays μ⁺ → e⁺ + νₑ + ν̄_μ','Central to precision g−2 measurements'], fun:'Muons (both charges) at Fermilab hinted at physics beyond the Standard Model in 2021.'},
  anti_tau:  {sym:'τ⁺', name:'Anti-tau',           cls:'Anti-lepton (Gen III)', mass:'1.777 GeV/c²', charge:'+1 e',   spin:'1/2', color:'lepton',   antiparticle:'τ⁻ (tau)',         forces:['EM','Weak','Gravity'],          discovered:'1975',
    desc:'The heaviest anti-lepton.', facts:['Decays to hadrons or lighter leptons','Studied at B factories'], fun:'Tau anti-neutrinos have almost never been directly detected.'},
  anti_nu_e:   {sym:'ν̄ₑ',  name:'Electron antineutrino', cls:'Anti-lepton (Gen I)',   mass:'<2 eV/c²',     charge:'0', spin:'1/2', color:'neutrino', antiparticle:'νₑ',               forces:['Weak','Gravity'], discovered:'1956 (Cowan-Reines)',
    desc:'The antiparticle of the electron neutrino. Produced in normal β⁻ decay of neutrons.', facts:['n → p + e⁻ + ν̄ₑ','Detected via inverse β decay: ν̄ₑ + p → n + e⁺','Nuclear reactors are the brightest man-made source'], fun:'The first neutrino ever detected (1956) was actually an antineutrino from a reactor.'},
  anti_nu_mu:  {sym:'ν̄_μ', name:'Muon antineutrino',     cls:'Anti-lepton (Gen II)',  mass:'<0.19 MeV/c²', charge:'0', spin:'1/2', color:'neutrino', antiparticle:'ν_μ',              forces:['Weak','Gravity'], discovered:'1962',
    desc:'The muon\'s antineutrino partner.', facts:['Produced in μ⁻ decay','Oscillates with ν̄_e and ν̄_τ'], fun:'Neutrino oscillation experiments treat ν and ν̄ separately to search for CP violation.'},
  anti_nu_tau: {sym:'ν̄_τ', name:'Tau antineutrino',      cls:'Anti-lepton (Gen III)', mass:'<18.2 MeV/c²', charge:'0', spin:'1/2', color:'neutrino', antiparticle:'ν_τ',              forces:['Weak','Gravity'], discovered:'2000',
    desc:'The rarest, hardest-to-detect antiparticle in the Standard Model.', facts:['Only a handful directly detected in history','Completes the anti-lepton set'], fun:'Whether neutrinos and antineutrinos are actually the same particle (Majorana) is an open question.'}
};

/* Composite / example particles */
const COMPOSITES = {
  'uud': {name:'Proton', mass:'938.3 MeV/c²', charge:'+1 e', notes:'The heart of every atomic nucleus. Stable.'},
  'udd': {name:'Neutron', mass:'939.6 MeV/c²', charge:'0', notes:'Stable inside nuclei; decays in ~15 min when free.'},
  'uu':  {name:'(unstable diquark)', mass:'—', charge:'+4/3 e', notes:'Quarks always come in threes or quark+antiquark pairs.'},
  'ud':  {name:'(unstable diquark)', mass:'—', charge:'+1/3 e', notes:'Not a real particle — you need 3 quarks or q+q̄.'},
};

/* ================ RENDER STANDARD MODEL TILES ================ */
const TILE_GROUPS = {
  'quarks-top':          ['up','charm','top'],
  'quarks-bot':          ['down','strange','bottom'],
  'leptons-charged':     ['electron','muon','tau'],
  'leptons-neutrinos':   ['nu_e','nu_mu','nu_tau'],
  'bosons-gauge':        ['photon','gluon','wboson','zboson'],
  'bosons-higgs':        ['higgs'],
  'antiquarks-top':      ['anti_up','anti_charm','anti_top'],
  'antiquarks-bot':      ['anti_down','anti_strange','anti_bottom'],
  'antileptons-charged': ['positron','anti_muon','anti_tau'],
  'antileptons-neutrinos':['anti_nu_e','anti_nu_mu','anti_nu_tau'],
  'selfanti':            ['photon','zboson','higgs','gluon']
};

function tileClassFor(id){
  const p = PARTICLES[id];
  if(!p) return '';
  const isAnti = id.startsWith('anti_') || id==='positron';
  if(p.cls.includes('Quark') || p.cls.includes('Antiquark') || p.cls.includes('夸克') || p.cls.includes('反夸克')){
    return isAnti ? 'antiquark' : 'quark';
  }
  if(p.color==='neutrino') return isAnti ? 'antilepton antineutrino' : 'lepton neutrino';
  if(p.color==='lepton')   return isAnti ? 'antilepton' : 'lepton';
  if(p.color==='higgs')    return 'higgs-tile';
  return 'boson';
}
function shortYear(d){ if(!d) return ''; const m = String(d).match(/\d{4}/); return m ? m[0] : ''; }
function chargeShort(p){
  // Extract short charge display for the meta line
  const c = p.charge;
  if(c==='+2/3 e') return '+⅔';
  if(c==='−2/3 e') return '−⅔';
  if(c==='+1/3 e') return '+⅓';
  if(c==='−1/3 e') return '−⅓';
  if(c==='+1 e') return '+1';
  if(c==='−1 e') return '−1';
  return c;
}
function massShort(m){
  if(!m) return '';
  return m.replace(/\/c²$/, '').replace(/ MeV/,' MeV').replace(/ GeV/,' GeV').replace(/ eV/,' eV')
          .replace('(massless)', '('+t('sm.meta.massless')+')');
}
function symbolFor(id){
  // Symbol for the big tile display
  const p = PARTICLES[id];
  if(!p) return '';
  // For chart tiles, keep single-letter form for quarks (u,d,c,s,t,b)
  const simple = {up:'u',down:'d',charm:'c',strange:'s',top:'t',bottom:'b',
                  anti_up:'ū',anti_down:'d̄',anti_charm:'c̄',anti_strange:'s̄',anti_top:'t̄',anti_bottom:'b̄',
                  electron:'e',muon:'μ',tau:'τ',
                  nu_e:'ν<sub>e</sub>',nu_mu:'ν<sub>μ</sub>',nu_tau:'ν<sub>τ</sub>',
                  positron:'e⁺',anti_muon:'μ⁺',anti_tau:'τ⁺',
                  anti_nu_e:'ν̄<sub>e</sub>',anti_nu_mu:'ν̄<sub>μ</sub>',anti_nu_tau:'ν̄<sub>τ</sub>',
                  photon:'γ',gluon:'g',wboson:'W±',zboson:'Z⁰',higgs:'H'};
  return simple[id] || p.sym;
}
function shortName(id, lang){
  const over = PARTICLES_I18N?.[lang]?.[id];
  if(over && over.name) return over.name;
  // English short names for tiles
  const short = {up:'up',down:'down',charm:'charm',strange:'strange',top:'top',bottom:'bottom',
                 anti_up:'anti-up',anti_down:'anti-down',anti_charm:'anti-charm',anti_strange:'anti-strange',anti_top:'anti-top',anti_bottom:'anti-bottom',
                 electron:'electron',muon:'muon',tau:'tau',
                 nu_e:'e-neutrino',nu_mu:'μ-neutrino',nu_tau:'τ-neutrino',
                 positron:'positron',anti_muon:'anti-muon',anti_tau:'anti-tau',
                 anti_nu_e:'e-antineutrino',anti_nu_mu:'μ-antineutrino',anti_nu_tau:'τ-antineutrino',
                 photon:'photon',gluon:'gluon',wboson:'W boson',zboson:'Z boson',higgs:'Higgs'};
  return short[id] || PARTICLES[id]?.name || id;
}

function rebuildStandardModelTiles(){
  const lang = window.CURRENT_LANG || 'en';
  Object.entries(TILE_GROUPS).forEach(([group, ids])=>{
    const container = document.querySelector(`[data-tiles="${group}"]`);
    if(!container) return;
    container.innerHTML = '';
    ids.forEach(id=>{
      const p = PARTICLES[id]; if(!p) return;
      const tile = document.createElement('div');
      tile.className = 'ptile ' + tileClassFor(id) + (group==='selfanti' ? ' self-a' : '');
      tile.dataset.id = id;
      const sym = symbolFor(id);
      const name = shortName(id, lang);
      let meta;
      if(group==='selfanti'){
        meta = id==='photon' ? 'γ = γ̄' : id==='zboson' ? 'Z = Z̄' : id==='higgs' ? 'H = H̄' : '*color-anticolor';
      } else {
        meta = `${massShort(p.mass)} · ${chargeShort(p)}`;
      }
      tile.innerHTML = `<div class="p-sym">${sym}</div><div class="p-name">${name}</div><div class="p-meta">${meta}</div>`;
      // year badge
      const y = shortYear(p.discovered);
      if(y){ const yb=document.createElement('div'); yb.className='p-year'; yb.textContent=y; tile.appendChild(yb); }
      // color dots for quarks/antiquarks
      const cls = tileClassFor(id);
      if(cls==='quark'){
        const cd=document.createElement('div'); cd.className='color-dots';
        cd.innerHTML='<i class="r"></i><i class="g"></i><i class="b"></i>';
        tile.appendChild(cd);
      } else if(cls==='antiquark'){
        const cd=document.createElement('div'); cd.className='color-dots';
        cd.innerHTML='<i class="ar"></i><i class="ag"></i><i class="ab"></i>';
        tile.appendChild(cd);
      }
      if(id==='gluon' && group!=='selfanti'){
        const ab=document.createElement('div'); ab.className='anti-badge'; ab.textContent='×8'; tile.appendChild(ab);
      }
      tile.addEventListener('click',()=>{
        document.querySelector('.tab[data-tab="detail"]').click();
        showParticle(id);
      });
      container.appendChild(tile);
    });
  });
}


/* ================ TABS ================ */
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    if(t.dataset.tab==='playground') resizeCanvas();
    if(t.dataset.tab==='builder') { resizeBuild(); buildComposites(); }
  });
});

/* ================ CHART CLICK -> DETAIL ================ */
document.querySelectorAll('.ptile').forEach(tile=>{
  tile.addEventListener('click',()=>{
    document.querySelector('.tab[data-tab="detail"]').click();
    showParticle(tile.dataset.id);
  });
});

/* ================ DETAIL PANE ================ */
const pList = document.getElementById('pList');
const pDetail = document.getElementById('pDetail');
const pfilter = document.getElementById('pfilter');

function renderList(filter=''){
  const lang = window.CURRENT_LANG || 'en';
  pList.innerHTML='';
  Object.entries(PARTICLES).forEach(([id,p])=>{
    const localName = shortName(id, lang);
    if(filter && !(localName+p.sym+p.cls).toLowerCase().includes(filter.toLowerCase())) return;
    const el = document.createElement('div');
    el.className='pl-item';
    el.dataset.id=id;
    el.innerHTML=`<span>${localName}</span><span class="pl-sym">${p.sym}</span>`;
    el.onclick=()=>showParticle(id);
    pList.appendChild(el);
  });
}
renderList();
pfilter.addEventListener('input',e=>renderList(e.target.value));

function showParticle(id){
  const p = getP(id); if(!p) return;
  const lang = window.CURRENT_LANG || 'en';
  const dict = LOCALES[lang];
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  document.querySelectorAll('.pl-item').forEach(x=>x.classList.toggle('active', x.dataset.id===id));
  const colorMap = {quark:'#ff6b9d',lepton:'#4ea8ff',neutrino:'#7ee8c5',boson:'#ffb547',higgs:'#c77dff'};
  const c = colorMap[p.color];
  const isQuark = /Quark|夸克/.test(p.cls) && !/Anti|反/.test(p.cls);
  const isAntiquark = /Antiquark|反夸克/.test(p.cls);
  const isGluon = id==='gluon';

  let colorInfo = '';
  if(isQuark || isAntiquark){
    const label = isAntiquark ? t('detail.color.quark.3anti') : t('detail.color.quark.3col');
    colorInfo = `
      <div class="d-section">
        <h4>${t('detail.section.color')}</h4>
        <p style="color:#c8cff0;line-height:1.7;font-size:14px">${t('detail.color.quark.a')} <b>${label}</b>${t('detail.color.quark.b')}</p>
      </div>`;
  } else if(isGluon){
    colorInfo = `
      <div class="d-section">
        <h4>${t('detail.section.color.gluon')}</h4>
        <p style="color:#c8cff0;line-height:1.7;font-size:14px">${t('detail.color.gluon')}</p>
      </div>`;
  }

  let relatedInfo = '';
  if(p.antiparticle && !p.antiparticle.includes('own') && !p.antiparticle.includes('self') && !p.antiparticle.includes('自身')){
    relatedInfo = `<div class="d-section"><h4>${t('detail.section.anti')}</h4><p style="color:#c8cff0;line-height:1.7;font-size:14px">${p.antiparticle}</p></div>`;
  } else if(p.antiparticle){
    relatedInfo = `<div class="d-section"><h4>${t('detail.section.anti')}</h4><p style="color:#c8cff0;line-height:1.7;font-size:14px"><b>${t('detail.section.anti.self')}</b></p></div>`;
  }

  pDetail.innerHTML = `
    <div class="d-head">
      <div class="d-sym" style="background:${c}22;border:2px solid ${c}66;color:${c}">${p.sym}</div>
      <div class="d-title"><h3>${p.name}</h3><div class="cls">${p.cls}</div></div>
    </div>
    <div class="d-desc">${p.desc}</div>
    <div class="d-props">
      <div class="d-prop"><div class="k">${t('detail.prop.mass')}</div><div class="v">${p.mass}</div></div>
      <div class="d-prop"><div class="k">${t('detail.prop.charge')}</div><div class="v">${p.charge}</div></div>
      <div class="d-prop"><div class="k">${t('detail.prop.spin')}</div><div class="v">${p.spin}</div></div>
      <div class="d-prop"><div class="k">${t('detail.prop.antiparticle')}</div><div class="v" style="font-size:13px">${p.antiparticle}</div></div>
      <div class="d-prop"><div class="k">${t('detail.prop.discovered')}</div><div class="v" style="font-size:13px">${p.discovered}</div></div>
      <div class="d-prop"><div class="k">${t('detail.prop.forces')}</div><div class="v" style="font-size:12px">${tForces(p.forces).join(' · ')}</div></div>
    </div>
    ${colorInfo}
    ${relatedInfo}
    <div class="d-section">
      <h4>${t('detail.section.facts')}</h4>
      <ul>${p.facts.map(f=>`<li>${f}</li>`).join('')}</ul>
    </div>
    <div class="d-fun">✦ ${p.fun}</div>
  `;
}

/* ================ BUILDER (canvas visualization) ================ */
const zone = document.getElementById('assemblyZone');
const buildCanvas = document.getElementById('buildCanvas');
const bctx = buildCanvas.getContext('2d');
const buildResult = document.getElementById('buildResult');
const buildStats = document.getElementById('buildStats');
let BW=0, BH=0;

function resizeBuild(){
  const r = buildCanvas.getBoundingClientRect();
  buildCanvas.width = r.width * devicePixelRatio;
  buildCanvas.height = r.height * devicePixelRatio;
  bctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  BW = r.width; BH = r.height;
}
window.addEventListener('resize',resizeBuild);
setTimeout(resizeBuild, 60);

document.querySelectorAll('.tray-part').forEach(el=>{
  el.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain', el.dataset.part); });
  el.addEventListener('click',()=>addPart(el.dataset.part));
});
zone.addEventListener('dragover',e=>{e.preventDefault(); zone.classList.add('drag')});
zone.addEventListener('dragleave',()=>zone.classList.remove('drag'));
zone.addEventListener('drop',e=>{
  e.preventDefault(); zone.classList.remove('drag');
  const part = e.dataTransfer.getData('text/plain');
  if(part) addPart(part);
});
document.getElementById('clearBuild').onclick = ()=>{ parts=[]; buildComposites(); };

// Click canvas to remove nearest particle
buildCanvas.addEventListener('click',e=>{
  const r = buildCanvas.getBoundingClientRect();
  const x = e.clientX-r.left, y = e.clientY-r.top;
  let best=-1, bestD=400;
  buildViz.particles.forEach((p,i)=>{
    const d = (p.x-x)**2 + (p.y-y)**2;
    if(d<bestD){bestD=d; best=i;}
  });
  if(best>=0){
    const partIdx = buildViz.particles[best].partIdx;
    if(partIdx!=null){ parts.splice(partIdx,1); buildComposites(); }
  }
});

let parts = [];
function addPart(p){
  if(parts.length >= 24) return;
  parts.push(p);
  buildComposites();
}

/* ---- Build composite structures from raw parts ----
   1. Pair each quark with an antiquark of any flavour → meson.
   2. Group remaining light (u,d) quarks into baryons (proton/neutron/Δ).
   3. Heavy quarks (s,c,b) without partner → free.
   4. Electrons orbit only if there's a nucleus of protons.
*/
let buildViz = { particles:[], nucleons:[], mesons:[], atomR:0, cx:0, cy:0 };

// Meson lookup: (quark, antiquark) → { name (en), zh, latex, mass, lifetime, tag }
// Symmetric on qq̄ vs q̄q; we normalise so the flavour is stored as (q,q̄).
const MESON_TABLE = {
  'u|ubar': { sym:'π⁰', en:'Pion (π⁰)', zh:'π⁰ 介子', note:'lightest meson; τ ~ 8·10⁻¹⁷ s → γγ' },
  'd|dbar': { sym:'π⁰', en:'Pion (π⁰)', zh:'π⁰ 介子', note:'lightest meson; τ ~ 8·10⁻¹⁷ s → γγ' },
  'u|dbar': { sym:'π⁺', en:'Pion (π⁺)', zh:'π⁺ 介子', note:'τ ~ 26 ns → μ⁺ νμ' },
  'd|ubar': { sym:'π⁻', en:'Pion (π⁻)', zh:'π⁻ 介子', note:'τ ~ 26 ns → μ⁻ ν̄μ' },
  'u|sbar': { sym:'K⁺', en:'Kaon (K⁺)', zh:'K⁺ 介子', note:'first "strange" particle; τ ~ 12 ns' },
  's|ubar': { sym:'K⁻', en:'Kaon (K⁻)', zh:'K⁻ 介子', note:'τ ~ 12 ns' },
  'd|sbar': { sym:'K⁰', en:'Kaon (K⁰)', zh:'K⁰ 介子', note:'oscillates with K̄⁰ — CP violation lab' },
  's|dbar': { sym:'K̄⁰', en:'Kaon (K̄⁰)', zh:'K̄⁰ 介子', note:'oscillates with K⁰' },
  's|sbar': { sym:'η/φ', en:'η or φ meson', zh:'η / φ 介子', note:'mostly ss̄; φ → K⁺K⁻' },
  'c|cbar': { sym:'J/ψ', en:'J/ψ meson', zh:'J/ψ 粒子', note:'Nov 1974 "November Revolution"; confirmed charm' },
  'c|dbar': { sym:'D⁺', en:'D meson (D⁺)', zh:'D⁺ 介子', note:'lightest charmed meson; τ ~ 1 ps' },
  'd|cbar': { sym:'D⁻', en:'D meson (D⁻)', zh:'D⁻ 介子', note:'τ ~ 1 ps' },
  'c|ubar': { sym:'D̄⁰', en:'D meson (D̄⁰)', zh:'D̄⁰ 介子', note:'D⁰-D̄⁰ oscillations confirmed 2007' },
  'u|cbar': { sym:'D⁰', en:'D meson (D⁰)', zh:'D⁰ 介子', note:'D⁰-D̄⁰ oscillations confirmed 2007' },
  'c|sbar': { sym:'Dₛ⁺', en:'Dₛ meson', zh:'Dₛ⁺ 介子', note:'"charmed-strange"; used in CKM measurements' },
  's|cbar': { sym:'Dₛ⁻', en:'Dₛ meson', zh:'Dₛ⁻ 介子', note:'antiparticle of Dₛ⁺' },
  'b|bbar': { sym:'Υ', en:'Upsilon (Υ)', zh:'Υ 粒子', note:'discovered 1977, confirmed bottom quark' },
  'b|ubar': { sym:'B⁻', en:'B meson (B⁻)', zh:'B⁻ 介子', note:'the meson factories\' bread and butter' },
  'u|bbar': { sym:'B⁺', en:'B meson (B⁺)', zh:'B⁺ 介子', note:'CP violation studied at BaBar/Belle/LHCb' },
  'b|dbar': { sym:'B⁰', en:'B meson (B⁰)', zh:'B⁰ 介子', note:'B⁰-B̄⁰ oscillations' },
  'd|bbar': { sym:'B̄⁰', en:'B meson (B̄⁰)', zh:'B̄⁰ 介子', note:'B⁰-B̄⁰ oscillations' },
  'b|sbar': { sym:'Bₛ⁰', en:'Bₛ meson', zh:'Bₛ⁰ 介子', note:'ultra-fast Bₛ-B̄ₛ oscillation (LHCb, 2006)' },
  's|bbar': { sym:'B̄ₛ⁰', en:'Bₛ meson', zh:'B̄ₛ⁰ 介子', note:'antiparticle of Bₛ⁰' },
  'b|cbar': { sym:'Bc⁻', en:'Bc meson', zh:'Bc⁻ 介子', note:'the only bc̄ meson; heaviest well-studied meson' },
  'c|bbar': { sym:'Bc⁺', en:'Bc meson', zh:'Bc⁺ 介子', note:'discovered 1998 at Tevatron' },
};
const QUARK_CHARGE = { u:+2/3, c:+2/3, t:+2/3, d:-1/3, s:-1/3, b:-1/3,
                        ubar:-2/3, cbar:-2/3, tbar:-2/3, dbar:+1/3, sbar:+1/3, bbar:+1/3 };
const QUARK_COLOR = { u:'#ff6b9d', d:'#ff8fb8', s:'#ffd166', c:'#ffb347', b:'#c39bff', t:'#c39bff',
                       ubar:'#7ee8c5', dbar:'#a8f0d8', sbar:'#4ea8ff', cbar:'#5db8ff', bbar:'#ff6bff', tbar:'#ff6bff' };
function isAntiQ(p){ return p && p.endsWith && p.endsWith('bar'); }
function isQuarkPart(p){ return p in QUARK_CHARGE; }
function isHeavyQ(p){ return ['s','c','b','sbar','cbar','bbar'].indexOf(p)>=0; }
function baseFlavor(p){ return p.replace('bar',''); }

function buildComposites(){
  const counts = {};
  parts.forEach(p=>counts[p]=(counts[p]||0)+1);
  const e = counts.e||0;

  // 1) Form mesons: pair each quark with any available antiquark, prefer same-flavour.
  const mesons = [];
  const qList = [], aqList = [];
  for(const p in counts){
    if(!isQuarkPart(p)) continue;
    for(let i=0;i<counts[p];i++) (isAntiQ(p)?aqList:qList).push(p);
  }
  // Prefer same-flavour pairings first
  for(let i=qList.length-1;i>=0;i--){
    const q = qList[i], want = q+'bar';
    const j = aqList.indexOf(want);
    if(j>=0){
      mesons.push({q, aq:aqList[j]});
      qList.splice(i,1); aqList.splice(j,1);
    }
  }
  // Then any remaining q with any aq (mixed-flavour meson)
  while(qList.length && aqList.length){
    mesons.push({q:qList.shift(), aq:aqList.shift()});
  }
  const freeAntiQuarks = aqList.slice();  // orphaned antiquarks

  // Attach meson metadata + friendly name.
  mesons.forEach(m=>{
    const key = `${baseFlavor(m.q)}|${m.aq}`;
    const info = MESON_TABLE[key] || MESON_TABLE[`${baseFlavor(m.aq).replace('bar','')}|${m.q}bar`];
    m.info = info || { sym:`${m.q}${m.aq}`, en:'exotic qq̄', zh:'奇特 qq̄', note:'not in the meson tables' };
    m.charge = (QUARK_CHARGE[m.q]||0) + (QUARK_CHARGE[m.aq]||0);
  });

  // 2) Remaining bare quarks go to baryon builder (u,d only).
  const uL0 = qList.filter(x=>x==='u').length;
  const dL0 = qList.filter(x=>x==='d').length;
  const heavyFree = qList.filter(x=>x!=='u' && x!=='d');
  let uL=uL0, dL=dL0;
  const nucleons = [];
  while(uL>=2 && dL>=1){ nucleons.push({kind:'proton', q:[ 'u','u','d' ]}); uL-=2; dL-=1; }
  while(uL>=1 && dL>=2){ nucleons.push({kind:'neutron', q:[ 'u','d','d' ]}); uL-=1; dL-=2; }
  while(uL>=3){ nucleons.push({kind:'delta++', q:['u','u','u']}); uL-=3; }
  while(dL>=3){ nucleons.push({kind:'delta-', q:['d','d','d']}); dL-=3; }
  const leftoverQuarks = [];
  for(let i=0;i<uL;i++) leftoverQuarks.push('u');
  for(let i=0;i<dL;i++) leftoverQuarks.push('d');
  heavyFree.forEach(p=>leftoverQuarks.push(p));
  freeAntiQuarks.forEach(p=>leftoverQuarks.push(p));

  // 3) Position nucleons in cluster (nucleus).
  const cx = BW/2, cy = BH/2;
  const N = nucleons.length;
  const nucR = N===0 ? 0 : (N===1 ? 0 : 32 + N*4);
  nucleons.forEach((n,i)=>{
    if(N===1){ n.x=cx; n.y=cy; }
    else {
      const a = (i/N)*Math.PI*2 - Math.PI/2;
      n.x = cx + Math.cos(a)*nucR;
      n.y = cy + Math.sin(a)*nucR;
    }
    n.r = 30;
    n.q.forEach((ch,qi)=>{
      const qa = (qi/3)*Math.PI*2 - Math.PI/2;
      n.quarkPos = n.quarkPos || [];
      n.quarkPos.push({ type: ch, x: n.x + Math.cos(qa)*13, y: n.y + Math.sin(qa)*13 });
    });
  });

  // 4) Position mesons: laid out horizontally near the top when no nucleus, else in an outer ring.
  const M = mesons.length;
  if(M){
    if(N===0){
      // spread horizontally
      const spacing = Math.min(140, (BW-100)/Math.max(M,1));
      mesons.forEach((m,i)=>{
        m.x = cx + (i-(M-1)/2)*spacing;
        m.y = cy;
        m.r = 28;
      });
    } else {
      // ring around the nucleus, outside atom orbit
      const mR = Math.max(nucR + 160, 200);
      mesons.forEach((m,i)=>{
        const a = (i/M)*Math.PI*2 + 0.3;
        m.x = cx + Math.cos(a)*mR; m.y = cy + Math.sin(a)*mR; m.r = 26;
      });
    }
    mesons.forEach(m=>{
      m.qPos  = { type:m.q,  x:m.x-14, y:m.y };
      m.aqPos = { type:m.aq, x:m.x+14, y:m.y };
    });
  }

  // 5) Electrons orbit outside nucleus (unchanged).
  const atomR = N>0 ? Math.max(nucR + 90, 120) : 0;
  const electrons = [];
  for(let i=0;i<e;i++){
    if(N>0){
      const a = (i/Math.max(e,1))*Math.PI*2;
      electrons.push({ x: cx + Math.cos(a)*atomR, y: cy + Math.sin(a)*atomR, orbitA:a, orbitR:atomR + (Math.floor(i/8))*30 });
    } else {
      electrons.push({ x: cx + (Math.random()-0.5)*200, y: cy + (Math.random()-0.5)*200, free:true });
    }
  }

  // 6) Free quarks (confinement violation).
  const freeQuarks = leftoverQuarks.map((tt,i)=>{
    const a = (i/Math.max(leftoverQuarks.length,1))*Math.PI*2;
    return { type:tt, x: cx + Math.cos(a)*80 + 220, y: cy + Math.sin(a)*80, free:true };
  });

  buildViz = { nucleons, mesons, electrons, freeQuarks, cx, cy, nucR, atomR, N, e,
    u: (counts.u||0), d: (counts.d||0),
    hasNucleus: N>0, hasAtom: N>0 && e>0 };

  zone.classList.toggle('has-items', parts.length>0);
  analyze();
}

/* ---- analyze produces text summary ---- */
const ATOM_I18N = {
  'zh-CN': {
    '1p0n0e':['H⁺ (质子 / 氢离子)','稳定'],
    '1p0n1e':['⚛ 氢原子 (¹H)','稳定 — 占普通物质的 74%'],
    '1p1n0e':['²H⁺ (氘核)','稳定'],
    '1p1n1e':['⚛ 氘原子 (²H)','稳定,俗称"重氢"'],
    '1p2n0e':['³H⁺ (氚核)','有放射性'],
    '1p2n1e':['⚛ 氚原子 (³H)','β⁻ 衰变,半衰期 12.3 年'],
    '2p1n2e':['⚛ 氦-3 原子 (³He)','稳定,天然含量极低'],
    '2p2n2e':['⚛ 氦-4 原子 (⁴He)','稳定,最常见的氦'],
    '2p2n0e':['α 粒子 (⁴He²⁺)','α 衰变的产物'],
    '3p3n3e':['⚛ 锂-6 原子 (⁶Li)','稳定'],
    '3p4n3e':['⚛ 锂-7 原子 (⁷Li)','稳定,地球上最常见的锂同位素']
  }
};
const ELEMENT_I18N = {
  'zh-CN': ['','氢','氦','锂','铍','硼','碳','氮','氧','氟','氖','钠','镁','铝','硅','磷','硫','氯','氩','钾','钙']
};
function analyze(){
  const {nucleons, mesons=[], electrons, freeQuarks, u, d, e} = buildViz;
  // Real charge sum (includes heavy quarks, antiquarks, mesons already in freeQuarks)
  let charge = -e;
  parts.forEach(p=>{ if(p in QUARK_CHARGE) charge += QUARK_CHARGE[p]; });
  const lang = window.CURRENT_LANG || 'en';
  const dict = LOCALES[lang];
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  const decayBar = document.getElementById('buildDecayBar');
  if(decayBar) decayBar.hidden = true;

  if(parts.length===0){
    buildResult.textContent = t('builder.result.empty');
    buildResult.className='result';
    buildStats.innerHTML='';
    return;
  }

  const protons  = nucleons.filter(n=>n.kind==='proton').length;
  const neutrons = nucleons.filter(n=>n.kind==='neutron').length;
  const deltas   = nucleons.filter(n=>n.kind.startsWith('delta')).length;

  let name = 'Assembly';
  let cls  = 'result';

  const totalNucleons = protons + neutrons;
  const nElectrons = e;
  const key = `${protons}p${neutrons}n${nElectrons}e`;

  const atomMap_en = {
    '1p0n0e':['H⁺ (proton / hydrogen ion)','stable'],
    '1p0n1e':['⚛ Hydrogen atom (¹H)','stable — 74% of ordinary matter'],
    '1p1n0e':['²H⁺ (deuteron ion)','stable'],
    '1p1n1e':['⚛ Deuterium (²H)','stable, "heavy hydrogen"'],
    '1p2n0e':['³H⁺ (tritium ion)','radioactive'],
    '1p2n1e':['⚛ Tritium (³H)','β⁻ decays, half-life 12.3 y'],
    '2p1n2e':['⚛ Helium-3 (³He)','stable, very rare'],
    '2p2n2e':['⚛ Helium-4 (⁴He)','stable, most common He'],
    '2p2n0e':['α particle (⁴He²⁺)','emitted in α decay'],
    '3p3n3e':['⚛ Lithium-6 (⁶Li)','stable'],
    '3p4n3e':['⚛ Lithium-7 (⁷Li)','stable, most Li on Earth'],
  };
  const atomMap = ATOM_I18N[lang] || atomMap_en;

  // Meson-only assembly: proudly show what was formed
  if(totalNucleons===0 && nElectrons===0 && freeQuarks.length===0 && mesons.length>0){
    const names = mesons.map(m=> lang==='zh-CN' ? m.info.zh : m.info.en);
    name = names.length===1 ? names[0] : `${names.length} × ${lang==='zh-CN'?'介子':'mesons'}: ${names.join(', ')}`;
    cls = 'result success';
  } else if(atomMap[key] && mesons.length===0){
    name = atomMap[key][0] + ' — ' + atomMap[key][1];
    cls = 'result success';
  } else if(protons===0 && neutrons===1 && nElectrons===0 && freeQuarks.length===0 && mesons.length===0){
    name = t('builder.msg.freeneutron'); cls='result success';
  } else if(totalNucleons===0 && nElectrons>0 && freeQuarks.length===0 && mesons.length===0){
    name = nElectrons===1 ? t('builder.msg.electron.one') : `${nElectrons} ${t('builder.msg.electron.many')}`; cls='result success';
  } else if(freeQuarks.length>0){
    name = t('builder.msg.freeq'); cls='result';
  } else if(deltas>0 && mesons.length===0){
    name = t('builder.msg.delta'); cls='result success';
  } else if(totalNucleons>0){
    const els = ELEMENT_I18N[lang] || ['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
    const symb = els[protons] || `Z=${protons}`;
    const eLabel = lang==='zh-CN' ? '电子' : 'e⁻';
    const mesonSuffix = mesons.length ? ` + ${mesons.length} ${lang==='zh-CN'?'介子':'meson(s)'}` : '';
    name = `${symb} — ${protons}p + ${neutrons}n${nElectrons?` + ${nElectrons}${eLabel}`:''}${mesonSuffix}`;
    cls = 'result success';
  }

  buildResult.textContent = name;
  buildResult.className = cls;

  // Stats line — includes mesons and heavy-quark totals.
  const heavyCounts = {};
  ['s','c','b','sbar','cbar','bbar','ubar','dbar'].forEach(k=>{ if(parts.includes(k)) heavyCounts[k]=parts.filter(x=>x===k).length; });
  const heavyStr = Object.keys(heavyCounts).map(k=>`${k}:${heavyCounts[k]}`).join(' · ');
  const chargeVal = Math.round(charge*100)/100;
  buildStats.innerHTML = `
    <div>${t('builder.stats.up')}: <b>${parts.filter(x=>x==='u').length}</b> · ${t('builder.stats.down')}: <b>${parts.filter(x=>x==='d').length}</b> · ${t('builder.stats.electrons')}: <b>${e}</b>${heavyStr?` · <span style="color:#ffd166">${heavyStr}</span>`:''}</div>
    <div>${t('builder.stats.protons')}: <b>${protons}</b> · ${t('builder.stats.neutrons')}: <b>${neutrons}</b>${deltas?` · ${t('builder.stats.delta')}: <b>${deltas}</b>`:''}${mesons.length?` · <span style="color:#7ee8c5">${t('builder.stats.mesons')||'mesons'}: ${mesons.length}</span>`:''}${freeQuarks.length?` · <span style="color:#ff6b9d">${t('builder.stats.freeq')}: ${freeQuarks.length}</span>`:''}</div>
    <div>${t('builder.stats.charge')}: <b>${chargeVal===0?'0':(chargeVal>0?'+':'')+chargeVal} e</b></div>
    <div>${t('builder.stats.parts')}: <b>${parts.length}</b></div>
  `;

  // Show decay bar for unstable atoms/nuclei — see DECAY_MODES.
  const decayModes = getDecayModes(protons, neutrons, nElectrons);
  if(decayBar && decayModes.length){
    decayBar.hidden = false;
    decayBar.innerHTML =
      `<div class="decay-title">${t('builder.decay.title')||'This isotope is unstable — try a decay'}</div>`+
      `<div class="decay-modes">`+
        decayModes.map(m=>`<button data-mode="${m.id}">${m.label[lang]||m.label.en}</button>`).join('')+
      `</div>`+
      `<div class="decay-note">${t('builder.decay.note')||'Watch the emitted particle fly out on the canvas.'}</div>`;
    decayBar.querySelectorAll('button').forEach(b=> b.onclick = ()=> triggerDecay(b.dataset.mode));
  }
}

/* ---- Animation loop for builder canvas ---- */
let bt = 0;
function drawBuild(){
  bt += 0.016;
  bctx.clearRect(0,0,BW,BH);

  // background subtle grid
  bctx.strokeStyle='rgba(255,255,255,0.02)';
  bctx.lineWidth=1;
  for(let x=0;x<BW;x+=40){bctx.beginPath();bctx.moveTo(x,0);bctx.lineTo(x,BH);bctx.stroke();}
  for(let y=0;y<BH;y+=40){bctx.beginPath();bctx.moveTo(0,y);bctx.lineTo(BW,y);bctx.stroke();}

  const {nucleons=[], electrons=[], freeQuarks=[], cx=BW/2, cy=BH/2, nucR=0, atomR=0, hasAtom, hasNucleus, N=0} = buildViz;

  // Outer atom shell (electron cloud)
  if(hasAtom){
    const grad = bctx.createRadialGradient(cx,cy,atomR*0.6, cx,cy, atomR+30);
    grad.addColorStop(0,'rgba(78,168,255,0)');
    grad.addColorStop(0.7,'rgba(78,168,255,0.08)');
    grad.addColorStop(1,'rgba(78,168,255,0)');
    bctx.fillStyle=grad;
    bctx.beginPath(); bctx.arc(cx,cy,atomR+30,0,Math.PI*2); bctx.fill();
    // subtle orbit ring
    bctx.strokeStyle='rgba(78,168,255,0.25)';
    bctx.setLineDash([4,6]);
    bctx.beginPath(); bctx.arc(cx,cy,atomR,0,Math.PI*2); bctx.stroke();
    bctx.setLineDash([]);
    // label
    bctx.fillStyle='rgba(78,168,255,0.5)';
    bctx.font='11px JetBrains Mono, monospace';
    bctx.textAlign='left';
    bctx.fillText((LOCALES[window.CURRENT_LANG||'en']||LOCALES.en)['builder.label.shell'], cx-atomR+10, cy-atomR-8);
  }

  // Nucleus shell (strong force binding all nucleons)
  if(N>=2){
    const R = nucR + 40;
    const grad = bctx.createRadialGradient(cx,cy,nucR, cx,cy,R);
    grad.addColorStop(0,'rgba(255,107,157,0.15)');
    grad.addColorStop(1,'rgba(255,107,157,0)');
    bctx.fillStyle=grad;
    bctx.beginPath(); bctx.arc(cx,cy,R,0,Math.PI*2); bctx.fill();
    bctx.strokeStyle='rgba(255,107,157,0.35)';
    bctx.setLineDash([2,4]);
    bctx.beginPath(); bctx.arc(cx,cy,R,0,Math.PI*2); bctx.stroke();
    bctx.setLineDash([]);
    bctx.fillStyle='rgba(255,107,157,0.6)';
    bctx.font='11px JetBrains Mono, monospace';
    bctx.textAlign='center';
    bctx.fillText((LOCALES[window.CURRENT_LANG||'en']||LOCALES.en)['builder.label.nucleus'], cx, cy-R-8);

    // draw pion-exchange lines between adjacent nucleons
    for(let i=0;i<nucleons.length;i++){
      for(let j=i+1;j<nucleons.length;j++){
        const a=nucleons[i], b=nucleons[j];
        drawWavyLine(a.x,a.y,b.x,b.y,'rgba(255,107,157,0.35)',3, bt*4);
      }
    }
  }

  // Nucleons (protons/neutrons) with strong-force gluons between their quarks
  nucleons.forEach(n=>{
    // shell around this nucleon
    const isProton = n.kind==='proton';
    const shellColor = isProton ? 'rgba(255,209,102,0.5)' : (n.kind==='neutron' ? 'rgba(160,160,160,0.5)' : 'rgba(255,107,157,0.5)');
    const shellFill  = isProton ? 'rgba(255,209,102,0.12)' : (n.kind==='neutron' ? 'rgba(160,160,160,0.12)' : 'rgba(255,107,157,0.15)');
    bctx.fillStyle=shellFill;
    bctx.strokeStyle=shellColor;
    bctx.lineWidth=1.5;
    bctx.beginPath(); bctx.arc(n.x,n.y,n.r,0,Math.PI*2); bctx.fill(); bctx.stroke();

    // label
    bctx.fillStyle=shellColor;
    bctx.font='bold 11px JetBrains Mono, monospace';
    bctx.textAlign='center';
    const lbl = n.kind==='proton'?'p⁺':(n.kind==='neutron'?'n⁰':(n.kind==='delta++'?'Δ⁺⁺':'Δ⁻'));
    bctx.fillText(lbl, n.x, n.y+n.r+14);

    // Draw gluon lines between all 3 quarks (strong force triangle)
    for(let i=0;i<n.quarkPos.length;i++){
      for(let j=i+1;j<n.quarkPos.length;j++){
        drawGluonLine(n.quarkPos[i], n.quarkPos[j], bt);
      }
    }
    // Draw the quarks
    n.quarkPos.forEach(qp=>drawQuark(qp.x,qp.y,qp.type));
  });

  // EM lines from each proton to each electron (attraction)
  if(hasAtom){
    electrons.forEach((el,idx)=>{
      // animate orbit
      el.orbitA += 0.008 + idx*0.001;
      el.x = cx + Math.cos(el.orbitA)*el.orbitR;
      el.y = cy + Math.sin(el.orbitA)*el.orbitR;
      nucleons.filter(n=>n.kind==='proton').forEach(p=>{
        drawPhotonLine(p.x,p.y,el.x,el.y,'attract', bt);
      });
    });
  }
  // EM repulsion between protons (like charges repel)
  const protons = nucleons.filter(n=>n.kind==='proton');
  for(let i=0;i<protons.length;i++){
    for(let j=i+1;j<protons.length;j++){
      drawPhotonLine(protons[i].x,protons[i].y,protons[j].x,protons[j].y,'repel', bt);
    }
  }

  // Draw electrons on top
  electrons.forEach(el=>drawElectron(el.x, el.y));

  // Free quarks with warning glow
  freeQuarks.forEach(fq=>{
    // pulsating red halo
    const puls = 15 + Math.sin(bt*4)*4;
    const g = bctx.createRadialGradient(fq.x,fq.y,0, fq.x,fq.y,puls*2);
    g.addColorStop(0,'rgba(255,80,80,0.5)');
    g.addColorStop(1,'rgba(255,80,80,0)');
    bctx.fillStyle=g;
    bctx.beginPath(); bctx.arc(fq.x,fq.y,puls*2,0,Math.PI*2); bctx.fill();
    drawQuark(fq.x, fq.y, fq.type);
    bctx.fillStyle='rgba(255,120,120,0.9)';
    bctx.font='10px Space Grotesk, sans-serif';
    bctx.textAlign='center';
    bctx.fillText((LOCALES[window.CURRENT_LANG||'en']||LOCALES.en)['builder.confine'], fq.x, fq.y+22);
  });

  // Mesons: two quarks joined by a bright gluon string
  const mesons = buildViz.mesons || [];
  mesons.forEach(m=>{
    // soft shell
    const g = bctx.createRadialGradient(m.x,m.y,4, m.x,m.y,m.r+8);
    g.addColorStop(0,'rgba(126,232,197,0.18)');
    g.addColorStop(1,'rgba(126,232,197,0)');
    bctx.fillStyle=g;
    bctx.beginPath(); bctx.ellipse(m.x,m.y,m.r+8,m.r-4,0,0,Math.PI*2); bctx.fill();
    bctx.strokeStyle='rgba(126,232,197,0.45)';
    bctx.setLineDash([3,3]);
    bctx.lineWidth=1.2;
    bctx.beginPath(); bctx.ellipse(m.x,m.y,m.r+8,m.r-4,0,0,Math.PI*2); bctx.stroke();
    bctx.setLineDash([]);
    // gluon string (helical) between q and q̄
    drawGluonLine(m.qPos, m.aqPos, bt*1.2);
    // the two quark bubbles
    drawQuark(m.qPos.x, m.qPos.y, m.qPos.type);
    drawQuark(m.aqPos.x, m.aqPos.y, m.aqPos.type);
    // meson symbol label
    bctx.fillStyle='#7ee8c5';
    bctx.font='bold 12px JetBrains Mono, monospace';
    bctx.textAlign='center';
    bctx.fillText(m.info.sym, m.x, m.y - m.r - 4);
  });

  // Decay-animation overlay (α, β⁻, β⁺, γ, EC ejecta)
  if(decayFX && decayFX.length){
    for(let i=decayFX.length-1;i>=0;i--){
      const f = decayFX[i];
      f.t += 0.016;
      const p = f.t / f.dur;
      if(p>=1){ decayFX.splice(i,1); continue; }
      const ex = f.x + f.vx * p * 400;
      const ey = f.y + f.vy * p * 400;
      // trail
      bctx.strokeStyle = f.color + (Math.floor((1-p)*220)).toString(16).padStart(2,'0');
      bctx.lineWidth = 2;
      bctx.beginPath(); bctx.moveTo(f.x, f.y); bctx.lineTo(ex, ey); bctx.stroke();
      // particle head
      bctx.fillStyle = f.color;
      bctx.beginPath(); bctx.arc(ex, ey, 6, 0, Math.PI*2); bctx.fill();
      bctx.fillStyle='#fff';
      bctx.font='bold 10px JetBrains Mono, monospace';
      bctx.textAlign='center'; bctx.textBaseline='middle';
      bctx.fillText(f.label, ex, ey);
      bctx.textBaseline='alphabetic';
    }
  }

  requestAnimationFrame(drawBuild);
}
let decayFX = [];

/* ---- Decay chain support (activated when Builder shows an unstable isotope) ---- */
// Return an array of {id, label:{en,zh}, apply(parts,e)} decay modes for the current isotope.
function getDecayModes(protons, neutrons, electrons){
  const modes = [];
  const A = protons + neutrons, Z = protons;
  // Neutron-rich → β⁻
  if(neutrons > protons && A>1){
    modes.push({ id:'bm', label:{en:'β⁻ (n→p + e⁻ + ν̄)', zh:'β⁻ 衰变 (n→p+e⁻+ν̄)'} });
  }
  // Proton-rich → β⁺
  if(protons > neutrons+1 && A>1){
    modes.push({ id:'bp', label:{en:'β⁺ (p→n + e⁺ + ν)', zh:'β⁺ 衰变 (p→n+e⁺+ν)'} });
  }
  // Heavy → α
  if(A >= 5){
    modes.push({ id:'alpha', label:{en:'α (emit ⁴He)', zh:'α 衰变 (发射 ⁴He)'} });
  }
  // Any excited nucleus → γ (always available if any nucleus exists)
  if(A >= 2){
    modes.push({ id:'gamma', label:{en:'γ (photon)', zh:'γ 衰变 (光子)'} });
  }
  // Electron capture (proton-rich w/ electron present)
  if(protons > neutrons && electrons > 0 && A>1){
    modes.push({ id:'ec', label:{en:'EC (electron capture)', zh:'电子俘获 (EC)'} });
  }
  // Filter: don't bother for known-stable nuclei (¹H atom, ²H atom, ⁴He atom, etc.)
  const stableKeys = ['1p0n1e','1p1n1e','2p2n2e','2p1n2e','3p3n3e','3p4n3e'];
  const key = `${protons}p${neutrons}n${electrons}e`;
  if(stableKeys.indexOf(key)>=0) return [];
  return modes;
}

function triggerDecay(id){
  const {cx, cy, nucR} = buildViz;
  const r = Math.max(nucR, 30);
  const jitter = ()=> (Math.random()-0.5)*0.3;
  if(id==='bm'){
    // Convert one neutron → proton, emit e⁻ + ν̄
    const idx = parts.indexOf('d');
    if(idx>=0){ parts[idx]='u'; parts.push('e'); }
    decayFX.push({ x:cx+r, y:cy, vx:1+jitter(), vy:-0.4+jitter(), t:0, dur:2.2, color:'#ffd166', label:'e⁻' });
    decayFX.push({ x:cx+r, y:cy, vx:0.8+jitter(), vy:0.5+jitter(), t:0, dur:2.2, color:'#8fa8ff', label:'ν̄' });
  } else if(id==='bp'){
    // Convert one proton → neutron, emit e⁺ + ν; if no electron to add, spawn positron leaving
    const idx = parts.indexOf('u');
    if(idx>=0){ parts[idx]='d'; }
    decayFX.push({ x:cx+r, y:cy, vx:-1+jitter(), vy:-0.4+jitter(), t:0, dur:2.2, color:'#ff6b9d', label:'e⁺' });
    decayFX.push({ x:cx+r, y:cy, vx:-0.8+jitter(), vy:0.5+jitter(), t:0, dur:2.2, color:'#8fa8ff', label:'ν' });
  } else if(id==='alpha'){
    // Remove 2 protons (2u+1d each) + 2 neutrons (1u+2d each) = 6u + 6d worth of quarks
    // Simpler: drop 4 nucleons (2 of each) from parts, i.e. remove 6u and 6d.
    for(let k=0;k<6;k++){ const i=parts.indexOf('u'); if(i>=0) parts.splice(i,1); }
    for(let k=0;k<6;k++){ const i=parts.indexOf('d'); if(i>=0) parts.splice(i,1); }
    decayFX.push({ x:cx, y:cy, vx:1+jitter(), vy:-0.6+jitter(), t:0, dur:2.5, color:'#ffd166', label:'α' });
  } else if(id==='gamma'){
    decayFX.push({ x:cx, y:cy, vx:1.2+jitter(), vy:-0.6+jitter(), t:0, dur:1.6, color:'#ffffff', label:'γ' });
  } else if(id==='ec'){
    // Remove one electron + convert one proton → neutron, emit neutrino
    const iE = parts.indexOf('e'); if(iE>=0) parts.splice(iE,1);
    const iU = parts.indexOf('u'); if(iU>=0) parts[iU]='d';
    decayFX.push({ x:cx, y:cy, vx:0.6+jitter(), vy:-1+jitter(), t:0, dur:2.2, color:'#8fa8ff', label:'ν' });
  }
  buildComposites();
}
function drawQuark(x,y,type){
  // Determine color by flavor; anti-quarks get their teal/blue palette.
  const isAnti = type && type.endsWith && type.endsWith('bar');
  const flavor = isAnti ? type.slice(0,-3) : type;
  const palette = {
    u:['#ff9ec2','#ff6b9d'], d:['#ffbdd7','#ff85b0'],
    s:['#ffe28a','#ffd166'], c:['#ffc99b','#ffb347'],
    b:['#d8b9ff','#c39bff'], t:['#d8b9ff','#c39bff']
  };
  const antiPalette = {
    u:['#a8f0d8','#7ee8c5'], d:['#c0f5e2','#a4ecd0'],
    s:['#a0c8ff','#4ea8ff'], c:['#bcd7ff','#5db8ff'],
    b:['#ffbdf5','#ff6bff'], t:['#ffbdf5','#ff6bff']
  };
  const pal = (isAnti ? antiPalette : palette)[flavor] || ['#ff9ec2','#ff6b9d'];
  const g = bctx.createRadialGradient(x-2,y-2,0,x,y,10);
  g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]);
  bctx.fillStyle=g;
  bctx.beginPath(); bctx.arc(x,y,9,0,Math.PI*2); bctx.fill();
  bctx.fillStyle='#fff';
  bctx.font='bold 10px JetBrains Mono, monospace';
  bctx.textAlign='center'; bctx.textBaseline='middle';
  bctx.fillText(flavor, x, y);
  bctx.textBaseline='alphabetic';
  if(isAnti){
    // small overbar
    bctx.strokeStyle='#fff'; bctx.lineWidth=1.4;
    bctx.beginPath(); bctx.moveTo(x-5,y-5); bctx.lineTo(x+5,y-5); bctx.stroke();
  }
}
function drawElectron(x,y){
  const g = bctx.createRadialGradient(x,y,0,x,y,14);
  g.addColorStop(0,'#7bc0ff'); g.addColorStop(1,'rgba(78,168,255,0)');
  bctx.fillStyle=g;
  bctx.beginPath(); bctx.arc(x,y,14,0,Math.PI*2); bctx.fill();
  bctx.fillStyle='#4ea8ff';
  bctx.beginPath(); bctx.arc(x,y,6,0,Math.PI*2); bctx.fill();
  bctx.fillStyle='#fff';
  bctx.font='bold 9px JetBrains Mono, monospace';
  bctx.textAlign='center'; bctx.textBaseline='middle';
  bctx.fillText('e⁻', x, y);
  bctx.textBaseline='alphabetic';
}
function drawGluonLine(a,b,t){
  // spiral/curly gluon between quarks
  const dx=b.x-a.x, dy=b.y-a.y;
  const len = Math.hypot(dx,dy);
  const nx = -dy/len, ny = dx/len;
  bctx.strokeStyle='rgba(255,107,157,0.85)';
  bctx.lineWidth=1.5;
  bctx.beginPath();
  const steps = 18;
  for(let i=0;i<=steps;i++){
    const p = i/steps;
    const w = Math.sin(p*Math.PI*4 + t*3) * 3;
    const x = a.x + dx*p + nx*w;
    const y = a.y + dy*p + ny*w;
    if(i===0) bctx.moveTo(x,y); else bctx.lineTo(x,y);
  }
  bctx.stroke();
}
function drawPhotonLine(x1,y1,x2,y2,kind,t){
  // wavy photon
  const dx=x2-x1, dy=y2-y1;
  const len=Math.hypot(dx,dy);
  if(len<4) return;
  const nx=-dy/len, ny=dx/len;
  const color = kind==='attract' ? 'rgba(255,209,102,0.55)' : 'rgba(78,168,255,0.55)';
  bctx.strokeStyle=color;
  bctx.lineWidth=1.2;
  bctx.beginPath();
  const steps = Math.max(20, Math.floor(len/6));
  for(let i=0;i<=steps;i++){
    const p = i/steps;
    const w = Math.sin(p*Math.PI*len/12 + t*6) * 2.2;
    const x = x1 + dx*p + nx*w;
    const y = y1 + dy*p + ny*w;
    if(i===0) bctx.moveTo(x,y); else bctx.lineTo(x,y);
  }
  bctx.stroke();
}
function drawWavyLine(x1,y1,x2,y2,color,amp,t){
  const dx=x2-x1, dy=y2-y1;
  const len=Math.hypot(dx,dy); if(len<4) return;
  const nx=-dy/len, ny=dx/len;
  bctx.strokeStyle=color; bctx.lineWidth=1.5;
  bctx.beginPath();
  const steps=Math.max(16, Math.floor(len/8));
  for(let i=0;i<=steps;i++){
    const p=i/steps;
    const w = Math.sin(p*Math.PI*3 + t) * amp;
    const x = x1+dx*p+nx*w, y = y1+dy*p+ny*w;
    if(i===0) bctx.moveTo(x,y); else bctx.lineTo(x,y);
  }
  bctx.stroke();
}
drawBuild();
buildComposites();

/* ================ PLAYGROUND (canvas simulation) ================ */
const canvas = document.getElementById('pgCanvas');
const ctx = canvas.getContext('2d');
let W=0, H=0;
function resizeCanvas(){
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  W = r.width; H = r.height;
}
window.addEventListener('resize',resizeCanvas);
setTimeout(resizeCanvas, 50);

const PG_TYPES = {
  electron:{c:'#4ea8ff', r:6,  q:-1, mass:1,    kind:'matter', name:'e⁻'},
  positron:{c:'#ff5c8a', r:6,  q:+1, mass:1,    kind:'anti',   name:'e⁺'},
  proton:  {c:'#ffd166', r:10, q:+1, mass:1836, kind:'matter', name:'p⁺'},
  neutron: {c:'#a0a0a0', r:10, q:0,  mass:1839, kind:'matter', name:'n⁰'},
  photon:  {c:'#ffffff', r:3,  q:0,  mass:0,    kind:'boson',  name:'γ'},
};

let pgParts = [];
let trails = true;
document.getElementById('pgTrails').onchange = e=>trails=e.target.checked;
document.getElementById('pgClear').onclick = ()=>pgParts=[];

document.querySelectorAll('[data-spawn]').forEach(b=>{
  b.onclick = ()=>spawn(b.dataset.spawn);
});
canvas.addEventListener('click',e=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  spawn('electron', x, y);
});

function spawn(type, x, y){
  const t = PG_TYPES[type];
  if(!t) return;
  const isPhoton = type==='photon';
  const angle = Math.random()*Math.PI*2;
  const speed = isPhoton? 4 : (Math.random()*0.8+0.2);
  pgParts.push({
    type, ...t,
    x: x ?? Math.random()*W,
    y: y ?? Math.random()*H,
    vx: Math.cos(angle)*speed,
    vy: Math.sin(angle)*speed,
    life: isPhoton ? 200 : Infinity,
    trail: []
  });
  if(pgParts.length>150) pgParts.shift();
}

function step(){
  // background fade for trails
  ctx.fillStyle = trails ? 'rgba(3,5,16,0.15)' : 'rgba(3,5,16,1)';
  ctx.fillRect(0,0,W,H);

  // physics: electrostatic forces between charged
  for(let i=0;i<pgParts.length;i++){
    const a = pgParts[i];
    if(a.q!==0 && a.mass>0){
      let fx=0,fy=0;
      for(let j=0;j<pgParts.length;j++){
        if(i===j) continue;
        const b = pgParts[j];
        if(b.q===0) continue;
        const dx = b.x-a.x, dy=b.y-a.y;
        const d2 = dx*dx+dy*dy+50;
        const d = Math.sqrt(d2);
        // Coulomb-ish, opposite attract, same repel. Force ~ q1*q2/d^2
        const f = -80 * a.q * b.q / d2;
        fx += f * dx/d;
        fy += f * dy/d;
      }
      a.vx += fx / a.mass * 50;
      a.vy += fy / a.mass * 50;
      // damping
      a.vx *= 0.995; a.vy *= 0.995;
      // speed clamp
      const s = Math.hypot(a.vx,a.vy);
      if(s>3){ a.vx = a.vx/s*3; a.vy = a.vy/s*3; }
    }

    a.x += a.vx; a.y += a.vy;
    // wall bounce
    if(a.x<a.r){a.x=a.r;a.vx*=-0.8}
    if(a.x>W-a.r){a.x=W-a.r;a.vx*=-0.8}
    if(a.y<a.r){a.y=a.r;a.vy*=-0.8}
    if(a.y>H-a.r){a.y=H-a.r;a.vy*=-0.8}

    if(trails){
      a.trail.push({x:a.x,y:a.y});
      if(a.trail.length>15) a.trail.shift();
    }

    if(a.life!==Infinity){ a.life--; }
  }

  // annihilation: electron + positron -> 2 photons
  const toRemove = new Set();
  const toAdd = [];
  for(let i=0;i<pgParts.length;i++){
    if(toRemove.has(i)) continue;
    const a = pgParts[i];
    for(let j=i+1;j<pgParts.length;j++){
      if(toRemove.has(j)) continue;
      const b = pgParts[j];
      const dx=b.x-a.x, dy=b.y-a.y;
      if(dx*dx+dy*dy < (a.r+b.r)*(a.r+b.r)){
        // electron-positron annihilation
        if((a.type==='electron'&&b.type==='positron')||(a.type==='positron'&&b.type==='electron')){
          toRemove.add(i); toRemove.add(j);
          const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
          for(let k=0;k<2;k++){
            const ang = Math.random()*Math.PI*2;
            toAdd.push({type:'photon',...PG_TYPES.photon,x:cx,y:cy,vx:Math.cos(ang)*4,vy:Math.sin(ang)*4,life:200,trail:[],flash:1});
          }
          // flash
          flashes.push({x:cx,y:cy,r:0,life:20});
        }
      }
    }
  }
  pgParts = pgParts.filter((p,i)=>!toRemove.has(i) && p.life>0);
  pgParts.push(...toAdd);

  // draw
  for(const p of pgParts){
    // trail
    if(trails && p.trail.length>1){
      ctx.strokeStyle = p.c+'40';
      ctx.lineWidth = p.r*0.5;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for(const t of p.trail) ctx.lineTo(t.x,t.y);
      ctx.stroke();
    }
    // glow
    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
    g.addColorStop(0, p.c);
    g.addColorStop(1, p.c+'00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
    // core
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    // label
    if(p.mass>0){
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(p.q>0?'+':p.q<0?'−':'', p.x, p.y);
    }
  }

  // flashes
  for(const f of flashes){
    ctx.strokeStyle = `rgba(255,255,200,${f.life/20})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.stroke();
    f.r += 3; f.life--;
  }
  for(let i=flashes.length-1;i>=0;i--) if(flashes[i].life<=0) flashes.splice(i,1);

  requestAnimationFrame(step);
}
let flashes = [];
step();

// seed some particles for fun
setTimeout(()=>{
  spawn('electron'); spawn('electron'); spawn('proton'); spawn('proton'); spawn('positron');
},400);

/* Show hydrogen as default in detail */
// (deferred until after applyI18n)

/* ================ LANGUAGE SWITCHER ================ */
document.querySelectorAll('.lang-pill').forEach(b=>{
  b.addEventListener('click',()=>{
    const lang = b.dataset.lang;
    try { localStorage.setItem('pz-lang', lang); } catch(_){}
    applyI18n(lang);
  });
});
const savedLang = (function(){ try { return localStorage.getItem('pz-lang'); } catch(_){ return null; } })();
const browserLang = (navigator.language||'').toLowerCase();
const initLang = savedLang || (browserLang.startsWith('zh') ? 'zh-CN' : 'en');
applyI18n(initLang);
showParticle('electron');

/* ================ FORCES TAB: animated interaction diagrams ================ */
/* Each diagram is an SVG. We build a stable structure of static "shape" paths
   (fermion arrows, vertices, labels) and animated "carrier" paths (photon/
   gluon/W/Z wiggles). Carrier paths get their `d` attribute rewritten each
   frame with a phase-shifted waveform so the mediator visibly propagates. */

const IX_W = 320, IX_H = 110;              // SVG viewbox
const IX_PAD_X = 22, IX_PAD_Y = 14;

// ---- waveform helpers (return SVG path `d` strings) ----
function ixWavy(x1,y1,x2,y2,phase,amp=6,freq=6){
  // sine wiggle perpendicular to the segment (photon)
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy);
  const ux=dx/L, uy=dy/L, nx=-uy, ny=ux;
  const N=Math.max(24, Math.round(L/4));
  let d='';
  for(let i=0;i<=N;i++){
    const t=i/N;
    const s=Math.sin(t*freq*Math.PI*2 + phase)*amp;
    const px=x1+ux*L*t + nx*s;
    const py=y1+uy*L*t + ny*s;
    d += (i?'L':'M') + px.toFixed(2) + ' ' + py.toFixed(2) + ' ';
  }
  return d;
}
function ixCurly(x1,y1,x2,y2,phase,amp=7,freq=7){
  // helical/curly (gluon): two orthogonal sinusoids
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy);
  const ux=dx/L, uy=dy/L, nx=-uy, ny=ux;
  const N=Math.max(28, Math.round(L/3));
  let d='';
  for(let i=0;i<=N;i++){
    const t=i/N;
    const ang=t*freq*Math.PI*2 + phase;
    const s=Math.sin(ang)*amp;
    const c=Math.cos(ang)*amp*0.55;
    const px=x1+ux*(L*t + c) + nx*s;
    const py=y1+uy*(L*t + c) + ny*s;
    d += (i?'L':'M') + px.toFixed(2) + ' ' + py.toFixed(2) + ' ';
  }
  return d;
}
function ixDashPhase(el, phase){ el.setAttribute('stroke-dashoffset', String(-phase*12)); }

// ---- primitive shape builders (return SVG element strings) ----
function ixArrow(x1,y1,x2,y2,color,label,labelAt='mid',anti=false){
  // draws a fermion line with a small arrowhead (reversed if antiparticle)
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1;
  const ux=dx/L, uy=dy/L;
  const dir = anti ? -1 : 1;
  const ax=mx - ux*6*dir, ay=my - uy*6*dir;
  const bx=mx + ux*6*dir, by=my + uy*6*dir;
  const nx=-uy, ny=ux;
  const head = `M${bx} ${by} L${ax + nx*4} ${ay + ny*4} L${ax - nx*4} ${ay - ny*4} Z`;
  let lx, ly, anchor='middle';
  if(labelAt==='start'){ lx=x1-4; ly=y1-4; anchor='end'; }
  else if(labelAt==='end'){ lx=x2+4; ly=y2-4; anchor='start'; }
  else { lx=mx + nx*12; ly=my + ny*12 + 4; }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.6"/>`
       + `<path d="${head}" fill="${color}"/>`
       + (label?`<text x="${lx}" y="${ly}" text-anchor="${anchor}" fill="${color}" font-size="11" font-family="JetBrains Mono, monospace">${label}</text>`:'');
}
function ixVertex(x,y,color='#fff'){
  return `<circle cx="${x}" cy="${y}" r="2.6" fill="${color}"/>`;
}
function ixNucleus(x,y,label='N'){
  return `<circle cx="${x}" cy="${y}" r="10" fill="rgba(255,255,255,0.06)" stroke="#8fa" stroke-dasharray="2 2"/>`
       + `<text x="${x}" y="${y+4}" text-anchor="middle" fill="#8fa" font-size="10" font-family="JetBrains Mono, monospace">${label}</text>`;
}

// ---- interaction definitions ----
// Each entry has: id, group, tag, i18nTitle, i18nNote, equation, render(svg, phase)
// render() returns an object { staticSvg, animate(t) } — we call render once
// per tile at build time; animate() mutates specific child nodes each frame.

const IX_DEFS = [
  // ========== COMMON ==========
  { id:'beta', group:'common', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.beta', note:'ix.beta.note',
    eq:'d → u + W⁻ → u + e⁻ + ν̄ₑ',
    build(){
      // neutron (d,u,d) on left, proton (u,u,d) on right; one d emits W⁻ → e⁻ + ν̄
      // vertical layout: three quark lines going L→R, middle one kinks at vertex.
      const y1=25,y2=55,y3=85, xL=IX_PAD_X, xR=IX_W-IX_PAD_X, xV=140;
      let s='';
      s += ixArrow(xL,y1,xR,y1,'#ff6b9d','u','end');            // u stays u
      s += ixArrow(xL,y3,xR,y3,'#ff6b9d','d','end');            // d stays d
      // middle quark kinks: d (LEFT segment) then u (RIGHT segment)
      s += ixArrow(xL,y2,xV,y2,'#ff6b9d','d','start');
      s += ixArrow(xV,y2,xR,y2,'#ff6b9d','u','end');
      s += ixVertex(xV,y2);
      // W⁻ boson: dashed line up-right to a second vertex; then decays to e⁻, ν̄
      const xW=210, yW=35;
      s += `<path class="ix-w" d="M${xV} ${y2} L${xW} ${yW}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${(xV+xW)/2+6}" y="${(y2+yW)/2}" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁻</text>`;
      s += ixVertex(xW,yW,'#7ee8c5');
      s += ixArrow(xW,yW,xR,15,'#ffd166','e⁻','end');
      s += ixArrow(xW,yW,xR,55,'#c8cff0','ν̄ₑ','end',true);
      // proton bracket right, neutron bracket left
      s += `<text x="${xL-6}" y="60" text-anchor="end" fill="#8fa" font-size="10">n</text>`;
      s += `<text x="${xR+6}" y="60" text-anchor="start" fill="#8fa" font-size="10">p</text>`;
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'annih', group:'common', tag:'em', tagKey:'ix.tag.em',
    title:'ix.annih', note:'ix.annih.note',
    eq:'e⁻ + e⁺ → γ + γ',
    build(){
      const xV=IX_W/2, yV=IX_H/2;
      let s='';
      s += ixArrow(IX_PAD_X,25,xV,yV,'#ffd166','e⁻','start');
      s += ixArrow(IX_PAD_X,85,xV,yV,'#ffd166','e⁺','start',true);
      s += ixVertex(xV,yV);
      s += `<path class="ix-ph1" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<path class="ix-ph2" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${IX_W-IX_PAD_X+2}" y="28" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      s += `<text x="${IX_W-IX_PAD_X+2}" y="90" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      return { svg:s, anim(el,t){
        const p1=el.querySelector('.ix-ph1'), p2=el.querySelector('.ix-ph2');
        if(p1) p1.setAttribute('d', ixWavy(xV,yV,IX_W-IX_PAD_X,25,-t*4));
        if(p2) p2.setAttribute('d', ixWavy(xV,yV,IX_W-IX_PAD_X,85,-t*4));
      }};
    }
  },

  { id:'pair', group:'common', tag:'em', tagKey:'ix.tag.em',
    title:'ix.pair', note:'ix.pair.note',
    eq:'γ → e⁻ + e⁺  (near nucleus)',
    build(){
      const xV=IX_W/2, yV=IX_H/2;
      let s='';
      s += ixNucleus(xV+10, yV+30, 'N');
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${IX_PAD_X-2}" y="${yV-4}" text-anchor="end" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      s += ixVertex(xV,yV);
      s += ixArrow(xV,yV,IX_W-IX_PAD_X,25,'#ffd166','e⁻','end');
      s += ixArrow(xV,yV,IX_W-IX_PAD_X,85,'#ffd166','e⁺','end',true);
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(IX_PAD_X,yV,xV,yV,-t*4));
      }};
    }
  },

  { id:'fusion', group:'common', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.fusion', note:'ix.fusion.note',
    eq:'p + p → ²H + e⁺ + νₑ',
    build(){
      const xV=140, yV=IX_H/2;
      let s='';
      s += ixArrow(IX_PAD_X,25,xV,40,'#ff6b9d','p','start');
      s += ixArrow(IX_PAD_X,85,xV,70,'#ff6b9d','p','start');
      s += ixVertex(xV,55);
      // fused ²H going right
      s += ixArrow(xV,55,IX_W-IX_PAD_X,55,'#8fa','²H','end');
      // W⁺ up to positron + nu
      const xW=210, yW=25;
      s += `<path class="ix-w" d="M${xV} ${yV} L${xW} ${yW}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${(xV+xW)/2}" y="${(yV+yW)/2-2}" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁺</text>`;
      s += ixVertex(xW,yW,'#7ee8c5');
      s += ixArrow(xW,yW,IX_W-IX_PAD_X,12,'#ffd166','e⁺','end',true);
      s += ixArrow(xW,yW,IX_W-IX_PAD_X,32,'#c8cff0','νₑ','end');
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'higgs', group:'common', tag:'higgs', tagKey:'ix.tag.higgs',
    title:'ix.higgs', note:'ix.higgs.note',
    eq:'H → (t or W loop) → γ + γ',
    build(){
      const xL=IX_PAD_X, xLoop=130, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      let s='';
      s += `<path class="ix-h" d="M${xL} ${yC} L${xLoop} ${yC}" stroke="#c39bff" stroke-width="1.8" stroke-dasharray="6 4" fill="none"/>`;
      s += `<text x="${xL-2}" y="${yC-6}" text-anchor="end" fill="#c39bff" font-size="11" font-family="JetBrains Mono, monospace">H</text>`;
      // loop (t or W)
      s += `<ellipse cx="${xLoop+14}" cy="${yC}" rx="14" ry="12" fill="none" stroke="#ff6b9d" stroke-width="1.4"/>`;
      s += `<text x="${xLoop+14}" y="${yC+3}" text-anchor="middle" fill="#ff6b9d" font-size="9" font-family="JetBrains Mono, monospace">t/W</text>`;
      // two photons
      s += `<path class="ix-ph1" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<path class="ix-ph2" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${xR+2}" y="28" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      s += `<text x="${xR+2}" y="90" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      const vx=xLoop+28;
      return { svg:s, anim(el,t){
        const h=el.querySelector('.ix-h'); if(h) ixDashPhase(h,t*2);
        const p1=el.querySelector('.ix-ph1'), p2=el.querySelector('.ix-ph2');
        if(p1) p1.setAttribute('d', ixWavy(vx,yC-8,xR,25,-t*4));
        if(p2) p2.setAttribute('d', ixWavy(vx,yC+8,xR,85,-t*4));
      }};
    }
  },

  { id:'gluon', group:'common', tag:'strong', tagKey:'ix.tag.strong',
    title:'ix.gluon', note:'ix.gluon.note',
    eq:'q + q → q + q  (via g)',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT_x=IX_W/2, vT_y=32;
      const vB_x=IX_W/2, vB_y=78;
      let s='';
      s += ixArrow(xL,vT_y,vT_x,vT_y,'#ff6b9d','q','start');
      s += ixArrow(vT_x,vT_y,xR,vT_y,'#ff6b9d','q','end');
      s += ixArrow(xL,vB_y,vB_x,vB_y,'#ff6b9d','q','start');
      s += ixArrow(vB_x,vB_y,xR,vB_y,'#ff6b9d','q','end');
      s += ixVertex(vT_x,vT_y); s += ixVertex(vB_x,vB_y);
      s += `<path class="ix-g" d="" stroke="#ff6b9d" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT_x+8}" y="${(vT_y+vB_y)/2+4}" fill="#ff6b9d" font-size="11" font-family="JetBrains Mono, monospace">g</text>`;
      return { svg:s, anim(el,t){
        const g=el.querySelector('.ix-g');
        if(g) g.setAttribute('d', ixCurly(vT_x,vT_y,vB_x,vB_y,t*4));
      }};
    }
  },

  // ========== FORCE CARRIER EXCHANGE ==========
  { id:'ex-strong', group:'exchange', tag:'strong', tagKey:'ix.tag.strong',
    title:'ix.ex.strong', note:'ix.ex.strong.note',
    eq:'q ⇄ q  via g',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#ff6b9d','q₁','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ff6b9d','q₁','end');
      s += ixArrow(xL,vB[1],vB[0],vB[1],'#ff6b9d','q₂','start');
      s += ixArrow(vB[0],vB[1],xR,vB[1],'#ff6b9d','q₂','end');
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-g" d="" stroke="#ff6b9d" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#ff6b9d" font-size="11" font-family="JetBrains Mono, monospace">g</text>`;
      return { svg:s, anim(el,t){
        const g=el.querySelector('.ix-g');
        if(g) g.setAttribute('d', ixCurly(vT[0],vT[1],vB[0],vB[1],t*4));
      }};
    }
  },

  { id:'ex-em', group:'exchange', tag:'em', tagKey:'ix.tag.em',
    title:'ix.ex.em', note:'ix.ex.em.note',
    eq:'e⁻ + e⁻ → e⁻ + e⁻  via γ',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#ffd166','e⁻','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ffd166','e⁻','end');
      s += ixArrow(xL,vB[1],vB[0],vB[1],'#ffd166','e⁻','start');
      s += ixArrow(vB[0],vB[1],xR,vB[1],'#ffd166','e⁻','end');
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(vT[0],vT[1],vB[0],vB[1],t*4));
      }};
    }
  },

  { id:'ex-weak', group:'exchange', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.ex.weak', note:'ix.ex.weak.note',
    eq:'νₑ + n → e⁻ + p  via W',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#c8cff0','νₑ','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ffd166','e⁻','end');
      s += ixArrow(xL,vB[1],vB[0],vB[1],'#ff6b9d','d','start');
      s += ixArrow(vB[0],vB[1],xR,vB[1],'#ff6b9d','u','end');
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-w" d="M${vT[0]} ${vT[1]} L${vB[0]} ${vB[1]}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁻</text>`;
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'ex-grav', group:'exchange', tag:'grav', tagKey:'ix.tag.grav',
    title:'ix.ex.grav', note:'ix.ex.grav.note',
    eq:'M + M  via graviton?',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += `<circle cx="${xL+8}" cy="${vT[1]}" r="6" fill="#7c5cff"/>`;
      s += `<circle cx="${xR-8}" cy="${vT[1]}" r="6" fill="#7c5cff"/>`;
      s += `<circle cx="${xL+8}" cy="${vB[1]}" r="6" fill="#7c5cff"/>`;
      s += `<circle cx="${xR-8}" cy="${vB[1]}" r="6" fill="#7c5cff"/>`;
      s += `<line x1="${xL+14}" y1="${vT[1]}" x2="${vT[0]}" y2="${vT[1]}" stroke="#7c5cff" stroke-width="1.4"/>`;
      s += `<line x1="${vT[0]}" y1="${vT[1]}" x2="${xR-14}" y2="${vT[1]}" stroke="#7c5cff" stroke-width="1.4"/>`;
      s += `<line x1="${xL+14}" y1="${vB[1]}" x2="${vB[0]}" y2="${vB[1]}" stroke="#7c5cff" stroke-width="1.4"/>`;
      s += `<line x1="${vB[0]}" y1="${vB[1]}" x2="${xR-14}" y2="${vB[1]}" stroke="#7c5cff" stroke-width="1.4"/>`;
      s += ixVertex(vT[0],vT[1],'#7c5cff'); s += ixVertex(vB[0],vB[1],'#7c5cff');
      // graviton: double wavy line (spin 2 hint)
      s += `<path class="ix-gr1" d="" stroke="#7c5cff" stroke-width="1.4" fill="none" opacity="0.9"/>`;
      s += `<path class="ix-gr2" d="" stroke="#7c5cff" stroke-width="1.4" fill="none" opacity="0.6"/>`;
      s += `<text x="${vT[0]+10}" y="55" fill="#7c5cff" font-size="11" font-family="JetBrains Mono, monospace">G?</text>`;
      return { svg:s, anim(el,t){
        const g1=el.querySelector('.ix-gr1'), g2=el.querySelector('.ix-gr2');
        if(g1) g1.setAttribute('d', ixWavy(vT[0]-3,vT[1],vB[0]-3,vB[1],t*3,4,4));
        if(g2) g2.setAttribute('d', ixWavy(vT[0]+3,vT[1],vB[0]+3,vB[1],t*3+Math.PI,4,4));
      }};
    }
  },

  { id:'ex-higgs', group:'exchange', tag:'higgs', tagKey:'ix.tag.higgs',
    title:'ix.ex.higgs', note:'ix.ex.higgs.note',
    eq:'f + H → f  (mass coupling)',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      const xV=IX_W/2;
      let s='';
      s += ixArrow(xL,yC,xV,yC,'#ffd166','f','start');
      s += ixArrow(xV,yC,xR,yC,'#ffd166','f','end');
      s += ixVertex(xV,yC);
      s += `<path class="ix-h" d="M${xV} ${yC} L${xV} 20" stroke="#c39bff" stroke-width="1.8" stroke-dasharray="6 4" fill="none"/>`;
      s += `<text x="${xV+6}" y="20" fill="#c39bff" font-size="11" font-family="JetBrains Mono, monospace">H</text>`;
      // background: subtle Higgs field dots
      for(let i=0;i<10;i++){
        const cx=xL+10+Math.random()*(xR-xL-20);
        const cy=yC+22+Math.random()*20;
        s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1" fill="#c39bff" opacity="0.35"/>`;
      }
      return { svg:s, anim(el,t){ const h=el.querySelector('.ix-h'); if(h) ixDashPhase(h,t*2); } };
    }
  },

  // ========== RARE / HIGH-ENERGY ==========
  { id:'compton', group:'rare', tag:'em', tagKey:'ix.tag.em',
    title:'ix.compton', note:'ix.compton.note',
    eq:'γ + e⁻ → γ + e⁻',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const v1=[IX_W*0.42, 55], v2=[IX_W*0.58, 55];
      let s='';
      s += ixArrow(xL,80,v1[0],v1[1],'#ffd166','e⁻','start');
      s += ixArrow(v2[0],v2[1],xR,80,'#ffd166','e⁻','end');
      s += `<line x1="${v1[0]}" y1="${v1[1]}" x2="${v2[0]}" y2="${v2[1]}" stroke="#ffd166" stroke-width="1.6"/>`;
      s += ixVertex(v1[0],v1[1]); s += ixVertex(v2[0],v2[1]);
      s += `<path class="ix-ph1" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<path class="ix-ph2" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${xL-2}" y="26" text-anchor="end" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      s += `<text x="${xR+2}" y="26" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      return { svg:s, anim(el,t){
        const p1=el.querySelector('.ix-ph1'), p2=el.querySelector('.ix-ph2');
        if(p1) p1.setAttribute('d', ixWavy(xL,30,v1[0],v1[1],-t*4));
        if(p2) p2.setAttribute('d', ixWavy(v2[0],v2[1],xR,30,-t*4));
      }};
    }
  },

  { id:'moller', group:'rare', tag:'em', tagKey:'ix.tag.em',
    title:'ix.moller', note:'ix.moller.note',
    eq:'e⁻ + e⁻ → e⁻ + e⁻',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#ffd166','e⁻','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ffd166','e⁻','end');
      s += ixArrow(xL,vB[1],vB[0],vB[1],'#ffd166','e⁻','start');
      s += ixArrow(vB[0],vB[1],xR,vB[1],'#ffd166','e⁻','end');
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ*</text>`;
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(vT[0],vT[1],vB[0],vB[1],t*4));
      }};
    }
  },

  { id:'bhabha', group:'rare', tag:'em', tagKey:'ix.tag.em',
    title:'ix.bhabha', note:'ix.bhabha.note',
    eq:'e⁻ + e⁺ → e⁻ + e⁺',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W/2,32], vB=[IX_W/2,78];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#ffd166','e⁻','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ffd166','e⁻','end');
      s += ixArrow(xL,vB[1],vB[0],vB[1],'#ffd166','e⁺','start',true);
      s += ixArrow(vB[0],vB[1],xR,vB[1],'#ffd166','e⁺','end',true);
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ*</text>`;
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(vT[0],vT[1],vB[0],vB[1],t*4));
      }};
    }
  },

  { id:'bremss', group:'rare', tag:'em', tagKey:'ix.tag.em',
    title:'ix.bremss', note:'ix.bremss.note',
    eq:'e⁻ + N → e⁻ + N + γ',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      const xV=IX_W*0.55;
      let s='';
      s += ixArrow(xL,yC,xV,yC,'#ffd166','e⁻','start');
      s += ixArrow(xV,yC,xR,80,'#ffd166','e⁻','end');
      s += ixVertex(xV,yC);
      s += ixNucleus(xV, 92, 'N');
      s += `<line x1="${xV}" y1="${yC}" x2="${xV}" y2="88" stroke="#8fa" stroke-width="1.2" stroke-dasharray="2 2"/>`;
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${xR+2}" y="28" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ</text>`;
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(xV,yC,xR,25,-t*4));
      }};
    }
  },

  { id:'neutron', group:'rare', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.neutron', note:'ix.neutron.note',
    eq:'n → p + e⁻ + ν̄ₑ',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      const xV=IX_W*0.5;
      let s='';
      s += ixArrow(xL,yC,xV,yC,'#8fa','n','start');
      s += ixArrow(xV,yC,xR,yC,'#8fa','p','end');
      s += ixVertex(xV,yC);
      const xW=IX_W*0.72, yW=30;
      s += `<path class="ix-w" d="M${xV} ${yC} L${xW} ${yW}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${(xV+xW)/2-4}" y="${(yC+yW)/2}" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁻</text>`;
      s += ixVertex(xW,yW,'#7ee8c5');
      s += ixArrow(xW,yW,xR,12,'#ffd166','e⁻','end');
      s += ixArrow(xW,yW,xR,45,'#c8cff0','ν̄ₑ','end',true);
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'muon', group:'rare', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.muon', note:'ix.muon.note',
    eq:'μ⁻ → e⁻ + ν̄ₑ + νμ',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      const xV=IX_W*0.42;
      let s='';
      s += ixArrow(xL,yC,xV,yC,'#ffd166','μ⁻','start');
      s += ixArrow(xV,yC,xR,yC,'#c8cff0','νμ','end');
      s += ixVertex(xV,yC);
      const xW=IX_W*0.66, yW=32;
      s += `<path class="ix-w" d="M${xV} ${yC} L${xW} ${yW}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${(xV+xW)/2-4}" y="${(yC+yW)/2}" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁻</text>`;
      s += ixVertex(xW,yW,'#7ee8c5');
      s += ixArrow(xW,yW,xR,15,'#ffd166','e⁻','end');
      s += ixArrow(xW,yW,xR,45,'#c8cff0','ν̄ₑ','end',true);
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'pion', group:'rare', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.pion', note:'ix.pion.note',
    eq:'π⁺ → μ⁺ + νμ',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X, yC=IX_H/2;
      const xV=IX_W*0.5;
      let s='';
      s += ixArrow(xL,yC,xV,yC,'#c39bff','π⁺','start');
      s += ixVertex(xV,yC);
      s += `<path class="ix-w" d="M${xV} ${yC} L${xV+30} ${yC}" stroke="#7ee8c5" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${xV+8}" y="${yC-4}" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">W⁺</text>`;
      s += ixVertex(xV+30,yC,'#7ee8c5');
      s += ixArrow(xV+30,yC,xR,25,'#ffd166','μ⁺','end',true);
      s += ixArrow(xV+30,yC,xR,85,'#c8cff0','νμ','end');
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'dis', group:'rare', tag:'em', tagKey:'ix.tag.em',
    title:'ix.dis', note:'ix.dis.note',
    eq:'e⁻ + p → e⁻ + X',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const vT=[IX_W*0.45,28], vB=[IX_W*0.45,82];
      let s='';
      s += ixArrow(xL,vT[1],vT[0],vT[1],'#ffd166','e⁻','start');
      s += ixArrow(vT[0],vT[1],xR,vT[1],'#ffd166','e⁻','end');
      // proton blob with quark line
      s += `<ellipse cx="${xL+18}" cy="${vB[1]}" rx="12" ry="10" fill="rgba(255,107,157,0.15)" stroke="#ff6b9d" stroke-dasharray="2 2"/>`;
      s += `<text x="${xL+18}" y="${vB[1]+3}" text-anchor="middle" fill="#ff6b9d" font-size="10">p</text>`;
      s += ixArrow(xL+30,vB[1],vB[0],vB[1],'#ff6b9d','q','start');
      s += ixArrow(vB[0],vB[1],xR,vB[1]-8,'#ff6b9d','q','end');
      s += ixArrow(vB[0],vB[1],xR,vB[1]+8,'#ff6b9d','X','end');
      s += ixVertex(vT[0],vT[1]); s += ixVertex(vB[0],vB[1]);
      s += `<path class="ix-ph" d="" stroke="#ffd166" stroke-width="1.6" fill="none"/>`;
      s += `<text x="${vT[0]+8}" y="55" fill="#ffd166" font-size="11" font-family="JetBrains Mono, monospace">γ*</text>`;
      return { svg:s, anim(el,t){
        const p=el.querySelector('.ix-ph');
        if(p) p.setAttribute('d', ixWavy(vT[0],vT[1],vB[0],vB[1],t*4));
      }};
    }
  },

  { id:'zprod', group:'rare', tag:'weak', tagKey:'ix.tag.weak',
    title:'ix.zprod', note:'ix.zprod.note',
    eq:'e⁻ + e⁺ → Z⁰ → f + f̄',
    build(){
      const xL=IX_PAD_X, xR=IX_W-IX_PAD_X;
      const v1=[IX_W*0.4,IX_H/2], v2=[IX_W*0.6,IX_H/2];
      let s='';
      s += ixArrow(xL,25,v1[0],v1[1],'#ffd166','e⁻','start');
      s += ixArrow(xL,85,v1[0],v1[1],'#ffd166','e⁺','start',true);
      s += `<path class="ix-w" d="M${v1[0]} ${v1[1]} L${v2[0]} ${v2[1]}" stroke="#7ee8c5" stroke-width="1.8" stroke-dasharray="5 3" fill="none"/>`;
      s += `<text x="${(v1[0]+v2[0])/2}" y="${v1[1]-4}" text-anchor="middle" fill="#7ee8c5" font-size="11" font-family="JetBrains Mono, monospace">Z⁰</text>`;
      s += ixVertex(v1[0],v1[1]); s += ixVertex(v2[0],v2[1]);
      s += ixArrow(v2[0],v2[1],xR,25,'#c8cff0','f','end');
      s += ixArrow(v2[0],v2[1],xR,85,'#c8cff0','f̄','end',true);
      return { svg:s, anim(el,t){ const w=el.querySelector('.ix-w'); if(w) ixDashPhase(w,t*2); } };
    }
  },

  { id:'gravwave', group:'rare', tag:'grav', tagKey:'ix.tag.grav',
    title:'ix.gravwave', note:'ix.gravwave.note',
    eq:'M + M → M + M + G',
    build(){
      const yC=IX_H/2;
      let s='';
      s += `<circle cx="30" cy="${yC-15}" r="8" fill="#7c5cff"/>`;
      s += `<circle cx="30" cy="${yC+15}" r="8" fill="#7c5cff"/>`;
      s += `<circle cx="${IX_W-30}" cy="${yC-15}" r="8" fill="#7c5cff" opacity="0.6"/>`;
      s += `<circle cx="${IX_W-30}" cy="${yC+15}" r="8" fill="#7c5cff" opacity="0.6"/>`;
      // orbit hints
      s += `<ellipse cx="30" cy="${yC}" rx="14" ry="20" fill="none" stroke="#7c5cff" stroke-width="0.6" opacity="0.4"/>`;
      s += `<ellipse cx="${IX_W-30}" cy="${yC}" rx="14" ry="20" fill="none" stroke="#7c5cff" stroke-width="0.6" opacity="0.4"/>`;
      // graviton double wavy
      s += `<path class="ix-gr1" d="" stroke="#7c5cff" stroke-width="1.4" fill="none"/>`;
      s += `<path class="ix-gr2" d="" stroke="#7c5cff" stroke-width="1.4" fill="none" opacity="0.65"/>`;
      s += `<text x="${IX_W/2}" y="${yC-22}" text-anchor="middle" fill="#7c5cff" font-size="11" font-family="JetBrains Mono, monospace">G (spin 2)</text>`;
      return { svg:s, anim(el,t){
        const g1=el.querySelector('.ix-gr1'), g2=el.querySelector('.ix-gr2');
        if(g1) g1.setAttribute('d', ixWavy(46,yC-2,IX_W-46,yC-2,-t*3,4,5));
        if(g2) g2.setAttribute('d', ixWavy(46,yC+2,IX_W-46,yC+2,-t*3+Math.PI,4,5));
      }};
    }
  },
];

// ---- build tiles into their respective group containers ----
const IX_INSTANCES = [];
function buildInteractionTiles(){
  document.querySelectorAll('.ix-anim').forEach(container=>{
    const group = container.dataset.group;
    container.innerHTML = '';
    IX_DEFS.filter(d=>d.group===group).forEach(def=>{
      const built = def.build();
      const card = document.createElement('div');
      card.className = 'ix-card';
      const tagLabel = (typeof t==='function' ? t(def.tagKey) : def.tag);
      card.innerHTML =
        `<div class="ix-head">`+
          `<span class="ix-title" data-i18n="${def.title}">${def.title}</span>`+
          `<span class="ix-tag t-${def.tag}" data-i18n="${def.tagKey}">${tagLabel}</span>`+
        `</div>`+
        `<svg viewBox="0 0 ${IX_W} ${IX_H}" preserveAspectRatio="none">${built.svg}</svg>`+
        `<div class="ix-eq">${def.eq}</div>`+
        `<div class="ix-note" data-i18n="${def.note}">${def.note}</div>`;
      container.appendChild(card);
      IX_INSTANCES.push({ el: card.querySelector('svg'), anim: built.anim });
    });
  });
  // Re-run i18n so the freshly-inserted data-i18n nodes get translated.
  try {
    const lang = (localStorage.getItem('pz-lang')) ||
      ((navigator.language||'').toLowerCase().startsWith('zh') ? 'zh-CN' : 'en');
    if(typeof applyI18n==='function') applyI18n(lang);
  } catch(_){}
}

let ixRAF=null, ixT=0;
function ixLoop(){
  ixT += 0.05;
  for(const inst of IX_INSTANCES) inst.anim(inst.el, ixT);
  ixRAF = requestAnimationFrame(ixLoop);
}
function ixStart(){ if(ixRAF==null) ixLoop(); }
function ixStop(){ if(ixRAF!=null){ cancelAnimationFrame(ixRAF); ixRAF=null; } }

// Hook into tab switching: start when 'forces' tab is shown, stop otherwise.
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    if(t.dataset.tab==='forces') ixStart(); else ixStop();
  });
});

buildInteractionTiles();
// If forces is the initial tab, start immediately; otherwise start on demand.
if(document.querySelector('.tab.active')?.dataset.tab === 'forces') ixStart();

/* ================ PHYSICS LAB TAB ================ */
/* Three demos: Confinement / flux tube, Detector cross-section, Higgs lattice.
   All share a single rAF loop that runs only while the Lab tab is active. */

let labRAF=null, labT=0;
var LAB = {}; // per-demo state (var so it's hoisted above the initial applyI18n() call)

// ---- shared canvas helper ----
function labSizeCanvas(c){
  const r = c.getBoundingClientRect();
  const W = Math.max(1, r.width), H = Math.max(1, r.height);
  c.width  = W * devicePixelRatio;
  c.height = H * devicePixelRatio;
  const ctx = c.getContext('2d');
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  return { ctx, w:W, h:H, visible: r.width>1 && r.height>1 };
}

/* ---------- Demo 1: Confinement / flux tube ---------- */
function labInitConfinement(){
  const c = document.getElementById('confCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  LAB.conf = { ctx, w, h, canvas:c, q:{x:w*0.4,y:h/2}, aq:{x:w*0.6,y:h/2},
               dragging:null, snapPop:0, snapPos:null, snapPair:null, hint:0 };
  // Drag handling
  const pick = (mx,my)=>{
    const d1=(mx-LAB.conf.q.x)**2+(my-LAB.conf.q.y)**2;
    const d2=(mx-LAB.conf.aq.x)**2+(my-LAB.conf.aq.y)**2;
    if(Math.min(d1,d2)>500) return null;
    return d1<d2 ? 'q' : 'aq';
  };
  const local = (e)=>{ const r=c.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; };
  c.addEventListener('mousedown', e=>{ const p=local(e); LAB.conf.dragging = pick(p.x,p.y); });
  c.addEventListener('mousemove', e=>{
    if(!LAB.conf.dragging) return;
    const p = local(e);
    const target = LAB.conf.dragging==='q' ? LAB.conf.q : LAB.conf.aq;
    target.x = Math.max(20, Math.min(LAB.conf.w-20, p.x));
    target.y = Math.max(30, Math.min(LAB.conf.h-30, p.y));
  });
  window.addEventListener('mouseup', ()=>{ LAB.conf.dragging=null; });
  // Touch
  c.addEventListener('touchstart', e=>{ const r=c.getBoundingClientRect(); const t=e.touches[0]; LAB.conf.dragging = pick(t.clientX-r.left, t.clientY-r.top); e.preventDefault(); }, {passive:false});
  c.addEventListener('touchmove', e=>{
    if(!LAB.conf.dragging) return;
    const r=c.getBoundingClientRect(); const t=e.touches[0];
    const target = LAB.conf.dragging==='q' ? LAB.conf.q : LAB.conf.aq;
    target.x = Math.max(20, Math.min(LAB.conf.w-20, t.clientX-r.left));
    target.y = Math.max(30, Math.min(LAB.conf.h-30, t.clientY-r.top));
    e.preventDefault();
  }, {passive:false});
  c.addEventListener('touchend', ()=>{ LAB.conf.dragging=null; });

  document.getElementById('confReset').onclick = ()=>{
    LAB.conf.q  = {x:w*0.4, y:h/2};
    LAB.conf.aq = {x:w*0.6, y:h/2};
    LAB.conf.snapPop = 0; LAB.conf.snapPos=null; LAB.conf.snapPair=null;
  };
}
function labDrawConfinement(){
  const S = LAB.conf; if(!S) return;
  const { ctx, w, h } = S;
  ctx.clearRect(0,0,w,h);

  // Auto-pull mode: gently drag antiquark right until snap.
  const auto = document.getElementById('confAuto');
  if(auto && auto.checked && !S.dragging && !S.snapPos){
    S.aq.x += 0.35;
    if(S.aq.x > w-40) S.aq.x = w-40;
  }

  // background grid
  ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
  for(let x=0;x<w;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

  const q = S.q, aq = S.aq;
  const dx = aq.x-q.x, dy = aq.y-q.y, L = Math.hypot(dx,dy);
  const stretch = L / 80; // 1 = relaxed
  const SNAP = 3.4;       // stretch factor at which the tube snaps

  if(!S.snapPos){
    // Draw the flux tube — colour ramps from teal (relaxed) to hot pink (about to snap)
    const tension = Math.min(1, Math.max(0, (stretch-1)/(SNAP-1)));
    const colStart = `hsl(${170 - tension*140}, 80%, 55%)`;
    const colEnd   = `hsl(${170 - tension*140}, 90%, 65%)`;
    const grad = ctx.createLinearGradient(q.x,q.y,aq.x,aq.y);
    grad.addColorStop(0, colStart); grad.addColorStop(1, colEnd);
    // tube thickness grows with stretch (energy stored)
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 + tension*8;
    ctx.beginPath();
    // sinusoidal fatness along the tube (vibrating flux)
    const N=40;
    ctx.moveTo(q.x, q.y);
    for(let i=1;i<=N;i++){
      const t=i/N;
      const ux=dx/L, uy=dy/L, nx=-uy, ny=ux;
      const wobble = Math.sin(t*Math.PI*6 + labT*4) * (2 + tension*6);
      ctx.lineTo(q.x + dx*t + nx*wobble, q.y + dy*t + ny*wobble);
    }
    ctx.stroke();

    // Energy ticks along tube
    ctx.fillStyle=`rgba(255,209,102,${0.3+tension*0.6})`;
    for(let i=1;i<8;i++){
      const t=i/8;
      const px=q.x+dx*t, py=q.y+dy*t;
      ctx.beginPath(); ctx.arc(px,py,1.5+tension*1.5,0,Math.PI*2); ctx.fill();
    }

    // Energy / distance readout
    ctx.fillStyle='#8b93b3';
    ctx.font='11px JetBrains Mono, monospace';
    ctx.textAlign='left';
    ctx.fillText(`separation ≈ ${L.toFixed(0)} px`, 12, h-24);
    ctx.fillText(`stored energy ≈ ${(L*0.6).toFixed(1)} MeV (linear!)`, 12, h-10);

    // Snap!
    if(stretch >= SNAP){
      const mid = { x:(q.x+aq.x)/2, y:(q.y+aq.y)/2 };
      S.snapPos = mid;
      S.snapPair = { q2:{x:mid.x-16, y:mid.y}, aq2:{x:mid.x+16, y:mid.y} };
      S.snapPop = 0;
      // Flash
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(mid.x, mid.y, 30, 0, Math.PI*2); ctx.fill();
    }
  } else {
    // Post-snap animation: two mesons flying apart
    S.snapPop += 0.03;
    const p = Math.min(1, S.snapPop);
    // flash fading
    ctx.fillStyle=`rgba(255,255,255,${0.6*(1-p)})`;
    ctx.beginPath(); ctx.arc(S.snapPos.x, S.snapPos.y, 30+p*30, 0, Math.PI*2); ctx.fill();
    // meson A = q + aq2 (original quark + new antiquark)
    const aq2 = { x: S.snapPair.aq2.x - p*80, y: S.snapPair.aq2.y };
    const q2  = { x: S.snapPair.q2.x  + p*80, y: S.snapPair.q2.y  };
    // draw two thin flux tubes each (short)
    ctx.strokeStyle='#7ee8c5'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.lineTo(aq2.x,aq2.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(q2.x,q2.y); ctx.lineTo(aq.x,aq.y); ctx.stroke();
    // label
    ctx.fillStyle='#7ee8c5'; ctx.font='bold 11px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText('new q̄', aq2.x, aq2.y-14);
    ctx.fillText('new q',  q2.x,  q2.y-14);
    ctx.fillStyle='#ffd166'; ctx.font='11px Space Grotesk, sans-serif';
    ctx.fillText('→ 2 mesons (never 1 free quark)', S.snapPos.x, S.snapPos.y+50);
    if(p>=1){
      // reset for next cycle
      setTimeout(()=>{
        if(!LAB.conf) return;
        LAB.conf.q  = {x:w*0.4, y:h/2};
        LAB.conf.aq = {x:w*0.6, y:h/2};
        LAB.conf.snapPos=null; LAB.conf.snapPair=null; LAB.conf.snapPop=0;
      }, 400);
      S.snapPos = { x:-9999, y:-9999 }; // freeze until reset fires
    }
  }

  // Draw the quark & antiquark on top
  drawLabQuark(ctx, q.x, q.y, '#ff6b9d', 'q');
  drawLabQuark(ctx, aq.x, aq.y, '#7ee8c5', 'q̄');
}
function drawLabQuark(ctx, x, y, color, label){
  const g = ctx.createRadialGradient(x-3,y-3,0,x,y,16);
  g.addColorStop(0,'#fff'); g.addColorStop(0.4,color); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 11px JetBrains Mono, monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label, x, y);
  ctx.textBaseline='alphabetic';
}

/* ---------- Demo 2: Detector cross-section ---------- */
// Layers (inside → out): beam pipe, tracker, ECAL, HCAL, solenoid, muon chambers.
// Each particle lights up specific layers with a colour trace and a "hit" pattern.
// Layer i18n keys let us translate the on-canvas labels.
const DET_LAYERS = [
  { id:'beam',   r0:0,   r1:22,  fill:'rgba(255,255,255,0.03)', ring:'rgba(255,255,255,0.15)', i18n:'lab.det.layer.beam' },
  { id:'trk',    r0:22,  r1:70,  fill:'rgba(78,168,255,0.06)',  ring:'rgba(78,168,255,0.35)',  i18n:'lab.det.layer.trk' },
  { id:'ecal',   r0:70,  r1:100, fill:'rgba(255,209,102,0.08)', ring:'rgba(255,209,102,0.4)',  i18n:'lab.det.layer.ecal' },
  { id:'hcal',   r0:100, r1:140, fill:'rgba(255,107,157,0.08)', ring:'rgba(255,107,157,0.4)',  i18n:'lab.det.layer.hcal' },
  { id:'sol',    r0:140, r1:150, fill:'rgba(255,255,255,0.05)', ring:'rgba(255,255,255,0.2)',  i18n:'lab.det.layer.sol' },
  { id:'muon',   r0:150, r1:195, fill:'rgba(126,232,197,0.06)', ring:'rgba(126,232,197,0.4)',  i18n:'lab.det.layer.muon' },
];
// A particle's signature per layer is a small array of drawing directives.
// track='curve' | 'straight' | 'miss', shower='em' | 'had' | 'none', muon='hit'|'miss', jet=true/false
const DET_PARTICLES = {
  electron: { label:'e⁻', role:'lab.det.role.electron', color:'#4ea8ff',
              charged:true,  ecalShower:'em', hcalShower:'none', muon:'miss', jet:false,
              desc:'lab.det.desc.electron' },
  photon:   { label:'γ',  role:'lab.det.role.photon',   color:'#ffd166',
              charged:false, ecalShower:'em', hcalShower:'none', muon:'miss', jet:false,
              desc:'lab.det.desc.photon' },
  muon:     { label:'μ⁻', role:'lab.det.role.muon',     color:'#7ee8c5',
              charged:true,  ecalShower:'mip', hcalShower:'mip',  muon:'hit',  jet:false,
              desc:'lab.det.desc.muon' },
  pion:     { label:'π⁺', role:'lab.det.role.pion',     color:'#ff6b9d',
              charged:true,  ecalShower:'mip', hcalShower:'had',  muon:'miss', jet:false,
              desc:'lab.det.desc.pion' },
  neutron:  { label:'n⁰', role:'lab.det.role.neutron',  color:'#c8cff0',
              charged:false, ecalShower:'none', hcalShower:'had', muon:'miss', jet:false,
              desc:'lab.det.desc.neutron' },
  neutrino: { label:'ν',  role:'lab.det.role.neutrino', color:'#8fa8ff',
              charged:false, ecalShower:'none', hcalShower:'none', muon:'miss', jet:false,
              desc:'lab.det.desc.neutrino' },
  jet:      { label:'jet', role:'lab.det.role.jet',      color:'#c39bff',
              charged:true,  ecalShower:'em', hcalShower:'had',  muon:'miss', jet:true,
              desc:'lab.det.desc.jet' },
};
function labInitDetector(){
  const c = document.getElementById('detCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  LAB.det = { ctx, w, h, canvas:c, current: (LAB.det && LAB.det.current) || 'electron' };
  labRebuildDetectorPicker();
}
function labRebuildDetectorPicker(){
  if(!LAB || !LAB.det) return;
  const dict = LOCALES[window.CURRENT_LANG||'en'] || LOCALES.en;
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  const picker = document.getElementById('detPicker');
  if(picker){
    picker.innerHTML = '';
    Object.keys(DET_PARTICLES).forEach(k=>{
      const P = DET_PARTICLES[k];
      const b = document.createElement('button');
      b.innerHTML = `<b style="color:${P.color}">${P.label}</b> · ${t(P.role)}`;
      if(k===LAB.det.current) b.classList.add('active');
      b.onclick = ()=>{
        LAB.det.current = k;
        picker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
      };
      picker.appendChild(b);
    });
  }
  const leg = document.getElementById('detLegend');
  if(leg){
    leg.innerHTML = DET_LAYERS.map(L=>
      `<span class="ll-item"><i class="bar" style="background:${L.ring};color:${L.ring}"></i>${t(L.i18n)}</span>`
    ).join('');
  }
}
function labDrawDetector(){
  const S = LAB.det; if(!S) return;
  const { ctx, w, h } = S;
  const dict = LOCALES[window.CURRENT_LANG||'en'] || LOCALES.en;
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  ctx.clearRect(0,0,w,h);
  const cx = w/2, cy = h/2;
  const maxR = Math.max(30, Math.min(w,h)/2 - 12);
  const scale = maxR / 195;

  // 1) draw layers (fills + rings)
  for(let i=DET_LAYERS.length-1;i>=0;i--){
    const L = DET_LAYERS[i];
    ctx.fillStyle = L.fill;
    ctx.beginPath(); ctx.arc(cx,cy,L.r1*scale,0,Math.PI*2); ctx.fill();
  }
  DET_LAYERS.forEach(L=>{
    ctx.strokeStyle = L.ring; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx,cy,L.r1*scale,0,Math.PI*2); ctx.stroke();
  });
  // Layer name labels (top arc)
  ctx.fillStyle='#8b93b3'; ctx.font='9px JetBrains Mono, monospace'; ctx.textAlign='center';
  DET_LAYERS.forEach(L=>{
    const rMid=(L.r0+L.r1)/2*scale;
    if(rMid>10) ctx.fillText(t(L.i18n), cx, cy - rMid + 3);
  });

  // 2) magnetic-field indicator (⊙ = out of page)
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='left';
  ctx.fillText('B ⊙  '+t('lab.det.bfield'), 10, h-10);

  // 3) collision point
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();

  // 4) draw particle signature
  const P = DET_PARTICLES[S.current];
  const baseAng = (labT*0.35) % (Math.PI*2);
  // Jets: 5 collimated constituents inside a narrow ΔR≈0.4 cone.
  // Non-jets: single particle at baseAng.
  const jetHalfCone = 0.22; // ~13°, matches typical anti-kT jet radius
  const angles = P.jet
    ? [-1, -0.5, 0, 0.5, 1].map(k => baseAng + k * jetHalfCone * 0.75)
    : [baseAng];
  // Per-constituent color variation for readability
  const jetShades = ['#c39bff','#a97fe8','#d9b6ff','#8f66d6','#e0c8ff'];

  angles.forEach((ang, ai)=>{
    // For jets, each constituent gets its own shade + much narrower shower footprint
    const trkColor = P.jet ? jetShades[ai % jetShades.length] : P.color;
    const ecalHW = P.jet ? 0.055 : 0.28;
    const hcalHW = P.jet ? 0.075 : 0.45;
    const ecalCols = P.jet ? 3 : 7;
    const hcalCols = P.jet ? 3 : 9;
    // ---- TRACKER: helical curve (charged only, bent by B-field) ----
    if(P.charged){
      const R0 = 24*scale, R1 = 70*scale;
      const bend = P.jet ? (0.25 + (ai-2)*0.06) : 0.5; // slightly different curvature per constituent
      ctx.strokeStyle = trkColor; ctx.lineWidth = P.jet ? 1.3 : 1.8;
      ctx.beginPath();
      let lastX, lastY, lastAng2;
      for(let tt=0; tt<=1; tt+=0.02){
        const r = R0 + (R1-R0)*tt;
        const ang2 = ang + bend*tt;
        const x = cx + Math.cos(ang2)*r;
        const y = cy + Math.sin(ang2)*r;
        if(tt===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        lastX=x; lastY=y; lastAng2=ang2;
      }
      ctx.stroke();
      // hit dots along the tracker (silicon strips fire)
      ctx.fillStyle = trkColor;
      for(let tt=0.15; tt<=1; tt+=0.2){
        const r = R0 + (R1-R0)*tt;
        const ang2 = ang + bend*tt;
        ctx.beginPath(); ctx.arc(cx+Math.cos(ang2)*r, cy+Math.sin(ang2)*r, P.jet?1.4:2, 0, Math.PI*2); ctx.fill();
      }
      // arrowhead showing exit direction from tracker
      if(ai===0 && !P.jet){
        const tanAng = lastAng2 + Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(lastX + Math.cos(lastAng2)*6, lastY + Math.sin(lastAng2)*6);
        ctx.lineTo(lastX - Math.cos(lastAng2)*3 + Math.cos(tanAng)*4, lastY - Math.sin(lastAng2)*3 + Math.sin(tanAng)*4);
        ctx.lineTo(lastX - Math.cos(lastAng2)*3 - Math.cos(tanAng)*4, lastY - Math.sin(lastAng2)*3 - Math.sin(tanAng)*4);
        ctx.closePath(); ctx.fillStyle=P.color; ctx.fill();
      }
    }
    // Neutrals leave a dashed "invisible" line in the tracker
    if(!P.charged && P.ecalShower==='none' && P.hcalShower==='none'){
      // pure neutrino
      ctx.strokeStyle = P.color; ctx.lineWidth=1.3; ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang)*8, cy + Math.sin(ang)*8);
      ctx.lineTo(cx + Math.cos(ang)*195*scale, cy + Math.sin(ang)*195*scale);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if(!P.charged){
      // photon or neutron: straight dashed line only to their absorbing calorimeter
      ctx.strokeStyle = P.color; ctx.lineWidth=1.2; ctx.setLineDash([3,3]);
      const rEnd = P.hcalShower==='had' ? 140*scale : 100*scale;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang)*8, cy + Math.sin(ang)*8);
      ctx.lineTo(cx + Math.cos(ang)*rEnd, cy + Math.sin(ang)*rEnd);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ---- ECAL: draw as segmented cells that get "hit" ----
    const angOut = ang + (P.charged ? (P.jet ? 0.25 : 0.5) : 0);
    const ecR0 = 70*scale, ecR1 = 100*scale;
    if(P.ecalShower === 'em'){
      drawCalCells(ctx, cx, cy, ecR0, ecR1, angOut, ecalHW, trkColor, 'em', ecalCols);
      if(!P.jet) labelHit(ctx, cx, cy, (ecR0+ecR1)/2 + 18, angOut, P.color, t('lab.det.hit.em'));
    } else if(P.ecalShower === 'mip'){
      drawCalCells(ctx, cx, cy, ecR0, ecR1, angOut, 0.06, trkColor, 'mip', 2);
    }

    // ---- HCAL: hadronic shower is broader + deeper ----
    const hcR0 = 100*scale, hcR1 = 140*scale;
    const angH = ang + (P.charged ? (P.jet ? 0.35 : 0.7) : 0);
    if(P.hcalShower === 'had'){
      drawCalCells(ctx, cx, cy, hcR0, hcR1, angH, hcalHW, trkColor, 'had', hcalCols);
      if(!P.jet) labelHit(ctx, cx, cy, (hcR0+hcR1)/2 + 22, angH, P.color, t('lab.det.hit.had'));
    } else if(P.hcalShower === 'mip'){
      drawCalCells(ctx, cx, cy, hcR0, hcR1, angH, 0.06, trkColor, 'mip', 2);
    }

    // ---- MUON CHAMBERS ----
    if(P.muon === 'hit'){
      const angM = ang + (P.charged ? 0.9 : 0);
      // straight extension of the track (muons barely bend at outer radii due to return field)
      ctx.strokeStyle = P.color; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angM)*150*scale, cy + Math.sin(angM)*150*scale);
      ctx.lineTo(cx + Math.cos(angM)*195*scale, cy + Math.sin(angM)*195*scale);
      ctx.stroke();
      // Two "hits" in muon stations
      [165, 185].forEach(rr=>{
        const hx = cx + Math.cos(angM)*rr*scale;
        const hy = cy + Math.sin(angM)*rr*scale;
        ctx.fillStyle = P.color;
        ctx.beginPath(); ctx.arc(hx,hy,3,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = P.color; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(hx,hy,6,0,Math.PI*2); ctx.stroke();
      });
      labelHit(ctx, cx, cy, 200*scale, angM, P.color, t('lab.det.hit.muon'));
    }
  });

  // ---- Special: neutrino → missing energy indicator on the opposite side ----
  if(S.current==='neutrino'){
    const oppAng = baseAng + Math.PI;
    ctx.strokeStyle='#8fa8ff'; ctx.lineWidth=1.4; ctx.setLineDash([2,4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(oppAng)*maxR*0.5, cy + Math.sin(oppAng)*maxR*0.5);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#8fa8ff'; ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText(t('lab.det.missing'), cx + Math.cos(oppAng)*maxR*0.55, cy + Math.sin(oppAng)*maxR*0.55);
  }

  // ---- Jet cone: draw as a wedge outline that hugs the calorimeters ----
  if(P.jet){
    const midAng = baseAng;
    const innerR = 22*scale;
    const outerR = 140*scale;
    // two radial edges of the cone
    ctx.strokeStyle = 'rgba(195,155,255,0.55)'; ctx.setLineDash([3,3]); ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(midAng-jetHalfCone)*innerR, cy + Math.sin(midAng-jetHalfCone)*innerR);
    ctx.lineTo(cx + Math.cos(midAng-jetHalfCone)*outerR, cy + Math.sin(midAng-jetHalfCone)*outerR);
    ctx.moveTo(cx + Math.cos(midAng+jetHalfCone)*innerR, cy + Math.sin(midAng+jetHalfCone)*innerR);
    ctx.lineTo(cx + Math.cos(midAng+jetHalfCone)*outerR, cy + Math.sin(midAng+jetHalfCone)*outerR);
    ctx.stroke();
    // closing arc at the outer radius
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 4, midAng - jetHalfCone, midAng + jetHalfCone);
    ctx.stroke();
    ctx.setLineDash([]);
    // single label outside the cone
    const labR = maxR + 4;
    ctx.fillStyle = '#c39bff'; ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t('lab.det.jet.cone'), cx + Math.cos(midAng)*labR, cy + Math.sin(midAng)*labR);
    ctx.textBaseline = 'alphabetic';
  }

  // ---- Headline caption + description ----
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif';
  ctx.textAlign='left';
  ctx.fillText(`${P.label}  ·  ${t(P.role)}`, 12, 20);
  ctx.fillStyle='#c8cff0'; ctx.font='11px Space Grotesk, sans-serif';
  wrapText(ctx, t(P.desc), 12, 38, w-24, 14);
}
// Draw ~N segmented calorimeter cells that light up in an arc; density controls
// how "hot" (many cells) vs "cool" (few cells) the shower is.
function drawCalCells(ctx, cx, cy, r0, r1, ang, halfWidth, color, kind, colsOverride){
  const cellRad = kind==='had' ? 6 : 5;
  const rows = kind==='mip' ? 1 : 3;
  const cols = colsOverride != null ? colsOverride : (kind==='mip' ? 2 : (kind==='had' ? 9 : 7));
  const angSpread = halfWidth*2;
  for(let iRow=0; iRow<rows; iRow++){
    const r = r0 + ((iRow+0.5)/rows)*(r1-r0);
    for(let iCol=0; iCol<cols; iCol++){
      // Intensity — brighter toward the shower centre
      const centrality = 1 - Math.abs((iCol/(cols-1||1))-0.5)*2;
      const rowFactor = 1 - iRow/rows*0.4;
      const alpha = (kind==='mip' ? 0.4 : 0.35 + centrality*0.55) * rowFactor;
      const angC = ang - halfWidth + (iCol/(cols-1||1))*angSpread;
      const x = cx + Math.cos(angC)*r;
      const y = cy + Math.sin(angC)*r;
      // cell rectangle rotated to face outward
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angC + Math.PI/2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(-cellRad, -cellRad*0.7, cellRad*2, cellRad*1.4);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-cellRad, -cellRad*0.7, cellRad*2, cellRad*1.4);
      ctx.restore();
    }
  }
}
function labelHit(ctx, cx, cy, r, ang, color, txt){
  const x = cx + Math.cos(ang)*r, y = cy + Math.sin(ang)*r;
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono, monospace';
  // put label away from centre so it doesn't overlap the shower
  const outward = ang;
  ctx.textAlign = Math.cos(outward) >= 0 ? 'left' : 'right';
  ctx.fillText(txt, x + Math.cos(outward)*3, y + Math.sin(outward)*3);
  ctx.textAlign = 'left';
}
function wrapText(ctx, text, x, y, maxW, lineH){
  const words = String(text).split(/\s+/);
  let line = '', ly = y;
  for(const w of words){
    const test = line ? line+' '+w : w;
    if(ctx.measureText(test).width > maxW && line){
      ctx.fillText(line, x, ly); line = w; ly += lineH;
    } else line = test;
  }
  if(line) ctx.fillText(line, x, ly);
}

/* ---------- Demo 3: Higgs field lattice ---------- */
// The vacuum is a lattice of oscillators; particles fly through and "drag" the field.
// Coupling strength (proxy for mass) sets how much each particle disturbs the lattice.
const HIGGS_PARTICLES = [
  { id:'photon', label:'γ (photon)',    role:'lab.higgs.role.photon', color:'#ffd166', coupling:0.0,   mass:'0',    note:'lab.higgs.note.photon' },
  { id:'electron', label:'e⁻ (electron)',    role:'lab.higgs.role.electron', color:'#4ea8ff', coupling:0.05,   mass:'0.511 MeV',    note:'lab.higgs.note.electron' },
  { id:'muon', label:'μ⁻ (muon)',    role:'lab.higgs.role.muon', color:'#7ee8c5', coupling:0.35,   mass:'106 MeV',    note:'lab.higgs.note.muon' },
  { id:'tau', label:'τ⁻ (tau)',    role:'lab.higgs.role.tau', color:'#c39bff', coupling:0.6,   mass:'1.78 GeV',    note:'lab.higgs.note.tau' },
  { id:'W', label:'W± (W boson)',    role:'lab.higgs.role.W', color:'#5aa8ff', coupling:0.85,   mass:'80.4 GeV',    note:'lab.higgs.note.W' },
  { id:'top', label:'t (top quark)',    role:'lab.higgs.role.top', color:'#ff5c8a', coupling:1.0,   mass:'173 GeV',    note:'lab.higgs.note.top' },
];
function labInitHiggs(){
  const c = document.getElementById('higgsCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  const keep = (LAB.higgs && LAB.higgs.current) || 'electron';
  LAB.higgs = { ctx, w, h, canvas:c, current:keep, fires:[] };
  // lattice offsets (persistent per site) — for the "drag" effect
  const cols = 40, rows = 14;
  const gridX = w/cols, gridY = h/rows;
  const sites = [];
  for(let iy=0;iy<rows;iy++) for(let ix=0;ix<cols;ix++){
    sites.push({ x:(ix+0.5)*gridX, y:(iy+0.5)*gridY, ox:0, oy:0, phase:Math.random()*Math.PI*2 });
  }
  LAB.higgs.sites = sites;
  LAB.higgs.gridX = gridX; LAB.higgs.gridY = gridY;

  labRebuildHiggsPicker();
  // Auto-fire the first one so users see motion immediately
  const P0 = HIGGS_PARTICLES.find(p=>p.id===LAB.higgs.current);
  LAB.higgs.fires.push({ P:P0, x:-20, y:h/2, t:0 });
}
function labRebuildHiggsPicker(){
  if(!LAB || !LAB.higgs) return;
  const picker = document.getElementById('higgsPicker');
  if(!picker) return;
  picker.innerHTML = '';
  HIGGS_PARTICLES.forEach(P=>{
    const b = document.createElement('button');
    b.innerHTML = `<b style="color:${P.color}">${P.label}</b> · ${P.mass}`;
    if(P.id===LAB.higgs.current) b.classList.add('active');
    b.onclick = ()=>{
      LAB.higgs.current = P.id;
      picker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      LAB.higgs.fires.push({ P, x:-20, y:LAB.higgs.h/2 + (Math.random()-0.5)*40, t:0 });
    };
    picker.appendChild(b);
  });
}
function labDrawHiggs(){
  const S = LAB.higgs; if(!S) return;
  const { ctx, w, h, sites } = S;
  const dict = LOCALES[window.CURRENT_LANG||'en'] || LOCALES.en;
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  ctx.clearRect(0,0,w,h);
  // dim purple background
  const bg = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)/1.4);
  bg.addColorStop(0,'rgba(60,20,90,0.35)');
  bg.addColorStop(1,'rgba(3,5,16,1)');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

  // Update lattice: each site oscillates and gets pushed by any nearby particle proportional to coupling.
  sites.forEach(s=>{
    s.ox *= 0.88; s.oy *= 0.88;
    s.ox += Math.cos(labT*2 + s.phase)*0.05;
    s.oy += Math.sin(labT*2 + s.phase)*0.05;
  });
  for(let i=S.fires.length-1;i>=0;i--){
    const f = S.fires[i];
    const speed = f.P.coupling===0 ? 6 : 6 - f.P.coupling*3.5;
    f.x += speed; f.t += 0.016;
    if(f.P.coupling > 0){
      sites.forEach(s=>{
        const dx = s.x - f.x, dy = s.y - f.y;
        const d2 = dx*dx + dy*dy;
        if(d2 < 3600){
          const d = Math.sqrt(d2)+0.1;
          const push = (f.P.coupling * 12) / d;
          s.ox += (dx/d) * push * 0.15;
          s.oy += (dy/d) * push * 0.15;
        }
      });
    }
    if(f.x > w+30) S.fires.splice(i,1);
  }

  ctx.strokeStyle='rgba(195,155,255,0.20)';
  ctx.lineWidth = 0.6;
  const cols = Math.round(w / S.gridX);
  const rows = Math.round(h / S.gridY);
  ctx.beginPath();
  for(let iy=0;iy<rows;iy++){
    for(let ix=0;ix<cols;ix++){
      const s = sites[iy*cols+ix]; if(!s) continue;
      const rx = ix<cols-1 ? sites[iy*cols+ix+1] : null;
      const dy2 = iy<rows-1 ? sites[(iy+1)*cols+ix] : null;
      if(rx){ ctx.moveTo(s.x+s.ox, s.y+s.oy); ctx.lineTo(rx.x+rx.ox, rx.y+rx.oy); }
      if(dy2){ ctx.moveTo(s.x+s.ox, s.y+s.oy); ctx.lineTo(dy2.x+dy2.ox, dy2.y+dy2.oy); }
    }
  }
  ctx.stroke();
  ctx.fillStyle='rgba(195,155,255,0.55)';
  sites.forEach(s=>{
    ctx.beginPath(); ctx.arc(s.x+s.ox, s.y+s.oy, 1.2, 0, Math.PI*2); ctx.fill();
  });

  S.fires.forEach(f=>{
    if(f.P.coupling>0){
      const wakeGrad = ctx.createLinearGradient(f.x-60, f.y, f.x, f.y);
      wakeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      wakeGrad.addColorStop(1, f.P.color + '80');
      ctx.strokeStyle = wakeGrad; ctx.lineWidth = 2 + f.P.coupling*6;
      ctx.beginPath(); ctx.moveTo(f.x-60, f.y); ctx.lineTo(f.x, f.y); ctx.stroke();
    }
    const g = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,14);
    g.addColorStop(0,'#fff'); g.addColorStop(0.5,f.P.color); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(f.P.label.split(' ')[0], f.x, f.y);
    ctx.textBaseline='alphabetic';
  });

  const P = HIGGS_PARTICLES.find(p=>p.id===S.current);
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif'; ctx.textAlign='left';
  ctx.fillText(`${P.label}  ·  ${t('lab.higgs.mass')}: ${P.mass}`, 12, 20);
  ctx.fillStyle='#c8cff0'; ctx.font='11px Space Grotesk, sans-serif';
  wrapText(ctx, t(P.note), 12, 38, w-24, 14);
  ctx.fillStyle='#8b93b3'; ctx.font='11px JetBrains Mono, monospace';
  ctx.fillText(`${t('lab.higgs.yukawa')} ≈ ${P.coupling.toFixed(2)}`, 12, h-10);
}

/* ---------- Demo 4: Feynman diagram builder ---------- */
// Vertex types. Each has: allowed particles on the 3 legs, coupling, rule key.
var FEYN_VERTICES = {
  qed: { color:'#ffd166', boson:'photon', legs:['f','γ','f̄'], ruleKey:'lab.feyn.rule.qed', label:'√α',   nameKey:'lab.feyn.vtx.qed' },
  qcd: { color:'#5aa8ff', boson:'gluon',  legs:['q','g','q̄'], ruleKey:'lab.feyn.rule.qcd', label:'√α_s', nameKey:'lab.feyn.vtx.qcd' },
  wcc: { color:'#ff6b9d', boson:'W',      legs:['ℓ','W','ν'], ruleKey:'lab.feyn.rule.wcc', label:'g_W',  nameKey:'lab.feyn.vtx.wcc' },
  wnc: { color:'#7ee8c5', boson:'Z',      legs:['f','Z','f̄'], ruleKey:'lab.feyn.rule.wnc', label:'g_Z',  nameKey:'lab.feyn.vtx.wnc' },
};
function labInitFeyn(){
  const c = document.getElementById('feynCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  const prev = LAB.feyn || {};
  LAB.feyn = { ctx, w, h, canvas:c, current:prev.current||'qed', vertices:prev.vertices||[], edges:prev.edges||[] };
  // click to place vertex
  c.onclick = (ev)=>{
    const r = c.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    const V = LAB.feyn;
    const vId = V.vertices.length;
    V.vertices.push({ id:vId, type:V.current, x, y });
    // auto-connect: if there is a previous vertex of a *compatible* type, add a boson propagator
    if(V.vertices.length>=2){
      const prev = V.vertices[V.vertices.length-2];
      // same-boson: internal boson propagator connects them; otherwise no auto-edge
      if(FEYN_VERTICES[prev.type].boson === FEYN_VERTICES[V.current].boson){
        V.edges.push({ a:prev.id, b:vId, kind:'boson', boson:FEYN_VERTICES[V.current].boson });
      }
    }
  };
  labRebuildFeynPicker();
  const clr = document.getElementById('feynClear');
  if(clr) clr.onclick = ()=>{ LAB.feyn.vertices = []; LAB.feyn.edges = []; };
  const ex = document.getElementById('feynExample');
  if(ex) ex.onclick = ()=>{
    // e-e+ → γ → μ-μ+ : two QED vertices connected by a photon propagator
    LAB.feyn.current = 'qed';
    LAB.feyn.vertices = [
      { id:0, type:'qed', x:w*0.30, y:h*0.55 },
      { id:1, type:'qed', x:w*0.70, y:h*0.55 },
    ];
    LAB.feyn.edges = [ { a:0, b:1, kind:'boson', boson:'photon' } ];
    labRebuildFeynPicker();
  };
}
function labRebuildFeynPicker(){
  if(!LAB || !LAB.feyn) return;
  const dict = LOCALES[window.CURRENT_LANG||'en'] || LOCALES.en;
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  const picker = document.getElementById('feynPicker');
  if(picker){
    picker.innerHTML = '';
    Object.keys(FEYN_VERTICES).forEach(k=>{
      const V = FEYN_VERTICES[k];
      const b = document.createElement('button');
      b.innerHTML = `<b style="color:${V.color}">${V.label}</b> · ${t(V.nameKey)}`;
      if(k===LAB.feyn.current) b.classList.add('active');
      b.onclick = ()=>{
        LAB.feyn.current = k;
        picker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
      };
      picker.appendChild(b);
    });
  }
  const leg = document.getElementById('feynLegend');
  if(leg){
    leg.innerHTML = `
      <span class="ll-item"><i class="bar" style="background:#c8cff0;color:#c8cff0"></i>${t('lab.feyn.legend.fermion')}</span>
      <span class="ll-item"><i class="bar" style="background:#ffd166;color:#ffd166"></i>${t('lab.feyn.legend.photon')}</span>
      <span class="ll-item"><i class="bar" style="background:#5aa8ff;color:#5aa8ff"></i>${t('lab.feyn.legend.gluon')}</span>
      <span class="ll-item"><i class="bar" style="background:#ff6b9d;color:#ff6b9d"></i>${t('lab.feyn.legend.wz')}</span>`;
  }
}
function drawWavy(ctx, x1,y1,x2,y2, color){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy);
  const N = Math.max(6, Math.floor(L/8));
  const amp = 4;
  ctx.strokeStyle=color; ctx.lineWidth=1.6;
  ctx.beginPath();
  for(let i=0;i<=N;i++){
    const s = i/N;
    const px = x1+dx*s, py=y1+dy*s;
    const nx = -dy/L, ny = dx/L;
    const off = Math.sin(s*Math.PI*8) * amp;
    if(i===0) ctx.moveTo(px+nx*off, py+ny*off);
    else ctx.lineTo(px+nx*off, py+ny*off);
  }
  ctx.stroke();
}
function drawSpiral(ctx, x1,y1,x2,y2, color){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy);
  const N = Math.max(20, Math.floor(L/4));
  const amp = 5;
  ctx.strokeStyle=color; ctx.lineWidth=1.4;
  ctx.beginPath();
  for(let i=0;i<=N;i++){
    const s = i/N;
    const px = x1+dx*s, py=y1+dy*s;
    const nx = -dy/L, ny = dx/L;
    const phase = s*Math.PI*14;
    const ox = Math.cos(phase)*amp, oy = Math.sin(phase)*amp;
    // spiral: displace along both normal and tangent
    if(i===0) ctx.moveTo(px+nx*ox, py+ny*ox + oy*0.3);
    else ctx.lineTo(px+nx*ox, py+ny*ox + oy*0.3);
  }
  ctx.stroke();
}
function drawDashed(ctx, x1,y1,x2,y2, color){
  ctx.strokeStyle=color; ctx.lineWidth=1.6; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
}
function drawFermionArrow(ctx, x1,y1,x2,y2, color){
  ctx.strokeStyle=color; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  // arrowhead at midpoint
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const a = Math.atan2(y2-y1, x2-x1);
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(mx+Math.cos(a)*6, my+Math.sin(a)*6);
  ctx.lineTo(mx+Math.cos(a+2.6)*6, my+Math.sin(a+2.6)*6);
  ctx.lineTo(mx+Math.cos(a-2.6)*6, my+Math.sin(a-2.6)*6);
  ctx.closePath(); ctx.fill();
}
function labDrawFeyn(){
  const S = LAB.feyn; if(!S) return;
  const { ctx, w, h } = S;
  const dict = LOCALES[window.CURRENT_LANG||'en'] || LOCALES.en;
  const t = (k)=> dict[k] || LOCALES.en[k] || k;
  ctx.clearRect(0,0,w,h);
  // dim graph paper background
  ctx.strokeStyle='rgba(78,168,255,0.05)'; ctx.lineWidth=1;
  for(let x=0;x<w;x+=24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=24){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  // time axis label (left→right by convention)
  ctx.fillStyle='#8b93b3'; ctx.font='10px JetBrains Mono, monospace';
  ctx.textAlign='left'; ctx.fillText('time →', 8, h-8);

  // Boson propagators between vertices
  S.edges.forEach(e=>{
    const A = S.vertices[e.a], B = S.vertices[e.b];
    if(!A||!B) return;
    if(e.boson==='photon') drawWavy(ctx, A.x,A.y, B.x,B.y, '#ffd166');
    else if(e.boson==='gluon') drawSpiral(ctx, A.x,A.y, B.x,B.y, '#5aa8ff');
    else drawDashed(ctx, A.x,A.y, B.x,B.y, '#ff6b9d');
  });

  // External fermion lines out of each vertex (2 per QED/QCD/Z, 2 for W)
  S.vertices.forEach(V=>{
    const spec = FEYN_VERTICES[V.type];
    // Two external fermion stubs, up-left and down-left (or right if last vertex)
    const isLast = S.vertices[S.vertices.length-1] === V;
    const dx = isLast ? 50 : -50;
    drawFermionArrow(ctx, V.x+dx, V.y-40, V.x, V.y, '#c8cff0');
    drawFermionArrow(ctx, V.x, V.y, V.x+dx, V.y+40, '#c8cff0');
    // vertex dot
    ctx.fillStyle = spec.color;
    ctx.beginPath(); ctx.arc(V.x, V.y, 5, 0, Math.PI*2); ctx.fill();
    // vertex coupling label
    ctx.fillStyle = spec.color; ctx.font='bold 11px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.fillText(spec.label, V.x, V.y-10);
  });

  // Header + rules panel
  const cur = FEYN_VERTICES[S.current];
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif'; ctx.textAlign='left';
  ctx.fillText(t(cur.nameKey), 10, 20);
  ctx.fillStyle='#c8cff0'; ctx.font='11px Space Grotesk, sans-serif';
  wrapText(ctx, t(cur.ruleKey), 10, 38, w-20, 14);
  // vertex count
  ctx.fillStyle='#8b93b3'; ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='right';
  ctx.fillText(t('lab.feyn.count').replace('{n}', S.vertices.length), w-10, h-8);
}

/* ---------- Demo 5: Decay chain sandbox ---------- */
// Simplified PDG-ish decay table. Each key → list of channels with br (branching ratio)
// and lifetime τ in seconds (used for scheduling animation).
// Daughters listed by symbol; those with an entry decay further, else are stable.
var DECAY_TABLE = {
  'μ⁻': { tau: 2.2e-6, channels:[
    { br:1.00, daughters:['e⁻','ν̄_e','ν_μ'] }
  ]},
  'τ⁻': { tau: 2.9e-13, channels:[
    { br:0.17, daughters:['e⁻','ν̄_e','ν_τ'] },
    { br:0.17, daughters:['μ⁻','ν̄_μ','ν_τ'] },
    { br:0.25, daughters:['π⁻','ν_τ'] },
    { br:0.41, daughters:['π⁻','π⁰','ν_τ'] },
  ]},
  'π⁺': { tau: 2.6e-8, channels:[
    { br:1.00, daughters:['μ⁺','ν_μ'] }
  ]},
  'π⁻': { tau: 2.6e-8, channels:[
    { br:1.00, daughters:['μ⁻','ν̄_μ'] }
  ]},
  'π⁰': { tau: 8.5e-17, channels:[
    { br:0.99, daughters:['γ','γ'] },
    { br:0.01, daughters:['e⁻','e⁺','γ'] },
  ]},
  'K⁺': { tau: 1.24e-8, channels:[
    { br:0.64, daughters:['μ⁺','ν_μ'] },
    { br:0.21, daughters:['π⁺','π⁰'] },
    { br:0.06, daughters:['π⁺','π⁺','π⁻'] },
    { br:0.09, daughters:['π⁰','e⁺','ν_e'] },
  ]},
  'n':  { tau: 880, channels:[
    { br:1.00, daughters:['p','e⁻','ν̄_e'] }
  ]},
  'μ⁺': { tau: 2.2e-6, channels:[{ br:1.00, daughters:['e⁺','ν_e','ν̄_μ'] }]},
  'μ⁺-alias':{ tau:2.2e-6, channels:[]}, // avoid future collisions
  'Z':  { tau: 2.6e-25, channels:[
    { br:0.20, daughters:['e⁻','e⁺'] },
    { br:0.20, daughters:['μ⁻','μ⁺'] },
    { br:0.20, daughters:['τ⁻','τ⁺'] },
    { br:0.40, daughters:['q','q̄'] },
  ]},
  'τ⁺': { tau: 2.9e-13, channels:[
    { br:0.35, daughters:['μ⁺','ν_μ','ν̄_τ'] },
    { br:0.65, daughters:['π⁺','π⁰','ν̄_τ'] }
  ]},
};
var DECAY_COLORS = {
  'e⁻':'#4ea8ff','e⁺':'#4ea8ff','μ⁻':'#7ee8c5','μ⁺':'#7ee8c5','τ⁻':'#c39bff','τ⁺':'#c39bff',
  'ν_e':'#8fa8ff','ν̄_e':'#8fa8ff','ν_μ':'#8fa8ff','ν̄_μ':'#8fa8ff','ν_τ':'#8fa8ff','ν̄_τ':'#8fa8ff',
  'γ':'#ffd166','π⁺':'#ff6b9d','π⁻':'#ff6b9d','π⁰':'#ffb0cf','K⁺':'#ff5c8a',
  'p':'#c8cff0','n':'#c8cff0','q':'#5aa8ff','q̄':'#5aa8ff','Z':'#ff6b9d'
};
var DECAY_STARTERS = ['τ⁻','K⁺','π⁺','μ⁻','π⁰','n','Z'];
function pickChannel(name){
  const T = DECAY_TABLE[name]; if(!T) return null;
  const r = Math.random(); let acc = 0;
  for(const c of T.channels){ acc += c.br; if(r<=acc) return c; }
  return T.channels[T.channels.length-1];
}
function labInitDecay(){
  const c = document.getElementById('decayCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  const prev = LAB.decay || {};
  LAB.decay = { ctx, w, h, canvas:c, current: prev.current || 'τ⁻', tree:null, speed:1 };
  labRebuildDecayPicker();
  const btn = document.getElementById('decayRestart');
  if(btn) btn.onclick = ()=> labDecayStart();
  const spd = document.getElementById('decaySpeed');
  if(spd){ spd.oninput = ()=>{ LAB.decay.speed = parseFloat(spd.value); }; LAB.decay.speed = parseFloat(spd.value)||1; }
  const leg = document.getElementById('decayLegend');
  if(leg){
    const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
    leg.textContent = dict['lab.decay.legend']||'';
  }
  labDecayStart();
}
function labRebuildDecayPicker(){
  if(!LAB || !LAB.decay) return;
  const picker = document.getElementById('decayPicker');
  if(!picker) return;
  picker.innerHTML='';
  DECAY_STARTERS.forEach(k=>{
    const b = document.createElement('button');
    b.innerHTML = `<b style="color:${DECAY_COLORS[k]||'#fff'}">${k}</b>`;
    if(k===LAB.decay.current) b.classList.add('active');
    b.onclick = ()=>{
      LAB.decay.current = k;
      picker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      labDecayStart();
    };
    picker.appendChild(b);
  });
  const leg = document.getElementById('decayLegend');
  if(leg){
    const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
    leg.textContent = dict['lab.decay.legend']||'';
  }
}
function labDecayStart(){
  if(!LAB.decay) return;
  // Build the tree eagerly, then reveal nodes progressively during draw.
  const now = performance.now();
  const root = { name: LAB.decay.current, born: now, revealAt: now, parent:null, children:[], depth:0 };
  const buildChildren = (node)=>{
    const T = DECAY_TABLE[node.name]; if(!T) return;
    const ch = pickChannel(node.name); if(!ch) return;
    // reveal delay compressed: log(τ) mapped into [400, 1400] ms
    const logTau = Math.log10(T.tau);
    const compressed = Math.max(300, Math.min(1600, 800 + logTau*80));
    ch.daughters.forEach((d,i)=>{
      const kid = { name:d, born:node.revealAt + compressed, revealAt: node.revealAt + compressed, parent:node, children:[], depth:node.depth+1, nBody: ch.daughters.length };
      node.children.push(kid);
      buildChildren(kid);
    });
  };
  buildChildren(root);
  LAB.decay.tree = root;
  LAB.decay.startTime = now;
}
function labDrawDecay(){
  const S = LAB.decay; if(!S||!S.tree) return;
  const { ctx, w, h } = S;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#050815'; ctx.fillRect(0,0,w,h);

  // layout: compute max revealed depth so far
  const now = performance.now();
  const elapsed = (now - S.startTime) * (S.speed||1);
  const virtualNow = S.startTime + elapsed;

  // collect visible nodes; assign x by depth, y by in-order-of-siblings across the tree
  const byDepth = [];
  const walk = (n)=>{
    if(virtualNow < n.revealAt) return;
    byDepth[n.depth] = byDepth[n.depth]||[];
    n._idx = byDepth[n.depth].length;
    byDepth[n.depth].push(n);
    n.children.forEach(walk);
  };
  walk(S.tree);

  const nCols = byDepth.length;
  const colW = w / Math.max(nCols, 5);
  byDepth.forEach((col, depth)=>{
    const cx = colW * (depth + 0.5);
    col.forEach((n, i)=>{
      const cy = h*(i+1)/(col.length+1);
      n._x = cx; n._y = cy;
    });
  });

  // Edges
  const walkEdges = (n)=>{
    if(virtualNow < n.revealAt) return;
    n.children.forEach(k=>{
      if(virtualNow >= k.revealAt){
        const dashed = (k.nBody===2);
        ctx.strokeStyle = 'rgba(139,147,179,0.6)';
        ctx.lineWidth = 1.3;
        if(dashed){ ctx.setLineDash([4,4]); } else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(n._x, n._y); ctx.lineTo(k._x, k._y);
        ctx.stroke();
        ctx.setLineDash([]);
        walkEdges(k);
      }
    });
  };
  walkEdges(S.tree);

  // Nodes
  const walkNodes = (n)=>{
    if(virtualNow < n.revealAt) return;
    // Node age since reveal
    const age = (virtualNow - n.revealAt) / 400; // 0..1 grow-in
    const g = Math.min(1, age);
    const T = DECAY_TABLE[n.name];
    const stable = !T;
    const c = DECAY_COLORS[n.name] || '#c8cff0';
    // node glow
    const gr = ctx.createRadialGradient(n._x, n._y, 0, n._x, n._y, 22*g);
    gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(n._x, n._y, 22*g, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle=c;
    ctx.beginPath(); ctx.arc(n._x, n._y, 8*g, 0, Math.PI*2); ctx.fill();
    // label
    ctx.fillStyle='#fff'; ctx.font='bold 11px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(n.name, n._x, n._y);
    ctx.textBaseline='alphabetic';
    // stability marker
    if(stable){
      const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
      ctx.fillStyle='#8b93b3'; ctx.font='9px JetBrains Mono, monospace';
      ctx.fillText(dict['lab.decay.stable']||'(stable)', n._x, n._y+18);
    }
    n.children.forEach(walkNodes);
  };
  walkNodes(S.tree);

  // Header
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif';
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  const T0 = DECAY_TABLE[S.current];
  const tau = T0 ? `τ ≈ ${T0.tau.toExponential(1)} s` : '';
  ctx.fillText(`${S.current}  ${tau}`, 12, 20);
}

/* ---------- Demo 6: Neutrino oscillation (3-flavour PMNS) ---------- */
// Approximate best-fit PMNS values (normal ordering, NuFit 5.x style).
// Angles in radians.
var OSC = {
  th12: 33.4 * Math.PI/180,
  th23: 49.2 * Math.PI/180,
  th13: 8.57 * Math.PI/180,
  dm21: 7.42e-5, // eV^2
  dm31: 2.51e-3, // eV^2
  logLE: 3.0,    // log10(L/E) with L in km, E in GeV
  source: 0,     // 0=e, 1=μ, 2=τ
};
function labInitOsc(){
  const c = document.getElementById('oscCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  LAB.osc = { ctx, w, h, canvas:c };
  const ctrls = document.getElementById('oscControls');
  if(ctrls && !ctrls.dataset.built){
    ctrls.dataset.built = '1';
    ctrls.innerHTML = `
      <div class="lab-slider"><label>θ₁₂ <span id="oscTh12v">${(OSC.th12*180/Math.PI).toFixed(1)}°</span></label><input type="range" id="oscTh12" min="0" max="90" step="0.1" value="${(OSC.th12*180/Math.PI).toFixed(1)}"></div>
      <div class="lab-slider"><label>θ₂₃ <span id="oscTh23v">${(OSC.th23*180/Math.PI).toFixed(1)}°</span></label><input type="range" id="oscTh23" min="0" max="90" step="0.1" value="${(OSC.th23*180/Math.PI).toFixed(1)}"></div>
      <div class="lab-slider"><label>θ₁₃ <span id="oscTh13v">${(OSC.th13*180/Math.PI).toFixed(1)}°</span></label><input type="range" id="oscTh13" min="0" max="45" step="0.1" value="${(OSC.th13*180/Math.PI).toFixed(1)}"></div>
      <div class="lab-slider"><label>Δm²₂₁ <span id="oscDm21v">${OSC.dm21.toExponential(1)}</span></label><input type="range" id="oscDm21" min="0.1" max="30" step="0.1" value="${(OSC.dm21*1e5).toFixed(1)}"></div>
      <div class="lab-slider"><label>Δm²₃₁ <span id="oscDm31v">${OSC.dm31.toExponential(1)}</span></label><input type="range" id="oscDm31" min="0.1" max="10" step="0.05" value="${(OSC.dm31*1e3).toFixed(2)}"></div>`;
    const bind = (id, fn)=>{ const el=document.getElementById(id); if(el) el.oninput=fn; };
    bind('oscTh12', e=>{ OSC.th12 = parseFloat(e.target.value)*Math.PI/180; document.getElementById('oscTh12v').textContent = parseFloat(e.target.value).toFixed(1)+'°'; });
    bind('oscTh23', e=>{ OSC.th23 = parseFloat(e.target.value)*Math.PI/180; document.getElementById('oscTh23v').textContent = parseFloat(e.target.value).toFixed(1)+'°'; });
    bind('oscTh13', e=>{ OSC.th13 = parseFloat(e.target.value)*Math.PI/180; document.getElementById('oscTh13v').textContent = parseFloat(e.target.value).toFixed(1)+'°'; });
    bind('oscDm21', e=>{ OSC.dm21 = parseFloat(e.target.value)*1e-5; document.getElementById('oscDm21v').textContent = OSC.dm21.toExponential(1); });
    bind('oscDm31', e=>{ OSC.dm31 = parseFloat(e.target.value)*1e-3; document.getElementById('oscDm31v').textContent = OSC.dm31.toExponential(1); });
  }
  labRebuildOscLegend();
}
function labRebuildOscLegend(){
  const leg = document.getElementById('oscLegend'); if(!leg) return;
  if(typeof OSC === 'undefined' || !OSC) return;
  const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
  const src = ['ν_e','ν_μ','ν_τ'][OSC.source];
  leg.innerHTML = `
    <span class="ll-item"><i class="bar" style="background:#4ea8ff;color:#4ea8ff"></i>P(${src}→ν_e)</span>
    <span class="ll-item"><i class="bar" style="background:#7ee8c5;color:#7ee8c5"></i>P(${src}→ν_μ)</span>
    <span class="ll-item"><i class="bar" style="background:#c39bff;color:#c39bff"></i>P(${src}→ν_τ)</span>
    <span class="ll-item" style="cursor:pointer" id="oscSrcToggle">🔄 ${dict['lab.osc.source']||'source flavour'}: ${src}</span>
    <div style="flex-basis:100%;color:#8b93b3;font-size:11px;margin-top:6px">${dict['lab.osc.legend']||''}</div>`;
  const tog = document.getElementById('oscSrcToggle');
  if(tog) tog.onclick = ()=>{ OSC.source = (OSC.source+1)%3; labRebuildOscLegend(); };
}
// Build PMNS matrix U (3x3, real, ignore CP phase for simplicity)
function pmns(){
  const c12=Math.cos(OSC.th12), s12=Math.sin(OSC.th12);
  const c23=Math.cos(OSC.th23), s23=Math.sin(OSC.th23);
  const c13=Math.cos(OSC.th13), s13=Math.sin(OSC.th13);
  return [
    [ c12*c13,          s12*c13,          s13 ],
    [ -s12*c23-c12*s23*s13, c12*c23-s12*s23*s13, s23*c13 ],
    [ s12*s23-c12*c23*s13, -c12*s23-s12*c23*s13, c23*c13 ]
  ];
}
// P(ν_α → ν_β) as a function of L/E (km/GeV) using standard vacuum formula:
// P = δ_αβ − 4 Σ_{i>j} U_αi U_βi U_αj U_βj sin²(1.27 Δm²_ij L/E)
function oscProb(alpha, beta, LoverE){
  const U = pmns();
  let P = (alpha===beta) ? 1 : 0;
  const dm = [ [0,OSC.dm21,OSC.dm31], [-OSC.dm21,0,OSC.dm31-OSC.dm21], [-OSC.dm31,-(OSC.dm31-OSC.dm21),0] ];
  for(let i=0;i<3;i++){
    for(let j=0;j<i;j++){
      const s = Math.sin(1.27 * dm[i][j] * LoverE);
      P -= 4 * U[alpha][i]*U[beta][i]*U[alpha][j]*U[beta][j] * s*s;
    }
  }
  return Math.max(0, Math.min(1, P));
}
function labDrawOsc(){
  const S = LAB.osc; if(!S) return;
  const { ctx, w, h } = S;
  ctx.clearRect(0,0,w,h);
  // axes area
  const padL=48, padR=12, padT=28, padB=32;
  const plotW = w-padL-padR, plotH = h-padT-padB;
  // background
  ctx.fillStyle='#050815'; ctx.fillRect(padL,padT,plotW,plotH);
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
  ctx.strokeRect(padL,padT,plotW,plotH);
  // x scale: log10(L/E) from 0 to 5 (i.e. L/E in 1..1e5 km/GeV)
  const xMin=0, xMax=5;
  const xToPx = (x)=> padL + (x-xMin)/(xMax-xMin) * plotW;
  const yToPx = (p)=> padT + (1-p)*plotH;
  // gridlines + labels
  ctx.fillStyle='#8b93b3'; ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='center';
  for(let x=0;x<=5;x++){
    const px = xToPx(x);
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(px,padT); ctx.lineTo(px,padT+plotH); ctx.stroke();
    ctx.fillStyle='#8b93b3';
    ctx.fillText(`10^${x}`, px, padT+plotH+14);
  }
  ctx.textAlign='right';
  for(let p=0;p<=1;p+=0.25){
    const py = yToPx(p);
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(padL,py); ctx.lineTo(padL+plotW,py); ctx.stroke();
    ctx.fillStyle='#8b93b3';
    ctx.fillText(p.toFixed(2), padL-4, py+3);
  }
  // axis labels
  ctx.fillStyle='#c8cff0'; ctx.font='11px Space Grotesk, sans-serif';
  ctx.textAlign='center';
  ctx.fillText('L / E   [km / GeV]', padL+plotW/2, h-6);
  ctx.save();
  ctx.translate(12, padT+plotH/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('P(oscillation)', 0, 0);
  ctx.restore();
  // Curves for e, μ, τ  appearance from OSC.source
  const colors = ['#4ea8ff','#7ee8c5','#c39bff'];
  for(let beta=0;beta<3;beta++){
    ctx.strokeStyle = colors[beta]; ctx.lineWidth=1.8;
    ctx.beginPath();
    for(let px=0; px<=plotW; px++){
      const xLog = xMin + px/plotW*(xMax-xMin);
      const LE = Math.pow(10, xLog);
      const P = oscProb(OSC.source, beta, LE);
      const py = yToPx(P);
      if(px===0) ctx.moveTo(padL+px, py); else ctx.lineTo(padL+px, py);
    }
    ctx.stroke();
  }
  // Header
  const src = ['ν_e','ν_μ','ν_τ'][OSC.source];
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif';
  ctx.textAlign='left'; ctx.fillText(`source: ${src}`, padL, 18);
}

/* ---------- Demo 7: Parton distribution functions ---------- */
var PDF = { logQ2: 1.0, showGluon: true }; // Q² = 10 GeV² default
function labInitPDF(){
  const c = document.getElementById('pdfCanvas'); if(!c) return;
  const { ctx, w, h } = labSizeCanvas(c);
  LAB.pdf = { ctx, w, h, canvas:c };
  const ctrls = document.getElementById('pdfControls');
  if(ctrls && !ctrls.dataset.built){
    ctrls.dataset.built='1';
    ctrls.innerHTML = `
      <div class="lab-slider"><label>log₁₀ Q² <span id="pdfQ2v">${PDF.logQ2.toFixed(2)}</span></label><input type="range" id="pdfQ2" min="0" max="4" step="0.05" value="${PDF.logQ2}"></div>
      <label class="switch"><input type="checkbox" id="pdfShowG" ${PDF.showGluon?'checked':''}><span data-i18n="lab.pdf.showg">show gluon (÷10)</span></label>`;
    document.getElementById('pdfQ2').oninput = (e)=>{ PDF.logQ2 = parseFloat(e.target.value); document.getElementById('pdfQ2v').textContent = PDF.logQ2.toFixed(2); };
    document.getElementById('pdfShowG').onchange = (e)=>{ PDF.showGluon = e.target.checked; };
  }
  labRebuildPDFLegend();
}
function labRebuildPDFLegend(){
  const leg = document.getElementById('pdfLegend'); if(!leg) return;
  const dict = LOCALES[window.CURRENT_LANG||'en']||LOCALES.en;
  leg.innerHTML = `
    <span class="ll-item"><i class="bar" style="background:#ff6b9d;color:#ff6b9d"></i>u_v (valence)</span>
    <span class="ll-item"><i class="bar" style="background:#4ea8ff;color:#4ea8ff"></i>d_v (valence)</span>
    <span class="ll-item"><i class="bar" style="background:#c39bff;color:#c39bff"></i>sea (ū+d̄+s+s̄)</span>
    <span class="ll-item"><i class="bar" style="background:#ffd166;color:#ffd166"></i>gluon g/10</span>
    <div style="flex-basis:100%;color:#8b93b3;font-size:11px;margin-top:6px">${dict['lab.pdf.legend']||''}</div>`;
}
// Toy parameterisation. x·f(x) at Q²:
//   x·u_v = A(Q²) · x^0.5 · (1-x)^3
//   x·d_v = 0.5 · x·u_v (roughly)
//   x·sea = S(Q²) · x^(-0.2) · (1-x)^7  (grows with Q²)
//   x·g   = G(Q²) · x^(-0.3) · (1-x)^5   (grows fastest at small x)
function pdfXf(name, x, logQ2){
  const q = logQ2;
  if(name==='uv'){ const A = 1.8 - 0.15*q; return Math.max(0, A) * Math.pow(x,0.5) * Math.pow(1-x,3); }
  if(name==='dv'){ const A = 0.9 - 0.10*q; return Math.max(0, A) * Math.pow(x,0.5) * Math.pow(1-x,4); }
  if(name==='sea'){ const S = 0.15 + 0.35*q; return S * Math.pow(x,-0.2) * Math.pow(1-x,7); }
  if(name==='g'){ const G = 0.6 + 1.2*q; return G * Math.pow(x,-0.3) * Math.pow(1-x,5); }
  return 0;
}
function labDrawPDF(){
  const S = LAB.pdf; if(!S) return;
  const { ctx, w, h } = S;
  ctx.clearRect(0,0,w,h);
  const padL=52, padR=16, padT=28, padB=32;
  const plotW = w-padL-padR, plotH = h-padT-padB;
  ctx.fillStyle='#050815'; ctx.fillRect(padL,padT,plotW,plotH);
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.strokeRect(padL,padT,plotW,plotH);
  // x on log scale: 1e-4 .. 1
  const xMinLog = -4, xMaxLog = 0;
  const yMax = 2.5;
  const xToPx = (lx)=> padL + (lx-xMinLog)/(xMaxLog-xMinLog)*plotW;
  const yToPx = (v)=> padT + (1 - Math.min(v,yMax)/yMax)*plotH;
  // grid + labels
  ctx.fillStyle='#8b93b3'; ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='center';
  for(let lx=xMinLog; lx<=xMaxLog; lx++){
    const px = xToPx(lx);
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(px,padT); ctx.lineTo(px,padT+plotH); ctx.stroke();
    ctx.fillStyle='#8b93b3';
    ctx.fillText(`10^${lx}`, px, padT+plotH+14);
  }
  ctx.textAlign='right';
  for(let v=0; v<=yMax; v+=0.5){
    const py=yToPx(v);
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(padL,py); ctx.lineTo(padL+plotW,py); ctx.stroke();
    ctx.fillStyle='#8b93b3';
    ctx.fillText(v.toFixed(1), padL-4, py+3);
  }
  // Axis labels
  ctx.fillStyle='#c8cff0'; ctx.font='11px Space Grotesk, sans-serif';
  ctx.textAlign='center'; ctx.fillText('x (momentum fraction)', padL+plotW/2, h-6);
  ctx.save(); ctx.translate(14, padT+plotH/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('x · f(x, Q²)', 0, 0); ctx.restore();
  // Curves
  const drawCurve = (name, color, div)=>{
    ctx.strokeStyle=color; ctx.lineWidth=1.9;
    ctx.beginPath();
    for(let px=0; px<=plotW; px++){
      const lx = xMinLog + px/plotW*(xMaxLog-xMinLog);
      const x = Math.pow(10, lx);
      const v = pdfXf(name, x, PDF.logQ2) / (div||1);
      const py = yToPx(v);
      if(px===0) ctx.moveTo(padL+px, py); else ctx.lineTo(padL+px, py);
    }
    ctx.stroke();
  };
  drawCurve('uv','#ff6b9d',1);
  drawCurve('dv','#4ea8ff',1);
  drawCurve('sea','#c39bff',1);
  if(PDF.showGluon) drawCurve('g','#ffd166',10);
  // Header
  ctx.fillStyle='#e8ecff'; ctx.font='bold 13px Space Grotesk, sans-serif';
  ctx.textAlign='left'; ctx.fillText(`Q² = ${Math.pow(10, PDF.logQ2).toFixed(1)} GeV²`, padL, 18);
}

/* ---------- Lab loop + tab hook ---------- */
function labLoop(){
  labT += 0.016;
  labDrawConfinement();
  labDrawDetector();
  labDrawHiggs();
  labDrawFeyn();
  labDrawDecay();
  labDrawOsc();
  labDrawPDF();
  labRAF = requestAnimationFrame(labLoop);
}
function labStart(){
  if(labRAF!=null) return;
  // (Re-)initialise every time we enter the tab to get proper sizes.
  labInitConfinement();
  labInitDetector();
  labInitHiggs();
  labInitFeyn();
  labInitDecay();
  labInitOsc();
  labInitPDF();
  labLoop();
}
function labStop(){ if(labRAF!=null){ cancelAnimationFrame(labRAF); labRAF=null; } }

document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    if(t.dataset.tab==='lab') labStart(); else labStop();
  });
});
// Lab sub-tabs (basics vs advanced)
document.querySelectorAll('.lab-subtab').forEach(b=>{
  b.addEventListener('click', ()=>{
    const key = b.dataset.labSub;
    document.querySelectorAll('.lab-subtab').forEach(x=>x.classList.toggle('active', x===b));
    document.querySelectorAll('[data-lab-sub-panel]').forEach(p=>{
      p.classList.toggle('active', p.dataset.labSubPanel===key);
    });
    // canvases in the newly-shown panel need a re-size (getBoundingClientRect is 0 while hidden)
    if(labRAF!=null){ labStop(); labStart(); }
  });
});
window.addEventListener('resize', ()=>{ if(labRAF!=null){ labStop(); labStart(); } });

// If lab is the initial tab (unlikely), start it.
if(document.querySelector('.tab.active')?.dataset.tab === 'lab') labStart();

/* ---- Fix Big Bang cross-link.  When served from particle-zoo/index.html,
   ../big-bang/index.html works.  When served from particle-zoo/mobile/
   (the built single-file bundle), we need ../../big-bang/index.html. */
function fixBigBangLink(){
  const a = document.getElementById('bigBangLink'); if(!a) return;
  const inMobile = /\/mobile\/(?:[^/]*)?$/i.test(location.pathname);
  a.setAttribute('href', inMobile ? '../../big-bang/index.html' : '../big-bang/index.html');
}
fixBigBangLink();
