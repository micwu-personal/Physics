globalThis.ParticleZooReferences = (() => {
  const SOURCES = {
    pdg: { title: 'Particle Data Group — Review of Particle Physics (2024)', url: 'https://pdg.lbl.gov/2024/' },
    pdgListings: { title: 'PDG 2024 — Particle listings', url: 'https://pdg.lbl.gov/2024/listings/contents_listings.html' },
    pdgNeutrino: { title: 'PDG 2024 — Neutrino masses, mixing, and oscillations', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-neutrino-mixing.pdf' },
    katrin: { title: 'KATRIN (Science, 2025) — Direct neutrino-mass limit of 0.45 eV', url: 'https://doi.org/10.1126/science.adq9592' },
    cernSm: { title: 'CERN — The Standard Model', url: 'https://home.cern/science/physics/standard-model' },
    cernForces: { title: 'CERN — Standard Model interactions overview', url: 'https://home.cern/science/physics/standard-model' },
    cernHiggs: { title: 'CERN — The Higgs boson', url: 'https://home.cern/science/physics/higgs-boson' },
    cernAntimatter: { title: 'CERN — Antimatter', url: 'https://home.cern/science/physics/antimatter' },
    atlasDetector: { title: 'ATLAS — Detector overview', url: 'https://atlas.cern/Discover/Detector' },
    cmsDetector: { title: 'CMS — How a detector works', url: 'https://cms.cern/detector' },
    pdgKinematics: { title: 'PDG 2024 — Kinematics review', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-kinematics.pdf' },
    nufit: { title: 'Esteban et al. — Three-neutrino global analysis', url: 'https://doi.org/10.1007/JHEP09(2020)178' },
    ct18: { title: 'CT18 global analysis of parton distributions', url: 'https://doi.org/10.1103/PhysRevD.103.014013' },
    gw150914: { title: 'LIGO/Virgo — Observation of GW150914', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
    nobel2015: { title: 'Nobel Prize 2015 — Neutrino oscillations', url: 'https://www.nobelprize.org/prizes/physics/2015/press-release/' },
    majoranaNature: { title: 'Nature (2025) — Interferometric single-shot parity measurement in an InAs-Al hybrid device', url: 'https://doi.org/10.1038/s41586-024-08445-2' },
    kamlandZen: { title: 'KamLAND-Zen — Neutrinoless double-beta decay search', url: 'https://doi.org/10.1103/PhysRevLett.130.051801' },
    fermilabSbn: { title: 'Fermilab — Short-Baseline Neutrino Program', url: 'https://sbn.fnal.gov/' },
    microboone: { title: 'MicroBooNE — Search for an electron-neutrino excess', url: 'https://doi.org/10.1103/PhysRevLett.128.241801' },
    admx: { title: 'ADMX — Axion dark-matter experiment', url: 'https://depts.washington.edu/admx/' },
    lz: { title: 'LZ Collaboration — 280-day dark-matter search', url: 'https://doi.org/10.1103/PhysRevLett.134.011802' },
    atlasSusy: { title: 'ATLAS — Supersymmetry public results', url: 'https://twiki.cern.ch/twiki/bin/view/AtlasPublic/SupersymmetryPublicResults' },
    pdgSusy: { title: 'PDG 2024 — Supersymmetry review', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-susy-1-theory.pdf' },
    moedal: { title: 'MoEDAL — Magnetic-monopole searches', url: 'https://moedal.web.cern.ch/' },
    anyonScience: { title: 'Science (2020) — Fractional statistics in an anyon collider', url: 'https://doi.org/10.1126/science.aaz5601' },
    lhcbExotics: { title: 'LHCb (PRL, 2015) — Pentaquark observations', url: 'https://doi.org/10.1103/PhysRevLett.115.072001' },
    besGlueball: { title: 'BESIII (PRL, 2024) — X(2370) glueball-candidate quantum numbers', url: 'https://doi.org/10.1103/PhysRevLett.132.181901' },
    pdgCompositeness: { title: 'PDG 2024 — Quark and lepton compositeness searches', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-searches-quark-lep-compositeness.pdf' },
    nobel2001: { title: 'Nobel Prize 2001 — Bose-Einstein condensates', url: 'https://www.nobelprize.org/prizes/physics/2001/press-release/' },
    bcs: { title: 'Bardeen, Cooper & Schrieffer (1957) — Theory of superconductivity', url: 'https://doi.org/10.1103/PhysRev.108.1175' },
    nobel1978: { title: 'Nobel Prize 1978 — Low-temperature physics', url: 'https://www.nobelprize.org/prizes/physics/1978/press-release/' },
    aliceQgp: { title: 'CERN — Heavy ions and quark-gluon plasma', url: 'https://home.cern/science/physics/heavy-ions-and-quark-gluon-plasma' },
    nobel2022: { title: 'Nobel Prize 2022 — Entanglement experiments', url: 'https://www.nobelprize.org/prizes/physics/2022/press-release/' },
    nobel2016: { title: 'Nobel Prize 2016 — Topological phases of matter', url: 'https://www.nobelprize.org/prizes/physics/2016/press-release/' },
    hawking: { title: 'Hawking (1975) — Particle creation by black holes', url: 'https://doi.org/10.1007/BF02345020' },
    jilaCondensate: { title: 'JILA — First fermionic condensate', url: 'https://jila.colorado.edu/news-events/news/first-fermionic-condensate-created' },
    qcdConfinement: { title: 'CERN — Quarks and confinement', url: 'https://home.cern/science/physics/standard-model' },
    rgeReview: { title: 'PDG 2024 — Grand Unified Theories review', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-guts.pdf' },
  };

  const particleIds = [
    'up', 'down', 'charm', 'strange', 'top', 'bottom',
    'electron', 'muon', 'tau', 'nu_e', 'nu_mu', 'nu_tau',
    'photon', 'gluon', 'wboson', 'zboson', 'higgs',
    'anti_up', 'anti_down', 'anti_charm', 'anti_strange', 'anti_top', 'anti_bottom',
    'positron', 'anti_muon', 'anti_tau', 'anti_nu_e', 'anti_nu_mu', 'anti_nu_tau',
  ];
  const particle = Object.fromEntries(particleIds.map(id => [id, ['pdgListings']]));
  for (const id of ['nu_e', 'nu_mu', 'nu_tau', 'anti_nu_e', 'anti_nu_mu', 'anti_nu_tau']) particle[id] = ['pdgNeutrino', 'katrin'];
  particle.higgs = ['pdgListings', 'cernHiggs'];

  const CONTENT_REFERENCES = {
    particle,
    force: {
      strong: ['cernForces', 'qcdConfinement'],
      em: ['cernForces'],
      weak: ['cernForces'],
      gravity: ['cernForces', 'gw150914'],
    },
    interaction: Object.fromEntries([
      'beta', 'annih', 'pair', 'fusion', 'higgs', 'gluon', 'ex-strong', 'ex-em', 'ex-weak',
      'ex-grav', 'ex-higgs', 'compton', 'moller', 'bhabha', 'bremss', 'neutron', 'muon',
      'pion', 'dis', 'zprod', 'gravwave',
    ].map(id => [id, id === 'gravwave' ? ['gw150914'] : id === 'ex-grav' ? ['gw150914'] : ['pdg', 'cernSm']])),
    decay: Object.fromEntries(['μ⁻', 'μ⁺', 'τ⁻', 'τ⁺', 'π⁺', 'π⁻', 'π⁰', 'K⁺', 'n', 'Z'].map(id => [id, ['pdgListings']])),
    lab: {
      conf: ['qcdConfinement'], det: ['atlasDetector', 'cmsDetector'], higgs: ['cernHiggs'],
      feyn: ['pdg', 'cernSm'], decay: ['pdgListings'], osc: ['pdgNeutrino', 'nufit'],
      pdf: ['ct18'], evd: ['atlasDetector', 'cmsDetector'], cons: ['pdgKinematics'], run: ['rgeReview'],
    },
    bsm: {
      majorana: ['majoranaNature', 'kamlandZen'], oscill: ['nobel2015', 'pdgNeutrino'],
      graviton: ['gw150914'], sterile: ['microboone', 'fermilabSbn'], axion: ['admx'], wimp: ['lz'],
      susy: ['pdgSusy', 'atlasSusy'], monopole: ['moedal'], anyon: ['anyonScience'],
      tetra: ['lhcbExotics'], glueball: ['besGlueball'], preon: ['pdgCompositeness'],
    },
    phenomenon: {
      bec: ['nobel2001'], super: ['bcs'], superfluid: ['nobel1978'], qgp: ['aliceQgp'],
      entangle: ['nobel2022'], pauli: ['pdg'], topo: ['nobel2016', 'majoranaNature'],
      hawking: ['hawking'], fermicond: ['jilaCondensate'],
    },
    section: {
      chart: ['pdgListings', 'cernSm'], color: ['qcdConfinement'], antimatter: ['cernAntimatter'],
      builder: ['pdgListings'], playground: ['pdgKinematics', 'cernAntimatter'],
    },
  };

  function resolve(ids) {
    return ids.map(id => SOURCES[id]);
  }

  function render(ids, label) {
    const links = resolve(ids).map(source =>
      `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a>`
    ).join('<span aria-hidden="true"> · </span>');
    return `<div class="content-refs"><span>${label}:</span> ${links}</div>`;
  }

  return { CONTENT_REFERENCES, SOURCES, particleIds, render, resolve };
})();
