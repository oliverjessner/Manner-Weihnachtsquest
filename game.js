import { drawWorld } from './world.js';
import { level } from './level.js';

const $ = id => document.getElementById(id);
const ctx = $('world').getContext('2d');
const keys = new Set();
const pointers = new Map();
const assets = {};
const halfWidth = 7, playerHeight = 30;
const physics = {speed:82,gravity:850,jump:340,coyote:.105,buffer:.135};
let state, accumulator=0, lastUI='', captured=new URLSearchParams(location.search).get('capture')==='1';
let muted=false, audioContext;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

for(const [key,name] of [['eightSprite','eight-sprite.png'],['eighteenSprite','eighteen-sprite.png']]){
  assets[key]=new Image();assets[key].src=`./assets/products/${name}`;assets[key].onload=()=>render();
}
assets.ads=level.ads.map(ad=>{
  const img=new Image();img.src=`./assets/ads/${ad.file}`;img.onload=()=>render();return img;
});

function clearInput(){
  keys.clear();pointers.clear();
  document.querySelectorAll('[data-action]').forEach(button=>button.classList.remove('pressed'));
  if(state){state.jumpBuffer=0;if(state.phase==='playing'&&state.hurtTime<=0)state.player.vx=0;}
}

function reset(){
  clearInput();
  state={phase:'start',phaseTime:0,time:0,elapsed:0,camera:0,player:{x:68,y:374,vx:0,vy:0,facing:1,grounded:true,invulnerable:0},hp:3,maxHp:3,inventory:[],savingsCollected:false,checkpoint:{active:false,x:68},socks:level.socks.map(sock=>({...sock})),ties:level.ties.map(tie=>({...tie})),lines:[],underwear:[],jumpBuffer:0,coyote:physics.coyote,hurtTime:0,hitCount:0,lastHit:null,deaths:0,gameovers:0,toast:null,reducedMotion};
  state.calendars=level.calendars.map(makeCalendar);
  state.calendarPages=[];state.calendarShots=0;state.nextPageId=1;
  accumulator=0;lastUI='';syncUI();render();
}

function held(action){
  const codes=action==='left'?['ArrowLeft','KeyA']:action==='right'?['ArrowRight','KeyD']:['Space','ArrowUp','KeyW'];
  return codes.some(code=>keys.has(code))||[...pointers.values()].some(value=>value===action);
}
function requestJump(){if(state.phase==='playing')state.jumpBuffer=physics.buffer;}
function notify(text,kicker='GESCHENK GESICHERT',duration=3.6){state.toast={text,kicker,remaining:duration};lastUI='';}
function phase(next){state.phase=next;state.phaseTime=0;clearInput();lastUI='';syncUI();}
function confirm(){
  if(state.phase==='start'){phase('playing');playTone('collect');}
  else if(state.phase==='gameover')retry();
}

function retry(){
  if(state.phase!=='gameover')return;
  state.hp=state.maxHp;state.toast=null;respawn();phase('playing');
}

function playTone(kind){
  if(muted)return;
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const notes={jump:[330,440],hit:[160,110],collect:[392,494,659],checkpoint:[440,587],finish:[392,494,587,784]}[kind];
    notes.forEach((frequency,i)=>{
      const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+i*.085;
      oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.03,start+.01);gain.gain.exponentialRampToValueAtTime(.001,start+.12);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.14);
    });
  }catch{muted=true;lastUI='';}
}

function hit(sourceX,kind='socks'){
  const p=state.player;
  if(p.invulnerable>0||state.phase!=='playing')return;
  state.hp=Math.max(0,state.hp-1);state.lastHit={kind,x:sourceX,time:state.time};
  p.invulnerable=1.45;p.vx=p.x<sourceX?-120:120;p.vy=-145;p.grounded=false;state.hurtTime=.24;state.hitCount++;
  playTone('hit');
  if(state.hp===0){state.gameovers++;state.toast=null;p.vx=0;p.vy=0;phase('gameover');}
  else notify(`Autsch! Noch ${state.hp} ${state.hp===1?'Herz':'Herzen'}. Die Packungen bleiben bei dir.`,'GESCHENKEALARM',1.6);
}
function respawn(){
  const p=state.player;
  p.x=state.checkpoint.x;p.y=level.groundY;p.vx=0;p.vy=0;p.grounded=true;p.invulnerable=1.6;state.hurtTime=0;state.coyote=physics.coyote;state.jumpBuffer=0;
  state.camera=Math.max(0,p.x-88);
  resetCalendarAttacks();
  notify(state.checkpoint.active?'Zurück am Checkpoint. Geschenke gesichert.':'Nochmal Anlauf nehmen. Du schaffst das.','WEITER GEHT’S',2.4);
}
function overlaps(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

function makeCalendar(definition){
  return {...definition,phase:'idle',timer:0,cooldown:.7,warning:false,open:0,progress:0,dir:-1,cycle:0,shotCount:0,targetY:350,warningStartedAt:null,lastShotAt:null};
}

function resetCalendarAttacks(){
  state.calendars=level.calendars.map(definition=>({...makeCalendar(definition),cooldown:1.2}));
  state.calendarPages=[];
}

function launchCalendarPage(calendar){
  const shot=calendar.shotCount;
  const x=calendar.x+calendar.dir*17,y=calendar.y+5;
  const flightTime=.65,gravity=110;
  // Aim once during the warning; the loose sheets never follow the player.
  const aimedVelocity=Math.max(4,Math.min(140,(calendar.targetY-y-.5*gravity*flightTime**2)/flightTime));
  state.calendarPages.push({id:state.nextPageId++,ownerId:calendar.id,cycle:calendar.cycle,x,y,vx:calendar.dir*(112+shot*8),vy:aimedVelocity+(shot-1)*12,gravity,angle:calendar.dir*.08,month:((calendar.cycle-1)*3+shot)%12+1,age:0,active:true,createdAt:state.time});
  calendar.shotCount++;calendar.lastShotAt=state.time;state.calendarShots++;
}

function updateCalendars(dt){
  const p=state.player;
  for(const calendar of state.calendars){
    calendar.progress=calendar.timer;
    if(calendar.phase==='idle'){
      calendar.cooldown=Math.max(0,calendar.cooldown-dt);calendar.warning=false;calendar.open=0;
      const visible=calendar.x>=state.camera+20&&calendar.x<=state.camera+268;
      if(calendar.cooldown===0&&visible&&Math.abs(calendar.x-p.x)<185){
        calendar.phase='warning';calendar.timer=0;calendar.warning=true;calendar.cycle++;calendar.shotCount=0;
        calendar.dir=p.x<calendar.x?-1:1;calendar.targetY=Math.max(285,Math.min(365,p.y-15));calendar.warningStartedAt=state.time;
      }
    }else if(calendar.phase==='warning'){
      calendar.timer+=dt;calendar.warning=true;calendar.open=.12+.18*Math.min(1,calendar.timer/calendar.warningDuration);
      if(calendar.timer>=calendar.warningDuration){calendar.phase='burst';calendar.timer-=calendar.warningDuration;calendar.warning=false;calendar.open=1;}
    }else{
      calendar.timer+=dt;calendar.warning=false;
      while(calendar.shotCount<3&&calendar.timer>=calendar.shotCount*calendar.burstSpacing)launchCalendarPage(calendar);
      calendar.open=calendar.timer<.85?1:Math.max(0,1-(calendar.timer-.85)/.45);
      if(calendar.timer>=1.3){calendar.phase='idle';calendar.timer=0;calendar.cooldown=calendar.cooldownDuration;calendar.open=0;}
    }
  }
  for(const page of state.calendarPages){
    if(!page.active)continue;
    page.age+=dt;page.vy+=page.gravity*dt;page.x+=page.vx*dt;page.y+=page.vy*dt;
    page.angle+=Math.sign(page.vx)*dt*.65+Math.sin(page.age*11)*dt*.2;
    if(page.age>3||page.y>level.groundY+15||page.x<-30||page.x>level.width+30){page.active=false;continue;}
    if(overlaps(p.x-7,p.y-30,14,30,page.x-7,page.y-9,14,18)){
      page.active=false;hit(page.x,'calendar');
      if(state.phase!=='playing')return;
    }
  }
  state.calendarPages=state.calendarPages.filter(page=>page.active);
}

function update(dt){
  state.time+=dt;state.phaseTime+=dt;
  if(state.toast){state.toast.remaining-=dt;if(state.toast.remaining<=0){state.toast=null;lastUI='';}}
  if(state.phase!=='playing')return;
  state.elapsed+=dt;
  const p=state.player;
  p.invulnerable=Math.max(0,p.invulnerable-dt);state.hurtTime=Math.max(0,state.hurtTime-dt);
  state.jumpBuffer=Math.max(0,state.jumpBuffer-dt);
  state.coyote=p.grounded?physics.coyote:Math.max(0,state.coyote-dt);
  if(state.jumpBuffer>0&&state.coyote>0&&state.hurtTime<=0){p.vy=-physics.jump;p.grounded=false;state.coyote=0;state.jumpBuffer=0;playTone('jump');}
  if(state.hurtTime<=0){
    const direction=Number(held('right'))-Number(held('left'));
    p.vx=direction*physics.speed;if(direction)p.facing=direction;
  }
  const previousX=p.x,previousY=p.y;
  p.x=Math.max(12,Math.min(level.width-12,p.x+p.vx*dt));
  for(const platform of level.platforms){
    if(platform.y>=level.groundY||platform.kind==='sill')continue;
    if(previousY>platform.y+2&&previousY-playerHeight<platform.y+platform.h&&p.y>platform.y+2){
      if(previousX+halfWidth<=platform.x&&p.x+halfWidth>platform.x)p.x=platform.x-halfWidth;
      else if(previousX-halfWidth>=platform.x+platform.w&&p.x-halfWidth<platform.x+platform.w)p.x=platform.x+platform.w+halfWidth;
    }
  }
  p.vy+=physics.gravity*dt;p.y+=p.vy*dt;p.grounded=false;
  const overGap=level.gaps.some(gap=>p.x>gap.x+2&&p.x<gap.x+gap.w-2);
  const floors=overGap?[...level.platforms]:[...level.platforms,{x:0,y:level.groundY,w:level.width,h:140}];
  let landingY=Infinity;
  for(const floor of floors){
    if(p.vy>=0&&previousY<=floor.y+.6&&p.y>=floor.y&&p.x+halfWidth>floor.x+2&&p.x-halfWidth<floor.x+floor.w-2)landingY=Math.min(landingY,floor.y);
  }
  if(landingY<Infinity){p.y=landingY;p.vy=0;p.grounded=true;}
  if(p.y>530){state.deaths++;p.invulnerable=0;hit(p.x,'fall');if(state.phase==='playing')respawn();return;}
  for(const sock of state.socks){
    sock.x+=sock.dir*sock.speed*dt;
    if(sock.x<=sock.left){sock.x=sock.left;sock.dir=1;}else if(sock.x>=sock.right){sock.x=sock.right;sock.dir=-1;}
    if(overlaps(p.x-halfWidth,p.y-playerHeight,halfWidth*2,playerHeight,sock.x-13,sock.y-16,26,16))hit(sock.x);
    if(state.phase!=='playing')return;
  }
  for(const tie of state.ties){
    tie.x+=tie.dir*tie.speed*dt;
    if(tie.x<=tie.left){tie.x=tie.left;tie.dir=1;}else if(tie.x>=tie.right){tie.x=tie.right;tie.dir=-1;}
    tie.y=tie.baseY-Math.abs(Math.sin(state.time*3+tie.offset))*8;
    if(overlaps(p.x-halfWidth,p.y-playerHeight,14,30,tie.x-8,tie.y-28,16,28))hit(tie.x,'tie');
    if(state.phase!=='playing')return;
  }
  state.lines=level.lines.map(line=>{
    const progress=(state.time+line.offset)%line.period;
    return {...line,progress,warning:progress>line.period-1.05};
  });
  state.underwear=state.lines.map(line=>{
    const t=line.progress/1.8,active=t<=1;
    return {x:line.x+36+180*t,y:line.y-45*Math.sin(Math.PI*t)+126*t*t,angle:Math.sin(t*Math.PI*2)*.35,active};
  });
  for(const pants of state.underwear){
    if(pants.active&&overlaps(p.x-halfWidth,p.y-playerHeight,14,30,pants.x-10,pants.y-7,20,14))hit(pants.x,'underwear');
    if(state.phase!=='playing')return;
  }
  updateCalendars(dt);
  if(state.phase!=='playing')return;
  for(const product of level.products){
    if(!state.inventory.includes(product.id)&&overlaps(p.x-7,p.y-30,14,30,product.x-11,product.y-13,22,26)){
      state.inventory.push(product.id);notify(`${product.id}-Geschenkpackung · ${product.name}`);playTone('collect');
    }
  }
  const book=level.savingsBook;
  if(!state.savingsCollected&&overlaps(p.x-7,p.y-30,14,30,book.x-12,book.y-11,24,22)){
    state.savingsCollected=true;notify('+0,01 € Zinsen','SPARBUCH GEFUNDEN',4);playTone('collect');
  }
  if(!state.checkpoint.active&&p.x>=level.checkpointX){state.checkpoint={active:true,x:level.checkpointX};notify('Checkpoint erreicht. Deine Geschenke bleiben sicher.','ABSCHNITT 02 · DER WÄSCHEHOF',2.5);playTone('checkpoint');}
  if(p.x>=level.finishX){
    if(state.inventory.length===2){state.toast=null;p.vx=0;phase('ending');playTone('finish');}
    else if(!state.toast)notify('Hier fehlen noch Geschenke. Sammle die 8er und die 18er.','NOCH NICHT GERETTET',3);
  }
  const lookAhead=p.facing===1?88:167;
  const target=Math.max(0,Math.min(level.width-288,p.x-lookAhead));
  state.camera+=(target-state.camera)*Math.min(1,dt*5);
}

function syncUI(){
  const area=state.player.x>=level.boundary?2:1;
  const stamp=[state.phase,state.inventory.join(','),state.hp,state.savingsCollected,state.checkpoint.active,state.toast?.text,captured,muted,area].join('|');
  $('route-progress').style.width=`${Math.min(100,state.player.x/level.finishX*100)}%`;
  if(stamp===lastUI)return;lastUI=stamp;
  const playing=state.phase==='playing',ending=state.phase==='ending',over=state.phase==='gameover',starting=state.phase==='start';
  $('game').classList.toggle('ending',ending);
  $('game').classList.toggle('menu-open',!playing);
  $('game').classList.toggle('starting',starting);
  document.body.classList.toggle('starting',starting);
  document.querySelector('.hud').hidden=starting;
  document.body.classList.toggle('capture',captured);
  $('scene-name').textContent=ending?'WEIHNACHTEN GERETTET':starting?'DEINE WEIHNACHTSMISSION':area===1?'01 · VERSCHNEITE GASSE':'02 · DER WÄSCHEHOF';
  $('quest-count').textContent=`${state.inventory.length} / 2`;
  $('quest-text').textContent=ending?'Die guten Geschenke haben gewonnen.':over?'Kurz durchatmen. Weihnachten braucht dich noch.':state.inventory.length===2?'Beide gerettet! Jetzt noch bis zur Zielflagge.':'Sammle beide Packungen. Rette die Bescherung.';
  $('health').hidden=starting||ending;
  $('health').setAttribute('aria-label',`${state.hp} von ${state.maxHp} Herzen`);
  $('health-text').textContent=`${state.hp} / ${state.maxHp}`;
  document.querySelectorAll('.heart').forEach((heart,index)=>heart.classList.toggle('empty',index>=state.hp));
  for(const [id,size] of [['eight','8er'],['eighteen','18er']]){
    const collected=state.inventory.includes(size);$(`inventory-${id}`).classList.toggle('collected',collected);$(`${id}-check`).textContent=collected?'✓':'○';
  }
  $('chapter-one').classList.toggle('active',area===1);$('chapter-two').classList.toggle('active',area===2);
  $('pickup-toast').hidden=!state.toast||!playing;
  if(state.toast){$('toast-kicker').textContent=state.toast.kicker;$('toast-text').textContent=state.toast.text;}
  $('touch-controls').hidden=!playing;
  $('start-screen').hidden=!starting;$('gameover-screen').hidden=!over;$('win-screen').hidden=!ending;
  $('restart').hidden=!ending&&!over;$('win-savings').hidden=!state.savingsCollected;
  $('retry').textContent=state.checkpoint.active?'Am Checkpoint weiter':'Noch ein Versuch';
  $('retry-detail').textContent=state.inventory.length?'Deine Packungen bleiben bei dir.':'Mit drei Herzen zurück in die Mission.';
  $('sound-toggle').setAttribute('aria-pressed',String(!muted));$('sound-toggle').setAttribute('aria-label',muted?'Retro-Sound einschalten':'Retro-Sound ausschalten');$('capture-toggle').setAttribute('aria-pressed',String(captured));
  $('sound-toggle').querySelector('svg').innerHTML=`<path d="M4 9v6h4l5 4V5L8 9H4"/><path d="${muted?'m17 9 5 6m0-6-5 6':'M17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14'}"/>`;
}

function render(){if(state)drawWorld(ctx,state,assets,level);}
for(const button of document.querySelectorAll('[data-action]')){
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();if(state.phase!=='playing')return;
    button.setPointerCapture(event.pointerId);pointers.set(event.pointerId,button.dataset.action);button.classList.add('pressed');
    if(button.dataset.action==='jump')requestJump();
  });
  const release=event=>{
    pointers.delete(event.pointerId);
    if(![...pointers.values()].includes(button.dataset.action))button.classList.remove('pressed');
  };
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,release);
  button.addEventListener('contextmenu',event=>event.preventDefault());
}
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  if(event.target.closest?.('a[href]'))return;
  const code=event.code;
  if(event.target===$('restart')&&['ending','gameover'].includes(state.phase)&&['Space','Enter'].includes(code))return;
  const gameplay=['ArrowLeft','ArrowRight','KeyA','KeyD','ArrowUp','KeyW','Space'];
  if(gameplay.includes(code)||code==='Enter')event.preventDefault();
  if(event.repeat)return;
  if(code==='KeyF'){
    if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
    else $('game').requestFullscreen?.().catch(()=>{});
    return;
  }
  if(state.phase!=='playing'){if(['Space','Enter','KeyE'].includes(code))confirm();return;}
  if(gameplay.includes(code)){keys.add(code);if(['Space','ArrowUp','KeyW'].includes(code))requestJump();}
});
document.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',clearInput);window.addEventListener('pagehide',clearInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});
$('start-button').addEventListener('click',confirm);$('retry').addEventListener('click',retry);$('restart').addEventListener('click',()=>{reset();$('restart').blur()});
$('sound-toggle').addEventListener('click',()=>{muted=!muted;lastUI='';syncUI();if(!muted)playTone('collect')});
$('capture-toggle').addEventListener('click',()=>{
  captured=!captured;const url=new URL(location.href);if(captured)url.searchParams.set('capture','1');else url.searchParams.delete('capture');history.replaceState(null,'',url);lastUI='';syncUI();
});
function resizeGame(){
  const viewport=window.visualViewport;
  const height=viewport?.height||innerHeight,width=viewport?.width||innerWidth;
  document.documentElement.style.setProperty('--viewport-height',`${height}px`);
  const styles=getComputedStyle($('app'));
  const availableHeight=height-parseFloat(styles.paddingTop)-parseFloat(styles.paddingBottom);
  const availableWidth=width-parseFloat(styles.paddingLeft)-parseFloat(styles.paddingRight);
  $('game').style.width=`${Math.max(1,Math.min(460,availableWidth,availableHeight*9/16))}px`;
}
window.addEventListener('resize',resizeGame);window.visualViewport?.addEventListener('resize',resizeGame);window.visualViewport?.addEventListener('scroll',resizeGame);document.addEventListener('fullscreenchange',resizeGame);
window.render_game_to_text=()=>JSON.stringify({coordinateSystem:'288×512 viewport, x right/y down; world coordinates; player x center/y feet; camera world left',phase:state.phase,phaseTime:+state.phaseTime.toFixed(2),time:+state.time.toFixed(2),elapsed:+state.elapsed.toFixed(2),player:{...state.player,x:+state.player.x.toFixed(2),y:+state.player.y.toFixed(2)},hp:state.hp,maxHp:state.maxHp,inventory:[...state.inventory],savingsCollected:state.savingsCollected,savingsBook:level.savingsBook,ads:level.ads.map((ad,i)=>({...ad,loaded:!!(assets.ads[i]?.complete&&assets.ads[i]?.naturalWidth),naturalWidth:assets.ads[i]?.naturalWidth||0,naturalHeight:assets.ads[i]?.naturalHeight||0,src:assets.ads[i]?.src||''})),checkpoint:state.checkpoint,camera:+state.camera.toFixed(2),hitCount:state.hitCount,lastHit:state.lastHit,deaths:state.deaths,gameovers:state.gameovers,inputs:{left:held('left'),right:held('right'),jump:held('jump'),pointers:pointers.size},jumpBuffer:state.jumpBuffer,coyote:state.coyote,products:level.products.map(p=>({...p,collected:state.inventory.includes(p.id)})),platforms:level.platforms,gaps:level.gaps,finishX:level.finishX,socks:state.socks.map(s=>({x:+s.x.toFixed(1),y:s.y,dir:s.dir,left:s.left,right:s.right})),ties:state.ties,calendars:state.calendars,calendarPages:state.calendarPages,calendarShots:state.calendarShots,underwear:state.underwear,lines:state.lines,physics,capture:captured,muted,winLocked:state.inventory.length!==2,toast:state.toast?.text||null});
window.advanceTime=ms=>{
  const steps=Math.max(1,Math.ceil(Math.max(0,ms)/(1000/120)));
  for(let i=0;i<steps;i++)update(Math.max(0,ms)/1000/steps);
  syncUI();render();
};
reset();resizeGame();
let previous=performance.now();
function frame(now){
  const delta=Math.min((now-previous)/1000,.05);previous=now;
  if(!document.hidden){accumulator+=delta;while(accumulator>=1/120){update(1/120);accumulator-=1/120;}syncUI();render();}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
