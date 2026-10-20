// Canvas scene for the scroll-driven intro: one long street, the camera pans
// left to right and zooms into each workshop station (Tabela, Dijital Baskı,
// Promosyon, Matbaa). Progress is read from the section's own scroll
// position (native position:sticky — no scroll-jacking) and eased per frame.
// Rendering: world layer + multiplied light buffer + emissive/bloom pass.
//
// mountIntroScene(root) wires everything up and returns a cleanup function.

export function mountIntroScene(root) {
var stage=root.querySelector('.yr-stage'), cv=root.querySelector('.yr-canvas'), mainC=cv.getContext('2d');
var wcv=document.createElement('canvas'), wctx=wcv.getContext('2d'), mcv=document.createElement('canvas'), mctx=mcv.getContext('2d'), c=wctx;
var lcv=document.createElement('canvas'), lc=lcv.getContext('2d');
var caps=[].slice.call(root.querySelectorAll('.yr-cap')), hero=root.querySelector('.yr-hero'), fin=root.querySelector('.yr-final');
var navs=[].slice.call(root.querySelectorAll('[data-yr-go]')), fills=[].slice.call(root.querySelectorAll('.yr-fill'));
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var FONT='"Barlow Condensed","Arial Narrow",Impact,sans-serif';
var G=820, R=G+38, TAU=Math.PI*2, LQ=.5;
var SX=[700,1900,3100,4300];
var DET=[[700,520],[1815,712],[3230,705],[4340,668]];
var DZ=[1.9,2.3,2.4,2.1];
var A=[.07,.29,.51,.73];
var CM=['#1aa3d6','#d81b86','#f7d117','#1b1b1d'];
var vw=1,vh=1,dpr=1,S=1,K={x:0,y:0,z:1},keys=[],VX0=0,VX1=1;
var EMIT=[],LIGHTS=[],BLOOM=[],REFL=[],HAZE=[];

function cl(v,a,b){return v<a?a:v>b?b:v}
function sm(u){u=cl(u,0,1);return u*u*(3-2*u)}
function rng(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
function hx(h){h=h.replace('#','');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
var MC={};
function mx(h,k){var key=h+k;if(MC[key])return MC[key];var a=hx(h),t=k<0?0:255,m=Math.abs(k);
  return (MC[key]='rgb('+Math.round(a[0]+(t-a[0])*m)+','+Math.round(a[1]+(t-a[1])*m)+','+Math.round(a[2]+(t-a[2])*m)+')')}

/* ---------- kamera ---------- */
function cyFor(z,frac){return G-(frac-.5)*1000/z}
function buildKeys(){
  var wv=vw/(vh/1000), fit=wv/5000, zAll=Math.max(fit,.2);
  var sx=fit>=.2?2400:SX[0], ex=fit>=.2?2400:SX[3], zW=Math.min(1,wv/1250), wide=vw>760;
  keys=[{p:0,x:sx,y:cyFor(zAll,.8),z:zAll}];
  for(var i=0;i<4;i++){
    var zd=zW*DZ[i],sc=(vh/1000)*zd;
    var ox=wide?-(vw*.2)/sc:0, oy=wide?0:(vh*.17)/sc;
    keys.push({p:A[i],x:SX[i],y:cyFor(zW,.72),z:zW});
    keys.push({p:A[i]+.08,x:DET[i][0]+ox,y:DET[i][1]+oy,z:zd});
    keys.push({p:A[i]+.14,x:DET[i][0]+ox+30,y:DET[i][1]+oy,z:zd*1.06});
  }
  keys.push({p:1,x:ex,y:cyFor(zAll,.9),z:zAll});
}
function cam(p){
  var i=0; while(i<keys.length-2&&p>keys[i+1].p) i++;
  var a=keys[i],b=keys[i+1],u=sm((p-a.p)/(b.p-a.p));
  return {x:a.x+(b.x-a.x)*u, y:a.y+(b.y-a.y)*u, z:Math.exp(Math.log(a.z)+(Math.log(b.z)-Math.log(a.z))*u)};
}
function W(f){c.setTransform(dpr*S,0,0,dpr*S,dpr*(vw/2-K.x*f*S),dpr*(vh/2-K.y*S))}
function seen(x0,x1){return x1>VX0-60&&x0<VX1+60}

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
function cylH(x,y,w,h,base){c.fillStyle=lgV(y,y+h,[[0,mx(base,-.5)],[.3,mx(base,.3)],[.45,mx(base,.06)],[1,mx(base,-.6)]]);rr(x,y,w,h,Math.min(4,h/2));c.fill()}
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
function bloom(x,y,r,rgb,a){if(a>.004)BLOOM.push([x,y,r,rgb,a])}
function refl(x,w,rgb,a){if(a>.004)REFL.push([x,w,rgb,a])}

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

/* ---------- gökyüzü ve şehir siluetleri ---------- */
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
function backdrop(t){
  c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle=lgV(0,vh,[[0,'#080b1a'],[.55,'#171a33'],[.85,'#2e2742'],[1,'#3d2f45']]);c.fillRect(0,0,vw,vh);
  for(var i=0;i<stars.length;i++){var s=stars[i];c.globalAlpha=.25+.3*Math.sin(t*1.1+s[3]);circ(s[0]*vw,s[1]*vh,s[2],'#f4f0e6')}
  c.globalAlpha=1;
  var mxp=vw*.84,myp=vh*.15,mr=Math.max(10,vh*.022);
  var mg=c.createRadialGradient(mxp,myp,mr,mxp,myp,mr*7);mg.addColorStop(0,'rgba(220,225,255,.2)');mg.addColorStop(1,'rgba(220,225,255,0)');
  c.fillStyle=mg;c.fillRect(mxp-mr*7,myp-mr*7,mr*14,mr*14);
  circ(mxp,myp,mr,'#eef0f6');circ(mxp-mr*.3,myp-mr*.2,mr*.22,'rgba(160,165,185,.4)');circ(mxp+mr*.35,myp+mr*.3,mr*.16,'rgba(160,165,185,.35)');
  W(.35);
  c.fillStyle=lgV(G-500,G,[[0,'rgba(255,140,80,0)'],[1,'rgba(255,140,80,.16)']]);c.fillRect(-6000,G-500,16000,500);
  c.fillStyle='#1b1d2e';
  for(i=0;i<far.length;i++){var b=far[i];c.fillRect(b[0],G-b[2],b[1],b[2]+600);if(b[4]>.8)c.fillRect(b[0]+b[1]*.4,G-b[2]-36,3,36)}
  mosque(1500);
  for(i=0;i<far.length;i++){var w=far[i][3];for(var j=0;j<w.length;j++){c.fillStyle=w[j][2]<.7?'rgba(255,196,120,.5)':'rgba(190,215,255,.38)';c.fillRect(w[j][0],w[j][1],7,10)}}
  c.fillStyle=lgV(G-420,G+60,[[0,'rgba(90,80,110,0)'],[1,'rgba(95,80,105,.55)']]);c.fillRect(-6000,G-420,16000,480);
  W(.65);
  c.fillStyle='#111220';
  for(i=0;i<mid.length;i++){var m=mid[i];c.fillRect(m[0],G-m[2],m[1],m[2]+600);
    if(m[3]>.62)c.fillRect(m[0]+m[1]*.6,G-m[2]-40,3,40);if(m[3]<.3)c.fillRect(m[0]+18,G-m[2]-26,34,26)}
  c.fillStyle=lgV(G-260,G+40,[[0,'rgba(70,60,90,0)'],[1,'rgba(70,58,85,.5)']]);c.fillRect(-6000,G-260,16000,300);
}
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

/* ---------- 01 TABELA ---------- */
var WORD=['K','A','H','V','E','C','İ'];
function signState(lp){var n=WORD.length,step=(912-488)/(n-1),kk=lp*(n+1.2)-.6;return {n:n,step:step,kk:kk,wi:cl(kk,0,n-1)}}
function st1(t,lp){
  if(!seen(370,1030))return;
  var i,k,s=signState(lp);
  c.fillStyle=PAT.brick;c.fillRect(380,226,640,G-226);
  c.fillStyle=lgH(380,1020,[[0,'rgba(0,0,0,.45)'],[.06,'rgba(0,0,0,0)'],[.94,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);c.fillRect(380,226,640,G-226);
  c.fillStyle=lgV(208,236,[[0,'#e6dfd0'],[.45,'#c4bba9'],[1,'#7c7466']]);c.fillRect(368,208,664,28);box(372,234,656,6,'#9a9282');
  c.fillStyle=lgV(240,270,[[0,'rgba(0,0,0,.5)'],[1,'rgba(0,0,0,0)']]);c.fillRect(380,240,640,30);
  for(i=0;i<5;i++)(function(wx,lit,curt){var wy=270,ww=80,wh=118;
    c.fillStyle=lgV(wy-16,wy,[[0,'#ddd6c8'],[1,'#a39b8b']]);c.fillRect(wx-8,wy-16,ww+16,16);
    box(wx,wy,ww,wh,'#2a221f');box(wx+4,wy+4,ww-8,wh-8,'#dcd8d0');
    if(lit){box(wx+9,wy+9,ww-18,wh-18,'#f0c98e');
      EMIT.push(function(){c.fillStyle=lgV(wy,wy+wh,[[0,'rgba(255,214,150,.9)'],[1,'rgba(255,170,95,.8)']]);c.fillRect(wx+9,wy+9,ww-18,wh-18);
        c.fillStyle=curt;c.fillRect(wx+9,wy+9,15,wh-18);c.fillRect(wx+ww-24,wy+9,15,wh-18);box(wx+ww/2-2,wy+4,4,wh-8,'#8a7a66')});
      light(wx+ww/2,wy+wh/2,190,'255,180,110',.42);bloom(wx+ww/2,wy+wh/2,80,'255,190,120',.14)}
    else{c.fillStyle=lgV(wy,wy+wh,[[0,'#5a6680'],[1,'#1c2130']]);c.fillRect(wx+9,wy+9,ww-18,wh-18);
      c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(wx+22,wy+9);c.lineTo(wx+40,wy+9);c.lineTo(wx+18,wy+wh-9);c.lineTo(wx+9,wy+wh-9);c.lineTo(wx+9,wy+44);c.closePath();c.fill()}
    box(wx+ww/2-2,wy+4,4,wh-8,'#cfcac1');
    c.fillStyle=lgV(wy+wh,wy+wh+9,[[0,'#ddd5c6'],[1,'#958d7e']]);c.fillRect(wx-10,wy+wh,ww+20,9);
    c.fillStyle=lgV(wy+wh+9,wy+wh+26,[[0,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);c.fillRect(wx-8,wy+wh+9,ww+16,17);
  })(410+i*122,i===1||i===3,i===1?'rgba(120,40,40,.6)':'rgba(40,70,90,.6)');
  // ACP tabela paneli
  c.fillStyle=lgV(428,578,[[0,'#80848d'],[.05,'#5d616a'],[.5,'#3d4047'],[1,'#25272c']]);rr(432,428,536,150,3);c.fill();
  box(432,428,536,2,'rgba(255,255,255,.3)');
  for(i=0;i<s.n;i++){var lx=488+i*s.step,on=cl(s.kk-i,0,1);
    channel(WORD[i],lx,508,100,8,on,'#ffe7b0','rgba(255,170,60,1)');
    if(on>0){light(lx,508,190,'255,182,100',.55*on);bloom(lx,508,95,'255,170,80',.22*on);refl(lx,36,'255,190,110',.18*on)}}
  metal(940,584,30,22,'#6a6d74',2);box(950,578,8,8,'#3a3b40');
  // vitrin: içerideki kafe
  box(400,588,600,232,'#1e1a17');
  var ix0=412,ix1=784;
  c.fillStyle=lgV(598,812,[[0,'#d7a877'],[1,'#94693f']]);c.fillRect(ix0,598,ix1-ix0,214);
  box(ix0,760,ix1-ix0,52,'#6a4a32');
  box(440,616,92,58,'#232323');for(k=0;k<5;k++)box(448,628+k*9,36+((k*13)%30),2,'#d6d1c7');
  box(600,640,170,5,'#5a3a24');for(k=0;k<8;k++)cylV(608+k*20,626,13,14,'#ece6da');
  c.fillStyle=lgV(724,812,[[0,'#8a5a3a'],[1,'#432a1c']]);c.fillRect(600,724,184,88);box(596,719,192,7,'#2c2420');
  metal(690,686,62,33,'#bfc3c9',3);box(700,709,8,10,'#222');box(730,709,8,10,'#222');
  // masa + müşteriler
  box(470,768,32,5,'#3a2a20');box(483,773,5,38,'#2a2a2a');
  box(552,768,32,5,'#3a2a20');box(565,773,5,38,'#2a2a2a');
  box(455,744,82,5,'#5a3a26');box(494,749,5,62,'#2a2a2a');box(482,808,30,4,'#2a2a2a');
  var ph=reduce?.5:(t*.28)%1,drink=ph<.32?sm(ph/.08)*(1-sm((ph-.24)/.08)):0;
  var hA=person(458,858,{f:1,shirt:'#7a2f3a',hair:'#3b2316',legs:SIT.legs,knees:SIT.knees,noShadow:1,
    reach:[478-drink*14,740-drink*48],arms:[[0,0],[.5,-1.1]]});
  cylV(hA[0]-2,hA[1]-12,10,12,'#f4f0e6');
  person(566,858,{f:-1,shirt:'#2f5a6a',hair:'#141210',longHair:1,legs:SIT.legs,knees:SIT.knees,noShadow:1,reach:[522,742],arms:[[0,0],[.9,-1.6]]});
  cylV(522,732,10,12,'#f4f0e6');
  wash(ix0,598,ix1-ix0,214,'255,212,165',.55);pendant(500,598,26);pendant(690,598,26);
  // cam ve yansıma
  c.save();c.beginPath();c.rect(ix0,598,ix1-ix0,214);c.clip();
  c.fillStyle='rgba(160,185,220,.08)';c.fillRect(ix0,598,ix1-ix0,214);
  c.fillStyle='rgba(255,255,255,.07)';for(k=0;k<3;k++){var sx=ix0+60+k*130;c.beginPath();c.moveTo(sx,598);c.lineTo(sx+40,598);c.lineTo(sx-20,812);c.lineTo(sx-60,812);c.closePath();c.fill()}
  c.restore();
  box(ix0+182,598,5,214,'#1e1a17');
  box(800,604,92,208,'#1e1a17');c.fillStyle=lgV(612,812,[[0,'#b88c60'],[1,'#7a5636']]);c.fillRect(808,612,76,200);
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(808,612,76,200);metal(870,684,5,54,'#c9ccd2',2);
  EMIT.push(function(){c.save();c.font='700 24px '+FONT;c.textAlign='center';c.textBaseline='middle';c.shadowColor='rgba(255,50,80,1)';c.shadowBlur=10*S*dpr;
    c.fillStyle='#ffd5dc';c.fillText('AÇIK',738,624);c.restore()});
  light(738,624,90,'255,60,90',.45);bloom(738,624,40,'255,70,100',.25);
  ao(380,1020,G,22,.5);
}
function boom(a,b,w,col){c.fillStyle=col;seg(a[0],a[1],b[0],b[1],w,w);
  var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,o=w*.3;
  c.fillStyle='rgba(0,0,0,.22)';seg(a[0]-nx*o,a[1]-ny*o,b[0]-nx*o,b[1]-ny*o,w*.38,w*.38);
  c.fillStyle='rgba(255,255,255,.35)';seg(a[0]+nx*o,a[1]+ny*o,b[0]+nx*o,b[1]+ny*o,2,2)}
function wheel(x,y,r){circ(x,y,r,'#141416');c.fillStyle=lgV(y-r*.6,y+r*.6,[[0,'#e0e3e8'],[1,'#6a6d73']]);c.beginPath();c.arc(x,y,r*.58,0,TAU);c.fill();
  circ(x,y,r*.2,'#3a3b40');for(var k=0;k<5;k++)circ(x+Math.cos(k*1.2566)*r*.36,y+Math.sin(k*1.2566)*r*.36,1.6,'#2a2b2f')}
function cone2(x,y){shade(x,y,20,3,.45);box(x-17,y-4,34,5,'#1a1a1c');
  c.fillStyle=lgH(x-14,x+14,[[0,'#a8400c'],[.45,'#ff7a1a'],[1,'#b8480e']]);c.beginPath();c.moveTo(x-14,y-4);c.lineTo(x+14,y-4);c.lineTo(x+3,y-52);c.lineTo(x-3,y-52);c.closePath();c.fill();
  c.fillStyle='#e6e8ea';c.beginPath();c.moveTo(x-9,y-22);c.lineTo(x+9,y-22);c.lineTo(x+7,y-32);c.lineTo(x-7,y-32);c.closePath();c.fill()}
function st1Front(t,lp){
  if(!seen(380,1420))return;
  var s=signState(lp),bx=488+s.wi*s.step,bkX=bx+58,bkTop=590,y0=G+38,k;
  person(1008,G+8,{f:-1,shirt:'#3f4a5c',vest:1,helmet:'#f2f0ea',arms:[[2.25,-.12],[.55,-1.4]],bob:Math.sin(t*1.5)*.6});
  cone2(1024,y0+4);cone2(1392,y0+4);
  shade(1196,y0+2,180,8,.55);
  var T=[1110,y0-140],E=[1036,592],Bk=[bkX+36,bkTop+40];
  boom(T,E,24,'#efede7');
  c.fillStyle='#c9ccd2';seg(1124,y0-132,1078,y0-224,7,7);
  boom(E,Bk,18,'#efede7');
  var ix=E[0]+(Bk[0]-E[0])*.62,iy=E[1]+(Bk[1]-E[1])*.62;c.fillStyle='#e0ae10';seg(ix,iy,Bk[0],Bk[1],18,18);
  circ(E[0],E[1],11,'#2b2c30');circ(E[0],E[1],4,'#9a9da3');
  // sepetteki usta
  var hand=person(bkX,bkTop+54,{f:-1,shirt:'#33507f',vest:1,harness:1,helmet:'#ffc21a',noShadow:1,
    reach:[bx+12,486+Math.sin(t*36)*.8],arms:[[0,0],[.7,-1.3]]});
  c.fillStyle='#f2b705';rr(hand[0]-24,hand[1]-8,26,11,3);c.fill();box(hand[0]-4,hand[1]-3,7,15,'#202024');box(hand[0]-32,hand[1]-4,9,2.2,'#d6d9de');
  var fr=s.kk-Math.floor(s.kk),work=lp>0&&lp<1&&fr>.15&&fr<.85;
  if(work&&!reduce){var sx=hand[0]-32,sy=hand[1]-3,flick=.6+.4*Math.sin(t*60);
    EMIT.push(function(){c.strokeStyle='#ffe1a0';c.lineWidth=1.6;c.lineCap='round';
      for(var i=0;i<9;i++){var an=(i*.8+t*17)%TAU,ln=4+((i*37+t*120)%16);c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(an)*ln,sy+Math.sin(an)*ln+ln*.3);c.stroke()}});
    light(sx,sy,110,'255,200,120',.5*flick);bloom(sx,sy,36,'255,220,160',.5*flick)}
  c.strokeStyle='#202024';c.lineWidth=1.6;c.beginPath();c.moveTo(bkX-4,bkTop-34);c.quadraticCurveTo(bkX+12,bkTop-6,bkX+26,bkTop+2);c.stroke();
  c.fillStyle=lgH(bkX-40,bkX+40,[[0,'#9c7300'],[.35,'#f4c51c'],[1,'#8f6a00']]);rr(bkX-40,bkTop,80,62,6);c.fill();
  box(bkX-42,bkTop-4,84,8,'#2a2a2e');metal(bkX+40,bkTop+12,12,22,'#3a3c42',2);
  // kamyon
  box(1048,y0-48,288,12,'#1c1c1f');
  for(k=0;k<2;k++){var ox=[1064,1236][k];box(ox-4,y0-48,8,44,'#2c2d31');box(ox-14,y0-4,28,5,'#18181b')}
  metal(1046,y0-134,206,88,'#efede8',4);
  c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=1.4;for(k=0;k<3;k++)c.strokeRect(1052+k*66,y0-126,60,62);
  for(k=0;k<3;k++)box(1100+k*66-30,y0-96,10,3,'#8f9298');
  c.save();c.beginPath();c.rect(1046,y0-60,206,12);c.clip();box(1046,y0-60,206,12,'#ffc21a');c.fillStyle='#17161a';
  for(k=0;k<16;k++){c.beginPath();c.moveTo(1046+k*16,y0-60);c.lineTo(1054+k*16,y0-60);c.lineTo(1046+k*16,y0-48);c.lineTo(1038+k*16,y0-48);c.closePath();c.fill()}c.restore();
  bolt(1060,y0-122,40,'#f2b705');txt('YILDIRIM',1160,y0-110,30,'#17161a',800);txt('REKLAM · TABELA',1160,y0-86,15,'#4a4a50',600);
  metal(1088,y0-152,48,22,'#5a5c62',3);circ(T[0],T[1],10,'#2b2c30');
  var cx0=1252;
  c.fillStyle=lgV(y0-154,y0-46,[[0,'#ffffff'],[.5,'#e4e2dc'],[1,'#a9a7a1']]);
  c.beginPath();c.moveTo(cx0,y0-46);c.lineTo(cx0,y0-142);c.quadraticCurveTo(cx0+2,y0-154,cx0+16,y0-154);c.lineTo(cx0+52,y0-154);c.lineTo(cx0+80,y0-106);c.quadraticCurveTo(cx0+90,y0-102,cx0+90,y0-90);c.lineTo(cx0+90,y0-46);c.closePath();c.fill();
  c.fillStyle=lgV(y0-148,y0-106,[[0,'#7486a0'],[1,'#1e2532']]);c.beginPath();c.moveTo(cx0+10,y0-106);c.lineTo(cx0+10,y0-142);c.lineTo(cx0+50,y0-144);c.lineTo(cx0+73,y0-106);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(cx0+24,y0-143);c.lineTo(cx0+34,y0-143);c.lineTo(cx0+20,y0-107);c.lineTo(cx0+12,y0-107);c.closePath();c.fill();
  box(cx0+46,y0-104,1.5,56,'rgba(0,0,0,.2)');box(cx0+36,y0-96,10,3,'#8f9298');metal(cx0+84,y0-132,8,16,'#2a2b2f',2);
  metal(cx0+58,y0-60,36,11,'#3a3b3f',2);
  EMIT.push(function(){ell(cx0+87,y0-82,3.6,6,'#fffbe8')});bloom(cx0+89,y0-82,46,'255,250,230',.4);light(cx0+130,y0-60,160,'255,245,220',.32);refl(cx0+89,18,'255,245,220',.3);
  for(k=0;k<2;k++){var wx=[1104,1304][k];c.fillStyle='#111113';c.beginPath();c.arc(wx,y0-26,31,Math.PI,TAU);c.fill();wheel(wx,y0-24,24)}
  var bb=reduce?.6:Math.pow(Math.max(0,Math.sin(t*6.5)),2);
  metal(cx0+22,y0-162,24,8,'#26272b',3);ell(cx0+34,y0-165,8,6,'#b07810');
  EMIT.push(function(){ell(cx0+34,y0-165,7,5.5,'rgba(255,180,40,'+(.35+bb*.65).toFixed(2)+')')});
  light(cx0+34,y0-165,300,'255,150,20',.12+.42*bb);bloom(cx0+34,y0-165,90,'255,160,40',.12+.5*bb);refl(cx0+34,32,'255,160,40',.06+.2*bb);
}

/* ---------- 02 DİJİTAL BASKI ---------- */
function st2(t){
  if(!seen(1460,2340))return;
  var X0=1480,X1=2320,top=320,k;
  shopBack(X0,X1,top,'corr','rgba(50,70,100,.32)');
  for(k=0;k<3;k++){var fx=1705+k*96;box(fx,512,80,58,'#1c1c20');poster(fx+4,516,72,50,k)}
  for(k=0;k<4;k++){var rx=2196+k*16,col=['#f2f0ea','#e8e4da','#d6dce6','#f5f2e8'][k];cylV(rx,G-178,14,150,col);ell(rx+7,G-178,7,2.5,mx(col,.1));ell(rx+7,G-178,2,1,'#8a8f9c')}
  metal(1548,560,40,200,'#7a7d84',2);for(k=0;k<6;k++)box(1552,572+k*30,32,2,'rgba(0,0,0,.3)');
  // geniş format makine
  cylH(1636,628,340,22,'#f4f2ec');
  for(k=0;k<2;k++){var px=[1606,1996][k];metal(px,708,16,100,'#5a5d64');metal(px-24,804,64,8,'#3a3c42',2);circ(px-16,814,4,'#111');circ(px+32,814,4,'#111')}
  metal(1622,770,374,8,'#4a4d54');
  cylH(1640,786,340,18,'#ddd8ce');
  c.save();c.beginPath();c.rect(1648,722,324,66);c.clip();
  var off=reduce?40:(t*7)%130;poster(1648,722-130+off,324,130,9);poster(1648,722+off,324,130,9);
  c.fillStyle=lgV(722,788,[[0,'rgba(0,0,0,.3)'],[.22,'rgba(255,255,255,.1)'],[.6,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.4)']]);c.fillRect(1648,722,324,66);c.restore();
  metal(1630,650,360,70,'#d9dadb',8);
  rr(1650,656,320,22,4);c.fillStyle='#1d222a';c.fill();
  var cx=1652+(Math.sin(t*1.9)*.5+.5)*266;
  c.save();rr(1650,656,320,22,4);c.clip();metal(cx,658,52,18,'#3a3d44',2);
  EMIT.push(function(){box(cx+8,664,7,3,'#8fdcff')});light(cx+26,690,90,'140,200,255',.4);
  c.fillStyle='rgba(255,255,255,.14)';c.fillRect(1650,657,320,4);c.restore();
  metal(1626,712,368,12,'#2a2b30',3);box(1630,692,360,4,'#ffc21a');txt('XR-1640',1700,704,13,'#5a5c62',700);
  metal(1588,640,48,86,'#c9cacc',8);metal(1984,640,62,86,'#c9cacc',8);
  box(1992,652,42,22,'#0f1418');
  EMIT.push(function(){c.fillStyle=lgV(654,672,[[0,'#3db9ec'],[1,'#1f7fb0']]);c.fillRect(1994,654,38,18);box(1997,658,20,2,'#e8f7ff');box(1997,664,28,2,'#bfe7ff');circ(2028,688,2.2,'#6dff9a')});
  light(2013,663,70,'80,190,255',.35);light(2028,688,30,'100,255,150',.3);
  for(k=0;k<4;k++)box(1994+k*10,696,8,18,CM[k]);circ(1998,686,2.5,'#333');circ(2008,686,2.5,'#333');
  // iş istasyonu
  metal(2160,750,22,62,'#2a2b30',2);
  box(2050,740,140,6,'#d9d4ca');box(2052,746,4,66,'#5a5d64');box(2184,746,4,66,'#5a5d64');
  box(2108,722,8,18,'#2a2b30');box(2096,738,32,3,'#2a2b30');rr(2074,678,76,48,3);c.fillStyle='#16171b';c.fill();
  EMIT.push(function(){box(2077,681,70,42,'#1d2430');box(2079,684,9,36,'#2c3a4e');poster(2091,686,52,30,9);box(2091,718,52,3,'#3d6a9a')});
  light(2112,704,140,'150,190,255',.45);bloom(2112,704,50,'150,190,255',.12);
  box(2082,735,46,4,'#2c2d32');
  rr(2180,766,58,8,3);c.fillStyle='#2a2b30';c.fill();box(2206,774,6,30,'#3a3b40');box(2184,804,50,4,'#2a2b30');circ(2186,812,3,'#111');circ(2232,812,3,'#111');rr(2234,700,10,70,4);c.fillStyle='#2a2b30';c.fill();
  var ty=reduce?0:Math.sin(t*9)*1.2;
  person(2214,856,{f:-1,shirt:'#5a2f3a',hair:'#1a1310',legs:SIT.legs,knees:SIT.knees,noShadow:1,reach:[2112+ty,734],arms:[[0,0],[.8,-1.5]]});
  shade(2200,G,40,5,.35);
  // renk ölçen teknisyen (çömelmiş)
  shade(1600,G,38,5,.4);
  var dv=person(1596,G+36,{f:1,shirt:'#2f5a4a',cap:'#1b1b1d',noShadow:1,legs:[1.35,-.15],knees:[-1.35,-1.35],reach:[1662,754+Math.sin(t*.8)*4],arms:[[0,0],[.6,-.9]]});
  metal(dv[0]-2,dv[1]-12,12,20,'#2a2b30',3);EMIT.push(function(){box(dv[0],dv[1]-9,8,6,'#7fe0a0')});
  pendant(1660,476,40);pendant(1900,476,40);pendant(2140,476,40);
  shopFront(X0,X1,top,'DİJİTAL BASKI');
}

/* ---------- 03 PROMOSYON ---------- */
function tee(x,y,w,col){var h=w*1.05;c.fillStyle=lgH(x,x+w,[[0,mx(col,-.35)],[.5,col],[1,mx(col,-.25)]]);c.beginPath();
  c.moveTo(x+w*.33,y);c.quadraticCurveTo(x+w*.5,y+h*.08,x+w*.67,y);c.lineTo(x+w,y+h*.17);c.lineTo(x+w*.86,y+h*.36);c.lineTo(x+w*.78,y+h*.3);c.lineTo(x+w*.79,y+h);c.lineTo(x+w*.21,y+h);c.lineTo(x+w*.22,y+h*.3);c.lineTo(x+w*.14,y+h*.36);c.lineTo(x,y+h*.17);c.closePath();c.fill();
  c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=1.2;c.beginPath();c.moveTo(x+w*.35,y+h*.5);c.quadraticCurveTo(x+w*.45,y+h*.75,x+w*.38,y+h*.98);c.moveTo(x+w*.62,y+h*.45);c.quadraticCurveTo(x+w*.58,y+h*.7,x+w*.66,y+h*.98);c.stroke();
  bolt(x+w*.42,y+h*.22,h*.2,col==='#f7d117'?'#1b1b1d':'#f7d117')}
function cap3(x,y,col){c.fillStyle=lgV(y-20,y,[[0,mx(col,.25)],[1,mx(col,-.35)]]);c.beginPath();c.arc(x,y,20,Math.PI,TAU);c.fill();c.fillStyle=mx(col,-.3);rr(x,y-3,34,5,2);c.fill();bolt(x-5,y-15,11,'#f7d117')}
function mug(x,y,col){cylV(x,y-30,24,30,col);ell(x+12,y-30,12,2.6,mx(col,-.35));c.strokeStyle=mx(col,-.2);c.lineWidth=4;c.beginPath();c.arc(x+25,y-16,7,-1.25,1.25);c.stroke();bolt(x+7,y-25,14,col==='#f7d117'?'#1b1b1d':'#f7d117')}
function carton(x,y,w,h){c.fillStyle=lgV(y,y+h,[[0,'#c99a62'],[1,'#94693c']]);rr(x,y,w,h,2);c.fill();box(x,y+h*.4,w,5,'rgba(230,205,160,.8)');box(x+w*.62,y+h*.58,w*.28,h*.24,'#efe9de');box(x+w*.66,y+h*.64,w*.18,2,'#555')}
function st3(t){
  if(!seen(2660,3540))return;
  var X0=2680,X1=3520,top=340,k;
  shopBack(X0,X1,top,'plaster','rgba(140,90,60,.22)');
  metal(2960,520,252,170,'#d9d3c7');for(k=0;k<12;k++)box(2960,528+k*14,252,2,'rgba(0,0,0,.16)');
  for(k=0;k<4;k++){box(2988+k*56,540,2,10,'#8a8f9c');cap3(2992+k*56,572,['#1c1c22','#efebe2','#b8322b','#2e4a78'][k])}
  metal(2966,640,240,6,'#8a7a66');for(k=0;k<6;k++)mug(2976+k*38,640,['#f4f0e6','#1c1c22','#f7d117','#f4f0e6','#2e4a78','#f4f0e6'][k]);
  metal(2756,552,172,5,'#d4d7dc');metal(2758,552,5,256,'#9a9da3');metal(2922,552,5,256,'#9a9da3');metal(2750,806,184,5,'#5a5d63');circ(2756,815,4,'#111');circ(2928,815,4,'#111');
  var tc=['#f4f0e6','#1c1c22','#2e4a78','#f7d117'];
  for(k=0;k<4;k++){var hx2=2794+k*36;c.strokeStyle='#9a9da3';c.lineWidth=1.5;c.beginPath();c.moveTo(hx2,553);c.lineTo(hx2,562);c.moveTo(hx2-20,570);c.lineTo(hx2,562);c.lineTo(hx2+20,570);c.stroke();
    tee(hx2-27,566,54,tc[k])}
  carton(2938,G-46,60,42);carton(2944,G-88,52,40);
  // masa
  c.fillStyle=lgV(738,750,[[0,'#d0a87e'],[1,'#7a5a3e']]);c.fillRect(3010,738,190,10);metal(3014,748,5,64,'#5a5d63');metal(3190,748,5,64,'#5a5d63');
  mug(3070,738,'#f4f0e6');mug(3104,738,'#f7d117');mug(3138,738,'#1c1c22');
  cylV(3172,718,16,20,'#3a3c42');for(k=0;k<4;k++)box(3175+k*3.5,704+k%2*3,2,16,CM[k]);
  for(k=0;k<3;k++){c.fillStyle=lgV(728-k*7,735-k*7,[[0,mx(tc[k],.1)],[1,mx(tc[k],-.25)]]);rr(3020,728-k*7,40,7,2);c.fill()}
  var insp=reduce?0:Math.sin(t*.9)*.5+.5;
  var mh=person(2984,G,{f:1,shirt:'#7a4a22',apron:'#2b2b30',reach:[3034,690+insp*8],arms:[[0,0],[.25,-.3]],bob:Math.sin(t*1.4)*.5});
  c.save();c.translate(mh[0]-4,mh[1]+12);c.rotate(Math.sin(t*.9)*.25);mug(-12,0,'#f4f0e6');c.restore();
  // transfer presi
  metal(3230,744,128,6,'#4a4d54');metal(3234,750,5,62,'#4a4d54');metal(3350,750,5,62,'#4a4d54');metal(3232,790,124,4,'#3a3d44');
  metal(3236,712,120,32,'#26272b',4);metal(3244,702,104,10,'#8a8d92',2);
  c.fillStyle=lgV(698,734,[[0,'#f6f4f0'],[1,'#c4c1ba']]);c.beginPath();c.moveTo(3240,699);c.lineTo(3352,699);c.lineTo(3354,712);c.quadraticCurveTo(3300,738,3244,730);c.closePath();c.fill();
  var op=reduce?.55:.5+.5*Math.cos(t*1.3),ang=-op*1.0;
  c.save();c.translate(3240,698);c.rotate(ang);
  metal(0,-22,118,22,'#cdd0d6',3);box(2,-3,114,3,'#6a6d73');metal(6,-31,104,10,'#2a2b2f',3);box(40,-29,30,4,'#c8352a');
  metal(110,-42,8,24,'#2a2b2f');c.fillStyle='#17171a';rr(112,-48,46,9,4);c.fill();c.restore();
  var hX=3240+Math.cos(ang)*150-Math.sin(ang)*(-44),hY=698+Math.sin(ang)*150+Math.cos(ang)*(-44);
  var closed=op<.2,secs=closed?Math.max(0,Math.ceil(15-((t*1.3/TAU)%1)*15)):15;
  EMIT.push(function(){box(3296,720,46,15,'#1a0c0b');c.save();c.shadowColor='rgba(255,70,50,1)';c.shadowBlur=6*S*dpr;
    txt('180°',3310,728,12,'#ff5a3c',700);txt(String(secs<10?'0'+secs:secs),3334,728,12,'#ff5a3c',700);c.restore()});
  light(3318,728,70,'255,80,60',.35);
  if(op>.25&&!reduce){var sa=sm((op-.25)/.4);EMIT.push(function(){c.save();c.globalAlpha=.28*sa;c.strokeStyle='#f4f0e6';c.lineWidth=2.4;c.lineCap='round';
      for(var i=0;i<4;i++){var sx=3262+i*24,ph2=(t*26+i*9)%34;c.beginPath();c.moveTo(sx,700-ph2);c.quadraticCurveTo(sx+7,692-ph2,sx,682-ph2);c.stroke()}c.restore()});
    light(3296,700,90,'255,150,90',.2*op)}
  person(3414,G,{f:-1,shirt:'#3c2f57',apron:'#1f1f26',reach:[hX,hY],arms:[[0,0],[.25,-.5]],bob:Math.sin(t*1.3)*.5});
  pendant(2860,476,40);pendant(3100,476,40);pendant(3340,476,40);
  shopFront(X0,X1,top,'PROMOSYON');
}

/* ---------- 04 MATBAA ---------- */
function roller(x,y,r,a){var g=c.createRadialGradient(x-r*.3,y-r*.4,1,x,y,r);g.addColorStop(0,'#5a5d66');g.addColorStop(1,'#141518');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  circ(x,y,r*.32,'#9aa0aa');circ(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,1.8,'#cfd4dc')}
function st4(t){
  if(!seen(3860,4740))return;
  var X0=3880,X1=4720,top=320,i,k;
  shopBack(X0,X1,top,'brick','rgba(25,25,40,.42)');
  for(k=0;k<2;k++){var fx=3990+k*120;box(fx,500,100,60,'#1c1c20');poster(fx+4,504,92,52,k+1)}
  box(3936,G-6,728,4,'#d9b416');
  // besleme ünitesi
  metal(3944,596,50,214,'#c4c7cb',4);rr(3950,650,38,6,2);c.fillStyle='#2a2b30';c.fill();
  for(k=0;k<16;k++)box(3950,700+k*4,38,3,k%2?'#f4f2ec':'#dedad2');
  // baskı üniteleri
  for(i=0;i<4;i++){var x0=3998+i*96;
    metal(x0,590,92,124,'#d2d4d7',4);box(x0+90,594,2,116,'rgba(0,0,0,.2)');
    metal(x0+8,578,76,13,'#3a3c42',2);box(x0+12,580,68,5,CM[i]);
    c.fillStyle='#2a2b30';rr(x0+6,598,18,14,2);c.fill();txt(String(i+1),x0+15,605,12,'#f4f0e6',700);box(x0+30,603,26,4,CM[i]);
    rr(x0+12,620,68,58,3);c.fillStyle='#161a20';c.fill();
    c.save();rr(x0+12,620,68,58,3);c.clip();
    var a=reduce?0:t*4;roller(x0+28,638,11,a+i);roller(x0+60,638,11,-a-i);roller(x0+44,662,13,a*.8+i);
    box(x0+12,650,68,2,mx(CM[i],-.1));
    c.fillStyle='rgba(255,255,255,.1)';c.beginPath();c.moveTo(x0+20,620);c.lineTo(x0+34,620);c.lineTo(x0+16,678);c.lineTo(x0+12,678);c.lineTo(x0+12,640);c.closePath();c.fill();c.restore();
    for(k=0;k<4;k++)box(x0+16,690+k*4,30,1.5,'rgba(0,0,0,.25)');
    (function(lx,cc){EMIT.push(function(){circ(lx,694,2.4,cc)})})(x0+72,i===2?'#ffb040':'#5fe08a');light(x0+72,694,22,'120,255,150',.25)}
  metal(3990,712,394,98,'#4a4e55',4);for(k=0;k<14;k++)box(4006+k*26,730,14,2,'rgba(0,0,0,.35)');
  metal(3986,770,400,10,'#8a8d93',2);
  c.save();c.beginPath();c.rect(3986,780,400,4);c.clip();box(3986,780,400,4,'#ffc21a');c.fillStyle='#17161a';for(k=0;k<50;k++){c.beginPath();c.moveTo(3986+k*10,780);c.lineTo(3991+k*10,780);c.lineTo(3987+k*10,784);c.lineTo(3982+k*10,784);c.closePath();c.fill()}c.restore();
  // çıkış (delivery)
  metal(4386,594,96,216,'#d2d4d7',4);rr(4394,612,80,118,3);c.fillStyle='#161a20';c.fill();
  var ph=reduce?40:24+((t*3)%50);
  c.save();rr(4394,612,80,118,3);c.clip();
  box(4400,722,68,8,'#3a3d44');c.fillStyle='#ece8df';c.fillRect(4402,722-ph,64,ph);
  c.fillStyle='rgba(0,0,0,.14)';for(k=0;k<ph;k+=3)c.fillRect(4402,722-k,64,1);
  for(k=0;k<4;k++)box(4404+k*12,722-ph,10,2,CM[k]);
  var u=reduce?.4:(t*.9)%1,sxp=4394+Math.min(u/.6,1)*12,syp=630+Math.max(0,(u-.6)/.4)*(722-ph-632);
  box(sxp,syp,64,3,'#f6f3ec');for(k=0;k<4;k++)box(sxp+2+k*12,syp,10,3,CM[k]);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(4394,612,80,6);c.restore();
  wash(4394,612,80,118,'230,235,245',.3);
  // renk kontrol masası (ışık kabini)
  metal(4496,566,120,12,'#2a2b30',3);metal(4500,578,4,160,'#3a3c42');metal(4608,578,4,160,'#3a3c42');
  EMIT.push(function(){c.fillStyle=lgH(4504,4608,[[0,'#dfe8ff'],[.5,'#ffffff'],[1,'#dfe8ff']]);c.fillRect(4504,578,104,3)});
  bloom(4556,582,80,'230,240,255',.3);light(4556,700,190,'225,235,255',.75);spot(4556,580,150,160,'230,240,255',.3);
  c.fillStyle='#c9cbcf';c.beginPath();c.moveTo(4496,742);c.lineTo(4616,728);c.lineTo(4616,736);c.lineTo(4496,750);c.closePath();c.fill();
  metal(4500,750,6,62,'#4a4d54');metal(4606,736,6,76,'#4a4d54');
  c.fillStyle='#fbfaf6';c.beginPath();c.moveTo(4520,739);c.lineTo(4592,731);c.lineTo(4592,734);c.lineTo(4520,742);c.closePath();c.fill();
  for(k=0;k<4;k++)box(4524+k*14,736.5-k*1.5,10,2,CM[k]);
  // çalışanlar
  var lean=Math.sin(t*.7)*.5+.5;
  person(4496,G,{f:-1,shirt:'#2e3f5c',apron:'#1f1f26',reach:[4462,700+lean*10],arms:[[0,0],[.3,-.4]]});
  var lh=person(4648,G,{f:-1,shirt:'#5c2e2e',hair:'#4a3626',reach:[4584,724-lean*4],arms:[[0,0],[.7,-1.5]]});
  c.strokeStyle='#cfd2d8';c.lineWidth=2.4;c.beginPath();c.arc(lh[0]-6,lh[1]-2,6,0,TAU);c.stroke();ell(lh[0]-6,lh[1]-2,5,5,'rgba(190,220,255,.25)');
  pendant(4060,476,40);pendant(4300,476,40);
  shopFront(X0,X1,top,'MATBAA');
}

/* ---------- ara öğeler ---------- */
function van(){
  if(!seen(2360,2660))return;
  var y0=G+40;
  shade(2510,y0+2,150,7,.55);
  c.fillStyle=lgV(y0-142,y0-20,[[0,'#ffffff'],[.45,'#e8e5df'],[1,'#a4a19b']]);
  c.beginPath();c.moveTo(2382,y0-24);c.lineTo(2382,y0-128);c.quadraticCurveTo(2384,y0-142,2400,y0-142);c.lineTo(2560,y0-142);c.quadraticCurveTo(2574,y0-142,2584,y0-128);
  c.lineTo(2612,y0-92);c.quadraticCurveTo(2640,y0-86,2642,y0-70);c.lineTo(2642,y0-30);c.lineTo(2630,y0-24);c.closePath();c.fill();
  c.fillStyle=lgV(y0-136,y0-92,[[0,'#7486a0'],[1,'#1e2532']]);c.beginPath();c.moveTo(2556,y0-92);c.lineTo(2556,y0-134);c.lineTo(2570,y0-134);c.lineTo(2604,y0-92);c.closePath();c.fill();
  c.save();c.beginPath();c.rect(2382,y0-142,175,118);c.clip();
  c.fillStyle='#f7c51c';c.beginPath();c.moveTo(2382,y0-56);c.lineTo(2556,y0-92);c.lineTo(2556,y0-24);c.lineTo(2382,y0-24);c.closePath();c.fill();
  c.fillStyle='#1b1b1d';c.beginPath();c.moveTo(2382,y0-50);c.lineTo(2556,y0-86);c.lineTo(2556,y0-80);c.lineTo(2382,y0-44);c.closePath();c.fill();c.restore();
  bolt(2398,y0-132,46,'#f2b705');txt('YILDIRIM REKLAM',2484,y0-118,24,'#17161a',800);txt('Tabela · Baskı · Promosyon',2484,y0-98,12,'#4a4a50',600);
  box(2556,y0-92,1.5,66,'rgba(0,0,0,.2)');box(2540,y0-80,10,3,'#8f9298');
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(2390,y0-139,160,2);
  metal(2618,y0-36,26,10,'#3a3b3f',2);
  EMIT.push(function(){ell(2638,y0-62,3,5,'#fff6e0');box(2381,y0-82,3,12,'#ff3b30')});bloom(2639,y0-62,36,'255,245,220',.3);bloom(2382,y0-76,22,'255,50,40',.4);
  for(var k=0;k<2;k++){var wx=[2428,2590][k];c.fillStyle='#111113';c.beginPath();c.arc(wx,y0-24,28,Math.PI,TAU);c.fill();wheel(wx,y0-22,22)}
}
function totem(){
  if(!seen(3570,3680))return;
  shade(3624,G+28,46,5,.45);
  metal(3588,G+4,72,24,'#9a958e',2);
  c.fillStyle=lgH(3592,3656,[[0,'#3a3c42'],[.5,'#9ea2a9'],[1,'#33353a']]);rr(3592,500,64,306,4);c.fill();
  box(3598,508,52,62,'#16151a');
  EMIT.push(function(){c.save();c.shadowColor='rgba(255,186,40,.95)';c.shadowBlur=14*S*dpr;bolt(3610,514,50,'#ffc21a');c.restore();
    var nm=['ECZANE','KAFE','OPTİK','KUAFÖR'];
    for(var i=0;i<4;i++){c.fillStyle=lgV(580+i*54,624+i*54,[[0,'#ffffff'],[1,'#ece6d6']]);c.fillRect(3598,580+i*54,52,44);txt(nm[i],3624,602+i*54,14,'#1b1b1d',800)}});
  light(3624,690,220,'255,240,215',.5);bloom(3624,640,90,'255,240,220',.18);refl(3624,30,'255,240,215',.22);
}
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

/* ---------- işleme hattı ---------- */
function lightPass(){
  var ls=dpr*LQ;
  lc.setTransform(1,0,0,1,0,0);lc.globalCompositeOperation='source-over';lc.fillStyle='rgb(64,70,106)';lc.fillRect(0,0,lcv.width,lcv.height);
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
  for(i=0;i<HAZE.length;i++){var h=HAZE[i],g=c.createLinearGradient(0,h[1],0,h[1]+h[3]);g.addColorStop(0,'rgba(255,205,150,.09)');g.addColorStop(1,'rgba(255,205,150,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(h[0]-10,h[1]);c.lineTo(h[0]+10,h[1]);c.lineTo(h[0]+h[2]/2,h[1]+h[3]);c.lineTo(h[0]-h[2]/2,h[1]+h[3]);c.closePath();c.fill()}
  for(i=0;i<BLOOM.length;i++){var b=BLOOM[i];g=c.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);g.addColorStop(0,'rgba('+b[3]+','+b[4]+')');g.addColorStop(1,'rgba('+b[3]+',0)');
    c.fillStyle=g;c.fillRect(b[0]-b[2],b[1]-b[2],b[2]*2,b[2]*2)}
  for(i=0;i<REFL.length;i++){var r=REFL[i],sh=reduce?0:Math.sin(t*1.7+r[0]*.01)*2;
    c.save();c.translate(r[0]+sh,R+4);c.scale(r[1]/100,1.5);g=c.createRadialGradient(0,0,0,0,0,100);g.addColorStop(0,'rgba('+r[2]+','+r[3]+')');g.addColorStop(1,'rgba('+r[2]+',0)');
    c.fillStyle=g;c.fillRect(-100,0,200,100);c.restore()}
  c.globalCompositeOperation='source-over';
}
function finish(){
  c.setTransform(dpr,0,0,dpr,0,0);
  if(PAT.grain){c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.09;var ox=reduce?0:(Math.random()*128)|0,oy=reduce?0:(Math.random()*128)|0;
    c.translate(-ox,-oy);c.fillStyle=PAT.grain;c.fillRect(ox,oy,vw+128,vh+128);c.restore()}
  var g=c.createRadialGradient(vw/2,vh*.48,Math.min(vw,vh)*.3,vw/2,vh/2,Math.max(vw,vh)*.78);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(4,4,10,.55)');c.fillStyle=g;c.fillRect(0,0,vw,vh);
}
function stationLP(p,i){return cl((p-(A[i]-.04))/.18,0,1)}
function draw(p,t){
  K=cam(p);S=(vh/1000)*K.z;VX0=K.x-vw/2/S;VX1=K.x+vw/2/S;
  EMIT.length=0;LIGHTS.length=0;BLOOM.length=0;REFL.length=0;HAZE.length=0;
  c=mainC;backdrop(t);
  c=wctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,wcv.width,wcv.height);street();
  var l0=stationLP(p,0);
  st1(t,l0);st2(t);st3(t);st4(t);
  walkers(t);
  tree(80,41);lamp(180);lamp(1440);tree(2350,43);lamp(2660);totem();lamp(3740);tree(3820,47);lamp(4880);tree(5000,53);
  st1Front(t,l0);van();
  mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,mcv.width,mcv.height);mctx.drawImage(wcv,0,0);
  lightPass();glowPass(t);
  c=mainC;c.setTransform(1,0,0,1,0,0);c.drawImage(wcv,0,0);finish();
}
function vis(el,o,dy){el.style.opacity=o.toFixed(3);el.style.visibility=o<.01?'hidden':'visible';if(dy!=null)el.style.transform='translateY('+dy.toFixed(1)+'px)'}
function overlay(p){
  var h=1-sm(p/.05);vis(hero,h,-(1-h)*30);
  for(var i=0;i<caps.length;i++){var o=sm((p-A[i]-.05)/.03)*(1-sm((p-A[i]-.17)/.03));vis(caps[i],o,(1-o)*18);
    fills[i].style.transform='scaleX('+cl((p-A[i]+.04)/.22,0,1).toFixed(3)+')';
    navs[i].classList.toggle('on',p>=A[i]-.04&&p<A[i]+.18)}
  var fo=sm((p-.93)/.05);fin.style.opacity=fo.toFixed(3);fin.style.visibility=fo<.01?'hidden':'visible';
}
function readP(){var r=root.getBoundingClientRect(),tot=r.height-stage.clientHeight;return tot>0?cl(-r.top/tot,0,1):0}
var t0=performance.now(),ps=readP(),running=false,raf=0,alive=true;
function tNow(){return reduce?0:(performance.now()-t0)/1000}
function resize(){vw=Math.max(1,stage.clientWidth);vh=Math.max(1,stage.clientHeight);dpr=Math.min(window.devicePixelRatio||1,1.75);
  cv.width=wcv.width=mcv.width=Math.round(vw*dpr);cv.height=wcv.height=mcv.height=Math.round(vh*dpr);lcv.width=Math.ceil(cv.width*LQ);lcv.height=Math.ceil(cv.height*LQ);
  buildKeys();draw(ps,tNow());overlay(ps)}
function frame(){if(!running)return;var p=readP();ps+=(p-ps)*(reduce?1:.1);if(Math.abs(p-ps)<1e-4)ps=p;draw(ps,tNow());overlay(ps);raf=requestAnimationFrame(frame)}
function jump(p){var top=root.getBoundingClientRect().top+window.pageYOffset;window.scrollTo({top:top+p*(root.offsetHeight-stage.clientHeight),behavior:reduce?'auto':'smooth'})}
var onNav=function(e){jump(A[navs.indexOf(e.currentTarget)]+.11)};
navs.forEach(function(b){b.addEventListener('click',onNav)});
makePatterns();
var ro=null,io=null;
if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(stage)}else window.addEventListener('resize',resize);
if(window.IntersectionObserver){io=new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!running){running=true;raf=requestAnimationFrame(frame)}else if(!v){running=false;cancelAnimationFrame(raf)}});io.observe(root)}
else{running=true;raf=requestAnimationFrame(frame)}
resize();
if(document.fonts&&document.fonts.load)document.fonts.load('800 96px "Barlow Condensed"').then(function(){if(alive)draw(ps,tNow())},function(){});

return function(){
  alive=false;running=false;cancelAnimationFrame(raf);
  if(ro)ro.disconnect();else window.removeEventListener('resize',resize);
  if(io)io.disconnect();
  navs.forEach(function(b){b.removeEventListener('click',onNav)});
};
}
