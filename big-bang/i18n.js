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
    'timeline.desc': 'Every epoch since t = 0. Click a card to zoom in.',

    'card.time': 'Time',
    'card.temp': 'Temperature',
    'card.size': 'Size of observable universe',
    'card.density': 'Energy density',
    'card.dominant': 'Dominant content',
    'card.events': 'What happened',
    'card.evidence': 'How we know',

    'machine.h2': 'Cosmic Time Machine',
    'machine.desc': 'Drag the slider through 13.8 billion years of cosmic history. Log scale — each step is a factor of 10.',
    'machine.temp': 'Temperature',
    'machine.size': 'Observable universe radius',
    'machine.density': 'Energy density',
    'machine.dominant': 'What exists',
    'machine.epoch': 'Epoch',
    'machine.event': 'Key event',

    'comp.h2': 'What is the Universe made of?',
    'comp.desc': 'The mix has changed dramatically over cosmic history. Today, only 5% of the universe is ordinary matter.',
    'comp.today': 'Today (13.8 Gyr)',
    'comp.recomb': 'At recombination (380 kyr)',
    'comp.nucleo': 'After nucleosynthesis (3 min)',
    'comp.legend.baryon': 'Ordinary matter',
    'comp.legend.dm': 'Dark matter',
    'comp.legend.de': 'Dark energy',
    'comp.legend.photon': 'Photons',
    'comp.legend.neutrino': 'Neutrinos',
    'comp.legend.radiation': 'Radiation',
    'comp.legend.plasma': 'Ionized plasma',

    'scale.h2': 'How big was the universe?',
    'scale.desc': 'The <b>observable</b> universe grew from smaller than an atom to 93 billion light-years across. (The full universe may be infinite — we simply cannot see beyond the horizon.)',
    'scale.now': 'now',
    'scale.compare': 'Compare to',

    'fates.h2': 'How does it end?',
    'fates.desc': 'The universe\'s ultimate fate depends on the density of dark energy. Three main scenarios are debated.',

    'myst.h2': 'What we still don\'t know',
    'myst.desc': 'Cosmology has spectacular successes — and equally spectacular open problems.',

    'footer': 'Values from Planck 2018 (Λ-CDM), NASA/ESA, and PDG.'
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
    'timeline.desc': '从 t = 0 起的每一个纪元。点击卡片可查看细节。',

    'card.time': '时刻',
    'card.temp': '温度',
    'card.size': '可观测宇宙尺度',
    'card.density': '能量密度',
    'card.dominant': '主导成分',
    'card.events': '发生了什么',
    'card.evidence': '证据来源',

    'machine.h2': '宇宙时间机器',
    'machine.desc': '拖动滑块穿越 138 亿年宇宙史。对数刻度——每一格代表十倍时间差。',
    'machine.temp': '温度',
    'machine.size': '可观测宇宙半径',
    'machine.density': '能量密度',
    'machine.dominant': '此时存在的东西',
    'machine.epoch': '所处纪元',
    'machine.event': '关键事件',

    'comp.h2': '宇宙由什么构成?',
    'comp.desc': '宇宙的成分随时间发生了剧烈变化。今天,普通物质仅占 5%。',
    'comp.today': '今天(138 亿年)',
    'comp.recomb': '再复合时期(38 万年)',
    'comp.nucleo': '核合成之后(3 分钟)',
    'comp.legend.baryon': '普通物质',
    'comp.legend.dm': '暗物质',
    'comp.legend.de': '暗能量',
    'comp.legend.photon': '光子',
    'comp.legend.neutrino': '中微子',
    'comp.legend.radiation': '辐射',
    'comp.legend.plasma': '电离等离子体',

    'scale.h2': '宇宙那时有多大?',
    'scale.desc': '<b>可观测</b>宇宙从比一个原子还小,膨胀到 930 亿光年跨度。(整个宇宙可能是无限的——我们只是看不到视界之外。)',
    'scale.now': '今天',
    'scale.compare': '相当于',

    'fates.h2': '宇宙将如何终结?',
    'fates.desc': '宇宙的最终命运取决于暗能量的密度。目前主要有三种假说。',

    'myst.h2': '我们至今仍不知道的事',
    'myst.desc': '宇宙学既有辉煌的成功,也有同样辉煌的未解之谜。',

    'footer': '数据取自 Planck 2018 (Λ-CDM)、NASA/ESA 与 PDG。'
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
    size:'~10⁻³⁵ m (Planck length)',
    density:'~10⁹⁶ kg/m³',
    dominant:'Unknown — quantum gravity',
    events:['All four forces unified into one','Space, time, and matter indistinguishable','Known physics breaks down completely','A "quantum foam" of virtual black holes and geometry'],
    evidence:'None — no theory yet spans this regime. String theory and loop quantum gravity are candidates.'
  },
  {id:'gut', color:'#c77dff',
    time:'10⁻⁴³ – 10⁻³⁶ s', tsec:1e-38,
    temp:'~10²⁹ K',
    size:'~10⁻³⁰ m',
    density:'~10⁸⁰ kg/m³',
    dominant:'Unified force + primordial soup',
    events:['Gravity separates from the other three forces','Grand Unified Theory (GUT) regime — strong, weak, and EM still unified','Possible magnetic monopoles created here','X and Y bosons mediate baryon-number violation'],
    evidence:'Indirect. GUT predicts a proton lifetime > 10³⁴ years — being tested by Super-K, Hyper-K.'
  },
  {id:'inflation', color:'#7c5cff',
    time:'10⁻³⁶ – 10⁻³² s', tsec:1e-34,
    temp:'~10²⁷ K → drops',
    size:'grows by ~10²⁶ (from ~10⁻²⁷ m to a marble)',
    density:'~10⁷⁰ kg/m³',
    dominant:'Inflaton field',
    events:['🚀 Cosmic INFLATION: exponential expansion','Universe doubles in size every ~10⁻³⁷ seconds','Quantum fluctuations stretched to cosmic scales — seeds of all future galaxies','Solves horizon, flatness, and monopole problems'],
    evidence:'CMB temperature is uniform to 1 part in 10⁵; tiny fluctuations match inflation predictions exactly.'
  },
  {id:'quark', color:'#5aa8ff',
    time:'10⁻³² – 10⁻⁶ s', tsec:1e-10,
    temp:'10²⁵ → 10¹³ K',
    size:'marble → solar system',
    density:'10⁶⁰ → 10¹⁷ kg/m³',
    dominant:'Quark-gluon plasma',
    events:['Electroweak symmetry breaks: W, Z bosons get mass via Higgs (10⁻¹² s)','Quarks, leptons, and all Standard-Model particles now distinct','Baryogenesis: tiny asymmetry — 1 extra quark per ~10⁹ antiquarks — leaves surviving matter','Universe is a hot quark-gluon plasma'],
    evidence:'Recreated at RHIC (2000) and LHC (2010) as quark-gluon plasma. LHC directly measures the Higgs.'
  },
  {id:'hadron', color:'#5aff8a',
    time:'10⁻⁶ – 1 s', tsec:1e-3,
    temp:'10¹³ → 10¹⁰ K',
    size:'~solar system → ~galaxy',
    density:'10¹⁷ → 10⁷ kg/m³',
    dominant:'Protons, neutrons, electrons + neutrinos + photons',
    events:['Quarks confine into protons and neutrons','Matter-antimatter annihilation nearly completes → sea of photons','Neutrinos decouple at ~1 s (form the "cosmic neutrino background" — still there today)','Neutron/proton ratio freezes at ~1:6'],
    evidence:'Neutrino background predicted, not yet directly observed. Big Bang nucleosynthesis (below) confirms the n/p ratio.'
  },
  {id:'nucleo', color:'#ffd166',
    time:'1 s – 3 min', tsec:180,
    temp:'10¹⁰ → 10⁹ K',
    size:'~a few light-years',
    density:'10⁷ → 10⁴ kg/m³',
    dominant:'Bare nuclei (protons, He, trace Li), electrons, photons',
    events:['⚛ Big Bang Nucleosynthesis (BBN)','Protons + neutrons fuse into deuterium, then helium-4','Final light-element mix: ~75% H, ~25% He, trace D, ³He, ⁷Li','Universe still too hot for neutral atoms — remains an ionized plasma'],
    evidence:'Measured abundances of primordial D, He, Li match BBN theory to a few percent — one of Big Bang cosmology\'s greatest successes.'
  },
  {id:'photon', color:'#ffb547',
    time:'3 min – 380 kyr', tsec:1e12,
    temp:'10⁹ → 3000 K',
    size:'~a few thousand light-years',
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
    events:['🌌 RECOMBINATION: electrons finally bind to nuclei → neutral atoms form','Photons escape freely for the first time → the universe becomes transparent','Those photons still travel today: the Cosmic Microwave Background (CMB)','This is the earliest event we can directly see'],
    evidence:'The CMB itself — discovered 1965 (Penzias & Wilson), mapped by COBE, WMAP, Planck. Nobel 1978 & 2006.'
  },
  {id:'darkages', color:'#4a4a7c',
    time:'380 kyr – 150 Myr', tsec:5e15,
    temp:'3000 → 60 K',
    size:'42 Mly → ~3 Gly',
    density:'~10⁻²¹ kg/m³',
    dominant:'Neutral hydrogen + dark matter',
    events:['🌑 The Dark Ages: no stars, no light sources','Only 21-cm hyperfine emission from neutral hydrogen','Dark matter halos grow and merge under gravity','First tiny density peaks begin to collapse'],
    evidence:'Hunted by radio telescopes (LOFAR, SKA) via 21-cm signal. EDGES claimed detection 2018 — disputed.'
  },
  {id:'firststars', color:'#ff5c8a',
    time:'~150 – 500 Myr', tsec:2e16,
    temp:'~40 K',
    size:'~5 Gly',
    density:'~10⁻²² kg/m³',
    dominant:'First stars (Pop III) + gas + dark matter',
    events:['✨ First stars ignite (Population III) — hydrogen only, extremely massive (100 – 1000 M☉)','They die in seconds to millions of years, seeding the cosmos with the first metals','First galaxies begin to form','UV light from stars starts to re-ionize surrounding hydrogen'],
    evidence:'JWST (2022–) has detected galaxies as early as z=14 (~290 Myr after Big Bang), reshaping our timeline.'
  },
  {id:'reion', color:'#ff6b9d',
    time:'~500 Myr – 1 Gyr', tsec:2e16,
    temp:'~20 K',
    size:'~8 Gly',
    density:'~10⁻²³ kg/m³',
    dominant:'Ionized hydrogen (again) + galaxies + dark matter',
    events:['🌟 Reionization: UV from young stars/quasars strips electrons from hydrogen again','Universe becomes transparent to UV light','Galaxies and quasars grow rapidly','Supermassive black holes appear at galactic centers'],
    evidence:'Absorption lines toward distant quasars (Gunn-Peterson trough) mark the end of reionization at z~6.'
  },
  {id:'structure', color:'#7ee8c5',
    time:'1 – 9 Gyr', tsec:3e17,
    temp:'~5 K',
    size:'~50 Gly',
    density:'~10⁻²⁶ kg/m³',
    dominant:'Matter (dark + baryonic)',
    events:['Galaxy clusters and superclusters form','Cosmic web crystallizes — filaments and voids','Peak star formation at ~3-4 Gyr (redshift z≈2)','Milky Way\'s progenitor forms; Sun will not exist yet','9.2 Gyr after Big Bang: Solar System forms'],
    evidence:'Redshift surveys (SDSS, DESI) map the cosmic web; simulations (IllustrisTNG) match observations.'
  },
  {id:'now', color:'#ffd166',
    time:'13.8 Gyr (now)', tsec:4.35e17,
    temp:'2.725 K (CMB)',
    size:'~93 billion light-years (diameter)',
    density:'9.47 × 10⁻²⁷ kg/m³',
    dominant:'Dark energy (68%) + dark matter (27%) + ordinary matter (5%)',
    events:['⏰ Present day','Dark energy took over ~5 Gyr ago; expansion is now accelerating','Milky Way and Andromeda approaching — collision in ~4.5 Gyr','Sun is ~4.6 Gyr old, will die in ~5 Gyr','Life on Earth: ~3.8 Gyr'],
    evidence:'Type Ia supernovae (1998 — Nobel 2011) show acceleration; CMB + BAO measure geometry.'
  },
  {id:'future', color:'#8b93b3',
    time:'10¹⁰⁰ years (future)', tsec:1e100,
    temp:'→ 0 K',
    size:'→ ∞ (accelerating)',
    density:'→ ρ_Λ (dark energy)',
    dominant:'Dark energy — matter dilutes to nothing',
    events:['~10¹⁴ y: last stars burn out','~10²⁰ y: galaxies disperse or fall into black holes','~10⁴⁰ y: protons may decay (if GUT is right)','~10¹⁰⁰ y: last supermassive black holes evaporate via Hawking radiation','Heat death: universe reaches maximum entropy, nothing more can happen'],
    evidence:'Extrapolation of Λ-CDM. Depends on stability of vacuum, dark energy behavior, proton decay.'
  }
];

const EPOCH_I18N = {
  'zh-CN': {
    'planck':{name:'普朗克时期',
      temp:'~10³² K(普朗克温度)',
      size:'~10⁻³⁵ 米(普朗克长度)',
      density:'~10⁹⁶ kg/m³',
      dominant:'未知——量子引力主导',
      events:['四种基本相互作用融为一体','空间、时间与物质无法区分','已知物理学在此完全失效','时空呈"量子泡沫"状,充满虚黑洞与几何涨落'],
      evidence:'尚无理论能描述这一区间。弦论与圈量子引力是候选者。'},
    'gut':{name:'大统一时期',
      temp:'~10²⁹ K', size:'~10⁻³⁰ 米', density:'~10⁸⁰ kg/m³',
      dominant:'统一相互作用 + 原初粒子汤',
      events:['引力从其它三种相互作用中分离','大统一(GUT)阶段——强、弱、电磁仍统一','此期间可能生成磁单极子','X、Y 玻色子导致重子数破缺'],
      evidence:'间接证据。GUT 预言质子寿命 > 10³⁴ 年——正由超级神冈、下一代 Hyper-K 检验。'},
    'inflation':{name:'暴胀时期',
      temp:'~10²⁷ K → 骤降', size:'膨胀约 10²⁶ 倍(从 10⁻²⁷ 米到弹珠大小)', density:'~10⁷⁰ kg/m³',
      dominant:'暴胀子场',
      events:['🚀 宇宙暴胀:指数式膨胀','宇宙每 10⁻³⁷ 秒直径翻倍','量子涨落被拉伸到宇宙尺度——所有未来星系的"种子"','一举解决视界、平坦性、磁单极子问题'],
      evidence:'CMB 温度均匀度达 1/10⁵,微小涨落与暴胀预言完美吻合。'},
    'quark':{name:'夸克时期',
      temp:'10²⁵ → 10¹³ K', size:'弹珠 → 太阳系', density:'10⁶⁰ → 10¹⁷ kg/m³',
      dominant:'夸克—胶子等离子体',
      events:['电弱对称破缺:W、Z 玻色子通过希格斯机制获得质量(10⁻¹² 秒)','夸克、轻子及全部标准模型粒子开始区分','重子生成:每约 10⁹ 个反夸克中多出 1 个夸克——留下如今可见的物质','宇宙是炽热的夸克—胶子等离子体'],
      evidence:'2000 年 RHIC、2010 年 LHC 均重现了夸克—胶子等离子体。LHC 直接观测到希格斯粒子。'},
    'hadron':{name:'强子时期',
      temp:'10¹³ → 10¹⁰ K', size:'太阳系 → 星系尺度', density:'10¹⁷ → 10⁷ kg/m³',
      dominant:'质子、中子、电子、中微子、光子',
      events:['夸克被禁闭进质子和中子','正反物质湮灭几近完成 → 光子海洋','中微子在 ~1 秒时退耦(形成"宇宙中微子背景",至今仍存在)','中子/质子比冻结在约 1:6'],
      evidence:'中微子背景已被预言,尚未直接观测。下方的核合成结果确认了 n/p 比。'},
    'nucleo':{name:'原初核合成',
      temp:'10¹⁰ → 10⁹ K', size:'~几光年', density:'10⁷ → 10⁴ kg/m³',
      dominant:'裸原子核(质子、氦、微量锂)、电子、光子',
      events:['⚛ 大爆炸核合成(BBN)','质子与中子聚变为氘,再合成氦-4','最终轻元素比例:~75% 氢、~25% 氦,以及微量 D、³He、⁷Li','宇宙仍太热,无法形成中性原子——保持电离等离子体态'],
      evidence:'实测原初 D、He、Li 丰度与 BBN 理论精度达百分之几,是大爆炸宇宙学最辉煌的成就之一。'},
    'photon':{name:'光子时期',
      temp:'10⁹ → 3000 K', size:'~几千光年', density:'10⁴ → 10⁻¹⁸ kg/m³',
      dominant:'以光子为主的等离子体',
      events:['宇宙不透明,像太阳内部一样发光','光子被自由电子不断散射(汤姆孙散射)','暗物质开始在引力作用下集聚——为未来星系搭建"隐形骨架"'],
      evidence:'该状态与 CMB 观测完全一致。'},
    'recomb':{name:'再复合时期',
      temp:'~3000 K', size:'~4200 万光年', density:'~10⁻¹⁸ kg/m³',
      dominant:'中性氢+氦、自由光子',
      events:['🌌 再复合:电子终于与原子核结合,形成中性原子','光子首次自由传播 → 宇宙变透明','这些光子至今仍在传播:宇宙微波背景辐射(CMB)','这是我们能直接"看到"的最早事件'],
      evidence:'CMB 本身——1965 年由 Penzias & Wilson 发现,COBE、WMAP、Planck 相继绘制。1978、2006 年诺贝尔奖。'},
    'darkages':{name:'黑暗时期',
      temp:'3000 → 60 K', size:'4200 万 → ~30 亿光年', density:'~10⁻²¹ kg/m³',
      dominant:'中性氢 + 暗物质',
      events:['🌑 黑暗时期:没有恒星,没有光源','只有中性氢的 21 厘米超精细辐射','暗物质晕在引力下不断合并、增长','最初的微小密度峰开始塌缩'],
      evidence:'由 LOFAR、SKA 等射电望远镜通过 21 cm 信号搜寻。EDGES 于 2018 年宣称检测到,尚有争议。'},
    'firststars':{name:'第一代恒星',
      temp:'~40 K', size:'~50 亿光年', density:'~10⁻²² kg/m³',
      dominant:'第一代恒星(Pop III)+ 气体 + 暗物质',
      events:['✨ 第一代恒星点燃(Population III)——仅由氢构成,质量极大(100 – 1000 太阳质量)','它们在数秒至数百万年内死亡,把最早的重元素撒向宇宙','最早的星系开始形成','恒星紫外光开始重新电离周围的氢'],
      evidence:'JWST(2022 起)已探测到 z=14 (大爆炸后约 2.9 亿年)的星系,大幅改写了时间线。'},
    'reion':{name:'再电离时期',
      temp:'~20 K', size:'~80 亿光年', density:'~10⁻²³ kg/m³',
      dominant:'再电离氢 + 星系 + 暗物质',
      events:['🌟 再电离:年轻恒星和类星体的紫外线再次剥离氢原子中的电子','宇宙对紫外线变得透明','星系与类星体快速增长','星系中心出现超大质量黑洞'],
      evidence:'来自遥远类星体的吸收线(Gunn-Peterson 槽)标示了 z~6 附近再电离的完成。'},
    'structure':{name:'结构形成时期',
      temp:'~5 K', size:'~500 亿光年', density:'~10⁻²⁶ kg/m³',
      dominant:'物质(暗+重子)',
      events:['星系团、超星系团逐渐形成','宇宙网结晶——由丝状结构和空洞组成','恒星形成在 ~30-40 亿年时达到顶峰(红移 z≈2)','银河系前身形成;太阳系尚未诞生','大爆炸后 92 亿年:太阳系形成'],
      evidence:'红移巡天(SDSS、DESI)绘制出宇宙网;IllustrisTNG 等模拟结果与观测吻合。'},
    'now':{name:'当下(138 亿年)',
      temp:'2.725 K(CMB 温度)', size:'~930 亿光年(直径)', density:'9.47 × 10⁻²⁷ kg/m³',
      dominant:'暗能量(68%)+ 暗物质(27%)+ 普通物质(5%)',
      events:['⏰ 现在','暗能量在约 50 亿年前接管,宇宙膨胀开始加速','银河系与仙女座正在靠近——将在约 45 亿年后碰撞','太阳已 46 亿岁,将在约 50 亿年后死亡','地球生命历史约 38 亿年'],
      evidence:'Ia 型超新星(1998,2011 年诺贝尔奖)证实加速膨胀;CMB + BAO 测量宇宙几何。'},
    'future':{name:'遥远未来(10¹⁰⁰ 年)',
      temp:'→ 0 K', size:'→ ∞(加速膨胀)', density:'→ ρ_Λ(暗能量密度)',
      dominant:'暗能量——物质稀释至几乎为零',
      events:['~10¹⁴ 年:最后一批恒星耗尽','~10²⁰ 年:星系分崩离析或坠入黑洞','~10⁴⁰ 年:质子可能衰变(若 GUT 成立)','~10¹⁰⁰ 年:最后的超大质量黑洞通过霍金辐射蒸发','热寂:宇宙达到最大熵,再无任何变化可能发生'],
      evidence:'基于 Λ-CDM 的外推,取决于真空稳定性、暗能量行为、质子是否衰变。'}
  }
};

/* ================ Composition snapshots ================ */
const COMPOSITIONS = {
  'now':    [{k:'de',v:68.3},{k:'dm',v:26.8},{k:'baryon',v:4.9}],
  'recomb': [{k:'photon',v:15},{k:'dm',v:63},{k:'baryon',v:12},{k:'neutrino',v:10}],
  'nucleo': [{k:'radiation',v:85},{k:'plasma',v:15}]
};

/* ================ Fates ================ */
const FATES = {
  'en': [
    {icon:'🥶', name:'Big Freeze / Heat Death', likely:'Most likely (Λ-CDM)', desc:'Expansion continues forever. Stars die out, black holes evaporate, entropy reaches maximum. Nothing meaningful can happen.'},
    {icon:'💥', name:'Big Rip', likely:'If dark energy strengthens (w < -1)', desc:'"Phantom" dark energy grows over time. Eventually it tears apart galaxies, then solar systems, then atoms — all in the final seconds before the rip.'},
    {icon:'🎯', name:'Big Crunch', likely:'Ruled out by current data', desc:'If dark energy reversed sign, gravity would win. All matter would collapse back into a singularity — a mirror image of the Big Bang.'},
    {icon:'🔁', name:'Big Bounce', likely:'Speculative', desc:'A crunch that "bounces" into a new Big Bang. Cyclic cosmology or loop quantum gravity models predict this.'},
    {icon:'⚠', name:'Vacuum Decay', likely:'Possible but rare', desc:'The Higgs vacuum may be metastable. A bubble of true vacuum could nucleate anywhere, expanding at nearly light speed and rewriting physics.'}
  ],
  'zh-CN': [
    {icon:'🥶', name:'大冻结 / 热寂', likely:'最可能(Λ-CDM 模型)', desc:'宇宙持续膨胀。恒星耗尽,黑洞蒸发,熵达到最大值。任何有意义的事件都无法再发生。'},
    {icon:'💥', name:'大撕裂', likely:'若暗能量随时间增强(w < -1)', desc:'"幻影"暗能量不断增强,最终把星系、星系内的行星系、乃至原子在大撕裂前的最后几秒撕碎。'},
    {icon:'🎯', name:'大坍缩', likely:'当前数据已基本排除', desc:'如果暗能量改变符号,引力将占上风。所有物质将坍缩回一个奇点——大爆炸的镜像。'},
    {icon:'🔁', name:'大反弹', likely:'纯猜想', desc:'一次大坍缩"反弹"成新的大爆炸。循环宇宙学与圈量子引力模型对此有所讨论。'},
    {icon:'⚠', name:'真空衰变', likely:'可能存在,概率极低', desc:'希格斯真空可能是亚稳态。任意一处若成核出一个"真真空"泡,它会以近光速扩张,重写全部物理定律。'}
  ]
};

/* ================ Mysteries ================ */
const MYSTERIES = {
  'en': [
    {name:'What is dark matter?', desc:'85% of matter in the universe. Bends light, holds galaxies together. But no particle detector has ever caught one directly. Candidates: WIMPs, axions, sterile neutrinos, primordial black holes.'},
    {name:'What is dark energy?', desc:'68% of the universe. Drives accelerating expansion. Could be Einstein\'s cosmological constant (Λ), a dynamic field (quintessence), or modified gravity. We have no idea.'},
    {name:'Why is there matter, not antimatter?', desc:'The early universe should have made equal parts — everything should have annihilated. Instead we have galaxies. This "baryon asymmetry" needs new CP-violating physics.'},
    {name:'What caused inflation?', desc:'The inflaton field is a placeholder. What quantum field actually drove the exponential expansion? Where did it come from? Where did it go?'},
    {name:'What was before the Big Bang?', desc:'General relativity says "time started here." But GR breaks down at the Planck scale. Was there a bounce? A collision of branes? A quantum foam? Nobody knows.'},
    {name:'The Hubble tension', desc:'The universe\'s expansion rate measured from the CMB (67.4 km/s/Mpc) disagrees with the local measurement (73 km/s/Mpc) at 5σ. Either one measurement is wrong, or new physics is needed.'},
    {name:'Are there other universes?', desc:'Inflation naturally produces infinite bubble universes with possibly different physical constants. String theory predicts ~10⁵⁰⁰ possibilities. Untestable, so far.'},
    {name:'Why these constants?', desc:'The strengths of the four forces, the masses of particles — all seem finely tuned for stars, chemistry, and life. Anthropic accident? Deeper law? Multiverse selection?'}
  ],
  'zh-CN': [
    {name:'暗物质到底是什么?', desc:'占宇宙物质的 85%,能弯曲光线,把星系维持在一起。但从未有任何粒子探测器捕捉到它。候选者:弱作用重粒子(WIMP)、轴子、惰性中微子、原初黑洞。'},
    {name:'暗能量到底是什么?', desc:'占宇宙总量的 68%,驱动加速膨胀。它可能是爱因斯坦的宇宙学常数 Λ、某种动力学场(quintessence),或是修正引力理论的信号。目前完全无解。'},
    {name:'为什么宇宙由物质而不是反物质构成?', desc:'早期宇宙本应正反物质等量产生——一切早该湮灭殆尽。然而我们却拥有星系。这一"重子不对称性"需要新的 CP 破坏物理来解释。'},
    {name:'究竟是什么触发了暴胀?', desc:'"暴胀子场"只是一个占位符。到底是哪一种量子场推动了指数式膨胀?它从何而来?最后又去了哪里?'},
    {name:'大爆炸之前有什么?', desc:'广义相对论认为"时间从这里开始"。但广义相对论在普朗克尺度失效。是一次反弹?两张膜的碰撞?量子泡沫?没有人知道。'},
    {name:'哈勃张力', desc:'由 CMB 测得的宇宙膨胀率(67.4 km/s/Mpc)与本地方法(73 km/s/Mpc)相差达 5σ。要么某一个测量错了,要么需要新物理。'},
    {name:'是否存在其他宇宙?', desc:'暴胀理论天然会产生无数个泡泡宇宙,物理常数可能各不相同。弦论预言约 10⁵⁰⁰ 种可能性。至今无法检验。'},
    {name:'为什么是这些常数?', desc:'四种相互作用的强度、粒子的质量,似乎都被"精调"到恰好允许恒星、化学与生命存在。这是人择巧合?更深层的规律?还是多宇宙筛选?'}
  ]
};

/* ================ apply / helpers ================ */
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
