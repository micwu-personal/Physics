(() => {
  if (globalThis.__referencePaneInitialized) return;
  globalThis.__referencePaneInitialized = true;

  const copy = {
    en: {
      close: 'Close',
      external: 'Open original ↗',
      frameTitle: 'External reference',
      label: 'Reference viewer',
      loading: 'Loading source…',
      notice: 'The site stays open behind this panel. Some publishers block embedded viewing; use “Open original” if the page does not appear.'
    },
    'zh-CN': {
      close: '关闭',
      external: '打开原网页 ↗',
      frameTitle: '外部参考资料',
      label: '参考资料侧栏',
      loading: '正在加载来源…',
      notice: '本站会保留在此侧栏后方。部分出版商会禁止嵌入显示；若页面未出现，请使用“打开原网页”。'
    }
  };
  const language = () => document.documentElement.lang.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';

  const pane = document.createElement('aside');
  pane.className = 'reference-pane';
  pane.setAttribute('aria-hidden', 'true');
  pane.setAttribute('aria-labelledby', 'referencePaneTitle');
  pane.innerHTML = `
    <div class="reference-pane__header">
      <div class="reference-pane__identity">
        <span id="referencePaneLabel" class="reference-pane__label"></span>
        <strong id="referencePaneTitle"></strong>
        <span id="referencePaneHost" class="reference-pane__host"></span>
      </div>
      <div class="reference-pane__actions">
        <a id="referencePaneExternal" href="#" target="_blank" rel="noopener noreferrer" data-open-external="true"></a>
        <button id="referencePaneClose" type="button"></button>
      </div>
    </div>
    <p id="referencePaneNotice" class="reference-pane__notice"></p>
    <div class="reference-pane__frame-wrap">
      <div id="referencePaneStatus" class="reference-pane__status" role="status"></div>
      <div id="referencePaneFrameHost" class="reference-pane__frame-host"></div>
    </div>
  `;
  document.body.append(pane);

  const frameHost = pane.querySelector('#referencePaneFrameHost');
  const closeButton = pane.querySelector('#referencePaneClose');
  const externalLink = pane.querySelector('#referencePaneExternal');
  const title = pane.querySelector('#referencePaneTitle');
  const host = pane.querySelector('#referencePaneHost');
  const label = pane.querySelector('#referencePaneLabel');
  const notice = pane.querySelector('#referencePaneNotice');
  const status = pane.querySelector('#referencePaneStatus');
  let returnFocus = null;
  let currentTitle = '';
  let frame = null;

  function applyLanguage() {
    const strings = copy[language()];
    label.textContent = strings.label;
    closeButton.textContent = strings.close;
    externalLink.textContent = strings.external;
    notice.textContent = strings.notice;
    status.textContent = strings.loading;
    if (frame) frame.title = strings.frameTitle;
    title.textContent = currentTitle || strings.frameTitle;
  }

  function ensureFrame() {
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.id = 'referencePaneFrame';
    frame.sandbox = 'allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts';
    frame.addEventListener('load', () => {
      status.hidden = true;
    });
    frameHost.append(frame);
    applyLanguage();
    return frame;
  }

  function closePane({ restoreFocus = true } = {}) {
    if (!document.body.classList.contains('reference-pane-open')) return;
    document.body.classList.remove('reference-pane-open');
    pane.setAttribute('aria-hidden', 'true');
    frame?.remove();
    frame = null;
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }

  function openPane(link) {
    const url = new URL(link.href, window.location.href);
    returnFocus = link;
    currentTitle = link.textContent.trim() || url.hostname;
    title.textContent = currentTitle;
    host.textContent = url.hostname.replace(/^www\./, '');
    externalLink.href = url.href;
    status.hidden = false;
    ensureFrame().src = url.href;
    pane.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reference-pane-open');
    closeButton.focus();
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.dataset.openExternal === 'true' || link.hasAttribute('download')) return;
    const url = new URL(link.href, window.location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin === window.location.origin) return;
    event.preventDefault();
    openPane(link);
  });

  closeButton.addEventListener('click', () => closePane());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePane();
  });
  new MutationObserver(applyLanguage).observe(document.documentElement, {
    attributeFilter: ['lang'],
    attributes: true
  });
  applyLanguage();
})();
