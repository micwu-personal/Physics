// Original synthesized effects; no recordings, music samples or network assets.
export function createGameAudio() {
  let context, wind, level, enabled = false;
  async function toggle() {
    if (enabled) { enabled = false; suspend(); return false; }
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) throw new Error('Audio unavailable');
    if (!context) {
      context = new Context();
      const buffer = context.createBuffer(1,context.sampleRate*2,context.sampleRate), data = buffer.getChannelData(0);
      let seed = 173, smooth = 0;
      for (let i=0;i<data.length;i++) { seed = (seed*1664525+1013904223)>>>0; smooth = .97*smooth+.03*(seed/2147483648-1); data[i] = smooth; }
      wind = context.createBufferSource(); wind.buffer = buffer; wind.loop = true;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800;
      level = context.createGain(); level.gain.value = 0;
      wind.connect(filter).connect(level).connect(context.destination); wind.start();
    }
    await context.resume(); enabled = true; return true;
  }
  function suspend() {
    if (context && level) { level.gain.setTargetAtTime(0,context.currentTime,.04); context.suspend().catch(() => {}); }
  }
  function active(value,heating=false) {
    if (!context || !enabled) return;
    if (!value) { suspend(); return; }
    if (context.state === 'suspended') context.resume().catch(() => {});
    level.gain.setTargetAtTime(heating ? .3 : .16,context.currentTime,.15);
  }
  function cue(key) {
    if (!context || !enabled || context.state !== 'running') return;
    const notes = key === 'won' ? [392,494,587,784] : key === 'recovered' || key === 'retryCapsule' || key === 'raftUnsafe' ? [140,105] : [330,440];
    notes.forEach((frequency,i) => {
      const start = context.currentTime+i*.09, tone = context.createOscillator(), gain = context.createGain();
      tone.type = 'sine'; tone.frequency.value = frequency;
      gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(.12,start+.015); gain.gain.exponentialRampToValueAtTime(.001,start+.23);
      tone.connect(gain).connect(context.destination); tone.start(start); tone.stop(start+.25);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    });
  }
  function dispose() { enabled = false; if (context) context.close().catch(() => {}); context = null; }
  return {toggle,active,cue,suspend,dispose};
}
