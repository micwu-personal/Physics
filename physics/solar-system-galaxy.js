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
  const smoothstep = (start, end, value) => {
    const amount = clamp((value - start) / Math.max(0.0001, end - start), 0, 1);
    return amount * amount * (3 - 2 * amount);
  };
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
    closestApproach: 6,
    encounterSide: 0.75,
    assistProgress: 0.18,
    voyagerYear: 1979.52,
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
    {
      id: 'jupiter', planet: { en: 'Jupiter', zh: '木星' }, dateValue: 1979.52, date: { en: '9 Jul 1979', zh: '1979 年 7 月 9 日' },
      au: 5.203, period: 11.86, anchorAngle: -2.42, color: '#d6a26d',
      next: { en: 'Saturn transfer', zh: '转向土星' },
      purpose: { en: 'Jupiter redirected Voyager 2 toward Saturn while changing its heliocentric energy and direction.', zh: '木星把旅行者 2 号重定向至土星，同时改变了它的日心能量与方向。' }
    },
    {
      id: 'saturn', planet: { en: 'Saturn', zh: '土星' }, dateValue: 1981.65, date: { en: '26 Aug 1981 UTC', zh: '1981 年 8 月 26 日（UTC）' },
      au: 9.537, period: 29.46, anchorAngle: -1.18, color: '#e3c17d',
      next: { en: 'Uranus transfer', zh: '转向天王星' },
      purpose: { en: 'The Saturn flyby retained the geometry needed for the long transfer to Uranus.', zh: '土星飞越保留了继续进行天王星长距离转移所需的几何。' }
    },
    {
      id: 'uranus', planet: { en: 'Uranus', zh: '天王星' }, dateValue: 1986.07, date: { en: '24 Jan 1986', zh: '1986 年 1 月 24 日' },
      au: 19.19, period: 84.01, anchorAngle: 0.08, color: '#8ce0e8',
      next: { en: 'Neptune transfer', zh: '转向海王星' },
      purpose: { en: 'The Uranus flyby redirected the spacecraft onto the final planetary leg toward Neptune.', zh: '天王星飞越把航天器重定向到前往海王星的最后一段行星航程。' }
    },
    {
      id: 'neptune', planet: { en: 'Neptune', zh: '海王星' }, dateValue: 1989.65, date: { en: '25 Aug 1989', zh: '1989 年 8 月 25 日' },
      au: 30.07, period: 164.8, anchorAngle: 1.12, color: '#5d79ff',
      next: { en: 'South of the ecliptic', zh: '飞向黄道面南侧' },
      purpose: { en: 'Targeting Triton required a close Neptune pass that sent Voyager 2 south of the ecliptic.', zh: '对海卫一的瞄准要求近距离飞越海王星，并把旅行者 2 号送向黄道面南侧。' }
    }
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
  const addressShortNames = {
    proxima: 'Proxima',
    alpha: 'Alpha Cen AB',
    barnard: 'Barnard',
    luhman: 'Luhman 16',
    wolf: 'Wolf 359',
    sirius: 'Sirius AB',
    epsilon: 'Eps Eridani',
    ross128: 'Ross 128',
    tauceti: 'Tau Ceti'
  };

  const historyStages = [
    { max: 2.2, title: { en: 'Early fragments and old stars', zh: '早期碎片与古老恒星' }, detail: { en: 'Small progenitors form stars, orbit inward, and begin overlapping with a growing irregular proto-disk. Exact ancestry is reconstructed, not filmed.', zh: '小型前身系统形成恒星、向内绕行，并开始与逐渐增长的不规则原始盘重叠。具体祖先关系来自重建，并非被直接记录成影片。' } },
    { max: 5.8, title: { en: 'Major ancient accretion', zh: '重大远古吸积' }, detail: { en: 'Fragments do not vanish at this label: their merger signatures fade while the proto-disk strengthens. Kinematics and chemistry support a major Gaia-Enceladus/Sausage event.', zh: '碎片不会在这个标签处突然消失：并合痕迹逐渐淡去，原始盘同步增强。运动学与化学证据支持一次重大的 Gaia-Enceladus/Sausage 吸积事件。' } },
    { max: 9.8, title: { en: 'Disk growth and repeated perturbation', zh: '盘增长与反复扰动' }, detail: { en: 'Gas accretion, star formation, internal redistribution, and smaller mergers grow thin and thick disk populations.', zh: '气体吸积、恒星形成、内部再分配与较小并合共同增长薄盘和厚盘恒星群。' } },
    { max: 14.05, title: { en: 'Present barred spiral', zh: '今日棒旋星系' }, detail: { en: 'The Milky Way continues forming stars and interacting with satellites; “present shape” is a changing snapshot.', zh: '银河系仍在形成恒星并与卫星系统相互作用；“今日形状”只是变化中的快照。' } },
    { max: 18.4, title: { en: 'Possible Local Group close passage', zh: '可能的本星系群近距离交会' }, detail: { en: 'Milky Way-Andromeda outcomes depend on uncertain motions and the wider Local Group. A 2025 analysis found no certainty of merger within 10 billion years.', zh: '银河系与仙女座的结局取决于不确定的运动及更广泛的本星系群动力学。2025 年分析显示，未来 100 亿年内并合并非确定事件。' } }
  ];

  const observerPositions = {
    sun: { radius: 8.2, angle: -0.34, z: 0.02, density: 1, label: { en: 'Solar neighborhood', zh: '太阳邻域' }, note: { en: 'Rough local reference: about 0.04 stars per cubic parsec, depending on census limits.', zh: '粗略本地参考值：约每立方秒差距 0.04 颗恒星，取决于普查限值。' } },
    inner: { radius: 3, angle: 0.72, z: 0.04, density: 16, label: { en: 'Inner disk', zh: '内盘' }, note: { en: 'Stellar density rises strongly inward, but dust also hides visible light along the plane.', zh: '向内恒星密度显著上升，但尘埃也会遮挡盘面方向的可见光。' } },
    outer: { radius: 14, angle: 2.38, z: -0.08, density: 0.28, label: { en: 'Outer disk', zh: '外盘' }, note: { en: 'The stellar disk thins outward; warps, flares, and substructure make a smooth decline incomplete.', zh: '恒星盘向外逐渐稀疏；翘曲、增厚与次结构使平滑下降只是近似。' } },
    halo: { radius: 20, angle: -2.18, z: 8, density: 0.04, label: { en: 'Stellar halo', zh: '恒星晕' }, note: { en: 'A sparse, extended stellar population surrounds the disk; this is not the much larger inferred dark-matter halo.', zh: '稀疏而延展的恒星群包围着盘；它并不是范围大得多的推断暗物质晕。' } }
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
  const skyLocalizerScene = setupCanvas('skyLocalizerCanvas');
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
  const galaxyStars = Array.from({ length: 1150 }, (_, index) => {
    const radius = 0.1 + Math.pow(galaxySeed(), 0.72) * 0.88;
    const arm = index % 4;
    return {
      radius,
      angle: arm * TAU / 4 - radius * 4.65 + (galaxySeed() - 0.5) * (0.18 + radius * 0.34),
      offset: (galaxySeed() - 0.5) * 0.12,
      age: galaxySeed(),
      arm
    };
  });
  const galaxyClouds = Array.from({ length: 150 }, (_, index) => {
    const radius = 0.16 + Math.pow(galaxySeed(), 0.75) * 0.78;
    return {
      radius,
      angle: index % 4 * TAU / 4 - radius * 4.65 + (galaxySeed() - 0.5) * 0.18,
      size: 0.8 + galaxySeed() * 2.4,
      brightness: 0.04 + galaxySeed() * 0.11
    };
  });
  const galaxyBarStars = Array.from({ length: 180 }, () => ({
    x: (galaxySeed() - 0.5) * 0.7,
    y: (galaxySeed() - 0.5) * (0.04 + galaxySeed() * 0.1),
    brightness: 0.22 + galaxySeed() * 0.62
  }));
  const galaxyEdgeStars = Array.from({ length: 420 }, () => ({
    x: (galaxySeed() - 0.5) * 2,
    y: (galaxySeed() - 0.5) * 2,
    height: (galaxySeed() - 0.5) * (galaxySeed() > 0.82 ? 0.34 : 0.11),
    brightness: 0.2 + galaxySeed() * 0.58
  }));
  const historyFragments = Array.from({ length: 18 }, (_, index) => ({
    angle: galaxySeed() * TAU,
    radius: 0.26 + galaxySeed() * 0.5,
    size: 4 + galaxySeed() * 10,
    phase: index / 18 * 1.4,
    gold: index % 3 === 0
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

  let addressTooltipTimer = 0;
  const addressLabelLayout = [];

  function spreadLabelYs(items, minimum, maximum, gap) {
    const sorted = [...items].sort((a, b) => a.y - b.y);
    const slotCount = Math.max(1, sorted.length - 1);
    const step = Math.min(gap, (maximum - minimum) / slotCount);
    const average = sorted.reduce((sum, item) => sum + item.y, 0) / Math.max(1, sorted.length);
    const start = clamp(average - step * (sorted.length - 1) / 2, minimum, maximum - step * (sorted.length - 1));
    sorted.forEach((item, index) => {
      item.labelY = start + index * step;
    });
    return sorted;
  }

  function balanceLabelSides(items, centreX) {
    const maximumPerSide = Math.ceil(items.length / 2);
    const rebalance = (crowdedSide, openSide) => {
      const crowded = items.filter(item => item.side === crowdedSide);
      if (crowded.length <= maximumPerSide) return;
      crowded
        .sort((a, b) => Math.abs(a.x - centreX) - Math.abs(b.x - centreX))
        .slice(0, crowded.length - maximumPerSide)
        .forEach(item => {
          item.side = openSide;
        });
    };
    rebalance('left', 'right');
    rebalance('right', 'left');
    return {
      left: items.filter(item => item.side === 'left'),
      right: items.filter(item => item.side === 'right')
    };
  }

  function hideAddressTooltip() {
    window.clearTimeout(addressTooltipTimer);
    const tooltip = $('addressTooltip');
    tooltip.hidden = true;
    document.querySelectorAll('.address-hotspot[aria-expanded="true"]').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function scheduleAddressTooltipHide(button) {
    window.clearTimeout(addressTooltipTimer);
    addressTooltipTimer = window.setTimeout(() => {
      if (document.activeElement === button) return;
      hideAddressTooltip();
    }, 120);
  }

  function showAddressTooltip(button, marker) {
    window.clearTimeout(addressTooltipTimer);
    document.querySelectorAll('.address-hotspot').forEach(item => {
      item.setAttribute('aria-expanded', String(item === button));
    });
    const tooltip = $('addressTooltip');
    tooltip.innerHTML = `<strong>${localized(marker.system.name)}</strong><span class="data-line">${fixed(marker.system.distance, 2)} ${t('light-years', '光年')}</span><span>${localized(marker.system.planets)}</span>`;
    tooltip.hidden = false;
    const width = addressScene.width;
    const height = addressScene.height;
    const tooltipWidth = Math.min(250, Math.max(180, width - 20));
    const targetX = marker.hotspotX;
    const targetY = marker.hotspotY;
    const left = clamp(targetX - tooltipWidth / 2, 10, width - tooltipWidth - 10);
    const placeBelow = targetY < 96;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${clamp(placeBelow ? targetY + 28 : targetY - 112, 10, height - 106)}px`;
  }

  function syncAddressHotspots(markers) {
    const host = $('addressHotspots');
    hideAddressTooltip();
    host.replaceChildren();
    for (const marker of markers) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'address-hotspot';
      button.style.left = `${marker.hotspotX}px`;
      button.style.top = `${marker.hotspotY}px`;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-describedby', 'addressTooltip');
      button.setAttribute(
        'aria-label',
        `${localized(marker.system.name)}, ${fixed(marker.system.distance, 2)} ${t('light-years', '光年')}. ${localized(marker.system.planets)}`
      );
      button.addEventListener('pointerenter', () => showAddressTooltip(button, marker));
      button.addEventListener('pointerleave', event => {
        if (event.pointerType === 'mouse') scheduleAddressTooltipHide(button);
      });
      button.addEventListener('focus', () => showAddressTooltip(button, marker));
      button.addEventListener('blur', () => scheduleAddressTooltipHide(button));
      button.addEventListener('click', () => showAddressTooltip(button, marker));
      host.append(button);
    }
  }

  function drawAddress() {
    $('addressSummary').textContent = {
      solar: t('Earth moves around the Sun inside a many-zone planetary system.', '地球围绕太阳运动，位于具有多重分区的行星系统中。'),
      local: t('The Sun moves among nearby stellar and planetary systems.', '太阳在邻近恒星与行星系统之间运动。'),
      galaxy: t('The Solar System orbits inside the Milky Way’s disk.', '太阳系在银河系盘内绕行。')
    }[state.addressScale];
    clear(addressScene);
    drawBackgroundStars(addressScene, 0.72);
    addressLabelLayout.length = 0;
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
      syncAddressHotspots([]);
    } else if (state.addressScale === 'local') {
      const scale = maxRadius / 15;
      for (const distance of [5, 10, 15]) {
        context.strokeStyle = distance === 15 ? 'rgba(0,212,255,0.24)' : 'rgba(238,242,255,0.1)';
        context.setLineDash(distance === 15 ? [5, 4] : [2, 5]);
        context.beginPath();
        context.ellipse(cx, cy, distance * scale, distance * scale * 0.72, 0, 0, TAU);
        context.stroke();
      }
      context.setLineDash([]);
      line(context, cx - maxRadius, cy, cx + maxRadius, cy, palette.line);
      line(context, cx, cy - maxRadius * 0.72, cx, cy + maxRadius * 0.72, palette.line);
      circle(context, cx, cy, 6, palette.gold);
      text(context, t('SUN', '太阳'), cx + 10, cy - 10, palette.gold, 10);
      const markers = nearbySystems.filter(item => item.distance <= 15).map(system => {
        const x = cx + system.x * scale;
        const y = cy + system.y * scale * 0.72;
        return { system, x, y, side: x < cx ? 'left' : 'right' };
      });
      const balanced = balanceLabelSides(markers, cx);
      const leftLabels = spreadLabelYs(balanced.left, 48, height - 56, 44);
      const rightLabels = spreadLabelYs(balanced.right, 48, height - 56, 44);
      for (const marker of [...leftLabels, ...rightLabels]) {
        const { system, x, y } = marker;
        const radius = clamp(4 + Math.abs(system.z) * 0.32, 4, 8);
        circle(context, x, y, radius, system.color, system.id === 'proxima' ? palette.cyan : '', 2);
        const labelX = marker.side === 'left' ? 42 : width - 42;
        const lineEnd = marker.side === 'left' ? Math.min(cx - maxRadius - 8, x - 10) : Math.max(cx + maxRadius + 8, x + 10);
        line(context, x, y, lineEnd, marker.labelY, 'rgba(238,242,255,0.25)', 1);
        context.fillStyle = 'rgba(4,7,19,0.88)';
        const labelWidth = Math.min(width * 0.31, 144);
        context.fillRect(marker.side === 'left' ? 6 : width - labelWidth - 6, marker.labelY - 10, labelWidth, 20);
        text(
          context,
          `${zh() ? localized(system.name) : addressShortNames[system.id]} · ${fixed(system.distance, 1)} ly`,
          labelX,
          marker.labelY,
          system.id === 'proxima' ? palette.cyan : palette.paper,
          width < 520 ? 8 : 9,
          marker.side
        );
        marker.hotspotX = marker.side === 'left' ? 28 : width - 28;
        marker.hotspotY = marker.labelY;
        addressLabelLayout.push({ id: system.id, side: marker.side, y: marker.labelY });
      }
      const barY = height - 24;
      const barStart = cx - 5 * scale;
      line(context, barStart, barY, cx, barY, palette.cyan, 2);
      line(context, barStart, barY - 4, barStart, barY + 4, palette.cyan, 1);
      line(context, cx, barY - 4, cx, barY + 4, palette.cyan, 1);
      text(context, t('5 ly distance scale', '5 光年距离标尺'), (barStart + cx) / 2, barY - 11, palette.cyan, 9, 'center');
      text(context, t('Projected J2000 positions · rings at 5, 10, 15 ly', 'J2000 投影位置 · 圆环为 5、10、15 光年'), 14, 22, palette.muted, 9);
      syncAddressHotspots(markers);
    } else {
      drawGalaxyFace(context, cx, cy, maxRadius, 0, 'stars', true);
      text(context, t('SUN / ~26,700 ly FROM CENTRE', '太阳 / 距中心约 26,700 光年'), width - 18, 28, palette.cyan, 10, 'right');
      text(context, t('Schematic reconstruction · not an exterior photograph', '示意重建 · 并非外部照片'), 18, height - 22, palette.muted, 10);
      syncAddressHotspots([]);
    }

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
      { start: 2000, end: 100000, color: 'rgba(126,232,197,0.08)', labelY: 54, label: { en: 'INFERRED OORT CLOUD', zh: '推断的奥尔特云' } }
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
      const tidalStart = solarX(100000, config, left, right);
      const tidalEnd = solarX(500000, config, left, right);
      line(context, tidalStart, 88, tidalEnd, 88, palette.pink, 3, [7, 5]);
      text(context, t('TIDAL COMPETITION / NO UNIQUE EDGE', '潮汐竞争 / 无唯一边界'), (tidalStart + tidalEnd) / 2, 74, palette.pink, 9, 'center');
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
    if (distance < 2000) return {
      title: t('Interstellar plasma, still Solar gravity', '星际等离子体中，仍受太阳引力'),
      body: t('Beyond the heliopause, the surrounding plasma is interstellar; that does not mean the Sun’s gravity has ended.', '越过日球层顶后，周围等离子体属于星际介质；这并不意味着太阳引力已经结束。')
    };
    if (distance < 100000) return {
      title: t('Inferred Oort Cloud regime', '推断的奥尔特云范围'),
      body: t('Long-period comet orbits motivate a distant reservoir. NASA gives a broad 2,000-100,000 AU order-of-magnitude span, not a detected shell.', '长周期彗星轨道提示存在遥远储库。NASA 给出约 2,000-100,000 天文单位的宽泛数量级范围，并非已探测的壳层。')
    };
    if (distance < 500000) return {
      title: t('Far gravitational and tidal reach', '遥远的引力与潮汐范围'),
      body: t('Beyond the practical outer Oort-cloud scale, Galactic tides and stellar passages increasingly reorganize weakly bound orbits. Any boundary is anisotropic and model-dependent.', '越过实用的奥尔特云外缘尺度后，银河潮汐与恒星掠过会越来越强地重组弱束缚轨道。任何边界都具有方向性并依赖模型。')
    };
    return {
      title: t('Beyond the nominal Solar tidal region', '超出名义太阳潮汐区域'),
      body: t('The Sun still exerts gravity here, but it is not the dominant organizer of long-lived bound orbits.', '太阳在这里仍施加引力，但已不是长期束缚轨道的主导组织者。')
    };
  }

  function drawReach() {
    clear(reachScene);
    const { context, width, height } = reachScene;
    const left = width < 520 ? 64 : 92;
    const right = width - 28;
    const minimumLog = Math.log10(0.3);
    const maximumLog = 6;
    const xFor = distance => {
      const value = Math.log10(clamp(distance, 0.3, 1000000));
      return left + (value - minimumLog) / (maximumLog - minimumLog) * (right - left);
    };
    const landscapeTop = 48;
    const landscapeBottom = Math.min(194, height * 0.4);
    const railTop = landscapeBottom + 42;
    const railBottom = height - 46;
    const rows = [
      { label: { en: 'PLANET ORBITS', zh: '行星轨道' }, start: 0.3, end: 50, color: palette.gold, note: { en: 'orbits + asteroid / Kuiper populations', zh: '行星轨道与小行星 / 柯伊伯天体群' }, shortNote: { en: 'asteroids + Kuiper', zh: '小行星 + 柯伊伯' } },
      { label: { en: 'SOLAR WIND', zh: '太阳风' }, start: 0.3, end: 120, color: palette.cyan, note: { en: 'shock ~84-94 AU; heliopause ~119-122 AU', zh: '终止激波约 84-94 AU；日球层顶约 119-122 AU' }, shortNote: { en: 'shock 84-94 · pause 119-122 AU', zh: '激波 84-94 · 层顶 119-122 AU' } },
      { label: { en: 'OORT MODEL', zh: '奥尔特模型' }, start: 2000, end: 100000, color: palette.green, note: { en: 'inferred order-of-magnitude reservoir', zh: '推断的数量级彗星储库' }, shortNote: { en: 'inferred reservoir', zh: '推断储库' } },
      { label: { en: 'GRAVITY + TIDES', zh: '引力与潮汐' }, start: 0.3, end: 1000000, color: palette.pink, note: { en: 'continuous force; no agreed hard edge', zh: '力连续存在；没有公认硬边界' }, shortNote: { en: 'continuous; no hard edge', zh: '连续；无硬边界' }, dashed: true }
    ];
    rows.forEach((row, index) => {
      row.y = railTop + index / 3 * Math.max(96, railBottom - railTop);
    });

    context.fillStyle = 'rgba(0,212,255,0.035)';
    context.fillRect(xFor(0.3), landscapeTop, xFor(84) - xFor(0.3), landscapeBottom - landscapeTop);
    context.fillStyle = 'rgba(124,92,255,0.1)';
    context.fillRect(xFor(84), landscapeTop, xFor(120) - xFor(84), landscapeBottom - landscapeTop);
    context.fillStyle = 'rgba(126,232,197,0.07)';
    context.fillRect(xFor(2000), landscapeTop, xFor(100000) - xFor(2000), landscapeBottom - landscapeTop);
    context.fillStyle = 'rgba(255,107,157,0.045)';
    context.fillRect(xFor(100000), landscapeTop, xFor(500000) - xFor(100000), landscapeBottom - landscapeTop);
    context.fillStyle = 'rgba(255,209,102,0.16)';
    context.fillRect(xFor(2.1), landscapeTop + 68, Math.max(2, xFor(3.3) - xFor(2.1)), landscapeBottom - landscapeTop - 74);

    for (let exponent = 0; exponent <= maximumLog; exponent++) {
      const x = xFor(10 ** exponent);
      line(context, x, 34, x, railBottom + 18, 'rgba(238,242,255,0.09)');
      text(context, exponent === 0 ? '1 AU' : `10^${exponent} AU`, x, 22, palette.muted, width < 520 ? 8 : 9, 'center');
    }

    const planets = [
      [0.387, 'Me', '水'], [0.723, 'V', '金'], [1, 'E', '地'], [1.524, 'Ma', '火'],
      [5.203, 'J', '木'], [9.537, 'S', '土'], [19.19, 'U', '天'], [30.07, 'N', '海']
    ];
    const orbitY = landscapeBottom - 22;
    circle(context, xFor(0.3), orbitY, 13, palette.gold);
    text(context, t('SUN', '太阳'), xFor(0.3), landscapeTop + 14, palette.gold, 9, 'center');
    for (const [distance, en, chinese] of planets) {
      const x = xFor(distance);
      line(context, x, landscapeTop + 28, x, orbitY, 'rgba(238,242,255,0.2)', 1);
      circle(context, x, orbitY, distance === 1 ? 5 : 3, distance === 1 ? palette.cyan : palette.paper);
      text(context, zh() ? chinese : en, x, landscapeTop + 38 + (distance < 2 ? (distance * 17) % 18 : 0), distance === 1 ? palette.cyan : palette.muted, 8, 'center');
    }
    text(context, t('ASTEROID BELT', '小行星带'), (xFor(2.1) + xFor(3.3)) / 2, landscapeBottom - 7, palette.gold, 8, 'center');
    line(context, xFor(84), landscapeTop, xFor(84), landscapeBottom, palette.violet, 1, [4, 3]);
    line(context, xFor(120), landscapeTop, xFor(120), landscapeBottom, palette.cyan, 2, [4, 3]);
    text(context, t('HELIOSHEATH', '日鞘'), (xFor(84) + xFor(120)) / 2, landscapeTop + 15, palette.violet, 8, 'center');
    text(context, t('HELIOPAUSE', '日球层顶'), xFor(120) + 4, landscapeBottom - 8, palette.cyan, 8, 'left');
    text(context, t('INFERRED OORT CLOUD', '推断的奥尔特云'), (xFor(2000) + xFor(100000)) / 2, landscapeTop + 15, palette.green, 8, 'center');
    text(context, t('FAR TIDAL REACH?', '遥远潮汐范围？'), (xFor(100000) + xFor(500000)) / 2, landscapeBottom - 8, palette.pink, 8, 'center');

    for (const row of rows) {
      text(context, localized(row.label), left - 10, row.y, row.color, 9, 'right');
      line(context, xFor(row.start), row.y, xFor(row.end), row.y, row.color, row.dashed ? 3 : 7, row.dashed ? [7, 5] : []);
      circle(context, xFor(row.start), row.y, 4, row.color);
      circle(context, xFor(row.end), row.y, 4, row.color);
      const noteX = (xFor(row.start) + xFor(row.end)) / 2;
      const note = width < 560 ? localized(row.shortNote) : localized(row.note);
      text(context, note, noteX, row.y - 12, palette.muted, width < 520 ? 8 : 9, 'center');
    }

    const markerX = xFor(state.reachAU);
    line(context, markerX, 34, markerX, railBottom + 18, palette.paper, 2, [4, 4]);
    circle(context, markerX, landscapeTop - 4, 7, palette.paper, palette.cyan, 2);
    context.fillStyle = palette.ink;
    context.fillRect(clamp(markerX - 52, 4, width - 108), landscapeTop + 4, 104, 22);
    text(context, formatAU(state.reachAU), clamp(markerX, 56, width - 56), landscapeTop + 15, palette.paper, 10, 'center');

    const classification = reachClassification(state.reachAU);
    $('reachSummary').innerHTML = `<strong>${classification.title}</strong><span class="data-line">${formatAU(state.reachAU)}</span><p>${classification.body}</p>`;
    $('windReadout').textContent = state.reachAU < 84 ? t('Supersonic outward plasma', '超声速向外等离子体') : state.reachAU < 130 ? t('Slowed and diverted', '减速并偏转') : t('Interstellar plasma region', '星际等离子体区域');
    $('heliopauseReadout').textContent = t('Observed crossings ~119-122 AU', '观测穿越约 119-122 天文单位');
    $('oortReadout').textContent = t('Inferred ~2k-100k AU', '推断约 2 千-10 万天文单位');
    $('gravityReadout').textContent = t('No hard cutoff; tides grow important', '无硬截止；潮汐影响逐渐增强');
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
    const jupiterRadiusKm = 71492;
    const jupiterMu = 126686534;
    const periapsisKm = state.closestApproach * jupiterRadiusKm;
    const eccentricity = 1 + periapsisKm * relative ** 2 / jupiterMu;
    const turn = 2 * Math.asin(1 / eccentricity);
    const projectedTurn = turn * state.encounterSide;
    const incomingRelative = { x: 0, y: -relative };
    const outgoingRelative = {
      x: relative * Math.cos(-Math.PI / 2 + projectedTurn),
      y: relative * Math.sin(-Math.PI / 2 + projectedTurn)
    };
    const incomingVector = {
      x: state.planetSpeed + incomingRelative.x,
      y: incomingRelative.y
    };
    const outgoingVector = {
      x: state.planetSpeed + outgoingRelative.x,
      y: outgoingRelative.y
    };
    const incoming = Math.hypot(incomingVector.x, incomingVector.y);
    const outgoing = Math.hypot(outgoingVector.x, outgoingVector.y);
    return {
      relative,
      periapsisKm,
      eccentricity,
      turn,
      turnAngle: turn * 180 / Math.PI,
      projectedTurn,
      incomingRelative,
      outgoingRelative,
      incomingVector,
      outgoingVector,
      incoming,
      outgoing,
      delta: outgoing - incoming
    };
  }

  function normalizedVector(vector) {
    const magnitude = Math.max(0.001, Math.hypot(vector.x, vector.y));
    return { x: vector.x / magnitude, y: vector.y / magnitude };
  }

  function assistPathVector(vector) {
    return normalizedVector({ x: -vector.y, y: -vector.x });
  }

  function drawAssistVectors() {
    clear(assistScene);
    drawBackgroundStars(assistScene, 0.22);
    const { context, width, height } = assistScene;
    const values = assistValues();
    const cx = width * 0.52;
    const cy = height * 0.53;
    const side = state.encounterSide < 0 ? -1 : 1;
    const span = Math.min(width * 0.39, 290);
    const closestPixels = mix(38, 108, (state.closestApproach - 1.5) / 18.5);
    const periapsis = { x: cx, y: cy + side * closestPixels };
    const incomingDirection = assistPathVector(values.incomingRelative);
    const outgoingDirection = assistPathVector(values.outgoingRelative);
    const periapsisDirection = { x: 1, y: 0 };
    const start = {
      x: periapsis.x - incomingDirection.x * span,
      y: periapsis.y - incomingDirection.y * span
    };
    const end = {
      x: periapsis.x + outgoingDirection.x * span,
      y: periapsis.y + outgoingDirection.y * span
    };
    const cubicPoint = (from, control1, control2, to, amount) => {
      const inverse = 1 - amount;
      return {
        x: inverse ** 3 * from.x + 3 * inverse ** 2 * amount * control1.x + 3 * inverse * amount ** 2 * control2.x + amount ** 3 * to.x,
        y: inverse ** 3 * from.y + 3 * inverse ** 2 * amount * control1.y + 3 * inverse * amount ** 2 * control2.y + amount ** 3 * to.y
      };
    };
    const pathPoint = amount => {
      if (amount <= 0.55) {
        return cubicPoint(
          start,
          { x: start.x + incomingDirection.x * span * 0.55, y: start.y + incomingDirection.y * span * 0.55 },
          { x: periapsis.x - periapsisDirection.x * span * 0.2, y: periapsis.y },
          periapsis,
          amount / 0.55
        );
      }
      return cubicPoint(
        periapsis,
        { x: periapsis.x + periapsisDirection.x * span * 0.2, y: periapsis.y },
        { x: end.x - outgoingDirection.x * span * 0.55, y: end.y - outgoingDirection.y * span * 0.55 },
        end,
        (amount - 0.55) / 0.45
      );
    };

    arrow(context, cx - 82, cy - 142, cx + 72, cy - 142, palette.gold, 3, t('planet orbital velocity', '行星公转速度'));
    circle(context, cx, cy, 30, '#5d79ff', palette.paper, 1.5);
    text(context, t('MOVING PLANET', '运动中的行星'), cx, cy + 48, palette.paper, 10, 'center');
    context.strokeStyle = palette.cyan;
    context.lineWidth = 2;
    context.beginPath();
    for (let index = 0; index <= 100; index++) {
      const point = pathPoint(index / 100);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
    text(context, t('v infinity, in', 'v∞，入射'), start.x + 8, start.y - 12, palette.cyan, 8, 'left');
    text(context, t('v infinity, out', 'v∞，出射'), end.x - 8, end.y - 12, palette.cyan, 8, 'right');

    const progress = state.assistProgress;
    const craft = pathPoint(progress);
    const before = pathPoint(clamp(progress - 0.012, 0, 1));
    const after = pathPoint(clamp(progress + 0.012, 0, 1));
    circle(context, craft.x, craft.y, 7, palette.paper, palette.cyan, 2);
    const tangentX = after.x - before.x;
    const tangentY = after.y - before.y;
    const tangentLength = Math.max(0.001, Math.hypot(tangentX, tangentY));
    const velocityEnd = {
      x: craft.x + tangentX / tangentLength * 78,
      y: craft.y + tangentY / tangentLength * 78
    };
    arrow(context, craft.x, craft.y, velocityEnd.x, velocityEnd.y, palette.green, 2, '');
    const forceX = cx - craft.x;
    const forceY = cy - craft.y;
    const forceLength = Math.max(1, Math.hypot(forceX, forceY));
    const accelerationLength = clamp(2100 / forceLength, 25, 78) * (0.94 + Math.sin(state.assistProgress * TAU * 3) * 0.06);
    arrow(
      context,
      craft.x,
      craft.y,
      craft.x + forceX / forceLength * accelerationLength,
      craft.y + forceY / forceLength * accelerationLength,
      palette.pink,
      2,
      ''
    );
    text(context, t('v infinity · planet frame', 'v∞ · 行星系'), velocityEnd.x + 5, velocityEnd.y - 10, palette.green, 9, 'left');
    text(context, t('a points to planet', 'a 指向行星'), craft.x, craft.y + 22, palette.pink, 9, 'center');

    const turnArcRadius = closestPixels + 28;
    context.strokeStyle = palette.violet;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cx, cy, turnArcRadius, -2.5, -2.5 + side * values.turn, side < 0);
    context.stroke();
    text(context, `${fixed(values.turnAngle, 0)}°`, cx + side * 18, cy - turnArcRadius - 14, palette.violet, 11, 'center');

    const drawResultVector = (originX, originY, vector, label, color) => {
      const magnitude = Math.max(0.001, Math.hypot(vector.x, vector.y));
      const length = Math.min(84, width * 0.15);
      arrow(
        context,
        originX,
        originY,
        originX + vector.x / magnitude * length,
        originY - vector.y / magnitude * length,
        color,
        2,
        label
      );
    };
    drawResultVector(34, 78, values.incomingVector, t('V Sun, before', '飞越前日心 V'), palette.cyan);
    drawResultVector(width - Math.min(150, width * 0.24), 78, values.outgoingVector, t('V Sun, after', '飞越后日心 V'), palette.green);
    text(context, t('The path bends inward before closest approach because acceleration points toward the planet.', '最近接之前轨迹先向内弯曲，因为加速度始终指向行星。'), width / 2, height - 24, palette.muted, width < 560 ? 8 : 9, 'center');

    $('assistIncoming').textContent = `${fixed(values.incoming, 1)} km/s`;
    $('assistOutgoing').textContent = `${fixed(values.outgoing, 1)} km/s`;
    $('assistRelative').textContent = t(`${fixed(values.relative, 1)} km/s both ways`, `两端均约 ${fixed(values.relative, 1)} km/s`);
    $('assistDelta').textContent = `${values.delta >= 0 ? '+' : ''}${fixed(values.delta, 1)} km/s`;
    $('assistCanvasSubtitle').textContent = t('Animated acceleration turns equal-magnitude planet-frame velocities; vector addition changes the Sun-frame result.', '动画加速度转动大小相等的行星系速度；矢量相加改变日心系结果。');
  }

  function voyagerOrbitRadius(distance, maximum) {
    return 28 + Math.sqrt(distance / 30.07) * (maximum - 28);
  }

  function voyagerAnchorPoints(width, height) {
    const cx = width * 0.48;
    const cy = height * 0.46;
    const maximum = Math.min(width * 0.43, height * 0.39);
    return voyagerEncounters.map(encounter => {
      const radius = voyagerOrbitRadius(encounter.au, maximum);
      return {
        x: cx + Math.cos(encounter.anchorAngle) * radius,
        y: cy + Math.sin(encounter.anchorAngle) * radius * 0.68
      };
    });
  }

  function catmullRomPoint(point0, point1, point2, point3, amount) {
    const squared = amount * amount;
    const cubed = squared * amount;
    return {
      x: 0.5 * (
        2 * point1.x +
        (-point0.x + point2.x) * amount +
        (2 * point0.x - 5 * point1.x + 4 * point2.x - point3.x) * squared +
        (-point0.x + 3 * point1.x - 3 * point2.x + point3.x) * cubed
      ),
      y: 0.5 * (
        2 * point1.y +
        (-point0.y + point2.y) * amount +
        (2 * point0.y - 5 * point1.y + 4 * point2.y - point3.y) * squared +
        (-point0.y + 3 * point1.y - 3 * point2.y + point3.y) * cubed
      )
    };
  }

  function voyagerPosition(year, width = assistScene.width, height = assistScene.height) {
    const anchors = voyagerAnchorPoints(width, height);
    if (year <= voyagerEncounters[0].dateValue) return anchors[0];
    const finalIndex = voyagerEncounters.length - 1;
    if (year >= voyagerEncounters[finalIndex].dateValue) return anchors[finalIndex];
    const nextIndex = voyagerEncounters.findIndex(encounter => encounter.dateValue > year);
    const previousIndex = nextIndex - 1;
    const previous = voyagerEncounters[previousIndex];
    const next = voyagerEncounters[nextIndex];
    const amount = clamp((year - previous.dateValue) / (next.dateValue - previous.dateValue), 0, 1);
    const point1 = anchors[previousIndex];
    const point2 = anchors[nextIndex];
    const point0 = anchors[previousIndex - 1] || {
      x: point1.x + point1.x - point2.x,
      y: point1.y + point1.y - point2.y
    };
    const point3 = anchors[nextIndex + 1] || {
      x: point2.x + point2.x - point1.x,
      y: point2.y + point2.y - point1.y
    };
    return catmullRomPoint(point0, point1, point2, point3, smoothstep(0, 1, amount));
  }

  function drawVoyagerAssist() {
    clear(assistScene);
    drawBackgroundStars(assistScene, 0.36);
    const { context, width, height } = assistScene;
    const cx = width * 0.48;
    const cy = height * 0.46;
    const maximum = Math.min(width * 0.43, height * 0.39);
    const anchors = voyagerAnchorPoints(width, height);

    voyagerEncounters.forEach((encounter, encounterIndex) => {
      const radius = voyagerOrbitRadius(encounter.au, maximum);
      context.strokeStyle = 'rgba(238,242,255,0.13)';
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(cx, cy, radius, radius * 0.68, 0, 0, TAU);
      context.stroke();
      const planetAngle = encounter.anchorAngle + (state.voyagerYear - encounter.dateValue) / encounter.period * TAU;
      const planet = {
        x: cx + Math.cos(planetAngle) * radius,
        y: cy + Math.sin(planetAngle) * radius * 0.68
      };
      const nearEncounter = Math.abs(state.voyagerYear - encounter.dateValue) < 0.08;
      circle(context, planet.x, planet.y, nearEncounter ? 9 : 6, encounter.color, nearEncounter ? palette.paper : '', 1.5);
      text(
        context,
        localized(encounter.planet),
        planet.x + (planet.x > cx ? 9 : -9),
        planet.y + [-18, -24, 18, 20][encounterIndex],
        nearEncounter ? palette.cyan : palette.paper,
        9,
        planet.x > cx ? 'left' : 'right'
      );
    });
    circle(context, cx, cy, 10, palette.gold);
    text(context, t('SUN', '太阳'), cx, cy + 20, palette.gold, 9, 'center');

    const firstYear = voyagerEncounters[0].dateValue;
    const lastYear = voyagerEncounters[voyagerEncounters.length - 1].dateValue;
    context.strokeStyle = 'rgba(0,212,255,0.28)';
    context.lineWidth = 2;
    context.beginPath();
    for (let index = 0; index <= 180; index++) {
      const year = mix(firstYear, lastYear, index / 180);
      const point = voyagerPosition(year, width, height);
      if (!index) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();

    context.strokeStyle = palette.cyan;
    context.lineWidth = 3;
    context.beginPath();
    const completedAmount = clamp((state.voyagerYear - firstYear) / (lastYear - firstYear), 0, 1);
    const completedSteps = Math.max(1, Math.round(180 * completedAmount));
    for (let index = 0; index <= completedSteps; index++) {
      const year = mix(firstYear, state.voyagerYear, index / completedSteps);
      const point = voyagerPosition(year, width, height);
      if (!index) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();

    voyagerEncounters.forEach((encounter, index) => {
      const anchor = anchors[index];
      circle(context, anchor.x, anchor.y, 4, encounter.color, palette.paper, 1);
      line(context, anchor.x, anchor.y, anchor.x, anchor.y + (index % 2 ? -30 : 30), encounter.color, 1, [3, 3]);
      text(
        context,
        `${localized(encounter.planet)} · ${Math.floor(encounter.dateValue)}`,
        anchor.x,
        anchor.y + (index % 2 ? -41 : 41),
        encounter.color,
        width < 560 ? 8 : 9,
        'center'
      );
    });

    const probe = voyagerPosition(state.voyagerYear, width, height);
    circle(context, probe.x, probe.y, 7, palette.paper, palette.cyan, 2);
    circle(context, probe.x, probe.y, 12, 'rgba(0,212,255,0.08)', palette.cyan, 1);
    text(context, t('VOYAGER 2', '旅行者 2 号'), probe.x + 17, probe.y - 20, palette.cyan, 9, 'left');
    const neptune = anchors[anchors.length - 1];
    arrow(context, neptune.x, neptune.y, neptune.x + 54, neptune.y + 46, palette.green, 2, t('south of ecliptic', '飞向黄道面南侧'));

    const timelineLeft = 34;
    const timelineRight = width - 34;
    const timelineY = height - 28;
    line(context, timelineLeft, timelineY, timelineRight, timelineY, palette.muted, 1);
    for (const encounter of voyagerEncounters) {
      const amount = (encounter.dateValue - firstYear) / (lastYear - firstYear);
      const x = mix(timelineLeft, timelineRight, amount);
      line(context, x, timelineY - 6, x, timelineY + 6, encounter.color, 2);
      if (width >= 560) text(context, encounter.date.en, x, timelineY - 14, palette.muted, 8, 'center');
    }
    const timelineX = mix(timelineLeft, timelineRight, completedAmount);
    circle(context, timelineX, timelineY, 5, palette.paper, palette.cyan, 1);
    text(context, t('DATED ENCOUNTERS · INTERPOLATED TRANSFERS', '有日期的交会 · 插值的转移段'), width / 2, 22, palette.muted, 9, 'center');

    const closest = [...voyagerEncounters].sort(
      (a, b) => Math.abs(a.dateValue - state.voyagerYear) - Math.abs(b.dateValue - state.voyagerYear)
    )[0];
    const atEncounter = Math.abs(closest.dateValue - state.voyagerYear) <= 0.005;
    const next = voyagerEncounters.find(encounter => encounter.dateValue > state.voyagerYear);
    const previous = [...voyagerEncounters].reverse().find(encounter => encounter.dateValue <= state.voyagerYear) || voyagerEncounters[0];
    const output = atEncounter
      ? localized(closest.date)
      : t(`~${fixed(state.voyagerYear, 1)} teaching interpolation`, `约 ${fixed(state.voyagerYear, 1)} 年教学插值`);
    $('voyagerEncounterOutput').textContent = output;
    $('voyagerAssistSummary').innerHTML = atEncounter
      ? `<strong>${localized(closest.planet)} · ${localized(closest.date)}</strong><span class="data-line">${localized(closest.next)}</span><p>${localized(closest.purpose)}</p>`
      : `<strong>${localized(previous.planet)} → ${localized(next?.planet || closest.planet)}</strong><span class="data-line">${output}</span><p>${t('The curve joins dated encounters continuously; it is not a position prediction between them.', '曲线连续连接有日期的交会点；它不预测其间的实际位置。')}</p>`;
    $('assistIncoming').textContent = output;
    $('assistOutgoing').textContent = next ? localized(next.planet) : localized(closest.next);
    $('assistRelative').textContent = t('Conserved per ideal planet-frame flyby', '每次理想行星系飞越中守恒');
    $('assistDelta').textContent = t('Changed at every Sun-frame encounter', '每次交会都改变日心系矢量');
    $('assistCanvasSubtitle').textContent = t('Planet angular rates use approximate orbital periods; encounter anchors are arranged schematically for legibility.', '行星角速度采用近似公转周期；交会锚点为可读性作了示意安排。');
  }

  function drawAssist() {
    const vectorMode = state.assistMode === 'vectors';
    const labels = vectorMode
      ? [
          t('Incoming Sun-frame speed', '入射日心速度'),
          t('Outgoing Sun-frame speed', '出射日心速度'),
          t('Planet-frame far speed', '行星系远场速度'),
          t('Sun-frame change', '日心速度变化')
        ]
      : [
          t('Timeline position', '时间线位置'),
          t('Next target', '下一目标'),
          t('Planet-frame rule', '行星系规则'),
          t('Sun-frame result', '日心系结果')
        ];
    ['assistIncomingLabel', 'assistOutgoingLabel', 'assistRelativeLabel', 'assistDeltaLabel'].forEach((id, index) => {
      $(id).textContent = labels[index];
    });
    $('assistCanvasTitle').textContent = vectorMode
      ? t('Watch force bend the path', '观察引力如何弯折路径')
      : t('One uninterrupted four-planet route', '一条不间断的四行星路线');
    $('assistRepresentationLabel').textContent = vectorMode
      ? t('Vectors + dynamics', '矢量与动力学')
      : t('Dated route model', '带日期的路线模型');
    $('assistReset').textContent = vectorMode
      ? t('Reset geometry', '重置几何')
      : t('Reset timeline', '重置时间线');
    if (vectorMode) drawAssistVectors();
    else drawVoyagerAssist();
    const values = assistValues();
    $('planetSpeedOutput').textContent = `${fixed(state.planetSpeed, 1)} km/s`;
    $('closestApproachOutput').textContent = t(`${fixed(state.closestApproach, 1)} Jupiter radii`, `${fixed(state.closestApproach, 1)} 个木星半径`);
    $('turnAngleOutput').textContent = t(`${fixed(values.turnAngle, 0)} degrees`, `${fixed(values.turnAngle, 0)} 度`);
    $('encounterSideOutput').textContent = state.encounterSide > 0.15
      ? t('Behind / trailing side · gain', '后方 / 拖后侧 · 增速')
      : state.encounterSide < -0.15
        ? t('Ahead / leading side · loss', '前方 / 超前侧 · 减速')
        : t('Cross-track projection · little speed change', '横向投影 · 速度变化较小');
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

    const visibleMarkers = nearbySystems
      .filter(system => system.distance <= state.neighborDepth)
      .map(system => ({
        system,
        x: cx + system.x * scale,
        y: cy + system.y * scale,
        side: cx + system.x * scale < cx ? 'left' : 'right'
      }));
    const labelMarkers = new Map();
    if (state.neighborDepth <= 18) {
      const balanced = balanceLabelSides(visibleMarkers, cx);
      const labels = [
        ...spreadLabelYs(balanced.left, 46, height - 48, 40),
        ...spreadLabelYs(balanced.right, 46, height - 48, 40)
      ];
      labels.forEach(marker => labelMarkers.set(marker.system.id, marker));
    }

    for (const marker of visibleMarkers) {
      const { system, x, y } = marker;
      const selected = system.id === state.neighbor;
      const zRadius = 4 + clamp(Math.abs(system.z) / state.neighborDepth * 12, 0, 8);
      circle(context, x, y, selected ? zRadius + 3 : zRadius, system.color, selected ? palette.cyan : '', 2);
      const labelMarker = labelMarkers.get(system.id);
      if (labelMarker) {
        const labelX = labelMarker.side === 'left' ? 16 : width - 16;
        const leaderX = labelMarker.side === 'left' ? Math.min(cx - radius - 8, x - 10) : Math.max(cx + radius + 8, x + 10);
        line(context, x, y, leaderX, labelMarker.labelY, selected ? palette.cyan : 'rgba(238,242,255,0.24)', 1);
        context.fillStyle = 'rgba(4,7,19,0.88)';
        const labelWidth = Math.min(width * 0.3, 146);
        context.fillRect(labelMarker.side === 'left' ? 7 : width - labelWidth - 7, labelMarker.labelY - 10, labelWidth, 20);
        text(context, localized(system.name), labelX, labelMarker.labelY, selected ? palette.cyan : palette.paper, selected ? 10 : 9, labelMarker.side);
      } else if (selected) {
        text(context, localized(system.name), x + (x > cx ? 9 : -9), y - 12, palette.cyan, 10, x > cx ? 'left' : 'right');
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

  function traceSpiralArm(context, radius, arm, angle, flatten, radialShift = 0) {
    context.beginPath();
    for (let step = 0; step <= 140; step++) {
      const amount = step / 140;
      const r = radius * (0.13 + amount * 0.84 + radialShift);
      const theta = arm * TAU / 4 - amount * 4.65 + angle;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r * flatten;
      if (!step) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
  }

  function drawGalaxyFace(context, cx, cy, radius, angle, layer, compact = false, showSun = true) {
    const flatten = compact ? 0.82 : 0.9;
    const patternAngle = angle * 0.16;
    if (layer === 'matter') {
      const halo = context.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 1.2);
      halo.addColorStop(0, 'rgba(124,92,255,0.26)');
      halo.addColorStop(0.5, 'rgba(124,92,255,0.12)');
      halo.addColorStop(1, 'rgba(124,92,255,0.015)');
      circle(context, cx, cy, radius * 1.18, halo);
    }

    const disk = context.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);
    disk.addColorStop(0, 'rgba(255,209,102,0.34)');
    disk.addColorStop(0.18, 'rgba(238,242,255,0.13)');
    disk.addColorStop(0.72, 'rgba(0,212,255,0.055)');
    disk.addColorStop(1, 'rgba(0,212,255,0)');
    context.save();
    context.translate(cx, cy);
    context.scale(1, flatten);
    circle(context, 0, 0, radius, disk);
    context.restore();

    context.save();
    context.translate(cx, cy);
    for (let arm = 0; arm < 4; arm++) {
      context.strokeStyle = arm % 2 ? 'rgba(0,212,255,0.04)' : 'rgba(238,242,255,0.045)';
      context.lineWidth = compact ? 6 : 11;
      traceSpiralArm(context, radius, arm, patternAngle, flatten);
      context.stroke();
      context.strokeStyle = arm % 2 ? 'rgba(0,212,255,0.14)' : 'rgba(238,242,255,0.14)';
      context.lineWidth = compact ? 2 : 3.5;
      traceSpiralArm(context, radius, arm, patternAngle, flatten);
      context.stroke();
      context.strokeStyle = arm % 2 ? 'rgba(238,242,255,0.12)' : 'rgba(255,209,102,0.1)';
      context.lineWidth = compact ? 1 : 1.4;
      traceSpiralArm(context, radius, arm, patternAngle + 0.045, flatten, 0.018);
      context.stroke();
      context.strokeStyle = 'rgba(3,5,13,0.72)';
      context.lineWidth = compact ? 1.2 : 2.8;
      traceSpiralArm(context, radius, arm, patternAngle - 0.055, flatten, -0.018);
      context.stroke();
    }

    for (const cloud of galaxyClouds) {
      const theta = cloud.angle + patternAngle;
      const r = cloud.radius * radius;
      circle(
        context,
        Math.cos(theta) * r,
        Math.sin(theta) * r * flatten,
        compact ? cloud.size * 0.5 : cloud.size,
        `rgba(0,212,255,${cloud.brightness})`
      );
    }

    context.save();
    context.rotate(patternAngle);
    const barGradient = context.createLinearGradient(-radius * 0.38, 0, radius * 0.38, 0);
    barGradient.addColorStop(0, 'rgba(255,209,102,0.06)');
    barGradient.addColorStop(0.5, 'rgba(255,209,102,0.46)');
    barGradient.addColorStop(1, 'rgba(255,209,102,0.06)');
    context.fillStyle = barGradient;
    context.beginPath();
    context.ellipse(0, 0, radius * 0.38, radius * 0.085, 0, 0, TAU);
    context.fill();
    line(context, -radius * 0.32, -radius * 0.038, radius * 0.32, -radius * 0.038, 'rgba(3,5,13,0.64)', compact ? 1 : 3);
    line(context, -radius * 0.32, radius * 0.038, radius * 0.32, radius * 0.038, 'rgba(3,5,13,0.64)', compact ? 1 : 3);
    const barCount = compact ? 70 : galaxyBarStars.length;
    for (let index = 0; index < barCount; index++) {
      const star = galaxyBarStars[index];
      circle(
        context,
        star.x * radius,
        star.y * radius,
        compact ? 0.5 : star.brightness > 0.72 ? 1.15 : 0.65,
        `rgba(255,232,178,${star.brightness})`
      );
    }
    context.restore();
    context.restore();

    const starCount = compact ? 190 : galaxyStars.length;
    for (let index = 0; index < starCount; index++) {
      const star = galaxyStars[index];
      const angularRate = 0.48 + 0.72 / (0.32 + star.radius);
      const theta = star.angle + star.offset + angle * angularRate;
      const r = star.radius * radius;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r * flatten;
      const alpha = 0.25 + (1 - star.radius) * 0.48;
      const fill = star.age > 0.9
        ? `rgba(255,209,102,${alpha})`
        : star.age < 0.16 ? `rgba(0,212,255,${alpha})` : `rgba(238,242,255,${alpha})`;
      circle(context, x, y, star.age > 0.95 ? 1.6 : compact ? 0.58 : 0.82, fill);
    }

    const bulge = context.createRadialGradient(cx, cy, 2, cx, cy, radius * 0.18);
    bulge.addColorStop(0, 'rgba(255,242,196,0.94)');
    bulge.addColorStop(0.35, 'rgba(255,209,102,0.62)');
    bulge.addColorStop(1, 'rgba(255,209,102,0)');
    circle(context, cx, cy, radius * 0.19, bulge);
    circle(context, cx, cy, compact ? 4 : 6, palette.gold);

    if (showSun) {
      const sunRadius = radius * 0.53;
      const sunRate = 0.48 + 0.72 / (0.32 + 0.53);
      const sunAngle = -0.34 + angle * sunRate;
      const sunX = cx + Math.cos(sunAngle) * sunRadius;
      const sunY = cy + Math.sin(sunAngle) * sunRadius * flatten;
      circle(context, sunX, sunY, compact ? 4 : 6, palette.cyan, palette.paper, 1);
      if (!compact) {
        line(context, sunX, sunY - 8, sunX, sunY - 36, palette.cyan, 1);
        text(context, t('SUN · LOCAL ARM', '太阳 · 本地臂'), sunX, sunY - 46, palette.cyan, 9, 'center');
        text(context, t('Sgr A*', '人马座 A*'), cx + 15, cy + 18, palette.gold, 9);
      }
    }
  }

  function drawGalaxyEdge(context, width, height, layer) {
    const cx = width * 0.5;
    const cy = height * 0.53;
    const diskWidth = width * 0.78;
    if (layer === 'matter') {
      const gradient = context.createRadialGradient(cx, cy, 10, cx, cy, diskWidth * 0.55);
      gradient.addColorStop(0, 'rgba(124,92,255,0.28)');
      gradient.addColorStop(0.54, 'rgba(124,92,255,0.11)');
      gradient.addColorStop(1, 'rgba(124,92,255,0.015)');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(cx, cy, diskWidth * 0.62, height * 0.4, 0, 0, TAU);
      context.fill();
    }

    const thickDisk = context.createRadialGradient(cx, cy, 8, cx, cy, diskWidth * 0.5);
    thickDisk.addColorStop(0, 'rgba(255,209,102,0.26)');
    thickDisk.addColorStop(0.42, 'rgba(238,242,255,0.12)');
    thickDisk.addColorStop(1, 'rgba(238,242,255,0)');
    context.fillStyle = thickDisk;
    context.beginPath();
    context.ellipse(cx, cy, diskWidth * 0.5, height * 0.15, 0, 0, TAU);
    context.fill();

    const thinDisk = context.createLinearGradient(0, cy - 14, 0, cy + 14);
    thinDisk.addColorStop(0, 'rgba(0,212,255,0)');
    thinDisk.addColorStop(0.45, 'rgba(0,212,255,0.34)');
    thinDisk.addColorStop(0.55, 'rgba(238,242,255,0.28)');
    thinDisk.addColorStop(1, 'rgba(0,212,255,0)');
    context.fillStyle = thinDisk;
    context.fillRect(cx - diskWidth / 2, cy - 16, diskWidth, 32);

    for (const star of galaxyEdgeStars) {
      const radialFade = Math.max(0, 1 - Math.abs(star.x));
      const x = cx + star.x * diskWidth * 0.5;
      const y = cy + star.height * height * (0.6 + radialFade * 0.4);
      circle(context, x, y, star.brightness > 0.7 ? 1.2 : 0.65, `rgba(238,242,255,${star.brightness * (0.35 + radialFade * 0.45)})`);
    }

    const bulge = context.createRadialGradient(cx, cy, 4, cx, cy, height * 0.18);
    bulge.addColorStop(0, 'rgba(255,209,102,0.92)');
    bulge.addColorStop(0.46, 'rgba(255,209,102,0.38)');
    bulge.addColorStop(1, 'rgba(255,209,102,0)');
    context.fillStyle = bulge;
    context.beginPath();
    context.ellipse(cx, cy, height * 0.18, height * 0.22, 0, 0, TAU);
    context.fill();

    context.fillStyle = 'rgba(3,5,13,0.74)';
    context.fillRect(cx - diskWidth / 2, cy - 2, diskWidth, 5);
    text(context, t('DUST LANE', '尘埃带'), cx - diskWidth * 0.32, cy + 17, palette.muted, 8, 'center');
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
    const localGroupMode = state.galaxyLayer === 'neighbors';
    if (!localGroupMode && state.galaxyView === 'face') {
      const arrowX = width - 74;
      const arrowY = 68;
      context.strokeStyle = palette.cyan;
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(arrowX, arrowY, 24, -2.5, 1.2);
      context.stroke();
      const endX = arrowX + Math.cos(1.2) * 24;
      const endY = arrowY + Math.sin(1.2) * 24;
      context.fillStyle = palette.cyan;
      context.beginPath();
      context.moveTo(endX, endY);
      context.lineTo(endX - 9, endY - 2);
      context.lineTo(endX - 3, endY - 9);
      context.closePath();
      context.fill();
      text(context, t('CLOCKWISE ON SCREEN', '屏幕上顺时针'), arrowX - 32, arrowY + 38, palette.cyan, 8, 'center');
    }
    text(
      context,
      localGroupMode
        ? t('LOCAL GROUP SCHEMATIC', '本星系群示意')
        : state.galaxyView === 'face'
          ? t('FACE-ON RECONSTRUCTION', '俯视重建')
          : t('EDGE-ON RECONSTRUCTION', '侧视重建'),
      18,
      24,
      palette.muted,
      9
    );
    const summaries = {
      stars: {
        title: t('Luminous structure', '发光结构'),
        body: t('Stars, gas, dust lanes, and young tracers constrain a bar, bulge, and multiple arm segments. Different tracers emphasize different arms, and the far side remains harder to map.', '恒星、气体、尘埃带与年轻示踪物约束出中央棒、核球与多段旋臂。不同示踪物会突出不同旋臂，银河系远侧仍更难绘制。')
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
    const modelLabel = localGroupMode
      ? t('relative-layout schematic', '相对布局示意')
      : state.galaxyView === 'face'
        ? t('face-on model', '俯视模型')
        : t('edge-on model', '侧视模型');
    $('galaxySummary').innerHTML = `<strong>${summary.title}</strong><span class="data-line">${modelLabel}</span><p>${summary.body}</p>`;
    $('galaxyCanvasSubtitle').textContent = state.galaxyLayer === 'neighbors'
      ? t('Galaxy separations are radically compressed.', '星系间距被大幅压缩。')
      : state.galaxyView === 'face'
        ? t('Schematic reconstruction; clockwise in this stated screen convention, not an exterior photograph.', '示意重建；在本页明确的屏幕约定中为顺时针，并非外部照片。')
        : t('Schematic thickness and dust structure; vertical scale is enlarged.', '厚度与尘埃结构示意；垂直尺度已放大。');
    updatePlaybackButtons();
  }

  function historyStage() {
    return historyStages.find(stage => state.galaxyTime <= stage.max);
  }

  function historyBlendValues(age) {
    return {
      diskAmount: smoothstep(1.2, 9.8, age),
      fragmentFade: 1 - smoothstep(3.8, 7.2, age)
    };
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
    const { diskAmount, fragmentFade } = historyBlendValues(state.galaxyTime);

    for (const fragment of historyFragments) {
      const mergeAmount = smoothstep(0.8 + fragment.phase, 5.1 + fragment.phase, state.galaxyTime);
      const orbit = fragment.angle + state.galaxyTime * (0.18 + fragment.radius * 0.14);
      const radius = base * fragment.radius * mix(0.52, 0.12, mergeAmount);
      const x = cx + Math.cos(orbit) * radius;
      const y = cy + Math.sin(orbit) * radius * 0.64;
      const alpha = clamp((0.28 + (1 - mergeAmount) * 0.5) * fragmentFade, 0, 0.76);
      if (alpha <= 0.01) continue;
      line(context, x, y, cx, cy, `rgba(159,140,255,${alpha * 0.16})`, 1);
      circle(
        context,
        x,
        y,
        fragment.size * mix(1, 0.42, mergeAmount),
        fragment.gold ? `rgba(255,209,102,${alpha})` : `rgba(238,242,255,${alpha})`
      );
    }

    if (diskAmount > 0.01) {
      context.save();
      context.globalAlpha = 0.18 + diskAmount * 0.82;
      drawGalaxyFace(
        context,
        cx,
        cy,
        base * mix(0.08, 0.35, diskAmount),
        state.galaxyAngle * mix(0.08, 0.4, diskAmount),
        'stars',
        true,
        false
      );
      context.restore();
    }

    const satelliteCount = state.galaxyTime < 6 ? 6 : 3;
    for (let index = 0; index < satelliteCount; index++) {
      const satelliteFade = smoothstep(2.2, 5.8, state.galaxyTime);
      const angle = index / satelliteCount * TAU + state.galaxyTime * 0.08;
      const radius = base * (0.25 + index * 0.03);
      circle(context, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.65, 4 + (index % 3), `rgba(159,140,255,${satelliteFade * 0.58})`);
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

  function galacticCentreElevation(observer) {
    return Math.atan2(-observer.z, observer.radius) * 180 / Math.PI;
  }

  function sphericalAngularDistance(longitudeA, latitudeA, longitudeB, latitudeB) {
    const toRadians = value => value * Math.PI / 180;
    const latitudeARadians = toRadians(latitudeA);
    const latitudeBRadians = toRadians(latitudeB);
    const longitudeDifference = toRadians(longitudeA - longitudeB);
    const cosine = Math.sin(latitudeARadians) * Math.sin(latitudeBRadians) +
      Math.cos(latitudeARadians) * Math.cos(latitudeBRadians) * Math.cos(longitudeDifference);
    return Math.acos(clamp(cosine, -1, 1)) * 180 / Math.PI;
  }

  function directionName(direction) {
    const normalized = ((direction % 360) + 360) % 360;
    if (normalized <= 22 || normalized >= 338) return t('toward Galactic Centre', '朝向银河系中心');
    if (normalized >= 158 && normalized <= 202) return t('toward Galactic anticentre', '朝向银河系反中心');
    if (normalized < 180) return t('along increasing galactic longitude', '沿银经增加方向');
    return t('along decreasing galactic longitude', '沿银经减小方向');
  }

  function drawSkyLocalizer(observer) {
    clear(skyLocalizerScene, '#03050d');
    const { context, width, height } = skyLocalizerScene;
    const cx = width * 0.5;
    const cy = height * 0.6;
    const diskRadius = Math.min(width * 0.4, height * 0.34);
    const scale = diskRadius / 16.5;
    const project = (x, y, z) => ({
      x: cx + x * scale,
      y: cy + y * scale * 0.34 - z * scale * 0.72
    });

    const halo = context.createRadialGradient(cx, cy, 3, cx, cy, diskRadius * 1.2);
    halo.addColorStop(0, 'rgba(124,92,255,0.14)');
    halo.addColorStop(1, 'rgba(124,92,255,0)');
    context.fillStyle = halo;
    context.beginPath();
    context.ellipse(cx, cy, diskRadius * 1.12, diskRadius * 0.72, 0, 0, TAU);
    context.fill();
    context.fillStyle = 'rgba(238,242,255,0.08)';
    context.beginPath();
    context.ellipse(cx, cy, diskRadius, diskRadius * 0.34, 0, 0, TAU);
    context.fill();
    context.strokeStyle = 'rgba(0,212,255,0.24)';
    context.beginPath();
    context.ellipse(cx, cy, diskRadius, diskRadius * 0.34, 0, 0, TAU);
    context.stroke();
    line(context, cx, cy - diskRadius * 0.72, cx, cy + diskRadius * 0.72, palette.violet, 1, [3, 4]);
    text(context, t('GALACTIC NORTH', '银河北'), cx + 8, cy - diskRadius * 0.68, palette.violet, 8);
    circle(context, cx, cy, 6, palette.gold);

    const displayRadius = Math.min(observer.radius, 17.5);
    const observerX = Math.cos(observer.angle) * displayRadius;
    const observerY = Math.sin(observer.angle) * displayRadius;
    const observerZ = clamp(observer.z, -7, 7);
    const observerPoint = project(observerX, observerY, observerZ);
    const diskPoint = project(observerX, observerY, 0);
    if (Math.abs(observerZ) > 0.2) line(context, observerPoint.x, observerPoint.y, diskPoint.x, diskPoint.y, palette.muted, 1, [3, 3]);
    circle(context, observerPoint.x, observerPoint.y, 6, palette.cyan, palette.paper, 1);
    const centrePoint = project(0, 0, 0);
    line(context, observerPoint.x, observerPoint.y, centrePoint.x, centrePoint.y, palette.gold, 1, [4, 4]);

    const centreBearing = Math.atan2(-observerY, -observerX);
    const longitude = state.skyDirection * Math.PI / 180;
    const elevation = state.skyElevation * Math.PI / 180;
    const lookAngle = centreBearing + longitude;
    const lookLength = 6.2;
    const horizontal = Math.cos(elevation) * lookLength;
    const lookEnd = project(
      observerX + Math.cos(lookAngle) * horizontal,
      observerY + Math.sin(lookAngle) * horizontal,
      observerZ + Math.sin(elevation) * lookLength
    );
    arrow(context, observerPoint.x, observerPoint.y, lookEnd.x, lookEnd.y, palette.green, 2, t('look', '视线'));
    text(context, t('centre', '中心'), (observerPoint.x + centrePoint.x) / 2, (observerPoint.y + centrePoint.y) / 2 - 8, palette.gold, 8, 'center');
    text(context, localized(observer.label), observerPoint.x, observerPoint.y + 18, palette.cyan, 8, 'center');
    text(context, t('3D ORIENTATION SCHEMATIC', '三维方向示意'), 10, 14, palette.muted, 8);
    const centreElevation = galacticCentreElevation(observer);
    $('skyLocalizerSummary').textContent = `${localized(observer.label)} · l=${Math.round(state.skyDirection)}° · b=${state.skyElevation >= 0 ? '+' : ''}${Math.round(state.skyElevation)}° · ${t('centre', '中心')} b=${centreElevation >= 0 ? '+' : ''}${fixed(centreElevation, 1)}°`;
  }

  function drawSky() {
    clear(skyScene, '#03050d');
    const { context, width, height } = skyScene;
    const observer = observerPositions[state.observerPosition];
    drawSkyLocalizer(observer);
    const centreElevation = galacticCentreElevation(observer);
    const centreDistance = sphericalAngularDistance(state.skyDirection, state.skyElevation, 0, centreElevation);
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

    const sgrVisible = centreDistance < 48;
    if (sgrVisible) {
      const signedLongitude = (((state.skyDirection + 180) % 360) + 360) % 360 - 180;
      const x = width / 2 - signedLongitude / 48 * width * 0.42;
      const y = height / 2 + (state.skyElevation - centreElevation) / 48 * height * 0.28;
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
      ? t(`Direction marked at centre b=${centreElevation >= 0 ? '+' : ''}${fixed(centreElevation, 1)}°; optically obscured`, `方向已标在中心 b=${centreElevation >= 0 ? '+' : ''}${fixed(centreElevation, 1)}°；光学波段受遮挡`)
      : t('Outside the schematic field', '位于示意视场外');
    $('skyCanvasSubtitle').textContent = `${localized(observer.label)} · ${directionName(state.skyDirection)} · ${t('centre', '中心')} b=${centreElevation >= 0 ? '+' : ''}${fixed(centreElevation, 1)}°`;
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
    document.querySelectorAll('[data-assist-mode]').forEach(button => {
      const selected = button.dataset.assistMode === state.assistMode;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('[data-assist-panel]').forEach(panel => {
      panel.hidden = panel.dataset.assistPanel !== state.assistMode;
    });
    document.querySelectorAll('[data-neighbor]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.neighbor === state.neighbor)));
    const localGroupMode = state.galaxyLayer === 'neighbors';
    document.querySelectorAll('[data-galaxy-view]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.galaxyView === state.galaxyView));
      button.disabled = localGroupMode;
      button.setAttribute('aria-disabled', String(localGroupMode));
      button.title = localGroupMode
        ? t('Face-on and edge-on views apply to Milky Way structure, not this compressed Local Group layout.', '俯视与侧视只适用于银河系结构，不适用于这一压缩的本星系群布局。')
        : '';
    });
    document.querySelectorAll('[data-galaxy-layer]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galaxyLayer === state.galaxyLayer)));
  }

  function updatePlaybackButtons() {
    const labels = {
      mission: [t('Play mission history', '播放任务历史'), t('Pause mission history', '暂停任务历史')],
      assist: state.assistMode === 'voyager'
        ? [t('Play the grand tour', '播放大巡游'), t('Pause the grand tour', '暂停大巡游')]
        : [t('Play the encounter', '播放交会'), t('Pause the encounter', '暂停交会')],
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
      if (state.assistMode === 'vectors') {
        state.assistProgress = (state.assistProgress + delta / 5600) % 1;
      } else {
        state.voyagerYear += delta * (1989.65 - 1979.52) / 15000;
        if (state.voyagerYear > 1989.65) state.voyagerYear = 1979.52;
        $('voyagerEncounter').value = String(state.voyagerYear);
      }
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

  const assistTabs = [...document.querySelectorAll('[data-assist-mode]')];
  function activateAssistTab(button) {
    stopPlaying('assist');
    state.assistMode = button.dataset.assistMode;
    renderStaticStates();
    drawAssist();
  }
  assistTabs.forEach((button, buttonIndex) => {
    button.addEventListener('click', () => activateAssistTab(button));
    button.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? assistTabs.length - 1
          : (buttonIndex + (event.key === 'ArrowRight' ? 1 : -1) + assistTabs.length) % assistTabs.length;
      assistTabs[nextIndex].focus();
      activateAssistTab(assistTabs[nextIndex]);
    });
  });
  bindRange('planetSpeed', 'planetSpeed', drawAssist, 'assist');
  bindRange('closestApproach', 'closestApproach', drawAssist, 'assist');
  bindRange('encounterSide', 'encounterSide', drawAssist, 'assist');
  bindRange('voyagerEncounter', 'voyagerYear', drawAssist, 'assist');
  $('assistPlay').addEventListener('click', () => togglePlaying('assist'));
  $('assistReset').addEventListener('click', () => {
    stopPlaying('assist');
    Object.assign(state, { planetSpeed: 13.1, closestApproach: 6, encounterSide: 0.75, assistProgress: 0.18, voyagerYear: 1979.52 });
    $('planetSpeed').value = '13.1';
    $('closestApproach').value = '6';
    $('encounterSide').value = '0.75';
    $('voyagerEncounter').value = '1979.52';
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
      if (state.galaxyLayer === 'neighbors') state.galaxyView = 'face';
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
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideAddressTooltip();
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.address-hotspot')) hideAddressTooltip();
  });
  $('addressTooltip').addEventListener('pointerenter', () => window.clearTimeout(addressTooltipTimer));
  $('addressTooltip').addEventListener('pointerleave', () => {
    scheduleAddressTooltipHide(document.querySelector('.address-hotspot[aria-expanded="true"]'));
  });

  createObjectControls();
  const observer = new ResizeObserver(() => renderAll());
  observer.observe(document.querySelector('.address-instrument'));
  observer.observe(document.querySelector('.address-stage'));
  document.querySelectorAll('.instrument-shell').forEach(element => observer.observe(element));

  window.__cosmicAtlas = Object.freeze({
    state,
    solarObjects,
    missions,
    nearbySystems,
    observerPositions,
    voyagerEncounters,
    addressLabelLayout,
    missionSnapshot,
    reachClassification,
    formatAU,
    formatCosmicAge,
    directionName,
    angularDistance,
    assistValues,
    assistPathVector,
    voyagerPosition,
    historyBlendValues,
    galacticCentreElevation,
    sphericalAngularDistance,
    localized,
    requireElement: $,
    renderAll
  });

  renderAll();
})();
