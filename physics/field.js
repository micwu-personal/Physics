/* Renders one field guide from the shared atlas metadata plus its guide entry.
   The field is selected with ?id=<field-id>; an unknown or missing id falls
   back to the first field that has a guide rather than rendering an empty page. */
(() => {
  const fields = PhysicsFieldList;
  const guides = PhysicsFieldGuides;
  const byId = new Map(fields.map(field => [field.id, field]));

  const requested = new URLSearchParams(location.search).get('id');
  const activeId = guides[requested] ? requested : Object.keys(guides)[0];
  const field = byId.get(activeId);
  const guide = guides[activeId];

  const lineageNames = {
    motion: { en: 'Motion', zh: '运动' },
    fields: { en: 'Fields & waves', zh: '场与波' },
    matter: { en: 'Matter', zh: '物质' },
    quantum: { en: 'Quantum', zh: '量子' },
    cosmos: { en: 'Earth & cosmos', zh: '地球与宇宙' },
    life: { en: 'Living systems', zh: '生命系统' },
    systems: { en: 'Complex systems', zh: '复杂系统' }
  };

  const zh = () => PhysicsUI.language === 'zh-CN';
  const pick = value => (zh() ? value.zh : value.en);

  // Chronological neighbours, so a visitor can walk the timeline in order.
  const ordered = fields.filter(item => guides[item.id] || item.page).sort((a, b) => a.year - b.year);
  const position = ordered.findIndex(item => item.id === activeId);
  const previous = ordered[position - 1];
  const next = ordered[position + 1];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderLineageMap() {
    const parents = field.parents.map(id => byId.get(id));
    const children = fields.filter(item => item.parents.includes(activeId));
    const host = document.getElementById('lineageMap');
    host.innerHTML = '';

    const build = (items, role, heading) => {
      const column = element('div', `lineage-column ${role}`);
      column.append(element('h2', 'lineage-heading', heading));
      if (!items.length) {
        column.append(element('p', 'lineage-empty', zh()
          ? '没有列出的直接来源；它建立在更早的观测与数学传统之上。'
          : 'No listed direct source; it builds on earlier observational and mathematical traditions.'));
        return column;
      }
      const list = element('ul', 'lineage-list');
      for (const item of items) {
        const entry = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.page;
        link.textContent = `${item.year} · ${pick(item).name}`;
        link.style.setProperty('--field-color', item.color);
        entry.append(link);
        list.append(entry);
      }
      column.append(list);
      return column;
    };

    host.append(build(parents, 'parents', zh() ? '直接源流' : 'Builds on'));

    const middle = element('div', 'lineage-column current');
    middle.append(element('h2', 'lineage-heading', zh() ? '当前领域' : 'This field'));
    const badge = element('div', 'lineage-current');
    badge.innerHTML = physicsSignatureMarkup(field.signature);
    badge.style.setProperty('--field-color', field.color);
    badge.append(element('strong', null, pick(field).name));
    middle.append(badge);
    host.append(middle);

    host.append(build(children, 'children', zh() ? '直接影响' : 'Leads to'));
  }

  const REP_LABELS = {
    observation: { en: 'Observation', zh: '观测' },
    document: { en: 'Historical document', zh: '历史文献' },
    reconstruction: { en: 'Reconstructed data', zh: '重建数据' },
    model: { en: 'Calculated model', zh: '计算模型' },
    schematic: { en: 'Teaching schematic', zh: '教学示意' }
  };

  function renderMedia() {
    const host = document.getElementById('fieldMedia');
    host.innerHTML = '';
    const caption = document.createElement('figcaption');

    if (guide.media) {
      const image = document.createElement('img');
      image.src = `../assets/media/${guide.media.file}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = pick(guide.media.caption);
      host.dataset.kind = 'photo';
      host.append(image);

      const badge = element('span', `rep-badge ${guide.media.kind}`, pick(REP_LABELS[guide.media.kind]));
      caption.append(badge);
      caption.append(element('span', 'media-text', pick(guide.media.caption)));
      const link = document.createElement('a');
      link.href = guide.media.source;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = zh() ? '来源与许可' : 'Source and license';
      caption.append(link);
    } else {
      // No licensed photograph fits this field, so an authored diagram stands in
      // rather than leaving the guide without a visual.
      const panel = element('div', 'field-diagram');
      panel.style.setProperty('--field-color', field.color);
      panel.innerHTML = physicsSignatureMarkup(field.signature);
      host.dataset.kind = 'diagram';
      host.append(panel);

      caption.append(element('span', 'rep-badge schematic', pick(REP_LABELS.schematic)));
      caption.append(element('span', 'media-text', zh()
        ? `${pick(field).name}的标志性图形。这是为本图谱绘制的示意图，用来概括该领域研究的结构，并非测量结果。`
        : `The signature mark for ${pick(field).name.toLowerCase()}. It is drawn for this atlas to summarise the structure the field studies, and is not a measurement.`));
    }
    host.append(caption);
  }

  function renderCopy() {
    document.documentElement.style.setProperty('--topic', field.color);
    document.title = `${pick(field).name} — Physics Field Atlas`;

    document.getElementById('fieldKicker').textContent =
      `${field.year} · ${lineageNames[field.lineage][zh() ? 'zh' : 'en']}`;
    document.getElementById('fieldName').textContent = pick(field).name;
    document.getElementById('fieldLede').textContent = pick(guide.lede);
    const equation = document.getElementById('fieldEquation');
    if (guide.tex) {
      equation.innerHTML = PhysicsFormula.toMathML(guide.tex, { label: guide.equation });
    } else {
      equation.textContent = guide.equation;
    }
    document.getElementById('fieldEquationNote').textContent = pick(guide.equationNote);

    document.getElementById('fieldDetail').textContent = pick(field).detail;
    document.getElementById('shiftLabel').textContent = zh() ? '关键转变' : 'What changed';
    document.getElementById('shiftBody').textContent = pick(field).shift;
    document.getElementById('peopleLabel').textContent = zh() ? '代表人物' : 'People to know';
    document.getElementById('peopleBody').textContent = pick(field).people;

    const conceptHost = document.getElementById('conceptRibbon');
    conceptHost.innerHTML = '';
    for (const concept of guide.concepts) {
      const article = element('article', 'concept');
      const mark = element('div', 'concept-mark');
      if (concept.markTex) {
        mark.innerHTML = PhysicsFormula.toMathML(concept.markTex, { label: concept.mark });
      } else {
        mark.textContent = concept.mark;
      }
      article.append(mark);
      article.append(element('h3', null, pick(concept.title)));
      article.append(element('p', null, pick(concept.body)));
      conceptHost.append(article);
    }

    const boundaryHost = document.getElementById('boundaryGrid');
    boundaryHost.innerHTML = '';
    for (const boundary of guide.boundaries) {
      const article = element('article', 'limit');
      article.append(element('h3', null, pick(boundary.title)));
      article.append(element('p', null, pick(boundary.body)));
      boundaryHost.append(article);
    }

    const connectionHost = document.getElementById('relationMap');
    connectionHost.innerHTML = '';
    for (const connection of guide.connections) {
      const link = document.createElement('a');
      link.href = connection.href;
      link.append(element('strong', null, pick(connection.label)));
      link.append(element('span', null, pick(connection.body)));
      connectionHost.append(link);
    }

    const previousLink = document.getElementById('previousField');
    const nextLink = document.getElementById('nextField');
    if (previous) {
      previousLink.href = previous.page;
      previousLink.textContent = `← ${pick(previous).name}`;
      previousLink.hidden = false;
    } else {
      previousLink.hidden = true;
    }
    if (next) {
      nextLink.href = next.page;
      nextLink.textContent = `${pick(next).name} →`;
      nextLink.hidden = false;
    } else {
      nextLink.hidden = true;
    }

    renderLineageMap();
    renderMedia();
    if (globalThis.renderPhysicsFieldEnrichment) {
      globalThis.renderPhysicsFieldEnrichment({ fieldId: activeId, field, guide });
    }
    renderPhysicsReferences(activeId, document.getElementById('officialReferences'));
  }

  document.addEventListener('physics-language', renderCopy);
  renderCopy();
})();
