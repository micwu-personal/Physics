export const locales = ['en', 'zh-CN'];

export const entries = [
  { id: 'landing', app: 'landing', path: '/', generated: false, title: 'Physics Journey — Matter, Ideas, and the Laws of Nature', brandPath: '/index.html' },
  { id: 'physics-atlas', app: 'physics-atlas', path: '/physics/', generated: false, title: 'Physics Field Atlas — A Genealogy of Ideas', brandPath: '/physics/index.html' },
  { id: 'newtonian-mechanics', app: 'physics-area', path: '/physics/newtonian.html', generated: false, title: 'Newtonian Mechanics — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'relativity', app: 'physics-area', path: '/physics/relativity.html', generated: false, title: 'Relativity — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'quantum-mechanics', app: 'physics-area', path: '/physics/quantum.html', generated: false, title: 'Quantum Mechanics — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'astrophysics', app: 'physics-astro', path: '/physics/astrophysics.html', generated: false, title: 'Astrophysics — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'electrodynamics', app: 'physics-light', path: '/physics/electrodynamics.html', generated: false, title: 'Light & Signals — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'phase-transitions', app: 'physics-phase', path: '/physics/phase-transitions.html', generated: false, title: 'Phase Transitions — Physics Field Atlas', brandPath: '/physics/index.html' },
  { id: 'entropy-information', app: 'physics-entropy', path: '/physics/entropy-information.html', generated: false, title: 'Entropy & Information — Physics Field Atlas', brandPath: '/physics/index.html' },
  {
    id: 'field-guide',
    app: 'physics-field',
    path: '/physics/field.html?id=thermodynamics',
    generated: false,
    title: { en: 'Thermodynamics — Physics Field Atlas', 'zh-CN': '热力学 — Physics Field Atlas' },
    brandPath: '/physics/index.html'
  },
  {
    id: 'big-bang',
    app: 'big-bang',
    path: '/big-bang/',
    generated: false,
    title: { en: 'Big Bang — 13.8 Billion Years in an Afternoon', 'zh-CN': '宇宙大爆炸 — 一个下午读完 138 亿年' },
    brandPath: '/big-bang/index.html'
  },
  {
    id: 'big-bang-mobile',
    app: 'big-bang',
    path: '/big-bang/mobile/index.html',
    generated: true,
    title: { en: 'Big Bang — 13.8 Billion Years in an Afternoon', 'zh-CN': '宇宙大爆炸 — 一个下午读完 138 亿年' },
    brandPath: '/big-bang/mobile/index.html',
    sourcePath: '/big-bang/'
  },
  {
    id: 'periodic-table',
    app: 'periodic-table',
    path: '/periodic-table/',
    generated: false,
    title: { en: 'Periodic Table — An Interactive Journey into the Elements', 'zh-CN': '元素周期表 — 元素的交互式探索' },
    brandPath: '/periodic-table/index.html'
  },
  {
    id: 'periodic-table-mobile',
    app: 'periodic-table',
    path: '/periodic-table/mobile/index.html',
    generated: true,
    title: { en: 'Periodic Table — An Interactive Journey into the Elements', 'zh-CN': '元素周期表 — 元素的交互式探索' },
    brandPath: '/periodic-table/mobile/index.html',
    sourcePath: '/periodic-table/'
  },
  {
    id: 'periodic-table-offline',
    app: 'periodic-table',
    path: '/periodic-table/mobile/periodic-table.html',
    generated: true,
    title: { en: 'Periodic Table — An Interactive Journey into the Elements', 'zh-CN': '元素周期表 — 元素的交互式探索' },
    brandPath: '/periodic-table/mobile/periodic-table.html',
    sourcePath: '/periodic-table/'
  },
  {
    id: 'particle-zoo',
    app: 'particle-zoo',
    path: '/particle-zoo/',
    generated: false,
    title: { en: 'Particle Zoo — An Interactive Journey into the Standard Model', 'zh-CN': '粒子动物园 — 标准模型的交互之旅' },
    brandPath: '/particle-zoo/index.html'
  },
  {
    id: 'particle-zoo-mobile',
    app: 'particle-zoo',
    path: '/particle-zoo/mobile/index.html',
    generated: true,
    title: { en: 'Particle Zoo — An Interactive Journey into the Standard Model', 'zh-CN': '粒子动物园 — 标准模型的交互之旅' },
    brandPath: '/particle-zoo/mobile/index.html',
    sourcePath: '/particle-zoo/'
  },
  {
    id: 'particle-zoo-offline',
    app: 'particle-zoo',
    path: '/particle-zoo/mobile/particle-zoo.html',
    generated: true,
    title: { en: 'Particle Zoo — An Interactive Journey into the Standard Model', 'zh-CN': '粒子动物园 — 标准模型的交互之旅' },
    brandPath: '/particle-zoo/mobile/particle-zoo.html',
    sourcePath: '/particle-zoo/'
  }
];

export const sourceEntries = entries.filter(entry => !entry.generated);
export const generatedEntries = entries.filter(entry => entry.generated);

export function expectedEntryTitle(entry, language = 'en') {
  return typeof entry.title === 'string' ? entry.title : (entry.title[language] ?? entry.title.en);
}

export const performanceBudgets = {
  heapGrowthBytes: 12 * 1024 * 1024,
  interactionP95Ms: 250,
  loadMs: 5_000,
  longTaskCount: 5,
  longTaskTotalMs: 500,
  rafPerSecond: 180
};
