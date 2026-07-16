/* i18n dictionary for periodic-table app */
const LOCALES = {
  'en': {
    'page.title': 'Periodic Table — An Interactive Journey into the Elements',
    'hero.badge': 'All 118 Elements · Interactive',
    'hero.title.a': 'Periodic',
    'hero.title.b': 'Table',
    'hero.tag': 'Click any element. Every characteristic — orbitals, hybridization, oxidation states, bonds, reactions, radioactivity — appears right there.',

    'cat.alkali':'Alkali metal', 'cat.alkaline':'Alkaline-earth metal', 'cat.transition':'Transition metal',
    'cat.posttransition':'Post-transition metal', 'cat.metalloid':'Metalloid', 'cat.nonmetal':'Reactive nonmetal',
    'cat.halogen':'Halogen', 'cat.noble':'Noble gas', 'cat.lanthanide':'Lanthanide', 'cat.actinide':'Actinide',

    'ptable.fseries':'f-block (Lanthanides · Actinides)',
    'ptable.mainGroup':'Main group',
    'ptable.subGroup':'Transition (sub-group)',

    'prop.Z':'Atomic number Z',
    'prop.mass':'Atomic mass',
    'prop.group':'Group',
    'prop.period':'Period',
    'prop.family':'Family',
    'prop.config':'Electron configuration',
    'prop.shells':'Shells (K L M N O P Q)',
    'prop.phase':'Phase at STP',
    'prop.melt':'Melting point',
    'prop.boil':'Boiling point',
    'prop.density':'Density',
    'prop.en':'Electronegativity',
    'prop.radioactive':'Radioactivity',

    'radio.stable':'Stable — all common isotopes are non-radioactive.',
    'radio.natural':'Naturally radioactive — decays over geological or human timescales.',
    'radio.artificial':'Fully radioactive — every known isotope decays; most are produced only in reactors or accelerators (artificial).',

    'phase.solid':'Solid', 'phase.liquid':'Liquid', 'phase.gas':'Gas',

    'main':'main group','sub':'sub-group (transition)','f':'f-block',

    'detail.section.atom':'Bohr Model &amp; Electron Shells',
    'detail.section.orbital':'Orbital Shape &amp; Hybridization',
    'detail.section.ox':'Common Oxidation States',
    'detail.section.colors':'Signature Colors',
    'detail.colors.hint':'How this element actually looks — as a pure substance, as its main compounds, and (for many s-block elements) in a flame test.',
    'detail.colors.none':'No distinctive characteristic colors recorded for this element yet.',
    'detail.section.bond':'Chemical Bonding',
    'detail.section.rx':'Signature Reactions',
    'detail.section.mol3d':'3D Molecular Structures',
    'detail.mol3d.hint':'Drag to rotate. Ball-and-stick model with true bond angles.',
    'detail.section.nucleus':'Inside the Nucleus · Isotopes · Radioactivity',
    'detail.section.uses':'Uses &amp; Discovery',
    'detail.ox.hint':'These are the charges this element can take in compounds — determining what bonds &amp; reactions it prefers.',

    'detail.iso.symbol':'Isotope','detail.iso.ab':'Abundance','detail.iso.stab':'Stability','detail.iso.note':'Notes',
    'iso.stable':'stable','iso.unstable':'unstable',

    'shells.text':'Electrons per shell:',
    'hybrid.none':'No hybridization typically shown for this element',
    'hybrid.s':'s orbital — spherical, holds up to 2 electrons.',
    'hybrid.sp':'sp hybridization (linear, 180°). Example: C in acetylene HC≡CH.',
    'hybrid.sp2':'sp² hybridization (trigonal planar, 120°). Example: C in ethylene CH₂=CH₂, or in benzene.',
    'hybrid.sp3':'sp³ hybridization (tetrahedral, 109.5°). Example: C in methane CH₄, N in ammonia NH₃.',
    'hybrid.sp3d':'sp³d hybridization (trigonal bipyramidal, 90°/120°). Example: PCl₅.',
    'hybrid.sp3d2':'sp³d² hybridization (octahedral, 90°). Example: SF₆.',
    'hybrid.d2sp3':'d²sp³ hybridization (octahedral, inner-orbital). Common in [Fe(CN)₆]³⁻ and similar complexes.',
    'hybrid.dsp2':'dsp² hybridization (square planar). Common in Cu(II) and Pt(II) complexes.',
    'hybrid.f':'f-block electrons participate diffusely; hybridization is complex and rarely simple.',

    'bond.ionic.name':'Ionic bond',
    'bond.ionic.desc':'Transfer of electrons; strong electrostatic attraction between + and − ions.',
    'bond.covalent.name':'Covalent bond',
    'bond.covalent.desc':'Sharing of one or more electron pairs between two atoms. May be a single (σ only), double (σ + π), or triple (σ + 2π) bond.',
    'bond.sigma.name':'σ (sigma) bond',
    'bond.sigma.desc':'Head-on overlap of atomic orbitals along the bond axis. Every single bond is a σ bond; it is the strongest kind of covalent bond and is symmetric about the bond axis.',
    'bond.pi.name':'π (pi) bond',
    'bond.pi.desc':'Sideways overlap of two parallel p (or d) orbitals above and below the bond axis. Found in every double or triple bond (in addition to the σ), and in aromatic rings. Weaker than σ, and it prevents rotation about the bond.',
    'bond.aromatic.name':'Aromatic / delocalized π',
    'bond.aromatic.desc':'π electrons spread evenly over a ring of atoms (like benzene C₆H₆). All bonds become equivalent, and the ring gains extra stability from resonance.',
    'bond.coordinate.name':'Coordinate (dative) bond',
    'bond.coordinate.desc':'A covalent bond where one atom donates both shared electrons (Lewis-base → Lewis-acid). Key to complexes such as [Fe(H₂O)₆]²⁺ and NH₃·BF₃.',
    'bond.metallic.name':'Metallic bond',
    'bond.metallic.desc':'A "sea" of delocalized electrons holds metal cations together — the reason metals conduct heat & electricity and are malleable.',
    'bond.hydrogen.name':'Hydrogen bond',
    'bond.hydrogen.desc':'Weak but important; H bonded to F/O/N attracts another F/O/N. Responsible for water\'s high boiling point and DNA base pairing.',
    'bond.vdw.name':'Van der Waals',
    'bond.vdw.desc':'Weak transient dipole–dipole (London dispersion) forces present between all atoms. The only force between noble-gas atoms.',
    'bond.forms':'Forms',
    'bond.rarely':'Rarely / not typical',

    'discovery.year':'Discovered in',
    'discovery.by':'by',
    'discovery.ancient':'Known since antiquity',

    'nuc.protons':'protons',
    'nuc.neutrons':'neutrons (avg)',
    'nuc.stable':'stable configuration',
    'nuc.decay':'unstable — decays',

    'tts.unavailable':'Text-to-speech not available in this browser.',

    'footer':'Interactive · data compiled from IUPAC &amp; NIST · Chinese terminology per CAS glossary'
  },

  'zh-CN': {
    'page.title': '元素周期表 — 元素的交互式探索',
    'hero.badge': '全部 118 种元素 · 交互式',
    'hero.title.a': '元素',
    'hero.title.b': '周期表',
    'hero.tag': '点击任意元素。原子轨道、杂化方式、化合价、化学键、反应、放射性——所有性质都在同一位置展开。',

    'cat.alkali':'碱金属','cat.alkaline':'碱土金属','cat.transition':'过渡金属',
    'cat.posttransition':'贫金属(主族金属)','cat.metalloid':'类金属','cat.nonmetal':'非金属',
    'cat.halogen':'卤素','cat.noble':'稀有气体','cat.lanthanide':'镧系元素','cat.actinide':'锕系元素',

    'ptable.fseries':'f 区(镧系 · 锕系)',
    'ptable.mainGroup':'主族',
    'ptable.subGroup':'副族(过渡元素)',

    'prop.Z':'原子序数 Z',
    'prop.mass':'相对原子质量',
    'prop.group':'族',
    'prop.period':'周期',
    'prop.family':'族类型',
    'prop.config':'电子排布式',
    'prop.shells':'各壳层电子数 (K L M N O P Q)',
    'prop.phase':'常温常压下相态',
    'prop.melt':'熔点',
    'prop.boil':'沸点',
    'prop.density':'密度',
    'prop.en':'电负性(鲍林标度)',
    'prop.radioactive':'放射性',

    'radio.stable':'稳定 — 常见同位素都不具有放射性。',
    'radio.natural':'天然放射性 — 在地质或人类时间尺度上会发生衰变。',
    'radio.artificial':'完全放射性 — 所有已知同位素都会衰变;大多只能通过反应堆或加速器人工合成。',

    'phase.solid':'固态','phase.liquid':'液态','phase.gas':'气态',

    'main':'主族','sub':'副族(过渡)','f':'f 区',

    'detail.section.atom':'玻尔模型与电子壳层',
    'detail.section.orbital':'原子轨道形状与杂化',
    'detail.section.ox':'常见化合价',
    'detail.section.colors':'特征颜色',
    'detail.colors.hint':'该元素在自然界中的真实颜色——单质、常见化合物、以及(对多数 s 区元素)焰色反应。',
    'detail.colors.none':'尚未收录该元素的特征颜色。',
    'detail.section.bond':'化学键',
    'detail.section.rx':'代表性化学反应',
    'detail.section.mol3d':'3D 分子结构',
    'detail.mol3d.hint':'鼠标拖动可旋转。球棍模型采用真实键角。',
    'detail.section.nucleus':'原子核 · 同位素 · 放射性',
    'detail.section.uses':'用途与发现',
    'detail.ox.hint':'这些是该元素在化合物中可以呈现的电荷——决定了它偏好的化学键与反应。',

    'detail.iso.symbol':'同位素','detail.iso.ab':'丰度','detail.iso.stab':'稳定性','detail.iso.note':'备注',
    'iso.stable':'稳定','iso.unstable':'放射性',

    'shells.text':'各壳层电子数:',
    'hybrid.none':'该元素通常不涉及杂化轨道',
    'hybrid.s':'s 轨道 — 球形,最多容纳 2 个电子。',
    'hybrid.sp':'sp 杂化(直线形,键角 180°)。例:乙炔 HC≡CH 中的碳。',
    'hybrid.sp2':'sp² 杂化(平面三角形,键角 120°)。例:乙烯 CH₂=CH₂、苯中的碳。',
    'hybrid.sp3':'sp³ 杂化(正四面体,键角 109.5°)。例:甲烷 CH₄ 中的碳、氨 NH₃ 中的氮。',
    'hybrid.sp3d':'sp³d 杂化(三角双锥,键角 90°/120°)。例:PCl₅。',
    'hybrid.sp3d2':'sp³d² 杂化(正八面体,键角 90°)。例:SF₆。',
    'hybrid.d2sp3':'d²sp³ 杂化(内轨型八面体)。常见于 [Fe(CN)₆]³⁻ 等配合物。',
    'hybrid.dsp2':'dsp² 杂化(平面正方形)。常见于 Cu(II) 与 Pt(II) 配合物。',
    'hybrid.f':'f 电子弥散,杂化情况复杂,通常不用简单杂化描述。',

    'bond.ionic.name':'离子键',
    'bond.ionic.desc':'电子发生转移;正负离子之间的强静电吸引。',
    'bond.covalent.name':'共价键',
    'bond.covalent.desc':'两个原子之间共用一对或多对电子。可以是单键(仅 σ)、双键(σ + π)或叁键(σ + 2π)。',
    'bond.sigma.name':'σ(西格玛)键',
    'bond.sigma.desc':'原子轨道沿键轴"头对头"重叠形成。任何单键都是 σ 键,是最强的共价键类型,且对键轴呈轴对称。',
    'bond.pi.name':'π(派)键',
    'bond.pi.desc':'两个平行的 p(或 d)轨道在键轴上下方"肩并肩"侧向重叠。每一个双键或叁键都包含 π 键(除 σ 之外),芳香环中也有 π 键。比 σ 弱,并使键不能自由旋转。',
    'bond.aromatic.name':'芳香键 / 离域 π 键',
    'bond.aromatic.desc':'π 电子在环状分子(如苯 C₆H₆)中均匀离域。所有键完全等价,并因共振获得额外稳定性。',
    'bond.coordinate.name':'配位(共价)键',
    'bond.coordinate.desc':'一种特殊的共价键,共用电子对完全由一方(Lewis 碱)提供,另一方(Lewis 酸)接受。是配合物 [Fe(H₂O)₆]²⁺、NH₃·BF₃ 等的成键基础。',
    'bond.metallic.name':'金属键',
    'bond.metallic.desc':'"电子海"将金属阳离子连接在一起——这是金属能导热、导电、具有延展性的根本原因。',
    'bond.hydrogen.name':'氢键',
    'bond.hydrogen.desc':'较弱但极重要;与 F/O/N 相连的 H 被另一个 F/O/N 吸引。水的高沸点、DNA 碱基配对都源于氢键。',
    'bond.vdw.name':'范德华力',
    'bond.vdw.desc':'原子之间普遍存在的瞬时偶极诱导的弱吸引力(伦敦色散力);稀有气体之间唯一的作用力。',
    'bond.forms':'可形成',
    'bond.rarely':'一般不形成',

    'discovery.year':'发现于',
    'discovery.by':'发现者:',
    'discovery.ancient':'自远古即已知',

    'nuc.protons':'个质子',
    'nuc.neutrons':'个中子(平均)',
    'nuc.stable':'稳定构型',
    'nuc.decay':'不稳定——会发生衰变',

    'tts.unavailable':'当前浏览器不支持语音合成。',

    'footer':'交互式 · 数据来自 IUPAC 与 NIST · 中文术语依据全国科学技术名词审定委员会《物理学名词》与《化学名词》'
  }
};

function applyI18n(lang){
  const dict = LOCALES[lang] || LOCALES.en;
  document.documentElement.lang = (lang==='zh-CN' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
  if(titleKey && dict[titleKey]) document.title = dict[titleKey];
  document.querySelectorAll('.lang-pill').forEach(b=>{
    b.classList.toggle('active', b.dataset.lang===lang);
  });
  window.CURRENT_LANG = lang;
  // Re-render dynamic content
  if(typeof rerenderGrid==='function') rerenderGrid();
  if(typeof refreshDetail==='function') refreshDetail();
}

function t(key){
  const dict = LOCALES[window.CURRENT_LANG||'en'];
  return (dict && dict[key]) || (LOCALES.en[key]) || key;
}
