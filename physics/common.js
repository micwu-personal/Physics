(() => {
  const supportedLanguages = new Set(['en', 'zh-CN']);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let language = 'en';
  let motionPreference = 'system';
  let audioContext = null;

  function readPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function writePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // The visible controls remain functional when storage is unavailable.
    }
  }

  function applyLanguage(nextLanguage) {
    language = supportedLanguages.has(nextLanguage) ? nextLanguage : 'en';
    document.documentElement.lang = language;
    const suffix = language === 'zh-CN' ? 'Zh' : 'En';

    // Every bilingual element declares both locales; a missing one must surface
    // as an "undefined" string that assertTranslations() fails on, not silently.
    document.querySelectorAll('[data-copy-en]').forEach(element => {
      element.textContent = element.dataset[`copy${suffix}`];
    });
    document.querySelectorAll('[data-html-en]').forEach(element => {
      element.innerHTML = element.dataset[`html${suffix}`];
    });
    document.querySelectorAll('[data-alt-en]').forEach(element => {
      element.setAttribute('alt', element.dataset[`alt${suffix}`]);
    });
    document.querySelectorAll('[data-aria-en]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[`aria${suffix}`]);
    });
    document.querySelectorAll('[data-placeholder-en]').forEach(element => {
      element.setAttribute('placeholder', element.dataset[`placeholder${suffix}`]);
    });
    document.querySelectorAll('[data-lang]').forEach(button => {
      const active = button.dataset.lang === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    writePreference('physics.lang', language);
    document.dispatchEvent(new CustomEvent('physics-language', { detail: { language } }));
  }

  function motionPaused() {
    return motionPreference === 'pause' ||
      (motionPreference === 'system' && reducedMotion.matches);
  }

  function applyMotion() {
    const paused = motionPaused();
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
    const button = document.querySelector('.motion-toggle');
    button.setAttribute('aria-pressed', String(paused));
    const text = language === 'zh-CN'
      ? (paused ? '播放动画' : '暂停动画')
      : (paused ? 'Play motion' : 'Pause motion');
    button.textContent = text;
    button.setAttribute('aria-label', text);
    document.dispatchEvent(new CustomEvent('physics-motion', { detail: { paused } }));
  }

  // Explicitly starting an animation should not also require un-pausing motion.
  function requestMotion() {
    if (!motionPaused()) return false;
    motionPreference = 'play';
    writePreference('physics.motion', motionPreference);
    applyMotion();
    return true;
  }

  async function getAudioContext() {
    if (audioContext?.state === 'closed') audioContext = null;
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state !== 'running') {
      try {
        await audioContext.resume();
      } catch {
        return null;
      }
    }
    return audioContext.state === 'running' ? audioContext : null;
  }

  async function playTone(frequency, duration, volume, type = 'sine') {
    const context = await getAudioContext();
    if (!context) return false;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    return true;
  }

  const referencePaneScript = document.createElement('script');
  referencePaneScript.src = new URL('../assets/reference-pane.js', document.baseURI).href;
  document.body.append(referencePaneScript);
  language = readPreference(
    'physics.lang',
    navigator.language.startsWith('zh') ? 'zh-CN' : 'en'
  );
  motionPreference = readPreference('physics.motion', 'system');

  document.querySelectorAll('[data-lang]').forEach(button => {
    button.addEventListener('click', () => {
      applyLanguage(button.dataset.lang);
      applyMotion();
    });
  });

  const motionButton = document.querySelector('.motion-toggle');
  motionButton.addEventListener('click', () => {
    motionPreference = motionPaused() ? 'play' : 'pause';
    writePreference('physics.motion', motionPreference);
    applyMotion();
  });

  reducedMotion.addEventListener('change', applyMotion);
  applyLanguage(language);
  applyMotion();

  window.PhysicsUI = Object.freeze({
    get language() {
      return language;
    },
    motionPaused,
    playTone,
    requestMotion
  });
})();
