import * as THREE from 'three';
export function stoneTexture(floor=false,zone=0):THREE.CanvasTexture {
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;
 g.fillStyle=floor?'#252a2a':zone===1?'#394342':zone===2?'#343d48':'#45443d';g.fillRect(0,0,256,256);
 let seed=81;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const h=floor?128:64;for(let row=0;row<256/h;row++){const shift=row%2?64:0;for(let xx=-128;xx<300;xx+=128){const x=xx+shift;
  const shade=Math.floor(rnd()*22)+45;g.fillStyle=`rgb(${shade+zone*2},${shade+2+zone*3},${shade-3+zone*6})`;g.fillRect(x+3,row*h+3,122,h-6);g.strokeStyle='#78796b55';g.strokeRect(x+4,row*h+4,121,h-8);g.fillStyle='#111b2066';g.fillRect(x+6,row*h+h-7,119,3);
  for(let i=0;i<90;i++){g.fillStyle=rnd()>.5?'#a1a19616':'#030c1622';g.fillRect(x+rnd()*126,row*h+rnd()*h,1+rnd()*4,1+rnd()*3);}
  if(rnd()>.4){g.strokeStyle='#11191d77';g.beginPath();const sx=x+15+rnd()*60,sy=row*h+12;g.moveTo(sx,sy);g.lineTo(sx+9,sy+9);g.lineTo(sx+4,sy+19);g.stroke();}
 }}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
export function spriteTexture(kind:string):THREE.CanvasTexture {
 const c=document.createElement('canvas');c.width=256;c.height=384;const g=c.getContext('2d')!;g.scale(2,2);
 g.lineJoin='round';g.lineCap='round';
 const path=(d:string,fill:string,stroke='#121c24',width=2)=>{const p=new Path2D(d);g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=width;g.fill(p);g.stroke(p);};
 const ellipse=(x:number,y:number,rx:number,ry:number,fill:string)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();};
 const line=(d:string,color:string,w=2)=>{g.strokeStyle=color;g.lineWidth=w;g.stroke(new Path2D(d));};
 ellipse(64,184,40,6,'#00000055');
 if(kind==='mold'){
  path('M18 175 8 166 28 149 33 128 47 119 75 121 91 140 100 168 116 176 96 183 27 183Z','#58705a');
  path('M20 131Q27 86 64 89Q105 87 115 133Q95 145 67 138Q45 148 20 131Z','#669e8e');
  path('M22 129Q46 112 75 118L107 132 69 138Z','#88b6a1');
  for(const [x,y,r] of [[40,111,7],[68,100,6],[89,115,9],[60,125,4]])ellipse(x,y,r,r*0.6,'#d3bf75');
  path('M42 150Q64 141 84 150L77 167 47 165Z','#152d2d');ellipse(49,149,4,3,'#f0d887');ellipse(76,149,4,3,'#f0d887');line('M49 157 55 162 61 155 68 163 76 157','#d7d9ab');
  line('M29 168 21 177m21-6-4 10m47-14 9 13M58 139v5','#9bb995');
 }else if(kind==='goblin'){
  path('M40 141 35 178 22 182 22 187 50 187 57 148M70 144 76 184 102 185 99 179 88 175 84 140','#394948');
  path('M40 85 28 106 19 140 33 143 45 116 43 149 85 149 81 113 98 140 108 130 92 93 75 84Z','#7a6448');
  path('M42 54 18 43 28 70 45 77M80 54 111 40 99 72 81 79','#9aa56b');
  path('M40 50Q63 34 88 51L86 81 73 95 50 90 36 73Z','#8c9d62');
  path('m39 46 10-19 28-3 17 26-31-4Z','#43575b');path('M56 26 77 26 82 43 65 39Z','#7d9191');
  line('M46 62 57 64m16-2 10-3','#262e2a',3);ellipse(53,65,2,2,'#e9d284');ellipse(77,64,2,2,'#e9d284');path('m60 66-3 13 12 1','#708052');line('M50 84q13-5 25 0','#233b30');
  path('M26 105 40 96 48 110 38 126 25 121Z','#668080');line('M35 124 85 144','#b6a16b',5);path('M67 122 90 117 99 147 73 151Z','#4f4a3c');
  path('m107 129-1-55 7-5 4 60Z','#bdc3b4');line('M100 127h23','#a38b55',4);
 }else if(kind==='guard'){
  path('M44 134 42 175 30 182 30 188 57 188 63 142M70 140 74 187 101 187 100 181 90 172 87 134Z','#8c8e81');
  path('M38 74 25 87 27 128 41 141 86 141 103 116 99 83 80 72Z','#65777a');
  path('M40 91 84 88 85 126 66 143 40 130Z','#8e9b96');line('M44 99 80 98M45 110 81 109M48 122 77 121','#3e535b',3);
  path('M43 37 58 23 82 30 91 50 84 76 50 78 38 61Z','#91a09a');path('M43 49 85 47 82 62 45 64Z','#283e47');line('M54 55h7m13-1h5','#8fe5de',3);path('m58 65 1 15 17-2 5-13','#b8b4a0');line('M64 71v8m7-9v8M65 26l-4 15 10 7-4 17','#364c56',3);
  path('M21 94 48 92 48 141 31 157 13 139 11 107Z','#4c666c');path('m19 107 22-7-2 34-10 11-10-14Z','#7b8d87');line('m29 104 3 32','#c6b77b',3);
  path('m100 126 7-96 5-8 4 11-4 94Z','#bdc8bd');line('m98 124 24 0','#b49b61',4);
 }else if(kind==='archer'){
  path('M44 129 38 180 30 187 59 185 63 146 71 185 96 188 87 175 82 125Z','#44536b');
  path('M43 63 25 100 35 145 90 143 100 96 78 62Z','#58697c');path('M42 67 61 56 85 71 82 113 64 133 43 113Z','#7f8f94');
  path('M45 36 63 23 82 38 91 69 75 62 47 65 32 75Z','#42556d');path('m48 45 31-2-1 22-33 1Z','#152638');ellipse(69,53,5,4,'#b9f3ef');line('m40 40 16-6 5 8','#94a6af');
  path('M26 99 15 111 39 128 66 108 61 95 37 110Z','#7e8f94');path('M89 94 104 105 95 123 71 111 73 99Z','#829394');
  path('m63 118-5-56 8-7 8 60Z','#b29a67');path('M28 85Q62 62 103 80L75 100 65 110 50 101Z','#879da1');line('m29 85 35 23 38-28','#d4ccb1',1);line('m63 81 2 46','#77d8da',3);
 }else if(kind==='scribe'){
  path('M52 44 26 85 34 123 15 173 37 165 30 188 60 173 76 188 90 167 112 174 95 131 103 91 80 43Z','#433e5d');
  path('M51 48 64 21 84 49 78 76 59 77 43 66Z','#6d657c');path('M52 48 78 45 75 66 56 68Z','#16252f');ellipse(59,55,3,2,'#bc9bd6');ellipse(72,54,3,2,'#bc9bd6');
  path('M33 90 7 114 32 145 49 129 28 115 48 104M89 89 120 115 101 139 82 125 103 114 82 102Z','#6e6280');
  path('M48 83 75 86 87 167 63 151 44 171Z','#858097');line('M54 90l14 6-12 8 18 6-18 9m2 12 12 5-13 10m-27 9-4 15m65-19 8 17','#d8c5c3',2);
  path('m16 107 24-5 6 25-23 6Z','#b4ac8d');line('m21 112 13-4m-11 10 14-4','#5b6c6b');
 }else if(kind==='boss'){
  path('M34 136 25 178 17 188 52 188 61 145 73 146 77 186 114 186 101 175 96 132Z','#455361');
  path('M29 65 13 80 11 119 32 130 34 150 99 151 99 124 120 114 115 76 91 62Z','#78868a');
  path('m32 74 32-14 32 15-4 58-28 22-30-24Z','#9aa39d');path('m44 90 20-10 20 12-6 30-16 13-17-16Z','#1a3948');path('m53 99 11-12 11 13-11 22Z','#8fe1df');
  path('M40 34 35 10 53 23 64 7 76 24 96 12 88 39 87 64 43 66Z','#9da49a');path('M47 42 80 40 78 60 48 62Z','#344e59');line('m52 48 19 0','#b0f0e4',3);line('M53 28h23m-32 39 38 0M21 86l6 27m80-29-2 27','#bdb795',3);
  path('m5 114 19-6 10 17-12 21-17-6Z','#596d75');path('m101 114 18-7 9 21-9 18-20-11Z','#586e77');line('m40 89 7-6m35 41 7 8M50 139l-6 6','#cef0dc');
 }else if(kind==='antarion'){
  path('M47 81 34 124 25 187 104 187 91 119 79 79Z','#5b6479');path('M52 85 70 81 84 181 43 181Z','#bdc7be');path('M50 50 75 46 80 66 68 84 53 74Z','#a9c4c3');
  path('M44 52Q43 13 71 5L81 33 93 50 70 47Z','#6d7793');line('m56 30 18 5','#d5c594',3);path('M46 49 39 79 54 69 53 52M77 49l13 23-13-6Z','#e1e0c9');
  line('M57 59h4m10-2h3','#263a4c',2);line('M62 71l8 0','#677c83');path('M35 103 21 123 42 137 59 121 52 112 39 123M85 99l20 29-10 9-20-21Z','#798396');
  path('m24 122 22-5 19 8 19-3-3 21-19 3-18-9-22 3Z','#cfc8ab');line('m46 120-2 17m4-13 10 5m-10 2 8 4','#766c55');line('M101 80v104','#bcaa72',4);ellipse(101,78,6,8,'#91d8de');
 }else if(kind==='merchant'){
  path('M39 138 36 182 24 187 58 188 62 148 71 186 102 187 92 179 88 139Z','#424f58');path('M42 73 25 96 26 134 42 149 88 147 102 127 97 89 77 72Z','#887966');
  path('M43 83 78 80 90 153 37 154Z','#9d6546');path('M42 42Q65 20 83 43L86 68 75 84 52 79 41 60Z','#c89670');path('M39 47 41 24 75 21 90 46 76 40 69 50 53 40Z','#704746');
  line('m48 56 8 0m16-1h5M59 70l11-1','#533c3a');line('m42 93 41 40','#c3aa77',3);path('m51 116 30-2 1 24-29 2Z','#694b3b');
  for(let i=0;i<3;i++){ellipse(54+i*11,133,3,3,'#dbbe75');line(`M${54+i*11} 137v12m-2-3h5`,'#d9b86b');}
  path('M27 97 15 127 28 135 40 109M92 95l20 29-13 9-20-22Z','#b78d6c');
 }
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;return texture;
}
