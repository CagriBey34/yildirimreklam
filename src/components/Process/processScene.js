// Canvas scene for the "Çalışma süreci" section: one street, morning to
// night — measuring at the client's bakery, the design studio, the
// workshop, and the evening install of the new sign. The original is a
// 40-second timeline; here that timeline is driven by the section's own
// scroll position (native position:sticky, no scroll-jacking), eased per
// frame like the intro.
//
// mountProcessScene(root) wires everything up and returns a cleanup function.

export function mountProcessScene(root) {
var stage=root.querySelector('.yrs-stage'), cv=root.querySelector('.yrs-canvas'), mainC=cv.getContext('2d');
var wcv=document.createElement('canvas'), wctx=wcv.getContext('2d'), mcv=document.createElement('canvas'), mctx=mcv.getContext('2d'), c=wctx;
var lcv=document.createElement('canvas'), lc=lcv.getContext('2d');
var caps=[].slice.call(root.querySelectorAll('.yrs-cap')), navs=[].slice.call(root.querySelectorAll('[data-yrs-go]')), fills=[].slice.call(root.querySelectorAll('.yrs-fill'));
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var FONT='"Barlow Condensed","Arial Narrow",Impact,sans-serif';
var G=820, R=G+38, TAU=Math.PI*2, LQ=.5;
var vw=1,vh=1,dpr=1,S=1,K={x:0,y:0,z:1},VX0=0,VX1=1,NF=0,AMB='rgb(246,242,234)';
var EMIT=[],LIGHTS=[],BLOOM=[],REFL=[],HAZE=[];
var TOTAL=40,H=[0,11,22,33],E=[8,19,30,40];
var SC=[700,1920,3120,4500], DT=[[690,575],[1905,690],[3020,705],[4520,560]], DZ=[1.4,2.3,1.8,1.5];
var SHOP1=300, SHOP4=4100;
// Scroll range → timeline range. Starts just after the first caption has
// faded in and stops before the last one fades out.
var T0=.9, T1=38.8;

function cl(v,a,b){return v<a?a:v>b?b:v}
function sm(u){u=cl(u,0,1);return u*u*(3-2*u)}
function rng(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
function hx(h){h=h.replace('#','');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
var MC={};
function mx(h,k){var key=h+k;if(MC[key])return MC[key];var a=hx(h),t=k<0?0:255,m=Math.abs(k);
  return (MC[key]='rgb('+Math.round(a[0]+(t-a[0])*m)+','+Math.round(a[1]+(t-a[1])*m)+','+Math.round(a[2]+(t-a[2])*m)+')')}


/* ---------- dokular ---------- */
var TX={},PAT={};
function mk(w,h){var e=document.createElement('canvas');e.width=w;e.height=h;return e}
function noise(x,w,h,amp,seed){var id=x.getImageData(0,0,w,h),d=id.data,r=rng(seed);
  for(var i=0;i<d.length;i+=4){var n=(r()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(id,0,0)}
(function(){
  var e,x,r,i,j,v;
  e=mk(276,160);x=e.getContext('2d');r=rng(3);x.fillStyle='#9a958c';x.fillRect(0,0,276,160);
  for(i=0;i<10;i++)for(j=-1;j<7;j++){var bx=j*46+(i%2?23:0),by=i*16;v=r();
    x.fillStyle='rgb('+(132+v*46|0)+','+(64+v*26|0)+','+(48+v*18|0)+')';x.fillRect(bx+1,by+1,44,14);
    x.fillStyle='rgba(0,0,0,'+(r()*.2).toFixed(2)+')';x.fillRect(bx+1,by+10,44,5);
    x.fillStyle='rgba(255,255,255,.07)';x.fillRect(bx+1,by+1,44,2)}
  noise(x,276,160,30,7);TX.brick=e;
  e=mk(256,256);x=e.getContext('2d');r=rng(9);x.fillStyle='#c3bdb1';x.fillRect(0,0,256,256);
  for(i=0;i<26;i++){var gx=r()*256,gy=r()*256,gr=20+r()*60,g=x.createRadialGradient(gx,gy,0,gx,gy,gr);
    g.addColorStop(0,r()<.5?'rgba(0,0,0,.06)':'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256)}
  noise(x,256,256,20,13);TX.plaster=e;
  e=mk(24,64);x=e.getContext('2d');
  for(i=0;i<24;i++){v=Math.round(150+60*Math.sin(i/24*TAU));x.fillStyle='rgb('+v+','+(v+4)+','+(v+10)+')';x.fillRect(i,0,1,64)}
  noise(x,24,64,16,17);TX.corr=e;
  e=mk(256,256);x=e.getContext('2d');x.fillStyle='#55565b';x.fillRect(0,0,256,256);noise(x,256,256,56,21);
  r=rng(23);for(i=0;i<500;i++){x.fillStyle=r()<.5?'rgba(255,255,255,.1)':'rgba(0,0,0,.18)';x.fillRect(r()*256,r()*256,2,2)}TX.asph=e;
  e=mk(256,64);x=e.getContext('2d');x.fillStyle='#9a958e';x.fillRect(0,0,256,64);noise(x,256,64,30,29);
  x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,2,64);x.fillRect(128,0,2,64);TX.conc=e;
  e=mk(128,128);x=e.getContext('2d');var id=x.createImageData(128,128);r=rng(31);
  for(i=0;i<id.data.length;i+=4){v=r()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}x.putImageData(id,0,0);TX.grain=e;
})();
function makePatterns(){
  ['brick','plaster','corr','asph','conc'].forEach(function(n){var p=c.createPattern(TX[n],'repeat');
    try{p.setTransform(new DOMMatrix([.5,0,0,.5,0,0]))}catch{/* eski tarayıcı */}PAT[n]=p});
  PAT.grain=c.createPattern(TX.grain,'repeat');
}

/* ---------- çizim yardımcıları ---------- */
function lgV(y0,y1,s){var g=c.createLinearGradient(0,y0,0,y1);for(var i=0;i<s.length;i++)g.addColorStop(s[i][0],s[i][1]);return g}
function lgH(x0,x1,s){var g=c.createLinearGradient(x0,0,x1,0);for(var i=0;i<s.length;i++)g.addColorStop(s[i][0],s[i][1]);return g}
function rr(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function box(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function circ(x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function ell(x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function metal(x,y,w,h,base,r){c.fillStyle=lgV(y,y+h,[[0,mx(base,.38)],[.14,mx(base,.14)],[.6,base],[1,mx(base,-.45)]]);if(r){rr(x,y,w,h,r);c.fill()}else c.fillRect(x,y,w,h)}
function cylV(x,y,w,h,base){c.fillStyle=lgH(x,x+w,[[0,mx(base,-.55)],[.3,mx(base,.25)],[.45,mx(base,.06)],[1,mx(base,-.6)]]);c.fillRect(x,y,w,h)}
function ao(x0,x1,y,h,a){c.fillStyle=lgV(y-h,y,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,'+a+')']]);c.fillRect(x0,y-h,x1-x0,h)}
function shade(x,y,rx,ry,a){ell(x,y,rx,ry,'rgba(0,0,0,'+a+')')}
function bolt(x,y,h,col){var w=h*.62,P=[[.62,0],[.08,.58],[.44,.58],[.3,1],[.94,.38],[.56,.38],[.78,0]];c.fillStyle=col;c.beginPath();
  for(var i=0;i<P.length;i++){var px=x+P[i][0]*w,py=y+P[i][1]*h;if(i)c.lineTo(px,py);else c.moveTo(px,py)}c.closePath();c.fill()}
function txt(s,x,y,size,col,wt,al){c.font=(wt||800)+' '+size+'px '+FONT;c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s,x,y)}
function seg(x1,y1,x2,y2,w1,w2){var dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  c.beginPath();c.moveTo(x1+nx*w1/2,y1+ny*w1/2);c.lineTo(x2+nx*w2/2,y2+ny*w2/2);c.lineTo(x2-nx*w2/2,y2-ny*w2/2);c.lineTo(x1-nx*w1/2,y1-ny*w1/2);c.closePath();
  c.moveTo(x1+w1/2,y1);c.arc(x1,y1,w1/2,0,TAU);c.moveTo(x2+w2/2,y2);c.arc(x2,y2,w2/2,0,TAU);c.fill()}

/* ---------- ışık kayıtları ---------- */
function light(x,y,r,rgb,a){if(a>.004)LIGHTS.push([0,x,y,r,rgb,a])}
function spot(x,y,w,h,rgb,a){LIGHTS.push([1,x,y,w,h,rgb,a])}
function wash(x,y,w,h,rgb,a){LIGHTS.push([2,x,y,w,h,rgb,a])}
// Gece faktörüne (NF) göre ölçeklenir: gündüz parlamalar sönük, yansımalar yok.
function bloom(x,y,r,rgb,a){a*=.3+.7*NF;if(a>.004)BLOOM.push([x,y,r,rgb,a])}
function refl(x,w,rgb,a){a*=NF;if(a>.004)REFL.push([x,w,rgb,a])}

/* ---------- insan figürü ---------- */
function limb2(x,y,a1,l1,a2,l2,w1,w2,w3){var ex=x+Math.sin(a1)*l1,ey=y+Math.cos(a1)*l1,hx2=ex+Math.sin(a1+a2)*l2,hy2=ey+Math.cos(a1+a2)*l2;
  seg(x,y,ex,ey,w1,w2);seg(ex,ey,hx2,hy2,w2,w3);return [hx2,hy2]}
function ik(sx,sy,tx,ty,l1,l2){var dx=tx-sx,dy=ty-sy,d=cl(Math.hypot(dx,dy),4,l1+l2-.5),a=Math.atan2(dx,dy),
  cb=cl((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),a1=a-Math.acos(cb),ex=sx+Math.sin(a1)*l1,ey=sy+Math.cos(a1)*l1;return [a1,Math.atan2(tx-ex,ty-ey)-a1]}
function shoe(p,col,dark){c.fillStyle=col;rr(p[0]-8,p[1]-5,26,9,4);c.fill();box(p[0]-8,p[1]+2,26,2.5,'#57524c');if(dark){c.fillStyle='rgba(0,0,0,.3)';rr(p[0]-8,p[1]-5,26,10,4);c.fill()}}
function person(x,y,o){
  var f=o.f||1,sk=o.skin||'#c58d6b',sh=o.shirt||'#3d5a80',pa=o.pants||'#343a4c',so=o.shoes||'#1f1d1c';
  var Lg=o.legs||[.05,-.05],Kn=o.knees||[0,0],ar=o.arms||[[.12,-.25],[-.1,-.2]],b=o.bob||0,fh,q;
  if(!o.noShadow){var sg=c.createRadialGradient(x,y,0,x,y,34);sg.addColorStop(0,'rgba(0,0,0,.5)');sg.addColorStop(1,'rgba(0,0,0,0)');
    c.save();c.translate(0,y);c.scale(1,.18);c.translate(0,-y);c.fillStyle=sg;c.beginPath();c.arc(x,y,34,0,TAU);c.fill();c.restore()}
  c.save();c.translate(x,y+b);c.scale(f,1);
  var gS=lgH(-20,20,[[0,mx(sh,-.5)],[.62,sh],[1,mx(sh,.16)]]),gP=lgH(-14,14,[[0,mx(pa,-.5)],[.62,pa],[1,mx(pa,.14)]]),gK=lgH(-12,14,[[0,mx(sk,-.4)],[.6,sk],[1,mx(sk,.14)]]);
  // arka kol + arka bacak
  c.fillStyle=gS;var bh=limb2(-3,-140,ar[1][0],30,ar[1][1],28,11,9,7.5);c.fillStyle='rgba(0,0,0,.3)';limb2(-3,-140,ar[1][0],30,ar[1][1],28,11,9,7.5);
  circ(bh[0],bh[1],4.6,mx(sk,-.3));
  c.fillStyle=gP;var bl=limb2(-3,-92,Lg[1],45,Kn[1],44,17,13,10);c.fillStyle='rgba(0,0,0,.3)';limb2(-3,-92,Lg[1],45,Kn[1],44,17,13,10);shoe(bl,so,1);
  c.fillStyle=gP;var fl=limb2(3,-92,Lg[0],45,Kn[0],44,17,13,10);shoe(fl,so);
  if(o.coat){c.fillStyle=lgH(-20,20,[[0,mx(o.coat,-.5)],[.62,o.coat],[1,mx(o.coat,.14)]]);c.beginPath();c.moveTo(-17,-130);c.lineTo(18,-130);c.lineTo(21,-60);c.lineTo(-19,-60);c.closePath();c.fill()}
  c.fillStyle=gP;rr(-15,-102,31,16,6);c.fill();
  // gövde
  var tc=o.coat?lgH(-20,20,[[0,mx(o.coat,-.5)],[.62,o.coat],[1,mx(o.coat,.14)]]):gS;c.fillStyle=tc;
  c.beginPath();c.moveTo(-15,-147);c.quadraticCurveTo(2,-153,18,-146);c.lineTo(16.5,-122);c.quadraticCurveTo(15,-104,14,-90);c.lineTo(-15,-90);c.quadraticCurveTo(-18,-110,-17.5,-130);c.closePath();c.fill();
  if(o.vest){c.fillStyle=lgH(-18,18,[[0,'#8d9416'],[.6,'#cfd92a'],[1,'#e6ee52']]);c.beginPath();c.moveTo(-15,-145);c.lineTo(17,-145);c.lineTo(16,-98);c.lineTo(-15.5,-98);c.closePath();c.fill();
    box(-16,-121,33,4,'#d9dde0');box(-16,-107,33,4,'#d9dde0')}
  if(o.apron){c.fillStyle=lgH(-14,16,[[0,mx(o.apron,-.4)],[.6,o.apron],[1,mx(o.apron,.15)]]);c.beginPath();c.moveTo(0,-140);c.lineTo(16,-140);c.lineTo(17,-64);c.lineTo(2,-64);c.closePath();c.fill()}
  if(o.harness){c.strokeStyle='#202024';c.lineWidth=3;c.beginPath();c.moveTo(-9,-146);c.lineTo(-11,-94);c.moveTo(11,-146);c.lineTo(12,-94);c.moveTo(-15,-100);c.lineTo(16,-100);c.stroke()}
  if(o.stripe){box(-16,-131,33,5,o.stripe);bolt(6,-145,10,o.stripe)}
  c.fillStyle=mx(sh,-.3);c.beginPath();c.moveTo(4,-150);c.lineTo(15,-147);c.lineTo(9,-139);c.closePath();c.fill();
  c.fillStyle=gK;c.fillRect(-3,-158,9,12);box(-3,-150,9,4,'rgba(0,0,0,.25)');
  // baş
  var hg=c.createRadialGradient(7,-171,1,3,-166,14);hg.addColorStop(0,mx(sk,.16));hg.addColorStop(1,mx(sk,-.32));c.fillStyle=hg;
  c.beginPath();c.ellipse(3,-166,10.5,12.5,0,0,TAU);c.fill();
  c.beginPath();c.moveTo(12.8,-169);c.lineTo(15.8,-162.5);c.lineTo(12.4,-161.2);c.closePath();c.fill();
  ell(-1,-165,2.4,4,mx(sk,-.25));
  box(8.6,-168.4,2.6,1.8,'#1b1412');
  var hair=o.hair||'#2a1f1a';
  if(o.longHair){c.fillStyle=hair;c.beginPath();c.ellipse(-3,-158,9,20,.1,0,TAU);c.fill()}
  c.fillStyle=hair;c.beginPath();c.ellipse(2,-170,11.4,10.2,0,Math.PI*.98,TAU*1.0);c.fill();c.beginPath();c.ellipse(-4,-166,7.4,9.4,0,0,TAU);c.fill();
  box(8,-172.2,5.5,1.4,hair);
  if(o.helmet){c.fillStyle=lgV(-186,-168,[[0,mx(o.helmet,.4)],[1,mx(o.helmet,-.25)]]);c.beginPath();c.ellipse(2,-172,12.8,11.5,0,Math.PI,TAU);c.fill();
    c.fillStyle=mx(o.helmet,-.2);rr(-11,-173,31,3.6,1.6);c.fill();box(1,-183,2,10,'rgba(255,255,255,.25)')}
  if(o.chef){c.fillStyle=lgV(-212,-176,[[0,'#ffffff'],[1,'#d9d5cc']]);c.beginPath();c.ellipse(-2,-200,13,11,0,0,TAU);c.fill();c.beginPath();c.ellipse(9,-198,10,9,0,0,TAU);c.fill();c.fillRect(-8,-196,22,20);box(-9,-180,24,4,'#d8d4ca')}
  if(o.cap){c.fillStyle=o.cap;c.beginPath();c.ellipse(2,-172,11.6,9,0,Math.PI,TAU);c.fill();rr(8,-174,15,3.4,1.5);c.fill()}
  // ön kol
  c.fillStyle=gS;
  if(o.reach){q=ik(3,-140,(o.reach[0]-x)*f,o.reach[1]-y-b,30,28);fh=limb2(3,-140,q[0],30,q[1],28,11,9,7.5)}
  else fh=limb2(3,-140,ar[0][0],30,ar[0][1],28,11,9,7.5);
  circ(fh[0],fh[1],4.8,gK);
  c.restore();
  return [x+fh[0]*f,y+b+fh[1]];
}
function gait(t,sp){var s=Math.sin(t*sp),k=Math.cos(t*sp);return {legs:[s*.4,-s*.4],knees:[Math.max(0,-s)*.75+.05,Math.max(0,s)*.75+.05],arms:[[-s*.32,-.3],[s*.32,-.3]],bob:-Math.abs(k)*3+1.5}}
var SIT={legs:[1.5,1.44],knees:[-1.5,-1.42]};


var far=[],mid=[],stars=[];
(function(){
  var r=rng(11),x=-3500,w,h,wins,a,b;
  while(x<7200){w=70+r()*130;h=200+r()*420;wins=[];
    for(a=0;a<Math.floor(w/22);a++)for(b=0;b<Math.floor(h/30);b++)if(r()<.13)wins.push([x+8+a*22,G-h+12+b*30,r()]);
    far.push([x,w,h,wins,r()]);x+=w+4+r()*30}
  r=rng(29);x=-2600;while(x<7600){w=90+r()*160;h=110+r()*230;mid.push([x,w,h,r()]);x+=w+30+r()*130}
  r=rng(5);for(a=0;a<90;a++)stars.push([r(),r()*.5,r()*1.2+.3,r()*6]);
})();
function mosque(x){var b=G-180;c.beginPath();c.arc(x,b,70,Math.PI,TAU);c.fill();c.fillRect(x-110,b,220,180);
  c.beginPath();c.arc(x-80,b+20,34,Math.PI,TAU);c.fill();c.beginPath();c.arc(x+80,b+20,34,Math.PI,TAU);c.fill();
  c.fillRect(x-2,b-90,4,22);
  for(var k=-1;k<=1;k+=2){var mxp=x+k*150;c.fillRect(mxp-7,G-420,14,420);c.fillRect(mxp-10,G-330,20,6);c.fillRect(mxp-10,G-390,20,6);
    c.beginPath();c.moveTo(mxp-7,G-420);c.lineTo(mxp,G-480);c.lineTo(mxp+7,G-420);c.closePath();c.fill()}}

function street(){
  W(1);
  c.fillStyle=PAT.conc;c.fillRect(VX0-400,G,VX1-VX0+800,30);
  c.fillStyle=lgV(G,G+30,[[0,'rgba(0,0,0,.25)'],[1,'rgba(0,0,0,0)']]);c.fillRect(VX0-400,G,VX1-VX0+800,30);
  c.fillStyle=lgV(G+30,R,[[0,'#bdb7ad'],[1,'#77726b']]);c.fillRect(VX0-400,G+30,VX1-VX0+800,8);
  c.fillStyle=PAT.asph;c.fillRect(VX0-400,R,VX1-VX0+800,4000);
  c.fillStyle=lgV(R,R+300,[[0,'rgba(0,0,0,.45)'],[.1,'rgba(0,0,0,.1)'],[1,'rgba(0,0,0,.35)']]);c.fillRect(VX0-400,R,VX1-VX0+800,300);
  for(var x=Math.floor((VX0-400)/170)*170;x<VX1+400;x+=170){c.fillStyle='rgba(222,214,190,.55)';c.fillRect(x,R+110,90,6);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(x+20,R+111,6,4)}
  var pud=[[600,60],[1720,90],[2480,70],[3360,110],[4180,80],[4980,70]];
  for(var i=0;i<pud.length;i++)if(seen(pud[i][0]-120,pud[i][0]+120))ell(pud[i][0],R+40,pud[i][1],8,'rgba(20,22,30,.55)');
}
function lamp(x){
  if(!seen(x-40,x+300))return;
  var B=G+28,top=490;
  shade(x,B,18,3,.45);
  c.fillStyle=lgH(x-5,x+5,[[0,'#16171b'],[.45,'#73767e'],[1,'#1d1e22']]);c.fillRect(x-4,top,8,B-top);c.fillRect(x-7,B-46,14,46);
  c.strokeStyle='#3c3e45';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x,top+8);c.quadraticCurveTo(x+6,top-16,x+50,top-12);c.stroke();
  metal(x+34,top-20,58,11,'#4a4c52',4);
  EMIT.push(function(){c.fillStyle=lgH(x+40,x+86,[[0,'#ffe9c4'],[.5,'#fffaf0'],[1,'#ffe9c4']]);rr(x+40,top-10,46,3.5,1.5);c.fill()});
  bloom(x+63,top-8,110,'255,205,150',.42);
  spot(x+63,top-8,420,B-top+8,'255,190,120',.4);light(x+63,G+12,280,'255,186,118',.55);light(x+63,top+10,160,'255,200,150',.3);
  refl(x+63,50,'255,198,140',.42);HAZE.push([x+63,top-8,360,B-top]);
}
function tree(x,seed){
  if(!seen(x-120,x+120))return;
  var B=G+24,r=rng(seed);
  shade(x,B,42,5,.35);box(x-26,B-2,52,4,'#2c2b2a');
  c.fillStyle=lgH(x-8,x+8,[[0,'#1f160f'],[.5,'#5b4332'],[1,'#20160f']]);seg(x,B,x+3,B-190,15,9);seg(x+2,B-150,x+40,B-210,7,4);seg(x+1,B-140,x-36,B-200,7,4);
  for(var k=0;k<14;k++){var cx=x+(r()-.5)*150,cy=B-210-r()*110,cr=34+r()*30;
    var g=c.createRadialGradient(cx+cr*.3,cy-cr*.35,2,cx,cy,cr);g.addColorStop(0,'#5b7a45');g.addColorStop(1,'#1f2d1b');c.fillStyle=g;c.beginPath();c.arc(cx,cy,cr,0,TAU);c.fill()}
}

/* ---------- ortak: atölye cephesi ---------- */
function channel(str,x,y,size,depth,on,face,glowCol){
  c.font='800 '+size+'px '+FONT;c.textAlign='center';c.textBaseline='middle';
  for(var d=depth;d>=1;d--){c.fillStyle=d===1?'#64666c':'#3a3b40';c.fillText(str,x+d*.55,y+d*.75)}
  c.fillStyle='#2e2f34';c.fillText(str,x,y);
  if(on>0)EMIT.push(function(){c.save();c.globalAlpha=on;c.font='800 '+size+'px '+FONT;c.textAlign='center';c.textBaseline='middle';
    c.shadowColor=glowCol;c.shadowBlur=size*.25*S*dpr;c.fillStyle=lgV(y-size*.4,y+size*.4,[[0,'#ffffff'],[1,face]]);c.fillText(str,x,y);c.restore()});
}
function shopBack(X0,X1,top,wall,tint){
  c.fillStyle=PAT[wall];c.fillRect(X0,top,X1-X0,G-top);
  if(tint){c.fillStyle=tint;c.fillRect(X0,top,X1-X0,G-top)}
  c.fillStyle=lgH(X0,X1,[[0,'rgba(0,0,0,.45)'],[.05,'rgba(0,0,0,0)'],[.95,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);c.fillRect(X0,top,X1-X0,G-top);
  metal(X0-10,top-16,X1-X0+20,16,'#8f8d88');
  var ox0=X0+56,ox1=X1-56,oy=476;
  c.fillStyle=PAT.plaster;c.fillRect(ox0,oy,ox1-ox0,G-oy);
  box(ox0,G-120,ox1-ox0,4,'rgba(0,0,0,.08)');
  c.fillStyle=lgV(G-30,G,[[0,'#6c6862'],[1,'#8e8983']]);c.fillRect(ox0,G-30,ox1-ox0,30);
  ao(ox0,ox1,G-30,26,.35);
  c.fillStyle=lgV(oy,oy+80,[[0,'rgba(0,0,0,.55)'],[1,'rgba(0,0,0,0)']]);c.fillRect(ox0,oy,ox1-ox0,80);
  wash(ox0,oy,ox1-ox0,G-oy,'205,190,170',.42);
  light((ox0+ox1)/2,G+14,(ox1-ox0)*.62,'255,205,150',.38);refl((ox0+ox1)/2,(ox1-ox0)*.28,'255,210,160',.14);
}
function shopFront(X0,X1,top,label){
  var ox0=X0+56,ox1=X1-56,oy=476,mid=(X0+X1)/2;
  metal(ox0-12,oy,12,G-oy,'#8c8f95');metal(ox1,oy,12,G-oy,'#8c8f95');
  metal(ox0-16,oy-38,ox1-ox0+32,38,'#b8bbbf',3);
  for(var k=0;k<4;k++)box(ox0-12,oy-8+k*2,ox1-ox0+24,1,'rgba(0,0,0,.25)');
  var sy=top+(oy-38-top)/2;
  channel(label,mid,sy,62,6,1,'#fff3dc','rgba(255,236,200,.95)');
  light(mid,sy,(ox1-ox0)*.45,'255,236,205',.45);bloom(mid,sy,(ox1-ox0)*.32,'255,230,200',.12);refl(mid,(ox1-ox0)*.22,'255,236,205',.12);
  ao(X0,X1,G+30,30,.35);
}
function pendant(x,y0,len){
  var y=y0+len;box(x-.7,y0,1.4,len,'#151515');
  c.fillStyle=lgV(y,y+18,[[0,'#4a5a52'],[1,'#1c2622']]);c.beginPath();c.moveTo(x-6,y);c.lineTo(x+6,y);c.lineTo(x+22,y+18);c.lineTo(x-22,y+18);c.closePath();c.fill();
  EMIT.push(function(){ell(x,y+18,15,3.2,'#fff2d6')});
  bloom(x,y+20,70,'255,220,170',.32);light(x,y+70,320,'255,212,160',.62);spot(x,y+18,300,G-y-18,'255,220,170',.24);
}
function poster(x,y,w,h,k){
  if(k===9){c.fillStyle=lgV(y,y+h,[[0,'#3b2a6b'],[.45,'#e2585a'],[.62,'#ffb347'],[.63,'#2c5f8a'],[1,'#173a5c']]);c.fillRect(x,y,w,h);
    circ(x+w*.72,y+h*.56,h*.13,'#ffe2a0');c.fillStyle='rgba(255,226,160,.45)';for(var i=0;i<5;i++)c.fillRect(x+w*.62,y+h*(.66+i*.05),w*.2*(1-i*.15),h*.012);
    txt('YAZ FIRSATI',x+w*.3,y+h*.3,h*.17,'#ffffff',800);txt('%50',x+w*.3,y+h*.5,h*.26,'#ffd23f',800);
    box(x+w*.12,y+h*.82,w*.36,h*.06,'#ffd23f');return}
  var cols=[['#1a3a5c','#3fa7d6','#f4f0e6'],['#2d1e2f','#d84a5a','#f7d9a0'],['#183a2e','#6fbf73','#f1f5e8']][k%3];
  c.fillStyle=lgV(y,y+h,[[0,cols[0]],[1,mx(cols[0],-.3)]]);c.fillRect(x,y,w,h);
  circ(x+w*.68,y+h*.42,h*.26,cols[1]);box(x+w*.1,y+h*.66,w*.5,h*.08,cols[2]);box(x+w*.1,y+h*.8,w*.32,h*.05,cols[2]);
}


function boom(a,b,w,col){c.fillStyle=col;seg(a[0],a[1],b[0],b[1],w,w);
  var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,o=w*.3;
  c.fillStyle='rgba(0,0,0,.22)';seg(a[0]-nx*o,a[1]-ny*o,b[0]-nx*o,b[1]-ny*o,w*.38,w*.38);
  c.fillStyle='rgba(255,255,255,.35)';seg(a[0]+nx*o,a[1]+ny*o,b[0]+nx*o,b[1]+ny*o,2,2)}
function carton(x,y,w,h){c.fillStyle=lgV(y,y+h,[[0,'#c99a62'],[1,'#94693c']]);rr(x,y,w,h,2);c.fill();box(x,y+h*.4,w,5,'rgba(230,205,160,.8)');box(x+w*.62,y+h*.58,w*.28,h*.24,'#efe9de');box(x+w*.66,y+h*.64,w*.18,2,'#555')}

function walkers(t){
  if(reduce)return;
  var list=[[0,46,'#5a3a6a',1,{longHair:1,coat:'#6b4a3a',hair:'#2a1a12'}],[2600,40,'#2f5a6a',1,{cap:'#202024'}],[1300,52,'#6a4a2a',-1,{coat:'#2b3240',phone:1}]];
  for(var i=0;i<list.length;i++){var o=list[i],sp=o[1],x=o[3]>0?((t*sp+o[0])%5800)-500:5300-((t*sp+o[0])%5800);
    if(!seen(x-60,x+60))continue;
    var g=gait(t,sp*.11),opt={f:o[3],shirt:o[2],legs:g.legs,knees:g.knees,arms:g.arms,bob:g.bob,pants:'#2b2f3c'};
    for(var kk in o[4])opt[kk]=o[4][kk];
    if(opt.phone){opt.reach=[x+o[3]*14,G+22-150];}
    var h=person(x,G+22,opt);
    if(opt.phone){(function(px,py){EMIT.push(function(){box(px-3,py-12,7,12,'#bfe0ff')});light(px,py-6,60,'160,200,255',.4)})(h[0],h[1])}}
}


function lightPass(){
  var ls=dpr*LQ;
  lc.setTransform(1,0,0,1,0,0);lc.globalCompositeOperation='source-over';lc.fillStyle=AMB;lc.fillRect(0,0,lcv.width,lcv.height);
  lc.setTransform(ls*S,0,0,ls*S,ls*(vw/2-K.x*S),ls*(vh/2-K.y*S));lc.globalCompositeOperation='lighter';
  for(var i=0;i<LIGHTS.length;i++){var L=LIGHTS[i],g;
    if(L[0]===0){g=lc.createRadialGradient(L[1],L[2],0,L[1],L[2],L[3]);g.addColorStop(0,'rgba('+L[4]+','+L[5]+')');g.addColorStop(.4,'rgba('+L[4]+','+(L[5]*.45)+')');g.addColorStop(1,'rgba('+L[4]+',0)');
      lc.fillStyle=g;lc.fillRect(L[1]-L[3],L[2]-L[3],L[3]*2,L[3]*2)}
    else if(L[0]===1){for(var k=0;k<3;k++){var w=L[3]*(1-k*.25),a=L[6]*.4;g=lc.createLinearGradient(0,L[2],0,L[2]+L[4]);g.addColorStop(0,'rgba('+L[5]+','+a+')');g.addColorStop(1,'rgba('+L[5]+','+(a*.25)+')');
      lc.fillStyle=g;lc.beginPath();lc.moveTo(L[1]-8,L[2]);lc.lineTo(L[1]+8,L[2]);lc.lineTo(L[1]+w/2,L[2]+L[4]);lc.lineTo(L[1]-w/2,L[2]+L[4]);lc.closePath();lc.fill()}}
    else{lc.fillStyle='rgba('+L[5]+','+L[6]+')';lc.fillRect(L[1],L[2],L[3],L[4])}}
  c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='multiply';c.drawImage(lcv,0,0,wcv.width,wcv.height);c.globalCompositeOperation='destination-in';c.drawImage(mcv,0,0);c.globalCompositeOperation='source-over';
}
function glowPass(t){
  W(1);
  for(var i=0;i<EMIT.length;i++){EMIT[i]();}
  W(1);c.globalCompositeOperation='lighter';
  for(i=0;i<HAZE.length;i++){var h=HAZE[i],g=c.createLinearGradient(0,h[1],0,h[1]+h[3]);g.addColorStop(0,'rgba(255,205,150,'+(.09*NF)+')');g.addColorStop(1,'rgba(255,205,150,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(h[0]-10,h[1]);c.lineTo(h[0]+10,h[1]);c.lineTo(h[0]+h[2]/2,h[1]+h[3]);c.lineTo(h[0]-h[2]/2,h[1]+h[3]);c.closePath();c.fill()}
  for(i=0;i<BLOOM.length;i++){var b=BLOOM[i];g=c.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);g.addColorStop(0,'rgba('+b[3]+','+b[4]+')');g.addColorStop(1,'rgba('+b[3]+',0)');
    c.fillStyle=g;c.fillRect(b[0]-b[2],b[1]-b[2],b[2]*2,b[2]*2)}
  for(i=0;i<REFL.length;i++){var r=REFL[i],sh=reduce?0:Math.sin(t*1.7+r[0]*.01)*2;
    c.save();c.translate(r[0]+sh,R+4);c.scale(r[1]/100,1.5);g=c.createRadialGradient(0,0,0,0,0,100);g.addColorStop(0,'rgba('+r[2]+','+r[3]+')');g.addColorStop(1,'rgba('+r[2]+',0)');
    c.fillStyle=g;c.fillRect(-100,0,200,100);c.restore()}
  c.globalCompositeOperation='source-over';
}


/* ---------- kamera: zaman çizelgesi ---------- */
var keys=[];
function buildKeys(){
  var wv=vw/(vh/1000), zW=Math.min(1,wv/1250), wide=vw>760;
  function off(z){var sc=(vh/1000)*z;return wide?[-(vw*.17)/sc,0]:[0,(vh*.17)/sc]}
  keys=[];
  for(var i=0;i<4;i++){
    var zd=zW*DZ[i],o0=off(zW),o1=off(zd),o2=off(zd*1.06),yW=G-(.7-.5)*1000/zW;
    keys.push({t:H[i],x:SC[i]+o0[0],y:yW+o0[1],z:zW});
    keys.push({t:H[i]+2.3,x:DT[i][0]+o1[0],y:DT[i][1]+o1[1],z:zd});
    keys.push({t:E[i]-2,x:DT[i][0]+o2[0]+45,y:DT[i][1]+o2[1],z:zd*1.06});
    keys.push({t:E[i],x:SC[i]+o0[0]+(i<3?190:60),y:yW+o0[1],z:zW*(i<3?.94:.9)});
  }
}
function cam(t){
  var n=keys.length;if(t<=keys[0].t)return keys[0];if(t>=keys[n-1].t)return keys[n-1];
  var i=0;while(i<n-2&&t>keys[i+1].t)i++;
  var a=keys[i],b=keys[i+1],dt=b.t-a.t,u=(t-a.t)/dt,u2=u*u,u3=u2*u;
  var h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
  function tg(k,f){if(k<=0||k>=n-1)return 0;return (f(keys[k+1])-f(keys[k-1]))/(keys[k+1].t-keys[k-1].t)}
  function hm(f){return h00*f(a)+h10*dt*tg(i,f)+h01*f(b)+h11*dt*tg(i+1,f)}
  return {x:hm(function(k){return k.x}),y:hm(function(k){return k.y}),z:Math.exp(hm(function(k){return Math.log(k.z)}))};
}
function W(f){c.setTransform(dpr*S,0,0,dpr*S,dpr*(vw/2-K.x*f*S),dpr*(vh/2-K.y*S))}
function seen(x0,x1){return x1>VX0-60&&x0<VX1+60}
function lerp(a,b,u){return a+(b-a)*u}
function wheel(x,y,r,rot){rot=rot||0;circ(x,y,r,'#141416');c.fillStyle=lgV(y-r*.6,y+r*.6,[[0,'#e0e3e8'],[1,'#6a6d73']]);c.beginPath();c.arc(x,y,r*.58,0,TAU);c.fill();
  circ(x,y,r*.2,'#3a3b40');for(var k=0;k<5;k++)circ(x+Math.cos(k*1.2566+rot)*r*.36,y+Math.sin(k*1.2566+rot)*r*.36,1.8,'#2a2b2f')}
function blob(x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}

/* ---------- gökyüzü: gündüzden geceye ---------- */
var clouds=[];(function(){var r=rng(77);for(var i=0;i<10;i++)clouds.push([-1600+i*820+r()*380,180+r()*160,.7+r()*.7])})();
function skyDay(t){
  c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle=lgV(0,vh,[[0,'#6aa3d5'],[.5,'#a6c9e3'],[.82,'#e3dccb'],[1,'#ecd3b1']]);c.fillRect(0,0,vw,vh);
  var sx=vw*.8,sy=vh*.13,sr=Math.max(14,vh*.03),g=c.createRadialGradient(sx,sy,sr*.6,sx,sy,sr*10);
  g.addColorStop(0,'rgba(255,246,220,.85)');g.addColorStop(1,'rgba(255,246,220,0)');c.fillStyle=g;c.fillRect(sx-sr*10,sy-sr*10,sr*20,sr*20);circ(sx,sy,sr,'#fffbef');
  W(.15);
  for(var i=0;i<clouds.length;i++){var q=clouds[i],x=q[0]+t*7,y=q[1],s=q[2];
    c.fillStyle=lgV(y-50*s,y+24*s,[[0,'rgba(255,255,255,.96)'],[1,'rgba(208,218,234,.9)']]);
    blob(x,y,95*s,22*s);blob(x-44*s,y-10*s,42*s,28*s);blob(x+16*s,y-22*s,54*s,38*s);blob(x+62*s,y-6*s,40*s,24*s)}
  W(.35);c.fillStyle='#a4b3c6';
  for(i=0;i<far.length;i++){var b=far[i];c.fillRect(b[0],G-b[2],b[1],b[2]+600);if(b[4]>.8)c.fillRect(b[0]+b[1]*.4,G-b[2]-36,3,36)}
  mosque(1500);
  c.fillStyle='rgba(118,138,165,.55)';for(i=0;i<far.length;i++){var w=far[i][3];for(var j=0;j<w.length;j++)c.fillRect(w[j][0],w[j][1],7,10)}
  c.fillStyle=lgV(G-420,G+60,[[0,'rgba(228,232,236,0)'],[1,'rgba(234,226,212,.7)']]);c.fillRect(-6000,G-420,16000,480);
  W(.65);c.fillStyle='#8492a6';
  for(i=0;i<mid.length;i++){var m=mid[i];c.fillRect(m[0],G-m[2],m[1],m[2]+600);if(m[3]>.62)c.fillRect(m[0]+m[1]*.6,G-m[2]-40,3,40);if(m[3]<.3)c.fillRect(m[0]+18,G-m[2]-26,34,26)}
  c.fillStyle=lgV(G-260,G+40,[[0,'rgba(226,220,206,0)'],[1,'rgba(226,218,202,.6)']]);c.fillRect(-6000,G-260,16000,300);
}
function skyNight(t,A){
  c.setTransform(dpr,0,0,dpr,0,0);c.globalAlpha=A;
  c.fillStyle=lgV(0,vh,[[0,'#080b1a'],[.55,'#171a33'],[.85,'#2e2742'],[1,'#3d2f45']]);c.fillRect(0,0,vw,vh);
  for(var i=0;i<stars.length;i++){var s=stars[i];c.globalAlpha=A*(.25+.3*Math.sin(t*1.1+s[3]));circ(s[0]*vw,s[1]*vh,s[2],'#f4f0e6')}
  c.globalAlpha=A;
  var mxp=vw*.8,myp=vh*.13,mr=Math.max(10,vh*.022);
  var mg=c.createRadialGradient(mxp,myp,mr,mxp,myp,mr*7);mg.addColorStop(0,'rgba(220,225,255,.2)');mg.addColorStop(1,'rgba(220,225,255,0)');
  c.fillStyle=mg;c.fillRect(mxp-mr*7,myp-mr*7,mr*14,mr*14);circ(mxp,myp,mr,'#eef0f6');
  W(.35);
  c.fillStyle=lgV(G-500,G,[[0,'rgba(255,140,80,0)'],[1,'rgba(255,140,80,.16)']]);c.fillRect(-6000,G-500,16000,500);
  c.fillStyle='#1b1d2e';
  for(i=0;i<far.length;i++){var b=far[i];c.fillRect(b[0],G-b[2],b[1],b[2]+600);if(b[4]>.8)c.fillRect(b[0]+b[1]*.4,G-b[2]-36,3,36)}
  mosque(1500);
  for(i=0;i<far.length;i++){var w=far[i][3];for(var j=0;j<w.length;j++){c.fillStyle=w[j][2]<.7?'rgba(255,196,120,.5)':'rgba(190,215,255,.38)';c.fillRect(w[j][0],w[j][1],7,10)}}
  c.fillStyle=lgV(G-420,G+60,[[0,'rgba(90,80,110,0)'],[1,'rgba(95,80,105,.55)']]);c.fillRect(-6000,G-420,16000,480);
  W(.65);c.fillStyle='#111220';
  for(i=0;i<mid.length;i++){var m=mid[i];c.fillRect(m[0],G-m[2],m[1],m[2]+600);if(m[3]>.62)c.fillRect(m[0]+m[1]*.6,G-m[2]-40,3,40);if(m[3]<.3)c.fillRect(m[0]+18,G-m[2]-26,34,26)}
  c.fillStyle=lgV(G-260,G+40,[[0,'rgba(70,60,90,0)'],[1,'rgba(70,58,85,.5)']]);c.fillRect(-6000,G-260,16000,300);
  c.globalAlpha=1;
}
function backdrop(t){if(NF<1)skyDay(t);if(NF>0)skyNight(t,NF)}

/* ---------- müşteri dükkânı: DEFNE FIRIN ---------- */
var WORD=['D','E','F','N','E',' ','F','I','R','I','N'];
function letterX(x0,i){return x0+214+i*(492/(WORD.length-1))}
function wheat(x,y,s,col){c.strokeStyle=col;c.lineWidth=3*s;c.lineCap='round';c.beginPath();c.moveTo(x,y+30*s);c.quadraticCurveTo(x+3*s,y,x,y-28*s);c.stroke();
  c.fillStyle=col;for(var k=0;k<4;k++){var yy=y-22*s+k*11*s;c.beginPath();c.ellipse(x-6*s,yy,3.6*s,7.5*s,-.6,0,TAU);c.fill();c.beginPath();c.ellipse(x+6*s,yy,3.6*s,7.5*s,.6,0,TAU);c.fill()}
  c.beginPath();c.ellipse(x,y-33*s,3.4*s,7*s,0,0,TAU);c.fill()}
function awning(a,b,y){
  var w=34,n=Math.ceil((b-a)/w),k;
  for(k=0;k<n;k++){var x=a+k*w;c.fillStyle=k%2?'#efe6d2':'#2f5d46';c.fillRect(x,y,w,36);c.beginPath();c.arc(x+w/2,y+36,w/2,0,Math.PI);c.fill()}
  c.fillStyle=lgV(y,y+36,[[0,'rgba(0,0,0,.3)'],[.4,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.12)']]);c.fillRect(a,y,n*w,36);
  metal(a-6,y-7,n*w+12,9,'#3a3d44',2);
}
function oldSign(X0){
  c.save();c.translate(X0+400,494);c.rotate(-.01);
  c.fillStyle=lgV(-46,46,[[0,'#a39d90'],[1,'#7b756a']]);c.fillRect(-330,-46,660,92);
  var r=rng(91),k;for(k=0;k<14;k++){var x=-320+r()*640,w=4+r()*8;c.fillStyle=lgV(-40,40,[[0,'rgba(110,62,32,.5)'],[1,'rgba(110,62,32,0)']]);c.fillRect(x,-44+r()*20,w,40+r()*40)}
  c.strokeStyle='#5f594f';c.lineWidth=4;c.strokeRect(-330,-46,660,92);
  c.globalAlpha=.6;var L=[['F',-128],['I',-64],['I',62],['N',124]];for(k=0;k<L.length;k++)txt(L[k][0],L[k][1],2,86,'#a3473a',800);
  c.globalAlpha=.15;txt('R',0,2,86,'#3a2a25',800);c.globalAlpha=1;
  c.fillStyle='#d6d0c2';c.beginPath();c.moveTo(330,-46);c.lineTo(246,-46);c.lineTo(330,12);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.moveTo(246,-46);c.lineTo(330,12);c.lineTo(322,16);c.lineTo(240,-40);c.closePath();c.fill();
  c.fillStyle=lgV(20,46,[[0,'rgba(40,30,20,0)'],[1,'rgba(40,30,20,.35)']]);c.fillRect(-330,20,660,26);
  c.restore();
  c.strokeStyle='#1e1e20';c.lineWidth=2.4;c.beginPath();c.moveTo(X0+700,540);c.bezierCurveTo(X0+714,580,X0+690,598,X0+708,640);c.stroke();
}
function newSign(X0,lit){
  c.fillStyle=lgV(446,542,[[0,'#3a6a52'],[.05,'#264a39'],[1,'#132619']]);rr(X0+66,446,668,96,3);c.fill();box(X0+66,446,668,2,'rgba(255,255,255,.3)');
  for(var k=0;k<4;k++)metal(X0+120+k*180,542,10,10,'#5a5d63',1);
  var l0=lit[0];wheat(X0+128,496,1.05,'#476b58');
  if(l0>0){EMIT.push(function(){c.save();c.globalAlpha=l0;c.shadowColor='rgba(255,200,110,1)';c.shadowBlur=14*S*dpr;wheat(X0+128,496,1.05,'#ffd98a');c.restore()});light(X0+128,494,140,'255,200,120',.4*l0)}
  for(var i=0;i<WORD.length;i++){if(WORD[i]===' ')continue;var lx=letterX(X0,i),on=lit[i];
    channel(WORD[i],lx,496,80,7,on,'#fff1d6','rgba(255,214,150,1)');
    if(on>0){light(lx,496,170,'255,206,140',.5*on);bloom(lx,496,80,'255,200,130',.2*on);refl(lx,30,'255,200,140',.16*on)}}
}
function clientShop(X0,mode,lit,t){
  var X1=X0+800,i,k;
  if(!seen(X0-30,X1+30))return;
  c.fillStyle=PAT.plaster;c.fillRect(X0,240,800,G-240);
  c.fillStyle='rgba(205,150,92,.32)';c.fillRect(X0,240,800,G-240);
  c.fillStyle=lgH(X0,X1,[[0,'rgba(0,0,0,.35)'],[.05,'rgba(0,0,0,0)'],[.95,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);c.fillRect(X0,240,800,G-240);
  c.fillStyle=lgV(220,248,[[0,'#f1e8d8'],[.5,'#d2c6b0'],[1,'#8c8270']]);c.fillRect(X0-14,220,828,28);
  c.fillStyle=lgV(248,272,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);c.fillRect(X0,248,800,24);
  for(i=0;i<4;i++)(function(wx,wy,ww,wh,lit2){
    for(var k=0;k<2;k++){var sx=k?wx+ww+4:wx-30;c.fillStyle=lgH(sx,sx+26,[[0,'#2f4a3b'],[.5,'#46695a'],[1,'#2f4a3b']]);c.fillRect(sx,wy-2,26,wh+4);
      c.fillStyle='rgba(0,0,0,.22)';for(var s2=0;s2<14;s2++)c.fillRect(sx+3,wy+4+s2*8,20,2)}
    box(wx-4,wy-6,ww+8,wh+10,'#e9e1d2');
    c.fillStyle=lgV(wy,wy+wh,[[0,'#a8bfd2'],[.5,'#6b8399'],[1,'#3d4b5a']]);c.fillRect(wx+3,wy+3,ww-6,wh-6);
    c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.moveTo(wx+20,wy+3);c.lineTo(wx+38,wy+3);c.lineTo(wx+12,wy+wh-3);c.lineTo(wx+3,wy+wh-3);c.lineTo(wx+3,wy+50);c.closePath();c.fill();
    box(wx+ww/2-2,wy+3,4,wh-6,'#e9e1d2');box(wx+3,wy+46,ww-6,3,'#e9e1d2');
    if(lit2&&NF>.05){EMIT.push(function(){c.globalAlpha=NF;c.fillStyle=lgV(wy,wy+wh,[[0,'rgba(255,212,150,.95)'],[1,'rgba(255,168,92,.85)']]);c.fillRect(wx+3,wy+3,ww-6,wh-6);
      box(wx+ww/2-2,wy+3,4,wh-6,'#8a7a66');box(wx+3,wy+46,ww-6,3,'#8a7a66');c.globalAlpha=1});light(wx+ww/2,wy+wh/2,190,'255,180,110',.45*NF)}
    c.fillStyle=lgV(wy+wh+4,wy+wh+12,[[0,'#ece4d6'],[1,'#9c927f']]);c.fillRect(wx-10,wy+wh+4,ww+20,8);
    box(wx,wy+wh+12,ww,14,'#7a4a30');
    for(k=0;k<9;k++){circ(wx+6+k*9.5,wy+wh+10-(k%2)*3,5,'#3f6b35');circ(wx+6+k*9.5,wy+wh+6-(k%3),3.2,['#d6334a','#f2a1b3','#ffffff'][k%3])}
  })(X0+92+i*170,282,86,116,i===1||i===2);
  c.fillStyle=lgV(420,432,[[0,'#ddd2bd'],[1,'#9a8f7b']]);c.fillRect(X0-6,420,812,12);
  if(mode==='old')oldSign(X0);else newSign(X0,lit);
  // vitrin
  box(X0+50,552,700,G-552,'#22302a');
  var ix0=X0+70,ix1=X0+566,iy0=604;
  c.fillStyle=lgV(iy0,G,[[0,'#e9cba2'],[1,'#b38657']]);c.fillRect(ix0,iy0,ix1-ix0,G-iy0);
  for(k=0;k<2;k++){var sy=652+k*42;box(ix0+10,sy,ix1-ix0-20,5,'#7a5434');
    for(var b=0;b<10;b++){var bx=ix0+30+b*46;
      if((b+k)%3===0){c.strokeStyle='#a0612a';c.lineWidth=6;c.beginPath();c.ellipse(bx,sy-12,12,9,0,0,TAU);c.stroke();c.strokeStyle='rgba(255,236,190,.6)';c.lineWidth=1.5;c.beginPath();c.ellipse(bx,sy-14,12,8,0,3.6,5.8);c.stroke()}
      else{c.fillStyle=lgV(sy-24,sy,[[0,'#d99a55'],[1,'#8a5426']]);c.beginPath();c.ellipse(bx,sy-11,19,11,0,0,TAU);c.fill();
        c.strokeStyle='rgba(255,230,180,.6)';c.lineWidth=1.6;for(var q=-1;q<=1;q++){c.beginPath();c.moveTo(bx+q*8-4,sy-17);c.lineTo(bx+q*8+4,sy-8);c.stroke()}}}}
  person(ix0+330,G-4,{f:-1,shirt:'#f3efe7',pants:'#3a3a40',chef:1,apron:'#e9e4da',noShadow:1,arms:[[.9,-.9],[.7,-.8]],bob:Math.sin(t*1.2)*.6});
  c.fillStyle=lgV(738,G,[[0,'#6a4a32'],[1,'#3a281b']]);c.fillRect(ix0,738,ix1-ix0,G-738);
  box(ix0,732,ix1-ix0,7,'#d9d2c4');
  c.fillStyle='rgba(200,225,240,.25)';c.fillRect(ix0+20,700,ix1-ix0-40,32);box(ix0+20,699,ix1-ix0-40,2,'rgba(255,255,255,.5)');
  for(k=0;k<14;k++)ell(ix0+42+k*31,724,11,6,['#e8b06a','#c47a3a','#f2d9a6'][k%3]);
  wash(ix0,iy0,ix1-ix0,G-iy0,'255,214,165',.55);pendant(ix0+130,iy0,14);pendant(ix0+370,iy0,14);
  c.save();c.beginPath();c.rect(ix0,iy0,ix1-ix0,G-iy0);c.clip();
  c.fillStyle='rgba(170,195,225,.1)';c.fillRect(ix0,iy0,ix1-ix0,G-iy0);
  c.fillStyle='rgba(255,255,255,.08)';for(k=0;k<3;k++){var gx=ix0+80+k*160;c.beginPath();c.moveTo(gx,iy0);c.lineTo(gx+40,iy0);c.lineTo(gx-30,G);c.lineTo(gx-70,G);c.closePath();c.fill()}
  c.fillStyle=lgV(iy0,iy0+50,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);c.fillRect(ix0,iy0,ix1-ix0,50);
  c.restore();
  box(ix0+246,iy0,5,G-iy0,'#22302a');
  var dx=X0+590;box(dx,600,112,G-600,'#22302a');c.fillStyle=lgV(608,G,[[0,'#c9a27a'],[1,'#7a5636']]);c.fillRect(dx+8,608,96,G-608);
  c.fillStyle='rgba(190,215,235,.18)';c.fillRect(dx+8,608,96,G-608);metal(dx+86,690,5,60,'#c9ccd2',2);
  c.strokeStyle='#333';c.lineWidth=1;c.beginPath();c.moveTo(dx+56,612);c.lineTo(dx+34,632);c.moveTo(dx+56,612);c.lineTo(dx+78,632);c.stroke();
  c.fillStyle='#f4ecd8';rr(dx+24,632,64,24,3);c.fill();txt('AÇIK',dx+56,645,16,'#2f5d46',800);
  metal(X0+712,552,30,G-552,'#cfc6b4');
  awning(X0+58,X0+574,556);
  ao(X0,X1,G+30,30,.35);
  light((ix0+ix1)/2,G+14,300,'255,205,150',.4);refl((ix0+ix1)/2,120,'255,210,160',.14);
}

/* ---------- 01 İHTİYAÇ ANALİZİ ---------- */
function dimH(xa,xb,y,label,a){EMIT.push(function(){c.globalAlpha=a;c.strokeStyle='#ffc21a';c.lineWidth=2.4;c.lineCap='butt';c.beginPath();c.moveTo(xa,y);c.lineTo(xb,y);c.moveTo(xa,y-9);c.lineTo(xa,y+9);
  if(label){c.moveTo(xb,y-9);c.lineTo(xb,y+9)}c.stroke();
  if(label){var m=(xa+xb)/2;c.fillStyle='#17161a';rr(m-40,y-15,80,30,4);c.fill();c.strokeStyle='#ffc21a';c.lineWidth=1.5;c.stroke();txt(label,m,y+1,21,'#ffc21a',700)}c.globalAlpha=1})}
function dimV(x,ya,yb,label,a){EMIT.push(function(){c.globalAlpha=a;c.strokeStyle='#ffc21a';c.lineWidth=2.4;c.beginPath();c.moveTo(x,ya);c.lineTo(x,yb);c.moveTo(x-9,ya);c.lineTo(x+9,ya);
  if(label){c.moveTo(x-9,yb);c.lineTo(x+9,yb)}c.stroke();
  if(label){var m=(ya+yb)/2;c.fillStyle='#17161a';rr(x+12,m-15,80,30,4);c.fill();c.strokeStyle='#ffc21a';c.lineWidth=1.5;c.stroke();txt(label,x+52,m+1,21,'#ffc21a',700)}c.globalAlpha=1})}
var CONS={shirt:'#262a35',stripe:'#ffc21a',pants:'#2b2f3c',hair:'#2a1d16'};
function cons(x,y,o){var q={};for(var k in CONS)q[k]=CONS[k];for(k in o)q[k]=o[k];return person(x,y,q)}
function tabletFlat(h){c.fillStyle='#1b1c20';rr(h[0]-6,h[1]-6,32,5,1.5);c.fill();EMIT.push(function(){box(h[0]-4,h[1]-6,28,1.4,'#7fd0ff')})}
function scene1(t){
  var x0=SHOP1;
  clientShop(x0,'old',null,t);
  if(t>9||!seen(x0-100,x0+900))return;
  var lt=t-H[0],hp=sm((lt-.8)/2.2),vp=sm((lt-3.3)/1.3),fade=1-sm((lt-7.2)/.6);
  if(hp>0)dimH(x0+70,x0+70+664*hp,426,hp>.99?'6,64 m':null,fade);
  if(vp>0)dimV(x0+756,446,446+96*vp,vp>.99?'0,96 m':null,fade);
  var px=x0+24,py=G+20,tg=null,hand;
  if(lt>.7&&lt<3.1)tg=[x0+70+664*hp,426];else if(lt>3.2&&lt<4.7)tg=[x0+756,446+96*vp];
  if(tg){var sx=px+3,sy=py-140,ddx=tg[0]-sx,ddy=tg[1]-sy,d=Math.hypot(ddx,ddy);
    hand=cons(px,py,{f:1,reach:[sx+ddx/d*54,sy+ddy/d*54],arms:[[0,0],[.35,-.6]]});
    var ang=Math.atan2(ddy,ddx);c.save();c.translate(hand[0],hand[1]);c.rotate(ang);c.fillStyle='#f2b705';rr(-6,-5,22,10,2);c.fill();box(12,-3,4,6,'#1b1b1d');c.restore();
    var lx=hand[0]+Math.cos(ang)*16,ly=hand[1]+Math.sin(ang)*16,T2=tg;
    EMIT.push(function(){c.strokeStyle='rgba(255,40,40,.8)';c.lineWidth=1.4;c.beginPath();c.moveTo(lx,ly);c.lineTo(T2[0],T2[1]);c.stroke();circ(T2[0],T2[1],3.6,'#ff3b30');circ(T2[0],T2[1],1.6,'#ffe0da')});
    bloom(tg[0],tg[1],28,'255,40,40',1);
  }else if(lt>=4.9&&lt<6.9){
    hand=cons(px,py,{f:1,reach:[px+44,py-184],arms:[[0,0],[.2,-.3]]});
    c.fillStyle='#1b1c20';rr(hand[0]-1,hand[1]-30,8,34,2);c.fill();
    var fl=Math.max(0,1-Math.abs(lt-5.5)/.14);if(fl>0){bloom(hand[0]+12,hand[1]-14,180,'255,255,255',fl*2.4);light(hand[0]+60,hand[1]-40,400,'255,255,255',fl*.6)}
  }else{
    hand=cons(px,py,{f:1,reach:[px+26,py-104],arms:[[0,0],[.3,-.6]]});tabletFlat(hand);
  }
  var pointing=lt>.4&&lt<2.6,nod=lt>5.2&&lt<7.2?Math.sin(lt*9)*1.3:0;
  person(x0+655,py,{f:-1,shirt:'#f3efe7',pants:'#3a3a40',chef:1,apron:'#e8e3d8',hair:'#3b2b20',reach:pointing?[x0+606,py-218]:null,arms:pointing?[[0,0],[.15,-.3]]:[[.25,-.9],[.2,-.8]],bob:nod});
}

/* ---------- 02 TASARIM ---------- */
function chair(px){rr(px-34,766,58,8,3);c.fillStyle='#2a2b30';c.fill();box(px-8,774,6,30,'#3a3b40');box(px-30,804,50,4,'#2a2b30');circ(px-28,812,3,'#111');circ(px+18,812,3,'#111');rr(px+20,700,10,70,4);c.fillStyle='#2a2b30';c.fill()}
function miniFacade(x,y,w,h,isNew){box(x,y,w,h,'#d9c3a3');box(x,y+h*.6,w,h*.4,'#24302a');box(x+w*.08,y+h*.66,w*.55,h*.3,'#d8b386');box(x+w*.7,y+h*.66,w*.18,h*.34,'#8a6a48');
  for(var k=0;k<3;k++)box(x+w*.12+k*w*.28,y+h*.08,w*.14,h*.22,'#6b8399');
  box(x+w*.06,y+h*.38,w*.88,h*.18,isNew?'#264a39':'#9a9488');if(isNew){c.fillStyle='#fff1d6';c.font='800 '+(h*.13)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('DEFNE FIRIN',x+w*.55,y+h*.475)}}
function curPos(lt,P){var i=0;while(i<P.length-2&&lt>P[i+1][0])i++;var a=P[i],b=P[i+1],u=sm((lt-a[0])/(b[0]-a[0]));return [lerp(a[1],b[1],u),lerp(a[2],b[2],u)]}
function designUI(x,y,w,h,lt,t){
  box(x,y,w,h,'#1c1f26');box(x,y,w,7,'#2b2f39');for(var k=0;k<3;k++)circ(x+5+k*5,y+3.5,1.4,['#ff5f57','#febc2e','#28c840'][k]);
  box(x,y+7,10,h-7,'#252932');for(k=0;k<6;k++)box(x+3,y+12+k*9,4,4,k===2?'#ffc21a':'#5a6070');
  box(x+w-26,y+7,26,h-7,'#252932');
  var ax=x+14,ay=y+11,aw=w-44,ah=h-15;box(ax,ay,aw,ah,'#eceef1');
  var fx=ax+5,fy=ay+4,fw=aw-10,fh=ah-6;box(fx,fy,fw,fh,'#d9c3a3');for(k=0;k<4;k++)box(fx+fw*.07+k*fw*.24,fy+fh*.06,fw*.13,fh*.16,'#8ea3b6');
  box(fx,fy+fh*.62,fw,fh*.38,'#24302a');box(fx+fw*.06,fy+fh*.68,fw*.6,fh*.32,'#d8b386');box(fx+fw*.72,fy+fh*.68,fw*.16,fh*.32,'#8a6a48');
  var cols=['#264a39','#1e3557','#6e2430'],ci=lt<4.2?0:lt<4.7?1:lt<5.2?2:0,pc=cols[ci];
  var px=fx+fw*.04,py=fy+fh*.3,pw=fw*.92,ph=fh*.26,pa=sm((lt-.4)/.5);
  if(pa>0)box(px,py,pw*pa,ph,pc);
  var n=Math.floor(cl((lt-1)/2.6,0,1)*11+.001),s='';for(k=0;k<n;k++)s+=WORD[k];
  c.font='800 '+(ph*.66)+'px '+FONT;c.textAlign='left';c.textBaseline='middle';var tx=px+ph*1.0,tw=c.measureText(s).width;
  if(n>0){c.fillStyle='#fff1d6';c.fillText(s,tx,py+ph*.55)}
  if(lt>.9&&lt<3.8&&Math.sin(t*12)>0)box(tx+tw+1,py+ph*.18,1,ph*.64,'#ffc21a');
  if(lt>3.6)wheat(px+ph*.5,py+ph*.56,ph/76,'#ffd98a');
  if(lt>3.8&&lt<5.5){c.setLineDash([2,2]);c.strokeStyle='#3b82f6';c.lineWidth=.8;c.strokeRect(px-1.5,py-1.5,pw+3,ph+3);c.setLineDash([]);
    var hs=[[px,py],[px+pw,py],[px,py+ph],[px+pw,py+ph]];for(k=0;k<4;k++){box(hs[k][0]-2,hs[k][1]-2,4,4,'#ffffff');c.strokeStyle='#3b82f6';c.strokeRect(hs[k][0]-2,hs[k][1]-2,4,4)}}
  var swx=x+w-19,sw=[];for(k=0;k<4;k++){var sy=y+14+k*11;sw.push(sy);box(swx,sy,12,8,k<3?cols[k]:'#fff1d6');if(k===ci&&lt>3.9){c.strokeStyle='#ffffff';c.lineWidth=1;c.strokeRect(swx-1,sy-1,14,10)}}
  for(k=0;k<3;k++)box(x+w-22,y+h-34+k*6,18,2,'#4a5060');
  var bx=x+w-24,by=y+h-12,ok=lt>5.8;
  c.fillStyle=ok?'#36c47a':'#2fb36b';rr(bx,by,22,9,2);c.fill();txt('ONAY',bx+11,by+5,6.5,'#ffffff',700);
  if(ok){var sc2=Math.min(1,(lt-5.8)/.25),o2=sm((lt-5.8)/.3);c.save();c.globalAlpha=o2;c.translate(ax+aw/2,ay+ah*.82);c.scale(.6+.4*sc2,.6+.4*sc2);
    c.fillStyle='#2fb36b';rr(-34,-9,68,18,4);c.fill();txt('✓ ONAYLANDI',0,1,11,'#ffffff',800);c.restore()}
  var cp=curPos(lt,[[0,ax+aw*.7,ay+ah*.85],[.8,px+8,py+ph*.5],[3.6,tx+tw+4,py+ph*.6],[4.2,swx+6,sw[1]+4],[4.7,swx+6,sw[2]+4],[5.2,swx+6,sw[0]+4],[5.8,bx+12,by+5],[9,bx+12,by+5]]);
  var cx=cp[0],cy=cp[1];c.fillStyle='#ffffff';c.strokeStyle='#111';c.lineWidth=.6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy+9);c.lineTo(cx+2.4,cy+6.8);c.lineTo(cx+4.4,cy+10.6);c.lineTo(cx+5.8,cy+9.9);c.lineTo(cx+3.9,cy+6.2);c.lineTo(cx+7,cy+6.2);c.closePath();c.fill();c.stroke();
}
function studio(t){
  var X0=1500,X1=2340,top=330,k,lt=t-H[1];
  if(!seen(X0-20,X1+20))return;
  shopBack(X0,X1,top,'plaster','rgba(70,100,130,.2)');
  // pano
  c.fillStyle=lgV(520,646,[[0,'#c18f60'],[1,'#a47448']]);c.fillRect(1572,520,186,126);c.strokeStyle='#6a4a30';c.lineWidth=5;c.strokeRect(1572,520,186,126);
  box(1584,530,64,46,'#f4f0e6');miniFacade(1587,533,58,40,false);circ(1616,532,2.4,'#d6334a');
  for(k=0;k<2;k++){c.save();c.translate(1664+k*44,540);c.rotate(k?.05:-.04);box(-2,-6,40,52,'#fbf8f1');c.strokeStyle='#8a8f9c';c.lineWidth=1;
    for(var q=0;q<5;q++){c.beginPath();c.moveTo(4,4+q*8);c.lineTo(30-q*3,4+q*8);c.stroke()}c.strokeRect(6,30,26,10);c.restore();circ(1682+k*44,536,2.4,'#2e6bd6')}
  var sw=['#264a39','#fff1d6','#d9a33a','#1e3557','#6e2430'];for(k=0;k<5;k++){box(1590+k*16,592,12,24,sw[k]);box(1590+k*16,612,12,6,'#ffffff')}
  box(1680,598,64,40,'#fbf8f1');miniFacade(1683,601,58,34,true);circ(1712,600,2.4,'#d6334a');
  for(k=0;k<2;k++){var fx=2150+k*96;box(fx,512,84,58,'#1c1c20');poster(fx+4,516,76,50,k)}
  // bitki
  c.fillStyle=lgV(770,G,[[0,'#d8d2c6'],[1,'#a49e92']]);c.fillRect(2268,770,44,50);
  c.fillStyle='#3f6b35';for(k=0;k<9;k++){c.save();c.translate(2290,772);c.rotate(-1.2+k*.3);c.beginPath();c.ellipse(0,-34,7,30,0,0,TAU);c.fill();c.restore()}
  // yan masa + plotter kâğıtları
  box(1570,744,150,7,'#e4ddd0');metal(1576,751,5,62,'#8a8d93');metal(1710,751,5,62,'#8a8d93');
  c.fillStyle='#f6f3ec';c.save();c.translate(1600,740);c.rotate(-.04);c.fillRect(0,-6,90,6);c.restore();cylV(1690,700,14,40,'#f2efe8');
  // ana masa
  c.fillStyle=lgV(742,752,[[0,'#ece6da'],[1,'#b8b0a2']]);c.fillRect(1780,742,300,9);metal(1786,751,6,62,'#8a8d93');metal(2068,751,6,62,'#8a8d93');
  box(1900,720,10,22,'#2a2b30');box(1880,738,50,4,'#2a2b30');
  rr(1818,630,174,96,3);c.fillStyle='#121317';c.fill();
  EMIT.push(function(){designUI(1822,634,166,88,lt,t)});
  light(1905,680,220,'170,200,255',.55);bloom(1905,680,90,'170,200,255',.15);
  box(1856,736,64,5,'#d9d9dc');rr(1946,734,34,6,2);c.fillStyle='#2a2b30';c.fill();
  cylV(2040,722,16,20,'#ffc21a');
  // tasarımcı + sanat yönetmeni
  chair(2016);
  var wob=reduce?0:Math.sin(t*3)*2;
  person(2016,856,{f:-1,shirt:'#5a2f3a',hair:'#1a1310',longHair:1,legs:SIT.legs,knees:SIT.knees,noShadow:1,reach:[1966+wob,733],arms:[[0,0],[.8,-1.5]]});
  shade(2000,G,40,5,.35);
  var point=lt>3.9&&lt<6;
  person(1748,G,{f:1,shirt:'#2f4a6a',hair:'#3a2a20',reach:point?[1830,672]:[1772,736],arms:[[0,0],[.6,-1.6]],bob:Math.sin(t*1.3)*.5});
  pendant(1640,476,40);pendant(1905,476,40);pendant(2170,476,40);
  shopFront(X0,X1,top,'TASARIM');
}

/* ---------- 03 ÜRETİM ---------- */
function cnc(lt,t){
  var prog=cl((lt-.6)/6.2,0,1),k;
  metal(2800,742,14,78,'#4a4d54');metal(3076,742,14,78,'#4a4d54');metal(2796,806,298,8,'#3a3c42',2);
  c.fillStyle=lgV(686,738,[[0,'#7a7d84'],[1,'#4a4d54']]);c.beginPath();c.moveTo(2812,686);c.lineTo(3078,686);c.lineTo(3094,738);c.lineTo(2796,738);c.closePath();c.fill();
  c.save();c.beginPath();c.moveTo(2818,690);c.lineTo(3072,690);c.lineTo(3084,734);c.lineTo(2806,734);c.closePath();c.clip();
  c.fillStyle=lgV(690,734,[[0,'#d9d2c2'],[1,'#f2ecdf']]);c.fillRect(2800,686,300,52);
  var cutX=-132+264*prog;
  c.translate(2945,712);c.scale(1,.34);
  c.save();c.beginPath();c.rect(-160,-80,160+cutX,160);c.clip();
  c.font='800 120px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#cfc7b4';c.fillText('DEFNE',0,6);c.lineWidth=4;c.strokeStyle='#3a3630';c.strokeText('DEFNE',0,6);
  c.restore();c.restore();
  metal(2790,736,310,14,'#3a3d44',2);box(2796,742,298,2,'#ffc21a');
  var sx=2945+cutX,cut=prog>0&&prog<1,zz=cut?6:0,wob=cut&&!reduce?Math.sin(t*14)*2.5:0;
  metal(2806,628,284,10,'#5a5d64',2);
  metal(sx-7,628,14,62,'#c9ccd2',2);
  metal(sx-22,646,44,30,'#e6e7e9',4);box(sx-22,664,44,3,'#ffc21a');
  cylV(sx-7,676,14,14+zz+wob,'#9aa0aa');box(sx-1.5,690+zz+wob,3,8,'#d9dde2');
  c.strokeStyle='#26272b';c.lineWidth=6;c.beginPath();c.moveTo(sx+14,650);c.quadraticCurveTo(sx+40,600,3090,610);c.stroke();
  EMIT.push(function(){box(sx-14,670,6,2,'#8fdcff')});light(sx,700,90,'200,225,255',.45);
  if(cut&&!reduce){for(k=0;k<14;k++){var ph=(t*2.2+k/14)%1,a=k*2.4,r=ph*34;circ(sx+Math.cos(a)*r,698+zz-Math.abs(Math.sin(a))*r*.7+ph*ph*30,1.6*(1-ph)+.6,'rgba(236,230,214,'+(1-ph).toFixed(2)+')')}}
  metal(3100,640,46,120,'#d2d4d7',4);
  EMIT.push(function(){box(3106,648,34,24,'#0f1418');c.strokeStyle='#5fe08a';c.lineWidth=1;c.beginPath();for(var i=0;i<=20;i++){var px=3108+i*1.5,py=660+Math.sin(i*.9)*6;if(i)c.lineTo(px,py);else c.moveTo(px,py)}c.stroke();
    box(3108,650,30*prog,2,'#ffc21a')});
  light(3123,660,60,'120,255,160',.3);circ(3123,700,6,'#d33');circ(3123,700,3.5,'#f55');
}
function ledLetter(cx,cy,on){
  var P=[[-26,40],[-26,-40],[26,40],[26,-40]];
  c.lineJoin='miter';c.lineCap='butt';
  c.strokeStyle='#9da1a8';c.lineWidth=20;c.beginPath();c.moveTo(cx+P[0][0],cy+P[0][1]);for(var k=1;k<4;k++)c.lineTo(cx+P[k][0],cy+P[k][1]);c.stroke();
  c.strokeStyle='#202126';c.lineWidth=13;c.stroke();
  var pts=[],seg2=[[0,1],[1,2],[2,3]];
  for(k=0;k<3;k++){var a=P[seg2[k][0]],b=P[seg2[k][1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(L/11);for(var j=0;j<n;j++)pts.push([cx+a[0]+(b[0]-a[0])*j/n,cy+a[1]+(b[1]-a[1])*j/n])}
  for(k=0;k<pts.length;k++)box(pts[k][0]-2.5,pts[k][1]-1.5,5,3,'#e6e6e6');
  var nOn=Math.floor(on*pts.length);
  if(nOn>0){EMIT.push(function(){c.save();c.shadowColor='rgba(255,255,255,1)';c.shadowBlur=6*S*dpr;for(var i=0;i<nOn;i++)box(pts[i][0]-2,pts[i][1]-1.2,4,2.4,'#ffffff');c.restore()});
    light(cx,cy,130*on+30,'235,240,255',.6*on);bloom(cx,cy,70,'240,245,255',.25*on)}
}
function rackLetter(ch,x,y,size){c.font='800 '+size+'px '+FONT;c.textAlign='center';c.textBaseline='alphabetic';
  for(var d=6;d>=1;d--){c.fillStyle=d===1?'#8c8f95':'#5a5d63';c.fillText(ch,x+d*.6,y+d*.4)}c.fillStyle='#f1ead8';c.fillText(ch,x,y)}
function workshop(t){
  var X0=2700,X1=3540,top=330,k,lt=t-H[2];
  if(!seen(X0-20,X1+20))return;
  shopBack(X0,X1,top,'corr','rgba(40,44,56,.32)');
  c.fillStyle='#c9b48a';c.fillRect(2790,508,160,96);c.fillStyle='rgba(0,0,0,.25)';for(k=0;k<9;k++)for(var j=0;j<5;j++)c.fillRect(2798+k*17,516+j*18,2.4,2.4);
  c.fillStyle='#2a2b30';c.fillRect(2806,522,6,40);c.fillRect(2800,520,18,8);c.fillRect(2830,524,4,36);c.fillRect(2826,558,12,6);
  c.beginPath();c.arc(2870,546,14,0,TAU);c.lineWidth=4;c.strokeStyle='#c8352a';c.stroke();c.fillRect(2902,520,6,44);c.fillRect(2896,520,18,6);c.fillRect(2924,524,10,36);
  metal(2990,520,110,8,'#8a8d93');for(k=0;k<5;k++)cylV(2998+k*20,490,14,30,['#1aa3d6','#d81b86','#f7d117','#f2efe8','#2f5d46'][k]);
  cnc(lt,t);
  // LED tezgâhı
  c.fillStyle=lgV(742,752,[[0,'#b48c5c'],[1,'#7a5a3a']]);c.fillRect(3170,742,170,10);metal(3176,752,6,60,'#4a4d54');metal(3328,752,6,60,'#4a4d54');
  var on=cl((lt-2.4)/2.6,0,1);ledLetter(3232,694,on);
  metal(3282,722,34,20,'#5a5d63',2);EMIT.push(function(){box(3288,727,14,6,on>0?'#7fe0a0':'#2a3a2e')});
  c.strokeStyle='#202024';c.lineWidth=2;c.beginPath();c.moveTo(3282,732);c.quadraticCurveTo(3262,760,3240,736);c.stroke();
  person(3330,G,{f:-1,shirt:'#7a4a22',apron:'#2b2b30',hair:'#2a1d16',reach:[3262+Math.sin(t*2)*3,720],arms:[[0,0],[.3,-.6]],bob:Math.sin(t*1.4)*.4});
  // raf
  metal(3384,600,6,212,'#5a5d63');metal(3500,600,6,212,'#5a5d63');metal(3380,660,130,6,'#8a8d93');metal(3380,760,130,6,'#8a8d93');
  rackLetter('D',3412,656,60);rackLetter('E',3446,656,60);rackLetter('F',3478,656,60);rackLetter('I',3414,756,60);rackLetter('R',3446,756,60);rackLetter('N',3480,756,60);
  // yükleme yapan çalışan
  var p=reduce?.25:(t/7)%1,go=p<.5,u=go?sm(p*2):1-sm((p-.5)*2),wx=3420+200*u,g=gait(t,6.5),mv=Math.sin(Math.PI*(go?p*2:(p-.5)*2));
  var opt={f:go?1:-1,shirt:'#2f5a4a',cap:'#1b1b1d',legs:[g.legs[0]*mv,g.legs[1]*mv],knees:[g.knees[0]*mv,g.knees[1]*mv],bob:g.bob*mv};
  if(go){opt.reach=[wx+24,G-112];opt.arms=[[0,0],[1.1,-.5]]}else opt.arms=[[g.arms[0][0]*mv,-.3],[g.arms[1][0]*mv,-.3]];
  var hh=person(wx,G+6,opt);if(go)carton(hh[0]-6,hh[1]-26,56,40);
  pendant(2860,476,40);pendant(3100,476,40);pendant(3340,476,40);
  shopFront(X0,X1,top,'ÜRETİM');
}

/* ---------- araçlar ---------- */
function vanAt(X,rot,lightsOn){
  if(!seen(X-20,X+280))return;
  var y0=G+40;
  shade(X+128,y0+2,150,7,.55);
  c.fillStyle=lgV(y0-142,y0-20,[[0,'#ffffff'],[.45,'#e8e5df'],[1,'#a4a19b']]);
  c.beginPath();c.moveTo(X,y0-24);c.lineTo(X,y0-128);c.quadraticCurveTo(X+2,y0-142,X+18,y0-142);c.lineTo(X+178,y0-142);c.quadraticCurveTo(X+192,y0-142,X+202,y0-128);
  c.lineTo(X+230,y0-92);c.quadraticCurveTo(X+258,y0-86,X+260,y0-70);c.lineTo(X+260,y0-30);c.lineTo(X+248,y0-24);c.closePath();c.fill();
  c.fillStyle=lgV(y0-136,y0-92,[[0,'#7486a0'],[1,'#1e2532']]);c.beginPath();c.moveTo(X+174,y0-92);c.lineTo(X+174,y0-134);c.lineTo(X+188,y0-134);c.lineTo(X+222,y0-92);c.closePath();c.fill();
  c.save();c.beginPath();c.rect(X,y0-142,175,118);c.clip();
  c.fillStyle='#f7c51c';c.beginPath();c.moveTo(X,y0-56);c.lineTo(X+174,y0-92);c.lineTo(X+174,y0-24);c.lineTo(X,y0-24);c.closePath();c.fill();
  c.fillStyle='#1b1b1d';c.beginPath();c.moveTo(X,y0-50);c.lineTo(X+174,y0-86);c.lineTo(X+174,y0-80);c.lineTo(X,y0-44);c.closePath();c.fill();c.restore();
  bolt(X+16,y0-132,46,'#f2b705');txt('YILDIRIM REKLAM',X+102,y0-118,24,'#17161a',800);txt('Tabela · Baskı · Promosyon',X+102,y0-98,12,'#4a4a50',600);
  box(X+174,y0-92,1.5,66,'rgba(0,0,0,.2)');box(X+158,y0-80,10,3,'#8f9298');c.fillStyle='rgba(255,255,255,.35)';c.fillRect(X+8,y0-139,160,2);
  metal(X+236,y0-36,26,10,'#3a3b3f',2);
  EMIT.push(function(){ell(X+256,y0-62,3,5,lightsOn?'#fffbe8':'#e8e2d0');box(X-1,y0-82,3,12,lightsOn?'#ff3b30':'#a3332c')});
  if(lightsOn){bloom(X+257,y0-62,40,'255,245,220',.5);light(X+300,y0-50,160,'255,245,220',.35);bloom(X,y0-76,26,'255,50,40',.5)}
  for(var k=0;k<2;k++){var wx=X+[46,208][k];c.fillStyle='#111113';c.beginPath();c.arc(wx,y0-24,28,Math.PI,TAU);c.fill();wheel(wx,y0-22,22,rot)}
}
function elbowPt(Sp,Ep,l){var dx=Ep[0]-Sp[0],dy=Ep[1]-Sp[1],D=Math.hypot(dx,dy)||1,d=Math.min(D,2*l-1),h=Math.sqrt(l*l-d*d/4),mx2=Sp[0]+dx/2,my2=Sp[1]+dy/2,nx=-dy/D,ny=dx/D;
  var e1=[mx2+nx*h,my2+ny*h],e2=[mx2-nx*h,my2-ny*h];return e1[1]<e2[1]?e1:e2}
function truckAt(X,u,bkX,bkTop,rot,t,work,wi){
  if(!seen(X-260,X+400))return;
  var y0=G+38,k,T=[X+64,y0-140];
  shade(X+150,y0+2,180,8,.55);
  var Bk=[lerp(X+10,bkX+36,u),lerp(y0-120,bkTop+40,u)],Ef=[X+250,y0-162],Er=elbowPt(T,[bkX+36,bkTop+40],400),Ep=[lerp(Ef[0],Er[0],u),lerp(Ef[1],Er[1],u)];
  var ol=sm(u*3);
  for(k=0;k<2;k++){var ox=X+[18,190][k];box(ox-4,y0-48,8,4+40*ol,'#2c2d31');if(ol>.5)box(ox-14,y0-8+4*ol,28,5,'#18181b')}
  boom(T,Ep,24,'#efede7');c.fillStyle='#c9ccd2';seg(X+78,y0-132,lerp(X+120,X+32,u),lerp(y0-150,y0-224,u),7,7);
  boom(Ep,Bk,18,'#efede7');var ix=Ep[0]+(Bk[0]-Ep[0])*.62,iy=Ep[1]+(Bk[1]-Ep[1])*.62;c.fillStyle='#e0ae10';seg(ix,iy,Bk[0],Bk[1],18,18);
  circ(Ep[0],Ep[1],11,'#2b2c30');circ(Ep[0],Ep[1],4,'#9a9da3');
  var bx=Bk[0]-36,bt=Bk[1]-40;
  if(work){var hand=person(bx,bt+54,{f:-1,shirt:'#33507f',vest:1,harness:1,helmet:'#ffc21a',noShadow:1,reach:[wi[0],wi[1]+Math.sin(t*36)*.8],arms:[[0,0],[.7,-1.3]]});
    c.fillStyle='#f2b705';rr(hand[0]-24,hand[1]-8,26,11,3);c.fill();box(hand[0]-4,hand[1]-3,7,15,'#202024');box(hand[0]-32,hand[1]-4,9,2.2,'#d6d9de');
    if(work>1&&!reduce){var sx=hand[0]-32,sy=hand[1]-3,fk=.6+.4*Math.sin(t*60);
      EMIT.push(function(){c.strokeStyle='#ffe1a0';c.lineWidth=1.6;c.lineCap='round';for(var i=0;i<9;i++){var an=(i*.8+t*17)%TAU,ln=4+((i*37+t*120)%16);c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(an)*ln,sy+Math.sin(an)*ln+ln*.3);c.stroke()}});
      light(sx,sy,110,'255,200,120',.5*fk);bloom(sx,sy,36,'255,220,160',.6*fk)}
    c.strokeStyle='#202024';c.lineWidth=1.6;c.beginPath();c.moveTo(bx-4,bt-34);c.quadraticCurveTo(bx+12,bt-6,bx+26,bt+2);c.stroke()}
  c.fillStyle=lgH(bx-40,bx+40,[[0,'#9c7300'],[.35,'#f4c51c'],[1,'#8f6a00']]);rr(bx-40,bt,80,62,6);c.fill();box(bx-42,bt-4,84,8,'#2a2a2e');
  box(X+2,y0-48,288,12,'#1c1c1f');
  metal(X,y0-134,206,88,'#efede8',4);
  c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=1.4;for(k=0;k<3;k++)c.strokeRect(X+6+k*66,y0-126,60,62);
  c.save();c.beginPath();c.rect(X,y0-60,206,12);c.clip();box(X,y0-60,206,12,'#ffc21a');c.fillStyle='#17161a';
  for(k=0;k<16;k++){c.beginPath();c.moveTo(X+k*16,y0-60);c.lineTo(X+8+k*16,y0-60);c.lineTo(X+k*16,y0-48);c.lineTo(X-8+k*16,y0-48);c.closePath();c.fill()}c.restore();
  bolt(X+14,y0-122,40,'#f2b705');txt('YILDIRIM',X+114,y0-110,30,'#17161a',800);txt('REKLAM · TABELA',X+114,y0-86,15,'#4a4a50',600);
  metal(X+42,y0-152,48,22,'#5a5c62',3);circ(T[0],T[1],10,'#2b2c30');
  var cx0=X+206;
  c.fillStyle=lgV(y0-154,y0-46,[[0,'#ffffff'],[.5,'#e4e2dc'],[1,'#a9a7a1']]);
  c.beginPath();c.moveTo(cx0,y0-46);c.lineTo(cx0,y0-142);c.quadraticCurveTo(cx0+2,y0-154,cx0+16,y0-154);c.lineTo(cx0+52,y0-154);c.lineTo(cx0+80,y0-106);c.quadraticCurveTo(cx0+90,y0-102,cx0+90,y0-90);c.lineTo(cx0+90,y0-46);c.closePath();c.fill();
  c.fillStyle=lgV(y0-148,y0-106,[[0,'#7486a0'],[1,'#1e2532']]);c.beginPath();c.moveTo(cx0+10,y0-106);c.lineTo(cx0+10,y0-142);c.lineTo(cx0+50,y0-144);c.lineTo(cx0+73,y0-106);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(cx0+24,y0-143);c.lineTo(cx0+34,y0-143);c.lineTo(cx0+20,y0-107);c.lineTo(cx0+12,y0-107);c.closePath();c.fill();
  box(cx0+46,y0-104,1.5,56,'rgba(0,0,0,.2)');box(cx0+36,y0-96,10,3,'#8f9298');metal(cx0+84,y0-132,8,16,'#2a2b2f',2);metal(cx0+58,y0-60,36,11,'#3a3b3f',2);
  EMIT.push(function(){ell(cx0+87,y0-82,3.6,6,'#fffbe8')});bloom(cx0+89,y0-82,46,'255,250,230',.45);light(cx0+130,y0-60,160,'255,245,220',.32);refl(cx0+89,18,'255,245,220',.3);
  for(k=0;k<2;k++){var wx=X+[58,258][k];c.fillStyle='#111113';c.beginPath();c.arc(wx,y0-26,31,Math.PI,TAU);c.fill();wheel(wx,y0-24,24,rot)}
  var bb=reduce?.6:Math.pow(Math.max(0,Math.sin(t*6.5)),2);
  metal(cx0+22,y0-162,24,8,'#26272b',3);ell(cx0+34,y0-165,8,6,'#b07810');
  EMIT.push(function(){ell(cx0+34,y0-165,7,5.5,'rgba(255,180,40,'+(.35+bb*.65).toFixed(2)+')')});
  light(cx0+34,y0-165,300,'255,150,20',.12+.42*bb);bloom(cx0+34,y0-165,90,'255,160,40',.15+.5*bb);refl(cx0+34,32,'255,160,40',.06+.2*bb);
}

/* ---------- 04 MONTAJ & TESLİMAT ---------- */
function scene4(t){
  var x0=SHOP4,lt=t-H[3],n=WORD.length;
  var lp=cl((lt-1.5)/4.1,0,1),kk=t<H[3]?-1:lp*(n+.6)-.6,lit=[];
  for(var i=0;i<n;i++)lit.push(t>=H[3]?cl(kk-i,0,1):0);
  clientShop(x0,'new',lit,t);
  if(!seen(x0-100,x0+1300))return null;
  var py=G+20,cheer=lt>5.9;
  var c1=cons(x0+40,py,{f:1,reach:cheer?null:[x0+66,py-104],arms:cheer?[[2.2,-.4],[.2,-.4]]:[[0,0],[.3,-.6]]});if(!cheer)tabletFlat(c1);
  person(x0+150,py,{f:-1,shirt:'#f3efe7',pants:'#3a3a40',chef:1,apron:'#e8e3d8',hair:'#3b2b20',
    arms:cheer?[[2.75,-.25],[2.85,-.2]]:[[.25,-.9],[.2,-.8]],reach:(!cheer&&lt>1)?[x0+170,py-215]:null,bob:cheer?-Math.abs(Math.sin(t*7))*5:0});
  return {kk:kk,lp:lp,lt:lt};
}
function vehicles(t,s4){
  // minibüs: analizden stüdyoya
  var vx=t<8?1140:t<11?lerp(1140,2380,sm((t-8)/3)):t<19?2380:2380+4600*Math.pow(Math.min(1,(t-19)/5),2);
  vanAt(vx,vx/22,(t>7.6&&t<11.4)||t>18.6);
  // vinçli kamyon: atölyeden müşteriye
  var e=t<30?0:t<33?sm((t-30)/3):1,TX=lerp(3590,4880,e),u=0,bkX=0,bkTop=0,work=0,wi=null;
  if(s4&&t>=H[3]){var n=WORD.length,lt=s4.lt,wix=cl(s4.kk,0,n-1);u=sm(lt/1.3);
    var lx=SHOP4+214+wix*(492/(n-1));bkX=lx+58;bkTop=578;wi=[lx+12,482];
    var fr=s4.kk-Math.floor(s4.kk);work=(s4.lp>0&&s4.lp<1&&fr>.15&&fr<.85)?2:1}
  truckAt(TX,u,bkX,bkTop,TX/24,t,work,wi);
}

/* ---------- işleme hattı ---------- */
function finish(){
  c.setTransform(dpr,0,0,dpr,0,0);
  if(PAT.grain){c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.08;var ox=reduce?0:(Math.random()*128)|0,oy=reduce?0:(Math.random()*128)|0;
    c.translate(-ox,-oy);c.fillStyle=PAT.grain;c.fillRect(ox,oy,vw+128,vh+128);c.restore()}
  var g=c.createRadialGradient(vw/2,vh*.48,Math.min(vw,vh)*.3,vw/2,vh/2,Math.max(vw,vh)*.78);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(4,4,10,'+(.25+.3*NF).toFixed(2)+')');c.fillStyle=g;c.fillRect(0,0,vw,vh);
}
function draw(t){
  K=cam(t);S=(vh/1000)*K.z;VX0=K.x-vw/2/S;VX1=K.x+vw/2/S;
  NF=sm((t-29.5)/4.5);AMB='rgb('+Math.round(246-188*NF)+','+Math.round(242-178*NF)+','+Math.round(234-128*NF)+')';
  EMIT.length=0;LIGHTS.length=0;BLOOM.length=0;REFL.length=0;HAZE.length=0;
  c=mainC;backdrop(t);
  c=wctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,wcv.width,wcv.height);street();
  lamp(1250);tree(1400,41);lamp(2520);tree(2660,43);tree(3770,47);lamp(3980);lamp(5080);tree(5240,53);
  scene1(t);studio(t);workshop(t);var s4=scene4(t);
  walkers(t);
  vehicles(t,s4);
  mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,mcv.width,mcv.height);mctx.drawImage(wcv,0,0);
  lightPass();glowPass(t);
  c=mainC;c.setTransform(1,0,0,1,0,0);c.drawImage(wcv,0,0);finish();
}
function overlay(t){
  for(var i=0;i<4;i++){var o=sm((t-H[i]-.4)/.5)*(1-sm((t-E[i]+.9)/.5)),dir=t<(H[i]+E[i])/2?1:-1;
    caps[i].style.opacity=o.toFixed(3);caps[i].style.visibility=o<.01?'hidden':'visible';caps[i].style.transform='translateX('+(dir*(1-o)*28).toFixed(1)+'px)';
    var e=i<3?H[i+1]:TOTAL;fills[i].style.transform='scaleX('+cl((t-H[i])/(e-H[i]),0,1).toFixed(3)+')';navs[i].classList.toggle('on',t>=H[i]&&t<e)}
}

/* ---------- kaydırmaya bağlı oynatma ---------- */
function readP(){var r=root.getBoundingClientRect(),tot=r.height-stage.clientHeight;return tot>0?cl(-r.top/tot,0,1):0}
// The last 8% of the scroll holds the finished frame (sign fully lit).
function timeAt(p){return T0+Math.min(1,p/.92)*(T1-T0)}
var ps=readP(),drawn=-1,running=false,raf=0,alive=true;
function render(){if(!keys.length)return;var t=timeAt(ps);draw(t);overlay(t);drawn=ps}
// Draws only when the eased progress actually moves: the scene is a pure
// function of time, so a still scroll needs no new frames.
function frame(){if(!running)return;var p=readP();ps+=(p-ps)*(reduce?1:.08);if(Math.abs(p-ps)<1e-5)ps=p;
  if(ps!==drawn)render();raf=requestAnimationFrame(frame)}
function resize(){vw=Math.max(1,stage.clientWidth);vh=Math.max(1,stage.clientHeight);dpr=Math.min(window.devicePixelRatio||1,1.75);
  cv.width=wcv.width=mcv.width=Math.round(vw*dpr);cv.height=wcv.height=mcv.height=Math.round(vh*dpr);lcv.width=Math.ceil(cv.width*LQ);lcv.height=Math.ceil(cv.height*LQ);
  buildKeys();render()}
// Adım çubuğundaki butonlar o adımın ortasına kaydırır.
var onNav=function(e){var i=navs.indexOf(e.currentTarget),p=cl((H[i]+4-T0)/(T1-T0)*.92,0,1);
  var top=root.getBoundingClientRect().top+window.pageYOffset;window.scrollTo({top:top+p*(root.offsetHeight-stage.clientHeight),behavior:reduce?'auto':'smooth'})};
navs.forEach(function(b){b.addEventListener('click',onNav)});
makePatterns();
var ro=null,io=null;
if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(stage)}else window.addEventListener('resize',resize);
if(window.IntersectionObserver){io=new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!running){running=true;raf=requestAnimationFrame(frame)}else if(!v){running=false;cancelAnimationFrame(raf)}});io.observe(root)}
else{running=true;raf=requestAnimationFrame(frame)}
resize();
if(document.fonts&&document.fonts.load)document.fonts.load('800 96px "Barlow Condensed"').then(function(){if(alive)render()},function(){});

return function(){
  alive=false;running=false;cancelAnimationFrame(raf);
  if(ro)ro.disconnect();else window.removeEventListener('resize',resize);
  if(io)io.disconnect();
  navs.forEach(function(b){b.removeEventListener('click',onNav)});
};
}
