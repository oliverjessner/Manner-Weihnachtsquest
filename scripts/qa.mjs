import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { level } from '../level.js';

let playwright;
try { playwright = await import('playwright'); }
catch {
  const fallback = process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs');
  playwright = await import(pathToFileURL(fallback).href);
}
const base = process.env.QA_URL || 'http://127.0.0.1:4186';
const out = path.resolve('output/calendar-qa');
const onlyLinks=process.env.QA_ONLY_LINKS==='1';
const onlyCalendar=process.env.QA_ONLY_CALENDAR==='1';
await fs.mkdir(out, {recursive:true});
const sources = JSON.parse(await fs.readFile(new URL('../assets/products/sources.json', import.meta.url)));
const report = {url:base,started:new Date().toISOString(),scenarios:[],errors:[],externalRequests:[],devices:{physical:[],emulated:['Chrome / Android profile, real CDP multi-touch, 390×844 and 390×650'],note:'Viewport resizing simulates browser toolbar space; no physical phones or actual mobile browser toolbar were available.'}};
let browser;
const read = async page => {
  const s=await page.evaluate(() => JSON.parse(window.render_game_to_text()));
  if(page.__calendarTrace)observeCalendar(s,page.__calendarTrace);
  return s;
};
function observeCalendar(s,trace){
  for(const calendar of s.calendars||[]){
    if(calendar.warning){
      const key=String(calendar.id)+':'+String(calendar.cycle??0)+':'+String(calendar.warningStartedAt??0);
      const warning=trace.warnings.get(key);
      if(warning)warning.last=s.time;
      else trace.warnings.set(key,{ownerId:calendar.id,cycle:calendar.cycle??0,warningStartedAt:calendar.warningStartedAt??0,first:s.time,last:s.time});
    }
  }
  for(const sheet of s.calendarPages||[]){
    if(sheet.active===false)continue;
    const id=String(sheet.id),prior=trace.pages.get(id);
    if(prior){prior.last={x:sheet.x,y:sheet.y,time:s.time};}
    else {
      const calendar=(s.calendars||[]).find(c=>c.id===sheet.ownerId);
      trace.pages.set(id,{id,ownerId:sheet.ownerId,cycle:sheet.cycle??calendar?.cycle??0,attackKey:String(sheet.ownerId)+':'+String(sheet.cycle??calendar?.cycle??0)+':'+String(calendar?.warningStartedAt??0),first:{x:sheet.x,y:sheet.y,time:s.time},last:{x:sheet.x,y:sheet.y,time:s.time},month:sheet.month});
    }
  }
  const previous=trace.previous;
  if(previous&&s.hitCount>previous.hitCount&&s.lastHit?.kind==='calendar'){
    trace.hits.push({time:s.time,beforeHp:previous.hp,hp:s.hp,invulnerable:s.player.invulnerable,inventory:[...s.inventory],beforeInventory:[...previous.inventory],phase:s.phase});
  }
  trace.previous={hp:s.hp,hitCount:s.hitCount,inventory:[...s.inventory]};
}

const advance = (page, ms) => page.evaluate(ms => window.advanceTime(ms), ms);
const phase = async (page, expected) => {const s=await read(page);assert.equal(s.phase,expected,JSON.stringify(s));return s;};
const shot = (page,name) => page.locator('#game').screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
const capturedAds=new Set();
const expectedAds=[
  {file:'fairtrade-kakao.png',width:747,height:436},
  {file:'roestung-wien.png',width:855,height:401},
  {file:'ohne-gehaertete-fette.png',width:772,height:414},
  {file:'ohne-zusatzstoffe.png',width:973,height:396},
];

async function fullscreenStart(page,name){
  await geometry(page,['#start-screen','#start-button']);
  const result=await page.evaluate(()=>{
    const game=document.querySelector('#game'),screen=document.querySelector('#start-screen'),hud=document.querySelector('.hud');
    const rect=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const g=game.getBoundingClientRect(),samples=[[.05,.05],[.5,.07],[.95,.95],[.5,.5]].map(([x,y])=>{
      const node=document.elementFromPoint(g.x+g.width*x,g.y+g.height*y);
      return {x,y,covered:node===screen||screen.contains(node),tag:node?.tagName};
    });
    return {frame:rect(game),screen:rect(screen),hud:rect(hud),samples,title:screen.querySelector('h1')?.textContent?.trim()||'',hudTitles:[...hud.querySelectorAll('h1')].filter(n=>n.getClientRects().length).map(n=>n.textContent.trim())};
  });
  for(const key of ['x','y','width','height'])assert.ok(Math.abs(result.screen[key]-result.frame[key])<1.1,'Start fills the entire 9:16 frame: '+JSON.stringify(result));
  assert.ok(result.samples.every(sample=>sample.covered),'Start layer covers the game HUD and world: '+JSON.stringify(result.samples));
  assert.match(result.title,/Rette Weihnachten/i,'Fullscreen start contains the accessible game title');
  assert.deepEqual(result.hudTitles,[],'No repeated title row in gameplay HUD');
  const copy=await page.locator('#start-screen').innerText();
  assert.doesNotMatch(copy,/Bescherung braucht dich|3 HERZEN|2 PACKUNGEN|1 MISSION|Leertaste|zwei Daumen|Privater Kampagnenprototyp/i,'Removed start-screen captions stay removed');
  await shot(page,name);return result;
}

async function compactHUD(page){
  const result=await page.locator('.hud').evaluate(hud=>{
    const game=document.querySelector('#game').getBoundingClientRect(),r=hud.getBoundingClientRect();
    return {bottom:(r.bottom-game.top)/game.height*512,titleRows:[...hud.querySelectorAll('h1')].filter(n=>n.getClientRects().length).map(n=>n.textContent.trim()),hearts:document.querySelector('#health').getAttribute('aria-label')};
  });
  assert.deepEqual(result.titleRows,[],'The rettet Weihnachten title row is removed from gameplay');
  assert.ok(result.bottom<130,'Compact HUD leaves more vertical world space: '+JSON.stringify(result));
  return result;
}

async function advertisingAssets(page){
  await page.waitForFunction(()=>{const s=JSON.parse(window.render_game_to_text());return Array.isArray(s.ads)&&s.ads.length===4&&s.ads.every(ad=>ad.loaded&&ad.naturalWidth>0&&ad.naturalHeight>0);},null,{timeout:5000});
  const ads=(await read(page)).ads;
  for(let i=0;i<expectedAds.length;i++){
    const expected=expectedAds[i],ad=ads[i];
    assert.ok(ad.loaded,'Advertisement image has loaded');
    assert.equal(ad.naturalWidth,expected.width);assert.equal(ad.naturalHeight,expected.height);
    const url=new URL(ad.src,base);assert.equal(url.origin,new URL(base).origin,'Advertisement stays local');
    assert.ok(url.pathname.endsWith('/assets/ads/'+expected.file),'Exact supplied advertising image: '+url.pathname);
    assert.ok(Math.abs(ad.w/ad.h-ad.naturalWidth/ad.naturalHeight)<.035,'Advertisement keeps its complete original proportions: '+JSON.stringify(ad));
  }
  return ads;
}

async function adScreenshot(page,state){
  if(!page.__qaCaptureAds||state.phase!=='playing')return;
  for(let i=0;i<(state.ads||[]).length;i++){
    const ad=state.ads[i],key=ad.id||String(i);
    if(!capturedAds.has(key)&&ad.x-state.camera>=3&&ad.x+ad.w-state.camera<=285){
      const toastGeometry=await page.evaluate(ads=>{
        const game=document.querySelector('#game').getBoundingClientRect(),toast=document.querySelector('#pickup-toast');
        if(toast.hidden||!toast.getClientRects().length)return null;
        const t=toast.getBoundingClientRect(),controls=document.querySelector('#touch-controls').getBoundingClientRect();
        return {top:t.top,bottom:t.bottom,left:t.left,right:t.right,controlsTop:controls.top,frame:{left:game.left,right:game.right},lowestAdvertisement:game.top+Math.max(...ads.map(a=>a.y+a.h))/512*game.height};
      },state.ads);
      if(toastGeometry){
        assert.ok(toastGeometry.top>=toastGeometry.lowestAdvertisement-1,'Pickup/hit toast remains below every advertising panel: '+JSON.stringify(toastGeometry));
        assert.ok(toastGeometry.bottom<=toastGeometry.controlsTop-2,'Toast leaves the touch control row free: '+JSON.stringify(toastGeometry));
        assert.ok(toastGeometry.left>=toastGeometry.frame.left&&toastGeometry.right<=toastGeometry.frame.right,'Toast remains within portrait frame');
      }
      await shot(page,'advertisement-'+String(i+1)+'-'+key);capturedAds.add(key);
      report.advertisingViews??=[];report.advertisingViews.push({id:key,camera:state.camera,playerX:state.player.x,ad,toastGeometry});
    }
  }
}

async function createPage({mobile=false,capture=false,engine=browser,profile='Pixel 7'}={}){
  const context=await engine.newContext({...mobile?playwright.devices[profile]:{},viewport:mobile?{width:390,height:844}:{width:1280,height:960},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('request',r=>{const u=new URL(r.url());if(u.protocol.startsWith('http')&&u.origin!==new URL(base).origin)report.externalRequests.push(r.url());});
  await page.goto(base+'/'+(capture?'?capture=1':''));
  await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
  const initial=await phase(page,'start');assert.equal(initial.hp,3);assert.deepEqual(initial.inventory,[]);assert.equal(initial.muted,false);
  assert.equal(await page.locator('#start-button').isVisible(),true);
  await advertisingAssets(page);
  return {context,page};
}
async function start(page,touch=false){
  if(touch)await page.locator('#start-button').tap();else await page.keyboard.press('Enter');
  const s=await phase(page,'playing');assert.equal(s.hp,3);await compactHUD(page);return s;
}
class Input{
  constructor(page,touch=false){this.page=page;this.touch=touch;this.direction=0;this.points=[];this.session=null;}
  async initialize(){if(this.touch)this.session=await this.page.context().newCDPSession(this.page);return this;}
  async point(selector,id){const b=await this.page.locator(selector).boundingBox();assert.ok(b,selector+' is visible');return {x:b.x+b.width/2,y:b.y+b.height/2,id};}
  async run(direction=1){
    if(direction===this.direction)return;
    if(this.touch){
      if(this.points.length)await this.session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      this.points=direction?[await this.point(direction>0?'#right':'#left',1)]:[];
      if(this.points.length)await this.session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:this.points});
    }else{
      if(this.direction)await this.page.keyboard.up(this.direction>0?'ArrowRight':'ArrowLeft');
      if(direction)await this.page.keyboard.down(direction>0?'ArrowRight':'ArrowLeft');
    }
    this.direction=direction;
  }
  async jump(){
    if(this.touch){const point=await this.point('#jump',2);await this.session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...this.points,point]});await advance(this.page,18);await this.session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point]});}
    else {await this.page.keyboard.down('Space');await advance(this.page,18);await this.page.keyboard.up('Space');}
  }
  async stop(){await this.run(0);}
  async cancel(){if(this.touch){await this.session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});this.points=[];this.direction=0;}}
  async close(){await this.stop();await this.session?.detach();}
}
async function geometry(page,selectors=['#left','#right','#jump']){
  await page.waitForFunction(()=>{const r=document.querySelector('#game').getBoundingClientRect();return r.bottom<=(visualViewport?.height||innerHeight)+1&&r.right<=(visualViewport?.width||innerWidth)+1;},{},{timeout:1500});
  const g=await page.evaluate(selectors=>{
    const box=selector=>{const b=document.querySelector(selector).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
    return {viewport:{width:visualViewport?.width||innerWidth,height:visualViewport?.height||innerHeight},frame:box('#game'),elements:selectors.map(selector=>({selector,...box(selector)})),scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,innerWidth,innerHeight};
  },selectors);
  assert.ok(Math.abs(g.frame.width/g.frame.height-9/16)<.005,'Proportional 9:16 frame');
  assert.ok(g.scrollWidth<=g.innerWidth+1&&g.scrollHeight<=g.innerHeight+1,'No page scrolling');
  for(const r of [g.frame,...g.elements])assert.ok(r.width>0&&r.height>0&&r.x>=-1&&r.y>=-1&&r.right<=g.viewport.width+1&&r.bottom<=g.viewport.height+1,'Element fits visible browser: '+JSON.stringify(r));
  return g;
}
function shouldJump(s,direction=1){
  const p=s.player;if(!p.grounded)return false;
  if(level.gaps.some(g=>{const distance=direction>0?g.x-p.x:p.x-g.x-g.w;return distance>0&&distance<24;}))return true;
  if(level.platforms.some(o=>{const distance=direction>0?o.x-p.x:p.x-o.x-o.w;return o.kind!=='sill'&&distance>4&&distance<34&&p.y>o.y+3;}))return true;
  if(level.gaps.some(g=>{const distance=direction>0?g.x-p.x:p.x-g.x-g.w;return distance>0&&distance<95;}))return false;
  // Stay on the actual gift pedestal long enough to touch its package. A
  // reflex jump over a tie here can also jump over the pickup itself.
  if(s.products.some(product=>!product.collected&&Math.abs(product.x-p.x)<90&&Math.abs(p.y-(product.y+21))<8))return false;
  return [...s.socks||[],...s.ties||[]].some(enemy=>{
    const closing=82-(enemy.dir||1)*direction*(enemy.speed||23),distance=(enemy.x-p.x)*direction;
    return distance>8&&distance<closing*.45+13&&Math.abs(enemy.y-p.y)<40;
  });
}

async function retry(page,input,touch=false){
  await input.stop();
  if(touch)await page.locator('#retry').tap();else await page.locator('#retry').click();
  assert.equal((await read(page)).hp,3);await phase(page,'playing');
}
async function drive(page,input,{until=s=>s.phase==='ending',jump=true,maxMs=100000,direction=1,allowRetry=true,collectMissing=true}={}){
  await input.run(direction);let elapsed=0,previousX=-Infinity,stationary=0,retries=0,recovery=null;
  while(elapsed<maxMs){
    const s=await read(page);
    await adScreenshot(page,s);
    if(until(s)||s.phase==='ending'){await input.stop();return s;}
    if(s.phase==='gameover'){
      await input.stop();if(!allowRetry)return s;
      assert.ok(++retries<8,'Route must be finishable without repeated gameovers');await retry(page,input,input.touch);await input.run(direction);continue;
    }
    if(collectMissing&&direction===1&&!recovery)recovery=s.products.find(product=>!product.collected&&s.player.x>product.x+80)||null;
    if(recovery&&s.inventory.includes(recovery.id))recovery=null;
    const navigationDirection=recovery?(recovery.x>s.player.x?1:-1):direction;
    await input.run(navigationDirection);
    if(jump&&shouldJump(s,navigationDirection))await input.jump();
    await advance(page,32);elapsed+=32;const after=await read(page);
    stationary=Math.abs(after.player.x-previousX)<.1?stationary+32:0;previousX=after.player.x;
    if(stationary>550&&after.player.grounded&&jump){await input.jump();stationary=0;}
  }
  await input.stop();assert.fail('Navigation timeout: '+JSON.stringify(await read(page)));
}
async function win(page,name,{touch=false,capture=false}={}){
  const s=await phase(page,'ending');assert.deepEqual([...s.inventory].sort(),['18er','8er']);
  assert.match(await page.locator('#game').innerText(),/Weihnachten gerettet/);
  for(const variant of ['eight','eighteen']){
    const link=page.locator('#product-link-'+variant);
    assert.equal(await link.isVisible(),true);assert.equal(await link.getAttribute('href'),sources[variant].pageUrl);
    const img=page.locator('#win-'+variant+'-image');await img.evaluate(i=>i.decode());assert.ok(await img.evaluate(i=>i.naturalWidth>0));
    assert.match(await img.getAttribute('src'),new RegExp(variant+'-packshot'));
    const bounds=await img.evaluate((image,variant)=>{
      const source=variant==='eight'?{l:168,t:196,r:837,b:804}:{l:166,t:175,r:837,b:814};
      const r=image.getBoundingClientRect(),clip=image.parentElement.getBoundingClientRect();
      const scale=Math.min(r.width/image.naturalWidth,r.height/image.naturalHeight),x=r.left+(r.width-image.naturalWidth*scale)/2,y=r.top+(r.height-image.naturalHeight*scale)/2;
      return {l:x+source.l*scale,t:y+source.t*scale,r:x+source.r*scale,b:y+source.b*scale,clip:{l:clip.left,t:clip.top,r:clip.right,b:clip.bottom}};
    },variant);
    assert.ok(bounds.l>=bounds.clip.l-1&&bounds.t>=bounds.clip.t-1&&bounds.r<=bounds.clip.r+1&&bounds.b<=bounds.clip.b+1,'Complete packshot front fits its image clip: '+JSON.stringify(bounds));
    // Exercise native keyboard activation while intercepting only navigation.
    // No game state is changed, and no outbound product request is made.
    await link.evaluate(anchor=>anchor.addEventListener('click',event=>{event.preventDefault();window.__qaActivatedHref=anchor.href;},{once:true,capture:true}));
    await page.evaluate(()=>{window.__qaActivatedHref=null;});await link.focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>window.__qaActivatedHref),sources[variant].pageUrl);await phase(page,'ending');

  }
  const selectors=['#product-link-eight','#product-link-eighteen','#restart'];
  if(touch){for(const height of [650,844]){await page.setViewportSize({width:390,height});await geometry(page,selectors);await shot(page,name+'-'+height+'-win');}}
  else {await geometry(page,selectors);await shot(page,name+'-win');}
  if(capture){await advance(page,30000);await phase(page,'ending');}
  if(touch)await page.locator('#restart').tap();else {await page.locator('#restart').focus();await page.keyboard.press('Enter');}
  const reset=await phase(page,'start');assert.equal(reset.hp,3);assert.deepEqual(reset.inventory,[]);assert.equal(reset.checkpoint.active,false);assert.equal(reset.savingsCollected,false);assert.equal(reset.calendarShots,0,'Restart resets the calendar attack counter');assert.deepEqual(reset.calendarPages,[],'Restart clears loose calendar sheets');
  await shot(page,name+'-restart');
}


async function calendarScenario(){
  const {page,context}=await createPage();
  const trace={warnings:new Map(),pages:new Map(),hits:[],previous:null};
  page.__calendarTrace=trace;
  await start(page);const input=await new Input(page).initialize();
  assert.ok(Array.isArray((await read(page)).calendars)&&level.calendars?.length,'Wall calendar is part of the normal level');
  await drive(page,input,{until:s=>s.inventory.includes('8er')});
  await drive(page,input,{until:s=>s.player.x>=640});
  await input.run(1);await input.jump();
  for(let i=0;i<120;i++){
    await advance(page,12);const s=await read(page);
    if(s.phase==='gameover'||s.player.x>=690)break;
  }
  await input.stop();
  for(let i=0;i<110;i++){await advance(page,15);const s=await read(page);if(s.phase==='gameover'||s.player.grounded)break;}
  // Hold position in view of the launcher. The first calendar attack is already
  // observed during the normal approach; no enemy or player state is assigned.
  let hit;
  for(let i=0;i<900;i++){
    const s=await read(page);
    hit=trace.hits.find(h=>h.inventory.includes('8er'));
    if(hit)break;
    if(s.phase==='gameover'){await retry(page,input);await drive(page,input,{until:state=>state.player.x>=690});await input.stop();}
    await advance(page,20);
  }
  assert.ok(hit,'A loose calendar page hits the player after the 8er pickup');
  assert.equal(hit.hp,hit.beforeHp-1,'Calendar contact costs exactly one heart');
  assert.ok(hit.invulnerable>0,'Calendar hit grants the normal invulnerability');
  assert.deepEqual(hit.inventory,hit.beforeInventory,'A calendar hit retains collected products');
  const afterHit=await read(page);await advance(page,180);const protectedState=await read(page);
  assert.equal(protectedState.hp,afterHit.hp,'Immediate sheets cannot drain multiple hearts');
  assert.equal(protectedState.hitCount,afterHit.hitCount,'Invulnerability blocks the next immediate hit');
  await shot(page,'calendar-page-hit');
  // Let one complete salvo become visible even if the hit occurred near its
  // beginning. Real input is stopped; the attack itself advances normally.
  for(let i=0;i<700;i++){
    const s=await read(page);
    const burstGroups=new Map();
    for(const sheet of trace.pages.values()){
      const key=sheet.attackKey;
      if(!burstGroups.has(key))burstGroups.set(key,[]);
      burstGroups.get(key).push(sheet);
    }
    const burst=[...burstGroups.values()].find(group=>group.length>=3);
    if(burst)break;
    if(s.phase==='gameover'){await retry(page,input);await drive(page,input,{until:state=>state.player.x>=690});await input.stop();}
    await advance(page,20);
  }
  const groups=new Map();for(const sheet of trace.pages.values()){
    const key=sheet.attackKey;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(sheet);
  }
  const burst=[...groups.values()].find(group=>group.length>=3);
  assert.ok(burst,'The calendar releases three distinct loose month sheets');
  const first=burst.reduce((a,b)=>a.first.time<b.first.time?a:b);
  const warning=trace.warnings.get(first.attackKey);
  assert.ok(warning&&first.first.time-warning.first>=.6,'The calendar visibly warns long enough before launching sheets');
  assert.equal(burst.length,3,'One attack releases exactly three month sheets');
  assert.ok(Math.max(...burst.map(sheet=>sheet.first.time))-Math.min(...burst.map(sheet=>sheet.first.time))>=.3,'Sheets leave in a readable staggered salvo');
  assert.ok(burst.some(sheet=>Math.hypot(sheet.last.x-sheet.first.x,sheet.last.y-sheet.first.y)>6),'Loose sheets fly across the world');
  assert.ok(burst.every(sheet=>Number.isFinite(Number(sheet.month))||typeof sheet.month==='string'),'Every sheet identifies its month');
  await shot(page,'calendar-open-salvo');
  // Repeated deliberate contact eventually reaches gameover. All enemy
  // projectiles must then pause alongside the player until a manual retry.
  for(let i=0;i<1400;i++){
    const s=await read(page);if(s.phase==='gameover')break;
    await advance(page,25);
  }
  const over=await phase(page,'gameover');
  const frozen=over.calendarPages;await advance(page,1200);
  assert.deepEqual((await read(page)).calendarPages,frozen,'Calendar sheets pause during gameover');
  await retry(page,input);const resumed=await read(page);
  assert.deepEqual(resumed.calendarPages,[],'Checkpoint retry clears old calendar projectiles');
  assert.ok(resumed.inventory.includes('8er'),'Calendar gameover/retry retains the 8er');
  report.scenarios.push({name:'wall calendar warning salvo damage pause cleanup',passed:true,checks:['approach using normal input','warning before launch','three loose month sheets','moving projectiles','one HP per hit','invulnerability','inventory retained','gameover freezes sheets','manual retry clears sheets'],warnings:[...trace.warnings.values()],sampleBurst:burst,hits:trace.hits});
  await input.close();await context.close();
}

try{
  browser=await playwright.chromium.launch({headless:process.env.HEADED!=='1',...(process.env.QA_BROWSER_CHANNEL?{channel:process.env.QA_BROWSER_CHANNEL}:{})});
  if(onlyCalendar){
    await calendarScenario();
  }else if(onlyLinks){
    const {page,context}=await createPage();await start(page);const input=await new Input(page).initialize();await drive(page,input);await win(page,'link-keyboard');await input.close();await context.close();report.scenarios.push({name:'native Enter activation of both official win links',passed:true,checks:['link focus + actual Enter key','one-shot click observer intercepts only navigation','exact official href','no outbound request']});
  }else{
  // Always first: one thumb keeps running while the other jumps and releases.
  {
    const {page,context}=await createPage({mobile:true});
    const startTall=await fullscreenStart(page,'start-fullscreen-844');
    await page.setViewportSize({width:390,height:650});const startShort=await fullscreenStart(page,'start-fullscreen-650');
    await page.setViewportSize({width:390,height:844});await fullscreenStart(page,'start-screen');
    const before=await read(page);await advance(page,5000);const idle=await read(page);assert.equal(idle.elapsed,before.elapsed);assert.deepEqual(idle.player,before.player,'Start screen pauses gameplay');
    await start(page,true);const input=await new Input(page,true).initialize();
    const initial=await read(page);await input.run(1);await advance(page,100);await input.jump();await advance(page,150);
    const air=await read(page);assert.ok(air.player.x>initial.player.x+10);assert.equal(air.player.grounded,false);assert.ok(air.player.y<initial.player.y-10);
    await advance(page,800);const landed=await read(page);assert.equal(landed.player.grounded,true);await advance(page,120);assert.ok((await read(page)).player.x>landed.player.x+4,'Running thumb survives jump release');
    await input.cancel();await advance(page,800);const cancelled=await read(page);assert.equal(cancelled.inputs.pointers,0);assert.equal(cancelled.inputs.right,false);await advance(page,300);assert.ok(Math.abs((await read(page)).player.x-cancelled.player.x)<.2);
    await input.run(-1);await advance(page,100);await page.evaluate(()=>dispatchEvent(new Event('blur')));await advance(page,300);assert.equal((await read(page)).inputs.left,false);await input.cancel();
    const tall=await geometry(page);await shot(page,'touch-simultaneous');await page.setViewportSize({width:390,height:650});const short=await geometry(page);await shot(page,'touch-short-viewport');
    report.scenarios.push({name:'FIRST fullscreen start + simultaneous touch + compact HUD',passed:true,startTall,startShort,tall,short});await input.close();await context.close();
  }
  {
    const {page,context}=await createPage();await fullscreenStart(page,'start-fullscreen-desktop');await start(page);const input=await new Input(page).initialize();
    let previous=await read(page);await input.run(1);let first;
    for(let i=0;i<700;i++){await advance(page,30);const s=await read(page);if(s.hitCount>previous.hitCount){first=s;break;}}
    assert.ok(first,'Ground socks cause a hit');assert.equal(first.hp,2);assert.ok(first.player.invulnerable>0);const hits=first.hitCount;await advance(page,180);assert.equal((await read(page)).hp,2);assert.equal((await read(page)).hitCount,hits);
    while((await read(page)).phase==='playing'){
      const s=await read(page);if(s.player.x>340)await input.run(-1);else if(s.player.x<190)await input.run(1);
      await advance(page,80);if((await read(page)).elapsed>35)assert.fail('Expected three collisions to reach gameover');
    }
    const over=await phase(page,'gameover');assert.equal(over.hp,0);assert.equal(over.hitCount,3);await shot(page,'three-hp-gameover');await advance(page,2000);assert.deepEqual((await read(page)).player,over.player,'Gameover freezes the player');
    await retry(page,input);await shot(page,'retry-three-hp');
    report.scenarios.push({name:'three HP protection gameover retry',passed:true});await input.close();await context.close();
  }
  {
    const {page,context}=await createPage();await start(page);const input=await new Input(page).initialize();
    await drive(page,input,{until:s=>s.player.x>=307});await input.stop();await advance(page,900);
    await input.run(1);await input.jump();let lowSill;
    for(let i=0;i<100;i++){await advance(page,12);const s=await read(page);if(s.player.grounded&&Math.abs(s.player.y-321)<1&&s.player.x>=342){lowSill=s;break;}}
    await input.stop();assert.ok(lowSill,'Jump lands on first visible window sill');await shot(page,'landed-window-sill');
    await drive(page,input,{until:s=>s.player.x>=394,jump:false,maxMs:3000});await input.run(1);await input.jump();let highSill;
    for(let i=0;i<100;i++){await advance(page,12);const s=await read(page);if(s.player.grounded&&Math.abs(s.player.y-278)<1&&s.player.x>=440){highSill=s;break;}}
    await input.stop();assert.ok(highSill,'Second window sill is reachable from the first');await shot(page,'landed-upper-window-sill');
    await drive(page,input,{until:s=>s.inventory.includes('8er')});
    await drive(page,input,{until:s=>s.player.x>=795});
    let book;await input.run(1);previous: for(let i=0;i<300;i++){
      const before=await read(page);if(shouldJump(before))await input.jump();await advance(page,18);const after=await read(page);
      if(after.savingsCollected&&!before.savingsCollected){assert.equal(after.hp,before.hp,'Savings book causes no damage');assert.match(after.toast||'',/\+0,01 € Zinsen/);book=after;break previous;}
    }
    await input.stop();assert.ok(book,'Savings book is collectable on its pedestal');await shot(page,'savings-book-zero-damage');
    await drive(page,input,{until:s=>s.checkpoint.active});let inventory=await read(page);assert.ok(inventory.inventory.includes('8er'));
    while((await read(page)).phase==='playing'){
      await drive(page,input,{until:s=>s.player.x>=1555,allowRetry:false});if((await read(page)).phase!=='playing')break;
      await input.run(1);const deaths=(await read(page)).deaths;
      for(let i=0;i<120;i++){await advance(page,30);const s=await read(page);if(s.deaths>deaths||s.phase==='gameover')break;}
      await input.stop();
    }
    const over=await phase(page,'gameover');assert.ok(over.inventory.includes('8er'));assert.ok(over.checkpoint.active);await retry(page,input);const recovered=await read(page);assert.ok(recovered.inventory.includes('8er'));assert.ok(Math.abs(recovered.player.x-level.checkpointX)<2);
    await drive(page,input);await win(page,'keyboard');
    report.scenarios.push({name:'window ledges savings checkpoint full win',passed:true,checks:['two actual sill landings','book +0,01 euro without HP loss','three HP gameover after falls','checkpoint retry retains 8er','both products direct win','product source links','restart to start']});await input.close();await context.close();
  }
  {
    const {page,context}=await createPage();await start(page);const input=await new Input(page).initialize();
    await drive(page,input,{until:s=>s.player.x>=407});await input.stop();await advance(page,900);const baseline=await read(page);await input.run(1);let tieHit;
    for(let i=0;i<150;i++){await advance(page,25);const s=await read(page);if(s.hitCount>baseline.hitCount){tieHit=s;break;}}
    await input.stop();assert.ok(tieHit,'Walking into a tie causes damage');assert.equal(tieHit.hp,baseline.hp-1);assert.ok(tieHit.player.x>390,'Tie collision is isolated beyond socks');assert.equal(tieHit.lastHit?.kind,'tie');await shot(page,'tie-enemy-hit');
    report.scenarios.push({name:'tie collision',passed:true});await input.close();await context.close();
  }
  {
    const {page,context}=await createPage();await start(page);const input=await new Input(page).initialize();
    // Use the upper window route to preserve health before the checkpoint.
    await drive(page,input,{until:s=>s.player.x>=307});await input.stop();await advance(page,900);
    await input.run(1);await input.jump();let lower=false;
    for(let i=0;i<110;i++){await advance(page,12);const s=await read(page);if(s.player.grounded&&Math.abs(s.player.y-321)<1&&s.player.x>=342){lower=true;break;}}
    await input.stop();assert.ok(lower);
    await drive(page,input,{until:s=>s.player.x>=394,jump:false,maxMs:3000});await input.run(1);await input.jump();let upper=false;
    for(let i=0;i<110;i++){await advance(page,12);const s=await read(page);if(s.player.grounded&&Math.abs(s.player.y-278)<1&&s.player.x>=440){upper=true;break;}}
    await input.stop();assert.ok(upper);await drive(page,input,{until:s=>s.player.x>=498,jump:false,maxMs:3000});
    await input.run(1);await input.jump();
    for(let i=0;i<100;i++){await advance(page,10);if((await read(page)).player.x>=565)break;}
    await input.stop();await advance(page,1200);const pedestal=await read(page);assert.ok(pedestal.player.grounded&&Math.abs(pedestal.player.y-337)<1,'Controlled landing before8er');
    await drive(page,input,{until:s=>s.player.x>=572,jump:false,maxMs:4000});assert.equal((await read(page)).inventory.includes('8er'),false);
    await input.run(1);await input.jump();await advance(page,840);await input.stop();assert.equal((await read(page)).inventory.includes('8er'),false,'A high jump can deliberately skip 8er');
    await drive(page,input,{until:s=>s.checkpoint.active,allowRetry:false,collectMissing:false});assert.equal((await read(page)).phase,'playing','Upper route reaches checkpoint without gameover');
    await drive(page,input,{until:s=>s.player.x>=level.finishX+2,collectMissing:false});
    const locked=await phase(page,'playing');assert.deepEqual(locked.inventory,['18er']);assert.equal(locked.winLocked,true);assert.equal(await page.locator('#product-link-eight').isVisible(),false);
    await page.keyboard.press('Enter');await advance(page,200);await phase(page,'playing');await shot(page,'finish-locked-with-only-18er');
    report.scenarios.push({name:'win requires both products',passed:true});await input.close();await context.close();
  }
  await calendarScenario();
  {
    const {page,context}=await createPage({mobile:true,capture:true});await fullscreenStart(page,'capture-start-fullscreen');await start(page,true);page.__qaCaptureAds=true;const input=await new Input(page,true).initialize();
    assert.equal((await read(page)).capture,true);for(const selector of ['#left','#right','#jump'])assert.equal(await page.locator(selector).isVisible(),true);
    const hints=await page.locator('[data-capture-hide]').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>n.textContent.trim()));assert.deepEqual(hints,[]);
    await drive(page,input);assert.equal(capturedAds.size,4,'Every supplied advertisement is fully visible during normal traversal');await win(page,'touch-capture',{touch:true,capture:true});
    report.scenarios.push({name:'complete portrait touch capture + four advertisement views + product links + restart',passed:true});await input.close();await context.close();
  }
  if(process.env.QA_WEBKIT_EXECUTABLE||process.env.QA_WEBKIT_MODULE){
    const module=process.env.QA_WEBKIT_MODULE?await import(pathToFileURL(process.env.QA_WEBKIT_MODULE).href):playwright;
    const webkit=await module.webkit.launch({headless:true,...process.env.QA_WEBKIT_EXECUTABLE?{executablePath:process.env.QA_WEBKIT_EXECUTABLE}:{},timeout:10000});
    try{const {page,context}=await createPage({mobile:true,capture:true,engine:webkit,profile:'iPhone 13'});await start(page);const input=await new Input(page).initialize();await drive(page,input);await win(page,'webkit-ios',{capture:true});await input.close();await context.close();report.scenarios.push({name:'WebKit iPhone complete keyboard journey',passed:true});report.devices.emulated.push('WebKit / iPhone profile, full keyboard journey');}finally{await webkit.close();}
  }
  }
  assert.deepEqual(report.errors,[],'No browser errors');assert.deepEqual(report.externalRequests,[],'Runtime assets stay local');report.passed=true;
}catch(error){
  report.passed=false;report.failure={message:error.message,stack:error.stack};
  const page=browser?.contexts().flatMap(c=>c.pages())[0];if(page){report.failure.state=await read(page).catch(()=>null);await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});}
  process.exitCode=1;
}finally{report.finished=new Date().toISOString();await fs.writeFile(path.join(out,onlyLinks?'link-keyboard.json':'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();console.log(JSON.stringify(report,null,2));}
