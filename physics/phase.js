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
