(() => {
  const t = (en, zh) => ({ en, zh });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const zh = () => PhysicsUI.language === 'zh-CN';
  const pick = value => (zh() ? value.zh : value.en);
  const format = (value, digits = 2) => Number(value).toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

  const VISUAL_LABELS = {
    observation: t('Observation', '观测'),
    document: t('Historical document', '历史文献'),
    reconstruction: t('Reconstructed data', '重建数据'),
    model: t('Calculated model', '计算模型'),
    schematic: t('Teaching schematic', '教学示意')
  };

  const CARD_LABELS = {
    question: t('Question the field keeps asking', '这一领域反复追问的问题'),
    scale: t('Scale, approximation, or failure mode', '尺度、近似或失效条件'),
    experiment: t('Landmark measurement or experiment', '代表性测量或实验'),
    mechanism: t('Worked mechanism', '作用链条'),
    misconception: t('Common misconception', '常见误解'),
    frontier: t('Current open boundary', '当前开放边界'),
    claim: t('Supported claim', '有依据的论断')
  };

  const visualStateCache = new Map();

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const source = (title, institution, url, en, zhText) => ({
    title,
    institution,
    url,
    summary: t(en, zhText)
  });

  const question = (titleEn, titleZh, bodyEn, bodyZh) => ({
    title: t(titleEn, titleZh),
    body: t(bodyEn, bodyZh)
  });

  const scaleCard = (labelEn, labelZh, titleEn, titleZh, bodyEn, bodyZh) => ({
    label: t(labelEn, labelZh),
    title: t(titleEn, titleZh),
    body: t(bodyEn, bodyZh)
  });

  const step = (titleEn, titleZh, bodyEn, bodyZh) => ({
    title: t(titleEn, titleZh),
    body: t(bodyEn, bodyZh)
  });

  const experimentCard = (kind, titleEn, titleZh, bodyEn, bodyZh, noteEn, noteZh, sourcesList) => ({
    kind,
    title: t(titleEn, titleZh),
    body: t(bodyEn, bodyZh),
    note: t(noteEn, noteZh),
    sources: sourcesList
  });

  const claimCard = (titleEn, titleZh, claimEn, claimZh, bodyEn, bodyZh, sourcesList) => ({
    title: t(titleEn, titleZh),
    claim: t(claimEn, claimZh),
    body: t(bodyEn, bodyZh),
    sources: sourcesList
  });

  const sources = Object.freeze({
    'nasa-hubble-optics': source('Hubble optics', 'NASA', 'https://science.nasa.gov/mission/hubble/observatory/design/optics/', 'How mirrors, aperture, and focusing turn incoming light into astronomical measurements.', '说明反射镜、口径与聚焦如何把入射光转化为天文测量。'),
    'nasa-wave-behaviors': source('Wave behaviors', 'NASA', 'https://science.nasa.gov/ems/03_behaviors/', 'Official guide to reflection, refraction, diffraction, and scattering.', '反射、折射、衍射与散射的官方导览。'),
    'nasa-bernoulli': source("Bernoulli's equation", 'NASA Glenn', 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation-1/', 'A derivation of the pressure-speed relation and the assumptions behind it.', '推导压强—速度关系，并说明其成立条件。'),
    'nasa-lift': source('What is lift?', 'NASA Glenn', 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/what-is-lift/', 'Why a complete account of lift requires fluid turning and momentum, not one slogan.', '解释完整的升力理论为何需要流体偏转与动量，而不是一句口号。'),
    'nasa-sphere-drag': source('Drag of a Sphere', 'NASA Glenn Research Center', 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-of-a-sphere/', 'Uses bluff-body flow around a sphere to connect Reynolds number, separation, wake growth, and the fact that roughness can shift transition.', '用球体绕流把雷诺数、分离、尾迹增长，以及粗糙度会改变转捩这件事联系起来。'),
    'reynolds-1883': source('XXIX. An experimental investigation of the circumstances which determine whether the motion of water shall be direct or sinuous, and of the law of resistance in parallel channels', 'The Royal Society', 'https://doi.org/10.1098/rstl.1883.0029', 'Osborne Reynolds’s primary dye-streak pipe-flow experiment showing how orderly and sinuous regimes separate in a geometry-specific way.', 'Osborne Reynolds 关于染料丝管流实验的原始论文，展示了平直与弯曲流态如何以几何相关的方式分离出来。'),
    'noaa-sound': source('Sound in the ocean', 'NOAA', 'https://oceanservice.noaa.gov/facts/sound.html', 'How sound propagates and refracts through a material medium.', '说明声音如何在物质介质中传播与折射。'),
    'nih-hear': source('How do we hear?', 'NIH / NIDCD', 'https://www.nidcd.nih.gov/health/how-do-we-hear', 'How pressure waves become traveling waves and then electrical signals.', '说明压强波如何变成行波，再转化为电信号。'),
    'unsw-pipes': source('Pipes and harmonics: cylindrical and conical bores', 'University of New South Wales', 'https://newt.phys.unsw.edu.au/jw/pipes.html', 'Explains why open-open pipes support all harmonics while one-end-closed pipes support only the odd sequence in the ideal air-column model.', '解释理想空气柱模型里为何两端开口的管支持全部谐波，而一端封闭的管只支持奇次序列。'),
    'nist-temperature': source('SI units: temperature', 'NIST', 'https://www.nist.gov/pml/owm/si-units-temperature', 'The kelvin, thermodynamic temperature, and the meaning of absolute zero.', '开尔文、热力学温度与绝对零度的含义。'),
    'nist-boltzmann': source('Boltzmann constant', 'NIST', 'https://physics.nist.gov/cgi-bin/cuu/Value?k', 'The standard constant linking microscopic energy scales to temperature and entropy.', '连接微观能量尺度、温度与熵的标准常数。'),
    'utexas-heat-engines': source('Heat engines', 'University of Texas at Austin', 'https://farside.ph.utexas.edu/teaching/sm1/lectures/node57.html', 'Derives the heat-engine efficiency bound and shows that a reversible engine reaches the Carnot form 1 − T_c/T_h.', '推导热机效率上限，并说明可逆热机达到卡诺形式 1 − T_c/T_h。'),
    'doe-em-force': source('The electromagnetic force', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsthe-electromagnetic-force', 'Electric charge, fields, moving charges, magnetism, and induction.', '介绍电荷、场、运动电荷、磁性与电磁感应。'),
    'nasa-spectrum': source('The electromagnetic spectrum', 'NASA', 'https://science.nasa.gov/ems/01_intro/', 'How electromagnetic fields propagate across the full spectrum.', '说明电磁场如何在完整电磁谱中传播。'),
    'nist-entropy': source('Boltzmann constant and entropy', 'NIST', 'https://www.nist.gov/pml/special-publication-330/sp-330-section-2', 'The SI account of the Boltzmann constant and microscopic state counting.', '国际单位制对玻尔兹曼常数与微观状态计数的说明。'),
    'sep-statmech': source('Statistical mechanics', 'Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/statphys-statmech/', 'A scholarly account of equilibrium, irreversibility, and the bridge between scales.', '关于平衡、不可逆性与跨尺度联系的学术综述。'),
    'utexas-boltzmann': source('Boltzmann distributions', 'University of Texas at Austin', 'https://farside.ph.utexas.edu/teaching/sm1/lectures/node61.html', 'Derives the canonical Boltzmann factor and the equilibrium weighting exp(−E/kT).', '推导正则系综中的玻尔兹曼因子以及平衡权重 exp(−E/kT)。'),
    'noaa-tectonics': source('Tectonic shift', 'NOAA', 'https://oceanservice.noaa.gov/facts/tectonics.html', 'How moving plates continually reshape Earth\'s crust.', '说明运动的板块如何持续重塑地壳。'),
    'nasa-insight': source('InSight science', 'NASA', 'https://science.nasa.gov/mission/insight/science/', 'How seismic signals reconstruct the inaccessible interiors of rocky planets.', '说明地震信号如何重建无法直接抵达的岩石行星内部。'),
    'nobel-1918': source('The 1918 Nobel Prize in Physics', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/1918/summary/', 'Planck\'s discovery of energy quanta.', '普朗克发现能量量子的官方资料。'),
    'nobel-1921': source('The 1921 Nobel Prize in Physics', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/1921/summary/', 'Einstein\'s law of the photoelectric effect.', '爱因斯坦光电效应定律的官方资料。'),
    'doe-nuclei': source('Nuclei', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsnuclei', 'Nuclear binding, stability, and what holds a nucleus together.', '介绍原子核结合、稳定性及维系原子核的作用。'),
    'doe-fusion': source('Fusion reactions', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsfusion-reactions', 'How fusion converts mass differences into stellar energy.', '说明聚变如何把质量差转化为恒星能量。'),
    'doe-superconductivity': source('Superconductivity', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainssuperconductivity', 'Zero resistance, paired electrons, and macroscopic quantum behavior.', '介绍零电阻、电子配对与宏观量子行为。'),
    'nobel-2016-topology': source('Topological phase transitions', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/2016/press-release/', 'Why some phases and transitions require topology rather than a simple local order parameter.', '说明某些相与相变为何需要拓扑，而不能只用局域序参量描述。'),
    'cern-antimatter': source('Antimatter', 'CERN', 'https://home.cern/science/physics/antimatter/', 'Antiparticles, the positron, and how antimatter is studied.', '介绍反粒子、正电子及反物质研究方法。'),
    'doe-accelerators': source('Particle accelerators', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsparticle-accelerators', 'How controlled collisions reveal short-lived particles and interactions.', '说明受控碰撞如何揭示短寿命粒子与相互作用。'),
    'doe-plasma': source('Plasma', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsplasma', 'Ionized matter, collective behavior, and plasma across the universe.', '介绍电离物质、集体行为与宇宙中的等离子体。'),
    'doe-plasma-confinement': source('Plasma confinement', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsplasma-confinement', 'How magnetic and inertial confinement hold fusion plasmas.', '说明磁约束与惯性约束如何限制聚变等离子体。'),
    'utexas-debye-shielding': source('Debye Shielding', 'University of Texas at Austin', 'https://farside.ph.utexas.edu/teaching/plasma/Plasmahtml/node7.html', 'Explains how mobile charges build a screening cloud and define the Debye length.', '解释可移动电荷如何建立屏蔽云并定义德拜长度。'),
    'utexas-magnetized-plasmas': source('Magnetized Plasmas', 'University of Texas at Austin', 'https://farside.ph.utexas.edu/teaching/plasma/Plasmahtml/node10.html', 'Explains gyromotion, cyclotron frequency, and gyroradius for charged particles in magnetic fields.', '解释带电粒子在磁场中的回旋运动、回旋频率和回旋半径。'),
    'nih-dna': source('DNA fact sheet', 'NIH / NHGRI', 'https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet', 'DNA structure, base pairing, replication, and molecular information.', '介绍 DNA 结构、碱基配对、复制与分子信息。'),
    'ncbi-membrane-potentials': source('The Forces that Create Membrane Potentials', 'NCBI Bookshelf', 'https://www.ncbi.nlm.nih.gov/books/NBK11102/', 'Textbook treatment of concentration gradients, selective permeability, and the Nernst relation for equilibrium membrane voltages.', '教科书式介绍浓度梯度、选择性通透性以及平衡膜电位的能斯特关系。'),
    'ncbi-resting-potential': source('The Ionic Basis of the Resting Membrane Potential', 'NCBI Bookshelf', 'https://www.ncbi.nlm.nih.gov/books/NBK10931/', 'Textbook discussion of how ion gradients and permeability measurements support resting-potential physics in real cells.', '教科书式讨论离子梯度和通透性测量如何支撑真实细胞中的静息膜电位物理。'),
    'nature-thymonucleate': source('Molecular Configuration in Sodium Thymonucleate', 'Nature', 'https://doi.org/10.1038/171740a0', 'Franklin and Gosling’s X-ray diffraction evidence for the molecular configuration of DNA.', 'Franklin 与 Gosling 关于 DNA 分子构型的 X 射线衍射证据。'),
    'nature-dna-structure': source('Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid', 'Nature', 'https://doi.org/10.1038/171737a0', 'Watson and Crick’s structure paper linking diffraction constraints to the double-helix model.', 'Watson 与 Crick 把衍射约束连接到双螺旋模型的结构论文。'),
    'cell-condensates': source('Biomolecular condensates', 'PubMed / Cell', 'https://pubmed.ncbi.nlm.nih.gov/25288112/', 'A peer-reviewed foundation for liquid-like compartments formed by phase separation.', '关于相分离形成液态细胞区室的同行评审基础文献。'),
    'sep-chaos': source('Chaos', 'Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/chaos/', 'Deterministic chaos, sensitive dependence, and predictability.', '介绍确定性混沌、初值敏感性与可预测性。'),
    'ams-lorenz': source('Lorenz and modular flows', 'American Mathematical Society', 'https://www.ams.org/publicoutreach/feature-column/fcarc-lorenz', 'A visual mathematical introduction to Lorenz\'s strange attractor.', '洛伦兹奇异吸引子的可视化数学导览。'),
    'cern-standard-model': source('The Standard Model', 'CERN', 'https://home.cern/science/physics/standard-model/', 'The particles, interactions, and limits of the Standard Model.', '介绍标准模型中的粒子、相互作用及其边界。'),
    'cern-higgs': source('The Higgs boson', 'CERN', 'https://home.cern/science/physics/higgs-boson/', 'The Higgs field, symmetry breaking, and particle masses.', '介绍希格斯场、对称性破缺与粒子质量。'),
    'doe-standard-model': source('The Standard Model of Particle Physics', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics', 'How the Standard Model organizes known matter, three forces, and where it stops.', '说明标准模型如何组织已知物质、三种作用力以及它的边界。'),
    'nobel-2015': source('The 2015 Nobel Prize in Physics', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/2015/press-release/', 'The press release on neutrino oscillations and the fact that neutrinos have mass.', '关于中微子振荡以及中微子具有质量的官方诺奖资料。'),
    'doe-quantum-computing': source('Quantum computing', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsquantum-computing', 'Qubits, superposition, entanglement, and quantum computation.', '介绍量子比特、叠加、纠缠与量子计算。'),
    'nobel-2022': source('The 2022 Nobel Prize in Physics', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/2022/popular-information/', 'Bell tests, entanglement, and quantum information science.', '介绍贝尔检验、量子纠缠与量子信息科学。'),
    'nature-no-cloning': source('A single quantum cannot be cloned', 'Nature', 'https://doi.org/10.1038/299802a0', 'The Wootters-Zurek no-cloning result, a primary source for unclonable unknown states.', 'Wootters 与 Zurek 的不可克隆定理原始文献。'),
    'nobel-1991': source('The 1991 Nobel Prize in Physics', 'Nobel Prize Outreach', 'https://www.nobelprize.org/prizes/physics/1991/summary/', 'de Gennes\'s work on liquid crystals and polymers.', '德热纳关于液晶与聚合物研究的官方资料。'),
    'doe-nanoscience': source('Nanoscience', 'U.S. Department of Energy', 'https://www.energy.gov/science/doe-explainsnanoscience', 'How structure and scale produce collective material properties.', '说明结构与尺度如何产生材料的集体性质。'),
    'rmp-active-matter': source('Hydrodynamics of soft active matter', 'Reviews of Modern Physics', 'https://doi.org/10.1103/RevModPhys.85.1143', 'A standard review of self-driven particles, collective motion, and active stresses.', '关于自驱粒子、集体运动与活性应力的标准综述。'),
    'purcell-low-re': source('Life at low Reynolds number', 'American Journal of Physics', 'https://doi.org/10.1119/1.10903', 'Purcell’s classic account of why small swimmers live in a viscosity-dominated regime.', 'Purcell 关于小尺度游动为何处于黏性主导区域的经典论文。')
  });

  function sourceEntry(entry) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'field-source-link';
    const meta = create('span', 'field-source-meta', entry.institution);
    const title = create('strong', null, entry.title);
    const summary = create('span', null, ` — ${pick(entry.summary)}`);
    link.append(meta, title, summary);
    item.append(link);
    return item;
  }

  function sourceList(sourceIds, className) {
    const list = create('ul', className);
    for (const sourceId of sourceIds || []) {
      if (!sources[sourceId]) throw new Error(`Missing field-enrichment source ${sourceId}`);
      list.append(sourceEntry(sources[sourceId]));
    }
    return list;
  }

  function pathFromPoints(points) {
    return points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(' ');
  }

  function rangeControl(definition, state, rerender) {
    const group = create('div', 'field-control-group');
    group.dataset.controlKey = definition.key;
    const label = document.createElement('label');
    label.htmlFor = `field-control-${definition.key}`;
    label.append(create('span', null, pick(definition.label)));
    const output = document.createElement('output');
    output.htmlFor = label.htmlFor;
    const read = value => definition.formatter ? definition.formatter(value) : format(value, definition.digits ?? 2);
    output.textContent = read(state[definition.key]);
    label.append(output);
    const input = document.createElement('input');
    input.type = 'range';
    input.id = label.htmlFor;
    input.dataset.controlKey = definition.key;
    input.min = definition.min;
    input.max = definition.max;
    input.step = definition.step;
    input.value = state[definition.key];
    input.addEventListener('input', () => {
      state[definition.key] = Number(input.value);
      output.textContent = read(state[definition.key]);
      rerender();
    });
    group.append(label, input);
    return group;
  }

  function toggleControl(definition, state, rerender) {
    const wrapper = create('div', 'field-control-group');
    wrapper.dataset.controlKey = definition.key;
    wrapper.append(create('label', null, pick(definition.label)));
    const host = create('div', 'field-toggle');
    host.dataset.controlKey = definition.key;
    for (const option of definition.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.controlValue = option.value;
      button.textContent = pick(option.label);
      const sync = () => button.setAttribute('aria-pressed', String(state[definition.key] === option.value));
      sync();
      button.addEventListener('click', () => {
        state[definition.key] = option.value;
        for (const candidate of host.children) candidate.setAttribute('aria-pressed', 'false');
        sync();
        rerender();
      });
      host.append(button);
    }
    wrapper.append(host);
    return wrapper;
  }

  function visualFrame(inner, footerLines = []) {
    return `
      <svg viewBox="0 0 520 280" role="img" aria-hidden="true">
        <rect x="0" y="0" width="520" height="280" rx="20" fill="rgba(7,10,18,0.96)"></rect>
        ${inner}
        ${footerLines.map((line, index) => `<text class="field-svg-label" x="18" y="${256 + index * 14}">${line}</text>`).join('')}
      </svg>`;
  }

  function astronomyOptics(state) {
    const aperture = state.aperture;
    const wavelength = state.wavelength;
    const thetaArcsec = 206265 * 1.22 * wavelength * 1e-9 / aperture;
    const spot = clamp(58 / aperture + wavelength / 65, 10, 40);
    const separation = clamp(spot * 1.7, 26, 90);
    return {
      svg: visualFrame(`
        <line class="field-svg-axis" x1="56" y1="58" x2="56" y2="212"></line>
        <line class="field-svg-axis" x1="56" y1="136" x2="286" y2="136"></line>
        <line class="field-svg-soft" x1="118" y1="68" x2="236" y2="136"></line>
        <line class="field-svg-soft" x1="118" y1="204" x2="236" y2="136"></line>
        <rect class="field-svg-fill" x="110" y="${136 - clamp(aperture * 8, 20, 78)}" width="16" height="${clamp(aperture * 16, 40, 156)}" rx="8"></rect>
        <circle cx="320" cy="116" r="${spot}" fill="rgba(0,212,255,0.13)"></circle>
        <circle cx="320" cy="116" r="${spot * 0.56}" fill="rgba(0,212,255,0.25)"></circle>
        <circle cx="320" cy="116" r="${spot * 0.22}" fill="#00d4ff"></circle>
        <circle cx="${320 + separation}" cy="158" r="${spot}" fill="rgba(255,209,102,0.13)"></circle>
        <circle cx="${320 + separation}" cy="158" r="${spot * 0.56}" fill="rgba(255,209,102,0.25)"></circle>
        <circle cx="${320 + separation}" cy="158" r="${spot * 0.22}" fill="#ffd166"></circle>
        <text class="field-svg-label" x="34" y="38">${zh() ? '口径 D' : 'aperture D'}</text>
        <text class="field-svg-label" x="238" y="126">${zh() ? '焦面' : 'focal plane'}</text>
        <text class="field-svg-label" x="286" y="50">${zh() ? '衍射主峰变窄' : 'larger D narrows the Airy core'}</text>
      `, [
        `${zh() ? '波长' : 'wavelength'} = ${format(wavelength, 0)} nm`,
        `${zh() ? '瑞利分辨极限' : 'Rayleigh limit'} ≈ ${thetaArcsec.toFixed(3)} arcsec`
      ]),
      status: zh()
        ? `口径增大时，衍射主峰按 1/D 缩窄；这里把会聚光线画成示意，角分辨率按圆孔公式计算。`
        : `Increasing aperture narrows the diffraction core as 1/D; the converging rays are schematic, while the angular resolution is calculated for a circular aperture.`
    };
  }

  function fluids(state) {
    const reynolds = state.reynolds;
    const separation = clamp((reynolds - 220) / 2200, 0, 1);
    const wake = separation * 48;
    const stream = [86, 118, 154, 188];
    const paths = stream.map(y => `M34 ${y} C 132 ${y - 4}, 156 ${y - 4}, 196 ${y - 4}
      S 254 ${y + (y < 136 ? -18 : 18)}, 288 ${y + (y < 136 ? -26 : 26)}
      S ${350 + wake} ${y + (y < 136 ? -24 : 24)}, 476 ${y + (y < 136 ? -10 : 10)}`);
    return {
      svg: visualFrame(`
        ${paths.map(path => `<path class="field-svg-secondary" d="${path}"></path>`).join('')}
        <circle cx="214" cy="136" r="38" class="field-svg-fill"></circle>
        ${separation > 0.08 ? `<path class="field-svg-accent" d="M252 120 C ${278 + wake} 84, ${324 + wake} 96, ${352 + wake} 120"></path>
          <path class="field-svg-accent" d="M252 152 C ${278 + wake} 188, ${324 + wake} 176, ${352 + wake} 152"></path>` : ''}
        ${separation > 0.45 ? `<circle cx="${332 + wake}" cy="112" r="12" fill="none" stroke="#ffd166" stroke-width="2"></circle>
          <circle cx="${356 + wake}" cy="164" r="12" fill="none" stroke="#ffd166" stroke-width="2"></circle>` : ''}
        <text class="field-svg-label" x="34" y="42">${zh() ? '来流' : 'incoming flow'}</text>
        <text class="field-svg-label" x="296" y="42">${zh() ? '尾迹与分离' : 'wake and separation'}</text>
      `, [
        `Re = ${format(reynolds, 0)}`,
        separation < 0.18
          ? (zh() ? '分层、附着的流线示意' : 'layered, attached streamlines')
          : separation < 0.55
            ? (zh() ? '过渡区：尾迹开始放大' : 'transitional wake begins to grow')
            : (zh() ? '尾迹主导；真正转捩仍取决于几何与扰动' : 'wake-dominated; real transition still depends on geometry and disturbance')
      ]),
      status: zh()
        ? '这里只画出圆柱绕流的代表性变化。雷诺数能组织直觉，但“哪一个 Re 一定转捩”并不是普适常数。'
        : 'This sketch shows representative flow past a cylinder. Reynolds number organizes the intuition, but no single critical value is universal across all geometries.'
    };
  }

  function acoustics(state) {
    const mode = Math.round(state.mode);
    const boundary = state.boundary;
    const harmonics = boundary === 'open-open' ? mode : 2 * mode - 1;
    const points = [];
    for (let x = 0; x <= 360; x += 6) {
      const phase = x / 360;
      const amplitude = boundary === 'open-open'
        ? Math.sin(Math.PI * harmonics * phase)
        : Math.sin(Math.PI * harmonics * phase / 2);
      points.push([92 + x, 138 - amplitude * 56]);
    }
    const nodes = [];
    for (let index = 0; index <= (boundary === 'open-open' ? harmonics : mode - 1); index++) {
      const x = boundary === 'open-open'
        ? 92 + (360 * index) / harmonics
        : 92 + (360 * index) / harmonics;
      nodes.push(x);
    }
    return {
      svg: visualFrame(`
        <rect x="92" y="86" width="360" height="104" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"></rect>
        <path class="field-svg-accent" d="${pathFromPoints(points)}"></path>
        ${nodes.map(x => `<circle cx="${x}" cy="138" r="5" fill="#ffd166"></circle>`).join('')}
        ${boundary === 'open-closed'
          ? `<line x1="452" y1="86" x2="452" y2="190" stroke="#ffd166" stroke-width="6" stroke-linecap="round"></line>`
          : ''}
        <text class="field-svg-label" x="92" y="64">${boundary === 'open-open'
          ? (zh() ? '两端开口：整数谐波' : 'open-open pipe: integer harmonics')
          : (zh() ? '一端封闭：只有奇次模' : 'open-closed pipe: odd modes only')}</text>
      `, [
        `${zh() ? '所示简正模' : 'mode shown'} = ${mode}`,
        `${zh() ? '对应谐波' : 'harmonic index'} = ${harmonics}`
      ]),
      status: zh()
        ? '节点和腹部由边界条件决定；这里把声压振幅画成一维截面，而不是管内真实三维空气运动。'
        : 'Nodes and antinodes are set by the boundary condition; the drawing shows a one-dimensional pressure mode, not the full three-dimensional air motion in the pipe.'
    };
  }

  function thermodynamics(state) {
    const hot = state.hot;
    const cold = Math.min(state.cold, hot - 5);
    const eta = clamp(1 - cold / hot, 0, 1);
    const energies = [0, 1, 2, 3, 4];
    const bars = temperature => {
      const weights = energies.map(level => Math.exp(-level / (temperature / 210)));
      const sum = weights.reduce((left, right) => left + right, 0);
      return weights.map(weight => weight / sum);
    };
    const hotBars = bars(hot);
    const coldBars = bars(cold);
    return {
      svg: visualFrame(`
        <rect x="44" y="72" width="104" height="112" rx="18" fill="rgba(255,107,157,0.16)" stroke="#ff6b9d"></rect>
        <rect x="372" y="72" width="104" height="112" rx="18" fill="rgba(0,212,255,0.16)" stroke="#00d4ff"></rect>
        <rect x="206" y="92" width="108" height="72" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"></rect>
        <path class="field-svg-accent" d="M150 100 C 188 100, 188 92, 206 92"></path>
        <path class="field-svg-secondary" d="M314 164 C 352 164, 352 176, 372 176"></path>
        <path d="M248 92 L268 92 L268 ${92 - eta * 50}" stroke="#ffd166" stroke-width="8" stroke-linecap="round"></path>
        ${hotBars.map((value, index) => `<rect x="${58 + index * 18}" y="${168 - value * 70}" width="12" height="${value * 70}" fill="#ff6b9d"></rect>`).join('')}
        ${coldBars.map((value, index) => `<rect x="${386 + index * 18}" y="${168 - value * 70}" width="12" height="${value * 70}" fill="#00d4ff"></rect>`).join('')}
        <text class="field-svg-label" x="52" y="58">${zh() ? '高温库' : 'hot reservoir'}</text>
        <text class="field-svg-label" x="384" y="58">${zh() ? '低温库' : 'cold reservoir'}</text>
        <text class="field-svg-label" x="226" y="128">${zh() ? '可逆极限' : 'reversible limit'}</text>
      `, [
        `T_h = ${format(hot, 0)} K, T_c = ${format(cold, 0)} K`,
        `${zh() ? '卡诺效率上限' : 'Carnot ceiling'} = ${eta.toFixed(3)}`
      ]),
      status: zh()
        ? '箭头宽度只表示热流去向与效率上限；左、右柱形图则表示高温与低温下微观能量分布的宽窄。'
        : 'Arrow widths only indicate the heat-flow bookkeeping and efficiency ceiling; the bar sets show how hot and cold ensembles spread across microscopic energy levels.'
    };
  }

  function electromagnetism(state) {
    const fluxRate = state.fluxRate;
    const strength = state.fieldStrength;
    const emf = Math.abs(fluxRate * strength);
    const current = fluxRate >= 0 ? (zh() ? '逆时针' : 'counterclockwise') : (zh() ? '顺时针' : 'clockwise');
    const markers = [];
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 4; column++) {
        const x = 170 + column * 46;
        const y = 76 + row * 44;
        const mark = fluxRate >= 0 ? '⊗' : '⊙';
        markers.push(`<text class="field-svg-label" x="${x}" y="${y}">${mark}</text>`);
      }
    }
    return {
      svg: visualFrame(`
        ${markers.join('')}
        <circle cx="250" cy="138" r="78" class="field-svg-secondary"></circle>
        <path class="field-svg-accent" d="M250 60 A 78 78 0 0 1 328 138"></path>
        <polygon points="${fluxRate >= 0 ? '326,130 344,138 326,146' : '174,130 156,138 174,146'}" fill="#ffd166"></polygon>
        <line x1="72" y1="138" x2="140" y2="138" stroke="#ff6b9d" stroke-width="${6 + emf * 6}" stroke-linecap="round"></line>
        <line x1="360" y1="138" x2="428" y2="138" stroke="#ff6b9d" stroke-width="${6 + emf * 6}" stroke-linecap="round"></line>
        <text class="field-svg-label" x="42" y="114">${zh() ? '磁通变化' : 'changing flux'}</text>
        <text class="field-svg-label" x="190" y="232">${zh() ? '感应回路' : 'induced loop'}</text>
      `, [
        `${zh() ? '相对磁通变化率' : 'relative flux-change rate'} = ${fluxRate.toFixed(2)}`,
        `${zh() ? '感应电流方向' : 'induced current direction'}: ${current}`
      ]),
      status: zh()
        ? `楞次定律要求感应电流反抗磁通变化；这里用符号表示磁场穿出或穿入纸面，电动势大小只按相对比例缩放。`
        : `Lenz's law makes the induced current oppose the flux change; the symbols show field direction through the page, and the emf magnitude is scaled only relatively.`
    };
  }

  function statistical(state) {
    const gap = state.gap;
    const temperature = state.temperature;
    const levels = [0, gap, 2 * gap, 3 * gap];
    const weights = levels.map(level => Math.exp(-level / Math.max(0.08, temperature)));
    const sum = weights.reduce((left, right) => left + right, 0);
    const probabilities = weights.map(weight => weight / sum);
    return {
      svg: visualFrame(`
        <line class="field-svg-axis" x1="88" y1="198" x2="448" y2="198"></line>
        <line class="field-svg-axis" x1="88" y1="54" x2="88" y2="198"></line>
        ${levels.map((level, index) => `
          <line x1="122" x2="410" y1="${182 - level * 30}" y2="${182 - level * 30}" class="field-svg-soft"></line>
          <rect x="${126 + index * 72}" y="${198 - probabilities[index] * 126}" width="42" height="${probabilities[index] * 126}" fill="${index === 0 ? '#ffd166' : '#00d4ff'}"></rect>
        `).join('')}
        <text class="field-svg-label" x="98" y="42">${zh() ? '平衡占据概率' : 'equilibrium occupation'}</text>
      `, [
        `ΔE = ${gap.toFixed(2)} ${zh() ? '（以 kT 为单位读图）' : '(read against kT)'}`,
        `${zh() ? '基态占据' : 'ground-state occupation'} = ${probabilities[0].toFixed(3)}`
      ]),
      status: zh()
        ? '各柱高按玻尔兹曼因子归一化；这张图只表示离散能级的平衡概率，而不是系统随时间如何弛豫到平衡。'
        : 'The bars are Boltzmann-weighted and normalized; the picture shows equilibrium occupation across discrete energy levels, not the time-dependent path by which a real system relaxes there.'
    };
  }

  function geophysics(state) {
    const angle = state.takeoff;
    const mode = state.wave;
    const blocked = mode === 'S';
    const startX = 250 + Math.cos((220 - angle) * Math.PI / 180) * 146;
    const startY = 138 + Math.sin((220 - angle) * Math.PI / 180) * 146;
    const boundaryX = 250 - Math.cos(angle * Math.PI / 180) * 78;
    const boundaryY = 138 + Math.sin(angle * Math.PI / 180) * 78;
    return {
      svg: visualFrame(`
        <circle cx="250" cy="138" r="148" fill="rgba(0,212,255,0.06)" stroke="rgba(255,255,255,0.12)"></circle>
        <circle cx="250" cy="138" r="98" fill="rgba(255,209,102,0.08)" stroke="rgba(255,255,255,0.10)"></circle>
        <circle cx="250" cy="138" r="54" fill="rgba(255,107,157,0.10)" stroke="rgba(255,255,255,0.10)"></circle>
        <path class="field-svg-secondary" d="M ${startX} ${startY} Q 248 166 ${boundaryX} ${boundaryY}"></path>
        ${blocked
          ? `<path class="field-svg-accent" d="M ${boundaryX} ${boundaryY} L ${boundaryX - 36} ${boundaryY + 18}"></path>
             <text class="field-svg-label" x="112" y="58">${zh() ? 'S 波在液态外核被阻断' : 'S wave blocked by the liquid outer core'}</text>`
          : `<path class="field-svg-accent" d="M ${boundaryX} ${boundaryY} Q 250 138 ${520 - startX} ${startY}"></path>
             <text class="field-svg-label" x="118" y="58">${zh() ? 'P 波折射后继续穿过地核' : 'P wave refracts and continues through the core'}</text>`}
        <text class="field-svg-label" x="170" y="238">${zh() ? '同心层仅为示意' : 'concentric layers shown schematically'}</text>
      `, [
        `${mode} ${zh() ? '波' : 'wave'}; ${zh() ? '入射角' : 'takeoff angle'} = ${format(angle, 0)}°`,
        blocked ? (zh() ? '剪切波阴影区帮助识别液态外核' : 'the shear-wave shadow helps identify the liquid outer core')
          : (zh() ? '纵波速度随层结构变化而折射' : 'compressional-wave speed changes refract the ray path')
      ]),
      status: zh()
        ? '真实地震层析把大量射线与走时反演结合起来；这里只展示最关键的逻辑：液体不支持剪切波，而不同层的速度差会使地震波折射。'
        : 'Real seismology combines many rays and travel-time inversions; this panel isolates the key logic: liquids do not support shear waves, and speed contrasts between layers refract the seismic path.'
    };
  }

  function quantumTheory(state) {
    const nuRatio = state.frequency;
    const intensity = state.intensity;
    const emitted = nuRatio > 1;
    const kinetic = emitted ? (nuRatio - 1) * 2.2 : 0;
    const photonCount = Math.round(2 + intensity * 2);
    return {
      svg: visualFrame(`
        <rect x="58" y="170" width="404" height="16" rx="8" fill="rgba(255,255,255,0.12)"></rect>
        ${Array.from({ length: photonCount }, (_, index) => {
          const x = 84 + index * 56;
          return `<path class="field-svg-secondary" d="M ${x} 84 Q ${x + 16} 66, ${x + 32} 84 T ${x + 64} 84"></path>`;
        }).join('')}
        ${emitted ? `<circle cx="312" cy="${148 - kinetic * 18}" r="7" fill="#ffd166"></circle>
          <path class="field-svg-accent" d="M 262 162 Q 286 144, 308 ${150 - kinetic * 18}"></path>` : ''}
        <line x1="92" y1="126" x2="428" y2="126" class="field-svg-soft"></line>
        <line x1="92" y1="94" x2="428" y2="94" class="field-svg-axis"></line>
        <text class="field-svg-label" x="92" y="84">${zh() ? '阈频 ν₀' : 'threshold ν₀'}</text>
        <text class="field-svg-label" x="58" y="212">${zh() ? '金属表面' : 'metal surface'}</text>
      `, [
        `ν/ν₀ = ${nuRatio.toFixed(2)}`,
        emitted
          ? `${zh() ? '有电子逸出；动能随频率增加' : 'electrons are emitted; kinetic energy rises with frequency'}`
          : `${zh() ? '没有电子逸出；再亮也不行' : 'no electrons are emitted, no matter how bright the beam is'}`
      ]),
      status: zh()
        ? '强度在这张图里只改变入射光子的数量；只有频率跨过阈值，逸出电子才会出现并获得额外动能。'
        : 'In this sketch intensity changes the number of incident quanta; only crossing the threshold frequency produces photoelectrons and gives them extra kinetic energy.'
    };
  }

  function nuclear(state) {
    const mass = state.mass;
    const curve = [];
    const binding = A => {
      const rise = 8.8 * (1 - Math.exp(-A / 16));
      const heavyPenalty = 0.013 * Math.max(0, A - 56);
      return clamp(rise - heavyPenalty, 0.8, 8.9);
    };
    for (let A = 2; A <= 240; A += 4) {
      curve.push([88 + (A - 2) / 238 * 338, 210 - binding(A) * 18]);
    }
    const currentY = 210 - binding(mass) * 18;
    const region = mass < 40 ? 'fusion' : mass > 120 ? 'fission' : 'peak';
    return {
      svg: visualFrame(`
        <line class="field-svg-axis" x1="84" y1="210" x2="442" y2="210"></line>
        <line class="field-svg-axis" x1="84" y1="54" x2="84" y2="210"></line>
        <path class="field-svg-accent" d="${pathFromPoints(curve)}"></path>
        <circle cx="${88 + (mass - 2) / 238 * 338}" cy="${currentY}" r="7" fill="#ffd166"></circle>
        <text class="field-svg-label" x="112" y="74">${zh() ? '轻核聚变放能' : 'fusion releases energy on the light side'}</text>
        <text class="field-svg-label" x="274" y="74">${zh() ? '重核裂变放能' : 'fission releases energy on the heavy side'}</text>
      `, [
        `A = ${format(mass, 0)}`,
        `${zh() ? '每核子结合能' : 'binding energy per nucleon'} ≈ ${binding(mass).toFixed(2)} MeV`
      ]),
      status: region === 'fusion'
        ? (zh() ? '向铁峰靠近时，轻核通过聚变增加平均结合能。' : 'On the light side, moving toward the iron peak raises the average binding energy through fusion.')
        : region === 'fission'
          ? (zh() ? '极重核可通过裂变靠近铁峰，释放能量。' : 'Very heavy nuclei can release energy by fissioning back toward the iron peak.')
          : (zh() ? '铁峰附近最稳，聚变与裂变都难再额外放能。' : 'Near the iron peak nuclei are most tightly bound, so neither fusion nor fission yields much extra energy.')
    };
  }

  function condensed(state) {
    const gap = state.gap;
    const filling = state.filling;
    const type = gap < 0.15 ? 'metal' : gap < 1.5 ? 'semiconductor' : 'insulator';
    const fermi = 198 - filling * 102;
    const dots = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        dots.push([148 + col * 34, 210 - row * 18]);
      }
    }
    return {
      svg: visualFrame(`
        <rect x="126" y="170" width="192" height="44" rx="12" fill="rgba(255,209,102,0.12)" stroke="#ffd166"></rect>
        <rect x="126" y="${98 - gap * 18}" width="192" height="42" rx="12" fill="rgba(0,212,255,0.12)" stroke="#00d4ff"></rect>
        <line x1="112" y1="${fermi}" x2="338" y2="${fermi}" class="field-svg-soft"></line>
        ${dots.filter((_, index) => index / dots.length < filling).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd166"></circle>`).join('')}
        <text class="field-svg-label" x="348" y="${112 - gap * 18}">${zh() ? '导带' : 'conduction band'}</text>
        <text class="field-svg-label" x="348" y="194">${zh() ? '价带' : 'valence band'}</text>
        <text class="field-svg-label" x="348" y="${fermi - 6}">${zh() ? '费米能级' : 'Fermi level'}</text>
      `, [
        `${zh() ? '能隙' : 'band gap'} = ${gap.toFixed(2)} eV`,
        type === 'metal'
          ? (zh() ? '能级重叠或部分填充：金属性' : 'overlap or partial filling: metallic response')
          : type === 'semiconductor'
            ? (zh() ? '有限能隙：热或掺杂可激发载流子' : 'finite gap: heat or doping can create carriers')
            : (zh() ? '大能隙：常温下几乎无载流子' : 'large gap: very few carriers at room temperature')
      ]),
      status: zh()
        ? '能带画成连续条带，而非逐个晶格动量态；真正材料还可能因强关联、拓扑或声子耦合而偏离这张简单图。'
        : 'Bands are drawn as continuous strips rather than individual crystal-momentum states; real materials can depart from this simple picture through strong correlations, topology, or phonon coupling.'
    };
  }

  function particle(state) {
    const momentum = state.momentum;
    const fieldStrength = state.fieldStrength;
    const sign = state.charge;
    const radius = clamp(46 + momentum * 48 / Math.max(0.4, fieldStrength), 60, 210);
    const sweep = sign > 0 ? -1 : 1;
    const endX = 250 + Math.cos((sweep * 64 - 90) * Math.PI / 180) * radius;
    const endY = 212 + Math.sin((sweep * 64 - 90) * Math.PI / 180) * radius;
    return {
      svg: visualFrame(`
        <circle cx="250" cy="212" r="28" fill="rgba(255,255,255,0.08)"></circle>
        <circle cx="250" cy="212" r="72" fill="none" stroke="rgba(255,255,255,0.10)"></circle>
        <circle cx="250" cy="212" r="122" fill="none" stroke="rgba(255,255,255,0.10)"></circle>
        <circle cx="250" cy="212" r="170" fill="none" stroke="rgba(255,255,255,0.10)"></circle>
        <path class="field-svg-accent" d="M 250 212 A ${radius} ${radius} 0 0 ${sign > 0 ? 0 : 1} ${endX} ${endY}"></path>
        <rect x="${endX - 18}" y="${endY - 18}" width="36" height="36" fill="rgba(0,212,255,0.18)" stroke="#00d4ff"></rect>
        <text class="field-svg-label" x="34" y="42">${zh() ? '分层探测器' : 'layered detector'}</text>
        <text class="field-svg-label" x="304" y="84">${zh() ? '轨迹曲率 → p/(qB)' : 'track curvature → p/(qB)'}</text>
      `, [
        `${zh() ? '相对动量' : 'relative momentum'} = ${momentum.toFixed(2)}`,
        `${zh() ? '电荷符号' : 'charge sign'} = ${sign > 0 ? '+' : '−'}`
      ]),
      status: zh()
        ? '真实重建会把无数击中点、能量沉积和时间信息联合起来；这张图只保留磁场中曲率随 p/(qB) 变化的核心逻辑。'
        : 'Real reconstruction combines many hits, energies, and timing channels; this sketch keeps only the core idea that the magnetic curvature scales with p/(qB).'
    };
  }

  function plasma(state) {
    const density = state.density;
    const field = state.field;
    const lambda = 84 / Math.sqrt(density);
    const gyro = 34 / field;
    const curve = [];
    for (let x = 0; x <= 180; x += 4) {
      curve.push([74 + x, 142 - 56 * Math.exp(-x / lambda)]);
    }
    const spiral = [];
    for (let step = 0; step <= 120; step++) {
      const angle = step / 12;
      spiral.push([352 + step, 164 - Math.sin(angle) * gyro - step * 0.42]);
    }
    return {
      svg: visualFrame(`
        <line class="field-svg-axis" x1="66" y1="188" x2="248" y2="188"></line>
        <line class="field-svg-axis" x1="66" y1="86" x2="66" y2="188"></line>
        <path class="field-svg-secondary" d="${pathFromPoints(curve)}"></path>
        <path class="field-svg-accent" d="${pathFromPoints(spiral)}"></path>
        <text class="field-svg-label" x="58" y="62">${zh() ? '德拜屏蔽' : 'Debye screening'}</text>
        <text class="field-svg-label" x="300" y="62">${zh() ? '磁场中的回旋轨道' : 'gyromotion in B'}</text>
      `, [
        `${zh() ? '相对密度' : 'relative density'} = ${density.toFixed(2)}`,
        `${zh() ? '屏蔽长度随 1/√n 缩短；回旋半径随 1/B 缩短' : 'screening shrinks as 1/√n; gyroradius shrinks as 1/B'}`
      ]),
      status: zh()
        ? '左图把测试电荷势近似成指数衰减，右图只画单粒子在均匀磁场中的二维投影；真实等离子体还会出现波、碰撞与不稳定性。'
        : 'The left panel approximates the test-charge potential with exponential screening, while the right keeps only a single-particle orbit projected into 2D; real plasmas also host waves, collisions, and instabilities.'
    };
  }

  function biophysics(state) {
    const ratio = state.ratio;
    const potential = 61.5 * Math.log10(ratio);
    const outside = Math.round(12 + ratio * 3);
    const inside = Math.round(38 / Math.max(0.3, ratio));
    return {
      svg: visualFrame(`
        <rect x="230" y="66" width="18" height="148" rx="9" fill="rgba(255,255,255,0.16)"></rect>
        <rect x="270" y="66" width="18" height="148" rx="9" fill="rgba(255,255,255,0.16)"></rect>
        ${Array.from({ length: outside }, (_, index) => `<circle cx="${88 + (index % 6) * 18}" cy="${84 + Math.floor(index / 6) * 18}" r="5" fill="#00d4ff"></circle>`).join('')}
        ${Array.from({ length: inside }, (_, index) => `<circle cx="${338 + (index % 6) * 18}" cy="${84 + Math.floor(index / 6) * 18}" r="5" fill="#ffd166"></circle>`).join('')}
        <path class="field-svg-accent" d="M 214 138 C 238 118, 280 118, 304 138"></path>
        <text class="field-svg-label" x="56" y="58">${zh() ? '膜外浓度' : 'outside concentration'}</text>
        <text class="field-svg-label" x="326" y="58">${zh() ? '膜内浓度' : 'inside concentration'}</text>
      `, [
        `${zh() ? '浓度比 cₒ/cᵢ' : 'concentration ratio cₒ/cᵢ'} = ${ratio.toFixed(2)}`,
        `${zh() ? '能斯特平衡电位' : 'Nernst equilibrium potential'} ≈ ${potential.toFixed(1)} mV`
      ]),
      status: zh()
        ? '这里固定离子价数 z = +1 和体温近似，所以只展示浓度差与平衡电位的联系；真正膜电位通常由多种离子共同决定。'
        : 'The panel fixes the ion valence at z = +1 and uses body-temperature scaling, so it isolates the concentration-potential link; real membrane voltages usually reflect several ion species at once.'
    };
  }

  function nonlinear(state) {
    const r = state.r;
    let x = 0.26;
    for (let index = 0; index < 120; index++) x = r * x * (1 - x);
    const orbit = [];
    for (let index = 0; index < 32; index++) {
      x = r * x * (1 - x);
      orbit.push(x);
    }
    const unique = new Set(orbit.map(value => value.toFixed(3))).size;
    const scatter = [];
    for (let sample = 0; sample < 90; sample++) {
      const sampleR = 2.6 + sample / 90 * 1.35;
      let value = 0.32;
      for (let index = 0; index < 90; index++) value = sampleR * value * (1 - value);
      for (let index = 0; index < 10; index++) {
        value = sampleR * value * (1 - value);
        scatter.push([84 + (sampleR - 2.6) / 1.35 * 344, 214 - value * 138]);
      }
    }
    return {
      svg: visualFrame(`
        <line class="field-svg-axis" x1="84" y1="214" x2="438" y2="214"></line>
        <line class="field-svg-axis" x1="84" y1="56" x2="84" y2="214"></line>
        ${scatter.map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="1.3" fill="rgba(0,212,255,0.42)"></circle>`).join('')}
        ${orbit.map(value => `<circle cx="${84 + (r - 2.6) / 1.35 * 344}" cy="${214 - value * 138}" r="3.2" fill="#ffd166"></circle>`).join('')}
        <line x1="${84 + (r - 2.6) / 1.35 * 344}" y1="56" x2="${84 + (r - 2.6) / 1.35 * 344}" y2="214" stroke="#ff6b9d" stroke-width="2"></line>
        <text class="field-svg-label" x="118" y="44">${zh() ? '逻辑斯蒂映射分岔图' : 'bifurcation diagram of the logistic map'}</text>
      `, [
        `r = ${r.toFixed(3)}`,
        unique < 3
          ? (zh() ? '收敛到固定点或短周期轨道' : 'settles onto a fixed point or short cycle')
          : unique < 10
            ? (zh() ? '进入倍周期区' : 'period-doubling regime')
            : (zh() ? '长时间呈现混沌轨道' : 'long-term chaotic orbit')
      ]),
      status: zh()
        ? '黄色点显示当前参数下的长期轨道，蓝色背景显示整体分岔结构；这是离散映射而非天气本身，却抓住了“确定却难长期预报”的核心。'
        : 'The yellow points show the long-term orbit at the chosen parameter while the blue cloud gives the wider bifurcation structure; this is a discrete map rather than the weather itself, but it captures the heart of deterministic unpredictability.'
    };
  }

  function standardModel(state) {
    const phase = state.phase;
    const broken = phase === 'broken';
    return {
      svg: visualFrame(`
        <rect x="52" y="88" width="130" height="120" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"></rect>
        <rect x="194" y="88" width="130" height="120" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"></rect>
        <rect x="336" y="88" width="130" height="120" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"></rect>
        <text class="field-svg-label" x="82" y="114">${zh() ? '强作用' : 'strong'}</text>
        <text class="field-svg-label" x="218" y="114">${zh() ? '弱作用' : 'weak'}</text>
        <text class="field-svg-label" x="352" y="114">${zh() ? '电磁' : 'electromagnetic'}</text>
        <circle cx="118" cy="154" r="18" fill="rgba(255,107,157,0.18)" stroke="#ff6b9d"></circle>
        <circle cx="260" cy="154" r="${broken ? 20 : 16}" fill="rgba(255,209,102,0.18)" stroke="#ffd166"></circle>
        <circle cx="292" cy="154" r="${broken ? 20 : 16}" fill="rgba(255,209,102,0.18)" stroke="#ffd166"></circle>
        <circle cx="402" cy="154" r="16" fill="rgba(0,212,255,0.18)" stroke="#00d4ff"></circle>
        ${broken ? `<ellipse cx="260" cy="230" rx="128" ry="22" fill="rgba(126,232,197,0.12)" stroke="#7ee8c5"></ellipse>
          <text class="field-svg-label" x="162" y="235">${zh() ? '非零 Higgs 真空期望值' : 'nonzero Higgs vacuum value'}</text>`
        : `<line x1="124" y1="230" x2="396" y2="230" class="field-svg-soft"></line>
          <text class="field-svg-label" x="170" y="235">${zh() ? '对称相：未分裂成光子与 Z' : 'symmetric phase before photon/Z split'}</text>`}
      `, [
        broken
          ? (zh() ? '对称性破缺后，W 与 Z 变重而光子保持无静质量' : 'after symmetry breaking, W and Z become massive while the photon stays massless')
          : (zh() ? '高能对称相中，电弱场先作为统一结构出现' : 'in the high-energy symmetric phase the electroweak fields appear before the low-energy split')
      ]),
      status: zh()
        ? '这是按规范群与希格斯机制组织的教学示意，不是费曼图，也不试图画出完整拉氏量或所有味道与混合角。'
        : 'This is a teaching schematic organized by the gauge groups and Higgs mechanism; it is not a Feynman diagram and does not attempt to show the full Lagrangian, flavour structure, or mixing angles.'
    };
  }

  function quantumInformation(state) {
    const theta = state.theta * Math.PI / 180;
    const phi = state.phi * Math.PI / 180;
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const zComponent = Math.cos(theta);
    const p0 = Math.cos(theta / 2) ** 2;
    const p1 = Math.sin(theta / 2) ** 2;
    return {
      svg: visualFrame(`
        <circle cx="178" cy="140" r="86" fill="none" stroke="rgba(255,255,255,0.14)"></circle>
        <ellipse cx="178" cy="140" rx="86" ry="26" fill="none" stroke="rgba(255,255,255,0.08)"></ellipse>
        <line x1="92" y1="140" x2="264" y2="140" class="field-svg-soft"></line>
        <line x1="178" y1="54" x2="178" y2="226" class="field-svg-soft"></line>
        <line x1="178" y1="140" x2="${178 + x * 72}" y2="${140 - zComponent * 72}" class="field-svg-accent"></line>
        <circle cx="${178 + x * 72}" cy="${140 - zComponent * 72}" r="7" fill="#ffd166"></circle>
        <rect x="330" y="${78 + (1 - p0) * 92}" width="30" height="${p0 * 92}" fill="#00d4ff"></rect>
        <rect x="392" y="${78 + (1 - p1) * 92}" width="30" height="${p1 * 92}" fill="#ff6b9d"></rect>
        <text class="field-svg-label" x="150" y="40">${zh() ? 'Bloch 球' : 'Bloch sphere'}</text>
        <text class="field-svg-label" x="322" y="56">${zh() ? 'Z 基测量概率' : 'Z-basis measurement probabilities'}</text>
      `, [
        `P(0) = ${p0.toFixed(3)}, P(1) = ${p1.toFixed(3)}`,
        `${zh() ? '相位改变会旋转态矢，但不会单独改变 Z 基测量概率' : 'changing the phase rotates the state vector without by itself changing Z-basis readout'}`
      ]),
      status: zh()
        ? '这张 Bloch 球只描述单个量子比特；纠缠、不可克隆与纠错要靠多个量子比特之间的联合态空间。'
        : 'This Bloch sphere covers only a single qubit; entanglement, no-cloning limits, and error correction live in the joint state space of multiple qubits.'
    };
  }

  function softMatter(state) {
    const mode = state.mode;
    if (mode === 'active') {
      const alignment = state.activity;
      const arrows = Array.from({ length: 18 }, (_, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const angle = (alignment * 0.8 + row * 0.12 - col * 0.08) * Math.PI;
        const x = 84 + col * 60;
        const y = 90 + row * 44;
        const dx = Math.cos(angle) * 20;
        const dy = Math.sin(angle) * 20;
        return `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="#00d4ff" stroke-width="3" stroke-linecap="round"></line>`;
      }).join('');
      return {
        svg: visualFrame(`
          ${arrows}
          <rect x="66" y="62" width="388" height="148" rx="18" fill="none" stroke="rgba(255,255,255,0.10)"></rect>
          <text class="field-svg-label" x="84" y="42">${zh() ? '自驱粒子在局域对齐后形成集体流' : 'self-driven particles align locally and create collective flow'}</text>
        `, [
          `${zh() ? '对齐强度' : 'alignment strength'} = ${state.activity.toFixed(2)}`,
          `${zh() ? '远离平衡的有序运动' : 'ordered motion sustained far from equilibrium'}`
        ]),
        status: zh()
          ? '每根箭头代表一个持续耗能的单元，而不是热平衡中的布朗粒子；这里只强调对齐与群体流，不画出完整流体应力。'
          : 'Each arrow is an energy-consuming unit rather than a Brownian particle at equilibrium; the sketch highlights alignment and collective flow, not the full hydrodynamic stress field.'
      };
    }
    const extension = state.extension;
    const points = [];
    for (let index = 0; index <= 20; index++) {
      const x = 90 + index * 16;
      const wiggle = (1 - extension) * Math.sin(index * 1.1) * 22;
      points.push([x, 144 + wiggle]);
    }
    return {
      svg: visualFrame(`
        <path class="field-svg-accent" d="${pathFromPoints(points)}"></path>
        <line x1="90" y1="144" x2="430" y2="144" class="field-svg-soft"></line>
        <line x1="430" y1="144" x2="${430 + extension * 30}" y2="144" stroke="#ffd166" stroke-width="5" stroke-linecap="round"></line>
        <text class="field-svg-label" x="90" y="54">${zh() ? '聚合物越被拉直，可及构型越少' : 'stretching removes accessible polymer conformations'}</text>
      `, [
        `${zh() ? '归一化伸长' : 'normalized extension'} = ${extension.toFixed(2)}`,
        `${zh() ? '回缩力主要来自熵损失' : 'the restoring force is largely entropic'}`
      ]),
      status: zh()
        ? '这根链条被粗粒化成一条随机折线；真正聚合物的弹性还会受链刚性、溶剂和缠结影响。'
        : 'The chain is coarse-grained into a random walk; real polymer elasticity also depends on chain stiffness, solvent quality, and entanglement.'
    };
  }

  const visualRenderers = Object.freeze({
    'astronomy-optics': astronomyOptics,
    fluids,
    acoustics,
    thermodynamics,
    electromagnetism,
    statistical,
    geophysics,
    'quantum-theory': quantumTheory,
    nuclear,
    condensed,
    particle,
    plasma,
    biophysics,
    nonlinear,
    'standard-model': standardModel,
    'quantum-information': quantumInformation,
    'soft-matter': softMatter
  });

  const enrichments = Object.freeze({
    'astronomy-optics': {
      questions: [
        question('What part of a distant source is real, and what part belongs to the instrument?', '遥远天体的哪一部分来自真实物体，哪一部分来自仪器本身？', 'Observational optics keeps separating source structure from instrumental blur, detector response, and atmosphere. The field is fundamentally about honest inference from mediated light.', '观测光学不断把源本身的结构与仪器模糊、探测器响应以及大气扰动区分开来。这个领域本质上是在讨论：经过光学系统中介后，我们还能诚实地推出什么。'),
        question('Which measurements survive distance?', '哪些测量能跨越巨大距离仍然成立？', 'Position on the sky, angular separation, spectrum, brightness, polarization, and timing can all survive the trip, but each survives only after calibration. The image is a measurement pipeline, not a neutral photograph.', '天球位置、角距离、光谱、亮度、偏振和到达时序都可能保存下来，但都要经过定标才能成立。图像不是中性的照片，而是一条测量链。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Aperture versus wavelength', '口径与波长的较量', 'For fine detail the central contest is between aperture and wavelength: the wave nature of light sets a resolution floor around λ/D even for perfect mirrors.', '要看清细节，核心对抗来自口径与波长：哪怕镜面完美，光的波动性也会把分辨率限制在大约 λ/D 的量级。'),
        scaleCard('Helpful approximation', '常用近似', 'Paraxial rays for image geometry', '用近轴光线处理成像几何', 'Ray tracing is powerful when angles stay small and surfaces are smooth. It tells you where images form and how magnification changes before diffraction becomes dominant.', '当角度较小、表面较光滑时，近轴光线近似很有力量。它先告诉你像形成在哪里、放大率如何变化，然后才轮到衍射接管。'),
        scaleCard('Where it fails', '何时失效', 'Diffraction, turbulence, and detector sampling', '衍射、大气湍流与探测器采样', 'Near the resolution limit the ray picture is incomplete. Diffraction spreads every point into a pattern, atmosphere warps the wavefront, and coarse pixels can hide structure even when the telescope is large enough.', '接近分辨极限时，光线图像就不够用了。衍射会把每个点铺成图样，大气会扭曲波前，而过粗的像素即便在口径足够大时也会掩盖结构。')
      ],
      visual: {
        type: 'astronomy-optics',
        kind: 'model',
        repNote: t('Ray geometry with a calculated diffraction limit.', '用光线几何配合计算出的衍射极限。'),
        title: t('Aperture narrows the diffraction core; magnification alone does not.', '缩小衍射主峰靠的是口径，而不是单纯放大。'),
        lede: t('Change the aperture and wavelength to see the calculated Rayleigh limit move while the telescope sketch stays schematic. The point is that image sharpness is set by wave optics before it becomes a display problem.', '调节口径与波长，看看计算出的瑞利极限如何变化，而望远镜几何只作为示意存在。要点在于：像的锐度首先由波动光学决定，而不是显示器放大倍率决定。'),
        limitations: t('The converging rays are a teaching sketch. The spot size is scaled from the circular-aperture diffraction limit, not from a full telescope point-spread function with aberrations, secondary support, or atmosphere.', '会聚光线只是教学示意。斑点宽度按圆孔衍射极限缩放，没有加入像差、副镜支架或大气造成的完整点扩散函数。'),
        reducedMotion: t('The complete state is present without autoplay. Reduced-motion mode removes no information because all geometry is shown in a static solved configuration.', '无需自动播放就能看到完整状态。减少动态时不会丢失信息，因为全部几何关系已经以静态求解结果给出。'),
        controls: [
          { type: 'range', key: 'aperture', min: 0.6, max: 8, step: 0.1, value: 2.4, label: t('Aperture D (m)', '口径 D（米）'), formatter: value => `${format(value, 1)} m` },
          { type: 'range', key: 'wavelength', min: 400, max: 900, step: 10, value: 550, label: t('Wavelength λ (nm)', '波长 λ（纳米）'), formatter: value => `${format(value, 0)} nm` }
        ],
        sources: ['nasa-hubble-optics', 'nasa-wave-behaviors']
      },
      geophysics: {
        questions: [
          question('How do you infer an inaccessible interior from surface signals?', '如何只凭地表信号去反推无法直接抵达的内部？', 'Geophysics is built on indirect evidence. Travel times, amplitudes, gravity anomalies, magnetic patterns, and heat flow all stand in for places we cannot simply open up and inspect.', '地球物理学建立在间接证据之上。走时、振幅、重力异常、磁条带和热流，都是对那些无法直接剖开的深部区域的替代测量。'),
          question('Which part of the planet is structure, and which part is dynamics?', '行星中哪些是静态结构，哪些又是动态过程？', 'A seismic or magnetic signal can reflect both what the planet is made of and how it is moving. The field keeps disentangling geometry from ongoing flow, melting, and stress release.', '地震或磁学信号既可能反映“行星由什么构成”，也可能反映“它现在如何运动”。地球物理学不断把几何结构与持续中的流动、熔融和应力释放拆开。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Wave speed contrasts across layers', '不同层之间的波速差', 'Interior inference often comes from how seismic speed changes with density and stiffness. Small differences in travel time can imply large differences in composition or state at depth.', '内部反演往往依赖地震波速随密度和刚度如何变化。微小的到时差异，可能意味着深部在成分或物态上有很大的不同。'),
          scaleCard('Helpful approximation', '常用近似', 'Layered planets and ray paths', '分层行星与射线近似', 'Treating a planet as layered lets wave physics explain reflection, refraction, and shadow zones without pretending we know every heterogeneity in detail.', '把行星近似成分层结构后，波动物理就能解释反射、折射和阴影区，而无需假装我们已经知道每个细碎的不均匀体。'),
          scaleCard('Where it fails', '何时失效', 'Inverse problems are rarely unique', '反问题很少有唯一答案', 'Different subsurface models can fit the same limited data, especially when station coverage is sparse. Geophysics often narrows possibilities rather than delivering one photograph-like truth.', '当台站覆盖稀疏时，不同的地下模型往往都能拟合同一组有限数据。地球物理学经常做的是“缩小可能性范围”，而不是给出一张像照片那样唯一的真相。')
        ],
        visual: {
          type: 'geophysics',
          kind: 'schematic',
          repNote: t('Layered-planet ray geometry with P- and S-wave logic.', '带有 P 波和 S 波逻辑的分层行星射线几何示意。'),
          title: t('Seismic shadow zones are arguments, not pictures.', '地震阴影区是一种论证，而不是一张照片。'),
          lede: t('Switch between compressional and shear waves, then change the takeoff angle. The point is to watch which rays can continue through a layered planet and which fail once a liquid layer appears.', '在纵波与横波之间切换，再改变出射角。重点在于观察：一旦出现液态层，哪些射线还能继续穿过行星，哪些就会失效。'),
          limitations: t('The planet is drawn as concentric shells and the ray paths are stylized. Real inversions use many events, many stations, anisotropy, attenuation, and model uncertainty.', '这颗行星被画成同心层，射线路径也经过风格化处理。真实反演会用到大量事件、大量台站、各向异性、衰减和模型不确定性。'),
          reducedMotion: t('The inferential structure is entirely visible in one solved frame, so reduced-motion mode preserves everything important.', '关键的推理结构在一张静态求解图中就已完整可见，因此减少动态不会丢掉任何重要信息。'),
          controls: [
            { type: 'toggle', key: 'wave', value: 'P', label: t('Wave family', '波的类型'), options: [{ value: 'P', label: t('P wave', 'P 波') }, { value: 'S', label: t('S wave', 'S 波') }] },
            { type: 'range', key: 'takeoff', min: 15, max: 70, step: 1, value: 36, label: t('Takeoff angle', '出射角'), formatter: value => `${format(value, 0)}°` }
          ],
          sources: ['noaa-tectonics', 'nasa-insight']
        },
        experiment: experimentCard('reconstruction', 'Seismic arrivals turned planetary interiors into a reconstruction problem.', '地震波到时把行星内部变成了一个可重建的问题。', 'By comparing which wave types arrive, when they arrive, and where they disappear, geophysicists infer layered interiors that no drill can reach directly.', '通过比较不同波型是否到达、何时到达以及在哪里消失，地球物理学家得以重建任何钻头都无法直接抵达的分层内部。', 'The output is a reconstructed model constrained by data, not a direct visual observation.', '最终得到的是受数据约束的重建模型，而不是直接视觉观测。', ['nasa-insight']),
        mechanism: {
          title: t('How a hidden interior leaves a seismic signature', '看不见的内部如何留下地震学签名'),
          steps: [
            step('An earthquake launches more than one wave family', '地震会同时发出不止一种波', 'Compressional and shear disturbances sample the planet differently because they respond to different elastic properties.', '纵向压缩扰动和剪切扰动会以不同方式采样行星，因为它们响应的是不同的弹性性质。'),
            step('Layer boundaries bend or block the waves', '层界面会使波折射或被阻断', 'When a wave crosses into a region with different stiffness or state, its speed changes. If the new region is liquid, shear waves cannot propagate through it at all.', '当波进入刚度或物态不同的区域时，传播速度会改变。如果新区域是液体，剪切波甚至完全无法在其中传播。'),
            step('Arrival patterns constrain the interior model', '到时与缺失模式反过来约束内部模型', 'The combination of arrived, delayed, and absent signals rules out many internal structures and leaves a narrower family of viable models.', '到达、延迟和缺失信号的组合，会排除大量内部结构假设，只留下更窄的一族可行模型。')
          ]
        },
        misconception: {
          title: t('The deep Earth is not directly seen.', '深部地球并不是被“直接看到”的。'),
          body: t('Geophysical images are reconstructions from indirect measurements. They can be extremely strong evidence while still remaining model-dependent and open to revision as better data arrive.', '地球物理图像是由间接测量重建出来的。它们可以是极强的证据，但同时仍然依赖模型，并会随着更好数据的到来而被修订。')
        },
        frontier: {
          title: t('Exact earthquake prediction is still out of reach.', '地震的精确时刻预测仍然不可及。'),
          body: t('Stress accumulation, fault friction, fluids, and crustal heterogeneity interact across scales. Physics can explain why faults fail and estimate long-run hazard, but not yet name the exact day and place of the next major rupture.', '应力积累、断层摩擦、流体和地壳非均匀性会在多个尺度上相互作用。物理可以解释断层为何失稳、估计长期风险，却仍无法准确说出下一次大破裂发生的具体日期和地点。')
        },
        claims: [
          claimCard('Seismic inference is powerful precisely because wave types respond differently to material state.', '地震学推断之所以有力，正是因为不同波型对物态的响应不同。', 'Compressional waves can travel through solids and liquids, while shear waves require rigidity. That contrast lets seismology distinguish layered states that are otherwise inaccessible.', '纵波可以穿过固体和液体，而横波需要介质具有刚性。正是这种差别，使地震学能够区分原本无法直接接近的分层物态。', 'The field does not need to “see” the deep interior if it can rule models in and out through differential wave behavior.', '只要能借助不同波型的行为去排除或保留模型，地球物理学就不需要“看见”深部内部。', ['nasa-insight']),
          claimCard('Plate tectonics is a dynamical, long-timescale physical system.', '板块构造是一个长时间尺度上的动力学物理系统。', 'Earth’s crust is continuously reshaped by moving plates driven by deeper planetary processes, not by one-off surface accidents.', '地壳会在更深层行星过程的驱动下被运动的板块持续重塑，而不是靠一次性的表面偶然事件。', 'This is why geophysics links seismicity, topography, volcanism, and ocean-floor patterns into one planetary framework.', '也正因此，地球物理学把地震活动、地形、火山和海底图样连接进同一套行星框架。', ['noaa-tectonics'])
        ]
      },
      'quantum-theory': {
        questions: [
          question('Where did classical continuity first fail?', '经典连续性最早是在哪里出问题的？', 'The early quantum crisis asked why thermal radiation and photoelectric emission refused to follow smooth classical expectations. The field begins where “continuous exchange” stopped fitting the data.', '早期量子危机追问的是：为何热辐射与光电发射拒绝服从平滑的经典预期。这个领域正是从“连续交换”不再能拟合数据的地方开始。'),
          question('Which experimental facts demanded discrete quanta before full quantum mechanics existed?', '在完整量子力学出现之前，哪些实验事实已经迫使人们接受离散量子？', 'Blackbody spectra and threshold-dependent photoemission both pointed to energy transfer in chunks. Those clues arrived before the later machinery of wavefunctions and operators.', '黑体谱和带有阈值的光电发射都指向“能量以份额转移”。这些线索出现得早于后来的波函数与算符机器。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Photon energy against material threshold', '光子能量与材料阈值的比较', 'What matters for early quantum theory is whether a single quantum carries enough energy to excite or eject something. Brightness alone cannot replace frequency in threshold phenomena.', '对早期量子论而言，关键是单个量子是否携带足够能量去激发或击出某种东西。在阈值现象中，亮度无法取代频率。'),
          scaleCard('Helpful approximation', '常用近似', 'Single-parameter quantum rules', '少数关键参数主导的量子规则', 'Planck’s constant and simple threshold relations already explain a surprising amount of data. The early theory was narrow, but its narrow successes were decisive.', '光靠普朗克常数和少数阈值关系，就已经能解释出惊人的数据。早期理论并不完整，但它那些狭窄而成功的地方恰恰最有决定性。'),
          scaleCard('Where it fails', '何时失效', 'It is not yet the later full quantum formalism', '它还不是后来的完整量子形式主义', 'Early quantization explains why energy comes in chunks, but it does not yet provide the full state-space machinery used for atoms, interference amplitudes, or general measurements.', '早期量子论能够解释能量为何成份额出现，却还没有提供后来描述原子、干涉振幅或一般测量所需的完整状态空间机器。')
        ],
        visual: {
          type: 'quantum-theory',
          kind: 'model',
          repNote: t('A threshold-based photoelectric sketch tied to the early quantum argument.', '把阈值型光电效应与早期量子论论证联系起来的示意。'),
          title: t('More brightness cannot rescue light below the threshold frequency.', '低于阈频的光，再亮也救不回光电效应。'),
          lede: t('Change the incoming frequency and intensity separately. The control separation makes the key early-quantum point visible: frequency sets the per-quantum energy, while intensity mostly changes how many quanta arrive.', '分别改变入射频率与强度。把这两个控制分开后，早期量子论的关键一点就变得直观：频率决定每个量子的能量，而强度主要决定有多少量子到达。'),
          limitations: t('The metal surface and emitted electron are schematic. This panel isolates threshold logic rather than modeling real band structure, work-function distributions, or full blackbody spectra.', '金属表面和逸出电子都只是示意。本图只隔离出阈值逻辑，并不模拟真实能带结构、逸出功分布或完整黑体谱。'),
          reducedMotion: t('The complete threshold logic is visible statically, so reduced-motion mode keeps the argument intact.', '阈值逻辑在静态状态下就完整可见，因此减少动态不会损坏论证。'),
          controls: [
            { type: 'range', key: 'frequency', min: 0.4, max: 1.8, step: 0.05, value: 1.1, label: t('Frequency relative to ν₀', '相对阈频 ν₀ 的频率'), formatter: value => value.toFixed(2) },
            { type: 'range', key: 'intensity', min: 0.5, max: 2.5, step: 0.1, value: 1.2, label: t('Relative intensity', '相对强度'), formatter: value => value.toFixed(1) }
          ],
          sources: ['nobel-1918', 'nobel-1921']
        },
        experiment: experimentCard('observation', 'The photoelectric threshold showed that energy transfer depends on frequency, not merely total light intensity.', '光电阈值表明，能量转移取决于频率，而不只是总光强。', 'Electrons are not ejected by arbitrarily bright low-frequency light. Instead, the emitted electrons appear only once the incident quanta carry enough energy individually.', '电子不会被任意明亮的低频光打出；只有当入射量子单个就携带足够能量时，逸出电子才会出现。', 'This is an observation about discrete exchange, not yet the full later interpretation of quantum states.', '这是一个关于离散交换的观测事实，还不是后来完整量子态诠释的全部内容。', ['nobel-1921']),
        mechanism: {
          title: t('Why quantization solved an experimental mismatch', '量子化为什么能修补实验与经典之间的裂缝'),
          steps: [
            step('Classical continuity overpopulated high frequencies', '经典连续性会在高频端给出错误的占据', 'Treating radiation exchange as fully continuous leads to the wrong short-wavelength behavior for thermal radiation.', '如果把辐射交换完全当成连续过程，热辐射在短波端就会给出错误的行为。'),
            step('Planck restricted energy exchange to hν chunks', '普朗克把能量交换限制成 hν 的份额', 'That simple restriction suppresses the unrealistic high-frequency contribution and fits the observed spectrum.', '这个简单限制会压低不现实的高频贡献，并成功拟合观测到的谱线。'),
            step('Einstein made the quanta belong to light itself', '爱因斯坦进一步把量子归给光本身', 'Once the same hν idea explains photoelectric thresholds, discrete light quanta stop being a mathematical trick and become part of the physical story.', '一旦同样的 hν 想法能解释光电阈值，离散光量子就不再只是数学技巧，而成了物理故事的一部分。')
          ]
        },
        misconception: {
          title: t('Early quanta are not yet the full later quantum world.', '早期量子并不等于后来的完整量子世界。'),
          body: t('Planck and Einstein solved specific failures of classical physics, but they had not yet produced the general formalism of states, amplitudes, operators, and measurement that came later.', '普朗克和爱因斯坦修补的是经典物理的特定失败，但他们当时还没有建立后来那套关于状态、振幅、算符与测量的普适形式主义。')
        },
        frontier: {
          title: t('The pedagogical boundary is historical overreach.', '这里最大的教学边界，是不能把历史过度“倒灌”。'),
          body: t('It is tempting to retell 1900 as if everyone already knew modern quantum mechanics. A careful guide keeps the early evidence decisive while acknowledging that the full framework was still under construction.', '人们很容易把 1900 年讲成仿佛所有人都已经知道现代量子力学。更谨慎的导览应该既承认早期证据的决定性，也承认完整框架当时仍在建造。')
        },
        claims: [
          claimCard('Threshold photoemission depends on frequency, not just brightness.', '阈值型光电发射取决于频率，而不只是亮度。', 'Below the threshold frequency, increasing intensity can increase the number of incident quanta without ever creating emitted electrons.', '在阈频以下，提高强度只会增加到达的量子数，却仍然不能产生逸出电子。', 'That is the crucial observation separating “total beam power” from “energy carried by each quantum.”', '这正是把“光束总功率”与“单个量子携带的能量”区分开的关键观测。', ['nobel-1921']),
          claimCard('Planck’s quantization was a targeted fix with world-changing consequences.', '普朗克的量子化原本是一个针对性修补，却带来了世界级后果。', 'Restricting energy exchange to discrete hν steps solved a concrete radiation problem before anyone had the later quantum formalism in hand.', '把能量交换限制为离散的 hν 台阶，先解决了一个非常具体的辐射问题，而那时后来的量子形式主义甚至还不存在。', 'Its importance lies both in the fit itself and in the fact that later experiments forced physicists to treat the quantization as physical rather than merely formal.', '它的重要性既在于成功拟合数据，也在于后来实验迫使物理学家把这种量子化看成真实物理，而不只是形式技巧。', ['nobel-1918', 'nobel-1921'])
        ]
      },
      nuclear: {
        questions: [
          question('Why are some nuclei stable while others decay?', '为什么有些原子核稳定，而另一些会衰变？', 'Nuclear physics asks how the strong interaction, electric repulsion, shell structure, and quantum tunneling combine inside a tiny many-body object.', '核物理学追问：强相互作用、电荷排斥、壳层结构和量子隧穿，究竟如何在一个极小的多体系统里共同起作用。'),
          question('Where does nuclear energy actually come from?', '核能量究竟来自哪里？', 'The field keeps translating binding differences into observable decay heat, stellar fusion power, and fission yields. The core question is not “stored fire,” but how tightly the nucleons are bound on average.', '这个领域不断把结合差异翻译成可观测的衰变热、恒星聚变功率和裂变产额。核心问题并不是“核里藏着火”，而是平均而言核子被束缚得有多紧。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Binding energy per nucleon', '每核子结合能', 'The most useful first comparison is how tightly each nucleon is bound on average. That single curve explains why light nuclei can fuse and very heavy ones can fission while releasing energy.', '最有用的第一比较，是看每个核子平均被束缚得多紧。正是这条曲线解释了为何轻核可以聚变、极重核可以裂变，并在过程中释放能量。'),
          scaleCard('Helpful approximation', '常用近似', 'Population laws rather than clockwork decay', '用统计规律看衰变，而不是钟表式倒计时', 'Half-life statements describe ensembles. They do not predict which one nucleus decays at which exact moment, but they are highly predictive for large populations.', '半衰期描述的是总体统计规律。它不能预言某一个核会在何时恰好衰变，却能对大群体给出高度可靠的预测。'),
          scaleCard('Where it fails', '何时失效', 'Nuclei are quantum many-body systems', '原子核是量子多体系统', 'Simple drop or orbit pictures each capture only part of the truth. Precise nuclear structure, reaction channels, and excited states quickly exceed naive mechanical cartoons.', '无论液滴图像还是轨道图像，都只抓住了部分真相。精确的核结构、反应通道和激发态，很快就会超出朴素机械图景。')
        ],
        visual: {
          type: 'nuclear',
          kind: 'model',
          repNote: t('A stylized binding-energy curve with a highlighted mass number.', '带有高亮质量数的风格化结合能曲线。'),
          title: t('Fusion climbs the light side; fission slides down the heavy side.', '轻核通过聚变爬向峰顶，重核通过裂变滑向峰顶。'),
          lede: t('Move the highlighted mass number along a simplified binding-energy curve. The point is to see why both fusion and fission can release energy without imagining nuclei as tiny solar systems.', '把高亮质量数沿着简化后的结合能曲线移动。重点在于看清：为何聚变与裂变都能放能，而又无需把原子核想成微型太阳系。'),
          limitations: t('The curve is schematic and smooth. Real nuclei show shell effects, isotopic details, decay channels, and reaction barriers that are not captured here.', '这条曲线是示意性的光滑曲线。真实原子核会表现出壳层效应、同位素细节、衰变通道和反应势垒，这里都没有画出。'),
          reducedMotion: t('The explanatory content is already complete in a static curve and marker, so reduced-motion mode removes no physics.', '静态曲线和标记已经包含全部解释内容，因此减少动态不会删掉任何物理信息。'),
          controls: [
            { type: 'range', key: 'mass', min: 2, max: 238, step: 1, value: 56, label: t('Mass number A', '质量数 A'), formatter: value => format(value, 0) }
          ],
          sources: ['doe-nuclei', 'doe-fusion']
        },
        experiment: experimentCard('observation', 'Decay curves revealed that half-life is a population law, not a clock inside each nucleus.', '衰变曲线表明，半衰期是总体统计规律，而不是每个原子核内部的时钟。', 'Large samples decay predictably even though the exact decay moment of one nucleus is not forecast in advance. That is one of the clearest signatures of nuclear processes as quantum-statistical phenomena.', '大样本会按可预测的方式衰减，尽管单个原子核的确切衰变时刻事先并不能被预测。这正是核过程具有量子统计性质的最清晰标记之一。', 'The regularity belongs to the ensemble, not to deterministic timing inside one nucleus.', '这种规律性属于总体，而不属于单个核内部的确定性倒计时。', ['doe-nuclei']),
        mechanism: {
          title: t('How binding differences become released energy', '结合差异如何变成释放出来的能量'),
          steps: [
            step('Different nuclei bind nucleons with different average tightness', '不同原子核对核子的平均束缚强弱不同', 'The competition between the strong interaction and proton-proton repulsion makes the average binding energy change with size.', '强相互作用与质子—质子排斥的竞争，使平均结合能随核大小而变化。'),
            step('Reactions that move toward the binding-energy peak release energy', '凡是把体系推向结合能峰顶的反应都会放能', 'If the products are more tightly bound on average than the reactants, the mass-energy difference appears as kinetic energy, radiation, or both.', '如果产物的平均束缚更紧，反应前后的质量—能量差就会以动能、辐射或二者兼具的形式出现。'),
            step('Quantum barriers still decide whether the reaction actually happens', '但量子势垒仍决定反应是否真能发生', 'Even an energetically favorable reaction may need tunneling, a collision, or a trigger to proceed at an observable rate.', '即便某个反应在能量上有利，它也可能仍需要隧穿、碰撞或触发条件，才能以可观测速率真正发生。')
          ]
        },
        misconception: {
          title: t('Half-life is not a countdown inside one nucleus.', '半衰期不是单个原子核内部的倒计时。'),
          body: t('Half-life tells you how a population thins on average. It does not assign a hidden alarm clock to each nucleus with a prewritten decay moment.', '半衰期描述的是一个总体平均如何变稀，而不是给每个原子核安排一个预先写好的“响铃时刻”。')
        },
        frontier: {
          title: t('Many-body nuclear structure remains computationally hard.', '多体核结构依然在计算上非常困难。'),
          body: t('Heavy nuclei, neutron-rich isotopes, astrophysical r-process paths, and fusion-relevant reaction cross sections all push beyond the easiest models. Precision often requires combining experiment, effective theory, and computation case by case.', '重核、中子富集同位素、天体物理中的 r 过程路径以及与聚变相关的反应截面，都在逼迫理论超出最简单模型。高精度往往需要逐案结合实验、有效理论与计算。')
        },
        claims: [
          claimCard('Fusion and fission release energy for opposite sides of the same binding curve.', '聚变和裂变之所以都能放能，是因为它们位于同一条结合能曲线的两侧。', 'Light nuclei can release energy by moving up toward the binding-energy peak, while very heavy nuclei can release energy by splitting back toward it.', '轻核可以通过向结合能峰顶靠近而放能，而极重核也可以通过裂成更接近峰顶的碎片而放能。', 'The governing comparison is average binding per nucleon, not a vague notion of “nuclear fire” stored inside matter.', '真正支配这一切的比较量，是平均每核子结合能，而不是某种模糊的“核里藏着火”。', ['doe-fusion', 'doe-nuclei']),
          claimCard('Radioactive decay is probabilistic for single nuclei but sharply regular in large populations.', '放射性衰变对单个原子核是概率性的，但对大总体却非常规律。', 'A single nucleus does not carry an observable deterministic countdown, yet a large ensemble follows reproducible decay laws.', '单个原子核并不携带一个可观察到的确定性倒计时，但大总体会服从可重复的衰变规律。', 'That combination of microscopic unpredictability and macroscopic regularity is a hallmark of nuclear quantum statistics.', '这种“微观不可预言、宏观却高度规律”的组合，正是核量子统计的标志之一。', ['doe-nuclei'])
        ]
      },
      condensed: {
        questions: [
          question('What new behavior appears only when huge numbers of particles cooperate?', '只有当海量粒子协同时，哪些新行为才会出现？', 'Condensed matter physics asks why solids and liquids exhibit phases, transport, and collective excitations that no isolated atom displays by itself.', '凝聚态物理学追问：为什么固体和液体会表现出单个孤立原子本身完全没有的相、输运性质和集体激发。'),
          question('Which properties belong to the constituent particles, and which belong to the phase they form together?', '哪些性质属于组分本身，哪些又属于它们共同形成的相？', 'Band structure, magnetism, superconductivity, and topological responses all blur the line between “microscopic ingredient” and “emergent state of matter.”', '能带结构、磁性、超导和拓扑响应都会模糊“微观组分”与“涌现出的物质相”之间的界线。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Band filling and gap size', '能带填充与能隙大小', 'For simple electronic materials, whether a band is full, partial, or separated by a gap is the first organizing principle for transport.', '对简单电子材料而言，一条能带是填满、部分填充，还是被能隙隔开，往往是理解输运的第一组织原则。'),
          scaleCard('Helpful approximation', '常用近似', 'Effective particles in periodic matter', '周期性物质中的有效粒子', 'Electrons in a crystal can often be treated as if they occupy bands and move with effective masses. That coarse-graining is powerful even though it is not the last word.', '晶体中的电子常常可以被视作占据能带、带着有效质量运动。这个粗粒化方法非常有力，尽管并不是最后真相。'),
          scaleCard('Where it fails', '何时失效', 'Strong correlation and topology go beyond naive bands', '强关联与拓扑会超出朴素能带图像', 'Some insulators are insulating because interactions lock electrons in place, not because a single-particle gap explains everything. Other phases require topology rather than a local order parameter alone.', '有些绝缘体之所以绝缘，是因为相互作用把电子锁住，而不是因为单粒子能隙已解释一切。还有一些相则需要借助拓扑，而不能只靠局域序参量。')
        ],
        visual: {
          type: 'condensed',
          kind: 'model',
          repNote: t('A band-and-gap schematic with adjustable filling.', '可调填充度的能带—能隙示意图。'),
          title: t('Band filling and gap size are the first cut, not the whole story.', '能带填充与能隙大小只是第一刀，而不是全部故事。'),
          lede: t('Change the gap and the filling to move between metallic, semiconductor-like, and insulating responses. The panel is intentionally simple so that the meaning of “available states near the Fermi level” stays visible.', '调节能隙与填充度，观察系统如何在金属性、类半导体和绝缘行为之间切换。这个图被故意画得简洁，好让“费米能级附近有没有可用态”这一点始终清楚。'),
          limitations: t('The bands are schematic and ignore crystal-momentum detail, interactions, disorder, and topology. They are the opening model, not the last explanation.', '能带被画成了示意条带，忽略了晶格动量细节、相互作用、无序和拓扑。它们是理解问题的起点，而不是最后解释。'),
          reducedMotion: t('Because this is a static occupancy diagram, reduced-motion mode preserves the complete explanation.', '由于这是一张静态占据图，因此减少动态不会损失任何解释内容。'),
          controls: [
            { type: 'range', key: 'gap', min: 0, max: 3, step: 0.05, value: 0.9, label: t('Gap E_g (eV)', '能隙 E_g（eV）'), formatter: value => `${value.toFixed(2)} eV` },
            { type: 'range', key: 'filling', min: 0.05, max: 1, step: 0.05, value: 0.85, label: t('Band filling', '能带填充度'), formatter: value => value.toFixed(2) }
          ],
          sources: ['doe-superconductivity', 'doe-nanoscience', 'nobel-2016-topology']
        },
        experiment: experimentCard('observation', 'Zero resistance and magnetic-field expulsion showed that superconductors are a new phase, not just “excellent wires.”', '零电阻与排斥磁场表明，超导体是一种新相，而不只是“特别好的导线”。', 'Once a material enters the superconducting phase, it does two things at once: transport becomes dissipationless and magnetic flux is expelled from the bulk. That combination marks a collective state of matter.', '当材料进入超导相时，会同时出现两件事：输运变成无耗散，磁通被排斥出体内。这一组合同步出现，标志着一种集体物质相。', 'The phase is collective and macroscopic; it cannot be reduced to one electron behaving unusually well.', '这个相是集体且宏观的，不能被简化成“某个电子表现得特别好”。', ['doe-superconductivity']),
        mechanism: {
          title: t('How collective matter makes new effective particles and phases', '集体物质如何制造新的有效粒子与新相'),
          steps: [
            step('Periodic matter reshapes allowed electron states', '周期性物质会重塑电子可占据的状态', 'A crystal lattice changes the electron problem from free motion in vacuum to motion through a periodic environment.', '晶格会把电子问题从“真空中的自由运动”改写成“周期环境中的运动”。'),
            step('Those states organize into bands and effective excitations', '这些状态会组织成能带与有效激发', 'Instead of tracking every microscopic collision literally, condensed matter often describes low-energy behavior in terms of bands, phonons, magnons, or dressed carriers.', '凝聚态物理并不总是字面地追踪每一次微观碰撞，而更常用能带、声子、磁振子或被“穿衣”的载流子来描述低能行为。'),
            step('Interactions can then lock in an emergent phase', '随后相互作用还能锁定某种涌现相', 'Pairing, ordering, or topological constraints can create responses that the single-particle ingredients did not obviously advertise ahead of time.', '配对、排序或拓扑约束能够创造出一些单粒子组分事先并不明显“预告”过的响应。')
          ]
        },
        misconception: {
          title: t('A quasiparticle is not a newly discovered elementary particle.', '准粒子并不是新发现的基本粒子。'),
          body: t('Quasiparticles are effective excitations that summarize how a complicated medium responds. They are powerful, real, and measurable inside that medium, but they are not necessarily fundamental building blocks of nature in free space.', '准粒子是对复杂介质响应进行概括的有效激发。它们在介质内部既强有力、也真实可测，但并不因此自动成为自由空间中的自然基本构件。')
        },
        frontier: {
          title: t('Strongly correlated phases still outpace simple theory.', '强关联相依然跑在简单理论前面。'),
          body: t('High-temperature superconductors, strange metals, moiré materials, and nonequilibrium quantum matter keep producing phases whose transport and pairing mechanisms are not yet fully understood.', '高温超导体、奇异金属、莫尔材料和非平衡量子物质持续产出一些输运与配对机制尚未被完全理解的新相。')
        },
        claims: [
          claimCard('Band pictures explain a great deal, but not every insulator.', '能带图像能解释很多现象，但解释不了所有绝缘体。', 'Partially filled bands usually conduct and large gaps usually suppress conduction, yet interaction-driven insulators and topological phases show that simple single-particle logic is not always enough.', '部分填充的能带通常会导电，而大能隙通常会抑制导电；但相互作用驱动的绝缘体和拓扑相提醒我们：简单的单粒子逻辑并不总够用。', 'That is why condensed matter needs both straightforward band intuition and a strong emergence vocabulary.', '也正因此，凝聚态物理既需要直接的能带直觉，也需要坚实的涌现语言。', ['doe-nanoscience', 'nobel-2016-topology']),
          claimCard('Superconductivity is a distinct macroscopic phase, not merely low resistance.', '超导是一种独立的宏观相，而不只是“电阻很小”。', 'The defining combination is zero resistance together with magnetic-field expulsion, signaling collective ordering rather than incremental improvement of an ordinary conductor.', '它的定义性组合是零电阻加上排斥磁场，这表明出现的是集体有序，而不是普通导体性能的渐进提升。', 'That distinction matters because the explanation must be phase-based, not simply a better version of classical current flow.', '这个区分很重要，因为解释必须建立在“相”的概念上，而不是把它看成经典电流流动的一个更强版本。', ['doe-superconductivity'])
        ]
      },
      particle: {
        questions: [
          question('What counts as evidence for an unseen particle?', '对于看不见的粒子，什么才算证据？', 'Particle physics rarely hands you a direct picture of the object of interest. Instead it builds case after case from tracks, calorimeter deposits, decay products, timing, and statistics.', '粒子物理学几乎不会直接递给你一张“粒子照片”。它更常通过径迹、量能器沉积、衰变产物、时间信息和统计显著性，层层搭建证据链。'),
          question('Which ingredients are fundamental, and which are composite?', '哪些成分是基本的，哪些又是复合的？', 'The field keeps smashing matter and radiation into each other to test whether a successful description survives at shorter distances and higher energies.', '这个领域不断让物质和辐射彼此碰撞，以检验一套成功描述在更短距离、更高能量下是否还能站得住。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Collision energy versus interaction threshold', '碰撞能量与相互作用阈值', 'Short-lived particles often appear only when enough energy is concentrated in a collision to create them and enough detector coverage exists to infer their decay products.', '许多短寿命粒子只有在碰撞集中出足够能量、并且探测器有足够覆盖时，才会通过其衰变产物显形。'),
          scaleCard('Helpful approximation', '常用近似', 'Tracks, invariant masses, and event classes', '径迹、不变质量与事例分类', 'A modern analysis does not ask “what did I see?” so much as “which event topology, mass peak, and background model best explain this pattern of hits?”', '现代分析并不是在问“我看见了什么”，而是在问“哪一种事例拓扑、质量峰和背景模型最能解释这串击中模式？”'),
          scaleCard('Where it fails', '何时失效', 'Direct intuition from ordinary objects', '来自日常物体的直觉会失效', 'At this scale, particles are not tiny marbles in a photographic chamber. The meaningful objects are quantum fields, detector signals, and statistical evidence chains.', '在这个尺度上，粒子不是某个摄影室里的小弹珠。真正有意义的对象是量子场、探测器信号和统计证据链。')
        ],
        visual: {
          type: 'particle',
          kind: 'reconstruction',
          repNote: t('A detector schematic turning curved tracks into an inferred momentum/charge story.', '把弯曲径迹转化为动量和电荷推断的探测器示意。'),
          title: t('Curvature is part of the argument, not a decoration around the collision.', '轨迹曲率是论证本身的一部分，而不是碰撞周围的装饰。'),
          lede: t('Change the field strength, charge sign, and momentum to see how the track bends inside a layered detector. The image teaches what event displays are trying to reconstruct, not what the particle “looked like” by eye.', '改变场强、电荷符号和动量，看看径迹如何在分层探测器内弯曲。这个图教的是事例显示究竟在重建什么，而不是粒子“长什么样”。'),
          limitations: t('The detector is compressed into concentric layers and one track. Real reconstruction combines many tracks, shower shapes, timing channels, and background modeling.', '探测器被压缩成若干同心层和一条径迹。真实重建需要同时结合多条径迹、簇射形状、时间通道和背景建模。'),
          reducedMotion: t('The inferential geometry is fully visible without animation, so reduced-motion mode keeps the whole story.', '关键推理几何在没有动画时就已完整可见，因此减少动态不会伤害解释。'),
          controls: [
            { type: 'range', key: 'momentum', min: 0.4, max: 3.6, step: 0.1, value: 1.4, label: t('Relative momentum', '相对动量'), formatter: value => value.toFixed(1) },
            { type: 'range', key: 'fieldStrength', min: 0.5, max: 2, step: 0.05, value: 1, label: t('Relative magnetic field', '相对磁场'), formatter: value => value.toFixed(2) },
            { type: 'toggle', key: 'charge', value: 1, label: t('Charge sign', '电荷符号'), options: [{ value: 1, label: t('Positive', '正') }, { value: -1, label: t('Negative', '负') }] }
          ],
          sources: ['doe-accelerators', 'cern-antimatter', 'cern-standard-model']
        },
        experiment: experimentCard('reconstruction', 'Modern particle events are reconstructed from detector response, not photographed directly.', '现代粒子事例是从探测器响应中重建出来的，而不是被直接拍照。', 'A curved track, an energy cluster, or a displaced decay vertex becomes evidence only after calibration, pattern recognition, and statistical background rejection.', '弯曲径迹、能量团簇或偏移衰变顶点，只有在经过定标、模式识别和统计背景剔除之后，才会成为证据。', 'The event display is already an interpreted object, not raw visual reality.', '事例显示本身就是解释后的对象，而不是原始视觉现实。', ['doe-accelerators']),
        mechanism: {
          title: t('How a short-lived particle becomes a claim', '一个短寿命粒子如何变成可提出的物理主张'),
          steps: [
            step('Collisions create unstable products', '碰撞先创造出不稳定产物', 'High-energy beams or cosmic rays concentrate enough energy to create particles that will decay long before any camera could isolate them.', '高能束流或宇宙线会集中足够能量，创造出寿命短到任何相机都来不及单独拍下来的粒子。'),
            step('Detectors record the debris instead of the parent directly', '探测器记录的是碎片，而不是母粒子本身', 'Charged tracks curve, neutral particles shower, and delayed decays leave displaced signatures. Each subdetector records a different projection of the same event.', '带电径迹会弯曲，中性粒子会形成簇射，延迟衰变会留下偏移信号。不同子探测器记录的是同一事例的不同投影。'),
            step('Reconstruction and statistics identify the most likely interpretation', '重建与统计再选出最有可能的解释', 'Mass peaks, missing momentum, event classes, and background estimates together turn detector output into a particle claim with quantified uncertainty.', '质量峰、缺失动量、事例类别和背景估计会共同把探测器输出转化成带有定量不确定度的粒子主张。')
          ]
        },
        misconception: {
          title: t('Particle images are not direct photographs of little balls.', '粒子图像并不是小球的直接照片。'),
          body: t('What looks like a “particle picture” is almost always a reconstruction of hits and energies into a human-readable event display. The physically meaningful object is the calibrated inference, not the visual metaphor alone.', '看起来像“粒子照片”的东西，几乎总是把击中点和能量信息重建成人能读懂的事例图。真正有物理意义的是经过定标的推断，而不是单纯的视觉比喻。')
        },
        frontier: {
          title: t('Known unknowns still surround the Standard Model.', '标准模型周围仍包围着已知的未知。'),
          body: t('Dark matter, the matter-antimatter asymmetry, neutrino puzzles, and the absence of quantum gravity inside the current framework all mean the experimental program is still looking for cracks, not polishing a finished monument.', '暗物质、物质—反物质不对称、中微子问题，以及现有框架中缺失的量子引力，都意味着实验计划仍在寻找裂缝，而不是给一座已经完工的纪念碑抛光。')
        },
        claims: [
          claimCard('Antiparticles are defined by reversed quantum numbers, not by being “evil matter.”', '反粒子由量子数反转来定义，而不是某种“反派物质”。', 'Every known charged matter particle has an antiparticle with opposite charge, and particle-antiparticle encounters can annihilate into other particles such as photons.', '每一种已知带电物质粒子都有一个电荷相反的反粒子，而粒子—反粒子相遇时可以湮灭成其他粒子，例如光子。', 'That is a sharply testable statement about quantum numbers and reactions, not a metaphor about time-reversed ordinary objects.', '这是一条关于量子数和反应的可检验陈述，而不是关于“时间倒流物体”的比喻。', ['cern-antimatter']),
          claimCard('Detector evidence is an inference chain built from calibrated debris.', '探测器证据是一条由定标后的碎片构成的推断链。', 'High-energy physics identifies short-lived entities through reconstructed tracks, showers, missing momentum, and population-level statistical excesses.', '高能物理通过重建出的径迹、簇射、缺失动量以及总体上的统计超额来识别短寿命实体。', 'That is why “seeing” a particle means reconstructing it from what it did to the detector, not observing a tiny visible object directly.', '也正因此，粒子物理中的“看见”其实是从粒子对探测器做了什么来重建它，而不是直接看到一个微小可见物。', ['doe-accelerators'])
        ]
      },
      plasma: {
        questions: [
          question('When do charges respond collectively rather than independently?', '什么时候带电粒子会作为整体集体响应，而不是各自为战？', 'Plasma physics begins when a gas is ionized enough that electric and magnetic fields become part of the material’s own dynamics. The field asks when collective screening, waves, and instabilities dominate over simple single-particle motion.', '等离子体物理学从这样一种状态开始：气体被电离到足以让电场和磁场成为材料动力学本身的一部分。这个领域追问的是：何时集体屏蔽、波和不稳定性会压过简单的单粒子运动。'),
          question('Which description fits this regime: fluid, kinetic, or both?', '描述这个区域应该用流体图像、动理学图像，还是两者一起？', 'Some plasmas behave like conducting fluids, others require full velocity-space distributions and collisionless dynamics. Picking the wrong description can erase the essential physics.', '有些等离子体表现得像导电流体，另一些则必须保留完整速度分布和无碰撞动力学。选错描述方式，关键物理就会直接丢失。')
        ],
        scales: [
          scaleCard('Governing scale', '主导尺度', 'Debye length and gyroradius', '德拜长度与回旋半径', 'A plasma screens electric fields over one characteristic length and bends charged-particle motion over another. Those two scales already tell you a great deal about collectivity and magnetization.', '等离子体会在一种特征长度上屏蔽电场，也会在另一种特征长度上弯曲带电粒子轨道。光看这两个尺度，就足以判断很多关于集体性和磁化程度的问题。'),
          scaleCard('Helpful approximation', '常用近似', 'Magnetohydrodynamics when collective fluid behavior wins', '当集体流体行为占优时可用磁流体近似', 'If collisions or coarse-graining justify it, plasma and field can be evolved together as a conducting fluid. That is the regime behind much space and fusion intuition.', '如果碰撞或粗粒化条件允许，等离子体与电磁场就可以一起作为导电流体来演化。这正是许多空间和聚变直觉背后的区域。'),
          scaleCard('Where it fails', '何时失效', 'Collisionless and kinetic structure', '无碰撞与动理学结构', 'Many laboratory and space plasmas are too dilute or too anisotropic for a one-fluid picture to stay honest. Velocity distributions, resonances, and microinstabilities then matter explicitly.', '许多实验室和空间等离子体都太稀薄、太各向异性，以至于单流体图像不再诚实。此时速度分布、共振和微观不稳定性必须被显式纳入。')
        ],
        visual: {
          type: 'plasma',
          kind: 'model',
          repNote: t('A paired screening-and-gyromotion schematic for two core plasma scales.', '把屏蔽与回旋运动并列起来的双重等离子体尺度示意。'),
          title: t('One scale tells you how fields are screened; another tells you how charges orbit in B.', '一个尺度告诉你电场如何被屏蔽，另一个尺度告诉你带电粒子如何在磁场里回旋。'),
          lede: t('Change density and magnetic field strength together. The left panel shortens or lengthens the screening scale; the right panel tightens or loosens the charged-particle orbit.', '同时调节密度和磁场强度。左图会缩短或拉长屏蔽尺度，右图会收紧或放松带电粒子的回旋轨道。'),
          limitations: t('The left panel keeps only an exponential screening profile and the right keeps only one projected orbit. Real plasmas also carry waves, collisions, reconnection, and instability cascades.', '左图只保留指数型屏蔽剖面，右图只保留一条投影后的单粒子轨道。真实等离子体还会承载波、碰撞、重联和不稳定性级联。'),
          reducedMotion: t('The explanatory geometry is static and complete, so reduced-motion mode keeps the same scientific content.', '关键解释几何是静态且完整的，因此减少动态不会改变科学内容。'),
          controls: [
            { type: 'range', key: 'density', min: 0.4, max: 2.4, step: 0.05, value: 1, label: t('Relative density', '相对密度'), formatter: value => value.toFixed(2) },
            { type: 'range', key: 'field', min: 0.4, max: 2.2, step: 0.05, value: 1, label: t('Relative magnetic field', '相对磁场'), formatter: value => value.toFixed(2) }
          ],
          sources: ['doe-plasma', 'utexas-debye-shielding', 'utexas-magnetized-plasmas']
        },
        experiment: experimentCard('model', 'Confinement experiments and space-plasma measurements both show that charged matter and fields must often be solved together.', '约束实验与空间等离子体测量都表明：带电物质与电磁场常常必须一起求解。', 'In fusion devices the plasma changes the confining field, and in space plasmas the field guides bulk flows and waves. Neither side is a passive backdrop for the other.', '在聚变装置里，等离子体会反过来改变约束它的场；在空间等离子体里，场又会引导整体流动和波。双方都不是对方的被动背景。', 'This is a regime claim: some plasmas can be treated fluidly, but not all of them can.', '这是一条关于适用区域的陈述：有些等离子体可以流体化处理，但绝不是全部。', ['doe-plasma', 'doe-plasma-confinement']),
        mechanism: {
          title: t('How collective plasma behavior emerges from many charges', '等离子体的集体行为如何从大量带电粒子中出现'),
          steps: [
            step('Ionization frees charges', '电离先把电荷解放出来', 'Once electrons and ions are no longer locked into neutral atoms, they can respond separately to electromagnetic fields.', '一旦电子和离子不再被束缚在中性原子中，它们就能分别响应电磁场。'),
            step('Nearby charges screen local imbalances', '周围电荷会快速屏蔽局部失衡', 'The medium tends to rearrange itself to reduce isolated electric fields, producing the collective notion of quasineutrality and a characteristic screening length.', '介质会倾向于重新排布自身，以减弱孤立电场，从而形成准中性和特征屏蔽长度这样的集体概念。'),
            step('Magnetic fields then organize large-scale motion', '磁场接着组织起大尺度运动', 'Because the charges are mobile, magnetic fields can bend trajectories, channel currents, and couple to the bulk flow so strongly that matter and field must be evolved together.', '由于这些电荷可自由移动，磁场可以弯曲轨道、导引电流，并与整体流动强烈耦合，以至于物质和场必须一起演化。')
          ]
        },
        misconception: {
          title: t('Plasma is the most common state of ordinary visible matter, not most of the universe full stop.', '等离子体是“普通可见物质”中最常见的状态，而不是“宇宙里的一切”。'),
          body: t('Stars and glowing gas are overwhelmingly plasma, but ordinary matter itself is only a small fraction of the cosmic inventory. Dark matter and dark energy are not plasma.', '恒星和发光气体当然绝大多数是等离子体，但普通物质本身只占宇宙总成分的一小部分。暗物质和暗能量都不是等离子体。')
        },
        frontier: {
          title: t('Crossing from fluid intuition to kinetic reality remains difficult.', '从流体直觉跨到动理学现实依然困难。'),
          body: t('Magnetic reconnection, edge turbulence in fusion devices, solar-wind heating, and collisionless shocks all live in the awkward middle where neither a single-fluid cartoon nor a simple particle sketch is enough.', '磁重联、聚变装置边缘湍流、太阳风加热和无碰撞激波，都活在一个尴尬中间地带：无论单流体卡通，还是简单单粒子图，都不够解释它们。')
        },
        claims: [
          claimCard('Plasma screening is a collective effect, not just many independent Coulomb problems piled together.', '等离子体屏蔽是一种集体效应，而不是无数独立库仑问题的简单叠加。', 'A test charge in plasma does not keep its unscreened long-range field because nearby mobile charges rearrange in response.', '等离子体中的测试电荷不会保留未被屏蔽的长程电场，因为附近可移动电荷会立即重排并作出响应。', 'That rearrangement is what makes plasma physics fundamentally different from a rare gas of isolated charged particles.', '正是这种重排，使得等离子体物理学从根本上不同于一个由孤立带电粒子组成的稀薄气体。', ['utexas-debye-shielding', 'doe-plasma']),
          claimCard('Frozen-in flux language is useful only in the right regime.', '“磁冻结”只在合适区域里才有用。', 'Well-conducting plasmas can drag magnetic structure with the bulk flow, but that statement is not universal across all kinetic, resistive, or reconnection-dominated situations.', '在导电良好的等离子体中，整体流动确实可能拖着磁结构一起走，但这并不是对所有动理学、阻性或重联主导情形都成立的普适真理。', 'Keeping the caveat visible prevents a useful MHD picture from becoming a misleading slogan.', '把这个前提条件保留下来，才能避免一个有用的磁流体图像滑向误导性的口号。', ['doe-plasma-confinement', 'doe-plasma'])
        ]
      },
      experiment: experimentCard('observation', 'Resolution tests on close sources turned telescope quality into a quantitative question.', '对近邻目标的分辨测试把望远镜质量变成了定量问题。', 'Whether two nearby points separate into distinct intensity peaks is not a matter of taste. It is the operational test behind angular resolution, double-star work, and diffraction-limited imaging.', '两个相近点源能否分成彼此可辨的强度峰，并不是审美问题，而是角分辨率、双星测量和衍射极限成像背后的操作性检验。', 'Observation enters only after calibration against the instrument response.', '只有在把仪器响应校准进去之后，观测才真正成立。', ['nasa-hubble-optics', 'nasa-wave-behaviors']),
      mechanism: {
        title: t('From incoming wavefront to trustworthy sky measurement', '从入射波前到可信的天文测量'),
        steps: [
          step('Collect the wavefront', '先收集波前', 'A larger entrance pupil intercepts more light and narrows the diffraction pattern that any point source must produce.', '更大的入瞳能截获更多光，也会缩小点源必然形成的衍射图样。'),
          step('Map angle to position', '把角度映到焦平面位置', 'Lenses or mirrors convert arrival angle into a place on the focal plane, turning geometry in the sky into geometry on a detector.', '透镜或反射镜把到达角转换成焦平面上的位置，使天空中的几何变成探测器上的几何。'),
          step('Calibrate what the instrument added', '再扣除仪器自己加入的东西', 'Flat fields, dark current, spectral response, and point-spread calibration remove the telescope’s own signature so that brightness and shape can be interpreted physically.', '平场、暗电流、谱响应和点扩散定标用来扣除望远镜自身的印记，使亮度和形状能被物理地解释。')
        ]
      },
      misconception: {
        title: t('Magnification is not resolution.', '放大倍率不等于分辨率。'),
        body: t('Eyepieces can enlarge a blurred image, but they cannot recover detail the aperture and wavelength never resolved. The limiting physics lives at the entrance pupil, not on the display scale.', '目镜可以把模糊的像放大，却无法找回口径和波长从未分辨出的细节。真正的物理限制发生在入瞳处，而不是显示尺度上。')
      },
      frontier: {
        title: t('Wavefront control for faint companions', '如何在强光旁看见极暗伴星'),
        body: t('Direct imaging of exoplanets and disks pushes optics to control picometre-scale mirror errors, diffraction leakage, and atmospheric turbulence at once. The frontier is not merely building a bigger telescope, but suppressing the host star well enough to trust what remains.', '直接成像系外行星和星周盘，需要同时控制皮米级镜面误差、衍射泄漏和大气湍流。前沿问题不只是把望远镜做大，而是要把主恒星压制到足够干净，才能相信剩下的微弱信号。')
      },
      claims: [
        claimCard('Angular resolution scales with λ/D', '角分辨率按 λ/D 缩放', 'For a circular aperture, the smallest resolvable angle shrinks when the wavelength gets shorter or the aperture gets larger.', '对圆形孔径而言，最小可分辨角度会随着波长变短而减小，也会随着口径变大而减小。', 'This is why infrared telescopes need larger apertures than visible-light telescopes to reach the same angular sharpness, and why giant segmented mirrors are worth building even when adaptive optics is difficult.', '这也解释了为何红外望远镜若想达到与可见光相同的角分辨率，往往需要更大的口径；也解释了为何即便自适应光学很难，巨型分段镜仍值得建造。', ['nasa-hubble-optics', 'nasa-wave-behaviors']),
        claimCard('Astronomical images are model-laden measurements', '天文图像是带模型的测量结果', 'Raw telescope images inherit blur, detector effects, and instrumental throughput, so interpretation requires calibration rather than simple looking.', '原始望远镜图像会继承模糊、探测器效应和系统通光效率，因此解释它们依赖定标，而不是“直接看图”。', 'The instrument is part of the measurement. Good observational astronomy asks what the telescope plus detector could have done to the light before drawing conclusions about the source.', '仪器本身就是测量的一部分。好的观测天文学会先问：望远镜与探测器对这束光做了什么，然后才对天体下结论。', ['nasa-hubble-optics'])
      ]
    },
    fluids: {
      questions: [
        question('Which force budget sets the motion?', '哪一种力学预算在主导这股流动？', 'Fluid mechanics keeps comparing inertia, pressure, viscosity, buoyancy, and boundary forcing. The right question is often not “what is the equation?” but “which term can safely be neglected here?”', '流体力学不断比较惯性、压强、黏性、浮力和边界驱动。真正关键的往往不是“方程长什么样”，而是“在这里哪一项可以安全忽略”。'),
        question('What does the boundary make the fluid do?', '边界究竟强迫流体做了什么？', 'Walls, obstacles, roughness, and moving surfaces create shear, separation, and wake structure. Many dramatic flows are controlled less by the bulk fluid than by what happens in a thin boundary layer.', '壁面、障碍物、粗糙度和运动表面会制造剪切、分离和尾迹结构。许多看似宏大的流动，其实首先受一层很薄的边界层控制。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Reynolds number organizes regimes', '雷诺数帮助组织流动区域', 'Reynolds number compares inertia to viscosity. It does not tell you everything, but it is the first clue about whether layers stay orderly or a wake can amplify disturbances.', '雷诺数比较惯性与黏性。它不能告诉你全部内容，却往往是判断流层是否会保持有序、尾迹是否会放大扰动的第一条线索。'),
        scaleCard('Helpful approximation', '常用近似', 'Continuum and incompressible descriptions', '连续介质与不可压近似', 'For many liquids and slow gases, molecular discreteness can be ignored and density changes stay small. Then continuity and momentum balance become much simpler and still accurate.', '对许多液体和低速气体而言，分子离散性可以忽略，密度变化也很小。这时连续性和动量守恒的写法会大幅简化，但仍足够准确。'),
        scaleCard('Where it fails', '何时失效', 'Transition and rarefaction resist simple rules', '转捩与稀薄极限不服从简单口号', 'The continuum picture breaks down near molecular mean free paths, and transition to turbulence depends on geometry, roughness, and noise. No single Reynolds number is a universal cliff for all flows.', '当尺度接近分子平均自由程时，连续介质图像会失效；而转入湍流还依赖几何、粗糙度和噪声。不存在一个适用于所有流动的“万能临界雷诺数”。')
      ],
      visual: {
        type: 'fluids',
        kind: 'schematic',
        repNote: t('A field-specific wake sketch tied to Reynolds-number intuition.', '把尾迹形态与雷诺数直觉联系起来的领域示意。'),
        title: t('As Re rises, attached streamlines give way to separation and wake growth.', '随着 Re 升高，附着流线会让位于分离和放大的尾迹。'),
        lede: t('Slide the Reynolds number to move from a smooth attached pattern toward a wake-dominated one. The geometry is deliberately simple so the change in regime is easy to read.', '拖动雷诺数，观察流线如何从平滑附着转向尾迹主导。几何被刻意简化，这样不同区域的变化会更容易读懂。'),
        limitations: t('This is not a CFD solution. It is a geometry-specific schematic for flow past a bluff body, so it teaches the role of separation without pretending to predict a universal transition threshold.', '这不是 CFD 数值解，而是一个针对钝体绕流的几何示意图。它强调分离的重要性，但不假装给出普适的转捩阈值。'),
        reducedMotion: t('No time animation is needed to see the full flow structure. Reduced-motion mode therefore preserves the entire explanatory state.', '无需时间动画也能看到完整流动结构，因此减少动态时不会损失任何解释信息。'),
        controls: [
          { type: 'range', key: 'reynolds', min: 50, max: 4000, step: 10, value: 280, label: t('Reynolds number Re', '雷诺数 Re'), formatter: value => format(value, 0) }
        ],
        sources: ['nasa-sphere-drag']
      },
      experiment: experimentCard('observation', 'Dye streaks in pipe flow showed that “smooth” and “turbulent” are distinct regimes, not moods.', '管流中的染料条纹表明“平滑”和“湍流”是不同区域，而不是模糊印象。', 'Injecting a thin dye filament into water revealed when neighbouring fluid layers stayed coherent and when disturbances amplified into mixing. The experiment gave fluid mechanics one of its clearest regime pictures.', '把细染料丝注入水流，能直接看见相邻流层何时保持相干，何时扰动被放大并导致混合。这个实验给了流体力学最清楚的区域图像之一。', 'The visual regime boundary depends on geometry and disturbance level, so the picture is diagnostic rather than universal.', '可见的区域边界还取决于几何和扰动水平，因此它更像诊断工具，而不是普适常数。', ['reynolds-1883']),
      mechanism: {
        title: t('Why a boundary layer can decide the whole flow', '为什么薄薄的边界层能决定整股流动'),
        steps: [
          step('No-slip creates shear', '无滑移先制造剪切', 'At a solid wall the fluid velocity must match the wall, so steep gradients appear between the surface and the free stream.', '在固体壁面上，流体速度必须匹配壁面速度，因此表面与主流之间会出现很陡的速度梯度。'),
          step('Viscosity converts that gradient into stress', '黏性把梯度变成应力', 'The boundary layer is where momentum diffuses. It can either guide the outer flow gently around the surface or lose enough momentum to peel away.', '边界层是动量扩散发生的地方。它可以温和地引导外部主流绕过表面，也可能因为丢失过多动量而脱离。'),
          step('Separation reshapes the pressure field', '分离会重写压强场', 'Once the near-wall flow detaches, the wake broadens, pressure recovery changes, and drag can rise sharply. Much of “what the whole flow does” is the integrated consequence of that local loss of attachment.', '一旦近壁流动脱离，尾迹就会变宽，压强恢复方式改变，阻力也可能急剧上升。人们看到的“整股流动做了什么”，往往正是这处局部失去附着后的积分后果。')
        ]
      },
      misconception: {
        title: t('Bernoulli alone does not explain lift.', '单靠伯努利关系并不能解释升力。'),
        body: t('A pressure-speed tradeoff along a streamline is real, but lift requires a whole momentum and boundary-condition story: the wing turns the flow, the wake carries downward momentum, and viscosity helps set the circulation that makes that turning possible.', '沿流线的压强—速度权衡当然存在，但升力需要完整的动量与边界条件故事：机翼会让气流转向，尾流携带向下动量，而黏性帮助建立使这种转向得以发生的环量。')
      },
      frontier: {
        title: t('Predictive turbulence remains incomplete.', '真正有预测力的湍流理论仍不完整。'),
        body: t('Engineering often relies on clever closures, wall models, and experiments rather than a single first-principles solution that works across scales. Multiphase, rough-wall, rotating, and reactive turbulence remain especially stubborn.', '工程上常常依赖精巧的闭合模型、壁面模型和实验，而不是一套跨尺度通吃的第一性原理解法。多相、粗糙壁面、旋转和反应湍流尤其顽固。')
      },
      claims: [
        claimCard('Reynolds number is a regime guide, not a universal oracle.', '雷诺数是区域导向，而不是万能神谕。', 'Reynolds number compares inertia to viscosity and therefore helps organize laminar, transitional, and wake-dominated behavior, but geometry, roughness, and disturbance history still matter.', '雷诺数比较惯性与黏性，因此能帮助组织层流、转捩和尾迹主导等行为，但几何、粗糙度和扰动历史依然重要。', 'That is why the same nominal Re can look tame in one setup and unstable in another. The ratio is essential, yet never the only story.', '这就是为何相同名义上的 Re 在一种装置里看起来温和，在另一种装置里却可能不稳定。这个比值非常重要，但从来不是唯一故事。', ['nasa-sphere-drag', 'reynolds-1883']),
        claimCard('A wing’s lift needs flow turning and momentum, not just a slogan about fast air.', '机翼升力需要气流转向与动量，而不是一句“上快下慢”的口号。', 'Pressure differences over a wing are real, but a complete explanation must include how the wing and boundary layer redirect the flow and create a trailing wake.', '机翼上下的压强差当然真实存在，但完整解释必须包括机翼和边界层如何让气流转向并形成尾迹。', 'Bernoulli’s relation is part of the bookkeeping, not a substitute for momentum conservation and boundary conditions.', '伯努利关系是记账的一部分，而不能代替动量守恒和边界条件。', ['nasa-lift', 'nasa-bernoulli'])
      ]
    },
    acoustics: {
      questions: [
        question('Which frequencies can this material and geometry sustain?', '这种材料与几何能支撑哪些频率？', 'Acoustics asks how the medium and the boundaries pick out a mode structure. The same disturbance sounds different in a violin string, a room, or the ocean because each system filters pressure waves differently.', '声学关心介质和边界如何挑选出一套模态结构。同样的扰动在小提琴弦、房间和海洋里会听起来不同，因为每个系统对压强波的筛选方式都不同。'),
        question('How does mechanical motion become information?', '机械振动如何变成信息？', 'A sound source launches pressure variations, propagation reshapes them, and a detector or ear converts them into an electrical or neural signal. Every stage matters if you want to infer the source honestly.', '声源先发出压强变化，传播过程再改写这些变化，最后由探测器或耳朵把它们转成电信号或神经信号。若要诚实地反推出声源，每一环都重要。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Wavelength versus boundary size', '波长与边界尺寸的相对大小', 'Standing modes and strong reflections appear when the source wavelength is comparable to the cavity, pipe, string, or structural scale that traps it.', '当声源波长与腔体、管道、弦或结构尺度相当时，就会出现显著反射和驻波模态。'),
        scaleCard('Helpful approximation', '常用近似', 'Linear, small-amplitude sound', '小振幅线性声学', 'Ordinary acoustics treats pressure variations as small perturbations on a background state. Then waves add linearly, making interference, mode decomposition, and decibels useful.', '常规声学把压强变化视为背景状态上的小扰动。这样波就能线性叠加，干涉、模态分解和分贝刻度也才好用。'),
        scaleCard('Where it fails', '何时失效', 'Shock formation and strong losses', '激波形成与强耗散', 'At very large amplitudes or in strongly lossy materials, the neat sinusoidal picture breaks. Sonic booms, cavitation, and highly damped media need more than the textbook wave equation.', '在振幅很大或材料耗散很强时，整洁的正弦波图景会失效。音爆、空化和强阻尼介质都超出了教科书式波动方程的舒适区。')
      ],
      visual: {
        type: 'acoustics',
        kind: 'model',
        repNote: t('Calculated normal modes for idealized one-dimensional boundaries.', '对理想一维边界求得的简正模。'),
        title: t('Boundary conditions choose the standing-wave family.', '边界条件决定了哪一族驻波可以存在。'),
        lede: t('Switch between an open-open and an open-closed tube, then move among modes. The allowed shapes are discrete because the boundary decides which phase patterns can reinforce themselves.', '在两端开口与一端封闭的管之间切换，再在不同模态间移动。允许出现的形状之所以离散，是因为边界条件决定了哪些相位图样能自我增强。'),
        limitations: t('The panel shows a one-dimensional pressure mode, not the full three-dimensional motion of air molecules or wall losses in a real instrument or room.', '这张图显示的是一维压强模态，而不是空气分子的三维运动，也没有加入真实乐器和房间里的壁面耗散。'),
        reducedMotion: t('The standing-wave shape is fully visible in a static solved state, so reduced-motion mode leaves the explanation intact.', '驻波形状在静态求解状态下就完整可见，因此减少动态不会损伤解释。'),
        controls: [
          { type: 'toggle', key: 'boundary', value: 'open-open', label: t('Boundary condition', '边界条件'), options: [{ value: 'open-open', label: t('Open-open', '两端开口') }, { value: 'open-closed', label: t('Open-closed', '一端封闭') }] },
          { type: 'range', key: 'mode', min: 1, max: 5, step: 1, value: 2, label: t('Mode index', '模态序号'), formatter: value => format(value, 0) }
        ],
        sources: ['unsw-pipes']
      },
      experiment: experimentCard('observation', 'Resonance in strings, pipes, and cavities made sound visibly measurable.', '弦、管和腔体中的共振让声音第一次变得“看得见、量得着”。', 'By sweeping frequency and watching which patterns grow, experimenters could map nodes, antinodes, and resonant peaks. That turned pitch and timbre into geometry plus boundary conditions.', '通过扫描频率并观察哪些图样被放大，实验者能够描出节点、腹部和共振峰，从而把音高与音色化成几何与边界条件的问题。', 'The displayed mode shapes are idealized; real resonators broaden and shift because of damping and coupling to their surroundings.', '图中的模态形状经过理想化处理；真实共振器会因阻尼和环境耦合而展宽、偏移。', ['unsw-pipes']),
      mechanism: {
        title: t('From vibrating source to heard pitch', '从振动声源到被听见的音高'),
        steps: [
          step('A source launches pressure oscillations', '声源先推出压强振荡', 'A string, vocal fold, or speaker moves the nearby medium back and forth, creating alternating compressions and rarefactions.', '弦、声带或扬声器会推动附近介质往复运动，形成交替的压缩和稀疏。'),
          step('Propagation and boundaries select modes', '传播与边界再筛出模态', 'The wave travels at a speed set by the medium, but reflections at boundaries only reinforce certain phase patterns. Those surviving patterns define the resonance structure.', '波以介质决定的速度传播，但边界上的反射只会强化某些相位图样。幸存下来的图样定义了共振结构。'),
          step('A detector converts pressure into signal', '探测器把压强变成信号', 'An ear or microphone turns those pressure variations into membrane motion and then into electrical or neural encoding, where amplitude, timing, and spectrum can be inferred.', '耳朵或麦克风把这些压强变化先转成膜的运动，再转成电信号或神经编码，从中读出振幅、时序和频谱。')
        ]
      },
      misconception: {
        title: t('Louder sound does not travel faster in ordinary acoustics.', '在通常声学里，更响的声音并不会传播得更快。'),
        body: t('For linear sound waves, speed is set mainly by the medium’s elastic and inertial properties, not by volume. Amplitude matters for intensity, while propagation speed belongs to the material and thermodynamic state.', '在线性声学里，声速主要由介质的弹性与惯性性质决定，而不是由响度决定。振幅影响的是强度；传播速度属于材料与热力学状态。')
      },
      frontier: {
        title: t('Complex media still resist simple inversion.', '复杂介质仍难以被简单反演。'),
        body: t('Urban soundscapes, biological tissue, and the ocean all combine scattering, absorption, and changing backgrounds. The open problem is not writing a wave equation, but reliably inferring sources or structures through messy propagation.', '城市声场、生物组织和海洋都会把散射、吸收与变化中的背景叠加在一起。难题不是写下波动方程，而是如何穿过这些混乱传播过程，可靠地反推声源或结构。')
      },
      claims: [
        claimCard('Boundaries quantize allowed modes.', '边界会把允许模态量子化为离散家族。', 'A pipe or cavity does not support arbitrary pressure patterns at equal strength. Only phase relations compatible with its boundaries become resonant standing waves.', '管道或腔体并不会等强度地支持任意压强图样。只有与边界条件相容的相位关系，才会成长为共振驻波。', 'This is why changing whether an end is open or closed changes the harmonic ladder, even when the material and the source stay the same.', '这就是为何即便材料和声源不变，只要把端点从开口改成封闭，谐波阶梯就会改变。', ['unsw-pipes']),
        claimCard('Hearing is a mechanical-to-electrical conversion problem.', '听觉本质上是机械到电信号的转换。', 'Pressure waves do not become perception directly; the ear first turns them into mechanical motion and then into neural signals.', '压强波并不会直接变成知觉；耳朵必须先把它们转成机械运动，再转成神经信号。', 'That conversion is why sound can be analyzed with the same care as any other transduction chain, from microphone calibration to auditory physiology.', '也正因为如此，声音可以像其他换能链一样被严谨分析，从麦克风定标一直到听觉生理。', ['nih-hear'])
      ]
    },
    thermodynamics: {
      questions: [
        question('Which state changes are allowed at all?', '哪些状态变化在根本上允许发生？', 'Thermodynamics asks about possibility before mechanism: can this combination of heat, work, and reservoirs happen without violating the first and second laws?', '热力学总是先问“可不可能”，再问“怎么发生”。某种热、功与热源的组合，究竟能不能在不违背第一和第二定律的前提下实现？'),
        question('How much useful work can survive irreversibility?', '在不可逆性面前，多少有用功还能留下来？', 'Real machines always dump part of the energy they handle. The field studies how entropy production limits what fraction of a thermal gradient can remain as organized work.', '真实机器总会把处理过的一部分能量丢进废热。热力学研究的是：熵产生会把温差中的多少部分，永远挡在“有组织的功”之外。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Reservoir temperatures and state variables', '热源温度与状态变量', 'At the macroscopic level the central coordinates are temperature, pressure, volume, chemical potential, and entropy. You do not need individual molecules to ask whether a process is compatible with those state changes.', '在宏观层面，核心坐标是温度、压强、体积、化学势与熵。要判断过程是否与这些状态变化相容，并不需要先看见每一个分子。'),
        scaleCard('Helpful approximation', '常用近似', 'Quasi-static reversible limits', '准静态可逆极限', 'Ideal reversible cycles provide upper bounds because they avoid extra entropy production. They are not literal engines, but benchmarks against which real engines can be judged.', '理想可逆循环之所以能给出上限，是因为它避免了额外熵产生。它不是字面意义上的真实发动机，却是评价真实发动机时不可缺少的标杆。'),
        scaleCard('Where it fails', '何时失效', 'Far from equilibrium or too small to average', '远离平衡或小到无法平均时', 'If gradients are steep, fluctuations are large, or a system is actively driven, neat equilibrium state functions no longer tell the whole story. Then kinetics and statistical mechanics must take over.', '当梯度很陡、涨落很大，或系统被持续驱动时，漂亮的平衡态函数就不再能讲完全部故事。此时必须由动力学和统计力学接手。')
      ],
      visual: {
        type: 'thermodynamics',
        kind: 'model',
        repNote: t('A calculated reversible ceiling paired with schematic energy-level populations.', '把计算出的可逆上限与示意性的能级占据并列展示。'),
        title: t('Temperature sets both the Carnot ceiling and the breadth of microscopic energy occupancy.', '温度既决定卡诺上限，也决定微观能级占据有多宽。'),
        lede: t('Move the hot and cold reservoirs to see two linked ideas at once: the efficiency ceiling for a reversible engine, and the broader energy spread available at higher temperature.', '拖动高温与低温热源，可以同时看到两个相连的想法：可逆热机的效率上限，以及更高温度下更宽的微观能量分布。'),
        limitations: t('The bars are a toy equilibrium distribution, not a molecular simulation, and the engine sketch suppresses every practical loss besides the thermodynamic ceiling.', '这些柱形图只是玩具式平衡分布，而非分子模拟；热机示意图也省略了除热力学上限之外的一切工程损耗。'),
        reducedMotion: t('The full argument is visible in a static state because the relevant quantities are state variables, not moving trajectories.', '相关论证在静态状态下就完整可见，因为这里关键的是状态变量，而不是运动轨迹。'),
        controls: [
          { type: 'range', key: 'hot', min: 350, max: 900, step: 10, value: 700, label: t('Hot reservoir T_h', '高温热源 T_h'), formatter: value => `${format(value, 0)} K` },
          { type: 'range', key: 'cold', min: 120, max: 420, step: 10, value: 290, label: t('Cold reservoir T_c', '低温热源 T_c'), formatter: value => `${format(value, 0)} K` }
        ],
        sources: ['utexas-heat-engines', 'nist-boltzmann']
      },
      experiment: experimentCard('model', 'Modern temperature metrology ties the kelvin to microscopic energy, not to one specific material sample.', '现代温度计量把开尔文直接连到微观能量尺度，而不是某一份特定样品。', 'The kelvin and the Boltzmann constant anchor thermal measurements in a way that lets engine limits, heat capacities, and molecular energies speak the same language.', '开尔文与玻尔兹曼常数为热学测量提供了统一锚点，使热机上限、热容和分子能量能够说同一种语言。', 'This card is about metrological grounding rather than a single laboratory apparatus.', '这张卡片强调的是计量学基础，而不是某一台独立实验装置。', ['nist-temperature', 'nist-boltzmann']),
      mechanism: {
        title: t('Why no engine can turn one reservoir completely into work', '为什么没有热机能把单一热源全部变成功'),
        steps: [
          step('Thermal energy starts in many microscopic arrangements', '热能起初分散在许多微观排布中', 'A hot reservoir stores energy in a large spread of accessible microscopic states. That spread is what temperature and entropy summarize macroscopically.', '高温热源把能量分散在大量可及的微观状态中。温度和熵在宏观上正是对这种分散程度的概括。'),
          step('Useful work needs directional organization', '有用功需要定向的组织性', 'To raise a weight or turn a shaft, the energy flow must be more ordered than ordinary thermal agitation. Extracting some of that order necessarily leaves a less useful remainder.', '要抬起重物或转动转轴，能量流必须比普通热扰动更有方向性。抽取出一部分组织性之后，必然会留下更“没用”的剩余部分。'),
          step('Dumping entropy to a colder sink keeps the bookkeeping honest', '把熵排向更冷热源，才能维持守恒账本', 'A complete cycle must return the engine to its starting state. That means the entropy drawn from the hot side must go somewhere, and a colder reservoir is what lets that happen without violating the second law.', '一个完整循环必须把热机送回初始状态。这意味着从高温侧带走的熵总得有地方安放，而更冷的热源正是让这件事在不违背第二定律的情况下发生的对象。')
        ]
      },
      misconception: {
        title: t('Entropy is not just “messiness”.', '熵并不只是“乱不乱”。'),
        body: t('“Disorder” can be a useful metaphor, but thermodynamics uses entropy as a state variable with precise accounting rules. What matters is the count of compatible microscopic arrangements and how energy is distributed among them.', '“混乱”可以作为比喻，但热力学里的熵是有精确定义和严格账本规则的状态变量。真正关键的是相容微观排布的数目，以及能量在这些排布之间如何分布。')
      },
      frontier: {
        title: t('Small engines and nonequilibrium matter still stretch the framework.', '微型热机与非平衡物质仍在拉伸这套框架。'),
        body: t('Cells, nanoscale devices, driven colloids, and information-bearing memories all produce entropy while fluctuating strongly. The frontier is to keep thermodynamic accounting sharp even when averages are not enough.', '细胞、纳米器件、受驱胶体和携带信息的存储系统都会在强烈涨落中产生熵。前沿任务是：当简单平均值已不够用时，仍能把热力学的记账做得清楚。')
      },
      claims: [
        claimCard('The Carnot efficiency depends only on reservoir temperatures.', '卡诺效率只取决于两个热源温度。', 'For a reversible engine, the maximum possible efficiency is fixed by 1 − T_c/T_h, not by the working substance.', '对可逆热机而言，最大可能效率由 1 − T_c/T_h 决定，而不是由工质名字决定。', 'That is why steam, gas, or any other substance can be compared against one universal ceiling once the hot and cold temperatures are specified.', '这就是为什么一旦给定高温和低温，蒸汽、气体或任何其他工质都能拿同一个上限来比较。', ['utexas-heat-engines']),
        claimCard('Microscopic energy and macroscopic temperature are linked by the Boltzmann constant.', '微观能量尺度与宏观温度通过玻尔兹曼常数相连。', 'The Boltzmann constant is what lets thermal energy, entropy, and molecular-scale excitations be written in one consistent unit system.', '玻尔兹曼常数使热能、熵和分子尺度激发能够放进同一个一致的单位体系里书写。', 'That link is why thermodynamic temperature is not just a subjective warmth scale but a physically grounded measure of energy distribution.', '也正因如此，热力学温度并不只是“冷暖感受”的刻度，而是对能量分布有物理基础的测量。', ['nist-boltzmann', 'nist-temperature'])
      ]
    },
    electromagnetism: {
      questions: [
        question('How do charges communicate across space?', '电荷如何隔着空间彼此作用？', 'Electromagnetism asks which parts of the interaction are stored locally in fields and which are carried away as radiation or current. The field picture replaces vague action at a distance with explicit structure in space.', '电磁学追问：相互作用的哪些部分局域地存放在场中，哪些部分会以辐射或电流的形式带走。场图像用空间中的明确结构取代了含糊的超距作用。'),
        question('What changes when the sources start moving?', '当源开始运动时，什么会发生变化？', 'A static charge already creates an electric field, but changing current or magnetic flux creates entirely new effects. Motion turns separate-looking electric and magnetic phenomena into one connected system.', '静止电荷已经会产生电场，但变化的电流或磁通又会制造全新的效应。运动把看似分离的电和磁现象连成了一个系统。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Field strength and flux geometry', '场强与磁通几何', 'Many measurable effects reduce to how much field threads a surface or how sharply the field changes from place to place. Geometry is not decoration here; it is part of the law.', '许多可测效应最终都归结为有多少场穿过一个面积，或者场在空间里变化得有多快。几何在这里不是装饰，而是定律本身的一部分。'),
        scaleCard('Helpful approximation', '常用近似', 'Quasi-static circuits and smooth fields', '准静态电路与平滑场', 'For many laboratory and engineering setups, source changes are slow enough that circuits and near fields can be analyzed without tracking full radiation into space.', '对许多实验室和工程装置而言，源变化得足够慢，因此无需一路追踪向外辐射的完整波，就能分析电路和近场。'),
        scaleCard('Where it fails', '何时失效', 'Atomic and photon-by-photon limits', '原子尺度与逐个光子极限', 'Classical field lines cannot explain discrete emission, atomic spectra, or the stability of matter. Once field exchange is quantized, quantum theory must replace the smooth classical picture.', '经典场线无法解释离散发射、原子谱线或物质稳定性。一旦场的交换被量子化，就必须由量子理论接管平滑的经典图像。')
      ],
      visual: {
        type: 'electromagnetism',
        kind: 'model',
        repNote: t('A flux-change schematic with Lenz-law directionality.', '带有楞次定律方向信息的磁通变化示意。'),
        title: t('Change the magnetic flux and the loop answers with an induced circulation.', '改变磁通，回路就会以感应环流作出回应。'),
        lede: t('Move the relative flux-change rate through zero to flip the induced current direction. The panel is deliberately spare so the sign logic behind Lenz’s law is easy to read.', '把相对磁通变化率跨过零点，就能看见感应电流方向反转。这个图被刻意画得很简洁，好让楞次定律背后的符号逻辑一眼看清。'),
        limitations: t('The loop is planar and the flux is represented by symbols through the page. Real induction problems often involve distributed conductors, nonuniform fields, resistance, and back-reaction.', '回路被画成平面，磁通也只用穿出或穿入纸面的符号表示。真实感应问题往往还涉及分布式导体、非均匀磁场、电阻与反馈作用。'),
        reducedMotion: t('All causal structure is present in a static state. Reduced-motion mode therefore preserves the full explanatory content.', '全部因果结构在静态状态下就已经完整出现，因此减少动态不会损失解释内容。'),
        controls: [
          { type: 'range', key: 'fluxRate', min: -1, max: 1, step: 0.05, value: 0.55, label: t('Relative dΦ/dt', '相对 dΦ/dt'), formatter: value => value.toFixed(2) },
          { type: 'range', key: 'fieldStrength', min: 0.4, max: 1.6, step: 0.05, value: 1, label: t('Relative field strength', '相对场强'), formatter: value => value.toFixed(2) }
        ],
        sources: ['doe-em-force', 'nasa-spectrum']
      },
      experiment: experimentCard('observation', 'Faraday’s induction experiment made a changing magnetic environment visibly electrical.', '法拉第的感应实验让“变化的磁环境”第一次清楚地变成电学现象。', 'Moving a magnet or varying current near a loop produced a measurable induced emf. That showed that magnetism was not a static curiosity but part of a dynamical field system.', '把磁体移动到线圈附近，或改变附近电流，就会在线圈中产生可测的感应电动势。这表明磁并不是静态奇物，而是一个动力学场系统的一部分。', 'The measured sign matters: the response opposes the change in flux rather than amplifying it.', '真正重要的是响应的符号：它会反抗磁通变化，而不是顺势放大。', ['doe-em-force']),
      mechanism: {
        title: t('How a changing flux becomes an induced current', '变化的磁通如何变成感应电流'),
        steps: [
          step('The magnetic environment through the loop changes', '先让穿过回路的磁环境发生变化', 'That change can come from a moving magnet, a changing current nearby, or a conductor moving through a field.', '这种变化可以来自磁体运动、附近电流变化，或者导体在磁场中运动。'),
          step('A circulating electric field appears', '接着出现环绕的电场', 'Faraday induction does not first require charges already moving around the wire. The time-varying magnetic field creates an electric field whose geometry naturally wraps around the changing flux.', '法拉第感应并不要求导线里原本就有电荷在绕圈跑。随时间变化的磁场会生成电场，而这个电场的几何天然地围绕着变化中的磁通。'),
          step('Charges respond, and the induced current opposes the change', '电荷随之响应，而感应电流会反抗原始变化', 'Once charges in the conductor feel that induced field, they move. The resulting magnetic response resists the original flux change, which is the physical content of Lenz’s law.', '当导体中的电荷感受到这个感应电场后，它们就会开始运动。由此产生的磁响应会抵抗原始磁通变化，这正是楞次定律的物理内容。')
        ]
      },
      misconception: {
        title: t('Magnetic fields do not push a charge at rest along the field line.', '磁场不会沿磁感线推动一个静止电荷。'),
        body: t('In the Lorentz force law, the magnetic part is sideways to the motion and vanishes for a charge at rest. What often gets confused is that changing magnetic fields can create electric fields, and those electric fields can then drive current.', '在洛伦兹力定律中，磁力部分总是侧向于运动方向，对静止电荷则根本不存在。人们常混淆的是：变化的磁场会生成电场，而这些电场随后又能驱动电流。')
      },
      frontier: {
        title: t('Strong fields and quantum limits demand a new theory.', '强场和量子极限要求新理论。'),
        body: t('Ultraintense lasers, atomic precision metrology, and radiation from single quanta all sit where classical continuous fields stop being enough. The open boundary is how electromagnetic intuition survives once the field must be quantized.', '超强激光、原子级精密测量和单量子辐射，都处在经典连续场已经不够用的地方。开放边界在于：一旦场必须量子化，哪些电磁直觉还能保留下来。')
      },
      claims: [
        claimCard('Changing magnetic flux induces an emf around a loop.', '变化的磁通会在线圈周围感生电动势。', 'Induction is driven by time-varying magnetic flux, not by a static magnetic field all by itself.', '感应由随时间变化的磁通驱动，而不是由一个静止不变的磁场单独完成。', 'That single principle underlies generators, transformers, and many sensing technologies. The crucial fact is the change, not the mere presence, of flux.', '发电机、变压器和许多传感技术都建立在这条原则上。关键在于磁通的变化，而不是磁通“存在”本身。', ['doe-em-force']),
        claimCard('Light is part of the electromagnetic field family.', '光属于电磁场这一整个家族。', 'Electric and magnetic fields are not separate curiosities; their coupled evolution is what allows electromagnetic waves to propagate through space.', '电场和磁场并不是彼此孤立的奇观；正是它们耦合的演化，使电磁波得以在空间中传播。', 'Seeing light as an electromagnetic wave is what turns optics, radio, X-rays, and circuits into chapters of one subject rather than separate sciences.', '把光看成电磁波，才使光学、无线电、X 射线和电路学成为同一门学科的不同章节，而不是彼此分裂的学问。', ['nasa-spectrum', 'doe-em-force'])
      ]
    },
    statistical: {
      questions: [
        question('How can reversible microscopic motion yield irreversible macroscopic behavior?', '可逆的微观运动怎么会给出不可逆的宏观行为？', 'Statistical mechanics keeps translating detailed motion into overwhelmingly likely coarse behavior. The field is less about a single particle trajectory than about what almost all compatible trajectories do in aggregate.', '统计力学不断把细致的微观运动翻译成“几乎必然发生”的粗粒化宏观行为。它关注的并不是某一条单独粒子的轨迹，而是所有相容轨迹在总体上几乎都会做什么。'),
        question('Which few variables summarize an astronomically large state space?', '哪些少量变量能概括天文数字般巨大的状态空间？', 'Temperature, pressure, entropy, magnetization, and chemical potential are successful because fluctuations average away in large systems. The discipline studies why those summaries work and when they stop working.', '温度、压强、熵、磁化强度和化学势之所以成功，是因为巨系统中的涨落会被平均掉。统计力学研究的正是这些摘要为何有效，以及它们何时不再有效。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Energy gaps against kT', '能级间隔与 kT 的比较', 'Thermal occupation depends on how a level spacing compares with kT. That ratio decides whether excited states are common, rare, or essentially frozen out.', '热占据情况取决于能级间隔和 kT 的相对大小。这个比值决定了激发态是常见、稀有，还是几乎被冻结。'),
        scaleCard('Helpful approximation', '常用近似', 'Large-N smoothing and equilibrium ensembles', '大数平滑与平衡系综', 'When particle number is enormous, relative fluctuations shrink and equilibrium ensembles become sharply predictive. That is why macroscopic variables look so stable despite microscopic randomness.', '当粒子数极大时，相对涨落会缩小，平衡系综也会变得高度有预测力。这就是为什么宏观量看起来如此稳定，尽管微观层面充满随机性。'),
        scaleCard('Where it fails', '何时失效', 'Glasses, strong driving, and long-lived memory', '玻璃态、强驱动与长时记忆', 'Some systems do not equilibrate on accessible timescales, while others are continuously driven. In those cases equilibrium probabilities are not enough and history matters explicitly.', '有些系统在可观测时间内根本来不及达到平衡，另一些则被持续驱动。在这些情况下，平衡概率已不够用，系统历史会直接进入问题本身。')
      ],
      visual: {
        type: 'statistical',
        kind: 'model',
        repNote: t('Boltzmann-weighted occupation of a small set of discrete energy levels.', '对少数离散能级施加玻尔兹曼权重后的占据情况。'),
        title: t('As ΔE/kT grows, probability collapses into the lowest levels.', '随着 ΔE/kT 变大，概率会坍缩到最低能级。'),
        lede: t('Change the energy spacing and temperature to see how equilibrium occupation shifts. The point is not any one material, but the statistical rule linking thermal energy to level populations.', '调节能级间隔与温度，看看平衡占据如何移动。关键并不是某种特定材料，而是把热能与能级占据联系起来的统计规则。'),
        limitations: t('Only four discrete levels are drawn, and all interactions between particles are suppressed. The panel isolates the Boltzmann factor rather than simulating a full material.', '这里只画了四个离散能级，也完全忽略了粒子间相互作用。这张图是为了孤立出玻尔兹曼因子，而不是模拟某种完整材料。'),
        reducedMotion: t('This is a static equilibrium calculation, so reduced-motion mode leaves the full content untouched.', '这是一张静态平衡计算图，因此减少动态不会改变任何内容。'),
        controls: [
          { type: 'range', key: 'gap', min: 0.2, max: 2.4, step: 0.05, value: 1, label: t('Level spacing ΔE/k', '能级间隔 ΔE/k'), formatter: value => value.toFixed(2) },
          { type: 'range', key: 'temperature', min: 0.2, max: 2.2, step: 0.05, value: 1, label: t('Temperature T', '温度 T'), formatter: value => value.toFixed(2) }
        ],
        sources: ['utexas-boltzmann', 'sep-statmech']
      },
      experiment: experimentCard('model', 'Measurable bulk regularity comes from state counting, not from tracking every molecule.', '可测的宏观规律来自状态计数，而不是逐个追踪每个分子。', 'Heat capacities, equations of state, and equilibrium populations become predictable once the overwhelming majority of microscopic arrangements are counted statistically rather than followed individually.', '一旦改用统计计数而不是逐一跟踪，热容、状态方程和平衡占据就会变得可预测。', 'This card emphasizes the inferential method: ensemble reasoning is itself the landmark move.', '这张卡片强调的是方法论上的里程碑：系综推理本身就是关键转变。', ['utexas-boltzmann', 'sep-statmech']),
      mechanism: {
        title: t('Why hot-to-cold flow is overwhelmingly likely', '为什么热量几乎必然从高温流向低温'),
        steps: [
          step('More microscopic arrangements correspond to mixed energy sharing', '更多微观排布对应更均匀的能量分配', 'When two subsystems can exchange energy, there are usually vastly more ways to divide that energy approximately evenly than to keep it lopsided.', '当两个子系统能够交换能量时，通常会有压倒性更多的方式把能量分得比较均匀，而不是长期保持极端偏斜。'),
          step('Typical states dominate what you actually observe', '典型态会支配真正观察到的结果', 'Nothing in the microscopic laws says energy may only move one way. Instead, the macroscopic arrow comes from the fact that atypical low-entropy arrangements occupy an extraordinarily tiny slice of state space.', '微观定律并没有写着“能量只能朝一个方向走”。宏观箭头来自另一件事：那些非典型的低熵排布，只占状态空间中极其微小的一角。'),
          step('Coarse variables therefore drift toward equilibrium', '于是粗粒化变量会朝平衡漂移', 'Temperature and pressure smooth out not because fluctuations vanish, but because in large systems fluctuations are too small and too rare to fight the statistics for long.', '温度和压强会趋于平衡，并不是因为涨落完全消失，而是因为在巨系统里，涨落太小、太少，无法长期对抗统计大势。')
        ]
      },
      misconception: {
        title: t('Entropy is not simply “disorder”.', '熵并不只是“无序”。'),
        body: t('Calling entropy disorder can be suggestive, but it hides the real statement: entropy tracks how many microscopic arrangements are compatible with the macroscopic constraints. The precise content is combinatorial and thermodynamic, not aesthetic.', '把熵说成“无序”有时能帮助直觉，但也会遮住真正的内容：熵追踪的是在宏观约束下有多少微观排布是相容的。它的精确含义是组合学与热力学的，而不是审美意义上的“乱”。')
      },
      frontier: {
        title: t('Nonequilibrium many-body systems remain hard.', '非平衡多体系统仍然很难。'),
        body: t('Driven quantum matter, active materials, glasses, and turbulent transport all ask what survives once equilibrium ensembles no longer close the story. The frontier is to predict collective behavior without the comfort of near-equilibrium averaging.', '受驱量子物质、活性材料、玻璃态和湍流输运都在追问：一旦平衡系综讲不完故事，还有什么规律能保留下来？前沿任务是在没有近平衡平均值护栏的情况下，仍然预测集体行为。')
      },
      claims: [
        claimCard('Boltzmann weighting suppresses higher-energy states exponentially.', '玻尔兹曼权重会指数式压低高能态。', 'At equilibrium, the probability of a state falls as exp(−E/kT), so the same energy gap matters very differently at low and high temperature.', '在平衡态下，状态概率按 exp(−E/kT) 衰减，因此同一个能级间隔在低温和高温时会表现得完全不同。', 'This is the practical bridge from microscopic energies to macroscopic observables such as heat capacity, occupancy, and population inversion thresholds.', '这条关系正是从微观能量跨到热容、占据数和反转阈值等宏观可观测量的实用桥梁。', ['utexas-boltzmann']),
        claimCard('Macroscopic smoothness emerges because relative fluctuations shrink with system size.', '宏观平滑性来自相对涨落随系统规模缩小。', 'Large systems still fluctuate, but their relative fluctuations scale down so strongly that temperature and pressure become sharp operational concepts.', '大系统依然在涨落，但它们的相对涨落会如此显著地缩小，以至于温度和压强变成了操作上非常锐利的概念。', 'That is why a cup of water can have a stable thermometer reading even though its molecules never stop jostling.', '这就是为什么一杯水可以有稳定的温度计读数，尽管其中的分子从未停止碰撞。', ['sep-statmech', 'nist-entropy'])
      ]
    },
    biophysics: {
      questions: [
        question('How far can ordinary physics explain living systems without extra vital ingredients?', '普通物理在不诉诸“生命特殊力”的情况下，究竟能解释生命系统到多深？', 'Biophysics asks how mechanics, thermodynamics, electrostatics, diffusion, and fluctuations work inside cells, molecules, and tissues. The surprise is not that biology escapes physics, but how much function is built from it.', '生物物理学追问的是：力学、热力学、静电、扩散和涨落如何在细胞、分子和组织内部运作。令人惊讶的并不是生物逃离了物理，而是如此多的功能正是由物理搭建出来的。'),
        question('Which biological regularities come from energy flow, geometry, and noise?', '哪些生物规律来自能量流、几何和噪声？', 'The field keeps identifying where chemistry and regulation sit on top of robust physical constraints such as membrane potentials, Brownian search, and low-Reynolds swimming.', '这个领域不断识别：化学和调控究竟是建在膜电位、布朗搜索和低雷诺数游动等稳固物理约束之上的哪些层。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Thermal energy competes with molecular forces', '热能会与分子尺度作用力直接竞争', 'In living matter, kT is often large enough to reshape molecules, scramble orientations, and drive stochastic search. That means useful biological work is usually done in a noisy thermal environment.', '在生命物质里，kT 往往大到足以重排分子、打乱取向并驱动随机搜索。这意味着有用的生物功能通常都发生在充满热噪声的环境中。'),
        scaleCard('Helpful approximation', '常用近似', 'Low-Reynolds and membrane-equilibrium pictures', '低雷诺数与膜平衡近似', 'Many cellular flows live where viscosity dominates inertia, and many membrane arguments begin with a one-ion equilibrium potential before adding channel complexity.', '许多细胞尺度流动都处在黏性压倒惯性的区域；而许多膜问题也总是先从单一离子平衡电位起步，再逐渐加入通道复杂性。'),
        scaleCard('Where it fails', '何时失效', 'Regulation and chemistry exceed the cleanest toy models', '调控与化学会超出最干净的玩具模型', 'A membrane-potential or Brownian-motor picture can expose the physics backbone while still omitting enormous biochemical specificity. Biophysics gains insight by coarse-graining, not by pretending life is simple.', '膜电位图像或布朗马达图像可以揭示物理骨架，但同时会省掉海量生化特异性。生物物理学依靠粗粒化获得洞见，而不是假装生命很简单。')
      ],
      visual: {
        type: 'biophysics',
        kind: 'model',
        repNote: t('A membrane-potential sketch built from the Nernst relation for one dominant ion species.', '以单一主导离子的能斯特关系为基础构建的膜电位示意。'),
        title: t('Concentration imbalance can be turned into an electrical one.', '浓度失衡可以被翻译成电位失衡。'),
        lede: t('Change the outside-to-inside concentration ratio to see the equilibrium potential move. The goal is to expose one of the cleanest ways biophysics turns molecular counts into a measurable voltage.', '改变膜外对膜内的浓度比，看看平衡电位如何移动。这个图展示的是：生物物理学如何把分子数目最清楚地翻译成可测电压。'),
        limitations: t('The panel holds temperature and ion valence fixed and treats one ion as dominant. Real cells combine several ion species, channels, pumps, and nonequilibrium transport.', '这张图固定了温度和离子价数，并假设只有一种离子占主导。真实细胞会同时叠加多种离子、通道、泵和非平衡输运。'),
        reducedMotion: t('All essential structure is visible statically, so reduced-motion mode keeps the whole explanatory state.', '关键结构在静态状态下就已完整可见，因此减少动态不会丢掉任何解释。'),
        controls: [
          { type: 'range', key: 'ratio', min: 0.25, max: 8, step: 0.05, value: 2.2, label: t('Concentration ratio cₒ/cᵢ', '浓度比 cₒ/cᵢ'), formatter: value => value.toFixed(2) }
        ],
        sources: ['ncbi-membrane-potentials', 'purcell-low-re']
      },
      experiment: experimentCard('reconstruction', 'X-ray diffraction and molecular-scale measurement showed that biological structure can be inferred physically, not guessed metaphorically.', 'X 射线衍射和分子尺度测量表明，生物结构可以被物理地推断，而不是靠比喻猜测。', 'The double helix became credible because diffraction patterns, bond geometry, and chemical constraints converged on the same structure. Biophysics turns life into a measurement problem rather than a purely descriptive one.', 'DNA 双螺旋之所以可信，是因为衍射图样、键长几何和化学约束收敛到同一个结构上。生物物理学把生命问题转成了测量问题，而不是纯描述问题。', 'The measurement is indirect but physically constrained, much like other inverse problems in science.', '这种测量是间接的，但受到严格物理约束，与科学中的其他反问题类似。', ['nature-thymonucleate', 'nature-dna-structure']),
      mechanism: {
        title: t('How an ion gradient becomes an electrical signal', '离子浓度梯度如何变成电信号'),
        steps: [
          step('Selective permeability lets one ion species dominate the exchange', '选择性通透性先让某一种离子主导交换', 'If one channel type is much more available than others, that ion sets the simplest first approximation to the membrane potential.', '如果某一类通道比其他通道更容易开放，那么该离子就会给出膜电位最简单的第一近似。'),
          step('Diffusion pushes particles down their concentration gradient', '扩散推动粒子沿浓度梯度移动', 'A concentration imbalance favors net flux from the crowded side to the sparse side.', '浓度不平衡会偏向把粒子从拥挤一侧推向稀疏一侧。'),
          step('Charge separation builds an opposing electrical force', '电荷分离又会建立反向的电力', 'As ions cross, they leave behind and accumulate charge. Equilibrium appears when the electrical pull exactly balances the concentration-driven tendency.', '离子一旦跨膜，就会在两侧留下并积累电荷。等到电力恰好抵消浓度驱动时，就到达平衡。')
        ]
      },
      misconception: {
        title: t('Life does not violate the second law.', '生命并不违反第二定律。'),
        body: t('Living systems maintain internal order by consuming free energy and exporting entropy to their surroundings. Their apparent order is sustained by throughput, not by exemption from thermodynamics.', '生命系统通过消耗自由能并向环境输出熵，来维持内部有序。它们之所以看起来有序，是因为存在持续通量，而不是因为它们被热力学豁免。')
      },
      frontier: {
        title: t('Physics can expose a backbone without replacing biology.', '物理可以揭示骨架，但不能替代生物学本身。'),
        body: t('Molecular motors, condensates, membrane mechanics, and active tissues are all physically tractable, yet full biological function still depends on chemistry, evolution, and regulation layered on top of that physics.', '分子马达、凝聚体、膜力学和活性组织都可以被物理地处理，但完整的生物功能仍然依赖叠加其上的化学、进化和调控。')
      },
      claims: [
        claimCard('Membrane voltage can emerge directly from an ion concentration imbalance.', '膜电压可以直接从离子浓度失衡中涌现出来。', 'If one ion species dominates membrane permeability, the voltage that balances its diffusive tendency is set by the concentration ratio across the membrane.', '如果某一种离子主导膜的通透性，那么抵消其扩散趋势的电压就由膜两侧的浓度比决定。', 'That is why concentration gradients are not just chemical facts; they are also electrical resources.', '这就是为什么浓度梯度不仅是化学事实，也是电学资源。', ['ncbi-membrane-potentials', 'ncbi-resting-potential']),
        claimCard('Small swimmers live in a viscosity-dominated world.', '小尺度游动体生活在一个黏性主导的世界里。', 'At low Reynolds number, inertia fades and reversible strokes cannot produce net propulsion. Biological motion at that scale must exploit nonreciprocal cycles and constant energy input.', '在低雷诺数区域，惯性淡出，往复式动作也无法产生净推进。那个尺度上的生命运动必须依赖非往复循环和持续能量输入。', 'This is one of the clearest ways scale rewrites intuition between everyday mechanics and cellular biophysics.', '这是“尺度如何重写直觉”的最清楚例子之一：日常力学直觉在细胞尺度上会失灵。', ['purcell-low-re'])
      ]
    },
    nonlinear: {
      questions: [
        question('How can deterministic rules destroy long-range predictability?', '为什么完全确定的规则也会摧毁长期可预测性？', 'Nonlinear dynamics asks how feedback and coupling amplify tiny differences until forecasts lose practical value even though no randomness was added.', '非线性动力学追问的是：反馈与耦合如何把极小差异放大到足以让预报失去实际价值，即便系统里根本没有额外随机性。'),
        question('What survives once exact trajectories become useless?', '当精确轨迹变得没用之后，还剩下什么可以描述？', 'Even chaotic systems retain structure: attractors, invariant measures, short forecast horizons, and robust routes to instability. The field studies order inside apparent disorder.', '即便混沌系统也会保留结构：吸引子、不变测度、有限预测时窗，以及通向不稳定的稳健路径。这个领域研究的是“表面混乱内部的秩序”。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Lyapunov growth versus observation precision', 'Lyapunov 增长与观测精度的较量', 'A positive Lyapunov exponent turns finite measurement uncertainty into a growing forecast error. The practical horizon is set by that growth, not by whether the equations are exact.', '正的 Lyapunov 指数会把有限测量误差放大成不断扩张的预测误差。实际预测时窗是由这种放大决定的，而不是由方程是否“精确”决定的。'),
        scaleCard('Helpful approximation', '常用近似', 'Low-dimensional toy models reveal universal routes', '低维玩具模型能够暴露出普适路径', 'Maps and few-variable flows are often enough to show period doubling, strange attractors, and bounded chaos without the burden of a full real-world simulation.', '映射和少变量流动往往就足以展示倍周期、奇异吸引子和有界混沌，而无需背上完整真实系统模拟的负担。'),
        scaleCard('Where it fails', '何时失效', 'Toy chaos is not the whole weather, heart, or economy', '玩具混沌不是完整的天气、心脏或经济系统', 'A simple map can teach divergence and boundedness, but real systems bring noise, multiple scales, forcing, and model error on top of the nonlinear core.', '简单映射能教会人们发散与有界性，但真实系统还会在这个非线性核心之外叠加噪声、多尺度、外驱动和模型误差。')
      ],
      visual: {
        type: 'nonlinear',
        kind: 'model',
        repNote: t('A bifurcation diagram for the logistic map with the selected long-term orbit highlighted.', '在逻辑斯蒂映射分岔图上高亮当前参数对应的长期轨道。'),
        title: t('As one parameter changes, fixed points split and chaos appears.', '随着一个参数改变，固定点会分裂，混沌会浮现。'),
        lede: t('Move the control parameter across the bifurcation diagram. The highlighted points show the orbit reached after transients die away at that one parameter value.', '在分岔图上移动控制参数。高亮点显示的是：在该参数值下，暂态消失之后系统会落到什么长期轨道上。'),
        limitations: t('This is the logistic map, not a full atmospheric or biological model. It captures one canonical route to chaos while leaving out noise, forcing, and multiscale structure.', '这张图对应的是逻辑斯蒂映射，而不是完整的大气或生物模型。它抓住了通向混沌的一条经典路径，同时省略了噪声、外驱动和多尺度结构。'),
        reducedMotion: t('The structural argument is entirely visible in a still bifurcation diagram, so reduced-motion mode keeps all important information.', '关键结构在静止的分岔图中就已全部可见，因此减少动态不会丢掉重要信息。'),
        controls: [
          { type: 'range', key: 'r', min: 2.6, max: 3.95, step: 0.01, value: 3.2, label: t('Control parameter r', '控制参数 r'), formatter: value => value.toFixed(2) }
        ],
        sources: ['sep-chaos', 'ams-lorenz']
      },
      experiment: experimentCard('model', 'Sensitive dependence became visible once nearly identical starts produced visibly different futures.', '当几乎相同的起点走向明显不同的未来时，初值敏感性就变得可见了。', 'The conceptual experiment is to compare trajectories that begin almost indistinguishably. If their separation grows rapidly while remaining bounded overall, predictability is limited without randomness being added.', '这个观念上的实验，就是比较那些起点几乎无法区分的轨迹。如果它们的分离迅速增长、同时整体又保持有界，那么可预测性就会被限制，而无需额外引入随机性。', 'The demonstration is dynamical and structural, not a claim that all complicated motion is chaotic.', '这个演示强调的是动力学结构，而不是宣称一切复杂运动都是混沌。', ['sep-chaos', 'ams-lorenz']),
      mechanism: {
        title: t('How deterministic equations lose long-term predictive power', '确定性方程如何失去长期预测力'),
        steps: [
          step('Nonlinear feedback turns small differences into different future pushes', '非线性反馈会把极小差别变成不同的后续推动', 'If the next state depends nonlinearly on the current one, two nearby states need not remain nearby.', '如果下一状态对当前状态的依赖是非线性的，那么两个彼此接近的状态未必会持续接近。'),
          step('Those differences grow exponentially for a while', '这些差别会在一段时间里指数式增长', 'A positive Lyapunov exponent means the forecast uncertainty itself stretches as the system evolves.', '正的 Lyapunov 指数意味着预测不确定度本身会随着系统演化而被拉伸。'),
          step('The motion can still remain bounded and structured', '但运动仍可能保持有界且有结构', 'Chaos does not mean “everything flies apart forever.” The trajectory can remain trapped on a strange attractor with a repeatable overall shape.', '混沌并不意味着“一切永远散开”。轨迹仍可能被困在一个奇异吸引子上，保有可重复的整体形状。')
        ]
      },
      misconception: {
        title: t('Chaos is not the same thing as randomness.', '混沌并不等于随机。'),
        body: t('A chaotic system can be perfectly deterministic and still be practically unpredictable over long times. The missing ingredient is not lawfulness but arbitrarily precise knowledge of the initial state.', '混沌系统可以是完全确定的，却仍然在长时间尺度上实际不可预报。缺失的并不是规律，而是对初始状态进行任意精确测定的能力。')
      },
      frontier: {
        title: t('Forecast horizons depend on model fidelity as well as chaos.', '预测时窗既受混沌影响，也受模型忠实度影响。'),
        body: t('Real weather, climate, physiology, and engineered systems combine nonlinear sensitivity with imperfect models, sparse observations, and noise. The frontier is to quantify what part of forecast failure belongs to chaos itself and what part belongs to missing physics.', '真实的天气、气候、生理系统和工程系统，会把非线性敏感性与模型不完备、观测稀疏和噪声叠加在一起。前沿问题在于：究竟多大一部分预报失败属于混沌本身，又有多大一部分属于遗漏了物理。')
      },
      claims: [
        claimCard('Deterministic equations can still have a short prediction horizon.', '完全确定的方程仍然可能只有很短的预测时窗。', 'Once nearby trajectories separate exponentially, finite initial uncertainty gets magnified until long-range forecasts lose skill.', '一旦相邻轨迹指数式分离，有限的初始不确定度就会被不断放大，直到长期预报失去技能。', 'The limitation is practical predictability, not the absence of underlying rules.', '受到限制的是实践中的可预测性，而不是底层规律的存在。', ['sep-chaos']),
        claimCard('Chaos can remain bounded and patterned.', '混沌可以保持有界且具有图样。', 'A strange attractor shows that nonrepeating motion can still be confined to a repeatable region of state space with characteristic geometry.', '奇异吸引子说明：即便运动永不重复，它仍可能被限制在状态空间中一个可重复识别的区域里，并带有特征几何。', 'That is why chaotic dynamics still supports statistics, ensembles, and structural visualization instead of dissolving into meaninglessness.', '也正因此，混沌动力学仍然允许统计、系综和结构可视化，而不是完全滑向无意义。', ['ams-lorenz', 'sep-chaos'])
      ]
    },
    'standard-model': {
      questions: [
        question('How many matter fields and interaction fields are needed to account for what accelerators actually see?', '要解释加速器真正看到的东西，究竟需要多少种物质场和相互作用场？', 'The Standard Model asks for the smallest quantum-field-theoretic structure that still matches the measured particle spectrum and interaction patterns.', '标准模型追问的是：要与已测得的粒子谱和相互作用图样相符，最小的量子场论结构到底需要什么。'),
        question('Which successes are precise, and which absences are telling us it is incomplete?', '哪些成功已经精确到惊人，而哪些缺席又在提醒我们它并不完整？', 'The framework predicts and organizes a huge amount, but its missing gravity, dark sector, and neutrino-mass tensions matter precisely because the rest works so well.', '这个框架已经组织并预测了海量事实，但它缺失引力、暗部门以及与中微子质量相关的张力，之所以重要，恰恰因为其余部分运作得过于成功。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Field content plus symmetry structure', '场的内容加上对称性结构', 'The central objects are not little billiard balls but quantum fields constrained by gauge symmetry and the electroweak/Higgs structure.', '核心对象并不是小台球，而是在规范对称性与电弱—希格斯结构约束下的量子场。'),
        scaleCard('Helpful approximation', '常用近似', 'Organize by matter fields, gauge bosons, and the Higgs sector', '按物质场、规范玻色子和希格斯部分组织', 'A map of quarks, leptons, gauge carriers, and Higgs couplings is already enough to explain a large fraction of accelerator phenomena conceptually.', '只要把夸克、轻子、规范载体和希格斯耦合放进同一张图里，概念上就足以解释加速器中很大一部分现象。'),
        scaleCard('Where it fails', '何时失效', 'Gravity, dark matter, and neutrino mass are outside the simplest closure', '引力、暗物质和中微子质量都在最简单闭包之外', 'The Standard Model’s elegance does not make it final. Known observations already require at least some physics beyond its simplest original form.', '标准模型的优雅并不意味着它是终点。已知观测本身就已经要求我们在其最简单原始形式之外加入一些新物理。')
      ],
      visual: {
        type: 'standard-model',
        kind: 'schematic',
        repNote: t('A teaching map of gauge sectors and electroweak symmetry breaking.', '把规范扇区与电弱对称性破缺放在一起的教学图。'),
        title: t('The Higgs sector changes the low-energy bookkeeping without completing the whole theory.', '希格斯部分会改变低能账本，但并不会补完整套理论。'),
        lede: t('Switch between the symmetric and broken views to separate two claims: electroweak structure begins unified at high energy, while the low-energy world contains a massless photon and massive W/Z bosons.', '在对称相和破缺相之间切换，把两条主张分开看：高能下的电弱结构先以统一形式出现，而低能世界则包含无静质量的光子和带质量的 W/Z 玻色子。'),
        limitations: t('This is a field map, not a Lagrangian, Feynman-diagram set, or precision-fit summary. Gravity, flavor mixing details, and the dark sector are deliberately left out to make the conceptual structure legible.', '这是一张场的地图，而不是拉氏量、费曼图集合或精密拟合摘要。为了让概念结构清晰，引力、味混合细节和暗部门都被刻意留在图外。'),
        reducedMotion: t('The conceptual distinction is fully visible in a static toggle, so reduced-motion mode preserves the entire lesson.', '关键概念差异通过静态切换就已完整可见，因此减少动态不会损失任何教学信息。'),
        controls: [
          { type: 'toggle', key: 'phase', value: 'broken', label: t('Electroweak view', '电弱视图'), options: [{ value: 'broken', label: t('Broken phase', '破缺相') }, { value: 'symmetric', label: t('Symmetric phase', '对称相') }] }
        ],
        sources: ['cern-standard-model', 'cern-higgs', 'doe-standard-model', 'nobel-2015']
      },
      experiment: experimentCard('reconstruction', 'The Higgs boson became credible through decay channels reconstructed statistically, not as a free long-lived object.', '希格斯玻色子之所以可信，是通过对衰变道进行统计重建，而不是像长寿命自由粒子那样被直接抓住。', 'Signals such as two-photon and four-lepton channels had to rise above modeled backgrounds before the Higgs claim became persuasive. This is field content inferred through event populations.', '像双光子和四轻子这样的信号，必须先在背景模型之上显著抬升，希格斯主张才变得有说服力。这是通过事例总体推断场内容的典型例子。', 'The visual hallmark is a statistical excess in the right channels, not a literal image of the field itself.', '这里的视觉标记是“合适衰变道中的统计超额”，而不是某种对场本身的字面照片。', ['cern-higgs', 'cern-standard-model']),
      mechanism: {
        title: t('How the Standard Model turns symmetry into measured particle behavior', '标准模型如何把对称性翻译成可测的粒子行为'),
        steps: [
          step('Matter is described by quantum fields', '物质首先由量子场来描述', 'Electrons, quarks, neutrinos, and other fermions are treated as field excitations rather than tiny classical corpuscles.', '电子、夸克、中微子等费米子被看成场的激发，而不是微小经典小球。'),
          step('Gauge symmetry organizes the interaction carriers', '规范对称性组织起相互作用载体', 'Local symmetry requirements force the appearance of gauge bosons that mediate the strong, weak, and electromagnetic interactions.', '局域对称性要求会迫使强、弱和电磁相互作用的规范玻色子出现。'),
          step('The Higgs sector reshapes low-energy masses', '希格斯部分再改写低能下的质量结构', 'A nonzero Higgs field value changes how some fields propagate and couple, leaving the photon massless while the W and Z bosons become massive.', '非零的希格斯场真空值会改变某些场的传播与耦合方式，使光子保持无静质量，而 W 与 Z 玻色子则获得质量。')
        ]
      },
      misconception: {
        title: t('The Higgs field does not give all mass to everything.', '希格斯场并不是“给万物全部质量”的万能来源。'),
        body: t('Much of the mass of ordinary matter, such as that inside protons and neutrons, comes from strong-interaction energy rather than directly from bare Higgs couplings alone.', '普通物质中很大一部分质量，例如质子和中子内部的质量，来自强相互作用能量，而不只是直接来自裸露的希格斯耦合。')
      },
      frontier: {
        title: t('The theory is precise and still known to be incomplete.', '这套理论既极其精确，又已知并不完整。'),
        body: t('Gravity is missing, dark matter and dark energy are unexplained, and neutrino mass already points beyond the simplest original closure. The frontier is to learn which extension is actually realized in nature.', '引力被排除在外，暗物质和暗能量无法解释，而中微子质量本身就已经指向最简单原始闭包之外。前沿问题是：自然界究竟选择了哪一种扩展。')
      },
      claims: [
        claimCard('The Standard Model organizes three forces but not gravity.', '标准模型组织了三种相互作用，却不包含引力。', 'Its gauge structure covers the strong, weak, and electromagnetic interactions, while gravity remains outside the framework.', '它的规范结构覆盖了强、弱和电磁相互作用，而引力仍然在框架之外。', 'That omission is not a minor footnote; it is one of the main reasons the theory cannot be the final story.', '这并不是一个轻微脚注，而是说明它不可能成为终极理论的主要原因之一。', ['doe-standard-model', 'cern-standard-model']),
        claimCard('Neutrino oscillations show the simplest original closure was not the whole truth.', '中微子振荡表明最简单的原始闭包并不是全部真相。', 'Oscillation experiments imply that neutrinos have mass, so the most minimal original Standard Model setup cannot be the last word.', '振荡实验意味着中微子具有质量，因此最简原始标准模型不可能是最后答案。', 'This is a measured tension inside a very successful framework, not a philosophical complaint from the outside.', '这是一条来自观测内部的张力，而不是框架外部的哲学抱怨。', ['nobel-2015', 'doe-standard-model'])
      ]
    },
    'quantum-information': {
      questions: [
        question('What changes once information itself is stored in quantum states?', '一旦信息本身存储在量子态中，会改变什么？', 'Quantum information asks how computation, communication, and measurement change when the basic carrier can superpose, interfere, and entangle.', '量子信息学追问的是：当最基本载体能够叠加、干涉并纠缠时，计算、通信和测量会发生什么变化。'),
        question('Which advantages come from quantum structure, and which hopes are hype?', '哪些优势真正来自量子结构，而哪些只是炒作？', 'The field must constantly separate real resources such as entanglement, interference, and error correction from overclaims like universal speedup or faster-than-light messaging.', '这个领域必须不断把纠缠、干涉和纠错等真实资源，与“对所有问题都加速”或“超光速传信”之类的夸张口号分开。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Basis choice and coherence time', '测量基选择与相干时间', 'What a qubit can do depends on both the state you prepared and how long coherence survives before noise makes quantum distinctions unreadable.', '一个量子比特能做什么，取决于你准备了什么状态，也取决于在噪声把量子差别抹平之前，相干还能维持多久。'),
        scaleCard('Helpful approximation', '常用近似', 'Single-qubit geometry on the Bloch sphere', '用 Bloch 球处理单量子比特几何', 'A single qubit can often be understood geometrically as a point on a sphere, which makes basis dependence and measurement probabilities intuitive.', '单量子比特常常可以在几何上理解为球面上的一点，这使得基依赖与测量概率变得直观。'),
        scaleCard('Where it fails', '何时失效', 'Scaling requires many-body control and error correction', '真正扩展时需要多体控制与纠错', 'Single-qubit intuition does not by itself deliver useful machines. Hardware overhead, correlated noise, and fault tolerance dominate once you try to scale.', '单量子比特直觉本身并不能自动带来有用机器。一旦尝试扩展，硬件开销、相关噪声和容错问题就会立刻占据主导。')
      ],
      visual: {
        type: 'quantum-information',
        kind: 'model',
        repNote: t('A single-qubit Bloch-sphere representation with measurement probabilities.', '带有测量概率的单量子比特 Bloch 球表示。'),
        title: t('A qubit’s state depends on both amplitude and basis.', '量子比特的状态既依赖振幅，也依赖所选基底。'),
        lede: t('Rotate a single qubit on the Bloch sphere by changing polar angle and phase. The bars on the right show that the same state can look different depending on which basis you ask it in.', '改变极角与相位，让单量子比特在 Bloch 球上旋转。右侧柱形图提醒你：同一个状态会随着提问的基底不同，而呈现不同的统计答案。'),
        limitations: t('This picture describes one qubit only. Entanglement, Bell inequalities, no-cloning, and error correction all require moving into multi-qubit state space.', '这张图只描述一个量子比特。纠缠、Bell 不等式、不可克隆和纠错都需要进入多量子比特态空间。'),
        reducedMotion: t('A static sphere already contains the complete geometric argument, so reduced-motion mode preserves the full lesson.', '一个静态球面就已经包含完整的几何论证，因此减少动态不会损失任何教学信息。'),
        controls: [
          { type: 'range', key: 'theta', min: 0, max: 180, step: 2, value: 54, label: t('Polar angle θ', '极角 θ'), formatter: value => `${format(value, 0)}°` },
          { type: 'range', key: 'phi', min: 0, max: 360, step: 5, value: 45, label: t('Phase ϕ', '相位 ϕ'), formatter: value => `${format(value, 0)}°` }
        ],
        sources: ['doe-quantum-computing', 'nobel-2022', 'nature-no-cloning']
      },
      experiment: experimentCard('reconstruction', 'Bell-test experiments turned entanglement from paradox into a measurable information resource.', 'Bell 检验实验把纠缠从悖论变成了可测的信息资源。', 'By showing correlations stronger than any local hidden-variable account allows, Bell tests established entanglement as something operational rather than merely philosophical.', '通过展示强于任何局域隐变量解释所允许的关联，Bell 检验把纠缠确立成了可操作对象，而不只是哲学争论。', 'The result constrains correlation structure; it does not provide a superluminal signalling channel.', '这个结果约束的是关联结构，而不是提供超光速传信信道。', ['nobel-2022']),
      mechanism: {
        title: t('How quantum states become information resources', '量子态如何变成信息资源'),
        steps: [
          step('Superposition lets one state encode more than a classical either/or', '叠加让单个状态超出经典二选一', 'A qubit can occupy amplitudes for 0 and 1 at once, so preparation and interference become part of the computation.', '量子比特可以同时占据 0 和 1 的振幅，因此制备与干涉会直接成为计算的一部分。'),
          step('Measurement turns amplitudes into basis-dependent statistics', '测量会把振幅转成依赖基底的统计结果', 'What you read out depends on how you ask. The same state can yield certainty in one basis and uncertainty in another.', '你读出的结果取决于你怎么问。同一个状态在一个基底里可以给出确定答案，在另一个基底里却可能表现出不确定性。'),
          step('Entanglement and coding spread information nonlocally across hardware', '纠缠与编码会把信息跨硬件非局域地分布开来', 'That spreading both enables new protocols and makes protection against decoherence possible through quantum error correction.', '这种跨部件分布既使新协议成为可能，也让人们能通过量子纠错来对抗退相干。')
        ]
      },
      misconception: {
        title: t('Entanglement does not send usable messages faster than light.', '纠缠并不会把可用信息超光速送出去。'),
        body: t('Entangled measurement outcomes are correlated in a way classical theories cannot match, but each local result is still individually random until compared over an ordinary communication channel.', '纠缠测量结果的关联方式确实超出了经典理论，但每个局域结果在通过普通通信信道进行比对之前，仍然各自呈现为随机。')
      },
      frontier: {
        title: t('Useful scale depends on fault tolerance, not on one pretty qubit.', '真正有用的规模取决于容错，而不是某个漂亮的单比特。'),
        body: t('The frontier is to turn short-lived, noisy hardware into logical qubits that can survive long enough and accurately enough to outperform classical methods on chosen tasks.', '前沿任务是：把寿命短、噪声大的硬件单元，变成能活得足够久、算得足够准的逻辑量子比特，从而在特定任务上真正超越经典方法。')
      },
      claims: [
        claimCard('Quantum advantage is task-specific, not universal.', '量子优势是任务特定的，而不是放之四海而皆快。', 'Quantum computation can outperform classical methods on some structured problems, but it does not automatically accelerate ordinary computing across the board.', '量子计算确实可能在某些有结构的问题上优于经典方法，但它并不会自动给所有普通计算带来加速。', 'The difficulty is not only algorithmic; it is also whether the hardware can protect coherence long enough for the algorithm to matter.', '困难不仅在算法本身，也在于硬件能否把相干保护到足以让算法真正发挥作用。', ['doe-quantum-computing']),
        claimCard('Unknown quantum states cannot be copied perfectly.', '未知量子态无法被完美复制。', 'The no-cloning theorem forbids a universal machine that takes an arbitrary unknown state and outputs two perfect copies of it.', '不可克隆定理禁止存在一种通用机器，能够把任意未知量子态变成两份完美副本。', 'That limit is not merely a nuisance; it is part of why eavesdropping can become detectable and why quantum information behaves unlike classical data.', '这个限制不仅仅是麻烦，它也正是窃听可能被察觉、以及量子信息为何不同于经典数据的重要原因之一。', ['nature-no-cloning', 'doe-quantum-computing'])
      ]
    },
    'soft-matter': {
      questions: [
        question('How do weak interactions and thermal noise build large-scale structure?', '弱相互作用与热噪声如何搭起大尺度结构？', 'Soft matter asks why polymers, colloids, membranes, gels, and liquid crystals can self-organize even though their characteristic energies are only comparable to ordinary thermal agitation.', '软物质物理追问的是：为什么聚合物、胶体、膜、凝胶和液晶即便特征能量只与普通热扰动相当，仍能自发组织出结构。'),
        question('When is entropy a shaping mechanism rather than a nuisance?', '什么时候熵本身会成为塑形机制，而不是噪声背景？', 'In soft materials, entropy does not merely blur order; it can create effective elasticity, drive mixing or demixing, and stabilize whole phases.', '在软材料中，熵并不只是模糊秩序；它本身就能制造有效弹性、推动混合或相分离，并稳定整个物相。')
      ],
      scales: [
        scaleCard('Governing scale', '主导尺度', 'Interaction energies near k_B T', '相互作用能量与 k_B T 相当', 'Soft structures are easy to deform precisely because their energetic costs live near the thermal scale. Small temperature changes, concentration changes, or weak fields can therefore reorganize them dramatically.', '软结构之所以容易变形，正是因为它们的能量代价与热能处在同一量级。因此轻微的温度变化、浓度变化或弱场，就可能强烈重组它们。'),
        scaleCard('Helpful approximation', '常用近似', 'Coarse-grained components and effective forces', '用粗粒化组分与有效作用力来近似', 'Rather than track every atom, soft-matter models group many microscopic details into effective chains, droplets, rods, or self-propelled particles.', '软物质模型并不逐个追踪原子，而是把大量微观细节打包成有效链、液滴、杆状体或自驱粒子。'),
        scaleCard('Where it fails', '何时失效', 'Active matter is not equilibrium matter with louder noise', '活性物质不是“噪声更大的平衡态物质”', 'Once each unit continuously consumes energy, equilibrium thermodynamics stops being the whole language. Flocking, motility-induced clustering, and active stresses require genuinely nonequilibrium ideas.', '一旦每个单元都在持续消耗能量，平衡热力学就不再是全部语言。群聚、运动诱导聚集和活性应力都要求真正的非平衡思想。')
      ],
      visual: {
        type: 'soft-matter',
        kind: 'schematic',
        repNote: t('A switchable entropic-polymer and active-matter teaching sketch.', '可在熵弹性聚合物与活性物质之间切换的教学示意。'),
        title: t('Entropy can pull a polymer back—or organize many active particles forward.', '熵既能把聚合物拉回去，也能让活性粒子群体向前组织。'),
        lede: t('Switch between a stretched polymer and an active-particle flock. The first mode shows why fewer available conformations create an effective restoring force; the second shows how continual energy consumption can generate collective flow far from equilibrium.', '在被拉伸的聚合物和活性粒子群之间切换。前者展示“可用构型变少”如何制造有效回缩力；后者展示持续耗能如何在远离平衡处生成集体流动。'),
        limitations: t('Both modes are aggressively coarse-grained. They suppress chemistry, hydrodynamic coupling, and the detailed microscopic interactions responsible for real materials.', '这两个模式都经过了强烈粗粒化，刻意省略了化学、流体耦合以及真实材料中的详细微观相互作用。'),
        reducedMotion: t('The full concept is visible in static snapshots for both modes, so reduced-motion mode preserves the explanation.', '无论哪种模式，其核心概念都能在静态快照中完整呈现，因此减少动态不会损伤解释。'),
        controls: [
          { type: 'toggle', key: 'mode', value: 'polymer', label: t('Soft-matter mode', '软物质模式'), options: [{ value: 'polymer', label: t('Polymer', '聚合物') }, { value: 'active', label: t('Active matter', '活性物质') }] },
          { type: 'range', key: 'extension', min: 0.1, max: 1, step: 0.05, value: 0.55, label: t('Polymer extension', '聚合物伸长'), formatter: value => value.toFixed(2) },
          { type: 'range', key: 'activity', min: 0.2, max: 1.8, step: 0.05, value: 0.9, label: t('Active alignment', '活性对齐强度'), formatter: value => value.toFixed(2) }
        ],
        sources: ['nobel-1991', 'doe-nanoscience', 'rmp-active-matter', 'cell-condensates']
      },
      experiment: experimentCard('model', 'Soft-matter experiments keep showing that shape and phase can be controlled with very weak knobs.', '软物质实验一再表明：材料形状和相行为可以被很弱的旋钮控制。', 'Changing concentration, temperature, surface chemistry, or active forcing can reorganize colloids, polymers, droplets, and liquid-crystalline textures because their energy scales sit so near thermal motion.', '只需改变浓度、温度、表面化学或活性驱动，就能重组胶体、聚合物、液滴和液晶纹理，因为它们的能量尺度就贴着热运动本身。', 'The explanation is intentionally coarse-grained: it tracks effective ingredients rather than every microscopic bond.', '这里的解释被刻意粗粒化：它追踪的是有效组分，而不是每一根微观化学键。', ['nobel-1991', 'doe-nanoscience', 'cell-condensates']),
      mechanism: {
        title: t('How weak microscopic ingredients produce strong collective structure', '微弱的微观成分如何产出强烈的集体结构'),
        steps: [
          step('Thermal motion constantly explores many configurations', '热运动会不断探索大量构型', 'Soft components do not stay rigidly locked in one arrangement; they keep fluctuating among many accessible shapes and positions.', '软组分不会像刚体那样被锁死在单一排布里；它们会在许多可及形状与位置之间持续涨落。'),
          step('Weak interactions bias which configurations are common', '弱相互作用会偏置哪些构型更常见', 'Surface tension, depletion effects, liquid-crystal alignment, or chain connectivity can make some coarse-grained states statistically favored.', '表面张力、耗尽效应、液晶取向或链连接方式，都会让某些粗粒化状态在统计上更受偏好。'),
          step('Collective order emerges when the favored states reinforce each other', '当这些偏好彼此强化时，就会涌现集体有序', 'The result can be a membrane, a droplet, an entropic spring, a gel network, or—once energy is pumped in continuously—an active flow pattern.', '结果可能是一张膜、一个液滴、一根熵弹簧、一张凝胶网络，或者在持续输入能量时，变成活性流动图样。')
        ]
      },
      misconception: {
        title: t('“Entropy-driven” does not mean “mystically caused by chaos.”', '“熵驱动”并不意味着“被混乱神秘推动”。'),
        body: t('When soft-matter physicists say a response is entropy-driven, they mean the effective free-energy balance favors states with more accessible microscopic arrangements. It is a precise statistical statement, not a magical one.', '当软物质物理学家说某个响应“由熵驱动”时，指的是自由能平衡更偏好那些拥有更多可及微观排布的状态。这是一条精确的统计陈述，而不是神秘说法。')
      },
      frontier: {
        title: t('Active matter still lacks a universal thermodynamics.', '活性物质仍缺乏一套普适热力学。'),
        body: t('Systems whose constituents all inject work locally can phase separate, flow, jam, and swarm in ways that look familiar yet sit outside equilibrium free-energy logic. Building a general predictive language for them remains a major open frontier.', '那些每个组分都在局部注入功的系统，会以一种似曾相识却超出平衡自由能逻辑的方式发生相分离、流动、堵塞和群聚。为它们建立一套普适且可预测的语言，仍是重大开放前沿。')
      },
      claims: [
        claimCard('A stretched polymer can behave like a spring mainly because stretching removes accessible configurations.', '被拉伸的聚合物之所以像弹簧，主要是因为拉伸减少了可及构型。', 'The restoring tendency need not come from stiff microscopic bonds alone; it can arise statistically because many more coiled states exist than strongly stretched ones.', '回缩趋势并不一定主要来自微观键的刚性；它也可以统计性地出现，因为卷曲状态的数目远远多于高度拉伸状态。', 'That is why entropic elasticity is a central soft-matter idea rather than a semantic flourish.', '这正是为什么“熵弹性”是软物质中的核心概念，而不是一句修辞。', ['nobel-1991']),
        claimCard('Active matter is genuinely out of equilibrium.', '活性物质是真正的非平衡系统。', 'If each unit continuously consumes energy, then collective order and transport need not follow equilibrium free-energy rules even when the patterns look superficially familiar.', '如果每个单元都在持续消耗能量，那么即便图样看上去似曾相识，其集体有序和输运也不必遵守平衡自由能规则。', 'This is why flocking and motility-induced clustering cannot be treated as ordinary thermal ordering with slightly stronger noise.', '也正因此，群聚和运动诱导聚集不能被当成“只是噪声更大一些的普通热排序”。', ['rmp-active-matter'])
      ]
    },
  });

  function stripNestedFields(entry) {
    const cleaned = { ...entry };
    for (const fieldId of Object.keys(visualRenderers)) delete cleaned[fieldId];
    return cleaned;
  }

  const resolvedEnrichments = Object.freeze({
    'astronomy-optics': stripNestedFields(enrichments['astronomy-optics']),
    geophysics: stripNestedFields(enrichments['astronomy-optics'].geophysics),
    'quantum-theory': stripNestedFields(enrichments['astronomy-optics']['quantum-theory']),
    nuclear: stripNestedFields(enrichments['astronomy-optics'].nuclear),
    condensed: stripNestedFields(enrichments['astronomy-optics'].condensed),
    particle: stripNestedFields(enrichments['astronomy-optics'].particle),
    plasma: stripNestedFields(enrichments['astronomy-optics'].plasma),
    fluids: stripNestedFields(enrichments.fluids),
    acoustics: stripNestedFields(enrichments.acoustics),
    thermodynamics: stripNestedFields(enrichments.thermodynamics),
    electromagnetism: stripNestedFields(enrichments.electromagnetism),
    statistical: stripNestedFields(enrichments.statistical),
    biophysics: stripNestedFields(enrichments.biophysics),
    nonlinear: stripNestedFields(enrichments.nonlinear),
    'standard-model': stripNestedFields(enrichments['standard-model']),
    'quantum-information': stripNestedFields(enrichments['quantum-information']),
    'soft-matter': stripNestedFields(enrichments['soft-matter'])
  });

  function renderQuestionGrid(host, cards) {
    host.innerHTML = '';
    for (const card of cards) {
      const article = create('article', 'field-question-card');
      article.append(create('div', 'field-scale-label', pick(CARD_LABELS.question)));
      article.append(create('h3', null, pick(card.title)));
      article.append(create('p', null, pick(card.body)));
      host.append(article);
    }
  }

  function renderScaleGrid(host, cards) {
    host.innerHTML = '';
    for (const card of cards) {
      const article = create('article', 'field-scale-card');
      article.append(create('div', 'field-scale-label', pick(card.label)));
      article.append(create('h3', null, pick(card.title)));
      article.append(create('p', null, pick(card.body)));
      host.append(article);
    }
  }

  function renderExperiment(host, experiment) {
    host.innerHTML = '';
    host.append(create('div', 'field-evidence-label', pick(CARD_LABELS.experiment)));
    host.append(create('h3', null, pick(experiment.title)));
    host.append(create('p', null, pick(experiment.body)));
    const caption = create('div', 'field-visual-caption');
    const badge = create('span', `rep-badge ${experiment.kind}`, pick(VISUAL_LABELS[experiment.kind]));
    caption.append(badge);
    caption.append(create('span', 'field-visual-status', pick(experiment.note)));
    host.append(caption);
    if (experiment.sources?.length) host.append(sourceList(experiment.sources, 'claim-source-list'));
  }

  function renderMechanism(host, mechanism) {
    host.innerHTML = '';
    host.append(create('div', 'field-evidence-label', pick(CARD_LABELS.mechanism)));
    host.append(create('h3', null, pick(mechanism.title)));
    const list = create('ol', 'field-mechanism-list');
    mechanism.steps.forEach((step, index) => {
      const item = create('li');
      item.dataset.step = `${index + 1}.`;
      item.append(create('strong', null, pick(step.title)));
      item.append(create('p', null, pick(step.body)));
      list.append(item);
    });
    host.append(list);
  }

  function renderLimitGrid(host, def) {
    host.innerHTML = '';
    for (const [label, card] of [
      [CARD_LABELS.misconception, def.misconception],
      [CARD_LABELS.frontier, def.frontier]
    ]) {
      const article = create('article', 'field-limit-card');
      article.append(create('div', 'field-scale-label', pick(label)));
      article.append(create('h3', null, pick(card.title)));
      article.append(create('p', null, pick(card.body)));
      host.append(article);
    }
  }

  function renderClaimLedger(host, claims) {
    host.innerHTML = '';
    for (const claim of claims) {
      const article = create('article', 'claim-card');
      article.append(create('div', 'claim-label', pick(CARD_LABELS.claim)));
      article.append(create('h3', null, pick(claim.title)));
      const quote = document.createElement('blockquote');
      quote.textContent = pick(claim.claim);
      article.append(quote);
      article.append(create('p', null, pick(claim.body)));
      article.append(sourceList(claim.sources, 'claim-source-list'));
      host.append(article);
    }
  }

  function renderVisual(host, fieldId, field, visual) {
    host.innerHTML = '';
    const card = create('article', 'field-visual-card');
    card.style.setProperty('--topic', field.color);
    const copy = create('div', 'field-visual-copy');
    copy.append(create('div', 'field-visual-caption'));
    copy.firstChild.append(
      create('span', `rep-badge ${visual.kind}`, pick(VISUAL_LABELS[visual.kind])),
      create('span', 'field-visual-status', pick(visual.repNote))
    );
    copy.append(create('h3', 'field-visual-title', pick(visual.title)));
    copy.append(create('p', null, pick(visual.lede)));
    const layout = create('div', 'field-visual-layout');
    const stage = create('div', 'field-visual-stage');
    const controls = create('div', 'field-visual-controls');
    controls.append(create('h3', null, zh() ? '控制参数' : 'Controls'));
    const defaultState = Object.fromEntries((visual.controls || []).map(control => [control.key, control.value]));
    const state = Object.assign(defaultState, visualStateCache.get(fieldId));
    visualStateCache.set(fieldId, state);
    const render = () => {
      const renderer = visualRenderers[visual.type];
      if (!renderer) throw new Error(`Missing field visual renderer ${visual.type}`);
      const result = renderer(state);
      stage.innerHTML = result.svg;
      status.textContent = result.status;
    };
    for (const control of visual.controls || []) {
      controls.append((control.type === 'toggle' ? toggleControl : rangeControl)(control, state, render));
    }
    const note = create('p', 'field-visual-note', pick(visual.limitations));
    const reduced = create('p', 'field-visual-note', pick(visual.reducedMotion));
    const status = create('p', 'field-visual-note');
    layout.append(stage, controls);
    card.append(copy, layout, note, reduced, status);
    if (visual.sources?.length) {
      const sourceBlock = create('div', 'field-visual-sources');
      sourceBlock.append(create('h3', null, zh() ? '支撑这一图示的资料' : 'Sources behind this visual'));
      sourceBlock.append(sourceList(visual.sources, 'field-visual-sources'));
      card.append(sourceBlock);
    }
    host.append(card);
    render();
  }

  function renderFieldEnrichment({ fieldId, field }) {
    const def = resolvedEnrichments[fieldId];
    if (!def) return;
    renderQuestionGrid(document.getElementById('questionGrid'), def.questions);
    renderScaleGrid(document.getElementById('scaleGrid'), def.scales);
    renderVisual(document.getElementById('fieldVisualHost'), fieldId, field, def.visual);
    renderExperiment(document.getElementById('fieldExperiment'), def.experiment);
    renderMechanism(document.getElementById('fieldMechanism'), def.mechanism);
    renderLimitGrid(document.getElementById('fieldMythFrontier'), def);
    renderClaimLedger(document.getElementById('claimReferenceLedger'), def.claims);
  }

  globalThis.PhysicsFieldEnrichmentSources = sources;
  globalThis.PhysicsFieldEnrichments = resolvedEnrichments;
  globalThis.renderPhysicsFieldEnrichment = renderFieldEnrichment;
})();
