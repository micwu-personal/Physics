export async function installWalkingCamera(page) {
  await page.addInitScript(()=>{
    const source=document.createElement('canvas');source.width=320;source.height=240;
    const ctx=source.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,320,240);
    if(!navigator.mediaDevices || typeof source.captureStream!=='function') return;
    const control={source,requests:0,streams:[],pending:[],mode:'ok',
      stream(){const stream=source.captureStream(15);this.streams.push(stream);return stream;},
      feed({width,height,rgba}){source.width=width;source.height=height;const bytes=Uint8ClampedArray.from(atob(rgba),c=>c.charCodeAt(0));ctx.putImageData(new ImageData(bytes,width,height),0,0);},
      allStopped(){return this.streams.every(stream=>stream.getTracks().every(track=>track.readyState==='ended'));}};
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async options=>{
      if(options.audio!==false || options.video.facingMode.ideal!=='environment') throw new Error('unexpected media permissions');
      control.requests++;
      if(control.mode==='denied') throw new DOMException('denied','NotAllowedError');
      if(control.mode==='pending') return new Promise(resolve=>control.pending.push(resolve));
      return control.stream();
    }});
    // A camera supplies continuous frames even when its scene is stationary.
    setInterval(()=>ctx.drawImage(source,0,0),66);
    window.__walkingMedia=control;
  });
}
export async function feedWalkingFrame(page,image) {
  await page.evaluate(frame=>window.__walkingMedia.feed(frame),{width:image.width,height:image.height,rgba:Buffer.from(image.data).toString('base64')});
}
