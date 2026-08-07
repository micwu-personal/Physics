/* i18n dictionary for periodic-table app */
const LOCALES = {
  'en': {
    'page.title': 'Periodic Table — An Interactive Journey into the Elements',
    'motion.play':'Play animations',
    'motion.pause':'Pause animations',
    'motion.system':'Your system reduced-motion preference is pausing animations. Use this button to override it.',
    'journey.home':'Story',
    'detail.step':'Move between elements','detail.prev':'Previous element','detail.next':'Next element',
    'journey.field':'Quantum',
    'aria.controls':'Page controls',
    'aria.bohr':'Historical Bohr shell model teaching schematic',
    'aria.orbital':'Rotatable three-dimensional orbital or hybrid model surface',
    'alt.hydrogen':'Calculated hydrogen probability density plots for n equals 1 through 4',
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

    'radio.stable':'Has one or more observationally stable isotopes.',
    'radio.natural':'All isotopes are radioactive; this element occurs naturally.',
    'radio.trace':'All isotopes are radioactive; trace natural occurrence is known, but practical supplies are produced artificially.',
    'radio.synthetic':'All known isotopes are radioactive; no confirmed natural occurrence, so this element is produced artificially.',

    'phase.solid':'Solid', 'phase.liquid':'Liquid', 'phase.gas':'Gas', 'phase.unknown':'Unknown',

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
    'detail.mol3d.hint':'Drag to rotate. Approximate reviewed geometry; ionic solids are labeled lattice fragments, not isolated molecules.',
    'detail.bohr.kind':'Historical teaching model',
    'detail.bohr.caveat':'The rings are not electron paths. Bohr shells are useful for energy levels and electron counting, but a real atom is described by a quantum state and probability density.',
    'detail.bohr.compare':'Compare with a quantum probability map',
    'detail.cloud.kind':'Calculated model, not a photograph',
    'detail.cloud.caption':'Brightness shows calculated |psi|^2 for hydrogen. Experiments test this model\'s predictions; the image is not a literal view through a microscope.',
    'detail.orbital.kind':'3D probability/model surface',
    'detail.orbital.caveat':'Atomic orbitals are volumetric isosurfaces of a calculated wavefunction; they can look narrow edge-on but are never flat sheets. Hybrid orbitals are mathematical combinations used to rationalize molecular geometry, not photographed objects.',
    'detail.media.source':'Source / public domain',
    'detail.rx.caveat':'Teaching schematic: atom paths and timing are not a molecular-dynamics simulation. The animation holds reactants for 0.5 s, then conserves atom counts while illustrating bond changes and observable effects.',
    'detail.section.nucleus':'Inside the Nucleus · Isotopes · Radioactivity',
    'detail.section.uses':'Uses &amp; Discovery',
    'detail.ox.hint':'These are the charges this element can take in compounds — determining what bonds &amp; reactions it prefers.',

    'detail.iso.symbol':'Isotope','detail.iso.ab':'Abundance','detail.iso.stab':'Stability','detail.iso.note':'Notes',
    'detail.iso.none':'No reviewed isotope-abundance record is included for this element; no value is inferred.',
    'iso.stable':'stable','iso.unstable':'unstable',

    'shells.text':'Electrons per shell:',
    'hybrid.none':'No hybridization typically shown for this element',
    'hybrid.s':'s orbital — spherical, holds up to 2 electrons.',
    'hybrid.sp':'sp hybridization (linear, 180°). Example: C in acetylene HC≡CH.',
    'hybrid.sp2':'sp² hybridization (trigonal planar, 120°). Example: C in ethylene CH₂=CH₂, or in benzene.',
    'hybrid.sp3':'sp³ hybridization (tetrahedral, 109.5°). Example: C in methane CH₄, N in ammonia NH₃.',
    'hybrid.sp3d':'Trigonal-bipyramidal geometry (legacy label: sp³d). PCl₅ is better described with polarized/ionic and three-center four-electron bonding; substantial 3d hybridization is not supported.',
    'hybrid.sp3d2':'Octahedral geometry (legacy label: sp³d²). SF₆ does not require sulfur 3d hybridization; modern descriptions use delocalized, polarized and ionic-resonance bonding.',
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
    'motion.play':'播放动画',
    'motion.pause':'暂停动画',
    'motion.system':'系统的“减少动态效果”设置已暂停动画。可用此按钮覆盖该设置。',
    'journey.home':'故事线',
    'detail.step':'在元素之间切换','detail.prev':'上一个元素','detail.next':'下一个元素',
    'journey.field':'量子专题',
    'aria.controls':'页面控制',
    'aria.bohr':'历史玻尔电子壳层教学示意图',
    'aria.orbital':'可旋转的三维原子轨道或杂化模型表面',
    'alt.hydrogen':'主量子数 n 从 1 到 4 的氢原子计算概率密度图',
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

    'radio.stable':'具有一种或多种观测上稳定的同位素。',
    'radio.natural':'所有同位素都具有放射性；该元素天然存在。',
    'radio.trace':'所有同位素都具有放射性；已知有痕量天然存在，但实际用量主要来自人工制备。',
    'radio.synthetic':'所有已知同位素都具有放射性；尚无确认的天然存在，需人工合成。',

    'phase.solid':'固态','phase.liquid':'液态','phase.gas':'气态','phase.unknown':'未知',

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
    'detail.mol3d.hint':'拖动可旋转。几何结构为经核查的近似值；离子固体会标为晶格片段，并非孤立分子。',
    'detail.bohr.kind':'历史教学模型',
    'detail.bohr.caveat':'圆环不是电子路径。玻尔壳层有助于理解能级和电子计数，但真实原子由量子态与概率密度描述。',
    'detail.bohr.compare':'与量子概率图比较',
    'detail.cloud.kind':'计算模型，并非照片',
    'detail.cloud.caption':'亮度表示氢原子的计算 |psi|^2。实验检验该模型的预测；这不是显微镜下的字面景象。',
    'detail.orbital.kind':'3D 概率/模型表面',
    'detail.orbital.caveat':'原子轨道是计算波函数的三维等值面；侧视时可能显得很窄，但绝不是平面薄片。杂化轨道是用于解释分子几何的数学组合，并非被拍摄到的物体。',
    'detail.media.source':'来源 / 公有领域',
    'detail.rx.caveat':'教学示意：原子路径与时间并非分子动力学模拟。动画先保持反应物 0.5 秒，再在守恒原子数的前提下说明键变化与可观察现象。',
    'detail.section.nucleus':'原子核 · 同位素 · 放射性',
    'detail.section.uses':'用途与发现',
    'detail.ox.hint':'这些是该元素在化合物中可以呈现的电荷——决定了它偏好的化学键与反应。',

    'detail.iso.symbol':'同位素','detail.iso.ab':'丰度','detail.iso.stab':'稳定性','detail.iso.note':'备注',
    'detail.iso.none':'本应用未收录经审核的同位素丰度记录；不会推算或虚构数值。',
    'iso.stable':'稳定','iso.unstable':'放射性',

    'shells.text':'各壳层电子数:',
    'hybrid.none':'该元素通常不涉及杂化轨道',
    'hybrid.s':'s 轨道 — 球形,最多容纳 2 个电子。',
    'hybrid.sp':'sp 杂化(直线形,键角 180°)。例:乙炔 HC≡CH 中的碳。',
    'hybrid.sp2':'sp² 杂化(平面三角形,键角 120°)。例:乙烯 CH₂=CH₂、苯中的碳。',
    'hybrid.sp3':'sp³ 杂化(正四面体,键角 109.5°)。例:甲烷 CH₄ 中的碳、氨 NH₃ 中的氮。',
    'hybrid.sp3d':'三角双锥构型（传统标签：sp³d）。PCl₅ 更适合用极化/离子成分与三中心四电子键描述；并无证据支持显著的 3d 杂化。',
    'hybrid.sp3d2':'八面体构型（传统标签：sp³d²）。SF₆ 的成键不需要硫的 3d 杂化；现代模型采用离域、极化及离子共振描述。',
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
  const dict = LOCALES[lang];
  document.documentElement.lang = (lang==='zh-CN' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el=>{
    const key=el.getAttribute('data-i18n-alt');
    el.setAttribute('alt',dict[key]);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>{
    const key=el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label',dict[key]);
  });
  const titleKey = document.querySelector('title').getAttribute('data-i18n');
  document.title = dict[titleKey];
  document.querySelectorAll('.lang-pill').forEach(b=>{
    b.classList.toggle('active', b.dataset.lang===lang);
  });
  document.querySelectorAll('.source-label').forEach(label=>{
    label.textContent = lang==='zh-CN' ? '资料来源：' : 'Sources: ';
  });
  window.CURRENT_LANG = lang;
  // Re-render dynamic content
  rerenderGrid();
  refreshDetail();
}

function t(key){
  return LOCALES[window.CURRENT_LANG][key] || key;
}

function resolvePhaseLabel(phaseKey){
  const key = `phase.${phaseKey}`;
  const label = t(key);
  return label === key ? phaseKey : label;
}
