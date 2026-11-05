(function () {
'use strict';
const C = window.CONTENT;
const W = 12, WH = 7.2, PI = Math.PI, TAU = PI * 2;

/* =====================================================================
   helpers
   ===================================================================== */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd = mulberry(11);
const px = (g,c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function pixTex(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');draw(g,w,h);
  const t=new THREE.CanvasTexture(c);
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
  return t;
}
const lerp=(a,b,k)=>a+(b-a)*k;
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
const turn=(a,b,k)=>{const d=((b-a+PI)%TAU+TAU)%TAU-PI;return a+d*Math.min(1,k);};
const shortest=(a,b)=>a+(((b-a+PI)%TAU+TAU)%TAU-PI);
function tween(ms,fn){return new Promise(res=>{const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/ms);fn(ease(k),k);k<1?requestAnimationFrame(f):res();})(t0);});}

/* =====================================================================
   renderer / scene / camera
   ===================================================================== */
/* =====================================================================
   sound effects — all synthesised with WebAudio (no audio files)
   ===================================================================== */
const SFX=(function(){
  let ctx=null,master=null,nbuf=null,water=null,muted=false;
  try{muted=localStorage.getItem('sfxMuted')==='1';}catch(e){}
  const ok=()=>ctx&&!muted&&ctx.state==='running';
  function init(){
    if(!ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:0.55;master.connect(ctx.destination);
      nbuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    }
    if(ctx.state==='suspended')ctx.resume();
  }
  function env(g,t0,a,d,v){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+d);}
  function tone(f,dur,o={}){
    if(!ok())return;const t0=ctx.currentTime+(o.delay||0),os=ctx.createOscillator(),g=ctx.createGain();
    os.type=o.type||'square';os.frequency.setValueAtTime(f,t0);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t0+dur);
    env(g,t0,0.006,dur,o.v||0.1);os.connect(g);g.connect(master);os.start(t0);os.stop(t0+dur+0.05);
  }
  function noise(dur,o={}){
    if(!ok())return;const t0=ctx.currentTime+(o.delay||0),s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=nbuf;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.fc||1000,t0);if(o.fc2)f.frequency.exponentialRampToValueAtTime(o.fc2,t0+dur);f.Q.value=o.q||1;
    env(g,t0,o.a||0.004,dur,o.v||0.2);s.connect(f);f.connect(g);g.connect(master);s.start(t0,Math.random()*0.5);s.stop(t0+dur+0.05);
  }
  return {
    init,
    get muted(){return muted;},
    setMuted(m){muted=m;try{localStorage.setItem('sfxMuted',m?'1':'0');}catch(e){}if(master)master.gain.value=m?0:0.55;if(m)this.waterStop();},
    tick(){tone(1100,0.03,{v:0.04});},
    pop(){tone(420,0.09,{type:'sine',f2:880,v:0.16});tone(880,0.07,{type:'square',v:0.05,delay:0.05});},
    step(){const r=0.85+Math.random()*0.3;noise(0.06,{fc:900*r,q:2,v:0.22});tone(170*r,0.06,{type:'sine',v:0.14});},
    hop(){tone(260,0.16,{type:'sine',f2:620,v:0.14});},
    land(){tone(150,0.12,{type:'sine',f2:60,v:0.22});noise(0.08,{fc:500,type:'lowpass',v:0.25});},
    soft(){noise(0.25,{fc:420,type:'lowpass',v:0.3,a:0.02});tone(110,0.2,{type:'sine',f2:70,v:0.14});},
    whoosh(){noise(0.38,{fc:300,fc2:2400,q:1.2,v:0.14,a:0.12});},
    whooshBack(){noise(0.3,{fc:2200,fc2:300,q:1.2,v:0.1,a:0.05});},
    blip(){tone(480+Math.random()*320,0.035,{v:0.045});},
    chime(){tone(784,0.14,{type:'triangle',v:0.12});tone(1175,0.22,{type:'triangle',v:0.1,delay:0.09});},
    sparkle(){[1047,1319,1568,2093].forEach((f,i)=>tone(f,0.18,{type:'triangle',v:0.09,delay:i*0.07}));},
    waterStart(){
      if(!ok()||water)return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),h=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=nbuf;s.loop=true;f.type='bandpass';f.frequency.value=3200;f.Q.value=0.7;h.type='highpass';h.frequency.value=1500;
      g.gain.setValueAtTime(0.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.16,ctx.currentTime+0.15);
      s.connect(f);f.connect(h);h.connect(g);g.connect(master);s.start();water={s,g};
    },
    waterStop(){
      if(!water)return;const {s,g}=water;water=null;
      try{g.gain.cancelScheduledValues(ctx.currentTime);g.gain.setValueAtTime(g.gain.value||0.1,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.25);s.stop(ctx.currentTime+0.3);}catch(e){}
    }
  };
})();
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,()=>SFX.init(),{once:false,passive:true}));

const hero=document.getElementById('hero');
const canvas=document.getElementById('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-1,1,1,-1,-300,500);

scene.add(new THREE.HemisphereLight(0xffffff,0xf0ddf2,0.68));
const sun=new THREE.DirectionalLight(0xfff3e4,0.55);
sun.position.set(22,26,9); sun.target.position.set(6,0,6);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:90});
sun.shadow.bias=-0.0007; sun.shadow.radius=3;
scene.add(sun,sun.target);

const room=new THREE.Group(); scene.add(room);

/* =====================================================================
   voxel building helpers
   ===================================================================== */
const noiseTex=pixTex(8,8,g=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){const v=rnd()<.12?222:232+Math.floor(rnd()*24);px(g,`rgb(${v},${v},${v})`,x,y);}});
noiseTex.wrapS=noiseTex.wrapT=THREE.RepeatWrapping;
const matCache={};
function lam(color,map){
  map=map||noiseTex; const k=color+'|'+map.uuid;
  return matCache[k]||(matCache[k]=new THREE.MeshLambertMaterial({color,map}));
}
function boxGeo(sx,sy,sz,d){
  const g=new THREE.BoxGeometry(sx,sy,sz),uv=g.attributes.uv;
  const dims=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){const n=f*4+i;uv.setXY(n,uv.getX(n)*dims[f][0]*d,uv.getY(n)*dims[f][1]*d);}
  return g;
}
let cur=room, curKey=null; const stack=[]; const parts={};
function reg(m){m.userData.key=curKey; if(curKey)(parts[curKey]=parts[curKey]||[]).push(m);}
function B(x,y,z,sx,sy,sz,color,o={}){
  const m=new THREE.Mesh(boxGeo(sx,sy,sz,o.density||1),o.basic?new THREE.MeshBasicMaterial({color}):lam(color,o.map));
  m.position.set(x+sx/2,y+sy/2,z+sz/2);
  m.castShadow=o.cast!==false&&!o.basic; m.receiveShadow=o.recv!==false;
  cur.add(m); reg(m); return m;
}
// textured plane. face 'x' => faces +x (left wall), 'z' => faces +z (right wall), 'y' => faces up
function P(cx,cy,cz,w,h,tex,face,o={}){
  const mat=o.basic?new THREE.MeshBasicMaterial({map:tex}):new THREE.MeshLambertMaterial({map:tex});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  if(face==='x')m.rotation.y=PI/2; if(face==='y')m.rotation.x=-PI/2;
  if(o.rz)m.rotation.z=o.rz;
  m.position.set(cx,cy,cz); m.receiveShadow=!o.basic; cur.add(m); reg(m); return m;
}
function open(g){stack.push(cur);cur.add(g);cur=g;return g;}
function close(){cur=stack.pop();}
function begin(key){curKey=key;} function end(){curKey=null;}
const PAST=['#ffb8cf','#b8d8ff','#c4f0d6','#ffe2a8','#d8c8ff','#ffd0b8','#a8e8e0','#f4c0e8'];

/* =====================================================================
   pixel textures
   ===================================================================== */
const wallTex=pixTex(16,16,g=>{px(g,'#ffffff',0,0,16,16);for(const [x,y] of [[3,3],[11,11]])px(g,'#ece6f2',x,y,2,2);for(const [x,y] of [[3,11],[11,3]])px(g,'#f6f2fa',x,y,1,1);});
wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;
const plankTex=pixTex(16,16,g=>{
  const cols=['#f4dcc1','#efd4b6','#f7e3ca','#ebcfb0'];
  for(let r=0;r<4;r++){px(g,cols[r],0,r*4,16,4);px(g,'#dcc0a0',0,r*4,16,1);px(g,'#dcc0a0',(r*5+3)%16,r*4,1,4);
    for(let i=0;i<5;i++)px(g,'rgba(255,255,255,.28)',Math.floor(rnd()*16),r*4+1+Math.floor(rnd()*3));}
});
plankTex.wrapS=plankTex.wrapT=THREE.RepeatWrapping; plankTex.repeat.set(6,6);
const holeTex=pixTex(8,8,g=>{px(g,'#ffffff',0,0,8,8);px(g,'#bfa57e',3,3,2,2);});
holeTex.wrapS=holeTex.wrapT=THREE.RepeatWrapping;

function skyTex(){return pixTex(28,20,g=>{
  for(let y=0;y<20;y++){const k=y/19;px(g,`rgb(${Math.round(lerp(176,255,k))},${Math.round(lerp(222,226,k))},${Math.round(lerp(255,236,k))})`,0,y,28,1);}
  for(const [x,y,w] of [[3,4,6],[16,3,7],[11,9,5],[22,10,5]]){px(g,'#fff',x,y,w,2);px(g,'#fff',x+1,y-1,w-2,1);}
  px(g,'#bfe8c8',0,15,28,5);for(let x=0;x<28;x++){const h=2+Math.round(1.6*Math.sin(x/3));px(g,'#a6dcb6',x,15-h+2,1,h);}
  px(g,'#ffe9a0',22,2,3,3);
});}
function monitorTex(){return pixTex(24,14,g=>{
  px(g,'#2f2a45',0,0,24,14);px(g,'#4a4268',0,0,24,2);px(g,'#ff9ab8',1,0,1,1);px(g,'#ffe08f',3,0,1,1);px(g,'#9fe8c0',5,0,1,1);
  const cs=['#ff9ab8','#9fd0ff','#ffe08f','#9fe8c0','#d0b8ff'];
  for(let r=0;r<9;r++){let x=2+(r%3)*2;const n=1+Math.floor(rnd()*3);for(let i=0;i<n;i++){const w=2+Math.floor(rnd()*5);px(g,cs[Math.floor(rnd()*5)],x,3+r,w,1);x+=w+1;}}
});}
function posterA(){return pixTex(14,20,g=>{
  for(let y=0;y<20;y++){const k=y/19;px(g,`rgb(${Math.round(lerp(176,255,k))},${Math.round(lerp(160,205,k))},${Math.round(lerp(232,222,k))})`,0,y,14,1);}
  for(let i=0;i<9;i++)px(g,'#fff',Math.floor(rnd()*14),Math.floor(rnd()*9));
  for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)if(x*x+y*y<=17)px(g,'#fff6c8',7+x,7+y);
  for(let x=0;x<14;x++){const h=Math.round(2.2*Math.sin(x/2.2));px(g,'#8f86c9',x,13-h,1,20);const h2=Math.round(2*Math.sin(x/1.7+2));px(g,'#6f66b0',x,16-h2,1,20);}
});}
function posterB(){return pixTex(16,20,g=>{
  for(let y=0;y<14;y++){const k=y/13;px(g,`rgb(255,${Math.round(lerp(177,226,k))},${Math.round(lerp(153,160,k))})`,0,y,16,1);}
  for(let y=-5;y<=0;y++)for(let x=-5;x<=5;x++)if(x*x+y*y<=26)px(g,'#fff4c0',8+x,12+y);
  for(let y=13;y<20;y++)px(g,y%2?'#7fc8e8':'#a5dbf0',0,y,16,1);
  for(let i=0;i<8;i++)px(g,'#fff',Math.floor(rnd()*16),14+Math.floor(rnd()*6),2,1);
});}
function posterC(){return pixTex(18,10,g=>{
  px(g,'#d2f0e6',0,0,18,10);
  for(const [cx,h,c] of [[5,6,'#a7d8c4'],[12,7,'#8fc8b4']]){for(let y=0;y<h;y++)px(g,c,cx-y,9-h+y+1,y*2+1,1);px(g,'#fff',cx,10-h,1,1);}
  px(g,'#ffe9a0',14,1,2,2);
  for(const x of [1,15,16]){px(g,'#5fa88c',x,6,1,3);px(g,'#5fa88c',x-1,7,3,1);}
});}
function photoTex(seed){const r=mulberry(seed*97+5);return pixTex(10,10,g=>{
  const skies=[['#bfe3ff','#ffe6f0'],['#ffc6a8','#ffe8a8'],['#c8b8ff','#ffd0e0'],['#a8e8ff','#e8fff4']];
  const gr=['#9fd8a8','#f4dcb0','#a8c8f0','#c0e8c8'];
  const s=skies[Math.floor(r()*4)];
  for(let y=0;y<10;y++){px(g,y<5?s[0]:s[1],0,y,10,1);}
  px(g,'#fff4b8',1+Math.floor(r()*6),1,2,2);
  const gc=gr[Math.floor(r()*4)];px(g,gc,0,7,10,3);
  if(r()<.6){const mx=2+Math.floor(r()*5);for(let y=0;y<4;y++)px(g,'#8f9fc8',mx-y,6-y+1,y*2+1,1);}
  else{px(g,'#e8a8b8',2,5,3,3);px(g,'#fff',3,6,1,1);px(g,'#c88898',2,4,3,1);px(g,'#b8d8a8',7,5,1,3);px(g,'#98c888',6,4,3,2);}
});}
const mirrorCanvas=document.createElement('canvas');mirrorCanvas.width=20;mirrorCanvas.height=30;
const mirrorG=mirrorCanvas.getContext('2d');
const mirrorTex=new THREE.CanvasTexture(mirrorCanvas);mirrorTex.magFilter=mirrorTex.minFilter=THREE.NearestFilter;mirrorTex.generateMipmaps=false;
let mirrorLast=0;
function mirrorUpdate(now){
  if(now-mirrorLast<90)return;mirrorLast=now;const g=mirrorG;
  for(let y=0;y<30;y++){const k=y/29;px(g,`rgb(${Math.round(lerp(226,250,k))},${Math.round(lerp(238,226,k))},${Math.round(lerp(255,246,k))})`,0,y,20,1);}
  // faint reflected room: pink wall, lavender wall, floor strip
  px(g,'rgba(255,200,220,.35)',0,6,9,15);px(g,'rgba(210,196,245,.35)',9,6,11,15);px(g,'rgba(250,225,190,.45)',0,21,20,9);
  px(g,'rgba(255,255,255,.5)',7,0,2,8);
  // sweeping shine
  const s=((now/70)%90)-30;
  for(let y=0;y<30;y++){px(g,'rgba(255,255,255,.55)',Math.floor(s+y*0.7),y,3,1);px(g,'rgba(255,255,255,.35)',Math.floor(s+y*0.7)+5,y,1,1);}
  mirrorTex.needsUpdate=true;
}
mirrorUpdate(1e5);

/* =====================================================================
   the ROOM
   ===================================================================== */
// floor slab (layered like a minecraft chunk)
B(-0.5,-0.4,-0.5,W+0.5,0.4,W+0.5,'#f2dbe8');
B(-0.5,-0.8,-0.5,W+0.5,0.4,W+0.5,'#d7c4ec');
const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,W),new THREE.MeshLambertMaterial({map:plankTex}));
floor.rotation.x=-PI/2;floor.position.set(W/2,0.01,W/2);floor.receiveShadow=true;floor.userData.key=null;room.add(floor);

// walls
function wall(axis){
  if(axis==='x'){ // left wall at x=0 spans z
    B(-0.5,0,-0.5,0.5,WH,W+0.5,'#f9dbe5',{map:wallTex,density:.5});
    B(0,0,0,0.12,1.5,W,'#f1c4d4');B(0,1.5,0,0.2,0.16,W,'#fffaf0');B(0,0,0,0.22,0.35,W,'#fffaf0');
    B(-0.5,WH,-0.5,0.5,0.16,W+0.5,'#ffffff');
  }else{ // right wall at z=0 spans x
    B(0,0,-0.5,W,WH,0.5,'#e5dcf8',{map:wallTex,density:.5});
    B(0.2,0,0,W-0.2,1.5,0.12,'#d3c4f0');B(0.2,1.5,0,W-0.2,0.16,0.2,'#fffaf0');B(0.2,0,0,W-0.2,0.35,0.22,'#fffaf0');
    B(0,WH,-0.5,W,0.16,0.5,'#ffffff');
  }
}
wall('x');wall('z');

// rug
B(3.7,0,6.4,5.4,0.06,4.0,'#c6ecdb');B(4.0,0.06,6.7,4.8,0.03,3.4,'#fdf0b8');B(4.4,0.09,7.1,4.0,0.03,2.6,'#f8c8dc');
for(let i=0;i<6;i++){B(3.5,0,6.6+i*0.6,0.2,0.06,0.25,'#fffaf0');B(9.1,0,6.6+i*0.6,0.2,0.06,0.25,'#fffaf0');}

/* ---------- window (right wall, above desk) ---------- */
P(5.9,5.4,0.03,2.8,2.0,skyTex(),'z',{basic:true});
B(4.3,6.5,0,3.2,0.2,0.2,'#ffffff');B(4.2,4.2,0,3.4,0.2,0.45,'#ffffff');
B(4.3,4.4,0,0.2,2.1,0.2,'#ffffff');B(7.3,4.4,0,0.2,2.1,0.2,'#ffffff');
B(5.8,4.4,0.02,0.12,2.1,0.14,'#ffffff');B(4.5,5.35,0.02,2.8,0.12,0.14,'#ffffff');
B(3.7,4.0,0.05,0.55,2.9,0.35,'#ffc4d8');B(3.7,6.7,0.0,0.55,0.15,0.4,'#e89ab8');
B(7.5,4.0,0.05,0.55,2.9,0.35,'#ffc4d8');B(7.5,6.7,0.0,0.55,0.15,0.4,'#e89ab8');
B(3.95,4.4,0.4,0.05,2.5,0.05,'#f0a8c4',{});B(7.85,4.4,0.4,0.05,2.5,0.05,'#f0a8c4');
// window sill plant
B(4.6,4.4,0.1,0.35,0.3,0.3,'#f4c2a8');B(4.68,4.7,0.18,0.18,0.3,0.14,'#9fd8a8');B(4.55,4.85,0.2,0.1,0.15,0.1,'#9fd8a8');

/* ---------- posters (static) ---------- */
function posterFrame(x,y,z,w,h,face,tex){
  if(face==='x'){B(0,y,z,0.1,h,w,'#fffaf0');P(0.11,y+h/2,z+w/2,w-0.2,h-0.2,tex,'x');}
  else{B(x,y,0,w,h,0.1,'#fffaf0');P(x+w/2,y+h/2,0.11,w-0.2,h-0.2,tex,'z');}
}
posterFrame(0,2.9,5.25,1.4,2.0,'x',posterA());
posterFrame(0,5.8,8.2,1.9,1.15,'x',posterC());
posterFrame(8.1,3.6,0,0.8,1.5,'z',posterB());

/* ---------- fairy lights ---------- */
{const cs=['#fff2a8','#ffc8dc','#c8e8ff','#d8ffe0','#ffe0b8'];
 for(let i=0;i<24;i++){const x=0.35+i*0.5,sag=Math.sin(((i%8)+0.5)/8*PI)*0.45;const c=cs[i%5];
   B(x,6.75-sag,0.06,0.14,0.14,0.14,c,{basic:true});if(i%8===0)B(x-.03,6.85,0.04,.06,.2,.06,'#b8a8c8');}
 for(let i=0;i<22;i++){const z=0.9+i*0.5,sag=Math.sin(((i%8)+0.5)/8*PI)*0.45;const c=cs[(i+2)%5];
   B(0.06,6.75-sag,z,0.14,0.14,0.14,c,{basic:true});}}

/* ---------- BED (+ iPad) ---------- */
begin('bed');
B(0.1,0,0.2,3.3,0.6,4.8,'#efcaa8');                       // frame
B(0.1,0,0.2,3.3,1.9,0.22,'#e5b890');                      // headboard
B(0.1,0,4.8,3.3,0.9,0.2,'#e5b890');                       // footboard
B(0.2,0.6,0.42,3.1,0.5,4.4,'#fff7ee');                    // mattress
B(0.2,1.1,3.0,3.1,0.18,1.8,'#bcd8f6');B(0.2,1.1,3.0,3.1,0.24,0.45,'#a4c6ee'); // blanket + fold
for(let i=0;i<5;i++)B(0.2+i*0.62,1.1,4.55,0.31,0.19,0.25,'#d2e4fa');
B(0.65,1.1,0.5,2.2,0.3,1.1,'#ffeef3');                    // pillow
B(0.35,1.1,0.5,0.35,0.22,0.9,'#d8c8ff');                  // small cushion
// iPad
{const g=open(new THREE.Group());g.position.set(1.8,1.28,4.1);g.rotation.y=0.22;
 B(-0.55,0,-0.75,1.1,0.07,1.5,'#e9e6f2');
 P(0,0.078,0,0.9,1.3,pixTex(12,17,gg=>{px(gg,'#2e2942',0,0,12,17);px(gg,'#121212',2,3,3,3);px(gg,'#1ed760',3,4,1,1);px(gg,'#ffffff',7,3,3,3);px(gg,'#ff9ab8',8,3,1,1);px(gg,'#8fd0ff',9,4,1,1);px(gg,'#ffe040',8,5,1,1);px(gg,'#ffe08f',2,8,3,3);px(gg,'#a8d8ff',7,8,3,3);px(gg,'#fff',4,14,4,1);}),'y',{basic:true});
 close();}
end();

const pegPhotos=[];
/* ---------- PEGBOARD (left wall, above bed) ---------- */
begin('peg');
B(0,3.2,0.6,0.12,3.0,4.3,'#f2e0c2',{map:holeTex,density:2});
B(0,3.15,0.55,0.18,0.08,4.4,'#e0bd96');B(0,6.17,0.55,0.18,0.08,4.4,'#e0bd96');
B(0,3.15,0.55,0.18,3.1,0.08,'#e0bd96');B(0,3.15,4.87,0.18,3.1,0.08,'#e0bd96');
{const rows=[[5.35,[1.2,2.25,3.3,4.35]],[4.1,[1.5,2.6,3.7]]];let n=0;
 for(const [y,zs] of rows)for(const z of zs){
   const g=open(new THREE.Group());g.position.set(0.14,y,z);g.rotation.x=(rnd()-.5)*0.28;
   B(0,-0.45,-0.375,0.04,0.9,0.75,'#fffdf8');
   {const ph=P(0.052,-0.2,0,0.6,0.58,photoTex(++n),'x');if(n<=C.travel.length&&C.travel[n-1].photo)pegPhotos.push([ph,C.travel[n-1].photo]);}
   B(0.04,0.38,-0.05,0.08,0.1,0.1,'#ff7a9a');
   close();}
 // little peg shelf + mini items
 B(0,3.55,3.9,0.5,0.08,0.8,'#d9b48a');B(0.1,3.63,4.1,0.22,0.3,0.22,'#ffb8cf');B(0.12,3.93,4.15,0.15,0.18,0.12,'#9fd8a8');
 B(0.14,6.0,1.0,0.06,0.06,3.8,'#ff9ab8');                  // washi string
}
end();

/* ---------- BOOKSHELF (left wall, front) ---------- */
begin('shelf');
B(0,0,7.0,1.3,5.45,0.2,'#e6c19c');B(0,0,10.8,1.3,5.45,0.2,'#e6c19c');B(0,0,7.0,0.12,5.45,4.0,'#d9ab82');
for(const y of [0,1.75,3.5,5.25])B(0,y,7.0,1.3,0.2,4.0,'#efd0ae');
for(const y of [0.2,1.95,3.7]){
  let z=7.25;const r=mulberry(Math.floor(y*10)+3);
  while(z<10.45){
    if(r()<.1){z+=0.25;continue;}
    const w=0.2+r()*0.2,h=0.95+r()*0.5,c=PAST[Math.floor(r()*PAST.length)];
    if(z+w>10.75)break;
    B(0.22,y,z,0.85,h,w,c);if(r()<.55)B(1.07,y+h*0.55,z+0.03,0.03,0.12,w-0.06,'#fffaf0');
    z+=w+0.02;
  }
}
B(0.3,5.45,7.3,0.55,0.4,0.55,'#f4c2a8');B(0.45,5.85,7.45,0.25,0.5,0.25,'#9fd8a8');B(0.3,6.1,7.3,0.2,0.3,0.2,'#8fc898');B(0.6,6.0,7.55,0.2,0.3,0.2,'#8fc898');
end();

/* ---------- DESK + chair ---------- */
begin('desk');
B(3.8,2.2,0,4.0,0.2,2.0,'#fbefdc');
for(const [x,z] of [[3.85,1.75],[7.55,1.75],[3.85,0.05],[7.55,0.05]])B(x,0,z,0.2,2.2,0.2,'#e2bd98');
B(6.35,0.0,0.05,1.4,2.2,1.85,'#f0d3b4');
B(6.35,1.12,1.9,1.4,0.05,0.04,'#d9b08c');B(6.9,1.45,1.9,0.3,0.1,0.07,'#c8986e');B(6.9,0.5,1.9,0.3,0.1,0.07,'#c8986e');
// monitor
B(5.75,2.4,0.45,0.3,1.1,0.2,'#c8c0dc');B(5.4,2.4,0.4,1.0,0.08,0.5,'#c8c0dc');
B(4.85,3.4,0.55,2.1,1.5,0.14,'#4a4268');P(5.9,4.15,0.7,1.85,1.2,monitorTex(),'z',{basic:true});
B(4.95,2.4,1.3,1.9,0.08,0.55,'#ffffff');for(let i=0;i<7;i++)B(5.02+i*0.26,2.48,1.36,0.2,0.04,0.12,PAST[i%8]);
B(6.85,2.4,1.45,0.25,0.09,0.38,'#ffffff');
B(4.15,2.4,0.35,0.35,0.4,0.35,'#ffb7c5');B(4.5,2.55,0.45,0.08,0.15,0.1,'#ffb7c5');
B(4.1,2.4,1.25,0.4,0.3,0.4,'#f4c2a8');B(4.22,2.7,1.37,0.16,0.5,0.16,'#9fd8a8');B(4.1,2.95,1.37,0.1,0.18,0.14,'#9fd8a8');
B(7.2,2.4,0.3,0.45,0.1,0.45,'#d8c8ff');B(7.38,2.5,0.45,0.1,1.2,0.1,'#d8c8ff');B(7.1,3.6,0.3,0.6,0.15,0.55,'#ffe9a8');
// chair
B(5.0,1.3,2.3,1.0,0.2,1.0,'#f7b7cc');B(5.0,1.5,3.2,1.0,1.5,0.2,'#f7b7cc');B(5.08,1.58,3.15,0.84,1.0,0.06,'#fcd0de');
B(5.4,0.35,2.7,0.2,0.95,0.2,'#8f87a8');B(4.9,0.22,2.7,1.2,0.12,0.2,'#8f87a8');B(5.4,0.22,2.2,0.2,0.12,1.2,'#8f87a8');
for(const [x,z] of [[4.85,2.65],[5.95,2.65],[5.35,2.15],[5.35,3.35]])B(x,0,z,0.3,0.34,0.3,'#5f5878');
end();

/* ---------- MIRROR + vanity ---------- */
begin('mirror');
B(8.7,0,0,3.0,1.3,1.5,'#f7d8e4');B(8.6,1.3,0,3.2,0.12,1.6,'#fbefdc');
B(10.15,0.1,1.5,0.04,1.1,0.03,'#e0b0c6');B(8.8,0.1,1.5,1.35,1.1,0.03,'#f2c6d8');B(10.25,0.1,1.5,1.35,1.1,0.03,'#f2c6d8');
B(9.9,0.6,1.53,0.12,0.12,0.06,'#fbefdc');B(10.4,0.6,1.53,0.12,0.12,0.06,'#fbefdc');
// frame + glass
B(9.1,1.5,0,2.5,3.5,0.12,'#e8b4ca');
P(10.35,3.25,0.13,2.0,3.0,mirrorTex,'z',{basic:true});
B(9.1,4.75,0,2.5,0.25,0.2,'#f6cada');B(9.1,1.5,0,2.5,0.25,0.2,'#f6cada');B(9.1,1.5,0,0.25,3.5,0.2,'#f6cada');B(11.35,1.5,0,0.25,3.5,0.2,'#f6cada');
B(9.9,5.0,0,0.9,0.18,0.2,'#f6cada');B(10.15,5.18,0,0.4,0.18,0.2,'#ff9ab8');
// vanity bits
B(9.0,1.42,0.8,0.25,0.42,0.25,'#d8c8ff');B(9.05,1.84,0.85,0.15,0.1,0.15,'#ffffff');B(9.45,1.42,1.0,0.22,0.3,0.22,'#ffe2a8');
B(9.9,1.42,0.9,0.9,0.05,0.5,'#fffaf0');B(10.1,1.47,1.0,0.3,0.2,0.3,'#ffc4d8');
B(11.05,1.42,0.9,0.4,0.32,0.4,'#f4c2a8');B(11.17,1.74,1.02,0.16,0.35,0.16,'#9fd8a8');
end();

/* ---------- floor plant ---------- */
begin('plant');
const plantG=open(new THREE.Group());plantG.position.set(11.05,0,10.85);
B(-0.45,0,-0.45,0.9,0.7,0.9,'#f4c2a8');B(-0.45,0.7,-0.45,0.9,0.1,0.9,'#b99a7c');
B(-0.15,0.8,-0.15,0.3,1.9,0.3,'#9fd8a8');
for(const [x,y,z,s] of [[-0.75,1.6,-0.25,0.6],[0.15,1.3,-0.25,0.6],[-0.35,2.4,-0.65,0.6],[-0.35,2.1,0.15,0.6],[-0.6,2.7,-0.05,0.5],[0.05,2.6,-0.15,0.5]])B(x,y,z,s,0.22,s,'#8fcf9e');
close();end();

/* ---------- markers ---------- */
const markers={};
const glowTex=pixTex(32,32,g=>{});
{const c=glowTex.image,g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);
 gr.addColorStop(0,'rgba(255,120,175,.85)');gr.addColorStop(.45,'rgba(255,140,190,.35)');gr.addColorStop(1,'rgba(255,160,200,0)');
 g.fillStyle=gr;g.fillRect(0,0,32,32);glowTex.magFilter=glowTex.minFilter=THREE.LinearFilter;glowTex.needsUpdate=true;}
// pink voxel arrow pointing down; group origin = arrow tip
function marker(key,x,y,z){
  const g=new THREE.Group();g.position.set(x,y,z);
  const inner=new THREE.Group();inner.rotation.y=PI/4;g.add(inner);   // face the camera
  const fill=new THREE.MeshBasicMaterial({color:'#ff7fb0'});
  const lineM=new THREE.LineBasicMaterial({color:'#b83a74'});
  const bar=(w,h,yy)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.22),fill);m.position.y=yy+h/2;m.userData.key=key;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),lineM));inner.add(m);};
  bar(0.2,0.2,0.0);bar(0.5,0.2,0.2);bar(0.8,0.2,0.4);   // head (tip at bottom)
  bar(0.32,0.5,0.6);                                      // shaft
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  glow.scale.set(2.2,2.2,1);glow.position.y=0.55;g.add(glow);
  g.userData={base:y,glow,key};
  scene.add(g);markers[key]=g;
}
marker('desk',5.9,5.15,1.0);marker('shelf',0.65,6.7,9.4);marker('mirror',10.35,5.5,0.9);marker('bed',1.8,2.1,4.1);marker('peg',0.8,6.35,2.8);marker('plant',11.05,3.2,10.85);

// swap the first polaroids for the real travel photos (cropped to a square)
pegPhotos.forEach(([mesh,src])=>new THREE.TextureLoader().load(src,t=>{const r=t.image.width/t.image.height;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;if(r<1){t.repeat.set(1,r);t.offset.set(0,(1-r)/2);}else{t.repeat.set(1/r,1);t.offset.set((1-1/r)/2,0);}mesh.material.map=t;mesh.material.needsUpdate=true;}));

/* ---------- per-part materials (so hover glow doesn't leak) ---------- */
for(const k in parts)parts[k].forEach(m=>{if(m.material.emissive)m.material=m.material.clone();});
const pickables=[];room.traverse(o=>{if(o.isMesh)pickables.push(o);});
for(const k in markers)markers[k].traverse(o=>{if(o.isMesh)pickables.push(o);});

/* =====================================================================
   the AVATAR
   ===================================================================== */
const avatar=(function(){
  const root=new THREE.Group(),pivot=new THREE.Group();root.add(pivot);
  const skin='#f1c7a5',hair='#5a3a30',shirt='#c9b8f2',pants='#a9cdf0';
  const L=(c)=>new THREE.MeshLambertMaterial({color:c});
  function box(w,h,d,x,y,z,mat,parent){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof mat==='string'?L(mat):mat);m.position.set(x,y,z);m.castShadow=true;(parent||pivot).add(m);return m;}
  const face=pixTex(8,8,g=>{px(g,skin,0,0,8,8);px(g,hair,0,0,8,2);px(g,hair,0,2,1,1);px(g,hair,7,2,1,1);px(g,'#3a2f4a',2,4,1,2);px(g,'#3a2f4a',5,4,1,2);px(g,'#ffa8b8',1,6,1,1);px(g,'#ffa8b8',6,6,1,1);px(g,'#c96b7c',3,6,2,1);});
  const sk=L(skin);
  const head=new THREE.Group();head.position.y=1.7;pivot.add(head);
  const hm=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.6),[sk,sk,L(hair),sk,new THREE.MeshLambertMaterial({map:face}),L(hair)]);hm.castShadow=true;head.add(hm);
  box(.66,.2,.66,0,.3,0,hair,head);box(.66,.62,.14,0,-.02,-.28,hair,head);box(.07,.5,.5,.3,.05,-.02,hair,head);box(.07,.5,.5,-.3,.05,-.02,hair,head);
  box(.3,.3,.3,0,.45,-.2,hair,head);
  box(.5,.7,.3,0,1.05,0,shirt);box(.5,.14,.32,0,.76,0,'#b49ee6');
  function limb(x,y,topC,botC,topH,w){const g=new THREE.Group();g.position.set(x,y,0);pivot.add(g);box(w,topH,w,0,-topH/2,0,topC,g);box(w,.7-topH,w,0,-topH-(.7-topH)/2,0,botC,g);return g;}
  const armL=limb(-.375,1.4,shirt,skin,.45,.25),armR=limb(.375,1.4,shirt,skin,.45,.25);
  const legL=limb(-.125,.7,pants,pants,.55,.25),legR=limb(.125,.7,pants,pants,.55,.25);
  box(.27,.14,.36,0,-.63,.05,'#ffffff',legL);box(.27,.14,.36,0,-.63,.05,'#ffffff',legR);
  // watering can held in the right hand (hidden until needed)
  const can=new THREE.Group();can.position.set(0,-0.72,0);can.visible=false;armR.add(can);
  box(.36,.34,.34,0,0,0,'#9fd0ff',can);box(.36,.06,.34,0,.17,0,'#c4e4ff',can);
  box(.09,.45,.09,0,-.38,0,'#7fb8f0',can);box(.16,.07,.16,0,-.62,0,'#7fb8f0',can);
  box(.07,.07,.3,0,0,.3,'#7fb8f0',can);box(.07,.3,.07,0,.15,.43,'#7fb8f0',can);
  const tip=new THREE.Object3D();tip.position.set(0,-0.68,0);can.add(tip);
  scene.add(root);
  return {root,pivot,head,armL,armR,legL,legR,can,tip};
})();

const A={x:6.4,y:0,z:8.2,rotY:PI*0.75,lie:0,sit:0,can:0,pour:0,pouring:false,moving:false,phase:0,at:null,elev:false,exit:null};
function applyAvatar(dt,t){
  const av=avatar;
  av.root.position.set(A.x,A.y,A.z);av.root.rotation.y=A.rotY;av.pivot.rotation.x=-PI/2*A.lie;
  if(A.moving){A.phase+=dt*10;const n=Math.floor(A.phase/PI);if(n!==A.lastStep){A.lastStep=n;SFX.step();}}
  const sw=A.moving?Math.sin(A.phase)*0.8:0;
  av.legL.rotation.x=sw-A.sit*PI/2;av.legR.rotation.x=-sw-A.sit*PI/2;
  av.armL.rotation.x=-sw-A.sit*0.95;
  av.armR.rotation.x=lerp(sw-A.sit*0.95,-1.57+0.45*A.pour,A.can);
  av.can.visible=A.can>0.02;
  av.armL.rotation.z=A.lie*0.18;av.armR.rotation.z=-A.lie*0.18;
  av.pivot.position.y=A.moving?Math.abs(Math.sin(A.phase))*0.07:0;
  av.head.rotation.x=A.moving?0:Math.sin(t*1.6)*0.03;
  av.head.position.y=1.7+(A.moving?0:Math.sin(t*1.6)*0.012);
}

/* =====================================================================
   navigation (grid BFS + string pulling)
   ===================================================================== */
const R=0.38;
const OBST=[[0.1,0.2,3.4,5.0],[0,7,1.3,11],[3.8,0,7.8,2.0],[4.9,2.2,6.1,3.4],[8.6,0,11.8,1.6],[10.5,10.3,11.6,11.4]];
function blocked(x,z){
  if(x<0.45||x>W-0.45||z<0.45||z>W-0.45)return true;
  for(const o of OBST)if(x>o[0]-R&&x<o[2]+R&&z>o[1]-R&&z<o[3]+R)return true;
  return false;
}
function los(a,b){const d=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.ceil(d/0.12);for(let i=0;i<=n;i++){const k=i/n;if(blocked(lerp(a[0],b[0],k),lerp(a[1],b[1],k)))return false;}return true;}
function findPath(s,g){
  s=[s[0],s[1]];g=[g[0],g[1]];
  if(los(s,g))return [s,g];
  const N=24,cs=0.5,id=(i,j)=>j*N+i,cell=p=>[Math.min(N-1,Math.max(0,Math.floor(p[0]/cs))),Math.min(N-1,Math.max(0,Math.floor(p[1]/cs)))];
  const free=(i,j)=>!blocked((i+.5)*cs,(j+.5)*cs);
  const c0=cell(s),c1=cell(g),prev=new Map([[id(...c0),-1]]),q=[c0];
  while(q.length){
    const [i,j]=q.shift();if(i===c1[0]&&j===c1[1])break;
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=N||nj>=N||prev.has(id(ni,nj)))continue;
      if(!free(ni,nj))continue;if(di&&dj&&(!free(i+di,j)||!free(i,j+dj)))continue;
      prev.set(id(ni,nj),id(i,j));q.push([ni,nj]);
    }
  }
  if(!prev.has(id(...c1)))return [s,g];
  const cells=[];for(let n=id(...c1);n!==-1;n=prev.get(n))cells.push([(n%N+.5)*cs,(Math.floor(n/N)+.5)*cs]);
  cells.reverse();const pts=[s,...cells.slice(1,-1),g];
  const out=[pts[0]];let i=0;
  while(i<pts.length-1){let j=pts.length-1;while(j>i+1&&!los(pts[i],pts[j]))j--;out.push(pts[j]);i=j;}
  return out;
}

/* =====================================================================
   targets & choreography
   ===================================================================== */
const TARGETS={
  desk :{label:'Desk',    approach:[5.5,4.2], face:PI,      pose:{x:5.5,y:0.8,z:2.8,rotY:PI,lie:0,sit:1}},
  shelf:{label:'Bookshelf',      approach:[2.45,9.0],face:-PI/2},
  mirror:{label:'Mirror · about me',approach:[10.3,3.3],face:PI},
  bed  :{label:'Bed + iPad',     approach:[3.95,2.7],face:-PI/2,   pose:{x:1.75,y:1.5,z:2.7,rotY:0,lie:1,sit:0}},
  peg  :{label:'Travel pegboard',approach:[3.95,2.7],face:-PI/2,   pose:{x:1.75,y:1.1,z:2.7,rotY:-PI/2,lie:0,sit:0}},
  plant:{label:'Plant',          approach:[9.3,11.2],face:PI/2,    noPanel:true}
};

/* ---------- dialogue bubbles (cycle through each object's lines) ---------- */
const LINES={
  desk :["My personal projects live here ✏️","Coffee, pixels, repeat.","Ctrl+S is my love language."],
  shelf:["So many books, so little time 📚","Shh… choosing my next read.","I absolutely judge books by their spines."],
  mirror:["Mirror, mirror… who's got great taste? ✨","Okay, this outfit works.","Nice to meet me! 🪞"],
  bed  :["Ahh, peak comfort.","Five more minutes… 😴","Scrolling, listening, doing nothing."],
  peg  :["Every pin has a story ✈️","Next destination: anywhere!","Look at all those memories!"],
  plant:["Time for a drink, little buddy 🌱","Grow big and strong!","Water you doing today? 💧"]
};
const lineIdx={};for(const k in LINES)lineIdx[k]=Math.floor(Math.random()*LINES[k].length);
const bubble=document.getElementById('bubble');let bubbleId=0,bubbleOn=false;
function hideBubble(){bubbleId++;bubbleOn=false;bubble.classList.remove('show');}
function say(key){
  const id=++bubbleId,txt=LINES[key][lineIdx[key]%LINES[key].length];lineIdx[key]++;
  bubble.textContent='';bubble.classList.add('show');bubbleOn=true;
  let i=0;const iv=setInterval(()=>{
    if(id!==bubbleId){clearInterval(iv);return;}
    bubble.textContent=txt.slice(0,++i);if(i%2===1&&txt[i-1]!==' ')SFX.blip();
    if(i>=txt.length){clearInterval(iv);setTimeout(()=>{if(id===bubbleId)hideBubble();},3200);}
  },28);
}
const _hv=new THREE.Vector3();
function placeBubble(){
  if(!bubbleOn)return;
  avatar.head.getWorldPosition(_hv);_hv.y+=0.55;_hv.project(camera);
  bubble.style.left=((_hv.x+1)/2*vw)+'px';bubble.style.top=((1-_hv.y)/2*vh)+'px';
}

/* ---------- watering ---------- */
const drops=[];let dropT=0;const _tp=new THREE.Vector3();
const dropGeo=new THREE.BoxGeometry(.08,.14,.08),dropMat=new THREE.MeshBasicMaterial({color:'#8fd0ff'});
function updateDrops(dt){
  if(A.pouring){dropT-=dt;if(dropT<=0){dropT=0.035;
    avatar.tip.getWorldPosition(_tp);const m=new THREE.Mesh(dropGeo,dropMat);m.position.copy(_tp);
    const f=A.rotY;m.userData.v=new THREE.Vector3(Math.sin(f)*1.1+(Math.random()-.5)*.3,0.3,Math.cos(f)*1.1+(Math.random()-.5)*.3);
    scene.add(m);drops.push(m);}}
  for(let i=drops.length-1;i>=0;i--){const m=drops[i],v=m.userData.v;v.y-=11*dt;m.position.addScaledVector(v,dt);
    if(m.position.y<0.95){scene.remove(m);drops.splice(i,1);}}
}
let plantBounce=0;
async function waterPlant(id){
  say('plant');
  await tween(450,k=>{A.can=k;});
  await tween(350,k=>{A.pour=k;});
  A.pouring=true;SFX.waterStart();await new Promise(r=>setTimeout(r,2000));A.pouring=false;SFX.waterStop();
  plantBounce=1;SFX.sparkle();
  await tween(300,k=>{A.pour=1-k;});
  await tween(400,k=>{A.can=1-k;});
}
let runId=0,running=Promise.resolve(),current=null;
const SPEED=4.2;

function walk(path,id){
  return new Promise(res=>{
    let i=1,last=performance.now();
    (function step(now){
      if(id!==runId){A.moving=false;return res();}
      const dt=Math.min(0.05,(now-last)/1000);last=now;let move=SPEED*dt;
      while(move>0&&i<path.length){
        const dx=path[i][0]-A.x,dz=path[i][1]-A.z,d=Math.hypot(dx,dz);
        if(d>0.001)A.rotY=turn(A.rotY,Math.atan2(dx,dz),dt*16);
        if(d<=move){A.x=path[i][0];A.z=path[i][1];move-=d;i++;}else{A.x+=dx/d*move;A.z+=dz/d*move;move=0;}
      }
      A.moving=i<path.length;
      if(!A.moving)return res();
      requestAnimationFrame(step);
    })(last);
  });
}
function poseTo(p,ms,arc){
  const s={x:A.x,y:A.y,z:A.z,r:A.rotY,lie:A.lie,sit:A.sit},tr=shortest(s.r,p.rotY);
  if(arc>0.3)SFX.hop();
  return tween(ms,k=>{A.x=lerp(s.x,p.x,k);A.z=lerp(s.z,p.z,k);A.y=lerp(s.y,p.y,k)+Math.sin(k*PI)*arc;A.rotY=lerp(s.r,tr,k);A.lie=lerp(s.lie,p.lie,k);A.sit=lerp(s.sit,p.sit,k);})
    .then(()=>{if(arc>0.3)(p.lie>0.5||p.sit>0.5)?SFX.soft():SFX.land();});
}

async function go(key,id){
  if(id!==runId)return;
  const T=TARGETS[key];
  setHoverTip(null);
  hideBubble();
  if(A.at===key&&current===key)return;
  if(A.at===key&&!T.noPanel){showPanel(key);say(key);return;}
  hidePanel();
  if(T.noPanel)view.target=0;
  A.at=null;
  const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.05;
  if(A.elev&&!(A.exit&&near(A.exit,T.approach))){
    await poseTo({x:A.exit[0],y:0,z:A.exit[1],rotY:A.rotY,lie:0,sit:0},450,0.5);A.elev=false;
  }
  if(!A.elev){
    if(id!==runId)return;
    const path=findPath([A.x,A.z],T.approach);
    if(path.length>1||Math.hypot(A.x-T.approach[0],A.z-T.approach[1])>0.05){await walk(path,id);}
    if(id!==runId)return;
    await poseTo({x:T.approach[0],y:0,z:T.approach[1],rotY:T.face,lie:0,sit:0},260,0);
  }
  if(T.pose){await poseTo(T.pose,650,0.8);A.elev=true;A.exit=T.approach;}
  else{A.elev=false;A.exit=null;}
  A.at=key;
  if(id!==runId)return;
  if(T.noPanel)await waterPlant(id);
  else{showPanel(key);say(key);}
}
function visit(key){const id=++runId;running=running.then(()=>go(key,id)).catch(console.error);}

/* =====================================================================
   panel content
   ===================================================================== */
const panel=document.getElementById('panel'),body=document.getElementById('panelBody');
const intro=document.getElementById('intro'),hint=document.getElementById('hint'),tip=document.getElementById('tip');
const grad=(a,b)=>`linear-gradient(150deg,${a},${b})`;
// app icons (inline SVG)
const ICON_SPOTIFY=`<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#121212"/><circle cx="32" cy="32" r="24" fill="#1ed760"/>
  <g fill="none" stroke="#121212" stroke-linecap="round"><path d="M18 25.5Q32 20.5 47 27.5" stroke-width="4.4"/><path d="M19.5 33.5Q32 29.5 45 35.5" stroke-width="3.6"/><path d="M21 41Q32 37.8 43 43" stroke-width="3"/></g></svg>`;
const ICON_HOBBIES=`<span class="cat-ic"><b>🐱</b><img src="img/hobbies-cat.png" alt="" onerror="this.remove()"></span>`;
const VIEWS={
  desk:()=>`<p class="eyebrow">passion projects</p><h2>Desk</h2><p class="lead">${C.projects.intro}</p>
    <div class="cards">${C.projects.items.map(p=>`<article class="proj2"><div class="p2-main zoomimg" data-full="${p.image}" data-title="${p.title}" style="background-image:url(${p.image}),${grad(p.c1,p.c2)}"></div><div class="p2-body"><h3>${p.title}</h3><div class="p2-sub">${p.sub}</div><div class="chips">${p.tags.map(t=>`<i>${t}</i>`).join('')}</div><p>${p.desc}</p><a class="plink" href="${p.link}" target="_blank" rel="noopener">view full project &rarr;</a></div></article>`).join('')}</div>`,
  shelf:()=>`<p class="eyebrow">bookshelf</p><h2>Last 3 reads</h2><p class="lead">Fresh off the shelf.</p>
    <div class="cards">${C.books.map(b=>`<div class="book2">
      <div class="bcover" style="background:${b.color}">${b.cover?`<img src="${b.cover}" alt="Cover of ${b.title}" onerror="this.remove()">`:''}</div>
      <div class="binfo"><h3>${b.title}</h3><div class="by">${b.author} · ${b.year}</div><p>${b.note}</p>
        ${b.url?`<a class="plink" href="${b.url}" target="_blank" rel="noopener">view on Goodreads &rarr;</a>`:''}</div></div>`).join('')}</div>`,
  mirror:()=>{const A2=C.about;return `<p class="eyebrow">mirror, mirror</p><h2>About me</h2>
    <div class="about-top"><div class="portrait" style="background:${grad(A2.c1,A2.c2)}"><span>${A2.initial}</span></div><div><h3>${A2.name}</h3><div class="role">${A2.role}</div><p class="lead" style="margin:6px 0 0">${A2.tagline}</p></div></div>
    ${A2.bio.map(p=>`<p class="bio">${p}</p>`).join('')}
    <div class="facts">${A2.facts.map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>`;},
  bed:()=>{const d=new Date();return `<p class="eyebrow">bed &amp; ipad</p><h2>Lazy-day mode</h2><p class="lead">Lying here with my iPad. Tap an app.</p>
    <div class="ipad"><div class="screen" id="screen">
      <div class="home"><div class="clock">${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</div><div class="date">${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
        <div class="apps"><button class="app" data-app="spotify"><i class="ic">${ICON_SPOTIFY}</i>Spotify</button><button class="app" data-app="hobbies"><i class="ic">${ICON_HOBBIES}</i>Hobbies</button></div><div class="dock">swipe up to go home</div></div>
      <div class="appview" id="appview"></div></div></div>`;},
  peg:()=>`<p class="eyebrow">pegboard</p><h2>Travel &amp; stories</h2><p class="lead">Polaroids pinned to my wall — each with a story.</p>
    <div class="polas">${C.travel.map(t=>`<div class="pola"><div class="photo"><div class="pimg" style="background-image:${t.photo?`url(${t.photo}),`:''}${grad(t.c1,t.c2)}"></div></div><div><h3>${t.place}</h3><div class="when">${t.tag}</div><p>${t.story}</p></div></div>`).join('')}</div>`
};
function tileHTML(g){return `<div class="ph" style="background-image:${g.src?`url(${g.src})`:grad(g.c1,g.c2)}">${g.title}</div>`;}
let spotCtl=null,spotApi=null,spotLoop=false,spotPos=0,spotDur=0;
function loadSpotifyApi(){
  if(spotApi)return spotApi;
  spotApi=new Promise((res,rej)=>{
    window.onSpotifyIframeApiReady=api=>res(api);
    const sc=document.createElement('script');sc.src='https://open.spotify.com/embed/iframe-api/v1';sc.async=true;sc.onerror=()=>{spotApi=null;rej();};
    document.body.appendChild(sc);setTimeout(()=>{if(!spotCtl){spotApi=null;rej();}},9000);
  });return spotApi;
}
function destroySpotify(){if(spotCtl){try{spotCtl.destroy();}catch(e){}spotCtl=null;}}
async function mountSpotify(v){
  const mount=v.querySelector('#spotMount');
  try{
    const api=await loadSpotifyApi();
    if(!document.body.contains(mount))return;
    api.createController(mount,{uri:C.spotify.trackUri,width:'100%',height:152,theme:0},ctl=>{
      spotCtl=ctl;v.classList.add('spot-ready');
      ctl.addListener('playback_update',e=>{
        const d=e.data;v.classList.toggle('spot-playing',!d.isPaused);spotPos=(d.position||0)/1000;spotDur=(d.duration||0)/1000;
        const bar=v.querySelector('.wd-bar i');if(bar&&d.duration)bar.style.width=Math.min(100,d.position/d.duration*100)+'%';
        // "on repeat": restart when the track (or the 30s preview for logged-out listeners) ends
        if(!d.isPaused&&d.duration&&d.position>=d.duration-500&&!spotLoop){spotLoop=true;ctl.restart();setTimeout(()=>{spotLoop=false;},2000);}
      });
      ctl.play();   // may be blocked by browser autoplay rules — the play button always works
    });
  }catch(err){
    v.classList.add('spot-fallback');
    mount.innerHTML='<iframe src="https://open.spotify.com/embed/track/'+C.spotify.trackUri.split(':').pop()+'?utm_source=generator" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
  }
}
function openApp(name){
  const s=document.getElementById('screen'),v=document.getElementById('appview');s.classList.add('in-app');
  if(name==='spotify'){
    const sp=C.spotify;
    v.innerHTML=`<div class="apptop"><button data-home>‹ Home</button><span class="mini">${ICON_SPOTIFY}</span><b>SPOTIFY</b></div>
      <div class="spot-card">
        <div class="wd">
          <div class="wd-top">
            <div class="wd-art" style="background-image:url('${sp.art}')"></div>
            <div class="wd-repeat"><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z" fill="currentColor"/></svg><span>${sp.caption}</span></div>
          </div>
          <div class="wd-title">${sp.title}</div><div class="wd-artist">${sp.artist}</div>
          <div class="wd-bar"><i></i></div>
          <div class="wd-ctrl">
            <button data-spot-prev aria-label="Restart"><svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" fill="currentColor"/></svg></button>
            <button class="wd-play" data-spot-play aria-label="Play">
              <svg class="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              <svg class="i-pause" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>
            </button>
            <button data-spot-next aria-label="Skip 15 seconds"><svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" fill="currentColor"/></svg></button>
          </div>
        </div>
        <div class="spot-profile"><div class="spot-av sm">${sp.user[0].toUpperCase()}</div>
          <a class="spot-btn" href="${sp.profile}" target="_blank" rel="noopener">@${sp.user} &nearr;</a></div>
        <div class="spot-mount"><div id="spotMount"></div></div>
      </div>`;
    mountSpotify(v);
  }else{
    v.innerHTML=`<div class="apptop"><button data-home>‹ Home</button><span class="mini">${ICON_HOBBIES}</span><b>HOBBIES</b></div>
      <p class="hob-intro">${C.hobbies.intro}</p>
      <div class="hob-grid">${C.hobbies.items.map(h=>`<figure class="hob" data-full="${h.src}" data-title="${h.title}" tabindex="0" style="background-image:url(${h.src})"><figcaption>${h.title}</figcaption></figure>`).join('')}</div>`;
  }
}
const lightbox=document.createElement('div');lightbox.id='lightbox';lightbox.innerHTML='<button aria-label="Close">&times;</button><img alt=""><p></p>';document.body.appendChild(lightbox);
lightbox.addEventListener('click',()=>lightbox.classList.remove('show'));
window.addEventListener('keydown',e=>{if(e.key==='Escape')lightbox.classList.remove('show');});
body.addEventListener('click',e=>{
  const hob=e.target.closest('.hob, .zoomimg');if(hob){SFX.pop();lightbox.querySelector('img').src=hob.dataset.full;lightbox.querySelector('p').textContent=hob.dataset.title;lightbox.classList.add('show');return;}
  const a=e.target.closest('[data-app]');if(a){SFX.chime();return openApp(a.dataset.app);}
  if(e.target.closest('button'))SFX.tick();
  if(e.target.closest('[data-spot-play]')){if(spotCtl)spotCtl.togglePlay();return;}
  if(e.target.closest('[data-spot-prev]')){if(spotCtl)spotCtl.seek(0);return;}
  if(e.target.closest('[data-spot-next]')){if(spotCtl)spotCtl.seek(Math.min(spotPos+15,Math.max(0,spotDur-1)));return;}
  const xp=e.target.closest('[data-xp]');if(xp){body.querySelectorAll('[data-xp]').forEach(b=>b.classList.toggle('on',b===xp));body.querySelectorAll('[data-sec]').forEach(sec=>{sec.hidden=sec.dataset.sec!==xp.dataset.xp;});return;}
  if(e.target.closest('[data-home]')){destroySpotify();document.getElementById('screen').classList.remove('in-app');document.getElementById('appview').innerHTML='';return;}
});

/* =====================================================================
   view state (room shifts right when panel opens)
   ===================================================================== */
const view={s:0,target:0};
function showPanel(key){
  destroySpotify();current=key;body.innerHTML=VIEWS[key]();panel.scrollTop=0;SFX.whoosh();
  panel.classList.add('open');view.target=1;intro.classList.add('gone');hint.classList.add('gone');
  if(window.scrollY>8&&window.scrollY<hero.offsetHeight)window.scrollTo({top:0,behavior:'smooth'});
}
function hidePanel(){destroySpotify();panel.classList.remove('open');current=null;}
function closeAll(){++runId;if(current)SFX.whooshBack();hidePanel();view.target=0;intro.classList.remove('gone');}
document.getElementById('back').addEventListener('click',()=>{SFX.tick();closeAll();});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});

/* =====================================================================
   interaction (hover / click)
   ===================================================================== */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let hover=null;
function pick(e){
  const r=canvas.getBoundingClientRect();ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(pickables,false)[0];
  return h?h.object.userData.key||null:null;
}
function setHover(key){
  if(key===hover)return;
  if(hover&&parts[hover])parts[hover].forEach(m=>m.material.emissive&&m.material.emissive.setHex(0));
  hover=key;if(key)SFX.tick();
  if(key&&parts[key])parts[key].forEach(m=>m.material.emissive&&m.material.emissive.setHex(0x3a2630));
  canvas.style.cursor=key?'pointer':'default';
}
function setHoverTip(key,e){
  if(!key){tip.classList.remove('show');return;}
  tip.textContent=TARGETS[key].label;tip.classList.add('show');
  if(e){tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';}
}
canvas.addEventListener('pointermove',e=>{const k=pick(e);setHover(k);setHoverTip(k,e);});
canvas.addEventListener('pointerleave',()=>{setHover(null);setHoverTip(null);});
canvas.addEventListener('click',e=>{const k=pick(e);if(k){SFX.init();SFX.pop();visit(k);}});
// sound toggle
const soundBtn=document.getElementById('sound');
function paintSound(){soundBtn.textContent=SFX.muted?'♪ sound off':'♪ sound on';soundBtn.classList.toggle('off',SFX.muted);}
soundBtn.addEventListener('click',()=>{SFX.init();SFX.setMuted(!SFX.muted);paintSound();if(!SFX.muted)SFX.chime();});
paintSound();

/* =====================================================================
   camera fitting + render loop
   ===================================================================== */
const base=new THREE.Vector3(6,2.8,6),dir=new THREE.Vector3(1,0.95,1).normalize();
camera.position.copy(base).addScaledVector(dir,80);camera.lookAt(base);camera.updateMatrixWorld();
const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
let bw=1,bh=1,bcx=0,bcy=0;
{let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
 for(const x of [-0.5,W])for(const y of [-0.8,WH+0.2])for(const z of [-0.5,W]){const v=new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}
 bw=maxX-minX;bh=maxY-minY;bcx=(minX+maxX)/2;bcy=(minY+maxY)/2;}
let vw=0,vh=0;
function resize(){
  vw=hero.clientWidth;vh=hero.clientHeight;renderer.setSize(vw,vh,false);
  camera.left=-vw/2;camera.right=vw/2;camera.top=vh/2;camera.bottom=-vh/2;
  const pw=Math.min(vw*0.42,580);hero.style.setProperty('--pw',pw+'px');
}
window.addEventListener('resize',resize);resize();
function updateCamera(){
  const wide=vw>860,V=Math.min(window.innerHeight,vh);
  // idle: room sits low (a clear gap under the heading, bottom of the room peeks below the fold);
  // panel open: room tucks into the visible area beside / above the panel
  const ytop=lerp(370,70,view.s);
  const availH1=wide?V-110:V*0.5-80;
  const availH=lerp(V-230,availH1,view.s);
  let availW=vw,sx=0;
  if(wide){const reserve=Math.min(vw*0.42,580)+vw*0.055;availW=vw-view.s*reserve;sx=view.s*reserve/2;}
  const zoom=Math.min(availW/(bw*1.06),availH/(bh*1.04));
  camera.zoom=zoom;camera.updateProjectionMatrix();
  const down=ytop+availH/2-vh/2;            // px the room must sit below the canvas centre
  camera.position.copy(base).addScaledVector(dir,80)
    .addScaledVector(right,bcx-sx/zoom).addScaledVector(up,bcy+down/zoom);
}

let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;const t=now/1000;
  view.s+=(view.target-view.s)*(1-Math.exp(-dt*5.5));
  if(Math.abs(view.target-view.s)<0.0005)view.s=view.target;
  updateCamera();applyAvatar(dt,t);mirrorUpdate(now);
  for(const k in markers){const g=markers[k];g.visible=(current!==k&&A.at!==k);
    g.position.y=g.userData.base+Math.sin(t*3+g.id)*0.2;
    g.userData.glow.material.opacity=0.65+0.3*Math.sin(t*3+g.id);}
  updateDrops(dt);
  if(plantBounce>0){plantBounce=Math.max(0,plantBounce-dt*1.4);const b=Math.sin(plantBounce*PI*3)*plantBounce;plantG.scale.set(1+b*0.06,1+b*0.1,1+b*0.06);}
  placeBubble();
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/* =====================================================================
   work experience — heading + resume on the left, timeline on the right
   ===================================================================== */
(function buildWork(){
  const root=document.getElementById('workList'),sum=document.getElementById('workSummary'),btn=document.getElementById('resumeBtn');if(!root)return;
  sum.textContent=C.work.summary;
  btn.href=C.resume.href;btn.setAttribute('download',C.resume.file);
  root.innerHTML=C.work.jobs.map((j,i)=>`<li class="tl-item${/Present/i.test(j.period)?' cur':''}">
    <span class="tl-dot"></span>
    <div class="tl-card">
      <div class="tl-logo" style="background:${j.color}">${j.logo?`<img src="${j.logo}" alt="${j.company} logo">`:j.initial}</div>
      <div class="tl-main">
        <h3 class="tl-role">${j.role}</h3>
        <div class="tl-co">${j.company}</div>
        <div class="tl-loc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>${j.place}</div>
      </div>
      <div class="tl-date">${j.period}</div>
    </div></li>`).join('');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.2});
  root.querySelectorAll('.tl-item').forEach(el=>io.observe(el));
})();
window.__room={A,visit,closeAll,camera,scene};
})();
