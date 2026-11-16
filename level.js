// One continuous, traversable level. Coordinates are pixels; y is a platform's top.
export const level = {
  width: 2520,
  groundY: 374,
  boundary: 1090,
  finishX: 2440,
  checkpointX: 1110,
  platforms: [
    {x:170,y:374,w:190,h:12,kind:'curb'},
    {x:554,y:337,w:100,h:37,kind:'gift'},
    {x:828,y:347,w:92,h:27,kind:'step'},
    {x:1350,y:345,w:100,h:29,kind:'step'},
    {x:1834,y:337,w:100,h:37,kind:'gift'},
    {x:2120,y:348,w:92,h:26,kind:'step'},
    ...[
      [18,321,56],[134,321,56],[254,321,56],[342,321,62],
      [448,278,60],[584,278,56],[680,321,56],[925,321,56],
      [1170,321,64],[1430,296,64],[1740,321,64],[1970,321,64],[2180,306,62],[2340,321,64]
    ].map(([x,y,w])=>({x,y,w,h:6,kind:'sill'}))
  ],
  gaps: [{x:1580,w:44}],
  products: [{id:'8er',x:604,y:316,name:'Weihnachtsfest'}, {id:'18er',x:1884,y:316,name:'Frohe Weihnachten'}],
  savingsBook: {x:870,y:336},
  calendars: [
    {id:'insurance-calendar',x:770,y:286,warningDuration:.8,burstSpacing:.22,cooldownDuration:2.7}
  ],
  ads: [
    {id:'fairtrade',file:'fairtrade-kakao.png',x:390,y:116,w:185,h:185*436/747},
    {id:'roestung',file:'roestung-wien.png',x:960,y:120,w:200,h:200*401/855},
    {id:'fette',file:'ohne-gehaertete-fette.png',x:1510,y:118,w:190,h:190*414/772},
    {id:'zusatzstoffe',file:'ohne-zusatzstoffe.png',x:2100,y:124,w:220,h:220*396/973}
  ],
  ties: [
    {x:470,y:374,baseY:374,left:430,right:510,speed:28,dir:1,offset:0},
    {x:1900,y:337,baseY:337,left:1854,right:1910,speed:24,dir:-1,offset:1.1}
  ],
  socks: [
    {x:252,y:374,left:198,right:331,speed:21,dir:-1},
    {x:914,y:374,left:736,right:1000,speed:26,dir:-1},
    {x:1280,y:374,left:1170,right:1330,speed:23,dir:-1},
    {x:1748,y:374,left:1650,right:1790,speed:25,dir:1},
    {x:2175,y:348,left:2140,right:2191,speed:19,dir:-1}
  ],
  lines: [
    {x:1210,y:256,w:155,period:4.5,offset:0},
    {x:1510,y:247,w:144,period:5.2,offset:1.8},
    {x:2015,y:258,w:145,period:4.7,offset:2.1}
  ]
};
