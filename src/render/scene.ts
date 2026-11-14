import * as THREE from 'three';
import { LEVELS } from '../content/levels';
import { zoneState } from '../game/grid';
import type { State } from '../game/types';
import { stoneTexture, spriteTexture } from './art';
const CELL=2.4;
export class DungeonView {
 renderer:THREE.WebGLRenderer; scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(68,1,0.05,45);
 private world=new THREE.Group();private actors=new THREE.Group();private props=new THREE.Group();private effects=new THREE.Group();private spellFX=new THREE.Group();private fxTarget=new THREE.Vector3();private fxOrigin=new THREE.Vector3();private fxMaterial=new THREE.MeshBasicMaterial({color:0x9ceeff,transparent:true,opacity:1});private fxParticles:THREE.Mesh[]=[];private fxLineGeometry=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(24),3));private fxLineMaterial=new THREE.LineBasicMaterial({color:0x9ceeff,transparent:true,opacity:1});private fxLine=new THREE.Line(this.fxLineGeometry,this.fxLineMaterial);private current=-1;private state?:State;private head=new THREE.PointLight(0xffd598,24,13,1.4);private cool=new THREE.PointLight(0x6db5cc,5,9,1.5);
 private spriteCache=new Map<string,THREE.SpriteMaterial>();private materials:THREE.Material[]=[];private box=new THREE.BoxGeometry(1,1,1);private cylinder=new THREE.CylinderGeometry(0.13,0.17,1,8);private ring=new THREE.TorusGeometry(0.55,0.025,5,32);private sparks?:THREE.Points;private fromPos=new THREE.Vector3();private toPos=new THREE.Vector3();private startYaw=0;private endYaw=0;private animStart=0;private duration=140;private fxStart=0;private fxKind='';private spriteObjects=new Map<string,THREE.Sprite>();private torchFlames:THREE.Mesh[]=[];private torchLights=[new THREE.PointLight(0xffaf59,10,6,1.5),new THREE.PointLight(0xffb873,8,6,1.5)];private overlay=false;private waterFull=new THREE.MeshBasicMaterial({color:0x85bfc1});private waterEmpty=new THREE.MeshBasicMaterial({color:0x314146});private seamMaterial=new THREE.MeshBasicMaterial({color:0x5e9b9e});private tellBoss=new THREE.MeshBasicMaterial({color:0xe07157,transparent:true,opacity:0.55,side:THREE.DoubleSide});private tellShot=new THREE.MeshBasicMaterial({color:0xd0a34a,transparent:true,opacity:0.55,side:THREE.DoubleSide});private waterGeo=new THREE.CircleGeometry(0.44,16);private bowlGeo=new THREE.CylinderGeometry(0.5,0.3,0.5,10);private ambient=new THREE.HemisphereLight(0xc2d4d3,0x282524,1.7);
 constructor(host:HTMLElement){
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0x10191e);host.append(this.renderer.domElement);
  this.scene.add(this.world,this.actors,this.props,this.effects,this.head,this.cool,this.ambient,...this.torchLights,this.spellFX);this.spellFX.add(this.fxLine);const fxGeo=new THREE.OctahedronGeometry(0.07,0);for(let i=0;i<12;i++){const part=new THREE.Mesh(fxGeo,this.fxMaterial);this.fxParticles.push(part);this.spellFX.add(part);}this.spellFX.visible=false;this.scene.fog=new THREE.FogExp2(0x172329,0.045);this.camera.position.set(3*CELL,1.2,14*CELL);
  window.addEventListener('resize',()=>this.resize(host));this.resize(host);
  this.renderer.setAnimationLoop((time)=>this.frame(time));
 }
 resize(host:HTMLElement){const w=host.clientWidth,h=host.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/Math.max(h,1);this.camera.updateProjectionMatrix();}
 setQuality(low:boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.7));this.renderer.setSize(this.renderer.domElement.clientWidth,this.renderer.domElement.clientHeight);}
 setOverlay(on:boolean){this.overlay=on;}
 private mat(color:THREE.ColorRepresentation,map?:THREE.Texture):THREE.MeshLambertMaterial {const m=new THREE.MeshLambertMaterial({color,map});this.materials.push(m);return m;}
 private cube(group:THREE.Group,x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:THREE.Material){const m=new THREE.Mesh(this.box,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;}
 private clear(group:THREE.Group){group.clear();}
 private build(s:State){
  this.current=s.zone;this.world.traverse(obj=>{if(obj instanceof THREE.InstancedMesh)obj.dispose();if(obj instanceof THREE.Points){obj.geometry.dispose();(obj.material as THREE.Material).dispose();}if(obj instanceof THREE.Mesh&&obj.geometry!==this.box&&obj.geometry!==this.cylinder&&obj.geometry!==this.ring){obj.geometry.dispose();if(!this.materials.includes(obj.material as THREE.Material))(obj.material as THREE.Material).dispose();}});this.clear(this.world);this.clear(this.props);this.clear(this.actors);this.clear(this.effects);this.spriteObjects.clear();this.torchFlames=[];for(const m of this.materials){if('map'in m)(m as THREE.MeshLambertMaterial).map?.dispose();m.dispose();}this.materials=[];
  const l=LEVELS[s.zone],wall=this.mat(s.zone===1?0xb0bfba:s.zone===2?0xa8bbca:0xc2b491,stoneTexture(false,s.zone)),floor=this.mat(0x9a9d92,stoneTexture(true,s.zone)),trim=this.mat(0x424a48),wood=this.mat(0x594334),brass=this.mat(0xb49a61),dark=this.mat(0x162632);
  const bookMaterials=[0x6c8b8b,0x805953,0x887c52,0x465e78].map(c=>this.mat(c));
  const walk:{x:number;y:number}[]=[],walls:{x:number;y:number}[]=[];
  for(let y=0;y<17;y++)for(let x=0;x<17;x++){if(l.map[y][x]==='.')walk.push({x,y});else if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>l.map[y+dy]?.[x+dx]==='.'))walls.push({x,y});}
  const wm=new THREE.InstancedMesh(this.box,wall,walls.length),fm=new THREE.InstancedMesh(this.box,floor,walk.length),cm=new THREE.InstancedMesh(this.box,trim,walk.length);const o=new THREE.Object3D();
  walls.forEach((p,i)=>{o.position.set(p.x*CELL,1.5,p.y*CELL);o.scale.set(CELL,3,CELL);o.updateMatrix();wm.setMatrixAt(i,o.matrix);});
  walk.forEach((p,i)=>{o.position.set(p.x*CELL,-0.13,p.y*CELL);o.scale.set(CELL,0.25,CELL);o.updateMatrix();fm.setMatrixAt(i,o.matrix);o.position.y=3.1;o.scale.y=0.2;o.updateMatrix();cm.setMatrixAt(i,o.matrix);});this.world.add(wm,fm,cm);
  for(const p of walk){const x=p.x*CELL,z=p.y*CELL;
   if((p.x*3+p.y*7)%7===0){const side=l.map[p.y]?.[p.x-1]==='#'?-1:l.map[p.y]?.[p.x+1]==='#'?1:0;if(side){const tx=x+side*1.08;this.cube(this.world,tx,1.5,z,0.14,0.6,0.14,wood);this.cube(this.world,tx,1.33,z,0.27,0.1,0.26,brass);const flame=new THREE.Mesh(new THREE.OctahedronGeometry(0.12,0),new THREE.MeshBasicMaterial({color:s.zone===2?0x8ae2da:0xffc06c}));flame.scale.y=2;flame.position.set(tx,1.89,z);this.world.add(flame);this.torchFlames.push(flame);}}
   if((p.x+p.y)%3===0&&l.map[p.y-1]?.[p.x]==='#'){
    this.cube(this.world,x,1.55,z-1.06,0.16,0.5,0.18,wood);this.cube(this.world,x,1.42,z-0.98,0.3,0.12,0.35,brass);
    const flame=new THREE.Mesh(new THREE.OctahedronGeometry(0.14,0),new THREE.MeshBasicMaterial({color:s.zone===2?0x9de5d8:0xffbd62}));flame.position.set(x,1.93,z-0.95);flame.scale.y=2;this.world.add(flame);this.torchFlames.push(flame);
   }
   if((p.x+p.y*2)%8===0&&l.map[p.y-1]?.[p.x]==='#'){
    for(const side of [-1,1]){const col=new THREE.Mesh(this.cylinder,trim);col.position.set(x+side*0.9,1.45,z-0.85);col.scale.y=2.9;this.world.add(col);this.cube(this.world,x+side*0.9,0.17,z-0.85,0.5,0.33,0.5,trim);this.cube(this.world,x+side*0.9,2.82,z-0.85,0.5,0.3,0.5,trim);}this.cube(this.world,x,2.81,z-0.85,2.3,0.22,0.35,trim);
   }
   if(s.zone===2&&p.y>=11&&p.x<=6&&(l.map[p.y]?.[p.x-1]==='#'||l.map[p.y-1]?.[p.x]==='#')){
    const alongX=l.map[p.y-1]?.[p.x]==='#',bx=x+(alongX?0:-1.02),bz=z+(alongX?-1.02:0),shelf=new THREE.Group();shelf.position.set(bx,0,bz);if(!alongX)shelf.rotation.y=Math.PI/2;this.world.add(shelf);
    this.cube(shelf,0,1,0,2,2.1,0.32,wood);for(let row=0;row<3;row++){this.cube(shelf,0,0.3+row*0.6,0.24,2,0.07,0.55,brass);for(let j=0;j<7;j++){this.cube(shelf,-0.78+j*0.25,0.58+row*0.6,0.27,0.17,0.42+(j%3)*0.04,0.26,bookMaterials[(j+row)%4]);}}
   }
   if(s.zone===1&&p.x===14&&p.y===6){for(const dx of [-0.85,0.85])this.cube(this.world,x+dx,0.05,z,0.08,0.09,2.4,brass);}
  }
  const geo=new THREE.BufferGeometry();const a=new Float32Array(90*3);for(let i=0;i<90;i++){a[i*3]=(i*3.719%30)+5;a[i*3+1]=((i*0.79)%2.7)+0.1;a[i*3+2]=(i*5.171%32)+3;}geo.setAttribute('position',new THREE.BufferAttribute(a,3));this.sparks=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc6b77f,size:0.025,transparent:true,opacity:0.45}));this.world.add(this.sparks);
  // Batch static masonry, shelves, books and trims by their shared material.
  this.world.updateMatrixWorld(true);const batches=new Map<THREE.Material,THREE.Mesh[]>();this.world.traverse(obj=>{if(obj instanceof THREE.Mesh&&!(obj instanceof THREE.InstancedMesh)&&obj.geometry===this.box){const mat=obj.material as THREE.Material;const list=batches.get(mat)??[];list.push(obj);batches.set(mat,list);}});
  for(const [mat,meshes]of batches){const batch=new THREE.InstancedMesh(this.box,mat,meshes.length);meshes.forEach((mesh,i)=>{batch.setMatrixAt(i,mesh.matrixWorld);mesh.removeFromParent();});batch.computeBoundingSphere();this.world.add(batch);}
  // Keep decoration materials shared through the lifetime of this level.
  this.props.userData={wood,brass,dark,trim};
 }
 private sprite(kind:string):THREE.Sprite {let m=this.spriteCache.get(kind);if(!m){m=new THREE.SpriteMaterial({map:spriteTexture(kind),transparent:true,alphaTest:0.15});this.spriteCache.set(kind,m);}return new THREE.Sprite(m);}
 private updateProps(s:State){
  this.props.clear();const {wood,brass,dark,trim}=this.props.userData as Record<string,THREE.Material>;
  for(const f of LEVELS[s.zone].features){const opened=zoneState(s).opened.includes(f.id),x=f.x*CELL,z=f.y*CELL;
   if((f.kind==='door'||f.kind==='secret')&&!opened){
    const side=LEVELS[s.zone].map[f.y]?.[f.x-1]==='#'||LEVELS[s.zone].map[f.y]?.[f.x+1]==='#';const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=side?0:Math.PI/2;this.props.add(g);
    if(f.kind==='secret'){this.cube(g,0,1.5,0,2.4,3,0.2,trim);const gl=this.seamMaterial;this.cube(g,0.6,1.5,0.12,0.025,1.3,0.01,gl);}
    else{this.cube(g,0,1.35,0,2.05,2.7,0.18,wood);for(const y of [0.35,1.2,2.3])this.cube(g,0,y,0.12,2.1,0.09,0.08,brass);for(const xx of [-0.88,0.88])this.cube(g,xx,1.42,0.1,0.14,2.84,0.18,trim);this.cube(g,0,2.84,0,2.35,0.22,0.4,trim);const r=new THREE.Mesh(this.ring,brass);r.scale.setScalar(0.2);r.position.set(0.5,1.1,0.25);g.add(r);}
   }else if(f.kind==='merchant'||f.kind==='antarion'){const sprite=this.sprite(f.kind==='merchant'?'merchant':'antarion');sprite.position.set(x,1.05,z);sprite.scale.set(1.45,2.2,1);this.props.add(sprite);}
   else if(f.kind==='chest'&&!opened){this.cube(this.props,x,0.3,z,1,0.6,0.65,wood);this.cube(this.props,x,0.65,z,1,0.2,0.7,brass);this.cube(this.props,x,0.4,z+0.36,0.15,0.2,0.07,brass);}
   else if(f.kind==='note'){const m=this.cube(this.props,x,0.65,z,0.65,0.06,0.45,brass);m.rotation.x=0.3;this.cube(this.props,x,0.3,z,0.12,0.6,0.12,wood);}
   else if((f.kind==='key'||f.kind==='rune')&&!opened){const r=new THREE.Mesh(this.ring,brass);r.position.set(x,0.85,z);r.scale.setScalar(0.4);r.rotation.y=Math.PI/4;this.props.add(r);this.cube(this.props,x,0.45,z,0.1,0.55,0.1,brass);}
   else if(f.kind==='runes'||f.kind==='seal'){for(let i=0;i<3;i++){const r=new THREE.Mesh(this.ring,brass);r.scale.setScalar(0.4);r.position.set(x+(i-1)*0.5,0.75,z);r.rotation.x=-Math.PI/4;this.props.add(r);}this.cube(this.props,x,0.35,z,1.5,0.65,0.6,dark);}
   else if(f.kind==='bridgeSwitch'){this.cube(this.props,x,0.35,z,0.6,0.7,0.6,trim);const lever=this.cube(this.props,x,0.95,z,0.09,0.7,0.09,brass);lever.rotation.z=(zoneState(s).bridge-1)*0.5;}
   else if(f.kind==='pillar'){const col=new THREE.Mesh(this.cylinder,opened?brass:trim);col.position.set(x,1.35,z);col.scale.set(3.2,2.7,3.2);this.props.add(col);const r=new THREE.Mesh(this.ring,brass);r.position.set(x,1.5,z+0.46);this.props.add(r);}
   else if(f.kind==='spring'){const bowl=new THREE.Mesh(this.bowlGeo,trim);bowl.position.set(x,0.3,z);this.props.add(bowl);const water=new THREE.Mesh(this.waterGeo,opened?this.waterEmpty:this.waterFull);water.rotation.x=-Math.PI/2;water.position.set(x,0.56,z);this.props.add(water);}
   else if(f.kind==='exit'||f.kind==='back'){for(let i=0;i<5;i++)this.cube(this.props,x,0.08+i*0.12,z+(i-2)*0.28,1.4,0.16,0.3,trim);const r=new THREE.Mesh(this.ring,brass);r.position.set(x,1.8,z-0.7);r.scale.setScalar(0.6);this.props.add(r);}
  }
 }
 sync(s:State,snap=false){
  this.state=s;const zoneChange=this.current!==s.zone;if(zoneChange)this.build(s);this.updateProps(s);
  const active=new Set<string>();for(const e of zoneState(s).enemies){if(e.hp<=0)continue;active.add(e.id);let sprite=this.spriteObjects.get(e.id);if(!sprite){sprite=this.sprite(e.kind);this.actors.add(sprite);this.spriteObjects.set(e.id,sprite);}sprite.position.set(e.x*CELL,e.kind==='mold'?0.67:e.kind==='boss'?1.36:1.04,e.y*CELL);const height=e.kind==='mold'?1.4:e.kind==='boss'?2.8:2.15;sprite.scale.set(height*0.68,height,1);}
  for(const [id,obj]of this.spriteObjects){if(!active.has(id)){this.actors.remove(obj);this.spriteObjects.delete(id);}}
  this.effects.clear();for(const e of zoneState(s).enemies){if(!e.tell||e.hp<=0)continue;const m=e.kind==='boss'?this.tellBoss:this.tellShot;const r=new THREE.Mesh(this.ring,m);r.rotation.x=-Math.PI/2;r.position.set(e.tell.x*CELL,0.05,e.tell.y*CELL);r.scale.setScalar(e.kind==='boss'&&e.phase===2?3.6:1.5);this.effects.add(r);}
  if(s.zone===1&&s.cycles%4===2){const ring=new THREE.Mesh(this.ring,this.tellShot);ring.rotation.x=-Math.PI/2;ring.position.set(9*CELL,0.07,8*CELL);ring.scale.setScalar(1.8);this.effects.add(ring);}
  const nearest=[...this.torchFlames].sort((a,b)=>a.position.distanceToSquared(this.camera.position)-b.position.distanceToSquared(this.camera.position));this.torchLights.forEach((light,i)=>{light.color.setHex(s.zone===2?0x9addd0:0xffaf59);if(nearest[i])light.position.copy(nearest[i].position);light.visible=!!nearest[i];});
  const p=s.player;this.fromPos.copy(this.camera.position);this.toPos.set(p.x*CELL,1.16,p.y*CELL);this.startYaw=this.camera.rotation.y;const target=-p.facing*Math.PI/2;const diff=Math.atan2(Math.sin(target-this.startYaw),Math.cos(target-this.startYaw));this.endYaw=this.startYaw+diff;this.animStart=performance.now();
  if(snap||zoneChange){this.camera.position.copy(this.toPos);this.camera.rotation.y=this.endYaw;this.fromPos.copy(this.toPos);this.startYaw=this.endYaw;}
 }
 setFast(fast:boolean){this.duration=fast?40:140;}
 effect(kind:string,point?:{x:number;y:number}){this.fxStart=performance.now();this.fxKind=kind;
  const colors:Record<string,number>={spark:0x9ceeff,fire:0xffa34e,echo:0xbea8ff,bolt:0xd9c68f};
  this.spellFX.visible=!!point&&kind in colors;if(!point)return;this.fxTarget.set(point.x*CELL,0.95,point.y*CELL);this.fxOrigin.copy(this.camera.position);this.fxOrigin.y=0.6;this.fxMaterial.color.setHex(colors[kind]??0x9ceeff);this.fxLineMaterial.color.copy(this.fxMaterial.color);
 }

 stats(){return {calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,textures:this.renderer.info.memory.textures,position:this.camera.position.toArray()};}
 private frame(time:number){
  if(!this.state)return;const t=Math.min(1,(performance.now()-this.animStart)/this.duration),smooth=t*t*(3-2*t);this.camera.position.lerpVectors(this.fromPos,this.toPos,smooth);this.camera.rotation.y=this.startYaw+(this.endYaw-this.startYaw)*smooth;
  this.head.position.copy(this.camera.position);this.head.position.y=1.7;this.cool.position.set(this.camera.position.x+Math.sin(this.camera.rotation.y)*4,1.5,this.camera.position.z-Math.cos(this.camera.rotation.y)*4);
  const pulse=1+Math.sin(time*0.004)*0.08;for(const f of this.torchFlames)f.scale.y=2*pulse;
  if(this.sparks)this.sparks.position.y=Math.sin(time*0.00025)*0.12;
  const fx=performance.now()-this.fxStart;if(this.spellFX.visible){if(fx>=300)this.spellFX.visible=false;else{const progress=fx/300;this.fxMaterial.opacity=1-progress;this.fxLineMaterial.opacity=1-progress;const attr=this.fxLineGeometry.getAttribute('position');for(let i=0;i<8;i++){const f=i/7,zig=this.fxKind==='spark'?Math.sin(i*8.5+time*0.08)*0.12:0;attr.setXYZ(i,this.fxOrigin.x+(this.fxTarget.x-this.fxOrigin.x)*f+zig,this.fxOrigin.y+(this.fxTarget.y-this.fxOrigin.y)*f+zig,this.fxOrigin.z+(this.fxTarget.z-this.fxOrigin.z)*f);}attr.needsUpdate=true;this.fxLineGeometry.computeBoundingSphere();this.fxLine.visible=this.fxKind==='spark'||this.fxKind==='bolt';this.fxParticles.forEach((part,i)=>{const angle=i*2.4,radius=(0.1+progress*0.85)*(i%3+1)*0.4;part.position.set(this.fxTarget.x+Math.cos(angle)*radius,this.fxTarget.y+Math.sin(angle*2)*radius+progress*0.5,this.fxTarget.z+Math.sin(angle)*radius);part.rotation.set(time*0.003+i,i,time*0.001);part.scale.setScalar(this.fxKind==='fire'?2:1);});}}
  if(fx<300){const colors:Record<string,number>={spark:0x9ceeff,fire:0xffa34e,echo:0xbea8ff,heal:0x98ddb1};this.cool.color.setHex(colors[this.fxKind]??0xaad4db);this.cool.intensity=5+(1-fx/300)*16;}else{this.cool.color.setHex(0x6db5cc);this.cool.intensity=5;}
  if(this.overlay)this.camera.rotation.y+=Math.sin(time*0.00015)*0.025;
  this.renderer.render(this.scene,this.camera);
 }
}
