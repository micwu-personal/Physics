globalThis.PhysicsCore = (() => {
  const DECAY_TABLE = {
    'μ⁻': { tau: 2.1969811e-6, channels: [
      { br: 1, daughters: ['e⁻', 'ν̄_e', 'ν_μ'] },
    ] },
    'μ⁺': { tau: 2.1969811e-6, channels: [
      { br: 1, daughters: ['e⁺', 'ν_e', 'ν̄_μ'] },
    ] },
    'τ⁻': { tau: 2.903e-13, channels: [
      { br: 0.1782, daughters: ['e⁻', 'ν̄_e', 'ν_τ'] },
      { br: 0.1739, daughters: ['μ⁻', 'ν̄_μ', 'ν_τ'] },
      { br: 0.1082, daughters: ['π⁻', 'ν_τ'] },
      { br: 0.2549, daughters: ['π⁻', 'π⁰', 'ν_τ'] },
      { br: 0.0926, daughters: ['π⁻', 'π⁰', 'π⁰', 'ν_τ'] },
      { br: 0.1922, daughters: ['other', 'ν_τ'], representative: false },
    ] },
    'τ⁺': { tau: 2.903e-13, channels: [
      { br: 0.1782, daughters: ['e⁺', 'ν_e', 'ν̄_τ'] },
      { br: 0.1739, daughters: ['μ⁺', 'ν_μ', 'ν̄_τ'] },
      { br: 0.1082, daughters: ['π⁺', 'ν̄_τ'] },
      { br: 0.2549, daughters: ['π⁺', 'π⁰', 'ν̄_τ'] },
      { br: 0.0926, daughters: ['π⁺', 'π⁰', 'π⁰', 'ν̄_τ'] },
      { br: 0.1922, daughters: ['other', 'ν̄_τ'], representative: false },
    ] },
    'π⁺': { tau: 2.6033e-8, channels: [
      { br: 0.9999, daughters: ['μ⁺', 'ν_μ'] },
      { br: 0.0001, daughters: ['other'], representative: false },
    ] },
    'π⁻': { tau: 2.6033e-8, channels: [
      { br: 0.9999, daughters: ['μ⁻', 'ν̄_μ'] },
      { br: 0.0001, daughters: ['other'], representative: false },
    ] },
    'π⁰': { tau: 8.43e-17, channels: [
      { br: 0.9882, daughters: ['γ', 'γ'] },
      { br: 0.0118, daughters: ['e⁺', 'e⁻', 'γ'] },
    ] },
    'K⁺': { tau: 1.238e-8, channels: [
      { br: 0.6356, daughters: ['μ⁺', 'ν_μ'] },
      { br: 0.2067, daughters: ['π⁺', 'π⁰'] },
      { br: 0.0558, daughters: ['π⁺', 'π⁺', 'π⁻'] },
      { br: 0.0507, daughters: ['π⁰', 'e⁺', 'ν_e'] },
      { br: 0.0335, daughters: ['π⁰', 'μ⁺', 'ν_μ'] },
      { br: 0.0177, daughters: ['π⁺', 'π⁰', 'π⁰'] },
    ] },
    'n': { tau: 878.4, channels: [
      { br: 1, daughters: ['p', 'e⁻', 'ν̄_e'] },
    ] },
    'Z': { tau: 2.64e-25, channels: [
      { br: 0.03363, daughters: ['e⁻', 'e⁺'] },
      { br: 0.03366, daughters: ['μ⁻', 'μ⁺'] },
      { br: 0.03370, daughters: ['τ⁻', 'τ⁺'] },
      { br: 0.20000, daughters: ['ν', 'ν̄'] },
      { br: 0.69901, daughters: ['q', 'q̄'] },
    ] },
  };

  const CONS_PARTICLES = {
    p: { Q: 1, B: 1, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#c8cff0', hadron: true },
    p̄: { Q: -1, B: -1, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#c8cff0', hadron: true },
    n: { Q: 0, B: 1, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#c8cff0', hadron: true },
    n̄: { Q: 0, B: -1, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#c8cff0', hadron: true },
    'π⁺': { Q: 1, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#ff6b9d', hadron: true },
    'π⁻': { Q: -1, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#ff6b9d', hadron: true },
    'π⁰': { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#ffb0cf', hadron: true },
    'K⁺': { Q: 1, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 1, c: '#ff5c8a', hadron: true },
    'K⁻': { Q: -1, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: -1, c: '#ff5c8a', hadron: true },
    'K⁰': { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 1, c: '#ff5c8a', hadron: true },
    Λ: { Q: 0, B: 1, Le: 0, Lmu: 0, Ltau: 0, S: -1, c: '#c39bff', hadron: true },
    'Σ⁺': { Q: 1, B: 1, Le: 0, Lmu: 0, Ltau: 0, S: -1, c: '#c39bff', hadron: true },
    'e⁻': { Q: -1, B: 0, Le: 1, Lmu: 0, Ltau: 0, S: 0, c: '#4ea8ff', hadron: false },
    'e⁺': { Q: 1, B: 0, Le: -1, Lmu: 0, Ltau: 0, S: 0, c: '#4ea8ff', hadron: false },
    'μ⁻': { Q: -1, B: 0, Le: 0, Lmu: 1, Ltau: 0, S: 0, c: '#7ee8c5', hadron: false },
    'μ⁺': { Q: 1, B: 0, Le: 0, Lmu: -1, Ltau: 0, S: 0, c: '#7ee8c5', hadron: false },
    'τ⁻': { Q: -1, B: 0, Le: 0, Lmu: 0, Ltau: 1, S: 0, c: '#c39bff', hadron: false },
    'τ⁺': { Q: 1, B: 0, Le: 0, Lmu: 0, Ltau: -1, S: 0, c: '#c39bff', hadron: false },
    'ν_e': { Q: 0, B: 0, Le: 1, Lmu: 0, Ltau: 0, S: 0, c: '#8fa8ff', hadron: false },
    'ν̄_e': { Q: 0, B: 0, Le: -1, Lmu: 0, Ltau: 0, S: 0, c: '#8fa8ff', hadron: false },
    'ν_μ': { Q: 0, B: 0, Le: 0, Lmu: 1, Ltau: 0, S: 0, c: '#8fa8ff', hadron: false },
    'ν̄_μ': { Q: 0, B: 0, Le: 0, Lmu: -1, Ltau: 0, S: 0, c: '#8fa8ff', hadron: false },
    'ν_τ': { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: 1, S: 0, c: '#8fa8ff', hadron: false },
    'ν̄_τ': { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: -1, S: 0, c: '#8fa8ff', hadron: false },
    γ: { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 0, c: '#ffd166', hadron: false, boson: true },
  };

  const CONS_EXAMPLES = [
    { name: 'β⁻ decay: n → p + e⁻ + ν̄_e', reactants: ['n'], products: ['p', 'e⁻', 'ν̄_e'], force: 'weak' },
    { name: 'π⁺ decay: π⁺ → μ⁺ + ν_μ', reactants: ['π⁺'], products: ['μ⁺', 'ν_μ'], force: 'weak' },
    { name: 'μ⁻ decay: μ⁻ → e⁻ + ν̄_e + ν_μ', reactants: ['μ⁻'], products: ['e⁻', 'ν̄_e', 'ν_μ'], force: 'weak' },
    { name: 'Λ decay: Λ → p + π⁻', reactants: ['Λ'], products: ['p', 'π⁻'], force: 'weak' },
    { name: 'π⁰ decay: π⁰ → γ + γ', reactants: ['π⁰'], products: ['γ', 'γ'], force: 'em' },
    { name: 'Forbidden: μ⁻ → e⁻ + γ', reactants: ['μ⁻'], products: ['e⁻', 'γ'], force: 'none' },
    { name: 'Forbidden: p → e⁺ + γ', reactants: ['p'], products: ['e⁺', 'γ'], force: 'none' },
    { name: 'K⁺ decay: K⁺ → μ⁺ + ν_μ', reactants: ['K⁺'], products: ['μ⁺', 'ν_μ'], force: 'weak' },
  ];

  const KEY_CONSTANTS = Object.freeze({
    electronMassMeV: 0.51099895,
    muonMassMeV: 105.6583755,
    tauMassMeV: 1776.93,
    wMassGeV: 80.3692,
    zMassGeV: 91.1880,
    higgsMassGeV: 125.20,
    neutronLifetimeSeconds: 878.4,
    deltaM21SquaredEv2: 7.42e-5,
    deltaM31SquaredEv2: 2.51e-3,
  });

  const CONJUGATES = Object.freeze({
    'e⁻': 'e⁺', 'e⁺': 'e⁻',
    'μ⁻': 'μ⁺', 'μ⁺': 'μ⁻',
    'π⁻': 'π⁺', 'π⁺': 'π⁻',
    'ν_e': 'ν̄_e', 'ν̄_e': 'ν_e',
    'ν_μ': 'ν̄_μ', 'ν̄_μ': 'ν_μ',
    'ν_τ': 'ν̄_τ', 'ν̄_τ': 'ν_τ',
    'π⁰': 'π⁰', other: 'other',
  });

  function sumCharges(items) {
    return items.reduce((sum, key) => {
      const particle = CONS_PARTICLES[key];
      if (!particle) return sum;
      for (const quantity of ['Q', 'B', 'Le', 'Lmu', 'Ltau', 'S']) sum[quantity] += particle[quantity];
      return sum;
    }, { Q: 0, B: 0, Le: 0, Lmu: 0, Ltau: 0, S: 0 });
  }

  function classifyProcess(reactants, products) {
    const left = sumCharges(reactants);
    const right = sumCharges(products);
    const violations = [];
    for (const quantity of ['Q', 'B', 'Le', 'Lmu', 'Ltau']) {
      if (left[quantity] !== right[quantity]) violations.push(quantity);
    }
    const deltaS = right.S - left.S;
    if (Math.abs(deltaS) > 1) violations.push('S');
    if (violations.length) return { viol: violations, dS: deltaS, force: 'none', l: left, r: right };

    const all = [...reactants, ...products];
    const hasNeutrino = all.some(key => key.includes('ν'));
    const hasPhoton = all.includes('γ');
    const hasHadron = all.some(key => CONS_PARTICLES[key]?.hadron);
    let force = 'em';
    if (hasNeutrino || deltaS !== 0) force = 'weak';
    else if (hasPhoton) force = 'em';
    else if (hasHadron) force = 'strong';
    return { viol: violations, dS: deltaS, force, l: left, r: right };
  }

  function pickDecayChannel(entry, randomValue) {
    let cumulative = 0;
    for (const channel of entry.channels) {
      cumulative += channel.br;
      if (randomValue <= cumulative) return channel;
    }
    return entry.channels.at(-1);
  }

  function branchingSum(entry) {
    return entry.channels.reduce((sum, channel) => sum + channel.br, 0);
  }

  function conjugateDaughters(daughters) {
    return daughters.map(daughter => CONJUGATES[daughter]);
  }

  function photonPair(angle, speed = 4) {
    const first = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    return [first, { vx: -first.vx, vy: -first.vy }];
  }

  function shouldAnimate({ active, documentVisible, elementVisible, reducedMotion }) {
    return active && documentVisible && elementVisible && !reducedMotion;
  }

  function nucleonPlans(upQuarks, downQuarks) {
    if (!Number.isInteger(upQuarks) || !Number.isInteger(downQuarks) || upQuarks < 0 || downQuarks < 0) {
      throw new RangeError('Quark counts must be non-negative integers');
    }

    const plans = [];
    for (let protons = 0; protons <= Math.floor(upQuarks / 2); protons++) {
      for (let neutrons = 0; neutrons <= Math.floor(downQuarks / 2); neutrons++) {
        const usedUp = 2 * protons + neutrons;
        const usedDown = protons + 2 * neutrons;
        if (usedUp > upQuarks || usedDown > downQuarks) continue;

        const remainingUp = upQuarks - usedUp;
        const remainingDown = downQuarks - usedDown;
        const deltaPlus = Math.floor(remainingUp / 3);
        const deltaMinus = Math.floor(remainingDown / 3);
        const freeUp = remainingUp - 3 * deltaPlus;
        const freeDown = remainingDown - 3 * deltaMinus;
        const key = `${protons}p-${neutrons}n-${deltaPlus}dpp-${deltaMinus}dm-${freeUp}u-${freeDown}d`;
        plans.push({
          key,
          protons,
          neutrons,
          deltaPlus,
          deltaMinus,
          freeUp,
          freeDown,
          stableCount: protons + neutrons,
          deltaCount: deltaPlus + deltaMinus,
          freeCount: freeUp + freeDown,
        });
      }
    }

    return plans.sort((left, right) =>
      left.freeCount - right.freeCount ||
      left.deltaCount - right.deltaCount ||
      right.stableCount - left.stableCount ||
      Math.abs(left.protons - left.neutrons) - Math.abs(right.protons - right.neutrons) ||
      right.protons - left.protons
    );
  }

  return {
    CONS_EXAMPLES,
    CONS_PARTICLES,
    DECAY_TABLE,
    KEY_CONSTANTS,
    branchingSum,
    classifyProcess,
    conjugateDaughters,
    photonPair,
    pickDecayChannel,
    nucleonPlans,
    shouldAnimate,
    sumCharges,
  };
})();
