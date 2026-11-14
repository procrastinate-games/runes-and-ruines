import { LEVELS, DIRS, key } from '../content/levels';
import type { State, Point, Feature } from './types';
export const zoneState=(s:State)=>s.zones[s.zone];
export const features=(s:State)=>LEVELS[s.zone].features;
export const distance=(a:Point,b:Point)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function featureBlocked(s:State,f:Feature):boolean {
 if(zoneState(s).opened.includes(f.id))return false;
 if(f.kind==='door'||f.kind==='secret')return true;
 if(f.kind==='bridge')return !s.flags.bridgeSolved;
 return false;
}
export function solid(s:State,x:number,y:number):boolean {
 if(LEVELS[s.zone].map[y]?.[x]!=='.')return true;
 return features(s).some(f=>f.x===x&&f.y===y&&featureBlocked(s,f));
}
export function occupied(s:State,x:number,y:number,except?:string):boolean {
 return zoneState(s).enemies.some(e=>e.hp>0&&e.id!==except&&e.x===x&&e.y===y)||features(s).some(f=>f.x===x&&f.y===y&&(f.kind==='merchant'||f.kind==='antarion'));
}
export function lineOfSight(s:State,a:Point,b:Point):boolean {
 let x=a.x,y=a.y;const dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1;let err=dx+dy;
 while(x!==b.x||y!==b.y){const oldX=x,oldY=y,e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}
  if(x!==oldX&&y!==oldY&&(solid(s,x,oldY)||solid(s,oldX,y)))return false;
  if(solid(s,x,y))return false;
 }return true;
}
export function pathStep(s:State,a:Point,b:Point,id?:string):Point|undefined {
 const queue=[{...a,first:undefined as Point|undefined}],seen=new Set([key(a.x,a.y)]);
 for(let i=0;i<queue.length;i++){const cur=queue[i];for(const d of DIRS){const p={x:cur.x+d.x,y:cur.y+d.y};const k=key(p.x,p.y);if(seen.has(k)||solid(s,p.x,p.y)||occupied(s,p.x,p.y,id))continue;
  const first=cur.first??p;if(p.x===b.x&&p.y===b.y)return first;seen.add(k);queue.push({...p,first});
 }}return undefined;
}
export function reveal(s:State):void {
 const z=zoneState(s),p=s.player;const known=new Set(z.known);z.visited=[...new Set([...z.visited,key(p.x,p.y)])];
 for(let y=p.y-3;y<=p.y+3;y++)for(let x=p.x-3;x<=p.x+3;x++){if(x<0||y<0||x>16||y>16||distance(p,{x,y})>4)continue;
  // Reveal opaque boundary cells, without revealing the space behind them.
  if(lineOfSight(s,p,{x,y})||DIRS.some(d=>distance(p,{x:x+d.x,y:y+d.y})<=3&&!solid(s,x+d.x,y+d.y)&&lineOfSight(s,p,{x:x+d.x,y:y+d.y})))known.add(key(x,y));
 }z.known=[...known];
}
export function contextFeature(s:State):Feature|undefined {
 const p=s.player,d=DIRS[p.facing];const active=(f:Feature)=>!zoneState(s).opened.includes(f.id)||['exit','back','merchant','antarion','runes','seal','bridgeSwitch','pillar','note'].includes(f.kind);
 return features(s).find(f=>f.x===p.x+d.x&&f.y===p.y+d.y&&active(f))??features(s).find(f=>f.x===p.x&&f.y===p.y&&active(f));
}
