const pattern=['111111','110001','110111','101101','111011','111111'];
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((sum,value,k)=>sum+value*b[k][j],0)));
export function projectedMarker({width=320,height=240,size=.16,fieldOfView=60,position={x:0,y:0,z:-.7},yaw=0,pitch=0,roll=0,bits=pattern,noise=0,black=20,white=245}={}) {
  const c=Math.cos,s=Math.sin;
  const rotation=multiply(multiply([[c(roll),-s(roll),0],[s(roll),c(roll),0],[0,0,1]],[[1,0,0],[0,c(pitch),-s(pitch)],[0,s(pitch),c(pitch)]]),[[c(yaw),0,s(yaw)],[0,1,0],[-s(yaw),0,c(yaw)]]);
  const f=width/(2*Math.tan(fieldOfView*Math.PI/360)),cx=(width-1)/2,cy=(height-1)/2;
  const corners=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([x,y])=>{
    const q=[x*size-position.x,y*size-position.y,-position.z];
    const p=rotation.map(row=>row.reduce((sum,value,i)=>sum+value*q[i],0));
    return {x:f*p[0]/p[2]+cx,y:f*p[1]/p[2]+cy};
  });
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const ray=[(x-cx)/f,(y-cy)/f,1],world=rotation[0].map((_,j)=>rotation.reduce((sum,row,i)=>sum+row[j]*ray[i],0));
    const t=-position.z/world[2],px=position.x+t*world[0],py=position.y+t*world[1];
    const col=Math.floor((px/size+.5)*6),row=Math.floor((py/size+.5)*6);
    const value=col>=0 && col<6 && row>=0 && row<6 && bits[row][col]==='1' ? black : white;
    const i=(y*width+x)*4,n=noise*((x*73+y*41)%17-8)/8;
    data[i]=data[i+1]=data[i+2]=value+n;data[i+3]=255;
  }
  return {width,height,data,corners,position,forward:{x:rotation[2][0],y:rotation[2][1],z:rotation[2][2]}};
}
export function blankImage(width=320,height=240,value=245) {
  const data=new Uint8ClampedArray(width*height*4);data.fill(value);
  for(let i=3;i<data.length;i+=4) data[i]=255;
  return {width,height,data};
}
export function paint(image,test,value=20) {
  for(let y=0;y<image.height;y++) for(let x=0;x<image.width;x++) if(test(x,y)) {
    const i=(y*image.width+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=value;
  }
  return image;
}
