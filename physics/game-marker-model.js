export const WALKING_MARKER = Object.freeze(['111111','110001','110111','101101','111011','111111']);

const cross = (o,a,b) => (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
const dot = (a,b) => a.reduce((sum,value,i) => sum+value*b[i],0);
const length = a => Math.hypot(...a);
const unit = a => { const n=length(a); return n>1e-9 ? a.map(value=>value/n) : null; };

function solve(rows) {
  const n=rows.length;
  for (let col=0;col<n;col++) {
    let pivot=col;
    for (let row=col+1;row<n;row++) if (Math.abs(rows[row][col])>Math.abs(rows[pivot][col])) pivot=row;
    if (Math.abs(rows[pivot][col])<1e-9) return null;
    [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
    const scale=rows[col][col];
    for (let j=col;j<=n;j++) rows[col][j]/=scale;
    for (let row=0;row<n;row++) {
      if (row===col) continue;
      const factor=rows[row][col];
      for (let j=col;j<=n;j++) rows[row][j]-=factor*rows[col][j];
    }
  }
  return rows.map(row=>row[n]);
}

function homography(corners) {
  const rows=[];
  for (let i=0;i<4;i++) {
    const u=i===1 || i===2 ? 1 : 0, v=i>=2 ? 1 : 0, {x,y}=corners[i];
    rows.push([u,v,1,0,0,0,-u*x,-v*x,x],[0,0,0,u,v,1,-u*y,-v*y,y]);
  }
  return solve(rows);
}

function project(h,u,v) {
  const scale=h[6]*u+h[7]*v+1;
  return {x:(h[0]*u+h[1]*v+h[2])/scale,y:(h[3]*u+h[4]*v+h[5])/scale};
}

export function markerPose(corners,{width,height,size=.16,fieldOfView=60}={}) {
  if (!Array.isArray(corners) || corners.length!==4 || !corners.every(p=>Number.isFinite(p?.x) && Number.isFinite(p?.y)) ||
    ![width,height,size,fieldOfView].every(Number.isFinite) || width<32 || height<32 || size<.05 || size>.4 || fieldOfView<30 || fieldOfView>100) return null;
  const h=homography(corners);
  if (!h) return null;
  const f=width/(2*Math.tan(fieldOfView*Math.PI/360)), cx=(width-1)/2, cy=(height-1)/2;
  const a=[(h[0]-cx*h[6])/f,(h[3]-cy*h[6])/f,h[6]], b=[(h[1]-cx*h[7])/f,(h[4]-cy*h[7])/f,h[7]];
  const factor=2*size/(length(a)+length(b));
  const r1=unit(a), r2=unit(b.map((value,i)=>value-dot(b,r1 ?? [0,0,0])*(r1?.[i] ?? 0)));
  if (!r1 || !r2) return null;
  const r3=[r1[1]*r2[2]-r1[2]*r2[1],r1[2]*r2[0]-r1[0]*r2[2],r1[0]*r2[1]-r1[1]*r2[0]];
  const t=[(h[2]-cx)/f,(h[5]-cy)/f,1].map((value,i)=>value*factor+(r1[i]+r2[i])*size/2);
  if (t[2]<.12 || t[2]>3 || Math.abs(dot(a,b))/(length(a)*length(b))>.15) return null;
  const position={x:-dot(r1,t),y:-dot(r2,t),z:-dot(r3,t)};
  const forward={x:r1[2],y:r2[2],z:r3[2]};
  if (Math.hypot(forward.x,forward.z)<.35 || position.z>=-.1) return null;
  let error=0;
  for (let i=0;i<4;i++) {
    const x=(i===1 || i===2 ? .5 : -.5)*size, y=(i>=2 ? .5 : -.5)*size;
    const p=t.map((value,j)=>value+r1[j]*x+r2[j]*y);
    error=Math.max(error,Math.hypot(f*p[0]/p[2]+cx-corners[i].x,f*p[1]/p[2]+cy-corners[i].y));
  }
  if (!Number.isFinite(error) || error>3) return null;
  return {position,forward,corners:corners.map(p=>({...p})),error};
}

function quadrilateral(points) {
  points.sort((a,b)=>a.x-b.x || a.y-b.y);
  const lower=[], upper=[];
  for (const p of points) { while (lower.length>1 && cross(lower.at(-2),lower.at(-1),p)<=0) lower.pop(); lower.push(p); }
  for (let i=points.length-1;i>=0;i--) { const p=points[i]; while (upper.length>1 && cross(upper.at(-2),upper.at(-1),p)<=0) upper.pop(); upper.push(p); }
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
  while (hull.length>4) {
    let index=0, area=Infinity;
    for (let i=0;i<hull.length;i++) { const a=Math.abs(cross(hull[(i+hull.length-1)%hull.length],hull[i],hull[(i+1)%hull.length])); if (a<area) {area=a;index=i;} }
    hull.splice(index,1);
  }
  if (hull.length!==4 || hull.some((p,i)=>Math.hypot(p.x-hull[(i+1)%4].x,p.y-hull[(i+1)%4].y)<24)) return null;
  const lines=hull.map((a,i)=>{
    const b=hull[(i+1)%4],dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);
    const samples=points.filter(p=>{const along=((p.x-a.x)*dx+(p.y-a.y)*dy)/(n*n);return along>.12 && along<.88 && Math.abs(cross(a,b,p))/n<1.4;});
    if (samples.length<6) return null;
    const x=samples.reduce((sum,p)=>sum+p.x,0)/samples.length,y=samples.reduce((sum,p)=>sum+p.y,0)/samples.length;
    let xx=0,yy=0,xy=0;
    for (const p of samples) {xx+=(p.x-x)**2;yy+=(p.y-y)**2;xy+=(p.x-x)*(p.y-y);}
    const angle=.5*Math.atan2(2*xy,xx-yy);let nx=-Math.sin(angle),ny=Math.cos(angle);
    if (nx*(-dy)+ny*dx<0) {nx=-nx;ny=-ny;}
    // Pixel centers lie inside the black edge; fit full edges rather than noisy corner pixels.
    return {nx,ny,d:nx*x+ny*y-.5};
  });
  if (lines.some(line=>!line)) return hull;
  return lines.map((b,i)=>{
    const a=lines[(i+3)%4],det=a.nx*b.ny-a.ny*b.nx;
    return {x:(a.d*b.ny-a.ny*b.d)/det,y:(a.nx*b.d-a.d*b.nx)/det};
  });
}

export function detectWalkingMarker(image,options={}) {
  const {width,height,data}=image ?? {};
  if (!Number.isInteger(width) || !Number.isInteger(height) || width<32 || height<32 || width*height>640*640 || !data || data.length!==width*height*4) return null;
  const n=width*height, gray=new Uint8Array(n), histogram=new Uint32Array(256);
  let total=0, min=255, max=0;
  for (let i=0;i<n;i++) { const value=(data[i*4]+2*data[i*4+1]+data[i*4+2])>>2; gray[i]=value; histogram[value]++; total+=value; min=Math.min(min,value);max=Math.max(max,value); }
  if (max-min<40) return null;
  let count=0,sum=0,score=-1,threshold=min;
  for (let i=min;i<max;i++) {
    count+=histogram[i];sum+=histogram[i]*i;
    const contrast=count*(n-count)*(sum/count-(total-sum)/(n-count))**2;
    if (contrast>score) {score=contrast;threshold=i;}
  }
  const seen=new Uint8Array(n), stack=new Uint32Array(n); let found=null;
  for (let start=0;start<n;start++) {
    if (seen[start] || gray[start]>threshold) continue;
    let head=0,tail=1,minX=width,maxX=0,minY=height,maxY=0;
    const points=[]; stack[0]=start;seen[start]=1;
    while (head<tail) {
      const index=stack[head++],x=index%width,y=Math.floor(index/width);let edge=false;
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      for (const next of [x ? index-1 : -1,x<width-1 ? index+1 : -1,y ? index-width : -1,y<height-1 ? index+width : -1]) {
        if (next<0 || gray[next]>threshold) {edge=true;continue;}
        if (!seen[next]) {seen[next]=1;stack[tail++]=next;}
      }
      if (edge) points.push({x,y});
    }
    if (tail<120 || minX===0 || minY===0 || maxX===width-1 || maxY===height-1 || maxX-minX<24 || maxY-minY<24) continue;
    const corners=quadrilateral(points);
    if (!corners) continue;
    for (let rotation=0;rotation<4;rotation++) {
      const ordered=corners.map((_,i)=>corners[(i+rotation)%4]), h=homography(ordered);
      let matches=true;
      for (let row=0;row<6 && matches;row++) for (let col=0;col<6;col++) {
        let black=0;
        for (const [du,dv] of [[0,0],[-.12,0],[.12,0],[0,-.12],[0,.12]]) {
          const p=project(h,(col+.5+du)/6,(row+.5+dv)/6), x=Math.round(p.x), y=Math.round(p.y);
          if (x>=0 && x<width && y>=0 && y<height && gray[y*width+x]<=threshold) black++;
        }
        if ((black>=3 ? '1' : '0')!==WALKING_MARKER[row][col]) {matches=false;break;}
      }
      if (!matches) continue;
      const pose=markerPose(ordered,{...options,width,height});
      if (pose) { if (found) return null; found=pose; }
      break;
    }
  }
  return found;
}
