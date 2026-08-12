(() => {
  if (document.body.dataset.topic !== 'relativity') return;

  const particleButtons = [...document.querySelectorAll('[data-particle]')];
  const presetButtons = [...document.querySelectorAll('[data-preset-mev]')];
  const energySlider = document.getElementById('energySlider');
  const energyValue = document.getElementById('energyValue');
  const restEnergyValue = document.getElementById('restEnergyValue');
  const energyGamma = document.getElementById('energyGamma');
  const energyBeta = document.getElementById('energyBeta');
  const energyMomentum = document.getElementById('energyMomentum');
  const energyInterpretation = document.getElementById('energyInterpretation');
  const restEnergyBar = document.getElementById('restEnergyBar');
  const kineticEnergyBar = document.getElementById('kineticEnergyBar');

  const jetBetaControl = document.getElementById('jetBetaControl');
  const jetAngleControl = document.getElementById('jetAngleControl');
  const jetBetaOutput = document.getElementById('jetBetaOutput');
  const jetAngleOutput = document.getElementById('jetAngleOutput');
  const jetGamma = document.getElementById('jetGamma');
  const jetDoppler = document.getElementById('jetDoppler');
  const jetApparent = document.getElementById('jetApparent');
  const jetArrivalGap = document.getElementById('jetArrivalGap');
  const jetApproachBrightness = document.getElementById('jetApproachBrightness');
  const jetRecedeBrightness = document.getElementById('jetRecedeBrightness');
  const jetBrightnessNote = document.getElementById('jetBrightnessNote');
  const jetCausalityNote = document.getElementById('jetCausalityNote');

  const jetDiagram = document.getElementById('jetDiagram');
  const jetEventA = document.getElementById('jetEventA');
  const jetEventB = document.getElementById('jetEventB');
  const jetEventALabel = document.getElementById('jetEventALabel');
  const jetEventBLabel = document.getElementById('jetEventBLabel');
  const jetPhotonA = document.getElementById('jetPhotonA');
  const jetPhotonB = document.getElementById('jetPhotonB');
  const jetApproachBlob = document.getElementById('jetApproachBlob');
  const jetRecedeBlob = document.getElementById('jetRecedeBlob');
  const skyEventA = document.getElementById('skyEventA');
  const skyEventB = document.getElementById('skyEventB');
  const skyCurrent = document.getElementById('skyCurrent');
  const jetApproachAxis = document.getElementById('jetApproachAxis');
  const jetRecedeAxis = document.getElementById('jetRecedeAxis');
  const topicIndex = document.querySelector('.topic-index');
  const topicIndexAnchors = [...topicIndex.querySelectorAll('a[href^="#"]')];

  const particles = {
    electron: { restMeV: 0.51099895 },
    proton: { restMeV: 938.27208816 }
  };

  const state = {
    particle: 'electron',
    jetPhase: 0,
    frameHandle: 0,
    lastTime: performance.now()
  };

  function isZh() {
    return window.PhysicsUI?.language === 'zh-CN';
  }

  function formatEnergyMeV(value) {
    if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e8 ? 1 : 3).replace(/\.?0+$/, '')} TeV`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e5 ? 1 : 3).replace(/\.?0+$/, '')} GeV`;
    if (value >= 1) return `${value.toFixed(value >= 100 ? 1 : 3).replace(/\.?0+$/, '')} MeV`;
    if (value >= 1e-3) return `${(value * 1e3).toFixed(value >= 0.1 ? 1 : 3).replace(/\.?0+$/, '')} keV`;
    return `${(value * 1e6).toFixed(value >= 1e-4 ? 1 : 3).replace(/\.?0+$/, '')} eV`;
  }

  function formatMomentumMeV(value) {
    if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e8 ? 1 : 3).replace(/\.?0+$/, '')} TeV/c`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e5 ? 1 : 3).replace(/\.?0+$/, '')} GeV/c`;
    return `${value.toFixed(value >= 100 ? 1 : 3).replace(/\.?0+$/, '')} MeV/c`;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function setParticle(nextParticle) {
    state.particle = nextParticle in particles ? nextParticle : 'electron';
    particleButtons.forEach(button => {
      const active = button.dataset.particle === state.particle;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderEnergy();
  }

  function renderEnergy() {
    const particle = particles[state.particle];
    const kineticMeV = 10 ** Number(energySlider.value);
    const totalMeV = kineticMeV + particle.restMeV;
    const gamma = totalMeV / particle.restMeV;
    const beta = Math.sqrt(1 - 1 / (gamma * gamma));
    const momentumMeV = Math.sqrt(Math.max(0, totalMeV * totalMeV - particle.restMeV * particle.restMeV));

    const kineticFraction = kineticMeV / totalMeV;
    const restFraction = particle.restMeV / totalMeV;

    energyValue.textContent = formatEnergyMeV(kineticMeV);
    restEnergyValue.textContent = formatEnergyMeV(particle.restMeV);
    energyGamma.textContent = gamma.toFixed(3);
    energyBeta.textContent = beta.toFixed(4);
    energyMomentum.textContent = formatMomentumMeV(momentumMeV);
    restEnergyBar.style.width = `${Math.max(2, restFraction * 100)}%`;
    kineticEnergyBar.style.width = `${Math.max(2, kineticFraction * 100)}%`;

    const particleName = isZh()
      ? (state.particle === 'electron' ? '电子' : '质子')
      : state.particle;
    let interpretation = '';
    if (beta < 0.1) {
      interpretation = isZh()
        ? `${particleName}在这个能量上仍处于经典低速极限，相对论修正极小。`
        : `At this energy the ${particleName} is still deep in the low-speed limit, so relativistic corrections are tiny.`;
    } else if (kineticMeV < 0.1 * particle.restMeV) {
      interpretation = isZh()
        ? `${particleName}已经不能完全忽略相对论修正，但牛顿近似仍抓住大体趋势。`
        : `The ${particleName} has entered the regime where relativistic corrections matter, although Newtonian intuition still captures the broad trend.`;
    } else if (kineticMeV < particle.restMeV) {
      interpretation = isZh()
        ? `${particleName}已明显进入相对论区：K 已经不再远小于 mc²。`
        : `This ${particleName} is distinctly relativistic: K is no longer negligible compared with mc².`;
    } else {
      interpretation = isZh()
        ? `${particleName}已经是强相对论性的：总能量主要由动能主导，β 非常接近 1。`
        : `This ${particleName} is strongly relativistic: kinetic energy dominates the total energy and β sits very close to 1.`;
    }
    energyInterpretation.textContent = interpretation;
  }

  function setPoint(element, x, y) {
    element.setAttribute('cx', x.toFixed(2));
    element.setAttribute('cy', y.toFixed(2));
  }

  function setLine(element, x1, y1, x2, y2) {
    element.setAttribute('x1', x1.toFixed(2));
    element.setAttribute('y1', y1.toFixed(2));
    element.setAttribute('x2', x2.toFixed(2));
    element.setAttribute('y2', y2.toFixed(2));
  }

  function setLabel(element, x, y, dx, dy, bounds) {
    element.setAttribute('x', clamp(x + dx, bounds.left, bounds.right).toFixed(2));
    element.setAttribute('y', clamp(y + dy, bounds.top, bounds.bottom).toFixed(2));
  }

  function computeJetModel(beta, thetaDeg, phase = state.jetPhase) {
    const theta = thetaDeg * Math.PI / 180;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const arrivalFactor = 1 - beta * cosTheta;
    const dopplerApproach = 1 / (gamma * arrivalFactor);
    const dopplerRecede = 1 / (gamma * (1 + beta * cosTheta));
    const betaApp = beta * sinTheta / arrivalFactor;
    const beamingRatio = Math.pow(dopplerApproach / dopplerRecede, 3);

    const scene = {
      coreX: 140,
      coreY: 124,
      lowerLeft: 84,
      lowerRight: 636,
      lowerY: 294,
      observerX: 636,
      observerY: 124,
      upperBottom: 228,
      upperLeft: 18,
      upperRight: 702,
      upperTop: 18
    };
    const axis = { x: cosTheta, y: -sinTheta };
    const emissionGap = 1;
    const emissionTimeA = 1.18;
    const eventDistanceA = beta * emissionTimeA;
    const eventDistanceB = beta * (emissionTimeA + emissionGap);
    const approachBlobDistance = beta * (0.24 + phase * (emissionTimeA + emissionGap + 0.26));
    const recedeBlobDistance = beta * (0.24 + phase * 1.1);
    const approachRange = Math.max(eventDistanceB + 0.18, approachBlobDistance + 0.12);
    const recedeRange = Math.max(0.72, recedeBlobDistance + 0.12);

    const upwardRoom = (scene.coreY - scene.upperTop - 26) / Math.max(0.08, sinTheta);
    const downwardRoom = (scene.upperBottom - scene.coreY - 26) / Math.max(0.08, sinTheta);
    const rightRoom = (scene.upperRight - scene.coreX - 34) / Math.max(0.18, cosTheta);
    const leftRoom = (scene.coreX - scene.upperLeft - 34) / Math.max(0.18, cosTheta);
    const axisScale = Math.min(
      165,
      Math.max(52, Math.min(upwardRoom / approachRange, rightRoom / approachRange, downwardRoom / recedeRange, leftRoom / recedeRange))
    );

    const pointAlong = distance => ({
      x: scene.coreX + axis.x * distance * axisScale,
      y: scene.coreY + axis.y * distance * axisScale
    });
    const pointReceding = distance => ({
      x: scene.coreX - axis.x * distance * axisScale,
      y: scene.coreY - axis.y * distance * axisScale
    });

    const eventA = pointAlong(eventDistanceA);
    const eventB = pointAlong(eventDistanceB);
    const approachBlob = pointAlong(approachBlobDistance);
    const recedeBlob = pointReceding(recedeBlobDistance);
    const approachAxis = pointAlong(approachRange);
    const recedeAxis = pointReceding(recedeRange);

    const skyMargin = 28;
    const skyScale = Math.min(118, (scene.lowerRight - scene.lowerLeft - skyMargin * 2) / Math.max(0.75, betaApp));
    const skyA = scene.lowerLeft + skyMargin;
    const skyB = skyA + betaApp * skyScale;
    const skyCurrentX = clamp(skyA + phase * betaApp * skyScale, skyA, scene.lowerRight - skyMargin);

    return {
      arrivalFactor,
      axisScale,
      beamingRatio,
      betaApp,
      dopplerApproach,
      dopplerRecede,
      eventA,
      eventB,
      gamma,
      scene,
      skyA,
      skyB,
      skyCurrentX,
      theta,
      thetaDeg,
      upperAxis: { approach: approachAxis, recede: recedeAxis },
      upperBlobs: { approach: approachBlob, recede: recedeBlob }
    };
  }

  function renderJetGeometry() {
    const beta = Number(jetBetaControl.value);
    const model = computeJetModel(beta, Number(jetAngleControl.value));
    const {
      arrivalFactor,
      beamingRatio,
      betaApp,
      dopplerApproach,
      gamma,
      scene,
      skyA,
      skyB,
      skyCurrentX,
      thetaDeg,
      upperAxis,
      upperBlobs,
      eventA,
      eventB
    } = model;

    jetBetaOutput.textContent = `${beta.toFixed(3)} c`;
    jetAngleOutput.textContent = `${thetaDeg}\u00B0`;
    jetGamma.textContent = gamma.toFixed(3);
    jetDoppler.textContent = dopplerApproach.toFixed(3);
    jetApparent.textContent = `${betaApp.toFixed(2)} c`;
    jetArrivalGap.textContent = `${arrivalFactor.toFixed(3)} \u00D7 \u0394t_emit`;

    const normalizedApproach = 100;
    const normalizedRecede = Math.max(2, 100 / Math.max(1, beamingRatio));
    jetApproachBrightness.style.width = `${normalizedApproach}%`;
    jetRecedeBrightness.style.width = `${normalizedRecede}%`;
    jetBrightnessNote.textContent = isZh()
      ? `亮度条采用示意性的 I \u221D \u03B4\u00B3；当前接近端与远离端的比值约为 ${beamingRatio.toFixed(1)}:1。`
      : `Brightness bars use the schematic scaling I \u221D \u03B4\u00B3; the approaching-to-receding contrast here is about ${beamingRatio.toFixed(1)}:1.`;
    jetCausalityNote.textContent = betaApp > 1
      ? (isZh()
        ? '表观横向速度可以超过 c，因为第二个光子出发时离观察者更近，压缩了到达时间间隔；每个局域光信号本身仍以 c 传播。'
        : 'The apparent transverse speed can exceed c because the second photon starts closer to the observer, shrinking the arrival interval; each local light signal still propagates at c.')
      : (isZh()
        ? '在这个速度与视角下，投影效应还不足以把表观横向速度推到 c 以上。'
        : 'At this speed and viewing angle, projection does not compress the arrival interval enough to push the apparent transverse speed above c.');
    setPoint(jetEventA, eventA.x, eventA.y);
    setPoint(jetEventB, eventB.x, eventB.y);
    setLine(jetPhotonA, eventA.x, eventA.y, scene.observerX, scene.observerY);
    setLine(jetPhotonB, eventB.x, eventB.y, scene.observerX, scene.observerY);
    setLabel(jetEventALabel, eventA.x, eventA.y, 12, -12, {
      bottom: scene.upperBottom - 10,
      left: scene.upperLeft + 12,
      right: scene.upperRight - 12,
      top: scene.upperTop + 12
    });
    setLabel(jetEventBLabel, eventB.x, eventB.y, 12, -12, {
      bottom: scene.upperBottom - 10,
      left: scene.upperLeft + 12,
      right: scene.upperRight - 12,
      top: scene.upperTop + 12
    });

    setPoint(skyEventA, skyA, scene.lowerY);
    setPoint(skyEventB, skyB, scene.lowerY);
    setPoint(skyCurrent, skyCurrentX, scene.lowerY);
    setPoint(jetApproachBlob, upperBlobs.approach.x, upperBlobs.approach.y);
    setPoint(jetRecedeBlob, upperBlobs.recede.x, upperBlobs.recede.y);

    jetApproachAxis.setAttribute('x2', upperAxis.approach.x.toFixed(2));
    jetApproachAxis.setAttribute('y2', upperAxis.approach.y.toFixed(2));
    jetRecedeAxis.setAttribute('x2', upperAxis.recede.x.toFixed(2));
    jetRecedeAxis.setAttribute('y2', upperAxis.recede.y.toFixed(2));
    jetDiagram.dataset.betaApp = betaApp.toFixed(3);
    jetDiagram.dataset.arrivalFactor = arrivalFactor.toFixed(3);
  }

  function frame(now) {
    const delta = Math.min(0.04, Math.max(0, (now - state.lastTime) / 1000));
    state.lastTime = now;
    state.jetPhase = (state.jetPhase + delta * 0.21) % 1;
    renderJetGeometry();
    state.frameHandle = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (state.frameHandle || window.PhysicsUI.motionPaused()) return;
    state.lastTime = performance.now();
    state.frameHandle = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (!state.frameHandle) return;
    cancelAnimationFrame(state.frameHandle);
    state.frameHandle = 0;
    renderJetGeometry();
  }

  window.__relativityDebug = {
    computeJetModel,
    formatEnergyMeV,
    formatMomentumMeV,
    renderEnergy,
    renderJetGeometry,
    setParticle,
    startLoop,
    stopLoop
  };

  particleButtons.forEach(button => {
    button.addEventListener('click', () => setParticle(button.dataset.particle));
  });
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      setParticle(button.dataset.presetParticle);
      energySlider.value = button.dataset.presetMev;
      renderEnergy();
    });
  });
  energySlider.addEventListener('input', renderEnergy);
  topicIndexAnchors.forEach(anchor => {
    anchor.addEventListener('focus', () => {
      anchor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  });

  [jetBetaControl, jetAngleControl].forEach(control => {
    control.addEventListener('input', renderJetGeometry);
  });

  document.addEventListener('physics-language', () => {
    renderEnergy();
    renderJetGeometry();
  });
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) stopLoop();
    else startLoop();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  setParticle('electron');
  renderJetGeometry();
  if (!window.PhysicsUI.motionPaused()) startLoop();
})();
