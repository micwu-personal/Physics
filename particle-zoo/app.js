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
  return m.replace(/\/c²$/, '').replace(/ MeV/,' MeV').replace(/ GeV/,' GeV').replace(/ eV/,' eV');
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
   Group quarks in triplets: prefer proton (uud), neutron (udd), else Δ.
   Remaining quarks left "free" and warned about confinement.
   Extra electrons orbit the atom shell.
*/
let buildViz = { particles:[], nucleons:[], atomR:0, cx:0, cy:0 };

function buildComposites(){
  const u = parts.filter(x=>x==='u').length;
  const d = parts.filter(x=>x==='d').length;
  const e = parts.filter(x=>x==='e').length;

  // Greedy: form protons first (2u+1d), then neutrons (1u+2d), then Δ⁺⁺ (uuu), Δ⁻ (ddd), else leftover
  let uL=u, dL=d;
  const nucleons = [];
  // proton
  while(uL>=2 && dL>=1){ nucleons.push({kind:'proton', q:[ 'u','u','d' ]}); uL-=2; dL-=1; }
  // neutron
  while(uL>=1 && dL>=2){ nucleons.push({kind:'neutron', q:[ 'u','d','d' ]}); uL-=1; dL-=2; }
  // Δ⁺⁺
  while(uL>=3){ nucleons.push({kind:'delta++', q:['u','u','u']}); uL-=3; }
  // Δ⁻
  while(dL>=3){ nucleons.push({kind:'delta-', q:['d','d','d']}); dL-=3; }
  const leftoverQuarks = [];
  for(let i=0;i<uL;i++) leftoverQuarks.push('u');
  for(let i=0;i<dL;i++) leftoverQuarks.push('d');

  // Position nucleons in cluster (nucleus)
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
    n.r = 30; // radius of nucleon shell
    // Place 3 quarks inside triangle
    n.q.forEach((ch,qi)=>{
      const qa = (qi/3)*Math.PI*2 - Math.PI/2;
      n.quarkPos = n.quarkPos || [];
      n.quarkPos.push({
        type: ch,
        x: n.x + Math.cos(qa)*13,
        y: n.y + Math.sin(qa)*13
      });
    });
  });

  // Electrons orbit outside nucleus
  const atomR = N>0 ? Math.max(nucR + 90, 120) : 0;
  const electrons = [];
  for(let i=0;i<e;i++){
    if(N>0){
      const a = (i/Math.max(e,1))*Math.PI*2;
      electrons.push({ x: cx + Math.cos(a)*atomR, y: cy + Math.sin(a)*atomR, orbitA:a, orbitR:atomR + (Math.floor(i/8))*30 });
    } else {
      // just scatter
      electrons.push({ x: cx + (Math.random()-0.5)*200, y: cy + (Math.random()-0.5)*200, free:true });
    }
  }

  // Leftover free quarks — draw with warning glow
  const freeQuarks = leftoverQuarks.map((t,i)=>{
    const a = (i/Math.max(leftoverQuarks.length,1))*Math.PI*2;
    return { type:t, x: cx + Math.cos(a)*80 + 200, y: cy + Math.sin(a)*80, free:true };
  });

  buildViz = { nucleons, electrons, freeQuarks, cx, cy, nucR, atomR, N, e, u, d,
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
  const {nucleons, electrons, freeQuarks, u, d, e} = buildViz;
  const q = u+d;
  const charge = u*(2/3) + d*(-1/3) + e*(-1);
  const lang = window.CURRENT_LANG || 'en';
  const dict = LOCALES[lang];
  const t = (k)=> dict[k] || LOCALES.en[k] || k;

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
  if(atomMap[key]){
    name = atomMap[key][0] + ' — ' + atomMap[key][1];
    cls = 'result success';
  } else if(protons===0 && neutrons===1 && nElectrons===0 && freeQuarks.length===0){
    name = t('builder.msg.freeneutron'); cls='result success';
  } else if(totalNucleons===0 && nElectrons>0 && freeQuarks.length===0){
    name = nElectrons===1 ? t('builder.msg.electron.one') : `${nElectrons} ${t('builder.msg.electron.many')}`; cls='result success';
  } else if(freeQuarks.length>0){
    name = t('builder.msg.freeq'); cls='result';
  } else if(deltas>0){
    name = t('builder.msg.delta'); cls='result success';
  } else if(totalNucleons>0){
    const els = ELEMENT_I18N[lang] || ['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
    const symb = els[protons] || `Z=${protons}`;
    const eLabel = lang==='zh-CN' ? '电子' : 'e⁻';
    name = `${symb} — ${protons}p + ${neutrons}n${nElectrons?` + ${nElectrons}${eLabel}`:''}`;
    cls = 'result success';
  }

  buildResult.textContent = name;
  buildResult.className = cls;

  const chargeVal = Math.round(charge*100)/100;
  buildStats.innerHTML = `
    <div>${t('builder.stats.up')}: <b>${u}</b> · ${t('builder.stats.down')}: <b>${d}</b> · ${t('builder.stats.electrons')}: <b>${e}</b></div>
    <div>${t('builder.stats.protons')}: <b>${protons}</b> · ${t('builder.stats.neutrons')}: <b>${neutrons}</b>${deltas?` · ${t('builder.stats.delta')}: <b>${deltas}</b>`:''}${freeQuarks.length?` · <span style="color:#ff6b9d">${t('builder.stats.freeq')}: ${freeQuarks.length}</span>`:''}</div>
    <div>${t('builder.stats.charge')}: <b>${chargeVal===0?'0':(chargeVal>0?'+':'')+chargeVal} e</b></div>
    <div>${t('builder.stats.parts')}: <b>${parts.length}</b></div>
  `;
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

  requestAnimationFrame(drawBuild);
}
function drawQuark(x,y,type){
  const isUp = type==='u';
  const c1 = isUp ? '#ff9ec2' : '#ffbdd7';
  const c2 = isUp ? '#ff6b9d' : '#ff85b0';
  const g = bctx.createRadialGradient(x-2,y-2,0,x,y,10);
  g.addColorStop(0,c1); g.addColorStop(1,c2);
  bctx.fillStyle=g;
  bctx.beginPath(); bctx.arc(x,y,9,0,Math.PI*2); bctx.fill();
  bctx.fillStyle='#fff';
  bctx.font='bold 10px JetBrains Mono, monospace';
  bctx.textAlign='center'; bctx.textBaseline='middle';
  bctx.fillText(type, x, y);
  bctx.textBaseline='alphabetic';
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
