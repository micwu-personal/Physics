/* Page-specific instruments for the astrophysics guide.
   Motion can stop entirely and every canvas still conveys the current state. */
(() => {
  const scenes = new Map();
  let frameHandle = 0;
  let lastTime = performance.now();

  const MCH = 1.44;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setup(id, draw, options = {}) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
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
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
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

  const rootStyle = getComputedStyle(document.documentElement);
  const palette = {
    paper: rootStyle.getPropertyValue('--paper').trim() || '#eef2ff',
    muted: rootStyle.getPropertyValue('--muted').trim() || '#aeb8d8',
    gold: rootStyle.getPropertyValue('--gold').trim() || '#ffd166',
    green: rootStyle.getPropertyValue('--green').trim() || '#7ee8c5',
    cyan: rootStyle.getPropertyValue('--cyan').trim() || '#00d4ff',
    pink: rootStyle.getPropertyValue('--pink').trim() || '#ff6b9d',
    violet: rootStyle.getPropertyValue('--violet').trim() || '#7c5cff',
    deep: rootStyle.getPropertyValue('--deep').trim() || '#090d1d'
  };

  function glow(ctx, x, y, radius, rgb) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb},.82)`);
    gradient.addColorStop(0.35, `rgba(${rgb},.22)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function label(ctx, text, x, y, color = palette.muted, size = 11, align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }

  function line(ctx, x1, y1, x2, y2, color, width = 1, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  const zh = () => PhysicsUI.language === 'zh-CN';

  /* ---------------------------------------------------------- 1. collapse -- */
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
    clear(ctx, width, height, '#050814');
    const cx = width * 0.5;
    const cy = height * 0.48;
    const scale = Math.min(width, height) * 0.33;

    line(ctx, cx, cy - scale * 1.2, cx, cy + scale * 1.2, 'rgba(174,184,216,.28)', 1, [5, 6]);
    label(ctx, zh() ? '自转轴' : 'spin axis', cx + 10, cy - scale * 1.12, 'rgba(174,184,216,.76)');

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

    glow(ctx, cx, cy, 44 + progress * 30, '255,209,102');

    const caption = zh()
      ? ['起初：球状云只有微弱净自转', '塌缩中：厚度先被抹平', '最后：只剩薄盘']
      : ['Before: round cloud, tiny net spin', 'During collapse: thickness disappears first', 'Afterward: a thin disk remains'];
    const stage = progress < 0.2 ? 0 : progress < 0.75 ? 1 : 2;
    label(ctx, caption[stage], 16, height - 18, '#e8ecff', 12);
  }

  function renderCollapseReadout() {
    const readout = document.getElementById('collapseReadout');
    if (!readout) return;
    const progress = collapseScene.progress;
    readout.textContent = zh()
      ? progress < 0.2
        ? '云仍接近球形；角动量很小，但没有消失。'
        : progress < 0.75
          ? '厚度正在快速减小，而半径只略有变化。'
          : '系统已经很薄；剩下的是带着保留下来的角动量的盘。'
      : progress < 0.2
        ? 'The cloud is still nearly round; the angular momentum is small, but it never vanished.'
        : progress < 0.75
          ? 'The thickness is collapsing quickly while the radius changes only modestly.'
          : 'The system is now thin: what remains is a disk carrying the angular momentum it kept.';
  }

  /* --------------------------------------------------------- 2. evolution -- */
  const stages = [
    {
      max: 0.08,
      color: palette.muted,
      rgb: '174,184,216',
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
      color: palette.pink,
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
      color: palette.gold,
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
      color: palette.cyan,
      rgb: '0,212,255',
      en: {
        name: 'Massive star', life: '10⁷ yr', support: 'Radiation pressure grows important',
        burn: 'Onion shells: H, He, C, Ne, O, Si. Silicon burning lasts about a day.',
        end: 'Iron core exceeds the electron-degeneracy limit and collapses, leaving a neutron star if it does not keep accreting.',
        makes: 'Oxygen, neon, magnesium, silicon, and iron-peak elements.'
      },
      zh: {
        name: '大质量恒星', life: '10⁷ 年', support: '辐射压变得重要',
        burn: '洋葱壳结构：氢、氦、碳、氖、氧、硅；硅燃烧只持续大约一天。',
        end: '铁核超过电子简并所能支撑的范围而塌缩；若后续吸积不过量，就能留下中子星。',
        makes: '氧、氖、镁、硅以及铁峰元素。'
      }
    },
    {
      max: 300,
      color: palette.violet,
      rgb: '124,92,255',
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

    const left = 54;
    const right = width - 24;
    const axisY = height - 46;
    const toX = value => left + (Math.log10(value) - Math.log10(0.02)) /
      (Math.log10(300) - Math.log10(0.02)) * (right - left);

    line(ctx, left, axisY, right, axisY, 'rgba(174,184,216,.35)');
    for (const [value, text] of [[0.08, '0.08'], [0.5, '0.5'], [8, '8'], [25, '25'], [300, '300']]) {
      const x = toX(value);
      line(ctx, x, axisY - 5, x, axisY + 5, 'rgba(174,184,216,.3)');
      label(ctx, text, x - 8, axisY + 20, 'rgba(174,184,216,.8)', 10);
    }
    label(ctx, zh() ? '初始质量 (M☉)' : 'initial mass (M☉)', left, axisY + 36, '#aeb8d8', 11);

    const cx = width * 0.5;
    const cy = height * 0.4;
    const radius = Math.max(14, Math.min(height * 0.24, 16 * Math.pow(mass, 0.42)));
    glow(ctx, cx, cy, radius * 2.4 * (1 + 0.03 * Math.sin(scene.elapsed * 1.6)), stage.rgb);
    ctx.fillStyle = stage.color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    const marker = toX(mass);
    line(ctx, marker, axisY - 13, marker, axisY + 13, stage.color, 2);

    const copy = zh() ? stage.zh : stage.en;
    label(ctx, copy.name, 18, 28, '#e8ecff', 15);
    label(ctx, `${zh() ? '主序寿命' : 'main-sequence life'}: ${copy.life}`, 18, 48, '#aeb8d8', 11);
    label(ctx, `${zh() ? '支撑' : 'held up by'}: ${copy.support}`, 18, 66, '#aeb8d8', 11);
  }

  /* ------------------------------------------------------------ 3. limits -- */
  function whiteDwarfRadiusKm(mass) {
    if (mass >= MCH) return 0;
    const term = Math.pow(MCH / mass, 2 / 3) - Math.pow(mass / MCH, 2 / 3);
    return 0.0112 * 695700 * Math.sqrt(Math.max(0, term));
  }

  function limitSnapshot(mass) {
    const ratio = clamp(mass / MCH, 0, 1.2);
    if (ratio < 0.42) {
      return zh()
        ? {
            state: '电子先填最低动量态。',
            pressure: '电子仍明显是非相对论的，因此压强随密度增长得很快。',
            quantum: '位置空间还比较宽，费米面只需伸到较低动量。',
            law: '此时近似遵循 P ∝ ρ^(5/3)。',
            bridge: '白矮星稳定，由电子简并压支撑；离中子星物理还很远。'
          }
        : {
            state: 'Electrons are filling the lowest momentum states first.',
            pressure: 'They are still clearly non-relativistic, so the pressure rises steeply with density.',
            quantum: 'Position space is still roomy, so the Fermi surface reaches only modest momentum.',
            law: 'This regime is well approximated by P ∝ ρ^(5/3).',
            bridge: 'The white dwarf is comfortably stable; neutron-star physics is still far away.'
          };
    }
    if (ratio < 0.82) {
      return zh()
        ? {
            state: '更强约束把电子挤进更高动量态。',
            pressure: '白矮星越重越小，因为每次压缩都会抬高费米动量。',
            quantum: 'Δx 变小，典型动量变大；泡利原理迫使外层态被占据。',
            law: '仍主要接近 P ∝ ρ^(5/3)，但相对论修正开始显现。',
            bridge: '继续增重会让电子越来越接近相对论区间。'
          }
        : {
            state: 'Stronger confinement pushes electrons into higher momentum states.',
            pressure: 'The dwarf gets smaller as it gets heavier because each compression step raises the Fermi momentum.',
            quantum: 'Smaller Δx means larger characteristic momentum; Pauli filling moves outward.',
            law: 'The star still mostly follows P ∝ ρ^(5/3), with relativistic corrections starting to matter.',
            bridge: 'More mass keeps driving the electrons toward the relativistic regime.'
          };
    }
    if (ratio < 1) {
      return zh()
        ? {
            state: '费米动量正在逼近 mₑc。',
            pressure: '电子变得相对论化后，进一步压缩换来的新增支撑更少。',
            quantum: '相空间继续向外填满，但状态方程已从“硬”变“软”。',
            law: '支撑正在向 P ∝ ρ^(4/3) 软化。',
            bridge: '这就是钱德拉塞卡极限出现的原因：半径不再能单独选出平衡。'
          }
        : {
            state: 'The Fermi momentum is approaching mₑc.',
            pressure: 'Once the electrons become relativistic, extra compression yields less extra support.',
            quantum: 'Phase space keeps filling outward, but the equation of state is softening.',
            law: 'The support is sliding toward P ∝ ρ^(4/3).',
            bridge: 'That is why a Chandrasekhar mass appears: radius can no longer pick out equilibrium by itself.'
          };
    }
    return zh()
      ? {
          state: '冷白矮星的稳定平衡已经不存在。',
          pressure: '电子简并压已无法再跟上引力；继续演化要看环境、吸积与点火。',
          quantum: '进一步塌缩会导致电子俘获和中子化，或在某些双星环境中导致热核失控。',
          law: '电子支撑本身已不足以提供稳定半径。',
          bridge: '真正的中子星支撑需要中子简并压、核排斥和 TOV 方程，而不只是“换一种粒子”。'
        }
      : {
          state: 'No cold white-dwarf equilibrium remains.',
          pressure: 'Electron degeneracy can no longer keep up with gravity; the next outcome depends on context, accretion, and ignition.',
          quantum: 'Further collapse leads to electron capture and neutronization, or to thermonuclear runaway in some binaries.',
          law: 'Electron support by itself can no longer supply a stable radius.',
          bridge: 'A neutron star needs neutron degeneracy, nuclear repulsion, and the TOV equation, not just a different fermion.'
        };
  }

  function drawLimits(scene) {
    const { ctx, width, height } = scene;
    const mass = scene.mass;
    const ratio = clamp(mass / MCH, 0, 1.12);
    const radiusKm = whiteDwarfRadiusKm(Math.min(mass, MCH - 0.001));
    clear(ctx, width, height, '#04060e');

    const boxX = 28;
    const boxY = 58;
    const boxW = Math.max(72, width * 0.16 * (1 - ratio * 0.42));
    const boxH = height * 0.42 * (1 - ratio * 0.12);
    ctx.strokeStyle = 'rgba(174,184,216,.38)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    label(ctx, zh() ? '位置空间' : 'position space', boxX, boxY - 12);

    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 3; column++) {
        const px = boxX + boxW * (0.22 + column * 0.28);
        const py = boxY + boxH * (0.18 + row * 0.21);
        ctx.fillStyle = row * 3 + column < 6 + Math.round(ratio * 6) ? '#7ee8c5' : 'rgba(126,232,197,.18)';
        ctx.beginPath();
        ctx.arc(px, py, 3.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const ladderX = width - 146;
    const ladderBase = height - 52;
    label(ctx, zh() ? '动量态' : 'momentum states', ladderX - 18, 44);
    for (let level = 0; level < 10; level++) {
      const y = ladderBase - level * 24;
      const active = level <= 2 + Math.round(ratio * 8);
      const relativistic = ratio > 0.82 && level > 7;
      line(ctx, ladderX, y, ladderX + 82, y,
        active ? (relativistic ? 'rgba(255,107,157,.85)' : 'rgba(0,212,255,.78)') : 'rgba(174,184,216,.18)',
        active ? 3 : 1.2);
      if (active) {
        ctx.fillStyle = relativistic ? '#ff6b9d' : '#00d4ff';
        ctx.beginPath();
        ctx.arc(ladderX + 16 + (level % 3) * 18, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (ratio > 0.82) {
      const y = ladderBase - 7.7 * 24;
      line(ctx, ladderX - 6, y, ladderX + 88, y, 'rgba(255,107,157,.55)', 1, [6, 5]);
      label(ctx, zh() ? 'p_F ~ m_ec' : 'p_F ~ m_ec', ladderX + 18, y - 8, '#ff6b9d', 10);
    }

    const cx = width * 0.53;
    const cy = height * 0.54;
    const radius = mass >= MCH
      ? 8
      : clamp(radiusKm / 9000, 0.12, 1) * Math.min(width, height) * 0.12;
    glow(ctx, cx, cy, radius * 3.2, mass >= MCH ? '255,107,157' : '126,232,197');
    ctx.fillStyle = mass >= MCH ? '#ff6b9d' : '#7ee8c5';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    for (let index = 0; index < 8; index++) {
      const angle = index / 8 * Math.PI * 2;
      const ox = Math.cos(angle);
      const oy = Math.sin(angle);
      line(ctx, cx + ox * (radius + 44), cy + oy * (radius + 44), cx + ox * (radius + 12), cy + oy * (radius + 12), 'rgba(255,209,102,.75)', 2);
      if (mass < MCH) {
        line(ctx, cx + ox * (radius - 4), cy + oy * (radius - 4), cx + ox * (radius + 9), cy + oy * (radius + 9), 'rgba(0,212,255,.68)', 2);
      }
    }

    label(ctx, zh() ? '引力' : 'gravity', cx - 22, cy + radius + 64, '#ffd166', 11);
    label(ctx, zh() ? '电子简并压' : 'electron degeneracy', cx - 60, cy - radius - 48, '#00d4ff', 11);
    label(ctx, zh() ? 'Δx 变小 ⇒ p 变大' : 'smaller Δx ⇒ larger p', width * 0.34, height - 18, '#e8ecff', 11);
  }

  /* ------------------------------------------------------------ 4. candles -- */
  function drawCandles(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#04060e');
    const baseline = height - 52;
    const left = 56;
    const right = width - 24;

    line(ctx, left, 20, left, baseline, 'rgba(174,184,216,.32)');
    line(ctx, left, baseline, right, baseline, 'rgba(174,184,216,.32)');

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
    label(ctx,
      zh() ? '周期在本地可测，因此能定出真实光度' : 'Period is local and measurable, so it fixes the true luminosity.',
      left,
      baseline + 44,
      '#e8ecff',
      11);
  }

  /* ------------------------------------------------------- 5. type Ia path -- */
  const typeIaSteps = [
    {
      en: {
        readout: 'Accretion begins from a non-degenerate donor.',
        yield: 'The star has not exploded yet; surface flashes can still expel fuel.',
        binary: 'A non-degenerate donor overflows or sheds matter that the white dwarf can capture.',
        physics: 'Roche-lobe overflow or a dense wind feeds a carbon-oxygen white dwarf.',
        products: 'No thermonuclear supernova yet: whether the dwarf grows depends on retention efficiency.'
      },
      zh: {
        readout: '非简并伴星开始向白矮星输送物质。',
        yield: '此时还没有超新星；表面闪光仍可能把燃料抛走。',
        binary: '一颗非简并伴星通过洛希瓣溢出或恒星风，把物质送到白矮星上。',
        physics: '碳氧白矮星开始获取氢或氦富集的物质。',
        products: '此时还没有热核超新星；白矮星能否真正增重，取决于保留效率。'
      }
    },
    {
      en: {
        readout: 'Surface burning or recurrent novae complicate simple growth.',
        yield: 'Some freshly accreted material can be ejected again.',
        binary: 'The same binary can alternate between relatively steady burning and unstable flashes.',
        physics: 'Accreted hydrogen or helium may ignite on the surface before the carbon core does.',
        products: 'A nova is not a Type Ia: it can remove material instead of helping the dwarf reach the limit.'
      },
      zh: {
        readout: '表面燃烧或反复新星让“稳步增重”变得复杂。',
        yield: '部分新到达的物质可能又会被抛走。',
        binary: '同一个双星系统可以在相对稳定燃烧与不稳定闪燃之间切换。',
        physics: '落到表面的氢或氦，往往会在碳核心点火之前先行点燃。',
        products: '新星并不是 Ia 型超新星；它可能会抛掉物质，而不是帮白矮星继续长大。'
      }
    },
    {
      en: {
        readout: 'The carbon-oxygen dwarf approaches a near-Chandrasekhar core.',
        yield: 'The radius shrinks while the central density climbs steeply.',
        binary: 'Mass retention has finally pushed the dwarf into the regime where electron support is weakening.',
        physics: 'Electron degeneracy still supports the star, but relativistic softening has begun.',
        products: 'The setup is now primed for central carbon ignition under degenerate conditions.'
      },
      zh: {
        readout: '碳氧白矮星正逼近近钱德拉塞卡核心。',
        yield: '半径继续缩小，而中心密度迅速上升。',
        binary: '保留下来的质量终于把白矮星推入电子支撑开始变软的区间。',
        physics: '电子简并压仍在支撑白矮星，但相对论软化已经开始。',
        products: '系统已准备好在简并条件下于中心点燃碳。'
      }
    },
    {
      en: {
        readout: 'Central carbon ignition starts inside degenerate matter.',
        yield: 'Heating no longer leads to ordinary expansion and cooling.',
        binary: 'The key ignition happens in the core, not in the outer accreted skin.',
        physics: 'Degeneracy weakens the normal thermostat: added heat does not immediately make the star expand.',
        products: 'Carbon burning races away toward a thermonuclear runaway.'
      },
      zh: {
        readout: '简并物质内部的中心碳点火开始了。',
        yield: '升温不再像普通恒星那样立刻引起膨胀和降温。',
        binary: '关键点火发生在核心，而不是发生在外层吸积皮肤上。',
        physics: '简并态削弱了通常的“恒温器”：额外热量不会立刻让恒星膨胀。',
        products: '碳燃烧迅速走向热核失控。'
      }
    },
    {
      en: {
        readout: 'A thermonuclear runaway drives a turbulent deflagration.',
        yield: 'Rising plumes pre-expand the star and begin nucleosynthesis.',
        binary: 'This is where models diverge most strongly in flame geometry and turbulence.',
        physics: 'Burning begins subsonically as a deflagration that wrinkles and mixes the interior.',
        products: 'Intermediate-mass elements and iron-peak seeds begin to appear.'
      },
      zh: {
        readout: '热核失控推动出湍流化的湍燃前锋。',
        yield: '上升的羽流先把恒星预先膨胀，也开始了核合成。',
        binary: '在这里，各模型在火焰几何与湍流细节上分歧最大。',
        physics: '燃烧通常先以亚音速湍燃的形式开始，并不断起皱、搅动内部。',
        products: '中间质量元素和铁峰种子开始出现。'
      }
    },
    {
      en: {
        readout: 'Many near-Chandrasekhar models invoke a delayed detonation.',
        yield: 'A faster burning front sweeps through the pre-expanded star.',
        binary: 'Whether and where a deflagration-to-detonation transition occurs remains model-dependent.',
        physics: 'A detonation, if triggered, burns the remaining fuel far more rapidly than the earlier flame.',
        products: 'Nickel-56, silicon-, sulfur-, and calcium-rich ejecta are produced in different layers.'
      },
      zh: {
        readout: '许多近钱德拉塞卡模型会引入延迟爆轰。',
        yield: '更快的燃烧前锋扫过已经被预先膨胀的恒星。',
        binary: '湍燃是否真的转为爆轰、又在何处转变，仍然依赖模型。',
        physics: '一旦触发，爆轰会比先前的火焰快得多地烧掉剩余燃料。',
        products: '不同层里会合成镍-56，以及富硅、富硫、富钙的抛射物。'
      }
    },
    {
      en: {
        readout: 'The white dwarf is completely disrupted.',
        yield: 'Radioactive nickel-56 decay helps power the light curve after the blast.',
        binary: 'This channel leaves no neutron star or black hole remnant.',
        physics: 'The star unbinds itself because the released nuclear energy exceeds the binding energy of the dwarf.',
        products: 'The ejecta contain nickel-56, iron-peak nuclei, and intermediate-mass elements that later shape the spectrum.'
      },
      zh: {
        readout: '白矮星被完全解体。',
        yield: '爆炸之后，镍-56 的放射性衰变链会为光变曲线提供大量能量。',
        binary: '这一通道不会留下中子星或黑洞遗迹。',
        physics: '释放出的核能超过白矮星的束缚能，于是整颗星把自己炸散。',
        products: '抛射物包含镍-56、铁峰核素以及随后决定光谱形状的中间质量元素。'
      }
    }
  ];

  function drawTypeIa(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#060814');
    const stage = clamp(scene.stage, 0, 6);
    const donorX = width * 0.25;
    const donorY = height * 0.57;
    const wdX = width * 0.68;
    const wdY = height * 0.54;
    const donorRadius = Math.min(width, height) * 0.1;
    const wdRadius = Math.max(10, Math.min(width, height) * (0.065 - Math.min(stage, 2.8) * 0.006));

    glow(ctx, donorX, donorY, donorRadius * 2.5, '255,209,102');
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(donorX, donorY, donorRadius, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, zh() ? '非简并伴星' : 'non-degenerate donor', donorX - donorRadius, donorY + donorRadius + 18, '#ffd166', 10);

    if (stage < 5.3) {
      glow(ctx, wdX, wdY, wdRadius * 3.2, stage > 2.6 ? '238,242,255' : '126,232,197');
      ctx.fillStyle = '#eef2ff';
      ctx.beginPath();
      ctx.arc(wdX, wdY, wdRadius, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, zh() ? '碳氧白矮星' : 'C/O white dwarf', wdX - wdRadius - 38, wdY + wdRadius + 18, '#eef2ff', 10);
    }

    if (stage >= 0.2 && stage < 5) {
      ctx.strokeStyle = 'rgba(126,232,197,.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(donorX + donorRadius * 0.74, donorY - donorRadius * 0.08);
      ctx.bezierCurveTo(width * 0.42, donorY - donorRadius * 0.28, width * 0.54, wdY - 8, wdX - wdRadius * 0.92, wdY);
      ctx.stroke();
    }

    if (stage >= 0.8 && stage < 2.4) {
      ctx.strokeStyle = 'rgba(255,107,157,.82)';
      ctx.lineWidth = 2;
      for (let index = 0; index < 7; index++) {
        const angle = index / 7 * Math.PI * 2 + scene.elapsed * 1.1;
        const flashRadius = wdRadius + 10 + (index % 2) * 7;
        ctx.beginPath();
        ctx.moveTo(wdX + Math.cos(angle) * wdRadius, wdY + Math.sin(angle) * wdRadius);
        ctx.lineTo(wdX + Math.cos(angle) * flashRadius, wdY + Math.sin(angle) * flashRadius);
        ctx.stroke();
      }
      label(ctx, zh() ? '表面闪燃 / 新星' : 'surface flashes / nova', wdX - 44, wdY - wdRadius - 22, '#ff6b9d', 10);
    }

    if (stage >= 3 && stage < 5.4) {
      glow(ctx, wdX, wdY, wdRadius * 1.6, '255,122,92');
      ctx.fillStyle = stage < 4.2 ? '#ffb482' : '#ff7a5c';
      ctx.beginPath();
      ctx.arc(wdX, wdY, wdRadius * (stage < 4.2 ? 0.22 : 0.35), 0, Math.PI * 2);
      ctx.fill();
    }

    if (stage >= 4 && stage < 5.4) {
      ctx.strokeStyle = 'rgba(255,209,102,.92)';
      ctx.lineWidth = 3;
      for (let plume = 0; plume < 5; plume++) {
        const angle = plume / 5 * Math.PI * 2 + scene.elapsed * 0.25;
        ctx.beginPath();
        ctx.moveTo(wdX, wdY);
        ctx.quadraticCurveTo(
          wdX + Math.cos(angle) * wdRadius * 0.5,
          wdY + Math.sin(angle) * wdRadius * 0.5,
          wdX + Math.cos(angle) * wdRadius * 1.05,
          wdY + Math.sin(angle) * wdRadius * 1.05
        );
        ctx.stroke();
      }
      label(ctx, zh() ? '湍燃前锋' : 'deflagration flame', wdX - 36, wdY + wdRadius + 36, '#ffd166', 10);
    }

    if (stage >= 5) {
      const expansion = (stage - 5) / 1;
      const shell = 40 + expansion * Math.min(width, height) * 0.23;
      glow(ctx, wdX, wdY, shell * 1.35, '255,122,92');
      ctx.strokeStyle = 'rgba(255,122,92,.9)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(wdX, wdY, shell, 0, Math.PI * 2);
      ctx.stroke();

      const labels = [
        [zh() ? '镍-56' : 'Ni-56', -0.18, -0.24, '#ffd166'],
        [zh() ? '硅 / 硫 / 钙' : 'Si / S / Ca', 0.22, -0.08, '#7dd3ff'],
        [zh() ? '铁峰' : 'Fe peak', -0.04, 0.28, '#ff6b9d']
      ];
      for (const [text, ox, oy, color] of labels) {
        label(ctx, text, wdX + shell * ox, wdY + shell * oy, color, 10);
      }

      ctx.strokeStyle = 'rgba(255,209,102,.42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wdX - shell * 0.76, wdY + shell * 0.1);
      ctx.lineTo(donorX + donorRadius * 0.9, donorY);
      ctx.stroke();
    }

    label(ctx, zh() ? '这一图示只代表 Ia 型的一条通道' : 'This diagram is one Type Ia channel only', 18, 24, '#eef2ff', 11);
  }

  /* ------------------------------------------------------- 6. black holes -- */
  function drawBlackHole(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#03050c');
    const stage = scene.stage;
    const cx = width * 0.5;
    const cy = height * 0.49;
    const baseRadius = Math.min(width, height) * 0.31;
    const collapseProgress = Math.max(0, Math.min(1, stage / 5));
    const radius = baseRadius * (1 - collapseProgress * 0.78);

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

      ctx.fillStyle = 'rgba(126,232,197,.72)';
      for (let index = 0; index < 18; index++) {
        const angle = index / 18 * Math.PI * 2;
        const distance = coreRadius * 2.2 + ((scene.elapsed * 26 + index * 17) % Math.max(40, shockRadius - coreRadius * 2));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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
      [zh() ? '塌缩前' : 'before collapse', 0],
      ['~0.1–0.3 s', 1],
      [zh() ? '毫秒到约 0.1 秒' : 'milliseconds to ~0.1 s', 2],
      ['~0.1–1 s', 3],
      [zh() ? '分支点' : 'branch point', 4],
      [zh() ? '失败超新星模型中的一个时间窗' : 'a failed-supernova time window', 5],
      [zh() ? '数秒及以后' : 'seconds and later', 6]
    ];
    label(ctx, labels[Math.min(6, Math.max(0, Math.round(stage)))][0], 18, 28, '#eef2ff', 11);
  }

  /* ----------------------------------------------------- 7. compact graph -- */
  const COMPACT_AXIS_MIN = 0.4;
  const COMPACT_AXIS_MAX = 12;
  const compactModes = {
    'white-dwarf': {
      color: palette.green,
      defaultMass: 1.0,
      digits: 2,
      max: 1.38,
      min: 0.45,
      rangeNote: {
        en: 'Supported teaching range here: 0.45–1.38 M☉ for cold carbon-oxygen white dwarfs. This is a representative instructional span, not a fundamental forbidden-mass rule.',
        zh: '这里采用的教学范围是 0.45–1.38 M☉，对应冷碳氧白矮星。它只是有依据的教学区间，并不是自然界的绝对禁区。'
      },
      step: 0.01
    },
    'neutron-star': {
      color: palette.cyan,
      defaultMass: 1.4,
      digits: 2,
      max: 2.3,
      min: 1.1,
      rangeNote: {
        en: 'Supported teaching range here: 1.10–2.30 M☉, spanning well-measured neutron stars through the EOS-sensitive high-mass regime. It is not a claim that every other compact-object mass is impossible.',
        zh: '这里采用的教学范围是 1.10–2.30 M☉，覆盖观测扎实的中子星到依赖状态方程的高质量区间。它并不是在宣称其他致密天体质量都不可能存在。'
      },
      step: 0.01
    },
    'black-hole': {
      color: palette.violet,
      defaultMass: 5.0,
      digits: 1,
      max: 12.0,
      min: 3.0,
      rangeNote: {
        en: 'Supported teaching range here: 3.0–12.0 M☉ as an illustrative low-mass stellar-black-hole plotting window. It is not meant to represent the full stellar-mass population or a fundamental lower/upper black-hole mass law.',
        zh: '这里采用的教学范围是 3.0–12.0 M☉，只是一个“低质量恒星级黑洞的示意绘图区间”。它并不代表全部恒星级黑洞人群，也不是黑洞质量存在绝对上下限的定律。'
      },
      step: 0.1
    }
  };

  function compactSpec(mode) {
    return compactModes[mode] || compactModes['white-dwarf'];
  }

  function formatCompactMass(value, mode) {
    const spec = compactSpec(mode);
    return `${value.toFixed(spec.digits)} M☉`;
  }

  function neutronBand(mass) {
    const center = 12.2 - 0.55 * (mass - 1.4);
    const halfWidth = 1.15 + 0.18 * Math.abs(mass - 1.6);
    return [center - halfWidth, center + halfWidth];
  }

  function drawCompact(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#04060e');
    const left = 60;
    const right = width - 22;
    const top = 24;
    const bottom = height - 36;
    const yMin = Math.log10(2);
    const yMax = Math.log10(20000);
    const toX = mass => left + (mass - COMPACT_AXIS_MIN) / (COMPACT_AXIS_MAX - COMPACT_AXIS_MIN) * (right - left);
    const toY = radiusKm => bottom - (Math.log10(radiusKm) - yMin) / (yMax - yMin) * (bottom - top);

    line(ctx, left, top, left, bottom, 'rgba(174,184,216,.32)');
    line(ctx, left, bottom, right, bottom, 'rgba(174,184,216,.32)');
    for (const tick of [3, 10, 100, 1000, 10000]) {
      const y = toY(tick);
      line(ctx, left, y, right, y, 'rgba(174,184,216,.12)');
      label(ctx, `${tick} km`, 10, y + 4, '#aeb8d8', 10);
    }
    for (const tick of [0.5, 1, 1.4, 2, 5, 10]) {
      const x = toX(tick);
      line(ctx, x, bottom, x, bottom + 5, 'rgba(174,184,216,.28)');
      label(ctx, `${tick}`, x - 6, bottom + 18, '#aeb8d8', 10);
    }
    label(ctx, zh() ? '半径 / 视界尺度' : 'radius / horizon scale', 10, 16, '#e8ecff', 11);
    label(ctx, zh() ? '质量 (M☉)' : 'mass (M☉)', left, height - 12, '#aeb8d8', 11);

    ctx.strokeStyle = 'rgba(126,232,197,.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let mass = 0.45; mass <= 1.42; mass += 0.02) {
      const radius = whiteDwarfRadiusKm(mass);
      const x = toX(mass);
      const y = toY(radius);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(125,211,255,.18)';
    ctx.beginPath();
    for (let mass = 1; mass <= 2.35; mass += 0.04) {
      const [low] = neutronBand(mass);
      const x = toX(mass);
      const y = toY(low);
      if (mass === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let mass = 2.35; mass >= 1; mass -= 0.04) {
      const [, high] = neutronBand(mass);
      ctx.lineTo(toX(mass), toY(high));
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(125,211,255,.78)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let mass = 1; mass <= 2.35; mass += 0.04) {
      const [low, high] = neutronBand(mass);
      const x = toX(mass);
      const y = toY((low + high) / 2);
      if (mass === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(199,125,255,.82)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let mass = 2.1; mass <= 12; mass += 0.05) {
      const x = toX(mass);
      const y = toY(Math.max(2.1, 2.95 * mass));
      if (mass === 2.1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    label(ctx, zh() ? '白矮星分支' : 'white-dwarf branch', left + 8, toY(6000) - 8, '#7ee8c5', 10);
    label(ctx, zh() ? '中子星带' : 'neutron-star band', toX(1.55), toY(15), '#7dd3ff', 10);
    label(ctx, zh() ? '黑洞视界尺度' : 'black-hole horizon scale', toX(4.4), toY(14), '#c77dff', 10);

    const mode = scene.mode;
    const spec = compactSpec(mode);
    const mass = clamp(scene.mass, spec.min, spec.max);
    let pointRadius = 5;
    let x = toX(mass);
    let y;
    let color = spec.color;
    if (mode === 'white-dwarf') {
      const stableMass = Math.min(mass, 1.42);
      y = toY(Math.max(25, whiteDwarfRadiusKm(stableMass)));
      if (mass > 1.42) {
        line(ctx, toX(1.42), top + 18, toX(1.42), bottom - 18, 'rgba(255,107,157,.52)', 1.5, [6, 5]);
        label(ctx, zh() ? '电子支撑到此为止' : 'electron support ends here', toX(1.42) + 8, top + 26, '#ff6b9d', 10);
      }
    } else if (mode === 'neutron-star') {
      const [low, high] = neutronBand(Math.min(Math.max(mass, 1.0), 2.35));
      y = toY((low + high) / 2);
      if (mass > 2.35) {
        x = toX(2.35);
        line(ctx, x, top + 18, x, bottom - 18, 'rgba(255,107,157,.52)', 1.5, [6, 5]);
        label(ctx, zh() ? '可能的塌缩阈值区' : 'likely collapse-threshold zone', x + 8, top + 26, '#ff6b9d', 10);
      }
    } else {
      y = toY(Math.max(2.1, 2.95 * mass));
      pointRadius = 6;
    }

    glow(ctx, x, y, 24, color.replace('#', '') === '7ee8c5' ? '126,232,197' :
      color.replace('#', '') === '7dd3ff' ? '125,211,255' : '199,125,255');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  /* -------------------------------------------------------------- 8. jets -- */
  function drawJet(scene) {
    const { ctx, width, height } = scene;
    clear(ctx, width, height, '#04070f');
    const beta = scene.beta;
    const theta = scene.angle;
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const betaApp = beta * Math.sin(theta) / Math.max(1e-3, 1 - beta * Math.cos(theta));
    const sourceX = width * 0.26;
    const sourceY = height * 0.5;
    const observerX = width - 44;
    const observerY = height * 0.5;
    const jetLength = Math.min(width, height) * 0.36;

    glow(ctx, sourceX, sourceY, 32, '199,125,255');
    ctx.fillStyle = '#eef2ff';
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, 3, 0, Math.PI * 2);
    ctx.fill();

    line(ctx, sourceX, sourceY, observerX, observerY, 'rgba(174,184,216,.18)', 1, [5, 5]);
    label(ctx, zh() ? '视线' : 'line of sight', width * 0.54, sourceY - 10, '#aeb8d8', 10);

    const approachBrightness = clamp(Math.pow(1 / (gamma * (1 - beta * Math.cos(theta))), 2.2) * 0.07, 0.18, 0.95);
    const recedeBrightness = clamp(Math.pow(1 / (gamma * (1 + beta * Math.cos(theta))), 2.2) * 0.4, 0.08, 0.35);
    const upY = sourceY - Math.sin(theta) * jetLength;
    const rightX = sourceX + Math.cos(theta) * jetLength;
    const leftX = sourceX - Math.cos(theta) * jetLength;
    const downY = sourceY + Math.sin(theta) * jetLength;
    line(ctx, sourceX, sourceY, rightX, upY, `rgba(0,212,255,${approachBrightness})`, 5);
    line(ctx, sourceX, sourceY, leftX, downY, `rgba(255,107,157,${recedeBrightness})`, 4);

    const phase = (scene.elapsed * 0.24) % 0.26;
    const s1 = 0.18 + phase;
    const s2 = s1 + 0.18;
    const knot1X = sourceX + Math.cos(theta) * jetLength * s1;
    const knot1Y = sourceY - Math.sin(theta) * jetLength * s1;
    const knot2X = sourceX + Math.cos(theta) * jetLength * Math.min(s2, 0.98);
    const knot2Y = sourceY - Math.sin(theta) * jetLength * Math.min(s2, 0.98);

    glow(ctx, knot1X, knot1Y, 18, '0,212,255');
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(knot1X, knot1Y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, knot2X, knot2Y, 18, '0,212,255');
    ctx.beginPath();
    ctx.arc(knot2X, knot2Y, 5.5, 0, Math.PI * 2);
    ctx.fill();

    line(ctx, knot1X, knot1Y, observerX, observerY, 'rgba(255,209,102,.4)', 1.5, [4, 4]);
    line(ctx, knot2X, knot2Y, observerX, observerY, 'rgba(255,209,102,.72)', 1.8, [4, 4]);
    label(ctx, zh() ? '观察者' : 'observer', observerX - 22, observerY + 22, '#eef2ff', 10, 'center');

    const barX = width * 0.38;
    const barY = height - 48;
    const emitLength = 110;
    const arrivalLength = emitLength * clamp(1 - beta * Math.cos(theta), 0.06, 1);
    line(ctx, barX, barY, barX + emitLength, barY, 'rgba(174,184,216,.6)', 4);
    line(ctx, barX, barY + 18, barX + arrivalLength, barY + 18, 'rgba(0,212,255,.86)', 4);
    label(ctx, zh() ? '发射间隔' : 'emission gap', barX, barY - 8, '#aeb8d8', 10);
    label(ctx, zh() ? '到达间隔' : 'arrival gap', barX, barY + 34, '#00d4ff', 10);
    label(ctx, zh() ? `β_app = ${betaApp.toFixed(2)} c` : `β_app = ${betaApp.toFixed(2)} c`, width - 158, 36, betaApp > 1 ? '#00d4ff' : '#e8ecff', 11);
  }

  /* ------------------------------------------------------------ readouts -- */
  function renderStageDetail() {
    const stage = stageForMass(evolutionScene.mass);
    const copy = zh() ? stage.zh : stage.en;
    starMassOut.textContent = `${evolutionScene.mass.toFixed(2)} M☉`;
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

  function renderLimitDetail() {
    const snapshot = limitSnapshot(limitsScene.mass);
    limitMassOut.textContent = `${limitsScene.mass.toFixed(2)} M☉`;
    limitsState.textContent = snapshot.state;
    limitsPressure.textContent = snapshot.pressure;
    limitQuantum.textContent = snapshot.quantum;
    limitLaw.textContent = snapshot.law;
    limitBridge.textContent = snapshot.bridge;
  }

  function renderCompactDetail() {
    const mode = compactScene.mode;
    syncCompactMassControl(false);
    const mass = compactScene.mass;
    if (mode === 'white-dwarf') {
      const stableMass = Math.min(mass, 1.42);
      const radius = whiteDwarfRadiusKm(stableMass);
      compactHeadline.textContent = zh()
        ? '白矮星越重越小。'
        : 'White-dwarf radii fall as mass rises.';
      compactSecondary.textContent = zh()
        ? '电子简并压决定这条分支，直到接近钱德拉塞卡极限。'
        : 'Electron degeneracy sets this branch until the Chandrasekhar limit is approached.';
      compactRadius.textContent = mass <= 1.42
        ? (zh()
          ? `这个质量对应的冷白矮星半径量级约为 ${Math.round(radius)} km。`
          : `A cold white dwarf at this mass sits at a radius scale of about ${Math.round(radius)} km.`)
        : (zh()
          ? '超过近钱德拉塞卡质量后，就没有稳定的冷白矮星半径了。'
          : 'Beyond the near-Chandrasekhar mass, there is no stable cold white-dwarf radius.');
      compactSupport.textContent = zh()
        ? '支撑来自电子简并压；电子越被约束，费米动量就越高。'
        : 'Support comes from electron degeneracy; stronger confinement means higher Fermi momentum.';
      compactKnown.textContent = zh()
        ? '白矮星分支本身理解得相对扎实；真正不确定的是不同双星怎样把系统推离这条分支。'
        : 'The white-dwarf branch itself is comparatively secure; the uncertainty lies in which binary histories push systems off it.';
      return;
    }

    if (mode === 'neutron-star') {
      const [low, high] = neutronBand(Math.min(Math.max(mass, 1.0), 2.35));
      compactHeadline.textContent = zh()
        ? '中子星半径落在一条观测约束下的不确定带里。'
        : 'Neutron-star radii live inside an observationally constrained uncertainty band.';
      compactSecondary.textContent = zh()
        ? '真正的最大质量取决于致密物质状态方程。'
        : 'The true maximum mass depends on the dense-matter equation of state.';
      compactRadius.textContent = zh()
        ? `这个质量附近的典型半径大致落在 ${low.toFixed(1)}–${high.toFixed(1)} km。`
        : `At this mass, a typical radius lies around ${low.toFixed(1)}–${high.toFixed(1)} km.`;
      compactSupport.textContent = zh()
        ? '支撑来自中子简并压、短程核排斥，以及 TOV 平衡；不是“电子换成中子”这么简单。'
        : 'Support comes from neutron degeneracy, short-range nuclear repulsion, and TOV balance; it is not just “electrons replaced by neutrons.”';
      compactKnown.textContent = mass <= 2.05
        ? (zh()
          ? '接近 2 个太阳质量的脉冲星说明这类中子星可以稳定存在。'
          : 'Pulsars near 2 solar masses show that stars in this range can be stable.')
        : mass <= 2.35
          ? (zh()
            ? '这里已经逼近模型依赖的最大质量区间；再多一点质量就可能塌成黑洞。'
            : 'This is already in the model-dependent maximum-mass regime; a little more mass can force collapse to a black hole.')
          : (zh()
            ? '这个质量通常被视为黑洞更自然的区域；热支撑或自转只能暂时推迟塌缩。'
            : 'At this mass, black-hole collapse is usually the more natural outcome; thermal support or rotation can only delay it temporarily.');
      return;
    }

    const radius = 2.95 * mass;
    compactHeadline.textContent = zh()
      ? '一旦形成黑洞，视界尺度就由质量直接给出。'
      : 'Once a black hole exists, the horizon scale is fixed directly by mass.';
    compactSecondary.textContent = zh()
      ? '真正不确定的是“何时形成黑洞”，而不是“给定质量时视界多大”。'
      : 'The uncertain part is when collapse forms a black hole, not how large the horizon is once the mass is known.';
    compactRadius.textContent = zh()
      ? `这个质量的史瓦西尺度约为 ${radius.toFixed(1)} km。`
      : `The Schwarzschild scale at this mass is about ${radius.toFixed(1)} km.`;
    compactSupport.textContent = zh()
      ? '黑洞不是另一种被压强支撑的恒星分支；它的视界是因果边界，而不是物质表面。'
      : 'A black hole is not another pressure-supported stellar branch; its horizon is a causal boundary, not a material surface.';
    compactKnown.textContent = zh()
      ? '给定质量后的视界尺度是经典广义相对论的稳固结论；前身星怎样越过阈值则依赖自转、热状态、吸积与状态方程。'
      : 'The horizon scale for a given mass is a robust prediction of classical general relativity; how progenitors cross the threshold depends on rotation, thermal state, accretion, and the equation of state.';
  }

  function syncCompactMassControl(resetMass) {
    const spec = compactSpec(compactScene.mode);
    compactMass.min = String(spec.min);
    compactMass.max = String(spec.max);
    compactMass.step = String(spec.step);
    const nextMass = clamp(
      resetMass ? spec.defaultMass : compactScene.mass,
      spec.min,
      spec.max
    );
    compactScene.mass = nextMass;
    compactMass.value = nextMass.toFixed(spec.digits);
    compactMassOut.textContent = formatCompactMass(nextMass, compactScene.mode);
    compactRangeNote.textContent = zh() ? spec.rangeNote.zh : spec.rangeNote.en;
  }

  function applyCompactMode(mode, resetMass) {
    compactScene.mode = compactModes[mode] ? mode : 'white-dwarf';
    for (const peer of document.querySelectorAll('[data-compact-mode]')) {
      const active = peer.dataset.compactMode === compactScene.mode;
      peer.classList.toggle('active', active);
      peer.setAttribute('aria-pressed', String(active));
    }
    syncCompactMassControl(resetMass);
    renderCompactDetail();
    renderAll(0);
  }

  function renderTypeIaDetail() {
    const stage = Math.min(6, Math.max(0, Math.round(typeIaScene.stage)));
    const copy = zh() ? typeIaSteps[stage].zh : typeIaSteps[stage].en;
    typeIaStageOut.textContent = `${typeIaScene.stage.toFixed(2)} / 6`;
    typeIaReadout.textContent = copy.readout;
    typeIaYield.textContent = copy.yield;
    typeIaBinary.textContent = copy.binary;
    typeIaPhysics.textContent = copy.physics;
    typeIaProducts.textContent = copy.products;
  }

  function renderBlackHoleReadout() {
    const stage = Math.min(6, Math.max(0, Math.round(blackHoleScene.stage)));
    const rows = zh()
      ? [
          ['洋葱壳层燃烧与铁核', '塌缩前'],
          ['电子俘获与光致裂解', '约 0.1–0.3 秒'],
          ['核心反弹与激波发射', '毫秒至约 0.1 秒'],
          ['原中子星与停滞激波', '约 0.1–1 秒'],
          ['爆炸成功或继续吸积', '分支点'],
          ['事件视界形成', '某些模型中为反弹后约 0.6–1.3 秒'],
          ['可选的盘与喷流', '数秒及以后']
        ]
      : [
          ['Onion-shell burning + iron core', 'before collapse'],
          ['Electron capture + photodisintegration', '~0.1–0.3 s'],
          ['Core bounce + shock launch', 'milliseconds to ~0.1 s'],
          ['Proto-neutron star + stalled shock', '~0.1–1 s'],
          ['Successful explosion or continued accretion', 'branch point'],
          ['Event horizon forms', '~0.6–1.3 s in some failed-supernova models'],
          ['Optional disk and jet', 'seconds and later']
        ];
    blackHoleReadout.textContent = rows[stage][0];
    blackHoleTime.textContent = rows[stage][1];
    blackHoleStageOut.textContent = `${blackHoleScene.stage.toFixed(2)} / 6`;
    blackHoleSpinOut.textContent = blackHoleScene.spin.toFixed(2);
  }

  function renderJetDetail() {
    const beta = jetScene.beta;
    const thetaDeg = jetScene.angle * 180 / Math.PI;
    const betaApp = beta * Math.sin(jetScene.angle) / Math.max(1e-3, 1 - beta * Math.cos(jetScene.angle));
    jetSpeedOut.textContent = `${beta.toFixed(3)} c`;
    jetAngleOut.textContent = `${thetaDeg.toFixed(1)}°`;
    jetReadout.textContent = zh()
      ? betaApp > 1
        ? '后发光子需要追赶的路程更短，所以表观横向速度可以超过 c。'
        : '几何效应已经压缩了到达时间，但表观速度还没有超过 c。'
      : betaApp > 1
        ? 'Later photons have less distance left to travel, so the apparent transverse speed can exceed c.'
        : 'Geometry is already compressing the arrival times, but the apparent speed is still below c.';
    jetApparent.textContent = zh()
      ? `β_app = ${betaApp.toFixed(2)} c；物质本身始终只有 ${beta.toFixed(3)} c。`
      : `β_app = ${betaApp.toFixed(2)} c, while the material itself remains at ${beta.toFixed(3)} c.`;
    jetTiming.textContent = zh()
      ? `当视线夹角为 ${thetaDeg.toFixed(1)}° 时，到达时间间隔会被压缩到发射间隔的 ${(1 - beta * Math.cos(jetScene.angle)).toFixed(2)} 倍左右。`
      : `At a viewing angle of ${thetaDeg.toFixed(1)}°, the arrival gap is compressed to about ${(1 - beta * Math.cos(jetScene.angle)).toFixed(2)} times the emission gap.`;
    jetInvariant.textContent = zh()
      ? '无论几何如何变化，真实物质速度都不会超过光速；变化的是我们接收到信息的时刻。'
      : 'No geometry makes the actual material outrun light; only the timing of the received information changes.';
    jetContext.textContent = zh()
      ? betaApp > 1
        ? '这正是甚长基线射电图上常见的“表观超光速”喷流现象。'
        : '再把喷流对得更接近视线方向，或再快一些，就会进入常见的表观超光速区间。'
      : betaApp > 1
        ? 'This is the classic apparent-superluminal regime seen in many radio jets.'
        : 'Aim the jet even closer to the line of sight, or speed it up further, and it enters the familiar apparent-superluminal regime.';
  }

  /* ------------------------------------------------------------ lifecycle -- */
  const collapseScene = setup('collapseCanvas', drawCollapse, { progress: 0.5 });
  const evolutionScene = setup('evolutionCanvas', drawEvolution, { mass: 1 });
  const limitsScene = setup('limitsCanvas', drawLimits, { mass: 1 });
  const candleScene = setup('candleCanvas', drawCandles);
  const typeIaScene = setup('typeIaCanvas', drawTypeIa, { stage: 0 });
  const blackHoleScene = setup('blackHoleCanvas', drawBlackHole, { stage: 3.2, spin: 0.55 });
  const compactScene = setup('compactCanvas', drawCompact, { mass: 1, mode: 'white-dwarf' });
  const jetScene = setup('jetCanvas', drawJet, { beta: 0.9, angle: 18 * Math.PI / 180 });

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
    if (frameHandle || !scenes.size) return;
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
      if (scene) resize(scene);
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
    renderCollapseReadout();
    renderAll(0);
  });

  const massSlider = document.getElementById('starMass');
  const starMassOut = document.getElementById('starMassOut');
  const stageDetail = document.getElementById('stageDetail');
  massSlider.addEventListener('input', () => {
    evolutionScene.mass = Number(massSlider.value);
    renderStageDetail();
    renderAll(0);
  });

  const limitSlider = document.getElementById('limitMass');
  const limitMassOut = document.getElementById('limitMassOut');
  const limitsState = document.getElementById('limitsState');
  const limitsPressure = document.getElementById('limitsPressure');
  const limitQuantum = document.getElementById('limitQuantum');
  const limitLaw = document.getElementById('limitLaw');
  const limitBridge = document.getElementById('limitBridge');
  limitSlider.addEventListener('input', () => {
    limitsScene.mass = Number(limitSlider.value);
    renderLimitDetail();
    renderAll(0);
  });

  const compactMass = document.getElementById('compactMass');
  const compactMassOut = document.getElementById('compactMassOut');
  const compactRangeNote = document.getElementById('compactRangeNote');
  const compactHeadline = document.getElementById('compactHeadline');
  const compactSecondary = document.getElementById('compactSecondary');
  const compactRadius = document.getElementById('compactRadius');
  const compactSupport = document.getElementById('compactSupport');
  const compactKnown = document.getElementById('compactKnown');
  compactMass.addEventListener('input', () => {
    const spec = compactSpec(compactScene.mode);
    compactScene.mass = clamp(Number(compactMass.value), spec.min, spec.max);
    renderCompactDetail();
    renderAll(0);
  });
  for (const button of document.querySelectorAll('[data-compact-mode]')) {
    button.addEventListener('click', () => {
      applyCompactMode(button.dataset.compactMode, true);
    });
  }

  const typeIaStage = document.getElementById('typeIaStage');
  const typeIaStageOut = document.getElementById('typeIaStageOut');
  const typeIaReadout = document.getElementById('typeIaReadout');
  const typeIaYield = document.getElementById('typeIaYield');
  const typeIaBinary = document.getElementById('typeIaBinary');
  const typeIaPhysics = document.getElementById('typeIaPhysics');
  const typeIaProducts = document.getElementById('typeIaProducts');
  typeIaStage.addEventListener('input', () => {
    typeIaScene.stage = Number(typeIaStage.value);
    renderTypeIaDetail();
    renderAll(0);
  });

  const blackHoleSlider = document.getElementById('blackHoleStage');
  const blackHoleStageOut = document.getElementById('blackHoleStageOut');
  const blackHoleSpin = document.getElementById('blackHoleSpin');
  const blackHoleSpinOut = document.getElementById('blackHoleSpinOut');
  const blackHoleReadout = document.getElementById('blackHoleReadout');
  const blackHoleTime = document.getElementById('blackHoleTime');
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

  const jetSpeed = document.getElementById('jetSpeed');
  const jetSpeedOut = document.getElementById('jetSpeedOut');
  const jetAngle = document.getElementById('jetAngle');
  const jetAngleOut = document.getElementById('jetAngleOut');
  const jetReadout = document.getElementById('jetReadout');
  const jetApparent = document.getElementById('jetApparent');
  const jetTiming = document.getElementById('jetTiming');
  const jetInvariant = document.getElementById('jetInvariant');
  const jetContext = document.getElementById('jetContext');
  jetSpeed.addEventListener('input', () => {
    jetScene.beta = Number(jetSpeed.value);
    renderJetDetail();
    renderAll(0);
  });
  jetAngle.addEventListener('input', () => {
    jetScene.angle = Number(jetAngle.value) * Math.PI / 180;
    renderJetDetail();
    renderAll(0);
  });

  document.addEventListener('physics-language', () => {
    renderCollapseReadout();
    renderStageDetail();
    renderLimitDetail();
    renderCompactDetail();
    renderTypeIaDetail();
    renderBlackHoleReadout();
    renderJetDetail();
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
  compactScene.mode = document.querySelector('[data-compact-mode][aria-pressed="true"]')?.dataset.compactMode || 'white-dwarf';
  typeIaScene.stage = Number(typeIaStage.value);
  blackHoleScene.stage = Number(blackHoleSlider.value);
  blackHoleScene.spin = Number(blackHoleSpin.value);
  jetScene.beta = Number(jetSpeed.value);
  jetScene.angle = Number(jetAngle.value) * Math.PI / 180;

  renderCollapseReadout();
  renderStageDetail();
  renderLimitDetail();
  applyCompactMode(compactScene.mode, true);
  renderTypeIaDetail();
  renderBlackHoleReadout();
  renderJetDetail();

  if (PhysicsUI.motionPaused()) renderAll(0);
  else start();
})();
