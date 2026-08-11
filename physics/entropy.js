(() => {
  const canvas = document.getElementById('entropyCanvas');
  const context = canvas.getContext('2d');
  const slider = document.getElementById('entropyBias');
  const output = document.getElementById('entropyBiasOut');
  let width = 0;
  let height = 0;
  let elapsed = 0;
  let frame = 0;
  let previous = performance.now();

  const zh = () => PhysicsUI.language === 'zh-CN';

  function probabilities() {
    const bias = Number(slider.value);
    return [
      0.25 + bias * 0.7,
      0.25 - bias * 0.27,
      0.25 - bias * 0.23,
      0.25 - bias * 0.2
    ];
  }

  function entropy(values, base) {
    return -values.reduce((sum, value) => sum + value * Math.log(value) / Math.log(base), 0);
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

  function draw() {
    const values = probabilities();
    const bits = entropy(values, 2);
    const natural = entropy(values, Math.E);
    context.fillStyle = '#05070f';
    context.fillRect(0, 0, width, height);

    const left = 42;
    const right = width - 34;
    const chartTop = 68;
    const chartBottom = height * 0.58;
    const gap = Math.max(12, (right - left) * 0.035);
    const barWidth = (right - left - gap * 3) / 4;
    const colors = ['#7c5cff', '#00d4ff', '#7ee8c5', '#ffd166'];
    for (let index = 0; index < values.length; index++) {
      const barHeight = values[index] * (chartBottom - chartTop) * 1.2;
      const x = left + index * (barWidth + gap);
      const y = chartBottom - barHeight;
      const pulse = 1 + Math.sin(elapsed * 1.4 + index) * 0.015;
      context.fillStyle = colors[index];
      context.fillRect(x, y, barWidth, barHeight * pulse);
      context.fillStyle = '#eef2ff';
      context.font = '600 12px "JetBrains Mono", monospace';
      context.fillText(String.fromCharCode(65 + index), x, chartBottom + 20);
      context.fillStyle = '#aeb8d8';
      context.fillText(values[index].toFixed(2), x, y - 9);
    }

    const split = width / 2;
    const ledgerTop = height * 0.69;
    context.strokeStyle = 'rgba(238,242,255,.16)';
    context.beginPath();
    context.moveTo(split, ledgerTop - 20);
    context.lineTo(split, height - 52);
    context.stroke();

    context.fillStyle = '#aeb8d8';
    context.font = '600 11px "JetBrains Mono", monospace';
    context.fillText(zh() ? '物理状态权重' : 'physical-state weights', left, ledgerTop);
    context.fillText(zh() ? '消息源概率' : 'message-source probabilities', split + 26, ledgerTop);
    context.fillStyle = '#7ee8c5';
    context.font = '600 20px "Space Grotesk", sans-serif';
    context.fillText(`S/kB = ${natural.toFixed(3)}`, left, ledgerTop + 42);
    context.fillStyle = '#7c5cff';
    context.fillText(`H = ${bits.toFixed(3)} bits`, split + 26, ledgerTop + 42);
    context.fillStyle = '#aeb8d8';
    context.font = '500 11px "Space Grotesk", sans-serif';
    const warning = zh() ? '数学结构相同，不代表单位与物理含义相同' : 'same structure does not mean same units or physical meaning';
    context.fillText(warning, left, height - 25);
  }

  function tick(now) {
    elapsed += Math.min((now - previous) / 1000, 0.05);
    previous = now;
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

  slider.addEventListener('input', () => {
    output.textContent = Number(slider.value).toFixed(2);
    draw();
  });
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('physics-language', draw);
  document.addEventListener('physics-motion', event => event.detail.paused ? stop() : start());
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : !PhysicsUI.motionPaused() && start());
  resize();
  if (PhysicsUI.motionPaused()) draw();
  else start();
})();
