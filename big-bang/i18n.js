/* ================ i18n for Big Bang app ================ */

const LOCALES = {
  'en': {
    'page.title': 'Big Bang — 13.8 Billion Years in an Afternoon',
    'hero.badge': 'Cosmic History · Interactive',
    'hero.title.a': 'Big',
    'hero.title.b': 'Bang',
    'hero.tag': 'From 10⁻⁴³ seconds to the heat death of the universe. Walk the timeline that built everything.',

    'tab.timeline': 'Cosmic Timeline',
    'tab.machine': 'Time Machine',
    'tab.composition': 'Composition',
    'tab.scale': 'Size of the Universe',
    'tab.fates': 'Ultimate Fates',
    'tab.mysteries': 'Open Mysteries',

    'timeline.h2': 'Cosmic Timeline',
    'timeline.desc': 'A model-based timeline from the earliest times physics can discuss. Click a card to zoom in.',

    'card.time': 'Time',
    'card.temp': 'Radiation/background temperature',
    'card.size': 'Radius of today\'s observable patch, then',
    'card.density': 'Mass–energy density (ρ = u/c²)',
    'card.dominant': 'Dominant content',
    'card.events': 'What happened',
    'card.evidence': 'How we know',

    'machine.h2': 'Cosmic Time Machine',
    'machine.desc': 'Drag the logarithmic slider from the early universe into a model-dependent far future.',
    'machine.temp': 'Radiation/background temperature',
    'machine.size': 'Radius of today\'s observable patch, then',
    'machine.density': 'Mass–energy density (ρ = u/c²)',
    'machine.dominant': 'What exists',
    'machine.epoch': 'Epoch',
    'machine.event': 'Key event',

    'comp.h2': 'What is the Universe made of?',
    'comp.desc': 'The mix has changed dramatically over cosmic history. Today, only 5% of the universe is ordinary matter.',
    'comp.today': 'Today (13.8 Gyr)',
    'comp.recomb': 'At recombination (380 kyr)',
    'comp.nucleo': 'During nucleosynthesis (~3 min)',
    'comp.legend.baryon': 'Ordinary matter',
    'comp.legend.dm': 'Dark matter',
    'comp.legend.de': 'Dark energy',
    'comp.legend.photon': 'Photons',
    'comp.legend.neutrino': 'Neutrinos',
    'comp.legend.radiation': 'Radiation',
    'comp.legend.plasma': 'Ionized plasma',
    'comp.note.nucleo': 'Radiation (photons + relativistic neutrinos) supplied >99.999% of the mass–energy density. Ordinary matter was ionized, but “plasma” is a state, not a separate energy component.',

    'scale.h2': 'How big was the universe?',
    'scale.desc': 'This compares the physical <b>radius</b>, at each epoch, of the patch that became today\'s observable universe. It is not the size of the whole universe, which may be infinite. Pre-BBN values are model-dependent.',
    'scale.now': 'now',
    'scale.compare': 'Compare to',

    'fates.h2': 'How does it end?',
    'fates.desc': 'The outcome depends on whether dark energy remains a cosmological constant, evolves, or the vacuum changes.',

    'myst.h2': 'What we still don\'t know',
    'myst.desc': 'Cosmology has spectacular successes — and equally spectacular open problems.',

    'sources.h2': 'Scientific sources',
    'sources.desc': 'Numbers are rounded educational estimates. Inflation-era sizes and far-future dates are model-dependent; links lead to primary papers, mission pages, and reviews.',
    'footer': 'Source-backed educational estimates; see the references above.'
  },

  'zh-CN': {
    'page.title': '宇宙大爆炸 — 一个下午读完 138 亿年',
    'hero.badge': '宇宙演化史 · 交互式',
    'hero.title.a': '宇宙',
    'hero.title.b': '大爆炸',
    'hero.tag': '从 10⁻⁴³ 秒到宇宙的热寂,亲手走一遍缔造万物的时间线。',

    'tab.timeline': '宇宙时间线',
    'tab.machine': '时间机器',
    'tab.composition': '物质构成',
    'tab.scale': '宇宙的大小',
    'tab.fates': '最终归宿',
    'tab.mysteries': '未解之谜',

    'timeline.h2': '宇宙演化时间线',
    'timeline.desc': '从现有物理学能够讨论的最早时期开始的模型时间线。点击卡片可查看细节。',

    'card.time': '时刻',
    'card.temp': '辐射/背景温度',
    'card.size': '今天可观测区域在当时的半径',
    'card.density': '质能密度 (ρ = u/c²)',
    'card.dominant': '主导成分',
    'card.events': '发生了什么',
    'card.evidence': '证据来源',

    'machine.h2': '宇宙时间机器',
    'machine.desc': '拖动对数滑块,从早期宇宙穿越到依赖模型外推的遥远未来。',
    'machine.temp': '辐射/背景温度',
    'machine.size': '今天可观测区域在当时的半径',
    'machine.density': '质能密度 (ρ = u/c²)',
    'machine.dominant': '此时存在的东西',
    'machine.epoch': '所处纪元',
    'machine.event': '关键事件',

    'comp.h2': '宇宙由什么构成?',
    'comp.desc': '宇宙的成分随时间发生了剧烈变化。今天,普通物质仅占 5%。',
    'comp.today': '今天(138 亿年)',
    'comp.recomb': '再复合时期(38 万年)',
    'comp.nucleo': '原初核合成时期(约 3 分钟)',
    'comp.legend.baryon': '普通物质',
    'comp.legend.dm': '暗物质',
    'comp.legend.de': '暗能量',
    'comp.legend.photon': '光子',
    'comp.legend.neutrino': '中微子',
    'comp.legend.radiation': '辐射',
    'comp.legend.plasma': '电离等离子体',
    'comp.note.nucleo': '辐射(光子和相对论性中微子)贡献了超过 99.999% 的质能密度。普通物质处于电离态,但“等离子体”是一种物态,并非独立的能量成分。',

    'scale.h2': '宇宙那时有多大?',
    'scale.desc': '这里比较的是最终形成<b>今天可观测宇宙</b>的那片区域在各时期的物理<b>半径</b>,并非整个宇宙的大小;整个宇宙可能是无限的。原初核合成之前的数值依赖模型。',
    'scale.now': '今天',
    'scale.compare': '相当于',

    'fates.h2': '宇宙将如何终结?',
    'fates.desc': '宇宙的结局取决于暗能量是否保持为宇宙学常数、随时间演化,以及真空是否发生变化。',

    'myst.h2': '我们至今仍不知道的事',
    'myst.desc': '宇宙学既有辉煌的成功,也有同样辉煌的未解之谜。',

    'sources.h2': '科学资料来源',
    'sources.desc': '数值均为经过取整的科普估计。暴胀时期的尺度与遥远未来的年代依赖模型;下列链接指向原始论文、任务页面与综述。',
    'footer': '以上为有资料依据的科普估计;参考文献见上方。'
  }
};

/* ================ Epoch data ================
   Each epoch has: id, time (human), tsec (rough seconds), temp, size,
   density, dominant, events (array), evidence, color (theme).
   All English by default; Chinese overrides in EPOCH_I18N.
*/
const EPOCHS = [
  {id:'planck', color:'#e94ecd',
    time:'0 – 10⁻⁴³ s', tsec:1e-43,
    temp:'~10³² K (Planck temp.)',
    size:'Unknown (Planck length is a physics scale, not a measured universe size)',
    density:'~10⁹⁶ kg/m³',
    dominant:'Unknown — quantum gravity',
    events:['General relativity and quantum field theory cannot both be applied reliably','A quantum theory of gravity is required','Force unification and “quantum foam” are hypotheses, not observations'],
    evidence:'No direct evidence describes this interval. String theory, loop quantum gravity, and other approaches remain unverified candidates.'
  },
  {id:'gut', color:'#c77dff',
    time:'10⁻⁴³ – 10⁻³⁶ s', tsec:1e-38,
    temp:'~10²⁹ K',
    size:'Unknown; depends on pre-inflationary geometry',
    density:'~10⁸⁰ kg/m³',
    dominant:'Hypothetical grand-unified fields',
    events:['Some models place grand unification at these energies','Gravity may already be distinct from gauge interactions','Magnetic monopoles and X/Y bosons are model predictions, not detections'],
    evidence:'No direct evidence. Super-Kamiokande sets τ/B > 2.4 × 10³⁴ yr for p→e⁺π⁰; Hyper-Kamiokande will extend the search.'
  },
  {id:'inflation', color:'#7c5cff',
    time:'10⁻³⁶ – 10⁻³² s', tsec:1e-34,
    temp:'Model-dependent; reheating may reach ~10²⁵–10²⁹ K',
    size:'Absolute size unknown; ≥~10²⁶ linear growth is commonly required',
    density:'Model-dependent (often ~10⁶⁰–10⁸⁰ kg/m³)',
    dominant:'Hypothetical inflation-driving field',
    events:['🚀 Accelerated, nearly exponential expansion in inflationary models','At least ~60 e-folds are usually required; duration and doubling time depend on the model','Quantum fluctuations can seed later cosmic structure','Inflation addresses the horizon, flatness, and relic problems'],
    evidence:'The CMB is nearly uniform and its perturbation spectrum is consistent with many inflation models, but this is not unique proof; primordial inflationary gravitational waves have not been detected.'
  },
  {id:'quark', color:'#5aa8ff',
    time:'10⁻³² – 10⁻⁶ s', tsec:1e-10,
    temp:'10²⁵ → 10¹³ K',
    size:'~100 m → ~0.01 ly (illustrative thermal scaling)',
    density:'10⁶⁰ → 10¹⁷ kg/m³',
    dominant:'Quark-gluon plasma',
    events:['The electroweak crossover occurs at roughly 10⁻¹¹ s; the Higgs field gives W and Z bosons mass','The universe contains a hot quark-gluon plasma','The surviving baryon asymmetry is only about one baryon per billion photons; its origin is unknown'],
    evidence:'Heavy-ion experiments at RHIC and the LHC create and measure quark-gluon plasma; the Higgs boson was discovered in 2012. These test the relevant physics, not the cosmological event directly.'
  },
  {id:'hadron', color:'#5aff8a',
    time:'10⁻⁶ – 1 s', tsec:1e-3,
    temp:'10¹³ → 10¹⁰ K',
    size:'~0.01 → ~13 ly (illustrative thermal scaling)',
    density:'10¹⁷ → 10⁷ kg/m³',
    dominant:'Protons, neutrons, electrons + neutrinos + photons',
    events:['Quarks become confined in hadrons, including protons and neutrons','Most matter and antimatter annihilate, leaving the small baryon excess','Neutrinos decouple at roughly 1 s, forming an undetected cosmic neutrino background','The neutron/proton ratio freezes near 1:5, then falls toward ~1:7 before nucleosynthesis'],
    evidence:'Neutrino background predicted, not yet directly observed. Big Bang nucleosynthesis (below) confirms the n/p ratio.'
  },
  {id:'nucleo', color:'#ffd166',
    time:'1 s – 3 min', tsec:180,
    temp:'10¹⁰ → 10⁹ K',
    size:'~13 → ~127 ly (radius; illustrative thermal scaling)',
    density:'10⁷ → 10⁴ kg/m³',
    dominant:'Bare nuclei (protons, He, trace Li), electrons, photons',
    events:['⚛ Big Bang Nucleosynthesis (BBN)','Protons + neutrons fuse into deuterium, then helium-4','Final light-element mix: ~75% H, ~25% He, trace D, ³He, ⁷Li','Universe still too hot for neutral atoms — remains an ionized plasma'],
    evidence:'Primordial deuterium and helium agree closely with BBN calculations and the CMB baryon density; lithium-7 remains anomalously low by a factor of about three.'
  },
  {id:'photon', color:'#ffb547',
    time:'3 min – 380 kyr', tsec:1e12,
    temp:'10⁹ → 3000 K',
    size:'~127 ly → ~42 million ly (radius)',
    density:'10⁴ → 10⁻¹⁸ kg/m³',
    dominant:'Photon-dominated plasma',
    events:['Universe is opaque, glowing plasma — like the inside of the Sun','Photons scatter off free electrons endlessly (Thomson scattering)','Dark matter starts to cluster gravitationally — invisible scaffolding for future galaxies'],
    evidence:'Predicted state consistent with CMB observations.'
  },
  {id:'recomb', color:'#ff9e5c',
    time:'~380,000 yr', tsec:1.2e13,
    temp:'~3000 K',
    size:'~42 million light-years',
    density:'~10⁻¹⁸ kg/m³',
    dominant:'Neutral hydrogen + helium; free photons',
    events:['🌌 Recombination: electrons bind to nuclei and neutral atoms form','Photons decouple as the universe becomes transparent','Those photons are observed today as the Cosmic Microwave Background (CMB)','This is the earliest event whose light we can directly observe; older neutrino or gravitational-wave relics remain undetected'],
    evidence:'The CMB itself — discovered 1965 (Penzias & Wilson), mapped by COBE, WMAP, Planck. Nobel 1978 & 2006.'
  },
  {id:'darkages', color:'#4a4a7c',
    time:'380 kyr – 150 Myr', tsec:3e15,
    temp:'3000 → 60 K',
    size:'42 Mly → ~3 Gly',
    density:'~10⁻²¹ kg/m³',
    dominant:'Neutral hydrogen + dark matter',
    events:['🌑 The Dark Ages: no stars, no light sources','Only 21-cm hyperfine emission from neutral hydrogen','Dark matter halos grow and merge under gravity','First tiny density peaks begin to collapse'],
    evidence:'Radio experiments seek the 21-cm signal. EDGES reported a feature in 2018, but SARAS 3 did not confirm it and disfavors the original interpretation.'
  },
  {id:'firststars', color:'#ff5c8a',
    time:'~150 – 500 Myr', tsec:1e16,
    temp:'~40 K',
    size:'~5 Gly',
    density:'~10⁻²² kg/m³',
    dominant:'First stars (Pop III) + gas + dark matter',
    events:['✨ Population III stars form from hydrogen and helium with essentially no heavier elements','Models favor characteristic masses of tens to a few hundred Suns, while allowing a broad range','Massive examples live only ~1–3 million years, then explode or collapse to black holes','Their radiation and heavy elements transform later star and galaxy formation'],
    evidence:'No individual Population III star is confirmed. JWST has observed the galaxy JADES-GS-z14-0 at z≈14.3, about 290 Myr after the Big Bang.'
  },
  {id:'reion', color:'#ff6b9d',
    time:'~500 Myr – 1 Gyr', tsec:2.2e16,
    temp:'~20 K',
    size:'~8 Gly',
    density:'~10⁻²³ kg/m³',
    dominant:'Ionized hydrogen (again) + galaxies + dark matter',
    events:['🌟 Reionization: UV from young stars/quasars strips electrons from hydrogen again','Universe becomes transparent to UV light','Galaxies and quasars grow rapidly','Supermassive black holes appear at galactic centers'],
    evidence:'Quasar absorption shows reionization was essentially complete by z≈5.3–6; Planck CMB polarization places its optical-depth midpoint near z≈7.7.'
  },
  {id:'structure', color:'#7ee8c5',
    time:'1 – 9 Gyr', tsec:2e17,
    temp:'~5 K',
    size:'~7 → ~33 Gly (radius)',
    density:'~10⁻²⁶ kg/m³',
    dominant:'Matter (dark + baryonic)',
    events:['Galaxy clusters, filaments, and voids continue to develop','Cosmic star formation peaks roughly 3–4 Gyr after the Big Bang (z≈2)','The Milky Way assembles over billions of years','The Solar System forms about 9.2 Gyr after the Big Bang'],
    evidence:'Redshift surveys (SDSS, DESI) map the cosmic web; simulations (IllustrisTNG) match observations.'
  },
  {id:'now', color:'#ffd166',
    time:'13.8 Gyr (now)', tsec:4.35e17,
    temp:'2.725 K (CMB)',
    size:'~46.5 billion ly (radius; ~93 billion ly across)',
    density:'≈8.5 × 10⁻²⁷ kg/m³ (critical density)',
    dominant:'Dark energy (68.5%) + dark matter (26.6%) + ordinary matter (4.9%)',
    events:['⏰ Present day','Expansion began accelerating about 6 Gyr ago; matter and dark-energy densities became equal later, about 3.5 Gyr ago','A 2025 orbit analysis finds only about a 50% chance that the Milky Way and Andromeda merge within 10 Gyr','The Sun is ~4.6 Gyr old and should leave the main sequence in roughly 5 Gyr','Evidence for life on Earth extends back at least ~3.5 Gyr'],
    evidence:'Planck 2018 gives H₀=67.4±0.5 km/s/Mpc and ρcrit≈8.5×10⁻²⁷ kg/m³. Type Ia supernovae, CMB, and BAO constrain accelerated expansion.'
  },
  {id:'future', color:'#8b93b3',
    time:'~10¹⁰⁰ years (far-future example)', tsec:3.156e107,
    temp:'Approaches de Sitter horizon temperature if Λ is constant',
    size:'Scale factor grows without bound if Λ is constant',
    density:'Approaches constant ρΛ if dark energy is Λ',
    dominant:'Model-dependent; Λ dominates standard extrapolations',
    events:['~10¹⁴ yr: conventional star formation ends in standard estimates','~10¹⁹–10²⁰ yr: many bound systems evaporate dynamically or feed black holes','Proton decay is unobserved; if it occurs, its timescale is model-dependent and >10³⁴ yr','Up to ~10¹⁰⁰ yr: the largest black holes evaporate in standard Hawking calculations','“Heat death” means usable free energy dwindles toward an equilibrium-like state, not a precisely dated event'],
    evidence:'A conditional extrapolation of ΛCDM and known physics, not an observation or prediction with fixed dates. Vacuum stability, dark-energy evolution, proton stability, and quantum gravity could change it.'
  }
];

const EPOCH_I18N = {
  'zh-CN': {
    'planck':{name:'普朗克时期',
      time:'0 – 10⁻⁴³ 秒', temp:'~10³² K(普朗克温度)',
      size:'未知(普朗克长度是物理尺度,不是实测的宇宙大小)',
      density:'~10⁹⁶ kg/m³',
      dominant:'未知——量子引力主导',
      events:['广义相对论与量子场论无法同时可靠适用','需要量子引力理论','相互作用统一和“量子泡沫”都是假说,并非观测结果'],
      evidence:'没有直接证据描述这一时期。弦论、圈量子引力等方案均未得到验证。'},
    'gut':{name:'大统一时期',
      time:'10⁻⁴³ – 10⁻³⁶ 秒', temp:'~10²⁹ K', size:'未知;取决于暴胀前的几何', density:'~10⁸⁰ kg/m³',
      dominant:'假想的大统一场',
      events:['部分模型把大统一放在这一能标','引力此时可能已经与规范相互作用分离','磁单极子与 X/Y 玻色子是模型预言,尚未被发现'],
      evidence:'没有直接证据。超级神冈给出 p→e⁺π⁰ 衰变道 τ/B > 2.4 × 10³⁴ 年的下限;顶级神冈将继续检验。'},
    'inflation':{name:'暴胀时期',
      time:'约 10⁻³⁶ – 10⁻³² 秒', temp:'依模型而定;再加热或达 ~10²⁵–10²⁹ K', size:'绝对大小未知;通常至少需要约 10²⁶ 倍的线性增长', density:'依模型而定(常见估计 ~10⁶⁰–10⁸⁰ kg/m³)',
      dominant:'假想的暴胀驱动场',
      events:['🚀 暴胀模型中的加速、近指数式膨胀','通常至少需要约 60 个 e 折叠;持续时间与倍增时间因模型而异','量子涨落可成为后期宇宙结构的种子','暴胀可解释视界、平坦性与遗迹粒子问题'],
      evidence:'CMB 的高度均匀性与扰动谱符合许多暴胀模型,但并非唯一证明;原初暴胀引力波尚未被探测到。'},
    'quark':{name:'夸克时期',
      time:'10⁻³² – 10⁻⁶ 秒', temp:'10²⁵ → 10¹³ K', size:'~100 米 → ~0.01 光年(热标度示意)', density:'10⁶⁰ → 10¹⁷ kg/m³',
      dominant:'夸克—胶子等离子体',
      events:['电弱交叉转变约发生在 10⁻¹¹ 秒;希格斯场赋予 W、Z 玻色子质量','宇宙充满炽热的夸克—胶子等离子体','残留的重子不对称仅约为每十亿个光子对应一个重子;其起源未知'],
      evidence:'RHIC 与 LHC 的重离子实验能够产生并测量夸克—胶子等离子体;希格斯玻色子于 2012 年发现。这些实验检验相关物理,并非直接重现宇宙事件。'},
    'hadron':{name:'强子时期',
      time:'10⁻⁶ – 1 秒', temp:'10¹³ → 10¹⁰ K', size:'~0.01 → ~13 光年(热标度示意)', density:'10¹⁷ → 10⁷ kg/m³',
      dominant:'质子、中子、电子、中微子、光子',
      events:['夸克被禁闭在质子、中子等强子中','绝大多数物质与反物质湮灭,留下微小的重子过剩','中微子约在 1 秒时退耦,形成尚未直接探测的宇宙中微子背景','中子/质子比冻结在约 1:5,并在核合成前降至约 1:7'],
      evidence:'中微子背景已被预言,尚未直接观测。下方的核合成结果确认了 n/p 比。'},
    'nucleo':{name:'原初核合成',
      time:'1 秒 – 3 分钟', temp:'10¹⁰ → 10⁹ K', size:'~13 → ~127 光年(半径;热标度示意)', density:'10⁷ → 10⁴ kg/m³',
      dominant:'裸原子核(质子、氦、微量锂)、电子、光子',
      events:['⚛ 大爆炸核合成(BBN)','质子与中子聚变为氘,再合成氦-4','最终轻元素比例:~75% 氢、~25% 氦,以及微量 D、³He、⁷Li','宇宙仍太热,无法形成中性原子——保持电离等离子体态'],
      evidence:'原初氘和氦与 BBN 计算及 CMB 重子密度高度吻合;锂-7 的实测丰度仍比理论低约三倍。'},
    'photon':{name:'光子时期',
      time:'3 分钟 – 38 万年', temp:'10⁹ → 3000 K', size:'~127 光年 → ~4200 万光年(半径)', density:'10⁴ → 10⁻¹⁸ kg/m³',
      dominant:'以光子为主的等离子体',
      events:['宇宙不透明,像太阳内部一样发光','光子被自由电子不断散射(汤姆孙散射)','暗物质开始在引力作用下集聚——为未来星系搭建"隐形骨架"'],
      evidence:'该状态与 CMB 观测完全一致。'},
    'recomb':{name:'再复合时期',
      time:'约 38 万年', temp:'~3000 K', size:'~4200 万光年(半径)', density:'~10⁻¹⁸ kg/m³',
      dominant:'中性氢+氦、自由光子',
      events:['🌌 再复合:电子与原子核结合,形成中性原子','光子退耦,宇宙变得透明','这些光子今天被观测为宇宙微波背景辐射(CMB)','这是我们能直接观测到其光的最早事件;更古老的中微子或引力波遗迹尚未被探测到'],
      evidence:'CMB 本身——1965 年由 Penzias & Wilson 发现,COBE、WMAP、Planck 相继绘制。1978、2006 年诺贝尔奖。'},
    'darkages':{name:'黑暗时期',
      time:'38 万 – 1.5 亿年', temp:'3000 → 60 K', size:'4200 万 → ~30 亿光年(半径)', density:'~10⁻²¹ kg/m³',
      dominant:'中性氢 + 暗物质',
      events:['🌑 黑暗时期:没有恒星,没有光源','只有中性氢的 21 厘米超精细辐射','暗物质晕在引力下不断合并、增长','最初的微小密度峰开始塌缩'],
      evidence:'射电实验正在搜寻 21 厘米信号。EDGES 于 2018 年报告一项特征,但 SARAS 3 未能证实,并质疑原始解释。'},
    'firststars':{name:'第一代恒星',
      time:'约 1.5 – 5 亿年', temp:'~40 K', size:'~50 亿光年(半径)', density:'~10⁻²² kg/m³',
      dominant:'星族 III 恒星 + 气体 + 暗物质',
      events:['✨ 星族 III 恒星由氢和氦形成,几乎不含更重元素','模型倾向于几十到几百个太阳质量的特征质量,但允许很宽的范围','其中的大质量恒星仅存活约 100–300 万年,随后爆发或坍缩成黑洞','它们的辐射与重元素改变了后续恒星和星系的形成'],
      evidence:'尚未确认任何单颗星族 III 恒星。JWST 已观测到红移 z≈14.3 的星系 JADES-GS-z14-0,距大爆炸约 2.9 亿年。'},
    'reion':{name:'再电离时期',
      time:'约 5 – 10 亿年', temp:'~20 K', size:'~80 亿光年(半径)', density:'~10⁻²³ kg/m³',
      dominant:'再电离氢 + 星系 + 暗物质',
      events:['🌟 再电离:年轻恒星和类星体的紫外线再次剥离氢原子中的电子','宇宙对紫外线变得透明','星系与类星体快速增长','星系中心出现超大质量黑洞'],
      evidence:'类星体吸收表明再电离在 z≈5.3–6 时基本完成;Planck 的 CMB 偏振结果把其光学深度中点置于 z≈7.7。'},
    'structure':{name:'结构形成时期',
      time:'10 – 90 亿年', temp:'~5 K', size:'~70 → ~330 亿光年(半径)', density:'~10⁻²⁶ kg/m³',
      dominant:'物质(暗+重子)',
      events:['星系团、丝状结构和空洞继续演化','宇宙恒星形成率约在大爆炸后 30–40 亿年达到峰值(z≈2)','银河系经历数十亿年的组装','太阳系约在大爆炸后 92 亿年形成'],
      evidence:'红移巡天(SDSS、DESI)绘制出宇宙网;IllustrisTNG 等模拟结果与观测吻合。'},
    'now':{name:'当下(138 亿年)',
      time:'138 亿年(现在)', temp:'2.725 K(CMB 温度)', size:'~465 亿光年(半径;直径约 930 亿光年)', density:'≈8.5 × 10⁻²⁷ kg/m³(临界密度)',
      dominant:'暗能量(68.5%)+ 暗物质(26.6%)+ 普通物质(4.9%)',
      events:['⏰ 现在','宇宙膨胀约在 60 亿年前开始加速;物质与暗能量密度在更晚的约 35 亿年前相等','2025 年的轨道分析认为,银河系与仙女座在未来 100 亿年内并合的概率仅约 50%','太阳年龄约 46 亿年,预计约 50 亿年后离开主序','地球生命证据至少可追溯至约 35 亿年前'],
      evidence:'Planck 2018 给出 H₀=67.4±0.5 km/s/Mpc 与 ρcrit≈8.5×10⁻²⁷ kg/m³。Ia 型超新星、CMB 和 BAO 共同约束加速膨胀。'},
    'future':{name:'遥远未来示例',
      time:'约 10¹⁰⁰ 年', temp:'若 Λ 恒定,温度趋近德西特视界温度', size:'若 Λ 恒定,尺度因子无限增长', density:'若暗能量为 Λ,则趋近恒定的 ρΛ',
      dominant:'依模型而定;标准外推中由 Λ 主导',
      events:['~10¹⁴ 年:标准估计中常规恒星形成结束','~10¹⁹–10²⁰ 年:许多束缚系统因动力学蒸发而解体或落入黑洞','质子衰变尚未被发现;若存在,其时间尺度依模型而定且 >10³⁴ 年','最长可至 ~10¹⁰⁰ 年:最大黑洞按标准霍金计算蒸发','“热寂”指可用自由能趋于枯竭的近似平衡状态,不是一个有精确日期的事件'],
      evidence:'这是对 ΛCDM 与已知物理的条件性外推,并非观测结果或具有固定日期的预言。真空稳定性、暗能量演化、质子稳定性和量子引力都可能改变结局。'}
  }
};

/* ================ Composition snapshots ================ */
const COMPOSITIONS = {
  'now':    [{k:'de',v:68.5},{k:'dm',v:26.6},{k:'baryon',v:4.9}],
  'recomb': [{k:'photon',v:15},{k:'dm',v:63},{k:'baryon',v:12},{k:'neutrino',v:10}],
  'nucleo': [{k:'radiation',v:99.99915},{k:'dm',v:0.00072},{k:'baryon',v:0.00013}]
};

/* ================ Fates ================ */
const FATES = {
  'en': [
    {icon:'🥶', name:'Big Freeze / Heat Death', likely:'Favored if dark energy is a stable Λ', desc:'Accelerated expansion continues, ordinary star formation ends, and black holes eventually evaporate. Usable free energy dwindles toward an equilibrium-like state; all dates are extrapolations.'},
    {icon:'💥', name:'Big Rip', likely:'Only if w stays below −1', desc:'Persistently strengthening “phantom” dark energy could eventually unbind galaxies, planetary systems, and atoms. Current data do not require this scenario.'},
    {icon:'🎯', name:'Big Crunch', likely:'Strongly disfavored in current ΛCDM fits', desc:'Recollapse would require dark energy to evolve dramatically or become negative. Current expansion and near-flat geometry do not imply a future crunch, but unknown dark-energy physics prevents an absolute exclusion.'},
    {icon:'🔁', name:'Big Bounce', likely:'Speculative', desc:'Some quantum-gravity and cyclic models replace a singular crunch or bang with a bounce. No observation currently selects these models.'},
    {icon:'⚠', name:'Vacuum Decay', likely:'Allowed in some models; rate unknown', desc:'If our vacuum is metastable, a lower-energy vacuum bubble could alter particle physics as it expands. Theory does not provide an experimentally established lifetime.'}
  ],
  'zh-CN': [
    {icon:'🥶', name:'大冻结 / 热寂', likely:'若暗能量是稳定的 Λ,则最受支持', desc:'加速膨胀持续,常规恒星形成结束,黑洞最终蒸发。可用自由能逐渐枯竭,趋于近似平衡状态;所有年代均为外推。'},
    {icon:'💥', name:'大撕裂', likely:'仅当 w 持续小于 −1', desc:'持续增强的“幻影”暗能量可能最终解除星系、行星系统乃至原子的束缚。现有数据并不要求这一情景。'},
    {icon:'🎯', name:'大坍缩', likely:'在当前 ΛCDM 拟合中被强烈排斥', desc:'重新坍缩要求暗能量发生剧烈演化或变为负值。当前膨胀与近乎平坦的几何并不指向未来坍缩,但未知的暗能量物理使绝对排除仍不严谨。'},
    {icon:'🔁', name:'大反弹', likely:'推测性模型', desc:'部分量子引力与循环宇宙模型以反弹替代奇点式坍缩或大爆炸。目前没有观测能够选定这些模型。'},
    {icon:'⚠', name:'真空衰变', likely:'部分模型允许;发生率未知', desc:'如果当前真空是亚稳态,更低能量的真空泡可能在扩张时改变粒子物理。理论尚未给出经过实验确认的寿命。'}
  ]
};

/* ================ Mysteries ================ */
const MYSTERIES = {
  'en': [
    {name:'What is dark matter?', desc:'About 84% of matter is non-baryonic dark matter. Its gravity shapes galaxies, lensing, and the cosmic web, but no dark-matter particle has been identified. Candidates include axions, WIMPs, and limited primordial-black-hole mass ranges.'},
    {name:'What is dark energy?', desc:'About 68.5% of today\'s mass–energy budget in Planck ΛCDM. It may be a cosmological constant, a dynamic field, or a sign that gravity needs modification; its physical origin is unknown.'},
    {name:'Why is there matter, not antimatter?', desc:'The observable universe contains a tiny excess of baryons over antibaryons. Known Standard-Model CP violation appears insufficient, so the mechanism of baryogenesis remains unknown.'},
    {name:'What caused inflation?', desc:'The inflaton field is a placeholder. What quantum field actually drove the exponential expansion? Where did it come from? Where did it go?'},
    {name:'What preceded the hot Big Bang?', desc:'Classical general relativity cannot be extrapolated reliably through its initial singular boundary. A bounce, an earlier phase, or no meaningful “before” are model-dependent possibilities without observational confirmation.'},
    {name:'The Hubble tension', desc:'Planck ΛCDM infers H₀=67.4±0.5 km/s/Mpc, while the SH0ES distance ladder finds 73.04±1.04 km/s/Mpc, a roughly 5σ difference. JWST Cepheid checks support the local calibration, but hidden systematics or physics beyond ΛCDM remain possible.'},
    {name:'Are there other universes?', desc:'Some eternal-inflation and string-landscape models permit causally disconnected regions with different effective physics. Neither a multiverse nor a frequently quoted landscape count is observationally established.'},
    {name:'Why these constants?', desc:'Particle masses and interaction strengths are measured inputs to the Standard Model. Whether their values follow from deeper theory, selection effects, or contingency remains open.'}
  ],
  'zh-CN': [
    {name:'暗物质到底是什么?', desc:'约 84% 的物质是非重子暗物质。它的引力塑造星系、引力透镜和宇宙网,但尚未确认任何暗物质粒子。候选者包括轴子、WIMP,以及质量范围受到严格限制的原初黑洞。'},
    {name:'暗能量到底是什么?', desc:'在 Planck ΛCDM 中,暗能量约占今天质能总量的 68.5%。它可能是宇宙学常数、动力学场,也可能意味着引力理论需要修改;其物理起源未知。'},
    {name:'为什么宇宙由物质而不是反物质构成?', desc:'可观测宇宙中的重子只比反重子多出极小比例。标准模型中已知的 CP 破坏似乎不足以解释它,重子生成机制仍然未知。'},
    {name:'究竟是什么触发了暴胀?', desc:'"暴胀子场"只是一个占位符。到底是哪一种量子场推动了指数式膨胀?它从何而来?最后又去了哪里?'},
    {name:'热大爆炸之前是什么?', desc:'经典广义相对论无法可靠地穿过其初始奇点边界外推。反弹、更早阶段,或“之前”没有物理意义,都是依赖模型且未获观测证实的可能性。'},
    {name:'哈勃张力', desc:'Planck ΛCDM 推断 H₀=67.4±0.5 km/s/Mpc,SH0ES 距离阶梯测得 73.04±1.04 km/s/Mpc,相差约 5σ。JWST 的造父变星校验支持本地标定,但未知系统误差或超出 ΛCDM 的新物理仍有可能。'},
    {name:'是否存在其他宇宙?', desc:'部分永恒暴胀与弦景观模型允许存在因果隔离、有效物理不同的区域。多宇宙及常被引用的景观数量都未得到观测证实。'},
    {name:'为什么是这些常数?', desc:'粒子质量与相互作用强度是标准模型中的实测输入。它们究竟源于更深层理论、选择效应还是偶然,仍是开放问题。'}
  ]
};

/* ================ apply / helpers ================ */
function formatCosmicTime(tsec, lang='en'){
  const zh = lang === 'zh-CN';
  if(tsec < 1e-30) return `10^${Math.round(Math.log10(tsec))} ${zh?'秒':'s'}`;
  if(tsec < 1e-15) return tsec.toExponential(1)+' '+(zh?'秒':'s');
  if(tsec < 1)     return tsec.toExponential(2)+' '+(zh?'秒':'s');
  if(tsec < 60)    return tsec.toFixed(1)+' '+(zh?'秒':'s');
  if(tsec < 3600)  return (tsec/60).toFixed(1)+' '+(zh?'分钟':'min');
  if(tsec < 86400) return (tsec/3600).toFixed(1)+' '+(zh?'小时':'hr');

  const yr = tsec/3.156e7;
  if(yr < 1) return (yr*365).toFixed(1)+' '+(zh?'天':'days');
  if(zh){
    if(yr < 1e4)  return yr.toFixed(0)+' 年';
    if(yr < 1e8)  return (yr/1e4).toFixed(1)+' 万年';
    if(yr < 1e12) return (yr/1e8).toFixed(2)+' 亿年';
    return `10^${Math.round(Math.log10(yr))} 年`;
  }
  if(yr < 1e3)  return yr.toFixed(0)+' yr';
  if(yr < 1e6)  return (yr/1e3).toFixed(1)+' kyr';
  if(yr < 1e9)  return (yr/1e6).toFixed(1)+' Myr';
  if(yr < 1e12) return (yr/1e9).toFixed(2)+' Gyr';
  return `10^${Math.round(Math.log10(yr))} yr`;
}

function applyI18n(lang){
  const dict = LOCALES[lang] || LOCALES.en;
  document.documentElement.lang = (lang==='zh-CN' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]!==undefined) el.innerHTML = dict[key];
  });
  const titleEl = document.querySelector('title');
  if(titleEl?.getAttribute('data-i18n')) document.title = dict[titleEl.getAttribute('data-i18n')] || document.title;
  document.querySelectorAll('.lang-pill').forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
  window.CURRENT_LANG = lang;
  if(typeof renderTimeline==='function') renderTimeline();
  if(typeof renderFates==='function')     renderFates();
  if(typeof renderMysteries==='function') renderMysteries();
  if(typeof renderComposition==='function') renderComposition();
  if(typeof updateMachine==='function')   updateMachine();
}
function getEpoch(id){
  const base = EPOCHS.find(e=>e.id===id);
  if(!base) return null;
  const lang = window.CURRENT_LANG || 'en';
  const over = EPOCH_I18N[lang]?.[id];
  return over ? Object.assign({}, base, over) : base;
}
