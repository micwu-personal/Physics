var BigBangCore = (function(){
  function escapeHtml(value){
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  const DEFAULT_COSMIC_AXIS = Object.freeze({
    minLog: -43,
    nowLog: Math.log10(4.35e17),
    maxLog: 107.5,
    nowPosition: 0.76
  });

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function cosmicTimeToAxisPosition(tsec, axis=DEFAULT_COSMIC_AXIS){
    if(!Number.isFinite(tsec)) throw new Error('Cosmic time must be a positive finite number');
    if(tsec <= 0) throw new Error('Cosmic time must be a positive finite number');
    const logTime = clamp(Math.log10(tsec), axis.minLog, axis.maxLog);
    if(logTime <= axis.nowLog){
      return axis.nowPosition * (logTime - axis.minLog) / (axis.nowLog - axis.minLog);
    }
    return axis.nowPosition +
      (1 - axis.nowPosition) * (logTime - axis.nowLog) / (axis.maxLog - axis.nowLog);
  }

  function axisPositionToCosmicTime(position, axis=DEFAULT_COSMIC_AXIS){
    if(!Number.isFinite(position)) throw new Error('Axis position must be finite');
    const normalized = clamp(position, 0, 1);
    const logTime = normalized <= axis.nowPosition
      ? axis.minLog + (normalized / axis.nowPosition) * (axis.nowLog - axis.minLog)
      : axis.nowLog + ((normalized - axis.nowPosition) / (1 - axis.nowPosition)) * (axis.maxLog - axis.nowLog);
    return Math.pow(10, logTime);
  }

  function interpolateLogValue(tsec, anchors){
    if(!Number.isFinite(tsec)) throw new Error('Interpolation time must be a positive finite number');
    if(tsec <= 0) throw new Error('Interpolation time must be a positive finite number');
    if(!Array.isArray(anchors)) throw new Error('At least two scale anchors are required');
    if(anchors.length < 2) throw new Error('At least two scale anchors are required');
    for(let index=1; index<anchors.length; index++){
      if(anchors[index].tsec <= anchors[index - 1].tsec) throw new Error('Scale anchors must be ordered by time');
    }
    if(tsec < anchors[0].tsec || tsec > anchors[anchors.length - 1].tsec) return null;
    let upperIndex = 1;
    while(tsec > anchors[upperIndex].tsec) upperIndex++;
    const lower = anchors[upperIndex - 1];
    const upper = anchors[upperIndex];
    const span = Math.log10(upper.tsec) - Math.log10(lower.tsec);
    const progress = (Math.log10(tsec) - Math.log10(lower.tsec)) / span;
    return lower.value + (upper.value - lower.value) * progress;
  }

  function buildReferenceLinks(referenceIds, sources, label){
    if(!Array.isArray(referenceIds) || referenceIds.length === 0) {
      throw new Error('At least one scientific reference is required');
    }
    const links = referenceIds.map(id => {
      const source = sources[id];
      if(!source) throw new Error(`Unknown scientific reference: ${id}`);
      return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`;
    }).join('');
    return `<div class="item-refs"><span>${escapeHtml(label)}:</span>${links}</div>`;
  }

  function renderReferencePanel(element, sources, label){
    const seenUrls = new Set();
    const referenceIds = Object.keys(sources).filter(id=>{
      const url = sources[id].url;
      if(seenUrls.has(url)) return false;
      seenUrls.add(url);
      return true;
    });
    element.innerHTML = buildReferenceLinks(referenceIds, sources, label);
  }

  function createAnimationController(options){
    let frameId = null;
    let documentVisible = true;
    let intersecting = true;
    let reducedMotion = false;

    function shouldRun(){
      if(!documentVisible) return false;
      if(!intersecting) return false;
      return !reducedMotion;
    }

    function frame(){
      frameId = null;
      if(!shouldRun()) return;
      options.draw();
      frameId = options.requestFrame(frame);
    }

    function sync(){
      if(shouldRun()){
        if(frameId === null) frameId = options.requestFrame(frame);
      }else if(frameId !== null){
        options.cancelFrame(frameId);
        frameId = null;
      }
    }

    return {
      setDocumentVisible(value){ documentVisible = value; sync(); },
      setIntersecting(value){ intersecting = value; sync(); },
      setReducedMotion(value){ reducedMotion = value; sync(); },
      start(){ sync(); },
      stop(){
        if(frameId !== null) options.cancelFrame(frameId);
        frameId = null;
      },
      isRunning(){ return frameId !== null; }
    };
  }

  function advanceStarfield(stars, width, height, random, visit){
    const cx = width/2;
    const cy = height/2;
    for(const star of stars){
      star.z -= 1.2;
      // A shrinking viewport leaves stars behind the new far plane; recycling
      // them keeps the perspective fade inside [0, 1].
      if(star.z < 1 || star.z > width){
        star.z = width;
        star.x = (random()-0.5)*width;
        star.y = (random()-0.5)*height;
      }
      const scale = 128/star.z;
      const x = cx + star.x*scale;
      const y = cy + star.y*scale;
      if(x < 0 || x > width || y < 0 || y > height) continue;
      const alpha = 1-star.z/width;
      visit(star, x, y, alpha*2.2, alpha);
    }
  }

  return {
    advanceStarfield,
    axisPositionToCosmicTime,
    buildReferenceLinks,
    cosmicTimeToAxisPosition,
    createAnimationController,
    escapeHtml,
    interpolateLogValue,
    renderReferencePanel
  };
})();
var buildReferenceLinks = BigBangCore.buildReferenceLinks;
var createAnimationController = BigBangCore.createAnimationController;
var advanceStarfield = BigBangCore.advanceStarfield;
var renderReferencePanel = BigBangCore.renderReferencePanel;
var cosmicTimeToAxisPosition = BigBangCore.cosmicTimeToAxisPosition;
var axisPositionToCosmicTime = BigBangCore.axisPositionToCosmicTime;
var interpolateLogValue = BigBangCore.interpolateLogValue;
