import { makeParticles, particlePosition, waterState, buoyancy } from './game-model.js';
import { createAdventureWorld } from './game-adventure-world.js';

const vertexSource = `
attribute vec3 aPosition;
attribute vec4 aColor;
uniform vec3 uEye;
uniform vec2 uLook;
uniform float uAspect;
varying vec4 vColor;
varying float vDepth;
void main() {
  vec3 p = aPosition - uEye;
  float sy = sin(uLook.x), cy = cos(uLook.x);
  float sp = sin(uLook.y), cp = cos(uLook.y);
  float depth = p.x * sy - p.z * cy;
  float z = depth * cp + p.y * sp;
  gl_Position = vec4((p.x * cy + p.z * sy) * 1.55 / uAspect,
    (p.y * cp - depth * sp) * 1.55, 1.001 * z - 0.10005, z);
  vColor = aColor;
  vDepth = z;
}`;
const fragmentSource = `
precision mediump float;
varying vec4 vColor;
varying float vDepth;
uniform vec3 uSky;
void main() {
  float fog = clamp((vDepth - 18.0) / 110.0, 0.0, 0.88);
  gl_FragColor = vec4(mix(vColor.rgb, uSky, fog), vColor.a);
}`;
const brown = [.36, .24, .14], wood = [.61, .42, .23], cyan = [.02, .73, .88];

function triangle(list, a, b, c, color) {
  const u = b.map((v, i) => v - a[i]), v = c.map((n, i) => n - a[i]);
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const length = Math.hypot(...n) || 1;
  const light = .63 + .37 * Math.abs((n[0] * .3 + n[1] * .85 + n[2] * .4) / length);
  for (const point of [a, b, c]) list.push(...point, ...color.slice(0, 3).map(channel => channel * light), color[3] ?? 1);
}
function quad(list, a, b, c, d, color) { triangle(list, a, b, c, color); triangle(list, a, c, d, color); }
function box(list, x, y, z, w, h, d, color) {
  const p = [[x-w/2,y-h/2,z-d/2], [x+w/2,y-h/2,z-d/2], [x+w/2,y+h/2,z-d/2], [x-w/2,y+h/2,z-d/2],
    [x-w/2,y-h/2,z+d/2], [x+w/2,y-h/2,z+d/2], [x+w/2,y+h/2,z+d/2], [x-w/2,y+h/2,z+d/2]];
  for (const face of [[0,1,2,3], [5,4,7,6], [4,0,3,7], [1,5,6,2], [3,2,6,7], [4,5,1,0]]) quad(list, ...face.map(i => p[i]), color);
}
function sphere(list, x, y, z, r, color) {
  const point = (a, b) => [x + r * Math.sin(a) * Math.cos(b), y + r * Math.cos(a), z + r * Math.sin(a) * Math.sin(b)];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) {
    const a = i * Math.PI / 6, b = j * Math.PI / 4;
    quad(list, point(a,b), point(a+Math.PI/6,b), point(a+Math.PI/6,b+Math.PI/4), point(a,b+Math.PI/4), color);
  }
}
function ring(list, x, y, z, radius, color) {
  for (let i = 0; i < 32; i++) {
    const a = i * Math.PI / 16, b = (i + 1) * Math.PI / 16;
    quad(list, [x+Math.cos(a)*radius,y+Math.sin(a)*radius,z], [x+Math.cos(b)*radius,y+Math.sin(b)*radius,z],
      [x+Math.cos(b)*(radius-.12),y+Math.sin(b)*(radius-.12),z], [x+Math.cos(a)*(radius-.12),y+Math.sin(a)*(radius-.12),z], color);
  }
}
function coastGeometry() {
  const list = [];
  box(list, 0,-.18,0,17,.35,23,brown);
  for (let x = -8; x <= 8; x += .45) box(list,x,.02,0,.43,.05,23,wood);
  for (const x of [-8,8]) for (let z = -11; z <= 11; z += 2.5) { box(list,x,.55,z,.12,1.1,.12,brown); }
  for (const x of [-8,8]) box(list,x,.85,0,.09,.1,23,wood);
  for (const x of [-5,5]) for (const z of [-9,-2]) box(list,x,1.7,z,.2,3.4,.2,brown);
  box(list,0,3.5,-5.5,11,.18,8,[.84,.78,.60]);
  for (const x of [-1.6,1.6]) for (const z of [-6,-3]) box(list,x,.13,z,.15,.26,.15,brown);
  box(list,0,.30,-4.5,3.6,.14,3.6,wood);
  box(list,0,.42,-4.5,2.6,.10,2.6,[.16,.25,.3]);
  for (const x of [-1.35,1.35]) for (const z of [-5.9,-3.1]) box(list,x,1,z,.045,1.14,.045,cyan);
  for (const y of [.47,1.57]) {
    for (const x of [-1.35,1.35]) box(list,x,y,-4.5,.045,.045,2.8,cyan);
    for (const z of [-5.9,-3.1]) box(list,0,y,z,2.8,.045,.045,cyan);
  }
  for (const z of [-5.9,-3.1]) box(list,0,1.45,z,2.6,.018,.018,[.55,.94,1]);
  box(list,3.5,.7,-7,1.8,1.4,1.8,[.14,.22,.26]);
  sphere(list,3.5,1.8,-7,.36,[.2,.85,1]);
  ring(list,3.5,2,-7.5,1.1,[1,.77,.26]);
  for (let i = 0; i < 8; i++) sphere(list,-30+i*13,-1,-50-i*8,8+i%3,[.14,.34,.29]);
  return list;
}
function moleculeGeometry() {
  const list = [];
  box(list,0,-.25,0,18,.5,20,[.04,.08,.14]);
  for (let i = -8; i <= 8; i++) {
    box(list,i,.005,0,.018,.015,20,[.09,.23,.3]);
    box(list,0,.005,i,18,.015,.018,[.09,.23,.3]);
  }
  for (const x of [-3.6,3.6]) for (const z of [-7,-1]) box(list,x,2,z,.05,4,.05,cyan);
  for (const y of [0,4]) for (const z of [-7,-1]) box(list,0,y,z,7.2,.05,.05,cyan);
  ring(list,0,2.3,-9,2.2,[1,.77,.26]);
  return list;
}

export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('WebGL shader compilation failed'); }
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  let fs;
  try { fs = compile(gl.FRAGMENT_SHADER, fragmentSource); }
  catch (error) { gl.deleteShader(vs); throw error; }
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); throw new Error('WebGL program linking failed'); }
  const buffer = gl.createBuffer();
  const position = gl.getAttribLocation(program, 'aPosition'), color = gl.getAttribLocation(program, 'aColor');
  const eye = gl.getUniformLocation(program, 'uEye'), look = gl.getUniformLocation(program, 'uLook');
  const aspect = gl.getUniformLocation(program, 'uAspect'), sky = gl.getUniformLocation(program, 'uSky');
  const shore = coastGeometry(), micro = moleculeGeometry(), particles = makeParticles();
  const adventureWorld = createAdventureWorld({box,sphere,ring,quad});
  const oxygen = [], hydrogen = [];
  sphere(oxygen,0,0,0,.105,[.95,.25,.34]); sphere(hydrogen,0,0,0,.065,[.91,.96,1]);
  function translated(list,mesh,x,y,z) {
    for (let i=0;i<mesh.length;i+=7) list.push(mesh[i]+x,mesh[i+1]+y,mesh[i+2]+z,mesh[i+3],mesh[i+4],mesh[i+5],mesh[i+6]);
  }
  function draw(list) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(list), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, list.length / 7);
  }
  return {
    render(state) {
      const w = Math.max(1, Math.round(canvas.clientWidth * state.dpr)), h = Math.max(1, Math.round(canvas.clientHeight * state.dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const isCoast = state.scene === 'coast', background = state.mode === 'adventure' ? [.24,.34,.41] : isCoast ? [.24,.47,.59] : [.025,.045,.085];
      gl.viewport(0,0,w,h); gl.clearColor(...background,1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,3,gl.FLOAT,false,28,0);
      gl.enableVertexAttribArray(color); gl.vertexAttribPointer(color,4,gl.FLOAT,false,28,12);
      gl.uniform3fv(eye, [state.camera.x,state.camera.y,state.camera.z]);
      gl.uniform2f(look,state.camera.yaw,state.camera.pitch); gl.uniform1f(aspect,w/h); gl.uniform3fv(sky,background);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(true);
      if (state.mode === 'adventure') {
        const world = adventureWorld(state);
        draw(world.opaque);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        draw(world.water); draw(world.light); gl.depthMask(true);
        return;
      }
      const list = [...(isCoast ? shore : micro)];
      const water = waterState(state.heat);
      if (isCoast) {
        const rho = buoyancy(state.density), target = rho.floating ? 1.45 + .7 * (.5-rho.submergedFraction) : .82;
        const age = Math.min(state.releaseAge,8);
        const bodyY = state.released ? Math.max(.82,target + (2.45-target)*Math.exp(-age*1.8)*Math.cos(age*2)) : 2.45;
        box(list,0,bodyY,-4.5,.7,.7,.7,state.density === 650 ? [.8,.51,.23] : [.6,.68,.73]);
        box(list,-.6,bodyY+.8,-4.5,.07,.7,.07,[1,.77,.26]);
        box(list,.6,bodyY-.5,-4.5,.07,.7,.07,cyan);
        sphere(list,35,35,-100,6,[1,.88,.53]);
      } else {
        for (const particle of particles) {
          const p = particlePosition(particle,state.time,water), x = p.x*.9, y = 2+p.y*.65, z = -4+p.z*.9;
          translated(list,oxygen,x,y,z);
          translated(list,hydrogen,x+.12,y+.08,z); translated(list,hydrogen,x-.12,y+.08,z);
        }
        if (state.scene === 'heat') {
          const fraction = state.heat / 32;
          box(list,4.5,1.6,-4,.25,3.2,.25,[.14,.24,.31]);
          box(list,4.5,fraction*1.6,-3.8,.28,Math.max(.02,fraction*3.2),.15,[1,.65,.2]);
          ring(list,0,2.3,-9,2.45,[1,.55,.17]);
        }
      }
      draw(list);
      if (isCoast) {
        const waterMesh = [];
        for (let x = -60; x < 60; x += 6) for (let z = -90; z < 40; z += 6) {
          const wave = (a,b) => -.9 + .12*Math.sin(a*.3+b*.2+state.time);
          quad(waterMesh,[x,wave(x,z),z],[x+6,wave(x+6,z),z],[x+6,wave(x+6,z+6),z+6],[x,wave(x,z+6),z+6],[.06,.43,.59]);
        }
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        quad(waterMesh,[-1.3,1.45,-5.8],[1.3,1.45,-5.8],[1.3,1.45,-3.2],[-1.3,1.45,-3.2],[.13,.72,.87,.38]);
        draw(waterMesh); gl.depthMask(true);
      }
    },
    dispose() { gl.deleteBuffer(buffer); gl.deleteProgram(program); }
  };
}
