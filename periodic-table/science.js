(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PeriodicScience = api;
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

  return Object.freeze({
    shellCountsFromConfig,
    parseFormula,
    parseReactionSide,
    reactionBalance,
    isAnimationAllowed,
    radioactivityClass
  });
});
