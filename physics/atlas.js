(() => {
  const fields = PhysicsFieldList;

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
            <span class="ready-mark"></span>
          </span>
          ${physicsSignatureMarkup(field.signature)}
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
      ready.textContent = PhysicsUI.language === 'zh-CN' ? '进入完整专题 →' : 'Open full field guide →';
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
      if (child.classList.contains('hidden')) return;
      field.parents.forEach(parentId => {
        const parent = nodeById.get(parentId);
        if (parent.classList.contains('hidden')) return;
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
    actionSlot.innerHTML = `<a class="node-action" href="${field.page}">${PhysicsUI.language === 'zh-CN' ? '进入完整互动专题' : 'Enter the complete interactive guide'}</a>`;
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
