(() => {
  const topic = document.body.dataset.topic;
  const heroCanvas = document.getElementById('heroCanvas');
  const labCanvas = document.getElementById('labCanvas');
  const primary = document.getElementById('primaryControl');
  const secondary = document.getElementById('secondaryControl');
  const rate = document.getElementById('rateControl');
  const primaryOutput = document.getElementById('primaryOutput');
  const secondaryOutput = document.getElementById('secondaryOutput');
  const readout = document.getElementById('labReadout');
  const secondaryReadout = document.getElementById('labSecondaryReadout');
  const toggle = document.getElementById('labToggle');
  const reset = document.getElementById('labReset');
  const audioToggle = document.getElementById('audioToggle');
  const canvases = [heroCanvas, labCanvas];
  const context = new Map();
  let playing = !PhysicsUI.motionPaused();
  let soundEnabled = false;
  let frameHandle = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let lastSound = -1;

  const orbit = {
    x: 1,
    y: 0,
    vx: 0,
    vy: 1,
    trail: []
  };

  const quantum = {
    seed: 0x51f15e,
    hits: []
  };

  const relativityDom = topic === 'relativity' ? {
    betaValue: document.getElementById('clockBetaValue'),
    gammaValue: document.getElementById('clockGammaValue'),
    shipHalfTick: document.getElementById('clockShipHalfTick'),
    groundHalfTick: document.getElementById('clockGroundHalfTick'),
    shipPath: document.getElementById('clockShipPath'),
    groundPath: document.getElementById('clockGroundPath'),
    shipEventE0: document.getElementById('clockShipEventE0'),
    shipEventE1: document.getElementById('clockShipEventE1'),
    shipEventE2: document.getElementById('clockShipEventE2'),
    groundEventE0: document.getElementById('clockGroundEventE0'),
    groundEventE1: document.getElementById('clockGroundEventE1'),
    groundEventE2: document.getElementById('clockGroundEventE2')
  } : null;

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.set(canvas, { ctx, width, height });
  }

  function clear(ctx, width, height, color = '#050816') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  function drawInstrumentGrid(ctx, width, height, color = 'rgba(238,242,255,.07)', step = 42) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function drawGlow(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color.replace('1)', '.42)'));
    gradient.addColorStop(1, color.replace('1)', '0)'));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function copy(en, zh) {
    return PhysicsUI.language === 'zh-CN' ? zh : en;
  }

  function computeRelativityHeroGeometry(width, height) {
    const lensX = width * 0.58;
    const lensY = height * 0.58;
    const radius = Math.min(width, height) * 0.11;
    const source = { x: width * 0.09, y: height * 0.24 };
    const observer = { x: width * 0.91, y: height * 0.3 };
    const flatRay = [source, observer];
    const clearance = Math.max(18, radius * 0.38);
    const sigma = radius * 1.45;
    const sampleCount = 160;
    const lensT = (lensX - source.x) / (observer.x - source.x);
    const baselineLensY = source.y + (observer.y - source.y) * lensT;
    const closestApproachY = lensY - radius - clearance;
    const deflectionAmplitude = Math.max(0, closestApproachY - baselineLensY);
    const ray = [];
    let minimumSurfaceClearance = Number.POSITIVE_INFINITY;

    for (let index = 0; index <= sampleCount; index++) {
      const t = index / sampleCount;
      const x = source.x + (observer.x - source.x) * t;
      const baselineY = source.y + (observer.y - source.y) * t;
      const normalizedOffset = (x - lensX) / sigma;
      const falloff = Math.exp(-(normalizedOffset * normalizedOffset));
      const y = baselineY + deflectionAmplitude * falloff;
      ray.push([x, y]);
      minimumSurfaceClearance = Math.min(minimumSurfaceClearance, Math.hypot(x - lensX, y - lensY) - radius);
    }

    return {
      clearance,
      flatRay,
      lens: { x: lensX, y: lensY, radius },
      minimumSurfaceClearance,
      observer,
      ray,
      source
    };
  }

  function drawNewtonHero(ctx, width, height, time) {
    clear(ctx, width, height);
    drawInstrumentGrid(ctx, width, height);
    const cx = width * 0.5;
    const cy = height * 0.48;
    const scale = Math.min(width, height) * 0.34;
    drawGlow(ctx, cx, cy, 86, 'rgba(255,209,102,1)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    [
      { radius: scale * 0.42, speed: 0.62, size: 5, color: '#00d4ff' },
      { radius: scale * 0.72, speed: 0.38, size: 7, color: '#ff6b9d' },
      { radius: scale, speed: 0.24, size: 8, color: '#7ee8c5' }
    ].forEach((planet, index) => {
      ctx.strokeStyle = 'rgba(238,242,255,.17)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, planet.radius, planet.radius * 0.55, -0.22, 0, Math.PI * 2);
      ctx.stroke();
      const angle = time * planet.speed + index * 2.1;
      const px = cx + Math.cos(angle) * planet.radius;
      const py = cy + Math.sin(angle) * planet.radius * 0.55;
      drawGlow(ctx, px, py, 22, planet.color === '#00d4ff' ? 'rgba(0,212,255,1)' : planet.color === '#ff6b9d' ? 'rgba(255,107,157,1)' : 'rgba(126,232,197,1)');
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(px, py, planet.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + scale * 0.45, cy - scale * 0.08);
    ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('F = GMm/r²', cx + 18, cy - 16);
  }

  function drawRelativityHero(ctx, width, height, time) {
    clear(ctx, width, height);
    const hero = computeRelativityHeroGeometry(width, height);
    const {
      flatRay,
      lens: { x: lensX, y: lensY, radius },
      observer,
      ray,
      source
    } = hero;

    function warpPoint(x, y) {
      const dx = x - lensX;
      const dy = y - lensY;
      const distance2 = dx * dx + dy * dy + radius * radius * 0.45;
      const scale = Math.min(18, (radius * radius * 0.7) / distance2);
      return {
        x: x - dx * scale,
        y: y - dy * scale
      };
    }

    ctx.strokeStyle = 'rgba(64,221,245,.2)';
    ctx.lineWidth = 1;
    for (let gx = 34; gx < width - 28; gx += 42) {
      ctx.beginPath();
      for (let y = 18; y <= height - 18; y += 6) {
        const warped = warpPoint(gx, y);
        if (y === 18) ctx.moveTo(warped.x, warped.y);
        else ctx.lineTo(warped.x, warped.y);
      }
      ctx.stroke();
    }
    for (let gy = 26; gy < height - 18; gy += 42) {
      ctx.beginPath();
      for (let x = 18; x <= width - 18; x += 6) {
        const warped = warpPoint(x, gy);
        if (x === 18) ctx.moveTo(warped.x, warped.y);
        else ctx.lineTo(warped.x, warped.y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(232,236,255,.32)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.moveTo(flatRay[0].x, flatRay[0].y);
    ctx.lineTo(flatRay[1].x, flatRay[1].y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let index = 0; index < ray.length; index++) {
      const [x, y] = ray[index];
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const pulseIndex = Math.floor((((time * 0.18) % 1) + 1) % 1 * (ray.length - 1));
    const [pulseX, pulseY] = ray[pulseIndex];
    drawGlow(ctx, pulseX, pulseY, 26, 'rgba(255,209,102,1)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(pulseX, pulseY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    drawGlow(ctx, lensX, lensY, radius * 1.55, 'rgba(0,212,255,1)');
    ctx.fillStyle = '#07101f';
    ctx.beginPath();
    ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lensX, lensY, radius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#7ee8c5';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5f7ff';
    ctx.beginPath();
    ctx.arc(observer.x, observer.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawQuantumHero(ctx, width, height, time) {
    clear(ctx, width, height);
    const barrierX = width * 0.48;
    const centerY = height * 0.5;
    const slitGap = 70;
    const wavelength = 28;
    ctx.strokeStyle = 'rgba(139,114,255,.45)';
    ctx.lineWidth = 2;
    for (let x = -wavelength * 2; x < barrierX; x += wavelength) {
      const span = wavelength * 8;
      const radius = (((x + time * 34) % span) + span) % span + 15;
      ctx.beginPath();
      ctx.arc(0, centerY, radius, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e8ecff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(barrierX, 0);
    ctx.lineTo(barrierX, centerY - slitGap);
    ctx.moveTo(barrierX, centerY - slitGap + 17);
    ctx.lineTo(barrierX, centerY + slitGap - 17);
    ctx.moveTo(barrierX, centerY + slitGap);
    ctx.lineTo(barrierX, height);
    ctx.stroke();

    const slitYs = [centerY - slitGap + 8, centerY + slitGap - 8];
    slitYs.forEach(slitY => {
      ctx.strokeStyle = 'rgba(139,114,255,.52)';
      for (let radius = 24; radius < width * 0.75; radius += 32) {
        ctx.beginPath();
        ctx.arc(barrierX, slitY, (radius + time * 30) % (width * 0.7), -1.35, 1.35);
        ctx.stroke();
      }
    });
    ctx.fillStyle = '#7c5cff';
    for (let y = 8; y < height; y += 8) {
      const relative = (y - centerY) / height;
      const intensity = Math.pow(Math.cos(relative * 38), 2) * Math.exp(-relative * relative * 6);
      ctx.globalAlpha = 0.08 + intensity * 0.85;
      ctx.fillRect(width - 13, y, 5, 5);
    }
    ctx.globalAlpha = 1;
  }

  function resetOrbit() {
    const speed = Number(primary.value);
    orbit.x = 1;
    orbit.y = 0;
    orbit.vx = 0;
    orbit.vy = speed;
    orbit.trail = [];
    elapsed = 0;
  }

  function stepOrbit(dt) {
    const mass = Number(secondary.value);
    const distanceSquared = orbit.x * orbit.x + orbit.y * orbit.y;
    const distance = Math.sqrt(distanceSquared);
    const acceleration = -mass / (distanceSquared * distance);
    orbit.vx += acceleration * orbit.x * dt;
    orbit.vy += acceleration * orbit.y * dt;
    orbit.x += orbit.vx * dt;
    orbit.y += orbit.vy * dt;
    orbit.trail.push([orbit.x, orbit.y]);
    if (orbit.trail.length > 680) orbit.trail.shift();
    if (distance < 0.18 || distance > 4.4) resetOrbit();
  }

  function drawNewtonLab(ctx, width, height, dt) {
    if (playing) {
      const steps = 4;
      for (let index = 0; index < steps; index++) stepOrbit(Math.min(dt, 0.03) * 0.74 / steps);
    }
    clear(ctx, width, height);
    drawInstrumentGrid(ctx, width, height, 'rgba(238,242,255,.055)', 48);
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width, height) * 0.27;
    drawGlow(ctx, cx, cy, 68, 'rgba(255,209,102,1)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,212,255,.54)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    orbit.trail.forEach(([x, y], index) => {
      const px = cx + x * scale;
      const py = cy + y * scale;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    const px = cx + orbit.x * scale;
    const py = cy + orbit.y * scale;
    drawGlow(ctx, px, py, 30, 'rgba(0,212,255,1)');
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - orbit.x * 40, py - orbit.y * 40);
    ctx.stroke();

    const speed = Math.hypot(orbit.vx, orbit.vy);
    const mass = Number(secondary.value);
    const distance = Math.hypot(orbit.x, orbit.y);
    const energy = 0.5 * speed * speed - mass / distance;
    primaryOutput.textContent = `${Number(primary.value).toFixed(2)} × circular`;
    secondaryOutput.textContent = `${mass.toFixed(2)} × solar`;
    readout.textContent = `r = ${distance.toFixed(2)} AU · v = ${speed.toFixed(2)}`;
    const state = energy >= 0
      ? (PhysicsUI.language === 'zh-CN' ? '开放轨道：物体将逃逸' : 'Open trajectory: the body can escape')
      : (PhysicsUI.language === 'zh-CN' ? '束缚轨道：总能量小于零' : 'Bound orbit: total energy is negative');
    secondaryReadout.textContent = `${state} · E = ${energy.toFixed(3)}`;
    if (soundEnabled && Math.abs(orbit.y) < 0.015 && orbit.x > 0 && elapsed - lastSound > 0.4) {
      PhysicsUI.playTone(240 + speed * 120, 0.09, 0.018);
      lastSound = elapsed;
    }
  }

  function updateRelativityGeometry(beta, gamma) {
    if (!relativityDom) return;
    const horizontalHalf = beta * gamma;
    const horizontalFull = 2 * horizontalHalf;
    relativityDom.betaValue.textContent = beta.toFixed(3);
    relativityDom.gammaValue.textContent = gamma.toFixed(3);
    relativityDom.shipHalfTick.textContent = '1.000 L0/c';
    relativityDom.groundHalfTick.textContent = `${gamma.toFixed(3)} L0/c`;
    relativityDom.shipPath.textContent = '1.000 L0';
    relativityDom.groundPath.textContent = `${gamma.toFixed(3)} L0`;
    relativityDom.shipEventE0.textContent = "x' = 0, y' = 0, t' = 0";
    relativityDom.shipEventE1.textContent = "x' = 0, y' = 1.000 L0, t' = 1.000 L0/c";
    relativityDom.shipEventE2.textContent = "x' = 0, y' = 0, t' = 2.000 L0/c";
    relativityDom.groundEventE0.textContent = 'x = 0, y = 0, t = 0';
    relativityDom.groundEventE1.textContent =
      `x = ${horizontalHalf.toFixed(3)} L0, y = 1.000 L0, t = ${gamma.toFixed(3)} L0/c`;
    relativityDom.groundEventE2.textContent =
      `x = ${horizontalFull.toFixed(3)} L0, y = 0, t = ${(2 * gamma).toFixed(3)} L0/c`;
  }

  function drawRelativityLab(ctx, width, height) {
    clear(ctx, width, height);
    drawInstrumentGrid(ctx, width, height, 'rgba(64,221,245,.055)', 52);
    const beta = Number(primary.value);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    updateRelativityGeometry(beta, gamma);

    const period = 3.2;
    const cycle = (elapsed % period) / period;
    const panelTop = 30;
    const panelBottom = height - 84;
    const panelHeight = panelBottom - panelTop;
    const margin = 26;
    const gap = 22;
    const panelWidth = (width - margin * 2 - gap) / 2;
    const leftPanelX = margin;
    const rightPanelX = leftPanelX + panelWidth + gap;
    const unit = Math.min(panelHeight * 0.34, panelWidth * 0.64 / Math.max(1.25, 2 * beta * gamma));
    const topY = panelTop + panelHeight * 0.22;
    const bottomY = topY + unit;
    const mirrorHalf = Math.max(22, unit * 0.52);
    const leftX = leftPanelX + panelWidth * 0.5;
    const rightOriginX = rightPanelX + panelWidth * 0.18;
    const event0 = { x: rightOriginX, y: bottomY };
    const event1 = { x: rightOriginX + beta * gamma * unit, y: topY };
    const event2 = { x: rightOriginX + 2 * beta * gamma * unit, y: bottomY };
    const path = [event0, event1, event2];

    function drawPanelFrame(x, title, subtitle) {
      ctx.fillStyle = 'rgba(8,13,28,.84)';
      ctx.strokeStyle = 'rgba(232,236,255,.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, panelTop, panelWidth, panelHeight, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f5f7ff';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(title, x + 16, panelTop + 22);
      ctx.fillStyle = 'rgba(232,236,255,.68)';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText(subtitle, x + 16, panelTop + 40);
    }

    drawPanelFrame(
      leftPanelX,
      copy('Clock rest frame', '光钟静止系'),
      copy("mirrors fixed, path vertical", '镜子固定，路径竖直')
    );
    drawPanelFrame(
      rightPanelX,
      copy('Ground frame', '地面系'),
      copy('mirrors translate, path is zigzag', '镜子平移，路径为折线')
    );

    ctx.strokeStyle = 'rgba(232,236,255,.24)';
    ctx.lineWidth = 1;
    for (const px of [leftPanelX, rightPanelX]) {
      for (let y = panelTop + 58; y < panelBottom - 14; y += 24) {
        ctx.beginPath();
        ctx.moveTo(px + 12, y);
        ctx.lineTo(px + panelWidth - 12, y);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(238,242,255,.32)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(leftX - mirrorHalf, topY);
    ctx.lineTo(leftX + mirrorHalf, topY);
    ctx.moveTo(leftX - mirrorHalf, bottomY);
    ctx.lineTo(leftX + mirrorHalf, bottomY);
    ctx.stroke();

    const shipPath = [
      { x: leftX, y: bottomY },
      { x: leftX, y: topY },
      { x: leftX, y: bottomY }
    ];
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(shipPath[0].x, shipPath[0].y);
    ctx.lineTo(shipPath[1].x, shipPath[1].y);
    ctx.lineTo(shipPath[2].x, shipPath[2].y);
    ctx.stroke();

    const halfCycle = cycle < 0.5 ? cycle * 2 : (cycle - 0.5) * 2;
    const shipPulse = cycle < 0.5
      ? { x: leftX, y: bottomY - (bottomY - topY) * halfCycle }
      : { x: leftX, y: topY + (bottomY - topY) * halfCycle };
    drawGlow(ctx, shipPulse.x, shipPulse.y, 26, 'rgba(255,209,102,1)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(shipPulse.x, shipPulse.y, 6, 0, Math.PI * 2);
    ctx.fill();

    const mirrorPairs = [
      { x: event0.x, alpha: 0.35 },
      { x: event1.x, alpha: 0.55 },
      { x: event2.x, alpha: 0.8 }
    ];
    mirrorPairs.forEach(pair => {
      ctx.strokeStyle = `rgba(238,242,255,${pair.alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pair.x - mirrorHalf, topY);
      ctx.lineTo(pair.x + mirrorHalf, topY);
      ctx.moveTo(pair.x - mirrorHalf, bottomY);
      ctx.lineTo(pair.x + mirrorHalf, bottomY);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(64,221,245,.38)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(event0.x, bottomY);
    ctx.lineTo(event2.x, bottomY);
    ctx.moveTo(event0.x, topY);
    ctx.lineTo(event2.x, topY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(event0.x, event0.y);
    ctx.lineTo(event1.x, event1.y);
    ctx.lineTo(event2.x, event2.y);
    ctx.stroke();

    path.forEach((eventPoint, index) => {
      ctx.fillStyle = index === 1 ? '#7ee8c5' : '#f5f7ff';
      ctx.beginPath();
      ctx.arc(eventPoint.x, eventPoint.y, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5f7ff';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`E${index}`, eventPoint.x + 8, eventPoint.y - 10);
    });

    const totalSegments = [Math.hypot(event1.x - event0.x, event1.y - event0.y), Math.hypot(event2.x - event1.x, event2.y - event1.y)];
    const totalLength = totalSegments[0] + totalSegments[1];
    let pulseDistance = cycle * totalLength;
    let groundPulse;
    if (pulseDistance <= totalSegments[0]) {
      const t = pulseDistance / totalSegments[0];
      groundPulse = {
        x: event0.x + (event1.x - event0.x) * t,
        y: event0.y + (event1.y - event0.y) * t
      };
    } else {
      pulseDistance -= totalSegments[0];
      const t = pulseDistance / totalSegments[1];
      groundPulse = {
        x: event1.x + (event2.x - event1.x) * t,
        y: event1.y + (event2.y - event1.y) * t
      };
    }
    drawGlow(ctx, groundPulse.x, groundPulse.y, 26, 'rgba(255,209,102,1)');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(groundPulse.x, groundPulse.y, 6, 0, Math.PI * 2);
    ctx.fill();

    primaryOutput.textContent = `${beta.toFixed(2)} c`;
    readout.textContent = `β = ${beta.toFixed(2)} · γ = ${gamma.toFixed(3)}`;
    secondaryReadout.textContent = copy(
      `One ship half-tick is Δτ = L0/c; the ground assigns Δt = ${gamma.toFixed(3)} L0/c`,
      `飞船系半个滴答是 Δτ = L0/c；地面系对应 Δt = ${gamma.toFixed(3)} L0/c`
    );
    const bounceIndex = Math.floor(elapsed / (period / 2));
    if (soundEnabled && bounceIndex !== lastSound) {
      PhysicsUI.playTone(320 + beta * 260, 0.07, 0.018, 'triangle');
      lastSound = bounceIndex;
    }
  }

  function random() {
    quantum.seed = (quantum.seed * 1664525 + 1013904223) >>> 0;
    return quantum.seed / 0x100000000;
  }

  // Builds a cumulative intensity profile for the current slit geometry so hits
  // can be drawn by inverse-transform sampling instead of rejection sampling.
  function quantumProfile(height) {
    const separation = Number(primary.value);
    const wavelength = Number(secondary.value);
    const bins = 240;
    const weights = new Float64Array(bins);
    let total = 0;
    for (let index = 0; index < bins; index++) {
      const normalized = (index / (bins - 1)) * 2 - 1;
      total += Math.exp(-normalized * normalized * 3.2) *
        Math.pow(Math.cos(normalized * separation * 12 / wavelength), 2);
      weights[index] = total;
    }
    return { bins, height, total, weights };
  }

  function sampleQuantumHit(profile) {
    const target = random() * profile.total;
    let low = 0;
    let high = profile.bins - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (profile.weights[mid] < target) low = mid + 1;
      else high = mid;
    }
    const normalized = (low / (profile.bins - 1)) * 2 - 1;
    return profile.height * (0.5 + normalized * 0.45);
  }

  function resetQuantum() {
    quantum.seed = 0x51f15e;
    quantum.hits = [];
    elapsed = 0;
  }

  function drawQuantumLab(ctx, width, height) {
    if (playing) {
      const profile = quantumProfile(height);
      const hitCount = Math.max(1, Math.round(Number(rate.value)));
      for (let index = 0; index < hitCount; index++) {
        quantum.hits.push({
          y: sampleQuantumHit(profile),
          alpha: 0.42 + random() * 0.58
        });
      }
      if (quantum.hits.length > 1300) quantum.hits.splice(0, quantum.hits.length - 1300);
    }
    clear(ctx, width, height);
    const barrierX = width * 0.35;
    const screenX = width * 0.83;
    const centerY = height * 0.5;
    const slitDistance = Number(primary.value) * 16;
    const slitSize = 14;

    ctx.strokeStyle = '#e8ecff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(barrierX, 0);
    ctx.lineTo(barrierX, centerY - slitDistance - slitSize);
    ctx.moveTo(barrierX, centerY - slitDistance + slitSize);
    ctx.lineTo(barrierX, centerY + slitDistance - slitSize);
    ctx.moveTo(barrierX, centerY + slitDistance + slitSize);
    ctx.lineTo(barrierX, height);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(238,242,255,.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX, 16);
    ctx.lineTo(screenX, height - 16);
    ctx.stroke();

    const wavelength = Number(secondary.value);
    ctx.strokeStyle = 'rgba(139,114,255,.26)';
    ctx.lineWidth = 1.3;
    for (let x = wavelength * 10; x < barrierX; x += wavelength * 10) {
      ctx.beginPath();
      ctx.arc(0, centerY, (x + elapsed * 38) % barrierX, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#7c5cff';
    quantum.hits.forEach(hit => {
      ctx.globalAlpha = hit.alpha;
      ctx.fillRect(screenX - 4 + random() * 8, hit.y, 2.2, 2.2);
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(139,114,255,.28)';
    for (let y = 0; y < height; y += 4) {
      const normalized = (y - centerY) / (height * 0.45);
      const envelope = Math.exp(-normalized * normalized * 3.2);
      const interference = Math.pow(Math.cos(normalized * Number(primary.value) * 12 / wavelength), 2);
      ctx.fillRect(screenX + 10, y, interference * envelope * (width - screenX - 28), 2.2);
    }

    primaryOutput.textContent = `${Number(primary.value).toFixed(1)} ×`;
    secondaryOutput.textContent = `${Number(secondary.value).toFixed(1)} ×`;
    readout.textContent = `${quantum.hits.length} ${PhysicsUI.language === 'zh-CN' ? '次探测' : 'detections'}`;
    secondaryReadout.textContent = PhysicsUI.language === 'zh-CN'
      ? '单次落点不可预测；大量事件显现干涉概率分布'
      : 'Individual hits are unpredictable; the interference distribution emerges in aggregate';
    if (soundEnabled && quantum.hits.length && elapsed - lastSound > 0.12) {
      const latest = quantum.hits.at(-1);
      PhysicsUI.playTone(220 + (1 - latest.y / height) * 540, 0.035, 0.01, 'sine');
      lastSound = elapsed;
    }
  }

  function updateButtonCopy() {
    toggle.textContent = PhysicsUI.language === 'zh-CN'
      ? (playing ? '暂停实验' : '继续实验')
      : (playing ? 'Pause experiment' : 'Resume experiment');
    reset.textContent = PhysicsUI.language === 'zh-CN' ? '重置' : 'Reset';
    audioToggle.textContent = PhysicsUI.language === 'zh-CN'
      ? (soundEnabled ? '关闭声音映射' : '开启声音映射')
      : (soundEnabled ? 'Mute sonification' : 'Enable sonification');
    audioToggle.setAttribute('aria-pressed', String(soundEnabled));
  }

  const physicsLabsDebug = window.__physicsLabsDebug || (window.__physicsLabsDebug = {});
  Object.assign(physicsLabsDebug, {
    computeRelativityHeroGeometry,
    updateRelativityGeometry
  });
  if (topic === 'relativity') {
    const relativityDebug = window.__relativityDebug || (window.__relativityDebug = {});
    relativityDebug.computeHeroGeometry = computeRelativityHeroGeometry;
  }

  function resetLab() {
    if (topic === 'newtonian') resetOrbit();
    if (topic === 'quantum') resetQuantum();
    if (topic === 'relativity') elapsed = 0;
    lastSound = -1;
    render(0);
  }

  function render(delta) {
    const hero = context.get(heroCanvas);
    const lab = context.get(labCanvas);
    if (topic === 'newtonian') {
      drawNewtonHero(hero.ctx, hero.width, hero.height, elapsed);
      drawNewtonLab(lab.ctx, lab.width, lab.height, delta);
    }
    if (topic === 'relativity') {
      drawRelativityHero(hero.ctx, hero.width, hero.height, elapsed);
      drawRelativityLab(lab.ctx, lab.width, lab.height);
    }
    if (topic === 'quantum') {
      drawQuantumHero(hero.ctx, hero.width, hero.height, elapsed);
      drawQuantumLab(lab.ctx, lab.width, lab.height);
    }
  }

  function frame(now) {
    const delta = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    if (playing && !PhysicsUI.motionPaused()) elapsed += delta;
    render(delta);
    frameHandle = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (frameHandle) return;
    lastTime = performance.now();
    frameHandle = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (!frameHandle) return;
    cancelAnimationFrame(frameHandle);
    frameHandle = 0;
    render(0);
  }

  canvases.forEach(resizeCanvas);
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => resizeCanvas(entry.target));
    render(0);
  });
  canvases.forEach(canvas => observer.observe(canvas));

  [primary, secondary, rate].filter(Boolean).forEach(control => {
    control.addEventListener('input', () => {
      if (topic === 'newtonian') resetOrbit();
      if (topic === 'quantum') resetQuantum();
      render(0);
    });
  });

  toggle.addEventListener('click', () => {
    playing = !playing;
    // Resuming the experiment implies the visitor wants to see it move.
    if (playing) PhysicsUI.requestMotion();
    updateButtonCopy();
    render(0);
  });
  reset.addEventListener('click', resetLab);
  audioToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) PhysicsUI.playTone(440, 0.09, 0.02);
    updateButtonCopy();
  });
  document.addEventListener('physics-language', () => {
    updateButtonCopy();
    render(0);
  });
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) stopLoop();
    else startLoop();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (!PhysicsUI.motionPaused()) startLoop();
  });

  resetLab();
  updateButtonCopy();
  if (PhysicsUI.motionPaused()) render(0);
  else startLoop();
})();
