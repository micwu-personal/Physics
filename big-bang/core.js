var BigBangCore = (function(){
  function escapeHtml(value){
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
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
      if(star.z < 1){
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

  return {advanceStarfield, buildReferenceLinks, createAnimationController, escapeHtml};
})();
var buildReferenceLinks = BigBangCore.buildReferenceLinks;
var createAnimationController = BigBangCore.createAnimationController;
var advanceStarfield = BigBangCore.advanceStarfield;
