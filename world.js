// Original 16-bit scenery. One 288 × 512 canvas; all world coordinates are pixels.
const P = {
  sky:'#172b43', night:'#223c54', distant:'#2e4b61', ink:'#1c2d3e',
  snow:'#e5eff0', snowLight:'#fff8e5', snowShade:'#accbd7', pink:'#f3a8c3',
  gold:'#f7cc8b', cream:'#fff1cf', teal:'#509ba2', wood:'#79544c',
};
const r=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const poly=(c,color,points)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
const rnd=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const visible=(x,w=0)=>x+w>-40&&x<328;

function sprite(c,img,x,y,size,label=''){
  if(img?.complete&&img.naturalWidth){c.drawImage(img,Math.round(x),Math.round(y),size,size);return;}
  r(c,'#a85e7b',x,y,size,size);r(c,P.pink,x+1,y+1,size-2,size-2);r(c,'#ffe2e6',x+size*.45,y,2,size);
  if(label){c.font='6px Pixel,monospace';c.fillStyle='#593748';c.fillText(label,x+2,y+size-3);}
}
function star(c,x,y,color=P.gold){r(c,color,x,y-3,1,7);r(c,color,x-3,y,7,1);r(c,color,x-1,y-1,3,3);}
function pine(c,x,y,scale=1,festive=false){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  r(c,'#68525a',-3,-6,6,15);
  poly(c,'#244959',[[0,-80],[-15,-50],[-9,-50],[-23,-29],[-16,-29],[-30,-6],[29,-6],[15,-29],[22,-29],[9,-50],[15,-50]]);
  poly(c,'#3d6570',[[0,-76],[-10,-52],[-5,-49],[-18,-31],[-10,-28],[-23,-9],[20,-9],[11,-29],[17,-31],[5,-50],[9,-52]]);
  poly(c,P.snowShade,[[0,-80],[-12,-54],[-4,-57],[1,-53],[5,-58],[12,-54]]);
  poly(c,P.snow,[[0,-80],[-8,-60],[-1,-62],[2,-58],[7,-60]]);
  poly(c,P.snowShade,[[-10,-46],[-23,-29],[-15,-31],[-6,-28],[3,-34],[17,-30],[10,-40],[2,-37],[-3,-36]]);
  poly(c,P.snow,[[-10,-46],[-18,-34],[-11,-36],[-7,-32],[0,-38],[7,-35],[3,-40],[-3,-37]]);
  poly(c,P.snow,[[-16,-23],[-28,-9],[-14,-13],[-4,-9],[6,-15],[22,-10],[15,-20],[7,-19],[0,-16],[-8,-18]]);
  if(festive)[[-6,-48],[8,-34],[-13,-21],[12,-14],[-2,-18]].forEach(([a,b],i)=>r(c,i%2?P.gold:P.pink,a,b,2,3));
  c.restore();
}
function windowPane(c,x,y,w=34,h=52){
  r(c,'#34434e',x-5,y-5,w+10,h+10);r(c,'#bd8a73',x-3,y-3,w+6,h+6);
  r(c,'#dfac76',x,y,w,h);r(c,'#f7d494',x+3,y+3,w-6,h-6);r(c,'#ffedbb',x+6,y+3,w-12,h-13);
  r(c,'#ce9677',x,y,5,h);r(c,'#ce9677',x+w-5,y,5,h);
  r(c,'#855e53',x+w/2-2,y,4,h);r(c,'#855e53',x,y+h/2-2,w,4);
  r(c,'#f9ddb0',x+7,y+h-12,4,10);r(c,'#fff4ca',x+8,y+h-15,1,3);
  r(c,'#9c9994',x-7,y+h+2,w+14,5);r(c,P.snow,x-8,y+h,w+16,4);
}
function garland(c,x,y,w,time){
  for(let i=0;i<w;i+=11){const yy=y+Math.round(Math.sin(i/w*Math.PI)*5);r(c,'#33564d',x+i,yy,12,5);r(c,'#57765b',x+i+3,yy+1,6,2);if(i%22===0)r(c,i%44?P.pink:P.gold,x+i+5,yy+5,2,3);}
}
function lamp(c,x,ground,time){
  r(c,'#26384a',x-2,ground-91,4,91);r(c,'#587283',x-1,ground-86,1,80);
  r(c,'#26384a',x-8,ground-103,16,5);r(c,'#324959',x-6,ground-98,12,18);
  r(c,'#edbf7a',x-4,ground-96,8,13);r(c,'#ffeab2',x-2,ground-94,4,9);r(c,'#405367',x-1,ground-97,2,17);
  r(c,P.snow,x-8,ground-104,16,3);r(c,'#26384a',x-6,ground-80,12,3);r(c,'#91afbb',x-5,ground-1,10,2);
}
function house(c,x,ground,index){
  const width=202;
  const colors=[['#546c7b','#698390','#435d6f'],['#6b6476','#827b89','#595368'],['#626e79','#7e8e94','#4d6071']][index%3];
  const roof=ground-207,wall=roof+42;
  r(c,'#203448',x-5,wall-3,width+10,ground-wall+3);r(c,colors[0],x,wall,width,ground-wall-4);
  r(c,colors[1],x+5,wall+4,width-10,ground-wall-13);
  for(let yy=wall+16;yy<ground-10;yy+=16){r(c,colors[0],x+3,yy,width-6,2);for(let xx=x+12+(yy%32?17:0);xx<x+width;xx+=42)r(c,colors[0],xx,yy-14,1,14);}
  r(c,colors[2],x,wall,7,ground-wall);r(c,colors[2],x+width-7,wall,7,ground-wall);
  r(c,'#9ba8ac',x-3,ground-9,width+6,9);r(c,P.snowShade,x-3,ground-9,width+6,2);
  r(c,'#797381',x+width-48,roof-28,20,38);r(c,'#454e64',x+width-45,roof-24,3,22);r(c,P.snow,x+width-52,roof-30,28,5);
  poly(c,'#344c63',[[x-13,wall-1],[x+30,roof],[x+width-31,roof],[x+width+13,wall-1],[x+width+13,wall+7],[x-13,wall+7]]);
  poly(c,P.snowShade,[[x-15,wall-3],[x-10,wall-14],[x+1,wall-17],[x+1,wall-23],[x+14,wall-26],[x+14,wall-32],[x+30,roof-4],[x+width-31,roof-4],[x+width-18,wall-32],[x+width-18,wall-27],[x+width-4,wall-22],[x+width-4,wall-16],[x+width+9,wall-10],[x+width+16,wall+2],[x-15,wall+2]]);
  poly(c,P.snow,[[x-13,wall-8],[x+29,roof-5],[x+width-31,roof-5],[x+width+12,wall-6],[x+width+7,wall-2],[x+width-6,wall-6],[x+width-17,wall-2],[x+width-32,wall-6],[x+width-49,wall-2],[x+width-62,wall-6],[x+width-78,wall-2],[x+width-95,wall-6],[x+width-113,wall-2],[x+width-128,wall-6],[x+width-146,wall-2],[x+29,wall-6],[x+12,wall-2]]);
  // Near windows are drawn from real sill platforms below, never as false ledges.
  const doorX=x+width/2-15;
  r(c,'#3a4655',doorX-5,ground-86,40,80);r(c,'#b38a72',doorX-2,ground-84,34,78);r(c,'#6e5353',doorX+1,ground-81,28,75);
  r(c,'#493f49',doorX+5,ground-77,20,27);r(c,'#c5b188',doorX+7,ground-75,16,23);r(c,'#f9d28e',doorX+23,ground-41,2,3);
  r(c,'#48725f',doorX+9,ground-42,12,12);r(c,'#749269',doorX+7,ground-39,16,6);r(c,P.pink,doorX+13,ground-32,5,4);
  r(c,'#a4b6be',doorX-6,ground-5,42,5);r(c,P.snow,doorX-9,ground-7,48,3);
  garland(c,x+2,wall+8,width-4,0);

}
function background(c,s,level){
  r(c,P.sky,0,0,288,512);r(c,'#1c334b',0,124,288,145);r(c,'#28465d',0,269,288,105);
  for(let i=0;i<32;i++){let x=(rnd(i+2)*400-s.camera*.08)%330;if(x<0)x+=330;r(c,i%3?'#7893a8':'#b8c9d0',x,rnd(i+5)*145,1,1);}
  const moonX=244-(s.camera*.025)%65;r(c,'#dbe1d5',moonX,110,17,17);r(c,'#dbe1d5',moonX-2,114,21,9);r(c,'#1c334b',moonX+6,107,13,14);
  const offset=(s.camera*.23)%109;
  for(let i=-1;i<5;i++){
    const x=i*109-offset,y=226-(i%3)*13;
    r(c,'#2c455b',x,y,98,155);poly(c,'#2c455b',[[x-7,y],[x+48,y-36],[x+105,y]]);
    for(let xx=12;xx<90;xx+=25)for(let yy=15;yy<116;yy+=31)r(c,(i+xx+yy)%3===0?'#8c897d':'#39586c',x+xx,y+yy,8,13);
    r(c,'#425f71',x-5,y,108,2);
  }
}
function billboard(c,ad,img,camera,ground){
  const x=ad.x-camera,y=ad.y??120,boxWidth=ad.w??190,boxHeight=ad.h??104;
  if(!visible(x,boxWidth))return;
  // The supplied campaign artwork stays front-facing and fully contained.
  // Only the frame and snowy mounting hardware are authored pixel scenery.
  const loaded=img?.complete&&img.naturalWidth>0;
  const ratio=loaded?img.naturalWidth/img.naturalHeight:boxWidth/boxHeight;
  const width=Math.min(boxWidth,boxHeight*ratio),height=width/ratio;
  const left=Math.round(x+(boxWidth-width)/2),top=Math.round(y+(boxHeight-height)/2);
  const mountBottom=Math.max(top+height+17,ground-112);
  [left+13,left+width-17].forEach(xx=>{
    r(c,'#25394b',xx,top+height,5,mountBottom-top-height);
    r(c,'#667b87',xx+1,top+height+2,1,mountBottom-top-height-2);
    r(c,'#263c4d',xx-3,mountBottom,11,3);
  });
  r(c,'#10263a80',left+1,top+1,width+4,height+4);
  r(c,'#263c50',left-2,top-2,width+4,height+4);
  r(c,'#a98076',left-1,top-1,width+2,height+2);
  r(c,'#f59786',left,top,width,height);
  if(loaded)c.drawImage(img,left,top,width,height);
  // A cap outside the image protects the full copy from snow or cropping.
  r(c,'#bed2d9',left-3,top-4,width+6,2);
  r(c,P.snow, left-3,top-5,width+6,1);
  r(c,P.snowLight,left+3,top-6,width*.28,1);
  r(c,P.snowLight,left+width*.64,top-6,width*.23,1);
  [[left-1,top-1],[left+width,top-1],[left-1,top+height],[left+width,top+height]].forEach(([xx,yy])=>r(c,'#d7c4b5',xx,yy,1,1));
}
function snow(c,s){
  for(let i=0;i<44;i++){
    const speed=7+rnd(i+61)*10;const motion=s.reducedMotion?0:s.time*speed;
    const x=(rnd(i+4)*330-s.camera*.11+(s.reducedMotion?0:Math.sin(s.time*.3+i)*3)+660)%330;
    r(c,i%4?'#b9d3dd':'#edf2e6',x,(rnd(i+8)*512+motion)%512,i%7?1:2,i%7?1:2);
  }
}
function sidewalk(c,s,level){
  const ground=level.groundY;
  r(c,'#819eaf',0,ground,288,138);r(c,'#bfd5dd',0,ground+4,288,17);r(c,'#dce9e9',0,ground,288,5);
  r(c,'#617b92',0,ground+21,288,7);r(c,'#a1b9c8',0,ground+22,288,2);
  const offset=s.camera%32;
  for(let x=-offset-32;x<320;x+=32){r(c,'#6c879a',x,ground+8,1,12);r(c,'#f3f3e5',x+4,ground-2,21,4);r(c,'#a1bac6',x+3,ground+11,17,1);}
  r(c,'#45637a',0,ground+28,288,110);
  for(let y=ground+33;y<512;y+=14)for(let x=-offset-(y%28?16:0);x<320;x+=32){r(c,'#56748a',x+1,y,30,12);r(c,'#627f92',x+3,y+1,24,1);}
  // Optional gaps retain a clearly visible snow lip for their real collision edges.
  for(const gap of level.gaps||[]){const x=gap.x-s.camera,w=gap.w??gap.width??40;if(!visible(x,w))continue;r(c,'#1a2d42',x,ground,w,170);r(c,'#2a445c',x+3,ground+8,w-6,160);r(c,P.snow,x-5,ground-2,6,5);r(c,P.snow,x+w-1,ground-2,6,5);}
}
function pedestal(c,p,cam,ground){
  const x=p.x-cam;if(!visible(x,p.w))return;
  const h=p.h??Math.max(7,ground-p.y);
  r(c,'#5b5260',x,p.y,p.w,h);r(c,'#8b7c81',x+2,p.y+3,p.w-4,h-3);
  for(let y=p.y+13;y<p.y+h;y+=12){r(c,'#665e6b',x+1,y,p.w-2,1);r(c,'#665e6b',x+(Math.floor(y/12)%2?10:24),y-10,1,10);}
  r(c,'#c4d6dc',x-2,p.y-2,p.w+4,5);r(c,P.snowLight,x-2,p.y-3,p.w+4,2);r(c,'#a8bfc9',x+3,p.y+3,p.w-6,1);
}
function windowSill(c,p,cam){
  const x=p.x-cam;if(!visible(x,p.w))return;
  // The bright flat snow edge is exactly the collision surface, not a fake ledge.
  const inset=8,height=45;
  windowPane(c,x+inset,p.y-height,p.w-inset*2,height);
  r(c,'#526a7c',x+3,p.y+4,p.w-6,5);
  r(c,'#8d9fa9',x,p.y,p.w,5);
  r(c,'#c6d9df',x,p.y,p.w,2);
  r(c,P.snowLight,x,p.y,p.w,1);
  r(c,'#8aabb9',x+7,p.y+5,3,6);r(c,'#8aabb9',x+p.w-10,p.y+5,3,6);
}
function tie(c,x,y,time,dir=1){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir,1);
  const bend=Math.round(Math.sin(time*7)*2);
  r(c,'#192c4070',-10,-1,20,3);
  // Oversized Windsor knot, crisp diagonal stripes and a silly long pointed end.
  poly(c,'#20354d',[[-6,-32],[6,-32],[8,-26],[3,-22],[8+bend,-9],[1+bend,-1],[-7+bend,-8],[-2,-22],[-8,-27]]);
  poly(c,'#52617f',[[-5,-31],[5,-31],[6,-27],[2,-23],[-2,-23],[-6,-27]]);
  poly(c,'#66758f',[[-1,-23],[2,-23],[6+bend,-9],[bend,-3],[-5+bend,-9]]);
  c.save();c.beginPath();c.moveTo(-1,-23);c.lineTo(2,-23);c.lineTo(6+bend,-9);c.lineTo(bend,-3);c.lineTo(-5+bend,-9);c.closePath();c.clip();
  for(let yy=-22;yy<-2;yy+=7)poly(c,P.pink,[[-8,yy],[9,yy-6],[9,yy-2],[-8,yy+4]]);
  c.restore();
  r(c,'#a8b5c5',-4,-29,8,1);r(c,'#f7e6d9',-3,-27,2,2);r(c,'#f7e6d9',2,-27,2,2);
  r(c,'#283142',-5,-1,5,2);r(c,'#283142',3,-1,5,2);
  c.restore();
}
function calendarFace(c,x,y,month,back=false){
  // A hand-drawn monthly sheet: the calendar grid remains legible at sprite size.
  r(c,back?'#d58b9d':'#fff1d8',x,y,28,30);
  r(c,back?'#e9a8b8':'#fff9e8',x+1,y+1,26,27);
  r(c,'#bb627e',x,y,28,7);r(c,P.pink,x+1,y+1,26,2);
  if(back){r(c,'#d99aaa',x+4,y+13,20,1);r(c,'#d99aaa',x+4,y+18,16,1);return;}
  const names=['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
  c.font='5px Pixel,monospace';c.fillStyle='#fff2df';c.textAlign='center';c.fillText(names[(month-1)%12],x+14,y+6);c.textAlign='left';
  for(let row=0;row<4;row++)for(let col=0;col<6;col++)r(c,col===5?'#c27983':'#728195',x+4+col*3.5,y+11+row*4,2,1);
  // The stern-looking pair of eyes turns the office freebie into a silly enemy.
  r(c,'#384b63',x+6,y+10,4,2);r(c,'#384b63',x+18,y+10,4,2);
  r(c,'#384b63',x+7,y+8,2,1);r(c,'#384b63',x+19,y+8,2,1);
  r(c,'#ba7886',x+11,y+26,7,1);
}
function calendar(c,enemy,s){
  const shake=enemy.warning&&!s.reducedMotion?Math.round(Math.sin(s.time*24)):0;
  const x=Math.round(enemy.x-s.camera)+shake,y=Math.round(enemy.y);
  const open=Math.max(0,Math.min(1,enemy.open||0));
  const month=((enemy.month??(12+Math.max(0,enemy.cycle||0)))-1)%12+1;
  c.save();c.translate(x,y);
  r(c,'#172a3e77',-17,-18,35,40);
  r(c,'#253b52',-16,-19,32,38);r(c,'#8397a3',-15,-18,30,36);
  r(c,'#d4d9d1',-14,-16,28,33);r(c,'#a7b7be',-13,17,27,2);
  // The next page stays on the backing as the front leaf folds upwards.
  calendarFace(c,-14,-14,month===12?1:month+1);
  const projection=Math.cos(open*Math.PI);
  if(Math.abs(projection)>.035){
    c.save();c.translate(0,-14);c.scale(1,projection);
    calendarFace(c,-14,0,month,projection<0);c.restore();
  }
  r(c,'#34495d',-15,-16,30,3);r(c,'#c7d4d4',-15,-17,30,1);
  [-9,8].forEach(xx=>{r(c,'#263b50',xx-1,-21,4,9);r(c,'#c2d1d0',xx,-21,2,7);r(c,'#eef0de',xx,-21,1,3);});
  // Neutral lettering signals the insurance-office calendar without a real brand.
  r(c,'#263e53',-25,23,50,9);r(c,'#a8bdc5',-24,24,48,7);
  c.fillStyle='#3a5068';c.font='5px Pixel,monospace';c.textAlign='center';c.fillText('VERSICHERUNG',0,30);c.textAlign='left';
  if(enemy.warning)star(c,24,-19,P.gold);
  c.restore();
}
function calendarPage(c,page,s){
  c.save();c.translate(Math.round(page.x-s.camera),Math.round(page.y));
  if(!s.reducedMotion)c.rotate(Math.round((page.angle||0)*8)/8);
  r(c,'#25394a66',-6,-8,14,18);
  r(c,'#b0c0c7',-7,-9,14,18);r(c,'#fff7e2',-6,-8,12,16);
  r(c,'#c87990',-6,-8,12,4);r(c,'#f2b6c8',-6,-8,12,1);
  r(c,'#d3d9cc',3,5,3,3);r(c,'#fdf9e7',3,4,2,1);
  c.font='5px Pixel,monospace';c.fillStyle='#465b75';c.textAlign='center';c.fillText(String(page.month||12).padStart(2,'0'),0,1);c.textAlign='left';
  for(let row=0;row<2;row++)for(let col=0;col<3;col++)r(c,col===2?'#c6828e':'#8b9ba7',-4+col*3,3+row*3,2,1);
  c.restore();
}
function savingsBook(c,x,y){
  x=Math.round(x);y=Math.round(y);
  r(c,'#172c4055',x-13,y+10,26,3);
  r(c,'#253d46',x-12,y-11,24,23);r(c,'#486d65',x-11,y-10,22,21);
  r(c,'#749480',x-9,y-9,18,18);r(c,'#3c6157',x-11,y-10,4,21);
  r(c,'#cad6bb',x-6,y+8,16,2);r(c,'#f1e2ba',x-6,y+8,14,1);
  r(c,'#d9c394',x-5,y-7,12,2);r(c,'#d9c394',x-5,y-4,10,1);
  // Hand-pixelled euro mark; no bank branding or external mark.
  r(c,P.gold,x-1,y-1,6,1);r(c,P.gold,x-3,y,2,5);r(c,P.gold,x-1,y+5,6,1);
  r(c,P.gold,x-4,y+1,8,1);r(c,P.gold,x-4,y+3,7,1);
}
function sock(c,x,y,phase,dir=1){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir,1);
  for(let i=0;i<2;i++){
    const xx=i*12-11,hop=Math.round(Math.sin(phase+i*Math.PI)*1.5);
    poly(c,i?'#aca8b1':'#babcc3',[[xx,0],[xx+11,0],[xx+12,-4],[xx+8,-8],[xx+7,-18],[xx,-18]]);
    r(c,i?'#d6c2ca':'#dce0d6',xx,-18+hop,8,5);
    r(c,'#8b879a',xx,-14+hop,8,2);r(c,'#8b879a',xx+2,-10+hop,5,2);
    r(c,'#d8d5d8',xx+2,-15+hop,4,5);r(c,'#423e51',xx+6,-12+hop,1,2);
    r(c,'#c6a5ba',xx+6,-5+hop,5,4);r(c,'#73788e',xx-1,hop,13,2);
  }
  c.restore();
}
function underwear(c,x,y,angle=0,small=false){
  c.save();c.translate(Math.round(x),Math.round(y));if(!small)c.rotate(Math.round(angle*6)/6);else c.scale(.63,.63);
  poly(c,'#8794aa',[[-13,-9],[13,-9],[11,3],[6,11],[0,5],[-6,11],[-11,3]]);
  poly(c,'#fff3e6',[[-11,-8],[11,-8],[9,3],[5,8],[0,2],[-5,8],[-9,3]]);
  r(c,'#d890aa',-12,-8,24,4);r(c,'#f3bbcc',-10,-7,20,1);
  r(c,'#e1d5cf',-6,-3,1,7);r(c,'#e1d5cf',5,-3,1,7);r(c,'#e8c8cf',-2,-1,4,3);r(c,'#bb8fa4',0,1,1,3);
  c.restore();
}
function clothesline(c,line,s){
  const x=line.x-s.camera,y=line.y??251,w=line.w??line.width??130;
  if(!visible(x,w))return;
  const wobble=line.warning&&!s.reducedMotion?Math.sin(s.time*29)*3:0;
  r(c,'#596b7a',x-3,y-13,5,135);r(c,'#9fb3bb',x-2,y-13,1,134);r(c,P.snow,x-5,y-15,9,3);
  r(c,'#596b7a',x+w-2,y-13,5,135);r(c,'#9fb3bb',x+w-1,y-13,1,134);r(c,P.snow,x+w-4,y-15,9,3);
  c.strokeStyle=line.warning?'#e3bc8e':'#a6c0c8';c.lineWidth=1;c.beginPath();c.moveTo(Math.round(x),y-8);c.quadraticCurveTo(x+w/2,y+3+wobble,x+w,y-8);c.stroke();
  // The visible launching pair shares the physics anchor: line.x + 36, line.y.
  // It disappears from the rope for the same 1.8 s that the flying pair is active.
  const shirtX=x+w-29,shirtY=y+wobble*.25;
  poly(c,'#a2b1bd',[[shirtX-8,shirtY],[shirtX-13,shirtY+7],[shirtX-7,shirtY+10],[shirtX-5,shirtY+6],[shirtX-5,shirtY+21],[shirtX+7,shirtY+21],[shirtX+7,shirtY+6],[shirtX+10,shirtY+9],[shirtX+15,shirtY+6],[shirtX+8,shirtY],[shirtX+4,shirtY+3],[shirtX-3,shirtY+3]]);
  r(c,'#c2c7ca',shirtX-3,shirtY+6,8,2);r(c,'#9e735d',shirtX-8,shirtY-2,2,5);r(c,'#9e735d',shirtX+6,shirtY-2,2,5);
  if((line.progress??2)>=1.8){
    underwear(c,x+36,y+wobble*.5,0);
    r(c,'#9e735d',x+27,y-10+wobble*.5,2,6);r(c,'#9e735d',x+43,y-10+wobble*.5,2,6);
  }
  if(line.warning)star(c,x+36,y-22,'#f3cd86');
}
function checkpoint(c,x,ground,active){
  r(c,'#4d6577',x-2,ground-49,4,49);r(c,P.snow,x-5,ground-1,10,3);
  poly(c,active?'#f3aac4':'#a3b6c4',[[x+2,ground-48],[x+34,ground-44],[x+27,ground-35],[x+2,ground-33]]);
  r(c,active?'#b45a83':'#6f8197',x+7,ground-44,17,1);
  if(active){r(c,'#fff0df',x+10,ground-39,3,2);r(c,'#fff0df',x+13,ground-42,2,5);star(c,x+30,ground-55);}
}
function finish(c,x,ground){
  r(c,'#4b6274',x+19,ground-57,4,57);r(c,'#8eacb9',x+20,ground-55,1,54);
  poly(c,P.pink,[[x+23,ground-56],[x+55,ground-52],[x+49,ground-42],[x+23,ground-40]]);
  r(c,'#fff0df',x+30,ground-50,16,1);r(c,'#a45779',x+30,ground-46,12,1);
  star(c,x+21,ground-63,P.gold);
  for(let i=0;i<4;i++)r(c,i%2?'#ffdee5':'#d78ea8',x-3+i*5,ground,5,4);
  c.fillStyle='#ffe1d4';c.font='8px Pixel,monospace';c.textAlign='center';c.fillText('ZIEL',x+21,ground-71);c.textAlign='left';
}

export function drawCharacter(c,x,y,{facing=1,vx=0,vy=0,grounded=true,friend=false,third=false,arms=false,time=0,front=false}={}){
  const walk=grounded&&Math.abs(vx)>4?Math.round(Math.sin(time*14)*3):0;
  c.save();c.translate(Math.round(x),Math.round(y));if(!front)c.scale(facing<0?-1:1,1);
  r(c,'#22394c65',-9,-1,18,3);
  const coat=third?'#a58a65':friend?'#c08083':'#4b929a',shade=third?'#79634e':friend?'#9b5d68':'#2f6c7c';
  const step=grounded?walk:3;
  r(c,'#33394d',-5,-10-step,4,10);r(c,'#33394d',2,-10+step,4,10);
  r(c,'#1e3045',-6,-2-step,6,3);r(c,'#1e3045',2,-2+step,7,3);
  r(c,shade,-7,-25,14,17);r(c,coat,-6,-25,12,14);r(c,friend?'#db9b94':third?'#c0a27c':'#72b2b1',-4,-23,7,8);
  r(c,shade,5,-23,4,15);r(c,'#eed0ac',6,-11,3,4);
  r(c,'#c29880',-2,-28,5,5);r(c,'#f0ccaa',-5,-37,11,10);r(c,'#ffdebd',-3,-35,8,6);
  r(c,friend?'#795047':'#57414b',-6,-39,12,5);r(c,friend?'#955f4f':'#70505a',-4,-40,8,2);
  r(c,friend?'#795047':'#57414b',-6,-36,3,8);
  if(front){r(c,'#483d47',-2,-32,1,2);r(c,'#483d47',3,-32,1,2);r(c,'#cc9d88',0,-29,2,1);}else{r(c,'#483d47',4,-33,1,2);r(c,'#f0ccaa',6,-32,2,3);r(c,'#a7786b',4,-29,2,1);}
  r(c,friend?'#edc995':third?'#a9c4b0':P.pink,-7,-28,14,4);
  r(c,friend?'#ca9b73':third?'#8ba494':'#cc789b',-6,-25,3,9);
  if(!friend&&!third){const flap=grounded?Math.sin(time*9)*1.5:-3;r(c,P.pink,-15,-25+flap,9,3);r(c,'#dc88a8',-15,-22+flap,3,3);}
  if(arms){r(c,coat,-12,-22,7,5);r(c,coat,6,-22,7,5);r(c,'#f8d7b4',-12,-19,4,4);r(c,'#f8d7b4',10,-19,4,4);}
  c.restore();
}
function playing(c,s,a,level){
  background(c,s,level);
  const ground=level.groundY,cam=s.camera;
  const start=Math.floor((cam-230)/239);
  for(let index=start;index<start+4;index++){
    const wx=index*239-28;if(wx>=level.boundary-90)continue;
    house(c,wx-cam,ground,index+9);
  }
  // Courtyard walls carry the level seamlessly into the second section.
  const court=level.boundary-85-cam;
  if(court<328){
    r(c,'#4d596a',court,217,level.width,ground-217);r(c,'#65707d',court+2,222,level.width,ground-224);
    for(let y=234;y<ground-3;y+=16){r(c,'#505d70',court,y,level.width,2);for(let x=court+(y%32?15:0);x<320;x+=37)r(c,'#505d70',x,y-14,1,14);}
    r(c,P.snowShade,court-2,214,level.width,7);r(c,P.snow,court-2,213,level.width,3);
  }
  // Campaign posters belong to the scenery, behind every playable surface.
  for(const [index,ad] of (level.ads||[]).entries())billboard(c,ad,a.ads?.[ad.assetIndex??index],cam,ground);
  // Snowy ground and props are drawn before actual collision platforms and actors.
  sidewalk(c,s,level);
  for(let x=140;x<level.width;x+=475){const sx=x-cam;if(visible(sx,18))lamp(c,sx,ground,s.time);}
  for(let x=390;x<level.width;x+=690){const sx=x-cam;if(visible(sx,45))pine(c,sx,ground-2,.64,true);}
  const checkpointX=(level.checkpointX??level.boundary)-cam;
  if(visible(checkpointX,36))checkpoint(c,checkpointX,ground,typeof s.checkpoint==='object'?s.checkpoint.active:s.checkpoint);
  const finishX=(level.finishX??level.width-80)-cam;
  if(visible(finishX,58))finish(c,finishX,ground);
  for(const platform of level.platforms||[]){
    if(platform.kind==='sill')windowSill(c,platform,cam);
    else pedestal(c,platform,cam,ground);
  }
  for(const line of s.lines||[])clothesline(c,line,s);
  for(const enemy of s.calendars||[])if(visible(enemy.x-cam-26,52))calendar(c,enemy,s);
  for(const product of level.products||[]){
    if((s.inventory||[]).includes(product.id))continue;
    const x=product.x-cam,y=product.y+(s.reducedMotion?0:Math.sin(s.time*2.5)*1.5);
    if(!visible(x,28))continue;
    r(c,'#deb7c54d',x-15,y+13,30,3);
    sprite(c,product.id==='8er'?a.eightSprite:a.eighteenSprite,x-13,y-13,26,product.id);
    star(c,x-19,y-7,P.gold);star(c,x+18,y+5,P.pink);
    c.font='7px Pixel,monospace';c.fillStyle='#fff0d9';c.textAlign='center';c.fillText(product.id,x,y-18);c.textAlign='left';
  }
  const book=level.savingsBook;
  if(book&&!s.savingsCollected&&visible(book.x-cam,28))savingsBook(c,book.x-cam,book.y);
  for(const enemy of s.socks||[])if(visible(enemy.x-cam,30))sock(c,enemy.x-cam,enemy.y??ground,s.reducedMotion?0:s.time*10,enemy.dir??1);
  for(const enemy of s.ties||[])if(visible(enemy.x-cam,24))tie(c,enemy.x-cam,enemy.y??ground,s.reducedMotion?0:s.time,enemy.dir??1);
  for(const item of s.underwear||[])if(item.active!==false&&visible(item.x-cam,28))underwear(c,item.x-cam,item.y,item.angle??0);
  for(const page of s.calendarPages||[])if(page.active!==false&&visible(page.x-cam-10,20))calendarPage(c,page,s);
  const p=s.player;
  c.save();if(p.invulnerable>0&&Math.floor(s.time*12)%2===0)c.globalAlpha=.5;
  drawCharacter(c,p.x-cam,p.y,{...p,time:s.reducedMotion?0:s.time});c.restore();
  // Foreground snow is sparse and never hides the hazards' silhouettes.
  snow(c,s);
}
export function drawWorld(ctx,state={},assets={},level={}){
  const p={x:60,y:374,vx:0,vy:0,facing:1,grounded:true,...state.player};
  const s={time:0,phaseTime:0,phase:'playing',camera:0,reducedMotion:false,inventory:[],socks:[],ties:[],underwear:[],lines:[],calendars:[],calendarPages:[],...state,player:p};
  const l={width:2340,groundY:374,boundary:1090,finishX:2260,platforms:[],products:[],...level};
  ctx.save();ctx.imageSmoothingEnabled=false;
  playing(ctx,s,assets,l);
  ctx.restore();
}
