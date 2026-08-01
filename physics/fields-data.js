/*
  Field-guide copy for the Physics Field Atlas.
  One frozen global, keyed by field id. Each entry carries an English and a
  Simplified Chinese rendering written independently, not translated literally.
  Plain-language statements precede any specialist terminology, uncertainty is
  stated where it exists, and no diagram is described as a photograph.
*/
globalThis.PhysicsFieldGuides = Object.freeze({
  'astronomy-optics': {
    equation: 'θ ≈ 1.22 λ/D',
    equationNote: {
      en: "θ is the smallest angle a telescope of aperture D can resolve at wavelength λ.",
      zh: "θ 是口径为 D 的望远镜在波长 λ 下能分辨的最小角度。"
    },
    lede: {
      en: "The study of how lenses and mirrors form images, and how those images turn distant light into measurements of the sky. It asks what we can honestly infer about objects we can never touch. It explains, for example, why a larger telescope resolves finer detail and gathers fainter starlight.",
      zh: "研究透镜和反射镜如何成像，以及如何把遥远的光转化为对天空的测量。它回答我们能对无法触及的天体作出哪些可靠推断。例如它解释为何口径更大的望远镜能分辨更精细的结构，并收集更暗的星光。"
    },
    concepts: [
      {
        mark: '1/v − 1/u = 1/f',
        title: { en: "Image formation", zh: "成像" },
        body: {
          en: "A lens or curved mirror bends rays so that light from one point reconverges to another, forming a focused image whose size and position follow from the geometry.",
          zh: "透镜或曲面镜使光线偏折，让来自一点的光重新会聚到另一点，形成清晰的像，像的大小和位置由几何关系决定。"
        }
      },
      {
        mark: '∝ D²',
        title: { en: "Light grasp", zh: "聚光本领" },
        body: {
          en: "The light a telescope collects grows with the square of its aperture, so a bigger mirror reveals fainter and more distant sources.",
          zh: "望远镜收集的光随口径的平方增长，因此更大的镜面能揭示更暗、更遥远的天体。"
        }
      },
      {
        mark: 'n₁sinθ₁=n₂sinθ₂',
        title: { en: "Refraction", zh: "折射与色散" },
        body: {
          en: "Light changes direction crossing between media of different optical density; the law that splits colors in a prism also limits lens design through chromatic aberration.",
          zh: "光在不同光密度的介质间会改变方向；使棱镜分光的同一定律，也通过色差限制着透镜的设计。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Not an unfiltered truth", zh: "不是自然的真实照片" },
        body: {
          en: "Telescopic images are shaped by the instrument. Atmospheric blur, diffraction, and detector response all imprint on the data, so raw images need calibration before they count as measurements.",
          zh: "望远镜图像受仪器影响。大气抖动、衍射和探测器响应都会留下印记，因此原始图像需经过定标才能作为测量结果。"
        }
      },
      {
        title: { en: "Geometric optics has limits", zh: "几何光学有其边界" },
        body: {
          en: "Ray tracing treats light as straight lines and ignores its wave nature. Near the resolution limit, or through very small apertures, diffraction dominates and the ray picture fails.",
          zh: "光线追迹把光当作直线，忽略其波动性。接近分辨极限或经过极小孔径时，衍射占主导，光线图像随之失效。"
        }
      }
    ],
    connections: [
      {
        href: './electrodynamics.html',
        label: { en: "Electrodynamics", zh: "电动力学" },
        body: {
          en: "Maxwell's theory explains what the light a telescope collects actually is, and why it travels at a fixed speed.",
          zh: "麦克斯韦理论说明望远镜所收集的光究竟是什么，以及它为何以恒定速度传播。"
        }
      },
      {
        href: './astrophysics.html',
        label: { en: "Astrophysics", zh: "天体物理" },
        body: {
          en: "The stars and galaxies these instruments observe become physical systems with masses, temperatures, and histories.",
          zh: "这些仪器观测的恒星与星系成为具有质量、温度和演化历史的物理系统。"
        }
      },
      {
        href: './field.html?id=quantum-theory',
        label: { en: "Spectroscopy", zh: "光谱学" },
        body: {
          en: "Spectral lines, explained by quantum theory, let astronomers read composition and motion from starlight.",
          zh: "由量子理论解释的谱线让天文学家从星光中读出成分与运动。"
        }
      }
    ]
  },

  'fluids': {
    equation: 'ρ(∂v/∂t + v·∇v) = −∇p + μ∇²v',
    equationNote: {
      en: "A fluid's acceleration is set by the pressure gradient plus viscous forces; ρ is density, μ viscosity, v velocity.",
      zh: "流体的加速度由压强梯度和黏性力决定；ρ 为密度，μ 为黏度，v 为速度。"
    },
    lede: {
      en: "How liquids and gases move when treated as continuous material rather than separate molecules. It answers how pressure, flow speed, and viscosity together set the motion, from blood in an artery to air over a wing. It explains why a narrowing pipe speeds the flow and lowers its pressure.",
      zh: "研究把液体和气体当作连续介质而非离散分子时如何运动。它回答压强、流速与黏性如何共同决定运动，从动脉中的血液到机翼上方的空气。它解释为何管道收窄处流速加快、压强降低。"
    },
    concepts: [
      {
        mark: 'Re = ρvL/μ',
        title: { en: "Reynolds number", zh: "雷诺数" },
        body: {
          en: "A single ratio compares inertia to viscosity and predicts whether a flow stays smooth and layered or breaks into turbulence.",
          zh: "一个比值比较惯性与黏性，预示流动是保持平滑分层还是转为湍流。"
        }
      },
      {
        mark: 'p + ½ρv² + ρgh',
        title: { en: "Bernoulli's balance", zh: "伯努利关系" },
        body: {
          en: "Along a steady, low-friction streamline, faster flow accompanies lower pressure. It is a bookkeeping of energy, often misread as a full explanation of a wing's lift.",
          zh: "沿定常、低摩擦的流线，流速越快压强越低；这只是能量的记账，常被误当作机翼升力的完整解释。"
        }
      },
      {
        mark: '∇·v = 0',
        title: { en: "Incompressibility", zh: "不可压缩性" },
        body: {
          en: "For many liquids a fluid parcel's volume barely changes, so what flows into a region must flow out, a strong constraint that simplifies the equations.",
          zh: "许多液体中流体微团的体积几乎不变，因此流入某区域的必等于流出的，这一强约束简化了方程。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Turbulence is unsolved", zh: "湍流尚未解决" },
        body: {
          en: "The Navier-Stokes equations are written down, but no general method predicts turbulent flow from first principles, and whether smooth solutions always exist remains an open mathematical problem.",
          zh: "纳维-斯托克斯方程虽已写出，但尚无普适方法从第一性原理预测湍流，其光滑解是否总是存在也仍是重要的数学难题。"
        }
      },
      {
        title: { en: "The continuum assumption", zh: "连续介质假设" },
        body: {
          en: "Treating a fluid as continuous fails when the scale approaches the mean free path between molecules, as in very thin gases or nanoscale channels, where kinetic theory is needed instead.",
          zh: "当尺度接近分子平均自由程时，把流体当作连续介质会失效，如极稀薄气体或纳米通道，此时需要用动理学理论。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=plasma',
        label: { en: "Plasma physics", zh: "等离子体物理" },
        body: {
          en: "Charged fluids add electromagnetic forces to the same conservation laws, governing stars and fusion devices.",
          zh: "带电流体在相同守恒律上叠加电磁力，支配恒星与聚变装置。"
        }
      },
      {
        href: './field.html?id=nonlinear',
        label: { en: "Chaos", zh: "混沌" },
        body: {
          en: "Turbulence is a prime example of how deterministic fluid equations can produce unpredictable motion.",
          zh: "湍流是确定性流体方程如何产生不可预测运动的典型例子。"
        }
      },
      {
        href: './field.html?id=soft-matter',
        label: { en: "Soft matter", zh: "软物质" },
        body: {
          en: "Complex fluids such as polymers and suspensions bend the simple rules with memory and internal structure.",
          zh: "聚合物和悬浮液等复杂流体带有记忆与内部结构，突破了简单规律。"
        }
      }
    ]
  },

  'acoustics': {
    equation: '∂²p/∂t² = c²∇²p',
    equationNote: {
      en: "Pressure disturbances p travel as waves at a speed c set by the medium.",
      zh: "压强扰动 p 以介质决定的速度 c 作为波传播。"
    },
    lede: {
      en: "The physics of sound: vibrations that travel as pressure waves through gases, liquids, and solids. It asks how frequency, wavelength, and boundaries shape what we hear. It explains why a given pipe or string sounds one pitch, and why rooms ring at their own frequencies.",
      zh: "研究声音，即以压强波形式在气体、液体和固体中传播的机械振动。它回答频率、波长和边界如何塑造我们听到或测到的内容。它解释为何特定的管或弦发出特定的音高，以及房间为何有各自的共振。"
    },
    concepts: [
      {
        mark: 'c = fλ',
        title: { en: "Speed, pitch, size", zh: "速度、音高与尺寸" },
        body: {
          en: "Wave speed equals frequency times wavelength, so a fixed speed in air ties a note's pitch to the physical length of a resonating column or string.",
          zh: "波速等于频率乘以波长，因此空气中固定的声速把音高与共振管或弦的物理长度联系起来。"
        }
      },
      {
        mark: 'f_n = n·f₁',
        title: { en: "Standing waves", zh: "驻波" },
        body: {
          en: "Boundaries pick out discrete modes whose frequencies form a harmonic series; their mix, the timbre, is what distinguishes a flute from a violin at the same pitch.",
          zh: "边界选出一系列离散的简正模，其频率构成谐波列；它们的混合即音色，使同一音高下长笛与小提琴听来不同。"
        }
      },
      {
        mark: 'I ∝ p²',
        title: { en: "Loudness scale", zh: "响度标度" },
        body: {
          en: "Sound intensity grows with the square of pressure amplitude and spans a huge range, which is why loudness is measured on the logarithmic decibel scale.",
          zh: "声强随压强振幅的平方增长，跨越极大范围，因此响度用对数的分贝标度来衡量。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Linear until it is not", zh: "线性只在小振幅下成立" },
        body: {
          en: "Ordinary acoustics assumes small pressure changes that add up linearly. Very loud sources, shock waves, and sonic booms are nonlinear and need a different treatment.",
          zh: "常规声学假设压强变化很小、可线性叠加。极强的声源、激波和音爆是非线性的，需要另作处理。"
        }
      },
      {
        title: { en: "Sound needs a medium", zh: "声音需要介质" },
        body: {
          en: "Because it is a mechanical vibration of matter, sound cannot travel through vacuum. This is a common mix-up with light and other electromagnetic waves, which can.",
          zh: "由于是物质的机械振动，声音无法在真空中传播。这常与光等电磁波混淆，后者可以在真空中传播。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=fluids',
        label: { en: "Fluid mechanics", zh: "流体力学" },
        body: {
          en: "Sound in air is a small-amplitude solution of the same equations that govern winds and flows.",
          zh: "空气中的声音是支配风和流动的同一组方程的小振幅解。"
        }
      },
      {
        href: './field.html?id=condensed',
        label: { en: "Condensed matter", zh: "凝聚态物理" },
        body: {
          en: "In solids, quantized sound waves called phonons carry heat and shape material properties.",
          zh: "在固体中，量子化的声波即声子，负责输运热量并影响材料性质。"
        }
      },
      {
        href: './electrodynamics.html',
        label: { en: "Wave analogies", zh: "电动力学" },
        body: {
          en: "Light and sound share the mathematics of waves, interference, and resonance, though their physical nature differs.",
          zh: "光与声共享波、干涉与共振的数学，尽管二者物理本质不同。"
        }
      }
    ]
  },

  'thermodynamics': {
    equation: 'η = 1 − T_c/T_h',
    equationNote: {
      en: "The best possible efficiency of a heat engine, set by its cold and hot temperatures T_c and T_h.",
      zh: "热机的最高效率由低温 T_c 与高温 T_h 决定。"
    },
    lede: {
      en: "The science of heat, work, and energy in systems described by bulk quantities like temperature and pressure, without tracking individual molecules. It answers which energy transformations are possible and which are forbidden. It explains why no engine can turn heat entirely into work.",
      zh: "研究用温度、压强等宏观量描述的系统中的热、功与能量，而不追踪单个分子。它回答哪些能量转化可行、哪些被禁止。它解释为何无论多么巧妙的热机都不能把热完全转化为功。"
    },
    concepts: [
      {
        mark: 'ΔU = Q − W',
        title: { en: "First law", zh: "第一定律" },
        body: {
          en: "Energy is conserved once heat is counted as a form of energy transfer; a system's internal energy changes only by heat added or work done.",
          zh: "把热计入能量传递后能量守恒；系统内能的改变只来自吸收的热和对外所做的功。"
        }
      },
      {
        mark: 'ΔS ≥ 0',
        title: { en: "Second law", zh: "第二定律" },
        body: {
          en: "The total entropy of an isolated system never decreases, which fixes a direction for time and forbids spontaneously turning ambient heat into useful work.",
          zh: "孤立系统的总熵永不减少，这为时间确定了方向，并禁止自发地把环境的热转化为有用的功。"
        }
      },
      {
        mark: 'T → 0',
        title: { en: "Absolute zero", zh: "绝对零度" },
        body: {
          en: "Temperature has a hard floor at absolute zero, which can be approached but never reached in a finite number of steps.",
          zh: "温度有一个硬下限，即绝对零度，可以逼近却无法在有限步骤内达到。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Silent about mechanism", zh: "不涉及机制" },
        body: {
          en: "Classical thermodynamics relates measurable quantities but says nothing about atoms or how fast a process runs; rates and microscopic causes need kinetics and statistical mechanics.",
          zh: "经典热力学联系可测量，却不谈原子，也不谈过程进行得多快；速率和微观成因需要动理学与统计力学。"
        }
      },
      {
        title: { en: "Equilibrium first", zh: "以平衡为前提" },
        body: {
          en: "Its cleanest statements assume systems near equilibrium. Far-from-equilibrium situations, like living cells or weather, extend the framework and are still being worked out.",
          zh: "其最清晰的结论假设系统接近平衡。远离平衡的情形，如活细胞或天气，是对该框架的扩展，仍在研究中。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=statistical',
        label: { en: "Statistical mechanics", zh: "统计力学" },
        body: {
          en: "Counting microscopic states explains where entropy and temperature come from.",
          zh: "对微观状态的计数解释了熵和温度从何而来。"
        }
      },
      {
        href: './field.html?id=fluids',
        label: { en: "Fluids", zh: "流体力学" },
        body: {
          en: "Heat engines and weather couple thermodynamics to moving fluids and convection.",
          zh: "热机与天气把热力学与流动、对流耦合在一起。"
        }
      },
      {
        href: './field.html?id=quantum-information',
        label: { en: "Information", zh: "信息" },
        body: {
          en: "Erasing information has a minimum energy cost, tying thermodynamics to computation.",
          zh: "擦除信息有最低能量代价，把热力学与计算联系起来。"
        }
      }
    ]
  },

  'electromagnetism': {
    equation: 'ℰ = −dΦ/dt',
    equationNote: {
      en: "A changing magnetic flux Φ through a loop drives a voltage ℰ around it.",
      zh: "穿过回路的磁通量 Φ 发生变化，会在回路中产生电动势 ℰ。"
    },
    lede: {
      en: "The study of electric charge, current, and the electric and magnetic fields they create. It answers how electricity and magnetism are two aspects of one interaction, revealed when a moving magnet was found to drive a current. It explains how a generator turns motion into electricity.",
      zh: "研究电荷、电流以及它们产生并响应的电场和磁场。它回答电与磁如何是同一相互作用的两个方面，这一点在发现运动的磁体能驱动电流时被揭示。它解释发电机和变压器如何把运动转化为电。"
    },
    concepts: [
      {
        mark: 'F = qE + qv×B',
        title: { en: "Lorentz force", zh: "洛伦兹力" },
        body: {
          en: "Fields are defined by the force they exert: an electric field pushes a charge along it, while a magnetic field deflects only a moving charge, sideways to its motion.",
          zh: "场由它施加的力定义：电场沿自身方向推动电荷，磁场只使运动的电荷发生侧向偏转。"
        }
      },
      {
        mark: '∇×E = −∂B/∂t',
        title: { en: "Induction", zh: "电磁感应" },
        body: {
          en: "A changing magnetic field creates a circulating electric field. This single fact underlies electric generators, transformers, and induction cooktops.",
          zh: "变化的磁场产生环绕的电场。这一事实是发电机、变压器和电磁炉的基础。"
        }
      },
      {
        mark: '∇·B = 0',
        title: { en: "No monopoles", zh: "没有磁单极子" },
        body: {
          en: "Magnetic field lines never begin or end; every magnet has both poles, and no isolated magnetic charge has ever been observed.",
          zh: "磁感线既不起始也不终止；每块磁体都有两极，从未观测到孤立的磁荷。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Not action at a distance", zh: "不是超距作用" },
        body: {
          en: "Faraday's field picture replaced instantaneous forces between distant charges. Influences travel through fields at finite speed, a point made precise later by Maxwell and relativity.",
          zh: "法拉第的场图像取代了远处电荷间的瞬时力。影响以有限速度通过场传播，这一点后来由麦克斯韦和相对论精确化。"
        }
      },
      {
        title: { en: "Classical fields only", zh: "只描述经典场" },
        body: {
          en: "This framework treats charge and field as continuous. It cannot explain photon-by-photon effects or the stability of atoms, which require quantum theory.",
          zh: "该框架把电荷和场当作连续量，无法解释逐个光子的效应或原子的稳定性，这些需要量子理论。"
        }
      }
    ],
    connections: [
      {
        href: './electrodynamics.html',
        label: { en: "Electrodynamics", zh: "电动力学" },
        body: {
          en: "Maxwell unified these separate laws and revealed light itself as an electromagnetic wave.",
          zh: "麦克斯韦统一了这些各自独立的定律，并揭示光本身就是电磁波。"
        }
      },
      {
        href: './field.html?id=plasma',
        label: { en: "Plasma physics", zh: "等离子体物理" },
        body: {
          en: "Ionized gas responds strongly to these fields, coupling matter and electromagnetism into one system.",
          zh: "电离气体对这些场强烈响应，把物质与电磁场耦合为一个系统。"
        }
      },
      {
        href: './field.html?id=geophysics',
        label: { en: "Geophysics", zh: "地球物理学" },
        body: {
          en: "Earth's magnetic field, generated by its moving molten core, is studied with these laws.",
          zh: "地球的磁场由其运动的熔融地核产生，正是用这些定律来研究。"
        }
      }
    ]
  },

  'statistical': {
    equation: 'S = k·log W',
    equationNote: {
      en: "Entropy S counts the number W of microscopic arrangements consistent with what we measure; k is Boltzmann's constant.",
      zh: "熵 S 衡量与宏观测量相容的微观状态数 W，k 为玻尔兹曼常数。"
    },
    lede: {
      en: "How the collective behavior of enormous numbers of particles gives rise to temperature, pressure, and entropy. It answers why bulk matter obeys simple laws even though its molecules move chaotically. It explains why heat flows from hot to cold as the most probable outcome, not a strict force.",
      zh: "研究极大量粒子的集体行为如何产生温度、压强和熵。它回答为何尽管分子运动杂乱，宏观物质仍服从简单规律。它解释热之所以从高温流向低温，是因为这是压倒性最可能的结果，而非某种严格的力。"
    },
    concepts: [
      {
        mark: 'P ∝ e^(−E/kT)',
        title: { en: "Boltzmann factor", zh: "玻尔兹曼因子" },
        body: {
          en: "In equilibrium at temperature T, a state's probability falls off exponentially with its energy, so higher-energy configurations are rarer but never quite forbidden.",
          zh: "在温度 T 的平衡态下，某状态的概率随其能量按指数衰减，因此高能组态更稀有，却从不完全被禁止。"
        }
      },
      {
        mark: '⟨E⟩ = (f/2)kT',
        title: { en: "Equipartition", zh: "能量均分" },
        body: {
          en: "Classically, thermal energy spreads evenly across each way a system can move, giving on average one-half kT per quadratic degree of freedom.",
          zh: "经典情形下，热能均匀分配到系统每一种运动方式，平均每个自由度分得二分之一 kT。"
        }
      },
      {
        mark: 'ΔE/E ∝ 1/√N',
        title: { en: "Why bulk is smooth", zh: "宏观为何平滑" },
        body: {
          en: "Relative fluctuations shrink as the number of particles grows, which is why a cup of water has a sharp, definite temperature despite molecular chaos.",
          zh: "相对涨落随粒子数增大而减小，因此尽管分子杂乱，一杯水仍具有确定而清晰的温度。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Entropy is not simply disorder", zh: "熵不等于混乱" },
        body: {
          en: "Calling entropy disorder is misleading; it counts accessible microstates. A structured crystal near absolute zero can have far lower entropy than a bland gas, however tidy either looks.",
          zh: "把熵称作混乱会引起误解；它计的是可及的微观状态数。接近绝对零度的有序晶体，其熵可远低于平淡的气体，与看上去是否整洁无关。"
        }
      },
      {
        title: { en: "Equilibrium assumptions", zh: "平衡态假设" },
        body: {
          en: "The most powerful results assume a system has settled into equilibrium. Systems driven far from it, or trapped in glasses, need additional ideas and are actively researched.",
          zh: "最强的结论都假设系统已趋于平衡。被强烈驱动远离平衡、或困在玻璃态中的系统，需要额外的思想，仍在活跃研究中。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=thermodynamics',
        label: { en: "Thermodynamics", zh: "热力学" },
        body: {
          en: "Statistical mechanics supplies the microscopic foundation for thermodynamics' bulk laws.",
          zh: "统计力学为热力学的宏观定律提供了微观基础。"
        }
      },
      {
        href: './field.html?id=condensed',
        label: { en: "Condensed matter", zh: "凝聚态物理" },
        body: {
          en: "Phase transitions like melting and magnetism emerge from the statistics of many interacting particles.",
          zh: "熔化、磁性等相变从大量相互作用粒子的统计中涌现。"
        }
      },
      {
        href: './field.html?id=quantum-theory',
        label: { en: "Quantum theory", zh: "量子理论" },
        body: {
          en: "Applying these methods to light led Planck to quantize energy and launch quantum physics.",
          zh: "把这些方法用于光，使普朗克将能量量子化，开启了量子物理。"
        }
      }
    ]
  },

  'geophysics': {
    equation: 'v_P = √((K + 4μ/3)/ρ)',
    equationNote: {
      en: "A seismic pressure wave's speed depends on the rock's stiffness (K, μ) and density ρ.",
      zh: "地震纵波的速度取决于岩石的刚度（体积模量 K、剪切模量 μ）与密度 ρ。"
    },
    lede: {
      en: "The physics of the Earth and other planets, using seismic waves, gravity, heat, and magnetism to study interiors no drill can reach. It answers what our planet is made of and how it moves. It explains how the timing of earthquake waves revealed a liquid outer core and a solid inner one.",
      zh: "研究地球和其他行星的物理，用地震波、重力、热流和磁性来探测钻头无法抵达的内部。它回答我们脚下的行星由什么构成、如何运动。它解释地震波到达的时间如何揭示出液态外核和固态内核。"
    },
    concepts: [
      {
        mark: 'P then S',
        title: { en: "Two wave types", zh: "两类地震波" },
        body: {
          en: "Earthquakes send fast compressional P-waves and slower shear S-waves. Because S-waves cannot pass through liquid, their shadow zone exposed the molten outer core.",
          zh: "地震发出快速的纵波（P 波）和较慢的横波（S 波）。由于横波不能穿过液体，其阴影区暴露了熔融的外核。"
        }
      },
      {
        mark: 'g = GM/r²',
        title: { en: "Gravity mapping", zh: "重力测绘" },
        body: {
          en: "Tiny local variations in surface gravity reveal buried density differences, from ore bodies and oil basins to the thickness of the crust.",
          zh: "地表重力的微小局部变化揭示地下的密度差异，从矿体、含油盆地到地壳厚度。"
        }
      },
      {
        mark: 'reversals',
        title: { en: "Magnetic record", zh: "磁性记录" },
        body: {
          en: "The seafloor preserves alternating magnetic stripes as new crust freezes; their symmetry about ocean ridges became key evidence for plate tectonics.",
          zh: "新地壳凝固时，海底保存下交替的磁条带；它们关于洋中脊的对称性成为板块构造的关键证据。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Inference, not sight", zh: "靠推断而非直视" },
        body: {
          en: "The deep Earth is never seen directly. Interior models are reconstructed from surface signals and can be ambiguous, since different structures sometimes fit the same data.",
          zh: "深部地球从未被直接看到。内部模型由地表信号重建，可能存在多解，因为不同结构有时符合同一组数据。"
        }
      },
      {
        title: { en: "Prediction has limits", zh: "预测有其限度" },
        body: {
          en: "Physics explains how faults store and release stress, but the crust's complexity means the exact time of a large earthquake cannot yet be predicted, only its long-run probability.",
          zh: "物理能解释断层如何积累和释放应力，但地壳的复杂性使我们尚无法预测大地震的确切时间，只能给出长期概率。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=acoustics',
        label: { en: "Acoustics", zh: "声学" },
        body: {
          en: "Seismic waves obey the same wave physics as sound, refracting and reflecting at layer boundaries.",
          zh: "地震波遵循与声音相同的波动物理，在层界面处折射和反射。"
        }
      },
      {
        href: './field.html?id=electromagnetism',
        label: { en: "Electromagnetism", zh: "电磁学" },
        body: {
          en: "Earth's magnetic field, generated by its churning liquid core, is measured and modeled with these laws.",
          zh: "地球磁场由其翻涌的液态外核产生，用这些定律来测量和建模。"
        }
      },
      {
        href: './field.html?id=fluids',
        label: { en: "Fluids", zh: "流体力学" },
        body: {
          en: "Slow convection in the mantle and core is a fluid-mechanics problem driving plate motion and the geodynamo.",
          zh: "地幔和地核中缓慢的对流是驱动板块运动和地磁发电机的流体力学问题。"
        }
      }
    ]
  },

  'quantum-theory': {
    equation: 'E = hν',
    equationNote: {
      en: "The energy E carried by light arrives in packets set by its frequency ν and Planck's constant h.",
      zh: "光携带的能量 E 以离散份额出现，由频率 ν 与普朗克常数 h 决定。"
    },
    lede: {
      en: "The early discovery, around 1900, that energy is exchanged in discrete packets rather than continuously. It answered why hot objects do not radiate infinite energy at short wavelengths, a classical failure once called the ultraviolet catastrophe. It explains why heated metal glows red before white.",
      zh: "指约 1900 年发现的能量以离散份额而非连续方式交换的观念。它回答了炽热物体为何不会在短波处辐射出无穷能量，这一经典物理的失败曾被称为紫外灾难。它解释金属受热时为何先发红光再转白光。"
    },
    concepts: [
      {
        mark: 'E = nhν',
        title: { en: "Energy quanta", zh: "能量量子" },
        body: {
          en: "Planck fit the black-body spectrum by assuming oscillators exchange energy only in whole multiples of hν, a mathematical step whose physical meaning took years to accept.",
          zh: "普朗克为拟合黑体谱，假设振子只以 hν 的整数倍交换能量；这一数学步骤的物理含义经过多年才被接受。"
        }
      },
      {
        mark: 'K = hν − φ',
        title: { en: "Photoelectric effect", zh: "光电效应" },
        body: {
          en: "Einstein proposed that light itself arrives as quanta, explaining why light below a threshold frequency ejects no electrons no matter how bright it is.",
          zh: "爱因斯坦提出光本身以量子的形式到达，从而解释了为何低于阈值频率的光无论多亮都打不出电子。"
        }
      },
      {
        mark: 'h ≈ 6.6e−34 J·s',
        title: { en: "A new constant", zh: "一个新常数" },
        body: {
          en: "Planck's constant sets the scale at which quantization matters; it is so small that everyday energy exchange looks perfectly continuous.",
          zh: "普朗克常数设定量子化起作用的尺度；它极其微小，以致日常的能量交换看起来完全连续。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "An unfinished theory", zh: "尚未完成的理论" },
        body: {
          en: "The 1900 quantum idea was a bold patch on classical physics, not a complete mechanics. A consistent framework with amplitudes and operators arrived only in the 1920s.",
          zh: "1900 年的量子观念是对经典物理的大胆修补，而非完整的力学。含振幅和算符的自洽框架直到 1920 年代才出现。"
        }
      },
      {
        title: { en: "Not tiny lumps of light everywhere", zh: "并非到处都是光的小颗粒" },
        body: {
          en: "Quantization concerns how light is emitted and absorbed. Between those events light still propagates as a wave, so photons are not little bullets flying along fixed paths.",
          zh: "量子化关乎光如何被发射和吸收。在这两个事件之间，光仍以波的方式传播，因此光子不是沿固定轨迹飞行的小子弹。"
        }
      }
    ],
    connections: [
      {
        href: './quantum.html',
        label: { en: "Quantum mechanics", zh: "量子力学" },
        body: {
          en: "The full theory of amplitudes and measurement that grew out of these first quantum clues.",
          zh: "由这些最初的量子线索发展出的、关于振幅与测量的完整理论。"
        }
      },
      {
        href: './field.html?id=statistical',
        label: { en: "Statistical mechanics", zh: "统计力学" },
        body: {
          en: "Planck reached quantization by counting states in the thermodynamics of radiation.",
          zh: "普朗克正是通过对辐射热力学中状态的计数才得到量子化。"
        }
      },
      {
        href: './field.html?id=astronomy-optics',
        label: { en: "Spectroscopy", zh: "光谱学" },
        body: {
          en: "Quantized atomic energy levels produce the spectral lines astronomers read in starlight.",
          zh: "量子化的原子能级产生天文学家在星光中读到的谱线。"
        }
      }
    ]
  },

  'nuclear': {
    equation: 'E = Δm·c²',
    equationNote: {
      en: "The energy released in a nuclear reaction equals the lost mass Δm times the speed of light squared.",
      zh: "核反应释放的能量等于损失的质量 Δm 乘以光速的平方。"
    },
    lede: {
      en: "The study of atomic nuclei: how protons and neutrons bind, transform, and release energy. It answers what holds a nucleus together against electrical repulsion and why some nuclei decay. It explains why the Sun shines, why some elements are radioactive, and how fission and fusion release energy.",
      zh: "研究原子核：质子和中子如何结合、转变并释放能量。它回答是什么克服电荷斥力把原子核束缚在一起，以及为何有些核会衰变。它解释太阳为何发光、某些元素为何具有放射性，以及裂变和聚变如何释放能量。"
    },
    concepts: [
      {
        mark: 'N = N₀ e^(−λt)',
        title: { en: "Radioactive decay", zh: "放射性衰变" },
        body: {
          en: "Unstable nuclei decay at random, but a huge population thins on a fixed timescale, the half-life, which underlies both radiometric dating and medical tracers.",
          zh: "不稳定的核随机衰变，但庞大的群体会按固定的时间尺度即半衰期减少，这是放射性测年和医用示踪剂的基础。"
        }
      },
      {
        mark: 'peak near iron',
        title: { en: "Binding energy curve", zh: "结合能曲线" },
        body: {
          en: "Energy per nucleon is greatest near iron, so fusing light nuclei or splitting heavy ones both release energy, while iron itself yields almost none.",
          zh: "每核子结合能在铁附近最大，因此聚合轻核或裂开重核都会释放能量，而铁本身几乎不再释放。"
        }
      },
      {
        mark: 'strong ≫ EM',
        title: { en: "The strong force", zh: "强相互作用" },
        body: {
          en: "A short-range nuclear force, far stronger than electrical repulsion but reaching only across the nucleus, is what binds protons and neutrons together.",
          zh: "一种短程的核力，远强于电荷斥力，但只作用于原子核尺度之内，正是它把质子和中子束缚在一起。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Not a solar-system atom", zh: "不是太阳系式的原子" },
        body: {
          en: "Protons and neutrons do not orbit like planets, and electrons do not circle the nucleus on tracks. The nucleus is a dense quantum bound state, best described by probability, not orbits.",
          zh: "质子和中子并不像行星那样绕行，电子也不沿轨道绕核。原子核是致密的量子束缚态，用概率而非轨道来描述最恰当。"
        }
      },
      {
        title: { en: "Models, not first principles", zh: "靠模型而非第一性原理" },
        body: {
          en: "Nuclei are too complex to solve exactly from the underlying strong interaction, so nuclear physics relies on effective models, each accurate only in a limited domain.",
          zh: "原子核过于复杂，无法从底层强相互作用精确求解，因此核物理依赖各种有效模型，每个只在有限范围内准确。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=particle',
        label: { en: "Particle physics", zh: "粒子物理" },
        body: {
          en: "Looking inside protons and neutrons reveals the quarks and forces beneath nuclear structure.",
          zh: "深入质子和中子内部，揭示核结构之下的夸克与作用力。"
        }
      },
      {
        href: './astrophysics.html',
        label: { en: "Astrophysics", zh: "天体物理" },
        body: {
          en: "Fusion in stars forges the elements and powers starlight, a nuclear process on a cosmic scale.",
          zh: "恒星中的聚变锻造元素并驱动星光，是宇宙尺度上的核过程。"
        }
      },
      {
        href: './field.html?id=quantum-theory',
        label: { en: "Quantum theory", zh: "量子理论" },
        body: {
          en: "Alpha decay and nuclear stability only make sense through quantum tunnelling and energy levels.",
          zh: "α 衰变和核稳定性只有通过量子隧穿和能级才能理解。"
        }
      }
    ]
  },

  'condensed': {
    equation: 'ψ = e^(ik·r) u(r)',
    equationNote: {
      en: "In a crystal, an electron's wavefunction is a plane wave modulated by the lattice's periodic pattern u(r).",
      zh: "在晶体中，电子波函数是平面波与晶格周期函数 u(r) 的乘积。"
    },
    lede: {
      en: "The physics of matter in bulk, where vast numbers of atoms and electrons act together. It asks how collective behavior produces properties no single atom has, like rigidity, magnetism, or conduction. It explains why some materials conduct, others insulate, and a few superconduct.",
      zh: "研究大量原子和电子共同作用的宏观物质，尤其是固体和液体。它回答集体行为如何产生单个原子所没有的性质，如刚性、磁性或导电能力。它解释为何有些材料导电、有些绝缘，而少数能超导。"
    },
    concepts: [
      {
        mark: 'bands & gaps',
        title: { en: "Energy bands", zh: "能带" },
        body: {
          en: "In a crystal, allowed electron energies broaden into bands separated by gaps. Whether the highest occupied band is full or partly filled decides metal versus insulator.",
          zh: "在晶体中，允许的电子能量展宽为能带，能带之间有能隙。最高的被占据能带是填满还是部分填充，决定了是金属还是绝缘体。"
        }
      },
      {
        mark: 'quasiparticles',
        title: { en: "Emergent particles", zh: "涌现的粒子" },
        body: {
          en: "Collective motions behave like new particles: phonons carry sound and heat, and electrons dressed by their surroundings move as if they had a different mass.",
          zh: "集体运动表现得像新粒子：声子输运声与热，而受周围环境影响的电子运动起来仿佛具有不同的有效质量。"
        }
      },
      {
        mark: 'R = 0',
        title: { en: "Superconductivity", zh: "超导" },
        body: {
          en: "Below a critical temperature some materials lose all electrical resistance and expel magnetic fields, a macroscopic quantum state of paired electrons.",
          zh: "低于临界温度时，某些材料失去全部电阻并排斥磁场，是电子配对形成的宏观量子态。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Emergence over reduction", zh: "涌现胜过还原" },
        body: {
          en: "Knowing the laws for one electron does not reveal what trillions will do together. Phases like superconductivity are collective and cannot be read off from the constituents alone.",
          zh: "知道单个电子的规律，并不能推出万亿个电子共同会做什么。超导等相是集体现象，无法仅从组分读出。"
        }
      },
      {
        title: { en: "Strong correlations resist us", zh: "强关联仍是难题" },
        body: {
          en: "When electron interactions are strong, as in high-temperature superconductors, standard methods fail and there is still no complete, predictive theory.",
          zh: "当电子相互作用很强时，如高温超导体，常规方法失效，至今仍没有完整且有预测力的理论。"
        }
      }
    ],
    connections: [
      {
        href: './quantum.html',
        label: { en: "Quantum mechanics", zh: "量子力学" },
        body: {
          en: "Bands, spin, and pairing all rest on quantum rules applied to many particles at once.",
          zh: "能带、自旋和配对都建立在把量子规则同时用于大量粒子之上。"
        }
      },
      {
        href: './field.html?id=statistical',
        label: { en: "Statistical mechanics", zh: "统计力学" },
        body: {
          en: "Phase transitions and thermal properties come from the statistics of many interacting particles.",
          zh: "相变和热学性质来自大量相互作用粒子的统计。"
        }
      },
      {
        href: './field.html?id=soft-matter',
        label: { en: "Soft matter", zh: "软物质" },
        body: {
          en: "Extends condensed-matter thinking to squishy, disordered materials like gels and liquid crystals.",
          zh: "把凝聚态的思路推广到凝胶、液晶等柔软无序的材料。"
        }
      }
    ]
  },

  'particle': {
    equation: '(iγ^μ ∂_μ − m)ψ = 0',
    equationNote: {
      en: "Dirac's relativistic wave equation for the electron, which predicted antimatter.",
      zh: "狄拉克描述电子的相对论性波动方程，它预言了反物质。"
    },
    lede: {
      en: "The search for the most elementary constituents of matter and the forces between them, probed by colliding particles and reading the debris. It asks what is truly fundamental. It explains how the positron, the electron's antimatter twin, was found in cosmic rays in 1932.",
      zh: "寻找物质最基本的组分及其间的作用力，方法是让粒子相互碰撞并解读碎片。它回答什么才是真正基本的、什么是由更小的部件构成的。它解释了电子的反物质孪生兄弟正电子如何于 1932 年在宇宙线中被发现。"
    },
    concepts: [
      {
        mark: 'e⁻ + e⁺ → γγ',
        title: { en: "Antimatter", zh: "反物质" },
        body: {
          en: "Every matter particle has an antiparticle of opposite charge. When the two meet they annihilate into energy, usually high-energy photons.",
          zh: "每种物质粒子都有一个电荷相反的反粒子。二者相遇会湮灭为能量，通常是高能光子。"
        }
      },
      {
        mark: 'tracks + decays',
        title: { en: "Detecting the unseen", zh: "探测看不见的东西" },
        body: {
          en: "Particles are inferred, not photographed. Detectors record curved tracks, energy deposits, and decay products, then reconstruct what passed through and how it interacted.",
          zh: "粒子是被推断而非被拍到的。探测器记录弯曲的径迹、能量沉积和衰变产物，再重建出经过的是什么、如何相互作用。"
        }
      },
      {
        mark: '3 generations',
        title: { en: "Families of matter", zh: "物质的世代" },
        body: {
          en: "The known matter particles come in three repeating generations of increasing mass; ordinary matter uses only the lightest, and why there are three is unknown.",
          zh: "已知的物质粒子分为质量递增、结构重复的三代；普通物质只用到最轻的一代，为何恰是三代尚不清楚。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Particles are field excitations", zh: "粒子是场的激发" },
        body: {
          en: "At this depth a particle is best understood not as a tiny ball but as a localized excitation of a quantum field, a picture made precise by the Standard Model.",
          zh: "在这一深度，粒子最好不要理解为小球，而是弥漫全空间的量子场的局域激发，标准模型使这一图像变得精确。"
        }
      },
      {
        title: { en: "Known unknowns remain", zh: "仍有已知的未知" },
        body: {
          en: "The current framework says nothing about what dark matter is, why matter outweighs antimatter in the cosmos, or how gravity fits in.",
          zh: "现有框架无法说明暗物质是什么、宇宙中物质为何多于反物质，也无法说明引力如何纳入其中。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=standard-model',
        label: { en: "Standard Model", zh: "标准模型" },
        body: {
          en: "The quantum field theory that organizes all known particles and three of the four forces.",
          zh: "把所有已知粒子和四种作用力中的三种加以组织的量子场论。"
        }
      },
      {
        href: './field.html?id=nuclear',
        label: { en: "Nuclear physics", zh: "核物理" },
        body: {
          en: "Nuclei are where the particle content of protons and neutrons first showed itself.",
          zh: "原子核正是质子和中子的粒子内涵最初显露之处。"
        }
      },
      {
        href: './relativity.html',
        label: { en: "Relativity", zh: "相对论" },
        body: {
          en: "Combining quantum mechanics with special relativity is what forced antimatter into the theory.",
          zh: "把量子力学与狭义相对论结合，正是这一步迫使反物质进入理论。"
        }
      }
    ]
  },

  'plasma': {
    equation: 'v_A = B/√(μ₀ρ)',
    equationNote: {
      en: "The speed of magnetic (Alfven) waves in a plasma, set by magnetic field B and mass density ρ.",
      zh: "等离子体中磁流体波（阿尔芬波）的速度，由磁场 B 与质量密度 ρ 决定。"
    },
    lede: {
      en: "The physics of ionized gas, where atoms split into free electrons and ions that respond collectively to electric and magnetic fields. It asks how charged matter and fields evolve as one system. It explains the aurora, the solar wind, and confinement inside a fusion reactor.",
      zh: "研究电离气体，其中原子被拆成自由的电子和离子，并对电场和磁场作出集体响应。它回答带电物质与场如何作为一个耦合系统一起演化。它解释从极光、太阳风到聚变反应堆内约束难题的种种现象。"
    },
    concepts: [
      {
        mark: 'quasineutral',
        title: { en: "Collective response", zh: "集体响应" },
        body: {
          en: "A plasma keeps its positive and negative charges nearly balanced over large scales; disturb it and the whole medium responds together, screening fields and oscillating.",
          zh: "等离子体在大尺度上使正负电荷几乎保持平衡；一旦被扰动，整个介质会共同响应，屏蔽电场并发生振荡。"
        }
      },
      {
        mark: 'frozen-in flux',
        title: { en: "Frozen-in fields", zh: "磁冻结" },
        body: {
          en: "In a well-conducting plasma, magnetic field lines move with the fluid as if attached to it, which shapes solar loops, the solar wind, and tokamak confinement.",
          zh: "在良导的等离子体中，磁感线随流体一起运动，仿佛被粘住，这塑造了太阳磁环、太阳风和托卡马克约束。"
        }
      },
      {
        mark: 'stars & gas',
        title: { en: "A common state", zh: "一种常见状态" },
        body: {
          en: "Plasma is the most common state of ordinary visible matter, making up stars and interstellar gas, though it is rare at Earth's surface.",
          zh: "等离子体是普通可见物质中最常见的状态，构成恒星和星际气体，尽管在地球表面很罕见。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Not most of the universe", zh: "并非宇宙的大部分" },
        body: {
          en: "Plasma dominates ordinary visible matter, but that ordinary matter is only a few percent of the cosmos; dark matter and dark energy make up the rest and are not plasma.",
          zh: "等离子体在普通可见物质中占主导，但普通物质只占宇宙的百分之几；其余是暗物质和暗能量，它们都不是等离子体。"
        }
      },
      {
        title: { en: "Many regimes, no single model", zh: "多种区域，没有单一模型" },
        body: {
          en: "Plasmas span enormous ranges of density and temperature. No one equation covers them all; fluid, kinetic, and particle models each apply only in part.",
          zh: "等离子体的密度和温度跨越极大范围。没有单一方程能涵盖全部；流体、动理学和粒子模型各自只适用于一部分。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=electromagnetism',
        label: { en: "Electromagnetism", zh: "电磁学" },
        body: {
          en: "Plasma behavior is electromagnetism and fluid motion solved together.",
          zh: "等离子体的行为是电磁学与流体运动一并求解的结果。"
        }
      },
      {
        href: './astrophysics.html',
        label: { en: "Astrophysics", zh: "天体物理" },
        body: {
          en: "Stars, nebulae, and the solar wind are plasmas, making this the physics of most glowing matter in the sky.",
          zh: "恒星、星云和太阳风都是等离子体，因此这是天空中大部分发光物质的物理。"
        }
      },
      {
        href: './field.html?id=fluids',
        label: { en: "Fluid mechanics", zh: "流体力学" },
        body: {
          en: "Magnetohydrodynamics extends fluid equations to electrically conducting matter.",
          zh: "磁流体力学把流体方程推广到导电物质。"
        }
      }
    ]
  },

  'biophysics': {
    equation: 'V = (RT/zF)·ln(c_o/c_i)',
    equationNote: {
      en: "A membrane voltage V set by the ratio of ion concentrations outside (c_o) and inside (c_i) a cell.",
      zh: "细胞膜电位 V 由膜外与膜内离子浓度之比决定。"
    },
    lede: {
      en: "The use of physics to measure and model living systems, from single molecules to whole cells. It asks how mechanics, thermodynamics, and electricity operate inside organisms without anything beyond them. It explains how the double helix of DNA was read from X-ray diffraction in the 1950s.",
      zh: "用物理来测量和建模生命系统，从单个分子到细胞和神经信号。它回答力学、热力学和电学定律如何在生物体内运作，而无需诉诸任何超出物理的东西。它解释了 1950 年代初 DNA 的双螺旋形状如何从 X 射线衍射图样中读出。"
    },
    concepts: [
      {
        mark: 'F = 6πηrv',
        title: { en: "Life at low Reynolds", zh: "低雷诺数下的生命" },
        body: {
          en: "For a swimming bacterium, water feels thick and viscosity dominates inertia, so it cannot coast and must use non-reciprocal strokes to move.",
          zh: "对一个游动的细菌而言，水显得黏稠、黏性压过惯性，因此它无法滑行，必须靠非往复的划动才能前进。"
        }
      },
      {
        mark: 'ATP → work',
        title: { en: "Molecular machines", zh: "分子机器" },
        body: {
          en: "Proteins act as tiny motors and pumps, converting chemical energy into directed motion and using thermal jostling rather than fighting it.",
          zh: "蛋白质如同微小的马达和泵，把化学能转化为定向运动，并利用热扰动而不是与之对抗。"
        }
      },
      {
        mark: 'ΔG < 0',
        title: { en: "Energy and order", zh: "能量与信息" },
        body: {
          en: "Living order is maintained by a constant throughput of energy and does not violate the second law, since organisms export entropy to their surroundings.",
          zh: "生命的有序靠持续的能量流维持，并不违反第二定律，因为生物体把熵排放到周围环境。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Warm, wet, and noisy", zh: "温暖、潮湿而嘈杂" },
        body: {
          en: "Proposed large-scale quantum effects in biology remain mostly unproven. At body temperature, molecular collisions destroy fragile quantum coherence very quickly, so classical physics explains most biology.",
          zh: "所谓生物中的大尺度量子效应大多尚未证实。在体温下，分子碰撞会很快摧毁脆弱的量子相干，因此经典物理能解释大多数生物学现象。"
        }
      },
      {
        title: { en: "Physics informs, not replaces", zh: "物理是补充而非替代" },
        body: {
          en: "Physical models capture forces and energetics but rarely the full complexity of evolved, regulated systems, where chemistry and biology carry much of the story.",
          zh: "物理模型能刻画力和能量，却很少能涵盖经过演化、受调控的系统的全部复杂性，其中化学和生物学承担了大部分内容。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=soft-matter',
        label: { en: "Soft matter", zh: "软物质" },
        body: {
          en: "Membranes, filaments, and gels inside cells are classic soft, fluctuating materials.",
          zh: "细胞内的膜、丝和凝胶是典型的柔软、涨落的材料。"
        }
      },
      {
        href: './field.html?id=thermodynamics',
        label: { en: "Thermodynamics", zh: "热力学" },
        body: {
          en: "Life runs on energy conversion and stays ordered by exporting entropy, squarely within thermodynamic law.",
          zh: "生命依靠能量转化，并通过排放熵来维持有序，完全在热力学定律之内。"
        }
      },
      {
        href: './field.html?id=fluids',
        label: { en: "Fluids", zh: "流体力学" },
        body: {
          en: "Swimming cells and blood flow are fluid mechanics in a low-inertia regime.",
          zh: "游动的细胞和血液流动是低惯性区域中的流体力学。"
        }
      }
    ]
  },

  'nonlinear': {
    equation: 'δ(t) ≈ δ₀ e^(λt)',
    equationNote: {
      en: "Nearby states separate exponentially fast when the Lyapunov exponent λ is positive; that is chaos.",
      zh: "当李雅普诺夫指数 λ 为正时，邻近状态以指数速度分离，这就是混沌。"
    },
    lede: {
      en: "The study of systems whose parts influence each other in non-additive ways, so small causes can have outsized effects. It asks why some simple, deterministic rules produce behavior that looks random and defies forecasting. It explains why weather is predictable for days but not months.",
      zh: "研究各部分以非叠加方式相互影响的系统，因而微小的原因能产生不成比例的后果。它回答为何某些简单而完全确定的规律会产生看似随机、无法长期预报的行为。它解释了天气为何可预报数天却无法预报数月。"
    },
    concepts: [
      {
        mark: 'sensitive',
        title: { en: "Sensitive dependence", zh: "初值敏感性" },
        body: {
          en: "Tiny differences in starting conditions grow exponentially, so a system can follow exact rules yet be impossible to forecast far ahead. Deterministic does not mean predictable.",
          zh: "初始条件的微小差异会指数式放大，因此系统可以遵循确切规律却无法长期预报。确定性并不保证可预测性。"
        }
      },
      {
        mark: 'period doubling',
        title: { en: "Routes to chaos", zh: "通向混沌的道路" },
        body: {
          en: "As a control parameter changes, orbits can split, doubling their period again and again until motion becomes chaotic, a pattern shared by many unrelated systems.",
          zh: "随控制参数改变，轨道会分裂、周期一再倍增，直至运动变为混沌，这一模式为许多互不相干的系统所共有。"
        }
      },
      {
        mark: 'strange attractor',
        title: { en: "Order within chaos", zh: "混沌中的秩序" },
        body: {
          en: "Chaotic trajectories never repeat yet stay confined to an intricate fractal set, so the motion is bounded and structured even though it is unpredictable.",
          zh: "混沌轨迹从不重复，却始终局限在一个精细的分形集合上，因此运动虽不可预测，仍是有界而有结构的。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Chaos is not randomness", zh: "混沌不是随机" },
        body: {
          en: "A chaotic system has no random input; its future is fixed by its present. The limit is practical knowledge, since we can never specify the present with infinite precision.",
          zh: "混沌系统没有随机输入；其未来由现在完全确定。局限在于实际认知，因为我们永远无法以无穷精度确定现在。"
        }
      },
      {
        title: { en: "Short-horizon prediction survives", zh: "短期预报依然有效" },
        body: {
          en: "Sensitive dependence caps how far ahead forecasts hold, but near-term prediction and statistical description remain fully possible, as daily weather shows.",
          zh: "初值敏感性限制了预报能提前多久，但近期预报和统计描述仍完全可行，正如每日天气所示。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=fluids',
        label: { en: "Fluid turbulence", zh: "流体湍流" },
        body: {
          en: "Turbulent flow is a leading real-world example of deterministic chaos.",
          zh: "湍流是确定性混沌在现实世界中的典型例子。"
        }
      },
      {
        href: './newtonian.html',
        label: { en: "Newtonian mechanics", zh: "牛顿力学" },
        body: {
          en: "Even simple mechanical systems like a driven pendulum or three gravitating bodies can be chaotic.",
          zh: "即便是受迫摆或三体引力这样简单的力学系统也可能出现混沌。"
        }
      },
      {
        href: './field.html?id=biophysics',
        label: { en: "Biophysics", zh: "生物物理学" },
        body: {
          en: "Heart rhythms and neural firing show nonlinear dynamics, including healthy and pathological chaos.",
          zh: "心律和神经放电表现出非线性动力学，包括健康和病理性的混沌。"
        }
      }
    ]
  },

  'standard-model': {
    equation: 'SU(3)×SU(2)×U(1)',
    equationNote: {
      en: "The symmetry groups whose gauge fields give the strong, weak, and electromagnetic forces.",
      zh: "标准模型的规范对称群，其规范场分别给出强、弱和电磁相互作用。"
    },
    lede: {
      en: "The current best theory of the elementary particles and three of nature's four forces, built from quantum fields and symmetry principles. It asks what everything is made of and how the strong, weak, and electromagnetic interactions arise. It predicted the Higgs boson, later found in 2012.",
      zh: "关于基本粒子以及自然界四种作用力中三种的当前最佳理论，由量子场和对称性原理构建。它回答万物由什么构成，以及强、弱和电磁相互作用如何产生。它预言了希格斯玻色子，后者于 2012 年被发现。"
    },
    concepts: [
      {
        mark: 'field quanta',
        title: { en: "Fields are fundamental", zh: "场是基本的" },
        body: {
          en: "Each particle type is a quantized ripple in a field filling all of space. What we call an electron is a localized excitation of the electron field.",
          zh: "每一种粒子都是弥漫全空间的场的量子化涟漪。我们所说的电子，就是电子场的一个局域激发。"
        }
      },
      {
        mark: 'gauge symmetry',
        title: { en: "Gauge principle", zh: "规范原理" },
        body: {
          en: "Requiring the equations to respect certain local symmetries forces the existence of force-carrying particles: photons, gluons, and the W and Z bosons.",
          zh: "要求方程遵从某些局域对称性，就迫使传递作用力的粒子存在：光子、胶子以及 W 和 Z 玻色子。"
        }
      },
      {
        mark: 'H gives mass',
        title: { en: "Higgs mechanism", zh: "希格斯机制" },
        body: {
          en: "A field filling space resists the motion of certain particles, and that resistance is what we measure as their mass; its excitation, the Higgs boson, was confirmed in 2012.",
          zh: "一个弥漫空间的场会阻滞某些粒子，这种阻滞正是我们测到的质量；其激发即希格斯玻色子，已于 2012 年确认。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Gravity is missing", zh: "缺少引力" },
        body: {
          en: "The Standard Model covers three forces but not gravity. Combining it with general relativity into a quantum theory of gravity is unsolved.",
          zh: "标准模型涵盖三种作用力，却不含引力。把它与广义相对论结合为量子引力理论，仍未解决。"
        }
      },
      {
        title: { en: "Not a theory of everything", zh: "不是万物之理" },
        body: {
          en: "It does not explain dark matter, dark energy, the origin of neutrino masses, or the matter-antimatter imbalance, so it is known to be incomplete despite its precision.",
          zh: "它不能解释暗物质、暗能量、中微子质量的来源或物质与反物质的不对称，因此尽管精确，仍是已知不完整的。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=particle',
        label: { en: "Particle physics", zh: "粒子物理" },
        body: {
          en: "The experimental program that tests and measures the Standard Model's predictions.",
          zh: "对标准模型的预言进行检验和测量的实验计划。"
        }
      },
      {
        href: './quantum.html',
        label: { en: "Quantum mechanics", zh: "量子力学" },
        body: {
          en: "Quantum field theory extends quantum rules to fields and special relativity.",
          zh: "量子场论把量子规则推广到场和狭义相对论。"
        }
      },
      {
        href: '../big-bang/index.html',
        label: { en: "Early universe", zh: "早期宇宙" },
        body: {
          en: "Standard-Model physics governs the hot particle soup of the first moments after the Big Bang.",
          zh: "标准模型物理支配着大爆炸后最初时刻炽热的粒子汤。"
        }
      }
    ]
  },

  'quantum-information': {
    equation: '|ψ⟩ = α|0⟩ + β|1⟩',
    equationNote: {
      en: "A quantum bit can be any superposition of 0 and 1, with complex weights α and β.",
      zh: "量子比特可以是 0 与 1 的任意叠加，α 与 β 为复振幅。"
    },
    lede: {
      en: "The study of how information behaves when it is stored and processed in quantum systems. It asks what new forms of computing, communication, and cryptography become possible once bits can superpose and entangle. It explains why an unknown quantum state cannot be perfectly copied.",
      zh: "研究信息在量子系统中存储和处理时的行为。它回答一旦比特能处于叠加并发生纠缠，会带来哪些新的计算、通信和密码方式。它解释了为何未知的量子态无法被完美复制。"
    },
    concepts: [
      {
        mark: 'entanglement',
        title: { en: "Correlations, no signal", zh: "无法传信的关联" },
        body: {
          en: "Entangled particles show linked measurement results stronger than any classical correlation, yet each outcome is individually random and carries no usable message on its own.",
          zh: "纠缠粒子的测量结果彼此关联，强于任何经典关联，但单个结果本身随机，独立看不携带任何可用信息。"
        }
      },
      {
        mark: 'no-cloning',
        title: { en: "Unclonable states", zh: "不可克隆" },
        body: {
          en: "An unknown quantum state cannot be copied exactly. This limits some tasks but also makes certain eavesdropping detectable, the basis of quantum key distribution.",
          zh: "未知的量子态无法被精确复制。这限制了某些任务，却也使某些窃听可被察觉，成为量子密钥分发的基础。"
        }
      },
      {
        mark: 'error correction',
        title: { en: "Fragile but fixable", zh: "脆弱但可纠正" },
        body: {
          en: "Qubits lose their quantum state through decoherence, but clever error-correcting codes can protect information spread across many physical qubits.",
          zh: "量子比特会因退相干而失去量子态，但巧妙的纠错码能把信息保护在许多物理比特之上。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "No faster-than-light signalling", zh: "不能超光速传信" },
        body: {
          en: "Entanglement produces correlated outcomes but cannot transmit information faster than light. The local results look random until compared over an ordinary, slower-than-light channel.",
          zh: "纠缠产生关联的结果，却不能以超过光速传递信息。在通过普通的、慢于光速的信道比对之前，各处的结果看起来都是随机的。"
        }
      },
      {
        title: { en: "Not universally faster", zh: "并非处处更快" },
        body: {
          en: "Quantum computers help only for specific problems with the right structure. For most everyday computing they offer no speedup, and large fault-tolerant machines remain hard to build.",
          zh: "量子计算机只对具有合适结构的特定问题有帮助。对大多数日常计算并无加速，而大型容错机器仍很难建造。"
        }
      }
    ],
    connections: [
      {
        href: './quantum.html',
        label: { en: "Quantum mechanics", zh: "量子力学" },
        body: {
          en: "Superposition, measurement, and entanglement are the raw rules this field turns into resources.",
          zh: "叠加、测量和纠缠是这一领域化为资源的原始规则。"
        }
      },
      {
        href: './field.html?id=condensed',
        label: { en: "Condensed matter", zh: "凝聚态物理" },
        body: {
          en: "Many qubit hardware platforms, like superconducting circuits, are engineered condensed-matter systems.",
          zh: "许多量子比特硬件平台，如超导电路，都是经过设计的凝聚态系统。"
        }
      },
      {
        href: './field.html?id=thermodynamics',
        label: { en: "Thermodynamics", zh: "热力学" },
        body: {
          en: "Erasing a bit has a minimum heat cost, tying information directly to physical energy.",
          zh: "擦除一个比特有最低的热代价，把信息与物理能量直接联系起来。"
        }
      }
    ]
  },

  'soft-matter': {
    equation: 'E ∼ k_B T',
    equationNote: {
      en: "Soft materials have structures whose energies are close to thermal energy, so heat alone reshapes them.",
      zh: "软物质的结构能量与热能相当，因此仅靠热运动就能使其显著变形。"
    },
    lede: {
      en: "The physics of easily deformed materials like polymers, gels, foams, and liquid crystals, plus active matter built from self-propelled units. It asks how structure emerges when a material's energies sit near the thermal scale. It explains how self-driven particles can flow and swirl collectively.",
      zh: "研究易于变形的材料，如聚合物、凝胶、泡沫、胶体和液晶，以及由自驱单元构成的活性物质。它回答当特征能量接近热能尺度时，结构和运动如何涌现。它解释一群自驱粒子为何能像有生命的流体那样流动和旋涡。"
    },
    concepts: [
      {
        mark: 'entropic springs',
        title: { en: "Order from entropy", zh: "熵驱动的弹性" },
        body: {
          en: "A stretched polymer or a colloidal crystal is held together largely by entropy, the statistics of many arrangements, rather than by strong bonds.",
          zh: "被拉伸的聚合物或胶体晶体，主要靠熵即大量排布方式的统计维系，而非靠强键。"
        }
      },
      {
        mark: 'self-assembly',
        title: { en: "Self-assembly", zh: "自组装" },
        body: {
          en: "Left alone, soft components spontaneously organize into membranes, droplets, and patterns, guided by weak interactions and thermal motion.",
          zh: "任其自然，软组分会在弱相互作用和热运动的引导下自发组织成膜、液滴和图样。"
        }
      },
      {
        mark: 'active units',
        title: { en: "Active matter", zh: "活性物质" },
        body: {
          en: "When each unit consumes energy and pushes on its neighbors, as with swimming bacteria or synthetic swimmers, the group can move collectively far from equilibrium.",
          zh: "当每个单元都耗能并推挤邻居时，如游动的细菌或人工游动体，整个群体能在远离平衡处集体运动。"
        }
      }
    ],
    boundaries: [
      {
        title: { en: "Beyond equilibrium rules", zh: "超出平衡态规则" },
        body: {
          en: "Active matter is continuously driven, so standard equilibrium thermodynamics does not apply. A general theory of these systems is still being built.",
          zh: "活性物质持续被驱动，因此标准的平衡热力学不适用。这类系统的普适理论仍在构建之中。"
        }
      },
      {
        title: { en: "Coarse-grained by design", zh: "刻意做粗粒化" },
        body: {
          en: "Soft-matter models deliberately blur molecular detail to capture large-scale behavior. That trade makes them powerful for structure but poor for precise chemistry.",
          zh: "软物质模型有意模糊分子细节，以抓住大尺度行为。这一取舍使其擅长描述结构，却不擅长精确化学。"
        }
      }
    ],
    connections: [
      {
        href: './field.html?id=fluids',
        label: { en: "Fluids", zh: "流体力学" },
        body: {
          en: "Complex and active fluids extend fluid mechanics with internal structure and self-driven flow.",
          zh: "复杂流体和活性流体为流体力学加入内部结构与自驱流动。"
        }
      },
      {
        href: './field.html?id=statistical',
        label: { en: "Statistical mechanics", zh: "统计力学" },
        body: {
          en: "Entropy, fluctuations, and phase behavior are the core tools for understanding soft materials.",
          zh: "熵、涨落和相行为是理解软材料的核心工具。"
        }
      },
      {
        href: './field.html?id=biophysics',
        label: { en: "Biophysics", zh: "生物物理学" },
        body: {
          en: "Cells are crowded active soft matter, so the two fields share models of membranes and motion.",
          zh: "细胞是拥挤的活性软物质，两个领域共享关于膜和运动的模型。"
        }
      }
    ]
  }
});
