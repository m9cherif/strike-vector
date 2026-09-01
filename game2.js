"use strict";
/* STRIKE VECTOR - game2.js : shooting, player, HUD, multiplayer, input, loop */
const ray=new THREE.Raycaster();
function mzW(){const m=wm[cw().id];return m.localToWorld(m.userData.mz.clone());}
function targets(){const L=[];for(const b of bots)if(b.alive)L.push(...b.parts);
 for(const id in RPS){const r=RPS[id];if(r.alive&&r.g.visible)L.push(...r.parts);}
 for(const p of puppets)if(p.alive&&p.g.visible)L.push(...p.parts);
 return L.concat(env);}
function sDir(sp){const d=V3();cam.getWorldDirection(d);d.x+=rand(-sp,sp);d.y+=rand(-sp,sp);d.z+=rand(-sp,sp);return d.normalize();}
function tryFire(){const w=cw(),st=ws[w.id];
 if(!P.alive||G.pause||G.over||an.sw<1||st.rl)return;
 if(!w.auto&&!inp.edge)return;
 if(G.t-st.last<60/w.rpm)return;inp.edge=0;
 if(w.mel){st.last=G.t;an.kn=1;Au.shot(.3,2.4,.5);melee();return;}
 if(st.mag<=0){st.last=G.t;Au.bp(500,.05,.3);reload();return;}
 st.mag--;st.last=G.t;P.shots++;
 const ads=an.ads>.5,mv=Math.hypot(P.vel.x,P.vel.z)>1.5;
 const sp=w.spr*(ads?.3:1)*(mv?w.mv:1)*(P.crouch?.8:1)*(!P.onGround?2:1);
 P.pr+=w.rec;P.yaw+=rand(-w.rec,w.rec)*.4;an.kick=Math.min(an.kick+.06+w.rec,.22);G.shake=Math.max(G.shake,w.rec*1.4);
 const fl=wm[w.id].userData.fl;if(fl){fl.material.opacity=1;fl.rotation.z=Math.random()*6.28;}
 flash.position.copy(mzW());flash.intensity=8;Au.shot(w.pw,w.pi);
 fxp(mzW(),0xd9b23a,1,1.6,.6);send({t:"f"});
 if(w.proj){const d=sDir(.01),g=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.4,8),mat(0x4a5240,.6));
  g.rotation.x=Math.PI/2;g.position.copy(mzW());scene.add(g);rockets.push({g,d,l:5,dm:w.dmg,sp:w.spl});hudW();return;}
 for(let i=0;i<(w.pel||1);i++)fireRay(sp,w);hudW();}
function fireRay(sp,w){const d=sDir(sp);ray.set(cam.position,d);ray.far=w.rng*2.2;
 const hs=ray.intersectObjects(targets(),false),mz=mzW();
 if(!hs.length){tracer(mz,cam.position.clone().addScaledVector(d,w.rng),0xffd080);return;}
 const h=hs[0],pt=h.object.userData.part;tracer(mz,h.point,0xffd080);
 const fall=clamp(1-h.distance/(w.rng*1.6),.35,1);
 const dm=Math.round(w.dmg*(pt==="head"?w.hd:pt==="limb"?.75:1)*fall);
 if(pt&&h.object.userData.bot){const b=h.object.userData.bot;
  if(G.mode==="tdm"&&b.team===P.team&&!S.ff){fxp(h.point,0x888888,2,1,.3);return;}
  P.hits++;P.dmg+=dm;hitM(pt==="head");dNum(h.point,dm,pt==="head");Au.bp(pt==="head"?980:520,.06,.3);b.dmgIn(dm,pt,P);}
 else if(pt&&h.object.userData.rpId){const id=h.object.userData.rpId,r=RPS[id];
  if(isTDM()&&r&&r.team===P.team&&!S.ff){fxp(h.point,0x888888,2,1,.3);return;}
  P.hits++;P.dmg+=dm;hitM(pt==="head");dNum(h.point,dm,pt==="head");Au.bp(520,.06,.3);sendHit(id,dm);}
 else if(pt&&h.object.userData.pup!==undefined){P.hits++;P.dmg+=dm;hitM(pt==="head");dNum(h.point,dm,pt==="head");
  Au.bp(pt==="head"?980:520,.06,.3);fxp(h.point,0xbb1111,4,3,.5);send({t:"bh",i:h.object.userData.pup,d:dm,p:pt});}
 else{fxp(h.point,0xffcf70,Math.round(3*S.fx),2.5,.3);fxp(h.point,0x999999,Math.round(3*S.fx),1.2,.6);}}
function melee(){const d=sDir(0);ray.set(cam.position,d);ray.far=2.3;P.shots++;
 const hs=ray.intersectObjects(targets(),false);if(!hs.length)return;
 const h=hs[0],pt=h.object.userData.part;
 if(pt&&h.object.userData.bot){P.hits++;P.dmg+=55;hitM(false);dNum(h.point,55,false);Au.bp(520,.06,.3);h.object.userData.bot.dmgIn(55,pt,P);}
 else if(pt&&h.object.userData.rpId){P.hits++;sendHit(h.object.userData.rpId,55);hitM(false);}
 else if(pt&&h.object.userData.pup!==undefined){P.hits++;send({t:"bh",i:h.object.userData.pup,d:55,p:pt});hitM(false);}
 else fxp(h.point,0xffcf70,3,2,.3);}
function upRockets(dt){for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];r.l-=dt;r.g.position.addScaledVector(r.d,34*dt);
 fxp(r.g.position,0x888888,1,.4,.4);const p=r.g.position;let bm=r.l<=0||p.y<=.05;
 if(!bm)for(const c of cols)if(p.x>c.min.x&&p.x<c.max.x&&p.y>c.min.y&&p.y<c.max.y&&p.z>c.min.z&&p.z<c.max.z){bm=true;break;}
 if(!bm)for(const b of bots)if(b.alive&&b.pos.distanceTo(p)<1.4){bm=true;break;}
 if(bm){explode(p.clone(),r.dm,r.sp,true);scene.remove(r.g);rockets.splice(i,1);}}}
function reload(){const w=cw(),st=ws[w.id];if(w.mel||st.rl||st.mag>=w.mag||st.res<=0||!P.alive)return;
 st.rl=w.rel;Au.rel();$("reloadMsg").style.display="block";}
function upReload(dt){const w=cw(),st=ws[w.id];if(!st.rl)return;st.rl-=dt;
 if(st.rl<=0){st.rl=0;const n=Math.min(w.mag-st.mag,st.res);st.mag+=n;st.res-=n;$("reloadMsg").style.display="none";hudW();}}
function upPlayer(dt){
 if(!P.alive){P.respT-=dt;
  $("respT").textContent=P.respT>5000?"WAIT FOR NEXT WAVE":"RESPAWN IN "+Math.max(0,P.respT).toFixed(1);
  if(P.respT<=0&&G.mode!=="survival")respawn();return;}
 P.prot=Math.max(0,P.prot-dt);
 let f=(inp.k.KeyW?1:0)-(inp.k.KeyS?1:0)-inp.jy,s=(inp.k.KeyD?1:0)-(inp.k.KeyA?1:0)+inp.jx;
 f=clamp(f,-1,1);s=clamp(s,-1,1);
 const spr=(((inp.k.ShiftLeft||inp.k.ShiftRight)&&f>0)||(inp.touch&&inp.jy<-.85))&&P.st>4&&!inp.ads;
 P.crouch=!!(inp.k.ControlLeft||inp.k.ControlRight||inp.tCrouch);
 const sp=6.2*(spr?1.55:1)*(P.crouch?.5:1)*(inp.ads?.6:1);
 const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
 const wx=-sy*f+cy*s,wz=-cy*f-sy*s,ac=P.onGround?12:3;
 P.vel.x=lerp(P.vel.x,wx*sp,Math.min(1,ac*dt));P.vel.z=lerp(P.vel.z,wz*sp,Math.min(1,ac*dt));
 if(inp.jump&&P.onGround){P.vel.y=7.4;Au.foot(.22);}inp.jump=0;
 P.vel.y-=20*dt;move(P,dt);
 P.st=spr?Math.max(0,P.st-18*dt):Math.min(100,P.st+12*dt);
 const spd=Math.hypot(P.vel.x,P.vel.z);
 if(P.onGround&&spd>2){G.foot+=dt*spd;if(G.foot>3.4){G.foot=0;Au.foot(spr?.2:.12);}}
 an.bob+=dt*spd*1.6*(P.onGround?1:0);
 nearP=null;for(const p of picks){if(p.on&&p.pos.distanceTo(P.pos)<2.4){nearP=p;break;}}
 const el=$("interact");if(nearP){el.style.display="block";el.textContent="[E / USE]  PICK UP "+nearP.type.toUpperCase();}else el.style.display="none";}
function pDmg(dm,killer,ig,kid){if(!P.alive||G.over)return;if(P.prot>0&&!ig)return;
 const ab=Math.min(P.ar,Math.round(dm*.6));P.ar-=ab;P.hp-=dm-ab;G.dv=1;Au.bp(220,.12,.3);G.shake=Math.max(G.shake,.25);
 if(P.hp<=0){P.hp=0;pDie(killer,kid);}hudV();}
function pDie(killer,kid){P.alive=false;P.d++;P.streak=0;P.combo=1;
 P.respT=G.mode==="mp_coop"?99999:3;Au.bp(160,.4,.4);
 feed((killer||"?")+" ▶ "+P.name);$("respawnMsg").style.display="flex";
 send({t:"d",by:kid||null,kn:killer||"?"});
 if(G.mode==="survival")end("YOU SURVIVED "+G.wave+" WAVES");
 else if(G.mode==="tdm")G.sB++;}
function pKill(v){P.k++;if(G.t-P.lastK<4)P.combo=Math.min(4,P.combo+1);else P.combo=1;P.lastK=G.t;
 P.streak++;P.best=Math.max(P.best,P.streak);P.score+=100*P.combo;
 if(G.mode==="tdm"&&v&&v.team!==P.team)G.sA++;
 cMsg(P.streak===3?"KILLING SPREE!":P.streak===5?"RAMPAGE!":P.streak>=8?"UNSTOPPABLE!":"ELIMINATED"+(P.combo>1?" x"+P.combo:""));}
function respawn(){let bs=SP[0],bd=-1;for(const s of SP){let md=1e9;for(const b of bots)if(b.alive)md=Math.min(md,s.distanceTo(b.pos));if(md>bd){bd=md;bs=s;}}
 P.pos.copy(bs);P.vel.set(0,0,0);P.hp=100;P.ar=50;P.st=100;P.alive=true;P.prot=2.5;$("respawnMsg").style.display="none";hudV();}
function interact(){if(!nearP||!P.alive)return;const p=nearP;
 if(p.type==="health")P.hp=Math.min(100,P.hp+50);else if(p.type==="armor")P.ar=Math.min(100,P.ar+50);
 else{const w=cw(),st=ws[w.id];st.res=Math.min(w.res*2,st.res+w.mag*2);}
 Au.bp(700,.1,.3);p.on=false;p.mesh.visible=false;p.t=20;hudV();hudW();}
function hudV(){$("hpFill").style.width=P.hp+"%";$("hpTxt").textContent=Math.ceil(P.hp);$("arFill").style.width=P.ar+"%";$("arTxt").textContent=Math.ceil(P.ar);}
function hudW(){const w=cw(),st=ws[w.id];$("wName").textContent=w.name;$("ammoM").textContent=w.mel?"∞":st.mag;$("ammoR").textContent=w.mel?"":st.res;
 $("fireMode").textContent=w.mel?"MELEE":w.auto?"AUTO":w.pel?"PUMP":"SEMI";}
function hitM(hd){const h=$("hitmarker");h.className=hd?"head":"";h.style.opacity=1;clearTimeout(h._t);h._t=setTimeout(()=>h.style.opacity=0,90);}
function dNum(wp,dm,hd){const v=wp.clone().project(cam);if(v.z>1)return;const d=document.createElement("div");
 d.className="dmgNum"+(hd?" head":"");d.style.left=((v.x*.5+.5)*innerWidth+rand(-14,14))+"px";d.style.top=((-v.y*.5+.5)*innerHeight)+"px";
 d.textContent=dm;$("dmgNums").appendChild(d);setTimeout(()=>d.remove(),820);}
function feed(t){const d=document.createElement("div");d.textContent=t;const k=$("killfeed");k.prepend(d);
 while(k.children.length>6)k.lastChild.remove();setTimeout(()=>d.remove(),5100);}
function cMsg(t,dur){const c=$("centerMsg");c.textContent=t;c.style.opacity=1;clearTimeout(c._t);c._t=setTimeout(()=>c.style.opacity=0,dur||1400);}
function topEK(){let m=0;for(const b of bots)m=Math.max(m,b.k);for(const r of rpList())m=Math.max(m,r.k);return m;}
function teamScores(){let a=0,b=0;const add=(t,k)=>{if(t==="A")a+=k;else b+=k;};add(P.team,P.k);for(const r of rpList())add(r.team,r.k);return{a,b};}
function hud(dt){G.dv=Math.max(0,G.dv-dt*2);
 $("vignette").style.boxShadow="inset 0 0 180px rgba(255,0,0,"+Math.min(1,G.dv+(P.hp<30?.4:0))+")";
 $("stFill").style.width=P.st+"%";
 const t=Math.abs(G.mt),mm=Math.floor(t/60),ss=Math.floor(t%60);$("timer").textContent=mm+":"+(ss<10?"0":"")+ss;
 if(G.mode==="tdm"){$("scA").textContent=G.sA;$("scB").textContent=G.sB;}
 else if(G.mode==="mp_tdm"){const ts=teamScores();$("scA").textContent=ts.a;$("scB").textContent=ts.b;}
 else{$("scA").textContent=P.k;$("scB").textContent=topEK();}
 G.fn++;G.ft+=dt;if(G.ft>=.5){$("fpsV").textContent=Math.round(G.fn/G.ft);G.fn=0;G.ft=0;}
 if(sbV)sb();}
function sb(){const R=[{n:P.name+" (YOU)",t:P.team,k:P.k,d:P.d,s:P.score,me:1}];
 for(const r of rpList())R.push({n:r.name,t:r.team,k:r.k,d:r.d,s:r.k*100});
 for(const b of bots)R.push({n:b.name,t:b.team,k:b.k,d:b.d,s:b.k*100});
 R.sort((a,b)=>b.k-a.k);
 $("sbBody").innerHTML=R.map(r=>'<tr class="'+(r.me?"me":"")+'"><td>'+r.n+'</td><td class="team'+r.t+'">'+(isTDM()?r.t:"-")+'</td><td>'+r.k+'</td><td>'+r.d+'</td><td>'+r.s+'</td></tr>').join("");}
function clearBots(){for(const b of bots)scene.remove(b.g);bots.length=0;}
function goFS(){try{const el=document.documentElement;
 if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});}catch(e){}
 try{if(inp.touch&&screen.orientation&&screen.orientation.lock)screen.orientation.lock("landscape").catch(()=>{});}catch(e){}}
function startGame(mode){Au.init();Au.res();goFS();
 G.mode=mode;G.over=false;G.pause=false;G.t=0;G.sA=0;G.sB=0;G.wave=0;G.wDel=0;
 Object.assign(P,{k:0,d:0,score:0,streak:0,best:0,shots:0,hits:0,dmg:0,hp:100,ar:50,st:100,alive:true,wi:6,prot:2.5});
 W.forEach(w=>{ws[w.id].mag=w.mag;ws[w.id].res=w.res;ws[w.id].rl=0;});showW(P.wi);
 clearBots();rockets.forEach(r=>scene.remove(r.g));rockets.length=0;
 for(const p of puppets)p.g.visible=false;
 for(const r of rpList()){r.k=0;r.d=0;r.alive=true;}
 $("respawnMsg").style.display="none";$("reloadMsg").style.display="none";
 let n=0;
 if(mode==="tdm"){G.mt=300;G.lim=30;for(let i=0;i<3;i++)bots.push(new Bot(NAMES[n++],"A","team"));for(let i=0;i<4;i++)bots.push(new Bot(NAMES[n++],"B","team"));$("waveInfo").textContent="TEAM DEATHMATCH";}
 else if(mode==="ffa"){G.mt=300;G.lim=20;for(let i=0;i<6;i++)bots.push(new Bot(NAMES[n++],"F","all"));$("waveInfo").textContent="FREE FOR ALL";}
 else if(mode==="survival"){G.mt=0;wave();}
 else if(mode==="practice"){G.mt=0;for(let i=0;i<4;i++)bots.push(new Bot(NAMES[n++],"B","player","easy"));$("waveInfo").textContent="PRACTICE";}
 else if(mode==="mp_ffa"){G.mt=300;G.lim=20;$("waveInfo").textContent="MP FREE FOR ALL";}
 else if(mode==="mp_tdm"){G.mt=300;G.lim=30;$("waveInfo").textContent="MP TEAM DEATHMATCH";}
 else if(mode==="mp_coop"){G.mt=0;if(isHost)wave();else $("waveInfo").textContent="CO-OP SURVIVAL";}
 respawn();hideAll();$("hud").style.display="block";$("pname").textContent=P.name;
 if(inp.touch)$("touchUI").style.display="block";
 if(isMP())$("pingV").textContent=isHost?"HOST":"...";
 G.run=true;lock();hudV();hudW();cMsg(mode.replace("mp_","MP ").toUpperCase()+" // GO!",1800);}
function wave(){G.wave++;
 const n=2+G.wave*2+(isMP()?rpList().length:0),dk=G.wave<3?"easy":G.wave<5?"normal":G.wave<8?"hard":"extreme";
 for(let i=0;i<n;i++){const b=new Bot(NAMES[i%NAMES.length]+"-"+G.wave,"B","player",dk);b.canR=false;bots.push(b);}
 $("waveInfo").textContent="WAVE "+G.wave+" // "+n+" HOSTILES";cMsg("WAVE "+G.wave,1600);
 P.hp=Math.min(100,P.hp+25);if(!P.alive)respawn();hudV();
 if(isHost&&G.mode==="mp_coop")bcast({t:"wv",w:G.wave,n});}
function upMatch(dt){if(G.over)return;
 if(G.mode==="tdm"||G.mode==="ffa"){G.mt-=dt;
  if(G.mt<=0){G.mt=0;endScore();return;}
  if(G.mode==="tdm"&&(G.sA>=G.lim||G.sB>=G.lim))endScore();
  if(G.mode==="ffa"&&(P.k>=G.lim||topEK()>=G.lim))endScore();}
 else if(G.mode==="mp_ffa"||G.mode==="mp_tdm"){G.mt-=dt;
  if(isHost){let msg=null;
   if(G.mode==="mp_ffa"){let top=P.k,tn=P.name;for(const r of rpList())if(r.k>top){top=r.k;tn=r.name;}
    if(top>=G.lim||G.mt<=0)msg=(G.mt<=0&&top<G.lim?tn+" LEADS - ":"")+tn+" WINS";}
   else{const ts=teamScores();if(ts.a>=G.lim||ts.b>=G.lim||G.mt<=0)msg=ts.a>ts.b?"TEAM ALPHA WINS":ts.b>ts.a?"TEAM BRAVO WINS":"DRAW";}
   if(msg){bcast({t:"end",msg});end(msg);}}}
 else if(G.mode==="mp_coop"){G.mt+=dt;
  if(isHost){if(bots.length&&bots.every(b=>!b.alive)){G.wDel+=dt;if(G.wDel>3){G.wDel=0;clearBots();wave();}}
   if(!P.alive&&rpList().every(r=>!r.alive)){const msg="SQUAD DOWN - WAVE "+G.wave;bcast({t:"end",msg});end(msg);}}}
 else{G.mt+=dt;
  if(G.mode==="survival"&&bots.length&&bots.every(b=>!b.alive)){G.wDel+=dt;if(G.wDel>3){G.wDel=0;clearBots();wave();}}}}
function endScore(){let m;
 if(G.mode==="tdm")m=G.sA>G.sB?"TEAM ALPHA WINS":G.sB>G.sA?"TEAM BRAVO WINS":"DRAW";
 else m=P.k>=topEK()?"YOU WIN":"YOU LOSE";end(m);}
function end(win){if(G.over)return;G.over=true;G.run=false;
 if(document.exitPointerLock)document.exitPointerLock();
 $("hud").style.display="none";$("touchUI").style.display="none";
 $("endWinner").textContent=win;$("eK").textContent=P.k;$("eD").textContent=P.d;
 $("eA").textContent=(P.shots?Math.round(P.hits/P.shots*100):0)+"%";
 $("eDm").textContent=P.dmg;$("eS").textContent=P.best;$("eXp").textContent=P.score;
 hideAll();$("endScreen").classList.remove("hidden");}
function restart(){if(isMP()){if(isHost){bcast({t:"start",mode:G.mode,diff:G.diff,teams:teamMap()});startGame(G.mode);}else cMsg("ONLY HOST CAN RESTART",2000);}
 else if(G.mode)startGame(G.mode);}
/* ===== multiplayer: PeerJS room codes ===== */
let peer=null,isHost=false,conns={},myId="H",MPstarted=false,nAcc=0,pgT=0,bsAcc=0,hostTries=0;
function stat(s){$("mpStatus").textContent=s;}
function mkCode(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return s;}
function pfx(c){return "sv9k2-"+c.toLowerCase();}
function sendTo(c,o){try{c.send(JSON.stringify(o));}catch(e){}}
function bcast(o,except){o.f=o.f||myId;const s=JSON.stringify(o);
 for(const id in conns){if(id===except)continue;try{conns[id].send(s);}catch(e){}}}
function send(o){if(isHost)bcast(o);else if(conns.host&&conns.host.open){o.f=myId;sendTo(conns.host,o);}}
function sendHit(id,dm){if(isHost){if(conns[id])sendTo(conns[id],{t:"h",d:dm,kn:P.name,f:myId});}
 else send({t:"h",to:id,d:dm,kn:P.name});}
function ensRP(id,name,team){if(RPS[id])return RPS[id];
 const h=human(0xd05a20);h.parts.forEach(p=>p.userData.rpId=id);h.g.visible=false;scene.add(h.g);
 RPS[id]={id,name:(""+(name||"PEER")).slice(0,14),team:team||"B",pos:V3(),tp:V3(),yaw:0,hp:100,alive:true,k:0,d:0,g:h.g,parts:h.parts,lL:h.lL,lR:h.lR};
 return RPS[id];}
function dropRP(id){const r=RPS[id];if(r){scene.remove(r.g);delete RPS[id];}}
function autoTeam(){let a=P.team==="A"?1:0,b=P.team==="B"?1:0;for(const r of rpList()){if(r.team==="A")a++;else b++;}return a<=b?"A":"B";}
function teamMap(){const t={};t[myId]=P.team;for(const r of rpList())t[r.id]=r.team;return t;}
function applyTeams(t){if(!t)return;if(t[myId])P.team=t[myId];for(const id in t)if(RPS[id])RPS[id].team=t[id];}
function refreshLobby(){const el=$("lobbyList");if(!el)return;
 const rows=[{id:myId,n:P.name+(isHost?" (HOST)":" (YOU)"),team:P.team}];
 for(const r of rpList())rows.push({id:r.id,n:r.name,team:r.team});
 el.innerHTML=rows.map(r=>'<div class="lrow"><span>'+r.n+'</span><span class="tbadge team'+r.team+'">'+r.team+'</span>'+
  (isHost?'<button data-tid="'+r.id+'">SWAP TEAM</button>':"")+'</div>').join("");
 if(isHost)el.querySelectorAll("button[data-tid]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.tid,cur=id===myId?P.team:(RPS[id]?RPS[id].team:"A"),nt=cur==="A"?"B":"A";
  if(id===myId)P.team=nt;else if(RPS[id])RPS[id].team=nt;
  bcast({t:"team",id,team:nt});refreshLobby();});}
function hostRoom(){if(!window.Peer){stat("PEERJS FAILED TO LOAD");return;}
 disc();isHost=true;myId="H";const code=mkCode();
 stat("OPENING ROOM...");peer=new Peer(pfx(code));
 peer.on("open",()=>{hostTries=0;$("roomCodeBox").textContent=code;$("hostFlow").classList.remove("hidden");
  stat("ROOM OPEN - SHARE CODE "+code);refreshLobby();});
 peer.on("error",e=>{if(e.type==="unavailable-id"&&hostTries<3){hostTries++;hostRoom();}else stat("ERROR: "+e.type);});
 peer.on("connection",c=>{
  c.on("data",raw=>{let m;try{m=JSON.parse(raw);}catch(x){return;}hostMsg(c,m);});
  c.on("close",()=>{const id=c.peer;delete conns[id];dropRP(id);bcast({t:"leave",id});refreshLobby();});});}
function hostMsg(c,m){const id=c.peer;
 if(m.t==="hi"){conns[id]=c;const r=ensRP(id,m.n,autoTeam());
  const pl=[{id:myId,n:P.name,team:P.team}];for(const x of rpList())if(x.id!==id)pl.push({id:x.id,n:x.name,team:x.team});
  sendTo(c,{t:"wel",id,players:pl});bcast({t:"join",id,n:r.name,team:r.team},id);refreshLobby();
  if(MPstarted)sendTo(c,{t:"start",mode:G.mode,diff:G.diff,teams:teamMap()});return;}
 if(m.t==="p"){sendTo(c,{t:"q",ts:m.ts});return;}
 m.f=id;
 if(m.t==="h"){if(m.to===myId)pDmg(m.d,m.kn||(RPS[id]?RPS[id].name:"PEER"),false,id);
  else if(conns[m.to])sendTo(conns[m.to],m);return;}
 if(m.t==="bh"){const b=bots[m.i];if(b&&b.alive)b.dmgIn(m.d,m.p||"body",{netId:id});return;}
 route(m);
 if(m.t==="s"||m.t==="f"||m.t==="d")bcast(m,id);}
function joinRoom(){if(!window.Peer){stat("PEERJS FAILED TO LOAD");return;}
 const code=($("joinCode").value||"").trim().toUpperCase();
 if(code.length!==4){stat("ENTER THE 4-CHAR CODE");return;}
 disc();isHost=false;stat("CONNECTING...");
 peer=new Peer();
 peer.on("open",pid=>{myId=pid;
  const c=peer.connect(pfx(code),{reliable:true});
  c.on("open",()=>{conns={host:c};stat("CONNECTED - WAITING FOR HOST");sendTo(c,{t:"hi",n:P.name});});
  c.on("data",raw=>{let m;try{m=JSON.parse(raw);}catch(x){return;}route(m);});
  c.on("close",()=>{stat("DISCONNECTED");if(isMP()&&!G.over)cMsg("HOST LEFT",3000);});});
 peer.on("error",e=>stat(e.type==="peer-unavailable"?"ROOM NOT FOUND":"ERROR: "+e.type));}
function disc(){try{if(peer)peer.destroy();}catch(e){}peer=null;conns={};isHost=false;myId="H";MPstarted=false;
 for(const id in RPS)dropRP(id);stat("OFFLINE");$("hostFlow").classList.add("hidden");$("roomCodeBox").textContent="----";refreshLobby();}
function applyBotStates(arr){
 while(puppets.length<arr.length){const h=human(0xb03a30);const idx=puppets.length;
  h.parts.forEach(p=>p.userData.pup=idx);scene.add(h.g);
  puppets.push({g:h.g,parts:h.parts,pos:V3(),tp:V3(),ry:0,alive:true});}
 arr.forEach((a,i)=>{const p=puppets[i];p.g.visible=true;p.tp.set(a[0],a[1],a[2]);p.ry=a[3];const al=!!a[4];
  if(al!==p.alive){p.alive=al;p.g.rotation.x=al?0:1.4;
   if(!al){const pp=p;setTimeout(()=>{if(!pp.alive)pp.g.visible=false;},1500);}}});
 for(let i=arr.length;i<puppets.length;i++)puppets[i].g.visible=false;}
function route(m){switch(m.t){
 case"wel":myId=m.id;stat("IN ROOM - WAITING FOR HOST");(m.players||[]).forEach(p=>{if(p.id!==myId)ensRP(p.id,p.n,p.team);});refreshLobby();break;
 case"join":if(m.id!==myId){ensRP(m.id,m.n,m.team);feed(m.n+" JOINED");}refreshLobby();break;
 case"leave":dropRP(m.id);refreshLobby();break;
 case"team":if(m.id===myId)P.team=m.team;else if(RPS[m.id])RPS[m.id].team=m.team;refreshLobby();break;
 case"start":MPstarted=true;G.diff=m.diff||"normal";startGame(m.mode);applyTeams(m.teams);break;
 case"s":{const r=RPS[m.f];if(r){r.tp.set(m.p[0],m.p[1],m.p[2]);r.yaw=m.y;r.hp=m.hp;r.alive=m.a;r.k=m.k;r.d=m.dd;
  if(r.g)r.g.visible=G.run&&m.a;}break;}
 case"f":{const r=RPS[m.f];if(r&&r.g&&r.g.visible){const mz=V3(r.pos.x,r.pos.y+1.35,r.pos.z),d=V3(-Math.sin(r.yaw),0,-Math.cos(r.yaw));
  tracer(mz,mz.clone().addScaledVector(d,40),0xff9060);Au.shot(.5,1.2,clamp(1-r.pos.distanceTo(P.pos)/50,.03,.6));}break;}
 case"h":pDmg(m.d,m.kn||"PEER",false,m.f);break;
 case"d":{const r=RPS[m.f];if(r){r.d++;r.alive=false;
  const bn=m.by===myId?P.name:(RPS[m.by]?RPS[m.by].name:(m.kn||"?"));
  feed(bn+" ▶ "+r.name);if(m.by===myId)pKill(null);}break;}
 case"bs":applyBotStates(m.b);break;
 case"bf":{const p=puppets[m.i];if(p&&p.g.visible){const mz=V3(p.pos.x,p.pos.y+1.4,p.pos.z);
  tracer(mz,V3(P.pos.x,P.pos.y+1.2,P.pos.z).add(V3(rand(-1,1),rand(-.5,.5),rand(-1,1))),0xffb060);
  Au.shot(.6,1.1,clamp(1-p.pos.distanceTo(P.pos)/60,.03,.7));}break;}
 case"bd":{const p=puppets[m.i];if(p)fxp(V3(p.pos.x,p.pos.y+1,p.pos.z),0x881111,10,4,.7);
  feed((m.by===myId?P.name:(m.kn||"?"))+" ▶ HOSTILE");if(m.by===myId)pKill(null);break;}
 case"wv":G.wave=m.w;$("waveInfo").textContent="WAVE "+m.w+" // "+m.n+" HOSTILES";cMsg("WAVE "+m.w,1600);
  P.hp=Math.min(100,P.hp+25);if(!P.alive)respawn();hudV();break;
 case"end":end(m.msg);break;
 case"q":$("pingV").textContent=Math.round(performance.now()-m.ts);break;}}
function upNet(dt){
 for(const id in RPS){const r=RPS[id];if(!r.g.visible)continue;
  r.pos.lerp(r.tp,Math.min(1,dt*12));r.g.position.copy(r.pos);r.g.rotation.y=r.yaw+Math.PI;
  const sw=Math.sin(G.t*9)*.5*clamp(r.tp.distanceTo(r.pos)*20,0,1);r.lL.rotation.x=sw;r.lR.rotation.x=-sw;}
 for(const p of puppets){if(!p.g.visible)continue;p.pos.lerp(p.tp,Math.min(1,dt*10));p.g.position.copy(p.pos);p.g.rotation.y=p.ry+Math.PI;}
 const on=isHost?Object.keys(conns).length>0:(conns.host&&conns.host.open);
 if(!on)return;
 nAcc+=dt;if(nAcc>1/15){nAcc=0;
  send({t:"s",p:[+P.pos.x.toFixed(2),+P.pos.y.toFixed(2),+P.pos.z.toFixed(2)],y:+P.yaw.toFixed(3),hp:P.hp,a:P.alive,k:P.k,dd:P.d});}
 if(!isHost){pgT+=dt;if(pgT>2){pgT=0;send({t:"p",ts:performance.now()});}}
 if(isHost&&G.mode==="mp_coop"){bsAcc+=dt;if(bsAcc>.1){bsAcc=0;
  bcast({t:"bs",b:bots.map(b=>[+b.pos.x.toFixed(1),+b.pos.y.toFixed(1),+b.pos.z.toFixed(1),+b.g.rotation.y.toFixed(2),b.alive?1:0])});}}}
/* ===== input ===== */
function lock(){if(inp.touch)return;const c=ren.domElement;if(c.requestPointerLock)c.requestPointerLock();}
document.addEventListener("pointerlockchange",()=>{inp.lock=document.pointerLockElement===ren.domElement;
 if(!inp.lock&&G.run&&!G.pause&&!G.over&&!inp.touch)pauseG();});
addEventListener("mousemove",e=>{if(!inp.lock||!G.run||G.pause)return;const s=.0022*S.sens;
 P.yaw-=e.movementX*s;P.pit=clamp(P.pit-e.movementY*s,-1.45,1.45);
 inp.sx=clamp(inp.sx-e.movementX*.02,-1,1);inp.sy=clamp(inp.sy-e.movementY*.02,-1,1);});
addEventListener("mousedown",e=>{if(!G.run||G.pause||G.over)return;
 if(!inp.lock&&!inp.touch){lock();return;}
 if(e.button===0){inp.fire=1;inp.edge=1;}if(e.button===2)inp.ads=1;});
addEventListener("mouseup",e=>{if(e.button===0)inp.fire=0;if(e.button===2)inp.ads=0;});
addEventListener("contextmenu",e=>e.preventDefault());
addEventListener("wheel",e=>{if(!G.run||G.pause)return;swW((P.wi+(e.deltaY>0?1:W.length-1))%W.length);});
addEventListener("keydown",e=>{inp.k[e.code]=true;
 if(e.code==="Tab"){e.preventDefault();sbV=true;$("scoreboard").style.display="block";}
 if(!G.run)return;
 if(e.code==="Escape"){if(!G.pause)pauseG();else resumeG();}
 if(G.pause||G.over)return;
 if(e.code==="Space"){e.preventDefault();inp.jump=1;}
 if(e.code==="KeyR")reload();
 if(e.code==="KeyQ")swW(P.lwi);
 if(e.code==="KeyE")interact();
 if(e.code.indexOf("Digit")===0){const n=+e.code.slice(5);if(n>=1&&n<=9)swW(n-1);}});
addEventListener("keyup",e=>{inp.k[e.code]=false;
 if(e.code==="Tab"){sbV=false;$("scoreboard").style.display="none";}});
function initTouch(){if(!("ontouchstart"in window))return;inp.touch=true;
 let jid=null,jc={x:0,y:0},lid=null,lx=0,ly=0;const joy=$("joy"),kn=$("joyKnob");
 joy.addEventListener("touchstart",e=>{e.preventDefault();const t=e.changedTouches[0];jid=t.identifier;
  const r=joy.getBoundingClientRect();jc={x:r.left+60,y:r.top+60};},{passive:false});
 $("lookPad").addEventListener("touchstart",e=>{const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY;},{passive:true});
 addEventListener("touchmove",e=>{for(const t of e.changedTouches){
  if(t.identifier===jid){const dx=clamp((t.clientX-jc.x)/50,-1,1),dy=clamp((t.clientY-jc.y)/50,-1,1);
   inp.jx=dx;inp.jy=dy;kn.style.left=38+dx*34+"px";kn.style.top=38+dy*34+"px";}
  if(t.identifier===lid){P.yaw-=(t.clientX-lx)*.006*S.sens;P.pit=clamp(P.pit-(t.clientY-ly)*.006*S.sens,-1.45,1.45);lx=t.clientX;ly=t.clientY;}}},{passive:true});
 addEventListener("touchend",e=>{for(const t of e.changedTouches){
  if(t.identifier===jid){jid=null;inp.jx=0;inp.jy=0;kn.style.left="38px";kn.style.top="38px";}
  if(t.identifier===lid)lid=null;}});
 const hold=(id,on,off)=>{const el=$(id);if(!el)return;
  el.addEventListener("touchstart",e=>{e.preventDefault();on();},{passive:false});
  if(off)el.addEventListener("touchend",e=>{e.preventDefault();off();},{passive:false});};
 hold("tFire",()=>{inp.fire=1;inp.edge=1;},()=>inp.fire=0);
 hold("tAds",()=>inp.ads=1,()=>inp.ads=0);
 hold("tJump",()=>inp.jump=1);
 hold("tReload",()=>reload());
 hold("tWeap",()=>swW((P.wi+1)%W.length));
 hold("tCrouch",()=>{inp.tCrouch=!inp.tCrouch;$("tCrouch").style.background=inp.tCrouch?"rgba(255,106,0,.4)":"rgba(255,255,255,.12)";});
 hold("tInt",()=>interact());
 hold("tPause",()=>{if(G.run&&!G.over){G.pause?resumeG():pauseG();}});}
/* ===== menus ===== */
function hideAll(){document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));}
function show(id){hideAll();$(id).classList.remove("hidden");}
function pauseG(){if(!G.run||G.over)return;G.pause=true;if(document.exitPointerLock)document.exitPointerLock();show("pauseMenu");}
function resumeG(){G.pause=false;hideAll();lock();}
function quit(){G.run=false;G.pause=false;G.over=true;$("hud").style.display="none";$("touchUI").style.display="none";show("menu");}
function initUI(){
 document.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{Au.init();Au.res();Au.ui();}));
 $("bPlay").onclick=()=>show("modeMenu");
 document.querySelectorAll("#modeMenu [data-mode]").forEach(b=>b.onclick=()=>{G.diff=$("selDiff").value;startGame(b.dataset.mode);});
 $("bModeBack").onclick=()=>show("menu");
 $("bPractice").onclick=()=>{G.diff="easy";startGame("practice");};
 $("bMp").onclick=()=>show("mpMenu");$("bMpBack").onclick=()=>show("menu");
 $("bSettings").onclick=()=>{back="menu";show("settingsMenu");};$("bSetBack").onclick=()=>show(back);
 $("bControls").onclick=()=>show("controlsMenu");$("bCtrlBack").onclick=()=>show("menu");
 $("bResume").onclick=resumeG;$("bPSettings").onclick=()=>{back="pauseMenu";show("settingsMenu");};
 $("bPRestart").onclick=restart;$("bPQuit").onclick=quit;
 $("bEndRestart").onclick=restart;$("bEndMenu").onclick=quit;
 $("bHostRoom").onclick=hostRoom;$("bJoinRoom").onclick=joinRoom;$("bLeave").onclick=disc;
 $("bCopyCode").onclick=()=>{const c=$("roomCodeBox").textContent;
  try{navigator.clipboard.writeText(c);stat("CODE COPIED: "+c);}catch(e){stat("CODE: "+c);}};
 $("bStart").onclick=()=>{if(!isHost)return;MPstarted=true;const mode=$("mpMode").value;G.diff=$("mpDiff").value;
  bcast({t:"start",mode,diff:G.diff,teams:teamMap()});startGame(mode);};
 $("mpName").oninput=e=>{P.name=(e.target.value||"Player").toUpperCase().slice(0,14);};
 $("sSens").value=S.sens;$("sFov").value=S.fov;$("sQual").value=S.quality;$("sShadow").checked=S.shadows;
 $("sFx").value=S.fx;$("sVolM").value=S.volM;$("sVolS").value=S.volS;$("sFF").checked=S.ff;
 const uv=()=>{$("vSens").textContent=(+S.sens).toFixed(2);$("vFov").textContent=S.fov;$("vFx").textContent=(+S.fx).toFixed(1);
  $("vVolM").textContent=(+S.volM).toFixed(2);$("vVolS").textContent=(+S.volS).toFixed(2);};uv();
 $("sSens").oninput=e=>{S.sens=+e.target.value;uv();saveS();};
 $("sFov").oninput=e=>{S.fov=+e.target.value;uv();saveS();};
 $("sQual").onchange=e=>{S.quality=e.target.value;qual();saveS();};
 $("sShadow").onchange=e=>{S.shadows=e.target.checked;qual();saveS();};
 $("sFx").oninput=e=>{S.fx=+e.target.value;uv();saveS();};
 $("sVolM").oninput=e=>{S.volM=+e.target.value;Au.upd();uv();saveS();};
 $("sVolS").oninput=e=>{S.volS=+e.target.value;uv();saveS();};
 $("sFF").onchange=e=>{S.ff=e.target.checked;saveS();};}
/* ===== camera & weapon animation ===== */
function upCam(dt){const eye=P.crouch?1.15:1.62,spd=Math.hypot(P.vel.x,P.vel.z);
 const by=Math.sin(an.bob*2)*.03*clamp(spd/6,0,1);
 cam.position.set(P.pos.x,P.pos.y+eye+by,P.pos.z);
 P.pr=lerp(P.pr,0,Math.min(1,dt*8));const sh=G.shake;G.shake=Math.max(0,G.shake-dt*2.5);
 cam.rotation.y=P.yaw+(sh?rand(-sh,sh)*.05:0);
 cam.rotation.x=clamp(P.pit,-1.45,1.45)+P.pr+(sh?rand(-sh,sh)*.05:0);
 const w=cw(),tf=inp.ads&&!w.mel?(w.zm||S.fov-14):S.fov;
 cam.fov=lerp(cam.fov,tf,Math.min(1,dt*10));cam.updateProjectionMatrix();}
function upWA(dt){const w=cw(),st=ws[w.id];
 an.sw=Math.min(1,an.sw+dt*3.5);an.ads=lerp(an.ads,inp.ads&&!w.mel?1:0,Math.min(1,dt*10));
 an.kick=lerp(an.kick,0,Math.min(1,dt*10));an.kn=Math.max(0,an.kn-dt*4);
 const spd=Math.hypot(P.vel.x,P.vel.z),bf=clamp(spd/6,0,1)*(1-an.ads);
 const bx=lerp(.28,0,an.ads),by=lerp(-.26,-.185,an.ads),bz=lerp(-.55,-.38,an.ads);
 inp.sx=lerp(inp.sx,0,Math.min(1,dt*6));inp.sy=lerp(inp.sy,0,Math.min(1,dt*6));
 rig.position.set(bx+Math.sin(an.bob)*.012*bf+inp.sx*.02,by+Math.abs(Math.cos(an.bob))*.012*bf+(1-an.sw)*-.35+inp.sy*.02,bz+an.kick);
 rig.rotation.x=(st.rl&&w.rel?-.9*Math.sin(Math.min(1,(w.rel-st.rl)/w.rel)*Math.PI):0)+an.kick*1.2+(1-an.sw)*-.7-an.kn*.9;
 rig.rotation.y=an.kn*.4;rig.rotation.z=Math.sin(an.bob*.5)*.01*(1-an.ads);
 const spr=(inp.k.ShiftLeft||inp.k.ShiftRight||(inp.touch&&inp.jy<-.85))&&spd>4;if(spr)rig.rotation.x-=.3;
 const fl=wm[w.id].userData.fl;if(fl&&fl.material.opacity>0)fl.material.opacity=Math.max(0,fl.material.opacity-dt*14);}
/* ===== main loop & boot ===== */
let lastT=performance.now();
function loop(){requestAnimationFrame(loop);
 const now=performance.now();let dt=Math.min((now-lastT)/1000,.05);lastT=now;
 if(G.run&&!G.pause){G.t+=dt;upPlayer(dt);if(inp.fire)tryFire();upReload(dt);
  for(const b of bots)b.update(dt);upRockets(dt);
  for(const p of picks){if(!p.on){p.t-=dt;if(p.t<=0){p.on=true;p.mesh.visible=true;}}
   else{p.mesh.rotation.y+=dt*2;p.mesh.position.y=1+Math.sin(G.t*2+p.pos.x)*.15;}}
  upMatch(dt);}
 upNet(dt);fxUp(dt);upWA(dt);upCam(dt);if(G.run)hud(dt);
 ren.render(scene,cam);}
function boot(){try{initGL();buildMap();initW();initFx();initTouch();initUI();refreshLobby();}
 catch(e){fatal(e.message||String(e));return;}
 let p=0;const iv=setInterval(()=>{p+=25;$("loadFill").style.width=Math.min(100,p)+"%";
  if(p>=100){clearInterval(iv);$("loading").classList.add("hidden");$("menu").classList.remove("hidden");}},100);
 loop();}
if(document.readyState==="complete")boot();else addEventListener("load",boot);
/* end of game2.js */
