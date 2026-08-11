/* Deep-dive instruments for the astrophysics guide.
   Five independent canvases, each pausable and complete when static:
   1. collapse   - why rotating clouds flatten into disks
   2. evolution  - stellar life tracks by initial mass
   3. limits     - Chandrasekhar / TOV / Eddington ceilings
   4. candles    - why certain sources have knowable luminosity
   5. black hole - a staged core-collapse branch with optional disk and jet */
(() => {
  const scenes = new Map();
  let frameHandle = 0;
  let lastTime = performance.now();

  function setup(id, draw, options = {}) {
    const canvas = document.getElementById(id);
    const scene = {
      canvas,
      ctx: canvas.getContext('2d'),
      draw,
      elapsed: 0,
      height: 0,
      playing: true,
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

  function glow(ctx, x, y, radius, rgb) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb},.85)`);
    gradient.addColorStop(0.35, `rgba(${rgb},.25)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function label(ctx, text, x, y, color = '#aeb8d8', size = 11) {
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(text, x, y);
  }

  const zh = () => PhysicsUI.language === 'zh-CN';

  /* ---------------------------------------------------------- 1. collapse --
     A rotating cloud cannot lose angular momentum by radiating, but it can
     lose kinetic energy through inelastic collisions. Motion along the spin
     axis is unopposed and collapses; motion in the plane is held up by the
     centrifugal barrier. A disk is what remains. */
  const collapse = {
    particles: [],
    seed: 0x9e3779b9
  };

  function random() {
    collapse.seed = (collapse.seed * 1664525 + 1013904223) >>> 0;
    return collapse.seed / 0x100000000;
  }

  function seedCloud() {
    collapse.particles = [];
    for (let index = 0; index < 420; index++) {
      // Uniform inside a sphere, then given a common sense of rotation.
      let x;
      let y;
      let z;
      do {
        x = random() * 2 - 1;
        y = random() * 2 - 1;
        z = random() * 2 - 1;
      } while (x * x + y * y + z * z > 1);
      collapse.particles.push({ x, y, z, phase: random() * Math.PI * 2, radius: Math.hypot(x, z) });
    }
  }

  function drawCollapse(scene) {
    const { ctx, width, height } = scene;
    const progress = scene.progress;
    clear(ctx, width, height);
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width, height) * 0.36;

    // Spin axis stays fixed; only the vertical extent contracts.
    ctx.strokeStyle = 'rgba(174,184,216,.32)';
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - scale * 1.25);
    ctx.lineTo(cx, cy + scale * 1.25);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, zh() ? '自转轴' : 'spin axis', cx + 8, cy - scale * 1.25 + 12, 'rgba(174,184,216,.75)');

    const flatten = 1 - progress * 0.94;
    for (const particle of collapse.particles) {
      const angle = particle.phase + scene.elapsed * (0.35 + 0.5 / Math.max(0.22, particle.radius)) * progress;
      const radius = particle.radius * (1 - progress * 0.12);
      const px = cx + Math.cos(angle) * radius * scale;
      const py = cy + Math.sin(angle) * radius * scale * 0.42 + particle.y * scale * flatten;
      const depth = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(angle));
      ctx.fillStyle = `rgba(0,212,255,${0.14 + depth * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    glow(ctx, cx, cy, 46 + progress * 34, '255,209,102');

    const caption = zh()
      ? ['塌缩前：球形云，净自转很小', '塌缩中：垂直方向无支撑，先被压扁', '塌缩后：只剩下薄盘']
      : ['Before: round cloud, small net spin', 'Collapsing: vertical motion is unopposed', 'After: a thin disk remains'];
    const stage = progress < 0.2 ? 0 : progress < 0.75 ? 1 : 2;
    label(ctx, caption[stage], 16, height - 16, '#e8ecff', 12);
  }

  /* --------------------------------------------------------- 2. evolution --
     Stellar fate is set almost entirely by initial mass. The track shows
     which fusion stages ignite, what holds the core up, and what is left. */
  const stages = [
    {
      max: 0.08,
      key: 'brown',
      color: '#8a6a4f',
      rgb: '138,106,79',
      en: {
        name: 'Brown dwarf', life: 'never leaves', support: 'Electron degeneracy pressure',
        burn: 'Deuterium only, briefly. Hydrogen fusion never ignites.',
        end: 'Cools forever as a fading substellar object.',
        makes: 'No new elements released.'
      },
      zh: {
        name: '褐矮星', life: '始终未点燃', support: '电子简并压',
        burn: '仅短暂燃烧氘，氢聚变从未点燃。',
        end: '作为逐渐变暗的亚恒星天体持续冷却。',
        makes: '不释放新元素。'
      }
    },
    {
      max: 0.5,
      key: 'red-dwarf',
      color: '#ff7a5c',
      rgb: '255,122,92',
      en: {
        name: 'Red dwarf', life: '> 10¹² yr', support: 'Gas pressure, fully convective',
        burn: 'Proton-proton chain, hydrogen to helium.',
        end: 'Becomes a helium white dwarf. None has had time to do so yet.',
        makes: 'Helium, retained rather than expelled.'
      },
      zh: {
        name: '红矮星', life: '> 10¹² 年', support: '气体压强，整体对流',
        burn: '质子-质子链，氢聚变为氦。',
        end: '最终成为氦白矮星；宇宙年龄内尚无一颗完成。',
        makes: '氦，且基本被保留而非抛出。'
      }
    },
    {
      max: 8,
      key: 'sun-like',
      color: '#ffd166',
      rgb: '255,209,102',
      en: {
        name: 'Sun-like star', life: '10¹⁰ yr', support: 'Gas pressure, then electron degeneracy',
        burn: 'Hydrogen, then helium in a core flash; carbon never ignites.',
        end: 'Planetary nebula, leaving a carbon-oxygen white dwarf.',
        makes: 'Carbon, nitrogen, and s-process elements dredged to the surface.'
      },
      zh: {
        name: '类太阳恒星', life: '10¹⁰ 年', support: '气体压强，随后为电子简并压',
        burn: '先烧氢，随后氦闪点燃氦；碳始终未点燃。',
        end: '抛出行星状星云，留下碳氧白矮星。',
        makes: '碳、氮，以及被上翻到表面的 s 过程元素。'
      }
    },
    {
      max: 25,
      key: 'massive',
      color: '#7dd3ff',
      rgb: '125,211,255',
      en: {
        name: 'Massive star', life: '10⁷ yr', support: 'Radiation pressure grows important',
        burn: 'Onion shells: H, He, C, Ne, O, Si. Silicon burning lasts about a day.',
        end: 'Iron core exceeds Chandrasekhar mass, collapses, rebounds as a core-collapse supernova, leaving a neutron star.',
        makes: 'Oxygen, neon, magnesium, silicon, and iron-peak elements.'
      },
      zh: {
        name: '大质量恒星', life: '10⁷ 年', support: '辐射压变得重要',
        burn: '洋葱壳结构：氢、氦、碳、氖、氧、硅；硅燃烧仅约一天。',
        end: '铁核超过钱德拉塞卡质量而塌缩，反弹形成核塌缩超新星，留下中子星。',
        makes: '氧、氖、镁、硅以及铁峰元素。'
      }
    },
    {
      max: 300,
      key: 'very-massive',
      color: '#c77dff',
      rgb: '199,125,255',
      en: {
        name: 'Very massive star', life: '10⁶ yr', support: 'Radiation pressure dominates; near the Eddington ceiling',
        burn: 'Same shells, far hotter, with heavy mass loss through radiation-driven winds.',
        end: 'Collapse can exceed the neutron-star limit and form a black hole, sometimes with little visible explosion.',
        makes: 'Depends strongly on how much mass the winds removed first.'
      },
      zh: {
        name: '极大质量恒星', life: '10⁶ 年', support: '辐射压主导，接近爱丁顿上限',
        burn: '壳层结构相同但温度高得多，辐射驱动星风造成剧烈质量损失。',
        end: '塌缩可超过中子星极限而形成黑洞，有时几乎没有明显爆发。',
        makes: '强烈依赖此前星风带走了多少质量。'
      }
    }
  ];

  function stageForMass(mass) {
    return stages.find(stage => mass <= stage.max);
  }

  function drawEvolution(scene) {
    const { ctx, width, height } = scene;
    const mass = scene.mass;
    const stage = stageForMass(mass);
    clear(ctx, width, height, '#04060e');

    // Mass axis, logarithmic, with the four physical thresholds marked.
    const left = 54;
    const right = width - 24;
    const axisY = height - 46;
    const toX = value => left + (Math.log10(value) - Math.log10(0.02)) /
      (Math.log10(300) - Math.log10(0.02)) * (right - left);

    ctx.strokeStyle = 'rgba(174,184,216,.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, axisY);
    ctx.lineTo(right, axisY);
    ctx.stroke();

    for (const [value, text] of [[0.08, '0.08'], [0.5, '0.5'], [8, '8'], [25, '25'], [300, '300']]) {
      const x = toX(value);
      ctx.strokeStyle = 'rgba(174,184,216,.3)';
      ctx.beginPath();
      ctx.moveTo(x, axisY - 5);
      ctx.lineTo(x, axisY + 5);
      ctx.stroke();
      label(ctx, text, x - 8, axisY + 20, 'rgba(174,184,216,.8)', 10);
    }
    label(ctx, zh() ? '初始质量 (M☉)' : 'initial mass (M☉)', left, axisY + 36, '#aeb8d8', 11);

    // The star itself: radius and colour follow the selected mass.
    const cx = width * 0.5;
    const cy = height * 0.4;
    const radius = Math.max(14, Math.min(height * 0.24, 16 * Math.pow(mass, 0.42)));
    glow(ctx, cx, cy, radius * 2.4 * (1 + 0.03 * Math.sin(scene.elapsed * 1.6)), stage.rgb);
    ctx.fillStyle = stage.color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    const marker = toX(mass);
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marker, axisY - 13);
    ctx.lineTo(marker, axisY + 13);
    ctx.stroke();

    const copy = zh() ? stage.zh : stage.en;
    label(ctx, copy.name, 18, 28, '#e8ecff', 15);
    label(ctx, `${zh() ? '主序寿命' : 'main-sequence life'}: ${copy.life}`, 18, 48, '#aeb8d8', 11);
    label(ctx, `${zh() ? '支撑' : 'held up by'}: ${copy.support}`, 18, 66, '#aeb8d8', 11);
  }

  /* ------------------------------------------------------------ 3. limits --
     Each ceiling is a balance between an outward pressure that scales one way
     with radius and an inward pull that scales another. */
  function drawLimits(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#04060e');
    const mass = scene.mass;
    const cx = width * 0.5;
    const cy = height * 0.46;

    // Degenerate radius shrinks as mass rises, vanishing at the limit.
    const chandrasekhar = 1.4;
    const ratio = Math.min(0.995, mass / chandrasekhar);
    const radius = Math.max(6, height * 0.19 * Math.pow(1 - ratio * ratio * ratio, 0.34));

    const over = mass >= chandrasekhar;
    const rgb = over ? '255,107,157' : '126,232,197';
    glow(ctx, cx, cy, radius * 1.5, rgb);
    ctx.fillStyle = over ? '#ff6b9d' : '#7ee8c5';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Opposing arrows: gravity inward, degeneracy pressure outward.
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index++) {
      const angle = (index / 8) * Math.PI * 2;
      const ox = Math.cos(angle);
      const oy = Math.sin(angle);
      ctx.strokeStyle = 'rgba(255,209,102,.75)';
      ctx.beginPath();
      ctx.moveTo(cx + ox * (radius + 46), cy + oy * (radius + 46));
      ctx.lineTo(cx + ox * (radius + 12), cy + oy * (radius + 12));
      ctx.stroke();
      if (!over) {
        ctx.strokeStyle = 'rgba(0,212,255,.65)';
        ctx.beginPath();
        ctx.moveTo(cx + ox * (radius - 4), cy + oy * (radius - 4));
        ctx.lineTo(cx + ox * (radius + 8), cy + oy * (radius + 8));
        ctx.stroke();
      }
    }

    label(ctx, zh() ? '引力（向内）' : 'gravity (inward)', 18, 26, '#ffd166', 11);
    label(ctx, zh() ? '电子简并压（向外）' : 'electron degeneracy pressure (outward)', 18, 44, '#00d4ff', 11);
    const verdict = over
      ? (zh() ? '超过 1.4 M☉：简并压无法再增援，塌缩不可阻挡' : 'Above 1.4 M☉: degeneracy cannot keep up. Collapse continues.')
      : (zh() ? '低于 1.4 M☉：简并压与引力平衡，半径稳定' : 'Below 1.4 M☉: degeneracy balances gravity at a stable radius.');
    label(ctx, verdict, 18, height - 18, over ? '#ff6b9d' : '#7ee8c5', 12);
  }

  /* ----------------------------------------------------------- 4. candles --
     A standard candle is any source whose intrinsic luminosity can be inferred
     from something measurable that does not depend on distance. */
  function drawCandles(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#04060e');
    const baseline = height - 52;
    const left = 56;
    const right = width - 24;

    ctx.strokeStyle = 'rgba(174,184,216,.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, 20);
    ctx.lineTo(left, baseline);
    ctx.lineTo(right, baseline);
    ctx.stroke();

    // Period-luminosity relation: longer pulsation means a brighter Cepheid.
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = left; x <= right; x += 4) {
      const fraction = (x - left) / (right - left);
      const y = baseline - (0.18 + fraction * 0.66) * (baseline - 30);
      if (x === left) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const phase = (scene.elapsed * 0.5) % 1;
    const markerX = left + phase * (right - left);
    const markerY = baseline - (0.18 + phase * 0.66) * (baseline - 30);
    glow(ctx, markerX, markerY, 26, '255,209,102');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();

    label(ctx, zh() ? '光度' : 'luminosity', 12, 26, '#aeb8d8', 11);
    label(ctx, zh() ? '脉动周期（对数）' : 'pulsation period (log)', left, baseline + 26, '#aeb8d8', 11);
    label(
      ctx,
      zh() ? '周期可在本地测量，与距离无关，因此可反推真实光度'
        : 'Period is measurable locally and distance-independent, so it fixes the true luminosity.',
      left,
      baseline + 44,
      '#e8ecff',
      11
    );
  }

  /* ------------------------------------------------------- 5. black hole --
     A stage scrubber exposes the causal sequence rather than treating black-hole
     formation as one instantaneous explosion. Sizes and colors are schematic;
     the timing labels and branch conditions carry the physical constraints. */
  function drawBlackHole(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#03050c');
    const stage = scene.stage;
    const cx = width * 0.5;
    const cy = height * 0.49;
    const baseRadius = Math.min(width, height) * 0.31;
    const collapse = Math.max(0, Math.min(1, stage / 5));
    const radius = baseRadius * (1 - collapse * 0.78);

    // Onion-shell burning remains visible until implosion erases the stellar core.
    if (stage < 2.25) {
      const shells = [
        ['255,107,157', 1],
        ['255,209,102', 0.78],
        ['0,212,255', 0.55],
        ['238,242,255', 0.32]
      ];
      for (const [rgb, scale] of shells) {
        glow(ctx, cx, cy, radius * scale * 1.15, rgb);
        ctx.fillStyle = `rgba(${rgb},${0.18 + scale * 0.22})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      label(ctx, zh() ? '铁核' : 'iron core', cx - 18, cy + 4, '#eef2ff', 10);
    }

    // Infall vectors accelerate and tighten as the core approaches bounce.
    if (stage >= 0.75 && stage < 3.4) {
      const strength = Math.min(1, (stage - 0.75) / 1.5);
      ctx.strokeStyle = `rgba(255,209,102,${0.3 + strength * 0.55})`;
      ctx.lineWidth = 2;
      for (let index = 0; index < 14; index++) {
        const angle = index / 14 * Math.PI * 2 + scene.elapsed * 0.06;
        const outer = radius + 62 + (index % 3) * 11;
        const inner = Math.max(radius + 8, outer - 28 - strength * 20);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.lineTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.stroke();
      }
    }

    // The proto-neutron star and shock are distinct; the shock stalls instead of
    // being drawn as a guaranteed supernova.
    if (stage >= 1.6 && stage < 5.15) {
      const coreRadius = Math.max(11, baseRadius * (0.14 - Math.min(stage, 4.8) * 0.008));
      glow(ctx, cx, cy, coreRadius * 3.5, '0,212,255');
      ctx.fillStyle = '#d9fbff';
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      const bounce = Math.min(1, Math.max(0, stage - 1.6));
      const stalled = stage > 2.7 ? 0.15 * Math.sin(scene.elapsed * 1.4) : bounce;
      const shockRadius = baseRadius * (0.35 + bounce * 0.46 + stalled * 0.035);
      ctx.strokeStyle = stage > 2.7 ? 'rgba(255,107,157,.72)' : 'rgba(255,209,102,.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash(stage > 2.7 ? [7, 6] : []);
      ctx.beginPath();
      ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Neutrino energy leaves in every direction; dots are status cues, not
      // simulated neutrino trajectories.
      ctx.fillStyle = 'rgba(126,232,197,.72)';
      for (let index = 0; index < 18; index++) {
        const angle = index / 18 * Math.PI * 2;
        const distance = coreRadius * 2.2 + ((scene.elapsed * 26 + index * 17) % Math.max(40, shockRadius - coreRadius * 2));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Once the horizon appears, interior detail is intentionally hidden.
    if (stage >= 4.8) {
      const horizonProgress = Math.min(1, (stage - 4.8) / 0.55);
      const horizon = baseRadius * (0.08 + horizonProgress * 0.09);
      glow(ctx, cx, cy, horizon * 3.2, '124,92,255');
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx, cy, horizon, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(238,242,255,.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, horizon + 2, 0, Math.PI * 2);
      ctx.stroke();
      label(ctx, zh() ? '事件视界' : 'event horizon', cx + horizon + 10, cy - 4, '#eef2ff', 10);
    }

    // A disk and jets only appear when both stage and retained angular momentum
    // are high enough. Low-spin collapse remains almost spherical.
    if (stage >= 5.35 && scene.spin > 0.42) {
      const diskStrength = Math.min(1, (stage - 5.35) / 0.65) * (scene.spin - 0.42) / 0.58;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.12);
      ctx.strokeStyle = `rgba(255,209,102,${0.35 + diskStrength * 0.6})`;
      ctx.lineWidth = 4;
      for (let ring = 0; ring < 5; ring++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * (0.34 + ring * 0.1), baseRadius * (0.035 + ring * 0.011), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      if (scene.spin > 0.72) {
        ctx.strokeStyle = `rgba(0,212,255,${(scene.spin - 0.72) / 0.28})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - baseRadius * 0.12);
        ctx.lineTo(cx - baseRadius * 0.08, cy - baseRadius * 0.95);
        ctx.moveTo(cx, cy + baseRadius * 0.12);
        ctx.lineTo(cx + baseRadius * 0.08, cy + baseRadius * 0.95);
        ctx.stroke();
      }
    }

    const labels = [
      [zh() ? '洋葱壳层燃烧与铁核' : 'onion-shell burning + iron core', zh() ? '坍缩前' : 'before collapse'],
      [zh() ? '电子俘获与光致裂解' : 'electron capture + photodisintegration', '~0.1–0.3 s'],
      [zh() ? '核心反弹与激波发射' : 'core bounce + shock launch', zh() ? '毫秒至约 0.1 秒' : 'milliseconds to ~0.1 s'],
      [zh() ? '原中子星与停滞激波' : 'proto-neutron star + stalled shock', '~0.1–1 s'],
      [zh() ? '爆炸成功或继续吸积' : 'successful explosion or continued accretion', zh() ? '分支点' : 'branch point'],
      [zh() ? '事件视界形成' : 'event horizon forms', zh() ? '某些模型中反弹后约 0.6–1.3 秒' : '~0.6–1.3 s after bounce in some models'],
      [zh() ? '可选：盘、喷流与继续吸积' : 'optional disk, jet, and continued accretion', zh() ? '数秒及以后' : 'seconds and later']
    ];
    const active = labels[Math.min(6, Math.max(0, Math.round(stage)))];
    label(ctx, active[0], 18, 28, '#eef2ff', 12);
    label(ctx, active[1], 18, 47, '#aeb8d8', 10);
  }

  /* ------------------------------------------------------------ lifecycle */
  const collapseScene = setup('collapseCanvas', drawCollapse, { progress: 0.5 });
  const evolutionScene = setup('evolutionCanvas', drawEvolution, { mass: 1 });
  const limitsScene = setup('limitsCanvas', drawLimits, { mass: 1 });
  const candleScene = setup('candleCanvas', drawCandles);
  const blackHoleScene = setup('blackHoleCanvas', drawBlackHole, { stage: 3.2, spin: 0.55 });

  seedCloud();

  function renderAll(delta) {
    for (const scene of scenes.values()) {
      if (scene.playing && !PhysicsUI.motionPaused()) scene.elapsed += delta;
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
      const scene = [...scenes.values()].find(item => item.canvas === entry.target);
      resize(scene);
    }
    renderAll(0);
  });
  for (const scene of scenes.values()) {
    resize(scene);
    observer.observe(scene.canvas);
  }

  const collapseSlider = document.getElementById('collapseProgress');
  const collapseOutput = document.getElementById('collapseProgressOut');
  collapseSlider.addEventListener('input', () => {
    collapseScene.progress = Number(collapseSlider.value);
    collapseOutput.textContent = `${Math.round(collapseScene.progress * 100)}%`;
    renderAll(0);
  });

  const massSlider = document.getElementById('starMass');
  const massOutput = document.getElementById('starMassOut');
  const stageDetail = document.getElementById('stageDetail');

  function renderStageDetail() {
    const stage = stageForMass(evolutionScene.mass);
    const copy = zh() ? stage.zh : stage.en;
    massOutput.textContent = `${evolutionScene.mass.toFixed(2)} M☉`;
    stageDetail.innerHTML = '';
    const rows = [
      [zh() ? '核聚变阶段' : 'Fusion stages', copy.burn],
      [zh() ? '最终结局' : 'Final state', copy.end],
      [zh() ? '产生的元素' : 'Elements produced', copy.makes]
    ];
    for (const [term, description] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = description;
      stageDetail.append(dt, dd);
    }
  }

  massSlider.addEventListener('input', () => {
    evolutionScene.mass = Number(massSlider.value);
    renderStageDetail();
    renderAll(0);
  });

  const limitSlider = document.getElementById('limitMass');
  const limitOutput = document.getElementById('limitMassOut');
  limitSlider.addEventListener('input', () => {
    limitsScene.mass = Number(limitSlider.value);
    limitOutput.textContent = `${limitsScene.mass.toFixed(2)} M☉`;
    renderAll(0);
  });

  const blackHoleSlider = document.getElementById('blackHoleStage');
  const blackHoleStageOutput = document.getElementById('blackHoleStageOut');
  const blackHoleSpin = document.getElementById('blackHoleSpin');
  const blackHoleSpinOutput = document.getElementById('blackHoleSpinOut');
  const blackHoleReadout = document.getElementById('blackHoleReadout');
  const blackHoleTime = document.getElementById('blackHoleTime');

  function renderBlackHoleReadout() {
    const stage = Math.min(6, Math.max(0, Math.round(blackHoleScene.stage)));
    const rows = zh()
      ? [
          ['洋葱壳层燃烧与铁核', '塌缩前'],
          ['电子俘获与光致裂解', '约 0.1–0.3 秒'],
          ['核心反弹与激波发射', '毫秒至约 0.1 秒'],
          ['原中子星与停滞激波', '约 0.1–1 秒'],
          ['爆炸成功或继续吸积', '分支点'],
          ['事件视界形成', '某些模型中反弹后约 0.6–1.3 秒'],
          ['可选的盘与喷流', '数秒及以后']
        ]
      : [
          ['Onion-shell burning + iron core', 'before collapse'],
          ['Electron capture + photodisintegration', '~0.1–0.3 s'],
          ['Core bounce + shock launch', 'milliseconds to ~0.1 s'],
          ['Proto-neutron star + stalled shock', '~0.1–1 s'],
          ['Successful explosion or continued accretion', 'branch point'],
          ['Event horizon forms', '~0.6–1.3 s after bounce in some models'],
          ['Optional disk and jet', 'seconds and later']
        ];
    blackHoleReadout.textContent = rows[stage][0];
    blackHoleTime.textContent = rows[stage][1];
    blackHoleStageOutput.textContent = `${blackHoleScene.stage.toFixed(2)} / 6`;
    blackHoleSpinOutput.textContent = blackHoleScene.spin.toFixed(2);
  }

  blackHoleSlider.addEventListener('input', () => {
    blackHoleScene.stage = Number(blackHoleSlider.value);
    renderBlackHoleReadout();
    renderAll(0);
  });
  blackHoleSpin.addEventListener('input', () => {
    blackHoleScene.spin = Number(blackHoleSpin.value);
    renderBlackHoleReadout();
    renderAll(0);
  });

  document.addEventListener('physics-language', () => {
    renderStageDetail();
    renderBlackHoleReadout();
    renderAll(0);
  });
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused) stop();
    else start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!PhysicsUI.motionPaused()) start();
  });

  collapseScene.progress = Number(collapseSlider.value);
  collapseOutput.textContent = `${Math.round(collapseScene.progress * 100)}%`;
  evolutionScene.mass = Number(massSlider.value);
  limitsScene.mass = Number(limitSlider.value);
  limitOutput.textContent = `${limitsScene.mass.toFixed(2)} M☉`;
  blackHoleScene.stage = Number(blackHoleSlider.value);
  blackHoleScene.spin = Number(blackHoleSpin.value);
  renderStageDetail();
  renderBlackHoleReadout();

  if (PhysicsUI.motionPaused()) renderAll(0);
  else start();
})();
