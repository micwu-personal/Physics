(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const AU_PER_LY = 63241.1;
  const PRESENT_AGE = 13.8;
  const $ = id => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing solar-system-galaxy element: ${id}`);
    return element;
  };
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const mix = (start, end, amount) => start + (end - start) * amount;
  const zh = () => window.PhysicsUI.language === 'zh-CN';
  const t = (en, chinese) => zh() ? chinese : en;
  const localized = value => value?.[zh() ? 'zh' : 'en'] ?? '';
  const fixed = (value, digits = 1) => Number(value).toFixed(digits);

  const style = getComputedStyle(document.documentElement);
  const palette = {
    ink: '#040713',
    deep: '#090d1d',
    paper: style.getPropertyValue('--paper').trim(),
    muted: style.getPropertyValue('--muted').trim(),
    line: 'rgba(238, 242, 255, 0.18)',
    cyan: style.getPropertyValue('--cyan').trim(),
    gold: style.getPropertyValue('--gold').trim(),
    violet: style.getPropertyValue('--violet').trim(),
    pink: style.getPropertyValue('--pink').trim(),
    green: style.getPropertyValue('--green').trim()
  };

  const state = {
    addressScale: 'solar',
    solarScale: 'planets',
    solarObject: 'earth',
    reachAU: 120,
    missionYear: 1989,
    missionFilter: 'all',
    assistMode: 'vectors',
    planetSpeed: 13.1,
    turnAngle: 70,
    encounterSide: 0.75,
    assistProgress: 0.18,
    voyagerEncounter: 3,
    neighborDepth: 15,
    neighbor: 'proxima',
    galaxyView: 'face',
    galaxyLayer: 'stars',
    galaxyAngle: 0,
    galaxyTime: PRESENT_AGE,
    observerPosition: 'sun',
    skyDirection: 0,
    skyElevation: 0,
    playing: new Set()
  };

  const solarObjects = [
    { id: 'sun', name: { en: 'Sun', zh: '太阳' }, au: 0, kind: { en: 'Star', zh: '恒星' }, population: { en: 'System barycentric anchor', zh: '系统质心锚点' }, color: '#ffd166', fact: { en: 'The Sun contains nearly all Solar System mass; planets orbit the shared barycentre, usually inside the Sun.', zh: '太阳包含太阳系绝大部分质量；行星绕共同质心运行，而该质心通常位于太阳内部。' } },
    { id: 'mercury', name: { en: 'Mercury', zh: '水星' }, au: 0.387, kind: { en: 'Rocky planet', zh: '岩质行星' }, population: { en: 'Terrestrial region', zh: '类地行星区' }, color: '#b8b4ad', fact: { en: 'Smallest planet and closest to the Sun; 0.387 AU is its semi-major axis.', zh: '最小且最靠近太阳的行星；0.387 天文单位是其轨道半长轴。' } },
    { id: 'venus', name: { en: 'Venus', zh: '金星' }, au: 0.723, kind: { en: 'Rocky planet', zh: '岩质行星' }, population: { en: 'Terrestrial region', zh: '类地行星区' }, color: '#e8bb73', fact: { en: 'Similar in radius to Earth but with a dense carbon-dioxide atmosphere and extreme surface greenhouse warming.', zh: '半径与地球相近，但拥有稠密的二氧化碳大气与极强的地表温室增温。' } },
    { id: 'earth', name: { en: 'Earth', zh: '地球' }, au: 1, kind: { en: 'Rocky planet', zh: '岩质行星' }, population: { en: 'Terrestrial region', zh: '类地行星区' }, color: '#00d4ff', fact: { en: 'One astronomical unit is defined from the exact SI value 149,597,870,700 metres.', zh: '一个天文单位由精确的国际单位制数值 149,597,870,700 米定义。' } },
    { id: 'bennu', name: { en: 'Bennu', zh: '贝努' }, au: 1.13, kind: { en: 'Near-Earth asteroid', zh: '近地小行星' }, population: { en: 'Earth-approaching orbit', zh: '近地轨道' }, color: '#a6a0a0', fact: { en: 'Bennu represents near-Earth asteroids; its eccentric orbit is not a circular ring at 1.13 AU.', zh: '贝努代表近地小行星；其偏心轨道并不是位于 1.13 天文单位的圆环。' } },
    { id: 'mars', name: { en: 'Mars', zh: '火星' }, au: 1.524, kind: { en: 'Rocky planet', zh: '岩质行星' }, population: { en: 'Terrestrial region', zh: '类地行星区' }, color: '#d87554', fact: { en: 'Mars marks the outer major planet of the terrestrial region and the inner side of the main belt.', zh: '火星是类地行星区最外侧的主要行星，也位于主小行星带内侧。' } },
    { id: 'vesta', name: { en: 'Vesta', zh: '灶神星' }, au: 2.36, kind: { en: 'Main-belt asteroid', zh: '主带小行星' }, population: { en: 'Main asteroid belt', zh: '主小行星带' }, color: '#c9c4ba', fact: { en: 'Vesta is one of the main belt’s largest bodies and was orbited by Dawn.', zh: '灶神星是主带最大的天体之一，黎明号曾进入其轨道。' } },
    { id: 'ceres', name: { en: 'Ceres', zh: '谷神星' }, au: 2.77, kind: { en: 'Dwarf planet', zh: '矮行星' }, population: { en: 'Main asteroid belt', zh: '主小行星带' }, color: '#d8d6cc', fact: { en: 'Ceres is the largest main-belt body and the only IAU-recognized dwarf planet inside Neptune.', zh: '谷神星是主带最大天体，也是海王星轨道内唯一获国际天文学联合会认可的矮行星。' } },
    { id: '67p', name: { en: 'Comet 67P', zh: '67P 彗星' }, au: 3.46, kind: { en: 'Jupiter-family comet', zh: '木星族彗星' }, population: { en: 'Short-period comet', zh: '短周期彗星' }, color: '#7ee8c5', fact: { en: 'The displayed 3.46 AU is a semi-major axis; Rosetta met 67P on an eccentric 6.4-year orbit.', zh: '图示 3.46 天文单位为轨道半长轴；罗塞塔号在其偏心的约 6.4 年轨道上与 67P 交会。' } },
    { id: 'hektor', name: { en: '624 Hektor', zh: '624 赫克托耳' }, au: 5.2, kind: { en: 'Jupiter Trojan', zh: '木星特洛伊小行星' }, population: { en: 'Libration near Jupiter orbit', zh: '木星轨道附近的天平动群' }, color: '#d0a873', fact: { en: 'Trojans librate around moving Lagrange regions; they are not two stationary piles beside Jupiter.', zh: '特洛伊天体围绕随木星运动的拉格朗日区域天平动，并不是木星两侧静止的两堆天体。' } },
    { id: 'jupiter', name: { en: 'Jupiter', zh: '木星' }, au: 5.203, kind: { en: 'Gas giant', zh: '气态巨行星' }, population: { en: 'Giant-planet region', zh: '巨行星区域' }, color: '#d6a26d', fact: { en: 'The most massive planet strongly shapes resonances, comet paths, and spacecraft gravity assists.', zh: '质量最大的行星，会强烈塑造共振、彗星路径与航天器引力助推。' } },
    { id: 'saturn', name: { en: 'Saturn', zh: '土星' }, au: 9.537, kind: { en: 'Gas giant', zh: '气态巨行星' }, population: { en: 'Giant-planet region', zh: '巨行星区域' }, color: '#e3c17d', fact: { en: 'Its ring system is broad but extremely thin; the planet icon cannot encode that geometry at this scale.', zh: '土星环宽广却极薄；本尺度下的行星图标无法同时表达这种几何。' } },
    { id: 'halley', name: { en: 'Halley', zh: '哈雷彗星' }, au: 17.8, kind: { en: 'Halley-type comet', zh: '哈雷型彗星' }, population: { en: 'Long, retrograde ellipse', zh: '长而逆行的椭圆轨道' }, color: '#7ee8c5', fact: { en: 'Its perihelion is about 0.59 AU and aphelion about 35 AU, so one mean distance hides most of the orbit.', zh: '其近日点约 0.59 天文单位、远日点约 35 天文单位，因此单一平均距离会掩盖大部分轨道特征。' } },
    { id: 'uranus', name: { en: 'Uranus', zh: '天王星' }, au: 19.19, kind: { en: 'Ice giant', zh: '冰巨星' }, population: { en: 'Giant-planet region', zh: '巨行星区域' }, color: '#8ce0e8', fact: { en: 'Its atmosphere is dominated by hydrogen and helium, while planetary models distinguish its heavier interior from gas giants.', zh: '其大气以氢氦为主，但行星模型根据更重的内部组成将它与气态巨行星区分开。' } },
    { id: 'neptune', name: { en: 'Neptune', zh: '海王星' }, au: 30.07, kind: { en: 'Ice giant', zh: '冰巨星' }, population: { en: 'Outer major planet', zh: '最外侧主要行星' }, color: '#5d79ff', fact: { en: 'Neptune’s resonances organize many trans-Neptunian orbits; the Kuiper Belt begins across, not simply beyond, its orbit.', zh: '海王星共振组织了许多海王星外轨道；柯伊伯带与其轨道区域重叠，并非只从轨道外侧开始。' } },
    { id: 'pluto', name: { en: 'Pluto', zh: '冥王星' }, au: 39.48, kind: { en: 'Dwarf planet', zh: '矮行星' }, population: { en: '3:2 Neptune resonance', zh: '与海王星 3:2 共振' }, color: '#d7c5ad', fact: { en: 'Pluto is a resonant Kuiper Belt dwarf planet on an eccentric, inclined orbit.', zh: '冥王星是处于共振中的柯伊伯带矮行星，轨道偏心且倾斜。' } },
    { id: 'haumea', name: { en: 'Haumea', zh: '妊神星' }, au: 43.2, kind: { en: 'Dwarf planet', zh: '矮行星' }, population: { en: 'Trans-Neptunian population', zh: '海王星外天体群' }, color: '#d8edff', fact: { en: 'Haumea is rapidly rotating and elongated; its icon here encodes only selection, not shape.', zh: '妊神星自转很快且形状拉长；这里的图标只编码选择状态，不表达真实形状。' } },
    { id: 'arrokoth', name: { en: 'Arrokoth', zh: '阿罗科特' }, au: 44.6, kind: { en: 'Cold classical object', zh: '冷经典天体' }, population: { en: 'Kuiper Belt', zh: '柯伊伯带' }, color: '#cc7a64', fact: { en: 'New Horizons revealed a contact-binary shape; the atlas plots only a representative heliocentric distance.', zh: '新视野号揭示了其接触双体形状；本图仅绘制代表性日心距离。' } },
    { id: 'makemake', name: { en: 'Makemake', zh: '鸟神星' }, au: 45.8, kind: { en: 'Dwarf planet', zh: '矮行星' }, population: { en: 'Trans-Neptunian population', zh: '海王星外天体群' }, color: '#c98e72', fact: { en: 'Makemake is one of five dwarf planets currently recognized by the IAU; that recognized list is not a claim that discovery is complete.', zh: '鸟神星是国际天文学联合会目前认可的五颗矮行星之一；这份名单并不意味着发现工作已经完成。' } },
    { id: 'eris', name: { en: 'Eris', zh: '阋神星' }, au: 67.7, kind: { en: 'Dwarf planet', zh: '矮行星' }, population: { en: 'Scattered disk', zh: '散射盘' }, color: '#e5e5ee', fact: { en: 'Its strongly inclined, eccentric orbit reaches far beyond the classical Kuiper Belt.', zh: '其轨道倾角和偏心率都很大，远远越过经典柯伊伯带。' } }
  ];

  const solarScales = {
    inner: { min: 0, max: 5, log: false, label: { en: 'Linear to 5 AU', zh: '线性至 5 天文单位' }, subtitle: { en: 'Rocky planets and the main asteroid belt', zh: '岩质行星与主小行星带' } },
    planets: { min: 0, max: 50, log: false, label: { en: 'Linear to 50 AU', zh: '线性至 50 天文单位' }, subtitle: { en: 'All major planets and the classical Kuiper Belt', zh: '全部主要行星与经典柯伊伯带' } },
    heliosphere: { min: 1, max: 200, log: true, label: { en: 'Logarithmic 1-200 AU', zh: '对数 1-200 天文单位' }, subtitle: { en: 'Planetary region through the observed heliopause crossings', zh: '从行星区延伸至已观测的日球层顶穿越位置' } },
    reservoirs: { min: 1, max: 500000, log: true, label: { en: 'Logarithmic 1-500k AU', zh: '对数 1-50 万天文单位' }, subtitle: { en: 'Planetary system, inferred comet reservoir, and Galactic tidal scale', zh: '行星系统、推断彗星储库与银河潮汐尺度' } }
  };

  const missions = [
    {
      id: 'luna', name: { en: 'Luna programme', zh: '月球号计划' }, color: '#eef2ff', angle: -2.6, launch: 1959, end: 1966,
      milestones: [
        { year: 1959, au: 0.0026, label: { en: 'Luna 1 escaped Earth; Luna 2 reached the Moon', zh: '月球 1 号逃离地球，月球 2 号到达月球' } },
        { year: 1966, au: 0.0026, label: { en: 'Luna 9 made the first soft lunar landing', zh: '月球 9 号实现首次月面软着陆' } }
      ]
    },
    {
      id: 'mariner', name: { en: 'Mariner 2 / 4', zh: '水手 2 / 4 号' }, color: '#ff9a78', angle: -2.2, launch: 1962, end: 1967,
      milestones: [
        { year: 1962, au: 0.72, label: { en: 'Mariner 2 flew past Venus', zh: '水手 2 号飞越金星' } },
        { year: 1965, au: 1.52, label: { en: 'Mariner 4 flew past Mars', zh: '水手 4 号飞越火星' } }
      ]
    },
    {
      id: 'pioneer10', name: { en: 'Pioneer 10', zh: '先驱者 10 号' }, color: '#ffd166', angle: -1.75, launch: 1972, end: 2003,
      milestones: [
        { year: 1972, au: 2.2, label: { en: 'Entered the main asteroid belt', zh: '进入主小行星带' } },
        { year: 1973.9, au: 5.2, label: { en: 'First Jupiter flyby', zh: '首次飞越木星' } },
        { year: 1983, au: 30.1, label: { en: 'Passed Neptune’s orbital distance', zh: '越过海王星轨道距离' } },
        { year: 2003, au: 82, label: { en: 'Last useful signal received', zh: '收到最后一次可用信号' } }
      ]
    },
    {
      id: 'viking', name: { en: 'Viking 1', zh: '海盗 1 号' }, color: '#d87554', angle: -1.28, launch: 1975, end: 1982,
      milestones: [
        { year: 1975, au: 1, label: { en: 'Launched toward Mars', zh: '发射前往火星' } },
        { year: 1976.55, au: 1.52, label: { en: 'Landed on Mars', zh: '在火星着陆' } }
      ]
    },
    {
      id: 'voyager1', name: { en: 'Voyager 1', zh: '旅行者 1 号' }, color: '#00d4ff', angle: -0.82, launch: 1977.68, end: 2030,
      milestones: [
        { year: 1977.68, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 1979.18, au: 5.2, label: { en: 'Jupiter flyby', zh: '飞越木星' } },
        { year: 1980.87, au: 9.5, label: { en: 'Saturn and Titan encounter', zh: '土星与泰坦交会' } },
        { year: 1990.13, au: 40, label: { en: 'Solar System family portrait', zh: '拍摄太阳系全家福' } },
        { year: 2012.65, au: 121.6, label: { en: 'Crossed the heliopause', zh: '穿越日球层顶' } },
        { year: 2026, au: 169, label: { en: 'Approximate outward milestone', zh: '近似向外里程碑' } },
        { year: 2030, au: 184, label: { en: 'Illustrative continuation if contact persists', zh: '若通信持续则作示意延伸' }, planned: true }
      ]
    },
    {
      id: 'voyager2', name: { en: 'Voyager 2', zh: '旅行者 2 号' }, color: '#7ee8c5', angle: -0.35, launch: 1977.62, end: 2030,
      milestones: [
        { year: 1977.62, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 1979.55, au: 5.2, label: { en: 'Jupiter flyby', zh: '飞越木星' } },
        { year: 1981.65, au: 9.5, label: { en: 'Saturn flyby', zh: '飞越土星' } },
        { year: 1986.07, au: 19.2, label: { en: 'Uranus flyby', zh: '飞越天王星' } },
        { year: 1989.65, au: 30.1, label: { en: 'Neptune and Triton flyby', zh: '飞越海王星与海卫一' } },
        { year: 2018.86, au: 119, label: { en: 'Crossed the heliopause', zh: '穿越日球层顶' } },
        { year: 2026, au: 142, label: { en: 'Approximate outward milestone', zh: '近似向外里程碑' } },
        { year: 2030, au: 155, label: { en: 'Illustrative continuation if contact persists', zh: '若通信持续则作示意延伸' }, planned: true }
      ]
    },
    {
      id: 'galileo', name: { en: 'Galileo', zh: '伽利略号' }, color: '#d6a26d', angle: 0.12, launch: 1989.8, end: 2003.7,
      milestones: [
        { year: 1989.8, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 1995.95, au: 5.2, label: { en: 'Jupiter orbit insertion and probe entry', zh: '进入木星轨道并释放大气探测器' } },
        { year: 2003.7, au: 5.2, label: { en: 'Mission ended in Jupiter', zh: '任务在木星大气中结束' } }
      ]
    },
    {
      id: 'cassini', name: { en: 'Cassini-Huygens', zh: '卡西尼-惠更斯号' }, color: '#e3c17d', angle: 0.56, launch: 1997.8, end: 2017.7,
      milestones: [
        { year: 1997.8, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2004.5, au: 9.5, label: { en: 'Entered Saturn orbit', zh: '进入土星轨道' } },
        { year: 2005.04, au: 9.5, label: { en: 'Huygens landed on Titan', zh: '惠更斯号在泰坦着陆' } },
        { year: 2017.7, au: 9.5, label: { en: 'Grand Finale in Saturn', zh: '以“壮丽终章”结束于土星' } }
      ]
    },
    {
      id: 'rosetta', name: { en: 'Rosetta', zh: '罗塞塔号' }, color: '#ff6b9d', angle: 1.0, launch: 2004.17, end: 2016.75,
      milestones: [
        { year: 2004.17, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2014.58, au: 3.46, label: { en: 'Rendezvous with comet 67P', zh: '与 67P 彗星交会' } },
        { year: 2014.86, au: 3.1, label: { en: 'Philae landing attempt', zh: '菲莱着陆尝试' } },
        { year: 2016.75, au: 3.8, label: { en: 'Controlled descent to 67P', zh: '受控下降至 67P' } }
      ]
    },
    {
      id: 'newhorizons', name: { en: 'New Horizons', zh: '新视野号' }, color: '#9f8cff', angle: 1.43, launch: 2006.05, end: 2030,
      milestones: [
        { year: 2006.05, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2007.16, au: 5.2, label: { en: 'Jupiter gravity assist', zh: '木星引力助推' } },
        { year: 2015.54, au: 32.9, label: { en: 'Pluto flyby', zh: '飞越冥王星' } },
        { year: 2019.0, au: 43.4, label: { en: 'Arrokoth flyby', zh: '飞越阿罗科特' } },
        { year: 2024.3, au: 60, label: { en: 'Reached 60 AU', zh: '到达 60 天文单位' } },
        { year: 2030, au: 76, label: { en: 'Illustrative continued Kuiper Belt travel', zh: '示意继续穿越柯伊伯带' }, planned: true }
      ]
    },
    {
      id: 'dawn', name: { en: 'Dawn', zh: '黎明号' }, color: '#eef2ff', angle: 1.85, launch: 2007.72, end: 2018.8,
      milestones: [
        { year: 2007.72, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2011.54, au: 2.36, label: { en: 'Entered Vesta orbit', zh: '进入灶神星轨道' } },
        { year: 2015.18, au: 2.77, label: { en: 'Entered Ceres orbit', zh: '进入谷神星轨道' } },
        { year: 2018.8, au: 2.77, label: { en: 'Mission ended at Ceres', zh: '任务在谷神星结束' } }
      ]
    },
    {
      id: 'juno', name: { en: 'Juno', zh: '朱诺号' }, color: '#d6a26d', angle: 2.25, launch: 2011.59, end: 2030,
      milestones: [
        { year: 2011.59, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2016.51, au: 5.2, label: { en: 'Entered polar orbit around Jupiter', zh: '进入木星极轨' } },
        { year: 2030, au: 5.2, label: { en: 'Future mission status depends on operations', zh: '未来任务状态取决于实际运行' }, planned: true }
      ]
    },
    {
      id: 'parker', name: { en: 'Parker Solar Probe', zh: '帕克太阳探测器' }, color: '#ffd166', angle: 2.66, launch: 2018.62, end: 2030,
      milestones: [
        { year: 2018.62, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2021.32, au: 0.062, label: { en: 'First reported passage through the solar corona', zh: '首次报告穿过太阳日冕' } },
        { year: 2024.98, au: 0.041, label: { en: 'Record close solar approach', zh: '创纪录地接近太阳' } },
        { year: 2030, au: 0.041, label: { en: 'Later status is operations-dependent', zh: '后续状态取决于实际运行' }, planned: true }
      ]
    },
    {
      id: 'recent', name: { en: 'Samples + defence', zh: '采样与防御任务' }, color: '#7ee8c5', angle: 3.02, launch: 2016, end: 2024,
      milestones: [
        { year: 2018.95, au: 1.13, label: { en: 'OSIRIS-REx arrived at Bennu', zh: 'OSIRIS-REx 抵达贝努' } },
        { year: 2022.73, au: 1.05, label: { en: 'DART impacted Dimorphos', zh: 'DART 撞击双卫一' } },
        { year: 2023.73, au: 1, label: { en: 'Bennu sample returned to Earth', zh: '贝努样本返回地球' } }
      ]
    },
    {
      id: 'clipper', name: { en: 'Europa Clipper', zh: '欧罗巴快船' }, color: '#8ce0e8', angle: 0.36, launch: 2024.79, end: 2030,
      milestones: [
        { year: 2024.79, au: 1, label: { en: 'Launch', zh: '发射' } },
        { year: 2030, au: 5.2, label: { en: 'Planned Jupiter arrival window', zh: '计划抵达木星的时间窗' }, planned: true }
      ]
    }
  ];

  const voyagerEncounters = [
    { planet: { en: 'Jupiter', zh: '木星' }, year: 1979, color: '#d6a26d', next: { en: 'Saturn transfer', zh: '转向土星' }, purpose: { en: 'Jupiter bent Voyager 2 toward Saturn while changing its Sun-frame energy and direction.', zh: '木星弯折旅行者 2 号的路径，使其转向土星，并改变日心参考系中的能量与方向。' } },
    { planet: { en: 'Saturn', zh: '土星' }, year: 1981, color: '#e3c17d', next: { en: 'Uranus transfer', zh: '转向天王星' }, purpose: { en: 'The Saturn encounter preserved the geometry needed to continue toward Uranus.', zh: '土星交会保留了继续前往天王星所需的几何条件。' } },
    { planet: { en: 'Uranus', zh: '天王星' }, year: 1986, color: '#8ce0e8', next: { en: 'Neptune transfer', zh: '转向海王星' }, purpose: { en: 'The Uranus flyby redirected the spacecraft onto the final planetary leg toward Neptune.', zh: '天王星飞越把航天器重定向到前往海王星的最后一段行星航程。' } },
    { planet: { en: 'Neptune', zh: '海王星' }, year: 1989, color: '#5d79ff', next: { en: 'Out of the planetary plane', zh: '离开行星平面' }, purpose: { en: 'Targeting Triton forced a close Neptune pass that sent Voyager 2 south of the ecliptic after the only Uranus-Neptune tour yet flown.', zh: '对海卫一的瞄准要求近距离飞越海王星，使旅行者 2 号在完成迄今唯一的天王星-海王星巡游后飞向黄道面南侧。' } }
  ];

  const nearbySystems = [
    { id: 'proxima', name: { en: 'Proxima Centauri', zh: '比邻星' }, distance: 4.25, x: -1.55, y: -1.14, z: -3.79, planets: { en: 'At least 1 confirmed; other signals remain under study', zh: '至少 1 颗已确认；其他信号仍在研究' }, note: { en: 'The nearest individual star to the Sun and a red-dwarf planetary system.', zh: '距离太阳最近的单颗恒星，也是一套红矮星行星系统。' }, color: '#ff8b72' },
    { id: 'alpha', name: { en: 'Alpha Centauri AB', zh: '南门二 AB' }, distance: 4.37, x: -1.66, y: -1.34, z: -3.81, planets: { en: 'No confirmed planet shown', zh: '本图不显示已确认行星' }, note: { en: 'A nearby stellar binary physically associated with Proxima Centauri.', zh: '与比邻星存在物理联系的邻近双星系统。' }, color: '#ffd166' },
    { id: 'barnard', name: { en: "Barnard's Star", zh: '巴纳德星' }, distance: 5.96, x: -0.06, y: -5.94, z: 0.49, planets: { en: 'Catalog status changes; omitted here', zh: '星表状态会变化，此处省略' }, note: { en: 'A high-proper-motion red dwarf; its plotted J2000 snapshot does not stay fixed.', zh: '一颗高自行红矮星；图中的 J2000 快照不会永久固定。' }, color: '#ff9a78' },
    { id: 'luhman', name: { en: 'Luhman 16 AB', zh: '卢曼 16 AB' }, distance: 6.5, x: -3.7, y: 1.17, z: -5.22, planets: { en: 'Brown-dwarf binary', zh: '褐矮星双星' }, note: { en: 'Two brown dwarfs illustrate that the nearest systems are not all Sun-like stars.', zh: '两颗褐矮星说明，最近邻系统并不都是类太阳恒星。' }, color: '#b77763' },
    { id: 'wolf', name: { en: 'Wolf 359', zh: '沃尔夫 359' }, distance: 7.86, x: -7.53, y: 2.17, z: 0.96, planets: { en: 'No planet count asserted', zh: '不在此断言行星数量' }, note: { en: 'A faint nearby red dwarf; proximity does not imply naked-eye brightness.', zh: '一颗昏暗的邻近红矮星；距离近并不意味着肉眼明亮。' }, color: '#ff7a63' },
    { id: 'sirius', name: { en: 'Sirius AB', zh: '天狼星 AB' }, distance: 8.6, x: -1.62, y: 8.07, z: -2.47, planets: { en: 'No confirmed planetary system shown', zh: '本图不显示已确认行星系统' }, note: { en: 'A bright main-sequence star and white-dwarf companion; apparent brightness combines distance and luminosity.', zh: '由一颗明亮主序星与白矮星伴星组成；视亮度同时取决于距离与光度。' }, color: '#eef2ff' },
    { id: 'epsilon', name: { en: 'Epsilon Eridani', zh: '波江座 epsilon 星' }, distance: 10.5, x: 6.2, y: 8.46, z: -1.73, planets: { en: '1 widely accepted giant planet; debris disk is separate evidence', zh: '1 颗广泛接受的巨行星；碎屑盘是独立证据' }, note: { en: 'A young nearby planetary system with circumstellar debris.', zh: '一套年轻的邻近行星系统，周围存在星周碎屑。' }, color: '#ffd890' },
    { id: 'ross128', name: { en: 'Ross 128', zh: '罗斯 128' }, distance: 11, x: -10.98, y: 0.61, z: 0.15, planets: { en: '1 confirmed planet', zh: '1 颗已确认行星' }, note: { en: 'A quiet red dwarf with a close-in planet; habitability cannot be inferred from distance alone.', zh: '一颗活动较安静的红矮星，拥有近轨行星；不能仅凭距离推断宜居性。' }, color: '#ff8b72' },
    { id: 'tauceti', name: { en: 'Tau Ceti', zh: '天仓五' }, distance: 11.9, x: 10.27, y: 5.01, z: -3.27, planets: { en: 'Candidate signals not presented as confirmed', zh: '候选信号不作为已确认行星展示' }, note: { en: 'A nearby Sun-like star often discussed in planet searches; candidate status must remain versioned.', zh: '一颗常见于行星搜索讨论的邻近类太阳恒星；候选状态必须标明版本。' }, color: '#ffe3a3' },
    { id: 'trappist', name: { en: 'TRAPPIST-1', zh: 'TRAPPIST-1' }, distance: 40.7, x: 39.2, y: -9.9, z: -3.8, planets: { en: '7 confirmed transiting planets', zh: '7 颗已确认凌日行星' }, note: { en: 'A compact system around an ultracool dwarf; the planet orbits are far too small to resolve on this map.', zh: '一套围绕超冷矮星的紧凑系统；行星轨道远小于本图分辨能力。' }, color: '#d47a67' }
  ];

  const historyStages = [
    { max: 2.2, title: { en: 'Early fragments and old stars', zh: '早期碎片与古老恒星' }, detail: { en: 'Small progenitors form stars and begin chemical enrichment. Exact ancestry is reconstructed, not filmed.', zh: '小型前身系统形成恒星并开始化学富集。具体祖先关系来自重建，并非被直接记录成影片。' } },
    { max: 5.8, title: { en: 'Major ancient accretion', zh: '重大远古吸积' }, detail: { en: 'Kinematics and chemistry support a major Gaia-Enceladus/Sausage event roughly 8-11 billion years before today.', zh: '运动学与化学证据支持约在距今 80-110 亿年前发生重大 Gaia-Enceladus/Sausage 吸积事件。' } },
    { max: 9.8, title: { en: 'Disk growth and repeated perturbation', zh: '盘增长与反复扰动' }, detail: { en: 'Gas accretion, star formation, internal redistribution, and smaller mergers grow thin and thick disk populations.', zh: '气体吸积、恒星形成、内部再分配与较小并合共同增长薄盘和厚盘恒星群。' } },
    { max: 14.05, title: { en: 'Present barred spiral', zh: '今日棒旋星系' }, detail: { en: 'The Milky Way continues forming stars and interacting with satellites; “present shape” is a changing snapshot.', zh: '银河系仍在形成恒星并与卫星系统相互作用；“今日形状”只是变化中的快照。' } },
    { max: 18.4, title: { en: 'Possible Local Group close passage', zh: '可能的本星系群近距离交会' }, detail: { en: 'Milky Way-Andromeda outcomes depend on uncertain motions and the wider Local Group. A 2025 analysis found no certainty of merger within 10 billion years.', zh: '银河系与仙女座的结局取决于不确定的运动及更广泛的本星系群动力学。2025 年分析显示，未来 100 亿年内并合并非确定事件。' } }
  ];

  const observerPositions = {
    sun: { radius: 8.2, density: 1, label: { en: 'Solar neighborhood', zh: '太阳邻域' }, note: { en: 'Rough local reference: about 0.04 stars per cubic parsec, depending on census limits.', zh: '粗略本地参考值：约每立方秒差距 0.04 颗恒星，取决于普查限值。' } },
    inner: { radius: 3, density: 16, label: { en: 'Inner disk', zh: '内盘' }, note: { en: 'Stellar density rises strongly inward, but dust also hides visible light along the plane.', zh: '向内恒星密度显著上升，但尘埃也会遮挡盘面方向的可见光。' } },
    outer: { radius: 14, density: 0.28, label: { en: 'Outer disk', zh: '外盘' }, note: { en: 'The stellar disk thins outward; warps, flares, and substructure make a smooth decline incomplete.', zh: '恒星盘向外逐渐稀疏；翘曲、增厚与次结构使平滑下降只是近似。' } },
    halo: { radius: 28, density: 0.04, label: { en: 'Stellar halo', zh: '恒星晕' }, note: { en: 'A sparse, extended stellar population surrounds the disk; this is not the much larger inferred dark-matter halo.', zh: '稀疏而延展的恒星群包围着盘；它并不是范围大得多的推断暗物质晕。' } }
  };

  const scenes = new Map();
  function setupCanvas(id) {
    const canvas = $(id);
    const scene = { canvas, context: canvas.getContext('2d'), width: 0, height: 0 };
    scenes.set(id, scene);
    return scene;
  }

  const addressScene = setupCanvas('addressCanvas');
  const solarScene = setupCanvas('solarCanvas');
  const reachScene = setupCanvas('reachCanvas');
  const missionScene = setupCanvas('missionCanvas');
  const assistScene = setupCanvas('assistCanvas');
  const neighborScene = setupCanvas('neighborCanvas');
  const galaxyScene = setupCanvas('galaxyCanvas');
  const historyScene = setupCanvas('galaxyHistoryCanvas');
  const skyScene = setupCanvas('skyCanvas');

  function resize(scene) {
    const rect = scene.canvas.getBoundingClientRect();
    const ratio = clamp(window.devicePixelRatio, 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (scene.width === width && scene.height === height) return;
    scene.width = width;
    scene.height = height;
    scene.canvas.width = Math.round(width * ratio);
    scene.canvas.height = Math.round(height * ratio);
    scene.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function clear(scene, color = palette.ink) {
    resize(scene);
    scene.context.clearRect(0, 0, scene.width, scene.height);
    scene.context.fillStyle = color;
    scene.context.fillRect(0, 0, scene.width, scene.height);
  }

  function line(context, x1, y1, x2, y2, color, width = 1, dash = []) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.setLineDash(dash);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  }

  function circle(context, x, y, radius, fill, stroke = '', width = 1) {
    context.beginPath();
    context.arc(x, y, radius, 0, TAU);
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.stroke();
    }
  }

  function text(context, value, x, y, color = palette.muted, size = 11, align = 'left', weight = 600) {
    context.fillStyle = color;
    context.font = `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`;
    context.textAlign = align;
    context.textBaseline = 'middle';
    context.fillText(value, x, y);
  }

  function arrow(context, x1, y1, x2, y2, color, width, caption) {
    line(context, x1, y1, x2, y2, color, width);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 8 + width;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - Math.cos(angle - 0.5) * head, y2 - Math.sin(angle - 0.5) * head);
    context.lineTo(x2 - Math.cos(angle + 0.5) * head, y2 - Math.sin(angle + 0.5) * head);
    context.closePath();
    context.fill();
    text(context, caption, (x1 + x2) / 2, (y1 + y2) / 2 - 11, color, 10, 'center');
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ result >>> 15, result | 1);
      result ^= result + Math.imul(result ^ result >>> 7, result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }

  const starSeed = seededRandom(8142026);
  const backgroundStars = Array.from({ length: 260 }, () => ({
    x: starSeed(),
    y: starSeed(),
    alpha: 0.18 + starSeed() * 0.66,
    size: 0.45 + starSeed() * 1.15
  }));
  const galaxySeed = seededRandom(602214);
  const galaxyStars = Array.from({ length: 460 }, () => ({
    radius: Math.pow(galaxySeed(), 0.72),
    angle: galaxySeed() * TAU,
    offset: (galaxySeed() - 0.5) * 0.24,
    age: galaxySeed()
  }));
  const skySeed = seededRandom(299792);
  const skyStars = Array.from({ length: 520 }, () => ({
    x: skySeed(),
    y: skySeed(),
    size: 0.45 + Math.pow(skySeed(), 5) * 2.1,
    brightness: 0.25 + skySeed() * 0.75,
    rank: skySeed()
  }));

  function drawBackgroundStars(scene, amount = 1) {
    const { context, width, height } = scene;
    const count = Math.round(backgroundStars.length * amount);
    for (let index = 0; index < count; index++) {
      const star = backgroundStars[index];
      circle(context, star.x * width, star.y * height, star.size, `rgba(238,242,255,${star.alpha})`);
    }
  }

  function drawAddress() {
    clear(addressScene);
    drawBackgroundStars(addressScene, 0.72);
    const { context, width, height } = addressScene;
    const cx = width * 0.52;
    const cy = height * 0.5;
    const maxRadius = Math.min(width, height) * 0.38;

    if (state.addressScale === 'solar') {
      const orbitRadii = [0.14, 0.2, 0.27, 0.34, 0.49, 0.62, 0.76, 0.9];
      orbitRadii.forEach((radius, index) => {
        context.strokeStyle = index === 2 ? 'rgba(0,212,255,0.6)' : 'rgba(238,242,255,0.16)';
        context.lineWidth = index === 2 ? 2 : 1;
        context.beginPath();
        context.ellipse(cx, cy, maxRadius * radius, maxRadius * radius * 0.42, -0.12, 0, TAU);
        context.stroke();
      });
      circle(context, cx, cy, 18, palette.gold);
      const earthX = cx + maxRadius * orbitRadii[2] * Math.cos(-0.35);
      const earthY = cy + maxRadius * orbitRadii[2] * 0.42 * Math.sin(-0.35);
      circle(context, earthX, earthY, 7, palette.cyan, palette.paper, 1);
      line(context, earthX, earthY - 9, earthX, 40, palette.cyan, 1, [3, 4]);
      text(context, t('EARTH / 1 AU', '地球 / 1 天文单位'), earthX, 28, palette.cyan, 11, 'center');
      text(context, t('Planet sizes enlarged', '行星尺寸已放大'), 18, height - 22, palette.muted, 10);
    } else if (state.addressScale === 'local') {
      const scale = maxRadius / 13;
      line(context, cx - maxRadius, cy, cx + maxRadius, cy, palette.line);
      line(context, cx, cy - maxRadius * 0.72, cx, cy + maxRadius * 0.72, palette.line);
      circle(context, cx, cy, 6, palette.gold);
      text(context, t('SUN', '太阳'), cx + 10, cy - 10, palette.gold, 10);
      for (const system of nearbySystems.filter(item => item.distance <= 15)) {
        const x = cx + system.x * scale;
        const y = cy + system.y * scale * 0.72;
        const radius = clamp(4 + Math.abs(system.z) * 0.32, 4, 8);
        circle(context, x, y, radius, system.color, system.id === 'proxima' ? palette.cyan : '', 2);
        text(context, localized(system.name), x + 8, y - 10, palette.paper, 9);
      }
      text(context, t('Projected J2000 snapshot / 15 ly', 'J2000 投影快照 / 15 光年'), 18, height - 22, palette.muted, 10);
    } else {
      drawGalaxyFace(context, cx, cy, maxRadius, 0, 'stars', true);
      text(context, t('SUN / ~26,700 ly FROM CENTRE', '太阳 / 距中心约 26,700 光年'), width - 18, 28, palette.cyan, 10, 'right');
      text(context, t('Reconstructed exterior view', '重建的外部视图'), 18, height - 22, palette.muted, 10);
    }

    $('addressSummary').textContent = {
      solar: t('Earth moves around the Sun inside a many-zone planetary system.', '地球围绕太阳运动，位于具有多重分区的行星系统中。'),
      local: t('The Sun moves among nearby stellar and planetary systems.', '太阳在邻近恒星与行星系统之间运动。'),
      galaxy: t('The Solar System orbits inside the Milky Way’s disk.', '太阳系在银河系盘内绕行。')
    }[state.addressScale];
  }

  function solarX(distance, config, left, right) {
    if (!config.log) return left + clamp((distance - config.min) / (config.max - config.min), 0, 1) * (right - left);
    const minimum = Math.log10(Math.max(config.min, 0.1));
    const maximum = Math.log10(config.max);
    const value = Math.log10(Math.max(distance, config.min));
    return left + clamp((value - minimum) / (maximum - minimum), 0, 1) * (right - left);
  }

  function drawSolarSystem() {
    clear(solarScene);
    drawBackgroundStars(solarScene, 0.32);
    const { context, width, height } = solarScene;
    const config = solarScales[state.solarScale];
    const left = 54;
    const right = width - 28;
    const axisY = height * 0.56;
    const zones = [
      { start: 0.3, end: 2, color: 'rgba(255,209,102,0.08)', labelY: 54, label: { en: 'ROCKY WORLDS', zh: '岩质行星' } },
      { start: 2.1, end: 3.3, color: 'rgba(238,242,255,0.08)', labelY: 72, label: { en: 'MAIN BELT', zh: '主小行星带' } },
      { start: 5, end: 30.2, color: 'rgba(0,212,255,0.06)', labelY: 54, label: { en: 'GIANTS + CENTAURS', zh: '巨行星与半人马天体' } },
      { start: 30, end: 50, color: 'rgba(124,92,255,0.12)', labelY: 54, label: { en: 'KUIPER BELT', zh: '柯伊伯带' } },
      { start: 30, end: 1000, color: 'rgba(255,107,157,0.05)', labelY: 72, label: { en: 'SCATTERED DISK', zh: '散射盘' } },
      { start: 1000, end: 100000, color: 'rgba(126,232,197,0.08)', labelY: 54, label: { en: 'INFERRED OORT CLOUD', zh: '推断的奥尔特云' } }
    ];

    for (const zone of zones) {
      if (zone.end < config.min || zone.start > config.max) continue;
      const x1 = solarX(Math.max(zone.start, config.min), config, left, right);
      const x2 = solarX(Math.min(zone.end, config.max), config, left, right);
      context.fillStyle = zone.color;
      context.fillRect(x1, 38, Math.max(2, x2 - x1), height - 82);
      if (x2 - x1 > 96) text(context, localized(zone.label), (x1 + x2) / 2, zone.labelY, palette.muted, 9, 'center');
    }

    line(context, left, axisY, right, axisY, palette.muted, 1);
    const ticks = state.solarScale === 'inner'
      ? [0, 1, 2, 3, 4, 5]
      : state.solarScale === 'planets'
        ? [0, 5, 10, 20, 30, 40, 50]
        : state.solarScale === 'heliosphere'
          ? [1, 5, 10, 30, 50, 100, 120, 200]
          : [1, 10, 100, 1000, 10000, 100000, 500000];
    for (const tick of ticks) {
      const x = solarX(tick, config, left, right);
      line(context, x, axisY - 6, x, axisY + 6, palette.muted);
      const value = tick >= 1000 ? `${tick / 1000}k` : String(tick);
      text(context, `${value} AU`, x, axisY + 21, palette.muted, 9, 'center');
    }

    const visibleObjects = solarObjects.filter(object => object.au >= config.min && object.au <= config.max);
    const lastLabelXByTier = [-Infinity, -Infinity, -Infinity, -Infinity];
    visibleObjects.forEach((object, index) => {
      const x = solarX(object.au, config, left, right);
      const tier = index % 4;
      const y = axisY - 42 - tier * 39;
      const selected = object.id === state.solarObject;
      line(context, x, axisY - 2, x, y + 7, selected ? palette.cyan : 'rgba(238,242,255,0.22)', selected ? 2 : 1, selected ? [] : [2, 3]);
      circle(context, x, y, selected ? 8 : 5, object.color, selected ? palette.paper : '', 1.5);
      const hasLabelRoom = x - lastLabelXByTier[tier] > 58;
      if (selected || hasLabelRoom) {
        text(context, localized(object.name), clamp(x, 72, width - 72), y - 14, selected ? palette.cyan : palette.paper, selected ? 10 : 9, 'center');
        lastLabelXByTier[tier] = x;
      }
    });

    if (state.solarScale === 'heliosphere' || state.solarScale === 'reservoirs') {
      for (const [distance, caption, color] of [
        [94, t('V1 TERMINATION SHOCK', '旅行者 1 号终止激波'), palette.gold],
        [120, t('VOYAGER HELIOPAUSE RANGE', '旅行者号日球层顶范围'), palette.cyan]
      ]) {
        const x = solarX(distance, config, left, right);
        line(context, x, 30, x, height - 38, color, 1, [5, 4]);
        text(context, caption, x + 5, height - 24, color, 9, x > width * 0.8 ? 'right' : 'left');
      }
    }

    if (state.solarScale === 'reservoirs') {
      const hillStart = solarX(206000, config, left, right);
      const hillEnd = solarX(412000, config, left, right);
      line(context, hillStart, 88, hillEnd, 88, palette.pink, 4);
      text(context, t('MODEL-DEPENDENT GALACTIC TIDAL SCALE ~1-2 pc', '依赖模型的银河潮汐尺度约 1-2 秒差距'), (hillStart + hillEnd) / 2, 74, palette.pink, 9, 'center');
    }

    const selected = solarObjects.find(object => object.id === state.solarObject);
    $('solarCanvasSubtitle').textContent = localized(config.subtitle);
    $('solarDistance').textContent = selected.au === 0
      ? t('System centre', '系统中心')
      : `${fixed(selected.au, selected.au < 10 ? 2 : 1)} AU`;
    $('solarPopulation').textContent = localized(selected.kind);
    $('solarTransform').textContent = localized(config.label);
    $('solarScaleWarning').textContent = t('Body sizes enlarged', '天体尺寸已放大');
    $('solarSelection').innerHTML = `<strong>${localized(selected.name)}</strong><span class="data-line">${localized(selected.population)} · ${selected.au ? `${selected.au} AU` : t('central star', '中央恒星')}</span><p>${localized(selected.fact)}</p>`;
  }

  function reachClassification(distance) {
    if (distance < 30) return {
      title: t('Inside the major-planet system', '位于主要行星系统内'),
      body: t('Solar wind flows past the planets, while gravity and orbital resonances organize their motion.', '太阳风流经各行星，引力与轨道共振则组织它们的运动。')
    };
    if (distance < 84) return {
      title: t('Outer heliosphere', '日球层外部'),
      body: t('This remains inside both Voyager termination-shock crossings; solar-wind conditions vary with direction and time.', '这里仍位于两艘旅行者号的终止激波穿越位置以内；太阳风条件会随方向和时间变化。')
    };
    if (distance < 130) return {
      title: t('Termination shock to heliopause', '从终止激波到日球层顶'),
      body: t('Voyager 1 and 2 crossed different boundaries at different distances, evidence that this region is not a rigid sphere.', '旅行者 1 号和 2 号在不同距离穿越不同边界，说明该区域并非刚性球面。')
    };
    if (distance < 1000) return {
      title: t('Interstellar plasma, still Solar gravity', '星际等离子体中，仍受太阳引力'),
      body: t('Beyond the heliopause, the surrounding plasma is interstellar; that does not mean the Sun’s gravity has ended.', '越过日球层顶后，周围等离子体属于星际介质；这并不意味着太阳引力已经结束。')
    };
    if (distance < 100000) return {
      title: t('Inferred Oort Cloud regime', '推断的奥尔特云范围'),
      body: t('Long-period comet orbits motivate a distant reservoir, but its inner structure and outer extent remain model-dependent.', '长周期彗星轨道提示存在遥远储库，但其内部结构与外部范围仍依赖模型。')
    };
    if (distance < 412000) return {
      title: t('Galactic tides compete strongly', '银河潮汐开始强烈竞争'),
      body: t('Near the estimated 1-2 pc tidal/Jacobi scale, Galactic tides and stellar passages can remove weakly bound objects. The scale is anisotropic and potential-dependent.', '接近约 1-2 秒差距的潮汐/雅可比尺度时，银河潮汐与恒星掠过可移走弱束缚天体。该尺度具有方向性并依赖引力势模型。')
    };
    return {
      title: t('Beyond the nominal Solar tidal region', '超出名义太阳潮汐区域'),
      body: t('The Sun still exerts gravity here, but it is not the dominant organizer of long-lived bound orbits.', '太阳在这里仍施加引力，但已不是长期束缚轨道的主导组织者。')
    };
  }

  function drawReach() {
    clear(reachScene);
    const { context, width, height } = reachScene;
    const left = 118;
    const right = width - 38;
    const top = 66;
    const bottom = height - 52;
    const maxLog = 6;
    const xFor = distance => left + Math.log10(clamp(distance, 1, 1000000)) / maxLog * (right - left);
    const rows = [
      { y: top + 20, label: { en: 'PLANETS', zh: '行星' }, start: 1, end: 50, color: palette.gold, note: { en: 'major planets + Kuiper overlap', zh: '主要行星与柯伊伯带重叠区' } },
      { y: top + (bottom - top) * 0.34, label: { en: 'SOLAR WIND', zh: '太阳风' }, start: 1, end: 120, color: palette.cyan, note: { en: 'crossings near 119-122 AU', zh: '穿越位置约 119-122 天文单位' } },
      { y: top + (bottom - top) * 0.66, label: { en: 'OORT MODEL', zh: '奥尔特模型' }, start: 1000, end: 100000, color: palette.green, note: { en: 'inferred, uncertain', zh: '推断且不确定' } },
      { y: bottom - 10, label: { en: 'TIDAL SCALE', zh: '潮汐尺度' }, start: 206000, end: 412000, color: palette.pink, note: { en: '~1-2 pc, model-dependent', zh: '约 1-2 秒差距，依赖模型' } }
    ];

    for (let exponent = 0; exponent <= maxLog; exponent++) {
      const x = xFor(10 ** exponent);
      line(context, x, 36, x, bottom + 28, 'rgba(238,242,255,0.1)');
      text(context, exponent === 0 ? '1 AU' : `10^${exponent} AU`, x, 24, palette.muted, 9, 'center');
    }

    for (const row of rows) {
      text(context, localized(row.label), left - 12, row.y, row.color, 10, 'right');
      line(context, xFor(row.start), row.y, xFor(row.end), row.y, row.color, 7);
      circle(context, xFor(row.start), row.y, 4, row.color);
      circle(context, xFor(row.end), row.y, 4, row.color);
      text(context, localized(row.note), xFor(row.end) + 8, row.y - 12, palette.muted, 9, xFor(row.end) > width - 135 ? 'right' : 'left');
    }

    line(context, left, bottom + 24, right, bottom + 24, 'rgba(238,242,255,0.28)', 1);
    arrow(context, left, bottom + 24, right, bottom + 24, palette.muted, 1, t('Gravity fades continuously; no cutoff', '引力连续衰减；没有硬截止'));

    const markerX = xFor(state.reachAU);
    line(context, markerX, 35, markerX, bottom + 32, palette.paper, 2, [4, 4]);
    circle(context, markerX, top - 17, 7, palette.paper, palette.cyan, 2);
    text(context, formatAU(state.reachAU), clamp(markerX, 70, width - 70), top - 34, palette.paper, 11, 'center');

    const classification = reachClassification(state.reachAU);
    $('reachSummary').innerHTML = `<strong>${classification.title}</strong><span class="data-line">${formatAU(state.reachAU)}</span><p>${classification.body}</p>`;
    $('windReadout').textContent = state.reachAU < 84 ? t('Supersonic outward plasma', '超声速向外等离子体') : state.reachAU < 130 ? t('Slowed and diverted', '减速并偏转') : t('Interstellar plasma region', '星际等离子体区域');
    $('heliopauseReadout').textContent = t('Observed crossings ~119-122 AU', '观测穿越约 119-122 天文单位');
    $('oortReadout').textContent = t('Inferred ~1k-100k AU', '推断约 1 千-10 万天文单位');
    $('gravityReadout').textContent = t('Tidal scale ~1-2 pc', '潮汐尺度约 1-2 秒差距');
    $('reachOutput').textContent = formatAU(state.reachAU);
  }

  function formatAU(distance) {
    if (distance >= AU_PER_LY) return t(`${fixed(distance / AU_PER_LY, 2)} ly`, `${fixed(distance / AU_PER_LY, 2)} 光年`);
    if (distance >= 1000) return t(`${fixed(distance / 1000, 1)}k AU`, `${fixed(distance / 1000, 1)} 千天文单位`);
    if (distance >= 10) return `${fixed(distance, 0)} AU`;
    return `${fixed(distance, 2)} AU`;
  }

  function missionSnapshot(mission, year) {
    if (year < mission.launch) return null;
    const milestones = mission.milestones;
    let previous = milestones[0];
    let next = null;
    for (let index = 0; index < milestones.length; index++) {
      if (milestones[index].year <= year) previous = milestones[index];
      if (milestones[index].year > year) {
        next = milestones[index];
        break;
      }
    }
    if (!next) {
      return {
        au: previous.au,
        label: previous.label,
        year: previous.year,
        planned: previous.planned && year >= previous.year,
        ended: year > mission.end && mission.end < 2029
      };
    }
    const amount = clamp((year - previous.year) / Math.max(0.001, next.year - previous.year), 0, 1);
    const startLog = Math.log10(Math.max(previous.au, 0.002));
    const endLog = Math.log10(Math.max(next.au, 0.002));
    return {
      au: 10 ** mix(startLog, endLog, amount),
      label: previous.label,
      year: previous.year,
      planned: next.planned,
      ended: false,
      next
    };
  }

  function missionRadius(distance, maximum) {
    const minimum = Math.log10(0.002);
    const value = Math.log10(Math.max(distance, 0.002));
    const max = Math.log10(200);
    return 14 + clamp((value - minimum) / (max - minimum), 0, 1) * (maximum - 14);
  }

  function drawMissions() {
    clear(missionScene);
    drawBackgroundStars(missionScene, 0.4);
    const { context, width, height } = missionScene;
    const cx = width * 0.48;
    const cy = height * 0.5;
    const maximum = Math.min(width * 0.43, height * 0.43);
    const rings = [
      [1, t('EARTH', '地球')],
      [5.2, t('JUPITER', '木星')],
      [9.5, t('SATURN', '土星')],
      [30, t('NEPTUNE', '海王星')],
      [50, t('KUIPER', '柯伊伯')],
      [120, t('HELIOPAUSE', '日球层顶')]
    ];
    for (const [index, [distance, caption]] of rings.entries()) {
      const radius = missionRadius(distance, maximum);
      context.strokeStyle = distance === 120 ? 'rgba(0,212,255,0.45)' : 'rgba(238,242,255,0.13)';
      context.setLineDash(distance === 120 ? [5, 5] : []);
      context.beginPath();
      context.arc(cx, cy, radius, 0, TAU);
      context.stroke();
      context.setLineDash([]);
      text(context, `${caption} · ${distance} AU`, width - 18, 28 + index * 15, distance === 120 ? palette.cyan : palette.muted, 8, 'right');
    }
    circle(context, cx, cy, 9, palette.gold);

    const visible = [];
    for (const mission of missions) {
      const snapshot = missionSnapshot(mission, state.missionYear);
      if (!snapshot) continue;
      visible.push({ mission, snapshot });
      const highlighted = state.missionFilter === 'all' || state.missionFilter === mission.id;
      const points = [];
      for (const milestone of mission.milestones) {
        if (milestone.year > state.missionYear) break;
        const radius = missionRadius(milestone.au, maximum);
        points.push([
          cx + Math.cos(mission.angle) * radius,
          cy + Math.sin(mission.angle) * radius
        ]);
      }
      const currentRadius = missionRadius(snapshot.au, maximum);
      const current = [
        cx + Math.cos(mission.angle) * currentRadius,
        cy + Math.sin(mission.angle) * currentRadius
      ];
      if (!points.length || points[points.length - 1][0] !== current[0]) points.push(current);
      context.save();
      context.globalAlpha = highlighted ? 0.88 : 0.16;
      context.strokeStyle = mission.color;
      context.lineWidth = state.missionFilter === mission.id ? 3 : 1.4;
      context.beginPath();
      context.moveTo(cx, cy);
      for (const [x, y] of points) context.lineTo(x, y);
      context.stroke();
      context.restore();
      circle(context, current[0], current[1], state.missionFilter === mission.id ? 7 : 4, mission.color, highlighted ? palette.paper : '', 1);
      if (state.missionFilter === mission.id || (state.missionFilter === 'all' && visible.length <= 8)) {
        text(context, localized(mission.name), current[0] + (current[0] > cx ? 8 : -8), current[1] - 10, mission.color, 9, current[0] > cx ? 'left' : 'right');
      }
    }

    text(context, `${fixed(state.missionYear, state.missionYear % 1 ? 1 : 0)}`, 20, 28, palette.paper, 18);
    text(context, t('MILESTONE INTERPOLATION', '里程碑插值'), 20, 50, palette.cyan, 9);
    $('missionYearOutput').textContent = fixed(state.missionYear, state.missionYear % 1 ? 1 : 0);
    const era = visible
      .map(item => ({ ...item, distance: Math.abs(item.snapshot.year - state.missionYear) }))
      .sort((a, b) => a.distance - b.distance)[0];
    $('missionEra').textContent = era
      ? `${localized(era.mission.name)}: ${localized(era.snapshot.label)}`
      : t('Before the first mission in this ledger.', '早于本账本中的第一项任务。');

    $('missionLedger').innerHTML = missions.map(mission => {
      const snapshot = missionSnapshot(mission, state.missionYear);
      const future = !snapshot;
      const label = future
        ? t(`Launches ${Math.floor(mission.launch)}`, `${Math.floor(mission.launch)} 年发射`)
        : localized(snapshot.label);
      const className = [
        'mission-entry',
        future ? 'future' : '',
        state.missionFilter === mission.id ? 'active' : ''
      ].filter(Boolean).join(' ');
      return `<div class="${className}"><time>${future ? Math.floor(mission.launch) : fixed(snapshot.year, snapshot.year % 1 ? 1 : 0)}</time><div><strong>${localized(mission.name)}</strong><span>${label}${snapshot?.planned ? ` · ${t('planned/illustrative', '计划/示意')}` : ''}</span></div></div>`;
    }).join('');
    updatePlaybackButtons();
  }

  function assistValues() {
    const relative = 9;
    const turn = state.turnAngle * Math.PI / 180;
    const geometry = state.encounterSide;
    const incoming = 18;
    const delta = 2 * state.planetSpeed * Math.sin(turn / 2) * geometry * 0.43;
    return { relative, incoming, outgoing: Math.max(2, incoming + delta), delta };
  }

  function drawAssistVectors() {
    clear(assistScene);
    drawBackgroundStars(assistScene, 0.22);
    const { context, width, height } = assistScene;
    const cx = width * 0.53;
    const cy = height * 0.5;
    const side = state.encounterSide >= 0 ? 1 : -1;
    const magnitude = Math.max(0.15, Math.abs(state.encounterSide));
    const span = Math.min(width * 0.36, 270);
    const vertical = Math.min(height * 0.25, 110) * side * magnitude;

    arrow(context, cx - 82, cy - 130, cx + 72, cy - 130, palette.gold, 3, t('planet velocity around Sun', '行星绕日速度'));
    circle(context, cx, cy, 30, '#5d79ff', palette.paper, 1.5);
    text(context, t('MOVING PLANET', '运动中的行星'), cx, cy + 48, palette.paper, 10, 'center');

    const pathPoint = amount => {
      const u = mix(-1.2, 1.2, amount);
      const x = cx + u * span;
      const bend = Math.exp(-u * u * 2.2);
      const y = cy + vertical * (u * 0.66) - side * bend * 88;
      return { x, y };
    };
    context.strokeStyle = palette.cyan;
    context.lineWidth = 2;
    context.beginPath();
    for (let index = 0; index <= 100; index++) {
      const point = pathPoint(index / 100);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();

    const progress = state.assistProgress;
    const craft = pathPoint(progress);
    const before = pathPoint(clamp(progress - 0.012, 0, 1));
    const after = pathPoint(clamp(progress + 0.012, 0, 1));
    circle(context, craft.x, craft.y, 7, palette.paper, palette.cyan, 2);
    const tangentX = after.x - before.x;
    const tangentY = after.y - before.y;
    const tangentLength = Math.hypot(tangentX, tangentY);
    arrow(context, craft.x, craft.y, craft.x + tangentX / tangentLength * 78, craft.y + tangentY / tangentLength * 78, palette.green, 2, t('velocity', '速度'));
    const forceX = cx - craft.x;
    const forceY = cy - craft.y;
    const forceLength = Math.hypot(forceX, forceY);
    arrow(context, craft.x, craft.y, craft.x + forceX / forceLength * 56, craft.y + forceY / forceLength * 56, palette.pink, 2, t('gravity', '引力'));

    const turnArcRadius = 72;
    context.strokeStyle = palette.violet;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cx, cy, turnArcRadius, -2.6, -2.6 + side * state.turnAngle * Math.PI / 180, side < 0);
    context.stroke();
    text(context, `${state.turnAngle}°`, cx + side * 18, cy - 92, palette.violet, 11, 'center');

    const values = assistValues();
    $('assistIncoming').textContent = `${fixed(values.incoming, 1)} km/s`;
    $('assistOutgoing').textContent = `${fixed(values.outgoing, 1)} km/s`;
    $('assistRelative').textContent = t(`${fixed(values.relative, 1)} km/s both ways`, `两端均约 ${fixed(values.relative, 1)} km/s`);
    $('assistDelta').textContent = `${values.delta >= 0 ? '+' : ''}${fixed(values.delta, 1)} km/s`;
    $('assistCanvasSubtitle').textContent = t('The force arrow always points toward the planet; the velocity arrow follows the path.', '力箭头始终指向行星；速度箭头沿路径切线。');
  }

  function drawVoyagerAssist() {
    clear(assistScene);
    drawBackgroundStars(assistScene, 0.36);
    const { context, width, height } = assistScene;
    const left = 70;
    const right = width - 66;
    const y = height * 0.56;
    const positions = voyagerEncounters.map((_, index) => left + index / 3 * (right - left));
    context.strokeStyle = palette.cyan;
    context.lineWidth = 2.5;
    context.beginPath();
    context.moveTo(left - 38, y + 58);
    voyagerEncounters.forEach((encounter, index) => {
      const x = positions[index];
      const offset = index % 2 ? -58 : 58;
      context.quadraticCurveTo(x - 36, y + offset, x, y);
    });
    context.lineTo(right + 44, y - 74);
    context.stroke();

    voyagerEncounters.forEach((encounter, index) => {
      const selected = index === state.voyagerEncounter;
      const x = positions[index];
      circle(context, x, y, selected ? 28 : 20, encounter.color, selected ? palette.paper : '', selected ? 2 : 1);
      text(context, localized(encounter.planet), x, y + 46, selected ? palette.cyan : palette.paper, 10, 'center');
      text(context, String(encounter.year), x, y + 62, palette.muted, 9, 'center');
      if (index < 3) arrow(context, x + 24, y - 82, positions[index + 1] - 24, y - 82, palette.gold, 1.5, localized(encounter.next));
    });
    arrow(context, right - 12, y - 74, right + 54, y - 110, palette.green, 2, t('out of ecliptic', '离开黄道面'));
    text(context, t('PLANET POSITIONS AND PATH CURVATURE ARE SCHEMATIC', '行星位置与路径曲率均为示意'), width / 2, 28, palette.muted, 9, 'center');

    const encounter = voyagerEncounters[state.voyagerEncounter];
    $('voyagerEncounterOutput').textContent = `${localized(encounter.planet)} - ${encounter.year}`;
    $('voyagerAssistSummary').innerHTML = `<strong>${localized(encounter.planet)} · ${encounter.year}</strong><span class="data-line">${localized(encounter.next)}</span><p>${localized(encounter.purpose)}</p>`;
    $('assistIncoming').textContent = t(`${localized(encounter.planet)} approach`, `接近${localized(encounter.planet)}`);
    $('assistOutgoing').textContent = localized(encounter.next);
    $('assistRelative').textContent = t('Far speed nearly conserved', '远场速度大小近似守恒');
    $('assistDelta').textContent = t('Sun-frame vector changed', '日心矢量已改变');
    $('assistCanvasSubtitle').textContent = t('The 176-year planetary alignment made a four-giant-planet route possible; exact targeting still required separate flyby solutions.', '约 176 年一遇的行星排列使四大巨行星路线成为可能；每次飞越仍需单独求解精确瞄准。');
  }

  function drawAssist() {
    if (state.assistMode === 'vectors') drawAssistVectors();
    else drawVoyagerAssist();
    $('planetSpeedOutput').textContent = `${fixed(state.planetSpeed, 1)} km/s`;
    $('turnAngleOutput').textContent = t(`${state.turnAngle} degrees`, `${state.turnAngle} 度`);
    $('encounterSideOutput').textContent = state.encounterSide >= 0
      ? t('Behind / trailing side', '后方 / 拖后侧')
      : t('Ahead / leading side', '前方 / 超前侧');
    updatePlaybackButtons();
  }

  function drawNeighborhood() {
    clear(neighborScene);
    drawBackgroundStars(neighborScene, 0.26);
    const { context, width, height } = neighborScene;
    const cx = width * 0.5;
    const cy = height * 0.52;
    const radius = Math.min(width * 0.43, height * 0.4);
    const scale = radius / state.neighborDepth;
    for (const fraction of [0.25, 0.5, 0.75, 1]) {
      context.strokeStyle = 'rgba(238,242,255,0.12)';
      context.beginPath();
      context.arc(cx, cy, radius * fraction, 0, TAU);
      context.stroke();
      text(context, `${fixed(state.neighborDepth * fraction, 0)} ly`, cx + radius * fraction, cy + 12, palette.muted, 8, 'right');
    }
    line(context, cx - radius, cy, cx + radius, cy, palette.line);
    line(context, cx, cy - radius, cx, cy + radius, palette.line);
    circle(context, cx, cy, 7, palette.gold, palette.paper, 1);
    text(context, t('SUN', '太阳'), cx + 11, cy - 11, palette.gold, 9);

    for (const system of nearbySystems) {
      if (system.distance > state.neighborDepth) continue;
      const x = cx + system.x * scale;
      const y = cy + system.y * scale;
      const selected = system.id === state.neighbor;
      const zRadius = 4 + clamp(Math.abs(system.z) / state.neighborDepth * 12, 0, 8);
      circle(context, x, y, selected ? zRadius + 3 : zRadius, system.color, selected ? palette.cyan : '', 2);
      if (selected || state.neighborDepth <= 18) {
        text(context, localized(system.name), x + (x > cx ? 9 : -9), y - 12, selected ? palette.cyan : palette.paper, selected ? 10 : 9, x > cx ? 'left' : 'right');
      }
      const verticalDirection = system.z < 0 ? 1 : -1;
      line(context, x, y, x, y + verticalDirection * clamp(Math.abs(system.z) * scale * 0.28, 4, 26), system.z < 0 ? palette.violet : palette.green, 1);
    }
    text(context, t('Circle radius = projected distance; stem = J2000 z height', '圆半径 = 投影距离；短线 = J2000 z 高度'), 18, height - 20, palette.muted, 9);

    const selected = nearbySystems.find(system => system.id === state.neighbor);
    $('neighborDepthOutput').textContent = t(`${state.neighborDepth} ly`, `${state.neighborDepth} 光年`);
    $('neighborSummary').innerHTML = `<strong>${localized(selected.name)}</strong><span class="data-line">(${fixed(selected.x, 2)}, ${fixed(selected.y, 2)}, ${fixed(selected.z, 2)}) ly</span><p>${localized(selected.note)}</p>`;
    $('neighborDistance').textContent = t(`${fixed(selected.distance, 2)} ly`, `${fixed(selected.distance, 2)} 光年`);
    $('neighborPlanets').textContent = localized(selected.planets);
    $('neighborLight').textContent = t(`${fixed(selected.distance, 2)} years`, `${fixed(selected.distance, 2)} 年`);
    $('neighborHeight').textContent = selected.z > 0.4
      ? t('North of projection plane', '位于投影平面北侧')
      : selected.z < -1 ? t('South of projection plane', '位于投影平面南侧') : t('Near projection plane', '接近投影平面');
    $('neighborCanvasSubtitle').textContent = t(`J2000 Cartesian snapshot inside ${state.neighborDepth} light-years`, `J2000 笛卡尔快照，半径 ${state.neighborDepth} 光年`);
  }

  function drawGalaxyFace(context, cx, cy, radius, angle, layer, compact = false) {
    if (layer === 'matter') {
      const gradient = context.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.05);
      gradient.addColorStop(0, 'rgba(124,92,255,0.24)');
      gradient.addColorStop(0.45, 'rgba(124,92,255,0.13)');
      gradient.addColorStop(1, 'rgba(124,92,255,0.02)');
      circle(context, cx, cy, radius * 1.02, gradient);
    }
    context.save();
    context.translate(cx, cy);
    context.rotate(angle);
    for (let arm = 0; arm < 4; arm++) {
      context.strokeStyle = arm % 2 ? 'rgba(0,212,255,0.28)' : 'rgba(238,242,255,0.26)';
      context.lineWidth = compact ? 4 : 7;
      context.beginPath();
      for (let step = 0; step <= 120; step++) {
        const amount = step / 120;
        const r = radius * (0.12 + amount * 0.82);
        const theta = arm * TAU / 4 + amount * 4.7;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r * 0.78;
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    context.fillStyle = 'rgba(255,209,102,0.56)';
    context.fillRect(-radius * 0.34, -radius * 0.065, radius * 0.68, radius * 0.13);
    context.restore();

    const starCount = compact ? 130 : galaxyStars.length;
    for (let index = 0; index < starCount; index++) {
      const star = galaxyStars[index];
      const theta = star.angle + angle * (1 + (1 - star.radius) * 0.35);
      const r = star.radius * radius;
      const x = cx + Math.cos(theta + star.offset) * r;
      const y = cy + Math.sin(theta + star.offset) * r * 0.78;
      const alpha = 0.18 + (1 - star.radius) * 0.4;
      circle(context, x, y, star.age > 0.94 ? 1.7 : 0.7, `rgba(238,242,255,${alpha})`);
    }
    circle(context, cx, cy, compact ? 8 : 12, palette.gold);
    const sunRadius = radius * 0.53;
    const sunAngle = -0.34 + angle;
    const sunX = cx + Math.cos(sunAngle) * sunRadius;
    const sunY = cy + Math.sin(sunAngle) * sunRadius * 0.78;
    circle(context, sunX, sunY, compact ? 4 : 6, palette.cyan, palette.paper, 1);
    if (!compact) {
      line(context, sunX, sunY - 8, sunX, sunY - 36, palette.cyan, 1);
      text(context, t('SUN', '太阳'), sunX, sunY - 46, palette.cyan, 10, 'center');
      text(context, t('Sgr A*', '人马座 A*'), cx + 15, cy + 18, palette.gold, 9);
    }
  }

  function drawGalaxyEdge(context, width, height, layer) {
    const cx = width * 0.5;
    const cy = height * 0.53;
    const diskWidth = width * 0.78;
    if (layer === 'matter') {
      const gradient = context.createRadialGradient(cx, cy, 10, cx, cy, diskWidth * 0.55);
      gradient.addColorStop(0, 'rgba(124,92,255,0.24)');
      gradient.addColorStop(1, 'rgba(124,92,255,0.02)');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(cx, cy, diskWidth * 0.58, height * 0.38, 0, 0, TAU);
      context.fill();
    }
    context.fillStyle = 'rgba(238,242,255,0.08)';
    context.beginPath();
    context.ellipse(cx, cy, diskWidth * 0.5, height * 0.13, 0, 0, TAU);
    context.fill();
    context.fillStyle = 'rgba(0,212,255,0.2)';
    context.fillRect(cx - diskWidth / 2, cy - 6, diskWidth, 12);
    const bulge = context.createRadialGradient(cx, cy, 4, cx, cy, height * 0.18);
    bulge.addColorStop(0, 'rgba(255,209,102,0.92)');
    bulge.addColorStop(1, 'rgba(255,209,102,0)');
    circle(context, cx, cy, height * 0.2, bulge);
    const sunX = cx + diskWidth * 0.265;
    circle(context, sunX, cy - 6, 6, palette.cyan, palette.paper, 1);
    text(context, t('SUN ~65 ly ABOVE NOMINAL MID-PLANE', '太阳约在名义中平面上方 65 光年'), sunX, cy - 28, palette.cyan, 9, 'center');
    line(context, cx - diskWidth / 2, height - 46, cx + diskWidth / 2, height - 46, palette.muted);
    text(context, t('~100,000 ly luminous disk (definition varies)', '约 10 万光年发光盘（定义不一）'), cx, height - 28, palette.muted, 9, 'center');
  }

  function drawLocalGroup(context, width, height) {
    const cx = width * 0.42;
    const cy = height * 0.55;
    const scale = Math.min(width, height) * 0.19;
    drawGalaxyFace(context, cx, cy, scale, state.galaxyAngle, 'stars', true);
    text(context, t('MILKY WAY', '银河系'), cx, cy + scale + 26, palette.paper, 10, 'center');
    const m31x = width * 0.76;
    const m31y = height * 0.33;
    context.save();
    context.translate(m31x, m31y);
    context.rotate(-0.42);
    context.fillStyle = 'rgba(159,140,255,0.38)';
    context.beginPath();
    context.ellipse(0, 0, scale * 1.08, scale * 0.3, 0, 0, TAU);
    context.fill();
    context.restore();
    text(context, t('ANDROMEDA / ~2.5 Mly', '仙女座 / 约 250 万光年'), m31x, m31y - scale * 0.42, palette.violet, 10, 'center');
    circle(context, width * 0.24, height * 0.35, 10, palette.green);
    text(context, t('MAGELLANIC CLOUDS', '麦哲伦云'), width * 0.24, height * 0.35 - 22, palette.green, 9, 'center');
    circle(context, width * 0.87, height * 0.69, 8, palette.cyan);
    text(context, 'M33', width * 0.87, height * 0.69 + 19, palette.cyan, 9, 'center');
    arrow(context, m31x - 36, m31y + 50, cx + 52, cy - 46, palette.pink, 1.5, t('approaching; outcome uncertain', '正在接近；结局不确定'));
  }

  function drawGalaxy() {
    clear(galaxyScene);
    drawBackgroundStars(galaxyScene, 0.52);
    const { context, width, height } = galaxyScene;
    if (state.galaxyLayer === 'neighbors') {
      drawLocalGroup(context, width, height);
    } else if (state.galaxyView === 'face') {
      drawGalaxyFace(context, width * 0.5, height * 0.52, Math.min(width * 0.42, height * 0.43), state.galaxyAngle, state.galaxyLayer);
    } else {
      drawGalaxyEdge(context, width, height, state.galaxyLayer);
    }
    text(context, state.galaxyView === 'face' ? t('FACE-ON RECONSTRUCTION', '俯视重建') : t('EDGE-ON RECONSTRUCTION', '侧视重建'), 18, 24, palette.muted, 9);
    const summaries = {
      stars: {
        title: t('Luminous structure', '发光结构'),
        body: t('Stars, gas, dust, and young tracers constrain a barred disk with spiral structure; the far side remains harder to map.', '恒星、气体、尘埃与年轻示踪物约束出带旋臂的棒状盘；银河系远侧仍更难绘制。')
      },
      matter: {
        title: t('Inferred gravitating mass', '推断的引力质量'),
        body: t('The violet halo is a mass-model component inferred from motions and other evidence, not a visible cloud or direct dark-matter image.', '紫色晕是由运动等证据推断的质量模型成分，并非可见云团或暗物质直接图像。')
      },
      neighbors: {
        title: t('A moving Local Group', '运动中的本星系群'),
        body: t('The Milky Way, Andromeda, Triangulum, Magellanic Clouds, and many dwarfs interact. Distances and galaxy sizes do not share one scale here.', '银河系、仙女座、三角座、麦哲伦云及众多矮星系彼此作用。本图中的星系距离与尺寸不共用同一比例。')
      }
    };
    const summary = summaries[state.galaxyLayer];
    $('galaxySummary').innerHTML = `<strong>${summary.title}</strong><span class="data-line">${state.galaxyView === 'face' ? t('face-on model', '俯视模型') : t('edge-on model', '侧视模型')}</span><p>${summary.body}</p>`;
    $('galaxyCanvasSubtitle').textContent = state.galaxyLayer === 'neighbors'
      ? t('Galaxy separations are radically compressed.', '星系间距被大幅压缩。')
      : t('A reconstruction from internal observations, not an exterior photograph.', '这是根据内部观测重建的图，并非外部照片。');
    updatePlaybackButtons();
  }

  function historyStage() {
    return historyStages.find(stage => state.galaxyTime <= stage.max);
  }

  function drawGalaxyHistory() {
    clear(historyScene);
    drawBackgroundStars(historyScene, 0.38);
    const { context, width, height } = historyScene;
    const amount = clamp((state.galaxyTime - 0.8) / (18.3 - 0.8), 0, 1);
    const presentAmount = (PRESENT_AGE - 0.8) / (18.3 - 0.8);
    const cx = width * 0.46;
    const cy = height * 0.46;
    const base = Math.min(width, height);
    const diskAmount = clamp((state.galaxyTime - 2.2) / 11.6, 0, 1);

    if (state.galaxyTime < 2.2) {
      const random = seededRandom(1200);
      for (let index = 0; index < 16; index++) {
        const x = cx + (random() - 0.5) * width * 0.55;
        const y = cy + (random() - 0.5) * height * 0.45;
        circle(context, x, y, 4 + random() * 10, index % 3 ? 'rgba(238,242,255,0.35)' : 'rgba(255,209,102,0.5)');
      }
    } else {
      drawGalaxyFace(context, cx, cy, base * mix(0.16, 0.35, diskAmount), state.galaxyAngle * 0.4, 'stars', true);
      const satelliteCount = state.galaxyTime < 6 ? 6 : 3;
      for (let index = 0; index < satelliteCount; index++) {
        const angle = index / satelliteCount * TAU + state.galaxyTime * 0.08;
        const radius = base * (0.25 + index * 0.03);
        circle(context, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.65, 4 + (index % 3), 'rgba(159,140,255,0.58)');
      }
    }

    if (state.galaxyTime > PRESENT_AGE) {
      const future = (state.galaxyTime - PRESENT_AGE) / (18.3 - PRESENT_AGE);
      const m31x = mix(width * 0.9, cx + base * 0.2, future);
      const m31y = mix(height * 0.22, cy - base * 0.08, future);
      context.save();
      context.translate(m31x, m31y);
      context.rotate(-0.35);
      context.fillStyle = 'rgba(159,140,255,0.46)';
      context.beginPath();
      context.ellipse(0, 0, base * 0.12, base * 0.035, 0, 0, TAU);
      context.fill();
      context.restore();
      text(context, t('ONE POSSIBLE M31 APPROACH', '一种可能的 M31 接近情景'), m31x, m31y - 28, palette.violet, 9, 'center');
    }

    const axisY = height - 44;
    line(context, 30, axisY, width - 30, axisY, palette.muted);
    const presentX = 30 + presentAmount * (width - 60);
    line(context, presentX, axisY - 13, presentX, axisY + 13, palette.cyan, 2);
    text(context, t('PRESENT', '现在'), presentX, axisY + 25, palette.cyan, 9, 'center');
    const markerX = 30 + amount * (width - 60);
    circle(context, markerX, axisY, 7, palette.paper, palette.violet, 2);

    const stage = historyStage();
    $('galaxyHistorySummary').innerHTML = `<strong>${localized(stage.title)}</strong><span class="data-line">${formatCosmicAge(state.galaxyTime)}</span><p>${localized(stage.detail)}</p>`;
    $('galaxyTimeOutput').textContent = formatCosmicAge(state.galaxyTime);
    $('galaxyHistorySubtitle').textContent = localized(stage.title);
    $('historyMilestones').innerHTML = historyStages.map((item, index) => {
      const active = item === stage ? ' active' : '';
      const ranges = [
        t('0.8-2.2 Gyr', '0.8-2.2 十亿年'),
        t('2.2-5.8 Gyr', '2.2-5.8 十亿年'),
        t('5.8-9.8 Gyr', '5.8-9.8 十亿年'),
        t('9.8-13.8 Gyr', '9.8-13.8 十亿年'),
        t('future scenario', '未来情景')
      ];
      return `<div class="history-marker${active}"><strong>${localized(item.title)}</strong><span>${ranges[index]}</span></div>`;
    }).join('');
    updatePlaybackButtons();
  }

  function formatCosmicAge(age) {
    if (age <= PRESENT_AGE + 0.05) {
      const suffix = Math.abs(age - PRESENT_AGE) < 0.06 ? t(' - present', ' - 现在') : '';
      return t(`${fixed(age, 1)} billion yr${suffix}`, `${fixed(age, 1)} 十亿年${suffix}`);
    }
    const future = age - PRESENT_AGE;
    return t(`${fixed(future, 1)} billion yr from now`, `距今未来 ${fixed(future, 1)} 十亿年`);
  }

  function angularDistance(a, b) {
    const difference = Math.abs((((a - b) % 360) + 540) % 360 - 180);
    return difference;
  }

  function directionName(direction) {
    const normalized = ((direction % 360) + 360) % 360;
    if (normalized <= 22 || normalized >= 338) return t('toward Galactic Centre', '朝向银河系中心');
    if (normalized >= 158 && normalized <= 202) return t('toward Galactic anticentre', '朝向银河系反中心');
    if (normalized < 180) return t('along increasing galactic longitude', '沿银经增加方向');
    return t('along decreasing galactic longitude', '沿银经减小方向');
  }

  function drawSky() {
    clear(skyScene, '#03050d');
    const { context, width, height } = skyScene;
    const observer = observerPositions[state.observerPosition];
    const centreDistance = angularDistance(state.skyDirection, 0);
    const centreFactor = (1 + Math.cos(centreDistance * Math.PI / 180)) / 2;
    const planeFactor = Math.exp(-Math.abs(state.skyElevation) / 19);
    const densityFactor = clamp((0.42 + centreFactor * 1.7) * planeFactor * Math.sqrt(observer.density), 0.12, 6);
    const bandY = height * (0.5 + state.skyElevation / 180);
    const bandTilt = Math.sin(state.skyDirection * Math.PI / 180) * 0.22;

    context.save();
    context.translate(width / 2, bandY);
    context.rotate(bandTilt);
    const gradient = context.createLinearGradient(0, -height * 0.22, 0, height * 0.22);
    gradient.addColorStop(0, 'rgba(159,140,255,0)');
    gradient.addColorStop(0.43, `rgba(159,140,255,${0.08 + centreFactor * 0.12})`);
    gradient.addColorStop(0.5, `rgba(238,242,255,${0.16 + centreFactor * 0.22})`);
    gradient.addColorStop(0.57, `rgba(159,140,255,${0.08 + centreFactor * 0.12})`);
    gradient.addColorStop(1, 'rgba(159,140,255,0)');
    context.fillStyle = gradient;
    context.fillRect(-width, -height * 0.24, width * 2, height * 0.48);
    context.restore();

    const visibleCount = Math.round(clamp(80 * densityFactor, 30, skyStars.length));
    for (let index = 0; index < visibleCount; index++) {
      const star = skyStars[index];
      const bandPreference = index / visibleCount;
      const x = star.x * width;
      const spread = mix(0.42, 0.08, clamp(densityFactor / 6, 0, 1));
      const structuredY = bandY + (star.y - 0.5) * height * spread;
      const y = bandPreference < planeFactor * 0.74 ? structuredY : star.y * height;
      const alpha = star.brightness * (0.42 + planeFactor * 0.42);
      circle(context, x, clamp(y, 8, height - 8), star.size, `rgba(238,242,255,${alpha})`);
    }

    const sgrVisible = centreDistance < 48 && Math.abs(state.skyElevation) < 26;
    if (sgrVisible) {
      const offset = (state.skyDirection / 48) * width * 0.42;
      const x = width / 2 - offset;
      const y = bandY - state.skyElevation / 26 * height * 0.18;
      circle(context, x, y, 8, palette.gold, palette.paper, 1);
      line(context, x, y + 10, x, y + 43, palette.gold, 1, [4, 3]);
      text(context, t('Sgr A* DIRECTION', '人马座 A* 方向'), x, y + 57, palette.gold, 9, 'center');
    }

    const horizon = height - 34;
    line(context, 0, horizon, width, horizon, 'rgba(238,242,255,0.36)');
    text(context, t('SCHEMATIC HORIZON / NOT A STAR CATALOG', '示意地平线 / 并非星表'), 16, horizon + 18, palette.muted, 9);
    $('skyDirectionOutput').textContent = `${Math.round(state.skyDirection)}° - ${directionName(state.skyDirection)}`;
    $('skyElevationOutput').textContent = `${state.skyElevation >= 0 ? '+' : ''}${Math.round(state.skyElevation)}°`;
    $('skySummary').innerHTML = `<strong>${localized(observer.label)}</strong><span class="data-line">${directionName(state.skyDirection)} · ${state.skyElevation >= 0 ? '+' : ''}${state.skyElevation}°</span><p>${localized(observer.note)}</p>`;
    $('skyDensity').textContent = densityFactor > 3
      ? t('Very high relative field', '相对密度很高')
      : densityFactor > 1.2 ? t('Above local baseline', '高于本地基线')
        : densityFactor > 0.55 ? t('Near local baseline', '接近本地基线') : t('Sparse relative field', '相对稀疏');
    $('skyCentreBearing').textContent = centreDistance < 48
      ? t('Inside the field', '位于视场内')
      : centreDistance > 132 ? t('Behind the observer', '位于观察者后方') : t('Outside this field', '位于本视场外');
    $('skyDiskCrossing').textContent = planeFactor > 0.7
      ? t('Long path through disk', '长距离穿过盘')
      : planeFactor > 0.3 ? t('Oblique path', '斜穿盘面') : t('Looking out of disk', '看向盘外');
    $('skySgrStatus').textContent = sgrVisible
      ? t('Direction marked; optically obscured', '方向已标；光学波段受遮挡')
      : t('Outside the schematic field', '位于示意视场外');
    $('skyCanvasSubtitle').textContent = `${localized(observer.label)} · ${directionName(state.skyDirection)}`;
    updatePlaybackButtons();
  }

  function createObjectControls() {
    $('solarObjectList').innerHTML = solarObjects.map(object =>
      `<button type="button" role="option" data-solar-object="${object.id}" aria-selected="${object.id === state.solarObject}">${localized(object.name)}</button>`
    ).join('');
    $('missionFilterList').innerHTML = [
      `<button type="button" role="option" data-mission-filter="all" aria-selected="${state.missionFilter === 'all'}">${t('All missions', '全部任务')}</button>`,
      ...missions.map(mission => `<button type="button" role="option" data-mission-filter="${mission.id}" aria-selected="${mission.id === state.missionFilter}">${localized(mission.name)}</button>`)
    ].join('');
    $('neighborList').innerHTML = nearbySystems.map(system =>
      `<button type="button" role="option" data-neighbor="${system.id}" aria-selected="${system.id === state.neighbor}">${localized(system.name)}</button>`
    ).join('');
    bindGeneratedControls();
  }

  function bindGeneratedControls() {
    document.querySelectorAll('[data-solar-object]').forEach(button => {
      button.addEventListener('click', () => {
        state.solarObject = button.dataset.solarObject;
        const object = solarObjects.find(item => item.id === state.solarObject);
        const config = solarScales[state.solarScale];
        if (object.au < config.min || object.au > config.max) {
          state.solarScale = object.au > 50 ? 'heliosphere' : object.au > 5 ? 'planets' : 'inner';
        }
        renderStaticStates();
        drawSolarSystem();
      });
    });
    document.querySelectorAll('[data-mission-filter]').forEach(button => {
      button.addEventListener('click', () => {
        state.missionFilter = button.dataset.missionFilter;
        renderStaticStates();
        drawMissions();
      });
    });
    document.querySelectorAll('[data-neighbor]').forEach(button => {
      button.addEventListener('click', () => {
        state.neighbor = button.dataset.neighbor;
        const selected = nearbySystems.find(system => system.id === state.neighbor);
        state.neighborDepth = Math.max(state.neighborDepth, Math.ceil(selected.distance));
        $('neighborDepth').value = String(state.neighborDepth);
        renderStaticStates();
        drawNeighborhood();
      });
    });
  }

  function renderStaticStates() {
    document.querySelectorAll('[data-address-scale]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.addressScale === state.addressScale)));
    document.querySelectorAll('[data-solar-scale]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.solarScale === state.solarScale)));
    document.querySelectorAll('[data-solar-object]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.solarObject === state.solarObject)));
    document.querySelectorAll('[data-mission-filter]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.missionFilter === state.missionFilter)));
    document.querySelectorAll('[data-assist-mode]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.assistMode === state.assistMode)));
    document.querySelectorAll('[data-assist-panel]').forEach(panel => {
      panel.hidden = panel.dataset.assistPanel !== state.assistMode;
    });
    document.querySelectorAll('[data-neighbor]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.neighbor === state.neighbor)));
    document.querySelectorAll('[data-galaxy-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galaxyView === state.galaxyView)));
    document.querySelectorAll('[data-galaxy-layer]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galaxyLayer === state.galaxyLayer)));
  }

  function updatePlaybackButtons() {
    const labels = {
      mission: [t('Play mission history', '播放任务历史'), t('Pause mission history', '暂停任务历史')],
      assist: [t('Play the encounter', '播放交会'), t('Pause the encounter', '暂停交会')],
      galaxy: [t('Play differential rotation', '播放差异旋转'), t('Pause differential rotation', '暂停差异旋转')],
      history: [t('Play assembly history', '播放组装历史'), t('Pause assembly history', '暂停组装历史')],
      sky: [t('Sweep the horizon', '扫过地平线'), t('Pause horizon sweep', '暂停地平线扫动')]
    };
    const buttons = {
      mission: $('missionPlay'),
      assist: $('assistPlay'),
      galaxy: $('galaxyRotate'),
      history: $('galaxyTimePlay'),
      sky: $('skyRotate')
    };
    for (const [key, button] of Object.entries(buttons)) {
      const active = state.playing.has(key);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = labels[key][active ? 1 : 0];
    }
  }

  function renderAll() {
    renderStaticStates();
    drawAddress();
    drawSolarSystem();
    drawReach();
    drawMissions();
    drawAssist();
    drawNeighborhood();
    drawGalaxy();
    drawGalaxyHistory();
    drawSky();
    document.title = t('Solar System & Galaxy Atlas - Physics Field Atlas', '太阳系与银河系图谱 - Physics Field Atlas');
  }

  let frame = 0;
  let lastTime = 0;
  function animate(timestamp) {
    if (!state.playing.size) {
      frame = 0;
      lastTime = 0;
      return;
    }
    if (!lastTime) lastTime = timestamp;
    const delta = clamp(timestamp - lastTime, 0, 80);
    lastTime = timestamp;
    if (state.playing.has('mission')) {
      state.missionYear += delta * 73 / 20000;
      if (state.missionYear > 2030) state.missionYear = 1957;
      $('missionYear').value = String(state.missionYear);
      drawMissions();
    }
    if (state.playing.has('assist')) {
      state.assistProgress = (state.assistProgress + delta / 5600) % 1;
      drawAssist();
    }
    if (state.playing.has('galaxy')) {
      state.galaxyAngle = (state.galaxyAngle + delta / 18000 * TAU) % TAU;
      drawGalaxy();
    }
    if (state.playing.has('history')) {
      state.galaxyTime += delta * 17.5 / 22000;
      if (state.galaxyTime > 18.3) state.galaxyTime = 0.8;
      $('galaxyTime').value = String(state.galaxyTime);
      drawGalaxyHistory();
    }
    if (state.playing.has('sky')) {
      state.skyDirection = (state.skyDirection + delta * 360 / 18000) % 360;
      $('skyDirection').value = String(state.skyDirection);
      drawSky();
    }
    frame = requestAnimationFrame(animate);
  }

  function stopPlaying(key) {
    state.playing.delete(key);
    updatePlaybackButtons();
  }

  function togglePlaying(key) {
    if (state.playing.has(key)) {
      stopPlaying(key);
      return;
    }
    window.PhysicsUI.requestMotion();
    state.playing.add(key);
    updatePlaybackButtons();
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function stopAll() {
    state.playing.clear();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    updatePlaybackButtons();
  }

  function bindRange(id, stateKey, render, playbackKey = '') {
    $(id).addEventListener('input', event => {
      if (playbackKey) stopPlaying(playbackKey);
      state[stateKey] = Number(event.currentTarget.value);
      render();
    });
  }

  document.querySelectorAll('[data-address-scale]').forEach(button => {
    button.addEventListener('click', () => {
      state.addressScale = button.dataset.addressScale;
      renderStaticStates();
      drawAddress();
    });
  });
  document.querySelectorAll('[data-solar-scale]').forEach(button => {
    button.addEventListener('click', () => {
      state.solarScale = button.dataset.solarScale;
      renderStaticStates();
      drawSolarSystem();
    });
  });
  $('solarReset').addEventListener('click', () => {
    Object.assign(state, { solarScale: 'planets', solarObject: 'earth' });
    renderStaticStates();
    drawSolarSystem();
  });

  document.querySelectorAll('[data-reach-au]').forEach(button => {
    button.addEventListener('click', () => {
      state.reachAU = Number(button.dataset.reachAu);
      $('reachControl').value = String(Math.log10(state.reachAU));
      drawReach();
    });
  });
  $('reachControl').addEventListener('input', event => {
    state.reachAU = 10 ** Number(event.currentTarget.value);
    drawReach();
  });

  bindRange('missionYear', 'missionYear', drawMissions, 'mission');
  $('missionPlay').addEventListener('click', () => togglePlaying('mission'));
  $('missionReset').addEventListener('click', () => {
    stopPlaying('mission');
    state.missionYear = 1989;
    $('missionYear').value = '1989';
    drawMissions();
  });
  document.querySelectorAll('[data-mission-year]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlaying('mission');
      state.missionYear = Number(button.dataset.missionYear);
      $('missionYear').value = String(state.missionYear);
      drawMissions();
    });
  });

  document.querySelectorAll('[data-assist-mode]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlaying('assist');
      state.assistMode = button.dataset.assistMode;
      renderStaticStates();
      drawAssist();
    });
  });
  bindRange('planetSpeed', 'planetSpeed', drawAssist, 'assist');
  bindRange('turnAngle', 'turnAngle', drawAssist, 'assist');
  bindRange('encounterSide', 'encounterSide', drawAssist, 'assist');
  bindRange('voyagerEncounter', 'voyagerEncounter', drawAssist, 'assist');
  $('assistPlay').addEventListener('click', () => togglePlaying('assist'));
  $('assistReset').addEventListener('click', () => {
    stopPlaying('assist');
    Object.assign(state, { planetSpeed: 13.1, turnAngle: 70, encounterSide: 0.75, assistProgress: 0.18, voyagerEncounter: 3 });
    $('planetSpeed').value = '13.1';
    $('turnAngle').value = '70';
    $('encounterSide').value = '0.75';
    $('voyagerEncounter').value = '3';
    drawAssist();
  });

  bindRange('neighborDepth', 'neighborDepth', drawNeighborhood);

  document.querySelectorAll('[data-galaxy-view]').forEach(button => {
    button.addEventListener('click', () => {
      state.galaxyView = button.dataset.galaxyView;
      renderStaticStates();
      drawGalaxy();
    });
  });
  document.querySelectorAll('[data-galaxy-layer]').forEach(button => {
    button.addEventListener('click', () => {
      state.galaxyLayer = button.dataset.galaxyLayer;
      renderStaticStates();
      drawGalaxy();
    });
  });
  $('galaxyRotate').addEventListener('click', () => togglePlaying('galaxy'));
  $('galaxyReset').addEventListener('click', () => {
    stopPlaying('galaxy');
    Object.assign(state, { galaxyView: 'face', galaxyLayer: 'stars', galaxyAngle: 0 });
    renderStaticStates();
    drawGalaxy();
  });

  bindRange('galaxyTime', 'galaxyTime', drawGalaxyHistory, 'history');
  $('galaxyTimePlay').addEventListener('click', () => togglePlaying('history'));
  $('galaxyTimeReset').addEventListener('click', () => {
    stopPlaying('history');
    state.galaxyTime = PRESENT_AGE;
    $('galaxyTime').value = String(PRESENT_AGE);
    drawGalaxyHistory();
  });
  document.querySelectorAll('[data-galaxy-time]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlaying('history');
      state.galaxyTime = Number(button.dataset.galaxyTime);
      $('galaxyTime').value = String(state.galaxyTime);
      drawGalaxyHistory();
    });
  });

  $('observerPosition').addEventListener('change', event => {
    state.observerPosition = event.currentTarget.value;
    drawSky();
  });
  bindRange('skyDirection', 'skyDirection', drawSky, 'sky');
  bindRange('skyElevation', 'skyElevation', drawSky, 'sky');
  $('skyRotate').addEventListener('click', () => togglePlaying('sky'));
  $('skyReset').addEventListener('click', () => {
    stopPlaying('sky');
    Object.assign(state, { observerPosition: 'sun', skyDirection: 0, skyElevation: 0 });
    $('observerPosition').value = 'sun';
    $('skyDirection').value = '0';
    $('skyElevation').value = '0';
    drawSky();
  });

  document.addEventListener('physics-language', () => {
    createObjectControls();
    renderAll();
  });
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) stopAll();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAll();
  });

  createObjectControls();
  const observer = new ResizeObserver(() => renderAll());
  observer.observe(document.querySelector('.address-instrument'));
  document.querySelectorAll('.instrument-shell').forEach(element => observer.observe(element));

  window.__cosmicAtlas = Object.freeze({
    state,
    solarObjects,
    missions,
    nearbySystems,
    missionSnapshot,
    reachClassification,
    formatAU,
    formatCosmicAge,
    directionName,
    angularDistance,
    assistValues,
    localized,
    requireElement: $,
    renderAll
  });

  renderAll();
})();
