(() => {
  const fields = [
    {
      id: 'astronomy-optics',
      year: 1609,
      y: 4,
      x: 20,
      lineage: 'cosmos',
      color: '#00d4ff',
      signature: 'rays',
      parents: [],
      en: {
        name: 'Observational optics & astronomy',
        short: 'Telescopes turn light into evidence about distant worlds.',
        detail: 'Geometric optics explains image formation; careful telescopic observation joins measurement to astronomy and helps replace inherited cosmologies with testable models.',
        shift: 'A lens became an instrument for making claims about nature.',
        people: 'Galileo Galilei, Johannes Kepler, Christiaan Huygens'
      },
      zh: {
        name: '观测光学与天文学',
        short: '望远镜把光转化为遥远世界的证据。',
        detail: '几何光学解释成像；严谨的望远镜观测把测量引入天文学，使传统宇宙观逐渐被可检验的模型取代。',
        shift: '透镜从器物变成了检验自然主张的仪器。',
        people: '伽利略、开普勒、惠更斯'
      }
    },
    {
      id: 'mechanics',
      year: 1687,
      y: 9,
      x: 50,
      lineage: 'motion',
      color: '#ffd166',
      signature: 'orbit',
      parents: ['astronomy-optics'],
      page: './newtonian.html',
      en: {
        name: 'Newtonian mechanics',
        short: 'One mathematical language links falling bodies, projectiles, and planets.',
        detail: 'Newtonian mechanics relates forces to changes in momentum. Together with universal gravitation, it predicts terrestrial motion and much of the Solar System whenever speeds are far below light speed and quantum effects are negligible.',
        shift: 'The same laws could govern Earth and the heavens.',
        people: 'Isaac Newton, Galileo Galilei, Johannes Kepler'
      },
      zh: {
        name: '牛顿力学',
        short: '同一种数学语言连接落体、抛射与行星。',
        detail: '牛顿力学用力描述动量的变化；再加上万有引力，它能在速度远低于光速、量子效应可忽略时预测地面运动和大部分太阳系运动。',
        shift: '地面与天体可以服从同一套定律。',
        people: '牛顿、伽利略、开普勒'
      }
    },
    {
      id: 'fluids',
      year: 1738,
      y: 14,
      x: 76,
      lineage: 'matter',
      color: '#7ee8c5',
      signature: 'fluid',
      parents: ['mechanics'],
      en: {
        name: 'Fluid mechanics',
        short: 'Pressure, flow, viscosity, and vortices make continua move.',
        detail: 'Fluid mechanics treats liquids and gases as continuous media. Conservation of mass, momentum, and energy predicts pipes, wings, weather, oceans, and many biological flows, while turbulence remains a major open challenge.',
        shift: 'Motion became a field distributed through space, not only a point mass.',
        people: 'Daniel Bernoulli, Leonhard Euler, Claude-Louis Navier, George Stokes'
      },
      zh: {
        name: '流体力学',
        short: '压强、流动、黏性与涡旋让连续介质运动。',
        detail: '流体力学把液体和气体视为连续介质。质量、动量与能量守恒可预测管流、机翼、天气、海洋和许多生物流动；湍流仍是重要难题。',
        shift: '运动从质点推广为分布在空间中的场。',
        people: '伯努利、欧拉、纳维、斯托克斯'
      }
    },
    {
      id: 'acoustics',
      year: 1787,
      y: 19,
      x: 30,
      lineage: 'fields',
      color: '#00d4ff',
      signature: 'wave',
      parents: ['mechanics', 'fluids'],
      en: {
        name: 'Acoustics',
        short: 'Sound becomes pressure waves, modes, resonance, and information.',
        detail: 'Acoustics studies mechanical waves in gases, liquids, and solids. Frequency, wavelength, interference, resonance, and boundary conditions explain instruments, speech, sonar, ultrasound, and noise control.',
        shift: 'Audible pitch and timbre became measurable wave structure.',
        people: 'Ernst Chladni, Hermann von Helmholtz, Lord Rayleigh'
      },
      zh: {
        name: '声学',
        short: '声音成为压强波、简正模、共振与信息。',
        detail: '声学研究气体、液体和固体中的机械波。频率、波长、干涉、共振与边界条件解释乐器、语音、声呐、超声和噪声控制。',
        shift: '可听的音高与音色成为可测量的波结构。',
        people: '克拉德尼、亥姆霍兹、瑞利'
      }
    },
    {
      id: 'thermodynamics',
      year: 1824,
      y: 24,
      x: 64,
      lineage: 'matter',
      color: '#ffd166',
      signature: 'heat',
      parents: ['mechanics', 'fluids'],
      en: {
        name: 'Thermodynamics',
        short: 'Heat, work, energy, and entropy constrain every engine.',
        detail: 'Thermodynamics describes macroscopic state changes without tracking every molecule. Its laws define energy conservation, entropy increase, absolute-zero limits, and the maximum efficiency of engines and refrigerators.',
        shift: 'Irreversibility entered fundamental physical law.',
        people: 'Sadi Carnot, Rudolf Clausius, William Thomson'
      },
      zh: {
        name: '热力学',
        short: '热、功、能量与熵约束每一台热机。',
        detail: '热力学无需追踪每个分子就能描述宏观状态变化。它的定律给出能量守恒、熵增、绝对零度限制以及热机与制冷机的最高效率。',
        shift: '不可逆性进入了基本物理定律。',
        people: '卡诺、克劳修斯、开尔文'
      }
    },
    {
      id: 'electromagnetism',
      year: 1831,
      y: 29,
      x: 18,
      lineage: 'fields',
      color: '#ff6b9d',
      signature: 'field',
      parents: ['mechanics'],
      en: {
        name: 'Electromagnetism',
        short: 'Charges and currents create fields that act across space.',
        detail: 'Experiments reveal electric and magnetic induction, forces, and field structure. Faraday’s field concept shifts the explanation from instantaneous action at a distance to physical quantities defined throughout space.',
        shift: 'Empty space acquired measurable field structure.',
        people: 'Michael Faraday, André-Marie Ampère, Hans Christian Ørsted'
      },
      zh: {
        name: '电磁学',
        short: '电荷与电流产生遍布空间的场。',
        detail: '实验揭示电磁感应、力与场的结构。法拉第的场概念把解释从瞬时超距作用转向定义在空间各处的物理量。',
        shift: '“空”空间获得了可测量的场结构。',
        people: '法拉第、安培、奥斯特'
      }
    },
    {
      id: 'electrodynamics',
      year: 1865,
      y: 35,
      x: 43,
      lineage: 'fields',
      color: '#ff6b9d',
      signature: 'wave',
      parents: ['electromagnetism', 'acoustics'],
      en: {
        name: 'Classical electrodynamics',
        short: 'Maxwell’s equations unite electricity, magnetism, and light.',
        detail: 'Classical electrodynamics describes how charges and currents generate electromagnetic fields and how those fields propagate. Maxwell’s synthesis predicts electromagnetic waves traveling at the measured speed of light.',
        shift: 'Light was identified as an electromagnetic wave.',
        people: 'James Clerk Maxwell, Michael Faraday, Heinrich Hertz'
      },
      zh: {
        name: '经典电动力学',
        short: '麦克斯韦方程统一电、磁与光。',
        detail: '经典电动力学描述电荷和电流如何产生电磁场，以及场如何传播。麦克斯韦的综合理论预言电磁波以测得的光速传播。',
        shift: '光被确认为电磁波。',
        people: '麦克斯韦、法拉第、赫兹'
      }
    },
    {
      id: 'statistical',
      year: 1872,
      y: 40,
      x: 75,
      lineage: 'matter',
      color: '#ffd166',
      signature: 'probability',
      parents: ['thermodynamics', 'mechanics'],
      en: {
        name: 'Statistical mechanics',
        short: 'Probability connects microscopic motion to temperature and entropy.',
        detail: 'Statistical mechanics derives macroscopic behavior from ensembles of microscopic states. Temperature measures energy distribution; entropy counts compatible microstates, explaining why irreversible behavior emerges from reversible dynamics.',
        shift: 'Probability became a bridge between scales.',
        people: 'Ludwig Boltzmann, James Clerk Maxwell, J. Willard Gibbs'
      },
      zh: {
        name: '统计力学',
        short: '概率把微观运动连接到温度与熵。',
        detail: '统计力学从微观状态系综推导宏观行为。温度反映能量分布，熵衡量相容的微观状态数，从而解释不可逆行为如何从可逆动力学中涌现。',
        shift: '概率成为跨越尺度的桥梁。',
        people: '玻尔兹曼、麦克斯韦、吉布斯'
      }
    },
    {
      id: 'geophysics',
      year: 1880,
      y: 45,
      x: 26,
      lineage: 'cosmos',
      color: '#00d4ff',
      signature: 'layers',
      parents: ['fluids', 'thermodynamics', 'electromagnetism'],
      en: {
        name: 'Geophysics',
        short: 'Seismic waves, gravity, heat, and magnetism reveal Earth’s interior.',
        detail: 'Geophysics applies mechanics, wave physics, thermodynamics, and electromagnetism to Earth. Indirect measurements reconstruct structures and processes that cannot be reached directly.',
        shift: 'A planet became a measurable physical system.',
        people: 'Emil Wiechert, Inge Lehmann, Andrija Mohorovičić'
      },
      zh: {
        name: '地球物理学',
        short: '地震波、重力、热与磁性揭示地球内部。',
        detail: '地球物理学把力学、波动、热力学与电磁学用于地球。间接测量重建无法直接抵达的内部结构与过程。',
        shift: '行星成为可测量的物理系统。',
        people: '维歇特、莱曼、莫霍洛维奇'
      }
    },
    {
      id: 'quantum-theory',
      year: 1900,
      y: 50,
      x: 56,
      lineage: 'quantum',
      color: '#7c5cff',
      signature: 'quanta',
      parents: ['thermodynamics', 'electrodynamics', 'statistical'],
      en: {
        name: 'Quantum theory begins',
        short: 'Energy exchange arrives in discrete quanta.',
        detail: 'Planck’s successful model of black-body radiation introduces energy elements proportional to frequency. It begins a conceptual break with classical continuity, although a complete quantum mechanics still lies ahead.',
        shift: 'Energy transfer could be quantized.',
        people: 'Max Planck, Albert Einstein'
      },
      zh: {
        name: '量子理论的开端',
        short: '能量交换以离散量子出现。',
        detail: '普朗克对黑体辐射的成功模型引入与频率成正比的能量元，开始打破经典连续性；完整的量子力学尚未形成。',
        shift: '能量传递可以量子化。',
        people: '普朗克、爱因斯坦'
      }
    },
    {
      id: 'relativity',
      year: 1905,
      y: 55,
      x: 82,
      lineage: 'cosmos',
      color: '#00d4ff',
      signature: 'spacetime',
      parents: ['mechanics', 'electrodynamics'],
      page: './relativity.html',
      en: {
        name: 'Relativity',
        short: 'Space and time become one geometry shaped by motion and gravity.',
        detail: 'Special relativity makes light speed invariant and replaces absolute time with spacetime. General relativity models gravity as spacetime curvature, predicting light bending, gravitational waves, black holes, and cosmic expansion.',
        shift: 'Space, time, energy, and gravity were reorganized together.',
        people: 'Albert Einstein, Hermann Minkowski, Emmy Noether'
      },
      zh: {
        name: '相对论',
        short: '空间与时间成为受运动和引力塑造的统一几何。',
        detail: '狭义相对论令光速不变，以时空取代绝对时间；广义相对论把引力描述为时空曲率，预言光线偏折、引力波、黑洞与宇宙膨胀。',
        shift: '空间、时间、能量和引力被一并重组。',
        people: '爱因斯坦、闵可夫斯基、诺特'
      }
    },
    {
      id: 'nuclear',
      year: 1911,
      y: 60,
      x: 18,
      lineage: 'quantum',
      color: '#ffd166',
      signature: 'nucleus',
      parents: ['quantum-theory', 'electromagnetism'],
      en: {
        name: 'Nuclear physics',
        short: 'Scattering reveals a tiny nucleus and new sources of energy.',
        detail: 'Nuclear physics studies atomic nuclei, radioactivity, reactions, fission, and fusion. Scattering experiments infer internal structure from deflections rather than photographing a nucleus directly.',
        shift: 'The atom was shown to contain a compact, energetic core.',
        people: 'Ernest Rutherford, Marie Curie, Lise Meitner'
      },
      zh: {
        name: '核物理',
        short: '散射揭示微小原子核与新的能量来源。',
        detail: '核物理研究原子核、放射性、核反应、裂变与聚变。散射实验通过偏转间接推断内部结构，而不是直接拍摄原子核。',
        shift: '原子被证明包含致密且高能的核心。',
        people: '卢瑟福、居里夫人、迈特纳'
      }
    },
    {
      id: 'quantum-mechanics',
      year: 1925,
      y: 65,
      x: 47,
      lineage: 'quantum',
      color: '#7c5cff',
      signature: 'interference',
      parents: ['quantum-theory', 'electrodynamics'],
      page: './quantum.html',
      en: {
        name: 'Quantum mechanics',
        short: 'Amplitudes, operators, and measurement replace classical trajectories.',
        detail: 'Quantum mechanics predicts probabilities from complex amplitudes. States can superpose and interfere; observables are represented by operators; measurement outcomes are probabilistic even when state evolution is deterministic.',
        shift: 'Physical prediction no longer required a definite hidden trajectory.',
        people: 'Werner Heisenberg, Erwin Schrödinger, Max Born, Niels Bohr'
      },
      zh: {
        name: '量子力学',
        short: '振幅、算符与测量取代经典轨迹。',
        detail: '量子力学从复振幅预测概率。状态可以叠加与干涉；可观测量由算符表示；即使状态演化是确定的，测量结果也具有概率性。',
        shift: '物理预测不再要求存在一条确定的隐藏轨迹。',
        people: '海森堡、薛定谔、玻恩、玻尔'
      }
    },
    {
      id: 'condensed',
      year: 1928,
      y: 70,
      x: 76,
      lineage: 'matter',
      color: '#7ee8c5',
      signature: 'lattice',
      parents: ['quantum-mechanics', 'statistical'],
      en: {
        name: 'Condensed-matter physics',
        short: 'Collective quantum behavior gives matter new phases and properties.',
        detail: 'Condensed-matter physics studies solids, liquids, superconductors, magnets, semiconductors, and emergent phases. Interacting particles can organize into effective excitations and laws not obvious from their constituents.',
        shift: '“More is different”: collective behavior became fundamental.',
        people: 'Felix Bloch, Lev Landau, John Bardeen'
      },
      zh: {
        name: '凝聚态物理',
        short: '集体量子行为赋予物质新的相与性质。',
        detail: '凝聚态物理研究固体、液体、超导体、磁体、半导体与涌现相。相互作用的粒子会组织成由组分本身难以直接看出的准粒子与有效规律。',
        shift: '“多则异”：集体行为成为基本研究对象。',
        people: '布洛赫、朗道、巴丁'
      }
    },
    {
      id: 'particle',
      year: 1932,
      y: 75,
      x: 24,
      lineage: 'quantum',
      color: '#ff6b9d',
      signature: 'tracks',
      parents: ['nuclear', 'quantum-mechanics', 'relativity'],
      en: {
        name: 'Particle physics',
        short: 'Tracks and decays expose elementary excitations and interactions.',
        detail: 'Particle physics studies the smallest known excitations of quantum fields and their interactions. Detectors reconstruct particles from tracks, energy deposits, decay products, and missing momentum.',
        shift: 'Matter’s “parts” became transient excitations identified by interactions.',
        people: 'Paul Dirac, Carl Anderson, Chien-Shiung Wu'
      },
      zh: {
        name: '粒子物理',
        short: '径迹与衰变揭示基本激发及其相互作用。',
        detail: '粒子物理研究量子场中最小的已知激发及其相互作用。探测器从径迹、能量沉积、衰变产物和缺失动量重建粒子。',
        shift: '物质的“部件”成为通过相互作用识别的短暂激发。',
        people: '狄拉克、安德森、吴健雄'
      }
    },
    {
      id: 'plasma',
      year: 1942,
      y: 79,
      x: 54,
      lineage: 'fields',
      color: '#00d4ff',
      signature: 'plasma',
      parents: ['fluids', 'electrodynamics', 'statistical'],
      en: {
        name: 'Plasma physics',
        short: 'Ionized matter moves collectively with electromagnetic fields.',
        detail: 'Plasma physics combines fluid behavior, kinetic theory, and electromagnetism. It explains much of visible cosmic matter, space weather, fusion confinement, discharges, and many industrial processes.',
        shift: 'Charged matter and fields had to be solved as one evolving system.',
        people: 'Hannes Alfvén, Irving Langmuir, Lyman Spitzer'
      },
      zh: {
        name: '等离子体物理',
        short: '电离物质与电磁场发生集体运动。',
        detail: '等离子体物理结合流体行为、动理学与电磁学，解释宇宙中大部分可见物质、空间天气、聚变约束、放电和许多工业过程。',
        shift: '带电物质与场必须作为同一个演化系统求解。',
        people: '阿尔文、朗缪尔、斯皮策'
      }
    },
    {
      id: 'biophysics',
      year: 1953,
      y: 83,
      x: 82,
      lineage: 'life',
      color: '#7ee8c5',
      signature: 'dna',
      parents: ['thermodynamics', 'fluids', 'quantum-mechanics'],
      en: {
        name: 'Biophysics',
        short: 'Energy, forces, information, and fluctuations animate living systems.',
        detail: 'Biophysics applies physical measurement and models to molecules, membranes, cells, organisms, and populations. It spans molecular structure, neural signals, biomechanics, imaging, and nonequilibrium systems.',
        shift: 'Living organization became accessible to quantitative physical tests.',
        people: 'Rosalind Franklin, Dorothy Hodgkin, Max Delbrück'
      },
      zh: {
        name: '生物物理学',
        short: '能量、力、信息与涨落驱动生命系统。',
        detail: '生物物理学把物理测量与模型用于分子、膜、细胞、个体和种群，涵盖分子结构、神经信号、生物力学、成像与非平衡系统。',
        shift: '生命组织成为可定量检验的物理对象。',
        people: '富兰克林、霍奇金、德尔布吕克'
      }
    },
    {
      id: 'nonlinear',
      year: 1963,
      y: 87,
      x: 19,
      lineage: 'systems',
      color: '#ffd166',
      signature: 'chaos',
      parents: ['mechanics', 'fluids', 'statistical'],
      en: {
        name: 'Nonlinear dynamics & chaos',
        short: 'Simple deterministic rules can amplify uncertainty into complexity.',
        detail: 'Nonlinear dynamics studies feedback, bifurcations, synchronization, pattern formation, and chaos. Sensitive dependence limits long-range prediction even when the governing equations contain no randomness.',
        shift: 'Deterministic did not always mean predictable.',
        people: 'Henri Poincaré, Mary Cartwright, Edward Lorenz'
      },
      zh: {
        name: '非线性动力学与混沌',
        short: '简单的确定性规律能把微小不确定性放大为复杂性。',
        detail: '非线性动力学研究反馈、分岔、同步、图样形成与混沌。即使方程没有随机项，初值敏感性也会限制长期预测。',
        shift: '确定性不再等同于可预测性。',
        people: '庞加莱、卡特赖特、洛伦兹'
      }
    },
    {
      id: 'standard-model',
      year: 1973,
      y: 91,
      x: 45,
      lineage: 'quantum',
      color: '#ff6b9d',
      signature: 'tracks',
      parents: ['particle', 'electrodynamics', 'quantum-mechanics'],
      en: {
        name: 'Quantum field theory & Standard Model',
        short: 'Particles become field excitations governed by gauge symmetries.',
        detail: 'The Standard Model is a quantum field theory of electromagnetic, weak, and strong interactions. It accurately predicts collider and decay measurements, but excludes a quantum theory of gravity and does not explain dark matter.',
        shift: 'Fields, symmetries, and particles became one predictive framework.',
        people: 'Chen-Ning Yang, Abdus Salam, Steven Weinberg, Sheldon Glashow'
      },
      zh: {
        name: '量子场论与标准模型',
        short: '粒子成为受规范对称性支配的场激发。',
        detail: '标准模型是描述电磁、弱和强相互作用的量子场论，能精确预测对撞与衰变测量，但不包含量子引力，也未解释暗物质。',
        shift: '场、对称性与粒子成为统一的预测框架。',
        people: '杨振宁、萨拉姆、温伯格、格拉肖'
      }
    },
    {
      id: 'quantum-information',
      year: 1982,
      y: 94,
      x: 70,
      lineage: 'quantum',
      color: '#7c5cff',
      signature: 'qubit',
      parents: ['quantum-mechanics', 'statistical'],
      en: {
        name: 'Quantum information',
        short: 'Superposition and entanglement become resources for processing information.',
        detail: 'Quantum information studies what can be communicated, computed, measured, and secured using quantum systems. It clarifies entanglement, decoherence, error correction, and the limits of physical information.',
        shift: 'The foundations of quantum theory became engineering resources.',
        people: 'Richard Feynman, David Deutsch, Peter Shor'
      },
      zh: {
        name: '量子信息',
        short: '叠加与纠缠成为处理信息的资源。',
        detail: '量子信息研究利用量子系统可以通信、计算、测量和保护什么，澄清纠缠、退相干、纠错以及物理信息的极限。',
        shift: '量子基础问题转化为工程资源。',
        people: '费曼、多伊奇、肖尔'
      }
    },
    {
      id: 'soft-matter',
      year: 1991,
      y: 97,
      x: 88,
      lineage: 'matter',
      color: '#7ee8c5',
      signature: 'soft',
      parents: ['condensed', 'fluids', 'statistical'],
      en: {
        name: 'Soft matter & active matter',
        short: 'Polymers, foams, grains, and self-driven units organize between solid and fluid.',
        detail: 'Soft-matter physics studies systems easily deformed by thermal or mechanical forces. Active matter adds energy-consuming components such as cells or synthetic swimmers, producing collective motion far from equilibrium.',
        shift: 'Disorder, shape, and activity became design variables for matter.',
        people: 'Pierre-Gilles de Gennes, Sam Edwards, M. Cristina Marchetti'
      },
      zh: {
        name: '软物质与活性物质',
        short: '聚合物、泡沫、颗粒与自驱单元在固体和流体之间组织。',
        detail: '软物质研究容易被热或机械作用变形的系统；活性物质加入细胞或人工游动体等持续耗能单元，产生远离平衡的集体运动。',
        shift: '无序、形状与活性成为物质设计变量。',
        people: '德热纳、爱德华兹、马尔凯蒂'
      }
    }
  ];

  const timeline = document.getElementById('fieldTimeline');
  const stage = document.getElementById('fieldStage');
  const svg = document.getElementById('lineageSvg');
  const search = document.getElementById('fieldSearch');
  const inspector = document.getElementById('fieldInspector');
  const filterButtons = [...document.querySelectorAll('.lineage-filter')];
  const nodeById = new Map();
  const edgeByKey = new Map();
  let activeFilter = 'all';
  let selectedId = null;

  const lineageNames = {
    all: { en: 'All lineages', zh: '全部谱系' },
    motion: { en: 'Motion', zh: '运动' },
    fields: { en: 'Fields & waves', zh: '场与波' },
    matter: { en: 'Matter', zh: '物质' },
    quantum: { en: 'Quantum', zh: '量子' },
    cosmos: { en: 'Earth & cosmos', zh: '地球与宇宙' },
    life: { en: 'Living systems', zh: '生命系统' },
    systems: { en: 'Complex systems', zh: '复杂系统' }
  };

  function localized(field) {
    return PhysicsUI.language === 'zh-CN' ? field.zh : field.en;
  }

  function signatureMarkup(kind) {
    const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const signatures = {
      rays: `<path ${common} d="M4 14h20l10 14 12-20M4 42h18l12-14 12 20"/><circle cx="34" cy="28" r="4" fill="currentColor"/>`,
      orbit: `<ellipse ${common} cx="29" cy="29" rx="24" ry="12" transform="rotate(-22 29 29)"/><circle cx="29" cy="29" r="5" fill="currentColor"/><circle cx="49" cy="18" r="2.8" fill="currentColor"/>`,
      fluid: `<path ${common} d="M4 15c10-8 16 8 26 0s16 8 24 0M4 29c10-8 16 8 26 0s16 8 24 0M4 43c10-8 16 8 26 0s16 8 24 0"/>`,
      wave: `<path ${common} d="M2 29c7-20 14 20 21 0s14-20 21 0 10 9 12 0"/><path ${common} opacity=".45" d="M2 40c7-10 14 10 21 0s14-10 21 0 10 5 12 0"/>`,
      heat: `<path ${common} d="M13 50c-8-8 7-13 0-22s8-13 2-21M29 50c-8-8 7-13 0-22s8-13 2-21M45 50c-8-8 7-13 0-22s8-13 2-21"/>`,
      field: `<path ${common} d="M5 16c14-12 34-12 48 0M5 42c14 12 34 12 48 0M5 29h48"/><circle cx="8" cy="29" r="4" fill="currentColor"/><circle cx="50" cy="29" r="4" fill="currentColor"/>`,
      probability: `<path ${common} d="M4 48h50M7 48c4-2 6-18 11-18s6 18 11 18c5 0 7-35 12-35s7 33 13 35"/><circle cx="41" cy="13" r="2.5" fill="currentColor"/>`,
      layers: `<path ${common} d="M4 42c12-2 15-10 26-10s17 9 24 10M6 32c10-2 14-9 24-9s16 7 22 9M12 22c7-2 10-7 18-7s12 5 17 7"/>`,
      quanta: `<path ${common} d="M6 46h10V35h10V25h10V15h16"/><circle cx="16" cy="35" r="3" fill="currentColor"/><circle cx="36" cy="15" r="3" fill="currentColor"/>`,
      spacetime: `<path ${common} d="M4 15c13 0 17 7 25 7s12-7 25-7M4 43c13 0 17-7 25-7s12 7 25 7M15 4c0 13 7 17 7 25s-7 12-7 25M43 4c0 13-7 17-7 25s7 12 7 25"/><circle cx="29" cy="29" r="4" fill="currentColor"/>`,
      nucleus: `<circle ${common} cx="29" cy="29" r="21"/><circle cx="23" cy="25" r="6" fill="currentColor"/><circle cx="35" cy="31" r="6" fill="currentColor" opacity=".6"/><circle cx="24" cy="37" r="5" fill="currentColor" opacity=".8"/>`,
      interference: `<path ${common} d="M4 10h16M4 48h16M24 5v48M34 5v48M44 5v48M54 5v48"/><path ${common} d="M20 10c14 0 15 38 34 38M20 48c14 0 15-38 34-38"/>`,
      lattice: `<path ${common} d="M8 8h42v42H8zM8 22h42M8 36h42M22 8v42M36 8v42"/><circle cx="22" cy="22" r="3" fill="currentColor"/><circle cx="36" cy="36" r="3" fill="currentColor"/>`,
      tracks: `<path ${common} d="M29 29L5 8M29 29l25-19M29 29L8 49M29 29l23 22M29 29c2-14 13-14 18-7s-1 15-8 12"/><circle cx="29" cy="29" r="4" fill="currentColor"/>`,
      plasma: `<path ${common} d="M4 20c14-15 24 16 38 1s16 11 12 18M7 41c12-11 18 7 28-1s14-2 18 6"/><circle cx="14" cy="16" r="3" fill="currentColor"/><circle cx="44" cy="39" r="3" fill="currentColor"/>`,
      dna: `<path ${common} d="M12 4c30 12 5 38 34 50M46 4C16 16 41 42 12 54M17 13h24M13 25h32M13 37h32M17 49h24"/>`,
      chaos: `<path ${common} d="M29 29c-25-4-27-23-10-24 15-1 17 21 10 24-7 3-5 25 10 24 17-1 15-20-10-24z"/>`,
      qubit: `<circle ${common} cx="29" cy="29" r="23"/><ellipse ${common} cx="29" cy="29" rx="23" ry="9"/><path ${common} d="M29 6v46M29 29l13-13"/><circle cx="42" cy="16" r="3" fill="currentColor"/>`,
      soft: `<path ${common} d="M5 35c7-17 13 14 20-4s12 15 19-4 10 10 10 10"/><circle cx="12" cy="22" r="5" fill="currentColor" opacity=".7"/><circle cx="34" cy="44" r="7" fill="currentColor" opacity=".45"/>`
    };
    return `<svg class="field-signature" viewBox="0 0 58 58" aria-hidden="true">${signatures[kind]}</svg>`;
  }

  function createNodes() {
    fields.forEach((field, index) => {
      const article = document.createElement('article');
      article.className = 'field-node';
      article.dataset.field = field.id;
      article.dataset.lineage = field.lineage;
      article.style.setProperty('--field-color', field.color);
      article.style.setProperty('--left', `${field.x}%`);
      article.style.setProperty('--top', `${field.y}%`);
      article.style.setProperty('--mobile-top', `${3 + index * (94 / (fields.length - 1))}%`);
      article.innerHTML = `
        <button type="button" aria-controls="fieldInspector">
          <span>
            <span class="field-year">${field.year}</span>
            <h3></h3>
            <p></p>
            ${field.page ? '<span class="ready-mark"></span>' : ''}
          </span>
          ${signatureMarkup(field.signature)}
        </button>
      `;
      article.querySelector('button').addEventListener('click', () => selectField(field.id));
      stage.append(article);
      nodeById.set(field.id, article);
    });
    updateNodeCopy();
  }

  function createAxis() {
    const axis = timeline.querySelector('.year-axis');
    [
      [1600, 2],
      [1700, 11],
      [1800, 21],
      [1850, 32],
      [1900, 49],
      [1925, 64],
      [1950, 81],
      [2000, 98]
    ].forEach(([year, position]) => {
      const marker = document.createElement('span');
      marker.className = 'axis-year';
      marker.style.setProperty('--position', `${position}%`);
      marker.textContent = year;
      axis.append(marker);
    });
  }

  function updateNodeCopy() {
    fields.forEach(field => {
      const node = nodeById.get(field.id);
      const copy = localized(field);
      node.querySelector('h3').textContent = copy.name;
      node.querySelector('p').textContent = copy.short;
      const ready = node.querySelector('.ready-mark');
      if (ready) ready.textContent = PhysicsUI.language === 'zh-CN' ? '进入完整专题 →' : 'Open full field guide →';
      node.querySelector('button').setAttribute(
        'aria-label',
        PhysicsUI.language === 'zh-CN' ? `查看${copy.name}` : `Inspect ${copy.name}`
      );
    });

    filterButtons.forEach(button => {
      const copy = lineageNames[button.dataset.lineage];
      button.textContent = PhysicsUI.language === 'zh-CN' ? copy.zh : copy.en;
    });

    if (selectedId) renderInspector(fields.find(field => field.id === selectedId));
  }

  function edgeKey(parentId, childId) {
    return `${parentId}->${childId}`;
  }

  function drawPaths() {
    const stageRect = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
    svg.innerHTML = '';
    edgeByKey.clear();
    fields.forEach(field => {
      const child = nodeById.get(field.id);
      if (!child || child.classList.contains('hidden')) return;
      field.parents.forEach(parentId => {
        const parent = nodeById.get(parentId);
        if (!parent || parent.classList.contains('hidden')) return;
        const parentRect = parent.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        const startX = parentRect.left + parentRect.width / 2 - stageRect.left;
        const startY = parentRect.bottom - stageRect.top;
        const endX = childRect.left + childRect.width / 2 - stageRect.left;
        const endY = childRect.top - stageRect.top;
        const bendY = startY + Math.max(24, (endY - startY) * 0.5);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${startX} ${startY} C ${startX} ${bendY}, ${endX} ${bendY}, ${endX} ${endY}`);
        path.style.setProperty('--path-color', field.color);
        path.dataset.parent = parentId;
        path.dataset.child = field.id;
        svg.append(path);
        edgeByKey.set(edgeKey(parentId, field.id), path);
      });
    });
    updateSelection();
  }

  function graphFamily(id) {
    const related = new Set([id]);
    const visitParents = currentId => {
      const current = fields.find(field => field.id === currentId);
      current.parents.forEach(parentId => {
        if (related.has(parentId)) return;
        related.add(parentId);
        visitParents(parentId);
      });
    };
    const visitChildren = currentId => {
      fields.filter(field => field.parents.includes(currentId)).forEach(child => {
        if (related.has(child.id)) return;
        related.add(child.id);
        visitChildren(child.id);
      });
    };
    visitParents(id);
    visitChildren(id);
    return related;
  }

  function updateSelection() {
    const related = selectedId ? graphFamily(selectedId) : null;
    nodeById.forEach((node, id) => {
      node.classList.toggle('selected', id === selectedId);
      node.classList.toggle('dimmed', Boolean(related) && !related.has(id));
    });
    edgeByKey.forEach((path, key) => {
      if (!related) {
        path.classList.remove('active');
        return;
      }
      const [parent, child] = key.split('->');
      path.classList.toggle('active', related.has(parent) && related.has(child));
    });
  }

  function renderInspector(field) {
    const copy = localized(field);
    const ancestorNames = field.parents
      .map(parentId => localized(fields.find(item => item.id === parentId)).name)
      .join(' · ');
    inspector.querySelector('.inspector-year').textContent = `${field.year} · ${lineageNames[field.lineage][PhysicsUI.language === 'zh-CN' ? 'zh' : 'en']}`;
    inspector.querySelector('h3').textContent = copy.name;
    inspector.querySelector('.inspector-detail').textContent = copy.detail;
    inspector.querySelector('.inspector-shift strong').textContent = PhysicsUI.language === 'zh-CN' ? '关键转变' : 'What changed';
    inspector.querySelector('.inspector-shift span').textContent = copy.shift;
    inspector.querySelector('.inspector-people strong').textContent = PhysicsUI.language === 'zh-CN' ? '代表人物' : 'People to know';
    inspector.querySelector('.inspector-people span').textContent = copy.people;
    inspector.querySelector('.inspector-parents strong').textContent = PhysicsUI.language === 'zh-CN' ? '直接源流' : 'Direct ancestors';
    inspector.querySelector('.inspector-parents span').textContent = ancestorNames || (PhysicsUI.language === 'zh-CN' ? '早期观测与数学传统' : 'Earlier observational and mathematical traditions');
    const actionSlot = inspector.querySelector('.inspector-action');
    if (field.page) {
      actionSlot.innerHTML = `<a class="node-action" href="${field.page}">${PhysicsUI.language === 'zh-CN' ? '进入完整互动专题' : 'Enter the complete interactive guide'}</a>`;
    } else {
      actionSlot.innerHTML = `<span class="node-action" aria-disabled="true">${PhysicsUI.language === 'zh-CN' ? '专题正在建设；谱系简介已开放' : 'Field guide in development; lineage overview available'}</span>`;
    }
  }

  function selectField(id) {
    selectedId = id;
    renderInspector(fields.find(field => field.id === id));
    inspector.classList.add('open');
    inspector.setAttribute('aria-hidden', 'false');
    updateSelection();
    PhysicsUI.playTone(260 + fields.findIndex(field => field.id === id) * 13, 0.1, 0.018);
  }

  function applyFilters() {
    const query = search.value.trim().toLocaleLowerCase();
    fields.forEach(field => {
      const node = nodeById.get(field.id);
      const text = `${field.en.name} ${field.en.short} ${field.en.people} ${field.zh.name} ${field.zh.short} ${field.zh.people}`.toLocaleLowerCase();
      const matchesLineage = activeFilter === 'all' || field.lineage === activeFilter;
      const matchesSearch = !query || text.includes(query);
      node.classList.toggle('hidden', !(matchesLineage && matchesSearch));
    });
    requestAnimationFrame(drawPaths);
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.lineage;
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      applyFilters();
    });
  });

  search.addEventListener('input', applyFilters);

  function closeInspector() {
    inspector.classList.remove('open');
    inspector.setAttribute('aria-hidden', 'true');
    selectedId = null;
    updateSelection();
  }

  inspector.querySelector('.inspector-close').addEventListener('click', closeInspector);
  // The inspector floats over the genealogy, so Escape must free the nodes behind it.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selectedId) closeInspector();
  });
  document.addEventListener('physics-language', updateNodeCopy);
  window.addEventListener('resize', () => requestAnimationFrame(drawPaths));

  createAxis();
  createNodes();
  requestAnimationFrame(drawPaths);
})();
