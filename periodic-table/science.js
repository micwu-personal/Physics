(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PeriodicScience = api;
})(globalThis, function(){
  'use strict';

  const SUPERSCRIPTS = Object.freeze({
    '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4',
    '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9'
  });
  const SUBSCRIPTS = Object.freeze({
    '₀':'0', '₁':'1', '₂':'2', '₃':'3', '₄':'4',
    '₅':'5', '₆':'6', '₇':'7', '₈':'8', '₉':'9'
  });
  const CORE_SHELLS = Object.freeze({
    He:[2],
    Ne:[2,8],
    Ar:[2,8,8],
    Kr:[2,8,18,8],
    Xe:[2,8,18,18,8],
    Rn:[2,8,18,32,18,8]
  });

  function unicodeNumber(text, digits){
    const value = [...text].map(char => digits[char] ?? char).join('');
    return Number(value);
  }

  function shellCountsFromConfig(config){
    if (typeof config !== 'string' || !config.trim()) {
      throw new TypeError('Electron configuration must be a non-empty string');
    }
    const shells = [0,0,0,0,0,0,0];
    const core = /^\[([A-Z][a-z]?)\]/.exec(config);
    if (core) {
      const coreShells = CORE_SHELLS[core[1]];
      if (!coreShells) throw new RangeError(`Unknown noble-gas core: ${core[1]}`);
      coreShells.forEach((count, index) => { shells[index] = count; });
    }
    const orbitalPattern = /([1-7])[spdfg]([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\d+)/g;
    let match;
    while ((match = orbitalPattern.exec(config))) {
      shells[Number(match[1]) - 1] += unicodeNumber(match[2], SUPERSCRIPTS);
    }
    return shells;
  }

  function normalizeFormula(formula){
    return [...formula].map(char => SUBSCRIPTS[char] ?? char).join('')
      .replace(/[↑↓·\s]/g, '');
  }

  function parseFormula(formula){
    const input = normalizeFormula(formula);
    let index = 0;

    function parseGroup(){
      const counts = {};
      while (index < input.length && input[index] !== ')') {
        if (input[index] === '(') {
          index++;
          const nested = parseGroup();
          if (input[index] !== ')') throw new SyntaxError(`Unclosed group in ${formula}`);
          index++;
          const multiplier = parseDigits();
          addCounts(counts, nested, multiplier);
          continue;
        }
        const element = /^[A-Z][a-z]?/.exec(input.slice(index));
        if (!element) throw new SyntaxError(`Unexpected token "${input[index]}" in ${formula}`);
        index += element[0].length;
        counts[element[0]] = (counts[element[0]] || 0) + parseDigits();
      }
      return counts;
    }

    function parseDigits(){
      const digits = /^\d+/.exec(input.slice(index));
      if (!digits) return 1;
      index += digits[0].length;
      return Number(digits[0]);
    }

    const result = parseGroup();
    if (index !== input.length) throw new SyntaxError(`Unexpected closing group in ${formula}`);
    return result;
  }

  function addCounts(target, source, multiplier){
    Object.entries(source).forEach(([symbol, count]) => {
      target[symbol] = (target[symbol] || 0) + count * multiplier;
    });
    return target;
  }

  function parseReactionSide(side){
    return side.split(/\s+\+\s+/).reduce((total, term) => {
      const cleaned = term.trim();
      const coefficientMatch = /^(\d+)\s*(.+)$/.exec(cleaned);
      const coefficient = coefficientMatch ? Number(coefficientMatch[1]) : 1;
      const formula = coefficientMatch ? coefficientMatch[2] : cleaned;
      return addCounts(total, parseFormula(formula), coefficient);
    }, {});
  }

  function reactionBalance(equation){
    const sides = equation.split(/\s*(?:→|⇌|=)\s*/);
    if (sides.length !== 2) throw new SyntaxError(`Reaction needs one arrow: ${equation}`);
    const left = parseReactionSide(sides[0]);
    const right = parseReactionSide(sides[1]);
    const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    const delta = {};
    elements.forEach(symbol => {
      const difference = (right[symbol] || 0) - (left[symbol] || 0);
      if (difference) delta[symbol] = difference;
    });
    return {balanced:Object.keys(delta).length === 0, left, right, delta};
  }

  function isAnimationAllowed(state){
    return Boolean(
      state &&
      state.active !== false &&
      state.documentVisible !== false &&
      state.elementVisible !== false &&
      !state.reducedMotion
    );
  }

  function radioactivityClass(atomicNumber, legacyFlag){
    if (legacyFlag === 0) return 'stable';
    if ([43,61,93,94].includes(atomicNumber)) return 'trace';
    if (atomicNumber >= 95) return 'synthetic';
    return 'natural';
  }

  function reactionTimeline(elapsedMs, animationMs = 5500, sourceHoldMs = 500){
    if (![elapsedMs, animationMs, sourceHoldMs].every(Number.isFinite) || animationMs <= 0 || sourceHoldMs < 0) {
      throw new RangeError('Reaction timing values must be finite and non-negative');
    }
    const elapsed = Math.max(0, elapsedMs);
    return {
      progress: elapsed <= sourceHoldMs ? 0 : Math.min(1, (elapsed - sourceHoldMs) / animationMs),
      holdingSource: elapsed < sourceHoldMs,
      complete: elapsed >= sourceHoldMs + animationMs
    };
  }

  function reactionEffects(reaction){
    const record = reaction || {};
    const explicit = record.effects || {};
    const equation = String(record.eq || '');
    return {
      gas: explicit.gas ?? /↑/.test(equation),
      precipitate: explicit.precipitate ?? /↓/.test(equation),
      heat: Boolean(explicit.heat),
      light: Boolean(explicit.light),
      lightColor: explicit.lightColor || null,
      precipitateColor: explicit.precipitateColor || null,
      deposition: Boolean(explicit.deposition),
      depositionColor: explicit.depositionColor || null
    };
  }

  function projectOrbitalLobe(direction, radius){
    if (!Array.isArray(direction) || direction.length !== 3 || !direction.every(Number.isFinite) ||
        !Number.isFinite(radius) || radius <= 0) {
      throw new RangeError('A finite 3D direction and positive radius are required');
    }
    const length = Math.hypot(...direction) || 1;
    const dir = direction.map(value=>value/length);
    const screenLength = Math.hypot(dir[0],dir[1]);
    const angle = screenLength > 1e-6 ? Math.atan2(-dir[1],dir[0]) : 0;
    const depthScale = 1 + dir[2] * 0.22;
    const semiMinor = radius * 0.28 * depthScale;
    const projectedAxis = radius * 0.52 * screenLength * depthScale;
    return {
      angle,
      depthScale,
      screenLength,
      semiMinor,
      semiMajor: Math.max(semiMinor, Math.hypot(projectedAxis, semiMinor * Math.abs(dir[2]))),
      centreDistance: radius * 0.48 * screenLength * depthScale
    };
  }

  function advanceActiveTime(elapsedMs, lastTimestamp, timestamp, resumed = false, maxFrameGapMs = 100){
    if (![elapsedMs, timestamp, maxFrameGapMs].every(Number.isFinite) || elapsedMs < 0 || maxFrameGapMs < 0 ||
        (lastTimestamp != null && !Number.isFinite(lastTimestamp))) {
      throw new RangeError('Animation clock values must be finite and non-negative');
    }
    if (lastTimestamp == null || resumed) return {elapsedMs,lastTimestamp:timestamp};
    const frameGap=Math.max(0,timestamp-lastTimestamp);
    return {
      elapsedMs:elapsedMs+Math.min(frameGap,maxFrameGapMs),
      lastTimestamp:timestamp
    };
  }

  return Object.freeze({
    advanceActiveTime,
    shellCountsFromConfig,
    parseFormula,
    parseReactionSide,
    projectOrbitalLobe,
    reactionBalance,
    reactionEffects,
    reactionTimeline,
    isAnimationAllowed,
    radioactivityClass
  });
});
