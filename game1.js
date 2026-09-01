"use strict";
/* STRIKE VECTOR - game1.js : engine, assets, map, bots, effects */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a);
const V3=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0);
const NAMES=["Viper","Havoc","Rook","Cinder","Nomad","Falcon","Bishop","Wraith","Onyx","Drift","Saber","Juno","Krait","Talon"];
function fatal(m){document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));$("err").classList.remove("hidden");$("errMsg").textContent=m;}
const S={sens:1,fov:80,quality:"HIGH",shadows:true,fx:1,volM:.8,volS:.9,ff:false};
try{Object.assign(S,JSON.parse(localStorage.getItem("sv_set")||"{}"));}catch(e){}
function saveS(){try{localStorage.setItem("sv_set",JSON.stringify(S));}catch(e){}}
const Au={ctx:null,g:null,
init(){if(this.ctx)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.ctx=new A();this.g=this.ctx.createGain();this.g.connect(this.ctx.destination);this.upd();}catch(e){}},
upd(){if(this.g)this.g.gain.value=S.volM;},res(){if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume();},
n(d){const c=this.ctx,b=c.createBuffer(1,c.sampleRate*d|0,c.sampleRate),h=b.getChannelData(0);for(let i=0;i<h.length;i++)h[i]=Math.random()*2-1;return b;},
env(g,v,d,t){g.gain.setValueAtTime(Math.max(v,.001),t);g.gain.exponentialRampToValueAtTime(.001,t+d);},
shot(p,pi,vol){if(!this.ctx)return;this.res();const c=this.ctx,t=c.currentTime,V=S.volS*(vol===undefined?1:vol);
 const s=c.createBufferSource();s.buffer=this.n(.25);const f=c.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(3000*pi,t);f.frequency.exponentialRampToValueAtTime(300,t+.14);
 const g=c.createGain();this.env(g,.5*p*V,.16*p+.03,t);s.connect(f).connect(g).connect(this.g);s.start(t);s.stop(t+.3);
 const o=c.createOscillator();o.frequency.setValueAtTime(140*pi,t);o.frequency.exponentialRampToValueAtTime(45,t+.1);
 const g2=c.createGain();this.env(g2,.4*p*V,.12,t);o.connect(g2).connect(this.g);o.start(t);o.stop(t+.14);},
bp(f,d,v){if(!this.ctx)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator();o.type="triangle";o.frequency.value=f;
 const g=c.createGain();this.env(g,(v||.25)*S.volS,d,t);o.connect(g).connect(this.g);o.start(t);o.stop(t+d+.02);},
boom(v){if(!this.ctx)return;this.res();const c=this.ctx,t=c.currentTime,s=c.createBufferSource();s.buffer=this.n(.9);
 const f=c.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(800,t);f.frequency.exponentialRampToValueAtTime(60,t+.8);
 const g=c.createGain();this.env(g,(v||1)*S.volS,.85,t);s.connect(f).connect(g).connect(this.g);s.start(t);s.stop(t+.9);},
foot(v){if(!this.ctx)return;const c=this.ctx,t=c.currentTime,s=c.createBufferSource();s.buffer=this.n(.05);
 const f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=600;const g=c.createGain();this.env(g,(v||.12)*S.volS,.05,t);
 s.connect(f).connect(g).connect(this.g);s.start(t);},
rel(){this.bp(700,.05,.2);setTimeout(()=>this.bp(1100,.05,.2),200);},ui(){this.bp(1800,.03,.12);}};
const W=[
{id:"px9",name:"PX-9 PISTOL",dmg:20,rpm:420,mag:17,res:85,rel:1.4,rng:55,spr:.016,rec:.013,hd:2,auto:0,mv:1.7,pi:1.6,pw:.6,m:{l:.3,c:0x2b2f36}},
{id:"de50",name:"DE-50 CANNON",dmg:52,rpm:170,mag:7,res:35,rel:1.9,rng:70,spr:.014,rec:.05,hd:2.6,auto:0,mv:1.8,pi:1.1,pw:.9,m:{l:.34,c:0x8f9199}},
{id:"rvr",name:"RANGER .357",dmg:62,rpm:150,mag:6,res:24,rel:2.6,rng:80,spr:.01,rec:.055,hd:3,auto:0,mv:1.6,pi:1,pw:.95,m:{l:.32,c:0x5a4632}},
{id:"mp5",name:"KM-5 SMG",dmg:17,rpm:800,mag:30,res:120,rel:2,rng:45,spr:.028,rec:.011,hd:1.8,auto:1,mv:1.25,pi:1.5,pw:.55,m:{l:.5,c:0x23262c,st:1}},
{id:"ump",name:"UV-45 SMG",dmg:23,rpm:600,mag:25,res:100,rel:2.2,rng:45,spr:.026,rec:.014,hd:1.8,auto:1,mv:1.25,pi:1.35,pw:.6,m:{l:.52,c:0x33383f,st:1}},
{id:"vec",name:"VK-9 VECTOR",dmg:15,rpm:1000,mag:33,res:132,rel:1.9,rng:40,spr:.03,rec:.009,hd:1.8,auto:1,mv:1.2,pi:1.7,pw:.5,m:{l:.46,c:0x1e2126,st:1}},
{id:"ak",name:"AKM-47 RIFLE",dmg:33,rpm:600,mag:30,res:120,rel:2.5,rng:90,spr:.02,rec:.02,hd:2.2,auto:1,mv:1.5,pi:1,pw:.8,m:{l:.62,c:0x6b4a2b,st:1}},
{id:"m4",name:"MX-4 CARBINE",dmg:28,rpm:760,mag:30,res:120,rel:2.3,rng:90,spr:.017,rec:.015,hd:2.2,auto:1,mv:1.4,pi:1.2,pw:.75,m:{l:.6,c:0x2c313a,st:1}},
{id:"scar",name:"SC-H BATTLE",dmg:36,rpm:540,mag:25,res:100,rel:2.5,rng:100,spr:.016,rec:.023,hd:2.3,auto:1,mv:1.5,pi:.95,pw:.85,m:{l:.64,c:0x8a7448,st:1}},
{id:"pump",name:"HAMMER-12",dmg:12,rpm:72,mag:6,res:30,rel:2.9,rng:25,spr:.05,rec:.07,hd:1.5,auto:0,mv:1.3,pi:.8,pw:1.1,pel:8,m:{l:.6,c:0x413528,st:1}},
{id:"tac",name:"RAPTOR TACT.",dmg:10,rpm:190,mag:8,res:40,rel:2.6,rng:22,spr:.055,rec:.05,hd:1.5,auto:0,mv:1.3,pi:.85,pw:1,pel:6,m:{l:.58,c:0x24282e,st:1}},
{id:"bolt",name:"LONGSHOT BA-50",dmg:125,rpm:35,mag:5,res:25,rel:3.2,rng:250,spr:.002,rec:.09,hd:2.5,auto:0,mv:4,pi:.7,pw:1.2,zm:20,m:{l:.8,c:0x2f3d33,st:1,sc:1}},
{id:"semi",name:"MARKSMAN SR-7",dmg:70,rpm:150,mag:10,res:40,rel:2.8,rng:200,spr:.004,rec:.05,hd:2.5,auto:0,mv:3,pi:.85,pw:1,zm:30,m:{l:.74,c:0x3a3f47,st:1,sc:1}},
{id:"lmg",name:"BASTION LMG",dmg:24,rpm:660,mag:100,res:200,rel:4.6,rng:85,spr:.03,rec:.018,hd:1.9,auto:1,mv:1.9,pi:.9,pw:.9,m:{l:.7,c:0x21262d,st:1,dr:1}},
{id:"rpg",name:"HAVOC LAUNCHER",dmg:120,rpm:40,mag:1,res:6,rel:3,rng:200,spr:.01,rec:.08,hd:1,auto:0,mv:1.5,pi:.6,pw:1.3,proj:1,spl:6.5,m:{l:.9,c:0x4a5240,tu:1}},
{id:"kn",name:"COMBAT KNIFE",dmg:55,rpm:130,mag:0,res:0,rel:0,rng:2.3,spr:0,rec:.02,hd:1.8,auto:0,mv:1,pi:2,pw:.2,mel:1,m:{kn:1}}];
const DIFF={easy:{react:1.2,acc:.14,dmg:.6,see:26,rpm:.5,hp:80},normal:{react:.7,acc:.26,dmg:1,see:38,rpm:.75,hp:100},hard:{react:.4,acc:.4,dmg:1.3,see:52,rpm:1,hp:120},extreme:{react:.18,acc:.58,dmg:1.6,see:70,rpm:1.25,hp:150}};
let scene,cam,ren,rig,flash,expL,sunL;
const wm={},cols=[],env=[],bots=[],picks=[],rockets=[],SP=[],puppets=[],RPS={};
const G={mode:null,run:false,pause:false,over:false,t:0,mt:300,lim:30,wave:0,wDel:0,diff:"normal",sA:0,sB:0,shake:0,dv:0,foot:0,fn:0,ft:0};
const P={pos:V3(0,0,20),vel:V3(),yaw:0,pit:0,hp:100,ar:50,st:100,crouch:false,onGround:true,radius:.38,height:1.7,alive:true,
 respT:0,prot:2.5,team:"A",name:"PLAYER",k:0,d:0,score:0,streak:0,best:0,shots:0,hits:0,dmg:0,lastK:-99,combo:1,wi:6,lwi:0,pr:0};
const ws={};W.forEach(w=>ws[w.id]={mag:w.mag,res:w.res,last:-99,rl:0});
const inp={k:{},fire:0,edge:0,ads:0,jump:0,lock:false,touch:false,jx:0,jy:0,sx:0,sy:0,tCrouch:false};
const an={sw:1,bob:0,ads:0,kick:0,kn:0};
let sbV=false,nearP=null,back="menu";
const isMP=()=>(G.mode||"").indexOf("mp_")===0,isTDM=()=>G.mode==="tdm"||G.mode==="mp_tdm";
function rpList(){return Object.keys(RPS).map(k=>RPS[k]);}
function initGL(){if(!window.THREE)throw new Error("Three.js failed to load from CDN. Check connection.");
 ren=new THREE.WebGLRenderer({antialias:S.quality!=="LOW"});ren.outputColorSpace=THREE.SRGBColorSpace;ren.toneMapping=THREE.ACESFilmicToneMapping;
 $("game").appendChild(ren.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0x0d1420);scene.fog=new THREE.Fog(0x0d1420,40,170);
 cam=new THREE.PerspectiveCamera(S.fov,innerWidth/innerHeight,.05,400);cam.rotation.order="YXZ";scene.add(cam);
 scene.add(new THREE.HemisphereLight(0x8fb4d9,0x2a2018,.55));
 sunL=new THREE.DirectionalLight(0xffe0b0,1.5);sunL.position.set(40,70,25);sunL.castShadow=true;
 Object.assign(sunL.shadow.camera,{left:-70,right:70,top:70,bottom:-70,far:200});sunL.shadow.bias=-.0004;scene.add(sunL);
 const p1=new THREE.PointLight(0x00d9ff,25,30);p1.position.set(-25,5,-25);scene.add(p1);
 const p2=new THREE.PointLight(0xff6a00,25,30);p2.position.set(25,5,25);scene.add(p2);
 flash=new THREE.PointLight(0xffc070,0,14);scene.add(flash);expL=new THREE.PointLight(0xff8030,0,26);scene.add(expL);
 rig=new THREE.Group();cam.add(rig);qual();rs();addEventListener("resize",rs);}
function qual(){const q=S.quality,pr={LOW:.6,MEDIUM:.8,HIGH:1,ULTRA:Math.min(devicePixelRatio,2)}[q]||1;
 ren.setPixelRatio(pr);ren.shadowMap.enabled=S.shadows&&q!=="LOW";ren.shadowMap.type=THREE.PCFSoftShadowMap;
 sunL.shadow.mapSize.setScalar({LOW:512,MEDIUM:1024,HIGH:2048,ULTRA:4096}[q]||2048);
 if(sunL.shadow.map){sunL.shadow.map.dispose();sunL.shadow.map=null;}scene.fog.far=q==="LOW"?110:170;}
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
const MM={};function mat(c,r,m){const k=c+"_"+r+"_"+(m||0);if(!MM[k])MM[k]=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m||0});return MM[k];}
function box(x,y,z,w,h,d,m){const s=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);s.position.set(x,y+h/2,z);
 s.castShadow=s.receiveShadow=true;scene.add(s);env.push(s);cols.push(new THREE.Box3(V3(x-w/2,y,z-d/2),V3(x+w/2,y+h,z+d/2)));return s;}
function buildMap(){const cc=mat(0x8a8d90,.9),cd=mat(0x5d6165,.95),wd=mat(0x8a6b43,.85),mt=mat(0x5f6a75,.5,.6),mr=mat(0xa04a3a,.6,.4),mb=mat(0x3a5a7a,.6,.4);
 const g=new THREE.Mesh(new THREE.PlaneGeometry(160,160),mat(0x4b503f,1));g.rotation.x=-Math.PI/2;g.receiveShadow=true;scene.add(g);env.push(g);
 [[160,10],[10,160]].forEach(r=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(r[0],r[1]),mat(0x2b2d31,1));m.rotation.x=-Math.PI/2;m.position.y=.02;scene.add(m);env.push(m);});
 box(0,0,-60,120,6,2,cd);box(0,0,60,120,6,2,cd);box(-60,0,0,2,6,120,cd);box(60,0,0,2,6,120,cd);
 function bld(cx,cz,w,d,h,m){box(cx,0,cz-d/2,w,h,.6,m);box(cx-w/4-1,0,cz+d/2,w/2-2,h,.6,m);box(cx+w/4+1,0,cz+d/2,w/2-2,h,.6,m);
  box(cx-w/2,0,cz,.6,h,d,m);box(cx+w/2,0,cz+d/4+1,.6,h,d/2-2,m);box(cx+w/2,0,cz-d/4-1,.6,h,d/2-2,m);
  box(cx,h,cz,w+1,.5,d+1,m);box(cx,0,cz,3,1,3,mat(0x777c82,.8));}
 bld(-24,-24,16,14,5,cc);bld(24,-24,14,16,4.4,cd);bld(-24,24,14,14,4.4,cc);bld(24,24,16,14,5,cd);
 [[0,-38],[38,0],[-38,6],[8,38],[-12,-14],[14,10]].forEach((c,i)=>box(c[0],0,c[1],10,3.2,3.4,[mr,mb,mt][i%3]));
 for(let i=0;i<24;i++){const x=rand(-52,52),z=rand(-52,52);if(Math.abs(x)<7&&Math.abs(z)<7)continue;
  if(i%3===0){box(x,0,z,1.6,1.6,1.6,wd);if(Math.random()<.5)box(x,1.6,z,1.3,1.3,1.3,wd);}
  else if(i%3===1)box(x,0,z,3.2,1.1,.5,cd);else box(x,0,z,1.2,2.6,1.2,mt);}
 box(0,0,0,4,1.2,4,cc);box(-6,0,3,2.4,1.4,1,cd);box(6,0,-3,2.4,1.4,1,cd);
 [[0,52],[0,-52],[52,0],[-52,0],[40,40],[-40,-40],[-40,40],[40,-40],[0,14],[14,0],[-14,0],[0,-14]].forEach(p=>SP.push(V3(p[0],0,p[1])));
 [["health",-30,0],["health",30,4],["armor",0,-30],["armor",4,30],["ammo",0,4.5],["ammo",-44,44],["ammo",44,-44]].forEach(a=>{
  const col={health:0x3dff6e,armor:0x00d9ff,ammo:0xffd24d}[a[0]];
  const m=new THREE.Mesh(new THREE.BoxGeometry(.55,.55,.55),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.6}));
  m.position.set(a[1],1,a[2]);scene.add(m);picks.push({type:a[0],mesh:m,pos:V3(a[1],1,a[2]),on:true,t:0});});}
function oXZ(p,r,b){return p.x+r>b.min.x&&p.x-r<b.max.x&&p.z+r>b.min.z&&p.z-r<b.max.z;}
function move(o,dt){const r=o.radius,h=o.crouch?1.1:o.height;
 o.pos.x+=o.vel.x*dt;for(const b of cols)if(oXZ(o.pos,r,b)&&o.pos.y<b.max.y-.01&&o.pos.y+h>b.min.y&&(b.max.y-o.pos.y)>.55)o.pos.x=o.vel.x>0?b.min.x-r:b.max.x+r;
 o.pos.z+=o.vel.z*dt;for(const b of cols)if(oXZ(o.pos,r,b)&&o.pos.y<b.max.y-.01&&o.pos.y+h>b.min.y&&(b.max.y-o.pos.y)>.55)o.pos.z=o.vel.z>0?b.min.z-r:b.max.z+r;
 const py=o.pos.y,wg=o.onGround;o.pos.y+=o.vel.y*dt;o.onGround=false;
 if(o.pos.y<=0){o.pos.y=0;if(o.vel.y<0)land(o,wg);o.vel.y=0;o.onGround=true;}
 for(const b of cols){if(!oXZ(o.pos,r,b))continue;
  if(o.vel.y<=0&&py>=b.max.y-.06&&o.pos.y<b.max.y){o.pos.y=b.max.y;land(o,wg);o.vel.y=0;o.onGround=true;}
  else if(o.vel.y>0&&py+h<=b.min.y+.06&&o.pos.y+h>b.min.y){o.pos.y=b.min.y-h;o.vel.y=0;}}
 o.pos.x=clamp(o.pos.x,-58,58);o.pos.z=clamp(o.pos.z,-58,58);}
function land(o,wg){if(o!==P||wg)return;const v=-o.vel.y;if(v>13)pDmg(Math.round((v-13)*4),"gravity",true);if(v>3)Au.foot(.3);}
const _r=new THREE.Ray(),_a=V3(),_b=V3();
function losB(a,b){const d=_a.copy(b).sub(a),L=d.length();d.normalize();_r.set(a,d);
 for(const c of cols){const h=_r.intersectBox(c,_b);if(h&&h.distanceTo(a)<L-.3)return true;}return false;}
function buildVM(w){const g=new THREE.Group(),M=w.m;
 if(M.kn){const b=new THREE.Mesh(new THREE.BoxGeometry(.02,.05,.34),mat(0xc7d0d8,.2,.9));b.position.z=-.24;g.add(b);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.035,.07,.14),mat(0x2a2d33,.8)));g.userData.mz=V3(0,0,-.4);return g;}
 g.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.13,M.l),mat(M.c,.55,.35)));
 if(M.tu){const t=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,M.l+.15,10),mat(M.c,.5,.4));t.rotation.x=Math.PI/2;g.add(t);}
 else{const b=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.16,8),mat(0x1a1d22,.4,.7));b.rotation.x=Math.PI/2;b.position.set(0,.03,-(M.l/2+.08));g.add(b);}
 if(M.st){const s=new THREE.Mesh(new THREE.BoxGeometry(.05,.1,.16),mat(M.c,.7,.2));s.position.set(0,-.02,M.l/2+.08);g.add(s);}
 if(M.sc){const sc=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.16,10),mat(0x14171c,.3,.6));sc.rotation.x=Math.PI/2;sc.position.set(0,.1,-.05);g.add(sc);}
 if(M.dr){const d=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.07,12),mat(0x15181d,.6,.3));d.rotation.z=Math.PI/2;d.position.set(0,-.11,-.03);g.add(d);}
 else if(!M.tu){const mg=new THREE.Mesh(new THREE.BoxGeometry(.045,.14,.05),mat(0x15181d,.6,.3));mg.position.set(0,-.12,-.02);g.add(mg);}
 const gr=new THREE.Mesh(new THREE.BoxGeometry(.045,.1,.045),mat(0x1c1f24,.8));gr.position.set(0,-.1,M.l*.28);g.add(gr);
 const fm=new THREE.Mesh(new THREE.PlaneGeometry(.24,.24),new THREE.MeshBasicMaterial({color:0xffd080,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
 fm.position.set(0,.03,-(M.l/2+.2));g.add(fm);g.userData.fl=fm;g.userData.mz=fm.position.clone();return g;}
function initW(){W.forEach(w=>{const m=buildVM(w);m.visible=false;m.traverse(o=>o.frustumCulled=false);rig.add(m);wm[w.id]=m;});rig.position.set(.28,-.26,-.55);showW(P.wi);}
const cw=()=>W[P.wi];
function showW(i){W.forEach((w,j)=>wm[w.id].visible=j===i);hudW();}
function swW(i){if(i===P.wi||i<0||i>=W.length||!P.alive)return;ws[cw().id].rl=0;$("reloadMsg").style.display="none";
 P.lwi=P.wi;P.wi=i;an.sw=0;Au.bp(1200,.04,.2);showW(i);}
function human(color){const g=new THREE.Group(),parts=[];
 const mk=(w,h,d,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,.8));m.position.set(x,y,z);m.castShadow=true;m.userData.part=p;g.add(m);parts.push(m);return m;};
 mk(.6,.75,.32,0,1.05,0,"body");mk(.32,.32,.32,0,1.62,0,"head");
 const lL=mk(.2,.7,.2,-.16,.35,0,"limb"),lR=mk(.2,.7,.2,.16,.35,0,"limb");
 mk(.16,.6,.16,-.4,1.1,0,"limb");mk(.16,.6,.16,.4,1.1,0,"limb");
 const gn=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.55),mat(0x1c2025,.5,.4));gn.position.set(.28,1.25,-.35);g.add(gn);
 return{g,parts,lL,lR};}
class Bot{constructor(name,team,host,dk){this.name=name;this.team=team;this.host=host;this.df=DIFF[dk||G.diff];
 this.pos=V3();this.vel=V3();this.radius=.38;this.height=1.75;this.crouch=false;this.onGround=true;
 this.hp=this.df.hp;this.alive=true;this.k=0;this.d=0;this.st="PATROL";this.stT=0;this.wp=V3();this.mag=30;this.react=0;this.last=0;this.canR=true;this.wph=0;this.tt=0;
 const c=team==="B"?0xb03a30:team==="A"?0x3a6ab0:[0xb03a30,0x7a5aa0,0x4a8a4a,0xa08a3a][Math.floor(rand(0,4))];
 const h=human(c);this.g=h.g;this.parts=h.parts;this.lL=h.lL;this.lR=h.lR;this.parts.forEach(p=>p.userData.bot=this);scene.add(this.g);this.spawn();}
 spawn(){let bs=SP[0],bd=-1;for(const s of SP){const d=s.distanceTo(P.pos);if(d>bd){bd=d;bs=s;}}
  this.pos.copy(bs).add(V3(rand(-3,3),0,rand(-3,3)));this.vel.set(0,0,0);this.hp=this.df.hp;this.alive=true;this.st="PATROL";this.newWp();this.mag=30;this.g.visible=true;this.g.rotation.x=0;}
 newWp(){this.wp.set(rand(-50,50),0,rand(-50,50));}
 eye(){return V3(this.pos.x,this.pos.y+1.6,this.pos.z);}
 tgts(){const L=[];const hp=this.host==="player"||this.host==="all"||(this.host==="team"&&this.team!==P.team);
  if(hp&&P.alive)L.push({kind:"p",pos:V3(P.pos.x,P.pos.y+1.5,P.pos.z),o:P});
  if(G.mode==="mp_coop")for(const id in RPS){const r=RPS[id];if(r.alive)L.push({kind:"r",pos:V3(r.pos.x,r.pos.y+1.5,r.pos.z),o:r});}
  if(this.host==="all"||this.host==="team")for(const b of bots){if(b===this||!b.alive)continue;
   if(this.host==="all"||b.team!==this.team)L.push({kind:"b",pos:b.eye(),o:b});}return L;}
 pick(){let bt=null,bd=1e9;for(const t of this.tgts()){const d=t.pos.distanceTo(this.eye());if(d<bd){bd=d;bt=t;}}this.tg=bt;this.td=bd;}
 see(){return this.tg&&this.td<this.df.see&&!losB(this.eye(),this.tg.pos);}
 update(dt){if(!this.alive){this.respT-=dt;if(this.canR&&this.respT<=0)this.spawn();return;}
  this.stT+=dt;this.tt+=dt;if(this.tt>.4){this.tt=0;this.pick();}
  const t=this.tg,v=this.see();
  if(v)this.react+=dt;else this.react=Math.max(0,this.react-dt*2);
  let md=null,sp=2.2;
  switch(this.st){
   case"PATROL":md=V3(this.wp.x-this.pos.x,0,this.wp.z-this.pos.z);if(md.length()<2||this.stT>10){this.newWp();this.stT=0;}
    if(v&&this.react>this.df.react)this.st="CHASE";break;
   case"CHASE":if(!t){this.st="PATROL";break;}md=V3(t.pos.x-this.pos.x,0,t.pos.z-this.pos.z);sp=3.4;
    if(v&&this.td<this.df.see*.8)this.st="ATTACK";if(!v&&this.stT>6){this.st="SEARCH";this.ls=t.pos.clone();this.stT=0;}break;
   case"ATTACK":if(!t||!t.o.alive){this.st="PATROL";break;}
    if(!v){this.st="SEARCH";this.ls=t.pos.clone();this.stT=0;break;}
    this.sf=this.sf||(Math.random()<.5?1:-1);if(Math.random()<dt*.5)this.sf*=-1;
    {const f=V3(t.pos.x-this.pos.x,0,t.pos.z-this.pos.z).normalize();md=V3(-f.z*this.sf,0,f.x*this.sf);if(this.td>this.df.see*.6)md.add(f.multiplyScalar(1.5));}
    sp=2.6;this.fire(t);if(this.hp<30&&Math.random()<dt*.8){this.st="COVER";this.stT=0;}break;
   case"SEARCH":if(this.ls){md=V3(this.ls.x-this.pos.x,0,this.ls.z-this.pos.z);if(md.length()<2||this.stT>5){this.st="PATROL";this.newWp();}}else this.st="PATROL";
    if(v&&this.react>this.df.react*.5)this.st="ATTACK";sp=3;break;
   case"COVER":if(t)md=V3(this.pos.x-t.pos.x,0,this.pos.z-t.pos.z);sp=3.6;if(this.stT>2.2){this.st=v?"ATTACK":"PATROL";this.stT=0;}break;
   case"RELOAD":if(this.stT>2.1){this.mag=30;this.st="ATTACK";this.stT=0;}break;}
  if(md&&md.lengthSq()>.01){md.normalize();this.vel.x=md.x*sp;this.vel.z=md.z*sp;this.wph+=dt*sp*2.2;}else{this.vel.x*=.8;this.vel.z*=.8;}
  this.vel.y-=20*dt;move(this,dt);this.g.position.copy(this.pos);
  const f=t&&(this.st==="ATTACK"||this.st==="CHASE")?t.pos:(md?V3(this.pos.x+this.vel.x,0,this.pos.z+this.vel.z):null);
  if(f)this.g.rotation.y=Math.atan2(f.x-this.pos.x,f.z-this.pos.z)+Math.PI;
  const sw=Math.sin(this.wph)*.6*Math.min(1,Math.hypot(this.vel.x,this.vel.z)/2);this.lL.rotation.x=sw;this.lR.rotation.x=-sw;}
 fire(t){const cd=60/(600*this.df.rpm);if(G.t-this.last<cd)return;this.last=G.t;
  if(this.mag<=0){this.st="RELOAD";this.stT=0;return;}this.mag--;
  Au.shot(.7,1.1,clamp(1.2-this.td/60,.05,.8));
  const mz=this.eye();mz.y-=.2;
  const ch=this.df.acc*clamp(1-this.td/this.df.see,.25,1)*(t.kind==="p"&&Math.hypot(P.vel.x,P.vel.z)>2?.6:1)*(t.kind==="p"&&P.crouch?.85:1);
  const hit=Math.random()<ch,end=t.pos.clone();if(!hit)end.add(V3(rand(-1.5,1.5),rand(-1,1),rand(-1.5,1.5)));
  tracer(mz,end,0xffb060);
  if(isHost&&G.mode==="mp_coop")bcast({t:"bf",i:bots.indexOf(this)});
  if(hit){const dm=Math.round(9*this.df.dmg);
   if(t.kind==="p")pDmg(dm,this.name);
   else if(t.kind==="r"){if(conns[t.o.id])sendTo(conns[t.o.id],{t:"h",d:dm,kn:this.name});}
   else t.o.dmgIn(dm,"body",this);}}
 dmgIn(dm,part,atk){if(!this.alive)return;this.hp-=dm;
  fxp(V3(this.pos.x,this.pos.y+(part==="head"?1.6:1),this.pos.z),0xbb1111,Math.round(6*S.fx),3,.5);
  if(atk&&this.st!=="ATTACK"&&!atk.netId){this.st="ATTACK";this.react=this.df.react+1;
   this.tg={kind:atk===P?"p":"b",pos:atk===P?V3(P.pos.x,P.pos.y+1.5,P.pos.z):atk.eye(),o:atk};this.td=this.tg.pos.distanceTo(this.eye());}
  if(this.hp<=0)this.die(atk);}
 die(atk){this.alive=false;this.d++;this.respT=4;this.g.rotation.x=1.4*(Math.random()<.5?1:-1);
  fxp(V3(this.pos.x,this.pos.y+1,this.pos.z),0x881111,Math.round(14*S.fx),4,.7);
  const self=this;setTimeout(()=>{if(!self.alive)self.g.visible=false;},1500);
  let kn="?";
  if(atk===P){kn=P.name;pKill(this);}
  else if(atk instanceof Bot){kn=atk.name;atk.k++;if(G.mode==="tdm"){if(atk.team==="A")G.sA++;else G.sB++;}}
  else if(atk&&atk.netId){const r=RPS[atk.netId];kn=r?r.name:"PEER";if(r)r.k++;}
  feed(kn+" ▶ "+this.name);
  if(isHost&&G.mode==="mp_coop")bcast({t:"bd",i:bots.indexOf(this),by:atk===P?myId:(atk&&atk.netId)||null,kn});}}
const PARTS=[],TRAC=[];let pGeo;const pMs={};
function initFx(){pGeo=new THREE.BoxGeometry(.06,.06,.06);
 for(let i=0;i<120;i++){const m=new THREE.Mesh(pGeo,mat(0xffffff,.8));m.visible=false;scene.add(m);PARTS.push({m,v:V3(),l:0});}
 for(let i=0;i<24;i++){const g=new THREE.BufferGeometry().setFromPoints([V3(),V3()]);
  const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffd080,transparent:true,opacity:0}));l.frustumCulled=false;scene.add(l);TRAC.push({l,t:0});}}
function pm(c){if(!pMs[c])pMs[c]=new THREE.MeshBasicMaterial({color:c});return pMs[c];}
function fxp(pos,c,n,sp,life){let k=0;for(const p of PARTS){if(p.l>0)continue;p.m.visible=true;p.m.material=pm(c);p.m.position.copy(pos);
 p.v.set(rand(-1,1),rand(-.2,1.2),rand(-1,1)).normalize().multiplyScalar(sp*rand(.4,1.3));p.l=life*rand(.6,1.2);if(++k>=n)break;}}
function tracer(a,b,c){for(const t of TRAC){if(t.t>0)continue;t.l.geometry.setFromPoints([a,b]);t.l.material.color.set(c);t.l.material.opacity=.9;t.t=.07;break;}}
function fxUp(dt){for(const p of PARTS){if(p.l<=0)continue;p.l-=dt;if(p.l<=0){p.m.visible=false;continue;}p.v.y-=9.8*dt;p.m.position.addScaledVector(p.v,dt);}
 for(const t of TRAC){if(t.t<=0)continue;t.t-=dt;t.l.material.opacity=Math.max(0,t.t/.07);}
 flash.intensity*=Math.pow(.001,dt);expL.intensity*=Math.pow(.01,dt);}
function explode(pos,dm,rad,byP){fxp(pos,0xff8830,Math.round(24*S.fx),9,.9);fxp(pos,0x555555,Math.round(14*S.fx),4,1.4);
 expL.position.copy(pos);expL.intensity=60;const dp=pos.distanceTo(cam.position);
 Au.boom(clamp(1.4-dp/40,.1,1));G.shake=Math.max(G.shake,clamp(1-dp/25,0,1)*.5);
 for(const b of bots){if(!b.alive)continue;const d=b.pos.distanceTo(pos);if(d<rad)b.dmgIn(Math.round(dm*(1-d/rad)),"body",byP?P:null);}
 const pd=V3(P.pos.x,P.pos.y+1,P.pos.z).distanceTo(pos);if(pd<rad)pDmg(Math.round(dm*.7*(1-pd/rad)),"explosion",true);
 if(byP)for(const id in RPS){const r=RPS[id];if(!r.alive)continue;const rd=r.pos.distanceTo(pos);
  if(rd<rad)sendHit(id,Math.round(dm*(1-rd/rad)));}}
/* end of game1.js */
