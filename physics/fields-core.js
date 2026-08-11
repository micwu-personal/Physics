/* Shared field metadata for the physics atlas and the individual field guides.
   Layout values (x, y) are percentages inside the genealogy stage; `parents`
   lists the fields whose ideas this one directly builds on. */
globalThis.PhysicsFieldList = Object.freeze([
    {
      id: 'astronomy-optics',
      page: './field.html?id=astronomy-optics',
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
      page: './field.html?id=fluids',
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
      page: './field.html?id=acoustics',
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
      page: './field.html?id=thermodynamics',
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
      page: './field.html?id=electromagnetism',
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
      page: './electrodynamics.html',
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
      page: './field.html?id=statistical',
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
      page: './field.html?id=geophysics',
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
      page: './field.html?id=quantum-theory',
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
      page: './field.html?id=nuclear',
      year: 1911,      y: 60,
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
      id: 'astrophysics',
      page: './astrophysics.html',
      year: 1926,
      y: 67,
      x: 62,
      lineage: 'cosmos',
      color: '#ffd166',
      signature: 'orbit',
      parents: ['relativity', 'nuclear', 'quantum-theory', 'statistical'],
      en: {
        name: 'Astrophysics',
        short: 'Gravity, pressure, and nuclear reactions decide what a star can be.',
        detail: 'Astrophysics applies mechanics, thermodynamics, nuclear physics, and relativity to stars, remnants, and disks. Stellar structure follows from a balance between gravity pulling inward and pressure pushing out, which is why a star\u2019s initial mass fixes its lifetime, its fusion stages, and its final state.',
        shift: 'Stars stopped being points of light and became calculable physical objects.',
        people: 'Arthur Eddington, Subrahmanyan Chandrasekhar, Cecilia Payne-Gaposchkin'
      },
      zh: {
        name: '天体物理学',
        short: '引力、压强与核反应共同决定恒星能成为什么。',
        detail: '天体物理学把力学、热力学、核物理与相对论应用于恒星、致密遗迹和吸积盘。恒星结构来自向内引力与向外压强的平衡，因此恒星的初始质量就决定了它的寿命、聚变阶段与最终归宿。',
        shift: '恒星不再只是光点，而成为可计算的物理对象。',
        people: '爱丁顿、钱德拉塞卡、佩恩-加波施金'
      }
    },
    {
      id: 'condensed',
      page: './field.html?id=condensed',
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
      id: 'phase-transitions',
      page: './phase-transitions.html',
      year: 1937,
      y: 74,
      x: 91,
      lineage: 'matter',
      color: '#7ee8c5',
      signature: 'phase',
      parents: ['thermodynamics', 'statistical', 'condensed'],
      en: {
        name: 'Phase transitions',
        short: 'Free energy, symmetry, topology, and fluctuations reorganize collective matter.',
        detail: 'Phase-transition physics explains first-order nucleation, continuous criticality, topological change, quantum phases, biological phase separation, and model-dependent transitions in the early universe.',
        shift: 'Collective change became classifiable across materials, fields, chemistry, and living matter.',
        people: 'Lev Landau, Lars Onsager, Kenneth Wilson, John Kosterlitz'
      },
      zh: {
        name: '相变',
        short: '自由能、对称性、拓扑与涨落重组集体物质。',
        detail: '相变物理解释一级成核、连续临界性、拓扑变化、量子相、生物相分离，以及依赖模型的早期宇宙转变。',
        shift: '材料、场、化学与生命物质中的集体变化获得统一分类语言。',
        people: '朗道、昂萨格、威尔逊、科斯特利茨'
      }
    },
    {
      id: 'particle',
      page: './field.html?id=particle',
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
      page: './field.html?id=plasma',
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
      id: 'information-theory',
      page: './entropy-information.html',
      year: 1948,
      y: 81,
      x: 28,
      lineage: 'systems',
      color: '#7c5cff',
      signature: 'information',
      parents: ['statistical', 'electrodynamics'],
      en: {
        name: 'Entropy & information theory',
        short: 'Probability becomes a limit on coding, communication, records, and physical information.',
        detail: 'Information theory quantifies uncertainty, compression, dependence, and noisy channels. Its mathematical entropy connects to statistical mechanics, while Landauer, quantum information, and black-hole thermodynamics make the physical assumptions explicit.',
        shift: 'Uncertainty became measurable without being confused with a material substance.',
        people: 'Claude Shannon, Rolf Landauer, John von Neumann, Jacob Bekenstein'
      },
      zh: {
        name: '熵与信息论',
        short: '概率成为编码、通信、记录与物理信息的极限。',
        detail: '信息论量化不确定性、压缩、依赖关系与有噪信道。它的数学熵连接统计力学，而兰道尔原理、量子信息与黑洞热力学明确了各自的物理假设。',
        shift: '不确定性成为可测量的量，而不再被误作某种物质。',
        people: '香农、兰道尔、冯·诺伊曼、贝肯斯坦'
      }
    },
    {
      id: 'biophysics',
      page: './field.html?id=biophysics',
      year: 1953,
      y: 83,
      x: 82,
      lineage: 'life',
      color: '#7ee8c5',
      signature: 'dna',
      parents: ['thermodynamics', 'fluids', 'quantum-mechanics', 'information-theory'],
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
      page: './field.html?id=nonlinear',
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
      page: './field.html?id=standard-model',
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
      page: './field.html?id=quantum-information',
      year: 1982,
      y: 94,
      x: 70,
      lineage: 'quantum',
      color: '#7c5cff',
      signature: 'qubit',
      parents: ['quantum-mechanics', 'statistical', 'information-theory'],
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
      page: './field.html?id=soft-matter',
      year: 1991,
      y: 97,
      x: 88,
      lineage: 'matter',
      color: '#7ee8c5',
      signature: 'soft',
      parents: ['condensed', 'fluids', 'statistical', 'phase-transitions'],
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
]);

globalThis.physicsSignatureMarkup = function signatureMarkup(kind) {
    const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const signatures = {
      rays: `<path ${common} d="M4 14h20l10 14 12-20M4 42h18l12-14 12 20"/><circle cx="34" cy="28" r="4" fill="currentColor"/>`,
      orbit: `<ellipse ${common} cx="29" cy="29" rx="24" ry="12" transform="rotate(-22 29 29)"/><circle cx="29" cy="29" r="5" fill="currentColor"/><circle cx="49" cy="18" r="2.8" fill="currentColor"/>`,
      fluid: `<path ${common} d="M4 15c10-8 16 8 26 0s16 8 24 0M4 29c10-8 16 8 26 0s16 8 24 0M4 43c10-8 16 8 26 0s16 8 24 0"/>`,
      wave: `<path ${common} d="M2 29c7-20 14 20 21 0s14-20 21 0 10 9 12 0"/><path ${common} opacity=".45" d="M2 40c7-10 14 10 21 0s14-10 21 0 10 5 12 0"/>`,
      heat: `<path ${common} d="M13 50c-8-8 7-13 0-22s8-13 2-21M29 50c-8-8 7-13 0-22s8-13 2-21M45 50c-8-8 7-13 0-22s8-13 2-21"/>`,
      field: `<path ${common} d="M5 16c14-12 34-12 48 0M5 42c14 12 34 12 48 0M5 29h48"/><circle cx="8" cy="29" r="4" fill="currentColor"/><circle cx="50" cy="29" r="4" fill="currentColor"/>`,
      probability: `<path ${common} d="M4 48h50M7 48c4-2 6-18 11-18s6 18 11 18c5 0 7-35 12-35s7 33 13 35"/><circle cx="41" cy="13" r="2.5" fill="currentColor"/>`,
      phase: `<path ${common} d="M5 45c8-3 10-13 16-13s8 13 15 13 9-13 17-13M5 14c10 0 11 13 20 13s10-13 28-13"/><circle cx="29" cy="27" r="4" fill="currentColor"/>`,
      information: `<path ${common} d="M5 47h48M9 47V26h8v21M24 47V12h8v35M39 47V20h8v27"/><path ${common} opacity=".48" d="M7 8l44 44M51 8L7 52"/>`,
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
  };
