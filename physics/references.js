(() => {
  const references = Object.freeze({
    'astronomy-optics': [
      {
        title: 'Hubble optics',
        institution: 'NASA',
        url: 'https://science.nasa.gov/mission/hubble/observatory/design/optics/',
        en: 'How mirrors, aperture, and focusing turn incoming light into astronomical measurements.',
        zh: '说明反射镜、口径与聚焦如何把入射光转化为天文测量。'
      },
      {
        title: 'Wave behaviors',
        institution: 'NASA',
        url: 'https://science.nasa.gov/ems/03_behaviors/',
        en: 'Official guide to reflection, refraction, diffraction, and scattering.',
        zh: '反射、折射、衍射与散射的官方导览。'
      }
    ],
    fluids: [
      {
        title: "Bernoulli's equation",
        institution: 'NASA Glenn',
        url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation-1/',
        en: 'A derivation of the pressure-speed relation and the assumptions behind it.',
        zh: '推导压强—速度关系，并说明其成立条件。'
      },
      {
        title: 'What is lift?',
        institution: 'NASA Glenn',
        url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/what-is-lift/',
        en: 'Why a complete account of lift requires fluid turning and momentum, not one slogan.',
        zh: '解释完整的升力理论为何需要流体偏转与动量，而不是一句口号。'
      }
    ],
    acoustics: [
      {
        title: 'Sound in the ocean',
        institution: 'NOAA',
        url: 'https://oceanservice.noaa.gov/facts/sound.html',
        en: 'How sound propagates and refracts through a material medium.',
        zh: '说明声音如何在物质介质中传播与折射。'
      },
      {
        title: 'How do we hear?',
        institution: 'NIH / NIDCD',
        url: 'https://www.nidcd.nih.gov/health/how-do-we-hear',
        en: 'How pressure waves become traveling waves and then electrical signals.',
        zh: '说明压强波如何变成行波，再转化为电信号。'
      }
    ],
    thermodynamics: [
      {
        title: 'SI units: temperature',
        institution: 'NIST',
        url: 'https://www.nist.gov/pml/owm/si-units-temperature',
        en: 'The kelvin, thermodynamic temperature, and the meaning of absolute zero.',
        zh: '开尔文、热力学温度与绝对零度的含义。'
      },
      {
        title: 'Boltzmann constant',
        institution: 'NIST',
        url: 'https://physics.nist.gov/cgi-bin/cuu/Value?k',
        en: 'The standard constant linking microscopic energy scales to temperature and entropy.',
        zh: '连接微观能量尺度、温度与熵的标准常数。'
      }
    ],
    electromagnetism: [
      {
        title: 'The electromagnetic force',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsthe-electromagnetic-force',
        en: 'Electric charge, fields, moving charges, magnetism, and induction.',
        zh: '介绍电荷、场、运动电荷、磁性与电磁感应。'
      },
      {
        title: 'The electromagnetic spectrum',
        institution: 'NASA',
        url: 'https://science.nasa.gov/ems/01_intro/',
        en: 'How electromagnetic fields propagate across the full spectrum.',
        zh: '说明电磁场如何在完整电磁谱中传播。'
      }
    ],
    statistical: [
      {
        title: 'Boltzmann constant and entropy',
        institution: 'NIST',
        url: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-2',
        en: 'The SI account of the Boltzmann constant and microscopic state counting.',
        zh: '国际单位制对玻尔兹曼常数与微观状态计数的说明。'
      },
      {
        title: 'Statistical mechanics',
        institution: 'Stanford Encyclopedia of Philosophy',
        url: 'https://plato.stanford.edu/entries/statphys-statmech/',
        en: 'A scholarly account of equilibrium, irreversibility, and the bridge between scales.',
        zh: '关于平衡、不可逆性与跨尺度联系的学术综述。'
      }
    ],
    geophysics: [
      {
        title: 'Tectonic shift',
        institution: 'NOAA',
        url: 'https://oceanservice.noaa.gov/facts/tectonics.html',
        en: "How moving plates continually reshape Earth's crust.",
        zh: '说明运动的板块如何持续重塑地壳。'
      },
      {
        title: 'InSight science',
        institution: 'NASA',
        url: 'https://science.nasa.gov/mission/insight/science/',
        en: 'How seismic signals reconstruct the inaccessible interiors of rocky planets.',
        zh: '说明地震信号如何重建无法直接抵达的岩石行星内部。'
      }
    ],
    'quantum-theory': [
      {
        title: 'The 1918 Nobel Prize in Physics',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/1918/summary/',
        en: "Planck's discovery of energy quanta.",
        zh: '普朗克发现能量量子的官方资料。'
      },
      {
        title: 'The 1921 Nobel Prize in Physics',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/1921/summary/',
        en: "Einstein's law of the photoelectric effect.",
        zh: '爱因斯坦光电效应定律的官方资料。'
      }
    ],
    nuclear: [
      {
        title: 'Nuclei',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsnuclei',
        en: 'Nuclear binding, stability, and what holds a nucleus together.',
        zh: '介绍原子核结合、稳定性及维系原子核的作用。'
      },
      {
        title: 'Fusion reactions',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsfusion-reactions',
        en: 'How fusion converts mass differences into stellar energy.',
        zh: '说明聚变如何把质量差转化为恒星能量。'
      }
    ],
    condensed: [
      {
        title: 'Superconductivity',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainssuperconductivity',
        en: 'Zero resistance, paired electrons, and macroscopic quantum behavior.',
        zh: '介绍零电阻、电子配对与宏观量子行为。'
      },
      {
        title: 'Topological phase transitions',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/2016/press-release/',
        en: 'Why some phases and transitions require topology rather than a simple local order parameter.',
        zh: '说明某些相与相变为何需要拓扑，而不能只用局域序参量描述。'
      }
    ],
    particle: [
      {
        title: 'Antimatter',
        institution: 'CERN',
        url: 'https://home.cern/science/physics/antimatter/',
        en: 'Antiparticles, the positron, and how antimatter is studied.',
        zh: '介绍反粒子、正电子及反物质研究方法。'
      },
      {
        title: 'Particle accelerators',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsparticle-accelerators',
        en: 'How controlled collisions reveal short-lived particles and interactions.',
        zh: '说明受控碰撞如何揭示短寿命粒子与相互作用。'
      }
    ],
    plasma: [
      {
        title: 'Plasma',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsplasma',
        en: 'Ionized matter, collective behavior, and plasma across the universe.',
        zh: '介绍电离物质、集体行为与宇宙中的等离子体。'
      },
      {
        title: 'Plasma confinement',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsplasma-confinement',
        en: 'How magnetic and inertial confinement hold fusion plasmas.',
        zh: '说明磁约束与惯性约束如何限制聚变等离子体。'
      }
    ],
    biophysics: [
      {
        title: 'DNA fact sheet',
        institution: 'NIH / NHGRI',
        url: 'https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet',
        en: 'DNA structure, base pairing, replication, and molecular information.',
        zh: '介绍 DNA 结构、碱基配对、复制与分子信息。'
      },
      {
        title: 'Biomolecular condensates',
        institution: 'PubMed / Cell',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25288112/',
        en: 'A peer-reviewed foundation for liquid-like compartments formed by phase separation.',
        zh: '关于相分离形成液态细胞区室的同行评审基础文献。'
      }
    ],
    nonlinear: [
      {
        title: 'Chaos',
        institution: 'Stanford Encyclopedia of Philosophy',
        url: 'https://plato.stanford.edu/entries/chaos/',
        en: 'Deterministic chaos, sensitive dependence, and predictability.',
        zh: '介绍确定性混沌、初值敏感性与可预测性。'
      },
      {
        title: 'Lorenz and modular flows',
        institution: 'American Mathematical Society',
        url: 'https://www.ams.org/publicoutreach/feature-column/fcarc-lorenz',
        en: "A visual mathematical introduction to Lorenz's strange attractor.",
        zh: '洛伦兹奇异吸引子的可视化数学导览。'
      }
    ],
    'standard-model': [
      {
        title: 'The Standard Model',
        institution: 'CERN',
        url: 'https://home.cern/science/physics/standard-model/',
        en: 'The particles, interactions, and limits of the Standard Model.',
        zh: '介绍标准模型中的粒子、相互作用及其边界。'
      },
      {
        title: 'The Higgs boson',
        institution: 'CERN',
        url: 'https://home.cern/science/physics/higgs-boson/',
        en: 'The Higgs field, symmetry breaking, and particle masses.',
        zh: '介绍希格斯场、对称性破缺与粒子质量。'
      }
    ],
    'quantum-information': [
      {
        title: 'Quantum computing',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsquantum-computing',
        en: 'Qubits, superposition, entanglement, and quantum computation.',
        zh: '介绍量子比特、叠加、纠缠与量子计算。'
      },
      {
        title: 'The 2022 Nobel Prize in Physics',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/2022/popular-information/',
        en: 'Bell tests, entanglement, and quantum information science.',
        zh: '介绍贝尔检验、量子纠缠与量子信息科学。'
      }
    ],
    'soft-matter': [
      {
        title: 'The 1991 Nobel Prize in Physics',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/1991/summary/',
        en: "de Gennes's work on liquid crystals and polymers.",
        zh: '德热纳关于液晶与聚合物研究的官方资料。'
      },
      {
        title: 'Nanoscience',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsnanoscience',
        en: 'How structure and scale produce collective material properties.',
        zh: '说明结构与尺度如何产生材料的集体性质。'
      }
    ],
    newtonian: [
      {
        title: 'Trajectories and orbits',
        institution: 'NASA',
        url: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/',
        en: 'An official primer on trajectories, escape, and transfer orbits.',
        zh: '关于轨迹、逃逸与转移轨道的官方导览。'
      },
      {
        title: "Newton's Principia",
        institution: 'Stanford Encyclopedia of Philosophy',
        url: 'https://plato.stanford.edu/entries/newton-principia/',
        en: "A scholarly guide to Newton's laws and universal gravitation.",
        zh: '牛顿运动定律与万有引力的学术导览。'
      }
    ],
    relativity: [
      {
        title: 'Special relativity',
        institution: 'Einstein Online / Max Planck Institute',
        url: 'https://www.einstein-online.info/en/category/elementary/special-relativity-elementary/',
        en: 'Inertial frames, invariant light speed, and spacetime measurements.',
        zh: '介绍惯性系、光速不变与时空测量。'
      },
      {
        title: 'General relativity',
        institution: 'Einstein Online / Max Planck Institute',
        url: 'https://www.einstein-online.info/en/category/elementary/general-relativity-elementary/',
        en: 'Curved spacetime, gravity, black holes, and cosmology.',
        zh: '介绍弯曲时空、引力、黑洞与宇宙学。'
      },
      {
        title: 'What are gravitational waves?',
        institution: 'LIGO',
        url: 'https://www.ligo.caltech.edu/page/what-are-gw',
        en: 'How a major prediction of general relativity is measured.',
        zh: '说明如何测量广义相对论的一项重要预言。'
      }
    ],
    quantum: [
      {
        title: 'Quantum mechanics',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsquantum-mechanics',
        en: 'Wavefunctions, quantization, superposition, and the quantum-classical boundary.',
        zh: '介绍波函数、量子化、叠加与量子—经典边界。'
      },
      {
        title: 'Electrons',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainselectrons',
        en: 'Electron clouds and why atomic electrons are not tiny orbiting planets.',
        zh: '介绍电子云，以及原子电子为何不是绕核运行的小行星。'
      }
    ],
    light: [
      {
        title: 'The electromagnetic force',
        institution: 'U.S. Department of Energy',
        url: 'https://www.energy.gov/science/doe-explainsthe-electromagnetic-force',
        en: 'Electric and magnetic fields and the physical basis of electromagnetic waves.',
        zh: '介绍电磁场与电磁波的物理基础。'
      },
      {
        title: 'The IceCube detector',
        institution: 'IceCube Neutrino Observatory',
        url: 'https://icecube.wisc.edu/science/icecube/',
        en: 'How Cherenkov light in ice reconstructs charged-particle tracks.',
        zh: '说明如何利用冰中的切伦科夫光重建带电粒子径迹。'
      }
    ],
    astrophysics: [
      {
        title: 'Black holes',
        institution: 'NASA',
        url: 'https://science.nasa.gov/universe/black-holes/',
        en: 'Event horizons, accretion, observations, and common misconceptions.',
        zh: '介绍事件视界、吸积、观测证据与常见误解。'
      },
      {
        title: 'Black-hole types',
        institution: 'NASA',
        url: 'https://science.nasa.gov/universe/black-holes/types/',
        en: 'Observed mass classes and the hypothetical primordial category.',
        zh: '介绍已观测到的质量类别与假设性的原初黑洞。'
      },
      {
        title: 'The 2020 Nobel Prize in Physics',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/2020/press-release/',
        en: 'Black-hole formation in relativity and evidence for the Galactic-center compact object.',
        zh: '介绍相对论中的黑洞形成及银河系中心致密天体的证据。'
      }
    ],
    'phase-transitions': [
      {
        title: 'Topological phase transitions',
        institution: 'Nobel Prize Outreach',
        url: 'https://www.nobelprize.org/prizes/physics/2016/press-release/',
        en: 'The official account of topological phases and BKT transitions.',
        zh: '拓扑相与 BKT 相变的官方资料。'
      },
      {
        title: 'Water critical point',
        institution: 'NIST',
        url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Type=TC',
        en: 'Reference data for the liquid-gas critical temperature of water.',
        zh: '水的液—气临界温度标准数据。'
      },
      {
        title: 'Electroweak crossover',
        institution: 'CERN / peer-reviewed lattice study',
        url: 'https://arxiv.org/abs/1508.07161',
        en: 'Why the measured Standard Model predicts a crossover near 159 GeV, not a first-order transition.',
        zh: '说明实测标准模型为何在约 159 GeV 发生连续过渡，而不是一级相变。'
      }
    ],
    'entropy-information': [
      {
        title: 'The Boltzmann constant and entropy',
        institution: 'NIST',
        url: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-2',
        en: 'The official SI connection among entropy, microscopic states, and the Boltzmann constant.',
        zh: '国际单位制中熵、微观状态与玻尔兹曼常数的联系。'
      },
      {
        title: 'A mathematical theory of communication',
        institution: 'Bell System Technical Journal',
        url: 'https://doi.org/10.1002/j.1538-7305.1948.tb01338.x',
        en: "Shannon's foundational paper on entropy, coding, and noisy channels.",
        zh: '香农关于熵、编码与有噪信道的奠基论文。'
      },
      {
        title: 'Black holes and thermodynamics',
        institution: 'Robert Wald / Living Reviews',
        url: 'https://arxiv.org/abs/gr-qc/9912119',
        en: 'A scholarly review of black-hole entropy, temperature, and the generalized second law.',
        zh: '关于黑洞熵、温度与广义第二定律的学术综述。'
      }
    ]
  });

  function render(key, host = document.querySelector('[data-reference-key]')) {
    if (!host) return;
    const entries = references[key || host.dataset.referenceKey];
    if (!entries) throw new Error(`Missing official references for ${key || host.dataset.referenceKey}`);
    const chinese = PhysicsUI.language === 'zh-CN';
    host.innerHTML = '';
    for (const reference of entries) {
      const article = document.createElement('article');
      article.className = 'reference-entry';
      const link = document.createElement('a');
      link.href = reference.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const institution = document.createElement('span');
      institution.className = 'reference-institution';
      institution.textContent = reference.institution;
      const title = document.createElement('strong');
      title.textContent = reference.title;
      const description = document.createElement('span');
      description.className = 'reference-description';
      description.textContent = chinese ? reference.zh : reference.en;
      link.append(institution, title, description);
      article.append(link);
      host.append(article);
    }
  }

  document.addEventListener('physics-language', () => {
    const host = document.querySelector('[data-reference-key]');
    if (host) render(host.dataset.referenceKey, host);
  });

  const host = document.querySelector('[data-reference-key]');
  if (host) render(host.dataset.referenceKey, host);

  globalThis.PhysicsReferences = references;
  globalThis.renderPhysicsReferences = render;
})();
