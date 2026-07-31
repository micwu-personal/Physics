/* Instruments for the light and signals guide.
   1. cherenkov  - why a charge outrunning light-in-medium leaves a shock cone
   2. velocity   - phase velocity versus group velocity in a wave packet
   3. redshift   - how the three redshift mechanisms stretch a signal */
(() => {
  const scenes = new Map();
  let frameHandle = 0;
  let lastTime = performance.now();
  const zh = () => PhysicsUI.language === 'zh-CN';

  function setup(id, draw, options = {}) {
    const canvas = document.getElementById(id);
    const scene = {
      canvas,
      ctx: canvas.getContext('2d'),
      draw,
      elapsed: 0,
      height: 0,
      width: 0,
      ...options
    };
    scenes.set(id, scene);
    return scene;
  }

  function resize(scene) {
    const rect = scene.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio, 2);
    scene.width = Math.max(1, Math.round(rect.width));
    scene.height = Math.max(1, Math.round(rect.height));
    scene.canvas.width = Math.round(scene.width * ratio);
    scene.canvas.height = Math.round(scene.height * ratio);
    scene.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function clear(ctx, width, height, color = '#05070f') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  function label(ctx, text, x, y, color = '#aeb8d8', size = 11) {
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(text, x, y);
  }

  /* --------------------------------------------------------- 1. cherenkov --
     Each point on the track emits a spherical wavefront that expands at c/n.
     When the particle moves faster than those fronts, the fronts pile up on a
     cone whose half-angle satisfies cos θ = 1/(βn). */
  function drawCherenkov(scene) {
    const { ctx, width, height } = scene;
    const beta = scene.beta;
    const index = scene.index;
    const speedRatio = beta * index;
    clear(ctx, width, height);

    const cy = height * 0.5;
    const travel = width * 0.78;
    const startX = width * 0.12;
    const period = 3.4;
    const phase = (scene.elapsed % period) / period;
    const particleX = startX + phase * travel;

    ctx.strokeStyle = 'rgba(174,184,216,.28)';
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, cy);
    ctx.lineTo(startX + travel, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wavefronts emitted at earlier points on the track.
    const emissions = 16;
    for (let step = 0; step <= emissions; step++) {
      const emitPhase = (step / emissions) * phase;
      const emitX = startX + emitPhase * travel;
      // Light travels at c/n while the particle travels at beta*c.
      const radius = (phase - emitPhase) * travel / Math.max(0.05, speedRatio);
      if (radius <= 0.5) continue;
      ctx.strokeStyle = `rgba(0,212,255,${0.1 + 0.35 * (1 - (phase - emitPhase) / Math.max(phase, 0.001))})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(emitX, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // The coherent cone exists only when the particle outruns light in the medium.
    if (speedRatio > 1) {
      const halfAngle = Math.acos(1 / speedRatio);
      const reach = phase * travel;
      ctx.strokeStyle = 'rgba(255,209,102,.9)';
      ctx.lineWidth = 2.4;
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(particleX, cy);
        ctx.lineTo(
          particleX - Math.cos(halfAngle) * reach,
          cy + sign * Math.sin(halfAngle) * reach
        );
        ctx.stroke();
      }
      label(
        ctx,
        `cos θ = 1/(βn) = ${(1 / speedRatio).toFixed(3)}   θ = ${(halfAngle * 180 / Math.PI).toFixed(1)}°`,
        16,
        height - 18,
        '#ffd166',
        12
      );
    } else {
      label(
        ctx,
        zh() ? 'βn ≤ 1：粒子未超过介质中的光速，没有相干锥面'
          : 'βn ≤ 1: the particle is slower than light in the medium, so no coherent cone forms.',
        16,
        height - 18,
        '#aeb8d8',
        12
      );
    }

    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.arc(particleX, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    label(ctx, `β = ${beta.toFixed(3)}   n = ${index.toFixed(2)}   βn = ${speedRatio.toFixed(3)}`, 16, 26, '#e8ecff', 12);
  }

  /* ---------------------------------------------------------- 2. velocity --
     Two sine waves of slightly different frequency produce a carrier that
     moves at the phase velocity inside an envelope that moves at the group
     velocity. They can point in opposite directions. */
  function drawVelocity(scene) {
    const { ctx, width, height } = scene;
    const dispersion = scene.dispersion;
    clear(ctx, width, height);
    const cy = height * 0.5;
    const amplitude = height * 0.26;

    const k1 = 0.09;
    const k2 = 0.105;
    // Angular frequency chosen so the medium's dispersion is adjustable.
    const omega1 = k1 * 60;
    const omega2 = k2 * 60 * (1 + dispersion * 0.42);

    ctx.strokeStyle = 'rgba(174,184,216,.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,209,102,.95)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 1.5) {
      const value = Math.cos(k1 * x - omega1 * scene.elapsed) +
        Math.cos(k2 * x - omega2 * scene.elapsed);
      const y = cy - value * amplitude * 0.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Envelope traces the beat pattern; its crests move at the group velocity.
    ctx.strokeStyle = 'rgba(0,212,255,.8)';
    ctx.lineWidth = 2;
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1.5) {
        const envelope = 2 * Math.cos(
          ((k2 - k1) / 2) * x - ((omega2 - omega1) / 2) * scene.elapsed
        );
        const y = cy - sign * Math.abs(envelope) * amplitude * 0.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const phaseVelocity = (omega1 + omega2) / (k1 + k2);
    const groupVelocity = (omega2 - omega1) / (k2 - k1);
    label(ctx, `${zh() ? '相速度' : 'phase velocity'} vp = ${phaseVelocity.toFixed(1)}`, 16, 26, '#ffd166', 12);
    label(ctx, `${zh() ? '群速度' : 'group velocity'} vg = ${groupVelocity.toFixed(1)}`, 16, 46, '#00d4ff', 12);
    label(
      ctx,
      groupVelocity < 0
        ? (zh() ? '包络向左移动，载波向右：群速度与相速度反向' : 'The envelope moves left while the carrier moves right: opposite signs.')
        : (zh() ? '包络与载波同向，但速度不同' : 'Envelope and carrier travel the same way at different speeds.'),
      16,
      height - 18,
      '#e8ecff',
      12
    );
  }

  /* ---------------------------------------------------------- 3. redshift --
     A repeating signal is stretched in wavelength and, for kinematic and
     cosmological cases, in arrival cadence as well. */
  function drawRedshift(scene) {
    const { ctx, width, height } = scene;
    const z = scene.z;
    clear(ctx, width, height);
    const stretch = 1 + z;

    const rows = [
      { y: height * 0.3, factor: 1, color: '#00d4ff', name: zh() ? '发射（静止系）' : 'emitted (rest frame)' },
      { y: height * 0.68, factor: stretch, color: '#ff6b9d', name: zh() ? '接收（红移后）' : 'received (redshifted)' }
    ];

    for (const row of rows) {
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const wavelength = 34 * row.factor;
      for (let x = 0; x <= width - 30; x += 1.5) {
        const y = row.y - Math.sin((x / wavelength) * Math.PI * 2 - scene.elapsed * 2 / row.factor) * height * 0.11;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      label(ctx, row.name, 14, row.y - height * 0.16, row.color, 11);

      // Pulse markers show that the cadence of events stretches too.
      const pulsePeriod = 1.1 * row.factor;
      for (let index = 0; index < 6; index++) {
        const t = (scene.elapsed / pulsePeriod + index) % 6;
        const x = (t / 6) * (width - 30);
        ctx.fillStyle = row.color;
        ctx.globalAlpha = 0.75;
        ctx.fillRect(x, row.y + height * 0.14, 2.5, 12);
        ctx.globalAlpha = 1;
      }
    }

    label(ctx, `z = ${z.toFixed(2)}   λ_obs/λ_emit = ${stretch.toFixed(2)}`, 14, 26, '#e8ecff', 12);
    label(
      ctx,
      zh() ? `远方事件的表观持续时间被拉长 ${stretch.toFixed(2)} 倍`
        : `Distant events appear to unfold ${stretch.toFixed(2)}× slower`,
      14,
      height - 16,
      '#ffd166',
      12
    );
  }

  const cherenkov = setup('cherenkovCanvas', drawCherenkov, { beta: 0.9, index: 1.33 });
  const velocity = setup('velocityCanvas', drawVelocity, { dispersion: 0.5 });
  const redshift = setup('redshiftCanvas', drawRedshift, { z: 1 });

  function renderAll(delta) {
    for (const scene of scenes.values()) {
      if (!PhysicsUI.motionPaused()) scene.elapsed += delta;
      scene.draw(scene);
    }
  }

  function frame(now) {
    const delta = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    renderAll(delta);
    frameHandle = requestAnimationFrame(frame);
  }

  function start() {
    if (frameHandle) return;
    lastTime = performance.now();
    frameHandle = requestAnimationFrame(frame);
  }

  function stop() {
    if (!frameHandle) return;
    cancelAnimationFrame(frameHandle);
    frameHandle = 0;
    renderAll(0);
  }

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      resize([...scenes.values()].find(scene => scene.canvas === entry.target));
    }
    renderAll(0);
  });
  for (const scene of scenes.values()) {
    resize(scene);
    observer.observe(scene.canvas);
  }

  const betaInput = document.getElementById('betaControl');
  const betaOut = document.getElementById('betaOut');
  const indexInput = document.getElementById('indexControl');
  const indexOut = document.getElementById('indexOut');
  const dispersionInput = document.getElementById('dispersionControl');
  const dispersionOut = document.getElementById('dispersionOut');
  const redshiftInput = document.getElementById('redshiftControl');
  const redshiftOut = document.getElementById('redshiftOut');

  function syncCherenkov() {
    cherenkov.beta = Number(betaInput.value);
    cherenkov.index = Number(indexInput.value);
    betaOut.textContent = `${cherenkov.beta.toFixed(3)} c`;
    indexOut.textContent = cherenkov.index.toFixed(2);
    renderAll(0);
  }

  function syncVelocity() {
    velocity.dispersion = Number(dispersionInput.value);
    dispersionOut.textContent = velocity.dispersion.toFixed(2);
    renderAll(0);
  }

  function syncRedshift() {
    redshift.z = Number(redshiftInput.value);
    redshiftOut.textContent = redshift.z.toFixed(2);
    renderAll(0);
  }

  betaInput.addEventListener('input', syncCherenkov);
  indexInput.addEventListener('input', syncCherenkov);
  dispersionInput.addEventListener('input', syncVelocity);
  redshiftInput.addEventListener('input', syncRedshift);

  document.addEventListener('physics-language', () => renderAll(0));
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) stop();
    else start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!PhysicsUI.motionPaused()) start();
  });

  syncCherenkov();
  syncVelocity();
  syncRedshift();

  if (PhysicsUI.motionPaused()) renderAll(0);
  else start();
})();
