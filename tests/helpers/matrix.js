export const locales = ['en', 'zh-CN'];

export const entries = [
  { id: 'landing', app: 'landing', path: '/', generated: false },
  { id: 'physics-atlas', app: 'physics-atlas', path: '/physics/', generated: false },
  { id: 'newtonian-mechanics', app: 'physics-area', path: '/physics/newtonian.html', generated: false },
  { id: 'relativity', app: 'physics-area', path: '/physics/relativity.html', generated: false },
  { id: 'quantum-mechanics', app: 'physics-area', path: '/physics/quantum.html', generated: false },
  { id: 'astrophysics', app: 'physics-astro', path: '/physics/astrophysics.html', generated: false },
  { id: 'electrodynamics', app: 'physics-light', path: '/physics/electrodynamics.html', generated: false },
  { id: 'field-guide', app: 'physics-field', path: '/physics/field.html?id=thermodynamics', generated: false },
  { id: 'big-bang', app: 'big-bang', path: '/big-bang/', generated: false },
  { id: 'big-bang-mobile', app: 'big-bang', path: '/big-bang/mobile/index.html', generated: true },
  { id: 'periodic-table', app: 'periodic-table', path: '/periodic-table/', generated: false },
  { id: 'periodic-table-mobile', app: 'periodic-table', path: '/periodic-table/mobile/index.html', generated: true },
  { id: 'periodic-table-offline', app: 'periodic-table', path: '/periodic-table/mobile/periodic-table.html', generated: true },
  { id: 'particle-zoo', app: 'particle-zoo', path: '/particle-zoo/', generated: false },
  { id: 'particle-zoo-mobile', app: 'particle-zoo', path: '/particle-zoo/mobile/index.html', generated: true },
  { id: 'particle-zoo-offline', app: 'particle-zoo', path: '/particle-zoo/mobile/particle-zoo.html', generated: true }
];

export const sourceEntries = entries.filter(entry => !entry.generated);

export const performanceBudgets = {
  heapGrowthBytes: 12 * 1024 * 1024,
  interactionP95Ms: 250,
  loadMs: 5_000,
  longTaskCount: 5,
  longTaskTotalMs: 500,
  rafPerSecond: 180
};
