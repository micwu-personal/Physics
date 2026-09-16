(() => {
  const canvas = document.getElementById('newtonWorkshopCanvas');

  const tabs = [...document.querySelectorAll('[data-newton-experiment]')];
  const panels = {
    inertia: document.getElementById('inertiaPanel'),
    dynamics: document.getElementById('dynamicsPanel'),
    recoil: document.getElementById('recoilPanel')
  };
  const status = document.getElementById('newtonStatus');
  const readout = document.getElementById('newtonReadout');
  const controls = {
    cartMass: document.getElementById('cartMass'),
    cartForce: document.getElementById('cartForce'),
    rocketAir: document.getElementById('rocketAir')
  };
  const outputs = {
    cartMass: document.getElementById('cartMassOutput'),
    cartForce: document.getElementById('cartForceOutput'),
    rocketAir: document.getElementById('rocketAirOutput')
  };
  const state = {
    experiment: 'inertia',
    progress: 0,
    running: false,
    completed: false,
    frame: 0,
    lastTime: 0
  };
  let context = null;
  let width = 1;
  let height = 1;

  const copy = (en, zh) => PhysicsUI.language === 'zh-CN' ? zh : en;
  const cartMass = () => Number(controls.cartMass.value);
  const cartForce = () => Number(controls.cartForce.value);
  const rocketAir = () => Number(controls.rocketAir.value);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  function drawGrid() {
    context.fillStyle = '#050816';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(238,242,255,.08)';
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 24; x < width; x += 36) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let y = 24; y < height; y += 36) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();
  }

  function text(label, x, y, color = '#eef2ff', align = 'left') {
    context.fillStyle = color;
    context.font = '600 12px "JetBrains Mono", monospace';
    context.textAlign = align;
    context.fillText(label, x, y);
  }

  function arrow(x1, y1, x2, y2, color, label, labelOffset = -10) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 8;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
    text(label, (x1 + x2) / 2, (y1 + y2) / 2 + labelOffset, color, 'center');
  }

  function drawTimelinePause() {
    if (!state.completed) return;
    const x = width - 74;
    const y = 24;
    context.fillStyle = 'rgba(9,13,29,.9)';
    context.fillRect(x - 12, y - 16, 62, 34);
    context.strokeStyle = '#f6c85f';
    context.lineWidth = 2;
    context.strokeRect(x - 12, y - 16, 62, 34);
    context.fillStyle = '#f6c85f';
    context.fillRect(x, y - 8, 5, 16);
    context.fillRect(x + 10, y - 8, 5, 16);
    text(copy('timeline paused', '时间线暂停'), x + 20, y + 37, '#f6c85f', 'center');
  }

  function drawCoin() {
    const p = state.progress;
    const cupX = width * 0.46;
    const deckY = height * 0.42;
    const pullProgress = Math.max(0, Math.min(1, (p - 0.12) / 0.26));
    const fallProgress = Math.max(0, Math.min(1, (p - 0.42) / 0.5));
    const cardX = cupX + pullProgress * width * 0.42;
    const glassRimY = deckY + 10;
    const glassBottomY = deckY + height * 0.24;
    const coinY = deckY - 16 + fallProgress * fallProgress * height * 0.2;

    text(copy('FIRST LAW · INERTIA', '第一定律 · 惯性'), 24, 32, '#f6c85f');
    context.fillStyle = 'rgba(160,210,236,.11)';
    context.beginPath();
    context.moveTo(cupX - 30, glassRimY);
    context.lineTo(cupX - 22, glassBottomY - 12);
    context.quadraticCurveTo(cupX, glassBottomY + 2, cupX + 22, glassBottomY - 12);
    context.lineTo(cupX + 30, glassRimY);
    context.closePath();
    context.fill();
    context.strokeStyle = '#d7e4f5';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(cupX - 30, glassRimY);
    context.lineTo(cupX - 22, glassBottomY - 12);
    context.quadraticCurveTo(cupX, glassBottomY + 2, cupX + 22, glassBottomY - 12);
    context.lineTo(cupX + 30, glassRimY);
    context.stroke();
    context.strokeStyle = 'rgba(215,228,245,.65)';
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(cupX, glassRimY, 30, 7, 0, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = 'rgba(96,214,197,.25)';
    context.beginPath();
    context.ellipse(cupX, glassRimY + 2, 24, 4, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = 'rgba(215,228,245,.55)';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(cupX, glassBottomY - 11);
    context.lineTo(cupX, glassBottomY + 10);
    context.moveTo(cupX - 18, glassBottomY + 10);
    context.lineTo(cupX + 18, glassBottomY + 10);
    context.stroke();

    context.fillStyle = '#8a5d35';
    context.fillRect(cardX - 52, deckY, 104, 8);
    context.strokeStyle = '#f6c85f';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cupX, coinY, 13, 0, Math.PI * 2);
    context.fillStyle = '#f6c85f';
    context.fill();
    context.stroke();
    text(copy('coin', '硬币'), cupX, coinY - 22, '#f6c85f', 'center');
    if (p > 0.1) arrow(cardX - 38, deckY - 22, cardX + 76, deckY - 22, '#ff8d6b', copy('quick pull', '快速拉动'));
    if (p >= 0.42) {
      const velocityLength = 16 + fallProgress * 52;
      arrow(cupX + 42, coinY, cupX + 42, coinY + velocityLength, '#60d6c5', copy('downward speed grows', '向下速度增大'), -8);
      arrow(cupX + 76, coinY - 2, cupX + 76, coinY + 30, '#ff8d6b', copy('gravity', '重力'), -8);
    }

    text(copy('card moves; coin stays horizontally still', '卡片移动；硬币水平方向近似静止'), width * 0.5, height * 0.78, '#9eafc4', 'center');
    text(copy('card', '卡片'), Math.min(width - 30, cardX), deckY + 29, '#c5b38b', 'center');
    text(copy('glass', '玻璃杯'), cupX, glassBottomY + 28, '#d7e4f5', 'center');
  }

  function drawCart() {
    const p = state.progress;
    const mass = cartMass();
    const force = cartForce();
    const acceleration = force / mass;
    const time = p * 2.5;
    const velocity = acceleration * time;
    const physicalDistance = 0.5 * acceleration * time * time * width * 0.055;
    const cameraOffset = Math.max(0, physicalDistance - width * 0.48);
    const x = width * 0.13 + physicalDistance - cameraOffset;
    const y = height * 0.6;
    const cartWidth = Math.min(105, width * 0.2);

    text(copy('SECOND LAW · DYNAMICS', '第二定律 · 动力学'), 24, 32, '#f6c85f');
    context.strokeStyle = '#64748b';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(width * 0.06, y + 46);
    context.lineTo(width * 0.94, y + 46);
    context.stroke();
    context.strokeStyle = 'rgba(158,175,196,.35)';
    context.lineWidth = 1;
    for (let distance = 0; distance <= width * 1.2; distance += 72) {
      const tickX = width * 0.13 + distance - cameraOffset;
      if (tickX < width * 0.06 || tickX > width * 0.94) continue;
      context.beginPath();
      context.moveTo(tickX, y + 42);
      context.lineTo(tickX, y + 51);
      context.stroke();
    }
    context.fillStyle = '#27445d';
    context.fillRect(x, y, cartWidth, 32);
    context.fillStyle = '#60d6c5';
    context.fillRect(x + 12, y - 21, cartWidth * 0.55, 21);
    context.fillStyle = '#0b1022';
    for (const wheelX of [x + 20, x + cartWidth - 20]) {
      context.beginPath();
      context.arc(wheelX, y + 37, 10, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#d7e4f5';
      context.lineWidth = 2;
      context.stroke();
    }
    const forceLength = 44 + force * 5;
    arrow(x + cartWidth + 4, y + 16, x + cartWidth + 4 + forceLength, y + 16, '#ff8d6b', `F = ${force.toFixed(1)} N`);
    const accelerationLength = 34 + acceleration * 12;
    arrow(x + cartWidth / 2, y - 42, x + cartWidth / 2 + accelerationLength, y - 42, '#60d6c5', `a = ${acceleration.toFixed(2)} m/s²`);
    if (p > 0) {
      arrow(x + cartWidth / 2, y + 81, x + cartWidth / 2 + Math.min(130, velocity * 24), y + 81, '#f6c85f', `v = ${velocity.toFixed(2)} m/s`, 20);
    }
    text(copy('constant net force · view follows the cart →', '恒定合力 · 视野跟随小车 →'), width * 0.5, height * 0.78, '#9eafc4', 'center');
    drawTimelinePause();
  }

  function drawBalloon() {
    const p = state.progress;
    const air = rocketAir();
    const balloonX = width * (0.3 + p * 0.44);
    const y = height * 0.5;
    const radius = 28 + air * 0.16 * (1 - p * 0.35);
    const pairLength = 34 + air * 0.38;

    text(copy('THIRD LAW · ACTION / REACTION', '第三定律 · 作用 / 反作用'), 24, 32, '#f6c85f');
    context.strokeStyle = '#d7e4f5';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(width * 0.08, y);
    context.lineTo(width * 0.92, y);
    context.stroke();
    context.fillStyle = '#60d6c5';
    context.beginPath();
    context.ellipse(balloonX, y - 8, radius * 0.88, radius, -0.16, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#d7e4f5';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#ff8d6b';
    context.fillRect(balloonX - radius - 8, y - 5, 14, 10);
    const nozzleX = balloonX - radius - 8;
    const particleCount = 4 + Math.round(p * 18);
    for (let index = 0; index < particleCount; index++) {
      const age = index / (particleCount - 1);
      const particleX = nozzleX - 14 - age * (34 + p * width * 0.34);
      const particleY = y + Math.sin(index * 2.1) * (8 + age * 16);
      const particleRadius = 5 + age * 7;
      context.fillStyle = `rgba(215,228,245,${0.72 - age * 0.48})`;
      context.beginPath();
      context.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
      context.fill();
    }
    const cloudX = nozzleX - 20;
    arrow(balloonX - radius - 8, y - 38, balloonX - radius - 8 - pairLength, y - 38, '#ff8d6b', copy('balloon on air', '气球作用于空气'));
    arrow(cloudX + 18, y + 56, cloudX + 18 + pairLength, y + 56, '#60d6c5', copy('air on balloon', '空气作用于气球'), 20);
    text(copy('air', '空气'), cloudX - 32, y + 28, '#d7e4f5', 'center');
    text(copy('balloon', '气球'), balloonX, y - radius - 22, '#60d6c5', 'center');
    text(copy('equal magnitude · opposite direction · different bodies', '大小相等 · 方向相反 · 作用于不同物体'), width / 2, height * 0.78, '#9eafc4', 'center');
    drawTimelinePause();
  }

  function updateReadout() {
    const { experiment, progress } = state;
    const reduced = PhysicsUI.motionPaused();
    if (experiment === 'inertia') {
      status.textContent = progress ? copy('Coin landed in the glass', '硬币已落入玻璃杯') : copy('Ready to pull', '准备拉动');
      readout.textContent = progress
        ? copy('Result: the card gained horizontal speed, while the coin initially stayed nearly at rest. Once unsupported, gravity carried it down into the glass.', '结果：卡片获得了水平速度，硬币起初仍近似静止。失去支撑后，重力把它带入玻璃杯。')
        : copy('Prediction: a fast pull gives the coin little time for friction to carry it sideways with the card.', '预测：快速拉动使摩擦没有多少时间带着硬币随卡片横向运动。');
    } else if (experiment === 'dynamics') {
      const acceleration = cartForce() / cartMass();
      const velocity = acceleration * progress * 2.5;
      status.textContent = state.completed
        ? copy('Teaching timeline paused — the cart would keep accelerating', '教学时间线已暂停——小车会继续加速')
        : progress ? copy('Cart accelerating', '小车正在加速') : copy('Ready to launch', '准备发射');
      readout.textContent = copy(
        `F = ${cartForce().toFixed(1)} N ÷ m = ${cartMass().toFixed(1)} kg gives a = ${acceleration.toFixed(2)} m/s². ${state.completed ? `This teaching timeline pauses after 2.5 s at ${velocity.toFixed(2)} m/s; with the force still applied, the cart would continue accelerating.` : progress ? `After ${Math.min(2.5, progress * 2.5).toFixed(1)} s, the velocity vector is ${velocity.toFixed(2)} m/s to the right.` : 'Apply the force to make the velocity vector grow.'}`,
        `F = ${cartForce().toFixed(1)} N ÷ m = ${cartMass().toFixed(1)} kg，得到 a = ${acceleration.toFixed(2)} m/s²。${state.completed ? `教学时间线在 2.5 秒、${velocity.toFixed(2)} m/s 处暂停；若持续施力，小车会继续加速。` : progress ? `${Math.min(2.5, progress * 2.5).toFixed(1)} 秒后，速度箭头向右，大小为 ${velocity.toFixed(2)} m/s。` : '施加力，让速度箭头增长。'}`
      );
    } else {
      status.textContent = state.completed
        ? copy('Teaching timeline paused — the balloon would keep recoiling', '教学时间线已暂停——气球会继续反冲')
        : progress ? copy('Balloon recoiled right', '气球向右反冲') : copy('Ready to release', '准备放开');
      readout.textContent = progress
        ? copy(`Result: the balloon pushed the escaping air left; the air pushed the balloon right with an equal ${rocketAir()}%-air schematic force. The arrows do not cancel because they act on different bodies.${state.completed ? ' This teaching timeline is paused; while air continues escaping, the balloon would continue moving.' : ''}`, `结果：气球把喷出的空气推向左；空气以大小相等的 ${rocketAir()}% 空气示意力把气球推向右。箭头不会相互抵消，因为它们作用于不同物体。${state.completed ? ' 教学时间线已暂停；只要空气继续喷出，气球会继续运动。' : ''}`)
        : copy('Prediction: releasing the neck sends air left and the balloon right. Find the two equal arrows on separate bodies.', '预测：放开气球口，空气向左喷出，气球向右运动。请在不同物体上找到两支大小相等的箭头。');
    }
    if (reduced && progress) {
      status.textContent += copy(' · static result', ' · 静态结果');
    }
  }

  function render() {
    drawGrid();
    if (state.experiment === 'inertia') drawCoin();
    if (state.experiment === 'dynamics') drawCart();
    if (state.experiment === 'recoil') drawBalloon();
    updateReadout();
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.frame);
    state.frame = 0;
  }

  function frame(now) {
    const delta = Math.min(0.05, (now - state.lastTime) / 1000);
    state.lastTime = now;
    state.progress = Math.min(1, state.progress + delta / 1.45);
    if (state.progress >= 1) {
      state.completed = true;
      stop();
    }
    render();
    if (state.running) state.frame = requestAnimationFrame(frame);
  }

  function run() {
    stop();
    state.progress = 0;
    state.completed = false;
    if (PhysicsUI.motionPaused()) {
      state.progress = 1;
      state.completed = true;
      render();
      return;
    }
    state.running = true;
    state.lastTime = performance.now();
    state.frame = requestAnimationFrame(frame);
    render();
  }

  function reset() {
    stop();
    state.progress = 0;
    state.completed = false;
    render();
  }

  function selectExperiment(experiment) {
    stop();
    state.experiment = experiment;
    state.progress = 0;
    state.completed = false;
    tabs.forEach(tab => {
      const selected = tab.dataset.newtonExperiment === experiment;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name !== experiment;
    });
    render();
  }

  function updateOutputs() {
    outputs.cartMass.textContent = `${cartMass().toFixed(1)} kg`;
    outputs.cartForce.textContent = `${cartForce().toFixed(1)} N`;
    outputs.rocketAir.textContent = `${rocketAir()}%`;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectExperiment(tab.dataset.newtonExperiment));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      selectExperiment(tabs[next].dataset.newtonExperiment);
    });
  });
  function runExperiment(experiment) {
    if (state.experiment !== experiment) selectExperiment(experiment);
    run();
  }

  function resetExperiment(experiment) {
    if (state.experiment !== experiment) selectExperiment(experiment);
    reset();
  }

  document.getElementById('inertiaLaunch').addEventListener('click', () => runExperiment('inertia'));
  document.getElementById('inertiaReset').addEventListener('click', () => resetExperiment('inertia'));
  document.getElementById('cartLaunch').addEventListener('click', () => runExperiment('dynamics'));
  document.getElementById('cartReset').addEventListener('click', () => resetExperiment('dynamics'));
  document.getElementById('rocketLaunch').addEventListener('click', () => runExperiment('recoil'));
  document.getElementById('rocketReset').addEventListener('click', () => resetExperiment('recoil'));
  controls.cartMass.addEventListener('input', () => {
    updateOutputs();
    resetExperiment('dynamics');
  });
  controls.cartForce.addEventListener('input', () => {
    updateOutputs();
    resetExperiment('dynamics');
  });
  controls.rocketAir.addEventListener('input', () => {
    updateOutputs();
    resetExperiment('recoil');
  });
  document.addEventListener('physics-language', render);
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused && state.running) {
      stop();
      render();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running) stop();
  });

  new ResizeObserver(resizeCanvas).observe(canvas);
  updateOutputs();
  resizeCanvas();
})();
