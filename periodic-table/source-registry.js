(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PeriodicSources = api;
})(globalThis, function(){
  'use strict';

  const SOURCES = Object.freeze({
    iupac: {label:'IUPAC Periodic Table', url:'https://iupac.org/what-we-do/periodic-table-of-elements/'},
    ciaaw: {label:'CIAAW Standard Atomic Weights', url:'https://ciaaw.org/atomic-weights.htm'},
    nistAsd: {label:'NIST Atomic Spectra Database', url:'https://physics.nist.gov/PhysRefData/ASD/levels_form.html'},
    nistWebbook: {label:'NIST Chemistry WebBook', url:'https://webbook.nist.gov/chemistry/'},
    rsc: {label:'Royal Society of Chemistry', url:'https://periodic-table.rsc.org/'},
    iaea: {label:'IAEA LiveChart (ENSDF)', url:'https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html'},
    nndc: {label:'NNDC NuDat 3', url:'https://www.nndc.bnl.gov/nudat3/'},
    cnctst: {label:'CNCTST 术语在线', url:'https://www.termonline.cn/'},
    magnusson: {label:'Magnusson, JACS 1990', url:'https://doi.org/10.1021/ja00177a014'},
    gillespie: {label:'Gillespie, Coord. Chem. Rev. 2002', url:'https://doi.org/10.1016/S0010-8545(01)00409-9'},
    johnson: {label:'Johnson, Science 2019', url:'https://doi.org/10.1126/science.aau9540'},
    kobayashi: {label:'Kobayashi et al., ARA&A 2020', url:'https://doi.org/10.1146/annurev-astro-092019-021616'},
    nistColors: {label:'NIST Atomic Spectra Lines', url:'https://physics.nist.gov/PhysRefData/Handbook/periodictable.htm'},
    jorgensen: {label:'Jørgensen, Absorption Spectra and Chemical Bonding', url:'https://doi.org/10.1016/S0065-2792(08)60008-5'}
  });

  const SOURCE_GROUPS = Object.freeze({
    core:['iupac','ciaaw','nistAsd','cnctst'],
    shells:['nistAsd'],
    orbitals:['nistAsd','magnusson','gillespie'],
    oxidation:['rsc','nistWebbook'],
    colors:['rsc','nistColors'],
    bonding:['rsc','magnusson','gillespie'],
    reactions:['rsc','nistWebbook'],
    molecules:['nistWebbook','rsc'],
    isotopes:['iaea','nndc','ciaaw'],
    discovery:['rsc','iupac'],
    origins:['johnson','kobayashi'],
    nuclides:['iaea','nndc'],
    overlays:['iupac','ciaaw','nistAsd','rsc'],
    ligand:['jorgensen','rsc']
  });

  const REQUIRED_GROUPS = Object.freeze(Object.keys(SOURCE_GROUPS));

  function elementSource(atomicNumber){
    if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) return null;
    return {
      label:`RSC element ${atomicNumber}`,
      url:`https://periodic-table.rsc.org/element/${atomicNumber}`
    };
  }

  function sourcesFor(group, atomicNumber){
    const ids = SOURCE_GROUPS[group];
    if (!ids) throw new RangeError(`Unknown source group: ${group}`);
    const sources = ids.map(id => SOURCES[id]);
    if (['core','colors','reactions','discovery'].includes(group)) {
      const element = elementSource(atomicNumber);
      if (element) sources.push(element);
    }
    return sources;
  }

  function safeExternalLink(source, documentRef){
    const link = documentRef.createElement('a');
    link.href = source.url;
    link.textContent = source.label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.referrerPolicy = 'no-referrer';
    return link;
  }

  function render(group, atomicNumber, lang, documentRef){
    const documentObject = documentRef || (typeof document !== 'undefined' ? document : null);
    if (!documentObject) return null;
    const wrapper = documentObject.createElement('div');
    wrapper.className = 'source-links';
    const label = documentObject.createElement('span');
    label.className = 'source-label';
    label.textContent = lang === 'zh-CN' ? '资料来源：' : 'Sources: ';
    wrapper.appendChild(label);
    sourcesFor(group, atomicNumber).forEach((source, index) => {
      if (index) wrapper.appendChild(documentObject.createTextNode(' · '));
      wrapper.appendChild(safeExternalLink(source, documentObject));
    });
    return wrapper;
  }

  function install(rootElement, atomicNumber, lang){
    if (!rootElement || typeof rootElement.querySelectorAll !== 'function') return 0;
    const nodes = rootElement.querySelectorAll('[data-source-group]');
    nodes.forEach(node => {
      node.querySelectorAll(':scope > .source-links').forEach(old => old.remove());
      const rendered = render(node.dataset.sourceGroup, atomicNumber, lang, node.ownerDocument);
      node.appendChild(rendered);
    });
    return nodes.length;
  }

  return Object.freeze({
    SOURCES,
    SOURCE_GROUPS,
    REQUIRED_GROUPS,
    elementSource,
    sourcesFor,
    safeExternalLink,
    render,
    install
  });
});
