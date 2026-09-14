(() => {
  const canvas = document.getElementById('phaseCanvas');
  const context = canvas.getContext('2d');
  const control = document.getElementById('phaseControl');
  const output = document.getElementById('phaseOutput');
  const buttons = [...document.querySelectorAll('[data-phase-mode]')];
  let mode = 'continuous';
  let elapsed = 0;
  let frame = 0;
  let previous = performance.now();
  let width = 0;
  let height = 0;

  const zh = () => PhysicsUI.language === 'zh-CN';

  function resize() {
    const rectangle = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio, 2);
    width = Math.max(1, Math.round(rectangle.width));
    height = Math.max(1, Math.round(rectangle.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function landscape(x, parameter) {
    if (mode === 'continuous') return 0.28 * x ** 4 + parameter * x * x;
    if (mode === 'first') return 0.2 * x ** 6 - 0.46 * x ** 4 + parameter * x * x + 0.08 * x;
    if (mode === 'spinodal') return 0.2 * x ** 6 - 0.5 * x ** 4 - (0.22 + parameter * 0.08) * x * x;
    return 0.25 * x ** 4 + (parameter - 0.2) * x * x;
  }

  function drawLandscape(parameter) {
    const top = 34;
    const graphHeight = height * 0.47;
    const left = 46;
    const right = width - 24;
    const baseline = top + graphHeight * 0.7;
    context.strokeStyle = 'rgba(174,184,216,.28)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(left, baseline);
    context.lineTo(right, baseline);
    context.moveTo((left + right) / 2, top);
    context.lineTo((left + right) / 2, top + graphHeight);
    context.stroke();

    context.strokeStyle = '#7ee8c5';
    context.lineWidth = 3;
    context.beginPath();
    for (let index = 0; index <= 240; index++) {
      const normalized = index / 240;
      const x = normalized * 4 - 2;
      const energy = landscape(x, parameter);
      const px = left + normalized * (right - left);
      const py = baseline - energy * graphHeight * 0.55;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.stroke();

    context.fillStyle = '#aeb8d8';
    context.font = '600 11px "JetBrains Mono", monospace';
    context.fillText(zh() ? '自由能' : 'free energy', left, top + 4);
    context.fillText(zh() ? '序参量' : 'order parameter', right - 98, baseline - 8);
  }

  function pseudoNoise(x, y, time) {
    return Math.sin(x * 12.9898 + y * 78.233 + time) * 43758.5453 % 1;
  }

  function drawDomains(parameter) {
    const top = height * 0.55;
    const bottom = height - 58;
    const cell = Math.max(10, Math.min(18, width / 32));
    const columns = Math.ceil(width / cell);
    const rows = Math.ceil((bottom - top) / cell);
    const growth = Math.max(0, (1 - parameter) * 0.5);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = column * cell;
        const y = top + row * cell;
        const wave = Math.sin(column * 0.34 + elapsed * 0.45) + Math.cos(row * 0.41 - elapsed * 0.28);
        const seed = pseudoNoise(Math.floor(column / (1 + growth * 3)), Math.floor(row / (1 + growth * 3)), mode.length);
        let ordered = wave * growth + seed > 0;
        if (mode === 'first') {
          const radius = Math.hypot(column - columns * 0.58, row - rows * 0.5);
          ordered = radius < growth * Math.min(columns, rows) * 0.95 || seed > 0.82 - growth * 0.2;
        }
        if (mode === 'spinodal') ordered = Math.sin(column * 0.5 + elapsed * 0.25) + Math.cos(row * 0.55 - elapsed * 0.2) > parameter;
        if (mode === 'cosmic') ordered = row > rows * (0.22 + (parameter + 1) * 0.25);
        context.fillStyle = ordered ? 'rgba(126,232,197,.78)' : 'rgba(124,92,255,.38)';
        context.fillRect(x, y, cell - 1, cell - 1);
      }
    }
    context.fillStyle = '#eef2ff';
    context.font = '600 12px "JetBrains Mono", monospace';
    const labels = {
      continuous: zh() ? '连续有序化：关联长度增长' : 'Continuous ordering: correlation length grows',
      first: zh() ? '成核：超过临界尺寸的相畴继续生长' : 'Nucleation: supercritical domains keep growing',
      spinodal: zh() ? '旋节分解：涨落在各处放大并粗化' : 'Spinodal: fluctuations amplify everywhere and coarsen',
      cosmic: zh() ? '宇宙冷却：不同事件的证据等级不同' : 'Cosmic cooling: each event has a different evidence level'
    };
    context.fillText(labels[mode], 18, height - 24);
  }

  function draw() {
    const parameter = Number(control.value);
    context.fillStyle = '#05070f';
    context.fillRect(0, 0, width, height);
    drawLandscape(parameter);
    drawDomains(parameter);
  }

  function tick(now) {
    const delta = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    elapsed += delta;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (frame) return;
    previous = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    draw();
  }

  control.addEventListener('input', () => {
    output.textContent = Number(control.value).toFixed(2);
    draw();
  });

  for (const button of buttons) {
    button.addEventListener('click', () => {
      mode = button.dataset.phaseMode;
      for (const candidate of buttons) candidate.setAttribute('aria-pressed', String(candidate === button));
      draw();
    });
  }

  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('physics-language', draw);
  document.addEventListener('physics-motion', event => event.detail.paused ? stop() : start());
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : !PhysicsUI.motionPaused() && start());
  resize();
  if (PhysicsUI.motionPaused()) draw();
  else start();
})();

(() => {
  const canvas = document.getElementById('magnetCanvas');
  const temperature = document.getElementById('magnetTemperature');
  const field = document.getElementById('magnetField');
  if (!canvas || !temperature || !field) return;

  const context = canvas.getContext('2d');
  const tempOutput = document.getElementById('magnetTemperatureOutput');
  const fieldOutput = document.getElementById('magnetFieldOutput');
  const stateOutput = document.getElementById('magnetState');
  const orderOutput = document.getElementById('magnetOrder');
  const correlationOutput = document.getElementById('magnetCorrelation');
  const reset = document.getElementById('magnetReset');
  const presets = [...document.querySelectorAll('[data-magnet-preset]')];
  const columns = 42;
  const rows = 28;
  let spins = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let settleSteps = 0;
  let randomState = 0x51f15e;

  const zh = () => PhysicsUI.language === 'zh-CN';
  const random = () => {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967296;
  };

  function randomize() {
    spins = Array.from({ length: rows * columns }, () => random() > 0.5 ? 1 : -1);
  }

  function index(row, column) {
    return ((row + rows) % rows) * columns + ((column + columns) % columns);
  }

  function sweep(count = 1) {
    const heat = Number(temperature.value);
    const bias = Number(field.value);
    for (let pass = 0; pass < count; pass++) {
      for (let trial = 0; trial < spins.length; trial++) {
        const row = Math.floor(random() * rows);
        const column = Math.floor(random() * columns);
        const current = spins[index(row, column)];
        const neighbours = spins[index(row - 1, column)] + spins[index(row + 1, column)] + spins[index(row, column - 1)] + spins[index(row, column + 1)];
        const change = 2 * current * (neighbours + bias * 2.4);
        if (change <= 0 || random() < Math.exp(-change / heat)) spins[index(row, column)] = -current;
      }
    }
  }

  function summary() {
    const m = spins.reduce((sum, spin) => sum + spin, 0) / spins.length;
    const absolute = Math.abs(m);
    const heat = Number(temperature.value);
    const state = heat > 2.65
      ? (zh() ? '热扰动主导' : 'Thermal disorder dominates')
      : heat > 2.05
        ? (zh() ? '临界涨落在竞争' : 'Critical fluctuations compete')
        : (zh() ? '集体有序正在建立' : 'Collective order is forming');
    const correlation = heat > 2.65
      ? (zh() ? '短程小团簇' : 'Short-range patches')
      : heat > 2.05
        ? (zh() ? '跨越许多方格的团簇' : 'Patches span many tiles')
        : (zh() ? '长程方向一致性' : 'Long-range directional order');
    stateOutput.textContent = state;
    orderOutput.textContent = `m = ${m.toFixed(2)} · |m| = ${absolute.toFixed(2)}`;
    correlationOutput.textContent = correlation;
  }

  function draw() {
    const cell = Math.max(1, Math.min(width / columns, height / rows));
    const drawWidth = cell * columns;
    const drawHeight = cell * rows;
    const left = (width - drawWidth) / 2;
    const top = (height - drawHeight) / 2;
    context.fillStyle = '#05070f';
    context.fillRect(0, 0, width, height);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const spin = spins[index(row, column)];
        context.fillStyle = spin > 0 ? '#7ee8c5' : '#7c5cff';
        context.fillRect(left + column * cell + .5, top + row * cell + .5, Math.max(0, cell - 1), Math.max(0, cell - 1));
      }
    }
    context.strokeStyle = 'rgba(238,242,255,.34)';
    context.lineWidth = 1;
    context.strokeRect(left, top, drawWidth, drawHeight);
    context.fillStyle = '#eef2ff';
    context.font = '600 12px "JetBrains Mono", monospace';
    context.fillText(zh() ? '二维伊辛教学模型 · T₍c₎ ≈ 2.27 J/k_B' : '2D Ising teaching model · T₍c₎ ≈ 2.27 J/k_B', 18, 28);
    summary();
  }

  function resize() {
    const rectangle = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio, 2);
    width = Math.max(1, Math.round(rectangle.width));
    height = Math.max(1, Math.round(rectangle.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function tick() {
    sweep(Number(temperature.value) < 2.3 ? 3 : 1);
    draw();
    settleSteps--;
    frame = settleSteps > 0 ? requestAnimationFrame(tick) : 0;
  }

  function settle() {
    settleSteps = 180;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function updateControls() {
    tempOutput.textContent = Number(temperature.value).toFixed(2);
    fieldOutput.textContent = Number(field.value).toFixed(2);
    draw();
    settle();
  }

  function setPreset(button) {
    const presetsByName = { hot: 3.5, critical: 2.27, cold: 1.25 };
    temperature.value = String(presetsByName[button.dataset.magnetPreset]);
    for (const candidate of presets) candidate.setAttribute('aria-pressed', String(candidate === button));
    updateControls();
  }

  temperature.addEventListener('input', updateControls);
  field.addEventListener('input', updateControls);
  reset.addEventListener('click', () => {
    randomize();
    updateControls();
  });
  for (const button of presets) button.addEventListener('click', () => setPreset(button));
  document.addEventListener('physics-language', draw);
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) {
      cancelAnimationFrame(frame);
      frame = 0;
      settleSteps = 0;
      draw();
    } else {
      settle();
    }
  });
  new ResizeObserver(resize).observe(canvas);
  randomize();
  resize();
  if (!PhysicsUI.motionPaused()) settle();
})();
