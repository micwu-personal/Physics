/*
  A very small TeX-subset to MathML converter.

  Formulas on this site were previously written as plain text ("F = dp/dt",
  "-GMm r̂/r²"), which wrapped mid-expression, rendered slash fractions, and
  relied on a combining circumflex that monospace faces set badly. MathML is
  native in every current browser, needs no library, and gives real fractions,
  proper italic variables, and correct operator spacing.

  Supported subset, which is all this site uses:
    \frac{a}{b}  \sqrt{a}  \hat{a}  \vec{a}  \overline{a}
    x^{...} x_{...} and single-token x^a x_a
    \mathrm{...}  \text{...}
    \left( ... \right)  and bare ( ) [ ] | ⟨ ⟩
    \, \; \quad spacing, \cdot \times \pm \approx \neq \leq \geq \to \propto
    \partial \nabla \infty \hbar \ell
  Anything else is passed through as a literal symbol.
*/
(() => {
  const MATHCAL = {
    A: '\u{1D49C}', B: '\u212C', C: '\u{1D49E}', D: '\u{1D49F}', E: '\u2130',
    F: '\u2131', G: '\u{1D4A2}', H: '\u210B', I: '\u2110', J: '\u{1D4A5}',
    K: '\u{1D4A6}', L: '\u2112', M: '\u2133', N: '\u{1D4A9}', O: '\u{1D4AA}',
    P: '\u{1D4AB}', Q: '\u{1D4AC}', R: '\u211B', S: '\u{1D4AE}', T: '\u{1D4AF}',
    U: '\u{1D4B0}', V: '\u{1D4B1}', W: '\u{1D4B2}', X: '\u{1D4B3}', Y: '\u{1D4B4}',
    Z: '\u{1D4B5}'
  };
  const GREEK = {
    alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4',
    epsilon: '\u03B5', varepsilon: '\u03B5', zeta: '\u03B6', eta: '\u03B7',
    theta: '\u03B8', vartheta: '\u03D1', iota: '\u03B9', kappa: '\u03BA',
    lambda: '\u03BB', mu: '\u03BC', nu: '\u03BD', xi: '\u03BE',
    pi: '\u03C0', rho: '\u03C1', sigma: '\u03C3', tau: '\u03C4',
    upsilon: '\u03C5', phi: '\u03C6', varphi: '\u03D5', chi: '\u03C7',
    psi: '\u03C8', omega: '\u03C9',
    Alpha: '\u0391', Beta: '\u0392', Theta: '\u0398', Xi: '\u039E',
    Pi: '\u03A0', Upsilon: '\u03A5'
  };
  const NAMED = {
    cdot: '\u22C5', times: '\u00D7', pm: '\u00B1', mp: '\u2213',
    approx: '\u2248', neq: '\u2260', leq: '\u2264', geq: '\u2265',
    ll: '\u226A', gg: '\u226B', sim: '\u223C', simeq: '\u2243',
    to: '\u2192', rightarrow: '\u2192', propto: '\u221D',
    partial: '\u2202', nabla: '\u2207', infty: '\u221E',
    hbar: '\u210F', ell: '\u2113', deg: '\u00B0',
    langle: '\u27E8', rangle: '\u27E9', lvert: '|', rvert: '|',
    Delta: '\u0394', Sigma: '\u03A3', Omega: '\u03A9', Phi: '\u03A6',
    Psi: '\u03A8', Gamma: '\u0393', Lambda: '\u039B'
  };
  const SPACES = { ',': '0.17em', ';': '0.28em', quad: '1em', qquad: '2em', '!': '-0.17em' };
  const OPEN = new Set(['(', '[', '{', '\u27E8', '|']);
  const CLOSE = new Set([')', ']', '}', '\u27E9']);
  // Characters that must be typeset as operators rather than identifiers.
  const OPERATORS = new Set([
    '+', '-', '\u2212', '=', '<', '>', '/', '\u00D7', '\u22C5', '\u00B1', '\u2213',
    '\u2248', '\u2260', '\u2264', '\u2265', '\u226A', '\u226B', '\u223C', '\u2243',
    '\u2192', '\u221D', '\u2207', '\u2202', ',', ':', '\u2223'
  ]);

  function escapeXml(value) {
    return String(value).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  }

  function tokenize(input) {
    const tokens = [];
    let index = 0;
    while (index < input.length) {
      const ch = input[index];
      if (ch === '\\') {
        const match = /^\\([A-Za-z]+|[,;!])/.exec(input.slice(index));
        if (match) {
          tokens.push({ type: 'command', value: match[1] });
          index += match[0].length;
          continue;
        }
        index += 1;
        continue;
      }
      if (ch === ' ') { index += 1; continue; }
      if (ch === '{' || ch === '}') {
        tokens.push({ type: ch === '{' ? 'begin' : 'end' });
        index += 1;
        continue;
      }
      if (ch === '^' || ch === '_') {
        tokens.push({ type: 'script', value: ch });
        index += 1;
        continue;
      }
      const number = /^\d+(?:\.\d+)?/.exec(input.slice(index));
      if (number) {
        tokens.push({ type: 'number', value: number[0] });
        index += number[0].length;
        continue;
      }
      tokens.push({ type: 'symbol', value: ch });
      index += 1;
    }
    return tokens;
  }

  function parse(tokens) {
    let position = 0;

    function parseGroup() {
      // A braced group, or a single atom when unbraced (x^2, x_i).
      if (tokens[position] && tokens[position].type === 'begin') {
        position += 1;
        const items = [];
        while (position < tokens.length && tokens[position].type !== 'end') {
          items.push(parseAtomWithScripts());
        }
        position += 1;
        return { type: 'row', items };
      }
      return parseAtom();
    }

    function parseAtom() {
      const token = tokens[position];
      if (!token) return { type: 'row', items: [] };
      position += 1;

      if (token.type === 'number') return { type: 'number', value: token.value };
      if (token.type === 'begin') {
        position -= 1;
        return parseGroup();
      }
      if (token.type === 'command') {
        const name = token.value;
        if (name === 'frac') {
          const numerator = parseGroup();
          const denominator = parseGroup();
          return { type: 'frac', numerator, denominator };
        }
        if (name === 'sqrt') return { type: 'sqrt', body: parseGroup() };
        if (name === 'hat') return { type: 'accent', accent: '\u005E', body: parseGroup() };
        if (name === 'vec') return { type: 'accent', accent: '\u2192', body: parseGroup() };
        if (name === 'overline') return { type: 'accent', accent: '\u00AF', body: parseGroup() };
        if (name === 'mathrm' || name === 'text') {
          const body = parseGroup();
          return { type: 'upright', body };
        }
        if (name === 'mathcal') {
          const letters = flatten(parseGroup());
          return { type: 'identifier', value: [...letters].map(ch => MATHCAL[ch] || ch).join('') };
        }
        if (name === 'left' || name === 'right') {
          const next = tokens[position];
          position += 1;
          return { type: 'operator', value: next ? next.value : '', fence: true };
        }
        if (SPACES[name]) return { type: 'space', width: SPACES[name] };
        if (GREEK[name]) return { type: 'identifier', value: GREEK[name] };
        if (NAMED[name]) {
          const value = NAMED[name];
          return OPERATORS.has(value) || value === '\u27E8' || value === '\u27E9'
            ? { type: 'operator', value }
            : { type: 'identifier', value };
        }
        return { type: 'identifier', value: name };
      }
      const value = token.value;
      if (OPERATORS.has(value)) return { type: 'operator', value: value === '-' ? '\u2212' : value };
      if (OPEN.has(value) || CLOSE.has(value)) return { type: 'operator', value, fence: true };
      return { type: 'identifier', value };
    }

    function parseAtomWithScripts() {
      let base = parseAtom();
      let sub = null;
      let sup = null;
      while (tokens[position] && tokens[position].type === 'script') {
        const kind = tokens[position].value;
        position += 1;
        const script = parseGroup();
        if (kind === '_') sub = script;
        else sup = script;
      }
      if (sub && sup) return { type: 'subsup', base, sub, sup };
      if (sub) return { type: 'sub', base, sub };
      if (sup) return { type: 'sup', base, sup };
      return base;
    }

    const items = [];
    while (position < tokens.length) items.push(parseAtomWithScripts());
    return { type: 'row', items };
  }

  function render(node) {
    switch (node.type) {
      case 'row': {
        const inner = node.items.map(render).join('');
        return node.items.length === 1 ? inner : `<mrow>${inner}</mrow>`;
      }
      case 'number':
        return `<mn>${escapeXml(node.value)}</mn>`;
      case 'identifier':
        return node.value.length > 1
          ? `<mi mathvariant="normal">${escapeXml(node.value)}</mi>`
          : `<mi>${escapeXml(node.value)}</mi>`;
      case 'operator':
        return node.fence
          ? `<mo stretchy="false">${escapeXml(node.value)}</mo>`
          : `<mo>${escapeXml(node.value)}</mo>`;
      case 'upright':
        return `<mi mathvariant="normal">${flatten(node.body)}</mi>`;
      case 'space':
        return `<mspace width="${node.width}"/>`;
      case 'frac':
        return `<mfrac>${wrap(node.numerator)}${wrap(node.denominator)}</mfrac>`;
      case 'sqrt':
        return `<msqrt>${wrap(node.body)}</msqrt>`;
      case 'accent':
        return `<mover accent="true">${wrap(node.body)}<mo stretchy="false">${escapeXml(node.accent)}</mo></mover>`;
      case 'sub':
        return `<msub>${wrap(node.base)}${wrap(node.sub)}</msub>`;
      case 'sup':
        return `<msup>${wrap(node.base)}${wrap(node.sup)}</msup>`;
      case 'subsup':
        return `<msubsup>${wrap(node.base)}${wrap(node.sub)}${wrap(node.sup)}</msubsup>`;
      default:
        return '';
    }
  }

  // MathML layout elements need exactly one child, so bare rows are wrapped.
  function wrap(node) {
    if (node.type === 'row' && node.items.length !== 1) {
      return `<mrow>${node.items.map(render).join('')}</mrow>`;
    }
    return render(node);
  }

  // Plain character content for \mathrm{...}, which takes no element children.
  function flatten(node) {
    if (node.type === 'row') return node.items.map(flatten).join('');
    return escapeXml(node.value || '');
  }

  function toMathML(tex, options = {}) {
    const tree = parse(tokenize(tex));
    const display = options.display ? ' display="block"' : '';
    const label = options.label ? ` aria-label="${escapeXml(options.label)}"` : '';
    return `<math xmlns="http://www.w3.org/1998/Math/MathML"${display}${label}>${render(tree)}</math>`;
  }

  // Replaces the text content of any [data-tex] element with rendered MathML.
  function upgrade(root = document) {
    root.querySelectorAll('[data-tex]').forEach(element => {
      if (element.dataset.texDone === 'true') return;
      const label = element.textContent.trim();
      element.innerHTML = toMathML(element.dataset.tex, {
        display: element.dataset.texDisplay === 'block',
        label
      });
      element.dataset.texDone = 'true';
    });
  }

  globalThis.PhysicsFormula = Object.freeze({ toMathML, upgrade });
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => upgrade());
    } else {
      upgrade();
    }
  }
})();
